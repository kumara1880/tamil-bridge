/* Tamil Bridge — depth.

   A screen is flat. Everything that makes it look otherwise has to be
   drawn: light coming from somewhere, a surface that catches it, a shadow
   where it does not reach. Most of that is in the stylesheet. Three things
   need to know where the pointer is or where the page has scrolled to, and
   those three are here.

     1. Tilt      — a tile turns very slightly towards the pointer, and the
                    icon on it lifts off the surface. This is what makes a
                    card read as an object rather than a rectangle.
     2. Sheen     — a soft highlight follows the pointer across the tile, so
                    the surface looks like it is catching a light.
     3. Reveal    — a card fades and rises the first time it is scrolled to,
                    once, so a long page arrives instead of appearing.

   Rules this file keeps to:

     * Nothing here is required. If it does not run — no JavaScript, an old
       browser, no IntersectionObserver — every card is still fully visible
       and fully usable. The effects are added by putting a class on <html>,
       so the styles that hide anything cannot apply until the code that
       shows it again is known to be running.
     * A person who has asked for less movement gets none of it.
     * A touch screen gets no tilt. There is no pointer to tilt towards, and
       a finger resting on a tile should not leave it leaning.
     * One listener for the whole page, not one per card. These pages draw
       a hundred tiles and redraw them on every filter change.               */
(function () {
  var root = document.documentElement;

  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine  = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* The styles are opt-in: no class, no effect, nothing hidden. */
  if (!still) root.classList.add('depth');
  if (!still && fine) root.classList.add('depth-tilt');

  /* --------------------------------------------------------------- tilt */
  /* How far a tile leans, in degrees, at the very edge. Small on purpose:
     past about six degrees it stops looking like a surface catching light
     and starts looking like a page that is broken. */
  var LEAN = 5;

  var held = null;      /* the tile currently under the pointer */
  var frame = 0;        /* pending animation frame, so we write once a frame */
  var last = null;

  function release(el) {
    if (!el) return;
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  }

  function apply() {
    frame = 0;
    if (!held || !last) return;
    var r = held.getBoundingClientRect();
    if (!r.width || !r.height) return;
    /* -0.5 .. 0.5 from the middle of the tile */
    var px = (last.x - r.left) / r.width - 0.5;
    var py = (last.y - r.top) / r.height - 0.5;
    /* Pointer above the middle tips the top away from you, which is what a
       real object under a light from above does. Hence the sign on rotateX. */
    held.style.setProperty('--rx', (-py * LEAN).toFixed(2));
    held.style.setProperty('--ry', (px * LEAN).toFixed(2));
    held.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
    held.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
  }

  if (!still && fine) {
    /* Capturing, and on the document, so it keeps working through every
       redraw of every view without being attached again. */
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var tile = e.target.closest && e.target.closest('.dept-item, .tilt');
      if (tile !== held) { release(held); held = tile; }
      if (!held) return;
      last = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    }, { passive: true });

    /* A tile can go away under the pointer — a filter redraws the list —
       and then nothing would ever level it again. Letting go of the
       reference is enough; the element itself is already gone. */
    document.addEventListener('pointerleave', function () {
      release(held); held = null;
    }, true);
    window.addEventListener('scroll', function () {
      if (held) { release(held); held = null; }
    }, { passive: true });
  }

  /* ------------------------------------------------------------- reveal */
  /* Marked from here rather than in the stylesheet, so a card is never
     left invisible by a browser that cannot bring it back. */
  var watcher = null;
  var waiting = [];

  /* Every card is let go of here as well as shown. A card that was never
     scrolled to stayed watched after its page was left, and the watcher
     kept the whole detached page alive with it — one more page held in
     memory for every page visited. */
  function showAll() {
    waiting.forEach(function (el) {
      el.classList.add('in');
      if (watcher) watcher.unobserve(el);
    });
    waiting.length = 0;
  }

  if (!still && window.IntersectionObserver) {
    watcher = new IntersectionObserver(function (rows) {
      rows.forEach(function (row) {
        if (!row.isIntersecting) return;
        row.target.classList.add('in');
        watcher.unobserve(row.target);
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });
  }

  /* Whatever happens, nothing stays hidden for longer than this. A wrong
     scroll container, a display:none parent, a tab opened in the
     background — all of them end the same way: everything visible. */
  var failsafe = 0;

  function reveal(scope) {
    if (!watcher) return;
    /* a new page: whatever the last one left waiting is finished with */
    showAll();
    var cards = (scope || document).querySelectorAll('.view > .card, .view > .dept, .view > .hero, .view > .grid');
    if (!cards.length) return;
    for (var i = 0; i < cards.length; i++) {
      var el = cards[i];
      if (el.classList.contains('rv')) continue;
      el.classList.add('rv');
      /* Stagger, so the page arrives as a sequence rather than a flash.
         Capped, because the twentieth card should not wait half a second. */
      el.style.setProperty('--rv-delay', Math.min(i, 8) * 45 + 'ms');
      waiting.push(el);
      watcher.observe(el);
    }
    clearTimeout(failsafe);
    failsafe = setTimeout(showAll, 1400);
  }

  /* app.js calls this after it has drawn a view. */
  window.TB = window.TB || {};
  TB.Depth = { reveal: reveal, showAll: showAll };
}());
