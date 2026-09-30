/* Tamil Bridge — phonics.
   English: all 44 phonemes, each with the nearest Tamil letter and a plain
            articulation instruction. `hard` marks a sound Tamil does not have
            at all — those are the ones that need real drilling.
   Hindi:   full varnamala with Tamil equivalents; aspirated pairs flagged.
   Tamil:   reference table, so the learner can anchor on what they know.     */
window.TB = window.TB || {};

TB.PHONICS = {

  /* ================= ENGLISH ================= */
  en: {
    label: { ta: 'English sounds (44 phonemes)', en: 'English sounds' },
    groups: [
      {
        name: { ta: 'Short vowels', en: 'Short vowels' },
        items: [
          { ipa: '/ɪ/',  ta: 'இ',   ex: 'sit',   exTa: 'ஸிட்',    note: 'Looser than Tamil இ. Keep it short — sit is not seat.', hard: true },
          { ipa: '/e/',  ta: 'எ',   ex: 'bed',   exTa: 'பெட்',    note: 'Same as Tamil எ.' },
          { ipa: '/æ/',  ta: 'ஆ/அ', ex: 'cat',   exTa: 'கேட்',    note: 'Open your mouth wide, between அ and எ. Tamil has no such sound.', hard: true },
          { ipa: '/ʌ/',  ta: 'அ',   ex: 'cup',   exTa: 'கப்',     note: 'A short, neutral அ.' },
          { ipa: '/ɒ/',  ta: 'ஒ',   ex: 'hot',   exTa: 'ஹாட்',    note: 'Round your lips for a short ஒ.' },
          { ipa: '/ʊ/',  ta: 'உ',   ex: 'book',  exTa: 'புக்',    note: 'A short உ — do not stretch it into ஊ.' },
          { ipa: '/ə/',  ta: 'அ',   ex: 'about', exTa: 'அபௌட்',   note: 'The schwa: a very soft அ in unstressed syllables. The most common sound in English.', hard: true }
        ]
      },
      {
        name: { ta: 'Long vowels', en: 'Long vowels' },
        items: [
          { ipa: '/iː/', ta: 'ஈ',  ex: 'see',    exTa: 'ஸீ',      note: 'Same as Tamil ஈ.' },
          { ipa: '/ɑː/', ta: 'ஆ',  ex: 'car',    exTa: 'கார்',    note: 'Same as Tamil ஆ.' },
          { ipa: '/ɔː/', ta: 'ஓ',  ex: 'four',   exTa: 'ஃபோர்',   note: 'A long ஓ with rounded lips.' },
          { ipa: '/uː/', ta: 'ஊ',  ex: 'blue',   exTa: 'ப்ளூ',    note: 'Same as Tamil ஊ.' },
          { ipa: '/ɜː/', ta: 'அர்', ex: 'bird',  exTa: 'பர்ட்',   note: 'Tongue in the middle, saying அ — with no ர் sound in British English.', hard: true }
        ]
      },
      {
        name: { ta: 'Diphthongs (gliding vowels)', en: 'Diphthongs' },
        items: [
          { ipa: '/eɪ/', ta: 'ஏய்', ex: 'day',   exTa: 'டே',      note: 'Glide from எ to இ.' },
          { ipa: '/aɪ/', ta: 'ஐ',  ex: 'my',     exTa: 'மை',      note: 'Same as Tamil ஐ.' },
          { ipa: '/ɔɪ/', ta: 'ஒய்', ex: 'boy',   exTa: 'பாய்',    note: 'Glide from ஒ to இ.' },
          { ipa: '/aʊ/', ta: 'ஔ',  ex: 'now',    exTa: 'நௌ',      note: 'Same as Tamil ஔ.' },
          { ipa: '/oʊ/', ta: 'ஓ',  ex: 'go',     exTa: 'கோ',      note: 'Glide from ஒ to உ.' },
          { ipa: '/ɪə/', ta: 'இயர்', ex: 'here', exTa: 'ஹியர்',   note: 'Glide from இ into the schwa.' },
          { ipa: '/eə/', ta: 'ஏர்', ex: 'hair',  exTa: 'ஹேர்',    note: 'Glide from எ into the schwa.' },
          { ipa: '/ʊə/', ta: 'உவர்', ex: 'tour', exTa: 'டுவர்',   note: 'Glide from உ into the schwa.' }
        ]
      },
      {
        name: { ta: 'Plosives (stop sounds)', en: 'Plosives' },
        items: [
          { ipa: '/p/', ta: 'ப்', ex: 'pen',  exTa: 'பென்',  note: 'At the start of a word it comes with a puff of air. Hold your hand in front of your mouth and feel it.' },
          { ipa: '/b/', ta: 'ப்', ex: 'bad',  exTa: 'பேட்',  note: 'Your voice box vibrates. Tamil writes ப for both p and b — the difference is in the sound, not the letter.', hard: true },
          { ipa: '/t/', ta: 'ட்', ex: 'tea',  exTa: 'டீ',    note: 'Tongue tip on the ridge behind your upper teeth — further forward than Tamil ட.', hard: true },
          { ipa: '/d/', ta: 'ட்', ex: 'dog',  exTa: 'டாக்',  note: 'Same position as /t/, but with voice.' },
          { ipa: '/k/', ta: 'க்', ex: 'cat',  exTa: 'கேட்',  note: 'Same as Tamil க்.' },
          { ipa: '/ɡ/', ta: 'க்', ex: 'go',   exTa: 'கோ',    note: 'A voiced க. Tamil has no separate letter for it.', hard: true }
        ]
      },
      {
        name: { ta: 'Fricatives (hissing sounds)', en: 'Fricatives' },
        items: [
          { ipa: '/f/', ta: 'ஃப்', ex: 'fish',    exTa: 'ஃபிஷ்',   note: 'Lower lip against the upper teeth, then blow. This is not ப.', hard: true },
          { ipa: '/v/', ta: 'வ்',  ex: 'van',     exTa: 'வான்',    note: 'Same position as /f/, with voice. Tamil வ uses both lips; this uses lip and teeth.', hard: true },
          { ipa: '/θ/', ta: 'த்',  ex: 'think',   exTa: 'திங்க்',  note: 'Tongue tip between the teeth, blowing air with no voice.', hard: true },
          { ipa: '/ð/', ta: 'த்',  ex: 'this',    exTa: 'திஸ்',    note: 'Tongue tip between the teeth, with voice.', hard: true },
          { ipa: '/s/', ta: 'ஸ்',  ex: 'sun',     exTa: 'ஸன்',     note: 'Same as Tamil ஸ.' },
          { ipa: '/z/', ta: 'ஸ்',  ex: 'zoo',     exTa: 'ஸூ',      note: 'A voiced ஸ. Not in Tamil — put a hand on your throat and feel the buzz.', hard: true },
          { ipa: '/ʃ/', ta: 'ஷ்',  ex: 'she',     exTa: 'ஷீ',      note: 'Same as Tamil ஷ.' },
          { ipa: '/ʒ/', ta: 'ஜ்',  ex: 'measure', exTa: 'மெஷர்',   note: 'A voiced ஷ. A rare sound.', hard: true },
          { ipa: '/h/', ta: 'ஹ்',  ex: 'hat',     exTa: 'ஹாட்',    note: 'Just a breath of air.' }
        ]
      },
      {
        name: { ta: 'Affricates', en: 'Affricates' },
        items: [
          { ipa: '/tʃ/', ta: 'ச்', ex: 'chair', exTa: 'சேர்',  note: 'Same as Tamil ச்.' },
          { ipa: '/dʒ/', ta: 'ஜ்', ex: 'jump',  exTa: 'ஜம்ப்', note: 'A voiced ச, which is ஜ.' }
        ]
      },
      {
        name: { ta: 'Nasals, liquids and glides', en: 'Nasals, liquids & glides' },
        items: [
          { ipa: '/m/', ta: 'ம்', ex: 'man',   exTa: 'மான்',  note: 'Same as Tamil ம்.' },
          { ipa: '/n/', ta: 'ன்', ex: 'no',    exTa: 'நோ',    note: 'Same as Tamil ந் / ன்.' },
          { ipa: '/ŋ/', ta: 'ங்', ex: 'sing',  exTa: 'ஸிங்',  note: 'Same as Tamil ங். Do not add a க் at the end.' },
          { ipa: '/l/', ta: 'ல்', ex: 'leg',   exTa: 'லெக்',  note: 'Same as Tamil ல்.' },
          { ipa: '/r/', ta: 'ர்', ex: 'red',   exTa: 'ரெட்',  note: 'The tongue never touches the roof of the mouth — do not roll it like Tamil ர.', hard: true },
          { ipa: '/w/', ta: 'வ்', ex: 'water', exTa: 'வாட்டர்', note: 'Purse your lips and start from a உ shape.' },
          { ipa: '/j/', ta: 'ய்', ex: 'yes',   exTa: 'யெஸ்',  note: 'Same as Tamil ய்.' }
        ]
      }
    ],

    rules: [
      { rule: 'Silent letters', ta: 'Letters that are written but not pronounced', ex: ['know → noh', 'write → rite', 'listen → li-sen', 'hour → our', 'lamb → lam'] },
      { rule: 'Magic e',        ta: 'A final "e" is silent, but stretches the vowel before it', ex: ['hat → hate', 'bit → bite', 'not → note', 'cut → cute'] },
      { rule: 'Hard and soft c', ta: 'c before e/i/y sounds like "s", otherwise like "k"', ex: ['city → si-ty', 'cat → kat', 'cycle → sy-cle'] },
      { rule: 'Hard and soft g', ta: 'g before e/i/y sounds like "j", otherwise like "g"', ex: ['giant → jy-ant', 'go → goh', 'gym → jim'] },
      { rule: 'The "ough" trap', ta: 'One spelling, many different sounds', ex: ['though → thoh', 'through → throo', 'cough → koff', 'enough → i-nuff', 'bought → bawt'] },
      { rule: 'Plural -s',      ta: 'The plural -s has three different sounds', ex: ['cats → "ts"', 'dogs → "z"', 'buses → "iz"'] },
      { rule: 'Past -ed',       ta: 'The past -ed also has three sounds', ex: ['walked → "t"', 'played → "d"', 'wanted → "id"'] },
      { rule: 'Stress and schwa', ta: 'Unstressed syllables collapse into the schwa', ex: ['banana → ba-NA-na', 'computer → com-PYU-ter'] }
    ]
  },

  /* ================= HINDI ================= */
  hi: {
    label: { ta: 'Hindi alphabet (देवनागरी)', en: 'Hindi alphabet' },
    groups: [
      {
        name: { ta: 'Vowels (स्वर)', en: 'Vowels' },
        items: [
          { hi: 'अ', hiR: 'a',  ta: 'அ', note: 'Tamil அ' },
          { hi: 'आ', hiR: 'ā',  ta: 'ஆ', note: 'Tamil ஆ' },
          { hi: 'इ', hiR: 'i',  ta: 'இ', note: 'Tamil இ' },
          { hi: 'ई', hiR: 'ī',  ta: 'ஈ', note: 'Tamil ஈ' },
          { hi: 'उ', hiR: 'u',  ta: 'உ', note: 'Tamil உ' },
          { hi: 'ऊ', hiR: 'ū',  ta: 'ஊ', note: 'Tamil ஊ' },
          { hi: 'ए', hiR: 'e',  ta: 'ஏ', note: 'Tamil ஏ' },
          { hi: 'ऐ', hiR: 'ai', ta: 'ஐ', note: 'Close to Tamil ஐ, but nearer to "e"' },
          { hi: 'ओ', hiR: 'o',  ta: 'ஓ', note: 'Tamil ஓ' },
          { hi: 'औ', hiR: 'au', ta: 'ஔ', note: 'Tamil ஔ' },
          { hi: 'ऋ', hiR: 'ṛ',  ta: 'ரி', note: 'A Sanskrit vowel, said like "ri"' },
          { hi: 'अं', hiR: 'aṁ', ta: 'அம்', note: 'Anusvara — a nasal sound' },
          { hi: 'अः', hiR: 'aḥ', ta: 'அஃ', note: 'Visarga — like the Tamil aytham ஃ' }
        ]
      },
      {
        name: { ta: 'Velars (कवर्ग)', en: 'Velars' },
        items: [
          { hi: 'क', hiR: 'ka',  ta: 'க',  note: 'Tamil க' },
          { hi: 'ख', hiR: 'kha', ta: 'க்ஹ', note: 'க with a puff of air (aspirated)', asp: true },
          { hi: 'ग', hiR: 'ga',  ta: 'க(g)', note: 'Voiced — Tamil has no separate letter', hard: true },
          { hi: 'घ', hiR: 'gha', ta: 'க(gh)', note: 'Voiced, plus a puff of air', asp: true, hard: true },
          { hi: 'ङ', hiR: 'ṅa',  ta: 'ங',  note: 'Tamil ங' }
        ]
      },
      {
        name: { ta: 'Palatals (चवर्ग)', en: 'Palatals' },
        items: [
          { hi: 'च', hiR: 'ca',  ta: 'ச',  note: 'Tamil ச' },
          { hi: 'छ', hiR: 'cha', ta: 'ச்ஹ', note: 'ச with a puff of air', asp: true },
          { hi: 'ज', hiR: 'ja',  ta: 'ஜ',  note: 'Tamil ஜ' },
          { hi: 'झ', hiR: 'jha', ta: 'ஜ்ஹ', note: 'Voiced, plus a puff of air', asp: true, hard: true },
          { hi: 'ञ', hiR: 'ña',  ta: 'ஞ',  note: 'Tamil ஞ' }
        ]
      },
      {
        name: { ta: 'Retroflex (टवर्ग)', en: 'Retroflex' },
        items: [
          { hi: 'ट', hiR: 'ṭa',  ta: 'ட',  note: 'Tamil ட' },
          { hi: 'ठ', hiR: 'ṭha', ta: 'ட்ஹ', note: 'ட with a puff of air', asp: true },
          { hi: 'ड', hiR: 'ḍa',  ta: 'ட(d)', note: 'Voiced', hard: true },
          { hi: 'ढ', hiR: 'ḍha', ta: 'ட(dh)', note: 'Voiced, plus a puff of air', asp: true, hard: true },
          { hi: 'ण', hiR: 'ṇa',  ta: 'ண',  note: 'Tamil ண' }
        ]
      },
      {
        name: { ta: 'Dentals (तवर्ग)', en: 'Dentals' },
        items: [
          { hi: 'त', hiR: 'ta',  ta: 'த',  note: 'Tamil த' },
          { hi: 'थ', hiR: 'tha', ta: 'த்ஹ', note: 'த with a puff of air', asp: true },
          { hi: 'द', hiR: 'da',  ta: 'த(d)', note: 'Voiced', hard: true },
          { hi: 'ध', hiR: 'dha', ta: 'த(dh)', note: 'Voiced, plus a puff of air', asp: true, hard: true },
          { hi: 'न', hiR: 'na',  ta: 'ந',  note: 'Tamil ந' }
        ]
      },
      {
        name: { ta: 'Labials (पवर्ग)', en: 'Labials' },
        items: [
          { hi: 'प', hiR: 'pa',  ta: 'ப',  note: 'Tamil ப' },
          { hi: 'फ', hiR: 'pha', ta: 'ஃப', note: 'ப with a puff of air; in modern Hindi often just "f"', asp: true },
          { hi: 'ब', hiR: 'ba',  ta: 'ப(b)', note: 'Voiced', hard: true },
          { hi: 'भ', hiR: 'bha', ta: 'ப(bh)', note: 'Voiced, plus a puff of air', asp: true, hard: true },
          { hi: 'म', hiR: 'ma',  ta: 'ம',  note: 'Tamil ம' }
        ]
      },
      {
        name: { ta: 'Semivowels, sibilants and others', en: 'Semivowels, sibilants & others' },
        items: [
          { hi: 'य', hiR: 'ya', ta: 'ய', note: 'Tamil ய' },
          { hi: 'र', hiR: 'ra', ta: 'ர', note: 'Tamil ர' },
          { hi: 'ल', hiR: 'la', ta: 'ல', note: 'Tamil ல' },
          { hi: 'व', hiR: 'va', ta: 'வ', note: 'Tamil வ' },
          { hi: 'श', hiR: 'śa', ta: 'ஷ', note: 'Tamil ஷ' },
          { hi: 'ष', hiR: 'ṣa', ta: 'ஷ', note: 'Very close to श' },
          { hi: 'स', hiR: 'sa', ta: 'ஸ', note: 'Tamil ஸ' },
          { hi: 'ह', hiR: 'ha', ta: 'ஹ', note: 'Tamil ஹ' },
          { hi: 'क्ष', hiR: 'kṣa', ta: 'க்ஷ', note: 'A conjunct letter' },
          { hi: 'त्र', hiR: 'tra', ta: 'த்ர', note: 'A conjunct letter' },
          { hi: 'ज्ञ', hiR: 'jña', ta: 'க்ஞ', note: 'A conjunct letter, usually said "gy"' },
          { hi: 'ड़', hiR: 'ṛa', ta: 'ர', note: 'A flapped r: curl the tongue back and tap once. Not a d.', hard: true },
          { hi: 'ज़', hiR: 'za', ta: 'ஜ(z)', note: 'A borrowed sound (z)', hard: true },
          { hi: 'फ़', hiR: 'fa', ta: 'ஃப', note: 'A borrowed sound (f)', hard: true }
        ]
      }
    ],
    rules: [
      { rule: 'Matra (मात्रा)', ta: 'A vowel sign attached to a consonant', ex: ['क + ा = का', 'क + ि = कि', 'क + ी = की', 'क + ु = कु'] },
      { rule: 'Halant (हलंत् ्)', ta: 'Removes the built-in vowel — exactly like the Tamil dot', ex: ['क् = க்', 'न् = ந்'] },
      { rule: 'Gender (लिंग)', ta: 'Every Hindi noun has a gender, and the verb changes to match. Tamil has no such rule', ex: ['लड़का जाता है (masculine)', 'लड़की जाती है (feminine)'] },
      { rule: 'Word order', ta: 'Hindi and Tamil are both SOV — subject, object, then verb. A real advantage for Tamil speakers', ex: ['मैं खाना खाता हूँ = நான் உணவு சாப்பிடுகிறேன் = I eat food'] }
    ]
  },

  /* ================= TAMIL =================
     Not a list of letters — they are already known — but the two things
     about them that are hard to find written down: which sound a letter
     takes depending on where it sits in the word, and how to tell apart the
     three l's, the two r's and the three n's. */
  ta: {
    label: { ta: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd \u0b92\u0bb2\u0bbf\u0b95\u0bb3\u0bcd (247)', en: 'Tamil sounds' },
    groups: [
      {
        name: { ta: '\u0b89\u0baf\u0bbf\u0bb0\u0bcd \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1 (12)', en: 'Vowels \u2014 uyir, the living letters' },
        items: [
          { ta: '\u0b85', taR: 'a',  ex: '\u0b85\u0bae\u0bcd\u0bae\u0bbe',      exR: 'amm\u0101',    exEn: 'mother',  note: 'Short. The mouth barely opens.' },
          { ta: '\u0b86', taR: '\u0101',  ex: '\u0b86\u0b9f\u0bc1',        exR: '\u0101\u1e0du',      exEn: 'goat',    note: 'The same sound held twice as long. Length alone changes the word.' },
          { ta: '\u0b87', taR: 'i',  ex: '\u0b87\u0bb2\u0bc8',        exR: 'ilai',     exEn: 'leaf',    note: 'Short and tight, like the i in English sit.' },
          { ta: '\u0b88', taR: '\u012b',  ex: '\u0b88',            exR: '\u012b',        exEn: 'a fly',   note: 'Held long, like the ee in see. \u0b87 and \u0b88 are different words, never the same word said fast.' },
          { ta: '\u0b89', taR: 'u',  ex: '\u0b89\u0b9f\u0bb2\u0bcd',      exR: 'u\u1e0dal',     exEn: 'body',    note: 'Lips rounded, short.' },
          { ta: '\u0b8a', taR: '\u016b',  ex: '\u0b8a\u0bb0\u0bcd',        exR: '\u016br',       exEn: 'town',    note: 'The same, held long.' },
          { ta: '\u0b8e', taR: 'e',  ex: '\u0b8e\u0bb2\u0bbf',        exR: 'eli',      exEn: 'rat',     note: 'Short, like the e in bed.' },
          { ta: '\u0b8f', taR: '\u0113',  ex: '\u0b8f\u0ba3\u0bbf',        exR: '\u0113\u1e47i',     exEn: 'ladder',  note: 'Long. \u0b8e\u0bb2\u0bbf is a rat, \u0b8f\u0bb2\u0bcd is to rule \u2014 the length is the whole difference.' },
          { ta: '\u0b90', taR: 'ai', ex: '\u0b90\u0ba8\u0bcd\u0ba4\u0bc1',      exR: 'aindu',    exEn: 'five',    note: 'A glide: \u0b85 sliding into \u0b87, in one beat.' },
          { ta: '\u0b92', taR: 'o',  ex: '\u0b92\u0b9f\u0bcd\u0b9f\u0b95\u0bae\u0bcd',  exR: 'o\u1e6d\u1e6dagam', exEn: 'camel',  note: 'Short, lips rounded.' },
          { ta: '\u0b93', taR: '\u014d',  ex: '\u0b93\u0b9f\u0bc1',        exR: '\u014d\u1e0du',      exEn: 'run',     note: 'The same, held long.' },
          { ta: '\u0b94', taR: 'au', ex: '\u0b94\u0bb5\u0bc8',        exR: 'auvai',    exEn: 'Auvaiyar', note: 'A glide from \u0b85 to \u0b89. The rarest of the twelve \u2014 a handful of words use it.' }
        ]
      },
      {
        name: { ta: '\u0bb5\u0bb2\u0bcd\u0bb2\u0bbf\u0ba9\u0bae\u0bcd (6)', en: 'Hard consonants \u2014 vallinam' },
        items: [
          { ta: '\u0b95\u0bcd', taR: 'k / g / h', ex: '\u0b95\u0bb2\u0bcd \u00b7 \u0bae\u0b95\u0ba9\u0bcd \u00b7 \u0b85\u0b95\u0bcd\u0b95\u0bbe', exR: 'kal \u00b7 magan \u00b7 akk\u0101', exEn: 'stone \u00b7 son \u00b7 elder sister',
            note: 'One letter, three sounds, and which one you say is decided by where it sits: k starting a word, g between two vowels, k again when doubled. Nobody writes this down, and it is the single biggest reason Tamil read aloud from the page sounds wrong.', hard: true },
          { ta: '\u0b9a\u0bcd', taR: 's / ch / j', ex: '\u0b9a\u0bb0\u0bbf \u00b7 \u0baa\u0b9a\u0bcd\u0b9a\u0bc8 \u00b7 \u0b95\u0b9a\u0b95\u0bc1', exR: 'sari \u00b7 pacchai \u00b7 kasagu', exEn: 'correct \u00b7 green \u00b7 rubbish',
            note: 'Starts a word as s, doubles as ch, and softens to j between vowels in borrowed words.', hard: true },
          { ta: '\u0b9f\u0bcd', taR: '\u1e6d / \u1e0d', ex: '\u0b95\u0b9f\u0bcd\u0b9f\u0bbf \u00b7 \u0baa\u0bbe\u0b9f\u0bae\u0bcd', exR: 'ka\u1e6d\u1e6di \u00b7 p\u0101\u1e0dam', exEn: 'brick \u00b7 lesson',
            note: 'Curl the tongue back to the roof of the mouth. Hard when doubled, soft (d) between vowels.' },
          { ta: '\u0ba4\u0bcd', taR: 'th / dh', ex: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd \u00b7 \u0baa\u0bbe\u0ba4\u0bae\u0bcd', exR: 'thami\u1e93 \u00b7 p\u0101dham', exEn: 'Tamil \u00b7 foot',
            note: 'Tongue on the back of the top teeth, not on the ridge behind them. Softens to dh between vowels.' },
          { ta: '\u0baa\u0bcd', taR: 'p / b', ex: '\u0baa\u0bb2\u0bcd \u00b7 \u0ba4\u0baa\u0bbe\u0bb2\u0bcd', exR: 'pal \u00b7 tab\u0101l', exEn: 'tooth \u00b7 post',
            note: 'p starting a word, b between vowels. Tamil has no separate letter for b \u2014 it never needed one.' },
          { ta: '\u0bb1\u0bcd', taR: '\u1e5f / \u1e6dr', ex: '\u0b8e\u0bb1\u0bc1\u0bae\u0bcd\u0baa\u0bc1 \u00b7 \u0b95\u0bb1\u0bcd\u0bb1\u0bc1', exR: 'e\u1e5fumbu \u00b7 ka\u1e6dru', exEn: 'ant \u00b7 learnt',
            note: 'A hard, rolled r made further back than \u0bb0. Doubled it becomes a tr sound. Saying \u0bb1 where \u0bb0 belongs changes the word.', hard: true }
        ]
      },
      {
        name: { ta: '\u0bae\u0bc6\u0bb2\u0bcd\u0bb2\u0bbf\u0ba9\u0bae\u0bcd (6)', en: 'Nasal consonants \u2014 mellinam' },
        items: [
          { ta: '\u0b99\u0bcd', taR: '\u1e45', ex: '\u0b85\u0b99\u0bcd\u0b95\u0bc7', exR: 'a\u1e45g\u0113', exEn: 'there',
            note: 'The ng of sing. It appears almost only in front of \u0b95\u0bcd.' },
          { ta: '\u0b9e\u0bcd', taR: '\u00f1', ex: '\u0ba8\u0b9e\u0bcd\u0b9a\u0bc1', exR: 'na\u00f1ju', exEn: 'poison',
            note: 'The ny of canyon. It appears almost only in front of \u0b9a\u0bcd.' },
          { ta: '\u0ba3\u0bcd', taR: '\u1e47', ex: '\u0bae\u0ba3\u0bcd', exR: 'ma\u1e47', exEn: 'soil',
            note: 'The curled-back n \u2014 tongue on the roof of the mouth, the same place as \u0b9f\u0bcd.' },
          { ta: '\u0ba8\u0bcd', taR: 'n', ex: '\u0ba8\u0ba3\u0bcd\u0baa\u0ba9\u0bcd', exR: 'na\u1e47ban', exEn: 'friend',
            note: 'The n that starts a word \u2014 tongue on the teeth, the same place as \u0ba4\u0bcd.' },
          { ta: '\u0bae\u0bcd', taR: 'm', ex: '\u0bae\u0bb0\u0bae\u0bcd', exR: 'maram', exEn: 'tree', note: 'Lips closed. The same m as everywhere else.' },
          { ta: '\u0ba9\u0bcd', taR: '\u1e49', ex: '\u0baa\u0ba9\u0bcd\u0ba9\u0bbf', exR: 'pa\u1e49\u1e49i', exEn: 'pig',
            note: 'The n used inside and at the end of words \u2014 tongue on the ridge behind the teeth.' }
        ]
      },
      {
        name: { ta: '\u0b87\u0b9f\u0bc8\u0baf\u0bbf\u0ba9\u0bae\u0bcd (6)', en: 'Medium consonants \u2014 idaiyinam' },
        items: [
          { ta: '\u0baf\u0bcd', taR: 'y', ex: '\u0baf\u0bbe\u0ba9\u0bc8', exR: 'y\u0101\u1e49ai', exEn: 'elephant', note: 'The y of yes.' },
          { ta: '\u0bb0\u0bcd', taR: 'r', ex: '\u0bae\u0bb0\u0bae\u0bcd', exR: 'maram', exEn: 'tree', note: 'A single light tap of the tongue \u2014 softer than \u0bb1\u0bcd, and never rolled.' },
          { ta: '\u0bb2\u0bcd', taR: 'l', ex: '\u0baa\u0bb2\u0bcd', exR: 'pal', exEn: 'tooth', note: 'Tongue tip on the ridge behind the top teeth. The plain l.' },
          { ta: '\u0bb5\u0bcd', taR: 'v', ex: '\u0bb5\u0bbe\u0ba9\u0bae\u0bcd', exR: 'v\u0101\u1e49am', exEn: 'sky', note: 'Lips and teeth, softer than the English v.' },
          { ta: '\u0bb4\u0bcd', taR: '\u1e93', ex: '\u0ba4\u0bae\u0bbf\u0bb4\u0bcd', exR: 'thami\u1e93', exEn: 'Tamil',
            note: 'The sound the language is named after, and it exists in almost no other language on earth. Curl the tongue back towards the roof of the mouth \u2014 but do not let it touch \u2014 and voice it. Not l, not r, not zh.', hard: true },
          { ta: '\u0bb3\u0bcd', taR: '\u1e37', ex: '\u0bb5\u0bbe\u0bb3\u0bcd', exR: 'v\u0101\u1e37', exEn: 'sword',
            note: 'The curled-back l: tongue on the roof of the mouth. \u0baa\u0bb2\u0bcd is a tooth, \u0baa\u0bb3\u0bcd is a hollow \u2014 the same word but for where the tongue sits.', hard: true }
        ]
      },
      {
        name: { ta: '\u0b86\u0baf\u0bcd\u0ba4 \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1 (1)', en: 'Aytham \u2014 the third kind' },
        items: [
          { ta: '\u0b83', taR: 'k / \u1e25', ex: '\u0b8e\u0b83\u0b95\u0bc1', exR: 'ehku', exEn: 'steel',
            note: 'Belongs to neither the vowels nor the consonants \u2014 Tamil counts it on its own. Rare in old words, but it is what carries borrowed sounds today: \u0b83\u0baa = f, \u0b83\u0b9c = z.' }
        ]
      },
      {
        name: { ta: '\u0b95\u0bbf\u0bb0\u0ba8\u0bcd\u0ba4 \u0b8e\u0bb4\u0bc1\u0ba4\u0bcd\u0ba4\u0bc1\u0b95\u0bb3\u0bcd (6)', en: 'Grantha \u2014 the borrowed letters' },
        items: [
          { ta: '\u0b9c', taR: 'ja', ex: '\u0b9c\u0ba9\u0bcd\u0ba9\u0bb2\u0bcd', exR: 'jannal', exEn: 'window', note: 'Borrowed for Sanskrit, Hindi and English words. Not one of the eighteen.' },
          { ta: '\u0bb7', taR: '\u1e63a', ex: '\u0b95\u0bb7\u0bcd\u0b9f\u0bae\u0bcd', exR: 'ka\u1e63\u1e6dam', exEn: 'trouble', note: 'The curled-back sh. Hindi \u0937.' },
          { ta: '\u0bb8', taR: 'sa', ex: '\u0bb8\u0bc2\u0bb0\u0bbf\u0baf\u0ba9\u0bcd', exR: 's\u016briyan', exEn: 'sun', note: 'The plain s. Hindi \u0938.' },
          { ta: '\u0bb9', taR: 'ha', ex: '\u0bb9\u0bbf\u0ba8\u0bcd\u0ba4\u0bbf', exR: 'hindi', exEn: 'Hindi', note: 'The h of hat. Hindi \u0939.' },
          { ta: '\u0b95\u0bcd\u0bb7', taR: 'k\u1e63a', ex: '\u0bb0\u0b9f\u0bcd\u0b9a\u0bbf\u0ba4\u0bae\u0bcd', exR: 'ra\u1e63itham', exEn: 'protected', note: 'Two letters written as one, as in Hindi \u0915\u094d\u0937.' },
          { ta: '\u0bb6\u0bcd\u0bb0\u0bc0', taR: '\u015br\u012b', ex: '\u0bb6\u0bcd\u0bb0\u0bc0', exR: '\u015br\u012b', exEn: 'Shri', note: 'Used almost only in names and titles.' }
        ]
      },
      {
        name: { ta: '\u0b89\u0baf\u0bbf\u0bb0\u0bcd\u0bae\u0bc6\u0baf\u0bcd \u2014 \u0b95 \u0bb5\u0bb0\u0bbf\u0b9a\u0bc8', en: 'A consonant through all twelve vowels' },
        items: [
          { ta: '\u0b95',   taR: 'ka',  note: '\u0b95\u0bcd + \u0b85' },
          { ta: '\u0b95\u0bbe', taR: 'k\u0101',  note: '\u0b95\u0bcd + \u0b86' },
          { ta: '\u0b95\u0bbf', taR: 'ki',  note: '\u0b95\u0bcd + \u0b87' },
          { ta: '\u0b95\u0bc0', taR: 'k\u012b',  note: '\u0b95\u0bcd + \u0b88' },
          { ta: '\u0b95\u0bc1', taR: 'ku',  note: '\u0b95\u0bcd + \u0b89' },
          { ta: '\u0b95\u0bc2', taR: 'k\u016b',  note: '\u0b95\u0bcd + \u0b8a' },
          { ta: '\u0b95\u0bc6', taR: 'ke',  note: '\u0b95\u0bcd + \u0b8e' },
          { ta: '\u0b95\u0bc7', taR: 'k\u0113',  note: '\u0b95\u0bcd + \u0b8f' },
          { ta: '\u0b95\u0bc8', taR: 'kai', note: '\u0b95\u0bcd + \u0b90' },
          { ta: '\u0b95\u0bca', taR: 'ko',  note: '\u0b95\u0bcd + \u0b92' },
          { ta: '\u0b95\u0bcb', taR: 'k\u014d',  note: '\u0b95\u0bcd + \u0b93' },
          { ta: '\u0b95\u0bcc', taR: 'kau', note: '\u0b95\u0bcd + \u0b94' }
        ]
      }
    ],
    rules: [
      { rule: '18 \u00d7 12 + 12 + 1 = 247',
        ta: 'Eighteen consonants through twelve vowels, plus the twelve vowels alone, plus aytham. That is every letter in Tamil, and there are no exceptions to learn.',
        ex: ['\u0b95\u0bcd + \u0b85 = \u0b95', '\u0b95\u0bcd + \u0b86 = \u0b95\u0bbe', '\u0ba8\u0bcd + \u0b87 = \u0ba8\u0bbf'] },
      { rule: 'One letter, more than one sound',
        ta: 'Where a hard consonant sits decides how it is said. Starting a word it is hard; between two vowels it softens; doubled it is hard again. This is why a word read letter by letter sounds wrong.',
        ex: ['\u0b95\u0bb2\u0bcd = kal', '\u0bae\u0b95\u0ba9\u0bcd = magan', '\u0b85\u0b95\u0bcd\u0b95\u0bbe = akk\u0101', '\u0baa\u0bb2\u0bcd = pal', '\u0ba4\u0baa\u0bbe\u0bb2\u0bcd = tab\u0101l'] },
      { rule: 'The three l\u2019s \u2014 \u0bb2 \u0bb3 \u0bb4',
        ta: '\u0bb2 tongue behind the teeth. \u0bb3 tongue curled back, touching. \u0bb4 tongue curled back, not touching. Three different words, not three spellings of one.',
        ex: ['\u0baa\u0bb2\u0bcd = tooth', '\u0baa\u0bb3\u0bcd = hollow', '\u0baa\u0bb4\u0bcd = fruit'] },
      { rule: 'The two r\u2019s \u2014 \u0bb0 \u0bb1',
        ta: '\u0bb0 is one light tap. \u0bb1 is hard and rolled, made further back.',
        ex: ['\u0b85\u0bb0\u0bae\u0bcd = virtue', '\u0b85\u0bb1\u0bae\u0bcd = duty'] },
      { rule: 'The three n\u2019s \u2014 \u0ba8 \u0ba9 \u0ba3',
        ta: '\u0ba8 starts words, on the teeth. \u0ba9 sits inside and at the end, on the ridge. \u0ba3 is curled back. They sound almost alike and the spelling still has to be right.',
        ex: ['\u0ba8\u0bb2\u0bcd = good', '\u0baa\u0ba9\u0bcd\u0ba9\u0bbf = pig', '\u0bae\u0ba3\u0bcd = soil'] },
      { rule: 'Length is meaning',
        ta: 'A vowel held longer is a different word, not the same word said slowly. This is the mistake that changes what you said.',
        ex: ['\u0b85\u0b9f\u0bbf = hit \u00b7 \u0b86\u0b9f\u0bbf = sheep', '\u0b95\u0b9f\u0bbf = bite \u00b7 \u0b95\u0bbe\u0b9f\u0bbf = show'] }
    ]
  }
};
