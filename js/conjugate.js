/* Tamil Bridge — verb conjugation engines.

   A phrasebook gives you sentences someone else wrote. To reach native-like
   fluency you have to produce forms yourself, so these generate the complete
   paradigm for *any* verb rather than looking one up.

   Hindi is the harder case for a Tamil speaker: the verb agrees with gender as
   well as person, which Tamil never does. The endings are regular; the
   perfective stems of a handful of very common verbs are not, so those are
   listed explicitly.                                                         */
window.TB = window.TB || {};

TB.Conjugate = (function () {

  /* ==================================================================== HINDI */

  /* Perfective stems that do not follow the rule. Everything else is regular. */
  var HI_IRREGULAR_PERFECT = {
    'जा': { m: 'गया', f: 'गई', mp: 'गए', fp: 'गईं' },      /* to go */
    'कर': { m: 'किया', f: 'की', mp: 'किए', fp: 'कीं' },     /* to do */
    'दे': { m: 'दिया', f: 'दी', mp: 'दिए', fp: 'दीं' },      /* to give */
    'ले': { m: 'लिया', f: 'ली', mp: 'लिए', fp: 'लीं' },      /* to take */
    'पी': { m: 'पिया', f: 'पी', mp: 'पिए', fp: 'पीं' },      /* to drink */
    'हो': { m: 'हुआ', f: 'हुई', mp: 'हुए', fp: 'हुईं' }      /* to be / happen */
  };

  /* Stems whose subjunctive/future needs a य glide: आ -> आएगा, not आेगा. */
  function endsInVowel(stem) {
    return /[ािीुूेैोौआईऊओ]$/.test(stem)
        || /[ाीूेैोौ]$/.test(stem)
        || ['आ', 'जा', 'पी', 'दे', 'ले', 'हो', 'खा', 'सो', 'गा', 'रो', 'छू'].indexOf(stem) >= 0;
  }

  function hiStem(infinitive) {
    var v = String(infinitive || '').trim();
    return /ना$/.test(v) ? v.slice(0, -2) : v;
  }

  /* person keys: 1s (मैं) 2s (तू) 2p (तुम) 3s (वह) 1p (हम) 2f (आप) 3p (वे)
     `erg` is the form the subject takes in the perfective of a transitive
     verb — मैंने, उसने, उन्होंने. Getting this wrong is the classic mistake. */
  var HI_PERSONS = [
    { key: '1s', pron: 'मैं',  erg: 'मैंने',   en: 'I',            num: 's', pol: 0 },
    { key: '2s', pron: 'तू',   erg: 'तूने',    en: 'you (intimate)', num: 's', pol: 0 },
    { key: '2p', pron: 'तुम',  erg: 'तुमने',   en: 'you (familiar)', num: 'p', pol: 1 },
    { key: '3s', pron: 'वह',   erg: 'उसने',    en: 'he / she / it', num: 's', pol: 0 },
    { key: '1p', pron: 'हम',   erg: 'हमने',    en: 'we',           num: 'p', pol: 1 },
    { key: '2f', pron: 'आप',   erg: 'आपने',    en: 'you (polite)', num: 'p', pol: 2 },
    { key: '3p', pron: 'वे',   erg: 'उन्होंने', en: 'they',         num: 'p', pol: 1 }
  ];

  /* Intransitive verbs take no ने: वह गया, never उसने गया. Everything not on
     this list is treated as transitive, which is the commoner case. */
  var HI_INTRANSITIVE = ['जा', 'आ', 'हो', 'सो', 'बैठ', 'उठ', 'चल', 'दौड़', 'हँस', 'रो',
    'रह', 'मर', 'गिर', 'निकल', 'पहुँच', 'बन', 'फिर', 'भाग', 'लौट', 'जाग', 'डर', 'थक',
    'बढ़', 'घट', 'खेल', 'नाच', 'उड़', 'बरस', 'जी', 'पिघल'];

  function isTransitive(stem) { return HI_INTRANSITIVE.indexOf(stem) < 0; }

  /* the "to be" verb, which every compound tense leans on */
  var HONA_PRESENT = { '1s': 'हूँ', '2s': 'है', '2p': 'हो', '3s': 'है', '1p': 'हैं', '2f': 'हैं', '3p': 'हैं' };
  function honaPast(person, gender) {
    var p = HI_PERSONS.filter(function (x) { return x.key === person; })[0];
    var plural = p && p.num === 'p';
    if (gender === 'f') return plural ? 'थीं' : 'थी';
    return plural ? 'थे' : 'था';
  }

  /* -ता / -ती / -ते */
  function habitualParticiple(stem, person, gender) {
    var p = HI_PERSONS.filter(function (x) { return x.key === person; })[0];
    var plural = p && p.num === 'p';
    if (gender === 'f') return stem + 'ती';
    return stem + (plural ? 'ते' : 'ता');
  }

  /* रहा / रही / रहे */
  function progressive(person, gender) {
    var p = HI_PERSONS.filter(function (x) { return x.key === person; })[0];
    var plural = p && p.num === 'p';
    if (gender === 'f') return plural ? 'रही' : 'रही';
    return plural ? 'रहे' : 'रहा';
  }

  /* perfective participle: खाया / खाई / खाए */
  function perfective(stem, person, gender) {
    var irr = HI_IRREGULAR_PERFECT[stem];
    var p = HI_PERSONS.filter(function (x) { return x.key === person; })[0];
    var plural = p && p.num === 'p';
    if (irr) return gender === 'f' ? (plural ? irr.fp : irr.f) : (plural ? irr.mp : irr.m);
    if (endsInVowel(stem)) {
      if (gender === 'f') return stem + 'ई';
      return stem + (plural ? 'ए' : 'या');
    }
    if (gender === 'f') return stem + 'ी';
    return stem + (plural ? 'े' : 'ा');
  }

  /* future: करूँगा / करेगा / करेंगे */
  function future(stem, person, gender) {
    var glide = endsInVowel(stem);
    var f = gender === 'f';
    var map = {
      '1s': glide ? 'ऊँ' : 'ूँ',
      '2s': glide ? 'ए'  : 'े',
      '2p': glide ? 'ओ'  : 'ो',
      '3s': glide ? 'ए'  : 'े',
      '1p': glide ? 'एँ' : 'ें',
      '2f': glide ? 'एँ' : 'ें',
      '3p': glide ? 'एँ' : 'ें'
    };
    var tail = {
      '1s': f ? 'गी' : 'गा',
      '2s': f ? 'गी' : 'गा',
      '2p': f ? 'गी' : 'गे',
      '3s': f ? 'गी' : 'गा',
      '1p': f ? 'गी' : 'गे',
      '2f': f ? 'गी' : 'गे',
      '3p': f ? 'गी' : 'गे'
    };
    return stem + map[person] + tail[person];
  }

  /* subjunctive: करूँ / करे / करें */
  function subjunctive(stem, person) {
    var glide = endsInVowel(stem);
    var map = {
      '1s': glide ? 'ऊँ' : 'ूँ',
      '2s': glide ? 'ए'  : 'े',
      '2p': glide ? 'ओ'  : 'ो',
      '3s': glide ? 'ए'  : 'े',
      '1p': glide ? 'एँ' : 'ें',
      '2f': glide ? 'एँ' : 'ें',
      '3p': glide ? 'एँ' : 'ें'
    };
    return stem + map[person];
  }

  function hindi(infinitive, gender) {
    gender = gender === 'f' ? 'f' : 'm';
    var stem = hiStem(infinitive);
    if (!stem) return null;

    var transitive = isTransitive(stem);

    /* `erg` marks a perfective tense. For a transitive verb the subject then
       takes ने — and crucially the verb stops agreeing with the subject
       altogether: मैंने किया, उसने किया, उन्होंने किया are all the same. It
       agrees with the object instead, which the note below explains. */
    function row(build, erg) {
      var ergative = erg && transitive;
      return HI_PERSONS.map(function (p) {
        return {
          person: p.key,
          pron: ergative ? p.erg : p.pron,
          en: p.en,
          /* frozen on the masculine singular when ergative */
          form: ergative ? build('3s') : build(p.key)
        };
      });
    }

    return {
      infinitive: /ना$/.test(infinitive) ? infinitive : stem + 'ना',
      stem: stem,
      gender: gender,
      irregular: !!HI_IRREGULAR_PERFECT[stem],
      transitive: transitive,
      ergativeNote: transitive
        ? 'This verb is transitive, so in the past tenses the subject takes ने: '
          + 'मैंने ' + perfective(stem, '1s', 'm')
          + '. With an object present the verb then agrees with the object, not with you — '
          + 'मैंने किताब पढ़ी (किताब is feminine). Tamil has nothing like this.'
        : 'This verb is intransitive, so it never takes ने: '
          + 'वह ' + perfective(stem, '3s', 'm') + ', not उसने.',
      tenses: [
        { id: 'present', en: 'Present habitual', note: 'what you do regularly',
          formula: 'stem + ता/ती/ते + है/हूँ/हैं',
          rows: row(function (k) { return habitualParticiple(stem, k, gender) + ' ' + HONA_PRESENT[k]; }) },

        { id: 'progressive', en: 'Present continuous', note: 'happening right now',
          formula: 'stem + रहा/रही/रहे + है/हूँ/हैं',
          rows: row(function (k) { return stem + ' ' + progressive(k, gender) + ' ' + HONA_PRESENT[k]; }) },

        { id: 'past', en: 'Simple past', note: 'a completed action',
          formula: 'stem + आ/ई/ए',
          rows: row(function (k) { return perfective(stem, k, gender); }, true) },

        { id: 'pastHabitual', en: 'Past habitual', note: 'what you used to do',
          formula: 'stem + ता/ती/ते + था/थी/थे',
          rows: row(function (k) { return habitualParticiple(stem, k, gender) + ' ' + honaPast(k, gender); }) },

        { id: 'pastProgressive', en: 'Past continuous', note: 'was happening then',
          formula: 'stem + रहा/रही/रहे + था/थी/थे',
          rows: row(function (k) { return stem + ' ' + progressive(k, gender) + ' ' + honaPast(k, gender); }) },

        { id: 'perfect', en: 'Present perfect', note: 'has happened',
          formula: 'stem + आ/ई/ए + है/हूँ/हैं',
          rows: row(function (k) {
            return perfective(stem, k, gender) + ' ' + (transitive ? 'है' : HONA_PRESENT[k]);
          }, true) },

        { id: 'future', en: 'Future', note: 'will happen',
          formula: 'stem + ऊँगा / एगा / एंगे',
          rows: row(function (k) { return future(stem, k, gender); }) },

        { id: 'subjunctive', en: 'Subjunctive', note: 'may / should / shall we',
          formula: 'stem + ऊँ / ए / एँ',
          rows: row(function (k) { return subjunctive(stem, k); }) }
      ],
      imperative: [
        { label: 'तू (intimate)', form: stem, en: 'do it' },
        { label: 'तुम (familiar)', form: stem + (endsInVowel(stem) ? 'ओ' : 'ो'), en: 'do it' },
        { label: 'आप (polite)', form: stem + (endsInVowel(stem) ? 'इए' : 'िए'), en: 'please do it' }
      ],
      negative: {
        present: 'नहीं + ' + habitualParticiple(stem, '1s', gender) + ' ' + HONA_PRESENT['1s'],
        past: stem + ' नहीं ' + perfective(stem, '1s', gender),
        note: 'नहीं goes directly before the verb. In the simple past the है/हूँ is usually dropped.'
      }
    };
  }

  /* ================================================================== ENGLISH */

  function enForms(verb) {
    var v = String(verb || '').trim().toLowerCase().replace(/^to\s+/, '');
    if (!v) return null;
    var irr = TB.IRREGULAR && TB.IRREGULAR[v];

    function third(w) {
      if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
      if (/(s|x|z|ch|sh|o)$/.test(w)) return w + 'es';
      return w + 's';
    }
    function ing(w) {
      if (/ie$/.test(w)) return w.slice(0, -2) + 'ying';
      if (/[^aeiou]e$/.test(w)) return w.slice(0, -1) + 'ing';
      /* one-syllable CVC doubles the final consonant: sit -> sitting */
      if (/^[^aeiou]*[aeiou][bdgklmnprt]$/.test(w)) return w + w.slice(-1) + 'ing';
      return w + 'ing';
    }
    function ed(w) {
      if (/e$/.test(w)) return w + 'd';
      if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied';
      if (/^[^aeiou]*[aeiou][bdgklmnprt]$/.test(w)) return w + w.slice(-1) + 'ed';
      return w + 'ed';
    }

    return {
      base: v,
      third: third(v),
      ing: ing(v),
      past: irr ? irr[0].split('/')[0] : ed(v),
      pastAlt: irr && irr[0].indexOf('/') > 0 ? irr[0].split('/')[1] : '',
      participle: irr ? irr[1] : ed(v),
      irregular: !!irr
    };
  }

  function english(verb, subject) {
    var f = enForms(verb);
    if (!f) return null;
    subject = subject || 'I';
    var s = subject.toLowerCase();
    var third = ['he', 'she', 'it'].indexOf(s) >= 0;
    var be = s === 'i' ? 'am' : (third ? 'is' : 'are');
    var wasWere = (s === 'i' || third) ? 'was' : 'were';
    var have = third ? 'has' : 'have';
    var doDoes = third ? 'does' : 'do';
    var S = subject.charAt(0).toUpperCase() + subject.slice(1);

    function t(name, note, aff, neg, q) {
      return { id: name.toLowerCase().replace(/\s+/g, '-'), en: name, note: note,
               affirmative: aff, negative: neg, question: q };
    }

    return {
      verb: f.base, forms: f, subject: S,
      tenses: [
        t('Present simple', 'habits and general truths',
          S + ' ' + (third ? f.third : f.base) + '.',
          S + ' ' + doDoes + ' not ' + f.base + '.',
          doDoes.charAt(0).toUpperCase() + doDoes.slice(1) + ' ' + s + ' ' + f.base + '?'),
        t('Present continuous', 'happening right now',
          S + ' ' + be + ' ' + f.ing + '.',
          S + ' ' + be + ' not ' + f.ing + '.',
          be.charAt(0).toUpperCase() + be.slice(1) + ' ' + s + ' ' + f.ing + '?'),
        t('Present perfect', 'finished, but still relevant',
          S + ' ' + have + ' ' + f.participle + '.',
          S + ' ' + have + ' not ' + f.participle + '.',
          have.charAt(0).toUpperCase() + have.slice(1) + ' ' + s + ' ' + f.participle + '?'),
        t('Present perfect continuous', 'started earlier, still going',
          S + ' ' + have + ' been ' + f.ing + '.',
          S + ' ' + have + ' not been ' + f.ing + '.',
          have.charAt(0).toUpperCase() + have.slice(1) + ' ' + s + ' been ' + f.ing + '?'),
        t('Past simple', 'finished in the past',
          S + ' ' + f.past + '.',
          S + ' did not ' + f.base + '.',
          'Did ' + s + ' ' + f.base + '?'),
        t('Past continuous', 'was going on then',
          S + ' ' + wasWere + ' ' + f.ing + '.',
          S + ' ' + wasWere + ' not ' + f.ing + '.',
          wasWere.charAt(0).toUpperCase() + wasWere.slice(1) + ' ' + s + ' ' + f.ing + '?'),
        t('Past perfect', 'finished before another past event',
          S + ' had ' + f.participle + '.',
          S + ' had not ' + f.participle + '.',
          'Had ' + s + ' ' + f.participle + '?'),
        t('Past perfect continuous', 'had been going on',
          S + ' had been ' + f.ing + '.',
          S + ' had not been ' + f.ing + '.',
          'Had ' + s + ' been ' + f.ing + '?'),
        t('Future simple', 'will happen',
          S + ' will ' + f.base + '.',
          S + ' will not ' + f.base + '.',
          'Will ' + s + ' ' + f.base + '?'),
        t('Future continuous', 'will be going on',
          S + ' will be ' + f.ing + '.',
          S + ' will not be ' + f.ing + '.',
          'Will ' + s + ' be ' + f.ing + '?'),
        t('Future perfect', 'will be finished by then',
          S + ' will have ' + f.participle + '.',
          S + ' will not have ' + f.participle + '.',
          'Will ' + s + ' have ' + f.participle + '?'),
        t('Going to', 'a plan already made',
          S + ' ' + be + ' going to ' + f.base + '.',
          S + ' ' + be + ' not going to ' + f.base + '.',
          be.charAt(0).toUpperCase() + be.slice(1) + ' ' + s + ' going to ' + f.base + '?')
      ],
      modals: ['can', 'could', 'should', 'must', 'may', 'might', 'would'].map(function (m) {
        return { modal: m, form: S + ' ' + m + ' ' + f.base + '.' };
      }),
      passive: {
        present: 'It ' + 'is' + ' ' + f.participle + '.',
        past: 'It was ' + f.participle + '.',
        future: 'It will be ' + f.participle + '.',
        note: 'The passive uses be + the past participle, and moves the doer out of focus.'
      },
      imperative: { positive: f.base.charAt(0).toUpperCase() + f.base.slice(1) + '!',
                    negative: 'Do not ' + f.base + '.' }
    };
  }

  return {
    hindi: hindi,
    english: english,
    enForms: enForms,
    hiStem: hiStem,
    HI_PERSONS: HI_PERSONS,
    /* verbs worth drilling first, by how often they actually come up */
    COMMON_HI: ['करना', 'होना', 'जाना', 'आना', 'देना', 'लेना', 'खाना', 'पीना', 'बोलना',
      'सुनना', 'देखना', 'पढ़ना', 'लिखना', 'सीखना', 'समझना', 'रहना', 'कहना', 'चलना',
      'सोना', 'उठना', 'बैठना', 'बनाना', 'लाना', 'मिलना', 'खेलना', 'दौड़ना', 'हँसना', 'रोना'],
    COMMON_EN: ['be', 'have', 'do', 'go', 'come', 'eat', 'drink', 'speak', 'listen', 'see',
      'read', 'write', 'learn', 'understand', 'live', 'say', 'walk', 'sleep', 'get up',
      'sit', 'make', 'bring', 'meet', 'play', 'run', 'laugh', 'cry', 'work', 'help', 'take']
  };
})();
