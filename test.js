/* Full offline regression suite for Tamil Bridge. */
const fs = require('fs'), vm = require('vm');
const R = __dirname + '/';

const ctx = {};
ctx.window = ctx; ctx.console = console; ctx.navigator = { onLine: false, language: 'en' };
ctx.fetch = () => Promise.reject(new Error('offline'));
ctx.setTimeout = setTimeout; ctx.clearTimeout = clearTimeout;
ctx.AbortController = AbortController; ctx.TextEncoder = TextEncoder;
ctx.localStorage = (() => { const m = new Map(); return {
  getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)),
  removeItem: k => m.delete(k), clear: () => m.clear() }; })();
ctx.crypto = require('crypto').webcrypto;
ctx.speechSynthesis = { getVoices: () => [], speak() {}, cancel() {}, addEventListener() {} };
ctx.document = { addEventListener() {}, head: { appendChild() {} }, createElement: () => ({}) };
vm.createContext(ctx);

['data/vocab.js','data/vocab2.js','data/ensound.js','data/alphabet.js','data/phonics.js','data/lessons.js','data/lessons2.js',
 'data/phrases.js','data/lexicon.js','data/grammar.js','data/grammar_hi.js',
 'data/wordpairs.js','data/wordpairs2.js','data/spoken.js','data/grammar.js','data/grammar_hi.js',
 'data/wordpairs.js','data/wordpairs2.js','data/spoken.js',
 'js/store.js','js/auth.js','js/speech.js','js/translit.js','js/vocabx.js','js/translate.js',
 'js/reader.js',
 'js/tutor.js','js/check.js','js/ocr.js','js/dict.js','js/srs.js','js/numbers.js','js/conjugate.js',
 'js/maths.js','js/writing.js','js/sentences.js']
  .forEach(f => vm.runInContext(fs.readFileSync(R + f, 'utf8'), ctx, { filename: f }));

const TB = ctx.TB;
let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  cond ? pass++ : fail++;
  if (!cond) console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : ''));
};
const section = s => console.log('\n' + s);

/* ---------------- the page itself ---------------- */
section('PAGE');
(function () {
  /* Three times a file changed while its cache tag did not, so browsers
     kept serving the old one and a shipped fix looked broken. The tags are
     content hashes now, and this fails if any of them is stale. */
  var stamp = require('./tools/stamp.js');
  var html = require('fs').readFileSync(__dirname + '/index.html', 'utf8');
  var r = stamp.restamp(html);
  t('every cache tag matches its file', r.stale.length === 0,
    r.stale.map(function (x) { return x.file; }).join(' '));

  var refs = (html.match(/(?:src|href)="(?!https?:)[^"]+"/g) || [])
    .map(function (m) { return m.replace(/^[a-z]+="/, '').replace(/"$/, '').split('?')[0]; });
  var missing = refs.filter(function (f) {
    /* an inline data: icon is not a file on disk */
    return f && !/^#/.test(f) && !/^data:/.test(f)
      && !require('fs').existsSync(__dirname + '/' + f);
  });
  t('every file the page loads exists', missing.length === 0, missing.join(' '));
})();

/* ---------------- arithmetic ---------------- */
section('MATHS');
(function () {
  var M = TB.Maths;
  /* the answer has to be right before the explanation is worth anything */
  var cases = [[7, 'add', 5, '12'], [2856, 'add', 4791, '7647'],
               [53, 'sub', 28, '25'], [1000, 'sub', 1, '999'],
               [3, 'mul', 4, '12'], [234, 'mul', 56, '13104'],
               [144, 'div', 12, '12'], [1000, 'div', 7, '142 r 6']];
  var wrong = cases.filter(function (c) {
    var r = M.solve(c[0], c[1], c[2]);
    return !r.ok || r.answer !== c[3];
  });
  t('every worked example comes out right', wrong.length === 0,
    wrong.map(function (c) { return c.join(' '); }).join(' | '));

  /* digit arrays rather than floats, so it stays exact past 2^53 */
  t('big multiplication stays exact',
    M.solve(12345678, 'mul', 98765).answer === '1219320887670',
    M.solve(12345678, 'mul', 98765).answer);
  t('big addition stays exact',
    M.solve(999999999, 'add', 999999999).answer === '1999999998');

  var all = [];
  ['add', 'sub', 'mul', 'div'].forEach(function (op) {
    for (var i = 0; i < 60; i++) {
      var p = M.practice(op, (i % 3) + 1);
      var r = M.solve(p.a, op, p.b);
      if (!r.ok) { all.push(op + ' ' + p.a + '/' + p.b + ': ' + r.error); continue; }
      var want = op === 'add' ? p.a + p.b : op === 'sub' ? p.a - p.b
               : op === 'mul' ? p.a * p.b : Math.floor(p.a / p.b);
      var got = parseInt(String(r.answer).split(' ')[0], 10);
      if (got !== want) all.push(op + ' ' + p.a + ' ' + p.b + ' -> ' + r.answer + ' want ' + want);
    }
  });
  t('240 random sums across every level are correct', all.length === 0, all.slice(0, 3).join(' | '));

  var r = M.solve(2856, 'add', 4791);
  t('every step is written in all three languages',
    r.steps.every(function (s) { return s.en && s.ta && s.hi; }));
  t('no step leaves a language empty',
    r.steps.every(function (s) { return s.ta.length > 5 && s.hi.length > 5; }));
  t('the working is checkable', !!r.check && !!r.check.ta && !!r.check.hi);
  t('carrying is explained where it happens',
    r.steps.some(function (s) { return /carry/.test(s.en); }));
  t('borrowing is explained where it happens',
    M.solve(1000, 'sub', 1).steps.some(function (s) { return /borrow/.test(s.en); }));
  t('a nought in the way is explained',
    M.solve(1000, 'sub', 1).steps.some(function (s) { return /becomes 9/.test(s.en); }));
  t('small multiplication is shown as repeated adding',
    M.solve(3, 'mul', 4).steps.some(function (s) { return /added 4 times/.test(s.en); }));
  t('dividing by zero is refused with a reason',
    M.solve(5, 'div', 0).ok === false && /zero/.test(M.solve(5, 'div', 0).error));
  t('and the reason is given in Tamil and Hindi too',
    !!M.solve(5, 'div', 0).errorTa && !!M.solve(5, 'div', 0).errorHi);
  t('a number too big to stay exact is refused',
    M.solve(1e12, 'add', 1).ok === false);
  t('commas and spaces in the input are understood',
    M.parse('12,34,567') === 1234567 && M.parse(' 42 ') === 42);
  t('nonsense input is not guessed at', M.parse('12a') === null && M.parse('') === null);
  t('place names exist in all three languages',
    M.PLACES.every(function (p) { return p.en && p.ta && p.hi; }));
})();

/* ---------------- the writing pad ---------------- */
section('WRITING');
(function () {
  var W = TB.Writing;

  /* Rows are the only geometry left, and they must be even: a sheet whose
     lines drift apart is worse than no sheet. */
  var r1 = W.rows(600, 200, 1);
  var r4 = W.rows(600, 400, 4);
  t('one row is centred in the sheet',
    Math.abs(r1[0].middle - 100) < 1, r1[0].middle.toFixed(1));
  t('four rows are equal in height',
    r4.every(function (x) { return Math.abs(x.height - r4[0].height) < 0.01; }));
  t('four rows are evenly spaced', (function () {
    for (var i = 1; i < r4.length; i++) {
      var gap = r4[i].middle - r4[i - 1].middle;
      if (Math.abs(gap - (r4[1].middle - r4[0].middle)) > 0.01) return false;
    }
    return true;
  })());
  t('rows stay inside the sheet',
    r4[0].top >= 0 && r4[3].top + r4[3].height <= 400.01);
  t('the sheet keeps a margin top and bottom', r4[0].top > 10);

  t('capitals and small letters are all practisable',
    W.set('caps').length === 26 && W.set('small').length === 26);

  /* Ten digits is where writing practice starts, not where it stops: ages,
     dates, prices and marks all live below a hundred. */
  var num = W.set('num');
  t('numbers run from nought to a hundred', num.length === 101, num.length);
  t('and they are in order',
    num.every(function (x, i) { return +x.ch === i; }));
  t('a hundred is written as a hundred',
    num[100].ch === '100' && /hundred/i.test(num[100].words.en), num[100].words.en);
  t('every number carries its name in all three languages',
    num.every(function (d) { return d.words.en && d.words.ta && d.words.hi; }));
  t('no two numbers share an English name',
    new Set(num.map(function (d) { return d.words.en; })).size === 101);

  /* A multi-digit number must repeat across the row like a single letter,
     or two thirds of the paper is wasted. A sentence must not. */
  (function () {
    var seen = [];
    var ctx = {
      font: '', fillStyle: '', textBaseline: '',
      measureText: function (t) {
        return { width: t.length * 30, actualBoundingBoxAscent: 70, actualBoundingBoxDescent: 20 };
      },
      fillText: function (t, x, y) { seen.push({ t: t, x: x, y: y }); }
    };
    W.drawGhost(ctx, '47', 'num', 600, 200, 1, '#000', true);
    t('a two-digit number is repeated across the row', seen.length > 1, seen.length + ' copies');
    t('every copy is the whole number, not one digit',
      seen.every(function (o) { return o.t === '47'; }));
    t('the copies are evenly spaced', (function () {
      if (seen.length < 3) return true;
      var g = seen[1].x - seen[0].x;
      for (var i = 2; i < seen.length; i++) {
        if (Math.abs((seen[i].x - seen[i - 1].x) - g) > 0.01) return false;
      }
      return true;
    })());
    t('and the group is centred on the sheet',
      Math.abs(seen[0].x - (600 - (seen[seen.length - 1].x + 60))) < 1.5,
      seen[0].x + ' / ' + (600 - (seen[seen.length - 1].x + 60)));

    seen = [];
    W.drawGhost(ctx, 'This is my name', 'en', 600, 400, 4, '#000', false);
    t('a sentence is written once per line, not repeated',
      seen.length <= 4 && seen.every(function (o) { return o.t.indexOf(' ') >= 0 || o.t.length > 2; }),
      seen.map(function (o) { return o.t; }).join(' | '));
  })();

  /* The practice set must be reachable: a hundred numbers behind a Next
     button is not practice. */
  (function () {
    var fs = require('fs');
    var src = fs.readFileSync(__dirname + '/js/views3.js', 'utf8');
    t('a long set is offered as one tappable index',
      /function jumpStrip/.test(src) && /data-j=/.test(src));
    t('and the trace pad says the model repeats',
      /paint\('t', L\.ch, L\.script, true\)/.test(src));
    t('while your own sentence does not',
      /paint\('o', show, ownScript, false\)/.test(src));
  })();
  t('small letters really are small',
    W.set('small').every(function (x) { return x.ch === x.ch.toLowerCase(); }));
  t('capitals really are capital',
    W.set('caps').every(function (x) { return x.ch === x.ch.toUpperCase(); }));
  t('every digit carries its name in all three languages',
    W.set('num').every(function (d) { return d.words.en && d.words.ta && d.words.hi; }));
  t('Tamil and Hindi sets are not empty',
    W.set('ta').length > 20 && W.set('hi').length > 20);
  t('every set names the script it is written in',
    ['caps', 'small', 'num', 'ta', 'hi'].every(function (k) {
      return W.set(k).every(function (x) { return !!W.FAMILY[x.script]; });
    }));

  /* Nothing may mention a ruling any more. */
  (function () {
    var fs = require('fs');
    var files = ['js/writing.js', 'js/views3.js', 'assets/styles.css'];
    var left = files.filter(function (f) {
      var src = fs.readFileSync(__dirname + '/' + f, 'utf8');
      return /four-ruled|two-ruled|rule-pad|rule-guides|drawGuides|defaultRuling/.test(src);
    });
    t('the ruled page is gone everywhere', left.length === 0, left.join(' '));
  })();

  /* The bug that made typing impossible: a phone opening its keyboard fires
     a resize, and the view used to rebuild itself on that — destroying the
     input mid-word. The handler must repaint, never redraw. */
  (function () {
    var fs = require('fs');
    var src = fs.readFileSync(__dirname + '/js/views3.js', 'utf8');
    var i = src.indexOf("addEventListener('resize'");
    /* stop at the end of the handler, not 420 characters into whatever
       follows it */
    var end = src.indexOf('}, 200);', i);
    var handler = src.slice(i, end > 0 ? end + 8 : i + 400);
    t('a resize repaints the sheet rather than rebuilding the page',
      i > 0 && /paint\(/.test(handler) && !/redraw\(\)/.test(handler));
    t('and ignores a resize that did not change the width',
      /innerWidth === lastW/.test(handler));
    t('ink listeners are attached once, not on every repaint',
      /__wired/.test(src));
  })();
})();

/* ---------------- grammar, words, speaking ---------------- */
section('GRAMMAR AND WORDS');
(function () {
  [['English', TB.GRAMMAR], ['Hindi', TB.GRAMMAR_HI]].forEach(function (pair) {
    var name = pair[0], set = pair[1];
    t(name + ' grammar has topics', set.length >= 12, set.length);
    t(name + ' rule is written in all three languages',
      set.every(function (x) { return x.rule.en && x.rule.ta && x.rule.hi; }));
    t(name + ' title is written in all three',
      set.every(function (x) { return x.title.en && x.title.ta && x.title.hi; }));
    t(name + ' every topic shows examples',
      set.every(function (x) { return x.examples.length >= 2; }));
    t(name + ' every example is trilingual',
      set.every(function (x) { return x.examples.every(function (e) { return e.en && e.ta && e.hi; }); }));
    /* the mistake is the point of the topic: a rule without the error it
       prevents is a rule nobody remembers */
    t(name + ' every topic names the mistake and explains it in three languages',
      set.every(function (x) {
        return x.mistake && x.mistake.wrong && x.mistake.right &&
               x.mistake.why.en && x.mistake.why.ta && x.mistake.why.hi;
      }));
    t(name + ' the wrong form is never the right form',
      set.every(function (x) { return x.mistake.wrong !== x.mistake.right; }));
    var ids = set.map(function (x) { return x.id; });
    t(name + ' topic ids are unique', new Set(ids).size === ids.length);
  });

  [['English', TB.WORDPAIRS, 'en'], ['Hindi', TB.WORDPAIRS_HI, 'hi'], ['Tamil', TB.WORDPAIRS_TA, 'ta']]
    .forEach(function (row) {
      var name = row[0], set = row[1], lang = row[2];
      t(name + ' word pairs exist', set.length >= 20, set.length);
      t(name + ' every word has a headword in its own language',
        set.every(function (w) { return !!w[lang]; }));
      t(name + ' every word has synonyms and opposites',
        set.every(function (w) { return w.syn.length >= 1 && w.ant.length >= 1; }));
      t(name + ' every word carries a sentence in all three',
        set.every(function (w) { return w.ex && w.ex.en && w.ex.ta && w.ex.hi; }));
      /* a word listed as its own synonym or its own opposite teaches nothing */
      t(name + ' no word is its own synonym or opposite',
        set.every(function (w) {
          return w.syn.indexOf(w[lang]) < 0 && w.ant.indexOf(w[lang]) < 0;
        }));
      t(name + ' nothing is both a synonym and an opposite',
        set.every(function (w) {
          return w.syn.every(function (x) { return w.ant.indexOf(x) < 0; });
        }));
    });

  t('conversations exist', TB.SPOKEN.length >= 15, TB.SPOKEN.length);
  t('every conversation is titled in all three languages',
    TB.SPOKEN.every(function (d) { return d.title.en && d.title.ta && d.title.hi; }));
  t('every line of every conversation is in all three',
    TB.SPOKEN.every(function (d) {
      return d.lines.every(function (l) { return l.en && l.ta && l.hi; });
    }));
  t('conversations take two people',
    TB.SPOKEN.every(function (d) { return d.lines.some(function (l) { return l.who === 'A'; })
                                      && d.lines.some(function (l) { return l.who === 'B'; }); }));
  t('conversation ids are unique',
    new Set(TB.SPOKEN.map(function (d) { return d.id; })).size === TB.SPOKEN.length);
})();

/* ---------------- generated sentences ---------------- */
section('SENTENCES');
(function () {
  var S = TB.Sentences;
  t('over a lakh of them', S.total() >= 100000, S.total().toLocaleString('en-IN'));

  /* Walk a wide sample rather than a handful: a generator is only worth
     having if every address in it is sound. */
  var bad = [];
  var step = Math.max(1, Math.floor(S.total() / 4000));
  for (var i = 0; i < S.total(); i += step) {
    var x = S.atIndex(i);
    if (!x.en || !x.ta || !x.hi) { bad.push(i + ' missing a language'); continue; }
    if (/undefined|NaN|\[object/.test(x.en + x.ta + x.hi)) { bad.push(i + ' has a hole'); continue; }
    /* each language must be written in its own script */
    if (/[\u0B80-\u0BFF\u0900-\u097F]/.test(x.en)) bad.push(i + ' English is not English');
    if (!/[\u0B80-\u0BFF]/.test(x.ta)) bad.push(i + ' Tamil is not Tamil');
    if (!/[\u0900-\u097F]/.test(x.hi)) bad.push(i + ' Hindi is not Hindi');
  }
  t('4000 sampled sentences are all sound', bad.length === 0, bad.slice(0, 3).join(' | '));

  t('the same address always gives the same sentence',
    S.atIndex(12345).en === S.atIndex(12345).en && S.atIndex(12345).hi === S.atIndex(12345).hi);
  t('the space wraps rather than running off the end',
    S.atIndex(S.total()).en === S.atIndex(0).en);

  /* Hindi in the past of a transitive verb agrees with the object, not the
     subject — मैंने किताब पढ़ी, not पढ़ा. That is the rule this generator
     exists to get right. */
  var c = S.chart('eat', 'statement', 0);
  t('a chart covers every person', c.rows.length === S.SUBJECTS.length);

  /* The charts must tile the sentence space exactly: charts x rows x tenses
     is the total, so nothing in it is unreachable from the chart. */
  t('the charts cover every sentence there is, and no more',
    S.charts() * S.perChart() === S.total(),
    S.charts().toLocaleString('en-IN') + ' x ' + S.perChart() + ' = ' + S.total().toLocaleString('en-IN'));
  t('over a lakh of them are reachable through the chart',
    S.charts() * S.perChart() >= 100000);
  t('changing the ending changes the sentence',
    S.chart('eat', 'statement', 0).rows[0].present.en !== S.chart('eat', 'statement', 1).rows[0].present.en,
    S.chart('eat', 'statement', 1).rows[0].present.en);
  t('the ending wraps rather than running off the end',
    S.chart('eat', 'statement', S.chart('eat', 'statement', 0).slots).slot === 0);
  t('a chart knows which form it is in',
    S.chart('eat', 'question', 0).form.id === 'question');
  t('and the question form really asks',
    /\?$/.test(S.chart('eat', 'question', 0).rows[0].present.en),
    S.chart('eat', 'question', 0).rows[0].present.en);
  t('the chart has all three tenses',
    c.rows.every(function (r) { return r.past && r.present && r.future; }));
  t('Hindi marks gender on the verb',
    c.rows[0].present.hi !== c.rows[1].present.hi,
    c.rows[0].present.hi + ' / ' + c.rows[1].present.hi);
  t('the past of a transitive verb takes \u0928\u0947',
    /\u0928\u0947/.test(c.rows[0].past.hi), c.rows[0].past.hi);
  t('a named subject keeps its name rather than becoming a pronoun',
    c.rows[7].present.hi.indexOf('\u0930\u0935\u093f') === 0, c.rows[7].present.hi);
  t('and takes \u0928\u0947 after the name in the past',
    c.rows[7].past.hi.indexOf('\u0930\u0935\u093f \u0928\u0947') === 0, c.rows[7].past.hi);

  /* Tamil marks the person on the verb itself */
  t('Tamil marks the person on the verb',
    c.rows[0].present.ta !== c.rows[3].present.ta);
  t('Tamil negatives use the infinitive plus \u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8',
    /\u0bb5\u0bbf\u0bb2\u0bcd\u0bb2\u0bc8/.test(S.build(0, 0, 0, 0, 1).ta), S.build(0, 0, 0, 0, 1).ta);
  t('and a future negative uses \u0bae\u0bbe\u0b9f\u0bcd\u0b9f',
    /\u0bae\u0bbe\u0b9f\u0bcd\u0b9f/.test(S.build(0, 0, 0, 2, 1).ta), S.build(0, 0, 0, 2, 1).ta);
  t('a Tamil question ends in \u0b86',
    /\u0bbe\?$/.test(S.build(0, 0, 0, 0, 2).ta), S.build(0, 0, 0, 0, 2).ta);

  /* English questions move the helper to the front */
  t('an English question starts with a helper',
    /^(Do|Does|Did|Will) /.test(S.build(0, 0, 0, 0, 2).en), S.build(0, 0, 0, 0, 2).en);
  t('and a negative uses not',
    / not /.test(S.build(0, 0, 0, 0, 1).en), S.build(0, 0, 0, 0, 1).en);
  t('third person singular takes -s in the present',
    / eats /.test(S.build(3, 0, 0, 0, 0).en), S.build(3, 0, 0, 0, 0).en);

  /* a verb must only be offered objects it could act on */
  t('every verb is only given objects it can act on',
    S.VERBS.every(function (v, i) {
      var pool = S.allowedFor(i);
      if (!v.tr) return pool === null;
      return pool && pool.length > 0 && pool.every(function (o) {
        return v.takes.some(function (c) { return o.cat.indexOf(c) >= 0; });
      });
    }));
  t('every object carries its Hindi gender',
    S.OBJECTS.every(function (o) { return o.g === 'm' || o.g === 'f'; }));
  t('every subject carries its own Hindi form',
    S.SUBJECTS.every(function (x) { return x.hi && x.hiErg; }));
  t('every verb has all four Tamil stems',
    S.VERBS.every(function (v) { return v.ta.p && v.ta.d && v.ta.f && v.ta.inf; }));
})();

/* ---------------- can a parent find it ---------------- */
section('FINDING THINGS');
(function () {
  var fs = require('fs');
  var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  var v8 = fs.readFileSync(__dirname + '/js/views8.js', 'utf8');
  var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
  var home = fs.readFileSync(__dirname + '/js/views.js', 'utf8');

  /* Nothing is allowed to be three taps deep behind a name nobody searches
     for. Every tab gets its own address and its own line in the sidebar. */
  ['#/english/words', '#/english/tense', '#/english/sentences', '#/english/speaking']
    .forEach(function (href) {
      t('the sidebar links to ' + href, html.indexOf('href="' + href + '"') > 0);
    });
  t('synonyms and antonyms are called that, not "same and opposite"',
    /Synonyms &amp; Antonyms/.test(html) && /Synonyms & Antonyms/.test(v8));
  t('the tense chart is named in the sidebar', /Tense chart/.test(html));
  t('the home page offers them too',
    /#\/english\/words/.test(home) && /#\/english\/tense/.test(home));
  t('writing and maths are on the home page too',
    /quick\('#\/write'/.test(home) && /quick\('#\/maths'/.test(home));

  /* A link into a tab must open that tab. */
  t('the section reads the address', /function startTab/.test(v8)
    && /mount: function \(root, param\)/.test(v8)
    && /html: function \(param\)/.test(v8));
  t('and tapping a tab updates the address', /history\.replaceState/.test(v8));
  t('the router passes the address on to the view',
    /v\.mount\(root, r\.param\)/.test(app) && /v\.html\(r\.param\)/.test(app));
  t('the highlight follows the whole address, not just the section',
    /a === exact/.test(app));

  /* One handler on the lasting element, not one per redraw, or a word gets
     spoken once for every time you have visited the tab. */
  t('speaking handlers do not stack up on redraw',
    (v8.match(/body\.addEventListener\('click'/g) || []).length === 1
      && /function onBody/.test(v8));
})();

/* ---------------- clipboard ---------------- */
section('CLIPBOARD');
(function () {
  /* navigator.clipboard is refused from file://, over plain http, and
     whenever the page is not focused. An uncaught call there rejects
     silently while the toast still says "Copied", so every use has to go
     through the one helper that catches and falls back. */
  var fs = require('fs');
  var files = fs.readdirSync(__dirname + '/js').filter(function (f) { return /\.js$/.test(f); });
  var raw = [];
  files.forEach(function (f) {
    var src = fs.readFileSync(__dirname + '/js/' + f, 'utf8');
    src.split(/\n/).forEach(function (line, i) {
      if (line.indexOf('navigator.clipboard') < 0) return;
      if (f === 'views.js') return;        /* the helper itself lives here */
      raw.push(f + ':' + (i + 1));
    });
  });
  t('nothing calls the clipboard directly', raw.length === 0, raw.join(' '));

  var v = fs.readFileSync(__dirname + '/js/views.js', 'utf8');
  var helper = v.slice(v.indexOf('function copy(text)'), v.indexOf('function copyWithToast'));
  t('the helper catches a refusal', /\.catch\(/.test(helper));
  t('the helper has a fallback for when the API is absent',
    /execCommand/.test(helper) && /return Promise\.resolve\(fallback\(\)\)/.test(helper));
  t('the helper resolves a boolean rather than throwing',
    /return Promise\.resolve\(false\)/.test(helper));
  t('success is only claimed when copying worked',
    /ok \? 'Copied'/.test(v));
})();

/* ---------------- data integrity ---------------- */
section('DATA');
t('vocab loaded', TB.VOCAB.length >= 3000, TB.VOCAB.length);
t('all vocab fields present', TB.VOCAB.every(w => w.ta && w.en && w.hi && w.taR && w.hiR && w.enTa && w.hiTa && w.th && w.id));
t('vocab ids unique', new Set(TB.VOCAB.map(w => w.id)).size === TB.VOCAB.length);
t('every theme has words', TB.THEMES.every(th => TB.VOCAB.some(w => w.th === th.id)));
t('every vocab theme is declared', TB.VOCAB.every(w => TB.THEMES.some(th => th.id === w.th)));
t('Tamil alphabet = 247',
  TB.ALPHABET.ta.vowels.length + TB.ALPHABET.ta.consonants.length + 1 +
  TB.ALPHABET.ta.grid.length * 12 === 247);
t('Tamil grid 18x12', TB.ALPHABET.ta.grid.length === 18 && TB.ALPHABET.ta.grid.every(r => r.cells.length === 12));
t('Hindi barakhadi 33x11', TB.ALPHABET.hi.grid.length === 33 && TB.ALPHABET.hi.grid.every(r => r.cells.length === 11));
t('English 26 letters', TB.ALPHABET.en.letters.length === 26);
t('44 English phonemes', TB.PHONICS.en.groups.reduce((n, g) => n + g.items.length, 0) === 44);
/* a floor, not a fixed count, so adding lessons never breaks the suite */
t('lesson units', TB.LESSONS.length >= 22, TB.LESSONS.length);
t('lesson sentences', TB.LESSONS.reduce((n, u) => n + u.lines.length, 0) >= 130,
  TB.LESSONS.reduce((n, u) => n + u.lines.length, 0));
t('lesson ids are unique',
  new Set(TB.LESSONS.map(u => u.id)).size === TB.LESSONS.length);
t('every lesson line is trilingual', TB.LESSONS.every(u => u.lines.every(l => l.ta && l.en && l.hi)));
t('every quiz answer index is valid',
  TB.LESSONS.every(u => u.quiz.every(q => q.a >= 0 && q.a < q.opts.length && q.why)));

/* ---------------- vocabulary ---------------- */
section('VOCABULARY');
(function () {
  var V = TB.VOCAB;
  t('3000+ words', V.length >= 3000, V.length);
  t('every word is trilingual',
    V.every(function (w) { return w.en && w.ta && w.hi; }));
  t('every word has a level 1-3',
    V.every(function (w) { return w.lv >= 1 && w.lv <= 3; }));
  var themes = {};
  TB.THEMES.forEach(function (x) { themes[x.id] = true; });
  var orphan = V.filter(function (w) { return !themes[w.th]; });
  t('every word has a real theme', orphan.length === 0,
    orphan.slice(0, 3).map(function (w) { return w.en + '/' + w.th; }).join(','));
  var seen = {}, dup = [];
  V.forEach(function (w) {
    var k = w.en.toLowerCase();
    if (seen[k]) dup.push(w.en); else seen[k] = 1;
  });
  t('no duplicate headwords', dup.length === 0, dup.slice(0, 5).join(','));
  /* a stray Latin letter inside a Tamil or Hindi word is invisible when you
     read it but silently breaks the reader, the voice and the search */
  var mixed = V.filter(function (w) {
    return /[^஀-௿\s.,!?()-]/.test(w.ta) ||
           /[^ऀ-ॿ\s.,!?()-]/.test(w.hi);
  });
  t('no mixed scripts', mixed.length === 0,
    mixed.slice(0, 3).map(function (w) { return w.en; }).join(','));
  t('every word has an English pronunciation',
    V.every(function (w) { return w.enIpa && w.enTa; }));
  t('English sounds are written in Tamil letters',
    V.every(function (w) { return /[஀-௿]/.test(w.enTa); }));
  t('Tamil romanisation generates for all',
    V.every(function (w) { return !!w.taR && !/[஀-௿]/.test(w.taR); }));
  t('themes carry a word count',
    TB.THEMES.every(function (x) { return x.n === undefined || x.n > 0; }));
})();

/* ---------------- Hindi readings ---------------- */
section('HINDI READINGS (roman + Tamil)');
[['करोड़', 'karor', 'கரோர்'],
 ['किताब', 'kitāb', 'கிதாப்'],
 ['सड़क', 'sarak', 'ஸரக்'],
 ['खिड़की', 'khirkī', 'கிர்கீ'],
 ['डॉक्टर', 'ḍākṭar', 'டாக்டர்'],
 ['पाँच', 'pāñc', 'பாஞ்ச்'],
 ['आँख', 'āṅkh', 'ஆங்க்'],
 ['बेटा', 'beṭā', 'பேட்டா'],
 ['ठंडा', 'ṭhaṇḍā', 'டண்டா'],
 ['नमस्ते', 'namaste', 'நமஸ்தே']]
  .forEach(function (row) {
    t('roman ' + row[0], TB.Translit.romanHindi(row[0]) === row[1], TB.Translit.romanHindi(row[0]));
    t('tamil ' + row[0], TB.Translit.hindiToTamilScript(row[0]) === row[2], TB.Translit.hindiToTamilScript(row[0]));
  });
/* nothing anywhere in the app may leak raw Devanagari into a reading */
(function () {
  var all = [];
  TB.VOCAB.forEach(function (v) { all.push(v.hi); });
  TB.LESSONS.forEach(function (u) { u.lines.forEach(function (l) { all.push(l.hi); }); });
  (TB.PHRASES || []).forEach(function (p) { all.push(p.hi); });
  var bad = all.filter(function (h) {
    if (!h || !/[ऀ-ॿ]/.test(h)) return false;
    var r = TB.Translit.romanHindi(h), x = TB.Translit.hindiToTamilScript(h);
    return /[ऀ-ॿ]/.test(r) || /[ऀ-ॿ]/.test(x) || !r.trim() || !x.trim();
  });
  t('every Hindi string reads cleanly', bad.length === 0, bad.length + ' defective');
})();

/* ---------------- reading aloud ---------------- */
section('READING ALOUD');
(function () {
  var rhyme = ['Twinkle twinkle little star',
               'How I wonder what you are',
               'Up above the world so high',
               'Like a diamond in the sky'];
  var prose = ['I go to school every day.',
               'My classes start at 8:00 AM.',
               'I study math, English, and science.',
               'After school I do my homework.'];

  t('a rhyme is recognised as verse', TB.Reader.looksLikeVerse(rhyme));
  t('prose is not', !TB.Reader.looksLikeVerse(prose));
  t('rhyme scheme is AABB', TB.Reader.scheme(rhyme).join('') === 'AABB',
    TB.Reader.scheme(rhyme).join(''));
  t('verse picks the sing-song mode', TB.Reader.modesFor(rhyme).suggested === 'rhyme');
  t('prose picks the reading mode', TB.Reader.modesFor(prose).suggested === 'read');

  /* wrapped lines, as OCR actually returns a paragraph */
  var wrapped = ['I go to school every day.', 'My classes start at 8:00',
                 'AM. I study math,', 'English, and science.',
                 'During break, I eat a', 'snack and play with my',
                 'friends. After school, I go', 'home and do my',
                 'homework. I like school', 'because I learn many',
                 'new things and have fun!'];
  var flow = TB.Reader.reflow(wrapped);
  t('wrapped prose is sewn into sentences', flow.units.length === 6, flow.units.length);
  t('no sentence is left cut in half',
    flow.units.every(function (u) { return /[.!?]$/.test(u); }),
    flow.units.filter(function (u) { return !/[.!?]$/.test(u); }).join(' | '));
  t('the words all survive the sewing',
    flow.units.join(' ').replace(/\s+/g, ' ') === wrapped.join(' ').replace(/\s+/g, ' '));
  t('a fragment is never translated alone',
    flow.units.indexOf('snack and play with my') < 0);
  t('verse is left exactly as written',
    TB.Reader.reflow(rhyme).units.join('|') === rhyme.join('|'));
  t('verse is not reflowed', TB.Reader.reflow(rhyme).isVerse &&
    !TB.Reader.reflow(rhyme).reflowed);
  t('a blank line still separates paragraphs',
    TB.Reader.reflow(['One. Two.', '', 'Three.']).units.length === 4);

  var sung = TB.Reader.plan(rhyme, 'en', 'rhyme', { rate: 0.9, pitch: 1 });
  var spoken = TB.Reader.plan(rhyme, 'en', 'read', { rate: 0.9, pitch: 1 });
  t('every line is spoken once', sung.filter(function (s) { return !s.silent; }).length === 4);
  t('sing-song moves the pitch',
    new Set(sung.map(function (s) { return s.pitch; })).size > 1);
  t('plain reading does not', new Set(spoken.map(function (s) { return s.pitch; })).size === 1);
  t('pitch stays in range the browser accepts',
    sung.every(function (s) { return s.pitch >= 0.1 && s.pitch <= 2; }));
  t('the closing line settles lowest',
    sung[3].pitch === Math.min.apply(null, sung.map(function (s) { return s.pitch; })));
  t('the couplet gets a longer rest', sung[1].pause > sung[0].pause);
  t('slow mode is slower', TB.Reader.plan(prose, 'en', 'slow')[0].rate
    < TB.Reader.plan(prose, 'en', 'read')[0].rate);
  t('spelling gives one letter at a time',
    TB.Reader.plan(['cat'], 'en', 'spell').filter(function (s) { return !s.silent; })
      .map(function (s) { return s.text; }).join('') === 'cat');
  var verses = TB.Reader.plan(['One', 'Two', '', 'Three', 'Four'], 'en', 'rhyme');
  t('a blank line becomes a rest, not a word',
    verses.filter(function (s) { return s.silent; }).length >= 1 &&
    verses.filter(function (s) { return !s.silent; }).length === 4);
  t('every step names its language',
    sung.every(function (s) { return s.lang === 'en'; }));
  t('a Tamil rhyme plans in Tamil',
    TB.Reader.plan(['காகா', 'மாமா'], 'ta', 'rhyme')
      .every(function (s) { return s.lang === 'ta'; }));
})();

/* ---------------- photo text scoring ---------------- */
section('PHOTO TEXT');
(function () {
  /* The wrong language pack does not fail, it returns fluent nonsense. This
     is the measured output of reading English with the Tamil pack. */
  var junk = { text: '1 90 1ோ 861ோ0।1 6 ர. ரர 0ோ5888 60ார்‌ ௭1 8:00 சிரிரி,', confidence: 46 };
  var good = { text: 'I go to school every day. My classes start at 8:00 AM.', confidence: 95 };
  /* Indic writing is largely combining marks and zero-width joiners. Counting
     those as noise once crushed a correct Tamil read to 9 out of 100 at
     confidence 71, so the app warned about its own right answer. */
  var tamil = { text: 'நான்‌ தினமும்‌\nபள்ளிக்கு செல்கிறேன்‌.', confidence: 71 };
  var hindi = { text: 'मैं हर रोज़ विद्यालय जाता हूँ।', confidence: 88 };
  var wrongOnTamil = { text: 'HITEOT )60T(LOLD\nLieTerfl& @& GFF 60H Cm er.', confidence: 9 };
  t('a correct Tamil read is trusted',
    TB.OCR.plausibility(tamil) >= TB.OCR.TRUST, TB.OCR.plausibility(tamil));
  t('a correct Hindi read is trusted',
    TB.OCR.plausibility(hindi) >= TB.OCR.TRUST, TB.OCR.plausibility(hindi));
  t('the wrong pack on a Tamil photo is not',
    TB.OCR.plausibility(wrongOnTamil) < TB.OCR.TRUST, TB.OCR.plausibility(wrongOnTamil));
  t('combining marks count as writing',
    TB.OCR.plausibility(tamil) > TB.OCR.plausibility({ text: tamil.text, confidence: 40 }));
  t('a zero-width joiner is not treated as noise',
    TB.OCR.plausibility({ text: 'நான்‌', confidence: 80 })
      === TB.OCR.plausibility({ text: 'நான்', confidence: 80 }));
  t('every right read outscores every wrong one',
    Math.min(TB.OCR.plausibility(tamil), TB.OCR.plausibility(hindi))
      > Math.max(TB.OCR.plausibility(wrongOnTamil), TB.OCR.plausibility(junk)));

  t('a good read scores above the trust line',
    TB.OCR.plausibility(good) >= TB.OCR.TRUST, TB.OCR.plausibility(good));
  t('nonsense scores below it',
    TB.OCR.plausibility(junk) < TB.OCR.TRUST, TB.OCR.plausibility(junk));
  t('and well below the good one',
    TB.OCR.plausibility(good) - TB.OCR.plausibility(junk) > 25);
  t('empty text scores zero', TB.OCR.plausibility({ text: '', confidence: 90 }) === 0);
  t('every pack maps to a translate language',
    Object.keys(TB.OCR.PACKS).every(function (p) {
      return TB.Translate.LANGS.some(function (l) { return l.c === TB.OCR.PACKS[p].code; });
    }));
  t('every pack has a voice',
    Object.keys(TB.OCR.PACKS).every(function (p) {
      return !!TB.Speech.langTags()[TB.OCR.PACKS[p].code];
    }));
})();

var SAMPLE = { hi: 'मैं स्कूल जाता हूँ',
               te: 'నేను పాఠశాల', kn: 'ನಾನು ಶಾಲೆ',
               ml: 'ഞാൻ സ്കൂളിൽ', bn: 'আমি স্কুলে',
               gu: 'હું શાળાએ', pa: 'ਮੈਂ ਸਕੂਲ' };

/* ---------------- readings for every Indian script ---------------- */
section('READINGS (all Indian scripts)');
(function () {
  /* "I go to school", written in each script, must be sayable by someone who
     reads only English letters or only Tamil ones. */
  [['hi', 'मैं स्कूल जाता हूँ', 'maiṁ skūl jātā hūṁ'],
   ['te', 'నేను', 'nenu'],
   ['kn', 'ನಾನು', 'nānu'],
   ['ml', 'ഞാൻ', 'ñān'],
   ['bn', 'আমি', 'āmi'],
   ['gu', 'હું', 'huṁ'],
   ['pa', 'ਮੈਂ', 'maiṁ']]
    .forEach(function (row) {
      var r = TB.Translit.readings(row[1], row[0]);
      t(row[0] + ' reads in English letters', r.roman === row[2], r.roman);
      t(row[0] + ' reads in Tamil letters',
        !!r.tamil && !/[ऀ-෿]/.test(r.tamil.replace(/[஀-௿]/g, '')), r.tamil);
    });

  /* the m at the start is the म; it is the LAST sound that was wrong */
  t('a word-final nasal is nasalisation, not a labial m',
    /ṁ$/.test(TB.Translit.romanHindi('मैं')),
    TB.Translit.romanHindi('मैं'));
  t('and so is a chandrabindu',
    /ṁ$/.test(TB.Translit.romanHindi('हूँ')),
    TB.Translit.romanHindi('हूँ'));
  t('a nasal before a stop still takes its place',
    TB.Translit.romanHindi('हिंदी') === 'hindī',
    TB.Translit.romanHindi('हिंदी'));
  t('southern short e survives',
    TB.Translit.readings('ಶಾಲೆ', 'kn').roman === 'śāle',
    TB.Translit.readings('ಶಾಲೆ', 'kn').roman);
  t('Malayalam chillu is a bare consonant',
    TB.Translit.readings('ഞാൻ', 'ml').roman === 'ñān');
  t('nothing leaks its own script into the reading',
    ['hi', 'te', 'kn', 'ml', 'bn', 'gu', 'pa'].every(function (l) {
      var r = TB.Translit.readings(SAMPLE[l], l);
      return !/[ऀ-୿ఀ-෿]/.test(r.roman + r.tamil);
    }));
  t('Tamil reads as itself', TB.Translit.readings('நான்', 'ta').roman === 'nāẉ'
    || TB.Translit.readings('நான்', 'ta').roman === 'nāṉ',
    TB.Translit.readings('நான்', 'ta').roman);
  /* English written in Tamil letters must come from the pronunciation, never
     from the spelling: school is ஸ்கூல், not ஸ்சூல் */
  t('English sounds are not spelled out letter by letter',
    TB.Translit.readings('I go to school every day.', 'en').tamil
      === 'ஐ கோ டூ ஸ்கூல் எவரி டே.',
    TB.Translit.readings('I go to school every day.', 'en').tamil);
  t('a rhyme is fully covered',
    !/[A-Za-z]/.test(TB.Translit.readings('Twinkle twinkle little star, how I wonder what you are', 'en').tamil),
    TB.Translit.readings('Twinkle twinkle little star, how I wonder what you are', 'en').tamil);
  t('a plural keeps its s',
    /ஸ்$/.test(TB.Translit.readings('jumps', 'en').tamil),
    TB.Translit.readings('jumps', 'en').tamil);
  t('mostly-unknown English gets no line, not a half one',
    TB.Translit.readings('Xyzzy plugh frobnicate', 'en').tamil === '');
  t('the sound table is all Tamil',
    Object.keys(TB.EN_SOUND_EXTRA).every(function (k) {
      return /^[a-z]+$/.test(k) && /[஀-௿]/.test(TB.EN_SOUND_EXTRA[k])
        && !/[A-Za-z]/.test(TB.EN_SOUND_EXTRA[k]);
    }));

  /* Every English word the app itself shows must be sayable in Tamil
     letters, or an elder reading along hits a word in a script they cannot
     read. Adding English content without a pronunciation fails here. */
  (function () {
    TB.Translit.readings('x', 'en');
    var idx = TB.Translit.EN_SOUND, miss = {};
    function scan(str) {
      String(str || '').split(/([^A-Za-z']+)/).forEach(function (w) {
        if (!/^[A-Za-z]+$/.test(w)) return;
        var k = w.toLowerCase();
        if (!idx[k] && !(k.slice(-1) === 's' && idx[k.slice(0, -1)])) miss[k] = 1;
      });
    }
    TB.LESSONS.forEach(function (u) { u.lines.forEach(function (l) { scan(l.en); }); });
    TB.PHRASES.forEach(function (p) { scan(p.en); });
    TB.VOCAB.forEach(function (v) { scan(v.en); });
    var list = Object.keys(miss);
    t('every English word in the app can be sounded out in Tamil',
      list.length === 0, list.slice(0, 8).join(' '));
  })();

  /* A reading exists so that someone who cannot read the script can say the
     word. A single character of the original leaking through defeats that,
     so every script is swept with real sentences. */
  (function () {
    var SWEEP = {
      hi: ['मैं हर रोज़ विद्यालय जाता हूँ।', 'करोड़ रुपये', 'अंग्रेज़ी पढ़ना'],
      bn: ['আমি প্রতিদিন স্কুলে যাই।', 'ড় ঢ় য়'],
      gu: ['હું દરરોજ શાળાએ જાઉં છું.'],
      pa: ['ਮੈਂ ਹਰ ਰੋਜ਼ ਸਕੂਲ ਜਾਂਦਾ ਹਾਂ।', 'ਇੱਕ ਕਰੋੜ'],
      or: ['ମୁଁ ପ୍ରତିଦିନ ବିଦ୍ୟାଳୟ ଯାଏ।'],
      te: ['నేను ప్రతిరోజూ పాఠశాలకు వెళ్తాను.'],
      kn: ['ನಾನು ಪ್ರತಿದಿನ ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.'],
      ml: ['ഞാൻ എല്ലാ ദിവസവും സ്കൂളിൽ പോകുന്നു.', 'എന്റെ പേര്']
    };
    var leaks = [];
    Object.keys(SWEEP).forEach(function (l) {
      SWEEP[l].forEach(function (x) {
        var r = TB.Translit.readings(x, l);
        if (!r.can) { leaks.push(l + ':unreadable'); return; }
        if (/[ऀ-୿ఀ-෿]/.test(r.roman + r.tamil)) leaks.push(l + ':' + x.slice(0, 10));
      });
    });
    t('no script leaks into its own reading', leaks.length === 0, leaks.join(' '));
  })();

  /* क़ can be written as one character or as two. Both are real, and both
     must read the same, or the same word reads differently depending on
     which keyboard typed it. */
  t('precomposed and decomposed nukta read alike',
    TB.Translit.romanHindi('क़लम ख़ुशी ग़लत फ़ोन')
      === TB.Translit.romanHindi('क़लम ख़ुशी ग़लत फ़ोन'),
    TB.Translit.romanHindi('क़लम'));
  t('and they read correctly',
    TB.Translit.romanHindi('क़लम') === 'qalam',
    TB.Translit.romanHindi('क़लम'));
  t('Gurmukhi addak doubles the consonant it precedes',
    TB.Translit.readings('ਇੱਕ', 'pa').roman === 'ikk',
    TB.Translit.readings('ਇੱਕ', 'pa').roman);

  t('a script it cannot sound out says so, rather than guessing',
    TB.Translit.readings('你好', 'zh-CN').can === false);
})();

/* ---------------- voices ---------------- */
section('VOICES');
(function () {
  var tags = TB.Speech.langTags();
  var codes = TB.Translate.LANGS.filter(function (l) { return l.c !== 'auto'; });
  var missing = codes.filter(function (l) { return !tags[l.c]; });
  t('every translate language has voice tags', missing.length === 0,
    missing.map(function (l) { return l.c; }).join(','));
  t('study languages lead with the Indian accent',
    tags.ta[0] === 'ta-IN' && tags.hi[0] === 'hi-IN' && tags.en[0] === 'en-IN');
})();

/* ---------------- conjugation ---------------- */
section('CONJUGATION');
(function () {
  var kar = TB.Conjugate.hindi('करना', 'm');
  var jaa = TB.Conjugate.hindi('जाना', 'm');
  var past = kar.tenses.filter(function (x) { return x.id === 'past'; })[0];
  var jpast = jaa.tenses.filter(function (x) { return x.id === 'past'; })[0];
  t('transitive verb takes the ergative', past.rows[0].pron === 'मैंने');
  t('ergative freezes the verb',
    past.rows.every(function (r) { return r.form === past.rows[0].form; }));
  t('intransitive verb never takes it', jpast.rows[0].pron === 'मैं');
  t('intransitive still agrees', jpast.rows[0].form !== jpast.rows[4].form);
  var forms = 0, broken = 0;
  TB.Conjugate.COMMON_HI.forEach(function (v) {
    ['m', 'f'].forEach(function (g) {
      var c = TB.Conjugate.hindi(v, g);
      c.tenses.forEach(function (x) { x.rows.forEach(function (r) {
        forms++; if (!r.form || !r.pron) broken++;
      }); });
    });
  });
  t('all Hindi forms generate (' + forms + ')', broken === 0, broken + ' broken');
  var e = TB.Conjugate.english('go', 'she');
  t('English irregular past', e.forms.past === 'went' && e.forms.participle === 'gone');
  t('English consonant doubling', TB.Conjugate.enForms('sit').ing === 'sitting');
  t('English -y to -ies', TB.Conjugate.enForms('study').third === 'studies');
  t('English has 12 tenses', e.tenses.length === 12);
})();

/* ---------------- numbers ---------------- */
section('NUMBERS');
[[15, 'பதினைந்து'],
 [1000, 'ஆயிரம்'],
 [5000, 'ஐயாயிரம்'],
 [100000, 'ஒரு லட்சம்']]
  .forEach(function (row) { t('tamil ' + row[0], TB.Numbers.ta(row[0]) === row[1], TB.Numbers.ta(row[0])); });
t('lakh not hundred-thousand', TB.Numbers.describe(100000).enIndian === 'one lakh');
t('both systems shown', TB.Numbers.describe(100000).en === 'one hundred thousand');
t('indian digit grouping', TB.Numbers.indianGroups(1234567) === '12,34,567');

/* ---------------- phrasebook ---------------- */
section('PHRASEBOOK');
t('phrases present', TB.PHRASES.length >= 200, TB.PHRASES.length);
t('every phrase is trilingual', TB.PHRASES.every(function (p) { return p.en && p.hi && p.ta; }));
t('every phrase has a known group',
  TB.PHRASES.every(function (p) { return TB.PHRASE_GROUPS.some(function (g) { return g.id === p.g; }); }));

/* ---------------- transliteration ---------------- */
section('TRANSLITERATION');
[['vanakkam','வணக்கம்'],['poonai','பூனை'],['amma','அம்மா'],['thamizh','தமிழ்'],
 ['nandri','நன்றி'],['thanneer','தண்ணீர்'],['puthagam','புத்தகம்']]
  .forEach(([i, o]) => t('ta ' + i, TB.Translit.toTamil(i) === o, TB.Translit.toTamil(i)));
[['namaste','नमस्ते'],['dhanyavaad','धन्यवाद'],['kitaab','किताब'],['paani','पानी'],['ghar','घर']]
  .forEach(([i, o]) => t('hi ' + i, TB.Translit.toHindi(i) === o, TB.Translit.toHindi(i)));
t('roman வணக்கம்', TB.Translit.romanTamil('வணக்கம்') === 'vaṇakkam');
t('roman किताब', TB.Translit.romanHindi('किताब') === 'kitāb');

/* ---------------- sentence analysis ---------------- */
section('ANALYSIS');
[['She is reading a book.','present continuous'],
 ['Where are you going?','present continuous'],
 ['I have not finished my work.','present perfect'],
 ['Did you see the movie?','past simple'],
 ['I will go to the market tomorrow.','future simple'],
 ['He had been waiting for an hour.','past perfect continuous'],
 ['They have been working since morning.','present perfect continuous'],
 ['The book was written by her.','past passive'],
 ['She goes to school.','present simple'],
 ['वह किताब पढ़ रही है।','continuous'],
 ['मैं कल बाज़ार गया।','past perfective'],
 ['मैं रोज़ स्कूल जाता हूँ।','present habitual'],
 ['वह अंग्रेज़ी सीखेगी।','future'],
 ['நான் பள்ளிக்குச் செல்கிறேன்.','present'],
 ['அவள் புத்தகம் படித்தாள்.','past'],
 ['நான் நாளை வருவேன்.','future']]
  .forEach(([s, exp]) => {
    const a = TB.Tutor.analyze(s);
    t('tense: ' + s.slice(0, 34), a.tense.en === exp, a.tense.en);
  });
t('imperative detected', TB.Tutor.analyze('Open the door.').type.en === 'imperative');
t('wh-question detected', TB.Tutor.analyze('Where are you going?').type.en === 'wh-question');
t('negative detected', TB.Tutor.analyze('I have not finished.').type.en.includes('negative'));
const svo = TB.Tutor.analyze('I have not finished my work.').svo;
t('SVO split', svo.subjectText === 'I' && svo.verbText === 'have not finished' && svo.objectText === 'my work');

/* ---------------- grammar + spelling ---------------- */
section('CHECKER');
[['he go to school every day','He goes to school every day.'],
 ['she will goes tomorrow','She will go tomorrow.'],
 ['i am a enginer','I am an engineer.'],
 ['I have two book.','I have two books.'],
 ['i want to lern english','I want to learn English.'],
 ["he dont know the the answer","He don't know the answer."],
 ['my name is kumar','My name is kumar.'],
 ['my friend priya is a teacher','My friend priya is a teacher.'],
 ['i recieve a letter','I receive a letter.'],
 ['ramesh and lakshmi went to chennai','Ramesh and lakshmi went to Chennai.'],
 ['They is my friend.','They are my friend.'],
 ['She is reading a book.','She is reading a book.'],
 ['my mother cook food every day','My mother cooks food every day.'],
 ['the boy played in the garden','The boy played in the garden.']]
  .forEach(([i, o]) => {
    const r = TB.Check.check(i);
    t('fix: ' + i.slice(0, 34), r.corrected === o, r.corrected);
  });
t('names are never rewritten', TB.Check.suggest('kumar').length === 0 && TB.Check.suggest('priya').length === 0);
t('real typos are caught', TB.Check.suggest('lern')[0] === 'learn');

/* ---------------- dictionary (offline) ---------------- */
section('DICTIONARY (offline)');
(async () => {
  for (const [q, exp] of [['cat','பூனை'],['poonai','பூனை'],['naai','நாய்'],['yaanai','யானை'],
                          ['vanakkam','வணக்கம்'],['book','புத்தகம்'],['seven','ஏழு'],
                          ['பூனை','cat'],['நாய்','dog'],['नमस्ते','hello'],['बिल्ली','cat']]) {
    const c = await TB.Dict.lookup(q);
    t('lookup ' + q, c.translations.ta === exp || c.translations.en === exp,
      JSON.stringify(c.translations));
  }

  /* ---------------- spaced repetition ---------------- */
  section('SRS');
  let card = TB.SRS.rate(null, 2);
  t('first good review schedules 1 day', card.interval === 1);
  card = TB.SRS.rate(card, 2);
  t('second review grows', card.interval >= 3);
  card = TB.SRS.rate(card, 0);
  t('forgetting resets and is due now', card.interval === 0 && TB.SRS.isDue(card));
  t('queue respects the limit', TB.SRS.queue({}, TB.VOCAB, 20).length === 20);

  /* ---------------- accounts ---------------- */
  section('ACCOUNTS');
  try {
    const u = await TB.Auth.signUp('Kumara', 'kumara@test.com', 'tamil2024');
    t('signup succeeds', !!u.id && !!u.hash);
    t('password is not stored', JSON.stringify(u).indexOf('tamil2024') < 0);
    t('hash is PBKDF2', u.kdf === 'pbkdf2' && u.hash.length === 64);
    let threw = false;
    try { await TB.Auth.signUp('X', 'kumara@test.com', 'tamil2024'); } catch (e) { threw = true; }
    t('duplicate signup rejected', threw);
    threw = false;
    try { await TB.Auth.signIn('kumara@test.com', 'wrongpass1'); } catch (e) { threw = true; }
    t('wrong password rejected', threw);
    const back = await TB.Auth.signIn('kumara@test.com', 'tamil2024');
    t('signin succeeds', back.id === u.id);
    const p = await TB.Auth.signUp('Phone', '9876543210', 'tamil2024');
    t('phone signup works', p.phone === '9876543210');
    t('weak password rejected', !!TB.Auth.passwordIssue('abc'));

    /* history + export */
    TB.Store.addHistory(u.id, { type: 'translate', from: 'en', to: 'ta', src: 'cat', out: 'பூனை' });
    const d = TB.Store.data(u.id);
    t('history recorded', d.history.length === 1 && d.history[0].src === 'cat');
    t('export round-trips', JSON.parse(TB.Store.exportAll(u.id)).data.history.length === 1);
  } catch (e) {
    fail++; console.log('  FAIL  accounts threw: ' + e.message);
  }

  console.log('\n' + '='.repeat(46));
  console.log('  PASS ' + pass + '   FAIL ' + fail);
  console.log('='.repeat(46));
  process.exit(fail ? 1 : 0);
})();
