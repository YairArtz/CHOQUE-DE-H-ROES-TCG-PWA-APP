/* ════════════════════════════════════════════════════════════════
   actualizar.js · v244 — Actualización obligatoria de la app
   Al abrir boot.html o index.html se compara la versión instalada (CACHE_NAME del service worker activo)
   con la del sitio (sw.js en el servidor). Si son distintas, una pantalla pide ACTUALIZAR (sin opción de saltarla):
   instala la versión nueva, renueva páginas/scripts/datos y entra ya actualizado.
   Sin internet, en la primera visita o si la revisión tarda más de 3.5 s, la app sigue normal.
   Tus partidas, desbloqueos, música y medios descargados no se tocan.
   ════════════════════════════════════════════════════════════════ */
(function () {
  if (!('serviceWorker' in navigator) || !('caches' in window)) { window.CHH_ACT = { revisar: function () { return Promise.resolve(false); } }; return; }
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var num = function (v) { var m = String(v || '').match(/v(\d+)/); return m ? 'v' + m[1] : (v || '?'); };

  function versionRemota() {
    var c = ('AbortController' in window) ? new AbortController() : null, t = setTimeout(function () { try { c && c.abort(); } catch (e) {} }, 3500);
    return fetch('sw.js?_v=' + Date.now(), { cache: 'no-store', signal: c ? c.signal : undefined })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (t) { var m = String(t).match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/); return m ? m[1] : null; })
      .catch(function () { return null; })
      .finally(function () { clearTimeout(t); });
  }
  function versionActiva() {
    var sw = navigator.serviceWorker.controller; if (!sw) return Promise.resolve(null);
    return new Promise(function (res) {
      var ch = new MessageChannel(), t = setTimeout(function () { res(null); }, 1500);
      ch.port1.onmessage = function (e) { clearTimeout(t); res(e.data && e.data.v || null); };
      try { sw.postMessage({ type: 'GET_VERSION' }, [ch.port2]); } catch (e) { clearTimeout(t); res(null); }
    }).then(function (v) {
      if (v) return v;
      // Versiones anteriores a v242 no responden: se toma la caché de la app instalada (la más antigua si hay dos)
      return caches.keys().then(function (ks) {
        var vs = ks.map(function (k) { var m = k.match(/^chh-tcg-v(\d+)$/); return m ? +m[1] : null; }).filter(function (n) { return n != null; }).sort(function (a, b) { return a - b; });
        return vs.length ? 'chh-tcg-v' + vs[0] : null;
      }).catch(function () { return null; });
    });
  }

  // ── Pantalla ──
  var UI = null;
  function pantalla(de, a) {
    if (UI) return UI;
    var st = document.createElement('style');
    st.textContent = '#chhAct{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:18px;background:radial-gradient(ellipse at 50% 35%,#14285a,#030610);font-family:"Orbitron",system-ui,sans-serif;color:#fff}' +
      '#chhAct .ca-box{width:min(440px,100%);text-align:center;padding:26px 22px 22px;border-radius:18px;border:1px solid rgba(255,193,77,.45);background:linear-gradient(180deg,rgba(14,22,48,.95),rgba(6,10,24,.95));box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(255,154,31,.12)}' +
      '#chhAct .ca-ic{font-size:44px;line-height:1;margin-bottom:10px;animation:caGira 3s linear infinite;display:inline-block}' +
      '@keyframes caGira{to{transform:rotate(360deg)}}' +
      '#chhAct h2{margin:0 0 6px;font-size:18px;letter-spacing:2px;color:#ffc04d}' +
      '#chhAct .ca-v{font-size:13px;letter-spacing:1.5px;color:#9fd8ff;margin-bottom:12px}' +
      '#chhAct p{margin:0 0 18px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;color:#dbe6ff}' +
      '#chhAct button{font:900 15px "Orbitron",system-ui,sans-serif;letter-spacing:2px;color:#2a1600;background:linear-gradient(180deg,#ffd35a,#ff9a1f);border:2px solid #fff;border-radius:14px;padding:14px 30px;cursor:pointer;box-shadow:0 5px 0 #b25d00,0 10px 22px rgba(0,0,0,.45);min-width:230px}' +
      '#chhAct button:focus-visible{outline:3px solid #fff;outline-offset:4px}' +
      '#chhAct button:disabled{filter:grayscale(.6);opacity:.7;cursor:default}' +
      '#chhAct button.ca-sec{display:block;margin:14px auto 0;font-size:12px;padding:10px 18px;min-width:0;color:#dbe6ff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.35);box-shadow:none}' +
      '#chhAct .ca-bar{height:8px;border-radius:5px;background:rgba(255,255,255,.1);overflow:hidden;margin:16px 0 8px;display:none}' +
      '#chhAct .ca-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#36d6ff,#ffc04d);transition:width .25s}' +
      '#chhAct .ca-est{font-family:system-ui,sans-serif;font-size:12.5px;color:#9fb0d0;min-height:18px}' +
      '@media (prefers-reduced-motion:reduce){#chhAct .ca-ic{animation:none}}';
    document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'chhAct'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="ca-box"><div class="ca-ic">⟳</div><h2>NUEVA VERSIÓN DISPONIBLE</h2><div class="ca-v">' + num(de) + ' → ' + num(a) + '</div>' +
      '<p>Para seguir jugando hay que actualizar la app. Tus partidas, desbloqueos, música y medios descargados se conservan.</p>' +
      '<button type="button" id="caBtn">ACTUALIZAR</button><div class="ca-bar" id="caBar"><i></i></div><div class="ca-est" id="caEst"></div></div>';
    document.body.appendChild(d);
    // Teclado y control: nada pasa "detrás" de la pantalla
    var tecla = function (e) { if (!document.getElementById('chhAct')) return; e.stopPropagation(); if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var f = document.activeElement; (f && f.tagName === 'BUTTON' && f.closest && f.closest('#chhAct') ? f : document.getElementById('caBtn')).click(); } else if (e.key === 'Escape') e.preventDefault(); };
    document.addEventListener('keydown', tecla, true);
    window.GP_CFG = { principal: function () { return document.getElementById('caBtn'); }, inicial: function () { return document.getElementById('caBtn'); }, atras: function () { return true; }, principalTxt: 'Actualizar' };
    setTimeout(function () { try { document.getElementById('caBtn').focus(); if (window.GP && GP.activo()) GP.enfocar(document.getElementById('caBtn')); } catch (e) {} }, 60);
    UI = { el: d, btn: d.querySelector('#caBtn'), bar: d.querySelector('#caBar'), est: d.querySelector('#caEst') };
    return UI;
  }
  function progreso(n, t, txt) {
    if (!UI) return; UI.bar.style.display = 'block';
    UI.bar.firstChild.style.width = Math.max(4, Math.min(100, t ? n / t * 100 : 10)) + '%';
    if (txt) UI.est.textContent = txt;
  }

  // v244 · ¿Ya quedó la versión nueva? Por mensaje al SW o, si este está ocupado activándose, por sus cachés
  async function yaQuedo(rem, act) {
    var v = await versionActiva(); if (v === rem) return true;
    try { return (await caches.has(rem)) && (!act || act === rem || !(await caches.has(act))); } catch (e) { return false; }
  }
  async function actualizar(rem, act, destino) {
    UI.btn.disabled = true; UI.btn.textContent = 'ACTUALIZANDO…'; progreso(0, 1, 'Conectando…');
    var ultimo = Date.now(), msg = false;
    navigator.serviceWorker.addEventListener('message', function (e) {
      var m = e.data || {}; if (m.type !== 'SW_PROG') return; msg = true; ultimo = Date.now();
      if (m.fase === 'instalar') progreso(m.n, m.t * 2, 'Descargando la versión nueva… ' + m.n + ' / ' + m.t);
      else if (m.fase === 'renovar') progreso(m.t + m.n, m.t * 2, 'Renovando páginas guardadas… ' + m.n + ' / ' + m.t);
    });
    var reg = null; try { reg = await navigator.serviceWorker.getRegistration(); } catch (e) {}
    if (!reg) { location.reload(); return; }
    try { reg.update().catch(function () {}); } catch (e) {}
    var t0 = Date.now(), ok = false, escape = false, sigUpd = Date.now() + 6000;
    while (Date.now() - t0 < 150000) {
      try { if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch (e) {}
      if (await yaQuedo(rem, act)) { ok = true; break; }
      // Estado real (sin depender de los avisos del SW)
      if (!msg) {
        if (reg.installing) progreso(1, 4, 'Descargando la versión nueva…');
        else if (reg.waiting) progreso(2, 4, 'Instalando la versión nueva…');
        else if (reg.active && reg.active.state === 'activating') progreso(3, 4, 'Aplicando la versión nueva…');
        else progreso(0, 1, 'Buscando la versión nueva…');
      }
      // Si el servidor aún no entrega la versión nueva, se vuelve a pedir cada 6 s
      if (!reg.installing && !reg.waiting && Date.now() > sigUpd) { sigUpd = Date.now() + 6000; try { reg.update().catch(function () {}); } catch (e) {} }
      // Si tarda, se ofrece entrar sin esperar (nunca se queda trabado)
      if (!escape && Date.now() - t0 > 25000) { escape = true; salida(destino); }
      await sleep(700);
    }
    if (!ok) {
      UI.btn.disabled = false; UI.btn.textContent = 'REINTENTAR'; UI.est.textContent = 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.';
      UI.btn.onclick = function () { location.reload(); };
      if (!escape) salida(destino);
      return;
    }
    progreso(1, 1, '¡Listo! Entrando a la versión ' + num(rem) + '…');
    await sleep(500);
    try { sessionStorage.removeItem('chh_boot_visto'); } catch (e) {}   // tras actualizar, el boot se ve completo
    location.replace(destino || location.href.split('#')[0]);
  }
  function salida(destino) {
    if (!UI || UI.el.querySelector('#caSalir')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'caSalir'; b.className = 'ca-sec'; b.textContent = 'ENTRAR SIN ESPERAR';
    b.onclick = function () { try { sessionStorage.setItem('chh_act_omitida', '1'); } catch (e) {} location.replace(destino || location.href.split('#')[0]); };
    UI.el.querySelector('.ca-box').appendChild(b);
    var nota = document.createElement('div'); nota.className = 'ca-est'; nota.textContent = 'La actualización seguirá en segundo plano y se aplicará la próxima vez que abras la app.';
    UI.el.querySelector('.ca-box').appendChild(nota);
    window.GP_CFG.zonas = ['#chhAct .ca-box'];
  }

  window.CHH_ACT = {
    // Devuelve true si mostró la pantalla de actualización (la app queda detenida hasta actualizar)
    revisar: async function (opt) {
      opt = opt || {};
      if (navigator.onLine === false) return false;
      try { if (sessionStorage.getItem('chh_act_omitida') === '1') return false; } catch (e) {}
      try {
        // Con tope de 5 s en total: la app nunca espera más que eso para arrancar
        var r = await Promise.race([Promise.all([versionRemota(), versionActiva()]), sleep(5000).then(function () { return [null, null]; })]), rem = r[0], act = r[1];
        if (!rem || !act || rem === act) return false;
        var ui = pantalla(act, rem);
        ui.btn.onclick = function () { actualizar(rem, act, opt.destino); };
        return true;
      } catch (e) { return false; }
    }
  };
})();
