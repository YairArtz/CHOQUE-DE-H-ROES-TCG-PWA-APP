// ═══════════════════════════════════════════════════════════════════════════
//  Íconos propios en lugar de emojis · Choque de Héroes
//  Lee assets/iconos/iconos.txt  (líneas  emoji = archivo  ·  ruta_xxx = archivo)
//  y cambia en pantalla cada emoji de la lista por tu imagen. Si una imagen no carga, regresa el emoji.
//  Sin líneas activas en iconos.txt no hace nada (cero costo).
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const DIR = 'assets/iconos/';
  const NO = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SELECT', 'TITLE', 'CANVAS', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE']);
  const MAPA = {}, ESPECIALES = {};
  let RE = null, listo = false, cbs = [];
  const VS = /️/g;
  const url = f => /^(https?:|\/|assets\/)/.test(f) ? f : DIR + f;
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function img(src, alt) {
    const i = document.createElement('img');
    i.className = 'chh-ico'; i.src = src; i.alt = alt; i.draggable = false; i.decoding = 'async';
    i.onerror = () => { const sp = document.createElement('span'); sp.className = 'chh-sin-iconos'; sp.textContent = alt.startsWith('⟪') ? '🎁' : alt; i.replaceWith(sp); };   // no existe la imagen: se queda el emoji
    return i;
  }
  // Cambia un nodo de texto por texto + imágenes
  function nodo(t) {
    const p = t.parentNode; if (!p || NO.has(p.nodeName) || (p.closest && p.closest('svg,[contenteditable],.chh-sin-iconos'))) return;
    const s = t.nodeValue; if (!s || !RE.test(s)) return; RE.lastIndex = 0;
    const fr = document.createDocumentFragment(); let k = 0, m;
    while ((m = RE.exec(s))) {
      if (m.index > k) fr.appendChild(document.createTextNode(s.slice(k, m.index)));
      if (m[1]) fr.appendChild(img(url(m[1]), m[0]));        // ⟪ico:archivo⟫ (objetos.txt con imagen)
      else { const e = m[0].replace(VS, ''); fr.appendChild(img(MAPA[e], e)); }
      k = m.index + m[0].length;
    }
    if (k < s.length) fr.appendChild(document.createTextNode(s.slice(k)));
    p.replaceChild(fr, t);
  }
  function barrer(raiz) {
    if (!raiz) return;
    if (raiz.nodeType === 3) return nodo(raiz);
    if (raiz.nodeType !== 1 || NO.has(raiz.nodeName)) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), L = [];
    while (w.nextNode()) L.push(w.currentNode);
    L.forEach(nodo);
  }
  function arrancar() {
    const emos = Object.keys(MAPA).sort((a, b) => b.length - a.length).map(e => escRe(e) + '\\uFE0F?');
    // siempre se reconocen los ⟪ico:archivo⟫ (iconos de objetos.txt), aunque no haya emojis activos
    RE = new RegExp('⟪ico:([^⟫]+)⟫' + (emos.length ? '|' + emos.join('|') : ''), 'gu');
    const st = document.createElement('style');
    // con !important y selector reforzado: reglas de la página como ".cb-c img{height:104px!important}" ya no estiran los íconos
    st.textContent = 'img.chh-ico.chh-ico.chh-ico{display:inline-block!important;height:1.15em!important;width:auto!important;min-width:0!important;min-height:0!important;max-width:1.6em!important;max-height:none!important;aspect-ratio:auto!important;vertical-align:-.22em!important;object-fit:contain!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;position:static!important;transform:none!important;pointer-events:none;user-select:none}';
    document.head.appendChild(st);
    const go = () => {
      barrer(document.body);
      new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') nodo(m.target); else m.addedNodes.forEach(barrer); } })
        .observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
  fetch(DIR + 'iconos.txt', { cache: 'no-cache' }).then(r => r.ok ? r.text() : '').catch(() => '').then(txt => {
    String(txt || '').split(/\r?\n/).forEach(l => {
      l = l.replace(/\s#.*$/, '').trim(); if (!l || l[0] === '#' || l[0] === '[') return;
      const i = l.indexOf('='); if (i < 1) return;
      const k = l.slice(0, i).trim().replace(VS, ''), v = l.slice(i + 1).trim(); if (!v) return;
      if (/^[a-z0-9_]+$/i.test(k)) ESPECIALES[k.toLowerCase()] = url(v); else MAPA[k] = url(v);
    });
    listo = true; cbs.forEach(f => { try { f(); } catch (e) {} }); cbs = [];
    arrancar();
  });
  window.CHH_ICONOS = {
    // íconos del motor de las rutas (ruta_mapa, ruta_orbe, ruta_carta, ruta_cofre, ruta_moneda_roja)
    ruta() { const o = {}; for (const k in ESPECIALES) if (k.startsWith('ruta_')) o[k.slice(5)] = ESPECIALES[k]; return o; },
    listo: f => listo ? f() : cbs.push(f),
    token: f => '⟪ico:' + f + '⟫'
  };
})();
