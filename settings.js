// ═══════════════════════════════════════════
// CHOQUE DE HÉROES TCG - SISTEMA DE AJUSTES V2
// Versión robusta con inyección agresiva de estilos
// ═══════════════════════════════════════════

const DEFAULT_SETTINGS = {
  theme: 'dark',
  accentColor: 'green',
  tournamentsNotif: true,
  galleryView: '3col',
  animations: true
};

// ─── CARGAR Y GUARDAR ───────────────────────

function loadSettings() {
  const saved = localStorage.getItem('chh_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

function saveSettings(settings) {
  localStorage.setItem('chh_settings', JSON.stringify(settings));
  console.log('⚙️ Ajustes guardados:', settings);
}

// ─── INYECTAR ESTILOS DINÁMICOS ──────────────

function injectStyle(id, css) {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    // Agregar al FINAL del head para máxima prioridad
    document.head.appendChild(style);
  }
  style.textContent = css;
}

// ─── APLICAR TEMA ─────────────────────────────

function applyTheme(theme) {
  if (theme === 'light') {
    injectStyle('chh-theme-override', `
      :root,
      html,
      body {
        --bg: #f8f9fa !important;
        --bg2: #e9ecef !important;
        --bg3: #dee2e6 !important;
        --border: #ced4da !important;
        --muted: #6c757d !important;
        --text: #212529 !important;
        --card: #ffffff !important;
        background: #f8f9fa !important;
        color: #212529 !important;
      }
    `);
  } else {
    injectStyle('chh-theme-override', `
      :root,
      html,
      body {
        --bg: #03050a !important;
        --bg2: #07090f !important;
        --bg3: #0b0e18 !important;
        --border: #141c2a !important;
        --muted: #6a7f9a !important;
        --text: #e0eeff !important;
        --card: rgba(12,10,5,0.97) !important;
        background: #07090f !important;
        color: #f0e6d0 !important;
      }
    `);
  }
  console.log(`✅ Tema aplicado: ${theme}`);
}

// ─── APLICAR COLOR DE ACENTO ──────────────────

function applyAccentColor(color) {
  const colors = {
    green: { p: '#00ff9d', d: '#007a4a', dim: 'rgba(0,255,157,.09)', glow: '0 0 6px #00ff9d,0 0 18px rgba(0,255,157,.4)' },
    gold:  { p: '#f5a623', d: '#7a5210', dim: 'rgba(245,166,35,.1)', glow: '0 0 8px #f5a623,0 0 22px rgba(245,166,35,.45)' },
    blue:  { p: '#00cfff', d: '#005f80', dim: 'rgba(0,207,255,.09)', glow: '0 0 6px #00cfff,0 0 18px rgba(0,207,255,.4)' },
    purple:{ p: '#cc55ff', d: '#6a1a80', dim: 'rgba(180,70,255,.1)', glow: '0 0 8px #cc55ff,0 0 22px rgba(180,70,255,.5)' }
  };

  const c = colors[color];
  if (!c) return;

  // Inyectar CSS que sobrescribe TODO
  injectStyle('chh-accent-override', `
    :root {
      --neon: ${c.p} !important;
      --neon-d: ${c.d} !important;
      --neon-dim: ${c.dim} !important;
      --nglow: ${c.glow} !important;
      
      --accent: ${c.p} !important;
      --accent-glow: ${c.dim} !important;
      --accent-dim: ${c.dim} !important;
      
      --green: ${color === 'green' ? c.p : colors.green.p} !important;
      --gold: ${color === 'gold' ? c.p : colors.gold.p} !important;
      --blue: ${color === 'blue' ? c.p : colors.blue.p} !important;
      --purple: ${color === 'purple' ? c.p : colors.purple.p} !important;
    }
    
    /* Sobrescribir TODOS los nombres de módulos */
    .mod-name,
    .c-neon .mod-name,
    .c-blue .mod-name,
    .c-gold .mod-name,
    .c-red .mod-name,
    .c-purple .mod-name {
      color: ${c.p} !important;
      text-shadow: ${c.glow} !important;
    }
    
    /* Sobrescribir TODOS los badges de módulos */
    .mod-badge,
    .c-neon .mod-badge,
    .c-blue .mod-badge,
    .c-gold .mod-badge,
    .c-red .mod-badge,
    .c-purple .mod-badge {
      color: ${c.p} !important;
      border: 1px solid ${c.d} !important;
      background: ${c.dim} !important;
    }
    
    /* Sobrescribir CALCULADORA destacada */
    .calc-card {
      background: ${c.dim} !important;
      border-color: ${c.d} !important;
      box-shadow: ${c.glow}, inset 0 0 24px ${c.dim} !important;
    }
    .calc-card::before {
      background: linear-gradient(90deg, transparent, ${c.p}, transparent) !important;
    }
    .calc-card:hover {
      border-color: ${c.p} !important;
      box-shadow: ${c.glow} !important;
    }
    .calc-icon {
      background: ${c.dim} !important;
      border-color: ${c.d} !important;
    }
    .calc-name {
      color: ${c.p} !important;
      text-shadow: ${c.glow} !important;
    }
    .calc-arrow {
      color: ${c.p} !important;
      text-shadow: ${c.glow} !important;
    }
    
    /* Sobrescribir colores hardcodeados comunes */
    .filter-btn.active {
      background: linear-gradient(135deg, ${c.p}, ${c.d}) !important;
      border-color: ${c.p} !important;
    }
  `);

  console.log(`✅ Color ${color} aplicado: ${c.p}`);
}

// ─── APLICAR ANIMACIONES ──────────────────────

function applyAnimations(enabled) {
  if (!enabled) {
    injectStyle('chh-animations-override', `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `);
    console.log('❌ Animaciones deshabilitadas');
  } else {
    // Remover el style tag
    const style = document.getElementById('chh-animations-override');
    if (style) style.remove();
    console.log('✅ Animaciones habilitadas');
  }
}

// ─── APLICAR VISTA DE GALERÍA ─────────────────

function applyGalleryView(view) {
  const container = document.querySelector('.cards-grid') || document.querySelector('.card-grid');
  
  if (container) {
    container.classList.remove('cols-2', 'cols-3', 'cols-4');
    const num = view.replace('col', '');
    container.classList.add(`cols-${num}`);
    console.log(`✅ Galería: ${num} columnas`);
  } else {
    console.log(`💾 Vista guardada: ${view}`);
  }
}


// ─── APLICAR FONDO ────────────────────────────

function applyFondo(fondoImg) {
  if (!fondoImg) return;
  let style = document.getElementById('chh-tienda-fondo');
  if (!style) {
    style = document.createElement('style');
    style.id = 'chh-tienda-fondo';
    document.head.appendChild(style);
  }
  style.textContent = `
    html, body {
      background-image: url('${fondoImg}') !important;
      background-size: cover !important;
      background-position: center !important;
      background-attachment: fixed !important;
      background-repeat: no-repeat !important;
    }
    body::before { display: none !important; }
  `;
  console.log('✅ Fondo aplicado:', fondoImg);
}

// ─── APLICAR TODOS LOS AJUSTES ────────────────

function applyAllSettings() {
  const settings = loadSettings();
  
  console.log('🔧 Aplicando ajustes...', settings);
  
  applyTheme(settings.theme);
  applyAccentColor(settings.accentColor);
  applyAnimations(settings.animations);
  applyGalleryView(settings.galleryView);
  if (settings.fondoImg) applyFondo(settings.fondoImg);
  // Restaurar tema exclusivo de tienda si existe
  if (settings.temaId && settings.temaHex) {
    const item = {
      hex: settings.temaHex, d: settings.temaD,
      dim: settings.temaDim, glow: settings.temaGlow,
      rainbow: settings.temaRainbow
    };
    // Inyectar estilos del tema de tienda
    const css = settings.temaRainbow ? '' : `
      :root {
        --neon: ${settings.temaHex} !important;
        --neon-d: ${settings.temaD} !important;
        --neon-dim: ${settings.temaDim} !important;
        --nglow: ${settings.temaGlow} !important;
        --accent: ${settings.temaHex} !important;
      }`;
    if (css) injectStyle('chh-tienda-color', css);
  }
  
  console.log('✅ Ajustes aplicados completamente');
}

// ─── INICIALIZACIÓN ───────────────────────────

// Aplicar INMEDIATAMENTE (antes de que se renderice la página)
applyAllSettings();

// También aplicar cuando el DOM esté listo (por si acaso)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
}

// Detectar cambios en otras pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'chh_settings') {
    console.log('🔄 Sincronizando desde otra pestaña...');
    applyAllSettings();
  }
});

console.log('⚙️ Sistema de ajustes CHH cargado');
