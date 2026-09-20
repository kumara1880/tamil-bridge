/* Tamil Bridge — persistence layer.
   Everything lives in the browser's localStorage. No server, no cost, no tracking.
   Layout:
     tb.users            -> { userId: userRecord }
     tb.session          -> { userId, since }        (remembered sign-in)
     tb.data.<userId>    -> { history, srs, progress, stats, prefs }
   All reads are defensive: a corrupted or cleared store must never break the app. */
window.TB = window.TB || {};

TB.Store = (function () {
  var K_USERS = 'tb.users';
  var K_SESSION = 'tb.session';
  var K_DATA = 'tb.data.';
  var MAX_HISTORY = 1000;

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      var val = JSON.parse(raw);
      return val == null ? fallback : val;
    } catch (e) { return fallback; }
  }

  function write(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      /* Quota exceeded — drop the oldest half of history and retry once. */
      if (key.indexOf(K_DATA) === 0) {
        try {
          val.history = (val.history || []).slice(0, Math.floor(MAX_HISTORY / 2));
          localStorage.setItem(key, JSON.stringify(val));
          return true;
        } catch (e2) { /* fall through */ }
      }
      console.warn('TB.Store: could not save', key, e);
      return false;
    }
  }

  function blankData() {
    return {
      history: [],       /* newest first */
      srs: {},           /* wordId -> { ease, interval, due, reps, lapses } */
      progress: {},      /* lessonId -> { done, score, ts } */
      stats: { xp: 0, streak: 0, lastActive: null, practiced: 0, translated: 0 },
      prefs: {
        theme: 'dark', rate: 0.85, pitch: 1, voiceTa: '', voiceEn: '', voiceHi: '',
        autoSpeak: true, showRoman: true, target: 'en', ui: 'ta'
      }
    };
  }

  var api = {
    /* ---------- users ---------- */
    users: function () { return read(K_USERS, {}); },
    saveUsers: function (u) { return write(K_USERS, u); },

    findUser: function (identifier) {
      var users = api.users();
      var key = String(identifier || '').trim().toLowerCase();
      if (!key) return null;
      var ids = Object.keys(users);
      for (var i = 0; i < ids.length; i++) {
        var u = users[ids[i]];
        if ((u.email || '').toLowerCase() === key) return u;
        if (api.normalisePhone(u.phone) && api.normalisePhone(u.phone) === api.normalisePhone(key)) return u;
      }
      return null;
    },

    normalisePhone: function (p) {
      var d = String(p || '').replace(/[^\d]/g, '');
      if (!d) return '';
      if (d.length > 10) d = d.slice(-10);   /* ignore country code for matching */
      return d;
    },

    putUser: function (user) {
      var users = api.users();
      users[user.id] = user;
      return api.saveUsers(users);
    },

    deleteUser: function (userId) {
      var users = api.users();
      delete users[userId];
      api.saveUsers(users);
      try { localStorage.removeItem(K_DATA + userId); } catch (e) {}
    },

    /* ---------- session ---------- */
    session: function () { return read(K_SESSION, null); },
    setSession: function (userId) { return write(K_SESSION, { userId: userId, since: Date.now() }); },
    clearSession: function () { try { localStorage.removeItem(K_SESSION); } catch (e) {} },

    /* ---------- per-user data ---------- */
    data: function (userId) {
      if (!userId) return blankData();
      var d = read(K_DATA + userId, null);
      if (!d) { d = blankData(); write(K_DATA + userId, d); return d; }
      /* merge in any keys added by a later version of the app */
      var base = blankData();
      Object.keys(base).forEach(function (k) {
        if (d[k] == null) d[k] = base[k];
      });
      Object.keys(base.prefs).forEach(function (k) {
        if (d.prefs[k] == null) d.prefs[k] = base.prefs[k];
      });
      Object.keys(base.stats).forEach(function (k) {
        if (d.stats[k] == null) d.stats[k] = base.stats[k];
      });
      return d;
    },

    saveData: function (userId, d) { if (userId) return write(K_DATA + userId, d); return false; },

    /* ---------- history ---------- */
    addHistory: function (userId, entry) {
      if (!userId) return null;
      var d = api.data(userId);
      entry.id = 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      entry.ts = Date.now();
      d.history.unshift(entry);
      if (d.history.length > MAX_HISTORY) d.history.length = MAX_HISTORY;
      api.saveData(userId, d);
      return entry;
    },

    deleteHistory: function (userId, entryId) {
      var d = api.data(userId);
      d.history = d.history.filter(function (h) { return h.id !== entryId; });
      api.saveData(userId, d);
    },

    clearHistory: function (userId) {
      var d = api.data(userId);
      d.history = [];
      api.saveData(userId, d);
    },

    /* ---------- stats / streak ---------- */
    touchStreak: function (userId) {
      var d = api.data(userId);
      var today = new Date().toISOString().slice(0, 10);
      var last = d.stats.lastActive;
      if (last === today) return d.stats;
      if (last) {
        var diff = Math.round((new Date(today) - new Date(last)) / 86400000);
        d.stats.streak = diff === 1 ? (d.stats.streak || 0) + 1 : 1;
      } else {
        d.stats.streak = 1;
      }
      d.stats.lastActive = today;
      api.saveData(userId, d);
      return d.stats;
    },

    addXp: function (userId, n) {
      var d = api.data(userId);
      d.stats.xp = (d.stats.xp || 0) + n;
      api.saveData(userId, d);
      return d.stats.xp;
    },

    /* ---------- export / import (user owns their data) ---------- */
    exportAll: function (userId) {
      var users = api.users();
      var u = users[userId];
      return JSON.stringify({
        version: 1,
        exported: new Date().toISOString(),
        profile: u ? { name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt } : null,
        data: api.data(userId)
      }, null, 2);
    },

    importData: function (userId, json) {
      var parsed = JSON.parse(json);
      if (!parsed || !parsed.data) throw new Error('இந்தக் கோப்பு சரியான காப்புப் பிரதி அல்ல.');
      var d = api.data(userId);
      var inc = parsed.data;
      if (Array.isArray(inc.history)) {
        var seen = {};
        d.history = inc.history.concat(d.history)
          .filter(function (h) { if (!h || seen[h.id]) return false; seen[h.id] = 1; return true; })
          .sort(function (a, b) { return b.ts - a.ts; })
          .slice(0, MAX_HISTORY);
      }
      if (inc.srs) Object.keys(inc.srs).forEach(function (k) { if (!d.srs[k]) d.srs[k] = inc.srs[k]; });
      if (inc.progress) Object.keys(inc.progress).forEach(function (k) { d.progress[k] = inc.progress[k]; });
      if (inc.stats) d.stats.xp = Math.max(d.stats.xp || 0, inc.stats.xp || 0);
      api.saveData(userId, d);
      return d;
    },

    available: function () {
      try { localStorage.setItem('tb.probe', '1'); localStorage.removeItem('tb.probe'); return true; }
      catch (e) { return false; }
    }
  };

  return api;
})();
