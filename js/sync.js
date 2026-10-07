/* Tamil Bridge — optional cloud sync.

   The app is complete without this file: accounts and history live in the
   browser and cost nothing. Point it at a backend and the same account also
   works on a second device.

   Configure the API in any one of these ways:
     - window.TB_API = 'https://your-app.onrender.com'   (before this script)
     - a ?api=<url> query parameter, remembered afterwards
     - Settings -> Sync in the app

   Render's free tier sleeps after ~15 minutes idle, so the first request can
   take up to a minute. Every call therefore has a long timeout and a silent
   fall back to local-only mode. Nothing here is required for the app to work. */
window.TB = window.TB || {};

TB.Sync = (function () {
  var K_API = 'tb.api';
  var K_TOKEN = 'tb.token';
  var base = '';
  var token = '';
  var lastError = '';
  var online = false;

  function init() {
    try {
      var q = new URLSearchParams(location.search).get('api');
      if (q) localStorage.setItem(K_API, q.replace(/\/+$/, ''));
      base = localStorage.getItem(K_API) || (window.TB_API || '');
      base = String(base).replace(/\/+$/, '');
      token = localStorage.getItem(K_TOKEN) || '';
    } catch (e) { base = window.TB_API || ''; }
  }
  init();

  function req(path, opts, timeoutMs) {
    if (!base) return Promise.reject(new Error('no-backend'));
    opts = opts || {};
    /* The body is an object; this function is what turns it into JSON.
       Handing it a string means it gets encoded twice and the server
       receives a JSON string containing JSON, which it cannot read. */
    if (typeof opts.body === 'string') {
      throw new Error('req() takes an object as its body, not a string.');
    }
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, timeoutMs || 70000);

    function attempt() {
      return fetch(base + path, {
        method: opts.method || 'GET',
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          token ? { Authorization: 'Bearer ' + token } : {},
          opts.headers || {}
        ),
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: ctl ? ctl.signal : undefined
      });
    }

    /* A free server sleeps when nobody is using it, and the request that
       wakes it is quite often dropped on the way. The browser reports that
       as the bare words "Failed to fetch", which tells a person nothing at
       all. So the first network failure is simply tried again. */
    return attempt().catch(function (e) {
      if (e && e.name === 'AbortError') throw e;
      return new Promise(function (r) { setTimeout(r, 2500); }).then(attempt);
    }).then(function (r) {
      clearTimeout(timer);
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
        online = true;
        return j;
      });
    }, function (e) {
      clearTimeout(timer);
      online = false;
      lastError = e.name === 'AbortError'
        ? 'The server did not answer in time. A free server sleeps when it is not being used '
          + 'and can take a minute to wake \u2014 please try once more.'
        : 'Could not reach the server. It may be waking up, or you may be offline \u2014 '
          + 'please try once more in a moment.';
      throw new Error(lastError);
    });
  }

  var api = {
    configured: function () { return !!base; },
    baseUrl: function () { return base; },
    isOnline: function () { return online; },
    lastError: function () { return lastError; },
    hasToken: function () { return !!token; },

    setBase: function (url) {
      base = String(url || '').replace(/\/+$/, '');
      try {
        if (base) localStorage.setItem(K_API, base);
        else localStorage.removeItem(K_API);
      } catch (e) {}
      return base;
    },

    setToken: function (t) {
      token = t || '';
      try {
        if (token) localStorage.setItem(K_TOKEN, token);
        else localStorage.removeItem(K_TOKEN);
      } catch (e) {}
    },

    clear: function () { api.setToken(''); },

    /* Wakes a sleeping Render instance; resolves null rather than throwing.
       The body says whether the server can actually keep an account across a
       restart, which matters more than whether it answered. */
    health: function () {
      if (!base) return Promise.resolve(null);
      return req('/api/health', {}, 75000).catch(function () { return null; });
    },

    ping: function () {
      return api.health().then(function (h) { return !!(h && h.ok); });
    },

    signUp: function (name, identifier, password) {
      return req('/api/auth/signup', { method: 'POST', body: { name: name, identifier: identifier, password: password } })
        .then(function (j) { if (j.token) api.setToken(j.token); return j.user; });
    },

    signIn: function (identifier, password) {
      return req('/api/auth/signin', { method: 'POST', body: { identifier: identifier, password: password } })
        .then(function (j) { if (j.token) api.setToken(j.token); return j.user; });
    },

    me: function () { return req('/api/auth/me').then(function (j) { return j.user; }); },

    /* Ask for a reset link. The server never says whether the address is
       registered — only whether it is able to send mail at all, which is a
       fact about the server and not about the person. */
    forgot: function (identifier) {
      return req('/api/auth/forgot', {
        method: 'POST', body: { identifier: identifier }
      }, 75000);
    },

    reset: function (token, password) {
      return req('/api/auth/reset', {
        method: 'POST', body: { token: token, password: password }
      }, 75000).then(function (j) {
        if (j.token) api.setToken(j.token);   /* signed in straight away */
        return j.user;
      });
    },

    /* Add or change the email on this account, which is what makes a
       phone-only account recoverable at all. */
    setEmail: function (password, email) {
      return req('/api/account/email', {
        method: 'POST', body: { password: password, email: email }
      }, 75000).then(function (j) { return j.user; });
    },

    /* Erase this account from the server. The password is asked for again
       because this cannot be undone. */
    deleteAccount: function (password) {
      return req('/api/account/delete', {
        method: 'POST', body: { password: password }
      }, 75000).then(function (j) { api.setToken(''); return j; });
    },

    pull: function () { return req('/api/data').then(function (j) { return j.data; }); },

    push: function (data) {
      return req('/api/data', {
        method: 'PUT',
        body: {
          /* The same thousand that merge() keeps and the store holds. Pushing
             five hundred meant the half a heavy user had above that never
             left the device, and a new device restored a history that had
             silently lost its older half. */
          history: (data.history || []).slice(0, 1000),
          srs: data.srs || {},
          progress: data.progress || {},
          stats: data.stats || {}
        }
      }, 40000);
    },

    /* Merge remote into local without losing anything. The same merge a
       restored backup uses. This one used to keep the larger streak whatever
       its date — reviving a streak that had ended — and dropped days used,
       practised and translated altogether. */
    merge: function (local, remote) {
      if (!remote) return local;
      return TB.Store.mergeInto(local, remote);
    }
  };

  return api;
})();
