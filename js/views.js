/* Tamil Bridge — view rendering.
   Each view exposes { title, sub, html(), mount(root) }. The router in app.js
   swaps them. Shared behaviours (speak buttons, tappable words) are delegated
   once in app.js rather than rewired per view.                               */
window.TB = window.TB || {};

TB.Views = (function () {

  /* ------------------------------------------------------------ helpers */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* Tutor and lesson text marks emphasis as **word**. It is escaped first and
     only then given its bold, because some of it carries the reader's own
     words — the Sentence Explainer quotes the verb you typed back to you —
     and those must never reach the page as markup. Bolding the raw text and
     never escaping it let a typed <img onerror> run. */
  function emph(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }
  /* A word carried in the address. A half-copied link — "%E0%A4" with the
     rest of the letter missing — made decodeURIComponent throw inside html(),
     which the router does not catch, and the page stopped drawing. Whatever
     cannot be decoded is used as it is. */
  function safeDecode(s) {
    try { return decodeURIComponent(s); } catch (e) { return String(s || ''); }
  }
  function speak(text, lang, label) {
    if (!text) return '';
    return '<button class="speak-btn" data-speak="' + esc(text) + '" data-lang="' + lang + '" '
         + 'title="' + (label || 'Play') + '" type="button">🔊</button>';
  }
  function tappable(text, lang) {
    if (!text) return '';
    return String(text).split(/(\s+)/).map(function (tk) {
      if (/^\s*$/.test(tk)) return tk;
      return '<span class="word-tap" data-word="' + esc(tk) + '" data-wlang="' + lang + '">' + esc(tk) + '</span>';
    }).join('');
  }
  function ago(ts) {
    var d = Date.now() - ts, m = Math.floor(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' h ago';
    var dy = Math.floor(h / 24);
    if (dy < 30) return dy + ' d ago';
    return new Date(ts).toLocaleDateString('ta-IN');
  }
  /* Any Hindi text, with both readings underneath: roman letters for
     English readers and Tamil letters for Tamil readers. Curated values from
     the vocabulary win over the generated ones when we have them. */
  function hiRead(text) { return readAid(text, 'hi'); }

  /* Just the Tamil-script reading, on one line, for somewhere too tight for
     the full aid \u2014 a chip, a table cell, a subtitle already carrying two
     other languages. A Tamil reader needs the Tamil letters more than the
     English ones, so when only one will fit, this is the one that fits. */
  function hiTamil(text) {
    if (!text || !String(text).trim()) return '';
    var r;
    try { r = TB.Translit.readings(text, 'hi'); } catch (e) { return ''; }
    if (!r || !r.can || !r.tamil) return '';
    return '<span class="hi-tam-inline">' + esc(r.tamil) + '</span>';
  }

  /* The small grey line under a word or sentence: how to say it, in English
     letters and in Tamil letters. Shown for any script the reader can sound
     out, and simply left off when it cannot — a missing line is honest, a
     wrong one teaches the wrong sound. */
  /* How long a piece of text is still worth sounding out. A word, a phrase
     or an example sentence: yes, that is what the reading aid is for. A
     paragraph of explanation: no — it doubles the height of the card, and
     anybody who cannot read the script it is written in is reading the same
     rule in their own language two lines below. */
  var READ_ALOUD_LIMIT = 140;

  function readAid(text, lang, force) {
    if (!text || !String(text).trim()) return '';
    if (!force && String(text).length > READ_ALOUD_LIMIT) return '';
    var r;
    try { r = TB.Translit.readings(text, lang); } catch (e) { return ''; }
    if (!r || !r.can) return '';
    var bits = [];
    if (r.roman) bits.push('<span class="hi-rom">' + esc(r.roman) + '</span>');
    if (r.tamil) bits.push('<span class="hi-tam">' + (bits.length ? ' · ' : '') + esc(r.tamil) + '</span>');
    if (!bits.length) return '';
    return '<div class="hi-read">' + bits.join('') + '</div>';
  }

  /* Copy text, and say honestly whether it worked. */
  function copy(text) {
    var t = String(text == null ? '' : text);
    if (!t) return Promise.resolve(false);

    function fallback() {
      /* works from file:// and over plain http, where the clipboard API is
         either missing or refused */
      try {
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        return !!ok;
      } catch (e) { return false; }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t)
        .then(function () { return true; })
        .catch(function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  }

  function copyWithToast(text) {
    return copy(text).then(function (ok) {
      TB.App.toast(ok ? 'Copied' : 'Could not copy — select the text and copy it yourself.',
                   ok ? 'ok' : 'err');
      return ok;
    });
  }

  function langLabel(c) {
    return { ta: 'Tamil', en: 'English', hi: 'Hindi' }[c] || TB.Translate.langName(c);
  }
  function D() { return TB.Store.data(TB.Auth.userId()); }
  function saveD(d) { TB.Store.saveData(TB.Auth.userId(), d); }

  /* ================================================================ HOME */
  /* Every section, grouped the way somebody would go looking for it. This
     is the whole app in one place; the drawer is only a shortcut to it. */
  var DEPARTMENTS = [
    { name: 'Learn', items: [
      ['#/learn', '\u{1F4D8}', 'Lessons', 'A course, in order'],
      ['#/phrases', '\u{1F4AC}', 'Phrasebook', 'Say it today'],
      ['#/vocab', '\u{1F4DA}', 'Vocabulary', '3,000+ words'],
      ['#/alphabet', '\u{1F521}', 'Alphabet', '247 + varnamala'],
      ['#/phonics', '\u{1F50A}', 'Sounds', 'How letters sound']
    ] },
    { name: 'Grammar & words', items: [
      ['#/english', '\u{1F4D0}', 'Grammar rules', 'English \u00b7 \u0ba4\u0bae\u0bbf\u0bb4\u0bcd \u00b7 \u0939\u093f\u0902\u0926\u0940'],
      ['#/english/words', '\u{1F501}', 'Synonyms & Antonyms', 'Same and opposite'],
      ['#/english/tense', '\u{1F570}\uFE0F', 'Tense chart', 'Past \u00b7 present \u00b7 future'],
      ['#/english/sentences', '\u267E\uFE0F', 'Sentence bank', '1,15,776 of them'],
      ['#/english/speaking', '\u{1F5E3}\uFE0F', 'Spoken practice', 'Real conversations'],
      ['#/conjugate', '\u{1F500}', 'Conjugation', 'Any verb, any tense']
    ] },
    { name: 'Practise', items: [
      ['#/talk', '\u{1F5E3}️', 'Talk & learn', 'Speak with a tutor, beginner to native'],
      ['#/practice', '\u{1F3AF}', 'Review', 'What is due today'],
      ['#/write', '\u270F\uFE0F', 'Writing', 'A\u2013Z, a\u2013z, 0\u2013100'],
      ['#/speak', '\u{1F3A4}', 'Pronunciation', 'Get a score'],
      ['#/maths', '\u2795', 'Maths', 'Step by step'],
      ['#/abacus', '\u{1F9EE}', 'Abacus', 'Move the beads'],
      ['#/crosswise', '\u2716\uFE0F', 'Vertically & crosswise', 'Multiply in your head'],
      ['#/sums', '\u270D\uFE0F', 'Maths practice', 'Ten questions, marked'],
      ['#/chart', '\u{1F4CA}', 'Number chart', 'Names in all three'],
      ['#/count', '\u{1F590}\uFE0F', 'Counting on a slate', 'Four strokes, one across'],
      ['#/numbers', '\u{1F522}', 'Numbers', 'To ten crore']
    ] },
    { name: 'Tools', items: [
      ['#/translate', '\u{1F524}', 'Translate', 'From any language'],
      ['#/meaning', '\u{1F4D6}', 'Meaning', 'cat = \u0baa\u0bc2\u0ba9\u0bc8'],
      ['#/tutor', '\u{1F9E0}', 'Sentence Explainer', 'Grammar + tense'],
      ['#/photo', '\u{1F4F7}', 'Photo Translate', 'Read a photograph']
    ] },
    { name: 'The world now', items: [
      ['#/modern', '\u{1F916}', 'Growing up now', 'AI, safety, money'],
      ['#/history', '\u{1F558}', 'History', 'What you looked up'],
      ['#/settings', '\u2699\uFE0F', 'Settings', 'Voice, colour, sync']
    ] }
  ];

  /* One thing said in all three languages, in order, with the line being
     read lit up — so you can see which language you are hearing as well as
     hear it. Numbers are where this matters most: one, ஒன்று and एक
     share nothing, so hearing them back to back is the whole lesson.

     Built on Speech.sequence, which already orders the lesson voice, waits
     between lines and gives up when something else starts speaking. */
  function sayAllThree(en, ta, hi, scope) {
    var steps = [
      { text: en, lang: 'en', rate: 0.80 },
      { text: ta, lang: 'ta', rate: 0.75 },
      { text: hi, lang: 'hi', rate: 0.78 }
    ].filter(function (s) { return s.text; });

    function lines() {
      return scope ? scope.querySelectorAll('.lang-line') : [];
    }
    function clear() {
      var l = lines();
      for (var i = 0; i < l.length; i++) l[i].classList.remove('saying');
    }

    clear();
    return TB.Speech.sequence(steps, {
      pause: 400,
      onStep: function (step, i) {
        clear();
        var l = lines();
        if (l[i]) l[i].classList.add('saying');
      }
    }).then(function (ok) { clear(); return ok; },
            function ()   { clear(); return false; });
  }

  var home = {
    title: 'Home', sub: 'Today\u2019s learning',
    html: function () {
      var d = D();
      var counts = TB.SRS.counts(d.srs, TB.VOCAB);
      var doneLessons = Object.keys(d.progress).filter(function (k) { return d.progress[k].done; }).length;
      var nextLesson = TB.LESSONS.filter(function (u) { return !(d.progress[u.id] && d.progress[u.id].done); })[0] || TB.LESSONS[0];

      /* One thing to do. Reviews that are already due beat starting
         something new, because forgetting is the thing that undoes work. */
      var reviewFirst = counts.due >= 5;
      var hero = reviewFirst
        ? { href: '#/practice', kicker: 'Due now',
            title: counts.due + (counts.due === 1 ? ' word to review' : ' words to review'),
            sub: 'A few minutes now saves relearning them later.',
            cta: 'Review them \u2192' }
        : { href: '#/learn/' + nextLesson.id, kicker: 'Next lesson',
            title: nextLesson.title.en,
            sub: nextLesson.goal || esc(nextLesson.title.ta),
            cta: 'Start \u2192' };

      return ''
      + '<div class="view">'

      + '<a class="hero" href="' + hero.href + '">'
      +   '<div class="hero-kicker">' + esc(hero.kicker) + '</div>'
      +   '<div class="hero-title">' + esc(hero.title) + '</div>'
      +   '<div class="hero-sub">' + esc(hero.sub) + '</div>'
      +   '<span class="btn btn-primary hero-cta">' + esc(hero.cta) + '</span>'
      + '</a>'

      + '<div class="grid g4 mb">'
      /* The streak is days in a row and resets the moment one is missed,
         which looks broken to somebody who has been coming back all week.
         The total sits underneath so the work still shows. */
      +   stat('accent', d.stats.streak || 0, 'Day streak \u{1F525}',
             (d.stats.daysUsed || 0) > 1 ? d.stats.daysUsed + ' days in all' : '')
      +   stat('green', counts.learned, 'Words learned')
      +   stat('blue', counts.due, 'Due today')
      +   stat('purple', doneLessons + '/' + TB.LESSONS.length, 'Lessons done')
      + '</div>'

      + (reviewFirst
          ? ''
          : '<div class="card mb"><div class="row">'
            + '<div><h3 style="margin:0">Today\u2019s review</h3>'
            + '<div class="card-sub">' + counts.due + ' due, ' + counts.fresh + ' new</div></div>'
            + '<div class="spacer" style="flex:1"></div>'
            + '<a class="btn btn-sm" href="#/practice">Practise \u2192</a></div>'
            + '<div class="bar mt"><i style="width:'
            + Math.round((counts.learned / Math.max(counts.total, 1)) * 100) + '%"></i></div></div>')

      + wordOfDay()

      /* Everything there is, grouped. Nothing in this app should be more
         than one tap from here. */
      + DEPARTMENTS.map(function (dep) {
          return '<div class="card dept">'
            + '<h3>' + esc(dep.name) + '</h3>'
            + '<div class="dept-grid">'
            + dep.items.map(function (it) {
                return '<a class="dept-item" href="' + it[0] + '">'
                  + '<span class="dept-ic">' + it[1] + '</span>'
                  + '<span class="dept-text"><b>' + esc(it[2]) + '</b>'
                  + '<span>' + esc(it[3]) + '</span></span></a>';
              }).join('')
            + '</div></div>';
        }).join('')

      + '</div>';

      function stat(cls, n, l, sub) {
        return '<div class="stat ' + cls + '"><div class="n">' + n + '</div><div class="l">' + l + '</div>'
          + (sub ? '<div class="l tiny muted">' + sub + '</div>' : '') + '</div>';
      }
      function wordOfDay() {
        var day = Math.floor(Date.now() / 86400000);
        var w = TB.VOCAB[day % TB.VOCAB.length];
        return '<div class="card mb">'
          + '<h3>Word of the day</h3><div class="card-sub">' + esc(themeName(w.th)) + '</div>'
          + '<div class="grid g2">'
          +   '<div><div class="tiny muted">English</div><div style="font-size:calc(26px * var(--fs,1));font-weight:700">' + esc(w.en) + speak(w.en, 'en') + '</div><div class="tiny" style="color:var(--teal)">' + esc(w.enIpa || '') + ' \u00b7 ' + esc(w.enTa || '') + '</div></div>'
          +   '<div><div class="tiny muted">Hindi</div><div class="hi" style="font-size:calc(26px * var(--fs,1));font-weight:700">' + esc(w.hi) + speak(w.hi, 'hi') + '</div><div class="tiny muted">' + esc(w.hiR) + ' \u00b7 ' + esc(w.hiTa || '') + '</div></div>'
          + '</div>'
          + '<div class="w-gloss" style="margin-top:10px">' + esc(w.ta) + speak(w.ta, 'ta')
          +   '<span class="w-r"> ' + esc(w.taR) + '</span></div>'
          + (w.tip ? '<div class="explain tip">' + esc(w.tip) + '</div>' : '')
          + '</div>';
      }
    },
    mount: function () {},
    DEPARTMENTS: DEPARTMENTS
  };

  function themeName(id) {
    var t = TB.THEMES.filter(function (x) { return x.id === id; })[0];
    return t ? t.en + '  ·  ' + t.ta : id;
  }

  /* =========================================================== TRANSLATE */
  var translate = {
    title: 'Translate', sub: 'Any language to any language — as you type',
    html: function () {
      var d = D();
      var opts = function (sel, includeAuto) {
        return TB.Translate.LANGS.filter(function (l) { return includeAuto || l.c !== 'auto'; })
          .map(function (l) {
            return '<option value="' + l.c + '"' + (l.c === sel ? ' selected' : '') + '>'
                 + esc(l.n) + '</option>';
          }).join('');
      };

      return ''
      + '<div class="view wide">'
      + '<div class="tr-wrap">'

      + '<div class="tr-pane">'
      +   '<div class="tr-bar"><select id="srcLang" aria-label="Translate from">' + opts('auto', true) + '</select>'
      +   '<span class="chip" id="detChip" style="display:none"></span><div style="flex:1"></div>'
      +   '<button class="btn btn-sm" id="translitBtn" type="button" title="Type in English letters to get Tamil / Hindi script">A→அ</button></div>'
      +   '<div class="tr-body"><textarea id="srcText" placeholder="Type here… it translates as you type" autofocus></textarea></div>'
      +   '<div class="tr-roman" id="srcRoman" style="display:none"></div>'
      /* built literally: speak('') returns '' by design, which previously left
         #srcSpeak missing and made run() throw on every keystroke */
      +   '<div class="tr-foot">'
      +     '<button class="speak-btn" id="srcSpeak" data-speak="" data-lang="en" type="button">🔊</button>'
      +     '<button class="btn btn-sm btn-ghost" id="srcMic" type="button" title="Speak">🎤</button>'
      +     '<div class="spacer"></div><span class="tiny muted" id="charCount">0</span>'
      +     '<button class="btn btn-sm btn-ghost" id="srcClear" type="button">Clear</button></div>'
      + '</div>'

      + '<div class="swap-col"><button class="swap" id="trSwapBtn" type="button" '
      +   'title="Swap languages" aria-label="Swap the two languages">⇄</button></div>'

      + '<div class="tr-pane out">'
      +   '<div class="tr-bar"><select id="dstLang" aria-label="Translate into">' + opts(d.prefs.target || 'en', false) + '</select>'
      +   '<div style="flex:1"></div><span class="tiny muted" id="provider"></span></div>'
      +   '<div class="tr-out" id="dstText"></div>'
      +   '<div class="tr-roman" id="dstRoman" style="display:none"></div>'
      +   '<div id="dstHiRead" style="padding:0 14px 8px"></div>'
      +   '<div class="tr-foot"><button class="speak-btn" id="dstSpeak" type="button">🔊</button>'
      +     '<button class="btn btn-sm btn-ghost" id="dstCopy" type="button">Copy</button>'
      +     '<div class="spacer"></div>'
      +     '<button class="btn btn-sm btn-ghost" id="toTutor" type="button">🧠 Explain</button></div>'
      + '</div>'
      + '</div>'

      + '<div class="card mt" id="altCard" style="display:none"><h3>In other languages</h3><div id="altBody" class="grid g2"></div></div>'
      + '<div class="tiny muted mt">Tap any word to see its meaning. Translation needs internet; dictionary words also work offline.</div>'
      + '</div>';
    },
    mount: function (root) {
      var src = root.querySelector('#srcText'), dst = root.querySelector('#dstText');
      var sl = root.querySelector('#srcLang'), dl = root.querySelector('#dstLang');
      var timer = null, seq = 0, translitOn = false;

      /* Typing is debounced and translating is a promise, so both can come
         back after the person has already left this page — by which time
         render() has replaced everything inside root and every lookup below
         returns null. Leaving Translate mid-keystroke threw an uncaught
         TypeError every time. */
      function alive() { return document.body.contains(src); }

      function run() {
        if (!alive()) return;
        var text = src.value;
        root.querySelector('#charCount').textContent = text.length;
        root.querySelector('#srcSpeak').setAttribute('data-speak', text);
        var detected = TB.Translate.detect(text) || 'en';
        root.querySelector('#srcSpeak').setAttribute('data-lang', sl.value === 'auto' ? detected : sl.value);

        if (!text.trim()) {
          dst.innerHTML = '<span class="muted" style="font-size:calc(16px * var(--fs,1))">Translation appears here</span>';
          root.querySelector('#detChip').style.display = 'none';
          root.querySelector('#dstRoman').style.display = 'none';
          root.querySelector('#srcRoman').style.display = 'none';
          root.querySelector('#provider').textContent = '';
          root.querySelector('#altCard').style.display = 'none';
          return;
        }

        var my = ++seq;
        dst.innerHTML = '<span class="spin"></span>';
        TB.Translate.translate(text, sl.value, dl.value).then(function (r) {
          if (my !== seq || !alive()) return;
          dst.innerHTML = tappable(r.text, dl.value);
          root.querySelector('#dstSpeak').setAttribute('data-speak', r.text);
          root.querySelector('#dstSpeak').setAttribute('data-lang', dl.value);
          root.querySelector('#provider').textContent = r.provider === 'offline' ? 'offline dictionary' : (r.provider || '');

          if (sl.value === 'auto' && r.detected) {
            var chip = root.querySelector('#detChip');
            chip.textContent = 'Detected: ' + TB.Translate.langName(r.detected);
            chip.style.display = '';
          }
          showRoman('#srcRoman', text, sl.value === 'auto' ? r.detected : sl.value);
          showRoman('#dstRoman', r.text, dl.value);
          var dstHi = root.querySelector('#dstHiRead');
          if (dstHi) dstHi.innerHTML = readAid(r.text, dl.value);

          TB.Store.addHistory(TB.Auth.userId(), {
            type: 'translate', from: r.detected || sl.value, to: dl.value, src: text, out: r.text
          });
          TB.App.refreshChips();
        }).catch(function (e) {
          if (my !== seq || !alive()) return;
          dst.innerHTML = '<span style="color:var(--red);font-size:calc(15px * var(--fs,1))">' + esc(e.message) + '</span>';
        });
      }

      function showRoman(sel, text, lang) {
        var el = root.querySelector(sel);
        if (!el) return;              /* the page has moved on */
        if ((lang === 'ta' || lang === 'hi') && text) {
          el.textContent = TB.Translit.roman(text, lang);
          el.style.display = '';
        } else el.style.display = 'none';
      }

      src.addEventListener('input', function () {
        if (translitOn) {
          var target = sl.value === 'ta' || sl.value === 'hi' ? sl.value : 'ta';
          var pos = src.selectionStart, before = src.value;
          if (/\s$/.test(before)) {
            src.value = TB.Translit.to(before.trimEnd(), target) + ' ';
            pos = src.value.length;
            src.setSelectionRange(pos, pos);
          }
        }
        clearTimeout(timer);
        timer = setTimeout(run, 420);
      });

      sl.addEventListener('change', run);
      dl.addEventListener('change', function () {
        var d = D(); d.prefs.target = dl.value; saveD(d); run();
      });

      root.querySelector('#translitBtn').addEventListener('click', function () {
        translitOn = !translitOn;
        this.classList.toggle('btn-primary', translitOn);
        TB.App.toast(translitOn
          ? 'Type in English letters — "vanakkam" → வணக்கம் (press space)'
          : 'Direct typing');
      });

      root.querySelector('#trSwapBtn').addEventListener('click', function () {
        var outText = dst.textContent;
        var newSrc = dl.value;
        var newDst = sl.value === 'auto' ? (TB.Translate.detect(src.value) || 'en') : sl.value;
        sl.value = newSrc; dl.value = newDst;
        src.value = outText.indexOf('Translation appears here') >= 0 ? '' : outText;
        run();
      });

      root.querySelector('#srcClear').addEventListener('click', function () { src.value = ''; run(); src.focus(); });
      root.querySelector('#dstCopy').addEventListener('click', function () {
        copyWithToast(dst.textContent);
      });
      root.querySelector('#toTutor').addEventListener('click', function () {
        TB.App.pending = { text: src.value };
        location.hash = '#/tutor';
      });
      root.querySelector('#srcMic').addEventListener('click', function () {
        var lang = sl.value === 'auto' ? 'ta' : sl.value;
        var btn = this;
        btn.classList.add('btn-primary');
        TB.Speech.listen(lang, { onInterim: function (t) { src.value = t; } })
          .then(function (r) { src.value = r.text; run(); })
          .catch(function (e) { TB.App.toast(e.message, 'err'); })
          .then(function () { btn.classList.remove('btn-primary'); });
      });

      if (TB.App.pending && TB.App.pending.text) { src.value = TB.App.pending.text; TB.App.pending = null; }
      run();
    }
  };

  /* ============================================================= MEANING */
  var meaning = {
    title: 'Meaning', sub: 'Any word — in any language',
    html: function (param) {
      var seed = param ? safeDecode(param) : '';
      return ''
      + '<div class="view">'
      + '<div class="card">'
      +   '<div class="row">'
      +     '<input id="mWord" type="text" value="' + esc(seed) + '" placeholder="cat  /  பூனை  /  बिल्ली  /  poonai" '
      +       'style="flex:1;min-width:200px;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--bg-soft);font-size:calc(17px * var(--fs,1))">'
      +     '<button class="btn btn-primary" id="mGo" type="button">Search</button>'
      +     '<button class="btn btn-icon" id="mMic" type="button">🎤</button>'
      +   '</div>'
      +   '<div class="tiny muted mt">Romanised Tamil works too — "poonai", "vanakkam".</div>'
      + '</div>'
      + '<div id="mOut"></div>'
      + '</div>';
    },
    mount: function (root, param) {
      var input = root.querySelector('#mWord'), out = root.querySelector('#mOut');

      function go() {
        var w = input.value.trim();
        if (!w) return;
        out.innerHTML = '<div class="card center"><span class="spin"></span> Searching…</div>';
        /* Show what is already known at once, and let the rest catch up.
           A word in the offline dictionary used to sit behind a spinner for
           five seconds waiting on a network that may not be there. */
        var shown = false;
        TB.Dict.lookup(w, null, null, {
          onEarly: function (c) { shown = true; out.innerHTML = card(c); }
        }).then(function (c) {
          if (!c) {
            if (!shown) out.innerHTML = '<div class="empty">Not found.</div>';
            return;
          }
          out.innerHTML = card(c);
          TB.Store.addHistory(TB.Auth.userId(), {
            type: 'meaning', from: c.lang, to: 'multi', src: w,
            out: [c.translations.ta, c.translations.en, c.translations.hi].filter(Boolean).join(' · ')
          });
          TB.App.refreshChips();
        }).catch(function (e) {
          /* The offline answer, if there was one, stays on the screen. */
          if (!shown) out.innerHTML = '<div class="card"><div class="msg msg-err">' + esc(e.message) + '</div></div>';
        });
      }

      function card(c) {
        var t = c.translations;
        var h = '<div class="card">';
        h += '<div class="card-head"><div>';
        h += '<h3 style="font-size:calc(26px * var(--fs,1))">' + esc(c.query) + speak(c.query, c.lang) + '</h3>';
        var meta = [];
        if (c.roman) meta.push('<i>' + esc(c.roman) + '</i>');
        if (c.phonetic) meta.push('<span class="mono" style="color:var(--teal)">' + esc(c.phonetic) + '</span>');
        if (c.posTa) meta.push('<span class="chip">' + esc(c.posTa) + '</span>');
        meta.push('<span class="chip blue">' + esc(TB.Translate.langName(c.lang)) + '</span>');
        h += '<div class="row small muted" style="margin-top:4px">' + meta.join(' ') + '</div>';
        h += '</div></div>';

        h += '<div class="grid g3">';
        h += trBox('English', t.en, 'en', c.vocab && c.vocab.enIpa);
        h += trBox('Hindi', t.hi, 'hi');
        h += trBox('Tamil', t.ta, 'ta');
        h += '</div>';

        if (c.tip) h += '<div class="explain tip">💡 ' + esc(c.tip) + '</div>';

        if (c.defs && c.defs.length) {
          h += '<div style="margin-top:14px"><div class="tiny muted mb">Definition</div>';
          c.defs.slice(0, 3).forEach(function (s) {
            h += '<div style="margin-bottom:9px"><span class="chip">' + esc(s.pos) + '</span>';
            s.defs.forEach(function (dd) {
              h += '<div class="small" style="margin:4px 0 0 2px">• ' + esc(dd.text) + '</div>';
              if (dd.example) h += '<div class="tiny muted" style="margin-left:12px">“' + esc(dd.example) + '”</div>';
            });
            if (s.synonyms.length) h += '<div class="tiny muted" style="margin-top:3px">Synonyms: ' + esc(s.synonyms.join(', ')) + '</div>';
            h += '</div>';
          });
          h += '</div>';
        }

        if (c.senses && c.senses.length) {
          h += '<div style="margin-top:12px"><div class="tiny muted mb">Other senses</div>';
          c.senses.slice(0, 4).forEach(function (s) {
            h += '<div class="small"><span class="chip">' + esc(s.pos) + '</span> ' + esc(s.terms.join(', ')) + '</div>';
          });
          h += '</div>';
        }

        if (c.related && c.related.length) {
          h += '<div style="margin-top:14px"><div class="tiny muted mb">Related words — ' + esc(themeName(c.theme)) + '</div><div class="pill-row">';
          c.related.forEach(function (r) {
            h += '<button class="pill" data-rel="' + esc(r.en) + '" type="button">' + esc(r.ta) + ' · ' + esc(r.en) + '</button>';
          });
          h += '</div></div>';
        }

        if (c.sources.length) h += '<div class="tiny muted" style="margin-top:12px">Source: ' + esc(c.sources.join(', ')) + '</div>';
        h += '</div>';
        return h;

        /* readAid is the only source of the reading; ipa is not a reading. */
        function trBox(label, val, lang, ipa) {
          if (!val) return '<div><div class="tiny muted">' + label + '</div><div class="muted">—</div></div>';
          return '<div><div class="tiny muted">' + label + '</div>'
            + '<div class="' + lang + '" style="font-size:calc(21px * var(--fs,1));font-weight:650">' + esc(val) + speak(val, lang) + '</div>'
            + readAid(val, lang)
            + (ipa ? '<div class="tiny" style="color:var(--teal)">' + esc(ipa) + '</div>' : '')
            + '</div>';
        }
      }

      root.querySelector('#mGo').addEventListener('click', go);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      out.addEventListener('click', function (e) {
        var b = e.target.closest('[data-rel]');
        if (b) { input.value = b.getAttribute('data-rel'); go(); }
      });
      root.querySelector('#mMic').addEventListener('click', function () {
        TB.Speech.listen('ta').then(function (r) { input.value = r.text; go(); })
          .catch(function (e) { TB.App.toast(e.message, 'err'); });
      });
      /* A word searched from the top bar arrives in the address, so the
         result is already on screen when the page opens. */
      if (TB.App.pending && TB.App.pending.word) {
        input.value = TB.App.pending.word; TB.App.pending = null; go();
      } else if (param) {
        input.value = safeDecode(param); go();
      } else input.focus();
    }
  };

  /* =============================================================== TUTOR */
  var tutor = {
    title: 'Sentence Explainer', sub: 'Grammar, tense and word order, explained',
    html: function () {
      return ''
      + '<div class="view">'
      + '<div class="card">'
      +   '<textarea id="tSent" rows="3" placeholder="Type a sentence — English, Hindi or Tamil&#10;e.g. She is reading a book."'
      +     ' style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--bg-soft);font-size:calc(17px * var(--fs,1));resize:vertical"></textarea>'
      +   '<div class="row mt">'
      +     '<button class="btn btn-primary" id="tGo" type="button">🧠 Analyse</button>'
      +     '<button class="btn" id="tCheck" type="button">✓ Check & fix</button>'
      +     '<button class="btn" id="tVoice" type="button">🔊 Voice lesson</button>'
      +     '<button class="btn btn-icon" id="tMic" type="button">🎤</button>'
      +     '<div class="spacer" style="flex:1"></div>'
      +     '<button class="btn btn-sm btn-ghost" id="tEg" type="button">Example</button>'
      +   '</div>'
      + '</div>'
      + '<div id="tOut"></div>'
      + '</div>';
    },
    mount: function (root) {
      var ta = root.querySelector('#tSent'), out = root.querySelector('#tOut');
      var examples = [
        'She is reading a book.', 'I will go to the market tomorrow.',
        'Where are you going?', 'He had been waiting for an hour.',
        'वह किताब पढ़ रही है।', 'मैं कल बाज़ार गया।',
        'நான் பள்ளிக்குச் செல்கிறேன்.', 'அவள் புத்தகம் படித்தாள்.'
      ];
      var egI = 0;

      function analyse() {
        var s = ta.value.trim();
        if (!s) { TB.App.toast('Type a sentence first.', 'err'); return; }
        var a = TB.Tutor.analyze(s);
        out.innerHTML = render(a);
        TB.Store.addHistory(TB.Auth.userId(), { type: 'tutor', from: a.lang, to: 'analysis', src: s, out: a.tense.ta + ' · ' + a.type.ta });
        TB.App.refreshChips();

        /* fill any words the offline lexicon could not resolve */
        if (a.unknown.length) {
          var others = a.lang === 'en' ? 'ta' : (a.lang === 'hi' ? 'ta' : 'en');
          a.unknown.slice(0, 12).forEach(function (w) {
            TB.Translate.translate(w, a.lang, others).then(function (r) {
              out.querySelectorAll('[data-unk="' + w + '"]').forEach(function (el) {
                el.textContent = r.text; el.style.opacity = 1;
              });
            }).catch(function () {});
          });
        }
        /* full-sentence translations into the other two languages */
        ['ta', 'en', 'hi'].filter(function (L) { return L !== a.lang; }).forEach(function (L) {
          TB.Translate.translate(s, a.lang, L).then(function (r) {
            var box = out.querySelector('[data-tr="' + L + '"]');
            if (box) box.innerHTML = tappable(r.text, L) + speak(r.text, L);
          }).catch(function () {
            var box = out.querySelector('[data-tr="' + L + '"]');
            if (box) box.innerHTML = '<span class="muted tiny">needs internet</span>';
          });
        });
      }

      function render(a) {
        var h = '<div class="card">';
        h += '<div class="row mb"><span class="chip blue">' + esc(TB.Translate.langName(a.lang)) + '</span>'
           + '<span class="chip accent">' + esc(a.tense.ta) + '</span>'
           + '<span class="chip">' + esc(a.type.ta) + '</span>' + speak(a.source, a.lang) + '</div>';
        h += '<div style="font-size:calc(21px * var(--fs,1));margin-bottom:6px">' + tappable(a.source, a.lang) + '</div>';
        if (a.lang === 'ta' || a.lang === 'hi') {
          h += '<div class="tiny muted"><i>' + esc(TB.Translit.roman(a.source, a.lang)) + '</i></div>';
        }

        h += '<div class="tok-line">';
        a.tags.filter(function (t) { return t.pos !== 'punct'; }).forEach(function (t) {
          var mean = a.lang === 'en' ? t.ta : (a.lang === 'hi' ? t.ta : t.en);
          var pn = a.posName(t.pos);
          h += '<div class="tok pos-' + t.pos + '" data-word="' + esc(t.raw) + '" data-wlang="' + a.lang + '">'
             + '<div class="t-w">' + esc(t.raw) + '</div>'
             + '<div class="t-m"' + (mean ? '' : ' data-unk="' + esc(t.w) + '" style="opacity:.45"') + '>' + esc(mean || '…') + '</div>'
             + '<div class="t-p">' + esc(pn.ta) + '</div>'
             + '</div>';
        });
        h += '</div>';

        if (a.svo && a.svo.verbText) {
          h += '<div class="tiny muted">Sentence structure</div><div class="svo">';
          if (a.svo.qwordText) h += '<div class="svo-part svo-q">Question word: ' + esc(a.svo.qwordText) + '</div>';
          if (a.svo.subjectText) h += '<div class="svo-part svo-s">Subject: ' + esc(a.svo.subjectText) + '</div>';
          h += '<div class="svo-part svo-v">Verb: ' + esc(a.svo.verbText) + '</div>';
          if (a.svo.objectText) h += '<div class="svo-part svo-o">Object: ' + esc(a.svo.objectText) + '</div>';
          h += '</div>';
        }

        h += '<div class="explain"><b>Tense: ' + esc(a.tense.ta) + '</b> (' + esc(a.tense.en) + ')<br>'
           + '<span class="mono small">' + esc(a.tense.formula) + '</span><br>' + esc(a.tense.why) + '</div>';
        h += '<div class="explain">' + esc(a.type.note || '') + '</div>';

        if (a.order) {
          h += '<div class="explain"><b>Word order</b><br>' + esc(a.order.english) + '<br>' + esc(a.order.tamil)
             + (a.order.reordered ? '<br><span class="mono small">In Tamil word order: ' + esc(a.order.reordered) + '</span>' : '')
             + '<br>' + emph(a.order.explain) + '</div>';
        }

        a.tips.forEach(function (t) { h += '<div class="explain tip">💡 ' + emph(t) + '</div>'; });

        h += '<div class="grid g2 mt">';
        ['ta', 'en', 'hi'].filter(function (L) { return L !== a.lang; }).forEach(function (L) {
          h += '<div><div class="tiny muted">' + langLabel(L) + '</div>'
             + '<div class="' + L + '" data-tr="' + L + '" style="font-size:calc(17px * var(--fs,1))"><span class="spin"></span></div></div>';
        });
        h += '</div></div>';
        return h;
      }

      root.querySelector('#tGo').addEventListener('click', analyse);
      root.querySelector('#tEg').addEventListener('click', function () {
        ta.value = examples[egI++ % examples.length]; analyse();
      });
      root.querySelector('#tMic').addEventListener('click', function () {
        TB.Speech.listen('en').then(function (r) { ta.value = r.text; analyse(); })
          .catch(function (e) { TB.App.toast(e.message, 'err'); });
      });

      root.querySelector('#tCheck').addEventListener('click', function () {
        var s = ta.value.trim();
        if (!s) return;
        var r = TB.Check.check(s);
        var h = '<div class="card"><h3>Corrections</h3>';
        if (r.note) h += '<div class="msg msg-info">' + esc(r.note) + '</div>';
        if (r.clean && !r.changed) {
          h += '<div class="msg msg-ok">✓ No mistakes. Well written!</div>';
        } else {
          h += '<div class="tiny muted">What you wrote</div><div class="diffbox mb">' + esc(r.original) + '</div>';
          h += '<div class="tiny muted">Corrected</div><div class="diffbox mb"><span class="ins">' + esc(r.corrected) + '</span>'
             + speak(r.corrected, 'en') + '</div>';
          r.spelling.forEach(function (sp) {
            h += '<div class="explain ' + (sp.applied === false ? 'tip' : 'warn') + '">'
               + '<b>' + esc(sp.word) + '</b> → ' + esc(sp.suggestions.join(' / '))
               + (sp.kind === 'apostrophe' ? ' — missing apostrophe (’).'
                 : sp.kind === 'capital' ? ' — proper noun, needs a capital letter.'
                 : (sp.applied === false ? ' — several possibilities; pick one yourself.' : ' — spelling mistake.'))
               + '</div>';
          });
          r.issues.forEach(function (i) {
            h += '<div class="explain ' + (i.soft ? 'tip' : 'warn') + '">'
               + (i.from ? '<b>' + esc(i.from) + '</b>' + (i.to ? ' → <b>' + esc(i.to) + '</b>' : ' (remove)') + '<br>' : '')
               + esc(i.ta) + '</div>';
          });
          h += '<button class="btn btn-sm mt" id="useFixed" type="button">Use this correction</button>';
        }
        h += '</div>';
        out.innerHTML = h;
        var uf = out.querySelector('#useFixed');
        if (uf) uf.addEventListener('click', function () { ta.value = r.corrected; analyse(); });
        TB.Store.addHistory(TB.Auth.userId(), { type: 'check', from: 'en', to: 'en', src: r.original, out: r.corrected });
      });

      root.querySelector('#tVoice').addEventListener('click', function () {
        var s = ta.value.trim();
        if (!s) return;
        var a = TB.Tutor.analyze(s);
        var btn = this;
        var tr = {};
        var others = ['ta', 'en', 'hi'].filter(function (L) { return L !== a.lang; });
        Promise.all(others.map(function (L) {
          return TB.Translate.translate(s, a.lang, L).then(function (r) { tr[L] = r.text; }).catch(function () {});
        })).then(function () {
          var steps = TB.Tutor.voiceScript(a, tr);
          var d = D();
          btn.textContent = '⏹ Stop';
          var run = TB.Speech.sequence(steps, { rate: d.prefs.rate, pitch: d.prefs.pitch, pause: 320 });
          btn.onclick = function () { run.cancel(); reset(); };
          run.then(reset);
          function reset() { btn.textContent = '🔊 Voice lesson'; btn.onclick = null; TB.Views.remount(); }
        });
      });

      if (TB.App.pending && TB.App.pending.text) { ta.value = TB.App.pending.text; TB.App.pending = null; analyse(); }
    }
  };

  /* Has the reader scrolled by hand since a reading began?

     One set of listeners for the life of the page, shared by every view that
     reads a list aloud and follows along. Attached inside a mount() they
     would pile up, three at a time, on every visit — and each closure would
     hold that mount's whole scope from being collected. */
  var scrollWatch = (function () {
    var moved = false, armed = false;
    function on() { moved = true; }
    return {
      arm: function () {
        if (armed) return;
        armed = true;
        ['wheel', 'touchmove', 'keydown'].forEach(function (ev) {
          window.addEventListener(ev, on, { passive: true });
        });
      },
      reset: function () { moved = false; },
      moved: function () { return moved; }
    };
  })();

  /* Hand the browser a file to save.

     Both places that did this built an <a download>, never put it on the
     page, and clicked it. A detached anchor is allowed to do nothing, and
     that is what it did — the backup button looked broken because it was.
     The anchor goes into the document, gets clicked, and comes straight
     back out. */
  function saveFile(name, text, type) {
    var blob = new Blob([text], { type: type || 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    return true;
  }

  return {
    /* `speak` is also a view name (#/speak), and registering that view
       overwrites this key. `speakBtn` is the collision-proof alias that
       later files should use. */
    /* Not exported as `speak`: every view is registered on this same
       object under its route name, and #/speak claims that key. A
       helper and a view cannot both be TB.Views.speak — the view won,
       silently, and the word popup died on a TypeError. */
    esc: esc, emph: emph, speakBtn: speak, tappable: tappable, ago: ago, saveFile: saveFile,
    scrollWatch: scrollWatch,
    hiRead: hiRead, hiTamil: hiTamil, readAid: readAid, copy: copy, copyWithToast: copyWithToast,
    themeName: themeName, langLabel: langLabel, sayAllThree: sayAllThree,
    D: D, saveD: saveD,
    home: home, translate: translate, meaning: meaning, tutor: tutor,
    remount: function () { if (TB.App && TB.App.render) TB.App.render(); }
  };
})();
