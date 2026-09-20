/* Tamil Bridge — interface language.
   The app is authored in Tamil because that is the learner's first language.
   This layer swaps the *interface* wording to English on request.

   It works by exact-match replacement over rendered text nodes and a few
   attributes. Exact match matters: lesson content, vocabulary and example
   sentences are never in this table, so they are left untouched — only chrome
   and labels change.                                                          */
window.TB = window.TB || {};

TB.I18N = (function () {
  var lang = 'ta';

  var EN = {
    /* nav + chrome */
    'முகப்பு': 'Home', 'பாடங்கள்': 'Lessons', 'பயிற்சி': 'Practice',
    'கருவிகள்': 'Tools', 'மொழிபெயர்ப்பு': 'Translate', 'அர்த்தம்': 'Meaning',
    'வாக்கிய விளக்கம்': 'Sentence Explainer', 'படம் மொழிபெயர்ப்பு': 'Photo Translate',
    'உச்சரிப்பு': 'Pronunciation', 'கற்றல் வளங்கள்': 'Resources',
    'எழுத்துகள்': 'Alphabet', 'ஒலிகள்': 'Sounds', 'சொற்கள்': 'Vocabulary',
    'கணக்கு': 'Account', 'வரலாறு': 'History', 'அமைப்புகள்': 'Settings',
    'வெளியேறு': 'Sign out', 'தமிழ் பாலம்': 'Learn through Tamil',
    'தமிழ் வழியாக ஆங்கிலம் & இந்தி': 'English & Hindi through Tamil',
    'தமிழ் வழியாக ஆங்கிலம் &amp; இந்தி': 'English & Hindi through Tamil',

    /* auth */
    'உள்நுழை': 'Sign in', 'புதிய கணக்கு': 'Create account',
    'கணக்கை உருவாக்கு': 'Create account', 'பெயர்': 'Name',
    'உங்கள் பெயர்': 'Your name',
    'மின்னஞ்சல் அல்லது தொலைபேசி எண்': 'Email or phone number',
    'கடவுச்சொல்': 'Password', 'குறைந்தது 8 எழுத்துகள்': 'At least 8 characters',
    'இரண்டில் எதை வேண்டுமானாலும் பயன்படுத்தலாம்.': 'Either one works.',
    'எழுத்து + எண் கலந்து குறைந்தது 8 எழுத்துகள்.': 'At least 8 characters, mixing letters and numbers.',
    'இந்தச் சாதனத்தில் உள்நுழைந்தே இரு': 'Keep me signed in on this device',
    'சற்று காத்திருங்கள்…': 'Please wait…',

    /* home */
    'இன்றைய கற்றல்': "Today's learning",
    'தொடர் நாட்கள் 🔥': 'Day streak 🔥', 'கற்ற சொற்கள்': 'Words learned',
    'இன்று மீள்பார்வை': 'Due today', 'முடிந்த பாடங்கள்': 'Lessons done',
    'அடுத்த பாடம்': 'Next lesson', 'இன்றைய மீள்பார்வை': "Today's review",
    'தொடங்கு →': 'Start →', 'பயிற்சி செய் →': 'Practise →',
    'விரைவு கருவிகள்': 'Quick tools', 'அடிக்கடி தேவைப்படுபவை': 'What you reach for most',
    'இன்றைய சொல்': 'Word of the day',
    'எந்த மொழியிலிருந்தும்': 'From any language', 'இலக்கணம் + காலம்': 'Grammar + tense',
    'புகைப்படத்திலிருந்து': 'From a photo', 'மதிப்பெண் பெறு': 'Get a score',
    '247 + வர்ணமாலா': '247 + varnamala',

    /* translate */
    'எந்த மொழியிலிருந்தும் எந்த மொழிக்கும் — தட்டச்சு செய்யும்போதே':
      'Any language to any language — as you type',
    'இங்கே எழுதுங்கள்…  தட்டச்சு செய்யும்போதே மொழிபெயர்க்கும்':
      'Type here… it translates as you type',
    'மொழிபெயர்ப்பு இங்கே தோன்றும்': 'Translation appears here',
    'அழி': 'Clear', 'நகலெடு': 'Copy', 'மாற்று': 'Swap',
    '🧠 விளக்கம்': '🧠 Explain', 'மற்ற மொழிகளில்': 'In other languages',
    'நகலெடுக்கப்பட்டது': 'Copied',
    'ஆஃப்லைன் அகராதி': 'offline dictionary',

    /* meaning */
    'எந்தச் சொல்லும் — எந்த மொழியிலும்': 'Any word — in any language',
    'தேடு': 'Search', 'தேடுகிறது…': 'Searching…',
    'ஆங்கில எழுத்தில் தமிழ் எழுதினாலும் வேலை செய்யும் — "poonai", "vanakkam".':
      'Romanised Tamil works too — "poonai", "vanakkam".',
    'தொடர்புடைய சொற்கள்': 'Related words', 'ஆங்கில விளக்கம்': 'English definition',
    'ஒத்த சொற்கள்:': 'Synonyms:', 'பிற பொருள்கள்': 'Other senses',
    'ஆதாரம்:': 'Source:', 'கிடைக்கவில்லை.': 'Not found.',
    'முழு விவரம் →': 'Full details →',

    /* tutor */
    'இலக்கணம், காலம், சொல் வரிசை — தமிழில் விளக்கம்':
      'Grammar, tense and word order — explained',
    '🧠 பகுப்பாய்வு': '🧠 Analyse', '✓ பிழை திருத்து': '✓ Check & fix',
    '🔊 குரல் பாடம்': '🔊 Voice lesson', '⏹ நிறுத்து': '⏹ Stop',
    'எடுத்துக்காட்டு': 'Example', 'பிழை திருத்தம்': 'Corrections',
    'நீங்கள் எழுதியது': 'What you wrote', 'திருத்தப்பட்டது': 'Corrected',
    'திருத்தியதைப் பயன்படுத்து': 'Use the correction',
    'வாக்கிய அமைப்பு': 'Sentence structure',
    'முதலில் ஒரு வாக்கியம் எழுதுங்கள்.': 'Type a sentence first.',

    /* practice */
    'இடைவெளி மீள்பார்வை (spaced repetition)': 'Spaced repetition',
    'இன்று தயார்': 'Due today', 'கற்றவை': 'Learned', 'புதியவை': 'New', 'மொத்தம்': 'Total',
    'கேள்வி மொழி:': 'Prompt language:', 'பதிலைக் காட்டு (Space)': 'Show answer (Space)',
    '😕 மறந்தேன்': '😕 Forgot', '😐 கடினம்': '😐 Hard', '🙂 சரி': '🙂 Good', '😃 எளிது': '😃 Easy',
    'சுற்று முடிந்தது': 'Round complete', 'மீண்டும்': 'Again',

    /* photo */
    'புகைப்படத்தில் உள்ள எழுத்தைப் படித்து மொழிபெயர்க்கும்':
      'Reads text from a photo and translates it',
    'படத்தில் உள்ள மொழி': 'Language in the photo',
    'எந்த மொழிக்கு மொழிபெயர்க்க?': 'Translate into',
    'படத்தைத் தேர்ந்தெடுக்கவும் அல்லது இங்கே இழுத்து விடவும்':
      'Choose an image or drop it here',
    'படித்த எழுத்து': 'Text found', 'வரிகள்': 'lines',

    /* speak */
    'உச்சரிப்புப் பயிற்சி': 'Pronunciation practice',
    'பேசுங்கள் — மதிப்பெண் பெறுங்கள்': 'Speak, and get a score',
    'பயிற்சி மொழி:': 'Practise in:', 'சொல்': 'Word', 'வாக்கியம்': 'Sentence',
    'இதைச் சொல்லுங்கள்': 'Say this',
    'மைக்கை அழுத்தி பேசுங்கள்': 'Tap the mic and speak',
    'கேட்கிறது… பேசுங்கள்': 'Listening… speak now',
    '🐢 மெதுவாகக் கேள்': '🐢 Hear it slowly', 'அடுத்தது →': 'Next →',

    /* alphabet & phonics */
    'தமிழ் 247 · இந்தி வர்ணமாலா · ஆங்கிலம் 26': 'Tamil 247 · Hindi varnamala · English 26',
    'உயிர் எழுத்து (12)': 'Vowels (12)', 'மெய் எழுத்து (18)': 'Consonants (18)',
    'உயிர்மெய் எழுத்து (216)': 'Compound letters (216)',
    'அனைத்து எழுத்துகளும் (26)': 'All letters (26)',
    '44 ஆங்கில ஒலிகள் · இந்தி ஒலி வேறுபாடுகள்': '44 English sounds · Hindi contrasts',
    'விதிகள்': 'Rules', 'தமிழில் இல்லை': 'not in Tamil', 'புதிய ஒலி': 'new sound',
    'மூச்சொலி': 'aspirated', 'உயிர்': 'vowel', 'மெய்': 'consonant', 'இடை': 'semi',

    /* vocab */
    'அனைத்தும்': 'All', '🔊 அனைத்தையும் கேள்': '🔊 Play all',
    'தேடு — தமிழ் / English / हिंदी': 'Search — Tamil / English / Hindi',
    'எதுவும் கிடைக்கவில்லை.': 'Nothing found.',

    /* history */
    'உங்கள் அனைத்து செயல்பாடுகளும்': 'Everything you have done',
    'வரலாற்றில் தேடு': 'Search history', '⬇ பதிவிறக்கு': '⬇ Download',
    'அனைத்தையும் அழி': 'Clear all', 'விளக்கம்': 'Explain', 'திருத்தம்': 'Correction',
    'படம்': 'Photo', '↻ மீண்டும்': '↻ Repeat',
    'இன்னும் பதிவுகள் இல்லை.': 'Nothing here yet.',
    'வரலாறு அழிக்கப்பட்டது': 'History cleared',

    /* settings */
    'குரல், தீம், தரவு, ஒத்திசைவு': 'Voice, theme, data, sync',
    'குரல்': 'Voice', 'வேகம்': 'Speed', 'சுருதி': 'Pitch',
    'தமிழ் குரல்': 'Tamil voice', 'சேமி': 'Save', 'மாற்று ': 'Change ',
    'கடவுச்சொல் மாற்று': 'Change password', 'பழைய கடவுச்சொல்': 'Old password',
    'புதிய கடவுச்சொல்': 'New password', 'தானாக': 'Automatic',
    'பயிற்சியில் தானாக ஒலிக்கட்டும்': 'Speak automatically during practice',
    'தமிழ் சோதனை': 'Tamil test', 'ஒத்திசைவு (விருப்பத்தேர்வு)': 'Sync (optional)',
    'API முகவரி': 'API address', 'இணைப்பைச் சோதி': 'Test connection',
    'தரவு': 'Data', '⬇ எல்லாவற்றையும் பதிவிறக்கு': '⬇ Download everything',
    '⬆ மீட்டெடு': '⬆ Restore', 'கணக்கை நீக்கு': 'Delete account',
    'இந்தச் செயலி பற்றி': 'About', 'சேமிக்கப்பட்டது': 'Saved',
    'கடவுச்சொல் மாற்றப்பட்டது': 'Password changed',
    'மீட்டெடுக்கப்பட்டது': 'Restored',

    /* modal + misc */
    'ஆம்': 'Yes', 'வேண்டாம்': 'No', 'வெளியேறவா?': 'Sign out?',
    'உங்கள் தரவு இந்தச் சாதனத்தில் பாதுகாப்பாக இருக்கும்.':
      'Your data stays safe on this device.',
    'அனைத்து வரலாற்றையும் அழிக்கவா?': 'Clear all history?',
    'இதை மீட்க முடியாது.': 'This cannot be undone.',
    'கணக்கை நீக்கவா?': 'Delete account?',
    'ஒலிக்கவும்': 'Play', 'தீம் மாற்று': 'Toggle theme',
    'தொடர் நாட்கள்': 'Day streak', 'புள்ளிகள்': 'Points',
    'இணையம் தேவை': 'needs internet'
  };

  /* Longest first, so multi-word labels win over their fragments. */
  var KEYS = Object.keys(EN).sort(function (a, b) { return b.length - a.length; });

  function translateNode(node) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      var trimmed = t.trim();
      if (!trimmed) return;
      if (EN[trimmed]) {
        node.nodeValue = t.replace(trimmed, EN[trimmed]);
        return;
      }
      /* labels like "வேகம் — 0.85" keep their numeric tail */
      for (var i = 0; i < KEYS.length; i++) {
        if (trimmed.indexOf(KEYS[i]) === 0 && KEYS[i].length > 4) {
          node.nodeValue = t.replace(KEYS[i], EN[KEYS[i]]);
          return;
        }
      }
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;

    ['placeholder', 'title', 'aria-label'].forEach(function (attr) {
      var v = node.getAttribute && node.getAttribute(attr);
      if (v && EN[v.trim()]) node.setAttribute(attr, EN[v.trim()]);
    });

    for (var c = node.firstChild; c; c = c.nextSibling) translateNode(c);
  }

  var api = {
    lang: function () { return lang; },

    set: function (l) {
      lang = l === 'en' ? 'en' : 'ta';
      document.documentElement.setAttribute('data-ui', lang);
      return lang;
    },

    /* Called after every render. A no-op while the interface is in Tamil. */
    apply: function (rootEl) {
      if (lang !== 'en') return;
      translateNode(rootEl || document.body);
    },

    /* For strings built in JS (toasts, view titles) rather than the DOM. */
    t: function (s) { return lang === 'en' ? (EN[s] || s) : s; },

    map: EN
  };

  return api;
})();
