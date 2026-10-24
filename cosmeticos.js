// ════════════════════════════════════════════════════════════════════
//  COSMÉTICOS — micas (reverso de cartas), playmats (tablero) y héroes del menú principal
//  Lo usan simulacion.html, arcade.html y tienda.html.
//
//  De dónde salen:
//   · Clásicos: el reverso y el tablero de siempre (siempre disponibles).
//   · Recompensas por logro: data/cosmeticos.json (campo "logro"). Cada logro del Arcade
//     tiene una mica y un playmat: assets/cosmeticos/micas/<clave>.jpg y
//     assets/cosmeticos/playmats/<clave>.jpg (ej. arc_campeon.jpg).
//   · Tienda: filas de Packs_Config con tipo "mica" o "playmat" (precio en HP).
//     Lo comprado se guarda en la hoja "Cosmeticos" del Apps Script de Hero Pesos
//     y aquí en caché (localStorage "chh_cosmeticos") para jugar sin red.
//
//   · Héroes del menú (tipo "heroe"): los de assets/inicio/heroes.txt vienen incluidos;
//     los de la Tienda son filas de Packs_Config con tipo "heroe" (D=imagen, E=subtítulo).
//     Imágenes en assets/inicio/heroes/. index.html los muestra; el equipado sale primero.
//
//  Una opción solo aparece si su imagen existe (así puedes publicar el catálogo
//  antes de terminar el arte).
// ════════════════════════════════════════════════════════════════════
(function () {
  const HP_URL   = 'https://script.google.com/macros/s/AKfycbwSrBH7yJiyTlPabzJ_WiXQDWPe7RpATmuTTWAe3uVRy6wuGh15QpuOMzSiZVixJK_S/exec';
  const CARPETA  = { mica: 'assets/cosmeticos/micas/', playmat: 'assets/cosmeticos/playmats/', heroe: 'assets/inicio/heroes/' };
  const CLASICO  = {
    mica:    { id: 'mica_clasica',    tipo: 'mica',    nombre: 'Clásica', img: 'img/simulacion/reverso.jpg', origen: 'clasico' },
    playmat: { id: 'playmat_clasico', tipo: 'playmat', nombre: 'Clásico', img: 'img/simulacion/tablero.jpg', origen: 'clasico' }
  };
  const K_CACHE = 'chh_cosmeticos', K_EQUIP = 'chh_equip_';

  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function sesionId() {
    const s = ls.get('nhSesion', null);
    return s && s.tipo !== 'tienda' && s.id ? String(s.id).trim().toUpperCase() : null;
  }
  function ruta(tipo, img) {
    img = String(img || '').trim();
    if (!img) return '';
    return /^(https?:|data:|\.\/|\/)/.test(img) || img.indexOf('/') >= 0 ? img : (CARPETA[tipo] || '') + img;
  }
  // Cada imagen se revisa una sola vez por página (el catálogo tiene muchas opciones aún sin arte)
  const _prob = {};
  function probar(u) {
    if (!u) return Promise.resolve(false);
    if (!_prob[u]) _prob[u] = new Promise(res => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = u; });
    return _prob[u];
  }

  // ── Catálogo de recompensas (data/cosmeticos.json) ──
  let _cat = null;
  async function catalogo() {
    if (_cat) return _cat;
    try {
      const r = await fetch('data/cosmeticos.json', { cache: 'no-cache' });
      const j = r.ok ? await r.json() : {};
      const L = [];
      (j.micas || []).forEach(x => x && x.id && L.push(Object.assign({ tipo: 'mica' }, x)));
      (j.playmats || []).forEach(x => x && x.id && L.push(Object.assign({ tipo: 'playmat' }, x)));
      L.forEach(x => { x.img = ruta(x.tipo, x.img); x.origen = x.logro ? 'logro' : 'gratis'; });
      _cat = L;
    } catch (e) { _cat = []; }
    return _cat;
  }

  // ── Lo comprado / logros del servidor (caché local) ──
  function cache() {
    const c = ls.get(K_CACHE, null), yo = sesionId();
    return c && c.pid === yo ? c : { pid: yo, items: [], logros: [] };
  }
  function guardarCompra(item) {
    const c = cache();
    if (!c.items.some(x => x.id === item.id)) c.items.push(item);
    c.ts = Date.now(); ls.set(K_CACHE, c);
  }
  let _sync = null;
  function sincronizar(ms) {
    const yo = sesionId();
    if (!yo || !navigator.onLine) return Promise.resolve(cache());
    if (_sync) return _sync;
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), ms || 12000);
    _sync = fetch(HP_URL + '?action=mis_cosmeticos&playerid=' + encodeURIComponent(yo), { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        if (d && d.status === 'ok') {
          ls.set(K_CACHE, { pid: yo, ts: Date.now(),
            items: (d.cosmeticos || []).map(x => ({ id: x.id, tipo: x.tipo, nombre: x.nombre, sub: x.descripcion || '', img: ruta(x.tipo, x.imagen), origen: 'tienda' })),
            logros: d.logros || [] });
        }
        return cache();
      })
      .catch(() => cache())
      .finally(() => { clearTimeout(t); _sync = null; });
    return _sync;
  }

  // Logros ganados: los de este dispositivo (Arcade) + los del registro (servidor)
  function logros() {
    const s = new Set(cache().logros || []);
    const a = ls.get('chh_arcade_logros', null), yo = sesionId();
    if (a && a.l) Object.entries(a.l).forEach(([id, x]) => { if (!x.por || !yo || x.por === yo) s.add(id); });
    return s;
  }

  // Todas las opciones de un tipo, marcando cuáles tiene el jugador
  async function todos(tipo) {
    const cat = (await catalogo()).filter(x => x.tipo === tipo), L = logros(), mios = cache().items.filter(x => x.tipo === tipo);
    const out = [Object.assign({ tuyo: true }, CLASICO[tipo])];
    cat.forEach(x => out.push(Object.assign({}, x, { tuyo: x.origen === 'gratis' || L.has(x.logro) })));
    mios.forEach(x => { if (!out.some(y => y.id === x.id)) out.push(Object.assign({ tuyo: true }, x)); });
    return out;
  }
  // Solo las que tiene el jugador y cuya imagen existe
  async function disponibles(tipo) {
    const L = (await todos(tipo)).filter(x => x.tuyo);
    const ok = await Promise.all(L.map(x => x.origen === 'clasico' ? true : probar(x.img)));
    return L.filter((x, i) => ok[i]);
  }
  function equipado(tipo) { return ls.get(K_EQUIP + tipo, CLASICO[tipo] ? CLASICO[tipo].id : null); }
  function equipar(tipo, id) { ls.set(K_EQUIP + tipo, id); }
  // Imagen del equipado (si ya no está disponible, vuelve al clásico)
  async function imagenEquipada(tipo) {
    const id = equipado(tipo), L = await disponibles(tipo);
    const x = L.find(y => y.id === id) || L[0];
    return x ? x.img : CLASICO[tipo].img;
  }
  // Recompensas que da un logro (para mostrarlas en el Arcade)
  async function recompensasDe(logroId) {
    const L = (await catalogo()).filter(x => x.logro === logroId);
    const ok = await Promise.all(L.map(x => probar(x.img)));
    return L.filter((x, i) => ok[i]);
  }

  // ── Héroes del menú principal ──
  // Incluidos: assets/inicio/heroes.txt (imagen | nombre | subtítulo). Sin líneas activas: Vellond y el Guardián.
  const HEROES_BASE = [
    { id: 'base_regente', tipo: 'heroe', img: 'assets/intro/regente.png', nombre: 'Vellond', sub: 'Gran Regente de Nexotlan', origen: 'clasico' },
    { id: 'base_guardian', tipo: 'heroe', img: 'assets/intro/guardian.png', nombre: 'Guardián del Nexo', sub: 'Custodio del Omniverso', origen: 'clasico' }
  ];
  let _hb = null;
  function heroesBase() {
    if (_hb) return _hb;
    _hb = fetch('assets/inicio/heroes.txt', { cache: 'no-cache' }).then(r => r.ok ? r.text() : '').then(t => {
      const L = t.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => {
        const [img, nom, sub] = l.split('|').map(x => (x || '').trim());
        if (!img) return null;
        return { id: 'base_' + img.split('/').pop().replace(/\.[a-z0-9]+$/i, '').toLowerCase(), tipo: 'heroe', img: /\//.test(img) ? img : 'assets/inicio/' + img, nombre: nom || '', sub: sub || '', origen: 'clasico' };
      }).filter(Boolean);
      return L.length ? L : HEROES_BASE.slice();
    }).catch(() => HEROES_BASE.slice());
    return _hb;
  }
  // Incluidos + comprados (solo los que tienen imagen)
  async function heroes() {
    const base = await heroesBase(), mios = cache().items.filter(x => x.tipo === 'heroe');
    const L = base.concat(mios.filter(x => !base.some(b => b.id === x.id)).map(x => Object.assign({ origen: 'tienda' }, x)));
    const ok = await Promise.all(L.map(x => probar(x.img)));
    const out = L.filter((x, i) => ok[i]);
    return out.length ? out : HEROES_BASE.slice();
  }

  window.CHH_COSM = { HP_URL, CARPETA, CLASICO, ruta, sesionId, catalogo, cache, guardarCompra, sincronizar, logros, todos, disponibles, equipado, equipar, imagenEquipada, recompensasDe, probar, heroesBase, heroes, HEROES_BASE };
})();
