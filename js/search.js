/* Tamil Bridge — search across everything.

   Twenty sections, three thousand words, a hundred word pairs, two hundred
   phrases, ten lessons, nineteen conversations and every letter of three
   alphabets. None of it is any use if you cannot find it: the synonyms had
   been sitting behind a tab called "Same & opposite" for weeks because there
   was nowhere to type the word "synonym".

   So: one box that searches the lot, in English, Tamil, Hindi or romanised
   anything. "synonym", "opposite", "எதிர்", "विलोम", "naai", "नाय", "dog"
   and "நாய்" all lead somewhere sensible.

   The index is built once, lazily, from the data already in memory. Nothing
   is fetched, so it works from a file:// page on a plane.                 */
window.TB = window.TB || {};

TB.Search = (function () {

  /* ------------------------------------------------------------ matching */

  /* Latin accents are stripped so "vanakkam" finds "vaṇakkam", and Indic
     text is left exactly as it is, because a Tamil vowel sign is a letter
     and not an accent. Zero-width joiners go, since keyboards insert them
     invisibly and a person cannot see why their search failed. */
  function norm(s) {
    s = String(s == null ? '' : s).toLowerCase();
    if (s.normalize) {
      s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
    }
    return s.replace(/[​-‍﻿]/g, '')
            .replace(/[^\wऀ-ॿ஀-௿\s-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
  }

  /* Romanised Indian languages have no one spelling, and the scholarly one
     with dots and bars underneath is the one spelling nobody types. A phone
     keyboard gives you "poonai", "naai", "vanakkam", "thanni", "azhagu" —
     so both the query and the stored reading are folded down to the sound
     they share before they are compared.

     Only Latin text is folded. Tamil and Devanagari are already exact. */
  function fold(s) {
    if (!/[a-z]/.test(s)) return s;
    return s
      .replace(/zh/g, 'l')               /* ழ is written zh and sounds like l */
      .replace(/[sz]h/g, 's').replace(/ph/g, 'f')
      .replace(/([tdbgkcj])h/g, '$1')    /* aspirates: th=t, dh=d, bh=b, gh=g */
      .replace(/w/g, 'v').replace(/q/g, 'k').replace(/x/g, 'ks')
      .replace(/ee|ie|ea/g, 'i').replace(/oo|ou/g, 'u')
      .replace(/([aeiou])\1+/g, '$1')    /* aa = a, uu = u */
      /* Tamil does not distinguish voiced from unvoiced: ட is heard as t
         or as d depending on where it stands, and people write it both ways
         — வீடு is typed "veedu" as often as "veetu". */
      .replace(/d/g, 't').replace(/g/g, 'k').replace(/b/g, 'p').replace(/[jz]/g, 'c')
      .replace(/([^aeiou\s])\1+/g, '$1') /* nn = n, kk = k */
      /* A final glide is written three ways and a final r often not at all:
         நாய் is naai, nay or nai; தண்ணீர் is thanneer or thanni. They are
         brought together, but no further — folding “naai” down to “ni”
         matches half the dictionary and buries the dog. */
      .replace(/ay\b/g, 'ai').replace(/y\b/g, 'i').replace(/r\b/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  /* How well one key answers one query. A word that starts with what you
     typed is worth far more than one that merely contains it, which is why
     "can" offers "candle" before "American". */
  function score(key, q) {
    if (!key) return 0;
    if (key === q) return 1000;
    var at = key.indexOf(q);
    if (at < 0) return 0;
    if (at === 0) return 700 - Math.min(key.length - q.length, 60);
    if (key.charAt(at - 1) === ' ' || key.charAt(at - 1) === '-') {
      return 450 - Math.min(key.length - q.length, 60);
    }
    return 200 - Math.min(key.length - q.length, 60);
  }

  /* ------------------------------------------------------------- the map */

  /* Every destination, with the words somebody would actually type to look
     for it. The aliases are the whole point: nobody searches for the word
     "phrasebook" when what they want is "how do I say thank you". */
  var SECTIONS = [
    { t: 'Home', href: '#/home', ic: '\u{1F3E0}',
      keys: 'home start dashboard streak progress' },
    { t: 'Lessons', href: '#/learn', ic: '\u{1F4D8}',
      keys: 'lessons units course syllabus learn study chapter' },
    { t: 'Phrasebook', href: '#/phrases', ic: '\u{1F4AC}',
      keys: 'phrases phrasebook sentences say daily useful travel' },
    { t: 'Practice', href: '#/practice', ic: '\u{1F3AF}',
      keys: 'practice revise review quiz test flashcards srs due' },
    { t: 'Translate', href: '#/translate', ic: '\u{1F524}',
      keys: 'translate translation convert language' },
    { t: 'Meaning', href: '#/meaning', ic: '\u{1F4D6}',
      keys: 'meaning dictionary define definition word lookup' },
    { t: 'Vertically & crosswise', href: '#/crosswise', ic: '\u2716\uFE0F',
      keys: 'crosswise vertically urdhva tiryagbhyam vedic multiply multiplication '
          + 'mental maths fast trick cross பெருக்கல் गुणा' },
    { t: 'Maths practice', href: '#/sums', ic: '\u270D\uFE0F',
      keys: 'practice sums questions quiz test exercise problems worksheet marks '
          + 'add subtract multiply divide கணக்கு गणित अभ्यास' },
    { t: 'Number chart', href: '#/chart', ic: '\u{1F4CA}',
      keys: 'number chart table names one hundred counting list 1 100 tens hundreds '
          + 'எண் அட்டவணை संख्या तालिका' },
    { t: 'Abacus', href: '#/abacus', ic: '\u{1F9EE}',
      keys: 'abacus soroban beads counting frame rods place value mental maths '
          + 'மணிச்சட்டம் गणनपट्टिका' },
    { t: 'Numbers', href: '#/numbers', ic: '\u{1F522}',
      keys: 'numbers counting count digits lakh crore thousand million' },
    { t: 'Maths', href: '#/maths', ic: '➕',
      keys: 'maths math arithmetic addition subtraction multiplication division sum plus minus times divide table' },
    { t: 'Grammar rules', href: '#/english', ic: '\u{1F4D0}',
      keys: 'grammar rules noun verb adjective adverb tense article preposition pronoun case '
          + 'sandhi pulli vetrumai thinai இலக்கணம் வேற்றுமை புள்ளி व्याकरण' },
    { t: 'Synonyms & Antonyms', href: '#/english/words', ic: '\u{1F501}',
      keys: 'synonym synonyms antonym antonyms opposite opposites same similar thesaurus word pairs '
          + 'ஒத்த சொல் எதிர்ச்சொல் '
          + 'पर्यायवाची विलोम' },
    { t: 'Tense chart', href: '#/english/tense', ic: '\u{1F570}',
      keys: 'tense tenses chart past present future conjugation timeline '
          + 'காலம் काल' },
    { t: 'Sentence bank', href: '#/english/sentences', ic: '♾',
      keys: 'sentences sentence bank lakh examples statement negative question' },
    { t: 'Spoken practice', href: '#/english/speaking', ic: '\u{1F5E3}',
      keys: 'speaking spoken conversation dialogue talk everyday chat' },
    { t: 'Sentence Explainer', href: '#/tutor', ic: '\u{1F9E0}',
      keys: 'explain explainer analyse analyze parse breakdown tutor why' },
    { t: 'Conjugation', href: '#/conjugate', ic: '\u{1F500}',
      keys: 'conjugate conjugation verb forms endings' },
    { t: 'Photo Translate', href: '#/photo', ic: '\u{1F4F7}',
      keys: 'photo picture image camera scan ocr read text board sign rhyme' },
    { t: 'Pronunciation', href: '#/speak', ic: '\u{1F3A4}',
      keys: 'pronounce pronunciation speak say accent microphone score voice' },
    { t: 'Writing', href: '#/write', ic: '✏',
      keys: 'write writing handwriting trace copy letters numbers name practice sheet 0 100 abc abcd' },
    { t: 'Alphabet', href: '#/alphabet', ic: '\u{1F521}',
      keys: 'alphabet letters uyir mei varnamala எழுத்து वर्णमाला' },
    { t: 'Sounds', href: '#/phonics', ic: '\u{1F50A}',
      keys: 'sounds phonics pronounce syllable ipa' },
    { t: 'Vocabulary', href: '#/vocab', ic: '\u{1F4DA}',
      keys: 'vocabulary vocab words list themes' },
    { t: 'Growing up now', href: '#/modern', ic: '\u{1F916}',
      keys: 'modern technology ai artificial intelligence computer internet online safety '
          + 'password privacy scam fake money saving screen sleep climate weather water '
          + 'coding code learning feelings kids children today செயற்கை नुण்ணறிவு '
          + 'कृत्रिम बुद्धिमत्ता' },
    { t: 'History', href: '#/history', ic: '\u{1F558}',
      keys: 'history recent past searches saved' },
    { t: 'Settings', href: '#/settings', ic: '⚙',
      keys: 'settings options preferences theme colour color voice sync account sign out api' }
  ];

  /* ------------------------------------------------------------ the index */

  var index = null;

  function entry(out, o) {
    var keys = [];
    for (var i = 0; i < o.keys.length; i++) {
      var k = norm(o.keys[i]);
      if (k && keys.indexOf(k) < 0) keys.push(k);
    }
    if (!keys.length) return;
    /* The fold is stored even when it is identical to the key, because the
       query is folded too and the two must be compared like with like. */
    var fkeys = [];
    for (var j = 0; j < keys.length; j++) {
      var f = fold(keys[j]);
      if (f && fkeys.indexOf(f) < 0) fkeys.push(f);
    }
    out.push({ t: o.t, s: o.s || '', kind: o.kind, ic: o.ic, href: o.href,
               keys: keys, fkeys: fkeys, w: o.w || 0 });
  }

  function build() {
    if (index) return index;
    var out = [];
    var T = window.TB;

    /* Sections first and heaviest: if you type "writing" you want the
       writing page, not a vocabulary card that happens to say "writing". */
    SECTIONS.forEach(function (s) {
      entry(out, {
        t: s.t, s: 'Go to this section', kind: 'section', ic: s.ic,
        href: s.href, keys: [s.t].concat(s.keys.split(/\s+/)), w: 900
      });
    });

    (T.VOCAB || []).forEach(function (w) {
      entry(out, {
        t: w.en, s: w.ta + '  ·  ' + w.hi, kind: 'word', ic: '\u{1F4D6}',
        href: '#/meaning/' + encodeURIComponent(w.en),
        keys: [w.en, w.ta, w.hi, w.taR, w.hiR, w.enTa, w.th], w: 120
      });
    });

    [['en', T.WORDPAIRS], ['hi', T.WORDPAIRS_HI], ['ta', T.WORDPAIRS_TA]].forEach(function (pair) {
      (pair[1] || []).forEach(function (w) {
        entry(out, {
          t: w[pair[0]], s: 'same: ' + w.syn.slice(0, 3).join(', ') + '  ·  opposite: ' + w.ant.slice(0, 3).join(', '),
          kind: 'pair', ic: '\u{1F501}', href: '#/english/words',
          keys: [w[pair[0]], w.en, w.ta, w.hi].concat(w.syn).concat(w.ant), w: 260
        });
      });
    });

    [T.GRAMMAR, T.GRAMMAR_HI, T.GRAMMAR_TA].forEach(function (set) {
      (set || []).forEach(function (g) {
        entry(out, {
          t: g.title.en, s: g.rule.en.slice(0, 90), kind: 'grammar', ic: '\u{1F4D0}',
          href: '#/english',
          keys: [g.title.en, g.title.ta, g.title.hi, g.id], w: 300
        });
      });
    });

    (T.SPOKEN || []).forEach(function (d) {
      entry(out, {
        t: d.title.en, s: d.lines.length + ' lines to practise aloud', kind: 'talk', ic: '\u{1F5E3}',
        href: '#/english/speaking',
        keys: [d.title.en, d.title.ta, d.title.hi, d.id], w: 260
      });
    });

    (T.PHRASES || []).forEach(function (p) {
      entry(out, {
        t: p.en, s: p.ta + '  ·  ' + p.hi, kind: 'phrase', ic: '\u{1F4AC}',
        href: '#/phrases', keys: [p.en, p.ta, p.hi, p.g], w: 100
      });
    });

    (T.LESSONS || []).forEach(function (u) {
      entry(out, {
        t: u.title.en, s: u.goal || '', kind: 'lesson', ic: '\u{1F4D8}',
        href: '#/learn/' + u.id,
        keys: [u.title.en, u.title.ta, u.id, u.goal], w: 320
      });
    });

    /* Every number a child writes or reads out. Typing 47 found nothing at
       all before this, which is a strange thing for a counting app. */
    (T.MODERN || []).forEach(function (m) {
      entry(out, {
        t: m.title.en, s: m.what.en.slice(0, 90), kind: 'modern', ic: m.icon,
        href: '#/modern/' + m.id,
        keys: [m.title.en, m.title.ta, m.title.hi, m.id, m.group]
          .concat(m.words.map(function (w) { return w.en; }))
          .concat(m.words.map(function (w) { return w.ta; }))
          .concat(m.words.map(function (w) { return w.hi; })), w: 300
      });
    });

    if (T.Numbers) {
      for (var n = 0; n <= 100; n++) {
        var en = T.Numbers.enIndian(n), ta = T.Numbers.ta(n), hi = T.Numbers.hi(n);
        entry(out, {
          t: String(n), s: en + '  \u00b7  ' + ta + '  \u00b7  ' + hi,
          kind: 'number', ic: '\u{1F522}', href: '#/numbers',
          keys: [String(n), en, ta, hi], w: 340
        });
      }
      [1000, 100000, 10000000].forEach(function (big) {
        entry(out, {
          t: String(big), s: T.Numbers.enIndian(big) + '  \u00b7  ' + T.Numbers.ta(big)
             + '  \u00b7  ' + T.Numbers.hi(big),
          kind: 'number', ic: '\u{1F522}', href: '#/numbers',
          keys: [String(big), T.Numbers.enIndian(big), T.Numbers.ta(big), T.Numbers.hi(big),
                 big === 100000 ? 'lakh' : big === 10000000 ? 'crore' : 'thousand'], w: 340
        });
      });
    }

    if (T.Sentences) {
      (T.Sentences.VERBS || []).forEach(function (v) {
        entry(out, {
          t: v.en, s: 'past · present · future in three languages',
          kind: 'verb', ic: '\u{1F570}', href: '#/english/tense',
          keys: [v.en, v.ta.d, v.ta.p, v.ta.f, v.ta.inf], w: 240
        });
      });
    }

    if (T.ALPHABET) {
      ['ta', 'hi'].forEach(function (lang) {
        var a = T.ALPHABET[lang];
        if (!a) return;
        (a.vowels || []).forEach(function (v) {
          entry(out, {
            t: v.ch, s: 'vowel · ' + (v.en || v.ta || ''), kind: 'letter', ic: '\u{1F521}',
            href: '#/alphabet', keys: [v.ch, v.en, v.ta], w: 200
          });
        });
      });
    }

    index = out;
    return index;
  }

  /* --------------------------------------------------------------- query */

  function query(q, limit) {
    q = norm(q);
    if (q.length < 1) return [];
    var idx = build();
    var fq = fold(q);
    var terms = q.split(' ').filter(function (x) { return x; });
    var hits = [];

    for (var i = 0; i < idx.length; i++) {
      var e = idx[i], best = 0;
      for (var k = 0; k < e.keys.length; k++) {
        /* the headword counts for full marks; a later key, such as a theme
           or a synonym, counts for a little less */
        var sc = score(e.keys[k], q) * (k === 0 ? 1 : 0.82);
        if (sc > best) best = sc;
        if (best >= 1000) break;
      }
      /* A match only heard through the folding is worth less than one
         spelled exactly, so "can" still beats "khan". */
      if (best < 1000 && fq !== q) {
        for (var g = 0; g < e.fkeys.length; g++) {
          var sf = score(e.fkeys[g], fq) * 0.7;
          if (sf > best) best = sf;
        }
      } else if (best === 0) {
        for (var g2 = 0; g2 < e.fkeys.length; g2++) {
          var sf2 = score(e.fkeys[g2], fq) * 0.7;
          if (sf2 > best) best = sf2;
        }
      }
      /* A phrase like "artificial intelligence" is in no single key,
         because keys are words. So a multi-word query also matches when
         every word of it is found somewhere in the entry — worth less than
         a phrase that really is one key, but far better than nothing. */
      if (best === 0 && terms.length > 1) {
        var sum = 0, all = true;
        for (var ti = 0; ti < terms.length; ti++) {
          var bestTerm = 0;
          for (var ki = 0; ki < e.keys.length; ki++) {
            var st = score(e.keys[ki], terms[ti]);
            if (st > bestTerm) bestTerm = st;
          }
          if (!bestTerm) { all = false; break; }
          sum += bestTerm;
        }
        if (all) best = (sum / terms.length) * 0.85;
      }
      if (best > 0) hits.push({ e: e, score: best + e.w });
    }

    hits.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.e.t.length - b.e.t.length;
    });

    /* One destination should not fill the list with near-identical rows. */
    var seen = {}, out = [];
    for (var h = 0; h < hits.length && out.length < (limit || 12); h++) {
      var key = hits[h].e.kind + '|' + hits[h].e.t + '|' + hits[h].e.href;
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(hits[h].e);
    }
    return out;
  }

  return {
    norm: norm,
    fold: fold,
    score: score,
    SECTIONS: SECTIONS,
    build: build,
    size: function () { return build().length; },
    query: query
  };
})();
