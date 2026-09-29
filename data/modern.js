/* Tamil Bridge — what a child growing up now actually needs to know.

   A child today meets a screen before they meet a blackboard. They will be
   asked for a password before they are asked for their handwriting, and
   they will be told something by a machine before they are told it by a
   teacher. None of that is in the vocabulary lists.

   So: the modern world, explained plainly, in English, Tamil and Hindi at
   once. Each topic says what the thing is, why it matters, the words you
   need to talk about it, one thing to try today, and the one thing to be
   careful about — because every one of these has a way of going wrong.

   Written to be read aloud by a parent to a small child, or alone by an
   older one. Nothing here needs an account, a network or a payment.      */
window.TB = window.TB || {};

TB.MODERN = [
  /* ============================================ how the machines work */
  {
    id: 'computer', icon: '\u{1F4BB}', band: 'little', group: 'tech',
    title: { en: 'What a computer really does', ta: 'கணினி உண்மையில் என்ன செய்கிறது', hi: 'कंप्यूटर असल में क्या करता है' },
    what: {
      en: 'A computer cannot think. It can only do very simple things — add two numbers, compare two numbers, remember a number — but it does them millions of times a second, and never gets bored. Everything else, every game and every film, is built out of those small things.',
      ta: 'கணினியால் சிந்திக்க முடியாது. இரண்டு எண்களைக் கூட்டுவது, ஒப்பிடுவது, ஒரு எண்ணை நினைவில் வைப்பது — இவை மட்டுமே அதற்குத் தெரியும். ஆனால் வினாடிக்கு பல கோடி முறை செய்யும், சலிக்காது. மற்ற எல்லாம் — ஒவ்வொரு விளையாட்டும் படமும் — இந்தச் சிறிய செயல்களால் கட்டப்பட்டவை.',
      hi: 'कंप्यूटर सोच नहीं सकता। वह बस बहुत सरल काम कर सकता है — दो संख्याएँ जोड़ना, दो की तुलना करना, एक संख्या याद रखना — पर वह उन्हें एक सेकंड में लाखों बार करता है और कभी ऊबता नहीं। बाकी सब, हर खेल और हर फ़िल्म, इन्हीं छोटे कामों से बनी है।'
    },
    why: {
      en: 'If you know the machine is simple, it stops being magic. A thing that is not magic can be understood, and a thing you understand cannot frighten you.',
      ta: 'இயந்திரம் எளிமையானது என்று தெரிந்தால் அது மாயமாக இருக்காது. மாயம் அல்லாத ஒன்றைப் புரிந்துகொள்ளலாம்; புரிந்துகொண்ட ஒன்று உன்னைப் பயமுறுத்தாது.',
      hi: 'अगर पता हो कि मशीन सरल है, तो वह जादू नहीं रह जाती। जो जादू नहीं है उसे समझा जा सकता है, और जिसे समझ लो वह डरा नहीं सकता।'
    },
    words: [
      { en: 'computer', ta: 'கணினி', hi: 'कंप्यूटर' },
      { en: 'memory', ta: 'நினைவகம்', hi: 'स्मृति' },
      { en: 'screen', ta: 'திரை', hi: 'स्क्रीन' },
      { en: 'keyboard', ta: 'விசைப்பலகை', hi: 'कुंजीपटल' }
    ],
    todo: {
      en: 'Count out loud to twenty. Now imagine doing that a million times without stopping. That is the only thing the machine is better at than you.',
      ta: 'இருபது வரை சத்தமாக எண்ணு. இப்போது அதை நிற்காமல் பத்து லட்சம் முறை செய்வதை நினைத்துப்பார். இயந்திரம் உன்னைவிட மேலானது இதில் மட்டுமே.',
      hi: 'बीस तक ज़ोर से गिनो। अब सोचो कि वही बिना रुके दस लाख बार करना है। मशीन तुमसे सिर्फ़ इसी एक बात में बेहतर है।'
    },
    careful: {
      en: 'Fast is not the same as right. A calculator will answer a wrong question as quickly as a right one.',
      ta: 'வேகம் என்பது சரி என்பதல்ல. தவறான கேள்விக்கும் கணிப்பான் அதே வேகத்தில் பதில் தரும்.',
      hi: 'तेज़ होना सही होना नहीं है। कैलकुलेटर ग़लत सवाल का जवाब भी उतनी ही तेज़ी से देगा।'
    }
  },
  {
    id: 'internet', icon: '\u{1F310}', band: 'middle', group: 'tech',
    title: { en: 'How a message travels', ta: 'ஒரு செய்தி எப்படிப் பயணிக்கிறது', hi: 'संदेश कैसे सफ़र करता है' },
    what: {
      en: 'When you send a message, it is cut into small pieces. Each piece travels on its own, through wires under the sea and towers on the land, and they are put back together at the other end. The internet is not a cloud in the sky — it is cable, and somebody laid it.',
      ta: 'நீ செய்தி அனுப்பும்போது அது சிறு துண்டுகளாக வெட்டப்படுகிறது. ஒவ்வொரு துண்டும் தனித்தனியே — கடலுக்கு அடியில் கம்பிகள் வழியாகவும், நிலத்தில் கோபுரங்கள் வழியாகவும் — பயணித்து, மறுமுனையில் மீண்டும் ஒன்றாகச் சேர்க்கப்படுகிறது. இணையம் வானத்தில் உள்ள மேகம் அல்ல; அது கேபிள், அதை யாரோ போட்டிருக்கிறார்கள்.',
      hi: 'जब तुम संदेश भेजते हो, वह छोटे टुकड़ों में कट जाता है। हर टुकड़ा अलग-अलग सफ़र करता है — समुद्र के नीचे तारों से और ज़मीन पर टावरों से — और दूसरे सिरे पर फिर से जुड़ जाता है। इंटरनेट आसमान में बादल नहीं है; वह केबल है, और किसी ने उसे बिछाया है।'
    },
    why: {
      en: 'Anything that travels can be seen on the way. That is why some things are locked before they are sent, and why the little padlock in the address bar matters.',
      ta: 'பயணிக்கும் எதையும் வழியில் பார்க்க முடியும். அதனால்தான் சில அனுப்பப்படும் முன் பூட்டப்படுகின்றன; முகவரிப் பட்டையில் உள்ள சிறிய பூட்டுக்கு அதனால்தான் முக்கியத்துவம்.',
      hi: 'जो कुछ सफ़र करता है उसे रास्ते में देखा जा सकता है। इसीलिए कुछ चीज़ें भेजने से पहले ताले में बंद की जाती हैं, और पते वाली पट्टी का छोटा ताला मायने रखता है।'
    },
    words: [
      { en: 'internet', ta: 'இணையம்', hi: 'इंटरनेट' },
      { en: 'message', ta: 'செய்தி', hi: 'संदेश' },
      { en: 'network', ta: 'வலையமைப்பு', hi: 'नेटवर्क' },
      { en: 'password', ta: 'கடவுச்சொல்', hi: 'पासवर्ड' }
    ],
    todo: {
      en: 'Look at the top of this page. If the address starts with https and not http, the s means the message is locked while it travels.',
      ta: 'இந்தப் பக்கத்தின் மேல் பகுதியைப் பார். முகவரி http அல்ல, https என்று தொடங்கினால், அந்த s என்பது பயணத்தின்போது செய்தி பூட்டப்பட்டிருக்கிறது என்று பொருள்.',
      hi: 'इस पन्ने के ऊपर देखो। अगर पता http नहीं बल्कि https से शुरू होता है, तो वह s बताता है कि संदेश सफ़र के दौरान ताले में है।'
    },
    careful: {
      en: 'Anything you send can be kept by somebody, for years. Nothing on a screen is really erased just because you cannot see it.',
      ta: 'நீ அனுப்பும் எதையும் யாரோ ஒருவர் பல ஆண்டுகள் வைத்திருக்கலாம். உனக்குத் தெரியவில்லை என்பதற்காக திரையில் உள்ள எதுவும் உண்மையில் அழிந்துவிடவில்லை.',
      hi: 'तुम जो भेजते हो उसे कोई सालों तक रख सकता है। स्क्रीन पर कुछ भी सिर्फ़ इसलिए मिट नहीं जाता कि वह तुम्हें दिख नहीं रहा।'
    }
  },

  /* =========================================================== AI */
  {
    id: 'ai-what', icon: '\u{1F916}', band: 'middle', group: 'ai',
    title: { en: 'What AI is — and what it is not', ta: 'AI என்றால் என்ன, என்ன அல்ல', hi: 'AI क्या है — और क्या नहीं' },
    what: {
      en: 'An AI has read an enormous amount of writing and learnt which words tend to follow which. When you ask it something, it works out the words that would most likely come next. That is genuinely useful, and it is not the same as knowing.',
      ta: 'AI மிகப் பெரிய அளவு எழுத்தைப் படித்து, எந்தச் சொல்லுக்குப் பின் எந்தச் சொல் வரும் என்பதைக் கற்றுக்கொண்டது. நீ ஒன்றைக் கேட்கும்போது, அடுத்து வர வாய்ப்புள்ள சொற்களை அது கணிக்கிறது. அது உண்மையிலேயே பயனுள்ளது; ஆனால் அது அறிவது அல்ல.',
      hi: 'AI ने बहुत विशाल मात्रा में लिखा हुआ पढ़ा है और सीखा है कि किस शब्द के बाद कौन-सा शब्द आता है। जब तुम कुछ पूछते हो, वह हिसाब लगाता है कि आगे कौन-से शब्द आने की सबसे ज़्यादा संभावना है। यह सचमुच काम का है, पर यह जानना नहीं है।'
    },
    why: {
      en: 'Because it is guessing the next word rather than looking up a fact, it can be completely wrong while sounding completely sure. A person who is unsure says so. This does not.',
      ta: 'உண்மையைத் தேடாமல் அடுத்த சொல்லை ஊகிப்பதால், முற்றிலும் உறுதியாக ஒலித்தபடியே முற்றிலும் தவறாக இருக்க முடியும். ஐயம் உள்ள மனிதர் அதைச் சொல்வார்; இது சொல்லாது.',
      hi: 'क्योंकि वह तथ्य खोजने के बजाय अगला शब्द अनुमान लगा रहा है, वह पूरी तरह ग़लत हो सकता है और पूरी तरह आश्वस्त सुनाई दे सकता है। जो इंसान अनिश्चित होता है वह कह देता है; यह नहीं कहता।'
    },
    words: [
      { en: 'artificial', ta: 'செயற்கை', hi: 'कृत्रिम' },
      { en: 'intelligence', ta: 'நுண்ணறிவு', hi: 'बुद्धिमत्ता' },
      { en: 'guess', ta: 'ஊகம்', hi: 'अनुमान' },
      { en: 'true', ta: 'உண்மை', hi: 'सच' }
    ],
    todo: {
      en: 'Ask an AI something you already know the right answer to — your own town, your own school. Watch carefully where it is right and where it quietly is not.',
      ta: 'சரியான பதில் உனக்கு ஏற்கெனவே தெரிந்த ஒன்றை AI யிடம் கேள் — உன் ஊர், உன் பள்ளி. எங்கே சரியாகச் சொல்கிறது, எங்கே அமைதியாகத் தவறு செய்கிறது என்று கூர்ந்து கவனி.',
      hi: 'AI से कुछ ऐसा पूछो जिसका सही जवाब तुम्हें पहले से पता है — अपना शहर, अपना स्कूल। ध्यान से देखो कि कहाँ सही है और कहाँ चुपचाप ग़लत है।'
    },
    careful: {
      en: 'An AI will never tell you it has made something up, because it does not know that it has. Check anything that matters against a second source.',
      ta: 'தான் கற்பனையாகச் சொன்னதை AI ஒருபோதும் சொல்லாது — தான் அப்படிச் செய்ததே அதற்குத் தெரியாது. முக்கியமான எதையும் இரண்டாவது ஆதாரத்தில் சரிபார்.',
      hi: 'AI कभी नहीं बताएगा कि उसने कुछ गढ़ लिया है, क्योंकि उसे पता ही नहीं कि उसने गढ़ा है। जो बात मायने रखती है उसे दूसरे स्रोत से जाँचो।'
    }
  },
  {
    id: 'ai-ask', icon: '\u{1F4AC}', band: 'older', group: 'ai',
    title: { en: 'Asking a machine a good question', ta: 'இயந்திரத்திடம் நல்ல கேள்வி கேட்பது', hi: 'मशीन से अच्छा सवाल पूछना' },
    what: {
      en: 'A vague question gets a vague answer. Say who you are, what you want, and what a good answer would look like. "Explain photosynthesis" is weak. "Explain photosynthesis to a nine-year-old in four sentences, in Tamil" is strong.',
      ta: 'தெளிவற்ற கேள்விக்குத் தெளிவற்ற பதிலே கிடைக்கும். நீ யார், உனக்கு என்ன வேண்டும், நல்ல பதில் எப்படி இருக்க வேண்டும் என்பதைச் சொல். "ஒளிச்சேர்க்கையை விளக்கு" என்பது பலவீனம். "ஒன்பது வயதுக் குழந்தைக்கு நான்கு வாக்கியங்களில் தமிழில் ஒளிச்சேர்க்கையை விளக்கு" என்பது வலிமை.',
      hi: 'अस्पष्ट सवाल का जवाब भी अस्पष्ट मिलता है। बताओ कि तुम कौन हो, क्या चाहिए, और अच्छा जवाब कैसा दिखेगा। "प्रकाश संश्लेषण समझाओ" कमज़ोर है। "नौ साल के बच्चे को चार वाक्यों में हिंदी में प्रकाश संश्लेषण समझाओ" मज़बूत है।'
    },
    why: {
      en: 'Learning to say exactly what you want is not a trick for machines. It is the same skill that makes you understood by teachers, shopkeepers and friends.',
      ta: 'உனக்கு என்ன வேண்டும் என்பதைத் துல்லியமாகச் சொல்லக் கற்பது இயந்திரங்களுக்கான தந்திரம் அல்ல. ஆசிரியர், கடைக்காரர், நண்பர்கள் உன்னைப் புரிந்துகொள்ளச் செய்யும் அதே திறன்தான் அது.',
      hi: 'ठीक-ठीक कहना सीखना मशीनों के लिए कोई चालाकी नहीं है। यही वह कौशल है जिससे शिक्षक, दुकानदार और दोस्त तुम्हें समझते हैं।'
    },
    words: [
      { en: 'question', ta: 'கேள்வி', hi: 'सवाल' },
      { en: 'clear', ta: 'தெளிவான', hi: 'स्पष्ट' },
      { en: 'example', ta: 'எடுத்துக்காட்டு', hi: 'उदाहरण' },
      { en: 'answer', ta: 'பதில்', hi: 'जवाब' }
    ],
    todo: {
      en: 'Take a question you asked today and write it again with three more details in it. Notice how much better the answer gets.',
      ta: 'இன்று நீ கேட்ட ஒரு கேள்வியை எடுத்து, மேலும் மூன்று விவரங்களைச் சேர்த்து மீண்டும் எழுது. பதில் எவ்வளவு சிறப்பாகிறது என்று கவனி.',
      hi: 'आज पूछा हुआ कोई सवाल लो और उसे तीन और ब्योरों के साथ दोबारा लिखो। देखो जवाब कितना बेहतर हो जाता है।'
    },
    careful: {
      en: 'Never put your address, your school, your phone number or a password into any box you did not have to sign into.',
      ta: 'உன் முகவரி, பள்ளி, தொலைபேசி எண், கடவுச்சொல் — இவற்றை நீ உள்நுழையத் தேவையில்லாத எந்தப் பெட்டியிலும் ஒருபோதும் எழுதாதே.',
      hi: 'अपना पता, स्कूल, फ़ोन नंबर या पासवर्ड कभी किसी ऐसे बॉक्स में मत डालो जिसमें तुम्हें साइन इन करना ही नहीं पड़ा।'
    }
  },
  {
    id: 'ai-check', icon: '\u{1F50D}', band: 'older', group: 'ai',
    title: { en: 'Checking what you are told', ta: 'சொல்லப்பட்டதைச் சரிபார்ப்பது', hi: 'जो बताया गया उसे जाँचना' },
    what: {
      en: 'One source is not evidence. Two sources that copied each other are still one source. Look for who is saying it, when they said it, and whether anybody who would disagree has been asked.',
      ta: 'ஒரு ஆதாரம் என்பது சான்று அல்ல. ஒன்றையொன்று நகலெடுத்த இரு ஆதாரங்களும் ஒரே ஆதாரமே. யார் சொல்கிறார்கள், எப்போது சொன்னார்கள், மறுக்கக்கூடியவரிடம் கேட்கப்பட்டதா என்று பார்.',
      hi: 'एक स्रोत सबूत नहीं है। दो स्रोत जिन्होंने एक-दूसरे की नक़ल की, फिर भी एक ही स्रोत हैं। देखो कि कह कौन रहा है, कब कहा, और क्या किसी असहमत व्यक्ति से भी पूछा गया।'
    },
    why: {
      en: 'A false thing that is repeated often enough starts to feel true. The feeling of truth and the fact of truth are different things, and only one of them can be checked.',
      ta: 'போதுமான அளவு திரும்பச் சொல்லப்படும் பொய் உண்மை போலத் தோன்றத் தொடங்கும். உண்மை என்ற உணர்வும் உண்மை என்ற நிலையும் வெவ்வேறு; அவற்றுள் ஒன்றை மட்டுமே சரிபார்க்க முடியும்.',
      hi: 'जो झूठ काफ़ी बार दोहराया जाए वह सच जैसा लगने लगता है। सच लगना और सच होना अलग बातें हैं, और इनमें से सिर्फ़ एक को जाँचा जा सकता है।'
    },
    words: [
      { en: 'proof', ta: 'சான்று', hi: 'सबूत' },
      { en: 'source', ta: 'ஆதாரம்', hi: 'स्रोत' },
      { en: 'doubt', ta: 'ஐயம்', hi: 'संदेह' },
      { en: 'false', ta: 'பொய்', hi: 'झूठ' }
    ],
    todo: {
      en: 'Find one thing you believe because somebody told you. Try to find out who told them.',
      ta: 'யாரோ சொன்னதால் நீ நம்பும் ஒன்றைக் கண்டுபிடி. அவர்களுக்கு யார் சொன்னார்கள் என்று கண்டுபிடிக்க முயற்சி செய்.',
      hi: 'कोई एक बात ढूँढो जिस पर तुम इसलिए यक़ीन करते हो क्योंकि किसी ने बताई। पता लगाओ कि उन्हें किसने बताई थी।'
    },
    careful: {
      en: 'The most convincing lie is the one you already wanted to be true. Be hardest on the claims you like best.',
      ta: 'நீ உண்மையாக இருக்க வேண்டும் என்று ஏற்கெனவே விரும்பிய பொய்யே மிக நம்பத்தகுந்தது. உனக்கு மிகவும் பிடித்த கூற்றுகளிடம்தான் மிகக் கடுமையாக இரு.',
      hi: 'सबसे भरोसेमंद झूठ वही होता है जिसे तुम पहले से सच मानना चाहते थे। जो दावे तुम्हें सबसे अच्छे लगें, उन पर सबसे सख़्त रहो।'
    }
  },
  {
    id: 'ai-fake', icon: '\u{1F3AD}', band: 'older', group: 'ai',
    title: { en: 'Pictures and voices that were made up', ta: 'உருவாக்கப்பட்ட படங்களும் குரல்களும்', hi: 'बनाई हुई तस्वीरें और आवाज़ें' },
    what: {
      en: 'A machine can now make a photograph of something that never happened and a voice saying words the person never said. It is getting harder to see the difference, and it will not get easier.',
      ta: 'நடக்காத ஒன்றின் புகைப்படத்தையும், ஒருவர் சொல்லாத சொற்களைச் சொல்லும் குரலையும் இப்போது இயந்திரம் உருவாக்க முடியும். வேறுபாட்டைக் காண்பது கடினமாகிக்கொண்டே வருகிறது; எளிதாகப் போவதில்லை.',
      hi: 'मशीन अब ऐसी तस्वीर बना सकती है जो कभी हुआ ही नहीं, और ऐसी आवाज़ जो उस व्यक्ति ने कभी कही ही नहीं। फ़र्क़ पहचानना मुश्किल होता जा रहा है, और आसान नहीं होगा।'
    },
    why: {
      en: 'Seeing is no longer believing. What is left is asking: where did this come from, and who gains if I believe it?',
      ta: 'பார்ப்பதே நம்புவது என்ற காலம் முடிந்தது. மிச்சமிருப்பது கேள்வி மட்டுமே: இது எங்கிருந்து வந்தது, நான் நம்பினால் யாருக்கு லாபம்?',
      hi: 'अब देखना ही मानना नहीं रहा। बचा है तो बस सवाल: यह आया कहाँ से, और मेरे यक़ीन करने से फ़ायदा किसे है?'
    },
    words: [
      { en: 'picture', ta: 'படம்', hi: 'तस्वीर' },
      { en: 'voice', ta: 'குரல்', hi: 'आवाज़' },
      { en: 'fake', ta: 'போலி', hi: 'नक़ली' },
      { en: 'real', ta: 'நிஜமான', hi: 'असली' }
    ],
    todo: {
      en: 'When a picture surprises you, look for the same event somewhere else before you send it on. Most of the time you will not find it.',
      ta: 'ஒரு படம் உன்னை வியப்பில் ஆழ்த்தினால், அதை அனுப்பும் முன் அதே நிகழ்வை வேறெங்காவது தேடு. பெரும்பாலும் கிடைக்காது.',
      hi: 'कोई तस्वीर चौंकाए तो आगे भेजने से पहले वही घटना कहीं और ढूँढो। ज़्यादातर बार नहीं मिलेगी।'
    },
    careful: {
      en: 'If a message wants you to feel angry or frightened quickly, that is the warning. Slow down before you forward it.',
      ta: 'ஒரு செய்தி உன்னை விரைவாகக் கோபமோ பயமோ கொள்ளச் செய்ய விரும்பினால், அதுவே எச்சரிக்கை. அனுப்பும் முன் மெதுவாக இரு.',
      hi: 'अगर कोई संदेश तुम्हें जल्दी से ग़ुस्सा या डर महसूस कराना चाहता है, वही चेतावनी है। आगे भेजने से पहले रुको।'
    }
  },

  /* ===================================================== staying safe */
  {
    id: 'password', icon: '\u{1F510}', band: 'middle', group: 'safe',
    title: { en: 'A password worth having', ta: 'பயனுள்ள கடவுச்சொல்', hi: 'काम का पासवर्ड' },
    what: {
      en: 'A long password beats a complicated one. Four ordinary words strung together — like a small nonsense sentence you can picture — is stronger than a short one full of symbols, and you will actually remember it.',
      ta: 'சிக்கலான கடவுச்சொல்லைவிட நீளமானது வலிமையானது. படமாக நினைத்துப்பார்க்கக்கூடிய சிறு அர்த்தமற்ற வாக்கியம் போல நான்கு சாதாரண சொற்களைச் சேர்த்தால், குறியீடுகள் நிறைந்த குறுகிய ஒன்றைவிட வலிமையாக இருக்கும் — உனக்கு நினைவிலும் இருக்கும்.',
      hi: 'लंबा पासवर्ड जटिल पासवर्ड से बेहतर है। चार साधारण शब्द एक साथ — जैसे कोई छोटा बेतुका वाक्य जिसकी तस्वीर बन सके — प्रतीकों से भरे छोटे पासवर्ड से ज़्यादा मज़बूत है, और याद भी रहेगा।'
    },
    why: {
      en: 'A machine guessing passwords tries billions a second. Length is the only thing that really slows it down.',
      ta: 'கடவுச்சொற்களை ஊகிக்கும் இயந்திரம் வினாடிக்குப் பல நூறு கோடி முறை முயல்கிறது. அதை உண்மையில் தாமதப்படுத்துவது நீளம் மட்டுமே.',
      hi: 'पासवर्ड अनुमान लगाने वाली मशीन एक सेकंड में अरबों कोशिशें करती है। उसे सचमुच धीमा करने वाली एक ही चीज़ है — लंबाई।'
    },
    words: [
      { en: 'password', ta: 'கடவுச்சொல்', hi: 'पासवर्ड' },
      { en: 'secret', ta: 'ரகசியம்', hi: 'राज़' },
      { en: 'safe', ta: 'பாதுகாப்பான', hi: 'सुरक्षित' },
      { en: 'account', ta: 'கணக்கு', hi: 'खाता' }
    ],
    todo: {
      en: 'Make one from four things you can see in the room right now. Say it aloud once. You will still know it tomorrow.',
      ta: 'இப்போது அறையில் தெரியும் நான்கு பொருள்களை வைத்து ஒன்றை உருவாக்கு. ஒருமுறை சத்தமாகச் சொல். நாளையும் உனக்கு நினைவிருக்கும்.',
      hi: 'अभी कमरे में दिख रही चार चीज़ों से एक बनाओ। एक बार ज़ोर से बोलो। कल भी याद रहेगा।'
    },
    careful: {
      en: 'Never use the same password twice. When one place is broken into, everywhere else you used it is broken into as well.',
      ta: 'ஒரே கடவுச்சொல்லை இரண்டு இடங்களில் பயன்படுத்தாதே. ஓரிடம் உடைக்கப்பட்டால், அதைப் பயன்படுத்திய எல்லா இடங்களும் உடைக்கப்பட்டதாகும்.',
      hi: 'एक ही पासवर्ड दो जगह कभी मत इस्तेमाल करो। जब एक जगह सेंध लगती है, तो हर वह जगह भी टूट जाती है जहाँ वही पासवर्ड था।'
    }
  },
  {
    id: 'private', icon: '\u{1F6E1}', band: 'little', group: 'safe',
    title: { en: 'What you keep to yourself', ta: 'உனக்குள்ளேயே வைத்துக்கொள்வது', hi: 'जो अपने तक रखना है' },
    what: {
      en: 'Your full name, your address, your school, your photograph, where you will be this evening — these belong to you, and a stranger has no reason to have them. It is not rude to say no.',
      ta: 'உன் முழுப் பெயர், முகவரி, பள்ளி, புகைப்படம், இன்று மாலை நீ இருக்கும் இடம் — இவை உனக்கு உரியவை; அறியாத ஒருவருக்கு அவை தேவையில்லை. வேண்டாம் என்று சொல்வது முரட்டுத்தனம் அல்ல.',
      hi: 'तुम्हारा पूरा नाम, पता, स्कूल, तस्वीर, आज शाम तुम कहाँ रहोगे — ये सब तुम्हारे हैं, और किसी अजनबी को इनकी कोई ज़रूरत नहीं। मना करना बदतमीज़ी नहीं है।'
    },
    why: {
      en: 'Small pieces add up. Nobody asks for everything at once; they ask for one harmless thing at a time until they have all of it.',
      ta: 'சிறு துண்டுகள் சேர்ந்து முழுமையாகும். எல்லாவற்றையும் ஒரேநேரத்தில் யாரும் கேட்பதில்லை; பாதிப்பில்லாத ஒன்றாக ஒவ்வொன்றாகக் கேட்டு, இறுதியில் அனைத்தையும் பெற்றுவிடுவார்கள்.',
      hi: 'छोटे टुकड़े जुड़कर पूरा बन जाते हैं। कोई एक साथ सब नहीं माँगता; एक-एक करके मासूम-सी चीज़ें माँगता है जब तक सब न मिल जाए।'
    },
    words: [
      { en: 'private', ta: 'தனிப்பட்ட', hi: 'निजी' },
      { en: 'stranger', ta: 'அந்நியர்', hi: 'अजनबी' },
      { en: 'name', ta: 'பெயர்', hi: 'नाम' },
      { en: 'no', ta: 'இல்லை', hi: 'नहीं' }
    ],
    todo: {
      en: 'Practise the sentence out loud: "I do not want to say." You have not done anything wrong by saying it.',
      ta: '"நான் சொல்ல விரும்பவில்லை" என்ற வாக்கியத்தைச் சத்தமாகப் பயிற்சி செய். அதைச் சொல்வதால் நீ தவறு எதுவும் செய்யவில்லை.',
      hi: 'यह वाक्य ज़ोर से बोलकर अभ्यास करो: "मैं नहीं बताना चाहता।" यह कहकर तुमने कुछ ग़लत नहीं किया।'
    },
    careful: {
      en: 'If somebody online asks you to keep a secret from your parents, that is the moment to tell your parents.',
      ta: 'இணையத்தில் யாராவது பெற்றோரிடமிருந்து ரகசியம் வைக்கச் சொன்னால், அதுவே பெற்றோரிடம் சொல்ல வேண்டிய தருணம்.',
      hi: 'अगर ऑनलाइन कोई कहे कि यह बात माता-पिता से छिपाना, तो वही पल है माता-पिता को बताने का।'
    }
  },
  {
    id: 'scam', icon: '\u{26A0}', band: 'middle', group: 'safe',
    title: { en: 'The message that says you have won', ta: 'நீ வென்றுவிட்டாய் என்று சொல்லும் செய்தி', hi: 'वह संदेश जो कहता है तुम जीत गए' },
    what: {
      en: 'You did not win. You did not have a parcel held up. Your account is not about to close. These messages are sent to millions of people at once, and they only need one to believe them.',
      ta: 'நீ வெல்லவில்லை. உன் பார்சல் நிறுத்தப்படவில்லை. உன் கணக்கு மூடப்படப்போவதில்லை. இச்செய்திகள் ஒரேநேரத்தில் பல லட்சம் பேருக்கு அனுப்பப்படுகின்றன; ஒருவர் நம்பினால் போதும் அவர்களுக்கு.',
      hi: 'तुम जीते नहीं हो। तुम्हारा कोई पार्सल रुका नहीं है। तुम्हारा खाता बंद नहीं होने वाला। ये संदेश एक साथ लाखों लोगों को भेजे जाते हैं, और उन्हें सिर्फ़ एक का यक़ीन कर लेना काफ़ी है।'
    },
    why: {
      en: 'They all work the same way: something wonderful or something frightening, and then a hurry. The hurry is there so that you do not stop to think.',
      ta: 'எல்லாமே ஒரே முறையில் வேலை செய்கின்றன: அற்புதமான ஒன்று அல்லது பயமுறுத்தும் ஒன்று, பிறகு அவசரம். நீ நின்று யோசிக்கக் கூடாது என்பதற்காகவே அந்த அவசரம்.',
      hi: 'सब एक ही तरह काम करते हैं: कुछ शानदार या कुछ डरावना, और फिर जल्दबाज़ी। जल्दबाज़ी इसीलिए है कि तुम रुककर सोचो नहीं।'
    },
    words: [
      { en: 'prize', ta: 'பரிசு', hi: 'इनाम' },
      { en: 'hurry', ta: 'அவசரம்', hi: 'जल्दबाज़ी' },
      { en: 'cheat', ta: 'ஏமாற்று', hi: 'ठगना' },
      { en: 'careful', ta: 'கவனமாக', hi: 'सावधान' }
    ],
    todo: {
      en: 'Learn one rule and it will serve you for life: nobody real is ever in a hurry for your money.',
      ta: 'ஒரு விதியைக் கற்றுக்கொள்; வாழ்நாள் முழுவதும் உதவும்: உண்மையான எவரும் உன் பணத்திற்காக ஒருபோதும் அவசரப்பட மாட்டார்கள்.',
      hi: 'एक नियम सीख लो, जीवन भर काम आएगा: कोई भी सच्चा आदमी तुम्हारे पैसे के लिए कभी जल्दी में नहीं होता।'
    },
    careful: {
      en: 'No bank, no police officer and no government office will ever ask for a password or an OTP. Not once, not ever.',
      ta: 'எந்த வங்கியும், காவல் அதிகாரியும், அரசு அலுவலகமும் கடவுச்சொல்லையோ OTP யையோ ஒருபோதும் கேட்க மாட்டார்கள். ஒருமுறைகூட இல்லை.',
      hi: 'कोई बैंक, कोई पुलिस अधिकारी और कोई सरकारी दफ़्तर कभी पासवर्ड या OTP नहीं माँगेगा। एक बार भी नहीं।'
    }
  },

  /* ======================================================= thinking */
  {
    id: 'code', icon: '\u{1F9E9}', band: 'little', group: 'think',
    title: { en: 'Code is just instructions in order', ta: 'நிரல் என்பது வரிசையான கட்டளைகளே', hi: 'कोड बस क्रम में दिए निर्देश हैं' },
    what: {
      en: 'Writing code is telling something exactly what to do, in the right order, leaving nothing out. A recipe is code. Directions to your house are code. The hard part is never the typing; it is noticing the step you forgot.',
      ta: 'நிரல் எழுதுவது என்பது, சரியான வரிசையில், எதையும் விடாமல், என்ன செய்ய வேண்டும் என்று துல்லியமாகச் சொல்வது. சமையல் குறிப்பு ஒரு நிரல். உன் வீட்டுக்கு வழி சொல்வதும் நிரலே. கடினமான பகுதி தட்டச்சு அல்ல — நீ மறந்த படியைக் கவனிப்பதே.',
      hi: 'कोड लिखना यानी किसी को ठीक-ठीक बताना कि क्या करना है, सही क्रम में, कुछ छोड़े बिना। पकाने की विधि कोड है। तुम्हारे घर का रास्ता बताना कोड है। मुश्किल हिस्सा टाइप करना नहीं — वह क़दम पकड़ना है जो तुम भूल गए।'
    },
    why: {
      en: 'Thinking in exact steps makes you better at explaining anything to anybody, long before it makes you a programmer.',
      ta: 'துல்லியமான படிகளில் சிந்திப்பது, உன்னை நிரலாளராக்குவதற்கு நெடுங்காலம் முன்பே, எதையும் யாருக்கும் விளக்குவதில் சிறந்தவனாக்கும்.',
      hi: 'सटीक क़दमों में सोचना तुम्हें प्रोग्रामर बनाने से बहुत पहले ही किसी भी बात को किसी को भी समझाने में बेहतर बना देता है।'
    },
    words: [
      { en: 'step', ta: 'படி', hi: 'क़दम' },
      { en: 'order', ta: 'வரிசை', hi: 'क्रम' },
      { en: 'instruction', ta: 'கட்டளை', hi: 'निर्देश' },
      { en: 'repeat', ta: 'மீண்டும் செய்', hi: 'दोहराओ' }
    ],
    todo: {
      en: 'Write down every step of making tea. Give it to somebody and make them follow it exactly. They will get it wrong, and the missing step is the lesson.',
      ta: 'தேநீர் தயாரிக்கும் ஒவ்வொரு படியையும் எழுது. அதை ஒருவரிடம் கொடுத்து அப்படியே பின்பற்றச் சொல். அவர்கள் தவறு செய்வார்கள் — விடுபட்ட படியே பாடம்.',
      hi: 'चाय बनाने का हर क़दम लिखो। किसी को दो और ठीक वैसा ही करने को कहो। वे ग़लती करेंगे, और छूटा हुआ क़दम ही सबक़ है।'
    },
    careful: {
      en: 'A machine does exactly what you said, not what you meant. That is not the machine being stupid; that is you being unclear.',
      ta: 'நீ நினைத்ததை அல்ல, நீ சொன்னதைத்தான் இயந்திரம் செய்யும். அது இயந்திரத்தின் முட்டாள்தனம் அல்ல; உன் தெளிவின்மை.',
      hi: 'मशीन वही करती है जो तुमने कहा, वह नहीं जो तुम्हारा मतलब था। यह मशीन की बेवक़ूफ़ी नहीं, तुम्हारा अस्पष्ट होना है।'
    }
  },
  {
    id: 'mistake', icon: '\u{1F41B}', band: 'little', group: 'think',
    title: { en: 'A mistake is information', ta: 'தவறு ஒரு தகவல்', hi: 'ग़लती एक जानकारी है' },
    what: {
      en: 'When something does not work, it has told you something true: your idea of how it worked was wrong somewhere. Find the smallest thing that still fails, and the fault is near it.',
      ta: 'ஒன்று வேலை செய்யாதபோது, அது உண்மையான ஒன்றைச் சொல்லியிருக்கிறது: அது எப்படி வேலை செய்யும் என்ற உன் எண்ணம் எங்கோ தவறு. இன்னும் தோல்வியடையும் மிகச் சிறிய பகுதியைக் கண்டுபிடி; பிழை அதற்கு அருகிலேயே இருக்கும்.',
      hi: 'जब कुछ काम नहीं करता, उसने तुम्हें एक सच बता दिया है: उसके काम करने के बारे में तुम्हारी समझ कहीं ग़लत थी। सबसे छोटा हिस्सा ढूँढो जो अब भी बिगड़ता है, ख़राबी उसी के पास है।'
    },
    why: {
      en: 'People who are good at hard things are not people who fail less. They are people who read their failures instead of hiding from them.',
      ta: 'கடினமான விஷயங்களில் சிறந்தவர்கள் குறைவாகத் தோற்பவர்கள் அல்ல. தங்கள் தோல்விகளிடமிருந்து ஒளியாமல் அவற்றைப் படிப்பவர்கள்.',
      hi: 'कठिन चीज़ों में माहिर लोग वे नहीं जो कम असफल होते हैं। वे हैं जो अपनी असफलताओं से छिपने के बजाय उन्हें पढ़ते हैं।'
    },
    words: [
      { en: 'mistake', ta: 'தவறு', hi: 'ग़लती' },
      { en: 'try', ta: 'முயற்சி', hi: 'कोशिश' },
      { en: 'fix', ta: 'சரிசெய்', hi: 'ठीक करो' },
      { en: 'learn', ta: 'கற்றுக்கொள்', hi: 'सीखो' }
    ],
    todo: {
      en: 'Next time you get a sum wrong, do not rub it out. Find the exact line where it went wrong first.',
      ta: 'அடுத்த முறை கணக்கு தவறாகும்போது அழிக்காதே. எந்த வரியில் தவறியது என்பதை முதலில் கண்டுபிடி.',
      hi: 'अगली बार सवाल ग़लत हो तो मिटाओ मत। पहले वह पंक्ति ढूँढो जहाँ ग़लती हुई।'
    },
    careful: {
      en: 'Do not guess and change things at random until it works. You will fix it without ever knowing what was wrong.',
      ta: 'வேலை செய்யும்வரை ஊகித்து எதையாவது மாற்றிக்கொண்டே இருக்காதே. என்ன தவறு என்று தெரியாமலேயே சரிசெய்துவிடுவாய்.',
      hi: 'काम करने तक अंदाज़े से चीज़ें बदलते मत जाओ। ठीक तो हो जाएगा, पर पता नहीं चलेगा कि ग़लत क्या था।'
    }
  },

  /* ==================================================== life skills */
  {
    id: 'money', icon: '\u{1F4B0}', band: 'middle', group: 'life',
    title: { en: 'Earning, saving, spending', ta: 'சம்பாதித்தல், சேமித்தல், செலவிடுதல்', hi: 'कमाना, बचाना, ख़र्च करना' },
    what: {
      en: 'Money is somebody’s work turned into a number you can carry. When you spend it you are spending the hours it took to earn it — which is why a thing is never really priced in rupees but in time.',
      ta: 'பணம் என்பது யாரோ ஒருவரின் உழைப்பு, நீ எடுத்துச் செல்லக்கூடிய எண்ணாக மாறியது. அதைச் செலவிடும்போது, அதைச் சம்பாதிக்கத் தேவைப்பட்ட மணிநேரங்களையே செலவிடுகிறாய் — அதனால்தான் எந்தப் பொருளின் விலையும் உண்மையில் ரூபாயில் அல்ல, நேரத்தில்.',
      hi: 'पैसा किसी की मेहनत है जो एक संख्या बनकर तुम्हारे साथ चलती है। जब तुम ख़र्च करते हो, तो वे घंटे ख़र्च करते हो जो उसे कमाने में लगे — इसीलिए किसी चीज़ की क़ीमत असल में रुपयों में नहीं, समय में होती है।'
    },
    why: {
      en: 'A person who can wait is richer than a person who earns more and cannot. Saving is not about money; it is about being able to wait.',
      ta: 'காத்திருக்கத் தெரிந்தவர், அதிகம் சம்பாதித்தும் காத்திருக்கத் தெரியாதவரைவிடப் பணக்காரர். சேமிப்பு என்பது பணம் பற்றியது அல்ல; காத்திருக்கும் திறன் பற்றியது.',
      hi: 'जो इंतज़ार कर सकता है वह उससे अमीर है जो ज़्यादा कमाता है पर इंतज़ार नहीं कर सकता। बचत पैसे की बात नहीं; इंतज़ार कर पाने की बात है।'
    },
    words: [
      { en: 'money', ta: 'பணம்', hi: 'पैसा' },
      { en: 'save', ta: 'சேமி', hi: 'बचाओ' },
      { en: 'spend', ta: 'செலவிடு', hi: 'ख़र्च करो' },
      { en: 'need', ta: 'தேவை', hi: 'ज़रूरत' }
    ],
    todo: {
      en: 'Before buying something you want, wait three days. Most of the time the wanting goes away on its own, and that tells you what it was worth.',
      ta: 'விரும்பும் ஒன்றை வாங்கும் முன் மூன்று நாட்கள் காத்திரு. பெரும்பாலும் விருப்பம் தானாகவே போய்விடும் — அதன் மதிப்பு என்னவென்று அதுவே சொல்லும்.',
      hi: 'जो चीज़ चाहिए उसे ख़रीदने से पहले तीन दिन रुको। ज़्यादातर बार चाहत अपने आप चली जाती है, और यही बता देती है कि उसका मोल क्या था।'
    },
    careful: {
      en: 'Never share an OTP, a PIN or a UPI code, even with somebody who says they are from the bank. Especially then.',
      ta: 'OTP, PIN, UPI குறியீடு — இவற்றை ஒருபோதும் பகிராதே; வங்கியிலிருந்து என்று சொல்பவரிடமும் கூடாது. அப்போது இன்னும் கூடாது.',
      hi: 'OTP, PIN या UPI कोड कभी किसी से साझा मत करो, उससे भी नहीं जो कहे कि वह बैंक से है। ख़ासकर तब तो नहीं।'
    }
  },
  {
    id: 'screen', icon: '\u{1F634}', band: 'little', group: 'life',
    title: { en: 'Screens, sleep and your eyes', ta: 'திரை, தூக்கம், உன் கண்கள்', hi: 'स्क्रीन, नींद और तुम्हारी आँखें' },
    what: {
      en: 'A screen at night tells your body it is still daytime, so sleep comes later and is thinner. Eyes that stare at one distance for hours get tired because they have forgotten to move.',
      ta: 'இரவில் திரை, இன்னும் பகல்தான் என்று உன் உடலிடம் சொல்கிறது; அதனால் தூக்கம் தாமதமாகவும் மெலிதாகவும் வருகிறது. மணிக்கணக்கில் ஒரே தொலைவை உற்றுப் பார்க்கும் கண்கள், அசைய மறந்ததால் சோர்வடைகின்றன.',
      hi: 'रात में स्क्रीन तुम्हारे शरीर से कहती है कि अभी दिन ही है, इसलिए नींद देर से और हल्की आती है। घंटों एक ही दूरी पर टिकी आँखें थक जाती हैं क्योंकि वे हिलना भूल जाती हैं।'
    },
    why: {
      en: 'Nearly everything you learnt today is filed away while you sleep. A short night does not just make you tired; it quietly throws away the day’s work.',
      ta: 'இன்று நீ கற்ற அனைத்தும் தூங்கும்போதே ஒழுங்குபடுத்தி வைக்கப்படுகிறது. குறைந்த தூக்கம் உன்னைச் சோர்வாக்குவது மட்டுமல்ல; அன்றைய உழைப்பை அமைதியாகத் தூக்கி எறிகிறது.',
      hi: 'आज जो कुछ तुमने सीखा, वह सोते समय ही सहेजा जाता है। कम नींद सिर्फ़ थकाती नहीं; वह दिन भर की मेहनत चुपचाप फेंक देती है।'
    },
    words: [
      { en: 'sleep', ta: 'தூக்கம்', hi: 'नींद' },
      { en: 'eyes', ta: 'கண்கள்', hi: 'आँखें' },
      { en: 'rest', ta: 'ஓய்வு', hi: 'आराम' },
      { en: 'night', ta: 'இரவு', hi: 'रात' }
    ],
    todo: {
      en: 'Every twenty minutes, look at something far away for twenty seconds. Your eyes will thank you and it costs nothing.',
      ta: 'ஒவ்வொரு இருபது நிமிடத்துக்கும் ஒருமுறை, இருபது வினாடிகள் தொலைவில் உள்ள ஒன்றைப் பார். உன் கண்கள் நன்றி சொல்லும்; செலவு எதுவும் இல்லை.',
      hi: 'हर बीस मिनट बाद बीस सेकंड के लिए दूर किसी चीज़ को देखो। तुम्हारी आँखें शुक्रिया कहेंगी, और ख़र्च कुछ नहीं।'
    },
    careful: {
      en: 'Put the screen in another room while you sleep. Willpower loses to a notification every single time.',
      ta: 'தூங்கும்போது திரையை வேறு அறையில் வை. அறிவிப்புக்கு எதிராக மனவுறுதி ஒவ்வொரு முறையும் தோற்கும்.',
      hi: 'सोते समय स्क्रीन दूसरे कमरे में रखो। नोटिफ़िकेशन के सामने इच्छाशक्ति हर बार हारती है।'
    }
  },
  {
    id: 'feelings', icon: '\u{1F49A}', band: 'little', group: 'life',
    title: { en: 'Naming what you feel', ta: 'உணர்வுக்குப் பெயர் சொல்வது', hi: 'जो महसूस हो उसे नाम देना' },
    what: {
      en: 'Angry, worried, ashamed, left out, tired — these are different, and they need different help. A feeling you can name is already smaller than one you cannot.',
      ta: 'கோபம், கவலை, வெட்கம், ஒதுக்கப்பட்ட உணர்வு, சோர்வு — இவை வெவ்வேறு; வெவ்வேறு உதவியும் தேவை. பெயர் சொல்லக்கூடிய உணர்வு, பெயர் தெரியாத உணர்வைவிட ஏற்கெனவே சிறியது.',
      hi: 'ग़ुस्सा, चिंता, शर्मिंदगी, अलग-थलग पड़ जाना, थकान — ये अलग-अलग हैं और इन्हें अलग मदद चाहिए। जिस भावना को नाम दे सको वह बिना नाम वाली से पहले ही छोटी हो जाती है।'
    },
    why: {
      en: 'Most quarrels are one person feeling something they could not name and showing it as anger, because anger is the easiest one to reach for.',
      ta: 'பெரும்பாலான சண்டைகள், பெயர் சொல்லத் தெரியாத ஒன்றை உணர்ந்த ஒருவர் அதைக் கோபமாகக் காட்டுவதே — கோபமே எளிதில் எட்டக்கூடியது.',
      hi: 'ज़्यादातर झगड़े इसलिए होते हैं कि कोई ऐसा कुछ महसूस कर रहा होता है जिसे वह नाम नहीं दे पाता, और उसे ग़ुस्से की तरह दिखाता है, क्योंकि ग़ुस्सा सबसे आसानी से हाथ आता है।'
    },
    words: [
      { en: 'feeling', ta: 'உணர்வு', hi: 'भावना' },
      { en: 'worried', ta: 'கவலையான', hi: 'चिंतित' },
      { en: 'help', ta: 'உதவி', hi: 'मदद' },
      { en: 'friend', ta: 'நண்பன்', hi: 'दोस्त' }
    ],
    todo: {
      en: 'Tonight, say one sentence out loud: "Today I felt ______, because ______." That is the whole exercise.',
      ta: 'இன்றிரவு ஒரு வாக்கியத்தைச் சத்தமாகச் சொல்: "இன்று நான் ______ ஆக உணர்ந்தேன், ஏனென்றால் ______." பயிற்சி இவ்வளவுதான்.',
      hi: 'आज रात एक वाक्य ज़ोर से बोलो: "आज मुझे ______ लगा, क्योंकि ______।" पूरा अभ्यास बस इतना है।'
    },
    careful: {
      en: 'If something is too heavy to say out loud, that is exactly the thing to tell a grown-up you trust. Not the internet.',
      ta: 'சத்தமாகச் சொல்ல முடியாத அளவு கனமான ஒன்று இருந்தால், அதைத்தான் நீ நம்பும் பெரியவரிடம் சொல்ல வேண்டும். இணையத்திடம் அல்ல.',
      hi: 'अगर कोई बात ज़ोर से कहने के लिए बहुत भारी है, तो वही बात किसी भरोसेमंद बड़े को बतानी है। इंटरनेट को नहीं।'
    }
  },
  {
    id: 'water', icon: '\u{1F4A7}', band: 'little', group: 'life',
    title: { en: 'Where water comes from', ta: 'தண்ணீர் எங்கிருந்து வருகிறது', hi: 'पानी कहाँ से आता है' },
    what: {
      en: 'The water in your tap fell as rain, soaked into the ground or filled a lake, and was carried to you through pipes. There is no factory making more of it. It is the same water going round, and it has been going round for as long as there has been a world.',
      ta: 'உன் குழாயில் வரும் தண்ணீர் மழையாகப் பெய்து, நிலத்தில் இறங்கியோ ஏரியை நிரப்பியோ, குழாய்கள் வழியாக உன்னிடம் கொண்டுவரப்பட்டது. அதை மேலும் தயாரிக்கும் தொழிற்சாலை எதுவும் இல்லை. அதே தண்ணீர்தான் சுழன்று வருகிறது — உலகம் தோன்றியதிலிருந்து.',
      hi: 'तुम्हारे नल का पानी बारिश बनकर गिरा, ज़मीन में समाया या झील भरी, और पाइपों से तुम तक पहुँचा। उसे और बनाने वाली कोई फ़ैक्ट्री नहीं है। वही पानी घूम रहा है, जब से दुनिया है तब से।'
    },
    why: {
      en: 'A tap left running for one minute pours away more than some people carry home in a day.',
      ta: 'ஒரு நிமிடம் திறந்தே விடப்பட்ட குழாய், சிலர் ஒரு நாள் முழுவதும் சுமந்து செல்வதைவிட அதிகமாகக் கொட்டிவிடும்.',
      hi: 'एक मिनट खुला छूटा नल उससे ज़्यादा बहा देता है जितना कुछ लोग दिन भर में घर ले जाते हैं।'
    },
    words: [
      { en: 'water', ta: 'தண்ணீர்', hi: 'पानी' },
      { en: 'rain', ta: 'மழை', hi: 'बारिश' },
      { en: 'river', ta: 'ஆறு', hi: 'नदी' },
      { en: 'waste', ta: 'வீணாக்கு', hi: 'बर्बाद करो' }
    ],
    todo: {
      en: 'Close the tap while you brush your teeth. Count what you saved: about a bucketful, every single day.',
      ta: 'பல் துலக்கும்போது குழாயை மூடு. நீ மிச்சப்படுத்தியதை எண்ணு: தினமும் ஏறக்குறைய ஒரு வாளி.',
      hi: 'दाँत साफ़ करते समय नल बंद रखो। गिनो कितना बचाया: क़रीब एक बाल्टी, हर रोज़।'
    },
    careful: {
      en: 'Water that looks clean can still make you ill. Clear is not the same as safe.',
      ta: 'சுத்தமாகத் தெரியும் தண்ணீரும் நோய் தரலாம். தெளிவானது என்பது பாதுகாப்பானது என்பதல்ல.',
      hi: 'साफ़ दिखने वाला पानी भी बीमार कर सकता है। पारदर्शी होना सुरक्षित होना नहीं है।'
    }
  },
  {
    id: 'weather', icon: '\u{1F30D}', band: 'older', group: 'life',
    title: { en: 'Why the weather is changing', ta: 'வானிலை ஏன் மாறுகிறது', hi: 'मौसम क्यों बदल रहा है' },
    what: {
      en: 'Burning coal, oil and gas puts a gas into the air that holds heat in, like a blanket. The blanket is getting thicker, so the whole world is slowly getting warmer, and warm air carries more water — which is why the rain now comes all at once instead of steadily.',
      ta: 'நிலக்கரி, எண்ணெய், எரிவாயு எரிப்பது, வெப்பத்தைப் பிடித்து வைக்கும் ஒரு வாயுவைக் காற்றில் சேர்க்கிறது — ஒரு போர்வை போல. போர்வை தடிமனாகிக்கொண்டே வருகிறது; உலகம் மெல்ல வெப்பமடைகிறது. வெப்பக் காற்று அதிக நீரைச் சுமக்கும் — அதனால்தான் மழை சீராக அல்லாமல் ஒரேயடியாகப் பெய்கிறது.',
      hi: 'कोयला, तेल और गैस जलाने से हवा में एक गैस जाती है जो गर्मी को रोक लेती है, कंबल की तरह। कंबल मोटा होता जा रहा है, इसलिए पूरी दुनिया धीरे-धीरे गर्म हो रही है, और गर्म हवा ज़्यादा पानी उठाती है — इसीलिए बारिश अब बराबर नहीं, एक साथ आती है।'
    },
    why: {
      en: 'This decides what a farmer can plant, whether a city floods, and how hot a classroom is in May. It is not a distant problem; it is this year’s weather.',
      ta: 'விவசாயி எதை விதைக்க முடியும், நகரம் வெள்ளத்தில் மூழ்குமா, மே மாதத்தில் வகுப்பறை எவ்வளவு வெப்பமாக இருக்கும் — இவற்றை இது தீர்மானிக்கிறது. இது தொலைதூரப் பிரச்சினை அல்ல; இந்த ஆண்டின் வானிலை.',
      hi: 'यह तय करता है कि किसान क्या बो सकता है, शहर में बाढ़ आएगी या नहीं, और मई में कक्षा कितनी गर्म होगी। यह दूर की समस्या नहीं; इसी साल का मौसम है।'
    },
    words: [
      { en: 'heat', ta: 'வெப்பம்', hi: 'गर्मी' },
      { en: 'air', ta: 'காற்று', hi: 'हवा' },
      { en: 'tree', ta: 'மரம்', hi: 'पेड़' },
      { en: 'change', ta: 'மாற்றம்', hi: 'बदलाव' }
    ],
    todo: {
      en: 'Ask the oldest person you know what the rains were like when they were your age. That is real data, and it is free.',
      ta: 'உனக்குத் தெரிந்த மிகவும் வயதானவரிடம், அவர்கள் உன் வயதில் இருந்தபோது மழை எப்படி இருந்தது என்று கேள். அது உண்மையான தரவு; இலவசமும் கூட.',
      hi: 'अपने जान-पहचान के सबसे बुज़ुर्ग व्यक्ति से पूछो कि उनकी उम्र में बारिश कैसी होती थी। वह असली आँकड़ा है, और मुफ़्त है।'
    },
    careful: {
      en: 'Do not let anybody tell you it is too late, and do not let anybody tell you it is nothing. Both are ways of asking you to stop paying attention.',
      ta: 'மிகவும் தாமதமாகிவிட்டது என்று யாரும் சொல்ல விடாதே; ஒன்றுமில்லை என்றும் யாரும் சொல்ல விடாதே. இரண்டுமே நீ கவனிப்பதை நிறுத்தச் சொல்லும் வழிகளே.',
      hi: 'न किसी को कहने दो कि बहुत देर हो चुकी, न किसी को कि कुछ नहीं है। दोनों ही तुम्हें ध्यान देना बंद करने को कहने के तरीक़े हैं।'
    }
  },
  {
    id: 'learn', icon: '\u{1F3AF}', band: 'middle', group: 'think',
    title: { en: 'How to learn anything', ta: 'எதையும் கற்பது எப்படி', hi: 'कुछ भी कैसे सीखें' },
    what: {
      en: 'Reading something again feels like learning and mostly is not. Closing the book and trying to say it from memory feels hard and is the thing that works. Difficulty is not a sign you are failing; it is the sensation of learning happening.',
      ta: 'ஒன்றை மீண்டும் படிப்பது கற்பது போலத் தோன்றும், பெரும்பாலும் அல்ல. புத்தகத்தை மூடிவிட்டு நினைவிலிருந்து சொல்ல முயல்வது கடினமாகத் தோன்றும் — அதுவே வேலை செய்யும். கடினம் என்பது நீ தோற்கிறாய் என்பதற்கான அறிகுறி அல்ல; கற்றல் நிகழ்வதன் உணர்வு.',
      hi: 'कुछ दोबारा पढ़ना सीखने जैसा लगता है और ज़्यादातर होता नहीं। किताब बंद करके याद से बोलने की कोशिश कठिन लगती है और वही काम करती है। कठिनाई इस बात का संकेत नहीं कि तुम असफल हो; वह सीखने के घटित होने का एहसास है।'
    },
    why: {
      en: 'Five minutes of trying to remember is worth an hour of reading it again. Nobody is told this, and it is the single most useful thing on this page.',
      ta: 'நினைவுகூர முயலும் ஐந்து நிமிடம், மீண்டும் படிக்கும் ஒரு மணி நேரத்திற்குச் சமம். இதை யாரும் சொல்வதில்லை; இந்தப் பக்கத்தில் மிகவும் பயனுள்ள ஒன்று இதுவே.',
      hi: 'याद करने की पाँच मिनट की कोशिश दोबारा पढ़ने के एक घंटे के बराबर है। यह किसी को बताया नहीं जाता, और इस पन्ने की सबसे काम की बात यही है।'
    },
    words: [
      { en: 'practice', ta: 'பயிற்சி', hi: 'अभ्यास' },
      { en: 'remember', ta: 'நினைவுகூர்', hi: 'याद करो' },
      { en: 'difficult', ta: 'கடினமான', hi: 'कठिन' },
      { en: 'patient', ta: 'பொறுமையான', hi: 'धैर्यवान' }
    ],
    todo: {
      en: 'Read one paragraph. Close the book. Say it out loud in your own words. Then open it and see what you left out — that is what to study.',
      ta: 'ஒரு பத்தியைப் படி. புத்தகத்தை மூடு. உன் சொற்களில் சத்தமாகச் சொல். பிறகு திறந்து, நீ விட்டதைப் பார் — அதுவே படிக்க வேண்டியது.',
      hi: 'एक अनुच्छेद पढ़ो। किताब बंद करो। अपने शब्दों में ज़ोर से बोलो। फिर खोलकर देखो क्या छूटा — वही पढ़ना है।'
    },
    careful: {
      en: 'Studying for six hours while tired teaches less than one hour awake. More time is not the answer as often as people think.',
      ta: 'சோர்வுடன் ஆறு மணி நேரம் படிப்பதைவிட, விழிப்புடன் ஒரு மணி நேரம் அதிகம் கற்பிக்கும். மக்கள் நினைப்பதுபோல அதிக நேரம் பெரும்பாலும் விடை அல்ல.',
      hi: 'थके हुए छह घंटे पढ़ना जागते हुए एक घंटे से कम सिखाता है। ज़्यादा समय उतनी बार जवाब नहीं होता जितना लोग समझते हैं।'
    }
  }
];

/* The bands, so a parent can pick by age rather than by guessing. */
TB.MODERN_BANDS = [
  { id: 'little', en: 'Little ones (5–8)', ta: 'சிறியவர்கள் (5–8)', hi: 'छोटे बच्चे (5–8)' },
  { id: 'middle', en: 'Middle (9–12)', ta: 'நடுநிலை (9–12)', hi: 'मध्य (9–12)' },
  { id: 'older', en: 'Older (13+)', ta: 'பெரியவர்கள் (13+)', hi: 'बड़े (13+)' }
];

TB.MODERN_GROUPS = [
  { id: 'tech', en: 'How machines work', ta: 'இயந்திரங்கள் எப்படி', hi: 'मशीनें कैसे चलती हैं', icon: '\u{1F4BB}' },
  { id: 'ai', en: 'Artificial intelligence', ta: 'செயற்கை நுண்ணறிவு', hi: 'कृत्रिम बुद्धिमत्ता', icon: '\u{1F916}' },
  { id: 'safe', en: 'Staying safe', ta: 'பாதுகாப்பாக இருத்தல்', hi: 'सुरक्षित रहना', icon: '\u{1F6E1}' },
  { id: 'think', en: 'Thinking clearly', ta: 'தெளிவாகச் சிந்தித்தல்', hi: 'साफ़ सोचना', icon: '\u{1F9E9}' },
  { id: 'life', en: 'Life and the world', ta: 'வாழ்வும் உலகமும்', hi: 'जीवन और दुनिया', icon: '\u{1F30D}' }
];
