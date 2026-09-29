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

  function zoneFor(ch, ruling, g) {
    if (ruling !== 'four') return { from: g.top, to: g.base };
    if (/[A-Z0-9]/.test(ch)) return { from: g.top, to: g.base };
    if (ASCEND.indexOf(ch) >= 0) return { from: g.top, to: g.base };
    if (DESCEND.indexOf(ch) >= 0) return { from: g.xline, to: g.tail };
    return { from: g.xline, to: g.base };
  }

  /* Size so the ink of this exact character fills exactly that room. */
  function fitGlyph(ctx, ch, family, zone) {
    ctx.font = '100px ' + family;
    var m = ctx.measureText(ch);
    var asc = m.actualBoundingBoxAscent || 72;
    var desc = m.actualBoundingBoxDescent || 0;
    var ink = asc + desc;
    if (ink <= 0) return null;
    var size = 100 * (zone.to - zone.from) / ink;
    return { size: size, baseline: zone.from + asc * size / 100 };
  }

  /* Size so the x-height fills the middle room -- used for a whole run of
     words, where one size for the run matters more than each letter
     touching its own line. */
  function fitRun(ctx, family, g, ruling, script) {
    var probe = script === 'hi' ? '\u0915' : script === 'ta' ? '\u0b95' : 'x';
    var band = ruling === 'four' ? (g.base - g.xline) : (g.base - g.top) * 0.86;
    ctx.font = '100px ' + family;
    var m = ctx.measureText(probe);
    var asc = m.actualBoundingBoxAscent || 50;
    return Math.max(8, 100 * band / asc);
  }

  /* Lay the model text out on the rules, wrapping onto the next ruled row. */
  function drawGhost(ctx, text, script, w, h, ruling, rows, colour) {
    var geo = geometry(w, h, ruling, rows);
    var family = FAMILY[script] || FAMILY.en;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colour || 'rgba(140,160,180,.30)';

    var str = String(text || '');
    var chars = str.replace(/\s+/g, '');
    /* One character, repeated: fit each copy to its own room exactly, which
       is the whole point of writing on ruled lines. */
    var single = chars.length > 0 &&
      chars.split('').every(function (c) { return c === chars.charAt(0); });

    if (single) {
      var ch = chars.charAt(0);
      var fit = fitGlyph(ctx, ch, family, zoneFor(ch, ruling, geo[0]));
      if (!fit) return { geo: geo };
      ctx.font = fit.size + 'px ' + family;
      var cw = ctx.measureText(ch).width;
      var gap = cw * 0.8;
      var x = 18;
      while (x + cw <= w - 14) {
        ctx.fillText(ch, x, fit.baseline);
        x += cw + gap;
      }
      return { geo: geo, size: fit.size, fitted: true };
    }

    /* A word or a sentence: one size for the whole run, wrapped onto rows. */
    var size = fitRun(ctx, family, geo[0], ruling, script);
    ctx.font = size + 'px ' + family;
    var words = str.split(/(\s+)/);
    var line = '', r = 0, placed = [];
    var maxW = w - 36;

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
      if (g) ctx.fillText(p.text, 18, g.base);
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
    fitGlyph: fitGlyph,
    fitRun: fitRun,
    explain: explain,
    FAMILY: FAMILY,
    set: set
  };
})();
