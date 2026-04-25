// Service Worker - Choque de Héroes TCG
const CACHE_NAME = 'chh-tcg-v4';

const urlsToCache = [
  './',
  './boot.html',
  './index.html',
  './calculadora.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// INSTALL — forzar skip waiting siempre
self.addEventListener('install', event => {
  console.log('[SW v4] Install');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache.map(url =>
        new Request(url, { cache: 'reload' })
      )))
      .catch(err => console.log('[SW] Cache parcial:', err))
  );
});

// ACTIVATE — borrar caches viejos y tomar control inmediato
self.addEventListener('activate', event => {
  console.log('[SW v4] Activate');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Borrando cache viejo:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Escuchar mensaje SKIP_WAITING desde el cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// FETCH — Network first, fallback a cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
