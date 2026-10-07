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
        freeTurns++;
        var dd = D(); dd.stats.xp = (dd.stats.xp || 0) + 1; saveD(dd);
        TB.App.refreshChips();

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
          say(learn === 'hi' ? 'ज़रूर! चलिए हिंदी सीखते हैं।' : 'Sure! Let’s learn English.', learn).then(function () {
            if (alive(my)) present(b, first, intro + '<div class="tiny muted mt">1 / ' + queue.length + '</div>');
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
          TB.Speech.sequence(list.map(function (w) { return { text: w[learn], lang: learn, rate: 0.75, pause: 500 }; }), sayOpts());
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
            if (alive(my)) say(q[learn], learn);
          });
        });
      }

      function offline() {
        return tutorText('இணைய இணைப்பு கிடைக்கவில்லை, அதனால் இதை இப்போது மொழிபெயர்க்க முடியவில்லை. சிறிது நேரத்தில் மீண்டும் முயலுங்கள்.',
                         'I could not reach the translator just now. Please try again in a moment.');
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
