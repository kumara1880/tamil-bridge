/* Tamil Bridge — Conjugation.
   Type any verb and get its whole paradigm, generated rather than looked up.
   The drill then asks you to produce a form yourself, which is the part that
   actually builds fluency.                                                   */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, D = V.D, saveD = V.saveD;

  V.conjugate = {
    title: 'Conjugation', sub: 'Every form of any verb, in Hindi and English',
    html: function () {
      var hiChips = TB.Conjugate.COMMON_HI.slice(0, 14).map(function (v) {
        return '<button class="pill" data-cv="' + esc(v) + '" type="button">' + esc(v) + '</button>';
      }).join('');
      var enChips = TB.Conjugate.COMMON_EN.slice(0, 14).map(function (v) {
        return '<button class="pill" data-cv="' + esc(v) + '" type="button">' + esc(v) + '</button>';
      }).join('');

      return '<div class="view wide">'
        + '<div class="card">'
        +   '<div class="row mb">'
        +     '<div class="pill-row" id="cLang">'
        +       '<button class="pill on" data-cl="hi" type="button">Hindi</button>'
        +       '<button class="pill" data-cl="en" type="button">English</button>'
        +     '</div>'
        +     '<input id="cVerb" type="text" placeholder="करना  /  to do"'
        +       ' style="flex:1;min-width:170px;padding:11px 14px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft);font-size:18px">'
        +     '<button class="btn btn-primary" id="cGo" type="button">Show all forms</button>'
        +   '</div>'
        +   '<div class="row">'
        +     '<div class="pill-row" id="cGender">'
        +       '<button class="pill on" data-cg="m" type="button">speaking as male</button>'
        +       '<button class="pill" data-cg="f" type="button">speaking as female</button>'
        +     '</div>'
        +     '<div class="spacer" style="flex:1"></div>'
        +     '<button class="btn btn-sm" id="cDrill" type="button">🎯 Drill me</button>'
        +   '</div>'
        +   '<div class="pill-row mt" id="cCommon"><span class="tiny muted" style="align-self:center">Common:</span>'
        +     '<span id="cHiChips">' + hiChips + '</span>'
        +     '<span id="cEnChips" style="display:none">' + enChips + '</span>'
        +   '</div>'
        + '</div>'
        + '<div id="cOut"></div></div>';
    },

    mount: function (root) {
      var lang = 'hi', gender = 'm';
      var out = root.querySelector('#cOut');
      var input = root.querySelector('#cVerb');

      function go() {
        var v = input.value.trim();
        if (!v) return;
        out.innerHTML = lang === 'hi' ? renderHindi(v) : renderEnglish(v);
        TB.Store.addHistory(TB.Auth.userId(), {
          type: 'conjugate', from: lang, to: lang, src: v,
          out: lang === 'hi' ? 'Hindi paradigm' : 'English paradigm'
        });
        TB.App.refreshChips();
      }

      function renderHindi(verb) {
        var c = TB.Conjugate.hindi(verb, gender);
        if (!c) return '<div class="card"><div class="msg msg-warn">Type a Hindi verb, for example करना.</div></div>';

        var h = '<div class="card">';
        h += '<div class="row"><div><div style="font-size:30px;font-weight:700" class="hi">'
           + esc(c.infinitive) + speak(c.infinitive, 'hi') + '</div>'
           + V.hiRead(c.infinitive) + '</div>'
           + '<div class="spacer" style="flex:1"></div>'
           + '<span class="chip">stem ' + esc(c.stem) + '</span>'
           + '<span class="chip ' + (c.transitive ? 'blue' : 'green') + '">'
           + (c.transitive ? 'transitive' : 'intransitive') + '</span>'
           + (c.irregular ? '<span class="chip amber">irregular past</span>' : '')
           + '</div>';
        h += '<div class="explain tip">' + esc(c.ergativeNote) + '</div></div>';

        c.tenses.forEach(function (t) {
          h += '<div class="card"><div class="card-head"><div>'
             + '<h3>' + esc(t.en) + '</h3>'
             + '<div class="card-sub">' + esc(t.note) + ' &nbsp;·&nbsp; <span class="mono">'
             + esc(t.formula) + '</span></div></div></div>';
          h += '<div class="conj-grid">';
          t.rows.forEach(function (r) {
            var full = r.pron + ' ' + r.form;
            h += '<div class="conj-cell">'
               + '<div class="conj-en">' + esc(r.en) + '</div>'
               + '<div class="conj-hi hi">' + esc(full) + speak(full, 'hi') + '</div>'
               + V.hiRead(full)
               + '</div>';
          });
          h += '</div></div>';
        });

        h += '<div class="card"><h3>Imperative</h3><div class="card-sub">telling someone to do it</div><div class="conj-grid">';
        c.imperative.forEach(function (i) {
          h += '<div class="conj-cell"><div class="conj-en">' + esc(i.label) + '</div>'
             + '<div class="conj-hi hi">' + esc(i.form) + speak(i.form, 'hi') + '</div>'
             + V.hiRead(i.form) + '</div>';
        });
        h += '</div></div>';

        h += '<div class="card"><h3>Making it negative</h3>'
           + '<div class="explain">' + esc(c.negative.note) + '</div></div>';
        return h;
      }

      function renderEnglish(verb) {
        var c = TB.Conjugate.english(verb, 'I');
        if (!c) return '<div class="card"><div class="msg msg-warn">Type an English verb, for example "go".</div></div>';
        var f = c.forms;

        var h = '<div class="card"><div class="row">'
          + '<div style="font-size:30px;font-weight:700">' + esc(f.base) + speak(f.base, 'en') + '</div>'
          + '<div class="spacer" style="flex:1"></div>'
          + (f.irregular ? '<span class="chip amber">irregular</span>' : '<span class="chip green">regular</span>')
          + '</div>'
          + '<div class="conj-grid mt">'
          + ['base:' + f.base, 'he/she/it:' + f.third, '-ing:' + f.ing,
             'past:' + f.past, 'past participle:' + f.participle].map(function (p) {
              var bits = p.split(':');
              return '<div class="conj-cell"><div class="conj-en">' + bits[0] + '</div>'
                   + '<div class="conj-hi">' + esc(bits[1]) + speak(bits[1], 'en') + '</div></div>';
            }).join('')
          + '</div>'
          + (f.irregular ? '<div class="explain tip">This verb is irregular — '
              + esc(f.base) + ' → ' + esc(f.past) + ' → ' + esc(f.participle)
              + '. There is no rule; it has to be memorised.</div>' : '')
          + '</div>';

        h += '<div class="card"><h3>All twelve tenses</h3>'
           + '<div class="card-sub">statement · negative · question</div>';
        c.tenses.forEach(function (t) {
          h += '<div style="padding:11px 0;border-top:1px solid var(--line-soft)">'
             + '<div class="row"><b>' + esc(t.en) + '</b>'
             + '<span class="tiny muted"> — ' + esc(t.note) + '</span></div>'
             + '<div class="conj-line">' + esc(t.affirmative) + speak(t.affirmative, 'en') + '</div>'
             + '<div class="conj-line neg">' + esc(t.negative) + speak(t.negative, 'en') + '</div>'
             + '<div class="conj-line q">' + esc(t.question) + speak(t.question, 'en') + '</div>'
             + '</div>';
        });
        h += '</div>';

        h += '<div class="card"><h3>With modals</h3><div class="pill-row">'
           + c.modals.map(function (m) {
               return '<span class="pill" data-speak="' + esc(m.form) + '" data-lang="en">' + esc(m.form) + '</span>';
             }).join('')
           + '</div></div>';

        h += '<div class="card"><h3>Passive</h3><div class="card-sub">' + esc(c.passive.note) + '</div>'
           + '<div class="conj-line">' + esc(c.passive.present) + speak(c.passive.present, 'en') + '</div>'
           + '<div class="conj-line">' + esc(c.passive.past) + speak(c.passive.past, 'en') + '</div>'
           + '<div class="conj-line">' + esc(c.passive.future) + speak(c.passive.future, 'en') + '</div>'
           + '</div>';
        return h;
      }

      /* ------------------------------------------------------------ drill */
      function drill() {
        var host = document.getElementById('modalRoot');
        var score = { right: 0, total: 0 };

        function ask() {
          var q = lang === 'hi' ? hindiQuestion() : englishQuestion();
          host.innerHTML = '<div class="modal-bg"><div class="modal center">'
            + '<div class="row"><span class="chip">' + score.right + ' / ' + score.total + '</span>'
            +   '<div style="flex:1"></div>'
            +   '<button class="btn btn-sm btn-ghost" id="qClose" type="button">✕</button></div>'
            + '<div class="tiny muted mt">' + esc(q.prompt) + '</div>'
            + '<div style="font-size:22px;font-weight:700;margin:8px 0" class="' + (lang === 'hi' ? 'hi' : '') + '">'
            +   esc(q.subject) + '</div>'
            + '<input id="qIn" class="spell-in ' + (lang === 'hi' ? 'hi' : '') + '" autocomplete="off" '
            +   'spellcheck="false" placeholder="type the form">'
            + '<div id="qFeed" class="mt"></div>'
            + '<div class="row mt" style="justify-content:center">'
            +   '<button class="btn btn-sm" id="qCheck" type="button">Check</button>'
            +   '<button class="btn btn-sm" id="qShow" type="button">Show answer</button>'
            +   '<button class="btn btn-primary btn-sm" id="qNext" type="button">Next →</button>'
            + '</div></div></div>';

          var inp = host.querySelector('#qIn');
          inp.focus();

          function check() {
            score.total++;
            var got = inp.value.trim();
            var ok = got.replace(/\s+/g, ' ') === q.answer.replace(/\s+/g, ' ');
            if (ok) {
              score.right++;
              var d = D(); d.stats.xp = (d.stats.xp || 0) + 2; saveD(d);
              TB.Store.touchStreak(TB.Auth.userId());
              TB.App.refreshChips();
              host.querySelector('#qFeed').innerHTML = '<div class="msg msg-ok">✓ Correct</div>';
              setTimeout(ask, 800);
            } else {
              host.querySelector('#qFeed').innerHTML =
                  '<div class="msg msg-warn">Not quite. The answer is:</div>'
                + '<div style="font-size:20px;font-weight:650" class="' + (lang === 'hi' ? 'hi' : '') + '">'
                + esc(q.answer) + speak(q.answer, lang) + '</div>'
                + (q.why ? '<div class="explain tip" style="text-align:left">' + esc(q.why) + '</div>' : '');
            }
          }

          host.querySelector('#qClose').addEventListener('click', function () { host.innerHTML = ''; });
          host.querySelector('#qCheck').addEventListener('click', check);
          inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
          host.querySelector('#qShow').addEventListener('click', function () {
            host.querySelector('#qFeed').innerHTML =
              '<div class="msg msg-info" style="font-size:19px">' + esc(q.answer) + '</div>';
          });
          host.querySelector('#qNext').addEventListener('click', ask);
        }

        function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

        function hindiQuestion() {
          var verb = pick(TB.Conjugate.COMMON_HI);
          var g = pick(['m', 'f']);
          var c = TB.Conjugate.hindi(verb, g);
          var t = pick(c.tenses);
          var r = pick(t.rows);
          return {
            prompt: t.en + '  (' + (g === 'm' ? 'male speaker' : 'female speaker') + ') — write the full form for:',
            subject: verb + '  →  ' + r.pron + ' ___',
            answer: r.pron + ' ' + r.form,
            why: t.formula + (c.transitive && /past|perfect/.test(t.id)
                  ? '  ·  transitive verb, so the subject takes ने and the verb does not change with it'
                  : '')
          };
        }

        function englishQuestion() {
          var verb = pick(TB.Conjugate.COMMON_EN);
          var subj = pick(['I', 'you', 'he', 'she', 'we', 'they']);
          var c = TB.Conjugate.english(verb, subj);
          var t = pick(c.tenses);
          var form = pick(['affirmative', 'negative', 'question']);
          return {
            prompt: t.en + ' — ' + form + ':',
            subject: '"' + verb + '"  with  "' + subj + '"',
            answer: t[form],
            why: t.note
          };
        }

        ask();
      }

      /* ---------------------------------------------------------- wiring */
      root.querySelector('#cGo').addEventListener('click', go);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      root.querySelector('#cDrill').addEventListener('click', drill);

      root.querySelectorAll('[data-cl]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-cl]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          lang = b.getAttribute('data-cl');
          root.querySelector('#cHiChips').style.display = lang === 'hi' ? '' : 'none';
          root.querySelector('#cEnChips').style.display = lang === 'en' ? '' : 'none';
          root.querySelector('#cGender').style.visibility = lang === 'hi' ? '' : 'hidden';
          input.placeholder = lang === 'hi' ? 'करना  /  to do' : 'go  /  eat  /  understand';
          input.value = lang === 'hi' ? 'करना' : 'go';
          go();
        });
      });
      root.querySelectorAll('[data-cg]').forEach(function (b) {
        b.addEventListener('click', function () {
          root.querySelectorAll('[data-cg]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          gender = b.getAttribute('data-cg');
          go();
        });
      });
      root.querySelector('#cCommon').addEventListener('click', function (e) {
        var b = e.target.closest('[data-cv]');
        if (b) { input.value = b.getAttribute('data-cv'); go(); }
      });

      input.value = 'करना';
      go();
    }
  };
})();
