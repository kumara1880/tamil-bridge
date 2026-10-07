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
     black canvas becomes white-on-black, which reads as nothing at all.

     The cleaned canvas is kept, so that when the first reading is poor the
     same picture can be tried again prepared another way — inverted for a
     dark-mode screenshot, hard black-and-white for a dim photo — without
     decoding the file a second time. */
  function prepare(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h) {
          URL.revokeObjectURL(url);
          reject(new Error(UNREADABLE));
          return;
        }
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

        var dark = false;
        try { dark = normalise(g, c.width, c.height); } catch (e) { /* tainted or huge */ }

        resolve({ src: c.toDataURL('image/png'), width: c.width, height: c.height,
                  scale: scale, source: { w: w, h: h }, canvas: c, dark: dark });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error(UNREADABLE));
      };
      img.src = url;
    });
  }

  /* What a browser cannot open is almost always an iPhone HEIC photo opened
     on a computer, or a file that is not a picture at all. Both have a plain
     way out, so the message gives it. */
  var UNREADABLE = 'This picture could not be opened. If it is an iPhone photo (HEIC), '
    + 'take a screenshot of it, or share it as JPG, and choose that instead.';

  /* The same picture, prepared differently, for a second try when the first
     reading was poor.
       invert  — light writing on a dark background: a dark-mode screenshot,
                 a blackboard, a night sign.
       binary  — hard black and white at the image's own best threshold
                 (Otsu), for a dim or grey photograph where the contrast
                 stretch was not enough. */
  function variant(prepared, kind) {
    var src = prepared.canvas;
    var c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    var g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(src, 0, 0);
    var d = g.getImageData(0, 0, c.width, c.height), p = d.data, i;
    if (kind === 'invert') {
      for (i = 0; i < p.length; i += 4) {
        p[i] = 255 - p[i]; p[i + 1] = 255 - p[i + 1]; p[i + 2] = 255 - p[i + 2];
      }
    } else if (kind === 'binary') {
      var t = otsu(p);
      /* dark text stays dark whichever way round the picture was */
      var flip = prepared.dark;
      for (i = 0; i < p.length; i += 4) {
        var on = p[i] > t;
        if (flip) on = !on;
        var v = on ? 255 : 0;
        p[i] = p[i + 1] = p[i + 2] = v;
      }
    }
    g.putImageData(d, 0, 0);
    return c.toDataURL('image/png');
  }

  /* The threshold that best separates the two groups of grey in the image. */
  function otsu(p) {
    var hist = new Array(256), i, total = 0;
    for (i = 0; i < 256; i++) hist[i] = 0;
    for (i = 0; i < p.length; i += 4) { hist[p[i]]++; total++; }
    var sum = 0;
    for (i = 0; i < 256; i++) sum += i * hist[i];
    var sumB = 0, wB = 0, best = 0, t = 127;
    for (i = 0; i < 256; i++) {
      wB += hist[i];
      if (!wB) continue;
      var wF = total - wB;
      if (!wF) break;
      sumB += i * hist[i];
      var mB = sumB / wB, mF = (sum - sumB) / wF;
      var between = wB * wF * (mB - mF) * (mB - mF);
      if (between > best) { best = between; t = i; }
    }
    return t;
  }

  /* Grey it and stretch the contrast between the 2nd and 98th percentile, so a
     grey phone snapshot of a page gets black text on white without the hard
     threshold that would eat thin strokes in uneven light. */
  /* Returns true when the page is mostly dark — light writing on a dark
     ground — so a second try knows to invert it. */
  function normalise(g, w, h) {
    var d = g.getImageData(0, 0, w, h), p = d.data;
    var hist = new Array(256), i, lum = 0;
    for (i = 0; i < 256; i++) hist[i] = 0;
    for (i = 0; i < p.length; i += 4) {
      var v = (p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114) | 0;
      p[i] = p[i + 1] = p[i + 2] = v;
      hist[v]++;
      lum += v;
    }
    var total = w * h, cut = Math.max(1, Math.round(total * 0.02));
    var dark = (lum / Math.max(1, total)) < 110;
    var lo = 0, hi = 255, acc = 0;
    for (i = 0; i < 256; i++) { acc += hist[i]; if (acc >= cut) { lo = i; break; } }
    acc = 0;
    for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= cut) { hi = i; break; } }
    if (hi - lo < 24) { g.putImageData(d, 0, 0); return dark; }   /* nearly flat */

    var span = hi - lo, lut = new Array(256);
    for (i = 0; i < 256; i++) {
      var x = (i - lo) / span;
      lut[i] = x <= 0 ? 0 : x >= 1 ? 255 : Math.round(x * 255);
    }
    for (i = 0; i < p.length; i += 4) {
      p[i] = p[i + 1] = p[i + 2] = lut[p[i]];
    }
    g.putImageData(d, 0, 0);
    return dark;
  }

  /* Which script most of the text is in, so a mixed reading can still be
     read aloud in the right voice and translated from the right language. */
  function dominantLang(text) {
    var t = String(text || '');
    var counts = {
      ta: (t.match(/[஀-௿]/g) || []).length,
      hi: (t.match(/[ऀ-ॿ]/g) || []).length,
      en: (t.match(/[A-Za-z]/g) || []).length
    };
    var best = 'en', n = -1;
    Object.keys(counts).forEach(function (k) { if (counts[k] > n) { n = counts[k]; best = k; } });
    var scripts = Object.keys(counts).filter(function (k) { return counts[k] >= 3; }).length;
    return { lang: best, mixed: scripts > 1 };
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

  /* One line read as rubble inside an otherwise clean reading.

     The whole-picture score is an average, and that hid the commonest
     failure there is: a screenshot with English above and Tamil below read
     with the English pack scored 66 — over the line — because two clean
     English lines carried one line of "&HITED6V 6L6T0TE SHLD". The reading
     was accepted, and the Tamil was gone. A line the engine itself was
     unsure of, among lines it was sure of, means another script is there. */
  function hasRubble(r) {
    var lines = (r && r.lines) || [];
    if (lines.length < 1) return false;
    var sure = lines.filter(function (l) { return l.confidence >= 80; }).length;
    var bad = lines.filter(function (l) {
      var t = String(l.text || '').replace(/\s/g, '');
      return t.length >= 3 && l.confidence < 70;
    }).length;
    /* With one line there is nothing to compare against: only a very low
       line counts. */
    if (lines.length === 1) return bad > 0 && lines[0].confidence < 50;
    return bad > 0 && (sure > 0 || bad === lines.length);
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
    packLabel: function (p) {
      return String(p || '').split('+').map(function (x) { return PACKS[x] ? PACKS[x].en : x; }).join(' + ');
    },
    packToLang: function (p) {
      var first = String(p || '').split('+')[0];
      return PACKS[first] ? PACKS[first].code : 'en';
    },
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
      /* In automatic mode the three common scripts are always tried, plus the
         one that worked last time if it was something else. Capping at three
         used to let a remembered Telugu crowd Hindi out entirely. */
      var maxTries = opts.maxTries || (auto ? Math.max(3, queue.length) : asked.length + 2);
      queue = queue.slice(0, maxTries);
      /* A deliberate single try (tests, or a reader who chose one) is
         honoured exactly, with no second passes. */
      var rescue = !opts.maxTries;

      return loadTesseract().then(function (Tesseract) {
        return prepare(file).then(function (prepared) {
          var tried = [], best = null, i = 0;
          var singles = [];

          function label(pack, n) {
            return queue.length > 1
              ? 'Reading as ' + api.packLabel(pack) + ' (' + n + ' of ' + queue.length + ')…'
              : null;
          }

          function attempt(src, pack, how, msg) {
            return recognise(Tesseract, src, pack, function (st, pct) {
              if (onProgress) onProgress(msg || st, pct);
            }).then(function (r) {
              r.score = plausibility(r);
              r.how = how;
              tried.push({ pack: pack, how: how, lang: r.lang, confidence: r.confidence, score: r.score });
              if (!best || r.score > best.score) best = r;
              return r;
            }).catch(function (e) {
              tried.push({ pack: pack, how: how, error: e.message });
              return null;
            });
          }

          function next() {
            if (i >= queue.length) return Promise.resolve(best);
            var pack = queue[i++];
            return attempt(prepared.src, pack, 'plain', label(pack, i)).then(function (r) {
              if (r) singles.push(r);
              /* Good enough that another pack cannot reasonably beat it —
                 unless one of its lines is rubble, which means part of the
                 picture is in another script. */
              if (best && best.score >= TRUST && !hasRubble(best)) return best;
              return next();
            });
          }

          /* Nothing read cleanly. Three more ways in, in order of how often
             each one is the answer:
               1. Two scripts at once. A screenshot of a learning page, a
                  shop sign, a form — Tamil and English side by side is the
                  ordinary case here, and either pack alone reads half of it
                  as rubble.
               2. The same pack on the picture inverted, for light writing on
                  a dark ground.
               3. The same pack on a hard black-and-white version, for a dim
                  or grey photograph. */
          function settled() { return best && best.score >= TRUST && !hasRubble(best); }

          function rescuePasses() {
            if (!rescue || !best || settled()) return Promise.resolve(best);
            var ranked = singles.slice().sort(function (a, b) { return b.score - a.score; });
            var top = ranked[0] ? ranked[0].pack : best.pack;
            var second = ranked[1] ? ranked[1].pack : (top === 'eng' ? 'tam' : 'eng');
            var plan = [];
            if (top && second && top !== second && top.indexOf('+') < 0) {
              plan.push({ src: prepared.src, pack: top + '+' + second, how: 'mixed',
                          msg: 'Trying ' + api.packLabel(top) + ' and ' + api.packLabel(second) + ' together…' });
            }
            plan.push({ kind: prepared.dark ? 'invert' : 'binary', pack: top,
                        msg: prepared.dark ? 'Trying it as light text on a dark background…'
                                           : 'Sharpening the picture and trying again…' });
            plan.push({ kind: prepared.dark ? 'binary' : 'invert', pack: top,
                        msg: 'One more way of reading it…' });

            var k = 0;
            function step() {
              if (k >= plan.length || settled()) return Promise.resolve(best);
              var p = plan[k++];
              var src = p.src;
              if (!src) {
                try { src = variant(prepared, p.kind); } catch (e) { return step(); }
              }
              return attempt(src, p.pack, p.how || p.kind, p.msg).then(step);
            }
            return step();
          }

          return next().then(rescuePasses).then(function (r) {
            if (!r || !r.text) throw new Error('No writing was found in this picture. '
              + 'Try a sharper, straight-on photo with the text filling most of the frame.');
            /* A two-script reading has no one pack, so its language comes from
               the text itself. */
            var dom = dominantLang(r.text);
            if (r.pack && r.pack.indexOf('+') >= 0) r.lang = dom.lang;
            r.mixed = dom.mixed;
            if (r.score >= TRUST && r.pack.indexOf('+') < 0) rememberPack(r.pack);
            r.tried = tried;
            r.autoDetected = auto;
            r.preview = prepared.src;
            r.lowConfidence = r.score < TRUST;
            return r;
          });
        });
      });
    },

    /* For the view: is this a file the browser can likely decode? Some
       galleries and file managers hand over a picture with no type at all,
       so the name is checked too, and anything else is tried anyway. */
    looksLikeImage: function (f) {
      if (!f) return false;
      if (/^image\//.test(f.type || '')) return true;
      if (!f.type) return /\.(png|jpe?g|webp|gif|bmp|heic|heif|avif|tiff?)$/i.test(f.name || '') || true;
      return false;
    },

    dominantLang: dominantLang,

    available: function () { return typeof document !== 'undefined'; }
  };

  return api;
})();
