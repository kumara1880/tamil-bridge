/* Tamil Bridge — conversations to take part in, from beginner to native.

   data/spoken.js holds the everyday exchanges of levels 1 and 2. This file
   carries the learner the rest of the way: intermediate situations that need
   whole sentences, upper-intermediate ones that need opinions and polite
   disagreement, advanced ones that need argument and negotiation, and the
   native level, where what matters is idiom, humour, tact and warmth.

   Every line is in all three languages. In a conversation the partner says
   the A lines and the learner says the B lines, in English or in Hindi; the
   Tamil is always the meaning.

     alt  — other ways of saying a B line that should also be accepted. Hindi
            marks the speaker's gender on the verb (सकता / सकती), so a woman
            saying the feminine form has not made a mistake.
     tip  — what this line teaches, in English and in Tamil.               */
window.TB = window.TB || {};

TB.TALK_LEVELS = [
  { n: 1, en: 'Beginner',           ta: 'தொடக்கநிலை',        hi: 'शुरुआती',        cefr: 'A1' },
  { n: 2, en: 'Elementary',         ta: 'அடிப்படை',           hi: 'प्रारंभिक',       cefr: 'A2' },
  { n: 3, en: 'Intermediate',       ta: 'இடைநிலை',           hi: 'मध्यम',          cefr: 'B1' },
  { n: 4, en: 'Upper intermediate', ta: 'மேல் இடைநிலை',      hi: 'उच्च मध्यम',      cefr: 'B2' },
  { n: 5, en: 'Advanced',           ta: 'உயர்நிலை',           hi: 'उन्नत',          cefr: 'C1' },
  { n: 6, en: 'Native-like',        ta: 'தாய்மொழி நிலை',      hi: 'मातृभाषा जैसा',    cefr: 'C2' }
];

TB.TALK = [

  /* ============================================================ level 3 */
  {
    id: 'symptoms', level: 3,
    title: { en: 'At the doctor: describing symptoms', ta: 'மருத்துவரிடம்: அறிகுறிகளைச் சொல்வது', hi: 'डॉक्टर के पास: तकलीफ़ बताना' },
    lines: [
      { who: 'A', en: 'What seems to be the problem today?', hi: 'आज क्या तकलीफ़ है?', ta: 'இன்று உங்களுக்கு என்ன பிரச்சனை?' },
      { who: 'B', en: 'I have had a fever and a sore throat since Monday.', hi: 'मुझे सोमवार से बुखार और गले में दर्द है।', ta: 'திங்கள்கிழமையிலிருந்து எனக்குக் காய்ச்சலும் தொண்டை வலியும் இருக்கிறது.',
        tip: { en: 'Use "since" for a point in time (since Monday) and "for" for a length of time (for three days).', ta: 'ஒரு நாளைக் குறிக்க since (since Monday); காலஅளவுக்கு for (for three days).' } },
      { who: 'A', en: 'Do you have a cough or any body pain?', hi: 'क्या आपको खाँसी या बदन दर्द है?', ta: 'உங்களுக்கு இருமல் அல்லது உடல் வலி இருக்கிறதா?' },
      { who: 'B', en: 'Yes, I cough a lot at night, and my whole body aches.', hi: 'हाँ, रात को बहुत खाँसी आती है और पूरा बदन दुखता है।', ta: 'ஆம், இரவில் நிறைய இருமல் வருகிறது, உடம்பு முழுவதும் வலிக்கிறது.' },
      { who: 'A', en: 'Let me check your temperature. Open your mouth, please.', hi: 'मैं आपका तापमान देखता हूँ। ज़रा मुँह खोलिए।', ta: 'உங்கள் வெப்பநிலையைப் பார்க்கிறேன். தயவுசெய்து வாயைத் திறங்கள்.' },
      { who: 'B', en: 'Is it something serious, doctor?', hi: 'क्या यह कुछ गंभीर है, डॉक्टर साहब?', ta: 'இது ஏதாவது தீவிரமானதா, டாக்டர்?' },
      { who: 'A', en: 'No, it is a viral infection. Take this medicine twice a day after food.', hi: 'नहीं, यह वायरल संक्रमण है। यह दवा दिन में दो बार खाने के बाद लीजिए।', ta: 'இல்லை, இது வைரஸ் தொற்று. இந்த மருந்தை உணவுக்குப் பிறகு ஒரு நாளைக்கு இரண்டு முறை சாப்பிடுங்கள்.' },
      { who: 'B', en: 'Thank you. Should I come back if it does not get better?', hi: 'धन्यवाद। अगर ठीक न हो तो क्या फिर आना होगा?', ta: 'நன்றி. சரியாகவில்லை என்றால் மீண்டும் வர வேண்டுமா?' },
      { who: 'A', en: 'Yes, come back after three days if the fever continues.', hi: 'हाँ, अगर बुखार रहे तो तीन दिन बाद फिर आइए।', ta: 'ஆம், காய்ச்சல் தொடர்ந்தால் மூன்று நாட்களுக்குப் பிறகு மீண்டும் வாருங்கள்.' }
    ]
  },
  {
    id: 'train', level: 3,
    title: { en: 'Booking a train ticket', ta: 'ரயில் டிக்கெட் முன்பதிவு', hi: 'रेल टिकट बुक करना' },
    lines: [
      { who: 'A', en: 'Good morning. Where would you like to travel?', hi: 'सुप्रभात। आप कहाँ जाना चाहते हैं?', ta: 'காலை வணக்கம். நீங்கள் எங்கே பயணம் செய்ய விரும்புகிறீர்கள்?' },
      { who: 'B', en: 'I need two tickets to Chennai for this Friday.', hi: 'मुझे इस शुक्रवार के लिए चेन्नई के दो टिकट चाहिए।', ta: 'இந்த வெள்ளிக்கிழமைக்குச் சென்னைக்கு இரண்டு டிக்கெட் வேண்டும்.' },
      { who: 'A', en: 'Sleeper class or AC?', hi: 'स्लीपर क्लास या एसी?', ta: 'ஸ்லீப்பர் வகுப்பா, ஏசியா?' },
      { who: 'B', en: 'AC three-tier, please. How much will it cost?', hi: 'एसी थ्री-टियर, कृपया। कितना लगेगा?', ta: 'ஏசி மூன்றடுக்கு, தயவுசெய்து. எவ்வளவு ஆகும்?' },
      { who: 'A', en: 'It is one thousand two hundred rupees per person.', hi: 'प्रति व्यक्ति बारह सौ रुपये।', ta: 'ஒருவருக்கு ஆயிரத்து இருநூறு ரூபாய்.' },
      { who: 'B', en: 'Is there a window seat available?', hi: 'क्या खिड़की वाली सीट मिल सकती है?', ta: 'ஜன்னல் இருக்கை கிடைக்குமா?' },
      { who: 'A', en: 'Yes, I have given you a lower berth near the window.', hi: 'हाँ, मैंने आपको खिड़की के पास नीचे वाली बर्थ दे दी है।', ta: 'ஆம், ஜன்னல் அருகே கீழ் படுக்கையைக் கொடுத்திருக்கிறேன்.' },
      { who: 'B', en: 'Perfect. Can I pay by card?', hi: 'बढ़िया। क्या कार्ड से भुगतान हो सकता है?', ta: 'சரியானது. நான் கார்டில் பணம் செலுத்தலாமா?' },
      { who: 'A', en: 'Of course. Here are your tickets. Have a safe journey.', hi: 'ज़रूर। यह रहे आपके टिकट। आपकी यात्रा सुरक्षित हो।', ta: 'நிச்சயமாக. இதோ உங்கள் டிக்கெட்டுகள். பயணம் பாதுகாப்பாக அமையட்டும்.' }
    ]
  },
  {
    id: 'hotel', level: 3,
    title: { en: 'Checking into a hotel', ta: 'விடுதியில் தங்கப் பதிவு செய்வது', hi: 'होटल में चेक-इन' },
    lines: [
      { who: 'A', en: 'Welcome. Do you have a booking?', hi: 'स्वागत है। क्या आपकी बुकिंग है?', ta: 'வரவேற்கிறோம். உங்களுக்கு முன்பதிவு இருக்கிறதா?' },
      { who: 'B', en: 'Yes, I booked a double room online under the name Kumar.', hi: 'हाँ, कुमार के नाम पर ऑनलाइन एक डबल रूम बुक है।', ta: 'ஆம், குமார் என்ற பெயரில் ஆன்லைனில் ஒரு இரட்டை அறை முன்பதிவு செய்திருக்கிறேன்.' },
      { who: 'A', en: 'Yes, for two nights. May I see your ID, please?', hi: 'जी हाँ, दो रातों के लिए। क्या मैं आपका पहचान पत्र देख सकता हूँ?', ta: 'ஆம், இரண்டு இரவுகளுக்கு. உங்கள் அடையாள அட்டையைப் பார்க்கலாமா?' },
      { who: 'B', en: 'Here is my Aadhaar card. What time is breakfast?', hi: 'यह रहा मेरा आधार कार्ड। नाश्ता कितने बजे है?', ta: 'இதோ என் ஆதார் அட்டை. காலை உணவு எத்தனை மணிக்கு?' },
      { who: 'A', en: 'Breakfast is from seven to ten in the restaurant downstairs.', hi: 'नाश्ता नीचे रेस्टोरेंट में सात से दस बजे तक है।', ta: 'காலை உணவு கீழே உள்ள உணவகத்தில் ஏழு முதல் பத்து மணி வரை.' },
      { who: 'B', en: 'Is there Wi-Fi in the room?', hi: 'क्या कमरे में वाई-फ़ाई है?', ta: 'அறையில் வைஃபை இருக்கிறதா?' },
      { who: 'A', en: 'Yes, the password is on the card with your key.', hi: 'हाँ, पासवर्ड आपकी चाबी के साथ वाले कार्ड पर है।', ta: 'ஆம், கடவுச்சொல் உங்கள் சாவியுடன் உள்ள அட்டையில் இருக்கிறது.' },
      { who: 'B', en: 'Thank you. Could someone help me with my luggage?', hi: 'धन्यवाद। क्या कोई मेरा सामान उठाने में मदद कर सकता है?', ta: 'நன்றி. என் சாமான்களைத் தூக்க யாராவது உதவ முடியுமா?',
        tip: { en: '"Could someone help me...?" is a polite request. "Could" is softer than "can".', ta: '"Could someone help me...?" — மரியாதையான கோரிக்கை. can-ஐ விட could மென்மையானது.' } },
      { who: 'A', en: 'Certainly. Your room is on the third floor. Enjoy your stay.', hi: 'बिल्कुल। आपका कमरा तीसरी मंज़िल पर है। आपका ठहरना सुखद हो।', ta: 'நிச்சயமாக. உங்கள் அறை மூன்றாவது தளத்தில் இருக்கிறது. இனிமையாகத் தங்குங்கள்.' }
    ]
  },
  {
    id: 'plans', level: 3,
    title: { en: 'Making plans on the phone', ta: 'தொலைபேசியில் திட்டமிடுவது', hi: 'फ़ोन पर प्लान बनाना' },
    lines: [
      { who: 'A', en: 'Hey, are you free this Saturday evening?', hi: 'अरे, क्या तुम इस शनिवार शाम को फ़्री हो?', ta: 'ஏய், இந்த சனிக்கிழமை மாலை நீ ஓய்வாக இருக்கிறாயா?' },
      { who: 'B', en: 'I think so. Why, what is the plan?', hi: 'शायद हाँ। क्यों, क्या प्लान है?', ta: 'அப்படித்தான் நினைக்கிறேன். ஏன், என்ன திட்டம்?' },
      { who: 'A', en: 'A few of us are going to watch a movie and then have dinner.', hi: 'हम में से कुछ लोग फ़िल्म देखने और फिर खाना खाने जा रहे हैं।', ta: 'நாங்கள் சிலர் படம் பார்த்துவிட்டு இரவு உணவு சாப்பிடப் போகிறோம்.' },
      { who: 'B', en: 'That sounds fun. Which movie are you watching?', hi: 'मज़ेदार लगता है। कौन सी फ़िल्म देख रहे हो?', ta: 'அது சுவாரசியமாக இருக்கிறது. எந்தப் படம் பார்க்கிறீர்கள்?',
        tip: { en: '"That sounds fun" — use "sounds" to react to an idea someone has just told you.', ta: 'ஒருவர் சொன்ன யோசனைக்கு எதிர்வினை தர "That sounds..." பயன்படுத்துங்கள்.' } },
      { who: 'A', en: 'The new Tamil thriller. The show starts at six thirty.', hi: 'नई तमिल थ्रिलर। शो साढ़े छह बजे शुरू होता है।', ta: 'புதிய தமிழ் திரில்லர். காட்சி ஆறரை மணிக்குத் தொடங்குகிறது.' },
      { who: 'B', en: 'I finish work at six, so I might be a little late.', hi: 'मेरा काम छह बजे ख़त्म होता है, तो थोड़ी देर हो सकती है।', ta: 'நான் ஆறு மணிக்கு வேலை முடிப்பேன், அதனால் கொஞ்சம் தாமதமாகலாம்.' },
      { who: 'A', en: 'No problem, I will save a seat for you.', hi: 'कोई बात नहीं, मैं तुम्हारे लिए एक सीट रख लूँगा।', ta: 'பரவாயில்லை, உனக்காக ஒரு இருக்கையை வைத்திருப்பேன்.' },
      { who: 'B', en: 'Great, send me the location. See you on Saturday!', hi: 'बढ़िया, मुझे लोकेशन भेज देना। शनिवार को मिलते हैं!', ta: 'அருமை, இடத்தை எனக்கு அனுப்பு. சனிக்கிழமை சந்திப்போம்!' }
    ]
  },
  {
    id: 'wrong-order', level: 3,
    title: { en: 'A wrong food delivery', ta: 'தவறாக வந்த உணவு ஆர்டர்', hi: 'ग़लत खाना डिलीवर होना' },
    lines: [
      { who: 'A', en: 'Hello, this is customer support. How can I help you?', hi: 'नमस्ते, यह कस्टमर सपोर्ट है। मैं आपकी क्या मदद कर सकता हूँ?', ta: 'வணக்கம், இது வாடிக்கையாளர் சேவை. நான் உங்களுக்கு எப்படி உதவ முடியும்?' },
      { who: 'B', en: 'I ordered a vegetarian biryani, but I received chicken biryani.', hi: 'मैंने वेज बिरयानी मँगवाई थी, लेकिन मुझे चिकन बिरयानी मिली।', ta: 'நான் சைவ பிரியாணி ஆர்டர் செய்தேன், ஆனால் எனக்கு சிக்கன் பிரியாணி வந்தது.' },
      { who: 'A', en: 'I am very sorry about that. Could you tell me your order number?', hi: 'इसके लिए मुझे बहुत खेद है। क्या आप अपना ऑर्डर नंबर बता सकते हैं?', ta: 'அதற்கு மிகவும் வருந்துகிறேன். உங்கள் ஆர்டர் எண்ணைச் சொல்ல முடியுமா?' },
      { who: 'B', en: 'Yes, it is four five eight two one. I am a vegetarian, so I cannot eat this.', hi: 'जी, यह चार पाँच आठ दो एक है। मैं शाकाहारी हूँ, इसलिए यह नहीं खा सकता।', ta: 'ஆம், அது நான்கு ஐந்து எட்டு இரண்டு ஒன்று. நான் சைவம், அதனால் இதைச் சாப்பிட முடியாது.',
        alt: { hi: ['जी, यह चार पाँच आठ दो एक है। मैं शाकाहारी हूँ, इसलिए यह नहीं खा सकती।'] } },
      { who: 'A', en: 'I understand. We will send the correct order right away and refund this one.', hi: 'मैं समझता हूँ। हम तुरंत सही ऑर्डर भेजेंगे और इसका पैसा वापस करेंगे।', ta: 'புரிகிறது. சரியான ஆர்டரை உடனே அனுப்பி, இதற்கான பணத்தைத் திருப்பித் தருகிறோம்.' },
      { who: 'B', en: 'Thank you. How long will it take?', hi: 'धन्यवाद। इसमें कितना समय लगेगा?', ta: 'நன்றி. இதற்கு எவ்வளவு நேரம் ஆகும்?' },
      { who: 'A', en: 'About thirty minutes. Once again, we apologise for the trouble.', hi: 'लगभग तीस मिनट। एक बार फिर, असुविधा के लिए हमें खेद है।', ta: 'சுமார் முப்பது நிமிடங்கள். சிரமத்திற்கு மீண்டும் மன்னிப்புக் கேட்கிறோம்.' }
    ]
  },

  /* ============================================================ level 4 */
  {
    id: 'interview', level: 4,
    title: { en: 'A job interview', ta: 'வேலை நேர்காணல்', hi: 'नौकरी का इंटरव्यू' },
    lines: [
      { who: 'A', en: 'Please have a seat. Tell me a little about yourself.', hi: 'कृपया बैठिए। अपने बारे में थोड़ा बताइए।', ta: 'தயவுசெய்து உட்காருங்கள். உங்களைப் பற்றிக் கொஞ்சம் சொல்லுங்கள்.' },
      { who: 'B', en: 'I am a software engineer with four years of experience in web development.', hi: 'मैं एक सॉफ़्टवेयर इंजीनियर हूँ और मुझे वेब डेवलपमेंट में चार साल का अनुभव है।', ta: 'நான் ஒரு மென்பொருள் பொறியாளர், வலை மேம்பாட்டில் நான்கு ஆண்டு அனுபவம் உண்டு.',
        tip: { en: 'Say "four years of experience" — the "of" is easy to drop and examiners notice.', ta: '"four years of experience" — "of"-ஐ விடாதீர்கள்; நேர்காணலில் கவனிப்பார்கள்.' } },
      { who: 'A', en: 'Why do you want to leave your current job?', hi: 'आप अपनी मौजूदा नौकरी क्यों छोड़ना चाहते हैं?', ta: 'நீங்கள் தற்போதைய வேலையை ஏன் விட விரும்புகிறீர்கள்?' },
      { who: 'B', en: 'I am looking for more challenging projects and a chance to lead a team.', hi: 'मैं ज़्यादा चुनौतीपूर्ण प्रोजेक्ट और टीम का नेतृत्व करने का मौक़ा ढूँढ रहा हूँ।', ta: 'இன்னும் சவாலான திட்டங்களையும் ஒரு குழுவை வழிநடத்தும் வாய்ப்பையும் தேடுகிறேன்.',
        alt: { hi: ['मैं ज़्यादा चुनौतीपूर्ण प्रोजेक्ट और टीम का नेतृत्व करने का मौक़ा ढूँढ रही हूँ।'] },
        tip: { en: 'Talk about what you are moving towards, not what you are running from.', ta: 'எதிலிருந்து ஓடுகிறீர்கள் என்பதைவிட, எதை நோக்கிச் செல்கிறீர்கள் என்று சொல்லுங்கள்.' } },
      { who: 'A', en: 'What would you say is your greatest strength?', hi: 'आप अपनी सबसे बड़ी ताक़त क्या मानते हैं?', ta: 'உங்கள் மிகப் பெரிய பலம் எது என்று சொல்வீர்கள்?' },
      { who: 'B', en: 'I learn quickly, and I stay calm when deadlines are tight.', hi: 'मैं जल्दी सीखता हूँ और समय कम होने पर भी शांत रहता हूँ।', ta: 'நான் விரைவாகக் கற்றுக்கொள்வேன், காலக்கெடு நெருக்கமாக இருந்தாலும் அமைதியாக இருப்பேன்.',
        alt: { hi: ['मैं जल्दी सीखती हूँ और समय कम होने पर भी शांत रहती हूँ।'] } },
      { who: 'A', en: 'Where do you see yourself in five years?', hi: 'आप पाँच साल बाद ख़ुद को कहाँ देखते हैं?', ta: 'ஐந்து ஆண்டுகளில் உங்களை எங்கே பார்க்கிறீர்கள்?' },
      { who: 'B', en: 'I hope to be leading a product team and mentoring junior developers.', hi: 'मेरी उम्मीद है कि मैं एक प्रोडक्ट टीम का नेतृत्व करूँ और जूनियर डेवलपर्स का मार्गदर्शन करूँ।', ta: 'ஒரு தயாரிப்புக் குழுவை வழிநடத்தி, இளைய டெவலப்பர்களுக்கு வழிகாட்ட வேண்டும் என்று நம்புகிறேன்.' },
      { who: 'A', en: 'Do you have any questions for us?', hi: 'क्या आप हमसे कुछ पूछना चाहेंगे?', ta: 'எங்களிடம் ஏதாவது கேள்விகள் இருக்கிறதா?' },
      { who: 'B', en: 'Yes, what does a typical day look like for this role?', hi: 'जी हाँ, इस भूमिका में एक आम दिन कैसा होता है?', ta: 'ஆம், இந்தப் பணியில் ஒரு சாதாரண நாள் எப்படி இருக்கும்?',
        tip: { en: 'Always have a question ready — it shows real interest in the job.', ta: 'எப்போதும் ஒரு கேள்வி தயாராக வைத்திருங்கள் — வேலையில் உண்மையான ஆர்வத்தைக் காட்டும்.' } }
    ]
  },
  {
    id: 'renting', level: 4,
    title: { en: 'Renting a flat', ta: 'வாடகை வீடு பார்ப்பது', hi: 'किराए पर फ़्लैट लेना' },
    lines: [
      { who: 'A', en: 'The flat has two bedrooms, and the rent is fifteen thousand a month.', hi: 'फ़्लैट में दो बेडरूम हैं और किराया पंद्रह हज़ार महीना है।', ta: 'வீட்டில் இரண்டு படுக்கையறைகள் உள்ளன, வாடகை மாதம் பதினைந்தாயிரம்.' },
      { who: 'B', en: 'That is a little above my budget. Is the rent negotiable?', hi: 'यह मेरे बजट से थोड़ा ज़्यादा है। क्या किराए में कुछ कमी हो सकती है?', ta: 'இது என் பட்ஜெட்டை விடக் கொஞ்சம் அதிகம். வாடகையைக் குறைக்க முடியுமா?',
        tip: { en: '"Is it negotiable?" asks politely whether the price can come down.', ta: '"Is it negotiable?" — விலையைக் குறைக்க முடியுமா என்று மரியாதையாகக் கேட்பது.' } },
      { who: 'A', en: 'I could reduce it to fourteen thousand if you sign for a year.', hi: 'अगर आप एक साल का एग्रीमेंट करें तो मैं चौदह हज़ार कर सकता हूँ।', ta: 'ஒரு வருட ஒப்பந்தம் செய்தால் பதினான்காயிரமாகக் குறைக்கலாம்.' },
      { who: 'B', en: 'That works for me. How much is the deposit?', hi: 'यह मेरे लिए ठीक है। एडवांस कितना है?', ta: 'அது எனக்குச் சரி. முன்பணம் எவ்வளவு?' },
      { who: 'A', en: 'Three months’ rent as a deposit, which is refundable.', hi: 'तीन महीने का किराया एडवांस में, जो वापस मिल जाएगा।', ta: 'மூன்று மாத வாடகை முன்பணம், அது திருப்பித் தரப்படும்.' },
      { who: 'B', en: 'Are water and electricity included in the rent?', hi: 'क्या पानी और बिजली किराए में शामिल हैं?', ta: 'தண்ணீரும் மின்சாரமும் வாடகையில் சேர்ந்ததா?' },
      { who: 'A', en: 'Water is included, but electricity is charged separately by the meter.', hi: 'पानी शामिल है, लेकिन बिजली का बिल मीटर के हिसाब से अलग लगेगा।', ta: 'தண்ணீர் சேர்ந்தது, ஆனால் மின்சாரம் மீட்டர்படி தனியாகக் கட்ட வேண்டும்.' },
      { who: 'B', en: 'Fine. Could I move in from the first of next month?', hi: 'ठीक है। क्या अगले महीने की पहली तारीख़ से शिफ़्ट हो सकते हैं?', ta: 'சரி. அடுத்த மாதம் ஒன்றாம் தேதியிலிருந்து குடிவரலாமா?' },
      { who: 'A', en: 'Yes, that is fine. I will prepare the agreement this week.', hi: 'हाँ, ठीक है। मैं इसी हफ़्ते एग्रीमेंट तैयार कर दूँगा।', ta: 'ஆம், சரி. இந்த வாரமே ஒப்பந்தத்தைத் தயார் செய்கிறேன்.' }
    ]
  },
  {
    id: 'opinion', level: 4,
    title: { en: 'Giving your opinion of a film', ta: 'ஒரு படத்தைப் பற்றிக் கருத்துச் சொல்வது', hi: 'फ़िल्म पर अपनी राय देना' },
    lines: [
      { who: 'A', en: 'Did you watch the movie everyone is talking about?', hi: 'क्या तुमने वह फ़िल्म देखी जिसकी सब बात कर रहे हैं?', ta: 'எல்லோரும் பேசிக்கொண்டிருக்கும் அந்தப் படத்தைப் பார்த்தாயா?' },
      { who: 'B', en: 'Yes, I saw it last weekend. Honestly, I was a bit disappointed.', hi: 'हाँ, मैंने पिछले वीकेंड देखी। सच कहूँ तो मुझे थोड़ी निराशा हुई।', ta: 'ஆம், கடந்த வார இறுதியில் பார்த்தேன். உண்மையைச் சொன்னால், கொஞ்சம் ஏமாற்றமாக இருந்தது.' },
      { who: 'A', en: 'Really? Why? Everyone says it is brilliant.', hi: 'सच में? क्यों? सब कह रहे हैं कि बहुत शानदार है।', ta: 'உண்மையாகவா? ஏன்? எல்லோரும் அருமை என்கிறார்களே.' },
      { who: 'B', en: 'The acting was excellent, but the story was too predictable.', hi: 'अभिनय तो बहुत अच्छा था, लेकिन कहानी का अंदाज़ा पहले से लग जाता था।', ta: 'நடிப்பு அருமையாக இருந்தது, ஆனால் கதையை முன்பே ஊகிக்க முடிந்தது.',
        tip: { en: '"Too" means more than you want — it criticises. "Very" only means a lot.', ta: 'too = தேவைக்கு மேல் (குறை சொல்ல); very = மிகவும் (அவ்வளவுதான்).' } },
      { who: 'A', en: 'I see your point, but the music was amazing.', hi: 'मैं तुम्हारी बात समझता हूँ, लेकिन संगीत तो कमाल का था।', ta: 'உன் கருத்து புரிகிறது, ஆனால் இசை அற்புதமாக இருந்தது.' },
      { who: 'B', en: 'I agree with you there. The songs were the best part.', hi: 'इस बात से मैं सहमत हूँ। गाने सबसे अच्छा हिस्सा थे।', ta: 'அதில் உன்னுடன் ஒத்துப்போகிறேன். பாடல்கள்தான் சிறந்த பகுதி.' },
      { who: 'A', en: 'Would you recommend it to others?', hi: 'क्या तुम दूसरों को इसे देखने की सलाह दोगे?', ta: 'மற்றவர்களுக்கு இதைப் பரிந்துரைப்பாயா?' },
      { who: 'B', en: 'For the music and acting, yes, but do not expect any surprises.', hi: 'संगीत और अभिनय के लिए हाँ, लेकिन किसी सरप्राइज़ की उम्मीद मत करना।', ta: 'இசைக்கும் நடிப்புக்கும் ஆம், ஆனால் ஆச்சரியங்கள் எதையும் எதிர்பார்க்காதே.' }
    ]
  },
  {
    id: 'meeting', level: 4,
    title: { en: 'Disagreeing politely at work', ta: 'அலுவலகத்தில் மரியாதையாக மறுப்பது', hi: 'काम पर विनम्रता से असहमति जताना' },
    lines: [
      { who: 'A', en: 'I think we should launch the app next week.', hi: 'मुझे लगता है कि हमें अगले हफ़्ते ऐप लॉन्च कर देना चाहिए।', ta: 'அடுத்த வாரம் செயலியை வெளியிட வேண்டும் என்று நினைக்கிறேன்.' },
      { who: 'B', en: 'I see why you want to move fast, but I have a concern.', hi: 'बात समझ में आती है कि आप जल्दी क्यों करना चाहते हैं, लेकिन मेरी एक चिंता है।', ta: 'ஏன் விரைவாகச் செல்ல விரும்புகிறீர்கள் என்று புரிகிறது, ஆனால் எனக்கு ஒரு கவலை இருக்கிறது.',
        tip: { en: 'Agree with something first, then disagree: "I see why..., but..." sounds respectful.', ta: 'முதலில் ஒன்றை ஒப்புக்கொண்டு பிறகு மறுங்கள்: "I see why..., but..." மரியாதையாக ஒலிக்கும்.' } },
      { who: 'A', en: 'What is it?', hi: 'वह क्या है?', ta: 'அது என்ன?' },
      { who: 'B', en: 'We have not finished testing the payment feature yet.', hi: 'हमने अभी तक पेमेंट वाले फ़ीचर की टेस्टिंग पूरी नहीं की है।', ta: 'பணம் செலுத்தும் வசதியின் சோதனையை இன்னும் முடிக்கவில்லை.' },
      { who: 'A', en: 'How much more time would you need?', hi: 'आपको और कितना समय चाहिए?', ta: 'உங்களுக்கு இன்னும் எவ்வளவு நேரம் தேவை?' },
      { who: 'B', en: 'Two more weeks would give us enough time to fix any bugs.', hi: 'दो हफ़्ते और मिल जाएँ तो हम सारी गड़बड़ियाँ ठीक कर लेंगे।', ta: 'இன்னும் இரண்டு வாரம் கிடைத்தால் எல்லாப் பிழைகளையும் சரிசெய்துவிடுவோம்.' },
      { who: 'A', en: 'That makes sense. Let us aim for the end of the month.', hi: 'यह ठीक लगता है। चलिए महीने के आख़िर तक का लक्ष्य रखते हैं।', ta: 'அது சரியாகப் படுகிறது. மாத இறுதிக்குள் இலக்கு வைப்போம்.' },
      { who: 'B', en: 'Thank you for understanding. I will share a testing plan today.', hi: 'समझने के लिए धन्यवाद। मैं आज ही टेस्टिंग का प्लान भेज दूँगा।', ta: 'புரிந்துகொண்டதற்கு நன்றி. இன்றே சோதனைத் திட்டத்தைப் பகிர்கிறேன்.',
        alt: { hi: ['समझने के लिए धन्यवाद। मैं आज ही टेस्टिंग का प्लान भेज दूँगी।'] } }
    ]
  },
  {
    id: 'refund', level: 4,
    title: { en: 'Asking for a refund', ta: 'பணத்தைத் திரும்பக் கேட்பது', hi: 'पैसे वापस माँगना' },
    lines: [
      { who: 'A', en: 'Thank you for calling. How may I help you?', hi: 'कॉल करने के लिए धन्यवाद। मैं आपकी क्या सहायता कर सकती हूँ?', ta: 'அழைத்ததற்கு நன்றி. நான் உங்களுக்கு எப்படி உதவலாம்?' },
      { who: 'B', en: 'I bought a mixer grinder last week, and it stopped working after two days.', hi: 'मैंने पिछले हफ़्ते एक मिक्सर ग्राइंडर ख़रीदा था, और वह दो दिन बाद ही बंद हो गया।', ta: 'கடந்த வாரம் ஒரு மிக்ஸி வாங்கினேன், இரண்டு நாட்களிலேயே வேலை செய்வது நின்றுவிட்டது.' },
      { who: 'A', en: 'I am sorry to hear that. Would you like a replacement or a refund?', hi: 'यह सुनकर दुख हुआ। क्या आप बदलवाना चाहेंगे या पैसे वापस चाहेंगे?', ta: 'அதைக் கேட்டு வருந்துகிறேன். மாற்றுப் பொருள் வேண்டுமா, பணம் திரும்ப வேண்டுமா?' },
      { who: 'B', en: 'I would prefer a full refund, please.', hi: 'मुझे पूरे पैसे वापस चाहिए, कृपया।', ta: 'எனக்கு முழுப் பணமும் திரும்ப வேண்டும், தயவுசெய்து.',
        tip: { en: '"I would prefer..." is softer and more polite than "I want...".', ta: '"I want" என்பதைவிட "I would prefer" மென்மையானது, மரியாதையானது.' } },
      { who: 'A', en: 'Certainly. Our technician will collect it tomorrow between ten and one.', hi: 'ज़रूर। हमारा टेक्नीशियन कल दस से एक बजे के बीच इसे ले जाएगा।', ta: 'நிச்சயமாக. எங்கள் தொழில்நுட்பர் நாளை பத்து முதல் ஒரு மணிக்குள் அதை எடுத்துச் செல்வார்.' },
      { who: 'B', en: 'How many days will the refund take?', hi: 'पैसे वापस आने में कितने दिन लगेंगे?', ta: 'பணம் திரும்ப வர எத்தனை நாட்கள் ஆகும்?' },
      { who: 'A', en: 'It will reach your account within five to seven working days.', hi: 'पाँच से सात कामकाजी दिनों में आपके खाते में आ जाएँगे।', ta: 'ஐந்து முதல் ஏழு வேலை நாட்களுக்குள் உங்கள் கணக்கில் வந்துவிடும்.' },
      { who: 'B', en: 'Could you send me a confirmation by email?', hi: 'क्या आप मुझे ईमेल पर इसकी पुष्टि भेज सकते हैं?', ta: 'இதன் உறுதிப்படுத்தலை எனக்கு மின்னஞ்சலில் அனுப்ப முடியுமா?' },
      { who: 'A', en: 'Yes, you will receive it in a few minutes.', hi: 'हाँ, कुछ ही मिनटों में आपको मिल जाएगा।', ta: 'ஆம், சில நிமிடங்களில் உங்களுக்குக் கிடைக்கும்.' }
    ]
  },

  /* ============================================================ level 5 */
  {
    id: 'salary', level: 5,
    title: { en: 'Negotiating a salary', ta: 'சம்பளம் பேசி முடிவு செய்வது', hi: 'वेतन पर मोलभाव' },
    lines: [
      { who: 'A', en: 'We would like to offer you the position at eight lakh per year.', hi: 'हम आपको यह पद आठ लाख सालाना पर देना चाहेंगे।', ta: 'இந்தப் பதவியை ஆண்டுக்கு எட்டு லட்சத்தில் உங்களுக்கு வழங்க விரும்புகிறோம்.' },
      { who: 'B', en: 'Thank you, I am really excited about this role. Is there any flexibility on the salary?', hi: 'धन्यवाद, मैं इस भूमिका को लेकर सच में उत्साहित हूँ। क्या वेतन में कुछ गुंजाइश है?', ta: 'நன்றி, இந்தப் பணியைப் பற்றி உண்மையிலேயே ஆர்வமாக இருக்கிறேன். சம்பளத்தில் ஏதாவது மாற்றத்துக்கு வாய்ப்பு இருக்கிறதா?',
        tip: { en: 'Show enthusiasm first, then ask. It keeps the conversation warm.', ta: 'முதலில் ஆர்வத்தைக் காட்டுங்கள், பிறகு கேளுங்கள் — உரையாடல் இனிமையாக இருக்கும்.' } },
      { who: 'A', en: 'What figure did you have in mind?', hi: 'आपके मन में कितनी रक़म है?', ta: 'நீங்கள் எந்தத் தொகையை எதிர்பார்க்கிறீர்கள்?' },
      { who: 'B', en: 'Based on my experience and the market rate, I was hoping for something closer to ten lakh.', hi: 'मेरे अनुभव और बाज़ार के हिसाब से, मुझे दस लाख के आसपास की उम्मीद थी।', ta: 'என் அனுபவத்தையும் சந்தை நிலவரத்தையும் வைத்துப் பார்த்தால், பத்து லட்சத்துக்கு அருகில் எதிர்பார்த்தேன்.',
        tip: { en: '"I was hoping for..." — the past tense makes a request gentler than "I want".', ta: '"I was hoping for..." — இறந்தகாலம் கோரிக்கையை "I want"-ஐ விட மென்மையாக்கும்.' } },
      { who: 'A', en: 'That is above our budget for this level.', hi: 'यह इस स्तर के हमारे बजट से ज़्यादा है।', ta: 'இந்த நிலைக்கான எங்கள் பட்ஜெட்டை விட அது அதிகம்.' },
      { who: 'B', en: 'I understand. Would there be room for a review after six months?', hi: 'बात समझ में आती है। क्या छह महीने बाद रिव्यू की गुंजाइश होगी?', ta: 'புரிகிறது. ஆறு மாதங்களுக்குப் பிறகு மதிப்பாய்வுக்கு வாய்ப்பு இருக்குமா?' },
      { who: 'A', en: 'We can offer nine lakh now, with a review after six months.', hi: 'हम अभी नौ लाख दे सकते हैं, और छह महीने बाद रिव्यू होगा।', ta: 'இப்போது ஒன்பது லட்சம் தரலாம், ஆறு மாதத்தில் மதிப்பாய்வு உண்டு.' },
      { who: 'B', en: 'That sounds fair. Could you put that in the offer letter?', hi: 'यह उचित लगता है। क्या आप यह ऑफ़र लेटर में लिख सकते हैं?', ta: 'அது நியாயமாகத் தெரிகிறது. அதை நியமனக் கடிதத்தில் சேர்க்க முடியுமா?',
        tip: { en: 'Always ask for an agreement in writing.', ta: 'ஒப்புக்கொண்டதை எப்போதும் எழுத்தில் கேளுங்கள்.' } },
      { who: 'A', en: 'Of course. We will send the revised letter today.', hi: 'बिल्कुल। हम आज ही संशोधित पत्र भेज देंगे।', ta: 'நிச்சயமாக. திருத்தப்பட்ட கடிதத்தை இன்றே அனுப்புகிறோம்.' }
    ]
  },
  {
    id: 'presentation', level: 5,
    title: { en: 'Answering questions after a presentation', ta: 'விளக்கக்காட்சிக்குப் பின் கேள்விகளுக்குப் பதில்', hi: 'प्रस्तुति के बाद सवालों के जवाब' },
    lines: [
      { who: 'A', en: 'Thank you for the presentation. I have a question about the costs.', hi: 'प्रस्तुति के लिए धन्यवाद। लागत के बारे में मेरा एक सवाल है।', ta: 'விளக்கக்காட்சிக்கு நன்றி. செலவுகள் பற்றி எனக்கு ஒரு கேள்வி.' },
      { who: 'B', en: 'Of course, please go ahead.', hi: 'ज़रूर, पूछिए।', ta: 'நிச்சயமாக, கேளுங்கள்.' },
      { who: 'A', en: 'Why is the second year so much more expensive than the first?', hi: 'दूसरा साल पहले से इतना महँगा क्यों है?', ta: 'இரண்டாம் ஆண்டு முதல் ஆண்டைவிட ஏன் இவ்வளவு அதிகச் செலவாகிறது?' },
      { who: 'B', en: 'That is a good question. In the second year we hire five more people to support the new users.', hi: 'अच्छा सवाल है। दूसरे साल हम नए उपयोगकर्ताओं की मदद के लिए पाँच और लोगों को रखेंगे।', ta: 'நல்ல கேள்வி. இரண்டாம் ஆண்டில் புதிய பயனர்களுக்கு உதவ இன்னும் ஐந்து பேரைப் பணியமர்த்துகிறோம்.',
        tip: { en: '"That is a good question" gives you a moment to think, and sounds confident.', ta: '"That is a good question" — யோசிக்க ஒரு நொடி கிடைக்கும், நம்பிக்கையாகவும் ஒலிக்கும்.' } },
      { who: 'A', en: 'Could that cost be reduced?', hi: 'क्या उस लागत को कम किया जा सकता है?', ta: 'அந்தச் செலவைக் குறைக்க முடியுமா?' },
      { who: 'B', en: 'Partly. If we automate customer support, we would need only three people.', hi: 'कुछ हद तक। अगर हम ग्राहक सहायता को स्वचालित कर दें, तो सिर्फ़ तीन लोगों की ज़रूरत होगी।', ta: 'ஓரளவு. வாடிக்கையாளர் சேவையைத் தானியங்கியாக்கினால், மூன்று பேர் மட்டுமே தேவைப்படுவர்.',
        tip: { en: '"If we..., we would..." — the second conditional talks about a possible plan.', ta: '"If we..., we would..." — சாத்தியமான ஒரு திட்டத்தைப் பற்றிப் பேசும் நிபந்தனை வாக்கியம்.' } },
      { who: 'A', en: 'How confident are you about these numbers?', hi: 'आप इन आँकड़ों को लेकर कितने आश्वस्त हैं?', ta: 'இந்த எண்களைப் பற்றி நீங்கள் எவ்வளவு உறுதியாக இருக்கிறீர்கள்?' },
      { who: 'B', en: 'Quite confident. They are based on our pilot with two hundred users.', hi: 'काफ़ी आश्वस्त हूँ। ये दो सौ उपयोगकर्ताओं के साथ किए गए हमारे पायलट पर आधारित हैं।', ta: 'மிகவும் உறுதியாக இருக்கிறேன். இவை இருநூறு பயனர்களுடன் நடத்திய எங்கள் சோதனையின் அடிப்படையில் அமைந்தவை.' },
      { who: 'A', en: 'Thank you, that is very clear.', hi: 'धन्यवाद, यह बिल्कुल स्पष्ट है।', ta: 'நன்றி, அது மிகவும் தெளிவாக இருக்கிறது.' }
    ]
  },
  {
    id: 'debate', level: 5,
    title: { en: 'A debate: should children have phones?', ta: 'விவாதம்: குழந்தைகளுக்குப் போன் வேண்டுமா?', hi: 'बहस: क्या बच्चों को फ़ोन मिलना चाहिए?' },
    lines: [
      { who: 'A', en: 'I think children should not be allowed smartphones until they are fourteen.', hi: 'मुझे लगता है कि बच्चों को चौदह साल की उम्र तक स्मार्टफ़ोन नहीं देने चाहिए।', ta: 'பதினான்கு வயது வரை குழந்தைகளுக்கு ஸ்மார்ட்போன் கொடுக்கக் கூடாது என்று நினைக்கிறேன்.' },
      { who: 'B', en: 'I partly agree, but a complete ban might not be realistic today.', hi: 'मैं कुछ हद तक सहमत हूँ, लेकिन आज के समय में पूरी पाबंदी शायद व्यावहारिक नहीं है।', ta: 'ஓரளவு ஒத்துக்கொள்கிறேன், ஆனால் இன்றைய காலத்தில் முழுத் தடை நடைமுறைக்கு ஒத்துவராது.' },
      { who: 'A', en: 'Why not? Phones affect their sleep and concentration.', hi: 'क्यों नहीं? फ़ोन उनकी नींद और एकाग्रता पर असर डालते हैं।', ta: 'ஏன் கூடாது? போன் அவர்களின் தூக்கத்தையும் கவனத்தையும் பாதிக்கிறது.' },
      { who: 'B', en: 'That is true, but children also use phones to study and to stay in touch with their parents.', hi: 'यह सच है, लेकिन बच्चे पढ़ाई और माता-पिता से संपर्क में रहने के लिए भी फ़ोन इस्तेमाल करते हैं।', ta: 'அது உண்மைதான், ஆனால் குழந்தைகள் படிக்கவும் பெற்றோருடன் தொடர்பில் இருக்கவும் போனைப் பயன்படுத்துகிறார்கள்.',
        tip: { en: '"That is true, but..." — accept their point first, then add yours.', ta: '"That is true, but..." — முதலில் அவர் கருத்தை ஏற்று, பிறகு உங்களுடையதைச் சேர்க்கவும்.' } },
      { who: 'A', en: 'So what would you suggest instead?', hi: 'तो आप इसके बजाय क्या सुझाव देंगे?', ta: 'அப்படியானால் அதற்குப் பதிலாக நீங்கள் என்ன பரிந்துரைப்பீர்கள்?' },
      { who: 'B', en: 'Clear limits: no phones at meals or after nine, and apps chosen together with parents.', hi: 'साफ़ नियम: खाने के समय और रात नौ बजे के बाद फ़ोन नहीं, और ऐप्स माता-पिता के साथ मिलकर चुने जाएँ।', ta: 'தெளிவான வரம்புகள்: உணவு நேரத்திலும் இரவு ஒன்பது மணிக்குப் பிறகும் போன் இல்லை, செயலிகளைப் பெற்றோருடன் சேர்ந்து தேர்ந்தெடுக்க வேண்டும்.' },
      { who: 'A', en: 'That is a balanced approach. I can accept that.', hi: 'यह संतुलित तरीक़ा है। मैं इसे मान सकता हूँ।', ta: 'அது சமநிலையான அணுகுமுறை. அதை ஏற்றுக்கொள்ள முடியும்.' },
      { who: 'B', en: 'Exactly. The goal is healthy habits, not punishment.', hi: 'बिल्कुल। मक़सद अच्छी आदतें बनाना है, सज़ा देना नहीं।', ta: 'சரியாகச் சொன்னீர்கள். நோக்கம் நல்ல பழக்கங்கள், தண்டனை அல்ல.' }
    ]
  },
  {
    id: 'news', level: 5,
    title: { en: 'Discussing the news', ta: 'செய்திகளைப் பற்றிப் பேசுவது', hi: 'ख़बरों पर चर्चा' },
    lines: [
      { who: 'A', en: 'Did you read about the heavy rain in Chennai yesterday?', hi: 'क्या तुमने कल चेन्नई में हुई भारी बारिश के बारे में पढ़ा?', ta: 'நேற்று சென்னையில் பெய்த கனமழை பற்றிப் படித்தாயா?' },
      { who: 'B', en: 'Yes, several areas were flooded and schools were closed.', hi: 'हाँ, कई इलाक़ों में पानी भर गया और स्कूल बंद कर दिए गए।', ta: 'ஆம், பல பகுதிகளில் வெள்ளம் புகுந்தது, பள்ளிகள் மூடப்பட்டன.',
        tip: { en: '"Were flooded", "were closed" — the passive, because what happened matters more than who did it.', ta: '"were flooded", "were closed" — செயப்பாட்டு வினை; யார் செய்தார் என்பதைவிட என்ன நடந்தது என்பதே முக்கியம்.' } },
      { who: 'A', en: 'It seems to happen every year now.', hi: 'ऐसा लगता है कि अब यह हर साल होता है।', ta: 'இப்போது இது ஒவ்வொரு ஆண்டும் நடப்பது போலத் தெரிகிறது.' },
      { who: 'B', en: 'The drains cannot handle that much water in such a short time.', hi: 'इतने कम समय में इतना पानी नालियाँ सँभाल नहीं पातीं।', ta: 'இவ்வளவு குறுகிய நேரத்தில் இவ்வளவு தண்ணீரை வடிகால்கள் தாங்க முடியாது.' },
      { who: 'A', en: 'What do you think the government should do?', hi: 'तुम्हारे हिसाब से सरकार को क्या करना चाहिए?', ta: 'அரசு என்ன செய்ய வேண்டும் என்று நினைக்கிறாய்?' },
      { who: 'B', en: 'In my view, they should clean the canals before the monsoon, not after it.', hi: 'मेरी राय में, उन्हें मानसून के बाद नहीं, बल्कि पहले नहरों की सफ़ाई करनी चाहिए।', ta: 'என் கருத்துப்படி, மழைக்காலத்துக்குப் பிறகு அல்ல, அதற்கு முன்பே கால்வாய்களைச் சுத்தம் செய்ய வேண்டும்.',
        tip: { en: '"In my view..." introduces an opinion more formally than "I think".', ta: '"In my view..." — "I think"-ஐ விட முறையாகக் கருத்தைத் தொடங்கும் விதம்.' } },
      { who: 'A', en: 'That makes sense. Prevention is cheaper than repair.', hi: 'यह सही बात है। बचाव मरम्मत से सस्ता होता है।', ta: 'அது சரியானது. சரிசெய்வதைவிடத் தடுப்பது மலிவானது.' },
      { who: 'B', en: 'Exactly, and it saves lives too.', hi: 'बिल्कुल, और इससे जानें भी बचती हैं।', ta: 'சரியாகச் சொன்னாய், அது உயிர்களையும் காப்பாற்றுகிறது.' }
    ]
  },

  /* ============================================================ level 6 */
  {
    id: 'smalltalk', level: 6,
    title: { en: 'Catching up with a friend, the way natives do', ta: 'நண்பருடன் இயல்பாகப் பேசுவது', hi: 'दोस्त से अपनेपन से बातचीत' },
    lines: [
      { who: 'A', en: 'Long time no see! How have you been?', hi: 'बहुत दिनों बाद मिले! कैसे हो?', ta: 'நீண்ட நாட்களுக்குப் பிறகு பார்க்கிறேன்! எப்படி இருக்கிறாய்?' },
      { who: 'B', en: 'Not bad at all. Work has been crazy, but I cannot complain.', hi: 'बिल्कुल ठीक। काम बहुत ज़्यादा रहा है, पर कोई शिकायत नहीं।', ta: 'நன்றாகவே இருக்கிறேன். வேலை தலைக்கு மேல் இருக்கிறது, ஆனால் குறை சொல்ல ஒன்றுமில்லை.',
        alt: { en: ['Not bad at all. Work has been crazy, but I can’t complain.'] },
        tip: { en: '"I can’t complain" means "things are fine" — not that you are not allowed to complain.', ta: '"I can’t complain" = எல்லாம் நன்றாக இருக்கிறது; புகார் செய்யத் தடை என்று அர்த்தமல்ல.' } },
      { who: 'A', en: 'Tell me about it. I have been snowed under with deadlines myself.', hi: 'मत पूछो। मैं भी डेडलाइन्स में बुरी तरह फँसा हुआ हूँ।', ta: 'எனக்கும் அதே கதைதான். நானும் காலக்கெடுக்களில் மூழ்கிக் கிடக்கிறேன்.' },
      { who: 'B', en: 'We should catch up properly over coffee sometime.', hi: 'किसी दिन कॉफ़ी पर आराम से बैठकर बातें करनी चाहिए।', ta: 'ஒரு நாள் காபி குடித்துக்கொண்டே நிதானமாகப் பேச வேண்டும்.',
        tip: { en: '"Catch up" = talk about everything since you last met. "Snowed under" (above) = too much work.', ta: 'catch up = கடைசியாகச் சந்தித்ததிலிருந்து நடந்தவற்றைப் பேசுவது. snowed under = வேலை அதிகம்.' } },
      { who: 'A', en: 'Definitely. How about Sunday morning?', hi: 'ज़रूर। रविवार सुबह कैसा रहेगा?', ta: 'நிச்சயமாக. ஞாயிறு காலை எப்படி?' },
      { who: 'B', en: 'Sunday works for me. Let us play it by ear on the time.', hi: 'रविवार मेरे लिए ठीक है। समय उस दिन देख लेंगे।', ta: 'ஞாயிறு எனக்குச் சரி. நேரத்தை அன்று பார்த்துக்கொள்ளலாம்.',
        alt: { en: ['Sunday works for me. Let’s play it by ear on the time.'] },
        tip: { en: '"Play it by ear" = decide later, depending on how things go.', ta: 'play it by ear = அந்த நேரத்தில் சூழ்நிலையைப் பொறுத்து முடிவு செய்வது.' } },
      { who: 'A', en: 'Sounds good. I will text you on Saturday night.', hi: 'ठीक है। मैं तुम्हें शनिवार रात मैसेज कर दूँगा।', ta: 'சரி. சனிக்கிழமை இரவு உனக்குக் குறுஞ்செய்தி அனுப்புகிறேன்.' },
      { who: 'B', en: 'Perfect. Take care, and do not work too hard!', hi: 'बढ़िया। अपना ख़याल रखना, और ज़्यादा काम मत करना!', ta: 'அருமை. உடம்பைப் பார்த்துக்கொள், அளவுக்கு மீறி வேலை செய்யாதே!',
        alt: { en: ['Perfect. Take care, and don’t work too hard!'] } }
    ]
  },
  {
    id: 'decline', level: 6,
    title: { en: 'Turning down an invitation gracefully', ta: 'அழைப்பை அன்பாக மறுப்பது', hi: 'न्योते को शालीनता से मना करना' },
    lines: [
      { who: 'A', en: 'We are having a small get-together at our place on Friday. You must come!', hi: 'शुक्रवार को हमारे घर पर एक छोटी सी पार्टी है। तुम्हें ज़रूर आना है!', ta: 'வெள்ளிக்கிழமை எங்கள் வீட்டில் ஒரு சிறிய ஒன்றுகூடல் இருக்கிறது. நீ கண்டிப்பாக வர வேண்டும்!' },
      { who: 'B', en: 'That is so kind of you to invite me. Unfortunately, I already have plans on Friday.', hi: 'मुझे बुलाने के लिए बहुत-बहुत शुक्रिया। पर अफ़सोस, शुक्रवार को मेरा पहले से कुछ तय है।', ta: 'என்னை அழைத்ததற்கு மிக்க நன்றி. ஆனால் வருத்தமாக, வெள்ளிக்கிழமை எனக்கு ஏற்கெனவே வேறு திட்டம் இருக்கிறது.',
        tip: { en: 'Thank them first, then say "unfortunately" — it softens the "no".', ta: 'முதலில் நன்றி சொல்லி, பிறகு "unfortunately" — மறுப்பை மென்மையாக்கும்.' } },
      { who: 'A', en: 'Oh, what a pity! Can you not come even for a little while?', hi: 'अरे, यह तो अफ़सोस की बात है! क्या थोड़ी देर के लिए भी नहीं आ सकते?', ta: 'அடடா, வருத்தமாக இருக்கிறது! கொஞ்ச நேரத்துக்குக் கூட வர முடியாதா?' },
      { who: 'B', en: 'I wish I could, but it is my mother’s birthday dinner and I cannot miss it.', hi: 'काश मैं आ पाता, लेकिन उस दिन मेरी माँ के जन्मदिन का खाना है और वह मैं नहीं छोड़ सकता।', ta: 'வர முடிந்தால் நன்றாக இருக்கும், ஆனால் அன்று என் அம்மாவின் பிறந்தநாள் விருந்து, அதைத் தவறவிட முடியாது.',
        alt: { hi: ['काश मैं आ पाती, लेकिन उस दिन मेरी माँ के जन्मदिन का खाना है और वह मैं नहीं छोड़ सकती।'] },
        tip: { en: '"I wish I could" = I would like to, but it is not possible.', ta: '"I wish I could" = முடிந்தால் நன்றாக இருக்கும், ஆனால் முடியாது.' } },
      { who: 'A', en: 'Of course, family comes first. Please wish her a happy birthday from us.', hi: 'बिल्कुल, परिवार पहले आता है। हमारी तरफ़ से उन्हें जन्मदिन की शुभकामनाएँ देना।', ta: 'நிச்சயமாக, குடும்பம்தான் முதலில். எங்கள் சார்பாக அவருக்குப் பிறந்தநாள் வாழ்த்துகள் சொல்.' },
      { who: 'B', en: 'I will. Let us plan something together next week instead.', hi: 'ज़रूर। चलो इसके बदले अगले हफ़्ते कुछ साथ में प्लान करते हैं।', ta: 'நிச்சயமாக. அதற்குப் பதிலாக அடுத்த வாரம் ஏதாவது சேர்ந்து திட்டமிடுவோம்.',
        alt: { en: ['I will. Let’s plan something together next week instead.'] } },
      { who: 'A', en: 'That would be lovely. I will hold you to that!', hi: 'यह तो बहुत अच्छा रहेगा। मैं यह वादा याद रखूँगी!', ta: 'அது அருமையாக இருக்கும். இந்த வாக்கை நினைவில் வைத்திருப்பேன்!' }
    ]
  },
  {
    id: 'banter', level: 6,
    title: { en: 'Friendly teasing at work', ta: 'அலுவலகத்தில் நட்பான கேலி', hi: 'दफ़्तर में दोस्ताना मज़ाक' },
    lines: [
      { who: 'A', en: 'You are late again! Did you oversleep?', hi: 'फिर से देर! क्या सोते रह गए थे?', ta: 'மறுபடியும் தாமதமா! தூங்கிவிட்டாயா?' },
      { who: 'B', en: 'Guilty as charged. My alarm and I are not on speaking terms.', hi: 'मान लिया, ग़लती मेरी है। मेरी और मेरे अलार्म की आजकल बोलचाल बंद है।', ta: 'ஒப்புக்கொள்கிறேன், தப்பு என்னுடையதுதான். எனக்கும் என் அலாரத்துக்கும் இப்போது பேச்சுவார்த்தை இல்லை.',
        tip: { en: '"Guilty as charged" — a light, funny way to admit a small mistake.', ta: '"Guilty as charged" — சிறு தவறை நகைச்சுவையாக ஒப்புக்கொள்ளும் விதம்.' } },
      { who: 'A', en: 'That is the third time this week. You owe the team coffee.', hi: 'इस हफ़्ते यह तीसरी बार है। अब टीम को कॉफ़ी पिलाना तुम्हारी ज़िम्मेदारी है।', ta: 'இந்த வாரத்தில் இது மூன்றாவது முறை. குழுவுக்குக் காபி வாங்கித் தருவது உன் பொறுப்பு.' },
      { who: 'B', en: 'Fair enough. Coffee is on me today, but no expensive orders!', hi: 'ठीक है, बात सही है। आज कॉफ़ी मेरी तरफ़ से, पर महँगे ऑर्डर नहीं!', ta: 'நியாயம்தான். இன்று காபி என் செலவில், ஆனால் விலை உயர்ந்த ஆர்டர்கள் வேண்டாம்!',
        tip: { en: '"It is on me" = I will pay for it.', ta: '"It is on me" = நான் பணம் தருகிறேன்.' } },
      { who: 'A', en: 'No promises. You did say it was on you.', hi: 'कोई वादा नहीं। तुमने ख़ुद ही कहा कि तुम्हारी तरफ़ से है।', ta: 'எந்த வாக்குறுதியும் இல்லை. உன் செலவு என்று நீயே சொன்னாய்.' },
      { who: 'B', en: 'I walked right into that one, didn’t I?', hi: 'यह जाल तो मैंने ख़ुद ही बिछाया था, है ना?', ta: 'நானே வலையில் போய் விழுந்துவிட்டேன், இல்லையா?',
        alt: { en: ['I walked right into that one, did I not?'] },
        tip: { en: '"I walked right into that" = I gave you an easy chance to tease me.', ta: '"I walked right into that" = எளிதாகக் கேலி செய்ய நானே வாய்ப்புக் கொடுத்துவிட்டேன்.' } },
      { who: 'A', en: 'You certainly did. Now hurry, the meeting starts in five minutes!', hi: 'बिल्कुल। अब जल्दी करो, मीटिंग पाँच मिनट में शुरू है!', ta: 'நிச்சயமாக. இப்போது சீக்கிரம், கூட்டம் ஐந்து நிமிடத்தில் தொடங்குகிறது!' }
    ]
  },
  {
    id: 'condolence', level: 6,
    title: { en: 'Offering condolences', ta: 'இரங்கல் தெரிவிப்பது', hi: 'संवेदना व्यक्त करना' },
    lines: [
      { who: 'A', en: 'I heard about your grandfather. I am so sorry for your loss.', hi: 'मुझे आपके दादाजी के बारे में पता चला। मुझे बहुत दुख है।', ta: 'உங்கள் தாத்தாவைப் பற்றிக் கேள்விப்பட்டேன். உங்கள் இழப்புக்கு மிகவும் வருந்துகிறேன்.' },
      { who: 'B', en: 'Thank you. It has been a difficult week for all of us.', hi: 'धन्यवाद। हम सबके लिए यह हफ़्ता बहुत मुश्किल रहा है।', ta: 'நன்றி. எங்கள் அனைவருக்கும் இது கடினமான வாரமாக இருந்தது.' },
      { who: 'A', en: 'He was such a kind man. He always had a story to tell.', hi: 'वे बहुत नेकदिल इंसान थे। उनके पास हमेशा कोई न कोई कहानी होती थी।', ta: 'அவர் மிகவும் அன்பான மனிதர். எப்போதும் சொல்ல ஒரு கதை வைத்திருப்பார்.' },
      { who: 'B', en: 'Yes, he did. We have been sharing his stories all week. It helps.', hi: 'हाँ, सच में। हम पूरे हफ़्ते उनकी कहानियाँ याद कर रहे हैं। इससे सहारा मिलता है।', ta: 'ஆம், உண்மைதான். இந்த வாரம் முழுவதும் அவருடைய கதைகளைப் பகிர்ந்துகொண்டிருக்கிறோம். அது ஆறுதலாக இருக்கிறது.' },
      { who: 'A', en: 'If there is anything I can do, please do not hesitate to ask.', hi: 'अगर मैं किसी भी तरह मदद कर सकूँ, तो बेझिझक बताइएगा।', ta: 'நான் ஏதாவது செய்ய முடிந்தால், தயங்காமல் கேளுங்கள்.' },
      { who: 'B', en: 'That means a lot. Thank you for being there.', hi: 'यह मेरे लिए बहुत मायने रखता है। साथ देने के लिए धन्यवाद।', ta: 'அது எனக்கு மிகவும் பெரிய விஷயம். உடனிருந்ததற்கு நன்றி.',
        tip: { en: '"That means a lot" — a warm way to thank someone for kindness.', ta: '"That means a lot" — ஒருவரின் அன்புக்கு நன்றி சொல்லும் கனிவான விதம்.' } },
      { who: 'A', en: 'Take all the time you need. We are all thinking of you.', hi: 'जितना समय चाहिए, लीजिए। हम सब आपके साथ हैं।', ta: 'உங்களுக்குத் தேவையான நேரம் எடுத்துக்கொள்ளுங்கள். நாங்கள் அனைவரும் உங்களுடன் இருக்கிறோம்.' }
    ]
  }
];
