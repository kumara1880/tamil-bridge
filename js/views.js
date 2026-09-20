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
  function speak(text, lang, label) {
    if (!text) return '';
    return '<button class="speak-btn" data-speak="' + esc(text) + '" data-lang="' + lang + '" '
         + 'title="' + (label || 'ஒலிக்கவும்') + '" type="button">🔊</button>';
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
    if (m < 1) return 'இப்போது';
    if (m < 60) return m + ' நிமிடம் முன்';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' மணி முன்';
    var dy = Math.floor(h / 24);
    if (dy < 30) return dy + ' நாள் முன்';
    return new Date(ts).toLocaleDateString('ta-IN');
  }
  function langLabel(c) {
    return { ta: 'தமிழ்', en: 'English', hi: 'हिंदी' }[c] || TB.Translate.langNameTa(c);
  }
  function D() { return TB.Store.data(TB.Auth.userId()); }
  function saveD(d) { TB.Store.saveData(TB.Auth.userId(), d); }

  /* ================================================================ HOME */
  var home = {
    title: 'முகப்பு', sub: 'இன்றைய கற்றல்',
    html: function () {
      var d = D();
      var counts = TB.SRS.counts(d.srs, TB.VOCAB);
      var doneLessons = Object.keys(d.progress).filter(function (k) { return d.progress[k].done; }).length;
      var nextLesson = TB.LESSONS.filter(function (u) { return !(d.progress[u.id] && d.progress[u.id].done); })[0] || TB.LESSONS[0];

      return ''
      + '<div class="view">'
      + '<div class="grid g4 mb">'
      +   stat('accent', d.stats.streak || 0, 'தொடர் நாட்கள் 🔥')
      +   stat('green', counts.learned, 'கற்ற சொற்கள்')
      +   stat('blue', counts.due, 'இன்று மீள்பார்வை')
      +   stat('purple', doneLessons + '/' + TB.LESSONS.length, 'முடிந்த பாடங்கள்')
      + '</div>'

      + '<div class="grid g2">'
      + '<div class="card">'
      +   '<div class="card-head"><div><h3>அடுத்த பாடம்</h3>'
      +   '<div class="card-sub">' + esc(nextLesson.title.ta) + '</div></div></div>'
      +   '<p class="small muted" style="margin:0 0 12px">' + esc(nextLesson.goal) + '</p>'
      +   '<a class="btn btn-primary" href="#/learn/' + nextLesson.id + '">தொடங்கு →</a>'
      + '</div>'

      + '<div class="card">'
      +   '<div class="card-head"><div><h3>இன்றைய மீள்பார்வை</h3>'
      +   '<div class="card-sub">' + counts.due + ' சொல் தயார், ' + counts.fresh + ' புதியது</div></div></div>'
      +   '<div class="bar mb"><i style="width:' + Math.round((counts.learned / Math.max(counts.total, 1)) * 100) + '%"></i></div>'
      +   '<a class="btn btn-primary" href="#/practice">பயிற்சி செய் →</a>'
      + '</div>'
      + '</div>'

      + '<div class="card">'
      +   '<h3>விரைவு கருவிகள்</h3><div class="card-sub">அடிக்கடி தேவைப்படுபவை</div>'
      +   '<div class="grid gauto">'
      +     quick('#/translate', '🔤', 'மொழிபெயர்ப்பு', 'எந்த மொழியிலிருந்தும்')
      +     quick('#/meaning', '📖', 'அர்த்தம்', 'cat = பூனை')
      +     quick('#/tutor', '🧠', 'வாக்கிய விளக்கம்', 'இலக்கணம் + காலம்')
      +     quick('#/photo', '📷', 'படம்', 'புகைப்படத்திலிருந்து')
      +     quick('#/speak', '🎤', 'உச்சரிப்பு', 'மதிப்பெண் பெறு')
      +     quick('#/alphabet', '🔡', 'எழுத்துகள்', '247 + வர்ணமாலா')
      +   '</div>'
      + '</div>'

      + wordOfDay()
      + '</div>';

      function stat(cls, n, l) {
        return '<div class="stat ' + cls + '"><div class="n">' + n + '</div><div class="l">' + l + '</div></div>';
      }
      function quick(href, ic, t, s) {
        return '<a class="wcard" href="' + href + '" style="text-decoration:none;color:inherit;display:block">'
             + '<div style="font-size:22px">' + ic + '</div>'
             + '<div style="font-weight:650;margin-top:5px">' + t + '</div>'
             + '<div class="tiny muted">' + s + '</div></a>';
      }
      function wordOfDay() {
        var day = Math.floor(Date.now() / 86400000);
        var w = TB.VOCAB[day % TB.VOCAB.length];
        return '<div class="card">'
          + '<h3>இன்றைய சொல்</h3><div class="card-sub">' + esc(themeName(w.th)) + '</div>'
          + '<div class="grid g3">'
          +   '<div><div class="tiny muted">தமிழ்</div><div class="ta" style="font-size:23px;font-weight:650">' + esc(w.ta) + speak(w.ta, 'ta') + '</div><div class="tiny muted">' + esc(w.taR) + '</div></div>'
          +   '<div><div class="tiny muted">English</div><div style="font-size:23px;font-weight:650">' + esc(w.en) + speak(w.en, 'en') + '</div><div class="tiny" style="color:var(--teal)">' + esc(w.enIpa || '') + ' · ' + esc(w.enTa || '') + '</div></div>'
          +   '<div><div class="tiny muted">हिंदी</div><div class="hi" style="font-size:23px;font-weight:650">' + esc(w.hi) + speak(w.hi, 'hi') + '</div><div class="tiny muted">' + esc(w.hiR) + ' · ' + esc(w.hiTa || '') + '</div></div>'
          + '</div>'
          + (w.tip ? '<div class="explain tip">' + esc(w.tip) + '</div>' : '')
          + '</div>';
      }
    },
    mount: function () {}
  };

  function themeName(id) {
    var t = TB.THEMES.filter(function (x) { return x.id === id; })[0];
    return t ? t.ta + ' · ' + t.en : id;
  }

  /* =========================================================== TRANSLATE */
  var translate = {
    title: 'மொழிபெயர்ப்பு', sub: 'எந்த மொழியிலிருந்தும் எந்த மொழிக்கும் — தட்டச்சு செய்யும்போதே',
    html: function () {
      var d = D();
      var opts = function (sel, includeAuto) {
        return TB.Translate.LANGS.filter(function (l) { return includeAuto || l.c !== 'auto'; })
          .map(function (l) {
            return '<option value="' + l.c + '"' + (l.c === sel ? ' selected' : '') + '>'
                 + esc(l.n) + (l.c !== 'auto' ? ' · ' + esc(l.ta) : '') + '</option>';
          }).join('');
      };

      return ''
      + '<div class="view wide">'
      + '<div class="tr-wrap">'

      + '<div class="tr-pane">'
      +   '<div class="tr-bar"><select id="srcLang">' + opts('auto', true) + '</select>'
      +   '<span class="chip" id="detChip" style="display:none"></span><div style="flex:1"></div>'
      +   '<button class="btn btn-sm" id="translitBtn" type="button" title="ஆங்கில எழுத்தில் தட்டச்சு செய்து தமிழ்/இந்தி பெறுங்கள்">அ→அ</button></div>'
      +   '<div class="tr-body"><textarea id="srcText" placeholder="இங்கே எழுதுங்கள்…  தட்டச்சு செய்யும்போதே மொழிபெயர்க்கும்" autofocus></textarea></div>'
      +   '<div class="tr-roman" id="srcRoman" style="display:none"></div>'
      +   '<div class="tr-foot">' + speak('', 'auto') .replace('data-speak=""','id="srcSpeak" data-speak=""')
      +     '<button class="btn btn-sm btn-ghost" id="srcMic" type="button" title="பேசுங்கள்">🎤</button>'
      +     '<div class="spacer"></div><span class="tiny muted" id="charCount">0</span>'
      +     '<button class="btn btn-sm btn-ghost" id="srcClear" type="button">அழி</button></div>'
      + '</div>'

      + '<div class="swap-col"><button class="swap" id="swapBtn" type="button" title="மாற்று">⇄</button></div>'

      + '<div class="tr-pane out">'
      +   '<div class="tr-bar"><select id="dstLang">' + opts(d.prefs.target || 'en', false) + '</select>'
      +   '<div style="flex:1"></div><span class="tiny muted" id="provider"></span></div>'
      +   '<div class="tr-out" id="dstText"></div>'
      +   '<div class="tr-roman" id="dstRoman" style="display:none"></div>'
      +   '<div class="tr-foot"><button class="speak-btn" id="dstSpeak" type="button">🔊</button>'
      +     '<button class="btn btn-sm btn-ghost" id="dstCopy" type="button">நகலெடு</button>'
      +     '<div class="spacer"></div>'
      +     '<button class="btn btn-sm btn-ghost" id="toTutor" type="button">🧠 விளக்கம்</button></div>'
      + '</div>'
      + '</div>'

      + '<div class="card mt" id="altCard" style="display:none"><h3>மற்ற மொழிகளில்</h3><div id="altBody" class="grid g2"></div></div>'
      + '<div class="tiny muted mt">சொல்லைத் தட்டினால் அதன் அர்த்தம் தெரியும். மொழிபெயர்ப்பு சேவை இணையம் தேவைப்படும்; அகராதிச் சொற்கள் ஆஃப்லைனிலும் வேலை செய்யும்.</div>'
      + '</div>';
    },
    mount: function (root) {
      var src = root.querySelector('#srcText'), dst = root.querySelector('#dstText');
      var sl = root.querySelector('#srcLang'), dl = root.querySelector('#dstLang');
      var timer = null, seq = 0, translitOn = false;

      function run() {
        var text = src.value;
        root.querySelector('#charCount').textContent = text.length;
        root.querySelector('#srcSpeak').setAttribute('data-speak', text);
        var detected = TB.Translate.detect(text) || 'en';
        root.querySelector('#srcSpeak').setAttribute('data-lang', sl.value === 'auto' ? detected : sl.value);

        if (!text.trim()) {
          dst.innerHTML = '<span class="muted" style="font-size:16px">மொழிபெயர்ப்பு இங்கே தோன்றும்</span>';
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
          if (my !== seq) return;
          dst.innerHTML = tappable(r.text, dl.value);
          root.querySelector('#dstSpeak').setAttribute('data-speak', r.text);
          root.querySelector('#dstSpeak').setAttribute('data-lang', dl.value);
          root.querySelector('#provider').textContent = r.provider === 'offline' ? 'ஆஃப்லைன் அகராதி' : (r.provider || '');

          if (sl.value === 'auto' && r.detected) {
            var chip = root.querySelector('#detChip');
            chip.textContent = 'கண்டறிந்தது: ' + TB.Translate.langNameTa(r.detected);
            chip.style.display = '';
          }
          showRoman('#srcRoman', text, sl.value === 'auto' ? r.detected : sl.value);
          showRoman('#dstRoman', r.text, dl.value);

          TB.Store.addHistory(TB.Auth.userId(), {
            type: 'translate', from: r.detected || sl.value, to: dl.value, src: text, out: r.text
          });
          TB.App.refreshChips();
        }).catch(function (e) {
          if (my !== seq) return;
          dst.innerHTML = '<span style="color:var(--red);font-size:15px">' + esc(e.message) + '</span>';
        });
      }

      function showRoman(sel, text, lang) {
        var el = root.querySelector(sel);
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
          ? 'ஆங்கில எழுத்தில் எழுதுங்கள் — "vanakkam" → வணக்கம் (space அழுத்தவும்)'
          : 'நேரடி தட்டச்சு');
      });

      root.querySelector('#swapBtn').addEventListener('click', function () {
        var outText = dst.textContent;
        var newSrc = dl.value;
        var newDst = sl.value === 'auto' ? (TB.Translate.detect(src.value) || 'en') : sl.value;
        sl.value = newSrc; dl.value = newDst;
        src.value = outText.indexOf('மொழிபெயர்ப்பு இங்கே') >= 0 ? '' : outText;
        run();
      });

      root.querySelector('#srcClear').addEventListener('click', function () { src.value = ''; run(); src.focus(); });
      root.querySelector('#dstCopy').addEventListener('click', function () {
        navigator.clipboard && navigator.clipboard.writeText(dst.textContent);
        TB.App.toast('நகலெடுக்கப்பட்டது', 'ok');
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
    title: 'அர்த்தம்', sub: 'எந்தச் சொல்லும் — எந்த மொழியிலும்',
    html: function () {
      return ''
      + '<div class="view">'
      + '<div class="card">'
      +   '<div class="row">'
      +     '<input id="mWord" type="text" placeholder="cat  /  பூனை  /  बिल्ली  /  poonai" '
      +       'style="flex:1;min-width:200px;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--bg-soft);font-size:17px">'
      +     '<button class="btn btn-primary" id="mGo" type="button">தேடு</button>'
      +     '<button class="btn btn-icon" id="mMic" type="button">🎤</button>'
      +   '</div>'
      +   '<div class="tiny muted mt">ஆங்கில எழுத்தில் தமிழ் எழுதினாலும் வேலை செய்யும் — "poonai", "vanakkam".</div>'
      + '</div>'
      + '<div id="mOut"></div>'
      + '</div>';
    },
    mount: function (root) {
      var input = root.querySelector('#mWord'), out = root.querySelector('#mOut');

      function go() {
        var w = input.value.trim();
        if (!w) return;
        out.innerHTML = '<div class="card center"><span class="spin"></span> தேடுகிறது…</div>';
        TB.Dict.lookup(w).then(function (c) {
          if (!c) { out.innerHTML = '<div class="empty">கிடைக்கவில்லை.</div>'; return; }
          out.innerHTML = card(c);
          TB.Store.addHistory(TB.Auth.userId(), {
            type: 'meaning', from: c.lang, to: 'multi', src: w,
            out: [c.translations.ta, c.translations.en, c.translations.hi].filter(Boolean).join(' · ')
          });
          TB.App.refreshChips();
        }).catch(function (e) {
          out.innerHTML = '<div class="card"><div class="msg msg-err">' + esc(e.message) + '</div></div>';
        });
      }

      function card(c) {
        var t = c.translations;
        var h = '<div class="card">';
        h += '<div class="card-head"><div>';
        h += '<h3 style="font-size:26px">' + esc(c.query) + speak(c.query, c.lang) + '</h3>';
        var meta = [];
        if (c.roman) meta.push('<i>' + esc(c.roman) + '</i>');
        if (c.phonetic) meta.push('<span class="mono" style="color:var(--teal)">' + esc(c.phonetic) + '</span>');
        if (c.posTa) meta.push('<span class="chip">' + esc(c.posTa) + '</span>');
        meta.push('<span class="chip blue">' + esc(TB.Translate.langNameTa(c.lang)) + '</span>');
        h += '<div class="row small muted" style="margin-top:4px">' + meta.join(' ') + '</div>';
        h += '</div></div>';

        h += '<div class="grid g3">';
        h += trBox('தமிழ்', t.ta, 'ta', c.romanised && c.romanised.ta, c.taR);
        h += trBox('English', t.en, 'en', '', c.enTa ? c.enTa + (c.vocab && c.vocab.enIpa ? ' · ' + c.vocab.enIpa : '') : '');
        h += trBox('हिंदी', t.hi, 'hi', c.romanised && c.romanised.hi, c.hiTa);
        h += '</div>';

        if (c.tip) h += '<div class="explain tip">💡 ' + esc(c.tip) + '</div>';

        if (c.defs && c.defs.length) {
          h += '<div style="margin-top:14px"><div class="tiny muted mb">ஆங்கில விளக்கம்</div>';
          c.defs.slice(0, 3).forEach(function (s) {
            h += '<div style="margin-bottom:9px"><span class="chip">' + esc(s.pos) + '</span>';
            s.defs.forEach(function (dd) {
              h += '<div class="small" style="margin:4px 0 0 2px">• ' + esc(dd.text) + '</div>';
              if (dd.example) h += '<div class="tiny muted" style="margin-left:12px">“' + esc(dd.example) + '”</div>';
            });
            if (s.synonyms.length) h += '<div class="tiny muted" style="margin-top:3px">ஒத்த சொற்கள்: ' + esc(s.synonyms.join(', ')) + '</div>';
            h += '</div>';
          });
          h += '</div>';
        }

        if (c.senses && c.senses.length) {
          h += '<div style="margin-top:12px"><div class="tiny muted mb">பிற பொருள்கள்</div>';
          c.senses.slice(0, 4).forEach(function (s) {
            h += '<div class="small"><span class="chip">' + esc(s.pos) + '</span> ' + esc(s.terms.join(', ')) + '</div>';
          });
          h += '</div>';
        }

        if (c.related && c.related.length) {
          h += '<div style="margin-top:14px"><div class="tiny muted mb">தொடர்புடைய சொற்கள் — ' + esc(themeName(c.theme)) + '</div><div class="pill-row">';
          c.related.forEach(function (r) {
            h += '<button class="pill" data-rel="' + esc(r.en) + '" type="button">' + esc(r.ta) + ' · ' + esc(r.en) + '</button>';
          });
          h += '</div></div>';
        }

        if (c.sources.length) h += '<div class="tiny muted" style="margin-top:12px">ஆதாரம்: ' + esc(c.sources.join(', ')) + '</div>';
        h += '</div>';
        return h;

        function trBox(label, val, lang, roman, extra) {
          if (!val) return '<div><div class="tiny muted">' + label + '</div><div class="muted">—</div></div>';
          return '<div><div class="tiny muted">' + label + '</div>'
            + '<div class="' + lang + '" style="font-size:21px;font-weight:650">' + esc(val) + speak(val, lang) + '</div>'
            + (roman ? '<div class="tiny muted"><i>' + esc(roman) + '</i></div>' : '')
            + (extra ? '<div class="tiny" style="color:var(--teal)">' + esc(extra) + '</div>' : '')
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
      if (TB.App.pending && TB.App.pending.word) {
        input.value = TB.App.pending.word; TB.App.pending = null; go();
      } else input.focus();
    }
  };

  /* =============================================================== TUTOR */
  var tutor = {
    title: 'வாக்கிய விளக்கம்', sub: 'இலக்கணம், காலம், சொல் வரிசை — தமிழில் விளக்கம்',
    html: function () {
      return ''
      + '<div class="view">'
      + '<div class="card">'
      +   '<textarea id="tSent" rows="3" placeholder="ஒரு வாக்கியம் எழுதுங்கள் — ஆங்கிலம், இந்தி அல்லது தமிழ்&#10;எ.கா. She is reading a book."'
      +     ' style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:var(--bg-soft);font-size:17px;resize:vertical"></textarea>'
      +   '<div class="row mt">'
      +     '<button class="btn btn-primary" id="tGo" type="button">🧠 பகுப்பாய்வு</button>'
      +     '<button class="btn" id="tCheck" type="button">✓ பிழை திருத்து</button>'
      +     '<button class="btn" id="tVoice" type="button">🔊 குரல் பாடம்</button>'
      +     '<button class="btn btn-icon" id="tMic" type="button">🎤</button>'
      +     '<div class="spacer" style="flex:1"></div>'
      +     '<button class="btn btn-sm btn-ghost" id="tEg" type="button">எடுத்துக்காட்டு</button>'
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
        if (!s) { TB.App.toast('முதலில் ஒரு வாக்கியம் எழுதுங்கள்.', 'err'); return; }
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
            if (box) box.innerHTML = '<span class="muted tiny">இணையம் தேவை</span>';
          });
        });
      }

      function render(a) {
        var h = '<div class="card">';
        h += '<div class="row mb"><span class="chip blue">' + esc(TB.Translate.langNameTa(a.lang)) + '</span>'
           + '<span class="chip accent">' + esc(a.tense.ta) + '</span>'
           + '<span class="chip">' + esc(a.type.ta) + '</span>' + speak(a.source, a.lang) + '</div>';
        h += '<div style="font-size:21px;margin-bottom:6px">' + tappable(a.source, a.lang) + '</div>';
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
          h += '<div class="tiny muted">வாக்கிய அமைப்பு</div><div class="svo">';
          if (a.svo.qwordText) h += '<div class="svo-part svo-q">வினா: ' + esc(a.svo.qwordText) + '</div>';
          if (a.svo.subjectText) h += '<div class="svo-part svo-s">எழுவாய்: ' + esc(a.svo.subjectText) + '</div>';
          h += '<div class="svo-part svo-v">வினை: ' + esc(a.svo.verbText) + '</div>';
          if (a.svo.objectText) h += '<div class="svo-part svo-o">செயப்படுபொருள்: ' + esc(a.svo.objectText) + '</div>';
          h += '</div>';
        }

        h += '<div class="explain"><b>காலம்: ' + esc(a.tense.ta) + '</b> (' + esc(a.tense.en) + ')<br>'
           + '<span class="mono small">' + esc(a.tense.formula) + '</span><br>' + esc(a.tense.why) + '</div>';
        h += '<div class="explain">' + esc(a.type.note || '') + '</div>';

        if (a.order) {
          h += '<div class="explain"><b>சொல் வரிசை</b><br>' + esc(a.order.english) + '<br>' + esc(a.order.tamil)
             + (a.order.reordered ? '<br><span class="mono small">தமிழ் வரிசையில்: ' + esc(a.order.reordered) + '</span>' : '')
             + '<br>' + a.order.explain.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</div>';
        }

        a.tips.forEach(function (t) { h += '<div class="explain tip">💡 ' + t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</div>'; });

        h += '<div class="grid g2 mt">';
        ['ta', 'en', 'hi'].filter(function (L) { return L !== a.lang; }).forEach(function (L) {
          h += '<div><div class="tiny muted">' + langLabel(L) + '</div>'
             + '<div class="' + L + '" data-tr="' + L + '" style="font-size:17px"><span class="spin"></span></div></div>';
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
        var h = '<div class="card"><h3>பிழை திருத்தம்</h3>';
        if (r.note) h += '<div class="msg msg-info">' + esc(r.note) + '</div>';
        if (r.clean && !r.changed) {
          h += '<div class="msg msg-ok">✓ பிழை எதுவும் இல்லை. நன்றாக எழுதியுள்ளீர்கள்!</div>';
        } else {
          h += '<div class="tiny muted">நீங்கள் எழுதியது</div><div class="diffbox mb">' + esc(r.original) + '</div>';
          h += '<div class="tiny muted">திருத்தப்பட்டது</div><div class="diffbox mb"><span class="ins">' + esc(r.corrected) + '</span>'
             + speak(r.corrected, 'en') + '</div>';
          r.spelling.forEach(function (sp) {
            h += '<div class="explain ' + (sp.applied === false ? 'tip' : 'warn') + '">'
               + '<b>' + esc(sp.word) + '</b> → ' + esc(sp.suggestions.join(' / '))
               + (sp.kind === 'apostrophe' ? ' — apostrophe (’) விடுபட்டது.'
                 : sp.kind === 'capital' ? ' — சிறப்புப் பெயர், பெரிய எழுத்து வேண்டும்.'
                 : (sp.applied === false ? ' — பல சாத்தியங்கள்; நீங்களே தேர்ந்தெடுங்கள்.' : ' — எழுத்துப் பிழை.'))
               + '</div>';
          });
          r.issues.forEach(function (i) {
            h += '<div class="explain ' + (i.soft ? 'tip' : 'warn') + '">'
               + (i.from ? '<b>' + esc(i.from) + '</b>' + (i.to ? ' → <b>' + esc(i.to) + '</b>' : ' (நீக்கவும்)') + '<br>' : '')
               + esc(i.ta) + '</div>';
          });
          h += '<button class="btn btn-sm mt" id="useFixed" type="button">திருத்தியதைப் பயன்படுத்து</button>';
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
          btn.textContent = '⏹ நிறுத்து';
          var run = TB.Speech.sequence(steps, { rate: d.prefs.rate, pitch: d.prefs.pitch, pause: 320 });
          btn.onclick = function () { run.cancel(); reset(); };
          run.then(reset);
          function reset() { btn.textContent = '🔊 குரல் பாடம்'; btn.onclick = null; TB.Views.remount(); }
        });
      });

      if (TB.App.pending && TB.App.pending.text) { ta.value = TB.App.pending.text; TB.App.pending = null; analyse(); }
    }
  };

  return {
    esc: esc, speak: speak, tappable: tappable, ago: ago, themeName: themeName, langLabel: langLabel,
    D: D, saveD: saveD,
    home: home, translate: translate, meaning: meaning, tutor: tutor,
    remount: function () { if (TB.App && TB.App.render) TB.App.render(); }
  };
})();
