/* Tamil Bridge — the modern world, for a child growing up in it.

   Filter by age or by subject; every topic reads in all three languages
   with the pronunciation underneath, and every line can be spoken aloud.

   Deliberately quiet in its design: these are topics a parent may want to
   read to a child, and a page that shouts is a page nobody reads twice.  */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;

  /* One block of prose in all three languages, each with its reading. */
  function trio(o, label) {
    if (!o) return '';
    return '<div class="mod-block">'
      + (label ? '<div class="mod-label">' + esc(label) + '</div>' : '')
      + ['en', 'ta', 'hi'].map(function (l) {
          return '<div class="lang-line"><div class="' + l + '">' + esc(o[l])
            + speak(o[l], l) + '</div>' + readAid(o[l], l) + '</div>';
        }).join('')
      + '</div>';
  }

  V.modern = {
    title: 'Growing up now',
    sub: 'Computers, AI, staying safe, money, sleep and the world — in all three languages',

    html: function (param) {
      var groups = TB.MODERN_GROUPS, bands = TB.MODERN_BANDS;
      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="row mb"><span class="tiny muted">Age:</span>'
        +     '<div class="pill-row" id="mBand">'
        +       '<button class="pill on" data-band="all" type="button">Any age</button>'
        +       bands.map(function (b) {
                  return '<button class="pill" data-band="' + b.id + '" type="button">'
                       + esc(b.en) + '</button>';
                }).join('')
        +     '</div>'
        +   '</div>'
        +   '<div class="row"><span class="tiny muted">About:</span>'
        +     '<div class="pill-row" id="mGroup">'
        +       '<button class="pill on" data-group="all" type="button">Everything</button>'
        +       groups.map(function (g) {
                  return '<button class="pill" data-group="' + g.id + '" type="button">'
                       + g.icon + ' ' + esc(g.en) + '</button>';
                }).join('')
        +     '</div>'
        +   '</div>'
        + '</div>'
        + '<div id="mBody"></div></div>';
    },

    mount: function (root, param) {
      var body = root.querySelector('#mBody');
      var band = 'all', group = 'all';

      /* A topic that was linked to directly opens on its own. */
      if (param && TB.MODERN.some(function (t) { return t.id === param; })) {
        group = 'all'; band = 'all';
      }

      function card(t) {
        var g = TB.MODERN_GROUPS.filter(function (x) { return x.id === t.group; })[0];
        var b = TB.MODERN_BANDS.filter(function (x) { return x.id === t.band; })[0];
        /* Seventeen topics open at once is a wall to scroll past. Shut, the
           page is a list of what there is, and you open the one you want. */
        return '<details class="card mod fold" id="m-' + esc(t.id) + '">'
          + '<summary class="fold-head"><div>'
          +   '<h3>' + t.icon + ' ' + esc(t.title.en) + '</h3>'
          +   '<div class="card-sub ta">' + esc(t.title.ta)
          +   ' · <span class="hi">' + esc(t.title.hi) + '</span>'
          +   V.hiTamil(t.title.hi) + '</div>'
          + '</div><div class="spacer"></div>'
          + '<span class="chip">' + esc(b ? b.en : '') + '</span></summary>'

          + trio(t.what)
          + trio(t.why, 'Why it matters')

          + '<div class="mod-words">'
          +   '<div class="mod-label">The words you need</div>'
          +   '<div class="pair-row">'
          +   t.words.map(function (w) {
                return '<span class="mod-word">'
                  + '<b>' + esc(w.en) + '</b>'
                  + '<span class="ta">' + esc(w.ta) + '</span>'
                  + '<span class="hi">' + esc(w.hi) + '</span>'
                  + V.hiTamil(w.hi)
                  + '<button class="mini" data-say="' + esc(w.ta) + '" data-lang="ta" type="button">\u{1F50A}</button>'
                  + '</span>';
              }).join('')
          +   '</div>'
          + '</div>'

          + '<div class="mod-try">' + trio(t.todo, '✨ Try this today') + '</div>'
          + '<div class="mod-careful">' + trio(t.careful, '⚠️ Be careful') + '</div>'
          + '</details>';
      }

      function draw() {
        var list = TB.MODERN.filter(function (t) {
          return (band === 'all' || t.band === band)
              && (group === 'all' || t.group === group);
        });

        body.innerHTML = '<div class="card"><div class="row">'
          + '<span class="tiny muted">' + list.length
          + (list.length === 1 ? ' topic' : ' topics') + '</span>'
          + '<div class="spacer" style="flex:1"></div>'
          + '<span class="tiny muted">Every line can be read aloud — tap \u{1F50A}</span>'
          + '</div></div>'
          + (list.length ? list.map(card).join('')
             : '<div class="empty">Nothing for that age in that subject yet.</div>');

        var d = D(); d.stats.xp = (d.stats.xp || 0) + 1; saveD(d);
        TB.App.refreshChips();

        /* A link straight to one topic opens it as well as finds it. */
        if (param) {
          var el = body.querySelector('#m-' + param);
          if (el) { el.open = true; el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
        }
      }

      root.querySelector('#mBand').addEventListener('click', function (e) {
        var b = e.target.closest('[data-band]');
        if (!b) return;
        root.querySelectorAll('#mBand .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        band = b.getAttribute('data-band');
        draw();
      });

      root.querySelector('#mGroup').addEventListener('click', function (e) {
        var b = e.target.closest('[data-group]');
        if (!b) return;
        root.querySelectorAll('#mGroup .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        group = b.getAttribute('data-group');
        draw();
      });

      /* One handler on the lasting element, not one per redraw. */
      body.addEventListener('click', function (e) {
        var s = e.target.closest('[data-say]');
        if (s) TB.Speech.speak(s.getAttribute('data-say'), s.getAttribute('data-lang'), { rate: 0.7 });
      });

      draw();
    }
  };
}());
