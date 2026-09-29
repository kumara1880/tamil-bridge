/* Tamil Bridge — Hindi grammar, explained for a Tamil or English speaker.

   Hindi is not English with different words. It has grammatical gender,
   which neither Tamil nor English has; it puts its postpositions after the
   noun; and its past tense makes the verb agree with the object rather than
   the subject, which is the rule that defeats almost every learner.

   Every rule is written three times, and each carries the mistake a Tamil
   or English speaker actually makes — usually the result of translating
   word for word from a language that works differently.                    */
window.TB = window.TB || {};

TB.GRAMMAR_HI = [
  {
    id: 'hi-gender', level: 1,
    title: { en: 'Every Hindi noun is masculine or feminine', ta: 'ஒவ்வொரு சொல்லுக்கும் பால்', hi: 'हर संज्ञा का लिंग' },
    rule: {
      en: 'Hindi gives every noun a gender, even a table or a book. Most words ending in -आ are masculine (लड़का, कमरा) and most ending in -ई are feminine (लड़की, कुर्सी). The gender changes the adjective and the verb, so it cannot be skipped.',
      ta: 'இந்தியில் ஒவ்வொரு பெயர்ச்சொல்லுக்கும் பால் உண்டு — மேசைக்கும் புத்தகத்துக்கும் கூட. -आ முடிபவை பொதுவாக ஆண்பால், -ई முடிபவை பெண்பால். பால் மாறினால் பெயரடையும் வினையும் மாறும்.',
      hi: 'हिंदी में हर संज्ञा का लिंग होता है — मेज़ का भी, किताब का भी। -आ पर ख़त्म होने वाले अधिकतर शब्द पुल्लिंग हैं, -ई पर ख़त्म होने वाले स्त्रीलिंग। लिंग बदलने पर विशेषण और क्रिया भी बदलते हैं।'
    },
    examples: [
      { hi: 'लड़का अच्छा है।', en: 'The boy is good.', ta: 'சிறுவன் நல்லவன்.' },
      { hi: 'लड़की अच्छी है।', en: 'The girl is good.', ta: 'சிறுமி நல்லவள்.' },
      { hi: 'किताब नई है।', en: 'The book is new.', ta: 'புத்தகம் புதியது.' }
    ],
    mistake: {
      wrong: 'लड़की अच्छा है।', right: 'लड़की अच्छी है।',
      why: {
        en: 'The adjective must match the noun. With a feminine noun, अच्छा becomes अच्छी.',
        ta: 'பெயரடை பெயர்ச்சொல்லின் பாலுக்கு ஏற்ப மாற வேண்டும். பெண்பாலுக்கு अच्छा → अच्छी.',
        hi: 'विशेषण संज्ञा के लिंग के अनुसार बदलता है। स्त्रीलिंग के साथ अच्छा → अच्छी।'
      }
    }
  },
  {
    id: 'hi-honorific', level: 1,
    title: { en: 'तू, तुम, आप — three ways to say "you"', ta: 'நீ, நீங்கள் — மூன்று நிலைகள்', hi: 'तू, तुम, आप' },
    rule: {
      en: 'आप is respectful and is what you use with elders, teachers and strangers. तुम is friendly, for friends and younger people. तू is very close or rude depending on who says it — a learner should simply not use it. Each takes a different verb ending.',
      ta: 'आप மரியாதை — பெரியவர்கள், ஆசிரியர், அறியாதவர்களுக்கு. तुम நட்பு — நண்பர்கள், இளையவர்கள். तू மிக நெருக்கம் அல்லது அவமரியாதை; கற்பவர் தவிர்ப்பது நல்லது.',
      hi: 'आप आदर के लिए — बड़ों, शिक्षकों और अजनबियों के साथ। तुम अपनापन — दोस्तों और छोटों के साथ। तू बहुत क़रीबी या अपमानजनक; सीखने वाले को इससे बचना चाहिए।'
    },
    examples: [
      { hi: 'आप कैसे हैं?', en: 'How are you? (respectful)', ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?' },
      { hi: 'तुम कैसे हो?', en: 'How are you? (friendly)', ta: 'நீ எப்படி இருக்கிறாய்?' },
      { hi: 'आप क्या करते हैं?', en: 'What do you do?', ta: 'நீங்கள் என்ன செய்கிறீர்கள்?' }
    ],
    mistake: {
      wrong: 'आप कैसे हो?', right: 'आप कैसे हैं?',
      why: {
        en: 'आप always takes हैं, never हो. हो belongs to तुम.',
        ta: 'आप உடன் எப்போதும் हैं; हो என்பது तुम க்கு உரியது.',
        hi: 'आप के साथ हमेशा हैं आता है, हो नहीं। हो तुम के साथ आता है।'
      }
    }
  },
  {
    id: 'hi-postposition', level: 1,
    title: { en: 'को, से, में, पर — they come after the noun', ta: 'சொல்லுக்குப் பின் வரும் இடைச்சொற்கள்', hi: 'परसर्ग संज्ञा के बाद' },
    rule: {
      en: 'English says "to the school"; Hindi says स्कूल को — the little word comes after. में is in, पर is on, से is from or with, को is to or the object marker, का/के/की is of.',
      ta: 'ஆங்கிலத்தில் "to the school"; இந்தியில் स्कूल को — சிறு சொல் பின்னால் வரும். में = உள்ளே, पर = மேல், से = இருந்து, को = க்கு, का/के/की = உடைய.',
      hi: 'अंग्रेज़ी कहती है "to the school", हिंदी कहती है स्कूल को — छोटा शब्द बाद में आता है। में, पर, से, को, का/के/की।'
    },
    examples: [
      { hi: 'मैं स्कूल में हूँ।', en: 'I am in school.', ta: 'நான் பள்ளியில் இருக்கிறேன்.' },
      { hi: 'किताब मेज़ पर है।', en: 'The book is on the table.', ta: 'புத்தகம் மேசையின் மேல் உள்ளது.' },
      { hi: 'यह राम का घर है।', en: 'This is Ram\'s house.', ta: 'இது ராமின் வீடு.' }
    ],
    mistake: {
      wrong: 'मैं में स्कूल हूँ।', right: 'मैं स्कूल में हूँ।',
      why: {
        en: 'The postposition follows its noun. Putting it in front is English order.',
        ta: 'இடைச்சொல் பெயர்ச்சொல்லுக்குப் பின் வரும். முன்னால் வைப்பது ஆங்கில வரிசை.',
        hi: 'परसर्ग संज्ञा के बाद आता है। पहले रखना अंग्रेज़ी का क्रम है।'
      }
    }
  },
  {
    id: 'hi-ka', level: 2,
    title: { en: 'का, के, की — "of" changes with what follows', ta: 'का / के / की', hi: 'का, के, की' },
    rule: {
      en: 'का before a masculine singular (राम का घर), के before a masculine plural or before another postposition (राम के घर में), की before anything feminine (राम की किताब). It agrees with the thing owned, not the owner.',
      ta: 'ஆண்பால் ஒருமைக்கு का, ஆண்பால் பன்மை அல்லது பிற இடைச்சொல்லுக்கு முன் के, பெண்பாலுக்கு की. உடைமைப் பொருளுக்கு ஏற்ப மாறும், உரிமையாளருக்கு அல்ல.',
      hi: 'पुल्लिंग एकवचन से पहले का, पुल्लिंग बहुवचन या किसी और परसर्ग से पहले के, स्त्रीलिंग से पहले की। यह वस्तु के अनुसार बदलता है, मालिक के अनुसार नहीं।'
    },
    examples: [
      { hi: 'राम का घर', en: 'Ram\'s house', ta: 'ராமின் வீடு' },
      { hi: 'राम की किताब', en: 'Ram\'s book', ta: 'ராமின் புத்தகம்' },
      { hi: 'सीता का भाई', en: 'Sita\'s brother', ta: 'சீதாவின் சகோதரன்' }
    ],
    mistake: {
      wrong: 'सीता की भाई', right: 'सीता का भाई',
      why: {
        en: 'भाई is masculine, so it takes का — even though the owner Sita is feminine.',
        ta: 'भाई ஆண்பால், எனவே का வரும் — உரிமையாளர் சீதா பெண்பாலாக இருந்தாலும்.',
        hi: 'भाई पुल्लिंग है इसलिए का आएगा, चाहे मालिक सीता स्त्रीलिंग हो।'
      }
    }
  },
  {
    id: 'hi-present', level: 1,
    title: { en: 'The present tense: करता हूँ, करती हूँ', ta: 'நிகழ்காலம்', hi: 'वर्तमान काल' },
    rule: {
      en: 'Take the verb stem, add -ता for a man, -ती for a woman, -ते for plural or respect, then हूँ / है / हैं for the person. So a man says मैं करता हूँ and a woman says मैं करती हूँ — the verb tells you who is speaking.',
      ta: 'வினை அடிக்கு ஆணுக்கு -ता, பெண்ணுக்கு -ती, பன்மை/மரியாதைக்கு -ते சேர்த்து, பின் हूँ / है / हैं. ஆண் मैं करता हूँ, பெண் मैं करती हूँ.',
      hi: 'धातु में पुरुष के लिए -ता, स्त्री के लिए -ती, बहुवचन या आदर के लिए -ते जोड़िए, फिर हूँ / है / हैं। पुरुष कहेगा मैं करता हूँ, स्त्री कहेगी मैं करती हूँ।'
    },
    examples: [
      { hi: 'मैं रोज़ स्कूल जाता हूँ।', en: 'I go to school every day. (man)', ta: 'நான் தினமும் பள்ளிக்குச் செல்கிறேன். (ஆண்)' },
      { hi: 'मैं रोज़ स्कूल जाती हूँ।', en: 'I go to school every day. (woman)', ta: 'நான் தினமும் பள்ளிக்குச் செல்கிறேன். (பெண்)' },
      { hi: 'वे काम करते हैं।', en: 'They work.', ta: 'அவர்கள் வேலை செய்கிறார்கள்.' }
    ],
    mistake: {
      wrong: 'मैं जाता है।', right: 'मैं जाता हूँ।',
      why: {
        en: 'मैं always takes हूँ. है belongs to वह.',
        ta: 'मैं உடன் எப்போதும் हूँ. है என்பது वह க்கு.',
        hi: 'मैं के साथ हमेशा हूँ आता है। है वह के साथ आता है।'
      }
    }
  },
  {
    id: 'hi-ne', level: 3,
    title: { en: 'ने — the rule that catches everyone', ta: 'ने — கடினமான விதி', hi: 'ने का नियम' },
    rule: {
      en: 'In the past tense, a transitive verb takes ने after the subject, and then the verb agrees with the OBJECT, not the subject. मैंने किताब पढ़ी — किताब is feminine, so पढ़ी. Intransitive verbs (जाना, आना, सोना) never take ने.',
      ta: 'இறந்தகாலத்தில், செயப்படுபொருள் உள்ள வினைக்கு எழுவாய்க்குப் பின் ने வரும், பின் வினை செயப்படுபொருளுக்கு ஏற்ப மாறும். मैंने किताब पढ़ी — किताब பெண்பால் என்பதால் पढ़ी. जाना, आना போன்றவற்றுக்கு ने வராது.',
      hi: 'भूतकाल में सकर्मक क्रिया के साथ कर्ता के बाद ने आता है, और फिर क्रिया कर्म के अनुसार चलती है, कर्ता के अनुसार नहीं। मैंने किताब पढ़ी। अकर्मक क्रियाओं (जाना, आना, सोना) के साथ ने कभी नहीं आता।'
    },
    examples: [
      { hi: 'मैंने किताब पढ़ी।', en: 'I read the book. (book is feminine)', ta: 'நான் புத்தகம் படித்தேன்.' },
      { hi: 'मैंने खाना खाया।', en: 'I ate the food. (food is masculine)', ta: 'நான் உணவு சாப்பிட்டேன்.' },
      { hi: 'मैं घर गया।', en: 'I went home. (no ने — जाना is intransitive)', ta: 'நான் வீட்டுக்குச் சென்றேன்.' }
    ],
    mistake: {
      wrong: 'मैं किताब पढ़ा।', right: 'मैंने किताब पढ़ी।',
      why: {
        en: 'पढ़ना is transitive, so the past needs ने — and then the verb follows किताब, which is feminine.',
        ta: 'पढ़ना செயப்படுபொருள் வினை, எனவே இறந்தகாலத்தில் ने வேண்டும் — வினை किताब பெண்பாலுக்கு ஏற்ப மாறும்.',
        hi: 'पढ़ना सकर्मक है, इसलिए भूतकाल में ने चाहिए — और क्रिया किताब के अनुसार चलेगी।'
      }
    }
  },
  {
    id: 'hi-future', level: 2,
    title: { en: 'The future: करूँगा, करेंगे', ta: 'எதிர்காலம்', hi: 'भविष्यत् काल' },
    rule: {
      en: 'Add -ऊँगा / -ऊँगी for मैं, -ओगे for तुम, -एगा / -एगी for वह, -एंगे for हम / आप / वे. The gender still shows: a man says करूँगा, a woman करूँगी.',
      ta: 'मैं க்கு -ऊँगा / -ऊँगी, तुम க்கு -ओगे, वह க்கு -एगा / -एगी, हम / आप / वे க்கு -एंगे. பால் இங்கும் தெரியும்.',
      hi: 'मैं के लिए -ऊँगा / -ऊँगी, तुम के लिए -ओगे, वह के लिए -एगा / -एगी, हम / आप / वे के लिए -एंगे। लिंग यहाँ भी दिखता है।'
    },
    examples: [
      { hi: 'मैं कल आऊँगा।', en: 'I will come tomorrow. (man)', ta: 'நான் நாளை வருவேன். (ஆண்)' },
      { hi: 'मैं कल आऊँगी।', en: 'I will come tomorrow. (woman)', ta: 'நான் நாளை வருவேன். (பெண்)' },
      { hi: 'हम साथ जाएँगे।', en: 'We will go together.', ta: 'நாங்கள் ஒன்றாகச் செல்வோம்.' }
    ],
    mistake: {
      wrong: 'मैं कल आएगा।', right: 'मैं कल आऊँगा।',
      why: {
        en: 'आएगा belongs to वह. For मैं the ending is -ऊँगा or -ऊँगी.',
        ta: 'आएगा என்பது वह க்கு. मैं க்கு -ऊँगा / -ऊँगी.',
        hi: 'आएगा वह के लिए है। मैं के लिए -ऊँगा या -ऊँगी।'
      }
    }
  },
  {
    id: 'hi-negative', level: 1,
    title: { en: 'नहीं, मत, ना — three ways to say no', ta: 'மறுப்பு: नहीं, मत, ना', hi: 'नहीं, मत, न' },
    rule: {
      en: 'नहीं for an ordinary negative (मैं नहीं जाऊँगा). मत for telling someone not to do something (मत जाओ — don\'t go). न is bookish or used in tags. नहीं normally comes just before the verb.',
      ta: 'சாதாரண மறுப்புக்கு नहीं. ஒருவரைத் தடுக்க मत (मत जाओ — போகாதே). न நூல்வழக்கு. नहीं பொதுவாக வினைக்கு முன் வரும்.',
      hi: 'साधारण निषेध के लिए नहीं। किसी को रोकने के लिए मत। न किताबी या पूँछ-प्रश्न में। नहीं आमतौर पर क्रिया से ठीक पहले आता है।'
    },
    examples: [
      { hi: 'मैं नहीं जाऊँगा।', en: 'I will not go.', ta: 'நான் போகமாட்டேன்.' },
      { hi: 'वहाँ मत जाओ।', en: 'Don\'t go there.', ta: 'அங்கே போகாதே.' },
      { hi: 'मुझे चाय नहीं चाहिए।', en: 'I don\'t want tea.', ta: 'எனக்கு தேநீர் வேண்டாம்.' }
    ],
    mistake: {
      wrong: 'नहीं जाओ।', right: 'मत जाओ।',
      why: {
        en: 'When you are telling someone not to do something, Hindi uses मत, not नहीं.',
        ta: 'ஒருவரைத் தடுக்கும்போது இந்தி मत பயன்படுத்தும், नहीं அல்ல.',
        hi: 'किसी को रोकते समय हिंदी मत का प्रयोग करती है, नहीं का नहीं।'
      }
    }
  },
  {
    id: 'hi-question', level: 1,
    title: { en: 'Asking in Hindi', ta: 'இந்தியில் கேள்வி', hi: 'प्रश्न पूछना' },
    rule: {
      en: 'For yes or no, put क्या at the front: क्या आप आएँगे? For other questions use क्या (what), कौन (who), कहाँ (where), कब (when), क्यों (why), कैसे (how), कितना (how much) — and these sit just before the verb, not at the front.',
      ta: 'ஆம்/இல்லை கேள்விக்கு முன்னால் क्या. மற்ற கேள்விகளுக்கு क्या, कौन, कहाँ, कब, क्यों, कैसे, कितना — இவை வினைக்கு முன் வரும், முதலில் அல்ல.',
      hi: 'हाँ/ना के लिए शुरू में क्या लगाइए। बाकी प्रश्नों में क्या, कौन, कहाँ, कब, क्यों, कैसे, कितना — ये क्रिया से ठीक पहले आते हैं, शुरू में नहीं।'
    },
    examples: [
      { hi: 'क्या आप हिंदी बोलते हैं?', en: 'Do you speak Hindi?', ta: 'நீங்கள் இந்தி பேசுவீர்களா?' },
      { hi: 'आप कहाँ रहते हैं?', en: 'Where do you live?', ta: 'நீங்கள் எங்கே வசிக்கிறீர்கள்?' },
      { hi: 'यह कितने का है?', en: 'How much is this?', ta: 'இது எவ்வளவு?' }
    ],
    mistake: {
      wrong: 'कहाँ आप रहते हैं?', right: 'आप कहाँ रहते हैं?',
      why: {
        en: 'The question word goes before the verb, not at the start as in English.',
        ta: 'கேள்விச் சொல் வினைக்கு முன் வரும், ஆங்கிலம் போல முதலில் அல்ல.',
        hi: 'प्रश्नवाचक शब्द क्रिया से पहले आता है, अंग्रेज़ी की तरह शुरू में नहीं।'
      }
    }
  },
  {
    id: 'hi-plural', level: 2,
    title: { en: 'One and many in Hindi', ta: 'ஒருமை – பன்மை', hi: 'एकवचन और बहुवचन' },
    rule: {
      en: 'Masculine -आ becomes -ए (लड़का → लड़के). Feminine -ई becomes -इयाँ (लड़की → लड़कियाँ). Feminine words not ending in -ई add -एँ (किताब → किताबें). Many masculine words do not change at all (घर → घर).',
      ta: 'ஆண்பால் -आ → -ए. பெண்பால் -ई → -इयाँ. -ई இல்லாத பெண்பால் -एँ சேர்க்கும். பல ஆண்பால் சொற்கள் மாறாது.',
      hi: 'पुल्लिंग -आ → -ए। स्त्रीलिंग -ई → -इयाँ। -ई रहित स्त्रीलिंग में -एँ। बहुत से पुल्लिंग शब्द बदलते ही नहीं।'
    },
    examples: [
      { hi: 'एक लड़का, दो लड़के', en: 'one boy, two boys', ta: 'ஒரு சிறுவன், இரண்டு சிறுவர்கள்' },
      { hi: 'एक लड़की, दो लड़कियाँ', en: 'one girl, two girls', ta: 'ஒரு சிறுமி, இரண்டு சிறுமிகள்' },
      { hi: 'एक किताब, दो किताबें', en: 'one book, two books', ta: 'ஒரு புத்தகம், இரண்டு புத்தகங்கள்' }
    ],
    mistake: {
      wrong: 'दो लड़कियों आईं।', right: 'दो लड़कियाँ आईं।',
      why: {
        en: 'लड़कियों is the form used before a postposition. On its own the plural is लड़कियाँ.',
        ta: 'लड़कियों என்பது இடைச்சொல்லுக்கு முன் வரும் வடிவம். தனியாக பன்மை लड़कियाँ.',
        hi: 'लड़कियों रूप परसर्ग से पहले आता है। अकेले बहुवचन लड़कियाँ है।'
      }
    }
  },
  {
    id: 'hi-chahiye', level: 2,
    title: { en: 'चाहिए — wanting and needing', ta: 'வேண்டும் — चाहिए', hi: 'चाहिए का प्रयोग' },
    rule: {
      en: 'For "I want" or "I need", Hindi says मुझे ... चाहिए — literally "to me ... is wanted". The person takes को (मुझे, तुम्हें, उसे), and चाहिए agrees with the thing wanted.',
      ta: '"எனக்கு வேண்டும்" என்பதற்கு இந்தி मुझे ... चाहिए என்கிறது. நபர் को எடுப்பார் (मुझे, तुम्हें, उसे), चाहिए பொருளுக்கு ஏற்ப மாறும்.',
      hi: '"मुझे चाहिए" — व्यक्ति को परसर्ग लेता है और चाहिए वस्तु के अनुसार चलता है।'
    },
    examples: [
      { hi: 'मुझे पानी चाहिए।', en: 'I want water.', ta: 'எனக்கு தண்ணீர் வேண்டும்.' },
      { hi: 'मुझे दो किताबें चाहिए।', en: 'I need two books.', ta: 'எனக்கு இரண்டு புத்தகங்கள் வேண்டும்.' },
      { hi: 'आपको क्या चाहिए?', en: 'What do you want?', ta: 'உங்களுக்கு என்ன வேண்டும்?' }
    ],
    mistake: {
      wrong: 'मैं पानी चाहिए।', right: 'मुझे पानी चाहिए।',
      why: {
        en: 'The person takes को, giving मुझे — never मैं with चाहिए.',
        ta: 'நபர் को எடுப்பார் — मुझे; चाहिए உடன் मैं வராது.',
        hi: 'व्यक्ति को परसर्ग लेता है — मुझे; चाहिए के साथ मैं नहीं आता।'
      }
    }
  },
  {
    id: 'hi-respect', level: 2,
    title: { en: 'Speaking respectfully', ta: 'மரியாதையாகப் பேசுதல்', hi: 'आदर से बोलना' },
    rule: {
      en: 'With आप the verb takes the plural ending even for one person: आप जाइए. Adding जी to a name or a word is a simple, always-safe courtesy: हाँ जी, नमस्ते जी, रमेश जी.',
      ta: 'आप உடன் ஒருவருக்கும் பன்மை வடிவம்: आप जाइए. பெயருடன் जी சேர்ப்பது எப்போதும் பாதுகாப்பான மரியாதை.',
      hi: 'आप के साथ एक व्यक्ति के लिए भी बहुवचन रूप आता है: आप जाइए। नाम या शब्द के साथ जी लगाना हमेशा सुरक्षित शिष्टाचार है।'
    },
    examples: [
      { hi: 'कृपया बैठिए।', en: 'Please sit down.', ta: 'தயவுசெய்து அமருங்கள்.' },
      { hi: 'आप कहाँ जा रहे हैं?', en: 'Where are you going?', ta: 'நீங்கள் எங்கே செல்கிறீர்கள்?' },
      { hi: 'रमेश जी, नमस्ते।', en: 'Hello, Ramesh ji.', ta: 'ரமேஷ் அவர்களே, வணக்கம்.' }
    ],
    mistake: {
      wrong: 'आप बैठो।', right: 'आप बैठिए।',
      why: {
        en: 'बैठो is the तुम form. With आप the polite imperative is बैठिए.',
        ta: 'बैठो என்பது तुम வடிவம். आप உடன் मरியாதை வடிவம் बैठिए.',
        hi: 'बैठो तुम का रूप है। आप के साथ आदरसूचक रूप बैठिए है।'
      }
    }
  }
];
