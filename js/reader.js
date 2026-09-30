/* Tamil Bridge — how a passage should be said aloud.

   Reading a rhyme is not reading a paragraph. A paragraph wants even pacing
   and a pause at each full stop; a rhyme wants a beat, a lift at the end of
   the first line of a couplet and a drop at the end of the second, and a
   real rest between verses. The browser's speech engine cannot sing — there
   is no free voice that can, and pretending otherwise would just be a wrong
   promise — but it can be given a pitch and a tempo per line, and that is
   what turns a list of sentences into something a child recognises as a
   rhyme.

   This module decides the plan. TB.Speech carries it out.                   */
window.TB = window.TB || {};

TB.Reader = (function () {

  /* The sound a line ends on.

     English does not spell its rhymes: star/are and high/sky rhyme, sky/key
     do not, and no amount of comparing final letters will tell you which is
     which. So a Latin-script word is first folded towards its sound -- the
     silent e goes, gh and the vowel digraphs are collapsed, final y becomes
     i -- and what is compared is the last vowel onwards, which is the part
     a rhyme actually shares. Tamil and Devanagari are written as they are
     said, so they are compared as they are. */
  var FOLD = [
    /* these first: the rules below produce 'ai', which this would eat */
    [/ai|ay|ei/g, 'a'],
    [/ight$/, 'ait'], [/igh$/, 'ai'], [/ough$/, 'o'], [/augh$/, 'af'],
    [/tion$/, 'shun'], [/sion$/, 'shun'], [/ture$/, 'cher'],
    [/([^aeiou])e$/, '$1'],          /* silent e: make, like, are */
    [/ck/g, 'k'], [/ph/g, 'f'], [/gh/g, ''], [/wh/g, 'w'], [/qu/g, 'kw'],
    [/ee|ea|ie/g, 'i'], [/oo|ou/g, 'u'], [/oa|ow|oe/g, 'o'],
    /* final -y is two sounds: /ai/ when it carries the only vowel
       (sky, try, my), /i/ otherwise (happy, city) */
    [/^([^aeiou]*)y$/, '$1ai'], [/y$/, 'i'],
    [/([a-z])\1/g, '$1']   /* little -> litl */
  ];

  function fold(w) {
    FOLD.forEach(function (r) { w = w.replace(r[0], r[1]); });
    return w;
  }

  /* A letter and the marks that hang off it — प + ा is one thing on the
     page and one sound in the mouth. */
  var CLUSTER = /[\s\S][\u0900-\u0903\u093a-\u094d\u0951-\u0957\u0962\u0963\u0b82\u0b83\u0bbe-\u0bcd\u0bd7]*/g;
  var SIGN = /[\u093e-\u094c\u0962\u0963\u0bbe-\u0bcc]/;      /* a vowel hanging off a letter */
  var INDEP = /^[\u0904-\u0914\u0b85-\u0b94]/;                 /* a vowel standing alone */
  var VIRAMA = /[\u094d\u0bcd]/;                               /* the vowel-killer */

  /* The rime of an Indic word: its last vowel and everything after it.

     राम and नाम both end ाम and rhyme; कम ends in a bare म after an
     inherent a and does not. A word-final consonant with no mark on it is
     a coda, not a syllable — Hindi drops that last schwa, which is why
     राम is raam and not raama. */
  function rime(word) {
    var cl = word.match(CLUSTER) || [];
    var coda = '';
    for (var i = cl.length - 1; i >= 0; i--) {
      var c = cl[i];
      var m = c.match(SIGN);
      if (m) return c.slice(c.indexOf(m[0])) + coda;
      if (INDEP.test(c)) return c + coda;
      if (i === cl.length - 1 || VIRAMA.test(c)) {
        coda = c.replace(VIRAMA, '') + coda;   /* still in the coda */
        continue;
      }
      return 'a' + coda;                        /* the inherent vowel */
    }
    return coda || word.slice(-2);
  }

  function ending(line) {
    /* Marks are kept: a Devanagari matra is a Mark and not a Letter, and
       throwing it away throws away the vowel the rhyme is made of. */
    var w = String(line || '')
      .replace(/[^\p{L}\p{N}\p{M}\s]/gu, '')
      .trim().split(/\s+/).pop() || '';
    w = w.toLowerCase();
    if (!w) return '';
    if (!/^[a-z0-9]+$/.test(w)) return rime(w);
    w = fold(w);
    /* the last run of vowels, and everything after it: sky -> ai, night -> ait */
    var end = -1, i;
    for (i = w.length - 1; i >= 0; i--) {
      if ('aeiou'.indexOf(w.charAt(i)) >= 0) { end = i; break; }
    }
    if (end < 0) return w.slice(-2);
    var start = end;
    while (start > 0 && 'aeiou'.indexOf(w.charAt(start - 1)) >= 0) start--;
    return w.slice(start);
  }

  function rhymes(a, b) {
    var x = ending(a), y = ending(b);
    if (!x || !y) return false;
    if (x === y) return true;
    return x.length >= 2 && y.length >= 2 && x.slice(-2) === y.slice(-2);
  }

  /* Label each line A, B, C… so lines that rhyme share a letter. */
  function scheme(lines) {
    var labels = [], groups = [];
    lines.forEach(function (l) {
      var found = -1;
      for (var g = 0; g < groups.length; g++) {
        if (rhymes(groups[g], l)) { found = g; break; }
      }
      if (found < 0) { groups.push(l); found = groups.length - 1; }
      labels.push(String.fromCharCode(65 + (found % 26)));
    });
    return labels;
  }

  /* Enough repeated line-endings, in short enough lines, to be worth reading
     as verse rather than as prose. */
  function looksLikeVerse(lines) {
    var real = lines.filter(function (l) { return String(l).trim(); });
    if (real.length < 4) return false;
    var labels = scheme(real);
    var counts = {};
    labels.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
    var paired = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > 1) paired += counts[k]; });
    var shortLines = real.filter(function (l) { return l.trim().split(/\s+/).length <= 12; }).length;

    /* Prose that happens to end two lines the same way is not a poem. In
       Hindi half the words in the language end in -ी, so a loose rhyme
       test finds rhymes everywhere; and prose punctuates every sentence
       while a rhyme usually lets the line break do that work. So a
       punctuated passage has to rhyme much more convincingly before it is
       chanted rather than simply read. */
    var ended = real.filter(function (l) { return END.test(l.trim()); }).length;
    var need = ended / real.length > 0.5 ? 0.75 : 0.5;
    return paired / real.length >= need && shortLines / real.length >= 0.7;
  }

  /* ------------------------------------------------------------ cleaning

     A photograph of a page is not all text. There is a title drawn in
     letters no reader can make out, a logo, a watermark, a border. OCR
     returns all of it, as the rubble it looks like:

       Af (0}y7 J A = 5 =v) \ $ ¢ | / % £3 » py "2

     Kept, that rubble is read aloud, translated, and \u2014 worst of all \u2014 stops
     the page looking like a poem, so the verse is flattened into prose and
     the shape of the rhyme is lost. A line that is mostly not letters is
     not a line of the text.                                               */
  function looksLikeRubble(line) {
    var t = String(line || '').trim();
    if (!t) return false;
    /* Marks count as letters. A Tamil or Devanagari vowel sign is a Mark
       and not a Letter, so நிலா is two Letters and two Marks — counted
       without them, every line of Tamil in the world looks like rubble. */
    var letters = (t.match(/[\p{L}\p{M}]/gu) || []).length;
    if (!letters) return true;                         /* no letters at all */

    var junk = (t.match(/[^\p{L}\p{M}\p{N}\s'’\-.,!?;:()"“”।॥]/gu) || []).length;
    var ratio = letters / t.replace(/\s/g, '').length;

    /* Real writing is mostly letters. Decoration is mostly everything
       else, and the pieces of it that are letters are scattered singles. */
    if (ratio < 0.55) return true;
    if (junk >= 3 && ratio < 0.75) return true;

    /* A run of lone letters with no word among them \u2014 "Af J A v py" \u2014 is
       a title that was drawn rather than written. */
    var words = t.split(/\s+/).filter(Boolean);
    var real = words.filter(function (w) {
      return /[\p{L}\p{M}]{3,}/u.test(w) && /[aeiouAEIOU\u0B80-\u0BFF\u0900-\u097F]/u.test(w);
    }).length;
    if (words.length >= 4 && real / words.length < 0.34) return true;

    /* A stray mark at the very edge of the page: one or two letters, alone. */
    if (t.length <= 2 && !/^[\p{L}\p{M}]+$/u.test(t)) return true;

    return false;
  }

  /* OCR reads a capital I in many display faces as a bar, so "When I get"
     comes back as "When | get". Only fixed where a word cannot be a bar. */
  function mendLetters(line) {
    return String(line || '')
      .replace(/(^|\s)[|¦l](?=\s)/g, '$1I')
      .replace(/(^|\s)[|¦](?=[a-z]{1,3}\b)/g, '$1I');
  }

  /* Drop the decoration, mend what is left.

     Takes either plain strings or the lines as OCR returns them, which
     carry the score the reader gave itself. That score is the only thing
     that separates a watermark reading "Oe" from a real short line: the
     text is identical, and the reader knew it was guessing. */
  function clean(lines) {
    var kept = [], dropped = [];
    (lines || []).forEach(function (l) {
      var t = String((l && l.text != null) ? l.text : (l == null ? '' : l));
      var conf = (l && typeof l.confidence === 'number') ? l.confidence : null;

      /* A line the reader could barely make out, and which is too short to
         carry much anyway, is a mark on the page rather than a line of it. */
      var unsure = conf !== null && conf < 45 && t.trim().replace(/\s/g, '').length <= 4;

      if (unsure || looksLikeRubble(t)) { if (t.trim()) dropped.push(t.trim()); return; }
      kept.push(mendLetters(t));
    });
    /* If almost everything looked like rubble the picture probably is
       unusual rather than decorated, so nothing is thrown away. */
    if (kept.filter(function (x) { return x.trim(); }).length === 0) {
      return { lines: lines.slice(), dropped: [] };
    }
    return { lines: kept, dropped: dropped };
  }

  /* Sentence enders across the scripts the app reads. */
  var END = /[.!?।॥؟。！？]["'”’)\]]*$/;

  /* Sew wrapped lines back into sentences — unless the lines are verse, in
     which case the breaks are the poem and are left exactly as they are.
     A blank line still separates paragraphs. */
  function sentences(paragraph) {
    var out = [], buf = '';
    var parts = paragraph.split(/(\s+)/);
    parts.forEach(function (tok) {
      buf += tok;
      if (END.test(tok.replace(/\s+$/, ''))) {
        var t = buf.trim();
        if (t) out.push(t);
        buf = '';
      }
    });
    if (buf.trim()) out.push(buf.trim());
    return out;
  }

  function reflow(lines) {
    var text = (lines || []).map(function (l) { return String(l == null ? '' : l).trim(); });
    if (looksLikeVerse(text)) return { units: text.slice(), isVerse: true, reflowed: false };

    var units = [], para = [];
    function flush() {
      if (!para.length) return;
      sentences(para.join(' ')).forEach(function (x) { units.push(x); });
      para = [];
    }
    text.forEach(function (l) {
      if (!l) { flush(); units.push(''); return; }
      para.push(l);
    });
    flush();
    while (units.length && !units[units.length - 1]) units.pop();
    return { units: units, isVerse: false, reflowed: units.length !== text.length };
  }

  var MODES = {
    read:  { label: 'Read',        hint: 'Natural reading voice' },
    slow:  { label: 'Slowly',      hint: 'Word by word, for copying' },
    rhyme: { label: 'Sing-song',   hint: 'Chanted with the rhythm of a rhyme' },
    spell: { label: 'Spell out',   hint: 'One letter at a time' }
  };

  var api = {
    MODES: MODES,
    scheme: scheme,
    rhymes: rhymes,
    ending: ending,
    rime: rime,
    clean: clean,
    looksLikeRubble: looksLikeRubble,
    mendLetters: mendLetters,
    looksLikeVerse: looksLikeVerse,
    reflow: reflow,

    /* Turn lines into speech steps: [{ text, lang, rate, pitch, pause }].

       A blank line means a new verse, so it becomes a rest rather than an
       utterance. */
    plan: function (lines, lang, mode, opts) {
      opts = opts || {};
      var base = opts.rate || 0.9;
      var pitch = opts.pitch || 1;
      var text = lines.map(function (l) { return String(l == null ? '' : l); });

      if (mode === 'spell') {
        var steps = [];
        text.forEach(function (l) {
          Array.prototype.forEach.call(l.replace(/\s+/g, ' ').trim(), function (ch) {
            if (ch === ' ') { steps.push({ text: ' ', lang: lang, rate: base, pitch: pitch, pause: 260, silent: true }); return; }
            steps.push({ text: ch, lang: lang, rate: Math.min(1, base), pitch: pitch, pause: 150 });
          });
          steps.push({ text: '', lang: lang, pause: 420, silent: true });
        });
        return steps.filter(function (s) { return s.text.trim() || s.silent; });
      }

      if (mode !== 'rhyme') {
        var rate = mode === 'slow' ? Math.min(0.6, base) : base;
        return text.map(function (l, i) {
          var blank = !l.trim();
          return {
            text: l, lang: lang, rate: rate, pitch: pitch, silent: blank,
            /* a sentence that has ended gets a breath; a line that runs on
               gets barely any, so the sentence stays one thought */
            pause: blank ? 700 : (/[.!?।॥]\s*$/.test(l) ? 560 : 260)
          };
        });
      }

      /* Sing-song. Lines are grouped into verses by blank lines, and inside a
         verse the melody rises to the middle and settles on the last line, so
         a couplet lands the way a couplet should. */
      var labels = scheme(text.filter(function (l) { return l.trim(); }));
      var li = 0;
      var verse = [];
      var out = [];
      function flush() {
        if (!verse.length) return;
        verse.forEach(function (item, k) {
          var last = k === verse.length - 1;
          /* the couplet closes on the second of the pair, not the first */
          var pairEnd = k > 0 && verse[k - 1].label === item.label;
          out.push({
            text: item.text,
            lang: lang,
            rate: base * (last ? 0.9 : 0.96),
            /* lift on the way in, settle at the close */
            pitch: Math.max(0.4, Math.min(2, pitch * (last ? 0.88 : (k % 2 === 0 ? 1.14 : 0.98)))),
            pause: last ? 620 : (pairEnd ? 520 : 300)
          });
        });
        out.push({ text: '', lang: lang, pause: 780, silent: true });
        verse = [];
      }
      text.forEach(function (l) {
        if (!l.trim()) { flush(); return; }
        verse.push({ text: l, label: labels[li++] });
      });
      flush();
      if (out.length && out[out.length - 1].silent) out.pop();
      return out;
    },

    /* Everything a view needs to offer the modes for a given passage. */
    modesFor: function (lines) {
      var verse = looksLikeVerse(lines);
      return {
        suggested: verse ? 'rhyme' : 'read',
        isVerse: verse,
        list: ['read', 'rhyme', 'slow', 'spell'].map(function (m) {
          return { id: m, label: MODES[m].label, hint: MODES[m].hint };
        })
      };
    }
  };

  return api;
})();
