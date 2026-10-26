// ════════════════════════════════════════════════════════════════════
//  HUB DEL JUGADOR · misiones y bandeja de avisos (lo carga nucleo.js en todas las páginas)
//  · CHH_MISIONES.choque(modo, gano)   modo: arcade | sim | nexotlan | online
//    CHH_MISIONES.evento('torneo_inscripcion' | 'academia_publicar')
//    CHH_MISIONES.estado(forzar) → misiones del día/semana · CHH_MISIONES.cobrar(id)
//    Los eventos se guardan en una cola y se envían cuando hay sesión con PIN (sin interrumpir el juego).
//  · CHH_AVISOS: campana con contador (menú principal y barra superior de los módulos) y panel con:
//    pedidos de la Tienda Online, torneos nuevos, noticias nuevas, misiones completadas y logros del Arcade.
// ════════════════════════════════════════════════════════════════════
(function () {
  if (window.CHH_MISIONES) return;
  const CFG = window.CHH_CONFIG || {};
  const HP = CFG.heroPesos || 'https://script.google.com/macros/s/AKfycbwSrBH7yJiyTlPabzJ_WiXQDWPe7RpATmuTTWAe3uVRy6wuGh15QpuOMzSiZVixJK_S/exec';
  const BASE = window.__NX_BASE || '';
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sesion = () => { const s = ls.get('nhSesion', null); return s && s.tipo !== 'tienda' && s.id ? s : null; };
  const conLlave = () => !!(window.CHH_AUTH && CHH_AUTH.tieneLlave());
  async function getJSON(url, ms) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 15000);
    try { const r = await fetch(url, { signal: c.signal }); return await r.json(); } finally { clearTimeout(t); }
  }
  const hpUrl = (prm, silencio) => HP + '?' + new URLSearchParams(prm) + (silencio ? '&nx_silencio=1' : '');

  // ═══════════════ MISIONES ═══════════════
  const K_COLA = 'chh_mis_cola', K_MIS = 'chh_misiones';
  let _enviando = false;
  function encolar(x) {
    const s = sesion(); if (!s) return;
    const c = ls.get(K_COLA, []).filter(e => Date.now() - e.ts < 48 * 3600e3 && e.pid === s.id);
    c.push(Object.assign({ pid: s.id, ts: Date.now() }, x)); ls.set(K_COLA, c.slice(-30));
    setTimeout(enviarCola, 400);
  }
  async function enviarCola() {
    const s = sesion(); if (_enviando || !s || !conLlave() || !navigator.onLine) return;
    _enviando = true;
    try {
      let c = ls.get(K_COLA, []);
      while (c.length) {
        const e = c[0];
        if (e.pid !== s.id) { c.shift(); continue; }
        let d = null;
        try { d = await getJSON(hpUrl(Object.assign({ action: 'mision_evento', playerid: s.id }, e.evento === 'choque' ? { evento: 'choque', modo: e.modo, gano: e.gano } : { evento: e.evento }), true)); } catch (er) { break; }
        if (d && d.auth) break;                       // sin llave válida: se queda en la cola
        c.shift(); ls.set(K_COLA, c);
        if (d && d.completadas && d.completadas.length) {
          d.completadas.forEach(m => avisar({ id: 'mis_' + m.id + '_' + (m.periodo || dia()), tipo: 'mision', titulo: '¡Misión completada!', texto: m.texto + ' · cobra tus ' + m.hp + ' HP', href: 'misiones.html' }));
          ls.set(K_MIS, null); pintarCampanas();
        }
        if (c.length) await new Promise(r => setTimeout(r, 1200));
      }
    } finally { _enviando = false; }
  }
  const dia = () => new Date().toISOString().slice(0, 10);
  async function estado(forzar) {
    const s = sesion(); if (!s) return null;
    const c = ls.get(K_MIS, null);
    if (!forzar && c && c.pid === s.id && Date.now() - c.ts < 120000) return c.data;
    try {
      const d = await getJSON(hpUrl({ action: 'misiones', playerid: s.id }));
      if (d && d.status === 'ok') { ls.set(K_MIS, { pid: s.id, ts: Date.now(), data: d }); return d; }
    } catch (e) {}
    return c && c.pid === s.id ? c.data : null;
  }
  async function cobrar(id) {
    const s = sesion(); if (!s) return { status: 'error', message: 'Inicia sesión en Mi Perfil.' };
    let d; try { d = await getJSON(hpUrl({ action: 'mision_cobrar', playerid: s.id, id }), 25000); } catch (e) { return { status: 'error', message: 'Sin conexión. Intenta de nuevo.' }; }
    if (d && d.status === 'ok') {
      if (typeof d.saldo_nuevo === 'number') try { localStorage.setItem('chh_hp_cache', String(d.saldo_nuevo)); } catch (e) {}
      ls.set(K_MIS, null);
      const av = ls.get(K_AV, null); if (av) { av.items.forEach(i => { if (i.tipo === 'mision' && i.id.indexOf('mis_' + id + '_') === 0) i.leido = true; }); ls.set(K_AV, av); pintarCampanas(); }
    }
    return d || { status: 'error', message: 'No se pudo cobrar.' };
  }
  window.CHH_MISIONES = {
    choque: (modo, gano) => encolar({ evento: 'choque', modo, gano: gano ? 1 : 0 }),
    evento: nombre => encolar({ evento: nombre }),
    estado, cobrar, enviarCola, pendientes: () => ls.get(K_COLA, []).length
  };

  // ═══════════════ AVISOS ═══════════════
  const K_AV = 'chh_avisos', MAX = 60, CADA = 10 * 60000;
  function datos() {
    const s = sesion(), d = ls.get(K_AV, null);
    const vacio = { pid: s ? s.id : '', items: [], vistos: {}, ts: {} };
    if (!d || (s && d.pid && d.pid !== s.id)) return vacio;   // otra cuenta en este dispositivo
    d.items = d.items || []; d.vistos = d.vistos || {}; d.ts = d.ts || {}; return d;
  }
  function avisar(it) {
    const d = datos(); if (d.items.some(x => x.id === it.id)) return;
    d.items.unshift(Object.assign({ ts: Date.now(), leido: false }, it)); d.items = d.items.slice(0, MAX); ls.set(K_AV, d);
  }
  const noLeidos = () => datos().items.filter(i => !i.leido).length;

  // Cada fuente: la primera vez solo "siembra" lo que ya existe (no llena la bandeja de golpe)
  const FUENTES = {
    async noticias(d) {
      const L = await getJSON(BASE + 'noticias.json?v=' + Math.floor(Date.now() / 3600e3));
      if (!Array.isArray(L)) return;
      const sem = d.vistos.not, ids = L.filter(n => n && n.titulo).map(n => n.titulo);
      if (!sem) { d.vistos.not = ids.slice(0, 200); return; }
      ids.filter(t => sem.indexOf(t) < 0).forEach(t => { const n = L.find(x => x.titulo === t);
        d.items.unshift({ id: 'not_' + t, tipo: 'noticia', titulo: 'Noticia nueva', texto: t, href: 'noticias.html', ts: Date.now(), leido: false }); sem.push(t); });
      d.vistos.not = sem.slice(-200);
    },
    async torneos(d) {
      if (!CFG.torneos) return;
      const r = await getJSON(CFG.torneos + '?_t=' + Date.now(), 15000);
      const L = (r && r.torneos) || [], hoy = dia();
      const key = t => (t.storeid || '') + '_' + (t.tourname || '');
      const fecha = t => { const m = String(t.date || t.tourdate || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? m[0] : ''; };
      const sem = d.vistos.tor;
      if (!sem) { d.vistos.tor = L.map(key); return; }
      L.filter(t => sem.indexOf(key(t)) < 0).forEach(t => {
        sem.push(key(t)); if (fecha(t) && fecha(t) < hoy) return;
        d.items.unshift({ id: 'tor_' + key(t), tipo: 'torneo', titulo: 'Nuevo torneo', texto: (t.tourname || 'Torneo') + (t.storename ? ' · ' + t.storename : '') + (t.date ? ' · ' + t.date : ''), href: 'calendario.html', ts: Date.now(), leido: false });
      });
      d.vistos.tor = sem.slice(-300);
    },
    async pedidos(d) {
      const claves = ls.get('chh_pedidos_fisicos', {}); if (!CFG.tiendaOnline || !Object.keys(claves).length) return;
      const r = await getJSON(CFG.tiendaOnline + '?' + new URLSearchParams({ accion: 'pedidos', claves: Object.entries(claves).map(([k, v]) => k + ':' + v).join(',') }), 20000);
      if (!r || !r.ok) return;
      const TXT = { pagado: 'Pago confirmado · captura tus datos de entrega', por_enviar: 'Datos recibidos · preparando tu pedido', enviado: 'Tu pedido va en camino', entregado: 'Pedido entregado', rechazado: 'Pago rechazado', vencido: 'Venció el plazo para pagar', reembolsado: 'Pedido reembolsado' };
      const prev = d.vistos.ped || {}, primera = !d.vistos.ped;
      (r.pedidos || []).forEach(p => {
        if (!primera && prev[p.id] !== p.estado && TXT[p.estado])
          d.items.unshift({ id: 'ped_' + p.id + '_' + p.estado, tipo: 'pedido', titulo: 'Pedido ' + p.id, texto: TXT[p.estado] + (p.estado === 'enviado' && p.guia ? ' · guía ' + p.guia : ''), href: 'tienda-fisica.html?ver=' + encodeURIComponent(p.id), ts: Date.now(), leido: false });
        prev[p.id] = p.estado;
      });
      d.vistos.ped = prev;
    },
    async misiones(d) {
      if (!sesion()) return;
      const m = await estado(false); if (!m) return;
      m.diarias.concat(m.semanales).filter(x => x.completada && !x.cobrada).forEach(x => {
        const id = 'mis_' + x.id + '_' + x.periodo;
        if (!d.items.some(i => i.id === id)) d.items.unshift({ id, tipo: 'mision', titulo: '¡Misión completada!', texto: x.texto + ' · cobra tus ' + x.hp + ' HP', href: 'misiones.html', ts: Date.now(), leido: false });
      });
    },
    async logros(d) {
      const L = ls.get('chh_arcade_logros', null), ids = L && L.l ? Object.keys(L.l) : [];
      const sem = d.vistos.log;
      if (!sem) { d.vistos.log = ids; return; }
      ids.filter(i => sem.indexOf(i) < 0).forEach(i => { sem.push(i);
        d.items.unshift({ id: 'log_' + i, tipo: 'logro', titulo: 'Nuevo logro del Arcade', texto: 'Desbloqueaste un logro. Míralo en tu perfil.', href: 'perfil.html#logros', ts: Date.now(), leido: false }); });
      d.vistos.log = sem;
    }
  };
  let _revisando = false;
  async function revisar(forzar) {
    if (_revisando || !navigator.onLine) return; _revisando = true;
    try {
      const d = datos();
      for (const k of Object.keys(FUENTES)) {
        const lim = k === 'logros' ? 0 : k === 'misiones' ? 3 * 60000 : CADA;
        if (!forzar && d.ts[k] && Date.now() - d.ts[k] < lim) continue;
        try { await FUENTES[k](d); d.ts[k] = Date.now(); } catch (e) {}
      }
      d.items.sort((a, b) => b.ts - a.ts); d.items = d.items.slice(0, MAX); d.pid = d.pid || (sesion() || {}).id || '';
      ls.set(K_AV, d);
    } finally { _revisando = false; pintarCampanas(); }
  }

  // ── Campana (menú principal: #tbAvisos · módulos: barra superior común) ──
  const ICONO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22m7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/></svg>';
  const CSS = `
.nx-camp{position:relative;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;border-radius:50%;cursor:pointer;color:#e0eeff;
  background:rgba(var(--nx-k4,10,15,46),.85);border:1px solid rgba(var(--nx-ln,143,176,255),.25)}
.nx-camp svg{width:19px;height:19px;fill:currentColor}
.nx-camp:hover,.nx-camp:focus-visible{border-color:var(--neon,#f5c842);color:var(--neon,#f5c842);outline:none}
.nx-nb{position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#ff3d6b;color:#fff;font:700 10px/17px 'Orbitron',sans-serif;text-align:center}
.nx-nb[hidden]{display:none}
#nxAv{position:fixed;inset:0;z-index:2147482000;display:flex;justify-content:flex-end;background:rgba(2,3,12,.55);opacity:0;transition:opacity .18s;font-family:'Rajdhani',system-ui,sans-serif;color:#eef2ff}
#nxAv.on{opacity:1}
#nxAv .pn{width:min(420px,100%);height:100%;display:flex;flex-direction:column;background:rgb(var(--nx-k2,6,10,30));border-left:2px solid var(--neon,#f5c842);transform:translateX(30px);transition:transform .2s}
#nxAv.on .pn{transform:none}
#nxAv .hd{display:flex;align-items:center;gap:10px;padding:calc(max(10px,env(safe-area-inset-top)) + 4px) 16px 12px;border-bottom:1px solid rgba(var(--nx-ln,143,176,255),.18)}
#nxAv .hd b{flex:1;font:900 16px 'Orbitron',sans-serif;letter-spacing:.06em;border-left:4px solid var(--neon,#f5c842);padding-left:10px}
#nxAv .hd button{height:38px;padding:0 12px;font:700 13px 'Rajdhani',sans-serif;color:#eef2ff;background:transparent;border:1px solid rgba(var(--nx-ln,143,176,255),.25);cursor:pointer}
#nxAv .hd button:hover,#nxAv .hd button:focus-visible,#nxAv .hd button.gp-foco{border-color:var(--neon,#f5c842);color:var(--neon,#f5c842);outline:none}
#nxAv .ls{flex:1;overflow-y:auto;padding:8px 12px calc(max(12px,env(safe-area-inset-bottom)) + 8px)}
#nxAv a.it{display:grid;grid-template-columns:36px minmax(0,1fr);gap:10px;align-items:start;padding:11px 10px;margin-bottom:6px;color:inherit;text-decoration:none;border:1px solid rgba(var(--nx-ln,143,176,255),.14);background:rgba(var(--nx-k3,9,13,40),.85)}
#nxAv a.it.nv{border-color:rgba(245,200,66,.45);background:linear-gradient(90deg,rgba(var(--nx-g1,139,92,255),.18),rgba(var(--nx-k3,9,13,40),.9))}
#nxAv a.it:hover,#nxAv a.it:focus-visible,#nxAv a.it.gp-foco{border-color:var(--neon,#f5c842);outline:none}
#nxAv .ic{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(var(--nx-k5,20,26,70),.9)}
#nxAv .it b{display:block;font-size:15px}
#nxAv .it span{display:block;font-size:14px;color:#c7cff0;line-height:1.3}
#nxAv .it small{display:block;font-size:12px;color:#8d9bc7;margin-top:3px}
#nxAv .vc{padding:40px 16px;text-align:center;color:#8d9bc7;font-size:15px}
#nxAv .vc b{display:block;color:#eef2ff;font-size:17px;margin-bottom:4px}
@media (prefers-reduced-motion:reduce){#nxAv,#nxAv .pn{transition:none}}`;
  function css() { if (!document.getElementById('nxHubCss')) { const st = document.createElement('style'); st.id = 'nxHubCss'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); } }
  function pintarCampanas() {
    const n = noLeidos();
    document.querySelectorAll('.nx-nb').forEach(b => { b.hidden = !n; b.textContent = n > 9 ? '9+' : n; });
    document.querySelectorAll('[data-nx-avisos]').forEach(b => b.setAttribute('aria-label', 'Avisos' + (n ? ', ' + n + ' sin leer' : '')));
  }
  function ponerCampanas() {
    css();
    const idx = document.getElementById('tbAvisos');
    if (idx && !idx.dataset.nxAvisos) { idx.dataset.nxAvisos = '1'; if (!idx.querySelector('.nx-nb')) idx.insertAdjacentHTML('beforeend', '<i class="nx-nb" hidden></i>'); idx.addEventListener('click', abrir); }
    const acc = document.querySelector('.nx-barra .nx-acc');
    if (acc && !acc.querySelector('.nx-camp') && sesion()) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'nx-camp'; b.dataset.nxAvisos = '1'; b.innerHTML = ICONO + '<i class="nx-nb" hidden></i>';
      b.addEventListener('click', abrir); acc.insertBefore(b, acc.querySelector('#bgm-btn'));
    }
    pintarCampanas();
  }
  const ICO = { pedido: '📦', torneo: '🏆', noticia: '📰', mision: '📜', logro: '🏅' };
  function hace(ts) { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'ahora' : m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : 'hace ' + Math.round(m / 1440) + ' d'; }
  function abrir() {
    if (document.getElementById('nxAv')) return; css();
    const d = datos(), ant = window.GP_CFG, foco = (window.GP && GP.foco && GP.foco()) || document.activeElement;
    const w = document.createElement('div'); w.id = 'nxAv'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-label', 'Avisos');
    const items = d.items.map(i => '<a class="it' + (i.leido ? '' : ' nv') + '" href="' + esc(BASE + i.href) + '"><span class="ic">' + (ICO[i.tipo] || '🔔') + '</span><span><b>' + esc(i.titulo) + '</b><span>' + esc(i.texto) + '</span><small>' + hace(i.ts) + '</small></span></a>').join('');
    w.innerHTML = '<div class="pn"><div class="hd"><b>AVISOS</b>' + (d.items.length ? '<button type="button" data-a="limpiar">Borrar todo</button>' : '') + '<button type="button" data-a="cerrar" aria-label="Cerrar">✕</button></div><div class="ls">' +
      (items || '<div class="vc"><b>No tienes avisos</b>Aquí verás tus pedidos, torneos nuevos, noticias, misiones completadas y logros.</div>') + '</div></div>';
    document.body.appendChild(w);
    const cerrar = () => { w.classList.remove('on'); setTimeout(() => w.remove(), 200); window.GP_CFG = ant; document.removeEventListener('keydown', tecla, true);
      setTimeout(() => { try { if (window.GP && GP.activo && GP.activo() && foco && document.contains(foco)) GP.enfocar(foco); } catch (e) {} }, 40); };
    const tecla = e => { if (e.key === 'Escape') { e.preventDefault(); cerrar(); } };
    document.addEventListener('keydown', tecla, true);
    w.addEventListener('click', e => { if (e.target === w) cerrar(); });
    w.querySelector('[data-a="cerrar"]').onclick = cerrar;
    const lim = w.querySelector('[data-a="limpiar"]'); if (lim) lim.onclick = () => { const x = datos(); x.items = []; ls.set(K_AV, x); pintarCampanas(); cerrar(); };
    window.GP_CFG = { ambito: () => w, inicial: () => w.querySelector('a.it') || w.querySelector('button'), atras: () => { cerrar(); return true; }, lbrb: () => true, gatillo: () => true,
      get scroll() { return '#nxAv .ls'; } };
    requestAnimationFrame(() => { w.classList.add('on'); const f = w.querySelector('a.it') || w.querySelector('[data-a="cerrar"]'); try { if (window.GP && GP.activo && GP.activo()) GP.enfocar(f); else f.focus({ preventScroll: true }); } catch (e) {} });
    // Al abrir, todo queda leído
    const x = datos(); x.items.forEach(i => i.leido = true); ls.set(K_AV, x); setTimeout(pintarCampanas, 300);
  }
  window.CHH_AVISOS = { revisar, abrir, avisar, noLeidos };

  // ── Arranque (sin estorbar la carga de la página) ──
  function iniciar() {
    ponerCampanas(); setTimeout(ponerCampanas, 600);
    const ocioso = window.requestIdleCallback || (f => setTimeout(f, 1500));
    ocioso(() => { enviarCola(); revisar(false); }, { timeout: 4000 });
    window.addEventListener('online', () => { enviarCola(); revisar(false); });
    window.addEventListener('storage', e => { if (e.key === K_AV) pintarCampanas(); });
  }
  if (document.readyState === 'complete') iniciar(); else window.addEventListener('load', iniciar);
})();
