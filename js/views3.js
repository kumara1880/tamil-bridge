/* Tamil Bridge — Writing practice.
   The fourth skill, for children learning to read, write, speak and understand:
     - Trace: a large model letter to copy on a canvas, in any of the three scripts.
     - Spell: hear a word, type it back, get letter-by-letter feedback.
   Drawing is finger/stylus/mouse friendly and never leaves the device.        */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, D = V.D, saveD = V.saveD;

  /* Letter sets, easiest first — a child starts with vowels. */
  function letters(script) {
    if (script === 'en') {
      return TB.ALPHABET.en.letters.map(function (l) {
        return { ch: l.ch, sub: l.low, say: l.ch, lang: 'en',
                 hint: l.name + '  ·  ' + l.sounds[0] };
      });
    }
    if (script === 'hi') {
      var out = TB.ALPHABET.hi.vowels.map(function (v) {
        return { ch: v.ch, sub: v.r, say: v.ch, lang: 'hi', hint: 'vowel · ' + v.ta };
      });
      TB.ALPHABET.hi.rows.slice(0, 7).forEach(function (row) {
        row.items.forEach(function (c) {
          out.push({ ch: c.ch, sub: c.r, say: c.ch, lang: 'hi', hint: c.en + ' · ' + c.ta });
        });
      });
      return out;
    }
    var ta = TB.ALPHABET.ta.vowels.map(function (v) {
      return { ch: v.ch, sub: v.r, say: v.ch, lang: 'ta', hint: 'vowel · ' + v.en };
    });
    TB.ALPHABET.ta.consonants.forEach(function (c) {
      ta.push({ ch: c.ch, sub: c.rr, say: c.base, lang: 'ta', hint: c.en });
    });
    return ta;
  }

  V.write = {
    title: 'Writing', sub: 'Trace the letters, then spell the words',
    html: function () {
      return '<div class="view">'
        + '<div class="card"><div class="row">'
        +   '<div class="pill-row" id="wMode">'
        +     '<button class="pill on" data-wm="trace" type="button">✏️ Trace letters</button>'
        +     '<button class="pill" data-wm="spell" type="button">⌨️ Spell words</button>'
        +   '</div><div class="spacer" style="flex:1"></div>'
        +   '<div class="pill-row" id="wScript">'
        +     '<button class="pill on" data-ws="en" type="button">English</button>'
        +     '<button class="pill" data-ws="hi" type="button">Hindi</button>'
        +     '<button class="pill" data-ws="ta" type="button">Tamil</button>'
        +   '</div></div></div>'
        + '<div id="wArea"></div></div>';
    },

    mount: function (root) {
      var mode = 'trace', script = 'en', idx = 0, list = letters('en');

      /* ------------------------------------------------------------ trace */
      function drawTrace() {
        var L = list[idx];
        root.querySelector('#wArea').innerHTML = ''
          + '<div class="card">'
          +   '<div class="row"><span class="chip">' + (idx + 1) + ' / ' + list.length + '</span>'
          +     '<div class="spacer" style="flex:1"></div>'
          +     '<span class="small muted">' + esc(L.hint) + '</span></div>'
          +   '<div class="trace-wrap">'
          +     '<div class="trace-model ' + script + '">' + esc(L.ch)
          +       speak(L.say, L.lang) + '</div>'
          +     '<div class="trace-pad">'
          +       '<div class="trace-ghost ' + script + '">' + esc(L.ch) + '</div>'
          +       '<canvas id="pad" width="440" height="440"></canvas>'
          +     '</div>'
          +   '</div>'
          +   '<div class="row mt" style="justify-content:center">'
          +     '<button class="btn btn-sm" id="wClear" type="button">Clear</button>'
          +     '<button class="btn btn-sm" id="wHear" type="button">🔊 Hear it</button>'
          +     '<button class="btn btn-sm" id="wPrev" type="button">← Back</button>'
          +     '<button class="btn btn-primary btn-sm" id="wNext" type="button">Done, next →</button>'
          +   '</div>'
          +   '<div class="tiny muted center mt">Trace over the faint letter with your finger, stylus or mouse.</div>'
          + '</div>';

        wirePad();
        root.querySelector('#wHear').addEventListener('click', function () {
          TB.Speech.speak(L.say, L.lang, { rate: 0.6 });
        });
        root.querySelector('#wPrev').addEventListener('click', function () {
          idx = (idx - 1 + list.length) % list.length; drawTrace();
        });
        root.querySelector('#wNext').addEventListener('click', function () {
          var d = D(); d.stats.xp = (d.stats.xp || 0) + 1; saveD(d);
          TB.Store.touchStreak(TB.Auth.userId());
          TB.App.refreshChips();
          idx = (idx + 1) % list.length;
          drawTrace();
        });
        if (D().prefs.autoSpeak) TB.Speech.speak(L.say, L.lang, { rate: 0.6 });
      }

      function wirePad() {
        var c = root.querySelector('#pad');
        if (!c) return;
        var ctx = c.getContext('2d');
        var drawing = false;

        function reset() {
          ctx.clearRect(0, 0, c.width, c.height);
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent').trim() || '#f0883e';
        }
        reset();

        /* CSS size and canvas size differ, so map pointer -> canvas space */
        function pos(e) {
          var r = c.getBoundingClientRect();
          var p = e.touches ? e.touches[0] : e;
          return {
            x: (p.clientX - r.left) * (c.width / r.width),
            y: (p.clientY - r.top) * (c.height / r.height)
          };
        }
        function start(e) { e.preventDefault(); drawing = true; var q = pos(e); ctx.beginPath(); ctx.moveTo(q.x, q.y); }
        function move(e) { if (!drawing) return; e.preventDefault(); var q = pos(e); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        function end() { drawing = false; }

        c.addEventListener('mousedown', start);
        c.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
        c.addEventListener('touchstart', start, { passive: false });
        c.addEventListener('touchmove', move, { passive: false });
        c.addEventListener('touchend', end);

        root.querySelector('#wClear').addEventListener('click', reset);
      }

      /* ------------------------------------------------------------ spell */
      var pool = [], sIdx = 0, tries = 0;

      function spellPool() {
        return TB.VOCAB.filter(function (w) { return w.lv === 1; })
          .sort(function () { return Math.random() - 0.5; }).slice(0, 20);
      }

      function drawSpell() {
        if (!pool.length) { pool = spellPool(); sIdx = 0; }
        if (sIdx >= pool.length) {
          root.querySelector('#wArea').innerHTML =
            '<div class="card center"><div style="font-size:34px">🎉</div>'
            + '<h3>All done!</h3><button class="btn btn-primary mt" id="again" type="button">Again</button></div>';
          root.querySelector('#again').addEventListener('click', function () {
            pool = spellPool(); sIdx = 0; drawSpell();
          });
          return;
        }
        var w = pool[sIdx];
        var target = script === 'en' ? w.en : (script === 'hi' ? w.hi : w.ta);
        var lang = script;
        tries = 0;

        root.querySelector('#wArea').innerHTML = ''
          + '<div class="card center">'
          +   '<div class="bar mb"><i style="width:' + Math.round((sIdx / pool.length) * 100) + '%"></i></div>'
          +   '<div class="tiny muted">Listen, then write the word</div>'
          +   '<button class="mic-btn" id="sHear" type="button" style="margin:12px auto">🔊</button>'
          +   '<div class="small muted">Meaning: <b>' + esc(w.en) + '</b>'
          +     '<span class="w-gloss" style="display:inline-block;margin-left:8px">' + esc(w.ta) + '</span></div>'
          +   '<input id="sIn" class="spell-in ' + script + '" autocomplete="off" autocapitalize="off" '
          +     'spellcheck="false" placeholder="type here">'
          +   '<div id="sFeed" class="mt"></div>'
          +   '<div class="row mt" style="justify-content:center">'
          +     '<button class="btn btn-sm" id="sCheck" type="button">Check</button>'
          +     '<button class="btn btn-sm" id="sShow" type="button">Show answer</button>'
          +     '<button class="btn btn-sm" id="sSkip" type="button">Skip →</button>'
          +   '</div>'
          + '</div>';

        var input = root.querySelector('#sIn');
        input.focus();

        function say() { TB.Speech.speak(target, lang, { rate: 0.55 }); }
        say();
        root.querySelector('#sHear').addEventListener('click', say);

        function check() {
          var got = input.value.trim();
          if (!got) return;
          var feed = root.querySelector('#sFeed');
          if (got.toLowerCase() === target.toLowerCase()) {
            feed.innerHTML = '<div class="msg msg-ok">✓ Correct — ' + esc(target) + '</div>';
            var d = D();
            d.stats.xp = (d.stats.xp || 0) + (tries === 0 ? 3 : 1);
            saveD(d);
            TB.Store.touchStreak(TB.Auth.userId());
            TB.App.refreshChips();
            TB.Store.addHistory(TB.Auth.userId(), {
              type: 'write', from: lang, to: lang, src: target, out: 'correct'
            });
            setTimeout(function () { sIdx++; drawSpell(); }, 900);
          } else {
            tries++;
            /* letter-by-letter feedback so a child can see exactly where it went wrong */
            var marks = '';
            for (var i = 0; i < Math.max(got.length, target.length); i++) {
              var g = got[i] || '_';
              marks += '<span class="' + (g === target[i] ? 'w-ok' : 'w-bad') + '">' + esc(g) + '</span>';
            }
            feed.innerHTML = '<div class="msg msg-warn">Not yet — look at the letters</div>'
              + '<div style="font-size:24px;letter-spacing:3px">' + marks + '</div>'
              + (tries >= 2 ? '<div class="tiny muted mt">Hint: it starts with <b>' + esc(target.slice(0, 2)) + '</b>…</div>' : '');
          }
        }

        root.querySelector('#sCheck').addEventListener('click', check);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
        root.querySelector('#sShow').addEventListener('click', function () {
          root.querySelector('#sFeed').innerHTML =
            '<div class="msg msg-info" style="font-size:20px">' + esc(target) + '</div>';
          input.value = target;
        });
        root.querySelector('#sSkip').addEventListener('click', function () { sIdx++; drawSpell(); });
      }

      function redraw() { if (mode === 'trace') drawTrace(); else drawSpell(); }

      root.querySelectorAll('[data-wm]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-wm]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          mode = b.getAttribute('data-wm');
          pool = []; sIdx = 0;
          redraw();
        });
      });
      root.querySelectorAll('[data-ws]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-ws]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          script = b.getAttribute('data-ws');
          list = letters(script);
          idx = 0; pool = []; sIdx = 0;
          redraw();
        });
      });

      redraw();
    }
  };
})();
