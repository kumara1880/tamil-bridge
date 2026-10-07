/* Tamil Bridge — the conversation tutor's engine.

   Two ways to practise speaking:

     Conversations — real situations, beginner to native. The partner says a
       line in a native voice; the learner answers aloud; what they said is
       heard, scored word by word, and explained in Tamil.

     Free talk — say anything. Say it in Tamil and you are taught how to say
       it in English and Hindi, then asked to say it yourself. Say it in
       English or Hindi and it is checked, corrected, explained, and the
       tutor answers with a question so the conversation keeps going.

   What this is not: a language model. Everything here runs in the browser,
   free, with no account and no key, which is the promise this site keeps.
   The tutor understands a learner through the scenarios, the dictionary,
   the grammar checker and a bank of topics — not by generating new
   sentences. That is said plainly in the view, too.                       */
window.TB = window.TB || {};

TB.Converse = (function () {

  /* ------------------------------------------------------ the curriculum */

  function all() {
    var list = [];
    (TB.SPOKEN || []).forEach(function (d) {
      list.push({ id: 'sp-' + d.id, level: d.level || 1, title: d.title, lines: d.lines, source: 'spoken' });
    });
    (TB.TALK || []).forEach(function (d) {
      list.push({ id: d.id, level: d.level, title: d.title, lines: d.lines, source: 'talk' });
    });
    return list;
  }

  function byLevel(n) {
    return all().filter(function (d) { return d.level === n; });
  }

  function find(id) {
    var a = all();
    for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }

  /* Every way a learner's line may be said and still be right. */
  function accepted(line, lang) {
    var out = [];
    if (line && line[lang]) out.push(line[lang]);
    if (line && line.alt && line.alt[lang]) out = out.concat(line.alt[lang]);
    return out;
  }

  /* Score what was heard against the best of the accepted answers. */
  function judge(line, lang, heard) {
    var best = null;
    accepted(line, lang).forEach(function (target) {
      var s = TB.Speech.score(target, heard);
      if (!best || s.score > best.score) { best = s; best.target = target; }
    });
    if (!best) best = { score: 0, heard: heard.text || '', perWord: [], target: '' };
    best.pass = best.score >= PASS;
    return best;
  }
  var PASS = 70;

  /* Feedback in Tamil, with the English underneath, because the learner is
     being taught in Tamil and should never have to decode the teacher. */
  function feedback(score) {
    if (score >= 90) return { ta: 'அருமை! மிகச் சரியாகச் சொன்னீர்கள்.', en: 'Excellent — that was spot on.', tone: 'great' };
    if (score >= 75) return { ta: 'நன்று! மிக அருகில் வந்துவிட்டீர்கள்.', en: 'Good — very close.', tone: 'good' };
    if (score >= 50) return { ta: 'பரவாயில்லை. சிவப்பில் உள்ள சொற்களை மெதுவாகச் சொல்லுங்கள்.', en: 'Not bad. Say the words in red more slowly.', tone: 'ok' };
    return { ta: 'மீண்டும் முயலுங்கள். முதலில் கேட்டுவிட்டுப் பிறகு அதுபோலச் சொல்லுங்கள்.', en: 'Try again. Listen first, then copy it.', tone: 'retry' };
  }

  /* ----------------------------------------- "any situation you want" */

  /* Words people use when they ask for a situation, mapped to the
     conversations that cover it. Matching is by these and by the words of
     the titles themselves, in all three languages. */
  var SCENE_WORDS = {
    'sp-meet': 'hello hi meet meeting introduce introduction name greet greeting வணக்கம் சந்திப்பு அறிமுகம் नमस्ते मिलना परिचय',
    'sp-about': 'myself about me family job from where live சொந்த குடும்பம் என்னைப் अपने बारे परिवार',
    'sp-shop': 'shop shopping buy price vegetable market grocery கடை வாங்க விலை காய்கறி சந்தை दुकान ख़रीद दाम सब्ज़ी बाज़ार',
    'sp-bus': 'bus travel ticket conductor stop பேருந்து பஸ் பயணம் बस यात्रा',
    'sp-directions': 'way direction road address lost find where வழி முகவரி எங்கே रास्ता पता कहाँ',
    'sp-doctor': 'doctor hospital sick ill fever medicine clinic health மருத்துவர் டாக்டர் மருந்து காய்ச்சல் डॉक्टर अस्पताल बीमार दवा',
    'symptoms': 'symptom pain cough throat fever doctor வலி இருமல் தொண்டை दर्द खाँसी बुखार',
    'sp-phone': 'phone call ring mobile தொலைபேசி அழைப்பு फ़ोन कॉल',
    'sp-school': 'school teacher class student exam பள்ளி ஆசிரியர் படிப்பு स्कूल अध्यापक पढ़ाई',
    'sp-restaurant': 'restaurant food eat order menu hotel dinner lunch உணவகம் சாப்பாடு உணவு ரெஸ்டாரன்ட் खाना रेस्टोरेंट',
    'sp-bank': 'bank money account deposit withdraw atm வங்கி பணம் கணக்கு बैंक पैसा खाता',
    'sp-work': 'work office job colleague boss வேலை அலுவலகம் काम दफ़्तर नौकरी',
    'sp-invite': 'invite invitation party function wedding அழைப்பு விழா திருமணம் न्योता पार्टी शादी',
    'sp-sorry': 'sorry apologise apology mistake மன்னிப்பு தவறு माफ़ी ग़लती',
    'sp-help': 'help please favour உதவி मदद',
    'sp-weather': 'weather rain hot cold sun climate வானிலை மழை வெயில் மौसम बारिश गर्मी',
    'sp-shopping-clothes': 'clothes dress shirt saree size trial ஆடை உடை சேலை சட்டை कपड़े साड़ी कमीज़',
    'sp-neighbour': 'neighbour neighbor next door அண்டை பக்கத்து वீட்டு पड़ोसी',
    'sp-emergency': 'emergency accident police fire ambulance urgent help அவசரம் விபத்து காவல் आपातकाल दुर्घटना पुलिस',
    'sp-goodbye': 'bye goodbye leave see you போய் விடை विदा अलविदा',
    'train': 'train railway ticket booking station berth ரயில் ரயில்வே டிக்கெட் ट्रेन रेल टिकट स्टेशन',
    'hotel': 'hotel room stay check in booking lodge விடுதி அறை தங்க होटल कमरा',
    'plans': 'plan weekend movie friend outing evening திட்டம் படம் நண்பர் प्लान फ़िल्म दोस्त',
    'wrong-order': 'delivery order wrong complaint swiggy zomato food online டெலிவரி ஆர்டர் புகார் डिलीवरी ऑर्डर शिकायत',
    'interview': 'interview job hr resume career நேர்காணல் வேலை இன்டர்வியூ इंटरव्यू नौकरी',
    'renting': 'rent house flat room owner landlord tenant வாடகை வீடு किराया मकान फ़्लैट',
    'opinion': 'opinion film movie review cinema கருத்து படம் சினிமா राय फ़िल्म',
    'meeting': 'meeting disagree office team manager project கூட்டம் மறுப்பு மீட்டிங் मीटिंग असहमत',
    'refund': 'refund return complaint customer care replacement product பணம் திருப்பி புகார் रिफ़ंड वापसी शिकायत',
    'salary': 'salary negotiate pay offer hike raise சம்பளம் ஊதியம் वेतन तनख़्वाह सैलरी',
    'presentation': 'presentation question answer slides pitch விளக்கம் கேள்வி प्रस्तुति प्रेज़ेंटेशन सवाल',
    'debate': 'debate argue discussion children phone மொபைல் விவாதம் बहस चर्चा',
    'news': 'news rain flood government current affairs செய்தி வெள்ளம் அரசு ख़बर समाचार बाढ़',
    'smalltalk': 'small talk catch up friend chat casual native இயல்பான அரட்டை गपशप बातचीत',
    'decline': 'decline refuse invitation politely say no மறு அழைப்பு மறுப்பு मना इनकार',
    'banter': 'joke tease fun humour banter கிண்டல் நகைச்சுவை मज़ाक',
    'condolence': 'condolence death sad sorry loss funeral இரங்கல் மரணம் துக்கம் शोक संवेदना मृत्यु'
  };

  function tokens(s) {
    return String(s || '').toLowerCase()
      .replace(/[.,!?;:'"()‘’“”।॥-]/g, ' ')
      .split(/\s+/).filter(function (w) { return w.length > 1; });
  }

  /* The conversations closest to whatever situation was asked for, best
     first. Each has a score, so a caller can tell a real match from none. */
  function match(text, limit) {
    var want = tokens(text);
    if (!want.length) return [];
    var scored = all().map(function (d) {
      var hay = tokens([d.title.en, d.title.ta, d.title.hi, SCENE_WORDS[d.id] || ''].join(' '));
      var score = 0;
      want.forEach(function (w) {
        hay.forEach(function (h) {
          if (h === w) score += 3;
          else if (w.length > 3 && (h.indexOf(w) === 0 || w.indexOf(h) === 0)) score += 1;
        });
      });
      return { d: d, score: score };
    }).filter(function (x) { return x.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score || a.d.level - b.d.level; });
    return scored.slice(0, limit || 5);
  }

  /* --------------------------------------------------------- free talk */

  function scriptOf(text) {
    var t = String(text || '');
    var ta = (t.match(/[஀-௿]/g) || []).length;
    var hi = (t.match(/[ऀ-ॿ]/g) || []).length;
    var en = (t.match(/[A-Za-z]/g) || []).length;
    if (ta >= hi && ta >= en && ta > 0) return 'ta';
    if (hi >= en && hi > 0) return 'hi';
    return en > 0 ? 'en' : '';
  }

  /* Something to say back, so a sentence is answered rather than graded and
     dropped. Chosen by what the learner talked about. */
  var TOPICS = [
    { k: 'food eat ate lunch dinner breakfast rice biryani dosa idli hungry cook சாப்பா உணவு சாதம் खाना भूख चावल',
      q: [{ en: 'What is your favourite dish?', hi: 'आपका सबसे पसंदीदा खाना क्या है?', ta: 'உங்களுக்கு மிகவும் பிடித்த உணவு எது?' },
          { en: 'Do you like cooking at home?', hi: 'क्या आपको घर पर खाना बनाना पसंद है?', ta: 'வீட்டில் சமைக்க உங்களுக்குப் பிடிக்குமா?' }] },
    { k: 'family mother father mom dad brother sister wife husband son daughter child children அம்மா அப்பா குடும்ப அண்ணன் தங்கை परिवार माँ पिता भाई बहन',
      q: [{ en: 'How many people are there in your family?', hi: 'आपके परिवार में कितने लोग हैं?', ta: 'உங்கள் குடும்பத்தில் எத்தனை பேர் இருக்கிறார்கள்?' },
          { en: 'What do you enjoy doing together as a family?', hi: 'परिवार के साथ आपको क्या करना अच्छा लगता है?', ta: 'குடும்பமாகச் சேர்ந்து என்ன செய்ய உங்களுக்குப் பிடிக்கும்?' }] },
    { k: 'work job office company boss colleague engineer teacher business வேலை அலுவலக काम नौकरी दफ़्तर',
      q: [{ en: 'What do you enjoy most about your work?', hi: 'आपको अपने काम में सबसे अच्छा क्या लगता है?', ta: 'உங்கள் வேலையில் உங்களுக்கு மிகவும் பிடித்தது எது?' },
          { en: 'How do you usually get to work?', hi: 'आप आमतौर पर काम पर कैसे जाते हैं?', ta: 'நீங்கள் வழக்கமாக வேலைக்கு எப்படிச் செல்வீர்கள்?' }] },
    { k: 'study school college exam student learn class course படிப்பு பள்ளி கல்லூரி தேர்வு पढ़ाई स्कूल कॉलेज परीक्षा',
      q: [{ en: 'What is your favourite subject?', hi: 'आपका पसंदीदा विषय कौन सा है?', ta: 'உங்களுக்குப் பிடித்த பாடம் எது?' },
          { en: 'Why are you learning this language?', hi: 'आप यह भाषा क्यों सीख रहे हैं?', ta: 'இந்த மொழியை ஏன் கற்றுக்கொள்கிறீர்கள்?' }] },
    { k: 'travel trip holiday vacation visit place city village beach temple பயண சுற்றுலா ஊர் கோயில் यात्रा घूमना छुट्टी शहर मंदिर',
      q: [{ en: 'Where would you like to travel next?', hi: 'आप अगली बार कहाँ घूमने जाना चाहेंगे?', ta: 'அடுத்து எங்கே பயணம் செய்ய விரும்புகிறீர்கள்?' },
          { en: 'What is the most beautiful place you have visited?', hi: 'आपने अब तक सबसे सुंदर कौन सी जगह देखी है?', ta: 'நீங்கள் பார்த்ததிலேயே மிக அழகான இடம் எது?' }] },
    { k: 'movie film song music cinema actor watch listen படம் பாடல் இசை சினிமா फ़िल्म गाना संगीत',
      q: [{ en: 'What kind of films do you like?', hi: 'आपको किस तरह की फ़िल्में पसंद हैं?', ta: 'உங்களுக்கு எந்த வகைப் படங்கள் பிடிக்கும்?' },
          { en: 'Who is your favourite singer?', hi: 'आपका पसंदीदा गायक कौन है?', ta: 'உங்களுக்குப் பிடித்த பாடகர் யார்?' }] },
    { k: 'sport cricket football play game exercise gym walk run yoga விளையாட்டு கிரிக்கெட் உடற்பயிற்சி खेल क्रिकेट व्यायाम',
      q: [{ en: 'Which sport do you like to watch or play?', hi: 'आपको कौन सा खेल देखना या खेलना पसंद है?', ta: 'எந்த விளையாட்டைப் பார்க்க அல்லது விளையாட உங்களுக்குப் பிடிக்கும்?' },
          { en: 'How do you stay healthy?', hi: 'आप स्वस्थ कैसे रहते हैं?', ta: 'நீங்கள் எப்படி ஆரோக்கியமாக இருக்கிறீர்கள்?' }] },
    { k: 'weather rain hot cold sunny summer winter monsoon மழை வெயில் குளிர் வானிலை बारिश गर्मी सर्दी मौसम',
      q: [{ en: 'Which season do you like best, and why?', hi: 'आपको कौन सा मौसम सबसे अच्छा लगता है, और क्यों?', ta: 'உங்களுக்கு எந்தப் பருவம் மிகவும் பிடிக்கும், ஏன்?' }] },
    { k: 'friend friends weekend party fun free time hobby நண்பர் நண்பன் விடுமுறை பொழுதுபோக்கு दोस्त छुट्टी शौक',
      q: [{ en: 'What do you like to do in your free time?', hi: 'खाली समय में आपको क्या करना अच्छा लगता है?', ta: 'ஓய்வு நேரத்தில் என்ன செய்ய உங்களுக்குப் பிடிக்கும்?' },
          { en: 'What did you do last weekend?', hi: 'पिछले वीकेंड आपने क्या किया?', ta: 'கடந்த வார இறுதியில் என்ன செய்தீர்கள்?' }] },
    { k: 'home house city live town room flat வீடு ஊர் நகரம் வசி घर शहर रहना',
      q: [{ en: 'What do you like about the place where you live?', hi: 'आप जहाँ रहते हैं, वहाँ आपको क्या अच्छा लगता है?', ta: 'நீங்கள் வசிக்கும் இடத்தில் உங்களுக்கு என்ன பிடிக்கும்?' }] },
    { k: 'health sick fever doctor tired sleep headache உடம்பு காய்ச்சல் தூக்கம் சோர்வு तबीयत बुखार नींद थका',
      q: [{ en: 'I hope you feel better soon. Have you seen a doctor?', hi: 'उम्मीद है आप जल्दी ठीक हो जाएँगे। क्या आपने डॉक्टर को दिखाया?', ta: 'விரைவில் குணமடைவீர்கள் என்று நம்புகிறேன். மருத்துவரைப் பார்த்தீர்களா?' }] },
    { k: 'happy sad angry tired bored excited worried feel feeling மகிழ்ச்சி சோகம் கோபம் கவலை உணர் ख़ुश दुखी गुस्सा चिंता',
      q: [{ en: 'Why do you feel that way?', hi: 'आपको ऐसा क्यों लग रहा है?', ta: 'ஏன் அப்படி உணர்கிறீர்கள்?' },
          { en: 'What usually makes you happy?', hi: 'आपको आमतौर पर किस बात से ख़ुशी मिलती है?', ta: 'வழக்கமாக எது உங்களை மகிழ்ச்சிப்படுத்தும்?' }] },
    { k: 'buy shop shopping price money cost cheap expensive வாங்க கடை விலை பணம் ख़रीद दुकान दाम पैसा',
      q: [{ en: 'Do you prefer shopping online or in a shop?', hi: 'आपको ऑनलाइन ख़रीदारी पसंद है या दुकान में जाकर?', ta: 'இணையத்தில் வாங்குவது பிடிக்குமா, கடைக்குச் சென்று வாங்குவதா?' }] },
    { k: 'phone mobile computer internet app technology laptop போன் கணினி இணையம் फ़ोन कंप्यूटर इंटरनेट',
      q: [{ en: 'How many hours do you spend on your phone each day?', hi: 'आप रोज़ कितने घंटे फ़ोन पर बिताते हैं?', ta: 'ஒவ்வொரு நாளும் எத்தனை மணி நேரம் போனில் செலவிடுகிறீர்கள்?' }] },
    { k: 'hello hi hey good morning evening name how are you வணக்கம் பெயர் எப்படி नमस्ते नाम कैसे',
      q: [{ en: 'Nice to meet you! Where are you from?', hi: 'आपसे मिलकर ख़ुशी हुई! आप कहाँ से हैं?', ta: 'உங்களைச் சந்தித்ததில் மகிழ்ச்சி! நீங்கள் எந்த ஊர்?' },
          { en: 'How is your day going?', hi: 'आपका दिन कैसा जा रहा है?', ta: 'உங்கள் நாள் எப்படிப் போகிறது?' }] }
  ];

  var FALLBACK = [
    { en: 'That is interesting. Can you tell me more?', hi: 'यह दिलचस्प है। क्या आप और बता सकते हैं?', ta: 'சுவாரசியமாக இருக்கிறது. இன்னும் சொல்ல முடியுமா?' },
    { en: 'Why do you think so?', hi: 'आप ऐसा क्यों सोचते हैं?', ta: 'ஏன் அப்படி நினைக்கிறீர்கள்?' },
    { en: 'What happened next?', hi: 'फिर क्या हुआ?', ta: 'அதன் பிறகு என்ன நடந்தது?' },
    { en: 'How did that make you feel?', hi: 'उससे आपको कैसा लगा?', ta: 'அது உங்களுக்கு எப்படி இருந்தது?' }
  ];

  /* A follow-up for what was said. `turn` varies the choice so the same
     topic does not get the same question every time. */
  function followUp(text, turn) {
    var words = tokens(text);
    var best = null, bestScore = 0;
    TOPICS.forEach(function (t) {
      var keys = t.k.split(/\s+/);
      var s = 0;
      words.forEach(function (w) {
        keys.forEach(function (k) {
          if (k === w) s += 2;
          else if (k.length > 3 && w.length > 3 && (w.indexOf(k) === 0 || k.indexOf(w) === 0)) s += 1;
        });
      });
      if (s > bestScore) { bestScore = s; best = t; }
    });
    var list = best ? best.q : FALLBACK;
    return list[(turn || 0) % list.length];
  }

  return {
    PASS: PASS,
    all: all,
    byLevel: byLevel,
    find: find,
    accepted: accepted,
    judge: judge,
    feedback: feedback,
    match: match,
    scriptOf: scriptOf,
    followUp: followUp,
    LEVELS: function () { return TB.TALK_LEVELS || []; }
  };
})();
