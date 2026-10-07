/* Tamil Bridge — Hindi captions, everywhere.

   Every piece of Hindi on every page should say how to read it: in English
   letters for somebody who reads English, and in Tamil letters for somebody
   who reads Tamil. Most views add that themselves; some did not — the
   alphabet's example words, the tense charts, a lesson's word boxes, the
   worked sums, the explanations on Modern. A page-by-page fix misses the
   next page written, so this pass runs after any page is drawn and whenever
   new content arrives on it (a tutor's reply, a chart opened), and adds the
   reading wherever Hindi has none.

     - a sentence gets the usual line underneath: roman · Tamil letters;
     - a word in a tight place (a tile, a box, a chip of a sentence) gets
       the Tamil letters beside it, and the roman on hover;
     - a long paragraph gets its reading folded away behind one tap, so the
       card does not double in height.

   Controls are left alone — a button, a pill, a label, a menu. So are the
   words that only name the language. A reading that cannot be made is left
   off: a missing line is honest, a wrong one teaches the wrong sound. */
window.TB = window.TB || {};

TB.Captions = (function () {
  var DEV = /[ऀ-ॿ]{2,}/;
  var SKIP = '.hi-read, .hi-tam-inline, .cap-auto, select, option, input, textarea, button, label, '
           + '.pill, .chip, .tk-chips, nav, header, svg, code, [data-nocap], [contenteditable="true"], #auth, #toast';
  /* the language's own name, as a label */
  var NAME_ONLY = /^(हिंदी|हिन्दी)(\s+आवाज़)?[\s.:·]*$/;
  var LONG = 140;
  var MAX_PER_PASS = 800;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function ownText(el) {
    var t = '';
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3) t += n.textContent;
    return t;
  }

  /* Already read for: a reading inside it, or straight after it (with
     perhaps a speaker button between). */
  function captioned(el) {
    if (el.querySelector('.hi-read, .hi-tam-inline, .cap-auto')) return true;
    var s = el.nextElementSibling;
    for (var i = 0; s && i < 2; i++, s = s.nextElementSibling) {
      if (s.matches('.hi-read, .hi-tam-inline, .cap-auto')) return true;
      if (!s.matches('.speak-btn, button')) break;
    }
    return false;
  }

  function readings(text) {
    try {
      var r = TB.Translit && TB.Translit.readings(text, 'hi');
      return r && r.can && (r.roman || r.tamil) ? r : null;
    } catch (e) { return null; }
  }

  function isRowParent(el) {
    var p = el.parentElement;
    if (!p) return false;
    var d = '';
    try { d = getComputedStyle(p).display; } catch (e) {}
    return /flex|grid/.test(d);
  }

  function isInline(el) {
    var d = '';
    try { d = getComputedStyle(el).display; } catch (e) {}
    return /^inline/.test(d);
  }

  function caption(el) {
    var text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!DEV.test(text) || NAME_ONLY.test(text)) return false;
    var r = readings(text);
    if (!r) return false;
    el.setAttribute('data-capd', '1');

    var short = text.length <= 18 || isInline(el);
    var html;
    if (short) {
      if (!r.tamil) return false;
      html = '<span class="hi-tam-inline cap-auto cap-inline"' + (r.roman ? ' title="' + esc(r.roman) + '"' : '') + '>'
        + esc(r.tamil) + '</span>';
    } else {
      var bits = (r.roman ? '<span class="hi-rom">' + esc(r.roman) + '</span>' : '')
        + (r.tamil ? '<span class="hi-tam">' + (r.roman ? ' · ' : '') + esc(r.tamil) + '</span>' : '');
      html = text.length > LONG
        ? '<details class="cap-auto cap-more"><summary>Read it in English / தமிழ் letters</summary>'
          + '<div class="hi-read">' + bits + '</div></details>'
        : '<div class="hi-read cap-auto">' + bits + '</div>';
    }
    /* Inside the element when its parent lays things out in a row or a grid
       — a new sibling there would become a tile of its own. Otherwise just
       after it, where a reading line belongs. */
    if (isRowParent(el)) el.insertAdjacentHTML('beforeend', html);
    else el.insertAdjacentHTML('afterend', html);
    return true;
  }

  function apply(scope) {
    scope = scope || document.getElementById('viewRoot');
    if (!scope || !TB.Translit) return 0;
    var done = 0;
    var all = scope.querySelectorAll('*');
    var seen = [];
    for (var i = 0; i < all.length && done < MAX_PER_PASS; i++) {
      var el = all[i];
      if (!DEV.test(ownText(el))) continue;
      /* a tappable line is one word per span: read the line, not each word */
      if (el.classList.contains('word-tap') && el.parentElement) el = el.parentElement;
      if (seen.indexOf(el) >= 0 || el.hasAttribute('data-capd')) continue;
      seen.push(el);
      if (el.closest(SKIP)) continue;
      if (captioned(el)) { el.setAttribute('data-capd', '1'); continue; }
      if (caption(el)) done++;
    }
    return done;
  }

  /* New content on a page — a reply, a chart, a result — is read for too.
     Batched, so a burst of changes is one pass; and our own captions are
     marked, so adding them does not set off another. */
  var pending = 0, watching = null;
  function watch(root) {
    if (!window.MutationObserver || !root || watching === root) return;
    watching = root;
    new MutationObserver(function (list) {
      var ours = list.every(function (m) {
        return [].every.call(m.addedNodes, function (n) {
          return n.nodeType !== 1 || (n.classList && n.classList.contains('cap-auto'));
        });
      });
      if (ours || pending) return;
      pending = setTimeout(function () { pending = 0; apply(root); }, 160);
    }).observe(root, { childList: true, subtree: true });
  }

  return { apply: apply, watch: watch };
})();
