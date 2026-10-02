/* Tamil Bridge — the abacus, and sums to practise.

   Two things a child needs that a worked example cannot give: something to
   move with their hands, and questions nobody has answered for them.     */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;

  var A = TB.Abacus;

  /* What the thing is, before anybody is asked to use it. Five short
     pieces: what a rod is, what the two kinds of bead are worth, when a
     bead counts, what one rod can show, and the one rule for adding.

     All three languages, because a child who reads Tamil was being handed
     a frame of beads and a paragraph of English. */
  var HOW_IT_WORKS = [
    { en: 'An abacus is a frame of rods. Each rod is one place in the number \u2014 units, '
        + 'tens, hundreds \u2014 and the beads pushed in on that rod are that digit.',
      ta: '\u0bae\u0ba3\u0bbf\u0b9a\u0bcd\u0b9a\u0b9f\u0bcd\u0b9f\u0bae\u0bcd \u0b8e\u0ba9\u0bcd\u0baa\u0ba4\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0b95\u0bb3\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f \u0b9a\u0b9f\u0bcd\u0b9f\u0bae\u0bcd. \u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bc1\u0bae\u0bcd '
        + '\u0b8e\u0ba3\u0bcd\u0ba3\u0bbf\u0ba9\u0bcd \u0b92\u0bb0\u0bc1 \u0b87\u0b9f\u0bae\u0bcd \u2014 \u0b92\u0ba9\u0bcd\u0bb1\u0bc1, \u0baa\u0ba4\u0bcd\u0ba4\u0bc1, \u0ba8\u0bc2\u0bb1\u0bc1 \u2014 \u0b85\u0ba8\u0bcd\u0ba4 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0ba4\u0bb3\u0bcd\u0bb3\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f '
        + '\u0bae\u0ba3\u0bbf\u0b95\u0bb3\u0bcd \u0ba4\u0bbe\u0ba9\u0bcd \u0b85\u0ba8\u0bcd\u0ba4 \u0b87\u0bb2\u0b95\u0bcd\u0b95\u0bae\u0bcd.',
      hi: '\u0917\u093f\u0928\u0924\u093e\u0930\u093e \u091b\u0921\u093c\u094b\u0902 \u0915\u093e \u090f\u0915 \u0922\u093e\u0901\u091a\u093e \u0939\u0948\u0964 \u0939\u0930 \u091b\u0921\u093c \u0938\u0902\u0916\u094d\u092f\u093e \u0915\u093e \u090f\u0915 \u0938\u094d\u0925\u093e\u0928 \u0939\u0948 \u2014 '
        + '\u0907\u0915\u093e\u0908, \u0926\u0939\u093e\u0908, \u0938\u0948\u0915\u0921\u093c\u093e \u2014 \u0914\u0930 \u0909\u0938 \u091b\u0921\u093c \u092a\u0930 \u0927\u0915\u0947\u0932\u0947 \u0917\u090f \u092e\u0928\u0915\u0947 \u0935\u0939\u0940 \u0905\u0902\u0915 \u0939\u0948\u0902\u0964' },

    { en: 'One bead sits above the bar and is worth 5. Four sit below, and each of those '
        + 'is worth 1.',
      ta: '\u0baa\u0b9f\u0bcd\u0b9f\u0bc8\u0b95\u0bcd\u0b95\u0bc1 \u0bae\u0bc7\u0bb2\u0bc7 \u0b92\u0bb0\u0bc1 \u0bae\u0ba3\u0bbf \u2014 \u0b85\u0ba4\u0ba9\u0bcd \u0bae\u0ba4\u0bbf\u0baa\u0bcd\u0baa\u0bc1 5. \u0b95\u0bc0\u0bb4\u0bc7 \u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bc1 \u0bae\u0ba3\u0bbf\u0b95\u0bb3\u0bcd \u2014 '
        + '\u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0ba9\u0bcd\u0bb1\u0bbf\u0ba9\u0bcd \u0bae\u0ba4\u0bbf\u0baa\u0bcd\u0baa\u0bc1\u0bae\u0bcd 1.',
      hi: '\u092a\u091f\u094d\u091f\u0940 \u0915\u0947 \u090a\u092a\u0930 \u090f\u0915 \u092e\u0928\u0915\u093e \u0939\u0948, \u091c\u093f\u0938\u0915\u093e \u092e\u093e\u0928 5 \u0939\u0948\u0964 \u0928\u0940\u091a\u0947 \u091a\u093e\u0930 \u092e\u0928\u0915\u0947 \u0939\u0948\u0902, '
        + '\u0939\u0930 \u090f\u0915 \u0915\u093e \u092e\u093e\u0928 1\u0964' },

    { en: 'A bead counts only when it is pushed towards the bar. Pushed away from it, '
        + 'the bead is nothing.',
      ta: '\u0bae\u0ba3\u0bbf\u0baf\u0bc8 \u0baa\u0b9f\u0bcd\u0b9f\u0bc8\u0baf\u0bc8 \u0ba8\u0bcb\u0b95\u0bcd\u0b95\u0bbf \u0ba4\u0bb3\u0bcd\u0bb3\u0bbf\u0ba9\u0bbe\u0bb2\u0bcd \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bc7 \u0b85\u0ba4\u0bc1 \u0b8e\u0ba3\u0bcd\u0ba3\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0bae\u0bcd. '
        + '\u0bb5\u0bbf\u0bb2\u0b95\u0bcd\u0b95\u0bbf \u0bb5\u0bc8\u0ba4\u0bcd\u0ba4\u0bbe\u0bb2\u0bcd \u0b85\u0ba4\u0bc1 \u0baa\u0bc2\u0b9c\u0bcd\u0baf\u0bae\u0bcd.',
      hi: '\u092e\u0928\u0915\u093e \u0924\u092d\u0940 \u0917\u093f\u0928\u093e \u091c\u093e\u0924\u093e \u0939\u0948 \u091c\u092c \u0909\u0938\u0947 \u092a\u091f\u094d\u091f\u0940 \u0915\u0940 \u0913\u0930 \u0927\u0915\u0947\u0932\u093e \u091c\u093e\u090f\u0964 '
        + '\u0926\u0942\u0930 \u0930\u0916\u0928\u0947 \u092a\u0930 \u0935\u0939 \u0936\u0942\u0928\u094d\u092f \u0939\u0948\u0964' },

    { en: 'So one rod can show 0 to 9: the top bead for 5, plus however many of the four '
        + 'below have been pushed up.',
      ta: '\u0b8e\u0ba9\u0bb5\u0bc7 \u0b92\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf 0 \u0bae\u0bc1\u0ba4\u0bb2\u0bcd 9 \u0bb5\u0bb0\u0bc8 \u0b95\u0bbe\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bcd: \u0bae\u0bc7\u0bb2\u0bc7 \u0b89\u0bb3\u0bcd\u0bb3 \u0bae\u0ba3\u0bbf 5, '
        + '\u0b85\u0ba4\u0bcd\u0ba4\u0bc1\u0b9f\u0ba9\u0bcd \u0b95\u0bc0\u0bb4\u0bc7 \u0bae\u0bc7\u0bb2\u0bc7 \u0ba4\u0bb3\u0bcd\u0bb3\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f \u0bae\u0ba3\u0bbf\u0b95\u0bb3\u0bcd.',
      hi: '\u0907\u0938\u0932\u093f\u090f \u090f\u0915 \u091b\u0921\u093c 0 \u0938\u0947 9 \u0924\u0915 \u0926\u093f\u0916\u093e \u0938\u0915\u0924\u0940 \u0939\u0948: \u090a\u092a\u0930 \u0915\u093e \u092e\u0928\u0915\u093e 5, '
        + '\u0914\u0930 \u0928\u0940\u091a\u0947 \u0915\u0947 \u091c\u093f\u0924\u0928\u0947 \u092e\u0928\u0915\u0947 \u090a\u092a\u0930 \u0927\u0915\u0947\u0932\u0947 \u0917\u090f \u0939\u094b\u0902\u0964' },

    { en: 'To add, take one rod at a time. When a rod has no room left, give one bead to '
        + 'the rod on its left and take ten off this one. That exchange is the whole skill.',
      ta: '\u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bcd\u0baa\u0bcb\u0ba4\u0bc1 \u0b92\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bbe\u0b95\u0b9a\u0bcd \u0b9a\u0bc6\u0baf\u0bcd\u0baf\u0bb5\u0bc1\u0bae\u0bcd. \u0b92\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b87\u0b9f\u0bae\u0bcd '
        + '\u0b87\u0bb2\u0bcd\u0bb2\u0bbe\u0ba4\u0baa\u0bcb\u0ba4\u0bc1, \u0b87\u0b9f\u0ba4\u0bc1 \u0baa\u0b95\u0bcd\u0b95 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0b95\u0bcd\u0b95\u0bc1 \u0b92\u0bb0\u0bc1 \u0bae\u0ba3\u0bbf \u0b95\u0bca\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1, \u0b87\u0ba4\u0bbf\u0bb2\u0bcd '
        + '\u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0baa\u0ba4\u0bcd\u0ba4\u0bc1 \u0b8e\u0b9f\u0bc1\u0b95\u0bcd\u0b95\u0bb5\u0bc1\u0bae\u0bcd. \u0b87\u0ba8\u0bcd\u0ba4 \u0bae\u0bbe\u0bb1\u0bcd\u0bb1\u0bae\u0bcd \u0ba4\u0bbe\u0ba9\u0bcd \u0bae\u0bca\u0ba4\u0bcd\u0ba4 \u0ba4\u0bbf\u0bb1\u0ba9\u0bcd.',
      hi: '\u091c\u094b\u0921\u093c\u0924\u0947 \u0938\u092e\u092f \u090f\u0915-\u090f\u0915 \u091b\u0921\u093c \u0932\u0947\u0902\u0964 \u091c\u092c \u091b\u0921\u093c \u092a\u0930 \u091c\u0917\u0939 \u0928 \u092c\u091a\u0947, \u0924\u094b \u092c\u093e\u0908\u0902 '
        + '\u091b\u0921\u093c \u0915\u094b \u090f\u0915 \u092e\u0928\u0915\u093e \u0926\u0947\u0902 \u0914\u0930 \u0907\u0938\u092e\u0947\u0902 \u0938\u0947 \u0926\u0938 \u0918\u091f\u093e\u090f\u0901\u0964 \u092f\u0939\u0940 \u0905\u0926\u0932\u093e-\u092c\u0926\u0932\u0940 \u092a\u0942\u0930\u093e \u0939\u0941\u0928\u0930 \u0939\u0948\u0964' }
  ];

  /* One block of prose in all three, each with how to say it. */
  function trio(o) {
    return ['en', 'ta', 'hi'].map(function (l) {
      return '<div class="lang-line"><div class="' + l + '">' + esc(o[l]) + speak(o[l], l)
        + '</div>' + readAid(o[l], l) + '</div>';
    }).join('');
  }

  function explainer() {
    return '<details class="card fold" id="abHow">'
      + '<summary class="fold-head"><div><h3>\u{1F4D6} How the abacus works</h3>'
      + '<div class="card-sub ta">\u0bae\u0ba3\u0bbf\u0b9a\u0bcd\u0b9a\u0b9f\u0bcd\u0b9f\u0bae\u0bcd \u0b8e\u0baa\u0bcd\u0baa\u0b9f\u0bbf \u0bb5\u0bc7\u0bb2\u0bc8 \u0b9a\u0bc6\u0baf\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1 \u00b7 '
      + '<span class="hi">\u0917\u093f\u0928\u0924\u093e\u0930\u093e \u0915\u0948\u0938\u0947 \u0915\u093e\u092e \u0915\u0930\u0924\u093e \u0939\u0948</span></div></div>'
      + '<span class="chip">' + HOW_IT_WORKS.length + '</span></summary>'
      + HOW_IT_WORKS.map(function (o, i) {
          return '<div class="mod-block"><div class="mod-label">' + (i + 1) + '</div>'
            + trio(o) + '</div>';
        }).join('')
      + '</details>';
  }

  V.abacus = {
    title: 'Abacus',
    sub: 'Move the beads, and hear the number in English, தமிழ் and हिंदी',

    html: function () {
      return '<div class="view">'
        + explainer()
        + '<div class="card">'
        +   '<div class="row mb"><div class="pill-row" id="abMode">'
        +     '<button class="pill on" data-m="play" type="button">\u{1F9EE} Play</button>'
        +     '<button class="pill" data-m="show" type="button">\u{1F440} Show me a number</button>'
        +     '<button class="pill" data-m="add" type="button">➕ Add, bead by bead</button>'
        +   '</div></div>'
        +   '<div class="tiny muted">Each rod has one bead on top worth <b>5</b> and four below '
        +     'worth <b>1</b>. A bead counts when it is pushed towards the bar.'
        +     '<div class="ta mt">\u0b92\u0bb5\u0bcd\u0bb5\u0bca\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bbf\u0bb2\u0bc1\u0bae\u0bcd \u0bae\u0bc7\u0bb2\u0bc7 \u0b92\u0bb0\u0bc1 \u0bae\u0ba3\u0bbf (\u0bae\u0ba4\u0bbf\u0baa\u0bcd\u0baa\u0bc1 <b>5</b>), '
        +       '\u0b95\u0bc0\u0bb4\u0bc7 \u0ba8\u0bbe\u0ba9\u0bcd\u0b95\u0bc1 \u0bae\u0ba3\u0bbf\u0b95\u0bb3\u0bcd (\u0ba4\u0bb2\u0bbe <b>1</b>). \u0baa\u0b9f\u0bcd\u0b9f\u0bc8\u0baf\u0bc8 \u0ba8\u0bcb\u0b95\u0bcd\u0b95\u0bbf \u0ba4\u0bb3\u0bcd\u0bb3\u0bbf\u0ba9\u0bbe\u0bb2\u0bcd \u0bae\u0b9f\u0bcd\u0b9f\u0bc1\u0bae\u0bc7 '
        +       '\u0b85\u0ba8\u0bcd\u0ba4 \u0bae\u0ba3\u0bbf \u0b8e\u0ba3\u0bcd\u0ba3\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0bae\u0bcd.</div>'
        +     '<div class="hi mt">\u0939\u0930 \u091b\u0921\u093c \u092a\u0930 \u090a\u092a\u0930 \u090f\u0915 \u092e\u0928\u0915\u093e \u0939\u0948 \u091c\u093f\u0938\u0915\u093e \u092e\u093e\u0928 <b>5</b> \u0939\u0948, '
        +       '\u0914\u0930 \u0928\u0940\u091a\u0947 \u091a\u093e\u0930 \u092e\u0928\u0915\u0947 \u0939\u0948\u0902 \u091c\u093f\u0928\u0915\u093e \u092e\u093e\u0928 <b>1</b> \u0939\u0948\u0964 \u092e\u0928\u0915\u093e \u0924\u092d\u0940 \u0917\u093f\u0928\u093e \u091c\u093e\u0924\u093e \u0939\u0948 '
        +       '\u091c\u092c \u0909\u0938\u0947 \u092a\u091f\u094d\u091f\u0940 \u0915\u0940 \u0913\u0930 \u0927\u0915\u0947\u0932\u093e \u091c\u093e\u090f\u0964</div></div>'
        + '</div>'
        + '<div id="abBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#abBody');
      var mode = 'play';
      var frame = A.empty();
      var target = null;
      /* What the adding mode is working on. Real values, not placeholders:
         the two boxes used to look filled in and were not, so the button
         did nothing and said nothing. */
      var addA = 25, addB = 17;
      var work = null;

      /* ------------------------------------------------------- the frame */
      function board() {
        var rods = frame.length;
        return '<div class="abacus" id="abBoard">'
          + '<div class="ab-rods">'
          + frame.map(function (r, i) {
              return '<div class="ab-rod" data-rod="' + i + '">'
                + '<div class="ab-heaven">'
                +   '<button class="ab-bead heaven' + (r.heaven ? ' on' : '') + '" '
                +     'data-rod="' + i + '" data-heaven="1" type="button" '
                +     'aria-label="five on the ' + esc(A.placeName(i, rods)) + ' rod"></button>'
                + '</div>'
                + '<div class="ab-bar"></div>'
                + '<div class="ab-earth">'
                + [0, 1, 2, 3].map(function (b) {
                    return '<button class="ab-bead earth' + (r.earth > b ? ' on' : '') + '" '
                      + 'data-rod="' + i + '" data-bead="' + b + '" type="button" '
                      + 'aria-label="one on the ' + esc(A.placeName(i, rods)) + ' rod"></button>';
                  }).join('')
                + '</div>'
                + '<div class="ab-digit">' + A.rodValue(r) + '</div>'
                /* The name of the place is half of what is being taught,
                   so the rod says it in Tamil as well as English. */
                + '<div class="ab-place">' + esc(A.placeName(i, rods))
                +   '<span class="ta">' + esc(A.placeTa(i, rods)) + '</span></div>'
                + '</div>';
            }).join('')
          + '</div></div>';
      }

      function numberCard(n) {
        var en = TB.Numbers.enIndian(n), ta = TB.Numbers.ta(n), hi = TB.Numbers.hi(n);
        return '<div class="card">'
          + '<div class="ab-value">' + n.toLocaleString('en-IN') + '</div>'
          + '<div class="lang-line"><div class="en">' + esc(en) + speak(en, 'en') + '</div>'
          + readAid(en, 'en') + '</div>'
          + '<div class="lang-line"><div class="ta">' + esc(ta) + speak(ta, 'ta') + '</div>'
          + readAid(ta, 'ta') + '</div>'
          + '<div class="lang-line"><div class="hi">' + esc(hi) + speak(hi, 'hi') + '</div>'
          + readAid(hi, 'hi') + '</div>'
          + '</div>';
      }

      /* ------------------------------------------------------------ modes */
      function play() {
        body.innerHTML = '<div class="card">' + board()
          + '<div class="row mt" style="justify-content:center">'
          +   '<button class="btn btn-sm" id="abClear" type="button">Clear</button>'
          +   '<input id="abSet" class="mnum" style="max-width:150px" inputmode="numeric" '
          +     'placeholder="type a number">'
          +   '<button class="btn btn-sm btn-primary" id="abSetGo" type="button">Put it on</button>'
          + '</div></div>'
          + numberCard(A.value(frame));
      }

      function show() {
        if (target === null) target = pick();
        var got = A.value(frame);
        var right = got === target;
        body.innerHTML = '<div class="card">'
          + '<div class="ab-ask">Set this number on the abacus'
          +   ' \u00b7 <span class="ta">\u0b87\u0ba8\u0bcd\u0ba4 \u0b8e\u0ba3\u0bcd\u0ba3\u0bc8 \u0bae\u0ba3\u0bbf\u0b9a\u0bcd\u0b9a\u0b9f\u0bcd\u0b9f\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0b85\u0bae\u0bc8\u0b95\u0bcd\u0b95\u0bb5\u0bc1\u0bae\u0bcd</span>'
          +   ' \u00b7 <span class="hi">\u0907\u0938 \u0938\u0902\u0916\u094d\u092f\u093e \u0915\u094b \u0917\u093f\u0928\u0924\u093e\u0930\u0947 \u092a\u0930 \u092c\u0928\u093e\u090f\u0901</span></div>'
          + '<div class="ab-target">' + target.toLocaleString('en-IN') + '</div>'
          + '<div class="tiny muted">' + esc(TB.Numbers.enIndian(target)) + '  ·  '
          +   '<span class="ta">' + esc(TB.Numbers.ta(target)) + '</span>  ·  '
          +   '<span class="hi">' + esc(TB.Numbers.hi(target)) + '</span>'
          +   V.hiTamil(TB.Numbers.hi(target)) + '</div>'
          + '</div>'
          + '<div class="card">' + board()
          + '<div class="row mt" style="justify-content:center">'
          +   (right
              ? '<div class="msg msg-ok" style="margin:0">✓ That is ' + target.toLocaleString('en-IN')
                + '. <button class="btn btn-sm btn-primary" id="abNext" type="button">Another one</button></div>'
              : '<span class="tiny muted">The abacus shows ' + got.toLocaleString('en-IN') + '</span>')
          +   '<button class="btn btn-sm" id="abClear" type="button">Clear</button>'
          + '</div></div>';
        if (right) {
          var d = D(); d.stats.xp = (d.stats.xp || 0) + 2; saveD(d);
          TB.App.refreshChips();
        }
      }

      function add() {
        body.innerHTML = '<div class="card">'
          + '<div class="row" style="flex-wrap:wrap">'
          +   '<input id="abA" class="mnum" style="max-width:130px" inputmode="numeric" '
          +     'aria-label="first number" value="' + addA + '">'
          +   '<span style="font-size:calc(24px * var(--fs,1))">+</span>'
          +   '<input id="abB" class="mnum" style="max-width:130px" inputmode="numeric" '
          +     'aria-label="second number" value="' + addB + '">'
          +   '<button class="btn btn-primary" id="abAddGo" type="button">Show me</button>'
          + '</div>'
          + '<div class="tiny muted mt">Adding on an abacus goes one rod at a time. The skill is '
          +   'what to do when a rod has no room left.'
          +   '<div class="ta mt">\u0bae\u0ba3\u0bbf\u0b9a\u0bcd\u0b9a\u0b9f\u0bcd\u0b9f\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0bb2\u0bcd \u0b92\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bbe\u0b95 \u0ba8\u0b9f\u0b95\u0bcd\u0b95\u0bc1\u0bae\u0bcd. '
          +     '\u0b92\u0bb0\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b87\u0b9f\u0bae\u0bcd \u0b87\u0bb2\u0bcd\u0bb2\u0bbe\u0ba4\u0baa\u0bcb\u0ba4\u0bc1 \u0b8e\u0ba9\u0bcd\u0ba9 \u0b9a\u0bc6\u0baf\u0bcd\u0bb5\u0ba4\u0bc1 \u0b8e\u0ba9\u0bcd\u0baa\u0ba4\u0bc1 \u0ba4\u0bbe\u0ba9\u0bcd \u0ba4\u0bbf\u0bb1\u0ba9\u0bcd.</div>'
          +   '<div class="hi mt">\u0917\u093f\u0928\u0924\u093e\u0930\u0947 \u092a\u0930 \u091c\u094b\u0921\u093c \u090f\u0915-\u090f\u0915 \u091b\u0921\u093c \u0915\u0930\u0915\u0947 \u0939\u094b\u0924\u093e \u0939\u0948\u0964 '
          +     '\u0939\u0941\u0928\u0930 \u092f\u0939 \u0939\u0948 \u0915\u093f \u091c\u092c \u091b\u0921\u093c \u092a\u0930 \u091c\u0917\u0939 \u0928 \u092c\u091a\u0947 \u0924\u092c \u0915\u094d\u092f\u093e \u0915\u0930\u0947\u0902\u0964</div></div>'
          + '<div id="abMsg"></div>'
          + '</div>'
          + (work
             ? '<div class="card">'
               + '<h3>' + work.a.toLocaleString('en-IN') + ' + ' + work.b.toLocaleString('en-IN')
               + ' = ' + work.answer.toLocaleString('en-IN') + '</h3>'
               + (work.steps.length
                  ? work.steps.map(function (st, i) {
                      /* The steps ARE the lesson. In English only, they
                         taught nobody who could not already read it. */
                      return '<div class="ab-step' + (st.carry ? ' carry' : '') + '">'
                        + '<div class="ab-step-n">' + (i + 1) + '</div>'
                        + '<div class="ab-step-body">' + trio(st) + '</div>'
                        + '</div>';
                    }).join('')
                  : '<div class="tiny muted">Nothing to add.</div>')
               + '</div>'
             : '')
          /* The frame is on the page from the moment the mode opens, as it
             is in the other two. An abacus page with no abacus on it reads
             as broken, and it was. */
          + '<div class="card">' + board() + '</div>'
          + numberCard(work ? work.answer : A.value(frame));
      }

      function pick() {
        var max = [9, 99, 999, 9999][Math.floor(Math.random() * 4)];
        return Math.floor(Math.random() * max) + 1;
      }

      function draw() {
        if (mode === 'play') play();
        else if (mode === 'show') show();
        else add();
      }

      /* ---------------------------------------------------------- wiring */
      root.querySelector('#abMode').addEventListener('click', function (e) {
        var b = e.target.closest('[data-m]');
        if (!b) return;
        root.querySelectorAll('#abMode .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        mode = b.getAttribute('data-m');
        if (mode === 'show') { frame = A.empty(); target = null; }
        if (mode === 'add') { frame = A.empty(); work = null; }
        draw();
      });

      /* Pressing the button with an empty box used to do nothing at all,
         which reads as a broken button rather than a missing number. */
      function showSum() {
        var note = body.querySelector('#abMsg');
        var a = parseInt((body.querySelector('#abA') || {}).value, 10);
        var b = parseInt((body.querySelector('#abB') || {}).value, 10);
        if (isNaN(a) || isNaN(b)) {
          if (note) note.innerHTML = '<div class="msg msg-warn mt">'
            + 'Put a number in both boxes.</div>';
          return;
        }
        var w = A.addSteps(a, b);
        if (!w) {
          if (note) note.innerHTML = '<div class="msg msg-warn mt">'
            + 'That is too big for this abacus.</div>';
          return;
        }
        w.a = a; w.b = b;
        addA = a; addB = b;
        work = w;
        frame = w.frame;
        draw();
      }

      body.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        if (e.target.id === 'abA' || e.target.id === 'abB') { e.preventDefault(); showSum(); }
      });

      body.addEventListener('click', function (e) {
        var bead = e.target.closest('.ab-bead');
        if (bead) {
          var rod = +bead.getAttribute('data-rod');
          if (bead.hasAttribute('data-heaven')) A.tapHeaven(frame, rod);
          else A.tapEarth(frame, rod, +bead.getAttribute('data-bead'));
          /* Once the beads have been moved by hand the worked sum below is
             no longer what is on the frame. */
          work = null;
          draw();
          return;
        }
        if (e.target.closest('#abClear')) { frame = A.empty(); work = null; draw(); return; }
        if (e.target.closest('#abNext')) { frame = A.empty(); target = pick(); draw(); return; }
        if (e.target.closest('#abSetGo')) {
          var n = parseInt(body.querySelector('#abSet').value, 10);
          if (!isNaN(n)) {
            var r = A.set(n);
            if (r.tooBig) {
              body.querySelector('#abSet').value = '';
              TB.App.toast('This abacus holds up to ' + r.max.toLocaleString('en-IN') + '.', 'err');
              return;
            }
            frame = r.frame;
            draw();
          }
          return;
        }
        if (e.target.closest('#abAddGo')) { showSum(); return; }
      });

      draw();
    }
  };
}());
