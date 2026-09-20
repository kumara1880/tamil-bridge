/* Tamil Bridge — translation, any language to any language.
   Every provider here is free and needs no API key or account:
     1. Google gtx  — the endpoint the Translate web widget uses. Also returns
                      romanisation and dictionary senses, which we reuse for the
                      "meaning" feature.
     2. MyMemory    — free tier, no key, generous anonymous quota.
     3. LibreTranslate mirrors — fully open source.
     4. Offline     — our own trilingual dictionary, so single words still work
                      with no internet at all.
   Results are cached in memory and de-duplicated so typing stays cheap.        */
window.TB = window.TB || {};

TB.Translate = (function () {

  /* ------------------------------------------------ supported languages ---- */
  var LANGS = [
    { c: 'auto', n: 'Detect language', ta: 'தானாகக் கண்டறி' },
    { c: 'ta', n: 'Tamil', ta: 'தமிழ்' },
    { c: 'en', n: 'English', ta: 'ஆங்கிலம்' },
    { c: 'hi', n: 'Hindi', ta: 'இந்தி' },
    { c: 'te', n: 'Telugu', ta: 'தெலுங்கு' },
    { c: 'kn', n: 'Kannada', ta: 'கன்னடம்' },
    { c: 'ml', n: 'Malayalam', ta: 'மலையாளம்' },
    { c: 'mr', n: 'Marathi', ta: 'மராத்தி' },
    { c: 'bn', n: 'Bengali', ta: 'வங்காளம்' },
    { c: 'gu', n: 'Gujarati', ta: 'குஜராத்தி' },
    { c: 'pa', n: 'Punjabi', ta: 'பஞ்சாபி' },
    { c: 'or', n: 'Odia', ta: 'ஒடியா' },
    { c: 'as', n: 'Assamese', ta: 'அசாமி' },
    { c: 'ur', n: 'Urdu', ta: 'உருது' },
    { c: 'sa', n: 'Sanskrit', ta: 'சமஸ்கிருதம்' },
    { c: 'ne', n: 'Nepali', ta: 'நேபாளி' },
    { c: 'si', n: 'Sinhala', ta: 'சிங்களம்' },
    { c: 'ar', n: 'Arabic', ta: 'அரபு' },
    { c: 'fa', n: 'Persian', ta: 'பாரசீகம்' },
    { c: 'he', n: 'Hebrew', ta: 'ஹீப்ரு' },
    { c: 'tr', n: 'Turkish', ta: 'துருக்கி' },
    { c: 'ru', n: 'Russian', ta: 'ரஷ்யன்' },
    { c: 'uk', n: 'Ukrainian', ta: 'உக்ரேனியன்' },
    { c: 'pl', n: 'Polish', ta: 'போலிஷ்' },
    { c: 'de', n: 'German', ta: 'ஜெர்மன்' },
    { c: 'fr', n: 'French', ta: 'பிரெஞ்சு' },
    { c: 'es', n: 'Spanish', ta: 'ஸ்பானிஷ்' },
    { c: 'pt', n: 'Portuguese', ta: 'போர்ச்சுகீஸ்' },
    { c: 'it', n: 'Italian', ta: 'இத்தாலியன்' },
    { c: 'nl', n: 'Dutch', ta: 'டச்சு' },
    { c: 'sv', n: 'Swedish', ta: 'ஸ்வீடிஷ்' },
    { c: 'no', n: 'Norwegian', ta: 'நார்வேஜியன்' },
    { c: 'da', n: 'Danish', ta: 'டேனிஷ்' },
    { c: 'fi', n: 'Finnish', ta: 'ஃபின்னிஷ்' },
    { c: 'el', n: 'Greek', ta: 'கிரேக்கம்' },
    { c: 'cs', n: 'Czech', ta: 'செக்' },
    { c: 'ro', n: 'Romanian', ta: 'ருமேனியன்' },
    { c: 'hu', n: 'Hungarian', ta: 'ஹங்கேரியன்' },
    { c: 'bg', n: 'Bulgarian', ta: 'பல்கேரியன்' },
    { c: 'sr', n: 'Serbian', ta: 'செர்பியன்' },
    { c: 'hr', n: 'Croatian', ta: 'குரோஷியன்' },
    { c: 'sk', n: 'Slovak', ta: 'ஸ்லோவாக்' },
    { c: 'sl', n: 'Slovenian', ta: 'ஸ்லோவேனியன்' },
    { c: 'lt', n: 'Lithuanian', ta: 'லிதுவேனியன்' },
    { c: 'lv', n: 'Latvian', ta: 'லத்வியன்' },
    { c: 'et', n: 'Estonian', ta: 'எஸ்டோனியன்' },
    { c: 'zh-CN', n: 'Chinese (Simplified)', ta: 'சீனம் (எளிய)' },
    { c: 'zh-TW', n: 'Chinese (Traditional)', ta: 'சீனம் (பாரம்பரிய)' },
    { c: 'ja', n: 'Japanese', ta: 'ஜப்பானியம்' },
    { c: 'ko', n: 'Korean', ta: 'கொரியன்' },
    { c: 'th', n: 'Thai', ta: 'தாய்' },
    { c: 'vi', n: 'Vietnamese', ta: 'வியட்நாமிஸ்' },
    { c: 'id', n: 'Indonesian', ta: 'இந்தோனேசியன்' },
    { c: 'ms', n: 'Malay', ta: 'மலாய்' },
    { c: 'fil', n: 'Filipino', ta: 'ஃபிலிப்பினோ' },
    { c: 'my', n: 'Burmese', ta: 'பர்மியம்' },
    { c: 'km', n: 'Khmer', ta: 'கெமர்' },
    { c: 'lo', n: 'Lao', ta: 'லாவோ' },
    { c: 'sw', n: 'Swahili', ta: 'ஸ்வாஹிலி' },
    { c: 'am', n: 'Amharic', ta: 'அம்ஹாரிக்' },
    { c: 'ha', n: 'Hausa', ta: 'ஹௌசா' },
    { c: 'yo', n: 'Yoruba', ta: 'யோருபா' },
    { c: 'zu', n: 'Zulu', ta: 'ஸுலு' },
    { c: 'af', n: 'Afrikaans', ta: 'ஆஃப்ரிகான்ஸ்' },
    { c: 'sq', n: 'Albanian', ta: 'அல்பேனியன்' },
    { c: 'hy', n: 'Armenian', ta: 'ஆர்மேனியன்' },
    { c: 'az', n: 'Azerbaijani', ta: 'அஜர்பைஜானி' },
    { c: 'eu', n: 'Basque', ta: 'பாஸ்க்' },
    { c: 'be', n: 'Belarusian', ta: 'பெலருஷியன்' },
    { c: 'ca', n: 'Catalan', ta: 'கட்டலான்' },
    { c: 'ceb', n: 'Cebuano', ta: 'செபுவானோ' },
    { c: 'ny', n: 'Chichewa', ta: 'சிசேவா' },
    { c: 'co', n: 'Corsican', ta: 'கோர்சிகன்' },
    { c: 'eo', n: 'Esperanto', ta: 'எஸ்பெராண்டோ' },
    { c: 'fy', n: 'Frisian', ta: 'ஃப்ரிசியன்' },
    { c: 'gl', n: 'Galician', ta: 'கலீசியன்' },
    { c: 'ka', n: 'Georgian', ta: 'ஜார்ஜியன்' },
    { c: 'ht', n: 'Haitian Creole', ta: 'ஹைத்தியன்' },
    { c: 'haw', n: 'Hawaiian', ta: 'ஹவாயியன்' },
    { c: 'is', n: 'Icelandic', ta: 'ஐஸ்லாந்திக்' },
    { c: 'ig', n: 'Igbo', ta: 'இக்போ' },
    { c: 'ga', n: 'Irish', ta: 'ஐரிஷ்' },
    { c: 'jw', n: 'Javanese', ta: 'ஜாவனீஸ்' },
    { c: 'kk', n: 'Kazakh', ta: 'கசாக்' },
    { c: 'ku', n: 'Kurdish', ta: 'குர்திஷ்' },
    { c: 'ky', n: 'Kyrgyz', ta: 'கிர்கிஸ்' },
    { c: 'la', n: 'Latin', ta: 'லத்தீன்' },
    { c: 'lb', n: 'Luxembourgish', ta: 'லக்சம்பர்கிஷ்' },
    { c: 'mk', n: 'Macedonian', ta: 'மாசிடோனியன்' },
    { c: 'mg', n: 'Malagasy', ta: 'மலகாசி' },
    { c: 'mt', n: 'Maltese', ta: 'மால்டிஸ்' },
    { c: 'mi', n: 'Maori', ta: 'மாவோரி' },
    { c: 'mn', n: 'Mongolian', ta: 'மங்கோலியன்' },
    { c: 'ps', n: 'Pashto', ta: 'பஷ்தோ' },
    { c: 'sm', n: 'Samoan', ta: 'சமோவான்' },
    { c: 'gd', n: 'Scots Gaelic', ta: 'ஸ்காட்ஸ் கேலிக்' },
    { c: 'st', n: 'Sesotho', ta: 'சிசோதோ' },
    { c: 'sn', n: 'Shona', ta: 'ஷோனா' },
    { c: 'sd', n: 'Sindhi', ta: 'சிந்தி' },
    { c: 'so', n: 'Somali', ta: 'சோமாலி' },
    { c: 'su', n: 'Sundanese', ta: 'சுண்டானீஸ்' },
    { c: 'tg', n: 'Tajik', ta: 'தாஜிக்' },
    { c: 'tt', n: 'Tatar', ta: 'டாடர்' },
    { c: 'tk', n: 'Turkmen', ta: 'துர்க்மென்' },
    { c: 'uz', n: 'Uzbek', ta: 'உஸ்பெக்' },
    { c: 'cy', n: 'Welsh', ta: 'வெல்ஷ்' },
    { c: 'xh', n: 'Xhosa', ta: 'ஹோசா' },
    { c: 'yi', n: 'Yiddish', ta: 'யிடிஷ்' }
  ];

  var NAME = {};
  LANGS.forEach(function (l) { NAME[l.c] = l; });

  /* ------------------------------------------------- script-based detection */
  var SCRIPTS = [
    { c: 'ta', re: /[஀-௿]/ },
    { c: 'hi', re: /[ऀ-ॿ]/ },
    { c: 'te', re: /[ఀ-౿]/ },
    { c: 'kn', re: /[ಀ-೿]/ },
    { c: 'ml', re: /[ഀ-ൿ]/ },
    { c: 'bn', re: /[ঀ-৿]/ },
    { c: 'gu', re: /[઀-૿]/ },
    { c: 'pa', re: /[਀-੿]/ },
    { c: 'or', re: /[଀-୿]/ },
    { c: 'si', re: /[඀-෿]/ },
    { c: 'th', re: /[฀-๿]/ },
    { c: 'lo', re: /[຀-໿]/ },
    { c: 'my', re: /[က-႟]/ },
    { c: 'km', re: /[ក-៿]/ },
    { c: 'ko', re: /[가-힯ᄀ-ᇿ]/ },
    { c: 'ja', re: /[぀-ヿ]/ },
    { c: 'zh-CN', re: /[一-鿿]/ },
    { c: 'ru', re: /[Ѐ-ӿ]/ },
    { c: 'el', re: /[Ͱ-Ͽ]/ },
    { c: 'he', re: /[֐-׿]/ },
    { c: 'ar', re: /[؀-ۿ]/ },
    { c: 'ka', re: /[Ⴀ-ჿ]/ },
    { c: 'hy', re: /[԰-֏]/ },
    { c: 'am', re: /[ሀ-፿]/ }
  ];

  function detectScript(text) {
    for (var i = 0; i < SCRIPTS.length; i++) {
      if (SCRIPTS[i].re.test(text)) return SCRIPTS[i].c;
    }
    return /[a-zA-Z]/.test(text) ? 'en' : null;
  }

  /* ------------------------------------------------------------- providers */
  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); },
                   function (e) { clearTimeout(t); reject(e); });
    });
  }

  /* Google gtx: also gives romanisation (dt=rm) and dictionary senses (dt=bd). */
  function viaGoogle(text, from, to) {
    var url = 'https://translate.googleapis.com/translate_a/single'
      + '?client=gtx&sl=' + encodeURIComponent(from) + '&tl=' + encodeURIComponent(to)
      + '&dt=t&dt=bd&dt=rm&dj=1&q=' + encodeURIComponent(text);

    return withTimeout(fetch(url).then(function (r) {
      if (!r.ok) throw new Error('google ' + r.status);
      return r.json();
    }), 8000).then(function (j) {
      var out = '', srcRoman = '', outRoman = '';
      (j.sentences || []).forEach(function (s) {
        if (s.trans) out += s.trans;
        if (s.src_translit) srcRoman += s.src_translit;
        if (s.translit) outRoman += s.translit;
      });
      if (!out) throw new Error('google empty');
      var senses = (j.dict || []).map(function (d) {
        return { pos: d.pos || '', terms: (d.terms || []).slice(0, 6) };
      });
      return {
        text: out.trim(),
        detected: j.src || from,
        romanSource: srcRoman.trim(),
        romanTarget: outRoman.trim(),
        senses: senses,
        provider: 'Google'
      };
    });
  }

  function viaMyMemory(text, from, to) {
    if (from === 'auto') from = detectScript(text) || 'en';
    var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text)
      + '&langpair=' + encodeURIComponent(from) + '|' + encodeURIComponent(to);
    return withTimeout(fetch(url).then(function (r) {
      if (!r.ok) throw new Error('mymemory ' + r.status);
      return r.json();
    }), 8000).then(function (j) {
      var t = j && j.responseData && j.responseData.translatedText;
      if (!t || /^(MYMEMORY WARNING|INVALID)/i.test(t)) throw new Error('mymemory empty');
      return { text: t, detected: from, senses: [], provider: 'MyMemory' };
    });
  }

  var LIBRE = ['https://translate.disroot.org', 'https://libretranslate.de', 'https://translate.terraprint.co'];

  function viaLibre(text, from, to) {
    if (from === 'auto') from = detectScript(text) || 'en';
    var base = LIBRE[0];
    return withTimeout(fetch(base + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
    }).then(function (r) {
      if (!r.ok) throw new Error('libre ' + r.status);
      return r.json();
    }), 9000).then(function (j) {
      if (!j.translatedText) throw new Error('libre empty');
      return { text: j.translatedText, detected: from, senses: [], provider: 'LibreTranslate' };
    });
  }

  /* Offline: our own dictionary. Handles single words between ta / en / hi. */
  function viaOffline(text, from, to) {
    if (!TB.IDX) TB.buildIndexes();
    var q = String(text).trim().toLowerCase();
    var src = from === 'auto' ? (detectScript(text) || 'en') : from;
    if (['ta', 'en', 'hi'].indexOf(src) < 0 || ['ta', 'en', 'hi'].indexOf(to) < 0) return null;

    var hit = TB.IDX[src] && (TB.IDX[src][src === 'en' ? q : String(text).trim()]);
    if (hit) {
      return { text: hit[to], detected: src, senses: [], provider: 'offline', offline: true };
    }
    /* function words from the lexicon */
    if (src === 'en' && TB.LEX.en[q]) {
      var e = TB.LEX.en[q];
      return { text: to === 'ta' ? e[1] : (to === 'hi' ? e[2] : q), detected: 'en', senses: [], provider: 'offline', offline: true };
    }
    if (src === 'hi' && TB.LEX.hi[String(text).trim()]) {
      var h = TB.LEX.hi[String(text).trim()];
      return { text: to === 'ta' ? h[1] : (to === 'en' ? h[2] : text), detected: 'hi', senses: [], provider: 'offline', offline: true };
    }
    return null;
  }

  /* ---------------------------------------------------------------- cache */
  var cache = new Map();
  var MAX_CACHE = 400;

  function cacheKey(text, from, to) { return from + '>' + to + '>' + text; }

  /* --------------------------------------------------------------- public */
  var api = {
    LANGS: LANGS,
    langName: function (code) {
      var l = NAME[code];
      return l ? l.n : code;
    },
    langNameTa: function (code) {
      var l = NAME[code];
      return l ? l.ta : code;
    },
    detect: detectScript,

    /* Main entry. Resolves { text, detected, provider, senses, romanSource… } */
    translate: function (text, from, to) {
      text = String(text == null ? '' : text);
      if (!text.trim()) return Promise.resolve({ text: '', detected: from, senses: [], provider: 'none' });
      if (from === to && from !== 'auto') {
        return Promise.resolve({ text: text, detected: from, senses: [], provider: 'same' });
      }

      var key = cacheKey(text, from, to);
      if (cache.has(key)) return Promise.resolve(cache.get(key));

      function store(res) {
        if (cache.size > MAX_CACHE) cache.clear();
        cache.set(key, res);
        return res;
      }

      /* Short offline-answerable queries resolve instantly, then we still let a
         network provider refine longer text. */
      var off = viaOffline(text, from, to);

      return viaGoogle(text, from, to)
        .catch(function () { return viaMyMemory(text, from, to); })
        .catch(function () { return viaLibre(text, from, to); })
        .then(store)
        .catch(function (err) {
          if (off) return store(off);
          var e = new Error(navigator.onLine === false
            ? 'இணைய இணைப்பு இல்லை. ஆஃப்லைன் அகராதியில் இந்தச் சொல் இல்லை.'
            : 'மொழிபெயர்ப்பு சேவையை அணுக முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.');
          e.offlineHit = off;
          throw e;
        });
    },

    /* Translate into several targets at once (used by the meaning card). */
    multi: function (text, from, targets) {
      return Promise.all(targets.map(function (t) {
        return api.translate(text, from, t)
          .then(function (r) { return { lang: t, text: r.text, provider: r.provider }; })
          .catch(function () { return { lang: t, text: '', error: true }; });
      }));
    },

    offlineLookup: viaOffline,
    clearCache: function () { cache.clear(); }
  };

  return api;
})();
