/**
 * sw.js — Service Worker DJfilm
 * Stratégie : Cache-first pour les assets statiques, Network-first pour les pages
 */

const CACHE_NAME = 'djfilm-v1';

const PRECACHE_ASSETS = [
  '/',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/images/Logo_128.webp',
  '/assets/images/Logo_256.webp',
  '/assets/images/Logo_512.webp',
  '/manifest.json',
  '/offline/'
];

/* ── Installation : mise en cache des assets essentiels ── */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS.map(function(url) {
        return new Request(url, { cache: 'reload' });
      })).catch(function() {
        // On ignore les erreurs sur les assets optionnels
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ── Activation : suppression des anciens caches ── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ── Fetch : Network-first pour les pages HTML, Cache-first pour les assets ── */
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Ignorer les requêtes non-GET et les ressources externes
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  var isHTML = event.request.headers.get('Accept') &&
               event.request.headers.get('Accept').includes('text/html');

  if (isHTML) {
    // Network-first pour les pages
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match('/offline/');
          });
        })
    );
  } else {
    // Cache-first pour les assets statiques
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
  }
});
