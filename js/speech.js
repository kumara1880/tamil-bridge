/* Tamil Bridge — voice.
   Uses the browser's built-in Web Speech API: speechSynthesis for the AI teaching
   voice and SpeechRecognition for pronunciation checking. Both are free and need
   no key. Voice availability differs by OS/browser, so every call degrades safely. */
window.TB = window.TB || {};

TB.Speech = (function () {
  var voices = [];
  var ready = false;
  var listeners = [];
  var queueToken = 0;

  /* Preferred BCP-47 tags per language, most specific first. A bare code like
     "te" rarely matches an installed voice — the voice is registered as
     "te-IN" — so every language the app can translate into gets its region.
     The three study languages lead with the accent a learner in India should
     be hearing. */
  var LANGS = {
    ta: ['ta-IN', 'ta-LK', 'ta'],
    en: ['en-IN', 'en-GB', 'en-US', 'en'],
    hi: ['hi-IN', 'hi'],

    /* other Indian languages */
    te: ['te-IN', 'te'], kn: ['kn-IN', 'kn'], ml: ['ml-IN', 'ml'],
    mr: ['mr-IN', 'mr'], bn: ['bn-IN', 'bn-BD', 'bn'], gu: ['gu-IN', 'gu'],
    pa: ['pa-IN', 'pa-Guru-IN', 'pa'], or: ['or-IN', 'or'], as: ['as-IN', 'as'],
    ur: ['ur-IN', 'ur-PK', 'ur'], sa: ['sa-IN', 'hi-IN'], ne: ['ne-NP', 'ne'],
    si: ['si-LK', 'si'], sd: ['sd-PK', 'sd'],

    /* the rest, by region */
    ar: ['ar-SA', 'ar-EG', 'ar'], fa: ['fa-IR', 'fa'], he: ['he-IL', 'he'],
    tr: ['tr-TR', 'tr'], ru: ['ru-RU', 'ru'], uk: ['uk-UA', 'uk'],
    pl: ['pl-PL', 'pl'], de: ['de-DE', 'de-AT', 'de'], fr: ['fr-FR', 'fr-CA', 'fr'],
    es: ['es-ES', 'es-MX', 'es-US', 'es'], pt: ['pt-BR', 'pt-PT', 'pt'],
    it: ['it-IT', 'it'], nl: ['nl-NL', 'nl-BE', 'nl'], sv: ['sv-SE', 'sv'],
    no: ['nb-NO', 'no-NO', 'no'], da: ['da-DK', 'da'], fi: ['fi-FI', 'fi'],
    el: ['el-GR', 'el'], cs: ['cs-CZ', 'cs'], ro: ['ro-RO', 'ro'],
    hu: ['hu-HU', 'hu'], bg: ['bg-BG', 'bg'], sr: ['sr-RS', 'sr'],
    hr: ['hr-HR', 'hr'], sk: ['sk-SK', 'sk'], sl: ['sl-SI', 'sl'],
    lt: ['lt-LT', 'lt'], lv: ['lv-LV', 'lv'], et: ['et-EE', 'et'],
    'zh-CN': ['zh-CN', 'zh-Hans-CN', 'zh'], 'zh-TW': ['zh-TW', 'zh-Hant-TW', 'zh'],
    ja: ['ja-JP', 'ja'], ko: ['ko-KR', 'ko'], th: ['th-TH', 'th'],
    vi: ['vi-VN', 'vi'], id: ['id-ID', 'id'], ms: ['ms-MY', 'ms'],
    fil: ['fil-PH', 'tl-PH', 'fil'], my: ['my-MM', 'my'], km: ['km-KH', 'km'],
    lo: ['lo-LA', 'lo'], sw: ['sw-KE', 'sw-TZ', 'sw'], am: ['am-ET', 'am'],
    af: ['af-ZA', 'af'], sq: ['sq-AL', 'sq'], hy: ['hy-AM', 'hy'],
    az: ['az-AZ', 'az'], eu: ['eu-ES', 'eu'], be: ['be-BY', 'be'],
    ca: ['ca-ES', 'ca'], gl: ['gl-ES', 'gl'], ka: ['ka-GE', 'ka'],
    is: ['is-IS', 'is'], ga: ['ga-IE', 'ga'], cy: ['cy-GB', 'cy'],
    kk: ['kk-KZ', 'kk'], ky: ['ky-KG', 'ky'], mk: ['mk-MK', 'mk'],
    mt: ['mt-MT', 'mt'], mn: ['mn-MN', 'mn'], ps: ['ps-AF', 'ps'],
    gd: ['gd-GB', 'gd'], so: ['so-SO', 'so'], tg: ['tg-TJ', 'tg'],
    tt: ['tt-RU', 'tt'], tk: ['tk-TM', 'tk'], uz: ['uz-UZ', 'uz'],
    zu: ['zu-ZA', 'zu'], xh: ['xh-ZA', 'xh'], yo: ['yo-NG', 'yo'],
    ig: ['ig-NG', 'ig'], ha: ['ha-NG', 'ha'], ny: ['ny-MW', 'ny'],
    st: ['st-ZA', 'st'], sn: ['sn-ZW', 'sn'], mg: ['mg-MG', 'mg'],
    mi: ['mi-NZ', 'mi'], sm: ['sm-WS', 'sm'], haw: ['haw-US', 'haw'],
    ht: ['ht-HT', 'ht'], jw: ['jv-ID', 'jw'], su: ['su-ID', 'su'],
    ceb: ['ceb-PH', 'ceb'], la: ['la', 'it-IT'], eo: ['eo'],
    lb: ['lb-LU', 'lb'], fy: ['fy-NL', 'fy'], co: ['co-FR', 'it-IT'],
    ku: ['ku-TR', 'ku'], yi: ['yi', 'he-IL']
  };

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var v = window.speechSynthesis.getVoices() || [];
    if (v.length) {
      voices = v;
      ready = true;
      listeners.splice(0).forEach(function (fn) { try { fn(voices); } catch (e) {} });
    }
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    /* Some browsers populate late and never fire the event. */
    setTimeout(loadVoices, 250);
    setTimeout(loadVoices, 1200);
  }

  function onReady(fn) {
    if (ready) fn(voices);
    else listeners.push(fn);
  }

  /* Rank voices so the most natural-sounding one wins.
     Network voices (Google, Microsoft "Natural"/"Online") are noticeably
     better than the compact offline ones, which matters a lot for Tamil and
     Hindi — a robotic voice teaches the wrong pronunciation. */
  function quality(v) {
    var n = (v.name || '').toLowerCase();
    var score = 0;
    if (/natural|neural/.test(n)) score += 6;
    if (/google/.test(n)) score += 5;
    if (/online/.test(n)) score += 3;
    if (v.localService === false) score += 2;
    if (/compact|espeak/.test(n)) score -= 4;
    if (v.default) score += 1;
    return score;
  }

  function bestOf(list) {
    if (!list.length) return null;
    return list.slice().sort(function (a, b) { return quality(b) - quality(a); })[0];
  }

  /* Resolve a BCP-47 tag or short code to the best available voice. */
  function pickVoice(lang, preferredName) {
    if (!voices.length) return null;
    if (preferredName) {
      var exact = voices.filter(function (v) { return v.name === preferredName; })[0];
      if (exact) return exact;
    }
    var tags = LANGS[lang] || [lang];
    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i].toLowerCase();
      var hits = voices.filter(function (v) { return (v.lang || '').toLowerCase().replace('_', '-') === tag; });
      if (hits.length) return bestOf(hits);
    }
    /* prefix match: "ta" matches "ta-IN" */
    var base = (LANGS[lang] ? LANGS[lang][0] : lang).split('-')[0].toLowerCase();
    return bestOf(voices.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(base) === 0; }));
  }

  function bcp47(lang) { return (LANGS[lang] && LANGS[lang][0]) || lang; }

  /* ------------------------------------------------------------ network

     A voice for a language the device has never heard of.

     The endpoint is the one Google Translate's own speaker button uses. It
     takes about two hundred characters at a time, so a long line is cut at
     word boundaries and the pieces are played one after another. Nothing is
     fetched — an <audio> element loads it directly, which needs no
     permission from the other end.                                        */
  var netAudio = null;

  function netChunks(text, limit) {
    var words = String(text).split(/(\s+)/);
    var out = [], buf = '';
    words.forEach(function (w) {
      if ((buf + w).length > limit && buf.trim()) { out.push(buf.trim()); buf = w; }
      else buf += w;
    });
    if (buf.trim()) out.push(buf.trim());
    return out.length ? out : [String(text)];
  }

  function netUrl(piece, lang, slow, idx, total, textlen) {
    return 'https://translate.google.com/translate_tts'
      + '?ie=UTF-8&client=tw-ob'
      + '&tl=' + encodeURIComponent(bcp47(lang).split('-')[0])
      + '&ttsspeed=' + (slow ? '0.24' : '1')
      + '&total=' + total + '&idx=' + idx + '&textlen=' + textlen
      + '&q=' + encodeURIComponent(piece);
  }

  function netPlay(url) {
    return new Promise(function (resolve) {
      var a = new Audio();
      netAudio = a;
      var done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        clearTimeout(guard);
        if (netAudio === a) netAudio = null;
        resolve(ok);
      }
      a.onended = function () { finish(true); };
      a.onerror = function () { finish(false); };
      /* If the network is slow or absent this never fires an event at all. */
      var guard = setTimeout(function () { try { a.pause(); } catch (e) {} finish(false); }, 20000);
      a.src = url;
      var p = a.play();
      if (p && p.catch) p.catch(function () { finish(false); });
    });
  }

  function netSpeak(text, lang, opts) {
    if (typeof Audio === 'undefined') return Promise.resolve(false);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
    var t = String(text || '').trim();
    if (!t) return Promise.resolve(false);

    var slow = (opts && opts.rate != null) ? opts.rate < 0.8 : false;
    var pieces = netChunks(t, 190);
    var token = queueToken;
    var i = 0, anyPlayed = false;

    function next() {
      if (token !== queueToken) return Promise.resolve(anyPlayed);
      if (i >= pieces.length) return Promise.resolve(anyPlayed);
      var idx = i++;
      return netPlay(netUrl(pieces[idx], lang, slow, idx, pieces.length, t.length))
        .then(function (ok) {
          if (ok) anyPlayed = true;
          /* The first piece failing means the whole thing is unavailable;
             a later one failing has at least said something. */
          if (!ok && idx === 0) return false;
          return next();
        });
    }
    return next();
  }


  /* exposed so the test suite can confirm every translate language is covered */
  function langTags() { return LANGS; }

  var api = {
    supported: function () { return 'speechSynthesis' in window; },
    /* exposed so the suite can check the chunking and the address */
    netChunks: netChunks,
    netUrl: netUrl,
    recognitionSupported: function () {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },
    voices: function () { return voices.slice(); },
    voicesFor: function (lang) {
      var base = (LANGS[lang] ? LANGS[lang][0] : lang).split('-')[0].toLowerCase();
      return voices.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(base) === 0; });
    },
    onReady: onReady,
    pickVoice: pickVoice,
    langTags: langTags,
    bcp47: bcp47,

    /* True when the OS has no voice at all for this language. It does not
       mean the language cannot be spoken: when there is no local voice the
       network one is used, which is why nothing calls this to decide
       whether to speak \u2014 only to explain what will happen. */
    missing: function (lang) { return voices.length > 0 && !pickVoice(lang); },

    /* What this language will actually be read with. */
    voiceSource: function (lang) {
      if (!api.supported()) return 'none';
      if (pickVoice(lang)) return 'device';
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'none';
      return 'online';
    },

    /* Speak one phrase. Resolves when finished (or immediately if unsupported). */
    speak: function (text, lang, opts) {
      opts = opts || {};
      if (!api.supported() || !text) return Promise.resolve(false);
      /* Reading Hindi aloud in an English voice produces nonsense and teaches
         the wrong pronunciation, so refuse rather than substitute. The caller
         surfaces missingVoiceMessage(lang). */
      /* No voice on the device: ask the network before telling somebody
         their machine cannot do it. */
      if (api.missing(lang) && !opts.force) {
        queueToken++;
        try { window.speechSynthesis.cancel(); } catch (e) {}
        return netSpeak(text, lang, opts).then(function (ok) {
          return ok ? true : { noVoice: true, lang: lang };
        });
      }
      var myToken = ++queueToken;
      try { window.speechSynthesis.cancel(); } catch (e) {}

      return new Promise(function (resolve) {
        var u = new SpeechSynthesisUtterance(String(text));
        var v = pickVoice(lang, opts.voiceName);
        if (v) u.voice = v;
        u.lang = v ? v.lang : bcp47(lang);
        u.rate = opts.rate != null ? opts.rate : 0.85;
        u.pitch = opts.pitch != null ? opts.pitch : 1;
        u.volume = opts.volume != null ? opts.volume : 1;

        var done = false;
        function finish(ok) {
          if (done) return;
          done = true;
          clearTimeout(guard);
          resolve(ok);
        }
        u.onend = function () { finish(true); };
        u.onerror = function () { finish(false); };

        /* Chrome silently drops long utterances; guard with a generous timeout. */
        var guard = setTimeout(function () { finish(false); },
          Math.max(6000, String(text).length * 140));

        if (myToken !== queueToken) return finish(false);
        try { window.speechSynthesis.speak(u); } catch (e) { finish(false); }
      });
    },

    /* Speak a scripted sequence: [{text, lang, rate, pitch, pause}] — the lesson
       voice, and the sing-song one. Per-step pitch is what makes a rhyme rise
       and fall instead of reciting on one note. */
    sequence: function (steps, opts) {
      opts = opts || {};
      var i = 0;
      var cancelled = false;
      var token = ++queueToken;

      function step() {
        if (cancelled || token !== queueToken || i >= steps.length) {
          return Promise.resolve(!cancelled);
        }
        var s = steps[i++];
        if (opts.onStep) { try { opts.onStep(s, i - 1); } catch (e) {} }
        queueToken = token - 1;            /* let speak() take the next token */
        return api.speak(s.text, s.lang, {
          rate: s.rate != null ? s.rate : opts.rate,
          pitch: s.pitch != null ? s.pitch : opts.pitch,
          volume: s.volume != null ? s.volume : opts.volume,
          voiceName: opts.voiceNames ? opts.voiceNames[s.lang] : null
        }).then(function () {
          token = queueToken;
          if (cancelled) return false;
          var pause = s.pause != null ? s.pause : (opts.pause || 300);
          return new Promise(function (r) { setTimeout(r, pause); }).then(step);
        });
      }

      var p = step();
      p.cancel = function () { cancelled = true; api.stop(); };
      return p;
    },

    stop: function () {
      queueToken++;
      if (api.supported()) { try { window.speechSynthesis.cancel(); } catch (e) {} }
      /* and whatever is coming over the network */
      if (netAudio) { try { netAudio.pause(); netAudio.src = ''; } catch (e) {} netAudio = null; }
    },
    pause: function () { if (api.supported()) { try { window.speechSynthesis.pause(); } catch (e) {} } },
    resume: function () { if (api.supported()) { try { window.speechSynthesis.resume(); } catch (e) {} } },

    /* ---------------- speech recognition (pronunciation practice) ---------- */
    listen: function (lang, opts) {
      opts = opts || {};
      var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Rec) {
        return Promise.reject(new Error('This browser has no speech recognition. Please use Chrome or Edge.'));
      }
      return new Promise(function (resolve, reject) {
        var r = new Rec();
        r.lang = bcp47(lang);
        r.interimResults = true;
        r.maxAlternatives = 3;
        r.continuous = false;

        var finalText = '';
        var alts = [];
        var settled = false;

        r.onresult = function (ev) {
          var interim = '';
          for (var i = ev.resultIndex; i < ev.results.length; i++) {
            var res = ev.results[i];
            if (res.isFinal) {
              finalText += res[0].transcript;
              for (var j = 0; j < res.length; j++) alts.push(res[j].transcript);
            } else {
              interim += res[0].transcript;
            }
          }
          if (opts.onInterim) { try { opts.onInterim(finalText + interim); } catch (e) {} }
        };
        r.onerror = function (ev) {
          if (settled) return;
          settled = true;
          var msg = {
            'no-speech': 'No speech detected. Please try again.',
            'not-allowed': 'Microphone access was denied. Allow it in your browser settings.',
            'service-not-allowed': 'Speech service unavailable. Check your internet connection.',
            'audio-capture': 'No microphone found.',
            'network': 'Speech recognition needs an internet connection.'
          }[ev.error] || ('Error: ' + ev.error);
          reject(new Error(msg));
        };
        r.onend = function () {
          if (settled) return;
          settled = true;
          resolve({ text: finalText.trim(), alternatives: alts });
        };

        try { r.start(); } catch (e) { settled = true; reject(e); }
        if (opts.onStart) { try { opts.onStart(r); } catch (e) {} }
        /* Safety stop so the mic never stays open. */
        setTimeout(function () { try { r.stop(); } catch (e) {} }, opts.maxMs || 8000);
      });
    },

    /* ---------------- pronunciation scoring ---------------- */
    normalise: function (s) {
      return String(s || '')
        .toLowerCase()
        .replace(/[.,!?;:'"()‘’“”।]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    },

    levenshtein: function (a, b) {
      a = String(a); b = String(b);
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      var prev = new Array(b.length + 1), cur = new Array(b.length + 1), i, j;
      for (j = 0; j <= b.length; j++) prev[j] = j;
      for (i = 1; i <= a.length; i++) {
        cur[0] = i;
        for (j = 1; j <= b.length; j++) {
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        }
        var t = prev; prev = cur; cur = t;
      }
      return prev[b.length];
    },

    /* Returns { score 0..100, perWord:[{word, ok, heard}], best } */
    score: function (target, result) {
      var heardList = [result.text].concat(result.alternatives || []).filter(Boolean);
      var tNorm = api.normalise(target);
      var best = { score: 0, heard: result.text || '' };

      heardList.forEach(function (h) {
        var hNorm = api.normalise(h);
        var dist = api.levenshtein(tNorm, hNorm);
        var sc = Math.max(0, Math.round((1 - dist / Math.max(tNorm.length, 1)) * 100));
        if (sc > best.score) best = { score: sc, heard: h };
      });

      var tWords = tNorm.split(' ').filter(Boolean);
      var hWords = api.normalise(best.heard).split(' ').filter(Boolean);
      var perWord = tWords.map(function (w) {
        var hit = hWords.some(function (h) {
          return h === w || api.levenshtein(w, h) <= Math.max(1, Math.floor(w.length / 4));
        });
        return { word: w, ok: hit };
      });

      return { score: best.score, heard: best.heard, perWord: perWord };
    },

    /* A plain explanation when the OS has no voice for a language, with the
       exact steps to install one. Reading aloud in the wrong voice would
       teach the wrong pronunciation, so we say so rather than fake it. */
    missingVoiceMessage: function (lang) {
      var name = (window.TB && TB.Translate && TB.Translate.langName)
        ? TB.Translate.langName(lang) : lang;
      return 'This device has no ' + name + ' voice, and the online one could not be '
           + 'reached either \u2014 check your connection. To have ' + name + ' read aloud '
           + 'without a connection, install the voice: Windows: Settings \u2192 Time & '
           + 'language \u2192 Language & region \u2192 Add a language \u2192 ' + name + ', and tick '
           + '"Speech". Android and iPhone: add the ' + name + ' voice in your '
           + 'text-to-speech settings.';
    },

    /* Tamil feedback text for a score. */
    feedback: function (score) {
      if (score >= 90) return { ta: 'Excellent — that pronunciation is spot on.', tone: 'great' };
      if (score >= 75) return { ta: 'Good — very close. Try once more.', tone: 'good' };
      if (score >= 50) return { ta: 'Not bad. Say the words marked in red more slowly.', tone: 'ok' };
      return { ta: 'Try again. Listen to the audio first, then copy it.', tone: 'retry' };
    }
  };

  return api;
})();
