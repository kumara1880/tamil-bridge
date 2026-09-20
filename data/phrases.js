/* Tamil Bridge — everyday phrasebook.
   Ready-made sentences for real situations. Learning whole phrases is the
   fastest route to speaking: you can use one the moment you have heard it,
   long before you could build it from grammar.

   Only en / hi / ta are stored. Both Hindi readings — roman letters and Tamil
   letters — are generated at display time by TB.Translit, so this file stays
   short enough to keep accurate.                                            */
window.TB = window.TB || {};

TB.PHRASE_GROUPS = [
  { id: 'greet',    en: 'Greetings',            ta: 'வணக்கங்கள்',        icon: '🙏' },
  { id: 'intro',    en: 'Introducing yourself', ta: 'அறிமுகம்',          icon: '👋' },
  { id: 'polite',   en: 'Being polite',         ta: 'பணிவு',             icon: '🤝' },
  { id: 'yesno',    en: 'Yes, no, maybe',       ta: 'ஆம் / இல்லை',       icon: '✅' },
  { id: 'help',     en: 'Asking for help',      ta: 'உதவி கேட்பது',      icon: '🆘' },
  { id: 'understand', en: 'When you do not understand', ta: 'புரியவில்லை', icon: '❓' },
  { id: 'smalltalk', en: 'Small talk',          ta: 'சிறு உரையாடல்',     icon: '💬' },
  { id: 'time',     en: 'Time and dates',       ta: 'நேரம்',             icon: '🕐' },
  { id: 'directions', en: 'Directions',         ta: 'வழி',               icon: '🧭' },
  { id: 'transport', en: 'Buses, trains, autos', ta: 'போக்குவரத்து',     icon: '🚌' },
  { id: 'shop',     en: 'Shopping',             ta: 'கடை',               icon: '🛍️' },
  { id: 'money',    en: 'Money and paying',     ta: 'பணம்',              icon: '💰' },
  { id: 'food',     en: 'Food and restaurants', ta: 'உணவு',              icon: '🍽️' },
  { id: 'stay',     en: 'Hotels and staying',   ta: 'தங்குமிடம்',        icon: '🏨' },
  { id: 'health',   en: 'Health and emergency', ta: 'உடல்நலம்',          icon: '🏥' },
  { id: 'family',   en: 'Family and people',    ta: 'குடும்பம்',         icon: '👨‍👩‍👧' },
  { id: 'work',     en: 'Work and office',      ta: 'வேலை',              icon: '💼' },
  { id: 'study',    en: 'School and study',     ta: 'படிப்பு',           icon: '📚' },
  { id: 'phone',    en: 'Phone and internet',   ta: 'தொலைபேசி',          icon: '📱' },
  { id: 'feelings', en: 'Feelings',             ta: 'உணர்வுகள்',         icon: '😊' },
  { id: 'opinion',  en: 'Opinions and agreeing', ta: 'கருத்து',          icon: '🗣️' },
  { id: 'plans',    en: 'Invitations and plans', ta: 'திட்டம்',          icon: '📅' },
  { id: 'problem',  en: 'Problems and apologies', ta: 'பிரச்சினை',       icon: '⚠️' },
  { id: 'praise',   en: 'Encouraging someone',  ta: 'பாராட்டு',          icon: '👏' },
  { id: 'home',     en: 'Around the house',     ta: 'வீட்டில்',          icon: '🏠' }
];

TB.PHRASES = [
  /* ---------------- greetings ---------------- */
  { g: 'greet', en: 'Hello.', hi: 'नमस्ते।', ta: 'வணக்கம்.' },
  { g: 'greet', en: 'Good morning.', hi: 'सुप्रभात।', ta: 'காலை வணக்கம்.' },
  { g: 'greet', en: 'Good evening.', hi: 'शुभ संध्या।', ta: 'மாலை வணக்கம்.' },
  { g: 'greet', en: 'Good night.', hi: 'शुभ रात्रि।', ta: 'இனிய இரவு.' },
  { g: 'greet', en: 'How are you?', hi: 'आप कैसे हैं?', ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?' },
  { g: 'greet', en: 'I am fine, thank you.', hi: 'मैं ठीक हूँ, धन्यवाद।', ta: 'நான் நலம், நன்றி.' },
  { g: 'greet', en: 'And you?', hi: 'और आप?', ta: 'நீங்கள்?' },
  { g: 'greet', en: 'Long time no see.', hi: 'बहुत दिनों बाद मिले।', ta: 'நீண்ட நாட்களுக்குப் பிறகு.' },
  { g: 'greet', en: 'Goodbye.', hi: 'अलविदा।', ta: 'போய் வருகிறேன்.' },
  { g: 'greet', en: 'See you later.', hi: 'फिर मिलते हैं।', ta: 'பிறகு சந்திப்போம்.' },
  { g: 'greet', en: 'Take care.', hi: 'अपना ध्यान रखिए।', ta: 'உங்களைக் கவனித்துக்கொள்ளுங்கள்.' },
  { g: 'greet', en: 'Welcome.', hi: 'आपका स्वागत है।', ta: 'வரவேற்கிறேன்.' },

  /* ---------------- introductions ---------------- */
  { g: 'intro', en: 'My name is Kumar.', hi: 'मेरा नाम कुमार है।', ta: 'என் பெயர் குமார்.' },
  { g: 'intro', en: 'What is your name?', hi: 'आपका नाम क्या है?', ta: 'உங்கள் பெயர் என்ன?' },
  { g: 'intro', en: 'Nice to meet you.', hi: 'आपसे मिलकर खुशी हुई।', ta: 'உங்களைச் சந்தித்ததில் மகிழ்ச்சி.' },
  { g: 'intro', en: 'I am from Tamil Nadu.', hi: 'मैं तमिलनाडु से हूँ।', ta: 'நான் தமிழ்நாட்டைச் சேர்ந்தவன்.' },
  { g: 'intro', en: 'Where are you from?', hi: 'आप कहाँ से हैं?', ta: 'நீங்கள் எங்கிருந்து வருகிறீர்கள்?' },
  { g: 'intro', en: 'I am learning Hindi.', hi: 'मैं हिंदी सीख रहा हूँ।', ta: 'நான் இந்தி கற்று வருகிறேன்.' },
  { g: 'intro', en: 'I speak a little Hindi.', hi: 'मैं थोड़ी हिंदी बोलता हूँ।', ta: 'நான் கொஞ்சம் இந்தி பேசுவேன்.' },
  { g: 'intro', en: 'My mother tongue is Tamil.', hi: 'मेरी मातृभाषा तमिल है।', ta: 'என் தாய்மொழி தமிழ்.' },
  { g: 'intro', en: 'How old are you?', hi: 'आपकी उम्र क्या है?', ta: 'உங்கள் வயது என்ன?' },
  { g: 'intro', en: 'What do you do?', hi: 'आप क्या काम करते हैं?', ta: 'நீங்கள் என்ன வேலை செய்கிறீர்கள்?' },

  /* ---------------- polite ---------------- */
  { g: 'polite', en: 'Please.', hi: 'कृपया।', ta: 'தயவுசெய்து.' },
  { g: 'polite', en: 'Thank you.', hi: 'धन्यवाद।', ta: 'நன்றி.' },
  { g: 'polite', en: 'Thank you very much.', hi: 'बहुत बहुत धन्यवाद।', ta: 'மிக்க நன்றி.' },
  { g: 'polite', en: 'You are welcome.', hi: 'कोई बात नहीं।', ta: 'பரவாயில்லை.' },
  { g: 'polite', en: 'Excuse me.', hi: 'सुनिए।', ta: 'மன்னிக்கவும்.' },
  { g: 'polite', en: 'Sorry.', hi: 'माफ़ कीजिए।', ta: 'மன்னிக்கவும்.' },
  { g: 'polite', en: 'No problem.', hi: 'कोई समस्या नहीं।', ta: 'பிரச்சினை இல்லை.' },
  { g: 'polite', en: 'After you.', hi: 'आप पहले।', ta: 'நீங்கள் முதலில்.' },
  { g: 'polite', en: 'May I come in?', hi: 'क्या मैं अंदर आ सकता हूँ?', ta: 'நான் உள்ளே வரலாமா?' },
  { g: 'polite', en: 'Please sit down.', hi: 'कृपया बैठिए।', ta: 'தயவுசெய்து உட்காருங்கள்.' },

  /* ---------------- yes / no ---------------- */
  { g: 'yesno', en: 'Yes.', hi: 'हाँ।', ta: 'ஆம்.' },
  { g: 'yesno', en: 'No.', hi: 'नहीं।', ta: 'இல்லை.' },
  { g: 'yesno', en: 'Maybe.', hi: 'शायद।', ta: 'ஒருவேளை.' },
  { g: 'yesno', en: 'Of course.', hi: 'ज़रूर।', ta: 'நிச்சயமாக.' },
  { g: 'yesno', en: 'I do not know.', hi: 'मुझे नहीं पता।', ta: 'எனக்குத் தெரியாது.' },
  { g: 'yesno', en: 'I think so.', hi: 'मुझे ऐसा लगता है।', ta: 'அப்படித்தான் நினைக்கிறேன்.' },
  { g: 'yesno', en: 'That is right.', hi: 'यह सही है।', ta: 'அது சரி.' },
  { g: 'yesno', en: 'That is wrong.', hi: 'यह ग़लत है।', ta: 'அது தவறு.' },
  { g: 'yesno', en: 'It does not matter.', hi: 'कोई बात नहीं।', ta: 'பரவாயில்லை.' },
  { g: 'yesno', en: 'Not at all.', hi: 'बिल्कुल नहीं।', ta: 'நிச்சயமாக இல்லை.' },

  /* ---------------- help ---------------- */
  { g: 'help', en: 'Can you help me?', hi: 'क्या आप मेरी मदद कर सकते हैं?', ta: 'எனக்கு உதவ முடியுமா?' },
  { g: 'help', en: 'I need help.', hi: 'मुझे मदद चाहिए।', ta: 'எனக்கு உதவி தேவை.' },
  { g: 'help', en: 'Please help me.', hi: 'कृपया मेरी मदद कीजिए।', ta: 'தயவுசெய்து எனக்கு உதவுங்கள்.' },
  { g: 'help', en: 'I am lost.', hi: 'मैं रास्ता भूल गया हूँ।', ta: 'நான் வழி தவறிவிட்டேன்.' },
  { g: 'help', en: 'Where is the toilet?', hi: 'शौचालय कहाँ है?', ta: 'கழிப்பறை எங்கே?' },
  { g: 'help', en: 'Can you show me?', hi: 'क्या आप मुझे दिखा सकते हैं?', ta: 'எனக்குக் காட்ட முடியுமா?' },
  { g: 'help', en: 'Is there anyone who speaks English?', hi: 'क्या कोई अंग्रेज़ी बोलता है?', ta: 'யாராவது ஆங்கிலம் பேசுவார்களா?' },
  { g: 'help', en: 'Wait a moment, please.', hi: 'कृपया एक मिनट रुकिए।', ta: 'தயவுசெய்து ஒரு நிமிடம் காத்திருங்கள்.' },

  /* ---------------- understanding ---------------- */
  { g: 'understand', en: 'I do not understand.', hi: 'मुझे समझ नहीं आया।', ta: 'எனக்குப் புரியவில்லை.' },
  { g: 'understand', en: 'I understand.', hi: 'मैं समझ गया।', ta: 'எனக்குப் புரிந்தது.' },
  { g: 'understand', en: 'Please speak slowly.', hi: 'कृपया धीरे बोलिए।', ta: 'தயவுசெய்து மெதுவாகப் பேசுங்கள்.' },
  { g: 'understand', en: 'Please say it again.', hi: 'कृपया फिर से कहिए।', ta: 'தயவுசெய்து மீண்டும் சொல்லுங்கள்.' },
  { g: 'understand', en: 'What does this mean?', hi: 'इसका मतलब क्या है?', ta: 'இதன் அர்த்தம் என்ன?' },
  { g: 'understand', en: 'How do you say this in Hindi?', hi: 'इसे हिंदी में कैसे कहते हैं?', ta: 'இதை இந்தியில் எப்படிச் சொல்வது?' },
  { g: 'understand', en: 'Can you write it down?', hi: 'क्या आप इसे लिख सकते हैं?', ta: 'இதை எழுதி தர முடியுமா?' },
  { g: 'understand', en: 'What is this called?', hi: 'इसे क्या कहते हैं?', ta: 'இதை என்ன சொல்வார்கள்?' },

  /* ---------------- small talk ---------------- */
  { g: 'smalltalk', en: 'How was your day?', hi: 'आपका दिन कैसा रहा?', ta: 'உங்கள் நாள் எப்படி இருந்தது?' },
  { g: 'smalltalk', en: 'What is new?', hi: 'क्या नया है?', ta: 'புதிதாக என்ன?' },
  { g: 'smalltalk', en: 'I am just going home.', hi: 'मैं बस घर जा रहा हूँ।', ta: 'நான் வீட்டுக்குப் போகிறேன்.' },
  { g: 'smalltalk', en: 'It is nice to talk to you.', hi: 'आपसे बात करके अच्छा लगा।', ta: 'உங்களுடன் பேசியது நன்றாக இருந்தது.' },
  { g: 'smalltalk', en: 'Do you live nearby?', hi: 'क्या आप पास में रहते हैं?', ta: 'நீங்கள் அருகில் வசிக்கிறீர்களா?' },
  { g: 'smalltalk', en: 'I am new here.', hi: 'मैं यहाँ नया हूँ।', ta: 'நான் இங்கே புதியவன்.' },
  { g: 'smalltalk', en: 'Let us keep in touch.', hi: 'संपर्क में रहिए।', ta: 'தொடர்பில் இருங்கள்.' },
  { g: 'smalltalk', en: 'Give my regards to your family.', hi: 'परिवार को मेरा नमस्ते कहिए।', ta: 'உங்கள் குடும்பத்திற்கு என் வணக்கம்.' },

  /* ---------------- time ---------------- */
  { g: 'time', en: 'What time is it?', hi: 'कितने बजे हैं?', ta: 'மணி என்ன?' },
  { g: 'time', en: 'It is three o’clock.', hi: 'तीन बजे हैं।', ta: 'மூன்று மணி.' },
  { g: 'time', en: 'Today.', hi: 'आज।', ta: 'இன்று.' },
  { g: 'time', en: 'Tomorrow.', hi: 'कल।', ta: 'நாளை.' },
  { g: 'time', en: 'Yesterday.', hi: 'कल।', ta: 'நேற்று.' },
  { g: 'time', en: 'Right now.', hi: 'अभी।', ta: 'இப்போதே.' },
  { g: 'time', en: 'In a little while.', hi: 'थोड़ी देर में।', ta: 'சிறிது நேரத்தில்.' },
  { g: 'time', en: 'What day is it today?', hi: 'आज कौन सा दिन है?', ta: 'இன்று என்ன கிழமை?' },
  { g: 'time', en: 'I am late.', hi: 'मुझे देर हो गई।', ta: 'எனக்கு நேரம் ஆகிவிட்டது.' },
  { g: 'time', en: 'We have plenty of time.', hi: 'हमारे पास बहुत समय है।', ta: 'நமக்கு நிறைய நேரம் இருக்கிறது.' },

  /* ---------------- directions ---------------- */
  { g: 'directions', en: 'Where is this place?', hi: 'यह जगह कहाँ है?', ta: 'இந்த இடம் எங்கே?' },
  { g: 'directions', en: 'Go straight.', hi: 'सीधे जाइए।', ta: 'நேராகச் செல்லுங்கள்.' },
  { g: 'directions', en: 'Turn right.', hi: 'दाएँ मुड़िए।', ta: 'வலதுபுறம் திரும்புங்கள்.' },
  { g: 'directions', en: 'Turn left.', hi: 'बाएँ मुड़िए।', ta: 'இடதுபுறம் திரும்புங்கள்.' },
  { g: 'directions', en: 'It is very close.', hi: 'यह बहुत पास है।', ta: 'அது மிக அருகில்.' },
  { g: 'directions', en: 'It is far from here.', hi: 'यह यहाँ से दूर है।', ta: 'அது இங்கிருந்து தொலைவில்.' },
  { g: 'directions', en: 'Is it walking distance?', hi: 'क्या पैदल जा सकते हैं?', ta: 'நடந்து செல்ல முடியுமா?' },
  { g: 'directions', en: 'Please show me on the map.', hi: 'कृपया नक्शे पर दिखाइए।', ta: 'வரைபடத்தில் காட்டுங்கள்.' },

  /* ---------------- transport ---------------- */
  { g: 'transport', en: 'Where is the bus stop?', hi: 'बस स्टॉप कहाँ है?', ta: 'பேருந்து நிறுத்தம் எங்கே?' },
  { g: 'transport', en: 'Which bus goes to the market?', hi: 'कौन सी बस बाज़ार जाती है?', ta: 'எந்தப் பேருந்து சந்தைக்குச் செல்லும்?' },
  { g: 'transport', en: 'One ticket, please.', hi: 'एक टिकट दीजिए।', ta: 'ஒரு டிக்கெட் கொடுங்கள்.' },
  { g: 'transport', en: 'How much is the fare?', hi: 'किराया कितना है?', ta: 'கட்டணம் எவ்வளவு?' },
  { g: 'transport', en: 'Please stop here.', hi: 'यहाँ रोकिए।', ta: 'இங்கே நிறுத்துங்கள்.' },
  { g: 'transport', en: 'What time does the train leave?', hi: 'ट्रेन कितने बजे निकलती है?', ta: 'ரயில் எத்தனை மணிக்குப் புறப்படும்?' },
  { g: 'transport', en: 'Is this seat free?', hi: 'क्या यह सीट खाली है?', ta: 'இந்த இருக்கை காலியா?' },
  { g: 'transport', en: 'Please use the meter.', hi: 'कृपया मीटर से चलिए।', ta: 'மீட்டர் போட்டு வாருங்கள்.' },

  /* ---------------- shopping ---------------- */
  { g: 'shop', en: 'How much is this?', hi: 'यह कितने का है?', ta: 'இதன் விலை என்ன?' },
  { g: 'shop', en: 'That is too expensive.', hi: 'यह बहुत महँगा है।', ta: 'இது மிகவும் விலை அதிகம்.' },
  { g: 'shop', en: 'Please reduce the price.', hi: 'दाम थोड़ा कम कीजिए।', ta: 'கொஞ்சம் விலையைக் குறையுங்கள்.' },
  { g: 'shop', en: 'Do you have another colour?', hi: 'क्या दूसरा रंग है?', ta: 'வேறு நிறம் இருக்கிறதா?' },
  { g: 'shop', en: 'I am just looking.', hi: 'मैं बस देख रहा हूँ।', ta: 'நான் சும்மா பார்க்கிறேன்.' },
  { g: 'shop', en: 'I will take this one.', hi: 'मैं यह लूँगा।', ta: 'இதை எடுத்துக்கொள்கிறேன்.' },
  { g: 'shop', en: 'Can I try it on?', hi: 'क्या मैं इसे पहनकर देख सकता हूँ?', ta: 'இதை அணிந்து பார்க்கலாமா?' },
  { g: 'shop', en: 'Please give me a bag.', hi: 'कृपया एक थैला दीजिए।', ta: 'ஒரு பை கொடுங்கள்.' },

  /* ---------------- money ---------------- */
  { g: 'money', en: 'How much in total?', hi: 'कुल कितना हुआ?', ta: 'மொத்தம் எவ்வளவு?' },
  { g: 'money', en: 'Can I pay by card?', hi: 'क्या मैं कार्ड से भुगतान कर सकता हूँ?', ta: 'அட்டை மூலம் செலுத்தலாமா?' },
  { g: 'money', en: 'Do you accept UPI?', hi: 'क्या आप यूपीआई लेते हैं?', ta: 'UPI ஏற்கிறீர்களா?' },
  { g: 'money', en: 'Please give me the change.', hi: 'कृपया बाकी पैसे दीजिए।', ta: 'மீதி பணம் கொடுங்கள்.' },
  { g: 'money', en: 'I do not have change.', hi: 'मेरे पास खुल्ले पैसे नहीं हैं।', ta: 'என்னிடம் சில்லறை இல்லை.' },
  { g: 'money', en: 'Please give me a receipt.', hi: 'कृपया रसीद दीजिए।', ta: 'ரசீது கொடுங்கள்.' },
  { g: 'money', en: 'Where is the ATM?', hi: 'एटीएम कहाँ है?', ta: 'ஏடிஎம் எங்கே?' },
  { g: 'money', en: 'It is too costly for me.', hi: 'यह मेरे लिए बहुत महँगा है।', ta: 'இது எனக்கு மிகவும் விலை அதிகம்.' },

  /* ---------------- food ---------------- */
  { g: 'food', en: 'I am hungry.', hi: 'मुझे भूख लगी है।', ta: 'எனக்குப் பசிக்கிறது.' },
  { g: 'food', en: 'I am thirsty.', hi: 'मुझे प्यास लगी है।', ta: 'எனக்குத் தாகமாக இருக்கிறது.' },
  { g: 'food', en: 'What would you like to eat?', hi: 'आप क्या खाना चाहेंगे?', ta: 'நீங்கள் என்ன சாப்பிட விரும்புகிறீர்கள்?' },
  { g: 'food', en: 'I am vegetarian.', hi: 'मैं शाकाहारी हूँ।', ta: 'நான் சைவ உணவு உண்பவன்.' },
  { g: 'food', en: 'Not too spicy, please.', hi: 'ज़्यादा तीखा मत कीजिए।', ta: 'அதிக காரம் வேண்டாம்.' },
  { g: 'food', en: 'The food is delicious.', hi: 'खाना बहुत स्वादिष्ट है।', ta: 'உணவு மிகவும் சுவையாக உள்ளது.' },
  { g: 'food', en: 'One more, please.', hi: 'एक और दीजिए।', ta: 'இன்னொன்று கொடுங்கள்.' },
  { g: 'food', en: 'I have had enough.', hi: 'बस, बहुत हो गया।', ta: 'போதும், நன்றி.' },
  { g: 'food', en: 'The bill, please.', hi: 'बिल दीजिए।', ta: 'ரசீது கொடுங்கள்.' },
  { g: 'food', en: 'Please pack this.', hi: 'कृपया इसे पैक कीजिए।', ta: 'இதைக் கட்டிக் கொடுங்கள்.' },

  /* ---------------- staying ---------------- */
  { g: 'stay', en: 'Do you have a room available?', hi: 'क्या कोई कमरा खाली है?', ta: 'அறை காலியாக இருக்கிறதா?' },
  { g: 'stay', en: 'How much per night?', hi: 'एक रात का कितना है?', ta: 'ஒரு இரவுக்கு எவ்வளவு?' },
  { g: 'stay', en: 'Is breakfast included?', hi: 'क्या नाश्ता शामिल है?', ta: 'காலை உணவு சேர்த்தா?' },
  { g: 'stay', en: 'I have a booking.', hi: 'मेरी बुकिंग है।', ta: 'எனக்கு முன்பதிவு உள்ளது.' },
  { g: 'stay', en: 'The room is not clean.', hi: 'कमरा साफ़ नहीं है।', ta: 'அறை சுத்தமாக இல்லை.' },
  { g: 'stay', en: 'Is there hot water?', hi: 'क्या गरम पानी है?', ta: 'சூடான தண்ணீர் இருக்கிறதா?' },
  { g: 'stay', en: 'What is the wifi password?', hi: 'वाईफ़ाई का पासवर्ड क्या है?', ta: 'வைஃபை கடவுச்சொல் என்ன?' },
  { g: 'stay', en: 'I would like to check out.', hi: 'मुझे चेक आउट करना है।', ta: 'நான் வெளியேற வேண்டும்.' },

  /* ---------------- health ---------------- */
  { g: 'health', en: 'I am not well.', hi: 'मेरी तबीयत ठीक नहीं है।', ta: 'எனக்கு உடல்நிலை சரியில்லை.' },
  { g: 'health', en: 'I have a headache.', hi: 'मेरे सिर में दर्द है।', ta: 'எனக்குத் தலைவலி.' },
  { g: 'health', en: 'I have a fever.', hi: 'मुझे बुखार है।', ta: 'எனக்குக் காய்ச்சல்.' },
  { g: 'health', en: 'It hurts here.', hi: 'यहाँ दर्द होता है।', ta: 'இங்கே வலிக்கிறது.' },
  { g: 'health', en: 'Please call a doctor.', hi: 'कृपया डॉक्टर को बुलाइए।', ta: 'மருத்துவரை அழையுங்கள்.' },
  { g: 'health', en: 'Where is the nearest hospital?', hi: 'सबसे पास का अस्पताल कहाँ है?', ta: 'அருகில் உள்ள மருத்துவமனை எங்கே?' },
  { g: 'health', en: 'I need medicine.', hi: 'मुझे दवा चाहिए।', ta: 'எனக்கு மருந்து வேண்டும்.' },
  { g: 'health', en: 'Help! It is an emergency.', hi: 'मदद कीजिए! यह आपातकाल है।', ta: 'உதவுங்கள்! அவசரம்.' },
  { g: 'health', en: 'I am allergic to this.', hi: 'मुझे इससे एलर्जी है।', ta: 'எனக்கு இது ஒவ்வாமை.' },
  { g: 'health', en: 'Please call the police.', hi: 'कृपया पुलिस को बुलाइए।', ta: 'காவல்துறையை அழையுங்கள்.' },

  /* ---------------- family ---------------- */
  { g: 'family', en: 'This is my family.', hi: 'यह मेरा परिवार है।', ta: 'இது என் குடும்பம்.' },
  { g: 'family', en: 'This is my wife.', hi: 'यह मेरी पत्नी हैं।', ta: 'இவர் என் மனைவி.' },
  { g: 'family', en: 'I have two children.', hi: 'मेरे दो बच्चे हैं।', ta: 'எனக்கு இரண்டு குழந்தைகள்.' },
  { g: 'family', en: 'My parents live in the village.', hi: 'मेरे माता-पिता गाँव में रहते हैं।', ta: 'என் பெற்றோர் கிராமத்தில் வசிக்கிறார்கள்.' },
  { g: 'family', en: 'Are you married?', hi: 'क्या आप शादीशुदा हैं?', ta: 'நீங்கள் திருமணமானவரா?' },
  { g: 'family', en: 'He is my elder brother.', hi: 'वह मेरे बड़े भाई हैं।', ta: 'அவர் என் அண்ணன்.' },
  { g: 'family', en: 'She is my younger sister.', hi: 'वह मेरी छोटी बहन है।', ta: 'அவள் என் தங்கை.' },
  { g: 'family', en: 'How is your family?', hi: 'आपका परिवार कैसा है?', ta: 'உங்கள் குடும்பம் எப்படி இருக்கிறது?' },

  /* ---------------- work ---------------- */
  { g: 'work', en: 'I work in an office.', hi: 'मैं दफ़्तर में काम करता हूँ।', ta: 'நான் அலுவலகத்தில் வேலை செய்கிறேன்.' },
  { g: 'work', en: 'I am looking for a job.', hi: 'मैं नौकरी ढूँढ रहा हूँ।', ta: 'நான் வேலை தேடுகிறேன்.' },
  { g: 'work', en: 'When is the meeting?', hi: 'बैठक कब है?', ta: 'கூட்டம் எப்போது?' },
  { g: 'work', en: 'I will send you an email.', hi: 'मैं आपको ईमेल भेजूँगा।', ta: 'உங்களுக்கு மின்னஞ்சல் அனுப்புகிறேன்.' },
  { g: 'work', en: 'The work is finished.', hi: 'काम पूरा हो गया।', ta: 'வேலை முடிந்தது.' },
  { g: 'work', en: 'I need one day of leave.', hi: 'मुझे एक दिन की छुट्टी चाहिए।', ta: 'எனக்கு ஒரு நாள் விடுமுறை வேண்டும்.' },
  { g: 'work', en: 'Please send me the details.', hi: 'कृपया मुझे विवरण भेजिए।', ta: 'விவரங்களை அனுப்புங்கள்.' },
  { g: 'work', en: 'I will do it tomorrow.', hi: 'मैं यह कल करूँगा।', ta: 'நாளை செய்கிறேன்.' },

  /* ---------------- study ---------------- */
  { g: 'study', en: 'I am a student.', hi: 'मैं छात्र हूँ।', ta: 'நான் மாணவன்.' },
  { g: 'study', en: 'Which class are you in?', hi: 'आप किस कक्षा में हैं?', ta: 'நீங்கள் எந்த வகுப்பு?' },
  { g: 'study', en: 'I have an exam tomorrow.', hi: 'मेरी कल परीक्षा है।', ta: 'நாளை எனக்குத் தேர்வு.' },
  { g: 'study', en: 'I did not understand the lesson.', hi: 'मुझे पाठ समझ नहीं आया।', ta: 'பாடம் புரியவில்லை.' },
  { g: 'study', en: 'Please explain again.', hi: 'कृपया फिर से समझाइए।', ta: 'மீண்டும் விளக்குங்கள்.' },
  { g: 'study', en: 'May I ask a question?', hi: 'क्या मैं एक सवाल पूछ सकता हूँ?', ta: 'ஒரு கேள்வி கேட்கலாமா?' },
  { g: 'study', en: 'I have finished my homework.', hi: 'मैंने अपना गृहकार्य कर लिया।', ta: 'வீட்டுப்பாடம் முடித்துவிட்டேன்.' },
  { g: 'study', en: 'Reading every day helps a lot.', hi: 'रोज़ पढ़ने से बहुत फ़ायदा होता है।', ta: 'தினமும் படிப்பது மிகவும் உதவும்.' },

  /* ---------------- phone ---------------- */
  { g: 'phone', en: 'What is your phone number?', hi: 'आपका फ़ोन नंबर क्या है?', ta: 'உங்கள் தொலைபேசி எண் என்ன?' },
  { g: 'phone', en: 'I will call you later.', hi: 'मैं आपको बाद में फ़ोन करूँगा।', ta: 'பிறகு அழைக்கிறேன்.' },
  { g: 'phone', en: 'The line is not clear.', hi: 'आवाज़ साफ़ नहीं आ रही।', ta: 'குரல் தெளிவாக இல்லை.' },
  { g: 'phone', en: 'My battery is low.', hi: 'मेरी बैटरी कम है।', ta: 'என் பேட்டரி குறைவு.' },
  { g: 'phone', en: 'Is there internet here?', hi: 'क्या यहाँ इंटरनेट है?', ta: 'இங்கே இணையம் இருக்கிறதா?' },
  { g: 'phone', en: 'Please send me the photo.', hi: 'कृपया मुझे तस्वीर भेजिए।', ta: 'படத்தை அனுப்புங்கள்.' },
  { g: 'phone', en: 'I did not get your message.', hi: 'मुझे आपका संदेश नहीं मिला।', ta: 'உங்கள் செய்தி கிடைக்கவில்லை.' },

  /* ---------------- feelings ---------------- */
  { g: 'feelings', en: 'I am very happy.', hi: 'मैं बहुत खुश हूँ।', ta: 'நான் மிகவும் மகிழ்ச்சியாக இருக்கிறேன்.' },
  { g: 'feelings', en: 'I am tired.', hi: 'मैं थक गया हूँ।', ta: 'நான் சோர்வாக இருக்கிறேன்.' },
  { g: 'feelings', en: 'I am worried.', hi: 'मैं चिंतित हूँ।', ta: 'நான் கவலையாக இருக்கிறேன்.' },
  { g: 'feelings', en: 'Do not worry.', hi: 'चिंता मत कीजिए।', ta: 'கவலைப்படாதீர்கள்.' },
  { g: 'feelings', en: 'I am afraid.', hi: 'मुझे डर लग रहा है।', ta: 'எனக்குப் பயமாக இருக்கிறது.' },
  { g: 'feelings', en: 'I miss you.', hi: 'मुझे आपकी याद आती है।', ta: 'உங்களை நினைத்துக்கொள்கிறேன்.' },
  { g: 'feelings', en: 'I feel much better now.', hi: 'अब मैं बेहतर महसूस कर रहा हूँ।', ta: 'இப்போது நன்றாக உணர்கிறேன்.' },
  { g: 'feelings', en: 'That makes me sad.', hi: 'इससे मुझे दुख होता है।', ta: 'அது எனக்கு வருத்தம் தருகிறது.' },

  /* ---------------- opinions ---------------- */
  { g: 'opinion', en: 'I agree with you.', hi: 'मैं आपसे सहमत हूँ।', ta: 'நான் உங்களுடன் உடன்படுகிறேன்.' },
  { g: 'opinion', en: 'I do not agree.', hi: 'मैं सहमत नहीं हूँ।', ta: 'நான் உடன்படவில்லை.' },
  { g: 'opinion', en: 'In my opinion, this is better.', hi: 'मेरी राय में यह बेहतर है।', ta: 'என் கருத்துப்படி இது சிறந்தது.' },
  { g: 'opinion', en: 'You are right.', hi: 'आप सही हैं।', ta: 'நீங்கள் சொல்வது சரி.' },
  { g: 'opinion', en: 'What do you think?', hi: 'आप क्या सोचते हैं?', ta: 'நீங்கள் என்ன நினைக்கிறீர்கள்?' },
  { g: 'opinion', en: 'It depends.', hi: 'यह निर्भर करता है।', ta: 'அது பொறுத்தது.' },
  { g: 'opinion', en: 'I like it very much.', hi: 'मुझे यह बहुत पसंद है।', ta: 'எனக்கு இது மிகவும் பிடிக்கும்.' },
  { g: 'opinion', en: 'I do not like it.', hi: 'मुझे यह पसंद नहीं है।', ta: 'எனக்கு இது பிடிக்கவில்லை.' },

  /* ---------------- plans ---------------- */
  { g: 'plans', en: 'Are you free tomorrow?', hi: 'क्या आप कल खाली हैं?', ta: 'நாளை நீங்கள் ஓய்வாக இருக்கிறீர்களா?' },
  { g: 'plans', en: 'Shall we meet at five?', hi: 'क्या हम पाँच बजे मिलें?', ta: 'ஐந்து மணிக்குச் சந்திக்கலாமா?' },
  { g: 'plans', en: 'Let us go together.', hi: 'चलिए साथ चलते हैं।', ta: 'சேர்ந்து போகலாம்.' },
  { g: 'plans', en: 'I will come with you.', hi: 'मैं आपके साथ चलूँगा।', ta: 'நான் உங்களுடன் வருகிறேன்.' },
  { g: 'plans', en: 'Please come to my house.', hi: 'कृपया मेरे घर आइए।', ta: 'என் வீட்டுக்கு வாருங்கள்.' },
  { g: 'plans', en: 'I cannot come today.', hi: 'मैं आज नहीं आ सकता।', ta: 'இன்று என்னால் வர முடியாது.' },
  { g: 'plans', en: 'Let us do it another day.', hi: 'किसी और दिन करते हैं।', ta: 'வேறொரு நாள் செய்வோம்.' },
  { g: 'plans', en: 'I am looking forward to it.', hi: 'मुझे इसका इंतज़ार है।', ta: 'நான் ஆவலுடன் காத்திருக்கிறேன்.' },

  /* ---------------- problems ---------------- */
  { g: 'problem', en: 'There is a problem.', hi: 'एक समस्या है।', ta: 'ஒரு பிரச்சினை உள்ளது.' },
  { g: 'problem', en: 'It is not working.', hi: 'यह काम नहीं कर रहा।', ta: 'இது வேலை செய்யவில்லை.' },
  { g: 'problem', en: 'I made a mistake.', hi: 'मुझसे ग़लती हो गई।', ta: 'என்னால் தவறு நடந்துவிட்டது.' },
  { g: 'problem', en: 'I am very sorry.', hi: 'मुझे बहुत खेद है।', ta: 'மிகவும் வருந்துகிறேன்.' },
  { g: 'problem', en: 'It was not my fault.', hi: 'यह मेरी ग़लती नहीं थी।', ta: 'அது என் தவறு இல்லை.' },
  { g: 'problem', en: 'Please forgive me.', hi: 'कृपया मुझे माफ़ कीजिए।', ta: 'என்னை மன்னியுங்கள்.' },
  { g: 'problem', en: 'I lost my bag.', hi: 'मेरा बैग खो गया।', ta: 'என் பை தொலைந்துவிட்டது.' },
  { g: 'problem', en: 'Let us fix it together.', hi: 'चलिए मिलकर ठीक करते हैं।', ta: 'சேர்ந்து சரி செய்வோம்.' },

  /* ---------------- praise ---------------- */
  { g: 'praise', en: 'Very good!', hi: 'बहुत अच्छा!', ta: 'மிக நல்லது!' },
  { g: 'praise', en: 'Well done!', hi: 'शाबाश!', ta: 'பாராட்டுக்கள்!' },
  { g: 'praise', en: 'You speak Hindi well.', hi: 'आप अच्छी हिंदी बोलते हैं।', ta: 'நீங்கள் நன்றாக இந்தி பேசுகிறீர்கள்.' },
  { g: 'praise', en: 'Keep trying.', hi: 'कोशिश करते रहिए।', ta: 'முயற்சி செய்து கொண்டே இருங்கள்.' },
  { g: 'praise', en: 'Do not give up.', hi: 'हार मत मानिए।', ta: 'விட்டுவிடாதீர்கள்.' },
  { g: 'praise', en: 'You are improving.', hi: 'आप बेहतर हो रहे हैं।', ta: 'நீங்கள் முன்னேறுகிறீர்கள்.' },
  { g: 'praise', en: 'That was perfect.', hi: 'यह एकदम सही था।', ta: 'அது சரியாக இருந்தது.' },

  /* ---------------- home ---------------- */
  { g: 'home', en: 'Please come in.', hi: 'अंदर आइए।', ta: 'உள்ளே வாருங்கள்.' },
  { g: 'home', en: 'Make yourself comfortable.', hi: 'आराम से बैठिए।', ta: 'வசதியாக அமருங்கள்.' },
  { g: 'home', en: 'Would you like some tea?', hi: 'क्या आप चाय लेंगे?', ta: 'தேநீர் சாப்பிடுகிறீர்களா?' },
  { g: 'home', en: 'Please switch on the light.', hi: 'कृपया बत्ती जलाइए।', ta: 'விளக்கைப் போடுங்கள்.' },
  { g: 'home', en: 'Please close the door.', hi: 'कृपया दरवाज़ा बंद कीजिए।', ta: 'கதவை மூடுங்கள்.' },
  { g: 'home', en: 'The food is ready.', hi: 'खाना तैयार है।', ta: 'உணவு தயார்.' },
  { g: 'home', en: 'I am going out.', hi: 'मैं बाहर जा रहा हूँ।', ta: 'நான் வெளியே போகிறேன்.' },
  { g: 'home', en: 'I will be back soon.', hi: 'मैं जल्दी वापस आऊँगा।', ta: 'சீக்கிரம் திரும்பி வருகிறேன்.' }
];

TB.PHRASES.forEach(function (p, i) { p.id = 'p' + String(i + 1).padStart(3, '0'); });
