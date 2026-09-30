# Tamil Bridge — everything you need to keep it running

Written for the day you open a new laptop and nothing is set up. Follow it
from the top and you will have the site running, editable and deployable
again in about twenty minutes.

Nothing here needs Claude, an AI subscription, or any paid service. The site
was built to cost nothing to run, and it still costs nothing when you are
the only one maintaining it.

---

## 1. The one-minute version

If you read nothing else:

- **The code lives on GitHub** at <https://github.com/kumara1880/tamil-bridge>.
  That is the real backup. As long as that repository exists, nothing is lost.
- **The website rebuilds itself.** Push to the `main` branch and
  <https://tamil-bridge.vercel.app> updates on its own within a minute or two.
- **The app works with no internet and no server at all.** Download the code,
  double-click `index.html`, and the whole thing runs. Accounts and syncing
  between devices are the only parts that need the server.
- **The only things not in the repository are the passwords and keys.** They
  live in the Render dashboard. Section 5 lists them. Keep them in a password
  manager, never in the code.

---

## 2. What you own, and where each piece lives

| Piece | Where | What it does | Cost |
|---|---|---|---|
| The code | GitHub — `kumara1880/tamil-bridge` | Everything. The single source of truth. | Free |
| The website | Vercel — `tamil-bridge.vercel.app` | Serves the site. Rebuilds on every push to `main`. | Free |
| The API | Render — `tamil-bridge.onrender.com` | Accounts, sign-in, password reset, syncing progress between devices. | Free |
| The database | MongoDB Atlas, cluster `Cluster0`, database `tamilbridge` | Stores accounts and saved progress. | Free (M0) |
| Email | Brevo | Sends the password-reset link. | Free tier |

Four logins to keep: **GitHub, Vercel, Render, MongoDB Atlas** (and Brevo for
email). Write down which email address each one uses — that matters more than
the passwords, which can be reset.

### Free-tier behaviour worth knowing

- **Render sleeps.** A free service shuts down after about fifteen minutes with
  no traffic, and the next request has to wake it — which takes roughly a
  minute. It is not broken, it is asleep. Signing in the first time each day
  will feel slow.
- **Atlas pauses idle clusters.** A free M0 cluster that goes unused for a long
  stretch gets paused. You resume it from the Atlas dashboard with one click;
  nothing is deleted.
- **Vercel does not sleep.** The website itself is always instant. Only the
  account features go through Render.

---

## 3. The backups that exist right now

In `Documents\tamil-bridge-backups` (which OneDrive also copies to the cloud):

- **`tamil-bridge-YYYY-MM-DD.bundle`** — the entire repository including every
  commit of history, in one file. Verified as a complete history when it was
  made. This is the one that matters.
- **`tamil-bridge-site-YYYY-MM-DD.zip`** — just the site's files, no history.
  Unzip it and double-click `index.html` and the app runs. Use this one if you
  never want to touch git again.

### Restoring from the bundle

```bash
git clone tamil-bridge-2026-09-30.bundle tamil-bridge
```

That gives you a full working repository — every file, every commit. Then point
it back at GitHub:

```bash
git remote set-url origin https://github.com/kumara1880/tamil-bridge.git
```

### Making a fresh backup later

From inside the project folder:

```bash
git bundle create ../tamil-bridge-backups/tamil-bridge-$(date +%Y-%m-%d).bundle --all
```

Worth doing whenever you have made changes you would hate to lose. It takes a
second and the file is under a megabyte.

---

## 4. Setting up a new laptop, step by step

### Step 1 — install two things

- **Git** — <https://git-scm.com/downloads>
- **Node.js**, version 18 or newer — <https://nodejs.org> (take the LTS one)

Node is only needed to run the tests, the cache-stamp tool, and the server
locally. The website itself needs neither.

A code editor helps but is not required. **VS Code** (<https://code.visualstudio.com>)
is free.

### Step 2 — get the code

```bash
git clone https://github.com/kumara1880/tamil-bridge.git
```

If GitHub is gone or you cannot sign in, use the bundle instead (section 3).

### Step 3 — check it works

Open the folder and double-click **`Start Tamil Bridge.bat`** (Windows) or run
`./start.sh` (Mac or Linux). A browser opens at <http://localhost:5177>.

Or just double-click `index.html` — no server, still works.

### Step 4 — check the tests pass

```bash
node test.js
```

You should see `PASS 809   FAIL 0` or better. If something fails, the failure
names what broke. Do not deploy until it passes.

### Step 5 — tell git who you are

```bash
git config --global user.name "Kumara"
git config --global user.email "kingkumara018@gmail.com"
```

### Step 6 — be able to push

GitHub no longer accepts account passwords from the command line. Either:

- install the **GitHub CLI** (<https://cli.github.com>) and run `gh auth login`, or
- create a **personal access token** at
  <https://github.com/settings/tokens> with `repo` permission, and use the
  token in place of your password the first time you push.

That is the whole setup. You can now edit, test and deploy.

---

## 5. The secrets — the only things not in the repository

These live in the **Render dashboard**, under the service's *Environment* tab.
Copy the values into a password manager before you lose access to the old
laptop. **Never put them in the code**, and never paste them into a chat — the
repository is public, so anything committed is public too.

| Name | What it is | Where to get it again |
|---|---|---|
| `MONGODB_URI` | The database connection string, with the password in it | MongoDB Atlas → Connect → Drivers |
| `MONGODB_DB` | `tamilbridge` | It is just that word |
| `JWT_SECRET` | A long random string that signs sign-in tokens | Render dashboard. If lost, generate a new one — everyone simply has to sign in again |
| `BREVO_API_KEY` | Sends the password-reset email | Brevo → SMTP & API → API Keys |
| `MAIL_FROM` | The address reset emails come from | Your own choice, verified in Brevo |
| `APP_URL` | `https://tamil-bridge.vercel.app` | The site's address |
| `ALLOWED_ORIGIN` | `https://tamil-bridge.vercel.app` | The site's address |

`JWT_SECRET` is the only one you can safely replace without asking anyone. The
others are issued by a service, so you retrieve them rather than invent them.

To check everything is wired up, open
<https://tamil-bridge.onrender.com/api/health>. You want to see `ok: true`,
`durable: true`, and `mail: true`. If `durable` is false, `MONGODB_URI` is wrong
or the cluster is paused. If `mail` is false, `mailReason` says why.

---

## 6. Making a change and putting it live

Four commands, always in this order:

```bash
node tools/stamp.js
```

**Never skip this.** Every script and stylesheet is loaded with a version tag
made from the file's contents. If you change a file without restamping, every
browser that has visited before keeps serving the old one, and your change
looks like it did nothing. This has caught people out before.

```bash
node test.js
```

Everything must pass. The suite is not decoration — it has caught real breakage
several times, including once when every page was broken while the code still
parsed cleanly.

```bash
git add -A
git commit -m "what you changed and why"
```

```bash
git push
```

Vercel notices the push and rebuilds by itself. Wait a minute, then reload
<https://tamil-bridge.vercel.app>. If your change is not there, it is almost
always because `stamp.js` was not run.

### Checking the live site really updated

Open the site, press F12 for developer tools, go to the Network tab and reload.
The version tag on the file you changed should match the one in your local
`index.html`. If it does not, the deploy has not finished yet.

### The API is separate

Changes inside the `server/` folder go to Render, not Vercel. Render also
watches `main` and redeploys by itself. It is slower — give it a few minutes —
and you can watch progress in the Render dashboard under *Logs*.

---

## 7. Backing up the database

The code is safe on GitHub. The accounts and saved progress are not — they only
exist in MongoDB Atlas.

In the Atlas dashboard: **Browse Collections** → your `tamilbridge` database →
each collection has an **Export** button that downloads JSON. Do that
occasionally and keep the files with your other backups.

Free M0 clusters do not include automatic backups, so this is manual. If the
database were ever lost, the app would keep working — everyone would simply
have to make an account again, because all learning content lives in the code,
not the database.

---

## 8. When the Claude subscription ends

Nothing happens to the site. Not one part of it calls Claude or any AI service
at runtime. Claude was used to write the code; the code does not need Claude to
run, and never did.

What you lose is help making further changes. What stays working:

- the website, exactly as it is
- accounts, sign-in, password reset, syncing
- the voice, the translation, the photo reader, the dictionary — all of it uses
  either the browser's own features or free public endpoints
- your ability to edit the code yourself, with the four commands in section 6

The project was deliberately built with no build step, no framework and no
dependencies on the front end. Every file is plain JavaScript you can open and
read. That was the point: so it would still be maintainable by one person with
a text editor.

---

## 9. If a service disappears

**GitHub is gone or locked** — restore from the bundle (section 3), create a
repository anywhere else, and push to it. Then point Vercel at the new one.

**Vercel is gone** — the site is static files, so anything can host it: Netlify,
Cloudflare Pages, GitHub Pages. Upload the folder; there is nothing to build.

**Render is gone** — the API is one Node file in `server/`. Any free Node host
runs it. Set the same environment variables and update `window.TB_API` in
`index.html` to the new address. Until then the site still works; only accounts
and cross-device syncing stop.

**Everything is gone** — unzip `tamil-bridge-site-*.zip` and open `index.html`.
Lessons, vocabulary, grammar, phonics, the alphabet, writing practice, maths,
the dictionary and the trace pad all work with no server and no internet.

---

## 10. The map of the code

```
index.html          the whole page; loads every script by hand, no bundler
assets/styles.css   all the styling
data/*.js           the content — words, lessons, grammar, phrases, phonics
js/*.js             the app; each file attaches itself to a global TB object
js/views*.js        one file per group of screens
server/index.js     the entire API, one file
tools/stamp.js      rewrites the version tags — run after every edit
test.js             the whole test suite — run before every push
```

Two rules that the code depends on:

1. **No ES modules.** Every file is a plain `<script>` so that opening
   `index.html` straight from disk still works. Do not add `import` or `export`.
2. **Stamp after editing.** Section 6 explains why.

---

## 11. A short checklist for moving day

- [ ] `git push` from the old laptop until `git status` says nothing to commit
- [ ] Copy `Documents\tamil-bridge-backups` to the new machine or a USB stick
- [ ] Copy the environment-variable values out of Render into a password manager
- [ ] Write down which email address each of the five accounts uses
- [ ] Export the Atlas collections if you care about existing accounts
- [ ] On the new laptop: install Git and Node, clone, `node test.js`
- [ ] Make one tiny change, run the four commands, confirm the live site updates

Once that last box is ticked, you are fully moved.
