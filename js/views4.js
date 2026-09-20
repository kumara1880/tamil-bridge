/* Tamil Bridge — Numbers.
   Type 1000 and read it out in English, Hindi and Tamil — plus any other
   language on request. India counts in lakh and crore, so both that and the
   international system are shown whenever they disagree.                     */
(function () {
  var V = TB.Views;
  var esc = V.esc, speak = V.speakBtn;

  V.numbers = {
    title: 'Numbers', sub: 'Any number, written out and read aloud',
    html: function () {
      var langs = TB.Translate.LANGS.filter(function (l) { return l.c !== 'auto'; })
        .map(function (l) {
          return '<option value="' + l.c + '"' + (l.c === 'hi' ? ' selected' : '') + '>' + esc(l.n) + '</option>';
        }).join('');

      return '<div class="view">'
        + '<div class="card">'
        +   '<div class="row">'
        +     '<input id="numIn" type="text" inputmode="numeric" placeholder="1000"'
        +       ' style="flex:1;min-width:170px;padding:14px 16px;border-radius:10px;border:1px solid var(--line);'
        +       'background:var(--bg-soft);font-size:28px;font-weight:650;letter-spacing:1px">'
        +     '<button class="btn btn-primary" id="numGo" type="button">Convert</button>'
        +   '</div>'
        +   '<div class="pill-row mt">'
        +     [10, 21, 100, 500, 1000, 5000, 100000, 10000000].map(function (n) {
                return '<button class="pill" data-num="' + n + '" type="button">' + TB.Numbers.indianGroups(n) + '</button>';
              }).join('')
        +   '</div>'
        + '</div>'
        + '<div id="numOut"></div>'
        + '<div class="card"><h3>Money</h3><div class="card-sub">Rupees and paise, written out</div>'
        +   '<div class="row">'
        +     '<input id="rs" type="text" inputmode="numeric" placeholder="1250" style="width:130px;padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +     '<span class="muted">rupees</span>'
        +     '<input id="ps" type="text" inputmode="numeric" placeholder="50" style="width:90px;padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">'
        +     '<span class="muted">paise</span>'
        +     '<button class="btn btn-sm" id="moneyGo" type="button">Write it out</button>'
        +   '</div><div id="moneyOut" class="mt"></div>'
        + '</div>'
        + '<div class="card"><h3>Another language</h3>'
        +   '<div class="card-sub">Translate the written-out number into any language</div>'
        +   '<div class="row"><select id="numLang" style="padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg-soft)">' + langs + '</select>'
        +   '<button class="btn btn-sm" id="numTr" type="button">Translate</button></div>'
        +   '<div id="numTrOut" class="mt"></div>'
        + '</div>'
        + '</div>';
    },

    mount: function (root) {
      var input = root.querySelector('#numIn');
      var out = root.querySelector('#numOut');
      var lastWords = '';

      function row(label, value, lang, note) {
        if (!value) return '';
        return '<div style="padding:11px 0;border-top:1px solid var(--line-soft)">'
          + '<div class="tiny muted">' + label + (note ? ' · ' + note : '') + '</div>'
          + '<div class="' + (lang || '') + '" style="font-size:20px;font-weight:600;line-height:1.5">'
          + esc(value) + speak(value, lang || 'en') + '</div>'
          + (lang === 'hi' ? V.hiRead(value) : '') + '</div>';
      }

      function go() {
        var d = TB.Numbers.describe(input.value);
        if (!d) { out.innerHTML = '<div class="card"><div class="msg msg-warn">Type a number, for example 1000.</div></div>'; return; }
        if (d.tooBig) {
          out.innerHTML = '<div class="card"><div class="msg msg-warn">That is larger than '
            + TB.Numbers.indianGroups(d.max) + ', which is as far as the words stay useful.</div></div>';
          return;
        }

        lastWords = d.enIndian;
        var h = '<div class="card">';
        h += '<div class="row"><div style="font-size:34px;font-weight:700;letter-spacing:1px">'
           + esc(d.digitsIndian) + '</div>'
           + '<div class="spacer" style="flex:1"></div>'
           + '<span class="chip">' + esc(d.digits) + ' international</span>'
           + (d.ordinal ? '<span class="chip blue">' + esc(d.ordinal) + '</span>' : '')
           + '</div>';

        h += row('English', d.enIndian, 'en', d.systemsDiffer ? 'Indian system' : '');
        if (d.systemsDiffer && d.en !== d.enIndian) {
          h += row('English', d.en, 'en', 'international system');
        }
        h += row('Hindi', d.hi, 'hi');
        h += row('Tamil', d.ta, 'ta');

        if (d.systemsDiffer) {
          h += '<div class="explain tip">India groups digits differently: <b>' + esc(d.digitsIndian)
             + '</b> (lakh / crore) where most other countries write <b>' + esc(d.digits)
             + '</b> (thousand / million). Both are correct — use whichever your reader expects.</div>';
        }
        h += '</div>';
        out.innerHTML = h;

        TB.Store.addHistory(TB.Auth.userId(), {
          type: 'number', from: 'num', to: 'words',
          src: d.digitsIndian, out: d.enIndian + ' · ' + d.hi + ' · ' + d.ta
        });
        TB.App.refreshChips();
      }

      root.querySelector('#numGo').addEventListener('click', go);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      input.addEventListener('input', function () {
        clearTimeout(input._t);
        input._t = setTimeout(go, 450);
      });
      root.querySelectorAll('[data-num]').forEach(function (b) {
        b.addEventListener('click', function () { input.value = b.getAttribute('data-num'); go(); });
      });

      root.querySelector('#moneyGo').addEventListener('click', function () {
        var m = TB.Numbers.money(root.querySelector('#rs').value, root.querySelector('#ps').value);
        root.querySelector('#moneyOut').innerHTML =
            row('English', m.en, 'en') + row('Hindi', m.hi, 'hi') + row('Tamil', m.ta, 'ta');
      });

      root.querySelector('#numTr').addEventListener('click', function () {
        var target = root.querySelector('#numLang').value;
        var box = root.querySelector('#numTrOut');
        if (!lastWords) { box.innerHTML = '<span class="muted small">Convert a number first.</span>'; return; }
        box.innerHTML = '<span class="spin"></span>';
        TB.Translate.translate(lastWords, 'en', target).then(function (r) {
          box.innerHTML = '<div class="tiny muted">' + esc(TB.Translate.langName(target)) + '</div>'
            + '<div style="font-size:20px;font-weight:600">' + esc(r.text) + speak(r.text, target) + '</div>';
        }).catch(function (e) {
          box.innerHTML = '<span style="color:var(--red)">' + esc(e.message) + '</span>';
        });
      });

      input.value = '1000';
      go();
      input.focus();
      input.select();
    }
  };
})();
