/* Tamil Bridge — optional sync backend.
   Runs on Render's free web service; stores data in MongoDB Atlas M0 (free
   forever). The frontend works completely without this server, so every
   failure mode here degrades to "the app keeps working locally".

   Environment:
     MONGODB_URI   Atlas connection string. Without it the server falls back to
                   an in-memory store and says so loudly — fine for a smoke
                   test, useless for real data, because Render's free tier has
                   no persistent disk.
     JWT_SECRET    Signing secret. Generated at boot if unset, which invalidates
                   every existing token on restart — always set it in Render.
     ALLOWED_ORIGIN  Comma-separated list of allowed frontends (your Vercel URL).
                     Defaults to "*", which is fine for a public learning app.
     PORT          Supplied by Render.                                          */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ALLOWED = (process.env.ALLOWED_ORIGIN || '*').split(',').map(s => s.trim());
const TOKEN_TTL = '180d';

if (!process.env.JWT_SECRET) {
  console.warn('[warn] JWT_SECRET is not set — tokens will not survive a restart. Set it in Render.');
}
if (!MONGODB_URI) {
  console.warn('[warn] MONGODB_URI is not set — using an in-memory store. Data will be LOST on restart.');
  console.warn('[warn] Create a free MongoDB Atlas M0 cluster and set MONGODB_URI.');
}

/* --------------------------------------------------------------- storage */
let users = null;      /* mongo collection or Map-backed shim */
let blobs = null;

function memoryCollection() {
  const m = new Map();
  return {
    async findOne(q) {
      for (const doc of m.values()) {
        if (Object.keys(q).every(k => doc[k] === q[k])) return doc;
      }
      return null;
    },
    async insertOne(doc) { m.set(doc._id, doc); return { insertedId: doc._id }; },
    async updateOne(q, update, opts) {
      let doc = await this.findOne(q);
      if (!doc && opts && opts.upsert) { doc = { ...q }; m.set(doc._id || q._id, doc); }
      if (!doc) return { matchedCount: 0 };
      Object.assign(doc, update.$set || {});
      m.set(doc._id, doc);
      return { matchedCount: 1 };
    },
    async createIndex() { return null; }
  };
}

async function connect() {
  if (!MONGODB_URI) {
    users = memoryCollection();
    blobs = memoryCollection();
    return 'memory';
  }
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'tamilbridge');
  users = db.collection('users');
  blobs = db.collection('userdata');
  await users.createIndex({ email: 1 }, { unique: true, sparse: true });
  await users.createIndex({ phone: 1 }, { unique: true, sparse: true });
  return 'mongodb';
}

/* ------------------------------------------------------------- helpers */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
const isPhone = v => /^\+?[\d\s\-()]{8,16}$/.test(String(v).trim()) &&
                     String(v).replace(/\D/g, '').length >= 8;

function normalisePhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.length > 10) d = d.slice(-10);
  return d;
}

function publicUser(u) {
  return { id: u._id, name: u.name, email: u.email || '', phone: u.phone || '', createdAt: u.createdAt };
}

function sign(user) {
  return jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Not signed in.' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

/* Very small in-process rate limit — enough to stop casual abuse of a free
   instance without adding a dependency or any cost. */
const hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = (req.ip || 'x') + ':' + req.path;
    const now = Date.now();
    const rec = hits.get(key) || { n: 0, reset: now + windowMs };
    if (now > rec.reset) { rec.n = 0; rec.reset = now + windowMs; }
    rec.n++;
    hits.set(key, rec);
    if (hits.size > 5000) hits.clear();
    if (rec.n > max) return res.status(429).json({ error: 'Too many attempts. Try again shortly.' });
    next();
  };
}

/* ------------------------------------------------------------------ app */
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use(cors({
  origin: ALLOWED.includes('*') ? true : ALLOWED,
  credentials: false
}));

app.get('/', (_req, res) => {
  res.json({ name: 'Tamil Bridge API', ok: true, docs: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    store: MONGODB_URI ? 'mongodb' : 'memory (data is not persisted)',
    time: new Date().toISOString()
  });
});

app.post('/api/auth/signup', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { name, identifier, password } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required.' });
    if (!isEmail(identifier) && !isPhone(identifier)) {
      return res.status(400).json({ error: 'Enter a valid email address or phone number.' });
    }
    /* Same rules the browser enforces — a client check is a convenience, not
       a guarantee, so the server applies them too. */
    const pw = String(password || '');
    if (pw.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!/[a-zA-Z]/.test(pw)) return res.status(400).json({ error: 'Password must contain at least one letter.' });
    if (!/\d/.test(pw)) return res.status(400).json({ error: 'Password must contain at least one number.' });

    const email = isEmail(identifier) ? String(identifier).trim().toLowerCase() : null;
    const phone = isPhone(identifier) ? normalisePhone(identifier) : null;

    const existing = await users.findOne(email ? { email } : { phone });
    if (existing) {
      return res.status(409).json({
        error: email
          ? 'That email address is already registered. Please sign in instead.'
          : 'That phone number is already registered. Please sign in instead.'
      });
    }

    const user = {
      _id: crypto.randomUUID(),
      name: String(name).trim().slice(0, 80),
      email, phone,
      hash: await bcrypt.hash(String(password), 12),
      createdAt: Date.now()
    };
    try {
      await users.insertOne(user);
    } catch (dup) {
      /* The unique index is the real guard. Two simultaneous signups with the
         same address both pass the findOne check above, but only one inserts. */
      if (dup && dup.code === 11000) {
        return res.status(409).json({ error: 'That email or number is already registered. Please sign in instead.' });
      }
      throw dup;
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error('signup', e);
    res.status(500).json({ error: 'Could not create the account.' });
  }
});

app.post('/api/auth/signin', rateLimit(20, 15 * 60 * 1000), async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const email = isEmail(identifier) ? String(identifier).trim().toLowerCase() : null;
    const phone = !email ? normalisePhone(identifier) : null;
    const user = await users.findOne(email ? { email } : { phone });
    /* Same message either way, so the endpoint does not reveal who is registered. */
    const bad = () => res.status(401).json({ error: 'Incorrect email/number or password.' });
    if (!user) return bad();
    if (!(await bcrypt.compare(String(password || ''), user.hash))) return bad();
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error('signin', e);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await users.findOne({ _id: req.userId });
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user: publicUser(user) });
});

app.get('/api/data', auth, async (req, res) => {
  const doc = await blobs.findOne({ _id: req.userId });
  res.json({ data: doc ? doc.data : null });
});

app.put('/api/data', auth, async (req, res) => {
  const { history, srs, progress, stats } = req.body || {};
  const data = {
    history: Array.isArray(history) ? history.slice(0, 500) : [],
    srs: srs && typeof srs === 'object' ? srs : {},
    progress: progress && typeof progress === 'object' ? progress : {},
    stats: stats && typeof stats === 'object' ? stats : {}
  };
  await blobs.updateOne(
    { _id: req.userId },
    { $set: { _id: req.userId, data, updatedAt: Date.now() } },
    { upsert: true }
  );
  res.json({ ok: true, saved: data.history.length });
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

connect()
  .then(kind => {
    app.listen(PORT, () => {
      console.log(`Tamil Bridge API listening on ${PORT} (store: ${kind})`);
    });
  })
  .catch(err => {
    console.error('Could not reach the database:', err.message);
    console.error('Starting anyway with an in-memory store so the service stays up.');
    users = memoryCollection();
    blobs = memoryCollection();
    app.listen(PORT, () => console.log(`Tamil Bridge API listening on ${PORT} (store: memory/fallback)`));
  });
