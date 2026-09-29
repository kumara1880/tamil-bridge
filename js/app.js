/* Tamil Bridge — boot, routing, and the behaviours shared by every view. */
window.TB = window.TB || {};

TB.App = (function () {
  var root, current = '', pendingSpeak = null;
  var warnedVoice = {};   /* one voice warning per language, not per click */

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
        + TB.Views.esc(v) + TB.Views.speak(v, lg) + '</div>'
        + (lg === 'hi' ? TB.Views.hiRead(v) : '') + '</div>';
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

  /* Three text sizes. Elders learning an unfamiliar script need bigger type,
     and the layout is sized in rem, so one root variable scales everything. */
  var SIZES = ['normal', 'large', 'largest'];
  function applyTextSize(size) {
    var px = { normal: 15, large: 17.5, largest: 20 }[size] || 15;
    document.documentElement.style.fontSize = px + 'px';
    document.documentElement.setAttribute('data-size', size);
    var b = document.getElementById('textBtn');
    if (b) b.textContent = { normal: 'A+', large: 'A++', largest: 'A·' }[size] || 'A+';
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
    home: 'home', learn: 'learn', phrases: 'phrases', practice: 'practice', translate: 'translate',
    meaning: 'meaning', numbers: 'numbers', maths: 'maths', english: 'english', tutor: 'tutor', conjugate: 'conjugate', photo: 'photo',
    speak: 'speak', write: 'write', modern: 'modern',
    alphabet: 'alphabet', phonics: 'phonics', vocab: 'vocab',
    history: 'history', settings: 'settings'
  };

  /* Each section owns a colour; the header wears it so you always know
     where you are without reading the title. */
  function paintSection(view) {
    var el = document.querySelector('.head');
    if (!el) return;
    var c = getComputedStyle(document.documentElement)
      .getPropertyValue('--c-' + view).trim();
    el.style.setProperty('--head-colour', c || 'var(--accent)');
  }

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

    paintSection(r.view);
    document.getElementById('viewTitle').textContent = v.title;
    document.getElementById('viewSub').textContent = v.sub || '';
    /* Some sections have several entries, one per tab, so the highlight goes
       on the entry whose address matches exactly; only when nothing matches
       does it fall back to the section's own plain entry. */
    var here = '#/' + r.view + (r.param ? '/' + r.param : '');
    var links = document.querySelectorAll('#nav a');
    var exact = null;
    links.forEach(function (a) { if (a.getAttribute('href') === here) exact = a; });
    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('on', exact
        ? a === exact
        : a.getAttribute('data-v') === r.view && href.split('/').length === 2);
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
        if (TB.Speech.missing(lang)) {
          if (!warnedVoice[lang]) {
            warnedVoice[lang] = true;
            toast(TB.Speech.missingVoiceMessage(lang), 'err');
          }
          return;   /* better silence than the wrong accent */
        }
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

    document.getElementById('textBtn').addEventListener('click', function () {
      var d = TB.Store.data(TB.Auth.userId());
      var next = SIZES[(SIZES.indexOf(d.prefs.textSize || 'normal') + 1) % SIZES.length];
      d.prefs.textSize = next;
      TB.Store.saveData(TB.Auth.userId(), d);
      applyTextSize(next);
      toast('Text size: ' + next);
    });

    document.getElementById('themeBtn').addEventListener('click', function () {
      var d = TB.Store.data(TB.Auth.userId());
      /* Toggle away from what is on the screen, not from what is stored.
         Earlier builds wrote 'dark' into everybody's preferences without
         their asking, and the screen then starts light while the stored
         value says dark — so the first tap set it to the colour it already
         was and appeared to do nothing at all. */
      var showing = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      d.prefs.theme = showing === 'dark' ? 'light' : 'dark';
      d.prefs.themeChosen = true;
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

    /* One card at a time: signing in, asking for a reset, or choosing a new
       password. Two tabs side by side made the screen ask a question before
       the person had answered the one they came for. */
    function show(which) {
      ['authCard', 'forgotCard', 'resetCard'].forEach(function (id) {
        document.getElementById(id).hidden = id !== which;
      });
      document.getElementById('authSwap').hidden = which !== 'authCard';
      var first = document.querySelector('#' + which + ' input:not([type=checkbox])');
      if (first) first.focus();
    }

    function setMode(m) {
      mode = m;
      var up = m === 'up';
      document.getElementById('nameField').style.display = up ? '' : 'none';
      document.getElementById('authHead').textContent = up ? 'Create your account' : 'Sign in';
      var ph = document.getElementById('pwHint');
      ph.style.display = up ? '' : 'none';
      if (up) ph.innerHTML = 'At least 8 characters, with a letter and a number.';
      document.getElementById('authGo').textContent = up ? 'Create account' : 'Continue';
      document.getElementById('fPw').setAttribute('autocomplete', up ? 'new-password' : 'current-password');
      document.getElementById('forgotLink').style.display = up ? 'none' : '';
      document.getElementById('swapLabel').textContent = up
        ? 'Already have an account?' : 'New to Tamil Bridge?';
      document.getElementById('swapBtn').textContent = up
        ? 'Sign in instead' : 'Create your free account';
      msg.innerHTML = '';
      show('authCard');
    }
    document.getElementById('swapBtn').addEventListener('click', function () {
      setMode(mode === 'up' ? 'in' : 'up');
    });

    /* ------------------------------------------------ what can this do?
       A free server that has been given no database throws every account
       away when it restarts, and the person who made one yesterday is then
       told their password is wrong. That is not true and it is not kind, so
       the screen finds out and says so. */
    var serverCan = { asked: false, durable: false, mail: false };
    if (TB.Sync.configured()) {
      TB.Sync.health().then(function (h) {
        serverCan = { asked: true, durable: !!(h && h.durable), mail: !!(h && h.mail) };
        if (h && h.ok && !h.durable) {
          msg.innerHTML = '<div class="msg msg-warn">'
            + '<b>This device only, for now.</b> The sign-in server is running but has '
            + 'no database yet, so accounts made on it do not survive a restart. '
            + 'Your account and everything you learn are kept safely in this browser '
            + 'instead — nothing is lost, but it will not follow you to another device.'
            + '</div>';
        }
      }).catch(function () { serverCan.asked = true; });
    }

    /* ------------------------------------------------------ resetting */
    var forgotCard = document.getElementById('forgotCard');
    var forgotMsg = document.getElementById('forgotMsg');
    var resetMsg = document.getElementById('resetMsg');

    document.getElementById('forgotLink').addEventListener('click', function () {
      forgotMsg.innerHTML = '';
      var typed = document.getElementById('fId').value.trim();
      if (typed) document.getElementById('fForgotId').value = typed;
      if (!TB.Sync.configured()) {
        forgotMsg.innerHTML = '<div class="msg msg-info">'
          + '<b>There is no server to email you.</b> This account lives in this browser '
          + 'only, so there is nowhere to send a link from. If you have forgotten the '
          + 'password, create a new account — nothing you have learnt is lost, because '
          + 'that is stored separately on this device.</div>';
      }
      show('forgotCard');
    });
    document.getElementById('forgotBack').addEventListener('click', function () { show('authCard'); });
    document.getElementById('resetBack').addEventListener('click', function () { show('authCard'); });

    document.getElementById('forgotForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var who = document.getElementById('fForgotId').value.trim();
      var go = document.getElementById('forgotGo');
      forgotMsg.innerHTML = '';
      if (!TB.Auth.isEmail(who)) {
        forgotMsg.innerHTML = '<div class="msg msg-err">Please type the email address you signed up with.</div>';
        return;
      }
      if (!TB.Sync.configured()) return;
      go.disabled = true;
      var label = go.textContent;
      go.innerHTML = '<span class="spin"></span> Sending…';
      TB.Sync.forgot(who).then(function () {
        go.disabled = false; go.textContent = label;
        forgotMsg.innerHTML = '<div class="msg msg-ok">'
          + '<b>Check your email.</b> If there is an account for that address, a link is '
          + 'on its way. It works for one hour. Look in the spam folder too.</div>';
      }).catch(function (err) {
        go.disabled = false; go.textContent = label;
        forgotMsg.innerHTML = '<div class="msg msg-err">' + TB.Views.esc(err.message) + '</div>';
      });
    });

    /* A link from the email arrives as ?reset=... on the front page. */
    (function () {
      var token = null;
      try { token = new URLSearchParams(location.search).get('reset'); } catch (e) {}
      if (!token) return;
      show('resetCard');
      document.getElementById('resetForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var pw = document.getElementById('fNewPw').value;
        var go = document.getElementById('resetGo');
        var issue = TB.Auth.passwordIssue(pw);
        resetMsg.innerHTML = '';
        if (issue) {
          resetMsg.innerHTML = '<div class="msg msg-err">' + TB.Views.esc(issue) + '</div>';
          return;
        }
        go.disabled = true;
        go.innerHTML = '<span class="spin"></span> Saving…';
        TB.Sync.reset(token, pw).then(function (remoteUser) {
          return TB.Auth.adopt(remoteUser, pw);
        }).then(function () {
          history.replaceState(null, '', location.pathname);
          enter();
        }).catch(function (err) {
          go.disabled = false; go.textContent = 'Save it';
          resetMsg.innerHTML = '<div class="msg msg-err">' + TB.Views.esc(err.message) + '</div>';
        });
      });
      var eye = document.getElementById('newPwEye'), np = document.getElementById('fNewPw');
      eye.addEventListener('click', function () {
        np.type = np.type === 'password' ? 'text' : 'password';
        eye.textContent = np.type === 'text' ? '\u{1F648}' : '\u{1F441}';
      });
    })();

    /* A phone number alone leaves no way back into the account, and the
       moment to say so is while somebody is choosing what to type \u2014 not
       after they have forgotten the password. */
    var idBox = document.getElementById('fId');
    idBox.addEventListener('input', function () {
      var v = idBox.value.trim();
      var warn = document.getElementById('idWarn');
      var phoneOnly = v && !TB.Auth.isEmail(v) && TB.Auth.isPhone(v);
      if (!warn) {
        warn = document.createElement('div');
        warn.id = 'idWarn';
        warn.className = 'hint';
        idBox.parentNode.appendChild(warn);
      }
      warn.innerHTML = (mode === 'up' && phoneOnly)
        ? '\u26A0\uFE0F A password can only be reset by email. With a number alone there is no '
          + 'way back in if you forget it \u2014 you can add an email later in Settings.'
        : '';
      warn.style.color = 'var(--red)';
    });

    /* show / hide the password */
    var pwInput = document.getElementById('fPw');
    var pwEye = document.getElementById('pwEye');
    if (pwEye) {
      pwEye.addEventListener('click', function () {
        var shown = pwInput.type === 'text';
        pwInput.type = shown ? 'password' : 'text';
        pwEye.textContent = shown ? '👁' : '🙈';
        pwEye.setAttribute('aria-label', shown ? 'Show password' : 'Hide password');
        pwEye.title = pwEye.getAttribute('aria-label');
        pwInput.focus();
      });
    }

    /* while creating an account, show which rules are still unmet */
    pwInput.addEventListener('input', function () {
      if (mode !== 'up') return;
      var v = pwInput.value;
      var rules = [
        { ok: v.length >= 8, text: '8+ characters' },
        { ok: /[a-zA-Z]/.test(v), text: 'a letter' },
        { ok: /\d/.test(v), text: 'a number' }
      ];
      document.getElementById('pwHint').innerHTML = rules.map(function (r) {
        return '<span style="color:' + (r.ok ? 'var(--green)' : 'var(--text-mute)') + '">'
             + (r.ok ? '✓' : '○') + ' ' + r.text + '</span>';
      }).join(' &nbsp; ');
    });

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
      var id = document.getElementById('fId').value.trim();
      var pw = document.getElementById('fPw').value;
      var remember = document.getElementById('fRemember').checked;

      msg.innerHTML = '';
      btn.disabled = true;
      var label = btn.textContent;
      btn.innerHTML = '<span class="spin"></span> Please wait…';

      function fail(text, hint) {
        btn.disabled = false;
        btn.textContent = label;
        msg.innerHTML = '<div class="msg msg-err">' + TB.Views.esc(text) + '</div>'
          + (hint ? '<div class="msg msg-info">' + hint + '</div>' : '');
      }

      function afterSync(user) {
        /* pull anything already stored on the server for this account */
        return TB.Sync.pull().then(function (remoteData) {
          var d = TB.Store.data(user.id);
          TB.Store.saveData(user.id, TB.Sync.merge(d, remoteData));
        }).catch(function () { /* nothing stored yet, or offline */ });
      }

      /* ------------------------------------------------------ SIGN UP --- */
      if (mode === 'up') {
        var localIssue = null;
        if (!name.trim()) localIssue = 'Please enter your name.';
        else if (!TB.Auth.isEmail(id) && !TB.Auth.isPhone(id)) localIssue = 'Enter a valid email address or phone number.';
        else localIssue = TB.Auth.passwordIssue(pw);
        if (localIssue) { fail(localIssue); return; }

        /* With sync on, the server decides whether the account already exists,
           so it is asked first. Without sync, local storage is the authority. */
        var create = TB.Sync.configured()
          ? TB.Sync.signUp(name, id, pw).then(
              function (remoteUser) {
                return TB.Auth.adopt(remoteUser, pw).then(function (u) {
                  return afterSync(u).then(function () { return u; });
                });
              },
              function (err) {
                /* the server is the authority on duplicates */
                if (/already registered/i.test(err.message)) throw err;
                /* unreachable or asleep: fall back to a local-only account */
                return TB.Auth.signUp(name, id, pw);
              })
          : TB.Auth.signUp(name, id, pw);

        create.then(function () { enter(); }).catch(function (err) { fail(err.message); });
        return;
      }

      /* ------------------------------------------------------ SIGN IN --- */
      TB.Auth.signIn(id, pw, remember)
        .then(function (user) {
          /* signed in locally; refresh from the server in the background */
          if (TB.Sync.configured()) {
            TB.Sync.signIn(id, pw)
              .then(function () { return afterSync(user); })
              .then(function () { toast('Synced', 'ok'); render(); })
              .catch(function () { /* local mode is fine */ });
          }
          enter();
        })
        .catch(function (localErr) {
          var knownHere = TB.Auth.knownLocally(id);

          /* The account is not in this browser. It may still exist on the
             server — that is the case the old flow never checked. */
          if (TB.Sync.configured()) {
            btn.innerHTML = '<span class="spin"></span> Checking the server…';
            TB.Sync.signIn(id, pw)
              .then(function (remoteUser) { return TB.Auth.adopt(remoteUser, pw); })
              .then(function (user) { return afterSync(user).then(function () { return user; }); })
              .then(function () { toast('Signed in from your account on the server', 'ok'); enter(); })
              .catch(function (remoteErr) {
                if (knownHere) { fail(localErr.message); return; }
                fail(remoteErr && /Incorrect/i.test(remoteErr.message || '')
                       ? remoteErr.message
                       : localErr.message,
                     storageHint());
              });
            return;
          }

          fail(localErr.message, knownHere ? '' : storageHint());
        });

      function storageHint() {
        /* If the server admitted it has no database, that is almost
           certainly what happened, and it is not the person's fault. */
        if (serverCan.asked && TB.Sync.configured() && !serverCan.durable) {
          return '<b>This is very likely not your mistake.</b> The sign-in server has no '
               + 'database yet, so any account made on it is thrown away when it restarts '
               + '\u2014 which a free server does often. Create the account again here and it '
               + 'will be kept in this browser, where it is safe.';
        }

        /* The server keeps accounts now, and it was asked, and it had never
           heard of this one. Saying "accounts live in this browser" here
           would send somebody hunting through other browsers for an account
           that is simply not anywhere. */
        if (serverCan.asked && serverCan.durable) {
          return '<b>This account is not on the server, and not in this browser either.</b> '
               + 'If you made it before the server had its database \u2014 earlier today or '
               + 'before \u2014 it was lost when the server restarted, and it cannot be brought '
               + 'back. Please create it again: accounts are kept properly now, and this one '
               + 'will follow you to any device. Otherwise, check for a typo in the address '
               + 'or number.';
        }

        return 'Accounts are saved <b>in this browser</b> unless you turn on Sync. '
             + 'An account created in a private/incognito window, in another browser, '
             + 'or on another device will not be found here. '
             + 'Create the account again, or set up Sync in Settings to use one account everywhere.';
      }
    });
  }

  function enter() {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').classList.add('on');
    var d = TB.Store.data(TB.Auth.userId());
    /* Only a theme the person actually chose counts. Earlier builds wrote
       'dark' into everyone's preferences by default, so an unflagged value
       is not a choice and light — the better default for children, parents
       and daylight — wins. */
    applyTheme(d.prefs.themeChosen ? (d.prefs.theme || 'light') : 'light');
    applyTextSize(d.prefs.textSize || 'normal');
    paintUser();
    TB.buildIndexes();
    TB.Translit.rebuild();
    if (TB.SearchBar) TB.SearchBar.mount();
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
      /* the sign-in screen should look like the rest of the app, not like
         the old default */
      applyTheme('light');
      applyTextSize('normal');
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
