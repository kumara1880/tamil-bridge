# Tamil Bridge — தமிழ் பாலம்

Learn **English and Hindi through Tamil**. Voice teaching, sentence explanation,
photo translation, any-language translation, dictionary, phonics, and the
complete alphabet of all three languages.

**Zero cost, permanently.** No API keys, no subscriptions, no server required.

---

## How to run — easiest first

### 1. Double-click (no install, nothing to set up)

Open **`index.html`**. That's it. The whole app runs in the browser.

### 2. One click, with a local server

Double-click **`Start Tamil Bridge.bat`** (Windows) or run `./start.sh`
(Mac/Linux). It starts a local server on <http://localhost:5177> and opens it.

A server is slightly better than `file://` because the browser gives it a
stable origin, so your sign-in and history survive reliably.

### 3. Put it on the web (free forever)

See [Deploying](#deploying-free-forever) below.

---

## What it does

| Feature | Notes |
|---|---|
| **Translate** | Any language → any language, translating **as you type**, like Google Translate. Auto-detect, swap, speaker on both sides, tap any word for its meaning. |
| **Romanised typing** | Type `vanakkam` → வணக்கம், `namaste` → नमस्ते. Dictionary-backed, so common words come out exactly right. |
| **Meaning** | `cat` → பூனை (pūṉai) / बिल्ली. Works from any language, and from romanised input (`poonai`). Part of speech, IPA, examples, synonyms, related words. |
| **Sentence Explainer** | Word-by-word gloss, part of speech, tense with its formula, subject/verb/object, and the SOV↔SVO word-order shift — explained in Tamil. |
| **Spelling & grammar check** | Targets the mistakes Tamil speakers actually make: missing articles, `-s` agreement, `did went`, `a`/`an`, plurals after numbers. |
| **Voice teaching** | The browser's own speech engine narrates lessons in Tamil and reads the target language slowly. Free, offline, no key. |
| **Pronunciation practice** | Speak into the mic, get a score per word with Tamil feedback. |
| **Photo translate** | OCR from a photo in 23 scripts (Tesseract.js), then translate. |
| **Alphabet** | Tamil **all 247** (12 உயிர் + 18 மெய் + ஃ + 216 உயிர்மெய்), Hindi full varnamala + barakhadi, English A–Z with sounds. |
| **Phonics** | All 44 English phonemes with Tamil articulation notes, flagging the sounds Tamil does not have (`/θ/ /f/ /v/ /z/ /æ/`). |
| **Vocabulary** | 201 words across 19 themes, each in Tamil / English / Hindi with romanisation, IPA, and the sound written in Tamil letters. |
| **Lessons** | 10 graded units, 60 aligned sentences, grammar notes and quizzes. |
| **Practice** | Spaced repetition (SM-2), four directions, streaks and XP. |
| **Accounts & history** | Email *or* phone sign-in, every action logged, searchable, exportable. |
| **Interface language** | Tamil or English — the **EN / த** button in the top bar. |

---

## Is it really free?

Yes, and here is exactly why — so you can verify it.

| Part | What it uses | Cost |
|---|---|---|
| Voice (speak + listen) | Web Speech API, built into Chrome/Edge | free, no key |
| Translation | Google `gtx` endpoint → MyMemory → LibreTranslate → offline dictionary | free, no key |
| English definitions | dictionaryapi.dev | free, no key |
| Photo OCR | Tesseract.js (Apache-2.0) from a CDN | free |
| Fonts | Google Fonts, with Windows fonts as fallback | free |
| Storage | your browser's localStorage | free |
| Hosting (optional) | Vercel Hobby | free |
| Backend (optional) | Render free web service | free |
| Database (optional) | MongoDB Atlas M0 | free forever |

**There is no paid tier and no account to create anywhere.**

---

## Honest limitations

Worth knowing before you rely on it:

- **It is not an AI / AGI.** There is no language model. The tutor is a rules and
  dictionary engine: real grammar analysis, but deterministic. It will not
  handle an arbitrary complex sentence the way GPT-style models do.
- **Sign-in is local by default.** With no backend, your account lives in *this
  browser on this device*. Passwords are never stored — only a salted
  PBKDF2-SHA256 hash. Clearing browser data deletes it, so use
  **Settings → Data → Download everything** now and then.
- **No password reset and no email/SMS verification.** Both need a mail/SMS
  provider, which is not free at any meaningful volume.
- **Translation and OCR need internet.** Everything else — lessons, vocabulary,
  alphabet, phonics, practice, voice, the sentence explainer — works offline.
- **Voices depend on your OS.** If Tamil or Hindi sounds wrong or silent,
  install the voice: Windows → Settings → Time & language → Language & region →
  add the language → Speech.
- **Speech recognition needs Chrome or Edge**, and an internet connection.

---

## Deploying (free forever)

### Frontend → Vercel

```bash
npm i -g vercel
vercel --prod
```

Vercel serves the repository root as a static site; `.vercelignore` keeps the
server out of the deployment. Nothing to build.

### Backend → Render (optional — only for syncing across devices)

The app is complete without this. Add it only if you want the same account on
your phone and laptop.

1. Create a free **MongoDB Atlas M0** cluster and copy its connection string.
   *Do not use Render's own free Postgres — it expires after 30 days. Atlas M0
   is free with no expiry.*
2. Push this repo to GitHub, then in Render: **New → Blueprint**, pick the repo.
   `render.yaml` configures everything.
3. Set these in the Render dashboard:
   - `MONGODB_URI` — your Atlas string
   - `ALLOWED_ORIGIN` — your Vercel URL, e.g. `https://tamil-bridge.vercel.app`
   - `JWT_SECRET` — generated automatically
4. In the app: **Settings → Sync**, paste the Render URL, press **Test
   connection**.

**Render free tier sleeps after ~15 minutes idle**, so the first request can take
up to a minute. The app handles this: it stays in local mode and syncs when the
server wakes.

### Run the backend locally

```bash
cd server && npm install && node index.js
```

Without `MONGODB_URI` it uses an in-memory store and warns you — fine for a
smoke test, not for real data.

---

## Project layout

```
index.html                 app shell
assets/styles.css          dark + light themes, responsive
data/
  vocab.js                 201 words × 3 languages
  alphabet.js              Tamil 247 / Hindi varnamala / English 26 (grids generated)
  phonics.js               44 English phonemes, Hindi contrasts
  lessons.js               10 units, 60 aligned sentences
  lexicon.js               grammar lexicon + morphology tables
js/
  store.js  auth.js        localStorage + PBKDF2 accounts
  speech.js                text-to-speech, recognition, scoring
  translit.js              romanised ⇄ native script
  translate.js             multi-provider translation
  tutor.js                 sentence analysis engine
  check.js                 spelling + grammar correction
  dict.js                  meaning lookup
  srs.js  ocr.js  sync.js  practice, photo OCR, optional cloud sync
  i18n.js                  Tamil / English interface
  views.js  views2.js      screens
  app.js                   router and boot
server/                    optional Render backend
```

---

## Keyboard

| Key | Where | Action |
|---|---|---|
| `Space` | Practice | Reveal the answer |
| `1`–`4` | Practice | Rate: forgot / hard / good / easy |
| `Esc` | Anywhere | Close a dialog, stop the voice |
