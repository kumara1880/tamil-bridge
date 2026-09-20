/* Tamil Bridge — expand the compact word rows into full vocabulary entries.

   data/vocab2.js stores each word as a short array to keep the download
   small. This turns those rows into the same objects the rest of the app
   already works with, and adds them to TB.VOCAB.

   The Tamil romanisation and the two Hindi readings are NOT stored. They are
   produced on demand by TB.Translit, the same reader used by the word cards,
   the translator and the search box, so a word can never be spelled one way
   in the list and another way when you tap it. Producing eight thousand of
   them at start-up would cost half a second on a cheap phone, so each one is
   a getter that runs once, the first time something asks, and then caches. */
(function () {
  'use strict';

  window.TB = window.TB || {};

  /* Themes the extended list uses that the core list did not have. */
  var EXTRA_THEMES = [
    { id: 'grammar',      ta: 'இலக்கணம்',          en: 'Grammar words' },
    { id: 'people',       ta: 'மனிதர்கள்',          en: 'People' },
    { id: 'jobs',         ta: 'தொழில்கள்',          en: 'Jobs' },
    { id: 'clothing',     ta: 'ஆடைகள்',            en: 'Clothing' },
    { id: 'kitchen',      ta: 'சமையலறை',           en: 'Kitchen' },
    { id: 'fruits',       ta: 'பழங்கள்',            en: 'Fruits' },
    { id: 'vegetables',   ta: 'காய்கறிகள்',         en: 'Vegetables' },
    { id: 'spices',       ta: 'மசாலாப் பொருட்கள்',  en: 'Spices' },
    { id: 'city',         ta: 'ஊரும் நகரமும்',      en: 'Town and city' },
    { id: 'directions',   ta: 'திசைகள்',           en: 'Directions' },
    { id: 'weather',      ta: 'வானிலை',            en: 'Weather' },
    { id: 'plants',       ta: 'தாவரங்கள்',          en: 'Plants and trees' },
    { id: 'birds',        ta: 'பறவைகள்',           en: 'Birds' },
    { id: 'insects',      ta: 'பூச்சிகள்',          en: 'Insects' },
    { id: 'materials',    ta: 'பொருட்கள்',          en: 'Materials' },
    { id: 'tools',        ta: 'கருவிகள்',          en: 'Tools' },
    { id: 'farming',      ta: 'விவசாயம்',          en: 'Farming' },
    { id: 'construction', ta: 'கட்டுமானம்',        en: 'Building' },
    { id: 'geography',    ta: 'நிலவியல்',          en: 'Geography' },
    { id: 'money',        ta: 'பணம்',              en: 'Money and banking' },
    { id: 'law',          ta: 'சட்டம்',            en: 'Government and law' },
    { id: 'measure',      ta: 'அளவைகள்',           en: 'Measurement' },
    { id: 'shapes',       ta: 'வடிவங்கள்',          en: 'Shapes' },
    { id: 'media',        ta: 'ஊடகம்',             en: 'News and films' },
    { id: 'sports',       ta: 'விளையாட்டு',        en: 'Sports' },
    { id: 'music',        ta: 'இசை',               en: 'Music' },
    { id: 'arts',         ta: 'கலைகள்',            en: 'Art' },
    { id: 'culture',      ta: 'பண்பாடு',           en: 'Culture and life' },
    { id: 'adverbs',      ta: 'வினையடைகள்',        en: 'Adverbs' },
    { id: 'abstract',     ta: 'கருத்துச் சொற்கள்',  en: 'Ideas' }
  ];

  /* Define a property that computes itself once, then behaves like a
     plain value. Falls back to computing eagerly where defineProperty on
     a plain object is unavailable. */
  function lazy(obj, key, make) {
    try {
      Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        get: function () {
          var v = make();
          Object.defineProperty(obj, key, {
            configurable: true, enumerable: true, writable: true, value: v
          });
          return v;
        }
      });
    } catch (e) {
      obj[key] = make();
    }
  }

  function expand(row) {
    /* [ english, IPA, English sound in Tamil, Tamil, Hindi, theme, level ] */
    var w = {
      en: row[0], enIpa: row[1], enTa: row[2],
      ta: row[3], hi: row[4], th: row[5], lv: row[6]
    };
    lazy(w, 'taR', function () {
      return TB.Translit ? TB.Translit.romanTamil(w.ta) : '';
    });
    lazy(w, 'hiR', function () {
      return TB.Translit ? TB.Translit.romanHindi(w.hi) : '';
    });
    lazy(w, 'hiTa', function () {
      return TB.Translit ? TB.Translit.hindiToTamilScript(w.hi) : '';
    });
    return w;
  }

  TB.VOCAB = TB.VOCAB || [];
  TB.THEMES = TB.THEMES || [];

  var have = {};
  TB.THEMES.forEach(function (t) { have[t.id] = true; });
  EXTRA_THEMES.forEach(function (t) { if (!have[t.id]) TB.THEMES.push(t); });

  /* vocab.js numbers its own entries as it loads, so carry on from there
     rather than starting again and handing two words the same id. */
  var n = TB.VOCAB.length;
  (TB.VOCAB_RAW || []).forEach(function (row) {
    var w = expand(row);
    n++;
    w.id = 'v' + (n < 100 ? ('00' + n).slice(-3) : String(n));
    TB.VOCAB.push(w);
  });

  /* Only themes that actually have words in them are worth showing. */
  var used = {};
  TB.VOCAB.forEach(function (w) { used[w.th] = (used[w.th] || 0) + 1; });
  TB.THEMES = TB.THEMES.filter(function (t) { return used[t.id]; });
  TB.THEMES.forEach(function (t) { t.n = used[t.id]; });

  TB.VOCAB_X = { expand: expand, themes: EXTRA_THEMES };
}());
