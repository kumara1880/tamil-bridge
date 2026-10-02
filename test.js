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
/* Voices, because missing(lang) now means "nothing here speaks it" — which
   with an empty list is true of every language, and would send every test
   down the network path instead of through the engine. */
ctx.speechSynthesis = {
  getVoices: () => ([
    { name: 'Test Valluvar', lang: 'ta-IN', localService: true },
    { name: 'Test Hazel',    lang: 'en-IN', localService: true },
    { name: 'Test George',   lang: 'en-GB', localService: true },
    { name: 'Test Kalpana',  lang: 'hi-IN', localService: true }
  ]),
  speak() {}, cancel() {}, addEventListener() {} };
ctx.document = { addEventListener() {}, head: { appendChild() {} }, createElement: () => ({}) };
vm.createContext(ctx);

['data/vocab.js','data/vocab2.js','data/ensound.js','data/alphabet.js','data/phonics.js','data/lessons.js','data/lessons2.js',
 'data/phrases.js','data/lexicon.js','data/grammar.js','data/grammar_hi.js','data/grammar_ta.js',
 'data/wordpairs.js','data/wordpairs2.js','data/wordpairs3.js','data/wordpairs4.js',
 'data/modern.js','data/spoken.js','data/grammar.js','data/grammar_hi.js',
 'data/wordpairs.js','data/wordpairs2.js','data/wordpairs3.js','data/wordpairs4.js','data/spoken.js',
 'js/store.js','js/auth.js','js/speech.js','js/translit.js','js/vocabx.js','js/translate.js',
 'js/reader.js',
 'js/tutor.js','js/check.js','js/ocr.js','js/dict.js','js/srs.js','js/numbers.js','js/conjugate.js',
 'js/maths.js','js/abacus.js','js/maths2.js','js/writing.js','js/sentences.js','js/search.js']
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

    /* A typeface may paint outside the width it reports, and the Indic ones
       do. Laid out on the advance alone the arithmetic said the last copy
       fitted, the glyph was painted wider than promised, and the sheet's own
       overflow:hidden cut it in half — which is what अ looked like. */
    var painted = [];
    var overhangs = {
      font: '', fillStyle: '', textBaseline: '',
      measureText: function () {
        return { width: 100, actualBoundingBoxAscent: 70, actualBoundingBoxDescent: 20,
                 actualBoundingBoxLeft: 0, actualBoundingBoxRight: 160 };
      },
      fillText: function (t, x) { painted.push(x); }
    };
    W.drawGhost(overhangs, 'X', 'en', 600, 200, 1, '#000', true);
    t('a glyph that paints wider than it claims still fits the sheet',
      painted.length > 0 && painted[painted.length - 1] + 160 <= 600 - 22 + 0.5,
      'ink ends at ' + (painted[painted.length - 1] + 160) + ', sheet at ' + (600 - 22));
    t('and the row is spaced on the ink, not on the claim',
      painted.length < 2 || (painted[1] - painted[0]) >= 160,
      painted.length + ' copies, step ' + (painted[1] - painted[0]));
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
  [['English', TB.GRAMMAR], ['Hindi', TB.GRAMMAR_HI],
   ['Tamil', TB.GRAMMAR_TA]].forEach(function (pair) {
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

  /* The app is named after Tamil; it may not be the one language with no
     grammar of its own. */
  t('Tamil grammar exists at all', (TB.GRAMMAR_TA || []).length >= 16,
    (TB.GRAMMAR_TA || []).length);
  t('and covers what a learner and a Tamil child both need',
    ['ta-order', 'ta-case', 'ta-person', 'ta-tense', 'ta-negative', 'ta-question',
     'ta-thinai', 'ta-pulli', 'ta-uyirmei', 'ta-spoken'].every(function (id) {
      return TB.GRAMMAR_TA.some(function (g) { return g.id === id; });
    }));
  /* Every Tamil example must actually be in Tamil, and every Hindi one in
     Hindi \u2014 a rule about \u0b95\u0bc1\u0bb1\u0bcd\u0bb1\u0bbf\u0baf\u0bb2\u0bcd written in Devanagari helps nobody. */
  t('every Tamil rule and example is written in Tamil script',
    TB.GRAMMAR_TA.every(function (g) {
      return /[\u0b80-\u0bff]/.test(g.rule.ta) && /[\u0b80-\u0bff]/.test(g.title.ta)
        && g.examples.every(function (e) { return /[\u0b80-\u0bff]/.test(e.ta); });
    }));
  t('and every Hindi one in Devanagari',
    TB.GRAMMAR_TA.every(function (g) {
      return /[\u0900-\u097f]/.test(g.rule.hi)
        && g.examples.every(function (e) { return /[\u0900-\u097f]/.test(e.hi); });
    }));
  /* Tamil text must be Tamil, not another Brahmic script that looks close
     enough at a glance. */
  t('no Malayalam, Telugu or Kannada has crept into the Tamil',
    !/[\u0c00-\u0d7f]/.test(JSON.stringify(TB.GRAMMAR_TA)));
  t('the mistakes are real mistakes, not the right answer twice',
    TB.GRAMMAR_TA.every(function (g) { return g.mistake.wrong !== g.mistake.right; }));

  /* A word list is only worth having if every word in it is in the right
     script. A Hindi synonym sitting in a Tamil list is not a small mistake:
     it is the app teaching the wrong word. */
  var TAMIL = /[\u0b80-\u0bff]/, DEVA = /[\u0900-\u097f]/;
  [['English', TB.WORDPAIRS, 'en'], ['Hindi', TB.WORDPAIRS_HI, 'hi'], ['Tamil', TB.WORDPAIRS_TA, 'ta']]
    .forEach(function (row) {
      var name = row[0], set = row[1], lang = row[2];
      var bad = [];
      set.forEach(function (w) {
        var all = [w[lang]].concat(w.syn).concat(w.ant);
        all.forEach(function (x) {
          if (lang === 'ta' && (!TAMIL.test(x) || DEVA.test(x))) bad.push(x);
          if (lang === 'hi' && (!DEVA.test(x) || TAMIL.test(x))) bad.push(x);
          if (lang === 'en' && !/[A-Za-z]/.test(x)) bad.push(x);
        });
        if (w.ta && DEVA.test(w.ta)) bad.push(w.ta);
        if (w.hi && TAMIL.test(w.hi)) bad.push(w.hi);
        if (w.ex) {
          if (!TAMIL.test(w.ex.ta) || DEVA.test(w.ex.ta)) bad.push(w.ex.ta);
          if (!DEVA.test(w.ex.hi) || TAMIL.test(w.ex.hi)) bad.push(w.ex.hi);
        }
      });
      t(name + ' words, synonyms, opposites and examples are all in the right script',
        bad.length === 0, bad.slice(0, 3).join(' | '));

      var heads = set.map(function (w) { return w[lang]; });
      t(name + ' lists no word twice',
        new Set(heads).size === heads.length,
        heads.filter(function (h, i) { return heads.indexOf(h) !== i; }).slice(0, 3).join(', '));
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

  /* The count shown in the app must be the count that is really there. A
     cluster of n synonyms holds n(n-1)/2 synonym pairs and n x m opposites;
     that is the number the page prints, and it is counted, never claimed. */
  function relations(list, lang) {
    var syn = 0, ant = 0;
    list.forEach(function (w) {
      var n = w.syn.length + 1;
      syn += n * (n - 1) / 2;
      ant += n * w.ant.length;
    });
    return { syn: syn, ant: ant, total: syn + ant };
  }
  var all = relations(TB.WORDPAIRS, 'en').total
          + relations(TB.WORDPAIRS_HI, 'hi').total
          + relations(TB.WORDPAIRS_TA, 'ta').total;
  t('the three languages hold thousands of pairs between them',
    all > 4000, all.toLocaleString('en-IN') + ' pairs');
  t('English alone holds over two thousand',
    relations(TB.WORDPAIRS, 'en').total > 2000,
    relations(TB.WORDPAIRS, 'en').total.toLocaleString('en-IN'));
  t('and the page counts them rather than claiming a number', (function () {
    var fs = require('fs');
    var src = fs.readFileSync(__dirname + '/js/views8.js', 'utf8');
    return /function relations/.test(src) && /r\.syn\.toLocaleString/.test(src);
  })());

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
  /* The home page used to offer eleven of the twenty-four sections, and the
     rest could only be found by reading a flat list in a drawer — which is
     exactly how the synonyms stayed hidden. Every section must be reachable
     from home now, and this test is here to keep it that way. */
  (function () {
    var routes = (app.match(/var ROUTES = \{[\s\S]*?\};/) || [''])[0];
    var names = (routes.match(/(\w+):/g) || []).map(function (x) { return x.slice(0, -1); })
      .filter(function (n) { return n !== 'home' && n !== 'ROUTES'; });
    var missing = names.filter(function (n) { return home.indexOf("'#/" + n) < 0; });
    t('every section is reachable from the home page', missing.length === 0, missing.join(', '));
  })();

  /* A link into a tab must open that tab. */
  t('the section reads the address', /function startTab/.test(v8)
    && /mount: function \(root, param\)/.test(v8)
    && /html: function \(param\)/.test(v8));
  t('and tapping a tab updates the address', /history\.replaceState/.test(v8));
  t('the router passes the address on to the view',
    /v\.mount\(root, r\.param\)/.test(app) && /v\.html\(r\.param\)/.test(app));
  t('the highlight follows the whole address, not just the section',
    /a === exact/.test(app));

  /* Earlier builds wrote dark into everybody’s preferences uninvited, so the
     screen starts light while the stored value says dark. A toggle that
     reads the stored value then sets it to the colour it already is, and
     the first tap does nothing. */
  t('the theme toggle follows what is on the screen, not what is stored',
    /getAttribute\('data-theme'\) === 'dark' \? 'dark' : 'light'/.test(app));
  t('and it still records that a choice was made',
    /themeChosen = true/.test(app));

  /* One handler on the lasting element, not one per redraw, or a word gets
     spoken once for every time you have visited the tab. */
  t('speaking handlers do not stack up on redraw',
    (v8.match(/body\.addEventListener\('click'/g) || []).length === 1
      && /function onBody/.test(v8));
})();

/* ---------------- the views all load ---------------- */
section('VIEWS LOAD');
(function () {
  var fs = require('fs'), vm = require('vm');

  /* Load them exactly as index.html does, in the same order. */
  var files = (fs.readFileSync(__dirname + '/index.html', 'utf8')
    .match(/<script src="(js\/views[^"?]*)/g) || [])
    .map(function (m) { return m.replace('<script src="', ''); });
  t('the page loads a set of view files', files.length >= 8, files.join(' '));

  var v = {};
  v.window = v;
  v.console = { log: function () {}, warn: function () {}, error: function () {} };
  v.navigator = { onLine: false, language: 'en' };
  v.location = { hash: '#/home', search: '', pathname: '/' };
  v.setTimeout = setTimeout; v.clearTimeout = clearTimeout;
  v.setInterval = function () {}; v.requestAnimationFrame = function () {};
  v.localStorage = ctx.localStorage;
  v.crypto = ctx.crypto;
  v.fetch = function () { return Promise.reject(new Error('offline')); };
  v.URLSearchParams = URLSearchParams;
  v.Intl = Intl;

  /* Enough of a document that a file can look things up while loading. */
  function el() {
    return {
      style: {}, classList: { add: function () {}, remove: function () {}, toggle: function () {} },
      addEventListener: function () {}, appendChild: function () {},
      querySelector: function () { return el(); },
      querySelectorAll: function () { return []; },
      setAttribute: function () {}, getAttribute: function () { return null; },
      focus: function () {}, textContent: '', innerHTML: '', value: ''
    };
  }
  v.document = {
    addEventListener: function () {}, head: el(), body: el(),
    createElement: function () { return el(); },
    getElementById: function () { return el(); },
    querySelector: function () { return el(); },
    querySelectorAll: function () { return []; },
    documentElement: el()
  };
  vm.createContext(v);

  /* the data and libraries the views expect to already be there */
  ['data/vocab.js','data/vocab2.js','data/ensound.js','data/alphabet.js','data/phonics.js',
   'data/lessons.js','data/lessons2.js','data/phrases.js','data/lexicon.js','data/grammar.js',
   'data/grammar_hi.js','data/grammar_ta.js','data/wordpairs.js','data/wordpairs2.js',
   'data/wordpairs3.js','data/wordpairs4.js','data/modern.js','data/spoken.js',
   'js/store.js','js/auth.js','js/speech.js','js/translit.js','js/vocabx.js','js/translate.js',
   'js/reader.js','js/tutor.js','js/check.js','js/ocr.js','js/dict.js','js/srs.js',
   'js/numbers.js','js/conjugate.js','js/maths.js','js/writing.js','js/sentences.js',
   'js/sync.js','js/search.js']
    .forEach(function (f) {
      try { vm.runInContext(fs.readFileSync(R + f, 'utf8'), v, { filename: f }); } catch (e) {}
    });

  var broke = [];
  files.forEach(function (f) {
    try { vm.runInContext(fs.readFileSync(R + f, 'utf8'), v, { filename: f }); }
    catch (e) { broke.push(f + ': ' + e.message); }
  });
  t('every view file loads without throwing', broke.length === 0, broke.join(' | '));

  /* And the router must find a view behind every address it accepts. */
  var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
  var routes = (app.match(/var ROUTES = \{[\s\S]*?\};/) || [''])[0];
  var names = (routes.match(/(\w+):/g) || []).map(function (x) { return x.slice(0, -1); });
  var missing = names.filter(function (n) { return !(v.TB && v.TB.Views && v.TB.Views[n]); });
  t('every route in the router has a view behind it', missing.length === 0, missing.join(', '));


  /* ---------------- one number, three voices ----------------
     The chart named every number in English, Tamil and Hindi, and reading
     one aloud said the Tamil and nothing else \u2014 so the two names a Tamil
     speaker is here to learn were the two you could not hear. */
  (function () {
    var V = v.TB && v.TB.Views;
    t('there is a way to say one thing in all three',
      typeof (V && V.sayAllThree) === 'function');
    if (!V || typeof V.sayAllThree !== 'function') return;

    function ask(en, ta, hi) {
      var got = null, real = v.TB.Speech.sequence;
      v.TB.Speech.sequence = function (steps, opts) {
        got = { steps: steps, opts: opts };
        return { then: function (ok) { try { ok(true); } catch (e) {} return { then: function () {} }; } };
      };
      try { V.sayAllThree(en, ta, hi, null); } catch (e) { got = { err: e.message }; }
      v.TB.Speech.sequence = real;
      return got;
    }

    var r = ask('seventeen', '\u0baa\u0ba4\u0bbf\u0ba9\u0bc7\u0bb4\u0bc1', '\u0938\u0924\u094d\u0930\u0939');
    t('it speaks without throwing', r && !r.err, r && r.err);
    t('and says all three', r && r.steps && r.steps.length === 3,
      r && r.steps && r.steps.length);
    /* The order the page prints them in, so the voice and the page agree. */
    t('in the order the chart shows them',
      r && r.steps.map(function (s) { return s.lang; }).join(',') === 'en,ta,hi');
    t('slowly enough to copy',
      r && r.steps.every(function (s) { return s.rate > 0 && s.rate <= 0.85; }));
    t('with a gap between them, not running together',
      r && r.opts && r.opts.pause >= 250, r && r.opts && r.opts.pause);
    /* The chart must be able to light the line it is reading. */
    t('and it reports which one it is on', r && typeof r.opts.onStep === 'function');

    /* An empty utterance hangs the speech queue on some browsers, so a
       missing name is dropped rather than spoken. */
    var e2 = ask('two', '', '\u0926\u094b');
    t('nothing empty is ever spoken', e2 && e2.steps.length === 2,
      e2 && e2.steps.length);
  })();

  /* The helpers the views share with each other. */
  ['esc', 'speakBtn', 'readAid', 'D', 'saveD'].forEach(function (k) {
    t('the shared helper ' + k + ' survives', !!(v.TB && v.TB.Views && v.TB.Views[k]));
  });
})();

/* ---------------- signing in ---------------- */
section('SIGNING IN');
(function () {
  var fs = require('fs');
  var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
  var sync = fs.readFileSync(__dirname + '/js/sync.js', 'utf8');
  var srv = fs.readFileSync(__dirname + '/server/index.js', 'utf8');
  var css = fs.readFileSync(__dirname + '/assets/styles.css', 'utf8');

  /* One job per screen. Two tabs side by side asked a question before the
     person had answered the one they came for. */
  t('the sign-in tabs are gone', !/id="tabIn"/.test(html) && !/tabIn/.test(app));
  t('and the other choice sits below a divider instead',
    /id="swapBtn"/.test(html) && /auth-divider/.test(css));
  t('one card is shown at a time', /function show\(which\)/.test(app));

  /* The thing asked for four times. */
  t('there is a way out of a forgotten password', /id="forgotLink"/.test(html));
  t('a card to ask for the link', /id="forgotCard"/.test(html));
  t('and a card to choose the new one', /id="resetCard"/.test(html));
  t('a link from the email is picked up from the address',
    /qs\.get\('reset'\)/.test(app));
  /* And taken straight back out of it. A reset token has no business in
     browser history or a bookmark, and while it is there every reload —
     including the one after signing out — drops the person back on the
     reset card when they wanted to leave it. */
  t('and taken out of the address bar at once',
    /qs\.delete\('reset'\)/.test(app) && /history\.replaceState/.test(app));
  t('so restoring a session is decided by a flag, not by the address',
    /var resetting = resetPending/.test(app) && /resetPending = true/.test(app));
  /* The app no longer holds anybody at the door, so this is no longer a race
     between a session and a token: choosing a new password is simply the one
     thing that takes the screen before the app opens. */
  t('a reset link still takes the screen first',
    /if \(resetting\) \{/.test(app) && /resetPending = true/.test(app));
  t('and the new-password box takes the focus', /fNewPw.*focus|np\.focus/.test(app));
  /* And afterwards it asks for the new password, rather than walking into
     the account. Otherwise you never learn whether the password you just
     chose works, and whoever opened the link is inside the account on a
     machine that may not be theirs. */
  t('a finished reset ends every session on the device',
    /TB\.Auth\.signOut\(\);[\s\S]{0,40}TB\.Sync\.clear\(\)/.test(app));
  t('and asks you to sign in with the password you just chose',
    /Please sign in with it now/.test(app));
  t('with the address filled in and the password box empty',
    /id\.value = \(remoteUser && remoteUser\.email\)/.test(app));
  t('and the reset is marked finished', /resetPending = false/.test(app));

  t('the client can ask for a reset', /forgot: function/.test(sync));
  /* req() is what turns the body into JSON. Handing it a string encodes it
     twice, and the server then receives a JSON string containing JSON and
     pulls undefined out of it. Four methods were written that way and every
     one of them was broken from the start — invisible to a curl test,
     because curl sends the body it is given rather than the body the app
     builds. */
  t('no request hands req() an already-encoded body',
    !/body: JSON\.stringify/.test(sync),
    (sync.match(/.*body: JSON\.stringify.*/g) || []).slice(0, 2).join(' | '));
  t('and req() refuses one loudly if it ever happens again',
    /takes an object as its body, not a string/.test(sync));
  /* A free server sleeps, and the request that wakes it is often dropped.
     “Failed to fetch” tells a person nothing. */
  t('a dropped request is tried once more', /setTimeout\(r, 2500\)/.test(sync));
  t('and the failure says what is actually happening',
    /may be waking up/.test(sync) && /please try once more/.test(sync));
  t('and can set the new password', /reset: function/.test(sync));
  t('the server has somewhere to ask', /\/api\/auth\/forgot/.test(srv));
  t('and somewhere to set it', /\/api\/auth\/reset/.test(srv));

  /* Security properties that matter more than the feature itself. */
  t('only a hash of the reset token is stored, never the token',
    /createHash\('sha256'\)/.test(srv) && /resetHash/.test(srv));
  t('a reset link expires', /resetAt/.test(srv));
  t('the token is single use',
    /resetHash: null/.test(srv));
  t('the reply never says whether an address is registered',
    /Same answer whether or not the account exists/.test(srv));
  t('asking for a reset is rate limited',
    /forgot', rateLimit/.test(srv));
  t('the new password must still pass the rules',
    /needs at least 8 characters/.test(srv));

  /* The lie this whole thing started from: somebody whose account had been
     thrown away by a restart was told their password was wrong. */
  t('the screen asks the server what it can actually do',
    /TB\.Sync\.health\(\)/.test(app) && /serverCan/.test(app));
  t('and says so plainly when the server cannot keep accounts',
    /This device only, for now/.test(app));
  t('a failed sign-in does not blame the person when the server lost the account',
    /This is very likely not your mistake/.test(app));
  /* The server answers a failed sign-in identically whether the account is
     unknown or the password is wrong, on purpose. So the browser cannot
     know which it was \u2014 and it used to announce one of them as fact,
     telling people to create an account that already existed, which the
     signup screen then refused. A loop with no way out, built out of a
     sentence that claimed to know more than it had been told. */
  t('the browser does not claim to know why a sign-in failed',
    !/not on the server, and not in this browser either/.test(app));
  t('it says plainly that it could be either',
    /Either there is no account with this address, or that password/.test(app));
  t('and the server really does answer the two the same way',
    /Same message either way/.test(srv)
    && (srv.match(/Incorrect email address or password/g) || []).length >= 1);
  /* A dead end that says "sign in instead" and a sign-in that says "create
     an account instead" needs a door in it somewhere. */
  t('every dead end carries the way out of it',
    (app.match(/data-auth-act="reset"/g) || []).length >= 2
    && /data-auth-act="in"/.test(app) && /data-auth-act="up"/.test(app));
  t('and the buttons are wired to something',
    /closest\('\[data-auth-act\]'\)/.test(app));
  /* One screenshot showed a fresh address sitting under "already
     registered", which was about the address typed before it. */
  t('an error from the last attempt clears when the form is edited',
    /\['fId', 'fPw', 'fName'\]\.forEach/.test(app) && /msg\.innerHTML = ''/.test(app));
  t('the server says in its health whether it can send mail at all',
    /mail: MAIL_STATE\.ready/.test(srv) && /canReset/.test(srv));
  t('and refuses honestly rather than pretending, when it cannot',
    /cannot send email yet/.test(srv) && /cannot keep accounts yet/.test(srv));

  /* An account made with a phone number had no way back in at all: a reset
     works by sending a link, and there was nowhere to send it. Forgetting
     the password meant losing everything, for ever. Sending an SMS costs
     money and this app does not, so the answer is to let somebody add an
     email to an account they are already signed into. */
  t('an email can be added to an account', /\/api\/account\/email/.test(srv));
  t('and the password is required to do it',
    /set email[\s\S]{0,40}|account\/email/.test(srv)
      && /nothing was changed/.test(srv));
  t('it must actually be an email address',
    /does not look like an email address/.test(srv));
  t('and it cannot be one somebody else is using',
    /already uses that email address/.test(srv));
  t('adding an email is rate limited', /account\/email', auth, rateLimit/.test(srv));
  t('the client can set it', /setEmail: function \(password, email\)/.test(sync));

  (function () {
    var v2 = fs.readFileSync(__dirname + '/js/views2.js', 'utf8');
    t('Settings has somewhere to add one', /id="sRecEmail"/.test(v2));
    t('and says plainly when there is no way back in',
      /There is no way back into this account/.test(v2));
    t('and says where the link will go once there is',
      /a reset link goes to/.test(v2));
  })();

  /* Better than warning about a number is not accepting one. A reset goes
     by email, so an account made with a number could never be recovered,
     and an account nobody can get back into is worse than no account. */
  t('a new account needs an email address', /Enter a valid email address\./.test(srv));
  t('a number is refused, with the reason',
    /could never be recovered/.test(srv) && /isPhone\(identifier\)/.test(srv));
  t('the client refuses it before the server has to', /isPhone\(id\)/.test(app)
      && /no way back in if you forget it/.test(app));
  t('the sign-in field asks for an email', (function () {
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    return /<label for="fId">Email address<\/label>/.test(html)
        && /id="fId" type="email"/.test(html);
  })());
  /* ---- the signup that could only ever happen once ----

     Reproduced against the live server with an address that had never
     existed: it came back "already registered" on the first attempt. An
     email signup stored `phone: null`, and the collection had a unique
     SPARSE index on phone. Sparse skips a field that is ABSENT; null is not
     absent, it is a value, and it is indexed. So the first email-only
     account took the one null slot and every account after it was refused
     by a unique index on a field nobody had filled in \u2014 reported as
     "already registered", while signing in correctly said no such account.
     Exactly one address in the whole database could sign in. */
  t('no account is written with a null phone field',
    !/email, phone,/.test(srv), 'the null that blocked every signup is back');
  t('and the index that blocked them is dropped on the way up',
    /dropIndex\('phone_1'\)|for \(const name of \['phone_1', 'email_1'\]\)/.test(srv));
  t('the rows already carrying it are cleared',
    /\$unset: \{ phone: '' \}/.test(srv));
  t('including the same trap in the other direction',
    /\{ email: null \}, \{ \$unset: \{ email: '' \} \}/.test(srv));
  /* A partial filter says what sparse was meant to say. */
  t('the email index only indexes real addresses',
    /partialFilterExpression: \{ email: \{ \$type: 'string' \} \}/.test(srv));
  t('and it is still unique', /\{ unique: true, name: 'email_unique'/.test(srv));
  /* And the repair must be safe to run on every restart. */
  t('the repair does not fail when there is nothing to repair',
    /catch \(e\) \{ \/\* not there: nothing to drop \*\//.test(srv));

  /* ---- accounts are an email address, nothing else ---- */
  var auth = fs.readFileSync(__dirname + '/js/auth.js', 'utf8');
  t('the server no longer looks a number up',
    !/const phone = !email \? normalisePhone\(identifier\) : null/.test(srv));
  t('and says so instead of refusing without a reason',
    /Accounts use an email address, not a phone number/.test(srv));
  t('the browser says the same, in the same words',
    /Accounts use an email address, not a phone number/.test(auth));
  t('and stops storing a phone on a new account',
    !/phone: isPhone\(identifier\) \? identifier : ''/.test(auth));
  t('the form says it before anybody types a number', (function () {
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    return /a number cannot be sent a/.test(html);
  })());
  t('and Settings invites an address for an account that has none', (function () {
    var v2 = fs.readFileSync(__dirname + '/js/views2.js', 'utf8');
    return /There is no way back into this account/.test(v2);
  })());

  /* Somebody must be able to take their data back. Delete account erased
     the copy on the phone and left the server's copy untouched for ever,
     while telling them it had been "permanently erased". */
  t('an account can be deleted from the server', /\/api\/account\/delete/.test(srv));
  t('and the password is required, so a stolen phone cannot do it',
    /bcrypt\.compare\(String\(password/.test(srv) && /nothing was deleted/.test(srv));
  t('the learning data is deleted as well as the account',
    /blobs\.deleteOne/.test(srv) && /users\.deleteOne/.test(srv));
  t('the data goes first, so a half-failure leaves nothing unreachable',
    srv.indexOf('blobs.deleteOne') < srv.indexOf('users.deleteOne'));
  t('deleting is rate limited', /account\/delete', auth, rateLimit/.test(srv));

  /* The fallback store must be able to delete too, or a person on a server
     that has lost its database is told their account cannot be removed. */
  t('the in-memory store can delete as well', /async deleteOne\(q\)/.test(srv));

  /* The client asks the server before it erases anything locally, so a
     refusal leaves the person with everything they had. */
  t('the client can ask the server to delete', /deleteAccount: function \(password\)/.test(sync));
  t('and forgets the token afterwards',
    /deleteAccount[\s\S]{0,260}setToken\(''\)/.test(sync));
  (function () {
    var v2 = fs.readFileSync(__dirname + '/js/views2.js', 'utf8');
    t('Settings asks for the password before deleting', /id="sDelPw"/.test(v2));
    t('and says what will actually be erased',
      /from this device[\s\S]{0,40}and from the server/.test(v2));
    t('the server is asked first, so a refusal destroys nothing',
      /Nothing has been deleted/.test(v2));
  })();

  /* Nothing here may cost anything or need a key. */
  t('the mailer is optional, so the server still boots without it',
    /Nodemailer is loaded lazily/.test(srv));
  /* Google shows an app password as four blocks of four and people paste it
     that way. Gmail wants it without spaces. */
  t('an app password pasted with its spaces still works',
    /SMTP_PASS = \(process\.env\.SMTP_PASS[^)]*\)\.replace\(/.test(srv));
  /* The app has no business insisting the sending address be a Gmail one. */
  t('any SMTP provider can be used, not only Gmail',
    /SMTP_HOST/.test(srv) && /host: SMTP_HOST/.test(srv));
  t('and Gmail is still the default, because it is free',
    /service: 'gmail'/.test(srv));
  t('port 465 is treated as implicit TLS',
    /secure: SMTP_PORT === 465/.test(srv));
  t('the from address can carry a display name',
    /SMTP_FROM \|\| SMTP_USER/.test(srv));

  /* Render's free tier blocks outbound SMTP, so a perfectly correct Gmail
     password still cannot send a single email. An HTTP email API goes over
     443, which nobody blocks. */
  t('mail can be sent over HTTP, not only SMTP',
    /api\.brevo\.com/.test(srv) && /api\.resend\.com/.test(srv));
  t('and the reason to prefer it is written down',
    /block outbound SMTP/.test(srv));

  /* The health check used to report mail:true whenever two variables had
     values — which was true of a server that could not send anything. */
  t('the health check tries the mailer rather than assuming it',
    /async function checkMail/.test(srv) && /t\.verify\(\)/.test(srv));
  t('a blocked SMTP server is given up on rather than hung on',
    /timed out/.test(srv) && /connectionTimeout/.test(srv));
  t('health reports how mail is sent and why it cannot be',
    /mailVia: MAIL_STATE\.how/.test(srv) && /mailReason: MAIL_STATE\.reason/.test(srv));
  t('and canReset follows what was tried, not what was configured',
    /canReset: MAIL_STATE\.ready && STORE\.durable/.test(srv));
})();

/* ---------------- the modern world ---------------- */
section('GROWING UP NOW');
(function () {
  var M = TB.MODERN;
  t('there are topics about the world a child lives in now', M.length >= 15, M.length);

  var ids = M.map(function (x) { return x.id; });
  t('topic ids are unique', new Set(ids).size === ids.length);

  t('every topic is titled in all three languages',
    M.every(function (x) { return x.title.en && x.title.ta && x.title.hi; }));
  t('every topic explains itself in all three',
    M.every(function (x) { return x.what.en && x.what.ta && x.what.hi; }));
  t('and says why it matters in all three',
    M.every(function (x) { return x.why.en && x.why.ta && x.why.hi; }));

  /* Each of these can go wrong in a way that matters, so each carries the
     warning and something to actually do. A lesson with no action is a
     lecture. */
  t('every topic gives something to try today',
    M.every(function (x) { return x.todo && x.todo.en && x.todo.ta && x.todo.hi; }));
  t('every topic names what to be careful about',
    M.every(function (x) { return x.careful && x.careful.en && x.careful.ta && x.careful.hi; }));

  t('every topic carries its vocabulary in all three languages',
    M.every(function (x) {
      return x.words.length >= 3
        && x.words.every(function (w) { return w.en && w.ta && w.hi; });
    }));

  /* Right script in the right field, as everywhere else in this app. */
  t('the Tamil is Tamil and the Hindi is Hindi',
    M.every(function (x) {
      var ta = [x.title.ta, x.what.ta, x.why.ta, x.todo.ta, x.careful.ta].join(' ');
      var hi = [x.title.hi, x.what.hi, x.why.hi, x.todo.hi, x.careful.hi].join(' ');
      return /[\u0b80-\u0bff]/.test(ta) && /[\u0900-\u097f]/.test(hi)
        && !/[\u0c00-\u0d7f]/.test(ta + hi);
    }));

  /* A parent picks by age; a child picks by subject. Both have to work. */
  t('every topic belongs to a real age band',
    M.every(function (x) {
      return TB.MODERN_BANDS.some(function (b) { return b.id === x.band; });
    }));
  t('every topic belongs to a real subject',
    M.every(function (x) {
      return TB.MODERN_GROUPS.some(function (g) { return g.id === x.group; });
    }));
  t('no age band is empty',
    TB.MODERN_BANDS.every(function (b) {
      return M.some(function (x) { return x.band === b.id; });
    }));
  t('no subject is empty',
    TB.MODERN_GROUPS.every(function (g) {
      return M.some(function (x) { return x.group === g.id; });
    }));
  t('the bands and groups are named in all three languages',
    TB.MODERN_BANDS.concat(TB.MODERN_GROUPS).every(function (x) {
      return x.en && x.ta && x.hi;
    }));

  /* The subjects a child actually meets, and the warnings that matter. */
  ['ai-what', 'ai-check', 'password', 'private', 'scam', 'money', 'screen']
    .forEach(function (id) {
      t('there is a topic on ' + id, ids.indexOf(id) >= 0);
    });
  t('the AI topic says plainly that it can be confidently wrong',
    /wrong/i.test(M.filter(function (x) { return x.id === 'ai-what'; })[0].why.en));
  t('the money topic warns about OTPs',
    /OTP/.test(M.filter(function (x) { return x.id === 'money'; })[0].careful.en));

  /* Reachable from the shell, or it is another buried section. */
  (function () {
    var fs = require('fs');
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
    var home = fs.readFileSync(__dirname + '/js/views.js', 'utf8');
    t('it is in the sidebar', /href="#\/modern"/.test(html));
    t('it is a real route', /modern: 'modern'/.test(app));
    t('it is on the home page', /#\/modern/.test(home));
    t('and every topic is searchable',
      TB.Search.query('artificial intelligence', 5).some(function (x) {
        return x.href.indexOf('#/modern') === 0;
      }));
    t('searching for a worry finds the topic about it',
      TB.Search.query('scam', 3).some(function (x) { return x.href === '#/modern/scam'; }),
      TB.Search.query('scam', 3).map(function (x) { return x.href; }).join(' '));
  })();
})();

/* ---------------- sweeping a photograph ---------------- */
section('WHAT IS NOT TEXT');
(function () {
  var R = TB.Reader;

  /* A real photograph of a nursery-rhyme poster. The rhyme was read
     perfectly; the title, drawn in bubble letters, and the watermark at the
     foot of the page came back as rubble — and because rubble is not verse,
     the whole poem was then flattened into two prose sentences and its
     shape thrown away. */
  var POSTER = [
    'Af (0}y7 J A = 5 =v) \\ $ \u00a2 | / % \u00a33 \u00bb py \u201c2',
    "I'm a little teapot",
    'Short and stout',
    'Here is my handle',
    'Here is my spout',
    'When | get all steamed up',
    '| just shout',
    'Tip me over and pour me out',
    'Oe'
  ];
  /* as OCR returns them: the text, and the score the reader gave itself */
  var POSTER_LINES = POSTER.map(function (t, i) {
    return { text: t, confidence: (i === 0 ? 22 : i === POSTER.length - 1 ? 31 : 88) };
  });
  var swept = R.clean(POSTER_LINES);

  t('the drawn title is set aside', swept.dropped.length === 2, swept.dropped.join(' | '));
  t('and the poem is kept whole', swept.lines.length === 7, swept.lines.length);
  t('a bar becomes the I it was',
    swept.lines[4] === 'When I get all steamed up' && swept.lines[5] === 'I just shout',
    swept.lines[4] + ' / ' + swept.lines[5]);
  t('and what is left reads as verse', R.looksLikeVerse(swept.lines),
    R.scheme(swept.lines).join(''));
  t('so the lines survive instead of being joined into prose',
    R.reflow(swept.lines).units.length === 7,
    R.reflow(swept.lines).units.length);
  t('stout, spout, shout and out all rhyme', (function () {
    var sc = R.scheme(swept.lines);
    return sc[1] === sc[3] && sc[3] === sc[5] && sc[5] === sc[6];
  })(), R.scheme(swept.lines).join(''));

  /* What must never be mistaken for decoration. */
  ['I am a little teapot.', 'Short and stout', '\u0ba8\u0bbf\u0bb2\u0bbe \u0ba8\u0bbf\u0bb2\u0bbe \u0b93\u0b9f\u0bbf \u0bb5\u0bbe',
   '\u092e\u091b\u0932\u0940 \u091c\u0932 \u0915\u0940 \u0930\u093e\u0928\u0940 \u0939\u0948', 'Rs 250 only', 'Chapter 3 \u2014 The Sun',
   'a', '\u0b85'].forEach(function (line) {
    t('kept: ' + line.slice(0, 26), !R.looksLikeRubble(line));
  });

  /* What must be. */
  ['Af (0}y7 J A = 5 =v)', '\\ $ \u00a2 | / % \u00a33 \u00bb', '~~~~~~~~', '\u00a9 2024 ...',
   '|||', '. . . . .', '>> << >>'].forEach(function (line) {
    t('swept: ' + line.slice(0, 26), R.looksLikeRubble(line));
  });

  /* A picture that is genuinely odd must not come back empty. */
  t('nothing is thrown away when everything looks odd', (function () {
    var all = R.clean(['#### ####', '$$$ %%%']);
    return all.lines.length === 2 && all.dropped.length === 0;
  })());

  /* What a real photograph of that poster actually produced. The drawn
     title scored 27 and 0 while the rhyme scored 96 and 97 — and one of the
     titles is the real word "Teapot", so only the score separates them. */
  t('a title the reader could not read is set aside, however word-like', (function () {
    var c = R.clean([
      { text: 'limalLitie', confidence: 27 }, { text: 'Teapot', confidence: 0 },
      { text: "I'm a little teapot", confidence: 96 }, { text: 'Short and stout', confidence: 96 },
      { text: 'Here is my handle', confidence: 97 }, { text: 'Here is my spout', confidence: 97 },
      { text: 'When I get all steamed up', confidence: 96 }, { text: 'I just shout', confidence: 97 },
      { text: 'Tip me over and pour me out', confidence: 97 }
    ]);
    return c.dropped.length === 2 && c.lines.length === 7 && R.looksLikeVerse(c.lines);
  })());

  /* But a poor photograph, where the reader did badly everywhere, has
     nothing better to compare against and keeps all of its lines. */
  t('a poor photograph keeps every line', (function () {
    var c = R.clean([
      { text: 'The sun is hot', confidence: 41 }, { text: 'The sky is blue', confidence: 38 },
      { text: 'We went outside', confidence: 44 }, { text: 'It was a good day', confidence: 40 }
    ]);
    return c.lines.length === 4 && c.dropped.length === 0;
  })());

  /* And the photo reader has to use it. */
  (function () {
    var fs = require('fs');
    var v2 = fs.readFileSync(__dirname + '/js/views2.js', 'utf8');
    t('the photo reader sweeps before it reads', /TB\.Reader\.clean\(found\)/.test(v2));
    t('and says how much it set aside', /decoration set aside/.test(v2));
  })();
})();

/* ---------------- a voice for every language ---------------- */
section('VOICE');
(function () {
  var fs = require('fs');
  var sp = fs.readFileSync(__dirname + '/js/speech.js', 'utf8');

  /* The browser only has the voices the operating system installed, and a
     normal Windows machine ships English and nothing else — so Tamil and
     Hindi could not be read aloud at all. */
  t('there is a voice for a language the device does not have',
    /translate_tts/.test(sp) && /function netSpeak/.test(sp));
  t('it is played rather than fetched, so no permission is needed',
    /new Audio\(\)/.test(sp));
  t('a long line is cut at word boundaries', /function netChunks/.test(sp));
  t('a voice the device has is still preferred: the network is only asked',
    /if \(\(api\.missing\(lang\) \|\| opts\.online \|\| noSuchSex\) && !opts\.force\) \{[\s\S]{0,360}netSpeak\(/.test(sp));
  /* An empty voice list is the case where there is CERTAINLY no Tamil
     voice. The old test required the list to be non-empty, so a browser
     that had not loaded its voices yet read Tamil with its default English
     one, silently. */
  t('and nothing on the device means missing, whatever the reason',
    /missing: function \(lang\) \{ return !pickVoice\(lang\); \}/.test(sp));
  t('stopping stops the network voice too', /netAudio\.pause\(\)/.test(sp));
  /* A phone grants permission to an audio element while a person is
     tapping, not to a page. A new element made for the second half of a
     sentence is refused, so a rhyme would say its first line and go quiet
     — which looks broken rather than unavailable. */
  t('one audio element is reused, so a phone keeps letting it play',
    /function netElement/.test(sp) && /netEl = new Audio\(\)/.test(sp));
  t('and it is woken by the first tap anywhere',
    /function unlockAudio/.test(sp) && /pointerdown/.test(sp) && /once: true/.test(sp));
  /* Translation in this same app uses translate.googleapis.com and has
     always worked from our users' networks; the voice was asking a
     different host, which may be the one being blocked. Both serve the
     same audio. */
  t('the voice asks the host translation already proves reachable',
    TB.Speech.netHosts()[0] === 'https://translate.googleapis.com');
  t('and falls back to the other before giving up',
    TB.Speech.netHosts().length === 2 && /run\(1\)/.test(sp));
  /* "Could not be reached" covers a blocked host, an ad blocker, a refused
     autoplay and a decode failure — which need different answers. */
  t('a failure carries the reason out with it',
    /netWhy = /.test(sp) && /NotAllowedError/.test(sp) && /a\.error && a\.error\.code/.test(sp));
  t('and the message shows it', /netWhy \? /.test(sp));
  t('no new element is made for each piece',
    (sp.match(/new Audio\(\)/g) || []).length === 1,
    (sp.match(/new Audio\(\)/g) || []).length + ' places make one');
  t('and it is not attempted with no connection', /navigator\.onLine === false/.test(sp));
  /* Load-bearing: the voice endpoint answers a request that carries no
     Referer and returns 404 to one that does. A browser always sends it
     unless the page says not to, so this is what makes the voice work at
     all — not a privacy nicety that can be quietly reverted. */
  (function () {
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    var vercel = fs.readFileSync(__dirname + '/vercel.json', 'utf8');
    t('the page tells the browser to send no referrer',
      /<meta name="referrer" content="no-referrer">/.test(html));
    t('and the deployed site sends the same header',
      /"value": "no-referrer"/.test(vercel));
    t('with the reason written down beside it',
      /refuses outright when it is told|needs to know which page asked/.test(html));
  })();
  t('the old message only appears once the network has failed too',
    /did not work either/.test(sp));
  t('Settings can say which voice will be used', /voiceSource: function/.test(sp));

  /* The bug that made all of the above pointless: the handler behind every
     speaker button checked missing(lang) and returned before ever calling
     speak(). So the online voice, however well it worked, was never even
     attempted on a machine with no Tamil voice — which is every ordinary
     Windows machine, because Windows ships no Tamil speech pack at all. */
  (function () {
    var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
    var v2 = fs.readFileSync(__dirname + '/js/views2.js', 'utf8');
    t('nothing refuses to speak before it has tried',
      !/if \(TB\.Speech\.missing\(lang\)\) \{[\s\S]{0,200}return;/.test(app)
        && !/if \(TB\.Speech\.missing\(lang\)\) \{[\s\S]{0,200}return;/.test(v2));
    t('and the warning comes only from a finished attempt',
      /speak\(text, lang[\s\S]{0,400}res\.noVoice[\s\S]{0,160}missingVoiceMessage/.test(app));
    t('Settings no longer offers to install a voice that does not exist',
      /read over the internet/.test(v2));
  })();

  t('the chunker keeps whole words', (function () {
    var out = TB.Speech.netChunks('one two three four five six seven eight nine ten', 20);
    return out.every(function (p) { return p.length <= 20 || p.indexOf(' ') < 0; })
      && out.join(' ') === 'one two three four five six seven eight nine ten';
  })());
  t('and never returns nothing', TB.Speech.netChunks('x', 190).length === 1);
  t('the address names the language and the text',
    /tl=ta/.test(TB.Speech.netUrl('\u0bb5\u0ba3\u0b95\u0bcd\u0b95\u0bae\u0bcd', 'ta', false, 0, 1, 7))
      && /q=%E0%AE/.test(TB.Speech.netUrl('\u0bb5\u0ba3\u0b95\u0bcd\u0b95\u0bae\u0bcd', 'ta', false, 0, 1, 7)));
  t('and asks for the slow one when reading slowly',
    /ttsspeed=0\.24/.test(TB.Speech.netUrl('a', 'ta', true, 0, 1, 1)));
})();

/* ---------------- rhyme in three scripts ---------------- */
section('RHYME');
(function () {
  var R = TB.Reader;

  /* What rhymes in Devanagari and Tamil is the rime: the last vowel and
     everything after it. This used to be decided after every vowel had been
     deleted, because a matra is a Unicode Mark and the cleaner only kept
     Letters — so है became ह and पानी became पन. */
  t('a vowel sign survives into the rime',
    R.ending('\u0935\u0939 \u0918\u0930 \u092e\u0947\u0902 \u0939\u0948') === '\u0948',
    JSON.stringify(R.ending('\u0935\u0939 \u0918\u0930 \u092e\u0947\u0902 \u0939\u0948')));
  t('\u0930\u093e\u092e and \u0928\u093e\u092e rhyme', R.rhymes('\u0930\u093e\u092e', '\u0928\u093e\u092e'));
  t('\u0930\u093e\u092e and \u0915\u092e do not', !R.rhymes('\u0930\u093e\u092e', '\u0915\u092e'),
    R.rime('\u0930\u093e\u092e') + ' / ' + R.rime('\u0915\u092e'));
  t('\u092a\u093e\u0928\u0940 and \u0930\u093e\u0928\u0940 rhyme', R.rhymes('\u092a\u093e\u0928\u0940', '\u0930\u093e\u0928\u0940'));
  t('\u0918\u0930 and \u0921\u0930 rhyme', R.rhymes('\u0918\u0930', '\u0921\u0930'));
  t('a word-final consonant is a coda, not a syllable',
    R.rime('\u0930\u093e\u092e') === '\u093e\u092e', JSON.stringify(R.rime('\u0930\u093e\u092e')));
  t('an anusvara after the vowel is kept',
    R.rime('\u092e\u0947\u0902') === '\u0947\u0902', JSON.stringify(R.rime('\u092e\u0947\u0902')));

  /* Whole poems, in all three scripts, with and without punctuation. */
  var HI = ['\u092e\u091b\u0932\u0940 \u091c\u0932 \u0915\u0940 \u0930\u093e\u0928\u0940 \u0939\u0948',
            '\u091c\u0940\u0935\u0928 \u0909\u0938\u0915\u093e \u092a\u093e\u0928\u0940 \u0939\u0948',
            '\u0939\u093e\u0925 \u0932\u0917\u093e\u0913 \u0921\u0930 \u091c\u093e\u090f\u0917\u0940',
            '\u092c\u093e\u0939\u0930 \u0928\u093f\u0915\u093e\u0932\u094b \u092e\u0930 \u091c\u093e\u090f\u0917\u0940'];
  var TA = ['\u0ba8\u0bbf\u0bb2\u0bbe \u0ba8\u0bbf\u0bb2\u0bbe \u0b93\u0b9f\u0bbf \u0bb5\u0bbe',
            '\u0ba8\u0bbf\u0bb2\u0bcd\u0bb2\u0bbe\u0bae\u0bb2\u0bcd \u0b93\u0b9f\u0bbf \u0bb5\u0bbe',
            '\u0bae\u0bb2\u0bc8 \u0bae\u0bc7\u0bb2\u0bc7 \u0b8f\u0bb1\u0bbf \u0bb5\u0bbe',
            '\u0bae\u0bb2\u0bcd\u0bb2\u0bbf\u0b95\u0bc8\u0baa\u0bcd \u0baa\u0bc2 \u0b95\u0bca\u0ba3\u0bcd\u0b9f\u0bc1 \u0bb5\u0bbe'];
  var EN = ['Twinkle twinkle little star', 'How I wonder what you are',
            'Up above the world so high', 'Like a diamond in the sky'];

  t('a Hindi rhyme is heard as verse', R.looksLikeVerse(HI), R.scheme(HI).join(''));
  t('and its scheme is AABB', R.scheme(HI).join('') === 'AABB', R.scheme(HI).join(''));
  t('a Tamil rhyme is heard as verse', R.looksLikeVerse(TA), R.scheme(TA).join(''));
  t('an English rhyme is heard as verse', R.looksLikeVerse(EN), R.scheme(EN).join(''));

  /* The other half of getting this right: prose must not be chanted. In
     Hindi a great many words end in -ी, so a loose test finds rhymes
     everywhere and reads the newspaper as a nursery rhyme. */
  var HI_PROSE = ['\u092f\u0939 \u090f\u0915 \u0938\u093e\u0927\u093e\u0930\u0923 \u0935\u093e\u0915\u094d\u092f \u0939\u0948\u0964',
                  '\u0907\u0938\u092e\u0947\u0902 \u0915\u094b\u0908 \u0924\u0941\u0915 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0924\u0940\u0964',
                  '\u0939\u092e \u092c\u093e\u091c\u093c\u093e\u0930 \u0917\u090f \u0925\u0947 \u0915\u0932 \u0936\u093e\u092e \u0915\u094b\u0964',
                  '\u0935\u0939\u093e\u0901 \u092c\u0939\u0941\u0924 \u092d\u0940\u0921\u093c \u0925\u0940 \u0914\u0930 \u0917\u0930\u092e\u0940 \u092d\u0940\u0964'];
  var EN_PROSE = ['The school opens at nine in the morning.',
                  'Students must wear the uniform every day.',
                  'Lunch is served in the hall.',
                  'Parents may visit on Friday.'];
  t('Hindi prose is not chanted', !R.looksLikeVerse(HI_PROSE), R.scheme(HI_PROSE).join(''));
  t('English prose is not chanted', !R.looksLikeVerse(EN_PROSE), R.scheme(EN_PROSE).join(''));

  /* But a punctuated poem is still a poem. */
  var HI_PUNCT = ['\u091a\u0902\u0926\u093e \u092e\u093e\u092e\u093e \u0926\u0942\u0930 \u0915\u0947,',
                  '\u092a\u0941\u090f \u092a\u0915\u093e\u090f \u092c\u0942\u0930 \u0915\u0947\u0964',
                  '\u0906\u092a \u0916\u093e\u090f\u0901 \u0925\u093e\u0932\u0940 \u092e\u0947\u0902,',
                  '\u092e\u0941\u0928\u094d\u0928\u0947 \u0915\u094b \u0926\u0947\u0902 \u092a\u094d\u092f\u093e\u0932\u0940 \u092e\u0947\u0902\u0964'];
  t('a punctuated rhyme is still a rhyme', R.looksLikeVerse(HI_PUNCT), R.scheme(HI_PUNCT).join(''));

  /* Verse keeps its line breaks; prose is sewn back into sentences. */
  t('verse is left exactly as the poet broke it',
    R.reflow(HI).units.length === 4 && R.reflow(HI).isVerse);
  t('prose wrapped by a camera is sewn back into sentences',
    R.reflow(['The school opens at', 'nine in the morning.']).units.length === 1,
    JSON.stringify(R.reflow(['The school opens at', 'nine in the morning.']).units));

  /* And the chant itself must actually differ from plain reading. */
  var plain = R.plan(HI, 'hi', 'read', {});
  var sung = R.plan(HI, 'hi', 'rhyme', {});
  t('the sing-song voice is not the reading voice',
    JSON.stringify(plain) !== JSON.stringify(sung));
  t('every step of a Hindi chant is still Hindi',
    sung.every(function (s) { return !s.text || s.lang === 'hi'; }));
})();

/* ---------------- sounding out the unknown ---------------- */
section('ENGLISH IN TAMIL LETTERS');
(function () {
  var T = TB.Translit;

  /* The bug this exists for: a word the pronouncing dictionary had never
     heard of was left in Latin letters in the middle of a line written for
     somebody who cannot read Latin. */
  ['A small bird sat on the wall.',
   'She hid the gift under the bed.',
   'My name is Kumara.',
   'Everything the verb acts on comes before it.',
   'He bought nine bright kites.'].forEach(function (line) {
    var out = T.englishToTamilSound(line);
    t('no English letter survives in: ' + line.slice(0, 34),
      !!out && !/[A-Za-z]/.test(out), out);
  });

  /* The speller itself, on the patterns that matter. */
  [['sat', '\u0bb8\u0b9f\u0bcd'], ['hid', '\u0bb9\u0bbf\u0b9f\u0bcd'],
   ['name', '\u0ba8\u0bc7\u0bae\u0bcd'], ['hide', '\u0bb9\u0bc8\u0b9f\u0bcd'],
   ['rope', '\u0bb0\u0bcb\u0baa\u0bcd'], ['five', '\u0b83\u0baa\u0bc8\u0bb5\u0bcd'],
   ['light', '\u0bb2\u0bc8\u0b9f\u0bcd'], ['school', '\u0bb8\u0bcd\u0b95\u0bc2\u0bb2\u0bcd'],
   ['my', '\u0bae\u0bc8'], ['happy', '\u0bb9\u0baa\u0bbf']].forEach(function (pair) {
    t('"' + pair[0] + '" is sounded out as ' + pair[1],
      T.spellEnglishInTamil(pair[0]) === pair[1], T.spellEnglishInTamil(pair[0]));
  });

  /* Two rules that are Tamil spelling, not English: a word does not begin
     with \u0ba9, and a silent final e lengthens the vowel before it. */
  t('a word does not begin with \u0ba9',
    T.spellEnglishInTamil('night').charAt(0) === '\u0ba8',
    T.spellEnglishInTamil('night'));
  t('a silent final e lengthens the vowel before it',
    T.spellEnglishInTamil('hid') !== T.spellEnglishInTamil('hide'),
    T.spellEnglishInTamil('hid') + ' / ' + T.spellEnglishInTamil('hide'));
  t('and a final y is a vowel, not a consonant',
    !/\u0baf\u0bcd$/.test(T.spellEnglishInTamil('sunny')), T.spellEnglishInTamil('sunny'));

  /* Whatever it produces must be Tamil and nothing else. */
  t('the speller only ever produces Tamil',
    ['xylophone', 'Kumara', 'Chennai', 'rhythm', 'queue', 'strength'].every(function (w) {
      var o = T.spellEnglishInTamil(w);
      return o && !/[^\u0b80-\u0bff]/.test(o);
    }));
  t('and nothing at all for nothing at all',
    T.spellEnglishInTamil('') === '' && T.spellEnglishInTamil('123') === '');

  /* The dictionary still wins where it has an answer: it came from a
     pronouncing dictionary, and letters are only the fallback. */
  t('a known word uses its real pronunciation, not its spelling',
    T.englishToTamilSound('one') !== T.spellEnglishInTamil('one'),
    T.englishToTamilSound('one') + ' vs ' + T.spellEnglishInTamil('one'));
})();

/* ---------------- vertically and crosswise ---------------- */
section('VERTICALLY AND CROSSWISE');
(function () {
  var M2 = TB.Maths2;

  /* The example every Indian mental-maths class starts with. */
  var r = M2.crosswise(23, 41);
  t('23 x 41 is 943', r.answer === 943 && r.check, r.answer);
  t('three columns for two digits by two', r.columns.length === 3);
  t('the units are one pair, straight down',
    r.columns[0].pairs.length === 1 && r.columns[0].sum === 3,
    JSON.stringify(r.columns[0].pairs));
  t('the tens are the cross',
    r.columns[1].pairs.length === 2 && r.columns[1].sum === 14,
    JSON.stringify(r.columns[1].pairs));
  t('the hundreds are one pair again',
    r.columns[2].pairs.length === 1 && r.columns[2].sum === 8);
  t('and the carry moves left',
    r.columns[1].carryOut === 1 && r.columns[2].carryIn === 1);

  /* It has to agree with plain multiplication, always — the first attempt
     had the columns the wrong way round and 23 x 41 came to 448. */
  var wrong = 0, worst = '';
  for (var i = 0; i < 3000; i++) {
    var a = 1 + Math.floor(Math.random() * 99999);
    var b = 1 + Math.floor(Math.random() * 9999);
    var x = M2.crosswise(a, b);
    if (!x || x.answer !== a * b) { wrong++; if (!worst) worst = a + ' x ' + b; }
  }
  t('3000 random pairs all come out right', wrong === 0, worst);
  [[1, 1], [7, 8], [99, 99], [1000, 1000], [123, 45]].forEach(function (p) {
    var y = M2.crosswise(p[0], p[1]);
    t(p[0] + ' x ' + p[1] + ' = ' + (p[0] * p[1]), y && y.answer === p[0] * p[1], y && y.answer);
  });
  t('something far too big is refused', M2.crosswise(1234567, 1234567) === null);
  t('the columns are named from the units',
    M2.placeName(0) === 'units' && M2.placeName(2) === 'hundreds');

  /* practice */
  ['add', 'sub', 'mul', 'div'].forEach(function (op) {
    var qs = M2.round(op, 2, 10);
    t(op + ' gives ten questions', qs.length === 10);
    var bad = qs.filter(function (q) {
      var real = op === 'add' ? q.a + q.b : op === 'sub' ? q.a - q.b
               : op === 'mul' ? q.a * q.b : q.a / q.b;
      return real !== q.answer;
    });
    t(op + ' answers are all right', bad.length === 0,
      bad.slice(0, 2).map(function (q) { return q.a + ' ' + q.b; }).join(', '));
  });
  t('taking away never goes below zero', (function () {
    for (var i = 0; i < 400; i++) { if (M2.question('sub', 3).answer < 0) return false; }
    return true;
  })());
  t('dividing always comes out whole', (function () {
    for (var i = 0; i < 400; i++) {
      var q = M2.question('div', 3);
      if (q.a % q.b !== 0 || q.a / q.b !== q.answer) return false;
    }
    return true;
  })());
  t('a round has no question twice', (function () {
    var qs = M2.round('add', 2, 10);
    var seen = qs.map(function (q) { return q.a + '|' + q.b; });
    return new Set(seen).size === seen.length;
  })());
  t('every level is offered', M2.LEVELS.length >= 4);

  /* reachable */
  (function () {
    var fs = require('fs');
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
    var home = fs.readFileSync(__dirname + '/js/views.js', 'utf8');
    ['crosswise', 'sums', 'chart'].forEach(function (r2) {
      t(r2 + ' is in the sidebar', html.indexOf('href="#/' + r2 + '"') > 0);
      t(r2 + ' is a real route', app.indexOf(r2 + ": '" + r2 + "'") > 0);
      t(r2 + ' is on the home page', home.indexOf("'#/" + r2 + "'") > 0);
      t(r2 + ' can be searched for',
        TB.Search.query(r2 === 'sums' ? 'practice' : r2 === 'chart' ? 'number chart' : 'crosswise', 4)
          .some(function (x) { return x.href === '#/' + r2; }));
    });
  })();
})();

/* ---------------- the abacus ---------------- */
section('ABACUS');
(function () {
  var A = TB.Abacus;

  /* A soroban: one bead above the bar worth five, four below worth one. */
  t('a rod holds nought to nine',
    A.rodValue({ heaven: false, earth: 0 }) === 0 && A.rodValue({ heaven: true, earth: 4 }) === 9);
  t('and five is the bead on top',
    A.rodValue({ heaven: true, earth: 0 }) === 5);

  /* Every number must go on and come back off unchanged. */
  var bad = [];
  for (var n = 0; n <= 2000; n++) {
    var r = A.set(n);
    if (r.tooBig || A.value(r.frame) !== n) bad.push(n);
  }
  [9999999, 1234567, 1000000, 505050].forEach(function (n) {
    var r = A.set(n);
    if (r.tooBig || A.value(r.frame) !== n) bad.push(n);
  });
  t('every number up to two thousand goes on and reads back', bad.length === 0, bad.slice(0, 4).join(', '));
  t('and the big ones too', A.value(A.set(1234567).frame) === 1234567);
  t('a number too big for the frame says so', A.set(99999999).tooBig);

  /* The rightmost rod is the units, as on a real one. */
  t('the rightmost rod is the units',
    A.set(7).frame[A.RODS - 1].earth === 2 && A.set(7).frame[A.RODS - 1].heaven === true);
  t('the places are named from the right',
    A.placeName(A.RODS - 1) === 'units' && A.placeName(A.RODS - 2) === 'tens');

  /* Tapping the third bead sets the rod to three, because on a real abacus
     everything between the bead and the bar comes with it. */
  (function () {
    var f = A.empty();
    A.tapEarth(f, A.RODS - 1, 2);
    t('tapping the third bead sets the rod to three', A.rodValue(f[A.RODS - 1]) === 3);
    A.tapEarth(f, A.RODS - 1, 2);
    t('and tapping it again lets them go', A.rodValue(f[A.RODS - 1]) === 2);
    A.tapHeaven(f, A.RODS - 1);
    t('the top bead adds five', A.rodValue(f[A.RODS - 1]) === 7);
  })();

  /* Adding, including the exchange that is the whole skill. */
  var sums = [[25, 17], [6, 7], [99, 1], [458, 367], [0, 5], [1234, 5678], [9, 9]];
  var wrong = sums.filter(function (p) {
    var w = A.addSteps(p[0], p[1]);
    return !w || w.answer !== p[0] + p[1];
  });
  t('adding on the beads gives the right answer', wrong.length === 0,
    wrong.map(function (p) { return p.join('+'); }).join(', '));
  t('and the exchange is explained when a rod runs out', (function () {
    var w = A.addSteps(6, 7);
    return w.steps.some(function (s) { return s.carry && /cannot hold/.test(s.en); });
  })());
  /* The steps ARE the lesson. In English only they taught nobody who could
     not already read English — on a page whose whole purpose is to teach
     a Tamil speaker. */
  (function () {
    var bad = [];
    [[25, 17], [6, 7], [99, 1], [48, 55], [7, 2]].forEach(function (p) {
      var w = A.addSteps(p[0], p[1]);
      if (!w) return;
      w.steps.forEach(function (st) {
        ['en', 'ta', 'hi'].forEach(function (l) {
          if (!st[l] || !String(st[l]).trim()) bad.push(p.join('+') + ' has no ' + l);
        });
      });
    });
    t('every step of a sum is written in all three', bad.length === 0, bad.slice(0, 3).join(', '));
  })();
  t('and the rods are named in all three',
    A.placeName(6, 7) === 'units' && A.placeTa(6, 7) === 'ஒன்றுகள்'
    && A.placeHi(6, 7) === 'इकाई',
    A.placeTa(6, 7) + ' / ' + A.placeHi(6, 7));
  /* Tamil and Hindi must name the place the step is actually about, or the
     sentence is about a different rod in each language. */
  t('the step names the same rod in each language', (function () {
    var w = A.addSteps(25, 17);
    var carry = w.steps.filter(function (s) { return s.carry; })[0];
    return carry && /units/.test(carry.en) && /ஒன்றுகள்/.test(carry.ta)
        && /इकाई/.test(carry.hi);
  })());
  (function () {
    var v10 = fs.readFileSync(__dirname + '/js/views10.js', 'utf8');
    function count(l) { return (v10.match(new RegExp(l + ": '", 'g')) || []).length; }
    t('the page opens with an explainer', /HOW_IT_WORKS/.test(v10));
    /* Five pieces, and not one of them written in only one language. */
    t('and every piece of it is in all three',
      count('en') >= 5 && count('ta') === count('en') && count('hi') === count('en'),
      count('en') + ' en / ' + count('ta') + ' ta / ' + count('hi') + ' hi');
    t('which is folded shut like every other long thing',
      /<details class="card fold" id="abHow"/.test(v10));
    t('the rod label carries its Tamil name', /A\.placeTa\(i, rods\)/.test(v10));
    /* The adding mode drew no abacus at all until the button was pressed,
       and the button did nothing because 25 and 17 were placeholders. */
    t('the adding mode has real numbers in the boxes, not placeholders',
      /value="' \+ addA \+ '"/.test(v10) && !/placeholder="25"/.test(v10));
    t('and an abacus on screen from the moment it opens',
      /An abacus page with no abacus on it/.test(v10));
    t('an empty box says so instead of nothing happening',
      /Put a number in both boxes/.test(v10));
  })();
  t('a rod with room just takes the beads', (function () {
    var w = A.addSteps(21, 13);
    return w.steps.every(function (s) { return !s.carry; }) && w.answer === 34;
  })());

  /* Reachable, like everything else. */
  (function () {
    var fs = require('fs');
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
    var home = fs.readFileSync(__dirname + '/js/views.js', 'utf8');
    t('the abacus is in the sidebar', /href="#\/abacus"/.test(html));
    t('it is a real route', /abacus: 'abacus'/.test(app));
    t('it is on the home page', /#\/abacus/.test(home));
    t('and it can be searched for',
      TB.Search.query('abacus', 3).some(function (x) { return x.href === '#/abacus'; }));
  })();
})();

/* ---------------- search ---------------- */
section('SEARCH');
(function () {
  var S = TB.Search;

  t('the index covers the whole app', S.size() > 3000, S.size().toLocaleString('en-IN'));

  /* The question that started this: somebody types "synonym" and has to
     land on the synonyms page, not on a word that happens to contain it. */
  function first(q) { var r = S.query(q, 5); return r.length ? r[0] : null; }
  function hrefs(q) { return S.query(q, 8).map(function (x) { return x.href; }); }

  [['synonym', '#/english/words'],
   ['synonyms', '#/english/words'],
   ['antonym', '#/english/words'],
   ['opposite', '#/english/words'],
   ['tense', '#/english/tense'],
   ['tense chart', '#/english/tense'],
   ['writing', '#/write'],
   ['handwriting', '#/write'],
   ['multiplication', '#/maths'],
   ['photo', '#/photo'],
   ['pronunciation', '#/speak'],
   ['alphabet', '#/alphabet'],
   ['settings', '#/settings']].forEach(function (pair) {
    var f = first(pair[0]);
    t('"' + pair[0] + '" leads to ' + pair[1], !!f && f.href === pair[1], f && f.href);
  });

  /* The Tamil and Hindi words for "opposite" must work too: a Tamil-first
     learner does not type the English name of what they are looking for. */
  t('\u0b8e\u0ba4\u0bbf\u0bb0\u0bcd\u0b9a\u0bcd\u0b9a\u0bca\u0bb2\u0bcd finds the opposites page',
    hrefs('\u0b8e\u0ba4\u0bbf\u0bb0\u0bcd\u0b9a\u0bcd\u0b9a\u0bca\u0bb2\u0bcd').indexOf('#/english/words') >= 0);
  t('\u0935\u093f\u0932\u094b\u092e finds the opposites page',
    hrefs('\u0935\u093f\u0932\u094b\u092e').indexOf('#/english/words') >= 0);
  t('\u0915\u093e\u0932 finds the tense chart',
    hrefs('\u0915\u093e\u0932').indexOf('#/english/tense') >= 0);

  /* A word can be searched in any of the three scripts, or by how it sounds. */
  function findsWord(q, en) {
    return S.query(q, 8).some(function (x) { return x.kind === 'word' && x.t === en; });
  }
  t('an English word is found', findsWord('dog', 'dog'));
  t('the same word is found in Tamil', findsWord('\u0ba8\u0bbe\u0baf\u0bcd', 'dog'));
  t('and in Hindi', findsWord('\u0915\u0941\u0924\u094d\u0924\u093e', 'dog'));

  /* Romanised Tamil with and without the scholarly dots must agree: a
     phone keyboard cannot type \u1e47 and nobody should have to. */
  t('romanised Tamil works without the dots',
    S.query('vanakkam', 5).length > 0 && S.query('va\u1e47akkam', 5).length > 0);
  t('and both spellings reach the same word',
    S.query('vanakkam', 1)[0].t === S.query('va\u1e47akkam', 1)[0].t,
    S.query('vanakkam', 1)[0].t);

  /* Nobody types the scholarly dots, so the spellings people actually use
     on a phone keyboard have to work. The app's own Meaning box advertises
     "poonai" — it had better find \u0baa\u0bc2\u0ba9\u0bc8. */
  [['poonai', 'cat'], ['naai', 'dog'], ['vanakkam', 'hello'],
   ['thanni', 'water'], ['paal', 'milk'], ['veedu', 'house']].forEach(function (pair) {
    t('"' + pair[0] + '" finds ' + pair[1], findsWord(pair[0], pair[1]),
      (S.query(pair[0], 1)[0] || {}).t);
  });
  t('folding hears the long vowels',
    S.fold('poonai') === S.fold('punai') && S.fold('naai') === S.fold('nai'),
    S.fold('poonai') + ' / ' + S.fold('punai'));
  t('folding hears the aspirates',
    S.fold('thanni') === S.fold('tanni'), S.fold('thanni'));
  t('folding leaves Tamil and Hindi script alone',
    S.fold('\u0baa\u0bc2\u0ba9\u0bc8') === '\u0baa\u0bc2\u0ba9\u0bc8'
      && S.fold('\u0915\u0941\u0924\u094d\u0924\u093e') === '\u0915\u0941\u0924\u094d\u0924\u093e');

  /* A word that starts with what you typed must beat one that merely
     contains it, or the list is useless. */
  t('a word beginning with the query wins',
    S.score('candle', 'can') > S.score('american', 'can'));
  t('an exact match beats every prefix',
    S.score('can', 'can') > S.score('candle', 'can'));
  t('a word-boundary match beats a mid-word one',
    S.score('tin can', 'can') > S.score('american', 'can'));

  /* Sections outrank data, so the page about a thing comes before an
     example of it. */
  t('a section outranks a word of the same name',
    first('numbers').kind === 'section', first('numbers') && first('numbers').kind);

  /* Nothing may point at an address the router cannot reach. */
  (function () {
    var fs = require('fs');
    var app = fs.readFileSync(__dirname + '/js/app.js', 'utf8');
    var routes = (app.match(/var ROUTES = \{[\s\S]*?\};/) || [''])[0];
    var bad = [];
    S.build().forEach(function (e) {
      var view = e.href.replace(/^#\//, '').split('/')[0];
      if (routes.indexOf(view + ':') < 0) bad.push(e.t + ' -> ' + e.href);
    });
    t('every result points at a real section', bad.length === 0, bad.slice(0, 3).join(' | '));
  })();

  /* Typing a number found nothing at all, which is a strange thing for a
     counting app. */
  t('a number is found', first('47') && first('47').kind === 'number',
    first('47') && first('47').t);
  t('and carries its name in all three languages',
    /forty-seven/.test(first('47').s) && /\u0b8f\u0bb4\u0bc1/.test(first('47').s)
      && /\u0938\u0948\u0902\u0924\u093e\u0932\u0940\u0938/.test(first('47').s), first('47').s);
  t('a number word is found too',
    S.query('sixty', 5).some(function (x) { return x.kind === 'number'; }));
  t('lakh and crore are findable by name',
    S.query('lakh', 3).some(function (x) { return x.t === '100000'; })
      && S.query('crore', 3).some(function (x) { return x.t === '10000000'; }));

  /* Folding must bring the spellings together without throwing the word
     away: "naai" folded to "ni" once matched half the dictionary. */
  t('"naai" puts the dog near the top',
    S.query('naai', 3).some(function (x) { return x.t === 'dog'; }),
    S.query('naai', 3).map(function (x) { return x.t; }).join(', '));

  t('an empty search returns nothing rather than everything', S.query('', 10).length === 0);
  t('a search with no match returns nothing',
    S.query('zzqqxx', 10).length === 0, S.query('zzqqxx', 10).length);

  /* The bar itself */
  (function () {
    var fs = require('fs');
    var html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    var bar = fs.readFileSync(__dirname + '/js/searchbar.js', 'utf8');
    t('the box is in the top bar of every page', /id="searchInput"/.test(html));
    t('and is loaded before the app starts',
      html.indexOf('js/search.js') < html.indexOf('js/app.js')
      && html.indexOf('js/searchbar.js') < html.indexOf('js/app.js'));
    t('slash and ctrl-K open it', /e\.key === '\/'/.test(bar) && /e\.key === 'k'/.test(bar));
    t('the arrow keys move through the results', /ArrowDown/.test(bar) && /ArrowUp/.test(bar));
    t('escape gives the page back', /e\.key === 'Escape'/.test(bar));
    t('choosing something closes the keyboard on a phone', /input\.blur\(\)/.test(bar));
    t('the index is built when the browser is idle, not on the first keystroke',
      /requestIdleCallback/.test(bar));
    t('browser storage failures are survivable', /catch \(e\)/.test(bar));
  })();
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
/* Spelt the way somebody reads them aloud, not the way a grammar of Hindi
   writes them. ख़ was x, च was c and श was ś, so बुख़ार came out "buxār",
   चाय came out "cāy" and शाम came out "śām" — each of them precise, and
   each of them read wrongly by every learner who has not been taught the
   notation. The dots that stay are the ones that only say "curl your
   tongue back": ṭ, ḍ, ṛ. */
[['करोड़', 'karoṛ', 'கரோர்'],
 ['किताब', 'kitāb', 'கிதாப்'],
 ['सड़क', 'saṛak', 'ஸரக்'],
 ['खिड़की', 'khiṛkī', 'கிர்கீ'],
 ['डॉक्टर', 'ḍokṭar', 'டோக்டர்'],
 ['पाँच', 'pānch', 'பாஞ்ச்'],
 ['आँख', 'ānkh', 'ஆங்க்'],
 ['बेटा', 'beṭā', 'பேட்டா'],
 ['ठंडा', 'ṭhanḍā', 'டண்டா'],
 ['नमस्ते', 'namaste', 'நமஸ்தே'],
 ['बुख़ार', 'bukhār', 'புஃகார்'],
 ['चाय', 'chāy', 'சாய்'],
 ['शाम', 'shām', 'ஷாம்'],
 ['कंपनी', 'kampanī', 'கம்பனீ'],
 ['ग़लत', 'ghalat', 'ஃகலத்']]
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
  [['hi', 'मैं स्कूल जाता हूँ', 'main skūl jātā hūn'],
   ['te', 'నేను', 'nenu'],
   ['kn', 'ನಾನು', 'nānu'],
   ['ml', 'ഞാൻ', 'nān'],
   ['bn', 'আমি', 'āmi'],
   ['gu', 'હું', 'hun'],
   ['pa', 'ਮੈਂ', 'main']]
    .forEach(function (row) {
      var r = TB.Translit.readings(row[1], row[0]);
      t(row[0] + ' reads in English letters', r.roman === row[2], r.roman);
      t(row[0] + ' reads in Tamil letters',
        !!r.tamil && !/[ऀ-෿]/.test(r.tamil.replace(/[஀-௿]/g, '')), r.tamil);
    });

  /* the m at the start is the म; it is the LAST sound that was wrong */
  t('a word-final nasal is written n, as everybody writes it',
    /n$/.test(TB.Translit.romanHindi('मैं')),
    TB.Translit.romanHindi('मैं'));
  t('and so is a chandrabindu',
    /n$/.test(TB.Translit.romanHindi('हूँ')),
    TB.Translit.romanHindi('हूँ'));
  t('a nasal before a stop still takes its place',
    TB.Translit.romanHindi('हिंदी') === 'hindī',
    TB.Translit.romanHindi('हिंदी'));
  t('southern short e survives',
    TB.Translit.readings('ಶಾಲೆ', 'kn').roman === 'shāle',
    TB.Translit.readings('ಶಾಲೆ', 'kn').roman);
  t('Malayalam chillu is a bare consonant',
    TB.Translit.readings('ഞാൻ', 'ml').roman === 'nān',
    TB.Translit.readings('ഞാൻ', 'ml').roman);
  /* The fault that started this: notation nobody outside a linguistics
     department reads correctly. */
  t('no reading uses x for the kh sound',
    !/x/.test(TB.Translit.romanHindi('बुख़ार')), TB.Translit.romanHindi('बुख़ार'));
  t('ch is written ch, not c',
    TB.Translit.romanHindi('चाय').charAt(0) === 'c'
      && TB.Translit.romanHindi('चाय').charAt(1) === 'h',
    TB.Translit.romanHindi('चाय'));
  t('sh is written sh',
    /^sh/.test(TB.Translit.romanHindi('शाम')), TB.Translit.romanHindi('शाम'));
  t('a nasal is n, or m before a lip sound',
    TB.Translit.romanHindi('पाँच') === 'pānch'
      && TB.Translit.romanHindi('कंपनी') === 'kampanī',
    TB.Translit.romanHindi('पाँच') + ' / ' + TB.Translit.romanHindi('कंपनी'));
  t('and Tamil keeps the nasal its own spelling needs',
    TB.Translit.hindiToTamilScript('पाँच') === 'பாஞ்ச்',
    TB.Translit.hindiToTamilScript('पाँच'));
  t('a schwa survives after a closed syllable',
    TB.Translit.romanHindi('कंपनी') === 'kampanī',
    TB.Translit.romanHindi('कंपनी'));
  t('but still drops where it should',
    TB.Translit.romanHindi('खिड़की') === 'khiṛkī'
      && TB.Translit.romanHindi('सड़क') === 'saṛak',
    TB.Translit.romanHindi('खिड़की') + ' / ' + TB.Translit.romanHindi('सड़क'));
  t('Tamil marks the foreign fricative with \u0b83',
    TB.Translit.hindiToTamilScript('बुख़ार') === 'புஃகார்',
    TB.Translit.hindiToTamilScript('बुख़ार'));

  t('nothing leaks its own script into the reading',
    ['hi', 'te', 'kn', 'ml', 'bn', 'gu', 'pa'].every(function (l) {
      var r = TB.Translit.readings(SAMPLE[l], l);
      return !/[ऀ-୿ఀ-෿]/.test(r.roman + r.tamil);
    }));
  t('Tamil reads as itself', TB.Translit.readings('நான்', 'ta').roman === 'nān',
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
  /* This used to demand no line at all when most of the words were
     unknown, because a half-transliterated line with English words left in
     it was worse than nothing. It is now sounded out from the letters
     instead, so there is no half line to avoid — but there must still be
     no Latin left anywhere in it. */
  t('even wholly unknown English is sounded out, with no Latin left', (function () {
    var out = TB.Translit.readings('Xyzzy plugh frobnicate', 'en').tamil;
    return out && !/[A-Za-z]/.test(out);
  })(), TB.Translit.readings('Xyzzy plugh frobnicate', 'en').tamil);
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
/* A thousand with anything after it bends: ஆயிரம் becomes ஆயிரத்து.
   The tests above only ever asked for round thousands, which is exactly how
   "ஆயிரம் ஒன்று" survived in a chart meant to teach children to read. */
[[1001, 'ஆயிரத்து ஒன்று'],
 [1100, 'ஆயிரத்து நூறு'],
 [2001, 'இரண்டாயிரத்து ஒன்று'],
 [3001, 'மூவாயிரத்து ஒன்று'],
 [5500, 'ஐயாயிரத்து ஐநூறு'],
 [8001, 'எண்ணாயிரத்து ஒன்று'],
 [10001, 'பத்தாயிரத்து ஒன்று'],
 [11500, 'பதினொன்று ஆயிரத்து ஐநூறு'],
 [901, 'தொள்ளாயிரத்து ஒன்று']]
  .forEach(function (row) { t('tamil bends ' + row[0], TB.Numbers.ta(row[0]) === row[1], TB.Numbers.ta(row[0])); });
/* and a round thousand must stay straight */
[[1000, 'ஆயிரம்'], [2000, 'இரண்டாயிரம்'], [10000, 'பத்தாயிரம்'], [900, 'தொள்ளாயிரம்']]
  .forEach(function (row) { t('tamil stays straight ' + row[0], TB.Numbers.ta(row[0]) === row[1], TB.Numbers.ta(row[0])); });

/* Hindi: behind a bigger scale, 100 wants its एक back. */
t('hindi 1100', TB.Numbers.hi(1100) === 'एक हज़ार एक सौ', TB.Numbers.hi(1100));
t('hindi 2100', TB.Numbers.hi(2100) === 'दो हज़ार एक सौ', TB.Numbers.hi(2100));
t('hindi 100 alone is सौ', TB.Numbers.hi(100) === 'सौ', TB.Numbers.hi(100));
t('hindi 101 unchanged', TB.Numbers.hi(101) === 'एक सौ एक', TB.Numbers.hi(101));

/* English keeps the "and" it already uses at 101. */
t('english 1001', TB.Numbers.enIndian(1001) === 'one thousand and one', TB.Numbers.enIndian(1001));
t('english 1100', TB.Numbers.enIndian(1100) === 'one thousand one hundred', TB.Numbers.enIndian(1100));
t('english 101 unchanged', TB.Numbers.enIndian(101) === 'one hundred and one', TB.Numbers.enIndian(101));

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
/* Tamil spelling does not mark voicing, so a letter-for-letter reading is
   not a pronunciation: அழகு is said azhagu, not aḻaku, and சாப்பிடு is
   saappidu, not cāppiṭu — the c being read as a k by everybody who meets
   it. The reading is built from position now. */
t('roman வணக்கம்', TB.Translit.romanTamil('வணக்கம்') === 'vanakkam',
  TB.Translit.romanTamil('வணக்கம்'));
t('ச is an s, not a c', TB.Translit.romanTamil('சாப்பிடு') === 'sāppidu',
  TB.Translit.romanTamil('சாப்பிடு'));
t('a stop between vowels is voiced', TB.Translit.romanTamil('அழகு') === 'azhagu',
  TB.Translit.romanTamil('அழகு'));
t('and doubled it is not', TB.Translit.romanTamil('பச்சை') === 'pachchai',
  TB.Translit.romanTamil('பச்சை'));
t('a stop after its nasal is voiced too', TB.Translit.romanTamil('தம்பி') === 'thambi'
  && TB.Translit.romanTamil('பஞ்சு') === 'panju',
  TB.Translit.romanTamil('தம்பி') + ' / ' + TB.Translit.romanTamil('பஞ்சு'));
t('and the nasal does not double the sound', TB.Translit.romanTamil('அங்கே') === 'angē',
  TB.Translit.romanTamil('அங்கே'));
t('ழ is written zh, as everybody writes it',
  TB.Translit.romanTamil('தமிழ்') === 'thamizh', TB.Translit.romanTamil('தமிழ்'));
t('every stored Tamil reading agrees with the reader', (function () {
  return TB.VOCAB.every(function (w) {
    return !w.ta || !w.taR || TB.Translit.romanTamil(w.ta) === w.taR;
  });
})());
/* And the Hindi ones, which were missed the first time round and still
   carried the scholarly spellings that produced "buxār": śubh, cār, pāṁc.
   The app shows stored and generated readings in different places, so a
   disagreement is visible to the person using it. */
t('every stored Hindi reading agrees with the reader', (function () {
  return TB.VOCAB.every(function (w) {
    return !w.hi || !w.hiR || TB.Translit.romanHindi(w.hi) === w.hiR;
  });
})(), (function () {
  var bad = TB.VOCAB.filter(function (w) {
    return w.hi && w.hiR && TB.Translit.romanHindi(w.hi) !== w.hiR;
  });
  return bad.slice(0, 3).map(function (w) { return w.hi + ' ' + w.hiR; }).join(' | ');
})());
t('and no stored reading uses the old notation',
  TB.VOCAB.every(function (w) {
    return !/[śṣñṅṁġ]/.test((w.hiR || '') + (w.taR || ''));
  }));
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


  /* ---------------- long pages, folded shut ---------------- */
  section('FOLDING');
  (function () {
    var css = fs.readFileSync(R + 'assets/styles.css', 'utf8');
    var v8  = fs.readFileSync(R + 'js/views8.js', 'utf8');
    var v9  = fs.readFileSync(R + 'js/views9.js', 'utf8');

    /* Sixteen rules, seventeen topics and nineteen conversations, all open
       at once, was a wall to scroll past rather than a page to use. */
    t('grammar rules are folded shut', /<details class="card gram fold"/.test(v8));
    t('conversations too', /<details class="card fold"/.test(v8));
    t('and the modern topics', /<details class="card mod fold"/.test(v9));

    /* A half-converted card is worse than none: an opening <div> with a
       closing </details> is a card the browser silently swallows. */
    [['js/views8.js', v8], ['js/views9.js', v9]].forEach(function (f) {
      var opens  = (f[1].match(/<details /g)  || []).length;
      var closes = (f[1].match(/<\/details>/g) || []).length;
      var heads  = (f[1].match(/<summary class="fold-head"/g) || []).length;
      t(f[0] + ': every fold is opened, headed and closed',
        opens === closes && opens === heads, opens + '/' + heads + '/' + closes);
    });

    /* And the three longest pages of all. */
    var v2 = fs.readFileSync(R + 'js/views2.js', 'utf8');
    var v5 = fs.readFileSync(R + 'js/views5.js', 'utf8');
    t('vocabulary is a list of themes, not three thousand words',
      /keys\.forEach\(function \(th, gi\)/.test(v2)
      && /<details class="card fold" data-theme=/.test(v2));
    /* Folding them hid the cost without removing it: <details> renders its
       children whether or not it is open, so the page still built all
       3,040 words — 49,004 nodes and 2.27MB, measured — to show 49
       headings. */
    t('and a theme is built only when it is opened',
      /if \(!box \|\| box\.firstChild\) return;/.test(v2)
      && /addEventListener\('toggle'/.test(v2));
    t('except the first, which is open from the start',
      /isOpen \? byTheme\[th\]\.map\(wordCard\)\.join\(''\) : ''/.test(v2)
      && /var isOpen = open1 \|\| gi === 0/.test(v2));
    /* Folding is right for browsing and wrong the moment somebody has
       asked for something: "water" matched nine themes and showed four
       cards, the rest folded away behind a search they had just run. */
    t('but a search opens everything it matched', /var open1 = !!q;/.test(v2));
    t('and so does a phrase search',
      /var first = \(shown\+\+ === 0\) \|\| !!q;/.test(
        fs.readFileSync(R + 'js/views5.js', 'utf8')));
    t('the sound groups fold', /P\.groups\.forEach\(function \(g, gi\)/.test(v2));
    t('and so does the phrasebook', /shown\+\+ === 0/.test(v5));
    /* Something has to stay open, or the page looks broken. */
    t('the first group of each is open',
      /isOpen \? ' open' : ''/.test(v2) && /gi === 0 \? ' open' : ''/.test(v2));
    /* And you should know how much is inside before you open it. */
    t('a folded group says how many are inside',
      /<span class="chip">' \+ byTheme\[th\]\.length/.test(v2)
      && /<span class="chip">' \+ g\.items\.length/.test(v2)
      && /<span class="chip">' \+ items\.length/.test(v5));
    [['js/views2.js', v2], ['js/views5.js', v5]].forEach(function (f) {
      var opens  = (f[1].match(/<details /g)  || []).length;
      var closes = (f[1].match(/<\/details>/g) || []).length;
      var heads  = (f[1].match(/<summary class="fold-head"/g) || []).length;
      t(f[0] + ': every fold is opened, headed and closed',
        opens === closes && opens === heads, opens + '/' + heads + '/' + closes);
    });

    t('the fold has styles to go with it', /\.fold-head \{/.test(css));
    t('and an arrow that turns when it opens',
      /\.fold\[open\] > \.fold-head::after/.test(css));
    /* Built on <details>, so the browser gives us the keyboard, find-in-page
       and screen readers without any of it being written here. */
    t('nothing scripts the opening and closing',
      !/classList\.toggle\('open'\)/.test(v8) && !/classList\.toggle\('open'\)/.test(v9));
    /* A link straight to one topic has to open it, not just scroll to it. */
    t('a linked topic opens itself', /el\.open = true/.test(v9));
  })();

  /* ---------------- counting on a slate ---------------- */
  section('COUNTING');
  (function () {
    /* Loaded on its own against a stub, so this tests the drawing and not
       the rest of the app. */
    var box = { TB: { Numbers: TB.Numbers, Views: {
      esc: function (x) { return String(x); }, speakBtn: function () { return ''; },
      readAid: function () { return ''; }, D: function () { return { stats: {} }; },
      saveD: function () {} } } };
    box.window = box;
    vm.runInContext(fs.readFileSync(R + 'js/views12.js', 'utf8'),
      vm.createContext(box), { filename: 'js/views12.js' });
    var tally = box.TB.Views.tallyMarks;
    t('the tally marks are there to draw', typeof tally === 'function');
    if (typeof tally !== 'function') return;

    function lines(n) { return (tally(n).match(/<line /g) || []).length; }
    function groups(n) { return (tally(n).match(/<svg /g) || []).length; }

    t('nothing counted draws nothing', /tally-empty/.test(tally(0)) && lines(0) === 0);
    t('four is four strokes and no group', lines(4) === 4 && !/fifth/.test(tally(4)));
    /* The whole point of the fifth stroke: it goes across the other four,
       so five is seen rather than counted. */
    t('five is four strokes and one across',
      lines(5) === 5 && (tally(5).match(/class="fifth"/g) || []).length === 1);
    t('and it is still one group', groups(5) === 1);
    t('six starts a second group', groups(6) === 2 && lines(6) === 6);
    t('twelve is two fives and two', groups(12) === 3 && lines(12) === 12
      && (tally(12).match(/class="fifth"/g) || []).length === 2);
    /* Every count from one to sixty draws exactly that many strokes. */
    var bad = [];
    for (var n = 1; n <= 60; n++) {
      if (lines(n) !== n || groups(n) !== Math.ceil(n / 5)) bad.push(n);
    }
    t('every count up to sixty draws exactly that many strokes',
      bad.length === 0, bad.slice(0, 5).join(','));

    var html = fs.readFileSync(R + 'index.html', 'utf8');
    var app  = fs.readFileSync(R + 'js/app.js', 'utf8');
    var css  = fs.readFileSync(R + 'assets/styles.css', 'utf8');
    t('the page loads it', /js\/views12\.js/.test(html));
    t('the router reaches it', /count: 'count'/.test(app));
    t('the drawer has a way in', /href="#\/count"/.test(html));
    t('and it looks like a slate', /\.tally \{/.test(css) && /\.tally-group line/.test(css));
  })();

  /* ---------------- how big the text is ---------------- */
  section('TEXT SIZE');
  (function () {
    var css = fs.readFileSync(R + 'assets/styles.css', 'utf8');
    var app = fs.readFileSync(R + 'js/app.js', 'utf8');

    /* There were three text sizes and a button to change them, and the
       button moved the root font size \u2014 which nothing here is measured in.
       An elder pressed it and the page did not move a hair. */
    var plain = (css.match(/font-size: *[0-9.]+px(?! *\*)/g) || [])
      .filter(function (x) { return !/var\(--fs/.test(x); });
    t('no size in the stylesheet is left behind', plain.length === 0,
      plain.slice(0, 4).join(' | '));
    t('every size is multiplied by one number', /var\(--fs, 1\)/.test(css));
    t('which is declared', /:root \{ --fs: 1; \}/.test(css));
    t('and has a bigger value to take', /data-size="largest"\]\s*\{ --fs: 1\.34; \}/.test(css));
    t('the button sets it', /setProperty\('--fs', fs\)/.test(app));
    t('and says which size you are on', /b\.title = 'Text size: '/.test(app));

    /* The sizes written inline in the views have to follow, or half the
       page grows and half of it does not. */
    var left = [];
    ['js/views.js', 'js/views2.js', 'js/views3.js', 'js/views4.js', 'js/views5.js',
     'js/views6.js', 'js/views7.js', 'js/views8.js', 'js/views9.js', 'js/views10.js',
     'js/views11.js', 'js/views12.js'].forEach(function (f) {
      var s = fs.readFileSync(R + f, 'utf8');
      (s.match(/font-size: *[0-9.]+px/g) || []).forEach(function (m) { left.push(f + ' ' + m); });
    });
    t('nor do the sizes written into the views', left.length === 0, left.slice(0, 4).join(' | '));
  })();

  /* ---------------- depth ---------------- */
  section('DEPTH');
  (function () {
    var css = fs.readFileSync(R + 'assets/styles.css', 'utf8');
    var dep = fs.readFileSync(R + 'js/depth.js', 'utf8');
    var html = fs.readFileSync(R + 'index.html', 'utf8');
    var app = fs.readFileSync(R + 'js/app.js', 'utf8');

    t('the page loads it', /js\/depth\.js/.test(html));
    t('a drawn view is told to arrive', /TB\.Depth\.reveal\(root\)/.test(app));

    /* The rule that hides a card before it is scrolled to must be locked
       behind a class the script itself puts on. If the script never runs,
       the class never appears, and nothing is ever hidden. */
    var hides = (css.match(/[^\n]*\.rv \{[^}]*opacity: 0[^}]*\}/g) || []);
    t('nothing is hidden unless the script that shows it is running',
      hides.length > 0 && hides.every(function (r) { return /html\.depth /.test(r); }),
      hides.join(' | ').slice(0, 120));
    t('and there is a last resort that shows everything anyway',
      /setTimeout\(showAll/.test(dep));

    /* A person who asked for less movement gets none of it, and a finger
       is not a pointer. */
    t('less movement means none of this',
      /prefers-reduced-motion: reduce/.test(dep) && /if \(!still\)/.test(dep));
    t('a touch screen gets no tilt',
      /\(hover: hover\) and \(pointer: fine\)/.test(dep));
    t('one listener for the whole page, not one per card',
      /document\.addEventListener\('pointermove'/.test(dep)
      && !/forEach[\s\S]{0,80}addEventListener\('pointermove'/.test(dep));
    t('and it writes once a frame', /requestAnimationFrame\(apply\)/.test(dep));

    /* The depth scale is the whole vocabulary; nothing invents its own. */
    ['--sh-1', '--sh-2', '--sh-3', '--sh-4', '--rim'].forEach(function (k) {
      t('the depth scale has ' + k, css.indexOf(k + ':') > 0);
    });
    t('the dark theme redraws it, because a shadow cannot be seen in the dark',
      /data-theme="dark"\]\s*\{[\s\S]{0,700}--rim:/.test(css));
    /* Gradient text that a browser cannot paint is text nobody can read. */
    t('the gradient title is guarded',
      /@supports \(\(-webkit-background-clip: text\)/.test(css));
  })();

  /* ---------------- the logo ---------------- */
  section('THE LOGO');
  (function () {
    var html = fs.readFileSync(R + 'index.html', 'utf8');
    var app  = fs.readFileSync(R + 'js/app.js', 'utf8');
    t('the logo is a link, not a picture', /<a class="brand" href="#\/home"/.test(html));
    /* A hash that has not changed raises no event, so pressing the logo on
       the home page would otherwise do nothing at all. */
    t('and pressing it at home draws the page fresh',
      /location\.hash === '#\/home'[\s\S]{0,40}render\(\)/.test(app));
  })();

  /* ---------------- Tamil sounds ---------------- */
  section('TAMIL SOUNDS');
  (function () {
    var P = TB.PHONICS.ta;
    var items = [];
    P.groups.forEach(function (g) { g.items.forEach(function (i) { items.push(i); }); });

    /* It used to be thirty bare letters and a romanisation, which is a
       table, not a lesson \u2014 in the one language every person here already
       speaks. */
    t('Tamil has as much to say as English and Hindi', items.length >= 49, items.length);
    t('all twelve vowels, all eighteen consonants, aytham and the borrowed six',
      P.groups.length >= 7, P.groups.length);
    var noNote = items.filter(function (i) { return !i.note; });
    t('every sound says something about itself', noNote.length === 0, noNote.length);

    /* A sound on its own teaches nothing. The letters get a word you
       already know with the sound in it; the uyirmei table does not,
       because it is showing how two letters join, not how one sounds. */
    var letters = items.filter(function (i) { return i.taR && i.taR.length <= 9 && i.ex; });
    t('and most carry a word you can press and hear', letters.length >= 35, letters.length);

    /* The three that are genuinely hard, and the reason the app exists. */
    function find(ch) {
      return items.filter(function (i) { return i.ta === ch; })[0];
    }
    t('\u0bb4 is marked as the hard one', find('\u0bb4\u0bcd') && find('\u0bb4\u0bcd').hard);
    t('so is \u0bb3', find('\u0bb3\u0bcd') && find('\u0bb3\u0bcd').hard);
    t('and \u0bb1, which is not \u0bb0', find('\u0bb1\u0bcd') && find('\u0bb1\u0bcd').hard);
    /* The thing that is hard to find written down anywhere. */
    t('and the letter that changes sound by where it sits is called out',
      /magan/.test(JSON.stringify(P)) && /akk/.test(JSON.stringify(P)));
    t('the spelling rules are there too', P.rules.length >= 5, P.rules.length);
    t('including the three l\u2019s', /\u0bb2 \u0bb3 \u0bb4/.test(JSON.stringify(P)));

    /* And the view has to actually show the example, or none of it lands. */
    var v2 = fs.readFileSync(R + 'js/views2.js', 'utf8');
    t('the page shows the word, not just the symbol', /class="ph-ex"/.test(v2));
  })();


  /* ---------------- the number chart speaks ---------------- */
  section('THREE VOICES');
  (function () {
    var v11 = fs.readFileSync(R + 'js/views11.js', 'utf8');
    var v12 = fs.readFileSync(R + 'js/views12.js', 'utf8');
    var vw  = fs.readFileSync(R + 'js/views.js', 'utf8');
    var css = fs.readFileSync(R + 'assets/styles.css', 'utf8');

    t('the helper is shared, not copied into one view',
      /sayAllThree: sayAllThree/.test(vw)
      && !/function sayAllThree/.test(v11) && !/function sayAllThree/.test(v12));

    /* A tap used to read the Tamil and stop. */
    t('the chart no longer reads only the Tamil',
      !/TB\.Speech\.speak\(ta, 'ta'/.test(v11));
    t('it reads all three', /V\.sayAllThree\(shown\.en, shown\.ta, shown\.hi/.test(v11));

    /* And you can ask for one language when you want to drill it. */
    t('there is a chooser for which voices play', /id="cVoice"/.test(v11));
    ['all', 'en', 'ta', 'hi'].forEach(function (k) {
      t('with ' + k + ' on it', v11.indexOf('data-v="' + k + '"') > 0);
    });
    t('all three is what it starts on', /class="pill on" data-v="all"/.test(v11));
    t('one language selected plays that one only',
      /voice === 'en' \? shown\.en : voice === 'hi' \? shown\.hi : shown\.ta/.test(v11));

    /* The button says "all three", so it gives all three whatever the
       chooser is set to \u2014 otherwise it lies. */
    t('the replay button is there', /id="cAll"/.test(v11));
    t('and gives all three whatever the chooser says', /say\(true\)/.test(v11));

    /* The same three names on the counting page get the same button. */
    t('counting can hear its number in all three', /data-all="1"/.test(v12)
      && /V\.sayAllThree\(named\.en, named\.ta, named\.hi/.test(v12));

    /* Three languages in a row only teach if you can see which one you are
       hearing. */
    t('the line being read lights up', /\.lang-line\.saying \{/.test(css));
  })();


  /* ---------------- one voice at a time ----------------
     Pressing Play in spoken practice read a few sentences in pieces and
     then the last one properly, and pressing a speaker while something was
     already talking gave you both at once. */
  section('ONE VOICE AT A TIME');
  (function () {
    var sp = fs.readFileSync(R + 'js/speech.js', 'utf8');
    var v8 = fs.readFileSync(R + 'js/views8.js', 'utf8');

    /* Two things here can make a sound: the voice in the device, and, when
       there is none for the language, an audio file over the network.
       Cancelling only ever touched the first. */
    t('there is one place that stops everything', /function silence\(\)/.test(sp));
    t('and it stops the network voice as well as the device one',
      /function silence\(\)[\s\S]{0,500}netStop/.test(sp)
      && /function silence\(\)[\s\S]{0,500}netAudio\.pause/.test(sp));
    t('everything that starts a sound goes through it',
      (sp.match(/\bsilence\(\);/g) || []).length >= 4,
      (sp.match(/\bsilence\(\);/g) || []).length);
    /* Being cut off is not the same as the device having no voice, and
       saying so put a warning on the screen for an ordinary second press. */
    t('being interrupted is not reported as a missing voice',
      /netToken !== queueToken\) return false/.test(sp));

    /* A reading used to hand its place in the queue to each line and take
       it back afterwards \u2014 including from whatever had just cancelled it. */
    t('a reading has a name of its own', /var mine = \+\+seqId/.test(sp));
    t('which a direct call takes away', /if \(opts\.seq == null\) seqId\+\+/.test(sp));
    t('and a stop takes away', /seqId\+\+;\s+\/\* and any reading/.test(sp));
    t('but its own lines do not', /seq: mine,/.test(sp));
    t('the juggling that let a cancelled reading creep back is gone',
      !/queueToken = token - 1/.test(sp));

    /* Measured in the browser: one press of Play started one reading after
       a fresh load, two after one language switch, three after two. */
    t('the spoken-practice handler replaces rather than piles up',
      /bodyHandlers\.length = 0; bodyHandlers\.push\(fn\)/.test(v8));
    t('and does not survive a change of tab',
      /bodyHandlers\.length = 0;\s*[\r\n]\s*if \(tab === 'grammar'\)/.test(v8));
    /* The speaker inside a line is handled globally; the line itself was
       handled again here, so one press said it twice, over itself. */
    t('a line with a speaker on it is said once, not twice',
      /closest\('\.talk'\)[\s\S]{0,400}!e\.target\.closest\('\[data-speak\]'\)/.test(v8));

    /* And a guess at how long words take cut long lines off part-way. */
    t('a line is given as long as the engine is still talking',
      /speechSynthesis\.speaking \|\| window\.speechSynthesis\.pending/.test(sp));
  })();

  /* The behaviour itself, against a stand-in engine that actually finishes
     each line so the order can be read back. */
  await (async function () {
    var said = [], busy = false, cur = null;
    var ss = ctx.speechSynthesis;
    var realUtt = ctx.SpeechSynthesisUtterance;
    var realSpeak = ss.speak, realCancel = ss.cancel;

    ctx.SpeechSynthesisUtterance = function (text) { this.text = text; };
    Object.defineProperty(ss, 'speaking', { get: function () { return busy; }, configurable: true });
    Object.defineProperty(ss, 'pending', { get: function () { return false; }, configurable: true });
    ss.speak = function (u) {
      said.push(u.text); busy = true; cur = u;
      setTimeout(function () {
        if (cur === u) { busy = false; cur = null; if (u.onend) u.onend(); }
      }, 4);
    };
    ss.cancel = function () {
      busy = false;
      var u = cur; cur = null;
      if (u && u.onerror) u.onerror();
    };

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function lines(names, pause) {
      return names.map(function (n) { return { text: n, lang: 'en', pause: pause }; });
    }

    try {
      said.length = 0;
      await TB.Speech.sequence(lines(['one', 'two', 'three'], 4));
      t('a reading says every line', said.length === 3, said.join('|'));
      t('in the order it was given', said.join(',') === 'one,two,three', said.join(','));

      /* An empty line used to return without claiming the queue, which
         threw the whole count out. */
      said.length = 0;
      await TB.Speech.sequence([
        { text: 'x', lang: 'en', pause: 4 },
        { text: '',  lang: 'en', pause: 4 },
        { text: 'y', lang: 'en', pause: 4 }
      ]);
      t('an empty line is stepped over, not spoken', said.join(',') === 'x,y', said.join(','));

      /* Something else speaking takes the voice. */
      said.length = 0;
      TB.Speech.sequence(lines(['a', 'b', 'c', 'd'], 60));
      await wait(25);
      TB.Speech.speak('somebody else', 'en');
      await wait(400);
      t('another voice starting ends the reading',
        said.indexOf('c') < 0 && said.indexOf('d') < 0, said.join(','));
      t('and what interrupted it is what is heard',
        said[said.length - 1] === 'somebody else', said.join(','));

      /* So does stopping, and so does cancelling. */
      said.length = 0;
      TB.Speech.sequence(lines(['p', 'q', 'r'], 60));
      await wait(25);
      TB.Speech.stop();
      await wait(400);
      t('stopping ends it', said.join(',') === 'p', said.join(','));

      said.length = 0;
      var run = TB.Speech.sequence(lines(['s', 't', 'u'], 60));
      await wait(25);
      run.cancel();
      await wait(400);
      t('cancelling ends it', said.join(',') === 's', said.join(','));

      /* The fault itself: one press of Play used to start several readings,
         and a cancelled one carried on underneath the new one. */
      said.length = 0;
      TB.Speech.sequence(lines(['old1', 'old2', 'old3', 'old4'], 40));
      await wait(10);
      TB.Speech.sequence(lines(['new1', 'new2', 'new3'], 10));
      await wait(500);
      t('a reading that was cut off does not creep back',
        said.filter(function (x) { return /^old/.test(x); }).length <= 1, said.join(','));
      t('and the one that took over reads every line, in order',
        said.filter(function (x) { return /^new/.test(x); }).join(',') === 'new1,new2,new3',
        said.join(','));

    } finally {
      /* The rest of the suite gets its own engine back. */
      ctx.SpeechSynthesisUtterance = realUtt;
      ss.speak = realSpeak; ss.cancel = realCancel;
    }
  })();


  /* ---------------- Hindi that can be read ---------------- */
  section('HINDI, READABLE');
  (function () {
    var v8 = fs.readFileSync(R + 'js/views8.js', 'utf8');
    var v9 = fs.readFileSync(R + 'js/views9.js', 'utf8');
    var v10 = fs.readFileSync(R + 'js/views10.js', 'utf8');
    var vw = fs.readFileSync(R + 'js/views.js', 'utf8');

    /* Devanagari with nothing under it is decoration to somebody who reads
       Tamil. Five places showed it bare. */
    t("a conversation's other two languages carry their reading",
      /others\.map\(function \(o\) \{[\s\S]{0,260}readAid\(l\[o\], o\)/.test(v8));
    t('the grammar card title does too', /V\.hiTamil\(t\.title\.hi\)/.test(v8));
    t('and the modern topic title', /V\.hiTamil\(t\.title\.hi\)/.test(v9));
    t('and the word chips inside it', /V\.hiTamil\(w\.hi\)/.test(v9));
    t('and the number the abacus asks for', /V\.hiTamil\(TB\.Numbers\.hi\(target\)\)/.test(v10));
    t('the one-line reading is shared, not copied', /hiTamil: hiTamil/.test(vw)
      && (vw.match(/function hiTamil/g) || []).length === 1);
    t('and it gives back nothing rather than something wrong',
      /if \(!r \|\| !r\.can \|\| !r\.tamil\) return ..;/.test(vw));

    /* The nasal. Before a stop it takes that stop's place of articulation,
       which already worked. Everywhere else it fell back to ம் — a lip
       sound that is not there — so हैं read as ஹைம் and नहीं as நஹீம்,
       while the English reading beside it said hain and nahin all along. */
    function ta(w) { return TB.Translit.readings(w, 'hi').tamil; }
    t('a word-final nasal reads as n, as the English beside it says',
      ta('हैं') === 'ஹைன்', ta('हैं'));
    t('and so does one before a non-stop', ta('नहीं') === 'நஹீன்', ta('नहीं'));
    /* But it must still take the place of the stop that follows it. */
    t('before a lip sound it is still m', /ம்ப/.test(ta('कंपनी')), ta('कंपनी'));
    t('before a k sound it is ng', /ங்க/.test(ta('गंगा')), ta('गंगा'));
    t('before a d sound it is n', /ந்த/.test(ta('हिंदी')), ta('हिंदी'));
    t('before a j sound it is ny', /ஞ்ஜ/.test(ta('संज्ञा')), ta('संज्ञा'));
  })();


  /* ---------------- the number chart ---------------- */
  section('NUMBER CHART');
  (function () {
    var v11 = fs.readFileSync(R + 'js/views11.js', 'utf8');

    /* Six fixed ranges and nothing else: no way to ask for 101 to 2,000,
       and no way to look up one number. */
    t('there is a thousand-long chart', /data-r="1-1000"/.test(v11));
    t('and a range you choose yourself', /data-r="any"/.test(v11)
      && /id="cFrom"/.test(v11) && /id="cTo"/.test(v11));
    t('and a box to find one number', /id="cFind"/.test(v11));

    /* 101 to ten lakh is 9,99,900 numbers. Drawing them all would hang the
       browser; refusing would be a limit dressed up as an answer. */
    t('a long range is paged rather than refused', /var PAGE = 500/.test(v11)
      && /Math\.ceil\(howMany\(\) \/ PAGE\)/.test(v11));
    t('only the page being looked at is built',
      /for \(var i = 0; i < PAGE; i\+\+\)/.test(v11));
    t('and the pages are only shown when there is more than one',
      /if \(n <= 1\) return ..;/.test(v11));

    /* Said backwards is still a range. */
    t('a range given backwards is turned round',
      /if \(a > b\) \{ var t = a; a = b; b = t; \}/.test(v11));
    t('and one past what the names can say is clipped, and says so',
      /These names go up to/.test(v11) && /b = MAX;/.test(v11));
    t('an empty box is told, not ignored', /Put a number in both boxes/.test(v11));

    /* Finding a number opens the chart at it rather than leaving somebody
       to scroll for it. */
    t('finding a number opens the chart at it',
      /from = n; to = Math\.min\(MAX, n \+ 99\)/.test(v11) && /found = n;/.test(v11));
    t('and marks it so the eye lands on it',
      /n === found \? . on found./.test(v11));
    var css = fs.readFileSync(R + 'assets/styles.css', 'utf8');
    t('which has a style to be marked with', /\.num-cell\.found \{/.test(css));

    /* The card under the chart is reached two ways now, so it is written
       once. */
    t('the card is written once for both ways in', /function cardFor\(/.test(v11)
      && (v11.match(/function showOne\(/g) || []).length === 1);
  })();





  /* ---------------- \u0b94 ---------------- */
  (function () {
    var TA = TB.ALPHABET.ta;
    var au = TA.vowels.filter(function (v) { return v.ch === '\u0b94'; })[0];
    var v2 = fs.readFileSync(R + 'js/views2.js', 'utf8');

    /* The letter standing alone reads ow, as in now. Inside a syllable the
       same vowel composes as au \u2014 \u0b95\u0bcc kau, \u0b99\u0bcc ngau, which was checked and
       approved. One reading cannot serve both, so the card has its own. */
    /* One reading, not two. I had it ow on the card and au inside a
       syllable, preserving an earlier answer instead of following the
       instruction given since. A reading that changes with which table
       you are looking at is not a reading. */
    t('\u0b94 reads ow', au.say === 'ow');
    t('and so does every \u0bcc in the grid', (function () {
      return TA.grid.every(function (r) { return /ow$/.test(r.cells[11].say); });
    })(), TA.grid.map(function (r) { return r.cells[11].say; }).slice(0, 4).join(' '));
    t('\u0b95\u0bcc is kow', (function () {
      var k = TA.grid.filter(function (r) { return r.base === '\u0b95'; })[0];
      return k.cells[11].say === 'kow';
    })());
    t('and the scholarly au stays underneath', au.r === 'au');
    /* "ow as in now" got the start right and left the finish to guesswork,
       and the finish is the whole of it: \u0b94 lands on \u0b89. */
    t('and says where the sound ends', /ending on an oo/.test(au.en));
    t('the example is written out, not clipped', au.ex === '\u0b94\u0bb5\u0bc8\u0baf\u0bbe\u0bb0\u0bcd');
  })();
  /* ---------------- the Hindi letters ---------------- */
  section('HINDI LETTERS');
  (function () {
    var HI = TB.ALPHABET.hi;
    function f(ch) {
      var o = null;
      HI.vowels.forEach(function (v) { if (v.ch === ch) o = v; });
      HI.rows.forEach(function (r) { r.items.forEach(function (i) { if (i.ch === ch) o = i; }); });
      return o;
    }

    /* \u091c\u094d\u091e\u093e\u0928 is said gy\u0101n, not ny\u0101n: \u091c\u094d\u091e is pronounced "gy" in Hindi, so
       the one word on \u091e's card demonstrated a sound the letter was not
       making. The /\u0272/ is written with the anusvara instead. */
    t('\u091e no longer points at \u091c\u094d\u091e\u093e\u0928, which is said gy\u0101n',
      f('\u091e').ex !== '\u091c\u094d\u091e\u093e\u0928', f('\u091e').ex);
    t('and says where the sound really is', /\u092a\u0902\u091a/.test(f('\u091e').en));
    /* \u0930\u0902\u0917 does not contain \u0919 \u2014 it contains the anusvara. */
    t('\u0919 says that modern Hindi writes this sound with the anusvara',
      /anusvara/.test(f('\u0919').en));

    /* Named in the varnamala as a Hindi primer gives them. */
    t('the anusvara is named am', f('\u0905\u0902').say === 'am');
    t('and says its sound changes with what follows',
      /takes the place of the consonant after it/.test(f('\u0905\u0902').en));
    t('the visarga is aha', f('\u0905\u0903').say === 'aha');

    /* None of these can be said alone by a voice trained on Hindi, because
       no Hindi word begins with them. Each gets a sayable form of THE
       LETTER \u2014 \u0905\u0919\u094d, \u0905\u091e\u094d, \u0905\u0923\u094d \u2014 a vowel in front and its own vowel
       killed, the convention Tamil already names its mei letters with.
       Not a substitute for the letter: for a while sayAs pointed at the
       example word, so the card said only the word and the letter was
       never heard, which is worse than the problem it was fixing. */
    var v2b = fs.readFileSync(R + 'js/views2.js', 'utf8');
    [['\u0919', '\u0905\u0919\u094d'], ['\u091e', '\u0905\u091e\u094d'], ['\u0923', '\u0905\u0923\u094d'],
     ['\u0905\u0902', '\u0905\u092e\u094d'], ['\u0905\u0903', '\u0905\u0939']].forEach(function (p) {
      t(p[0] + ' has a sayable form of itself', f(p[0]).letterSay === p[1],
        f(p[0]).letterSay);
      /* It must be the letter, not the word. */
      t('and it is not the example word', f(p[0]).letterSay !== f(p[0]).ex);
    });
    t('the card speaks that form, then the word',
      /it\.letterSay \|\| letter/.test(v2b)
      && /if \(word && mode === 'pair' && !solo\)/.test(v2b));
    t('and shows it, so the reading and the sound agree',
      /class="alpha-alone"/.test(v2b));

    /* The words a Hindi child is actually taught. */
    [['\u0917', '\u0917\u092e\u0932\u093e'], ['\u0918', '\u0918\u0930'], ['\u091a', '\u091a\u092e\u091a'], ['\u091b', '\u091b\u0924\u0930\u0940'],
     ['\u091d', '\u091d\u0930\u0928\u093e'], ['\u0920', '\u0920\u0920\u0947\u0930\u093e'], ['\u0921', '\u0921\u092e\u0930\u0942'], ['\u0922', '\u0922\u0915\u094d\u0915\u0928'],
     ['\u0923', '\u092c\u093e\u0923'], ['\u0924', '\u0924\u0930\u092c\u0942\u091c'], ['\u0925', '\u0925\u0930\u094d\u092e\u0938'], ['\u0926', '\u0926\u0935\u093e'],
     ['\u0932', '\u0932\u091f\u094d\u091f\u0942'], ['\u0935', '\u0935\u0915\u0940\u0932'], ['\u0936', '\u0936\u0932\u0917\u092e'], ['\u0938', '\u0938\u0921\u093c\u0915'],
     ['\u0939', '\u0939\u093e\u0925']].forEach(function (p) {
      t(p[0] + ' is for ' + p[1], f(p[0]).ex === p[1], f(p[0]).ex);
    });
    /* \u0932\u091f\u094d\u091f\u0942 is a spinning top; \u0932\u0921\u094d\u0921\u0942 is a sweet. Different words, and I
       had the wrong one. */
    t('and \u0932 is the top, not the laddu', f('\u0932').exEn === 'spinning top');

    /* Every one complete, in all three. */
    (function () {
      var all = HI.vowels.slice();
      HI.rows.forEach(function (r) { all = all.concat(r.items); });
      var bad = all.filter(function (x) {
        return !x.say || !x.ex || !x.exR || !x.exEn || !x.exTa || !x.exHi;
      });
      /* A letter that modern Hindi writes with the anusvara does not appear
       in its own modern spelling — which is exactly why those two cards
       were hard to follow. The traditional spelling is the only place the
       letter itself can be seen, so both are shown. */
    t('ङ shows गङ्गा beside गंगा', f('ङ').oldEx === 'गङ्गा', f('ङ').oldEx);
    t('ञ shows चञ्चल beside चंचल',
      f('ञ').ex === 'चंचल' && f('ञ').oldEx === 'चञ्चल', f('ञ').ex + '/' + f('ञ').oldEx);
    t('the old spelling really contains the letter',
      f('ङ').oldEx.indexOf('ङ') >= 0 && f('ञ').oldEx.indexOf('ञ') >= 0);
    t('while the modern one does not, which is the point',
      f('ङ').ex.indexOf('ङ') < 0 && f('ञ').ex.indexOf('ञ') < 0);
    t('and the card shows it', /class="alpha-old"/.test(v2b));

    t('every Hindi letter is complete in all three languages',
        bad.length === 0, bad.map(function (x) { return x.ch; }).join(' '));
    })();
  })();

  /* ---------------- a second test pass ---------------- */
  section('TEST PASS 2');
  (function () {
    var v2 = fs.readFileSync(R + 'js/views2.js', 'utf8');

    /* Pressing a voice button on the alphabet page threw every time:
       `lang` is a variable of html() and the handler lives in mount(), a
       different scope. Nobody had pressed it since the preview was added,
       so it had never been seen. */
    t('the voice button does not reach for a variable it cannot see',
      !/TB\.Speech\.speak\(lang ===/.test(v2));
    t('it reads the tab from the address, which both scopes can',
      /var tab = \(location\.hash\.split\('\/'\)\[2\] \|\| 'ta'\);/.test(v2));

    /* Four controls in Settings had a <label> beside them and no `for`, so
       nothing tied the two together. */
    ['sVoiceTa', 'sVoiceEn', 'sVoiceHi'].forEach(function (id) {
      t(id + ' has its label tied on', v2.indexOf('<label for="' + id + '">') > 0);
    });
    t('and the import file input has a name', /id="sImport"[\s\S]{0,140}aria-label=/.test(v2));

    /* \u0b99\u0bcc: no Tamil word, and no voice here that says it correctly. A
       wrong sound on a chart a child copies is worse than none. */
    var ng = TB.ALPHABET.ta.grid.filter(function (r) { return r.base === '\u0b99'; })[0];
    t('\u0b99\u0bcc is the only silent cell in 216',
      ng.cells.filter(function (c) { return c.mute; }).length === 1
      && ng.cells[11].mute === true);
    t('and \u0b99\u0bca is not silent', ng.cells[9].mute === false);
    t('a silent cell is given no speak target at all',
      /mute \? '' : ' data-speak=/.test(v2));
    t('and says so on its face', /no sound here/.test(v2));

    /* \u0bcc reads ow everywhere, not au in one table and ow in another. */
    var au = TB.ALPHABET.ta.vowels.filter(function (v) { return v.ch === '\u0b94'; })[0];
    t('\u0bcc reads ow on the card', au.say === 'ow');
    t('and in every row of the grid',
      TB.ALPHABET.ta.grid.every(function (r) { return /ow$/.test(r.cells[11].say); }));
    t('and in the stand-alone cluster', ng.cells[11].onItsOwnR === 'angow');
  })();
  /* ---------------- the letter grids ---------------- */
  section('THE GRIDS');
  (function () {
    var TA = TB.ALPHABET.ta, HI = TB.ALPHABET.hi;
    var v2 = fs.readFileSync(R + 'js/views2.js', 'utf8');

    /* The cards were fixed and the tables under them were not: the \u0b99 row
       read \u1e45a and the \u0b9a row read ca, which tells an English reader to say
       "ka" \u2014 the one sound \u0b9a never makes. */
    function cell(grid, base, i) {
      var row = grid.filter(function (r) { return (r.base || r.ch) === base; })[0];
      return row && row.cells[i];
    }
    t('every Tamil grid cell has a reading a learner can use', (function () {
      var bad = [];
      TA.grid.forEach(function (r) { r.cells.forEach(function (c) { if (!c.say) bad.push(c.ch); }); });
      return bad.length === 0;
    })());
    t('\u0b99 reads nga, not \u1e45a', cell(TA.grid, '\u0b99', 0).say === 'nga');
    t('\u0b9a reads sa, not ca', cell(TA.grid, '\u0b9a', 0).say === 'sa');
    t('and a long vowel reads long', cell(TA.grid, '\u0b95', 3).say === 'kee');
    t('the scholarly form is kept underneath', cell(TA.grid, '\u0b99', 0).r === '\u1e45a');

    /* Readable alone is ambiguous: three rows become "na", two "la", two
       "ra". The scholarly mark is what tells them apart, so both are
       printed and a legend names the sets. */
    (function () {
      var by = {};
      TA.grid.forEach(function (r) { (by[r.cells[0].say] = by[r.cells[0].say] || []).push(r.base); });
      var collide = Object.keys(by).filter(function (k) { return by[k].length > 1; });
      t('the readings that collide are known', collide.sort().join(',') === 'la,na,ra', collide.join(','));
      var bothShown = TA.grid.every(function (r) {
        return r.cells.every(function (c) { return c.say && c.r && c.say !== c.r; })
            || r.cells.every(function (c) { return c.say && c.r; });
      });
      t('and every cell carries both forms', bothShown);
    })();
    t('the grid prints the reading and the scholarly form',
      /<span class="say">' \+ esc\(c\.say\)/.test(v2) && /<span class="r">' \+ esc\(c\.r\)/.test(v2));
    t('and a legend names the ones that sound alike',
      (v2.match(/class="grid-legend"/g) || []).length === 2);
    /* \u0b99 is /\u014b/ \u2014 the ng of singer, not of finger. "nga" alone invites a
       hard g that is not there. */
    t('and says which ng \u0b99 is', /the ng of <i>singer<\/i>, not of <i>finger<\/i>/.test(v2));

    /* \u0b99 is the one Tamil letter never met on its own: it lives in the
       cluster \u0b99\u0bcd\u0b95. A voice asked for \u0b99\u0bca gave back "ango" \u2014 \u0b85\u0b99\u0bcd\u0b95\u0bc1, the
       nearest real thing it knew \u2014 because the bare syllable is not
       something Tamil contains for it to have learnt. So that row is not
       bare syllables: every cell carries a word with \u0b99 in it. */
    (function () {
      var ng = TA.grid.filter(function (r) { return r.base === '\u0b99'; })[0];
      /* \u0b99 never carries a vowel. It is \u0b99\u0bcd before \u0b95, and the vowel sits on
         that \u0b95 \u2014 so the cell labelled \u0b99\u0bbf is really the cluster \u0b99\u0bcd\u0b95\u0bbf, and
         its word has to contain THAT, not merely \u0b99. Every word in the row
         used to be a plain \u0b99\u0bcd\u0b95 word, so it taught one sound twelve times
         while the labels said twelve different ones. */
      t('every \u0b99 cell names the cluster it is really about',
        ng.cells.filter(function (c) { return c.cluster; }).length === 12);
      t('and every word contains its own cell\u2019s cluster, not just \u0b99',
        ng.cells.every(function (c) { return !c.word || c.word.indexOf(c.cluster) >= 0; }),
        ng.cells.filter(function (c) { return c.word && c.word.indexOf(c.cluster) < 0; })
          .map(function (c) { return c.cluster + '/' + c.word; }).join(' '));
      t('ten of the twelve have an everyday word',
        ng.cells.filter(function (c) { return c.word; }).length === 10,
        ng.cells.filter(function (c) { return c.word; }).length);
      /* \u0b99\u0bcd\u0b95\u0bca and \u0b99\u0bcd\u0b95\u0bcc have no everyday word. That does not mean they have
         no sound \u2014 the cluster is pronounceable, it just never starts a
         word anyone uses. Named the way a mei letter is named (\u0b87\u0b95\u0bcd, \u0b87\u0b99\u0bcd)
         it becomes \u0b87\u0b99\u0bcd\u0b95\u0bca and \u0b87\u0b99\u0bcd\u0b95\u0bcc: a real syllable shape, the same as
         \u0b87\u0b99\u0bcd\u0b95\u0bc1, which a voice can say where it could not say \u0b99\u0bca. */
      (function () {
        var wordless = ng.cells.filter(function (c) { return c.cluster && !c.word; });
        t('the two without a word are \u0b99\u0bcd\u0b95\u0bca and \u0b99\u0bcd\u0b95\u0bcc',
          wordless.length === 2
          && wordless[0].cluster === '\u0b99\u0bcd\u0b95\u0bca' && wordless[1].cluster === '\u0b99\u0bcd\u0b95\u0bcc',
          wordless.map(function (c) { return c.cluster; }).join(' '));
        t('and they still have a sound to say',
          wordless.every(function (c) { return c.onItsOwn && c.onItsOwnR; }));
        /* The cluster itself, read ngo and ngau \u2014 not with a vowel put in
           front of it. I had them as \u0b87\u0b99\u0bcd\u0b95\u0bca and ingo, which is the convention
           a MEI letter is named by; these are not mei letters. */
        t('which is \u0b85 and the cluster, read ango and angow',
          wordless[0].onItsOwn === '\u0b85\u0b99\u0bcd\u0b95\u0bca' && wordless[0].onItsOwnR === 'ango'
          && wordless[1].onItsOwn === '\u0b85\u0b99\u0bcd\u0b95\u0bcc' && wordless[1].onItsOwnR === 'angow',
          wordless.map(function (c) { return c.onItsOwn + '=' + c.onItsOwnR; }).join(' '));
        t('and not with a vowel put in front of it',
          wordless.every(function (c) { return c.onItsOwnR.charAt(0) !== 'i'; }));
      })();
      t('no word is repeated', (function () {
        var w = ng.cells.map(function (c) { return c.word; }).filter(Boolean);
        return new Set(w).size === w.length;
      })());
      t('each with its reading, its meaning and a picture',
        ng.cells.filter(function (c) { return c.word; })
          .every(function (c) { return c.wordR && c.wordEn && c.wordPic; }));
      t('and the cell speaks the word, or the cluster said on its own',
        /data-speak="' \+ esc\(c\.word \|\| c\.ch\)/.test(v2));
      /* \u0b99\u0bcc is the one no voice here says correctly — every spelling
         tried came back as something else. A wrong sound on a chart a
         child copies is worse than no sound, so that one cell is silent.
         \u0b99\u0bca is not: it keeps its sound. */
      t('except \u0b99\u0bcc, which is silent',
        ng.cells[11].mute === true && ng.cells[9].mute === false,
        'ngo mute=' + ng.cells[9].mute + ' ngau mute=' + ng.cells[11].mute);
      t('and only that one', ng.cells.filter(function (c) { return c.mute; }).length === 1);
      t('a silent cell carries no speak target at all',
        /mute \? '' : ' data-speak=/.test(v2));

      /* \u0b9e is NOT one of these. I had marked \u0b9e\u0bbf and \u0b9e\u0bc6 from counting this
         app's own Tamil and finding them absent \u2014 which is evidence about
         the app's content, not about the language. The row is left alone. */
      var nya = TA.grid.filter(function (r) { return r.base === '\u0b9e'; })[0];
      t('\u0b9e is left alone, because an app corpus is not the language',
        nya.cells.every(function (c) { return !c.word && !c.unused; }));
      /* And no other row is touched either. */
      var touched = TA.grid.filter(function (r) {
        return r.base !== '\u0b99' && r.cells.some(function (c) { return c.word || c.unused; });
      });
      t('and no row but \u0b99 is', touched.length === 0,
        touched.map(function (r) { return r.base; }).join(' '));
    })();

    /* Hindi had k\u0101, k\u012b, k\u016b, and the same retroflex/dental collision. */
    t('every Hindi grid cell reads too', (function () {
      var bad = [];
      HI.grid.forEach(function (r) { r.cells.forEach(function (c) { if (!c.say) bad.push(c.ch); }); });
      return bad.length === 0;
    })());
    t('\u0915\u0940 reads kee, not k\u012b', cell(HI.grid, '\u0915', 3).say === 'kee');
    t('\u091a reads cha', cell(HI.grid, '\u091a', 0).say === 'cha');
    t('and the curled-back pair is still separable',
      cell(HI.grid, '\u091f', 0).r === '\u1e6da' && cell(HI.grid, '\u0924', 0).r === 'ta');
  })();
  /* ---------------- the alphabet ---------------- */
  section('ALPHABET');
  (function () {
    var TA = TB.ALPHABET.ta, HI = TB.ALPHABET.hi;

    /* The page showed the scholarly transliteration — ṅ, c, ñ, ṭ, ḻ — which
       is right for a catalogue and useless to a child. ச shown as c tells
       an English reader to say k, the one sound it never makes. */
    var noSay = TA.vowels.concat(TA.consonants).filter(function (x) { return !x.say; });
    t('every Tamil letter has a reading a learner can use', noSay.length === 0, noSay.length);
    t('and ச is not called c', TA.consonants.filter(function (c) {
      return c.base === 'ச'; })[0].say === 'sa');
    t('nor ங called ṅ', TA.consonants.filter(function (c) {
      return c.base === 'ங'; })[0].say === 'nga');

    /* A sound is learnt in a word. It is also the only way a speech engine
       reads reliably — one character alone has no context at all. */
    var noEx = TA.vowels.concat(TA.consonants).filter(function (x) { return !x.ex; });
    t('and a word that has the letter in it', noEx.length === 0, noEx.length);
    /* Six Tamil letters never begin a word, so their example must not.
       ஞ is NOT one of them — ஞாயிறு, ஞானம் and ஞாபகம் all begin with
       it — which this test got wrong before the data did. */
    (function () {
      var wrong = [];
      ['ங', 'ண', 'ழ', 'ள', 'ற', 'ன'].forEach(function (ch) {
        var c = TA.consonants.filter(function (x) { return x.base === ch; })[0];
        if (c && c.ex && c.ex.charAt(0) === ch) wrong.push(ch);
      });
      t('and no example starts with a letter that cannot start a word',
        wrong.length === 0, wrong.join(' '));
    })();
    t('the 247 still add up', TA.vowels.length === 12 && TA.consonants.length === 18
      && TA.grid.length * TA.grid[0].cells.length === 216);

    /* त was labelled th and द dh — the names belonging to थ and ध on the
       line below. Both are the plain unaspirated pair. */
    function hi(ch) {
      var out = null;
      HI.rows.forEach(function (r) { r.items.forEach(function (i) { if (i.ch === ch) out = i; }); });
      return out;
    }
    t('त is a t, not a th', /^t on the teeth/.test(hi('त').en), hi('त').en);
    t('द is a d, not a dh', /^d on the teeth/.test(hi('द').en), hi('द').en);
    t('and थ and ध are the ones with the breath',
      /puff of air/.test(hi('थ').en) && /puff of air/.test(hi('ध').en));
    /* The aspirates were spelt in Tamil with a pulli and ஹ — க்ஹ — which a
       Tamil reader sounds out as two syllables, k-ha. */
    var twoSyllable = [];
    HI.rows.forEach(function (r) { r.items.forEach(function (i) {
      if (i.ta && /்ஹ/.test(i.ta)) twoSyllable.push(i.ch); }); });
    t('no Tamil approximation spells an aspirate as two syllables',
      twoSyllable.length === 0, twoSyllable.join(' '));
    var hiNo = HI.vowels.filter(function (v) { return !v.say || !v.ex; });
    HI.rows.forEach(function (r) { r.items.forEach(function (i) {
      if (!i.say || !i.ex) hiNo.push(i); }); });
    t('every Hindi letter has a reading and a word', hiNo.length === 0, hiNo.length);

    /* The audio. A letter alone is what an engine reads worst and what a
       child learns slowest, so a tap says the letter slowly and then a word. */
    var v2 = fs.readFileSync(R + 'js/views2.js', 'utf8');
    t('a tap says the letter slowly, then the word',
      /rate: 0\.5, pause: 900/.test(v2) && /if \(word && mode === 'pair' && !solo\)/.test(v2));
    /* A mei letter is named இக் and sounded க. Both are taught; the chart
       gave neither, and then gave only one. */
    t('every mei letter carries both of its readings', (function () {
      var bad = TA.consonants.filter(function (c) { return !c.mei || !c.meiSay || !c.say; });
      return bad.length === 0;
    })());
    /* க் has a dot. A dotted letter is read இக் and never "ka" — "ka"
       is க, the same letter with its vowel back, and a different thing to
       press. Reading both off one card taught a child that the dot makes
       no difference, which is the one thing it does. */
    t('a dotted letter says only its own name', !/data-name/.test(v2));
    /* \u0b95\u0bb2\u0bcd does not start with \u0b95\u0bcd. It starts with \u0b95. The mei card read
       "ik" and printed \u0b95\u0bb2\u0bcd underneath, so the card whose whole job is to
       teach the dot was contradicting it. They are two sections now. */
    t('the letter with its vowel has a section of its own',
      /\u0b85 \u0bb5\u0bb0\u0bbf\u0b9a\u0bc8 \(18\)/.test(v2) || /withA/.test(v2));
    t('and the mei card no longer carries it', !/class="alpha-with"/.test(v2));
    t('every mei word really contains its dotted letter', (function () {
      var bad = TA.consonants.filter(function (c) { return c.ex.indexOf(c.ch) < 0; });
      return bad.length === 0;
    })(), TA.consonants.filter(function (c) { return c.ex.indexOf(c.ch) < 0; })
      .map(function (c) { return c.ch + '=' + c.ex; }).join(' '));
    /* The undotted letter takes the word that STARTS with it \u2014 except for
       the nine that cannot begin a Tamil word at all (\u0b99 \u0b9f \u0ba3 \u0bb0 \u0bb2 \u0bb4 \u0bb3 \u0bb1 \u0ba9),
       whose words show them where they really occur. \u0b9e is not among them:
       \u0b9e\u0bbe\u0baf\u0bbf\u0bb1\u0bc1 and \u0b9e\u0bbe\u0ba9\u0bae\u0bcd both begin with it. */
    (function () {
      var cannotStart = '\u0b99\u0b9f\u0ba3\u0bb0\u0bb2\u0bb4\u0bb3\u0bb1\u0ba9';
      var wrong = TA.withA.filter(function (c) {
        return c.ex.charAt(0) !== c.ch && cannotStart.indexOf(c.ch) < 0;
      });
      t('the undotted letter takes the word that starts with it',
        wrong.length === 0, wrong.map(function (c) { return c.ch + '=' + c.ex; }).join(' '));
      var oddly = TA.withA.filter(function (c) {
        return c.ex.charAt(0) === c.ch && cannotStart.indexOf(c.ch) >= 0;
      });
      t('and a letter that cannot begin a word is never shown beginning one',
        oddly.length === 0, oddly.map(function (c) { return c.ch; }).join(' '));
    })();
    /* Both sections: letters, words and pictures. */
    t('both sections have a word and a picture for every letter',
      TA.consonants.filter(function (c) { return !c.ex || !c.pic; }).length === 0
      && TA.withA.filter(function (c) { return !c.ex || !c.pic; }).length === 0);
    /* The card SHOWS \u0b95\u0bcd and must SAY \u0b87\u0b95\u0bcd. It used to show the dot and
       say the undotted letter, which is the one thing the dot prevents. */
    t('and the dotted card is wired to its own name, not to \u0b95',
      /sayPair\(c, 'ta', c\.mei \|\| c\.base\)/.test(v2));
    /* Nothing is cut off: some engines report a line finished while the
       sound is still going, so every step gets room after it. */
    t('a letter is given room before the next thing is said',
      /rate: 0\.5, pause: 900/.test(v2) && /rate: 0\.5, pause: 700/.test(v2));
    /* Read them all was reading only letters while the chooser above it
       said Letter + word — the one place a child would sit and listen
       gave them the least. */
    t('and Read them all reads what the chooser says',
      /if \(word && mode === .pair.\) \{[\s\S]{0,120}forCell: true/.test(v2));
    t('with the card staying lit through its word', /if \(step\.forCell\) return;/.test(v2));
    /* Stop has to be reachable while the page is scrolling itself. */
    t('Stop follows you down the page while it reads',
      /\.reading #aStop \{[\s\S]{0,120}position: fixed/.test(
        fs.readFileSync(R + 'assets/styles.css', 'utf8')));
    t('and the page stops dragging you back once you scroll',
      /if \(!userScrolled\) cell\.scrollIntoView/.test(v2));
    /* The online voice: a different speaker, and a native one. Offered as
       what it is, because what it sounds like is not something this page
       can know. */
    t('the online voice is offered as its own choice',
      /data-sex="net"/.test(v2) && /Online voice/.test(v2));
    t('and is not dressed up as a gender', !/Online woman|Woman \(online\)/.test(v2));

    /* The English chart had an IPA symbol and nothing else \u2014 no word, no
       picture, no meaning \u2014 on the page a child is most likely to open
       first. */
    (function () {
      var EN = TB.ALPHABET.en.letters;
      var bare = EN.filter(function (l) { return !l.ex || !l.pic || !l.exTa || !l.exHi; });
      t('every English letter has a word, a picture and three meanings',
        bare.length === 0, bare.map(function (l) { return l.ch; }).join(''));
      t('A is for apple', EN[0].ex === 'apple' && EN[0].pic);
      /* X sounds /ks/ at the END of a word. Primers use xylophone, where
         the x is really a z and teaches the wrong sound. */
      t('and X is for box, not xylophone',
        EN.filter(function (l) { return l.ch === 'X'; })[0].ex === 'box');
      t('the English card is tappable like the other two',
        /wcard alpha-cell/.test(v2) && /alphaPic\(l\) \+ alphaWord\(l, 'en'\)/.test(v2));
      /* "apple / apple" \u2014 on this chart the word is its own meaning. */
      t('and a word is not printed as its own translation',
        /it\.exEn !== it\.ex/.test(v2));
    })();

    /* The meaning in all three, on a page that claims three. */
    (function () {
      var all = TA.vowels.concat(TA.consonants);
      HI.vowels.forEach(function (v) { all.push(v); });
      HI.rows.forEach(function (r) { r.items.forEach(function (i) { all.push(i); }); });
      var one = all.filter(function (x) { return x.exEn && (!x.exTa || !x.exHi); });
      t('every example word is explained in all three languages',
        one.length === 0, one.length + ' still in English only');
    })();
    t('க் is இக் and க', (function () {
      var k = TA.consonants.filter(function (c) { return c.base === 'க'; })[0];
      return k.meiSay === 'ik' && k.say === 'ka';
    })());

    /* Three ways to hear it, and the whole set read in order. */
    t('there are three ways to hear a letter', /data-mode="pair"/.test(v2)
      && /data-mode="letter"/.test(v2) && /data-mode="all"/.test(v2));
    t('and the one being read is lit as it is said',
      /cell\.classList\.add\('saying'\)/.test(v2) && /\.alpha-cell\.saying/.test(
        fs.readFileSync(R + 'assets/styles.css', 'utf8')));
    t('with a way to stop it', /id="aStop"/.test(v2) && /function stopReading/.test(v2));

    /* A button that cannot be pressed has to look like one, and say why. */
    t('a disabled choice looks disabled',
      /\.pill\[disabled\] \{/.test(fs.readFileSync(R + 'assets/styles.css', 'utf8')));
    t('and says why rather than doing nothing',
      /voice for this language/.test(v2) && /if \(b\.disabled\) \{/.test(v2));

    /* A word a child cannot picture is one they look up again tomorrow. */
    t('every Tamil letter has a picture',
      TA.vowels.concat(TA.consonants).filter(function (x) { return !x.pic; }).length === 0);
    (function () {
      var all = HI.vowels.slice();
      HI.rows.forEach(function (r) { all = all.concat(r.items); });
      t('and most Hindi ones do', all.filter(function (x) { return x.pic; }).length >= 45,
        all.filter(function (x) { return x.pic; }).length + '/' + all.length);
    })();
    t('and the cell does not also fire the app-wide speaker',
      /if \(e\.target\.closest\(.\[data-speak\].\)\) return;/.test(v2));

    /* A man or a woman, only where the device really has one. */
    t('the voice can be a man or a woman', typeof TB.Speech.sexesFor === 'function');
    /* Stricter than it was: a single voice is no choice at all, and the sex
       is only ever guessed from the voice's name, so offering "Man" and then
       playing whatever the one voice is would be a promise it cannot keep. */
    t('and a choice is offered only where there really is one',
      /var canChoose = sx\.total > 1 && sx\.m && sx\.f;/.test(v2));
    t('both pills turn on the same condition',
      (v2.match(/\(canChoose \? '' : ' disabled'\)/g) || []).length === 2,
      (v2.match(/\(canChoose \? '' : ' disabled'\)/g) || []).length + ' of 2');
    /* Reading controls sit beside every group of letters, in all three
       alphabets — including a Stop, so a reading can be halted from
       wherever it has got to rather than from the top of the page only. */
    t('every section gets its own read button', /data-sec-all/.test(v2));
    t('and one that starts from the letter tapped', /data-sec-from/.test(v2));
    t('and its own stop', /data-sec-stop/.test(v2));
    t('every stop does the same thing',
      /bar\.querySelector\('\[data-sec-stop\]'\)\.addEventListener\('click', stopReading\);/.test(v2));
    t('and they all appear and vanish together',
      /function showStops\(on\)/.test(v2)
      && /showStops\(true\);/.test(v2)
      && (v2.match(/showStops\(false\);/g) || []).length >= 2);

    t('and says so when there is only one voice',
      /no choice of man or woman here/.test(v2));
    t('a name on neither list is left unknown, not guessed',
      /return ..;\s*\n  \}\s*\n\s*function bestOf/.test(fs.readFileSync(R + 'js/speech.js', 'utf8')));
  })();


  /* ---------------- what a test pass found ---------------- */
  section('TEST PASS');
  (function () {
    var vw  = fs.readFileSync(R + 'js/views.js', 'utf8');
    var v2  = fs.readFileSync(R + 'js/views2.js', 'utf8');
    var v4  = fs.readFileSync(R + 'js/views4.js', 'utf8');
    var dct = fs.readFileSync(R + 'js/dict.js', 'utf8');
    var srv = fs.readFileSync(R + 'server/index.js', 'utf8');
    var html = fs.readFileSync(R + 'index.html', 'utf8');

    /* Two elements shared the id swapBtn: the sign-in screen's button and
       Translate's swap arrows. getElementById returns whichever comes
       first, and duplicate ids are invalid besides. */
    t('no two elements share the id swapBtn',
      !/id="swapBtn"/.test(vw) && /id="trSwapBtn"/.test(vw)
      && (html.match(/id="swapBtn"/g) || []).length === 1);

    /* Eight controls had no accessible name \u2014 a screen reader announced
       them as "combo box" and nothing else. */
    t('the language pickers have names',
      /id="srcLang" aria-label=/.test(vw) && /id="dstLang" aria-label=/.test(vw)
      && /id="numLang" aria-label=/.test(v4) && /id="ocrLang" aria-label=/.test(v2));
    t('and so do the file pickers and the name field',
      /id="file"[\s\S]{0,120}aria-label=/.test(v2)
      && /id="cam"[\s\S]{0,120}aria-label=/.test(v2)
      && /<label for="sName">/.test(v2));

    /* A word already in the offline dictionary sat behind a spinner for
       five seconds, waiting on network enrichment that may never come.
       Measured: 5,013ms before, 87ms after. */
    t('the offline answer is handed over before the network is asked',
      /opts\.onEarly/.test(dct) && /card\.partial = true/.test(dct));
    t('and the page shows it at once', /onEarly: function \(c\)/.test(vw));
    t('while a later failure does not wipe it', /if \(!shown\)/.test(vw));

    /* Leaving Translate mid-keystroke threw: the debounce and the promise
       both wrote to elements that render() had already replaced. */
    t('Translate stops writing to a page that has gone',
      /function alive\(\) \{ return document\.body\.contains\(src\); \}/.test(vw)
      && (vw.match(/!alive\(\)/g) || []).length >= 3);

    /* 49,004 nodes and 2.27MB to show 49 headings: <details> builds its
       children whether it is open or not. */
    t('a vocabulary theme is built when it is opened', /\[data-words\]/.test(v2));
    t('and a phrase group too',
      /\[data-rows\]/.test(fs.readFileSync(R + 'js/views5.js', 'utf8')));

    /* An API that answers in JSON should answer its errors in JSON too. */
    t('malformed JSON gets a JSON error', /entity\.parse\.failed/.test(srv));
    t('and an over-large body does as well', /entity\.too\.large/.test(srv));
    t('the framework banner is off', /app\.disable\('x-powered-by'\)/.test(srv));

    /* A bead is 34x21; what a finger has to hit is a different thing. */
    t('an abacus bead is easier to hit than it is to see',
      /\.ab-bead::after/.test(fs.readFileSync(R + 'assets/styles.css', 'utf8')));
  })();
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
    /* This used to check that a phone number could register. It cannot any
       more, and that is the point: a number receives no reset link, so an
       account made with one could never be recovered. */
    threw = false;
    let why = '';
    try { await TB.Auth.signUp('Phone', '9876543210', 'tamil2024'); }
    catch (e) { threw = true; why = e.message; }
    t('a phone number cannot open an account', threw, why);
    t('and the refusal explains why', /reset by email/.test(why), why);
    threw = false;
    try { await TB.Auth.signUp('Rubbish', 'hello', 'tamil2024'); } catch (e) { threw = true; }
    t('nor does anything that is not an address', threw);
    t('weak password rejected', !!TB.Auth.passwordIssue('abc'));

    /* history + export */
    TB.Store.addHistory(u.id, { type: 'translate', from: 'en', to: 'ta', src: 'cat', out: 'பூனை' });
    const d = TB.Store.data(u.id);
    t('history recorded', d.history.length === 1 && d.history[0].src === 'cat');
    t('export round-trips', JSON.parse(TB.Store.exportAll(u.id)).data.history.length === 1);

    /* Signed out. Nothing on this site asks for an account first, so this is
       how most people arrive. Every setting used to be written to nowhere and
       silently reset on the next reload — the voice most of all. */
    const g = TB.Store.data(null);
    g.prefs.voiceSex = 'female';
    g.prefs.textSize = 'largest';
    g.prefs.theme = 'dark';
    g.prefs.themeChosen = true;
    t('a signed-out visitor can be saved', TB.Store.saveData(null, g) === true);
    const gBack = TB.Store.data(null);
    t('the voice survives a reload', gBack.prefs.voiceSex === 'female');
    t('so does the text size', gBack.prefs.textSize === 'largest');
    t('so does the theme', gBack.prefs.theme === 'dark' && gBack.prefs.themeChosen === true);
    t('and it is stored under its own key', !!ctx.localStorage.getItem('tb.data.guest'));
    t('signed-out history is kept', !!TB.Store.addHistory(null, { type: 'translate', src: 'dog' })
        && TB.Store.data(null).history.length === 1);

    /* An account must not inherit a stranger's settings, and must not lose
       its own to them either. */
    t('an account keeps its own settings', TB.Store.data(u.id).prefs.voiceSex === '');
    t('and its own history', TB.Store.data(u.id).history.length === 1
        && TB.Store.data(u.id).history[0].src === 'cat');

    /* A missing id must never be read as the guest bucket here. */
    TB.Store.deleteUser('');
    t('deleteUser ignores a missing id', !!ctx.localStorage.getItem('tb.data.guest'));

    /* The door is open: an account keeps your progress, it is not the price
       of looking. */
    const app = require('fs').readFileSync(__dirname + '/js/app.js', 'utf8');
    const html = require('fs').readFileSync(__dirname + '/index.html', 'utf8');
    const store = require('fs').readFileSync(__dirname + '/js/store.js', 'utf8');
    t('no session does not hold the screen', /\} else \{/.test(app) && /enter\(\);/.test(app));
    t('the sign-in card has a way back out', /id="justLooking"/.test(html));
    t('and the sidebar offers the way in', /Just looking/.test(app) && /data-act', 'in'/.test(app));

    /* The day has to end at local midnight. toISOString gives the UTC date,
       which in India turns over at half past five in the morning. */
    t('the day is a local day', /localDay:/.test(store) && !/toISOString\(\)\.slice\(0, 10\)/.test(store));
    const dayNow = TB.Store.localDay();
    t('localDay looks like a date', /^\d{4}-\d{2}-\d{2}$/.test(dayNow), dayNow);
    t('and matches this machine, not UTC', dayNow === (function () {
      const n = new Date();
      return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2);
    })());

    /* A streak resets on a missed day; the days themselves do not vanish. */
    const su = 'streaky';
    TB.Store.touchStreak(su);
    TB.Store.touchStreak(su);                      /* same day, no double count */
    t('one day counts once', TB.Store.data(su).stats.daysUsed === 1,
      TB.Store.data(su).stats.daysUsed);
    const sd = TB.Store.data(su);
    const y = new Date(); y.setDate(y.getDate() - 1);
    sd.stats.lastActive = TB.Store.localDay(y);
    TB.Store.saveData(su, sd);
    TB.Store.touchStreak(su);
    t('a second day in a row makes a streak of two', TB.Store.data(su).stats.streak === 2,
      TB.Store.data(su).stats.streak);
    const sd2 = TB.Store.data(su);
    const gap = new Date(); gap.setDate(gap.getDate() - 4);
    sd2.stats.lastActive = TB.Store.localDay(gap);
    TB.Store.saveData(su, sd2);
    TB.Store.touchStreak(su);
    t('a missed day resets the streak', TB.Store.data(su).stats.streak === 1);
    t('but not the days used', TB.Store.data(su).stats.daysUsed === 3,
      TB.Store.data(su).stats.daysUsed);
  } catch (e) {
    fail++; console.log('  FAIL  accounts threw: ' + e.message);
  }

  console.log('\n' + '='.repeat(46));
  console.log('  PASS ' + pass + '   FAIL ' + fail);
  console.log('='.repeat(46));
  process.exit(fail ? 1 : 0);
})();
