/* Tamil Bridge — counting in fives, the way it is done on a slate.

   Four strokes and a line across them. It is the oldest counting there is
   and it is still the first a child meets, because it needs nothing but a
   surface and it can be read at a glance: you do not count fourteen marks,
   you count two fives and four.

   Drawn as line segments rather than characters, because the glyph for a
   tally does not exist in most fonts and a child should see the stroke go
   down and the fifth go across.                                          */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;

  /* One group of up to five: four uprights and the fifth struck across. */
  function group(n) {
    var W = 46, H = 40, x0 = 5, gap = 9;
    var marks = '';
    for (var i = 0; i < Math.min(n, 4); i++) {
      var x = x0 + i * gap;
      marks += '<line x1="' + x + '" y1="4" x2="' + x + '" y2="' + (H - 4) + '"/>';
    }
    if (n >= 5) {
      marks += '<line class="fifth" x1="' + (x0 - 4) + '" y1="' + (H - 6)
             + '" x2="' + (x0 + 3 * gap + 5) + '" y2="6"/>';
    }
    return '<svg class="tally-group" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">'
         + marks + '</svg>';
  }

  function tally(n) {
    n = Math.max(0, Math.floor(n));
    /* The slate stays on the page when it is empty. A board that vanishes
       when you rub it out is not a board — and the buttons underneath
       jump up the screen when it goes. */
    var out = '';
    if (!n) out = '<div class="tally-empty">nothing yet — press <b>+ one more</b></div>';
    var left = n;
    while (left > 0) { out += group(Math.min(5, left)); left -= 5; }
    return '<div class="tally">' + out + '</div>';
  }

  V.count = {
    title: 'Counting',
    sub: 'Four strokes and one across — count in fives, the way you would on a slate',

    html: function () {
      return '<div class="view">'
        + '<div class="card"><div class="row"><div class="pill-row" id="tMode">'
        +   '<button class="pill on" data-m="make" type="button">✋ Count them out</button>'
        +   '<button class="pill" data-m="read" type="button">\u{1F440} How many is this?</button>'
        + '</div></div>'
        + '<div class="tiny muted mt">Five is four strokes with one drawn across them, so a group '
        +   'of five can be seen without counting it.</div></div>'
        + '<div id="tBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#tBody');
      var mode = 'make';
      var n = 0;
      var target = null, answered = false;

      /* The same three names as the number chart, so the same button to
         hear them read one after another. */
      var named = null;

      function names(k) {
        var en = TB.Numbers.enIndian(k), ta = TB.Numbers.ta(k), hi = TB.Numbers.hi(k);
        named = { en: en, ta: ta, hi: hi };
        return '<div class="say-all">'
          + '<div class="lang-line"><div class="en">' + esc(en) + speak(en, 'en') + '</div>'
          + readAid(en, 'en') + '</div>'
          + '<div class="lang-line"><div class="ta">' + esc(ta) + speak(ta, 'ta') + '</div>'
          + readAid(ta, 'ta') + '</div>'
          + '<div class="lang-line"><div class="hi">' + esc(hi) + speak(hi, 'hi') + '</div>'
          + readAid(hi, 'hi') + '</div>'
          + '<button class="btn btn-sm mt" data-all="1" type="button">'
          +   '\u{1F50A} Hear all three</button></div>';
      }

      function make() {
        var fives = Math.floor(n / 5), rest = n % 5;
        body.innerHTML = '<div class="card">'
          + tally(n)
          + '<div class="row mt" style="justify-content:center">'
          +   '<button class="btn btn-primary" id="tAdd" type="button">+ one more</button>'
          +   '<button class="btn btn-sm" id="tBack" type="button">− take one off</button>'
          +   '<button class="btn btn-sm" id="tClear" type="button">Rub it out</button>'
          + '</div></div>'
          + '<div class="card">'
          +   '<div class="ab-value">' + n + '</div>'
          +   (n >= 5
              ? '<div class="card-sub">' + fives + (fives === 1 ? ' five' : ' fives')
                + (rest ? ' and ' + rest : '') + '  —  '
                + fives + ' × 5' + (rest ? ' + ' + rest : '') + ' = ' + n + '</div>'
              : '<div class="card-sub">Not a full five yet.</div>')
          +   names(n)
          + '</div>';
      }

      function read() {
        if (target === null) { target = 1 + Math.floor(Math.random() * 24); answered = false; }
        body.innerHTML = '<div class="card">'
          + '<div class="ab-ask">How many strokes is this?</div>'
          + tally(target)
          + '<div class="row mt"><input id="tAns" class="mnum" inputmode="numeric" '
          +   'placeholder="?" style="max-width:150px">'
          +   '<button class="btn btn-primary" id="tCheck" type="button">Check</button></div>'
          + '<div id="tMsg"></div></div>';
        var input = body.querySelector('#tAns');
        input.focus();

        function check() {
          if (answered) return;
          var got = parseInt(input.value, 10);
          if (isNaN(got)) return;
          answered = true;
          var ok = got === target;
          if (ok) {
            var d = D(); d.stats.xp = (d.stats.xp || 0) + 2; saveD(d);
            TB.App.refreshChips();
          }
          body.querySelector('#tMsg').innerHTML =
            (ok ? '<div class="msg msg-ok mt">✓ ' + target + '</div>'
                : '<div class="msg msg-err mt">✗ It is <b>' + target + '</b> — '
                  + Math.floor(target / 5) + ' full '
                  + (Math.floor(target / 5) === 1 ? 'five' : 'fives')
                  + (target % 5 ? ' and ' + (target % 5) + ' more' : '') + '.</div>')
            + '<div class="mt">' + names(target) + '</div>'
            + '<button class="btn btn-primary mt" id="tNext" type="button">Another one →</button>';
        }
        body.querySelector('#tCheck').addEventListener('click', check);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
      }

      function draw() { if (mode === 'make') make(); else read(); }

      root.querySelector('#tMode').addEventListener('click', function (e) {
        var b = e.target.closest('[data-m]');
        if (!b) return;
        root.querySelectorAll('#tMode .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        mode = b.getAttribute('data-m');
        if (mode === 'read') { target = null; }
        draw();
      });

      body.addEventListener('click', function (e) {
        if (e.target.closest('#tAdd')) { n = Math.min(n + 1, 60); draw(); return; }
        if (e.target.closest('#tBack')) { n = Math.max(0, n - 1); draw(); return; }
        if (e.target.closest('#tClear')) { n = 0; draw(); return; }
        if (e.target.closest('#tNext')) { target = null; draw(); return; }
        var all = e.target.closest('[data-all]');
        if (all && named) {
          V.sayAllThree(named.en, named.ta, named.hi, all.closest('.say-all'));
        }
      });

      draw();
    }
  };

  /* Shared, so the number chart can show a tally beside the small numbers. */
  V.tallyMarks = tally;
}());
