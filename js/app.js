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
      + '<div class="row"><h3 style="margin:0;font-size:calc(22px * var(--fs,1))">' + TB.Views.esc(clean) + '</h3>'
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
      return '<div><div class="tiny muted">' + l + '</div><div class="' + lg + '" style="font-size:calc(18px * var(--fs,1));font-weight:650">'
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
  var SIZE_NAME = { normal: 'Normal', large: 'Large', largest: 'Largest' };
  function applyTextSize(size) {
    /* The stylesheet multiplies every size it knows by --fs, so this one
       number moves the whole page. The root font size goes with it for the
       few things measured in rem. */
    var fs = { normal: 1, large: 1.16, largest: 1.34 }[size] || 1;
    document.documentElement.style.setProperty('--fs', fs);
    document.documentElement.style.fontSize = (16 * fs).toFixed(2) + 'px';
    document.documentElement.setAttribute('data-size', size);
    var b = document.getElementById('textBtn');
    if (!b) return;
    b.textContent = { normal: 'A', large: 'A+', largest: 'A++' }[size] || 'A';
    var next = SIZES[(SIZES.indexOf(size) + 1) % SIZES.length];
    b.title = 'Text size: ' + SIZE_NAME[size] + ' \u2014 press for ' + SIZE_NAME[next];
    b.setAttribute('aria-label', b.title);
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
    meaning: 'meaning', numbers: 'numbers', maths: 'maths', abacus: 'abacus', crosswise: 'crosswise', sums: 'sums', chart: 'chart', count: 'count', english: 'english', tutor: 'tutor', conjugate: 'conjugate', photo: 'photo',
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
    if (TB.Depth) TB.Depth.reveal(root);
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
        /* No voice on this device is not the end of it: speak() asks the
           online one before giving up. Refusing here meant Tamil was never
           even attempted, however well the online voice worked — which is
           why it never spoke on a machine with only English voices. */
        if (pendingSpeak) pendingSpeak.classList.remove('playing');
        sp.classList.add('playing');
        pendingSpeak = sp;
        TB.Speech.speak(text, lang, {
          rate: d.prefs.rate, pitch: d.prefs.pitch, voiceName: names[lang]
        }).then(function (res) {
          sp.classList.remove('playing');
          /* Only once everything has actually been tried. */
          if (res && res.noVoice && !warnedVoice[lang]) {
            warnedVoice[lang] = true;
            toast(TB.Speech.missingVoiceMessage(lang), 'err');
          }
        });
        return;
      }
      var w = e.target.closest('[data-word]');
      if (w && !e.target.closest('[data-speak]')) {
        wordPopup(w.getAttribute('data-word'), w.getAttribute('data-wlang') || 'en');
      }
    });

    window.addEventListener('hashchange', render);

    /* The logo goes home, and goes there again when you are already home.
       A hash that has not changed raises no event, so pressing it on the
       home page would otherwise do nothing at all — and what a person
       wants from pressing the logo twice is a page drawn fresh, with
       today's streak and today's word back on it. */
    var brand = document.getElementById('brandHome');
    if (brand) brand.addEventListener('click', function (e) {
      e.preventDefault();
      if (location.hash === '#/home' || !location.hash) render();
      else location.hash = '#/home';
    });

    document.getElementById('textBtn').addEventListener('click', function () {
      var d = TB.Store.data(TB.Auth.userId());
      var next = SIZES[(SIZES.indexOf(d.prefs.textSize || 'normal') + 1) % SIZES.length];
      d.prefs.textSize = next;
      TB.Store.saveData(TB.Auth.userId(), d);
      applyTextSize(next);
      toast('Text size: ' + SIZE_NAME[next]);
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

  /* Set while a reset link is being acted on. It lives out here because
     wireAuth() takes the token out of the address bar, and boot() still
     needs to know one arrived. */
  var resetPending = false;

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
    /* The messages above the form offer a way out of what they describe,
       so the button has to be wired to something. */
    msg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-auth-act]');
      if (!b) return;
      var act = b.getAttribute('data-auth-act');
      if (act === 'reset') {
        forgotMsg.innerHTML = '';
        var typed = document.getElementById('fId').value.trim();
        if (typed) document.getElementById('fForgotId').value = typed;
        show('forgotCard');
        return;
      }
      setMode(act);          /* 'in' or 'up' \u2014 and it clears the message */
    });

    /* An error left over from the last attempt, sitting above a different
       address being typed, reads as an error about the new one. One of the
       screenshots showed exactly that: a fresh address under "already
       registered", which was about the previous one. */
    ['fId', 'fPw', 'fName'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () {
        if (msg.innerHTML) msg.innerHTML = '';
      });
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
      try {
        var qs = new URLSearchParams(location.search);
        token = qs.get('reset');
        if (token) {
          /* Out of the address bar at once. A reset token has no business
             sitting in browser history or in a bookmark, and while it is
             there every reload \u2014 including the one that follows signing out
             \u2014 drops the person back on this card when they wanted to leave. */
          qs.delete('reset');
          var rest = qs.toString();
          history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
        }
      } catch (e) {}
      if (!token) return;
      resetPending = true;
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
          /* Keep the local copy of the account in step with the server, so
             this device can sign in with the new password even offline. */
          return TB.Auth.adopt(remoteUser, pw).then(function () { return remoteUser; });
        }).then(function (remoteUser) {
          /* Then let go of every session on this device and ask for the new
             password. Walking straight into the app would leave whoever
             opened the link inside the account \u2014 on a machine that may not
             be theirs \u2014 and would never show the person that the password
             they just chose actually works. */
          TB.Auth.signOut();
          TB.Sync.clear();
          resetPending = false;
          setMode('in');
          var id = document.getElementById('fId');
          id.value = (remoteUser && remoteUser.email) || '';
          document.getElementById('fPw').value = '';
          msg.innerHTML = '<div class="msg msg-ok"><b>Your password has been changed.</b> '
            + 'Please sign in with it now \u2014 that way you know it works.</div>';
          document.getElementById('fPw').focus();
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
        /* An address, not a number: a number cannot receive a reset link,
           and an account nobody can get back into is worse than no account. */
        else if (!TB.Auth.isEmail(id)) {
          localIssue = TB.Auth.isPhone(id)
            ? 'Please use an email address. A password can only be reset by email, so an '
              + 'account made with a number has no way back in if you forget it.'
            : 'Enter a valid email address.';
        }
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

        create.then(function () { enter(); }).catch(function (err) {
          /* "Sign in instead" only helps somebody who knows the password.
             The reason most people are on this screen is that they do not,
             so the way to a new one belongs here too. */
          if (/already registered/i.test(err.message || '')) {
            fail(err.message,
              'If you cannot remember the password, set a new one \u2014 the link comes '
              + 'by email and works for an hour.'
              + '<div class="msg-acts">'
              +   '<button class="btn btn-sm" data-auth-act="in" type="button">'
              +     'Sign in</button>'
              +   '<button class="btn btn-sm" data-auth-act="reset" type="button">'
              +     'Set a new password</button>'
              + '</div>');
            return;
          }
          fail(err.message);
        });
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

        /* The server answers a failed sign-in the same way whether the
           account does not exist or the password is wrong \u2014 deliberately,
           so the page cannot be used to find out who has an account here.
           So this cannot say which it was, and it used to say anyway: it
           announced that the account did not exist, and sent people to
           create it, where they were told it already existed. A loop with
           no way out, built out of a sentence that knew more than it
           could. */
        if (serverCan.asked && serverCan.durable) {
          return '<b>Either there is no account with this address, or that password is '
               + 'not the right one.</b> The sign-in page is not told which. If the '
               + 'account is yours, set a new password \u2014 the link comes by email and '
               + 'works for an hour.'
               + '<div class="msg-acts">'
               +   '<button class="btn btn-sm" data-auth-act="reset" type="button">'
               +     'Set a new password</button>'
               +   '<button class="btn btn-sm" data-auth-act="up" type="button">'
               +     'Create an account</button>'
               + '</div>';
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

    /* A reset link has to beat a remembered session. Somebody who clicked
       one means to choose a new password; signing them straight into the
       app instead makes the link look broken — it opens and vanishes.
       wireAuth() has already taken the token out of the address by now, so
       the answer comes from the flag rather than from location.search. */
    var resetting = resetPending;

    var restored = TB.Auth.restore();
    if (restored && !resetting) enter();
    else {
      /* the sign-in screen should look like the rest of the app, not like
         the old default */
      applyTheme('light');
      applyTextSize('normal');
      if (resetting) {
        var np = document.getElementById('fNewPw');
        if (np) np.focus();
      } else {
        document.getElementById('fId').focus();
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return {
    render: render, toast: toast, confirm: confirmBox, refreshChips: refreshChips,
    paintUser: paintUser, applyTheme: applyTheme, wordPopup: wordPopup, pending: null
  };
})();
