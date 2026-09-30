/* Tamil Bridge — the abacus, and sums to practise.

   Two things a child needs that a worked example cannot give: something to
   move with their hands, and questions nobody has answered for them.     */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;

  var A = TB.Abacus;

  V.abacus = {
    title: 'Abacus',
    sub: 'Move the beads, and hear the number in English, தமிழ் and हिंदी',

    html: function () {
      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="row mb"><div class="pill-row" id="abMode">'
        +     '<button class="pill on" data-m="play" type="button">\u{1F9EE} Play</button>'
        +     '<button class="pill" data-m="show" type="button">\u{1F440} Show me a number</button>'
        +     '<button class="pill" data-m="add" type="button">➕ Add, bead by bead</button>'
        +   '</div></div>'
        +   '<div class="tiny muted">Each rod has one bead on top worth <b>5</b> and four below '
        +     'worth <b>1</b>. A bead counts when it is pushed towards the bar.</div>'
        + '</div>'
        + '<div id="abBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#abBody');
      var mode = 'play';
      var frame = A.empty();
      var target = null;

      /* ------------------------------------------------------- the frame */
      function board() {
        var rods = frame.length;
        return '<div class="abacus" id="abBoard">'
          + '<div class="ab-rods">'
          + frame.map(function (r, i) {
              return '<div class="ab-rod" data-rod="' + i + '">'
                + '<div class="ab-heaven">'
                +   '<button class="ab-bead heaven' + (r.heaven ? ' on' : '') + '" '
                +     'data-rod="' + i + '" data-heaven="1" type="button" '
                +     'aria-label="five on the ' + esc(A.placeName(i, rods)) + ' rod"></button>'
                + '</div>'
                + '<div class="ab-bar"></div>'
                + '<div class="ab-earth">'
                + [0, 1, 2, 3].map(function (b) {
                    return '<button class="ab-bead earth' + (r.earth > b ? ' on' : '') + '" '
                      + 'data-rod="' + i + '" data-bead="' + b + '" type="button" '
                      + 'aria-label="one on the ' + esc(A.placeName(i, rods)) + ' rod"></button>';
                  }).join('')
                + '</div>'
                + '<div class="ab-digit">' + A.rodValue(r) + '</div>'
                + '<div class="ab-place">' + esc(A.placeName(i, rods)) + '</div>'
                + '</div>';
            }).join('')
          + '</div></div>';
      }

      function numberCard(n) {
        var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
        return '<div class="card">'
          + '<div class="ab-value">' + n.toLocaleString('en-IN') + '</div>'
          + '<div class="lang-line"><div class="en">' + esc(en) + speak(en, 'en') + '</div>'
          + readAid(en, 'en') + '</div>'
          + '<div class="lang-line"><div class="ta">' + esc(ta) + speak(ta, 'ta') + '</div>'
          + readAid(ta, 'ta') + '</div>'
          + '<div class="lang-line"><div class="hi">' + esc(hi) + speak(hi, 'hi') + '</div>'
          + readAid(hi, 'hi') + '</div>'
          + '</div>';
      }

      /* ------------------------------------------------------------ modes */
      function play() {
        body.innerHTML = '<div class="card">' + board()
          + '<div class="row mt" style="justify-content:center">'
          +   '<button class="btn btn-sm" id="abClear" type="button">Clear</button>'
          +   '<input id="abSet" class="mnum" style="max-width:150px" inputmode="numeric" '
          +     'placeholder="type a number">'
          +   '<button class="btn btn-sm btn-primary" id="abSetGo" type="button">Put it on</button>'
          + '</div></div>'
          + numberCard(A.value(frame));
      }

      function show() {
        if (target === null) target = pick();
        var got = A.value(frame);
        var right = got === target;
        body.innerHTML = '<div class="card">'
          + '<div class="ab-ask">Set this number on the abacus:</div>'
          + '<div class="ab-target">' + target.toLocaleString('en-IN') + '</div>'
          + '<div class="tiny muted">' + esc(TB.Numbers.enIndian(target)) + '  ·  '
          +   '<span class="ta">' + esc(TB.Numbers.ta(target)) + '</span>  ·  '
          +   '<span class="hi">' + esc(TB.Numbers.hi(target)) + '</span></div>'
          + '</div>'
          + '<div class="card">' + board()
          + '<div class="row mt" style="justify-content:center">'
          +   (right
              ? '<div class="msg msg-ok" style="margin:0">✓ That is ' + target.toLocaleString('en-IN')
                + '. <button class="btn btn-sm btn-primary" id="abNext" type="button">Another one</button></div>'
              : '<span class="tiny muted">The abacus shows ' + got.toLocaleString('en-IN') + '</span>')
          +   '<button class="btn btn-sm" id="abClear" type="button">Clear</button>'
          + '</div></div>';
        if (right) {
          var d = D(); d.stats.xp = (d.stats.xp || 0) + 2; saveD(d);
          TB.App.refreshChips();
        }
      }

      function add() {
        body.innerHTML = '<div class="card">'
          + '<div class="row" style="flex-wrap:wrap">'
          +   '<input id="abA" class="mnum" style="max-width:130px" inputmode="numeric" placeholder="25">'
          +   '<span style="font-size:24px">+</span>'
          +   '<input id="abB" class="mnum" style="max-width:130px" inputmode="numeric" placeholder="17">'
          +   '<button class="btn btn-primary" id="abAddGo" type="button">Show me</button>'
          + '</div>'
          + '<div class="tiny muted mt">Adding on an abacus goes one rod at a time. The skill is '
          +   'what to do when a rod has no room left.</div>'
          + '</div><div id="abSteps"></div>';
      }

      function pick() {
        var max = [9, 99, 999, 9999][Math.floor(Math.random() * 4)];
        return Math.floor(Math.random() * max) + 1;
      }

      function draw() {
        if (mode === 'play') play();
        else if (mode === 'show') show();
        else add();
      }

      /* ---------------------------------------------------------- wiring */
      root.querySelector('#abMode').addEventListener('click', function (e) {
        var b = e.target.closest('[data-m]');
        if (!b) return;
        root.querySelectorAll('#abMode .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        mode = b.getAttribute('data-m');
        if (mode === 'show') { frame = A.empty(); target = null; }
        draw();
      });

      body.addEventListener('click', function (e) {
        var bead = e.target.closest('.ab-bead');
        if (bead) {
          var rod = +bead.getAttribute('data-rod');
          if (bead.hasAttribute('data-heaven')) A.tapHeaven(frame, rod);
          else A.tapEarth(frame, rod, +bead.getAttribute('data-bead'));
          draw();
          return;
        }
        if (e.target.closest('#abClear')) { frame = A.empty(); draw(); return; }
        if (e.target.closest('#abNext')) { frame = A.empty(); target = pick(); draw(); return; }
        if (e.target.closest('#abSetGo')) {
          var n = parseInt(body.querySelector('#abSet').value, 10);
          if (!isNaN(n)) {
            var r = A.set(n);
            if (r.tooBig) {
              body.querySelector('#abSet').value = '';
              TB.App.toast('This abacus holds up to ' + r.max.toLocaleString('en-IN') + '.', 'err');
              return;
            }
            frame = r.frame;
            draw();
          }
          return;
        }
        if (e.target.closest('#abAddGo')) {
          var a = parseInt(body.querySelector('#abA').value, 10);
          var b2 = parseInt(body.querySelector('#abB').value, 10);
          if (isNaN(a) || isNaN(b2)) return;
          var work = A.addSteps(a, b2);
          var out = body.querySelector('#abSteps');
          if (!work) { out.innerHTML = '<div class="empty">Too big for this abacus.</div>'; return; }
          frame = work.frame;
          out.innerHTML = '<div class="card">'
            + '<h3>' + a.toLocaleString('en-IN') + ' + ' + b2.toLocaleString('en-IN')
            + ' = ' + work.answer.toLocaleString('en-IN') + '</h3>'
            + work.steps.map(function (s, i) {
                return '<div class="ab-step' + (s.carry ? ' carry' : '') + '">'
                  + '<b>' + (i + 1) + '.</b> ' + esc(s.how) + '</div>';
              }).join('')
            + (work.steps.length ? '' : '<div class="tiny muted">Nothing to add.</div>')
            + '</div>'
            + '<div class="card">' + board() + '</div>'
            + numberCard(work.answer);
          return;
        }
      });

      draw();
    }
  };
}());
