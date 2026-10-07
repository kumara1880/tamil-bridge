/* Tamil Bridge — vertically and crosswise, sums to practise, and the
   number chart.

   Three things a child needs beside a worked example: a faster way to
   multiply, questions nobody has answered for them, and somewhere to see
   the numbers laid out with their names in all three languages.          */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;
  var M2 = TB.Maths2;
  /* Shared with the alphabet — one set of window listeners for the page. */
  var scrollWatch = V.scrollWatch;

  /* ------------------------------------------------ vertically & crosswise */
  V.crosswise = {
    title: 'Vertically & crosswise',
    sub: 'The multiplication that can be done in your head, one column at a time',

    html: function () {
      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="msetup">'
        +     '<input id="xA" class="mnum" inputmode="numeric" placeholder="23">'
        +     '<span style="font-size:calc(26px * var(--fs,1))">×</span>'
        +     '<input id="xB" class="mnum" inputmode="numeric" placeholder="41">'
        +     '<button class="btn btn-primary" id="xGo" type="button">=</button>'
        +   '</div>'
        +   '<div class="row mt"><span class="tiny muted">Try:</span>'
        +     '<div class="pill-row" id="xEg">'
        +       '<button class="pill" data-a="23" data-b="41" type="button">23 × 41</button>'
        +       '<button class="pill" data-a="12" data-b="13" type="button">12 × 13</button>'
        +       '<button class="pill" data-a="99" data-b="99" type="button">99 × 99</button>'
        +       '<button class="pill" data-a="123" data-b="45" type="button">123 × 45</button>'
        +     '</div></div>'
        +   '<div class="tiny muted mt">Long multiplication writes a whole row for every digit, '
        +     'then adds the rows. This does one column at a time and never needs the rows — '
        +     'which is why it can be done in your head.</div>'
        + '</div>'
        + '<div id="xOut"></div></div>';
    },

    mount: function (root) {
      var out = root.querySelector('#xOut');
      var A = root.querySelector('#xA'), B = root.querySelector('#xB');

      function go() {
        var a = parseInt(A.value, 10), b = parseInt(B.value, 10);
        if (isNaN(a) || isNaN(b)) { out.innerHTML = ''; return; }
        var r = M2.crosswise(a, b);
        if (!r) { out.innerHTML = '<div class="empty">Those are too big for this.</div>'; return; }

        /* the pattern itself, drawn */
        var wide = r.columns.slice().reverse();
        out.innerHTML = '<div class="card">'
          + '<h3>' + a.toLocaleString('en-IN') + ' × ' + b.toLocaleString('en-IN')
          + ' = ' + r.answer.toLocaleString('en-IN') + '</h3>'
          + '<div class="card-sub">Read the columns from the right. The ends are a straight '
          + 'line, the middles are a cross.</div>'

          + '<div class="xw-grid">'
          + wide.map(function (c) {
              var n = c.pairs.length;
              return '<div class="xw-col' + (n > 1 ? ' cross' : '') + '">'
                + '<div class="xw-mark">' + (n > 1 ? '✕' : '│') + '</div>'
                + '<div class="xw-pairs">'
                + c.pairs.map(function (p) {
                    return '<span class="xw-pair">' + p.a + '×' + p.b + '</span>';
                  }).join('<span class="xw-plus">+</span>')
                + '</div>'
                + '<div class="xw-sum">' + c.sum + '</div>'
                + (c.carryIn ? '<div class="xw-carry">+' + c.carryIn + ' carried</div>' : '')
                + '<div class="xw-digit">' + c.digit + '</div>'
                + '<div class="xw-place">' + esc(M2.placeName(c.place)) + '</div>'
                + '</div>';
            }).join('')
          + '</div>'

          + '<div class="tiny muted mt">Digits read right to left: '
          + r.columns.map(function (c) { return c.digit; }).reverse().join(' ')
          + (r.columns[r.columns.length - 1].carryOut
              ? '  (and ' + r.columns[r.columns.length - 1].carryOut + ' carried out in front)' : '')
          + '</div></div>'

          + '<div class="card"><h3>Step by step</h3>'
          + r.columns.map(function (c, i) {
              return '<div class="ab-step' + (c.pairs.length > 1 ? ' carry' : '') + '">'
                + '<b>' + (i + 1) + '.</b> The <b>' + esc(M2.placeName(c.place)) + '</b>: '
                + c.pairs.map(function (p) { return p.a + ' × ' + p.b + ' = ' + p.product; }).join(', ')
                + (c.pairs.length > 1
                    ? ' — add them, ' + c.pairs.map(function (p) { return p.product; }).join(' + ')
                      + ' = ' + c.sum : '')
                + (c.carryIn ? ', plus the ' + c.carryIn + ' carried = ' + c.total : '')
                + '. Write <b>' + c.digit + '</b>'
                + (c.carryOut ? ' and carry ' + c.carryOut : '') + '.'
                + '</div>';
            }).join('')
          + '</div>'

          + (function () {
              var n = r.answer;
              var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
              return '<div class="card"><h3>The answer, said aloud</h3>'
                + '<div class="lang-line"><div class="en">' + esc(en) + speak(en, 'en') + '</div>'
                + readAid(en, 'en') + '</div>'
                + '<div class="lang-line"><div class="ta">' + esc(ta) + speak(ta, 'ta') + '</div>'
                + readAid(ta, 'ta') + '</div>'
                + '<div class="lang-line"><div class="hi">' + esc(hi) + speak(hi, 'hi') + '</div>'
                + readAid(hi, 'hi') + '</div></div>';
            })();

        var d = D(); d.stats.xp = (d.stats.xp || 0) + 1; saveD(d);
        TB.App.refreshChips();
      }

      root.querySelector('#xGo').addEventListener('click', go);
      [A, B].forEach(function (el) {
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      });
      root.querySelector('#xEg').addEventListener('click', function (e) {
        var b = e.target.closest('[data-a]');
        if (!b) return;
        A.value = b.getAttribute('data-a');
        B.value = b.getAttribute('data-b');
        go();
      });
      A.value = '23'; B.value = '41'; go();
    }
  };

  /* --------------------------------------------------------------- practice */
  V.sums = {
    title: 'Practice',
    sub: 'Ten questions, marked as you go',

    html: function () {
      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="row mb"><span class="tiny muted">Sum:</span>'
        +     '<div class="pill-row" id="qOp">'
        +     ['add', 'sub', 'mul', 'div'].map(function (k, i) {
                return '<button class="pill' + (i === 0 ? ' on' : '') + '" data-op="' + k + '" type="button">'
                     + TB.Maths.OPS[k].sym + '</button>';
              }).join('')
        +     '</div></div>'
        +   '<div class="row"><span class="tiny muted">How hard:</span>'
        +     '<div class="pill-row" id="qLv">'
        +     M2.LEVELS.map(function (l, i) {
                return '<button class="pill' + (i === 0 ? ' on' : '') + '" data-lv="' + l.id + '" type="button">'
                     + esc(l.en) + '</button>';
              }).join('')
        +     '</div></div>'
        + '</div>'
        + '<div id="qBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#qBody');
      var op = 'add', level = 1;
      var qs = [], at = 0, right = 0, done = false;

      function start() {
        qs = M2.round(op, level, 10);
        at = 0; right = 0; done = false;
        draw();
      }

      function draw() {
        if (done) {
          body.innerHTML = '<div class="card center">'
            + '<div class="q-score">' + right + ' / ' + qs.length + '</div>'
            + '<div class="card-sub">'
            + (right === qs.length ? 'Every one right.'
               : right >= qs.length * 0.7 ? 'Well done — look again at the ones you missed.'
               : 'Worth doing that one again.')
            + '</div>'
            + '<button class="btn btn-primary mt" id="qAgain" type="button">Another ten →</button>'
            + '</div>';
          var d = D();
          d.stats.xp = (d.stats.xp || 0) + right * 2;
          saveD(d);
          TB.Store.touchStreak(TB.Auth.userId());
          TB.App.refreshChips();
          return;
        }

        var q = qs[at];
        var sym = TB.Maths.OPS[op].sym;
        body.innerHTML = '<div class="card">'
          + '<div class="row"><span class="chip">' + (at + 1) + ' / ' + qs.length + '</span>'
          + '<div class="spacer" style="flex:1"></div>'
          + '<span class="tiny muted">' + right + ' right so far</span></div>'
          + '<div class="q-sum">' + q.a.toLocaleString('en-IN') + ' ' + sym + ' '
          + q.b.toLocaleString('en-IN') + ' =</div>'
          + '<div class="row"><input id="qAns" class="mnum" inputmode="numeric" '
          + 'autocomplete="off" placeholder="?" style="max-width:190px">'
          + '<button class="btn btn-primary" id="qGo" type="button">Check</button></div>'
          + '<div id="qMsg"></div></div>';

        var input = body.querySelector('#qAns');
        input.focus();

        function check() {
          var given = parseInt(input.value, 10);
          if (isNaN(given)) return;
          var msg = body.querySelector('#qMsg');
          var ok = given === q.answer;
          if (ok) right++;
          msg.innerHTML = ok
            ? '<div class="msg msg-ok mt">✓ ' + q.answer.toLocaleString('en-IN')
              + ' — ' + esc(TB.Numbers.enIndian(q.answer)) + '</div>'
            : '<div class="msg msg-err mt">✗ It is <b>' + q.answer.toLocaleString('en-IN')
              + '</b>, not ' + given.toLocaleString('en-IN') + '.'
              + ' <a href="#/maths" class="link-inline">See the working →</a></div>';
          body.querySelector('#qGo').disabled = true;
          input.disabled = true;
          setTimeout(function () {
            at++;
            if (at >= qs.length) done = true;
            draw();
          }, ok ? 800 : 2400);
        }

        body.querySelector('#qGo').addEventListener('click', check);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
      }

      root.querySelector('#qOp').addEventListener('click', function (e) {
        var b = e.target.closest('[data-op]');
        if (!b) return;
        root.querySelectorAll('#qOp .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        op = b.getAttribute('data-op');
        start();
      });
      root.querySelector('#qLv').addEventListener('click', function (e) {
        var b = e.target.closest('[data-lv]');
        if (!b) return;
        root.querySelectorAll('#qLv .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        level = +b.getAttribute('data-lv');
        start();
      });
      body.addEventListener('click', function (e) {
        if (e.target.closest('#qAgain')) start();
      });

      start();
    }
  };

  /* ----------------------------------------------------------- number chart */
  V.chart = {
    title: 'Number chart',
    sub: 'Every number with its name in English, தமிழ் and हिंदी',

    html: function () {
      return '<div class="view">'
        + '<div class="card"><div class="row">'
        +   '<span class="tiny muted">Show:</span>'
        +   '<div class="pill-row" id="cRange">'
        +     '<button class="pill on" data-r="1-20" type="button">1–20</button>'
        +     '<button class="pill" data-r="1-100" type="button">1–100</button>'
        +     '<button class="pill" data-r="1-1000" type="button">1–1,000</button>'
        +     '<button class="pill" data-r="tens" type="button">Tens</button>'
        +     '<button class="pill" data-r="hundreds" type="button">Hundreds</button>'
        +     '<button class="pill" data-r="big" type="button">Big numbers</button>'
        +     '<button class="pill" data-r="any" type="button">↔ Any range</button>'
        +   '</div>'
        + '</div>'
        /* Any two numbers, however far apart. A range too long to draw is
           walked through a page at a time rather than refused. */
        + '<div class="row mt" id="cAny" hidden>'
        +   '<span class="tiny muted">From</span>'
        +   '<input id="cFrom" class="mnum" style="max-width:150px" inputmode="numeric" '
        +     'aria-label="from" value="101">'
        +   '<span class="tiny muted">to</span>'
        +   '<input id="cTo" class="mnum" style="max-width:150px" inputmode="numeric" '
        +     'aria-label="to" value="2000">'
        +   '<button class="btn btn-sm btn-primary" id="cGo" type="button">Show</button>'
        + '</div>'
        /* And one number on its own, for somebody who only wants that one. */
        + '<div class="row mt">'
        +   '<span class="tiny muted">Find a number</span>'
        +   '<input id="cFind" class="mnum" style="max-width:190px" inputmode="numeric" '
        +     'aria-label="find a number" placeholder="4732">'
        +   '<button class="btn btn-sm" id="cFindGo" type="button">\u{1F50E} Find</button>'
        + '</div>'
        + '<div id="cNote"></div>'
        /* Which voices a tap plays. All three by default, because the three
           names share nothing and hearing them together is the point; one at
           a time for when a learner wants to drill just the one. */
        + '<div class="row mt"><span class="tiny muted">Hear:</span>'
        +   '<div class="pill-row" id="cVoice">'
        +     '<button class="pill on" data-v="all" type="button">\u{1F50A} All three</button>'
        +     '<button class="pill" data-v="en" type="button">English</button>'
        +     '<button class="pill" data-v="ta" type="button">\u0ba4\u0bae\u0bbf\u0bb4\u0bcd</button>'
        +     '<button class="pill" data-v="hi" type="button">\u0939\u093f\u0902\u0926\u0940</button>'
        +   '</div>'
        + '</div>'
        /* The same three the alphabet has: the whole page read aloud, the
           page read on from whichever number was tapped, and a Stop that is
           always within reach. */
        + '<div class="row mt"><span class="tiny muted">Read:</span>'
        +   '<div class="pill-row">'
        +     '<button class="btn btn-sm" id="cReadAll" type="button">\u25b6 Read this page</button>'
        +     '<button class="btn btn-sm" id="cReadFrom" type="button" hidden></button>'
        +     '<button class="btn btn-sm btn-stop" id="cStop" type="button" hidden>\u23f9 Stop</button>'
        +   '</div>'
        + '</div>'
        + '<div class="tiny muted mt">Tap any number to hear it read in English, \u0ba4\u0bae\u0bbf\u0bb4\u0bcd '
        +   'and \u0939\u093f\u0902\u0926\u0940, one after another. The name is underneath in all three, '
        +   'with the pronunciation below that.</div></div>'
        + '<div id="cBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#cBody');
      var range = '1-20';
      var voice = 'all';
      /* How many cells one page of the chart holds. Five hundred is a long
         page and a browser draws it without complaint; five hundred
         thousand is neither. */
      var PAGE = 500;
      /* As far as the number names go. */
      var MAX = 1000000000;
      var from = 101, to = 2000;
      var page = 0;
      var found = null;          /* a number asked for by name */

      var BIG = [1000, 5000, 10000, 50000, 100000, 500000, 1000000, 10000000];

      /* first, last and the gap between, for whichever range is chosen */
      function span() {
        if (range === '1-20') return { a: 1, b: 20, step: 1 };
        if (range === '1-100') return { a: 1, b: 100, step: 1 };
        if (range === '1-1000') return { a: 1, b: 1000, step: 1 };
        if (range === 'tens') return { a: 10, b: 100, step: 10 };
        if (range === 'hundreds') return { a: 100, b: 1000, step: 100 };
        return { a: from, b: to, step: 1 };
      }

      function howMany() {
        if (range === 'big') return BIG.length;
        var s = span();
        return Math.max(0, Math.floor((s.b - s.a) / s.step) + 1);
      }

      function pages() { return Math.max(1, Math.ceil(howMany() / PAGE)); }

      /* Only the numbers on the page being looked at. */
      function numbersFor() {
        if (range === 'big') return BIG.slice();
        var s = span(), out = [];
        var start = s.a + page * PAGE * s.step;
        for (var i = 0; i < PAGE; i++) {
          var n = start + i * s.step;
          if (n > s.b) break;
          out.push(n);
        }
        return out;
      }

      function note(html) {
        var el = root.querySelector('#cNote');
        if (el) el.innerHTML = html || '';
      }

      /* ‹ Previous   101–600 of 1,900 numbers   Next ›
         Only when there is more than one page to walk through. */
      function pager() {
        var n = pages();
        if (n <= 1) return '';
        var list = numbersFor();
        if (!list.length) return '';
        return '<div class="card"><div class="row" style="justify-content:center">'
          + '<button class="btn btn-sm" data-page="' + (page - 1) + '" type="button"'
          +   (page === 0 ? ' disabled' : '') + '>\u2039 Previous</button>'
          + '<span class="tiny muted" style="text-align:center;min-width:170px">'
          +   list[0].toLocaleString('en-IN') + '\u2013' + list[list.length - 1].toLocaleString('en-IN')
          +   '<br>page ' + (page + 1) + ' of ' + n.toLocaleString('en-IN')
          +   ' \u00b7 ' + howMany().toLocaleString('en-IN') + ' numbers</span>'
          + '<button class="btn btn-sm" data-page="' + (page + 1) + '" type="button"'
          +   (page >= n - 1 ? ' disabled' : '') + '>Next \u203a</button>'
          + '</div></div>';
      }

      function draw() {
        var list = numbersFor();
        var roomy = list.length <= 24;
        if (!list.length) {
          body.innerHTML = '<div class="empty">Nothing in that range. '
            + 'Check that the first number is not bigger than the second.</div>';
          return;
        }
        body.innerHTML = pager()
          + '<div class="card"><div class="num-chart' + (roomy ? ' roomy' : '') + '">'
          + list.map(function (n) {
              var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
              return '<button class="num-cell' + (n === found ? ' on found' : '')
                + '" data-n="' + n + '" type="button">'
                + '<span class="num-fig">' + n.toLocaleString('en-IN') + '</span>'
                + '<span class="num-en">' + esc(en) + '</span>'
                + '<span class="num-ta ta">' + esc(ta) + '</span>'
                + '<span class="num-hi hi">' + esc(hi) + '</span>'
                + '</button>';
            }).join('')
          + '</div></div>'
          + pager()
          + '<div id="cOne"></div>';

        if (shown) showOne(shown.n, false);
        if (found != null) {
          var cell = body.querySelector('.num-cell.found');
          if (cell) cell.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        /* The page under a reading has just been replaced, so whatever was
           being read is gone; and "read on from" only makes sense while the
           number it names is still on the page. */
        stopReading();
        markFrom();
      }

      root.querySelector('#cVoice').addEventListener('click', function (e) {
        var b = e.target.closest('[data-v]');
        if (!b) return;
        root.querySelectorAll('#cVoice .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        voice = b.getAttribute('data-v');
      });

      root.querySelector('#cRange').addEventListener('click', function (e) {
        var b = e.target.closest('[data-r]');
        if (!b) return;
        root.querySelectorAll('#cRange .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        range = b.getAttribute('data-r');
        page = 0; found = null;
        root.querySelector('#cAny').hidden = range !== 'any';
        note('');
        draw();
      });

      /* Two numbers, in either order, within what the names can say. */
      function applyRange() {
        var a = parseInt(root.querySelector('#cFrom').value, 10);
        var b = parseInt(root.querySelector('#cTo').value, 10);
        if (isNaN(a) || isNaN(b)) {
          note('<div class="msg msg-warn mt">Put a number in both boxes.</div>');
          return;
        }
        if (a > b) { var t = a; a = b; b = t; }     /* said backwards is still a range */
        var clipped = '';
        if (a < 0) { a = 0; clipped = 'The first number cannot be below zero.'; }
        if (b > MAX) {
          b = MAX;
          clipped = 'These names go up to ' + MAX.toLocaleString('en-IN') + '.';
        }
        from = a; to = b; range = 'any'; page = 0; found = null;
        root.querySelector('#cFrom').value = a;
        root.querySelector('#cTo').value = b;
        var count = howMany();
        note(clipped ? '<div class="msg msg-warn mt">' + clipped + '</div>'
             : (count > PAGE
                ? '<div class="tiny muted mt">' + count.toLocaleString('en-IN')
                  + ' numbers \u2014 shown ' + PAGE + ' to a page.</div>'
                : ''));
        draw();
      }

      /* One number, wherever it is. The chart opens at it rather than
         somebody hunting for it. */
      function findOne() {
        var n = parseInt(root.querySelector('#cFind').value, 10);
        if (isNaN(n)) { note('<div class="msg msg-warn mt">Type a number to find.</div>'); return; }
        if (n < 0 || n > MAX) {
          note('<div class="msg msg-warn mt">These names go from 0 to '
            + MAX.toLocaleString('en-IN') + '.</div>');
          return;
        }
        /* A hundred numbers starting at the one asked for, so it is seen in
           company rather than alone. */
        from = n; to = Math.min(MAX, n + 99);
        range = 'any'; page = 0; found = n;
        root.querySelectorAll('#cRange .pill').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-r') === 'any');
        });
        var any = root.querySelector('#cAny');
        any.hidden = false;
        root.querySelector('#cFrom').value = from;
        root.querySelector('#cTo').value = to;
        note('');
        showOne(n, true);
        draw();
      }

      root.querySelector('#cGo').addEventListener('click', applyRange);
      root.querySelector('#cFindGo').addEventListener('click', findOne);
      /* On the view's own element: #viewRoot outlives the visit, and a
         listener there piled up once per visit, each holding a whole chart. */
      (root.firstElementChild || root).addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        if (e.target.id === 'cFrom' || e.target.id === 'cTo') { e.preventDefault(); applyRange(); }
        if (e.target.id === 'cFind') { e.preventDefault(); findOne(); }
      });

      /* Kept outside the handler so the button under the chart can play the
         same number again without it being tapped a second time. */
      var shown = null;

      function say(all) {
        if (!shown) return;
        var one = body.querySelector('#cOne');
        if (all || voice === 'all') { V.sayAllThree(shown.en, shown.ta, shown.hi, one); return; }
        var text = voice === 'en' ? shown.en : voice === 'hi' ? shown.hi : shown.ta;
        TB.Speech.speak(text, voice, { rate: 0.78 });
      }

      /* ------------------------------------------------- reading the page */
      /* A run of numbers, each in whichever languages the chooser is set to,
         with the cell lit as it is said. The Stop appears while it runs. */
      var running = null;
      var lastTapped = null;

      function stopBtns(on) {
        var s = root.querySelector('#cStop');
        if (s) s.hidden = !on;
      }

      function clearLit() {
        body.querySelectorAll('.num-cell.saying').forEach(function (x) {
          x.classList.remove('saying');
        });
      }

      function stopReading() {
        if (running && running.cancel) running.cancel();
        running = null;
        TB.Speech.stop();
        clearLit();
        stopBtns(false);
      }

      function markFrom() {
        var b = root.querySelector('#cReadFrom');
        if (!b) return;
        var onPage = lastTapped != null && numbersFor().indexOf(lastTapped) >= 0;
        b.hidden = !onPage;
        if (onPage) b.textContent = '▶ Read on from ' + lastTapped.toLocaleString('en-IN');
      }

      function readNumbers(list) {
        stopReading();
        if (!list || !list.length) return;
        var steps = [], owner = [];
        list.forEach(function (n) {
          var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
          var want = voice === 'all'
            ? [[String(n), 'en'], [en, 'en'], [ta, 'ta'], [hi, 'hi']]
            : [[String(n), 'en'], [voice === 'en' ? en : voice === 'hi' ? hi : ta, voice]];
          want.forEach(function (p, i) {
            if (!p[0]) return;
            steps.push({ text: p[0], lang: p[1], rate: 0.78, pause: i === want.length - 1 ? 520 : 200 });
            owner.push(n);
          });
        });
        if (!steps.length) return;
        stopBtns(true);
        running = TB.Speech.sequence(steps, {
          onStep: function (step, i) {
            clearLit();
            var cell = body.querySelector('.num-cell[data-n="' + owner[i] + '"]');
            if (!cell) return;
            cell.classList.add('saying');
            if (!scrollWatch.moved()) cell.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        });
        running.then(function () { clearLit(); stopBtns(false); running = null; });
      }

      scrollWatch.arm();
      root.querySelector('#cReadAll').addEventListener('click', function () {
        scrollWatch.reset();
        readNumbers(numbersFor());
      });
      root.querySelector('#cReadFrom').addEventListener('click', function () {
        scrollWatch.reset();
        var all = numbersFor();
        var i = all.indexOf(lastTapped);
        readNumbers(i < 0 ? all : all.slice(i));
      });
      root.querySelector('#cStop').addEventListener('click', stopReading);

      /* The card under the chart. Written once, because a number can be
         arrived at by tapping it or by asking for it by name. */
      function showOne(n, speakIt) {
        var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
        shown = { n: n, en: en, ta: ta, hi: hi };
        var one = body.querySelector('#cOne');
        if (!one) return;
        one.innerHTML = cardFor(n, en, ta, hi);
        if (speakIt) say(false);
      }

      function cardFor(n, en, ta, hi) {
        return '<div class="card">'
          + '<div class="ab-value">' + n.toLocaleString('en-IN') + '</div>'
          + '<div class="lang-line"><div class="en">' + esc(en) + speak(en, 'en') + '</div>'
          + readAid(en, 'en') + '</div>'
          + '<div class="lang-line"><div class="ta">' + esc(ta) + speak(ta, 'ta') + '</div>'
          + readAid(ta, 'ta') + '</div>'
          + '<div class="lang-line"><div class="hi">' + esc(hi) + speak(hi, 'hi') + '</div>'
          + readAid(hi, 'hi') + '</div>'
          + '<button class="btn btn-primary mt" id="cAll" type="button">'
          +   '\u{1F50A} Hear all three again</button>'
          + '</div>';
      }

      body.addEventListener('click', function (e) {
        /* Hear the three again, whatever the chooser is set to — that is
           what the button says it does. */
        if (e.target.closest('#cAll')) { say(true); return; }

        var step = e.target.closest('[data-page]');
        if (step) {
          var want = +step.getAttribute('data-page');
          if (want < 0 || want >= pages()) return;
          page = want; found = null;
          draw();
          window.scrollTo(0, 0);
          return;
        }

        var cell = e.target.closest('[data-n]');
        if (!cell) return;
        var n = +cell.getAttribute('data-n');
        body.querySelectorAll('.num-cell').forEach(function (x) {
          x.classList.remove('on'); x.classList.remove('found');
        });
        cell.classList.add('on');
        found = null;
        /* Where a reading would pick up from, if asked. */
        lastTapped = n;
        markFrom();
        showOne(n, true);
      });

      draw();
      markFrom();
    }
  };
}());
