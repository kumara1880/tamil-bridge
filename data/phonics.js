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
          { hi: 'ड़', hiR: 'ṛa', ta: 'ட³', note: 'A flapped d — not in Tamil', hard: true },
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

  /* ================= TAMIL (anchor reference) ================= */
  ta: {
    label: { ta: 'Tamil letters (reference)', en: 'Tamil alphabet' },
    groups: [
      {
        name: { ta: 'Vowels — uyir (12)', en: 'Vowels' },
        items: [
          { ta: 'அ', taR: 'a' }, { ta: 'ஆ', taR: 'ā' }, { ta: 'இ', taR: 'i' }, { ta: 'ஈ', taR: 'ī' },
          { ta: 'உ', taR: 'u' }, { ta: 'ஊ', taR: 'ū' }, { ta: 'எ', taR: 'e' }, { ta: 'ஏ', taR: 'ē' },
          { ta: 'ஐ', taR: 'ai' }, { ta: 'ஒ', taR: 'o' }, { ta: 'ஓ', taR: 'ō' }, { ta: 'ஔ', taR: 'au' }
        ]
      },
      {
        name: { ta: 'Consonants — mei (18)', en: 'Consonants' },
        items: [
          { ta: 'க்', taR: 'k' }, { ta: 'ங்', taR: 'ṅ' }, { ta: 'ச்', taR: 'c' }, { ta: 'ஞ்', taR: 'ñ' },
          { ta: 'ட்', taR: 'ṭ' }, { ta: 'ண்', taR: 'ṇ' }, { ta: 'த்', taR: 't' }, { ta: 'ந்', taR: 'n' },
          { ta: 'ப்', taR: 'p' }, { ta: 'ம்', taR: 'm' }, { ta: 'ய்', taR: 'y' }, { ta: 'ர்', taR: 'r' },
          { ta: 'ல்', taR: 'l' }, { ta: 'வ்', taR: 'v' }, { ta: 'ழ்', taR: 'ḻ' }, { ta: 'ள்', taR: 'ḷ' },
          { ta: 'ற்', taR: 'ṟ' }, { ta: 'ன்', taR: 'ṉ' }
        ]
      }
    ],
    rules: []
  }
};
