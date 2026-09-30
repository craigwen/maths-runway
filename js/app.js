/* Maths Runway - UI wiring. Screens, session flow, rewards, parent gate. */
(function () {
  'use strict';

  var Store = window.MRW.Store;
  var RNG = window.MRW.RNG;
  var TOPIC_NAMES = window.MRW.TOPIC_NAMES;

  /* ---------------- config ---------------- */
  var LANDMARKS = [
    { id: 'dover', emoji: '🏯', name: 'Dover Castle',
      fact: 'Dover Castle has secret tunnels dug deep beneath the white cliffs.',
      how: 'Secure Number Bonds' },
    { id: 'tower', emoji: '👑', name: 'Tower of London',
      fact: 'The Tower of London is nearly 1,000 years old, and its ravens are said to guard the kingdom.',
      how: 'Secure Place Value' },
    { id: 'hampton', emoji: '🌳', name: 'Hampton Court',
      fact: "Hampton Court was Henry VIII's favourite palace, with a famous maze in its gardens.",
      how: 'Finish 5 sessions' }
  ];

  var BADGES = [
    { id: 'first-session', emoji: '🚀', name: 'First Quest', desc: 'Finished a practice session' },
    { id: 'sharpshooter', emoji: '🎯', name: 'Super Solver', desc: '10 correct in one session' },
    { id: 'bond-builder', emoji: '🧮', name: 'Bond Builder', desc: 'Secured Number Bonds' },
    { id: 'place-pro', emoji: '🏰', name: 'Place Value Pro', desc: 'Secured Place Value' },
    { id: 'hot-streak', emoji: '🔥', name: 'Hot Streak', desc: 'Practised 3 days in a row' },
    { id: 'explorer', emoji: '🗺️', name: 'Tudor Explorer', desc: 'Unlocked all 3 landmarks' }
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

  var muted = Store.get('muted', false);
  function speak(text) {
    if (muted) return;
    try {
      var synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      var voices = synth.getVoices();
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].lang && voices[i].lang.indexOf('en-GB') === 0) { u.voice = voices[i]; break; }
      }
      synth.speak(u);
    } catch (e) { /* speech is a nice-to-have */ }
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    var p = Store.profile();
    var topics = Store.topics();
    $('points-val').textContent = p.points;
    $('streak-val').textContent = p.streak;
    guideGreeting();
    ['bonds', 'placevalue'].forEach(function (t) {
      $('level-' + t).textContent = 'Level ' + topics[t].level;
      $('secure-' + t).hidden = !Store.topicSecure(t);
    });

    var lmHtml = '';
    LANDMARKS.forEach(function (lm) {
      var un = p.landmarks.indexOf(lm.id) !== -1;
      lmHtml += '<div class="landmark' + (un ? ' unlocked' : '') + '">' +
        '<div class="lm-emoji">' + lm.emoji + '</div>' +
        '<div class="lm-name">' + lm.name + '</div>' +
        (un ? '<div class="lm-fact">' + lm.fact + '</div>'
            : '<div class="lm-lock">🔒<br>' + lm.how + '</div>') +
        '</div>';
    });
    $('landmarks').innerHTML = lmHtml;

    var bHtml = '';
    BADGES.forEach(function (b) {
      var has = p.badges.indexOf(b.id) !== -1;
      bHtml += '<div class="badge' + (has ? '' : ' locked') + '" title="' + b.desc + '">' +
        '<span>' + b.emoji + '</span><span class="b-name">' + b.name + '</span></div>';
    });
    $('badges').innerHTML = bHtml;
    updateMuteBtn();
  }

  function updateMuteBtn() {
    $('mute-btn').textContent = muted ? '🔇' : '🔊';
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
    $('q-tag').textContent = TOPIC_NAMES[q.topic];
    $('question').innerHTML = q.text;
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    $('next-btn').hidden = true;

    var area = $('answer-area');
    area.innerHTML = '';
    if (q.format === 'mc') {
      var wrap = document.createElement('div');
      wrap.className = 'mc';
      shuffled(q.choices).forEach(function (c) {
        var b = document.createElement('button');
        b.className = 'mc-btn';
        b.textContent = c;
        b.addEventListener('click', function () { answerMc(b, c); });
        wrap.appendChild(b);
      });
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

  function answerMc(btn, choice) {
    if (S.locked) return;
    checkAnswer(choice, btn);
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
    Store.recordFact(q.id, firstTry);
    window.MRW.applyResult(Store, q.topic, firstTry);
    showFeedback('good', praise() + ' +' + pts);
    speak(praise());
  }

  function onWrong(btn) {
    var q = currentQ();
    S.wrongs += 1;
    if (btn) btn.classList.add('picked-wrong');
    if (S.wrongs === 1) {
      showFeedback('kind', tryAgain() + '<span class="hint">' + q.hint + '</span>');
      speak(tryAgain() + ' ' + q.hint);
    } else {
      /* Second wrong: reveal kindly and move on. Never a fail state. */
      lockInputs();
      Store.recordFact(q.id, false);
      window.MRW.applyResult(Store, q.topic, false);
      queueRequeue(q);
      showFeedback('kind', 'Good try. ' + q.reveal);
      speak('Good try. ' + q.reveal);
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
    if (Store.topicSecure('bonds') && Store.unlockLandmark('dover')) earned.push('🏯 Dover Castle unlocked!');
    if (Store.topicSecure('placevalue') && Store.unlockLandmark('tower')) earned.push('👑 Tower of London unlocked!');
    if (p.sessionsCompleted >= 5 && Store.unlockLandmark('hampton')) earned.push('🌳 Hampton Court unlocked!');
    if (Store.awardBadge('first-session')) earned.push('🚀 Badge: First Quest');
    if (S.correctFirst >= 10 && Store.awardBadge('sharpshooter')) earned.push('🎯 Badge: Super Solver');
    if (Store.topicSecure('bonds') && Store.awardBadge('bond-builder')) earned.push('🧮 Badge: Bond Builder');
    if (Store.topicSecure('placevalue') && Store.awardBadge('place-pro')) earned.push('🏰 Badge: Place Value Pro');
    p = Store.profile();
    if (p.streak >= 3 && Store.awardBadge('hot-streak')) earned.push('🔥 Badge: Hot Streak');
    if (p.landmarks.length >= 3 && Store.awardBadge('explorer')) earned.push('🗺️ Badge: Tudor Explorer');
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
    speak('Session complete! You earned ' + S.points + ' points.');
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
    ['bonds', 'placevalue'].forEach(function (t) {
      var acc = Store.topicAccuracy(t), att = Store.topicAttempts(t);
      th += '<div class="dash-row"><span>' + TOPIC_NAMES[t] +
        ' <span style="color:#4a5578">(' + att + ' tries)</span></span>' +
        '<span class="pct">' + pct(acc) + '</span></div>';
    });
    $('d-topics').innerHTML = th;

    var sec = [], prog = [];
    ['bonds', 'placevalue'].forEach(function (t) {
      (Store.topicSecure(t) ? sec : prog).push(TOPIC_NAMES[t]);
    });
    $('d-secure').innerHTML =
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
    renderHome();
    bindParentGate();

    $('topic-bonds').addEventListener('click', function () { startSession('bonds'); });
    $('topic-placevalue').addEventListener('click', function () { startSession('placevalue'); });
    $('next-btn').addEventListener('click', nextQuestion);
    $('speak-btn').addEventListener('click', function () {
      if (S) speak(currentQ().speak);
    });
    $('mute-btn').addEventListener('click', function () {
      muted = !muted;
      Store.set('muted', muted);
      updateMuteBtn();
      if (!muted && S) speak(currentQ().speak);
    });
    $('quit-btn').addEventListener('click', function () {
      try { window.speechSynthesis.cancel(); } catch (e) {}
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

    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices(); /* warm up voice list */
    }
  });
})();
