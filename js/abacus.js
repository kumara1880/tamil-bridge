/* Tamil Bridge — the abacus.

   The soroban, which is the one Indian abacus classes teach. Each rod has
   one bead above the bar worth five, and four below it worth one. A bead
   counts only when it is pushed towards the bar, so a whole number sits on
   the frame at once and a child can see it rather than remember it.

   Why it earns its place in a app about language: a number on an abacus
   has no language. A child who cannot yet read "four hundred and six" can
   set 406 on the rods and then hear it called that in English, in Tamil
   and in Hindi — the beads carry the meaning while the words are still
   being learnt.

   The whole thing is arithmetic on an array of small integers, so it works
   offline, needs nothing, and cannot drift out of step with the Numbers
   section: both ask TB.Numbers for the words.                            */
window.TB = window.TB || {};

TB.Abacus = (function () {

  var RODS = 7;                     /* up to 99,99,999 — enough for school */

  /* A frame is one number, kept as what each rod is showing. */
  function empty(rods) {
    var out = [];
    for (var i = 0; i < (rods || RODS); i++) out.push({ heaven: false, earth: 0 });
    return out;
  }

  function rodValue(r) { return (r.heaven ? 5 : 0) + r.earth; }

  function value(frame) {
    return frame.reduce(function (n, r) { return n * 10 + rodValue(r); }, 0);
  }

  /* Put a number on the frame. The rightmost rod is the units. */
  function set(n, rods) {
    rods = rods || RODS;
    n = Math.max(0, Math.floor(Number(n) || 0));
    var frame = empty(rods);
    var digits = String(n).split('').map(Number);
    if (digits.length > rods) return { frame: frame, tooBig: true, max: Math.pow(10, rods) - 1 };
    for (var i = 0; i < digits.length; i++) {
      var d = digits[digits.length - 1 - i];
      var r = frame[rods - 1 - i];
      r.heaven = d >= 5;
      r.earth = d % 5;
    }
    return { frame: frame, tooBig: false };
  }

  /* Tapping a bead. On a real abacus you push a bead towards the bar and
     everything between it and the bar comes with it, which is what makes
     the thing quick — so tapping the third earth bead sets the rod to 3,
     and tapping it again lets them all go. */
  function tapEarth(frame, rod, bead) {
    var r = frame[rod];
    r.earth = (r.earth === bead + 1) ? bead : bead + 1;
    return frame;
  }

  function tapHeaven(frame, rod) {
    frame[rod].heaven = !frame[rod].heaven;
    return frame;
  }

  /* What each rod is worth, for labelling: units, tens, hundreds… */
  var PLACE = ['units', 'tens', 'hundreds', 'thousands', 'ten thousands',
               'lakhs', 'ten lakhs', 'crores'];

  function placeName(rod, rods) {
    return PLACE[(rods || RODS) - 1 - rod] || '';
  }

  /* Adding on an abacus is done a digit at a time from the left, and the
     interesting part is what happens when a rod runs out of beads: you
     cannot put 7 on a rod that already shows 6, so you give the rod next
     door a bead and take the difference off this one. That exchange is the
     whole skill, and it is what these steps spell out. */
  function addSteps(a, b, rods) {
    rods = rods || RODS;
    var start = set(a, rods);
    if (start.tooBig) return null;
    var frame = start.frame;
    var steps = [];
    var digits = String(Math.max(0, Math.floor(b))).split('').map(Number);
    var offset = rods - digits.length;

    digits.forEach(function (d, i) {
      if (!d) return;
      var rod = offset + i;
      if (rod < 0 || rod >= rods) return;
      var before = rodValue(frame[rod]);
      var room = 9 - before;

      if (d <= room) {
        steps.push({
          rod: rod, place: placeName(rod, rods), add: d,
          how: 'Put ' + d + ' more on the ' + placeName(rod, rods) + ' rod: '
             + before + ' and ' + d + ' is ' + (before + d) + '.',
          carry: false
        });
        var v = before + d;
        frame[rod].heaven = v >= 5;
        frame[rod].earth = v % 5;
      } else {
        /* no room: one to the rod on the left, and take ten off here */
        steps.push({
          rod: rod, place: placeName(rod, rods), add: d, carry: true,
          how: 'The ' + placeName(rod, rods) + ' rod shows ' + before + ' and cannot hold '
             + d + ' more. So give one bead to the ' + placeName(rod - 1, rods)
             + ' rod, and take ' + (10 - d) + ' off this one: ' + before + ' − ' + (10 - d)
             + ' is ' + (before - (10 - d)) + '.'
        });
        var nv = before - (10 - d);
        frame[rod].heaven = nv >= 5;
        frame[rod].earth = nv % 5;
        /* carry leftwards, which may itself run out of room */
        var k = rod - 1;
        while (k >= 0) {
          var bv = rodValue(frame[k]);
          if (bv < 9) { frame[k].heaven = (bv + 1) >= 5; frame[k].earth = (bv + 1) % 5; break; }
          frame[k].heaven = false; frame[k].earth = 0;
          k--;
        }
      }
    });

    return { frame: frame, steps: steps, answer: value(frame) };
  }

  return {
    RODS: RODS,
    empty: empty,
    set: set,
    value: value,
    rodValue: rodValue,
    tapEarth: tapEarth,
    tapHeaven: tapHeaven,
    placeName: placeName,
    addSteps: addSteps
  };
})();
