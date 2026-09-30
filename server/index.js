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
     PORT          Supplied by Render.

     BREVO_API_KEY   An HTTP email API key. PREFER THIS ON RENDER: the free
                     tier blocks outbound SMTP, so Gmail cannot be reached at
                     all, however correct the password is. Brevo's free plan
                     sends 300 a day over plain HTTPS, which nobody blocks.
     RESEND_API_KEY  The same idea, if you would rather use Resend.
     MAIL_FROM       The address those APIs send from. Must be one you have
                     verified with the provider.

     SMTP_USER     The address that sends password-reset links.
     SMTP_PASS     Its password. For Gmail this is an *app password*, never
                   the account password.
     SMTP_HOST     Optional. Another provider's SMTP server. Unset means Gmail.
     SMTP_PORT     Optional, default 587. 465 is treated as implicit TLS.
     SMTP_FROM     Optional. What the email says it is from — a display name
                   is allowed: "Tamil Bridge <someone@gmail.com>". Most
                   providers require the address itself to be the one that
                   signed in. Defaults to SMTP_USER.
     APP_URL       Where the reset link should point. Defaults to the first
                   ALLOWED_ORIGIN, then to the request's own origin.

     Without SMTP_USER and SMTP_PASS the reset endpoint still answers, and
     says honestly that it cannot send mail yet, rather than pretending.    */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

/* What the server is really using, filled in by connect(). Reported by
   /api/health so the app can warn people before they trust it with data. */
let STORE = { kind: 'starting', durable: false, reason: '' };
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

/* ------------------------------------------------------------------ mail */

/* Nodemailer is loaded lazily so the server still boots without it
   installed, which keeps the app deployable while this is being set up. */
const SMTP_USER = (process.env.SMTP_USER || '').trim();
/* Google shows an app password as four blocks of four, and people paste it
   exactly as shown. Gmail wants it without the spaces, so they come out
   here rather than turning into an authentication failure nobody can
   explain. */
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const MAIL_READY = !!(SMTP_USER && SMTP_PASS);
let transport = null;

/* Any SMTP server, not just Gmail. Set SMTP_HOST to use another provider;
   leave it unset and Gmail is assumed, because it costs nothing and
   everybody already has an account. */
const SMTP_HOST = (process.env.SMTP_HOST || '').trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

/* An HTTP email API, which is the only kind that works on a host that
   blocks outbound SMTP \u2014 and Render's free tier does. */
const BREVO_KEY = (process.env.BREVO_API_KEY || '').trim();
const RESEND_KEY = (process.env.RESEND_API_KEY || '').trim();
const MAIL_FROM = (process.env.MAIL_FROM || process.env.SMTP_FROM || SMTP_USER || '').trim();
const HTTP_MAIL = !!(BREVO_KEY || RESEND_KEY);

/* What sending actually costs us if it is broken: a person locked out of
   their account for ever. So this is checked at boot and reported honestly,
   rather than inferred from whether the variables have values. */
let MAIL_STATE = { ready: false, how: 'none', reason: 'No email provider is configured.' };

function fromAddress() {
  return MAIL_FROM || SMTP_USER || '';
}

/* Brevo and Resend both take a small JSON POST over HTTPS. */
async function sendHttpMail(to, subject, text, html) {
  const from = fromAddress();
  if (BREVO_KEY) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: from, name: 'Tamil Bridge' },
        to: [{ email: to }], subject, textContent: text, htmlContent: html
      })
    });
    if (!r.ok) throw new Error('Brevo refused it: ' + r.status + ' ' + (await r.text()).slice(0, 180));
    return;
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + RESEND_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ from: 'Tamil Bridge <' + from + '>', to: [to], subject, text, html })
  });
  if (!r.ok) throw new Error('Resend refused it: ' + r.status + ' ' + (await r.text()).slice(0, 180));
}

function mailer() {
  if (transport) return transport;
  if (!MAIL_READY) return null;
  try {
    const nodemailer = require('nodemailer');
    transport = nodemailer.createTransport(SMTP_HOST
      ? { host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 20000 }
      : { service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS },
          connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 20000 });
    return transport;
  } catch (e) {
    console.warn('[warn] nodemailer is not installed \u2014 run npm install in /server');
    return null;
  }
}

/* One send, by whichever route is available. */
async function sendMail(to, subject, text, html) {
  if (HTTP_MAIL) return sendHttpMail(to, subject, text, html);
  const t = mailer();
  if (!t) throw new Error('No mailer.');
  return t.sendMail({ from: process.env.SMTP_FROM || SMTP_USER, to, subject, text, html });
}

/* Find out at boot whether mail can really be sent, instead of assuming it
   from the presence of a password. An SMTP host that is being blocked hangs
   rather than refusing, so this gives up quickly and says so. */
async function checkMail() {
  if (HTTP_MAIL) {
    MAIL_STATE = { ready: true, how: BREVO_KEY ? 'brevo' : 'resend', reason: '' };
    if (!fromAddress()) {
      MAIL_STATE = { ready: false, how: 'http', reason: 'MAIL_FROM is not set.' };
    }
    return;
  }
  if (!MAIL_READY) {
    MAIL_STATE = { ready: false, how: 'none',
      reason: 'No email provider is configured. Set BREVO_API_KEY (recommended on Render) '
            + 'or SMTP_USER and SMTP_PASS.' };
    return;
  }
  const t = mailer();
  if (!t) {
    MAIL_STATE = { ready: false, how: 'smtp', reason: 'nodemailer is not installed.' };
    return;
  }
  try {
    await Promise.race([
      t.verify(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timed out')), 15000))
    ]);
    MAIL_STATE = { ready: true, how: 'smtp', reason: '' };
  } catch (e) {
    MAIL_STATE = { ready: false, how: 'smtp',
      reason: 'Could not reach the SMTP server (' + e.message + '). Many hosts, including '
            + "Render's free tier, block outbound SMTP entirely. Use BREVO_API_KEY instead \u2014 "
            + 'it sends over HTTPS, which is never blocked.' };
    console.warn('[warn] SMTP is not usable here:', e.message);
  }
}

if (!MAIL_READY && !HTTP_MAIL) {
  console.warn('[warn] No email provider is set \u2014 password reset by email is off.');
}

function appUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  if (ALLOWED[0] && ALLOWED[0] !== '*') return ALLOWED[0].replace(/\/+$/, '');
  return (req.headers.origin || '').replace(/\/+$/, '');
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
    /* Deleting has to work here too. Without it, a person on a server that
       has fallen back to memory asks for their account to be erased and is
       told it could not be done — which is at least honest, but useless. */
    async deleteOne(q) {
      const doc = await this.findOne(q);
      if (!doc) return { deletedCount: 0 };
      m.delete(doc._id);
      return { deletedCount: 1 };
    },
    async createIndex() { return null; }
  };
}

async function connect() {
  if (!MONGODB_URI) {
    users = memoryCollection();
    blobs = memoryCollection();
    STORE = { kind: 'memory', durable: false,
              reason: 'MONGODB_URI is not set on this service.' };
    return 'memory';
  }
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'tamilbridge');
  users = db.collection('users');
  blobs = db.collection('userdata');
  await repair(users);
  /* Only documents where the address is really a string are indexed. The
     old index was `sparse`, which skips a field that is ABSENT \u2014 null is
     not absent, it is a value, and it is indexed. An email signup wrote
     `phone: null`, so the first such account took the one null slot on the
     unique phone index and every account after it was refused. Nobody could
     create an account, and the refusal read as "already registered".

     A partial filter says what was meant: index the addresses, ignore
     everything else. */
  await users.createIndex(
    { email: 1 },
    { unique: true, name: 'email_unique', partialFilterExpression: { email: { $type: 'string' } } }
  );
  STORE = { kind: 'mongodb', durable: true, reason: '' };
  return 'mongodb';
}

/* Put right what the old indexes did, once, on the way up. Safe to run
   again: every step is already-done-is-fine. */
async function repair(users) {
  const gone = [];
  for (const name of ['phone_1', 'email_1']) {
    try { await users.dropIndex(name); gone.push(name); }
    catch (e) { /* not there: nothing to drop */ }
  }
  /* Accounts are email only now. A phone field that is null blocks the next
     account; a phone field with a number in it is an account that can no
     longer be signed into by number, so the number is of no further use. */
  const cleared = await users.updateMany(
    { phone: { $exists: true } }, { $unset: { phone: '' } }
  );
  /* Same trap in the other direction: a phone-made account stored
     `email: null`, which would block the next one on the email index. */
  const blanked = await users.updateMany(
    { email: null }, { $unset: { email: '' } }
  );
  if (gone.length || cleared.modifiedCount || blanked.modifiedCount) {
    console.log('repair: dropped [' + gone.join(', ') + '], cleared '
      + cleared.modifiedCount + ' phone field(s), '
      + blanked.modifiedCount + ' null email(s)');
  }
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
    store: STORE.durable ? 'mongodb' : 'memory (data is not persisted)',
    durable: STORE.durable,
    reason: STORE.reason,
    /* The app asks for these so it can tell people the truth about what
       will and will not work, instead of failing mysteriously. */
    /* This says what was tried, not what was configured. It used to report
       mail:true whenever two variables had values, which was true of a
       server that could not send a single email. */
    mail: MAIL_STATE.ready,
    mailVia: MAIL_STATE.how,
    mailReason: MAIL_STATE.reason,
    canReset: MAIL_STATE.ready && STORE.durable,
    time: new Date().toISOString()
  });
});

app.post('/api/auth/signup', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { name, identifier, password } = req.body || {};
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required.' });
    /* New accounts need an address. A number cannot receive a reset link,
       and an account nobody can get back into is worse than no account at
       all. Signing in still accepts a number, so the ones already made that
       way still work \u2014 their owners can add an address in Settings. */
    if (!isEmail(identifier)) {
      return res.status(400).json({
        error: isPhone(identifier)
          ? 'Please use an email address. A password can only be reset by email, so an '
            + 'account made with a number could never be recovered.'
          : 'Enter a valid email address.'
      });
    }
    /* Same rules the browser enforces — a client check is a convenience, not
       a guarantee, so the server applies them too. */
    const pw = String(password || '');
    if (pw.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!/[a-zA-Z]/.test(pw)) return res.status(400).json({ error: 'Password must contain at least one letter.' });
    if (!/\d/.test(pw)) return res.status(400).json({ error: 'Password must contain at least one number.' });

    const email = String(identifier).trim().toLowerCase();

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: 'That email address is already registered. Please sign in instead.'
      });
    }

    /* No phone field. Writing one as null is what broke every signup after
       the first \u2014 see repair() above. A field nobody uses is not stored. */
    const user = {
      _id: crypto.randomUUID(),
      name: String(name).trim().slice(0, 80),
      email,
      hash: await bcrypt.hash(String(password), 12),
      createdAt: Date.now()
    };
    try {
      await users.insertOne(user);
    } catch (dup) {
      /* The unique index is the real guard. Two simultaneous signups with the
         same address both pass the findOne check above, but only one inserts. */
      if (dup && dup.code === 11000) {
        return res.status(409).json({
          error: 'That email address is already registered. Please sign in instead.'
        });
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
    /* Accounts are an email address and nothing else. A number cannot be
       sent a reset link, so an account made with one could never be
       recovered \u2014 and telling somebody plainly that a number will not work
       is kinder than a generic refusal they cannot act on. */
    if (isPhone(identifier) && !isEmail(identifier)) {
      return res.status(400).json({
        error: 'Accounts use an email address, not a phone number. '
             + 'Sign in with your email address.'
      });
    }
    const email = String(identifier || '').trim().toLowerCase();
    const user = await users.findOne({ email });
    /* Same message either way, so the endpoint does not reveal who is registered. */
    const bad = () => res.status(401).json({ error: 'Incorrect email address or password.' });
    if (!user) return bad();
    if (!(await bcrypt.compare(String(password || ''), user.hash))) return bad();
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error('signin', e);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

/* ---------------------------------------------------------------- reset */

/* The reply never says whether the address is registered. Telling a
   stranger which addresses have accounts is a gift to whoever is guessing.
   It does say whether the server is able to send mail at all, because that
   is about the server and not about the person. */
app.post('/api/auth/forgot', rateLimit(6, 15 * 60 * 1000), async (req, res) => {
  try {
    const { identifier } = req.body || {};
    const email = isEmail(identifier) ? String(identifier).trim().toLowerCase() : null;

    if (!STORE.durable) {
      return res.status(503).json({
        error: 'This server cannot keep accounts yet, so there is nothing to reset. '
             + 'MONGODB_URI has not been set on it.',
        canReset: false, reason: 'no-database'
      });
    }
    if (!MAIL_STATE.ready) {
      return res.status(503).json({
        error: 'This server cannot send email yet, so a reset link cannot be sent.',
        detail: MAIL_STATE.reason, canReset: false, reason: 'no-mail'
      });
    }
    if (!email) {
      return res.status(400).json({
        error: 'A reset link can only be sent to an email address. '
             + 'An account made with a phone number cannot be reset this way.'
      });
    }

    const user = await users.findOne({ email });
    if (user) {
      /* Only the hash is stored, so a stolen database cannot be used to
         reset anybody's password. */
      const raw = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      await users.updateOne({ _id: user._id }, {
        $set: { resetHash: hash, resetAt: Date.now() + 60 * 60 * 1000 }
      });

      const link = appUrl(req) + '/?reset=' + raw;
      await sendMail(
        email,
        'Reset your Tamil Bridge password',
        'Somebody asked to reset the password for this Tamil Bridge account.\n\n'
          + 'Open this link within one hour to choose a new one:\n' + link
          + '\n\nIf it was not you, ignore this email. Nothing has changed.\n',
        '<p>Somebody asked to reset the password for this Tamil Bridge account.</p>'
          + '<p><a href="' + link + '">Choose a new password</a></p>'
          + '<p>The link works for one hour. If it was not you, ignore this email '
          + '\u2014 nothing has changed.</p>'
      );
    }

    /* Same answer whether or not the account exists. */
    res.json({ ok: true, sent: true });
  } catch (e) {
    console.error('forgot', e);
    res.status(500).json({ error: 'Could not send the reset link. Please try again later.' });
  }
});

app.post('/api/auth/reset', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { token, password } = req.body || {};
    const pw = String(password || '');
    if (pw.length < 8 || !/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) {
      return res.status(400).json({
        error: 'The new password needs at least 8 characters, with a letter and a number.'
      });
    }
    const hash = crypto.createHash('sha256').update(String(token || '')).digest('hex');
    const user = await users.findOne({ resetHash: hash });
    if (!user || !user.resetAt || user.resetAt < Date.now()) {
      return res.status(400).json({
        error: 'This reset link has expired or has already been used. Please ask for a new one.'
      });
    }
    await users.updateOne({ _id: user._id }, {
      $set: { hash: await bcrypt.hash(pw, 10), resetHash: null, resetAt: null }
    });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    console.error('reset', e);
    res.status(500).json({ error: 'Could not reset the password.' });
  }
});

/* Add or change the email on an account. This is what makes a phone-only
   account recoverable: without an address there is nowhere to send a reset
   link, and forgetting the password means losing everything. The password
   is required, because an email address is how an account is taken back. */
app.post('/api/account/email', auth, rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.userId });
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    const { password, email } = req.body || {};
    if (!(await bcrypt.compare(String(password || ''), user.hash))) {
      return res.status(401).json({ error: 'That password is not right, so nothing was changed.' });
    }
    const next = String(email || '').trim().toLowerCase();
    if (!isEmail(next)) {
      return res.status(400).json({ error: 'That does not look like an email address.' });
    }
    const taken = await users.findOne({ email: next });
    if (taken && taken._id !== user._id) {
      return res.status(409).json({ error: 'Another account already uses that email address.' });
    }
    await users.updateOne({ _id: user._id }, { $set: { email: next } });
    const fresh = await users.findOne({ _id: user._id });
    res.json({ ok: true, user: publicUser(fresh) });
  } catch (e) {
    console.error('set email', e);
    res.status(500).json({ error: 'Could not save that email address.' });
  }
});

/* Deleting is the one thing that cannot be undone, so it asks for the
   password again. A token alone is not enough: a phone left unlocked on a
   table should not be able to destroy somebody's work. */
app.post('/api/account/delete', auth, rateLimit(6, 15 * 60 * 1000), async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.userId });
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    const { password } = req.body || {};
    if (!(await bcrypt.compare(String(password || ''), user.hash))) {
      return res.status(401).json({ error: 'That password is not right, so nothing was deleted.' });
    }

    /* The learning data goes first. If the second call fails, a person is
       left with an account and no data, which they can delete again \u2014
       rather than data with no account, which nobody could ever reach. */
    await blobs.deleteOne({ _id: req.userId });
    await users.deleteOne({ _id: req.userId });
    res.json({ ok: true, deleted: true });
  } catch (e) {
    console.error('delete account', e);
    res.status(500).json({ error: 'Could not delete the account. Nothing was changed.' });
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

/* Find out whether mail really works, without holding up the boot. */
checkMail().catch(() => {});

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
    STORE = { kind: 'memory', durable: false,
              reason: 'MONGODB_URI is set but the database refused the connection: '
                      + err.message };
    app.listen(PORT, () => console.log(`Tamil Bridge API listening on ${PORT} (store: memory/fallback)`));
  });
