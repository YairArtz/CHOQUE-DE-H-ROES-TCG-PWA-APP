// ═══════════════════════════════════════════
// CHOQUE DE HÉROES TCG — SISTEMA DE AJUSTES V3
// Catálogo unificado de temas (compartido con tienda)
// ═══════════════════════════════════════════

const DEFAULT_SETTINGS = {
  theme: 'dark',
  accentColor: 'green',
  tournamentsNotif: true,
  galleryView: '3col',
  animations: true,
  // Tier 1 nuevos
  textScale: 'normal',   // 'small' | 'normal' | 'large'
  vibrate: true,         // vibración táctil global
  landingPage: 'index'   // 'index' | 'calc' | 'perfil' | 'tienda' | 'last'
};

// ─── CATÁLOGO GLOBAL DE TEMAS ─────────────────
// Fuente única de verdad. Compartida con tienda.html vía window.CHH_TEMAS.
// pts=0 → gratis por defecto (se desbloquea automáticamente).
// animId → tema animado (RGB gaming style).
const TEMAS_CATALOGO = {
  // === BÁSICOS (gratis) ===
  green:  { nombre:'Verde Nexo',       pts:0,  hex:'#00ff9d', d:'#007a4a', dim:'rgba(0,255,157,.09)', glow:'0 0 6px #00ff9d,0 0 18px rgba(0,255,157,.4)',   preview:'#00ff9d' },
  // === CATÁLOGO BASE (tienda) ===
  blue:   { nombre:'Azul Cyber',       pts:3,  hex:'#00cfff', d:'#005f80', dim:'rgba(0,207,255,.09)', glow:'0 0 6px #00cfff,0 0 18px rgba(0,207,255,.4)',   preview:'#00cfff' },
  gold:   { nombre:'Dorado Real',      pts:5,  hex:'#f5a623', d:'#7a5210', dim:'rgba(245,166,35,.1)', glow:'0 0 8px #f5a623,0 0 22px rgba(245,166,35,.45)', preview:'#f5a623' },
  purple: { nombre:'Púrpura',          pts:8,  hex:'#cc55ff', d:'#6a1a80', dim:'rgba(180,70,255,.1)', glow:'0 0 8px #cc55ff,0 0 22px rgba(180,70,255,.5)',  preview:'#cc55ff' },
  red:    { nombre:'Rojo Sangre',      pts:10, hex:'#ff2244', d:'#6a0011', dim:'rgba(255,34,68,.09)', glow:'0 0 8px #ff2244,0 0 20px rgba(255,34,68,.4)',   preview:'#ff2244' },
  orange: { nombre:'Naranja Fuego',    pts:12, hex:'#ff7700', d:'#7a3800', dim:'rgba(255,119,0,.09)', glow:'0 0 8px #ff7700,0 0 20px rgba(255,119,0,.4)',   preview:'#ff7700' },
  pink:   { nombre:'Rosa Nexo',        pts:12, hex:'#ff4da6', d:'#80004d', dim:'rgba(255,77,166,.09)', glow:'0 0 8px #ff4da6,0 0 20px rgba(255,77,166,.4)', preview:'#ff4da6' },
  cyan:   { nombre:'Cyan Eléctrico',   pts:15, hex:'#00fff5', d:'#007a75', dim:'rgba(0,255,245,.09)', glow:'0 0 6px #00fff5,0 0 18px rgba(0,255,245,.4)',   preview:'#00fff5' },
  lime:   { nombre:'Lima Tóxico',      pts:15, hex:'#aaff00', d:'#4d7a00', dim:'rgba(170,255,0,.09)', glow:'0 0 6px #aaff00,0 0 18px rgba(170,255,0,.4)',   preview:'#aaff00' },
  teal:   { nombre:'Verde Profundo',   pts:18, hex:'#00e5cc', d:'#006b60', dim:'rgba(0,229,204,.09)', glow:'0 0 6px #00e5cc,0 0 18px rgba(0,229,204,.4)',   preview:'#00e5cc' },
  indigo: { nombre:'Índigo',           pts:20, hex:'#6677ff', d:'#2233aa', dim:'rgba(102,119,255,.1)', glow:'0 0 8px #6677ff,0 0 20px rgba(102,119,255,.4)', preview:'#6677ff' },
  crimson:{ nombre:'Carmesí',          pts:22, hex:'#dc143c', d:'#6e0a1e', dim:'rgba(220,20,60,.09)', glow:'0 0 8px #dc143c,0 0 20px rgba(220,20,60,.4)',   preview:'#dc143c' },
  silver: { nombre:'Plata',            pts:25, hex:'#c0c8d8', d:'#606878', dim:'rgba(192,200,216,.09)', glow:'0 0 6px #c0c8d8,0 0 18px rgba(192,200,216,.3)', preview:'#c0c8d8' },
  white:  { nombre:'Ártic White',      pts:30, hex:'#e8f0ff', d:'#8090b0', dim:'rgba(232,240,255,.08)', glow:'0 0 6px #e8f0ff,0 0 18px rgba(232,240,255,.25)', preview:'#e8f0ff' },
  // === GEMAS ===
  ember:  { nombre:'Ámbar Nocturno',   pts:15, hex:'#d4a017', d:'#6a500a', dim:'rgba(212,160,23,.09)', glow:'0 0 8px #d4a017,0 0 20px rgba(212,160,23,.4)',  preview:'#d4a017' },
  emerald:{ nombre:'Esmeralda',        pts:18, hex:'#10b981', d:'#065f46', dim:'rgba(16,185,129,.09)', glow:'0 0 8px #10b981,0 0 20px rgba(16,185,129,.4)',  preview:'#10b981' },
  sapphire:{nombre:'Zafiro Real',      pts:20, hex:'#3b5cff', d:'#1a2e80', dim:'rgba(59,92,255,.09)',  glow:'0 0 8px #3b5cff,0 0 20px rgba(59,92,255,.4)',   preview:'#3b5cff' },
  ruby:   { nombre:'Rubí Sangriento',  pts:22, hex:'#e60033', d:'#73001a', dim:'rgba(230,0,51,.09)',   glow:'0 0 8px #e60033,0 0 20px rgba(230,0,51,.4)',    preview:'#e60033' },
  copper: { nombre:'Cobre Antiguo',    pts:22, hex:'#c87533', d:'#643a1a', dim:'rgba(200,117,51,.09)', glow:'0 0 8px #c87533,0 0 20px rgba(200,117,51,.4)',  preview:'#c87533' },
  magenta:{ nombre:'Magenta Neón',     pts:25, hex:'#ff2ecc', d:'#80166a', dim:'rgba(255,46,204,.09)', glow:'0 0 8px #ff2ecc,0 0 22px rgba(255,46,204,.5)',  preview:'#ff2ecc' },
  obsidian:{nombre:'Obsidiana',        pts:28, hex:'#6a1b9a', d:'#38105a', dim:'rgba(106,27,154,.09)', glow:'0 0 8px #6a1b9a,0 0 20px rgba(106,27,154,.4)',  preview:'#6a1b9a' },
  jade:   { nombre:'Jade Antiguo',     pts:30, hex:'#00a86b', d:'#005a38', dim:'rgba(0,168,107,.09)',  glow:'0 0 8px #00a86b,0 0 20px rgba(0,168,107,.4)',   preview:'#00a86b' },
  plasma: { nombre:'Plasma Solar',     pts:35, hex:'#ff1493', d:'#800a4a', dim:'rgba(255,20,147,.09)', glow:'0 0 8px #ff1493,0 0 22px rgba(255,20,147,.5)',  preview:'#ff1493' },
  quantum:{ nombre:'Violeta Cuántico', pts:45, hex:'#7c00ff', d:'#3d0080', dim:'rgba(124,0,255,.09)',  glow:'0 0 10px #7c00ff,0 0 24px rgba(124,0,255,.55)', preview:'#7c00ff' },
  // === ANIMADOS (RGB Gaming) ===
  rainbow:      { nombre:'Arco Iris RGB',  pts:50,  hex:'#ff79c6', d:'#aa0066', dim:'rgba(255,121,198,.09)', glow:'0 0 8px #ff79c6,0 0 20px rgba(255,121,198,.5)',  preview:'linear-gradient(135deg,#ff2244,#ff7700,#f5a623,#00ff9d,#00cfff,#cc55ff)', animId:'rainbow' },
  neon_pulse:   { nombre:'Neón Pulsante',  pts:60,  hex:'#ff2ecc', d:'#80166a', dim:'rgba(255,46,204,.09)',  glow:'0 0 12px #ff2ecc,0 0 24px rgba(255,46,204,.6)',   preview:'#ff2ecc',                                                                    animId:'neon_pulse' },
  aurora:       { nombre:'Aurora Boreal',  pts:75,  hex:'#43e97b', d:'#22aa55', dim:'rgba(67,233,123,.09)',  glow:'0 0 10px #43e97b,0 0 24px rgba(67,233,123,.5)',   preview:'linear-gradient(135deg,#4facfe,#43e97b,#b455ff)',                            animId:'aurora' },
  cyber_glitch: { nombre:'Cyber Glitch',   pts:90,  hex:'#00fff0', d:'#008077', dim:'rgba(0,255,240,.09)',   glow:'0 0 8px #00fff0,0 0 20px rgba(0,255,240,.5)',     preview:'linear-gradient(90deg,#00fff0,#ff00cc)',                                     animId:'cyber_glitch' },
  fire:         { nombre:'Fuego Infernal', pts:100, hex:'#ff6600', d:'#993300', dim:'rgba(255,102,0,.09)',   glow:'0 0 10px #ff6600,0 0 20px rgba(255,136,0,.6)',    preview:'linear-gradient(135deg,#ff4400,#ff8800,#ffcc00)',                            animId:'fire' }
};

// ─── ANIMACIONES CSS COMPLETAS (aplicadas al equipar tema animado) ───
// Usa @property + animación de variables :root → todo elemento con var(--neon)
// se anima automáticamente (backgrounds, borders, shadows, gradients).
// Registrar @property una sola vez (una declaración fuera de cualquier tema)
const TEMA_PROPS_REGISTER = `
  @property --neon      { syntax:'<color>'; inherits:true; initial-value:#00ff9d; }
  @property --accent    { syntax:'<color>'; inherits:true; initial-value:#00ff9d; }
  @property --neon-d    { syntax:'<color>'; inherits:true; initial-value:#007a4a; }
  @property --neon-dim  { syntax:'<color>'; inherits:true; initial-value:rgba(0,255,157,.09); }
`;

const TEMA_ANIMS_FULL = {
  rainbow: `
    @keyframes chhAnimRainbow {
      0%   { --neon:#ff2244; --accent:#ff2244; --neon-d:#7a0011; --neon-dim:rgba(255,34,68,.15); }
      17%  { --neon:#ff7700; --accent:#ff7700; --neon-d:#7a3800; --neon-dim:rgba(255,119,0,.15); }
      33%  { --neon:#f5a623; --accent:#f5a623; --neon-d:#7a5210; --neon-dim:rgba(245,166,35,.15); }
      50%  { --neon:#00ff9d; --accent:#00ff9d; --neon-d:#007a4a; --neon-dim:rgba(0,255,157,.15); }
      67%  { --neon:#00cfff; --accent:#00cfff; --neon-d:#005f80; --neon-dim:rgba(0,207,255,.15); }
      83%  { --neon:#cc55ff; --accent:#cc55ff; --neon-d:#6a1a80; --neon-dim:rgba(204,85,255,.15); }
      100% { --neon:#ff2244; --accent:#ff2244; --neon-d:#7a0011; --neon-dim:rgba(255,34,68,.15); }
    }
    :root { animation: chhAnimRainbow 6s linear infinite !important; }
  `,
  neon_pulse: `
    @keyframes chhAnimPulse {
      0%,100% { --neon:#ff2ecc; --accent:#ff2ecc; --neon-d:#80166a; --neon-dim:rgba(255,46,204,.09); }
      50%     { --neon:#ff9fe5; --accent:#ff9fe5; --neon-d:#c04fa5; --neon-dim:rgba(255,159,229,.28); }
    }
    @keyframes chhPulseScale {
      0%,100% { transform: scale(1); }
      50%     { transform: scale(1.03); }
    }
    :root { animation: chhAnimPulse 1.6s ease-in-out infinite !important; }
    .tcg-label, .stitle, .calc-name, .nav-title, .cat-name { animation: chhPulseScale 1.6s ease-in-out infinite !important; }
  `,
  aurora: `
    @keyframes chhAnimAurora {
      0%   { --neon:#4facfe; --accent:#4facfe; --neon-d:#2288cc; --neon-dim:rgba(79,172,254,.15); }
      33%  { --neon:#43e97b; --accent:#43e97b; --neon-d:#22aa55; --neon-dim:rgba(67,233,123,.15); }
      66%  { --neon:#b455ff; --accent:#b455ff; --neon-d:#7733cc; --neon-dim:rgba(180,85,255,.18); }
      100% { --neon:#4facfe; --accent:#4facfe; --neon-d:#2288cc; --neon-dim:rgba(79,172,254,.15); }
    }
    :root { animation: chhAnimAurora 6s ease-in-out infinite !important; }
  `,
  cyber_glitch: `
    @keyframes chhAnimGlitchVars {
      0%,100% { --neon:#00fff0; --accent:#00fff0; --neon-d:#008077; --neon-dim:rgba(0,255,240,.15); }
      50%     { --neon:#ff00cc; --accent:#ff00cc; --neon-d:#80006a; --neon-dim:rgba(255,0,204,.15); }
    }
    @keyframes chhAnimGlitchText {
      0%,100% { text-shadow: 2px 0 #ff00cc, -2px 0 #00cfff !important; transform: translate(0); }
      20%     { text-shadow: -2px 0 #00fff0, 2px 0 #ff00cc, 0 0 8px #ff00cc !important; transform: translate(-1px,1px); }
      40%     { text-shadow: 2px 0 #ff00cc, -2px 0 #00cfff !important; transform: translate(1px,-1px); }
      60%     { text-shadow: -2px 0 #00fff0, 2px 0 #ff00cc !important; transform: translate(-1px,0); }
      80%     { text-shadow: 2px 0 #ff00cc, -2px 0 #00cfff, 0 0 8px #00fff0 !important; transform: translate(0,1px); }
    }
    :root { animation: chhAnimGlitchVars .6s steps(2,end) infinite !important; }
    .tcg-label, .stitle, .mod-name, .calc-name, .nav-title, .cat-name, .accent { animation: chhAnimGlitchText .5s steps(5,end) infinite !important; display: inline-block; }
  `,
  fire: `
    @keyframes chhAnimFire {
      0%,100% { --neon:#ff4400; --accent:#ff4400; --neon-d:#993300; --neon-dim:rgba(255,68,0,.18); }
      25%     { --neon:#ff8800; --accent:#ff8800; --neon-d:#a04a00; --neon-dim:rgba(255,136,0,.22); }
      50%     { --neon:#ffcc00; --accent:#ffcc00; --neon-d:#a08800; --neon-dim:rgba(255,204,0,.24); }
      75%     { --neon:#ff8800; --accent:#ff8800; --neon-d:#a04a00; --neon-dim:rgba(255,136,0,.22); }
    }
    @keyframes chhFireFlicker {
      0%,100% { transform: translate(0,0); }
      25%     { transform: translate(0,-.5px); }
      50%     { transform: translate(.5px,0); }
      75%     { transform: translate(-.5px,-.5px); }
    }
    :root { animation: chhAnimFire 1s ease-in-out infinite !important; }
    .tcg-label, .stitle, .calc-name, .nav-title, .cat-name { animation: chhFireFlicker .18s steps(4,end) infinite !important; }
  `
};

// ─── CARGAR Y GUARDAR ───────────────────────

function loadSettings() {
  const saved = localStorage.getItem('chh_settings');
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  localStorage.setItem('chh_settings', JSON.stringify(settings));
}

// ─── INYECTAR ESTILOS DINÁMICOS ──────────────

function injectStyle(id, css) {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

// ─── APLICAR TEMA (dark/light) ────────────────

function applyTheme(theme) {
  if (theme === 'light') {
    injectStyle('chh-theme-override', `
      :root,html,body{--bg:#f8f9fa!important;--bg2:#e9ecef!important;--bg3:#dee2e6!important;--border:#ced4da!important;--muted:#6c757d!important;--text:#212529!important;--card:#ffffff!important;background:#f8f9fa!important;color:#212529!important;}
    `);
  } else {
    injectStyle('chh-theme-override', `
      :root,html,body{--bg:#03050a!important;--bg2:#07090f!important;--bg3:#0b0e18!important;--border:#141c2a!important;--muted:#6a7f9a!important;--text:#e0eeff!important;--card:rgba(12,10,5,0.97)!important;background:#07090f!important;color:#f0e6d0!important;}
    `);
  }
}

// ─── APLICAR TEMA DE COLOR (fuente única) ─────
// Reemplaza applyAccentColor + inyectarColorTienda (una sola implementación).
// Para temas estáticos: setea las vars en :root con el hex del catálogo.
// Para animados: :root no las setea (las anima el @keyframes) — todo usa var(--neon).
function applyTema(temaId) {
  const t = TEMAS_CATALOGO[temaId];
  if (!t) { console.warn('[CHH_TEMAS] Tema no existe:', temaId); return false; }
  const isAnimated = !!(t.animId && TEMA_ANIMS_FULL[t.animId]);
  const h=t.hex, d=t.d, dim=t.dim, glow=t.glow;

  // Registrar @property una sola vez para animar colores de forma smooth
  ensurePropsRegistered();

  // Para temas estáticos, definir las vars en :root. Para animados, el keyframe las define.
  const rootVars = isAnimated ? '' :
    `:root{--neon:${h}!important;--neon-d:${d}!important;--neon-dim:${dim}!important;--nglow:${glow}!important;--accent:${h}!important;--accent-glow:${dim}!important;--accent-dim:${dim}!important;}`;

  // Base CSS usa var() para TODOS los selectores → cualquier cambio en las vars propaga.
  const baseCss = `${rootVars}
    .tcg-label{color:var(--neon)!important;text-shadow:0 0 8px var(--neon),0 0 20px var(--neon-dim)!important;}
    .stitle{color:var(--neon)!important;}.stitle::after{background:linear-gradient(90deg,var(--neon-d),transparent)!important;}
    .mod-name,.c-neon .mod-name,.c-blue .mod-name,.c-gold .mod-name,.c-red .mod-name,.c-purple .mod-name{color:var(--neon)!important;text-shadow:0 0 8px var(--neon),0 0 20px var(--neon-dim)!important;}
    .mod-badge,.c-neon .mod-badge,.c-blue .mod-badge,.c-gold .mod-badge,.c-red .mod-badge,.c-purple .mod-badge{color:var(--neon)!important;border:1px solid var(--neon-d)!important;background:var(--neon-dim)!important;}
    .mod-icon,.c-neon .mod-icon,.c-blue .mod-icon,.c-gold .mod-icon,.c-red .mod-icon,.c-purple .mod-icon{border-color:var(--neon-d)!important;background:var(--neon-dim)!important;}
    .mod-card:hover{border-color:var(--neon)!important;box-shadow:0 0 8px var(--neon),0 0 8px var(--neon-dim) inset!important;}
    .calc-card{background:var(--neon-dim)!important;border-color:var(--neon-d)!important;box-shadow:0 0 8px var(--neon),0 0 24px var(--neon-dim),inset 0 0 24px var(--neon-dim)!important;}
    .calc-card::before{background:linear-gradient(90deg,transparent,var(--neon),transparent)!important;}
    .calc-card:hover{border-color:var(--neon)!important;box-shadow:0 0 8px var(--neon),0 0 22px var(--neon-dim)!important;}
    .calc-name{color:var(--neon)!important;text-shadow:0 0 8px var(--neon),0 0 20px var(--neon-dim)!important;}
    .calc-arrow{color:var(--neon)!important;text-shadow:0 0 8px var(--neon),0 0 20px var(--neon-dim)!important;}
    .calc-icon{border-color:var(--neon-d)!important;background:var(--neon-dim)!important;}
    .nav-back{color:var(--neon)!important;border-color:var(--neon-d)!important;text-shadow:0 0 8px var(--neon)!important;}
    .nav-title{color:var(--neon)!important;text-shadow:0 0 8px var(--neon),0 0 20px var(--neon-dim)!important;}
    #chh-nav::after{background:linear-gradient(90deg,transparent,var(--neon),transparent)!important;}
    .settings-btn:active svg{fill:var(--neon)!important;}.banner-dot.active{background:var(--neon)!important;box-shadow:0 0 8px var(--neon)!important;}
    .ranking-badge{background:var(--neon-dim)!important;border-color:var(--neon-d)!important;color:var(--neon)!important;}
    .btn,.item-btn.btn-unlock,.item-btn.btn-equip{background:linear-gradient(135deg,var(--neon),var(--neon-d))!important;}
    .item-btn.btn-equipped{color:var(--neon)!important;border-color:var(--neon-d)!important;}
    .filter-btn.active{background:linear-gradient(135deg,var(--neon),var(--neon-d))!important;border-color:var(--neon)!important;}
    .accent,[style*="var(--accent)"]{color:var(--neon)!important;}`;
  const animCss = isAnimated ? TEMA_ANIMS_FULL[t.animId] : '';
  injectStyle('chh-tema-global', baseCss + animCss);
  // Limpiar el legacy 'chh-tienda-color' si existía (versión antigua de tienda.html)
  const legacy = document.getElementById('chh-tienda-color');
  if (legacy) legacy.remove();
  return true;
}

// Registra @property una vez por página (para que las variables --neon, --accent,
// --neon-d, --neon-dim se puedan animar smoothly como <color>).
let _propsRegistered = false;
function ensurePropsRegistered() {
  if (_propsRegistered) return;
  _propsRegistered = true;
  injectStyle('chh-tema-props', TEMA_PROPS_REGISTER);
}

// Backward compat — el modal de ajustes viejo puede seguir llamando applyAccentColor('green')
function applyAccentColor(color) {
  applyTema(color);
  const s = loadSettings();
  s.accentColor = color;
  s.temaId = color;
  saveSettings(s);
}

// ─── HELPERS PÚBLICOS (para tienda.html y modal de ajustes) ───

function getSesionJugadorId() {
  try { return JSON.parse(localStorage.getItem('nhSesion') || '{}').id || null; } catch(e) { return null; }
}

// Retorna array de IDs de temas desbloqueados por el jugador
function getTemasDesbloqueados(jugadorId) {
  const unlocked = new Set();
  // Todos los gratis (pts=0) siempre desbloqueados
  Object.entries(TEMAS_CATALOGO).forEach(([id, t]) => { if (t.pts === 0) unlocked.add(id); });
  // Compras acumuladas en tienda
  if (jugadorId) {
    try {
      const comprados = JSON.parse(localStorage.getItem(`nhTienda_${jugadorId}`) || '[]');
      comprados.forEach(id => { if (TEMAS_CATALOGO[id]) unlocked.add(id); });
    } catch(e) {}
  }
  return Array.from(unlocked);
}

// Equipa un tema para el jugador y lo aplica visualmente. Persiste en localStorage.
function equiparTema(temaId, jugadorId) {
  if (!TEMAS_CATALOGO[temaId]) return false;
  if (jugadorId) localStorage.setItem(`nhEquip_temas_${jugadorId}`, temaId);
  const s = loadSettings();
  s.temaId = temaId;
  s.accentColor = temaId; // sincroniza para backward compat
  saveSettings(s);
  applyTema(temaId);
  return true;
}

// Genera el HTML de un picker de temas (para el modal de ajustes).
// Muestra desbloqueados como seleccionables y bloqueados atenuados con candado.
function renderTemasPickerHTML(jugadorId, currentTemaId) {
  const desbloqueados = new Set(getTemasDesbloqueados(jugadorId));
  const items = Object.entries(TEMAS_CATALOGO).sort((a,b) => (a[1].pts||0) - (b[1].pts||0));
  return items.map(([id, t]) => {
    const unlocked = desbloqueados.has(id);
    const active   = id === currentTemaId;
    const anim     = t.animId ? ` tema-prev-${t.animId}` : '';
    const dotStyle = t.animId
      ? 'width:22px;height:22px;border-radius:50%;'
      : `width:22px;height:22px;border-radius:50%;background:${t.preview};box-shadow:0 0 10px ${t.preview};`;
    const lockOverlay = unlocked ? '' :
      `<div style="position:absolute;inset:0;background:rgba(3,5,10,.75);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:8px;">
         <div style="font-size:1.2rem;">🔒</div>
         <div style="font-size:.6rem;font-family:'Orbitron',sans-serif;color:#f5a623;letter-spacing:1px;">${t.pts} PTS</div>
       </div>`;
    const activeCls = active ? ' active' : '';
    const clickHandler = unlocked
      ? `onclick="CHH_TEMAS.equipar('${id}', CHH_TEMAS.getSesionId()); CHH_TEMAS.refreshPickerUI && CHH_TEMAS.refreshPickerUI();"`
      : `onclick="window.location.href='tienda.html'"`;
    return `<div class="tema-picker-item${activeCls}${anim}" data-id="${id}" style="position:relative;cursor:pointer;padding:10px;border-radius:8px;background:rgba(255,255,255,.03);border:2px solid ${active?'var(--neon)':'var(--border)'};display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .2s;${!unlocked?'opacity:.65;':''}" ${clickHandler} title="${t.nombre}${!unlocked?' — Bloqueado':''}">
      <div class="tema-dot" style="${dotStyle}"></div>
      <div class="tema-txt" style="font-family:'Orbitron',sans-serif;font-size:.55rem;letter-spacing:.5px;text-align:center;line-height:1.1;${t.animId?'':`color:${t.preview};`}">${t.nombre}</div>
      ${active?'<div style="position:absolute;top:4px;right:4px;font-size:.55rem;background:var(--neon);color:#000;padding:2px 5px;border-radius:3px;font-weight:900;font-family:\'Orbitron\',sans-serif;">✓</div>':''}
      ${lockOverlay}
    </div>`;
  }).join('');
}

// ─── ANIMACIONES / GALERÍA / FONDO ───────────

function applyAnimations(enabled) {
  if (!enabled) {
    injectStyle('chh-animations-override', `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;}`);
  } else {
    const style = document.getElementById('chh-animations-override');
    if (style) style.remove();
  }
}

function applyGalleryView(view) {
  const container = document.querySelector('.cards-grid') || document.querySelector('.card-grid');
  if (container) {
    container.classList.remove('cols-2','cols-3','cols-4');
    container.classList.add(`cols-${view.replace('col','')}`);
  }
}

function applyFondo(fondoImg) {
  if (!fondoImg) return;
  injectStyle('chh-tienda-fondo', `html,body{background-image:url('${fondoImg}')!important;background-size:cover!important;background-position:center!important;background-attachment:fixed!important;background-repeat:no-repeat!important;}body::before{display:none!important;}`);
}

// ─── TIER 1: ESCALA DE TEXTO ─────────────────
function applyTextScale(size) {
  const map = { small:'0.9', normal:'1', large:'1.12' };
  const z = map[size] || '1';
  // Zoom global (Chrome/Safari/Edge). Firefox mobile es <1% del user base.
  document.documentElement.style.zoom = z;
}

// ─── TIER 1: VIBRACIÓN CONDICIONAL ───────────
function vibrateIf(pattern) {
  const s = loadSettings();
  if (!s.vibrate) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ─── TIER 1: LANDING PAGE ────────────────────
function redirectToLandingIfNeeded() {
  if (sessionStorage.getItem('nhLandingRedirected')) return;
  const s = loadSettings();
  const landing = s.landingPage;
  if (!landing || landing === 'index') return;
  const path = (location.pathname.split('/').pop() || '').toLowerCase();
  const isEntry = !path || path === 'index.html' || path === 'boot.html';
  if (!isEntry) return;
  sessionStorage.setItem('nhLandingRedirected', '1');
  const map = { calc:'calculadora.html', perfil:'perfil.html', tienda:'tienda.html', noticias:'noticias.html', calendario:'calendario.html' };
  if (landing === 'last') {
    const last = localStorage.getItem('nhLastPage');
    if (last && last !== path) location.replace(last);
    return;
  }
  const target = map[landing];
  if (target) location.replace(target);
}

// Registrar "última página visitada" (para landing='last')
function trackLastPage() {
  const path = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!path || path === 'index.html' || path === 'boot.html') return;
  localStorage.setItem('nhLastPage', path);
}

// ─── TIER 1: EXPORTAR / IMPORTAR / STORAGE ───
function exportarDatos() {
  const data = { _meta: { app:'CHH-TCG', version:1, fecha:new Date().toISOString() }, ls: {} };
  for (let i=0; i<localStorage.length; i++) {
    const k = localStorage.key(i);
    data.ls[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chh-tcg-respaldo-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

async function importarDatos(file) {
  if (!file) throw new Error('Sin archivo');
  const text = await file.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { throw new Error('JSON inválido'); }
  if (!data.ls || typeof data.ls !== 'object') throw new Error('Formato no reconocido (falta ls)');
  if (data._meta?.app && data._meta.app !== 'CHH-TCG') throw new Error('Respaldo de otra app');
  // Aplicar entrada por entrada
  let count = 0;
  Object.entries(data.ls).forEach(([k, v]) => {
    if (typeof v === 'string') { localStorage.setItem(k, v); count++; }
  });
  return count;
}

async function getStorageEstimate() {
  if (!navigator.storage?.estimate) return null;
  try {
    const est = await navigator.storage.estimate();
    return {
      usage: est.usage || 0,
      quota: est.quota || 0,
      pct: est.quota ? (est.usage / est.quota * 100) : 0
    };
  } catch(e) { return null; }
}

async function limpiarCacheSW() {
  // Borra todos los caches del SW
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
  // Desregistra el SW para forzar nueva instalación en el próximo load
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }
}

// ─── APLICAR TODOS LOS AJUSTES ───────────────

function applyAllSettings() {
  const settings = loadSettings();
  applyTheme(settings.theme);
  applyAnimations(settings.animations);
  applyGalleryView(settings.galleryView);
  applyTextScale(settings.textScale);
  if (settings.fondoImg) applyFondo(settings.fondoImg);

  // TEMA: prioridad = tema equipado del jugador > settings.temaId > settings.accentColor > 'green'
  let temaId = null;
  const jId = getSesionJugadorId();
  if (jId) temaId = localStorage.getItem(`nhEquip_temas_${jId}`);
  if (!temaId || !TEMAS_CATALOGO[temaId]) temaId = settings.temaId;
  if (!temaId || !TEMAS_CATALOGO[temaId]) temaId = settings.accentColor;
  if (!temaId || !TEMAS_CATALOGO[temaId]) temaId = 'green';
  applyTema(temaId);
}

// ─── API PÚBLICA ─────────────────────────────

window.CHH_TEMAS = {
  catalogo: TEMAS_CATALOGO,
  animaciones: TEMA_ANIMS_FULL,
  aplicar: applyTema,
  equipar: equiparTema,
  getDesbloqueados: getTemasDesbloqueados,
  getSesionId: getSesionJugadorId,
  renderPickerHTML: renderTemasPickerHTML,
  refresh: applyAllSettings,
  refreshPickerUI: null // lo puede setear la página que abre el modal
};

window.CHH_SETTINGS = {
  load: loadSettings,
  save: saveSettings,
  applyAll: applyAllSettings,
  applyTextScale,
  vibrateIf,
  exportar: exportarDatos,
  importar: importarDatos,
  storageEstimate: getStorageEstimate,
  limpiarCache: limpiarCacheSW,
  redirectToLanding: redirectToLandingIfNeeded,
  trackLastPage
};

// ─── INIT ────────────────────────────────────

// Landing redirect ANTES de aplicar estilos (evita flash de contenido)
redirectToLandingIfNeeded();

applyAllSettings();
trackLastPage();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
}

window.addEventListener('storage', (e) => {
  if (e.key === 'chh_settings' || (e.key||'').startsWith('nhEquip_temas_')) applyAllSettings();
});

console.log('⚙️ Sistema de ajustes CHH v3 cargado — CHH_TEMAS disponible');
