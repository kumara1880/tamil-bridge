/* Tamil Bridge — the sentence tutor.
   Takes a sentence in English, Hindi or Tamil and produces a full breakdown:
   word-by-word gloss, part of speech, tense, sentence type, subject/verb/object,
   the word-order shift between SVO and SOV, and an explanation written in Tamil.
   Pure rules + lexicon — deterministic, offline, and free.                     */
window.TB = window.TB || {};

TB.Tutor = (function () {

  /* ------------------------------------------------------------- helpers */
  var POS_TA = {
    pron: 'pronoun', noun: 'noun', verb: 'verb', aux: 'auxiliary',
    adj: 'adjective', adv: 'adverb', prep: 'preposition', conj: 'conjunction',
    det: 'determiner', num: 'number', wh: 'question word', part: 'particle',
    intj: 'interjection', unknown: 'unknown'
  };
  var POS_EN = {
    pron: 'pronoun', noun: 'noun', verb: 'verb', aux: 'auxiliary', adj: 'adjective',
    adv: 'adverb', prep: 'preposition', conj: 'conjunction', det: 'determiner',
    num: 'numeral', wh: 'question word', part: 'particle', intj: 'interjection',
    unknown: 'unknown'
  };

  var BE = ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
  var HAVE = ['have', 'has', 'had'];
  var DO = ['do', 'does', 'did'];
  var MODALS = ['will', 'shall', 'would', 'should', 'can', 'could', 'may', 'might', 'must'];

  function inList(w, list) { return list.indexOf(w) >= 0; }

  function tokenize(s) {
    return String(s || '')
      .replace(/([.,!?;:।])/g, ' $1 ')
      .replace(/n't\b/gi, " n't")
      .split(/\s+/)
      .filter(Boolean);
  }

  function clean(w) { return String(w).toLowerCase().replace(/[.,!?;:"'()।]/g, ''); }

  /* ---------------------------------------------------- English morphology */
  function baseForm(w) {
    if (TB.IRREG_REV[w]) return TB.IRREG_REV[w];
    if (TB.LEX.en[w]) return w;
    if (/ies$/.test(w) && w.length > 4) return w.slice(0, -3) + 'y';
    if (/(ches|shes|sses|xes|zes)$/.test(w)) return w.slice(0, -2);
    /* -es on a consonant stem: goes -> go, does -> do */
    if (/es$/.test(w) && w.length > 3) {
      var e2 = w.slice(0, -2);
      if (TB.LEX.en[e2] || (TB.IDX && TB.IDX.en[e2])) return e2;
    }
    if (/s$/.test(w) && !/ss$/.test(w) && w.length > 3) {
      var s = w.slice(0, -1);
      if (TB.LEX.en[s] || (TB.IDX && TB.IDX.en[s])) return s;
    }
    if (/ied$/.test(w) && w.length > 4) return w.slice(0, -3) + 'y';
    if (/ed$/.test(w) && w.length > 3) {
      var a = w.slice(0, -1), b = w.slice(0, -2);
      if (TB.LEX.en[b]) return b;
      if (TB.LEX.en[a]) return a;
      if (/([bdfglmnprt])\1ed$/.test(w)) return w.slice(0, -3);
      return b;
    }
    if (/ying$/.test(w)) return w.slice(0, -4) + 'ie';
    if (/ing$/.test(w) && w.length > 4) {
      var c = w.slice(0, -3);
      if (TB.LEX.en[c]) return c;
      if (TB.LEX.en[c + 'e']) return c + 'e';
      if (/([bdfglmnprt])\1$/.test(c)) return c.slice(0, -1);
      return c;
    }
    return w;
  }

  function isVing(w) { return /ing$/.test(w) && w.length > 4; }
  function isPastPart(w) {
    var base = TB.IRREG_REV[w];
    if (base && TB.IRREGULAR[base] && TB.IRREGULAR[base][1].split('/').indexOf(w) >= 0) return true;
    return /ed$/.test(w);
  }
  function isPastSimple(w) {
    var base = TB.IRREG_REV[w];
    if (base && TB.IRREGULAR[base] && TB.IRREGULAR[base][0].split('/').indexOf(w) >= 0) return true;
    return /ed$/.test(w);
  }

  /* -------------------------------------------------------- POS  tagging */
  function tagEnglish(raw, i, tokens) {
    var w = clean(raw);
    var entry = TB.LEX.en[w];
    var tag = { raw: raw, w: w, pos: 'unknown', ta: '', hi: '', note: '' };

    if (!w) { tag.pos = 'punct'; return tag; }

    if (entry) {
      tag.pos = entry[0]; tag.ta = entry[1]; tag.hi = entry[2];
    } else if (TB.IDX && TB.IDX.en[w]) {
      var v = TB.IDX.en[w];
      tag.ta = v.ta; tag.hi = v.hi;
      tag.pos = v.th === 'verbs' ? 'verb'
        : (v.th === 'adjectives' ? 'adj' : (v.th === 'numbers' ? 'num' : 'noun'));
    } else {
      /* morphology-based guessing */
      var b = baseForm(w);
      if (b !== w && (TB.LEX.en[b] || (TB.IDX && TB.IDX.en[b]))) {
        var be = TB.LEX.en[b] || null;
        var bv = TB.IDX ? TB.IDX.en[b] : null;
        tag.ta = be ? be[1] : (bv ? bv.ta : '');
        tag.hi = be ? be[2] : (bv ? bv.hi : '');
        tag.pos = be ? be[0] : (bv && bv.th === 'verbs' ? 'verb' : 'noun');
        tag.base = b;
        if (isVing(w)) { tag.pos = 'verb'; tag.form = 'ing'; }
        else if (isPastSimple(w)) { tag.pos = 'verb'; tag.form = 'past'; }
        else if (/s$/.test(w)) { tag.form = tag.pos === 'verb' ? '3sg' : 'plural'; }
      } else if (/ly$/.test(w)) { tag.pos = 'adv'; }
      else if (isVing(w)) { tag.pos = 'verb'; tag.form = 'ing'; tag.base = baseForm(w); }
      else if (/ed$/.test(w)) { tag.pos = 'verb'; tag.form = 'past'; tag.base = baseForm(w); }
      else if (/(tion|sion|ness|ment|ity|ance|ence|ship|hood)$/.test(w)) { tag.pos = 'noun'; }
      else if (/(ous|ful|ive|able|ible|less|al|ic)$/.test(w)) { tag.pos = 'adj'; }
      else if (/^[A-Z]/.test(raw) && i > 0) { tag.pos = 'noun'; tag.proper = true; }
      else if (/^\d+$/.test(w)) { tag.pos = 'num'; }
      else { tag.pos = 'noun'; tag.guessed = true; }
    }

    if (inList(w, BE) || inList(w, HAVE) || inList(w, DO) || inList(w, MODALS)) tag.pos = 'aux';
    return tag;
  }

  /* -------------------------------------------------------- tense finding */
  function detectTense(tags) {
    /* Look only at the auxiliary/verb chain. This skips whatever sits between
       an auxiliary and its verb — negation ("have NOT finished"), adverbs
       ("is always working") and the inverted subject in questions
       ("are YOU going") — all of which broke naive adjacency checks. */
    var chain = tags.filter(function (t) { return t.pos === 'aux' || t.pos === 'verb'; });
    var words = chain.map(function (t) { return t.w; });
    function at(i) { return words[i] || ''; }
    var n = words.length;

    for (var i = 0; i < n; i++) {
      var w = at(i);
      var next = at(i + 1), next2 = at(i + 2);

      if (inList(w, MODALS) && (w === 'will' || w === 'shall')) {
        if (next === 'have' && isPastPart(next2)) return mk('future perfect', 'Future perfect', 'will have + V3', 'An action that will already be finished by some future point.');
        if (next === 'be' && isVing(next2)) return mk('future continuous', 'Future continuous', 'will be + V-ing', 'An action that will be ongoing in the future.');
        return mk('future simple', 'Future simple', 'will + base verb', 'Something that will happen later. After “will” the verb is always in its base form.');
      }
      if (inList(w, MODALS)) {
        return mk('modal', 'Modal', w + ' + base verb', 'Shows ability, permission or obligation. The verb never changes after a modal.');
      }
      if (w === 'have' || w === 'has') {
        if (next === 'been' && isVing(next2)) return mk('present perfect continuous', 'Present perfect continuous', 'have/has been + V-ing', 'An action that started earlier and is still going on.');
        if (isPastPart(next)) return mk('present perfect', 'Present perfect', 'have/has + V3', 'A finished action that still matters right now.');
      }
      if (w === 'had') {
        if (next === 'been' && isVing(next2)) return mk('past perfect continuous', 'Past perfect continuous', 'had been + V-ing', 'An action that had been going on before a point in the past.');
        if (isPastPart(next)) return mk('past perfect', 'Past perfect', 'had + V3', 'An action already finished before another past action.');
      }
      if (w === 'am' || w === 'is' || w === 'are') {
        if (next === 'being' && isPastPart(next2)) return mk('present passive continuous', 'Present passive continuous', 'is being + V3', 'Puts the receiver of the action first.');
        if (isVing(next)) return mk('present continuous', 'Present continuous', 'am/is/are + V-ing', 'Happening right now. Like Tamil “-கொண்டிருக்கிறேன்”.');
        if (isPastPart(next) && TB.IRREG_REV[next]) return mk('present passive', 'Present passive', 'is + V3', 'The receiver of the action matters more than the doer.');
        return mk('present simple (be)', 'Present simple (be)', 'am/is/are + state', 'Means “is / are”. Tamil usually drops this word — English never does.');
      }
      if (w === 'was' || w === 'were') {
        if (isVing(next)) return mk('past continuous', 'Past continuous', 'was/were + V-ing', 'An action that was ongoing in the past.');
        if (isPastPart(next) && TB.IRREG_REV[next]) return mk('past passive', 'Past passive', 'was/were + V3', 'Past tense, with the receiver of the action first.');
        return mk('past simple (be)', 'Past simple (be)', 'was/were + state', 'Describes a state in the past.');
      }
      if (inList(w, DO)) {
        if (w === 'did') return mk('past simple', 'Past simple', 'did + base verb', '“did” already carries the tense, so the main verb stays in its base form.');
        return mk('present simple', 'Present simple', 'do/does + base verb', 'Used for questions and negatives.');
      }
    }

    /* no auxiliary: read the main verb itself */
    for (var j = 0; j < chain.length; j++) {
      var t = chain[j];
      if (t.pos === 'verb') {
        if (t.form === 'past' || isPastSimple(t.w)) {
          return mk('past simple', 'Past simple', 'verb + -ed (or an irregular form)', 'A completed action in the past.');
        }
        if (t.form === '3sg' || /s$/.test(t.w)) {
          return mk('present simple', 'Present simple', 'verb + -s (he/she/it)', 'A habit or routine. With he/she/it the -s is compulsory.');
        }
        return mk('present simple', 'Present simple', 'base verb', 'A habit, or a general truth.');
      }
    }
    return mk('unclear', 'Tense unclear', '—', 'Not a complete sentence, so the tense cannot be determined.');

    function mk(en, ta, formula, why) { return { en: en, ta: ta, formula: formula, why: why }; }
  }

  /* --------------------------------------------------- sentence structure */
  function detectType(tokens, tags) {
    var first = tags.filter(function (t) { return t.pos !== 'punct'; })[0];
    var raw = String(tokens.join(' '));
    var hasQMark = /\?\s*$/.test(raw);
    var hasNeg = tags.some(function (t) { return t.w === 'not' || t.w === "n't" || t.w === 'never' || t.w === 'no'; });
    var firstW = first ? first.w : '';

    var type, taType, note;
    if (hasQMark || first && (first.pos === 'wh' || (first.pos === 'aux' && !inList(firstW, ['not'])))) {
      if (first && first.pos === 'wh') {
        type = 'wh-question'; taType = 'Wh- question';
        note = 'Question word (' + firstW + ') first, then the auxiliary, then the subject. In Tamil the question word can sit in the middle — in English it comes first.';
      } else {
        type = 'yes/no question'; taType = 'Yes / no question';
        note = 'An auxiliary (is / do / can …) at the front makes a yes/no question — like adding “-ஆ” in Tamil.';
      }
    } else if (first && first.pos === 'verb' && !tags.some(function (t) { return t.pos === 'pron' && ['i','you','he','she','it','we','they'].indexOf(t.w) >= 0; })) {
      type = 'imperative'; taType = 'Command';
      note = 'Starting with a verb and no subject makes a command or request. The subject “you” is understood.';
    } else if (/!\s*$/.test(raw)) {
      type = 'exclamation'; taType = 'Exclamation';
      note = 'A sentence expressing strong feeling.';
    } else {
      type = 'statement'; taType = 'Statement';
      note = 'An ordinary statement of fact.';
    }
    if (hasNeg) { type += ' (negative)'; taType += ' — negative'; note += ' “not / n’t” makes it negative.'; }
    return { en: type, ta: taType, note: note };
  }

  function findSVO(tags) {
    var content = tags.filter(function (t) { return t.pos !== 'punct'; });

    /* The FIRST verb is the main verb: in "I have not finished my work", the
       later noun-verb homograph ("work") must not win. */
    var vIdx = -1;
    for (var i = 0; i < content.length; i++) {
      if (content[i].pos === 'verb') { vIdx = i; break; }
    }
    if (vIdx < 0) {
      for (i = content.length - 1; i >= 0; i--) {
        if (content[i].pos === 'aux') { vIdx = i; break; }
      }
    }

    var qword = content[0] && content[0].pos === 'wh' ? content[0] : null;
    var subject = [], verb = [], object = [];

    if (vIdx < 0) {
      subject = content;
    } else {
      /* auxiliaries anywhere before the main verb belong to the verb group,
         so question inversion ("are you going") still resolves correctly */
      content.slice(0, vIdx).forEach(function (t) {
        if (t.pos === 'aux') verb.push(t);
        else if (t.pos === 'part' || t.w === 'not' || t.w === "n't") verb.push(t);
        else if (t !== qword) subject.push(t);
      });
      verb.push(content[vIdx]);
      object = content.slice(vIdx + 1);
    }

    return {
      qword: qword, subject: subject, verb: verb, object: object,
      qwordText: qword ? qword.raw : '',
      subjectText: subject.map(function (t) { return t.raw; }).join(' '),
      verbText: verb.map(function (t) { return t.raw; }).join(' '),
      objectText: object.map(function (t) { return t.raw; }).join(' ')
    };
  }

  /* -------------------------------------------------- Tamil word order map */
  function orderNote(svo) {
    if (!svo.verbText) return null;
    var reordered = [svo.subjectText, svo.objectText, svo.verbText]
      .filter(function (s) { return s && s.trim(); }).join('  ');
    return {
      english: 'English: Subject → Verb → Object (SVO)',
      tamil: 'Tamil & Hindi: Subject → Object → Verb (SOV)',
      reordered: reordered,
      explain: 'In English the verb sits in the middle; in Tamil and Hindi the verb comes **last**. '
             + 'When translating, move the verb to the end — this is the single biggest difference.'
    };
  }

  /* ================================================== ENGLISH  ANALYSIS === */
  function analyzeEnglish(sentence) {
    if (!TB.IDX) TB.buildIndexes();
    var tokens = tokenize(sentence);
    var tags = tokens.map(function (t, i) { return tagEnglish(t, i, tokens); });
    var tense = detectTense(tags);
    var type = detectType(tokens, tags);
    var svo = findSVO(tags);

    var unknown = tags.filter(function (t) {
      return t.pos !== 'punct' && !t.ta;
    }).map(function (t) { return t.w; });

    var tips = [];
    /* Tamil-speaker specific checks */
    var hasArticle = tags.some(function (t) { return ['a', 'an', 'the'].indexOf(t.w) >= 0; });
    var hasSingularNoun = tags.some(function (t) { return t.pos === 'noun' && !/s$/.test(t.w) && !t.proper; });
    if (!hasArticle && hasSingularNoun) {
      tips.push('Tamil has no “a / an / the”, so these are easy to forget. Check whether this sentence needs one.');
    }
    var subj3sg = svo.subject.some(function (t) { return ['he', 'she', 'it'].indexOf(t.w) >= 0; });
    var mainV = svo.verb[svo.verb.length - 1];
    if (subj3sg && mainV && mainV.pos === 'verb' && !/s$/.test(mainV.w) && svo.verb.length === 1) {
      tips.push('The subject is he/she/it, so the verb needs “-s” ("' + mainV.w + '" → "' + mainV.w + 's").');
    }
    if (tense.en.indexOf('future') === 0 && mainV && /s$/.test(mainV.w)) {
      tips.push('After “will” the verb stays in its base form — never add “-s”.');
    }

    return {
      lang: 'en', source: sentence, tokens: tokens, tags: tags,
      tense: tense, type: type, svo: svo, order: orderNote(svo),
      unknown: unknown, tips: tips,
      posName: function (p) { return { ta: POS_TA[p] || p, en: POS_EN[p] || p }; }
    };
  }

  /* ==================================================== HINDI  ANALYSIS === */
  function analyzeHindi(sentence) {
    var tokens = tokenize(sentence);
    var tags = tokens.map(function (raw) {
      var w = String(raw).replace(/[।,.!?]/g, '');
      var e = TB.LEX.hi[w];
      var tag = { raw: raw, w: w, pos: 'unknown', ta: '', en: '' };
      if (!w) { tag.pos = 'punct'; return tag; }
      if (e) { tag.pos = e[0]; tag.ta = e[1]; tag.en = e[2]; return tag; }
      if (TB.IDX && TB.IDX.hi[w]) { var v = TB.IDX.hi[w]; tag.ta = v.ta; tag.en = v.en; tag.pos = 'noun'; return tag; }
      if (/ना$/.test(w)) { tag.pos = 'verb'; tag.note = 'அகராதி வடிவம் (-ना)'; return tag; }
      if (/(ता|ती|ते)$/.test(w)) { tag.pos = 'verb'; tag.note = 'வழக்க வினை வடிவம்'; return tag; }
      if (/(या|यी|ये|आ|ई|ए)$/.test(w)) { tag.pos = 'verb'; tag.note = 'இறந்தகால வடிவம்'; return tag; }
      if (/(गा|गी|गे)$/.test(w)) { tag.pos = 'verb'; tag.note = 'எதிர்கால வடிவம்'; return tag; }
      tag.pos = 'noun'; tag.guessed = true;
      return tag;
    });

    /* punctuation tokens must not count as "the last word" */
    var words = tags.filter(function (t) { return t.pos !== 'punct' && t.w; }).map(function (t) { return t.w; });
    var last = words[words.length - 1] || '';
    var joined = words.join(' ');
    var tense;
    if (/(गा|गी|गे)$/.test(last) || /(गा|गी|गे)\s/.test(joined + ' ')) {
      tense = { en: 'future', ta: 'Future', formula: 'verb + -गा / -गी / -गे', why: 'The ending follows gender: -गा (m), -गी (f), -गे (plural or polite).' };
    } else if (/(रहा|रही|रहे)/.test(joined)) {
      tense = { en: 'continuous', ta: 'Continuous', formula: 'verb + रहा/रही/रहे + है/हूँ/हैं', why: 'Like English “-ing”, but it changes with gender.' };
    } else if (/(था|थी|थे)/.test(joined)) {
      tense = { en: 'past', ta: 'Past', formula: 'verb + था / थी / थे', why: 'A state or habit in the past.' };
    } else if (/(ता|ती|ते)\s+(है|हैं|हूँ|हो)/.test(joined) || /(ता|ती|ते)$/.test(words[words.length - 2] || '')) {
      tense = { en: 'present habitual', ta: 'Present habitual', formula: 'verb + ता/ती/ते + है/हैं/हूँ', why: 'Something done regularly.' };
    } else if (/(या|यी|ये|आ|ीं)$/.test(last) && !/(है|हैं|हूँ|हो)$/.test(last)) {
      tense = { en: 'past perfective', ta: 'Past (completed)', formula: 'verb + या / यी / ये', why: 'A completed action. With an object, the subject takes “ने”.' };
    } else if (/(है|हैं|हूँ|हो)/.test(joined)) {
      tense = { en: 'present (be)', ta: 'Present (be)', formula: 'noun/adjective + है / हैं / हूँ', why: 'Same job as English am/is/are.' };
    } else if (/(या|यी|ये)$/.test(last)) {
      tense = { en: 'past perfective', ta: 'Past (completed)', formula: 'verb + या / यी / ये', why: 'A completed action. With an object, the subject takes “ने”.' };
    } else {
      tense = { en: 'unclear', ta: 'Tense unclear', formula: '—', why: 'No auxiliary verb found.' };
    }

    var isQ = /\?/.test(sentence) || tags.some(function (t) { return t.pos === 'wh'; }) || /^क्या\b/.test(sentence.trim());
    var hasNeg = /(नहीं|ना|मत)/.test(joined);

    var postp = tags.filter(function (t) { return t.pos === 'prep'; })
      .map(function (t) { return t.w + ' = ' + t.ta; });

    var tips = [
      'Hindi and Tamil share the same word order (SOV) — verb last. That is a big head start for Tamil speakers.',
      'Every Hindi noun has a gender, and the verb changes to match. Tamil has no such rule.'
    ];
    if (postp.length) tips.push('Postpositions (like Tamil case endings): ' + postp.join(', '));

    return {
      lang: 'hi', source: sentence, tokens: tokens, tags: tags, tense: tense,
      type: { en: isQ ? 'question' : 'statement', ta: isQ ? 'Question' : 'Statement',
              note: hasNeg ? 'Negative — it contains मत/नहीं.' : 'An ordinary statement.' },
      svo: null, order: null,
      unknown: tags.filter(function (t) { return t.pos !== 'punct' && !t.ta; }).map(function (t) { return t.w; }),
      tips: tips,
      posName: function (p) { return { ta: POS_TA[p] || p, en: POS_EN[p] || p }; }
    };
  }

  /* ==================================================== TAMIL  ANALYSIS === */
  function analyzeTamil(sentence) {
    if (!TB.IDX) TB.buildIndexes();
    var tokens = tokenize(sentence);

    /* Word-final euphonic consonants (சந்தி) attach to the previous word:
       "பள்ளிக்கு" + "ச்" -> "பள்ளிக்குச்". Strip them before matching. */
    function stripSandhi(w) { return w.replace(/[கசதப]்$/, ''); }

    /* Look a word up in the function-word lexicon, then the vocabulary. */
    function look(w) {
      if (!w) return null;
      var l = TB.LEX.ta[w];
      if (l) return { pos: l[0], en: l[1], hi: l[2], word: w };
      var v = TB.IDX.ta[w];
      if (v) {
        return { pos: v.th === 'verbs' ? 'verb' : (v.th === 'adjectives' ? 'adj' : 'noun'),
                 en: v.en, hi: v.hi, word: v.ta };
      }
      return null;
    }

    /* After removing an inflection, the stem may need restoring:
       படித்த -> படி, சென்ற -> செல், வாங்கின -> வாங்கு … */
    function resolveStem(stem) {
      if (!stem) return null;
      var cands = [
        stem, stem + 'ு', stem + 'ி', stem + '்',
        stem.replace(/த்த$/, ''), stem.replace(/ந்த$/, ''), stem.replace(/ட்ட$/, ''),
        stem.replace(/க்க$/, ''), stem.replace(/ற்ற$/, ''), stem.replace(/ன்ன$/, ''),
        stem.replace(/ின்$/, ''), stem.replace(/ிய$/, ''), stem.replace(/்ப$/, ''),
        stem.replace(/த்த$/, 'ு'), stem.replace(/ந்த$/, 'ு'),
        stem.replace(/ு$/, ''), stem.replace(/ி$/, ''), stem.replace(/ா$/, '')
      ];
      for (var i = 0; i < cands.length; i++) {
        if (cands[i] && cands[i] !== stem) { var h = look(cands[i]); if (h) return h; }
        else if (cands[i]) { var h0 = look(cands[i]); if (h0) return h0; }
      }
      return null;
    }

    /* longest suffix first, so "த்தாள்" beats "ாள்" */
    var VERB_ENDINGS = TB.TA_VERB_ENDINGS.slice().sort(function (a, b) { return b.suf.length - a.suf.length; });
    var CASES = TB.TA_CASES.slice().sort(function (a, b) { return b.suf.length - a.suf.length; });

    var tags = tokens.map(function (raw) {
      var w0 = String(raw).replace(/[.,!?;:]/g, '');
      var tag = { raw: raw, w: w0, pos: 'unknown', en: '', hi: '', morph: [] };
      if (!w0) { tag.pos = 'punct'; return tag; }

      /* 1. direct hit, then again after stripping a euphonic consonant */
      var direct = look(w0);
      var w = w0;
      if (!direct) {
        w = stripSandhi(w0);
        if (w !== w0) direct = look(w);
      }
      if (direct) { tag.pos = direct.pos; tag.en = direct.en; tag.hi = direct.hi; return tag; }

      /* 2. verb inflection */
      for (var i = 0; i < VERB_ENDINGS.length; i++) {
        var ve = VERB_ENDINGS[i];
        if (w.length > ve.suf.length && w.slice(-ve.suf.length) === ve.suf) {
          tag.pos = 'verb';
          tag.tense = ve.tense;
          tag.morph.push({ type: 'வினை விகுதி', suffix: ve.suf, meaning: ve.person + ' · ' + tenseTa(ve.tense), en: ve.en });
          var stem = w.slice(0, -ve.suf.length);
          var sHit = resolveStem(stem);
          if (sHit) { tag.en = sHit.en; tag.hi = sHit.hi; tag.stem = sHit.word; }
          else tag.stem = stem;
          return tag;
        }
      }

      /* 3. case suffix on a noun */
      for (var j = 0; j < CASES.length; j++) {
        var c = CASES[j];
        if (w.length > c.suf.length + 1 && w.slice(-c.suf.length) === c.suf) {
          var root = w.slice(0, -c.suf.length);
          var rHit = resolveStem(root) || look(root + 'ம்');
          tag.pos = 'noun';
          tag.morph.push({ type: 'வேற்றுமை உருபு', suffix: c.suf, meaning: c.name, en: c.en, hi: c.hi });
          tag.root = rHit ? rHit.word : root;
          if (rHit) { tag.en = rHit.en; tag.hi = rHit.hi; }
          return tag;
        }
      }

      tag.pos = 'noun'; tag.guessed = true;
      return tag;
    });

    var verbTag = tags.filter(function (t) { return t.pos === 'verb'; }).pop();
    var tense;
    if (verbTag && verbTag.tense) {
      var map = {
        present: { en: 'present', ta: 'Present', formula: 'verb + கிற் + ending', why: 'Becomes present simple or present continuous in English, depending on context.' },
        past: { en: 'past', ta: 'Past', formula: 'verb + த்/ந்/இன் + ending', why: 'Past simple in English (-ed, or an irregular form).' },
        future: { en: 'future', ta: 'Future', formula: 'verb + வ்/ப் + ending', why: 'In English: “will + base verb”.' },
        negative: { en: 'negative', ta: 'Negative', formula: 'verb + வில்லை', why: 'In English: “do not / did not + base verb”.' },
        'negative-future': { en: 'negative future', ta: 'Negative future', formula: 'verb + மாட்டேன்', why: 'In English: “will not + base verb”.' }
      };
      tense = map[verbTag.tense] || map.present;
    } else {
      tense = { en: 'unclear', ta: 'Tense unclear', formula: '—', why: 'No verb was recognised.' };
    }

    var isQ = /[?]/.test(sentence) || /(ஆ|ா)\s*[?]?$/.test(sentence.trim()) ||
              tags.some(function (t) { return ['என்ன', 'யார்', 'எங்கே', 'எப்போது', 'ஏன்', 'எப்படி', 'எது'].indexOf(t.w) >= 0; });

    var cases = [];
    tags.forEach(function (t) {
      t.morph.forEach(function (m) {
        if (m.type === 'வேற்றுமை உருபு') cases.push(t.raw + ' → ' + m.suffix + ' (' + m.meaning + ') = English "' + m.en + '"');
      });
    });

    var tips = ['Tamil is SOV — verb last. English is SVO — verb in the middle. When translating, move the verb into the middle.'];
    if (cases.length) tips.push('Tamil case endings become English prepositions, which go **before** the noun: ' + cases.join(' | '));
    tips.push('When translating into English, remember to add “a / an / the” — Tamil has no articles.');

    return {
      lang: 'ta', source: sentence, tokens: tokens, tags: tags, tense: tense,
      type: { en: isQ ? 'question' : 'statement', ta: isQ ? 'Question' : 'Statement', note: '' },
      svo: null,
      order: {
        english: 'English: Subject → Verb → Object',
        tamil: 'Tamil: Subject → Object → Verb',
        reordered: '',
        explain: 'To turn a Tamil sentence into English, bring the final verb forward, just after the subject.'
      },
      unknown: tags.filter(function (t) { return t.pos !== 'punct' && !t.en; }).map(function (t) { return t.w; }),
      tips: tips,
      posName: function (p) { return { ta: POS_TA[p] || p, en: POS_EN[p] || p }; }
    };

    function tenseTa(t) {
      return { present: 'present', past: 'past', future: 'future',
               negative: 'negative', 'negative-future': 'negative future' }[t] || t;
    }
  }

  /* --------------------------------------------------------------- public */
  var api = {
    POS_TA: POS_TA, POS_EN: POS_EN,

    detectLang: function (text) {
      if (/[஀-௿]/.test(text)) return 'ta';
      if (/[ऀ-ॿ]/.test(text)) return 'hi';
      return 'en';
    },

    analyze: function (sentence, lang) {
      lang = lang || api.detectLang(sentence);
      if (lang === 'ta') return analyzeTamil(sentence);
      if (lang === 'hi') return analyzeHindi(sentence);
      return analyzeEnglish(sentence);
    },

    /* Build a spoken lesson from an analysis: Tamil narration + target audio. */
    voiceScript: function (a, translations) {
      var steps = [];
      var langName = { en: 'English', hi: 'Hindi', ta: 'Tamil' }[a.lang] || '';
      steps.push({ text: 'Let us look at this ' + langName + ' sentence.', lang: 'en', pause: 350 });
      steps.push({ text: a.source, lang: a.lang, rate: 0.7, pause: 500 });
      steps.push({ text: 'This is a ' + a.type.ta + '. Tense: ' + a.tense.ta + '.', lang: 'en', pause: 400 });

      var content = a.tags.filter(function (t) { return t.pos !== 'punct'; });
      if (content.length <= 12) {
        steps.push({ text: 'Now word by word.', lang: 'en', pause: 300 });
        content.forEach(function (t) {
          var meaning = a.lang === 'en' ? t.ta : (a.lang === 'hi' ? t.ta : t.en);
          if (!meaning) return;
          steps.push({ text: t.raw, lang: a.lang, rate: 0.65, pause: 200 });
          steps.push({ text: meaning, lang: a.lang === 'en' || a.lang === 'hi' ? 'ta' : 'en', pause: 320 });
        });
      }

      if (translations) {
        Object.keys(translations).forEach(function (L) {
          if (L === a.lang || !translations[L]) return;
          var nm = { ta: 'In Tamil', en: 'In English', hi: 'In Hindi' }[L] || L;
          steps.push({ text: nm, lang: 'en', pause: 200 });
          steps.push({ text: translations[L], lang: L, rate: 0.75, pause: 400 });
        });
      }

      steps.push({ text: 'Now you try saying it.', lang: 'en', pause: 200 });
      steps.push({ text: a.source, lang: a.lang, rate: 0.6, pause: 200 });
      return steps;
    }
  };

  return api;
})();
