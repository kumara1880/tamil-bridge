/* Tamil Bridge — arithmetic, worked out the way it is taught.

   Not a calculator. A calculator gives the answer; this gives the working,
   column by column, in the words a teacher would use — in English, Tamil
   and Hindi at once — so a child who has just met "carry the one" and an
   adult checking a bill are both reading the same explanation in whichever
   language they think in.

   Everything is integer arithmetic on digit arrays rather than on numbers,
   for two reasons: it is how the method is actually taught, and it keeps
   working past 2^53 where a JavaScript number quietly stops being exact.

   The vocabulary is the one used in Indian classrooms: इकाई / दहाई / सैकड़ा
   and ஒன்றுகள் / பத்துகள் / நூறுகள், lakh and crore rather than million.   */
window.TB = window.TB || {};

TB.Maths = (function () {

  /* Place names, ones first. Indian grouping, so after ten thousand comes
     lakh, not hundred thousand. */
  var PLACES = [
    { en: 'ones',          ta: 'ஒன்றுகள்',        hi: 'इकाई' },
    { en: 'tens',          ta: 'பத்துகள்',         hi: 'दहाई' },
    { en: 'hundreds',      ta: 'நூறுகள்',          hi: 'सैकड़ा' },
    { en: 'thousands',     ta: 'ஆயிரங்கள்',        hi: 'हज़ार' },
    { en: 'ten thousands', ta: 'பத்தாயிரங்கள்',    hi: 'दस हज़ार' },
    { en: 'lakhs',         ta: 'லட்சங்கள்',        hi: 'लाख' },
    { en: 'ten lakhs',     ta: 'பத்து லட்சங்கள்',  hi: 'दस लाख' },
    { en: 'crores',        ta: 'கோடிகள்',          hi: 'करोड़' },
    { en: 'ten crores',    ta: 'பத்து கோடிகள்',    hi: 'दस करोड़' }
  ];

  function place(i) {
    return PLACES[i] || { en: 'place ' + (i + 1), ta: 'இடம் ' + (i + 1), hi: 'स्थान ' + (i + 1) };
  }

  var OPS = {
    add: { sym: '+', en: 'plus',       ta: 'கூட்டல்',   hi: 'जोड़',
           doEn: 'Add',      doTa: 'கூட்டு',   doHi: 'जोड़ो' },
    sub: { sym: '−', en: 'minus',      ta: 'கழித்தல்',  hi: 'घटाव',
           doEn: 'Subtract', doTa: 'கழி',      doHi: 'घटाओ' },
    mul: { sym: '×', en: 'times',      ta: 'பெருக்கல்', hi: 'गुणा',
           doEn: 'Multiply', doTa: 'பெருக்கு', doHi: 'गुणा करो' },
    div: { sym: '÷', en: 'divided by', ta: 'வகுத்தல்',  hi: 'भाग',
           doEn: 'Divide',   doTa: 'வகு',      doHi: 'भाग दो' }
  };

  /* --------------------------------------------------------------- digits */

  function digitsOf(n) {
    return String(Math.abs(n)).replace(/^0+(?=\d)/, '').split('').map(Number);
  }
  function fromDigits(d) {
    var s = d.join('').replace(/^0+(?=\d)/, '');
    return s === '' ? '0' : s;
  }
  /* ones-first, which is the order the working runs in */
  function rev(d) { return d.slice().reverse(); }

  /* ------------------------------------------------------------- addition */

  function addWork(a, b) {
    var x = rev(digitsOf(a)), y = rev(digitsOf(b));
    var n = Math.max(x.length, y.length);
    var cols = [], carry = 0, out = [];

    for (var i = 0; i < n; i++) {
      var d1 = x[i] || 0, d2 = y[i] || 0;
      var sum = d1 + d2 + carry;
      var write = sum % 10, next = Math.floor(sum / 10);
      cols.push({ i: i, a: d1, b: d2, carryIn: carry, sum: sum, write: write, carryOut: next });
      out.push(write);
      carry = next;
    }
    if (carry) { out.push(carry); cols.push({ i: n, a: 0, b: 0, carryIn: carry, sum: carry, write: carry, carryOut: 0, last: true }); }

    var steps = cols.map(function (c) {
      var p = place(c.i);
      var sum = c.last
        ? 'the carried ' + c.carryIn
        : c.a + ' + ' + c.b + (c.carryIn ? ' + ' + c.carryIn + ' carried' : '');
      var sumTa = c.last
        ? 'எடுத்து வந்த ' + c.carryIn
        : c.a + ' + ' + c.b + (c.carryIn ? ' + எடுத்து வந்த ' + c.carryIn : '');
      var sumHi = c.last
        ? 'हासिल का ' + c.carryIn
        : c.a + ' + ' + c.b + (c.carryIn ? ' + हासिल का ' + c.carryIn : '');
      return {
        col: c.i,
        en: p.en.charAt(0).toUpperCase() + p.en.slice(1) + ': ' + sum + ' = ' + c.sum + '. '
          + 'Write ' + c.write + (c.carryOut ? ', carry ' + c.carryOut + ' to the ' + place(c.i + 1).en + '.' : '.'),
        ta: p.ta + ': ' + sumTa + ' = ' + c.sum + '. '
          + c.write + ' எழுது' + (c.carryOut ? ', ' + c.carryOut + ' ஐ ' + place(c.i + 1).ta + ' இடத்திற்கு எடுத்துச் செல்.' : '.'),
        hi: p.hi + ': ' + sumHi + ' = ' + c.sum + '. '
          + c.write + ' लिखो' + (c.carryOut ? ', ' + c.carryOut + ' ' + place(c.i + 1).hi + ' में हासिल।' : '।')
      };
    });

    return { columns: cols, steps: steps, answer: fromDigits(rev(out)) };
  }

  /* ---------------------------------------------------------- subtraction */

  function subWork(a, b) {
    /* work with the larger on top and remember the sign, because "3 − 8"
       still has to be explainable rather than refused */
    var negative = a < b;
    var top = rev(digitsOf(negative ? b : a));
    var bot = rev(digitsOf(negative ? a : b));
    var cols = [], out = [];
    var work = top.slice();

    for (var i = 0; i < top.length; i++) {
      var t = work[i], d = bot[i] || 0;
      var borrowedFrom = -1, borrowChain = [];
      if (t < d) {
        /* take one from the next place that has something to give; the
           zeros in between each become 9, which is the part that confuses
           people and so is spelled out */
        var j = i + 1;
        while (j < work.length && work[j] === 0) { borrowChain.push(j); j++; }
        if (j < work.length) {
          work[j] -= 1;
          borrowChain.forEach(function (k) { work[k] = 9; });
          work[i] += 10;
          t = work[i];
          borrowedFrom = j;
        }
      }
      var res = t - d;
      cols.push({ i: i, top: t, bot: d, res: res, borrowedFrom: borrowedFrom, borrowChain: borrowChain,
                  original: top[i] });
      out.push(res);
    }

    var steps = cols.map(function (c) {
      var p = place(c.i);
      var head = p.en.charAt(0).toUpperCase() + p.en.slice(1) + ': ';
      if (c.borrowedFrom < 0) {
        return {
          col: c.i,
          en: head + c.top + ' − ' + c.bot + ' = ' + c.res + '.',
          ta: p.ta + ': ' + c.top + ' − ' + c.bot + ' = ' + c.res + '.',
          hi: p.hi + ': ' + c.top + ' − ' + c.bot + ' = ' + c.res + '।'
        };
      }
      var from = place(c.borrowedFrom);
      var chainEn = c.borrowChain.length
        ? ' The ' + c.borrowChain.map(function (k) { return place(k).en; }).join(' and ')
          + ' had nothing to give, so each becomes 9.' : '';
      var chainTa = c.borrowChain.length
        ? ' ' + c.borrowChain.map(function (k) { return place(k).ta; }).join(', ')
          + ' இடத்தில் ஒன்றும் இல்லை, அதனால் அவை 9 ஆகின்றன.' : '';
      var chainHi = c.borrowChain.length
        ? ' ' + c.borrowChain.map(function (k) { return place(k).hi; }).join(' और ')
          + ' में कुछ नहीं था, इसलिए वे 9 बन जाते हैं।' : '';
      return {
        col: c.i,
        en: head + c.original + ' is smaller than ' + c.bot + ', so borrow 1 from the '
          + from.en + '.' + chainEn + ' Now ' + c.top + ' − ' + c.bot + ' = ' + c.res + '.',
        ta: p.ta + ': ' + c.original + ', ' + c.bot + ' ஐ விட சிறியது, எனவே ' + from.ta
          + ' இடத்திலிருந்து 1 கடன் வாங்கு.' + chainTa + ' இப்போது ' + c.top + ' − ' + c.bot + ' = ' + c.res + '.',
        hi: p.hi + ': ' + c.original + ', ' + c.bot + ' से छोटा है, इसलिए ' + from.hi
          + ' से 1 उधार लो।' + chainHi + ' अब ' + c.top + ' − ' + c.bot + ' = ' + c.res + '।'
      };
    });

    return { columns: cols, steps: steps, answer: (negative ? '-' : '') + fromDigits(rev(out)), negative: negative };
  }

  /* -------------------------------------------------------- multiplication */

  /* long multiplication on digit arrays, so 12345678 × 98765 stays exact */
  function mulDigits(a, b) {
    var x = rev(digitsOf(a)), y = rev(digitsOf(b));
    var res = new Array(x.length + y.length).fill(0);
    for (var i = 0; i < x.length; i++) {
      for (var j = 0; j < y.length; j++) {
        res[i + j] += x[i] * y[j];
      }
    }
    for (var k = 0; k < res.length; k++) {
      if (res[k] >= 10) {
        res[k + 1] = (res[k + 1] || 0) + Math.floor(res[k] / 10);
        res[k] %= 10;
      }
    }
    return fromDigits(rev(res));
  }

  function addStrings(a, b) {
    var x = rev(a.split('').map(Number)), y = rev(b.split('').map(Number));
    var n = Math.max(x.length, y.length), carry = 0, out = [];
    for (var i = 0; i < n; i++) {
      var s = (x[i] || 0) + (y[i] || 0) + carry;
      out.push(s % 10); carry = Math.floor(s / 10);
    }
    if (carry) out.push(carry);
    return fromDigits(rev(out));
  }

  function mulWork(a, b) {
    var y = rev(digitsOf(b));
    var partials = [], running = '0';

    for (var j = 0; j < y.length; j++) {
      if (y[j] === 0) {
        partials.push({ digit: 0, place: j, value: '0', shifted: '0', skipped: true });
        continue;
      }
      var v = mulDigits(a, y[j]);
      var shifted = v + new Array(j + 1).join('0');
      partials.push({ digit: y[j], place: j, value: v, shifted: shifted });
      running = addStrings(running, shifted);
    }

    var steps = partials.map(function (p) {
      var pl = place(p.place);
      if (p.skipped) {
        return {
          en: 'The ' + pl.en + ' digit is 0, so that row is all zeros — nothing to add.',
          ta: pl.ta + ' இலக்கம் 0, எனவே அந்த வரிசை முழுவதும் பூஜ்ஜியம் — கூட்ட ஒன்றுமில்லை.',
          hi: pl.hi + ' का अंक 0 है, इसलिए वह पंक्ति पूरी शून्य है — जोड़ने को कुछ नहीं।'
        };
      }
      var shiftEn = p.place === 0 ? ''
        : ' Because it is the ' + pl.en + ' digit, shift the answer ' + p.place
          + (p.place === 1 ? ' place' : ' places') + ' left: ' + p.shifted + '.';
      var shiftTa = p.place === 0 ? ''
        : ' இது ' + pl.ta + ' இலக்கம் என்பதால், விடையை ' + p.place + ' இடம் இடதுபுறம் நகர்த்து: ' + p.shifted + '.';
      var shiftHi = p.place === 0 ? ''
        : ' यह ' + pl.hi + ' का अंक है, इसलिए उत्तर को ' + p.place + ' स्थान बाएँ खिसकाओ: ' + p.shifted + '।';
      return {
        en: 'Multiply ' + a + ' by ' + p.digit + ' = ' + p.value + '.' + shiftEn,
        ta: a + ' ஐ ' + p.digit + ' ஆல் பெருக்கு = ' + p.value + '.' + shiftTa,
        hi: a + ' को ' + p.digit + ' से गुणा करो = ' + p.value + '।' + shiftHi
      };
    });

    var real = partials.filter(function (p) { return !p.skipped; });
    if (real.length > 1) {
      steps.push({
        en: 'Add the rows: ' + real.map(function (p) { return p.shifted; }).join(' + ') + ' = ' + running + '.',
        ta: 'வரிசைகளைக் கூட்டு: ' + real.map(function (p) { return p.shifted; }).join(' + ') + ' = ' + running + '.',
        hi: 'पंक्तियाँ जोड़ो: ' + real.map(function (p) { return p.shifted; }).join(' + ') + ' = ' + running + '।'
      });
    }

    /* For a small fact, say what multiplying actually means. This is the
       step an LKG child needs and everyone else already knows. */
    var repeated = null;
    if (a <= 10 && b <= 10 && b > 0) {
      repeated = {
        en: b + ' × ' + a + ' means ' + a + ' added ' + b + ' times: '
          + new Array(b + 1).join(a + ' + ').replace(/ \+ $/, '') + ' = ' + running + '.',
        ta: b + ' × ' + a + ' என்றால் ' + a + ' ஐ ' + b + ' முறை கூட்டுவது: '
          + new Array(b + 1).join(a + ' + ').replace(/ \+ $/, '') + ' = ' + running + '.',
        hi: b + ' × ' + a + ' का मतलब ' + a + ' को ' + b + ' बार जोड़ना: '
          + new Array(b + 1).join(a + ' + ').replace(/ \+ $/, '') + ' = ' + running + '।'
      };
    }

    return { partials: partials, steps: steps, answer: running, repeated: repeated };
  }

  /* ------------------------------------------------------------- division */

  function divWork(a, b) {
    if (b === 0) return null;
    var digits = digitsOf(a);
    var rows = [], quotient = [], carryText = '';
    var remainder = 0;

    for (var i = 0; i < digits.length; i++) {
      var cur = remainder * 10 + digits[i];
      var q = Math.floor(cur / b);
      var used = q * b;
      remainder = cur - used;
      quotient.push(q);
      rows.push({ i: i, brought: digits[i], value: cur, q: q, used: used, left: remainder,
                  /* nothing but zeros written so far, so this column is not
                     yet part of the answer */
                  leading: quotient.every(function (d) { return d === 0; }) });
    }

    var qStr = fromDigits(quotient);
    var steps = [];
    rows.forEach(function (r, k) {
      var pos = 'digit ' + (k + 1);
      if (r.q === 0 && r.leading) {
        steps.push({
          en: b + ' does not go into ' + r.value + ', so bring down the next digit.',
          ta: r.value + ' இல் ' + b + ' போகாது, எனவே அடுத்த இலக்கத்தை கீழே இறக்கு.',
          hi: r.value + ' में ' + b + ' नहीं जाता, इसलिए अगला अंक नीचे लाओ।'
        });
        return;
      }
      steps.push({
        en: 'How many ' + b + 's in ' + r.value + '? ' + r.q + ', because ' + b + ' × ' + r.q + ' = ' + r.used
          + '. ' + r.value + ' − ' + r.used + ' = ' + r.left + '.'
          + (k < rows.length - 1 ? ' Bring down the next digit.' : ''),
        ta: r.value + ' இல் ' + b + ' எத்தனை முறை? ' + r.q + ', ஏனெனில் ' + b + ' × ' + r.q + ' = ' + r.used
          + '. ' + r.value + ' − ' + r.used + ' = ' + r.left + '.'
          + (k < rows.length - 1 ? ' அடுத்த இலக்கத்தை கீழே இறக்கு.' : ''),
        hi: r.value + ' में ' + b + ' कितनी बार? ' + r.q + ', क्योंकि ' + b + ' × ' + r.q + ' = ' + r.used
          + '। ' + r.value + ' − ' + r.used + ' = ' + r.left + '।'
          + (k < rows.length - 1 ? ' अगला अंक नीचे लाओ।' : '')
      });
    });

    steps.push(remainder === 0 ? {
      en: 'Nothing is left over, so ' + a + ' ÷ ' + b + ' = ' + qStr + ' exactly.',
      ta: 'மீதி ஒன்றும் இல்லை, எனவே ' + a + ' ÷ ' + b + ' = ' + qStr + ' சரியாக வரும்.',
      hi: 'कुछ शेष नहीं बचा, इसलिए ' + a + ' ÷ ' + b + ' = ' + qStr + ' पूरा-पूरा।'
    } : {
      en: remainder + ' is left over at the end, and that is the remainder.',
      ta: 'இறுதியில் ' + remainder + ' மீதம் உள்ளது — அதுவே மீதி.',
      hi: 'अंत में ' + remainder + ' बच गया — यही शेषफल है।'
    });

    return {
      rows: rows, steps: steps, quotient: qStr, remainder: remainder,
      answer: remainder === 0 ? qStr : qStr + ' r ' + remainder,
      decimal: remainder === 0 ? null : (a / b)
    };
  }

  /* ---------------------------------------------------------------- public */

  var MAX = 999999999;    /* 99,99,99,999 — still exact, and still readable */

  var api = {
    PLACES: PLACES,
    OPS: OPS,
    MAX: MAX,
    place: place,

    /* Parse what someone typed: digits, spaces, commas and Indian grouping. */
    parse: function (s) {
      var t = String(s == null ? '' : s).trim().replace(/[,\s]/g, '');
      if (!t) return null;
      if (!/^-?\d+$/.test(t)) return null;
      var n = parseInt(t, 10);
      return isFinite(n) ? n : null;
    },

    /* The whole working for a ⊕ b. */
    solve: function (a, op, b) {
      if (!OPS[op]) return { ok: false, error: 'Choose + − × or ÷.' };
      if (a == null || b == null) return { ok: false, error: 'Type both numbers.' };
      if (a < 0 || b < 0) return { ok: false, error: 'Use whole numbers from 0 upwards.' };
      if (a > MAX || b > MAX) {
        return { ok: false, error: 'Keep each number at 99,99,99,999 or below so every step stays exact.' };
      }
      if (op === 'div' && b === 0) {
        return { ok: false,
          error: 'Nothing can be shared into 0 groups, so dividing by zero has no answer.',
          errorTa: '0 குழுக்களாகப் பிரிக்க முடியாது, எனவே பூஜ்ஜியத்தால் வகுக்க விடை இல்லை.',
          errorHi: '0 समूहों में नहीं बाँट सकते, इसलिए शून्य से भाग का कोई उत्तर नहीं।' };
      }

      var w, kind = op;
      if (op === 'add') w = addWork(a, b);
      else if (op === 'sub') w = subWork(a, b);
      else if (op === 'mul') w = mulWork(a, b);
      else w = divWork(a, b);

      var o = OPS[op];
      var lead = {
        en: o.doEn + ' ' + a + ' ' + o.sym + ' ' + b + '. Work from the right, one place at a time.',
        ta: a + ' ' + o.sym + ' ' + b + ' — ' + o.doTa + '. வலமிருந்து இடமாக, ஒரு இடமாக செய்.',
        hi: a + ' ' + o.sym + ' ' + b + ' — ' + o.doHi + '। दाएँ से बाएँ, एक-एक स्थान।'
      };
      if (op === 'mul') {
        lead = {
          en: o.doEn + ' ' + a + ' by ' + b + '. Take one digit of ' + b + ' at a time.',
          ta: a + ' ஐ ' + b + ' ஆல் ' + o.doTa + '. ' + b + ' இன் ஒவ்வொரு இலக்கமாக எடு.',
          hi: a + ' को ' + b + ' से ' + o.doHi + '। ' + b + ' का एक-एक अंक लो।'
        };
      }
      if (op === 'div') {
        lead = {
          en: 'Share ' + a + ' into groups of ' + b + '. Start from the left.',
          ta: a + ' ஐ ' + b + ' குழுக்களாகப் பிரி. இடமிருந்து தொடங்கு.',
          hi: a + ' को ' + b + ' के समूहों में बाँटो। बाएँ से शुरू करो।'
        };
      }

      var steps = [lead].concat(w.steps);
      if (op === 'mul' && w.repeated) steps.splice(1, 0, w.repeated);

      /* How to check it yourself — the habit that makes arithmetic stick. */
      var check = null;
      if (op === 'add') check = {
        en: 'Check: ' + w.answer + ' − ' + b + ' should give ' + a + '.',
        ta: 'சரிபார்: ' + w.answer + ' − ' + b + ' = ' + a + ' வர வேண்டும்.',
        hi: 'जाँच: ' + w.answer + ' − ' + b + ' = ' + a + ' आना चाहिए।'
      };
      else if (op === 'sub' && !w.negative) check = {
        en: 'Check: ' + w.answer + ' + ' + b + ' should give ' + a + '.',
        ta: 'சரிபார்: ' + w.answer + ' + ' + b + ' = ' + a + ' வர வேண்டும்.',
        hi: 'जाँच: ' + w.answer + ' + ' + b + ' = ' + a + ' आना चाहिए।'
      };
      else if (op === 'mul' && b !== 0) check = {
        en: 'Check: ' + w.answer + ' ÷ ' + b + ' should give ' + a + '.',
        ta: 'சரிபார்: ' + w.answer + ' ÷ ' + b + ' = ' + a + ' வர வேண்டும்.',
        hi: 'जाँच: ' + w.answer + ' ÷ ' + b + ' = ' + a + ' आना चाहिए।'
      };
      else if (op === 'div') check = {
        en: 'Check: ' + b + ' × ' + w.quotient + (w.remainder ? ' + ' + w.remainder : '') + ' should give ' + a + '.',
        ta: 'சரிபார்: ' + b + ' × ' + w.quotient + (w.remainder ? ' + ' + w.remainder : '') + ' = ' + a + ' வர வேண்டும்.',
        hi: 'जाँच: ' + b + ' × ' + w.quotient + (w.remainder ? ' + ' + w.remainder : '') + ' = ' + a + ' आना चाहिए।'
      };

      return {
        ok: true, a: a, b: b, op: op, kind: kind, sym: o.sym,
        answer: w.answer,
        numeric: op === 'add' ? a + b : op === 'sub' ? a - b : op === 'mul' ? a * b : Math.floor(a / b),
        columns: w.columns || null,
        partials: w.partials || null,
        rows: w.rows || null,
        quotient: w.quotient, remainder: w.remainder, decimal: w.decimal,
        negative: !!w.negative,
        steps: steps,
        check: check
      };
    },

    /* The times table for n, which is where multiplication is learnt. */
    table: function (n, upto) {
      upto = upto || 10;
      var out = [];
      for (var i = 1; i <= upto; i++) out.push({ i: i, product: n * i });
      return out;
    },

    /* A practice sum pitched at a level: 1 counting, 2 school, 3 adult. */
    practice: function (op, level) {
      function pick(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
      var a, b;
      if (level <= 1) { a = pick(1, 9); b = pick(1, 9); }
      else if (level === 2) { a = pick(10, 999); b = pick(10, 99); }
      else { a = pick(1000, 99999999); b = pick(11, 9999); }

      if (op === 'sub' && b > a) { var t = a; a = b; b = t; }
      if (op === 'mul' && level >= 3) { a = pick(100, 99999); b = pick(11, 999); }
      if (op === 'div') {
        if (level <= 1) { b = pick(2, 9); a = b * pick(1, 9); }
        else if (level === 2) { b = pick(2, 12); a = b * pick(5, 99) + pick(0, b - 1); }
        else { b = pick(11, 999); a = b * pick(100, 9999) + pick(0, b - 1); }
      }
      return { a: a, b: b, op: op };
    }
  };

  return api;
})();
