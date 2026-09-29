/* Tamil Bridge — the conversations people actually have.

   Every exchange is given in all three languages, so the same situation
   teaches spoken English to a Tamil speaker and spoken Hindi to the same
   person, without writing it twice. A learner picks the language they are
   practising; the other two stay underneath as the meaning.

   These are the conversations of an ordinary day in India — a shop, a bus,
   a clinic, a school gate, a phone call — not the airport-and-hotel
   dialogues of a tourist phrasebook.                                       */
window.TB = window.TB || {};

TB.SPOKEN = [
  {
    id: 'meet', level: 1,
    title: { en: 'Meeting someone', ta: 'ஒருவரைச் சந்திப்பது', hi: 'किसी से मिलना' },
    lines: [
      { who: 'A', en: 'Hello! How are you?', ta: 'வணக்கம்! எப்படி இருக்கிறீர்கள்?', hi: 'नमस्ते! आप कैसे हैं?' },
      { who: 'B', en: 'I am fine, thank you. And you?', ta: 'நான் நலம், நன்றி. நீங்கள்?', hi: 'मैं ठीक हूँ, धन्यवाद। और आप?' },
      { who: 'A', en: 'I am well too. What is your name?', ta: 'நானும் நலம். உங்கள் பெயர் என்ன?', hi: 'मैं भी ठीक हूँ। आपका नाम क्या है?' },
      { who: 'B', en: 'My name is Kumar. And yours?', ta: 'என் பெயர் குமார். உங்களுடையது?', hi: 'मेरा नाम कुमार है। और आपका?' },
      { who: 'A', en: 'I am Priya. Nice to meet you.', ta: 'நான் பிரியா. உங்களைச் சந்தித்ததில் மகிழ்ச்சி.', hi: 'मैं प्रिया हूँ। आपसे मिलकर ख़ुशी हुई।' },
      { who: 'B', en: 'Nice to meet you too.', ta: 'எனக்கும் மகிழ்ச்சி.', hi: 'मुझे भी ख़ुशी हुई।' }
    ]
  },
  {
    id: 'about', level: 1,
    title: { en: 'Telling someone about yourself', ta: 'உங்களைப் பற்றி சொல்வது', hi: 'अपने बारे में बताना' },
    lines: [
      { who: 'A', en: 'Where are you from?', ta: 'நீங்கள் எங்கிருந்து வருகிறீர்கள்?', hi: 'आप कहाँ से हैं?' },
      { who: 'B', en: 'I am from Madurai. Where do you live?', ta: 'நான் மதுரையிலிருந்து. நீங்கள் எங்கே வசிக்கிறீர்கள்?', hi: 'मैं मदुरै से हूँ। आप कहाँ रहते हैं?' },
      { who: 'A', en: 'I live in Chennai now.', ta: 'நான் இப்போது சென்னையில் வசிக்கிறேன்.', hi: 'मैं अब चेन्नई में रहता हूँ।' },
      { who: 'B', en: 'What do you do?', ta: 'நீங்கள் என்ன வேலை செய்கிறீர்கள்?', hi: 'आप क्या करते हैं?' },
      { who: 'A', en: 'I am a teacher. I teach children.', ta: 'நான் ஆசிரியர். குழந்தைகளுக்குக் கற்பிக்கிறேன்.', hi: 'मैं शिक्षक हूँ। मैं बच्चों को पढ़ाता हूँ।' },
      { who: 'B', en: 'That is a good job.', ta: 'அது ஒரு நல்ல வேலை.', hi: 'यह अच्छा काम है।' }
    ]
  },
  {
    id: 'shop', level: 1,
    title: { en: 'At the shop', ta: 'கடையில்', hi: 'दुकान पर' },
    lines: [
      { who: 'A', en: 'How much is this?', ta: 'இது எவ்வளவு?', hi: 'यह कितने का है?' },
      { who: 'B', en: 'It is forty rupees.', ta: 'நாற்பது ரூபாய்.', hi: 'चालीस रुपये।' },
      { who: 'A', en: 'That is too expensive. Can you reduce it?', ta: 'அது மிகவும் அதிகம். கொஞ்சம் குறைக்க முடியுமா?', hi: 'यह बहुत महँगा है। थोड़ा कम कर सकते हैं?' },
      { who: 'B', en: 'I can give it for thirty-five.', ta: 'முப்பத்தைந்துக்குத் தரலாம்.', hi: 'पैंतीस में दे सकता हूँ।' },
      { who: 'A', en: 'All right. Give me two.', ta: 'சரி. இரண்டு கொடுங்கள்.', hi: 'ठीक है। मुझे दो दीजिए।' },
      { who: 'B', en: 'Here you are. Seventy rupees.', ta: 'இதோ. எழுபது ரூபாய்.', hi: 'यह लीजिए। सत्तर रुपये।' },
      { who: 'A', en: 'Can I pay by phone?', ta: 'கைபேசி மூலம் செலுத்தலாமா?', hi: 'क्या मैं फ़ोन से भुगतान कर सकता हूँ?' },
      { who: 'B', en: 'Yes, scan this code.', ta: 'ஆம், இந்தக் குறியீட்டை ஸ்கேன் செய்யுங்கள்.', hi: 'हाँ, यह कोड स्कैन कीजिए।' }
    ]
  },
  {
    id: 'bus', level: 1,
    title: { en: 'Catching a bus', ta: 'பேருந்து பிடிப்பது', hi: 'बस पकड़ना' },
    lines: [
      { who: 'A', en: 'Excuse me, does this bus go to the station?', ta: 'மன்னிக்கவும், இந்தப் பேருந்து நிலையத்திற்குச் செல்லுமா?', hi: 'सुनिए, क्या यह बस स्टेशन जाती है?' },
      { who: 'B', en: 'Yes, it does. Get in.', ta: 'ஆம், செல்லும். ஏறுங்கள்.', hi: 'हाँ, जाती है। चढ़ जाइए।' },
      { who: 'A', en: 'How much is the ticket?', ta: 'டிக்கெட் எவ்வளவு?', hi: 'टिकट कितने का है?' },
      { who: 'B', en: 'Fifteen rupees.', ta: 'பதினைந்து ரூபாய்.', hi: 'पंद्रह रुपये।' },
      { who: 'A', en: 'How long will it take?', ta: 'எவ்வளவு நேரம் ஆகும்?', hi: 'कितना समय लगेगा?' },
      { who: 'B', en: 'About twenty minutes.', ta: 'சுமார் இருபது நிமிடம்.', hi: 'लगभग बीस मिनट।' },
      { who: 'A', en: 'Please tell me when we reach.', ta: 'வந்ததும் சொல்லுங்கள்.', hi: 'पहुँचने पर बता दीजिए।' }
    ]
  },
  {
    id: 'directions', level: 1,
    title: { en: 'Asking the way', ta: 'வழி கேட்பது', hi: 'रास्ता पूछना' },
    lines: [
      { who: 'A', en: 'Excuse me, where is the post office?', ta: 'மன்னிக்கவும், அஞ்சலகம் எங்கே?', hi: 'सुनिए, डाकघर कहाँ है?' },
      { who: 'B', en: 'Go straight and turn left.', ta: 'நேராகச் சென்று இடதுபுறம் திரும்புங்கள்.', hi: 'सीधे जाइए और बाएँ मुड़िए।' },
      { who: 'A', en: 'Is it far from here?', ta: 'இங்கிருந்து தூரமா?', hi: 'क्या यह यहाँ से दूर है?' },
      { who: 'B', en: 'No, about five minutes on foot.', ta: 'இல்லை, நடந்து ஐந்து நிமிடம்.', hi: 'नहीं, पैदल लगभग पाँच मिनट।' },
      { who: 'A', en: 'Thank you very much.', ta: 'மிக்க நன்றி.', hi: 'बहुत धन्यवाद।' },
      { who: 'B', en: 'You are welcome.', ta: 'பரவாயில்லை.', hi: 'कोई बात नहीं।' }
    ]
  },
  {
    id: 'doctor', level: 2,
    title: { en: 'At the doctor', ta: 'மருத்துவரிடம்', hi: 'डॉक्टर के पास' },
    lines: [
      { who: 'A', en: 'What is the problem?', ta: 'என்ன பிரச்சினை?', hi: 'क्या तकलीफ़ है?' },
      { who: 'B', en: 'I have a headache and fever.', ta: 'எனக்குத் தலைவலியும் காய்ச்சலும் இருக்கிறது.', hi: 'मुझे सिरदर्द और बुख़ार है।' },
      { who: 'A', en: 'Since when?', ta: 'எப்போதிலிருந்து?', hi: 'कब से?' },
      { who: 'B', en: 'Since yesterday morning.', ta: 'நேற்று காலையிலிருந்து.', hi: 'कल सुबह से।' },
      { who: 'A', en: 'Take this medicine twice a day.', ta: 'இந்த மருந்தை நாளொன்றுக்கு இரண்டு முறை எடுத்துக்கொள்ளுங்கள்.', hi: 'यह दवा दिन में दो बार लीजिए।' },
      { who: 'B', en: 'Before food or after food?', ta: 'உணவுக்கு முன்பா, பின்பா?', hi: 'खाने से पहले या बाद में?' },
      { who: 'A', en: 'After food. Drink plenty of water.', ta: 'உணவுக்குப் பிறகு. நிறைய தண்ணீர் குடியுங்கள்.', hi: 'खाने के बाद। ख़ूब पानी पीजिए।' },
      { who: 'B', en: 'Thank you, doctor.', ta: 'நன்றி, மருத்துவரே.', hi: 'धन्यवाद, डॉक्टर साहब।' }
    ]
  },
  {
    id: 'phone', level: 2,
    title: { en: 'On the phone', ta: 'தொலைபேசியில்', hi: 'फ़ोन पर' },
    lines: [
      { who: 'A', en: 'Hello, who is speaking?', ta: 'வணக்கம், யார் பேசுகிறீர்கள்?', hi: 'नमस्ते, कौन बोल रहा है?' },
      { who: 'B', en: 'This is Ravi. Is Kumar there?', ta: 'நான் ரவி பேசுகிறேன். குமார் இருக்கிறாரா?', hi: 'मैं रवि बोल रहा हूँ। क्या कुमार हैं?' },
      { who: 'A', en: 'He is not at home right now.', ta: 'அவர் இப்போது வீட்டில் இல்லை.', hi: 'वे अभी घर पर नहीं हैं।' },
      { who: 'B', en: 'When will he come back?', ta: 'அவர் எப்போது திரும்பி வருவார்?', hi: 'वे कब वापस आएँगे?' },
      { who: 'A', en: 'In about an hour. Shall I give a message?', ta: 'ஒரு மணி நேரத்தில். செய்தி ஏதேனும் சொல்லவா?', hi: 'लगभग एक घंटे में। कोई संदेश दूँ?' },
      { who: 'B', en: 'Please tell him to call me.', ta: 'என்னை அழைக்கச் சொல்லுங்கள்.', hi: 'उनसे कहिए कि मुझे फ़ोन करें।' },
      { who: 'A', en: 'I will tell him. Goodbye.', ta: 'சொல்கிறேன். போய் வருகிறேன்.', hi: 'मैं बता दूँगा। नमस्ते।' }
    ]
  },
  {
    id: 'school', level: 1,
    title: { en: 'At the school gate', ta: 'பள்ளி வாசலில்', hi: 'स्कूल के गेट पर' },
    lines: [
      { who: 'A', en: 'Good morning, madam.', ta: 'காலை வணக்கம், அம்மா.', hi: 'नमस्ते, मैडम।' },
      { who: 'B', en: 'Good morning. Are you Meena\'s mother?', ta: 'காலை வணக்கம். நீங்கள் மீனாவின் அம்மாவா?', hi: 'नमस्ते। क्या आप मीना की माँ हैं?' },
      { who: 'A', en: 'Yes. How is she studying?', ta: 'ஆம். அவள் எப்படிப் படிக்கிறாள்?', hi: 'जी हाँ। वह पढ़ाई कैसी कर रही है?' },
      { who: 'B', en: 'She is doing well, but she must read more.', ta: 'நன்றாகச் செய்கிறாள், ஆனால் இன்னும் அதிகம் படிக்க வேண்டும்.', hi: 'वह अच्छा कर रही है, पर उसे और पढ़ना चाहिए।' },
      { who: 'A', en: 'I will help her at home.', ta: 'நான் வீட்டில் உதவுகிறேன்.', hi: 'मैं घर पर उसकी मदद करूँगी।' },
      { who: 'B', en: 'Thank you. That will help a lot.', ta: 'நன்றி. அது மிகவும் உதவும்.', hi: 'धन्यवाद। इससे बहुत मदद होगी।' }
    ]
  },
  {
    id: 'restaurant', level: 2,
    title: { en: 'Eating out', ta: 'உணவகத்தில்', hi: 'बाहर खाना' },
    lines: [
      { who: 'A', en: 'A table for two, please.', ta: 'இருவருக்கு ஒரு மேசை, தயவுசெய்து.', hi: 'दो लोगों के लिए मेज़, कृपया।' },
      { who: 'B', en: 'Please sit here. Here is the menu.', ta: 'இங்கே அமருங்கள். இதோ உணவுப் பட்டியல்.', hi: 'यहाँ बैठिए। यह रहा मेन्यू।' },
      { who: 'A', en: 'What do you recommend?', ta: 'நீங்கள் எதைப் பரிந்துரைக்கிறீர்கள்?', hi: 'आप क्या सुझाएँगे?' },
      { who: 'B', en: 'The meals here are very good.', ta: 'இங்கே சாப்பாடு மிகவும் நன்றாக இருக்கும்.', hi: 'यहाँ की थाली बहुत अच्छी है।' },
      { who: 'A', en: 'Is it very spicy?', ta: 'மிகவும் காரமாக இருக்குமா?', hi: 'क्या यह बहुत तीखा है?' },
      { who: 'B', en: 'A little. I can make it less spicy.', ta: 'கொஞ்சம். குறைவாகக் காரம் செய்யலாம்.', hi: 'थोड़ा। मैं कम तीखा बनवा सकता हूँ।' },
      { who: 'A', en: 'Please bring two meals and water.', ta: 'இரண்டு சாப்பாடும் தண்ணீரும் கொண்டு வாருங்கள்.', hi: 'दो थाली और पानी लाइए।' },
      { who: 'B', en: 'Certainly. It will take ten minutes.', ta: 'நிச்சயமாக. பத்து நிமிடம் ஆகும்.', hi: 'ज़रूर। दस मिनट लगेंगे।' }
    ]
  },
  {
    id: 'bank', level: 2,
    title: { en: 'At the bank', ta: 'வங்கியில்', hi: 'बैंक में' },
    lines: [
      { who: 'A', en: 'I want to open an account.', ta: 'நான் ஒரு கணக்கு தொடங்க விரும்புகிறேன்.', hi: 'मुझे खाता खोलना है।' },
      { who: 'B', en: 'Please fill this form.', ta: 'இந்தப் படிவத்தை நிரப்புங்கள்.', hi: 'यह फ़ॉर्म भरिए।' },
      { who: 'A', en: 'What documents do I need?', ta: 'என்ன ஆவணங்கள் தேவை?', hi: 'कौन से दस्तावेज़ चाहिए?' },
      { who: 'B', en: 'An identity card and a photograph.', ta: 'அடையாள அட்டையும் ஒரு புகைப்படமும்.', hi: 'पहचान पत्र और एक फ़ोटो।' },
      { who: 'A', en: 'I have brought both.', ta: 'இரண்டையும் கொண்டு வந்திருக்கிறேன்.', hi: 'मैं दोनों लाया हूँ।' },
      { who: 'B', en: 'Good. Please sign here.', ta: 'நல்லது. இங்கே கையெழுத்திடுங்கள்.', hi: 'अच्छा। यहाँ हस्ताक्षर कीजिए।' }
    ]
  },
  {
    id: 'work', level: 3,
    title: { en: 'At work', ta: 'வேலையில்', hi: 'काम पर' },
    lines: [
      { who: 'A', en: 'Have you finished the report?', ta: 'அறிக்கையை முடித்துவிட்டீர்களா?', hi: 'क्या आपने रिपोर्ट पूरी कर ली?' },
      { who: 'B', en: 'Almost. I need one more hour.', ta: 'கிட்டத்தட்ட. இன்னும் ஒரு மணி நேரம் வேண்டும்.', hi: 'लगभग। मुझे एक घंटा और चाहिए।' },
      { who: 'A', en: 'Can you send it before five?', ta: 'ஐந்து மணிக்கு முன் அனுப்ப முடியுமா?', hi: 'क्या आप पाँच बजे से पहले भेज सकते हैं?' },
      { who: 'B', en: 'Yes, I will send it by four thirty.', ta: 'ஆம், நான்கரை மணிக்குள் அனுப்புகிறேன்.', hi: 'हाँ, मैं साढ़े चार तक भेज दूँगा।' },
      { who: 'A', en: 'Thank you. Let me know if you need help.', ta: 'நன்றி. உதவி தேவைப்பட்டால் சொல்லுங்கள்.', hi: 'धन्यवाद। मदद चाहिए तो बताइए।' }
    ]
  },
  {
    id: 'invite', level: 2,
    title: { en: 'Inviting someone', ta: 'அழைப்பது', hi: 'किसी को बुलाना' },
    lines: [
      { who: 'A', en: 'Are you free on Sunday?', ta: 'ஞாயிற்றுக்கிழமை ஓய்வாக இருக்கிறீர்களா?', hi: 'क्या आप रविवार को ख़ाली हैं?' },
      { who: 'B', en: 'Yes, in the evening. Why?', ta: 'ஆம், மாலையில். ஏன்?', hi: 'हाँ, शाम को। क्यों?' },
      { who: 'A', en: 'It is my daughter\'s birthday. Please come.', ta: 'என் மகளின் பிறந்தநாள். வாருங்கள்.', hi: 'मेरी बेटी का जन्मदिन है। आइए।' },
      { who: 'B', en: 'I will certainly come. What time?', ta: 'நிச்சயம் வருகிறேன். எத்தனை மணிக்கு?', hi: 'मैं ज़रूर आऊँगा। कितने बजे?' },
      { who: 'A', en: 'At six o\'clock, at our house.', ta: 'ஆறு மணிக்கு, எங்கள் வீட்டில்.', hi: 'छह बजे, हमारे घर पर।' },
      { who: 'B', en: 'Thank you for inviting me.', ta: 'அழைத்ததற்கு நன்றி.', hi: 'बुलाने के लिए धन्यवाद।' }
    ]
  },
  {
    id: 'sorry', level: 1,
    title: { en: 'Saying sorry', ta: 'மன்னிப்பு கேட்பது', hi: 'माफ़ी माँगना' },
    lines: [
      { who: 'A', en: 'I am sorry I am late.', ta: 'தாமதமாக வந்ததற்கு மன்னிக்கவும்.', hi: 'देर से आने के लिए माफ़ी।' },
      { who: 'B', en: 'It is all right. What happened?', ta: 'பரவாயில்லை. என்ன ஆயிற்று?', hi: 'कोई बात नहीं। क्या हुआ?' },
      { who: 'A', en: 'There was heavy traffic.', ta: 'போக்குவரத்து நெரிசலாக இருந்தது.', hi: 'बहुत ट्रैफ़िक था।' },
      { who: 'B', en: 'I understand. Please sit down.', ta: 'புரிகிறது. அமருங்கள்.', hi: 'समझ गया। बैठिए।' },
      { who: 'A', en: 'It will not happen again.', ta: 'இனி இப்படி நடக்காது.', hi: 'फिर ऐसा नहीं होगा।' }
    ]
  },
  {
    id: 'help', level: 1,
    title: { en: 'Asking for help', ta: 'உதவி கேட்பது', hi: 'मदद माँगना' },
    lines: [
      { who: 'A', en: 'Can you help me, please?', ta: 'தயவுசெய்து எனக்கு உதவ முடியுமா?', hi: 'क्या आप मेरी मदद कर सकते हैं?' },
      { who: 'B', en: 'Of course. What do you need?', ta: 'கண்டிப்பாக. என்ன வேண்டும்?', hi: 'ज़रूर। आपको क्या चाहिए?' },
      { who: 'A', en: 'I do not understand this form.', ta: 'இந்தப் படிவம் எனக்குப் புரியவில்லை.', hi: 'मुझे यह फ़ॉर्म समझ नहीं आ रहा।' },
      { who: 'B', en: 'Let me explain it to you.', ta: 'நான் விளக்குகிறேன்.', hi: 'मैं आपको समझाता हूँ।' },
      { who: 'A', en: 'That is very kind of you.', ta: 'மிகவும் நன்றி.', hi: 'आपकी बड़ी मेहरबानी।' }
    ]
  },
  {
    id: 'weather', level: 1,
    title: { en: 'Small talk', ta: 'சாதாரண பேச்சு', hi: 'हल्की-फुल्की बात' },
    lines: [
      { who: 'A', en: 'It is very hot today.', ta: 'இன்று மிகவும் வெப்பமாக இருக்கிறது.', hi: 'आज बहुत गरमी है।' },
      { who: 'B', en: 'Yes, and there is no rain.', ta: 'ஆம், மழையும் இல்லை.', hi: 'हाँ, और बारिश भी नहीं है।' },
      { who: 'A', en: 'I hope it rains this week.', ta: 'இந்த வாரம் மழை பெய்யும் என்று நம்புகிறேன்.', hi: 'उम्मीद है इस हफ़्ते बारिश होगी।' },
      { who: 'B', en: 'The farmers need it badly.', ta: 'விவசாயிகளுக்கு மிகவும் தேவை.', hi: 'किसानों को इसकी बहुत ज़रूरत है।' }
    ]
  },
  {
    id: 'shopping-clothes', level: 2,
    title: { en: 'Buying clothes', ta: 'ஆடை வாங்குவது', hi: 'कपड़े ख़रीदना' },
    lines: [
      { who: 'A', en: 'I am looking for a shirt.', ta: 'நான் ஒரு சட்டை தேடுகிறேன்.', hi: 'मुझे एक क़मीज़ चाहिए।' },
      { who: 'B', en: 'What size do you want?', ta: 'என்ன அளவு வேண்டும்?', hi: 'कौन सा नाप चाहिए?' },
      { who: 'A', en: 'Medium. Do you have it in blue?', ta: 'நடுத்தர அளவு. நீல நிறத்தில் இருக்கிறதா?', hi: 'मीडियम। क्या नीले रंग में है?' },
      { who: 'B', en: 'Yes. Would you like to try it?', ta: 'ஆம். போட்டுப் பார்க்கிறீர்களா?', hi: 'हाँ। पहनकर देखेंगे?' },
      { who: 'A', en: 'Yes. Where is the trial room?', ta: 'ஆம். ஆடை மாற்றும் அறை எங்கே?', hi: 'हाँ। ट्रायल रूम कहाँ है?' },
      { who: 'B', en: 'Straight ahead, on the right.', ta: 'நேராகச் சென்று வலதுபுறம்.', hi: 'सीधे जाकर दाईं ओर।' }
    ]
  },
  {
    id: 'neighbour', level: 2,
    title: { en: 'Talking to a neighbour', ta: 'அண்டை வீட்டாருடன்', hi: 'पड़ोसी से बात' },
    lines: [
      { who: 'A', en: 'Good evening. Are you new here?', ta: 'மாலை வணக்கம். நீங்கள் புதிதாக வந்தீர்களா?', hi: 'नमस्ते। क्या आप यहाँ नए हैं?' },
      { who: 'B', en: 'Yes, we moved in last week.', ta: 'ஆம், போன வாரம் குடி வந்தோம்.', hi: 'हाँ, हम पिछले हफ़्ते आए।' },
      { who: 'A', en: 'Welcome. If you need anything, just ask.', ta: 'வரவேற்கிறேன். ஏதேனும் தேவைப்பட்டால் கேளுங்கள்.', hi: 'स्वागत है। कुछ भी चाहिए तो कहिए।' },
      { who: 'B', en: 'Thank you. Where is the nearest shop?', ta: 'நன்றி. அருகில் கடை எங்கே?', hi: 'धन्यवाद। पास की दुकान कहाँ है?' },
      { who: 'A', en: 'At the end of this street.', ta: 'இந்தத் தெருவின் கடைசியில்.', hi: 'इसी गली के अंत में।' }
    ]
  },
  {
    id: 'emergency', level: 2,
    title: { en: 'When something is wrong', ta: 'ஏதோ தவறு நடக்கும்போது', hi: 'जब कुछ ग़लत हो' },
    lines: [
      { who: 'A', en: 'Please help! There has been an accident.', ta: 'உதவுங்கள்! ஒரு விபத்து நடந்துவிட்டது.', hi: 'मदद कीजिए! दुर्घटना हो गई है।' },
      { who: 'B', en: 'Where? Is anyone hurt?', ta: 'எங்கே? யாருக்காவது காயமா?', hi: 'कहाँ? क्या किसी को चोट लगी है?' },
      { who: 'A', en: 'Yes, near the bus stop. Call an ambulance.', ta: 'ஆம், பேருந்து நிறுத்தத்தின் அருகே. ஆம்புலன்ஸ் அழையுங்கள்.', hi: 'हाँ, बस स्टॉप के पास। एम्बुलेंस बुलाइए।' },
      { who: 'B', en: 'I am calling now. Stay calm.', ta: 'இப்போதே அழைக்கிறேன். அமைதியாக இருங்கள்.', hi: 'मैं अभी बुला रहा हूँ। शांत रहिए।' }
    ]
  },
  {
    id: 'goodbye', level: 1,
    title: { en: 'Saying goodbye', ta: 'விடைபெறுவது', hi: 'विदा लेना' },
    lines: [
      { who: 'A', en: 'It is getting late. I should go.', ta: 'நேரமாகிவிட்டது. நான் கிளம்புகிறேன்.', hi: 'देर हो रही है। मुझे चलना चाहिए।' },
      { who: 'B', en: 'Already? Stay a little longer.', ta: 'இப்போதே? கொஞ்சம் இருங்களேன்.', hi: 'अभी से? थोड़ी देर और रुकिए।' },
      { who: 'A', en: 'I would like to, but I have work.', ta: 'விருப்பம்தான், ஆனால் வேலை இருக்கிறது.', hi: 'मन तो है, पर काम है।' },
      { who: 'B', en: 'All right. Come again soon.', ta: 'சரி. மீண்டும் விரைவில் வாருங்கள்.', hi: 'ठीक है। फिर जल्दी आइए।' },
      { who: 'A', en: 'I will. Take care.', ta: 'வருகிறேன். கவனமாக இருங்கள்.', hi: 'ज़रूर। अपना ध्यान रखिए।' }
    ]
  }
];
