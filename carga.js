/* ═══════════════════════════════════════════════════════════════════════
   carga.js · Pantalla de carga con TIPS para toda la app (v208)
   Misma pantalla que el Modo Aventura: marco naranja, consejo al azar, barra de lectura
   y "TOCA PARA CONTINUAR" (toque, Enter/Espacio/Esc o A/B del control) cuando ya cargó.

   Uso:
     <script src="carga.js" data-auto="choque"></script>   → aparece al abrir la página (ponerlo al inicio del <body>)
     CHHCarga.listo()            → ya cargó: se quita cuando se alcanzó a leer el consejo (o al saltarla)
     CHHCarga.ir(url, tipo)      → muestra un consejo y luego abre otra página
     CHHCarga.mostrar({tipo, min, alTerminar})   CHHCarga.visible()   CHHCarga.esperar() (Promise)
   Tipos de consejos: 'choque' (reglas y Simulación) · 'arcade' (Arcade + choque) · 'nexotlan' (los del Modo Aventura)
   Consejos propios: assets/tips.txt  (una línea por consejo:  Título | Texto  ·  # = comentario)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  if (window.CHHCarga) return;
  const TIPS = {
    choque: [
      ['Corazones', 'Cada jugador empieza el Choque con 10 corazones. Pierde quien se queda sin ellos.'],
      ['Tu mano', 'Empiezas con 4 cartas en la mano y puedes tener como máximo 7.'],
      ['Llamados', 'Puedes hacer hasta 2 llamados por turno: piensa bien a qué Héroes llamar primero.'],
      ['Baraja Principal', 'La Baraja Principal tiene 40 cartas.'],
      ['Baraja de Almas', 'La Baraja de Almas siempre tiene exactamente 15 cartas.'],
      ['Baraja de Soporte', 'La Baraja de Soporte es opcional: ahí van tus Amalgamas, hasta 15.'],
      ['Amalgamas', 'Si una Amalgama regresa a la mano o a una baraja, siempre vuelve a tu Baraja de Soporte.'],
      ['Sectores', 'Los efectos de un SECTOR solo afectan a los personajes de ese sector. Si colocas uno en una zona ocupada, el anterior se va al Mictlán.'],
      ['Contadores ALMA', 'Un Contador ALMA se coloca sobre una carta ALMA y le suma +1 a su valor mientras esté ahí.'],
      ['Negar', 'Si se niega la activación de una carta o un llamado, su costo se cancela por completo.'],
      ['Valentía', 'VALENTÍA te deja hacer un llamado especial desde la mano sin importar las almas que tengas en el campo.'],
      ['Cartas limitadas', 'Algunas cartas son limitadas: solo puedes llevar 1 copia en tu baraja.'],
      ['Arma tu baraja', 'Una baraja fuerte no tiene que ser de un solo arquetipo: combínalo con Héroes Invitados y cartas para responder al rival.'],
      ['Prueba tu baraja', 'Desde el Constructor puedes mandar tu baraja a la Simulación para probarla contra la CPU.']
    ],
    arcade: [
      ['Arcade', 'Cada ruta del Arcade tiene 15 rivales y termina con un jefe final.'],
      ['Partidas', 'El Arcade tiene 3 partidas: puedes llevar rutas distintas al mismo tiempo.'],
      ['Ventajas del rival', 'Algunos rivales empiezan con ventajas, como corazones, cartas o almas extra. Revísalas antes del Choque.'],
      ['Logros', 'Los logros que consigues en el Arcade se guardan en tu perfil.']
    ]
  };
  const L = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const S = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let extra = []; try { extra = JSON.parse(L('chh_tips_extra') || '[]') || []; } catch (e) {}
  function lista(tipo) {
    if (tipo === 'nexotlan') { try { const c = JSON.parse(L('chh_nx_portada') || '{}') || {}; if (c.tips && c.tips.length) return c.tips; } catch (e) {} }
    const base = TIPS.choque.concat(extra);
    return tipo === 'arcade' ? TIPS.arcade.concat(TIPS.arcade, base) : base;   // en Arcade salen más seguido los suyos
  }
  // assets/tips.txt se lee en segundo plano y queda guardado para la próxima vez
  setTimeout(() => {
    fetch('assets/tips.txt', { cache: 'no-cache' }).then(r => r.ok ? r.text() : '').then(t => {
      const out = []; String(t || '').split(/\r?\n/).map(l => l.replace(/^\s*#.*$/, '').trim()).filter(Boolean)
        .forEach(l => { const i = l.indexOf('|'); out.push(i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ['Consejo', l]); });
      extra = out; S('chh_tips_extra', JSON.stringify(out));
    }).catch(() => {});
  }, 2500);

  const css = `
#chhCarga{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;
  background:#03050f center/cover no-repeat;transition:opacity .4s ease;font-family:'Rajdhani',system-ui,sans-serif;-webkit-user-select:none;user-select:none}
#chhCarga[hidden]{display:none}
/* v229 · En las páginas que se juegan en horizontal (Simulación, Online, Arcade) la carga ya sale girada */
:root.rot #chhCarga{inset:auto;top:0;left:0;width:100vh;height:100vw;transform-origin:top left;transform:rotate(90deg) translateY(-100%)}
@supports (height:100dvh){:root.rot #chhCarga{width:100dvh}}
:root.rot.flip #chhCarga{transform:rotate(-90deg) translateX(-100%)}
#chhCarga.fuera{opacity:0;pointer-events:none}
#chhCarga::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(3,5,15,.72),rgba(3,5,15,.94) 70%)}
#chhCarga>*{position:relative}
#chhCarga .cg-marca{position:absolute;left:18px;top:14px;display:flex;align-items:center}
#chhCarga .cg-logo{max-height:46px;max-width:180px;object-fit:contain;filter:drop-shadow(0 4px 14px rgba(0,0,0,.7))}
#chhCarga .cg-t{font-family:'Orbitron',monospace;font-weight:900;font-size:14px;letter-spacing:.3em;color:#cfe0ff}
#chhCarga .cg-caja{width:min(800px,94%);aspect-ratio:2.25/1;max-height:64vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:5% 9% 6%;text-align:center;box-sizing:border-box}
#chhCarga .cg-caja>svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
#chhCarga .cg-caja>svg .m{fill:rgba(4,6,14,.92);stroke:#f5a623;stroke-width:3;vector-effect:non-scaling-stroke;stroke-linejoin:miter}
#chhCarga .cg-caja::after{content:'';position:absolute;right:4%;bottom:9%;width:34%;height:62%;pointer-events:none;
  background:radial-gradient(circle,rgba(245,166,35,.55) 1.1px,transparent 1.7px) 0 0/7px 7px;
  -webkit-mask-image:radial-gradient(ellipse at 100% 100%,#000 10%,transparent 72%);mask-image:radial-gradient(ellipse at 100% 100%,#000 10%,transparent 72%)}
#chhCarga .cg-tab{position:absolute;left:4%;top:-2.5%;padding:6px 34px 6px 18px;background:#f5a623;color:#fff;
  font-family:'Orbitron',monospace;font-weight:900;font-size:clamp(16px,2.6vw,26px);letter-spacing:.06em;
  clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%);text-shadow:0 2px 0 #8a4a00,0 0 1px #8a4a00;z-index:1}
#chhCarga .cg-tt,#chhCarga .cg-x{position:relative;z-index:1}
#chhCarga .cg-tt{font-family:'Orbitron',monospace;font-weight:700;font-size:clamp(15px,2.1vw,22px);letter-spacing:.06em;color:#fff;
  padding:0 18px 10px;margin-bottom:clamp(14px,4vh,34px);background:linear-gradient(#f5a623,#f5a623) center bottom/100% 2px no-repeat}
#chhCarga .cg-x{font-size:clamp(16px,2.3vw,23px);font-weight:700;line-height:1.45;color:#eef2ff;max-width:36em}
#chhCarga .cg-pie{position:absolute;right:clamp(14px,4vw,46px);bottom:clamp(12px,3.4vh,34px);display:flex;align-items:flex-end;gap:12px}
#chhCarga .cg-pie span{font-family:'Orbitron',monospace;font-weight:900;font-size:13px;letter-spacing:.14em;color:#fff;padding:0 4px 6px 0;position:relative;display:block;min-width:120px}
#chhCarga .cg-pie span::before{content:'';position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(207,224,255,.18)}
#chhCarga .cg-pie span i{position:absolute;left:0;bottom:0;height:3px;width:0;background:linear-gradient(90deg,#f5a623,#ffd166);box-shadow:0 0 8px rgba(255,190,60,.8);transition:width linear}
#chhCarga .cg-spr{width:58px;height:58px;display:flex;align-items:flex-end;justify-content:center;perspective:300px}
#chhCarga .cg-spr img{max-width:100%;max-height:100%;object-fit:contain;animation:chhCgBob 1s ease-in-out infinite}
#chhCarga .cg-naipe{width:30px;height:42px;border-radius:4px;border:2px solid #f5a623;transform-style:preserve-3d;animation:chhCgGira 1.4s cubic-bezier(.5,0,.5,1) infinite;
  background:radial-gradient(circle at 50% 50%,#ffd166 0 18%,transparent 19%),linear-gradient(135deg,#7a4dff,#36d6ff);box-shadow:0 0 14px rgba(54,214,255,.45)}
#chhCarga .cg-sig{position:absolute;left:50%;bottom:clamp(14px,3.6vh,34px);transform:translateX(-50%);font-family:'Orbitron',monospace;font-weight:700;font-size:12px;letter-spacing:.14em;
  color:#ffd166;opacity:0;transition:opacity .4s;white-space:nowrap;pointer-events:none}
#chhCarga.listo{cursor:pointer}
#chhCarga.listo .cg-pie span{color:#ffd166}
#chhCarga.listo .cg-sig{opacity:.9;animation:chhCgSig 1.6s ease-in-out infinite}
@keyframes chhCgGira{to{transform:rotateY(360deg)}}
@keyframes chhCgBob{50%{transform:translateY(-6px)}}
@keyframes chhCgSig{50%{opacity:.45}}
@media (max-height:520px){#chhCarga .cg-caja{aspect-ratio:auto;min-height:56vh}#chhCarga .cg-sig{left:18px;transform:none}}
@media (max-width:620px){#chhCarga .cg-caja{aspect-ratio:auto;padding:46px 22px 40px}#chhCarga .cg-sig{bottom:auto;top:20px;left:auto;right:18px;transform:none}}
@media (prefers-reduced-motion:reduce){#chhCarga .cg-naipe,#chhCarga .cg-spr img,#chhCarga.listo .cg-sig{animation:none}}`;

  let G = null, minT = 0, tSeguro = 0, tFin = 0, alFin = null, ult = '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function crear() {
    if (G) return G;
    const st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
    G = document.createElement('div'); G.id = 'chhCarga'; G.hidden = true; G.setAttribute('role', 'status');
    G.innerHTML = '<div class="cg-marca"><img class="cg-logo" alt="" hidden><div class="cg-t">CHOQUE DE HÉROES</div></div>' +
      '<div class="cg-caja"><svg viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true"><path class="m" d="M3 5 L56 5 L58.5 1.5 L100 1 L96.5 40 L48 40 L45.5 43.5 L0 43.5 Z"/></svg>' +
      '<div class="cg-tab">TIPS</div><div class="cg-tt"></div><div class="cg-x"></div></div>' +
      '<div class="cg-pie"><div class="cg-spr"><div class="cg-naipe"></div></div><span>CARGANDO<i></i></span></div><div class="cg-sig">TOCA PARA CONTINUAR</div>';
    G.onclick = saltar;
    (document.body || document.documentElement).appendChild(G);
    return G;
  }
  function visible() { return !!G && !G.hidden && !G.classList.contains('fuera'); }
  // Aspecto: Nexotlan usa su logo, fondo e imagen de carga; el resto, el título del juego y el fondo indicado
  function vestir(tipo, fondo) {
    const lg = G.querySelector('.cg-logo'), t = G.querySelector('.cg-t'), spr = G.querySelector('.cg-spr');
    lg.hidden = true; t.hidden = false; t.textContent = 'CHOQUE DE HÉROES'; G.style.backgroundImage = '';
    spr.innerHTML = '<div class="cg-naipe"></div>';
    let f = fondo;
    if (tipo === 'nexotlan') {
      try {
        const c = JSON.parse(L('chh_nx_portada') || '{}') || {};
        if (c.logo) { lg.src = c.logo; lg.hidden = false; t.hidden = true; } else if (c.titulo) t.textContent = c.titulo;
        f = f || c.carga;
        if (c.sprite) spr.innerHTML = '<img src="' + esc(c.sprite) + '" alt="" onerror="this.parentNode.innerHTML=\'<div class=cg-naipe></div>\'">';
      } catch (e) {}
    } else if (tipo === 'arcade') { t.textContent = 'ARCADE'; f = f || 'assets/arcade/portada.jpg'; }
    if (f) G.style.backgroundImage = 'url("' + String(f).replace(/"/g, '%22') + '")';
  }
  function tip(tipo, fijo) {
    if (fijo) { ult = fijo[1]; G.querySelector('.cg-tt').textContent = fijo[0] || 'Consejo'; G.querySelector('.cg-x').textContent = fijo[1] || ''; return 0; }
    const Ls = lista(tipo); let t = Ls[Math.floor(Math.random() * Ls.length)] || ['Consejo', ''];
    if (Ls.length > 1 && t[1] === ult) t = Ls[(Ls.indexOf(t) + 1) % Ls.length];
    ult = t[1];
    G.querySelector('.cg-tt').textContent = t[0] || 'Consejo'; G.querySelector('.cg-x').textContent = t[1] || '';
    return Math.min(7000, Math.max(3200, 1500 + ((t[0] || '') + (t[1] || '')).length * 36));   // tiempo para leerlo con calma
  }
  function mostrar(o) {
    o = o || {}; crear();
    clearTimeout(tFin); G.classList.remove('fuera', 'listo'); G.hidden = false;
    vestir(o.tipo || 'choque', o.fondo);
    const lee = tip(o.tipo || 'choque', o.tip);
    minT = o.hasta ? Math.max(o.hasta, Date.now() + 1500) : Date.now() + Math.max(o.min || 0, lee);
    const b = G.querySelector('.cg-pie i'); b.style.transitionDuration = '0s'; b.style.width = '0'; void b.offsetWidth; b.style.transitionDuration = (minT - Date.now()) + 'ms'; b.style.width = '100%';
    alFin = o.alTerminar || null;
    clearTimeout(tSeguro); tSeguro = setTimeout(() => quitar(true), 15000);   // seguro: nunca se queda atorada
    gpAtras();
    if (alFin) listo();
  }
  function listo() { quitar(false); }
  function quitar(ya) {
    if (!visible()) return;
    const falta = minT - Date.now();
    if (!ya && falta > 0) { G.classList.add('listo'); clearTimeout(tFin); tFin = setTimeout(() => quitar(true), falta); return; }
    clearTimeout(tFin); clearTimeout(tSeguro);
    const f = alFin; alFin = null; G.classList.remove('listo');
    if (f) { f(); return; }                               // se va a otra página: la pantalla se queda puesta
    G.classList.add('fuera'); setTimeout(() => { if (G.classList.contains('fuera')) G.hidden = true; }, 450);
  }
  function saltar() { if (visible() && G.classList.contains('listo')) quitar(true); }
  function esperar() { return new Promise(r => { const t0 = Date.now(), v = () => (!visible() || Date.now() - t0 > 16000) ? r() : setTimeout(v, 60); v(); }); }
  // Ir a otra página: el consejo se ve de inmediato y la página siguiente lo continúa (mismo consejo, el tiempo que falte),
  // así no se encadenan dos pantallas de carga seguidas
  function ir(url, tipo, fondo) {
    mostrar({ tipo, fondo }); G.classList.remove('listo');
    pasar(tipo);
    clearTimeout(tSeguro); setTimeout(() => { location.href = url; }, 380);
  }
  function pasar(tipo) {
    try { sessionStorage.setItem('chh_carga_paso', JSON.stringify({ tt: G.querySelector('.cg-tt').textContent, x: G.querySelector('.cg-x').textContent, fin: minT, tipo, ts: Date.now() })); } catch (e) {}
  }
  function recibido() {     // consejo que dejó la página anterior (si es reciente)
    try { const v = JSON.parse(sessionStorage.getItem('chh_carga_paso') || 'null'); sessionStorage.removeItem('chh_carga_paso'); if (v && Date.now() - v.ts < 20000 && v.x) return v; } catch (e) {}
    return null;
  }
  // Mientras se ve: nada de abajo reacciona al teclado; B del control la salta en vez de usar el "atrás" de la página
  addEventListener('keydown', e => {
    if (!visible()) return;
    if (!['Enter', ' ', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(e.key)) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') saltar();
    e.preventDefault(); e.stopPropagation();
  }, true);
  function gpAtras() {
    const c = window.GP_CFG; if (!c || c.__chhCg) return;
    const o = c.atras; c.atras = function () { if (visible()) { saltar(); return true; } return o ? o.apply(this, arguments) : false; }; c.__chhCg = 1;
    const s = c.sinAnillo; c.sinAnillo = function (el) { if (el && el.id === 'chhCarga') return true; return s ? s.apply(this, arguments) : false; };
  }
  addEventListener('load', gpAtras);
  window.CHHCarga = { mostrar, listo, quitar, saltar, visible, esperar, ir, recibido };

  // Automática al abrir la página: <script src="carga.js" data-auto="choque|arcade|nexotlan">
  const me = document.currentScript, auto = me && me.getAttribute('data-auto');
  // v229 · Páginas horizontales: si el teléfono está vertical, girar desde el principio (la página hace lo mismo al cargar)
  if (me && innerHeight > innerWidth && (auto === 'partida' || (me.hasAttribute('data-girar') && matchMedia('(pointer:coarse)').matches))) document.documentElement.classList.add('rot');
  if (auto && !/[?&]editor=1/.test(location.search)) {
    let tipo = auto, fondo = me.getAttribute('data-fondo') || '';
    if (auto === 'partida') {        // Simulación: si el Choque viene del Modo Aventura se ven sus consejos; si viene del Arcade, los del Arcade
      tipo = 'choque';
      try { if (/[?&]modo=arcade/.test(location.search)) { const m = JSON.parse(L('chh_arcade_match') || 'null'); tipo = m && m.volver === 'nexotlan.html' ? 'nexotlan' : 'arcade'; } } catch (e) {}
    }
    const r = recibido();
    const go = () => mostrar(r ? { tipo, fondo, tip: [r.tt, r.x], hasta: r.fin } : { tipo, fondo });
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
})();
