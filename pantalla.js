// ════════════════════════════════════════════════════════════════════
//  PANTALLA COMPLETA EN PC · Choque de Héroes TCG
//  Lo carga config.js en todas las páginas. En PC (ratón y teclado) la app pasa a pantalla
//  completa con el primer clic o tecla de cada página: el navegador no permite hacerlo sin
//  que la persona toque algo, y al cambiar de página se sale solo, por eso se repite.
//  · Ajustes → Pantalla → "Pantalla completa en PC" (localStorage chh_pantalla_completa: '0' la apaga)
//  · Si sales con Esc, ya no se vuelve a poner sola hasta que abras la app otra vez.
//  · F11 también funciona y se mantiene al cambiar de sección.
// ════════════════════════════════════════════════════════════════════
(function () {
  if (typeof document === 'undefined' || window.__chhPantalla) return;
  window.__chhPantalla = true;
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const SS = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const esPC = () => matchMedia('(pointer: fine)').matches && !matchMedia('(pointer: coarse)').matches && !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const activo = () => LS('chh_pantalla_completa') !== '0' && SS.get('chh_fs_no') !== '1';
  const enFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const de = document.documentElement;
  if (!(de.requestFullscreen || de.webkitRequestFullscreen)) return;
  let pidiendo = false, porNosotros = false;
  async function entrar() {
    if (pidiendo || enFS() || !activo() || !esPC()) return;
    pidiendo = true;
    try { porNosotros = true; if (de.requestFullscreen) await de.requestFullscreen({ navigationUI: 'hide' }); else de.webkitRequestFullscreen(); }
    catch (e) { porNosotros = false; }
    pidiendo = false;
  }
  // Si la persona sale con Esc (y no por cambiar de página), se respeta durante esta sesión
  document.addEventListener('fullscreenchange', () => {
    if (!enFS() && porNosotros && document.visibilityState === 'visible') { porNosotros = false; SS.set('chh_fs_no', '1'); }
  });
  addEventListener('pagehide', () => { porNosotros = false; });
  const gesto = e => {
    if (e.target && e.target.closest && e.target.closest('[data-no-fs]')) return;
    if (e.type === 'keydown' && (e.key === 'Escape' || e.key === 'F11' || e.ctrlKey || e.altKey || e.metaKey)) return;
    entrar();
  };
  ['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, gesto, { capture: true, passive: true }));
  window.CHH_PANTALLA = { entrar, activo, esPC, reactivar: () => { try { sessionStorage.removeItem('chh_fs_no'); } catch (e) {} } };
})();
