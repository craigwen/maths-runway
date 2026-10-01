/* Maths Masters - one-time progress restore.
   Snapshot of Rhea's progress from Craig's screenshots (1 Oct 2026).
   Her Safari private tab held this data; the installed app starts empty.
   The per-topic totals are exact. Three real "facts needing work" are
   exact; the remaining attempts are spread across small aggregate records
   (a<3) so the dashboard keeps showing exactly those three facts. */
(function (global) {
  var SNAPSHOT = {"profile": {"points": 900, "streak": 2, "lastPlayedDay": "2026-10-01", "sessionsCompleted": 8, "totalSeconds": 2220, "badges": ["explorer"], "landmarks": ["dover", "tower", "hampton", "buckingham"]}, "topics": {"bonds": {"level": 3, "cc": 0, "cw": 0}, "placevalue": {"level": 3, "cc": 0, "cw": 0}, "fractions": {"level": 1, "cc": 0, "cw": 0}, "measures": {"level": 3, "cc": 0, "cw": 0}}, "wardrobe": {"unlocked": [1, 2, 3, 4, 5, 6, 7, 8, 11, 12], "selected": 1}, "facts": {"fractions.1.2.1.3": {"a": 3, "c": 1, "last": 0}, "fractions.1.1.0.1": {"a": 3, "c": 2, "last": 0}, "placevalue.1.3.67.1": {"a": 4, "c": 3, "last": 0}, "bonds.9.9.r0": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r1": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r2": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r3": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r4": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r5": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r6": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r7": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r8": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r9": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r10": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r11": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r12": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r13": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r14": {"a": 2, "c": 2, "last": 0}, "bonds.9.9.r15": {"a": 2, "c": 1, "last": 0}, "bonds.9.9.r16": {"a": 2, "c": 0, "last": 0}, "bonds.9.9.r17": {"a": 2, "c": 0, "last": 0}, "bonds.9.9.r18": {"a": 1, "c": 0, "last": 0}, "placevalue.9.9.r0": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r1": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r2": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r3": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r4": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r5": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r6": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r7": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r8": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r9": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r10": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r11": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r12": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r13": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r14": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r15": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r16": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r17": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r18": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r19": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r20": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r21": {"a": 2, "c": 2, "last": 0}, "placevalue.9.9.r22": {"a": 2, "c": 0, "last": 0}, "placevalue.9.9.r23": {"a": 2, "c": 0, "last": 0}, "placevalue.9.9.r24": {"a": 2, "c": 0, "last": 0}, "placevalue.9.9.r25": {"a": 1, "c": 0, "last": 0}, "fractions.9.9.r0": {"a": 2, "c": 2, "last": 0}, "fractions.9.9.r1": {"a": 2, "c": 1, "last": 0}, "fractions.9.9.r2": {"a": 2, "c": 0, "last": 0}, "measures.9.9.r0": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r1": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r2": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r3": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r4": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r5": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r6": {"a": 2, "c": 2, "last": 0}, "measures.9.9.r7": {"a": 1, "c": 0, "last": 0}}};

  function restoreRheaProgress() {
    var Store = global.MRW.Store;
    Store.saveProfile(JSON.parse(JSON.stringify(SNAPSHOT.profile)));
    Store.saveTopics(JSON.parse(JSON.stringify(SNAPSHOT.topics)));
    Store.saveWardrobe(JSON.parse(JSON.stringify(SNAPSHOT.wardrobe)));
    Store.set('facts', JSON.parse(JSON.stringify(SNAPSHOT.facts)));
    Store.saveRequeue([]);
  }

  /* Backup codes: the whole progress snapshot as a short text code Craig
     can paste into Apple Notes. Unlike the frozen 1 Oct snapshot above,
     a backup restores progress as of the moment it was copied. */
  var BACKUP_PREFIX = 'MM1.';

  function slimFacts(facts) {
    var out = {};
    Object.keys(facts).forEach(function (id) {
      var r = facts[id];
      out[id] = { a: r.a, c: r.c }; /* last is write-only; drop it */
    });
    return out;
  }

  function exportBackupCode() {
    var Store = global.MRW.Store;
    var data = {
      v: 1,
      profile: Store.profile(),
      topics: Store.topics(),
      wardrobe: Store.wardrobe(),
      facts: slimFacts(Store.facts()),
      requeue: Store.requeue()
    };
    return BACKUP_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  function parseBackupCode(code) {
    code = String(code || '').trim().replace(/\s+/g, '');
    if (code.indexOf(BACKUP_PREFIX) !== 0) throw new Error('not a Maths Masters backup code');
    var data = JSON.parse(decodeURIComponent(escape(atob(code.slice(BACKUP_PREFIX.length)))));
    if (!data || data.v !== 1 || !data.profile || typeof data.profile.sessionsCompleted !== 'number' ||
        !data.topics || !data.topics.bonds || !data.wardrobe || !data.facts) {
      throw new Error('backup code is damaged');
    }
    return data;
  }

  function applyBackupData(data) {
    var Store = global.MRW.Store;
    var facts = {};
    Object.keys(data.facts).forEach(function (id) {
      var r = data.facts[id];
      facts[id] = { a: r.a | 0, c: r.c | 0, last: 0 };
    });
    Store.saveProfile(data.profile);
    Store.saveTopics(data.topics);
    Store.saveWardrobe(data.wardrobe);
    Store.set('facts', facts);
    Store.saveRequeue(data.requeue || []);
    return data.profile;
  }

  global.MRW = global.MRW || {};
  global.MRW.restoreRheaProgress = restoreRheaProgress;
  global.MRW.exportBackupCode = exportBackupCode;
  global.MRW.parseBackupCode = parseBackupCode;
  global.MRW.applyBackupData = applyBackupData;
})(window);
