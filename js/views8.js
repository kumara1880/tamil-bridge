/* Tamil Bridge — Grammar, word pairs, sentences and speaking.

   Four things a learner needs that a word list cannot give: the rule, the
   neighbouring words, an endless supply of correct sentences, and the
   conversation itself. All four in English, Tamil and Hindi at once, and
   every line sayable aloud.                                                */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;

  var TABS = [
    { id: 'grammar',   en: 'Grammar',             icon: '📐' },
    { id: 'words',     en: 'Synonyms & Antonyms', icon: '🔁' },
    { id: 'tense',     en: 'Tense Chart',         icon: '🕰️' },
    { id: 'sentences', en: 'Sentences',           icon: '♾️' },
    { id: 'speaking',  en: 'Speaking',            icon: '💬' }
  ];

  /* A section that can only be reached by tapping through another section is
     a section nobody finds, so every tab is its own address. */
  function startTab(param) {
    return TABS.some(function (t) { return t.id === param; }) ? param : 'grammar';
  }

  /* One line of a language, with its pronunciation underneath. Hindi gets
     roman and Tamil letters; English gets Tamil letters; Tamil gets roman.
     A learner should never meet a script they cannot sound out. */
  function line(text, lang, big) {
    if (!text) return '';
    return '<div class="lang-line">'
      + '<div class="' + lang + '"' + (big ? ' style="font-size:calc(19px * var(--fs,1));font-weight:600"' : '') + '>'
      + esc(text) + speak(text, lang) + '</div>'
      + readAid(text, lang) + '</div>';
  }

  function trio(o, order) {
    return (order || ['en', 'ta', 'hi']).map(function (l) { return line(o[l], l, l === (order || [])[0]); }).join('');
  }

  V.english = {
    title: 'Grammar & Speaking',
    sub: 'Grammar · synonyms & antonyms · the tense chart · endless sentences · real conversations',
    html: function (param) {
      var start = startTab(param);
      return '<div class="view">'
        + '<div class="card"><div class="pill-row" id="eTabs">'
        + TABS.map(function (t) {
            return '<button class="pill' + (t.id === start ? ' on' : '') + '" data-tab="' + t.id + '" type="button">'
                 + t.icon + ' ' + esc(t.en) + '</button>';
          }).join('')
        + '</div></div>'
        + '<div id="eBody"></div></div>';
    },

    mount: function (root, param) {
      var body = root.querySelector('#eBody');
      var tab = startTab(param);
      var gLang = 'en';       /* whose grammar */
      var wLang = 'en';       /* whose word pairs */
      var sIndex = 0;         /* where we are in the sentence space */

      /* ------------------------------------------------------- grammar */
      function grammar() {
        var set = gLang === 'hi' ? TB.GRAMMAR_HI
                : gLang === 'ta' ? TB.GRAMMAR_TA : TB.GRAMMAR;
        body.innerHTML = '<div class="card"><div class="row">'
          + '<span class="tiny muted">Grammar of:</span>'
          + '<div class="pill-row" id="gLang">'
          + '<button class="pill' + (gLang === 'en' ? ' on' : '') + '" data-gl="en" type="button">English</button>'
          + '<button class="pill' + (gLang === 'ta' ? ' on' : '') + '" data-gl="ta" type="button">தமிழ்</button>'
          + '<button class="pill' + (gLang === 'hi' ? ' on' : '') + '" data-gl="hi" type="button">हिंदी</button>'
          + '</div>'
          + '<div class="spacer" style="flex:1"></div>'
          + '<span class="tiny muted">' + set.length + ' rules</span></div></div>'
          /* Sixteen rules open at once is a wall. Shut, they are a list of
             what there is to learn, and the first one is open so nobody has
             to guess that they open at all. */
          + set.map(function (t, i) {
              return '<details class="card gram fold" data-g="' + i + '"' + (i === 0 ? ' open' : '') + '>'
                + '<summary class="fold-head"><div>'
                + '<h3>' + esc(t.title.en) + '</h3>'
                + '<div class="card-sub ta">' + esc(t.title.ta) + ' · <span class="hi">' + esc(t.title.hi) + '</span>'
                + V.hiTamil(t.title.hi) + '</div>'
                + '</div><div class="spacer"></div><span class="chip">Level ' + t.level + '</span></summary>'
                + '<div class="gram-rule">' + trio(t.rule) + '</div>'
                + '<div class="tiny muted mt mb">Examples</div>'
                + t.examples.map(function (x) {
                    var order = gLang === 'hi' ? ['hi', 'en', 'ta']
                              : gLang === 'ta' ? ['ta', 'en', 'hi'] : ['en', 'ta', 'hi'];
                    return '<div class="gram-ex">' + trio(x, order) + '</div>';
                  }).join('')
                + '<div class="gram-mistake">'
                + '<div class="tiny" style="font-weight:700">The mistake almost everyone makes</div>'
                + '<div class="gram-wrong">✗ ' + esc(t.mistake.wrong) + '</div>'
                + '<div class="gram-right">✓ ' + esc(t.mistake.right) + speak(t.mistake.right, gLang) + '</div>'
                + '<div class="tiny mt">' + esc(t.mistake.why.en) + '</div>'
                + '<div class="tiny ta" style="color:var(--teal)">' + esc(t.mistake.why.ta) + '</div>'
                + '<div class="tiny hi" style="color:var(--purple)">' + esc(t.mistake.why.hi) + '</div>'
                + '</div></details>';
            }).join('');

        body.querySelector('#gLang').addEventListener('click', function (e) {
          var b = e.target.closest('[data-gl]');
          if (!b) return;
          gLang = b.getAttribute('data-gl');
          grammar();
        });
      }

      /* --------------------------------------------------- word pairs */

      /* How many synonym and opposite pairs a list really holds. Every word
         in a cluster is a synonym of every other, and stands opposite every
         word in the opposing one, so the honest number is far larger than
         the row count \u2014 and far smaller than a lakh, which is why this is
         counted rather than claimed. */
      function relations(list, lang) {
        var syn = 0, ant = 0;
        list.forEach(function (w) {
          var n = w.syn.length + 1;
          syn += n * (n - 1) / 2;
          ant += n * w.ant.length;
        });
        return { syn: syn, ant: ant, total: syn + ant };
      }

      function words() {
        var set = wLang === 'hi' ? TB.WORDPAIRS_HI : wLang === 'ta' ? TB.WORDPAIRS_TA : TB.WORDPAIRS;
        body.innerHTML = '<div class="card"><div class="row">'
          + '<span class="tiny muted">Words of:</span>'
          + '<div class="pill-row" id="wLang">'
          + '<button class="pill' + (wLang === 'en' ? ' on' : '') + '" data-wl="en" type="button">English</button>'
          + '<button class="pill' + (wLang === 'ta' ? ' on' : '') + '" data-wl="ta" type="button">தமிழ்</button>'
          + '<button class="pill' + (wLang === 'hi' ? ' on' : '') + '" data-wl="hi" type="button">हिंदी</button>'
          + '</div>'
          + '<div class="spacer" style="flex:1"></div>'
          + (function () {
              var r = relations(set, wLang);
              return '<span class="tiny muted">' + set.length + ' words \u00b7 '
                + r.syn.toLocaleString('en-IN') + ' same \u00b7 '
                + r.ant.toLocaleString('en-IN') + ' opposite</span>';
            })()
          + '</div></div>'
          + '<div class="pair-grid">'
          + set.map(function (w) {
              var head = w[wLang];
              return '<div class="card pair">'
                + '<div class="' + wLang + '" style="font-size:calc(21px * var(--fs,1));font-weight:700">'
                + esc(head) + speak(head, wLang) + '</div>'
                + readAid(head, wLang)
                + '<div class="pair-gloss">'
                + ['en', 'ta', 'hi'].filter(function (l) { return l !== wLang && w[l]; })
                    .map(function (l) { return '<span class="' + l + '">' + esc(w[l]) + '</span>'; }).join(' · ')
                + '</div>'
                + '<div class="pair-row"><span class="pair-tag same">Same</span>'
                + w.syn.map(function (s) {
                    return '<button class="pill pill-sm" data-say="' + esc(s) + '" data-lang="' + wLang + '" type="button">' + esc(s) + '</button>';
                  }).join('') + '</div>'
                + '<div class="pair-row"><span class="pair-tag opp">Opposite</span>'
                + w.ant.map(function (s) {
                    return '<button class="pill pill-sm" data-say="' + esc(s) + '" data-lang="' + wLang + '" type="button">' + esc(s) + '</button>';
                  }).join('') + '</div>'
                + '<div class="pair-ex">' + trio(w.ex, [wLang].concat(['en', 'ta', 'hi'].filter(function (l) { return l !== wLang; }))) + '</div>'
                + '</div>';
            }).join('')
          + '</div>';

        body.querySelector('#wLang').addEventListener('click', function (e) {
          var b = e.target.closest('[data-wl]');
          if (!b) return;
          wLang = b.getAttribute('data-wl');
          words();
        });
      }

      /* ---------------------------------------------------- sentences */
      function sentences() {
        var S = TB.Sentences;
        var total = S.total();
        var batch = [];
        for (var i = 0; i < 12; i++) batch.push(S.atIndex(sIndex + i));

        body.innerHTML = '<div class="card">'
          + '<div class="card-head"><div><h3>' + total.toLocaleString('en-IN') + ' sentences</h3>'
          + '<div class="card-sub">Built from correct parts by correct rules, so every one of them is right — '
          + 'present, past and future, statement, negative and question, in all three languages</div></div></div>'
          + '<div class="row mt">'
          + '<button class="btn btn-primary btn-sm" id="sNext" type="button">Twelve more →</button>'
          + '<button class="btn btn-sm" id="sShuffle" type="button">🎲 Anywhere</button>'
          + '<span class="tiny muted" id="sWhere"></span></div>'
          + '<div class="row mt"><span class="tiny muted">Verb chart:</span>'
          + '<select id="sVerb" style="padding:7px 10px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
          + S.VERBS.map(function (v) { return '<option value="' + v.en + '">' + v.en + '</option>'; }).join('')
          + '</select>'
          + '<button class="btn btn-sm" id="sChart" type="button">Show past · present · future</button></div>'
          + '</div>'
          + '<div id="sChartOut"></div>'
          + '<div id="sList">' + batch.map(sentenceCard).join('') + '</div>';

        body.querySelector('#sWhere').textContent = 'from ' + (sIndex + 1).toLocaleString('en-IN');
        body.querySelector('#sNext').addEventListener('click', function () {
          sIndex = (sIndex + 12) % total; sentences();
        });
        body.querySelector('#sShuffle').addEventListener('click', function () {
          sIndex = Math.floor(Math.random() * total); sentences();
        });
        body.querySelector('#sChart').addEventListener('click', function () {
          drawChart(body.querySelector('#sVerb').value);
        });
      }

      function sentenceCard(s) {
        return '<div class="card sent">'
          + '<div class="row mb"><span class="chip chip-' + s.tense + '">' + s.tense + '</span>'
          + '<span class="chip">' + s.form + '</span>'
          + '<div class="spacer" style="flex:1"></div>'
          + '<span class="tiny muted">' + esc(s.subject) + '</span></div>'
          + line(s.en, 'en', true) + line(s.ta, 'ta') + line(s.hi, 'hi')
          + '</div>';
      }

      function drawChart(verb) {
        var c = TB.Sentences.chart(verb, 'statement', 0);
        var out = body.querySelector('#sChartOut');
        out.innerHTML = c ? chartCard(c) : '';
      }

      function chartCard(c) {
        return '<div class="card"><h3>' + esc(c.verb.en) + ' · ' + esc(c.verb.ta.d)
          + ' — every person, every tense</h3>'
          + '<div class="card-sub">' + esc(c.form.id)
          + (c.slots > 1 ? ' · way ' + (c.slot + 1) + ' of ' + c.slots + ' to finish it' : '')
          + ' · Tamil marks the person on the verb; Hindi marks the gender, and in the past '
          + 'a transitive verb agrees with the object, not with who did it</div>'
          + '<div class="chart-scroll"><table class="chart"><thead><tr>'
          + '<th>Who</th><th>Past</th><th>Present</th><th>Future</th></tr></thead><tbody>'
          + c.rows.map(function (r) {
              return '<tr><td class="chart-who">' + esc(r.subject.label) + '</td>'
                + ['past', 'present', 'future'].map(function (t) {
                    return '<td>'
                      + '<div>' + esc(r[t].en) + speak(r[t].en, 'en') + '</div>'
                      + '<div class="ta tiny" style="color:var(--teal)">' + esc(r[t].ta) + speak(r[t].ta, 'ta') + '</div>'
                      + '<div class="hi tiny" style="color:var(--purple)">' + esc(r[t].hi) + speak(r[t].hi, 'hi') + '</div>'
                      + '</td>';
                  }).join('')
                + '</tr>';
            }).join('')
          + '</tbody></table></div></div>';
      }

      /* -------------------------------------------------- tense chart */
      /* Past, present and future of one verb for every person, in all three
         languages with the pronunciation underneath. The verb, the form and
         the ending can all be changed, and the charts tile the whole sentence
         space exactly — charts × 36 is the total, nothing is unreachable. */
      var tVerb = 'eat', tForm = 'statement', tSlot = 0;
      function tense() {
        var S = TB.Sentences;
        var c = S.chart(tVerb, tForm, tSlot);
        body.innerHTML = '<div class="card">'
          + '<div class="card-head"><div><h3>Past · Present · Future</h3>'
          + '<div class="card-sub">'
          + S.charts().toLocaleString('en-IN') + ' charts of ' + S.perChart()
          + ' sentences each — ' + S.total().toLocaleString('en-IN')
          + ' sentences in all, in English, தமிழ் and हिंदी.</div></div></div>'
          + '<div class="row mt" style="flex-wrap:wrap;gap:10px;align-items:flex-end">'
          +   '<label class="tiny muted" style="display:block">Verb<br>'
          +     '<select id="tVerb" class="sel">'
          +     S.VERBS.map(function (v) {
                  return '<option value="' + esc(v.en) + '"' + (v.en === tVerb ? ' selected' : '') + '>'
                       + esc(v.en) + '  ·  ' + esc(v.ta.d) + '</option>';
                }).join('')
          +     '</select></label>'
          +   '<div class="pill-row" id="tForm">'
          +   S.FORMS.map(function (f) {
                return '<button class="pill' + (f.id === tForm ? ' on' : '') + '" data-tf="'
                     + f.id + '" type="button">' + esc(f.id) + '</button>';
              }).join('')
          +   '</div>'
          +   '<button class="btn btn-sm" id="tSlot" type="button">🔄 Change the ending'
          +     (c ? ' (' + (c.slot + 1) + '/' + c.slots + ')' : '') + '</button>'
          + '</div></div>'
          + (c ? chartCard(c) : '');

        body.querySelector('#tVerb').addEventListener('change', function () {
          tVerb = this.value; tSlot = 0; tense();
        });
        body.querySelector('#tForm').addEventListener('click', function (e) {
          var b = e.target.closest('[data-tf]');
          if (!b) return;
          tForm = b.getAttribute('data-tf'); tense();
        });
        body.querySelector('#tSlot').addEventListener('click', function () {
          tSlot = c ? (c.slot + 1) % c.slots : 0; tense();
        });
      }

      /* ----------------------------------------------------- speaking */
      var spLang = 'en';
      function speaking() {
        body.innerHTML = '<div class="card"><div class="row">'
          + '<span class="tiny muted">Practising:</span>'
          + '<div class="pill-row" id="spLang">'
          + '<button class="pill' + (spLang === 'en' ? ' on' : '') + '" data-sp="en" type="button">Spoken English</button>'
          + '<button class="pill' + (spLang === 'hi' ? ' on' : '') + '" data-sp="hi" type="button">बोलचाल की हिंदी</button>'
          + '<button class="pill' + (spLang === 'ta' ? ' on' : '') + '" data-sp="ta" type="button">பேச்சுத் தமிழ்</button>'
          + '</div></div>'
          + '<div class="tiny muted mt">The language you are practising is on top; the other two are underneath as the meaning.</div>'
          + '</div>'
          + TB.SPOKEN.map(function (d, i) {
              var others = ['en', 'ta', 'hi'].filter(function (l) { return l !== spLang; });
              return '<details class="card fold"' + (i === 0 ? ' open' : '') + '>'
                + '<summary class="fold-head"><div>'
                + '<h3>' + esc(d.title[spLang] || d.title.en) + '</h3>'
                + '<div class="card-sub">' + esc(d.title.en) + '</div></div>'
                + '<div class="spacer"></div>'
                + '<span class="btn btn-sm" data-play="' + i + '">▶ Play</span></summary>'
                + d.lines.map(function (l, j) {
                    return '<div class="talk talk-' + l.who + '" data-d="' + i + '" data-l="' + j + '">'
                      + '<span class="talk-who">' + l.who + '</span><div>'
                      + '<div class="' + spLang + '" style="font-weight:600">' + esc(l[spLang]) + speak(l[spLang], spLang) + '</div>'
                      + readAid(l[spLang], spLang)
                      /* The two languages you are not practising are the
                         reason to look at this line at all. Showing them in
                         a script the reader cannot sound out, with nothing
                         underneath, teaches nothing. */
                      + others.map(function (o) {
                          return '<div class="' + o + ' tiny muted">' + esc(l[o]) + '</div>'
                               + readAid(l[o], o);
                        }).join('')
                      + '</div></div>';
                  }).join('')
                + '</details>';
            }).join('');

        body.querySelector('#spLang').addEventListener('click', function (e) {
          var b = e.target.closest('[data-sp]');
          if (!b) return;
          TB.Speech.stop();
          spLang = b.getAttribute('data-sp');
          speaking();
        });

        onBody(function (e) {
          var p = e.target.closest('[data-play]');
          if (p) {
            var d = TB.SPOKEN[+p.getAttribute('data-play')];
            var prefs = D().prefs;
            TB.Speech.sequence(d.lines.map(function (l) {
              return { text: l[spLang], lang: spLang, rate: (prefs.rate || 0.9) * 0.95, pause: 620 };
            }), {
              rate: prefs.rate, pitch: prefs.pitch,
              voiceNames: { ta: prefs.voiceTa, en: prefs.voiceEn, hi: prefs.voiceHi }
            });
            return;
          }
          var t = e.target.closest('.talk');
          /* The speaker button inside the line is already handled globally.
             Without this the line was said twice for one press — two
             voices over each other, from a single tap. */
          if (t && !e.target.closest('[data-word]') && !e.target.closest('[data-speak]')) {
            var dd = TB.SPOKEN[+t.getAttribute('data-d')];
            var ll = dd.lines[+t.getAttribute('data-l')];
            TB.Speech.speak(ll[spLang], spLang, { rate: 0.75 });
          }
        });
      }

      /* -------------------------------------------------------- wiring */
      function draw() {
        TB.Speech.stop();
        /* The handlers belong to the tab on the screen, not to every tab
           ever opened. Without this they stacked up, and one press of Play
           started as many readings as there had been redraws — each one
           silencing the last, which is why a conversation came out in
           pieces with only the final line read whole. */
        bodyHandlers.length = 0;
        if (tab === 'grammar') grammar();
        else if (tab === 'words') words();
        else if (tab === 'tense') tense();
        else if (tab === 'sentences') sentences();
        else speaking();
        var d = D(); d.stats.xp = (d.stats.xp || 0) + 1; saveD(d);
        TB.App.refreshChips();
      }

      /* #eBody outlives every redraw, so a handler added inside a tab would
         stack up and speak the same word once per visit. Added once, here. */
      var bodyHandlers = [];
      /* The handler for what is on the screen now — one, not one per
         visit. Switching the spoken language redraws without going through
         draw(), so clearing the list there alone was not enough: three
         language switches still meant three readings from one press. */
      function onBody(fn) { bodyHandlers.length = 0; bodyHandlers.push(fn); }
      body.addEventListener('click', function (e) {
        var said = e.target.closest('[data-say]');
        if (said) {
          TB.Speech.speak(said.getAttribute('data-say'), said.getAttribute('data-lang'), { rate: 0.75 });
          return;
        }
        bodyHandlers.forEach(function (fn) { fn(e); });
      });

      /* The tab is the address, so the back button works and a link can be
         sent to somebody. */
      root.querySelector('#eTabs').addEventListener('click', function (e) {
        var b = e.target.closest('[data-tab]');
        if (!b) return;
        root.querySelectorAll('#eTabs .pill').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        tab = b.getAttribute('data-tab');
        if (location.hash !== '#/english/' + tab) {
          history.replaceState(null, '', '#/english/' + tab);
        }
        draw();
      });

      draw();
    }
  };
}());
