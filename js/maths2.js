/* Tamil Bridge — vertically and crosswise, and sums to practise.

   Urdhva Tiryagbhyam, the multiplication taught in Indian mental-maths
   classes alongside the abacus. Long multiplication writes a whole row for
   every digit and then adds the rows up; this writes one column at a time
   and never needs the rows at all, which is why it can be done in the head.

   The idea is one line long. To multiply 23 by 41, look at the digits:

       2 3        units:     3 × 1              = 3
       4 1        tens:      2 × 1  +  3 × 4    = 14      <- the cross
                  hundreds:  2 × 4              = 8

   then carry as usual: 943. Every column is the sum of the pairs of digits
   whose places add up to that column, which is why the pattern is a
   vertical line at the ends and a cross in the middle.                   */
window.TB = window.TB || {};

TB.Maths2 = (function () {

  /* Which pairs of digits meet in each column. For a and b written out as
     digit arrays, column k takes every a[i] × b[j] where i + j lands on k,
     counting places from the right. */
  function crosswise(a, b) {
    var A = String(Math.abs(Math.floor(a))).split('').map(Number);
    var B = String(Math.abs(Math.floor(b))).split('').map(Number);
    if (!A.length || !B.length) return null;
    if (A.length + B.length > 12) return null;      /* past a child's sum */

    /* A[i] stands in place 10^(n-1-i) and B[j] in 10^(m-1-j), so their
       product lands in column k = (n-1-i) + (m-1-j), counting k = 0 as the
       units. Rearranged, the pairs meeting in column k are those where
       i + j = n + m - 2 - k. That is the cross. */
    var n = A.length, m = B.length;
    var cols = [];                                   /* units first */
    for (var k = 0; k < n + m - 1; k++) {
      var want = n + m - 2 - k;
      var pairs = [];
      for (var i = 0; i < n; i++) {
        var j = want - i;
        if (j >= 0 && j < m) pairs.push({ a: A[i], b: B[j], product: A[i] * B[j] });
      }
      cols.push({
        pairs: pairs,
        sum: pairs.reduce(function (t, p) { return t + p.product; }, 0)
      });
    }

    /* carry along, right to left */
    var carry = 0, digits = [];
    cols.forEach(function (c, idx) {
      var total = c.sum + carry;
      c.carryIn = carry;
      c.total = total;
      c.digit = total % 10;
      carry = Math.floor(total / 10);
      c.carryOut = carry;
      c.place = idx;
      digits.unshift(c.digit);
    });
    while (carry > 0) { digits.unshift(carry % 10); carry = Math.floor(carry / 10); }

    var size = Number(digits.join('')) || 0;
    var sign = ((a < 0) !== (b < 0)) ? -1 : 1;
    var answer = size * sign;

    return {
      a: Math.abs(Math.floor(a)), b: Math.abs(Math.floor(b)),
      digitsA: A, digitsB: B,
      columns: cols,                                  /* units first */
      answer: answer,
      negative: sign < 0,
      /* The method must agree with plain multiplication, every time. */
      check: Math.floor(a) * Math.floor(b) === answer
    };
  }

  /* What each column is called, so the steps can be read aloud. */
  var PLACE = ['units', 'tens', 'hundreds', 'thousands', 'ten thousands',
               'lakhs', 'ten lakhs', 'crores', 'ten crores'];
  function placeName(i) { return PLACE[i] || ('place ' + (i + 1)); }

  /* ------------------------------------------------------------ practice

     Questions nobody has answered yet. Each level widens the numbers rather
     than changing the sum, so a child moves up when the same sum stops
     being hard rather than when a new kind appears. */
  var LEVELS = [
    { id: 1, en: 'First sums', range: [1, 9] },
    { id: 2, en: 'Two figures', range: [10, 99] },
    { id: 3, en: 'Three figures', range: [100, 999] },
    { id: 4, en: 'Big numbers', range: [1000, 9999] }
  ];

  function pick(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

  function question(op, level) {
    var lv = LEVELS.filter(function (l) { return l.id === level; })[0] || LEVELS[0];
    var lo = lv.range[0], hi = lv.range[1];
    var a = pick(lo, hi), b = pick(lo, hi);

    if (op === 'sub') {
      if (b > a) { var t = a; a = b; b = t; }          /* never below zero */
      return { a: a, b: b, op: op, answer: a - b };
    }
    if (op === 'mul') {
      /* multiplying two four-figure numbers is not practice, it is a chore */
      if (level >= 3) b = pick(2, 12);
      return { a: a, b: b, op: op, answer: a * b };
    }
    if (op === 'div') {
      /* build it from the answer, so it always comes out whole */
      var q = pick(2, level >= 3 ? 99 : 12);
      var d = pick(2, 12);
      return { a: q * d, b: d, op: op, answer: q };
    }
    return { a: a, b: b, op: op, answer: a + b };
  }

  /* A round of them, so a child can finish something. */
  function round(op, level, howMany) {
    var out = [], seen = {};
    var want = howMany || 10;
    var guard = 0;
    while (out.length < want && guard++ < want * 40) {
      var q = question(op, level);
      var key = q.a + '|' + q.b;
      if (seen[key]) continue;
      seen[key] = 1;
      out.push(q);
    }
    return out;
  }

  return {
    crosswise: crosswise,
    placeName: placeName,
    LEVELS: LEVELS,
    question: question,
    round: round
  };
})();
