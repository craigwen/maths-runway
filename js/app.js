/* Maths Runway - UI wiring. Screens, session flow, rewards, parent gate. */
(function () {
  'use strict';

  var Store = window.MRW.Store;
  var RNG = window.MRW.RNG;
  var TOPIC_NAMES = window.MRW.TOPIC_NAMES;

  /* ---------------- config ---------------- */
  var LANDMARKS = [
    { id: 'dover', era: 'tudor', emoji: '🏯', name: 'Dover Castle',
      fact: 'Dover Castle has secret tunnels dug deep beneath the white cliffs.',
      how: 'Secure Number Bonds' },
    { id: 'tower', era: 'tudor', emoji: '👑', name: 'Tower of London',
      fact: 'The Tower of London is nearly 1,000 years old, and its ravens are said to guard the kingdom.',
      how: 'Secure Place Value' },
    { id: 'hampton', era: 'tudor', emoji: '🌳', name: 'Hampton Court',
      fact: "Hampton Court was Henry VIII's favourite palace, with a famous maze in its gardens.",
      how: 'Finish 5 sessions' },
    { id: 'towerbridge', era: 'edwardian', emoji: '🌉', name: 'Tower Bridge',
      fact: 'Tower Bridge opened in 1894. Its road lifts up to let tall ships pass beneath.',
      how: 'Secure Fractions' },
    { id: 'buckingham', era: 'edwardian', emoji: '💂', name: 'Buckingham Palace',
      fact: "Buckingham Palace is the King's London home. The King's Guard changes at a precise time, to the very minute.",
      how: 'Secure Measures' },
    { id: 'ritz', era: 'edwardian', emoji: '🎩', name: 'The Ritz',
      fact: 'The Ritz opened in 1906 and became the fanciest hotel in London.',
      how: 'Finish 10 sessions' }
  ];

  /* Eras: each is a chapter with its own quests, landmarks and dresses.
     An era unlocks when the previous era is complete (all its landmarks). */
  var ERAS = [
    { id: 'tudor', name: 'Tudor England', topics: ['bonds', 'placevalue'],
      landmarkIds: ['dover', 'tower', 'hampton'], dressIds: [1, 2, 3, 4, 5, 6, 7, 8] },
    { id: 'edwardian', name: '1900s London', topics: ['fractions', 'measures'],
      landmarkIds: ['towerbridge', 'buckingham', 'ritz'], dressIds: [9, 10, 11, 12, 13, 14, 15, 16],
      requires: 'tudor' }
  ];

  var TOPIC_META = {
    bonds: { emoji: '🧮', sub: 'Making 10 and 20' },
    placevalue: { emoji: '🏰', sub: 'Numbers to 1000' },
    fractions: { emoji: '🍕', sub: 'Halves, quarters, thirds' },
    measures: { emoji: '📏', sub: 'Length, mass, money, time' }
  };

  function eraById(id) {
    for (var i = 0; i < ERAS.length; i++) if (ERAS[i].id === id) return ERAS[i];
    return ERAS[0];
  }
  function eraComplete(era) {
    var p = Store.profile();
    return era.landmarkIds.every(function (id) { return p.landmarks.indexOf(id) !== -1; });
  }
  function eraUnlocked(era) {
    if (!era.requires) return true;
    return eraComplete(eraById(era.requires));
  }

  /* Lady Catherine's wardrobe. Simplest gowns first; each landmark earns two more. */
  var DRESSES = [
    { id: 1, era: 'tudor', name: 'Russet Kirtle', desc: 'Plain undyed wool, linen chemise', landmark: null, art: 'art/lady-dress-1.svg' },
    { id: 2, era: 'tudor', name: 'Grey Wool Kirtle', desc: 'Undyed grey wool, leather girdle', landmark: null, art: 'art/lady-dress-2.svg' },
    { id: 3, era: 'tudor', name: 'Embroidered Kirtle', desc: 'Madder-red wool, blackwork neckline, apron', landmark: 'dover', art: 'art/lady-dress-3.svg' },
    { id: 4, era: 'tudor', name: 'Fur-Trimmed Gown', desc: 'Dark green wool, fur cuffs, brass girdle', landmark: 'dover', art: 'art/lady-dress-4.svg' },
    { id: 5, era: 'tudor', name: 'Damask Gown', desc: 'Tawny silk damask, gold caul', landmark: 'tower', art: 'art/lady-dress-5.svg' },
    { id: 6, era: 'tudor', name: 'Velvet Court Gown', desc: 'Deep blue velvet, gold aglets, jeweled girdle', landmark: 'tower', art: 'art/lady-dress-6.svg' },
    { id: 7, era: 'tudor', name: 'Cloth of Silver', desc: 'Silver tissue gown, pearl edging', landmark: 'hampton', art: 'art/lady-dress-7.svg' },
    { id: 8, era: 'tudor', name: 'Cloth of Gold', desc: 'Gold brocade state gown, ermine trim', landmark: 'hampton', art: 'art/lady-dress-8.svg' },
    { id: 9, era: 'edwardian', name: 'Cotton Day Dress', desc: 'Plain white cotton, simple collar', landmark: 'towerbridge', art: 'art/lady-dress-9.svg' },
    { id: 10, era: 'edwardian', name: 'Shirtwaist & Skirt', desc: 'Striped blouse, dark serge skirt', landmark: 'towerbridge', art: 'art/lady-dress-10.svg' },
    { id: 11, era: 'edwardian', name: 'Walking Suit', desc: 'Beige linen jacket and long skirt', landmark: 'buckingham', art: 'art/lady-dress-11.svg' },
    { id: 12, era: 'edwardian', name: 'Lace Tea Gown', desc: 'Pastel pink, lace-trimmed, flowing', landmark: 'buckingham', art: 'art/lady-dress-12.svg' },
    { id: 13, era: 'edwardian', name: 'Silk Evening Dress', desc: 'Pale blue silk, empire waistline', landmark: 'ritz', art: 'art/lady-dress-13.svg' },
    { id: 14, era: 'edwardian', name: 'Beaded Evening Gown', desc: 'Ivory, sparkling beadwork bodice', landmark: 'ritz', art: 'art/lady-dress-14.svg' },
    { id: 15, era: 'edwardian', name: 'Velvet Opera Coat', desc: 'Burgundy velvet over champagne silk', landmark: null, art: 'art/lady-dress-15.svg' },
    { id: 16, era: 'edwardian', name: 'Court Presentation Gown', desc: 'White, long lace train', landmark: null, art: 'art/lady-dress-16.svg' },
    { id: 17, era: 'tudor', name: 'Coronation Robe', desc: 'Crimson velvet, ermine, gold clasps', landmark: null, bonus: 'master-bonds', art: 'art/lady-dress-17.svg' },
    { id: 18, era: 'tudor', name: 'Royal Purple Gown', desc: 'Purple silk damask, pearl edging', landmark: null, bonus: 'master-placevalue', art: 'art/lady-dress-18.svg' },
    { id: 19, era: 'edwardian', name: 'Ascot Gown', desc: 'White, black ribbons, wide-brim hat', landmark: null, bonus: 'master-fractions', art: 'art/lady-dress-19.svg' },
    { id: 20, era: 'edwardian', name: 'Peacock Evening Gown', desc: 'Iridescent teal silk, beadwork', landmark: null, bonus: 'master-measures', art: 'art/lady-dress-20.svg' }
  ];
  var DRESS_BY_LANDMARK = { dover: [3, 4], tower: [5, 6], hampton: [7, 8],
    towerbridge: [9, 10], buckingham: [11, 12], ritz: [13, 14] };
  /* Final dresses of an era: awarded once when the whole era is complete. */
  var DRESS_BY_ERA_BONUS = { edwardian: [15, 16] };
  /* Bonus dresses for mastery badges. */
  var DRESS_BY_MASTERY = {
    'master-bonds': 17, 'master-placevalue': 18,
    'master-fractions': 19, 'master-measures': 20
  };
  function dressUnlockHint(d) {
    if (d.landmark) return landmarkName(d.landmark);
    if (d.bonus) {
      var m = MASTERY.filter(function (x) { return x.id === d.bonus; })[0];
      return m ? 'Master ' + TOPIC_NAMES[m.topic] : '';
    }
    return 'Complete ' + eraById(d.era).name;
  }

  function dressById(id) {
    for (var i = 0; i < DRESSES.length; i++) if (DRESSES[i].id === id) return DRESSES[i];
    return DRESSES[0];
  }
  function landmarkName(id) {
    for (var i = 0; i < LANDMARKS.length; i++) if (LANDMARKS[i].id === id) return LANDMARKS[i].name;
    return '';
  }

  var BADGES = [
    { id: 'first-session', emoji: '🚀', name: 'First Quest', desc: 'Finished a practice session' },
    { id: 'sharpshooter', emoji: '🎯', name: 'Super Solver', desc: '10 correct in one session' },
    { id: 'bond-builder', emoji: '🧮', name: 'Bond Builder', desc: 'Secured Number Bonds' },
    { id: 'place-pro', emoji: '🏰', name: 'Place Value Pro', desc: 'Secured Place Value' },
    { id: 'hot-streak', emoji: '🔥', name: 'Hot Streak', desc: 'Practised 3 days in a row' },
    { id: 'explorer', emoji: '🗺️', name: 'Tudor Explorer', desc: 'Unlocked all 3 Tudor landmarks' },
    { id: 'edwardian-explorer', emoji: '🚂', name: '1900s Explorer', desc: 'Completed 1900s London' },
    { id: 'master-bonds', emoji: '🥇', name: 'Bonds Master', desc: 'Mastered Number Bonds' },
    { id: 'master-placevalue', emoji: '🏆', name: 'Place Value Master', desc: 'Mastered Place Value' },
    { id: 'master-fractions', emoji: '🎖️', name: 'Fractions Master', desc: 'Mastered Fractions' },
    { id: 'master-measures', emoji: '🏅', name: 'Measures Master', desc: 'Mastered Measures' }
  ];

  /* Mastery badges: one per topic, for sustained 90%+ accuracy. */
  var MASTERY = [
    { topic: 'bonds', id: 'master-bonds', emoji: '🥇' },
    { topic: 'placevalue', id: 'master-placevalue', emoji: '🏆' },
    { topic: 'fractions', id: 'master-fractions', emoji: '🎖️' },
    { topic: 'measures', id: 'master-measures', emoji: '🏅' }
  ];

  var PRAISE = ['Well done!', 'Brilliant!', 'Super work!', 'You got it!', 'Amazing!'];
  var TRY_AGAIN = ['Not quite, try once more.', 'Nearly! Have another go.', 'Good try, one more time.'];

  var GREETINGS = [
    'Well met, traveller! Choose your quest.',
    'Lady Catherine says: little and often wins the crown.',
    'The court is counting on you. Shall we practise?',
    'A new day, a new quest. Pick your challenge below.',
    'Steady now. Ten minutes of sums makes a scholar.'
  ];
  function guideGreeting() {
    var day = Math.floor(Date.now() / 86400000);
    $('guide-speech').textContent = GREETINGS[day % GREETINGS.length];
  }

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(id).classList.add('active');
    window.scrollTo(0, 0);
  }
  function shuffled(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rng ? rng.next() : Math.random()) * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------------- home ---------------- */
  function updateGuidePortrait() {
    var dress = dressById(Store.wardrobe().selected);
    var gi = $('guide-img');
    if (gi) {
      gi.src = dress.art;
      gi.alt = 'Lady Catherine, your Tudor guide, wearing her ' + dress.name;
    }
  }

  function renderHome() {
    var p = Store.profile();
    var topics = Store.topics();
    $('points-val').textContent = p.points;
    $('streak-val').textContent = p.streak;
    guideGreeting();
    updateGuidePortrait();

    /* Quest cards: one per topic in each unlocked era, plus a teaser for locked eras. */
    var tpHtml = '';
    ERAS.forEach(function (era) {
      if (!eraUnlocked(era)) {
        tpHtml += '<div class="era-lock">🔒 <b>' + era.name + '</b><br>Finish the ' +
          eraById(era.requires).name + ' era to unlock new quests.</div>';
        return;
      }
      era.topics.forEach(function (t) {
        var meta = TOPIC_META[t];
        tpHtml += '<button class="topic-card" id="topic-' + t + '" aria-label="Start ' + TOPIC_NAMES[t] + ' quest">' +
          '<div class="topic-emoji" aria-hidden="true">' + meta.emoji + '</div>' +
          '<div class="topic-name">' + TOPIC_NAMES[t] + '</div>' +
          '<div class="topic-sub">' + meta.sub + '</div>' +
          '<div class="topic-level">Level ' + topics[t].level + '</div>' +
          (Store.topicMastered(t) ? '<div class="secure-flag master-flag">Master ⭐</div>'
            : Store.topicSecure(t) ? '<div class="secure-flag">Secure ✓</div>' : '') +
          '</button>';
      });
    });
    $('topics').innerHTML = tpHtml;
    ERAS.forEach(function (era) {
      if (!eraUnlocked(era)) return;
      era.topics.forEach(function (t) {
        $('topic-' + t).addEventListener('click', function () { startSession(t); });
      });
    });

    /* Landmarks grouped by era. */
    var lmHtml = '';
    ERAS.forEach(function (era) {
      lmHtml += '<h3 class="era-head">' + era.name + (eraUnlocked(era) ? '' : ' 🔒') + '</h3>';
      if (!eraUnlocked(era)) {
        lmHtml += '<div class="era-lock">Finish the ' + eraById(era.requires).name + ' era to unlock.</div>';
        return;
      }
      lmHtml += '<div class="landmarks">';
      LANDMARKS.forEach(function (lm) {
        if (lm.era !== era.id) return;
        var un = p.landmarks.indexOf(lm.id) !== -1;
        lmHtml += '<div class="landmark' + (un ? ' unlocked' : '') + '">' +
          '<div class="lm-emoji">' + lm.emoji + '</div>' +
          '<div class="lm-name">' + lm.name + '</div>' +
          (un ? '<div class="lm-fact">' + lm.fact + '</div>'
              : '<div class="lm-lock">🔒<br>' + lm.how + '</div>') +
          '</div>';
      });
      lmHtml += '</div>';
    });
    $('landmarks').innerHTML = lmHtml;

    var bHtml = '';
    BADGES.forEach(function (b) {
      var has = p.badges.indexOf(b.id) !== -1;
      bHtml += '<div class="badge' + (has ? '' : ' locked') + '" title="' + b.desc + '">' +
        '<span>' + b.emoji + '</span><span class="b-name">' + b.name + '</span></div>';
    });
    $('badges').innerHTML = bHtml;
  }

  /* ---------------- wardrobe ---------------- */
  function renderWardrobe() {
    var w = Store.wardrobe();
    var html = '';
    ERAS.forEach(function (era) {
      html += '<h3 class="era-head">' + era.name + '</h3><div class="wardrobe-grid">';
      DRESSES.forEach(function (d) {
        if (d.era !== era.id) return;
        var owned = w.unlocked.indexOf(d.id) !== -1;
        var sel = w.selected === d.id;
        html += '<button class="dress-card' + (owned ? '' : ' locked') + (sel ? ' selected' : '') + '"' +
          ' data-dress="' + d.id + '"' + (owned ? '' : ' disabled') + '>' +
          (d.art ? '<img class="dress-img" src="' + d.art + '" alt="' + d.name + '">'
                 : '<div class="dress-img dress-pending" aria-hidden="true">👗</div>') +
          '<div class="dress-name">' + d.name + '</div>' +
          '<div class="dress-desc">' + d.desc + '</div>' +
          (owned ? (sel ? '<div class="dress-worn">Wearing ✓</div>' : '<div class="dress-worn pick">Tap to wear</div>')
                 : '<div class="dress-lock">🔒 ' + dressUnlockHint(d) + '</div>') +
          '</button>';
      });
      html += '</div>';
    });
    $('wardrobe-grid').innerHTML = html;
    var cards = $('wardrobe-grid').querySelectorAll('.dress-card:not(.locked)');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var id = parseInt(this.getAttribute('data-dress'), 10);
        if (Store.selectDress(id)) { renderWardrobe(); updateGuidePortrait(); }
      });
    }
  }

  function awardDresses(landmarkId, earned) {
    var added = Store.unlockDresses(DRESS_BY_LANDMARK[landmarkId] || []);
    if (added.length) earned.push('👗 ' + added.length + ' new gowns for Lady Catherine! See the Wardrobe.');
  }

  /* ---------------- session ---------------- */
  var S = null; /* session state */

  function startSession(topic) {
    S = {
      topic: topic,
      list: window.MRW.buildSession(Store, topic, new RNG()),
      idx: 0,
      wrongs: 0,
      correctFirst: 0,
      points: 0,
      startTime: Date.now(),
      pending: [],
      waitFor: 0,
      insertions: 0,
      locked: false
    };
    show('screen-session');
    renderProgress();
    renderQuestion();
  }

  function renderProgress() {
    var el = $('progress');
    el.innerHTML = '';
    for (var i = 0; i < S.list.length; i++) {
      var d = document.createElement('div');
      d.className = 'pdot' + (i < S.idx ? ' done' : i === S.idx ? ' now' : '');
      el.appendChild(d);
    }
  }

  function currentQ() { return S.list[S.idx]; }

  function renderQuestion() {
    var q = currentQ();
    S.wrongs = 0;
    S.locked = false;
    S.mcChoice = null;
    $('q-tag').textContent = TOPIC_NAMES[q.topic];
    $('question').innerHTML = q.text;
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    $('next-btn').hidden = true;
    $('next-btn').classList.remove('go');
    /* Clear last question's Check button; next-btn stays put in the footer. */
    var oldSub = $('mc-submit');
    if (oldSub) oldSub.remove();

    var area = $('answer-area');
    area.innerHTML = '';
    if (q.format === 'mc') {
      var wrap = document.createElement('div');
      wrap.className = 'mc';
      shuffled(q.choices).forEach(function (c) {
        var b = document.createElement('button');
        b.className = 'mc-btn';
        b.textContent = c;
        b.addEventListener('click', function () { selectMc(b, c); });
        wrap.appendChild(b);
      });
      var sub = document.createElement('button');
      sub.className = 'cta mc-submit';
      sub.id = 'mc-submit';
      sub.textContent = 'Check ✓';
      sub.disabled = true;
      sub.addEventListener('click', submitMc);
      /* The Check button lives in the sticky footer so it is always visible. */
      $('q-actions').appendChild(sub);
      area.appendChild(wrap);
    } else {
      var w = document.createElement('div');
      w.className = 'pad-wrap';
      w.innerHTML = '<div class="pad-display" id="pad-display" aria-live="polite"></div><div class="pad" id="pad"></div>';
      area.appendChild(w);
      var pad = $('pad');
      ['1','2','3','4','5','6','7','8','9','⌫','0','✓'].forEach(function (k) {
        var b = document.createElement('button');
        b.className = 'pad-btn' + ((k === '⌫' || k === '✓') ? ' fn' : '');
        b.textContent = k;
        b.setAttribute('aria-label', k === '⌫' ? 'Delete' : k === '✓' ? 'Check answer' : 'Digit ' + k);
        b.addEventListener('click', function () { padPress(k); });
        pad.appendChild(b);
      });
    }
  }

  function padPress(k) {
    if (S.locked) return;
    var d = $('pad-display');
    if (k === '⌫') { d.textContent = d.textContent.slice(0, -1); }
    else if (k === '✓') {
      if (d.textContent.length === 0) return;
      checkAnswer(String(parseInt(d.textContent, 10)), null);
    }
    else if (d.textContent.length < 4) { d.textContent += k; }
  }

  /* Multiple choice: 1) child selects an answer, 2) taps Check,
     3) the app marks it. Tapping another choice changes the selection. */
  function selectMc(btn, choice) {
    if (S.locked || btn.disabled) return;
    S.mcChoice = { btn: btn, value: choice };
    $('answer-area').querySelectorAll('.mc-btn').forEach(function (b) {
      b.classList.remove('selected');
    });
    btn.classList.add('selected');
    $('mc-submit').disabled = false;
  }

  function submitMc() {
    if (S.locked || !S.mcChoice) return;
    var c = S.mcChoice;
    S.mcChoice = null;
    $('mc-submit').disabled = true;
    checkAnswer(c.value, c.btn);
  }

  function norm(s) { return String(s).replace(/^0+/, '') || '0'; }

  function checkAnswer(given, btn) {
    var q = currentQ();
    if (norm(given) === norm(q.answer)) {
      onCorrect(btn);
    } else {
      onWrong(btn);
    }
  }

  function praise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }
  function tryAgain() { return TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)]; }

  function onCorrect(btn) {
    var q = currentQ();
    var firstTry = S.wrongs === 0;
    var pts = firstTry ? 10 : 5;
    S.points += pts;
    if (firstTry) S.correctFirst += 1;
    if (btn) btn.classList.add('picked-right');
    lockInputs();
    /* Green Next: this one is correct, and it should not look like Check. */
    $('next-btn').classList.add('go');
    Store.recordFact(q.id, firstTry);
    window.MRW.applyResult(Store, q.topic, firstTry);
    showFeedback('good', praise() + ' +' + pts);
  }

  function onWrong(btn) {
    var q = currentQ();
    S.wrongs += 1;
    if (btn) {
      /* A wrong multiple-choice pick is marked and retired so the
         retry is a fresh choice, not a re-tap of the same answer. */
      btn.classList.add('picked-wrong');
      btn.classList.remove('selected');
      btn.disabled = true;
    }
    if (S.wrongs === 1) {
      showFeedback('kind', tryAgain() + '<span class="hint">' + q.hint + '</span>');
    } else {
      /* Second wrong: reveal kindly and move on. Never a fail state. */
      lockInputs();
      Store.recordFact(q.id, false);
      window.MRW.applyResult(Store, q.topic, false);
      queueRequeue(q);
      showFeedback('kind', 'Good try. ' + q.reveal);
    }
  }

  function lockInputs() {
    S.locked = true;
    $('answer-area').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    $('next-btn').hidden = false;
  }

  function showFeedback(kind, html) {
    var f = $('feedback');
    f.className = 'feedback show ' + kind;
    f.innerHTML = html;
  }

  /* Spaced repetition: re-ask a missed fact a few questions later,
     and remember it for next session too. */
  function queueRequeue(q) {
    if (S.insertions < 4) {
      S.pending.push(q);
      if (S.waitFor <= 0) S.waitFor = 3;
      S.insertions += 1;
    }
    var rq = Store.requeue();
    if (rq.indexOf(q.id) === -1) { rq.push(q.id); Store.saveRequeue(rq); }
  }

  function nextQuestion() {
    /* Count the just-finished question toward the requeue wait. */
    if (S.pending.length > 0) {
      S.waitFor -= 1;
      if (S.waitFor <= 0) {
        var q = S.pending.shift();
        var at = Math.min(S.idx + 1, S.list.length - 1); /* keep the final question last */
        S.list.splice(at, 0, q);
        S.waitFor = 3;
      }
    }
    S.idx += 1;
    if (S.idx >= S.list.length) { finishSession(); return; }
    renderProgress();
    renderQuestion();
  }

  function checkUnlocks(earned) {
    var p = Store.profile();
    if (Store.topicSecure('bonds') && Store.unlockLandmark('dover')) {
      earned.push('🏯 Dover Castle unlocked!'); awardDresses('dover', earned);
    }
    if (Store.topicSecure('placevalue') && Store.unlockLandmark('tower')) {
      earned.push('👑 Tower of London unlocked!'); awardDresses('tower', earned);
    }
    if (p.sessionsCompleted >= 5 && Store.unlockLandmark('hampton')) {
      earned.push('🌳 Hampton Court unlocked!'); awardDresses('hampton', earned);
    }
    if (Store.topicSecure('fractions') && Store.unlockLandmark('towerbridge')) {
      earned.push('🌉 Tower Bridge unlocked!'); awardDresses('towerbridge', earned);
    }
    if (Store.topicSecure('measures') && Store.unlockLandmark('buckingham')) {
      earned.push('💂 Buckingham Palace unlocked!'); awardDresses('buckingham', earned);
    }
    if (p.sessionsCompleted >= 10 && Store.unlockLandmark('ritz')) {
      earned.push('🎩 The Ritz unlocked!'); awardDresses('ritz', earned);
    }
    /* Era-completion bonuses: final dresses plus explorer badges. */
    ERAS.forEach(function (era) {
      if (!era.requires) return;
      if (eraComplete(era) && Store.giveEraBonus(era.id)) {
        var added = Store.unlockDresses(DRESS_BY_ERA_BONUS[era.id] || []);
        earned.push('🎉 ' + era.name + ' complete!' + (added.length ? ' ' + added.length + ' final dresses earned!' : ''));
      }
    });
    if (Store.awardBadge('first-session')) earned.push('🚀 Badge: First Quest');
    MASTERY.forEach(function (m) {
      if (Store.topicMastered(m.topic) && Store.awardBadge(m.id)) {
        earned.push(m.emoji + ' Badge: ' + TOPIC_NAMES[m.topic] + ' Master');
        var did = DRESS_BY_MASTERY[m.id];
        if (did && Store.unlockDresses([did]).length) {
          earned.push('👗 Bonus dress: ' + DRESSES[did - 1].name + '!');
        }
      }
    });
    if (S.correctFirst >= 10 && Store.awardBadge('sharpshooter')) earned.push('🎯 Badge: Super Solver');
    if (Store.topicSecure('bonds') && Store.awardBadge('bond-builder')) earned.push('🧮 Badge: Bond Builder');
    if (Store.topicSecure('placevalue') && Store.awardBadge('place-pro')) earned.push('🏰 Badge: Place Value Pro');
    p = Store.profile();
    if (p.streak >= 3 && Store.awardBadge('hot-streak')) earned.push('🔥 Badge: Hot Streak');
    if (eraComplete(eraById('tudor')) && Store.awardBadge('explorer')) earned.push('🗺️ Badge: Tudor Explorer');
    if (eraComplete(eraById('edwardian')) && Store.awardBadge('edwardian-explorer')) earned.push('🚂 Badge: 1900s Explorer');
  }

  function finishSession() {
    var seconds = Math.round((Date.now() - S.startTime) / 1000);
    Store.finishSession(seconds, S.points);
    var earned = [];
    checkUnlocks(earned);
    $('complete-points').textContent = S.points;
    $('complete-correct').textContent = S.correctFirst;
    $('complete-total').textContent = S.list.length;
    $('complete-badges').innerHTML = earned.map(function (e) {
      return '<div class="new-badge">' + e + '</div>';
    }).join('');
    show('screen-complete');
    S = null;
  }

  /* ---------------- parent gate + dashboard ---------------- */
  var holdTimer = null;
  function bindParentGate() {
    var btn = $('parent-btn');
    function start(e) {
      e.preventDefault();
      $('hold-hint').hidden = false;
      holdTimer = setTimeout(function () {
        $('hold-hint').hidden = true;
        renderDashboard();
        show('screen-dashboard');
      }, 2000);
    }
    function cancel() {
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      $('hold-hint').hidden = true;
    }
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
  }

  function pct(x) { return x === null ? '–' : Math.round(x * 100) + '%'; }

  function renderDashboard() {
    var p = Store.profile();
    $('d-sessions').textContent = p.sessionsCompleted;
    $('d-time').textContent = Math.round(p.totalSeconds / 60);
    $('d-streak').textContent = p.streak;
    $('d-points').textContent = p.points;

    var th = '';
    window.MRW.TOPICS.forEach(function (t) {
      var acc = Store.topicAccuracy(t), att = Store.topicAttempts(t);
      th += '<div class="dash-row"><span>' + TOPIC_NAMES[t] +
        ' <span style="color:#4a5578">(' + att + ' tries)</span></span>' +
        '<span class="pct">' + pct(acc) + '</span></div>';
    });
    $('d-topics').innerHTML = th;

    var sec = [], prog = [], mst = [];
    window.MRW.TOPICS.forEach(function (t) {
      if (Store.topicMastered(t)) mst.push(TOPIC_NAMES[t]);
      (Store.topicSecure(t) ? sec : prog).push(TOPIC_NAMES[t]);
    });
    $('d-secure').innerHTML =
      '<div class="dash-row"><span>Master ⭐</span><span>' + (mst.join(', ') || '–') + '</span></div>' +
      '<div class="dash-row"><span>Secure</span><span>' + (sec.join(', ') || '–') + '</span></div>' +
      '<div class="dash-row"><span>In progress</span><span>' + (prog.join(', ') || '–') + '</span></div>';

    var work = Store.factsNeedingWork(8);
    if (!work.length) {
      $('d-work').innerHTML = '<div class="dash-row"><span>Not enough practice yet.</span><span></span></div>';
    } else {
      $('d-work').innerHTML = work.map(function (w) {
        var q = null;
        try { q = window.MRW.regenerate(w.id, new RNG(1)); } catch (e) { /* ignore */ }
        var label = q ? q.label : w.id;
        return '<div class="dash-row work-item"><span>' + label +
          ' <span style="color:#4a5578">(' + w.a + ' tries)</span></span>' +
          '<span class="pct">' + Math.round(w.acc * 100) + '%</span></div>';
      }).join('');
    }
  }

  /* ---------------- wiring ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    /* One-time migration: the 'harrods' landmark was renamed to 'buckingham'.
       Without this, a player who unlocked Harrods keeps the old id, sees
       Buckingham locked forever, and can never complete the 1900s era. */
    (function () {
      var mp = Store.profile();
      var hi = mp.landmarks.indexOf('harrods');
      if (hi !== -1) {
        mp.landmarks.splice(hi, 1);
        if (mp.landmarks.indexOf('buckingham') === -1) mp.landmarks.push('buckingham');
        Store.saveProfile(mp);
      }
    })();
    /* Grant dresses for landmarks completed before the wardrobe existed. */
    Store.profile().landmarks.forEach(function (lm) {
      Store.unlockDresses(DRESS_BY_LANDMARK[lm] || []);
    });
    renderHome();
    bindParentGate();

    $('wardrobe-btn').addEventListener('click', function () {
      renderWardrobe();
      show('screen-wardrobe');
    });
    $('wardrobe-back').addEventListener('click', function () {
      renderHome();
      show('screen-home');
    });

    /* Topic cards are rendered dynamically in renderHome (era-gated). */
    $('next-btn').addEventListener('click', nextQuestion);
    $('quit-btn').addEventListener('click', function () {
      S = null;
      renderHome();
      show('screen-home');
    });
    $('complete-home').addEventListener('click', function () {
      renderHome();
      show('screen-home');
    });
    $('dash-back').addEventListener('click', function () {
      renderHome();
      show('screen-home');
    });
  });
})();
