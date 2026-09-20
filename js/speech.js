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

  var LANGS = {
    ta: ['ta-IN', 'ta-LK', 'ta'],
    en: ['en-IN', 'en-GB', 'en-US', 'en'],
    hi: ['hi-IN', 'hi']
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
      var hit = voices.filter(function (v) { return (v.lang || '').toLowerCase().replace('_', '-') === tag; })[0];
      if (hit) return hit;
    }
    /* prefix match: "ta" matches "ta-IN" */
    var base = (LANGS[lang] ? LANGS[lang][0] : lang).split('-')[0].toLowerCase();
    return voices.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(base) === 0; })[0] || null;
  }

  function bcp47(lang) { return (LANGS[lang] && LANGS[lang][0]) || lang; }

  var api = {
    supported: function () { return 'speechSynthesis' in window; },
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

    /* True when the OS has no voice at all for this language. */
    missing: function (lang) { return voices.length > 0 && !pickVoice(lang); },

    /* Speak one phrase. Resolves when finished (or immediately if unsupported). */
    speak: function (text, lang, opts) {
      opts = opts || {};
      if (!api.supported() || !text) return Promise.resolve(false);
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

    /* Speak a scripted sequence: [{text, lang, pause, before}] — the lesson voice. */
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
          pitch: opts.pitch,
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
