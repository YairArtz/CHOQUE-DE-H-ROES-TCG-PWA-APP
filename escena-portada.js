// ═══ v437 · ESCENA POR CAPAS DEL SPLASH DE NEXOTLAN (reutilizable) ═══
// Arma el splash art capa por capa (fondo + personajes) leyendo assets/nexotlan/titulo/escena.txt:
// llegada de cada personaje, balanceo suave, rayos y profundidad con el ratón.
// Uso: NXEscena.montar(contenedor, { activo: () => true/false }).then(ok => …)
//   activo(): cuando pasa a verdadero, la escena vuelve a reproducir la llegada (p. ej. al volver al título).
// La portada del Modo Aventura (nexotlan.html) tiene su propia copia; esta la usa la pantalla de título de PC (steam.html).
(function () {
  if (window.NXEscena) return;
  const CSS = `
.nxe{position:absolute;inset:0;z-index:0;container-type:size;overflow:hidden;pointer-events:none;opacity:0;transition:opacity .8s ease;--mx:0;--my:0}
.nxe.lista{opacity:1}
.nxe i{position:absolute;display:block}
.nxe .nxe-fondo{inset:-3%;background:#0a0f33 center/cover no-repeat;translate:calc(var(--mx) * -6px) calc(var(--my) * -4px);animation:nxeRespira 30s ease-in-out infinite alternate}
@keyframes nxeRespira{from{transform:scale(1)}to{transform:scale(1.06)}}
.nxe .nxe-rayo{inset:0;background:radial-gradient(ellipse at 50% 18%,rgba(200,225,255,.55),rgba(150,120,255,.18) 40%,transparent 70%);mix-blend-mode:screen;opacity:0;animation:nxeRayo 11s linear infinite 3s}
@keyframes nxeRayo{0%,86%,100%{opacity:0}87%{opacity:.9}88%{opacity:.15}89.5%{opacity:.7}92%{opacity:0}}
.nxe .nxe-esc{position:absolute;left:50%;bottom:0;width:min(100cqw,177.84cqh);aspect-ratio:6000/3363;translate:-50% 0}
.nxe .nxe-capa{position:absolute;height:auto;display:block;user-select:none;-webkit-user-drag:none;opacity:0;
  translate:calc(var(--mx) * var(--d) * -16px) calc(var(--my) * var(--d) * -9px);will-change:transform}
.nxe.vivo .nxe-capa{animation:nxeEntra 1.15s cubic-bezier(.2,.8,.25,1) var(--dl) both}
.nxe.vivo .nxe-capa.flota{animation:nxeEntra 1.15s cubic-bezier(.2,.8,.25,1) var(--dl) both,nxeFlota var(--fl) ease-in-out calc(var(--dl) + 1.15s) infinite}
.nxe.vivo .nxe-capa.brillo{animation:nxeEntra 1.15s cubic-bezier(.2,.8,.25,1) var(--dl) both,nxeBrillo 3.4s ease-in-out calc(var(--dl) + 1.15s) infinite}
.nxe-capa.e-izq{--ex:-14%;--ey:0}.nxe-capa.e-der{--ex:14%;--ey:0}.nxe-capa.e-arr{--ex:0;--ey:-8%}.nxe-capa.e-aba{--ex:0;--ey:10%}
@keyframes nxeEntra{from{opacity:0;transform:translate(var(--ex),var(--ey)) scale(.96)}to{opacity:1;transform:none}}
@keyframes nxeFlota{0%,100%{opacity:1;transform:none}50%{opacity:1;transform:translateY(-1.4%)}}
@keyframes nxeBrillo{0%,100%{opacity:1;filter:brightness(1)}50%{opacity:.55;filter:brightness(1.6) drop-shadow(0 0 6px #bfe8ff)}}
.nxe .nxe-velo{inset:0;background:radial-gradient(ellipse 34% 30% at 50% 66%,rgba(5,8,26,.55),transparent 75%),linear-gradient(180deg,transparent 60%,rgba(5,8,26,.6))}
@media (prefers-reduced-motion:reduce){.nxe *{animation:none!important}.nxe .nxe-capa{opacity:1}}`;

  async function montar(host, op) {
    op = op || {};
    if (!host || host.querySelector('.nxe')) return false;
    const url = op.url || 'assets/nexotlan/titulo/escena.txt';
    let txt = ''; try { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) return false; txt = await r.text(); } catch (e) { return false; }
    const base = url.replace(/[^/]*$/, '') + 'escena/', B = []; let cur = null, fondo = '';
    txt.split(/\r?\n/).forEach(l => { l = l.replace(/^\s*#.*$/, '').trim(); if (!l) return;
      const h = l.match(/^\[(\w+)(?::([^\]]+))?\]$/); if (h) { cur = { _t: h[1].toLowerCase(), id: h[2] || '' }; B.push(cur); return; }
      const i = l.indexOf('='); if (i > 0 && cur) cur[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim(); });
    B.forEach(b => { if (b._t === 'fondo' && b.imagen) fondo = base + b.imagen; });
    const capas = B.filter(b => b._t === 'capa' && b.imagen);
    if (!capas.length && !fondo) return false;
    if (!document.getElementById('nxeCss')) { const st = document.createElement('style'); st.id = 'nxeCss'; st.textContent = CSS; document.head.appendChild(st); }
    const n = x => +String(x || '0').replace(',', '.') || 0, siNo = (x, d) => x == null || x === '' ? d : /^(si|sí|1|true)$/i.test(x);
    const E = document.createElement('div'); E.className = 'nxe'; E.setAttribute('aria-hidden', 'true');
    let k = 0;
    E.innerHTML = `<i class="nxe-fondo"${fondo ? ` style="background-image:url('${fondo}')"` : ''}></i><i class="nxe-rayo"></i><div class="nxe-esc">` + capas.map(c => {
      const ent = ({ izquierda: 'izq', derecha: 'der', arriba: 'arr', abajo: 'aba' })[String(c.entra || '').toLowerCase()] || 'aba';
      const cls = ['nxe-capa', 'e-' + ent, siNo(c.flota, true) ? 'flota' : '', siNo(c.brillo, false) ? 'brillo' : ''].filter(Boolean).join(' ');
      return `<img class="${cls}" alt="" decoding="async" src="${base + c.imagen}" style="left:${n(c.x)}%;top:${n(c.y)}%;width:${n(c.ancho)}%;--d:${Math.max(0, Math.min(1.5, n(c.profundidad)))};--dl:${(0.15 + (k++) * 0.09).toFixed(2)}s;--fl:${(5.5 + (k % 4) * 0.9).toFixed(1)}s">`;
    }).join('') + '</div><i class="nxe-velo"></i>';
    host.insertBefore(E, host.firstChild);
    const imgs = [...E.querySelectorAll('img')];
    await Promise.race([Promise.all(imgs.map(i => (i.decode ? i.decode() : Promise.resolve()).catch(() => {}))), new Promise(r => setTimeout(r, 4000))]);
    E.classList.add('lista');
    const activo = typeof op.activo === 'function' ? op.activo : () => true;
    let tx = 0, ty = 0, mx = 0, my = 0, ult = 0, antes = false;
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = E.getBoundingClientRect(); if (!r.width) return;
      tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; ult = performance.now(); }, { passive: true });
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function paso(ts) {
      if (!E.isConnected) return; requestAnimationFrame(paso);
      const on = activo() && !document.hidden;
      if (on && !antes) { E.classList.remove('vivo'); void E.offsetWidth; E.classList.add('vivo'); }      // llegada cada vez que se muestra
      antes = on; if (!on || quieto) return;
      if (ts - ult > 4000) { tx = Math.sin(ts / 5200) * .45; ty = Math.cos(ts / 6900) * .25; }
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      E.style.setProperty('--mx', mx.toFixed(3)); E.style.setProperty('--my', my.toFixed(3));
    })(performance.now());
    return true;
  }
  window.NXEscena = { montar };
})();
