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
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg', '#f8f9fa');
    document.documentElement.style.setProperty('--bg2', '#e9ecef');
    document.documentElement.style.setProperty('--bg3', '#dee2e6');
    document.documentElement.style.setProperty('--border', '#ced4da');
    document.documentElement.style.setProperty('--muted', '#6c757d');
    document.body.style.color = '#212529';
  } else {
    // Restaurar tema oscuro (valores originales)
    document.documentElement.style.setProperty('--bg', '#03050a');
    document.documentElement.style.setProperty('--bg2', '#07090f');
    document.documentElement.style.setProperty('--bg3', '#0b0e18');
    document.documentElement.style.setProperty('--border', '#141c2a');
    document.documentElement.style.setProperty('--muted', '#6a7f9a');
    document.body.style.color = '#e0eeff';
  }
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
  if (accent) {
    // Cambiar TODAS las variables de color de acento
    document.documentElement.style.setProperty('--neon', accent.primary);
    document.documentElement.style.setProperty('--neon-d', accent.dark);
    document.documentElement.style.setProperty('--neon-dim', accent.dim);
    document.documentElement.style.setProperty('--nglow', accent.glow);
    
    // También actualizar las variables con nombre específico de color (para compatibilidad)
    const colorPrefix = color; // 'green', 'gold', 'blue', 'purple'
    document.documentElement.style.setProperty(`--${colorPrefix}`, accent.primary);
    document.documentElement.style.setProperty(`--${colorPrefix}-d`, accent.dark);
    document.documentElement.style.setProperty(`--${colorPrefix}-dim`, accent.dim);
    document.documentElement.style.setProperty(`--${colorPrefix}glow`, accent.glow);
    
    console.log(`✅ Color de acento aplicado: ${color}`);
  }
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
