/* Tamil Bridge — read text from a photo, then translate it.
   Uses Tesseract.js (Apache-2.0, free) loaded from a CDN on first use only, so
   the rest of the app stays instant and fully offline.

   Language data is fetched per script from tessdata.projectnaptha.com.

   The engine is only as good as the language pack it is given. Reading English
   with the Tamil pack scores 4% and returns confident-looking nonsense
   ("1 90 1௦ 861௦0।1..."), which is exactly what a wrong dropdown used to
   produce. So the pack is no longer something the reader has to know: the
   photo is read, the score is checked, and other packs are tried until one
   clearly wins.                                                              */
window.TB = window.TB || {};

TB.OCR = (function () {
  var TESS_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  /* Tesseract's own model host. An earlier build pointed this at
     cdn.jsdelivr.net/npm/@tesseract.js-data/, which 404s for the
     *.traineddata.gz files — OCR could never load a language and every photo
     failed. Verified: tessdata.projectnaptha.com serves eng/tam/hin/osd. */
  var LANG_PATH = 'https://tessdata.projectnaptha.com/4.0.0';
  var loading = null;

  /* A result at or above this score is believed without asking another
     pack. Measured on real images: a correct pack scores 70-91, a wrong one
     0-31. 62 sits in the gap, and the gap is wide. */
  var TRUST = 62;

  /* OCR pack -> { label, translateCode, script } */
  var PACKS = {
    eng: { ta: 'ஆங்கிலம்', en: 'English', code: 'en', script: 'Latin' },
    tam: { ta: 'தமிழ்', en: 'Tamil', code: 'ta', script: 'Tamil' },
    hin: { ta: 'இந்தி', en: 'Hindi', code: 'hi', script: 'Devanagari' },
    tel: { ta: 'தெலுங்கு', en: 'Telugu', code: 'te', script: 'Telugu' },
    kan: { ta: 'கன்னடம்', en: 'Kannada', code: 'kn', script: 'Kannada' },
    mal: { ta: 'மலையாளம்', en: 'Malayalam', code: 'ml', script: 'Malayalam' },
    ben: { ta: 'வங்காளம்', en: 'Bengali', code: 'bn', script: 'Bengali' },
    guj: { ta: 'குஜராத்தி', en: 'Gujarati', code: 'gu', script: 'Gujarati' },
    pan: { ta: 'பஞ்சாபி', en: 'Punjabi', code: 'pa', script: 'Gurmukhi' },
    ori: { ta: 'ஒடியா', en: 'Odia', code: 'or', script: 'Oriya' },
    mar: { ta: 'மராத்தி', en: 'Marathi', code: 'mr', script: 'Devanagari' },
    nep: { ta: 'நேபாளி', en: 'Nepali', code: 'ne', script: 'Devanagari' },
    san: { ta: 'சமஸ்கிருதம்', en: 'Sanskrit', code: 'sa', script: 'Devanagari' },
    urd: { ta: 'உருது', en: 'Urdu', code: 'ur', script: 'Arabic' },
    ara: { ta: 'அரபு', en: 'Arabic', code: 'ar', script: 'Arabic' },
    fas: { ta: 'பாரசீகம்', en: 'Persian', code: 'fa', script: 'Arabic' },
    chi_sim: { ta: 'சீனம்', en: 'Chinese', code: 'zh-CN', script: 'Han' },
    jpn: { ta: 'ஜப்பானியம்', en: 'Japanese', code: 'ja', script: 'Japanese' },
    kor: { ta: 'கொரியன்', en: 'Korean', code: 'ko', script: 'Hangul' },
    rus: { ta: 'ரஷ்யன்', en: 'Russian', code: 'ru', script: 'Cyrillic' },
    spa: { ta: 'ஸ்பானிஷ்', en: 'Spanish', code: 'es', script: 'Latin' },
    fra: { ta: 'பிரெஞ்சு', en: 'French', code: 'fr', script: 'Latin' },
    deu: { ta: 'ஜெர்மன்', en: 'German', code: 'de', script: 'Latin' },
    por: { ta: 'போர்ச்சுகீஸ்', en: 'Portuguese', code: 'pt', script: 'Latin' },
    ita: { ta: 'இத்தாலியன்', en: 'Italian', code: 'it', script: 'Latin' },
    tha: { ta: 'தாய்', en: 'Thai', code: 'th', script: 'Thai' },
    vie: { ta: 'வியட்நாமிஸ்', en: 'Vietnamese', code: 'vi', script: 'Latin' },
    sin: { ta: 'சிங்களம்', en: 'Sinhala', code: 'si', script: 'Sinhala' }
  };

  /* Tried in this order when nothing is known about the photo. English first
     because it is both the commonest and the fastest to rule out. */
  var AUTO_ORDER = ['eng', 'tam', 'hin'];
  var REMEMBER = 'tb.ocr.lastPack';

  function lastPack() {
    try { return localStorage.getItem(REMEMBER) || ''; } catch (e) { return ''; }
  }
  function rememberPack(p) {
    try { localStorage.setItem(REMEMBER, p); } catch (e) {}
  }

  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = TESS_URL;
      s.async = true;
      s.onload = function () {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error('Could not load Tesseract.'));
      };
      s.onerror = function () {
        loading = null;
        reject(new Error('Could not download the image engine. Check your internet connection.'));
      };
      document.head.appendChild(s);
    });
    return loading;
  }

  /* ------------------------------------------------------------ the image */

  /* Tesseract wants letters roughly 30px tall on a flat white page. A photo is
     usually neither: a screenshot is too small to resolve and a camera shot is
     too big, tinted and unevenly lit. This fixes all three, and always paints
     white underneath first — a transparent PNG composited onto the default
     black canvas becomes white-on-black, which reads as nothing at all. */
  function prepare(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        var long = Math.max(w, h);
        var scale = 1;
        if (long < 1200) scale = Math.min(3, 1600 / long);   /* too small to resolve */
        else if (long > 2600) scale = 2600 / long;            /* needlessly slow */

        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * scale));
        c.height = Math.max(1, Math.round(h * scale));
        var g = c.getContext('2d', { willReadFrequently: true });
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = 'high';
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);

        try { normalise(g, c.width, c.height); } catch (e) { /* tainted or huge */ }

        resolve({ src: c.toDataURL('image/png'), width: c.width, height: c.height,
                  scale: scale, source: { w: w, h: h } });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read that image.'));
      };
      img.src = url;
    });
  }

  /* Grey it and stretch the contrast between the 2nd and 98th percentile, so a
     grey phone snapshot of a page gets black text on white without the hard
     threshold that would eat thin strokes in uneven light. */
  function normalise(g, w, h) {
    var d = g.getImageData(0, 0, w, h), p = d.data;
    var hist = new Array(256), i;
    for (i = 0; i < 256; i++) hist[i] = 0;
    for (i = 0; i < p.length; i += 4) {
      var v = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) | 0;
      p[i] = p[i + 1] = p[i + 2] = v;
      hist[v]++;
    }
    var total = w * h, cut = Math.max(1, Math.round(total * 0.02));
    var lo = 0, hi = 255, acc = 0;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc >= cut) { lo = i; break; } }
    acc = 0;
    for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= cut) { hi = i; break; } }
    if (hi - lo < 24) return;                    /* nearly flat: leave it alone */

    var span = hi - lo, lut = new Array(256);
    for (i = 0; i < 256; i++) {
      var x = (i - lo) / span;
      lut[i] = x <= 0 ? 0 : x >= 1 ? 255 : Math.round(x * 255);
    }
    for (i = 0; i < p.length; i += 4) {
      p[i] = p[i + 1] = p[i + 2] = lut[p[i]];
    }
    g.putImageData(d, 0, 0);
  }

  /* ------------------------------------------------------------ recognise */

  var STATUS = {
    'loading tesseract core': 'Loading the engine…',
    'loading language traineddata': 'Loading language data…',
    'initializing tesseract': 'Getting ready…',
    'initializing api': 'Getting ready…',
    'recognizing text': 'Reading the text…'
  };

  function shape(res, pack) {
    var d = (res && res.data) || {};
    var lines = (d.lines || []).map(function (l) {
      return { text: String(l.text || '').replace(/\s+$/, ''), confidence: Math.round(l.confidence || 0) };
    }).filter(function (l) { return l.text.trim(); });

    return {
      pack: pack,
      lang: PACKS[pack] ? PACKS[pack].code : 'en',
      text: String(d.text || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(),
      lines: lines,
      words: (d.words || []).map(function (w) {
        return { text: String(w.text || '').trim(), confidence: Math.round(w.confidence || 0) };
      }).filter(function (w) { return w.text; }),
      confidence: Math.round(d.confidence || 0)
    };
  }

  /* Tesseract reports a confidence even when it is hallucinating, so score
     the text itself as well. Real writing is mostly letters — and, in an
     Indic script, the marks that ride on them, which are as much part of
     the word as the letters are. A wrong language pack returns something
     that is mostly digits and loose symbols instead. */
  function plausibility(r) {
    var t = (r && r.text) || '';
    if (!t.trim()) return 0;
    /* zero-width joiners hold Indic clusters together; they are neither
       writing nor noise, so they are not counted either way */
    var body = t.replace(/[‌‍]/g, '');
    var nonSpace = body.replace(/\s/g, '').length;
    if (!nonSpace) return 0;
    var writing = (body.match(/[\p{L}\p{M}]/gu) || []).length;
    var junk = (body.match(/[^\p{L}\p{M}\p{N}\s.,!?;:'"()\-–—/&%@#*+=₹$£€।॥]/gu) || []).length;
    var textiness = writing / nonSpace;
    var penalty = Math.min(35, (junk / nonSpace) * 180);
    return Math.max(0, Math.round((r.confidence || 0) * (0.35 + 0.65 * textiness) - penalty));
  }

  function recognise(Tesseract, src, pack, onProgress) {
    return Tesseract.recognize(src, pack, {
      langPath: LANG_PATH,
      logger: function (m) {
        if (onProgress && m && m.status) {
          onProgress(STATUS[m.status] || m.status, Math.round((m.progress || 0) * 100));
        }
      }
    }).then(function (res) { return shape(res, pack); });
  }

  var api = {
    PACKS: PACKS,
    lastPack: lastPack,
    forgetPack: function () { rememberPack(''); },
    TRUST: TRUST,
    packLabel: function (p) { return PACKS[p] ? PACKS[p].en : p; },
    packToLang: function (p) { return PACKS[p] ? PACKS[p].code : 'en'; },
    plausibility: plausibility,

    /* Pack names for a translate language code. */
    packsFor: function (langCode) {
      var out = [];
      Object.keys(PACKS).forEach(function (p) { if (PACKS[p].code === langCode) out.push(p); });
      return out;
    },

    /* Read a photo.

       packs: [] or ['auto'] to work it out, otherwise the packs to try first.
       Whatever is asked for, a poor result is never returned when a better one
       is available — the wrong pack does not fail loudly, it fails fluently. */
    read: function (file, packs, onProgress, opts) {
      opts = opts || {};
      var asked = (packs || []).filter(function (p) { return PACKS[p]; });
      var auto = !asked.length || (packs || []).indexOf('auto') >= 0;

      /* Order to try: what was asked for, then whatever worked last time,
         then the common scripts. */
      var queue = asked.slice();
      var recent = lastPack();
      if (auto && recent && PACKS[recent] && queue.indexOf(recent) < 0) queue.push(recent);
      AUTO_ORDER.forEach(function (p) { if (queue.indexOf(p) < 0) queue.push(p); });
      if (!auto) queue = asked.concat(queue.filter(function (p) {
        return AUTO_ORDER.indexOf(p) >= 0 && asked.indexOf(p) < 0;
      }));
      var maxTries = opts.maxTries || (auto ? 3 : asked.length + 2);
      queue = queue.slice(0, maxTries);

      return loadTesseract().then(function (Tesseract) {
        return prepare(file).then(function (prepared) {
          var tried = [], best = null, i = 0;

          function label(pack, n) {
            return queue.length > 1
              ? 'Reading as ' + api.packLabel(pack) + ' (' + n + ' of ' + queue.length + ')…'
              : null;
          }

          function next() {
            if (i >= queue.length) return Promise.resolve(best);
            var pack = queue[i++];
            var pre = label(pack, i);
            return recognise(Tesseract, prepared.src, pack, function (st, pct) {
              if (onProgress) onProgress(pre || st, pct);
            }).then(function (r) {
              r.score = plausibility(r);
              tried.push({ pack: pack, lang: r.lang, confidence: r.confidence, score: r.score });
              if (!best || r.score > best.score) best = r;
              /* Good enough that another pack cannot reasonably beat it. */
              if (best.score >= TRUST) return best;
              return next();
            }).catch(function (e) {
              tried.push({ pack: pack, error: e.message });
              return next();
            });
          }

          return next().then(function (r) {
            if (!r) throw new Error('Could not read this image. Try a sharper, straight-on photo.');
            if (r.score >= TRUST) rememberPack(r.pack);
            r.tried = tried;
            r.autoDetected = auto;
            r.preview = prepared.src;
            r.lowConfidence = r.score < TRUST;
            return r;
          });
        });
      });
    },

    available: function () { return typeof document !== 'undefined'; }
  };

  return api;
})();
