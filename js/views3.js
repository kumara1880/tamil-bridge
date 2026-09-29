/* Tamil Bridge — Writing practice.

   Three things, in every script:
     - Trace: capitals, small letters, digits, Tamil and Hindi, set out on
       real ruled lines rather than floating in a box.
     - My own words: a name or a whole sentence, printed faintly on the
       rules to copy underneath — which is how a child learns to write their
       own name, and how an adult practises a signature or an address.
     - Spell: hear a word, write it back, see exactly which letter went wrong.

   Drawing is finger, stylus and mouse friendly and never leaves the device. */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, D = V.D, saveD = V.saveD;
  var W = TB.Writing;

  V.write = {
    title: 'Writing', sub: 'Trace on ruled lines, write your own name, then spell',
    html: function () {
      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="row mb">'
        +     '<div class="pill-row" id="wMode">'
        +       '<button class="pill on" data-wm="trace" type="button">✏️ Trace</button>'
        +       '<button class="pill" data-wm="own" type="button">✍️ My own words</button>'
        +       '<button class="pill" data-wm="spell" type="button">⌨️ Spell</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="row" id="wSetRow">'
        +     '<span class="tiny muted">Practise:</span>'
        +     '<div class="pill-row" id="wSet">'
        +       '<button class="pill on" data-set="caps" type="button">ABC</button>'
        +       '<button class="pill" data-set="small" type="button">abc</button>'
        +       '<button class="pill" data-set="num" type="button">123</button>'
        +       '<button class="pill" data-set="ta" type="button">தமிழ்</button>'
        +       '<button class="pill" data-set="hi" type="button">हिंदी</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="row mt">'
        +     '<span class="tiny muted">Ruling:</span>'
        +     '<div class="pill-row" id="wRule">'
        +       '<button class="pill on" data-rule="four" type="button">Four-ruled</button>'
        +       '<button class="pill" data-rule="two" type="button">Two-ruled</button>'
        +       '<button class="pill" data-rule="plain" type="button">Plain</button>'
        +     '</div>'
        +     '<span class="tiny muted" id="wRuleHint"></span>'
        +   '</div>'
        + '</div>'
        + '<div id="wArea"></div></div>';
    },

    mount: function (root) {
      var mode = 'trace', setName = 'caps', ruling = 'four', idx = 0;
      var list = W.set('caps');
      var ownText = '', ownScript = 'en';

      function syncRulePills() {
        root.querySelectorAll('#wRule .pill').forEach(function (b) {
          b.classList.toggle('on', b.getAttribute('data-rule') === ruling);
        });
        var el = root.querySelector('#wRuleHint');
        if (el) el.textContent = W.RULINGS[ruling].hint;
      }

      /* ------------------------------------------------------------- pad */
      /* Two stacked canvases: the rules and the faint model underneath, the
         person's own ink on top — so "Rub out" clears only what they wrote. */
      function padHtml(id, rows) {
        return '<div class="rule-pad rows-' + rows + '" id="' + id + 'Wrap">'
          + '<canvas class="rule-guides" id="' + id + 'Guides"></canvas>'
          + '<canvas class="rule-ink" id="' + id + 'Ink"></canvas>'
          + '</div>';
      }

      function paint(id, text, script, rows) {
        var wrap = root.querySelector('#' + id + 'Wrap');
        if (!wrap) return;
        var gc = root.querySelector('#' + id + 'Guides');
        var ic = root.querySelector('#' + id + 'Ink');
        var w = wrap.clientWidth || 640;
        var h = wrap.clientHeight || 220;
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        [gc, ic].forEach(function (c) {
          c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
          c.style.width = w + 'px'; c.style.height = h + 'px';
          c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        var css = getComputedStyle(document.documentElement);
        var g = gc.getContext('2d');
        W.drawGuides(g, w, h, ruling, rows, {
          base: css.getPropertyValue('--rule-base').trim(),
          edge: css.getPropertyValue('--rule-edge').trim(),
          mid: css.getPropertyValue('--rule-mid').trim()
        });
        if (text) {
          W.drawGhost(g, text, script, w, h, ruling, rows,
                      css.getPropertyValue('--rule-ghost').trim());
        }
        wireInk(ic);
      }

      function wireInk(c) {
        var ctx = c.getContext('2d');
        var drawing = false;
        var dpr = Math.min(2, window.devicePixelRatio || 1);

        function style() {
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent').trim() || '#f0883e';
        }
        style();
        c.__clear = function () { ctx.clearRect(0, 0, c.width / dpr, c.height / dpr); style(); };

        function pos(e) {
          var r = c.getBoundingClientRect();
          var p = e.touches ? e.touches[0] : e;
          return { x: p.clientX - r.left, y: p.clientY - r.top };
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
      }

      /* Which room this letter lives in, and what the rooms are. Said in
         all three languages, because the rule is the same in all three and
         the child may only read one of them. */
      function whichRoom(ch) {
        if (ruling !== 'four') return null;
        if (/[A-Z0-9]/.test(ch)) {
          return { en: 'This one is full height: it fills the top room and the middle room, from the top line down to the baseline.',
                   ta: '\u0b87\u0ba4\u0bc1 \u0bae\u0bc1\u0bb4\u0bc1 \u0b89\u0baf\u0bb0\u0bae\u0bcd: \u0bae\u0bc7\u0bb2\u0bcd \u0b95\u0bcb\u0b9f\u0bcd\u0b9f\u0bbf\u0bb2\u0bbf\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0b85\u0b9f\u0bbf\u0b95\u0bcd\u0b95\u0bcb\u0b9f\u0bc1 \u0bb5\u0bb0\u0bc8.',
                   hi: '\u092f\u0939 \u092a\u0942\u0930\u0940 \u090a\u0901\u091a\u093e\u0908 \u0915\u093e \u0939\u0948: \u090a\u092a\u0930 \u0915\u0940 \u0930\u0947\u0916\u093e \u0938\u0947 \u0906\u0927\u093e\u0930 \u0930\u0947\u0916\u093e \u0924\u0915\u0964' };
        }
        if ('bdfhklt'.indexOf(ch) >= 0) {
          return { en: 'This small letter is tall: it climbs to the top line and stands on the baseline.',
                   ta: '\u0b87\u0ba8\u0bcd\u0ba4 \u0b9a\u0bbf\u0bb1\u0bbf\u0baf \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1 \u0b89\u0baf\u0bb0\u0bae\u0bbe\u0ba9\u0ba4\u0bc1: \u0bae\u0bc7\u0bb2\u0bcd \u0b95\u0bcb\u0b9f\u0bcd\u0b9f\u0bc1\u0bb5\u0bb0\u0bc8 \u0b8f\u0bb1\u0bbf, \u0b85\u0b9f\u0bbf\u0b95\u0bcd\u0b95\u0bcb\u0b9f\u0bcd\u0b9f\u0bbf\u0bb2\u0bcd \u0ba8\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd.',
                   hi: '\u092f\u0939 \u091b\u094b\u091f\u093e \u0905\u0915\u094d\u0937\u0930 \u0932\u0902\u092c\u093e \u0939\u0948: \u090a\u092a\u0930 \u0915\u0940 \u0930\u0947\u0916\u093e \u0924\u0915 \u091c\u093e\u0924\u093e \u0939\u0948\u0964' };
        }
        if ('gjpqy'.indexOf(ch) >= 0) {
          return { en: 'This one has a tail: it sits in the middle room and drops into the basement.',
                   ta: '\u0b87\u0ba4\u0bb1\u0bcd\u0b95\u0bc1 \u0bb5\u0bbe\u0bb2\u0bcd \u0b89\u0ba3\u0bcd\u0b9f\u0bc1: \u0ba8\u0b9f\u0bc1 \u0b85\u0bb1\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0b85\u0bae\u0bb0\u0bcd\u0ba8\u0bcd\u0ba4\u0bc1, \u0b95\u0bc0\u0bb4\u0bc7 \u0ba4\u0bca\u0b99\u0bcd\u0b95\u0bc1\u0bae\u0bcd.',
                   hi: '\u0907\u0938\u0915\u0940 \u092a\u0942\u0901\u091b \u0939\u0948: \u092c\u0940\u091a \u0915\u0947 \u0915\u092e\u0930\u0947 \u092e\u0947\u0902 \u092c\u0948\u0920\u0924\u093e \u0939\u0948 \u0914\u0930 \u0928\u0940\u091a\u0947 \u0932\u091f\u0915\u0924\u093e \u0939\u0948\u0964' };
        }
        return { en: 'This one lives in the middle room only: between the dotted line and the baseline.',
                 ta: '\u0b87\u0ba4\u0bc1 \u0ba8\u0b9f\u0bc1 \u0b85\u0bb1\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bcd: \u0baa\u0bc1\u0bb3\u0bcd\u0bb3\u0bbf\u0b95\u0bcd \u0b95\u0bcb\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b85\u0b9f\u0bbf\u0b95\u0bcd\u0b95\u0bcb\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b87\u0b9f\u0bc8\u0baf\u0bbf\u0bb2\u0bcd.',
                 hi: '\u092f\u0939 \u0938\u093f\u0930\u094d\u092b\u093c \u092c\u0940\u091a \u0915\u0947 \u0915\u092e\u0930\u0947 \u092e\u0947\u0902 \u0930\u0939\u0924\u093e \u0939\u0948\u0964' };
      }

      function rulingCard(L) {
        if (ruling === 'plain') return '';
        var room = L ? whichRoom(L.ch) : null;
        var lines = W.explain(ruling);
        return '<div class="card"><h3>' + (ruling === 'four' ? 'The three rooms' : 'The two lines') + '</h3>'
          + (room ? '<div class="msg msg-info"><b>' + esc(room.en) + '</b>'
              + '<div class="ta tiny">' + esc(room.ta) + '</div>'
              + '<div class="hi tiny">' + esc(room.hi) + '</div></div>' : '')
          + lines.map(function (x) {
              return '<div class="room-line"><div>' + esc(x.en) + '</div>'
                + '<div class="ta tiny" style="color:var(--teal)">' + esc(x.ta) + '</div>'
                + '<div class="hi tiny" style="color:var(--purple)">' + esc(x.hi) + '</div></div>';
            }).join('')
          + '</div>';
      }

      /* ----------------------------------------------------------- trace */
      function drawTrace() {
        var L = list[idx];
        if (!L) return;

        var words = L.words
          ? '<div class="row mt" style="gap:16px;flex-wrap:wrap">'
            + [['English', L.words.en, 'en'], ['தமிழ்', L.words.ta, 'ta'], ['हिंदी', L.words.hi, 'hi']]
                .map(function (x) {
                  return '<div><div class="tiny muted">' + x[0] + '</div>'
                    + '<div class="' + x[2] + '" style="font-weight:650">' + esc(x[1]) + speak(x[1], x[2]) + '</div>'
                    + V.readAid(x[1], x[2]) + '</div>';
                }).join('')
            + '</div>'
          : '';

        root.querySelector('#wArea').innerHTML = ''
          + '<div class="card">'
          +   '<div class="row"><span class="chip">' + (idx + 1) + ' / ' + list.length + '</span>'
          +     '<div class="trace-big ' + L.script + '">' + esc(L.ch) + speak(L.say, L.lang) + '</div>'
          +     '<div class="spacer" style="flex:1"></div>'
          +     '<span class="small muted">' + esc(L.hint) + '</span></div>'
          +   words
          +   padHtml('t', 1)
          +   '<div class="row mt" style="justify-content:center">'
          +     '<button class="btn btn-sm" id="wClear" type="button">Rub out</button>'
          +     '<button class="btn btn-sm" id="wHear" type="button">🔊 Hear it</button>'
          +     '<button class="btn btn-sm" id="wPrev" type="button">← Back</button>'
          +     '<button class="btn btn-primary btn-sm" id="wNext" type="button">Done, next →</button>'
          +   '</div>'
          +   '<div class="tiny muted center mt">Trace the faint letters, then write more of your own along the line.</div>'
          + '</div>'
          + rulingCard(L);

        paint('t', L.ch + '  ' + L.ch + '  ' + L.ch, L.script, 1);

        root.querySelector('#wClear').addEventListener('click', function () {
          var ic = root.querySelector('#tInk'); if (ic && ic.__clear) ic.__clear();
        });
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

      /* --------------------------------------------------------- my own */
      /* A name, or any sentence, in any of the three scripts — printed on
         the same rules so it can be copied underneath. */
      function drawOwn() {
        root.querySelector('#wArea').innerHTML = ''
          + '<div class="card">'
          +   '<div class="field"><label>Write anything — your name, or a whole sentence</label>'
          +     '<input id="oText" placeholder="Type a name or a sentence" value="' + esc(ownText) + '"></div>'
          +   '<div class="row">'
          +     '<div class="pill-row" id="oScript">'
          +       '<button class="pill' + (ownScript === 'en' ? ' on' : '') + '" data-os="en" type="button">English</button>'
          +       '<button class="pill' + (ownScript === 'ta' ? ' on' : '') + '" data-os="ta" type="button">தமிழ்</button>'
          +       '<button class="pill' + (ownScript === 'hi' ? ' on' : '') + '" data-os="hi" type="button">हिंदी</button>'
          +     '</div>'
          +     '<div class="spacer" style="flex:1"></div>'
          +     '<button class="btn btn-sm" id="oTranslate" type="button">Show it in the other two</button>'
          +   '</div>'
          +   '<div id="oRead" class="mt"></div>'
          +   padHtml('o', 4)
          +   '<div class="row mt" style="justify-content:center">'
          +     '<button class="btn btn-sm" id="oClear" type="button">Rub out</button>'
          +     '<button class="btn btn-sm" id="oHear" type="button">🔊 Hear it</button>'
          +     '<button class="btn btn-sm" id="oPrint" type="button">🖨️ Print this page</button>'
          +   '</div>'
          +   '<div class="tiny muted center mt">The faint words are the model. Copy them on the empty lines below.</div>'
          + '</div>'
          + '<div id="oOther"></div>';

        var input = root.querySelector('#oText');

        function repaint() {
          ownText = input.value;
          var show = ownText.trim();
          paint('o', show ? show + '    ' + show : '', ownScript, 4);
          var box = root.querySelector('#oRead');
          box.innerHTML = show
            ? '<div class="' + ownScript + '" style="font-size:22px;font-weight:650">' + esc(show)
              + speak(show, ownScript) + '</div>' + V.readAid(show, ownScript)
            : '<div class="tiny muted">Type above and it appears on the lines, faintly, to copy.</div>';
        }
        repaint();

        var t = null;
        input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(repaint, 250); });

        root.querySelector('#oScript').addEventListener('click', function (e) {
          var b = e.target.closest('[data-os]');
          if (!b) return;
          ownScript = b.getAttribute('data-os');
          root.querySelectorAll('#oScript .pill').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          ruling = W.defaultRuling(ownScript);
          syncRulePills();
          repaint();
        });
        root.querySelector('#oClear').addEventListener('click', function () {
          var ic = root.querySelector('#oInk'); if (ic && ic.__clear) ic.__clear();
        });
        root.querySelector('#oHear').addEventListener('click', function () {
          if (ownText.trim()) TB.Speech.speak(ownText, ownScript, { rate: 0.6 });
        });
        root.querySelector('#oPrint').addEventListener('click', function () { window.print(); });

        root.querySelector('#oTranslate').addEventListener('click', function () {
          var txt = input.value.trim();
          if (!txt) return;
          var box = root.querySelector('#oOther');
          box.innerHTML = '<div class="card"><span class="spin"></span> Translating…</div>';
          var others = ['en', 'ta', 'hi'].filter(function (l) { return l !== ownScript; });
          TB.Translate.multi(txt, ownScript, others).then(function (rs) {
            box.innerHTML = '<div class="card"><h3>The same words in the other two</h3>'
              + rs.map(function (r) {
                  if (!r.text) return '';
                  return '<div class="mword"><div class="tiny muted">' + esc(TB.Translate.langName(r.lang)) + '</div>'
                    + '<div class="' + r.lang + '" style="font-size:20px;font-weight:650">' + esc(r.text)
                    + speak(r.text, r.lang) + '</div>' + V.readAid(r.text, r.lang)
                    + '<button class="btn btn-sm mt" data-use="' + esc(r.text) + '" data-lang="' + r.lang
                    + '" type="button">Practise writing this</button></div>';
                }).join('')
              + '</div>';
            box.addEventListener('click', function (e) {
              var b = e.target.closest('[data-use]');
              if (!b) return;
              ownText = b.getAttribute('data-use');
              ownScript = b.getAttribute('data-lang');
              ruling = W.defaultRuling(ownScript);
              drawOwn();
              syncRulePills();
            });
          }).catch(function () {
            box.innerHTML = '<div class="card"><div class="msg msg-warn">Could not translate just now.</div></div>';
          });
        });
      }

      /* ----------------------------------------------------------- spell */
      var pool = [], sIdx = 0, tries = 0;
      var spellScript = 'en';

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
        var target = spellScript === 'en' ? w.en : (spellScript === 'hi' ? w.hi : w.ta);
        var lang = spellScript;
        tries = 0;

        root.querySelector('#wArea').innerHTML = ''
          + '<div class="card center">'
          +   '<div class="bar mb"><i style="width:' + Math.round((sIdx / pool.length) * 100) + '%"></i></div>'
          +   '<div class="tiny muted">Listen, then write the word</div>'
          +   '<button class="mic-btn" id="sHear" type="button" style="margin:12px auto">🔊</button>'
          +   '<div class="small muted">Meaning: <b>' + esc(w.en) + '</b>'
          +     '<span class="w-gloss" style="display:inline-block;margin-left:8px">' + esc(w.ta) + '</span></div>'
          +   '<input id="sIn" class="spell-in ' + spellScript + '" autocomplete="off" autocapitalize="off" '
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
            /* letter by letter, so a child can see exactly where it went wrong */
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

      /* --------------------------------------------------------- wiring */
      function redraw() {
        var setRow = root.querySelector('#wSetRow');
        var ruleRow = root.querySelector('#wRule').parentElement;
        setRow.style.display = mode === 'trace' ? '' : 'none';
        ruleRow.style.display = mode === 'spell' ? 'none' : '';
        if (mode === 'trace') drawTrace();
        else if (mode === 'own') {
          /* the ruling follows the script being written, not whatever was
             last chosen in the trace list */
          ruling = W.defaultRuling(ownScript);
          syncRulePills();
          drawOwn();
        } else drawSpell();
      }

      root.querySelector('#wMode').addEventListener('click', function (e) {
        var b = e.target.closest('[data-wm]');
        if (!b) return;
        root.querySelectorAll('#wMode .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        mode = b.getAttribute('data-wm');
        pool = []; sIdx = 0;
        redraw();
      });

      root.querySelector('#wSet').addEventListener('click', function (e) {
        var b = e.target.closest('[data-set]');
        if (!b) return;
        root.querySelectorAll('#wSet .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        setName = b.getAttribute('data-set');
        list = W.set(setName);
        idx = 0;
        spellScript = (setName === 'ta' || setName === 'hi') ? setName : 'en';
        /* English and digits are taught on four lines, the Indian scripts on two */
        ruling = W.defaultRuling(setName === 'ta' ? 'ta' : setName === 'hi' ? 'hi' : 'en');
        syncRulePills();
        redraw();
      });

      root.querySelector('#wRule').addEventListener('click', function (e) {
        var b = e.target.closest('[data-rule]');
        if (!b) return;
        ruling = b.getAttribute('data-rule');
        syncRulePills();
        redraw();
      });

      var rt = null;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { if (mode !== 'spell') redraw(); }, 200);
      });

      syncRulePills();
      redraw();
    }
  };
})();
