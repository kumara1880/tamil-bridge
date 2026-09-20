/* Tamil Bridge — Phrasebook.
   Whole sentences you can use straight away, grouped by situation. Each one
   shows English, Hindi with both readings, and the Tamil meaning, and can be
   played, drilled or spoken back for a score.                               */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, D = V.D, saveD = V.saveD;

  V.phrases = {
    title: 'Phrasebook', sub: 'Ready-made sentences for everyday situations',
    html: function () {
      var groups = TB.PHRASE_GROUPS.map(function (g) {
        var n = TB.PHRASES.filter(function (p) { return p.g === g.id; }).length;
        return '<button class="pill" data-pg="' + g.id + '" type="button">'
             + g.icon + ' ' + esc(g.en) + ' <span class="muted">' + n + '</span></button>';
      }).join('');

      return '<div class="view wide">'
        + '<div class="card">'
        +   '<div class="row mb">'
        +     '<input id="phSearch" type="text" placeholder="Search in English, Hindi or Tamil"'
        +       ' style="flex:1;min-width:200px;padding:11px 14px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +     '<button class="btn btn-sm" id="phPlay" type="button">🔊 Play group</button>'
        +     '<button class="btn btn-sm" id="phDrill" type="button">🎤 Speaking drill</button>'
        +   '</div>'
        +   '<div class="pill-row"><button class="pill on" data-pg="" type="button">All '
        +     '<span class="muted">' + TB.PHRASES.length + '</span></button>' + groups + '</div>'
        + '</div>'
        + '<div id="phList"></div></div>';
    },

    mount: function (root) {
      var group = '', q = '';

      function current() {
        return TB.PHRASES.filter(function (p) {
          if (group && p.g !== group) return false;
          if (!q) return true;
          var s = q.toLowerCase();
          return p.en.toLowerCase().indexOf(s) >= 0
              || p.hi.indexOf(q) >= 0
              || p.ta.indexOf(q) >= 0
              || TB.Translit.romanHindi(p.hi).toLowerCase().indexOf(s) >= 0;
        });
      }

      function draw() {
        var list = current();
        var el = root.querySelector('#phList');
        if (!list.length) { el.innerHTML = '<div class="empty">Nothing found.</div>'; return; }

        var byGroup = {};
        list.forEach(function (p) { (byGroup[p.g] = byGroup[p.g] || []).push(p); });

        var h = '';
        TB.PHRASE_GROUPS.forEach(function (g) {
          var items = byGroup[g.id];
          if (!items) return;
          h += '<div class="card"><h3>' + g.icon + ' ' + esc(g.en) + '</h3>'
             + '<div class="card-sub ta">' + esc(g.ta) + '</div>';
          items.forEach(function (p) {
            h += '<div class="phrase" data-pid="' + p.id + '">'
               + '<div class="row" style="align-items:flex-start">'
               +   '<div style="flex:1;min-width:0">'
               +     '<div class="ph-en">' + V.tappable(p.en, 'en') + '</div>'
               +     '<div class="ph-hi hi">' + V.tappable(p.hi, 'hi') + '</div>'
               +     V.hiRead(p.hi)
               +     '<div class="w-gloss">' + esc(p.ta) + '</div>'
               +   '</div>'
               +   '<div class="ph-actions">'
               +     speak(p.en, 'en') + speak(p.hi, 'hi') + speak(p.ta, 'ta')
               +   '</div>'
               + '</div></div>';
          });
          h += '</div>';
        });
        el.innerHTML = h;
      }

      root.querySelector('#phSearch').addEventListener('input', function () {
        q = this.value.trim(); draw();
      });
      root.querySelectorAll('[data-pg]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-pg]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          group = b.getAttribute('data-pg');
          draw();
        });
      });

      /* play the visible group: English, then Hindi slowly, then Tamil */
      root.querySelector('#phPlay').addEventListener('click', function () {
        var list = current().slice(0, 25);
        if (!list.length) return;
        var prefs = D().prefs;
        var steps = [];
        list.forEach(function (p) {
          steps.push({ text: p.en, lang: 'en', rate: 0.8, pause: 250 });
          steps.push({ text: p.hi, lang: 'hi', rate: 0.6, pause: 250 });
          steps.push({ text: p.hi, lang: 'hi', rate: 0.6, pause: 450 });   /* twice, to fix it */
        });
        var btn = this;
        btn.textContent = '⏹ Stop';
        var run = TB.Speech.sequence(steps, {
          rate: prefs.rate, pitch: prefs.pitch,
          voiceNames: { ta: prefs.voiceTa, en: prefs.voiceEn, hi: prefs.voiceHi },
          onStep: function (s, i) {
            var p = list[Math.floor(i / 3)];
            root.querySelectorAll('.phrase').forEach(function (x) { x.classList.remove('now'); });
            var el = root.querySelector('.phrase[data-pid="' + p.id + '"]');
            if (el) { el.classList.add('now'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
          }
        });
        btn.onclick = function () { run.cancel(); TB.App.render(); };
        run.then(function () { TB.App.render(); });
      });

      /* say the Hindi yourself and get a score */
      root.querySelector('#phDrill').addEventListener('click', function () {
        var list = current();
        if (!list.length) return;
        var i = 0;
        var host = document.getElementById('modalRoot');

        function show(result) {
          var p = list[i];
          host.innerHTML = '<div class="modal-bg"><div class="modal center">'
            + '<div class="row"><span class="chip">' + (i + 1) + ' / ' + list.length + '</span>'
            +   '<div style="flex:1"></div>'
            +   '<button class="btn btn-sm btn-ghost" id="dClose" type="button">✕</button></div>'
            + '<div class="tiny muted mt">Say this in Hindi</div>'
            + '<div style="font-size:20px;font-weight:650;margin:6px 0">' + esc(p.en) + '</div>'
            + '<div class="hi" style="font-size:24px;font-weight:700">' + esc(p.hi) + speak(p.hi, 'hi') + '</div>'
            + V.hiRead(p.hi)
            + '<div class="w-gloss">' + esc(p.ta) + '</div>'
            + '<button class="mic-btn" id="dMic" type="button" style="margin:14px auto">🎤</button>'
            + '<div class="tiny muted" id="dHint">Tap the mic and speak</div>'
            + (result ? resultBlock(result) : '')
            + '<div class="row mt" style="justify-content:center">'
            +   '<button class="btn btn-sm" id="dSlow" type="button">🐢 Hear it slowly</button>'
            +   '<button class="btn btn-primary btn-sm" id="dNext" type="button">Next →</button>'
            + '</div></div></div>';

          host.querySelector('#dClose').addEventListener('click', function () { host.innerHTML = ''; });
          host.querySelector('#dSlow').addEventListener('click', function () {
            TB.Speech.speak(p.hi, 'hi', { rate: 0.5 });
          });
          host.querySelector('#dNext').addEventListener('click', function () {
            i = (i + 1) % list.length; show(null);
          });
          host.querySelector('#dMic').addEventListener('click', function () {
            var mic = this, hint = host.querySelector('#dHint');
            mic.classList.add('live'); hint.textContent = 'Listening…';
            TB.Speech.listen('hi', { onInterim: function (t) { hint.textContent = '“' + t + '”'; } })
              .then(function (res) {
                mic.classList.remove('live');
                var scored = TB.Speech.score(p.hi, res);
                var d = D();
                d.stats.xp = (d.stats.xp || 0) + (scored.score >= 75 ? 3 : 1);
                saveD(d);
                TB.Store.touchStreak(TB.Auth.userId());
                TB.Store.addHistory(TB.Auth.userId(), {
                  type: 'speak', from: 'hi', to: 'hi', src: p.hi,
                  out: scored.score + '% · ' + (scored.heard || '')
                });
                TB.App.refreshChips();
                show(scored);
              })
              .catch(function (e) { mic.classList.remove('live'); hint.textContent = e.message; });
          });

          TB.Speech.speak(p.hi, 'hi', { rate: 0.6 });
        }

        function resultBlock(r) {
          var fb = TB.Speech.feedback(r.score);
          return '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line-soft)">'
            + '<div class="score-ring score-' + fb.tone + '">' + r.score + '%</div>'
            + '<div class="tiny muted">Heard: “' + esc(r.heard || '—') + '”</div>'
            + '<div class="explain tip" style="text-align:left">' + esc(fb.ta) + '</div></div>';
        }

        show(null);
      });

      draw();
    }
  };
})();
