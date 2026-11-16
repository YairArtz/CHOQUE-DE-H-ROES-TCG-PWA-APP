// ═══════════════════════════════════════════
// CHOQUE DE HÉROES TCG — SISTEMA DE AJUSTES V3
// Catálogo unificado de temas (compartido con tienda)
// ═══════════════════════════════════════════

const DEFAULT_SETTINGS = {
  theme: 'dark',
  accentColor: 'green',
  tournamentsNotif: true,
  newsNotif: true,       // avisos de noticias y resultados en el inicio
  academiaNotif: true,   // avisos de barajas nuevas en la Academia
  galleryView: '3col',
  animations: true,
  // Tier 1 nuevos
  textScale: 'normal',   // 'small' | 'normal' | 'large'
  vibrate: true,         // vibración táctil global
  landingPage: 'index',  // 'index' | 'calc' | 'perfil' | 'tienda' | 'last'
  vistaAmplia: true      // diseño horizontal en PC/tablet (perfil, tienda, constructor…)
};

// ─── CATÁLOGO GLOBAL DE TEMAS ─────────────────
// Fuente única de verdad. Compartida con tienda.html vía window.CHH_TEMAS.
// pts=0 → gratis por defecto (se desbloquea automáticamente).
// animId → tema animado (RGB gaming style).
const TEMAS_CATALOGO = {
  // v277 · Precios en puntos de ranking: cada tema cuesta 15 pts más que el anterior (estáticos) y
  //        20 pts más (animados). Los que un jugador ya desbloqueó se conservan.
  // === BÁSICO (gratis) ===
  green: { nombre:'Verde Nexo',       pts:0,  hex:'#00ff9d', d:'#007a4a', dim:'rgba(0,255,157,.09)', glow:'0 0 6px #00ff9d,0 0 18px rgba(0,255,157,.4)',   preview:'#00ff9d' },
  // === COLORES (+15 pts cada uno) ===
  blue: { nombre:'Azul Cyber',       pts:15,  hex:'#00cfff', d:'#005f80', dim:'rgba(0,207,255,.09)', glow:'0 0 6px #00cfff,0 0 18px rgba(0,207,255,.4)',   preview:'#00cfff' },
  gold: { nombre:'Dorado Real',      pts:30,  hex:'#f5a623', d:'#7a5210', dim:'rgba(245,166,35,.1)', glow:'0 0 8px #f5a623,0 0 22px rgba(245,166,35,.45)', preview:'#f5a623' },
  purple: { nombre:'Púrpura',          pts:45,  hex:'#cc55ff', d:'#6a1a80', dim:'rgba(180,70,255,.1)', glow:'0 0 8px #cc55ff,0 0 22px rgba(180,70,255,.5)',  preview:'#cc55ff' },
  red: { nombre:'Rojo Sangre',      pts:60, hex:'#ff2244', d:'#6a0011', dim:'rgba(255,34,68,.09)', glow:'0 0 8px #ff2244,0 0 20px rgba(255,34,68,.4)',   preview:'#ff2244' },
  orange: { nombre:'Naranja Fuego',    pts:75, hex:'#ff7700', d:'#7a3800', dim:'rgba(255,119,0,.09)', glow:'0 0 8px #ff7700,0 0 20px rgba(255,119,0,.4)',   preview:'#ff7700' },
  pink: { nombre:'Rosa Nexo',        pts:90, hex:'#ff4da6', d:'#80004d', dim:'rgba(255,77,166,.09)', glow:'0 0 8px #ff4da6,0 0 20px rgba(255,77,166,.4)', preview:'#ff4da6' },
  cyan: { nombre:'Cyan Eléctrico',   pts:105, hex:'#00fff5', d:'#007a75', dim:'rgba(0,255,245,.09)', glow:'0 0 6px #00fff5,0 0 18px rgba(0,255,245,.4)',   preview:'#00fff5' },
  lime: { nombre:'Lima Tóxico',      pts:120, hex:'#aaff00', d:'#4d7a00', dim:'rgba(170,255,0,.09)', glow:'0 0 6px #aaff00,0 0 18px rgba(170,255,0,.4)',   preview:'#aaff00' },
  ember: { nombre:'Ámbar Nocturno',   pts:135, hex:'#d4a017', d:'#6a500a', dim:'rgba(212,160,23,.09)', glow:'0 0 8px #d4a017,0 0 20px rgba(212,160,23,.4)',  preview:'#d4a017' },
  teal: { nombre:'Verde Profundo',   pts:150, hex:'#00e5cc', d:'#006b60', dim:'rgba(0,229,204,.09)', glow:'0 0 6px #00e5cc,0 0 18px rgba(0,229,204,.4)',   preview:'#00e5cc' },
  turquesa: { nombre:'Turquesa Azteca', pts:165, hex:'#1fd6c4', d:'#0d6058', dim:'rgba(31,214,196,.09)', glow:'0 0 8px #1fd6c4,0 0 20px rgba(31,214,196,.4)', preview:'#1fd6c4' },
  cempasuchil: { nombre:'Cempasúchil', pts:180, hex:'#ff9f1c', d:'#72470c', dim:'rgba(255,159,28,.09)', glow:'0 0 8px #ff9f1c,0 0 20px rgba(255,159,28,.4)', preview:'#ff9f1c' },
  emerald: { nombre:'Esmeralda',        pts:195, hex:'#10b981', d:'#065f46', dim:'rgba(16,185,129,.09)', glow:'0 0 8px #10b981,0 0 20px rgba(16,185,129,.4)',  preview:'#10b981' },
  indigo: { nombre:'Índigo',           pts:210, hex:'#6677ff', d:'#2233aa', dim:'rgba(102,119,255,.1)', glow:'0 0 8px #6677ff,0 0 20px rgba(102,119,255,.4)', preview:'#6677ff' },
  sapphire: {nombre:'Zafiro Real',      pts:225, hex:'#3b5cff', d:'#1a2e80', dim:'rgba(59,92,255,.09)',  glow:'0 0 8px #3b5cff,0 0 20px rgba(59,92,255,.4)',   preview:'#3b5cff' },
  crimson: { nombre:'Carmesí',          pts:240, hex:'#dc143c', d:'#6e0a1e', dim:'rgba(220,20,60,.09)', glow:'0 0 8px #dc143c,0 0 20px rgba(220,20,60,.4)',   preview:'#dc143c' },
  coral: { nombre:'Coral Atómico', pts:255, hex:'#ff6f61', d:'#72312b', dim:'rgba(255,111,97,.09)', glow:'0 0 8px #ff6f61,0 0 20px rgba(255,111,97,.4)', preview:'#ff6f61' },
  menta: { nombre:'Menta Glacial', pts:270, hex:'#7dffc4', d:'#387258', dim:'rgba(125,255,196,.09)', glow:'0 0 8px #7dffc4,0 0 20px rgba(125,255,196,.4)', preview:'#7dffc4' },
  ruby: { nombre:'Rubí Sangriento',  pts:285, hex:'#e60033', d:'#73001a', dim:'rgba(230,0,51,.09)',   glow:'0 0 8px #e60033,0 0 20px rgba(230,0,51,.4)',    preview:'#e60033' },
  copper: { nombre:'Cobre Antiguo',    pts:300, hex:'#c87533', d:'#643a1a', dim:'rgba(200,117,51,.09)', glow:'0 0 8px #c87533,0 0 20px rgba(200,117,51,.4)',  preview:'#c87533' },
  rosa_mx: { nombre:'Rosa Mexicano', pts:315, hex:'#ff1f8e', d:'#720d3f', dim:'rgba(255,31,142,.09)', glow:'0 0 8px #ff1f8e,0 0 20px rgba(255,31,142,.4)', preview:'#ff1f8e' },
  lavanda: { nombre:'Lavanda Astral', pts:330, hex:'#b69cff', d:'#514672', dim:'rgba(182,156,255,.09)', glow:'0 0 8px #b69cff,0 0 20px rgba(182,156,255,.4)', preview:'#b69cff' },
  silver: { nombre:'Plata',            pts:345, hex:'#c0c8d8', d:'#606878', dim:'rgba(192,200,216,.09)', glow:'0 0 6px #c0c8d8,0 0 18px rgba(192,200,216,.3)', preview:'#c0c8d8' },
  magenta: { nombre:'Magenta Neón',     pts:360, hex:'#ff2ecc', d:'#80166a', dim:'rgba(255,46,204,.09)', glow:'0 0 8px #ff2ecc,0 0 22px rgba(255,46,204,.5)',  preview:'#ff2ecc' },
  cobalto: { nombre:'Cobalto Profundo', pts:375, hex:'#2f6bff', d:'#153072', dim:'rgba(47,107,255,.09)', glow:'0 0 8px #2f6bff,0 0 20px rgba(47,107,255,.4)', preview:'#2f6bff' },
  vino: { nombre:'Vino Imperial', pts:390, hex:'#c2185b', d:'#570a28', dim:'rgba(194,24,91,.09)', glow:'0 0 8px #c2185b,0 0 20px rgba(194,24,91,.4)', preview:'#c2185b' },
  obsidian: {nombre:'Obsidiana',        pts:405, hex:'#6a1b9a', d:'#38105a', dim:'rgba(106,27,154,.09)', glow:'0 0 8px #6a1b9a,0 0 20px rgba(106,27,154,.4)',  preview:'#6a1b9a' },
  white: { nombre:'Ártic White',      pts:420, hex:'#e8f0ff', d:'#8090b0', dim:'rgba(232,240,255,.08)', glow:'0 0 6px #e8f0ff,0 0 18px rgba(232,240,255,.25)', preview:'#e8f0ff' },
  jade: { nombre:'Jade Antiguo',     pts:435, hex:'#00a86b', d:'#005a38', dim:'rgba(0,168,107,.09)',  glow:'0 0 8px #00a86b,0 0 20px rgba(0,168,107,.4)',   preview:'#00a86b' },
  oro_blanco: { nombre:'Oro Blanco', pts:450, hex:'#ffe7a3', d:'#726749', dim:'rgba(255,231,163,.09)', glow:'0 0 8px #ffe7a3,0 0 20px rgba(255,231,163,.4)', preview:'#ffe7a3' },
  plasma: { nombre:'Plasma Solar',     pts:465, hex:'#ff1493', d:'#800a4a', dim:'rgba(255,20,147,.09)', glow:'0 0 8px #ff1493,0 0 22px rgba(255,20,147,.5)',  preview:'#ff1493' },
  quantum: { nombre:'Violeta Cuántico', pts:480, hex:'#7c00ff', d:'#3d0080', dim:'rgba(124,0,255,.09)',  glow:'0 0 10px #7c00ff,0 0 24px rgba(124,0,255,.55)', preview:'#7c00ff' },
  // === ANIMADOS (+20 pts cada uno) · los que traen anim:{…} se generan solos (ver temaAnimCSS) ===
  rainbow: { nombre:'Arco Iris RGB',  pts:500,  hex:'#ff79c6', d:'#aa0066', dim:'rgba(255,121,198,.09)', glow:'0 0 8px #ff79c6,0 0 20px rgba(255,121,198,.5)',  preview:'linear-gradient(135deg,#ff2244,#ff7700,#f5a623,#00ff9d,#00cfff,#cc55ff)', animId:'rainbow' },
  oceano: { nombre:'Oleaje Abisal', pts:520, hex:'#00b4ff', d:'#005172', dim:'rgba(0,180,255,.09)', glow:'0 0 10px #00b4ff,0 0 24px rgba(0,180,255,.5)', preview:'linear-gradient(135deg,#00b4ff,#00ffd5,#0066ff)', animId:'oceano', anim:{ colores:['#00b4ff','#00ffd5','#0066ff'], efecto:'ciclo', seg:7 } },
  neon_pulse: { nombre:'Neón Pulsante',  pts:540,  hex:'#ff2ecc', d:'#80166a', dim:'rgba(255,46,204,.09)',  glow:'0 0 12px #ff2ecc,0 0 24px rgba(255,46,204,.6)',   preview:'#ff2ecc',                                                                    animId:'neon_pulse' },
  lava: { nombre:'Lava Volcánica', pts:560, hex:'#ff2200', d:'#720f00', dim:'rgba(255,34,0,.09)', glow:'0 0 10px #ff2200,0 0 24px rgba(255,34,0,.5)', preview:'linear-gradient(135deg,#ff2200,#ff7a00,#c40000)', animId:'lava', anim:{ colores:['#ff2200','#ff7a00','#c40000'], efecto:'brillo', seg:3 } },
  vaporwave: { nombre:'Vaporwave', pts:580, hex:'#ff71ce', d:'#72325c', dim:'rgba(255,113,206,.09)', glow:'0 0 10px #ff71ce,0 0 24px rgba(255,113,206,.5)', preview:'linear-gradient(135deg,#ff71ce,#01cdfe,#b967ff)', animId:'vaporwave', anim:{ colores:['#ff71ce','#01cdfe','#b967ff'], efecto:'ciclo', seg:5 } },
  aurora: { nombre:'Aurora Boreal',  pts:600,  hex:'#43e97b', d:'#22aa55', dim:'rgba(67,233,123,.09)',  glow:'0 0 10px #43e97b,0 0 24px rgba(67,233,123,.5)',   preview:'linear-gradient(135deg,#4facfe,#43e97b,#b455ff)',                            animId:'aurora' },
  hielo: { nombre:'Hielo Eterno', pts:620, hex:'#7fe6ff', d:'#396772', dim:'rgba(127,230,255,.09)', glow:'0 0 10px #7fe6ff,0 0 24px rgba(127,230,255,.5)', preview:'linear-gradient(135deg,#7fe6ff,#f2fdff,#4fc8ff)', animId:'hielo', anim:{ colores:['#7fe6ff','#f2fdff','#4fc8ff'], efecto:'brillo', seg:3.2 } },
  toxico: { nombre:'Radiactivo', pts:640, hex:'#aaff00', d:'#4c7200', dim:'rgba(170,255,0,.09)', glow:'0 0 10px #aaff00,0 0 24px rgba(170,255,0,.5)', preview:'linear-gradient(135deg,#aaff00,#00ff6a)', animId:'toxico', anim:{ colores:['#aaff00','#00ff6a'], efecto:'pulso', seg:1.4 } },
  atardecer: { nombre:'Atardecer Nexo', pts:660, hex:'#ff5f6d', d:'#722a31', dim:'rgba(255,95,109,.09)', glow:'0 0 10px #ff5f6d,0 0 24px rgba(255,95,109,.5)', preview:'linear-gradient(135deg,#ff5f6d,#ffc371,#c94bff)', animId:'atardecer', anim:{ colores:['#ff5f6d','#ffc371','#c94bff'], efecto:'ciclo', seg:8 } },
  oro_vivo: { nombre:'Oro Viviente', pts:680, hex:'#f5a623', d:'#6e4a0f', dim:'rgba(245,166,35,.09)', glow:'0 0 10px #f5a623,0 0 24px rgba(245,166,35,.5)', preview:'linear-gradient(135deg,#f5a623,#fff1b8)', animId:'oro_vivo', anim:{ colores:['#f5a623','#fff1b8'], efecto:'brillo', seg:2.4 } },
  cyber_glitch: { nombre:'Cyber Glitch',   pts:700,  hex:'#00fff0', d:'#008077', dim:'rgba(0,255,240,.09)',   glow:'0 0 8px #00fff0,0 0 20px rgba(0,255,240,.5)',     preview:'linear-gradient(90deg,#00fff0,#ff00cc)',                                     animId:'cyber_glitch' },
  galaxia: { nombre:'Galaxia Espiral', pts:720, hex:'#7b2ff7', d:'#37156f', dim:'rgba(123,47,247,.09)', glow:'0 0 10px #7b2ff7,0 0 24px rgba(123,47,247,.5)', preview:'linear-gradient(135deg,#7b2ff7,#f107a3,#2d7bff)', animId:'galaxia', anim:{ colores:['#7b2ff7','#f107a3','#2d7bff'], efecto:'ciclo', seg:9 } },
  sangre_lunar: { nombre:'Luna de Sangre', pts:740, hex:'#ff0033', d:'#720016', dim:'rgba(255,0,51,.09)', glow:'0 0 10px #ff0033,0 0 24px rgba(255,0,51,.5)', preview:'linear-gradient(135deg,#ff0033,#8a0020)', animId:'sangre_lunar', anim:{ colores:['#ff0033','#8a0020'], efecto:'pulso', seg:2.2 } },
  tormenta: { nombre:'Tormenta Eléctrica', pts:760, hex:'#4da6ff', d:'#224a72', dim:'rgba(77,166,255,.09)', glow:'0 0 10px #4da6ff,0 0 24px rgba(77,166,255,.5)', preview:'linear-gradient(135deg,#4da6ff,#ffffff)', animId:'tormenta', anim:{ colores:['#4da6ff','#ffffff'], efecto:'destello', seg:2.8 } },
  fire: { nombre:'Fuego Infernal', pts:780, hex:'#ff6600', d:'#993300', dim:'rgba(255,102,0,.09)',   glow:'0 0 10px #ff6600,0 0 20px rgba(255,136,0,.6)',    preview:'linear-gradient(135deg,#ff4400,#ff8800,#ffcc00)',                            animId:'fire' },
  quetzal: { nombre:'Quetzalcóatl', pts:800, hex:'#00e676', d:'#006735', dim:'rgba(0,230,118,.09)', glow:'0 0 10px #00e676,0 0 24px rgba(0,230,118,.5)', preview:'linear-gradient(135deg,#00e676,#00bfa5,#ffd54f)', animId:'quetzal', anim:{ colores:['#00e676','#00bfa5','#ffd54f'], efecto:'ciclo', seg:7 } },
  xiuhcoatl: { nombre:'Xiuhcóatl', pts:820, hex:'#00e5ff', d:'#006772', dim:'rgba(0,229,255,.09)', glow:'0 0 10px #00e5ff,0 0 24px rgba(0,229,255,.5)', preview:'linear-gradient(135deg,#00e5ff,#ff6d00)', animId:'xiuhcoatl', anim:{ colores:['#00e5ff','#ff6d00'], efecto:'ciclo', seg:3 } },
  mictlan: { nombre:'Mictlán', pts:840, hex:'#9d4dff', d:'#462272', dim:'rgba(157,77,255,.09)', glow:'0 0 10px #9d4dff,0 0 24px rgba(157,77,255,.5)', preview:'linear-gradient(135deg,#9d4dff,#ece4ff,#6a2bd6)', animId:'mictlan', anim:{ colores:['#9d4dff','#ece4ff','#6a2bd6'], efecto:'ciclo', seg:7 } },
  tezcatlipoca: { nombre:'Espejo de Tezcatlipoca', pts:860, hex:'#8a7dff', d:'#3e3872', dim:'rgba(138,125,255,.09)', glow:'0 0 10px #8a7dff,0 0 24px rgba(138,125,255,.5)', preview:'linear-gradient(135deg,#8a7dff,#e0e4ff,#5a4fcf)', animId:'tezcatlipoca', anim:{ colores:['#8a7dff','#e0e4ff','#5a4fcf'], efecto:'glitch', seg:0.9 } },
  nexo_dimensional: { nombre:'Nexo Dimensional', pts:880, hex:'#36d6ff', d:'#186072', dim:'rgba(54,214,255,.09)', glow:'0 0 10px #36d6ff,0 0 24px rgba(54,214,255,.5)', preview:'linear-gradient(135deg,#36d6ff,#cc55ff,#f5a623)', animId:'nexo_dimensional', anim:{ colores:['#36d6ff','#cc55ff','#f5a623'], efecto:'ciclo', seg:4 } }
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

// v277 · Temas animados generados desde el catálogo (anim:{ colores, efecto, seg }).
//        efecto: ciclo (recorre los colores) · brillo (va y viene, suave) · pulso (late y los títulos crecen)
//                destello (color base con relámpagos de luz) · glitch (saltos de color y texto con interferencia)
//        Genera la animación completa (todas las páginas, Simulador, Arcade, Online y Nexotlan) y la vista previa de la Tienda.
function _hexRgbT(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function _oscT(h, f) { return '#' + _hexRgbT(h).map(v => Math.round(v * (f || .45)).toString(16).padStart(2, '0')).join(''); }
function _dimT(h, a) { return 'rgba(' + _hexRgbT(h).join(',') + ',' + a + ')'; }
function _paradasT(t) {
  const C = t.anim.colores, e = t.anim.efecto;
  if (e === 'brillo' || e === 'pulso') { const L = C.length > 2 ? [C[0], C[1], C[2], C[1]] : [C[0], C[1]]; return L.map((c, i) => [i / L.length * 100, c]).concat([[100, C[0]]]); }
  if (e === 'destello') return [[0, C[0]], [6, C[0]], [8, C[1]], [10, C[0]], [12, C[1]], [15, C[0]], [55, C[0]], [57, C[1]], [60, C[0]], [100, C[0]]];
  return C.map((c, i) => [i / C.length * 100, c]).concat([[100, C[0]]]);
}
function temaAnimCSS(id, t) {
  const P = _paradasT(t), e = t.anim.efecto, seg = t.anim.seg || 6;
  const ease = e === 'glitch' ? 'steps(2,end)' : e === 'ciclo' ? 'linear' : e === 'destello' ? 'linear' : 'ease-in-out';
  const kf = P.map(([p, c]) => `${p.toFixed(1)}%{--neon:${c};--accent:${c};--neon-d:${_oscT(c)};--neon-dim:${_dimT(c, e === 'pulso' ? .2 : .15)};}`).join('');
  let css = `@keyframes chhAnim_${id}{${kf}}\n:root{animation:chhAnim_${id} ${seg}s ${ease} infinite!important;}\n`;
  const T = '.tcg-label,.stitle,.calc-name,.nav-title,.cat-name';
  if (e === 'pulso') css += `@keyframes chhEsc_${id}{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}\n${T}{animation:chhEsc_${id} ${seg}s ease-in-out infinite!important;}\n`;
  if (e === 'glitch') css += `@keyframes chhGl_${id}{0%,100%{text-shadow:2px 0 ${t.anim.colores[1]},-2px 0 ${t.anim.colores[0]};transform:translate(0)}25%{transform:translate(-1px,1px)}50%{text-shadow:-2px 0 ${t.anim.colores[1]},2px 0 ${t.anim.colores[0]};transform:translate(1px,-1px)}75%{transform:translate(-1px,0)}}\n${T},.accent{animation:chhGl_${id} .5s steps(4,end) infinite!important;display:inline-block;}\n`;
  if (e === 'destello') css += `@keyframes chhDes_${id}{0%,6%,10%,15%,55%,60%,100%{filter:none}8%,12%,57%{filter:brightness(1.6) drop-shadow(0 0 6px #fff)}}\n${T}{animation:chhDes_${id} ${seg}s linear infinite!important;}\n`;
  return css;
}
function temaPrevCSS(id, t) {
  const P = _paradasT(t), e = t.anim.efecto, seg = t.anim.seg || 6;
  const ease = e === 'glitch' ? 'steps(2,end)' : (e === 'ciclo' || e === 'destello') ? 'linear' : 'ease-in-out';
  const d = P.map(([p, c]) => `${p.toFixed(1)}%{background:${c};box-shadow:0 0 12px ${c}}`).join(''), x = P.map(([p, c]) => `${p.toFixed(1)}%{color:${c};text-shadow:0 0 6px ${c}}`).join('');
  return `@keyframes prv_${id}_d{${d}}@keyframes prv_${id}_t{${x}}.tema-prev-${id} .tema-dot{animation:prv_${id}_d ${seg}s ${ease} infinite}.tema-prev-${id} .tema-txt{animation:prv_${id}_t ${seg}s ${ease} infinite}\n`;
}
(function () {
  let prev = '';
  Object.entries(TEMAS_CATALOGO).forEach(([id, t]) => { if (!t.anim) return; TEMA_ANIMS_FULL[t.animId || id] = temaAnimCSS(id, t); prev += temaPrevCSS(id, t); });
  const meter = () => injectStyle('chh-tema-prev', prev);
  if (document.head) meter(); else document.addEventListener('DOMContentLoaded', meter);
})();

// ─── CARGAR Y GUARDAR ───────────────────────

function loadSettings() {
  const saved = localStorage.getItem('chh_settings');
  // v271 · si el dato se corrompe no se cae ninguna página: se usan los valores por defecto
  try { return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }; } catch (e) { return { ...DEFAULT_SETTINGS }; }
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
  // v270 · El Simulador, el Arcade y el Online no cargan este archivo: leen el tema de aquí (temas-ui.js)
  try { localStorage.setItem('chh_tema_ui', JSON.stringify({ id: temaId, hex: h, d, anim: isAnimated ? TEMA_PROPS_REGISTER + animCss : '' })); } catch (e) {}
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

// ─── VISTA AMPLIA (PC / tablet horizontal) ───
// Cada módulo trae su diseño amplio en un @media; aquí solo se apaga con html.hz-off
function applyVistaAmplia(on) {
  document.documentElement.classList.toggle('hz-off', on === false);
}

// ─── CONTROL (gamepad.js en todos los módulos) ─
// Solo se activa al presionar un botón del control; con táctil/ratón no hace nada.
function cargarControl() {
  if (!('getGamepads' in navigator) || window.GP || document.querySelector('script[src*="gamepad.js"]')) return;
  const s = document.createElement('script'); s.src = 'gamepad.js'; s.async = true;
  document.head.appendChild(s);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargarControl); else setTimeout(cargarControl, 0);

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
  const map = { calc:'calculadora.html', perfil:'perfil.html', tienda:'tienda.html', noticias:'noticias.html', calendario:'calendario.html',
    galeria:'galeria.html', constructor:'constructor.html', simulacion:'simulacion.html', arcade:'arcade.html', nexotlan:'nexotlan.html', coleccion:'coleccion.html', ranking:'ranking.html' };
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

async function limpiarCacheSW(todo) {
  // Borra la caché de la app. La música y los medios descargados (chh-musica-v1 / chh-medios-v1) se conservan,
  // salvo con limpiarCacheSW(true)
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => todo || !/^chh-(musica|medios)-/.test(k)).map(k => caches.delete(k)));
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
  applyVistaAmplia(settings.vistaAmplia);
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
  applyVistaAmplia,
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
