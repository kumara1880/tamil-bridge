/* Tamil Bridge — additional units, weighted towards Hindi.
   These extend TB.LESSONS. English leads each line, Hindi follows, Tamil is
   the reading aid. Units u11–u18 are everyday communication; u19–u24 are the
   Hindi grammar a Tamil speaker needs to actually build sentences.          */
window.TB = window.TB || {};

TB.LESSONS = (TB.LESSONS || []).concat([

  {
    id: 'u11',
    title: { ta: 'தினசரி வழக்கம்', en: 'Your daily routine' },
    goal: 'Describe your whole day, from waking up to going to bed.',
    grammar: 'Routines use the present simple. In Hindi the verb takes -ता / -ती / -ते plus है / हूँ / हैं, and it must agree with gender: a boy says उठता हूँ, a girl says उठती हूँ.',
    lines: [
      { en: 'I wake up at six o’clock.', hi: 'मैं छह बजे उठता हूँ।', ta: 'நான் ஆறு மணிக்கு எழுகிறேன்.',
        gloss: [['நான்', 'I', 'मैं'], ['ஆறு மணிக்கு', 'at six', 'छह बजे'], ['எழுகிறேன்', 'wake up', 'उठता हूँ']] },
      { en: 'Then I brush my teeth and take a bath.', hi: 'फिर मैं दाँत साफ़ करता हूँ और नहाता हूँ।', ta: 'பிறகு பல் துலக்கி குளிக்கிறேன்.',
        gloss: [['பிறகு', 'then', 'फिर'], ['பல் துலக்கி', 'brush teeth', 'दाँत साफ़ करना'], ['குளிக்கிறேன்', 'take a bath', 'नहाता हूँ']] },
      { en: 'I eat breakfast at eight.', hi: 'मैं आठ बजे नाश्ता करता हूँ।', ta: 'நான் எட்டு மணிக்கு காலை உணவு சாப்பிடுகிறேன்.',
        gloss: [['காலை உணவு', 'breakfast', 'नाश्ता'], ['சாப்பிடுகிறேன்', 'eat', 'करता हूँ']] },
      { en: 'I go to school by bus.', hi: 'मैं बस से स्कूल जाता हूँ।', ta: 'நான் பேருந்தில் பள்ளிக்குச் செல்கிறேன்.',
        gloss: [['பேருந்தில்', 'by bus', 'बस से'], ['பள்ளிக்கு', 'to school', 'स्कूल'], ['செல்கிறேன்', 'go', 'जाता हूँ']] },
      { en: 'In the evening I play with my friends.', hi: 'शाम को मैं अपने दोस्तों के साथ खेलता हूँ।', ta: 'மாலையில் நண்பர்களுடன் விளையாடுகிறேன்.',
        gloss: [['மாலையில்', 'in the evening', 'शाम को'], ['நண்பர்களுடன்', 'with friends', 'दोस्तों के साथ'], ['விளையாடுகிறேன்', 'play', 'खेलता हूँ']] },
      { en: 'I sleep at ten o’clock.', hi: 'मैं दस बजे सोता हूँ।', ta: 'நான் பத்து மணிக்குத் தூங்குகிறேன்.',
        gloss: [['பத்து மணிக்கு', 'at ten', 'दस बजे'], ['தூங்குகிறேன்', 'sleep', 'सोता हूँ']] }
    ],
    quiz: [
      { q: 'A girl says "I go": ', opts: ['मैं जाता हूँ', 'मैं जाती हूँ', 'मैं जाते हैं', 'मैं जाऊँगा'], a: 1, why: 'Feminine takes -ती: जाती हूँ.' },
      { q: '"at six o’clock" in Hindi is —', opts: ['छह बजे', 'छह साल', 'छह बार', 'छह दिन'], a: 0, why: 'बजे marks the hour on a clock.' }
    ]
  },

  {
    id: 'u12',
    title: { ta: 'உணவகத்தில்', en: 'Ordering food' },
    goal: 'Order a meal, ask what something costs, and ask for the bill.',
    grammar: 'To ask for something politely in Hindi use चाहिए ("is wanted"): मुझे पानी चाहिए. Note the subject takes मुझे, not मैं — the thing wanted is the grammatical subject. Tamil does the same with எனக்கு.',
    lines: [
      { en: 'I would like a cup of tea.', hi: 'मुझे एक कप चाय चाहिए।', ta: 'எனக்கு ஒரு கப் தேநீர் வேண்டும்.',
        gloss: [['எனக்கு', 'I would like', 'मुझे'], ['ஒரு கப்', 'a cup', 'एक कप'], ['தேநீர்', 'tea', 'चाय'], ['வேண்டும்', 'want', 'चाहिए']] },
      { en: 'What do you recommend?', hi: 'आप क्या सुझाएँगे?', ta: 'நீங்கள் எதைப் பரிந்துரைக்கிறீர்கள்?',
        gloss: [['எதை', 'what', 'क्या'], ['பரிந்துரைக்கிறீர்கள்', 'recommend', 'सुझाएँगे']] },
      { en: 'Is this dish spicy?', hi: 'क्या यह खाना तीखा है?', ta: 'இந்த உணவு காரமாக இருக்கிறதா?',
        gloss: [['இந்த உணவு', 'this dish', 'यह खाना'], ['காரம்', 'spicy', 'तीखा']] },
      { en: 'Please bring some water.', hi: 'कृपया थोड़ा पानी लाइए।', ta: 'தயவுசெய்து கொஞ்சம் தண்ணீர் கொண்டு வாருங்கள்.',
        gloss: [['கொஞ்சம்', 'some', 'थोड़ा'], ['தண்ணீர்', 'water', 'पानी'], ['கொண்டு வாருங்கள்', 'bring', 'लाइए']] },
      { en: 'The food was very tasty.', hi: 'खाना बहुत स्वादिष्ट था।', ta: 'உணவு மிகவும் சுவையாக இருந்தது.',
        gloss: [['உணவு', 'the food', 'खाना'], ['மிகவும்', 'very', 'बहुत'], ['சுவையான', 'tasty', 'स्वादिष्ट']] },
      { en: 'Can I have the bill, please?', hi: 'क्या मुझे बिल मिल सकता है?', ta: 'ரசீது கிடைக்குமா?',
        gloss: [['ரசீது', 'the bill', 'बिल'], ['கிடைக்குமா', 'can I have', 'मिल सकता है']] }
    ],
    quiz: [
      { q: '"I want water" in Hindi starts with —', opts: ['मैं', 'मुझे', 'मेरा', 'मैंने'], a: 1, why: 'चाहिए takes मुझे, not मैं.' },
      { q: '"तीखा" means —', opts: ['sweet', 'spicy', 'cold', 'cheap'], a: 1, why: 'तीखा = spicy / hot with chilli.' }
    ]
  },

  {
    id: 'u13',
    title: { ta: 'கடையில் பேரம்', en: 'Shopping and bargaining' },
    goal: 'Ask prices, bargain, and buy what you need.',
    grammar: 'Hindi comparatives use से: यह उससे सस्ता है ("this is cheaper than that"). There is no separate word for "than" — से does the job, placed after the thing compared. Tamil uses -விட the same way.',
    lines: [
      { en: 'How much does this cost?', hi: 'यह कितने का है?', ta: 'இதன் விலை என்ன?',
        gloss: [['இதன் விலை', 'the price of this', 'यह कितने का'], ['என்ன', 'what', 'क्या']] },
      { en: 'That is too expensive.', hi: 'यह बहुत महँगा है।', ta: 'அது மிகவும் விலை அதிகம்.',
        gloss: [['மிகவும்', 'too / very', 'बहुत'], ['விலை அதிகம்', 'expensive', 'महँगा']] },
      { en: 'Please reduce the price a little.', hi: 'थोड़ा दाम कम कीजिए।', ta: 'கொஞ்சம் விலையைக் குறையுங்கள்.',
        gloss: [['கொஞ்சம்', 'a little', 'थोड़ा'], ['விலை', 'price', 'दाम'], ['குறையுங்கள்', 'reduce', 'कम कीजिए']] },
      { en: 'This one is cheaper than that one.', hi: 'यह उससे सस्ता है।', ta: 'இது அதைவிட மலிவானது.',
        gloss: [['இது', 'this', 'यह'], ['அதைவிட', 'than that', 'उससे'], ['மலிவானது', 'cheaper', 'सस्ता']] },
      { en: 'Do you have a smaller size?', hi: 'क्या आपके पास छोटा साइज़ है?', ta: 'சிறிய அளவு இருக்கிறதா?',
        gloss: [['சிறிய', 'smaller', 'छोटा'], ['அளவு', 'size', 'साइज़'], ['இருக்கிறதா', 'do you have', 'है']] },
      { en: 'I will take two of these.', hi: 'मैं इनमें से दो लूँगा।', ta: 'இதில் இரண்டு எடுத்துக்கொள்கிறேன்.',
        gloss: [['இரண்டு', 'two', 'दो'], ['எடுத்துக்கொள்கிறேன்', 'will take', 'लूँगा']] }
    ],
    quiz: [
      { q: '"cheaper than that" in Hindi is —', opts: ['उससे सस्ता', 'सस्ता से उस', 'से उससे सस्ता', 'सस्ता उस'], a: 0, why: 'से comes after the thing compared: उससे सस्ता.' },
      { q: '"दाम कम कीजिए" means —', opts: ['increase the price', 'reduce the price', 'pay the price', 'ask the price'], a: 1, why: 'कम = less, कीजिए = please do.' }
    ]
  },

  {
    id: 'u14',
    title: { ta: 'வழி கேட்பது', en: 'Asking for directions' },
    goal: 'Find your way, and give directions to someone else.',
    grammar: 'Hindi puts the place first and the postposition after it: स्टेशन के पास ("near the station"). English is the other way round. Tamil matches Hindi, so the order will feel natural to you.',
    lines: [
      { en: 'Where is the railway station?', hi: 'रेलवे स्टेशन कहाँ है?', ta: 'ரயில் நிலையம் எங்கே இருக்கிறது?',
        gloss: [['ரயில் நிலையம்', 'railway station', 'रेलवे स्टेशन'], ['எங்கே', 'where', 'कहाँ']] },
      { en: 'Go straight and then turn left.', hi: 'सीधे जाइए और फिर बाएँ मुड़िए।', ta: 'நேராகச் சென்று இடதுபுறம் திரும்புங்கள்.',
        gloss: [['நேராக', 'straight', 'सीधे'], ['இடதுபுறம்', 'left', 'बाएँ'], ['திரும்புங்கள்', 'turn', 'मुड़िए']] },
      { en: 'It is near the hospital.', hi: 'यह अस्पताल के पास है।', ta: 'அது மருத்துவமனைக்கு அருகில் உள்ளது.',
        gloss: [['மருத்துவமனை', 'hospital', 'अस्पताल'], ['அருகில்', 'near', 'के पास']] },
      { en: 'How far is it from here?', hi: 'यहाँ से कितनी दूर है?', ta: 'இங்கிருந்து எவ்வளவு தூரம்?',
        gloss: [['இங்கிருந்து', 'from here', 'यहाँ से'], ['எவ்வளவு தூரம்', 'how far', 'कितनी दूर']] },
      { en: 'It takes about ten minutes on foot.', hi: 'पैदल लगभग दस मिनट लगते हैं।', ta: 'நடந்து சுமார் பத்து நிமிடம் ஆகும்.',
        gloss: [['நடந்து', 'on foot', 'पैदल'], ['சுமார்', 'about', 'लगभग'], ['பத்து நிமிடம்', 'ten minutes', 'दस मिनट']] },
      { en: 'Which bus goes to the airport?', hi: 'कौन सी बस हवाई अड्डे जाती है?', ta: 'எந்தப் பேருந்து விமான நிலையம் செல்லும்?',
        gloss: [['எந்த', 'which', 'कौन सी'], ['பேருந்து', 'bus', 'बस'], ['விமான நிலையம்', 'airport', 'हवाई अड्डा']] }
    ],
    quiz: [
      { q: '"near the station" in Hindi is —', opts: ['के पास स्टेशन', 'स्टेशन के पास', 'पास स्टेशन के', 'स्टेशन पास'], a: 1, why: 'The place comes first, the postposition after.' },
      { q: '"बाएँ" means —', opts: ['right', 'left', 'straight', 'back'], a: 1, why: 'बाएँ = left; दाएँ = right.' }
    ]
  },

  {
    id: 'u15',
    title: { ta: 'மருத்துவரிடம்', en: 'At the doctor' },
    goal: 'Explain what hurts and understand the advice you are given.',
    grammar: 'For pain and illness Hindi uses को: मुझे बुखार है ("I have a fever"), literally "to me there is fever". Tamil does exactly the same with எனக்கு. English instead says "I have".',
    lines: [
      { en: 'I am not feeling well.', hi: 'मेरी तबीयत ठीक नहीं है।', ta: 'எனக்கு உடல்நிலை சரியில்லை.',
        gloss: [['உடல்நிலை', 'health', 'तबीयत'], ['சரியில்லை', 'not well', 'ठीक नहीं']] },
      { en: 'I have a fever and a headache.', hi: 'मुझे बुखार और सिरदर्द है।', ta: 'எனக்குக் காய்ச்சலும் தலைவலியும் இருக்கிறது.',
        gloss: [['எனக்கு', 'I have', 'मुझे'], ['காய்ச்சல்', 'fever', 'बुखार'], ['தலைவலி', 'headache', 'सिरदर्द']] },
      { en: 'It has been hurting for two days.', hi: 'दो दिन से दर्द हो रहा है।', ta: 'இரண்டு நாட்களாக வலிக்கிறது.',
        gloss: [['இரண்டு நாட்களாக', 'for two days', 'दो दिन से'], ['வலிக்கிறது', 'is hurting', 'दर्द हो रहा है']] },
      { en: 'Take this medicine twice a day.', hi: 'यह दवा दिन में दो बार लीजिए।', ta: 'இந்த மருந்தை நாளொன்றுக்கு இரண்டு முறை எடுத்துக்கொள்ளுங்கள்.',
        gloss: [['மருந்து', 'medicine', 'दवा'], ['இரண்டு முறை', 'twice', 'दो बार'], ['நாளில்', 'a day', 'दिन में']] },
      { en: 'You should rest for a few days.', hi: 'आपको कुछ दिन आराम करना चाहिए।', ta: 'நீங்கள் சில நாட்கள் ஓய்வு எடுக்க வேண்டும்.',
        gloss: [['சில நாட்கள்', 'a few days', 'कुछ दिन'], ['ஓய்வு', 'rest', 'आराम'], ['வேண்டும்', 'should', 'चाहिए']] },
      { en: 'Drink plenty of water.', hi: 'खूब पानी पीजिए।', ta: 'நிறைய தண்ணீர் குடியுங்கள்.',
        gloss: [['நிறைய', 'plenty', 'खूब'], ['தண்ணீர்', 'water', 'पानी'], ['குடியுங்கள்', 'drink', 'पीजिए']] }
    ],
    quiz: [
      { q: '"I have a fever" in Hindi is —', opts: ['मैं बुखार है', 'मुझे बुखार है', 'मेरा बुखार हूँ', 'मैंने बुखार है'], a: 1, why: 'Illness takes मुझे, matching Tamil எனக்கு.' },
      { q: '"दो बार" means —', opts: ['two days', 'twice', 'two hours', 'second'], a: 1, why: 'बार = times, so दो बार = twice.' }
    ]
  },

  {
    id: 'u16',
    title: { ta: 'தொலைபேசி உரையாடல்', en: 'On the phone' },
    goal: 'Make and answer a phone call confidently.',
    grammar: 'Hindi marks politeness through the verb ending: बोलिए (polite) versus बोल (blunt). With strangers always use the आप forms — कीजिए, बोलिए, बताइए.',
    lines: [
      { en: 'Hello, who is speaking?', hi: 'नमस्ते, कौन बोल रहा है?', ta: 'வணக்கம், யார் பேசுகிறீர்கள்?',
        gloss: [['யார்', 'who', 'कौन'], ['பேசுகிறீர்கள்', 'is speaking', 'बोल रहा है']] },
      { en: 'May I speak to Ravi?', hi: 'क्या मैं रवि से बात कर सकता हूँ?', ta: 'ரவியிடம் பேசலாமா?',
        gloss: [['ரவியிடம்', 'to Ravi', 'रवि से'], ['பேசலாமா', 'may I speak', 'बात कर सकता हूँ']] },
      { en: 'Please hold for a moment.', hi: 'कृपया एक मिनट रुकिए।', ta: 'தயவுசெய்து ஒரு நிமிடம் காத்திருங்கள்.',
        gloss: [['ஒரு நிமிடம்', 'a moment', 'एक मिनट'], ['காத்திருங்கள்', 'hold / wait', 'रुकिए']] },
      { en: 'I cannot hear you clearly.', hi: 'मुझे आपकी आवाज़ साफ़ नहीं आ रही।', ta: 'உங்கள் குரல் தெளிவாகக் கேட்கவில்லை.',
        gloss: [['குரல்', 'voice', 'आवाज़'], ['தெளிவாக', 'clearly', 'साफ़'], ['கேட்கவில்லை', 'cannot hear', 'नहीं आ रही']] },
      { en: 'I will call you back later.', hi: 'मैं आपको बाद में फ़ोन करूँगा।', ta: 'நான் பிறகு உங்களை அழைக்கிறேன்.',
        gloss: [['பிறகு', 'later', 'बाद में'], ['அழைக்கிறேன்', 'will call', 'फ़ोन करूँगा']] },
      { en: 'Please send me a message.', hi: 'कृपया मुझे संदेश भेजिए।', ta: 'தயவுசெய்து எனக்கு செய்தி அனுப்புங்கள்.',
        gloss: [['செய்தி', 'message', 'संदेश'], ['அனுப்புங்கள்', 'send', 'भेजिए']] }
    ],
    quiz: [
      { q: 'The polite way to say "speak" to a stranger is —', opts: ['बोल', 'बोलो', 'बोलिए', 'बोला'], a: 2, why: 'The -इए ending is the polite आप form.' },
      { q: '"बाद में" means —', opts: ['before', 'later', 'now', 'never'], a: 1, why: 'बाद = after, so बाद में = later.' }
    ]
  },

  {
    id: 'u17',
    title: { ta: 'வானிலை', en: 'Weather and seasons' },
    goal: 'Talk about the weather and the seasons.',
    grammar: 'Weather in Hindi often uses रहा है for something in progress: बारिश हो रही है ("it is raining"). There is no "it" — Hindi simply names the thing that is happening.',
    lines: [
      { en: 'It is raining outside.', hi: 'बाहर बारिश हो रही है।', ta: 'வெளியே மழை பெய்கிறது.',
        gloss: [['வெளியே', 'outside', 'बाहर'], ['மழை', 'rain', 'बारिश'], ['பெய்கிறது', 'is falling', 'हो रही है']] },
      { en: 'Today is very hot.', hi: 'आज बहुत गरमी है।', ta: 'இன்று மிகவும் வெப்பமாக இருக்கிறது.',
        gloss: [['இன்று', 'today', 'आज'], ['வெப்பம்', 'heat', 'गरमी']] },
      { en: 'It is cold in winter.', hi: 'सर्दियों में ठंड होती है।', ta: 'குளிர்காலத்தில் குளிராக இருக்கும்.',
        gloss: [['குளிர்காலம்', 'winter', 'सर्दियाँ'], ['குளிர்', 'cold', 'ठंड']] },
      { en: 'The sky is cloudy today.', hi: 'आज आसमान में बादल हैं।', ta: 'இன்று வானத்தில் மேகம் உள்ளது.',
        gloss: [['வானம்', 'sky', 'आसमान'], ['மேகம்', 'cloud', 'बादल']] },
      { en: 'I like the rainy season.', hi: 'मुझे बरसात का मौसम पसंद है।', ta: 'எனக்கு மழைக்காலம் பிடிக்கும்.',
        gloss: [['மழைக்காலம்', 'rainy season', 'बरसात का मौसम'], ['பிடிக்கும்', 'like', 'पसंद है']] },
      { en: 'Take an umbrella with you.', hi: 'अपने साथ छाता ले जाइए।', ta: 'உங்களுடன் குடையை எடுத்துச் செல்லுங்கள்.',
        gloss: [['குடை', 'umbrella', 'छाता'], ['உங்களுடன்', 'with you', 'अपने साथ']] }
    ],
    quiz: [
      { q: '"It is raining" in Hindi is —', opts: ['यह बारिश है', 'बारिश हो रही है', 'बारिश है यह', 'बारिश करता है'], a: 1, why: 'Hindi names the event; there is no "it".' },
      { q: '"मौसम" means —', opts: ['month', 'season / weather', 'morning', 'moon'], a: 1, why: 'मौसम = weather or season.' }
    ]
  },

  {
    id: 'u18',
    title: { ta: 'கருத்து சொல்வது', en: 'Opinions and feelings' },
    goal: 'Say what you think and how you feel, and agree or disagree.',
    grammar: 'Liking in Hindi is expressed with पसंद: मुझे यह पसंद है — literally "to me this is pleasing". The thing liked is the subject, so the verb agrees with it, not with you. Tamil behaves the same way with பிடிக்கும்.',
    lines: [
      { en: 'I think this is a good idea.', hi: 'मुझे लगता है कि यह अच्छा विचार है।', ta: 'இது நல்ல யோசனை என்று நினைக்கிறேன்.',
        gloss: [['நினைக்கிறேன்', 'I think', 'मुझे लगता है'], ['நல்ல யோசனை', 'good idea', 'अच्छा विचार']] },
      { en: 'I like this song very much.', hi: 'मुझे यह गाना बहुत पसंद है।', ta: 'எனக்கு இந்தப் பாடல் மிகவும் பிடிக்கும்.',
        gloss: [['எனக்கு', 'to me', 'मुझे'], ['பாடல்', 'song', 'गाना'], ['பிடிக்கும்', 'is pleasing', 'पसंद है']] },
      { en: 'I do not agree with you.', hi: 'मैं आपसे सहमत नहीं हूँ।', ta: 'நான் உங்களுடன் உடன்படவில்லை.',
        gloss: [['உங்களுடன்', 'with you', 'आपसे'], ['உடன்படவில்லை', 'do not agree', 'सहमत नहीं']] },
      { en: 'That makes me happy.', hi: 'इससे मुझे खुशी होती है।', ta: 'அது எனக்கு மகிழ்ச்சி தருகிறது.',
        gloss: [['அது', 'that', 'इससे'], ['மகிழ்ச்சி', 'happiness', 'खुशी']] },
      { en: 'I am a little worried.', hi: 'मैं थोड़ा चिंतित हूँ।', ta: 'நான் கொஞ்சம் கவலையாக இருக்கிறேன்.',
        gloss: [['கொஞ்சம்', 'a little', 'थोड़ा'], ['கவலை', 'worry', 'चिंता']] },
      { en: 'What do you think about it?', hi: 'आप इसके बारे में क्या सोचते हैं?', ta: 'இதைப் பற்றி நீங்கள் என்ன நினைக்கிறீர்கள்?',
        gloss: [['இதைப் பற்றி', 'about it', 'इसके बारे में'], ['நினைக்கிறீர்கள்', 'do you think', 'सोचते हैं']] }
    ],
    quiz: [
      { q: '"I like this" in Hindi is —', opts: ['मैं यह पसंद करता', 'मुझे यह पसंद है', 'मेरा यह पसंद', 'मैंने यह पसंद'], a: 1, why: 'पसंद takes मुझे — the thing liked is the subject.' },
      { q: '"सहमत" means —', opts: ['angry', 'agreed', 'sad', 'ready'], a: 1, why: 'सहमत होना = to agree.' }
    ]
  },

  {
    id: 'u19',
    title: { ta: 'இந்தி பின்னொட்டுகள்', en: 'Hindi postpositions' },
    goal: 'Master ने को से में पर का — the small words that hold Hindi together.',
    grammar: 'Hindi postpositions work like Tamil case endings, just written separately: को = -ஐ/-க்கு, से = -இலிருந்து/-ஆல், में = -இல், पर = -மீது, का/की/के = -இன். The one with no Tamil equivalent is ने, which marks the subject of a completed action that has an object: मैंने खाना खाया.',
    lines: [
      { en: 'I gave the book to Ravi.', hi: 'मैंने रवि को किताब दी।', ta: 'நான் ரவிக்கு புத்தகம் கொடுத்தேன்.',
        gloss: [['ரவிக்கு', 'to Ravi', 'रवि को'], ['புத்தகம்', 'book', 'किताब'], ['கொடுத்தேன்', 'gave', 'दी']] },
      { en: 'I came from Chennai.', hi: 'मैं चेन्नई से आया।', ta: 'நான் சென்னையிலிருந்து வந்தேன்.',
        gloss: [['சென்னையிலிருந்து', 'from Chennai', 'चेन्नई से'], ['வந்தேன்', 'came', 'आया']] },
      { en: 'The book is in the bag.', hi: 'किताब बैग में है।', ta: 'புத்தகம் பையில் உள்ளது.',
        gloss: [['பையில்', 'in the bag', 'बैग में'], ['உள்ளது', 'is', 'है']] },
      { en: 'The cup is on the table.', hi: 'कप मेज़ पर है।', ta: 'கோப்பை மேசையில் உள்ளது.',
        gloss: [['மேசையில்', 'on the table', 'मेज़ पर'], ['கோப்பை', 'cup', 'कप']] },
      { en: 'This is my brother’s house.', hi: 'यह मेरे भाई का घर है।', ta: 'இது என் அண்ணனின் வீடு.',
        gloss: [['அண்ணனின்', 'brother’s', 'भाई का'], ['வீடு', 'house', 'घर']] },
      { en: 'I ate the food.', hi: 'मैंने खाना खाया।', ta: 'நான் உணவு சாப்பிட்டேன்.',
        gloss: [['நான்', 'I (with ने)', 'मैंने'], ['உணவு', 'food', 'खाना'], ['சாப்பிட்டேன்', 'ate', 'खाया']] }
    ],
    quiz: [
      { q: 'Which postposition means "in"?', opts: ['पर', 'से', 'में', 'को'], a: 2, why: 'में = in, inside.' },
      { q: 'Why is it मैंने and not मैं in "मैंने खाना खाया"?', opts: ['It is plural', 'Completed past action with an object', 'It is polite', 'It is future'], a: 1, why: 'ने marks the subject of a completed action that has an object.' }
    ]
  },

  {
    id: 'u20',
    title: { ta: 'இந்தி வினை இணைப்பு', en: 'Hindi verb endings' },
    goal: 'Change any Hindi verb for person, gender and tense.',
    grammar: 'Every Hindi verb ends in -ना in the dictionary. Remove it and add the ending: present करता/करती/करते + है/हूँ/हैं, past किया/की/किए, future करूँगा/करूँगी/करेंगे. Tamil changes for person but not gender — Hindi changes for both, which is the part to watch.',
    lines: [
      { en: 'I do this work every day.', hi: 'मैं यह काम रोज़ करता हूँ।', ta: 'நான் இந்த வேலையை தினமும் செய்கிறேன்.',
        gloss: [['தினமும்', 'every day', 'रोज़'], ['செய்கிறேன்', 'I do (m)', 'करता हूँ']] },
      { en: 'She does this work every day.', hi: 'वह यह काम रोज़ करती है।', ta: 'அவள் இந்த வேலையை தினமும் செய்கிறாள்.',
        gloss: [['அவள்', 'she', 'वह'], ['செய்கிறாள்', 'she does (f)', 'करती है']] },
      { en: 'They do this work every day.', hi: 'वे यह काम रोज़ करते हैं।', ta: 'அவர்கள் இந்த வேலையை தினமும் செய்கிறார்கள்.',
        gloss: [['அவர்கள்', 'they', 'वे'], ['செய்கிறார்கள்', 'they do', 'करते हैं']] },
      { en: 'I did this work yesterday.', hi: 'मैंने कल यह काम किया।', ta: 'நான் நேற்று இந்த வேலையைச் செய்தேன்.',
        gloss: [['நேற்று', 'yesterday', 'कल'], ['செய்தேன்', 'I did', 'किया']] },
      { en: 'I will do this work tomorrow.', hi: 'मैं कल यह काम करूँगा।', ta: 'நான் நாளை இந்த வேலையைச் செய்வேன்.',
        gloss: [['நாளை', 'tomorrow', 'कल'], ['செய்வேன்', 'I will do (m)', 'करूँगा']] },
      { en: 'I am doing this work now.', hi: 'मैं अभी यह काम कर रहा हूँ।', ta: 'நான் இப்போது இந்த வேலையைச் செய்து கொண்டிருக்கிறேன்.',
        gloss: [['இப்போது', 'now', 'अभी'], ['செய்து கொண்டிருக்கிறேன்', 'am doing', 'कर रहा हूँ']] }
    ],
    quiz: [
      { q: 'A woman says "I will do": ', opts: ['करूँगा', 'करूँगी', 'करेंगे', 'किया'], a: 1, why: 'Feminine future takes -ऊँगी.' },
      { q: 'The dictionary form of every Hindi verb ends in —', opts: ['-ता', '-ना', '-है', '-गा'], a: 1, why: 'करना, जाना, खाना — always -ना.' }
    ]
  },

  {
    id: 'u21',
    title: { ta: 'ஒப்பீடு', en: 'Comparing things' },
    goal: 'Say bigger, smaller, best and worst in both languages.',
    grammar: 'English adds -er and -est (big, bigger, biggest) or uses more / most for longer words. Hindi has no such endings at all — it uses से for "than" and सबसे ("than all") for "most". So सबसे बड़ा literally means "bigger than all".',
    lines: [
      { en: 'This book is bigger than that one.', hi: 'यह किताब उससे बड़ी है।', ta: 'இந்தப் புத்தகம் அதைவிட பெரியது.',
        gloss: [['அதைவிட', 'than that', 'उससे'], ['பெரியது', 'bigger', 'बड़ी']] },
      { en: 'This is the biggest room in the house.', hi: 'यह घर का सबसे बड़ा कमरा है।', ta: 'இது வீட்டின் மிகப் பெரிய அறை.',
        gloss: [['மிகப் பெரிய', 'biggest', 'सबसे बड़ा'], ['அறை', 'room', 'कमरा']] },
      { en: 'Hindi is easier than I thought.', hi: 'हिंदी मेरी सोच से आसान है।', ta: 'நான் நினைத்ததைவிட இந்தி எளிது.',
        gloss: [['நினைத்ததைவிட', 'than I thought', 'सोच से'], ['எளிது', 'easy', 'आसान']] },
      { en: 'She speaks better than me.', hi: 'वह मुझसे अच्छा बोलती है।', ta: 'அவள் என்னைவிட நன்றாகப் பேசுகிறாள்.',
        gloss: [['என்னைவிட', 'than me', 'मुझसे'], ['நன்றாக', 'better', 'अच्छा']] },
      { en: 'This is my best friend.', hi: 'यह मेरा सबसे अच्छा दोस्त है।', ta: 'இவன் என் மிக நல்ல நண்பன்.',
        gloss: [['மிக நல்ல', 'best', 'सबसे अच्छा'], ['நண்பன்', 'friend', 'दोस्त']] },
      { en: 'Today is colder than yesterday.', hi: 'आज कल से ज़्यादा ठंडा है।', ta: 'இன்று நேற்றைவிட குளிராக இருக்கிறது.',
        gloss: [['நேற்றைவிட', 'than yesterday', 'कल से'], ['ज़्यादा', 'more', 'ज़्यादा']] }
    ],
    quiz: [
      { q: '"the biggest" in Hindi is —', opts: ['बड़ा', 'बड़ी', 'सबसे बड़ा', 'बहुत बड़ा'], a: 2, why: 'सबसे = "than all", which makes the superlative.' },
      { q: 'English superlative of "good" is —', opts: ['goodest', 'more good', 'best', 'better'], a: 2, why: 'good → better → best, an irregular set.' }
    ]
  },

  {
    id: 'u22',
    title: { ta: 'திட்டம் போடுதல்', en: 'Making plans' },
    goal: 'Invite someone, accept, refuse politely and fix a time.',
    grammar: 'To suggest something in Hindi use चलो / चलिए ("let us go") or the -ना form with चाहिए. English uses "shall we", "let’s" or "would you like to".',
    lines: [
      { en: 'Shall we go to the park?', hi: 'क्या हम पार्क चलें?', ta: 'நாம் பூங்காவுக்குப் போகலாமா?',
        gloss: [['நாம்', 'we', 'हम'], ['பூங்கா', 'park', 'पार्क'], ['போகலாமா', 'shall we go', 'चलें']] },
      { en: 'Would you like to come with us?', hi: 'क्या आप हमारे साथ चलना चाहेंगे?', ta: 'எங்களுடன் வர விரும்புகிறீர்களா?',
        gloss: [['எங்களுடன்', 'with us', 'हमारे साथ'], ['விரும்புகிறீர்களா', 'would you like', 'चाहेंगे']] },
      { en: 'Yes, that sounds good.', hi: 'हाँ, यह अच्छा रहेगा।', ta: 'ஆம், அது நன்றாக இருக்கும்.',
        gloss: [['ஆம்', 'yes', 'हाँ'], ['நன்றாக இருக்கும்', 'sounds good', 'अच्छा रहेगा']] },
      { en: 'Sorry, I am busy today.', hi: 'माफ़ कीजिए, मैं आज व्यस्त हूँ।', ta: 'மன்னிக்கவும், இன்று நான் வேலையாக இருக்கிறேன்.',
        gloss: [['மன்னிக்கவும்', 'sorry', 'माफ़ कीजिए'], ['வேலையாக', 'busy', 'व्यस्त']] },
      { en: 'What time shall we meet?', hi: 'हम कितने बजे मिलें?', ta: 'நாம் எத்தனை மணிக்குச் சந்திப்போம்?',
        gloss: [['எத்தனை மணிக்கு', 'what time', 'कितने बजे'], ['சந்திப்போம்', 'shall we meet', 'मिलें']] },
      { en: 'See you tomorrow then.', hi: 'तो कल मिलते हैं।', ta: 'அப்படியானால் நாளை சந்திப்போம்.',
        gloss: [['அப்படியானால்', 'then', 'तो'], ['நாளை', 'tomorrow', 'कल']] }
    ],
    quiz: [
      { q: '"Shall we go?" in Hindi is —', opts: ['हम जाते हैं', 'क्या हम चलें?', 'हम गए', 'हम जाएगा'], a: 1, why: 'The -ें ending suggests rather than states.' },
      { q: '"व्यस्त" means —', opts: ['free', 'busy', 'tired', 'happy'], a: 1, why: 'व्यस्त = busy.' }
    ]
  }

]);
