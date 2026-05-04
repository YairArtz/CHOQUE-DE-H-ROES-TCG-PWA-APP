// ================================================================
//  CHOQUE DE HÉROES TCG — Service Worker v6
//  Con notificaciones locales de noticias y torneos
// ================================================================
const CACHE_NAME    = 'chh-tcg-v6';
const CACHE_DYNAMIC = 'chh-dynamic-v6';

const CACHE_CORE = [
  './', './boot.html', './index.html', './calculadora.html',
  './perfil.html', './calendario.html', './constructor.html',
  './torneo-director.html', './noticias.html',
  './manifest.json', './icon-192.png', './icon-512.png',
  './settings.js', './noticias.json'
];

const NO_CACHE_ORIGINS = ['script.google.com','docs.google.com','fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_CORE.map(url => new Request(url, { cache: 'reload' }))))
      .catch(err => console.warn('[SW] Cache parcial:', err))
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
  if (url.origin !== self.location.origin) return;
  const isCore = CACHE_CORE.some(f => url.pathname.endsWith(f.replace('./','/')) || url.pathname === '/');
  if (isCore) event.respondWith(cacheFirst(event.request));
  else if (/\.(jpg|jpeg|png|gif|webp|svg|css|woff2?|ttf)$/i.test(url.pathname)) event.respondWith(staleWhileRevalidate(event.request));
  else event.respondWith(networkFirst(event.request));
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

async function checkUpdates() {
  if (Notification.permission !== 'granted') return;
  try { await checkNoticias(); } catch(e) {}
  try { await checkTorneos(); } catch(e) {}
}

async function checkNoticias() {
  const res = await fetch('./noticias.json?_t=' + Date.now());
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
  const res  = await fetch(API + '?_t=' + Date.now());
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

// IndexedDB helpers
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

// Cache strategies
async function cacheFirst(req) {
  const c = await caches.match(req); if (c) return c;
  try { const r = await fetch(req); if (r?.status===200) (await caches.open(CACHE_NAME)).put(req,r.clone()); return r; }
  catch { return new Response('<h1>Sin conexión</h1>',{headers:{'Content-Type':'text/html'}}); }
}
async function staleWhileRevalidate(req) {
  const cache=await caches.open(CACHE_DYNAMIC), c=await cache.match(req);
  const fp=fetch(req).then(r=>{if(r?.status===200)cache.put(req,r.clone());return r;}).catch(()=>null);
  return c||await fp;
}
async function networkFirst(req) {
  try { const r=await fetch(req); if(r?.status===200)(await caches.open(CACHE_DYNAMIC)).put(req,r.clone()); return r; }
  catch { return await caches.match(req)||new Response('Sin conexión',{status:503}); }
}
