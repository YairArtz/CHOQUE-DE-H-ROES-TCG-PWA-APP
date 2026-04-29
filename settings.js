// ═══════════════════════════════════════════
// CHOQUE DE HÉROES TCG - SISTEMA DE AJUSTES
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

// ─── APLICAR AJUSTES VISUALES ───────────────

function applyTheme(theme) {
  // Crear o actualizar el style tag para el tema
  let styleTag = document.getElementById('chh-theme-override');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'chh-theme-override';
    document.head.appendChild(styleTag);
  }

  if (theme === 'light') {
    styleTag.textContent = `
      :root {
        --bg: #f8f9fa !important;
        --bg2: #e9ecef !important;
        --bg3: #dee2e6 !important;
        --border: #ced4da !important;
        --muted: #6c757d !important;
        --text: #212529 !important;
        --card: #ffffff !important;
      }
      html, body {
        background: #f8f9fa !important;
        color: #212529 !important;
      }
    `;
  } else {
    // Tema oscuro (restaurar valores originales)
    styleTag.textContent = `
      :root {
        --bg: #03050a !important;
        --bg2: #07090f !important;
        --bg3: #0b0e18 !important;
        --border: #141c2a !important;
        --muted: #6a7f9a !important;
        --text: #e0eeff !important;
      }
      html, body {
        background: #03050a !important;
        color: #e0eeff !important;
      }
    `;
  }
  console.log(`✅ Tema aplicado: ${theme}`);
}

function applyAccentColor(color) {
  const colorMap = {
    green: {
      primary: '#00ff9d',
      dark: '#007a4a',
      dim: 'rgba(0,255,157,.09)',
      glow: '0 0 6px #00ff9d,0 0 18px rgba(0,255,157,.4)'
    },
    gold: {
      primary: '#f5a623',
      dark: '#7a5210',
      dim: 'rgba(245,166,35,.1)',
      glow: '0 0 8px #f5a623,0 0 22px rgba(245,166,35,.45)'
    },
    blue: {
      primary: '#00cfff',
      dark: '#005f80',
      dim: 'rgba(0,207,255,.09)',
      glow: '0 0 6px #00cfff,0 0 18px rgba(0,207,255,.4)'
    },
    purple: {
      primary: '#cc55ff',
      dark: '#6a1a80',
      dim: 'rgba(180,70,255,.1)',
      glow: '0 0 8px #cc55ff,0 0 22px rgba(180,70,255,.5)'
    }
  };

  const accent = colorMap[color];
  if (!accent) return;

  // Crear o actualizar el style tag para colores de acento
  let styleTag = document.getElementById('chh-accent-override');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'chh-accent-override';
    document.head.appendChild(styleTag);
  }

  // Inyectar CSS con !important para sobrescribir TODAS las páginas
  styleTag.textContent = `
    :root {
      /* Variables principales de acento */
      --neon: ${accent.primary} !important;
      --neon-d: ${accent.dark} !important;
      --neon-dim: ${accent.dim} !important;
      --nglow: ${accent.glow} !important;
      
      /* Alias para diferentes páginas */
      --accent: ${accent.primary} !important;
      --accent-glow: ${accent.dim} !important;
      --accent-dim: ${accent.dim} !important;
      
      /* Variables de color específicas (para compatibilidad) */
      --green: ${color === 'green' ? accent.primary : colorMap.green.primary} !important;
      --gold: ${color === 'gold' ? accent.primary : colorMap.gold.primary} !important;
      --blue: ${color === 'blue' ? accent.primary : colorMap.blue.primary} !important;
      --purple: ${color === 'purple' ? accent.primary : colorMap.purple.primary} !important;
    }
  `;
  
  console.log(`✅ Color de acento aplicado: ${color}`);
}

function applyAnimations(enabled) {
  if (!enabled) {
    document.documentElement.style.setProperty('--transition-speed', '0s');
    // Deshabilitar todas las animaciones
    const style = document.createElement('style');
    style.id = 'no-animations';
    style.textContent = '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
    document.head.appendChild(style);
  } else {
    document.documentElement.style.setProperty('--transition-speed', '0.3s');
    // Remover estilo de deshabilitación
    const noAnimStyle = document.getElementById('no-animations');
    if (noAnimStyle) noAnimStyle.remove();
  }
}

function applyGalleryView(view) {
  // Esta función aplica la vista de galería
  const container = document.querySelector('.card-grid');
  if (container) {
    // Remover todas las clases de columnas
    container.classList.remove('cols-2', 'cols-3', 'cols-4');
    // Agregar la clase correcta según el view
    const colNumber = view.replace('col', '');
    container.classList.add(`cols-${colNumber}`);
    
    console.log(`✅ Vista de galería aplicada: ${view}`);
  } else {
    // Si no estamos en la galería, guardar para cuando se cargue
    console.log(`💾 Vista de galería guardada: ${view} (se aplicará al abrir galería)`);
  }
}

// ─── APLICAR TODOS LOS AJUSTES ──────────────

function applyAllSettings() {
  const settings = loadSettings();
  
  applyTheme(settings.theme);
  applyAccentColor(settings.accentColor);
  applyAnimations(settings.animations);
  applyGalleryView(settings.galleryView);
  
  console.log('✅ Ajustes aplicados:', settings);
}

// ─── INICIALIZACIÓN AUTOMÁTICA ──────────────

// Aplicar ajustes inmediatamente al cargar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyAllSettings);
} else {
  applyAllSettings();
}

// Detectar cambios en otras pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'chh_settings') {
    console.log('🔄 Ajustes actualizados desde otra pestaña');
    applyAllSettings();
  }
});
