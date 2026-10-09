// ================================================================
//  CHOQUE DE HÉROES TCG — Service Worker v8.2
//  v8.2: las páginas HTML van RED-PRIMERO (con copia si no hay internet) y todas
//        las revalidaciones saltan la caché HTTP de GitHub Pages (max-age=600).
//        Antes una actualización tardaba 2 aperturas y hasta 10 min en verse.
//  v8.1: precache de la Simulación v17 (HTML, JSON de cartas, miniaturas).
//  v8: shell cache-first (instantáneo) + revalidación en segundo plano,
//      datos .json red-primero con timeout, fallbacks por tipo de archivo,
//      caché dinámica con límite de tamaño.
// ================================================================
const CACHE_NAME    = 'chh-tcg-v44';
const CACHE_DYNAMIC = 'chh-dynamic-v44';
const CACHE_MUSICA  = 'chh-musica-v1';   // pistas guardadas por musica.html (no se borra al actualizar)
const NET_TIMEOUT   = 3000;   // ms para datos .json antes de servir copia
const DYNAMIC_MAX   = 350;    // máx. entradas en caché dinámica (imágenes de cartas, etc.)

const CACHE_CORE = [
  './', './boot.html', './index.html', './calculadora.html',
  './perfil.html', './calendario.html', './constructor.html',
  './torneo-director.html', './noticias.html', './tienda.html',
  './ajustes.html', './intro.html', './intro_config.json',
  './manifest.json', './icon-192.png', './icon-512.png',
  './logo-hd.png', './footer-logo.png',
  './ranking.html', './coleccion.html', './settings.js', './bgm.js', './manual.js',
  './noticias.json', './comics.html', './lector.html', './comics_config.json'
];

// Simulación: HTML, datos y gráficos propios. Las imágenes de cartas salen de la
// Galería (cartas.json): la simulación las precarga al abrir y quedan en la caché dinámica.
const CACHE_SIM = [
  './simulacion.html',
  './data/cartas_simulacion.json',
  './cartas.json',
  './img/simulacion/reverso.jpg',
  './img/simulacion/logo.png',
  './img/simulacion/tablero.jpg'
];

// Backend dinámico: nunca pasa por el SW
const NO_CACHE_ORIGINS = ['script.google.com', 'script.googleusercontent.com', 'docs.google.com'];
// Fuentes: se cachean para no depender de Google en cada arranque
const FONT_ORIGINS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Cada archivo por separado: si uno falla, los demás sí se guardan
      Promise.allSettled([...CACHE_CORE, ...CACHE_SIM].map(url =>
        fetch(new Request(url, { cache: 'reload' }))
          .then(r => { if (r.ok) return cache.put(url, r); })
      ))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k !== CACHE_DYNAMIC && k !== CACHE_MUSICA).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CHECK_UPDATES') checkUpdates();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (NO_CACHE_ORIGINS.some(o => url.hostname.includes(o))) return;
  if (FONT_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Audio: siempre directo a la red (streaming con Range y descargas de musica.html)
  if (req.headers.has('range') || /\.(mp3|m4a|ogg|wav)$/i.test(url.pathname)) return;

  // Peticiones con cache-buster (?_t=) siempre van a red, con timeout
  if (url.searchParams.has('_t')) {
    event.respondWith(networkOnlyTimeout(req));
    return;
  }

  const path = url.pathname;
  if (/\.json$/i.test(path)) {
    // Datos: frescos si la red responde rápido, copia si no
    event.respondWith(networkFirstTimeout(req, 'json'));
  } else if (req.mode === 'navigate' || /\.html$/i.test(path) || path.endsWith('/')) {
    // Páginas: siempre la versión publicada si hay red (≤3 s); si no, la copia.
    event.respondWith(networkFirstTimeout(req, 'html'));
  } else if (/\.(js|css)$/i.test(path)) {
    // JS/CSS: desde caché al instante, se actualiza en segundo plano.
    event.respondWith(cacheFirstRevalidate(req));
  } else if (/\.(jpg|jpeg|png|gif|webp|svg|woff2?|ttf|mp3|pdf)$/i.test(path)) {
    event.respondWith(staleWhileRevalidate(req));
  } else {
    event.respondWith(networkFirstTimeout(req, 'other'));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      for (const c of list) { if ('focus' in c) { c.focus(); c.postMessage({ type:'NAVIGATE', url }); return; } }
      return clients.openWindow(url);
    })
  );
});

// ── Notificaciones ──
async function checkUpdates() {
  if (Notification.permission !== 'granted') return;
  try { await checkNoticias(); } catch(e) {}
  try { await checkTorneos(); } catch(e) {}
}

async function checkNoticias() {
  const res = await fetchTimeout('./noticias.json?_t=' + Date.now(), 8000);
  if (!res.ok) return;
  const noticias = await res.json();
  const db    = await openDB();
  const visto = await dbGet(db, 'last_noticia') || '';
  const primera = noticias[0];
  if (!primera || primera.titulo === visto) return;
  await dbSet(db, 'last_noticia', primera.titulo);
  await self.registration.showNotification('📰 Nueva noticia CHH', {
    body:    primera.titulo + '\n' + primera.resumen,
    icon:    './icon-192.png',
    badge:   './icon-192.png',
    tag:     'noticia',
    data:    { url: './noticias.html' },
    vibrate: [200, 100, 200]
  });
}

async function checkTorneos() {
  const API = 'https://script.google.com/macros/s/AKfycbxQwDgsNe-toSWetc2f-xkveQcywfGwOVQvsOEySgRc2z8YZG09mB20jUjrI9qO1yo9Uw/exec';
  const res  = await fetchTimeout(API + '?_t=' + Date.now(), 15000);
  if (!res.ok) return;
  const data = await res.json();
  const torneos = data.torneos || [];
  if (!torneos.length) return;
  const db       = await openDB();
  const vistoStr = await dbGet(db, 'last_torneos') || '[]';
  const vistos   = JSON.parse(vistoStr);
  const nuevos   = torneos.filter(t => !vistos.includes(t.storeid + '_' + t.tourname));
  if (!nuevos.length) return;
  await dbSet(db, 'last_torneos', JSON.stringify(torneos.map(t => t.storeid + '_' + t.tourname)));
  for (const t of nuevos.slice(0, 2)) {
    const lugar = [t.ciudad, t.estado].filter(Boolean).join(', ');
    await self.registration.showNotification('⚔️ Nuevo Torneo CHH', {
      body:    t.tourname + (lugar ? ' · ' + lugar : '') + '\n📅 ' + (t.date||'') + (t.time ? '  ' + t.time : ''),
      icon:    './icon-192.png',
      badge:   './icon-192.png',
      tag:     'torneo-' + t.tourname,
      data:    { url: './calendario.html' },
      vibrate: [200, 100, 200]
    });
  }
}

// ── IndexedDB helpers ──
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('chh-sw-db', 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore('kv');
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
  });
}
function dbGet(db, key) {
  return new Promise((res, rej) => {
    const r = db.transaction('kv','readonly').objectStore('kv').get(key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
function dbSet(db, key, val) {
  return new Promise((res, rej) => {
    const r = db.transaction('kv','readwrite').objectStore('kv').put(val, key);
    r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  });
}

// ── Utilidades de caché ──
function fetchTimeout(req, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

function timeout(ms) {
  return new Promise(res => setTimeout(() => res(null), ms));
}

// Busca primero en la dinámica (más reciente) y luego en el precache
async function matchAny(req, opts) {
  const dyn = await caches.open(CACHE_DYNAMIC);
  const d = await dyn.match(req, opts);
  if (d) return d;
  const core = await caches.open(CACHE_NAME);
  return core.match(req, opts);
}

let _putCount = 0;
async function putDynamic(req, res) {
  try {
    const cache = await caches.open(CACHE_DYNAMIC);
    await cache.put(req, res);
    // Recorte periódico para no llenar la cuota del teléfono
    if (++_putCount % 25 === 0) {
      const keys = await cache.keys();
      if (keys.length > DYNAMIC_MAX) {
        await Promise.all(keys.slice(0, keys.length - DYNAMIC_MAX).map(k => cache.delete(k)));
      }
    }
  } catch(e) { /* cuota llena u otro error: no rompe la respuesta */ }
}

// Respuesta de error acorde al tipo de archivo (nunca HTML dentro de un .js/.json)
function fallbackFor(req, kind) {
  const path = new URL(req.url).pathname;
  if (kind === 'json' || /\.json$/i.test(path))
    return new Response('{"status":"error","message":"sin_conexion"}', { status: 503, headers: { 'Content-Type': 'application/json' } });
  if (/\.js$/i.test(path))
    return new Response('/* sin conexión */', { status: 503, headers: { 'Content-Type': 'application/javascript' } });
  if (/\.css$/i.test(path))
    return new Response('', { status: 503, headers: { 'Content-Type': 'text/css' } });
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="background:#03050a;color:#e0eeff;font-family:sans-serif;text-align:center;padding:40px 20px">' +
    '<h2>Sin conexión</h2><p>Revisa tu internet y vuelve a intentarlo.</p>' +
    '<p><a href="./index.html" style="color:#f5a623">Volver al inicio</a></p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// ── Estrategias ──

// Shell: responde desde caché al instante y actualiza en segundo plano.
async function cacheFirstRevalidate(req) {
  const cached = await matchAny(req, { ignoreSearch: true });
  const netPromise = fetch(req, { cache: 'no-cache' }).then(r => {
    if (r && r.status === 200 && r.type === 'basic') putDynamic(req, r.clone());
    return r;
  }).catch(() => null);

  if (cached) return cached;

  const r = await Promise.race([netPromise, timeout(12000)]);
  if (r) return r;
  // Navegación sin copia: intenta el index cacheado antes de mostrar error
  if (req.mode === 'navigate') {
    const home = await matchAny('./index.html');
    if (home) return home;
  }
  return fallbackFor(req);
}

// Datos: red primero; si tarda más de NET_TIMEOUT y hay copia, sirve la copia.
async function networkFirstTimeout(req, kind) {
  const cached = await matchAny(req, { ignoreSearch: true });
  const netPromise = fetch(req, { cache: 'no-cache' }).then(r => {
    if (r && r.status === 200) putDynamic(req, r.clone());
    return r;
  }).catch(() => null);

  if (cached) {
    const r = await Promise.race([netPromise, timeout(NET_TIMEOUT)]);
    return (r && r.ok) ? r : cached;
  }
  const r = await Promise.race([netPromise, timeout(12000)]);
  if (r) return r;
  if (kind === 'html' && req.mode === 'navigate') {
    const home = await matchAny('./index.html');
    if (home) return home;
  }
  return fallbackFor(req, kind === 'html' ? undefined : kind);
}

async function networkOnlyTimeout(req) {
  try { return await fetchTimeout(req, 10000); }
  catch { return new Response('{}', { status: 504, headers: { 'Content-Type': 'application/json' } }); }
}

async function staleWhileRevalidate(req) {
  const c = await matchAny(req);
  const fp = fetch(req).then(r => {
    if (r && (r.status === 200 || r.type === 'opaque')) putDynamic(req, r.clone());
    return r;
  }).catch(() => null);
  if (c) return c;
  const r = await fp;
  return r || new Response('', { status: 504 });
}
