/*!
 * <nexotlan-logo> — Logo animado del Modo Aventura (Choque de Héroes + NEXOTLAN)
 * Codex Studio · Motion graphics: las letras de piedra atraviesan grietas dimensionales
 *
 * Uso:
 *   <script src="nexotlan-logo.js" defer></script>      (carga cdh-logo.js sola si hace falta)
 *   <nexotlan-logo mode="boot"></nexotlan-logo>
 *
 * Atributos:
 *   mode   boot | title | wait     (default: title; wait = oculto hasta cambiar de modo)
 *   src    carpeta de assets       (default: "assets/logo/")
 *   muted  presente = sin sonido   (también se apaga en Ajustes: chh_logo_sfx = '0')
 *
 * Métodos:  el.play('boot'|'title')   el.burst()   el.skip()
 * Eventos:  "nexotlan-logo:ready"
 */
(() => {
  if (customElements.get('nexotlan-logo')) return;

  // Script propio → para resolver cdh-logo.js y los assets aunque la página esté en otra carpeta
  const SELF = (document.currentScript && document.currentScript.src) || document.baseURI;
  if (!customElements.get('cdh-logo') && !document.querySelector('script[data-cdh-logo]')) {
    const sc = document.createElement('script'); sc.src = new URL('cdh-logo.js', SELF).href; sc.setAttribute('data-cdh-logo', '');
    (document.head || document.documentElement).appendChild(sc);
  }

  // Cajas de cada letra dentro del letrero (x, y, ancho, alto — fracción del letrero)
  const BOX = [[0.0078,0.2218,0.1553,0.5977],[0.1564,0.2331,0.1263,0.5865],[0.276,0.3308,0.1263,0.4887],[0.3955,0.3308,0.1274,0.4887],[0.5162,0.3308,0.1251,0.4887],[0.6346,0.3308,0.1263,0.4887],[0.7542,0.3308,0.1229,0.4887],[0.8704,0.3308,0.1296,0.4887]];
  const WORD_X = 0.2231, WORD_W = 0.7769;        // el letrero ocupa la parte derecha
  const BASE_Y = 0.81;                           // línea del suelo (base de las letras)
  const SAND = ['#e7c48d', '#d6a86b', '#f2dcb0', '#b98b55'];

  const CSS = `
  :host{display:block;position:relative;aspect-ratio:1152/266;width:100%;user-select:none;-webkit-tap-highlight-color:transparent}
  :host([hidden]){display:none}
  .wrap{position:absolute;inset:0;will-change:transform}
  .cdh{position:absolute;left:0;top:0;height:100%;width:23.09%}
  .word{position:absolute;left:${WORD_X * 100}%;width:${WORD_W * 100}%;top:0;height:100%}
  .aura{position:absolute;left:-4%;right:-4%;top:6%;bottom:2%;border-radius:50%;opacity:0;
    background:radial-gradient(ellipse at 50% 60%,rgba(54,214,255,.28),rgba(140,90,255,.16) 45%,transparent 70%);filter:blur(calc(var(--h,100px)*.08))}
  canvas{position:absolute;pointer-events:none;left:-6%;top:-30%;width:112%;height:160%}
  .slot{position:absolute}
  .L{position:absolute;inset:0;opacity:0;will-change:transform,opacity,filter,clip-path}
  .L img{position:absolute;inset:0;width:100%;height:100%;-webkit-user-drag:none}
  .rim,.shine,.hot{position:absolute;inset:0;-webkit-mask-image:var(--m);mask-image:var(--m);
    -webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
  .rimw{position:absolute;inset:0;filter:blur(calc(var(--h,100px)*.022));opacity:0}
  .hot{background:linear-gradient(#ffffff,#d8f6ff 55%,#f1d6ff);opacity:0;mix-blend-mode:screen}
  .rim{background:linear-gradient(#bff4ff,#36d6ff 45%,#8f6bff 80%,#cc55ff)}
  .shine{mix-blend-mode:overlay;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.95) 50%,rgba(255,240,210,.55) 54%,transparent 62%);
    background-size:400% 100%;background-position:130% 0;background-repeat:no-repeat}
  .rift{position:absolute;left:50%;top:-18%;width:7%;height:136%;margin-left:-3.5%;opacity:0;border-radius:50%;
    background:linear-gradient(transparent,#8fefff 18%,#fff 50%,#d68bff 82%,transparent);
    box-shadow:0 0 calc(var(--h,100px)*.06) #36d6ff,0 0 calc(var(--h,100px)*.14) #8f6bff;mix-blend-mode:screen}
  .flash{position:absolute;inset:-10% -4%;opacity:0;pointer-events:none;mix-blend-mode:screen;
    background:radial-gradient(ellipse at 58% 60%,rgba(255,255,255,.9),rgba(140,220,255,.5) 30%,rgba(140,90,255,.2) 55%,transparent 72%)}
  `;

  const R = (a, b) => a + Math.random() * (b - a);
  const EASE = { out: 'cubic-bezier(.16,1,.3,1)', back: 'cubic-bezier(.34,1.56,.64,1)', inOut: 'cubic-bezier(.65,0,.35,1)' };

  class NexotlanLogo extends HTMLElement {
    static get observedAttributes() { return ['mode']; }
    constructor() {
      super();
      this.root = this.attachShadow({ mode: 'open' });
      this.parts = []; this.timers = []; this.raf = 0; this.state = 'wait'; this.visible = true;
      let anim = true; try { anim = (JSON.parse(localStorage.getItem('chh_settings') || '{}') || {}).animations !== false; } catch (e) {}
      this.reduced = !anim || matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    url(n) {
      const map = window.CDH_LOGO_ASSETS; if (map && map[n]) return map[n];
      let base = this.getAttribute('src') || 'assets/logo/'; if (!base.endsWith('/')) base += '/';
      return new URL(base + n + '.webp', document.baseURI).href;
    }
    connectedCallback() {
      if (this.built) { this.start(); return; }
      this.built = true;
      if (!this.hasAttribute('role')) { this.setAttribute('role', 'img'); this.setAttribute('aria-label', 'Choque de Héroes · Nexotlan'); }
      const letters = BOX.map((b, i) => `
        <div class="slot" style="left:${b[0] * 100}%;top:${b[1] * 100}%;width:${b[2] * 100}%;height:${b[3] * 100}%;--m:url('${this.url('nx' + i)}')">
          <div class="L"><div class="rimw"><div class="rim"></div></div><img alt="" draggable="false" src="${this.url('nx' + i)}"><div class="hot"></div><div class="shine"></div></div><div class="rift"></div>
        </div>`).join('');
      const src = this.getAttribute('src');
      this.root.innerHTML = `<style>${CSS}</style><div class="wrap">
        <cdh-logo class="cdh" mode="wait" ${src ? `src="${src}"` : ''} ${this.hasAttribute('muted') ? 'muted' : ''}></cdh-logo>
        <div class="word"><div class="aura"></div><canvas class="back"></canvas>${letters}<canvas class="front"></canvas></div>
        <div class="flash"></div></div>`;
      const $ = s => this.root.querySelector(s);
      this.el = { wrap: $('.wrap'), cdh: $('.cdh'), word: $('.word'), aura: $('.aura'), flash: $('.flash'), back: $('.back'), front: $('.front') };
      this.parts = [...this.root.querySelectorAll('.slot')].map(S => { const L = S.querySelector('.L'); return { L, rimw: L.querySelector('.rimw'), shine: L.querySelector('.shine'), rift: S.querySelector('.rift'), hot: L.querySelector('.hot') }; });
      this.fctx = this.el.front.getContext('2d'); this.bctx = this.el.back.getContext('2d');
      this.dust = []; this.sparks = []; this.waves = [];
      // Sprites de polvo suaves (degradado radial): nubes, no círculos
      this.spr = {};
      SAND.forEach(col => { const k = document.createElement('canvas'); k.width = k.height = 64; const g = k.getContext('2d');
        const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, col); gr.addColorStop(.45, col + '99'); gr.addColorStop(1, col + '00');
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64); this.spr[col] = k; });
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this);
      this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.loop(); }); this.io.observe(this);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.loop(); });
      const imgs = [...this.root.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => {}) : null);
      Promise.all(imgs).then(() => { this.loaded = true; this.start(); });
    }
    disconnectedCallback() { this.clear(); cancelAnimationFrame(this.raf); this.raf = 0; }
    attributeChangedCallback(n, o, v) { if (this.loaded && o !== v) this.start(); }
    play(m) { this.setAttribute('mode', m); }
    resize() {
      const r = this.getBoundingClientRect(); this.W = r.width || 600; this.H = r.height || 140;
      this.style.setProperty('--h', this.H + 'px');
      const dpr = Math.min(devicePixelRatio || 1, 2), wr = this.el.word.getBoundingClientRect();
      this.cw = (wr.width || this.W * WORD_W) * 1.12; this.ch = (wr.height || this.H) * 1.6;
      [this.el.front, this.el.back].forEach(c => { c.width = Math.round(this.cw * dpr); c.height = Math.round(this.ch * dpr); });
      this.dpr = dpr;
    }
    // fracción del letrero → px del canvas
    P(u, v) { return [((u + 0.06) / 1.12) * this.cw * this.dpr, ((v + 0.3) / 1.6) * this.ch * this.dpr]; }
    sfx() { const C = customElements.get('cdh-logo'); return !this.hasAttribute('muted') && C && C.SFX && C.SFX.custom ? C.SFX : null; }
    clear() {
      this.timers.forEach(clearTimeout); this.timers = [];
      const S = this.sfx(); if (S && this.bus) S.stop(this.bus); this.bus = null;
      this.root.querySelectorAll('*').forEach(n => n.getAnimations && n.getAnimations().forEach(a => a.cancel()));
    }
    at(ms, fn) { this.timers.push(setTimeout(fn, ms)); }
    hide() { this.parts.forEach(p => { p.L.style.opacity = 0; p.rimw.style.opacity = 0; }); this.el.aura.style.opacity = 0; }

    start() {
      if (!this.loaded) return;
      const mode = this.getAttribute('mode') || 'title';
      this.clear(); this.resize(); this.dust = []; this.sparks = []; this.waves = [];
      if (mode === 'wait') { this.state = 'wait'; this.hide(); this.el.cdh.setAttribute('mode', 'wait'); return; }
      if (mode === 'boot' && !this.reduced) this.boot(); else this.idle(true);
      this.loop();
    }

    /* ───────── Boot ≈3.4 s: grietas dimensionales → letras de piedra → impacto ───────── */
    boot() {
      this.state = 'boot'; this.hide();
      const cdh = this.el.cdh; cdh.setAttribute('mode', 'title');
      this.el.aura.animate([{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: .55 }], { duration: 2600, fill: 'forwards' });
      const T0 = 380, STEP = 165;                                   // cada letra: grieta (0) → atraviesa (110) → asienta (330)
      const S = this.sfx();
      if (S) this.bus = S.custom((P, c, t, bus) => {
        P.nz(c, bus, t, 2.1, { type: 'bandpass', f: 180, f2: 2600, q: 1.1, gain: 0.22, a: 1.9, curve: 'lin' });   // soplo dimensional que crece
        P.rumble(c, bus, t, 2.3, 0.22);
        BOX.forEach((b, i) => {
          const ti = t + (T0 + i * STEP) / 1000;
          P.snap(c, bus, ti, 0.14);
          P.stomp(c, bus, ti + 0.33, i === 0 ? 0.55 : 0.36, i === 0 ? 0.8 : 0.55);
        });
        const tf = t + (T0 + 7 * STEP + 520) / 1000;
        P.snap(c, bus, tf - 0.02, 0.7); P.stomp(c, bus, tf, 1.0, 1.5); P.rumble(c, bus, tf, 2.2, 0.32);
        P.rocks(c, bus, tf + 0.05, 1.1, 0.25, 1.1); P.staticz(c, bus, tf + 0.05, 0.8, 0.22, 60);
        P.sweep(c, bus, tf + 0.45, 1.0, 0.8);
      });
      this.parts.forEach((p, i) => this.at(T0 + i * STEP, () => this.emerge(p, i)));
      const fin = T0 + 7 * STEP + 520;
      this.at(fin, () => this.impact());
      this.at(fin + 450, () => this.sweep(1300, 70));
      this.at(fin + 1300, () => this.idle(false));
    }
    emerge(p, i) {
      const b = BOX[i];
      p.rift.animate([
        { opacity: 0, transform: 'scaleY(0) scaleX(.6)' },
        { opacity: 1, transform: 'scaleY(1) scaleX(1)', offset: .3 },
        { opacity: .85, transform: 'scaleY(1.05) scaleX(6)', offset: .7 },
        { opacity: 0, transform: 'scaleY(.9) scaleX(10)' }], { duration: 420, easing: 'ease-out' });
      p.L.animate([
        { opacity: 1, clipPath: 'inset(-20% 50% -20% 50%)', transform: 'scale(1.32) translateY(-10%)', filter: 'blur(3px)', easing: EASE.out },
        { opacity: 1, clipPath: 'inset(-20% 0% -20% 0%)', transform: 'scale(.96) translateY(1.5%)', filter: 'blur(0px)', offset: .62, easing: EASE.inOut },
        { opacity: 1, clipPath: 'inset(-20% 0% -20% 0%)', transform: 'scale(1) translateY(0)', filter: 'blur(0px)' }
      ], { duration: 480, delay: 110, fill: 'forwards' });
      p.hot.animate([{ opacity: 1 }, { opacity: .55, offset: .5 }, { opacity: 0 }], { duration: 650, delay: 110, easing: 'ease-out' });
      this.at(330, () => {
        const cx = b[0] + b[2] / 2;
        this.puff(cx, BASE_Y + 0.02, b[2] * 0.9, i === 0 ? 18 : 11);
        this.spark(cx, b[1] + b[3] * 0.5, 10);
        this.shake(i === 0 ? 3 : 2, 180);
      });
    }
    impact() {
      this.el.flash.animate([{ opacity: .85 }, { opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)' });
      this.shake(9, 480);
      this.waves.push({ born: performance.now(), life: 900 });
      for (let k = 0; k < 9; k++) this.puff(0.06 + k * 0.11, BASE_Y + 0.02, 0.12, 9);
      this.parts.forEach((p, i) => {
        p.L.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-3 - (i % 3)}%)`, offset: .3 }, { transform: 'translateY(0)' }], { duration: 520, delay: Math.abs(i - 3.5) * 28, easing: EASE.out });
        p.rimw.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: .45 }], { duration: 1200, fill: 'forwards' });
      });
      try { this.el.cdh.burst && this.el.cdh.burst({ sound: false }); } catch (e) {}
    }

    /* ───────── Reposo ───────── */
    idle(fade) {
      this.parts.forEach(p => { p.L.getAnimations().forEach(a => a.cancel()); p.rimw.getAnimations().forEach(a => a.cancel()); });
      if (fade) {
        this.el.cdh.setAttribute('mode', 'title');
        this.parts.forEach((p, i) => p.L.animate([{ opacity: 0, transform: 'translateY(6%)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: i * 40, easing: EASE.out, fill: 'forwards' }));
        this.el.aura.animate([{ opacity: 0 }, { opacity: .55 }], { duration: 900, fill: 'forwards' });
      }
      this.parts.forEach(p => { p.L.style.opacity = 1; p.L.style.clipPath = 'none'; p.rimw.style.opacity = .45; });
      this.state = 'idle';
      const t = performance.now() / 1000;
      this.nextSweep = t + (fade ? 1.4 : 5); this.nextGlitch = t + R(5, 9);
      this.dispatchEvent(new CustomEvent('nexotlan-logo:ready', { bubbles: true, composed: true }));
    }
    skip() { if (this.state !== 'boot') return; this.clear(); this.idle(true); this.burst(); }
    burst() {
      if (!this.loaded) return;
      const S = this.sfx();
      if (S) S.custom((P, c, t, bus) => { P.snap(c, bus, t, .7); P.stomp(c, bus, t + .01, .9, 1.3); P.rumble(c, bus, t, 1.4, .28); P.sweep(c, bus, t + .25, .9, .8); });
      this.impact(); this.at(200, () => this.sweep(1100, 55));
    }

    /* ───────── Efectos ───────── */
    sweep(dur, stagger) {
      this.parts.forEach((p, i) => p.shine.animate([{ backgroundPosition: '130% 0' }, { backgroundPosition: '-30% 0' }], { duration: dur * 0.55, delay: i * stagger, easing: EASE.inOut }));
    }
    shake(px, dur) {
      if (this.reduced) return;
      const k = this.H / 140, f = [];
      for (let i = 0; i <= 8; i++) { const d = (1 - i / 8) * px * k; f.push({ transform: i === 8 ? 'none' : `translate(${R(-d, d)}px,${R(-d, d)}px)` }); }
      this.el.wrap.animate(f, { duration: dur });
    }
    glitch() {
      const p = this.parts[(Math.random() * 8) | 0], d = R(1, 2.2) * (Math.random() < .5 ? -1 : 1);
      p.L.animate([
        { transform: 'none', filter: 'none' },
        { transform: `translateX(${d}%)`, filter: 'drop-shadow(2px 0 0 rgba(54,214,255,.9)) drop-shadow(-2px 0 0 rgba(204,85,255,.9))', offset: .2 },
        { transform: `translateX(${-d * .6}%)`, filter: 'drop-shadow(-2px 0 0 rgba(54,214,255,.9)) drop-shadow(2px 0 0 rgba(204,85,255,.9))', offset: .5 },
        { transform: 'none', filter: 'none' }], { duration: 220, easing: 'steps(4,end)' });
    }
    puff(u, v, spread, n) {
      for (let i = 0; i < n; i++) this.dust.push({
        u: u + R(-spread / 2, spread / 2), v: v + R(-0.02, 0.02), vu: R(-0.18, 0.18), vv: R(-0.32, -0.06),
        born: performance.now(), life: R(700, 1500), r: R(0.03, 0.08), c: SAND[(Math.random() * 4) | 0] });
    }
    spark(u, v, n) {
      for (let i = 0; i < n; i++) { const a = R(0, Math.PI * 2), s = R(0.2, 0.7);
        this.sparks.push({ u, v, vu: Math.cos(a) * s * 0.35, vv: Math.sin(a) * s, born: performance.now(), life: R(300, 700) }); }
    }
    loop() {
      if (this.raf || !this.isConnected) return;
      const tick = now => { this.raf = 0; if (!this.visible || document.hidden || !this.isConnected) return; this.frame(now); if (this.state !== 'wait') this.raf = requestAnimationFrame(tick); };
      this.raf = requestAnimationFrame(tick);
    }
    frame(now) {
      const c = this.fctx, b = this.bctx, W = this.el.front.width, H = this.el.front.height, t = now / 1000;
      c.clearRect(0, 0, W, H); b.clearRect(0, 0, W, H);
      if (this.state === 'wait') return;
      const unit = H / 1.6;   // alto del letrero en px de canvas
      if (this.state === 'idle' && !this.reduced) {
        if (t > this.nextSweep) { this.sweep(1500, 85); this.nextSweep = t + R(6, 8.5); }
        if (t > this.nextGlitch) { this.glitch(); this.nextGlitch = t + R(6, 12); }
        // brillo de energía que respira en los bordes
        const k = 0.36 + 0.16 * Math.sin(t * 1.9);
        this.parts.forEach((p, i) => { p.rimw.style.opacity = (k + 0.06 * Math.sin(t * 3.1 + i)).toFixed(3); });
        // polvo de arena que sube del suelo y destellos en las aristas
        if (Math.random() < 0.18) this.dust.push({ u: R(0.02, 0.98), v: BASE_Y + R(-.01, .02), vu: R(-.03, .03), vv: R(-.12, -.05), born: now, life: R(1600, 2800), r: R(.008, .02), c: SAND[(Math.random() * 4) | 0], mote: 1 });
        if (Math.random() < 0.06) { const bx = BOX[(Math.random() * 8) | 0]; this.sparks.push({ u: bx[0] + R(.1, .9) * bx[2], v: bx[1] + R(0, .25) * bx[3], vu: 0, vv: 0, born: now, life: 500, star: 1 }); }
      }
      // onda de choque a lo largo del suelo
      this.waves = this.waves.filter(w => {
        const p = Math.max(0, (now - w.born) / w.life); if (p >= 1) return false;
        const e = 1 - Math.pow(1 - p, 3), [cx, cy] = this.P(0.5, BASE_Y), half = e * 0.75 * this.cw * this.dpr;
        const g = b.createLinearGradient(cx - half, 0, cx + half, 0);
        g.addColorStop(0, 'rgba(54,214,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.9 * (1 - p)})`); g.addColorStop(1, 'rgba(204,85,255,0)');
        b.globalCompositeOperation = 'lighter';
        b.fillStyle = g; b.fillRect(cx - half, cy - unit * 0.012, half * 2, unit * 0.024);
        const g2 = b.createRadialGradient(cx, cy, 0, cx, cy, half);
        g2.addColorStop(0, `rgba(120,200,255,${.35 * (1 - p)})`); g2.addColorStop(1, 'rgba(120,200,255,0)');
        b.save(); b.translate(cx, cy); b.scale(1, .12); b.translate(-cx, -cy); b.fillStyle = g2; b.beginPath(); b.arc(cx, cy, half, 0, Math.PI * 2); b.fill(); b.restore();
        b.globalCompositeOperation = 'source-over';
        return true;
      });
      // polvo (detrás y delante)
      this.dust = this.dust.filter(d => {
        const age = Math.max(0, now - d.born); if (age > d.life) return false;
        const p = age / d.life, s = age / 1000;
        const u = d.u + d.vu * s, v = d.v + d.vv * s * (1 - p * 0.5);
        const [x, y] = this.P(u, v); const r = d.r * unit * (d.mote ? 1 : 1 + p * 1.8);
        c.globalAlpha = (d.mote ? 0.7 : 0.3) * Math.sin(Math.PI * Math.min(1, p * 1.15));
        c.drawImage(this.spr[d.c], x - r, y - r, r * 2, r * 2);
        return true;
      });
      c.globalAlpha = 1; b.globalAlpha = 1;
      // chispas / destellos
      c.globalCompositeOperation = 'lighter';
      this.sparks = this.sparks.filter(s => {
        const age = Math.max(0, now - s.born); if (age > s.life) return false;
        const p = age / s.life, tt = age / 1000;
        const [x, y] = this.P(s.u + s.vu * tt, s.v + s.vv * tt + 0.6 * tt * tt);
        if (s.star) {
          const a = Math.sin(Math.PI * p), L = unit * 0.07 * a;
          c.strokeStyle = `rgba(255,250,235,${a})`; c.lineWidth = Math.max(1, unit * 0.006);
          c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y); c.moveTo(x, y - L); c.lineTo(x, y + L); c.stroke();
          c.fillStyle = `rgba(190,240,255,${a * .8})`; c.beginPath(); c.arc(x, y, unit * .012, 0, Math.PI * 2); c.fill();
        } else {
          c.fillStyle = `rgba(170,235,255,${1 - p})`; c.beginPath(); c.arc(x, y, unit * 0.008 * (1 - p * .5), 0, Math.PI * 2); c.fill();
        }
        return true;
      });
      c.globalCompositeOperation = 'source-over';
    }
  }
  customElements.define('nexotlan-logo', NexotlanLogo);
})();
