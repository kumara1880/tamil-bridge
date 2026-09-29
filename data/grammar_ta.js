/* Tamil Bridge — Tamil grammar, explained for an English or Hindi speaker,
   and for a Tamil child who speaks the language but has to learn to write it.

   The app promised three languages and delivered two: there was English
   grammar and Hindi grammar and nothing at all for Tamil, which is the one
   language the whole site is named after.

   Tamil is not English with different words and it is not Hindi either. It
   has no prepositions and no articles; it has no masculine and feminine but
   a quite different division into things that can be "who" and things that
   can only be "what"; its verb carries the person inside it, so the pronoun
   can be left out; and the language it is written in is not the language it
   is spoken in, which trips up the children who grew up hearing it.

   Every rule is written three times, and each carries the mistake people
   actually make — including the mistakes native speakers make in writing. */
window.TB = window.TB || {};

TB.GRAMMAR_TA = [
  {
    id: 'ta-order', level: 1,
    title: { en: 'The verb comes last', ta: 'வினை கடைசியில் வரும்', hi: 'क्रिया अंत में आती है' },
    rule: {
      en: 'A Tamil sentence ends with its verb. English says "I eat rice"; Tamil says நான் சாதம் சாப்பிடுகிறேன் — I, rice, eat. Everything the verb acts on comes before it, and however much else moves around, the verb stays at the end. Hindi works the same way, so a Hindi speaker already has the habit.',
      ta: 'தமிழ் வாக்கியம் வினையுடன் முடியும். ஆங்கிலம் "I eat rice" என்கிறது; தமிழ் "நான் சாதம் சாப்பிடுகிறேன்" என்கிறது — எழுவாய், செயப்படுபொருள், வினை. வினை செயல்படும் பொருள்கள் அனைத்தும் அதற்கு முன் வரும்; வேறு எது இடம் மாறினாலும் வினை கடைசியிலேயே நிற்கும்.',
      hi: 'तमिल वाक्य क्रिया पर ख़त्म होता है। अंग्रेज़ी कहती है "I eat rice"; तमिल कहती है நான் சாதம் சாப்பிடுகிறேன் — कर्ता, कर्म, क्रिया। हिंदी भी इसी क्रम में चलती है, इसलिए हिंदी जानने वाले के लिए यह पहले से जाना-पहचाना है।'
    },
    examples: [
      { ta: 'நான் பள்ளிக்குச் செல்கிறேன்.', en: 'I go to school.', hi: 'मैं स्कूल जाता हूँ।' },
      { ta: 'அவள் புத்தகம் படிக்கிறாள்.', en: 'She reads a book.', hi: 'वह किताब पढ़ती है।' },
      { ta: 'நாங்கள் நாளை வருவோம்.', en: 'We will come tomorrow.', hi: 'हम कल आएँगे।' }
    ],
    mistake: {
      wrong: 'நான் சாப்பிடுகிறேன் சாதம்.', right: 'நான் சாதம் சாப்பிடுகிறேன்.',
      why: {
        en: 'The verb cannot be pulled into the middle the way English puts it there. Whatever the verb acts on stands in front of it.',
        ta: 'ஆங்கிலம் போல வினையை நடுவில் கொண்டுவர முடியாது. வினை செயல்படும் பொருள் அதற்கு முன்பே நிற்க வேண்டும்.',
        hi: 'अंग्रेज़ी की तरह क्रिया को बीच में नहीं लाया जा सकता। क्रिया जिस पर काम करती है, वह उससे पहले आता है।'
      }
    }
  },
  {
    id: 'ta-case', level: 1,
    title: { en: 'Endings instead of prepositions', ta: 'வேற்றுமை உருபுகள்', hi: 'परसर्ग के बदले अंत-प्रत्यय' },
    rule: {
      en: 'Tamil has no prepositions at all. Where English puts a small word in front — to the school, with a spoon, in the house — Tamil sticks an ending on the back of the noun: பள்ளிக்கு, கரண்டியால், வீட்டில். The main endings are ஐ (the object), ஆல் (by, with), கு (to, for), இன் (of), இல் (in, at) and ஓடு (along with). Hindi does something similar with को, से, में — but keeps them as separate words, where Tamil joins them on.',
      ta: 'தமிழில் முன்னிடைச்சொல் என்பதே இல்லை. ஆங்கிலம் சொல்லுக்கு முன் வைப்பதை — to the school, with a spoon, in the house — தமிழ் பெயர்ச்சொல்லின் பின் உருபாக ஒட்டிக்கொள்கிறது: பள்ளிக்கு, கரண்டியால், வீட்டில். முதன்மையான உருபுகள்: ஐ, ஆல், கு, இன், இல், ஓடு.',
      hi: 'तमिल में पूर्वसर्ग होते ही नहीं। अंग्रेज़ी जो छोटा शब्द पहले रखती है, तमिल वही संज्ञा के पीछे जोड़ देती है: பள்ளிக்கு (स्कूल को), கரண்டியால் (चम्मच से), வீட்டில் (घर में)। हिंदी के को, से, में अलग शब्द रहते हैं; तमिल उन्हें शब्द के साथ मिला देती है।'
    },
    examples: [
      { ta: 'நான் பள்ளிக்குப் போகிறேன்.', en: 'I go to school.', hi: 'मैं स्कूल जाता हूँ।' },
      { ta: 'கரண்டியால் சாப்பிடு.', en: 'Eat with a spoon.', hi: 'चम्मच से खाओ।' },
      { ta: 'அவன் வீட்டில் இருக்கிறான்.', en: 'He is in the house.', hi: 'वह घर में है।' }
    ],
    mistake: {
      wrong: 'நான் பள்ளி போகிறேன்.', right: 'நான் பள்ளிக்குப் போகிறேன்.',
      why: {
        en: 'பள்ளி on its own is just the word "school". Without -க்கு nothing has said that you are going *to* it.',
        ta: 'பள்ளி என்பது வெறும் பெயர்ச்சொல். -க்கு உருபு இல்லாவிட்டால் எங்கே செல்கிறாய் என்பது சொல்லப்படவில்லை.',
        hi: 'பள்ளி अकेले सिर्फ़ "स्कूल" है। -க்கு लगाए बिना यह कहा ही नहीं गया कि स्कूल "को" जा रहे हैं।'
      }
    }
  },
  {
    id: 'ta-person', level: 1,
    title: { en: 'The verb already says who', ta: 'வினையே ஆளைச் சொல்லும்', hi: 'क्रिया ही बता देती है कौन' },
    rule: {
      en: 'A Tamil verb carries the person inside it, so the pronoun can be dropped and usually is. சாப்பிடுகிறேன் can only mean *I* eat; சாப்பிடுகிறாள் can only mean *she* eats. The endings are ஏன் (I), ஆய் (you), ஆன் / ஆள் / ஆர் (he / she / respected), ஓம் (we), ஈர்கள் (you, plural or polite) and ஆர்கள் (they). English cannot do this at all, and Hindi only marks gender and number, never the person.',
      ta: 'தமிழ் வினை தன்னுள்ளேயே ஆளைச் சுமக்கிறது; அதனால் பெயர்ச்சொல்லை விட்டுவிடலாம், பெரும்பாலும் விட்டுவிடுவர். "சாப்பிடுகிறேன்" என்றால் நான் என்றுதான் பொருள்; "சாப்பிடுகிறாள்" என்றால் அவள் என்றுதான். விகுதிகள்: ஏன், ஆய், ஆன் / ஆள் / ஆர், ஓம், ஈர்கள், ஆர்கள்.',
      hi: 'तमिल क्रिया के भीतर ही पुरुष छिपा होता है, इसलिए सर्वनाम छोड़ा जा सकता है और आम तौर पर छोड़ा जाता है। சாப்பிடுகிறேன் का अर्थ केवल "मैं खाता हूँ" हो सकता है। हिंदी सिर्फ़ लिंग और वचन दिखाती है, पुरुष नहीं; अंग्रेज़ी तो यह कर ही नहीं सकती।'
    },
    examples: [
      { ta: 'வருகிறேன்.', en: 'I am coming. (no pronoun needed)', hi: 'मैं आ रहा हूँ। (सर्वनाम की ज़रूरत नहीं)' },
      { ta: 'அவள் பாடுகிறாள்.', en: 'She sings.', hi: 'वह गाती है।' },
      { ta: 'அவர்கள் விளையாடுகிறார்கள்.', en: 'They play.', hi: 'वे खेलते हैं।' }
    ],
    mistake: {
      wrong: 'நான் சாப்பிடுகிறாள்.', right: 'நான் சாப்பிடுகிறேன்.',
      why: {
        en: 'The ending and the subject have to agree. -ஆள் belongs to அவள்; with நான் the verb must end in -ஏன்.',
        ta: 'விகுதியும் எழுவாயும் ஒத்திருக்க வேண்டும். -ஆள் என்பது அவளுக்கு உரியது; நான் என்றால் வினை -ஏன் இல் முடிய வேண்டும்.',
        hi: 'अंत-प्रत्यय और कर्ता का मेल ज़रूरी है। -ஆள் அவள் का है; நான் के साथ क्रिया -ஏன் पर ख़त्म होनी चाहिए।'
      }
    }
  },
  {
    id: 'ta-tense', level: 1,
    title: { en: 'Root + tense + person', ta: 'பகுதி + இடைநிலை + விகுதி', hi: 'धातु + काल + पुरुष' },
    rule: {
      en: 'A Tamil verb is built in three pieces in a fixed order: the root, then the tense, then the person. படி + த்த் + ஏன் = படித்தேன், I read. The past marker is த் / ந் / ன், the present கிற் / கின்ற், the future வ் / ப். Because the tense sits in the middle, changing when something happened changes the middle of the word, not a helper in front of it.',
      ta: 'தமிழ் வினை மூன்று உறுப்புகளால் ஆனது, மாறாத வரிசையில்: பகுதி, இடைநிலை, விகுதி. படி + த்த் + ஏன் = படித்தேன். இறந்தகாலம் த் / ந் / ன், நிகழ்காலம் கிற் / கின்ற், எதிர்காலம் வ் / ப். காலம் நடுவில் இருப்பதால், காலம் மாறினால் சொல்லின் நடுவே மாறும்.',
      hi: 'तमिल क्रिया तीन हिस्सों से बनती है, तय क्रम में: धातु, फिर काल, फिर पुरुष। படி + த்த் + ஏன் = படித்தேன் (मैंने पढ़ा)। भूत का चिह्न த் / ந் / ன், वर्तमान का கிற், भविष्य का வ் / ப். काल बीच में बैठता है, इसलिए समय बदलने पर शब्द का बीच बदलता है, आगे कोई सहायक क्रिया नहीं जुड़ती।'
    },
    examples: [
      { ta: 'படித்தேன் — படி + த்த் + ஏன்', en: 'I read (past)', hi: 'मैंने पढ़ा (भूत)' },
      { ta: 'படிக்கிறேன் — படி + க்கிற் + ஏன்', en: 'I read (present)', hi: 'मैं पढ़ता हूँ (वर्तमान)' },
      { ta: 'படிப்பேன் — படி + ப்ப் + ஏன்', en: 'I will read (future)', hi: 'मैं पढ़ूँगा (भविष्य)' }
    ],
    mistake: {
      wrong: 'நான் நேற்று படிக்கிறேன்.', right: 'நான் நேற்று படித்தேன்.',
      why: {
        en: 'நேற்று means yesterday, so the tense in the middle of the verb has to be the past one. Tamil will not let the time word and the verb disagree.',
        ta: 'நேற்று என்பது இறந்த காலம்; அதனால் வினையின் நடுவிலுள்ள இடைநிலையும் இறந்தகாலமாக இருக்க வேண்டும். காலச்சொல்லும் வினையும் மாறுபடக் கூடாது.',
        hi: 'நேற்று का अर्थ "कल (बीता हुआ)" है, इसलिए क्रिया के बीच का काल-चिह्न भी भूतकाल का होना चाहिए।'
      }
    }
  },
  {
    id: 'ta-negative', level: 2,
    title: { en: 'Three different noes', ta: 'இல்லை, அல்ல, மாட்ட', hi: 'तीन तरह का "नहीं"' },
    rule: {
      en: 'Tamil has no single word for "not". இல்லை denies that something exists or happened. அல்ல denies that one thing is another. The future uses மாட்ட: வரமாட்டேன், I will not come. Notice what happens to the verb: it goes back to its bare form and loses its tense marker altogether, because the negative word now carries the time.',
      ta: 'தமிழில் "not" என்பதற்கு ஒரே சொல் இல்லை. இல்லை — நிகழவில்லை, இருக்கவில்லை என மறுக்கிறது. அல்ல — ஒன்று மற்றொன்று அன்று என மறுக்கிறது. எதிர்காலத்துக்கு மாட்ட: வரமாட்டேன். வினை தன் காலஇடைநிலையை இழந்து முதனிலையாகிவிடும்; காலத்தை இப்போது மறுப்புச் சொல் சுமக்கிறது.',
      hi: 'तमिल में "नहीं" के लिए एक शब्द नहीं है। இல்லை कहता है कि हुआ ही नहीं या है ही नहीं। அல்ல कहता है कि एक चीज़ दूसरी नहीं है। भविष्य के लिए மாட்ட: வரமாட்டேன் (मैं नहीं आऊँगा)। ध्यान दें: क्रिया अपना काल-चिह्न खो देती है, क्योंकि अब समय नकार वाला शब्द उठाता है।'
    },
    examples: [
      { ta: 'நான் வரவில்லை.', en: 'I did not come.', hi: 'मैं नहीं आया।' },
      { ta: 'அவன் மாணவன் அல்ல.', en: 'He is not a student.', hi: 'वह विद्यार्थी नहीं है।' },
      { ta: 'நான் நாளை வரமாட்டேன்.', en: 'I will not come tomorrow.', hi: 'मैं कल नहीं आऊँगा।' }
    ],
    mistake: {
      wrong: 'நான் வந்தேன் இல்லை.', right: 'நான் வரவில்லை.',
      why: {
        en: 'The negative does not sit behind a finished verb the way English puts "not" after "did". வந்தேன் already means "I came"; the verb has to go back to வர before இல்லை can deny it.',
        ta: 'முற்றுப்பெற்ற வினைக்குப் பின் மறுப்பு வராது. வந்தேன் என்றால் வந்துவிட்டேன் என்று பொருள்; இல்லை மறுக்க வேண்டுமானால் வினை "வர" என்ற நிலைக்குத் திரும்ப வேண்டும்.',
        hi: 'नकार पूरी हो चुकी क्रिया के पीछे नहीं लगता। வந்தேன் का अर्थ ही "मैं आया" है; इல்லை से नकारने के लिए क्रिया को वापस வர बनना पड़ता है।'
      }
    }
  },
  {
    id: 'ta-question', level: 1,
    title: { en: 'Questions are made with ஆ', ta: 'ஆ சேர்த்தால் வினா', hi: 'सवाल ஆ से बनता है' },
    rule: {
      en: 'A yes-or-no question in Tamil is made by adding ஆ to the end of the word you are asking about. The word order does not change at all — nothing moves to the front the way English moves "do" and "will". வருகிறாய் is "you are coming"; வருகிறாயா? is "are you coming?". For other questions use the எ- words: எங்கே, எப்போது, ஏன், எப்படி, யார், என்ன.',
      ta: 'ஆம்–இல்லை வினாவை, நீ எதைப் பற்றிக் கேட்கிறாயோ அச்சொல்லின் இறுதியில் ஆ சேர்த்துச் செய்கிறோம். சொல் வரிசை சிறிதும் மாறாது — ஆங்கிலம் போல எதுவும் முன்னால் நகராது. வருகிறாய் → வருகிறாயா? பிற வினாக்களுக்கு எ- வினாச்சொற்கள்: எங்கே, எப்போது, ஏன், எப்படி, யார், என்ன.',
      hi: 'तमिल में हाँ-ना वाला सवाल उस शब्द के अंत में ஆ जोड़कर बनता है जिसके बारे में पूछ रहे हैं। शब्द-क्रम बिल्कुल नहीं बदलता — अंग्रेज़ी की तरह कुछ आगे नहीं आता। வருகிறாய் → வருகிறாயா? बाकी सवालों के लिए எ- शब्द: எங்கே (कहाँ), எப்போது (कब), ஏன் (क्यों), யார் (कौन), என்ன (क्या)।'
    },
    examples: [
      { ta: 'நீ வருகிறாயா?', en: 'Are you coming?', hi: 'क्या तुम आ रहे हो?' },
      { ta: 'இது உன் புத்தகமா?', en: 'Is this your book?', hi: 'क्या यह तुम्हारी किताब है?' },
      { ta: 'நீ எங்கே போகிறாய்?', en: 'Where are you going?', hi: 'तुम कहाँ जा रहे हो?' }
    ],
    mistake: {
      wrong: 'நீ வருகிறாய்?', right: 'நீ வருகிறாயா?',
      why: {
        en: 'In speech the tone of your voice is enough, but in writing a question mark on its own is not. Tamil marks the question inside the word, with ஆ.',
        ta: 'பேசும்போது குரலின் ஏற்ற இறக்கம் போதும்; எழுதும்போது வினாக்குறி மட்டும் போதாது. தமிழ் வினாவைச் சொல்லுக்குள்ளேயே ஆ வால் குறிக்கிறது.',
        hi: 'बोलते समय आवाज़ का उतार-चढ़ाव काफ़ी है, पर लिखने में अकेला प्रश्नचिह्न काफ़ी नहीं। तमिल सवाल को शब्द के भीतर ஆ से दिखाती है।'
      }
    }
  },
  {
    id: 'ta-plural', level: 1,
    title: { en: 'Making a word plural with கள்', ta: 'பன்மை — கள் விகுதி', hi: 'बहुवचन कள் से' },
    rule: {
      en: 'Tamil makes a plural by adding கள்: பையன் → பையன்கள், புத்தகம் → புத்தகங்கள். Notice the second one: when a word ends in ம், the ம் turns into ங் before கள். That single change catches out almost everybody, including children who have spoken Tamil all their lives.',
      ta: 'தமிழ் கள் விகுதி சேர்த்துப் பன்மை ஆக்குகிறது: பையன் → பையன்கள், புத்தகம் → புத்தகங்கள். இரண்டாவதைக் கவனி: சொல் ம் இல் முடிந்தால், கள் சேரும் முன் ம் ஆனது ங் ஆக மாறும். இந்த ஒரே மாற்றம்தான் கிட்டத்தட்ட எல்லாரையும் — தமிழ் பேசி வளர்ந்த குழந்தைகளையும் சேர்த்து — தடுமாற வைக்கிறது.',
      hi: 'तमिल कள் जोड़कर बहुवचन बनाती है: பையன் → பையன்கள், புத்தகம் → புத்தகங்கள். दूसरे पर ध्यान दें: जब शब्द ம் पर ख़त्म होता है, तो कள் से पहले ம் बदलकर ங் हो जाता है। यही एक बदलाव लगभग सबको उलझाता है।'
    },
    examples: [
      { ta: 'பையன் → பையன்கள்', en: 'boy → boys', hi: 'लड़का → लड़के' },
      { ta: 'புத்தகம் → புத்தகங்கள்', en: 'book → books', hi: 'किताब → किताबें' },
      { ta: 'மரம் → மரங்கள்', en: 'tree → trees', hi: 'पेड़ → पेड़' }
    ],
    mistake: {
      wrong: 'மரம்கள்', right: 'மரங்கள்',
      why: {
        en: 'ம் cannot stand in front of கள். It becomes ங், which is why the plural of a word ending in -ம் always ends in -ங்கள்.',
        ta: 'ம் என்பது கள் முன் நிற்க முடியாது; அது ங் ஆகிவிடும். -ம் இல் முடியும் சொல்லின் பன்மை எப்போதும் -ங்கள் இல் முடிவதற்குக் காரணம் இதுவே.',
        hi: 'ம் கள் के आगे नहीं टिक सकता; वह ங் बन जाता है। इसीलिए -ம் पर ख़त्म होने वाले शब्द का बहुवचन हमेशा -ங்கள் पर ख़त्म होता है।'
      }
    }
  },
  {
    id: 'ta-thinai', level: 2,
    title: { en: 'Not male and female — "who" and "what"', ta: 'உயர்திணை, அஃறிணை', hi: 'लिंग नहीं — "कौन" और "क्या"' },
    rule: {
      en: 'Tamil does not divide its nouns into masculine and feminine the way Hindi does. It divides them into உயர்திணை — people and gods, anything you would call *who* — and அஃறிணை, everything else: animals, plants, things, ideas. The verb ending follows that division, not gender. அவன் வந்தான், but மாடு வந்தது. A Hindi speaker has to unlearn the habit of asking whether a table is male.',
      ta: 'தமிழ் பெயர்ச்சொற்களை ஆண்பால் பெண்பால் என இந்தி போலப் பிரிப்பதில்லை. உயர்திணை — மனிதரும் தெய்வமும், "யார்" என்று கேட்கக்கூடியவை; அஃறிணை — மற்ற அனைத்தும்: விலங்கு, மரம், பொருள், கருத்து. வினைவிகுதி இந்தப் பிரிவையே பின்பற்றும், பாலை அல்ல. அவன் வந்தான்; ஆனால் மாடு வந்தது.',
      hi: 'तमिल संज्ञाओं को पुल्लिंग-स्त्रीलिंग में नहीं बाँटती, जैसे हिंदी बाँटती है। वह उन्हें उயர்திணை — मनुष्य और देवता, जिन्हें "कौन" कहा जा सके — और அஃறிணை — बाकी सब: जानवर, पेड़, चीज़ें, विचार — में बाँटती है। क्रिया का अंत इसी विभाजन का अनुसरण करता है। हिंदी वाले को यह पूछने की आदत छोड़नी होगी कि मेज़ पुल्लिंग है या नहीं।'
    },
    examples: [
      { ta: 'அவன் வந்தான்.', en: 'He came. (a person)', hi: 'वह आया। (मनुष्य)' },
      { ta: 'மாடு வந்தது.', en: 'The cow came. (not a person)', hi: 'गाय आई। (मनुष्य नहीं)' },
      { ta: 'மரங்கள் வளர்ந்தன.', en: 'The trees grew.', hi: 'पेड़ बढ़े।' }
    ],
    mistake: {
      wrong: 'நாய் வந்தான்.', right: 'நாய் வந்தது.',
      why: {
        en: 'A dog is அஃறிணை, however much you love it, so its verb takes -அது. The ending -ஆன் belongs only to a man.',
        ta: 'நாய் எவ்வளவு அன்புக்குரியதாயினும் அஃறிணையே; அதன் வினை -அது விகுதி பெறும். -ஆன் என்பது ஆண்மகனுக்கு மட்டுமே உரியது.',
        hi: 'कुत्ता चाहे कितना प्यारा हो, वह அஃறிணை है, इसलिए उसकी क्रिया -அது लेती है। -ஆன் केवल पुरुष के लिए है।'
      }
    }
  },
  {
    id: 'ta-respect', level: 1,
    title: { en: 'நீ and நீங்கள்', ta: 'நீ, நீங்கள் — மரியாதை', hi: 'நீ और நீங்கள் — आदर' },
    rule: {
      en: 'நீ is for a friend, a child or someone younger. நீங்கள் — literally the plural "you" — is how you speak to an elder, a teacher, a customer or a stranger, and it takes the plural verb ending -ஈர்கள். This is not a nicety in Tamil; using நீ to an elder is heard as rudeness. Hindi has the same three-step ladder with तू, तुम and आप.',
      ta: 'நீ என்பது நண்பர், குழந்தை, இளையவருக்கு. நீங்கள் — பன்மை வடிவம் — பெரியவர், ஆசிரியர், வாடிக்கையாளர், அறியாதவர் ஆகியோருக்கு; அது -ஈர்கள் விகுதியை ஏற்கும். இது சிறு நாகரிகம் அல்ல; பெரியவரிடம் நீ என்பது அவமரியாதையாகவே கேட்கும்.',
      hi: 'நீ दोस्त, बच्चे या छोटे के लिए है। நீங்கள் — शब्दशः बहुवचन "तुम" — बड़ों, शिक्षकों, ग्राहकों और अजनबियों के लिए, और यह बहुवचन अंत -ஈர்கள் लेता है। यह छोटी-सी शिष्टाचार की बात नहीं; बड़े को நீ कहना अशिष्टता सुनाई देती है। हिंदी में भी तू, तुम, आप की वही सीढ़ी है।'
    },
    examples: [
      { ta: 'நீ எப்படி இருக்கிறாய்?', en: 'How are you? (to a friend)', hi: 'तुम कैसे हो? (दोस्त से)' },
      { ta: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', en: 'How are you? (respectful)', hi: 'आप कैसे हैं? (आदर से)' },
      { ta: 'ஐயா, நீங்கள் உட்காருங்கள்.', en: 'Sir, please sit down.', hi: 'श्रीमान, आप बैठिए।' }
    ],
    mistake: {
      wrong: 'ஐயா, நீ எப்படி இருக்கிறாய்?', right: 'ஐயா, நீங்கள் எப்படி இருக்கிறீர்கள்?',
      why: {
        en: 'If you have called somebody ஐயா you cannot then call them நீ. The pronoun and the verb ending both have to rise to the respectful form.',
        ta: 'ஐயா என்று அழைத்தபின் நீ என்று சொல்ல முடியாது. பெயரும் வினைவிகுதியும் இரண்டுமே மரியாதை வடிவத்துக்கு உயர வேண்டும்.',
        hi: 'जिसे ஐயா कहा, उसे फिर நீ नहीं कह सकते। सर्वनाम और क्रिया-अंत दोनों को आदर वाले रूप में जाना होगा।'
      }
    }
  },
  {
    id: 'ta-pulli', level: 1,
    title: { en: 'The dot that kills the vowel', ta: 'புள்ளி — மெய்யெழுத்து', hi: 'वह बिंदु जो स्वर हटा देता है' },
    rule: {
      en: 'The dot above a Tamil letter — the புள்ளி — removes its vowel. க is "ka"; க் is a bare "k" with nothing after it. It does the same work as the Hindi halant ्, except that it sits on top rather than below. Leaving the dot off is not a small slip: it turns the word into a different word, or into no word at all.',
      ta: 'எழுத்தின் மேலுள்ள புள்ளி அதன் உயிரை நீக்குகிறது. க என்பது "க"; க் என்பது உயிரற்ற வெறும் மெய். இந்தியின் ் (அரைக்கால்) செய்யும் அதே வேலை, ஆனால் கீழே அல்ல, மேலே. புள்ளியை விட்டுவிடுவது சிறு தவறல்ல — சொல்லே வேறாகிவிடும், அல்லது சொல்லாகவே இல்லாமல் போய்விடும்.',
      hi: 'तमिल अक्षर के ऊपर का बिंदु — புள்ளி — उसका स्वर हटा देता है। க यानी "क"; க் यानी बिना स्वर का सिर्फ़ "क्"। यह वही काम करता है जो हिंदी का हलंत ् करता है, बस नीचे नहीं, ऊपर लगता है। बिंदु छोड़ देना छोटी चूक नहीं — शब्द ही बदल जाता है।'
    },
    examples: [
      { ta: 'பால் — milk, with the dot', en: 'milk', hi: 'दूध' },
      { ta: 'கல் — stone', en: 'stone', hi: 'पत्थर' },
      { ta: 'நான் — I', en: 'I', hi: 'मैं' }
    ],
    mistake: {
      wrong: 'நான் வந்தேன', right: 'நான் வந்தேன்.',
      why: {
        en: 'Without the புள்ளி the final ன is "na", so வந்தேன becomes a word that does not exist. The dot is not decoration; it is a letter doing its job.',
        ta: 'புள்ளி இல்லாவிட்டால் இறுதி ன "ன" ஆகிவிடும்; வந்தேன என்பது சொல்லே அல்ல. புள்ளி அலங்காரம் அல்ல — அது தன் வேலையைச் செய்யும் எழுத்து.',
        hi: 'बिंदु के बिना अंतिम ன "न" रह जाता है और வந்தேன कोई शब्द ही नहीं बचता। बिंदु सजावट नहीं, अपना काम करता हुआ अक्षर है।'
      }
    }
  },
  {
    id: 'ta-uyirmei', level: 1,
    title: { en: 'Why there are 247 letters', ta: 'உயிர், மெய், உயிர்மெய் — 247', hi: '247 अक्षर क्यों हैं' },
    rule: {
      en: 'Tamil has 12 vowels (உயிர்) and 18 consonants (மெய்). Every consonant joins with every vowel to make a compound letter (உயிர்மெய்) — 12 × 18 = 216 of them — and 216 + 12 + 18 + ஃ comes to 247. So the alphabet is not a long list to be memorised; it is a grid. Learn the 12 vowel signs once and you can read all 216 without being taught them one at a time.',
      ta: 'தமிழில் 12 உயிரெழுத்துகளும் 18 மெய்யெழுத்துகளும் உண்டு. ஒவ்வொரு மெய்யும் ஒவ்வொரு உயிரோடும் சேர்ந்து உயிர்மெய் ஆகும் — 12 × 18 = 216. 216 + 12 + 18 + ஃ = 247. எனவே நெடுங்கணக்கு மனப்பாடம் செய்யும் நீண்ட பட்டியல் அல்ல; அது ஒரு அட்டவணை. 12 உயிர்க்குறிகளைக் கற்றுவிட்டால் 216ஐயும் தனித்தனியே கற்காமலேயே படிக்கலாம்.',
      hi: 'तमिल में 12 स्वर (உயிர்) और 18 व्यंजन (மெய்) हैं। हर व्यंजन हर स्वर से मिलकर एक संयुक्त अक्षर बनाता है — 12 × 18 = 216 — और 216 + 12 + 18 + ஃ = 247। यानी वर्णमाला रटने की लंबी सूची नहीं, एक सारणी है। 12 स्वर-चिह्न एक बार सीख लें तो 216 अक्षर अपने आप पढ़े जाते हैं।'
    },
    examples: [
      { ta: 'க் + அ = க', en: 'k + a = ka', hi: 'क् + अ = क' },
      { ta: 'க் + ஆ = கா', en: 'k + aa = kaa', hi: 'क् + आ = का' },
      { ta: 'க் + இ = கி', en: 'k + i = ki', hi: 'क् + इ = कि' }
    ],
    mistake: {
      wrong: 'க இ', right: 'கி',
      why: {
        en: 'A vowel following a consonant is never written as a separate letter. It changes the shape of the consonant instead — exactly as Hindi writes कि and not क इ.',
        ta: 'மெய்யைத் தொடரும் உயிர் தனி எழுத்தாக எழுதப்படுவதில்லை. அது மெய்யின் வடிவத்தையே மாற்றுகிறது — இந்தி कि என எழுதுவது போலவே, क इ என அல்ல.',
        hi: 'व्यंजन के बाद आने वाला स्वर अलग अक्षर के रूप में नहीं लिखा जाता; वह व्यंजन का रूप बदल देता है — ठीक जैसे हिंदी में कि लिखते हैं, क इ नहीं।'
      }
    }
  },
  {
    id: 'ta-punarchi', level: 2,
    title: { en: 'Words double their consonant when they join', ta: 'புணர்ச்சி — ஒற்று மிகுதல்', hi: 'जुड़ते समय व्यंजन दोगुना' },
    rule: {
      en: 'When two Tamil words join, the consonant at the seam is often doubled: பள்ளி + கு = பள்ளிக்கு, மர + கிளை = மரக்கிளை, தமிழ் + படம் = தமிழ்ப்படம். This is why written Tamil is full of doubled க், ச், த், ப் in the middle of words. It is also why the sound goes hard: a single க between vowels is heard as a soft "g", a doubled one as a firm "k".',
      ta: 'இரு சொற்கள் சேரும்போது இணைப்பிடத்தில் ஒற்று மிகும்: பள்ளி + கு = பள்ளிக்கு, மர + கிளை = மரக்கிளை, தமிழ் + படம் = தமிழ்ப்படம். எழுத்துத் தமிழில் சொல்லின் நடுவே இரட்டித்த க், ச், த், ப் நிறைந்திருப்பதற்குக் காரணம் இதுவே. ஒலியும் வலிக்கிறது: உயிர்களுக்கு இடையே தனி க "க"வாக மென்மையாகவும், இரட்டித்த க்க வலிமையாகவும் ஒலிக்கும்.',
      hi: 'जब दो तमिल शब्द जुड़ते हैं तो जोड़ पर व्यंजन अक्सर दोगुना हो जाता है: பள்ளி + கு = பள்ளிக்கு। इसी कारण लिखी हुई तमिल में शब्दों के बीच दोहरे க், ச், த், ப் भरे रहते हैं। ध्वनि भी बदलती है: स्वरों के बीच अकेला க नरम "ग" सुनाई देता है, दोहरा க்க कड़ा "क"।'
    },
    examples: [
      { ta: 'பள்ளி + கு = பள்ளிக்கு', en: 'to school', hi: 'स्कूल को' },
      { ta: 'மர + கிளை = மரக்கிளை', en: 'tree branch', hi: 'पेड़ की डाली' },
      { ta: 'தமிழ் + படம் = தமிழ்ப்படம்', en: 'a Tamil film', hi: 'तमिल फ़िल्म' }
    ],
    mistake: {
      wrong: 'பள்ளிகு', right: 'பள்ளிக்கு',
      why: {
        en: 'The seam needs its doubled consonant. Written with one க the word is neither the right spelling nor the right sound.',
        ta: 'இணைப்பிடத்தில் ஒற்று மிக வேண்டும். ஒரே க வுடன் எழுதினால் எழுத்தும் சரியில்லை, ஒலியும் சரியில்லை.',
        hi: 'जोड़ पर व्यंजन दोगुना चाहिए। एक ही க के साथ लिखने पर न वर्तनी सही रहती है, न ध्वनि।'
      }
    }
  },
  {
    id: 'ta-adjective', level: 1,
    title: { en: 'Adjectives never change', ta: 'பெயரடை மாறாது', hi: 'विशेषण कभी नहीं बदलता' },
    rule: {
      en: 'A Tamil adjective has one form and keeps it. நல்ல is நல்ல in front of a man, a woman, a child or a table — there is nothing here like the Hindi अच्छा / अच्छी / अच्छे. It always stands before the noun it describes, and it never takes a case ending; the noun does that.',
      ta: 'தமிழ்ப் பெயரடைக்கு ஒரே வடிவம்தான்; அது மாறாது. ஆணுக்கு முன்னும் பெண்ணுக்கு முன்னும் குழந்தைக்கு முன்னும் மேசைக்கு முன்னும் நல்ல என்பது நல்லவேதான் — இந்தியின் अच्छा / अच्छी போன்ற மாற்றம் இங்கு இல்லை. அது எப்போதும் பெயர்ச்சொல்லுக்கு முன் நிற்கும்; உருபு ஏற்காது, அதைப் பெயர்ச்சொல் ஏற்கும்.',
      hi: 'तमिल विशेषण का एक ही रूप होता है और वही बना रहता है। நல்ல पुरुष के आगे भी நல்ல, स्त्री के आगे भी நல்ல — हिंदी के अच्छा / अच्छी / अच्छे जैसा कुछ यहाँ नहीं। यह हमेशा संज्ञा से पहले आता है और कोई परसर्ग नहीं लेता; वह काम संज्ञा करती है।'
    },
    examples: [
      { ta: 'நல்ல பையன்', en: 'a good boy', hi: 'अच्छा लड़का' },
      { ta: 'நல்ல பெண்', en: 'a good girl', hi: 'अच्छी लड़की' },
      { ta: 'நல்ல புத்தகம்', en: 'a good book', hi: 'अच्छी किताब' }
    ],
    mistake: {
      wrong: 'நல்லா பையன்', right: 'நல்ல பையன்',
      why: {
        en: 'நல்லா is the spoken adverb — "well". The adjective that stands before a noun is நல்ல, and in writing the two must not be swapped.',
        ta: 'நல்லா என்பது பேச்சு வழக்கின் வினையடை — "நன்றாக". பெயர்ச்சொல்லுக்கு முன் நிற்கும் பெயரடை நல்ல; எழுதும்போது இரண்டையும் மாற்றிப் போடக் கூடாது.',
        hi: 'நல்லா बोलचाल का क्रिया-विशेषण है — "अच्छी तरह"। संज्ञा से पहले आने वाला विशेषण நல்ல है; लिखने में दोनों को बदला नहीं जा सकता।'
      }
    }
  },
  {
    id: 'ta-postposition', level: 2,
    title: { en: 'On, under, behind — all come after', ta: 'மேல், கீழ், பின் — பின்னே வரும்', hi: 'ऊपर, नीचे, पीछे — सब बाद में' },
    rule: {
      en: 'Words like on, under, behind, before, with and about all follow the noun in Tamil, and the noun usually takes an ending first: மேசையின் மேல், on the table; வீட்டுக்குப் பின், behind the house. English puts them in front and Tamil never does — which is exactly why word-for-word translation from English produces Tamil nobody says.',
      ta: 'மேல், கீழ், பின், முன், உடன், பற்றி போன்ற சொற்கள் தமிழில் பெயர்ச்சொல்லுக்குப் பின்னேயே வரும்; பெயர்ச்சொல் பொதுவாக முதலில் உருபு ஏற்கும்: மேசையின் மேல், வீட்டுக்குப் பின். ஆங்கிலம் அவற்றை முன் வைக்கிறது; தமிழ் ஒருபோதும் வைப்பதில்லை. ஆங்கிலத்திலிருந்து சொல்லுக்குச் சொல் மொழிபெயர்த்தால் யாரும் சொல்லாத தமிழ் வருவதற்குக் காரணம் இதுவே.',
      hi: 'ऊपर, नीचे, पीछे, आगे, साथ, बारे में — ये सब तमिल में संज्ञा के बाद आते हैं, और संज्ञा पहले कोई अंत-प्रत्यय ले लेती है: மேசையின் மேல் (मेज़ के ऊपर)। हिंदी भी इन्हें बाद में रखती है, इसलिए यहाँ हिंदी वाले को कोई अड़चन नहीं; अंग्रेज़ी वाले को आदत बदलनी पड़ती है।'
    },
    examples: [
      { ta: 'மேசையின் மேல் புத்தகம் இருக்கிறது.', en: 'The book is on the table.', hi: 'किताब मेज़ के ऊपर है।' },
      { ta: 'வீட்டுக்குப் பின் மரம் இருக்கிறது.', en: 'There is a tree behind the house.', hi: 'घर के पीछे एक पेड़ है।' },
      { ta: 'அவனுடன் பேசினேன்.', en: 'I spoke with him.', hi: 'मैंने उससे बात की।' }
    ],
    mistake: {
      wrong: 'மேல் மேசை புத்தகம் இருக்கிறது.', right: 'மேசையின் மேல் புத்தகம் இருக்கிறது.',
      why: {
        en: 'Putting மேல் in front is English word order wearing Tamil words. The thing comes first, then where it is.',
        ta: 'மேல் என்பதை முன்னே வைப்பது தமிழ்ச் சொற்களை அணிந்த ஆங்கில வரிசையே. பொருள் முதலில், இடம் பின்னர்.',
        hi: 'மேல் को आगे रखना तमिल शब्दों में अंग्रेज़ी का क्रम है। पहले वस्तु, फिर उसका स्थान।'
      }
    }
  },
  {
    id: 'ta-spoken', level: 2,
    title: { en: 'Written Tamil and spoken Tamil differ', ta: 'எழுத்துத் தமிழ், பேச்சுத் தமிழ்', hi: 'लिखी और बोली तमिल अलग हैं' },
    rule: {
      en: 'Tamil is written one way and spoken another, and the gap is wide. வருகிறேன் is written, வர்றேன் is said; போகிறேன் becomes போறேன்; இருக்கிறது becomes இருக்கு. Both are proper Tamil — one belongs on the page and in the exam, the other in the street and at home. Children who grew up hearing Tamil usually write the spoken form by mistake, so this is the rule that costs marks.',
      ta: 'தமிழ் எழுதப்படுவது ஒருவிதம், பேசப்படுவது வேறுவிதம்; இடைவெளி பெரியது. வருகிறேன் எழுத்து, வர்றேன் பேச்சு; போகிறேன் → போறேன்; இருக்கிறது → இருக்கு. இரண்டுமே தமிழ்தான் — ஒன்று ஏட்டுக்கும் தேர்வுக்கும், மற்றொன்று வீட்டுக்கும் தெருவுக்கும். தமிழ் கேட்டு வளர்ந்த குழந்தைகள் பேச்சு வடிவத்தையே எழுதிவிடுவது வழக்கம்; மதிப்பெண் இழப்பது இங்குதான்.',
      hi: 'तमिल लिखी एक तरह जाती है और बोली दूसरी तरह, और फ़र्क़ बड़ा है। வருகிறேன் लिखा जाता है, வர்றேன் बोला जाता है। दोनों सही तमिल हैं — एक काग़ज़ और परीक्षा के लिए, दूसरी घर और गली के लिए। तमिल सुनकर बड़े हुए बच्चे अक्सर बोली वाला रूप लिख बैठते हैं, और नंबर यहीं कटते हैं।'
    },
    examples: [
      { ta: 'எழுத்து: வருகிறேன் · பேச்சு: வர்றேன்', en: 'written / spoken: I am coming', hi: 'लिखित / बोली: मैं आ रहा हूँ' },
      { ta: 'எழுத்து: போகிறேன் · பேச்சு: போறேன்', en: 'written / spoken: I am going', hi: 'लिखित / बोली: मैं जा रहा हूँ' },
      { ta: 'எழுத்து: இருக்கிறது · பேச்சு: இருக்கு', en: 'written / spoken: it is', hi: 'लिखित / बोली: है' }
    ],
    mistake: {
      wrong: 'நான் வர்றேன். (in an exam)', right: 'நான் வருகிறேன்.',
      why: {
        en: 'வர்றேன் is how the word is said, not how it is written. In a letter, an exam or anything printed, the full written form is expected.',
        ta: 'வர்றேன் என்பது சொல் ஒலிக்கும் விதம், எழுதப்படும் விதம் அல்ல. கடிதத்திலும் தேர்விலும் அச்சிலும் முழு எழுத்து வடிவமே எதிர்பார்க்கப்படுகிறது.',
        hi: 'வர்றேன் बोलने का रूप है, लिखने का नहीं। चिट्ठी, परीक्षा या किसी भी छपी चीज़ में पूरा लिखित रूप ही अपेक्षित है।'
      }
    }
  },
  {
    id: 'ta-verbalnoun', level: 3,
    title: { en: 'Turning a verb into a noun', ta: 'தொழிற்பெயர் — தல், வது', hi: 'क्रिया को संज्ञा बनाना' },
    rule: {
      en: 'To speak of the action itself — reading, coming, the act of eating — Tamil adds தல் or வது to the verb: படித்தல், படிப்பது. English uses "-ing" or "to"; Tamil uses an ending. What comes out behaves like any other noun and can take case endings of its own: படிப்பதற்கு, for reading; படிப்பதால், because of reading.',
      ta: 'செயலையே பெயராகச் சொல்ல — படித்தல், வருதல், சாப்பிடுதல் — தமிழ் வினையுடன் தல் அல்லது வது சேர்க்கிறது: படித்தல், படிப்பது. ஆங்கிலம் "-ing" அல்லது "to" பயன்படுத்துகிறது; தமிழ் விகுதி பயன்படுத்துகிறது. விளைவது பிற பெயர்ச்சொற்கள் போலவே செயல்படும்; தானே உருபுகளையும் ஏற்கும்: படிப்பதற்கு, படிப்பதால்.',
      hi: 'काम को ही संज्ञा की तरह कहने के लिए — पढ़ना, आना, खाना — तमिल क्रिया में தல் या வது जोड़ती है: படித்தல், படிப்பது। अंग्रेज़ी "-ing" या "to" लगाती है; तमिल अंत-प्रत्यय लगाती है। जो बनता है वह बाकी संज्ञाओं जैसा ही चलता है और ख़ुद परसर्ग ले सकता है: படிப்பதற்கு (पढ़ने के लिए)।'
    },
    examples: [
      { ta: 'படிப்பது நல்லது.', en: 'Reading is good.', hi: 'पढ़ना अच्छा है।' },
      { ta: 'நீச்சல் கற்றுக்கொள்வது கடினம் அல்ல.', en: 'Learning to swim is not hard.', hi: 'तैरना सीखना कठिन नहीं है।' },
      { ta: 'படிப்பதற்கு நேரம் வேண்டும்.', en: 'Time is needed for reading.', hi: 'पढ़ने के लिए समय चाहिए।' }
    ],
    mistake: {
      wrong: 'படிக்கிறது நல்லது.', right: 'படிப்பது நல்லது.',
      why: {
        en: 'படிக்கிறது is a verb carrying a tense — "it reads". To speak of reading as a thing in itself, the verb has to become படிப்பது.',
        ta: 'படிக்கிறது என்பது காலம் சுமக்கும் வினை — "அது படிக்கிறது". படிப்பதைப் பொருளாகச் சொல்ல வேண்டுமானால் வினை படிப்பது ஆக வேண்டும்.',
        hi: 'படிக்கிறது काल वाली क्रिया है — "वह पढ़ता है"। पढ़ने को अपने आप में एक चीज़ की तरह कहना हो तो क्रिया को படிப்பது बनना होगा।'
      }
    }
  }
];
