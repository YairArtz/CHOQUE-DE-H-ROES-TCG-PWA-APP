/* ═══════════════════════════════════════════════════════════════════
   temas-ui.js · Temas de color de la Tienda en la interfaz del
   Simulador, el Arcade y el modo Online.
   ─────────────────────────────────────────────────────────────────
   • Solo cambia la INTERFAZ (botones, menús, paneles, bordes, carta
     seleccionada, pantalla final…): el dorado del juego pasa al color
     del tema. Los colores de los tipos de carta (alma, apoyo, sector,
     personaje…) y los de cada jugador no se tocan.
   • El tema lo guarda settings.js (localStorage "chh_tema_ui") cada vez
     que se aplica en cualquier pantalla con ajustes (menú, tienda…).
   • "Verde Nexo" (el gratis) = colores originales del simulador.
   • Temas animados (RGB, aurora, fuego…) también se animan aquí.
   Incluir al final del <body>:  <script src="temas-ui.js"></script>
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  var T = null;
  try { T = JSON.parse(localStorage.getItem('chh_tema_ui') || 'null'); } catch (e) {}
  if (!T || !T.id || T.id === 'green' || !T.hex) return;

  // Colores dorados de la interfaz original (como los devuelve el navegador: rgb/rgba o #hex)
  var PAL = [
    { rgb: [212, 135, 10], hex: '#d4870a', to: 'var(--tm)' },      // --gold del simulador / --gold-d del Arcade
    { rgb: [245, 166, 35], hex: '#f5a623', to: 'var(--tm)' },      // --gold del Arcade
    { rgb: [245, 200, 66], hex: '#f5c842', to: 'var(--tm-l)' },    // --gold2 (claro)
    { rgb: [160, 93, 4],   hex: '#a05d04', to: 'var(--tm-d)' },    // fondo oscuro de los botones dorados
    { rgb: [255, 243, 196], hex: '#fff3c4', to: 'var(--tm-xl)' }   // brillo casi blanco
  ];

  function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lum(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }

  // Tema muy oscuro (obsidiana, índigo…): se aclara para que los textos oscuros sobre botones sigan leyéndose
  var base = T.hex, L = lum(hexRgb(T.hex));
  var tm = T.anim ? 'var(--tmA)' : (L < 0.42 ? 'color-mix(in srgb,' + base + ' 68%,#fff)' : base);
  var css = '';
  if (T.anim) {
    // La animación del tema mueve --neon en :root; aquí se renombra a --tmA para no chocar con la página
    css += String(T.anim).replace(/--neon\b(?!-)/g, '--tmA').replace(/--neon-d\b/g, '--tmA-d').replace(/--neon-dim\b/g, '--tmA-dim') + '\n';
  }
  css += 'html:root{--tm:' + tm + ';--tm-l:color-mix(in srgb,var(--tm) 72%,#fff);--tm-xl:color-mix(in srgb,var(--tm) 30%,#fff);' +
         '--tm-d:' + (T.anim ? 'color-mix(in srgb,var(--tm) 55%,#000)' : (T.d || 'color-mix(in srgb,var(--tm) 55%,#000)')) + '}\n';
  var st = document.createElement('style'); st.id = 'chh-tema-ui'; st.textContent = css;
  (document.body || document.head || document.documentElement).appendChild(st);
  // Del CSS del tema animado solo se queda lo que mueve el color (@property, @keyframes y :root);
  // las reglas para títulos de otras pantallas (.tcg-label, .accent…) no aplican aquí
  try { var R = st.sheet.cssRules; for (var k = R.length - 1; k >= 0; k--) if (R[k].type === 1 && !/^(html)?:root$/.test(R[k].selectorText)) st.sheet.deleteRule(k); } catch (e) {}

  function mix(to, a) { var p = Math.round(parseFloat(a) * 100); return p >= 100 ? to : 'color-mix(in srgb,' + to + ' ' + p + '%,transparent)'; }
  function swap(v) {
    if (!v || (v.indexOf('rgb') < 0 && v.indexOf('#') < 0)) return v;
    var out = v;
    PAL.forEach(function (c) {
      var re = new RegExp('rgba?\\(\\s*' + c.rgb[0] + '\\s*,\\s*' + c.rgb[1] + '\\s*,\\s*' + c.rgb[2] + '\\s*(?:,\\s*([\\d.]+)\\s*)?\\)', 'g');
      out = out.replace(re, function (m, a) { return a == null ? c.to : mix(c.to, a); });
      out = out.replace(new RegExp(c.hex + '(?![0-9a-f])', 'gi'), c.to);
    });
    return out;
  }
  function decl(s) {
    for (var i = 0; i < s.length; i++) {
      var p = s[i], v = s.getPropertyValue(p), n = swap(v);
      if (n !== v) { try { s.setProperty(p, n, s.getPropertyPriority(p)); } catch (e) {} }
    }
  }
  function walk(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.style) decl(r.style);
      if (r.cssRules) walk(r.cssRules);          // @media, @supports, @keyframes
    }
  }
  function aplicar() {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sh = document.styleSheets[i];
      if (sh.ownerNode === st) continue;
      try { walk(sh.cssRules); } catch (e) {}    // hojas de otro dominio (fuentes) no se pueden leer
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar); else aplicar();
  addEventListener('load', aplicar);              // estilos que la página agrega después (ya cambiados no se vuelven a tocar)
})();
