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
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, timeoutMs || 70000);

    return fetch(base + path, {
      method: opts.method || 'GET',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        token ? { Authorization: 'Bearer ' + token } : {},
        opts.headers || {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctl ? ctl.signal : undefined
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
      lastError = e.name === 'AbortError' ? 'The server did not respond (a free Render service may be asleep).' : e.message;
      throw e;
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

    pull: function () { return req('/api/data').then(function (j) { return j.data; }); },

    push: function (data) {
      return req('/api/data', {
        method: 'PUT',
        body: {
          history: (data.history || []).slice(0, 500),
          srs: data.srs || {},
          progress: data.progress || {},
          stats: data.stats || {}
        }
      }, 40000);
    },

    /* Merge remote into local without losing anything: newest history wins,
       SRS keeps whichever card was reviewed most recently. */
    merge: function (local, remote) {
      if (!remote) return local;
      var seen = {};
      local.history = (remote.history || []).concat(local.history || [])
        .filter(function (h) { if (!h || !h.id || seen[h.id]) return false; seen[h.id] = 1; return true; })
        .sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); })
        .slice(0, 1000);

      Object.keys(remote.srs || {}).forEach(function (k) {
        var r = remote.srs[k], l = local.srs[k];
        if (!l || (r.seen || 0) > (l.seen || 0)) local.srs[k] = r;
      });
      Object.keys(remote.progress || {}).forEach(function (k) {
        var r = remote.progress[k], l = local.progress[k];
        if (!l || (r.ts || 0) > (l.ts || 0)) local.progress[k] = r;
      });
      if (remote.stats) {
        local.stats.xp = Math.max(local.stats.xp || 0, remote.stats.xp || 0);
        local.stats.streak = Math.max(local.stats.streak || 0, remote.stats.streak || 0);
      }
      return local;
    }
  };

  return api;
})();
