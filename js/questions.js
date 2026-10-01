/* Maths Runway - question engine.
   Generated (never hardcoded) questions for two topics, three levels
   each. Generators accept optional params so a stored fact id can be
   re-asked with the SAME numbers (spaced repetition).
   No DOM access here, so the logic is testable in Node. */
(function (global) {
  'use strict';

  /* ---------- tiny RNG (seedable for tests) ---------- */
  function RNG(seed) {
    this.s = (seed === undefined ? (Math.random() * 1e9) | 0 : seed) >>> 0;
  }
  RNG.prototype.next = function () {
    var x = this.s;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.s = x >>> 0;
    return this.s / 4294967296;
  };
  RNG.prototype.int = function (lo, hi) { /* inclusive */
    return lo + Math.floor(this.next() * (hi - lo + 1));
  };
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length)]; };
  RNG.prototype.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(this.next() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function num(n) { return '<span class="qnum">' + esc(n) + '</span>'; }

  /* Plausible wrong answers for multiple choice. */
  function distractors(answer, rng, count) {
    count = count || 2;
    var cands = [answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10];
    var s = String(answer);
    if (s.length >= 2) { /* digit swap */
      var d = s.split('');
      var t = d[0]; d[0] = d[1]; d[1] = t;
      cands.push(parseInt(d.join(''), 10));
    }
    var out = [];
    rng.shuffle(cands).forEach(function (c) {
      if (out.length < count && c >= 0 && c !== answer && out.indexOf(c) === -1) out.push(c);
    });
    var k = 3;
    while (out.length < count) { if (out.indexOf(answer + k) === -1) out.push(answer + k); k += 3; }
    return out;
  }

  function mcOrPad(rng, forceMc) {
    if (forceMc) return 'mc';
    return rng.next() < 0.35 ? 'mc' : 'pad';
  }

  function finish(q, topic, level, genIdx, params, rng, forceMc) {
    q.id = [topic, level, genIdx].concat(params).join('.');
    q.topic = topic; q.level = level;
    if (q.choiceFrom) {
      /* Comparing questions: the buttons must be the numbers being
         compared, never near-miss distractors (a distractor could be
         larger than the right answer and make the app look wrong). */
      q.format = 'mc';
      q.choices = rng.shuffle(q.choiceFrom.slice()).map(String);
      delete q.choiceFrom;
    } else if (mcOrPad(rng, forceMc) === 'mc' || q.format === 'mc') {
      q.format = 'mc';
      var ds = distractors(q._ansNum, rng, 2);
      q.choices = rng.shuffle([q._ansNum].concat(ds)).map(String);
    } else {
      q.format = 'pad';
    }
    delete q._ansNum;
    q.answer = String(q.answer);
    return q;
  }

  /* ================= FOUNDATIONS: number bonds to 20 ================= */
  var Bonds = {
    1: [
      function (rng, params) { /* a + b = 10 */
        var p0, p1;
        if (params) { p0 = params[0]; p1 = params[1]; }
        else { p0 = rng.int(1, 9); p1 = 10 - p0; var s = rng.shuffle([p0, p1]); p0 = s[0]; p1 = s[1]; }
        return finish({
          text: num(p0) + ' + ' + num(p1) + ' = ?',
          speak: 'What is ' + p0 + ' plus ' + p1 + '?',
          answer: 10, _ansNum: 10, label: p0 + ' + ' + p1,
          hint: 'Count up from ' + p0 + ' to 10.',
          reveal: 'The answer is 10. ' + p0 + ' and ' + p1 + ' make 10.'
        }, 'bonds', 1, 0, [p0, p1], rng);
      },
      function (rng, params) { /* 10 - a */
        var a = params ? params[0] : rng.int(1, 9), ans = 10 - a;
        return finish({
          text: num(10) + ' − ' + num(a) + ' = ?',
          speak: 'What is 10 take away ' + a + '?',
          answer: ans, _ansNum: ans, label: '10 − ' + a,
          hint: 'If ' + a + ' and something make 10, what is left?',
          reveal: 'The answer is ' + ans + '. 10 take away ' + a + ' is ' + ans + '.'
        }, 'bonds', 1, 1, [a], rng);
      },
      function (rng, params) { /* a + ? = 10 */
        var a = params ? params[0] : rng.int(1, 9), ans = 10 - a;
        return finish({
          text: num(a) + ' + ? = ' + num(10),
          speak: 'What plus ' + a + ' makes 10?',
          answer: ans, _ansNum: ans, label: a + ' + ? = 10',
          hint: 'Count up from ' + a + '.',
          reveal: 'The answer is ' + ans + '. ' + a + ' plus ' + ans + ' is 10.'
        }, 'bonds', 1, 2, [a], rng);
      }
    ],
    2: [
      function (rng, params) { /* a + b crossing ten */
        var a, b;
        if (params) { a = params[0]; b = params[1]; }
        else { a = rng.int(6, 9); b = rng.int(11 - a, 9); }
        var ans = a + b;
        return finish({
          text: num(a) + ' + ' + num(b) + ' = ?',
          speak: 'What is ' + a + ' plus ' + b + '?',
          answer: ans, _ansNum: ans, label: a + ' + ' + b,
          hint: 'Make 10 first: ' + a + ' needs ' + (10 - a) + ' more.',
          reveal: 'The answer is ' + ans + '. ' + a + ' plus ' + b + ' is ' + ans + '.'
        }, 'bonds', 2, 0, [a, b], rng);
      },
      function (rng, params) { /* m - s crossing ten */
        var m, s;
        if (params) { m = params[0]; s = params[1]; }
        else {
          m = rng.int(11, 18); s = rng.int(5, 9);
          if ((m % 10) >= s || m - s < 2) { s = (m % 10) + rng.int(1, 4); if (s > 9) s = 9; }
          if (m - s < 1) { m = 15; s = 7; }
        }
        var ans = m - s;
        return finish({
          text: num(m) + ' − ' + num(s) + ' = ?',
          speak: 'What is ' + m + ' take away ' + s + '?',
          answer: ans, _ansNum: ans, label: m + ' − ' + s,
          hint: 'Go back to 10 first, then take away the rest.',
          reveal: 'The answer is ' + ans + '. ' + m + ' take away ' + s + ' is ' + ans + '.'
        }, 'bonds', 2, 1, [m, s], rng);
      },
      function (rng, params) { /* a + ? = t, t in 12..18 */
        var t, a;
        if (params) { a = params[0]; t = params[1]; }
        else { t = rng.int(12, 18); a = rng.int(6, t - 2); }
        var ans = t - a;
        return finish({
          text: num(a) + ' + ? = ' + num(t),
          speak: 'What plus ' + a + ' makes ' + t + '?',
          answer: ans, _ansNum: ans, label: a + ' + ? = ' + t,
          hint: 'Count up from ' + a + ' to ' + t + '.',
          reveal: 'The answer is ' + ans + '. ' + a + ' plus ' + ans + ' is ' + t + '.'
        }, 'bonds', 2, 2, [a, t], rng);
      }
    ],
    3: [
      function (rng, params) { /* a + ? = 20 */
        var a = params ? params[0] : rng.int(11, 19), ans = 20 - a;
        return finish({
          text: num(a) + ' + ? = ' + num(20),
          speak: 'What plus ' + a + ' makes 20?',
          answer: ans, _ansNum: ans, label: a + ' + ? = 20',
          hint: 'How far from ' + a + ' to 20?',
          reveal: 'The answer is ' + ans + '. ' + a + ' plus ' + ans + ' is 20.'
        }, 'bonds', 3, 0, [a], rng);
      },
      function (rng, params) { /* 20 - a */
        var a = params ? params[0] : rng.int(11, 19), ans = 20 - a;
        return finish({
          text: num(20) + ' − ' + num(a) + ' = ?',
          speak: 'What is 20 take away ' + a + '?',
          answer: ans, _ansNum: ans, label: '20 − ' + a,
          hint: 'Think: ' + a + ' and what make 20?',
          reveal: 'The answer is ' + ans + '. 20 take away ' + a + ' is ' + ans + '.'
        }, 'bonds', 3, 1, [a], rng);
      },
      function (rng, params) { /* near doubles */
        var a, b;
        if (params) { a = params[0]; b = params[1]; }
        else { var pr = rng.pick([[9, 8], [8, 7], [7, 6], [9, 7], [8, 9], [7, 9]]); a = pr[0]; b = pr[1]; }
        var ans = a + b;
        return finish({
          text: num(a) + ' + ' + num(b) + ' = ?',
          speak: 'What is ' + a + ' plus ' + b + '?',
          answer: ans, _ansNum: ans, label: a + ' + ' + b,
          hint: 'Double ' + a + ' is ' + (a + a) + '. Now adjust.',
          reveal: 'The answer is ' + ans + '. ' + a + ' plus ' + b + ' is ' + ans + '.'
        }, 'bonds', 3, 2, [a, b], rng);
      },
      function (rng, params) { /* ? + a = t */
        var a, t;
        if (params) { a = params[0]; t = params[1]; }
        else { t = rng.int(15, 19); a = rng.int(6, 9); if (t - a <= 0) { t = 18; a = 7; } }
        var ans = t - a;
        return finish({
          text: '? + ' + num(a) + ' = ' + num(t),
          speak: 'What plus ' + a + ' makes ' + t + '?',
          answer: ans, _ansNum: ans, label: '? + ' + a + ' = ' + t,
          hint: 'Take ' + a + ' away from ' + t + '.',
          reveal: 'The answer is ' + ans + '. ' + ans + ' plus ' + a + ' is ' + t + '.'
        }, 'bonds', 3, 3, [a, t], rng);
      }
    ]
  };

  /* ================= PLACE VALUE: numbers to 1000 ================= */
  var PlaceValue = {
    1: [
      function (rng, params) { /* how many tens in N */
        var n = params ? params[0] : rng.int(2, 9) * 10, t = n / 10;
        return finish({
          text: 'How many <b>tens</b> are in ' + num(n) + '?',
          speak: 'How many tens are in ' + n + '?',
          answer: t, _ansNum: t, label: 'tens in ' + n,
          hint: 'Count the tens: 10, 20, 30…',
          reveal: 'The answer is ' + t + '. There are ' + t + ' tens in ' + n + '.'
        }, 'placevalue', 1, 0, [n], rng);
      },
      function (rng, params) { /* A tens and B ones */
        var A = params ? params[0] : rng.int(1, 9);
        var B = params ? params[1] : rng.int(0, 9);
        var ans = A * 10 + B;
        return finish({
          text: 'What number has ' + num(A) + ' tens and ' + num(B) + ' ones?',
          speak: 'What number has ' + A + ' tens and ' + B + ' ones?',
          answer: ans, _ansNum: ans, label: A + ' tens, ' + B + ' ones',
          hint: A + ' tens is ' + (A * 10) + '. Now add the ones.',
          reveal: 'The answer is ' + ans + '. ' + A + ' tens and ' + B + ' ones make ' + ans + '.'
        }, 'placevalue', 1, 1, [A, B], rng);
      },
      function (rng, params) { /* which is bigger, 2-digit */
        var x, y;
        if (params) { x = params[0]; y = params[1]; }
        else { x = rng.int(21, 98); y = rng.int(21, 98); if (x === y) y = x === 98 ? 21 : x + 1; }
        var ans = Math.max(x, y);
        return finish({
          format: 'mc',
          choiceFrom: [x, y],
          text: 'Which number is <b>bigger</b>, ' + num(x) + ' or ' + num(y) + '?',
          speak: 'Which number is bigger, ' + x + ' or ' + y + '?',
          answer: ans, _ansNum: ans, label: 'bigger of ' + x + ', ' + y,
          hint: 'Look at the tens digits first.',
          reveal: 'The answer is ' + ans + '. ' + ans + ' is bigger.'
        }, 'placevalue', 1, 2, [x, y], rng, true);
      },
      function (rng, params) { /* 10 more/less than 2-digit */
        var n = params ? params[0] : rng.int(21, 89);
        var more = params ? params[1] === 1 : rng.next() < 0.5;
        var ans = more ? n + 10 : n - 10;
        return finish({
          text: 'What is ' + num(10) + (more ? ' <b>more</b> ' : ' <b>less</b> ') + 'than ' + num(n) + '?',
          speak: 'What is 10 ' + (more ? 'more' : 'less') + ' than ' + n + '?',
          answer: ans, _ansNum: ans, label: '10 ' + (more ? 'more' : 'less') + ' than ' + n,
          hint: 'Only the tens digit changes.',
          reveal: 'The answer is ' + ans + '.'
        }, 'placevalue', 1, 3, [n, more ? 1 : 0], rng);
      }
    ],
    2: [
      function (rng, params) { /* what is the digit worth */
        function digitCount(num, d) {
          var c = 0;
          String(num).split('').forEach(function (ch) { if (Number(ch) === d) c += 1; });
          return c;
        }
        function fresh() {
          /* The asked digit must appear exactly once in the number,
             otherwise "what is the 6 worth?" in 662 has two answers. */
          var h, t, o, n, useTens, d, guard = 0;
          do {
            h = rng.int(1, 9); t = rng.int(1, 9); o = rng.int(0, 9);
            n = h * 100 + t * 10 + o; useTens = rng.next() < 0.5;
            d = useTens ? t : h;
            guard += 1;
          } while (digitCount(n, d) > 1 && guard < 50);
          return [n, useTens];
        }
        var n, useTens, ok = false;
        if (params) {
          n = params[0]; useTens = params[1] === 1;
          var pd = useTens ? Math.floor((n % 100) / 10) : Math.floor(n / 100);
          ok = digitCount(n, pd) === 1;
        }
        if (!ok) { var f = fresh(); n = f[0]; useTens = f[1]; }
        var d = useTens ? Math.floor((n % 100) / 10) : Math.floor(n / 100);
        var ans = useTens ? d * 10 : d * 100;
        var place = useTens ? 'tens' : 'hundreds';
        return finish({
          text: 'In ' + num(n) + ', what is the ' + num(d) + ' <b>worth</b>?',
          speak: 'In ' + n + ', what is the ' + d + ' worth?',
          answer: ans, _ansNum: ans, label: 'worth of ' + d + ' in ' + n,
          hint: 'The ' + d + ' is in the ' + place + ' place.',
          reveal: 'The answer is ' + ans + '. The ' + d + ' is worth ' + ans + '.'
        }, 'placevalue', 2, 0, [n, useTens ? 1 : 0], rng);
      },
      function (rng, params) { /* 100 more/less */
        var n = params ? params[0] : rng.int(2, 8) * 100 + rng.int(11, 89);
        var more = params ? params[1] === 1 : rng.next() < 0.5;
        var ans = more ? n + 100 : n - 100;
        return finish({
          text: 'What is ' + num(100) + (more ? ' <b>more</b> ' : ' <b>less</b> ') + 'than ' + num(n) + '?',
          speak: 'What is 100 ' + (more ? 'more' : 'less') + ' than ' + n + '?',
          answer: ans, _ansNum: ans, label: '100 ' + (more ? 'more' : 'less') + ' than ' + n,
          hint: 'Only the hundreds digit changes.',
          reveal: 'The answer is ' + ans + '.'
        }, 'placevalue', 2, 1, [n, more ? 1 : 0], rng);
      },
      function (rng, params) { /* 10 more/less crossing a hundred */
        var n, more;
        if (params) { n = params[0]; more = params[1] === 1; }
        else {
          var base = rng.int(3, 9) * 100; more = rng.next() < 0.5;
          n = more ? base - rng.int(1, 9) : base + rng.int(1, 9);
        }
        var ans = more ? n + 10 : n - 10;
        return finish({
          text: 'What is ' + num(10) + (more ? ' <b>more</b> ' : ' <b>less</b> ') + 'than ' + num(n) + '?',
          speak: 'What is 10 ' + (more ? 'more' : 'less') + ' than ' + n + '?',
          answer: ans, _ansNum: ans, label: '10 ' + (more ? 'more' : 'less') + ' than ' + n,
          hint: 'Watch out, this one crosses a hundred!',
          reveal: 'The answer is ' + ans + '.'
        }, 'placevalue', 2, 2, [n, more ? 1 : 0], rng);
      },
      function (rng, params) { /* compare 3-digit */
        var x, y;
        if (params) { x = params[0]; y = params[1]; }
        else { x = rng.int(101, 989); y = rng.int(101, 989); if (x === y) y = x + 1; }
        var ans = Math.max(x, y);
        return finish({
          format: 'mc',
          choiceFrom: [x, y],
          text: 'Which number is <b>bigger</b>, ' + num(x) + ' or ' + num(y) + '?',
          speak: 'Which number is bigger, ' + x + ' or ' + y + '?',
          answer: ans, _ansNum: ans, label: 'bigger of ' + x + ', ' + y,
          hint: 'Compare the hundreds first.',
          reveal: 'The answer is ' + ans + '. ' + ans + ' is bigger.'
        }, 'placevalue', 2, 3, [x, y], rng, true);
      }
    ],
    3: [
      function (rng, params) { /* count in 4s / 8s */
        var step = params ? params[0] : rng.pick([4, 8]);
        var start = params ? params[1] : step * rng.int(2, 5);
        var seq = [start, start + step, start + 2 * step], ans = start + 3 * step;
        return finish({
          text: 'Count in <b>' + step + 's</b>: ' + seq.map(num).join(', ') + ', ?',
          speak: 'Count in ' + step + 's: ' + seq.join(', ') + '. What comes next?',
          answer: ans, _ansNum: ans, label: 'count in ' + step + 's',
          hint: 'Add ' + step + ' each time.',
          reveal: 'The answer is ' + ans + '. Counting in ' + step + 's: ' + seq.join(', ') + ', ' + ans + '.'
        }, 'placevalue', 3, 0, [step, start], rng);
      },
      function (rng, params) { /* count in 50s / 100s */
        var step = params ? params[0] : rng.pick([50, 100]);
        var start = params ? params[1] : step * rng.int(2, 4);
        var seq = [start, start + step, start + 2 * step], ans = start + 3 * step;
        return finish({
          text: 'Count in <b>' + step + 's</b>: ' + seq.map(num).join(', ') + ', ?',
          speak: 'Count in ' + step + 's: ' + seq.join(', ') + '. What comes next?',
          answer: ans, _ansNum: ans, label: 'count in ' + step + 's',
          hint: 'Add ' + step + ' each time.',
          reveal: 'The answer is ' + ans + '.'
        }, 'placevalue', 3, 1, [step, start], rng);
      },
      function (rng, params) { /* order three: which is smallest/middle/biggest */
        var a, b, c, which;
        if (params) { a = params[0]; b = params[1]; c = params[2]; which = params[3]; }
        else {
          a = rng.int(101, 989); b = rng.int(101, 989); c = rng.int(101, 989);
          if (a === b || b === c || a === c) { a = 234; b = 567; c = 189; }
          which = rng.pick(['smallest', 'middle', 'biggest']);
        }
        var sorted = [a, b, c].slice().sort(function (x, y) { return x - y; });
        var ans = which === 'smallest' ? sorted[0] : which === 'middle' ? sorted[1] : sorted[2];
        return finish({
          format: 'mc',
          choiceFrom: [a, b, c],
          text: 'Which is the <b>' + which + '</b>?<br>' + [a, b, c].map(num).join(' &nbsp; '),
          speak: 'Which is the ' + which + ' of ' + a + ', ' + b + ' and ' + c + '?',
          answer: ans, _ansNum: ans, label: which + ' of 3 numbers',
          hint: 'Line them up from smallest to biggest.',
          reveal: 'The answer is ' + ans + '. In order: ' + sorted.join(', ') + '.'
        }, 'placevalue', 3, 2, [a, b, c, which], rng, true);
      },
      function (rng, params) { /* 100 more/less near 1000 */
        var more = params ? params[1] === 1 : rng.next() < 0.5;
        var n = more ? 900 : 1000, ans = more ? 1000 : 900;
        return finish({
          text: 'What is ' + num(100) + (more ? ' <b>more</b> ' : ' <b>less</b> ') + 'than ' + num(n) + '?',
          speak: 'What is 100 ' + (more ? 'more' : 'less') + ' than ' + n + '?',
          answer: ans, _ansNum: ans, label: '100 ' + (more ? 'more' : 'less') + ' than ' + n,
          hint: 'Think about the hundreds.',
          reveal: 'The answer is ' + ans + '.'
        }, 'placevalue', 3, 3, [n, more ? 1 : 0], rng);
      }
    ]
  };


  /* ================= FRACTIONS ================= */
  var FRACS = [
    { sym: '½', num: 1, den: 2, speak: 'one half' },
    { sym: '¼', num: 1, den: 4, speak: 'one quarter' },
    { sym: '¾', num: 3, den: 4, speak: 'three quarters' },
    { sym: '⅓', num: 1, den: 3, speak: 'one third' },
    { sym: '⅔', num: 2, den: 3, speak: 'two thirds' }
  ];
  function fracGreater(a, b) { return a.num * b.den > b.num * a.den; }

  var Fractions = {
    1: [
      function (rng, params) { /* unit fraction of a quantity */
        var fi, n;
        if (params) { fi = params[0]; n = params[1]; }
        else { fi = rng.pick([0, 1, 3]); n = FRACS[fi].den * rng.int(1, 6); }
        var f = FRACS[fi], ans = n * f.num / f.den;
        return finish({
          text: 'What is <b>' + f.sym + '</b> of ' + num(n) + '?',
          speak: 'What is ' + f.speak + ' of ' + n + '?',
          answer: ans, _ansNum: ans, label: f.sym + ' of ' + n,
          hint: 'Split ' + n + ' into ' + f.den + ' equal parts.',
          reveal: 'The answer is ' + ans + '. ' + f.sym + ' of ' + n + ' is ' + ans + '.'
        }, 'fractions', 1, 0, [fi, n], rng);
      },
      function (rng, params) { /* which unit fraction is bigger */
        var ai, bi;
        if (params) { ai = params[0]; bi = params[1]; }
        else {
          var units = [0, 1, 3];
          ai = rng.pick(units); bi = rng.pick(units);
          if (ai === bi) bi = units[(units.indexOf(ai) + 1) % units.length];
        }
        var a = FRACS[ai], b = FRACS[bi];
        var winner = fracGreater(a, b) ? a : b;
        return finish({
          format: 'mc',
          choiceFrom: [a.sym, b.sym],
          text: 'Which is <b>bigger</b>, ' + a.sym + ' or ' + b.sym + '?',
          speak: 'Which is bigger, ' + a.speak + ' or ' + b.speak + '?',
          answer: winner.sym, _ansNum: 0, label: 'bigger of ' + a.sym + ', ' + b.sym,
          hint: 'The smaller the pieces, the smaller the fraction.',
          reveal: 'The answer is ' + winner.sym + '.'
        }, 'fractions', 1, 1, [ai, bi], rng);
      },
      function (rng, params) { /* how many halves/quarters in a whole number */
        var fi, whole;
        if (params) { fi = params[0]; whole = params[1]; }
        else { fi = rng.pick([0, 1]); whole = rng.int(1, 4); }
        var f = FRACS[fi], ans = whole * f.den;
        var pname = fi === 0 ? 'halves' : 'quarters';
        return finish({
          text: 'How many <b>' + pname + '</b> are in ' + num(whole) + '?',
          speak: 'How many ' + pname + ' are in ' + whole + '?',
          answer: ans, _ansNum: ans, label: pname + ' in ' + whole,
          hint: 'Each whole one makes ' + f.den + '.',
          reveal: 'The answer is ' + ans + '. There are ' + ans + ' ' + pname + ' in ' + whole + '.'
        }, 'fractions', 1, 2, [fi, whole], rng);
      }
    ],
    2: [
      function (rng, params) { /* non-unit fraction of a quantity */
        var fi, n;
        if (params) { fi = params[0]; n = params[1]; }
        else { fi = rng.pick([2, 4]); n = FRACS[fi].den * rng.int(2, 8); }
        var f = FRACS[fi], ans = n * f.num / f.den;
        return finish({
          text: 'What is <b>' + f.sym + '</b> of ' + num(n) + '?',
          speak: 'What is ' + f.speak + ' of ' + n + '?',
          answer: ans, _ansNum: ans, label: f.sym + ' of ' + n,
          hint: 'Find ' + FRACS[fi === 2 ? 1 : 3].sym + ' of ' + n + ' first, then multiply.',
          reveal: 'The answer is ' + ans + '. ' + f.sym + ' of ' + n + ' is ' + ans + '.'
        }, 'fractions', 2, 0, [fi, n], rng);
      },
      function (rng, params) { /* missing whole: 1/2 of ? = r */
        var fi, r;
        if (params) { fi = params[0]; r = params[1]; }
        else { fi = rng.pick([0, 1, 3]); r = rng.int(2, 9); }
        var f = FRACS[fi], ans = r * f.den;
        return finish({
          text: '<b>' + f.sym + '</b> of ? = ' + num(r),
          speak: f.speak + ' of what is ' + r + '?',
          answer: ans, _ansNum: ans, label: f.sym + ' of ? = ' + r,
          hint: 'If one part is ' + r + ', how big is the whole?',
          reveal: 'The answer is ' + ans + '. ' + f.sym + ' of ' + ans + ' is ' + r + '.'
        }, 'fractions', 2, 1, [fi, r], rng);
      },
      function (rng, params) { /* order three fractions */
        var ii, jj, kk, which;
        if (params) { ii = params[0]; jj = params[1]; kk = params[2]; which = params[3]; }
        else {
          var idx = rng.shuffle([0, 1, 2, 3, 4]).slice(0, 3);
          ii = idx[0]; jj = idx[1]; kk = idx[2];
          which = rng.pick(['smallest', 'middle', 'biggest']);
        }
        var fs = [FRACS[ii], FRACS[jj], FRACS[kk]];
        var sorted = fs.slice().sort(function (a, b) { return (a.num / a.den) - (b.num / b.den); });
        var w = which === 'smallest' ? sorted[0] : which === 'middle' ? sorted[1] : sorted[2];
        var syms = fs.map(function (f) { return f.sym; });
        return finish({
          format: 'mc',
          choiceFrom: syms,
          text: 'Which is the <b>' + which + '</b>?<br>' + syms.join(' &nbsp; '),
          speak: 'Which is the ' + which + ' of ' + fs.map(function (f) { return f.speak; }).join(', ') + '?',
          answer: w.sym, _ansNum: 0, label: which + ' of fractions',
          hint: 'Think about the size of the pieces.',
          reveal: 'The answer is ' + w.sym + '.'
        }, 'fractions', 2, 2, [ii, jj, kk, which], rng);
      }
    ],
    3: [
      function (rng, params) { /* unit fraction of bigger quantities */
        var fi, n;
        if (params) { fi = params[0]; n = params[1]; }
        else { fi = rng.pick([0, 1, 3]); n = FRACS[fi].den * rng.int(8, 20); }
        var f = FRACS[fi], ans = n * f.num / f.den;
        return finish({
          text: 'What is <b>' + f.sym + '</b> of ' + num(n) + '?',
          speak: 'What is ' + f.speak + ' of ' + n + '?',
          answer: ans, _ansNum: ans, label: f.sym + ' of ' + n,
          hint: 'Split ' + n + ' into ' + f.den + ' equal parts.',
          reveal: 'The answer is ' + ans + '. ' + f.sym + ' of ' + n + ' is ' + ans + '.'
        }, 'fractions', 3, 0, [fi, n], rng);
      },
      function (rng, params) { /* non-unit fraction of bigger quantities */
        var fi, n;
        if (params) { fi = params[0]; n = params[1]; }
        else { fi = rng.pick([2, 4]); n = FRACS[fi].den * rng.int(8, 14); }
        var f = FRACS[fi], ans = n * f.num / f.den;
        return finish({
          text: 'What is <b>' + f.sym + '</b> of ' + num(n) + '?',
          speak: 'What is ' + f.speak + ' of ' + n + '?',
          answer: ans, _ansNum: ans, label: f.sym + ' of ' + n,
          hint: 'Find one part first, then multiply.',
          reveal: 'The answer is ' + ans + '. ' + f.sym + ' of ' + n + ' is ' + ans + '.'
        }, 'fractions', 3, 1, [fi, n], rng);
      }
    ]
  };


  /* ================= MEASURES ================= */
  var Measures = {
    1: [
      function (rng, params) { /* which is longer (cm) */
        var x, y;
        if (params) { x = params[0]; y = params[1]; }
        else { x = rng.int(5, 99); y = rng.int(5, 99); if (x === y) y = x === 99 ? 5 : x + 1; }
        var w = Math.max(x, y);
        return finish({
          format: 'mc',
          choiceFrom: [x + ' cm', y + ' cm'],
          text: 'Which is <b>longer</b>, ' + num(x) + ' cm or ' + num(y) + ' cm?',
          speak: 'Which is longer, ' + x + ' centimetres or ' + y + ' centimetres?',
          answer: w + ' cm', _ansNum: w, label: 'longer of ' + x + 'cm, ' + y + 'cm',
          hint: 'Longer means a bigger number of centimetres.',
          reveal: 'The answer is ' + w + ' cm.'
        }, 'measures', 1, 0, [x, y], rng);
      },
      function (rng, params) { /* which is heavier (g) */
        var x, y;
        if (params) { x = params[0]; y = params[1]; }
        else {
          x = rng.int(2, 19) * 50; y = rng.int(2, 19) * 50;
          if (x === y) y = x === 950 ? 100 : x + 50;
        }
        var w = Math.max(x, y);
        return finish({
          format: 'mc',
          choiceFrom: [x + ' g', y + ' g'],
          text: 'Which is <b>heavier</b>, ' + num(x) + ' g or ' + num(y) + ' g?',
          speak: 'Which is heavier, ' + x + ' grams or ' + y + ' grams?',
          answer: w + ' g', _ansNum: w, label: 'heavier of ' + x + 'g, ' + y + 'g',
          hint: 'Heavier means a bigger number of grams.',
          reveal: 'The answer is ' + w + ' g.'
        }, 'measures', 1, 1, [x, y], rng);
      },
      function (rng, params) { /* coin sum in pence */
        var c1, c2;
        if (params) { c1 = params[0]; c2 = params[1]; }
        else { var coins = [1, 2, 5, 10, 20, 50]; c1 = rng.pick(coins); c2 = rng.pick(coins); }
        var ans = c1 + c2;
        return finish({
          text: 'How many pence is ' + num(c1) + 'p + ' + num(c2) + 'p?',
          speak: 'How many pence is ' + c1 + 'p plus ' + c2 + 'p?',
          answer: ans, _ansNum: ans, label: c1 + 'p + ' + c2 + 'p',
          hint: 'Add the two coin values.',
          reveal: 'The answer is ' + ans + 'p.'
        }, 'measures', 1, 2, [c1, c2], rng);
      },
      function (rng, params) { /* hour hand after d hours */
        var h, d;
        if (params) { h = params[0]; d = params[1]; }
        else { h = rng.int(1, 10); d = rng.int(1, 2); }
        var ans = (h + d - 1) % 12 + 1;
        return finish({
          text: 'The hour hand points to ' + num(h) + '. Where will it point in ' + num(d) + (d === 1 ? ' hour' : ' hours') + '?',
          speak: 'The hour hand points to ' + h + '. Where will it point in ' + d + (d === 1 ? ' hour' : ' hours') + '?',
          answer: ans, _ansNum: ans, label: 'hour hand ' + h + ' + ' + d,
          hint: 'Count forward around the clock.',
          reveal: 'The answer is ' + ans + " o'clock."
        }, 'measures', 1, 3, [h, d], rng);
      }
    ],
    2: [
      function (rng, params) { /* m vs cm */
        var mVal, cmVal;
        if (params) { mVal = params[0]; cmVal = params[1]; }
        else {
          mVal = rng.int(1, 3);
          cmVal = rng.pick([50, 90, 110, 150, 250, 290]);
          if (mVal * 100 === cmVal) cmVal = 90;
        }
        var aL = mVal + ' m', bL = cmVal + ' cm';
        var winner = mVal * 100 > cmVal ? aL : bL;
        return finish({
          format: 'mc',
          choiceFrom: [aL, bL],
          text: 'Which is <b>longer</b>, ' + aL + ' or ' + bL + '?',
          speak: 'Which is longer, ' + mVal + ' metres or ' + cmVal + ' centimetres?',
          answer: winner, _ansNum: 0, label: 'longer of ' + aL + ', ' + bL,
          hint: '1 metre is 100 centimetres.',
          reveal: 'The answer is ' + winner + '.'
        }, 'measures', 2, 0, [mVal, cmVal], rng);
      },
      function (rng, params) { /* kg vs g */
        var kgVal, gVal;
        if (params) { kgVal = params[0]; gVal = params[1]; }
        else {
          kgVal = rng.int(1, 3);
          gVal = rng.pick([500, 900, 1100, 1500, 2500, 2900]);
          if (kgVal * 1000 === gVal) gVal = 900;
        }
        var aL = kgVal + ' kg', bL = gVal + ' g';
        var winner = kgVal * 1000 > gVal ? aL : bL;
        return finish({
          format: 'mc',
          choiceFrom: [aL, bL],
          text: 'Which is <b>heavier</b>, ' + aL + ' or ' + bL + '?',
          speak: 'Which is heavier, ' + kgVal + ' kilograms or ' + gVal + ' grams?',
          answer: winner, _ansNum: 0, label: 'heavier of ' + aL + ', ' + bL,
          hint: '1 kilogram is 1000 grams.',
          reveal: 'The answer is ' + winner + '.'
        }, 'measures', 2, 1, [kgVal, gVal], rng);
      },
      function (rng, params) { /* litres vs ml */
        var lVal, mlVal;
        if (params) { lVal = params[0]; mlVal = params[1]; }
        else {
          lVal = rng.int(1, 2);
          mlVal = rng.pick([500, 750, 900, 1500, 2500]);
          if (lVal * 1000 === mlVal) mlVal = 750;
        }
        var aL = lVal + (lVal === 1 ? ' litre' : ' litres'), bL = mlVal + ' ml';
        var winner = lVal * 1000 > mlVal ? aL : bL;
        return finish({
          format: 'mc',
          choiceFrom: [aL, bL],
          text: 'Which holds <b>more</b>, ' + aL + ' or ' + bL + '?',
          speak: 'Which holds more, ' + aL + ' or ' + mlVal + ' millilitres?',
          answer: winner, _ansNum: 0, label: 'more of ' + aL + ', ' + bL,
          hint: '1 litre is 1000 millilitres.',
          reveal: 'The answer is ' + winner + '.'
        }, 'measures', 2, 2, [lVal, mlVal], rng);
      },
      function (rng, params) { /* how many coins make total */
        var coin, count;
        if (params) { coin = params[0]; count = params[1]; }
        else { coin = rng.pick([10, 20, 50]); count = rng.int(2, 5); }
        var total = coin * count;
        return finish({
          text: 'How many ' + num(coin) + 'p coins make ' + num(total) + 'p?',
          speak: 'How many ' + coin + 'p coins make ' + total + 'p?',
          answer: count, _ansNum: count, label: count + 'x' + coin + 'p = ' + total + 'p',
          hint: 'Count in ' + coin + 's: ' + coin + ', ' + (2 * coin) + '\u2026',
          reveal: 'The answer is ' + count + '.'
        }, 'measures', 2, 3, [coin, count], rng);
      }
    ],
    3: [
      function (rng, params) { /* minutes in quarter/half hour */
        var kind = params ? params[0] : rng.int(0, 1);
        var word = kind === 0 ? 'quarter' : 'half', ans = kind === 0 ? 15 : 30;
        return finish({
          text: 'How many minutes are in a <b>' + word + '</b> of an hour?',
          speak: 'How many minutes are in a ' + word + ' of an hour?',
          answer: ans, _ansNum: ans, label: 'minutes in ' + word + ' hour',
          hint: 'An hour is 60 minutes.',
          reveal: 'The answer is ' + ans + ' minutes.'
        }, 'measures', 3, 0, [kind], rng);
      },
      function (rng, params) { /* perimeter of a square */
        var side = params ? params[0] : rng.int(4, 12), ans = 4 * side;
        return finish({
          text: 'A square has sides of ' + num(side) + ' cm. What is the <b>perimeter</b> in cm?',
          speak: 'A square has sides of ' + side + ' centimetres. What is the perimeter in centimetres?',
          answer: ans, _ansNum: ans, label: 'perimeter of square ' + side,
          hint: 'A square has 4 equal sides. Add them all.',
          reveal: 'The answer is ' + ans + ' cm.'
        }, 'measures', 3, 1, [side], rng);
      },
      function (rng, params) { /* unit conversions */
        var kinds = [
          [2, 'm', 'centimetres', 200], [3, 'm', 'centimetres', 300], [5, 'm', 'centimetres', 500],
          [2, 'kg', 'grams', 2000], [3, 'kg', 'grams', 3000],
          [2, 'litres', 'millilitres', 2000], [3, 'litres', 'millilitres', 3000]
        ];
        var ki = params ? params[0] : rng.int(0, kinds.length - 1);
        var k = kinds[ki];
        return finish({
          text: 'How many ' + k[2] + ' are in ' + num(k[0]) + ' ' + k[1] + '?',
          speak: 'How many ' + k[2] + ' are in ' + k[0] + ' ' + k[1] + '?',
          answer: k[3], _ansNum: k[3], label: k[0] + k[1] + ' to ' + k[2],
          hint: 'Think how many small units fit in one big one.',
          reveal: 'The answer is ' + k[3] + ' ' + k[2] + '.'
        }, 'measures', 3, 2, [ki], rng);
      },
      function (rng, params) { /* perimeter of a rectangle */
        var l, w;
        if (params) { l = params[0]; w = params[1]; }
        else { l = rng.int(5, 12); w = rng.int(3, 9); }
        var ans = 2 * (l + w);
        return finish({
          text: 'A rectangle is ' + num(l) + ' cm long and ' + num(w) + ' cm wide. What is the <b>perimeter</b> in cm?',
          speak: 'A rectangle is ' + l + ' centimetres long and ' + w + ' centimetres wide. What is the perimeter in centimetres?',
          answer: ans, _ansNum: ans, label: 'perimeter of ' + l + 'x' + w,
          hint: 'Add all four sides: two lengths and two widths.',
          reveal: 'The answer is ' + ans + ' cm.'
        }, 'measures', 3, 3, [l, w], rng);
      }
    ]
  };

  var GEN = { bonds: Bonds, placevalue: PlaceValue, fractions: Fractions, measures: Measures };
  var TOPICS = ['bonds', 'placevalue', 'fractions', 'measures'];
  var TOPIC_NAMES = { bonds: 'Number Bonds', placevalue: 'Place Value', fractions: 'Fractions', measures: 'Measures' };

  function genQuestion(topic, level, rng) {
    rng = rng || new RNG();
    var gens = GEN[topic][level];
    var idx = Math.floor(rng.next() * gens.length);
    return gens[idx](rng);
  }

  /* Rebuild a question from a stored fact id: "topic.level.genIdx.p1.p2..." */
  function regenerate(factId, rng) {
    rng = rng || new RNG();
    var parts = factId.split('.');
    var topic = parts[0], level = parseInt(parts[1], 10), idx = parseInt(parts[2], 10);
    var params = parts.slice(3).map(function (p) {
      return /^-?\d+$/.test(p) ? parseInt(p, 10) : p;
    });
    var gens = GEN[topic] && GEN[topic][level];
    if (!gens || !gens[idx]) return null;
    return gens[idx](rng, params);
  }

  function buildSession(store, focusTopic, rng) {
    rng = rng || new RNG();
    var list = [];
    function push(q, role) { if (q) { q.role = role; list.push(q); } }

    /* 1-2: warm-ups from secure material (or easiest level of focus topic). */
    var secureIds = [];
    TOPICS.forEach(function (t) {
      store.secureFactIds(t).forEach(function (id) { secureIds.push(id); });
    });
    rng.shuffle(secureIds).slice(0, 2).forEach(function (id) { push(regenerate(id, rng), 'warmup'); });
    while (list.length < 2) push(genQuestion(focusTopic, 1, rng), 'warmup');

    /* Next: requeued facts from last session (spaced repetition). */
    var rqAll = store.requeue();
    rqAll.slice(0, 2).forEach(function (id) { push(regenerate(id, rng), 'practice'); });
    store.saveRequeue(rqAll.slice(2));

    /* Fill to 11 with adaptive practice: mostly focus topic, some variety. */
    var topics = store.topics();
    var guard = 0;
    while (list.length < 11 && guard++ < 60) {
      var topic = rng.next() < 0.8 ? focusTopic : (focusTopic === 'bonds' ? 'placevalue' : 'bonds');
      push(genQuestion(topic, topics[topic].level, rng), 'practice');
    }

    /* 12: final question always from mastered material: end on a win. */
    var fin = null;
    var best = rng.shuffle(secureIds)[0];
    if (best) fin = regenerate(best, rng);
    if (!fin) fin = genQuestion(focusTopic, 1, rng);
    push(fin, 'final');

    return list;
  }

  /* Adaptive difficulty: up after 4 in a row correct, down after 2 wrong. */
  function applyResult(store, topic, correctFirstTry) {
    var topics = store.topics();
    var t = topics[topic];
    if (correctFirstTry) { t.cc += 1; t.cw = 0; }
    else { t.cw += 1; t.cc = 0; }
    if (t.cc >= 4 && t.level < 3) { t.level += 1; t.cc = 0; }
    if (t.cw >= 2 && t.level > 1) { t.level -= 1; t.cw = 0; }
    store.saveTopics(topics);
    return t.level;
  }

  (global.MRW = global.MRW || {});
  global.MRW.RNG = RNG;
  global.MRW.genQuestion = genQuestion;
  global.MRW.regenerate = regenerate;
  global.MRW.buildSession = buildSession;
  global.MRW.applyResult = applyResult;
  global.MRW.TOPICS = TOPICS;
  global.MRW.TOPIC_NAMES = TOPIC_NAMES;
})(typeof window !== 'undefined' ? window : globalThis);
