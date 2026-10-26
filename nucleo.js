// ════════════════════════════════════════════════════════════════════
//  NÚCLEO · Choque de Héroes TCG (Nexo de Héroes)
//  Se incluye en el <head> de todas las páginas, justo después de config.js:
//      <script src="config.js"></script><script src="nucleo.js"></script>
//  1. Transiciones suaves entre pantallas (desvanecido).
//  2. Sesión segura: ID + PIN. Guarda la "llave de sesión" (token) que da el servidor de
//     Hero Pesos y la agrega sola a las compras y canjes. Si el servidor la pide, abre la
//     ventana de PIN y reintenta la operación automáticamente.
//     API: CHH_AUTH.entrar(id) · CHH_AUTH.asegurar() · CHH_AUTH.cambiarPin() → Promise<{token,exp}|null>
//  3. Carga hub.js: misiones diarias/semanales y bandeja de avisos.
// ════════════════════════════════════════════════════════════════════
(function () {
  if (window.CHH_AUTH) return;
  const CFG = window.CHH_CONFIG || {};
  const HP = CFG.heroPesos || 'https://script.google.com/macros/s/AKfycbwSrBH7yJiyTlPabzJ_WiXQDWPe7RpATmuTTWAe3uVRy6wuGh15QpuOMzSiZVixJK_S/exec';
  const HP_ID = (HP.match(/\/s\/([^/]+)\//) || [])[1] || '§';
  // Carpeta del sitio (nucleo.js también se usa desde subcarpetas, p. ej. mercado/)
  const BASE = (() => { try { const s = document.currentScript && document.currentScript.src; return s ? new URL('.', s).href : ''; } catch (e) { return ''; } })();
  window.__NX_BASE = BASE;

  // ═══════════════ 1. TRANSICIONES ═══════════════
  (function () {
    const css = `@view-transition{navigation:auto}
::view-transition-old(root){animation:nxVtOut .2s ease-in both}
::view-transition-new(root){animation:nxVtIn .3s ease-out both}
::view-transition-group(nx-barra){animation-duration:.3s}
@keyframes nxVtOut{to{opacity:0}}
@keyframes nxVtIn{from{opacity:0}}
#bgm-btn{view-transition-name:nx-bgm}
@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}` +
      // Navegadores sin transiciones entre páginas (Firefox, Safari viejo): la página nueva aparece con un desvanecido
      (('onpagereveal' in window) ? '' : `html{animation:nxVtIn .28s ease-out both}@media (prefers-reduced-motion:reduce){html{animation:none}}`);
    const st = document.createElement('style'); st.id = 'nx-vt'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  })();

  // ═══════════════ 2. SESIÓN ═══════════════
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  function sesion() { const s = ls.get('nhSesion', null); return s && s.tipo !== 'tienda' && s.id ? s : null; }
  function tokenVigente(s) { s = s || sesion(); return s && s.token && (!s.tokenExp || s.tokenExp > Date.now() + 60000) ? s.token : null; }
  function guardarToken(id, r) {
    const s = ls.get('nhSesion', null);
    if (s && String(s.id).toUpperCase() === String(id).toUpperCase()) { s.token = r.token; s.tokenExp = r.exp; ls.set('nhSesion', s); }
  }

  async function api(accion, id, extra) {   // POST: el PIN y el código no quedan en la dirección
    const body = new URLSearchParams(Object.assign({ action: accion, playerid: id }, extra || {}));
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 25000);
    try {
      const r = await fetchOriginal(HP, { method: 'POST', body, signal: ctrl.signal });
      return await r.json();
    } catch (e) { return { status: 'error', red: true, message: e.name === 'AbortError' ? 'El servidor tardó demasiado. Intenta de nuevo.' : 'Sin conexión. Revisa tu internet.' }; }
    finally { clearTimeout(t); }
  }

  // ── fetch: agrega la llave a las llamadas al servidor de Hero Pesos y, si el servidor la pide, abre la ventana de PIN ──
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    let url = typeof input === 'string' ? input : (input && input.url) || '';
    if (!url || url.indexOf(HP_ID) < 0 || /[?&]action=auth_/.test(url)) return fetchOriginal(input, init);
    const s = sesion(), conLlave = u => { const tk = tokenVigente(); if (!tk || /[?&]token=/.test(u)) return u; return u + (u.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(tk); };
    const esSuyo = s && new RegExp('[?&]playerid=' + encodeURIComponent(s.id).replace(/[-]/g, '\\-') + '(&|$)', 'i').test(url);
    const pedir = u => fetchOriginal(typeof input === 'string' || !esSuyo ? u : new Request(u, input), init);
    const res = await pedir(esSuyo ? conLlave(url) : url);
    if (!esSuyo) return res;
    try {
      const d = await res.clone().json();
      if (d && d.auth === true && !/[?&]nx_silencio=1/.test(url)) {
        const r = await asegurar(d.message);
        if (r && r.token) return pedir(conLlave(url.replace(/([?&])token=[^&]*(&|$)/, (m, a, b) => b ? a : '')));
      }
    } catch (e) {}
    return res;
  };

  // ═══════════════ 3. VENTANA DE PIN ═══════════════
  const CSS = `
#nxPin{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(2,3,12,.78);
  -webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;transition:opacity .18s;font-family:'Rajdhani',system-ui,sans-serif;color:#eef2ff}
#nxPin.on{opacity:1}
#nxPin .bx{width:min(380px,100%);max-height:96vh;overflow:auto;background:rgb(var(--nx-k3,12,17,48));border:1px solid rgba(var(--nx-ln,143,176,255),.28);border-top:3px solid var(--neon,#f5c842);
  clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%);padding:18px 18px 14px;box-shadow:0 18px 50px rgba(0,0,0,.6)}
#nxPin .t{font-family:'Orbitron',sans-serif;font-weight:900;font-size:15px;letter-spacing:.06em;color:var(--neon,#f5c842);display:flex;align-items:center;gap:8px}
#nxPin .id{font-family:'Orbitron',sans-serif;font-size:12px;letter-spacing:.08em;color:#8d9bc7;margin-top:2px}
#nxPin .m{font-size:16px;font-weight:600;line-height:1.4;color:#dfe5ff;margin:10px 0 12px;white-space:pre-line}
#nxPin .cajas{display:flex;justify-content:center;gap:8px;margin:4px 0 6px}
#nxPin .cajas i{width:38px;height:46px;display:flex;align-items:center;justify-content:center;font-style:normal;font:900 20px 'Orbitron',sans-serif;
  border:1px solid rgba(var(--nx-ln,143,176,255),.35);background:rgba(0,0,0,.3)}
#nxPin .cajas i.ll{border-color:var(--neon,#f5c842)}
#nxPin .cajas i.op{opacity:.4;border-style:dashed}
#nxPin .err{min-height:20px;text-align:center;font-size:15px;font-weight:700;color:#ff6b86;margin-bottom:4px}
#nxPin .err.ok{color:#3ee08f}
#nxPin .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 10px}
#nxPin .kp button{height:50px;font:700 20px 'Orbitron',sans-serif;color:#eef2ff;background:rgba(var(--nx-k5,20,26,70),.85);border:1px solid rgba(var(--nx-ln,143,176,255),.22);cursor:pointer}
#nxPin .kp button:active{transform:scale(.96)}
#nxPin .kp button.tn{font-size:15px}
#nxPin button:focus-visible,#nxPin button.gp-foco{outline:2px solid #fff;outline-offset:-3px}
#nxPin .b{display:flex;gap:10px}
#nxPin .b button{flex:1;min-height:46px;font:700 13px 'Orbitron',sans-serif;letter-spacing:.05em;cursor:pointer;border:1px solid rgba(var(--nx-ln,143,176,255),.3);background:transparent;color:#eef2ff;
  clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)}
#nxPin .b button.si{background:var(--neon,#f5c842);color:#04061a;border-color:transparent}
#nxPin .b button:disabled{opacity:.45;cursor:not-allowed}
#nxPin .lnk{display:block;width:100%;margin-top:10px;background:none;border:0;color:var(--neon,#f5c842);font:700 15px 'Rajdhani',sans-serif;text-decoration:underline;cursor:pointer;padding:6px}
#nxPin .gp{display:none;margin-top:6px;font-size:13px;color:#8d9bc7;text-align:center}
html.gp-on #nxPin .gp{display:block}
#nxPin .gp i{font-style:normal;display:inline-block;padding:0 5px;border-radius:4px;background:#9fb3cc;color:#04061a;font-weight:700;font-size:11px;margin:0 2px}
#nxPin .spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(0,0,0,.25);border-top-color:#04061a;border-radius:50%;animation:nxPinG .7s linear infinite;vertical-align:-2px}
@keyframes nxPinG{to{transform:rotate(360deg)}}`;

  let enCurso = null;   // una sola ventana a la vez; las demás esperan su resultado

  // Pasos: 'pin' (entrar) · 'codigo' (código del correo) · 'nuevo' + 'repetir' (crear PIN)
  function ventana(id, opciones) {
    if (enCurso) return enCurso;
    enCurso = new Promise(resolver => {
      if (!document.getElementById('nxPinCss')) { const st = document.createElement('style'); st.id = 'nxPinCss'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
      const o = Object.assign({ motivo: '', modo: 'entrar' }, opciones || {});
      const d = document.createElement('div'); d.id = 'nxPin'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'nxPinT');
      document.body.appendChild(d);
      const gpAntes = window.GP_CFG, focoAntes = (window.GP && GP.foco && GP.foco()) || document.activeElement;
      let paso = 'cargando', val = '', nuevo = '', codigo = '', estado = null, ocupado = false, cerrado = false, correo = '';
      const largo = () => paso === 'codigo' ? [6, 6] : [4, 6];

      function fin(r) {
        if (cerrado) return; cerrado = true;
        document.removeEventListener('keydown', tecla, true);
        d.classList.remove('on'); setTimeout(() => d.remove(), 180);
        window.GP_CFG = gpAntes;
        setTimeout(() => { try { if (window.GP && GP.activo && GP.activo() && focoAntes && document.contains(focoAntes)) GP.enfocar(focoAntes); } catch (e) {} }, 40);
        enCurso = null; resolver(r || null);
      }
      function pintar(msgErr, ok) {
        const [min, max] = largo();
        const titulo = { cargando: 'Tu cuenta', pin: 'Ingresa tu PIN', codigo: 'Código de tu correo', nuevo: 'Crea tu PIN', repetir: 'Repite tu PIN' }[paso];
        const texto = {
          cargando: 'Revisando tu cuenta…',
          pin: o.motivo || 'Escribe tu PIN para entrar.',
          codigo: 'Te enviamos un código de 6 números a ' + (correo || 'tu correo') + '. Revisa también la carpeta de spam.',
          nuevo: (o.modo === 'cambiar' ? 'Escribe tu PIN nuevo' : 'Protege tu cuenta: elige un PIN') + ' de 4 a 6 números. Lo usarás para entrar y para comprar con Hero Pesos.',
          repetir: 'Escríbelo otra vez para confirmar.'
        }[paso];
        let cajas = '';
        if (paso !== 'cargando') for (let i = 0; i < max; i++) cajas += '<i class="' + (i < val.length ? 'll' : i >= min ? 'op' : '') + '">' + (i < val.length ? (paso === 'codigo' ? val[i] : '•') : '') + '</i>';
        const teclas = paso === 'cargando' ? '' : '<div class="kp">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button type="button" data-k="' + n + '">' + n + '</button>').join('') +
          '<button type="button" class="tn" data-k="borrar" aria-label="Borrar">⌫</button><button type="button" data-k="0">0</button><button type="button" class="tn" data-k="limpiar" aria-label="Limpiar">C</button></div>';
        const enlaces = paso === 'pin' ? '<button type="button" class="lnk" data-a="olvide">¿Olvidaste tu PIN? Recupéralo con tu correo</button>' :
          paso === 'codigo' ? '<button type="button" class="lnk" data-a="reenviar">Enviar otro código</button>' : '';
        d.innerHTML = '<div class="bx"><div class="t" id="nxPinT">🔐 ' + titulo + '</div><div class="id">' + esc(id) + '</div><div class="m">' + esc(texto) + '</div>' +
          (cajas ? '<div class="cajas" aria-live="polite">' + cajas + '</div>' : '') + '<div class="err' + (ok ? ' ok' : '') + '" role="status">' + esc(msgErr || '') + '</div>' + teclas +
          '<div class="b"><button type="button" data-a="cancelar">' + (o.omitir ? 'Ahora no' : 'Cancelar') + '</button>' +
          (paso === 'cargando' ? '' : '<button type="button" class="si" data-a="ok"' + (val.length < min || ocupado ? ' disabled' : '') + '>' + (ocupado ? '<span class="spin"></span>' : paso === 'codigo' || paso === 'nuevo' ? 'Siguiente' : 'Aceptar') + '</button>') +
          '</div>' + enlaces + '<div class="gp"><i>A</i> elegir · <i>B</i> cancelar · <i>Y</i> aceptar</div></div>';
        d.querySelectorAll('[data-k]').forEach(b => b.onclick = () => teclear(b.dataset.k));
        d.querySelectorAll('[data-a]').forEach(b => b.onclick = () => accion(b.dataset.a));
      }
      function teclear(k) {
        if (ocupado) return; const [, max] = largo();
        if (k === 'borrar') val = val.slice(0, -1); else if (k === 'limpiar') val = ''; else if (/^\d$/.test(k) && val.length < max) val += k;
        const f = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.k;
        pintar(); if (f) { const b = d.querySelector('[data-k="' + f + '"]'); if (b) enfocar(b); }
        if ((val.length === max && (paso === 'codigo' || paso === 'pin')) || (paso === 'repetir' && val.length === nuevo.length)) accion('ok');
      }
      function enfocar(el) { try { if (window.GP && GP.activo && GP.activo()) GP.enfocar(el); else el.focus({ preventScroll: true }); } catch (e) {} }
      function irA(p, msg, ok) { paso = p; val = ''; pintar(msg, ok); const b = d.querySelector('[data-k="1"]'); if (b) enfocar(b); }
      async function pedirCodigo(reenvio) {
        ocupado = true; pintar(reenvio ? 'Enviando…' : ''); const r = await api('auth_codigo', id); ocupado = false;
        if (r.status === 'ok') { correo = r.correo || correo; irA('codigo', reenvio ? 'Te enviamos otro código.' : '', !!reenvio); }
        else if (paso === 'codigo') pintar(r.message); else irA(paso === 'cargando' ? 'pin' : paso, r.message);
      }
      async function accion(a) {
        if (ocupado && a !== 'cancelar') return;
        if (a === 'cancelar') return fin(o.omitir ? { omitido: true } : null);
        if (a === 'olvide') { if (estado && !estado.puedeCorreo) return pintar('Tu registro no tiene correo. Pide un PIN provisional a Choque de Héroes por Instagram o Facebook.'); return pedirCodigo(false); }
        if (a === 'reenviar') return pedirCodigo(true);
        if (a !== 'ok') return;
        const [min] = largo(); if (val.length < min) return;
        if (paso === 'codigo') { codigo = val; return irA('nuevo'); }
        if (paso === 'nuevo') { nuevo = val; return irA('repetir'); }
        if (paso === 'repetir') {
          if (val !== nuevo) return irA('nuevo', 'Los PIN no coinciden. Escríbelo de nuevo.');
          ocupado = true; pintar();
          const r = o.modo === 'cambiar' || o.cambiarTrasTemporal ? await api('auth_cambiar', id, { pin: nuevo, token: o.token || tokenVigente() || '' }) : await api('auth_crear', id, { pin: nuevo, codigo });
          ocupado = false;
          if (r.status === 'ok' && r.token) { guardarToken(id, r); pintar('✓ PIN guardado', true); setTimeout(() => fin({ token: r.token, exp: r.exp }), 600); return; }
          if (/código/i.test(r.message || '')) return irA('codigo', r.message);
          return irA('nuevo', r.message);
        }
        if (paso === 'pin') {
          ocupado = true; pintar(); const r = await api('auth_login', id, { pin: val }); ocupado = false;
          if (r.status === 'ok' && r.token) {
            guardarToken(id, r);
            if (r.cambiar) { o.cambiarTrasTemporal = true; o.token = r.token; return irA('nuevo', 'Entraste con un PIN provisional. Crea ahora tu PIN personal.', true); }
            pintar('✓ Listo', true); setTimeout(() => fin({ token: r.token, exp: r.exp }), 350); return;
          }
          if (r.sinPin) return pedirCodigo(false);
          return irA('pin', r.message);
        }
      }
      function tecla(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fin(o.omitir ? { omitido: true } : null); }
        else if (/^\d$/.test(e.key)) { e.preventDefault(); e.stopPropagation(); teclear(e.key); }
        else if (e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); teclear('borrar'); }
        else if (e.key === 'Enter' && !(e.target && e.target.closest && e.target.closest('#nxPin [data-a]'))) { e.preventDefault(); e.stopPropagation(); accion('ok'); }
      }
      document.addEventListener('keydown', tecla, true);
      window.GP_CFG = { ambito: () => d, inicial: () => d.querySelector('[data-k="1"]') || d.querySelector('button'), principal: () => d.querySelector('[data-a="ok"]'), principalTxt: 'Aceptar',
        atras: () => { fin(o.omitir ? { omitido: true } : null); return true; }, lbrb: () => true, gatillo: () => true };
      pintar(); requestAnimationFrame(() => d.classList.add('on'));

      // Arranque según el estado de la cuenta
      (async () => {
        if (o.modo === 'cambiar') { irA('nuevo'); return; }
        estado = await api('auth_estado', id);
        if (cerrado) return;
        // Servidor de Hero Pesos anterior a v3.9 (sin cuentas con PIN): se entra como antes
        if (estado.status !== 'ok' && /no reconocida/i.test(estado.message || '')) return fin({ omitido: true, sinPin: true });
        if (estado.status !== 'ok') { paso = 'pin'; val = ''; pintar(estado.message || 'No se pudo revisar tu cuenta.'); return; }
        if (!estado.obligatorio && !estado.tienePin && !estado.temporal) o.omitir = true;
        correo = estado.correo || '';
        if (estado.tienePin || estado.temporal) irA('pin');
        else if (estado.puedeCorreo) await pedirCodigo(false);
        else { paso = 'pin'; pintar('Tu registro no tiene correo. Pide un PIN provisional a Choque de Héroes por Instagram o Facebook.'); }
      })();
    });
    return enCurso;
  }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function asegurar(motivo) { const s = sesion(); if (!s) return Promise.resolve(null); return ventana(s.id, { motivo: motivo || 'Por seguridad, confirma tu PIN para continuar.' }); }
  window.CHH_AUTH = {
    entrar: (id, motivo) => ventana(String(id).toUpperCase(), { motivo }),
    asegurar,
    cambiarPin: () => { const s = sesion(); return s ? ventana(s.id, { modo: 'cambiar', token: tokenVigente(s) }) : Promise.resolve(null); },
    tieneLlave: () => !!tokenVigente(),
    sesion
  };

  // ═══════════════ 4. HUB DEL JUGADOR (misiones y avisos) ═══════════════
  // Se carga aparte y sin bloquear la página.
  try { const h = document.createElement('script'); h.src = BASE + 'hub.js'; h.async = true; (document.head || document.documentElement).appendChild(h); } catch (e) {}
})();
