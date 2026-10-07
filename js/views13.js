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

  /* Whether the server's AI tutor is switched on: null until asked, then
     true or false for the rest of the page's life. */
  var aiState = null;

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
      /* Everything the tutor says is counted, so a voice conversation knows
         when the tutor has finished and it is the learner's turn to speak —
         opening the microphone while the tutor is still talking would hear
         the tutor. */
      var speaking = 0, lastSpoke = 0;
      function track(p) {
        speaking++;
        return Promise.resolve(p).catch(function () { return false; }).then(function (v) {
          speaking = Math.max(0, speaking - 1);
          lastSpoke = Date.now();
          return v;
        });
      }
      function say(text, lang, slow) {
        return track(TB.Speech.speak(text, lang, sayOpts(slow ? { rate: 0.62 } : null)));
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

      function stopAll() { gen++; busy = false; live = false; liveGen++; liveAbort(); hush(); }
      /* Each answer the tutor gives is a turn. A long answer is said in
         parts, one after another; stopping only the part being spoken let the
         next part start anyway — the tutor talked on after End, and the rest
         of an old answer cut off a new one. Every part now checks it still
         belongs to the latest turn. */
      var talkId = 0;
      function hush() { talkId++; TB.Speech.stop(); }
      function on(my, t) { return alive(my) && t === talkId; }
      var live = false, liveGen = 0, liveMiss = 0;   /* the voice conversation */

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
          /* the same six levels as the conversations, beginner to
             native-like: the tutor teaches to the one chosen */
          + '<div class="row mb"><span class="tiny muted">My level:</span>'
          + '<div class="pill-row" id="frLevels">'
          + (TB.TALK_LEVELS || []).map(function (L) {
              return '<button class="pill' + (L.n === level ? ' on' : '') + '" data-level="' + L.n + '" type="button" title="'
                + esc(L.en) + '">' + esc(L.cefr) + ' · <span class="ta tiny">' + esc(L.ta) + '</span></button>';
            }).join('')
          + '</div></div>'
          + (canHear
              ? '<div class="row mb"><button class="btn btn-primary" id="frLive" type="button">\u{1F399}️ Start a voice conversation</button>'
                + '<span id="frLiveStat" class="small muted" aria-live="polite"></span></div>'
              : '')
          + '<div class="row"><span class="tiny muted">I will speak in:</span>'
          + '<div class="pill-row" id="frSpeak">'
          +   '<button class="pill' + (freeSpeak === 'ta' ? ' on' : '') + '" data-sp="ta" type="button">தமிழ்</button>'
          +   '<button class="pill' + (freeSpeak === learn ? ' on' : '') + '" data-sp="' + learn + '" type="button">' + LANG_NAME[learn] + '</button>'
          + '</div></div>'
          + '<div class="tiny muted mt">Say anything. In Tamil, and you learn how to say it in '
          +   LANG_NAME[learn] + '. In ' + LANG_NAME[learn] + ', and it is checked, explained in Tamil, and answered.'
          +   ' <span id="frMode">' + modeText() + '</span></div>'
          + '</div>'
          + '<div class="card tk-chat" id="frChat">'
          +   '<div class="tk-bubble tk-A"><div class="tk-who">Tutor</div>'
          +   '<div class="ta tk-say">வணக்கம்! நான் உங்கள் ஆசிரியர். "எனக்கு ' + LNAME_TA[learn] + ' கற்றுக்கொடுங்கள்" என்று '
          +     'சொல்லுங்கள், அல்லது தமிழில் எதையாவது சொல்லுங்கள் — அதை ' + IN_TAMIL[learn] + ' எப்படிச் சொல்வது என்று கற்றுத் தருகிறேன்.</div>'
          +   '<div class="tiny muted">Hello! I am your tutor. Ask me to teach you, or say anything.</div>'
          +   starterChips() + '</div>'
          + '</div>'
          + '<div class="card"><div class="row">'
          +   '<input id="frText" type="text" placeholder="Type or speak anything…" aria-label="What you want to say" style="flex:1;min-width:180px">'
          +   (canHear ? '<button class="btn btn-sm" id="frMic" type="button">\u{1F3A4}</button>' : '')
          +   '<button class="btn btn-primary btn-sm" id="frSend" type="button">Send</button>'
          + '</div><div id="frStat" class="tiny muted mt"></div></div>';
        checkAi();
      }

      /* ---------------------------------------------- the AI tutor

         When the server has a language model switched on, free talk is
         answered by it: it understands whatever was said, in Tamil, English
         or Hindi, answers it as a teacher would, corrects mistakes and keeps
         the conversation going. The last few turns go with each message so it
         can follow along. If it is off, busy or unreachable, the browser's own
         tutor answers instead, so a message is never left unanswered. */
      var talkLog = [];

      function modeText() {
        return aiState ? '<b>AI tutor on.</b>' : '';
      }

      function checkAi() {
        if (aiState !== null || !TB.Sync || !TB.Sync.health) return;
        var my = gen;
        TB.Sync.health().then(function (h) {
          if (aiState === null) aiState = !!(h && h.tutor);
          var m = alive(my) && root.querySelector('#frMode');
          if (m) m.innerHTML = modeText();
        });
      }

      function asItem(target, ta, en) {
        var o = { ta: ta || '', en: en || '' };
        o[learn] = target;
        return o;
      }

      /* A teacher thinking aloud. In a voice conversation the answer takes
         several seconds, and silence that long sounds like the line has gone
         dead — so after a moment the tutor says something small, the way a
         person does, varied so it is not the same words every time. A
         beginner hears it in Tamil. */
      var FILL = {
        ta: ['ம்ம்… ஒரு நொடி.', 'சரி… யோசிக்கிறேன்.', 'நல்லது, ஒரு நொடி.', 'ம்ம், பார்க்கலாம்.'],
        en: ['Hmm, let me see.', 'Okay, one moment.', 'Good. Let me think.', 'Right, just a second.'],
        hi: ['हम्म, एक पल।', 'अच्छा, एक सेकंड।', 'ठीक है, सोचती हूँ।', 'बढ़िया, एक पल।']
      };
      var fillN = 0;

      function askAi(b, my, t) {
        var answered = false;
        if (live) {
          setTimeout(function () {
            /* never over anything else, and never for a turn already passed */
            if (answered || !live || !on(my, t) || speaking > 0) return;
            var lang = level <= 2 ? 'ta' : learn;
            say(FILL[lang][fillN++ % FILL[lang].length], lang);
          }, 3000);
        }
        return TB.Sync.tutor({ learn: learn, level: level, voice: !!live, history: talkLog.slice(-10) }).then(function (r) {
          answered = true;
          if (alive(my)) showAi(b, r, my, t);
        }, function (e) {
          answered = true;
          if (/not switched on/i.test((e && e.message) || '')) aiState = false;
          throw e;
        });
      }

      function showAi(b, r, my, t) {
        var teach = (r.teach || []).map(function (x) { return asItem(x.target, x.ta, x.en); });
        var nxt = r.next && r.next.target ? asItem(r.next.target, r.next.ta, r.next.en) : null;
        var fix = r.correction && r.correction.corrected ? r.correction : null;

        /* Every line in the language being learnt carries its captions: how
           to read it in English letters and in Tamil letters, and — for Hindi
           — what it means in English as well as in Tamil. */
        var html = '<div class="tk-who">Tutor</div>' + tutorText(r.reply_ta || '', r.reply_target || '');
        if (r.reply_target) html += readAid(r.reply_target, learn, true);
        if (learn === 'hi' && r.reply_en) {
          html += '<div class="tk-mean"><span class="tiny muted">English</span> <span>' + esc(r.reply_en) + '</span></div>';
        }
        if (fix) {
          html += '<div class="mt">' + tutorText('சரியான வடிவம்:', learn === 'hi' ? 'सही रूप:' : 'The right way to say it:')
            + '<div class="' + learn + ' tk-line">' + esc(fix.corrected) + speakBtn(fix.corrected, learn) + '</div>'
            + readAid(fix.corrected, learn, true)
            + (fix.why_ta ? '<div class="ta tiny">• ' + esc(fix.why_ta) + '</div>' : '') + '</div>';
        }
        html += teach.map(itemHtml).join('');
        if (nxt) {
          html += '<div class="mt">' + tutorText('இப்போது நீங்கள் சொல்லுங்கள்:', learn === 'hi' ? 'अब आप बोलिए:' : 'Now you say:')
            + itemHtml(nxt) + '</div>';
        }
        /* the line to say back: what to say next, else the first thing
           taught, else the corrected sentence */
        var practise = nxt || teach[0] || (fix ? asItem(fix.corrected, '', '') : null);
        if (practise) { b.__line = practise; lastItem = practise; html += practiceRow(false); }
        queue = []; qi = 0;
        b.innerHTML = html;

        talkLog.push({ role: 'tutor', text: [r.reply_target, r.reply_ta]
          .concat(teach.map(function (x) { return x[learn]; }))
          .concat(nxt ? [nxt[learn]] : []).filter(Boolean).join('\n') });

        /* What is said aloud. In a voice conversation a beginner hears the
           explanation in Tamil — an English sentence they cannot follow
           teaches nothing — and then the line to say, slowly. From the
           intermediate levels up the tutor talks in the language being
           learnt, as a teacher of it would. */
        var spoken = [];
        var tamilVoice = live && level <= 2 && r.reply_ta;
        if (tamilVoice) spoken.push([r.reply_ta, 'ta']);
        if (fix) spoken.push([fix.corrected, learn]);
        if (r.reply_target && !tamilVoice) spoken.push([r.reply_target, learn]);
        if (nxt) spoken.push([nxt[learn], learn, live && level <= 3]);
        spoken.reduce(function (p, s) {
          return p.then(function () { if (on(my, t)) return say(s[0], s[1], s[2]); });
        }, Promise.resolve());
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

      /* ------------------------------------------- the tutor's voice

         Free talk answers what was asked. A request to be taught is met with
         "Sure — I will teach you", then a lesson, one line at a time, each
         heard, read, understood and said back. A request for words gets
         words. "How do I say…" gets the answer. Hello gets hello. Anything
         else said in the language being learnt is checked and answered with a
         question it has not already asked. */
      var LNAME_TA = { en: 'ஆங்கிலம்', hi: 'இந்தி' };
      /* before a noun the name bends: ஆங்கிலச் சொற்கள், not ஆங்கிலம் சொற்கள் */
      var LADJ_TA = { en: 'ஆங்கிலச்', hi: 'இந்திச்' };
      var queue = [], qi = 0, lastItem = null, asked = {}, wordsPage = 0;

      function tutorText(ta, target) {
        return '<div class="ta tk-say">' + esc(ta) + '</div>'
          + (target ? '<div class="' + learn + ' tk-say2">' + esc(target) + '</div>' : '');
      }

      /* One thing to learn: the line, how to read it, what it means. */
      function itemHtml(item) {
        var t = item[learn];
        return '<div class="tk-item">'
          + '<div class="' + learn + ' tk-line">' + esc(t) + speakBtn(t, learn) + '</div>'
          + readAid(t, learn, true)
          + '<div class="tk-mean"><span class="tiny muted">தமிழ்</span> <span class="ta">' + esc(item.ta || '') + '</span></div>'
          + (learn === 'hi' && item.en ? '<div class="tk-mean"><span class="tiny muted">English</span> <span>' + esc(item.en) + '</span></div>' : '')
          + '</div>';
      }

      function practiceRow(withNext) {
        return '<div class="row mt tk-actions">'
          + (canHear ? '<button class="btn btn-primary btn-sm" data-frmic="1" type="button">\u{1F3A4} Say it after me</button>' : '')
          + '<button class="btn btn-sm" data-frslow="1" type="button">\u{1F422} Slowly</button>'
          + (withNext ? '<button class="btn btn-sm" data-say="next" type="button">Next ▶</button>' : '')
          + '</div><div data-frheard></div>';
      }

      function chips(list) {
        return '<div class="pill-row mt tk-chips">' + list.map(function (c) {
          return '<button class="pill tk-chip" data-say="' + esc(c) + '" type="button">' + esc(c) + '</button>';
        }).join('') + '</div>';
      }

      function starterChips() {
        var L = learn === 'hi' ? 'Hindi' : 'English';
        return chips(['Teach me ' + L, 'Give me some ' + L + ' words', 'Words about food',
                      'How do I say good morning in ' + L + '?', learn === 'hi' ? 'Teach me English' : 'Teach me Hindi']);
      }

      /* Change the language being taught when the learner asks for the other
         one — "teach me Hindi" while English is selected means Hindi. */
      function switchTo(lang) {
        if ((lang !== 'en' && lang !== 'hi') || lang === learn) return false;
        learn = lang;
        if (freeSpeak !== 'ta') freeSpeak = learn;
        saveLevel();
        root.querySelectorAll('#tkLang .pill').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-lang') === learn);
        });
        return true;
      }

      function present(bubbleEl, item, intro) {
        lastItem = item;
        bubbleEl.__line = item;
        bubbleEl.innerHTML = '<div class="tk-who">Tutor</div>' + (intro || '') + itemHtml(item)
          + practiceRow(qi < queue.length);
        return say(item[learn], learn, true);
      }

      function nextItem(bubbleEl) {
        if (!queue.length) {
          bubbleEl.innerHTML = '<div class="tk-who">Tutor</div>'
            + tutorText('எதைக் கற்றுக்கொள்ள விரும்புகிறீர்கள்? அன்றாட வாக்கியங்கள், அல்லது உணவு, குடும்பம், எண்கள் பற்றிய சொற்கள் — எதுவாக இருந்தாலும் சொல்லுங்கள்.',
                        learn === 'hi' ? 'आप क्या सीखना चाहेंगे?' : 'What would you like to learn?')
            + starterChips();
          return;
        }
        if (qi >= queue.length) {
          bubbleEl.innerHTML = '<div class="tk-who">Tutor</div>'
            + tutorText('அருமை! இந்தப் பகுதியை முடித்துவிட்டீர்கள். அடுத்து எதைக் கற்கலாம்?',
                        learn === 'hi' ? 'शाबाश! यह हिस्सा पूरा हो गया।' : 'Well done! You finished this part.')
            + chips(['Words about family', 'Words about numbers', 'Words about colours', 'Teach me more sentences']);
          queue = []; qi = 0;
          return;
        }
        var n = qi + 1, total = queue.length;
        var item = queue[qi++];
        present(bubbleEl, item, '<div class="tiny muted">' + n + ' / ' + total + '</div>');
      }

      /* A question for what was said, never one already asked this session. */
      function freshQuestion(text) {
        for (var k = 0; k < 8; k++) {
          var q = C.followUp(text, freeTurns + k);
          if (!asked[q.en]) { asked[q.en] = 1; return q; }
        }
        for (k = 0; k < 4; k++) {
          var f = C.followUp('', freeTurns + k);
          if (!asked[f.en]) { asked[f.en] = 1; return f; }
        }
        asked = {};
        return C.followUp(text, freeTurns);
      }

      function respond(text) {
        text = String(text || '').trim();
        if (!text) return;
        var my = gen;
        var it = C.intent(text);
        if (it.kind !== 'next' || text.toLowerCase() !== 'next') {
          frBubble('<div class="' + (C.scriptOf(text) || 'en') + '">' + esc(text) + '</div>', 'B');
        }
        var b = frBubble('<span class="spin"></span>', 'A');
        if (!b) return;
        /* a new turn: whatever the tutor was still saying stops, and an open
           microphone of the voice conversation is closed before the tutor
           answers — or it would hear the tutor and answer itself */
        var t = ++talkId;
        if (live) { liveAbort(); afterTurn(liveGen); }
        freeTurns++;
        var dd = D(); dd.stats.xp = (dd.stats.xp || 0) + 1; saveD(dd);
        TB.App.refreshChips();

        talkLog.push({ role: 'user', text: text });
        /* "next" through a lesson already on screen, and "again", are
           answered here at once; everything else goes to the AI tutor when
           it is on. */
        var here = (it.kind === 'next' && queue.length) || (it.kind === 'repeat' && lastItem);
        if (aiState && !here && TB.Sync && TB.Sync.tutor) {
          if (it.kind === 'teach' || it.kind === 'words' || it.kind === 'howsay') switchTo(it.lang);
          askAi(b, my, t).catch(function () { if (alive(my)) answerHere(text, it, b, my, t); });
          return;
        }
        answerHere(text, it, b, my, t);
      }

      /* The browser's own tutor. */
      function answerHere(text, it, b, my, t) {
        if (it.kind === 'next') { nextItem(b); return; }

        if (it.kind === 'repeat') {
          if (!lastItem) {
            b.innerHTML = '<div class="tk-who">Tutor</div>'
              + tutorText('எதை மீண்டும் சொல்ல வேண்டும்? ஒரு வாக்கியத்தைத் தட்டச்சு செய்யுங்கள், மெதுவாகச் சொல்கிறேன்.', '');
            return;
          }
          present(b, lastItem, tutorText('சரி, மெதுவாக மீண்டும் சொல்கிறேன்:', learn === 'hi' ? 'धीरे-धीरे फिर से:' : 'Once more, slowly:'));
          return;
        }

        /* "Talk with me in English": a conversation. The tutor asks, the
           learner answers. An answer in the language being learnt is checked,
           corrected and answered with the next question; an answer in Tamil
           is taught — this is how you say it — so nobody is stuck for words. */
        if (it.kind === 'converse') {
          switchTo(it.lang);
          queue = []; qi = 0;
          var q0 = freshQuestion(text);
          var hiTalk = learn === 'hi' ? 'ठीक है, चलिए बात करते हैं! मैं पूछूँगी, आप हिंदी में जवाब दीजिए।'
                                      : 'Sure, let’s talk! I’ll ask, and you answer in English.';
          lastItem = q0;
          b.__line = q0;
          b.innerHTML = '<div class="tk-who">Tutor</div>'
            + tutorText('சரி, பேசலாம்! நான் ' + IN_TAMIL[learn] + ' கேட்கிறேன், நீங்கள் ' + IN_TAMIL[learn]
                + ' பதில் சொல்லுங்கள். எப்படிச் சொல்வது என்று தெரியவில்லை என்றால் தமிழில் சொல்லுங்கள் — '
                + IN_TAMIL[learn] + ' எப்படிச் சொல்வது என்று கற்றுத் தருகிறேன்.', hiTalk)
            + '<div class="mt">' + itemHtml(q0) + '</div>'
            + chips(learn === 'hi' ? ['मैं ठीक हूँ', 'मैं चेन्नई से हूँ', 'நான் நன்றாக இருக்கிறேன்']
                                   : ['I am fine, thank you', 'I am from Chennai', 'நான் நன்றாக இருக்கிறேன்']);
          say(hiTalk, learn).then(function () { if (on(my, t)) say(q0[learn], learn); });
          return;
        }

        if (it.kind === 'teach') {
          if (it.lang === 'ta') {
            b.innerHTML = '<div class="tk-who">Tutor</div>'
              + tutorText('இந்தத் தளம் தமிழ் வழியாக ஆங்கிலமும் இந்தியும் கற்றுத் தருகிறது. எதைக் கற்க விரும்புகிறீர்கள்?', '')
              + chips(['Teach me English', 'Teach me Hindi']);
            return;
          }
          switchTo(it.lang);
          queue = C.lesson(it.theme); qi = 0;
          var topic = it.theme ? (C.THEME_NAMES[it.theme] || '') + ' பற்றிய சொற்களிலிருந்து' : 'அன்றாடம் பேசும் வாக்கியங்களிலிருந்து';
          var intro = tutorText('நிச்சயமாக! நான் உங்களுக்கு ' + LNAME_TA[learn] + ' கற்றுத் தருகிறேன். '
              + topic + ' தொடங்குவோம். ஒவ்வொன்றையும் கேளுங்கள், பிறகு நீங்களே சொல்லுங்கள்.',
              learn === 'hi' ? 'ज़रूर! चलिए हिंदी सीखते हैं। सुनिए, फिर मेरे बाद बोलिए।'
                             : 'Sure! Let’s learn English. Listen, then say it after me.');
          var first = queue[qi++];
          if (!first) { b.innerHTML = '<div class="tk-who">Tutor</div>' + intro; return; }
          /* counted now: by the time the voice finishes, another message
             may have started something else */
          var total = queue.length;
          say(learn === 'hi' ? 'ज़रूर! चलिए हिंदी सीखते हैं।' : 'Sure! Let’s learn English.', learn).then(function () {
            if (on(my, t)) present(b, first, intro + '<div class="tiny muted mt">1 / ' + total + '</div>');
          });
          b.innerHTML = '<div class="tk-who">Tutor</div>' + intro;
          return;
        }

        if (it.kind === 'words') {
          switchTo(it.lang);
          var list = C.someWords(it.theme, 6, wordsPage++);
          queue = list.slice(); qi = 0;
          b.innerHTML = '<div class="tk-who">Tutor</div>'
            + tutorText('இதோ சில ' + LADJ_TA[learn] + ' சொற்கள்' + (it.theme ? ' — ' + (C.THEME_NAMES[it.theme] || '') : '') + ':',
                        learn === 'hi' ? 'ये कुछ शब्द सीखिए:' : 'Here are some words to learn:')
            + list.map(itemHtml).join('')
            + tutorText('இப்போது ஒவ்வொன்றாகப் பயிற்சி செய்யலாம்.', '')
            + chips(['next', 'More words', 'Words about animals']);
          track(TB.Speech.sequence(list.map(function (w) { return { text: w[learn], lang: learn, rate: 0.75, pause: 500 }; }), sayOpts()));
          return;
        }

        if (it.kind === 'greet') {
          var hello = learn === 'hi' ? 'नमस्ते! आपसे मिलकर ख़ुशी हुई। आज आप क्या सीखना चाहेंगे?'
                                     : 'Hello! It’s lovely to meet you. What would you like to learn today?';
          b.innerHTML = '<div class="tk-who">Tutor</div>'
            + tutorText('வணக்கம்! உங்களைச் சந்தித்ததில் மகிழ்ச்சி. இன்று என்ன கற்றுக்கொள்ள விரும்புகிறீர்கள்?', hello)
            + readAid(hello, learn, true) + starterChips();
          say(hello, learn);
          return;
        }
        if (it.kind === 'thanks') {
          var yw = learn === 'hi' ? 'आपका स्वागत है! आगे बढ़ें?' : 'You’re welcome! Shall we keep going?';
          b.innerHTML = '<div class="tk-who">Tutor</div>' + tutorText('மகிழ்ச்சி! தொடரலாமா?', yw) + chips(['next', 'Give me some words']);
          say(yw, learn);
          return;
        }
        if (it.kind === 'bye') {
          var by = learn === 'hi' ? 'फिर मिलेंगे! रोज़ थोड़ा अभ्यास कीजिए।' : 'Goodbye! Practise a little every day. See you soon!';
          b.innerHTML = '<div class="tk-who">Tutor</div>' + tutorText('போய் வாருங்கள்! தினமும் கொஞ்சம் பயிற்சி செய்யுங்கள்.', by);
          say(by, learn);
          return;
        }

        if (it.kind === 'meaning') {
          var mfrom = C.scriptOf(it.phrase) || 'en';
          var other = mfrom === 'hi' ? 'en' : 'hi';
          Promise.all([translate(it.phrase, mfrom, 'ta'), mfrom === 'ta' ? Promise.resolve('') : translate(it.phrase, mfrom, other)])
            .then(function (tr) {
              if (!alive(my)) return;
              if (!tr[0]) { b.innerHTML = '<div class="tk-who">Tutor</div>' + offline(); return; }
              b.innerHTML = '<div class="tk-who">Tutor</div>'
                + tutorText('"' + it.phrase + '" என்றால்:', '')
                + '<div class="ta tk-line">' + esc(tr[0]) + '</div>'
                + (tr[1] ? '<div class="tk-mean"><span class="tiny muted">' + LANG_NAME[other] + '</span> <span class="' + other + '">' + esc(tr[1]) + '</span></div>' : '')
                + chips(['How do I say "' + it.phrase + '" in ' + (learn === 'hi' ? 'Hindi' : 'English') + '?', 'Give me some words']);
            });
          return;
        }

        /* "How do I say…", a Tamil sentence, or the other language: teach
           the line in the language being learnt. */
        var phrase = it.kind === 'howsay' ? it.phrase : text;
        if (it.kind === 'howsay') switchTo(it.lang);
        var from = C.scriptOf(phrase) || 'en';
        if (it.kind === 'howsay' || from !== learn) {
          if (from === learn) {
            b.innerHTML = '<div class="tk-who">Tutor</div>'
              + tutorText('அது ஏற்கெனவே ' + LNAME_TA[learn] + ' — அதன் பொருள் இதோ:', '') ;
            translate(phrase, from, 'ta').then(function (m) {
              if (alive(my)) b.innerHTML += '<div class="ta tk-line">' + esc(m || '—') + '</div>';
            });
            return;
          }
          var also = from === 'ta' ? (learn === 'hi' ? 'en' : 'hi') : 'ta';
          Promise.all([translate(phrase, from, learn), translate(phrase, from, 'ta'), learn === 'hi' ? translate(phrase, from, 'en') : Promise.resolve('')])
            .then(function (tr) {
              if (!alive(my)) return;
              if (!tr[0]) { b.innerHTML = '<div class="tk-who">Tutor</div>' + offline(); return; }
              var item = { ta: from === 'ta' ? phrase : (tr[1] || ''), en: learn === 'hi' ? (from === 'en' ? phrase : tr[2]) : tr[0] };
              item[learn] = tr[0];
              queue = []; qi = 0;
              present(b, item, tutorText('"' + phrase + '" — இதை ' + IN_TAMIL[learn] + ' இப்படிச் சொல்லலாம்:',
                learn === 'hi' ? 'इसे हिंदी में ऐसे कहते हैं:' : 'In English, you say:'));
              b.insertAdjacentHTML('beforeend', chips(['Say it slowly', 'Give me some words', 'Teach me ' + (learn === 'hi' ? 'Hindi' : 'English')]));
            });
          return;
        }

        /* A sentence in the language being learnt: check it, say what it
           means, and answer it. */
        var check = learn === 'en' && TB.Check ? TB.Check.check(text, 'en') : null;
        var fixed = check && check.changed ? check.corrected : '';
        translate(fixed || text, learn, 'ta').then(function (meaning) {
          if (!alive(my)) return;
          var q = freshQuestion(text);
          var issues = check ? (check.issues || []).filter(function (x) { return x.type !== 'punctuation' && x.type !== 'capital'; }) : [];
          b.innerHTML = '<div class="tk-who">Tutor</div>'
            + (fixed && issues.length
                ? tutorText('நல்ல முயற்சி! ஒரு சிறு திருத்தம்:', 'Good try! A small correction:')
                  + '<div class="en tk-line">' + esc(fixed) + speakBtn(fixed, 'en') + '</div>'
                  + issues.slice(0, 3).map(function (x) { return '<div class="tiny">• ' + esc(x.ta || '') + '</div>'; }).join('')
                : tutorText('நன்றாகச் சொன்னீர்கள்!', learn === 'hi' ? 'बहुत अच्छा!' : 'Well said!'))
            + (meaning ? '<div class="tk-mean"><span class="tiny muted">தமிழ்</span> <span class="ta">' + esc(meaning) + '</span></div>' : '')
            + '<div class="mt">' + itemHtml(q) + '</div>';
          (fixed && issues.length ? say(fixed, 'en') : Promise.resolve()).then(function () {
            if (on(my, t)) say(q[learn], learn);
          });
        });
      }

      function offline() {
        return tutorText('இணைய இணைப்பு கிடைக்கவில்லை, அதனால் இதை இப்போது மொழிபெயர்க்க முடியவில்லை. சிறிது நேரத்தில் மீண்டும் முயலுங்கள்.',
                         'I could not reach the translator just now. Please try again in a moment.');
      }

      /* ------------------------------------------- the voice conversation

         Hands-free, the way a lesson with a teacher goes: the tutor speaks,
         and when it has finished the microphone opens by itself; the learner
         answers aloud; the tutor understands, corrects and answers aloud; and
         round again — until "stop", or the End button. */
      function liveStatus(t) {
        var s = root.querySelector('#frLiveStat');
        if (s) s.textContent = t;
      }

      /* The open microphone of the voice conversation, so it can be closed
         the moment the conversation ends, the page is left, or something
         else is about to make a sound the microphone would hear. */
      var liveRec = null, waitId = 0;
      function liveAbort() {
        if (!liveRec) return;
        var r = liveRec;
        liveRec = null;
        busy = false;
        try { r.abort(); } catch (e) {}
      }

      function liveSet(on) {
        live = on; liveGen++; liveMiss = 0;
        var btn = root.querySelector('#frLive');
        if (btn) {
          btn.textContent = on ? '⏹ End the voice conversation' : '\u{1F399}️ Start a voice conversation';
          btn.classList.toggle('btn-primary', !on);
          btn.classList.toggle('btn-live', on);
        }
        /* ending stops the microphone and the rest of whatever the tutor was
           saying — not only the sentence it was in the middle of */
        if (!on) { liveStatus(''); liveAbort(); hush(); }
      }

      function speakIn(lang) {
        freeSpeak = lang;
        root.querySelectorAll('#frSpeak .pill').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-sp') === lang);
        });
      }

      function liveToggle() {
        if (live) { liveSet(false); liveStatus('Voice conversation ended.'); return; }
        liveSet(true);
        var my = liveGen;
        /* Answers are practice, so they are heard in the language being
           learnt. The தமிழ் button is there for when the words will not come. */
        speakIn(learn);
        /* A first conversation is opened by the tutor; one already going
           simply carries on with the learner's turn. */
        if (!freeTurns) respond(learn === 'hi' ? 'हिंदी में बात करें' : 'Let us talk in English');
        afterTurn(my);
      }

      /* Wait for the tutor to finish — the answer drawn and every word of it
         spoken — then open the microphone. */
      function afterTurn(my) {
        var t0 = Date.now();
        /* one wait at a time: a newer one replaces any still going, so two
           microphones are never opened for one turn */
        var w = ++waitId;
        (function wait() {
          if (!live || my !== liveGen || w !== waitId || !body.isConnected) return;
          var chat = root.querySelector('#frChat');
          var thinking = !!(chat && chat.querySelector('.spin'));
          /* anything playing counts — a 🔊 button too, not only the tutor */
          var talking = speaking > 0 || Date.now() - lastSpoke < 700
            || !!(TB.Speech.isSpeaking && TB.Speech.isSpeaking());
          if ((thinking || talking) && Date.now() - t0 < 90000) {
            liveStatus(thinking ? '\u{1F4AD} Thinking…' : '\u{1F50A} Tutor is speaking…');
            setTimeout(wait, 250);
            return;
          }
          liveListen(my);
        })();
      }

      var STOP_WORDS = /^(stop|end|quit|finish|that'?s all|நிறுத்து|நிறுத்துங்கள்|போதும்|बंद करो|बस|रुको)[\s.!]*$/i;

      function liveListen(my) {
        if (!live || my !== liveGen || !body.isConnected) return;
        if (busy) { setTimeout(function () { afterTurn(my); }, 500); return; }
        busy = true;
        liveStatus('\u{1F3A4} Your turn — speak in ' + LANG_NAME[freeSpeak] + '…');
        var rec = null;
        TB.Speech.listen(freeSpeak, {
          maxMs: 12000,
          onStart: function (r) { rec = r; liveRec = r; },
          onInterim: function (t) { if (live && my === liveGen) liveStatus('\u{1F3A4} ' + t); }
        }).then(function (h) {
          /* only a listen that is still this conversation's, on this page,
             touches anything — one from before End or from another visit
             must not reopen a microphone wherever the learner is now */
          if (!live || my !== liveGen || !body.isConnected || (rec && liveRec !== rec)) return;
          liveRec = null; busy = false;
          var said = String(h.text || '').trim();
          if (!said) return missed(my);
          liveMiss = 0;
          if (STOP_WORDS.test(said)) { liveSet(false); liveStatus('Voice conversation ended.'); return; }
          respond(said);                       /* and respond() waits for the next turn */
        }, function (e) {
          if (!live || my !== liveGen || !body.isConnected || (rec && liveRec !== rec)) return;
          liveRec = null; busy = false;
          /* silence is a missed turn, not the end of the conversation */
          if (/no speech/i.test(e.message || '')) return missed(my);
          liveSet(false);
          liveStatus(e.message);
        });
      }

      function missed(my) {
        if (!live || my !== liveGen || !body.isConnected) return;
        liveMiss++;
        if (liveMiss >= 3) {
          liveSet(false);
          liveStatus('I could not hear you, so I have paused. Tap Start when you are ready.');
          return;
        }
        /* the second time, offer Tamil: often the words are the problem,
           not the microphone */
        if (liveMiss === 2 && freeSpeak !== 'ta') {
          liveStatus('Not sure what to say? Tap தமிழ் and say it in Tamil — I will teach you.');
          say(learn === 'hi' ? 'कोई बात नहीं। आप तमिल में भी बोल सकते हैं।' : 'No problem. You can say it in Tamil too.', learn);
        } else {
          liveStatus('I didn’t catch that — please say it again.');
        }
        /* through the same wait as every turn: the microphone opens only
           once nothing is being said and nothing is being thought */
        afterTurn(my);
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
          level = +t.getAttribute('data-level'); saveLevel();
          /* in free talk the level only changes how the tutor teaches; the
             conversation carries on */
          if (tab === 'free') {
            root.querySelectorAll('#frLevels .pill').forEach(function (x) { x.classList.toggle('on', x === t); });
            return;
          }
          scenes(); return;
        }
        if (e.target.closest('#frLive')) { liveToggle(); return; }
        /* A sound started in the middle of a voice conversation — a 🔊, or
           "Slowly" — closes the open microphone first, or it would hear it
           and take it for the learner; the next turn waits for it to end. */
        if (live && e.target.closest('[data-speak], [data-frslow]')) { liveAbort(); afterTurn(liveGen); }
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
        if ((t = e.target.closest('[data-frslow]'))) {
          var bub = t.closest('.tk-bubble');
          if (bub && bub.__line) { TB.Speech.stop(); say(bub.__line[learn], learn, true); }
          return;
        }
        if ((t = e.target.closest('[data-say]'))) { TB.Speech.stop(); respond(t.getAttribute('data-say')); return; }
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
