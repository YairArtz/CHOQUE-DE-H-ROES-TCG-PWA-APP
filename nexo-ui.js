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
    azul:      { nom: 'Nexo azul',  sh: '60,90,180',  g1: '139,92,255', g2: '54,214,255',  b: ['#060a24', '#04061a', '#120a2e'], m: '#9fb6ff' },
    carmesi:   { nom: 'Carmesí',    sh: '150,40,70',  g1: '255,61,107', g2: '245,166,35',  b: ['#1a0612', '#0a0308', '#22080e'], m: '#ffb3c4' },
    jade:      { nom: 'Jade',       sh: '20,120,100', g1: '0,224,164',  g2: '54,214,255',  b: ['#03171a', '#020a0c', '#062218'], m: '#9fffe0' },
    solar:     { nom: 'Solar',      sh: '170,110,20', g1: '245,200,66', g2: '255,120,40',  b: ['#1a1206', '#0a0703', '#24140a'], m: '#ffe3a0' },
    obsidiana: { nom: 'Obsidiana',  sh: '95,40,150',  g1: '204,85,255', g2: '255,61,180',  b: ['#0e0619', '#050208', '#1c0a28'], m: '#e2b8ff' },
    abismo:    { nom: 'Abismo',     sh: '20,95,150',  g1: '54,214,255', g2: '0,255,200',   b: ['#021220', '#01060d', '#04202a'], m: '#a8f0ff' },
    plata:     { nom: 'Plata',      sh: '120,130,155',g1: '200,210,235',g2: '143,176,255', b: ['#0d1017', '#06070b', '#161a24'], m: '#e6ecff' }
  };
  const ajustes = () => { try { return JSON.parse(localStorage.getItem('chh_settings') || '{}') || {}; } catch (e) { return {}; } };

  const CSS = `
html:root:root,html.nx-ui body{--bg:#04061a!important;--bg2:rgba(9,13,40,.94)!important;--bg3:rgba(13,19,56,.9)!important;--border:rgba(143,176,255,.18)!important;
  --muted:#8d9bc7!important;--text:#eef2ff!important;--card:rgba(10,15,46,.92)!important}
html.nx-ui{background:var(--nx-b2,#04061a)!important}
html.nx-ui body{background:transparent!important}
html.nx-ui body::before,html.nx-ui body::after{display:none!important}
#nx-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;
  background:radial-gradient(ellipse 60% 70% at 78% 55%,rgba(var(--nx-g1),.24),transparent 70%),
             radial-gradient(ellipse 50% 40% at 10% 100%,rgba(var(--nx-g2),.10),transparent 70%),
             linear-gradient(160deg,var(--nx-b1) 0%,var(--nx-b2) 55%,var(--nx-b3) 100%)}
#nx-bg .nx-img{position:absolute;inset:0;background:center/cover no-repeat}
#nx-bg .nx-velo{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,6,26,.72),rgba(4,6,26,.6) 40%,rgba(4,6,26,.8))}
#nx-bg .nx-sh{position:absolute;top:-50%;height:200%;transform:rotate(36deg);
  background:linear-gradient(90deg,rgba(var(--nx-sh),0),rgba(var(--nx-sh),.4) 45%,rgba(var(--nx-sh),.16) 75%,rgba(var(--nx-sh),0))}
#nx-bg .a{left:38%;width:30vmax}#nx-bg .b{left:68%;width:12vmax;opacity:.55}#nx-bg .c{left:6%;width:7vmax;opacity:.35}
#nx-bg.foto .nx-sh{opacity:.35}
#nx-bg .nx-grid{position:absolute;inset:0;opacity:.35;background-image:linear-gradient(rgba(143,176,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(143,176,255,.05) 1px,transparent 1px);
  background-size:48px 48px;-webkit-mask-image:linear-gradient(180deg,transparent,#000 40%,transparent);mask-image:linear-gradient(180deg,transparent,#000 40%,transparent)}
#nx-bg i{position:absolute;width:3px;height:3px;border-radius:50%;background:var(--nx-m);box-shadow:0 0 6px var(--nx-m);opacity:0;animation:nxMote linear infinite}
@keyframes nxMote{0%{opacity:0;transform:translateY(0)}20%{opacity:.75}100%{opacity:0;transform:translateY(-34vh)}}
@media (prefers-reduced-motion:reduce){#nx-bg i{animation:none;display:none}}
/* Barras superiores */
html.nx-ui #chh-nav,html.nx-ui .top-bar{background:linear-gradient(180deg,rgba(4,6,26,.94),rgba(4,6,26,.78))!important;border-bottom:1px solid rgba(143,176,255,.16)!important;
  box-shadow:0 6px 18px rgba(0,0,0,.35)!important;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
/* Botón regresar (mismo estilo que el menú principal) */
html.nx-ui .nav-back,html.nx-ui .back-btn,html.nx-ui .btn-menu,html.nx-ui .nav-btn{background:rgba(10,15,46,.88)!important;border:1px solid rgba(143,176,255,.28)!important;border-radius:0!important;
  color:#eef2ff!important;text-shadow:none!important;box-shadow:none!important;clip-path:polygon(9px 0,100% 0,100% 100%,9px 100%,0 50%);padding-left:16px!important;
  font-family:'Orbitron',sans-serif!important;letter-spacing:.06em!important;transition:color .15s,border-color .15s,background .15s}
html.nx-ui .nav-back:hover,html.nx-ui .back-btn:hover,html.nx-ui .btn-menu:hover,html.nx-ui .nav-btn:hover,
html.nx-ui .nav-back:focus-visible,html.nx-ui .back-btn:focus-visible,html.nx-ui .btn-menu:focus-visible,html.nx-ui .nav-btn:focus-visible{color:#f5c842!important;border-color:#f5c842!important;background:rgba(20,26,70,.95)!important;outline:none}
/* El botón flotante de música queda discreto */
html.nx-ui #bgm-btn{background:rgba(10,15,46,.85)!important;border-color:rgba(143,176,255,.25)!important}
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
  function aplicar() {
    const s = ajustes(), root = document.documentElement;
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
  window.NX_UI = { paletas: PALETAS, aplicar };
  aplicar();
  document.addEventListener('DOMContentLoaded', aplicar);
  window.addEventListener('load', () => { estilo(); aplicar(); });
  window.addEventListener('storage', e => { if (e.key === 'chh_settings') aplicar(); });
})();
