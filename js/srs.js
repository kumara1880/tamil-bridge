/* Tamil Bridge — spaced repetition (SM-2, simplified).
   Each vocabulary item gets an ease factor and an interval. Rating a card
   schedules the next review; cards due today form the practice queue.        */
window.TB = window.TB || {};

TB.SRS = (function () {
  var DAY = 86400000;

  function today() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  function blank() {
    return { ease: 2.5, interval: 0, due: today(), reps: 0, lapses: 0, seen: 0 };
  }

  var api = {
    /* quality: 0 = forgot, 1 = hard, 2 = good, 3 = easy */
    rate: function (card, quality) {
      card = card || blank();
      card.reps = (card.reps || 0) + 1;
      card.seen = Date.now();

      if (quality === 0) {
        card.lapses = (card.lapses || 0) + 1;
        card.interval = 0;
        card.ease = Math.max(1.3, (card.ease || 2.5) - 0.2);
        card.due = today();                       /* show again this session */
        return card;
      }

      var q = quality === 1 ? 3 : (quality === 2 ? 4 : 5);
      card.ease = Math.max(1.3, (card.ease || 2.5) + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

      if (card.interval === 0) card.interval = quality === 1 ? 1 : (quality === 2 ? 1 : 3);
      else if (card.interval === 1) card.interval = quality === 1 ? 2 : (quality === 2 ? 3 : 6);
      else card.interval = Math.round(card.interval * card.ease * (quality === 1 ? 0.6 : 1));

      card.interval = Math.min(card.interval, 365);
      card.due = today() + card.interval * DAY;
      return card;
    },

    isDue: function (card) {
      if (!card) return true;
      return (card.due || 0) <= today();
    },

    /* Build today's queue: due cards first, then unseen ones, capped. */
    queue: function (srs, pool, limit) {
      limit = limit || 20;
      var due = [], fresh = [];
      pool.forEach(function (w) {
        var c = srs[w.id];
        if (!c) fresh.push(w);
        else if (api.isDue(c)) due.push(w);
      });
      due.sort(function (a, b) { return (srs[a.id].due || 0) - (srs[b.id].due || 0); });
      return due.concat(fresh).slice(0, limit);
    },

    counts: function (srs, pool) {
      var due = 0, learned = 0, fresh = 0;
      pool.forEach(function (w) {
        var c = srs[w.id];
        if (!c) { fresh++; return; }
        if (api.isDue(c)) due++;
        if ((c.interval || 0) >= 7) learned++;
      });
      return { due: due, learned: learned, fresh: fresh, total: pool.length };
    },

    blank: blank,
    today: today
  };

  return api;
})();
