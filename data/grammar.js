/* Tamil Bridge — English grammar, explained for a Tamil or Hindi speaker.

   Every rule is written three times, because the rule is the same in all
   three languages but the reader may only be comfortable in one of them.
   Each topic also carries the mistake an Indian speaker actually makes —
   not a generic error, but the one that comes from carrying Tamil or Hindi
   word order and tense habits into English.                                 */
window.TB = window.TB || {};

TB.GRAMMAR = [
  {
    id: 'noun', level: 1,
    title: { en: 'Nouns — naming words', ta: 'பெயர்ச்சொல்', hi: 'संज्ञा' },
    rule: {
      en: 'A noun names a person, a place, a thing or an idea. If you can put "the" in front of it, it is usually a noun.',
      ta: 'ஒரு நபர், இடம், பொருள் அல்லது கருத்தைக் குறிக்கும் சொல் பெயர்ச்சொல். அதன் முன் "the" வைக்க முடிந்தால், பொதுவாக அது பெயர்ச்சொல்.',
      hi: 'व्यक्ति, स्थान, वस्तु या विचार का नाम बताने वाला शब्द संज्ञा है। जिसके आगे "the" लगा सकें, वह प्रायः संज्ञा है।'
    },
    examples: [
      { en: 'My sister is a teacher.', ta: 'என் சகோதரி ஒரு ஆசிரியை.', hi: 'मेरी बहन शिक्षिका है।' },
      { en: 'Chennai is a big city.', ta: 'சென்னை ஒரு பெரிய நகரம்.', hi: 'चेन्नई एक बड़ा शहर है।' },
      { en: 'Honesty is important.', ta: 'நேர்மை முக்கியம்.', hi: 'ईमानदारी ज़रूरी है।' }
    ],
    mistake: {
      wrong: 'I have many work today.', right: 'I have a lot of work today.',
      why: {
        en: '"Work" cannot be counted in English, so it never takes "many" and never adds -s.',
        ta: 'ஆங்கிலத்தில் "work" எண்ண முடியாத சொல், எனவே "many" சேராது, -s உம் சேராது.',
        hi: 'अंग्रेज़ी में "work" गिना नहीं जाता, इसलिए उसके साथ "many" नहीं आता और -s भी नहीं लगता।'
      }
    }
  },
  {
    id: 'article', level: 1,
    title: { en: 'A, an, the', ta: 'A, an, the — சுட்டிடைச்சொல்', hi: 'A, an, the — उपपद' },
    rule: {
      en: 'Use "a" before a consonant sound and "an" before a vowel sound. Use "the" when both people already know which one you mean. Tamil and Hindi have no word for "a" or "the", which is why they are so easy to forget.',
      ta: 'மெய்யொலிக்கு முன் "a", உயிரொலிக்கு முன் "an". இருவருக்கும் எது என்று தெரிந்தால் "the". தமிழிலும் இந்தியிலும் இவற்றுக்கு சொல் இல்லை — அதனால்தான் மறந்துவிடுகிறோம்.',
      hi: 'व्यंजन ध्वनि से पहले "a", स्वर ध्वनि से पहले "an"। जब दोनों को पता हो कि कौन सा, तब "the"। हिंदी और तमिल में इनके लिए शब्द ही नहीं, इसलिए छूट जाते हैं।'
    },
    examples: [
      { en: 'I saw a dog. The dog was black.', ta: 'நான் ஒரு நாயைப் பார்த்தேன். அந்த நாய் கருப்பு.', hi: 'मैंने एक कुत्ता देखा। वह कुत्ता काला था।' },
      { en: 'She is an engineer.', ta: 'அவள் ஒரு பொறியாளர்.', hi: 'वह एक इंजीनियर है।' },
      { en: 'Open the door, please.', ta: 'தயவுசெய்து கதவைத் திறங்கள்.', hi: 'कृपया दरवाज़ा खोलिए।' }
    ],
    mistake: {
      wrong: 'He is engineer.', right: 'He is an engineer.',
      why: {
        en: 'A job word always needs a or an in English, even though Tamil and Hindi need nothing.',
        ta: 'தொழிலைக் குறிக்கும் சொல்லுக்கு ஆங்கிலத்தில் எப்போதும் a அல்லது an வேண்டும்.',
        hi: 'पेशे के शब्द के आगे अंग्रेज़ी में हमेशा a या an चाहिए।'
      }
    }
  },
  {
    id: 'pronoun', level: 1,
    title: { en: 'Pronouns — words that stand for a noun', ta: 'பிரதிப்பெயர்', hi: 'सर्वनाम' },
    rule: {
      en: 'I, you, he, she, it, we, they take the place of a noun so you do not repeat it. English has one "you" for one person and for many; Tamil and Hindi have two.',
      ta: 'I, you, he, she, it, we, they — பெயர்ச்சொல்லைத் திரும்பச் சொல்லாமல் இருக்க இவை வரும். ஆங்கிலத்தில் ஒருவருக்கும் பலருக்கும் ஒரே "you"; தமிழில் நீ / நீங்கள்.',
      hi: 'I, you, he, she, it, we, they संज्ञा की जगह आते हैं। अंग्रेज़ी में एक ही "you" है; हिंदी में तुम और आप दोनों।'
    },
    examples: [
      { en: 'Ravi is my friend. He lives in Madurai.', ta: 'ரவி என் நண்பன். அவன் மதுரையில் வசிக்கிறான்.', hi: 'रवि मेरा दोस्त है। वह मदुरै में रहता है।' },
      { en: 'Are you coming with us?', ta: 'நீங்கள் எங்களுடன் வருகிறீர்களா?', hi: 'क्या आप हमारे साथ आ रहे हैं?' }
    ],
    mistake: {
      wrong: 'Myself Kumar.', right: 'I am Kumar.',
      why: {
        en: '"Myself" is not a way to introduce yourself in English, though it is a common habit in India.',
        ta: '"Myself" என்று அறிமுகம் செய்வது ஆங்கிலத்தில் தவறு; "I am" என்று சொல்லுங்கள்.',
        hi: '"Myself" से परिचय देना अंग्रेज़ी में ग़लत है; "I am" कहिए।'
      }
    }
  },
  {
    id: 'verb', level: 1,
    title: { en: 'Verbs — doing words', ta: 'வினைச்சொல்', hi: 'क्रिया' },
    rule: {
      en: 'A verb says what happens. In English the verb comes after the subject: I eat rice. Tamil and Hindi put the verb last: நான் சாதம் சாப்பிடுகிறேன் / मैं चावल खाता हूँ.',
      ta: 'நடப்பதைச் சொல்வது வினைச்சொல். ஆங்கிலத்தில் எழுவாய்க்குப் பிறகு வினை வரும்: I eat rice. தமிழில் வினை கடைசியில்.',
      hi: 'क्रिया बताती है कि क्या हो रहा है। अंग्रेज़ी में क्रिया कर्ता के बाद आती है: I eat rice। हिंदी में क्रिया अंत में आती है।'
    },
    examples: [
      { en: 'I eat rice every day.', ta: 'நான் தினமும் சாதம் சாப்பிடுகிறேன்.', hi: 'मैं रोज़ चावल खाता हूँ।' },
      { en: 'She writes letters.', ta: 'அவள் கடிதங்கள் எழுதுகிறாள்.', hi: 'वह पत्र लिखती है।' }
    ],
    mistake: {
      wrong: 'I rice eat.', right: 'I eat rice.',
      why: {
        en: 'English word order is subject, verb, object. Putting the verb last is Tamil and Hindi order.',
        ta: 'ஆங்கில வரிசை: எழுவாய், வினை, செயப்படுபொருள். வினையை கடைசியில் வைப்பது தமிழ் வரிசை.',
        hi: 'अंग्रेज़ी क्रम है कर्ता, क्रिया, कर्म। क्रिया को अंत में रखना हिंदी का क्रम है।'
      }
    }
  },
  {
    id: 'agreement', level: 2,
    title: { en: 'He eats, they eat — subject and verb must agree', ta: 'எழுவாய் – வினை ஒப்புமை', hi: 'कर्ता और क्रिया का मेल' },
    rule: {
      en: 'With he, she, it or one person, add -s to the verb in the present: he eats. With I, you, we, they, add nothing: they eat.',
      ta: 'he, she, it அல்லது ஒருவர் என்றால் நிகழ்காலத்தில் வினைக்கு -s சேர்க்கவும்: he eats. I, you, we, they என்றால் சேர்க்க வேண்டாம்.',
      hi: 'he, she, it या एक व्यक्ति हो तो वर्तमान में क्रिया के साथ -s लगता है: he eats। I, you, we, they के साथ नहीं।'
    },
    examples: [
      { en: 'He goes to school. They go to school.', ta: 'அவன் பள்ளிக்குச் செல்கிறான். அவர்கள் பள்ளிக்குச் செல்கிறார்கள்.', hi: 'वह स्कूल जाता है। वे स्कूल जाते हैं।' },
      { en: 'My mother cooks food.', ta: 'என் அம்மா சமைக்கிறாள்.', hi: 'मेरी माँ खाना बनाती है।' }
    ],
    mistake: {
      wrong: 'He go to school.', right: 'He goes to school.',
      why: {
        en: 'This is the single commonest English mistake in India. He, she and it always take -s in the present.',
        ta: 'இந்தியாவில் மிகவும் பொதுவான தவறு இதுதான். he, she, it எப்போதும் -s எடுக்கும்.',
        hi: 'भारत में यह सबसे आम ग़लती है। he, she, it हमेशा -s लेते हैं।'
      }
    }
  },
  {
    id: 'tense', level: 2,
    title: { en: 'The three times: past, present, future', ta: 'முக்காலம்', hi: 'तीनों काल' },
    rule: {
      en: 'Past for what already happened, present for now or for habits, future for what has not happened yet. English marks the time on the verb, as Tamil and Hindi do.',
      ta: 'நடந்தது இறந்தகாலம், இப்போது நடப்பது நிகழ்காலம், நடக்கப்போவது எதிர்காலம். வினையிலேயே காலம் காட்டப்படும்.',
      hi: 'जो हो चुका वह भूतकाल, जो अभी हो रहा है वह वर्तमान, जो होगा वह भविष्यत्। काल क्रिया पर दिखता है।'
    },
    examples: [
      { en: 'I went to Delhi last year.', ta: 'நான் போன வருடம் டெல்லி சென்றேன்.', hi: 'मैं पिछले साल दिल्ली गया।' },
      { en: 'I go to school every day.', ta: 'நான் தினமும் பள்ளிக்குச் செல்கிறேன்.', hi: 'मैं रोज़ स्कूल जाता हूँ।' },
      { en: 'I will go tomorrow.', ta: 'நான் நாளை செல்வேன்.', hi: 'मैं कल जाऊँगा।' }
    ],
    mistake: {
      wrong: 'Yesterday I go to market.', right: 'Yesterday I went to the market.',
      why: {
        en: 'A past time word needs a past verb. "Yesterday" and "go" cannot sit together.',
        ta: 'இறந்தகால சொல் வந்தால் வினையும் இறந்தகாலம் ஆக வேண்டும்.',
        hi: 'भूतकाल का शब्द हो तो क्रिया भी भूतकाल की चाहिए।'
      }
    }
  },
  {
    id: 'continuous', level: 2,
    title: { en: 'Happening right now — am, is, are + -ing', ta: 'நிகழ்நிலை', hi: 'चल रहा काम' },
    rule: {
      en: 'For something happening at this moment, use am/is/are with the verb + -ing. Do not use it for things that are always true.',
      ta: 'இப்போது நடப்பதற்கு am/is/are + வினை + -ing. எப்போதும் உண்மையானவற்றுக்கு இதைப் பயன்படுத்தக்கூடாது.',
      hi: 'अभी हो रहे काम के लिए am/is/are + क्रिया + -ing। हमेशा सच रहने वाली बातों के लिए नहीं।'
    },
    examples: [
      { en: 'She is reading a book.', ta: 'அவள் புத்தகம் படித்துக்கொண்டிருக்கிறாள்.', hi: 'वह किताब पढ़ रही है।' },
      { en: 'They are playing outside.', ta: 'அவர்கள் வெளியே விளையாடுகிறார்கள்.', hi: 'वे बाहर खेल रहे हैं।' }
    ],
    mistake: {
      wrong: 'I am knowing the answer.', right: 'I know the answer.',
      why: {
        en: 'Know, like, want, understand and believe are not used with -ing, however natural it feels.',
        ta: 'know, like, want, understand, believe ஆகியவற்றுடன் -ing சேர்க்கக்கூடாது.',
        hi: 'know, like, want, understand, believe के साथ -ing नहीं लगता।'
      }
    }
  },
  {
    id: 'question', level: 2,
    title: { en: 'Asking questions', ta: 'கேள்வி கேட்பது', hi: 'सवाल पूछना' },
    rule: {
      en: 'Put do, does or did in front for a yes/no question: Do you like tea? For other questions, start with what, where, when, why, who or how.',
      ta: 'ஆம்/இல்லை கேள்விக்கு முன்னால் do, does, did வைக்கவும். மற்ற கேள்விகளுக்கு what, where, when, why, who, how என்று தொடங்கவும்.',
      hi: 'हाँ/ना वाले सवाल में आगे do, does, did लगाइए। बाकी सवाल what, where, when, why, who, how से शुरू कीजिए।'
    },
    examples: [
      { en: 'Do you like tea?', ta: 'உங்களுக்கு தேநீர் பிடிக்குமா?', hi: 'क्या आपको चाय पसंद है?' },
      { en: 'Where do you live?', ta: 'நீங்கள் எங்கே வசிக்கிறீர்கள்?', hi: 'आप कहाँ रहते हैं?' },
      { en: 'What is your name?', ta: 'உங்கள் பெயர் என்ன?', hi: 'आपका नाम क्या है?' }
    ],
    mistake: {
      wrong: 'What you are doing?', right: 'What are you doing?',
      why: {
        en: 'In a question the helping verb comes before the person: are you, not you are.',
        ta: 'கேள்வியில் துணைவினை நபருக்கு முன் வரும்: are you, "you are" அல்ல.',
        hi: 'सवाल में सहायक क्रिया पहले आती है: are you, "you are" नहीं।'
      }
    }
  },
  {
    id: 'preposition', level: 2,
    title: { en: 'In, on, at — small words that fix place and time', ta: 'இடம்–கால இடைச்சொற்கள்', hi: 'in, on, at — स्थान और समय' },
    rule: {
      en: 'at for a point (at 5 o\'clock, at the door), on for a surface or a day (on the table, on Monday), in for something enclosed or a long period (in the box, in June).',
      ta: 'ஒரு புள்ளிக்கு at, மேற்பரப்பு அல்லது நாளுக்கு on, உள்ளே அல்லது நீண்ட காலத்துக்கு in.',
      hi: 'बिंदु के लिए at, सतह या दिन के लिए on, अंदर या लंबी अवधि के लिए in।'
    },
    examples: [
      { en: 'The book is on the table.', ta: 'புத்தகம் மேசையின் மேல் உள்ளது.', hi: 'किताब मेज़ पर है।' },
      { en: 'We meet at 5 o\'clock.', ta: 'நாம் ஐந்து மணிக்கு சந்திப்போம்.', hi: 'हम पाँच बजे मिलते हैं।' },
      { en: 'My birthday is in June.', ta: 'என் பிறந்தநாள் ஜூன் மாதத்தில்.', hi: 'मेरा जन्मदिन जून में है।' }
    ],
    mistake: {
      wrong: 'I will come in Monday.', right: 'I will come on Monday.',
      why: {
        en: 'Days always take on. Months and years take in.',
        ta: 'நாட்களுக்கு எப்போதும் on. மாதம், வருடத்துக்கு in.',
        hi: 'दिनों के साथ हमेशा on। महीने और साल के साथ in।'
      }
    }
  },
  {
    id: 'adjective', level: 2,
    title: { en: 'Adjectives — describing words', ta: 'பெயரடை', hi: 'विशेषण' },
    rule: {
      en: 'An adjective describes a noun and comes before it in English: a red ball. Adjectives never take -s, however many things there are.',
      ta: 'பெயரடை பெயர்ச்சொல்லை விவரிக்கும், ஆங்கிலத்தில் அதற்கு முன் வரும்: a red ball. எத்தனை பொருள்கள் இருந்தாலும் பெயரடைக்கு -s சேராது.',
      hi: 'विशेषण संज्ञा की विशेषता बताता है और अंग्रेज़ी में उससे पहले आता है: a red ball। कितनी भी चीज़ें हों, विशेषण में -s नहीं लगता।'
    },
    examples: [
      { en: 'She has a red bag.', ta: 'அவளிடம் சிவப்பு பை உள்ளது.', hi: 'उसके पास लाल बैग है।' },
      { en: 'These are beautiful flowers.', ta: 'இவை அழகான பூக்கள்.', hi: 'ये सुंदर फूल हैं।' }
    ],
    mistake: {
      wrong: 'They are beautifuls flowers.', right: 'They are beautiful flowers.',
      why: {
        en: 'Only the noun becomes plural. The adjective never changes.',
        ta: 'பெயர்ச்சொல் மட்டுமே பன்மை ஆகும். பெயரடை மாறாது.',
        hi: 'सिर्फ़ संज्ञा बहुवचन होती है। विशेषण नहीं बदलता।'
      }
    }
  },
  {
    id: 'comparison', level: 3,
    title: { en: 'Big, bigger, biggest', ta: 'ஒப்புமை நிலைகள்', hi: 'तुलना की तीन अवस्थाएँ' },
    rule: {
      en: 'Short words add -er and -est: tall, taller, tallest. Longer words use more and most: beautiful, more beautiful, most beautiful. Never both.',
      ta: 'சிறு சொற்களுக்கு -er, -est. நீண்ட சொற்களுக்கு more, most. இரண்டையும் ஒன்றாகப் பயன்படுத்தக்கூடாது.',
      hi: 'छोटे शब्दों में -er, -est लगता है। लंबे शब्दों में more, most। दोनों एक साथ कभी नहीं।'
    },
    examples: [
      { en: 'He is taller than me.', ta: 'அவன் என்னை விட உயரமானவன்.', hi: 'वह मुझसे लंबा है।' },
      { en: 'This is the most beautiful place.', ta: 'இதுவே மிக அழகான இடம்.', hi: 'यह सबसे सुंदर जगह है।' }
    ],
    mistake: {
      wrong: 'He is more taller than me.', right: 'He is taller than me.',
      why: {
        en: 'Once you have added -er you have already compared. Adding "more" compares twice.',
        ta: '-er சேர்த்தபின் ஒப்பீடு முடிந்துவிட்டது. "more" சேர்ப்பது இரண்டு முறை ஒப்பிடுவது.',
        hi: '-er लगाने के बाद तुलना हो चुकी। "more" जोड़ना दोबारा तुलना है।'
      }
    }
  },
  {
    id: 'modal', level: 3,
    title: { en: 'Can, could, should, must, will, would', ta: 'துணைவினைகள்', hi: 'सहायक क्रियाएँ' },
    rule: {
      en: 'These say how likely, how allowed or how necessary something is. The verb after them never changes: I can go, she can go, they can go.',
      ta: 'இவை சாத்தியம், அனுமதி, அவசியத்தைக் காட்டும். இவற்றுக்குப் பின் வரும் வினை மாறாது.',
      hi: 'ये संभावना, अनुमति या ज़रूरत बताते हैं। इनके बाद क्रिया कभी नहीं बदलती।'
    },
    examples: [
      { en: 'Can you help me?', ta: 'நீங்கள் எனக்கு உதவ முடியுமா?', hi: 'क्या आप मेरी मदद कर सकते हैं?' },
      { en: 'You should rest.', ta: 'நீங்கள் ஓய்வெடுக்க வேண்டும்.', hi: 'आपको आराम करना चाहिए।' },
      { en: 'I must finish this today.', ta: 'நான் இதை இன்றே முடிக்க வேண்டும்.', hi: 'मुझे यह आज ही पूरा करना है।' }
    ],
    mistake: {
      wrong: 'She can goes home.', right: 'She can go home.',
      why: {
        en: 'After can, could, should, must or will, the verb stays plain — no -s, no -ed.',
        ta: 'can, could, should, must, will பின் வினை அப்படியே இருக்கும் — -s, -ed சேராது.',
        hi: 'can, could, should, must, will के बाद क्रिया सादी रहती है।'
      }
    }
  },
  {
    id: 'passive', level: 3,
    title: { en: 'Active and passive', ta: 'செய்வினை – செயப்பாட்டுவினை', hi: 'कर्तृवाच्य और कर्मवाच्य' },
    rule: {
      en: 'Active says who does it: The boy broke the window. Passive says what happened to the thing: The window was broken. Use passive when the doer does not matter.',
      ta: 'யார் செய்தார் என்பது செய்வினை. பொருளுக்கு என்ன ஆனது என்பது செயப்பாட்டுவினை. செய்பவர் முக்கியமில்லாதபோது செயப்பாட்டுவினை.',
      hi: 'कौन करता है — कर्तृवाच्य। वस्तु के साथ क्या हुआ — कर्मवाच्य। करने वाला महत्वपूर्ण न हो तब कर्मवाच्य।'
    },
    examples: [
      { en: 'The letter was posted yesterday.', ta: 'கடிதம் நேற்று அனுப்பப்பட்டது.', hi: 'चिट्ठी कल भेजी गई।' },
      { en: 'Rice is grown in Tamil Nadu.', ta: 'தமிழ்நாட்டில் நெல் விளைவிக்கப்படுகிறது.', hi: 'तमिलनाडु में चावल उगाया जाता है।' }
    ],
    mistake: {
      wrong: 'The work is do by me.', right: 'The work is done by me.',
      why: {
        en: 'The passive needs the third form of the verb: done, written, eaten — not the plain form.',
        ta: 'செயப்பாட்டுவினைக்கு வினையின் மூன்றாம் வடிவம் வேண்டும்: done, written, eaten.',
        hi: 'कर्मवाच्य में क्रिया का तीसरा रूप चाहिए: done, written, eaten।'
      }
    }
  },
  {
    id: 'reported', level: 3,
    title: { en: 'Telling someone what was said', ta: 'மறைமுகக் கூற்று', hi: 'अप्रत्यक्ष कथन' },
    rule: {
      en: 'When you report what someone said, move the tense one step back: "I am tired" becomes He said he was tired.',
      ta: 'ஒருவர் சொன்னதைச் சொல்லும்போது காலம் ஒரு படி பின்னோக்கிச் செல்லும்.',
      hi: 'किसी की कही बात बताते समय काल एक क़दम पीछे चला जाता है।'
    },
    examples: [
      { en: 'She said she was coming.', ta: 'அவள் வருவதாகச் சொன்னாள்.', hi: 'उसने कहा कि वह आ रही है।' },
      { en: 'He asked where I lived.', ta: 'நான் எங்கே வசிக்கிறேன் என்று அவன் கேட்டான்.', hi: 'उसने पूछा कि मैं कहाँ रहता हूँ।' }
    ],
    mistake: {
      wrong: 'He asked me where do you live.', right: 'He asked me where I lived.',
      why: {
        en: 'A reported question is no longer a question, so it takes normal word order and no question mark.',
        ta: 'மறைமுகக் கேள்வி கேள்வி அல்ல, எனவே சாதாரண சொல் வரிசை; கேள்விக்குறியும் இல்லை.',
        hi: 'अप्रत्यक्ष सवाल सवाल नहीं रहता, इसलिए सामान्य क्रम और प्रश्नचिह्न नहीं।'
      }
    }
  },
  {
    id: 'plural', level: 1,
    title: { en: 'One and many', ta: 'ஒருமை – பன்மை', hi: 'एकवचन और बहुवचन' },
    rule: {
      en: 'Most words add -s. Words ending in s, x, ch, sh add -es. A consonant + y becomes -ies. Some change completely: child → children, man → men.',
      ta: 'பெரும்பாலானவற்றுக்கு -s. s, x, ch, sh முடிவுக்கு -es. மெய் + y என்றால் -ies. சில முற்றிலும் மாறும்.',
      hi: 'ज़्यादातर में -s। s, x, ch, sh पर -es। व्यंजन + y हो तो -ies। कुछ पूरी तरह बदलते हैं।'
    },
    examples: [
      { en: 'one book, two books', ta: 'ஒரு புத்தகம், இரண்டு புத்தகங்கள்', hi: 'एक किताब, दो किताबें' },
      { en: 'one box, two boxes', ta: 'ஒரு பெட்டி, இரண்டு பெட்டிகள்', hi: 'एक डिब्बा, दो डिब्बे' },
      { en: 'one child, two children', ta: 'ஒரு குழந்தை, இரண்டு குழந்தைகள்', hi: 'एक बच्चा, दो बच्चे' }
    ],
    mistake: {
      wrong: 'I have two childrens.', right: 'I have two children.',
      why: {
        en: '"Children" is already plural. Adding -s makes it plural twice.',
        ta: '"Children" ஏற்கனவே பன்மை. -s சேர்ப்பது இரண்டு முறை பன்மை ஆக்குவது.',
        hi: '"Children" पहले से बहुवचन है। -s जोड़ना दोबारा बहुवचन बनाना है।'
      }
    }
  },
  {
    id: 'punctuation', level: 1,
    title: { en: 'Full stops, capitals and commas', ta: 'நிறுத்தற்குறிகள்', hi: 'विराम चिह्न' },
    rule: {
      en: 'Every sentence starts with a capital letter and ends with . ? or !. Names of people, places, months and languages always take a capital. A comma is a small pause.',
      ta: 'ஒவ்வொரு வாக்கியமும் பெரிய எழுத்தில் தொடங்கி . ? ! இல் முடியும். பெயர், இடம், மாதம், மொழி — பெரிய எழுத்து.',
      hi: 'हर वाक्य बड़े अक्षर से शुरू होकर . ? ! पर ख़त्म होता है। नाम, जगह, महीने और भाषाओं में बड़ा अक्षर।'
    },
    examples: [
      { en: 'My name is Kumar. I live in Chennai.', ta: 'என் பெயர் குமார். நான் சென்னையில் வசிக்கிறேன்.', hi: 'मेरा नाम कुमार है। मैं चेन्नई में रहता हूँ।' },
      { en: 'Do you speak Tamil, Hindi or English?', ta: 'நீங்கள் தமிழ், இந்தி அல்லது ஆங்கிலம் பேசுவீர்களா?', hi: 'क्या आप तमिल, हिंदी या अंग्रेज़ी बोलते हैं?' }
    ],
    mistake: {
      wrong: 'my name is kumar i live in chennai', right: 'My name is Kumar. I live in Chennai.',
      why: {
        en: 'Without capitals and full stops the reader cannot tell where one thought ends.',
        ta: 'பெரிய எழுத்தும் முற்றுப்புள்ளியும் இல்லாவிட்டால் ஒரு கருத்து எங்கே முடிகிறது என்று தெரியாது.',
        hi: 'बड़े अक्षर और पूर्ण विराम बिना पता ही नहीं चलता कि बात कहाँ ख़त्म हुई।'
      }
    }
  }
];
