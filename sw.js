// Service Worker para Choque de Héroes TCG PWA
const CACHE_NAME = 'chh-tcg-v1';
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
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Instalación - cachea los archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación - limpia cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - estrategia Network First (intenta red primero, luego caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, clónala y guárdala en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intenta obtener del caché
        return caches.match(event.request);
      })
  );
});
