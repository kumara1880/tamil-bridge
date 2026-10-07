/* Tamil Bridge — the conversation tutor.

   Speak, be heard, be corrected, be answered. Two tabs:

     Conversations — real situations from beginner (A1) to native (C2). The
       partner speaks in a native voice; it is your turn; you say your line;
       it is scored word by word and explained in Tamil; the partner answers.

     Free talk — say anything. In Tamil, and you are taught how to say it in
       English or Hindi, then asked to say it yourself. In English or Hindi,
       and it is checked, corrected, given its meaning in Tamil, and answered
       with a question so the talk carries on.

   Every line in the language being learnt carries its captions: how to read
   it in English letters and in Tamil letters, and what it means. Nothing
   here needs an account, a key, or a fee. */
(function () {
  var V = TB.Views;
  var esc = V.esc, speakBtn = V.speakBtn, readAid = V.readAid, D = V.D, saveD = V.saveD;
  var C = TB.Converse;

  var LANG_NAME = { en: 'English', hi: 'हिंदी', ta: 'தமிழ்' };
  /* Said inside a Tamil sentence, a language is named in Tamil. */
  var IN_TAMIL = { en: 'ஆங்கிலத்தில்', hi: 'இந்தியில்' };

  V.talk = {
    title: 'Talk & learn', sub: 'Speak with a tutor — from beginner to native',
    html: function () {
      var d = D();
      var learn = d.prefs.talkLang === 'hi' ? 'hi' : 'en';
      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="row">'
        +     '<div class="pill-row" id="tkTabs">'
        +       '<button class="pill on" data-tab="scenes" type="button">\u{1F465} Conversations</button>'
        +       '<button class="pill" data-tab="free" type="button">\u{1F4AC} Free talk — say anything</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="row mt"><span class="tiny muted">I am learning:</span>'
        +     '<div class="pill-row" id="tkLang">'
        +       '<button class="pill' + (learn === 'en' ? ' on' : '') + '" data-lang="en" type="button">English</button>'
        +       '<button class="pill' + (learn === 'hi' ? ' on' : '') + '" data-lang="hi" type="button">हिंदी Hindi</button>'
        +     '</div>'
        +   '</div>'
        +   '<div class="tiny muted mt">The partner speaks in a native voice. You answer aloud — '
        +     'or tap <b>I said it</b> on a device without a microphone. Every line shows how to read it '
        +     'in English and Tamil letters, and what it means.</div>'
        + '</div>'
        + '<div id="tkBody"></div></div>';
    },

    mount: function (root) {
      var body = root.querySelector('#tkBody');
      var d0 = D();
      var learn = d0.prefs.talkLang === 'hi' ? 'hi' : 'en';
      var tab = 'scenes';
      var level = Math.max(1, Math.min(6, +d0.prefs.talkLevel || 1));
      var active = null;          /* the conversation being played */
      var turn = 0, results = [];
      var hide = false;           /* "test me": hide the learner's line */
      var busy = false;           /* a voice or the microphone is in use */
      var gen = 0;                /* bumps on every restart, so stale callbacks stop */
      var freeTurns = 0;
      var freeSpeak = 'ta';       /* the language the learner will speak in free talk */

      var canHear = TB.Speech.recognitionSupported();

      /* ------------------------------------------------------- helpers */
      function prefs() { return D().prefs; }
      function sayOpts(extra) {
        var p = prefs(), o = {
          rate: p.rate || 0.9, pitch: p.pitch || 1,
          sex: p.voiceSex === 'net' ? '' : (p.voiceSex || ''),
          online: p.voiceSex === 'net',
          voiceNames: { ta: p.voiceTa, en: p.voiceEn, hi: p.voiceHi }
        };
        for (var k in (extra || {})) o[k] = extra[k];
        return o;
      }
      function say(text, lang, slow) {
        return TB.Speech.speak(text, lang, sayOpts(slow ? { rate: 0.62 } : null))
          .catch(function () { return false; });
      }
      function saveLevel() { var d = D(); d.prefs.talkLevel = level; d.prefs.talkLang = learn; saveD(d); }

      /* The captions under a line in the language being learnt: how to read
         it, in English letters and Tamil letters, then what it means. Hindi
         gets its English meaning as well as its Tamil one. */
      function captions(line, lang) {
        var h = readAid(line[lang], lang, true);
        h += '<div class="tk-mean"><span class="tiny muted">தமிழ்</span> <span class="ta">' + esc(line.ta || '') + '</span></div>';
        if (lang === 'hi' && line.en) {
          h += '<div class="tk-mean"><span class="tiny muted">English</span> <span>' + esc(line.en) + '</span></div>';
        }
        return h;
      }

      function stopAll() { gen++; busy = false; TB.Speech.stop(); }

      /* Still on the page? A voice or a microphone can finish after the
         reader has gone somewhere else; nothing should then be written into
         a view that is no longer there. */
      function alive(my) { return my === gen && body.isConnected; }

      /* ================================================= conversations */
      function scenes() {
        var levels = C.LEVELS();
        var list = C.byLevel(level);
        body.innerHTML = '<div class="card">'
          + '<div class="pill-row" id="tkLevels">'
          + levels.map(function (L) {
              return '<button class="pill' + (L.n === level ? ' on' : '') + '" data-level="' + L.n + '" type="button">'
                + L.n + ' · ' + esc(L.en) + ' <span class="ta tiny">' + esc(L.ta) + '</span></button>';
            }).join('')
          + '</div>'
          + '<div class="row mt">'
          +   '<input id="tkWant" type="text" placeholder="Any situation you want — e.g. at the bank, job interview, வாடகை வீடு…" '
          +     'aria-label="Describe a situation to practise" style="flex:1;min-width:200px">'
          +   '<button class="btn btn-sm" id="tkFind" type="button">\u{1F50E} Find</button>'
          + '</div>'
          + '<div id="tkFound"></div>'
          + '</div>'
          + '<div class="grid g2" id="tkScenes">'
          + (list.length ? list.map(sceneCard).join('')
              : '<div class="card"><div class="muted">No conversations at this level yet.</div></div>')
          + '</div>';
      }

      function sceneCard(d) {
        var b = d.lines.filter(function (l) { return l.who === 'B'; }).length;
        return '<button class="card tk-scene" data-scene="' + esc(d.id) + '" type="button">'
          + '<div class="tiny muted">Level ' + d.level + ' · ' + b + ' turns for you</div>'
          + '<h3>' + esc(d.title.en) + '</h3>'
          + '<div class="ta small">' + esc(d.title.ta) + '</div>'
          + '<div class="hi tiny muted">' + esc(d.title.hi) + '</div>'
          + '</button>';
      }

      function findScenes() {
        var q = (root.querySelector('#tkWant') || {}).value || '';
        var out = root.querySelector('#tkFound');
        if (!out) return;
        var hits = C.match(q, 6);
        if (!q.trim()) { out.innerHTML = ''; return; }
        if (!hits.length) {
          out.innerHTML = '<div class="msg msg-info mt">No ready-made conversation for that yet. '
            + 'Use <b>Free talk</b> to say anything about it — the tutor will teach and answer you.</div>';
          return;
        }
        out.innerHTML = '<div class="tiny muted mt">Closest conversations:</div><div class="grid g2 mt">'
          + hits.map(function (h) { return sceneCard(h.d); }).join('') + '</div>';
      }

      /* ---------------------------------------------- playing one */
      function start(id) {
        stopAll();
        active = C.find(id);
        if (!active) return;
        turn = 0; results = [];
        body.innerHTML = '<div class="card">'
          + '<div class="row"><button class="btn btn-sm" id="tkBack" type="button">← All conversations</button>'
          + '<div class="spacer" style="flex:1"></div>'
          + '<label class="tiny muted tk-hide"><input type="checkbox" id="tkHide"' + (hide ? ' checked' : '') + '> '
          + 'Test me — hide my line</label></div>'
          + '<h3 class="mt">' + esc(active.title.en) + '</h3>'
          + '<div class="ta small">' + esc(active.title.ta) + '</div>'
          + '</div>'
          + '<div class="card tk-chat" id="tkChat"></div>'
          + '<div id="tkTurn"></div>';
        advance();
      }

      function bubble(line, who, extra) {
        var chat = root.querySelector('#tkChat');
        if (!chat) return;
        var el = document.createElement('div');
        el.className = 'tk-bubble tk-' + who;
        el.innerHTML = '<div class="tk-who">' + (who === 'A' ? 'Partner' : 'You') + '</div>'
          + '<div class="' + learn + ' tk-line">' + esc(line[learn]) + speakBtn(line[learn], learn) + '</div>'
          + captions(line, learn)
          + (extra || '');
        chat.appendChild(el);
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      /* Play partner lines until it is the learner's turn, then ask. */
      function advance() {
        var my = gen;
        var lines = active.lines;
        function step() {
          if (!alive(my)) return;
          if (turn >= lines.length) { summary(); return; }
          var line = lines[turn];
          if (line.who === 'A') {
            bubble(line, 'A');
            busy = true;
            say(line[learn], learn).then(function () {
              if (!alive(my)) return;
              busy = false;
              turn++;
              setTimeout(step, 250);
            });
          } else {
            yourTurn(line);
          }
        }
        step();
      }

      function yourTurn(line, last) {
        var box = root.querySelector('#tkTurn');
        if (!box) return;
        box.innerHTML = '<div class="card tk-your">'
          + '<div class="tiny muted">Your turn — say this' + (learn === 'hi' ? ' in Hindi' : ' in English') + ':</div>'
          + '<div class="' + learn + ' tk-line tk-target' + (hide ? ' tk-hidden' : '') + '">' + esc(line[learn]) + '</div>'
          + (hide ? '<div class="tiny muted">Hidden — say it from the meaning. Tap the line to reveal it.</div>' : '')
          + '<div class="' + (hide ? 'tk-hidden' : '') + '">' + captions(line, learn) + '</div>'
          + (hide ? '<div class="tk-mean"><span class="tiny muted">தமிழ்</span> <span class="ta">' + esc(line.ta) + '</span></div>' : '')
          + (line.tip ? '<div class="explain tip mt">\u{1F4A1} ' + esc(line.tip.en)
              + '<div class="ta small mt">' + esc(line.tip.ta) + '</div></div>' : '')
          + '<div class="row mt tk-actions">'
          +   '<button class="btn btn-sm" data-act="hear" type="button">\u{1F50A} Hear it</button>'
          +   '<button class="btn btn-sm" data-act="slow" type="button">\u{1F422} Slowly</button>'
          +   (canHear ? '<button class="btn btn-primary" data-act="mic" type="button">\u{1F3A4} Speak now</button>' : '')
          +   '<button class="btn btn-sm" data-act="said" type="button">✓ I said it</button>'
          +   '<button class="btn btn-sm btn-ghost" data-act="skip" type="button">Skip ⏭</button>'
          + '</div>'
          + (canHear ? '' : '<div class="tiny muted mt">This browser cannot listen. Say it aloud, then tap '
              + '<b>I said it</b>. Chrome or Edge can check your pronunciation.</div>')
          + '<div id="tkHeard">' + (last || '') + '</div>'
          + '</div>';
      }

      function wordsHtml(r) {
        return (r.perWord || []).map(function (w) {
          return '<span class="tk-word ' + (w.ok ? 'ok' : 'miss') + '">' + esc(w.word) + '</span>';
        }).join(' ');
      }

      function listenFor(line) {
        if (busy) return;
        var heardBox = root.querySelector('#tkHeard');
        var my = gen;
        busy = true;
        TB.Speech.stop();
        heardBox.innerHTML = '<div class="msg msg-info mt">\u{1F3A4} Listening… speak now.</div>';
        TB.Speech.listen(learn, {
          maxMs: 9000,
          onInterim: function (t) {
            if (!alive(my)) return;
            heardBox.innerHTML = '<div class="msg msg-info mt">\u{1F3A4} ' + esc(t || 'Listening…') + '</div>';
          }
        }).then(function (heard) {
          if (!alive(my)) return;
          busy = false;
          if (!heard.text) {
            heardBox.innerHTML = '<div class="msg msg-warn mt">Nothing was heard. Tap Speak now and try again, close to the microphone.</div>';
            return;
          }
          var r = C.judge(line, learn, heard);
          var fb = C.feedback(r.score);
          heardBox.innerHTML = '<div class="tk-result tk-' + fb.tone + ' mt">'
            + '<div class="row"><b>' + r.score + '/100</b><span class="spacer" style="flex:1"></span>'
            + '<span class="tiny muted">You said: ' + esc(r.heard) + '</span></div>'
            + '<div class="mt">' + wordsHtml(r) + '</div>'
            + '<div class="ta mt">' + esc(fb.ta) + '</div><div class="tiny muted">' + esc(fb.en) + '</div>'
            + '<div class="row mt">'
            +   (r.pass ? '<button class="btn btn-primary btn-sm" data-act="next" type="button">Next →</button>'
                        : '<button class="btn btn-primary btn-sm" data-act="mic" type="button">\u{1F3A4} Try again</button>'
                          + '<button class="btn btn-sm" data-act="hear" type="button">\u{1F50A} Hear it</button>'
                          + '<button class="btn btn-sm btn-ghost" data-act="next" type="button">Next anyway →</button>')
            + '</div></div>';
          pending = { line: line, score: r.score, heard: r.heard };
          if (r.pass) say(fb.tone === 'great' ? 'Excellent!' : 'Good!', 'en');
        }).catch(function (e) {
          if (!alive(my)) return;
          busy = false;
          heardBox.innerHTML = '<div class="msg msg-err mt">' + esc(e.message) + '</div>'
            + '<div class="tiny muted">You can still say it aloud and tap <b>I said it</b>.</div>';
        });
      }

      var pending = null;
      function moveOn(score, heard) {
        var line = active.lines[turn];
        results.push({ line: line, score: score });
        var badge = score == null ? '' : '<div class="tiny muted">' + (heard ? 'You said: ' + esc(heard) + ' · ' : '')
          + 'score ' + score + '</div>';
        bubble(line, 'B', badge);
        var box = root.querySelector('#tkTurn');
        if (box) box.innerHTML = '';
        pending = null;
        turn++;
        var d = D(); d.stats.xp = (d.stats.xp || 0) + (score != null && score >= C.PASS ? 3 : 1); saveD(d);
        TB.App.refreshChips();
        advance();
      }

      function summary() {
        var box = root.querySelector('#tkTurn');
        if (!box || !body.isConnected) return;
        var scored = results.filter(function (r) { return r.score != null; });
        var avg = scored.length ? Math.round(scored.reduce(function (a, r) { return a + r.score; }, 0) / scored.length) : null;
        var weak = results.filter(function (r) { return r.score == null || r.score < C.PASS; });
        var next = C.byLevel(active.level);
        var idx = next.map(function (x) { return x.id; }).indexOf(active.id);
        var after = next[idx + 1] || C.byLevel(Math.min(6, active.level + 1))[0];
        box.innerHTML = '<div class="card tk-summary">'
          + '<h3>Conversation complete \u{1F389}</h3>'
          + '<div class="ta">உரையாடல் முடிந்தது!</div>'
          + (avg != null ? '<div class="mt"><b>Your average: ' + avg + '/100</b></div>' : '')
          + (weak.length ? '<div class="mt tiny muted">Practise these again:</div>'
              + weak.map(function (r) {
                  return '<div class="tk-weak"><span class="' + learn + '">' + esc(r.line[learn]) + '</span>'
                    + speakBtn(r.line[learn], learn) + '<div class="ta tiny">' + esc(r.line.ta) + '</div></div>';
                }).join('')
              : '<div class="mt ta">எல்லா வரிகளையும் சரியாகச் சொன்னீர்கள்!</div>')
          + '<div class="row mt">'
          +   '<button class="btn" data-act="again" type="button">↻ Practise again</button>'
          +   (after && after.id !== active.id
                ? '<button class="btn btn-primary" data-next="' + esc(after.id) + '" type="button">Next: '
                  + esc(after.title.en) + ' →</button>' : '')
          + '</div></div>';
        TB.Store.addHistory(TB.Auth.userId(), {
          type: 'speak', from: learn, to: 'ta', src: active.title.en,
          out: avg != null ? 'Conversation · average ' + avg : 'Conversation completed'
        });
      }

      /* ======================================================= free talk */
      function free() {
        body.innerHTML = '<div class="card">'
          + '<div class="row"><span class="tiny muted">I will speak in:</span>'
          + '<div class="pill-row" id="frSpeak">'
          +   '<button class="pill' + (freeSpeak === 'ta' ? ' on' : '') + '" data-sp="ta" type="button">தமிழ்</button>'
          +   '<button class="pill' + (freeSpeak === learn ? ' on' : '') + '" data-sp="' + learn + '" type="button">' + LANG_NAME[learn] + '</button>'
          + '</div></div>'
          + '<div class="tiny muted mt">Say anything. In Tamil, and you learn how to say it in '
          +   LANG_NAME[learn] + '. In ' + LANG_NAME[learn] + ', and it is checked, explained in Tamil, and answered.</div>'
          + '</div>'
          + '<div class="card tk-chat" id="frChat">'
          +   '<div class="tk-bubble tk-A"><div class="tk-who">Tutor</div>'
          +   '<div class="ta">வணக்கம்! எதைப் பற்றி வேண்டுமானாலும் பேசுங்கள். தமிழில் சொன்னால் '
          +     IN_TAMIL[learn] + ' எப்படிச் சொல்வது என்று கற்றுத் தருகிறேன்.</div>'
          +   '<div class="tiny muted">Hello! Talk about anything you like.</div></div>'
          + '</div>'
          + '<div class="card"><div class="row">'
          +   '<input id="frText" type="text" placeholder="Type or speak anything…" aria-label="What you want to say" style="flex:1;min-width:180px">'
          +   (canHear ? '<button class="btn btn-sm" id="frMic" type="button">\u{1F3A4}</button>' : '')
          +   '<button class="btn btn-primary btn-sm" id="frSend" type="button">Send</button>'
          + '</div><div id="frStat" class="tiny muted mt"></div></div>';
      }

      function frBubble(html, who) {
        var chat = root.querySelector('#frChat');
        if (!chat) return null;
        var el = document.createElement('div');
        el.className = 'tk-bubble tk-' + who;
        el.innerHTML = '<div class="tk-who">' + (who === 'A' ? 'Tutor' : 'You') + '</div>' + html;
        chat.appendChild(el);
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return el;
      }

      function translate(text, from, to) {
        return TB.Translate.translate(text, from, to)
          .then(function (r) { return (r && r.text) || ''; })
          .catch(function () { return ''; });
      }

      function respond(text) {
        text = String(text || '').trim();
        if (!text) return;
        var my = gen;
        var src = C.scriptOf(text) || freeSpeak;
        frBubble('<div class="' + src + '">' + esc(text) + '</div>', 'B');
        var wait = frBubble('<span class="spin"></span> Thinking…', 'A');
        freeTurns++;

        if (src === 'ta') {
          /* Tamil: teach how to say it, in the language being learnt. */
          var other = learn === 'en' ? 'hi' : 'en';
          Promise.all([translate(text, 'ta', learn), translate(text, 'ta', other)]).then(function (tr) {
            if (!alive(my) || !wait) return;
            var said = tr[0];
            if (!said) {
              wait.innerHTML = '<div class="tk-who">Tutor</div><div class="msg msg-warn">Translating needs an internet '
                + 'connection, and it could not be reached. Try again in a moment.</div>';
              return;
            }
            var line = { ta: text }; line[learn] = said; line[other] = tr[1];
            wait.innerHTML = '<div class="tk-who">Tutor</div>'
              + '<div class="ta small">இதை ' + IN_TAMIL[learn] + ' இப்படிச் சொல்லலாம்:</div>'
              + '<div class="' + learn + ' tk-line">' + esc(said) + speakBtn(said, learn) + '</div>'
              + readAid(said, learn, true)
              + (tr[1] ? '<div class="tk-mean"><span class="tiny muted">' + LANG_NAME[other] + '</span> <span class="' + other + '">'
                  + esc(tr[1]) + '</span></div>' : '')
              + '<div class="row mt">'
              + (canHear ? '<button class="btn btn-primary btn-sm" data-frmic="1" type="button">\u{1F3A4} Now you say it</button>' : '')
              + '</div><div data-frheard></div>';
            wait.__line = line;
            say(said, learn);
          });
          return;
        }

        /* English or Hindi: check it, explain it, answer it. */
        var check = src === 'en' && TB.Check ? TB.Check.check(text, 'en') : null;
        var fixed = check && check.changed ? check.corrected : '';
        translate(fixed || text, src, 'ta').then(function (meaning) {
          if (!alive(my) || !wait) return;
          var q = C.followUp(text, freeTurns);
          var issues = check ? (check.issues || []).filter(function (x) { return !x.soft || x.type !== 'punctuation'; }) : [];
          wait.innerHTML = '<div class="tk-who">Tutor</div>'
            + (fixed
                ? '<div class="tk-fix"><div class="tiny muted">Better:</div><div class="en tk-line">' + esc(fixed)
                  + speakBtn(fixed, 'en') + '</div>'
                  + issues.slice(0, 3).map(function (x) {
                      return '<div class="tiny">• ' + esc(x.ta || '') + '</div>';
                    }).join('') + '</div>'
                : '<div class="tiny" style="color:var(--green)">✓ Well said.</div>')
            + (meaning ? '<div class="tk-mean"><span class="tiny muted">தமிழ்</span> <span class="ta">' + esc(meaning) + '</span></div>' : '')
            + '<div class="mt"><div class="' + learn + ' tk-line">' + esc(q[learn]) + speakBtn(q[learn], learn) + '</div>'
            + readAid(q[learn], learn, true)
            + '<div class="tk-mean"><span class="tiny muted">தமிழ்</span> <span class="ta">' + esc(q.ta) + '</span></div>'
            + (learn === 'hi' ? '<div class="tk-mean"><span class="tiny muted">English</span> <span>' + esc(q.en) + '</span></div>' : '')
            + '</div>';
          var dd = D(); dd.stats.xp = (dd.stats.xp || 0) + 2; saveD(dd);
          TB.App.refreshChips();
          (fixed ? say(fixed, 'en') : Promise.resolve()).then(function () {
            if (alive(my)) say(q[learn], learn);
          });
        });
      }

      function listenFree() {
        if (busy) return;
        var stat = root.querySelector('#frStat');
        var my = gen;
        busy = true;
        TB.Speech.stop();
        stat.textContent = '\u{1F3A4} Listening in ' + LANG_NAME[freeSpeak] + '…';
        TB.Speech.listen(freeSpeak, {
          maxMs: 10000,
          onInterim: function (t) { if (alive(my)) stat.textContent = '\u{1F3A4} ' + t; }
        }).then(function (h) {
          if (!alive(my)) return;
          busy = false;
          stat.textContent = '';
          if (h.text) respond(h.text);
          else stat.textContent = 'Nothing was heard. Try again, close to the microphone.';
        }).catch(function (e) {
          if (!alive(my)) return;
          busy = false;
          stat.textContent = e.message;
        });
      }

      function repeatAfter(bubbleEl) {
        if (busy || !bubbleEl || !bubbleEl.__line) return;
        var line = bubbleEl.__line;
        var out = bubbleEl.querySelector('[data-frheard]');
        var my = gen;
        busy = true;
        TB.Speech.stop();
        out.innerHTML = '<div class="tiny muted mt">\u{1F3A4} Listening…</div>';
        TB.Speech.listen(learn, { maxMs: 9000 }).then(function (h) {
          if (!alive(my)) return;
          busy = false;
          if (!h.text) { out.innerHTML = '<div class="tiny muted mt">Nothing was heard — try again.</div>'; return; }
          var r = C.judge(line, learn, h);
          var fb = C.feedback(r.score);
          out.innerHTML = '<div class="tk-result tk-' + fb.tone + ' mt"><b>' + r.score + '/100</b> '
            + '<span class="tiny muted">You said: ' + esc(r.heard) + '</span>'
            + '<div class="mt">' + wordsHtml(r) + '</div>'
            + '<div class="ta small mt">' + esc(fb.ta) + '</div></div>';
        }).catch(function (e) {
          if (!alive(my)) return;
          busy = false;
          out.innerHTML = '<div class="msg msg-err mt">' + esc(e.message) + '</div>';
        });
      }

      /* ============================================================ wiring */
      function draw() {
        stopAll();
        if (tab === 'free') free(); else scenes();
      }

      root.querySelector('#tkTabs').addEventListener('click', function (e) {
        var b = e.target.closest('[data-tab]');
        if (!b) return;
        root.querySelectorAll('#tkTabs .pill').forEach(function (x) { x.classList.toggle('on', x === b); });
        tab = b.getAttribute('data-tab');
        active = null;
        draw();
      });

      root.querySelector('#tkLang').addEventListener('click', function (e) {
        var b = e.target.closest('[data-lang]');
        if (!b) return;
        root.querySelectorAll('#tkLang .pill').forEach(function (x) { x.classList.toggle('on', x === b); });
        learn = b.getAttribute('data-lang');
        if (freeSpeak !== 'ta') freeSpeak = learn;
        saveLevel();
        if (active) start(active.id); else draw();
      });

      /* One delegated listener on this view's own body: it is replaced with
         the view, so nothing outlives a visit. */
      body.addEventListener('click', function (e) {
        var t;
        if ((t = e.target.closest('[data-level]'))) {
          level = +t.getAttribute('data-level'); saveLevel(); scenes(); return;
        }
        if (e.target.closest('#tkFind')) { findScenes(); return; }
        if ((t = e.target.closest('[data-scene]'))) { start(t.getAttribute('data-scene')); return; }
        if ((t = e.target.closest('[data-next]'))) { start(t.getAttribute('data-next')); return; }
        if (e.target.closest('#tkBack')) { stopAll(); active = null; scenes(); return; }
        if ((t = e.target.closest('.tk-target.tk-hidden'))) {
          var card = t.closest('.tk-your');
          (card ? card.querySelectorAll('.tk-hidden') : [t]).forEach(function (x) { x.classList.remove('tk-hidden'); });
          return;
        }

        if ((t = e.target.closest('[data-act]')) && active) {
          var act = t.getAttribute('data-act');
          var line = active.lines[turn];
          if (act === 'again') { start(active.id); return; }
          if (!line) return;
          if (act === 'hear') { TB.Speech.stop(); say(line[learn], learn); return; }
          if (act === 'slow') { TB.Speech.stop(); say(line[learn], learn, true); return; }
          if (act === 'mic') { listenFor(line); return; }
          if (act === 'said') { moveOn(null, ''); return; }
          if (act === 'skip') { results.push({ line: line, score: null }); turn++; root.querySelector('#tkTurn').innerHTML = ''; advance(); return; }
          if (act === 'next') { moveOn(pending ? pending.score : null, pending ? pending.heard : ''); return; }
        }

        /* free talk */
        if ((t = e.target.closest('[data-sp]'))) {
          freeSpeak = t.getAttribute('data-sp');
          root.querySelectorAll('#frSpeak .pill').forEach(function (x) { x.classList.toggle('on', x === t); });
          return;
        }
        if (e.target.closest('#frSend')) {
          var inp = root.querySelector('#frText');
          respond(inp.value); inp.value = ''; return;
        }
        if (e.target.closest('#frMic')) { listenFree(); return; }
        if ((t = e.target.closest('[data-frmic]'))) { repeatAfter(t.closest('.tk-bubble')); return; }
      });

      body.addEventListener('change', function (e) {
        if (e.target && e.target.id === 'tkHide') {
          hide = !!e.target.checked;
          if (active && active.lines[turn] && active.lines[turn].who === 'B') yourTurn(active.lines[turn]);
        }
      });

      body.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        if (e.target.id === 'tkWant') { e.preventDefault(); findScenes(); }
        if (e.target.id === 'frText') { e.preventDefault(); respond(e.target.value); e.target.value = ''; }
      });

      draw();
    }
  };
})();
