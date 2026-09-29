/* Tamil Bridge — sentences, generated rather than listed.

   A hundred thousand sentences cannot be written by hand, and a hundred
   thousand written by hand would be a hundred thousand chances to be wrong.
   They can be built, though, from parts that are each correct, by rules
   that are each correct — and then there are more of them than anyone could
   work through, in all three languages, with the grammar guaranteed.

   Two things make this harder than gluing words together.

   First, the three languages disagree about where the verb goes and what it
   agrees with. English puts it after the subject; Tamil and Hindi put it
   last. Tamil marks the person on the verb (நான் சாப்பிடுகிறேன், அவள்
   சாப்பிடுகிறாள்). Hindi marks gender, and in the past tense of a
   transitive verb it agrees with the OBJECT — मैंने किताब पढ़ी — which is
   why every object here carries its Hindi gender.

   Second, a sentence can be perfectly grammatical and still be nonsense.
   "I eat water" and "I call a shirt" are both well formed and both useless
   to a learner. So every verb declares what kind of thing it can act on,
   and only those objects are offered to it.                                */
window.TB = window.TB || {};

TB.Sentences = (function () {

  /* Tamil endings are vowel signs, not letters: they ride on the last
     consonant of the stem. சாப்பிடுகிற + ேன் = சாப்பிடுகிறேன். */
  var SUBJECTS = [
    { en: 'I',            ta: 'நான்',        taEnd: 'ேன்',    hiKey: '1s', g: 'm', third: 0, hi: 'मैं',        hiErg: 'मैंने',        label: 'I (man speaking)' },
    { en: 'I',            ta: 'நான்',        taEnd: 'ேன்',    hiKey: '1s', g: 'f', third: 0, hi: 'मैं',        hiErg: 'मैंने',        label: 'I (woman speaking)' },
    { en: 'You',          ta: 'நீங்கள்',     taEnd: 'ீர்கள்', hiKey: '2f', g: 'm', third: 0, hi: 'आप',         hiErg: 'आपने',         label: 'You (respectful)' },
    { en: 'He',           ta: 'அவன்',        taEnd: 'ான்',    hiKey: '3s', g: 'm', third: 1, hi: 'वह',         hiErg: 'उसने',         label: 'He' },
    { en: 'She',          ta: 'அவள்',        taEnd: 'ாள்',    hiKey: '3s', g: 'f', third: 1, hi: 'वह',         hiErg: 'उसने',         label: 'She' },
    { en: 'We',           ta: 'நாங்கள்',     taEnd: 'ோம்',    hiKey: '1p', g: 'm', third: 0, hi: 'हम',         hiErg: 'हमने',         label: 'We' },
    { en: 'They',         ta: 'அவர்கள்',     taEnd: 'ார்கள்', hiKey: '3p', g: 'm', third: 0, hi: 'वे',         hiErg: 'उन्होंने',     label: 'They' },
    { en: 'Ravi',         ta: 'ரவி',         taEnd: 'ான்',    hiKey: '3s', g: 'm', third: 1, hi: 'रवि',        hiErg: 'रवि ने',       label: 'Ravi' },
    { en: 'Priya',        ta: 'பிரியா',      taEnd: 'ாள்',    hiKey: '3s', g: 'f', third: 1, hi: 'प्रिया',     hiErg: 'प्रिया ने',    label: 'Priya' },
    { en: 'The boy',      ta: 'சிறுவன்',     taEnd: 'ான்',    hiKey: '3s', g: 'm', third: 1, hi: 'लड़का',      hiErg: 'लड़के ने',     label: 'The boy' },
    { en: 'The girl',     ta: 'சிறுமி',      taEnd: 'ாள்',    hiKey: '3s', g: 'f', third: 1, hi: 'लड़की',      hiErg: 'लड़की ने',     label: 'The girl' },
    { en: 'The children', ta: 'குழந்தைகள்',  taEnd: 'ார்கள்', hiKey: '3p', g: 'm', third: 0, hi: 'बच्चे',      hiErg: 'बच्चों ने',    label: 'The children' }
  ];

  var HI_ORDER = ['1s', '2s', '2p', '3s', '1p', '2f', '3p'];

  /* p present stem, d past stem, f future stem, inf the infinitive, which
     Tamil needs for both negatives: சாப்பிட + வில்லை, சாப்பிட + மாட்டேன். */
  var VERBS = [
    { en: 'eat',   hi: 'खाना',      tr: 1, takes: ['food'],            ta: { p: 'சாப்பிடுகிற', d: 'சாப்பிட்ட', f: 'சாப்பிடுவ', inf: 'சாப்பிட' } },
    { en: 'drink', hi: 'पीना',      tr: 1, takes: ['drink'],           ta: { p: 'குடிக்கிற', d: 'குடித்த', f: 'குடிப்ப', inf: 'குடிக்க' } },
    { en: 'cook',  hi: 'पकाना',     tr: 1, takes: ['food'],            ta: { p: 'சமைக்கிற', d: 'சமைத்த', f: 'சமைப்ப', inf: 'சமைக்க' } },
    { en: 'read',  hi: 'पढ़ना',     tr: 1, takes: ['text'],            ta: { p: 'படிக்கிற', d: 'படித்த', f: 'படிப்ப', inf: 'படிக்க' } },
    { en: 'write', hi: 'लिखना',     tr: 1, takes: ['text'],            ta: { p: 'எழுதுகிற', d: 'எழுதின', f: 'எழுதுவ', inf: 'எழுத' } },
    { en: 'see',   hi: 'देखना',     tr: 1, takes: ['text', 'thing', 'nature', 'vehicle', 'place'], ta: { p: 'பார்க்கிற', d: 'பார்த்த', f: 'பார்ப்ப', inf: 'பார்க்க' } },
    { en: 'buy',   hi: 'ख़रीदना',   tr: 1, takes: ['food', 'drink', 'thing', 'clothes', 'text', 'vehicle'], ta: { p: 'வாங்குகிற', d: 'வாங்கின', f: 'வாங்குவ', inf: 'வாங்க' } },
    { en: 'sell',  hi: 'बेचना',     tr: 1, takes: ['food', 'thing', 'clothes', 'vehicle'], ta: { p: 'விற்கிற', d: 'விற்ற', f: 'விற்ப', inf: 'விற்க' } },
    { en: 'wash',  hi: 'धोना',      tr: 1, takes: ['clothes', 'thing', 'food'], ta: { p: 'கழுவுகிற', d: 'கழுவின', f: 'கழுவுவ', inf: 'கழுவ' } },
    { en: 'open',  hi: 'खोलना',     tr: 1, takes: ['openable'],        ta: { p: 'திறக்கிற', d: 'திறந்த', f: 'திறப்ப', inf: 'திறக்க' } },
    { en: 'close', hi: 'बंद करना',  tr: 1, takes: ['openable'],        ta: { p: 'மூடுகிற', d: 'மூடின', f: 'மூடுவ', inf: 'மூட' } },
    { en: 'bring', hi: 'लाना',      tr: 1, takes: ['food', 'drink', 'thing', 'text', 'clothes'], ta: { p: 'கொண்டுவருகிற', d: 'கொண்டுவந்த', f: 'கொண்டுவருவ', inf: 'கொண்டுவர' } },
    { en: 'keep',  hi: 'रखना',      tr: 1, takes: ['thing', 'text', 'clothes', 'food'], ta: { p: 'வைக்கிற', d: 'வைத்த', f: 'வைப்ப', inf: 'வைக்க' } },
    { en: 'take',  hi: 'लेना',      tr: 1, takes: ['thing', 'text', 'clothes', 'food', 'drink'], ta: { p: 'எடுக்கிற', d: 'எடுத்த', f: 'எடுப்ப', inf: 'எடுக்க' } },
    { en: 'give',  hi: 'देना',      tr: 1, takes: ['thing', 'text', 'food', 'drink'], ta: { p: 'கொடுக்கிற', d: 'கொடுத்த', f: 'கொடுப்ப', inf: 'கொடுக்க' } },
    { en: 'send',  hi: 'भेजना',     tr: 1, takes: ['text', 'thing'],   ta: { p: 'அனுப்புகிற', d: 'அனுப்பின', f: 'அனுப்புவ', inf: 'அனுப்ப' } },
    { en: 'find',  hi: 'ढूँढ़ना',   tr: 1, takes: ['thing', 'text', 'clothes'], ta: { p: 'தேடுகிற', d: 'தேடின', f: 'தேடுவ', inf: 'தேட' } },
    { en: 'show',  hi: 'दिखाना',    tr: 1, takes: ['text', 'thing', 'clothes'], ta: { p: 'காட்டுகிற', d: 'காட்டின', f: 'காட்டுவ', inf: 'காட்ட' } },
    { en: 'cut',   hi: 'काटना',     tr: 1, takes: ['food', 'nature'],  ta: { p: 'வெட்டுகிற', d: 'வெட்டின', f: 'வெட்டுவ', inf: 'வெட்ட' } },
    { en: 'break', hi: 'तोड़ना',    tr: 1, takes: ['thing', 'openable'], ta: { p: 'உடைக்கிற', d: 'உடைத்த', f: 'உடைப்ப', inf: 'உடைக்க' } },
    { en: 'carry', hi: 'उठाना',     tr: 1, takes: ['thing', 'clothes'], ta: { p: 'தூக்குகிற', d: 'தூக்கின', f: 'தூக்குவ', inf: 'தூக்க' } },
    { en: 'wear',  hi: 'पहनना',     tr: 1, takes: ['clothes'],         ta: { p: 'அணிகிற', d: 'அணிந்த', f: 'அணிவ', inf: 'அணிய' } },
    { en: 'draw',  hi: 'बनाना',     tr: 1, takes: ['drawable'],        ta: { p: 'வரைகிற', d: 'வரைந்த', f: 'வரைவ', inf: 'வரைய' } },
    { en: 'count', hi: 'गिनना',     tr: 1, takes: ['countable'],       ta: { p: 'எண்ணுகிற', d: 'எண்ணின', f: 'எண்ணுவ', inf: 'எண்ண' } },
    { en: 'plant', hi: 'लगाना',     tr: 1, takes: ['nature'],          ta: { p: 'நடுகிற', d: 'நட்ட', f: 'நடுவ', inf: 'நட' } },
    { en: 'clean', hi: 'साफ़ करना', tr: 1, takes: ['thing', 'openable', 'clothes'], ta: { p: 'சுத்தம் செய்கிற', d: 'சுத்தம் செய்த', f: 'சுத்தம் செய்வ', inf: 'சுத்தம் செய்ய' } },

    { en: 'go',    hi: 'जाना',           tr: 0, ta: { p: 'போகிற', d: 'போன', f: 'போவ', inf: 'போக' } },
    { en: 'come',  hi: 'आना',            tr: 0, ta: { p: 'வருகிற', d: 'வந்த', f: 'வருவ', inf: 'வர' } },
    { en: 'run',   hi: 'दौड़ना',         tr: 0, ta: { p: 'ஓடுகிற', d: 'ஓடின', f: 'ஓடுவ', inf: 'ஓட' } },
    { en: 'walk',  hi: 'चलना',           tr: 0, ta: { p: 'நடக்கிற', d: 'நடந்த', f: 'நடப்ப', inf: 'நடக்க' } },
    { en: 'sit',   hi: 'बैठना',          tr: 0, ta: { p: 'உட்காருகிற', d: 'உட்கார்ந்த', f: 'உட்காருவ', inf: 'உட்கார' } },
    { en: 'sleep', hi: 'सोना',           tr: 0, ta: { p: 'தூங்குகிற', d: 'தூங்கின', f: 'தூங்குவ', inf: 'தூங்க' } },
    { en: 'laugh', hi: 'हँसना',          tr: 0, ta: { p: 'சிரிக்கிற', d: 'சிரித்த', f: 'சிரிப்ப', inf: 'சிரிக்க' } },
    { en: 'sing',  hi: 'गाना',           tr: 0, ta: { p: 'பாடுகிற', d: 'பாடின', f: 'பாடுவ', inf: 'பாட' } },
    { en: 'dance', hi: 'नाचना',          tr: 0, ta: { p: 'ஆடுகிற', d: 'ஆடின', f: 'ஆடுவ', inf: 'ஆட' } },
    { en: 'play',  hi: 'खेलना',          tr: 0, ta: { p: 'விளையாடுகிற', d: 'விளையாடின', f: 'விளையாடுவ', inf: 'விளையாட' } },
    { en: 'swim',  hi: 'तैरना',          tr: 0, ta: { p: 'நீந்துகிற', d: 'நீந்தின', f: 'நீந்துவ', inf: 'நீந்த' } },
    { en: 'jump',  hi: 'कूदना',          tr: 0, ta: { p: 'குதிக்கிற', d: 'குதித்த', f: 'குதிப்ப', inf: 'குதிக்க' } },
    { en: 'speak', hi: 'बोलना',          tr: 0, ta: { p: 'பேசுகிற', d: 'பேசின', f: 'பேசுவ', inf: 'பேச' } },
    { en: 'work',  hi: 'काम करना',       tr: 0, ta: { p: 'வேலை செய்கிற', d: 'வேலை செய்த', f: 'வேலை செய்வ', inf: 'வேலை செய்ய' } },
    { en: 'wait',  hi: 'इंतज़ार करना',   tr: 0, ta: { p: 'காத்திருக்கிற', d: 'காத்திருந்த', f: 'காத்திருப்ப', inf: 'காத்திருக்க' } },
    { en: 'study', hi: 'पढ़ाई करना',     tr: 0, ta: { p: 'படிக்கிற', d: 'படித்த', f: 'படிப்ப', inf: 'படிக்க' } },
    { en: 'rest',  hi: 'आराम करना',      tr: 0, ta: { p: 'ஓய்வெடுக்கிற', d: 'ஓய்வெடுத்த', f: 'ஓய்வெடுப்ப', inf: 'ஓய்வெடுக்க' } }
  ];

  /* Every object carries its Hindi gender, because the past tense of a
     transitive verb agrees with it, and a category, so that a verb is only
     offered things it could plausibly act on. */
  var OBJECTS = [
    { en: 'rice',        ta: 'சாதம்',          hi: 'चावल',      g: 'm', cat: ['food', 'countable'] },
    { en: 'bread',       ta: 'ரொட்டி',         hi: 'रोटी',      g: 'f', cat: ['food'] },
    { en: 'food',        ta: 'உணவு',           hi: 'खाना',      g: 'm', cat: ['food'] },
    { en: 'an apple',    ta: 'ஆப்பிள்',        hi: 'सेब',       g: 'm', cat: ['food', 'countable', 'drawable'] },
    { en: 'a banana',    ta: 'வாழைப்பழம்',     hi: 'केला',      g: 'm', cat: ['food', 'countable', 'drawable'] },
    { en: 'a mango',     ta: 'மாம்பழம்',       hi: 'आम',        g: 'm', cat: ['food', 'countable', 'drawable'] },
    { en: 'vegetables',  ta: 'காய்கறி',        hi: 'सब्ज़ी',    g: 'f', cat: ['food'] },
    { en: 'an egg',      ta: 'முட்டை',         hi: 'अंडा',      g: 'm', cat: ['food', 'countable'] },
    { en: 'fish',        ta: 'மீன்',           hi: 'मछली',      g: 'f', cat: ['food', 'countable', 'drawable'] },
    { en: 'a sweet',     ta: 'இனிப்பு',        hi: 'मिठाई',     g: 'f', cat: ['food', 'countable'] },
    { en: 'water',       ta: 'தண்ணீர்',        hi: 'पानी',      g: 'm', cat: ['drink'] },
    { en: 'milk',        ta: 'பால்',           hi: 'दूध',       g: 'm', cat: ['drink'] },
    { en: 'tea',         ta: 'தேநீர்',         hi: 'चाय',       g: 'f', cat: ['drink'] },
    { en: 'coffee',      ta: 'காபி',           hi: 'कॉफ़ी',     g: 'f', cat: ['drink'] },
    { en: 'juice',       ta: 'பழச்சாறு',       hi: 'जूस',       g: 'm', cat: ['drink'] },
    { en: 'a book',      ta: 'புத்தகம்',       hi: 'किताब',     g: 'f', cat: ['text', 'thing', 'countable'] },
    { en: 'a letter',    ta: 'கடிதம்',         hi: 'चिट्ठी',    g: 'f', cat: ['text', 'countable'] },
    { en: 'a story',     ta: 'கதை',            hi: 'कहानी',     g: 'f', cat: ['text', 'countable'] },
    { en: 'a poem',      ta: 'கவிதை',          hi: 'कविता',     g: 'f', cat: ['text', 'countable'] },
    { en: 'the news',    ta: 'செய்தி',         hi: 'ख़बर',      g: 'f', cat: ['text'] },
    { en: 'a lesson',    ta: 'பாடம்',          hi: 'पाठ',       g: 'm', cat: ['text', 'countable'] },
    { en: 'a shirt',     ta: 'சட்டை',          hi: 'क़मीज़',    g: 'f', cat: ['clothes', 'countable'] },
    { en: 'a saree',     ta: 'புடவை',          hi: 'साड़ी',     g: 'f', cat: ['clothes', 'countable'] },
    { en: 'a cap',       ta: 'தொப்பி',         hi: 'टोपी',      g: 'f', cat: ['clothes', 'countable'] },
    { en: 'a shoe',      ta: 'காலணி',          hi: 'जूता',      g: 'm', cat: ['clothes', 'countable'] },
    { en: 'clothes',     ta: 'துணி',           hi: 'कपड़े',     g: 'm', cat: ['clothes'] },
    { en: 'a door',      ta: 'கதவு',           hi: 'दरवाज़ा',   g: 'm', cat: ['openable', 'thing', 'countable'] },
    { en: 'a window',    ta: 'ஜன்னல்',         hi: 'खिड़की',    g: 'f', cat: ['openable', 'thing', 'countable'] },
    { en: 'a box',       ta: 'பெட்டி',         hi: 'डिब्बा',    g: 'm', cat: ['openable', 'thing', 'countable'] },
    { en: 'a bottle',    ta: 'பாட்டில்',       hi: 'बोतल',      g: 'f', cat: ['openable', 'thing', 'countable'] },
    { en: 'a bag',       ta: 'பை',             hi: 'बैग',       g: 'm', cat: ['openable', 'thing', 'countable'] },
    { en: 'a pen',       ta: 'பேனா',           hi: 'क़लम',      g: 'f', cat: ['thing', 'countable'] },
    { en: 'a pencil',    ta: 'பென்சில்',       hi: 'पेंसिल',    g: 'f', cat: ['thing', 'countable'] },
    { en: 'a plate',     ta: 'தட்டு',          hi: 'थाली',      g: 'f', cat: ['thing', 'countable'] },
    { en: 'a cup',       ta: 'கோப்பை',         hi: 'कप',        g: 'm', cat: ['thing', 'countable'] },
    { en: 'a key',       ta: 'சாவி',           hi: 'चाबी',      g: 'f', cat: ['thing', 'countable'] },
    { en: 'a phone',     ta: 'கைபேசி',         hi: 'फ़ोन',      g: 'm', cat: ['thing', 'countable'] },
    { en: 'a chair',     ta: 'நாற்காலி',       hi: 'कुर्सी',    g: 'f', cat: ['thing', 'countable'] },
    { en: 'a table',     ta: 'மேசை',           hi: 'मेज़',      g: 'f', cat: ['thing', 'countable'] },
    { en: 'a towel',     ta: 'துண்டு',         hi: 'तौलिया',    g: 'm', cat: ['thing', 'clothes', 'countable'] },
    { en: 'a flower',    ta: 'பூ',             hi: 'फूल',       g: 'm', cat: ['nature', 'countable', 'drawable'] },
    { en: 'a tree',      ta: 'மரம்',           hi: 'पेड़',      g: 'm', cat: ['nature', 'countable', 'drawable'] },
    { en: 'a leaf',      ta: 'இலை',            hi: 'पत्ता',     g: 'm', cat: ['nature', 'countable', 'drawable'] },
    { en: 'a seed',      ta: 'விதை',           hi: 'बीज',       g: 'm', cat: ['nature', 'countable'] },
    { en: 'a bird',      ta: 'பறவை',           hi: 'चिड़िया',   g: 'f', cat: ['nature', 'countable', 'drawable'] },
    { en: 'a car',       ta: 'கார்',           hi: 'गाड़ी',     g: 'f', cat: ['vehicle', 'countable', 'drawable'] },
    { en: 'a bus',       ta: 'பேருந்து',       hi: 'बस',        g: 'f', cat: ['vehicle', 'countable', 'drawable'] },
    { en: 'a cycle',     ta: 'மிதிவண்டி',      hi: 'साइकिल',    g: 'f', cat: ['vehicle', 'countable', 'drawable'] },
    { en: 'a house',     ta: 'வீடு',           hi: 'घर',        g: 'm', cat: ['place', 'countable', 'drawable'] },
    { en: 'a school',    ta: 'பள்ளி',          hi: 'स्कूल',     g: 'm', cat: ['place', 'countable'] },
    { en: 'a shop',      ta: 'கடை',            hi: 'दुकान',     g: 'f', cat: ['place', 'countable'] },
    { en: 'a garden',    ta: 'தோட்டம்',        hi: 'बग़ीचा',    g: 'm', cat: ['place', 'countable'] },
    { en: 'a star',      ta: 'நட்சத்திரம்',    hi: 'तारा',      g: 'm', cat: ['nature', 'countable', 'drawable'] },
    { en: 'a picture',   ta: 'படம்',           hi: 'तस्वीर',    g: 'f', cat: ['text', 'thing', 'countable'] }
  ];

  var ADVERBS = [
    { en: 'every day',      ta: 'தினமும்',          hi: 'रोज़' },
    { en: 'today',          ta: 'இன்று',            hi: 'आज' },
    { en: 'now',            ta: 'இப்போது',          hi: 'अभी' },
    { en: 'quickly',        ta: 'வேகமாக',           hi: 'तेज़ी से' },
    { en: 'slowly',         ta: 'மெதுவாக',          hi: 'धीरे' },
    { en: 'here',           ta: 'இங்கே',            hi: 'यहाँ' },
    { en: 'there',          ta: 'அங்கே',            hi: 'वहाँ' },
    { en: 'outside',        ta: 'வெளியே',           hi: 'बाहर' },
    { en: 'inside',         ta: 'உள்ளே',            hi: 'अंदर' },
    { en: 'again',          ta: 'மீண்டும்',         hi: 'फिर से' },
    { en: 'together',       ta: 'ஒன்றாக',           hi: 'साथ' },
    { en: 'alone',          ta: 'தனியாக',           hi: 'अकेले' },
    { en: 'early',          ta: 'சீக்கிரம்',        hi: 'जल्दी' },
    { en: 'late',           ta: 'தாமதமாக',          hi: 'देर से' },
    { en: 'happily',        ta: 'மகிழ்ச்சியாக',     hi: 'ख़ुशी से' },
    { en: 'carefully',      ta: 'கவனமாக',           hi: 'ध्यान से' },
    { en: 'in the morning', ta: 'காலையில்',         hi: 'सुबह' },
    { en: 'in the evening', ta: 'மாலையில்',         hi: 'शाम को' },
    { en: 'at night',       ta: 'இரவில்',           hi: 'रात को' },
    { en: 'at home',        ta: 'வீட்டில்',         hi: 'घर पर' },
    { en: 'at school',      ta: 'பள்ளியில்',        hi: 'स्कूल में' },
    { en: 'in the park',    ta: 'பூங்காவில்',       hi: 'पार्क में' },
    { en: 'on the road',    ta: 'சாலையில்',         hi: 'सड़क पर' },
    { en: 'loudly',         ta: 'சத்தமாக',          hi: 'ज़ोर से' },
    { en: 'quietly',        ta: 'அமைதியாக',         hi: 'चुपचाप' },
    { en: 'well',           ta: 'நன்றாக',           hi: 'अच्छी तरह' },
    { en: 'a little',       ta: 'கொஞ்சம்',          hi: 'थोड़ा' },
    { en: 'every morning',  ta: 'தினமும் காலையில்', hi: 'हर सुबह' },
    { en: 'after school',   ta: 'பள்ளி முடிந்ததும்', hi: 'स्कूल के बाद' },
    { en: 'with friends',   ta: 'நண்பர்களுடன்',     hi: 'दोस्तों के साथ' }
  ];

  var TENSES = [
    { id: 'present', en: 'Present', ta: 'நிகழ்காலம்', hi: 'वर्तमान काल' },
    { id: 'past',    en: 'Past',    ta: 'இறந்தகாலம்', hi: 'भूतकाल' },
    { id: 'future',  en: 'Future',  ta: 'எதிர்காலம்', hi: 'भविष्यत् काल' }
  ];

  var FORMS = [
    { id: 'statement', en: 'Statement', ta: 'கூற்று',   hi: 'कथन' },
    { id: 'negative',  en: 'Negative',  ta: 'எதிர்மறை', hi: 'निषेध' },
    { id: 'question',  en: 'Question',  ta: 'வினா',     hi: 'प्रश्न' }
  ];

  /* Which objects each verb may act on, worked out once. */
  var ALLOWED = {};
  VERBS.forEach(function (v, i) {
    if (!v.tr) { ALLOWED[i] = null; return; }
    ALLOWED[i] = OBJECTS.filter(function (o) {
      return v.takes.some(function (c) { return o.cat.indexOf(c) >= 0; });
    });
  });

  /* ------------------------------------------------------------- English */

  function english(verb, tense, subj, tail, form) {
    var f = TB.Conjugate.enForms(verb.en);
    var s = subj.en, rest = tail.en;

    if (form === 'statement') {
      var v = tense === 'past' ? f.past
            : tense === 'future' ? 'will ' + f.base
            : (subj.third ? f.third : f.base);
      return s + ' ' + v + ' ' + rest + '.';
    }
    if (form === 'negative') {
      var n = tense === 'past' ? 'did not ' + f.base
            : tense === 'future' ? 'will not ' + f.base
            : (subj.third ? 'does not ' : 'do not ') + f.base;
      return s + ' ' + n + ' ' + rest + '.';
    }
    /* a question moves the helper in front of the subject */
    var head = tense === 'past' ? 'Did' : tense === 'future' ? 'Will'
             : (subj.third ? 'Does' : 'Do');
    return head + ' ' + s.charAt(0).toLowerCase() + s.slice(1) + ' ' + f.base + ' ' + rest + '?';
  }

  /* --------------------------------------------------------------- Tamil */

  /* Tamil has one negative for present and past — the infinitive plus
     வில்லை — and a different one for the future, மாட்ட- with the person
     ending. A question simply adds ஆ to the last word. */
  function tamil(verb, tense, subj, tail, form) {
    var body = subj.ta + ' ' + tail.ta + ' ';
    if (form === 'negative') {
      if (tense === 'future') return body + verb.ta.inf + ' மாட்ட' + subj.taEnd + '.';
      return body + verb.ta.inf + 'வில்லை.';
    }
    var stem = tense === 'past' ? verb.ta.d : tense === 'future' ? verb.ta.f : verb.ta.p;
    var word = stem + subj.taEnd;
    if (form === 'question') return body + ask(word) + '?';
    return body + word + '.';
  }

  /* ஆ rides on the last consonant, so the pulli comes off first:
     சாப்பிடுகிறேன் -> சாப்பிடுகிறேனா */
  function ask(word) {
    return word.replace(/்$/, '') + 'ா';
  }

  /* --------------------------------------------------------------- Hindi */

  function hindiRow(verb, tense, subj, obj) {
    /* the ने rule: in the past a transitive verb follows the object */
    var gender = (tense === 'past' && verb.tr && obj) ? obj.g : subj.g;
    var table = TB.Conjugate.hindi(verb.hi, gender);
    var t = table.tenses.filter(function (x) { return x.id === tense; })[0] || table.tenses[0];
    var i = HI_ORDER.indexOf(subj.hiKey);
    return t.rows[i < 0 ? 0 : i];
  }

  function hindi(verb, tense, subj, tail, form, obj) {
    var row = hindiRow(verb, tense, subj, obj);
    /* the engine hands back a pronoun, which is right only when the subject
       is one; Ravi and the children need their own names, and their own ने */
    var erg = (tense === 'past' && verb.tr);
    var who = erg ? subj.hiErg : subj.hi;
    var body = who + ' ' + tail.hi + ' ';
    if (form === 'negative') return body + 'नहीं ' + row.form + '।';
    if (form === 'question') return 'क्या ' + body + row.form + '?';
    return body + row.form + '।';
  }

  /* ---------------------------------------------------------------- build */

  function build(si, vi, oi, ti, fi) {
    var subj = SUBJECTS[si % SUBJECTS.length];
    var verb = VERBS[vi % VERBS.length];
    var tense = TENSES[ti % TENSES.length].id;
    var form = FORMS[fi % FORMS.length].id;
    var pool = ALLOWED[vi % VERBS.length] || ADVERBS;
    var tail = pool[oi % pool.length];
    var obj = verb.tr ? tail : null;

    return {
      en: english(verb, tense, subj, tail, form),
      ta: tamil(verb, tense, subj, tail, form),
      hi: hindi(verb, tense, subj, tail, form, obj),
      tense: tense, form: form, verb: verb.en,
      transitive: !!verb.tr, subject: subj.label
    };
  }

  /* Every verb contributes as many sentences as it has objects (or adverbs)
     to work with, times the subjects, tenses and forms. */
  var BLOCKS = VERBS.map(function (v, i) {
    return (ALLOWED[i] ? ALLOWED[i].length : ADVERBS.length);
  });
  var PER_FRAME = BLOCKS.reduce(function (a, b) { return a + b; }, 0);
  var FRAMES = SUBJECTS.length * TENSES.length * FORMS.length;
  var TOTAL = PER_FRAME * FRAMES;

  /* A fixed order, so every sentence has an address and the same address
     always gives the same sentence. */
  function atIndex(n) {
    n = ((n % TOTAL) + TOTAL) % TOTAL;
    var frame = Math.floor(n / PER_FRAME);
    var rest = n % PER_FRAME;

    var si = frame % SUBJECTS.length;
    var ti = Math.floor(frame / SUBJECTS.length) % TENSES.length;
    var fi = Math.floor(frame / (SUBJECTS.length * TENSES.length)) % FORMS.length;

    for (var vi = 0; vi < VERBS.length; vi++) {
      if (rest < BLOCKS[vi]) return build(si, vi, rest, ti, fi);
      rest -= BLOCKS[vi];
    }
    return build(si, 0, 0, ti, fi);
  }

  return {
    SUBJECTS: SUBJECTS, VERBS: VERBS, OBJECTS: OBJECTS,
    ADVERBS: ADVERBS, TENSES: TENSES, FORMS: FORMS,
    allowedFor: function (vi) { return ALLOWED[vi]; },
    total: function () { return TOTAL; },
    build: build,
    atIndex: atIndex,
    random: function (n) {
      var out = [];
      for (var i = 0; i < (n || 1); i++) out.push(atIndex(Math.floor(Math.random() * TOTAL)));
      return out;
    },

    /* The three tenses of one verb, side by side, for every person — which
       is the chart a learner actually wants to see. */
    chart: function (en, formId) {
      var vi = -1;
      VERBS.forEach(function (v, i) { if (v.en === en) vi = i; });
      if (vi < 0) return null;
      var fi = 0;
      FORMS.forEach(function (f, i) { if (f.id === formId) fi = i; });
      var rows = SUBJECTS.map(function (s, si) {
        return {
          subject: s,
          present: build(si, vi, 0, 0, fi),
          past: build(si, vi, 0, 1, fi),
          future: build(si, vi, 0, 2, fi)
        };
      });
      return { verb: VERBS[vi], rows: rows };
    }
  };
})();
