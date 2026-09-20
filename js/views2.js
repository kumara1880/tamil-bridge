/* Tamil Bridge — remaining views: lessons, practice, photo, pronunciation,
   alphabet, phonics, vocabulary, history and settings.                       */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speak, tappable = V.tappable, ago = V.ago;
  var themeName = V.themeName, langLabel = V.langLabel, D = V.D, saveD = V.saveD;

  /* =============================================================== LEARN */
  V.learn = {
    title: 'பாடங்கள்', sub: 'படிப்படியாக ஆங்கிலம் & இந்தி',
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
          + (p.done ? '<span class="chip green">✓ முடிந்தது' + (p.score != null ? ' · ' + p.score + '%' : '') + '</span>' : '')
          + '</div>'
          + '<h3>' + esc(u.title.ta) + '</h3>'
          + '<div class="card-sub">' + esc(u.title.en) + '</div>'
          + '<div class="small muted">' + esc(u.goal) + '</div>'
          + '<div class="tiny muted mt">' + u.lines.length + ' வாக்கியங்கள் · ' + u.quiz.length + ' கேள்விகள்</div>'
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
          btn.textContent = '⏹ நிறுத்து';
          var run = TB.Speech.sequence(steps, { rate: d.prefs.rate, pitch: d.prefs.pitch });
          btn.onclick = function () { run.cancel(); done(); };
          run.then(done);
          function done() { btn.textContent = '🔊 முழுப் பாடத்தையும் கேள்'; btn.onclick = null; TB.App.render(); }
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
            why.innerHTML = (correct ? '✓ சரி. ' : '✗ தவறு. ') + esc(q.why);
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
          box.textContent = 'மதிப்பெண்: ' + score + '% (' + right + '/' + u.quiz.length + ')'
            + (first ? ' · +20 XP' : '');
        }
      }
    }
  };

  function lessonHtml(u, d) {
    var h = '<div class="view">';
    h += '<div class="card"><div class="card-head"><div>'
       + '<h3 style="font-size:19px">' + esc(u.title.ta) + '</h3>'
       + '<div class="card-sub">' + esc(u.title.en) + '</div></div>'
       + '<div class="spacer"></div><a class="btn btn-sm" href="#/learn">← அனைத்தும்</a></div>'
       + '<p class="small">' + esc(u.goal) + '</p>'
       + '<div class="explain">' + u.grammar.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</div>'
       + '<button class="btn btn-primary mt" id="playAll" type="button">🔊 முழுப் பாடத்தையும் கேள்</button>'
       + '</div>';

    h += '<div class="card"><h3>வாக்கியங்கள்</h3><div class="card-sub">ஒவ்வொன்றையும் கேட்டு, சொல்லிப் பாருங்கள்</div>';
    u.lines.forEach(function (l, i) {
      h += '<div style="padding:12px 0;border-top:1px solid var(--line-soft)">';
      h += '<div class="ta" style="font-size:17px">' + tappable(l.ta, 'ta') + speak(l.ta, 'ta') + '</div>';
      h += '<div style="font-size:17px;font-weight:600;margin-top:3px">' + tappable(l.en, 'en') + speak(l.en, 'en') + '</div>';
      h += '<div class="hi" style="font-size:17px;margin-top:2px">' + tappable(l.hi, 'hi') + speak(l.hi, 'hi') + '</div>';
      if (l.gloss && l.gloss.length) {
        h += '<div class="tok-line" style="margin:8px 0 0">';
        l.gloss.forEach(function (g) {
          h += '<div class="tok"><div class="t-w ta" style="font-size:13px">' + esc(g[0]) + '</div>'
             + '<div class="t-m" style="font-family:var(--ui)">' + esc(g[1]) + '</div>'
             + '<div class="t-p hi">' + esc(g[2]) + '</div></div>';
        });
        h += '</div>';
      }
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="card"><h3>சிறு தேர்வு</h3><div class="card-sub">' + u.quiz.length + ' கேள்விகள் · +20 XP</div>';
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
    title: 'பயிற்சி', sub: 'இடைவெளி மீள்பார்வை (spaced repetition)',
    html: function () {
      var d = D();
      var c = TB.SRS.counts(d.srs, TB.VOCAB);
      return '<div class="view">'
        + '<div class="grid g4 mb">'
        + '<div class="stat blue"><div class="n">' + c.due + '</div><div class="l">இன்று தயார்</div></div>'
        + '<div class="stat green"><div class="n">' + c.learned + '</div><div class="l">கற்றவை</div></div>'
        + '<div class="stat"><div class="n">' + c.fresh + '</div><div class="l">புதியவை</div></div>'
        + '<div class="stat accent"><div class="n">' + c.total + '</div><div class="l">மொத்தம்</div></div>'
        + '</div>'
        + '<div class="card"><div class="row">'
        +   '<span class="small muted">கேள்வி மொழி:</span>'
        +   '<div class="pill-row" id="dirPills">'
        +     '<button class="pill on" data-dir="ta2en" type="button">தமிழ் → English</button>'
        +     '<button class="pill" data-dir="en2ta" type="button">English → தமிழ்</button>'
        +     '<button class="pill" data-dir="ta2hi" type="button">தமிழ் → हिंदी</button>'
        +     '<button class="pill" data-dir="hi2ta" type="button">हिंदी → தமிழ்</button>'
        +   '</div></div></div>'
        + '<div id="pArea"></div></div>';
    },
    mount: function (root) {
      var dir = 'ta2en';
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
          area.innerHTML = '<div class="empty"><div class="big">🎉</div>இன்றைக்கு எல்லாம் முடிந்தது!<br>'
            + '<span class="small">நாளை மீண்டும் வாருங்கள்.</span></div>';
          return;
        }
        if (idx >= queue.length) {
          area.innerHTML = '<div class="card center"><div style="font-size:34px">✅</div>'
            + '<h3>சுற்று முடிந்தது</h3><div class="muted">' + correct + '/' + queue.length + ' சரி</div>'
            + '<button class="btn btn-primary mt" id="again" type="button">மீண்டும்</button></div>';
          area.querySelector('#again').addEventListener('click', start);
          return;
        }

        var w = queue[idx];
        var pair = {
          ta2en: ['ta', 'en'], en2ta: ['en', 'ta'], ta2hi: ['ta', 'hi'], hi2ta: ['hi', 'ta']
        }[dir];
        var qLang = pair[0], aLang = pair[1];
        var q = w[qLang], a = w[aLang];

        area.innerHTML = ''
          + '<div class="bar mb"><i style="width:' + Math.round((idx / queue.length) * 100) + '%"></i></div>'
          + '<div class="flash">'
          +   '<div class="tiny muted">' + langLabel(qLang) + ' → ' + langLabel(aLang) + '</div>'
          +   '<div class="prompt ' + qLang + '">' + esc(q) + speak(q, qLang) + '</div>'
          +   (qLang === 'ta' ? '<div class="tiny muted"><i>' + esc(w.taR) + '</i></div>' : '')
          +   (qLang === 'en' && w.enIpa ? '<div class="tiny" style="color:var(--teal)">' + esc(w.enIpa) + '</div>' : '')
          +   (shown
              ? '<div class="answer ' + aLang + '">' + esc(a) + speak(a, aLang) + '</div>'
                + '<div class="tiny muted">' + esc(aLang === 'ta' ? w.taR : (aLang === 'hi' ? w.hiR + ' · ' + (w.hiTa || '') : (w.enIpa || '') + ' · ' + (w.enTa || ''))) + '</div>'
                + (w.tip ? '<div class="explain tip" style="text-align:left">' + esc(w.tip) + '</div>' : '')
              : '<div style="height:40px"></div>')
          + '</div>'
          + (shown
              ? '<div class="rate-row">'
                + '<button class="btn" data-r="0" type="button">😕 மறந்தேன்</button>'
                + '<button class="btn" data-r="1" type="button">😐 கடினம்</button>'
                + '<button class="btn" data-r="2" type="button">🙂 சரி</button>'
                + '<button class="btn btn-primary" data-r="3" type="button">😃 எளிது</button></div>'
              : '<button class="btn btn-primary btn-wide mt" id="reveal" type="button">பதிலைக் காட்டு (Space)</button>')
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
    title: 'படம் மொழிபெயர்ப்பு', sub: 'புகைப்படத்தில் உள்ள எழுத்தைப் படித்து மொழிபெயர்க்கும்',
    html: function () {
      var packs = Object.keys(TB.OCR.PACKS).map(function (p) {
        return '<option value="' + p + '"' + (p === 'eng' ? ' selected' : '') + '>' + esc(TB.OCR.PACKS[p].ta) + ' (' + esc(TB.OCR.PACKS[p].en) + ')</option>';
      }).join('');
      var targets = TB.Translate.LANGS.filter(function (l) { return l.c !== 'auto'; })
        .map(function (l) { return '<option value="' + l.c + '"' + (l.c === 'ta' ? ' selected' : '') + '>' + esc(l.n) + ' · ' + esc(l.ta) + '</option>'; }).join('');

      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="grid g2 mb">'
        +     '<div class="field" style="margin:0"><label>படத்தில் உள்ள மொழி</label><select id="ocrLang" multiple size="5">' + packs + '</select>'
        +       '<div class="hint">Ctrl அழுத்தி ஒன்றுக்கு மேற்பட்டவை தேர்வு செய்யலாம்.</div></div>'
        +     '<div class="field" style="margin:0"><label>எந்த மொழிக்கு மொழிபெயர்க்க?</label><select id="ocrTarget">' + targets + '</select></div>'
        +   '</div>'
        +   '<div class="drop" id="drop">'
        +     '<div style="font-size:34px">📷</div>'
        +     '<div style="font-weight:650;margin-top:6px">படத்தைத் தேர்ந்தெடுக்கவும் அல்லது இங்கே இழுத்து விடவும்</div>'
        +     '<div class="tiny muted">JPG · PNG · WEBP — கேமராவிலிருந்தும் எடுக்கலாம்</div>'
        +     '<input id="file" type="file" accept="image/*" capture="environment" style="display:none">'
        +   '</div>'
        +   '<div id="ocrProg" style="display:none;margin-top:12px"><div class="bar"><i id="ocrBar" style="width:0"></i></div>'
        +     '<div class="tiny muted mt" id="ocrStat"></div></div>'
        + '</div>'
        + '<div id="ocrOut"></div>'
        + '<div class="tiny muted">முதல் முறை பயன்படுத்தும்போது மொழிக் கோப்புகள் பதிவிறக்கப்படும் (இணையம் தேவை). '
        + 'கருவி: Tesseract.js — திறந்த மூல, இலவசம்.</div>'
        + '</div>';
    },
    mount: function (root) {
      var drop = root.querySelector('#drop'), file = root.querySelector('#file');
      var out = root.querySelector('#ocrOut');

      drop.addEventListener('click', function () { file.click(); });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
      });
      drop.addEventListener('drop', function (e) {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);
      });
      file.addEventListener('change', function () { if (file.files[0]) handle(file.files[0]); });

      function handle(f) {
        if (!/^image\//.test(f.type)) { TB.App.toast('படக் கோப்பு மட்டும்.', 'err'); return; }
        var langs = Array.prototype.slice.call(root.querySelector('#ocrLang').selectedOptions).map(function (o) { return o.value; });
        if (!langs.length) langs = ['eng'];
        var target = root.querySelector('#ocrTarget').value;

        var prog = root.querySelector('#ocrProg');
        prog.style.display = '';
        out.innerHTML = '';

        TB.OCR.read(f, langs, function (label, pct) {
          root.querySelector('#ocrBar').style.width = pct + '%';
          root.querySelector('#ocrStat').textContent = label + ' ' + pct + '%';
        }).then(function (res) {
          prog.style.display = 'none';
          if (!res.text) {
            out.innerHTML = '<div class="card"><div class="msg msg-warn">எழுத்து எதுவும் கண்டறியப்படவில்லை. '
              + 'தெளிவான, நேராக எடுத்த படத்தை முயற்சிக்கவும்.</div></div>';
            return;
          }
          var srcLang = TB.OCR.packToLang(langs[0]);
          out.innerHTML = '<div class="card"><div class="card-head"><div><h3>படித்த எழுத்து</h3>'
            + '<div class="card-sub">நம்பகத்தன்மை ' + res.confidence + '% · ' + res.lines.length + ' வரிகள்</div></div>'
            + '<div class="spacer"></div>' + speak(res.text, srcLang) + '</div>'
            + '<div class="diffbox" style="white-space:pre-wrap">' + tappable(res.text, srcLang) + '</div>'
            + '<div class="row mt"><button class="btn btn-sm" id="ocrCopy" type="button">நகலெடு</button>'
            + '<button class="btn btn-sm" id="ocrTutor" type="button">🧠 விளக்கம்</button></div></div>'
            + '<div class="card"><div class="card-head"><div><h3>மொழிபெயர்ப்பு — ' + esc(TB.Translate.langNameTa(target)) + '</h3></div>'
            + '<div class="spacer"></div><span id="ocrTrSpeak"></span></div>'
            + '<div class="diffbox" id="ocrTr"><span class="spin"></span></div></div>';

          out.querySelector('#ocrCopy').addEventListener('click', function () {
            navigator.clipboard && navigator.clipboard.writeText(res.text);
            TB.App.toast('நகலெடுக்கப்பட்டது', 'ok');
          });
          out.querySelector('#ocrTutor').addEventListener('click', function () {
            TB.App.pending = { text: res.lines[0] ? res.lines[0].text : res.text };
            location.hash = '#/tutor';
          });

          TB.Translate.translate(res.text, srcLang, target).then(function (r) {
            out.querySelector('#ocrTr').innerHTML = tappable(r.text, target);
            out.querySelector('#ocrTrSpeak').innerHTML = speak(r.text, target);
            TB.Store.addHistory(TB.Auth.userId(), {
              type: 'ocr', from: srcLang, to: target,
              src: res.text.slice(0, 400), out: r.text.slice(0, 400)
            });
            TB.App.refreshChips();
          }).catch(function (e) {
            out.querySelector('#ocrTr').innerHTML = '<span style="color:var(--red)">' + esc(e.message) + '</span>';
          });
        }).catch(function (e) {
          prog.style.display = 'none';
          out.innerHTML = '<div class="card"><div class="msg msg-err">' + esc(e.message) + '</div></div>';
        });
      }
    }
  };

  /* =============================================================== SPEAK */
  V.speak = {
    title: 'உச்சரிப்புப் பயிற்சி', sub: 'பேசுங்கள் — மதிப்பெண் பெறுங்கள்',
    html: function () {
      var pool = TB.LESSONS.reduce(function (acc, u) { return acc.concat(u.lines); }, []);
      var w = TB.VOCAB[Math.floor(Math.random() * TB.VOCAB.length)];
      return '<div class="view">'
        + '<div class="card"><div class="row">'
        +   '<span class="small muted">பயிற்சி மொழி:</span>'
        +   '<div class="pill-row" id="spLang">'
        +     '<button class="pill on" data-l="en" type="button">English</button>'
        +     '<button class="pill" data-l="hi" type="button">हिंदी</button>'
        +     '<button class="pill" data-l="ta" type="button">தமிழ்</button>'
        +   '</div><div class="spacer" style="flex:1"></div>'
        +   '<div class="pill-row" id="spMode">'
        +     '<button class="pill on" data-m="word" type="button">சொல்</button>'
        +     '<button class="pill" data-m="sentence" type="button">வாக்கியம்</button>'
        +   '</div></div></div>'
        + '<div id="spArea"></div>'
        + (TB.Speech.recognitionSupported() ? ''
           : '<div class="msg msg-warn">இந்த உலாவியில் குரல் அங்கீகாரம் இல்லை. Chrome அல்லது Edge பயன்படுத்தினால் மதிப்பெண் கிடைக்கும். ஒலிக் கேட்பது இங்கேயும் வேலை செய்யும்.</div>')
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
          + '<div class="tiny muted">இதைச் சொல்லுங்கள்</div>'
          + '<div class="' + lang + '" style="font-size:28px;font-weight:700;margin:8px 0">' + esc(target) + speak(target, lang) + '</div>'
          + '<div class="small muted mb">' + esc(hint) + '</div>'
          + '<button class="mic-btn" id="mic" type="button">🎤</button>'
          + '<div class="tiny muted mt" id="micHint">மைக்கை அழுத்தி பேசுங்கள்</div>'
          + (result ? resultHtml(result) : '')
          + '<div class="row center mt" style="justify-content:center">'
          +   '<button class="btn btn-sm" id="slow" type="button">🐢 மெதுவாகக் கேள்</button>'
          +   '<button class="btn btn-sm" id="next" type="button">அடுத்தது →</button>'
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
          + '<div class="tiny muted mt">கேட்டது: “' + esc(r.heard || '—') + '”</div>'
          + '<div class="explain tip" style="text-align:left">' + esc(fb.ta) + '</div></div>';
      }

      function listen() {
        var mic = root.querySelector('#mic');
        var hintEl = root.querySelector('#micHint');
        mic.classList.add('live');
        hintEl.textContent = 'கேட்கிறது… பேசுங்கள்';
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
    title: 'எழுத்துகள்', sub: 'தமிழ் 247 · இந்தி வர்ணமாலா · ஆங்கிலம் 26',
    html: function (param) {
      var which = param || 'ta';
      var h = '<div class="view wide"><div class="card"><div class="pill-row">'
        + tab('ta', 'தமிழ் (247)') + tab('hi', 'हिंदी वर्णमाला') + tab('en', 'English A–Z')
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

    h += '<div class="card"><h3>உயிர் எழுத்து (12)</h3>'
      + cellGrid(A.vowels, function (v) {
          return '<div class="alpha-cell" data-speak="' + esc(v.ch) + '" data-lang="ta">'
            + '<div class="ch ta">' + esc(v.ch) + '</div><div class="r">' + esc(v.r) + '</div>'
            + '<div class="r">' + esc(v.kind) + '</div></div>';
        }) + '</div>';

    h += '<div class="card"><h3>மெய் எழுத்து (18)</h3>'
      + cellGrid(A.consonants, function (c) {
          return '<div class="alpha-cell" data-speak="' + esc(c.base) + '" data-lang="ta">'
            + '<div class="ch ta">' + esc(c.ch) + '</div><div class="r">' + esc(c.rr) + '</div>'
            + '<div class="r">' + esc(c.cls) + '</div></div>';
        })
      + '<div class="mt"><div class="alpha-cell" style="max-width:110px" data-speak="' + esc(A.aytham.ch) + '" data-lang="ta">'
      + '<div class="ch ta">' + esc(A.aytham.ch) + '</div><div class="r">' + esc(A.aytham.name) + '</div></div></div></div>';

    h += '<div class="card"><h3>உயிர்மெய் எழுத்து (216)</h3>'
      + '<div class="card-sub">18 மெய் × 12 உயிர் — எந்த எழுத்தையும் தட்டினால் ஒலிக்கும்</div><div class="matrix"><table><thead><tr><th></th>';
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

    h += '<div class="card"><h3>स्वर — உயிர் எழுத்து (13)</h3>'
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
        + '<div class="tiny muted mt">சிவப்பு விளிம்பு = தமிழில் இல்லாத ஒலி · மஞ்சள் = மூச்சொலி (aspirated)</div></div>';
    });

    h += '<div class="card"><h3>बारहखड़ी — மாத்திரை அட்டவணை</h3>'
      + '<div class="card-sub">ஒவ்வொரு மெய்யும் 11 உயிர்க் குறியீடுகளுடன்</div><div class="matrix"><table><thead><tr><th></th>';
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

    h += '<div class="card"><h3>அனைத்து எழுத்துகளும் (26)</h3><div class="grid gauto">';
    A.letters.forEach(function (l) {
      h += '<div class="wcard" data-speak="' + esc(l.ch) + '" data-lang="en">'
        + '<div class="row"><div style="font-size:26px;font-weight:700">' + esc(l.ch) + ' ' + esc(l.low) + '</div>'
        + '<div class="spacer" style="flex:1"></div>'
        + '<span class="chip' + (l.type === 'vowel' ? ' accent' : (l.type === 'semi-vowel' ? ' amber' : '')) + '">'
        + (l.type === 'vowel' ? 'உயிர்' : (l.type === 'semi-vowel' ? 'இடை' : 'மெய்')) + '</span></div>'
        + '<div class="small ta">பெயர்: ' + esc(l.name) + '</div>'
        + '<div class="tiny" style="color:var(--teal)">' + esc(l.sounds.join(' · ')) + '</div>'
        + '<div class="tiny muted ta">தமிழ் ஒலி: ' + esc(l.ta) + '</div></div>';
    });
    return h + '</div></div>';
  }

  /* ============================================================= PHONICS */
  V.phonics = {
    title: 'ஒலிகள்', sub: '44 ஆங்கில ஒலிகள் · இந்தி ஒலி வேறுபாடுகள்',
    html: function (param) {
      var which = param || 'en';
      var P = TB.PHONICS[which];
      var h = '<div class="view"><div class="card"><div class="pill-row">'
        + '<a class="pill' + (which === 'en' ? ' on' : '') + '" href="#/phonics/en">ஆங்கிலம் (44)</a>'
        + '<a class="pill' + (which === 'hi' ? ' on' : '') + '" href="#/phonics/hi">இந்தி</a>'
        + '<a class="pill' + (which === 'ta' ? ' on' : '') + '" href="#/phonics/ta">தமிழ்</a>'
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
              + (it.hard ? '<span class="chip red">தமிழில் இல்லை</span>' : '') + '</div>'
              + '<div style="font-size:17px;font-weight:650;margin-top:3px">' + esc(it.ex) + '</div>'
              + '<div class="small ta">' + esc(it.exTa) + '  ·  தமிழ் ஒலி: ' + esc(it.ta) + '</div>';
          } else {
            h += '<div class="row"><span class="' + which + '" style="font-size:24px;font-weight:700">' + esc(it.hi || it.ta) + '</span>'
              + '<div class="spacer" style="flex:1"></div>'
              + (it.hard ? '<span class="chip red">புதிய ஒலி</span>' : (it.asp ? '<span class="chip amber">மூச்சொலி</span>' : '')) + '</div>'
              + '<div class="small">' + esc(it.hiR || it.taR || '') + (it.ta && it.hi ? ' · ' + esc(it.ta) : '') + '</div>';
          }
          if (it.note) h += '<div class="tiny muted ta" style="margin-top:4px">' + esc(it.note) + '</div>';
          h += '</div>';
        });
        h += '</div></div>';
      });

      if (P.rules && P.rules.length) {
        h += '<div class="card"><h3>விதிகள்</h3>';
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
    title: 'சொற்கள்', sub: TB.VOCAB.length + ' சொற்கள் · 3 மொழிகளில்',
    html: function () {
      var themes = TB.THEMES.map(function (t) {
        return '<button class="pill" data-th="' + t.id + '" type="button">' + esc(t.ta) + '</button>';
      }).join('');
      return '<div class="view wide">'
        + '<div class="card"><div class="row mb">'
        +   '<input id="vSearch" type="text" placeholder="தேடு — தமிழ் / English / हिंदी" '
        +     'style="flex:1;min-width:190px;padding:10px 13px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +   '<button class="btn btn-sm" id="vSpeakAll" type="button">🔊 அனைத்தையும் கேள்</button>'
        + '</div>'
        + '<div class="pill-row"><button class="pill on" data-th="" type="button">அனைத்தும்</button>' + themes + '</div></div>'
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
        if (!list.length) { el.innerHTML = '<div class="empty">எதுவும் கிடைக்கவில்லை.</div>'; return; }

        var byTheme = {};
        list.forEach(function (w) { (byTheme[w.th] = byTheme[w.th] || []).push(w); });

        var h = '';
        Object.keys(byTheme).forEach(function (th) {
          h += '<div class="card"><h3>' + esc(themeName(th)) + '</h3><div class="grid gauto">';
          byTheme[th].forEach(function (w) {
            h += '<div class="wcard">'
              + '<div class="row"><div class="w-ta">' + esc(w.ta) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.ta, 'ta') + '</div>'
              + '<div class="w-r">' + esc(w.taR) + '</div>'
              + '<div class="row"><div class="w-en">' + esc(w.en) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.en, 'en') + '</div>'
              + '<div class="w-ipa">' + esc(w.enIpa || '') + ' · <span class="ta">' + esc(w.enTa || '') + '</span></div>'
              + '<div class="row"><div class="w-hi">' + esc(w.hi) + '</div><div class="spacer" style="flex:1"></div>' + speak(w.hi, 'hi') + '</div>'
              + '<div class="w-r">' + esc(w.hiR) + ' · <span class="ta">' + esc(w.hiTa || '') + '</span></div>'
              + (w.tip ? '<div class="tiny muted ta" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line-soft)">💡 ' + esc(w.tip) + '</div>' : '')
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
        btn.textContent = '⏹ நிறுத்து';
        var run = TB.Speech.sequence(steps, { rate: D().prefs.rate });
        btn.onclick = function () { run.cancel(); TB.App.render(); };
        run.then(function () { TB.App.render(); });
      });
      draw();
    }
  };

  /* ============================================================= HISTORY */
  V.history = {
    title: 'வரலாறு', sub: 'உங்கள் அனைத்து செயல்பாடுகளும்',
    html: function () {
      var d = D();
      var types = [
        ['', 'அனைத்தும்'], ['translate', 'மொழிபெயர்ப்பு'], ['meaning', 'அர்த்தம்'],
        ['tutor', 'விளக்கம்'], ['check', 'திருத்தம்'], ['ocr', 'படம்'], ['speak', 'உச்சரிப்பு']
      ].map(function (t, i) {
        return '<button class="pill' + (i === 0 ? ' on' : '') + '" data-ht="' + t[0] + '" type="button">' + t[1] + '</button>';
      }).join('');

      return '<div class="view">'
        + '<div class="card"><div class="row mb">'
        +   '<input id="hSearch" type="text" placeholder="வரலாற்றில் தேடு" style="flex:1;min-width:180px;padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +   '<button class="btn btn-sm" id="hExport" type="button">⬇ பதிவிறக்கு</button>'
        +   '<button class="btn btn-sm" id="hClear" type="button">அனைத்தையும் அழி</button>'
        + '</div><div class="pill-row">' + types + '</div>'
        + '<div class="tiny muted mt">மொத்தம் ' + d.history.length + ' பதிவுகள் — இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்பட்டவை.</div></div>'
        + '<div id="hList"></div></div>';
    },
    mount: function (root) {
      var type = '', q = '';
      var LABEL = {
        translate: ['மொழிபெயர்ப்பு', 'blue'], meaning: ['அர்த்தம்', 'accent'],
        tutor: ['விளக்கம்', 'green'], check: ['திருத்தம்', 'amber'],
        ocr: ['படம்', 'purple'], speak: ['உச்சரிப்பு', 'red']
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
          el.innerHTML = '<div class="empty"><div class="big">🕘</div>இன்னும் பதிவுகள் இல்லை.</div>';
          return;
        }
        el.innerHTML = list.slice(0, 300).map(function (h) {
          var lb = LABEL[h.type] || [h.type, ''];
          return '<div class="hist" data-id="' + esc(h.id) + '">'
            + '<div class="h-top"><span class="chip ' + lb[1] + '">' + esc(lb[0]) + '</span>'
            + '<span class="tiny muted">' + esc(TB.Translate.langNameTa(h.from)) + ' → ' + esc(h.to === 'multi' ? 'பல' : TB.Translate.langNameTa(h.to)) + '</span>'
            + '<span class="h-time">' + ago(h.ts) + '</span></div>'
            + '<div class="h-src">' + esc((h.src || '').slice(0, 220)) + '</div>'
            + '<div class="h-out">' + esc((h.out || '').slice(0, 220)) + '</div>'
            + '<div class="row mt"><button class="btn btn-sm btn-ghost" data-again="' + esc(h.id) + '" type="button">↻ மீண்டும்</button>'
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
        TB.App.confirm('அனைத்து வரலாற்றையும் அழிக்கவா?', 'இதை மீட்க முடியாது.', function () {
          TB.Store.clearHistory(TB.Auth.userId());
          TB.App.render();
          TB.App.toast('வரலாறு அழிக்கப்பட்டது', 'ok');
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
    title: 'அமைப்புகள்', sub: 'குரல், தீம், தரவு, ஒத்திசைவு',
    html: function () {
      var d = D();
      var u = TB.Auth.user() || {};
      function voiceOpts(lang, sel) {
        var vs = TB.Speech.voicesFor(lang);
        if (!vs.length) return '<option value="">— இந்த மொழிக்கு குரல் இல்லை —</option>';
        return '<option value="">தானாக</option>' + vs.map(function (v) {
          return '<option value="' + esc(v.name) + '"' + (v.name === sel ? ' selected' : '') + '>' + esc(v.name) + ' (' + esc(v.lang) + ')</option>';
        }).join('');
      }
      var missing = ['ta', 'en', 'hi'].filter(function (l) { return TB.Speech.missing(l); });

      return '<div class="view">'

      + '<div class="card"><h3>கணக்கு</h3>'
      +   '<div class="field"><label>பெயர்</label><input id="sName" value="' + esc(u.name || '') + '"></div>'
      +   '<div class="field"><label>மின்னஞ்சல் / தொலைபேசி</label><input id="sId" value="' + esc(u.email || u.phone || '') + '"></div>'
      +   '<button class="btn btn-sm" id="sSaveProfile" type="button">சேமி</button>'
      +   '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-soft)">'
      +   '<div class="tiny muted mb">கடவுச்சொல் மாற்று</div>'
      +   '<div class="grid g2"><input id="sOldPw" type="password" placeholder="பழைய கடவுச்சொல்" style="padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
      +   '<input id="sNewPw" type="password" placeholder="புதிய கடவுச்சொல்" style="padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)"></div>'
      +   '<button class="btn btn-sm mt" id="sChangePw" type="button">மாற்று</button></div>'
      + '</div>'

      + '<div class="card"><h3>குரல்</h3><div class="card-sub">உலாவியின் உள்ளமைந்த குரல்கள் — முற்றிலும் இலவசம்</div>'
      +   (missing.length ? '<div class="msg msg-warn">இந்தச் சாதனத்தில் '
          + missing.map(langLabel).join(', ') + ' குரல் நிறுவப்படவில்லை. '
          + 'Windows: Settings → Time &amp; language → Language &amp; region → மொழியைச் சேர்த்து "Speech" தேர்வு செய்யவும்.</div>' : '')
      +   '<div class="field"><label>வேகம் — <span id="rateVal">' + d.prefs.rate + '</span></label>'
      +     '<input id="sRate" type="range" min="0.4" max="1.3" step="0.05" value="' + d.prefs.rate + '"></div>'
      +   '<div class="field"><label>சுருதி — <span id="pitchVal">' + d.prefs.pitch + '</span></label>'
      +     '<input id="sPitch" type="range" min="0.6" max="1.6" step="0.05" value="' + d.prefs.pitch + '"></div>'
      +   '<div class="grid g3">'
      +     '<div class="field"><label>தமிழ் குரல்</label><select id="sVoiceTa">' + voiceOpts('ta', d.prefs.voiceTa) + '</select></div>'
      +     '<div class="field"><label>English voice</label><select id="sVoiceEn">' + voiceOpts('en', d.prefs.voiceEn) + '</select></div>'
      +     '<div class="field"><label>हिंदी आवाज़</label><select id="sVoiceHi">' + voiceOpts('hi', d.prefs.voiceHi) + '</select></div>'
      +   '</div>'
      +   '<label class="row small" style="cursor:pointer"><input id="sAuto" type="checkbox"' + (d.prefs.autoSpeak ? ' checked' : '') + ' style="width:auto"> பயிற்சியில் தானாக ஒலிக்கட்டும்</label>'
      +   '<div class="row mt"><button class="btn btn-sm" data-speak="வணக்கம், நான் உங்கள் ஆசிரியர்." data-lang="ta" type="button">தமிழ் சோதனை</button>'
      +   '<button class="btn btn-sm" data-speak="Hello, I am your teacher." data-lang="en" type="button">English test</button>'
      +   '<button class="btn btn-sm" data-speak="नमस्ते, मैं आपका शिक्षक हूँ।" data-lang="hi" type="button">हिंदी परीक्षण</button></div>'
      + '</div>'

      + '<div class="card"><h3>ஒத்திசைவு (விருப்பத்தேர்வு)</h3>'
      +   '<div class="card-sub">பின்தளம் இல்லாமலும் செயலி முழுமையாக வேலை செய்யும். வேறு சாதனத்திலும் அதே கணக்கு வேண்டுமானால் மட்டும் இதை அமைக்கவும்.</div>'
      +   '<div class="field"><label>API முகவரி</label><input id="sApi" placeholder="https://your-app.onrender.com" value="' + esc(TB.Sync.baseUrl()) + '"></div>'
      +   '<div class="row"><button class="btn btn-sm" id="sApiSave" type="button">சேமி</button>'
      +   '<button class="btn btn-sm" id="sApiTest" type="button">இணைப்பைச் சோதி</button>'
      +   '<span id="sApiStat" class="tiny muted"></span></div>'
      +   '<div class="tiny muted mt">Render-இன் இலவசச் சேவை 15 நிமிட ஓய்வுக்குப் பிறகு உறங்கும் — முதல் கோரிக்கை ஒரு நிமிடம் வரை எடுக்கலாம்.</div>'
      + '</div>'

      + '<div class="card"><h3>தரவு</h3>'
      +   '<div class="row"><button class="btn btn-sm" id="sExport" type="button">⬇ எல்லாவற்றையும் பதிவிறக்கு</button>'
      +   '<button class="btn btn-sm" id="sImportBtn" type="button">⬆ மீட்டெடு</button>'
      +   '<input id="sImport" type="file" accept="application/json" style="display:none"></div>'
      +   '<div class="tiny muted mt">உங்கள் தரவு இந்த உலாவியில் மட்டுமே உள்ளது. உலாவித் தரவை அழித்தால் இது போய்விடும் — அவ்வப்போது பதிவிறக்கி வைத்துக்கொள்ளுங்கள்.</div>'
      +   '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line-soft)">'
      +   '<button class="btn btn-sm" id="sDelete" type="button" style="border-color:var(--red);color:var(--red)">கணக்கை நீக்கு</button></div>'
      + '</div>'

      + '<div class="card"><h3>இந்தச் செயலி பற்றி</h3>'
      +   '<div class="small muted">Tamil Bridge — தமிழ் வழியாக ஆங்கிலம் & இந்தி கற்பதற்கான முற்றிலும் இலவச கருவி.</div>'
      +   '<div class="tiny muted mt">' + TB.VOCAB.length + ' சொற்கள் · ' + TB.LESSONS.length + ' பாடங்கள் · 247 தமிழ் எழுத்துகள் · 44 ஆங்கில ஒலிகள்<br>'
      +   'குரல்: உலாவியின் Web Speech API · படம்: Tesseract.js · மொழிபெயர்ப்பு: Google / MyMemory / LibreTranslate<br>'
      +   'எந்த API சாவியும் தேவையில்லை. எந்தக் கட்டணமும் இல்லை.</div>'
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
          .then(function () { TB.App.toast('சேமிக்கப்பட்டது', 'ok'); TB.App.paintUser(); })
          .catch(function (e) { TB.App.toast(e.message, 'err'); });
      });
      root.querySelector('#sChangePw').addEventListener('click', function () {
        TB.Auth.changePassword(root.querySelector('#sOldPw').value, root.querySelector('#sNewPw').value)
          .then(function () {
            TB.App.toast('கடவுச்சொல் மாற்றப்பட்டது', 'ok');
            root.querySelector('#sOldPw').value = ''; root.querySelector('#sNewPw').value = '';
          })
          .catch(function (e) { TB.App.toast(e.message, 'err'); });
      });

      root.querySelector('#sApiSave').addEventListener('click', function () {
        TB.Sync.setBase(root.querySelector('#sApi').value.trim());
        TB.App.toast('சேமிக்கப்பட்டது', 'ok');
      });
      root.querySelector('#sApiTest').addEventListener('click', function () {
        var st = root.querySelector('#sApiStat');
        TB.Sync.setBase(root.querySelector('#sApi').value.trim());
        if (!TB.Sync.configured()) { st.textContent = 'முகவரி இல்லை — உள்ளூர் முறையில் இயங்குகிறது.'; return; }
        st.innerHTML = '<span class="spin"></span> சோதிக்கிறது… (உறங்கும் சேவை எழ ஒரு நிமிடம் ஆகலாம்)';
        TB.Sync.ping().then(function (ok) {
          st.textContent = ok ? '✓ இணைப்பு நன்றாக உள்ளது' : '✗ ' + (TB.Sync.lastError() || 'இணைக்க முடியவில்லை');
          st.style.color = ok ? 'var(--green)' : 'var(--red)';
        });
      });

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
            TB.App.toast('மீட்டெடுக்கப்பட்டது', 'ok');
            TB.App.render();
          } catch (e) { TB.App.toast(e.message, 'err'); }
        };
        fr.readAsText(f);
      });

      root.querySelector('#sDelete').addEventListener('click', function () {
        TB.App.confirm('கணக்கை நீக்கவா?', 'உங்கள் வரலாறு, முன்னேற்றம் அனைத்தும் நிரந்தரமாக அழிக்கப்படும். இதை மீட்க முடியாது.', function () {
          TB.Auth.deleteAccount();
          location.reload();
        });
      });
    }
  };
})();
