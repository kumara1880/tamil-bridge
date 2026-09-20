/* Tamil Bridge — numbers in words.
   Type 1000 and get it written out in English, Hindi and Tamil.

   India counts in lakh and crore, not million and billion, so both systems are
   produced: 100000 is "one hundred thousand" internationally but "one lakh"
   here, and a learner needs to recognise both. Hindi and Tamil use the Indian
   system only.                                                               */
window.TB = window.TB || {};

TB.Numbers = (function () {

  /* ------------------------------------------------------------- English */
  var EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen'];
  var EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function enBelow1000(n) {
    if (n === 0) return '';
    if (n < 20) return EN_ONES[n];
    if (n < 100) {
      return EN_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + EN_ONES[n % 10] : '');
    }
    var h = EN_ONES[Math.floor(n / 100)] + ' hundred';
    var rest = n % 100;
    return rest ? h + ' and ' + enBelow1000(rest) : h;
  }

  /* international: thousand, million, billion */
  function enInternational(n) {
    if (n === 0) return 'zero';
    var parts = [];
    var scales = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
    scales.forEach(function (s) {
      var unit = Math.floor(n / s[0]);
      if (unit) { parts.push(enBelow1000(unit) + ' ' + s[1]); n %= s[0]; }
    });
    if (n) parts.push(enBelow1000(n));
    return parts.join(' ').trim();
  }

  /* Indian: thousand, lakh, crore */
  function enIndian(n) {
    if (n === 0) return 'zero';
    var parts = [];
    var scales = [[1e7, 'crore'], [1e5, 'lakh'], [1e3, 'thousand']];
    scales.forEach(function (s) {
      var unit = Math.floor(n / s[0]);
      if (unit) {
        /* crore itself can exceed 99, so recurse for that group */
        parts.push((s[0] === 1e7 && unit > 999 ? enIndian(unit) : enBelow1000(unit)) + ' ' + s[1]);
        n %= s[0];
      }
    });
    if (n) parts.push(enBelow1000(n));
    return parts.join(' ').trim();
  }

  /* --------------------------------------------------------------- Hindi */
  /* Hindi has a distinct word for every number to 100 — there is no regular
     pattern, so the list is explicit. */
  var HI = ('शून्य,एक,दो,तीन,चार,पाँच,छह,सात,आठ,नौ,दस,ग्यारह,बारह,तेरह,चौदह,पंद्रह,सोलह,सत्रह,अठारह,'
    + 'उन्नीस,बीस,इक्कीस,बाईस,तेईस,चौबीस,पच्चीस,छब्बीस,सत्ताईस,अट्ठाईस,उनतीस,तीस,इकतीस,बत्तीस,तैंतीस,'
    + 'चौंतीस,पैंतीस,छत्तीस,सैंतीस,अड़तीस,उनतालीस,चालीस,इकतालीस,बयालीस,तैंतालीस,चवालीस,पैंतालीस,छियालीस,'
    + 'सैंतालीस,अड़तालीस,उनचास,पचास,इक्यावन,बावन,तिरेपन,चौवन,पचपन,छप्पन,सत्तावन,अट्ठावन,उनसठ,साठ,इकसठ,'
    + 'बासठ,तिरेसठ,चौंसठ,पैंसठ,छियासठ,सड़सठ,अड़सठ,उनहत्तर,सत्तर,इकहत्तर,बहत्तर,तिहत्तर,चौहत्तर,पचहत्तर,'
    + 'छिहत्तर,सतहत्तर,अठहत्तर,उन्यासी,अस्सी,इक्यासी,बयासी,तिरासी,चौरासी,पचासी,छियासी,सत्तासी,अट्ठासी,'
    + 'नवासी,नब्बे,इक्यानवे,बानवे,तिरानवे,चौरानवे,पंचानवे,छियानवे,सत्तानवे,अट्ठानवे,निन्यानवे,सौ').split(',');

  function hiBelow1000(n) {
    if (n === 0) return '';
    if (n <= 100) return HI[n];
    var h = HI[Math.floor(n / 100)] + ' सौ';
    var rest = n % 100;
    return rest ? h + ' ' + HI[rest] : h;
  }

  function hiWords(n) {
    if (n === 0) return 'शून्य';
    var parts = [];
    var scales = [[1e7, 'करोड़'], [1e5, 'लाख'], [1e3, 'हज़ार']];
    scales.forEach(function (s) {
      var unit = Math.floor(n / s[0]);
      if (unit) {
        parts.push((s[0] === 1e7 && unit > 999 ? hiWords(unit) : hiBelow1000(unit)) + ' ' + s[1]);
        n %= s[0];
      }
    });
    if (n) parts.push(hiBelow1000(n));
    return parts.join(' ').trim();
  }

  /* --------------------------------------------------------------- Tamil */
  /* Tamil numerals join rather than concatenate: 10 + 5 is பதினைந்து, not
     "பத்து ஐந்து", and 5 × 1000 is ஐயாயிரம், not "ஐந்து ஆயிரம்". The joined
     forms are irregular, so 1–19 and the thousand multiples are listed
     explicitly instead of being built from parts. */
  var TA_1_19 = ['', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
    'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு', 'பதினைந்து',
    'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'];
  var TA_TENS = ['', 'பத்து', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'];
  /* form used when a unit digit follows */
  var TA_TENS_C = ['', '', 'இருபத்தி', 'முப்பத்தி', 'நாற்பத்தி', 'ஐம்பத்தி', 'அறுபத்தி', 'எழுபத்தி', 'எண்பத்தி', 'தொண்ணூற்றி'];
  var TA_HUND = ['', 'நூறு', 'இருநூறு', 'முந்நூறு', 'நானூறு', 'ஐநூறு', 'அறுநூறு', 'எழுநூறு', 'எண்ணூறு', 'தொள்ளாயிரம்'];
  var TA_HUND_C = ['', 'நூற்றி', 'இருநூற்றி', 'முந்நூற்றி', 'நானூற்றி', 'ஐநூற்றி', 'அறுநூற்றி', 'எழுநூற்றி', 'எண்ணூற்றி', 'தொள்ளாயிரத்து'];
  /* n × 1000 for n = 1..10, which all have their own joined word */
  var TA_THOUSANDS = ['', 'ஆயிரம்', 'இரண்டாயிரம்', 'மூவாயிரம்', 'நான்காயிரம்', 'ஐயாயிரம்',
    'ஆறாயிரம்', 'ஏழாயிரம்', 'எண்ணாயிரம்', 'ஒன்பதாயிரம்', 'பத்தாயிரம்'];

  function taBelow1000(n) {
    if (n === 0) return '';
    var out = [];
    var h = Math.floor(n / 100), rest = n % 100;
    if (h) out.push(rest ? TA_HUND_C[h] : TA_HUND[h]);
    if (rest) {
      if (rest < 20) out.push(TA_1_19[rest]);
      else {
        var t = Math.floor(rest / 10), o = rest % 10;
        out.push(o ? TA_TENS_C[t] : TA_TENS[t]);
        if (o) out.push(TA_1_19[o]);
      }
    }
    return out.join(' ').trim();
  }

  function taWords(n) {
    if (n === 0) return 'பூஜ்ஜியம்';
    var parts = [];

    var crore = Math.floor(n / 1e7);
    if (crore) {
      parts.push((crore === 1 ? 'ஒரு' : (crore > 999 ? taWords(crore) : taBelow1000(crore))) + ' கோடி');
      n %= 1e7;
    }
    var lakh = Math.floor(n / 1e5);
    if (lakh) {
      parts.push((lakh === 1 ? 'ஒரு' : taBelow1000(lakh)) + ' லட்சம்');
      n %= 1e5;
    }
    var thou = Math.floor(n / 1e3);
    if (thou) {
      /* 1–10 thousand have their own joined words; above that Tamil writes the
         multiplier separately, which is what people actually read and say */
      parts.push(thou <= 10 ? TA_THOUSANDS[thou] : taBelow1000(thou) + ' ஆயிரம்');
      n %= 1e3;
    }
    if (n) parts.push(taBelow1000(n));
    return parts.join(' ').trim();
  }

  /* --------------------------------------------------- Indian digit groups */
  /* 1234567 -> "12,34,567" */
  function indianGroups(n) {
    var s = String(n);
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }

  function ordinalEn(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  }

  var MAX = 999999999999;   /* 99,99,99,99,999 — beyond this the words stop being useful */

  var api = {
    MAX: MAX,
    enInternational: enInternational,
    enIndian: enIndian,
    hi: hiWords,
    ta: taWords,
    indianGroups: indianGroups,
    ordinalEn: ordinalEn,

    /* Everything about one number, in one object. */
    describe: function (input) {
      var n = typeof input === 'number' ? input : parseInt(String(input).replace(/[^\d-]/g, ''), 10);
      if (isNaN(n)) return null;
      var neg = n < 0;
      n = Math.abs(n);
      if (n > MAX) return { tooBig: true, max: MAX };

      var minus = { en: 'minus ', hi: 'ऋण ', ta: 'கழித்தல் ' };
      return {
        value: n,
        negative: neg,
        digits: n.toLocaleString('en-US'),
        digitsIndian: indianGroups(n),
        digitsHindi: n.toLocaleString('hi-IN'),
        en: (neg ? minus.en : '') + enInternational(n),
        enIndian: (neg ? minus.en : '') + enIndian(n),
        hi: (neg ? minus.hi : '') + hiWords(n),
        ta: (neg ? minus.ta : '') + taWords(n),
        ordinal: !neg && n > 0 && n < 1e6 ? ordinalEn(n) : '',
        /* the two systems disagree from one lakh upward — worth pointing out */
        systemsDiffer: n >= 100000
      };
    },

    /* Rupees and paise, since that is what these numbers are usually for. */
    money: function (rupees, paise) {
      rupees = Math.abs(parseInt(rupees, 10) || 0);
      paise = Math.abs(parseInt(paise, 10) || 0);
      function join(word, unitR, unitP) {
        var s = word(rupees) + ' ' + unitR;
        if (paise) s += ' ' + word(paise) + ' ' + unitP;
        return s;
      }
      return {
        en: join(enIndian, 'rupees', 'paise'),
        hi: join(hiWords, 'रुपये', 'पैसे'),
        ta: join(taWords, 'ரூபாய்', 'பைசா')
      };
    }
  };

  return api;
})();
