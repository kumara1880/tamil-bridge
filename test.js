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
 'data/phrases.js','data/lexicon.js','data/grammar.js','data/grammar_hi.js','data/grammar_ta.js',
 'data/wordpairs.js','data/wordpairs2.js','data/wordpairs3.js','data/wordpairs4.js',
 'data/modern.js','data/spoken.js','data/grammar.js','data/grammar_hi.js',
 'data/wordpairs.js','data/wordpairs2.js','data/wordpairs3.js','data/wordpairs4.js','data/spoken.js',
 'js/store.js','js/auth.js','js/speech.js','js/translit.js','js/vocabx.js','js/translate.js',
 'js/reader.js',
 'js/tutor.js','js/check.js','js/ocr.js','js/dict.js','js/srs.js','js/numbers.js','js/conjugate.js',
 'js/maths.js','js/writing.js','js/sentences.js','js/search.js']
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
  /* A remembered session used to win the race: the reset card appeared and
     was wiped by the app a few milliseconds later, so the link looked
     broken — it opened and vanished. */
  t('a reset link beats a remembered session',
    /restored && !resetting/.test(app));
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
  /* Once the server keeps accounts properly, telling somebody their account
     might be in another browser sends them hunting for something that is
     not anywhere. */
  t('and once the server is durable it says the account is simply not there',
    /not on the server, and not in this browser either/.test(app));
  t('and explains that an account lost before the database cannot come back',
    /it cannot be brought/.test(app) && /create it again/i.test(app));
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
  /* But signing in must still accept a number, or anybody who already made
     an account that way is locked out of it for good. */
  t('signing in still looks up a number, so nobody is locked out',
    /const phone = !email \? normalisePhone\(identifier\) : null/.test(srv));
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
  [['hi', 'मैं स्कूल जाता हूँ', 'maiṁ skūl jātā hūṁ'],
   ['te', 'నేను', 'nenu'],
   ['kn', 'ನಾನು', 'nānu'],
   ['ml', 'ഞാൻ', 'nān'],
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
  } catch (e) {
    fail++; console.log('  FAIL  accounts threw: ' + e.message);
  }

  console.log('\n' + '='.repeat(46));
  console.log('  PASS ' + pass + '   FAIL ' + fail);
  console.log('='.repeat(46));
  process.exit(fail ? 1 : 0);
})();
