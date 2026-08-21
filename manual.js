/* ══════════════════════════════════════════════════════════════
   MANUAL DEL HÉROE — Modal universal
   Uso:
     <script src="manual.js" defer></script>
     <button onclick="abrirManual()">❓</button>
     <button onclick="abrirManual('hp')">Ver Hero Pesos</button>
   IDs de sección: hp, ranking, logros, sobres, tienda, perfil, faq
   ══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // ───────────────────────────────────────────────
  //  CONTENIDO — edita aquí los textos
  // ───────────────────────────────────────────────
  const SECCIONES = [
    {
      id: 'hp',
      icono: '💰',
      titulo: 'Hero Pesos',
      html: `
        <p class="mhu-lead">Los <b>Hero Pesos (HP)</b> son la moneda del universo Choque de Héroes.
        Los ganas jugando y los canjeas por sobres, cartas sueltas y personalización.</p>

        <h4>¿Cómo se ganan?</h4>
        <ul>
          <li><b>Participando en torneos oficiales</b> — cada partido y colocación te suma HP.</li>
          <li><b>Códigos de regalo</b> — tarjetas de un solo uso con formato <code>CDH-XXXX-XXXX-XXXX</code> que entregan los organizadores en eventos, promociones o como premio.</li>
          <li><b>Logros desbloqueados</b> — algunos hitos entregan HP como recompensa (ver sección de Logros).</li>
        </ul>

        <h4>¿Cómo canjear un código?</h4>
        <ol>
          <li>Entra a tu <b>Perfil</b> y toca <i>Canjear código</i>.</li>
          <li>Escribe el código completo (respeta guiones y mayúsculas).</li>
          <li>Los HP se acreditan al instante en tu saldo.</li>
        </ol>
        <p class="mhu-tip">⚠️ Cada código es <b>de un solo uso</b> y queda ligado a la primera cuenta que lo canjea. No lo compartas.</p>

        <h4>¿En qué se gastan?</h4>
        <ul>
          <li><b>Sobres</b> — el uso más común, entrega cartas aleatorias.</li>
          <li><b>Cartas sueltas</b> — cartas específicas listadas en la tienda.</li>
          <li><b>Avatares y fondos</b> — para personalizar tu perfil.</li>
        </ul>
      `
    },
    {
      id: 'ranking',
      icono: '🏆',
      titulo: 'Puntos de Ranking',
      html: `
        <p class="mhu-lead">Los <b>Puntos de Ranking (PTS)</b> son distintos a los Hero Pesos.
        Miden tu desempeño competitivo y te ubican en la tabla global.</p>

        <h4>¿Cuál es la diferencia con los HP?</h4>
        <table class="mhu-tabla">
          <tr><th></th><th>HP 💰</th><th>PTS 🏆</th></tr>
          <tr><td>Se gastan</td><td>Sí</td><td>No</td></tr>
          <tr><td>Reflejan nivel</td><td>No</td><td>Sí</td></tr>
          <tr><td>Se pueden regalar</td><td>Sí (códigos)</td><td>No</td></tr>
          <tr><td>Fuente</td><td>Torneos, códigos, logros</td><td>Solo torneos oficiales</td></tr>
        </table>

        <h4>¿Cómo suben?</h4>
        <ul>
          <li>Cada victoria en torneo oficial suma PTS.</li>
          <li>Las colocaciones altas (top 3, top 8) entregan bonos.</li>
          <li>Los torneos de mayor categoría reparten más PTS.</li>
        </ul>

        <h4>Tabla global</h4>
        <p>Consulta tu posición y la de otros jugadores en el módulo de <b>Ranking</b> desde el menú principal.
        Se actualiza al cierre de cada torneo.</p>
      `
    },
    {
      id: 'logros',
      icono: '🎖️',
      titulo: 'Logros',
      html: `
        <p class="mhu-lead">Los <b>logros</b> son hitos que registras a lo largo de tu carrera como jugador de Choque de Héroes. Algunos son coleccionables, otros entregan recompensas.</p>

        <h4>Tipos de logros</h4>
        <ul>
          <li><b>Participación</b> — asistir a torneos, jugar N partidos.</li>
          <li><b>Colección</b> — obtener cartas de cierta rareza o de un arco completo.</li>
          <li><b>Competitivos</b> — ganar torneos, cadenas de victorias, top rankings.</li>
          <li><b>Eventos especiales</b> — logros temporales durante lanzamientos.</li>
        </ul>

        <h4>¿Cómo se ven?</h4>
        <p>Entra a tu <b>Perfil</b> para revisar los logros desbloqueados. Cada uno muestra:</p>
        <ul>
          <li>Nombre e icono.</li>
          <li>Descripción de cómo se obtuvo.</li>
          <li>Recompensa (si aplica): HP, avatar, título, etc.</li>
          <li>Fecha en que se desbloqueó.</li>
        </ul>

        <p class="mhu-tip">💡 Algunos logros son <b>secretos</b>: solo aparecen cuando los desbloqueas.</p>
      `
    },
    {
      id: 'sobres',
      icono: '📦',
      titulo: 'Sobres',
      html: `
        <p class="mhu-lead">Los <b>sobres</b> son la forma principal de conseguir cartas nuevas. Se compran con Hero Pesos desde la Tienda.</p>

        <h4>Tipos de sobre</h4>
        <ul>
          <li><b>Sobres regulares</b> — disponibles siempre, contienen cartas del set base.</li>
          <li><b>Sobres temáticos</b> — enfocados en un arco o expansión (Encantadoras, Túneles Perdidos, etc.).</li>
          <li><b>Sobres especiales</b> 🌟 — de disponibilidad limitada: pueden estar restringidos por región, jugador o ventana de tiempo. Solo aparecen si cumples las condiciones.</li>
        </ul>

        <h4>Rarezas de carta</h4>
        <p>Cada carta tiene una rareza que determina cuán común es:</p>
        <ul>
          <li><span class="mhu-rar comun">Común</span> — la base de la colección.</li>
          <li><span class="mhu-rar poco">Poco Común</span> — un escalón arriba.</li>
          <li><span class="mhu-rar rara">Rara</span> — difícil de conseguir, brillo púrpura.</li>
          <li><span class="mhu-rar foil">Foil</span> — versión tornasol dorada de una carta.</li>
          <li><span class="mhu-rar foilpc">Foil Poco Común</span> — variante brillante naranja.</li>
          <li><span class="mhu-rar secreta">Secreta</span> — la más rara, con efecto tornasol pleno.</li>
        </ul>

        <h4>Apertura</h4>
        <ol>
          <li>Toca <i>ABRIR</i> en el sobre de tu elección.</li>
          <li>Toca el sobre para cortarlo.</li>
          <li>Revela las cartas una por una tocando cada una.</li>
        </ol>
        <p class="mhu-tip">✨ Las cartas raras, foil y secretas muestran un <b>efecto holográfico tornasol</b> al revelarse.</p>

        <h4>Historial</h4>
        <p>Todas tus aperturas quedan registradas. Consulta el <i>Historial de sobres</i> desde la Tienda para revisar qué obtuviste y cuándo.</p>
      `
    },
    {
      id: 'tienda',
      icono: '🏪',
      titulo: 'Tienda',
      html: `
        <p class="mhu-lead">La <b>Tienda</b> es donde inviertes tus Hero Pesos. Se organiza en cuatro secciones.</p>

        <h4>📦 Sobres</h4>
        <p>El catálogo de sobres disponibles según tu perfil. El saldo de HP y el costo se muestran en cada tarjeta.</p>

        <h4>🃏 Cartas sueltas</h4>
        <p>Cartas específicas a la venta directa (sin depender del azar). El precio depende de la rareza.
        Ideal si te falta una carta puntual para completar un mazo.</p>

        <h4>🎨 Avatares</h4>
        <p>Imágenes de perfil coleccionables — desde héroes clásicos hasta variantes exclusivas.
        El avatar equipado se muestra en tu ficha y en torneos.</p>

        <h4>🖼️ Fondos</h4>
        <p>Fondos temáticos para tu perfil. Combínalos con tu avatar para personalizar cómo te ven los demás jugadores.</p>

        <p class="mhu-tip">💡 Los avatares y fondos <b>no caducan</b>: una vez comprados quedan en tu inventario para siempre.</p>
      `
    },
    {
      id: 'perfil',
      icono: '👤',
      titulo: 'Perfil y personalización',
      html: `
        <p class="mhu-lead">Tu <b>Perfil</b> es tu identidad como jugador de Choque de Héroes.</p>

        <h4>¿Qué incluye?</h4>
        <ul>
          <li><b>Avatar y fondo</b> equipados.</li>
          <li><b>Saldo de HP y PTS</b> actuales.</li>
          <li><b>ID de jugador</b> — tu identificador único (te lo pedirán en torneos).</li>
          <li><b>Historial</b> de sobres, canjes de códigos y torneos.</li>
          <li><b>Logros</b> desbloqueados.</li>
        </ul>

        <h4>Cambiar avatar o fondo</h4>
        <ol>
          <li>Ve a la <b>Tienda</b> → sección de Avatares o Fondos.</li>
          <li>Selecciona uno de tu inventario.</li>
          <li>Toca <i>Equipar</i>.</li>
        </ol>

        <h4>Canjear un código</h4>
        <p>Desde el Perfil, usa el botón <i>Canjear código</i>, escribe el <code>CDH-XXXX-XXXX-XXXX</code> y confirma. Los HP entran al instante.</p>

        <h4>Cerrar sesión</h4>
        <p>Botón <i>Salir</i> al final de tu perfil. Vuelves a entrar cuando quieras con tu misma cuenta.</p>
      `
    },
    {
      id: 'faq',
      icono: '❓',
      titulo: 'Preguntas frecuentes',
      html: `
        <div class="mhu-faq">
          <details>
            <summary>¿Perdí mi saldo de HP, qué hago?</summary>
            <p>Escríbele al organizador de tu torneo o al staff oficial de Codex Studio. El historial de la app queda respaldado y el saldo se puede restaurar.</p>
          </details>

          <details>
            <summary>¿Puedo transferir HP a otro jugador?</summary>
            <p>No directamente. Puedes conseguir códigos de regalo en promociones oficiales y compartirlos, pero cada código es de un solo uso.</p>
          </details>

          <details>
            <summary>¿Las cartas de la app se pueden usar en torneos físicos?</summary>
            <p>La app es un complemento digital. Para torneos oficiales se usan las cartas físicas. Consulta el reglamento oficial en el módulo <b>Reglamento</b>.</p>
          </details>

          <details>
            <summary>Instalé la app pero no aparece mi progreso.</summary>
            <p>Verifica que iniciaste sesión con la misma cuenta. Si actualizaste la app, cierra sesión y vuelve a entrar para forzar la sincronización.</p>
          </details>

          <details>
            <summary>¿Cómo consigo un sobre especial 🌟?</summary>
            <p>Los sobres especiales aparecen automáticamente si cumples las condiciones (región, evento, participación en un torneo específico). Si no lo ves, no está disponible para tu cuenta en este momento.</p>
          </details>

          <details>
            <summary>¿La app funciona sin internet?</summary>
            <p>Puedes consultar contenido cacheado (comics leídos, reglamento). Para comprar sobres, canjear códigos o ver rankings necesitas conexión.</p>
          </details>

          <details>
            <summary>¿Dónde reporto un error o sugiero una mejora?</summary>
            <p>Contacta a Codex Studio en las redes oficiales o a través de tu organizador de torneo. Todo feedback es bienvenido.</p>
          </details>
        </div>
      `
    }
  ];

  // ───────────────────────────────────────────────
  //  CSS
  // ───────────────────────────────────────────────
  const CSS = `
    .mhu-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:5000;flex-direction:column;}
    .mhu-overlay.active{display:flex;}
    .mhu-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(245,166,35,.25);background:linear-gradient(180deg,rgba(20,15,35,.98),rgba(10,10,20,.95));position:sticky;top:0;z-index:2;}
    .mhu-title{font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:2px;color:#f5a623;text-shadow:0 0 10px rgba(245,166,35,.4);}
    .mhu-close{background:none;border:1px solid rgba(245,166,35,.4);color:#f5a623;width:34px;height:34px;border-radius:6px;font-size:1rem;cursor:pointer;font-family:'Orbitron',sans-serif;}
    .mhu-close:hover{background:rgba(245,166,35,.1);}

    .mhu-tabs{display:flex;gap:6px;padding:10px 12px;overflow-x:auto;background:rgba(0,0,0,.6);border-bottom:1px solid rgba(255,255,255,.06);scrollbar-width:none;}
    .mhu-tabs::-webkit-scrollbar{display:none;}
    .mhu-tab{flex-shrink:0;font-family:'Orbitron',sans-serif;font-size:.55rem;font-weight:700;letter-spacing:1.5px;padding:8px 12px;border-radius:5px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#b8b8c8;cursor:pointer;white-space:nowrap;transition:all .2s;}
    .mhu-tab:hover{border-color:rgba(245,166,35,.4);color:#f5a623;}
    .mhu-tab.active{background:linear-gradient(135deg,rgba(245,166,35,.2),rgba(204,85,255,.1));border-color:#f5a623;color:#f5a623;text-shadow:0 0 6px rgba(245,166,35,.5);}

    .mhu-content{flex:1;overflow-y:auto;padding:22px 20px 60px;color:#e8e8f0;-webkit-overflow-scrolling:touch;}
    .mhu-content h3{font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;letter-spacing:2px;color:#f5a623;margin:0 0 6px;text-shadow:0 0 12px rgba(245,166,35,.35);display:flex;align-items:center;gap:10px;}
    .mhu-content h3 .mhu-ico{font-size:1.4rem;}
    .mhu-content h4{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:900;letter-spacing:1.5px;color:#cc55ff;margin:22px 0 8px;text-transform:uppercase;text-shadow:0 0 6px rgba(204,85,255,.3);}
    .mhu-content p{font-size:.88rem;line-height:1.55;margin:0 0 10px;color:#d8d8e4;}
    .mhu-content ul,.mhu-content ol{padding-left:20px;margin:6px 0 12px;}
    .mhu-content li{font-size:.85rem;line-height:1.6;margin-bottom:6px;color:#d0d0dc;}
    .mhu-content b{color:#f5a623;}
    .mhu-content i{color:#00ff9d;font-style:normal;}
    .mhu-content code{background:rgba(245,166,35,.12);color:#f5a623;font-family:'Courier New',monospace;font-size:.82rem;padding:2px 6px;border-radius:3px;border:1px solid rgba(245,166,35,.25);}

    .mhu-lead{font-size:.95rem !important;color:#f0f0f5 !important;padding:12px 14px;background:linear-gradient(135deg,rgba(245,166,35,.06),rgba(204,85,255,.04));border-left:3px solid #f5a623;border-radius:0 6px 6px 0;margin-bottom:16px !important;}
    .mhu-tip{font-size:.82rem !important;background:rgba(0,255,157,.06);border:1px solid rgba(0,255,157,.25);border-radius:6px;padding:10px 12px;color:#c8ffe0 !important;margin:12px 0 !important;}

    .mhu-tabla{width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:.8rem;}
    .mhu-tabla th,.mhu-tabla td{padding:8px 10px;border:1px solid rgba(255,255,255,.1);text-align:left;}
    .mhu-tabla th{background:rgba(245,166,35,.12);color:#f5a623;font-family:'Orbitron',sans-serif;font-size:.65rem;letter-spacing:1px;text-transform:uppercase;}
    .mhu-tabla tr:nth-child(even) td{background:rgba(255,255,255,.02);}

    .mhu-rar{font-family:'Orbitron',sans-serif;font-size:.62rem;font-weight:900;letter-spacing:1.5px;padding:3px 9px;border-radius:3px;text-transform:uppercase;display:inline-block;}
    .mhu-rar.comun{background:rgba(106,127,154,.18);color:#a8b8cc;border:1px solid rgba(106,127,154,.4);}
    .mhu-rar.poco{background:rgba(79,195,247,.15);color:#4fc3f7;border:1px solid rgba(79,195,247,.4);}
    .mhu-rar.rara{background:rgba(171,71,188,.18);color:#d68eea;border:1px solid rgba(171,71,188,.5);}
    .mhu-rar.foil{background:linear-gradient(135deg,rgba(245,166,35,.25),rgba(255,215,0,.15));color:#ffd54a;border:1px solid #f5a623;text-shadow:0 0 6px rgba(245,166,35,.5);}
    .mhu-rar.foilpc{background:rgba(255,112,67,.18);color:#ff9670;border:1px solid rgba(255,112,67,.5);}
    .mhu-rar.secreta{background:linear-gradient(135deg,rgba(224,64,251,.25),rgba(0,255,200,.1));color:#f070ff;border:1px solid #e040fb;text-shadow:0 0 8px rgba(224,64,251,.6);}

    .mhu-faq details{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:0;margin-bottom:10px;overflow:hidden;transition:border-color .2s;}
    .mhu-faq details[open]{border-color:rgba(245,166,35,.4);}
    .mhu-faq summary{padding:14px 16px;cursor:pointer;font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:1px;color:#f5a623;list-style:none;position:relative;padding-right:36px;}
    .mhu-faq summary::-webkit-details-marker{display:none;}
    .mhu-faq summary::after{content:'▼';position:absolute;right:16px;top:14px;font-size:.6rem;transition:transform .2s;color:#f5a623;}
    .mhu-faq details[open] summary::after{transform:rotate(180deg);}
    .mhu-faq details p{padding:0 16px 14px;margin:0;font-size:.85rem;line-height:1.55;color:#d0d0dc;}

    /* Botón flotante de ayuda (opcional) */
    .mhu-fab{position:fixed;bottom:20px;right:20px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#f5a623,#cc55ff);color:#000;border:none;font-size:1.4rem;font-weight:900;cursor:pointer;box-shadow:0 4px 16px rgba(245,166,35,.4),0 0 0 2px rgba(0,0,0,.4);z-index:1500;transition:transform .2s;}
    .mhu-fab:hover{transform:scale(1.08);}
    .mhu-fab:active{transform:scale(.95);}
  `;

  // ───────────────────────────────────────────────
  //  Renderizado
  // ───────────────────────────────────────────────
  function inyectarCSS(){
    if (document.getElementById('mhu-styles')) return;
    const style = document.createElement('style');
    style.id = 'mhu-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function construirModal(){
    if (document.getElementById('mhu-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'mhu-overlay';
    overlay.className = 'mhu-overlay';
    overlay.innerHTML = `
      <div class="mhu-header">
        <div class="mhu-title">📖 MANUAL DEL HÉROE</div>
        <button class="mhu-close" onclick="cerrarManual()" aria-label="Cerrar">✕</button>
      </div>
      <div class="mhu-tabs" id="mhu-tabs">
        ${SECCIONES.map(s => `
          <button class="mhu-tab" data-sec="${s.id}" onclick="mostrarSeccionManual('${s.id}')">
            ${s.icono} ${s.titulo.toUpperCase()}
          </button>
        `).join('')}
      </div>
      <div class="mhu-content" id="mhu-content"></div>
    `;
    document.body.appendChild(overlay);
    // cerrar con Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) cerrarManual();
    });
  }

  function mostrarSeccion(id){
    const sec = SECCIONES.find(s => s.id === id) || SECCIONES[0];
    const cont = document.getElementById('mhu-content');
    cont.innerHTML = `<h3><span class="mhu-ico">${sec.icono}</span> ${sec.titulo}</h3>${sec.html}`;
    cont.scrollTop = 0;
    document.querySelectorAll('#mhu-tabs .mhu-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.sec === sec.id);
    });
    // Scroll el tab activo a la vista
    const activo = document.querySelector(`#mhu-tabs .mhu-tab[data-sec="${sec.id}"]`);
    if (activo) activo.scrollIntoView({inline:'center', block:'nearest', behavior:'smooth'});
  }

  // ───────────────────────────────────────────────
  //  API pública
  // ───────────────────────────────────────────────
  window.abrirManual = function(seccionId){
    inyectarCSS();
    construirModal();
    document.getElementById('mhu-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    mostrarSeccion(seccionId || 'hp');
  };
  window.cerrarManual = function(){
    const o = document.getElementById('mhu-overlay');
    if (o) o.classList.remove('active');
    document.body.style.overflow = '';
  };
  window.mostrarSeccionManual = mostrarSeccion;

  // Botón flotante opcional — descomentar si quieres que aparezca solo en todos los módulos
  // window.addEventListener('DOMContentLoaded', () => {
  //   const fab = document.createElement('button');
  //   fab.className = 'mhu-fab';
  //   fab.innerHTML = '❓';
  //   fab.title = 'Manual del Héroe';
  //   fab.onclick = () => abrirManual();
  //   inyectarCSS();
  //   document.body.appendChild(fab);
  // });
})();
