/* Tamil Bridge — what a conjugated form actually means.

   The tense charts showed मैं करता था, how to say it, and nothing else. A
   reader could pronounce every cell in the table and still not know what one
   of them meant. This turns a tense and a person into the meaning, in
   English and in Tamil.

   English is built, not looked up: the tense decides the frame (used to, was
   …ing, will), the person decides the subject and the agreement, and the
   verb's own forms come from the conjugator the English chart already uses.

   Tamil is built from five parts per verb. Tamil verbs fall into classes
   that take different tense markers — செய் makes செய்தேன் but படி makes
   படித்தேன் and போ makes போனேன் — and there is no rule that gets all of
   them right from the root alone. So the parts are listed, one line each,
   and a verb that is not listed gets no Tamil rather than a guess. Every
   line here is checkable at a glance, which is the point of writing them
   out instead of deriving them.                                            */
window.TB = window.TB || {};

TB.Gloss = (function () {

  /* ------------------------------------------------------------- English */

  var EN_SUBJECT = {
    '1s': 'I', '2s': 'you', '2p': 'you', '3s': 'he',
    '1p': 'we', '2f': 'you', '3p': 'they'
  };
  /* to be, in both tenses, for the continuous frames */
  var EN_IS   = { '1s': 'am',  '2s': 'are',  '2p': 'are',  '3s': 'is',
                  '1p': 'are', '2f': 'are',  '3p': 'are' };
  var EN_WAS  = { '1s': 'was', '2s': 'were', '2p': 'were', '3s': 'was',
                  '1p': 'were', '2f': 'were', '3p': 'were' };

  /* The eight Hindi tenses the chart draws, in English. */
  var EN_FRAME = {
    present:         function (s, p, v) { return s + ' ' + (p === '3s' ? v.third : v.base); },
    progressive:     function (s, p, v) { return s + ' ' + EN_IS[p] + ' ' + v.ing; },
    past:            function (s, p, v) { return s + ' ' + v.past; },
    pastHabitual:    function (s, p, v) { return s + ' used to ' + v.base; },
    pastProgressive: function (s, p, v) { return s + ' ' + EN_WAS[p] + ' ' + v.ing; },
    perfect:         function (s, p, v) { return s + ' ' + (p === '3s' ? 'has' : 'have') + ' ' + v.participle; },
    future:          function (s, p, v) { return s + ' will ' + v.base; },
    subjunctive:     function (s, p, v) { return s + ' may ' + v.base; }
  };

  function english(tenseId, person, enVerb) {
    var base = String(enVerb || '').trim().replace(/^to\s+/i, '');
    if (!base) return '';
    var frame = EN_FRAME[tenseId];
    var subject = EN_SUBJECT[person];
    if (!frame || !subject) return '';
    var forms;
    try { forms = TB.Conjugate.enForms(base); } catch (e) { return ''; }
    if (!forms || !forms.base) return '';
    return frame(subject, person, forms);
  }

  /* --------------------------------------------------------------- Tamil */

  var TA_PRONOUN = {
    '1s': 'நான்', '2s': 'நீ', '2p': 'நீங்கள்', '3s': 'அவன்',
    '1p': 'நாங்கள்', '2f': 'நீங்கள்', '3p': 'அவர்கள்'
  };

  /* A Tamil ending joins the stem rather than following it: செய்கிற் and
     ஏன் make செய்கிறேன், not "செய்கிற் ஏன்". So each ending is kept as the
     vowel that lands on the stem's last consonant, plus whatever follows. */
  var TA_ENDING = {
    '1s': ['ே', 'ன்'],      /* ē + n   — ஏன் */
    '2s': ['ா', 'ய்'],      /* ā + y   — ஆய் */
    '2p': ['ீ', 'ர்கள்'],   /* ī + rkaḷ — ஈர்கள் */
    '3s': ['ா', 'ன்'],      /* ā + n   — ஆன் */
    '1p': ['ோ', 'ம்'],      /* ō + m   — ஓம் */
    '2f': ['ீ', 'ர்கள்'],
    '3p': ['ா', 'ர்கள்']
  };

  var PULLI = '்';

  /* Drop the stem's silencing dot, land the vowel on that consonant, add
     the tail: செய்கிற் + ē + ன் -> செய்கிறேன். */
  function attach(stem, person) {
    var e = TA_ENDING[person];
    if (!stem || !e) return '';
    return stem.replace(new RegExp(PULLI + '$'), '') + e[0] + e[1];
  }

  /* Five parts per verb: the present, past and future stems (each ending in
     the dot that the person's vowel replaces), the verbal participle that
     the compound tenses are built on, and the infinitive.

       pres   past   fut    vp        inf
       செய்கிற் செய்த்  செய்வ்  செய்து    செய்ய     */
  var TA = {
    'செய்':          ['செய்கிற்', 'செய்த்', 'செய்வ்', 'செய்து', 'செய்ய'],
    'வா':            ['வருகிற்', 'வந்த்', 'வருவ்', 'வந்து', 'வர'],
    'போ':            ['போகிற்', 'போன்', 'போவ்', 'போய்', 'போக'],
    'இரு':           ['இருக்கிற்', 'இருந்த்', 'இருப்ப்', 'இருந்து', 'இருக்க'],
    'ஆகு':           ['ஆகிற்', 'ஆன்', 'ஆவ்', 'ஆகி', 'ஆக'],
    'சாப்பிடு':      ['சாப்பிடுகிற்', 'சாப்பிட்ட்', 'சாப்பிடுவ்', 'சாப்பிட்டு', 'சாப்பிட'],
    'குடி':          ['குடிக்கிற்', 'குடித்த்', 'குடிப்ப்', 'குடித்து', 'குடிக்க'],
    'படி':           ['படிக்கிற்', 'படித்த்', 'படிப்ப்', 'படித்து', 'படிக்க'],
    'எழுது':         ['எழுதுகிற்', 'எழுதின்', 'எழுதுவ்', 'எழுதி', 'எழுத'],
    'கொடு':          ['கொடுக்கிற்', 'கொடுத்த்', 'கொடுப்ப்', 'கொடுத்து', 'கொடுக்க'],
    'எடு':           ['எடுக்கிற்', 'எடுத்த்', 'எடுப்ப்', 'எடுத்து', 'எடுக்க'],
    'பேசு':          ['பேசுகிற்', 'பேசின்', 'பேசுவ்', 'பேசி', 'பேச'],
    'கேள்':          ['கேட்கிற்', 'கேட்ட்', 'கேட்ப்', 'கேட்டு', 'கேட்க'],
    'பார்':          ['பார்க்கிற்', 'பார்த்த்', 'பார்ப்ப்', 'பார்த்து', 'பார்க்க'],
    'நோக்கு':        ['நோக்குகிற்', 'நோக்கின்', 'நோக்குவ்', 'நோக்கி', 'நோக்க'],
    'சொல்':          ['சொல்கிற்', 'சொன்ன்', 'சொல்வ்', 'சொல்லி', 'சொல்ல'],
    'விழி':          ['விழிக்கிற்', 'விழித்த்', 'விழிப்ப்', 'விழித்து', 'விழிக்க'],
    'விளையாடு':      ['விளையாடுகிற்', 'விளையாடின்', 'விளையாடுவ்', 'விளையாடி', 'விளையாட'],
    'நட':            ['நடக்கிற்', 'நடந்த்', 'நடப்ப்', 'நடந்து', 'நடக்க'],
    'ஓடு':           ['ஓடுகிற்', 'ஓடின்', 'ஓடுவ்', 'ஓடி', 'ஓட'],
    'உருவாக்கு':     ['உருவாக்குகிற்', 'உருவாக்கின்', 'உருவாக்குவ்', 'உருவாக்கி', 'உருவாக்க'],
    'உட்கார்':       ['உட்காருகிற்', 'உட்கார்ந்த்', 'உட்காருவ்', 'உட்கார்ந்து', 'உட்கார'],
    'சந்தி':         ['சந்திக்கிற்', 'சந்தித்த்', 'சந்திப்ப்', 'சந்தித்து', 'சந்திக்க'],
    'வாழ்':          ['வாழ்கிற்', 'வாழ்ந்த்', 'வாழ்வ்', 'வாழ்ந்து', 'வாழ'],
    'அழு':           ['அழுகிற்', 'அழுத்', 'அழுவ்', 'அழுது', 'அழ'],
    'சிரி':          ['சிரிக்கிற்', 'சிரித்த்', 'சிரிப்ப்', 'சிரித்து', 'சிரிக்க'],
    'தூங்கு':        ['தூங்குகிற்', 'தூங்கின்', 'தூங்குவ்', 'தூங்கி', 'தூங்க'],
    'உதவு':          ['உதவுகிற்', 'உதவின்', 'உதவுவ்', 'உதவி', 'உதவ'],
    'கொண்டுவா':      ['கொண்டுவருகிற்', 'கொண்டுவந்த்', 'கொண்டுவருவ்', 'கொண்டுவந்து', 'கொண்டுவர'],
    'புரிந்துகொள்':  ['புரிந்துகொள்கிற்', 'புரிந்துகொண்ட்', 'புரிந்துகொள்வ்', 'புரிந்துகொண்டு', 'புரிந்துகொள்ள'],
    'கற்றுக்கொள்':   ['கற்றுக்கொள்கிற்', 'கற்றுக்கொண்ட்', 'கற்றுக்கொள்வ்', 'கற்றுக்கொண்டு', 'கற்றுக்கொள்ள']
  };

  var PRES = 0, PAST = 1, FUT = 2, VP = 3, INF = 4;

  /* The compound tenses put an auxiliary behind the verbal participle. They
     are written as two words — செய்து இருக்கிறேன் rather than
     செய்திருக்கிறேன் — because the join differs from verb to verb, and a
     learner can see the parts this way. */
  var TA_FRAME = {
    present:         function (p, person) { return attach(p[PRES], person); },
    past:            function (p, person) { return attach(p[PAST], person); },
    future:          function (p, person) { return attach(p[FUT], person); },
    progressive:     function (p, person) { return p[VP] + ' ' + attach('கொண்டிருக்கிற்', person); },
    pastProgressive: function (p, person) { return p[VP] + ' ' + attach('கொண்டிருந்த்', person); },
    perfect:         function (p, person) { return p[VP] + ' ' + attach('இருக்கிற்', person); },
    /* "Used to" is the one with no single Tamil frame. செய்து வந்தேன் works
       for செய், but போய் வந்தேன் already means went and came back — a
       different thing entirely. வழக்கமாக with the past tense says habitually
       and says it the same way for every verb, which is worth more here than
       an idiom that is right for some roots and wrong for others. */
    pastHabitual:    function (p, person) { return 'வழக்கமாக ' + attach(p[PAST], person); },
    /* May / should: one form for everybody, which is how Tamil says it. */
    subjunctive:     function (p) { return p[INF] + 'லாம்'; },
    /* The English chart asks for three more than the Hindi one does. */
    pastPerfect:     function (p, person) { return p[VP] + ' ' + attach('இருந்த்', person); },
    futurePerfect:   function (p, person) { return p[VP] + ' ' + attach('இருப்ப்', person); },
    futureProgressive: function (p, person) { return p[VP] + ' ' + attach('கொண்டிருப்ப்', person); }
  };

  /* The English chart names its twelve tenses differently, and splits finer
     than Tamil does: Tamil has one continuous, so a perfect continuous and a
     plain continuous land on the same form. Saying so is better than
     inventing a distinction the language does not make. */
  var EN_TENSE_TO_TA = {
    'present-simple': 'present',
    'present-continuous': 'progressive',
    'present-perfect': 'perfect',
    'present-perfect-continuous': 'progressive',
    'past-simple': 'past',
    'past-continuous': 'pastProgressive',
    'past-perfect': 'pastPerfect',
    'past-perfect-continuous': 'pastProgressive',
    'future-simple': 'future',
    'future-continuous': 'futureProgressive',
    'future-perfect': 'futurePerfect',
    'going-to': 'future'
  };

  function parts(taRoot) {
    return TA[String(taRoot || '').trim()] || null;
  }

  function tamil(tenseId, person, taRoot) {
    var p = parts(taRoot);
    var frame = TA_FRAME[tenseId] || TA_FRAME[EN_TENSE_TO_TA[tenseId]];
    var pron = TA_PRONOUN[person];
    if (!p || !frame || !pron) return '';
    var verb = frame(p, person);
    if (!verb) return '';
    return pron + ' ' + verb;
  }

  return {
    english: english,
    tamil: tamil,
    /* so a caller can say nothing rather than say it wrong */
    hasTamil: function (taRoot) { return !!parts(taRoot); },
    TA_VERBS: TA
  };
})();
