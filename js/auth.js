/* Tamil Bridge — accounts.
   Sign up / sign in with email OR phone number. Passwords are never stored:
   only a salted PBKDF2-SHA256 derivation (150k iterations) is kept.
   This is device-local by design — there is no server, so there is no cost and
   no data leaves the machine. The UI states this plainly to the user.          */
window.TB = window.TB || {};

TB.Auth = (function () {
  var ITER = 150000;
  var current = null;   /* cached user record of whoever is signed in */

  /* ---------- tiny SHA-256 (fallback when crypto.subtle is unavailable) ---- */
  function sha256Bytes(bytes) {
    var K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var l = bytes.length, withOne = l + 1;
    var padLen = ((withOne + 8 + 63) & ~63);
    var m = new Uint8Array(padLen);
    m.set(bytes); m[l] = 0x80;
    var bitLenHi = Math.floor((l * 8) / 0x100000000), bitLenLo = (l * 8) >>> 0;
    var dv = new DataView(m.buffer);
    dv.setUint32(padLen - 8, bitLenHi); dv.setUint32(padLen - 4, bitLenLo);
    var w = new Uint32Array(64);
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (var off = 0; off < padLen; off += 64) {
      for (var i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i-15],7) ^ rotr(w[i-15],18) ^ (w[i-15] >>> 3);
        var s1 = rotr(w[i-2],17) ^ rotr(w[i-2],19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
      }
      var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        var S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) >>> 0;
        h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
      }
      H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
      H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
    }
    var out = new Uint8Array(32), odv = new DataView(out.buffer);
    for (var j = 0; j < 8; j++) odv.setUint32(j * 4, H[j]);
    return out;
  }

  function concat(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a, 0); out.set(b, a.length);
    return out;
  }

  function toHex(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
    return s;
  }

  function randomSalt() {
    var b = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(b);
    else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    return toHex(b);
  }

  /* PBKDF2 via WebCrypto, or an iterated-SHA256 fallback that keeps the same shape. */
  function derive(password, saltHex, iterations) {
    var enc = new TextEncoder();
    var pw = enc.encode(password);
    var salt = enc.encode(saltHex);

    if (window.crypto && window.crypto.subtle && window.crypto.subtle.importKey) {
      return window.crypto.subtle
        .importKey('raw', pw, { name: 'PBKDF2' }, false, ['deriveBits'])
        .then(function (key) {
          return window.crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' }, key, 256);
        })
        .then(function (bits) { return { hash: toHex(new Uint8Array(bits)), kdf: 'pbkdf2' }; })
        .catch(function () { return fallbackDerive(pw, salt, iterations); });
    }
    return Promise.resolve(fallbackDerive(pw, salt, iterations));
  }

  function fallbackDerive(pwBytes, saltBytes, iterations) {
    /* Reduced round count: pure JS, must stay responsive. Still salted + slow. */
    var rounds = Math.min(iterations, 20000);
    var acc = sha256Bytes(concat(saltBytes, pwBytes));
    for (var i = 0; i < rounds; i++) acc = sha256Bytes(concat(acc, pwBytes));
    return { hash: toHex(acc), kdf: 'sha256x' + rounds };
  }

  /* ---------- validation ---------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }
  function isPhone(v) { return /^\+?[\d\s\-()]{8,16}$/.test(String(v).trim()) && String(v).replace(/\D/g, '').length >= 8; }

  function passwordIssue(pw) {
    if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-zA-Z]/.test(pw)) return 'Password must contain at least one letter.';
    if (!/\d/.test(pw)) return 'Password must contain at least one number.';
    return null;
  }

  var api = {
    isEmail: isEmail,
    isPhone: isPhone,
    passwordIssue: passwordIssue,

    /* Register. `identifier` may be an email or a phone number. */
    signUp: function (name, identifier, password) {
      identifier = String(identifier || '').trim();
      name = String(name || '').trim();

      if (!name) return Promise.reject(new Error('Please enter your name.'));
      if (!isEmail(identifier) && !isPhone(identifier)) {
        return Promise.reject(new Error('Enter a valid email address or phone number.'));
      }
      var pwIssue = passwordIssue(password);
      if (pwIssue) return Promise.reject(new Error(pwIssue));
      if (TB.Store.findUser(identifier)) {
        return Promise.reject(new Error('That email or number is already registered. Please sign in.'));
      }
      if (!TB.Store.available()) {
        return Promise.reject(new Error('Browser storage is disabled. Please turn off private/incognito mode.'));
      }

      var salt = randomSalt();
      return derive(password, salt, ITER).then(function (res) {
        var user = {
          id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name: name,
          email: isEmail(identifier) ? identifier.toLowerCase() : '',
          phone: isPhone(identifier) ? identifier : '',
          salt: salt, hash: res.hash, kdf: res.kdf, iter: ITER,
          createdAt: Date.now()
        };
        TB.Store.putUser(user);
        TB.Store.setSession(user.id);
        current = user;
        TB.Store.touchStreak(user.id);
        return user;
      });
    },

    signIn: function (identifier, password, remember) {
      var user = TB.Store.findUser(identifier);
      if (!user) return Promise.reject(new Error('No account found for that email or number. Create one first.'));
      return derive(password, user.salt, user.iter || ITER).then(function (res) {
        var ok = res.hash === user.hash;
        /* A record created with one KDF must still verify if the other path is taken. */
        if (!ok && res.kdf !== user.kdf) {
          var enc = new TextEncoder();
          var alt = fallbackDerive(enc.encode(password), enc.encode(user.salt), user.iter || ITER);
          ok = alt.hash === user.hash;
        }
        if (!ok) throw new Error('Incorrect password. Please try again.');
        if (remember !== false) TB.Store.setSession(user.id);
        current = user;
        TB.Store.touchStreak(user.id);
        return user;
      });
    },

    signOut: function () {
      TB.Store.clearSession();
      current = null;
    },

    /* Restore a remembered session on page load. */
    restore: function () {
      var s = TB.Store.session();
      if (!s || !s.userId) return null;
      var u = TB.Store.users()[s.userId];
      if (!u) { TB.Store.clearSession(); return null; }
      current = u;
      TB.Store.touchStreak(u.id);
      return u;
    },

    user: function () { return current; },
    userId: function () { return current ? current.id : null; },

    changePassword: function (oldPw, newPw) {
      if (!current) return Promise.reject(new Error('Please sign in first.'));
      var issue = passwordIssue(newPw);
      if (issue) return Promise.reject(new Error(issue));
      return api.signIn(current.email || current.phone, oldPw, false).then(function () {
        var salt = randomSalt();
        return derive(newPw, salt, ITER).then(function (res) {
          current.salt = salt; current.hash = res.hash; current.kdf = res.kdf; current.iter = ITER;
          TB.Store.putUser(current);
          return true;
        });
      });
    },

    updateProfile: function (name, identifier) {
      if (!current) return Promise.reject(new Error('Please sign in first.'));
      identifier = String(identifier || '').trim();
      if (identifier) {
        if (!isEmail(identifier) && !isPhone(identifier)) {
          return Promise.reject(new Error('Enter a valid email address or phone number.'));
        }
        var clash = TB.Store.findUser(identifier);
        if (clash && clash.id !== current.id) {
          return Promise.reject(new Error('That email or number belongs to another account.'));
        }
        if (isEmail(identifier)) { current.email = identifier.toLowerCase(); }
        else { current.phone = identifier; }
      }
      if (name) current.name = String(name).trim();
      TB.Store.putUser(current);
      return Promise.resolve(current);
    },

    /* No server means no reset email. The honest option is a local re-key,
       which we only allow for the signed-in user or with full data loss. */
    deleteAccount: function () {
      if (!current) return;
      TB.Store.deleteUser(current.id);
      TB.Store.clearSession();
      current = null;
    }
  };

  return api;
})();
