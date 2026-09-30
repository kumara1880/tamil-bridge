/* Tamil Bridge — Maths.

   The sum is set out the way it is written on paper, the working is read
   out step by step in English, Tamil and Hindi at once, and the answer is
   given in words in all three as well as in digits. A child who cannot yet
   read the words can count the dots; an adult checking a bill can read the
   crore.                                                                    */
(function () {
  var V = TB.Views;
  var esc = V.esc, speakBtn = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;

  var LANGS = [
    { c: 'en', label: 'English' },
    { c: 'ta', label: 'தமிழ்' },
    { c: 'hi', label: 'हिंदी' }
  ];

  /* The sum laid out in columns, the way it is written on paper. */
  function column(res) {
    var a = String(res.a), b = String(res.b);
    var ans = String(res.answer);
    var width = Math.max(a.length, b.length, ans.length) + 1;

    function row(text, cls, lead) {
      var pad = width - text.length - (lead ? 1 : 0);
      var cells = '';
      for (var i = 0; i < pad; i++) cells += '<span class="mcell"></span>';
      if (lead) cells += '<span class="mcell mop">' + esc(lead) + '</span>';
      text.split('').forEach(function (ch) {
        cells += '<span class="mcell' + (cls ? ' ' + cls : '') + '">' + esc(ch) + '</span>';
      });
      return '<div class="mrow">' + cells + '</div>';
    }

    /* the little carried or borrowed digits that float above the sum */
    var marks = '';
    if (res.columns && res.kind === 'add') {
      var carry = [];
      res.columns.forEach(function (c) { if (c.carryOut) carry[c.i + 1] = c.carryOut; });
      if (carry.length) {
        var cells = '';
        for (var i = width - 1; i >= 0; i--) {
          var d = carry[i];
          cells += '<span class="mcell mmark">' + (d != null ? d : '') + '</span>';
        }
        marks = '<div class="mrow">' + cells + '</div>';
      }
    }
    if (res.columns && res.kind === 'sub') {
      var borrow = [];
      res.columns.forEach(function (c) { if (c.borrowedFrom >= 0) borrow[c.i] = '•'; });
      if (borrow.length) {
        var bc = '';
        for (var j = width - 1; j >= 0; j--) bc += '<span class="mcell mmark">' + (borrow[j] || '') + '</span>';
        marks = '<div class="mrow">' + bc + '</div>';
      }
    }

    return '<div class="msum">' + marks + row(a) + row(b, '', res.sym)
      + '<div class="mline"></div>' + row(ans, 'mans') + '</div>';
  }

  /* Counting dots — the only explanation that works before you can read. */
  function dots(n, cls) {
    if (n > 20) return '';
    var out = '';
    for (var i = 0; i < n; i++) out += '<i class="mdot ' + (cls || '') + '"></i>';
    return '<span class="mdots">' + out + '</span>';
  }

  function countingCard(res) {
    if (res.a > 20 || res.b > 20) return '';
    if (res.kind === 'div' && res.b === 0) return '';
    var head, body;
    if (res.kind === 'add') {
      head = 'Count them together';
      body = dots(res.a, 'a') + '<span class="mplus">+</span>' + dots(res.b, 'b')
           + '<span class="mplus">=</span><b>' + res.answer + '</b>';
    } else if (res.kind === 'sub') {
      if (res.negative) return '';
      head = 'Take them away';
      body = dots(res.a, 'a') + '<span class="mplus">−</span>' + dots(res.b, 'b')
           + '<span class="mplus">=</span><b>' + res.answer + '</b>';
    } else if (res.kind === 'mul') {
      if (res.a * res.b > 40) return '';
      head = res.b + ' groups of ' + res.a;
      body = '';
      for (var g = 0; g < res.b; g++) body += '<span class="mgroup">' + dots(res.a, 'a') + '</span>';
      body += '<span class="mplus">=</span><b>' + res.answer + '</b>';
    } else {
      if (res.a > 40) return '';
      head = res.a + ' shared into groups of ' + res.b;
      body = '';
      for (var k = 0; k < res.quotient; k++) body += '<span class="mgroup">' + dots(res.b, 'a') + '</span>';
      if (res.remainder) body += '<span class="mgroup mleft">' + dots(res.remainder, 'b') + '</span>';
      body += '<span class="mplus">=</span><b>' + res.quotient
            + (res.remainder ? ' groups, ' + res.remainder + ' left over' : ' groups') + '</b>';
    }
    return '<div class="card"><h3>' + esc(head) + '</h3>'
      + '<div class="card-sub">For anyone still learning their numbers — just count</div>'
      + '<div class="mcount">' + body + '</div></div>';
  }

  /* The answer, in digits and in all three languages. */
  function answerCard(res) {
    var n = res.numeric;
    var words = { en: '', ta: '', hi: '' };
    var indian = '';
    if (res.kind === 'div' && res.remainder) {
      words.en = TB.Numbers.enIndian(res.quotient) + ', remainder ' + TB.Numbers.enIndian(res.remainder);
      words.ta = TB.Numbers.ta(+res.quotient) + ', மீதி ' + TB.Numbers.ta(res.remainder);
      words.hi = TB.Numbers.hi(+res.quotient) + ', शेष ' + TB.Numbers.hi(res.remainder);
      indian = TB.Numbers.indianGroups(+res.quotient);
    } else if (!res.negative && String(res.answer).length <= 12) {
      var val = Math.abs(+String(res.answer).replace(/[^0-9]/g, ''));
      words.en = TB.Numbers.enIndian(val);
      words.ta = TB.Numbers.ta(val);
      words.hi = TB.Numbers.hi(val);
      indian = TB.Numbers.indianGroups(val);
    }

    var rows = LANGS.map(function (L) {
      if (!words[L.c]) return '';
      return '<div class="mword">'
        + '<div class="tiny muted">' + esc(L.label) + '</div>'
        + '<div class="' + L.c + '" style="font-size:calc(19px * var(--fs,1));font-weight:650;line-height:1.5">'
        + esc(words[L.c]) + speakBtn(words[L.c], L.c) + '</div>'
        + readAid(words[L.c], L.c)
        + '</div>';
    }).join('');

    return '<div class="card"><div class="card-head"><div>'
      + '<h3>' + esc(String(res.a) + ' ' + res.sym + ' ' + String(res.b)) + '</h3>'
      + '<div class="card-sub">' + (indian ? 'Indian grouping: ' + esc(indian) : '') + '</div></div>'
      + '<div class="spacer"></div></div>'
      + '<div class="manswer">' + esc(res.answer) + '</div>'
      + (res.kind === 'div' && res.decimal
          ? '<div class="tiny muted mb">As a decimal: ' + res.decimal.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + '…</div>'
          : '')
      + '<div class="mwords">' + rows + '</div></div>';
  }

  V.maths = {
    title: 'Maths', sub: 'Add, take away, multiply and divide — with the working shown',
    html: function () {
      var ops = Object.keys(TB.Maths.OPS).map(function (k) {
        var o = TB.Maths.OPS[k];
        return '<button class="pill' + (k === 'add' ? ' on' : '') + '" data-op="' + k + '" type="button">'
             + o.sym + '</button>';
      }).join('');

      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="msetup">'
        +     '<input id="mA" type="text" inputmode="numeric" placeholder="25" class="mnum">'
        +     '<div class="pill-row" id="mOps">' + ops + '</div>'
        +     '<input id="mB" type="text" inputmode="numeric" placeholder="17" class="mnum">'
        +     '<button class="btn btn-primary" id="mGo" type="button">=</button>'
        +   '</div>'
        +   '<div class="row mt">'
        +     '<span class="tiny muted">Try:</span>'
        +     '<div class="pill-row" id="mLevel">'
        +       '<button class="pill" data-lv="1" type="button">Beginner</button>'
        +       '<button class="pill" data-lv="2" type="button">School</button>'
        +       '<button class="pill" data-lv="3" type="button">Big numbers</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="tiny muted mt">Whole numbers up to 99,99,99,999. Every step is shown, '
        +     'and read out in English, Tamil and Hindi.</div>'
        + '</div>'
        + '<div id="mOut"></div>'
        + '</div>';
    },

    mount: function (root) {
      var op = 'add';
      var out = root.querySelector('#mOut');
      var A = root.querySelector('#mA'), B = root.querySelector('#mB');
      var reading = null;

      root.querySelector('#mOps').addEventListener('click', function (e) {
        var b = e.target.closest('[data-op]');
        if (!b) return;
        op = b.getAttribute('data-op');
        root.querySelectorAll('#mOps .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        if (A.value && B.value) go();
      });

      root.querySelector('#mLevel').addEventListener('click', function (e) {
        var b = e.target.closest('[data-lv]');
        if (!b) return;
        var p = TB.Maths.practice(op, +b.getAttribute('data-lv'));
        A.value = p.a; B.value = p.b;
        go();
      });

      root.querySelector('#mGo').addEventListener('click', go);
      [A, B].forEach(function (el) {
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      });

      function stop() {
        if (reading) { reading.cancel(); reading = null; }
        out.querySelectorAll('.mstep').forEach(function (el) { el.classList.remove('now'); });
        var b = out.querySelector('#mPlay');
        if (b) b.textContent = '▶ Read the steps';
      }

      function go() {
        stop();
        var a = TB.Maths.parse(A.value), b = TB.Maths.parse(B.value);
        var res = TB.Maths.solve(a, op, b);
        if (!res.ok) {
          out.innerHTML = '<div class="card"><div class="msg msg-warn">' + esc(res.error) + '</div>'
            + (res.errorTa ? '<div class="tiny ta">' + esc(res.errorTa) + '</div>' : '')
            + (res.errorHi ? '<div class="tiny hi">' + esc(res.errorHi) + '</div>' : '')
            + '</div>';
          return;
        }

        out.innerHTML = answerCard(res)
          + '<div class="card"><h3>How it is written</h3>'
          +   '<div class="card-sub">Set out in columns, right to left</div>'
          +   column(res)
          + '</div>'
          + countingCard(res)
          + '<div class="card"><div class="card-head"><div><h3>Step by step</h3>'
          +   '<div class="card-sub">Every line in all three languages</div></div><div class="spacer"></div></div>'
          +   '<div class="row mb"><button class="btn btn-primary btn-sm" id="mPlay" type="button">▶ Read the steps</button>'
          +   '<div class="pill-row" id="mSpeakLang">'
          +     LANGS.map(function (L, i) {
                  return '<button class="pill' + (i === 0 ? ' on' : '') + '" data-sl="' + L.c + '" type="button">'
                       + esc(L.label) + '</button>';
                }).join('')
          +   '</div></div>'
          +   res.steps.map(function (s, i) {
                return '<div class="mstep" data-step="' + i + '">'
                  + '<div class="mstepn">' + (i + 1) + '</div><div>'
                  + '<div>' + esc(s.en) + '</div>'
                  + '<div class="ta tiny" style="color:var(--teal)">' + esc(s.ta) + '</div>'
                  + '<div class="hi tiny" style="color:var(--purple)">' + esc(s.hi) + '</div>'
                  + '</div></div>';
              }).join('')
          +   (res.check ? '<div class="mcheck"><div>' + esc(res.check.en) + '</div>'
                + '<div class="ta tiny">' + esc(res.check.ta) + '</div>'
                + '<div class="hi tiny">' + esc(res.check.hi) + '</div></div>' : '')
          + '</div>'
          + (op === 'mul' ? tableCard(res.b) : '');

        var lang = 'en';
        out.querySelector('#mSpeakLang').addEventListener('click', function (e) {
          var t = e.target.closest('[data-sl]');
          if (!t) return;
          stop();
          lang = t.getAttribute('data-sl');
          out.querySelectorAll('#mSpeakLang .pill').forEach(function (x) { x.classList.remove('on'); });
          t.classList.add('on');
        });

        out.querySelector('#mPlay').addEventListener('click', function () {
          if (reading) { stop(); return; }
          /* Do not refuse before trying: with no voice on the device the
             online one is used, and only if that fails is there nothing. */
          var prefs = D().prefs;
          this.textContent = '⏹ Stop';
          reading = TB.Speech.sequence(res.steps.map(function (s) {
            return { text: s[lang], lang: lang, rate: (prefs.rate || 0.9) * 0.92, pause: 520 };
          }), {
            rate: prefs.rate, pitch: prefs.pitch,
            voiceNames: { ta: prefs.voiceTa, en: prefs.voiceEn, hi: prefs.voiceHi },
            onStep: function (s, i) {
              out.querySelectorAll('.mstep').forEach(function (el) { el.classList.remove('now'); });
              var el = out.querySelector('.mstep[data-step="' + i + '"]');
              if (el) { el.classList.add('now'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
            }
          });
          reading.then(stop);
        });

        out.querySelectorAll('.mstep').forEach(function (el) {
          el.addEventListener('click', function () {
            stop();
            var s = res.steps[+el.getAttribute('data-step')];
            el.classList.add('now');
            TB.Speech.speak(s[lang], lang, { rate: 0.75 }).then(function () { el.classList.remove('now'); });
          });
        });

        var d = D(); d.stats.xp = (d.stats.xp || 0) + 1; saveD(d);
        TB.Store.touchStreak(TB.Auth.userId());
        TB.App.refreshChips();
      }

      function tableCard(n) {
        if (n < 1 || n > 20) return '';
        return '<div class="card"><h3>The ' + n + ' times table</h3>'
          + '<div class="card-sub">Learn this and the multiplying above becomes easy</div>'
          + '<div class="mtable">'
          + TB.Maths.table(n).map(function (r) {
              return '<div class="mtrow"><span>' + n + ' × ' + r.i + '</span><b>' + r.product + '</b>'
                + speakBtn(n + ' times ' + r.i + ' is ' + r.product, 'en') + '</div>';
            }).join('')
          + '</div></div>';
      }

      /* start with something on screen rather than an empty page */
      A.value = 25; B.value = 17; go();
    }
  };
}());
