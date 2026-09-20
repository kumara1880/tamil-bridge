/* Tamil Bridge — lexicon + morphology tables.
   Powers (a) word-meaning lookup and (b) the sentence-analysis engine.
   Entry format:  word: [pos, tamilMeaning, hindiMeaning]
   pos codes: pron noun verb aux adj adv prep conj det num wh part intj      */
window.TB = window.TB || {};

TB.LEX = { en: {}, hi: {}, ta: {} };

/* ---------------------------------------------------------------- ENGLISH */
TB.LEX.en = {
  /* pronouns */
  i: ['pron', 'நான்', 'मैं'], me: ['pron', 'என்னை', 'मुझे'], my: ['det', 'என்', 'मेरा'], mine: ['pron', 'என்னுடையது', 'मेरा'], myself: ['pron', 'நானே', 'खुद'],
  you: ['pron', 'நீ / நீங்கள்', 'तुम / आप'], your: ['det', 'உன் / உங்கள்', 'तुम्हारा / आपका'], yours: ['pron', 'உன்னுடையது', 'तुम्हारा'],
  he: ['pron', 'அவன் / அவர்', 'वह'], him: ['pron', 'அவனை', 'उसे'], his: ['det', 'அவனுடைய', 'उसका'],
  she: ['pron', 'அவள்', 'वह'], her: ['det', 'அவளுடைய', 'उसका'], hers: ['pron', 'அவளுடையது', 'उसका'],
  it: ['pron', 'அது', 'यह / वह'], its: ['det', 'அதனுடைய', 'इसका'],
  we: ['pron', 'நாங்கள் / நாம்', 'हम'], us: ['pron', 'எங்களை', 'हमें'], our: ['det', 'எங்கள்', 'हमारा'], ours: ['pron', 'எங்களுடையது', 'हमारा'],
  they: ['pron', 'அவர்கள்', 'वे'], them: ['pron', 'அவர்களை', 'उन्हें'], their: ['det', 'அவர்களுடைய', 'उनका'], theirs: ['pron', 'அவர்களுடையது', 'उनका'],
  this: ['det', 'இது', 'यह'], that: ['det', 'அது', 'वह'], these: ['det', 'இவை', 'ये'], those: ['det', 'அவை', 'वे'],
  who: ['wh', 'யார்', 'कौन'], whom: ['wh', 'யாரை', 'किसे'], whose: ['wh', 'யாருடைய', 'किसका'],
  what: ['wh', 'என்ன', 'क्या'], which: ['wh', 'எது', 'कौन सा'], where: ['wh', 'எங்கே', 'कहाँ'],
  when: ['wh', 'எப்போது', 'कब'], why: ['wh', 'ஏன்', 'क्यों'], how: ['wh', 'எப்படி', 'कैसे'],

  /* be / auxiliaries / modals */
  am: ['aux', 'இருக்கிறேன்', 'हूँ'], is: ['aux', 'இருக்கிறது / ஆகும்', 'है'], are: ['aux', 'இருக்கிறார்கள்', 'हैं'],
  was: ['aux', 'இருந்தது', 'था'], were: ['aux', 'இருந்தார்கள்', 'थे'], be: ['aux', 'இருத்தல்', 'होना'],
  been: ['aux', 'இருந்திருக்கிறது', 'रहा है'], being: ['aux', 'இருந்து கொண்டு', 'हो रहा'],
  have: ['aux', 'வைத்திருக்கிறேன் / உள்ளது', 'है / रखना'], has: ['aux', 'உள்ளது', 'है'], had: ['aux', 'இருந்தது', 'था'],
  do: ['aux', 'செய்', 'करना'], does: ['aux', 'செய்கிறது', 'करता है'], did: ['aux', 'செய்தது', 'किया'],
  will: ['aux', '-வேன் (எதிர்காலம்)', '-गा / -गी'], shall: ['aux', '-வோம்', '-गे'], would: ['aux', '-வாக இருக்கும்', 'होगा'],
  can: ['aux', 'முடியும்', 'सकता है'], could: ['aux', 'முடியுமா / முடிந்தது', 'सका'],
  may: ['aux', 'இருக்கலாம்', 'सकता है'], might: ['aux', 'இருக்கக்கூடும்', 'शायद'],
  must: ['aux', 'வேண்டும்', 'चाहिए'], should: ['aux', 'வேண்டும்', 'चाहिए'],

  /* negation & particles */
  not: ['part', 'இல்லை', 'नहीं'], "n't": ['part', 'இல்லை', 'नहीं'], no: ['det', 'இல்லை', 'नहीं'],
  yes: ['intj', 'ஆம்', 'हाँ'], please: ['adv', 'தயவுசெய்து', 'कृपया'], not_: ['part', 'இல்லை', 'नहीं'],

  /* determiners & quantifiers */
  a: ['det', 'ஒரு', 'एक'], an: ['det', 'ஒரு', 'एक'], the: ['det', 'அந்த (குறிப்பிட்ட)', '—'],
  some: ['det', 'சில / கொஞ்சம்', 'कुछ'], any: ['det', 'ஏதேனும்', 'कोई'], all: ['det', 'அனைத்தும்', 'सब'],
  many: ['det', 'பல', 'बहुत'], much: ['det', 'அதிகம்', 'बहुत'], few: ['det', 'சில', 'कुछ'],
  every: ['det', 'ஒவ்வொரு', 'हर'], each: ['det', 'ஒவ்வொன்றும்', 'प्रत्येक'], other: ['adj', 'மற்ற', 'दूसरा'],
  more: ['adj', 'மேலும்', 'ज़्यादा'], most: ['adj', 'மிக அதிகம்', 'सबसे ज़्यादा'], very: ['adv', 'மிகவும்', 'बहुत'],

  /* prepositions */
  since: ['prep', '-இலிருந்து (காலம்)', 'से'], until: ['prep', '-வரை', 'तक'],
  through: ['prep', '-வழியாக', 'के through'], across: ['prep', '-குறுக்கே', 'के पार'],
  along: ['prep', '-வழியே', 'के साथ'], against: ['prep', '-எதிராக', 'के खिलाफ'],
  among: ['prep', '-மத்தியில்', 'के बीच'], within: ['prep', '-உள்ளே', 'के अंदर'],
  upon: ['prep', '-மீது', 'पर'], toward: ['prep', '-நோக்கி', 'की ओर'],
  around: ['prep', '-சுற்றி', 'के आसपास'], beside: ['prep', '-பக்கத்தில்', 'के बगल में'],
  in: ['prep', '-இல் (உள்ளே)', 'में'], on: ['prep', '-மீது', 'पर'], at: ['prep', '-இல் (இடம்/நேரம்)', 'पर'],
  to: ['prep', '-க்கு', 'को'], from: ['prep', '-இலிருந்து', 'से'], of: ['prep', '-இன்', 'का'],
  with: ['prep', '-உடன்', 'के साथ'], without: ['prep', '-இல்லாமல்', 'के बिना'],
  for: ['prep', '-க்காக', 'के लिए'], by: ['prep', '-ஆல்', 'द्वारा'], about: ['prep', '-பற்றி', 'के बारे में'],
  under: ['prep', '-கீழ்', 'के नीचे'], over: ['prep', '-மேல்', 'के ऊपर'], between: ['prep', '-இடையே', 'के बीच'],
  before: ['prep', '-முன்', 'से पहले'], after: ['prep', '-பின்', 'के बाद'], into: ['prep', '-உள்ளே', 'में'],
  near: ['prep', '-அருகில்', 'के पास'], behind: ['prep', '-பின்னால்', 'के पीछे'], during: ['prep', '-போது', 'के दौरान'],

  /* conjunctions */
  and: ['conj', 'மற்றும்', 'और'], or: ['conj', 'அல்லது', 'या'], but: ['conj', 'ஆனால்', 'लेकिन'],
  because: ['conj', 'ஏனென்றால்', 'क्योंकि'], if: ['conj', 'என்றால்', 'अगर'], so: ['conj', 'எனவே', 'इसलिए'],
  although: ['conj', 'இருந்தபோதிலும்', 'हालाँकि'], while: ['conj', '-போது', 'जबकि'], than: ['conj', '-விட', 'से'],

  /* very common verbs (base forms; morphology handles inflection) */
  go: ['verb', 'செல்', 'जाना'], come: ['verb', 'வா', 'आना'], eat: ['verb', 'சாப்பிடு', 'खाना'],
  drink: ['verb', 'குடி', 'पीना'], sleep: ['verb', 'தூங்கு', 'सोना'], wake: ['verb', 'எழு', 'जागना'],
  read: ['verb', 'படி', 'पढ़ना'], write: ['verb', 'எழுது', 'लिखना'], speak: ['verb', 'பேசு', 'बोलना'],
  talk: ['verb', 'பேசு', 'बात करना'], say: ['verb', 'சொல்', 'कहना'], tell: ['verb', 'சொல்', 'बताना'],
  listen: ['verb', 'கேள்', 'सुनना'], hear: ['verb', 'கேள்', 'सुनना'], see: ['verb', 'பார்', 'देखना'],
  look: ['verb', 'பார்', 'देखना'], watch: ['verb', 'பார்', 'देखना'], learn: ['verb', 'கற்றுக்கொள்', 'सीखना'],
  teach: ['verb', 'கற்பி', 'सिखाना'], study: ['verb', 'படி', 'पढ़ाई करना'], know: ['verb', 'தெரி', 'जानना'],
  think: ['verb', 'நினை', 'सोचना'], understand: ['verb', 'புரிந்துகொள்', 'समझना'], want: ['verb', 'வேண்டும்', 'चाहना'],
  need: ['verb', 'தேவை', 'ज़रूरत होना'], like: ['verb', 'விரும்பு', 'पसंद करना'], love: ['verb', 'நேசி', 'प्यार करना'],
  give: ['verb', 'கொடு', 'देना'], take: ['verb', 'எடு', 'लेना'], make: ['verb', 'செய்', 'बनाना'],
  work: ['verb', 'வேலை செய்', 'काम करना'], play: ['verb', 'விளையாடு', 'खेलना'], run: ['verb', 'ஓடு', 'दौड़ना'],
  walk: ['verb', 'நட', 'चलना'], sit: ['verb', 'உட்கார்', 'बैठना'], stand: ['verb', 'நில்', 'खड़ा होना'],
  open: ['verb', 'திற', 'खोलना'], close: ['verb', 'மூடு', 'बंद करना'], buy: ['verb', 'வாங்கு', 'खरीदना'],
  sell: ['verb', 'விற்று', 'बेचना'], help: ['verb', 'உதவு', 'मदद करना'], live: ['verb', 'வாழ்', 'रहना'],
  get: ['verb', 'பெறு', 'पाना'], put: ['verb', 'வை', 'रखना'], find: ['verb', 'கண்டுபிடி', 'ढूँढना'],
  ask: ['verb', 'கேள்', 'पूछना'], answer: ['verb', 'பதிலளி', 'जवाब देना'], call: ['verb', 'அழை', 'बुलाना'],
  bring: ['verb', 'கொண்டுவா', 'लाना'], send: ['verb', 'அனுப்பு', 'भेजना'], meet: ['verb', 'சந்தி', 'मिलना'],
  start: ['verb', 'தொடங்கு', 'शुरू करना'], stop: ['verb', 'நிறுத்து', 'रोकना'], finish: ['verb', 'முடி', 'खत्म करना'],
  wait: ['verb', 'காத்திரு', 'इंतज़ार करना'], try: ['verb', 'முயற்சி செய்', 'कोशिश करना'], use: ['verb', 'பயன்படுத்து', 'इस्तेमाल करना'],
  feel: ['verb', 'உணர்', 'महसूस करना'], become: ['verb', 'ஆகு', 'बनना'], leave: ['verb', 'புறப்படு', 'छोड़ना'],
  cook: ['verb', 'சமை', 'पकाना'], wash: ['verb', 'கழுவு', 'धोना'], drive: ['verb', 'ஓட்டு', 'चलाना'],
  cry: ['verb', 'அழு', 'रोना'], laugh: ['verb', 'சிரி', 'हँसना'], sing: ['verb', 'பாடு', 'गाना'],
  dance: ['verb', 'ஆடு', 'नाचना'], pay: ['verb', 'பணம் செலுத்து', 'भुगतान करना'], cost: ['verb', 'விலை', 'कीमत होना'],
  reduce: ['verb', 'குறை', 'कम करना'], need_: ['verb', 'தேவை', 'ज़रूरत'],

  /* common adjectives / adverbs / nouns not already in VOCAB */
  now: ['adv', 'இப்போது', 'अभी'], then: ['adv', 'அப்போது', 'तब'], here: ['adv', 'இங்கே', 'यहाँ'],
  there: ['adv', 'அங்கே', 'वहाँ'], always: ['adv', 'எப்போதும்', 'हमेशा'], never: ['adv', 'ஒருபோதும் இல்லை', 'कभी नहीं'],
  often: ['adv', 'அடிக்கடி', 'अक्सर'], sometimes: ['adv', 'சில சமயம்', 'कभी-कभी'], again: ['adv', 'மீண்டும்', 'फिर से'],
  slowly: ['adv', 'மெதுவாக', 'धीरे'], quickly: ['adv', 'விரைவாக', 'जल्दी'], well: ['adv', 'நன்றாக', 'अच्छा'],
  too: ['adv', 'மிகவும் / கூட', 'भी / बहुत'], also: ['adv', 'கூட', 'भी'], only: ['adv', 'மட்டும்', 'केवल'],
  today: ['noun', 'இன்று', 'आज'], tomorrow: ['noun', 'நாளை', 'कल'], yesterday: ['noun', 'நேற்று', 'कल'],
  name: ['noun', 'பெயர்', 'नाम'], time: ['noun', 'நேரம்', 'समय'], place: ['noun', 'இடம்', 'जगह'],
  thing: ['noun', 'பொருள்', 'चीज़'], people: ['noun', 'மக்கள்', 'लोग'], person: ['noun', 'நபர்', 'व्यक्ति'],
  man: ['noun', 'ஆண்', 'आदमी'], woman: ['noun', 'பெண்', 'औरत'], child: ['noun', 'குழந்தை', 'बच्चा'],
  boy: ['noun', 'சிறுவன்', 'लड़का'], girl: ['noun', 'சிறுமி', 'लड़की'], year: ['noun', 'ஆண்டு', 'साल'],
  life: ['noun', 'வாழ்க்கை', 'ज़िंदगी'], world: ['noun', 'உலகம்', 'दुनिया'], country: ['noun', 'நாடு', 'देश'],
  city: ['noun', 'நகரம்', 'शहर'], village: ['noun', 'கிராமம்', 'गाँव'], india: ['noun', 'இந்தியா', 'भारत'],
  english: ['noun', 'ஆங்கிலம்', 'अंग्रेज़ी'], tamil: ['noun', 'தமிழ்', 'तमिल'], hindi: ['noun', 'இந்தி', 'हिंदी'],
  food: ['noun', 'உணவு', 'खाना'], movie: ['noun', 'திரைப்படம்', 'फ़िल्म'], headache: ['noun', 'தலைவலி', 'सिरदर्द'],
  glass: ['noun', 'குவளை', 'गिलास'], cat: ['noun', 'பூனை', 'बिल्ली'], dog: ['noun', 'நாய்', 'कुत्ता'],
  apple: ['noun', 'ஆப்பிள்', 'सेब'], meat: ['noun', 'இறைச்சி', 'मांस'], hour: ['noun', 'மணி நேரம்', 'घंटा'],
  nice: ['adj', 'நல்ல / இனிமையான', 'अच्छा'], bright: ['adj', 'பிரகாசமான', 'चमकीला'],
  ready: ['adj', 'தயார்', 'तैयार'], sure: ['adj', 'நிச்சயம்', 'ज़रूर'], right: ['adj', 'சரி / வலது', 'सही'],
  left: ['adj', 'இடது', 'बायाँ'], true: ['adj', 'உண்மை', 'सच'], false: ['adj', 'பொய்', 'झूठ'],
  easy: ['adj', 'எளிதான', 'आसान'], difficult: ['adj', 'கடினமான', 'मुश्किल'], important: ['adj', 'முக்கியமான', 'ज़रूरी'],
  beautiful: ['adj', 'அழகான', 'सुंदर'], young: ['adj', 'இளமையான', 'जवान'], elder: ['adj', 'மூத்த', 'बड़ा'],
  twenty: ['num', 'இருபது', 'बीस'], nine: ['num', 'ஒன்பது', 'नौ']
};

/* English irregular verbs: base -> [past, pastParticiple] */
TB.IRREGULAR = {
  be: ['was/were', 'been'], have: ['had', 'had'], do: ['did', 'done'], go: ['went', 'gone'],
  come: ['came', 'come'], see: ['saw', 'seen'], eat: ['ate', 'eaten'], drink: ['drank', 'drunk'],
  give: ['gave', 'given'], take: ['took', 'taken'], make: ['made', 'made'], say: ['said', 'said'],
  tell: ['told', 'told'], know: ['knew', 'known'], think: ['thought', 'thought'], get: ['got', 'got'],
  find: ['found', 'found'], leave: ['left', 'left'], feel: ['felt', 'felt'], bring: ['brought', 'brought'],
  buy: ['bought', 'bought'], teach: ['taught', 'taught'], catch: ['caught', 'caught'], write: ['wrote', 'written'],
  read: ['read', 'read'], run: ['ran', 'run'], sit: ['sat', 'sat'], stand: ['stood', 'stood'],
  speak: ['spoke', 'spoken'], sing: ['sang', 'sung'], sleep: ['slept', 'slept'], send: ['sent', 'sent'],
  spend: ['spent', 'spent'], meet: ['met', 'met'], pay: ['paid', 'paid'], put: ['put', 'put'],
  cut: ['cut', 'cut'], let: ['let', 'let'], hear: ['heard', 'heard'], hold: ['held', 'held'],
  keep: ['kept', 'kept'], lose: ['lost', 'lost'], win: ['won', 'won'], become: ['became', 'become'],
  begin: ['began', 'begun'], break: ['broke', 'broken'], build: ['built', 'built'], choose: ['chose', 'chosen'],
  drive: ['drove', 'driven'], fall: ['fell', 'fallen'], fly: ['flew', 'flown'], forget: ['forgot', 'forgotten'],
  grow: ['grew', 'grown'], understand: ['understood', 'understood'], wear: ['wore', 'worn'], swim: ['swam', 'swum']
};
/* reverse map: inflected form -> base */
TB.IRREG_REV = {};
Object.keys(TB.IRREGULAR).forEach(function (base) {
  TB.IRREGULAR[base].forEach(function (form) {
    form.split('/').forEach(function (f) { if (f !== base) TB.IRREG_REV[f] = base; });
  });
});

/* ------------------------------------------------------------------ HINDI */
TB.LEX.hi = {
  'मैं': ['pron', 'நான்', 'I'], 'मुझे': ['pron', 'எனக்கு', 'to me'], 'मेरा': ['det', 'என்', 'my'], 'मेरी': ['det', 'என்', 'my'],
  'तुम': ['pron', 'நீ', 'you'], 'आप': ['pron', 'நீங்கள்', 'you (formal)'], 'तुम्हारा': ['det', 'உன்', 'your'], 'आपका': ['det', 'உங்கள்', 'your'],
  'वह': ['pron', 'அவன் / அவள் / அது', 'he / she / it'], 'उसे': ['pron', 'அவனை', 'him/her'], 'उसका': ['det', 'அவனுடைய', 'his/her'],
  'उसने': ['pron', 'அவன்/அவள் (செய்தான்)', 'he/she (ergative)'],
  'हम': ['pron', 'நாங்கள்', 'we'], 'हमें': ['pron', 'எங்களுக்கு', 'to us'], 'हमारा': ['det', 'எங்கள்', 'our'], 'हमने': ['pron', 'நாங்கள் (செய்தோம்)', 'we (ergative)'],
  'वे': ['pron', 'அவர்கள்', 'they'], 'उन्हें': ['pron', 'அவர்களை', 'them'], 'उनका': ['det', 'அவர்களுடைய', 'their'],
  'यह': ['det', 'இது', 'this'], 'ये': ['det', 'இவை', 'these'], 'मैंने': ['pron', 'நான் (செய்தேன்)', 'I (ergative)'],
  'तुमने': ['pron', 'நீ (செய்தாய்)', 'you (ergative)'], 'इसकी': ['det', 'இதனுடைய', 'its'], 'इसे': ['pron', 'இதை', 'this'],

  'क्या': ['wh', 'என்ன', 'what'], 'कौन': ['wh', 'யார்', 'who'], 'कहाँ': ['wh', 'எங்கே', 'where'],
  'कब': ['wh', 'எப்போது', 'when'], 'क्यों': ['wh', 'ஏன்', 'why'], 'कैसे': ['wh', 'எப்படி', 'how'],
  'कितना': ['wh', 'எவ்வளவு', 'how much'], 'कौनसा': ['wh', 'எது', 'which'], 'किसका': ['wh', 'யாருடைய', 'whose'],

  'है': ['aux', 'இருக்கிறது (ஒருமை)', 'is'], 'हैं': ['aux', 'இருக்கிறார்கள் (பன்மை)', 'are'],
  'हूँ': ['aux', 'இருக்கிறேன்', 'am'], 'हो': ['aux', 'இருக்கிறாய்', 'are'],
  'था': ['aux', 'இருந்தான் (ஆண்)', 'was'], 'थी': ['aux', 'இருந்தாள் (பெண்)', 'was'], 'थे': ['aux', 'இருந்தார்கள்', 'were'],
  'रहा': ['aux', 'கொண்டிருக்கிறான்', '-ing (m)'], 'रही': ['aux', 'கொண்டிருக்கிறாள்', '-ing (f)'], 'रहे': ['aux', 'கொண்டிருக்கிறார்கள்', '-ing (pl)'],
  'गा': ['aux', 'எதிர்காலம் (ஆண்)', 'will (m)'], 'गी': ['aux', 'எதிர்காலம் (பெண்)', 'will (f)'], 'गे': ['aux', 'எதிர்காலம் (பன்மை)', 'will (pl)'],
  'सकता': ['aux', 'முடியும் (ஆண்)', 'can (m)'], 'सकती': ['aux', 'முடியும் (பெண்)', 'can (f)'], 'सकते': ['aux', 'முடியும் (பன்மை)', 'can (pl)'],
  'चाहिए': ['aux', 'வேண்டும்', 'need / should'], 'नहीं': ['part', 'இல்லை', 'not'], 'ना': ['part', 'இல்லை', 'no'],
  'हाँ': ['intj', 'ஆம்', 'yes'], 'कृपया': ['adv', 'தயவுசெய்து', 'please'],

  'में': ['prep', '-இல் (உள்ளே)', 'in'], 'पर': ['prep', '-மீது', 'on'], 'को': ['prep', '-ஐ / -க்கு', 'to'],
  'से': ['prep', '-இலிருந்து / -ஆல்', 'from / by'], 'का': ['prep', '-இன் (ஆண்)', 'of'], 'की': ['prep', '-இன் (பெண்)', 'of'],
  'के': ['prep', '-இன் (பன்மை)', 'of'], 'तक': ['prep', '-வரை', 'until'], 'लिए': ['prep', '-க்காக', 'for'],
  'साथ': ['prep', '-உடன்', 'with'], 'पास': ['prep', '-அருகில்', 'near'], 'नीचे': ['prep', '-கீழ்', 'under'],
  'ऊपर': ['prep', '-மேல்', 'above'], 'बाद': ['prep', '-பின்', 'after'], 'पहले': ['prep', '-முன்', 'before'],

  'और': ['conj', 'மற்றும்', 'and'], 'या': ['conj', 'அல்லது', 'or'], 'लेकिन': ['conj', 'ஆனால்', 'but'],
  'क्योंकि': ['conj', 'ஏனென்றால்', 'because'], 'अगर': ['conj', 'என்றால்', 'if'], 'इसलिए': ['conj', 'எனவே', 'so'],

  'एक': ['num', 'ஒன்று', 'one'], 'दो': ['num', 'இரண்டு', 'two'], 'तीन': ['num', 'மூன்று', 'three'],
  'बहुत': ['adv', 'மிகவும்', 'very'], 'थोड़ा': ['adv', 'கொஞ்சம்', 'a little'], 'अभी': ['adv', 'இப்போது', 'now'],
  'आज': ['noun', 'இன்று', 'today'], 'कल': ['noun', 'நாளை / நேற்று', 'tomorrow / yesterday'],
  'रोज़': ['adv', 'தினமும்', 'daily'], 'यहाँ': ['adv', 'இங்கே', 'here'], 'वहाँ': ['adv', 'அங்கே', 'there'],
  'फिर': ['adv', 'மீண்டும்', 'again'], 'धीरे': ['adv', 'மெதுவாக', 'slowly'], 'जल्दी': ['adv', 'விரைவாக', 'quickly'],
  'अच्छा': ['adj', 'நல்ல', 'good'], 'बुरा': ['adj', 'கெட்ட', 'bad'], 'बड़ा': ['adj', 'பெரிய', 'big'],
  'छोटा': ['adj', 'சிறிய', 'small'], 'नया': ['adj', 'புதிய', 'new'], 'पुराना': ['adj', 'பழைய', 'old'],
  'महँगा': ['adj', 'விலை உயர்ந்த', 'expensive'], 'सस्ता': ['adj', 'மலிவான', 'cheap'],

  'जाना': ['verb', 'செல்', 'to go'], 'आना': ['verb', 'வா', 'to come'], 'खाना': ['verb', 'சாப்பிடு / உணவு', 'to eat / food'],
  'पीना': ['verb', 'குடி', 'to drink'], 'करना': ['verb', 'செய்', 'to do'], 'होना': ['verb', 'ஆகு', 'to be'],
  'देना': ['verb', 'கொடு', 'to give'], 'लेना': ['verb', 'எடு', 'to take'], 'कहना': ['verb', 'சொல்', 'to say'],
  'देखना': ['verb', 'பார்', 'to see'], 'सुनना': ['verb', 'கேள்', 'to hear'], 'पढ़ना': ['verb', 'படி', 'to read'],
  'लिखना': ['verb', 'எழுது', 'to write'], 'बोलना': ['verb', 'பேசு', 'to speak'], 'सीखना': ['verb', 'கற்றுக்கொள்', 'to learn'],
  'समझना': ['verb', 'புரிந்துகொள்', 'to understand'], 'चाहना': ['verb', 'விரும்பு', 'to want'],
  'मदद': ['noun', 'உதவி', 'help'], 'काम': ['noun', 'வேலை', 'work'], 'नाम': ['noun', 'பெயர்', 'name'],
  'घर': ['noun', 'வீடு', 'house'], 'पानी': ['noun', 'தண்ணீர்', 'water'], 'किताब': ['noun', 'புத்தகம்', 'book'],
  'समय': ['noun', 'நேரம்', 'time'], 'लोग': ['noun', 'மக்கள்', 'people'], 'दाम': ['noun', 'விலை', 'price'],
  'कीमत': ['noun', 'விலை', 'price'], 'तबीयत': ['noun', 'உடல்நிலை', 'health'], 'दर्द': ['noun', 'வலி', 'pain'],

  /* inflected verb forms the analyser meets constantly */
  'गया': ['verb', 'சென்றான்', 'went (m)'], 'गई': ['verb', 'சென்றாள்', 'went (f)'], 'गए': ['verb', 'சென்றார்கள்', 'went (pl)'],
  'आया': ['verb', 'வந்தான்', 'came (m)'], 'आई': ['verb', 'வந்தாள்', 'came (f)'], 'आए': ['verb', 'வந்தார்கள்', 'came (pl)'],
  'किया': ['verb', 'செய்தான்', 'did'], 'हुआ': ['verb', 'ஆனது', 'happened'], 'हुई': ['verb', 'ஆனது', 'happened (f)'],
  'दिया': ['verb', 'கொடுத்தான்', 'gave'], 'लिया': ['verb', 'எடுத்தான்', 'took'], 'कहा': ['verb', 'சொன்னான்', 'said'],
  'देखा': ['verb', 'பார்த்தான்', 'saw'], 'देखी': ['verb', 'பார்த்தாள்', 'saw (f)'], 'सुना': ['verb', 'கேட்டான்', 'heard'],
  'पढ़ा': ['verb', 'படித்தான்', 'read'], 'पढ़': ['verb', 'படி', 'read (stem)'], 'लिखा': ['verb', 'எழுதினான்', 'wrote'],
  'बनाया': ['verb', 'செய்தான் / சமைத்தான்', 'made'], 'खाया': ['verb', 'சாப்பிட்டான்', 'ate'], 'खा': ['verb', 'சாப்பிடு', 'eat (stem)'],
  'पिया': ['verb', 'குடித்தான்', 'drank'], 'मिला': ['verb', 'கிடைத்தது', 'got / met'], 'मिलकर': ['verb', 'சந்தித்து', 'having met'],
  'जाता': ['verb', 'செல்கிறான்', 'goes (m)'], 'जाती': ['verb', 'செல்கிறாள்', 'goes (f)'], 'जाते': ['verb', 'செல்கிறார்கள்', 'go (pl)'],
  'करता': ['verb', 'செய்கிறான்', 'does (m)'], 'करती': ['verb', 'செய்கிறாள்', 'does (f)'], 'करते': ['verb', 'செய்கிறார்கள்', 'do (pl)'],
  'सीख': ['verb', 'கற்று', 'learn (stem)'], 'बोल': ['verb', 'பேசு', 'speak (stem)'], 'सुन': ['verb', 'கேள்', 'listen (stem)'],
  'जा': ['verb', 'செல்', 'go (stem)'], 'आ': ['verb', 'வா', 'come (stem)'], 'कर': ['verb', 'செய்', 'do (stem)'],
  'सकता': ['aux', 'முடியும் (ஆண்)', 'can (m)'], 'निकलेंगे': ['verb', 'புறப்படுவார்கள்', 'will leave'],
  'आएगी': ['verb', 'வருவாள்', 'will come (f)'], 'आऊँगा': ['verb', 'வருவேன்', 'will come (m)'],
  'सीखेगी': ['verb', 'கற்பாள்', 'will learn (f)'], 'करेंगे': ['verb', 'செய்வார்கள்', 'will do'],
  'ठीक': ['adj', 'சரி', 'fine'], 'बजे': ['noun', 'மணிக்கு', "o'clock"], 'फ़िल्म': ['noun', 'திரைப்படம்', 'film'],
  'सेब': ['noun', 'ஆப்பிள்', 'apple'], 'मांस': ['noun', 'இறைச்சி', 'meat'], 'गिलास': ['noun', 'குவளை', 'glass'],
  'बिल्ली': ['noun', 'பூனை', 'cat'], 'कुत्ता': ['noun', 'நாய்', 'dog'], 'सिर': ['noun', 'தலை', 'head'],
  'इंतज़ार': ['noun', 'காத்திருப்பு', 'waiting'], 'भारत': ['noun', 'இந்தியா', 'India'],
  'अंग्रेज़ी': ['noun', 'ஆங்கிலம்', 'English'], 'हिंदी': ['noun', 'இந்தி', 'Hindi'], 'छात्र': ['noun', 'மாணவர்', 'student'],
  'खुशी': ['noun', 'மகிழ்ச்சி', 'happiness'], 'समझ': ['noun', 'புரிதல்', 'understanding'], 'बारिश': ['noun', 'மழை', 'rain']
};

/* ------------------------------------------------------------------ TAMIL */
/* Function words and high-frequency verbs. Without these the analyser mistakes
   pronouns like "நான்" for past-tense verbs (both end in -ான்/-ன்).          */
TB.LEX.ta = {
  'நான்': ['pron', 'I', 'मैं'], 'என்': ['det', 'my', 'मेरा'], 'என்னை': ['pron', 'me', 'मुझे'],
  'எனக்கு': ['pron', 'to me', 'मुझे'], 'என்னுடைய': ['det', 'my', 'मेरा'],
  'நீ': ['pron', 'you', 'तुम'], 'நீங்கள்': ['pron', 'you (formal)', 'आप'], 'நீங்க': ['pron', 'you', 'आप'],
  'உன்': ['det', 'your', 'तुम्हारा'], 'உங்கள்': ['det', 'your', 'आपका'], 'உனக்கு': ['pron', 'to you', 'तुम्हें'],
  'அவன்': ['pron', 'he', 'वह'], 'அவள்': ['pron', 'she', 'वह'], 'அவர்': ['pron', 'he/she (formal)', 'वह'],
  'அது': ['pron', 'it', 'वह'], 'இது': ['pron', 'this', 'यह'], 'அவை': ['pron', 'those', 'वे'],
  'இவை': ['pron', 'these', 'ये'], 'நாங்கள்': ['pron', 'we', 'हम'], 'நாம்': ['pron', 'we (inclusive)', 'हम'],
  'அவர்கள்': ['pron', 'they', 'वे'], 'அவங்க': ['pron', 'they', 'वे'], 'தான்': ['part', 'self / indeed', 'ही'],

  'என்ன': ['wh', 'what', 'क्या'], 'யார்': ['wh', 'who', 'कौन'], 'எங்கே': ['wh', 'where', 'कहाँ'],
  'எப்போது': ['wh', 'when', 'कब'], 'ஏன்': ['wh', 'why', 'क्यों'], 'எப்படி': ['wh', 'how', 'कैसे'],
  'எது': ['wh', 'which', 'कौन सा'], 'எவ்வளவு': ['wh', 'how much', 'कितना'],

  'ஆம்': ['intj', 'yes', 'हाँ'], 'இல்லை': ['part', 'no / not', 'नहीं'], 'இல்ல': ['part', 'not', 'नहीं'],
  'மற்றும்': ['conj', 'and', 'और'], 'ஆனால்': ['conj', 'but', 'लेकिन'], 'அல்லது': ['conj', 'or', 'या'],
  'ஏனென்றால்': ['conj', 'because', 'क्योंकि'], 'எனவே': ['conj', 'so', 'इसलिए'], 'என்றால்': ['conj', 'if', 'अगर'],

  'ஒரு': ['det', 'a / one', 'एक'], 'அந்த': ['det', 'that / the', 'वह'], 'இந்த': ['det', 'this', 'यह'],
  'சில': ['det', 'some', 'कुछ'], 'எல்லா': ['det', 'all', 'सब'], 'ஒவ்வொரு': ['det', 'every', 'हर'],
  'மிகவும்': ['adv', 'very', 'बहुत'], 'ரொம்ப': ['adv', 'very', 'बहुत'], 'கொஞ்சம்': ['adv', 'a little', 'थोड़ा'],
  'இப்போது': ['adv', 'now', 'अभी'], 'அப்போது': ['adv', 'then', 'तब'], 'இங்கே': ['adv', 'here', 'यहाँ'],
  'அங்கே': ['adv', 'there', 'वहाँ'], 'மீண்டும்': ['adv', 'again', 'फिर'], 'தினமும்': ['adv', 'daily', 'रोज़'],
  'நன்றாக': ['adv', 'well', 'अच्छा'], 'மெதுவாக': ['adv', 'slowly', 'धीरे'], 'விரைவாக': ['adv', 'quickly', 'जल्दी'],

  /* verb roots the ending-stripper needs to land on */
  'செல்': ['verb', 'go', 'जाना'], 'போ': ['verb', 'go', 'जाना'], 'வா': ['verb', 'come', 'आना'],
  'வர': ['verb', 'come', 'आना'], 'இரு': ['verb', 'be / stay', 'होना'], 'உள்ள': ['verb', 'is / exists', 'है'],
  'படி': ['verb', 'read / study', 'पढ़ना'], 'எழுது': ['verb', 'write', 'लिखना'], 'பேசு': ['verb', 'speak', 'बोलना'],
  'பார்': ['verb', 'see', 'देखना'], 'கேள்': ['verb', 'hear / ask', 'सुनना'], 'சாப்பிடு': ['verb', 'eat', 'खाना'],
  'குடி': ['verb', 'drink', 'पीना'], 'செய்': ['verb', 'do', 'करना'], 'கொடு': ['verb', 'give', 'देना'],
  'எடு': ['verb', 'take', 'लेना'], 'சொல்': ['verb', 'say', 'कहना'], 'கற்று': ['verb', 'learn', 'सीखना'],
  'தூங்கு': ['verb', 'sleep', 'सोना'], 'விளையாடு': ['verb', 'play', 'खेलना'], 'ஓடு': ['verb', 'run', 'दौड़ना'],
  'நட': ['verb', 'walk', 'चलना'], 'உட்கார்': ['verb', 'sit', 'बैठना'], 'வாங்கு': ['verb', 'buy', 'खरीदना'],
  'உதவு': ['verb', 'help', 'मदद करना'], 'வேண்டும்': ['verb', 'want / need', 'चाहिए'],
  'முடியும்': ['aux', 'can', 'सकता है'], 'தெரியும்': ['verb', 'know', 'जानना'], 'புரி': ['verb', 'understand', 'समझना'],
  'நினை': ['verb', 'think', 'सोचना'], 'விரும்பு': ['verb', 'like', 'पसंद करना'], 'சமை': ['verb', 'cook', 'पकाना'],
  'அழு': ['verb', 'cry', 'रोना'], 'சிரி': ['verb', 'laugh', 'हँसना'], 'பாடு': ['verb', 'sing', 'गाना'],
  'காத்திரு': ['verb', 'wait', 'इंतज़ार करना'], 'கேட்க': ['verb', 'to ask', 'पूछना'],
  'வரு': ['verb', 'come', 'आना'], 'தரு': ['verb', 'give', 'देना'], 'கொள்': ['verb', 'take / hold', 'लेना'],
  'இருக்': ['verb', 'be', 'होना'], 'பண்ணு': ['verb', 'do', 'करना'], 'ஆகு': ['verb', 'become', 'बनना']
};

/* Tamil case suffixes (வேற்றுமை உருபுகள்) — used by the analyser */
TB.TA_CASES = [
  { suf: 'இலிருந்து', name: 'நீங்கல் (ablative)', en: 'from',      hi: 'से' },
  { suf: 'யிலிருந்து', name: 'நீங்கல் (ablative)', en: 'from',     hi: 'से' },
  { suf: 'உடன்',     name: 'உடனிகழ்ச்சி (comitative)', en: 'with', hi: 'के साथ' },
  { suf: 'ோடு',      name: 'உடனிகழ்ச்சி (comitative)', en: 'with', hi: 'के साथ' },
  { suf: 'க்காக',    name: 'கொடை (benefactive)', en: 'for',        hi: 'के लिए' },
  { suf: 'ுக்கு',    name: 'கொடை (dative)', en: 'to / for',        hi: 'को' },
  { suf: 'க்கு',     name: 'கொடை (dative)', en: 'to / for',        hi: 'को' },
  { suf: 'யில்',     name: 'இடம் (locative)', en: 'in / at',       hi: 'में' },
  { suf: 'இல்',      name: 'இடம் (locative)', en: 'in / at',       hi: 'में' },
  { suf: 'ில்',      name: 'இடம் (locative)', en: 'in / at',       hi: 'में' },
  { suf: 'ால்',      name: 'கருவி (instrumental)', en: 'by / with', hi: 'से' },
  { suf: 'ஆல்',      name: 'கருவி (instrumental)', en: 'by / with', hi: 'से' },
  { suf: 'ின்',      name: 'உடைமை (genitive)', en: 'of',           hi: 'का' },
  { suf: 'ுடைய',    name: 'உடைமை (genitive)', en: 'of / -’s', hi: 'का' },
  { suf: 'ை',        name: 'செயப்படுபொருள் (accusative)', en: 'object marker', hi: 'को' }
];

/* Tamil verb endings -> person / tense */
TB.TA_VERB_ENDINGS = [
  { suf: 'கிறேன்',  tense: 'present', person: 'நான் (I)',            en: 'I … (present)' },
  { suf: 'கின்றேன்', tense: 'present', person: 'நான் (I)',           en: 'I … (present)' },
  { suf: 'கிறாய்',  tense: 'present', person: 'நீ (you)',            en: 'you … (present)' },
  { suf: 'கிறான்',  tense: 'present', person: 'அவன் (he)',           en: 'he …s' },
  { suf: 'கிறாள்',  tense: 'present', person: 'அவள் (she)',          en: 'she …s' },
  { suf: 'கிறார்',  tense: 'present', person: 'அவர் (he/she formal)', en: 'he/she …s' },
  { suf: 'கிறது',   tense: 'present', person: 'அது (it)',            en: 'it …s' },
  { suf: 'கிறோம்',  tense: 'present', person: 'நாங்கள் (we)',        en: 'we …' },
  { suf: 'கிறீர்கள்', tense: 'present', person: 'நீங்கள் (you pl)',  en: 'you … (plural)' },
  { suf: 'கிறார்கள்', tense: 'present', person: 'அவர்கள் (they)',    en: 'they …' },
  { suf: 'ந்தேன்',  tense: 'past', person: 'நான் (I)',               en: 'I …ed' },
  { suf: 'த்தேன்',  tense: 'past', person: 'நான் (I)',               en: 'I …ed' },
  { suf: 'ினேன்',   tense: 'past', person: 'நான் (I)',               en: 'I …ed' },
  { suf: 'ேன்',     tense: 'past', person: 'நான் (I)',               en: 'I …ed' },
  { suf: 'ாய்',     tense: 'past', person: 'நீ (you)',               en: 'you …ed' },
  { suf: 'ான்',     tense: 'past', person: 'அவன் (he)',              en: 'he …ed' },
  { suf: 'ாள்',     tense: 'past', person: 'அவள் (she)',             en: 'she …ed' },
  { suf: 'ார்கள்',  tense: 'past', person: 'அவர்கள் (they)',         en: 'they …ed' },
  { suf: 'ோம்',     tense: 'past', person: 'நாங்கள் (we)',           en: 'we …ed' },
  { suf: 'வேன்',    tense: 'future', person: 'நான் (I)',             en: 'I will …' },
  { suf: 'பேன்',    tense: 'future', person: 'நான் (I)',             en: 'I will …' },
  { suf: 'வாய்',    tense: 'future', person: 'நீ (you)',             en: 'you will …' },
  { suf: 'வான்',    tense: 'future', person: 'அவன் (he)',            en: 'he will …' },
  { suf: 'வாள்',    tense: 'future', person: 'அவள் (she)',           en: 'she will …' },
  { suf: 'வார்',    tense: 'future', person: 'அவர் (he/she)',        en: 'he/she will …' },
  { suf: 'வோம்',    tense: 'future', person: 'நாங்கள் (we)',         en: 'we will …' },
  { suf: 'வார்கள்', tense: 'future', person: 'அவர்கள் (they)',       en: 'they will …' },
  { suf: 'வில்லை',  tense: 'negative', person: '—',                  en: 'did not / does not' },
  { suf: 'மாட்டேன்', tense: 'negative-future', person: 'நான் (I)',   en: 'I will not' }
];

/* Build reverse indexes so any language can be looked up from any other. */
TB.buildIndexes = function () {
  var ta2 = {}, en2 = {}, hi2 = {};
  TB.VOCAB.forEach(function (w) {
    ta2[w.ta] = w; en2[w.en.toLowerCase()] = w; hi2[w.hi] = w;
  });
  TB.IDX = { ta: ta2, en: en2, hi: hi2 };
  return TB.IDX;
};
