// Service Worker - Choque de Héroes TCG
const CACHE_NAME = 'chh-tcg-v2';

const urlsToCache = [
  './',
  './index.html',
  './calculadora.html',
  './reglamento.html',
  './registro-jugadores.html',
  './registro-tiendas.html',
  './publicar-torneo.html',
  './calendario.html',
  './ranking.html',
  './mapa-tiendas.html',
  './consulta-puntaje.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// INSTALL
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache.map(url => {
        return new Request(url, { cache: 'reload' });
      })))
      .then(() => self.skipWaiting())
      .catch(err => console.log('[SW] Cache error:', err))
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH - Network first, cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
