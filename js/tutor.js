/* Tamil Bridge — the sentence tutor.
   Takes a sentence in English, Hindi or Tamil and produces a full breakdown:
   word-by-word gloss, part of speech, tense, sentence type, subject/verb/object,
   the word-order shift between SVO and SOV, and an explanation written in Tamil.
   Pure rules + lexicon — deterministic, offline, and free.                     */
window.TB = window.TB || {};

TB.Tutor = (function () {

  /* ------------------------------------------------------------- helpers */
  var POS_TA = {
    pron: 'பிரதிப்பெயர்', noun: 'பெயர்ச்சொல்', verb: 'வினைச்சொல்', aux: 'துணைவினை',
    adj: 'பெயரடை', adv: 'வினையடை', prep: 'முன்னிடைச்சொல்', conj: 'இணைப்புச்சொல்',
    det: 'சுட்டுச்சொல்', num: 'எண்ணுப்பெயர்', wh: 'வினாச்சொல்', part: 'இடைச்சொல்',
    intj: 'வியப்புச்சொல்', unknown: 'தெரியவில்லை'
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
        if (next === 'have' && isPastPart(next2)) return mk('future perfect', 'எதிர்கால நிறைவு', 'will have + V3', 'நாளைக்குள் முடிந்திருக்கும் செயல்.');
        if (next === 'be' && isVing(next2)) return mk('future continuous', 'எதிர்கால தொடர்', 'will be + V-ing', 'எதிர்காலத்தில் தொடர்ந்து நடக்கும் செயல்.');
        return mk('future simple', 'எதிர்காலம்', 'will + அடிப்படை வினை', 'இனிமேல் நடக்கப் போகும் செயல். will-க்குப் பின் வினை எப்போதும் அடிப்படை வடிவம்.');
      }
      if (inList(w, MODALS)) {
        return mk('modal', 'துணைவினை (modal)', w + ' + அடிப்படை வினை', 'இயலுமை / அனுமதி / கடமையைக் காட்டுகிறது. modal-க்குப் பின் வினை மாறாது.');
      }
      if (w === 'have' || w === 'has') {
        if (next === 'been' && isVing(next2)) return mk('present perfect continuous', 'நிகழ்கால நிறைவுத் தொடர்', 'have/has been + V-ing', 'சிறிது காலமாகத் தொடர்ந்து நடக்கும் செயல்.');
        if (isPastPart(next)) return mk('present perfect', 'நிகழ்கால நிறைவு', 'have/has + V3', 'முடிந்த செயல் — ஆனால் இப்போதைய நிலையோடு தொடர்புடையது.');
      }
      if (w === 'had') {
        if (next === 'been' && isVing(next2)) return mk('past perfect continuous', 'இறந்தகால நிறைவுத் தொடர்', 'had been + V-ing', 'கடந்த காலத்தில் ஒரு புள்ளிக்கு முன் தொடர்ந்த செயல்.');
        if (isPastPart(next)) return mk('past perfect', 'இறந்தகால நிறைவு', 'had + V3', 'கடந்த காலத்தில் இன்னொரு செயலுக்கு முன்பே முடிந்த செயல்.');
      }
      if (w === 'am' || w === 'is' || w === 'are') {
        if (next === 'being' && isPastPart(next2)) return mk('present passive continuous', 'நிகழ்கால செயப்பாட்டு வினை', 'is being + V3', 'செயலைப் பெறுபவரை முன்னிலைப்படுத்துகிறது.');
        if (isVing(next)) return mk('present continuous', 'நிகழ்கால தொடர்', 'am/is/are + V-ing', 'இப்போது நடந்து கொண்டிருக்கும் செயல். தமிழ் "-கொண்டிருக்கிறேன்" போன்றது.');
        if (isPastPart(next) && TB.IRREG_REV[next]) return mk('present passive', 'நிகழ்கால செயப்பாட்டு வினை', 'is + V3', 'செயலைச் செய்பவரை விட, செயலைப் பெறுபவர் முக்கியம்.');
        return mk('present simple (be)', 'நிகழ்காலம் — இருப்பு வினை', 'am/is/are + நிலை', '"இருக்கிறது / ஆகும்" எனப் பொருள். தமிழில் இது பெரும்பாலும் விடுபடும் — ஆங்கிலத்தில் கட்டாயம்.');
      }
      if (w === 'was' || w === 'were') {
        if (isVing(next)) return mk('past continuous', 'இறந்தகால தொடர்', 'was/were + V-ing', 'கடந்த காலத்தில் தொடர்ந்து நடந்த செயல்.');
        if (isPastPart(next) && TB.IRREG_REV[next]) return mk('past passive', 'இறந்தகால செயப்பாட்டு வினை', 'was/were + V3', 'கடந்த காலச் செயப்பாட்டு வினை.');
        return mk('past simple (be)', 'இறந்தகாலம் — இருப்பு வினை', 'was/were + நிலை', 'கடந்த கால நிலையைக் குறிக்கிறது.');
      }
      if (inList(w, DO)) {
        if (w === 'did') return mk('past simple', 'இறந்தகாலம்', 'did + அடிப்படை வினை', 'did ஏற்கனவே காலத்தைக் காட்டுவதால், முதன்மை வினை அடிப்படை வடிவத்தில் இருக்கும்.');
        return mk('present simple', 'நிகழ்காலம்', 'do/does + அடிப்படை வினை', 'கேள்வி அல்லது மறுப்பு வடிவம்.');
      }
    }

    /* no auxiliary: read the main verb itself */
    for (var j = 0; j < chain.length; j++) {
      var t = chain[j];
      if (t.pos === 'verb') {
        if (t.form === 'past' || isPastSimple(t.w)) {
          return mk('past simple', 'இறந்தகாலம்', 'வினை + -ed (அல்லது ஒழுங்கற்ற வடிவம்)', 'கடந்த காலத்தில் முடிந்த செயல்.');
        }
        if (t.form === '3sg' || /s$/.test(t.w)) {
          return mk('present simple', 'நிகழ்காலம்', 'வினை + -s (he/she/it)', 'வழக்கமான, தினசரி நடக்கும் செயல். he/she/it-உடன் -s கட்டாயம்.');
        }
        return mk('present simple', 'நிகழ்காலம்', 'அடிப்படை வினை', 'வழக்கமான அல்லது பொதுவான உண்மை.');
      }
    }
    return mk('unclear', 'காலம் தெளிவாக இல்லை', '—', 'முழு வாக்கியமாக இல்லாததால் காலத்தைத் தீர்மானிக்க முடியவில்லை.');

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
        type = 'wh-question'; taType = 'வினாச்சொல் கேள்வி';
        note = 'கேள்விச் சொல் (' + firstW + ') முதலில், பிறகு துணைவினை, பிறகு எழுவாய். தமிழில் கேள்விச் சொல் நடுவில் வரலாம் — ஆங்கிலத்தில் முதலில்.';
      } else {
        type = 'yes/no question'; taType = 'ஆம்/இல்லை கேள்வி';
        note = 'துணைவினை (is / do / can …) முதலில் வந்தால் அது ஆம்/இல்லை கேள்வி. தமிழில் "-ஆ" சேர்ப்பது போல.';
      }
    } else if (first && first.pos === 'verb' && !tags.some(function (t) { return t.pos === 'pron' && ['i','you','he','she','it','we','they'].indexOf(t.w) >= 0; })) {
      type = 'imperative'; taType = 'ஏவல் வாக்கியம்';
      note = 'எழுவாய் இல்லாமல் வினையில் தொடங்கினால் அது கட்டளை/வேண்டுகோள். (நீங்கள் என்பது மறைமுகம்.)';
    } else if (/!\s*$/.test(raw)) {
      type = 'exclamation'; taType = 'வியப்பு வாக்கியம்';
      note = 'உணர்ச்சியை வெளிப்படுத்தும் வாக்கியம்.';
    } else {
      type = 'statement'; taType = 'செய்தி வாக்கியம்';
      note = 'சாதாரண தகவல் வாக்கியம்.';
    }
    if (hasNeg) { type += ' (negative)'; taType += ' — மறுப்பு'; note += ' "not / n’t" சேர்வதால் இது மறுப்பு வடிவம்.'; }
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
      english: 'எழுவாய் → வினை → செயப்படுபொருள் (SVO)',
      tamil: 'எழுவாய் → செயப்படுபொருள் → வினை (SOV)',
      reordered: reordered,
      explain: 'ஆங்கிலத்தில் வினை நடுவில் வரும்; தமிழிலும் இந்தியிலும் வினை **கடைசியில்** வரும். '
             + 'மொழிபெயர்க்கும்போது வினையைக் கடைசிக்கு நகர்த்துங்கள் — இதுவே மிகப் பெரிய வேறுபாடு.'
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
      tips.push('தமிழில் "a / an / the" இல்லை — அதனால் இவற்றை மறப்பது பொதுவான பிழை. இந்த வாக்கியத்தில் சேர்க்க வேண்டுமா எனப் பாருங்கள்.');
    }
    var subj3sg = svo.subject.some(function (t) { return ['he', 'she', 'it'].indexOf(t.w) >= 0; });
    var mainV = svo.verb[svo.verb.length - 1];
    if (subj3sg && mainV && mainV.pos === 'verb' && !/s$/.test(mainV.w) && svo.verb.length === 1) {
      tips.push('எச்சரிக்கை: எழுவாய் he/she/it — எனவே வினையில் "-s" தேவை ("' + mainV.w + '" → "' + mainV.w + 's").');
    }
    if (tense.en.indexOf('future') === 0 && mainV && /s$/.test(mainV.w)) {
      tips.push('"will"-க்குப் பின் வினை எப்போதும் அடிப்படை வடிவம் — "-s" சேர்க்கக் கூடாது.');
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
      tense = { en: 'future', ta: 'எதிர்காலம்', formula: 'வினை + -गा / -गी / -गे', why: 'பாலினத்திற்கேற்ப -गा (ஆண்), -गी (பெண்), -गे (பன்மை/மரியாதை).' };
    } else if (/(रहा|रही|रहे)/.test(joined)) {
      tense = { en: 'continuous', ta: 'தொடர் காலம்', formula: 'வினை + रहा/रही/रहे + है/हूँ/हैं', why: 'ஆங்கில "-ing" போன்றது. ஆண்/பெண் வேறுபாடு உண்டு.' };
    } else if (/(था|थी|थे)/.test(joined)) {
      tense = { en: 'past', ta: 'இறந்தகாலம்', formula: 'வினை + था / थी / थे', why: 'கடந்த கால நிலை அல்லது பழக்கம்.' };
    } else if (/(ता|ती|ते)\s+(है|हैं|हूँ|हो)/.test(joined) || /(ता|ती|ते)$/.test(words[words.length - 2] || '')) {
      tense = { en: 'present habitual', ta: 'நிகழ்காலம் (வழக்கம்)', formula: 'வினை + ता/ती/ते + है/हैं/हूँ', why: 'தினசரி நடக்கும் செயல்.' };
    } else if (/(या|यी|ये|आ|ीं)$/.test(last) && !/(है|हैं|हूँ|हो)$/.test(last)) {
      tense = { en: 'past perfective', ta: 'இறந்தகாலம் (முடிவுற்ற)', formula: 'வினை + या / यी / ये', why: 'முடிந்த செயல். செயப்படுபொருள் இருந்தால் எழுவாயுடன் "ने" சேரும்.' };
    } else if (/(है|हैं|हूँ|हो)/.test(joined)) {
      tense = { en: 'present (be)', ta: 'நிகழ்காலம் — இருப்பு', formula: 'பெயர்/பெயரடை + है / हैं / हूँ', why: 'ஆங்கில am/is/are போன்றது.' };
    } else if (/(या|यी|ये)$/.test(last)) {
      tense = { en: 'past perfective', ta: 'இறந்தகாலம் (முடிவுற்ற)', formula: 'வினை + या / यी / ये', why: 'முடிந்த செயல். செயப்படுபொருள் இருந்தால் எழுவாயுடன் "ने" சேரும்.' };
    } else {
      tense = { en: 'unclear', ta: 'காலம் தெளிவாக இல்லை', formula: '—', why: 'துணைவினை காணப்படவில்லை.' };
    }

    var isQ = /\?/.test(sentence) || tags.some(function (t) { return t.pos === 'wh'; }) || /^क्या\b/.test(sentence.trim());
    var hasNeg = /(नहीं|ना|मत)/.test(joined);

    var postp = tags.filter(function (t) { return t.pos === 'prep'; })
      .map(function (t) { return t.w + ' = ' + t.ta; });

    var tips = [
      'இந்தியும் தமிழும் ஒரே சொல் வரிசை (SOV) — வினை கடைசியில். இது தமிழருக்கு மிகப் பெரிய சாதகம்.',
      'இந்தியில் ஒவ்வொரு பெயர்ச்சொல்லுக்கும் பாலினம் உண்டு; வினையும் அதற்கேற்ப மாறும். தமிழில் இந்தச் சிக்கல் இல்லை.'
    ];
    if (postp.length) tips.push('பின்னிடைச்சொற்கள் (தமிழ் வேற்றுமை உருபு போல): ' + postp.join(', '));

    return {
      lang: 'hi', source: sentence, tokens: tokens, tags: tags, tense: tense,
      type: { en: isQ ? 'question' : 'statement', ta: isQ ? 'கேள்வி' : 'செய்தி வாக்கியம்',
              note: hasNeg ? 'मत/नहीं இருப்பதால் மறுப்பு வடிவம்.' : 'சாதாரண வாக்கியம்.' },
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
        present: { en: 'present', ta: 'நிகழ்காலம்', formula: 'வினை + கிற் + விகுதி', why: 'ஆங்கிலத்தில் present simple அல்லது present continuous ஆக மாறும் — சூழலைப் பொறுத்து.' },
        past: { en: 'past', ta: 'இறந்தகாலம்', formula: 'வினை + த்/ந்/இன் + விகுதி', why: 'ஆங்கிலத்தில் past simple (-ed அல்லது ஒழுங்கற்ற வடிவம்).' },
        future: { en: 'future', ta: 'எதிர்காலம்', formula: 'வினை + வ்/ப் + விகுதி', why: 'ஆங்கிலத்தில் "will + அடிப்படை வினை".' },
        negative: { en: 'negative', ta: 'மறுப்பு', formula: 'வினை + வில்லை', why: 'ஆங்கிலத்தில் "do not / did not + அடிப்படை வினை".' },
        'negative-future': { en: 'negative future', ta: 'எதிர்கால மறுப்பு', formula: 'வினை + மாட்டேன்', why: 'ஆங்கிலத்தில் "will not + அடிப்படை வினை".' }
      };
      tense = map[verbTag.tense] || map.present;
    } else {
      tense = { en: 'unclear', ta: 'காலம் தெளிவாக இல்லை', formula: '—', why: 'வினைச்சொல் கண்டறியப்படவில்லை.' };
    }

    var isQ = /[?]/.test(sentence) || /(ஆ|ா)\s*[?]?$/.test(sentence.trim()) ||
              tags.some(function (t) { return ['என்ன', 'யார்', 'எங்கே', 'எப்போது', 'ஏன்', 'எப்படி', 'எது'].indexOf(t.w) >= 0; });

    var cases = [];
    tags.forEach(function (t) {
      t.morph.forEach(function (m) {
        if (m.type === 'வேற்றுமை உருபு') cases.push(t.raw + ' → ' + m.suffix + ' (' + m.meaning + ') = ஆங்கிலம் "' + m.en + '"');
      });
    });

    var tips = ['தமிழ் SOV — வினை கடைசியில். ஆங்கிலம் SVO — வினை நடுவில். மொழிபெயர்க்கும்போது வினையை நடுவுக்கு நகர்த்த வேண்டும்.'];
    if (cases.length) tips.push('வேற்றுமை உருபுகள் ஆங்கிலத்தில் **முன்னால்** வரும் முன்னிடைச்சொல் ஆகும்: ' + cases.join(' | '));
    tips.push('ஆங்கிலத்தில் மொழிபெயர்க்கும்போது "a / an / the" சேர்க்க மறக்காதீர்கள் — தமிழில் அவை இல்லை.');

    return {
      lang: 'ta', source: sentence, tokens: tokens, tags: tags, tense: tense,
      type: { en: isQ ? 'question' : 'statement', ta: isQ ? 'கேள்வி' : 'செய்தி வாக்கியம்', note: '' },
      svo: null,
      order: {
        english: 'ஆங்கிலம்: எழுவாய் → வினை → செயப்படுபொருள்',
        tamil: 'தமிழ்: எழுவாய் → செயப்படுபொருள் → வினை',
        reordered: '',
        explain: 'தமிழ் வாக்கியத்தை ஆங்கிலமாக்கும்போது கடைசி வினையை எழுவாய்க்குப் பின் கொண்டு வரவும்.'
      },
      unknown: tags.filter(function (t) { return t.pos !== 'punct' && !t.en; }).map(function (t) { return t.w; }),
      tips: tips,
      posName: function (p) { return { ta: POS_TA[p] || p, en: POS_EN[p] || p }; }
    };

    function tenseTa(t) {
      return { present: 'நிகழ்காலம்', past: 'இறந்தகாலம்', future: 'எதிர்காலம்',
               negative: 'மறுப்பு', 'negative-future': 'எதிர்கால மறுப்பு' }[t] || t;
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
      var langName = { en: 'ஆங்கில', hi: 'இந்தி', ta: 'தமிழ்' }[a.lang] || '';
      steps.push({ text: 'இந்த ' + langName + ' வாக்கியத்தைப் பார்ப்போம்.', lang: 'ta', pause: 350 });
      steps.push({ text: a.source, lang: a.lang, rate: 0.7, pause: 500 });
      steps.push({ text: 'இது ' + a.type.ta + '. காலம்: ' + a.tense.ta + '.', lang: 'ta', pause: 400 });

      var content = a.tags.filter(function (t) { return t.pos !== 'punct'; });
      if (content.length <= 12) {
        steps.push({ text: 'இப்போது சொல்லுக்குச் சொல் பார்ப்போம்.', lang: 'ta', pause: 300 });
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
          var nm = { ta: 'தமிழில்', en: 'ஆங்கிலத்தில்', hi: 'இந்தியில்' }[L] || L;
          steps.push({ text: nm, lang: 'ta', pause: 200 });
          steps.push({ text: translations[L], lang: L, rate: 0.75, pause: 400 });
        });
      }

      steps.push({ text: 'இப்போது நீங்கள் சொல்லிப் பாருங்கள்.', lang: 'ta', pause: 200 });
      steps.push({ text: a.source, lang: a.lang, rate: 0.6, pause: 200 });
      return steps;
    }
  };

  return api;
})();
