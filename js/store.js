/* Tamil Bridge — persistence layer.
   Everything lives in the browser's localStorage. No server, no cost, no tracking.
   Layout:
     tb.users            -> { userId: userRecord }
     tb.session          -> { userId, since }        (remembered sign-in)
     tb.data.<userId>    -> { history, srs, progress, stats, prefs }
     tb.data.guest       -> the same, for anyone who has not signed in
   All reads are defensive: a corrupted or cleared store must never break the app. */
window.TB = window.TB || {};

TB.Store = (function () {
  var K_USERS = 'tb.users';
  var K_SESSION = 'tb.session';
  var K_DATA = 'tb.data.';
  var GUEST = 'guest';
  var MAX_HISTORY = 1000;

  /* Nothing on this site asks you to sign in first, so most people arrive
     signed out and stay that way. Their settings — the voice, the theme,
     the text size — still have to survive a reload, so they get a bucket
     of their own instead of being dropped on the floor. */
  function bucket(userId) { return userId || GUEST; }

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

  /* A number, or zero. Guards the places where a value arrives from a file
     or from an older build and has to be arithmetic afterwards. */
  function num(v) {
    var n = typeof v === 'number' ? v : parseFloat(v);
    return isFinite(n) ? n : 0;
  }

  /* A plain object — not null, not a list, not a number or a string. */
  function isRecord(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  /* Fold one record into another — a restored backup, or a guest's work
     arriving in a new account. Nothing already there is lost.

     A backup file is whatever somebody hands you, so every part is checked
     for its shape and every number for being a number: "NaN" as the xp used
     to survive Math.max and be written out as null, blanking a real score.

     It used to bring back history, cards, progress and xp, and nothing else:
     a restored backup lost the voice, the theme, the text size, the streak
     and the days used. And every history entry without an id collapsed into
     one, because they all shared the id "undefined". */
  function merge(d, inc) {
    if (!isRecord(inc)) return d;
    if (Array.isArray(inc.history)) {
      var seen = {}, n = 0;
      d.history = inc.history.filter(isRecord).map(function (h) {
        if (!h.id) h.id = 'imp' + (h.ts || 0).toString(36) + '-' + (n++);
        return h;
      }).concat(d.history)
        .filter(function (h) { if (seen[h.id]) return false; seen[h.id] = 1; return true; })
        .sort(function (a, b) { return num(b.ts) - num(a.ts); })
        .slice(0, MAX_HISTORY);
    }
    if (isRecord(inc.srs)) {
      Object.keys(inc.srs).forEach(function (k) {
        var r = inc.srs[k], l = d.srs[k];
        if (!isRecord(r)) return;
        /* the card reviewed most recently is the one that knows the most */
        if (!l || num(r.seen) > num(l.seen)) d.srs[k] = r;
      });
    }
    if (isRecord(inc.progress)) {
      Object.keys(inc.progress).forEach(function (k) {
        var r = inc.progress[k], l = d.progress[k];
        if (!isRecord(r)) return;
        /* the more recent result wins, so restoring an old backup cannot
           undo a lesson finished since */
        if (!isRecord(l) || num(r.ts) >= num(l.ts)) d.progress[k] = r;
      });
    }
    if (isRecord(inc.stats)) {
      var s = inc.stats;
      ['xp', 'daysUsed', 'practiced', 'translated'].forEach(function (k) {
        d.stats[k] = Math.max(num(d.stats[k]), num(s[k]));
      });
      /* the streak belongs to whichever record was used most recently */
      if (typeof s.lastActive === 'string' && (!d.stats.lastActive || s.lastActive > d.stats.lastActive)) {
        d.stats.lastActive = s.lastActive;
        d.stats.streak = Math.max(1, num(s.streak));
      }
    }
    if (isRecord(inc.prefs)) {
      var base = blankData().prefs;
      Object.keys(inc.prefs).forEach(function (k) {
        var v = inc.prefs[k];
        /* only settings this app knows, of the type it expects */
        if (k in base && v != null && typeof v === typeof base[k]) d.prefs[k] = v;
        else if ((k === 'talkLang' || k === 'talkLevel') && v != null) d.prefs[k] = v;
      });
    }
    return d;
  }

  function blankData() {
    return {
      history: [],       /* newest first */
      srs: {},           /* wordId -> { ease, interval, due, reps, lapses } */
      progress: {},      /* lessonId -> { done, score, ts } */
      stats: { xp: 0, streak: 0, daysUsed: 0, lastActive: null, practiced: 0, translated: 0 },
      prefs: {
        theme: 'dark', themeChosen: false, rate: 0.85, pitch: 1,
        voiceTa: '', voiceEn: '', voiceHi: '', voiceSex: '',
        autoSpeak: true, showRoman: true, target: 'ta', textSize: 'normal'
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
      if (!userId) return;
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
      var key = K_DATA + bucket(userId);
      var d = read(key, null);
      /* A stored value that is not a record at all — a number, a string, a
         list — used to get past the check above and then throw on d.prefs,
         which broke every page. It is treated as no data. */
      if (!isRecord(d)) { d = blankData(); write(key, d); return d; }
      /* merge in any keys added by a later version of the app */
      var base = blankData();
      Object.keys(base).forEach(function (k) {
        if (d[k] == null) d[k] = base[k];
      });
      /* and put back any part that is the wrong shape for what reads it */
      if (!Array.isArray(d.history)) d.history = [];
      ['srs', 'progress', 'stats', 'prefs'].forEach(function (k) {
        if (!isRecord(d[k])) d[k] = base[k];
      });
      Object.keys(base.prefs).forEach(function (k) {
        if (d.prefs[k] == null) d.prefs[k] = base.prefs[k];
      });
      Object.keys(base.stats).forEach(function (k) {
        if (d.stats[k] == null) d.stats[k] = base.stats[k];
      });
      return d;
    },

    saveData: function (userId, d) { return write(K_DATA + bucket(userId), d); },

    /* The one merge — a backup, a guest's work, or the server's copy. */
    mergeInto: function (d, inc) { return merge(d, inc); },

    /* ---------- history ---------- */
    addHistory: function (userId, entry) {
      var d = api.data(userId);
      entry.id = 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      entry.ts = Date.now();
      d.history.unshift(entry);
      if (d.history.length > MAX_HISTORY) d.history.length = MAX_HISTORY;
      /* Only an entry that was really kept is handed back. */
      return api.saveData(userId, d) ? entry : null;
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
    /* The day has to end at midnight where the person is. toISOString gives
       the UTC date, which in India turns over at half past five in the
       morning — so an evening session and the next morning's could land on
       the same "day" and the streak would sit still, or a late-night one
       could count as the day before. */
    localDay: function (date) {
      var t = date || new Date();
      return t.getFullYear() + '-'
        + ('0' + (t.getMonth() + 1)).slice(-2) + '-'
        + ('0' + t.getDate()).slice(-2);
    },

    touchStreak: function (userId) {
      var d = api.data(userId);
      var today = api.localDay();
      var last = d.stats.lastActive;
      if (last === today) return d.stats;
      if (last) {
        /* Both are plain YYYY-MM-DD, so compare them as dates at noon: parsing
           a bare date string gives UTC midnight, and an hour either way then
           rounds to the wrong number of days. */
        var at = function (s2) { return new Date(s2 + 'T12:00:00'); };
        var diff = Math.round((at(today) - at(last)) / 86400000);
        /* Today is before the last day used: the clock was wound back, or
           the phone crossed a time zone westward. Nothing was missed, so
           nothing is reset — and the later date is kept, so the streak
           carries on normally once the calendar catches up. */
        if (!(diff >= 0)) return d.stats;
        d.stats.streak = diff === 1 ? (d.stats.streak || 0) + 1 : (diff === 0 ? (d.stats.streak || 1) : 1);
      } else {
        d.stats.streak = 1;
      }
      /* Days used, which only ever goes up — a missed day resets the streak
         but not the fact that the work was done. */
      d.stats.daysUsed = (d.stats.daysUsed || 0) + 1;
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
      if (!parsed || !parsed.data) throw new Error('That file is not a valid backup.');
      var d = api.data(userId);
      merge(d, parsed.data);
      api.saveData(userId, d);
      return d;
    },

    /* What a visitor did before making an account comes with them.

       The site is open to everyone, so most people try it first and sign up
       later — and signing up used to start them on a blank record, leaving
       their history, cards, progress, voice and theme behind in the guest
       bucket where the new account never looks. Called once an account is
       made: the guest's work is merged in, and the guest bucket is cleared so
       it is not merged into the next account made in this browser too. */
    adoptGuest: function (userId) {
      if (!userId) return false;
      var g = read(K_DATA + GUEST, null);
      if (!isRecord(g)) return false;
      var hasWork = (Array.isArray(g.history) && g.history.length)
        || (isRecord(g.srs) && Object.keys(g.srs).length)
        || (isRecord(g.progress) && Object.keys(g.progress).length)
        || (isRecord(g.stats) && num(g.stats.xp) > 0)
        || (isRecord(g.prefs) && g.prefs.themeChosen);
      if (!hasWork) return false;
      var d = api.data(userId);
      merge(d, g);
      var ok = api.saveData(userId, d);
      if (ok) { try { localStorage.removeItem(K_DATA + GUEST); } catch (e) {} }
      return ok;
    },

    available: function () {
      try { localStorage.setItem('tb.probe', '1'); localStorage.removeItem('tb.probe'); return true; }
      catch (e) { return false; }
    }
  };

  return api;
})();
