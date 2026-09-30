/* Tamil Bridge — vertically and crosswise, sums to practise, and the
   number chart.

   Three things a child needs beside a worked example: a faster way to
   multiply, questions nobody has answered for them, and somewhere to see
   the numbers laid out with their names in all three languages.          */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;
  var M2 = TB.Maths2;

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
        +     '<button class="pill" data-r="tens" type="button">Tens</button>'
        +     '<button class="pill" data-r="hundreds" type="button">Hundreds</button>'
        +     '<button class="pill" data-r="big" type="button">Big numbers</button>'
        +   '</div>'
        + '</div>'
        + '<div class="tiny muted mt">Tap any number to hear it. The name is underneath in all '
        +   'three languages, with the pronunciation below that.</div></div>'
        + '<div id="cBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#cBody');
      var range = '1-20';

      function numbersFor(r) {
        var out = [], i;
        if (r === '1-20') { for (i = 1; i <= 20; i++) out.push(i); }
        else if (r === '1-100') { for (i = 1; i <= 100; i++) out.push(i); }
        else if (r === 'tens') { for (i = 10; i <= 100; i += 10) out.push(i); }
        else if (r === 'hundreds') { for (i = 100; i <= 1000; i += 100) out.push(i); }
        else out = [1000, 5000, 10000, 50000, 100000, 500000, 1000000, 10000000];
        return out;
      }

      function draw() {
        var list = numbersFor(range);
        var big = list.length <= 24;
        body.innerHTML = '<div class="card"><div class="num-chart' + (big ? ' roomy' : '') + '">'
          + list.map(function (n) {
              var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
              return '<button class="num-cell" data-n="' + n + '" type="button">'
                + '<span class="num-fig">' + n.toLocaleString('en-IN') + '</span>'
                + '<span class="num-en">' + esc(en) + '</span>'
                + '<span class="num-ta ta">' + esc(ta) + '</span>'
                + '<span class="num-hi hi">' + esc(hi) + '</span>'
                + '</button>';
            }).join('')
          + '</div></div>'
          + '<div id="cOne"></div>';
      }

      root.querySelector('#cRange').addEventListener('click', function (e) {
        var b = e.target.closest('[data-r]');
        if (!b) return;
        root.querySelectorAll('#cRange .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        range = b.getAttribute('data-r');
        draw();
      });

      body.addEventListener('click', function (e) {
        var cell = e.target.closest('[data-n]');
        if (!cell) return;
        var n = +cell.getAttribute('data-n');
        var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
        body.querySelectorAll('.num-cell').forEach(function (x) { x.classList.remove('on'); });
        cell.classList.add('on');
        root.querySelector('#cOne').innerHTML = '<div class="card">'
          + '<div class="ab-value">' + n.toLocaleString('en-IN') + '</div>'
          + '<div class="lang-line"><div class="en">' + esc(en) + speak(en, 'en') + '</div>'
          + readAid(en, 'en') + '</div>'
          + '<div class="lang-line"><div class="ta">' + esc(ta) + speak(ta, 'ta') + '</div>'
          + readAid(ta, 'ta') + '</div>'
          + '<div class="lang-line"><div class="hi">' + esc(hi) + speak(hi, 'hi') + '</div>'
          + readAid(hi, 'hi') + '</div></div>';
        TB.Speech.speak(ta, 'ta', { rate: 0.75 });
      });

      draw();
    }
  };
}());
