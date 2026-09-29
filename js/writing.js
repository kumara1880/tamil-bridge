/* Tamil Bridge — the ruled page.

   Handwriting is taught on ruled paper, and the ruling is not decoration:
   the four-line ruling is what tells a child that b climbs to the top line,
   a sits in the middle band, and g hangs below the baseline. Devanagari is
   written from a headline down, which is a two-line ruling. Tamil sits
   between two lines as well.

   So the pad is drawn the way the notebook is, and the model letter is
   placed on the rules rather than floated near them — the glyph is measured
   at runtime and scaled so its cap height reaches the right line in
   whatever font the device actually has.                                   */
window.TB = window.TB || {};

TB.Writing = (function () {

  var RULINGS = {
    four: {
      id: 'four', label: 'Four-ruled',
      hint: 'Top line, middle band, baseline, tail line — for English letters',
      lines: 4
    },
    two: {
      id: 'two', label: 'Two-ruled',
      hint: 'One band between two lines — for Hindi and Tamil, and for joined writing',
      lines: 2
    },
    plain: { id: 'plain', label: 'Plain', hint: 'No lines', lines: 0 }
  };

  /* Which ruling a script is normally taught on. */
  function defaultRuling(script) {
    return (script === 'en' || script === 'num') ? 'four' : 'two';
  }

  /* Work out where the rules sit in a box of this height.

     Four-ruled: three equal bands, so the middle one — where most small
     letters live — is the same height as the climb above it and the tail
     below. baseline is the third line, which is where every letter starts.  */
  function geometry(w, h, ruling, rows) {
    rows = rows || 1;
    var pad = Math.round(h * 0.06);
    var usable = h - pad * 2;
    var rowH = usable / rows;
    var inner = rowH * (rows === 1 ? 0.7 : 0.78);   /* gap between rows */
    /* one row alone should sit in the middle of the pad rather than at the
       top with empty paper underneath */
    var lift = rows === 1 ? (rowH - inner) / 2 : 0;
    var out = [];
    for (var r = 0; r < rows; r++) {
      var top = pad + r * rowH + lift;
      if (ruling === 'four') {
        var u = inner / 3;
        out.push({ top: top, xline: top + u, base: top + 2 * u, tail: top + 3 * u, unit: u });
      } else if (ruling === 'two') {
        out.push({ top: top, base: top + inner, unit: inner });
      } else {
        out.push({ top: top, base: top + inner, unit: inner, plain: true });
      }
    }
    return out;
  }

  function drawGuides(ctx, w, h, ruling, rows, colours) {
    var c = colours || {};
    var geo = geometry(w, h, ruling, rows);
    ctx.clearRect(0, 0, w, h);
    if (ruling === 'plain') return geo;

    geo.forEach(function (g) {
      function line(y, kind) {
        ctx.beginPath();
        ctx.moveTo(8, y);
        ctx.lineTo(w - 8, y);
        /* the baseline is the one that matters, so it is solid and darker;
           the guides between are faint and dashed */
        if (kind === 'base') {
          ctx.setLineDash([]);
          ctx.lineWidth = 2;
          ctx.strokeStyle = c.base || 'rgba(120,140,160,.85)';
        } else if (kind === 'edge') {
          ctx.setLineDash([]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = c.edge || 'rgba(120,140,160,.5)';
        } else {
          ctx.setLineDash([5, 6]);
          ctx.lineWidth = 1;
          ctx.strokeStyle = c.mid || 'rgba(120,140,160,.38)';
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (ruling === 'four') {
        line(g.top, 'edge');
        line(g.xline, 'mid');
        line(g.base, 'base');
        line(g.tail, 'edge');
      } else {
        line(g.top, 'edge');
        line(g.base, 'base');
      }
    });
    return geo;
  }

  /* Scale the font so the letter meets the lines it is supposed to meet.

     Fonts differ, and the device may not have the one asked for, so the
     glyph is measured rather than assumed. */
  function fitFont(ctx, family, g, ruling, script) {
    var probe = script === 'hi' ? 'क' : script === 'ta' ? 'க' : 'H';
    var target = ruling === 'four' ? (g.base - g.top)      /* cap height */
                                   : (g.base - g.top) * 0.82;
    var size = 100;
    ctx.font = size + 'px ' + family;
    var m = ctx.measureText(probe);
    var asc = m.actualBoundingBoxAscent || size * 0.72;
    if (asc > 0) size = size * (target / asc);
    return Math.max(10, size);
  }

  var FAMILY = {
    en: "'Segoe UI', system-ui, Arial, sans-serif",
    num: "'Segoe UI', system-ui, Arial, sans-serif",
    ta: "'Noto Sans Tamil', 'Nirmala UI', 'Latha', sans-serif",
    hi: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', sans-serif"
  };

  /* Lay the model text out on the rules, wrapping onto the next ruled row. */
  function drawGhost(ctx, text, script, w, h, ruling, rows, colour) {
    var geo = geometry(w, h, ruling, rows);
    var family = FAMILY[script] || FAMILY.en;
    var size = fitFont(ctx, family, geo[0], ruling, script);
    ctx.font = size + 'px ' + family;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colour || 'rgba(140,160,180,.30)';

    var words = String(text || '').split(/(\s+)/);
    var line = '', r = 0, x0 = 16;
    var maxW = w - 32;
    var placed = [];

    function flush() {
      if (!line || r >= geo.length) { line = ''; return; }
      placed.push({ text: line, row: r });
      line = '';
      r++;
    }
    words.forEach(function (tok) {
      var test = line + tok;
      if (ctx.measureText(test).width > maxW && line.trim()) { flush(); line = tok.replace(/^\s+/, ''); }
      else line = test;
    });
    flush();

    placed.forEach(function (p) {
      var g = geo[p.row];
      if (!g) return;
      ctx.fillText(p.text, x0, g.base);
    });
    return { geo: geo, size: size, rowsUsed: placed.length, overflow: r > geo.length };
  }

  /* The sets a person can practise. */
  function set(kind) {
    if (kind === 'caps') {
      return TB.ALPHABET.en.letters.map(function (l) {
        return { ch: l.ch, script: 'en', say: l.ch, lang: 'en',
                 hint: 'Capital ' + l.ch + '  ·  small ' + l.low };
      });
    }
    if (kind === 'small') {
      return TB.ALPHABET.en.letters.map(function (l) {
        return { ch: l.low, script: 'en', say: l.low, lang: 'en',
                 hint: 'Small ' + l.low + '  ·  capital ' + l.ch };
      });
    }
    if (kind === 'num') {
      var out = [];
      for (var n = 0; n <= 9; n++) {
        out.push({
          ch: String(n), script: 'num', say: String(n), lang: 'en',
          hint: TB.Numbers.enIndian(n) + '  ·  ' + TB.Numbers.ta(n) + '  ·  ' + TB.Numbers.hi(n),
          words: { en: TB.Numbers.enIndian(n), ta: TB.Numbers.ta(n), hi: TB.Numbers.hi(n) }
        });
      }
      return out;
    }
    if (kind === 'hi') {
      var hi = TB.ALPHABET.hi.vowels.map(function (v) {
        return { ch: v.ch, script: 'hi', say: v.ch, lang: 'hi', hint: 'vowel · ' + v.ta };
      });
      TB.ALPHABET.hi.rows.slice(0, 7).forEach(function (row) {
        row.items.forEach(function (c) {
          hi.push({ ch: c.ch, script: 'hi', say: c.ch, lang: 'hi', hint: c.en + ' · ' + c.ta });
        });
      });
      return hi;
    }
    var ta = TB.ALPHABET.ta.vowels.map(function (v) {
      return { ch: v.ch, script: 'ta', say: v.ch, lang: 'ta', hint: 'vowel · ' + v.en };
    });
    TB.ALPHABET.ta.consonants.forEach(function (c) {
      ta.push({ ch: c.ch, script: 'ta', say: c.base, lang: 'ta', hint: c.en });
    });
    return ta;
  }

  return {
    RULINGS: RULINGS,
    defaultRuling: defaultRuling,
    geometry: geometry,
    drawGuides: drawGuides,
    drawGhost: drawGhost,
    fitFont: fitFont,
    FAMILY: FAMILY,
    set: set
  };
})();
