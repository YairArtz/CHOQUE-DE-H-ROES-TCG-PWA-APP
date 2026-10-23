// ── BGM PERSISTENTE (v4) ─────────────────────────────────────────────────────
// v4: · Música elegida por el jugador en Soundtrack ("Usar de fondo"):
//       localStorage chh_bgm_pista = {id, titulo, url}. Si no carga, vuelve a la de siempre.
//       Los módulos con pista propia (window.BGM_TRACK, p. ej. Mercado) la conservan.
//     · Si la página reproduce otra música o audio largo (mini reproductor, etc.), el fondo
//       se pausa y se reanuda al terminar. window.BGM = {pausar, reanudar, pista}.
// Uso: incluir <script src="bgm.js"></script> en cada módulo.
//      Desde subcarpetas (ej. /mercado/): <script src="../bgm.js"></script>
//      Pista propia por módulo: definir window.BGM_TRACK antes del script.
// v3: · El audio se crea DESPUÉS de que la página terminó de cargar, para no
//       competir por la red con imágenes y datos del módulo.
//     · Si está en mute no se descarga nada hasta que el usuario lo active.
//     · La posición se restaura al tener metadatos (antes se perdía en móvil).
//     · Reintentos automáticos si la red falla y al recuperar conexión.
//     · Desbloqueo de autoplay con touchend/click/keydown (touchstart no cuenta
//       como interacción en Chrome y consumía el intento).
// v2: ruta de la pista relativa a este archivo; posición guardada por pista.
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  var scriptURL = (document.currentScript && document.currentScript.src) || location.href;
  var DEFAULT = new URL('assets/audio/bgm.mp3', scriptURL).href;
  var elegida = null;
  try { elegida = JSON.parse(localStorage.getItem('chh_bgm_pista') || 'null'); } catch (e) {}
  var usandoElegida = !window.BGM_TRACK && !!(elegida && elegida.url);
  var TRACK = window.BGM_TRACK
    ? new URL(window.BGM_TRACK, location.href).href
    : usandoElegida ? new URL(elegida.url, scriptURL).href : DEFAULT;

  var trackName = TRACK.split('/').pop();
  var KEY_T = 'bgm_time::' + trackName;   // sessionStorage: posición de esta pista
  var KEY_M = 'bgm_muted';                // localStorage: mute global

  var muted = localStorage.getItem(KEY_M) === '1';
  var audio = null;
  var retries = 0;
  var MAX_RETRIES = 4;
  var UNLOCK_EVENTS = ['touchend', 'click', 'keydown'];

  function savedTime() {
    var t = parseFloat(sessionStorage.getItem(KEY_T) || '0');
    return isNaN(t) ? 0 : t;
  }

  function savePos() {
    if (audio && !isNaN(audio.currentTime) && audio.currentTime > 0) {
      sessionStorage.setItem(KEY_T, audio.currentTime.toFixed(2));
    }
  }

  function crearAudio() {
    if (audio) return;
    audio = new Audio();
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = 'auto';
    audio.muted = muted;

    audio.addEventListener('loadedmetadata', function () {
      var t = savedTime();
      if (t > 0 && isFinite(audio.duration) && audio.duration > 0) {
        try { audio.currentTime = t % audio.duration; } catch (e) {}
      }
    }, { once: true });

    audio.addEventListener('playing', function () { retries = 0; });
    audio.addEventListener('error', onError);

    audio.src = TRACK;
    intentar();
  }

  function intentar() {
    if (!audio || audio.muted || otros > 0) return;
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function (err) {
        if (err && err.name === 'NotAllowedError') esperarInteraccion();
        // Otros errores (red): los maneja onError / 'online'
      });
    }
  }

  function esperarInteraccion() {
    UNLOCK_EVENTS.forEach(function (ev) {
      document.addEventListener(ev, desbloquear, { capture: true, passive: true });
    });
  }

  function desbloquear() {
    UNLOCK_EVENTS.forEach(function (ev) {
      document.removeEventListener(ev, desbloquear, { capture: true });
    });
    if (audio && audio.paused && !audio.muted) intentar();
  }

  function onError() {
    // La pista elegida en Soundtrack no está disponible: vuelve a la música de siempre
    if (usandoElegida && navigator.onLine !== false && audio && audio.error && (audio.error.code === 4 || retries >= 1)) {
      usandoElegida = false; TRACK = DEFAULT; trackName = TRACK.split('/').pop(); KEY_T = 'bgm_time::' + trackName;
      retries = 0; audio.src = TRACK; intentar(); return;
    }
    if (retries >= MAX_RETRIES) return;
    retries++;
    setTimeout(function () {
      if (!audio) return;
      savePos();
      audio.load();
      intentar();
    }, 1500 * retries);
  }

  window.addEventListener('online', function () {
    if (audio && (audio.error || audio.networkState === 3)) {
      retries = 0;
      audio.load();
      intentar();
    }
  });

  // ── Otra música en la página: pausa el fondo mientras suena ──
  var otros = 0, pausadoPorOtro = false;
  function pausar() { if (audio && !audio.paused) { savePos(); audio.pause(); pausadoPorOtro = true; } }
  function reanudar() { if (otros > 0) return; if (audio && !muted && audio.paused) { pausadoPorOtro = false; intentar(); } }
  try {
    var playOriginal = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      var el = this;
      if (el !== audio && !el.__bgmHook) {
        el.__bgmHook = true;
        el.addEventListener('playing', function () {
          if (el.__bgmOn || el.muted) return;
          if (el.loop || !(el.duration <= 20)) { el.__bgmOn = true; otros++; pausar(); }   // efectos cortos no la pausan
        });
        var fin = function () { if (!el.__bgmOn) return; el.__bgmOn = false; otros = Math.max(0, otros - 1); if (!otros) setTimeout(reanudar, 250); };
        el.addEventListener('pause', fin); el.addEventListener('ended', fin); el.addEventListener('emptied', fin);
      }
      return playOriginal.apply(this, arguments);
    };
  } catch (e) {}
  window.BGM = { pausar: pausar, reanudar: reanudar, pista: function () { return TRACK; }, sonando: function () { return !!(audio && !audio.paused); } };

  // ── Guardar posición ──
  setInterval(function () { if (audio && !audio.paused) savePos(); }, 1000);
  window.addEventListener('pagehide', savePos);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') savePos();
  });

  // ── Arranque diferido: después de que la página cargó ──
  function arrancar() {
    if (muted) return;   // en mute no se descarga la pista
    setTimeout(crearAudio, 300);
  }
  if (document.readyState === 'complete') arrancar();
  else window.addEventListener('load', arrancar, { once: true });

  // ── Botón flotante de mute/unmute ──
  var btn = document.createElement('button');
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
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    muted = !muted;
    localStorage.setItem(KEY_M, muted ? '1' : '0');
    btn.innerHTML = muted ? '🔇' : '🎵';
    btn.style.transform = 'scale(0.88)';
    setTimeout(function () { btn.style.transform = 'scale(1)'; }, 150);

    if (!audio) { if (!muted) crearAudio(); return; }
    audio.muted = muted;
    if (!muted && audio.paused) intentar();
  });

  document.body.appendChild(btn);
})();
