/* Tamil Bridge — phonics.
   English: all 44 phonemes, each with a Tamil-letter approximation and a Tamil
            articulation instruction. `hard` marks sounds that do not exist in
            Tamil at all — these get extra drilling.
   Hindi:   full varnamala with Tamil equivalents; aspirated pairs flagged.
   Tamil:   reference table so the learner can anchor on what they already know. */
window.TB = window.TB || {};

TB.PHONICS = {

  /* ================= ENGLISH ================= */
  en: {
    label: { ta: 'ஆங்கில ஒலிகள் (44 phonemes)', en: 'English sounds' },
    groups: [
      {
        name: { ta: 'குறில் உயிர் ஒலிகள்', en: 'Short vowels' },
        items: [
          { ipa: '/ɪ/',  ta: 'இ',   ex: 'sit',   exTa: 'ஸிட்',    note: 'தமிழ் "இ"-ஐ விட சற்று தளர்வானது. "ஈ" ஆக நீட்டாதீர்கள் — sit ≠ seat.', hard: true },
          { ipa: '/e/',  ta: 'எ',   ex: 'bed',   exTa: 'பெட்',    note: 'தமிழ் "எ" போலவே.' },
          { ipa: '/æ/',  ta: 'ஆ/அ', ex: 'cat',   exTa: 'கேட்',    note: 'வாயை அகலமாகத் திறந்து "அ"-க்கும் "எ"-க்கும் இடையில். தமிழில் இல்லாத ஒலி.', hard: true },
          { ipa: '/ʌ/',  ta: 'அ',   ex: 'cup',   exTa: 'கப்',     note: 'குறுகிய, நடுநிலை "அ".' },
          { ipa: '/ɒ/',  ta: 'ஒ',   ex: 'hot',   exTa: 'ஹாட்',    note: 'உதடுகளை வட்டமாக்கி குறுகிய "ஒ".' },
          { ipa: '/ʊ/',  ta: 'உ',   ex: 'book',  exTa: 'புக்',    note: 'குறுகிய "உ" — "ஊ" ஆக நீட்டாதீர்கள்.' },
          { ipa: '/ə/',  ta: 'அ',   ex: 'about', exTa: 'அபௌட்',   note: 'Schwa — வலியுறுத்தப்படாத அசைகளில் வரும் மிக மெல்லிய "அ". ஆங்கிலத்தின் மிகப் பொதுவான ஒலி.', hard: true }
        ]
      },
      {
        name: { ta: 'நெடில் உயிர் ஒலிகள்', en: 'Long vowels' },
        items: [
          { ipa: '/iː/', ta: 'ஈ',  ex: 'see',    exTa: 'ஸீ',      note: 'தமிழ் "ஈ" போலவே.' },
          { ipa: '/ɑː/', ta: 'ஆ',  ex: 'car',    exTa: 'கார்',    note: 'தமிழ் "ஆ" போலவே.' },
          { ipa: '/ɔː/', ta: 'ஓ',  ex: 'four',   exTa: 'ஃபோர்',   note: 'உதடுகளை வட்டமாக்கி நீண்ட "ஓ".' },
          { ipa: '/uː/', ta: 'ஊ',  ex: 'blue',   exTa: 'ப்ளூ',    note: 'தமிழ் "ஊ" போலவே.' },
          { ipa: '/ɜː/', ta: 'அர்', ex: 'bird',  exTa: 'பர்ட்',   note: 'நாக்கை நடுவில் வைத்து "அ" — ஆனால் "ர்" ஒலிக்காமல் (British).', hard: true }
        ]
      },
      {
        name: { ta: 'இரட்டை உயிர் ஒலிகள்', en: 'Diphthongs' },
        items: [
          { ipa: '/eɪ/', ta: 'ஏய்', ex: 'day',   exTa: 'டே',      note: '"எ" → "இ" சறுக்கல்.' },
          { ipa: '/aɪ/', ta: 'ஐ',  ex: 'my',     exTa: 'மை',      note: 'தமிழ் "ஐ" போலவே.' },
          { ipa: '/ɔɪ/', ta: 'ஒய்', ex: 'boy',   exTa: 'பாய்',    note: '"ஒ" → "இ" சறுக்கல்.' },
          { ipa: '/aʊ/', ta: 'ஔ',  ex: 'now',    exTa: 'நௌ',      note: 'தமிழ் "ஔ" போலவே.' },
          { ipa: '/oʊ/', ta: 'ஓ',  ex: 'go',     exTa: 'கோ',      note: '"ஒ" → "உ" சறுக்கல்.' },
          { ipa: '/ɪə/', ta: 'இயர்', ex: 'here', exTa: 'ஹியர்',   note: '"இ" → schwa.' },
          { ipa: '/eə/', ta: 'ஏர்', ex: 'hair',  exTa: 'ஹேர்',    note: '"எ" → schwa.' },
          { ipa: '/ʊə/', ta: 'உவர்', ex: 'tour', exTa: 'டுவர்',   note: '"உ" → schwa.' }
        ]
      },
      {
        name: { ta: 'வலி ஒலிகள் (Plosives)', en: 'Plosives' },
        items: [
          { ipa: '/p/', ta: 'ப்', ex: 'pen',  exTa: 'பென்',  note: 'சொல் தொடக்கத்தில் காற்றை வெளியேற்றி (aspirated) — கையை வாய் முன் வைத்தால் காற்று படும்.' },
          { ipa: '/b/', ta: 'ப்', ex: 'bad',  exTa: 'பேட்',  note: 'குரல் நாண் அதிரும். தமிழில் ப/b வேறுபாடு எழுத்தில் இல்லை — ஒலியில் உண்டு.', hard: true },
          { ipa: '/t/', ta: 'ட்', ex: 'tea',  exTa: 'டீ',    note: 'நாக்கு நுனி மேல் பல் ஈறில் — தமிழ் "ட" போல் பின்னால் அல்ல.', hard: true },
          { ipa: '/d/', ta: 'ட்', ex: 'dog',  exTa: 'டாக்',  note: '/t/ இடம் + குரல்.' },
          { ipa: '/k/', ta: 'க்', ex: 'cat',  exTa: 'கேட்',  note: 'தமிழ் "க்" போலவே.' },
          { ipa: '/ɡ/', ta: 'க்', ex: 'go',   exTa: 'கோ',    note: 'குரலுடன் "க". தமிழில் தனி எழுத்து இல்லை.', hard: true }
        ]
      },
      {
        name: { ta: 'உரசொலிகள் (Fricatives)', en: 'Fricatives' },
        items: [
          { ipa: '/f/', ta: 'ஃப்', ex: 'fish',    exTa: 'ஃபிஷ்',   note: 'கீழ் உதட்டை மேல் பற்களில் வைத்து காற்று. "ப" அல்ல.', hard: true },
          { ipa: '/v/', ta: 'வ்',  ex: 'van',     exTa: 'வான்',    note: '/f/ இடம் + குரல். தமிழ் "வ" உதடு-உதடு; இது உதடு-பல்.', hard: true },
          { ipa: '/θ/', ta: 'த்',  ex: 'think',   exTa: 'திங்க்',  note: 'நாக்கு நுனி பற்களுக்கு இடையே, குரல் இல்லாமல் காற்று.', hard: true },
          { ipa: '/ð/', ta: 'த்',  ex: 'this',    exTa: 'திஸ்',    note: 'நாக்கு நுனி பற்களுக்கு இடையே + குரல்.', hard: true },
          { ipa: '/s/', ta: 'ஸ்',  ex: 'sun',     exTa: 'ஸன்',     note: 'தமிழ் "ஸ" போலவே.' },
          { ipa: '/z/', ta: 'ஸ்',  ex: 'zoo',     exTa: 'ஸூ',      note: 'குரலுடன் "ஸ". தமிழில் இல்லை — மார்பில் அதிர்வு உணர வேண்டும்.', hard: true },
          { ipa: '/ʃ/', ta: 'ஷ்',  ex: 'she',     exTa: 'ஷீ',      note: 'தமிழ் "ஷ" போலவே.' },
          { ipa: '/ʒ/', ta: 'ஜ்',  ex: 'measure', exTa: 'மெஷர்',   note: 'குரலுடன் "ஷ" — அரிதான ஒலி.', hard: true },
          { ipa: '/h/', ta: 'ஹ்',  ex: 'hat',     exTa: 'ஹாட்',    note: 'வெறும் மூச்சுக் காற்று.' }
        ]
      },
      {
        name: { ta: 'கூட்டொலிகள் (Affricates)', en: 'Affricates' },
        items: [
          { ipa: '/tʃ/', ta: 'ச்', ex: 'chair', exTa: 'சேர்',  note: 'தமிழ் "ச்" போலவே.' },
          { ipa: '/dʒ/', ta: 'ஜ்', ex: 'jump',  exTa: 'ஜம்ப்', note: 'குரலுடன் "ச" = "ஜ".' }
        ]
      },
      {
        name: { ta: 'மூக்கொலி & ஓரொலி', en: 'Nasals, liquids & glides' },
        items: [
          { ipa: '/m/', ta: 'ம்', ex: 'man',   exTa: 'மான்',  note: 'தமிழ் "ம்" போலவே.' },
          { ipa: '/n/', ta: 'ன்', ex: 'no',    exTa: 'நோ',    note: 'தமிழ் "ந்/ன்" போலவே.' },
          { ipa: '/ŋ/', ta: 'ங்', ex: 'sing',  exTa: 'ஸிங்',  note: 'தமிழ் "ங்" போலவே. இறுதியில் "க்" சேர்க்காதீர்கள்.' },
          { ipa: '/l/', ta: 'ல்', ex: 'leg',   exTa: 'லெக்',  note: 'தமிழ் "ல்" போலவே.' },
          { ipa: '/r/', ta: 'ர்', ex: 'red',   exTa: 'ரெட்',  note: 'நாக்கு அண்ணத்தை தொடாமல் — தமிழ் "ர" போல் உருட்டக் கூடாது.', hard: true },
          { ipa: '/w/', ta: 'வ்', ex: 'water', exTa: 'வாட்டர்', note: 'உதடுகளை குவித்து "உ"-விலிருந்து தொடங்கவும்.' },
          { ipa: '/j/', ta: 'ய்', ex: 'yes',   exTa: 'யெஸ்',  note: 'தமிழ் "ய்" போலவே.' }
        ]
      }
    ],

    /* spelling → sound rules that trip Tamil speakers up */
    rules: [
      { rule: 'silent letters', ta: 'எழுதப்பட்டாலும் ஒலிக்காத எழுத்துகள்', ex: ['know → நோ', 'write → ரைட்', 'listen → லிஸன்', 'hour → அவர்', 'lamb → லாம்'] },
      { rule: 'magic e',        ta: 'இறுதி e — தானே ஒலிக்காது, ஆனால் முன்னுள்ள உயிரை நீட்டும்', ex: ['hat → hate', 'bit → bite', 'not → note', 'cut → cute'] },
      { rule: 'c sound',        ta: 'c + e/i/y = "ஸ்", இல்லையேல் "க்"', ex: ['city → ஸிட்டி', 'cat → கேட்', 'cycle → ஸைக்கிள்'] },
      { rule: 'g sound',        ta: 'g + e/i/y = "ஜ்", இல்லையேல் "க்"', ex: ['giant → ஜையன்ட்', 'go → கோ', 'gym → ஜிம்'] },
      { rule: 'ough',           ta: 'ough — ஒரே எழுத்துக்கூட்டு, பல ஒலிகள்', ex: ['though → தோ', 'through → த்ரூ', 'cough → காஃப்', 'enough → இனஃப்', 'bought → பாட்'] },
      { rule: 'plural -s',      ta: 'பன்மை -s மூன்று ஒலிகள்', ex: ['cats → ட்ஸ்', 'dogs → ஸ்(z)', 'buses → இஸ்'] },
      { rule: 'past -ed',       ta: 'இறந்தகால -ed மூன்று ஒலிகள்', ex: ['walked → ட்', 'played → ட்(d)', 'wanted → இட்'] },
      { rule: 'schwa stress',   ta: 'வலியுறுத்தப்படாத அசை schwa ஆகும்', ex: ['banana → பனானா (ப-NA-ன)', 'computer → கம்-ப்யூ-டர்'] }
    ]
  },

  /* ================= HINDI ================= */
  hi: {
    label: { ta: 'இந்தி வர்ணமாலா (देवनागरी)', en: 'Hindi alphabet' },
    groups: [
      {
        name: { ta: 'உயிர் எழுத்துகள் (स्वर)', en: 'Vowels' },
        items: [
          { hi: 'अ', hiR: 'a',  ta: 'அ', note: 'தமிழ் அ' },
          { hi: 'आ', hiR: 'ā',  ta: 'ஆ', note: 'தமிழ் ஆ' },
          { hi: 'इ', hiR: 'i',  ta: 'இ', note: 'தமிழ் இ' },
          { hi: 'ई', hiR: 'ī',  ta: 'ஈ', note: 'தமிழ் ஈ' },
          { hi: 'उ', hiR: 'u',  ta: 'உ', note: 'தமிழ் உ' },
          { hi: 'ऊ', hiR: 'ū',  ta: 'ஊ', note: 'தமிழ் ஊ' },
          { hi: 'ए', hiR: 'e',  ta: 'ஏ', note: 'தமிழ் ஏ' },
          { hi: 'ऐ', hiR: 'ai', ta: 'ஐ', note: 'தமிழ் ஐ (ஆனால் "ஏ"-க்கு அருகில் ஒலிக்கும்)' },
          { hi: 'ओ', hiR: 'o',  ta: 'ஓ', note: 'தமிழ் ஓ' },
          { hi: 'औ', hiR: 'au', ta: 'ஔ', note: 'தமிழ் ஔ' },
          { hi: 'ऋ', hiR: 'ṛ',  ta: 'ரி', note: 'சமஸ்கிருத ஒலி — "ரி" போல ஒலிக்கும்' },
          { hi: 'अं', hiR: 'aṁ', ta: 'அம்', note: 'அனுஸ்வாரம் — மூக்கொலி' },
          { hi: 'अः', hiR: 'aḥ', ta: 'அஃ', note: 'விசர்கம் — தமிழ் ஆய்த எழுத்து ஃ போல' }
        ]
      },
      {
        name: { ta: 'க வரிசை (कवर्ग)', en: 'Velars' },
        items: [
          { hi: 'क', hiR: 'ka',  ta: 'க',  note: 'தமிழ் க' },
          { hi: 'ख', hiR: 'kha', ta: 'க்ஹ', note: 'மூச்சுக் காற்றுடன் "க" — aspirated', asp: true },
          { hi: 'ग', hiR: 'ga',  ta: 'க(g)', note: 'குரலுடன் — தமிழில் தனி எழுத்து இல்லை', hard: true },
          { hi: 'घ', hiR: 'gha', ta: 'க(gh)', note: 'குரல் + மூச்சு', asp: true, hard: true },
          { hi: 'ङ', hiR: 'ṅa',  ta: 'ங',  note: 'தமிழ் ங' }
        ]
      },
      {
        name: { ta: 'ச வரிசை (चवर्ग)', en: 'Palatals' },
        items: [
          { hi: 'च', hiR: 'ca',  ta: 'ச',  note: 'தமிழ் ச' },
          { hi: 'छ', hiR: 'cha', ta: 'ச்ஹ', note: 'மூச்சுடன் "ச"', asp: true },
          { hi: 'ज', hiR: 'ja',  ta: 'ஜ',  note: 'தமிழ் ஜ' },
          { hi: 'झ', hiR: 'jha', ta: 'ஜ்ஹ', note: 'குரல் + மூச்சு', asp: true, hard: true },
          { hi: 'ञ', hiR: 'ña',  ta: 'ஞ',  note: 'தமிழ் ஞ' }
        ]
      },
      {
        name: { ta: 'ட வரிசை (टवर्ग)', en: 'Retroflex' },
        items: [
          { hi: 'ट', hiR: 'ṭa',  ta: 'ட',  note: 'தமிழ் ட' },
          { hi: 'ठ', hiR: 'ṭha', ta: 'ட்ஹ', note: 'மூச்சுடன் "ட"', asp: true },
          { hi: 'ड', hiR: 'ḍa',  ta: 'ட(d)', note: 'குரலுடன்', hard: true },
          { hi: 'ढ', hiR: 'ḍha', ta: 'ட(dh)', note: 'குரல் + மூச்சு', asp: true, hard: true },
          { hi: 'ण', hiR: 'ṇa',  ta: 'ண',  note: 'தமிழ் ண' }
        ]
      },
      {
        name: { ta: 'த வரிசை (तवर्ग)', en: 'Dentals' },
        items: [
          { hi: 'त', hiR: 'ta',  ta: 'த',  note: 'தமிழ் த' },
          { hi: 'थ', hiR: 'tha', ta: 'த்ஹ', note: 'மூச்சுடன் "த"', asp: true },
          { hi: 'द', hiR: 'da',  ta: 'த(d)', note: 'குரலுடன்', hard: true },
          { hi: 'ध', hiR: 'dha', ta: 'த(dh)', note: 'குரல் + மூச்சு', asp: true, hard: true },
          { hi: 'न', hiR: 'na',  ta: 'ந',  note: 'தமிழ் ந' }
        ]
      },
      {
        name: { ta: 'ப வரிசை (पवर्ग)', en: 'Labials' },
        items: [
          { hi: 'प', hiR: 'pa',  ta: 'ப',  note: 'தமிழ் ப' },
          { hi: 'फ', hiR: 'pha', ta: 'ஃப', note: 'மூச்சுடன் "ப"; நவீன இந்தியில் "ஃப" (f) போல', asp: true },
          { hi: 'ब', hiR: 'ba',  ta: 'ப(b)', note: 'குரலுடன்', hard: true },
          { hi: 'भ', hiR: 'bha', ta: 'ப(bh)', note: 'குரல் + மூச்சு', asp: true, hard: true },
          { hi: 'म', hiR: 'ma',  ta: 'ம',  note: 'தமிழ் ம' }
        ]
      },
      {
        name: { ta: 'இதர எழுத்துகள்', en: 'Semivowels, sibilants & others' },
        items: [
          { hi: 'य', hiR: 'ya', ta: 'ய', note: 'தமிழ் ய' },
          { hi: 'र', hiR: 'ra', ta: 'ர', note: 'தமிழ் ர' },
          { hi: 'ल', hiR: 'la', ta: 'ல', note: 'தமிழ் ல' },
          { hi: 'व', hiR: 'va', ta: 'வ', note: 'தமிழ் வ' },
          { hi: 'श', hiR: 'śa', ta: 'ஷ', note: 'தமிழ் ஷ' },
          { hi: 'ष', hiR: 'ṣa', ta: 'ஷ', note: 'श-க்கு மிக நெருக்கமான ஒலி' },
          { hi: 'स', hiR: 'sa', ta: 'ஸ', note: 'தமிழ் ஸ' },
          { hi: 'ह', hiR: 'ha', ta: 'ஹ', note: 'தமிழ் ஹ' },
          { hi: 'क्ष', hiR: 'kṣa', ta: 'க்ஷ', note: 'கூட்டெழுத்து' },
          { hi: 'त्र', hiR: 'tra', ta: 'த்ர', note: 'கூட்டெழுத்து' },
          { hi: 'ज्ञ', hiR: 'jña', ta: 'க்ஞ', note: 'கூட்டெழுத்து — "க்ய" போல ஒலிக்கும்' },
          { hi: 'ड़', hiR: 'ṛa', ta: 'ட³', note: 'நுனிநாக்கு தட்டல் — தமிழில் இல்லை', hard: true },
          { hi: 'ज़', hiR: 'za', ta: 'ஜ(z)', note: 'கடன் ஒலி (z)', hard: true },
          { hi: 'फ़', hiR: 'fa', ta: 'ஃப', note: 'கடன் ஒலி (f)', hard: true }
        ]
      }
    ],
    rules: [
      { rule: 'மாத்திரை (मात्रा)', ta: 'மெய்யெழுத்துடன் உயிர்க் குறியீடு சேரும்', ex: ['क + ा = का', 'क + ि = कि', 'क + ी = की', 'क + ु = कु'] },
      { rule: 'ஹலந்த் (हलंत् ्)', ta: 'உயிர் நீக்கி மெய்யாக்கும் — தமிழ் புள்ளி போல', ex: ['क् = க்', 'न् = ந்'] },
      { rule: 'பாலினம் (लिंग)', ta: 'இந்தியில் ஒவ்வொரு பெயர்ச்சொல்லுக்கும் பாலினம் உண்டு; வினைச்சொல்லும் மாறும் — தமிழில் இப்படி இல்லை', ex: ['लड़का जाता है (ஆண்)', 'लड़की जाती है (பெண்)'] },
      { rule: 'சொல் வரிசை', ta: 'இந்தியும் தமிழும் SOV — எழுவாய் + செயப்படுபொருள் + வினை. இது தமிழருக்கு பெரும் சாதகம்!', ex: ['मैं खाना खाता हूँ = நான் உணவு சாப்பிடுகிறேன்'] }
    ]
  },

  /* ================= TAMIL (anchor reference) ================= */
  ta: {
    label: { ta: 'தமிழ் எழுத்துகள் (அடிப்படை)', en: 'Tamil alphabet' },
    groups: [
      {
        name: { ta: 'உயிர் எழுத்து (12)', en: 'Vowels' },
        items: [
          { ta: 'அ', taR: 'a' }, { ta: 'ஆ', taR: 'ā' }, { ta: 'இ', taR: 'i' }, { ta: 'ஈ', taR: 'ī' },
          { ta: 'உ', taR: 'u' }, { ta: 'ஊ', taR: 'ū' }, { ta: 'எ', taR: 'e' }, { ta: 'ஏ', taR: 'ē' },
          { ta: 'ஐ', taR: 'ai' }, { ta: 'ஒ', taR: 'o' }, { ta: 'ஓ', taR: 'ō' }, { ta: 'ஔ', taR: 'au' }
        ]
      },
      {
        name: { ta: 'மெய் எழுத்து (18)', en: 'Consonants' },
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
