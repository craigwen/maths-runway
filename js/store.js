/* Maths Runway - persistence layer.
   All keys namespaced "mrw.". Falls back to in-memory storage if
   localStorage is unavailable, so the app never crashes. */
(function (global) {
  'use strict';

  var PREFIX = 'mrw.';
  var memory = {};

  function rawGet(key) {
    try {
      var v = global.localStorage.getItem(PREFIX + key);
      if (v !== null && v !== undefined) return v;
    } catch (e) { /* fall through to memory */ }
    return Object.prototype.hasOwnProperty.call(memory, PREFIX + key)
      ? memory[PREFIX + key]
      : null;
  }

  function rawSet(key, raw) {
    var done = false;
    try {
      global.localStorage.setItem(PREFIX + key, raw);
      done = true;
    } catch (e) { /* fall through to memory */ }
    if (!done) memory[PREFIX + key] = raw;
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  function defaultProfile() {
    return {
      points: 0,
      streak: 0,
      lastPlayedDay: null,
      sessionsCompleted: 0,
      totalSeconds: 0,
      badges: [],
      landmarks: []
    };
  }

  var Store = {
    get: function (key, fallback) {
      var raw = rawGet(key);
      if (raw === null || raw === undefined) return fallback;
      try { return JSON.parse(raw); } catch (e) { return fallback; }
    },
    set: function (key, value) {
      rawSet(key, JSON.stringify(value));
    },

    profile: function () { return this.get('profile', defaultProfile()); },
    saveProfile: function (p) { this.set('profile', p); },

    facts: function () { return this.get('facts', {}); },
    saveFacts: function (f) { this.set('facts', f); },

    topics: function () {
      return this.get('topics', {
        bonds: { level: 1, cc: 0, cw: 0 },
        placevalue: { level: 1, cc: 0, cw: 0 }
      });
    },
    saveTopics: function (t) { this.set('topics', t); },

    requeue: function () { return this.get('requeue', []); },
    saveRequeue: function (q) { this.set('requeue', q.slice(0, 12)); },

    sessions: function () { return this.get('sessions', []); },
    saveSessions: function (s) { this.set('sessions', s.slice(-30)); },

    /* Record one answered fact. firstTry: answered correctly on first attempt. */
    recordFact: function (factId, correctFirstTry) {
      var facts = this.facts();
      var rec = facts[factId] || { a: 0, c: 0, last: 0 };
      rec.a += 1;
      if (correctFirstTry) rec.c += 1;
      rec.last = Date.now();
      facts[factId] = rec;
      this.saveFacts(facts);
      return rec;
    },

    factAccuracy: function (factId) {
      var rec = this.facts()[factId];
      if (!rec || rec.a === 0) return null;
      return rec.c / rec.a;
    },

    /* Accuracy across every recorded fact belonging to a topic. */
    topicAccuracy: function (topic) {
      var facts = this.facts();
      var a = 0, c = 0;
      Object.keys(facts).forEach(function (id) {
        if (id.indexOf(topic + '.') === 0) { a += facts[id].a; c += facts[id].c; }
      });
      return a === 0 ? null : c / a;
    },

    topicAttempts: function (topic) {
      var facts = this.facts();
      var a = 0;
      Object.keys(facts).forEach(function (id) {
        if (id.indexOf(topic + '.') === 0) a += facts[id].a;
      });
      return a;
    },

    /* A topic counts as secure at 15+ attempts and 80%+ accuracy. */
    topicSecure: function (topic) {
      return this.topicAttempts(topic) >= 15 && (this.topicAccuracy(topic) || 0) >= 0.8;
    },

    secureFactIds: function (topic) {
      var facts = this.facts();
      var out = [];
      Object.keys(facts).forEach(function (id) {
        if (id.indexOf(topic + '.') === 0) {
          var r = facts[id];
          if (r.a >= 3 && r.c / r.a >= 0.8) out.push(id);
        }
      });
      return out;
    },

    factsNeedingWork: function (limit) {
      var facts = this.facts();
      var rows = [];
      Object.keys(facts).forEach(function (id) {
        var r = facts[id];
        if (r.a >= 3) rows.push({ id: id, acc: r.c / r.a, a: r.a });
      });
      rows.sort(function (x, y) { return x.acc - y.acc; });
      return rows.slice(0, limit || 8);
    },

    /* Call when a session finishes. Updates streak, points, session count. */
    finishSession: function (seconds, pointsEarned) {
      var p = this.profile();
      var today = todayStr();
      if (p.lastPlayedDay !== today) {
        var y = new Date();
        y.setDate(y.getDate() - 1);
        var yesterday = y.getFullYear() + '-' +
          ('0' + (y.getMonth() + 1)).slice(-2) + '-' + ('0' + y.getDate()).slice(-2);
        p.streak = (p.lastPlayedDay === yesterday) ? p.streak + 1 : 1;
        p.lastPlayedDay = today;
      }
      p.points += pointsEarned;
      p.sessionsCompleted += 1;
      p.totalSeconds += seconds;
      this.saveProfile(p);
      var s = this.sessions();
      s.push({ day: today, seconds: seconds, points: pointsEarned });
      this.saveSessions(s);
      return p;
    },

    awardBadge: function (id) {
      var p = this.profile();
      if (p.badges.indexOf(id) === -1) { p.badges.push(id); this.saveProfile(p); return true; }
      return false;
    },

    unlockLandmark: function (id) {
      var p = this.profile();
      if (p.landmarks.indexOf(id) === -1) { p.landmarks.push(id); this.saveProfile(p); return true; }
      return false;
    },

    /* Lady Catherine's wardrobe. unlocked: dress ids owned; selected: dress id worn.
       Rhea starts with the two plainest dresses; each landmark earns two more. */
    wardrobe: function () { return this.get('wardrobe', { unlocked: [1, 2], selected: 1 }); },
    saveWardrobe: function (w) { this.set('wardrobe', w); },

    unlockDresses: function (ids) {
      var w = this.wardrobe(), added = [];
      ids.forEach(function (id) {
        if (w.unlocked.indexOf(id) === -1) { w.unlocked.push(id); added.push(id); }
      });
      if (added.length) this.saveWardrobe(w);
      return added;
    },

    selectDress: function (id) {
      var w = this.wardrobe();
      if (w.unlocked.indexOf(id) !== -1) { w.selected = id; this.saveWardrobe(w); return true; }
      return false;
    }
  };

  (global.MRW = global.MRW || {}).Store = Store;
  global.MRW.todayStr = todayStr;
})(typeof window !== 'undefined' ? window : globalThis);
