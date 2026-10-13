// ════════════════════════════════════════════════════════════════════
//  MEDIOS SIN CONEXIÓN — sonidos, música, micas, playmats y arte del Arcade
//  Lo usan simulacion.html y arcade.html.
//
//  · Todo lo descargado vive en el dispositivo (Cache Storage) y NO se borra al
//    actualizar la app:
//      "chh-musica-v1"  → canciones (la misma caché que usa musica.html)
//      "chh-medios-v1"  → efectos de sonido, micas, playmats y arte del Arcade
//  · Si un archivo no existe en el repositorio (404), se ignora y la página usa lo
//    que trae por defecto (sonidos sintetizados, reverso/tablero clásicos, etc.).
//  · La música (archivos pesados) solo se descarga sola con Wi-Fi o datos
//    ilimitados; con "ahorro de datos" o 2G/3G espera a que la pidas.
//    Se puede desactivar con localStorage "chh_medios_auto" = "0".
// ════════════════════════════════════════════════════════════════════
(function () {
  const C_MED = 'chh-medios-v1', C_MUS = 'chh-musica-v1';
  const abs = u => new URL(u, location.href).href;
  const esAudio = u => /\.(mp3|m4a|ogg|wav|aac|opus)(\?|$)/i.test(u);
  const cacheDe = u => esAudio(u) && !/\/assets\/audio\/sfx\//.test(abs(u)) ? C_MUS : C_MED;
  const ok = () => 'caches' in window;
  const NO = new Set();          // URLs que dieron 404 en esta sesión (no se reintentan)
  const blobs = {};              // url → blob: URL (para <audio>)

  async function buscar(u) {
    if (!ok()) return null;
    const k = abs(u);
    try {
      for (const n of [cacheDe(k), C_MUS, C_MED]) {
        const r = await (await caches.open(n)).match(k);
        if (r) return r;
      }
    } catch (e) {}
    return null;
  }
  async function tiene(u) { return !!(await buscar(u)); }

  // Descarga un archivo y lo guarda (si ya está, no hace nada). Devuelve true si quedó guardado.
  async function bajar(u, ms) {
    if (!u || !ok()) return false;
    const k = abs(u);
    if (NO.has(k)) return false;
    if (await buscar(k)) return true;
    if (!navigator.onLine) return false;
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), ms || 120000);
    try {
      const r = await fetch(k, { cache: 'no-cache', signal: ctrl.signal });
      if (!r.ok) { NO.add(k); return false; }
      const tipo = r.headers.get('content-type') || '';
      if (/text\/html/i.test(tipo)) { NO.add(k); return false; }   // página de error de GitHub
      await (await caches.open(cacheDe(k))).put(k, r);
      return true;
    } catch (e) { return false; }
    finally { clearTimeout(t); }
  }

  // Bytes de un archivo: del dispositivo primero; si no está, de la red (y se guarda)
  async function bytes(u) {
    let r = await buscar(u);
    if (!r && await bajar(u, 30000)) r = await buscar(u);
    if (!r) return null;
    try { return await r.clone().arrayBuffer(); } catch (e) { return null; }
  }

  // URL reproducible para <audio>: blob: si está descargado, si no null
  async function blobUrl(u) {
    if (!u) return null;
    const k = abs(u);
    if (blobs[k]) return blobs[k];
    const r = await buscar(k);
    if (!r) return null;
    try { const b = await r.blob(); if (!b || !b.size) return null; blobs[k] = URL.createObjectURL(b); return blobs[k]; }
    catch (e) { return null; }
  }

  function puedeAuto() {
    try { if (localStorage.getItem('chh_medios_auto') === '0') return false; } catch (e) {}
    const c = navigator.connection;
    if (c && (c.saveData || /(2g|3g)$/.test(c.effectiveType || '') || c.type === 'cellular')) return false;
    return true;
  }
  function setAuto(v) { try { localStorage.setItem('chh_medios_auto', v ? '1' : '0'); } catch (e) {} }

  // Descarga una lista (de 2 en 2). onProg(hechos, total, guardados)
  const _activas = {};
  async function lista(urls, onProg, clave) {
    urls = [...new Set((urls || []).filter(Boolean).map(abs))];
    if (clave && _activas[clave]) return _activas[clave];
    const run = (async () => {
      let hechos = 0, guardados = 0, i = 0;
      const worker = async () => {
        while (i < urls.length) {
          const u = urls[i++];
          if (await bajar(u)) guardados++;
          hechos++;
          try { onProg && onProg(hechos, urls.length, guardados); } catch (e) {}
        }
      };
      await Promise.all([worker(), worker()]);
      return { total: urls.length, guardados };
    })();
    if (clave) { _activas[clave] = run; run.finally(() => { delete _activas[clave]; }); }
    return run;
  }
  async function cuantos(urls) {
    urls = [...new Set((urls || []).filter(Boolean).map(abs))];
    let n = 0; for (const u of urls) if (await tiene(u)) n++;
    return { n, total: urls.length };
  }
  async function borrar() {
    if (!ok()) return;
    try { await caches.delete(C_MED); } catch (e) {}
    try { await caches.delete(C_MUS); } catch (e) {}
    Object.values(blobs).forEach(b => { try { URL.revokeObjectURL(b); } catch (e) {} });
    Object.keys(blobs).forEach(k => delete blobs[k]);
  }
  async function espacio() {
    try { const e = await navigator.storage.estimate(); return e; } catch (e) { return null; }
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}

  window.CHH_MEDIOS = { bajar, bytes, blobUrl, tiene, lista, cuantos, borrar, espacio, puedeAuto, setAuto, abs, C_MED, C_MUS };
})();
