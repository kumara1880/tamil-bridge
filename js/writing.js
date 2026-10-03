/* Tamil Bridge — the writing pad.

   A plain sheet: the model letter or the model sentence printed faintly,
   and room underneath to copy it. No printed rulings — they were getting in
   the way more than they helped, and a letter that has to meet four lines
   at once cannot be set in any font that exists.

   What the pad does still guarantee is alignment. Repeated letters are
   spread evenly and the whole group is centred, so a row never sits bunched
   against the left edge; and every glyph is measured, not assumed, so it is
   centred on its own ink rather than on whatever padding its font carries. */
window.TB = window.TB || {};

TB.Writing = (function () {

  /* The Indic faces are the ones Windows actually ships, so the model is
     drawn in the same shapes the rest of the app shows. */
  var FAMILY = {
    en: "'Segoe UI', system-ui, Arial, sans-serif",
    num: "'Segoe UI', system-ui, Arial, sans-serif",
    ta: "'Noto Sans Tamil', 'Nirmala UI', 'Latha', sans-serif",
    hi: "'Noto Sans Devanagari', 'Nirmala UI', 'Mangal', sans-serif"
  };

  var PAD = 0.07;      /* margin at the top and bottom of the sheet */
  var SIDE = 22;       /* margin at the left and right */
  var INK = 0.62;      /* how much of a row's height the writing fills */

  /* Rows of equal height, evenly spaced down the sheet. */
  function rows(w, h, n) {
    n = Math.max(1, n || 1);
    var pad = Math.round(h * PAD);
    var usable = h - pad * 2;
    var rowH = usable / n;
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({ top: pad + i * rowH, height: rowH, middle: pad + i * rowH + rowH / 2 });
    }
    return out;
  }

  /* The size at which this text's ink fills the row, and the baseline that
     puts it in the middle of that row. Measured rather than assumed,
     because a font's own line box is mostly air. */
  function fit(ctx, text, family, rowHeight) {
    ctx.font = '100px ' + family;
    var m = ctx.measureText(text);
    var asc = m.actualBoundingBoxAscent || 72;
    var desc = m.actualBoundingBoxDescent || 0;
    var ink = asc + desc;
    if (ink <= 0) return null;
    var size = 100 * (rowHeight * INK) / ink;
    return { size: size, ascent: asc * size / 100, descent: desc * size / 100,
             ink: ink * size / 100 };
  }

  /* Centre a piece of text on its own ink inside a row. */
  function baselineFor(f, row) {
    return row.middle - f.ink / 2 + f.ascent;
  }

  /* Write one line of model text, centred in its row and across the sheet. */
  function drawLine(ctx, text, family, row, w, size, centre) {
    ctx.font = size + 'px ' + family;
    var m = ctx.measureText(text);
    var asc = m.actualBoundingBoxAscent || size * 0.72;
    var desc = m.actualBoundingBoxDescent || 0;
    var y = row.middle - (asc + desc) / 2 + asc;
    var x = centre ? (w - m.width) / 2 : SIDE;
    ctx.fillText(text, x, y);
    return { width: m.width, y: y };
  }

  /* The faint model.

     One letter to trace, in the middle of the sheet, as large as the sheet
     allows. It used to be repeated across the row — five faint A's — which
     reads as a handwriting drill for somebody who already forms the letter,
     not as the one shape a child is learning to copy.

     Anything longer than a practice token is a word or a sentence: wrapped
     onto the rows, each line centred. */
  function drawGhost(ctx, text, script, w, h, n, colour, repeat) {
    var line = rows(w, h, n);
    var family = FAMILY[script] || FAMILY.en;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colour || 'rgba(140,160,180,.30)';

    var str = String(text || '');
    if (!str.trim()) return { rows: line };

    /* A practice token is repeated across the row so the whole width of the
       paper is used: a letter, a digit, or a short number such as 47 or 100.
       Anything with a space in it is a sentence and is written once. */
    var chars = str.replace(/\s+/g, '');
    var want_repeat = repeat === undefined
      ? chars.split('').every(function (c) { return c === chars.charAt(0); })
      : !!repeat;
    var single = chars.length > 0 && chars === str.trim() &&
                 chars.length <= 4 && want_repeat;

    if (single) {
      var ch = chars;
      var f = fit(ctx, ch, family, line[0].height);
      if (!f) return { rows: line };
      ctx.font = f.size + 'px ' + family;
      var m = ctx.measureText(ch);

      /* Lay the row out by the ink, not by the advance. A typeface is free
         to paint outside the width it reports, and the Indic ones do — so
         measured on the advance alone the arithmetic says the last copy
         fits, the glyph is painted wider than promised, and the sheet's
         own overflow:hidden slices it in half. */
      var cw = m.width;
      var inkL = m.actualBoundingBoxLeft || 0;
      var inkR = m.actualBoundingBoxRight != null ? m.actualBoundingBoxRight : cw;
      var unit = Math.max(cw, inkL + inkR);
      if (!(unit > 0)) return { rows: line };

      /* Centred on the ink, not on the advance: a typeface is free to paint
         outside the width it reports, and the Indic ones do, so centring on
         the advance alone leaves the glyph visibly off to one side. */
      var x = (w - unit) / 2 + inkL;
      var y = baselineFor(f, line[0]);
      ctx.fillText(ch, x, y);
      return { rows: line, size: f.size, count: 1, centred: true };
    }

    /* A word or a sentence: one size for the run, wrapped onto the rows. */
    var f2 = fit(ctx, str.replace(/\s+/g, '').slice(0, 24) || str, family, line[0].height);
    if (!f2) return { rows: line };
    var size = f2.size;
    ctx.font = size + 'px ' + family;

    /* shrink until the longest word fits the sheet */
    var longest = str.split(/\s+/).reduce(function (a, b) {
      return ctx.measureText(b).width > ctx.measureText(a).width ? b : a;
    }, '');
    var guard = 0;
    while (ctx.measureText(longest).width > w - SIDE * 2 && size > 8 && guard++ < 40) {
      size *= 0.92;
      ctx.font = size + 'px ' + family;
    }

    var words = str.split(/(\s+)/);
    var buf = '', r = 0, placed = [];
    function flush() {
      if (buf.trim() && r < line.length) { placed.push({ text: buf.trim(), row: r }); r++; }
      buf = '';
    }
    words.forEach(function (tok) {
      var test = buf + tok;
      if (ctx.measureText(test).width > w - SIDE * 2 && buf.trim()) {
        flush();
        buf = tok.replace(/^\s+/, '');
      } else buf = test;
    });
    flush();

    placed.forEach(function (p) {
      drawLine(ctx, p.text, family, line[p.row], w, size, true);
    });
    return { rows: line, size: size, rowsUsed: placed.length, overflow: r > line.length };
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
    /* Zero to a hundred. A child learning to write starts at the ten digits
       and does not stop there: the numbers they actually need to write are
       ages, dates, prices and marks, and all of those live below 100. Each
       one carries its name in all three languages, so writing it and saying
       it are learnt in the same breath. */
    if (kind === 'num' || kind === 'num0' || kind === 'num100') {
      var from = kind === 'num0' ? 0 : 0;
      var to = kind === 'num0' ? 9 : 100;
      var out = [];
      for (var n = from; n <= to; n++) {
        var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
        out.push({
          ch: String(n), script: 'num', say: String(n), lang: 'en',
          hint: en + '  ·  ' + ta + '  ·  ' + hi,
          words: { en: en, ta: ta, hi: hi }
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
    FAMILY: FAMILY,
    rows: rows,
    fit: fit,
    drawGhost: drawGhost,
    set: set
  };
})();
