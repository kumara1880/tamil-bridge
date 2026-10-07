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
/* The same thousand the browser keeps, so a sync never returns less than it
   was given. */
const MAX_HISTORY = 1000;
/* One cost factor, used everywhere a password is hashed. Signup used 12 and
   a password reset used 10, so resetting quietly weakened the hash. */
const BCRYPT_COST = 12;

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
    /* The raw error stays in the log. It can name hosts and accounts, and
       this reason is shown to anybody who asks /api/health. */
    MAIL_STATE = { ready: false, how: 'smtp',
      reason: 'Could not reach the SMTP server. Many hosts, including '
            + "Render's free tier, block outbound SMTP entirely. Use BREVO_API_KEY instead \u2014 "
            + 'it sends over HTTPS, which is never blocked.' };
    console.warn('[warn] SMTP is not usable here:', e.message);
  }
}

if (!MAIL_READY && !HTTP_MAIL) {
  console.warn('[warn] No email provider is set \u2014 password reset by email is off.');
}

/* Where a reset link points.

   This used to fall through to the request's own Origin header, which the
   sender chooses. With ALLOWED_ORIGIN left at its default of "*" — which is
   the documented default — anybody could POST to /api/auth/forgot with
   somebody else's address and an Origin of their own, and the victim would
   receive a genuine Tamil Bridge email carrying a working token pointed at
   the attacker's site. Clicking it handed over the account.

   The destination is now configuration only. If neither APP_URL nor a
   specific ALLOWED_ORIGIN is set there is nowhere safe to send people, so
   nothing is sent and the endpoint says so. A reset that does not arrive is
   a bad day; a reset that arrives pointing somewhere else is an account
   gone. */
function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  if (ALLOWED[0] && ALLOWED[0] !== '*') return ALLOWED[0].replace(/\/+$/, '');
  return '';
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

/* Every token carries the account's token version, `tv`. Resetting the
   password moves the version on, so every session signed in before the
   reset stops working — including one on a device somebody else is holding,
   which is usually why the password was reset. Accounts made before this
   have no version, read as 0, and their existing sessions carry on. */
function sign(user) {
  return jwt.sign({ sub: user._id, tv: user.tv || 0 }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/* A signature alone only says the token was once valid. The account is
   looked up as well: a token for an account that has been deleted used to
   pass, and its next sync recreated the deleted learning data under an
   account that no longer existed. */
async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Not signed in.' });
  let claims;
  try {
    claims = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
  try {
    const user = await users.findOne({ _id: claims.sub });
    if (!user || (claims.tv || 0) !== (user.tv || 0)) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    req.userId = user._id;
    req.user = user;
  } catch (e) {
    console.error('auth', e);
    return res.status(500).json({ error: 'Could not check your sign-in. Please try again shortly.' });
  }
  next();
}

/* Very small in-process rate limit — enough to stop casual abuse of a free
   instance without adding a dependency or any cost. */
const hits = new Map();
/* Keyed by a name given to each route, not by req.path. Express matches
   '/api/auth/signin', '/api/auth/signin/' and '/API/auth/signin' to the same
   route, but each is a different req.path - so every spelling got a fresh
   allowance and the limit could be walked around. */
function rateLimit(max, windowMs, name) {
  return (req, res, next) => {
    const key = (req.ip || 'x') + ':' + String(name || (req.route && req.route.path) || req.path).toLowerCase();
    const now = Date.now();
    const rec = hits.get(key) || { n: 0, reset: now + windowMs };
    if (now > rec.reset) { rec.n = 0; rec.reset = now + windowMs; }
    rec.n++;
    hits.set(key, rec);
    /* Clearing the whole map when it filled up reset everybody's counter at
       once, so enough traffic — from anywhere — handed an attacker a fresh
       allowance. Only windows that have already expired are dropped, and a
       live counter survives. */
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
      /* Still full of live windows: drop the oldest, never the current one. */
      if (hits.size > 5000) {
        const oldest = [...hits.entries()].sort((a, b) => a[1].reset - b[1].reset);
        for (let i = 0; i < oldest.length / 2; i++) {
          if (oldest[i][0] !== key) hits.delete(oldest[i][0]);
        }
      }
    }
    if (rec.n > max) return res.status(429).json({ error: 'Too many attempts. Try again shortly.' });
    next();
  };
}

/* ------------------------------------------------------------------ app */
const app = express();
app.set('trust proxy', 1);
/* Nothing is gained by telling the world which framework this is. */
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
/* Body that is not JSON got Express's own HTML error page, from an API
   where every other answer is JSON — so a client doing the obvious thing
   and parsing the reply threw on the error instead of reading it. */
app.use((err, _req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'That request was not valid JSON.' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That request was too large.' });
  }
  return next(err);
});
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
    /* A reset also needs somewhere safe to point the link. Saying it can be
       done when it cannot sends people to a dead end. */
    appUrl: !!appUrl(),
    tutor: TUTOR_STATE.ready,
    /* which model, and what is wrong if anything: a category, never the
       key or Google's own message */
    tutorModel: TUTOR_STATE.model,
    tutorProblem: TUTOR_STATE.problem,
    /* how long the last answer took, so slowness can be seen without logs */
    tutorMs: TUTOR_STATE.ms || 0,
    /* each top model's start-up answer time, or why it had none */
    tutorWarm: TUTOR_STATE.warm || null,
    canReset: MAIL_STATE.ready && STORE.durable && !!appUrl(),
    time: new Date().toISOString()
  });
});

app.post('/api/auth/signup', rateLimit(10, 15 * 60 * 1000, 'signup'), async (req, res) => {
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
      hash: await bcrypt.hash(String(password), BCRYPT_COST),
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

app.post('/api/auth/signin', rateLimit(20, 15 * 60 * 1000, 'signin'), async (req, res) => {
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
app.post('/api/auth/forgot', rateLimit(6, 15 * 60 * 1000, 'forgot'), async (req, res) => {
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
    /* Checked before anything is written or sent: without a configured
       destination the link has nowhere safe to point. */
    const base = appUrl();
    if (!base) {
      return res.status(503).json({
        error: 'This server has not been told where the app lives, so a reset link '
             + 'cannot be sent safely.',
        detail: 'Set APP_URL (or a specific ALLOWED_ORIGIN) on the service.',
        canReset: false, reason: 'no-app-url'
      });
    }

    /* Same answer whether or not the account exists \u2014 and at the same
       moment. The reply used to wait for the token to be written and the
       email to go out, which only happens for a real account: a registered
       address took a second or two longer, and a failed send answered 500,
       so anyone with a stopwatch could tell who had an account. The answer
       goes first; the work happens after. */
    res.json({ ok: true, sent: true });
    sendReset(email, base).catch(e => console.error('forgot', e));
  } catch (e) {
    console.error('forgot', e);
    res.status(500).json({ error: 'Could not send the reset link. Please try again later.' });
  }
});

async function sendReset(email, base) {
  const user = await users.findOne({ email });
  if (!user) return;
  /* Only the hash is stored, so a stolen database cannot be used to
     reset anybody's password. */
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  await users.updateOne({ _id: user._id }, {
    $set: { resetHash: hash, resetAt: Date.now() + 60 * 60 * 1000 }
  });

  const link = base + '/?reset=' + raw;
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

app.post('/api/auth/reset', rateLimit(10, 15 * 60 * 1000, 'reset'), async (req, res) => {
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
    /* The version moves on, so every older session is signed out. The
       person resetting gets a fresh token at the new version. */
    const tv = (user.tv || 0) + 1;
    /* Matched on the reset hash too, so the link works once: two requests
       racing with the same link cannot both set a password. */
    const done = await users.updateOne({ _id: user._id, resetHash: hash }, {
      $set: { hash: await bcrypt.hash(pw, BCRYPT_COST), resetHash: null, resetAt: null, tv }
    });
    if (!done || !done.matchedCount) {
      return res.status(400).json({
        error: 'This reset link has expired or has already been used. Please ask for a new one.'
      });
    }
    res.json({ token: sign({ ...user, tv }), user: publicUser(user) });
  } catch (e) {
    console.error('reset', e);
    res.status(500).json({ error: 'Could not reset the password.' });
  }
});

/* Add or change the email on an account. This is what makes a phone-only
   account recoverable: without an address there is nowhere to send a reset
   link, and forgetting the password means losing everything. The password
   is required, because an email address is how an account is taken back. */
app.post('/api/account/email', auth, rateLimit(10, 15 * 60 * 1000, 'email'), async (req, res) => {
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
app.post('/api/account/delete', auth, rateLimit(6, 15 * 60 * 1000, 'delete'), async (req, res) => {
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

/* Express 4 does not catch a rejected promise from an async handler: it
   becomes an unhandled rejection and the request simply never answers, so a
   database that has gone away turns every one of these into a browser
   waiting until it times out. Every async handler says something. */
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.userId });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (e) {
    console.error('me', e);
    res.status(500).json({ error: 'Could not read the account.' });
  }
});

app.get('/api/data', auth, async (req, res) => {
  try {
    const doc = await blobs.findOne({ _id: req.userId });
    res.json({ data: doc ? doc.data : null });
  } catch (e) {
    console.error('get data', e);
    res.status(500).json({ error: 'Could not read your data. Nothing was changed.' });
  }
});

app.put('/api/data', auth, async (req, res) => {
  try {
    const { history, srs, progress, stats } = req.body || {};
    const data = {
      /* The browser keeps a thousand, so keeping five hundred here meant a
         sync quietly halved the history of anybody who had more than that —
         and restoring on a new device handed it back short. */
      history: Array.isArray(history) ? history.slice(0, MAX_HISTORY) : [],
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
  } catch (e) {
    console.error('put data', e);
    res.status(500).json({ error: 'Could not save your data. Try again shortly.' });
  }
});

/* ---------------------------------------------------------------- tutor

   The conversation tutor's thinking half. The browser's own tutor follows
   lessons and recognises requests, but it cannot understand an arbitrary
   sentence and answer it the way a person would. A language model can.

   Off unless GEMINI_API_KEY is set on the service. Google's free tier needs
   no card and costs nothing within its daily quota, which keeps the site
   free for everyone using it. The key lives in the service's environment —
   never in the code, never in the repository, never in the browser.

   When it is off, or the quota is spent, or Google does not answer, the
   endpoint says so and the browser falls back to its own tutor. Nothing
   breaks. */
const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
/* A model named here is used if this key can use it. Otherwise one is
   chosen from what Google says the key can use — a fixed name stops working
   the day Google retires it, and the tutor went quiet for exactly that. */
const GEMINI_MODEL_ENV = (process.env.GEMINI_MODEL || '').trim();
/* Used only when Google cannot be asked which models there are. It is the
   one Google named when it retired gemini-2.5-flash for new keys. */
const GEMINI_FALLBACK = 'gemini-3.8-flash';
/* `problem` is a short category, safe to show on /api/health — never the
   key and never Google's own message, which goes to the log. */
let TUTOR_STATE = { ready: !!GEMINI_KEY, model: GEMINI_MODEL_ENV || GEMINI_FALLBACK,
                    models: [GEMINI_MODEL_ENV || GEMINI_FALLBACK], problem: GEMINI_KEY ? 'starting' : 'no-key' };

function tutorProblem(status, body) {
  const b = String(body || '');
  if (status === 429) return 'quota';
  if (/API_KEY_INVALID|API key not valid|API key expired/i.test(b)) return 'key-invalid';
  if (/SERVICE_DISABLED|has not been used in project|is disabled/i.test(b)) return 'api-disabled';
  if (/location is not supported|User location/i.test(b)) return 'region';
  if (status === 403) return 'key-not-allowed';
  if (status === 404) return 'model-missing';
  if (status === 400) return 'bad-request';
  if (status >= 500) return 'google-down';
  return 'http-' + status;
}
/* Problems only the operator can fix: the tutor stays off until they do
   (which restarts the service) instead of failing on every message. While
   listing models a 403 is about the key; while asking one model it may be
   about that model alone, so in a race only these three end everything. */
const TUTOR_FATAL = ['key-invalid', 'api-disabled', 'region', 'key-not-allowed'];
const KEY_FATAL = ['key-invalid', 'api-disabled', 'region'];

/* Higher is better. A current Flash model: quick, and the most generous
   free quota. Preview, experimental and special-purpose models are last. */
function rankModel(name) {
  const n = String(name || '').replace(/^models\//, '');
  if (!/^gemini-/.test(n)) return -1;
  if (/image|tts|audio|live|embedding|vision|robotics|computer-use|native|thinking/i.test(n)) return -1;
  const v = parseFloat((n.match(/^gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
  let s = v * 100;
  if (/-flash-lite/.test(n)) s += 20;
  else if (/-flash/.test(n)) s += 50;
  else if (/-pro/.test(n)) s += 5;
  else return -1;
  if (/preview|exp/.test(n)) s -= 60;
  return s;
}

/* Models Google still lists but that refuse this key — retired for new
   keys (404) or not allowed (403). Listing again would bring them straight
   back, so they are remembered and left out for the life of the process. */
const DEAD_MODELS = new Set();

async function chooseModel() {
  const names = [];
  let page = '';
  for (let i = 0; i < 5; i++) {
    /* bounded: a stalled listing must not hang whatever is waiting on it */
    const r = await fetch(GEMINI_BASE + '/models?pageSize=200' + (page ? '&pageToken=' + encodeURIComponent(page) : ''),
      { headers: { 'x-goog-api-key': GEMINI_KEY }, signal: AbortSignal.timeout(10000) });
    const body = await r.text();
    if (!r.ok) { const e = new Error('list models'); e.status = r.status; e.body = body; throw e; }
    const j = JSON.parse(body);
    (j.models || []).forEach(m => {
      const n = String(m.name).replace(/^models\//, '');
      if ((m.supportedGenerationMethods || []).includes('generateContent') && !DEAD_MODELS.has(n)) names.push(n);
    });
    if (!j.nextPageToken) break;
    page = j.nextPageToken;
  }
  /* best first, and a few behind it: a brand-new model on the free tier is
     often overloaded, and the next one along is better than no answer */
  const ranked = names.map(n => [n, rankModel(n)]).filter(x => x[1] >= 0)
    .sort((a, b) => b[1] - a[1]).map(x => x[0]);
  if (GEMINI_MODEL_ENV && names.includes(GEMINI_MODEL_ENV)) {
    return [GEMINI_MODEL_ENV].concat(ranked.filter(n => n !== GEMINI_MODEL_ENV)).slice(0, 4);
  }
  return ranked.slice(0, 4);
}

/* Settles once the models have been listed at start. */
let TUTOR_LISTED = null;

/* Listing again, in the background — never inside a learner's request,
   which would keep them waiting on it. One at a time. */
let relistTimer = null, relisting = null, relistDelay = 60000;
function relist(delay) {
  if (relistTimer || relisting || !GEMINI_KEY) return;
  relistTimer = setTimeout(() => {
    relistTimer = null;
    relisting = setupTutor()
      .then(() => (TUTOR_STATE.ready && !TUTOR_STATE.problem ? warmTutor() : null))
      .catch(() => {})
      .then(() => { relisting = null; });
  }, delay || 0);
  if (relistTimer.unref) relistTimer.unref();
}

/* Wake the models up before a learner needs them. Measured live, the first
   message after the server started stalled until its time limit while the
   very next one was answered in four seconds. So at start each of the top
   models is sent something tiny — while the learner is still opening the
   page — and they are put in the order they answered: quickest first, any
   that stalled or failed last. Three small requests per start, well inside
   the free quota. The timings are on /api/health as tutorWarm. */
async function warmTutor() {
  if (!TUTOR_STATE.ready || !GEMINI_KEY) return;
  const list = TUTOR_STATE.models.slice(0, 3);
  const warm = {};
  const ping = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Reply with the single word OK.' }] }],
    generationConfig: { maxOutputTokens: 256 }
  });
  /* Acted on as each answer arrives, not when the slowest is done. Live,
     one model answered in 4 s and another took its whole 45 s to fail; a
     learner's first message in between still went to the failing one. */
  let firstOk = '';
  await Promise.all(list.map(async m => {
    const t0 = Date.now();
    const r = await callGemini(m, ping, 45000);
    warm[m] = r.ok ? Date.now() - t0 : (r.timeout ? 'timeout' : String(r.status || 'failed'));
    TUTOR_STATE.warm = Object.assign({}, warm);
    if (r.ok && !firstOk) {
      firstOk = m;
      TUTOR_STATE.models = [m].concat(TUTOR_STATE.models.filter(x => x !== m));
    } else if (!r.ok && TUTOR_STATE.models.length > 1) {
      TUTOR_STATE.models = TUTOR_STATE.models.filter(x => x !== m).concat([m]);
    }
    TUTOR_STATE.model = TUTOR_STATE.models[0];
  }));
  TUTOR_STATE.warm = warm;
  const rank = m => (typeof warm[m] === 'number' ? warm[m] : Infinity);
  const order = list.slice().sort((a, b) => rank(a) - rank(b));
  TUTOR_STATE.models = order.concat(TUTOR_STATE.models.filter(m => order.indexOf(m) < 0));
  TUTOR_STATE.model = TUTOR_STATE.models[0];
  console.log('[tutor] warm-up ' + JSON.stringify(warm) + ' -> ' + TUTOR_STATE.models.join(', '));
}

async function setupTutor() {
  if (!GEMINI_KEY) return;
  try {
    const list = await chooseModel();
    if (!list.length) {
      TUTOR_STATE = { ready: false, model: '', models: [], problem: 'no-model' };
      console.warn('[tutor] this key can use no suitable Gemini model');
      return;
    }
    TUTOR_STATE = { ready: true, model: list[0], models: list, problem: '' };
    relistDelay = 60000;
    console.log('[tutor] using ' + list.join(', then '));
  } catch (e) {
    const p = e.status ? tutorProblem(e.status, e.body) : 'network';
    console.warn('[tutor] could not list models (' + p + '): ' + String(e.body || e.message).slice(0, 300));
    /* A key problem turns the tutor off until it is fixed. A passing one
       keeps whatever list there was — collapsing to a single model meant
       no hedging and no other model's quota for the rest of the process —
       and the listing is tried again, later each time. */
    const keep = (TUTOR_STATE.models || []).filter(x => !DEAD_MODELS.has(x));
    const models = keep.length ? keep : [GEMINI_MODEL_ENV || GEMINI_FALLBACK];
    const fatal = TUTOR_FATAL.indexOf(p) >= 0;
    TUTOR_STATE = { ready: !fatal, model: models[0], models, problem: p };
    if (!fatal) { relist(relistDelay); relistDelay = Math.min(relistDelay * 2, 15 * 60 * 1000); }
  }
}

const TUTOR_LANG = { en: 'English', hi: 'Hindi' };
const TUTOR_LEVEL = ['', 'A1 beginner', 'A2 elementary', 'B1 intermediate', 'B2 upper intermediate', 'C1 advanced', 'C2 near-native'];

/* How a teacher talks to each level, from a first day to near-native. */
function levelWay(level, L) {
  return [
    '',
    `Level A1, a complete beginner: explain everything in simple Tamil. Teach ONE short, very common ${L}`
      + ' phrase at a time (3-6 words), present tense, everyday words. Praise every attempt.',
    `Level A2: explain mostly in Tamil. Short everyday ${L} sentences; bring in past and future gently,`
      + ' and reuse what they already know.',
    `Level B1: Tamil for new grammar, ${L} for the rest. Everyday situations — travel, work, shopping,`
      + ' feelings. Ask them to say more than one sentence.',
    `Level B2: talk mostly in ${L}; Tamil only for a tricky point. Bring in phrasal verbs, linking words`
      + ' and the small natural words native speakers use.',
    `Level C1: talk in ${L}. Idioms, nuance, formal and informal register, pronunciation and stress tips.`
      + ' Tamil only if they ask.',
    `Level C2: talk like a native friend in ${L}. Point out anything that is correct but not what a native`
      + ' would say, and offer the natural version. Idioms, culture, humour. Tamil only if they ask.'
  ][level] || '';
}

function tutorSystem(learn, level, voice) {
  const L = TUTOR_LANG[learn] || 'English';
  return [
    `You are a warm, patient, native-speaker ${L} teacher. Your student is a Tamil speaker learning ${L}`
      + ` at about ${TUTOR_LEVEL[level] || 'beginner'} level. You teach the way a good human teacher talks:`
      + ` you understand what the student actually means, answer that, and keep them speaking.`,
    'The student may write in Tamil, English or Hindi, and may ask anything: to be taught, for words,'
      + ' how to say something, what something means, a grammar question, or simply chat.',
    levelWay(level, L),
    '- Build on this conversation: reuse what the student has already learnt in it, and when they do'
      + ' well, make the next step a little harder — the aim is to take them all the way to speaking like a native.',
    voice
      ? '- This is a SPOKEN conversation, read aloud by a voice. Keep reply_ta and reply_target to one or two'
        + ' short sentences that sound natural when heard. No lists, symbols, brackets or quotation marks.'
      : '',
    learn === 'hi'
      ? '- Teach everyday spoken Hindi (Hindustani), not heavily Sanskritised Hindi, and use the respectful आप.'
      : '',
    'How to answer:',
    '- Answer what was asked. If they ask you to teach, say yes warmly and start teaching at once.',
    `- Explain in natural, correct, everyday Tamil (not word-for-word translation), and give ${L} examples.`,
    `- Keep each ${L} line short and natural — the way a native speaker really says it.`,
    '- If the student wrote a sentence in the language they are learning and it has a mistake, correct it'
      + ' gently and say why in one short Tamil sentence. Never "correct" something that is right.',
    '- If they ask to talk, chat or role-play (a shop, a doctor, an interview, a phone call…), do it like a'
      + ' real person in that situation: one short natural line at a time, wait for their reply, then help'
      + ` them with it and carry the scene on. If they answer in Tamil, show them how to say it in ${L}.`,
    '- If they ask to be taught, teach a little at a time: one useful sentence or pattern, its meaning,'
      + ' and ask them to say or use it — never just a translation of their request.',
    '- End with one short question or prompt that keeps them talking, unless they said goodbye.',
    learn === 'hi' ? '- Write Hindi in Devanagari only.' : '- Write English in plain, modern English.',
    '- Tamil must be correct standard written Tamil in Tamil script (வாங்கினேன், not the spoken வாங்குனேன்).'
      + ' If unsure of a Tamil word, use a simpler one.',
    `- "next" is always a line for the STUDENT to say — their natural reply in ${L}, or the sentence to`
      + ' practise. Never your own question, never an instruction like "Can you try saying…". In a role-play,'
      + ' it is what the student\'s character would answer.',
    'Reply with JSON only, matching exactly:',
    '{"reply_ta": string — what you say to the student, in Tamil (1-3 sentences),'
      + ` "reply_target": string — the same message in ${L}, short,`
      + (learn === 'hi' ? ' "reply_en": string — the same message in English,' : '')
      + ` "teach": [{"target": string (${L}), "ta": string (Tamil meaning), "en": string (English meaning)}] — 0 to 4 things to practise,`
      + ' "correction": {"original": string, "corrected": string, "why_ta": string} or null,'
      + ` "next": {"target": string — a short line the student says next, in ${L}, "ta": string — its Tamil meaning,`
      + ' "en": string — its English meaning} or null}'
  ].filter(Boolean).join('\n');
}

function clip(s, n) { return String(s == null ? '' : s).slice(0, n); }

/* Pull the first JSON object out of a reply, tolerating a stray code fence. */
function parseTutor(text) {
  const t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { return null; }
}

/* Keep only what the browser will render, of the types it expects. */
function shapeTutor(j) {
  if (!j || typeof j !== 'object') return null;
  const item = x => x && typeof x === 'object'
    ? { target: clip(x.target, 300), ta: clip(x.ta, 300), en: clip(x.en, 300) } : null;
  const out = {
    reply_ta: clip(j.reply_ta, 1200),
    reply_target: clip(j.reply_target, 800),
    reply_en: clip(j.reply_en, 800),
    teach: Array.isArray(j.teach) ? j.teach.slice(0, 4).map(item).filter(x => x && x.target) : [],
    correction: j.correction && typeof j.correction === 'object' && j.correction.corrected
      ? { original: clip(j.correction.original, 400), corrected: clip(j.correction.corrected, 400), why_ta: clip(j.correction.why_ta, 600) }
      : null,
    next: j.next && typeof j.next === 'object' && j.next.target
      ? { target: clip(j.next.target, 300), ta: clip(j.next.ta, 300), en: clip(j.next.en, 300) } : null
  };
  return out.reply_ta || out.reply_target || out.teach.length ? out : null;
}

async function askGemini(learn, level, history, retried, voice) {
  /* Turns must start with the student and alternate; two in a row from the
     same side are joined into one. */
  const contents = [];
  history.forEach(m => {
    const role = m.role === 'tutor' ? 'model' : 'user';
    if (!contents.length && role !== 'user') return;
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += '\n' + clip(m.text, 600);
    else contents.push({ role, parts: [{ text: clip(m.text, 600) }] });
  });
  function payload(model, light) {
    const gen = { responseMimeType: 'application/json', maxOutputTokens: 8192 };
    /* Gemini 3 and later think before answering, and left at its default a
       reply took over half a minute. A tutor's turn needs little thought;
       asked for less, it answers in a few seconds. Older models do not know
       the setting, so it goes only to models that do. */
    if (light && /^gemini-([3-9]|\d\d)/.test(model)) gen.thinkingConfig = { thinkingLevel: 'low' };
    return JSON.stringify({
      systemInstruction: { parts: [{ text: tutorSystem(learn, level, voice) }] },
      contents,
      /* Room for thinking as well as the answer — a cut-off reply is
         unreadable JSON. No temperature: Gemini 3 models are meant to run at
         their default, and lower settings can make them repeat themselves. */
      generationConfig: gen
    });
  }

  function problemOf(r) {
    if (r.ok) return '';
    if (r.status) return tutorProblem(r.status, r.body);
    return r.timeout ? 'timeout' : (r.cancelled ? 'cancelled' : 'network');
  }

  /* One model's try. Resolves with its answer, or with why it has none. */
  async function attempt(model, signal) {
    const t0 = Date.now();
    let r = await callGemini(model, payload(model, true), TUTOR_CAP_MS, signal);
    let p = problemOf(r);
    /* a model that does not take the thinking setting: same model, without it */
    if (p === 'bad-request' && /thinking/i.test(r.body) && !signal.aborted) {
      r = await callGemini(model, payload(model, false), TUTOR_CAP_MS, signal);
      p = problemOf(r);
    }
    if (r.ok) {
      let j; try { j = JSON.parse(r.body); } catch (e) { j = null; }
      const text = j && j.candidates && j.candidates[0] && j.candidates[0].content
        && j.candidates[0].content.parts && j.candidates[0].content.parts.map(x => x.text || '').join('');
      const out = shapeTutor(parseTutor(text));
      if (out) return { model, out, ms: Date.now() - t0 };
      p = 'unreadable';
    }
    return { model, fail: { model, status: r.status, problem: p, body: r.body } };
  }

  /* A race, not a queue. Measured live after a restart, the newest models
     stalled one after another — 25 s, then 20, then 20 — and a learner
     waited over a minute for nothing, while an older model answered the
     next message in four seconds. So the best model is asked first; if it
     has not answered in a few seconds the next one is asked as well, and
     then a third; whichever answers first is used and the others are
     called off. A model that fails outright hands over at once. The winner
     goes first next time. */
  /* A message that arrives while the server is still listing models at
     start waits a moment for the list. It used to race with only the one
     model named as a fallback — which was the one that stalled. */
  if (TUTOR_LISTED) await Promise.race([TUTOR_LISTED, new Promise(r => setTimeout(r, 5000))]);
  const models = (TUTOR_STATE.models && TUTOR_STATE.models.length
    ? TUTOR_STATE.models : [TUTOR_STATE.model || GEMINI_FALLBACK]).filter(m => m && !DEAD_MODELS.has(m)).slice(0, 3);
  /* every model gone: the list is being made again in the background */
  if (!models.length) {
    relist(0);
    const e = new Error('unavailable');
    e.status = 0;
    throw e;
  }

  const result = await new Promise(resolve => {
    let next = 0, running = 0, done = false, hedge = null;
    const ctls = [], fails = [];
    const overall = setTimeout(() => finish({ fails, timedOut: true }), TUTOR_TOTAL_MS);
    function finish(v) {
      if (done) return;
      done = true;
      clearTimeout(hedge);
      clearTimeout(overall);
      ctls.forEach(c => { try { c.abort(); } catch (e) {} });
      /* every outcome carries the failures so far, a win included */
      resolve(Object.assign({}, v, { fails: fails.slice() }));
    }
    function launch() {
      if (done || next >= models.length) return;
      const model = models[next++];
      const ctl = new AbortController();
      ctls.push(ctl);
      running++;
      clearTimeout(hedge);
      if (next < models.length) hedge = setTimeout(launch, TUTOR_HEDGE_MS);
      attempt(model, ctl.signal).then(res => {
        running--;
        if (done) return;
        if (res.out) return finish(res);
        fails.push(res.fail);
        const p = res.fail.problem;
        /* Only a problem with the key itself ends the race. One model being
           gone (404) or not allowed (403) is that model's failure: the race
           used to stop there and call off a model that was about to answer. */
        if (KEY_FATAL.indexOf(p) >= 0) return finish({ fails, stop: p });
        if (next < models.length) launch();          /* failed outright: no need to wait */
        else if (running === 0) finish({ fails });
      }, () => {
        running--;
        if (!done && next >= models.length && running === 0) finish({ fails });
      });
    }
    launch();
  });

  /* Reported to the operator in the log; the caller only learns that the
     tutor is unavailable, never Google's raw message. */
  result.fails.forEach(f => {
    console.warn('[tutor] ' + f.model + ': ' + (f.status || '-') + ' (' + f.problem + ') ' + String(f.body || '').slice(0, 300));
  });
  /* Slow, overloaded or out of quota: to the back of the line, so the next
     message does not wait on it again. */
  result.fails.forEach(f => {
    if (['timeout', 'google-down', 'quota', 'network', 'unreadable'].indexOf(f.problem) >= 0 && TUTOR_STATE.models.length > 1) {
      TUTOR_STATE.models = TUTOR_STATE.models.filter(m => m !== f.model).concat([f.model]);
    }
  });

  /* Gone (404) or refused (403) for this key: out of the list for good, so
     no later message and no later listing tries it again. */
  result.fails.forEach(f => {
    if (f.problem === 'model-missing' || f.problem === 'key-not-allowed') {
      DEAD_MODELS.add(f.model);
      TUTOR_STATE.models = TUTOR_STATE.models.filter(m => m !== f.model);
    }
  });

  if (result.out) {
    if (TUTOR_STATE.models[0] !== result.model) console.log('[tutor] now using ' + result.model);
    TUTOR_STATE.models = [result.model].concat(TUTOR_STATE.models.filter(m => m !== result.model));
    TUTOR_STATE.model = result.model;
    TUTOR_STATE.problem = '';
    TUTOR_STATE.ms = result.ms;
    return result.out;
  }

  TUTOR_STATE.model = TUTOR_STATE.models[0] || '';
  const last = result.fails[result.fails.length - 1] || { status: 0, problem: 'timeout' };
  TUTOR_STATE.problem = result.timedOut ? 'timeout' : last.problem;
  if (result.stop) TUTOR_STATE.ready = false;            /* the key itself is refused */
  if (!TUTOR_STATE.models.length) {
    /* Every model refused this key with 403: that is the key, not the
       models. Otherwise the gone ones are replaced by listing again — in
       the background, so this learner is not kept waiting for it. */
    if (result.fails.length && result.fails.every(f => f.problem === 'key-not-allowed')) {
      TUTOR_STATE.ready = false;
      TUTOR_STATE.problem = 'key-not-allowed';
    } else {
      relist(0);
    }
  }
  if (!result.timedOut && result.fails.length && result.fails.every(f => f.problem === 'unreadable')) return null;
  const quota = result.fails.some(f => f.status === 429) && !result.fails.some(f => f.problem === 'timeout');
  const e = new Error(quota ? 'busy' : 'unavailable');
  e.status = quota ? 429 : last.status;
  throw e;
}

/* Ask the next model if the first has said nothing for this long; one
   model's hard limit; and the most a learner is ever kept waiting. */
const TUTOR_HEDGE_MS = 7000;
const TUTOR_CAP_MS = 30000;
const TUTOR_TOTAL_MS = 35000;

/* One request to one model. Never throws: a timeout, a dropped connection
   or being called off (another model answered first) comes back as a
   result like any other. */
async function callGemini(model, body, waitMs, outer) {
  const ctl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctl.abort(); }, waitMs || 15000);
  const callOff = () => ctl.abort();
  if (outer) {
    if (outer.aborted) ctl.abort();
    else outer.addEventListener('abort', callOff, { once: true });
  }
  try {
    const r = await fetch(GEMINI_BASE + '/models/' + encodeURIComponent(model) + ':generateContent', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      body,
      signal: ctl.signal
    });
    return { ok: r.ok, status: r.status, body: await r.text() };
  } catch (e) {
    return { ok: false, status: 0, body: '', timeout: timedOut, cancelled: !timedOut && !!(outer && outer.aborted) };
  } finally {
    clearTimeout(timer);
    if (outer) outer.removeEventListener('abort', callOff);
  }
}

app.post('/api/tutor', rateLimit(40, 15 * 60 * 1000, 'tutor'), async (req, res) => {
  if (!TUTOR_STATE.ready) return res.status(503).json({ error: 'The AI tutor is not switched on.', reason: 'off' });
  try {
    const b = req.body || {};
    const learn = b.learn === 'hi' ? 'hi' : 'en';
    const level = Math.max(1, Math.min(6, parseInt(b.level, 10) || 1));
    /* the last few turns only — enough to follow the conversation, little
       enough to stay well inside the free quota */
    const history = (Array.isArray(b.history) ? b.history : [])
      .filter(m => m && typeof m.text === 'string' && m.text.trim())
      .slice(-10)
      .map(m => ({ role: m.role === 'tutor' ? 'tutor' : 'user', text: m.text }));
    if (!history.length || history[history.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Nothing to answer.' });
    }
    const out = await askGemini(learn, level, history, false, b.voice === true);
    if (!out) return res.status(502).json({ error: 'The AI tutor gave an answer that could not be read.', reason: 'unreadable' });
    res.json({ ok: true, tutor: out });
  } catch (e) {
    const busy = e && e.status === 429;
    res.status(busy ? 429 : 502).json({
      error: busy ? 'The AI tutor is busy right now. Please try again in a minute.'
                  : 'The AI tutor could not be reached just now.',
      reason: busy ? 'quota' : 'unreachable'
    });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));

/* Find out whether mail really works, without holding up the boot. */
checkMail().catch(() => {});
/* and which model the tutor can use */
/* Listing first (a message arriving meanwhile waits a moment for it); then
   the warm-up, which no message waits for. */
TUTOR_LISTED = setupTutor().catch(() => {});
TUTOR_LISTED.then(warmTutor).catch(() => {});

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
    /* The database's own message can carry the cluster's host name and the
       user name from the connection string, and /api/health is public. It is
       in the log above; the public reason says only what happened. */
    STORE = { kind: 'memory', durable: false,
              reason: 'MONGODB_URI is set but the database refused the connection. '
                      + 'The service log has the details.' };
    app.listen(PORT, () => console.log(`Tamil Bridge API listening on ${PORT} (store: memory/fallback)`));
  });
