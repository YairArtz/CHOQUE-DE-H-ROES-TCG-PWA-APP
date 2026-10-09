// ================================================================
//  CHOQUE DE HÉROES TCG — Service Worker v9.4
//  v9.4: · Se quitan los topes de tiempo de imágenes (10 s) y audio (60 s): el
//          reloj corría desde que la petición entraba a la cola del navegador, así
//          que en datos móviles las imágenes y pistas formadas se cancelaban antes
//          de empezar a descargar (imágenes rotas, canciones que no cargaban).
//        · Revalidación en segundo plano limitada: cada HTML/JS/catálogo se revisa
//          con la red como máximo cada 2 min, no en cada navegación. Menos
//          peticiones compitiendo con imágenes y audio en red móvil.
//  v9.3: imágenes sin copia con tope de 10 s (no bloquean el 'load' de la página).
//  v9.2: FIX "Sin conexión" al entrar a módulos. Chrome lanza un TypeError con
//        fetch(peticionDeNavegacion, {cache:'no-cache'}) ("Request whose mode is
//        'navigate' and a non-empty RequestInit"). Ese error se tomaba como falta de
//        red: las páginas sin copia mostraban "Sin conexión" y las páginas con copia
//        nunca se actualizaban. Ahora las navegaciones se piden por URL (netFetch).
//  v9.1: · Audio: el SW descarga la pista COMPLETA con fetch() y la sirve desde
//          caché por rangos. Nunca se deja el audio al reproductor nativo: desde v8
//          (cuando el audio dejó de pasar por el SW) dejó de sonar en datos móviles.
//        · HTML: caché al instante + revalidación en segundo plano (como v8.0).
//          La versión nueva se ve en la siguiente navegación, sin esperar a la red.
//        · Precache con cache:'no-cache' (revalida con ETag): al subir CACHE_NAME
//          solo se descargan los archivos que cambiaron, no los ~4 MB completos.
//  v9:  · Audio: se sirve desde caché con soporte de Range (206). La primera vez
//         va directo a la red y se descarga completo en segundo plano; desde la
//         segunda reproducción carga al instante, también en datos móviles.
//       · Imágenes y PDFs: caché-primero SIN revalidar (antes cada imagen se volvía
//         a descargar en cada visita y saturaba la red móvil).
//       · Imágenes y audio viven en cachés estables que NO se borran al subir
//         CACHE_NAME (antes cada deploy obligaba a re-descargar todo).
//       · HTML: red-primero con timeout de 1.5 s (antes 3 s).
//       · Catálogos JSON pesados (cartas.json, etc.): caché al instante y
//         actualización en segundo plano.
//  v8.2: HTML red-primero, revalidaciones saltan la caché HTTP de GitHub Pages.
//  v8.1: precache de la Simulación v17.
//  v8:   shell cache-first + revalidación, JSON red-primero, fallbacks por tipo.
// ================================================================
const CACHE_NAME    = 'chh-tcg-v54';
const CACHE_DYNAMIC = 'chh-dynamic-v54';
const CACHE_IMG     = 'chh-img-v1';      // estable: imágenes, fuentes y PDFs. Subir SOLO si reemplazas imágenes con el mismo nombre
const CACHE_AUDIO   = 'chh-audio-v1';    // estable: pistas de bgm.js. Subir SOLO si reemplazas un .mp3 con el mismo nombre
const CACHE_MUSICA  = 'chh-musica-v1';   // pistas guardadas por musica.html (no se borra al actualizar)
const KEEP_CACHES   = [CACHE_NAME, CACHE_DYNAMIC, CACHE_IMG, CACHE_AUDIO, CACHE_MUSICA];

const NET_TIMEOUT   = 2500;   // ms para datos .json antes de servir copia
const REVALIDATE_EVERY = 120000;  // ms mínimos entre revalidaciones de un mismo archivo
const DYNAMIC_MAX   = 200;    // máx. entradas en caché dinámica (html/json/js)
const IMG_MAX       = 800;    // máx. entradas en caché de imágenes (480+ cartas + sobres + banners)

// JSON de catálogo: cambian poco y pesan mucho → caché al instante + revalidación
const CATALOG_JSON = /(cartas\.json|cartas_simulacion\.json|comics_config\.json|intro_config\.json)$/i;

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

const CACHE_SIM = [
  './simulacion.html',
  './data/cartas_simulacion.json',
  './cartas.json',
  './img/simulacion/reverso.jpg',
  './img/simulacion/logo.png',
  './img/simulacion/tablero.jpg'
];

const NO_CACHE_ORIGINS = ['script.google.com', 'script.googleusercontent.com', 'docs.google.com'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled([...CACHE_CORE, ...CACHE_SIM].map(url =>
        fetch(new Request(url, { cache: 'no-cache' }))
          .then(r => { if (r.ok) return cache.put(url, r); })
      ))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !KEEP_CACHES.includes(k)).map(k => caches.delete(k))))
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

  // Fuentes: los .woff2 de gstatic son inmutables → caché-primero; el CSS se revalida
  if (url.hostname.includes('fonts.gstatic.com')) { event.respondWith(cacheFirst(req)); return; }
  if (url.hostname.includes('fonts.googleapis.com')) { event.respondWith(staleWhileRevalidate(req)); return; }

  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // Audio: caché con soporte de Range; la primera vez, red + descarga en segundo plano
  if (/\.(mp3|m4a|ogg|wav)$/i.test(path)) {
    event.respondWith(audioResponse(event, req));
    return;
  }

  // Otras peticiones parciales (PDF.js pide rangos del PDF): directo a la red
  if (req.headers.has('range')) return;

  if (url.searchParams.has('_t')) {
    event.respondWith(networkOnlyTimeout(req));
    return;
  }

  if (/\.json$/i.test(path)) {
    event.respondWith(CATALOG_JSON.test(path) ? cacheFirstRevalidate(req) : networkFirstTimeout(req, 'json', NET_TIMEOUT));
  } else if (req.mode === 'navigate' || /\.html$/i.test(path) || path.endsWith('/')) {
    event.respondWith(cacheFirstRevalidate(req, true));
  } else if (/\.(js|css)$/i.test(path)) {
    event.respondWith(cacheFirstRevalidate(req));
  } else if (/\.(jpg|jpeg|png|gif|webp|svg|woff2?|ttf|pdf)$/i.test(path)) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirstTimeout(req, 'other', NET_TIMEOUT));
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

// Petición a red saltando la caché HTTP de GitHub Pages (max-age=600).
// Las navegaciones NO aceptan RequestInit en Chrome: se piden por URL.
function netFetch(req) {
  if (req.mode === 'navigate') {
    return fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(r => (r.redirected ? Response.redirect(r.url, 302) : r))
      .catch(() => fetch(req));   // último intento: la petición original tal cual
  }
  return fetch(req, { cache: 'no-cache' }).catch(() => fetch(req));
}

function timeout(ms) {
  return new Promise(res => setTimeout(() => res(null), ms));
}

// HTML/JSON/JS: primero la dinámica (más reciente), luego el precache
async function matchAny(req, opts) {
  const dyn = await caches.open(CACHE_DYNAMIC);
  const d = await dyn.match(req, opts);
  if (d) return d;
  const core = await caches.open(CACHE_NAME);
  return core.match(req, opts);
}

const _putCounts = {};
async function putLimited(cacheName, max, req, res) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(req, res);
    _putCounts[cacheName] = (_putCounts[cacheName] || 0) + 1;
    if (_putCounts[cacheName] % 25 === 0) {
      const keys = await cache.keys();
      if (keys.length > max) {
        await Promise.all(keys.slice(0, keys.length - max).map(k => cache.delete(k)));
      }
    }
  } catch(e) { /* cuota llena u otro error: no rompe la respuesta */ }
}
function putDynamic(req, res) { return putLimited(CACHE_DYNAMIC, DYNAMIC_MAX, req, res); }

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

// HTML/JS/CSS/catálogos: caché al instante, se actualiza en segundo plano.
const _lastCheck = new Map();   // url → última revalidación (se reinicia si el SW duerme)

async function cacheFirstRevalidate(req, isPage) {
  const cached = await matchAny(req, { ignoreSearch: true });
  const key = req.url.split('?')[0];

  // Con copia y revisado hace poco: no se toca la red
  if (cached && Date.now() - (_lastCheck.get(key) || 0) < REVALIDATE_EVERY) return cached;
  _lastCheck.set(key, Date.now());

  const netPromise = netFetch(req).then(r => {
    if (r && r.status === 200 && r.type === 'basic') putDynamic(req, r.clone());
    return r;
  }).catch(() => { _lastCheck.delete(key); return null; });

  if (cached) return cached;

  const r = await Promise.race([netPromise, timeout(12000)]);
  if (r) return r;
  if (isPage && req.mode === 'navigate') {
    const home = await matchAny('./index.html');
    if (home) return home;
  }
  return fallbackFor(req);
}

// Páginas y datos: red primero; si tarda más de `ms` y hay copia, sirve la copia.
async function networkFirstTimeout(req, kind, ms) {
  const cached = await matchAny(req, { ignoreSearch: true });
  const netPromise = netFetch(req).then(r => {
    if (r && r.status === 200) putDynamic(req, r.clone());
    return r;
  }).catch(() => null);

  if (cached) {
    const r = await Promise.race([netPromise, timeout(ms)]);
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

// Imágenes, fuentes y PDFs: si está en caché se usa sin volver a descargar.
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const r = await fetch(req);
    if (r && (r.status === 200 || r.type === 'opaque')) putLimited(CACHE_IMG, IMG_MAX, req, r.clone());
    return r;
  } catch(e) {
    return new Response('', { status: 504 });
  }
}

async function networkOnlyTimeout(req) {
  try { return await fetchTimeout(req, 10000); }
  catch { return new Response('{}', { status: 504, headers: { 'Content-Type': 'application/json' } }); }
}

async function staleWhileRevalidate(req) {
  const c = await caches.match(req);
  const fp = fetch(req).then(r => {
    if (r && (r.status === 200 || r.type === 'opaque')) putLimited(CACHE_IMG, IMG_MAX, req, r.clone());
    return r;
  }).catch(() => null);
  if (c) return c;
  const r = await fp;
  return r || new Response('', { status: 504 });
}

// ── Audio ──
// El SW descarga la pista completa (fetch normal, igual que JSON o imágenes, que sí
// funcionan en datos móviles), la guarda en CACHE_AUDIO y responde cada rango que
// pide el reproductor desde memoria. Si la descarga falla, cae a la red directa.
const _audioPending = new Map();   // url → Promise<{buf,type}|null> (evita descargas dobles)
const _audioMem     = new Map();   // url → {buf,type}  (máx. 2 pistas en memoria)

function memPut(key, entry) {
  _audioMem.delete(key);
  _audioMem.set(key, entry);
  while (_audioMem.size > 2) _audioMem.delete(_audioMem.keys().next().value);
}

async function getAudioEntry(key) {
  if (_audioMem.has(key)) return _audioMem.get(key);

  const cached = await caches.match(key, { ignoreSearch: true, ignoreVary: true });
  if (cached && cached.status === 200) {
    const entry = { buf: await cached.arrayBuffer(), type: cached.headers.get('Content-Type') || 'audio/mpeg' };
    memPut(key, entry);
    return entry;
  }

  if (!_audioPending.has(key)) {
    _audioPending.set(key, downloadAudio(key).finally(() => _audioPending.delete(key)));
  }
  return _audioPending.get(key);
}

async function downloadAudio(key) {
  try {
    const r = await fetch(key);
    if (!r || r.status !== 200) return null;
    const type = r.headers.get('Content-Type') || 'audio/mpeg';
    const buf  = await r.arrayBuffer();
    if (!buf.byteLength) return null;
    const entry = { buf, type };
    memPut(key, entry);
    try {
      const c = await caches.open(CACHE_AUDIO);
      await c.put(key, new Response(buf.slice(0), { status: 200, headers: {
        'Content-Type': type, 'Content-Length': String(buf.byteLength)
      }}));
    } catch(e) { /* cuota: igual se sirve desde memoria */ }
    return entry;
  } catch(e) {
    return null;
  }
}

async function audioResponse(event, req) {
  const key = req.url.split('#')[0].split('?')[0];
  const range = req.headers.get('range');
  try {
    const entry = await getAudioEntry(key);
    if (entry) return rangeResponse(entry.buf, entry.type, range);
  } catch(e) {}
  // Último recurso: red directa
  try { return await fetch(req); }
  catch(e) { return new Response('', { status: 504 }); }
}

function rangeResponse(buf, type, range) {
  const total = buf.byteLength;
  if (!range) {
    return new Response(buf, { status: 200, headers: {
      'Content-Type': type, 'Content-Length': String(total), 'Accept-Ranges': 'bytes'
    }});
  }
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let start = 0, end = total - 1;
  if (m) {
    if (m[1] === '' && m[2] !== '') { start = Math.max(0, total - parseInt(m[2], 10)); }
    else {
      if (m[1] !== '') start = parseInt(m[1], 10);
      if (m[2] !== '') end = Math.min(parseInt(m[2], 10), total - 1);
    }
  }
  if (start >= total || start > end) {
    return new Response('', { status: 416, headers: { 'Content-Range': 'bytes */' + total } });
  }
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': type,
    'Content-Length': String(end - start + 1),
    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
    'Accept-Ranges': 'bytes'
  }});
}
