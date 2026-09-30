// ================================================================
//  CHOQUE DE HÉROES TCG — Service Worker v7.0
//  Fix: timeout de red, precache tolerante a fallos, fuentes en caché
// ================================================================
const CACHE_NAME    = 'chh-tcg-v34';
const CACHE_DYNAMIC = 'chh-dynamic-v34';
const NET_TIMEOUT   = 3000; // ms antes de servir desde caché si la red no responde

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

// Backend dinámico: nunca pasa por el SW
const NO_CACHE_ORIGINS = ['script.google.com', 'script.googleusercontent.com', 'docs.google.com'];
// Fuentes: se cachean para no depender de Google en cada arranque
const FONT_ORIGINS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Cada archivo por separado: si uno falla, los demás sí se guardan
      Promise.allSettled(CACHE_CORE.map(url =>
        fetch(new Request(url, { cache: 'reload' }))
          .then(r => { if (r.ok) return cache.put(url, r); })
      ))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k !== CACHE_DYNAMIC).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CHECK_UPDATES') checkUpdates();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (NO_CACHE_ORIGINS.some(o => url.hostname.includes(o))) return;
  if (FONT_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Peticiones con cache-buster (?_t=) siempre van a red, con timeout
  if (url.searchParams.has('_t')) {
    event.respondWith(networkOnlyTimeout(event.request));
    return;
  }

  const isShell = /\.(html|json|js)$/i.test(url.pathname) || url.pathname.endsWith('/');
  if (isShell) event.respondWith(networkFirstTimeout(event.request));
  else if (/\.(jpg|jpeg|png|gif|webp|svg|css|woff2?|ttf|mp3|pdf)$/i.test(url.pathname)) event.respondWith(staleWhileRevalidate(event.request));
  else event.respondWith(networkFirstTimeout(event.request));
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

// ── Estrategias de caché ──
function fetchTimeout(req, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

function timeout(ms) {
  return new Promise(res => setTimeout(() => res(null), ms));
}

// Red primero, pero si en NET_TIMEOUT no responde y hay copia en caché, sirve la copia.
// La descarga sigue en segundo plano y actualiza la caché para la próxima vez.
async function networkFirstTimeout(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  const netPromise = fetch(req).then(async r => {
    if (r && r.status === 200) (await caches.open(CACHE_DYNAMIC)).put(req, r.clone());
    return r;
  }).catch(() => null);

  if (cached) {
    const r = await Promise.race([netPromise, timeout(NET_TIMEOUT)]);
    return r || cached;
  }
  // Sin copia: esperar red, pero no para siempre
  const r = await Promise.race([netPromise, timeout(15000)]);
  return r || new Response('<h1>Sin conexión</h1><p>Revisa tu internet y vuelve a abrir la app.</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function networkOnlyTimeout(req) {
  try { return await fetchTimeout(req, 10000); }
  catch { return new Response('{}', { status: 504, headers: { 'Content-Type': 'application/json' } }); }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const c = await caches.match(req);
  const fp = fetch(req).then(r => {
    if (r && (r.status === 200 || r.type === 'opaque')) cache.put(req, r.clone());
    return r;
  }).catch(() => null);
  if (c) return c;
  const r = await fp;
  return r || new Response('', { status: 504 });
}
