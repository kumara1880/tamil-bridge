/* Tamil Bridge — word meaning, any language to any language.
   "cat" -> பூனை (pūṉai) / बिल्ली (billī), with part of speech, pronunciation,
   examples and related words. Romanised input works too ("poonai" -> பூனை).

   Order of resolution:
     1. our own trilingual vocabulary (instant, offline, has phonics + tips)
     2. the function-word lexicon
     3. romanised match via the transliteration phonetic key
     4. Google gtx dictionary senses (free, no key) for any other language pair
     5. dictionaryapi.dev for full English definitions (free, no key)          */
window.TB = window.TB || {};

TB.Dict = (function () {

  function detect(text) {
    var s = String(text || '').trim();
    var byScript = TB.Translate.detect(s);
    return byScript || 'en';
  }

  /* ---------- offline resolution ---------- */
  function fromVocab(word, lang) {
    if (!TB.IDX) TB.buildIndexes();
    var w = String(word).trim();
    var lower = w.toLowerCase();
    var hit = null;

    if (lang === 'en') hit = TB.IDX.en[lower];
    else if (lang === 'ta') hit = TB.IDX.ta[w];
    else if (lang === 'hi') hit = TB.IDX.hi[w];

    /* Romanised input ("poonai" -> பூனை) is matched on a loose phonetic key.
       That key is deliberately lossy, so it must never outrank a real word:
       "cat" keys to "sat", which would otherwise match Hindi सात (seven).
       Only fall through to it when the input is not itself a known word. */
    if (!hit && lang === 'en' && !TB.LEX.en[lower] && !(TB.Check && TB.Check.known(lower))) {
      /* First the exact route: spell the romanisation back into its own
         script ("naai" -> நாய்) and look that up. Only if nothing is found
         fall back to the phonetic key, which is lossy enough that two
         different words can share one. */
      ['ta', 'hi'].some(function (L) {
        var native = TB.Translit.lookup(w, L);
        if (native) {
          hit = TB.IDX[L][native] || null;
          if (hit) return true;
        }
        return false;
      });

      var key = TB.Translit.phKey(w);
      if (!hit && key && key.length >= 3) {
        /* Tamil romanisation first, then English, then Hindi. */
        ['taR', 'en', 'hiR'].some(function (field) {
          for (var i = 0; i < TB.VOCAB.length; i++) {
            if (TB.Translit.phKey(TB.VOCAB[i][field]) === key) { hit = TB.VOCAB[i]; return true; }
          }
          return false;
        });
        if (!hit) {
          ['ta', 'hi'].some(function (L) {
            var native = TB.Translit.to(w, L);
            if (native) {
              hit = TB.IDX[L][native] || null;
              if (hit) return true;
            }
            return false;
          });
        }
      }
    }
    return hit || null;
  }

  function fromLexicon(word, lang) {
    var w = String(word).trim();
    var lower = w.toLowerCase();
    if (lang === 'en' && TB.LEX.en[lower]) {
      var e = TB.LEX.en[lower];
      return { pos: e[0], ta: e[1], hi: e[2], en: lower };
    }
    if (lang === 'hi' && TB.LEX.hi[w]) {
      var h = TB.LEX.hi[w];
      return { pos: h[0], ta: h[1], en: h[2], hi: w };
    }
    if (lang === 'ta' && TB.LEX.ta[w]) {
      var t = TB.LEX.ta[w];
      return { pos: t[0], en: t[1], hi: t[2], ta: w };
    }
    return null;
  }

  /* Optional enrichment must never hold up the card. Anything slower than this
     is dropped: the offline answer is already on screen. */
  function capped(promise, ms, fallback) {
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; resolve(fallback); } }, ms || 6000);
      promise.then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
                   function () { if (!done) { done = true; clearTimeout(t); resolve(fallback); } });
    });
  }

  /* ---------- free English dictionary (definitions, synonyms, audio) ------- */
  function englishDefinitions(word) {
    var url = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word);
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    setTimeout(function () { if (ctl) ctl.abort(); }, 5000);
    return fetch(url, { signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('no entry'); return r.json(); })
      .then(function (j) {
        if (!Array.isArray(j) || !j.length) throw new Error('no entry');
        var first = j[0];
        var phonetic = first.phonetic || '';
        var audio = '';
        (first.phonetics || []).forEach(function (p) {
          if (!phonetic && p.text) phonetic = p.text;
          if (!audio && p.audio) audio = p.audio;
        });
        var senses = (first.meanings || []).map(function (m) {
          return {
            pos: m.partOfSpeech || '',
            defs: (m.definitions || []).slice(0, 3).map(function (d) {
              return { text: d.definition, example: d.example || '' };
            }),
            synonyms: (m.synonyms || []).slice(0, 6),
            antonyms: (m.antonyms || []).slice(0, 4)
          };
        });
        return { phonetic: phonetic, audio: audio, senses: senses };
      })
      .catch(function () { return null; });
  }

  /* --------------------------------------------------------------- public */
  var api = {
    detect: detect,

    /* Resolve a word. Returns a promise of a rich meaning card.
       targets defaults to the three study languages.                        */
    lookup: function (word, srcLang, targets) {
      word = String(word || '').trim();
      targets = targets || ['ta', 'en', 'hi'];
      if (!word) return Promise.resolve(null);

      var src = (!srcLang || srcLang === 'auto') ? detect(word) : srcLang;

      var card = {
        query: word, lang: src, roman: '', pos: '', posTa: '',
        translations: {}, senses: [], examples: [], related: [],
        vocab: null, phonetic: '', audio: '', tip: '', sources: []
      };

      /* 1 + 2 + 3: offline */
      var v = fromVocab(word, src);
      if (v) {
        card.vocab = v;
        card.translations.ta = v.ta;
        card.translations.en = v.en;
        card.translations.hi = v.hi;
        card.roman = src === 'ta' ? v.taR : (src === 'hi' ? v.hiR : '');
        card.phonetic = v.enIpa || '';
        card.tip = v.tip || '';
        card.sayTa = v.ta; card.sayEn = v.en; card.sayHi = v.hi;
        card.enTa = v.enTa; card.hiTa = v.hiTa; card.taR = v.taR; card.hiR = v.hiR;
        card.theme = v.th;
        card.sources.push('Tamil Bridge அகராதி');
        /* related words from the same theme */
        card.related = TB.VOCAB.filter(function (x) { return x.th === v.th && x.id !== v.id; })
          .slice(0, 8);
      } else {
        var lx = fromLexicon(word, src);
        if (lx) {
          card.pos = lx.pos;
          card.posTa = TB.Tutor.POS_TA[lx.pos] || lx.pos;
          if (lx.ta) card.translations.ta = lx.ta;
          if (lx.en) card.translations.en = lx.en;
          if (lx.hi) card.translations.hi = lx.hi;
          card.sources.push('Tamil Bridge சொல் அட்டவணை');
        }
      }

      if (!card.roman && (src === 'ta' || src === 'hi')) {
        card.roman = TB.Translit.roman(word, src);
      }

      /* 4 + 5: fill any gaps from the network, in parallel */
      var missing = targets.filter(function (t) { return t !== src && !card.translations[t]; });
      var jobs = [];

      if (missing.length) {
        jobs.push(capped(TB.Translate.multi(word, src, missing).then(function (rows) {
          rows.forEach(function (r) {
            if (r.text && !r.error) {
              card.translations[r.lang] = r.text;
              if (card.sources.indexOf('Google') < 0) card.sources.push('Google');
            }
          });
        }), 9000));
      }

      /* Sense list (part of speech + alternative meanings). Google's endpoint
         returns these for free, which also covers us when dictionaryapi.dev is
         unreachable — it blocks CORS from some origins. */
      var senseTarget = src === 'en' ? 'ta' : 'en';
      jobs.push(capped(TB.Translate.translate(word, src, senseTarget).then(function (r) {
        if (r.senses && r.senses.length) card.senses = r.senses;
      }), 9000));

      if (src === 'en') {
        jobs.push(capped(englishDefinitions(word.toLowerCase()).then(function (d) {
          if (d) {
            card.phonetic = card.phonetic || d.phonetic;
            card.audio = d.audio;
            card.defs = d.senses;
            if (!card.pos && d.senses[0]) {
              card.pos = d.senses[0].pos;
              card.posTa = TB.Tutor.POS_TA[card.pos] || card.pos;
            }
            card.sources.push('dictionaryapi.dev');
          }
        }), 6000));
      }

      return Promise.all(jobs).then(function () {
        if (!card.translations[src]) card.translations[src] = word;
        /* romanisation for every script answer, so a Tamil learner can read it */
        card.romanised = {};
        Object.keys(card.translations).forEach(function (L) {
          if (L === 'ta' || L === 'hi') {
            card.romanised[L] = TB.Translit.roman(card.translations[L], L);
          }
        });
        return card;
      });
    },

    /* Instant offline-only answer, for tap-a-word tooltips. */
    quick: function (word, srcLang) {
      var src = (!srcLang || srcLang === 'auto') ? detect(word) : srcLang;
      var v = fromVocab(word, src);
      if (v) return { ta: v.ta, en: v.en, hi: v.hi, roman: v.taR, offline: true };
      var lx = fromLexicon(word, src);
      if (lx) return { ta: lx.ta || '', en: lx.en || '', hi: lx.hi || '', pos: lx.pos, offline: true };

      /* try a morphological base form for English */
      if (src === 'en') {
        var lower = String(word).toLowerCase().replace(/[^a-z']/g, '');
        var base = TB.IRREG_REV[lower];
        if (base && TB.LEX.en[base]) {
          var b = TB.LEX.en[base];
          return { ta: b[1], en: base, hi: b[2], pos: b[0], offline: true, note: lower + ' → ' + base };
        }
      }
      return null;
    },

    englishDefinitions: englishDefinitions
  };

  return api;
})();
