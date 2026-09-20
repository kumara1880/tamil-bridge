/* Full offline regression suite for Tamil Bridge. */
const fs = require('fs'), vm = require('vm');
const R = __dirname + '/';

const ctx = {};
ctx.window = ctx; ctx.console = console; ctx.navigator = { onLine: false, language: 'en' };
ctx.fetch = () => Promise.reject(new Error('offline'));
ctx.setTimeout = setTimeout; ctx.clearTimeout = clearTimeout;
ctx.AbortController = AbortController; ctx.TextEncoder = TextEncoder;
ctx.localStorage = (() => { const m = new Map(); return {
  getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)),
  removeItem: k => m.delete(k), clear: () => m.clear() }; })();
ctx.crypto = require('crypto').webcrypto;
ctx.speechSynthesis = { getVoices: () => [], speak() {}, cancel() {}, addEventListener() {} };
ctx.document = { addEventListener() {}, head: { appendChild() {} }, createElement: () => ({}) };
vm.createContext(ctx);

['data/vocab.js','data/vocab2.js','data/ensound.js','data/alphabet.js','data/phonics.js','data/lessons.js','data/lessons2.js',
 'data/phrases.js','data/lexicon.js',
 'js/store.js','js/auth.js','js/speech.js','js/translit.js','js/vocabx.js','js/translate.js',
 'js/reader.js',
 'js/tutor.js','js/check.js','js/ocr.js','js/dict.js','js/srs.js','js/numbers.js','js/conjugate.js']
  .forEach(f => vm.runInContext(fs.readFileSync(R + f, 'utf8'), ctx, { filename: f }));

const TB = ctx.TB;
let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  cond ? pass++ : fail++;
  if (!cond) console.log('  FAIL  ' + name + (extra ? '  -> ' + extra : ''));
};
const section = s => console.log('\n' + s);

/* ---------------- data integrity ---------------- */
section('DATA');
t('vocab loaded', TB.VOCAB.length >= 3000, TB.VOCAB.length);
t('all vocab fields present', TB.VOCAB.every(w => w.ta && w.en && w.hi && w.taR && w.hiR && w.enTa && w.hiTa && w.th && w.id));
t('vocab ids unique', new Set(TB.VOCAB.map(w => w.id)).size === TB.VOCAB.length);
t('every theme has words', TB.THEMES.every(th => TB.VOCAB.some(w => w.th === th.id)));
t('every vocab theme is declared', TB.VOCAB.every(w => TB.THEMES.some(th => th.id === w.th)));
t('Tamil alphabet = 247',
  TB.ALPHABET.ta.vowels.length + TB.ALPHABET.ta.consonants.length + 1 +
  TB.ALPHABET.ta.grid.length * 12 === 247);
t('Tamil grid 18x12', TB.ALPHABET.ta.grid.length === 18 && TB.ALPHABET.ta.grid.every(r => r.cells.length === 12));
t('Hindi barakhadi 33x11', TB.ALPHABET.hi.grid.length === 33 && TB.ALPHABET.hi.grid.every(r => r.cells.length === 11));
t('English 26 letters', TB.ALPHABET.en.letters.length === 26);
t('44 English phonemes', TB.PHONICS.en.groups.reduce((n, g) => n + g.items.length, 0) === 44);
/* a floor, not a fixed count, so adding lessons never breaks the suite */
t('lesson units', TB.LESSONS.length >= 22, TB.LESSONS.length);
t('lesson sentences', TB.LESSONS.reduce((n, u) => n + u.lines.length, 0) >= 130,
  TB.LESSONS.reduce((n, u) => n + u.lines.length, 0));
t('lesson ids are unique',
  new Set(TB.LESSONS.map(u => u.id)).size === TB.LESSONS.length);
t('every lesson line is trilingual', TB.LESSONS.every(u => u.lines.every(l => l.ta && l.en && l.hi)));
t('every quiz answer index is valid',
  TB.LESSONS.every(u => u.quiz.every(q => q.a >= 0 && q.a < q.opts.length && q.why)));

/* ---------------- vocabulary ---------------- */
section('VOCABULARY');
(function () {
  var V = TB.VOCAB;
  t('3000+ words', V.length >= 3000, V.length);
  t('every word is trilingual',
    V.every(function (w) { return w.en && w.ta && w.hi; }));
  t('every word has a level 1-3',
    V.every(function (w) { return w.lv >= 1 && w.lv <= 3; }));
  var themes = {};
  TB.THEMES.forEach(function (x) { themes[x.id] = true; });
  var orphan = V.filter(function (w) { return !themes[w.th]; });
  t('every word has a real theme', orphan.length === 0,
    orphan.slice(0, 3).map(function (w) { return w.en + '/' + w.th; }).join(','));
  var seen = {}, dup = [];
  V.forEach(function (w) {
    var k = w.en.toLowerCase();
    if (seen[k]) dup.push(w.en); else seen[k] = 1;
  });
  t('no duplicate headwords', dup.length === 0, dup.slice(0, 5).join(','));
  /* a stray Latin letter inside a Tamil or Hindi word is invisible when you
     read it but silently breaks the reader, the voice and the search */
  var mixed = V.filter(function (w) {
    return /[^஀-௿\s.,!?()-]/.test(w.ta) ||
           /[^ऀ-ॿ\s.,!?()-]/.test(w.hi);
  });
  t('no mixed scripts', mixed.length === 0,
    mixed.slice(0, 3).map(function (w) { return w.en; }).join(','));
  t('every word has an English pronunciation',
    V.every(function (w) { return w.enIpa && w.enTa; }));
  t('English sounds are written in Tamil letters',
    V.every(function (w) { return /[஀-௿]/.test(w.enTa); }));
  t('Tamil romanisation generates for all',
    V.every(function (w) { return !!w.taR && !/[஀-௿]/.test(w.taR); }));
  t('themes carry a word count',
    TB.THEMES.every(function (x) { return x.n === undefined || x.n > 0; }));
})();

/* ---------------- Hindi readings ---------------- */
section('HINDI READINGS (roman + Tamil)');
[['करोड़', 'karor', 'கரோர்'],
 ['किताब', 'kitāb', 'கிதாப்'],
 ['सड़क', 'sarak', 'ஸரக்'],
 ['खिड़की', 'khirkī', 'கிர்கீ'],
 ['डॉक्टर', 'ḍākṭar', 'டாக்டர்'],
 ['पाँच', 'pāñc', 'பாஞ்ச்'],
 ['आँख', 'āṅkh', 'ஆங்க்'],
 ['बेटा', 'beṭā', 'பேட்டா'],
 ['ठंडा', 'ṭhaṇḍā', 'டண்டா'],
 ['नमस्ते', 'namaste', 'நமஸ்தே']]
  .forEach(function (row) {
    t('roman ' + row[0], TB.Translit.romanHindi(row[0]) === row[1], TB.Translit.romanHindi(row[0]));
    t('tamil ' + row[0], TB.Translit.hindiToTamilScript(row[0]) === row[2], TB.Translit.hindiToTamilScript(row[0]));
  });
/* nothing anywhere in the app may leak raw Devanagari into a reading */
(function () {
  var all = [];
  TB.VOCAB.forEach(function (v) { all.push(v.hi); });
  TB.LESSONS.forEach(function (u) { u.lines.forEach(function (l) { all.push(l.hi); }); });
  (TB.PHRASES || []).forEach(function (p) { all.push(p.hi); });
  var bad = all.filter(function (h) {
    if (!h || !/[ऀ-ॿ]/.test(h)) return false;
    var r = TB.Translit.romanHindi(h), x = TB.Translit.hindiToTamilScript(h);
    return /[ऀ-ॿ]/.test(r) || /[ऀ-ॿ]/.test(x) || !r.trim() || !x.trim();
  });
  t('every Hindi string reads cleanly', bad.length === 0, bad.length + ' defective');
})();

/* ---------------- reading aloud ---------------- */
section('READING ALOUD');
(function () {
  var rhyme = ['Twinkle twinkle little star',
               'How I wonder what you are',
               'Up above the world so high',
               'Like a diamond in the sky'];
  var prose = ['I go to school every day.',
               'My classes start at 8:00 AM.',
               'I study math, English, and science.',
               'After school I do my homework.'];

  t('a rhyme is recognised as verse', TB.Reader.looksLikeVerse(rhyme));
  t('prose is not', !TB.Reader.looksLikeVerse(prose));
  t('rhyme scheme is AABB', TB.Reader.scheme(rhyme).join('') === 'AABB',
    TB.Reader.scheme(rhyme).join(''));
  t('verse picks the sing-song mode', TB.Reader.modesFor(rhyme).suggested === 'rhyme');
  t('prose picks the reading mode', TB.Reader.modesFor(prose).suggested === 'read');

  /* wrapped lines, as OCR actually returns a paragraph */
  var wrapped = ['I go to school every day.', 'My classes start at 8:00',
                 'AM. I study math,', 'English, and science.',
                 'During break, I eat a', 'snack and play with my',
                 'friends. After school, I go', 'home and do my',
                 'homework. I like school', 'because I learn many',
                 'new things and have fun!'];
  var flow = TB.Reader.reflow(wrapped);
  t('wrapped prose is sewn into sentences', flow.units.length === 6, flow.units.length);
  t('no sentence is left cut in half',
    flow.units.every(function (u) { return /[.!?]$/.test(u); }),
    flow.units.filter(function (u) { return !/[.!?]$/.test(u); }).join(' | '));
  t('the words all survive the sewing',
    flow.units.join(' ').replace(/\s+/g, ' ') === wrapped.join(' ').replace(/\s+/g, ' '));
  t('a fragment is never translated alone',
    flow.units.indexOf('snack and play with my') < 0);
  t('verse is left exactly as written',
    TB.Reader.reflow(rhyme).units.join('|') === rhyme.join('|'));
  t('verse is not reflowed', TB.Reader.reflow(rhyme).isVerse &&
    !TB.Reader.reflow(rhyme).reflowed);
  t('a blank line still separates paragraphs',
    TB.Reader.reflow(['One. Two.', '', 'Three.']).units.length === 4);

  var sung = TB.Reader.plan(rhyme, 'en', 'rhyme', { rate: 0.9, pitch: 1 });
  var spoken = TB.Reader.plan(rhyme, 'en', 'read', { rate: 0.9, pitch: 1 });
  t('every line is spoken once', sung.filter(function (s) { return !s.silent; }).length === 4);
  t('sing-song moves the pitch',
    new Set(sung.map(function (s) { return s.pitch; })).size > 1);
  t('plain reading does not', new Set(spoken.map(function (s) { return s.pitch; })).size === 1);
  t('pitch stays in range the browser accepts',
    sung.every(function (s) { return s.pitch >= 0.1 && s.pitch <= 2; }));
  t('the closing line settles lowest',
    sung[3].pitch === Math.min.apply(null, sung.map(function (s) { return s.pitch; })));
  t('the couplet gets a longer rest', sung[1].pause > sung[0].pause);
  t('slow mode is slower', TB.Reader.plan(prose, 'en', 'slow')[0].rate
    < TB.Reader.plan(prose, 'en', 'read')[0].rate);
  t('spelling gives one letter at a time',
    TB.Reader.plan(['cat'], 'en', 'spell').filter(function (s) { return !s.silent; })
      .map(function (s) { return s.text; }).join('') === 'cat');
  var verses = TB.Reader.plan(['One', 'Two', '', 'Three', 'Four'], 'en', 'rhyme');
  t('a blank line becomes a rest, not a word',
    verses.filter(function (s) { return s.silent; }).length >= 1 &&
    verses.filter(function (s) { return !s.silent; }).length === 4);
  t('every step names its language',
    sung.every(function (s) { return s.lang === 'en'; }));
  t('a Tamil rhyme plans in Tamil',
    TB.Reader.plan(['காகா', 'மாமா'], 'ta', 'rhyme')
      .every(function (s) { return s.lang === 'ta'; }));
})();

/* ---------------- photo text scoring ---------------- */
section('PHOTO TEXT');
(function () {
  /* The wrong language pack does not fail, it returns fluent nonsense. This
     is the measured output of reading English with the Tamil pack. */
  var junk = { text: '1 90 1ோ 861ோ0।1 6 ர. ரர 0ோ5888 60ார்‌ ௭1 8:00 சிரிரி,', confidence: 46 };
  var good = { text: 'I go to school every day. My classes start at 8:00 AM.', confidence: 95 };
  t('a good read scores above the trust line',
    TB.OCR.plausibility(good) >= TB.OCR.TRUST, TB.OCR.plausibility(good));
  t('nonsense scores below it',
    TB.OCR.plausibility(junk) < TB.OCR.TRUST, TB.OCR.plausibility(junk));
  t('and well below the good one',
    TB.OCR.plausibility(good) - TB.OCR.plausibility(junk) > 25);
  t('empty text scores zero', TB.OCR.plausibility({ text: '', confidence: 90 }) === 0);
  t('every pack maps to a translate language',
    Object.keys(TB.OCR.PACKS).every(function (p) {
      return TB.Translate.LANGS.some(function (l) { return l.c === TB.OCR.PACKS[p].code; });
    }));
  t('every pack has a voice',
    Object.keys(TB.OCR.PACKS).every(function (p) {
      return !!TB.Speech.langTags()[TB.OCR.PACKS[p].code];
    }));
})();

var SAMPLE = { hi: 'मैं स्कूल जाता हूँ',
               te: 'నేను పాఠశాల', kn: 'ನಾನು ಶಾಲೆ',
               ml: 'ഞാൻ സ്കൂളിൽ', bn: 'আমি স্কুলে',
               gu: 'હું શાળાએ', pa: 'ਮੈਂ ਸਕੂਲ' };

/* ---------------- readings for every Indian script ---------------- */
section('READINGS (all Indian scripts)');
(function () {
  /* "I go to school", written in each script, must be sayable by someone who
     reads only English letters or only Tamil ones. */
  [['hi', 'मैं स्कूल जाता हूँ', 'maiṁ skūl jātā hūṁ'],
   ['te', 'నేను', 'nenu'],
   ['kn', 'ನಾನು', 'nānu'],
   ['ml', 'ഞാൻ', 'ñān'],
   ['bn', 'আমি', 'āmi'],
   ['gu', 'હું', 'huṁ'],
   ['pa', 'ਮੈਂ', 'maiṁ']]
    .forEach(function (row) {
      var r = TB.Translit.readings(row[1], row[0]);
      t(row[0] + ' reads in English letters', r.roman === row[2], r.roman);
      t(row[0] + ' reads in Tamil letters',
        !!r.tamil && !/[ऀ-෿]/.test(r.tamil.replace(/[஀-௿]/g, '')), r.tamil);
    });

  /* the m at the start is the म; it is the LAST sound that was wrong */
  t('a word-final nasal is nasalisation, not a labial m',
    /ṁ$/.test(TB.Translit.romanHindi('मैं')),
    TB.Translit.romanHindi('मैं'));
  t('and so is a chandrabindu',
    /ṁ$/.test(TB.Translit.romanHindi('हूँ')),
    TB.Translit.romanHindi('हूँ'));
  t('a nasal before a stop still takes its place',
    TB.Translit.romanHindi('हिंदी') === 'hindī',
    TB.Translit.romanHindi('हिंदी'));
  t('southern short e survives',
    TB.Translit.readings('ಶಾಲೆ', 'kn').roman === 'śāle',
    TB.Translit.readings('ಶಾಲೆ', 'kn').roman);
  t('Malayalam chillu is a bare consonant',
    TB.Translit.readings('ഞാൻ', 'ml').roman === 'ñān');
  t('nothing leaks its own script into the reading',
    ['hi', 'te', 'kn', 'ml', 'bn', 'gu', 'pa'].every(function (l) {
      var r = TB.Translit.readings(SAMPLE[l], l);
      return !/[ऀ-୿ఀ-෿]/.test(r.roman + r.tamil);
    }));
  t('Tamil reads as itself', TB.Translit.readings('நான்', 'ta').roman === 'nāẉ'
    || TB.Translit.readings('நான்', 'ta').roman === 'nāṉ',
    TB.Translit.readings('நான்', 'ta').roman);
  /* English written in Tamil letters must come from the pronunciation, never
     from the spelling: school is ஸ்கூல், not ஸ்சூல் */
  t('English sounds are not spelled out letter by letter',
    TB.Translit.readings('I go to school every day.', 'en').tamil
      === 'ஐ கோ டூ ஸ்கூல் எவரி டே.',
    TB.Translit.readings('I go to school every day.', 'en').tamil);
  t('a rhyme is fully covered',
    !/[A-Za-z]/.test(TB.Translit.readings('Twinkle twinkle little star, how I wonder what you are', 'en').tamil),
    TB.Translit.readings('Twinkle twinkle little star, how I wonder what you are', 'en').tamil);
  t('a plural keeps its s',
    /ஸ்$/.test(TB.Translit.readings('jumps', 'en').tamil),
    TB.Translit.readings('jumps', 'en').tamil);
  t('mostly-unknown English gets no line, not a half one',
    TB.Translit.readings('Xyzzy plugh frobnicate', 'en').tamil === '');
  t('the sound table is all Tamil',
    Object.keys(TB.EN_SOUND_EXTRA).every(function (k) {
      return /^[a-z]+$/.test(k) && /[஀-௿]/.test(TB.EN_SOUND_EXTRA[k])
        && !/[A-Za-z]/.test(TB.EN_SOUND_EXTRA[k]);
    }));

  /* Every English word the app itself shows must be sayable in Tamil
     letters, or an elder reading along hits a word in a script they cannot
     read. Adding English content without a pronunciation fails here. */
  (function () {
    TB.Translit.readings('x', 'en');
    var idx = TB.Translit.EN_SOUND, miss = {};
    function scan(str) {
      String(str || '').split(/([^A-Za-z']+)/).forEach(function (w) {
        if (!/^[A-Za-z]+$/.test(w)) return;
        var k = w.toLowerCase();
        if (!idx[k] && !(k.slice(-1) === 's' && idx[k.slice(0, -1)])) miss[k] = 1;
      });
    }
    TB.LESSONS.forEach(function (u) { u.lines.forEach(function (l) { scan(l.en); }); });
    TB.PHRASES.forEach(function (p) { scan(p.en); });
    TB.VOCAB.forEach(function (v) { scan(v.en); });
    var list = Object.keys(miss);
    t('every English word in the app can be sounded out in Tamil',
      list.length === 0, list.slice(0, 8).join(' '));
  })();

  t('a script it cannot sound out says so, rather than guessing',
    TB.Translit.readings('你好', 'zh-CN').can === false);
})();

/* ---------------- voices ---------------- */
section('VOICES');
(function () {
  var tags = TB.Speech.langTags();
  var codes = TB.Translate.LANGS.filter(function (l) { return l.c !== 'auto'; });
  var missing = codes.filter(function (l) { return !tags[l.c]; });
  t('every translate language has voice tags', missing.length === 0,
    missing.map(function (l) { return l.c; }).join(','));
  t('study languages lead with the Indian accent',
    tags.ta[0] === 'ta-IN' && tags.hi[0] === 'hi-IN' && tags.en[0] === 'en-IN');
})();

/* ---------------- conjugation ---------------- */
section('CONJUGATION');
(function () {
  var kar = TB.Conjugate.hindi('करना', 'm');
  var jaa = TB.Conjugate.hindi('जाना', 'm');
  var past = kar.tenses.filter(function (x) { return x.id === 'past'; })[0];
  var jpast = jaa.tenses.filter(function (x) { return x.id === 'past'; })[0];
  t('transitive verb takes the ergative', past.rows[0].pron === 'मैंने');
  t('ergative freezes the verb',
    past.rows.every(function (r) { return r.form === past.rows[0].form; }));
  t('intransitive verb never takes it', jpast.rows[0].pron === 'मैं');
  t('intransitive still agrees', jpast.rows[0].form !== jpast.rows[4].form);
  var forms = 0, broken = 0;
  TB.Conjugate.COMMON_HI.forEach(function (v) {
    ['m', 'f'].forEach(function (g) {
      var c = TB.Conjugate.hindi(v, g);
      c.tenses.forEach(function (x) { x.rows.forEach(function (r) {
        forms++; if (!r.form || !r.pron) broken++;
      }); });
    });
  });
  t('all Hindi forms generate (' + forms + ')', broken === 0, broken + ' broken');
  var e = TB.Conjugate.english('go', 'she');
  t('English irregular past', e.forms.past === 'went' && e.forms.participle === 'gone');
  t('English consonant doubling', TB.Conjugate.enForms('sit').ing === 'sitting');
  t('English -y to -ies', TB.Conjugate.enForms('study').third === 'studies');
  t('English has 12 tenses', e.tenses.length === 12);
})();

/* ---------------- numbers ---------------- */
section('NUMBERS');
[[15, 'பதினைந்து'],
 [1000, 'ஆயிரம்'],
 [5000, 'ஐயாயிரம்'],
 [100000, 'ஒரு லட்சம்']]
  .forEach(function (row) { t('tamil ' + row[0], TB.Numbers.ta(row[0]) === row[1], TB.Numbers.ta(row[0])); });
t('lakh not hundred-thousand', TB.Numbers.describe(100000).enIndian === 'one lakh');
t('both systems shown', TB.Numbers.describe(100000).en === 'one hundred thousand');
t('indian digit grouping', TB.Numbers.indianGroups(1234567) === '12,34,567');

/* ---------------- phrasebook ---------------- */
section('PHRASEBOOK');
t('phrases present', TB.PHRASES.length >= 200, TB.PHRASES.length);
t('every phrase is trilingual', TB.PHRASES.every(function (p) { return p.en && p.hi && p.ta; }));
t('every phrase has a known group',
  TB.PHRASES.every(function (p) { return TB.PHRASE_GROUPS.some(function (g) { return g.id === p.g; }); }));

/* ---------------- transliteration ---------------- */
section('TRANSLITERATION');
[['vanakkam','வணக்கம்'],['poonai','பூனை'],['amma','அம்மா'],['thamizh','தமிழ்'],
 ['nandri','நன்றி'],['thanneer','தண்ணீர்'],['puthagam','புத்தகம்']]
  .forEach(([i, o]) => t('ta ' + i, TB.Translit.toTamil(i) === o, TB.Translit.toTamil(i)));
[['namaste','नमस्ते'],['dhanyavaad','धन्यवाद'],['kitaab','किताब'],['paani','पानी'],['ghar','घर']]
  .forEach(([i, o]) => t('hi ' + i, TB.Translit.toHindi(i) === o, TB.Translit.toHindi(i)));
t('roman வணக்கம்', TB.Translit.romanTamil('வணக்கம்') === 'vaṇakkam');
t('roman किताब', TB.Translit.romanHindi('किताब') === 'kitāb');

/* ---------------- sentence analysis ---------------- */
section('ANALYSIS');
[['She is reading a book.','present continuous'],
 ['Where are you going?','present continuous'],
 ['I have not finished my work.','present perfect'],
 ['Did you see the movie?','past simple'],
 ['I will go to the market tomorrow.','future simple'],
 ['He had been waiting for an hour.','past perfect continuous'],
 ['They have been working since morning.','present perfect continuous'],
 ['The book was written by her.','past passive'],
 ['She goes to school.','present simple'],
 ['वह किताब पढ़ रही है।','continuous'],
 ['मैं कल बाज़ार गया।','past perfective'],
 ['मैं रोज़ स्कूल जाता हूँ।','present habitual'],
 ['वह अंग्रेज़ी सीखेगी।','future'],
 ['நான் பள்ளிக்குச் செல்கிறேன்.','present'],
 ['அவள் புத்தகம் படித்தாள்.','past'],
 ['நான் நாளை வருவேன்.','future']]
  .forEach(([s, exp]) => {
    const a = TB.Tutor.analyze(s);
    t('tense: ' + s.slice(0, 34), a.tense.en === exp, a.tense.en);
  });
t('imperative detected', TB.Tutor.analyze('Open the door.').type.en === 'imperative');
t('wh-question detected', TB.Tutor.analyze('Where are you going?').type.en === 'wh-question');
t('negative detected', TB.Tutor.analyze('I have not finished.').type.en.includes('negative'));
const svo = TB.Tutor.analyze('I have not finished my work.').svo;
t('SVO split', svo.subjectText === 'I' && svo.verbText === 'have not finished' && svo.objectText === 'my work');

/* ---------------- grammar + spelling ---------------- */
section('CHECKER');
[['he go to school every day','He goes to school every day.'],
 ['she will goes tomorrow','She will go tomorrow.'],
 ['i am a enginer','I am an engineer.'],
 ['I have two book.','I have two books.'],
 ['i want to lern english','I want to learn English.'],
 ["he dont know the the answer","He don't know the answer."],
 ['my name is kumar','My name is kumar.'],
 ['my friend priya is a teacher','My friend priya is a teacher.'],
 ['i recieve a letter','I receive a letter.'],
 ['ramesh and lakshmi went to chennai','Ramesh and lakshmi went to Chennai.'],
 ['They is my friend.','They are my friend.'],
 ['She is reading a book.','She is reading a book.'],
 ['my mother cook food every day','My mother cooks food every day.'],
 ['the boy played in the garden','The boy played in the garden.']]
  .forEach(([i, o]) => {
    const r = TB.Check.check(i);
    t('fix: ' + i.slice(0, 34), r.corrected === o, r.corrected);
  });
t('names are never rewritten', TB.Check.suggest('kumar').length === 0 && TB.Check.suggest('priya').length === 0);
t('real typos are caught', TB.Check.suggest('lern')[0] === 'learn');

/* ---------------- dictionary (offline) ---------------- */
section('DICTIONARY (offline)');
(async () => {
  for (const [q, exp] of [['cat','பூனை'],['poonai','பூனை'],['naai','நாய்'],['yaanai','யானை'],
                          ['vanakkam','வணக்கம்'],['book','புத்தகம்'],['seven','ஏழு'],
                          ['பூனை','cat'],['நாய்','dog'],['नमस्ते','hello'],['बिल्ली','cat']]) {
    const c = await TB.Dict.lookup(q);
    t('lookup ' + q, c.translations.ta === exp || c.translations.en === exp,
      JSON.stringify(c.translations));
  }

  /* ---------------- spaced repetition ---------------- */
  section('SRS');
  let card = TB.SRS.rate(null, 2);
  t('first good review schedules 1 day', card.interval === 1);
  card = TB.SRS.rate(card, 2);
  t('second review grows', card.interval >= 3);
  card = TB.SRS.rate(card, 0);
  t('forgetting resets and is due now', card.interval === 0 && TB.SRS.isDue(card));
  t('queue respects the limit', TB.SRS.queue({}, TB.VOCAB, 20).length === 20);

  /* ---------------- accounts ---------------- */
  section('ACCOUNTS');
  try {
    const u = await TB.Auth.signUp('Kumara', 'kumara@test.com', 'tamil2024');
    t('signup succeeds', !!u.id && !!u.hash);
    t('password is not stored', JSON.stringify(u).indexOf('tamil2024') < 0);
    t('hash is PBKDF2', u.kdf === 'pbkdf2' && u.hash.length === 64);
    let threw = false;
    try { await TB.Auth.signUp('X', 'kumara@test.com', 'tamil2024'); } catch (e) { threw = true; }
    t('duplicate signup rejected', threw);
    threw = false;
    try { await TB.Auth.signIn('kumara@test.com', 'wrongpass1'); } catch (e) { threw = true; }
    t('wrong password rejected', threw);
    const back = await TB.Auth.signIn('kumara@test.com', 'tamil2024');
    t('signin succeeds', back.id === u.id);
    const p = await TB.Auth.signUp('Phone', '9876543210', 'tamil2024');
    t('phone signup works', p.phone === '9876543210');
    t('weak password rejected', !!TB.Auth.passwordIssue('abc'));

    /* history + export */
    TB.Store.addHistory(u.id, { type: 'translate', from: 'en', to: 'ta', src: 'cat', out: 'பூனை' });
    const d = TB.Store.data(u.id);
    t('history recorded', d.history.length === 1 && d.history[0].src === 'cat');
    t('export round-trips', JSON.parse(TB.Store.exportAll(u.id)).data.history.length === 1);
  } catch (e) {
    fail++; console.log('  FAIL  accounts threw: ' + e.message);
  }

  console.log('\n' + '='.repeat(46));
  console.log('  PASS ' + pass + '   FAIL ' + fail);
  console.log('='.repeat(46));
  process.exit(fail ? 1 : 0);
})();
