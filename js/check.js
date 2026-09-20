/* Tamil Bridge — spelling and grammar checking.
   Targets the specific mistakes Tamil speakers make in English: missing
   articles (Tamil has none), subject-verb agreement (-s), double tense marking
   after did/does, "will" + inflected verb, a/an before vowels, and plural
   agreement after numbers.

   Design rule: never flag a word simply because it is absent from our word
   list — the list is small. A spelling suggestion appears only when the word is
   unknown AND sits within a small edit distance of a known word. Silence is
   better than a false accusation.                                             */
window.TB = window.TB || {};

TB.Check = (function () {

  var WORDS = null;
  var api_thirdPerson = null;

  /* Missing-apostrophe contractions and words that must be capitalised. */
  var APOSTROPHE = {
    dont: "don't", doesnt: "doesn't", didnt: "didn't", isnt: "isn't", arent: "aren't",
    wasnt: "wasn't", werent: "weren't", cant: "can't", cannot: 'cannot', wont: "won't",
    couldnt: "couldn't", shouldnt: "shouldn't", wouldnt: "wouldn't", havent: "haven't",
    hasnt: "hasn't", hadnt: "hadn't", im: "I'm", ive: "I've", ill: "I'll", id: "I'd",
    youre: "you're", youve: "you've", hes: "he's", shes: "she's", its_: "it's",
    were_: "we're", theyre: "they're", thats: "that's", theres: "there's", lets: "let's"
  };

  var PROPER = {
    english: 'English', hindi: 'Hindi', tamil: 'Tamil', india: 'India', indian: 'Indian',
    chennai: 'Chennai', delhi: 'Delhi', america: 'America', london: 'London',
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
    friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
    january: 'January', february: 'February', march: 'March', april: 'April',
    june: 'June', july: 'July', august: 'August', september: 'September',
    october: 'October', november: 'November', december: 'December'
  };

  function buildWordList() {
    var set = Object.create(null);
    function add(w) { if (w) set[String(w).toLowerCase()] = 1; }

    Object.keys(TB.LEX.en).forEach(add);
    (TB.VOCAB || []).forEach(function (v) {
      String(v.en).split(/\s+/).forEach(add);
    });
    Object.keys(TB.IRREGULAR || {}).forEach(function (base) {
      add(base);
      TB.IRREGULAR[base].forEach(function (f) { f.split('/').forEach(add); });
    });

    /* generate regular inflections so "walked"/"walking"/"walks" are known.
       -es (not -s) after o/s/x/z/ch/sh, otherwise "go" would yield "gos". */
    function thirdPerson(w) {
      if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
      if (/(s|x|z|ch|sh|o)$/.test(w)) return w + 'es';
      return w + 's';
    }
    Object.keys(TB.LEX.en).forEach(function (w) {
      var e = TB.LEX.en[w];
      if (e[0] !== 'verb' && e[0] !== 'noun' && e[0] !== 'adj') return;
      if (!/^[a-z]+$/.test(w)) return;
      add(thirdPerson(w));
      if (/[^aeiou]y$/.test(w)) add(w.slice(0, -1) + 'ied');
      if (e[0] === 'verb') {
        if (/e$/.test(w)) { add(w + 'd'); add(w.slice(0, -1) + 'ing'); }
        else { add(w + 'ed'); add(w + 'ing'); }
      }
      if (e[0] === 'adj') { add(w + 'er'); add(w + 'est'); add(w + 'ly'); }
    });
    /* third-person forms of irregular verbs: go -> goes, have -> has */
    Object.keys(TB.IRREGULAR || {}).forEach(function (base) { add(thirdPerson(base)); });
    api_thirdPerson = thirdPerson;

    /* contractions — without these, "dont" gets "corrected" to "done" */
    ("don't doesn't didn't isn't aren't wasn't weren't can't won't couldn't shouldn't "
    + "wouldn't haven't hasn't hadn't mustn't needn't i'm you're he's she's it's we're they're "
    + "i've you've we've they've i'll you'll he'll she'll we'll they'll i'd you'd he'd she'd "
    + "we'd they'd that's there's what's who's let's").split(/\s+/).forEach(add);

    /* everyday words that are not part of the teaching vocabulary */
    ('about above after again against ago all almost alone along already also always among another answer '
    + 'any anyone anything around ask away back bad bag ball bank bath beautiful because bed been before begin '
    + 'behind believe below best better between big bird birthday bit black blue boat body book born both '
    + 'bottle box boy bread break bring brother brown build bus business busy but buy call came camera can car '
    + 'care carry case cat catch chair chance change cheap check child children choose city class clean clear '
    + 'clock close cloth cloud coffee cold colour come common company complete computer cook cool copy corner '
    + 'correct cost could country course cover cross cry cup cut dark date daughter day dead dear decide deep '
    + 'desk die different difficult dinner dirty do doctor dog door double down draw dream dress drink drive '
    + 'drop dry during each early earth easy eat egg eight either else empty end enough enter equal even evening '
    + 'ever every exact example except exercise expect eye face fact fall family famous far farm fast father '
    + 'fear feel few field fight fill film find fine finger finish fire first fish five fix floor flower fly '
    + 'follow food foot for force forget form four free fresh friend from front fruit full fun future game '
    + 'garden gas gate general get gift girl give glass go god gold good great green ground group grow guess '
    + 'hair half hand happen happy hard hat hate have head hear heart heavy help her here high hill history '
    + 'hit hold hole holiday home hope horse hospital hot hotel hour house how however human hundred hungry '
    + 'hurry hurt idea important improve include increase india indian inside instead interest into introduce '
    + 'island job join journey joy jump just keep key kill kind king kitchen knife know lady lake land language '
    + 'large last late laugh law lead learn least leave left leg less lesson let letter level library lie life '
    + 'light like line lion list listen little live long look lose lot loud love low luck lunch machine main '
    + 'make man many map market marry matter may maybe meal mean meat medicine meet member memory message middle '
    + 'might milk mind minute miss mistake modern moment money month moon more morning most mother mountain '
    + 'mouth move much music must name narrow nation near necessary neck need never new news next nice night '
    + 'nine no noise none noon north nose not note nothing notice now number object ocean off offer office '
    + 'often oil old once one only open opinion opposite or orange order other our out outside over own page '
    + 'pain paint pair paper parent park part party pass past pay peace pen pencil people perfect perhaps person '
    + 'phone photo pick picture piece place plan plant plate play please pocket point poor possible post power '
    + 'practice prepare present press pretty price print prize problem produce program promise protect prove '
    + 'public pull purpose push put question quick quiet quite radio rain raise reach read ready real reason '
    + 'receive record red remember remove repeat reply report rest result return rice rich ride right ring '
    + 'rise river road rock room round rule run sad safe salt same sand save say school science sea search '
    + 'season seat second secret see seem sell send sense sentence separate serious serve service set seven '
    + 'several shake shall shape share sharp she sheet ship shirt shoe shop short should shoulder shout show '
    + 'shut sick side sign silence silver simple since sing single sister sit six size skin sky sleep slow '
    + 'small smell smile smoke snow so soft soil soldier some son song soon sorry sound soup south space speak '
    + 'special speed spell spend sport spring stand star start state station stay steal step stick still stone '
    + 'stop store story straight strange street strong student study subject success such sudden sugar summer '
    + 'sun sure surprise sweet swim system table take talk tall taste teach teacher team tear tell ten test '
    + 'than thank that the their them then there these they thick thin thing think third this those though '
    + 'thought thousand three through throw thus ticket tie time tired to today together tomorrow tonight too '
    + 'tooth top total touch town train travel tree trip trouble true trust try turn twice two type under '
    + 'understand unit until up upon use useful usual value various very village visit voice wait wake walk '
    + 'wall want war warm wash watch water way weak wear weather week weight welcome well west wet what wheel '
    + 'when where whether which while white who whole why wide wife wild will win wind window wine winter wise '
    + 'wish with within without woman wonder wood word work world worry worth would write wrong year yellow '
    + 'yes yesterday yet you young your zero homework english hindi tamil engineer teacher doctor '
    + 'nurse driver farmer worker manager student college university exam mark grade class subject '
    + 'maths science social computer mobile address email internet website online offline').split(/\s+/).forEach(add);

    WORDS = set;
    return set;
  }

  function known(w) {
    if (!WORDS) buildWordList();
    return !!WORDS[String(w).toLowerCase()];
  }

  function lev(a, b) { return TB.Speech.levenshtein(a, b); }

  function suggest(word, max) {
    if (!WORDS) buildWordList();
    var w = String(word).toLowerCase();
    if (!w || known(w)) return [];
    if (w.length < 3) return [];

    /* Two guards against corrupting real words the list simply does not know —
       above all personal names, which are common in a learner's sentences:
         - a candidate must share the first letter (typos rarely change it), and
         - short words allow only a single edit.
       Without these, "kumar" becomes "sugar" and "priya" becomes "price". */
    var limit = w.length <= 6 ? 1 : 2;
    var out = [];
    var keys = Object.keys(WORDS);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.charAt(0) !== w.charAt(0)) continue;
      if (Math.abs(k.length - w.length) > limit) continue;
      var d = lev(w, k);
      if (d <= limit) out.push({ word: k, d: d });
    }
    out.sort(function (a, b) { return a.d - b.d || a.word.length - b.word.length; });
    return out.slice(0, max || 4).map(function (o) { return o.word; });
  }

  /* ------------------------------------------------------- grammar checks */
  var VOWEL_SOUND_EXCEPT = { hour: 1, honest: 1, honour: 1, honor: 1, heir: 1 };
  var CONSONANT_SOUND_EXCEPT = { university: 1, user: 1, useful: 1, european: 1, one: 1, unit: 1, uniform: 1 };

  function startsVowelSound(w) {
    w = String(w).toLowerCase();
    if (VOWEL_SOUND_EXCEPT[w]) return true;
    if (CONSONANT_SOUND_EXCEPT[w]) return false;
    return /^[aeiou]/.test(w);
  }

  /* PASS 1 — spelling only. Runs before grammar so that later rules see the
     corrected words ("enginer" -> "engineer" before the a/an decision). */
  function spellPass(sentence) {
    if (!WORDS) buildWordList();
    var toks = String(sentence)
      .replace(/([.,!?;:])/g, ' $1 ')
      .split(/\s+/).filter(Boolean);
    var found = [];

    var out = toks.map(function (raw, idx) {
      var bare = raw.replace(/[.,!?;:"'()]/g, '');
      if (!bare || /^\d+$/.test(bare)) return raw;
      var low = bare.toLowerCase();

      /* missing apostrophe */
      if (APOSTROPHE[low] && !known(low)) {
        found.push({ index: idx, word: raw, suggestions: [APOSTROPHE[low]], kind: 'apostrophe' });
        return raw.replace(bare, APOSTROPHE[low]);
      }
      /* proper noun capitalisation */
      if (PROPER[low] && bare !== PROPER[low]) {
        found.push({ index: idx, word: raw, suggestions: [PROPER[low]], kind: 'capital' });
        return raw.replace(bare, PROPER[low]);
      }
      if (known(low)) return raw;
      if (/^[A-Z]/.test(bare) && idx > 0) return raw;      /* likely a name */

      var sug = suggest(low, 3);
      if (!sug.length) return raw;

      /* Auto-apply only when one candidate stands clearly alone. With several
         equally-close options we show them and leave the word untouched. */
      var applied = sug.length === 1;
      found.push({ index: idx, word: raw, suggestions: sug, kind: 'spelling', applied: applied });
      if (!applied) return raw;
      var rep = sug[0];
      if (/^[A-Z]/.test(bare)) rep = rep.charAt(0).toUpperCase() + rep.slice(1);
      return raw.replace(bare, rep);
    });

    return { text: out.join(' ').replace(/\s+([.,!?;:])/g, '$1').trim(), spelling: found };
  }

  function checkEnglish(sentence) {
    var sp = spellPass(sentence);
    var a = TB.Tutor.analyze(sp.text, 'en');
    var tags = a.tags;
    var issues = [];
    var fixed = a.tokens.slice();

    function push(i, type, ta, from, to) {
      issues.push({ index: i, type: type, ta: ta, from: from, to: to });
    }

    /* capital letter at the start */
    var firstIdx = tags.findIndex(function (t) { return t.pos !== 'punct'; });
    if (firstIdx >= 0 && /^[a-z]/.test(fixed[firstIdx])) {
      var cap = fixed[firstIdx].charAt(0).toUpperCase() + fixed[firstIdx].slice(1);
      push(firstIdx, 'capital', 'வாக்கியம் பெரிய எழுத்தில் தொடங்க வேண்டும்.', fixed[firstIdx], cap);
      fixed[firstIdx] = cap;
    }

    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      var next = tags[i + 1];
      var w = t.w;

      /* standalone "i" must be capital I */
      if (w === 'i' && t.raw === 'i') {
        push(i, 'capital', '"I" எப்போதும் பெரிய எழுத்து.', 'i', 'I');
        fixed[i] = 'I';
      }

      /* a / an */
      if ((w === 'a' || w === 'an') && next && next.pos !== 'punct') {
        var needAn = startsVowelSound(next.w);
        if (w === 'a' && needAn) {
          push(i, 'article', '"' + next.w + '" உயிர் ஒலியில் தொடங்குகிறது — "an" வேண்டும்.', 'a', 'an');
          fixed[i] = /^A/.test(t.raw) ? 'An' : 'an';
        } else if (w === 'an' && !needAn) {
          push(i, 'article', '"' + next.w + '" மெய் ஒலியில் தொடங்குகிறது — "a" வேண்டும்.', 'an', 'a');
          fixed[i] = /^A/.test(t.raw) ? 'A' : 'a';
        }
      }

      /* did / does / do + inflected verb  ->  base form */
      if ((w === 'did' || w === 'does' || w === 'do') && next) {
        var vi = i + 1;
        while (tags[vi] && (tags[vi].pos === 'part' || tags[vi].pos === 'adv' || tags[vi].pos === 'pron')) vi++;
        var v = tags[vi];
        if (v && v.pos === 'verb' && (/(ed|s)$/.test(v.w) || TB.IRREG_REV[v.w])) {
          var base = TB.IRREG_REV[v.w] || v.w.replace(/e?s$/, '').replace(/ed$/, '');
          if (TB.LEX.en[base] || known(base)) {
            push(vi, 'double-tense',
              '"' + w + '" ஏற்கனவே காலத்தைக் காட்டுகிறது — முதன்மை வினை அடிப்படை வடிவத்தில் இருக்க வேண்டும்.',
              v.w, base);
            fixed[vi] = base;
          }
        }
      }

      /* will / modal + inflected verb -> base form */
      if (['will', 'shall', 'can', 'could', 'would', 'should', 'may', 'might', 'must'].indexOf(w) >= 0 && next) {
        var mi = i + 1;
        while (tags[mi] && (tags[mi].pos === 'part' || tags[mi].pos === 'adv')) mi++;
        var mv = tags[mi];
        if (mv && mv.pos === 'verb' && /s$/.test(mv.w) && !/ss$/.test(mv.w)) {
          var mb = mv.w.replace(/e?s$/, '');
          push(mi, 'modal-form',
            '"' + w + '"-க்குப் பின் வினை எப்போதும் அடிப்படை வடிவம் — "-s" சேர்க்கக் கூடாது.',
            mv.w, mb);
          fixed[mi] = mb;
        }
      }

      /* number + singular noun */
      if (t.pos === 'num' && next && next.pos === 'noun' && !/s$/.test(next.w) && next.w !== 'people') {
        var num = t.w;
        var isPlural = /^\d+$/.test(num) ? parseInt(num, 10) > 1
          : ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'many', 'few'].indexOf(num) >= 0;
        if (isPlural) {
          var pl = api_thirdPerson ? api_thirdPerson(next.w) : next.w + 's';
          push(i + 1, 'plural', 'ஒன்றுக்கு மேற்பட்டவை — பெயர்ச்சொல் பன்மையாக இருக்க வேண்டும்.', next.w, pl);
          fixed[i + 1] = pl;
        }
      }

      /* be-verb agreement */
      if (t.pos === 'pron' && next && next.pos === 'aux') {
        var want = null;
        if (w === 'i' && next.w === 'is') want = 'am';
        else if (w === 'i' && next.w === 'are') want = 'am';
        else if (['he', 'she', 'it'].indexOf(w) >= 0 && next.w === 'are') want = 'is';
        else if (['we', 'they', 'you'].indexOf(w) >= 0 && next.w === 'is') want = 'are';
        else if (['he', 'she', 'it'].indexOf(w) >= 0 && next.w === 'were') want = 'was';
        else if (['we', 'they'].indexOf(w) >= 0 && next.w === 'was') want = 'were';
        if (want) {
          push(i + 1, 'agreement', '"' + t.raw + '"-உடன் "' + want + '" வர வேண்டும்.', next.w, want);
          fixed[i + 1] = want;
        }
      }
    }

    /* subject-verb agreement on the main verb */
    var svo = a.svo;
    if (svo && svo.verb.length === 1 && svo.verb[0].pos === 'verb' && svo.subject.length) {
      var subjW = svo.subject[svo.subject.length - 1];
      var mainV = svo.verb[0];
      var vIndex = tags.indexOf(mainV);
      var third = ['he', 'she', 'it'].indexOf(subjW.w) >= 0 ||
                  (subjW.pos === 'noun' && !/s$/.test(subjW.w) && subjW.w !== 'people' && subjW.w !== 'they');
      var plural = ['i', 'we', 'they', 'you'].indexOf(subjW.w) >= 0;

      /* an already-inflected past form takes no agreement -s: "went" not "wents" */
      var alreadyInflected = /(ed|ing)$/.test(mainV.w) || !!TB.IRREG_REV[mainV.w] || mainV.form === 'past';

      if (third && !/s$/.test(mainV.w) && !alreadyInflected && mainV.pos === 'verb') {
        var s3 = api_thirdPerson ? api_thirdPerson(mainV.w)
          : (/(s|x|z|ch|sh|o)$/.test(mainV.w) ? mainV.w + 'es' : mainV.w + 's');
        push(vIndex, 'agreement',
          'எழுவாய் "' + subjW.raw + '" (he/she/it வகை) — வினையில் "-s" கட்டாயம். தமிழில் இந்த விதி இல்லாததால் இது மிகப் பொதுவான பிழை.',
          mainV.w, s3);
        fixed[vIndex] = s3;
      } else if (plural && /s$/.test(mainV.w) && !/ss$/.test(mainV.w) && !alreadyInflected) {
        var b2 = mainV.w.replace(/ies$/, 'y').replace(/e?s$/, '');
        if (known(b2)) {
          push(vIndex, 'agreement',
            'எழுவாய் "' + subjW.raw + '" — வினையில் "-s" வரக் கூடாது.', mainV.w, b2);
          fixed[vIndex] = b2;
        }
      }
    }

    /* missing article before a singular countable noun */
    var hasDet = false;
    for (i = 0; i < tags.length; i++) {
      var tg = tags[i];
      if (tg.pos === 'det' || tg.pos === 'num') { hasDet = true; continue; }
      if (tg.pos === 'prep' || tg.pos === 'punct' || tg.pos === 'conj') { hasDet = false; continue; }
      if (tg.pos === 'noun' && !hasDet && !tg.proper && !tg.guessed && !/s$/.test(tg.w) &&
          ['people', 'water', 'money', 'time', 'work', 'food', 'music', 'rice', 'milk',
           'english', 'hindi', 'tamil', 'school', 'home', 'bed', 'india'].indexOf(tg.w) < 0) {
        var prev = tags[i - 1];
        if (!prev || (prev.pos !== 'adj' && prev.pos !== 'noun' && prev.pos !== 'det')) {
          issues.push({
            index: i, type: 'article-missing', soft: true,
            ta: '"' + tg.raw + '" — முன்னால் "a / an / the" தேவைப்படலாம். தமிழில் இச்சொற்கள் இல்லாததால் இது அடிக்கடி விடுபடும்.',
            from: tg.raw, to: (startsVowelSound(tg.w) ? 'an ' : 'a ') + tg.raw
          });
        }
      }
      hasDet = false;
    }

    /* repeated word */
    for (i = 1; i < tags.length; i++) {
      if (tags[i].w && tags[i].w === tags[i - 1].w && tags[i].pos !== 'punct') {
        push(i, 'repeat', 'சொல் இரண்டு முறை வந்துள்ளது.', tags[i].raw, '');
        fixed[i] = '';
      }
    }

    /* final punctuation */
    var lastTok = a.tokens[a.tokens.length - 1];
    if (lastTok && !/[.!?]/.test(lastTok)) {
      var isQ = a.type.en.indexOf('question') >= 0;
      issues.push({ index: a.tokens.length, type: 'punctuation', soft: true,
        ta: 'வாக்கியத்தின் முடிவில் ' + (isQ ? '"?"' : '"."') + ' சேர்க்கவும்.',
        from: '', to: isQ ? '?' : '.' });
      fixed.push(isQ ? '?' : '.');
    }

    var spelling = sp.spelling;

    var corrected = fixed.filter(Boolean).join(' ')
      .replace(/\s+n't/g, "n't")          /* the tokenizer split "don't" apart */
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      original: sentence,
      corrected: corrected,
      changed: corrected.replace(/\s|[.]/g, '') !== String(sentence).replace(/\s|[.]/g, ''),
      issues: issues,
      spelling: spelling,
      analysis: a,
      clean: issues.filter(function (x) { return !x.soft; }).length === 0 && spelling.length === 0
    };
  }

  return {
    known: known,
    suggest: suggest,
    buildWordList: buildWordList,
    check: function (sentence, lang) {
      lang = lang || TB.Tutor.detectLang(sentence);
      if (lang !== 'en') {
        /* For Tamil and Hindi we report the analysis without auto-correction:
           inventing corrections in a language we model only partially would do
           more harm than good. */
        var a = TB.Tutor.analyze(sentence, lang);
        return {
          original: sentence, corrected: sentence, changed: false,
          issues: [], spelling: [], analysis: a, clean: true,
          note: lang === 'ta'
            ? 'தமிழ் வாக்கியத்திற்கு இலக்கண பகுப்பாய்வு மட்டும் — தானியங்கி திருத்தம் இல்லை.'
            : 'इस वाक्य का विश्लेषण — स्वचालित सुधार नहीं.'
        };
      }
      return checkEnglish(sentence);
    }
  };
})();
