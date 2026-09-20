/* Tamil Bridge — complete alphabet charts.
   Tamil  : 12 உயிர் + 18 மெய் + ஃ + 216 உயிர்மெய் = 247 எழுத்துகள் (grid generated).
   Hindi  : full varnamala + matra table + barakhadi grid (generated).
   English: all 26 letters with names, sounds and Tamil approximations.
   Grids are generated from Unicode combining marks rather than hand-typed, so
   every cell is guaranteed correct.                                           */
window.TB = window.TB || {};

TB.ALPHABET = {};

/* ==================================================================== TAMIL */
(function () {
  var vowels = [
    { ch: 'அ', r: 'a',  sign: '',   kind: 'short', en: 'a as in about' },
    { ch: 'ஆ', r: 'ā',  sign: 'ா', kind: 'long', en: 'aa as in father' },
    { ch: 'இ', r: 'i',  sign: 'ி', kind: 'short', en: 'i as in sit' },
    { ch: 'ஈ', r: 'ī',  sign: 'ீ', kind: 'long', en: 'ee as in see' },
    { ch: 'உ', r: 'u',  sign: 'ு', kind: 'short', en: 'u as in put' },
    { ch: 'ஊ', r: 'ū',  sign: 'ூ', kind: 'long', en: 'oo as in food' },
    { ch: 'எ', r: 'e',  sign: 'ெ', kind: 'short', en: 'e as in bed' },
    { ch: 'ஏ', r: 'ē',  sign: 'ே', kind: 'long', en: 'ay as in day' },
    { ch: 'ஐ', r: 'ai', sign: 'ை', kind: 'long', en: 'i as in my' },
    { ch: 'ஒ', r: 'o',  sign: 'ொ', kind: 'short', en: 'o as in hot' },
    { ch: 'ஓ', r: 'ō',  sign: 'ோ', kind: 'long', en: 'o as in go' },
    { ch: 'ஔ', r: 'au', sign: 'ௌ', kind: 'long', en: 'ow as in now' }
  ];

  var consonants = [
    { base: 'க', r: 'k',  cls: 'hard',  en: 'k / g' },
    { base: 'ங', r: 'ṅ',  cls: 'nasal', en: 'ng as in sing' },
    { base: 'ச', r: 'c',  cls: 'hard',  en: 'ch / s' },
    { base: 'ஞ', r: 'ñ',  cls: 'nasal', en: 'ny as in canyon' },
    { base: 'ட', r: 'ṭ',  cls: 'hard',  en: 't / d (retroflex)' },
    { base: 'ண', r: 'ṇ',  cls: 'nasal', en: 'n (retroflex)' },
    { base: 'த', r: 't',  cls: 'hard',  en: 'th / dh (dental)' },
    { base: 'ந', r: 'n',  cls: 'nasal', en: 'n (dental)' },
    { base: 'ப', r: 'p',  cls: 'hard',  en: 'p / b' },
    { base: 'ம', r: 'm',  cls: 'nasal', en: 'm' },
    { base: 'ய', r: 'y',  cls: 'medium',  en: 'y' },
    { base: 'ர', r: 'r',  cls: 'medium',  en: 'r (tap)' },
    { base: 'ல', r: 'l',  cls: 'medium',  en: 'l' },
    { base: 'வ', r: 'v',  cls: 'medium',  en: 'v / w' },
    { base: 'ழ', r: 'ḻ',  cls: 'medium',  en: 'zh — unique to Tamil' },
    { base: 'ள', r: 'ḷ',  cls: 'medium',  en: 'l (retroflex)' },
    { base: 'ற', r: 'ṟ',  cls: 'hard',  en: 'rr (trill) / t' },
    { base: 'ன', r: 'ṉ',  cls: 'nasal', en: 'n (alveolar)' }
  ];

  var PULLI = '்';

  /* 18 × 12 = 216 உயிர்மெய் */
  var grid = consonants.map(function (c) {
    return {
      base: c.base, r: c.r, cls: c.cls,
      mei: c.base + PULLI,
      cells: vowels.map(function (v) {
        return { ch: c.base + v.sign, r: c.r + v.r, vowel: v.ch };
      })
    };
  });

  TB.ALPHABET.ta = {
    label: { ta: 'Complete Tamil alphabet (247)', en: 'Complete Tamil alphabet (247)' },
    summary: 'uyir 12 + mei 18 + aytham 1 + uyirmei 216 = 247',
    vowels: vowels,
    consonants: consonants.map(function (c) {
      return { ch: c.base + PULLI, base: c.base, r: c.r + '̣', rr: c.r, cls: c.cls, en: c.en };
    }),
    aytham: { ch: 'ஃ', r: 'ḵ', name: 'aytham', en: 'aytham — a breath sound, like a soft /h/' },
    grid: grid,
    vowelSigns: vowels.map(function (v) { return { vowel: v.ch, sign: v.sign || '(no change)', r: v.r }; }),
    notes: [
      '12 vowels (uyir) — these make a sound on their own.',
      '18 consonants (mei) — written with a dot above, and cannot be said alone.',
      '216 compound letters (uyirmei) — each consonant joined to each vowel (18 × 12).',
      'One special letter, aytham (ஃ).',
      'Three groups: hard (க ச ட த ப ற), soft/nasal (ங ஞ ண ந ம ன) and medium (ய ர ல வ ழ ள).'
    ]
  };
})();

/* ==================================================================== HINDI */
(function () {
  var vowels = [
    { ch: 'अ',  r: 'a',   sign: '',    ta: 'அ',   en: 'a as in about' },
    { ch: 'आ',  r: 'ā',   sign: 'ा',  ta: 'ஆ',   en: 'aa as in father' },
    { ch: 'इ',  r: 'i',   sign: 'ि',  ta: 'இ',   en: 'i as in sit' },
    { ch: 'ई',  r: 'ī',   sign: 'ी',  ta: 'ஈ',   en: 'ee as in see' },
    { ch: 'उ',  r: 'u',   sign: 'ु',  ta: 'உ',   en: 'u as in put' },
    { ch: 'ऊ',  r: 'ū',   sign: 'ू',  ta: 'ஊ',   en: 'oo as in food' },
    { ch: 'ऋ',  r: 'ṛ',   sign: 'ृ',  ta: 'ரி',  en: 'ri — Sanskrit vowel' },
    { ch: 'ए',  r: 'e',   sign: 'े',  ta: 'ஏ',   en: 'ay as in day' },
    { ch: 'ऐ',  r: 'ai',  sign: 'ै',  ta: 'ஐ',   en: 'ai as in air' },
    { ch: 'ओ',  r: 'o',   sign: 'ो',  ta: 'ஓ',   en: 'o as in go' },
    { ch: 'औ',  r: 'au',  sign: 'ौ',  ta: 'ஔ',   en: 'au as in caught' },
    { ch: 'अं', r: 'aṁ',  sign: 'ं',  ta: 'அம்', en: 'anusvara — nasal' },
    { ch: 'अः', r: 'aḥ',  sign: 'ः',  ta: 'அஃ',  en: 'visarga — breath' }
  ];

  var rows = [
    { name: 'कवर्ग (velars)', items: [
      { ch: 'क', r: 'ka',  ta: 'க',    en: 'k' },
      { ch: 'ख', r: 'kha', ta: 'க்ஹ',  en: 'k + breath', asp: true },
      { ch: 'ग', r: 'ga',  ta: 'க(g)', en: 'g', hard: true },
      { ch: 'घ', r: 'gha', ta: 'க(gh)', en: 'g + breath', asp: true, hard: true },
      { ch: 'ङ', r: 'ṅa',  ta: 'ங',    en: 'ng' }] },
    { name: 'चवर्ग (palatals)', items: [
      { ch: 'च', r: 'ca',  ta: 'ச',    en: 'ch' },
      { ch: 'छ', r: 'cha', ta: 'ச்ஹ',  en: 'ch + breath', asp: true },
      { ch: 'ज', r: 'ja',  ta: 'ஜ',    en: 'j' },
      { ch: 'झ', r: 'jha', ta: 'ஜ்ஹ',  en: 'j + breath', asp: true, hard: true },
      { ch: 'ञ', r: 'ña',  ta: 'ஞ',    en: 'ny' }] },
    { name: 'टवर्ग (retroflex)', items: [
      { ch: 'ट', r: 'ṭa',  ta: 'ட',    en: 't (retroflex)' },
      { ch: 'ठ', r: 'ṭha', ta: 'ட்ஹ',  en: 't + breath', asp: true },
      { ch: 'ड', r: 'ḍa',  ta: 'ட(d)', en: 'd (retroflex)', hard: true },
      { ch: 'ढ', r: 'ḍha', ta: 'ட(dh)', en: 'd + breath', asp: true, hard: true },
      { ch: 'ण', r: 'ṇa',  ta: 'ண',    en: 'n (retroflex)' }] },
    { name: 'तवर्ग (dentals)', items: [
      { ch: 'त', r: 'ta',  ta: 'த',    en: 'th (dental)' },
      { ch: 'थ', r: 'tha', ta: 'த்ஹ',  en: 'th + breath', asp: true },
      { ch: 'द', r: 'da',  ta: 'த(d)', en: 'dh', hard: true },
      { ch: 'ध', r: 'dha', ta: 'த(dh)', en: 'dh + breath', asp: true, hard: true },
      { ch: 'न', r: 'na',  ta: 'ந',    en: 'n' }] },
    { name: 'पवर्ग (labials)', items: [
      { ch: 'प', r: 'pa',  ta: 'ப',    en: 'p' },
      { ch: 'फ', r: 'pha', ta: 'ஃப',   en: 'p + breath / f', asp: true },
      { ch: 'ब', r: 'ba',  ta: 'ப(b)', en: 'b', hard: true },
      { ch: 'भ', r: 'bha', ta: 'ப(bh)', en: 'b + breath', asp: true, hard: true },
      { ch: 'म', r: 'ma',  ta: 'ம',    en: 'm' }] },
    { name: 'अंतस्थ (semivowels)', items: [
      { ch: 'य', r: 'ya', ta: 'ய', en: 'y' },
      { ch: 'र', r: 'ra', ta: 'ர', en: 'r' },
      { ch: 'ल', r: 'la', ta: 'ல', en: 'l' },
      { ch: 'व', r: 'va', ta: 'வ', en: 'v / w' }] },
    { name: 'ऊष्म (sibilants & h)', items: [
      { ch: 'श', r: 'śa', ta: 'ஷ', en: 'sh (palatal)' },
      { ch: 'ष', r: 'ṣa', ta: 'ஷ', en: 'sh (retroflex)' },
      { ch: 'स', r: 'sa', ta: 'ஸ', en: 's' },
      { ch: 'ह', r: 'ha', ta: 'ஹ', en: 'h' }] },
    { name: 'संयुक्त (conjuncts)', items: [
      { ch: 'क्ष', r: 'kṣa', ta: 'க்ஷ', en: 'ksh' },
      { ch: 'त्र', r: 'tra', ta: 'த்ர', en: 'tr' },
      { ch: 'ज्ञ', r: 'jña', ta: 'க்ஞ', en: 'gy' }] },
    { name: 'नुक़्ता (borrowed sounds)', items: [
      { ch: 'क़', r: 'qa', ta: 'க',     en: 'q (uvular)', hard: true },
      { ch: 'ख़', r: 'x̱a', ta: 'க்ஹ',  en: 'kh (Persian)', hard: true },
      { ch: 'ग़', r: 'ġa', ta: 'க',     en: 'gh (Persian)', hard: true },
      { ch: 'ज़', r: 'za', ta: 'ஜ(z)',  en: 'z', hard: true },
      { ch: 'ड़', r: 'ṛa', ta: 'ர',     en: 'flapped r — tongue curls back and taps', hard: true },
      { ch: 'ढ़', r: 'ṛha', ta: 'ர்ஹ',  en: 'flapped r with breath', hard: true },
      { ch: 'फ़', r: 'fa', ta: 'ஃப',    en: 'f', hard: true }] }
  ];

  /* barakhadi: each main consonant × 12 vowel matras */
  var mainCons = [];
  rows.slice(0, 7).forEach(function (r) { r.items.forEach(function (i) { mainCons.push(i); }); });
  var matras = vowels.slice(0, 11);

  var grid = mainCons.map(function (c) {
    return {
      base: c.ch, r: c.r, ta: c.ta,
      halant: c.ch + '्',
      cells: matras.map(function (v) {
        return { ch: c.ch + v.sign, r: c.r.replace(/a$/, '') + v.r, vowel: v.ch };
      })
    };
  });

  TB.ALPHABET.hi = {
    label: { ta: 'Complete Hindi alphabet', en: 'Complete Hindi alphabet' },
    summary: 'स्वर 13 + व्यंजन 33 + संयुक्त 3 + नुक़्ता 7',
    vowels: vowels,
    rows: rows,
    grid: grid,
    matras: vowels.map(function (v) { return { vowel: v.ch, sign: v.sign || '(no sign)', r: v.r, ta: v.ta }; }),
    notes: [
      '13 vowels (स्वर) — these make a sound on their own.',
      '33 consonants (व्यंजन) — each already contains a short "a" sound (क = "ka", not "k").',
      'Adding halant (्) removes that vowel: क् = "k" — exactly like the Tamil dot.',
      'A matra is a vowel sign attached to a consonant: क + ी = की.',
      'Aspirated sounds (ख छ ठ थ फ) do not exist in Tamil — hold your hand in front of your mouth and feel the puff of air.'
    ]
  };
})();

/* ================================================================== ENGLISH */
(function () {
  var letters = [
    { ch: 'A', low: 'a', name: 'ஏ',    type: 'vowel',     sounds: ['/æ/ cat', '/eɪ/ cake', '/ə/ about'], ta: 'அ / ஆ / ஏ' },
    { ch: 'B', low: 'b', name: 'பீ',   type: 'consonant', sounds: ['/b/ bat'], ta: 'ப்(b)' },
    { ch: 'C', low: 'c', name: 'ஸீ',   type: 'consonant', sounds: ['/k/ cat', '/s/ city'], ta: 'க் / ஸ்' },
    { ch: 'D', low: 'd', name: 'டீ',   type: 'consonant', sounds: ['/d/ dog'], ta: 'ட்(d)' },
    { ch: 'E', low: 'e', name: 'ஈ',    type: 'vowel',     sounds: ['/e/ bed', '/iː/ he', 'silent: make'], ta: 'எ / ஈ' },
    { ch: 'F', low: 'f', name: 'எஃப்', type: 'consonant', sounds: ['/f/ fish'], ta: 'ஃப்' },
    { ch: 'G', low: 'g', name: 'ஜீ',   type: 'consonant', sounds: ['/ɡ/ go', '/dʒ/ giant'], ta: 'க்(g) / ஜ்' },
    { ch: 'H', low: 'h', name: 'ஏச்',  type: 'consonant', sounds: ['/h/ hat', 'silent: hour'], ta: 'ஹ்' },
    { ch: 'I', low: 'i', name: 'ஐ',    type: 'vowel',     sounds: ['/ɪ/ sit', '/aɪ/ mine'], ta: 'இ / ஐ' },
    { ch: 'J', low: 'j', name: 'ஜே',   type: 'consonant', sounds: ['/dʒ/ jump'], ta: 'ஜ்' },
    { ch: 'K', low: 'k', name: 'கே',   type: 'consonant', sounds: ['/k/ key', 'silent: know'], ta: 'க்' },
    { ch: 'L', low: 'l', name: 'எல்',  type: 'consonant', sounds: ['/l/ leg'], ta: 'ல்' },
    { ch: 'M', low: 'm', name: 'எம்',  type: 'consonant', sounds: ['/m/ man'], ta: 'ம்' },
    { ch: 'N', low: 'n', name: 'என்',  type: 'consonant', sounds: ['/n/ no', '/ŋ/ think'], ta: 'ன் / ங்' },
    { ch: 'O', low: 'o', name: 'ஓ',    type: 'vowel',     sounds: ['/ɒ/ hot', '/oʊ/ go', '/ʌ/ son'], ta: 'ஒ / ஓ / அ' },
    { ch: 'P', low: 'p', name: 'பீ',   type: 'consonant', sounds: ['/p/ pen', 'silent: psychology'], ta: 'ப்' },
    { ch: 'Q', low: 'q', name: 'க்யூ', type: 'consonant', sounds: ['/kw/ queen'], ta: 'க்வ்' },
    { ch: 'R', low: 'r', name: 'ஆர்',  type: 'consonant', sounds: ['/r/ red'], ta: 'ர் (உருட்டாமல்)' },
    { ch: 'S', low: 's', name: 'எஸ்',  type: 'consonant', sounds: ['/s/ sun', '/z/ rose', '/ʃ/ sugar'], ta: 'ஸ் / ஸ்(z) / ஷ்' },
    { ch: 'T', low: 't', name: 'டீ',   type: 'consonant', sounds: ['/t/ tea', '/tʃ/ nature', 'silent: listen'], ta: 'ட்' },
    { ch: 'U', low: 'u', name: 'யூ',   type: 'vowel',     sounds: ['/ʌ/ cup', '/juː/ use', '/ʊ/ put'], ta: 'அ / யூ / உ' },
    { ch: 'V', low: 'v', name: 'வீ',   type: 'consonant', sounds: ['/v/ van'], ta: 'வ் (உதடு-பல்)' },
    { ch: 'W', low: 'w', name: 'டபிள்யூ', type: 'consonant', sounds: ['/w/ water', 'silent: write'], ta: 'வ் (உதடு-உதடு)' },
    { ch: 'X', low: 'x', name: 'எக்ஸ்', type: 'consonant', sounds: ['/ks/ box', '/z/ xylophone'], ta: 'க்ஸ்' },
    { ch: 'Y', low: 'y', name: 'வை',   type: 'semi-vowel', sounds: ['/j/ yes', '/aɪ/ my', '/i/ happy'], ta: 'ய் / ஐ / இ' },
    { ch: 'Z', low: 'z', name: 'ஸெட்', type: 'consonant', sounds: ['/z/ zoo'], ta: 'ஸ்(z)' }
  ];

  TB.ALPHABET.en = {
    label: { ta: 'English alphabet — 26 letters', en: 'English alphabet — 26 letters' },
    summary: 'Vowels 5 (A E I O U) + Semi-vowel 1 (Y) + Consonants 20',
    letters: letters,
    vowels: letters.filter(function (l) { return l.type === 'vowel'; }),
    consonants: letters.filter(function (l) { return l.type === 'consonant'; }),
    semivowels: letters.filter(function (l) { return l.type === 'semi-vowel'; }),
    notes: [
      'English has 26 letters but 44 sounds — one letter can make several different sounds.',
      '5 vowels (A E I O U). Y acts as a vowel in "my" and as a consonant in "yes".',
      'Unlike Tamil, English is not written as it sounds — you have to learn each word’s pronunciation separately.',
      'Silent letters are very common: know, write, hour, listen, lamb.'
    ]
  };
})();
