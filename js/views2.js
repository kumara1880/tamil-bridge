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
       + '<h3 style="font-size:calc(19px * var(--fs,1))">' + esc(u.title.en) + '</h3>'
       + '<div class="card-sub ta">' + esc(u.title.ta) + '</div></div>'
       + '<div class="spacer"></div><a class="btn btn-sm" href="#/learn">← All lessons</a></div>'
       + '<p class="small">' + esc(u.goal) + '</p>'
       + '<div class="explain">' + u.grammar.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</div>'
       + '<button class="btn btn-primary mt" id="playAll" type="button">🔊 Play the whole lesson</button>'
       + '</div>';

    h += '<div class="card"><h3>Sentences</h3><div class="card-sub">Listen to each one, then say it</div>';
    u.lines.forEach(function (l, i) {
      h += '<div style="padding:12px 0;border-top:1px solid var(--line-soft)">';
      h += '<div style="font-size:calc(18px * var(--fs,1));font-weight:600">' + tappable(l.en, 'en') + speak(l.en, 'en') + '</div>';
      h += '<div class="hi" style="font-size:calc(17px * var(--fs,1));margin-top:3px">' + tappable(l.hi, 'hi') + speak(l.hi, 'hi') + '</div>';
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
          area.innerHTML = '<div class="card center"><div style="font-size:calc(34px * var(--fs,1))">✅</div>'
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
        +       '<select id="ocrLang" aria-label="Language in the picture">'
        +         '<option value="auto" selected>Detect automatically</option>' + packs + '</select>'
        +       '<div class="hint">Leave this on automatic unless it gets it wrong.</div></div>'
        +     '<div class="field" style="margin:0"><label for="ocrTarget">Translate into</label>'
        +     '<select id="ocrTarget">' + targets + '</select>'
        +       '<div class="hint">Change this any time — the picture is not read again.</div></div>'
        +   '</div>'
        +   '<div class="drop" id="drop">'
        +     '<div style="font-size:calc(34px * var(--fs,1))">🖼️</div>'
        +     '<div style="font-weight:650;margin-top:6px">Choose a picture, or drop one here</div>'
        +     '<div class="tiny muted">JPG · PNG · WEBP</div>'
        +   '</div>'
        /* Two separate inputs. The gallery one must NOT carry `capture`: with
           it, a phone opens the camera and refuses to let you pick a picture
           you already have, so the only way to read a saved rhyme was to
           photograph the screen it was on — which is how a clean page of
           English came back as "¥ / IV 2 | 2 i oe". */
        +   '<input id="file" type="file" accept="image/*" style="display:none" '
        +     'aria-label="Choose a picture from this device">'
        +   '<input id="cam" type="file" accept="image/*" capture="environment" style="display:none" '
        +     'aria-label="Take a photograph">'
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
              ? '<div class="msg msg-info tiny">This device has no ' + esc(TB.Translate.langName(lang))
                + ' voice, so it is read aloud over the internet instead \u2014 which works, but '
                + 'needs a connection. Installing the voice makes it work offline and start '
                + 'faster.</div>' : '');
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
          /* No voice on this device is not the end of it — the online one is
             tried next, inside speak(). Refusing here meant a Tamil rhyme
             was never read aloud at all on a machine with only English
             voices, however well the online voice worked. */
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
        /* Passed whole rather than flattened to strings: each line carries
           the score the reader gave itself, which is the only thing that
           tells a watermark from a short real line. */
        var found = res.lines;
        /* A poster has a title drawn in letters nobody can read and a
           watermark at the foot, and OCR returns both as rubble. Kept, they
           are read aloud, translated, and stop the page looking like a poem
           at all — so the verse gets flattened into prose. */
        var swept = TB.Reader.clean(found);
        var raw = swept.lines;
        res.dropped = swept.dropped;

        /* Score what is being shown, not what was thrown away. The pack was
           chosen on the whole picture, which is right — that decision needs
           everything. But the number a person is shown, and the warning that
           hangs off it, are about the words in front of them: a poster whose
           rhyme reads at 96 while its drawn title reads at 27 is not a
           doubtful reading, and saying so sends people to change a language
           that was never wrong. */
        if (swept.dropped.length) {
          var keptConf = res.lines
            .filter(function (l) { return swept.lines.indexOf(TB.Reader.mendLetters(l.text)) >= 0; })
            .map(function (l) { return l.confidence; })
            .filter(function (c) { return typeof c === 'number'; });
          var avg = keptConf.length
            ? keptConf.reduce(function (a, b) { return a + b; }, 0) / keptConf.length
            : res.confidence;
          res.score = TB.OCR.plausibility({ text: raw.join('\n'), confidence: avg });
          res.lowConfidence = res.score < TB.OCR.TRUST;
        }
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
          + ' · ' + res.lines.length + (res.lines.length === 1 ? ' line' : ' lines')
          + (res.dropped && res.dropped.length
              ? ' · ' + res.dropped.length + ' of decoration set aside' : '')
          + ' · score ' + res.score + '/100'
          + (modes.isVerse ? ' · read as a rhyme'
                           : (flow.reflowed ? ' · joined into ' + lines.length
                               + (lines.length === 1 ? ' sentence' : ' sentences') : ''))
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
          V.copyWithToast(res.text);
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
          + '<div class="' + lang + '" style="font-size:calc(28px * var(--fs,1));font-weight:700;margin:8px 0">' + esc(target) + speak(target, lang) + '</div>'
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
      var lang = which === 'en' ? 'en' : which;
      var sx = TB.Speech.sexesFor(lang);
      var pref = (V.D().prefs || {}).voiceSex || '';
      var h = '<div class="view wide"><div class="card"><div class="pill-row">'
        + tab('ta', 'Tamil (247)') + tab('hi', 'हिंदी वर्णमाला') + tab('en', 'English A–Z')
        + '</div>'
        /* Offered only where the device really has both, and explained
           where it does not — a button that cannot do anything is worse
           than no button. */
        + '<div class="row mt"><span class="tiny muted">Voice:</span>'
        +   '<div class="pill-row" id="aVoice">'
        +     '<button class="pill' + (pref ? '' : ' on') + '" data-sex="" type="button">Any</button>'
        +     '<button class="pill' + (pref === 'm' ? ' on' : '') + '" data-sex="m" type="button"'
        +       (sx.m ? '' : ' disabled') + '>\u{1F468} Man</button>'
        +     '<button class="pill' + (pref === 'f' ? ' on' : '') + '" data-sex="f" type="button"'
        +       (sx.f ? '' : ' disabled') + '>\u{1F469} Woman</button>'
        /* A different speaker again, and a native one for each language.
           Offered as what it is rather than as a gender, which is not
           something this page can know. */
        +     '<button class="pill' + (pref === 'net' ? ' on' : '') + '" data-sex="net" type="button"'
        +       (sx.online ? '' : ' disabled') + '>\u{1F310} Online voice</button>'
        +   '</div>'
        + '</div>'
        /* Which of the three to hear. They teach different things: the
           name of the letter, the sound it makes in a word, or the whole
           set in order the way it is recited. */
        + '<div class="row mt"><span class="tiny muted">Read:</span>'
        +   '<div class="pill-row" id="aMode">'
        +     '<button class="pill on" data-mode="pair" type="button">Letter + word</button>'
        +     '<button class="pill" data-mode="letter" type="button">Letter only</button>'
        +     '<button class="pill" data-mode="all" type="button">\u25B6 Read them all</button>'
        +   '</div>'
        +   '<span class="spacer" style="flex:1"></span>'
        +   '<button class="btn btn-sm" id="aStop" type="button" hidden>\u23F9 Stop</button>'
        + '</div>'
        + '<div class="tiny muted mt">'
        +   (sx.total === 0
            ? 'This device has no ' + (lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English')
              + ' voice, so it is read over the internet \u2014 which offers one voice only.'
            : (sx.m && sx.f)
              ? 'Tap a letter to hear it slowly, then a word that has it in.'
              : 'This device has only ' + (sx.total === 1 ? 'one ' : sx.total + ' ')
                + (lang === 'ta' ? 'Tamil' : lang === 'hi' ? 'Hindi' : 'English')
                + ' voice' + (sx.total === 1 ? '' : 's') + ', so there is no choice of man or woman here \u2014 '
                + 'but the online voice is a different speaker, and a native one. '
                + 'Tap a letter to hear it slowly, then a word that has it in.')
        + '</div>'
        + '</div>';
      h += which === 'ta' ? tamilChart() : (which === 'hi' ? hindiChart() : englishChart());
      return h + '</div>';

      function tab(id, label) {
        return '<a class="pill' + (which === id ? ' on' : '') + '" href="#/alphabet/' + id + '">' + label + '</a>';
      }
    },
    mount: function (root) {
      var mode = 'pair';
      var running = null;
      var stopBtn = root.querySelector('#aStop');

      var modeRow = root.querySelector('#aMode');
      if (modeRow) modeRow.addEventListener('click', function (e) {
        var b = e.target.closest('[data-mode]');
        if (!b) return;
        var want = b.getAttribute('data-mode');
        if (want === 'all') { readThemAll(); return; }
        root.querySelectorAll('#aMode .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        mode = want;
      });

      function clearLit() {
        root.querySelectorAll('.alpha-cell.saying').forEach(function (x) {
          x.classList.remove('saying');
        });
      }

      function stopReading() {
        if (running && running.cancel) running.cancel();
        running = null;
        TB.Speech.stop();
        clearLit();
        root.classList.remove('reading');
        if (stopBtn) stopBtn.hidden = true;
      }
      if (stopBtn) stopBtn.addEventListener('click', stopReading);

      /* The whole set, in order, with the letter lit as it is said \u2014 which
         is the only way to tell which one you are hearing. */
      /* Set the moment somebody scrolls by hand, cleared when a reading
         starts. Only a real gesture counts; scrollIntoView is not one. */
      var userScrolled = false;
      ['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
        window.addEventListener(ev, function () { userScrolled = true; }, { passive: true });
      });

      function readThemAll() {
        stopReading();
        userScrolled = false;
        var cells = [].slice.call(root.querySelectorAll('[data-letter]'));
        if (!cells.length) return;
        var d = V.D();
        /* The chooser above says Letter + word, and this ignored it — so
           the one place a child would sit and listen gave them the least.
           It reads what the chooser says to read. */
        var steps = [];
        cells.forEach(function (c) {
          var lang = c.getAttribute('data-lang') || 'ta';
          steps.push({ text: c.getAttribute('data-letter'), lang: lang, rate: 0.5, pause: 700 });
          var word = c.getAttribute('data-word');
          if (word && mode === 'pair') {
            steps.push({ text: word, lang: lang, rate: 0.62, pause: 850, forCell: true });
          }
        });
        /* which card each step belongs to */
        var cellOf = [], ci = 0;
        steps.forEach(function (st) { cellOf.push(ci); if (!st.forCell) { /* letter */ } });
        cellOf = []; ci = -1;
        steps.forEach(function (st) { if (!st.forCell) ci++; cellOf.push(ci); });

        if (stopBtn) stopBtn.hidden = false;
        root.classList.add('reading');   /* floats Stop where it can be reached */
        running = TB.Speech.sequence(steps, {
          sex: d.prefs.voiceSex === 'net' ? '' : (d.prefs.voiceSex || ''),
          online: d.prefs.voiceSex === 'net',
          voiceNames: { ta: d.prefs.voiceTa, en: d.prefs.voiceEn, hi: d.prefs.voiceHi },
          onStep: function (step, i) {
            /* Two steps can belong to one card now, so the lit card is the
               one this step came from, not the i-th. */
            if (step.forCell) return;      /* the word: leave its letter lit */
            clearLit();
            var cell = cells[cellOf[i]];
            if (!cell) return;
            cell.classList.add('saying');
            /* Following along is useful; being dragged back is not. Once
               somebody has scrolled themselves — to reach Stop, usually —
               the page stops moving under them. */
            if (!userScrolled) cell.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        });
        running.then(function () {
          clearLit();
          root.classList.remove('reading');
          if (stopBtn) stopBtn.hidden = true;
          running = null;
        });
      }

      var sexRow = root.querySelector('#aVoice');
      if (sexRow) sexRow.addEventListener('click', function (e) {
        var b = e.target.closest('[data-sex]');
        if (!b) return;
        /* Pressing something that cannot work should say so. Silence reads
           as broken. */
        if (b.disabled) {
          TB.App.toast('This device has no ' + (b.getAttribute('data-sex') === 'f'
            ? 'woman\u2019s' : 'man\u2019s') + ' voice for this language.', 'warn');
          return;
        }
        root.querySelectorAll('#aVoice .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var d = V.D();
        d.prefs.voiceSex = b.getAttribute('data-sex');
        V.saveD(d);
        /* Heard at once, rather than on the next thing tapped. */
        TB.Speech.speak(lang === 'ta' ? 'அ' : lang === 'hi' ? 'अ' : 'a', lang, {
          rate: 0.5,
          sex: d.prefs.voiceSex === 'net' ? '' : d.prefs.voiceSex,
          online: d.prefs.voiceSex === 'net'
        });
      });

      /* The letter, slowly, and then a word that has it in — which is what
         a teacher does, and what a speech engine needs: one character on
         its own has no context to set its length or stress by, and several
         engines read the character's name instead of its sound. */
      root.addEventListener('click', function (e) {
        var cell = e.target.closest('[data-letter]');
        if (!cell) return;
        if (e.target.closest('[data-speak]')) return;   /* the word, on its own */
        stopReading();
        var lang = cell.getAttribute('data-lang') || 'ta';
        var d = V.D();
        var solo = cell.hasAttribute('data-solo');   /* the undotted letter, alone */
        /* Slowly, and with room after it. Some engines report a line as
           finished while the sound is still going, so the next one used
           to land on the tail of the one before. */
        var steps = [{ text: cell.getAttribute('data-letter'), lang: lang,
                       rate: 0.5, pause: 900 }];
        var word = cell.getAttribute('data-word');
        if (word && mode === 'pair' && !solo) {
          steps.push({ text: word, lang: lang, rate: 0.62, pause: 500 });
        }
        var lit = (solo && cell.closest('.alpha-cell')) || cell;
        lit.classList.add('saying');
        running = TB.Speech.sequence(steps, {
          sex: d.prefs.voiceSex === 'net' ? '' : (d.prefs.voiceSex || ''),
          online: d.prefs.voiceSex === 'net',
          voiceNames: { ta: d.prefs.voiceTa, en: d.prefs.voiceEn, hi: d.prefs.voiceHi }
        });
        running.then(function () { lit.classList.remove('saying'); running = null; });
      });
    }
  };

  function cellGrid(items, render) {
    return '<div class="alpha-grid">' + items.map(render).join('') + '</div>';
  }

  /* A letter on its own is the thing a speech engine reads worst, and the
     thing a child learns slowest. The word underneath is both the fix and
     the lesson: tap the letter for the sound, tap the word to hear it where
     it really lives. */
  /* Put on the cell itself: what to say, and the word to say after it. The
     alphabet's own handler reads both; the cell has no data-speak, so the
     app-wide one does not also fire and cut the pair in half. */
  /* What this card says when it is pressed. For a mei letter that is its
     own name and nothing else: the dot is there precisely to say that the
     vowel has been taken away. */
  /* Some letters cannot be said on their own by a voice trained on the
     language, because no word in it begins with them — ङ, ञ, ण, the
     anusvara. Asked anyway, an engine guesses.

     letterSay is a sayable form of THAT LETTER, not a substitute for it:
     अङ्, अञ्, अण् — a vowel in front and the vowel killed, the same
     convention Tamil names its mei letters with (இக், இங்). The card still
     says the letter and then the word; it was briefly saying only the
     word, which is worse than the problem it was fixing. */
  function sayPair(it, lang, letter) {
    return ' data-letter="' + esc(it.letterSay || letter) + '" data-lang="' + lang + '"'
      + (it.ex ? ' data-word="' + esc(it.ex) + '"' : '');
  }

  /* A word a child cannot picture is a word they look up again tomorrow. */
  function alphaPic(it) {
    return it.pic ? '<div class="alpha-pic" aria-hidden="true">' + it.pic + '</div>' : '';
  }

  /* A mei letter has two names and both are taught: \u0b87\u0b95\u0bcd on its own, \u0b95
     joined to its vowel. Everything else has just the one. */
  /* The two readings, kept apart on purpose. The dotted letter reads ik and
     is what this card says when pressed. The undotted one reads ka, is a
     different letter, and is pressed on its own — which is the whole point
     of the dot. */
  function alphaSay(it) {
    if (!it.meiSay) {
      /* A letter can read one way alone and compose another way inside a
         syllable: ஔ is ow by itself and au in கௌ, ஙௌ. The card shows the
         first; the grid keeps the second. */
      return '<div class="alpha-say">' + esc(it.alone || it.say || it.r || '') + '</div>'
        /* A letter no voice can say alone is said in this form instead —
           the letter, with a vowel in front and its own vowel killed. */
        + (it.letterSay
           ? '<div class="alpha-alone"><span class="hi">' + esc(it.letterSay) + '</span> '
             + esc(it.letterSayR) + '<small>said alone</small></div>'
           : '');
    }
    /* The letter with its vowel back is a section of its own further down.
       It used to sit on this card as a small button, and கல் was printed
       under க் — a word that starts with the undotted letter, on the card
       whose whole job is to teach the difference. */
    return '<div class="alpha-two">'
      + '<b class="as-name"><small>' + esc(it.mei) + '</small>' + esc(it.meiSay) + '</b>'
      + '</div>';
  }

  function alphaWord(it, lang) {
    if (!it.ex) return '';
    return '<div class="alpha-ex" data-speak="' + esc(it.ex) + '" data-lang="' + lang + '">'
      + '<span class="' + lang + '">' + esc(it.ex) + '</span>'
      + (it.exR ? '<span class="alpha-ex-r">' + esc(it.exR) + '</span>' : '')
      /* The meaning in all three, not just in English. A page that claims
         three languages and explains in one is a page in one. */
      /* On the English chart the word IS its own English meaning, so
         printing both gave "apple / apple". */
      + (it.exEn && it.exEn !== it.ex
         ? '<span class="alpha-ex-en">' + esc(it.exEn) + '</span>' : '')
      /* A letter written with the anusvara today does not appear in its
         own modern spelling. The traditional one is where it can be seen. */
      + (it.oldEx
         ? '<span class="alpha-old"><span class="hi">' + esc(it.oldEx) + '</span>'
           + '<small>traditionally</small></span>' : '')
      + (it.exTa ? '<span class="alpha-ex-m ta">' + esc(it.exTa) + '</span>' : '')
      + (it.exHi ? '<span class="alpha-ex-m hi">' + esc(it.exHi) + '</span>' : '')
      + '</div>';
  }

  function tamilChart() {
    var A = TB.ALPHABET.ta;
    var h = '<div class="card"><h3>' + esc(A.label.ta) + '</h3><div class="card-sub">' + esc(A.summary) + '</div>';
    A.notes.forEach(function (n) { h += '<div class="tiny muted">• ' + esc(n) + '</div>'; });
    h += '</div>';

    h += '<div class="card"><h3>Vowels — uyir (12)</h3>'
      + cellGrid(A.vowels, function (v) {
          return '<div class="alpha-cell"' + sayPair(v, 'ta', v.ch) + '>'
            + '<div class="ch ta">' + esc(v.ch) + '</div>'
            /* How to say it comes first and large. The scholarly form is
               kept underneath, because every dictionary uses it — but ā
               and ī are not a reading, they are a second thing to learn. */
            + alphaSay(v)
            + '<div class="r">' + esc(v.r) + ' · ' + esc(v.kind) + '</div>'
            + '<div class="alpha-en">' + esc(v.en) + '</div>'
            + alphaPic(v) + alphaWord(v, 'ta') + '</div>';
        }) + '</div>';

    h += '<div class="card"><h3>Consonants — mei (18)</h3>'
      + '<div class="card-sub">The dot means the vowel has been taken away. '
      + 'Each is named <b>ik, ing, ich</b> — and the word beside it is one '
      + 'where that dotted letter really appears.</div>'
      + cellGrid(A.consonants, function (c) {
          /* The letter is க்; what is spoken is க, because a mei letter
             cannot be said on its own — which is what the chart says two
             lines above. */
          /* The card shows க் and says இக். It used to show the dot and
             say the undotted letter, which is the one thing the dot is
             there to prevent. */
          return '<div class="alpha-cell"' + sayPair(c, 'ta', c.mei || c.base) + '>'
            + '<div class="ch ta">' + esc(c.ch) + '</div>'
            + alphaSay(c)
            + '<div class="r">' + esc(c.mei || '') + ' · ' + esc(c.cls) + '</div>'
            + '<div class="alpha-en">' + esc(c.en) + '</div>'
            + alphaPic(c) + alphaWord(c, 'ta') + '</div>';
        })
      + '<div class="mt"><div class="alpha-cell" style="max-width:170px"'
      + sayPair(A.aytham, 'ta', A.aytham.ch) + '>'
      + '<div class="ch ta">' + esc(A.aytham.ch) + '</div>'
      + alphaSay(A.aytham)
      + '<div class="r">' + esc(A.aytham.name) + '</div>'
      + '<div class="alpha-en">' + esc(A.aytham.en) + '</div>'
      + alphaPic(A.aytham) + alphaWord(A.aytham, 'ta') + '</div></div></div>';

    /* அ வரிசை — the same eighteen with their vowel back. Different
       letters, different readings, different words, so: a different
       section. */
    h += '<div class="card"><h3>With their vowel — அ வரிசை (18)</h3>'
      + '<div class="card-sub">The same eighteen without the dot. க் is <b>ik</b>; '
      + 'க is <b>ka</b>, and it is க that starts கல்.</div>'
      + cellGrid(A.withA, function (c) {
          return '<div class="alpha-cell"' + sayPair(c, 'ta', c.ch) + '>'
            + '<div class="ch ta">' + esc(c.ch) + '</div>'
            + '<div class="alpha-say">' + esc(c.say) + '</div>'
            + '<div class="r">' + esc(c.r) + ' · ' + esc(c.cls) + '</div>'
            + '<div class="alpha-en">' + esc(c.en) + '</div>'
            + alphaPic(c) + alphaWord(c, 'ta') + '</div>';
        })
      + '</div>';

    h += '<div class="card"><h3>Compound letters — uyirmei (216)</h3>'
      + '<div class="card-sub">18 consonants × 12 vowels — tap any letter to hear it</div>'
      /* Written readably, three of these rows become "na", two become "la"
         and two become "ra". The scholarly form is what tells them apart,
         so every cell carries both and the legend says which is which. */
      + '<div class="grid-legend">'
      +   '<b>Three n’s:</b> ந na <i>(teeth)</i> · ன ṉa <i>(ridge)</i> · ண ṇa <i>(curled back)</i>'
      +   '<br><b>Two l’s:</b> ல la <i>(teeth)</i> · ள ḷa <i>(curled back)</i>'
      +   ' &nbsp; <b>Two r’s:</b> ர ra <i>(one tap)</i> · ற ṟa <i>(hard, rolled)</i>'
      +   '<br><b>ங is /ŋ/</b> — the ng of <i>singer</i>, not of <i>finger</i>: no hard g after it.'
      /* Counted in 134,000 characters of this app's own Tamil: ங appears
         733 times and 712 of them carry the pulli; 79% of those are ங்க.
         The other eleven ங forms appear zero times. */
      +   '<br><b>ங is never met on its own</b>, and it never carries a vowel. It '
      +   'is ங் before க, and the vowel sits on that க — so the cell marked ஙி is '
      +   'really ங்கி, and each cell in that row shows its own cluster with a word '
      +   'that contains it. Two have no everyday word, so they give the cluster '
      +   'said on its own instead — இங்கொ, named the way இக் and இங் are.'
      + '</div>'
      + '<div class="matrix"><table><thead><tr><th></th>';
    A.vowels.forEach(function (v) {
      h += '<th class="ta">' + esc(v.ch) + '<span class="r">' + esc(v.say) + '</span></th>';
    });
    h += '</tr></thead><tbody>';
    A.grid.forEach(function (row) {
      h += '<tr><td class="rowhead ta">' + esc(row.mei)
         + '<span class="r">' + esc(row.r) + '</span></td>';
      row.cells.forEach(function (c) {
        /* ங is never met on its own — it lives in the cluster ங்க — and a
           voice asked for ஙொ gave back "ango", which is அங்கு: the nearest
           real thing it knew. So that row is not bare syllables. Each cell
           carries a word with ங in it and says the word. */
        /* ங never carries a vowel itself. The vowel of this cell sits on
           the க that ங் always precedes, so the cell shows that cluster and
           a word containing it — ங்கி, வங்கி — rather than a syllable
           no Tamil word has and no voice can say. */
        /* ங never carries a vowel. The vowel of this cell sits on the க
           that ங் always precedes, so the cell shows that cluster and a word
           containing it. Where no everyday word exists, the cluster is
           still a sound — named the way a mei letter is, இங்கொ — which is
           a shape a voice can actually say. */
        var saying = c.word || c.onItsOwn || c.ch;
        h += '<td class="ta' + (c.cluster ? ' withword' : '')
           + (c.cluster && !c.word ? ' nonword' : '') + '" data-speak="'
           + esc(saying) + '" data-lang="ta"'
           + (c.cluster ? ' title="' + esc(c.cluster) + ' — '
               + esc(c.word ? c.wordR + ' — ' + c.wordEn
                            : c.onItsOwnR + ', said on its own') + '"' : '')
           + '>' + esc(c.ch)
           + '<span class="say">' + esc(c.say) + '</span>'
           + (c.cluster
              ? '<span class="cluster ta">' + esc(c.cluster) + '</span>'
                + (c.word
                   ? (c.wordPic ? '<span class="wpic">' + c.wordPic + '</span>' : '')
                     + '<span class="inword ta">' + esc(c.word) + '</span>'
                     + '<span class="r">' + esc(c.wordEn) + '</span>'
                   : '<span class="inword ta">' + esc(c.onItsOwn) + '</span>'
                     + '<span class="say">' + esc(c.onItsOwnR) + '</span>'
                     + '<span class="r">' + esc(c.wordEn) + '</span>')
              : '<span class="r">' + esc(c.r) + '</span>')
           + '</td>';
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
          return '<div class="alpha-cell"' + sayPair(v, 'hi', v.ch) + '>'
            + '<div class="ch hi">' + esc(v.ch) + '</div>'
            + alphaSay(v)
            + '<div class="r">' + esc(v.r) + ' · <span class="ta">' + esc(v.ta) + '</span></div>'
            + '<div class="alpha-en">' + esc(v.en) + '</div>'
            + alphaPic(v) + alphaWord(v, 'hi') + '</div>';
        }) + '</div>';

    A.rows.forEach(function (row) {
      h += '<div class="card"><h3>' + esc(row.name) + '</h3>'
        + cellGrid(row.items, function (c) {
            return '<div class="alpha-cell' + (c.hard ? ' hard' : (c.asp ? ' asp' : '')) + '"'
              + sayPair(c, 'hi', c.ch) + '>'
              + '<div class="ch hi">' + esc(c.ch) + '</div>'
              + alphaSay(c)
              + '<div class="r">' + esc(c.r) + ' · <span class="ta">' + esc(c.ta) + '</span></div>'
              + '<div class="alpha-en">' + esc(c.en) + '</div>'
              + alphaPic(c) + alphaWord(c, 'hi') + '</div>';
          })
        + '<div class="tiny muted mt">Red border = sound not in Tamil · amber = aspirated</div></div>';
    });

    h += '<div class="card"><h3>Barahkhadi — matra table</h3>'
      + '<div class="card-sub">Each consonant with 11 vowel signs</div>'
      /* kā, kī, kū are not readings. But written readably the retroflex
         and dental pairs collide — ट and त both become "ta" — so every
         cell keeps the scholarly form underneath, which is what tells them
         apart, and the legend says how. */
      + '<div class="grid-legend">'
      +   '<b>Curled back</b> (tongue on the roof of the mouth): '
      +   'ट ṭa · ठ ṭha · ड ḍa · ढ ḍha · ण ṇa'
      +   '<br><b>On the teeth:</b> त ta · थ tha · द da · ध dha · न na'
      +   '<br>They read the same in English letters and are different letters. '
      +   'The small mark under each cell is what separates them.'
      + '</div>'
      + '<div class="matrix"><table><thead><tr><th></th>';
    A.grid[0].cells.forEach(function (c) {
      h += '<th class="hi">' + esc(c.vowel) + '</th>';
    });
    h += '</tr></thead><tbody>';
    A.grid.forEach(function (row) {
      h += '<tr><td class="rowhead hi">' + esc(row.base)
         + '<span class="r">' + esc(row.r) + '</span></td>';
      row.cells.forEach(function (c) {
        h += '<td class="hi" data-speak="' + esc(c.ch) + '" data-lang="hi">' + esc(c.ch)
           + '<span class="say">' + esc(c.say) + '</span>'
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
      /* The same card as the other two alphabets: the letter, a word a
         child knows, a picture of it, and the meaning in all three. This
         one had an IPA symbol and nothing else, on the page a child is
         most likely to open first. */
      h += '<div class="wcard alpha-cell"' + sayPair(l, 'en', l.ch) + '>'
        + '<div class="row"><div style="font-size:calc(26px * var(--fs,1));font-weight:700">' + esc(l.ch) + ' ' + esc(l.low) + '</div>'
        + '<div class="spacer" style="flex:1"></div>'
        + '<span class="chip' + (l.type === 'vowel' ? ' accent' : (l.type === 'semi-vowel' ? ' amber' : '')) + '">'
        + (l.type === 'vowel' ? 'vowel' : (l.type === 'semi-vowel' ? 'semi' : 'consonant')) + '</span></div>'
        + '<div class="small ta">Name: ' + esc(l.name) + '</div>'
        + '<div class="tiny" style="color:var(--teal)">' + esc(l.sounds.join(' · ')) + '</div>'
        + '<div class="tiny muted ta">Tamil sound: ' + esc(l.ta) + '</div>'
        + alphaPic(l) + alphaWord(l, 'en') + '</div>';
    });
    return h + '</div></div>';
  }

  /* ============================================================= PHONICS */
  V.phonics = {
    title: 'Sounds', sub: '44 English sounds · 52 Hindi · 61 Tamil — each with a word to hear it in',
    html: function (param) {
      var which = param || 'en';
      var P = TB.PHONICS[which];
      var h = '<div class="view"><div class="card"><div class="pill-row">'
        + '<a class="pill' + (which === 'en' ? ' on' : '') + '" href="#/phonics/en">English (44)</a>'
        + '<a class="pill' + (which === 'hi' ? ' on' : '') + '" href="#/phonics/hi">Hindi</a>'
        + '<a class="pill' + (which === 'ta' ? ' on' : '') + '" href="#/phonics/ta">Tamil (247)</a>'
        + '</div></div>';

      P.groups.forEach(function (g, gi) {
        /* Forty-four sounds, or sixty-one, is a lesson in groups — not one
           list. The first group is open; the rest are a line each. */
        h += '<details class="card fold"' + (gi === 0 ? ' open' : '') + '>'
          + '<summary class="fold-head"><div><h3>' + esc(g.name.ta) + '</h3>'
          + '<div class="card-sub">' + esc(g.name.en) + '</div></div>'
          + '<span class="chip">' + g.items.length + '</span></summary>';
        h += '<div class="grid gauto">';
        g.items.forEach(function (it) {
          var sp = it.ex || it.hi || it.ta;
          var spLang = which === 'en' ? 'en' : which;
          h += '<div class="wcard' + (it.hard ? '' : '') + '" data-speak="' + esc(sp) + '" data-lang="' + spLang + '">';
          if (it.ipa) {
            h += '<div class="row"><span class="mono" style="font-size:calc(18px * var(--fs,1));color:var(--teal)">' + esc(it.ipa) + '</span>'
              + '<div class="spacer" style="flex:1"></div>'
              + (it.hard ? '<span class="chip red">not in Tamil</span>' : '') + '</div>'
              + '<div style="font-size:calc(17px * var(--fs,1));font-weight:650;margin-top:3px">' + esc(it.ex) + '</div>'
              + '<div class="small ta">' + esc(it.exTa) + '  ·  Tamil sound: ' + esc(it.ta) + '</div>';
          } else {
            h += '<div class="row"><span class="' + which + '" style="font-size:calc(24px * var(--fs,1));font-weight:700">' + esc(it.hi || it.ta) + '</span>'
              + '<div class="spacer" style="flex:1"></div>'
              + (it.hard ? '<span class="chip red">new sound</span>' : (it.asp ? '<span class="chip amber">aspirated</span>' : '')) + '</div>'
              + '<div class="small">' + esc(it.hiR || it.taR || '') + (it.ta && it.hi ? ' · ' + esc(it.ta) : '') + '</div>'
              /* A sound on its own teaches nothing. A word you already know,
                 with the sound in it, teaches it in one go. */
              + (it.ex
                 ? '<div class="ph-ex"><span class="' + which + '">' + esc(it.ex) + '</span>'
                   + speak(it.ex, which)
                   + (it.exR ? '<span class="ph-ex-r">' + esc(it.exR) + '</span>' : '')
                   + (it.exEn ? '<span class="ph-ex-en">' + esc(it.exEn) + '</span>' : '')
                   + '</div>'
                 : '');
          }
          if (it.note) h += '<div class="tiny muted ta" style="margin-top:4px">' + esc(it.note) + '</div>';
          h += '</div>';
        });
        h += '</div></details>';
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

        /* One word's card. Built when its theme is opened, not before. */
        function wordCard(w) {
          /* English and Hindi lead; Tamil sits underneath as the reading aid */
          return '<div class="wcard">'
            + '<div class="row"><div class="w-en">' + esc(w.en) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.en, 'en') + '</div>'
            + '<div class="w-ipa">' + esc(w.enIpa || '') + ' · ' + esc(w.enTa || '') + '</div>'
            + '<div class="row" style="margin-top:7px"><div class="w-hi">' + esc(w.hi) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.hi, 'hi') + '</div>'
            + V.hiRead(w.hi, w.hiR, w.hiTa)
            + '<div class="w-gloss">' + esc(w.ta) + speak(w.ta, 'ta')
            + '<span class="w-r"> ' + esc(w.taR) + '</span></div>'
            + (w.tip ? '<div class="tiny muted" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line-soft)">💡 ' + esc(w.tip) + '</div>' : '')
            + '</div>';
        }

        var h = '';
        /* Three thousand words in one column meant scrolling past ten themes
           to reach the eleventh. Shut, the page is the list of themes — and
           now it is only the list of themes: building all three thousand
           every time came to 49,004 nodes and 2.27MB, on a page whose job
           at that moment is to show forty-nine headings. <details> renders
           its children whether or not it is open, so folding them hid the
           cost without removing it. */
        var keys = Object.keys(byTheme);
        /* Searching opens everything that matched. "water" used to match
           nine themes and show four cards, with the rest folded away. */
        var open1 = !!q;
        keys.forEach(function (th, gi) {
          var isOpen = open1 || gi === 0;
          h += '<details class="card fold" data-theme="' + esc(th) + '"'
             + (isOpen ? ' open' : '') + '>'
             + '<summary class="fold-head"><div><h3>' + esc(themeName(th)) + '</h3></div>'
             + '<span class="chip">' + byTheme[th].length + '</span></summary>'
             + '<div class="grid gauto" data-words>'
             + (isOpen ? byTheme[th].map(wordCard).join('') : '')
             + '</div></details>';
        });
        el.innerHTML = h;

        /* Fill a theme the first time it is opened. */
        el.querySelectorAll('details[data-theme]').forEach(function (d) {
          d.addEventListener('toggle', function () {
            if (!d.open) return;
            var box = d.querySelector('[data-words]');
            if (!box || box.firstChild) return;
            box.innerHTML = (byTheme[d.getAttribute('data-theme')] || []).map(wordCard).join('');
          });
        });
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
        /* Not every language has a voice to install. Windows ships one for
           Hindi and none for Tamil, so telling somebody to go and install
           it sends them looking for something that is not there. */
        if (!vs.length) return '<option value="">— read over the internet —</option>';
        return '<option value="">Automatic</option>' + vs.map(function (v) {
          return '<option value="' + esc(v.name) + '"' + (v.name === sel ? ' selected' : '') + '>' + esc(v.name) + ' (' + esc(v.lang) + ')</option>';
        }).join('');
      }
      var missing = ['ta', 'en', 'hi'].filter(function (l) { return TB.Speech.missing(l); });
      var missingNames = missing.map(function (l) { return TB.Translate.langName(l); });

      return '<div class="view">'

      + '<div class="card"><h3>Account</h3>'
      +   '<div class="field"><label for="sName">Name</label>'
      +     '<input id="sName" value="' + esc(u.name || '') + '"></div>'
      /* A legacy account made with a number has no address to show; leaving
         the box empty invites one rather than offering back a value that can
         no longer be saved. */
      +   '<div class="field"><label>Email address</label><input id="sId" type="email" '
      +   'placeholder="name@mail.com" value="' + esc(u.email || '') + '"></div>'
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

      + (function () {
          /* An account made with a phone number has nowhere for a reset
             link to go. Saying so here, where it can be fixed, is the whole
             point of the card. */
          var u = TB.Auth.user() || {};
          var has = !!u.email;
          return '<div class="card"><h3>Getting back in</h3>'
            + (has
                ? '<div class="card-sub">If you forget your password, a reset link goes to '
                  + '<b>' + esc(u.email) + '</b>.</div>'
                : '<div class="msg msg-warn"><b>There is no way back into this account.</b> '
                  + 'It was made with a number, and a password can only be reset by email. '
                  + 'Add an address below and that is fixed.</div>')
            + '<div class="row mt"><input id="sRecEmail" type="email" autocomplete="email" '
            + 'placeholder="name@mail.com" value="' + esc(u.email || '') + '" style="max-width:240px">'
            + '<input id="sRecPw" type="password" autocomplete="current-password" '
            + 'placeholder="Your password" style="max-width:190px">'
            + '<button class="btn btn-sm btn-primary" id="sRecSave" type="button">'
            + (has ? 'Change it' : 'Add it') + '</button></div>'
            + '<div id="sRecMsg"></div></div>';
        })()

      + '<div class="card"><h3>Data</h3>'
      +   '<div class="row"><button class="btn btn-sm" id="sExport" type="button">⬇ Download everything</button>'
      +   '<button class="btn btn-sm" id="sImportBtn" type="button">⬆ Restore</button>'
      +   '<input id="sImport" type="file" accept="application/json" style="display:none"></div>'
      +   '<div class="tiny muted mt">Your data lives in this browser, and on the server too if sync is on. '
      +   'Clearing browser data deletes the local copy — download a backup now and then.</div>'
      +   '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-soft)">'
      +   '<div class="tiny muted mb">Deleting removes your account and everything in it, here and on the server. '
      +   'It cannot be undone.</div>'
      +   '<div class="row"><input id="sDelPw" type="password" autocomplete="current-password" '
      +   'placeholder="Your password" style="max-width:220px">'
      +   '<button class="btn btn-sm" id="sDelete" type="button" style="border-color:var(--red);color:var(--red)">Delete account</button></div>'
      +   '<div id="sDelMsg"></div></div>'
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

      root.querySelector('#sRecSave').addEventListener('click', function () {
        var email = root.querySelector('#sRecEmail').value.trim();
        var pw = root.querySelector('#sRecPw').value;
        var out = root.querySelector('#sRecMsg');
        var btn = root.querySelector('#sRecSave');
        out.innerHTML = '';

        if (!TB.Auth.isEmail(email)) {
          out.innerHTML = '<div class="msg msg-err mt">That does not look like an email address.</div>';
          return;
        }
        if (!TB.Sync.configured() || !TB.Sync.hasToken()) {
          out.innerHTML = '<div class="msg msg-info mt">This account is only on this device, so '
            + 'there is no server to send a reset link from. Turn on Sync above first.</div>';
          return;
        }
        if (!pw) {
          out.innerHTML = '<div class="msg msg-err mt">Type your password to confirm.</div>';
          return;
        }

        var label = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = '<span class="spin"></span> Saving\u2026';
        TB.Sync.setEmail(pw, email).then(function (remote) {
          /* keep the copy on this device in step; it takes (name, identifier) */
          TB.Auth.updateProfile('', remote.email).catch(function () {});
          btn.disabled = false; btn.textContent = label;
          root.querySelector('#sRecPw').value = '';
          out.innerHTML = '<div class="msg msg-ok mt">Saved. If you forget your password, the '
            + 'reset link will go to ' + esc(remote.email) + '.</div>';
          TB.App.paintUser();
        }).catch(function (err) {
          btn.disabled = false; btn.textContent = label;
          out.innerHTML = '<div class="msg msg-err mt">' + esc(err.message) + '</div>';
        });
      });

      root.querySelector('#sDelete').addEventListener('click', function () {
        var pwBox = root.querySelector('#sDelPw');
        var out = root.querySelector('#sDelMsg');
        var pw = pwBox.value;
        out.innerHTML = '';

        var onServer = TB.Sync.configured() && TB.Sync.hasToken();
        if (onServer && !pw) {
          out.innerHTML = '<div class="msg msg-err mt">Type your password to confirm.</div>';
          pwBox.focus();
          return;
        }

        TB.App.confirm('Delete account?',
          onServer
            ? 'Your account, your history and all your progress will be erased from this device '
              + 'and from the server. This cannot be undone.'
            : 'Your history and all progress on this device will be permanently erased. '
              + 'This cannot be undone.',
          function () {
            /* The server goes first: if it refuses, the local copy is still
               there and the person has lost nothing. */
            var step = onServer ? TB.Sync.deleteAccount(pw) : Promise.resolve();
            step.then(function () {
              TB.Auth.deleteAccount();
              location.reload();
            }).catch(function (err) {
              out.innerHTML = '<div class="msg msg-err mt">' + esc(err.message)
                + ' Nothing has been deleted.</div>';
            });
          });
      });
    }
  };
})();
