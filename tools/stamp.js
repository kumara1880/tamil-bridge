/* Stamp index.html with a content hash for every file it loads.

   The cache tag used to be a number bumped by hand, and three times a file
   changed while the number did not — so browsers kept serving the old one
   and a fix that was live looked broken. A hash cannot be forgotten: it
   changes exactly when the file does, and only for the file that changed,
   so one edit no longer costs every visitor a fresh download of everything.

   Run:  node tools/stamp.js          rewrite the tags
         node tools/stamp.js --check  fail if any tag is stale (the suite
                                      does this, so a forgotten stamp is
                                      caught before it ships)                */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PAGE = path.join(ROOT, 'index.html');

function hash(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return null;
  return crypto.createHash('sha1').update(fs.readFileSync(full)).digest('hex').slice(0, 8);
}

/* src="js/app.js?v=abc12345" / href="assets/styles.css?v=..." — local only */
const REF = /((?:src|href)=")((?!https?:|\/\/)[^"?]+)(\?v=[^"]*)?(")/g;

function restamp(html) {
  const stale = [];
  const out = html.replace(REF, function (m, lead, file, tag, tail) {
    const h = hash(file);
    if (h === null) return m;                     /* not ours to stamp */
    const want = '?v=' + h;
    if (tag !== want) stale.push({ file: file, was: tag || '(none)', now: want });
    return lead + file + want + tail;
  });
  return { html: out, stale: stale };
}

const html = fs.readFileSync(PAGE, 'utf8');
const r = restamp(html);
const check = process.argv.indexOf('--check') >= 0;

if (check) {
  if (r.stale.length) {
    console.error('Stale cache tags in index.html — run `node tools/stamp.js`:');
    r.stale.forEach(function (s) { console.error('  ' + s.file + '  ' + s.was + ' -> ' + s.now); });
    process.exit(1);
  }
  console.log('cache tags are current');
} else {
  if (r.stale.length) {
    fs.writeFileSync(PAGE, r.html);
    console.log('restamped ' + r.stale.length + ' file(s):');
    r.stale.forEach(function (s) { console.log('  ' + s.file + '  ' + s.was + ' -> ' + s.now); });
  } else {
    console.log('nothing to do — every tag already matches');
  }
}

module.exports = { hash: hash, restamp: restamp };
