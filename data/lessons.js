/* Tamil Bridge — structured curriculum.
   Every unit teaches English AND Hindi from a Tamil starting point.
   `gloss` gives word-by-word alignment so the learner sees how word order moves. */
window.TB = window.TB || {};

TB.LESSONS = [
  {
    id: 'u01',
    title: { ta: 'அறிமுகம் — உன்னைப் பற்றி சொல்', en: 'Introducing yourself' },
    goal: 'Say your name, where you are from and what you do — in English and in Hindi.',
    grammar: 'English "am / is / are" does the job of Tamil "இருக்கிறேன் / ஆவேன்" — but Tamil usually leaves it out. "நான் குமார்" cannot become "I Kumar"; you must say "I **am** Kumar". In Hindi this word is **हूँ**.',
    lines: [
      { ta: 'என் பெயர் குமார்.', en: 'My name is Kumar.', hi: 'मेरा नाम कुमार है।',
        gloss: [['என்', 'my', 'मेरा'], ['பெயர்', 'name', 'नाम'], ['—', 'is', 'है'], ['குமார்', 'Kumar', 'कुमार']] },
      { ta: 'நான் இந்தியாவைச் சேர்ந்தவன்.', en: 'I am from India.', hi: 'मैं भारत से हूँ।',
        gloss: [['நான்', 'I', 'मैं'], ['இந்தியா', 'India', 'भारत'], ['-விலிருந்து', 'from', 'से'], ['—', 'am', 'हूँ']] },
      { ta: 'நான் ஒரு மாணவன்.', en: 'I am a student.', hi: 'मैं एक छात्र हूँ।',
        gloss: [['நான்', 'I', 'मैं'], ['ஒரு', 'a', 'एक'], ['மாணவன்', 'student', 'छात्र'], ['—', 'am', 'हूँ']] },
      { ta: 'எனக்கு இருபத்தைந்து வயது.', en: 'I am twenty-five years old.', hi: 'मैं पच्चीस साल का हूँ।',
        gloss: [['எனக்கு', 'I', 'मैं'], ['இருபத்தைந்து', 'twenty-five', 'पच्चीस'], ['வயது', 'years old', 'साल का']] },
      { ta: 'உங்கள் பெயர் என்ன?', en: 'What is your name?', hi: 'आपका नाम क्या है?',
        gloss: [['உங்கள்', 'your', 'आपका'], ['பெயர்', 'name', 'नाम'], ['என்ன', 'what', 'क्या'], ['—', 'is', 'है']] },
      { ta: 'உங்களைச் சந்தித்ததில் மகிழ்ச்சி.', en: 'Nice to meet you.', hi: 'आपसे मिलकर खुशी हुई।',
        gloss: [['உங்களை', 'you', 'आपसे'], ['சந்தித்ததில்', 'to meet', 'मिलकर'], ['மகிழ்ச்சி', 'nice/happy', 'खुशी']] }
    ],
    quiz: [
      { q: '"I ___ a teacher." — which word fits?', opts: ['am', 'is', 'are', 'be'], a: 0, why: 'With "I" it is always "am".' },
      { q: '"मैं छात्र ___।" — fill in the Hindi word', opts: ['है', 'हूँ', 'हैं', 'हो'], a: 1, why: 'मैं (I) always takes हूँ.' }
    ]
  },

  {
    id: 'u02',
    title: { ta: 'கேள்வி கேட்பது', en: 'Asking questions' },
    goal: 'Ask questions: what, where, who, when, why and how.',
    grammar: 'In Tamil the question word can sit in the middle of a sentence. In English it **always comes first**, followed by the auxiliary: "Where **are** you going?" In Hindi it goes just before the verb.',
    lines: [
      { ta: 'இது என்ன?', en: 'What is this?', hi: 'यह क्या है?',
        gloss: [['இது', 'this', 'यह'], ['என்ன', 'what', 'क्या'], ['—', 'is', 'है']] },
      { ta: 'நீங்கள் எங்கே இருக்கிறீர்கள்?', en: 'Where are you?', hi: 'आप कहाँ हैं?',
        gloss: [['நீங்கள்', 'you', 'आप'], ['எங்கே', 'where', 'कहाँ'], ['இருக்கிறீர்கள்', 'are', 'हैं']] },
      { ta: 'அவர் யார்?', en: 'Who is he?', hi: 'वह कौन है?',
        gloss: [['அவர்', 'he', 'वह'], ['யார்', 'who', 'कौन'], ['—', 'is', 'है']] },
      { ta: 'ரயில் எப்போது வரும்?', en: 'When will the train come?', hi: 'ट्रेन कब आएगी?',
        gloss: [['ரயில்', 'train', 'ट्रेन'], ['எப்போது', 'when', 'कब'], ['வரும்', 'will come', 'आएगी']] },
      { ta: 'நீ ஏன் அழுகிறாய்?', en: 'Why are you crying?', hi: 'तुम क्यों रो रहे हो?',
        gloss: [['நீ', 'you', 'तुम'], ['ஏன்', 'why', 'क्यों'], ['அழுகிறாய்', 'are crying', 'रो रहे हो']] },
      { ta: 'இது எப்படி வேலை செய்கிறது?', en: 'How does this work?', hi: 'यह कैसे काम करता है?',
        gloss: [['இது', 'this', 'यह'], ['எப்படி', 'how', 'कैसे'], ['வேலை செய்கிறது', 'does work', 'काम करता है']] }
    ],
    quiz: [
      { q: 'Which sentence is correct?', opts: ['You are going where?', 'Where you are going?', 'Where are you going?', 'Where going you are?'], a: 2, why: 'Question word + auxiliary + subject + verb.' },
      { q: 'What does "कब" mean?', opts: ['where', 'when', 'why', 'who'], a: 1, why: 'कब = when.' }
    ]
  },

  {
    id: 'u03',
    title: { ta: 'நிகழ்காலம் — தினசரி பழக்கம்', en: 'Present simple' },
    goal: 'Talk about what you do every day.',
    grammar: 'The big one: with **he / she / it** you must add **-s** to the verb. "He go" is wrong; "He go**es**" is right. Tamil has no such rule, which is why this is the most commonly missed point. Hindi instead changes the verb for gender: करता है / करती है.',
    lines: [
      { ta: 'நான் தினமும் பள்ளிக்குச் செல்கிறேன்.', en: 'I go to school every day.', hi: 'मैं रोज़ स्कूल जाता हूँ।',
        gloss: [['நான்', 'I', 'मैं'], ['தினமும்', 'every day', 'रोज़'], ['பள்ளிக்கு', 'to school', 'स्कूल'], ['செல்கிறேன்', 'go', 'जाता हूँ']] },
      { ta: 'அவன் தண்ணீர் குடிக்கிறான்.', en: 'He drinks water.', hi: 'वह पानी पीता है।',
        gloss: [['அவன்', 'he', 'वह'], ['தண்ணீர்', 'water', 'पानी'], ['குடிக்கிறான்', 'drinks', 'पीता है']] },
      { ta: 'அவள் நன்றாகப் பாடுகிறாள்.', en: 'She sings well.', hi: 'वह अच्छा गाती है।',
        gloss: [['அவள்', 'she', 'वह'], ['நன்றாக', 'well', 'अच्छा'], ['பாடுகிறாள்', 'sings', 'गाती है']] },
      { ta: 'நாங்கள் காலையில் வேலை செய்கிறோம்.', en: 'We work in the morning.', hi: 'हम सुबह काम करते हैं।',
        gloss: [['நாங்கள்', 'we', 'हम'], ['காலையில்', 'in the morning', 'सुबह'], ['வேலை செய்கிறோம்', 'work', 'काम करते हैं']] },
      { ta: 'அவர்கள் இந்தியில் பேசுகிறார்கள்.', en: 'They speak in Hindi.', hi: 'वे हिंदी में बोलते हैं।',
        gloss: [['அவர்கள்', 'they', 'वे'], ['இந்தியில்', 'in Hindi', 'हिंदी में'], ['பேசுகிறார்கள்', 'speak', 'बोलते हैं']] },
      { ta: 'நான் இறைச்சி சாப்பிடுவதில்லை.', en: 'I do not eat meat.', hi: 'मैं मांस नहीं खाता।',
        gloss: [['நான்', 'I', 'मैं'], ['இறைச்சி', 'meat', 'मांस'], ['இல்லை', 'do not', 'नहीं'], ['சாப்பிடு', 'eat', 'खाता']] }
    ],
    quiz: [
      { q: 'Which one is correct?', opts: ['She go to work.', 'She goes to work.', 'She going to work.', 'She gone to work.'], a: 1, why: 'With "she" the verb needs -s / -es.' },
      { q: 'Negative form of "He plays." →', opts: ['He not plays.', 'He does not plays.', 'He does not play.', 'He do not play.'], a: 2, why: '"does" already carries the -s, so the main verb stays in its base form.' }
    ]
  },

  {
    id: 'u04',
    title: { ta: 'நிகழ்கால தொடர் — இப்போது நடப்பது', en: 'Present continuous' },
    goal: 'Say what is happening right now.',
    grammar: 'Form: **am / is / are + verb + ing**. It works like the Tamil ending "-கொண்டிருக்கிறேன்". In Hindi: **रहा / रही / रहे + हूँ / है / हैं**.',
    lines: [
      { ta: 'நான் சாப்பிட்டுக் கொண்டிருக்கிறேன்.', en: 'I am eating.', hi: 'मैं खा रहा हूँ।',
        gloss: [['நான்', 'I', 'मैं'], ['—', 'am', 'हूँ'], ['சாப்பிட்டுக் கொண்டிருக்கிறேன்', 'eating', 'खा रहा']] },
      { ta: 'அவள் புத்தகம் படித்துக் கொண்டிருக்கிறாள்.', en: 'She is reading a book.', hi: 'वह किताब पढ़ रही है।',
        gloss: [['அவள்', 'she', 'वह'], ['புத்தகம்', 'a book', 'किताब'], ['படித்துக் கொண்டிருக்கிறாள்', 'is reading', 'पढ़ रही है']] },
      { ta: 'மழை பெய்து கொண்டிருக்கிறது.', en: 'It is raining.', hi: 'बारिश हो रही है।',
        gloss: [['மழை', 'it/rain', 'बारिश'], ['பெய்து கொண்டிருக்கிறது', 'is raining', 'हो रही है']] },
      { ta: 'நாங்கள் இப்போது கற்றுக் கொண்டிருக்கிறோம்.', en: 'We are learning now.', hi: 'हम अभी सीख रहे हैं।',
        gloss: [['நாங்கள்', 'we', 'हम'], ['இப்போது', 'now', 'अभी'], ['கற்றுக்கொண்டிருக்கிறோம்', 'are learning', 'सीख रहे हैं']] },
      { ta: 'நீ என்ன செய்து கொண்டிருக்கிறாய்?', en: 'What are you doing?', hi: 'तुम क्या कर रहे हो?',
        gloss: [['நீ', 'you', 'तुम'], ['என்ன', 'what', 'क्या'], ['செய்து கொண்டிருக்கிறாய்', 'are doing', 'कर रहे हो']] },
      { ta: 'அவர்கள் வேலை செய்யவில்லை.', en: 'They are not working.', hi: 'वे काम नहीं कर रहे हैं।',
        gloss: [['அவர்கள்', 'they', 'वे'], ['வேலை', 'work', 'काम'], ['செய்யவில்லை', 'are not working', 'नहीं कर रहे हैं']] }
    ],
    quiz: [
      { q: '"I am writing" in English is —', opts: ['I write.', 'I am write.', 'I am writing.', 'I writing.'], a: 2, why: 'am + verb-ing.' },
      { q: 'A girl speaking Hindi: "मैं जा ___ हूँ।"', opts: ['रहा', 'रही', 'रहे', 'रहो'], a: 1, why: 'Feminine → रही.' }
    ]
  },

  {
    id: 'u05',
    title: { ta: 'இறந்த காலம்', en: 'Past simple' },
    goal: 'Talk about what happened yesterday.',
    grammar: 'Regular verbs add **-ed** (walk → walked). Many common verbs are irregular and must simply be memorised: go → **went**, eat → **ate**, see → **saw**. In Hindi: गया / गई / किया.',
    lines: [
      { ta: 'நான் நேற்று சந்தைக்குச் சென்றேன்.', en: 'I went to the market yesterday.', hi: 'मैं कल बाज़ार गया।',
        gloss: [['நான்', 'I', 'मैं'], ['நேற்று', 'yesterday', 'कल'], ['சந்தைக்கு', 'to the market', 'बाज़ार'], ['சென்றேன்', 'went', 'गया']] },
      { ta: 'அவள் உணவு சமைத்தாள்.', en: 'She cooked food.', hi: 'उसने खाना बनाया।',
        gloss: [['அவள்', 'she', 'उसने'], ['உணவு', 'food', 'खाना'], ['சமைத்தாள்', 'cooked', 'बनाया']] },
      { ta: 'நாங்கள் ஒரு படம் பார்த்தோம்.', en: 'We watched a movie.', hi: 'हमने एक फ़िल्म देखी।',
        gloss: [['நாங்கள்', 'we', 'हमने'], ['ஒரு படம்', 'a movie', 'एक फ़िल्म'], ['பார்த்தோம்', 'watched', 'देखी']] },
      { ta: 'அவன் வரவில்லை.', en: 'He did not come.', hi: 'वह नहीं आया।',
        gloss: [['அவன்', 'he', 'वह'], ['இல்லை', 'did not', 'नहीं'], ['வர', 'come', 'आया']] },
      { ta: 'நீ அதைப் பார்த்தாயா?', en: 'Did you see it?', hi: 'क्या तुमने उसे देखा?',
        gloss: [['நீ', 'you', 'तुमने'], ['அதை', 'it', 'उसे'], ['பார்த்தாயா', 'did see', 'देखा']] },
      { ta: 'அவர்கள் நேற்று வந்தார்கள்.', en: 'They came yesterday.', hi: 'वे कल आए।',
        gloss: [['அவர்கள்', 'they', 'वे'], ['நேற்று', 'yesterday', 'कल'], ['வந்தார்கள்', 'came', 'आए']] }
    ],
    quiz: [
      { q: 'What is the past tense of "go"?', opts: ['goed', 'gone', 'went', 'going'], a: 2, why: 'go → went (irregular).' },
      { q: 'Correct: "He did not ___ ."', opts: ['came', 'come', 'comes', 'coming'], a: 1, why: '"did" already shows the tense, so use the base form.' }
    ]
  },

  {
    id: 'u06',
    title: { ta: 'எதிர்காலம்', en: 'Future tense' },
    goal: 'Talk about what you will do tomorrow.',
    grammar: '**will + base verb**. "will goes" is wrong. For something already planned, use "am going to + verb". In Hindi the ending follows gender: -गा (m), -गी (f), -गे (plural).',
    lines: [
      { ta: 'நான் நாளை வருவேன்.', en: 'I will come tomorrow.', hi: 'मैं कल आऊँगा।',
        gloss: [['நான்', 'I', 'मैं'], ['நாளை', 'tomorrow', 'कल'], ['வருவேன்', 'will come', 'आऊँगा']] },
      { ta: 'அவள் ஆங்கிலம் கற்பாள்.', en: 'She will learn English.', hi: 'वह अंग्रेज़ी सीखेगी।',
        gloss: [['அவள்', 'she', 'वह'], ['ஆங்கிலம்', 'English', 'अंग्रेज़ी'], ['கற்பாள்', 'will learn', 'सीखेगी']] },
      { ta: 'நாங்கள் உங்களுக்கு உதவுவோம்.', en: 'We will help you.', hi: 'हम आपकी मदद करेंगे।',
        gloss: [['நாங்கள்', 'we', 'हम'], ['உங்களுக்கு', 'you', 'आपकी'], ['உதவுவோம்', 'will help', 'मदद करेंगे']] },
      { ta: 'அவன் வரமாட்டான்.', en: 'He will not come.', hi: 'वह नहीं आएगा।',
        gloss: [['அவன்', 'he', 'वह'], ['இல்லை', 'will not', 'नहीं'], ['வர', 'come', 'आएगा']] },
      { ta: 'நான் ஒரு கார் வாங்கப் போகிறேன்.', en: 'I am going to buy a car.', hi: 'मैं एक गाड़ी खरीदने वाला हूँ।',
        gloss: [['நான்', 'I', 'मैं'], ['ஒரு கார்', 'a car', 'एक गाड़ी'], ['வாங்கப் போகிறேன்', 'am going to buy', 'खरीदने वाला हूँ']] },
      { ta: 'நீங்கள் எப்போது புறப்படுவீர்கள்?', en: 'When will you leave?', hi: 'आप कब निकलेंगे?',
        gloss: [['நீங்கள்', 'you', 'आप'], ['எப்போது', 'when', 'कब'], ['புறப்படுவீர்கள்', 'will leave', 'निकलेंगे']] }
    ],
    quiz: [
      { q: 'Which one is correct?', opts: ['She will goes.', 'She will go.', 'She will going.', 'She will went.'], a: 1, why: 'After "will" the verb is always in its base form.' },
      { q: 'A boy speaking Hindi: "मैं कल ___।"', opts: ['आऊँगी', 'आऊँगा', 'आऊँगे', 'आया'], a: 1, why: 'Masculine future → -गा.' }
    ]
  },

  {
    id: 'u07',
    title: { ta: 'a / an / the — தமிழில் இல்லாத சொற்கள்', en: 'Articles' },
    goal: 'Fix the single most common mistake Tamil speakers make in English.',
    grammar: 'Tamil has no "a / an / the" at all, so these words get dropped. The rule: **a/an** the first time you mention one thing, **the** once it is already known. Use **an** before a vowel sound (an apple, an hour). Hindi has no "the" either, though एक works like "a".',
    lines: [
      { ta: 'எனக்கு ஒரு புத்தகம் வேண்டும்.', en: 'I want a book.', hi: 'मुझे एक किताब चाहिए।',
        gloss: [['எனக்கு', 'I', 'मुझे'], ['ஒரு', 'a', 'एक'], ['புத்தகம்', 'book', 'किताब'], ['வேண்டும்', 'want', 'चाहिए']] },
      { ta: 'அந்தப் புத்தகம் மேசையில் உள்ளது.', en: 'The book is on the table.', hi: 'किताब मेज़ पर है।',
        gloss: [['அந்த', 'the', '—'], ['புத்தகம்', 'book', 'किताब'], ['மேசையில்', 'on the table', 'मेज़ पर'], ['உள்ளது', 'is', 'है']] },
      { ta: 'அவன் ஒரு ஆசிரியர்.', en: 'He is a teacher.', hi: 'वह एक शिक्षक है।',
        gloss: [['அவன்', 'he', 'वह'], ['ஒரு', 'a', 'एक'], ['ஆசிரியர்', 'teacher', 'शिक्षक']] },
      { ta: 'நான் ஒரு ஆப்பிள் சாப்பிட்டேன்.', en: 'I ate an apple.', hi: 'मैंने एक सेब खाया।',
        gloss: [['நான்', 'I', 'मैंने'], ['ஒரு', 'an', 'एक'], ['ஆப்பிள்', 'apple', 'सेब'], ['சாப்பிட்டேன்', 'ate', 'खाया']] },
      { ta: 'சூரியன் பிரகாசமாக உள்ளது.', en: 'The sun is bright.', hi: 'सूरज चमकीला है।',
        gloss: [['சூரியன்', 'the sun', 'सूरज'], ['பிரகாசமாக', 'bright', 'चमकीला'], ['உள்ளது', 'is', 'है']] },
      { ta: 'அவள் ஒரு மணி நேரம் காத்திருந்தாள்.', en: 'She waited an hour.', hi: 'उसने एक घंटा इंतज़ार किया।',
        gloss: [['அவள்', 'she', 'उसने'], ['ஒரு மணி நேரம்', 'an hour', 'एक घंटा'], ['காத்திருந்தாள்', 'waited', 'इंतज़ार किया']] }
    ],
    quiz: [
      { q: '"___ hour" — which is correct?', opts: ['a', 'an', 'the', 'nothing'], a: 1, why: 'The h in "hour" is silent, so it begins with a vowel sound → an.' },
      { q: '"I am ___ engineer."', opts: ['a', 'an', 'the', '—'], a: 1, why: '"engineer" begins with a vowel sound → an.' }
    ]
  },

  {
    id: 'u08',
    title: { ta: 'இடம் காட்டும் சொற்கள் — in / on / at', en: 'Prepositions' },
    goal: 'Say where something is.',
    grammar: 'The key difference: Tamil attaches the marker **after** the word — "மேசை**யில்**". English puts it **before** — "**on** the table". Hindi works like Tamil and puts it after: "मेज़ **पर**".',
    lines: [
      { ta: 'புத்தகம் மேசையில் உள்ளது.', en: 'The book is on the table.', hi: 'किताब मेज़ पर है।',
        gloss: [['மேசை', 'table', 'मेज़'], ['-யில்', 'on', 'पर']] },
      { ta: 'தண்ணீர் குவளையில் உள்ளது.', en: 'The water is in the glass.', hi: 'पानी गिलास में है।',
        gloss: [['குவளை', 'glass', 'गिलास'], ['-யில்', 'in', 'में']] },
      { ta: 'நான் வீட்டில் இருக்கிறேன்.', en: 'I am at home.', hi: 'मैं घर पर हूँ।',
        gloss: [['வீடு', 'home', 'घर'], ['-டில்', 'at', 'पर']] },
      { ta: 'பூனை மேசைக்கு அடியில் உள்ளது.', en: 'The cat is under the table.', hi: 'बिल्ली मेज़ के नीचे है।',
        gloss: [['அடியில்', 'under', 'के नीचे']] },
      { ta: 'நாங்கள் ஒன்பது மணிக்கு வருவோம்.', en: 'We will come at nine o’clock.', hi: 'हम नौ बजे आएँगे।',
        gloss: [['ஒன்பது மணிக்கு', 'at nine', 'नौ बजे']] },
      { ta: 'அவன் சென்னையிலிருந்து வருகிறான்.', en: 'He comes from Chennai.', hi: 'वह चेन्नई से आता है।',
        gloss: [['-இலிருந்து', 'from', 'से']] }
    ],
    quiz: [
      { q: '"I live ___ Chennai."', opts: ['on', 'at', 'in', 'to'], a: 2, why: 'Cities take "in".' },
      { q: '"The pen is ___ the bag."', opts: ['in', 'on', 'at', 'of'], a: 0, why: 'If it is inside something, use "in".' }
    ]
  },

  {
    id: 'u09',
    title: { ta: 'பணிவான கோரிக்கை', en: 'Polite requests' },
    goal: 'Ask for things politely — in a shop, an office, or while travelling.',
    grammar: '"Can you…" is normal; "Could you…" is more polite. "Please" can go at the start or the end. In Hindi use आप with कीजिए or सकते हैं.',
    lines: [
      { ta: 'தயவுசெய்து எனக்கு உதவ முடியுமா?', en: 'Could you help me, please?', hi: 'क्या आप मेरी मदद कर सकते हैं?',
        gloss: [['முடியுமா', 'could', 'सकते हैं'], ['உதவ', 'help', 'मदद']] },
      { ta: 'கொஞ்சம் தண்ணீர் தர முடியுமா?', en: 'Can I have some water?', hi: 'क्या मुझे थोड़ा पानी मिल सकता है?',
        gloss: [['கொஞ்சம்', 'some', 'थोड़ा'], ['தண்ணீர்', 'water', 'पानी']] },
      { ta: 'மெதுவாகப் பேச முடியுமா?', en: 'Could you speak slowly?', hi: 'क्या आप धीरे बोल सकते हैं?',
        gloss: [['மெதுவாக', 'slowly', 'धीरे'], ['பேச', 'speak', 'बोल']] },
      { ta: 'மீண்டும் சொல்லுங்கள்.', en: 'Please say it again.', hi: 'कृपया फिर से कहिए।',
        gloss: [['மீண்டும்', 'again', 'फिर से'], ['சொல்லுங்கள்', 'say', 'कहिए']] },
      { ta: 'எனக்குப் புரியவில்லை.', en: 'I do not understand.', hi: 'मुझे समझ नहीं आया।',
        gloss: [['எனக்கு', 'I', 'मुझे'], ['புரியவில்லை', 'do not understand', 'समझ नहीं आया']] },
      { ta: 'இதன் விலை என்ன?', en: 'How much does this cost?', hi: 'इसकी कीमत क्या है?',
        gloss: [['விலை', 'cost/price', 'कीमत'], ['என்ன', 'how much/what', 'क्या']] }
    ],
    quiz: [
      { q: 'Which is the most polite?', opts: ['Give me water.', 'I want water.', 'Could you give me some water, please?', 'Water!'], a: 2, why: 'Could + please is the most polite combination.' },
      { q: '"मुझे समझ नहीं आया" means —', opts: ['I know', 'I do not understand', 'I am coming', 'thank you'], a: 1, why: 'समझ means "understanding".' }
    ]
  },

  {
    id: 'u10',
    title: { ta: 'நிஜ வாழ்க்கை — கடை, மருத்துவர், வழி', en: 'Real-life situations' },
    goal: 'Handle everyday situations in all three languages.',
    grammar: 'This unit combines everything so far — question forms, politeness and tense.',
    lines: [
      { ta: 'ரயில் நிலையம் எங்கே உள்ளது?', en: 'Where is the railway station?', hi: 'रेलवे स्टेशन कहाँ है?',
        gloss: [['எங்கே', 'where', 'कहाँ'], ['நிலையம்', 'station', 'स्टेशन']] },
      { ta: 'எனக்கு உடல் நலமில்லை.', en: 'I am not feeling well.', hi: 'मेरी तबीयत ठीक नहीं है।',
        gloss: [['உடல் நலம்', 'feeling well', 'तबीयत ठीक']] },
      { ta: 'எனக்குத் தலைவலி இருக்கிறது.', en: 'I have a headache.', hi: 'मेरे सिर में दर्द है।',
        gloss: [['தலைவலி', 'headache', 'सिर में दर्द'], ['இருக்கிறது', 'have', 'है']] },
      { ta: 'இது மிகவும் விலை அதிகம்.', en: 'This is too expensive.', hi: 'यह बहुत महँगा है।',
        gloss: [['மிகவும்', 'too/very', 'बहुत'], ['விலை அதிகம்', 'expensive', 'महँगा']] },
      { ta: 'விலையைக் குறைக்க முடியுமா?', en: 'Can you reduce the price?', hi: 'क्या आप दाम कम कर सकते हैं?',
        gloss: [['விலை', 'price', 'दाम'], ['குறைக்க', 'reduce', 'कम करना']] },
      { ta: 'எனக்கு உதவி தேவை.', en: 'I need help.', hi: 'मुझे मदद चाहिए।',
        gloss: [['தேவை', 'need', 'चाहिए'], ['உதவி', 'help', 'मदद']] }
    ],
    quiz: [
      { q: '"I have a headache" means —', opts: ['I have a fever', 'I have a headache', 'I am hungry', 'I am sleepy'], a: 1, why: 'A headache is a pain in the head.' },
      { q: '"यह बहुत महँगा है" means —', opts: ['This is cheap', 'This is expensive', 'This is new', 'This is big'], a: 1, why: 'महँगा means expensive.' }
    ]
  }
];
