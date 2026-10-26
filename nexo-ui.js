// ════════════════════════════════════════════════════════════════════
//  NEXO UI — capa visual común (estética del menú principal) para todos los módulos.
//  · Fondo: haces de luz en diagonal + partículas, en la gama del fondo elegido en la Tienda.
//    - chh_settings.fondoGen  = id de una gama generada (azul, carmesi, jade, solar, obsidiana, abismo, plata)
//    - chh_settings.fondoImg  = imagen comprada (se muestra con un velo oscuro para que todo se lea)
//    - sin nada               = Nexo azul
//  · Paleta base azul-noche (los colores de acento siguen siendo los del TEMA equipado).
//  · Botón "regresar" y barras superiores con el mismo estilo del menú.
//  Se incluye con <script src="nexo-ui.js"></script> en el <head>. En tema claro no hace nada.
// ════════════════════════════════════════════════════════════════════
(function () {
  if (window.NX_UI) return;
  const PALETAS = {
    azul:      { w: [.6, .85, 1.9],  ln: '143,176,255', nom: 'Nexo azul',  sh: '60,90,180',  g1: '139,92,255', g2: '54,214,255',  b: ['#060a24', '#04061a', '#120a2e'], m: '#9fb6ff' },
    carmesi:   { w: [1.7, .6, .95],  ln: '255,150,175', nom: 'Carmesí',    sh: '150,40,70',  g1: '255,61,107', g2: '245,166,35',  b: ['#1a0612', '#0a0308', '#22080e'], m: '#ffb3c4' },
    jade:      { w: [.45, 1.4, 1.2],  ln: '120,240,205', nom: 'Jade',       sh: '20,120,100', g1: '0,224,164',  g2: '54,214,255',  b: ['#03171a', '#020a0c', '#062218'], m: '#9fffe0' },
    solar:     { w: [1.75, 1.15, .45], ln: '255,215,140', nom: 'Solar',      sh: '170,110,20', g1: '245,200,66', g2: '255,120,40',  b: ['#1a1206', '#0a0703', '#24140a'], m: '#ffe3a0' },
    obsidiana: { w: [1.2, .55, 1.8],  ln: '215,160,255', nom: 'Obsidiana',  sh: '95,40,150',  g1: '204,85,255', g2: '255,61,180',  b: ['#0e0619', '#050208', '#1c0a28'], m: '#e2b8ff' },
    abismo:    { w: [.4, 1.1, 1.65],  ln: '130,225,255', nom: 'Abismo',     sh: '20,95,150',  g1: '54,214,255', g2: '0,255,200',   b: ['#021220', '#01060d', '#04202a'], m: '#a8f0ff' },
    plata:     { w: [1, 1.05, 1.3],   ln: '200,210,235', nom: 'Plata',      sh: '120,130,155',g1: '200,210,235',g2: '143,176,255', b: ['#0d1017', '#06070b', '#161a24'], m: '#e6ecff' }
  };
  const ajustes = () => { try { return JSON.parse(localStorage.getItem('chh_settings') || '{}') || {}; } catch (e) { return {}; } };

  const CSS = `
html:root:root,html.nx-ui body{--bg:rgb(var(--nx-k1))!important;--bg2:rgba(var(--nx-k3),.94)!important;--bg3:rgba(var(--nx-k4),.9)!important;--border:rgba(var(--nx-ln),.18)!important;
  --muted:#8d9bc7!important;--text:#eef2ff!important;--card:rgba(var(--nx-k4),.92)!important}
html.nx-ui{background:var(--nx-b2,#04061a)!important}
html.nx-ui body{background:transparent!important}
html.nx-ui body::before,html.nx-ui body::after{display:none!important}
#nx-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;
  background:radial-gradient(ellipse 60% 70% at 78% 55%,rgba(var(--nx-g1),.24),transparent 70%),
             radial-gradient(ellipse 50% 40% at 10% 100%,rgba(var(--nx-g2),.10),transparent 70%),
             linear-gradient(160deg,var(--nx-b1) 0%,var(--nx-b2) 55%,var(--nx-b3) 100%)}
#nx-bg .nx-img{position:absolute;inset:0;background:center/cover no-repeat}
#nx-bg .nx-velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(var(--nx-k1),.72),rgba(var(--nx-k1),.6) 40%,rgba(var(--nx-k1),.8))}
#nx-bg .nx-sh{position:absolute;top:-50%;height:200%;transform:rotate(36deg);
  background:linear-gradient(90deg,rgba(var(--nx-sh),0),rgba(var(--nx-sh),.4) 45%,rgba(var(--nx-sh),.16) 75%,rgba(var(--nx-sh),0))}
#nx-bg .a{left:38%;width:30vmax}#nx-bg .b{left:68%;width:12vmax;opacity:.55}#nx-bg .c{left:6%;width:7vmax;opacity:.35}
#nx-bg.foto .nx-sh{opacity:.35}
#nx-bg .nx-grid{position:absolute;inset:0;opacity:.35;background-image:linear-gradient(rgba(var(--nx-ln),.05) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--nx-ln),.05) 1px,transparent 1px);
  background-size:48px 48px;-webkit-mask-image:linear-gradient(180deg,transparent,#000 40%,transparent);mask-image:linear-gradient(180deg,transparent,#000 40%,transparent)}
#nx-bg i{position:absolute;width:3px;height:3px;border-radius:50%;background:var(--nx-m);box-shadow:0 0 6px var(--nx-m);opacity:0;animation:nxMote linear infinite}
@keyframes nxMote{0%{opacity:0;transform:translateY(0)}20%{opacity:.75}100%{opacity:0;transform:translateY(-34vh)}}
@media (prefers-reduced-motion:reduce){#nx-bg i{animation:none;display:none}}
/* Barras superiores */
html.nx-ui #chh-nav,html.nx-ui .top-bar{background:linear-gradient(180deg,rgba(var(--nx-k1),.94),rgba(var(--nx-k1),.78))!important;border-bottom:1px solid rgba(var(--nx-ln),.16)!important;
  box-shadow:0 6px 18px rgba(0,0,0,.35)!important;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
/* Botón regresar (mismo estilo que el menú principal) */
html.nx-ui .nav-back,html.nx-ui .back-btn,html.nx-ui .btn-menu,html.nx-ui .nav-btn{background:rgba(var(--nx-k4),.88)!important;border:1px solid rgba(var(--nx-ln),.28)!important;border-radius:0!important;
  color:#eef2ff!important;text-shadow:none!important;box-shadow:none!important;clip-path:polygon(9px 0,100% 0,100% 100%,9px 100%,0 50%);padding-left:16px!important;
  font-family:'Orbitron',sans-serif!important;letter-spacing:.06em!important;transition:color .15s,border-color .15s,background .15s}
html.nx-ui .nav-back:hover,html.nx-ui .back-btn:hover,html.nx-ui .btn-menu:hover,html.nx-ui .nav-btn:hover,
html.nx-ui .nav-back:focus-visible,html.nx-ui .back-btn:focus-visible,html.nx-ui .btn-menu:focus-visible,html.nx-ui .nav-btn:focus-visible{color:#f5c842!important;border-color:#f5c842!important;background:rgba(var(--nx-k5),.95)!important;outline:none}
/* El botón flotante de música queda discreto */
html.nx-ui #bgm-btn{background:rgba(var(--nx-k4),.85)!important;border-color:rgba(var(--nx-ln),.25)!important}
/* ═══ Barra superior común (v189) ═══ */
html.nx-ui .nx-barra{view-transition-name:nx-barra;justify-content:flex-start!important;gap:12px!important;align-self:stretch;max-width:100%;min-width:0;box-sizing:border-box}
html.nx-ui .nx-barra .nav-logo,html.nx-ui .nx-barra .nav-spacer,html.nx-ui .nx-barra > img{display:none!important}
html.nx-ui .nx-barra.nx-flex{display:flex!important;align-items:center!important}
html.nx-ui .nx-barra.nx-flex > *{position:static!important}
html.nx-ui .nx-barra .nx-volver{width:42px!important;min-width:42px;height:38px!important;padding:0 0 0 6px!important;display:inline-flex!important;align-items:center;justify-content:center;
  font-size:22px!important;line-height:1!important;font-weight:400!important;flex-shrink:0;text-decoration:none!important;margin:0!important;position:static!important;transform:none!important}
html.nx-ui .nx-barra .nx-titulo{flex:1 1 auto;min-width:0;margin:0!important;text-align:left!important;font-family:'Orbitron',sans-serif!important;font-weight:900!important;
  font-size:clamp(16px,4.4vw,24px)!important;letter-spacing:.06em!important;text-transform:uppercase;line-height:1.05!important;color:#eef2ff!important;-webkit-text-fill-color:#eef2ff!important;
  background:none!important;text-shadow:none!important;border-left:4px solid var(--neon,#f5c842);padding:0 0 0 12px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
html.nx-ui .nx-barra .nx-titulo small,html.nx-ui .nx-barra .nx-titulo .h-subtitle{text-transform:none;-webkit-text-fill-color:currentColor}
html.nx-ui .nx-acc{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0}
html.nx-ui .nx-barra .nx-titulo ~ .nx-acc{margin-left:0}
html.nx-ui .nx-hp{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 8px;font:700 14px 'Orbitron',sans-serif;color:#f5c842;text-decoration:none;
  background:rgba(var(--nx-k4),.88);border:1px solid rgba(245,200,66,.35);clip-path:polygon(0 0,100% 0,calc(100% - 8px) 100%,0 100%)}
html.nx-ui .nx-hp img{width:20px;height:20px}
html.nx-ui .nx-hp:hover,html.nx-ui .nx-hp:focus-visible{outline:2px solid #fff;outline-offset:-2px}
html.nx-ui .nx-barra.nx-apretado .nx-hp{display:none}
html.nx-ui .nx-acc #bgm-btn{position:static!important;inset:auto!important;width:36px!important;height:36px!important;opacity:1!important;flex-shrink:0;transform:none}
@media (max-width:420px){html.nx-ui .nx-hp{padding:0 9px 0 6px;font-size:13px}html.nx-ui .nx-hp img{width:17px;height:17px}}
`;

  function estilo() {
    let st = document.getElementById('nx-ui-css');
    if (!st) { st = document.createElement('style'); st.id = 'nx-ui-css'; st.textContent = CSS; }
    (document.head || document.documentElement).appendChild(st);   // siempre al final del <head>: gana a los estilos del módulo y de settings.js
  }
  function capa() {
    if (!document.body) return null;
    let bg = document.getElementById('nx-bg');
    if (!bg) {
      bg = document.createElement('div'); bg.id = 'nx-bg'; bg.setAttribute('aria-hidden', 'true');
      let h = '<div class="nx-img"></div><div class="nx-velo"></div><div class="nx-grid"></div><div class="nx-sh c"></div><div class="nx-sh a"></div><div class="nx-sh b"></div>';
      for (let k = 0; k < 18; k++) h += `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(40 + Math.random() * 70).toFixed(1)}%;animation-duration:${(8 + Math.random() * 10).toFixed(1)}s;animation-delay:${(-Math.random() * 14).toFixed(1)}s"></i>`;
      bg.innerHTML = h;
      document.body.insertBefore(bg, document.body.firstChild);
    }
    return bg;
  }
  // Niveles de oscuridad (del más oscuro al más claro) teñidos con la gama: --nx-k1 … --nx-k7 y el color de líneas --nx-ln
  const NIVELES = [4, 8, 12, 16, 22, 30, 40];
  function tinte(p) {
    const w = p.w || PALETAS.azul.w, r = document.documentElement;
    NIVELES.forEach((l, i) => r.style.setProperty('--nx-k' + (i + 1), w.map(x => Math.min(255, Math.round(l * x + 4 * x))).join(',')));
    r.style.setProperty('--nx-ln', p.ln || PALETAS.azul.ln);
  }
  function aplicar() {
    const s = ajustes(), root = document.documentElement;
    tinte(PALETAS[s.fondoGen] || PALETAS.azul);
    if (s.theme === 'light') { root.classList.remove('nx-ui'); const b = document.getElementById('nx-bg'); if (b) b.remove(); const c = document.getElementById('nx-ui-css'); if (c) c.remove(); return; }
    root.classList.add('nx-ui'); estilo();
    const bg = capa(); if (!bg) return;
    const p = PALETAS[s.fondoGen] || PALETAS.azul;
    const set = (k, v) => { bg.style.setProperty(k, v); root.style.setProperty(k, v); };
    set('--nx-sh', p.sh); set('--nx-g1', p.g1); set('--nx-g2', p.g2); set('--nx-b1', p.b[0]); set('--nx-b2', p.b[1]); set('--nx-b3', p.b[2]); set('--nx-m', p.m);
    const foto = !s.fondoGen && s.fondoImg;
    bg.classList.toggle('foto', !!foto);
    const img = bg.querySelector('.nx-img'), velo = bg.querySelector('.nx-velo');
    img.style.backgroundImage = foto ? 'url("' + String(s.fondoImg).replace(/"/g, '%22') + '")' : 'none';
    velo.style.display = foto ? '' : 'none';
    try { let m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', p.b[1]); } catch (e) {}
  }
  // ════════════════════════════════════════════════════════════════
  //  VENTANAS DE AVISO con el estilo de la app (reemplazan confirm/alert/prompt del navegador,
  //  que bloquean la página, dejan vibrando el control y no se pueden usar con él).
  //    NX_UI.confirmar(mensaje, {titulo, si, no, peligro})  → Promise<boolean>
  //    NX_UI.alerta(mensaje, {titulo, ok})                    → Promise<void>
  //    NX_UI.pedir(mensaje, valor, {titulo, max})             → Promise<string|null>
  //  Control: A acepta el botón enfocado · B cancela. Teclado: Enter / Esc.
  // ════════════════════════════════════════════════════════════════
  const DLG_CSS = `
#nxDlg{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,3,12,.72);
  -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .16s;font-family:'Rajdhani',system-ui,sans-serif}
#nxDlg.on{opacity:1}
#nxDlg .bx{width:min(440px,100%);max-height:88vh;overflow:auto;background:rgb(var(--nx-k3,12,17,48));color:#eef2ff;border:1px solid rgba(var(--nx-ln,143,176,255),.28);
  border-top:3px solid var(--neon,#f5c842);clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%);padding:20px 20px 16px;transform:translateY(10px);transition:transform .16s;
  box-shadow:0 18px 50px rgba(0,0,0,.6)}
#nxDlg.on .bx{transform:none}
#nxDlg .t{font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;letter-spacing:.06em;margin-bottom:10px;color:var(--neon,#f5c842)}
#nxDlg .m{font-size:17px;font-weight:600;line-height:1.45;white-space:pre-line;color:#dfe5ff}
#nxDlg input{width:100%;margin-top:14px;min-height:44px;padding:8px 12px;font:600 17px 'Rajdhani',sans-serif;color:#eef2ff;background:rgba(0,0,0,.35);border:1px solid rgba(var(--nx-ln,143,176,255),.3);outline:none}
#nxDlg input:focus{border-color:var(--neon,#f5c842)}
#nxDlg .b{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}
#nxDlg button{min-width:118px;min-height:44px;padding:0 18px;font:700 13px 'Orbitron',sans-serif;letter-spacing:.06em;cursor:pointer;border:1px solid rgba(var(--nx-ln,143,176,255),.3);
  background:transparent;color:#eef2ff;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)}
#nxDlg button.si{background:var(--neon,#f5c842);color:#04061a;border-color:transparent}
#nxDlg button.si.peligro{background:#ff5c7a;color:#fff}
#nxDlg button:hover,#nxDlg button:focus-visible,#nxDlg button.gp-foco{outline:2px solid #fff;outline-offset:-3px}
#nxDlg .gp{display:none;margin-top:12px;font-size:13px;color:#8d9bc7;text-align:right}
html.gp-on #nxDlg .gp{display:block}
#nxDlg .gp i{font-style:normal;display:inline-block;padding:0 5px;border-radius:4px;background:#9fb3cc;color:#04061a;font-weight:700;font-size:11px;margin:0 2px}
@media (prefers-reduced-motion:reduce){#nxDlg,#nxDlg .bx{transition:none}}`;
  const cola = [];
  let abierto = false;
  function dialogo(o) {
    return new Promise(res => { cola.push({ o, res }); if (!abierto) siguiente(); });
  }
  function siguiente() {
    const it = cola.shift(); if (!it) { abierto = false; return; }
    abierto = true;
    if (!document.getElementById('nxDlgCss')) { const st = document.createElement('style'); st.id = 'nxDlgCss'; st.textContent = DLG_CSS; (document.head || document.documentElement).appendChild(st); }
    const o = it.o, esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const d = document.createElement('div'); d.id = 'nxDlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="bx">' + (o.titulo ? '<div class="t">' + esc(o.titulo) + '</div>' : '') + '<div class="m">' + esc(o.msg) + '</div>' +
      (o.campo ? '<input type="text" maxlength="' + (o.max || 60) + '" value="' + esc(o.valor) + '">' : '') +
      '<div class="b">' + (o.no ? '<button type="button" class="no">' + esc(o.no) + '</button>' : '') + '<button type="button" class="si' + (o.peligro ? ' peligro' : '') + '">' + esc(o.si) + '</button></div>' +
      '<div class="gp"><i>A</i> elegir' + (o.no ? ' · <i>B</i> ' + esc(o.no.toLowerCase()) : '') + '</div></div>';
    document.body.appendChild(d);
    const bSi = d.querySelector('.si'), bNo = d.querySelector('.no'), inp = d.querySelector('input');
    const antes = document.activeElement, gpAntes = window.GP_CFG, gpFocoAntes = window.GP && GP.foco && GP.foco();
    // Mientras está abierta, el control solo se mueve dentro de la ventana
    window.GP_CFG = { ambito: () => d, inicial: () => o.no && o.peligro ? bNo : bSi, principal: () => bSi, principalTxt: o.si,
      atras: () => { fin(o.no ? false : true); return true; }, lbrb: () => true, gatillo: () => true };
    let hecho = false;
    function fin(ok) {
      if (hecho) return; hecho = true;
      document.removeEventListener('keydown', tecla, true);
      d.classList.remove('on'); setTimeout(() => d.remove(), 160);
      window.GP_CFG = gpAntes;
      try { window.GP && GP.parar && GP.parar(); } catch (e) {}
      const v = o.campo ? (ok ? inp.value.trim() : null) : (o.no ? ok : undefined);
      setTimeout(() => {
        try { if (window.GP && GP.activo && GP.activo() && gpFocoAntes && document.contains(gpFocoAntes)) GP.enfocar(gpFocoAntes); else if (antes && antes.focus && document.contains(antes)) antes.focus({ preventScroll: true }); } catch (e) {}
        it.res(v); siguiente();
      }, 30);
    }
    function tecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fin(false); }
      else if (e.key === 'Enter' && (e.target === inp || !e.target.closest || !e.target.closest('#nxDlg button'))) { e.preventDefault(); e.stopPropagation(); fin(true); }
      else if (e.key === 'Tab') { const L = [inp, bNo, bSi].filter(Boolean), i = L.indexOf(document.activeElement); e.preventDefault(); L[(i + (e.shiftKey ? -1 : 1) + L.length) % L.length].focus(); }
    }
    document.addEventListener('keydown', tecla, true);
    bSi.onclick = () => fin(true); if (bNo) bNo.onclick = () => fin(false);
    d.addEventListener('click', e => { if (e.target === d && o.no) fin(false); });
    requestAnimationFrame(() => { d.classList.add('on');
      const f = inp || (o.no && o.peligro ? bNo : bSi);
      try { if (window.GP && GP.activo && GP.activo() && !inp) GP.enfocar(f); else { f.focus({ preventScroll: true }); if (inp) inp.select(); } } catch (e) { f.focus(); } });
  }
  const confirmar = (msg, op) => dialogo(Object.assign({ msg, si: 'Aceptar', no: 'Cancelar' }, op || {}));
  const alerta = (msg, op) => dialogo(Object.assign({ msg, si: 'Entendido' }, op || {}));
  const pedir = (msg, valor, op) => dialogo(Object.assign({ msg, valor: valor || '', campo: true, si: 'Aceptar', no: 'Cancelar' }, op || {}));

  window.NX_UI = { paletas: PALETAS, aplicar, confirmar, alerta, pedir };
  aplicar();
  document.addEventListener('DOMContentLoaded', aplicar);

  // ════════════════════════════════════════════════════════════════
  //  BARRA SUPERIOR COMÚN: mismo botón de regresar, título con el mismo estilo,
  //  saldo de Hero Pesos y botón de música. No cambia la estructura de cada módulo:
  //  solo unifica lo que ya tiene. Una página puede evitarlo con <body data-nx-barra="no">.
  // ════════════════════════════════════════════════════════════════
  const BASE = (() => { try { const s = document.currentScript && document.currentScript.src; return s ? new URL('.', s).href : ''; } catch (e) { return ''; } })();
  const SIN_HP = /\/(tienda|index)\.html$|\/$/;
  function unificarBarra() {
    if (!document.documentElement.classList.contains('nx-ui') || document.body.dataset.nxBarra === 'no' || document.querySelector('.nx-barra')) return;
    const VOLVER = '.nav-back,.back-btn,.btn-menu,.nav-btn';
    const bar = [...document.querySelectorAll('#chh-nav,.top-bar,body > header,body > nav,body > .container > header,body > div > header')]
      .find(el => el.querySelector(VOLVER) && el.getBoundingClientRect().top < 200);
    if (!bar) return;
    bar.classList.add('nx-barra');
    if (getComputedStyle(bar).display !== 'flex') bar.classList.add('nx-flex');
    const back = bar.querySelector(VOLVER);
    if (back && back.parentElement === bar && bar.firstElementChild !== back) bar.insertBefore(back, bar.firstChild);   // regresar siempre a la izquierda
    if (back && /^\s*(◀|←|‹|<|⬅|volver|men[uú]|inicio)/i.test(back.textContent || '')) {
      back.classList.add('nx-volver'); back.textContent = '‹';
      if (!back.getAttribute('aria-label')) back.setAttribute('aria-label', 'Regresar');
    }
    const tit = ['.h-title', '.nav-title', '.top-title', '.header-title', 'h1'].map(q => bar.querySelector(q)).find(Boolean);
    if (tit) {
      tit.classList.add('nx-titulo');
      // Sin emoji al inicio del título (el estilo ya lo distingue)
      const w = document.createTreeWalker(tit, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { if (!n.nodeValue.trim()) continue; n.nodeValue = n.nodeValue.replace(/^[\s\u2600-\u27BF\uFE0F\u200D\u2B00-\u2BFF]*(?:[\uD83C-\uDBFF][\uDC00-\uDFFF][\uFE0F\u200D\s]*)*/, ''); break; }
    }
    // Saldo de Hero Pesos y música, a la derecha
    const acc = document.createElement('div'); acc.className = 'nx-acc';
    let ses = null; try { ses = JSON.parse(localStorage.getItem('nhSesion') || 'null'); } catch (e) {}
    const hp = localStorage.getItem('chh_hp_cache');
    if (ses && ses.tipo !== 'tienda' && hp != null && !SIN_HP.test(location.pathname) && !bar.querySelector('.nav-pts')) {
      acc.innerHTML = '<a class="nx-hp" href="' + BASE + 'tienda.html" aria-label="Hero Pesos: ' + hp + '"><img src="' + BASE + 'hero_pesos/hp_coin.png" alt="" onerror="this.remove()">' + String(hp).replace(/[^0-9]/g, '') + '</a>';
    }
    bar.appendChild(acc);
    const pos = getComputedStyle(bar).position;
    const fija = pos === 'sticky' || pos === 'fixed';
    const moverMusica = () => { const b = document.getElementById('bgm-btn'); if (b && fija && !acc.contains(b)) acc.appendChild(b); ajustar(); };
    // Si no cabe todo, se oculta el saldo (el título y los botones del módulo tienen prioridad)
    const ajustar = () => { bar.classList.remove('nx-apretado');
      const corto = tit && (tit.scrollWidth > tit.clientWidth + 1 || tit.getBoundingClientRect().width < 110);
      if (bar.scrollWidth > bar.clientWidth + 2 || corto) bar.classList.add('nx-apretado'); };
    moverMusica(); setTimeout(moverMusica, 400); window.addEventListener('load', moverMusica);
    window.addEventListener('resize', ajustar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', unificarBarra); else unificarBarra();
  window.addEventListener('load', () => { estilo(); aplicar(); });
  window.addEventListener('storage', e => { if (e.key === 'chh_settings') aplicar(); });
})();
