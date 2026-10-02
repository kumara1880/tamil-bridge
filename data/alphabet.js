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
  /* say  — how to read it, for somebody who reads English letters
     r    — the scholarly transliteration, kept because the rest of the app
            and every dictionary uses it
     ex   — a word a child already knows, with the letter in it. A sound is
            learnt in a word, not on its own, and one character by itself is
            also the thing a speech engine reads worst. */
  var vowels = [
    { ch: 'அ', r: 'a',  say: 'a',   sign: '',   kind: 'short', en: 'a as in about',
      ex: 'அம்மா', exR: 'ammā', exEn: 'mother', pic: '👩' },
    { ch: 'ஆ', r: 'ā',  say: 'aa',  sign: 'ா', kind: 'long', en: 'aa as in father',
      ex: 'ஆடு', exR: 'āḍu', exEn: 'goat', pic: '🐐' },
    { ch: 'இ', r: 'i',  say: 'i',   sign: 'ி', kind: 'short', en: 'i as in sit',
      ex: 'இலை', exR: 'ilai', exEn: 'leaf', pic: '🍃' },
    { ch: 'ஈ', r: 'ī',  say: 'ee',  sign: 'ீ', kind: 'long', en: 'ee as in see',
      ex: 'ஈ', exR: 'ī', exEn: 'a fly', pic: '🪰' },
    { ch: 'உ', r: 'u',  say: 'u',   sign: 'ு', kind: 'short', en: 'u as in put',
      ex: 'உடல்', exR: 'uḍal', exEn: 'body', pic: '🧍' },
    { ch: 'ஊ', r: 'ū',  say: 'oo',  sign: 'ூ', kind: 'long', en: 'oo as in food',
      ex: 'ஊர்', exR: 'ūr', exEn: 'town', pic: '🏘️' },
    { ch: 'எ', r: 'e',  say: 'e',   sign: 'ெ', kind: 'short', en: 'e as in bed',
      ex: 'எலி', exR: 'eli', exEn: 'rat', pic: '🐀' },
    { ch: 'ஏ', r: 'ē',  say: 'ay',  sign: 'ே', kind: 'long', en: 'ay as in day',
      ex: 'ஏணி', exR: 'ēṇi', exEn: 'ladder', pic: '🪜' },
    { ch: 'ஐ', r: 'ai', say: 'ai',  sign: 'ை', kind: 'long', en: 'i as in my',
      ex: 'ஐந்து', exR: 'aindu', exEn: 'five', pic: '5️⃣' },
    { ch: 'ஒ', r: 'o',  say: 'o',   sign: 'ொ', kind: 'short', en: 'o as in hot',
      ex: 'ஒட்டகம்', exR: 'oṭṭagam', exEn: 'camel', pic: '🐪' },
    { ch: 'ஓ', r: 'ō',  say: 'oh',  sign: 'ோ', kind: 'long', en: 'o as in go',
      ex: 'ஓடு', exR: 'ōḍu', exEn: 'run', pic: '🏃' },
    { ch: 'ஔ', r: 'au', say: 'au',  sign: 'ௌ', kind: 'long', en: 'ow as in now',
      ex: 'ஔவை', exR: 'auvai', exEn: 'Auvaiyar', pic: '👵' }
  ];

  /* say — how the letter reads when it stands at the head of a word, which
     is how a child is taught to name it. Six of these change sound in the
     middle of a word, and the second form is given after the slash.

     Seven letters (ங ஞ ண ழ ள ற ன) never begin a Tamil word, so their
     example shows them where they really occur. */
  var consonants = [
    { base: 'க', r: 'k',  say: 'ka',  cls: 'hard',   en: 'k at the start, g between vowels',
      ex: 'கல்', exR: 'kal', exEn: 'stone',
      mei: 'இக்', meiSay: 'ik', pic: '🪨' },
    { base: 'ங', r: 'ṅ',  say: 'nga', cls: 'nasal',  en: 'ng as in sing',
      ex: 'அங்கே', exR: 'angē', exEn: 'there',
      mei: 'இங்', meiSay: 'ing', pic: '👉' },
    { base: 'ச', r: 'c',  say: 'sa',  cls: 'hard',   en: 's at the start, ch when doubled',
      ex: 'சட்டை', exR: 'saṭṭai', exEn: 'shirt',
      mei: 'இச்', meiSay: 'ich', pic: '👕' },
    { base: 'ஞ', r: 'ñ',  say: 'nya', cls: 'nasal',  en: 'ny as in canyon',
      ex: 'ஞாயிறு', exR: 'ñāyiṟu', exEn: 'sun, Sunday',
      mei: 'இஞ்', meiSay: 'inj', pic: '☀️' },
    { base: 'ட', r: 'ṭ',  say: 'ta',  cls: 'hard',   en: 'hard t with the tongue curled back',
      ex: 'படம்', exR: 'paḍam', exEn: 'picture',
      mei: 'இட்', meiSay: 'it', pic: '🖼️' },
    { base: 'ண', r: 'ṇ',  say: 'na',  cls: 'nasal',  en: 'n with the tongue curled back',
      ex: 'மண்', exR: 'maṇ', exEn: 'soil',
      mei: 'இண்', meiSay: 'in', pic: '🟫' },
    { base: 'த', r: 't',  say: 'tha', cls: 'hard',   en: 'th on the teeth, dh between vowels',
      ex: 'தம்பி', exR: 'thambi', exEn: 'younger brother',
      mei: 'இத்', meiSay: 'ith', pic: '👦' },
    { base: 'ந', r: 'n',  say: 'na',  cls: 'nasal',  en: 'n on the teeth — the n that starts words',
      ex: 'நரி', exR: 'nari', exEn: 'fox',
      mei: 'இந்', meiSay: 'in', pic: '🦊' },
    { base: 'ப', r: 'p',  say: 'pa',  cls: 'hard',   en: 'p at the start, b between vowels',
      ex: 'பல்', exR: 'pal', exEn: 'tooth',
      mei: 'இப்', meiSay: 'ip', pic: '🦷' },
    { base: 'ம', r: 'm',  say: 'ma',  cls: 'nasal',  en: 'm',
      ex: 'மரம்', exR: 'maram', exEn: 'tree',
      mei: 'இம்', meiSay: 'im', pic: '🌳' },
    { base: 'ய', r: 'y',  say: 'ya',  cls: 'medium', en: 'y as in yes',
      ex: 'யானை', exR: 'yāṉai', exEn: 'elephant',
      mei: 'இய்', meiSay: 'iy', pic: '🐘' },
    { base: 'ர', r: 'r',  say: 'ra',  cls: 'medium', en: 'r — one light tap of the tongue',
      ex: 'மரம்', exR: 'maram', exEn: 'tree',
      mei: 'இர்', meiSay: 'ir', pic: '🌳' },
    { base: 'ல', r: 'l',  say: 'la',  cls: 'medium', en: 'l with the tongue behind the teeth',
      ex: 'மலை', exR: 'malai', exEn: 'hill',
      mei: 'இல்', meiSay: 'il', pic: '⛰️' },
    { base: 'வ', r: 'v',  say: 'va',  cls: 'medium', en: 'v',
      ex: 'வானம்', exR: 'vāṉam', exEn: 'sky',
      mei: 'இவ்', meiSay: 'iv', pic: '🌌' },
    { base: 'ழ', r: 'ḻ',  say: 'zha', cls: 'medium', en: 'zh — the sound Tamil is named for',
      ex: 'மழை', exR: 'maẓai', exEn: 'rain',
      mei: 'இழ்', meiSay: 'izh', pic: '🌧️' },
    { base: 'ள', r: 'ḷ',  say: 'la',  cls: 'medium', en: 'l with the tongue curled back',
      ex: 'வாள்', exR: 'vāḷ', exEn: 'sword',
      mei: 'இள்', meiSay: 'il', pic: '🗡️' },
    { base: 'ற', r: 'ṟ',  say: 'ra',  cls: 'hard',   en: 'a hard, rolled r — not ர',
      ex: 'ஆறு', exR: 'āṟu', exEn: 'river',
      mei: 'இற்', meiSay: 'ir', pic: '🏞️' },
    { base: 'ன', r: 'ṉ',  say: 'na',  cls: 'nasal',  en: 'n on the ridge — the n inside words',
      ex: 'பன்னி', exR: 'paṉṉi', exEn: 'pig',
      mei: 'இன்', meiSay: 'in', pic: '🐷' }
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
      /* say    — க, the sound it makes joined to its vowel: "ka"
         meiSay — இக், the name of the letter on its own: "ik"
         A child is taught both, and the chart used to give neither. */
      return { ch: c.base + PULLI, base: c.base, r: c.r + '̣', rr: c.r, say: c.say,
               mei: c.mei, meiSay: c.meiSay, pic: c.pic,
               cls: c.cls, en: c.en, ex: c.ex, exR: c.exR, exEn: c.exEn };
    }),
    aytham: { ch: 'ஃ', r: 'ḵ', say: 'ah', name: 'aytham', base: 'ஃ',
              en: 'aytham — a breath, and what carries borrowed sounds: ஃப is f',
              ex: 'எஃகு', exR: 'ehku', exEn: 'steel', pic: '⚙️' },
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
    { ch: 'अ',  r: 'a',   say: 'a',   sign: '',    ta: 'அ',   en: 'a as in about',
      ex: 'अनार', exR: 'anār', exEn: 'pomegranate' },
    { ch: 'आ',  r: 'ā',   say: 'aa',  sign: 'ा',  ta: 'ஆ',   en: 'aa as in father',
      ex: 'आम', exR: 'ām', exEn: 'mango', pic: '🥭' },
    { ch: 'इ',  r: 'i',   say: 'i',   sign: 'ि',  ta: 'இ',   en: 'i as in sit',
      ex: 'इमली', exR: 'imalī', exEn: 'tamarind' },
    { ch: 'ई',  r: 'ī',   say: 'ee',  sign: 'ी',  ta: 'ஈ',   en: 'ee as in see',
      ex: 'ईख', exR: 'īkh', exEn: 'sugarcane' },
    { ch: 'उ',  r: 'u',   say: 'u',   sign: 'ु',  ta: 'உ',   en: 'u as in put',
      ex: 'उल्लू', exR: 'ullū', exEn: 'owl', pic: '🦉' },
    { ch: 'ऊ',  r: 'ū',   say: 'oo',  sign: 'ू',  ta: 'ஊ',   en: 'oo as in food',
      ex: 'ऊन', exR: 'ūn', exEn: 'wool', pic: '🧶' },
    { ch: 'ऋ',  r: 'ṛ',   say: 'ri',  sign: 'ृ',  ta: 'ரி',  en: 'ri — only in words from Sanskrit',
      ex: 'ऋषि', exR: 'ṛshi', exEn: 'sage', pic: '🧘' },
    { ch: 'ए',  r: 'e',   say: 'ay',  sign: 'े',  ta: 'ஏ',   en: 'ay as in day',
      ex: 'एक', exR: 'ek', exEn: 'one', pic: '1️⃣' },
    { ch: 'ऐ',  r: 'ai',  say: 'ai',  sign: 'ै',  ta: 'ஐ',   en: 'e as in air',
      ex: 'ऐनक', exR: 'ainak', exEn: 'spectacles', pic: '👓' },
    { ch: 'ओ',  r: 'o',   say: 'oh',  sign: 'ो',  ta: 'ஓ',   en: 'o as in go',
      ex: 'ओखली', exR: 'okhalī', exEn: 'mortar' },
    { ch: 'औ',  r: 'au',  say: 'au',  sign: 'ौ',  ta: 'ஔ',   en: 'au as in caught',
      ex: 'औरत', exR: 'aurat', exEn: 'woman', pic: '👩' },
    { ch: 'अं', r: 'aṁ',  say: 'an',  sign: 'ं',  ta: 'அன்', en: 'anusvara — the nasal that follows a vowel',
      ex: 'अंगूर', exR: 'angūr', exEn: 'grapes', pic: '🍇' },
    { ch: 'अः', r: 'aḥ',  say: 'ah',  sign: 'ः',  ta: 'அஃ',  en: 'visarga — a breath after the vowel',
      ex: 'प्रातः', exR: 'prātaḥ', exEn: 'dawn' }
  ];

  var rows = [
    { name: 'कवर्ग (velars)', items: [
      { ch: 'क', r: 'ka',  say: 'ka',  ta: 'க',     en: 'k — no puff of air',
        ex: 'कमल', exR: 'kamal', exEn: 'lotus', pic: '🪷' },
      { ch: 'ख', r: 'kha', say: 'kha', ta: 'க(kh)', en: 'k with a puff of air', asp: true,
        ex: 'खरगोश', exR: 'khargosh', exEn: 'rabbit', pic: '🐰' },
      { ch: 'ग', r: 'ga',  say: 'ga',  ta: 'க(g)',  en: 'g — no puff of air', hard: true,
        ex: 'गाय', exR: 'gāy', exEn: 'cow', pic: '🐄' },
      { ch: 'घ', r: 'gha', say: 'gha', ta: 'க(gh)', en: 'g with a puff of air', asp: true, hard: true,
        ex: 'घड़ी', exR: 'ghaṛī', exEn: 'clock', pic: '⏰' },
      { ch: 'ङ', r: 'ṅa',  say: 'nga', ta: 'ங',     en: 'ng as in sing — never starts a word',
        ex: 'रंग', exR: 'rang', exEn: 'colour', pic: '🎨' }] },
    { name: 'चवर्ग (palatals)', items: [
      { ch: 'च', r: 'ca',  say: 'cha', ta: 'ச',     en: 'ch — no puff of air',
        ex: 'चाँद', exR: 'chānd', exEn: 'moon', pic: '🌙' },
      { ch: 'छ', r: 'cha', say: 'chha', ta: 'ச(chh)', en: 'ch with a puff of air', asp: true,
        ex: 'छाता', exR: 'chhātā', exEn: 'umbrella', pic: '☂️' },
      { ch: 'ज', r: 'ja',  say: 'ja',  ta: 'ஜ',     en: 'j — no puff of air',
        ex: 'जहाज', exR: 'jahāj', exEn: 'ship', pic: '🚢' },
      { ch: 'झ', r: 'jha', say: 'jha', ta: 'ஜ(jh)', en: 'j with a puff of air', asp: true, hard: true,
        ex: 'झंडा', exR: 'jhaṇḍā', exEn: 'flag', pic: '🚩' },
      { ch: 'ञ', r: 'ña',  say: 'nya', ta: 'ஞ',     en: 'ny as in canyon — never starts a word',
        ex: 'ज्ञान', exR: 'gyān', exEn: 'knowledge', pic: '📚' }] },
    { name: 'टवर्ग (retroflex)', items: [
      { ch: 'ट', r: 'ṭa',  say: 'ta',  ta: 'ட',     en: 't with the tongue curled back',
        ex: 'टमाटर', exR: 'ṭamāṭar', exEn: 'tomato', pic: '🍅' },
      { ch: 'ठ', r: 'ṭha', say: 'tha', ta: 'ட(th)', en: 'the same, with a puff of air', asp: true,
        ex: 'ठेला', exR: 'ṭhelā', exEn: 'cart', pic: '🛒' },
      { ch: 'ड', r: 'ḍa',  say: 'da',  ta: 'ட(d)',  en: 'd with the tongue curled back', hard: true,
        ex: 'डब्बा', exR: 'ḍabbā', exEn: 'box', pic: '📦' },
      { ch: 'ढ', r: 'ḍha', say: 'dha', ta: 'ட(dh)', en: 'the same, with a puff of air', asp: true, hard: true,
        ex: 'ढोल', exR: 'ḍhol', exEn: 'drum', pic: '🥁' },
      { ch: 'ण', r: 'ṇa',  say: 'na',  ta: 'ண',     en: 'n with the tongue curled back — never starts a word',
        ex: 'गणेश', exR: 'gaṇesh', exEn: 'Ganesh', pic: '🕉️' }] },
    { name: 'तवर्ग (dentals)', items: [
      /* त was labelled "th" and द was labelled "dh" — the names that belong
         to थ and ध one line below. Both of these are the plain, unaspirated
         pair: tongue on the teeth, no puff of air. */
      { ch: 'त', r: 'ta',  say: 'ta',  ta: 'த',     en: 't on the teeth — no puff of air',
        ex: 'तितली', exR: 'titlī', exEn: 'butterfly', pic: '🦋' },
      { ch: 'थ', r: 'tha', say: 'tha', ta: 'த(th)', en: 'the same, with a puff of air', asp: true,
        ex: 'थाली', exR: 'thālī', exEn: 'plate', pic: '🍽️' },
      { ch: 'द', r: 'da',  say: 'da',  ta: 'த(d)',  en: 'd on the teeth — no puff of air', hard: true,
        ex: 'दवात', exR: 'davāt', exEn: 'inkpot', pic: '🖋️' },
      { ch: 'ध', r: 'dha', say: 'dha', ta: 'த(dh)', en: 'the same, with a puff of air', asp: true, hard: true,
        ex: 'धनुष', exR: 'dhanush', exEn: 'bow', pic: '🏹' },
      { ch: 'न', r: 'na',  say: 'na',  ta: 'ந',     en: 'n on the teeth',
        ex: 'नल', exR: 'nal', exEn: 'tap', pic: '🚰' }] },
    { name: 'पवर्ग (labials)', items: [
      { ch: 'प', r: 'pa',  say: 'pa',  ta: 'ப',     en: 'p — no puff of air',
        ex: 'पतंग', exR: 'patang', exEn: 'kite', pic: '🪁' },
      { ch: 'फ', r: 'pha', say: 'pha', ta: 'ஃப',    en: 'p with a puff of air; f in borrowed words', asp: true,
        ex: 'फल', exR: 'phal', exEn: 'fruit', pic: '🍎' },
      { ch: 'ब', r: 'ba',  say: 'ba',  ta: 'ப(b)',  en: 'b — no puff of air', hard: true,
        ex: 'बकरी', exR: 'bakrī', exEn: 'goat', pic: '🐐' },
      { ch: 'भ', r: 'bha', say: 'bha', ta: 'ப(bh)', en: 'b with a puff of air', asp: true, hard: true,
        ex: 'भालू', exR: 'bhālū', exEn: 'bear', pic: '🐻' },
      { ch: 'म', r: 'ma',  say: 'ma',  ta: 'ம',     en: 'm',
        ex: 'मछली', exR: 'machhlī', exEn: 'fish', pic: '🐟' }] },
    { name: 'अंतस्थ (semivowels)', items: [
      { ch: 'य', r: 'ya', say: 'ya', ta: 'ய', en: 'y as in yes',
        ex: 'यज्ञ', exR: 'yagya', exEn: 'ritual fire', pic: '🔥' },
      { ch: 'र', r: 'ra', say: 'ra', ta: 'ர', en: 'r — one light tap',
        ex: 'रथ', exR: 'rath', exEn: 'chariot' },
      { ch: 'ल', r: 'la', say: 'la', ta: 'ல', en: 'l',
        ex: 'लड्डू', exR: 'laddū', exEn: 'laddu', pic: '🍬' },
      { ch: 'व', r: 'va', say: 'va', ta: 'வ', en: 'v, and w in some words',
        ex: 'वन', exR: 'van', exEn: 'forest', pic: '🌳' }] },
    { name: 'ऊष्म (sibilants & h)', items: [
      { ch: 'श', r: 'śa', say: 'sha', ta: 'ஷ', en: 'sh as in ship',
        ex: 'शेर', exR: 'sher', exEn: 'lion', pic: '🦁' },
      { ch: 'ष', r: 'ṣa', say: 'sha', ta: 'ஷ', en: 'sh with the tongue curled back',
        ex: 'षट्कोण', exR: 'shaṭkoṇ', exEn: 'hexagon' },
      { ch: 'स', r: 'sa', say: 'sa',  ta: 'ஸ', en: 's',
        ex: 'सूरज', exR: 'sūraj', exEn: 'sun', pic: '☀️' },
      { ch: 'ह', r: 'ha', say: 'ha',  ta: 'ஹ', en: 'h as in hat',
        ex: 'हाथी', exR: 'hāthī', exEn: 'elephant', pic: '🐘' }] },
    { name: 'संयुक्त (conjuncts)', items: [
      { ch: 'क्ष', r: 'kṣa', say: 'ksha', ta: 'க்ஷ', en: 'k and sh run together',
        ex: 'क्षमा', exR: 'kshmā', exEn: 'forgiveness', pic: '🙏' },
      { ch: 'त्र', r: 'tra', say: 'tra', ta: 'த்ர', en: 't and r run together',
        ex: 'त्रिशूल', exR: 'trishūl', exEn: 'trident', pic: '🔱' },
      { ch: 'ज्ञ', r: 'jña', say: 'gya', ta: 'க்ஞ', en: 'written j + ञ, but said gy',
        ex: 'ज्ञान', exR: 'gyān', exEn: 'knowledge', pic: '📚' }] },
    /* A dot under the letter, for sounds Hindi took from Persian, Arabic
       and English. Tamil has none of them either, so the approximation is
       the nearest Tamil letter with the real sound named beside it. */
    { name: 'नुक़्ता (borrowed sounds)', items: [
      { ch: 'क़', r: 'qa', say: 'qa', ta: 'க(q)',  en: 'k made far back in the throat', hard: true,
        ex: 'क़लम', exR: 'qalam', exEn: 'pen', pic: '🖊️' },
      { ch: 'ख़', r: 'x̱a', say: 'kha', ta: 'ஃக', en: 'the ch in Scottish loch', hard: true,
        ex: 'ख़रगोश', exR: 'khargōsh', exEn: 'rabbit', pic: '🐰' },
      { ch: 'ग़', r: 'ġa', say: 'gha', ta: 'ஃக', en: 'the same, with voice — a gargled g', hard: true,
        ex: 'ग़ज़ल', exR: 'ghazal', exEn: 'ghazal' },
      { ch: 'ज़', r: 'za', say: 'za', ta: 'ஜ(z)',  en: 'z as in zoo', hard: true,
        ex: 'ज़मीन', exR: 'zamīn', exEn: 'land', pic: '🌍' },
      { ch: 'ड़', r: 'ṛa', say: 'ra', ta: 'ர',     en: 'tongue curls back and taps once — not a d', hard: true,
        ex: 'पहाड़', exR: 'pahāṛ', exEn: 'mountain', pic: '⛰️' },
      { ch: 'ढ़', r: 'ṛha', say: 'rha', ta: 'ர(h)',  en: 'the same, with a puff of air', hard: true,
        ex: 'बूढ़ा', exR: 'būṛhā', exEn: 'old man' },
      { ch: 'फ़', r: 'fa', say: 'fa', ta: 'ஃப',    en: 'f as in fan', hard: true,
        ex: 'फ़ल', exR: 'fal', exEn: 'fruit', pic: '🍎' }] }
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
