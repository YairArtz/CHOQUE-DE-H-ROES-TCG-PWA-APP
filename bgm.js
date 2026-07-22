// ── BGM PERSISTENTE (v2) ─────────────────────────────────────────────────────
// Uso: incluir <script src="bgm.js"></script> en cada módulo.
//      Desde subcarpetas (ej. /mercado/): <script src="../bgm.js"></script>
// El audio se retoma desde el punto donde quedó al navegar entre páginas.
// v2: la ruta de la pista se resuelve relativa a ESTE archivo, no a la página,
//     por lo que funciona igual desde la raíz que desde cualquier subcarpeta.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  // Resolver la pista relativa a la ubicación de bgm.js (raíz del proyecto)
  var scriptURL = (document.currentScript && document.currentScript.src) || location.href;
  var TRACK = window.BGM_TRACK || new URL('assets/audio/bgm.mp3', scriptURL).href;

  // Posición guardada POR PISTA: cada pista retoma en su propio punto
  var trackName = TRACK.split('/').pop();
  const KEY_T = 'bgm_time::' + trackName;   // sessionStorage: currentTime de esta pista
  const KEY_M = 'bgm_muted';                // localStorage:   preferencia mute (global)

  // ── Crear elemento de audio ──
  const audio = document.createElement('audio');
  audio.src = TRACK;
  audio.loop = true;
  audio.volume = 0.4;
  audio.preload = 'auto';
  document.body.appendChild(audio);

  // ── Restaurar mute ──
  const muted = localStorage.getItem(KEY_M) === '1';
  audio.muted = muted;

  // ── Restaurar posición y reproducir ──
  const savedTime = parseFloat(sessionStorage.getItem(KEY_T) || '0');
  audio.currentTime = isNaN(savedTime) ? 0 : savedTime;

  function tryPlay() {
    audio.play().catch(() => {
      // Autoplay bloqueado: esperar interacción del usuario
      document.addEventListener('click', onFirstInteraction, { once: true });
      document.addEventListener('touchstart', onFirstInteraction, { once: true });
    });
  }

  function onFirstInteraction() {
    audio.play().catch(() => {});
  }

  tryPlay();

  // ── Guardar posición cada segundo ──
  setInterval(function () {
    if (!audio.paused) {
      sessionStorage.setItem(KEY_T, audio.currentTime.toFixed(2));
    }
  }, 1000);

  // ── Guardar posición justo antes de navegar ──
  window.addEventListener('beforeunload', function () {
    sessionStorage.setItem(KEY_T, audio.currentTime.toFixed(2));
  });

  // ── Botón flotante de mute/unmute ──
  const btn = document.createElement('button');
  btn.id = 'bgm-btn';
  btn.setAttribute('aria-label', 'Música de fondo');
  btn.innerHTML = muted ? '🔇' : '🎵';
  btn.style.cssText = [
    'position:fixed',
    'bottom:20px',
    'right:16px',
    'width:36px',
    'height:36px',
    'border-radius:50%',
    'border:1px solid rgba(255,255,255,0.12)',
    'background:rgba(7,9,15,0.85)',
    'backdrop-filter:blur(8px)',
    'color:#e0eeff',
    'font-size:16px',
    'cursor:pointer',
    'z-index:9000',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'opacity:0.55',
    'transition:opacity .2s, transform .15s',
    '-webkit-tap-highlight-color:transparent',
    'line-height:1',
    'padding:0',
  ].join(';');

  btn.addEventListener('pointerenter', function () { btn.style.opacity = '1'; });
  btn.addEventListener('pointerleave', function () { btn.style.opacity = '0.55'; });
  btn.addEventListener('click', function () {
    audio.muted = !audio.muted;
    localStorage.setItem(KEY_M, audio.muted ? '1' : '0');
    btn.innerHTML = audio.muted ? '🔇' : '🎵';
    btn.style.transform = 'scale(0.88)';
    setTimeout(function () { btn.style.transform = 'scale(1)'; }, 150);
    if (!audio.muted && audio.paused) audio.play().catch(() => {});
  });

  document.body.appendChild(btn);
})();
