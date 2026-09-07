/* YADA — Service Worker.
   Stratégie : RÉSEAU D'ABORD pour les pages (toujours la dernière version quand
   on est en ligne), repli sur le cache hors-ligne. Cache-first pour les icônes. */
var CACHE = 'yada-v167';
var ASSETS = [
  './',
  './index.html',
  './yada-v1.html',
  './precompta.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isPage(req){
  if (req.mode === 'navigate') return true;
  var u = req.url || '';
  return /\.html(\?|$)/.test(u) || /\/$/.test(u);
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  /* version.json (vérification de mise à jour) : RÉSEAU SEULEMENT, jamais en cache */
  if (/version\.json(\?|$)/.test(req.url)) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(function () { return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }); }));
    return;
  }

  if (isPage(req)) {
    /* réseau d'abord : on récupère toujours la dernière version si possible */
    e.respondWith(
      fetch(req).then(function (resp) {
        try { var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } catch (err) {}
        return resp;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('./precompta.html'); });
      })
    );
    return;
  }

  /* autres ressources (icônes, manifeste) : cache d'abord, puis réseau */
  e.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (resp) {
        try { var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } catch (err) {}
        return resp;
      }).catch(function () { return new Response('', { status: 504, statusText: 'Hors-ligne' }); });
    })
  );
});
