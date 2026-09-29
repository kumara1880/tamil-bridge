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
    /* Four lines hold everything, so the ruling can fill the row. Two lines
       mark only the body, and the parts that stick out need paper to stick
       out onto. */
    var fill = ruling === 'two' ? (rows === 1 ? 0.42 : 0.5)
                                : (rows === 1 ? 0.7 : 0.78);
    var inner = rowH * fill;
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

  /* The Indic faces are the ones Windows actually ships, so the model is
     drawn in the same shapes the rest of the app shows. */
  var FAMILY = {
    en: "'Segoe UI', system-ui, Arial, sans-serif",
    num: "'Segoe UI', system-ui, Arial, sans-serif",
    ta: "'Noto Sans Tamil', 'Nirmala UI', 'Latha', sans-serif",
    hi: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', sans-serif"
  };

  /* Which room a character lives in.

     b d f h k l t climb to the top line; g j p q y drop into the basement;
     everything else sits in the middle. Capitals and digits are full height.
     Devanagari and Tamil use the single band of a two-line page -- Devanagari
     hangs from its headline, which is the top line. */
  var ASCEND = 'bdfhklt';
  var DESCEND = 'gjpqy';

  /* Latin letters only: everything else is written between two lines. */
  function climbs(ch) { return /[A-Z0-9]/.test(ch) || ASCEND.indexOf(ch) >= 0; }
  function hangs(ch) { return DESCEND.indexOf(ch) >= 0; }

  function zoneFor(ch, ruling, g) {
    if (ruling !== 'four') return { from: g.top, to: g.base };
    if (/[A-Z0-9]/.test(ch)) return { from: g.top, to: g.base };
    if (ASCEND.indexOf(ch) >= 0) return { from: g.top, to: g.base };
    if (DESCEND.indexOf(ch) >= 0) return { from: g.xline, to: g.tail };
    return { from: g.xline, to: g.base };
  }

  /* The size at which this font's x-height exactly fills the middle room.
     Everything on a ruled page is measured from that, because the middle
     room is where the body of almost every letter lives. */
  function sizeForBand(ctx, family, band, script) {
    var probe = script === 'hi' ? '\u0915' : script === 'ta' ? '\u0b95' : 'x';
    ctx.font = '100px ' + family;
    var m = ctx.measureText(probe);
    var xh = m.actualBoundingBoxAscent || 50;
    return Math.max(8, 100 * band / xh);
  }

  /* Draw one glyph so it obeys all four lines at once.

     Three passes through clipping bands. The middle room is drawn with no
     transform at all, so the bowl of g and the body of b are exactly the
     height of that room and sit exactly on the baseline. Only the part that
     sticks out above the x-line, or below the baseline, is stretched -- and
     only far enough to touch its line. */
  function drawRuledGlyph(ctx, ch, x, g, family, size, ruling) {
    ctx.font = size + 'px ' + family;
    var m = ctx.measureText(ch);
    var inkAsc = m.actualBoundingBoxAscent || 0;
    var inkDesc = m.actualBoundingBoxDescent || 0;
    var width = m.width;

    if (ruling !== 'four') {
      /* Two lines, one band: the letter stands on the lower line and its
         body fills the band. Nothing is stretched -- a Devanagari matra
         above the headline, or a Tamil tail below the line, belongs where
         the script puts it. */
      ctx.fillText(ch, x, g.base);
      return width;
    }

    var band = g.base - g.xline;

    function band_(top, bottom, anchor, scaleY) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - size, top, width + size * 2, Math.max(0, bottom - top));
      ctx.clip();
      if (scaleY !== 1) {
        ctx.translate(0, anchor);
        ctx.scale(1, scaleY);
        ctx.translate(0, -anchor);
      }
      ctx.fillText(ch, x, g.base);
      ctx.restore();
    }

    /* the middle room, untouched -- this is what keeps the baseline honest */
    band_(g.xline, g.base, g.base, 1);

    /* Whether a letter climbs or hangs is a fact about the letter, not
       something to measure: round letters overshoot the x-height by a
       whisker for optical reasons, and reading that as an ascender stretches
       one pixel into a smear. The measurement only says how far. */
    if (climbs(ch)) {
      var above = inkAsc - band;
      if (above > band * 0.08) band_(g.top, g.xline, g.xline, (g.xline - g.top) / above);
    }
    if (hangs(ch)) {
      var below = inkDesc;
      if (below > band * 0.08) band_(g.base, g.tail, g.base, (g.tail - g.base) / below);
    }

    return width;
  }

  function drawGhost(ctx, text, script, w, h, ruling, rows, colour) {
    var geo = geometry(w, h, ruling, rows);
    var family = FAMILY[script] || FAMILY.en;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colour || 'rgba(140,160,180,.30)';

    var str = String(text || '');
    if (!str.trim()) return { geo: geo };

    var g0 = geo[0];
    var band = ruling === 'four' ? (g0.base - g0.xline) : (g0.base - g0.top);
    var size = sizeForBand(ctx, family, band, script);

    /* One character repeated: fill the line with it. */
    var chars = str.replace(/\s+/g, '');
    var single = chars.length > 0 &&
      chars.split('').every(function (c) { return c === chars.charAt(0); });

    if (single) {
      var ch = chars.charAt(0);
      ctx.font = size + 'px ' + family;
      var cw = ctx.measureText(ch).width;
      var gap = cw * 0.85;
      var x = 20;
      while (x + cw <= w - 16) {
        drawRuledGlyph(ctx, ch, x, g0, family, size, ruling);
        x += cw + gap;
      }
      return { geo: geo, size: size, fitted: true };
    }

    /* A word or a sentence: same size throughout, wrapped onto the rows,
       every glyph still obeying the lines. */
    ctx.font = size + 'px ' + family;
    var words = str.split(/(\s+)/);
    var line = '', r = 0, placed = [];
    var maxW = w - 40;

    function flush() {
      if (line.trim() && r < geo.length) { placed.push({ text: line, row: r }); r++; }
      line = '';
    }
    words.forEach(function (tok) {
      var test = line + tok;
      if (ctx.measureText(test).width > maxW && line.trim()) {
        flush();
        line = tok.replace(/^\s+/, '');
      } else line = test;
    });
    flush();

    placed.forEach(function (p) {
      var g = geo[p.row];
      if (!g) return;
      var x = 20;
      ctx.font = size + 'px ' + family;
      p.text.split('').forEach(function (ch) {
        if (ch === ' ') { x += ctx.measureText(' ').width; return; }
        x += drawRuledGlyph(ctx, ch, x, g, family, size, ruling);
      });
    });
    return { geo: geo, size: size, rowsUsed: placed.length, overflow: r > geo.length };
  }

  /* What the rooms mean, said plainly, in all three languages. */
  function explain(ruling) {
    if (ruling === 'four') {
      return [
        { en: 'Top room: capital letters, and the tall small letters b d f h k l t.',
          ta: '\u0bae\u0bc7\u0bb2\u0bcd \u0b85\u0bb1\u0bc8: \u0baa\u0bc6\u0bb0\u0bbf\u0baf \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0b95\u0bcd\u0b95\u0bb3\u0bcd, \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b89\u0baf\u0bb0\u0bae\u0bbe\u0ba9 b d f h k l t.',
          hi: '\u090a\u092a\u0930 \u0915\u093e \u0915\u092e\u0930\u093e: \u092c\u0921\u093c\u0947 \u0905\u0915\u094d\u0937\u0930, \u0914\u0930 \u0932\u0902\u092c\u0947 \u091b\u094b\u091f\u0947 \u0905\u0915\u094d\u0937\u0930 b d f h k l t\u0964' },
        { en: 'Middle room: every other small letter, a c e m n o r s u v w x z.',
          ta: '\u0ba8\u0b9f\u0bc1 \u0b85\u0bb1\u0bc8: \u0bae\u0bb1\u0bcd\u0bb1 \u0b8e\u0bb2\u0bcd\u0bb2\u0bbe \u0b9a\u0bbf\u0bb1\u0bbf\u0baf \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0b95\u0bcd\u0b95\u0bb3\u0bc1\u0bae\u0bcd a c e m n o r s u v w x z.',
          hi: '\u092c\u0940\u091a \u0915\u093e \u0915\u092e\u0930\u093e: \u092c\u093e\u0915\u093c\u0940 \u0938\u093e\u0930\u0947 \u091b\u094b\u091f\u0947 \u0905\u0915\u094d\u0937\u0930 a c e m n o r s u v w x z\u0964' },
        { en: 'The thick line is the baseline. Every letter stands on it.',
          ta: '\u0ba4\u0b9f\u0bbf\u0bae\u0ba9\u0bbe\u0ba9 \u0b95\u0bcb\u0b9f\u0bc1 \u0b85\u0b9f\u0bbf\u0b95\u0bcd\u0b95\u0bcb\u0b9f\u0bc1. \u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0bae\u0bcd \u0b85\u0ba4\u0ba9\u0bcd \u0bae\u0bc7\u0bb2\u0bcd \u0ba8\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd.',
          hi: '\u092e\u094b\u091f\u0940 \u0930\u0947\u0916\u093e \u0906\u0927\u093e\u0930 \u0930\u0947\u0916\u093e \u0939\u0948\u0964 \u0939\u0930 \u0905\u0915\u094d\u0937\u0930 \u0909\u0938\u0940 \u092a\u0930 \u0916\u0921\u093c\u093e \u0939\u094b\u0924\u093e \u0939\u0948\u0964' },
        { en: 'Basement: the tails of g j p q y hang below the baseline.',
          ta: '\u0b95\u0bc0\u0bb4\u0bcd \u0b85\u0bb1\u0bc8: g j p q y \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0b95\u0bcd\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0bb5\u0bbe\u0bb2\u0bcd \u0b85\u0b9f\u0bbf\u0b95\u0bcd\u0b95\u0bcb\u0b9f\u0bcd\u0b9f\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0b95\u0bc0\u0bb4\u0bc7 \u0ba4\u0bca\u0b99\u0bcd\u0b95\u0bc1\u0bae\u0bcd.',
          hi: '\u0924\u0939\u0916\u093c\u093e\u0928\u093e: g j p q y \u0915\u0940 \u092a\u0942\u0901\u091b \u0906\u0927\u093e\u0930 \u0930\u0947\u0916\u093e \u0915\u0947 \u0928\u0940\u091a\u0947 \u0932\u091f\u0915\u0924\u0940 \u0939\u0948\u0964' }
      ];
    }
    return [
      { en: 'Write between the two lines. Nothing goes above or below them.',
        ta: '\u0b87\u0bb0\u0ba3\u0bcd\u0b9f\u0bc1 \u0b95\u0bcb\u0b9f\u0bc1\u0b95\u0bb3\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0b87\u0b9f\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0b8e\u0bb4\u0bc1\u0ba4\u0bc1. \u0bae\u0bc7\u0bb2\u0bc7\u0baf\u0bc1\u0bae\u0bcd \u0b95\u0bc0\u0bb4\u0bc7\u0baf\u0bc1\u0bae\u0bcd \u0b8e\u0ba4\u0bc1\u0bb5\u0bc1\u0bae\u0bcd \u0baa\u0bcb\u0b95\u0b95\u0bcd\u0b95\u0bc2\u0b9f\u0bbe\u0ba4\u0bc1.',
        hi: '\u0926\u094b\u0928\u094b\u0902 \u0930\u0947\u0916\u093e\u0913\u0902 \u0915\u0947 \u092c\u0940\u091a \u0932\u093f\u0916\u094b\u0964 \u090a\u092a\u0930 \u092f\u093e \u0928\u0940\u091a\u0947 \u0915\u0941\u091b \u0928\u0939\u0940\u0902 \u091c\u093e\u0924\u093e\u0964' },
      { en: 'In Hindi the top line is the shirorekha, and the letters hang from it.',
        ta: '\u0b87\u0ba8\u0bcd\u0ba4\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0bae\u0bc7\u0bb2\u0bcd \u0b95\u0bcb\u0b9f\u0bc1 \u0b9a\u0bbf\u0bb0\u0bcb\u0bb0\u0bc7\u0b95\u0bbe, \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0b95\u0bcd\u0b95\u0bb3\u0bcd \u0b85\u0ba4\u0bbf\u0bb2\u0bbf\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0ba4\u0bca\u0b99\u0bcd\u0b95\u0bc1\u0bae\u0bcd.',
        hi: '\u0939\u093f\u0902\u0926\u0940 \u092e\u0947\u0902 \u090a\u092a\u0930 \u0915\u0940 \u0930\u0947\u0916\u093e \u0936\u093f\u0930\u094b\u0930\u0947\u0916\u093e \u0939\u0948, \u0914\u0930 \u0905\u0915\u094d\u0937\u0930 \u0909\u0938\u0940 \u0938\u0947 \u0932\u091f\u0915\u0924\u0947 \u0939\u0948\u0902\u0964' },
      { en: 'Keep every letter the same height, with the same gap between them.',
        ta: '\u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0b92\u0bb0\u0bc7 \u0b89\u0baf\u0bb0\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd, \u0b92\u0bb0\u0bc7 \u0b87\u0b9f\u0bc8\u0bb5\u0bc6\u0bb3\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b8e\u0bb4\u0bc1\u0ba4\u0bc1.',
        hi: '\u0939\u0930 \u0905\u0915\u094d\u0937\u0930 \u090f\u0915 \u0939\u0940 \u090a\u0901\u091a\u093e\u0908 \u0915\u093e \u0914\u0930 \u092c\u0940\u091a \u092e\u0947\u0902 \u090f\u0915 \u091c\u0948\u0938\u093e \u0905\u0902\u0924\u0930 \u0930\u0916\u094b\u0964' }
    ];
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
    zoneFor: zoneFor,
    sizeForBand: sizeForBand,
    climbs: climbs,
    hangs: hangs,
    drawRuledGlyph: drawRuledGlyph,
    explain: explain,
    FAMILY: FAMILY,
    set: set
  };
})();
