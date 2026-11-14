/*!
 * <cdh-logo> — Logo animado de Choque de Héroes · Nexo de Héroes
 * Codex Studio · Motion graphics: energía de plasma azul eléctrico
 *
 * Uso:
 *   <script src="cdh-logo.js" defer></script>
 *   <cdh-logo mode="boot"></cdh-logo>
 *
 * Atributos:
 *   mode       boot | title | compact | loader | wait  (default: title; wait = oculto hasta cambiar de modo)
 *   src        carpeta de assets                    (default: "assets/logo/")
 *   intensity  0.2 – 1.5  multiplicador de energía  (default: 1; compact = 0.55)
 *   progress   0 – 1  (solo loader) dibuja el anillo de carga
 *   skippable  presente = tocar durante el boot lo salta
 *   muted      presente = sin sonido (el sonido también se apaga en Ajustes: chh_logo_sfx = '0')
 *
 * Métodos:  el.play('boot'|'title')   el.burst({sound:true})   el.skip()
 * Eventos:  "cdh-logo:ready" (fin del boot / logo listo)
 */
(() => {
  if (customElements.get('cdh-logo')) return;

  const PTS = {"w_choque":{"edge":[[0.438,0.359],[0.621,0.39],[0.393,0.318],[0.706,0.372],[0.571,0.332],[0.561,0.419],[0.81,0.446],[0.312,0.384],[0.743,0.488],[0.726,0.492],[0.484,0.381],[0.357,0.465],[0.265,0.414],[0.361,0.323],[0.236,0.389],[0.662,0.487],[0.704,0.364],[0.647,0.407],[0.593,0.45],[0.62,0.394],[0.434,0.343],[0.816,0.438],[0.336,0.334],[0.528,0.46],[0.328,0.473],[0.512,0.304],[0.677,0.345],[0.564,0.421],[0.393,0.454],[0.742,0.495],[0.638,0.416],[0.288,0.475],[0.372,0.335],[0.638,0.366],[0.26,0.481],[0.288,0.474],[0.322,0.353],[0.388,0.451],[0.623,0.477],[0.596,0.32],[0.621,0.476],[0.379,0.369],[0.346,0.329],[0.419,0.44],[0.513,0.437],[0.269,0.37],[0.79,0.528],[0.25,0.414],[0.267,0.429],[0.356,0.455],[0.554,0.438],[0.445,0.412],[0.637,0.487],[0.807,0.447],[0.294,0.434],[0.502,0.304],[0.56,0.427],[0.427,0.421],[0.279,0.483],[0.796,0.536],[0.686,0.351],[0.79,0.517],[0.696,0.504],[0.694,0.456],[0.746,0.519],[0.542,0.319],[0.384,0.365],[0.629,0.328],[0.377,0.407],[0.508,0.438],[0.481,0.376],[0.428,0.384],[0.293,0.408],[0.685,0.476],[0.524,0.305],[0.292,0.439],[0.432,0.371],[0.61,0.438],[0.801,0.412],[0.69,0.501],[0.612,0.47],[0.204,0.446],[0.815,0.425],[0.612,0.472],[0.423,0.322],[0.322,0.354],[0.228,0.47],[0.817,0.432],[0.428,0.377],[0.211,0.421],[0.745,0.388],[0.283,0.421],[0.278,0.418],[0.434,0.442],[0.799,0.539],[0.745,0.518],[0.376,0.418],[0.636,0.485],[0.523,0.443],[0.673,0.346],[0.481,0.437],[0.798,0.542],[0.386,0.45],[0.816,0.544],[0.79,0.529],[0.329,0.479],[0.309,0.48],[0.383,0.357],[0.566,0.338],[0.204,0.454]],"in":[[0.656,0.372],[0.553,0.412],[0.335,0.366],[0.54,0.386],[0.234,0.444],[0.623,0.425],[0.398,0.44],[0.277,0.458],[0.596,0.359],[0.712,0.485],[0.588,0.379],[0.539,0.403],[0.412,0.399],[0.338,0.355],[0.213,0.442],[0.67,0.451],[0.804,0.534],[0.463,0.345],[0.757,0.407],[0.339,0.413],[0.465,0.371],[0.672,0.438],[0.629,0.354],[0.481,0.348],[0.646,0.427],[0.665,0.411],[0.757,0.479],[0.713,0.487],[0.268,0.448],[0.771,0.486],[0.388,0.39],[0.344,0.391],[0.517,0.316],[0.402,0.367],[0.736,0.469],[0.572,0.393],[0.763,0.396],[0.327,0.386],[0.63,0.344],[0.421,0.363],[0.507,0.323],[0.758,0.497],[0.35,0.358],[0.329,0.4],[0.538,0.419],[0.532,0.447],[0.656,0.471],[0.331,0.419],[0.754,0.471],[0.661,0.452],[0.316,0.458],[0.806,0.504],[0.723,0.487],[0.655,0.462],[0.73,0.412],[0.316,0.412],[0.696,0.371],[0.722,0.462],[0.806,0.511],[0.292,0.368]]},"w_de":{"edge":[[0.519,0.582],[0.464,0.481],[0.521,0.579],[0.538,0.483],[0.559,0.506],[0.519,0.511],[0.601,0.569],[0.486,0.57],[0.568,0.561],[0.564,0.486],[0.435,0.593],[0.472,0.589],[0.427,0.596],[0.563,0.594],[0.453,0.596],[0.528,0.482],[0.437,0.527],[0.488,0.484],[0.406,0.596],[0.524,0.59],[0.461,0.483],[0.588,0.565],[0.571,0.562],[0.522,0.576],[0.49,0.487],[0.488,0.579],[0.525,0.591],[0.493,0.546],[0.504,0.505],[0.521,0.537],[0.459,0.595],[0.569,0.506],[0.419,0.597],[0.556,0.485],[0.488,0.576],[0.43,0.494],[0.568,0.526],[0.5,0.532],[0.521,0.496],[0.436,0.595]],"in":[[0.539,0.555],[0.448,0.576],[0.568,0.572],[0.454,0.502],[0.472,0.524],[0.542,0.565],[0.559,0.495],[0.419,0.58],[0.482,0.525],[0.484,0.502],[0.479,0.538],[0.475,0.504],[0.456,0.579],[0.537,0.523],[0.446,0.526],[0.458,0.492],[0.416,0.574],[0.449,0.562],[0.477,0.579],[0.538,0.578],[0.532,0.5],[0.535,0.581],[0.447,0.524],[0.475,0.528],[0.447,0.576]]},"w_heroes":{"edge":[[0.427,0.743],[0.529,0.783],[0.692,0.638],[0.468,0.727],[0.504,0.719],[0.226,0.636],[0.472,0.758],[0.399,0.605],[0.582,0.715],[0.223,0.626],[0.537,0.666],[0.8,0.662],[0.232,0.694],[0.403,0.686],[0.438,0.69],[0.68,0.649],[0.427,0.738],[0.394,0.704],[0.467,0.782],[0.596,0.62],[0.679,0.697],[0.471,0.779],[0.427,0.74],[0.68,0.693],[0.592,0.615],[0.684,0.725],[0.351,0.729],[0.678,0.723],[0.708,0.714],[0.632,0.628],[0.399,0.709],[0.505,0.721],[0.273,0.601],[0.728,0.681],[0.227,0.642],[0.583,0.612],[0.583,0.665],[0.634,0.618],[0.755,0.679],[0.393,0.705],[0.685,0.742],[0.613,0.754],[0.614,0.75],[0.745,0.679],[0.702,0.725],[0.488,0.757],[0.304,0.702],[0.756,0.57],[0.711,0.718],[0.635,0.612],[0.286,0.665],[0.524,0.767],[0.501,0.781],[0.316,0.738],[0.76,0.568],[0.257,0.553],[0.511,0.704],[0.363,0.745],[0.579,0.611],[0.471,0.753],[0.502,0.706],[0.295,0.676],[0.438,0.724],[0.53,0.672],[0.39,0.649],[0.401,0.606],[0.425,0.608],[0.76,0.681],[0.693,0.596],[0.266,0.672],[0.238,0.705],[0.682,0.692],[0.71,0.595],[0.671,0.601],[0.396,0.65],[0.438,0.749],[0.342,0.572],[0.681,0.65],[0.318,0.739],[0.328,0.574],[0.717,0.595],[0.433,0.635],[0.438,0.65],[0.28,0.601],[0.795,0.601],[0.514,0.741],[0.529,0.634],[0.529,0.632],[0.707,0.639],[0.78,0.702],[0.518,0.746],[0.438,0.724],[0.74,0.583],[0.407,0.606],[0.329,0.746],[0.62,0.63],[0.488,0.626],[0.516,0.699],[0.37,0.595],[0.733,0.665],[0.771,0.604],[0.293,0.558],[0.667,0.75],[0.721,0.681],[0.473,0.764],[0.371,0.595],[0.403,0.709],[0.754,0.719],[0.663,0.753],[0.343,0.586]],"in":[[0.241,0.7],[0.517,0.691],[0.322,0.665],[0.642,0.689],[0.312,0.607],[0.388,0.619],[0.782,0.673],[0.594,0.634],[0.753,0.66],[0.238,0.629],[0.65,0.684],[0.778,0.629],[0.501,0.646],[0.544,0.712],[0.734,0.615],[0.288,0.585],[0.575,0.744],[0.784,0.668],[0.369,0.648],[0.515,0.633],[0.26,0.648],[0.705,0.607],[0.509,0.768],[0.26,0.626],[0.313,0.576],[0.776,0.63],[0.321,0.618],[0.695,0.71],[0.494,0.68],[0.327,0.663],[0.732,0.701],[0.377,0.66],[0.405,0.726],[0.259,0.704],[0.494,0.745],[0.666,0.731],[0.589,0.652],[0.315,0.656],[0.388,0.667],[0.513,0.768],[0.408,0.719],[0.457,0.67],[0.659,0.619],[0.325,0.629],[0.649,0.724],[0.47,0.665],[0.496,0.746],[0.345,0.722],[0.578,0.761],[0.414,0.616],[0.234,0.641],[0.669,0.738],[0.327,0.697],[0.484,0.729],[0.316,0.63],[0.249,0.629],[0.309,0.587],[0.717,0.618],[0.663,0.61],[0.351,0.604]]},"rock":[[0.112,0.535],[0.12,0.509],[0.12,0.487],[0.102,0.467],[0.101,0.441],[0.111,0.42],[0.124,0.396],[0.151,0.396],[0.17,0.372],[0.195,0.359],[0.217,0.344],[0.24,0.324],[0.262,0.306],[0.289,0.301],[0.312,0.296],[0.338,0.279],[0.362,0.268],[0.388,0.268],[0.414,0.268],[0.44,0.268],[0.466,0.268],[0.492,0.268],[0.518,0.269],[0.544,0.269],[0.57,0.269],[0.596,0.269],[0.621,0.269],[0.647,0.269],[0.654,0.271],[0.663,0.291],[0.689,0.292],[0.715,0.298],[0.737,0.312],[0.76,0.33],[0.78,0.348],[0.806,0.345],[0.832,0.349],[0.853,0.371],[0.879,0.376],[0.905,0.384],[0.921,0.406],[0.923,0.426],[0.921,0.452],[0.904,0.475],[0.897,0.501],[0.882,0.525],[0.895,0.55],[0.907,0.576],[0.906,0.602],[0.892,0.628],[0.871,0.654],[0.866,0.675],[0.852,0.695],[0.839,0.712],[0.846,0.739],[0.834,0.765],[0.812,0.781],[0.785,0.793],[0.76,0.794],[0.733,0.8],[0.707,0.813],[0.681,0.813],[0.655,0.813],[0.629,0.813],[0.604,0.813],[0.578,0.813],[0.552,0.813],[0.526,0.813],[0.5,0.813],[0.474,0.814],[0.448,0.814],[0.422,0.814],[0.396,0.814],[0.371,0.814],[0.345,0.814],[0.319,0.814],[0.299,0.808],[0.284,0.801],[0.261,0.784],[0.239,0.768],[0.213,0.759],[0.194,0.736],[0.169,0.729],[0.162,0.704],[0.146,0.682],[0.122,0.658],[0.112,0.636],[0.113,0.617],[0.127,0.598],[0.129,0.574],[0.121,0.549]],"plateBox":[0.154,0.811,0.861,0.977],"badgeBox":[0.336,0.03,0.674,0.271],"rockBox":[0.1,0.268,0.928,0.814]};
  const FILES = ['rock', 'elec', 'w_choque', 'w_de', 'w_heroes', 'badge', 'plate'];
  // Centros de cada palabra (fracción del lienzo) para el transform-origin
  const WORDS = {
    w_choque: { o: '51.5% 42.7%', delay: 0 },
    w_de:     { o: '50.4% 54.2%', delay: 0 },
    w_heroes: { o: '51% 66%',     delay: 0 }
  };
  const ROCK = { cx: 0.514, cy: 0.541, rx: 0.414, ry: 0.273 };
  const PAD = 0.22; // margen de los canvas fuera del logo (rayos que se salen)

  const CSS = `
  :host{display:block;position:relative;aspect-ratio:1/1;width:100%;max-width:100%;
    -webkit-tap-highlight-color:transparent;user-select:none;--cdh-blue:#3fa9ff;--cdh-core:#d9f4ff}
  :host([hidden]){display:none}
  .stage{position:absolute;inset:0;will-change:transform}
  .layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
  img.layer{object-fit:contain;-webkit-user-drag:none}
  canvas{position:absolute;pointer-events:none;left:${-PAD * 100}%;top:${-PAD * 100}%;
    width:${(1 + PAD * 2) * 100}%;height:${(1 + PAD * 2) * 100}%}
  .back{opacity:.95}
  .elec{mix-blend-mode:screen}
  .elec2{mix-blend-mode:screen;filter:brightness(1.8) saturate(1.3);
    -webkit-mask-image:linear-gradient(115deg,transparent 0 40%,#000 48% 52%,transparent 60% 100%);
            mask-image:linear-gradient(115deg,transparent 0 40%,#000 48% 52%,transparent 60% 100%);
    -webkit-mask-size:300% 100%;mask-size:300% 100%;
    animation:sweep 3.6s cubic-bezier(.45,0,.55,1) infinite}
  @keyframes sweep{from{-webkit-mask-position:100% 0;mask-position:100% 0}to{-webkit-mask-position:0 0;mask-position:0 0}}
  .rim{filter:blur(calc(var(--s,400px) * .022));opacity:.0}
  .rim>div,.shine,.plasma{position:absolute;inset:0;
    -webkit-mask-image:var(--wmask);mask-image:var(--wmask);
    -webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
  .rim>div{background:radial-gradient(ellipse at 50% 55%,#9be3ff,#2b8cff 55%,#1450ff)}
  .shine{mix-blend-mode:overlay;opacity:.95;
    background:linear-gradient(105deg,transparent 0 42%,rgba(255,255,255,.0) 44%,rgba(255,255,255,.95) 50%,rgba(170,230,255,.6) 53%,transparent 58% 100%);
    background-size:320% 100%;background-position:120% 0;background-repeat:no-repeat}
  .plasma{mix-blend-mode:screen;opacity:0;
    background:
      radial-gradient(circle at var(--px1,30%) var(--py1,40%),rgba(120,210,255,.75),transparent 18%),
      radial-gradient(circle at var(--px2,70%) var(--py2,60%),rgba(60,140,255,.7),transparent 16%),
      radial-gradient(circle at var(--px3,50%) var(--py3,70%),rgba(200,245,255,.6),transparent 12%)}
  .word{will-change:transform,opacity,filter}
  .plateGlow{filter:blur(calc(var(--s,400px) * .03));opacity:.55}
  .plateGlow>div{position:absolute;inset:0;background:#29c5ff;
    -webkit-mask-image:var(--pmask);mask-image:var(--pmask);-webkit-mask-size:100% 100%;mask-size:100% 100%}
  .flash{background:radial-gradient(circle at 51% 54%,rgba(235,250,255,.95),rgba(80,170,255,.55) 30%,rgba(20,60,255,0) 65%);
    opacity:0;mix-blend-mode:screen}
  `;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  const ease = {
    out: 'cubic-bezier(.16,1,.3,1)',
    inOut: 'cubic-bezier(.65,0,.35,1)',
    back: 'cubic-bezier(.34,1.56,.64,1)',
    slam: 'cubic-bezier(.7,0,.84,0)'
  };

  // Ruido 1D suave para parpadeos orgánicos
  function noise1(t, seed) {
    return (Math.sin(t * 1.7 + seed) * 0.5 + Math.sin(t * 3.9 + seed * 2.1) * 0.3 + Math.sin(t * 9.3 + seed * 3.7) * 0.2);
  }

  // Sprite de brillo pre-renderizado (barato de dibujar miles de veces)
  function glowSprite(color, size = 64) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); const r = size / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, color.replace('A', '0.9'));
    gr.addColorStop(0.5, color.replace('A', '0.25'));
    gr.addColorStop(1, color.replace('A', '0'));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return c;
  }

  // Rayo por desplazamiento de punto medio, con ramas
  function makeBolt(x1, y1, x2, y2, rough, depth, branches) {
    let pts = [[x1, y1], [x2, y2]];
    let disp = Math.hypot(x2 - x1, y2 - y1) * rough;
    for (let d = 0; d < depth; d++) {
      const next = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const nx = -(by - ay), ny = bx - ax, nl = Math.hypot(nx, ny) || 1;
        const o = rnd(-disp, disp);
        next.push([mx + nx / nl * o, my + ny / nl * o], pts[i + 1]);
      }
      pts = next; disp *= 0.52;
    }
    const kids = [];
    if (branches) {
      for (let i = 2; i < pts.length - 2; i++) {
        if (Math.random() < branches) {
          const [px, py] = pts[i];
          const [qx, qy] = pts[Math.min(pts.length - 1, i + 2)];
          const ang = Math.atan2(qy - py, qx - px) + rnd(-0.9, 0.9);
          const len = Math.hypot(x2 - x1, y2 - y1) * rnd(0.15, 0.4);
          kids.push(makeBolt(px, py, px + Math.cos(ang) * len, py + Math.sin(ang) * len, rough * 1.1, Math.max(2, depth - 2), 0));
        }
      }
    }
    return { pts, kids };
  }

  /* ───────────── Sonido sintetizado (Web Audio, sin archivos) ─────────────
   * Diseño "épico": electricidad estática, roca que cruje y pisotones con sala reverberante.
   * Todo es ruido filtrado + subgraves saturados (nada de ondas cuadradas ni "beeps").
   * Se apaga desde Ajustes → Sonido → "Sonido del logo" (localStorage chh_logo_sfx = '0').
   * Solo suena si el jugador ya tocó la página (los navegadores bloquean el audio antes).  */
  const SFX = (() => {
    let ctx = null, out = null, verb = null, noise = null, shaper = null;
    const R = (a, b) => a + Math.random() * (b - a);
    const enabled = () => { try { return localStorage.getItem('chh_logo_sfx') !== '0'; } catch (e) { return true; } };
    const activated = () => !navigator.userActivation || navigator.userActivation.hasBeenActive;

    function build(c) {
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.002; comp.release.value = 0.25;
      out = c.createGain(); out.gain.value = 0.9;
      out.connect(comp); comp.connect(c.destination);
      // Ruido blanco base
      const len = c.sampleRate * 2; noise = c.createBuffer(1, len, c.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // Sala grande: respuesta al impulso generada (estéreo, cola oscura de ~3 s)
      const il = Math.floor(c.sampleRate * 3), ir = c.createBuffer(2, il, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const x = ir.getChannelData(ch); let lp = 0;
        for (let i = 0; i < il; i++) {
          const k = i / il; lp += (Math.random() * 2 - 1 - lp) * (0.5 - 0.42 * k);   // se oscurece con el tiempo
          x[i] = lp * Math.pow(1 - k, 2.6) * (i < c.sampleRate * 0.012 ? i / (c.sampleRate * 0.012) : 1);
        }
      }
      verb = c.createConvolver(); verb.buffer = ir;
      const vg = c.createGain(); vg.gain.value = 0.55; verb.connect(vg); vg.connect(out);
      // Saturación suave para dar peso a los graves
      shaper = c.createWaveShaper(); const n = 1024, cv = new Float32Array(n);
      for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.tanh(x * 3.4) / Math.tanh(3.4); }
      shaper.curve = cv; shaper.oversample = '2x'; shaper.connect(out);
    }
    function get() {
      if (!enabled() || !activated()) return null;
      if (!ctx) {
        const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
        try { ctx = new C(); build(ctx); } catch (e) { ctx = null; return null; }
      }
      return ctx;
    }
    // Cada secuencia tiene su bus (seco + envío a la sala) para poder cortarla al saltar
    function run(fn) {
      const c = get(); if (!c) return null;
      const bus = c.createGain(), send = c.createGain(), heavy = c.createGain();
      bus.connect(out); bus.connect(send); send.gain.value = 0.32; send.connect(verb);
      heavy.connect(shaper); heavy.connect(send);
      bus.heavy = heavy;
      const go = () => { try { fn(c, c.currentTime + 0.02, bus); } catch (e) {} };
      if (c.state === 'running') go();
      else {
        let ok = false;
        c.resume().then(() => { ok = true; go(); }).catch(() => {});
        setTimeout(() => { if (!ok) { bus.disconnect(); heavy.disconnect(); } }, 250);
      }
      return bus;
    }
    function stop(bus, fade = 0.15) {
      if (!bus || !ctx) return;
      if (bus.fallback) stop(bus.fallback, fade);
      try {
        const t = ctx.currentTime;
        [bus, bus.heavy].forEach(g => { if (!g) return; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + fade); });
      } catch (e) {}
      setTimeout(() => { try { bus.disconnect(); bus.heavy && bus.heavy.disconnect(); } catch (e) {} }, fade * 1000 + 80);
    }

    // ── Primitivas ──
    function env(g, t, a, peak, dur, curve) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      if (curve === 'lin') g.gain.linearRampToValueAtTime(0.0001, t + dur);
      else g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    // Ruido filtrado (opcionalmente con barrido de filtro)
    function nz(c, dst, t, dur, o) {
      const s = c.createBufferSource(); s.buffer = noise; s.loop = true; s.playbackRate.value = o.rate || 1;
      const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 0.8;
      f.frequency.setValueAtTime(o.f || 1000, t);
      if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + (o.sweep || dur));
      const g = c.createGain(); env(g, t, o.a || 0.004, o.gain || 0.3, dur, o.curve);
      s.connect(f); f.connect(g); g.connect(dst);
      s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
      return g;
    }
    function sub(c, dst, t, dur, f1, f2, gain, glide) {
      const o = c.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + (glide || dur * 0.6));
      const g = c.createGain(); env(g, t, 0.002, gain, dur);
      o.connect(g); g.connect(dst); o.start(t); o.stop(t + dur + 0.05);
    }

    // Electricidad estática: chasquidos secos + chisporroteo con amplitud aleatoria
    function staticz(c, bus, t, dur, gain, density = 60) {
      const n = Math.max(1, Math.round(dur * density));
      for (let i = 0; i < n; i++) {
        const tt = t + Math.random() * dur;
        nz(c, bus, tt, R(0.002, 0.012), { type: 'highpass', f: R(1600, 5000), q: 0.6, gain: gain * R(0.2, 0.85), a: 0.0005 });
      }
      // siseo que "tiembla" (ganancia cambiando cada pocos ms)
      const s = c.createBufferSource(); s.buffer = noise; s.loop = true;
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4200;
      const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 7500; pk.gain.value = 6;
      const g = c.createGain(); g.gain.setValueAtTime(0, t);
      for (let tt = t; tt < t + dur; tt += R(0.006, 0.03)) g.gain.setValueAtTime(Math.random() < 0.55 ? gain * R(0.05, 0.4) : 0, tt);
      g.gain.setValueAtTime(0, t + dur);
      s.connect(hp); hp.connect(pk); pk.connect(g); g.connect(bus);
      s.start(t, Math.random()); s.stop(t + dur + 0.05);
    }
    // Chasquido de arco eléctrico (descarga): golpe brillante + pequeño cuerpo grave
    function snap(c, bus, t, gain) {
      nz(c, bus, t, 0.05, { type: 'highpass', f: 1200, q: 0.5, gain: gain * 0.9, a: 0.0005 });
      nz(c, bus, t, 0.22, { type: 'bandpass', f: 5200, f2: 1800, q: 1.4, gain: gain * 0.35, a: 0.001 });
      sub(c, bus.heavy, t, 0.12, 180, 70, gain * 0.35);
      staticz(c, bus, t + 0.01, 0.35, gain * 0.5, 90);
    }
    // Roca que cruje: granos de ruido con tono rocoso, densos al principio y luego escombros
    function rocks(c, bus, t, dur, gain, bright = 1) {
      const n = Math.round(dur * 140);
      for (let i = 0; i < n; i++) {
        const k = Math.pow(Math.random(), 2.2), tt = t + k * dur;   // se concentran al inicio
        const lvl = gain * (1 - k * 0.85) * R(0.3, 1);
        nz(c, bus, tt, R(0.006, 0.045), { type: 'bandpass', f: R(220, 1900) * bright, q: R(1.5, 5), gain: lvl, a: 0.0008 });
      }
      // grano grueso (fractura)
      nz(c, bus, t, 0.35, { type: 'lowpass', f: 1400 * bright, f2: 300, q: 1.2, gain: gain * 0.55, a: 0.002 });
    }
    // Pisotón: subgrave saturado + golpe de cuerpo + roca + cola de sala
    function stomp(c, bus, t, gain, size = 1) {
      sub(c, bus.heavy, t, 0.9 * size, 62 / Math.sqrt(size), 30, gain * 0.95, 0.5 * size);
      sub(c, bus.heavy, t, 0.09, 150, 55, gain * 0.6);                       // ataque (pegada)
      nz(c, bus, t, 1.1 * size, { type: 'lowpass', f: 900, f2: 90, q: 0.7, gain: gain * 0.7, a: 0.002 });
      nz(c, bus, t, 0.08, { type: 'bandpass', f: 2600, q: 0.7, gain: gain * 0.35, a: 0.0005 });   // transitorio
      nz(c, bus.heavy, t, 0.3 * size, { type: 'bandpass', f: 240, f2: 120, q: 1.3, gain: gain * 0.75, a: 0.002 });   // pecho del golpe (se oye en bocinas de celular)
      rocks(c, bus, t + 0.008, 0.55 * size, gain * 0.45);
      rocks(c, bus, t + 0.18, 0.9 * size, gain * 0.1, 1.6);                  // escombros que caen
    }
    // Retumbo largo (tierra temblando)
    function rumble(c, bus, t, dur, gain) {
      const g = nz(c, bus.heavy, t, dur, { type: 'lowpass', f: 140, f2: 55, q: 1, gain: gain, a: dur * 0.15 });
      return g;
    }
    // Carga de energía: retumbo creciente + soplo que se abre + estática cada vez más densa
    function charge(c, bus, t, dur) {
      nz(c, bus.heavy, t, dur, { type: 'lowpass', f: 70, f2: 260, q: 2, gain: 0.5, a: dur * 0.95, curve: 'lin' });
      nz(c, bus, t, dur, { type: 'bandpass', f: 250, f2: 3800, q: 0.9, gain: 0.32, a: dur * 0.95, curve: 'lin' });
      nz(c, bus, t + dur * 0.4, dur * 0.6, { type: 'highpass', f: 2000, f2: 9000, q: 0.7, gain: 0.12, a: dur * 0.55, curve: 'lin' });
      for (let i = 0; i < 8; i++) { const k = i / 8; staticz(c, bus, t + k * dur, dur / 8, 0.12 + 0.35 * k * k, 8 + 110 * k * k); }
    }
    // Encendido del neón: arcos eléctricos en cada parpadeo + zumbido de transformador grave
    function neon(c, bus, t, pattern, dur) {
      const step = dur / (pattern.length - 1);
      pattern.forEach((v, i) => { if (v > 0.5) { snap(c, bus, t + i * step, 0.28); } });
      const hum = c.createGain(); hum.gain.setValueAtTime(0, t);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7;
      [60, 120, 180, 240].forEach((f, i) => {
        const o = c.createOscillator(); o.frequency.value = f; const g = c.createGain(); g.gain.value = [0.5, 0.35, 0.2, 0.1][i];
        o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + 1.8);
      });
      pattern.forEach((v, i) => hum.gain.setValueAtTime(v * 0.09, t + i * step));
      hum.gain.setValueAtTime(0.09, t + dur); hum.gain.linearRampToValueAtTime(0.02, t + dur + 0.5); hum.gain.linearRampToValueAtTime(0, t + dur + 1.7);
      lp.connect(hum); hum.connect(bus);
    }
    // Barrido de energía (para el brillo): soplo resonante que sube, sin notas
    function sweep(c, bus, t, dur, gain = 1) {
      nz(c, bus, t, dur, { type: 'bandpass', f: 900, f2: 7500, q: 5, gain: gain * 0.16, a: dur * 0.45, curve: 'lin' });
      nz(c, bus, t, dur * 0.8, { type: 'highpass', f: 6000, f2: 11000, q: 0.5, gain: gain * 0.05, a: dur * 0.3, curve: 'lin' });
      staticz(c, bus, t + dur * 0.3, dur * 0.5, gain * 0.12, 40);
    }

    // ── Pista del boot grabada (assets/logo/boot.mp3): suena exacta cada vez ──
    let bootURL = null, bootAB = null, bootBuf = null, bootErr = false;
    function preload(url) {
      if (bootURL === url || !window.fetch) return; bootURL = url; bootAB = null; bootBuf = null; bootErr = false;
      fetch(url).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(ab => { bootAB = ab; }).catch(() => { bootErr = true; });
    }
    function decode(c) {
      if (bootBuf) return Promise.resolve(bootBuf);
      if (bootErr || !bootURL) return Promise.reject();
      const wait = bootAB ? Promise.resolve(bootAB) : new Promise((res, rej) => {
        const t0 = Date.now(), v = () => bootAB ? res(bootAB) : (bootErr || Date.now() - t0 > 2500) ? rej() : setTimeout(v, 40); v();
      });
      return wait.then(ab => new Promise((res, rej) => c.decodeAudioData(ab.slice(0), res, rej))).then(b => (bootBuf = b));
    }
    function bootFile(fallback) {
      const c = get(); if (!c) return null;
      const t0 = performance.now();
      const bus = c.createGain(); bus.gain.value = 0.95; bus.connect(c.destination);   // ya viene mezclada: sin compresor ni sala
      const play = buf => {
        const off = (performance.now() - t0) / 1000;           // si tardó en cargar, entra sincronizada con la animación
        if (off > buf.duration - 0.2) return;
        const s = c.createBufferSource(); s.buffer = buf; s.connect(bus); s.start(c.currentTime + 0.01, off);
      };
      const go = () => decode(c).then(play).catch(() => { if (performance.now() - t0 < 400) { const b = fallback(); if (b) bus.fallback = b; } });
      if (c.state === 'running') go(); else c.resume().then(go).catch(() => {});
      return bus;
    }

    return {
      preload,
      // Secuencias propias de otros logos (p. ej. <nexotlan-logo>) con las mismas primitivas y la misma sala
      custom(fn) { return run((c, t, bus) => fn({ nz, sub, staticz, snap, rocks, stomp, rumble, charge, sweep }, c, t, bus)); },
      boot() {
        if (bootURL && !bootErr) return bootFile(() => this.bootSynth());
        return this.bootSynth();
      },
      bootSynth() {
        return run((c, t, bus) => {
          charge(c, bus, t, 1.15);
          [0.35, 0.62, 0.82, 0.98].forEach((d, i) => snap(c, bus, t + d, 0.2 + i * 0.07));
          // 1.15 · explota la energía y aparece la roca
          snap(c, bus, t + 1.13, 0.8);
          stomp(c, bus, t + 1.15, 1.0, 1.5);
          rumble(c, bus, t + 1.15, 2.4, 0.35);
          staticz(c, bus, t + 1.2, 1.0, 0.3, 70);
          // las palabras golpean
          stomp(c, bus, t + 2.08, 0.85, 1.1); snap(c, bus, t + 2.08, 0.35);
          stomp(c, bus, t + 2.48, 0.55, 0.8); snap(c, bus, t + 2.48, 0.25);
          stomp(c, bus, t + 2.83, 1.0, 1.35); snap(c, bus, t + 2.83, 0.4);
          // aterriza el badge de Codex
          rocks(c, bus, t + 3.5, 0.35, 0.22, 1.3); sub(c, bus.heavy, t + 3.5, 0.18, 110, 50, 0.35);
          neon(c, bus, t + 3.35, [0, 1, 0.1, 0.9, 0, 0, 1, 0.35, 1, 1], 0.9);
          sweep(c, bus, t + 3.9, 1.1);
        });
      },
      burst() {
        return run((c, t, bus) => {
          snap(c, bus, t, 0.85);
          stomp(c, bus, t + 0.015, 0.95, 1.3);
          rumble(c, bus, t, 1.4, 0.3);
          staticz(c, bus, t + 0.05, 0.9, 0.3, 80);
          sweep(c, bus, t + 0.25, 0.9, 0.9);
        });
      },
      stop
    };
  })();

  class CdhLogo extends HTMLElement {
    static get observedAttributes() { return ['mode', 'progress', 'intensity']; }

    constructor() {
      super();
      this.root = this.attachShadow({ mode: 'open' });
      this.bolts = []; this.sparks = []; this.rings = [];
      this.t0 = performance.now(); this.state = 'idle';
      this.nextBolt = 0; this.nextCrawl = 0; this.nextShine = 2.2; this.nextFlicker = 3;
      this.visible = true; this.raf = 0; this.timers = [];
      // Movimiento reducido del sistema o "Animaciones" apagadas en Ajustes → sin boot ni temblores
      let anim = true; try { anim = (JSON.parse(localStorage.getItem('chh_settings') || '{}') || {}).animations !== false; } catch (e) {}
      this.reduced = !anim || matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    get intensity() {
      const a = parseFloat(this.getAttribute('intensity'));
      if (!isNaN(a)) return Math.max(0.1, Math.min(1.6, a));
      return this.getAttribute('mode') === 'compact' ? 0.55 : 1;
    }

    assetURL(name, ext = 'webp') {
      const map = window.CDH_LOGO_ASSETS;
      if (map && map[name]) return map[name];
      let base = this.getAttribute('src') || 'assets/logo/';
      if (!base.endsWith('/')) base += '/';
      return new URL(base + name + '.' + ext, document.baseURI).href;
    }

    connectedCallback() {
      if (this.built) { this.start(); return; }
      this.built = true;
      if (!this.hasAttribute('role')) { this.setAttribute('role', 'img'); this.setAttribute('aria-label', 'Choque de Héroes · Nexo de Héroes'); }
      const u = n => this.assetURL(n);
      const wmask = `url("${u('w_choque')}"),url("${u('w_de')}"),url("${u('w_heroes')}")`;
      this.style.setProperty('--wmask', wmask);
      this.style.setProperty('--pmask', `url("${u('plate')}")`);
      this.root.innerHTML = `<style>${CSS}</style>
        <div class="stage" part="stage">
          <canvas class="back"></canvas>
          <div class="layer plateGlow"><div></div></div>
          <img class="layer plate" alt="" draggable="false">
          <img class="layer rock" alt="" draggable="false">
          <img class="layer elec" alt="" draggable="false">
          <img class="layer elec2" alt="" draggable="false">
          <div class="layer rim"><div></div></div>
          <img class="layer word w_choque" alt="" draggable="false">
          <img class="layer word w_de" alt="" draggable="false">
          <img class="layer word w_heroes" alt="" draggable="false">
          <div class="layer plasma"></div>
          <div class="layer shine"></div>
          <img class="layer badge" alt="" draggable="false">
          <canvas class="front"></canvas>
          <div class="layer flash"></div>
        </div>`;
      const $ = s => this.root.querySelector(s);
      this.el = {
        stage: $('.stage'), back: $('.back'), front: $('.front'),
        rock: $('.rock'), elec: $('.elec'), elec2: $('.elec2'), rim: $('.rim'),
        w_choque: $('.w_choque'), w_de: $('.w_de'), w_heroes: $('.w_heroes'),
        plasma: $('.plasma'), shine: $('.shine'), badge: $('.badge'),
        plate: $('.plate'), plateGlow: $('.plateGlow'), flash: $('.flash')
      };
      this.el.elec2.src = u('elec');
      for (const k of ['w_choque', 'w_de', 'w_heroes']) this.el[k].style.transformOrigin = WORDS[k].o;
      this.el.badge.style.transformOrigin = '50% 100%';
      this.el.plate.style.transformOrigin = '50% 89%';

      this.bctx = this.el.back.getContext('2d');
      this.fctx = this.el.front.getContext('2d');
      this.sprBlue = glowSprite('rgba(60,160,255,A)');
      this.sprCyan = glowSprite('rgba(150,230,255,A)');

      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }, { rootMargin: '80px' });
      this.io.observe(this);
      this._vis = () => { if (!document.hidden) this.loop(); };
      document.addEventListener('visibilitychange', this._vis);
      this.addEventListener('pointerdown', () => {
        if (this.state === 'boot' && this.hasAttribute('skippable')) this.skip();
      });

      // Pista del boot: se descarga desde ya si este logo puede hacer boot
      const m0 = this.getAttribute('mode');
      if ((m0 === 'boot' || m0 === 'wait') && !this.hasAttribute('muted')) SFX.preload(this.assetURL('boot', 'mp3'));
      this.hideAll();
      this.load().then(() => this.start());
    }

    disconnectedCallback() {
      SFX.stop(this.bootBus); this.bootBus = null;
      cancelAnimationFrame(this.raf); this.raf = 0;
      this.timers.forEach(clearTimeout); this.timers = [];
    }

    attributeChangedCallback(name, oldV, newV) {
      if (!this.built || oldV === newV) return;
      if (name === 'mode' && this.loaded) this.start();
    }

    load() {
      const imgs = FILES.map(n => {
        const img = this.el[n] || new Image();
        img.decoding = 'async';
        img.src = this.assetURL(n);
        return img.decode ? img.decode().catch(() => {}) : new Promise(r => { img.onload = img.onerror = r; });
      });
      // Roca sin letras (huecos tallados) para que las palabras "golpeen" en su sitio durante el boot
      this.emptyImg = new Image(); this.emptyImg.src = this.assetURL('rock_empty');
      imgs.push(this.emptyImg.decode ? this.emptyImg.decode().catch(() => {}) : Promise.resolve());
      return Promise.all(imgs).then(() => { this.loaded = true; });
    }

    resize() {
      const r = this.getBoundingClientRect();
      this.S = r.width || 300;
      this.style.setProperty('--s', this.S + 'px');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const full = this.S * (1 + PAD * 2);
      this.el.front.width = Math.round(full * dpr);
      this.el.front.height = Math.round(full * dpr);
      this.fscale = dpr;
      // Canvas trasero a media resolución: plasma más suave y más barato
      const bd = Math.max(0.5, dpr * 0.5);
      this.el.back.width = Math.round(full * bd);
      this.el.back.height = Math.round(full * bd);
      this.bscale = bd;
    }

    // Normalizado (0..1 del logo) → px del canvas
    P(u, v, scale) { return [(u + PAD) * this.S * scale, (v + PAD) * this.S * scale]; }

    hideAll() {
      for (const k of ['rock', 'elec', 'elec2', 'rim', 'w_choque', 'w_de', 'w_heroes', 'badge', 'plate', 'plateGlow', 'plasma', 'shine'])
        this.el[k].style.opacity = 0;
    }

    clearAnims() {
      SFX.stop(this.bootBus); this.bootBus = null;
      this.timers.forEach(clearTimeout); this.timers = [];
      this.root.querySelectorAll('*').forEach(n => n.getAnimations && n.getAnimations().forEach(a => a.cancel()));
    }

    at(ms, fn) { this.timers.push(setTimeout(fn, ms)); }

    play(mode) { this.setAttribute('mode', mode); }

    start() {
      if (!this.loaded) return;
      const mode = this.getAttribute('mode') || 'title';
      this.clearAnims();
      this.resize();
      this.bolts = []; this.sparks = []; this.rings = [];
      if (mode === 'wait') { this.state = 'wait'; this.hideAll(); return; }
      if (mode === 'boot' && !this.reduced) this.boot();
      else this.toIdle(true);
      this.loop();
    }

    /* ───────────── Secuencia de arranque (≈4.4 s) ───────────── */
    boot() {
      this.state = 'boot'; this.hideAll();
      if (!this.hasAttribute('muted')) { SFX.preload(this.assetURL('boot', 'mp3')); this.bootBus = SFX.boot(); }
      this.el.rock.src = this.emptyImg.src;
      this.t0 = performance.now();
      const E = this.el, I = this.intensity;
      const S = () => this.S;

      // 0.0–1.1  convergencia de chispas hacia el núcleo
      this.charge = { start: performance.now(), dur: 1150 };
      for (let i = 0; i < 90 * I; i++) {
        const a = rnd(0, Math.PI * 2), d = rnd(0.55, 0.85);
        this.sparks.push({
          kind: 'conv', u: ROCK.cx + Math.cos(a) * d, v: ROCK.cy + Math.sin(a) * d * 0.8,
          tu: ROCK.cx + rnd(-0.03, 0.03), tv: ROCK.cy + rnd(-0.03, 0.03),
          born: performance.now() + rnd(0, 700), life: rnd(500, 750), size: rnd(0.012, 0.03)
        });
      }
      // rayos de carga desde el núcleo
      [350, 620, 820, 980].forEach(ms => this.at(ms, () => {
        for (let i = 0; i < 2; i++) {
          const a = rnd(0, Math.PI * 2);
          this.addBolt(ROCK.cx, ROCK.cy, ROCK.cx + Math.cos(a) * rnd(0.15, 0.35), ROCK.cy + Math.sin(a) * rnd(0.1, 0.22), { life: 160, width: 0.8 });
        }
      }));

      // 1.15  ¡Estallido! aparece la roca
      this.at(1150, () => {
        this.charge = null;
        this.flash(0.95, 650);
        this.shake(10, 420);
        this.ring(ROCK.cx, ROCK.cy, 0.75, 900);
        for (let i = 0; i < 9; i++) {
          const p = pick(PTS.rock);
          this.addBolt(ROCK.cx, ROCK.cy, p[0] + rnd(-0.06, 0.06), p[1] + rnd(-0.06, 0.06), { life: 260, width: 1.2, branches: 0.12 });
        }
        this.emberBurst(ROCK.cx, ROCK.cy, 60 * I, 0.6);
        E.rock.animate([
          { opacity: 0, transform: 'scale(.55) rotate(-4deg)', filter: 'brightness(3) blur(6px)' },
          { opacity: 1, transform: 'scale(1.06) rotate(.6deg)', filter: 'brightness(1.6) blur(0px)', offset: .55 },
          { opacity: 1, transform: 'scale(1) rotate(0deg)', filter: 'brightness(1) blur(0px)' }
        ], { duration: 900, easing: ease.out, fill: 'forwards' });
        E.elec.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: .25, offset: .35 }, { opacity: 1, offset: .5 }, { opacity: .8 }],
          { duration: 900, fill: 'forwards' });
      });

      // 1.75 / 2.15 / 2.50  las palabras golpean una por una
      const slam = (key, ms, power) => this.at(ms, () => {
        const el = E[key];
        el.animate([
          { opacity: 0, transform: 'scale(2.3) translateY(-6%)', filter: 'brightness(4) blur(10px)', easing: 'cubic-bezier(.55,0,1,.45)' },
          { opacity: 1, transform: 'scale(.94) translateY(0)', filter: 'brightness(2.2) blur(0px)', offset: .55, easing: ease.out },
          { opacity: 1, transform: 'scale(1.03) translateY(0)', filter: 'brightness(1.3) blur(0px)', offset: .75, easing: ease.inOut },
          { opacity: 1, transform: 'scale(1) translateY(0)', filter: 'brightness(1) blur(0px)' }
        ], { duration: 620, fill: 'forwards' });
        this.at(330, () => {
          this.shake(7 * power, 300);
          this.flash(0.45 * power, 380);
          const set = PTS[key];
          const c = set.in.reduce((a, p) => [a[0] + p[0] / set.in.length, a[1] + p[1] / set.in.length], [0, 0]);
          this.ring(c[0], c[1], 0.45 * power, 650);
          this.crawl(key, 6 * power);
          this.emberBurst(c[0], c[1], 26 * power * I, 0.35);
        });
      });
      slam('w_choque', 1750, 1.1);
      slam('w_de', 2150, 0.7);
      slam('w_heroes', 2500, 1.25);

      // 3.05  borde de energía en las letras + badge Codex cae
      this.at(3050, () => {
        E.rim.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: .55 }], { duration: 900, easing: ease.out, fill: 'forwards' });
        E.badge.animate([
          { opacity: 0, transform: 'translateY(-60%) scale(.9)' },
          { opacity: 1, transform: 'translateY(4%) scale(1.02)', offset: .6 },
          { opacity: 1, transform: 'translateY(-1.5%) scale(1)', offset: .8 },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 750, easing: ease.out, fill: 'forwards' });
      });

      // 3.35  la placa de neón "Nexo de Héroes" enciende con parpadeo
      this.at(3350, () => {
        const flick = [0, 1, 0.1, 0.9, 0, 0, 1, 0.35, 1, 1];
        const off = i => i / (flick.length - 1);
        E.plate.animate(flick.map((o, i) => ({ opacity: o, filter: `brightness(${o > .5 ? 1.25 : .6})`, offset: off(i), easing: 'steps(1,end)' })),
          { duration: 900, fill: 'forwards' });
        E.plateGlow.animate(flick.map((o, i) => ({ opacity: o * 0.55, offset: off(i), easing: 'steps(1,end)' })),
          { duration: 900, fill: 'forwards' });
        const b = PTS.plateBox;
        this.addBolt(b[0] + 0.03, (b[1] + b[3]) / 2, b[2] - 0.03, (b[1] + b[3]) / 2, { life: 300, width: 0.7, rough: 0.08 });
      });

      // 3.9  destello de brillo sobre CHOQUE DE HÉROES y pasa a reposo
      this.at(3900, () => this.shineSweep(1100));
      this.at(4400, () => this.toIdle(false));
    }

    skip() {
      if (this.state !== 'boot') return;
      this.clearAnims(); this.charge = null; this.sparks = [];
      this.toIdle(true); this.burst();
    }

    /* ───────────── Estado de reposo (loop) ───────────── */
    toIdle(fadeIn) {
      const E = this.el, keep = { fill: 'forwards' };
      this.state = 'idle';
      const set = (el, o) => { el.getAnimations().forEach(a => a.cancel()); el.style.opacity = o; el.style.transform = ''; el.style.filter = ''; };
      if (fadeIn) {
        E.rock.src = this.assetURL('rock');
        for (const k of ['rock', 'w_choque', 'w_de', 'w_heroes', 'badge', 'plate'])
          E[k].animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 700, easing: ease.out, ...keep });
        E.rim.animate([{ opacity: 0 }, { opacity: .55 }], { duration: 900, ...keep });
        E.plateGlow.animate([{ opacity: 0 }, { opacity: .55 }], { duration: 900, ...keep });
        this.at(720, () => this.toIdle(false));
        this.state = 'fade';
        return;
      }
      ['rock', 'w_choque', 'w_de', 'w_heroes', 'badge', 'plate'].forEach(k => set(E[k], 1));
      const full = this.assetURL('rock'); if (E.rock.src !== full) E.rock.src = full;
      set(E.rim, .55); set(E.plateGlow, .55); set(E.elec, .8);
      E.elec2.style.opacity = this.reduced ? 0 : 0.9;
      E.plasma.style.opacity = this.reduced ? 0 : 0.35 * this.intensity;
      // Flotación suave (desfasada entre bloques para dar profundidad)
      this.root.querySelectorAll('*').forEach(n => n.getAnimations && n.getAnimations().forEach(a => { if (a.id === 'keep') a.cancel(); }));
      if (!this.reduced) {
        const float = (el, amp, dur, delay) => el.animate(
          [{ transform: 'translateY(0)' }, { transform: `translateY(${-amp}%)` }, { transform: 'translateY(0)' }],
          { duration: dur, delay, iterations: Infinity, easing: ease.inOut, id: 'keep' });
        ['rock', 'elec', 'elec2', 'rim', 'w_choque', 'w_de', 'w_heroes', 'plasma', 'shine'].forEach(k => float(E[k], 0.6, 6000, 0));
        float(E.badge, 0.9, 6000, -900);
        float(E.plate, 0.45, 6000, -1800); float(E.plateGlow, 0.45, 6000, -1800);
      }
      this.idleT = performance.now() / 1000;
      this.nextShine = this.idleT + 2.5; this.nextBolt = this.idleT + 0.4;
      this.nextCrawl = this.idleT + 0.8; this.nextFlicker = this.idleT + rnd(4, 9);
      this.dispatchEvent(new CustomEvent('cdh-logo:ready', { bubbles: true, composed: true }));
    }

    /* ───────────── Efectos reutilizables ───────────── */
    // opts.sound = false → solo la animación (p. ej. si la página pone su propio sonido)
    burst(opts = {}) {
      if (!this.loaded) return;
      if (opts.sound !== false && !this.hasAttribute('muted')) SFX.burst();
      const E = this.el;
      this.flash(0.8, 600); this.shake(8, 380);
      this.ring(ROCK.cx, ROCK.cy, 0.8, 900);
      for (let i = 0; i < 7; i++) {
        const p = pick(PTS.rock);
        this.addBolt(ROCK.cx, ROCK.cy, p[0], p[1], { life: 240, width: 1.1, branches: 0.12 });
      }
      ['w_choque', 'w_de', 'w_heroes'].forEach((k, i) => {
        this.at(i * 90, () => {
          E[k].animate([{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(1.08)', filter: 'brightness(1.9)' }, { transform: 'scale(1)', filter: 'brightness(1)' }],
            { duration: 520, easing: ease.back });
          this.crawl(k, 4);
        });
      });
      E.rim.animate([{ opacity: .55 }, { opacity: 1 }, { opacity: .55 }], { duration: 900, easing: ease.out });
      this.emberBurst(ROCK.cx, ROCK.cy, 50 * this.intensity, 0.55);
      this.at(250, () => this.shineSweep(900));
    }

    flash(alpha, dur) {
      this.el.flash.animate([{ opacity: alpha }, { opacity: 0 }], { duration: dur, easing: 'cubic-bezier(.2,.7,.3,1)' });
    }

    shake(px, dur) {
      if (this.reduced) return;
      const k = this.S / 400, f = [];
      for (let i = 0; i <= 8; i++) {
        const d = (1 - i / 8) * px * k;
        f.push({ transform: i === 8 ? 'translate(0,0)' : `translate(${rnd(-d, d)}px,${rnd(-d, d)}px)` });
      }
      this.el.stage.animate(f, { duration: dur, easing: 'linear' });
    }

    shineSweep(dur) {
      this.el.shine.animate([{ backgroundPosition: '120% 0', opacity: 1 }, { backgroundPosition: '-20% 0', opacity: 1 }],
        { duration: dur, easing: ease.inOut });
    }

    ring(u, v, r, dur) { this.rings.push({ u, v, r, born: performance.now(), life: dur }); }

    addBolt(u1, v1, u2, v2, o = {}) {
      this.bolts.push({
        u1, v1, u2, v2, born: performance.now(), life: o.life || 200, width: o.width || 1,
        rough: o.rough || 0.22, branches: o.branches || 0, seed: Math.random(), shape: null, reshape: 0
      });
    }

    // Electricidad que recorre la superficie de una palabra
    crawl(key, n) {
      const set = PTS[key].edge;
      for (let i = 0; i < n; i++) {
        const a = pick(set);
        let b = a, tries = 0;
        while (tries++ < 12) {
          const c = pick(set);
          const d = Math.hypot(c[0] - a[0], c[1] - a[1]);
          if (d > 0.04 && d < 0.16) { b = c; break; }
        }
        if (b !== a) this.addBolt(a[0], a[1], b[0], b[1], { life: rnd(120, 260), width: rnd(0.45, 0.8), rough: 0.18, branches: 0.06 });
      }
    }

    emberBurst(u, v, n, speed) {
      for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2), s = rnd(0.15, 1) * speed;
        this.sparks.push({ kind: 'ember', u, v, vu: Math.cos(a) * s, vv: Math.sin(a) * s * 0.75 - 0.05,
          born: performance.now(), life: rnd(500, 1200), size: rnd(0.006, 0.016) });
      }
    }

    /* ───────────── Loop de render ───────────── */
    loop() {
      if (this.raf || !this.isConnected) return;
      let last = performance.now();
      const tick = now => {
        this.raf = 0;
        if (!this.visible || document.hidden || !this.isConnected) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        this.frame(now, dt);
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }

    frame(now, dt) {
      if (this.state === 'wait') {
        this.bctx.clearRect(0, 0, this.el.back.width, this.el.back.height);
        this.fctx.clearRect(0, 0, this.el.front.width, this.el.front.height);
        return;
      }
      const t = now / 1000, I = this.intensity, mode = this.getAttribute('mode') || 'title';
      const idle = this.state === 'idle';

      // ── Programación de eventos en reposo
      if (idle && !this.reduced) {
        if (t > this.nextBolt) {
          // arco en el borde de la roca
          const i = (Math.random() * PTS.rock.length) | 0;
          const a = PTS.rock[i], b = PTS.rock[(i + 3 + ((Math.random() * 6) | 0)) % PTS.rock.length];
          const out = 1.06;
          this.addBolt(ROCK.cx + (a[0] - ROCK.cx) * out, ROCK.cy + (a[1] - ROCK.cy) * out,
                       ROCK.cx + (b[0] - ROCK.cx) * out, ROCK.cy + (b[1] - ROCK.cy) * out,
                       { life: rnd(140, 260), width: rnd(0.6, 1), branches: 0.1 });
          this.nextBolt = t + rnd(0.5, 1.6) / I;
        }
        if (t > this.nextCrawl) {
          this.crawl(pick(['w_choque', 'w_choque', 'w_heroes', 'w_heroes', 'w_de']), (1 + Math.random() * 2) | 0);
          this.nextCrawl = t + rnd(0.35, 1.1) / I;
        }
        if (t > this.nextShine) { this.shineSweep(1300); this.nextShine = t + rnd(5, 7); }
        if (t > this.nextFlicker) {
          const f = [1, .3, 1, .55, 1];
          this.el.plate.animate(f.map(o => ({ opacity: o, easing: 'steps(1,end)' })), { duration: 260 });
          this.el.plateGlow.animate(f.map(o => ({ opacity: o * .55, easing: 'steps(1,end)' })), { duration: 260 });
          this.nextFlicker = t + rnd(6, 12);
        }
        // parpadeo orgánico de la electricidad dibujada en la roca
        this.el.elec.style.opacity = (0.62 + 0.38 * noise1(t * 2.2, 1.3)).toFixed(3);
        // energía que respira en el contorno de las letras
        this.el.rim.style.opacity = ((0.42 + 0.22 * (0.5 + 0.5 * Math.sin(t * 2.1)) + 0.1 * noise1(t * 4, 7)) * Math.min(1.2, I + 0.2)).toFixed(3);
        // núcleos de plasma deslizándose sobre las palabras
        const ps = this.el.plasma.style;
        ps.setProperty('--px1', (50 + 30 * Math.sin(t * 0.7)) + '%'); ps.setProperty('--py1', (42 + 4 * Math.sin(t * 1.3)) + '%');
        ps.setProperty('--px2', (50 + 30 * Math.sin(t * 0.55 + 2)) + '%'); ps.setProperty('--py2', (66 + 5 * Math.sin(t * 1.1 + 1)) + '%');
        ps.setProperty('--px3', (50 + 12 * Math.sin(t * 0.9 + 4)) + '%'); ps.setProperty('--py3', (54 + 3 * Math.sin(t * 1.7)) + '%');
      }

      this.drawBack(t, now, I, mode);
      this.drawFront(t, now, dt, I, mode);
    }

    // Aura de plasma detrás de la roca
    drawBack(t, now, I, mode) {
      const c = this.bctx, sc = this.bscale, W = this.el.back.width, H = this.el.back.height;
      c.clearRect(0, 0, W, H);
      const S = this.S * sc;
      const [cx, cy] = this.P(ROCK.cx, ROCK.cy, sc);
      let k = this.state === 'boot' ? 0 : 1;
      if (this.state === 'boot') {
        const el = (now - this.t0) / 1000;
        k = Math.max(0, Math.min(1, (el - 1.1) / 0.8));
      }
      c.globalCompositeOperation = 'lighter';

      // Núcleo de carga del boot
      if (this.charge) {
        const p = Math.min(1, (now - this.charge.start) / this.charge.dur);
        const r = S * (0.02 + 0.13 * p * p) * (1 + 0.08 * Math.sin(t * 40));
        const g = c.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2);
        g.addColorStop(0, `rgba(235,250,255,${0.9 * p})`);
        g.addColorStop(0.3, `rgba(90,180,255,${0.7 * p})`);
        g.addColorStop(1, 'rgba(20,60,255,0)');
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 2.2, 0, Math.PI * 2); c.fill();
      }
      if (k <= 0) { c.globalCompositeOperation = 'source-over'; return; }

      const rx = ROCK.rx * S, ry = ROCK.ry * S;
      // Halo base
      const g = c.createRadialGradient(cx, cy, ry * 0.4, cx, cy, rx * 1.25);
      g.addColorStop(0, `rgba(30,110,255,${0.0})`);
      g.addColorStop(0.55, `rgba(30,120,255,${0.28 * k * I})`);
      g.addColorStop(0.8, `rgba(20,80,255,${0.12 * k * I})`);
      g.addColorStop(1, 'rgba(10,40,255,0)');
      c.save(); c.translate(cx, cy); c.scale(1, ry / rx * 1.15); c.translate(-cx, -cy);
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, rx * 1.25, 0, Math.PI * 2); c.fill(); c.restore();

      // Lenguas de plasma (contornos ondulantes superpuestos)
      const layers = this.reduced ? 1 : 4;
      for (let L = 0; L < layers; L++) {
        c.beginPath();
        const N = 90;
        for (let i = 0; i <= N; i++) {
          const th = (i / N) * Math.PI * 2;
          const m = 1.02 + 0.055 * Math.sin(5 * th + t * (1.1 + L * 0.3) + L * 1.7)
                         + 0.035 * Math.sin(9 * th - t * (2.0 + L * 0.4) + L * 2.3)
                         + 0.02 * Math.sin(17 * th + t * 3.1 + L);
          const x = cx + Math.cos(th) * rx * m, y = cy + Math.sin(th) * ry * (m + 0.04);
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.closePath();
        c.lineWidth = S * (0.035 - L * 0.006);
        c.strokeStyle = L % 2 ? `rgba(120,220,255,${0.07 * k * I})` : `rgba(40,130,255,${0.11 * k * I})`;
        c.stroke();
        c.lineWidth = S * 0.006;
        c.strokeStyle = `rgba(190,240,255,${0.12 * k * I})`;
        c.stroke();
      }

      // Partículas de plasma orbitando
      const n = Math.round((this.reduced ? 18 : 64) * I);
      for (let i = 0; i < n; i++) {
        const sp = 0.12 + (i % 7) * 0.025;
        const th = i * 2.399 + t * sp * (i % 2 ? 1 : -1);
        const m = 1.0 + 0.09 * Math.sin(t * 1.3 + i * 1.7) + (i % 3) * 0.035;
        const x = cx + Math.cos(th) * rx * m, y = cy + Math.sin(th) * ry * (m + 0.06);
        const s = S * (0.025 + 0.025 * (0.5 + 0.5 * Math.sin(t * 2.3 + i)));
        c.globalAlpha = (0.35 + 0.35 * Math.sin(t * 3 + i * 0.7)) * k;
        c.drawImage(i % 3 ? this.sprBlue : this.sprCyan, x - s / 2, y - s / 2, s, s);
      }
      c.globalAlpha = 1;

      // Anillo de carga (modo loader)
      if (mode === 'loader') {
        const prog = this.hasAttribute('progress') ? Math.max(0, Math.min(1, parseFloat(this.getAttribute('progress')) || 0)) : null;
        const R = rx * 1.18, Ry = ry * 1.35;
        c.save(); c.translate(cx, cy); c.scale(1, Ry / R);
        c.lineCap = 'round';
        if (prog === null) {
          const a0 = t * 2.6;
          for (let j = 0; j < 2; j++) {
            const a = a0 + j * Math.PI;
            c.beginPath(); c.arc(0, 0, R, a, a + 1.4);
            c.lineWidth = S * 0.03; c.strokeStyle = 'rgba(50,150,255,.35)'; c.stroke();
            c.lineWidth = S * 0.008; c.strokeStyle = 'rgba(220,248,255,.9)'; c.stroke();
          }
        } else {
          c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2);
          c.lineWidth = S * 0.006; c.strokeStyle = 'rgba(60,150,255,.18)'; c.stroke();
          const a = -Math.PI / 2;
          c.beginPath(); c.arc(0, 0, R, a, a + prog * Math.PI * 2);
          c.lineWidth = S * 0.03; c.strokeStyle = 'rgba(50,150,255,.4)'; c.stroke();
          c.lineWidth = S * 0.009; c.strokeStyle = 'rgba(225,250,255,.95)'; c.stroke();
          const ex = Math.cos(a + prog * Math.PI * 2) * R, ey = Math.sin(a + prog * Math.PI * 2) * R;
          const s = S * 0.09; c.drawImage(this.sprCyan, ex - s / 2, ey - s / 2, s, s);
        }
        c.restore();
      }
      c.globalCompositeOperation = 'source-over';
    }

    // Rayos, chispas y ondas
    drawFront(t, now, dt, I, mode) {
      const c = this.fctx, sc = this.fscale, W = this.el.front.width, H = this.el.front.height;
      c.clearRect(0, 0, W, H);
      const S = this.S * sc;
      c.globalCompositeOperation = 'lighter';
      c.lineJoin = 'round'; c.lineCap = 'round';

      // Ondas expansivas
      this.rings = this.rings.filter(r => {
        const p = Math.max(0, (now - r.born) / r.life); if (p >= 1) return false;
        const e = 1 - Math.pow(1 - p, 3);
        const [x, y] = this.P(r.u, r.v, sc);
        const R = r.r * S * e;
        c.save(); c.translate(x, y); c.scale(1, 0.62);
        c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2);
        c.lineWidth = S * 0.03 * (1 - p); c.strokeStyle = `rgba(60,160,255,${0.45 * (1 - p)})`; c.stroke();
        c.lineWidth = S * 0.006 * (1 - p) + 0.5; c.strokeStyle = `rgba(225,250,255,${0.85 * (1 - p)})`; c.stroke();
        c.restore();
        return true;
      });

      // Rayos
      this.bolts = this.bolts.filter(b => {
        const age = Math.max(0, now - b.born); if (age > b.life) return false;
        if (!b.shape || now > b.reshape) { // se redibuja la forma cada ~45ms: chisporroteo vivo
          const [x1, y1] = this.P(b.u1, b.v1, sc), [x2, y2] = this.P(b.u2, b.v2, sc);
          b.shape = makeBolt(x1, y1, x2, y2, b.rough, 6, b.branches);
          b.reshape = now + 45;
        }
        const p = age / b.life;
        const a = p < 0.15 ? p / 0.15 : Math.pow(1 - (p - 0.15) / 0.85, 1.4);
        const fl = 0.75 + 0.25 * Math.random();
        this.strokeBolt(c, b.shape, a * fl, b.width * S / 400);
        return true;
      });

      // Chispas
      const nowS = now;
      this.sparks = this.sparks.filter(s => {
        const age = nowS - s.born;
        if (age < 0) return true;
        if (age > s.life) return false;
        const p = age / s.life;
        let u, v, alpha;
        if (s.kind === 'conv') {
          const e = p * p * p;
          u = s.u + (s.tu - s.u) * e; v = s.v + (s.tv - s.v) * e;
          alpha = Math.min(1, p * 3) * (1 - Math.pow(p, 6));
          // estela
          const pe = Math.max(0, p - 0.08), e2 = pe * pe * pe;
          const [x0, y0] = this.P(s.u + (s.tu - s.u) * e2, s.v + (s.tv - s.v) * e2, sc);
          const [x1, y1] = this.P(u, v, sc);
          c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1);
          c.lineWidth = S * 0.004; c.strokeStyle = `rgba(160,230,255,${alpha * 0.8})`; c.stroke();
        } else {
          const tt = age / 1000;
          u = s.u + s.vu * tt; v = s.v + s.vv * tt + 0.12 * tt * tt;
          alpha = 1 - p;
        }
        const [x, y] = this.P(u, v, sc);
        const sz = s.size * S * (s.kind === 'ember' ? (1 - p * 0.5) : 1) * 3;
        c.globalAlpha = alpha;
        c.drawImage(this.sprCyan, x - sz / 2, y - sz / 2, sz, sz);
        c.globalAlpha = 1;
        return true;
      });

      // Chispas ambientales que suben desde la roca (reposo)
      if (this.state === 'idle' && !this.reduced && Math.random() < 0.25 * I) {
        const p = pick(PTS.rock);
        this.sparks.push({ kind: 'ember', u: p[0], v: p[1], vu: rnd(-0.03, 0.03), vv: rnd(-0.12, -0.05),
          born: now, life: rnd(900, 1800), size: rnd(0.004, 0.009) });
      }
      c.globalCompositeOperation = 'source-over';
    }

    strokeBolt(c, shape, a, w) {
      const path = pts => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
      const draw = (sh, k) => {
        path(sh.pts);
        c.lineWidth = 14 * w * k; c.strokeStyle = `rgba(30,110,255,${0.16 * a})`; c.stroke();
        c.lineWidth = 6 * w * k;  c.strokeStyle = `rgba(60,160,255,${0.38 * a})`; c.stroke();
        c.lineWidth = 2.6 * w * k; c.strokeStyle = `rgba(150,225,255,${0.85 * a})`; c.stroke();
        c.lineWidth = 1.1 * w * k; c.strokeStyle = `rgba(255,255,255,${a})`; c.stroke();
        sh.kids.forEach(kd => draw(kd, k * 0.6));
      };
      draw(shape, 1);
    }
  }

  CdhLogo.SFX = SFX;   // reutilizable por otros componentes: customElements.get('cdh-logo').SFX
  customElements.define('cdh-logo', CdhLogo);
})();
