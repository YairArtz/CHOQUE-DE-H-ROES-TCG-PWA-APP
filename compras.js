// ════════════════════════════════════════════════════════════════════
//  COMPRAS — contenido premium que tiene el jugador (DLC, micas, playmats, héroes…)
//  Lo usan tienda.html, nexotlan.html y cualquier módulo que tenga contenido de pago.
//
//  De dónde sale:
//   · La lista OFICIAL vive en la hoja "Compras" del Apps Script de Hero Pesos
//     (se llena al canjear un código CDH o al pagar con Mercado Pago).
//   · Aquí se guarda en caché (localStorage "chh_compras") para jugar sin red.
//
//  Cómo se liga el contenido a un producto: con su SKU (columna A de "Productos_Digitales").
//   En los .txt de cada módulo escribe  dlc = sku_del_producto  en lo que quieras volver de pago.
//
//  API:
//   CHH_COMPRAS.tiene('dlc_catacumbas')   → true / false (al instante, desde la caché)
//   CHH_COMPRAS.lista()                   → ['dlc_catacumbas', …]
//   CHH_COMPRAS.sincronizar()             → Promise<lista> (pregunta al servidor; sin red usa la caché)
//   CHH_COMPRAS.guardar(lista)            → reemplaza la caché (la tienda lo usa tras comprar)
//   CHH_COMPRAS.alCambiar(fn)             → fn(lista) cuando la lista cambia (también entre pestañas)
//   CHH_COMPRAS.irATienda(sku)            → abre la Tienda en la sección Premium
// ════════════════════════════════════════════════════════════════════
(function () {
  if (window.CHH_COMPRAS) return;
  const HP_URL = ((window.CHH_CONFIG || {}).heroPesos || 'https://script.google.com/macros/s/AKfycbwSrBH7yJiyTlPabzJ_WiXQDWPe7RpATmuTTWAe3uVRy6wuGh15QpuOMzSiZVixJK_S/exec');
  const K = 'chh_compras', VIGENCIA = 10 * 60 * 1000;   // tras 10 min se vuelve a preguntar al servidor
  const fns = [];

  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function sesionId() {
    const s = ls.get('nhSesion', null);
    return s && s.tipo !== 'tienda' && s.id ? String(s.id).trim().toUpperCase() : null;
  }
  const norm = L => [...new Set((Array.isArray(L) ? L : []).map(x => String(x || '').trim().toLowerCase()).filter(Boolean))].sort();
  function cache() {
    const c = ls.get(K, null), yo = sesionId();
    return c && yo && String(c.id || '').toUpperCase() === yo && Array.isArray(c.skus) ? c : { id: yo, skus: [], t: 0 };
  }
  function lista() { return cache().skus.slice(); }
  function tiene(sku) { sku = String(sku || '').trim().toLowerCase(); return !!sku && cache().skus.indexOf(sku) >= 0; }
  function avisar(L) { fns.forEach(f => { try { f(L.slice()); } catch (e) {} }); }
  function guardar(L) {
    const yo = sesionId(); if (!yo) return [];
    const antes = cache().skus.join(','), nueva = norm(L);
    ls.set(K, { id: yo, skus: nueva, t: Date.now() });
    if (antes !== nueva.join(',')) avisar(nueva);
    return nueva;
  }

  let _sync = null;
  function sincronizar(forzar) {
    const yo = sesionId();
    if (!yo || !navigator.onLine) return Promise.resolve(lista());
    if (!forzar && Date.now() - (cache().t || 0) < VIGENCIA) return Promise.resolve(lista());
    if (_sync) return _sync;
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 12000);
    _sync = fetch(HP_URL + '?action=mis_compras&playerid=' + encodeURIComponent(yo) + '&nx_silencio=1', { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => (d && d.status === 'ok' && Array.isArray(d.compras)) ? guardar(d.compras) : lista())
      .catch(() => lista())
      .finally(() => { clearTimeout(t); _sync = null; });
    return _sync;
  }
  function alCambiar(fn) { if (typeof fn === 'function') fns.push(fn); }
  function irATienda(sku) { location.href = 'tienda.html?sec=premium' + (sku ? '&sku=' + encodeURIComponent(sku) : ''); }

  // Otra pestaña (p. ej. la Tienda) actualizó la lista
  window.addEventListener('storage', e => { if (e.key === K) avisar(lista()); });

  window.CHH_COMPRAS = { tiene, lista, sincronizar, guardar, alCambiar, irATienda, sesionId };
})();
