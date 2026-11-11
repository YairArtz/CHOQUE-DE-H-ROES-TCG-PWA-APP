/* ============================================================
   revelacion.js · Revelación épica de carta (Nexo de Héroes)
   Uso:
     await Revelacion.mostrar({
       img: 'ruta/carta.png',      // frente
       dorso: 'ruta/dorso.png',    // opcional (si no, dorso CSS)
       nombre: 'Vellond Omega',
       rareza: 'secreta',          // comun|poco_comun|rara|foil|foil_poco_comun|secreta
       desde: elementoDeLaGrilla,  // opcional: la carta sale y regresa a su lugar
       onRevelar: () => {}         // opcional: sonido / vibración extra
     });
   Toque, clic, Enter, Espacio o Esc = saltar. Respeta prefers-reduced-motion.
   v250 · Integrado en Tienda (sobres: secreta y foil) y Nexotlan (Comerciante: Joyas).
     · raiz: elemento donde se monta (Nexotlan usa #stage, que va girado 90° en celular vertical)
     · Sin dorso: usa la mica equipada (cosmeticos.js) o el reverso clásico
   ============================================================ */
(function () {
  'use strict';

  const ESTILOS = {
    secreta:         { titulo: '¡SECRETA!',      c1: '#cc55ff', c2: '#f5a623', giros: 2 },
    joya:            { titulo: '¡JOYA!',         c1: '#ffd166', c2: '#ff2f5a', giros: 2 },
    foil:            { titulo: '¡FOIL!',         c1: '#f5a623', c2: '#fff3c4', giros: 1 },
    foil_poco_comun: { titulo: '¡FOIL!',         c1: '#f5a623', c2: '#cc55ff', giros: 1 },
    rara:            { titulo: '¡RARA!',         c1: '#4fc3ff', c2: '#cc55ff', giros: 0 },
    poco_comun:      { titulo: '',               c1: '#9aa4b5', c2: '#ffffff', giros: 0 },
    comun:           { titulo: '',               c1: '#9aa4b5', c2: '#ffffff', giros: 0 }
  };

  const CSS = `
  .rv-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
    flex-direction:column;background:radial-gradient(circle at 50% 45%,rgba(90,20,140,.55),rgba(6,0,14,.92) 70%);
    opacity:0;transition:opacity .25s ease;perspective:1200px;overflow:hidden;cursor:pointer;
    -webkit-tap-highlight-color:transparent}
  .rv-ov.on{opacity:1}
  .rv-ov.local{position:absolute}
  .rv-ov.local .rv-flash{position:absolute}
  .rv-stage{position:relative;width:var(--rv-w);height:var(--rv-h)}
  .rv-card{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
  .rv-face{position:absolute;inset:0;border-radius:4.5%;overflow:hidden;backface-visibility:hidden;
    -webkit-backface-visibility:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.15),0 18px 50px rgba(0,0,0,.6)}
  .rv-face img{width:100%;height:100%;object-fit:cover;display:block}
  .rv-back{background:repeating-radial-gradient(circle at 50% 50%,#2a1206 0 6px,#5a2a0c 7px 9px,#1a0a04 10px 15px);
    border:3px solid #f5a623}
  .rv-back::after{content:'';position:absolute;inset:0;background:radial-gradient(circle,rgba(0,0,0,.85) 0 18%,transparent 55%)}
  .rv-front{transform:rotateY(180deg)}
  .rv-sheen{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 35%,
    rgba(255,255,255,.75) 47%,rgba(255,255,255,.15) 53%,transparent 62%);transform:translateX(-160%);mix-blend-mode:screen}
  .rv-sheen.go{animation:rvSheen .8s ease-in-out 2 forwards}
  @keyframes rvSheen{to{transform:translateX(160%)}}
  .rv-glow{position:absolute;left:50%;top:50%;width:220%;aspect-ratio:1;border-radius:50%;pointer-events:none;
    transform:translate(-50%,-50%) scale(.3);opacity:0;
    background:radial-gradient(circle,var(--rv-c1) 0%,color-mix(in srgb,var(--rv-c1) 40%,transparent) 30%,transparent 62%)}
  .rv-glow.go{animation:rvGlow 1.4s ease-out forwards}
  @keyframes rvGlow{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}25%{opacity:1}
    100%{opacity:.55;transform:translate(-50%,-50%) scale(1)}}
  .rv-ring{position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;border-radius:50%;pointer-events:none;
    transform:translate(-50%,-50%) scale(.4);opacity:0;border:10px solid var(--rv-c1);
    box-shadow:0 0 30px var(--rv-c1),inset 0 0 30px var(--rv-c2);filter:blur(1px)}
  .rv-ring.go{animation:rvRing .75s cubic-bezier(.2,.7,.3,1) forwards}
  @keyframes rvRing{0%{opacity:.95;transform:translate(-50%,-50%) scale(.4);border-color:var(--rv-c1)}
    100%{opacity:0;transform:translate(-50%,-50%) scale(2.4);border-color:var(--rv-c2);border-width:2px}}
  .rv-flash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none}
  .rv-flash.go{animation:rvFlash .35s ease-out}
  @keyframes rvFlash{0%{opacity:.85}100%{opacity:0}}
  .rv-txt{margin-top:22px;text-align:center;font-family:Orbitron,system-ui,sans-serif;pointer-events:none}
  .rv-tit{font-size:clamp(26px,6vw,44px);font-weight:900;letter-spacing:1px;color:#fff;opacity:0;transform:scale(1.8);
    background:linear-gradient(180deg,#fff 30%,var(--rv-c2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
    filter:drop-shadow(0 0 8px var(--rv-c1)) drop-shadow(0 2px 0 rgba(0,0,0,.7))}
  .rv-tit.go{animation:rvPop .45s cubic-bezier(.3,1.6,.5,1) forwards}
  @keyframes rvPop{to{opacity:1;transform:scale(1)}}
  .rv-nom{margin-top:6px;font-size:clamp(11px,2.6vw,15px);font-weight:700;letter-spacing:2px;color:#f3e9ff;
    text-transform:uppercase;opacity:0;transform:translateY(8px);transition:opacity .35s .15s,transform .35s .15s}
  .rv-nom.go{opacity:1;transform:none}
  .rv-spk{position:absolute;width:var(--s);height:var(--s);pointer-events:none;opacity:0;
    background:#fff;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);
    filter:drop-shadow(0 0 4px var(--rv-c2));animation:rvTw 1.1s ease-in-out var(--d) infinite}
  @keyframes rvTw{0%,100%{opacity:0;transform:scale(.2) rotate(0)}50%{opacity:1;transform:scale(1) rotate(45deg)}}
  .rv-hint{position:absolute;bottom:18px;font:600 11px Orbitron,system-ui,sans-serif;letter-spacing:2px;color:rgba(255,255,255,.35)}
  .rv-burst{position:fixed;pointer-events:none;z-index:99999}.rv-burst.local{position:absolute}
  .rv-burst i{position:absolute;width:10px;height:10px;background:#fff;
    clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);animation:rvB .6s ease-out forwards}
  @keyframes rvB{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--x),var(--y)) scale(.2);opacity:0}}
  `;

  function inyectarCSS() {
    if (document.getElementById('rv-css')) return;
    const s = document.createElement('style');
    s.id = 'rv-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  const espera = (ms, sig) => new Promise(r => {
    const t = setTimeout(r, ms);
    sig && sig.addEventListener('abort', () => { clearTimeout(t); r(); }, { once: true });
  });

  function anim(el, frames, opts) {
    const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
    return a.finished.catch(() => {});
  }

  function chispas(stage, n) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'rv-spk';
      const ang = Math.random() * Math.PI * 2, rad = 52 + Math.random() * 18;
      s.style.left = (50 + Math.cos(ang) * rad) + '%';
      s.style.top = (50 + Math.sin(ang) * rad * 0.8) + '%';
      s.style.setProperty('--s', (8 + Math.random() * 14) + 'px');
      s.style.setProperty('--d', (Math.random() * 1.1).toFixed(2) + 's');
      stage.appendChild(s);
    }
  }

  // Centro de un elemento en coordenadas de la raíz (funciona aunque la raíz esté girada o escalada)
  function centro(el, raiz) {
    if (raiz === document.body) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
    let x = 0, y = 0, n = el;
    while (n && n !== raiz) { x += n.offsetLeft; y += n.offsetTop; const p = n.offsetParent; for (let a = n.parentElement; a && a !== p && a !== raiz; a = a.parentElement) { x -= a.scrollLeft; y -= a.scrollTop; } if (p) { x -= p.scrollLeft || 0; y -= p.scrollTop || 0; } n = p; }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2, w: el.offsetWidth };
  }
  async function dorsoPorDefecto() {
    try { if (window.CHH_COSM && CHH_COSM.imagenEquipada) { const s = await Promise.race([CHH_COSM.imagenEquipada('mica'), espera(800).then(() => null)]); if (s) return s; } } catch (e) {}
    return 'img/simulacion/reverso.jpg';
  }

  function estallido(x, y, color, raiz) {
    const b = document.createElement('div');
    b.className = 'rv-burst' + (raiz && raiz !== document.body ? ' local' : ''); b.style.left = x + 'px'; b.style.top = y + 'px';
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('i'), a = i / 10 * Math.PI * 2;
      p.style.setProperty('--x', Math.cos(a) * 46 + 'px');
      p.style.setProperty('--y', Math.sin(a) * 46 + 'px');
      p.style.filter = `drop-shadow(0 0 4px ${color})`;
      b.appendChild(p);
    }
    (raiz || document.body).appendChild(b);
    setTimeout(() => b.remove(), 700);
  }

  async function mostrar(o) {
    inyectarCSS();
    const est = ESTILOS[o.rareza] || ESTILOS.secreta;
    const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const raiz = o.raiz || document.body, local = raiz !== document.body;
    if (!o.dorso) o.dorso = await dorsoPorDefecto();

    // Tamaño final de la carta (proporción 63x88)
    const alto = local ? (raiz.clientHeight || innerHeight) : innerHeight;
    const h = Math.min(alto * 0.58, 460), w = h * 63 / 88;

    const ov = document.createElement('div');
    ov.className = 'rv-ov' + (local ? ' local' : '');
    ov.style.setProperty('--rv-w', w + 'px');
    ov.style.setProperty('--rv-h', h + 'px');
    ov.style.setProperty('--rv-c1', est.c1);
    ov.style.setProperty('--rv-c2', est.c2);
    ov.innerHTML = `
      <div class="rv-stage">
        <div class="rv-glow"></div><div class="rv-ring"></div>
        <div class="rv-card">
          <div class="rv-face rv-back">${o.dorso ? `<img src="${o.dorso}" alt="" onerror="this.remove()">` : ''}</div>
          <div class="rv-face rv-front"><img src="${o.img}" alt=""><div class="rv-sheen"></div></div>
        </div>
      </div>
      <div class="rv-txt"><div class="rv-tit">${est.titulo}</div><div class="rv-nom">${o.nombre || ''}</div></div>
      <div class="rv-flash"></div>
      <div class="rv-hint">TOCA PARA CONTINUAR</div>`;
    raiz.appendChild(ov);

    const $ = s => ov.querySelector(s);
    const card = $('.rv-card'), stage = $('.rv-stage');
    const ctl = new AbortController(), sig = ctl.signal;
    let revelada = false;
    ov.addEventListener('click', e => { e.stopPropagation(); if (revelada) ctl.abort(); });
    const tecla = e => { if (['Enter', ' ', 'Escape'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); if (revelada) ctl.abort(); } };
    document.addEventListener('keydown', tecla, true);

    // Precargar el frente para que no aparezca en blanco al voltear
    await new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = o.img; });

    // 1) La carta sale de su lugar en la grilla hacia el centro
    let desdeT = 'translate(0,40px) scale(.6)';
    if (o.desde) {
      const a = centro(o.desde, raiz), b = centro(stage, raiz);
      const dx = a.x - b.x, dy = a.y - b.y;
      desdeT = `translate(${dx}px,${dy}px) scale(${a.w / w})`;
      o.desde.style.visibility = 'hidden';
    }
    requestAnimationFrame(() => ov.classList.add('on'));

    if (reducido) {
      card.style.transform = 'rotateY(180deg)';
    } else {
      await anim(card, [{ transform: desdeT + ' rotateY(0)' }, { transform: 'translate(0,0) scale(1) rotateY(0)' }],
        { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });

      // 2) Suspenso: medio giro de canto y regresa al dorso (como en la referencia)
      for (let i = 0; i < est.giros; i++) {
        await anim(card, [
          { transform: 'rotateY(0) scale(1)' },
          { transform: 'rotateY(80deg) scale(1.04)', offset: .5 },
          { transform: 'rotateY(0) scale(1)' }], { duration: 380 + i * 60, easing: 'ease-in-out' });
        await espera(90);
      }

      // 3) Volteo final
      await anim(card, [{ transform: 'rotateY(0) scale(1)' }, { transform: 'rotateY(180deg) scale(1.06)' }],
        { duration: 340, easing: 'cubic-bezier(.5,0,.3,1)' });
    }

    // 4) Impacto: destello + resplandor + anillo + título
    revelada = true;
    $('.rv-flash').classList.add('go');
    if (est.titulo) {
      $('.rv-glow').classList.add('go');
      $('.rv-ring').classList.add('go');
      $('.rv-tit').classList.add('go');
      setTimeout(() => $('.rv-sheen').classList.add('go'), 250);
      chispas(stage, est.giros >= 2 ? 14 : 9);
      navigator.vibrate && navigator.vibrate([40, 30, 80]);
    }
    $('.rv-nom').classList.add('go');
    anim(card, [{ transform: 'rotateY(180deg) scale(1.06)' }, { transform: 'rotateY(180deg) scale(1)' }],
      { duration: 380, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    try { o.onRevelar && o.onRevelar(); } catch (e) {}

    // 5) Mantener hasta 2.2 s o hasta que toquen
    await espera(2200, sig);

    // 6) Regreso a su lugar en la grilla
    ov.style.transition = 'opacity .3s ease';
    $('.rv-txt').style.opacity = '0';
    if (!reducido) {
      await anim(card, [{ transform: 'rotateY(180deg) scale(1)' }, { transform: desdeT.replace(/rotateY\([^)]*\)/, '') + ' rotateY(180deg)' }],
        { duration: 380, easing: 'cubic-bezier(.6,0,.4,1)' });
    }
    ov.classList.remove('on');
    if (o.desde) {
      o.desde.style.visibility = '';
      const c = centro(o.desde, raiz);
      estallido(c.x, c.y, est.c2, raiz);
    }
    await espera(300);
    document.removeEventListener('keydown', tecla, true);
    ov.remove();
  }

  /* Revela en orden todas las cartas de una apertura que lo ameriten.
     cartas: [{img, nombre, rareza, el}]  (el = elemento de la grilla) */
  async function revelarApertura(cartas, rarezas = ['secreta', 'foil', 'foil_poco_comun']) {
    for (const c of cartas) {
      if (rarezas.includes(c.rareza)) await mostrar({ img: c.img, nombre: c.nombre, rareza: c.rareza, desde: c.el, dorso: c.dorso, raiz: c.raiz });
    }
  }

  window.Revelacion = { mostrar, revelarApertura, ESTILOS };
})();
