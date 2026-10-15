// ════════════════════════════════════════════════════════════════════
//  CONTROL (Xbox / PlayStation / genérico) — Simulación y Arcade
//  Gamepad API del navegador. No cambia nada del juego: solo "toca" los mismos
//  botones y cartas que tocarías con el dedo.
//
//  Cruceta / stick izq.  mover el marco de selección (foco)
//  A                      tocar / seleccionar
//  B                      atrás / cancelar / cerrar
//  X                      ir a las acciones de la carta (Simulación)
//  Y                      acción principal (fase / combate / fin de turno · siguiente combate)
//  LB / RB                saltar entre zonas
//  LT / RT                desplazar listas y el registro
//  Stick derecho          puntero libre (A toca lo que esté debajo)
//  Start                  menú de la pantalla (Apariencia…)
//  View / Select          silenciar música
//
//  Cada página puede definir window.GP_CFG = { zonas, principal, atras, start, select, acciones, clicables }.
//  (clicables: selector CSS extra de elementos tocables que usan addEventListener en vez de onclick)
//  El control se activa al presionar cualquier botón; tocar la pantalla lo oculta.
// ════════════════════════════════════════════════════════════════════
(function () {
  if (!('getGamepads' in navigator) || window.GP) return;   // (settings.js también lo carga: evita doble)
  const CFG = () => window.GP_CFG || {};
  const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, START: 9, LS: 10, RS: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
  const DZ = 0.5, DZ_R = 0.22, REP0 = 330, REP = 110;

  let activo = false, foco = null, prev = [], repT = {}, modoPuntero = false, px = 0, py = 0, raf = 0, ultimaTecla = 0;

  // ── Estilos y elementos visuales ──
  const css = document.createElement('style');
  css.textContent = `
  #gpRing{position:fixed;z-index:2147483646;pointer-events:none;border-radius:10px;display:none;
    box-shadow:0 0 0 3px #f5c842,0 0 0 5px rgba(0,0,0,.6),0 0 22px 6px rgba(245,200,66,.65);transition:left .09s,top .09s,width .09s,height .09s}
  #gpRing.pulse{animation:gpP .9s ease-in-out infinite}
  @keyframes gpP{50%{box-shadow:0 0 0 3px #fff3c4,0 0 0 5px rgba(0,0,0,.6),0 0 30px 10px rgba(245,200,66,.9)}}
  #gpPtr{position:fixed;z-index:2147483647;pointer-events:none;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;display:none;
    border:3px solid #00ff9d;box-shadow:0 0 12px #00ff9d,inset 0 0 6px rgba(0,255,157,.6);background:rgba(0,255,157,.12)}
  #gpHud{position:fixed;z-index:2147483645;left:50%;bottom:6px;transform:translateX(-50%);display:none;gap:10px;align-items:center;
    padding:5px 12px;border-radius:20px;background:rgba(3,5,10,.82);border:1px solid rgba(245,166,35,.35);
    font:600 11px 'Rajdhani',sans-serif;color:#cfd8e6;white-space:nowrap;pointer-events:none;letter-spacing:.3px}
  #gpHud i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;
    font:900 9px 'Orbitron',sans-serif;color:#000;margin-right:3px}
  #gpHud i.a{background:#5dd55d}#gpHud i.b{background:#ff5d5d}#gpHud i.x{background:#4fa3ff}#gpHud i.y{background:#f5c842}
  #gpHud i.l{background:#9fb3cc;width:auto;padding:0 5px;border-radius:5px}
  html.gp-on, html.gp-on *{cursor:none!important}`;
  document.head.appendChild(css);
  const ring = document.createElement('div'); ring.id = 'gpRing';
  const ptr = document.createElement('div'); ptr.id = 'gpPtr';
  const hud = document.createElement('div'); hud.id = 'gpHud';
  // El anillo y el puntero van en coordenadas de pantalla; la barra de ayuda va dentro del escenario
  // (#stage) para que gire junto con el juego cuando la vista está rotada.
  const montar = () => { document.body.appendChild(ring); document.body.appendChild(ptr); (document.getElementById('stage') || document.body).appendChild(hud); };
  if (document.body) montar(); else addEventListener('DOMContentLoaded', montar);

  function pintarHud() {
    const c = CFG();
    hud.innerHTML = '<span><i class="a">A</i>Elegir</span><span><i class="b">B</i>Atrás</span>' +
      (c.acciones ? '<span><i class="x">X</i>Acciones</span>' : '') +
      '<span><i class="y">Y</i>' + (c.principalTxt || 'Continuar') + '</span>' +
      (c.zonas ? '<span><i class="l">LB RB</i>Zona</span>' : '') +
      '<span><i class="l">R</i>Puntero</span>';
  }

  // ── Activar / desactivar (el táctil manda) ──
  function activar() {
    if (activo) return;
    activo = true; document.documentElement.classList.add('gp-on');
    pintarHud(); hud.style.display = 'flex';
    clearTimeout(activar._t); activar._t = setTimeout(() => { hud.style.display = 'none'; }, 7000);   // la ayuda se oculta sola
    if (!valido(foco)) enfocar(inicial());
    bucleVisual();
  }
  function desactivar() {
    if (!activo) return;
    activo = false; modoPuntero = false;
    document.documentElement.classList.remove('gp-on');
    ring.style.display = 'none'; ptr.style.display = 'none'; hud.style.display = 'none';
    cancelAnimationFrame(raf);
  }
  addEventListener('pointerdown', e => { if (e.isTrusted && !e._gp) desactivar(); }, true);
  addEventListener('touchstart', () => desactivar(), { passive: true, capture: true });

  // ── Vista girada (la Simulación y el Arcade se dibujan girados 90° si el teléfono está vertical) ──
  function aPantalla(dx, dy) {
    const r = document.documentElement.classList;
    if (!r.contains('rot')) return [dx, dy];
    return r.contains('flip') ? [dy, -dx] : [-dy, dx];
  }

  // ── Elementos que se pueden tocar ──
  function clicable(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    const t = el.tagName;
    if (t === 'BUTTON' || t === 'SELECT' || (t === 'A' && el.hasAttribute('href'))) return true;
    if (t === 'INPUT' && el.type !== 'hidden') return true;
    const extra = CFG().clicables; if (extra && el.matches(extra)) return true;   // elementos con addEventListener (por página)
    return typeof el.onclick === 'function' || el.hasAttribute('onclick') || el.getAttribute('role') === 'button';
  }
  function vw() { return innerWidth; } function vh() { return innerHeight; }
  function scrollPadre(el) {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if ((/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight + 2) ||
          (/(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth + 2)) return p;
    }
    return null;
  }
  function encima(el, x, y) {
    const h = document.elementFromPoint(x, y);
    return !!h && (h === el || el.contains(h) || (h.contains(el) && !clicable(h)));
  }
  function valido(el) {
    if (!el || !el.isConnected || !clicable(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.pointerEvents === 'none') return false;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx >= 0 && cy >= 0 && cx <= vw() && cy <= vh()) return encima(el, cx, cy);
    // Fuera de pantalla: válido si su contenedor con scroll está visible y arriba de todo
    const sp = scrollPadre(el); if (!sp) return false;
    const q = sp.getBoundingClientRect();
    const qx = Math.min(Math.max(q.left + q.width / 2, 1), vw() - 1), qy = Math.min(Math.max(q.top + q.height / 2, 1), vh() - 1);
    const h = document.elementFromPoint(qx, qy);
    return !!h && sp.contains(h);
  }
  function candidatos(raiz) {
    const out = [];
    (raiz || document.body).querySelectorAll('*').forEach(el => {
      if (el.id && el.id.indexOf('gp') === 0) return;
      if (!clicable(el)) return;
      if (!valido(el)) return;
      // Fondos de modal que cierran al tocarlos (grandes y con botones adentro): no cuentan
      const r = el.getBoundingClientRect();
      if (r.width * r.height > vw() * vh() * 0.3 && [...el.querySelectorAll('*')].some(clicable)) return;
      out.push(el);
    });
    return out;
  }
  function centro(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r]; }

  function inicial() {
    const c = CFG();
    const pref = c.inicial && c.inicial();
    if (valido(pref)) return pref;
    const L = candidatos();
    // El botón principal visible, o el primero más cerca del centro de la pantalla
    const pr = c.principal && c.principal(); if (valido(pr)) return pr;
    let best = null, bd = 1e9;
    L.forEach(el => { const [x, y] = centro(el); const d = Math.hypot(x - vw() / 2, y - vh() / 2); if (d < bd) { bd = d; best = el; } });
    return best;
  }

  // ── Mover el foco en una dirección (pantalla) ──
  function mover(dx, dy) {
    if (!valido(foco)) { enfocar(inicial()); return; }
    const [fx, fy, fr] = centro(foco);
    let best = null, bs = 1e12;
    candidatos().forEach(el => {
      if (el === foco) return;
      const [x, y] = centro(el);
      const vx = x - fx, vy = y - fy;
      const along = vx * dx + vy * dy;                 // avance en la dirección pedida
      if (along <= 4) return;
      const cross = Math.abs(vx * dy - vy * dx);       // desvío lateral
      // Si se solapan en el eje perpendicular, se prefieren (misma fila / columna)
      const r = el.getBoundingClientRect();
      const solapa = dx ? (r.bottom > fr.top && r.top < fr.bottom) : (r.right > fr.left && r.left < fr.right);
      const score = along + cross * (solapa ? 0.6 : 2.4);
      if (score < bs) { bs = score; best = el; }
    });
    if (best) enfocar(best); else vibrar(25, .2);
  }

  function enfocar(el) {
    if (!el) return;
    foco = el; modoPuntero = false; ptr.style.display = 'none';
    try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
    const c = CFG(); if (c.alEnfocar) try { c.alEnfocar(el); } catch (e) {}
    dibujarAnillo();
  }
  function dibujarAnillo() {
    if (!activo || modoPuntero || !foco || !foco.isConnected) { ring.style.display = 'none'; return; }
    const r = foco.getBoundingClientRect();
    if (r.width < 2) { ring.style.display = 'none'; return; }
    ring.style.display = 'block';
    ring.style.left = (r.left - 3) + 'px'; ring.style.top = (r.top - 3) + 'px';
    ring.style.width = (r.width + 6) + 'px'; ring.style.height = (r.height + 6) + 'px';
    const br = getComputedStyle(foco).borderRadius; ring.style.borderRadius = br && br !== '0px' ? br : '8px';
  }
  function bucleVisual() {
    cancelAnimationFrame(raf);
    const paso = () => {
      if (!activo) return;
      if (!modoPuntero) {
        if (foco && !valido(foco)) { const n = inicial(); if (n) foco = n; }   // apareció un modal o la carta desapareció
        dibujarAnillo();
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
  }

  // ── Acciones ──
  function tocar(el) {
    if (!el) return;
    const [x, y] = centro(el);
    const opt = { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window };
    try { const ev = new PointerEvent('pointerdown', opt); ev._gp = true; el.dispatchEvent(ev); } catch (e) {}
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') { el.focus(); if (el.tagName === 'SELECT') try { el.showPicker(); } catch (e) {} return; }
    vibrar(18, .25);   // antes del clic: si el clic cambia de página, la vibración ya terminó
    el.click();
  }
  function tocarPuntero() {
    const h = document.elementFromPoint(px, py); if (!h) return;
    let el = h; while (el && !clicable(el)) el = el.parentElement;
    if (el) { tocar(el); foco = el; }
  }
  const RX_ATRAS = /^\s*(✕|×|x|←|◀|cancelar|cerrar|atr[aá]s|volver|no\b|salir de|regresar)/i;
  function atras() {
    const c = CFG();
    if (c.atras && c.atras() === true) return;
    const L = candidatos();
    const pref = L.find(el => el.matches('.ds-close,.bs-cancel,.cb-close,#apX,[data-gp-back],.sec-back,.x'));
    const txt = pref || L.find(el => RX_ATRAS.test((el.textContent || el.getAttribute('title') || '').trim()));
    if (txt) { tocar(txt); return; }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  }
  function principal() {
    const c = CFG(); const el = c.principal && c.principal();
    if (valido(el)) { tocar(el); return; }
    // Si no hay, el primer botón dorado/primario visible
    const L = candidatos().filter(e => e.tagName === 'BUTTON' && !/ghost|sec\b/.test(e.className));
    if (L[0]) tocar(L[0]);
  }
  function zona(dir) {
    const c = CFG();
    if (!c.zonas) {   // sin zonas: recorre los elementos en orden
      const L = candidatos(); if (!L.length) return;
      const i = L.indexOf(foco); enfocar(L[(i + dir + L.length) % L.length]); return;
    }
    const Z = c.zonas.map(s => document.querySelector(s)).filter(Boolean);
    const conCand = Z.map(z => clicable(z) ? (valido(z) ? [z] : []) : candidatos(z)).map((L, i) => ({ z: Z[i], L })).filter(x => x.L.length);
    if (!conCand.length) { const L = candidatos(); if (!L.length) return; const k = L.indexOf(foco); enfocar(L[(k + dir + L.length) % L.length]); return; }
    let i = conCand.findIndex(x => foco && x.z.contains(foco));
    i = (i + dir + conCand.length) % conCand.length;
    // Dentro de la zona, el elemento más cercano a donde estabas
    let L = conCand[i].L, el = L[0];
    if (foco && foco.isConnected) { const [fx, fy] = centro(foco); let bd = 1e12; L.forEach(e => { const [x, y] = centro(e); const d = Math.hypot(x - fx, y - fy); if (d < bd) { bd = d; el = e; } }); }
    enfocar(el);
  }
  function desplazar(dir) {
    const c = CFG();
    let s = foco && scrollPadre(foco);
    if (!s && c.scroll) s = document.querySelector(c.scroll);
    if (!s) s = document.scrollingElement;
    const horiz = s.scrollWidth > s.clientWidth + 2 && !(s.scrollHeight > s.clientHeight + 2);
    if (horiz) s.scrollBy({ left: dir * 160, behavior: 'smooth' }); else s.scrollBy({ top: dir * 120, behavior: 'smooth' });
  }
  function vibrar(ms, f) {
    try {
      const g = [...navigator.getGamepads()].find(Boolean);
      const v = g && g.vibrationActuator;
      if (v && v.playEffect) {
        v.playEffect('dual-rumble', { duration: ms || 120, strongMagnitude: f || .6, weakMagnitude: f || .6 }).catch(() => {});
        // Seguro: apaga el motor al terminar (algunos controles se quedan vibrando si la página cambia)
        clearTimeout(vibrar._t); vibrar._t = setTimeout(parar, (ms || 120) + 80);
      }
    } catch (e) {}
  }
  // Detiene la vibración de todos los controles
  function parar() {
    try {
      [...navigator.getGamepads()].filter(Boolean).forEach(g => {
        const v = g.vibrationActuator; if (!v) return;
        if (v.reset) v.reset().catch(() => {});
        else if (v.playEffect) v.playEffect('dual-rumble', { duration: 1, strongMagnitude: 0, weakMagnitude: 0 }).catch(() => {});
      });
    } catch (e) {}
  }
  addEventListener('pagehide', parar);
  addEventListener('beforeunload', parar);
  document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); });

  // ── Lectura del control ──
  function pulsado(g, i) { const b = g.buttons[i]; return !!b && (b.pressed || b.value > .5); }
  function bucle() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    const g = pads[0];
    if (g) {
      const now = performance.now();
      const ax = g.axes[0] || 0, ay = g.axes[1] || 0, rx = g.axes[2] || 0, ry = g.axes[3] || 0;
      const est = {
        up: pulsado(g, B.UP) || ay < -DZ, down: pulsado(g, B.DOWN) || ay > DZ,
        left: pulsado(g, B.LEFT) || ax < -DZ, right: pulsado(g, B.RIGHT) || ax > DZ
      };
      for (let i = 0; i < g.buttons.length; i++) est['b' + i] = pulsado(g, i);
      const algo = Object.values(est).some(Boolean) || Math.hypot(rx, ry) > DZ_R;
      if (algo && !activo) { activar(); prev = est; ultimaTecla = now; requestAnimationFrame(bucle); return; }   // la primera pulsación solo despierta

      if (activo) {
        // Direcciones con repetición al mantener
        [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]].forEach(([k, dx, dy]) => {
          if (est[k]) {
            if (!prev[k]) { repT[k] = now + REP0; const [sx, sy] = aPantalla(dx, dy); mover(sx, sy); }
            else if (now >= repT[k]) { repT[k] = now + REP; const [sx, sy] = aPantalla(dx, dy); mover(sx, sy); }
          }
        });
        const nuevo = i => est['b' + i] && !prev['b' + i];
        if (nuevo(B.A)) { if (modoPuntero) tocarPuntero(); else tocar(valido(foco) ? foco : inicial()); }
        if (nuevo(B.B)) atras();
        if (nuevo(B.X)) { const c = CFG(); const el = c.acciones && c.acciones(); if (el) enfocar(el); }
        if (nuevo(B.Y)) principal();
        if (nuevo(B.LB)) zona(-1);
        if (nuevo(B.RB)) zona(1);
        if (nuevo(B.START)) { const c = CFG(); const el = c.start && c.start(); if (valido(el)) tocar(el); }
        if (nuevo(B.VIEW)) { const c = CFG(); const el = c.select && c.select(); if (el) tocar(el); }
        if (nuevo(B.RS) && modoPuntero) tocarPuntero();
        // Gatillos: desplazamiento continuo
        if (est['b' + B.LT] && (!prev['b' + B.LT] || now >= (repT.lt || 0))) { repT.lt = now + 140; desplazar(-1); }
        if (est['b' + B.RT] && (!prev['b' + B.RT] || now >= (repT.rt || 0))) { repT.rt = now + 140; desplazar(1); }
        // Stick derecho: puntero libre
        if (Math.hypot(rx, ry) > DZ_R) {
          if (!modoPuntero) {
            modoPuntero = true; ring.style.display = 'none';
            if (foco && foco.isConnected) { const [x, y] = centro(foco); px = x; py = y; } else { px = vw() / 2; py = vh() / 2; }
          }
          const [sx, sy] = aPantalla(rx, ry), v = 11;
          px = Math.min(Math.max(px + sx * v, 0), vw() - 1); py = Math.min(Math.max(py + sy * v, 0), vh() - 1);
          ptr.style.display = 'block'; ptr.style.left = px + 'px'; ptr.style.top = py + 'px';
        }
      }
      prev = est;
    }
    requestAnimationFrame(bucle);
  }
  addEventListener('gamepadconnected', () => { if (!bucle._on) { bucle._on = true; requestAnimationFrame(bucle); } });
  // Algunos navegadores no avisan "gamepadconnected" si el control ya estaba conectado
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) { bucle._on = true; requestAnimationFrame(bucle); }

  window.GP = { activo: () => activo, vibrar, parar, enfocar, valido, refrescarHud: pintarHud };
})();
