/* Tamil Bridge — boot, routing, and the behaviours shared by every view. */
window.TB = window.TB || {};

TB.App = (function () {
  var root, current = '', pendingSpeak = null;

  /* ------------------------------------------------------------- toasts */
  function toast(msg, kind) {
    var wrap = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity .25s';
      setTimeout(function () { el.remove(); }, 260);
    }, kind === 'err' ? 5200 : 2900);
  }

  function confirmBox(title, body, onYes) {
    var host = document.getElementById('modalRoot');
    host.innerHTML = '<div class="modal-bg"><div class="modal">'
      + '<h3 style="margin:0 0 6px">' + TB.Views.esc(title) + '</h3>'
      + '<p class="small muted">' + TB.Views.esc(body) + '</p>'
      + '<div class="row" style="justify-content:flex-end;margin-top:14px">'
      + '<button class="btn" id="mNo" type="button">Cancel</button>'
      + '<button class="btn btn-primary" id="mYes" type="button">Yes</button></div>'
      + '</div></div>';
    function close() { host.innerHTML = ''; }
    host.querySelector('#mNo').addEventListener('click', close);
    host.querySelector('.modal-bg').addEventListener('click', function (e) {
      if (e.target === this) close();
    });
    host.querySelector('#mYes').addEventListener('click', function () { close(); onYes(); });
  }

  /* --------------------------------------------------------- word popup */
  function wordPopup(word, lang) {
    var clean = String(word).replace(/^[^\w஀-௿ऀ-ॿ]+|[^\w஀-௿ऀ-ॿ]+$/g, '');
    if (!clean) return;
    var host = document.getElementById('modalRoot');
    var quick = TB.Dict.quick(clean, lang);

    host.innerHTML = '<div class="modal-bg"><div class="modal">'
      + '<div class="row"><h3 style="margin:0;font-size:22px">' + TB.Views.esc(clean) + '</h3>'
      + TB.Views.speak(clean, lang)
      + '<div style="flex:1"></div><button class="btn btn-sm btn-ghost" id="wClose" type="button">✕</button></div>'
      + '<div id="wBody" class="mt">'
      + (quick
          ? '<div class="grid g3">'
            + box('English', quick.en, 'en') + box('Hindi', quick.hi, 'hi') + box('Tamil', quick.ta, 'ta')
            + '</div>' + (quick.note ? '<div class="tiny muted mt">' + TB.Views.esc(quick.note) + '</div>' : '')
          : '<span class="spin"></span> Searching…')
      + '</div>'
      + '<button class="btn btn-sm mt" id="wFull" type="button">Full details →</button>'
      + '</div></div>';

    function box(l, v, lg) {
      if (!v) return '<div><div class="tiny muted">' + l + '</div><div class="muted">—</div></div>';
      return '<div><div class="tiny muted">' + l + '</div><div class="' + lg + '" style="font-size:18px;font-weight:650">'
        + TB.Views.esc(v) + TB.Views.speak(v, lg) + '</div></div>';
    }

    function close() { host.innerHTML = ''; }
    host.querySelector('#wClose').addEventListener('click', close);
    host.querySelector('.modal-bg').addEventListener('click', function (e) { if (e.target === this) close(); });
    host.querySelector('#wFull').addEventListener('click', function () {
      close(); TB.App.pending = { word: clean }; location.hash = '#/meaning';
    });

    if (!quick) {
      TB.Dict.lookup(clean, lang).then(function (c) {
        var b = host.querySelector('#wBody');
        if (!b) return;
        var t = c.translations || {};
        b.innerHTML = '<div class="grid g3">' + box('English', t.en, 'en') + box('Hindi', t.hi, 'hi') + box('Tamil', t.ta, 'ta') + '</div>';
      }).catch(function () {
        var b = host.querySelector('#wBody');
        if (b) b.innerHTML = '<span class="muted small">No meaning found (may need internet).</span>';
      });
    }
  }

  /* ----------------------------------------------------------- chrome UI */
  function refreshChips() {
    var d = TB.Store.data(TB.Auth.userId());
    var s = document.getElementById('streakChip');
    var x = document.getElementById('xpChip');
    if (s) s.textContent = '🔥 ' + (d.stats.streak || 0);
    if (x) x.textContent = (d.stats.xp || 0) + ' XP';
    var due = TB.SRS.counts(d.srs, TB.VOCAB).due;
    var b = document.getElementById('dueBadge');
    if (b) { b.textContent = due; b.style.display = due ? '' : 'none'; }
  }

  function paintUser() {
    var u = TB.Auth.user();
    if (!u) return;
    document.getElementById('avatar').textContent = (u.name || '?').trim().charAt(0).toUpperCase();
    document.getElementById('whoName').textContent = u.name || '—';
    document.getElementById('whoSub').textContent = u.email || u.phone || '';
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var b = document.getElementById('themeBtn');
    if (b) b.textContent = t === 'dark' ? '🌙' : '☀️';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0d1117' : '#f6f8fa');
  }

  /* -------------------------------------------------------------- router */
  var ROUTES = {
    home: 'home', learn: 'learn', practice: 'practice', translate: 'translate',
    meaning: 'meaning', tutor: 'tutor', photo: 'photo', speak: 'speak', write: 'write',
    alphabet: 'alphabet', phonics: 'phonics', vocab: 'vocab',
    history: 'history', settings: 'settings'
  };

  function parseHash() {
    var h = (location.hash || '#/home').replace(/^#\/?/, '');
    var parts = h.split('/');
    return { view: ROUTES[parts[0]] ? parts[0] : 'home', param: parts[1] || '' };
  }

  function render() {
    var r = parseHash();
    var v = TB.Views[r.view];
    if (!v) { location.hash = '#/home'; return; }

    TB.Speech.stop();
    current = r.view;

    document.getElementById('viewTitle').textContent = v.title;
    document.getElementById('viewSub').textContent = v.sub || '';
    document.querySelectorAll('#nav a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-v') === r.view);
    });

    root.innerHTML = v.html(r.param);
    try { v.mount(root, r.param); } catch (e) { console.error('mount', r.view, e); }
    refreshChips();
    window.scrollTo(0, 0);
    document.getElementById('side').classList.remove('open');
    var scrim = document.querySelector('.scrim');
    if (scrim) scrim.remove();
  }

  /* ------------------------------------------------------- global events */
  function wireGlobal() {
    /* speak buttons and tappable words, delegated once */
    document.addEventListener('click', function (e) {
      var sp = e.target.closest('[data-speak]');
      if (sp) {
        e.preventDefault();
        var text = sp.getAttribute('data-speak');
        var lang = sp.getAttribute('data-lang') || 'en';
        if (!text) return;
        var d = TB.Store.data(TB.Auth.userId());
        var names = { ta: d.prefs.voiceTa, en: d.prefs.voiceEn, hi: d.prefs.voiceHi };
        if (pendingSpeak) pendingSpeak.classList.remove('playing');
        sp.classList.add('playing');
        pendingSpeak = sp;
        TB.Speech.speak(text, lang, {
          rate: d.prefs.rate, pitch: d.prefs.pitch, voiceName: names[lang]
        }).then(function () { sp.classList.remove('playing'); });
        return;
      }
      var w = e.target.closest('[data-word]');
      if (w && !e.target.closest('[data-speak]')) {
        wordPopup(w.getAttribute('data-word'), w.getAttribute('data-wlang') || 'en');
      }
    });

    window.addEventListener('hashchange', render);

    document.getElementById('themeBtn').addEventListener('click', function () {
      var d = TB.Store.data(TB.Auth.userId());
      d.prefs.theme = d.prefs.theme === 'dark' ? 'light' : 'dark';
      TB.Store.saveData(TB.Auth.userId(), d);
      applyTheme(d.prefs.theme);
    });

    document.getElementById('signOut').addEventListener('click', function () {
      confirmBox('Sign out?', 'Your data stays safe on this device.', function () {
        TB.Auth.signOut();
        TB.Sync.clear();
        location.reload();
      });
    });

    var menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', function () {
      var side = document.getElementById('side');
      side.classList.add('open');
      var scrim = document.createElement('div');
      scrim.className = 'scrim';
      scrim.addEventListener('click', function () { side.classList.remove('open'); scrim.remove(); });
      document.body.appendChild(scrim);
    });

    document.addEventListener('keydown', function (e) {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'Escape') { document.getElementById('modalRoot').innerHTML = ''; TB.Speech.stop(); }
      if (current === 'practice' && TB.Views.practiceKey) TB.Views.practiceKey(e);
    });
  }

  /* ---------------------------------------------------------------- auth */
  function wireAuth() {
    var mode = 'in';
    var form = document.getElementById('authForm');
    var msg = document.getElementById('authMsg');
    var tabIn = document.getElementById('tabIn'), tabUp = document.getElementById('tabUp');

    function setMode(m) {
      mode = m;
      tabIn.classList.toggle('on', m === 'in');
      tabUp.classList.toggle('on', m === 'up');
      document.getElementById('nameField').style.display = m === 'up' ? '' : 'none';
      document.getElementById('pwHint').style.display = m === 'up' ? '' : 'none';
      document.getElementById('authGo').textContent = m === 'up' ? 'Create account' : 'Sign in';
      document.getElementById('fPw').setAttribute('autocomplete', m === 'up' ? 'new-password' : 'current-password');
      msg.innerHTML = '';
    }
    tabIn.addEventListener('click', function () { setMode('in'); });
    tabUp.addEventListener('click', function () { setMode('up'); });

    var note = document.getElementById('privacyNote');
    note.innerHTML = TB.Sync.configured()
      ? '🔒 Your password is never stored — only a PBKDF2 hash of it. '
        + 'Sync is enabled: <span class="mono">' + TB.Views.esc(TB.Sync.baseUrl()) + '</span>'
      : '🔒 This account lives <b>on this device only</b> — no server, no cost, '
        + 'nothing is sent anywhere. Your password is stored only as a PBKDF2 hash. '
        + 'To use the same account on another device, turn on Sync in Settings.';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('authGo');
      var name = document.getElementById('fName').value;
      var id = document.getElementById('fId').value;
      var pw = document.getElementById('fPw').value;
      var remember = document.getElementById('fRemember').checked;

      msg.innerHTML = '';
      btn.disabled = true;
      var label = btn.textContent;
      btn.innerHTML = '<span class="spin"></span> Please wait…';

      var local = mode === 'up'
        ? TB.Auth.signUp(name, id, pw)
        : TB.Auth.signIn(id, pw, remember);

      local.then(function (user) {
        /* mirror to the backend when one is configured; never block on it */
        if (TB.Sync.configured()) {
          var remote = mode === 'up' ? TB.Sync.signUp(name, id, pw) : TB.Sync.signIn(id, pw);
          remote.then(function () { return TB.Sync.pull(); })
            .then(function (remoteData) {
              var d = TB.Store.data(user.id);
              TB.Store.saveData(user.id, TB.Sync.merge(d, remoteData));
              toast('Synced', 'ok');
              render();
            })
            .catch(function () { /* offline or asleep: local mode is fine */ });
        }
        enter();
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = label;
        msg.innerHTML = '<div class="msg msg-err">' + TB.Views.esc(err.message) + '</div>';
      });
    });
  }

  function enter() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').classList.add('on');
    var d = TB.Store.data(TB.Auth.userId());
    applyTheme(d.prefs.theme || 'dark');
    paintUser();
    TB.buildIndexes();
    TB.Translit.rebuild();
    if (!location.hash || location.hash === '#') location.hash = '#/home';
    else render();
    refreshChips();

    /* push local changes up periodically when sync is on */
    if (TB.Sync.configured() && TB.Sync.hasToken()) {
      setInterval(function () {
        TB.Sync.push(TB.Store.data(TB.Auth.userId())).catch(function () {});
      }, 120000);
      window.addEventListener('beforeunload', function () {
        TB.Sync.push(TB.Store.data(TB.Auth.userId())).catch(function () {});
      });
    }
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    root = document.getElementById('viewRoot');

    if (!TB.Store.available()) {
      document.getElementById('authMsg').innerHTML =
        '<div class="msg msg-err">Browser storage (localStorage) is disabled. '
        + 'Turn off private/incognito mode and try again.</div>';
    }

    TB.buildIndexes();
    wireGlobal();
    wireAuth();

    /* voices arrive asynchronously; refresh Settings once they do */
    TB.Speech.onReady(function () {
      if (current === 'settings') render();
    });

    var restored = TB.Auth.restore();
    if (restored) enter();
    else {
      applyTheme('dark');
      document.getElementById('fId').focus();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return {
    render: render, toast: toast, confirm: confirmBox, refreshChips: refreshChips,
    paintUser: paintUser, applyTheme: applyTheme, wordPopup: wordPopup, pending: null
  };
})();
