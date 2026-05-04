// ================================================================
//  CHOQUE DE HÉROES TCG — Service Worker v5
// ================================================================
const CACHE_NAME    = 'chh-tcg-v5';
const CACHE_DYNAMIC = 'chh-dynamic-v5';

// Archivos core — se cachean en install (offline garantizado)
const CACHE_CORE = [
  './',
  './boot.html',
  './index.html',
  './calculadora.html',
  './perfil.html',
  './calendario.html',
  './constructor.html',
  './torneo-director.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './settings.js'
];

// Orígenes externos que NUNCA se cachean (APIs en vivo)
const NO_CACHE_ORIGINS = [
  'script.google.com',
  'docs.google.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW v5] Install');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(
        CACHE_CORE.map(url => new Request(url, { cache: 'reload' }))
      ))
      .catch(err => console.warn('[SW] Cache parcial en install:', err))
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW v5] Activate');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_DYNAMIC)
          .map(k => { console.log('[SW] Borrando:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

// ── MESSAGE ───────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── FETCH ─────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // APIs externas — solo red, nunca cache
  if (NO_CACHE_ORIGINS.some(o => url.hostname.includes(o))) return;

  // Solo manejar mismo origen
  if (url.origin !== self.location.origin) return;

  // Archivos HTML y JS core — Cache first, red como fallback
  const isCoreFile = CACHE_CORE.some(f => url.pathname.endsWith(f.replace('./', '/')));
  if (isCoreFile) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Assets (imágenes, CSS, fuentes locales) — Cache first con actualización en background
  if (/\.(jpg|jpeg|png|gif|webp|svg|css|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Todo lo demás — Network first, cache como fallback
  event.respondWith(networkFirst(event.request));
});

// ── ESTRATEGIAS ───────────────────────────────────────────────────

// Cache first: sirve desde cache, si no hay va a red y cachea
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response?.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('<h1>Sin conexión</h1><p>Esta página no está disponible offline.</p>',
      { headers: { 'Content-Type': 'text/html' } });
  }
}

// Stale while revalidate: sirve cache inmediato, actualiza en background
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_DYNAMIC);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response?.status === 200) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || await fetchPromise;
}

// Network first: intenta red, fallback a cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response?.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Sin conexión', { status: 503 });
  }
}
