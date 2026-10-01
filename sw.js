/* Maths Masters service worker. Relative scope: caches everything the app needs. */
var CACHE = 'maths-masters-v24';
var FILES = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './js/store.js',
  './js/restore.js',
  './js/questions.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './art/lady-court-v3.svg',
  './art/lady-garden-v3.svg',
  './art/logo.svg',
  './art/lady-dress-1.svg',
  './art/lady-dress-2.svg',
  './art/lady-dress-3.svg',
  './art/lady-dress-4.svg',
  './art/lady-dress-5.svg',
  './art/lady-dress-6.svg',
  './art/lady-dress-7.svg',
  './art/lady-dress-8.svg',
  './art/lady-dress-9.svg',
  './art/lady-dress-10.svg',
  './art/lady-dress-11.svg',
  './art/lady-dress-12.svg',
  './art/lady-dress-13.svg',
  './art/lady-dress-14.svg',
  './art/lady-dress-15.svg',
  './art/lady-dress-16.svg',
  './art/lady-dress-17.svg',
  './art/lady-dress-18.svg',
  './art/lady-dress-19.svg',
  './art/lady-dress-20.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(event.request).then(function (res) {
        /* Only cache successful responses: never store a 404, or the
           missing file haunts the app even after it exists. */
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      });
    })
  );
});
