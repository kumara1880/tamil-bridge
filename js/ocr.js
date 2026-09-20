/* Tamil Bridge — read text from a photo, then translate it.
   Uses Tesseract.js (Apache-2.0, free) loaded from a CDN on first use only, so
   the rest of the app stays instant and fully offline.

   Language data is fetched per script from jsDelivr. A photo can mix scripts;
   the caller picks which packs to load.                                       */
window.TB = window.TB || {};

TB.OCR = (function () {
  var TESS_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  var LANG_PATH = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/';
  var loading = null;

  /* OCR pack -> { label, translateCode } */
  var PACKS = {
    eng: { ta: 'ஆங்கிலம்', en: 'English', code: 'en' },
    tam: { ta: 'தமிழ்', en: 'Tamil', code: 'ta' },
    hin: { ta: 'இந்தி', en: 'Hindi', code: 'hi' },
    tel: { ta: 'தெலுங்கு', en: 'Telugu', code: 'te' },
    kan: { ta: 'கன்னடம்', en: 'Kannada', code: 'kn' },
    mal: { ta: 'மலையாளம்', en: 'Malayalam', code: 'ml' },
    ben: { ta: 'வங்காளம்', en: 'Bengali', code: 'bn' },
    guj: { ta: 'குஜராத்தி', en: 'Gujarati', code: 'gu' },
    pan: { ta: 'பஞ்சாபி', en: 'Punjabi', code: 'pa' },
    mar: { ta: 'மராத்தி', en: 'Marathi', code: 'mr' },
    urd: { ta: 'உருது', en: 'Urdu', code: 'ur' },
    ara: { ta: 'அரபு', en: 'Arabic', code: 'ar' },
    chi_sim: { ta: 'சீனம்', en: 'Chinese', code: 'zh-CN' },
    jpn: { ta: 'ஜப்பானியம்', en: 'Japanese', code: 'ja' },
    kor: { ta: 'கொரியன்', en: 'Korean', code: 'ko' },
    rus: { ta: 'ரஷ்யன்', en: 'Russian', code: 'ru' },
    spa: { ta: 'ஸ்பானிஷ்', en: 'Spanish', code: 'es' },
    fra: { ta: 'பிரெஞ்சு', en: 'French', code: 'fr' },
    deu: { ta: 'ஜெர்மன்', en: 'German', code: 'de' },
    por: { ta: 'போர்ச்சுகீஸ்', en: 'Portuguese', code: 'pt' },
    tha: { ta: 'தாய்', en: 'Thai', code: 'th' },
    vie: { ta: 'வியட்நாமிஸ்', en: 'Vietnamese', code: 'vi' },
    sin: { ta: 'சிங்களம்', en: 'Sinhala', code: 'si' }
  };

  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = TESS_URL;
      s.async = true;
      s.onload = function () {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error('Tesseract ஏற்ற முடியவில்லை.'));
      };
      s.onerror = function () {
        loading = null;
        reject(new Error('படக் கருவியைப் பதிவிறக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.'));
      };
      document.head.appendChild(s);
    });
    return loading;
  }

  /* Downscale very large photos: OCR is far faster and no less accurate. */
  function prepare(file, maxDim) {
    maxDim = maxDim || 1800;
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        if (scale === 1) { resolve({ src: url, width: w, height: h, revoke: url }); return; }
        var c = document.createElement('canvas');
        c.width = Math.round(w * scale);
        c.height = Math.round(h * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ src: c.toDataURL('image/png'), width: c.width, height: c.height });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('இந்தப் படத்தைப் படிக்க முடியவில்லை.'));
      };
      img.src = url;
    });
  }

  var api = {
    PACKS: PACKS,
    packLabel: function (p) { return PACKS[p] ? PACKS[p].ta : p; },
    packToLang: function (p) { return PACKS[p] ? PACKS[p].code : 'en'; },

    /* langs: array of Tesseract pack names, e.g. ['eng','tam'] */
    read: function (file, langs, onProgress) {
      langs = (langs && langs.length) ? langs : ['eng'];
      var langStr = langs.join('+');

      return loadTesseract().then(function (Tesseract) {
        return prepare(file).then(function (prepared) {
          return Tesseract.recognize(prepared.src, langStr, {
            langPath: LANG_PATH,
            logger: function (m) {
              if (onProgress && m && m.status) {
                var label = {
                  'loading tesseract core': 'கருவியை ஏற்றுகிறது…',
                  'loading language traineddata': 'மொழித் தரவை ஏற்றுகிறது…',
                  'initializing tesseract': 'தயார் செய்கிறது…',
                  'initializing api': 'தயார் செய்கிறது…',
                  'recognizing text': 'எழுத்துகளைப் படிக்கிறது…'
                }[m.status] || m.status;
                onProgress(label, Math.round((m.progress || 0) * 100));
              }
            }
          });
        });
      }).then(function (res) {
        var d = res.data || {};
        var lines = (d.lines || []).map(function (l) {
          return { text: String(l.text || '').trim(), confidence: Math.round(l.confidence || 0) };
        }).filter(function (l) { return l.text; });

        var words = (d.words || []).map(function (w) {
          return { text: String(w.text || '').trim(), confidence: Math.round(w.confidence || 0) };
        }).filter(function (w) { return w.text; });

        return {
          text: String(d.text || '').replace(/\n{3,}/g, '\n\n').trim(),
          lines: lines,
          words: words,
          confidence: Math.round(d.confidence || 0)
        };
      });
    },

    /* Suggest packs from the language the user says the photo is in. */
    packsFor: function (langCode) {
      var out = [];
      Object.keys(PACKS).forEach(function (p) { if (PACKS[p].code === langCode) out.push(p); });
      return out.length ? out : ['eng'];
    },

    available: function () { return typeof document !== 'undefined'; }
  };

  return api;
})();
