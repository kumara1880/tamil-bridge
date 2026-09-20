/* Tamil Bridge — remaining views: lessons, practice, photo, pronunciation,
   alphabet, phonics, vocabulary, history and settings.                       */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speak, tappable = V.tappable, ago = V.ago;
  var speakBtn = V.speakBtn, hiRead = V.hiRead, readAid = V.readAid;
  var themeName = V.themeName, langLabel = V.langLabel, D = V.D, saveD = V.saveD;

  /* =============================================================== LEARN */
  V.learn = {
    title: 'Lessons', sub: 'Step by step, English & Hindi',
    html: function (param) {
      var d = D();
      if (param) {
        var u = TB.LESSONS.filter(function (x) { return x.id === param; })[0];
        if (u) return lessonHtml(u, d);
      }
      var h = '<div class="view"><div class="grid g2">';
      TB.LESSONS.forEach(function (u, i) {
        var p = d.progress[u.id] || {};
        h += '<a class="card" href="#/learn/' + u.id + '" style="text-decoration:none;color:inherit;display:block">'
          + '<div class="row" style="margin-bottom:6px"><span class="chip">' + (i + 1) + '</span>'
          + (p.done ? '<span class="chip green">✓ Done' + (p.score != null ? ' · ' + p.score + '%' : '') + '</span>' : '')
          + '</div>'
          + '<h3>' + esc(u.title.en) + '</h3>'
          + '<div class="card-sub ta">' + esc(u.title.ta) + '</div>'
          + '<div class="small muted">' + esc(u.goal) + '</div>'
          + '<div class="tiny muted mt">' + u.lines.length + ' sentences · ' + u.quiz.length + ' questions</div>'
          + '</a>';
      });
      return h + '</div></div>';
    },
    mount: function (root, param) {
      if (!param) return;
      var u = TB.LESSONS.filter(function (x) { return x.id === param; })[0];
      if (!u) return;

      var playBtn = root.querySelector('#playAll');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          var d = D();
          var steps = [];
          steps.push({ text: u.title.ta + '. ' + u.goal, lang: 'ta', pause: 500 });
          u.lines.forEach(function (l) {
            steps.push({ text: l.ta, lang: 'ta', pause: 280 });
            steps.push({ text: l.en, lang: 'en', rate: 0.68, pause: 280 });
            steps.push({ text: l.hi, lang: 'hi', rate: 0.72, pause: 480 });
          });
          var btn = this;
          btn.textContent = '⏹ Stop';
          var run = TB.Speech.sequence(steps, { rate: d.prefs.rate, pitch: d.prefs.pitch });
          btn.onclick = function () { run.cancel(); done(); };
          run.then(done);
          function done() { btn.textContent = '🔊 Play the whole lesson'; btn.onclick = null; TB.App.render(); }
        });
      }

      /* quiz */
      var answers = {};
      root.querySelectorAll('[data-q]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var qi = +btn.getAttribute('data-q'), oi = +btn.getAttribute('data-o');
          if (answers[qi] != null) return;
          answers[qi] = oi;
          var q = u.quiz[qi];
          var correct = oi === q.a;
          root.querySelectorAll('[data-q="' + qi + '"]').forEach(function (b) {
            var bo = +b.getAttribute('data-o');
            if (bo === q.a) b.classList.add('chip', 'green');
            else if (bo === oi) b.classList.add('chip', 'red');
            b.disabled = true;
          });
          var why = root.querySelector('#why' + qi);
          if (why) {
            why.style.display = '';
            why.innerHTML = (correct ? '✓ Correct. ' : '✗ Not quite. ') + esc(q.why);
            why.className = 'explain ' + (correct ? 'tip' : 'warn');
          }
          if (Object.keys(answers).length === u.quiz.length) finish();
        });
      });

      function finish() {
        var right = 0;
        u.quiz.forEach(function (q, i) { if (answers[i] === q.a) right++; });
        var score = Math.round((right / u.quiz.length) * 100);
        var d = D();
        var first = !(d.progress[u.id] && d.progress[u.id].done);
        d.progress[u.id] = { done: true, score: score, ts: Date.now() };
        if (first) d.stats.xp = (d.stats.xp || 0) + 20;
        saveD(d);
        TB.Store.touchStreak(TB.Auth.userId());
        TB.App.refreshChips();
        var box = root.querySelector('#quizResult');
        if (box) {
          box.style.display = '';
          box.className = 'msg ' + (score >= 70 ? 'msg-ok' : 'msg-warn');
          box.textContent = 'Score: ' + score + '% (' + right + '/' + u.quiz.length + ')'
            + (first ? ' · +20 XP' : '');
        }
      }
    }
  };

  function lessonHtml(u, d) {
    var h = '<div class="view">';
    h += '<div class="card"><div class="card-head"><div>'
       + '<h3 style="font-size:19px">' + esc(u.title.en) + '</h3>'
       + '<div class="card-sub ta">' + esc(u.title.ta) + '</div></div>'
       + '<div class="spacer"></div><a class="btn btn-sm" href="#/learn">← All lessons</a></div>'
       + '<p class="small">' + esc(u.goal) + '</p>'
       + '<div class="explain">' + u.grammar.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</div>'
       + '<button class="btn btn-primary mt" id="playAll" type="button">🔊 Play the whole lesson</button>'
       + '</div>';

    h += '<div class="card"><h3>Sentences</h3><div class="card-sub">Listen to each one, then say it</div>';
    u.lines.forEach(function (l, i) {
      h += '<div style="padding:12px 0;border-top:1px solid var(--line-soft)">';
      h += '<div style="font-size:18px;font-weight:600">' + tappable(l.en, 'en') + speak(l.en, 'en') + '</div>';
      h += '<div class="hi" style="font-size:17px;margin-top:3px">' + tappable(l.hi, 'hi') + speak(l.hi, 'hi') + '</div>';
      h += V.hiRead(l.hi);
      h += '<div class="w-gloss" style="margin-top:4px">' + tappable(l.ta, 'ta') + speak(l.ta, 'ta') + '</div>';
      if (l.gloss && l.gloss.length) {
        h += '<div class="tok-line" style="margin:8px 0 0">';
        l.gloss.forEach(function (g) {
          /* gloss = [tamil, english, hindi]. English leads, Hindi follows with
             its romanisation so it can actually be read, and Tamil sits last
             as the small reading aid. */
          var hiRoman = /[ऀ-ॿ]/.test(g[2]) ? TB.Translit.romanHindi(g[2]) : '';
          h += '<div class="tok">'
             + '<div class="t-w">' + esc(g[1]) + '</div>'
             + '<div class="t-m hi">' + esc(g[2]) + '</div>'
             + (hiRoman ? '<div class="t-r">' + esc(hiRoman) + '</div>' : '')
             + '<div class="t-p ta">' + esc(g[0]) + '</div>'
             + '</div>';
        });
        h += '</div>';
      }
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="card"><h3>Quick quiz</h3><div class="card-sub">' + u.quiz.length + ' questions · +20 XP</div>';
    u.quiz.forEach(function (q, qi) {
      h += '<div style="padding:12px 0;border-top:1px solid var(--line-soft)">';
      h += '<div style="font-weight:600;margin-bottom:8px">' + (qi + 1) + '. ' + esc(q.q) + '</div><div class="pill-row">';
      q.opts.forEach(function (o, oi) {
        h += '<button class="pill" data-q="' + qi + '" data-o="' + oi + '" type="button">' + esc(o) + '</button>';
      });
      h += '</div><div id="why' + qi + '" class="explain tip" style="display:none"></div></div>';
    });
    h += '<div id="quizResult" class="msg" style="display:none"></div></div>';

    return h + '</div>';
  }

  /* ============================================================ PRACTICE */
  V.practice = {
    title: 'Practice', sub: 'Spaced repetition',
    html: function () {
      var d = D();
      var c = TB.SRS.counts(d.srs, TB.VOCAB);
      return '<div class="view">'
        + '<div class="grid g4 mb">'
        + '<div class="stat blue"><div class="n">' + c.due + '</div><div class="l">Due today</div></div>'
        + '<div class="stat green"><div class="n">' + c.learned + '</div><div class="l">Learned</div></div>'
        + '<div class="stat"><div class="n">' + c.fresh + '</div><div class="l">New</div></div>'
        + '<div class="stat accent"><div class="n">' + c.total + '</div><div class="l">Total</div></div>'
        + '</div>'
        + '<div class="card"><div class="row">'
        +   '<span class="small muted">Prompt language:</span>'
        +   '<div class="pill-row" id="dirPills">'
        +     '<button class="pill on" data-dir="en2hi" type="button">English → Hindi</button>'
        +     '<button class="pill" data-dir="hi2en" type="button">Hindi → English</button>'
        +     '<button class="pill" data-dir="en2ta" type="button">English → Tamil</button>'
        +     '<button class="pill" data-dir="ta2en" type="button">Tamil → English</button>'
        +     '<button class="pill" data-dir="ta2hi" type="button">Tamil → Hindi</button>'
        +     '<button class="pill" data-dir="hi2ta" type="button">Hindi → Tamil</button>'
        +   '</div></div></div>'
        + '<div id="pArea"></div></div>';
    },
    mount: function (root) {
      var dir = 'en2hi';
      var queue = [], idx = 0, shown = false, correct = 0;

      function start() {
        var d = D();
        queue = TB.SRS.queue(d.srs, TB.VOCAB, 20);
        idx = 0; correct = 0; shown = false;
        draw();
      }

      function draw() {
        var area = root.querySelector('#pArea');
        if (!queue.length) {
          area.innerHTML = '<div class="empty"><div class="big">🎉</div>All done for today!<br>'
            + '<span class="small">Come back tomorrow.</span></div>';
          return;
        }
        if (idx >= queue.length) {
          area.innerHTML = '<div class="card center"><div style="font-size:34px">✅</div>'
            + '<h3>Round complete</h3><div class="muted">' + correct + '/' + queue.length + ' correct</div>'
            + '<button class="btn btn-primary mt" id="again" type="button">Again</button></div>';
          area.querySelector('#again').addEventListener('click', start);
          return;
        }

        var w = queue[idx];
        var pair = {
          en2hi: ['en', 'hi'], hi2en: ['hi', 'en'],
          ta2en: ['ta', 'en'], en2ta: ['en', 'ta'],
          ta2hi: ['ta', 'hi'], hi2ta: ['hi', 'ta']
        }[dir];
        var qLang = pair[0], aLang = pair[1];
        var q = w[qLang], a = w[aLang];

        area.innerHTML = ''
          + '<div class="bar mb"><i style="width:' + Math.round((idx / queue.length) * 100) + '%"></i></div>'
          + '<div class="flash">'
          +   '<div class="tiny muted">' + langLabel(qLang) + ' → ' + langLabel(aLang) + '</div>'
          +   '<div class="prompt ' + qLang + '">' + esc(q) + speak(q, qLang) + '</div>'
          +   (qLang === 'ta' ? '<div class="tiny muted"><i>' + esc(w.taR) + '</i></div>' : '')
          +   (qLang === 'hi' ? V.hiRead(w.hi, w.hiR, w.hiTa) : '')
          +   (qLang === 'en' && w.enIpa ? '<div class="tiny" style="color:var(--teal)">' + esc(w.enIpa) + '</div>' : '')
          +   (shown
              ? '<div class="answer ' + aLang + '">' + esc(a) + speak(a, aLang) + '</div>'
                + '<div class="tiny muted">' + esc(aLang === 'ta' ? w.taR : (aLang === 'hi' ? w.hiR + ' · ' + (w.hiTa || '') : (w.enIpa || '') + ' · ' + (w.enTa || ''))) + '</div>'
                + (w.tip ? '<div class="explain tip" style="text-align:left">' + esc(w.tip) + '</div>' : '')
              : '<div style="height:40px"></div>')
          + '</div>'
          + (shown
              ? '<div class="rate-row">'
                + '<button class="btn" data-r="0" type="button">😕 Forgot</button>'
                + '<button class="btn" data-r="1" type="button">😐 Hard</button>'
                + '<button class="btn" data-r="2" type="button">🙂 Good</button>'
                + '<button class="btn btn-primary" data-r="3" type="button">😃 Easy</button></div>'
              : '<button class="btn btn-primary btn-wide mt" id="reveal" type="button">Show answer (Space)</button>')
          + '<div class="tiny muted center mt">' + (idx + 1) + ' / ' + queue.length + '</div>';

        var rv = area.querySelector('#reveal');
        if (rv) rv.addEventListener('click', reveal);
        area.querySelectorAll('[data-r]').forEach(function (b) {
          b.addEventListener('click', function () { rate(+b.getAttribute('data-r')); });
        });

        var d2 = D();
        if (d2.prefs.autoSpeak) TB.Speech.speak(q, qLang, { rate: d2.prefs.rate, pitch: d2.prefs.pitch });
      }

      function reveal() { shown = true; draw(); }

      function rate(quality) {
        var w = queue[idx];
        var d = D();
        d.srs[w.id] = TB.SRS.rate(d.srs[w.id], quality);
        if (quality >= 2) { correct++; d.stats.xp = (d.stats.xp || 0) + 2; }
        d.stats.practiced = (d.stats.practiced || 0) + 1;
        saveD(d);
        TB.Store.touchStreak(TB.Auth.userId());
        TB.App.refreshChips();
        if (quality === 0) queue.push(w);      /* see it again this session */
        idx++; shown = false;
        draw();
      }

      root.querySelectorAll('[data-dir]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-dir]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          dir = b.getAttribute('data-dir');
          start();
        });
      });

      V.practiceKey = function (e) {
        if (e.code === 'Space') { e.preventDefault(); if (!shown) reveal(); }
        else if (shown && /^Digit[1-4]$/.test(e.code)) rate(+e.code.slice(5) - 1);
      };
      start();
    }
  };

  /* =============================================================== PHOTO */
  V.photo = {
    title: 'Photo Translate', sub: 'Reads text from a photo, reads it aloud, and translates it',
    html: function () {
      var packs = Object.keys(TB.OCR.PACKS).map(function (p) {
        return '<option value="' + p + '">' + esc(TB.OCR.PACKS[p].en) + ' — ' + esc(TB.OCR.PACKS[p].ta) + '</option>';
      }).join('');
      var targets = TB.Translate.LANGS.filter(function (l) { return l.c !== 'auto'; })
        .map(function (l) { return '<option value="' + l.c + '"' + (l.c === 'ta' ? ' selected' : '') + '>' + esc(l.n) + '</option>'; }).join('');

      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="grid g2 mb">'
        +     '<div class="field" style="margin:0"><label>Language in the photo</label>'
        +       '<select id="ocrLang"><option value="auto" selected>Detect automatically</option>' + packs + '</select>'
        +       '<div class="hint">Leave this on automatic unless it gets it wrong.</div></div>'
        +     '<div class="field" style="margin:0"><label>Translate into</label><select id="ocrTarget">' + targets + '</select>'
        +       '<div class="hint">Change this any time — the picture is not read again.</div></div>'
        +   '</div>'
        +   '<div class="drop" id="drop">'
        +     '<div style="font-size:34px">🖼️</div>'
        +     '<div style="font-weight:650;margin-top:6px">Choose a picture, or drop one here</div>'
        +     '<div class="tiny muted">JPG · PNG · WEBP</div>'
        +   '</div>'
        /* Two separate inputs. The gallery one must NOT carry `capture`: with
           it, a phone opens the camera and refuses to let you pick a picture
           you already have, so the only way to read a saved rhyme was to
           photograph the screen it was on — which is how a clean page of
           English came back as "¥ / IV 2 | 2 i oe". */
        +   '<input id="file" type="file" accept="image/*" style="display:none">'
        +   '<input id="cam" type="file" accept="image/*" capture="environment" style="display:none">'
        +   '<div class="row mt"><button class="btn btn-sm" id="pickBtn" type="button">🖼️ Choose a picture</button>'
        +     '<button class="btn btn-sm" id="camBtn" type="button">📷 Take a photo</button></div>'
        +   '<div id="ocrProg" style="display:none;margin-top:12px"><div class="bar"><i id="ocrBar" style="width:0"></i></div>'
        +     '<div class="tiny muted mt" id="ocrStat"></div></div>'
        + '</div>'
        + '<div id="ocrOut"></div>'
        + '<div class="tiny muted">Language files download the first time you use each one (needs internet). '
        + 'Engine: Tesseract.js — open source, free.</div>'
        + '</div>';
    },
    mount: function (root) {
      var drop = root.querySelector('#drop');
      var file = root.querySelector('#file'), cam = root.querySelector('#cam');
      var out = root.querySelector('#ocrOut');
      var lastFile = null, lastRes = null;

      drop.addEventListener('click', function () { file.click(); });
      root.querySelector('#pickBtn').addEventListener('click', function () { file.click(); });
      root.querySelector('#camBtn').addEventListener('click', function () { cam.click(); });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
      });
      drop.addEventListener('drop', function (e) {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
      });
      [file, cam].forEach(function (inp) {
        inp.addEventListener('change', function () { if (inp.files[0]) handle(inp.files[0]); });
      });

      /* Changing the target language re-translates what was already read.
         Reading the picture again would be slow and would change nothing. */
      root.querySelector('#ocrTarget').addEventListener('change', function () {
        if (lastRes) translateInto(lastRes, this.value);
      });

      function handle(f, forcePack) {
        if (!/^image\//.test(f.type)) { TB.App.toast('Images only.', 'err'); return; }
        lastFile = f;
        var chosen = forcePack || root.querySelector('#ocrLang').value;
        var packs = chosen === 'auto' ? [] : [chosen];
        var target = root.querySelector('#ocrTarget').value;

        var prog = root.querySelector('#ocrProg');
        prog.style.display = '';
        out.innerHTML = '';
        TB.Speech.stop();

        TB.OCR.read(f, packs, function (label, pct) {
          root.querySelector('#ocrBar').style.width = pct + '%';
          root.querySelector('#ocrStat').textContent = label + ' ' + pct + '%';
        }).then(function (res) {
          prog.style.display = 'none';
          if (!res.text) {
            out.innerHTML = '<div class="card"><div class="msg msg-warn">No text was found. '
              + 'Try a sharper, straight-on photo with the page filling the frame.</div></div>';
            return;
          }
          lastRes = res;
          render(res, target);
        }).catch(function (e) {
          prog.style.display = 'none';
          out.innerHTML = '<div class="card"><div class="msg msg-err">' + esc(e.message) + '</div></div>';
        });
      }

      /* ----------------------------------------------------------------
         One reader, used for the photo's own words and again for the
         translation. Whatever language the lines are in, they are read in
         that language's voice and can be chanted, slowed or spelled out.
         ---------------------------------------------------------------- */
      function readerHtml(id, lines, lang) {
        var modes = TB.Reader.modesFor(lines);
        return '<div class="row mb" data-modes="' + id + '">'
          + modes.list.map(function (m) {
              return '<button class="pill' + (m.id === modes.suggested ? ' on' : '') + '" data-mode="' + m.id
                   + '" title="' + esc(m.hint) + '" type="button">' + esc(m.label) + '</button>';
            }).join('')
          + '</div>'
          + '<div class="row mb"><button class="btn btn-primary btn-sm" data-play="' + id + '" type="button">▶ Play</button>'
          + '<span class="tiny muted" data-stat="' + id + '">'
          + esc(TB.Reader.MODES[modes.suggested].hint)
          + ' · ' + esc(TB.Translate.langName(lang)) + ' voice</span></div>'
          + (TB.Speech.missing(lang)
              ? '<div class="msg msg-warn tiny">' + esc(TB.Speech.missingVoiceMessage(lang)) + '</div>' : '');
      }

      function mountReader(id, lines, lang) {
        var modes = TB.Reader.modesFor(lines);
        var mode = modes.suggested;
        var reading = null;
        var playBtn = out.querySelector('[data-play="' + id + '"]');
        var statEl = out.querySelector('[data-stat="' + id + '"]');
        var modeBar = out.querySelector('[data-modes="' + id + '"]');
        if (!playBtn) return;

        function lineEls() { return out.querySelectorAll('[data-read="' + id + '"]'); }

        function stop() {
          if (reading) { reading.cancel(); reading = null; }
          lineEls().forEach(function (el) { el.classList.remove('now'); });
          playBtn.textContent = '▶ Play';
        }

        function play() {
          stop();
          if (TB.Speech.missing(lang)) {
            TB.App.toast(TB.Speech.missingVoiceMessage(lang), 'err');
            return;
          }
          var prefs = D().prefs;
          var steps = TB.Reader.plan(lines, lang, mode,
                                     { rate: prefs.rate || 0.9, pitch: prefs.pitch || 1 });
          if (!steps.length) return;
          playBtn.textContent = '⏹ Stop';

          /* which source line each step came from, so the right one lights up */
          var owner = [], cursor = 0;
          steps.forEach(function (s) {
            if (s.silent || !String(s.text).trim()) { owner.push(-1); return; }
            while (cursor < lines.length && String(lines[cursor]).trim() !== String(s.text).trim()) cursor++;
            owner.push(cursor < lines.length ? cursor : -1);
            if (cursor < lines.length && mode !== 'spell') cursor++;
          });

          reading = TB.Speech.sequence(steps, {
            rate: prefs.rate, pitch: prefs.pitch,
            voiceNames: { ta: prefs.voiceTa, en: prefs.voiceEn, hi: prefs.voiceHi },
            onStep: function (step, i) {
              var li = owner[i];
              lineEls().forEach(function (el) { el.classList.remove('now'); });
              if (li >= 0) {
                var el = out.querySelector('[data-read="' + id + '"][data-line="' + li + '"]');
                if (el) { el.classList.add('now'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
              }
            }
          });
          reading.then(stop);
        }

        modeBar.addEventListener('click', function (e) {
          var b = e.target.closest('[data-mode]');
          if (!b) return;
          stop();
          mode = b.getAttribute('data-mode');
          modeBar.querySelectorAll('.pill').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          statEl.textContent = TB.Reader.MODES[mode].hint + ' · ' + TB.Translate.langName(lang) + ' voice';
        });
        playBtn.addEventListener('click', function () { if (reading) stop(); else play(); });

        lineEls().forEach(function (el) {
          el.addEventListener('click', function (e) {
            if (e.target.closest('[data-word]')) return;   /* word tap wins */
            stop();
            var i = +el.getAttribute('data-line');
            el.classList.add('now');
            TB.Speech.speak(lines[i], lang, { rate: 0.7 })
              .then(function () { el.classList.remove('now'); });
          });
        });

        return { stop: stop };
      }

      /* ------------------------------------------------------ the result */
      function render(res, target) {
        var srcLang = res.lang;
        var raw = res.lines.map(function (l) { return l.text; });
        /* A poem's line breaks are the poem. A paragraph's are just where the
           page ran out, and translating those fragments gives fragments. */
        var flow = TB.Reader.reflow(raw);
        var lines = flow.units;
        res.units = lines;
        var modes = TB.Reader.modesFor(lines);
        var otherPacks = Object.keys(TB.OCR.PACKS).map(function (p) {
          return '<option value="' + p + '"' + (p === res.pack ? ' selected' : '') + '>'
               + esc(TB.OCR.PACKS[p].en) + '</option>';
        }).join('');

        out.innerHTML =
          /* A wrong language pack does not fail, it returns fluent nonsense at
             a low score. So the score is shown and acted on, rather than
             printed quietly next to the nonsense. */
          (res.lowConfidence
            ? '<div class="card"><div class="msg msg-warn"><b>This may not be right.</b> '
              + 'The text scored ' + res.score + ' out of 100' + (res.autoDetected
                ? ', and ' + esc(TB.OCR.packLabel(res.pack)) + ' was the best of '
                  + res.tried.length + ' languages tried.'
                : ' as ' + esc(TB.OCR.packLabel(res.pack)) + '.')
              + ' If the words below are nonsense, the picture is in another language — '
              + 'pick it here and it will read again.'
              + '<div class="row mt"><select id="ocrRetryLang" style="max-width:220px">' + otherPacks + '</select>'
              + '<button class="btn btn-sm" id="ocrRetry" type="button">Read again</button></div></div></div>'
            : '')

          + '<div class="card"><div class="card-head"><div><h3>Text found</h3>'
          + '<div class="card-sub">'
          + esc(TB.OCR.packLabel(res.pack)) + (res.autoDetected ? ' (detected)' : '')
          + ' · ' + res.lines.length + ' lines · score ' + res.score + '/100'
          + (modes.isVerse ? ' · read as a rhyme'
                           : (flow.reflowed ? ' · joined into ' + lines.length + ' sentences' : ''))
          + '</div></div><div class="spacer"></div>' + speakBtn(res.text, srcLang) + '</div>'
          + readerHtml('src', lines, srcLang)
          + '<div id="readBody">'
          + lines.map(function (l, i) {
              if (!l.trim()) return '<div style="height:10px"></div>';
              return '<div class="reader-line" data-read="src" data-line="' + i + '">'
                   + tappable(l, srcLang) + readAid(l, srcLang) + '</div>';
            }).join('')
          + '</div>'
          + '<div class="row mt"><button class="btn btn-sm" id="ocrCopy" type="button">Copy</button>'
          + '<button class="btn btn-sm" id="ocrTutor" type="button">🧠 Explain</button></div></div>'
          + '<div id="ocrTrCard"></div>';

        var retry = out.querySelector('#ocrRetry');
        if (retry) {
          retry.addEventListener('click', function () {
            if (lastFile) handle(lastFile, out.querySelector('#ocrRetryLang').value);
          });
        }
        mountReader('src', lines, srcLang);

        out.querySelector('#ocrCopy').addEventListener('click', function () {
          navigator.clipboard && navigator.clipboard.writeText(res.text);
          TB.App.toast('Copied', 'ok');
        });
        out.querySelector('#ocrTutor').addEventListener('click', function () {
          TB.App.pending = { text: lines[0] || res.text };
          location.hash = '#/tutor';
        });

        translateInto(res, target);
      }

      /* --------------------------------------------- into any language */
      function translateInto(res, target) {
        var card = out.querySelector('#ocrTrCard');
        if (!card) return;
        var srcLang = res.lang;
        var lines = res.units || res.lines.map(function (l) { return l.text; });
        var name = TB.Translate.langName(target);

        if (target === srcLang) {
          card.innerHTML = '<div class="card"><div class="tiny muted">The picture is already in '
            + esc(name) + '. Pick another language above to see the meaning.</div></div>';
          return;
        }

        card.innerHTML = '<div class="card"><div class="card-head"><div><h3>Meaning in ' + esc(name) + '</h3>'
          + '<div class="card-sub">Line by line, so a verse keeps its shape</div></div></div>'
          + '<div id="ocrTr"><span class="spin"></span> Translating into ' + esc(name) + '…</div></div>';

        TB.Translate.lines(lines, srcLang, target).then(function (tr) {
          var rows = tr.map(function (t, i) {
            if (!String(lines[i]).trim()) return '<div style="height:10px"></div>';
            return '<div class="tr-pair reader-line" data-read="tr" data-line="' + i + '">'
              + '<div class="tiny muted">' + esc(lines[i]) + '</div>'
              + '<div>' + tappable(t, target) + '</div>'
              /* however the target is written, say how to read it */
              + readAid(t, target)
              + '</div>';
          }).join('');
          var whole = tr.filter(function (x) { return x && String(x).trim(); }).join('\n');

          card.innerHTML = '<div class="card"><div class="card-head"><div><h3>Meaning in ' + esc(name) + '</h3>'
            + '<div class="card-sub">Line by line, so a verse keeps its shape</div></div>'
            + '<div class="spacer"></div>' + speakBtn(whole, target) + '</div>'
            /* the translation can be read aloud too, in its own language —
               this is what makes it any language to any */
            + readerHtml('tr', tr, target)
            + rows + '</div>';

          mountReader('tr', tr, target);

          TB.Store.addHistory(TB.Auth.userId(), {
            type: 'ocr', from: srcLang, to: target,
            src: res.text.slice(0, 400), out: whole.slice(0, 400)
          });
          TB.App.refreshChips();
        }).catch(function (e) {
          var box = out.querySelector('#ocrTr');
          if (box) box.innerHTML = '<span style="color:var(--red)">' + esc(e.message) + '</span>';
        });
      }
    }
  };

  /* =============================================================== SPEAK */
  V.speak = {
    title: 'Pronunciation practice', sub: 'Speak, and get a score',
    html: function () {
      var pool = TB.LESSONS.reduce(function (acc, u) { return acc.concat(u.lines); }, []);
      var w = TB.VOCAB[Math.floor(Math.random() * TB.VOCAB.length)];
      return '<div class="view">'
        + '<div class="card"><div class="row">'
        +   '<span class="small muted">Practise in:</span>'
        +   '<div class="pill-row" id="spLang">'
        +     '<button class="pill on" data-l="en" type="button">English</button>'
        +     '<button class="pill" data-l="hi" type="button">हिंदी</button>'
        +     '<button class="pill" data-l="ta" type="button">Tamil</button>'
        +   '</div><div class="spacer" style="flex:1"></div>'
        +   '<div class="pill-row" id="spMode">'
        +     '<button class="pill on" data-m="word" type="button">Word</button>'
        +     '<button class="pill" data-m="sentence" type="button">Sentence</button>'
        +   '</div></div></div>'
        + '<div id="spArea"></div>'
        + (TB.Speech.recognitionSupported() ? ''
           : '<div class="msg msg-warn">This browser has no speech recognition. Use Chrome or Edge to get a score. Listening still works here.</div>')
        + '</div>';
    },
    mount: function (root) {
      var lang = 'en', mode = 'word', target = '', hint = '';

      function pick() {
        if (mode === 'word') {
          var w = TB.VOCAB[Math.floor(Math.random() * TB.VOCAB.length)];
          target = w[lang];
          hint = lang === 'en' ? (w.enIpa || '') + '  ' + (w.enTa || '')
               : lang === 'hi' ? (w.hiR || '') + '  ' + (w.hiTa || '') : (w.taR || '');
          var other = lang === 'ta' ? w.en : w.ta;
          hint += '  ·  ' + other;
        } else {
          var lines = TB.LESSONS.reduce(function (a, u) { return a.concat(u.lines); }, []);
          var l = lines[Math.floor(Math.random() * lines.length)];
          target = l[lang];
          hint = lang === 'ta' ? l.en : l.ta;
        }
        draw();
      }

      function draw(result) {
        var area = root.querySelector('#spArea');
        area.innerHTML = '<div class="card center">'
          + '<div class="tiny muted">Say this</div>'
          + '<div class="' + lang + '" style="font-size:28px;font-weight:700;margin:8px 0">' + esc(target) + speak(target, lang) + '</div>'
          + '<div class="small muted mb">' + esc(hint) + '</div>'
          + '<button class="mic-btn" id="mic" type="button">🎤</button>'
          + '<div class="tiny muted mt" id="micHint">Tap the mic and speak</div>'
          + (result ? resultHtml(result) : '')
          + '<div class="row center mt" style="justify-content:center">'
          +   '<button class="btn btn-sm" id="slow" type="button">🐢 Hear it slowly</button>'
          +   '<button class="btn btn-sm" id="next" type="button">Next →</button>'
          + '</div></div>';

        area.querySelector('#mic').addEventListener('click', listen);
        area.querySelector('#next').addEventListener('click', pick);
        area.querySelector('#slow').addEventListener('click', function () {
          TB.Speech.speak(target, lang, { rate: 0.5 });
        });
      }

      function resultHtml(r) {
        var fb = TB.Speech.feedback(r.score);
        var words = r.perWord.map(function (p) {
          return '<span class="' + (p.ok ? 'w-ok' : 'w-bad') + '">' + esc(p.word) + '</span>';
        }).join(' ');
        return '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-soft)">'
          + '<div class="score-ring score-' + fb.tone + '">' + r.score + '%</div>'
          + '<div class="small">' + words + '</div>'
          + '<div class="tiny muted mt">Heard: “' + esc(r.heard || '—') + '”</div>'
          + '<div class="explain tip" style="text-align:left">' + esc(fb.ta) + '</div></div>';
      }

      function listen() {
        var mic = root.querySelector('#mic');
        var hintEl = root.querySelector('#micHint');
        mic.classList.add('live');
        hintEl.textContent = 'Listening… speak now';
        TB.Speech.listen(lang, {
          onInterim: function (t) { hintEl.textContent = '“' + t + '”'; }
        }).then(function (res) {
          mic.classList.remove('live');
          var scored = TB.Speech.score(target, res);
          var d = D();
          d.stats.xp = (d.stats.xp || 0) + (scored.score >= 75 ? 3 : 1);
          saveD(d);
          TB.Store.touchStreak(TB.Auth.userId());
          TB.Store.addHistory(TB.Auth.userId(), {
            type: 'speak', from: lang, to: lang, src: target,
            out: scored.score + '% · ' + (scored.heard || '')
          });
          TB.App.refreshChips();
          draw(scored);
        }).catch(function (e) {
          mic.classList.remove('live');
          hintEl.textContent = e.message;
        });
      }

      root.querySelectorAll('[data-l]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-l]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on'); lang = b.getAttribute('data-l'); pick();
        });
      });
      root.querySelectorAll('[data-m]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-m]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on'); mode = b.getAttribute('data-m'); pick();
        });
      });
      pick();
    }
  };

  /* ============================================================ ALPHABET */
  V.alphabet = {
    title: 'Alphabet', sub: 'Tamil 247 · Hindi varnamala · English 26',
    html: function (param) {
      var which = param || 'ta';
      var h = '<div class="view wide"><div class="card"><div class="pill-row">'
        + tab('ta', 'Tamil (247)') + tab('hi', 'हिंदी वर्णमाला') + tab('en', 'English A–Z')
        + '</div></div>';
      h += which === 'ta' ? tamilChart() : (which === 'hi' ? hindiChart() : englishChart());
      return h + '</div>';

      function tab(id, label) {
        return '<a class="pill' + (which === id ? ' on' : '') + '" href="#/alphabet/' + id + '">' + label + '</a>';
      }
    },
    mount: function () {}
  };

  function cellGrid(items, render) {
    return '<div class="alpha-grid">' + items.map(render).join('') + '</div>';
  }

  function tamilChart() {
    var A = TB.ALPHABET.ta;
    var h = '<div class="card"><h3>' + esc(A.label.ta) + '</h3><div class="card-sub">' + esc(A.summary) + '</div>';
    A.notes.forEach(function (n) { h += '<div class="tiny muted">• ' + esc(n) + '</div>'; });
    h += '</div>';

    h += '<div class="card"><h3>Vowels — uyir (12)</h3>'
      + cellGrid(A.vowels, function (v) {
          return '<div class="alpha-cell" data-speak="' + esc(v.ch) + '" data-lang="ta">'
            + '<div class="ch ta">' + esc(v.ch) + '</div><div class="r">' + esc(v.r) + '</div>'
            + '<div class="r">' + esc(v.kind) + '</div></div>';
        }) + '</div>';

    h += '<div class="card"><h3>Consonants — mei (18)</h3>'
      + cellGrid(A.consonants, function (c) {
          return '<div class="alpha-cell" data-speak="' + esc(c.base) + '" data-lang="ta">'
            + '<div class="ch ta">' + esc(c.ch) + '</div><div class="r">' + esc(c.rr) + '</div>'
            + '<div class="r">' + esc(c.cls) + '</div></div>';
        })
      + '<div class="mt"><div class="alpha-cell" style="max-width:110px" data-speak="' + esc(A.aytham.ch) + '" data-lang="ta">'
      + '<div class="ch ta">' + esc(A.aytham.ch) + '</div><div class="r">' + esc(A.aytham.name) + '</div></div></div></div>';

    h += '<div class="card"><h3>Compound letters — uyirmei (216)</h3>'
      + '<div class="card-sub">18 consonants × 12 vowels — tap any letter to hear it</div><div class="matrix"><table><thead><tr><th></th>';
    A.vowels.forEach(function (v) { h += '<th class="ta">' + esc(v.ch) + '</th>'; });
    h += '</tr></thead><tbody>';
    A.grid.forEach(function (row) {
      h += '<tr><td class="rowhead ta">' + esc(row.mei) + '</td>';
      row.cells.forEach(function (c) {
        h += '<td class="ta" data-speak="' + esc(c.ch) + '" data-lang="ta">' + esc(c.ch)
           + '<span class="r">' + esc(c.r) + '</span></td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div></div>';
  }

  function hindiChart() {
    var A = TB.ALPHABET.hi;
    var h = '<div class="card"><h3>' + esc(A.label.ta) + '</h3><div class="card-sub">' + esc(A.summary) + '</div>';
    A.notes.forEach(function (n) { h += '<div class="tiny muted">• ' + esc(n) + '</div>'; });
    h += '</div>';

    h += '<div class="card"><h3>Vowels — स्वर (13)</h3>'
      + cellGrid(A.vowels, function (v) {
          return '<div class="alpha-cell" data-speak="' + esc(v.ch) + '" data-lang="hi">'
            + '<div class="ch hi">' + esc(v.ch) + '</div><div class="r">' + esc(v.r) + '</div>'
            + '<div class="r ta">' + esc(v.ta) + '</div></div>';
        }) + '</div>';

    A.rows.forEach(function (row) {
      h += '<div class="card"><h3>' + esc(row.name) + '</h3>'
        + cellGrid(row.items, function (c) {
            return '<div class="alpha-cell' + (c.hard ? ' hard' : (c.asp ? ' asp' : '')) + '" data-speak="' + esc(c.ch) + '" data-lang="hi">'
              + '<div class="ch hi">' + esc(c.ch) + '</div><div class="r">' + esc(c.r) + '</div>'
              + '<div class="r ta">' + esc(c.ta) + '</div></div>';
          })
        + '<div class="tiny muted mt">Red border = sound not in Tamil · amber = aspirated</div></div>';
    });

    h += '<div class="card"><h3>Barahkhadi — matra table</h3>'
      + '<div class="card-sub">Each consonant with 11 vowel signs</div><div class="matrix"><table><thead><tr><th></th>';
    A.grid[0].cells.forEach(function (c) { h += '<th class="hi">' + esc(c.vowel) + '</th>'; });
    h += '</tr></thead><tbody>';
    A.grid.forEach(function (row) {
      h += '<tr><td class="rowhead hi">' + esc(row.base) + '</td>';
      row.cells.forEach(function (c) {
        h += '<td class="hi" data-speak="' + esc(c.ch) + '" data-lang="hi">' + esc(c.ch)
           + '<span class="r">' + esc(c.r) + '</span></td>';
      });
      h += '</tr>';
    });
    return h + '</tbody></table></div></div>';
  }

  function englishChart() {
    var A = TB.ALPHABET.en;
    var h = '<div class="card"><h3>' + esc(A.label.ta) + '</h3><div class="card-sub">' + esc(A.summary) + '</div>';
    A.notes.forEach(function (n) { h += '<div class="tiny muted">• ' + esc(n) + '</div>'; });
    h += '</div>';

    h += '<div class="card"><h3>All letters (26)</h3><div class="grid gauto">';
    A.letters.forEach(function (l) {
      h += '<div class="wcard" data-speak="' + esc(l.ch) + '" data-lang="en">'
        + '<div class="row"><div style="font-size:26px;font-weight:700">' + esc(l.ch) + ' ' + esc(l.low) + '</div>'
        + '<div class="spacer" style="flex:1"></div>'
        + '<span class="chip' + (l.type === 'vowel' ? ' accent' : (l.type === 'semi-vowel' ? ' amber' : '')) + '">'
        + (l.type === 'vowel' ? 'vowel' : (l.type === 'semi-vowel' ? 'semi' : 'consonant')) + '</span></div>'
        + '<div class="small ta">Name: ' + esc(l.name) + '</div>'
        + '<div class="tiny" style="color:var(--teal)">' + esc(l.sounds.join(' · ')) + '</div>'
        + '<div class="tiny muted ta">Tamil sound: ' + esc(l.ta) + '</div></div>';
    });
    return h + '</div></div>';
  }

  /* ============================================================= PHONICS */
  V.phonics = {
    title: 'Sounds', sub: '44 English sounds · Hindi contrasts',
    html: function (param) {
      var which = param || 'en';
      var P = TB.PHONICS[which];
      var h = '<div class="view"><div class="card"><div class="pill-row">'
        + '<a class="pill' + (which === 'en' ? ' on' : '') + '" href="#/phonics/en">English (44)</a>'
        + '<a class="pill' + (which === 'hi' ? ' on' : '') + '" href="#/phonics/hi">Hindi</a>'
        + '<a class="pill' + (which === 'ta' ? ' on' : '') + '" href="#/phonics/ta">Tamil</a>'
        + '</div></div>';

      P.groups.forEach(function (g) {
        h += '<div class="card"><h3>' + esc(g.name.ta) + '</h3><div class="card-sub">' + esc(g.name.en) + '</div>';
        h += '<div class="grid gauto">';
        g.items.forEach(function (it) {
          var sp = it.ex || it.hi || it.ta;
          var spLang = which === 'en' ? 'en' : which;
          h += '<div class="wcard' + (it.hard ? '' : '') + '" data-speak="' + esc(sp) + '" data-lang="' + spLang + '">';
          if (it.ipa) {
            h += '<div class="row"><span class="mono" style="font-size:18px;color:var(--teal)">' + esc(it.ipa) + '</span>'
              + '<div class="spacer" style="flex:1"></div>'
              + (it.hard ? '<span class="chip red">not in Tamil</span>' : '') + '</div>'
              + '<div style="font-size:17px;font-weight:650;margin-top:3px">' + esc(it.ex) + '</div>'
              + '<div class="small ta">' + esc(it.exTa) + '  ·  Tamil sound: ' + esc(it.ta) + '</div>';
          } else {
            h += '<div class="row"><span class="' + which + '" style="font-size:24px;font-weight:700">' + esc(it.hi || it.ta) + '</span>'
              + '<div class="spacer" style="flex:1"></div>'
              + (it.hard ? '<span class="chip red">new sound</span>' : (it.asp ? '<span class="chip amber">aspirated</span>' : '')) + '</div>'
              + '<div class="small">' + esc(it.hiR || it.taR || '') + (it.ta && it.hi ? ' · ' + esc(it.ta) : '') + '</div>';
          }
          if (it.note) h += '<div class="tiny muted ta" style="margin-top:4px">' + esc(it.note) + '</div>';
          h += '</div>';
        });
        h += '</div></div>';
      });

      if (P.rules && P.rules.length) {
        h += '<div class="card"><h3>Spelling rules</h3>';
        P.rules.forEach(function (r) {
          h += '<div style="padding:10px 0;border-top:1px solid var(--line-soft)">'
            + '<div style="font-weight:650">' + esc(r.rule) + '</div>'
            + '<div class="small ta muted">' + esc(r.ta) + '</div>'
            + '<div class="pill-row mt">' + r.ex.map(function (e) {
                return '<span class="pill">' + esc(e) + '</span>';
              }).join('') + '</div></div>';
        });
        h += '</div>';
      }
      return h + '</div>';
    },
    mount: function () {}
  };

  /* =============================================================== VOCAB */
  V.vocab = {
    title: 'Vocabulary', sub: TB.VOCAB.length + ' words · in 3 languages',
    html: function () {
      var themes = TB.THEMES.map(function (t) {
        return '<button class="pill" data-th="' + t.id + '" type="button">' + esc(t.en) + '</button>';
      }).join('');
      return '<div class="view wide">'
        + '<div class="card"><div class="row mb">'
        +   '<input id="vSearch" type="text" placeholder="Search — English / Tamil / Hindi" '
        +     'style="flex:1;min-width:190px;padding:10px 13px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +   '<button class="btn btn-sm" id="vSpeakAll" type="button">🔊 Play all</button>'
        + '</div>'
        + '<div class="pill-row"><button class="pill on" data-th="" type="button">All</button>' + themes + '</div></div>'
        + '<div id="vList"></div></div>';
    },
    mount: function (root) {
      var theme = '', q = '';

      function draw() {
        var list = TB.VOCAB.filter(function (w) {
          if (theme && w.th !== theme) return false;
          if (!q) return true;
          var s = q.toLowerCase();
          return w.ta.indexOf(q) >= 0 || w.hi.indexOf(q) >= 0
            || w.en.toLowerCase().indexOf(s) >= 0
            || (w.taR || '').toLowerCase().indexOf(s) >= 0
            || (w.hiR || '').toLowerCase().indexOf(s) >= 0
            || TB.Translit.phKey(w.taR) === TB.Translit.phKey(q);
        });

        var el = root.querySelector('#vList');
        if (!list.length) { el.innerHTML = '<div class="empty">Nothing found.</div>'; return; }

        var byTheme = {};
        list.forEach(function (w) { (byTheme[w.th] = byTheme[w.th] || []).push(w); });

        var h = '';
        Object.keys(byTheme).forEach(function (th) {
          h += '<div class="card"><h3>' + esc(themeName(th)) + '</h3><div class="grid gauto">';
          byTheme[th].forEach(function (w) {
            /* English and Hindi lead; Tamil sits underneath as the reading aid */
            h += '<div class="wcard">'
              + '<div class="row"><div class="w-en">' + esc(w.en) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.en, 'en') + '</div>'
              + '<div class="w-ipa">' + esc(w.enIpa || '') + ' · ' + esc(w.enTa || '') + '</div>'
              + '<div class="row" style="margin-top:7px"><div class="w-hi">' + esc(w.hi) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.hi, 'hi') + '</div>'
              + V.hiRead(w.hi, w.hiR, w.hiTa)
              + '<div class="w-gloss">' + esc(w.ta) + speak(w.ta, 'ta')
              + '<span class="w-r"> ' + esc(w.taR) + '</span></div>'
              + (w.tip ? '<div class="tiny muted" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line-soft)">💡 ' + esc(w.tip) + '</div>' : '')
              + '</div>';
          });
          h += '</div></div>';
        });
        el.innerHTML = h;
      }

      root.querySelector('#vSearch').addEventListener('input', function () { q = this.value.trim(); draw(); });
      root.querySelectorAll('[data-th]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-th]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on'); theme = b.getAttribute('data-th'); draw();
        });
      });
      root.querySelector('#vSpeakAll').addEventListener('click', function () {
        var list = TB.VOCAB.filter(function (w) { return !theme || w.th === theme; }).slice(0, 25);
        var steps = [];
        list.forEach(function (w) {
          steps.push({ text: w.ta, lang: 'ta', pause: 220 });
          steps.push({ text: w.en, lang: 'en', rate: 0.7, pause: 220 });
          steps.push({ text: w.hi, lang: 'hi', rate: 0.75, pause: 420 });
        });
        var btn = this;
        btn.textContent = '⏹ Stop';
        var run = TB.Speech.sequence(steps, { rate: D().prefs.rate });
        btn.onclick = function () { run.cancel(); TB.App.render(); };
        run.then(function () { TB.App.render(); });
      });
      draw();
    }
  };

  /* ============================================================= HISTORY */
  V.history = {
    title: 'History', sub: 'Everything you have done',
    html: function () {
      var d = D();
      var types = [
        ['', 'All'], ['translate', 'Translate'], ['meaning', 'Meaning'],
        ['tutor', 'Explain'], ['check', 'Correction'], ['ocr', 'Photo'], ['speak', 'Pronunciation']
      ].map(function (t, i) {
        return '<button class="pill' + (i === 0 ? ' on' : '') + '" data-ht="' + t[0] + '" type="button">' + t[1] + '</button>';
      }).join('');

      return '<div class="view">'
        + '<div class="card"><div class="row mb">'
        +   '<input id="hSearch" type="text" placeholder="Search history" style="flex:1;min-width:180px;padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +   '<button class="btn btn-sm" id="hExport" type="button">⬇ Download</button>'
        +   '<button class="btn btn-sm" id="hClear" type="button">Clear all</button>'
        + '</div><div class="pill-row">' + types + '</div>'
        + '<div class="tiny muted mt">Total ' + d.history.length + ' records — stored on this device only.</div></div>'
        + '<div id="hList"></div></div>';
    },
    mount: function (root) {
      var type = '', q = '';
      var LABEL = {
        translate: ['Translate', 'blue'], meaning: ['Meaning', 'accent'],
        tutor: ['Explain', 'green'], check: ['Correction', 'amber'],
        ocr: ['Photo', 'purple'], speak: ['Pronunciation', 'red']
      };

      function draw() {
        var d = D();
        var list = d.history.filter(function (h) {
          if (type && h.type !== type) return false;
          if (!q) return true;
          return (h.src || '').toLowerCase().indexOf(q.toLowerCase()) >= 0
              || (h.out || '').toLowerCase().indexOf(q.toLowerCase()) >= 0;
        });
        var el = root.querySelector('#hList');
        if (!list.length) {
          el.innerHTML = '<div class="empty"><div class="big">🕘</div>Nothing here yet.</div>';
          return;
        }
        el.innerHTML = list.slice(0, 300).map(function (h) {
          var lb = LABEL[h.type] || [h.type, ''];
          return '<div class="hist" data-id="' + esc(h.id) + '">'
            + '<div class="h-top"><span class="chip ' + lb[1] + '">' + esc(lb[0]) + '</span>'
            + '<span class="tiny muted">' + esc(TB.Translate.langName(h.from)) + ' → ' + esc(h.to === 'multi' ? 'several' : TB.Translate.langName(h.to)) + '</span>'
            + '<span class="h-time">' + ago(h.ts) + '</span></div>'
            + '<div class="h-src">' + esc((h.src || '').slice(0, 220)) + '</div>'
            + '<div class="h-out">' + esc((h.out || '').slice(0, 220)) + '</div>'
            + '<div class="row mt"><button class="btn btn-sm btn-ghost" data-again="' + esc(h.id) + '" type="button">↻ Repeat</button>'
            + '<button class="btn btn-sm btn-ghost" data-del="' + esc(h.id) + '" type="button">🗑</button></div>'
            + '</div>';
        }).join('');
      }

      root.querySelector('#hSearch').addEventListener('input', function () { q = this.value; draw(); });
      root.querySelectorAll('[data-ht]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-ht]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on'); type = b.getAttribute('data-ht'); draw();
        });
      });
      root.querySelector('#hList').addEventListener('click', function (e) {
        var del = e.target.closest('[data-del]');
        if (del) {
          TB.Store.deleteHistory(TB.Auth.userId(), del.getAttribute('data-del'));
          draw(); return;
        }
        var again = e.target.closest('[data-again]');
        if (again) {
          var h = D().history.filter(function (x) { return x.id === again.getAttribute('data-again'); })[0];
          if (!h) return;
          if (h.type === 'meaning') { TB.App.pending = { word: h.src }; location.hash = '#/meaning'; }
          else if (h.type === 'tutor' || h.type === 'check') { TB.App.pending = { text: h.src }; location.hash = '#/tutor'; }
          else { TB.App.pending = { text: h.src }; location.hash = '#/translate'; }
        }
      });
      root.querySelector('#hClear').addEventListener('click', function () {
        TB.App.confirm('Clear all history?', 'This cannot be undone.', function () {
          TB.Store.clearHistory(TB.Auth.userId());
          TB.App.render();
          TB.App.toast('History cleared', 'ok');
        });
      });
      root.querySelector('#hExport').addEventListener('click', function () {
        var blob = new Blob([TB.Store.exportAll(TB.Auth.userId())], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tamil-bridge-' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      draw();
    }
  };

  /* ============================================================ SETTINGS */
  V.settings = {
    title: 'Settings', sub: 'Voice, theme, data, sync',
    html: function () {
      var d = D();
      var u = TB.Auth.user() || {};
      function voiceOpts(lang, sel) {
        var vs = TB.Speech.voicesFor(lang);
        if (!vs.length) return '<option value="">— no voice installed for this language —</option>';
        return '<option value="">Automatic</option>' + vs.map(function (v) {
          return '<option value="' + esc(v.name) + '"' + (v.name === sel ? ' selected' : '') + '>' + esc(v.name) + ' (' + esc(v.lang) + ')</option>';
        }).join('');
      }
      var missing = ['ta', 'en', 'hi'].filter(function (l) { return TB.Speech.missing(l); });

      return '<div class="view">'

      + '<div class="card"><h3>Account</h3>'
      +   '<div class="field"><label>Name</label><input id="sName" value="' + esc(u.name || '') + '"></div>'
      +   '<div class="field"><label>Email / phone</label><input id="sId" value="' + esc(u.email || u.phone || '') + '"></div>'
      +   '<button class="btn btn-sm" id="sSaveProfile" type="button">Save</button>'
      +   '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-soft)">'
      +   '<div class="tiny muted mb">Change password</div>'
      +   '<div class="grid g2"><input id="sOldPw" type="password" placeholder="Current password" style="padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
      +   '<input id="sNewPw" type="password" placeholder="New password" style="padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)"></div>'
      +   '<button class="btn btn-sm mt" id="sChangePw" type="button">Change password</button></div>'
      + '</div>'

      + '<div class="card"><h3>Voice</h3><div class="card-sub">Your browser’s built-in voices — completely free</div>'
      +   (missing.length ? '<div class="msg msg-warn">This device has no '
          + missing.map(langLabel).join(', ') + ' voice is not installed. '
          + 'Windows: Settings → Time &amp; language → Language &amp; region → add the language and choose "Speech".</div>' : '')
      +   '<div class="field"><label>Speed — <span id="rateVal">' + d.prefs.rate + '</span></label>'
      +     '<input id="sRate" type="range" min="0.4" max="1.3" step="0.05" value="' + d.prefs.rate + '"></div>'
      +   '<div class="field"><label>Pitch — <span id="pitchVal">' + d.prefs.pitch + '</span></label>'
      +     '<input id="sPitch" type="range" min="0.6" max="1.6" step="0.05" value="' + d.prefs.pitch + '"></div>'
      +   '<div class="grid g3">'
      +     '<div class="field"><label>Tamil voice</label><select id="sVoiceTa">' + voiceOpts('ta', d.prefs.voiceTa) + '</select></div>'
      +     '<div class="field"><label>English voice</label><select id="sVoiceEn">' + voiceOpts('en', d.prefs.voiceEn) + '</select></div>'
      +     '<div class="field"><label>हिंदी आवाज़</label><select id="sVoiceHi">' + voiceOpts('hi', d.prefs.voiceHi) + '</select></div>'
      +   '</div>'
      +   '<label class="row small" style="cursor:pointer"><input id="sAuto" type="checkbox"' + (d.prefs.autoSpeak ? ' checked' : '') + ' style="width:auto"> Speak automatically during practice</label>'
      +   '<div class="row mt"><button class="btn btn-sm" data-speak="வணக்கம், நான் உங்கள் ஆசிரியர்." data-lang="ta" type="button">Test Tamil</button>'
      +   '<button class="btn btn-sm" data-speak="Hello, I am your teacher." data-lang="en" type="button">English test</button>'
      +   '<button class="btn btn-sm" data-speak="नमस्ते, मैं आपका शिक्षक हूँ।" data-lang="hi" type="button">हिंदी परीक्षण</button></div>'
      + '</div>'

      + '<div class="card"><h3>Sync (optional)</h3>'
      +   '<div class="card-sub">The app works fully without a backend. Set this up only if you want the same account on another device.</div>'
      +   '<div class="field"><label>API address</label><input id="sApi" placeholder="https://your-app.onrender.com" value="' + esc(TB.Sync.baseUrl()) + '"></div>'
      +   '<div class="row"><button class="btn btn-sm" id="sApiSave" type="button">Save</button>'
      +   '<button class="btn btn-sm" id="sApiTest" type="button">Test connection</button>'
      +   '<span id="sApiStat" class="tiny muted"></span></div>'
      +   '<div id="sStore" class="mt"></div>'
      +   '<div class="tiny muted mt">Render’s free tier sleeps after 15 minutes idle — the first request can take up to a minute.</div>'
      + '</div>'

      + '<div class="card"><h3>Data</h3>'
      +   '<div class="row"><button class="btn btn-sm" id="sExport" type="button">⬇ Download everything</button>'
      +   '<button class="btn btn-sm" id="sImportBtn" type="button">⬆ Restore</button>'
      +   '<input id="sImport" type="file" accept="application/json" style="display:none"></div>'
      +   '<div class="tiny muted mt">Your data lives only in this browser. Clearing browser data deletes it — download a backup now and then.</div>'
      +   '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-soft)">'
      +   '<button class="btn btn-sm" id="sDelete" type="button" style="border-color:var(--red);color:var(--red)">Delete account</button></div>'
      + '</div>'

      + '<div class="card"><h3>About</h3>'
      +   '<div class="small muted">Tamil Bridge — a completely free tool for learning English and Hindi as a Tamil speaker.</div>'
      +   '<div class="tiny muted mt">' + TB.VOCAB.length + ' Vocabulary · ' + TB.LESSONS.length + ' lessons · 247 Tamil letters · 44 English sounds<br>'
      +   'Voice: Web Speech API · Photo: Tesseract.js · Translation: Google / MyMemory / LibreTranslate<br>'
      +   'No API key required. No cost, ever.</div>'
      + '</div>'
      + '</div>';
    },
    mount: function (root) {
      function setPref(k, v) { var d = D(); d.prefs[k] = v; saveD(d); }

      root.querySelector('#sRate').addEventListener('input', function () {
        root.querySelector('#rateVal').textContent = this.value; setPref('rate', +this.value);
      });
      root.querySelector('#sPitch').addEventListener('input', function () {
        root.querySelector('#pitchVal').textContent = this.value; setPref('pitch', +this.value);
      });
      root.querySelector('#sVoiceTa').addEventListener('change', function () { setPref('voiceTa', this.value); });
      root.querySelector('#sVoiceEn').addEventListener('change', function () { setPref('voiceEn', this.value); });
      root.querySelector('#sVoiceHi').addEventListener('change', function () { setPref('voiceHi', this.value); });
      root.querySelector('#sAuto').addEventListener('change', function () { setPref('autoSpeak', this.checked); });

      root.querySelector('#sSaveProfile').addEventListener('click', function () {
        TB.Auth.updateProfile(root.querySelector('#sName').value, root.querySelector('#sId').value)
          .then(function () { TB.App.toast('Saved', 'ok'); TB.App.paintUser(); })
          .catch(function (e) { TB.App.toast(e.message, 'err'); });
      });
      root.querySelector('#sChangePw').addEventListener('click', function () {
        TB.Auth.changePassword(root.querySelector('#sOldPw').value, root.querySelector('#sNewPw').value)
          .then(function () {
            TB.App.toast('Password changed', 'ok');
            root.querySelector('#sOldPw').value = ''; root.querySelector('#sNewPw').value = '';
          })
          .catch(function (e) { TB.App.toast(e.message, 'err'); });
      });

      root.querySelector('#sApiSave').addEventListener('click', function () {
        TB.Sync.setBase(root.querySelector('#sApi').value.trim());
        TB.App.toast('Saved', 'ok');
      });
      /* A server that answers but keeps accounts in memory loses every one of
         them the next time Render restarts it, which on the free tier is
         often. Say so plainly, and say exactly how to fix it. */
      function showStore(h) {
        var box = root.querySelector('#sStore');
        if (!box) return;
        if (!h) { box.innerHTML = ''; return; }
        if (h.durable) {
          box.innerHTML = '<div class="msg msg-ok">Accounts are saved in a database. '
            + 'Signing in on another device will bring your history with you.</div>';
          return;
        }
        box.innerHTML = '<div class="msg msg-warn"><b>The server is not saving accounts yet.</b><br>'
          + esc(h.reason || 'It is using temporary memory.')
          + ' Anything it holds disappears when the service restarts. '
          + 'Your learning history is safe either way — it lives in this browser.'
          + '<div class="tiny mt">To make it permanent, free and forever:<br>'
          + '1. Create a free account at <b>mongodb.com/cloud/atlas/register</b><br>'
          + '2. Build a cluster and choose the <b>M0 Free</b> tier (no card needed)<br>'
          + '3. Database Access → add a user with a password<br>'
          + '4. Network Access → Add IP Address → <b>Allow access from anywhere</b><br>'
          + '5. Connect → Drivers → copy the connection string<br>'
          + '6. In Render → your service → Environment → add <b>MONGODB_URI</b> with that string, '
          + 'replacing &lt;password&gt; with the password from step 3</div></div>';
      }

      function checkStore(statusEl) {
        if (!TB.Sync.configured()) { showStore(null); return; }
        if (statusEl) statusEl.innerHTML = '<span class="spin"></span> Testing… (a sleeping service can take a minute to wake)';
        TB.Sync.health().then(function (h) {
          if (statusEl) {
            statusEl.textContent = h ? '✓ Connected' : '✗ ' + (TB.Sync.lastError() || 'Could not connect');
            statusEl.style.color = h ? 'var(--green)' : 'var(--red)';
          }
          showStore(h);
        });
      }

      root.querySelector('#sApiTest').addEventListener('click', function () {
        TB.Sync.setBase(root.querySelector('#sApi').value.trim());
        var st = root.querySelector('#sApiStat');
        if (!TB.Sync.configured()) { st.textContent = 'No address set — running in local mode.'; showStore(null); return; }
        checkStore(st);
      });
      checkStore(null);

      root.querySelector('#sExport').addEventListener('click', function () {
        var blob = new Blob([TB.Store.exportAll(TB.Auth.userId())], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tamil-bridge-backup.json';
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      root.querySelector('#sImportBtn').addEventListener('click', function () { root.querySelector('#sImport').click(); });
      root.querySelector('#sImport').addEventListener('change', function () {
        var f = this.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          try {
            TB.Store.importData(TB.Auth.userId(), fr.result);
            TB.App.toast('Restored', 'ok');
            TB.App.render();
          } catch (e) { TB.App.toast(e.message, 'err'); }
        };
        fr.readAsText(f);
      });

      root.querySelector('#sDelete').addEventListener('click', function () {
        TB.App.confirm('Delete account?', 'Your history and all progress will be permanently erased. This cannot be undone.', function () {
          TB.Auth.deleteAccount();
          location.reload();
        });
      });
    }
  };
})();
