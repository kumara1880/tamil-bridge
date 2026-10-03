/* Tamil Bridge — the search bar in the top of every page.

   One box, always there, that reaches every section, word, phrase, letter
   and rule in the app. Typing narrows as you go; the arrow keys move; Enter
   opens; Escape closes and gives the page back. On a phone the keyboard
   closes the moment you choose something, because nothing is more annoying
   than landing on a page you cannot see.                                  */
window.TB = window.TB || {};

TB.SearchBar = (function () {
  var K_RECENT = 'tb.recent';
  var form, input, out, clear;
  var rows = [], active = -1, timer = null, openState = false;

  /* -------------------------------------------------------------- recent */
  function recent() {
    try { return JSON.parse(localStorage.getItem(K_RECENT) || '[]').slice(0, 6); }
    catch (e) { return []; }
  }
  function remember(q) {
    q = String(q || '').trim();
    if (q.length < 2) return;
    save(recent().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); }), q);
  }

  function save(list, unshift) {
    try {
      if (unshift) list.unshift(unshift);
      localStorage.setItem(K_RECENT, JSON.stringify(list.slice(0, 6)));
    } catch (e) { /* a private window refuses; the search still works */ }
  }

  /* Anything typed into a search box is kept and shown back, so there has to
     be a way to take it out again — one at a time, or the lot. */
  function forget(q) {
    save(recent().filter(function (x) { return x !== q; }));
  }
  function forgetAll() { save([]); }

  /* ------------------------------------------------------------ rendering */
  var LABEL = {
    section: 'Section', word: 'Word', pair: 'Synonyms & antonyms',
    grammar: 'Grammar', talk: 'Conversation', phrase: 'Phrase',
    lesson: 'Lesson', verb: 'Tense chart', letter: 'Letter'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Show the person which part of the word they matched. */
  function mark(text, q) {
    var t = String(text == null ? '' : text);
    if (!q) return esc(t);
    var at = TB.Search.norm(t).indexOf(TB.Search.norm(q));
    if (at < 0 || TB.Search.norm(t).length !== t.length) return esc(t);
    return esc(t.slice(0, at)) + '<b>' + esc(t.slice(at, at + q.length)) + '</b>'
         + esc(t.slice(at + q.length));
  }

  function draw(list, q) {
    rows = list;
    active = list.length ? 0 : -1;

    if (!q && !list.length) {
      var r = recent();
      out.innerHTML =
        (r.length
          ? '<div class="search-group search-group-row">Recent'
            + '<button class="search-forget-all" data-forget-all type="button">Clear</button></div>'
            /* The row stays one button so the arrow keys still reach it; the
               ✕ sits beside it rather than inside, because a button cannot
               hold another button. */
            + r.map(function (x) {
                return '<div class="search-recent">'
                  + '<button class="search-row" data-again="' + esc(x) + '" type="button">'
                  +   '<span class="search-row-ic">\u{1F558}</span>'
                  +   '<span class="search-row-main"><span class="search-row-t">' + esc(x) + '</span></span>'
                  + '</button>'
                  + '<button class="search-forget" data-forget="' + esc(x) + '" type="button" '
                  +   'aria-label="Remove ' + esc(x) + ' from recent searches" '
                  +   'title="Remove from recent searches">✕</button>'
                  + '</div>';
              }).join('')
          : '')
        + '<div class="search-group">Jump to</div>'
        + TB.Search.SECTIONS.slice(0, 8).map(function (s) {
            return '<a class="search-row" href="' + s.href + '">'
              + '<span class="search-row-ic">' + s.ic + '</span>'
              + '<span class="search-row-main"><span class="search-row-t">' + esc(s.t) + '</span></span>'
              + '</a>';
          }).join('')
        + '<div class="search-foot">Searches every section, word, phrase and letter — '
        + 'in English, தமிழ், हिंदी or romanised.</div>';
      return;
    }

    if (!list.length) {
      out.innerHTML = '<div class="search-empty">Nothing matched “' + esc(q) + '”.<br>'
        + '<span class="tiny muted">Try the English word, the Tamil or Hindi word, '
        + 'or how it sounds — “poonai” finds பூனை.</span></div>';
      return;
    }

    var html = '', lastKind = '';
    list.forEach(function (e, i) {
      if (e.kind !== lastKind) {
        html += '<div class="search-group">' + esc(LABEL[e.kind] || e.kind) + '</div>';
        lastKind = e.kind;
      }
      html += '<a class="search-row' + (i === 0 ? ' on' : '') + '" href="' + e.href + '" data-i="' + i + '">'
        + '<span class="search-row-ic">' + e.ic + '</span>'
        + '<span class="search-row-main">'
        +   '<span class="search-row-t">' + mark(e.t, q) + '</span>'
        +   (e.s ? '<span class="search-row-s">' + esc(e.s) + '</span>' : '')
        + '</span>'
        + '<span class="search-row-go">→</span>'
        + '</a>';
    });
    out.innerHTML = html;
  }

  function highlight() {
    var all = out.querySelectorAll('.search-row');
    all.forEach(function (a, i) { a.classList.toggle('on', i === active); });
    var on = all[active];
    if (on) on.scrollIntoView({ block: 'nearest' });
  }

  /* ---------------------------------------------------------- open, close */
  function open() {
    if (openState) return;
    openState = true;
    out.hidden = false;
    form.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
  }
  function close() {
    openState = false;
    out.hidden = true;
    form.classList.remove('open');
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function run() {
    var q = input.value.trim();
    clear.hidden = !q;
    draw(q ? TB.Search.query(q, 14) : [], q);
    open();
  }

  function go(href, q) {
    remember(q || input.value);
    close();
    input.blur();                       /* closes the keyboard on a phone */
    location.hash = href;
  }

  /* --------------------------------------------------------------- wiring */
  function mount() {
    form = document.getElementById('searchForm');
    input = document.getElementById('searchInput');
    out = document.getElementById('searchOut');
    clear = document.getElementById('searchClear');
    if (!form || !input || !out) return;

    clear.hidden = true;

    input.addEventListener('focus', run);
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(run, 70);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); input.blur(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var all = out.querySelectorAll('.search-row');
        if (!all.length) return;
        e.preventDefault();
        active = e.key === 'ArrowDown'
          ? (active + 1) % all.length
          : (active - 1 + all.length) % all.length;
        highlight();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        var on = out.querySelectorAll('.search-row')[active < 0 ? 0 : active];
        if (!on) return;
        if (on.hasAttribute('data-again')) {
          input.value = on.getAttribute('data-again');
          run();
        } else {
          go(on.getAttribute('href'));
        }
      }
    });

    form.addEventListener('submit', function (e) { e.preventDefault(); });

    clear.addEventListener('click', function () {
      input.value = '';
      clear.hidden = true;
      input.focus();
      run();
    });

    out.addEventListener('click', function (e) {
      /* Removing a past search must not also run it, so these come first
         and stop there. */
      var drop = e.target.closest('[data-forget]');
      if (drop) {
        e.preventDefault();
        e.stopPropagation();
        forget(drop.getAttribute('data-forget'));
        input.focus();
        run();
        return;
      }
      if (e.target.closest('[data-forget-all]')) {
        e.preventDefault();
        e.stopPropagation();
        forgetAll();
        input.focus();
        run();
        return;
      }
      var again = e.target.closest('[data-again]');
      if (again) {
        e.preventDefault();
        input.value = again.getAttribute('data-again');
        input.focus();
        run();
        return;
      }
      var row = e.target.closest('.search-row');
      if (!row) return;
      e.preventDefault();
      go(row.getAttribute('href'));
    });

    /* A click anywhere else puts the page back. */
    document.addEventListener('click', function (e) {
      if (!openState) return;
      if (form.contains(e.target) || out.contains(e.target)) return;
      close();
    });

    /* "/" is the search key everywhere on the web, and Ctrl-K is the one
       people who use apps all day already have in their fingers. */
    document.addEventListener('keydown', function (e) {
      var inField = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))
        || e.target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); input.focus(); input.select(); return;
      }
      if (e.key === '/' && !inField && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault(); input.focus(); input.select();
      }
    });

    /* Build the index when the browser is next idle, so the first keystroke
       never waits for three thousand words to be read. */
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
    idle(function () { try { TB.Search.build(); } catch (e) {} });
  }

  return { mount: mount, close: close };
})();
