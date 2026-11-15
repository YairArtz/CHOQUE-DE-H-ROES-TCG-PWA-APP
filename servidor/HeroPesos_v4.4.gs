// ══════════════════════════════════════════════════════════════
//  HERO PESOS — Sistema de Moneda Virtual v4.4
//  Choque de Héroes TCG · Nexo de Héroes
//
//  Cambios v4.4 — PROTECCIÓN DE DATOS DE LOS JUGADORES:
//  - La llave de sesión (PIN) ahora también se pide para VER datos de la cuenta:
//    saldo, historial, historial_qr, mis_cosmeticos, creditos_arcade, mis_compras.
//    (Antes cualquiera con un ID podía ver el saldo, los sobres y los canjes de otro jugador.)
//  - productos_digitales: sin llave válida devuelve el catálogo, pero no lo que tiene el jugador.
//  - entregas_pendientes y marcar_entregado: SIEMPRE piden &admin=<ADMIN_KEY>. Si ADMIN_KEY
//    no existe en las Propiedades del script, quedan cerradas. (Antes entregas_pendientes
//    mostraba a cualquiera los nombres, IDs y sobres de todos los jugadores.)
//  - ?action=mi_perfil&playerid=…&token=…      → nombre, nick, correo, fecha y badges manuales del
//    propio jugador. Así la app ya no descarga la hoja de registro: puedes ponerla PRIVADA.
//  - ?action=firebase_token&playerid=…&token=… → llave de Firebase con uid = CHH-XXXXX, para que
//    las reglas de la base solo dejen tocar jugadores/<ID> a su dueño.
//    Configuración (Propiedades del script):
//      FB_SA_EMAIL = "client_email" de la cuenta de servicio de Firebase
//      FB_SA_KEY   = "private_key"  de esa cuenta (completa, con -----BEGIN … END-----)
//    Prueba desde el editor: ▶ probarFirebaseToken
//
//  Cambios v4.3 — PRIMER DLC: LAS CATACUMBAS DE NEXOTLAN
//  - instalarDLCCatacumbas() — ejecútala UNA VEZ desde el editor: agrega (o actualiza) el producto
//    dlc_catacumbas en "Productos_Digitales" con su imagen, precio y lo que incluye.
//  - La columna descripcion acepta  "Texto | Incluye 1 | Incluye 2"  (la Tienda muestra cada parte como una ficha).
//
//  Cambios v4.2 — PAGO DIRECTO CON MERCADO PAGO (Checkout Pro):
//  - Configuración (Proyecto ▸ Configuración del proyecto ▸ Propiedades del script):
//      MP_ACCESS_TOKEN = tu Access Token de producción (APP_USR-…) o de prueba (TEST-…). NUNCA va en la app.
//      MP_VOLVER       = (opcional) inicio permitido de la página de regreso, ej. https://tusitio.com/
//      MP_SANDBOX      = (opcional) si → usa la liga de pruebas (sandbox_init_point)
//      MP_WEBHOOK_URL  = (opcional) URL /exec de esta implementación; si falta se usa la del propio script
//  - Ejecuta UNA VEZ instalarRevisionMP() desde el editor: revisa cada 10 min los pagos pendientes
//    (OXXO/SPEI tardan) y entrega lo aprobado aunque el jugador no regrese a la app.
//  - Hoja nueva "Pagos_MP" (se crea sola): un renglón por intento de pago con su estado.
//      estado: pendiente · approved · rejected · in_process · cancelled · entregado · revisar
//      "revisar" = aprobado pero el monto o la moneda no coinciden: NO se entrega, revísalo a mano.
//  - Solo se entrega lo que confirma la API de Mercado Pago (no se confía en lo que manda el navegador).
//  - ?action=mp_crear&playerid=…&sku=…&volver=URL   (con llave de sesión) → { url } para pagar
//  - ?action=mp_verificar&playerid=…[&payment_id=…] (con llave de sesión) → revisa y entrega
//  - ?action=mp_webhook  (lo llama Mercado Pago) → revisa ese pago y entrega
//  - productos_digitales ahora incluye mp:true cuando los pagos en línea están configurados.
//
//  Cambios v4.1 — PRODUCTOS DIGITALES (DLC, cosméticos premium) Y CÓDIGOS QUE LOS ACTIVAN:
//  - Hoja nueva "Productos_Digitales" (se crea sola con 2 ejemplos inactivos):
//      sku | nombre | tipo | precio_mxn | imagen | descripcion | contenido | activo | orden | link_compra
//      · tipo: dlc · mica · playmat · heroe · arena · paquete
//      · contenido (solo paquete): SKUs separados por coma que incluye el paquete
//      · activo: si / no (los inactivos no se muestran en la tienda, pero los códigos ya entregados siguen sirviendo)
//      · link_compra: (opcional) dónde comprarlo con dinero real, ej. la página del producto en tu Tienda Online
//  - Hoja nueva "Compras" (se crea sola): fecha | playerid | jugador | sku | nombre | origen | referencia | monto_mxn
//      · Es la lista OFICIAL de lo que cada jugador tiene. origen: codigo · regalo · mercadopago
//      · Para regalar algo a mano: agrega una fila con origen = regalo.
//  - QR_Codigos: columna nueva F = producto (SKU). Si un código trae producto, al canjearlo se entrega ese
//    producto (y los HP de la columna B, si tiene). Para códigos de UN SOLO USO pon usos_max (E) = 1.
//  - generarCodigosProducto('sku', 20) — ejecútala desde el editor (▶ Ejecutar): crea 20 códigos únicos
//    CDH-XXXX-XXXX-XXXX de un solo uso para ese producto en QR_Codigos y los deja en la hoja "Codigos_Generados"
//    para que los copies o los vendas.
//  - Los cosméticos (mica, playmat, heroe) entregados también se escriben en "Cosmeticos", así el Simulador y el
//    menú principal los reconocen sin cambios.
//  - ?action=productos_digitales&playerid=…  → catálogo activo + cuáles ya tiene el jugador
//  - ?action=mis_compras&playerid=…          → SKUs que tiene el jugador (paquetes ya desglosados)
//
//  Cambios v4.0 — MISIONES DIARIAS Y SEMANALES:
//  - 3 misiones diarias y 3 semanales, iguales para todos (se eligen solas cada día / cada lunes,
//    hora de la Ciudad de México). Catálogo y recompensas: MISIONES_DIARIAS / MISIONES_SEMANALES (abajo).
//  - Recompensas bajas para evitar abusos: diarias 2-3 HP, semanales 4-6 HP. Se pagan como filas en
//    "HP_Bonus" ("Misión: …") cuando el jugador toca COBRAR. Cada misión se cobra una sola vez.
//  - Hoja nueva "Misiones" (se crea sola): playerid | periodo | mision | progreso | meta | completada | cobrada | actualizado
//  - ?action=misiones&playerid=…                         → misiones del día y de la semana con su progreso
//  - ?action=mision_evento&playerid=…&token=…&evento=choque&modo=arcade|sim|nexotlan|online&gano=1|0
//    ?action=mision_evento&…&evento=torneo_inscripcion | academia_publicar
//  - ?action=mision_cobrar&playerid=…&token=…&id=…        → paga la misión completada
//  - Protección: requieren la llave de sesión (PIN); 1 choque por minuto como máximo y 25 al día;
//    inscripción a torneo y baraja publicada cuentan 1 vez al día.
//
//  Cambios v3.9 — SEGURIDAD DE CUENTAS:
//  - Cada jugador entra con su ID + un PIN de 4 a 6 dígitos. El PIN se crea (o se recupera)
//    con un código de 6 dígitos que llega a su CORREO REGISTRADO (hoja de jugadores, columna E).
//  - Al entrar, la app recibe una "llave de sesión" (token firmado, 180 días) y la manda en cada
//    compra o canje. Sin una llave válida NO se puede gastar ni canjear: comprar_sobre, canjear_qr,
//    usar_credito_arcade y logro_arcade responden { status:'error', auth:true }.
//  - Hoja nueva "Auth" (se crea sola): playerid | pin_hash | sal | gen | creado | actualizado |
//    intentos | bloqueado_hasta | pin_temporal
//      · pin_temporal: escribe aquí un PIN provisional para un jugador SIN correo (o que lo perdió).
//        Lo usa una vez para entrar y la app le pide crear su PIN definitivo.
//      · Cambiar de PIN cierra la sesión en todos sus otros dispositivos.
//  - 5 PIN incorrectos seguidos bloquean el ingreso 15 minutos (más tiempo si se repite).
//  - Propiedades del script (se crean solas): AUTH_SECRET (no la compartas).
//    Opcional: AUTH_OBLIGATORIO = NO  → desactiva la protección (solo para emergencias).
//    Opcional: ADMIN_KEY = <clave>    → protege marcar_entregado (se manda como &admin=<clave>).
//  - Al implementar esta versión, Google pide permiso para ENVIAR CORREOS (para los códigos).
//
//  Cambios v3.8:
//  - Héroes del menú principal a la venta: filas de Packs_Config con tipo 'heroe'
//    (C=costo, D=imagen en assets/inicio/heroes/, E=subtítulo que aparece bajo el nombre).
//    Se compran con comprar_sobre, una sola vez, y se guardan en la hoja "Cosmeticos" como las micas.
//  - mis_cosmeticos devuelve también la descripción (subtítulo del héroe).
//
//  Cambios v3.7:
//  - Logros nuevos del Arcade (Ruta Heroica): arc_heroico, arc_creador.
//
//  Cambios v3.6:
//  - Logros nuevos del Arcade (Ruta Caótica): arc_caotico, arc_caos_puro.
//
//  Cambios v3.5:
//  - Créditos del Arcade a la venta: filas de Packs_Config con tipo 'creditos'
//    (C=costo, D=imagen opcional, E=descripción = CANTIDAD de créditos, ej. "3").
//    Se compran con comprar_sobre y van a la BOLSA del jugador (se pueden comprar varias veces).
//  - Hoja nueva "Arcade_Creditos" (se crea sola): fecha | playerid | jugador | movimiento | detalle | item_id
//    movimiento: +N por compra, -1 por cada crédito usado en el Arcade.
//  - ?action=creditos_arcade&playerid=…      → { status:'ok', bolsa:N }
//  - ?action=usar_credito_arcade&playerid=…  → usa 1 crédito de la bolsa { status:'ok', bolsa:N }
//  - Logros nuevos del Arcade: arc_legendario, arc_epico, arc_inmortal, arc_sin_piedad.
//
//  Cambios v3.4:
//  - Micas y playmats a la venta: filas de Packs_Config con tipo 'mica' o 'playmat'
//    (C=costo, D=imagen). Se compran con comprar_sobre; no se pueden comprar dos veces.
//  - Hoja nueva "Cosmeticos" (se crea sola): fecha | playerid | jugador | item_id | tipo | nombre | costo
//  - ?action=mis_cosmeticos&playerid=… → cosméticos comprados + logros arc_ del registro
//
//  Cambios v3.3:
//  - Modo Arcade: 28 logros (antes 10) y HP por logro reducido (2 a 15).
//
//  Cambios v3.2:
//  - Logros del Modo Arcade: ?action=logro_arcade&playerid=…&badge=arc_…
//    Escribe el logro en la columna F del Registro de Jugadores
//    (solo acepta los logros arc_ de ARCADE_BADGES) y suman HP por HP_BADGES.
//
//  Cambios v3.1:
//  - Sistema de visibilidad de sobres (publico/privado/zona)
//  - Vigencia temporal por sobre (vigencia_inicio / vigencia_fin)
//  - Filtrado server-side en packs_disponibles
//  - Anti-bypass en comprar_sobre
//
//  Columnas nuevas en Packs_Config:
//    H(8)=visibilidad  I(9)=allowlist  J(10)=zona
//    K(11)=vigencia_inicio  L(12)=vigencia_fin
//
//  Columna nueva en Jugadores (detectada por header):
//    zona
//
//  Cambios v3:
//  - Nueva escala de HP por badge (5/10/20/40/75/150/300)
//  - Detección server-side de badges de asistencia (fiel_devoto,
//    maratonista, cadena_mensual) por fechas del historial
//  - Detección de top5/top3/puntos_500/puntos_1000, top8_finalista,
//    nomada, col_50_sobres, col_100_sobres, secreto_maestro,
//    foil_maestro, hp_500, hp_1000, gastador, ahorrador,
//    qr_10, qr_25
//  - 49 nuevos badges agregados (mayoría manuales por columna F)
// ══════════════════════════════════════════════════════════════


// ── CONFIG ──────────────────────────────────────────────────
const HP_SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const RANKING_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1rOqnmqWhics45UF40n81V9s-W5VgmhQGtc-UNIERGjkZGN8n1mVHkk0B1VO8PYJWOQ/exec';
const JUGADORES_SHEET_ID = '1A3pMANjIop9IES2zseTrKImAkHPu2K56_iJJoiQzbxc';

const RAREZAS = ['comun', 'poco_comun', 'rara', 'foil', 'foil_poco_comun', 'secreta'];

const RAREZA_LABEL = {
  comun: 'Común',
  poco_comun: 'Poco Común',
  rara: 'Rara',
  foil: 'Foil',
  foil_poco_comun: 'Foil Poco Común',
  secreta: 'Secreta'
};

const PUNTOS_POS = { 1:8, 2:5, 3:4, 4:3, 5:2, 6:2, 7:1, 8:1 };
const HP_TORNEO  = { 1:10, 2:8, 3:5, 4:5, 5:3, 6:3, 7:3, 8:3 };

// ═══════════════════════════════════════════════════════════════
//  TABLA DE HP POR BADGE — v3
//  Escala: Bienvenida 5 · Inicial 5 · Media 8 · Alta 10 · Élite 15 · Legendario 30 · Mítico 80
// ═══════════════════════════════════════════════════════════════
const HP_BADGES = {
  // ── Bienvenida (5 HP) ──
  nuevo_jugador: 5,
  tor_debut: 5,
  col_primer_sobre: 5,
  hp_primer_tesoro: 5,
  qr_escaner: 5,
  madrugador: 5,
  aniversario: 5,
  minimalista: 5,
  hp_primera_compra: 5,

  // ── Progresión inicial (5 HP) ──
  novato: 5,
  intermedio: 5,
  col_5_sobres: 5,
  hp_reserva: 5,
  qr_cazador: 5,
  estilista: 5,
  tor_3er: 5,
  arquitecto: 5,
  embajador: 5,
  grito: 5,
  dia_muertos: 5,
  navidad: 5,
  ano_nuevo: 5,
  sabio_banlist: 5,
  historiador: 5,

  // ── Progresión media (8 HP) ──
  experto: 8,
  tor_2do: 8,
  col_20_sobres: 8,
  col_carta_foil_pc: 8,
  hp_millonario: 8,
  qr_10: 8,
  coleccionista: 8,
  coleccionista_temas: 8,
  asistencia: 8,
  top10: 8,
  top8_finalista: 8,
  nomada: 8,
  decimo_aniv: 8,       // ← ajustado por decisión del usuario
  fundador_vet: 8,      // ← ajustado por decisión del usuario
  hp_500: 8,
  fiel_devoto: 8,
  maratonista: 8,
  espectador_leal: 8,
  curioso_nexo: 8,
  estratega: 8,
  videoteca: 8,

  // ── Progresión alta (10 HP) ──
  heroe: 10,
  tor_1er: 10,
  superior: 10,
  hat_trick: 10,
  col_50_sobres: 10,
  col_carta_secreta: 10,
  foil_maestro: 10,
  gastador: 10,
  ahorrador: 10,
  top5: 10,
  duelista_exp: 10,
  ev_beta: 10,
  ev_colab: 10,
  avatar_premium: 10,
  qr_25: 10,
  hp_1000: 10,
  cadena_mensual: 10,
  reclutador: 10,
  ala_novatos: 10,
  sensei: 10,
  guardian_reglas: 10,
  cronista: 10,
  fanartista: 10,
  crisis_vigilante: 10,
  buen_deportista: 10,

  // ── Élite (15 HP) ──
  leyenda: 15,
  veterano_guerra: 15,
  en_forma: 15,
  rey_nexo: 15,
  top3: 15,
  secreto_maestro: 15,
  tor_veterano: 15,
  constructor_pro: 15,
  col_100_sobres: 15,
  ev_fundador: 15,
  campeon_temp: 15,
  verdugo: 15,
  puntos_500: 15,
  mentor_iniciados: 15,
  demostrador: 15,
  voz_codex: 15,
  peregrino: 15,
  fin_del_camino: 15,
  streamer_nexo: 15,
  arq_koatl: 15,
  arq_cristal: 15,
  arq_evolotl: 15,
  arq_metalurg: 15,
  arq_invitados: 15,
  arq_maxkara: 15,
  arq_ninjiachi: 15,
  arq_caballero: 15,
  arq_defensor: 15,
  arq_envokateotl: 15,
  arq_fuego: 15,
  arq_mar: 15,
  arq_encantadora: 15,
  arq_garduna: 15,
  arq_tuneles: 15,
  arbitro: 15,
  anfitrion: 15,

  // ── Legendarios (30 HP) ──
  heroe_regente: 30,
  maestro_nexo: 30,
  invicto: 30,
  remontada: 30,
  constructor_comu: 30,
  escuela_nexo: 30,
  ronda_completa: 30,
  testimonio_viral: 30,
  arq_purista: 30,
  crisis_coloso: 30,
  crisis_vigilia: 30,
  organizador: 30,

  // ── Míticos (80 HP) ──
  puntos_1000: 80,
  padrino_nexo: 80,

  // ── Modo Arcade (v3.3) — recompensa reducida ──
  // Ruta
  arc_primera_victoria: 2,
  arc_mitad: 3,
  arc_campeon: 5,
  arc_fenix: 4,
  arc_jefe_intacto: 8,
  arc_un_credito: 10,
  arc_veterano: 6,
  arc_maestro_barajas: 8,
  arc_gran_maestro: 15,
  // En combate
  arc_intacto: 3,
  arc_relampago: 4,
  arc_al_limite: 3,
  arc_remontada: 5,
  arc_muralla: 4,
  arc_arrasador: 3,
  arc_aniquilador: 6,
  arc_golpe: 3,
  arc_alquimista: 3,
  arc_invocador: 3,
  arc_divino: 2,
  arc_estratega: 3,
  arc_terraformador: 3,
  arc_ejercito: 2,
  // Trayectoria
  arc_revancha: 4,
  arc_cazador: 4,
  arc_centurion: 10,
  arc_destructor: 6,
  arc_forjador: 5,
  arc_legendario: 10,
  arc_epico: 15,
  arc_inmortal: 15,
  arc_sin_piedad: 10,
  arc_caotico: 20,
  arc_caos_puro: 20,
  arc_heroico: 25,
  arc_creador: 30
};


// ══════════════════════════════════════════════════════════════
//  ENDPOINTS
// ══════════════════════════════════════════════════════════════

function doGet(e) {
  const action   = (e.parameter.action   || '').toLowerCase();
  const playerid = (e.parameter.playerid || '').trim().toUpperCase();

  try {
    // v3.9 — cuentas: acciones de PIN y protección de las acciones que gastan o dan HP
    if (action.indexOf('auth_') === 0) return _json(authAccion(action, playerid, e.parameter));
    if (ACCIONES_PROTEGIDAS.indexOf(action) >= 0) {
      const v = _authVerificar(playerid, e.parameter.token);
      if (!v.ok) return _json({ status: 'error', auth: true, codigo: v.codigo, message: v.message });
    }
    // v4.4 — acciones de administración: cerradas si no hay ADMIN_KEY o no coincide
    if (action === 'marcar_entregado' || action === 'entregas_pendientes') {
      const ak = _prop('ADMIN_KEY');
      if (!ak || (e.parameter.admin || '') !== ak) return _json({ status: 'error', message: 'No autorizado.' });
    }

    switch (action) {
      case 'saldo':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(calcularSaldo(playerid));

      case 'comprar_sobre':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        const packid = (e.parameter.packid || '').toLowerCase().trim();
        if (!packid) return _json({ status:'error', message:'Falta packid' });
        return _json(comprarSobre(playerid, packid));

      case 'historial':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(obtenerHistorial(playerid));

      case 'entregas_pendientes':
        return _json(obtenerEntregasPendientes());

      case 'marcar_entregado':
        const fila = parseInt(e.parameter.fila);
        if (!fila) return _json({ status:'error', message:'Falta fila' });
        return _json(marcarEntregado(fila));

      case 'packs_disponibles':
        return _json(obtenerPacksDisponibles(playerid));

      case 'canjear_qr':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        const codigoQR = (e.parameter.codigo || '').trim().toUpperCase();
        if (!codigoQR) return _json({ status:'error', message:'Falta codigo' });
        return _json(canjearQR(playerid, codigoQR));

      case 'historial_qr':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(obtenerHistorialQR(playerid));

      case 'mis_cosmeticos':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(obtenerCosmeticos(playerid));

      case 'creditos_arcade':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json({ status:'ok', bolsa: _bolsaCreditos(playerid) });

      case 'usar_credito_arcade':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(usarCreditoArcade(playerid));

      case 'misiones':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(misionesJugador(playerid));

      case 'mision_evento':
        return _json(misionEvento(playerid, e.parameter));

      case 'mision_cobrar':
        return _json(misionCobrar(playerid, (e.parameter.id || '').trim()));

      case 'productos_digitales':   // v4.4 — "lo que tengo" solo con la llave del jugador
        return _json(obtenerProductosDigitales(playerid && _authVerificar(playerid, e.parameter.token).ok ? playerid : ''));

      case 'mi_perfil':             // v4.4
        return _json(miPerfil(playerid));

      case 'firebase_token':        // v4.4
        return _json(firebaseToken(playerid));

      case 'mp_crear':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(mpCrearPago(playerid, (e.parameter.sku || '').trim().toLowerCase(), (e.parameter.volver || '').trim()));

      case 'mp_verificar':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json(mpVerificar(playerid, (e.parameter.payment_id || '').trim()));

      case 'mp_webhook':
        return _json(mpWebhook(e));

      case 'mis_compras':
        if (!playerid) return _json({ status:'error', message:'Falta playerid' });
        return _json({ status:'ok', compras: _comprasDe(playerid) });

      case 'logro_arcade':
        if (!playerid) return _json({ status:'error', ok:false, message:'Falta playerid' });
        return _json(registrarLogroArcade(playerid, (e.parameter.badge || '').trim().toLowerCase()));

      default:
        return _json({ status:'error', message:'Acción no reconocida.' });
    }
  } catch (err) {
    return _json({ status:'error', message: err.message });
  }
}

function doPost(e) { return doGet(e); }


// ══════════════════════════════════════════════════════════════
//  CUENTAS — PIN + código por correo + llave de sesión (v3.9)
// ══════════════════════════════════════════════════════════════
const ACCIONES_PROTEGIDAS = ['comprar_sobre', 'canjear_qr', 'usar_credito_arcade', 'logro_arcade', 'mision_evento', 'mision_cobrar', 'mp_crear', 'mp_verificar',
  // v4.4 — también para VER los datos de la cuenta
  'saldo', 'historial', 'historial_qr', 'mis_cosmeticos', 'creditos_arcade', 'mis_compras', 'mi_perfil', 'firebase_token'];
const AUTH_DIAS = 180, AUTH_MAX_INTENTOS = 5, AUTH_COD_MIN = 10;
const AUTH_COLS = ['playerid', 'pin_hash', 'sal', 'gen', 'creado', 'actualizado', 'intentos', 'bloqueado_hasta', 'pin_temporal'];

function _prop(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function _secreto() {
  let s = _prop('AUTH_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); PropertiesService.getScriptProperties().setProperty('AUTH_SECRET', s); }
  return s;
}
function _b64(bytes) { return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, ''); }
function _sha(txt) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, txt, Utilities.Charset.UTF_8).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join(''); }
function _hashPin(pin, sal) { return _sha(sal + ':' + pin + ':' + _secreto()); }
function _firmar(txt) { return _b64(Utilities.computeHmacSha256Signature(txt, _secreto())); }
function _ahora() { return Date.now(); }

function _hojaAuth() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Auth');
  if (!h) { h = ss.insertSheet('Auth'); h.appendRow(AUTH_COLS); h.setFrozenRows(1); h.getRange('I:I').setNumberFormat('@'); }
  return h;
}
function _authFila(pid) {
  const h = _hojaAuth(), d = h.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) if ((d[i][0] || '').toString().trim().toUpperCase() === pid) {
    const o = { _fila: i + 1 }; AUTH_COLS.forEach((k, j) => o[k] = d[i][j]); return o;
  }
  return null;
}
function _authGuardar(pid, cambios) {
  const h = _hojaAuth(); let f = _authFila(pid);
  if (!f) { h.appendRow(AUTH_COLS.map(k => k === 'playerid' ? pid : k === 'gen' ? 0 : k === 'intentos' ? 0 : k === 'creado' ? new Date() : '')); f = _authFila(pid); }
  Object.keys(cambios).forEach(k => { const c = AUTH_COLS.indexOf(k); if (c >= 0) h.getRange(f._fila, c + 1).setValue(cambios[k]); });
  SpreadsheetApp.flush();
  return _authFila(pid);
}
function _jugadorRegistro(pid) {
  try {
    const d = SpreadsheetApp.openById(JUGADORES_SHEET_ID).getSheets()[0].getDataRange().getValues();
    for (let i = 1; i < d.length; i++) if ((d[i][0] || '').toString().trim().toUpperCase() === pid)
      return { id: pid, nombre: (d[i][2] || '').toString(), nick: (d[i][3] || '').toString(), correo: (d[i][4] || '').toString().trim() };
  } catch (e) { Logger.log('registro: ' + e.message); }
  return null;
}
function _mascara(c) {
  const m = String(c || '').match(/^([^@]+)@(.+)$/); if (!m) return '';
  return m[1].slice(0, Math.min(2, m[1].length)) + '•••@' + m[2];
}
function _correoValido(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(c || '')); }
function _token(pid, gen) {
  const exp = Math.floor(_ahora() / 1000) + AUTH_DIAS * 86400, base = 'v1.' + pid + '.' + gen + '.' + exp.toString(36);
  return { token: base + '.' + _firmar(base), exp: exp * 1000 };
}
function _authVerificar(pid, token) {
  if (/^no$/i.test(_prop('AUTH_OBLIGATORIO'))) return { ok: true };
  if (!pid) return { ok: false, codigo: 'auth_requerida', message: 'Inicia sesión para continuar.' };
  if (!token) return { ok: false, codigo: 'auth_requerida', message: 'Por seguridad, confirma tu PIN para continuar.' };
  const p = String(token).split('.');
  if (p.length !== 5 || p[0] !== 'v1' || p[1] !== pid) return { ok: false, codigo: 'auth_invalida', message: 'Tu sesión no es válida. Vuelve a entrar con tu PIN.' };
  const base = p.slice(0, 4).join('.');
  if (_firmar(base) !== p[4]) return { ok: false, codigo: 'auth_invalida', message: 'Tu sesión no es válida. Vuelve a entrar con tu PIN.' };
  if (parseInt(p[3], 36) * 1000 < _ahora()) return { ok: false, codigo: 'auth_vencida', message: 'Tu sesión venció. Vuelve a entrar con tu PIN.' };
  const f = _authFila(pid);
  if (!f || String(f.gen) !== p[2]) return { ok: false, codigo: 'auth_invalida', message: 'Cambiaste tu PIN en otro dispositivo. Vuelve a entrar.' };
  return { ok: true };
}
// v4.4 — datos del propio jugador (la app ya no lee la hoja de registro directamente)
function miPerfil(pid) {
  if (!pid) return { status: 'error', message: 'Falta playerid' };
  const d = SpreadsheetApp.openById(JUGADORES_SHEET_ID).getSheets()[0].getDataRange().getValues();
  for (let i = 1; i < d.length; i++) {
    if ((d[i][0] || '').toString().trim().toUpperCase() !== pid) continue;
    const fe = d[i][1];
    return { status: 'ok', perfil: {
      id: pid,
      fecha: fe instanceof Date ? 'Date(' + fe.getFullYear() + ',' + fe.getMonth() + ',' + fe.getDate() + ')' : String(fe || ''),
      nombre: String(d[i][2] || ''), nick: String(d[i][3] || ''), correo: String(d[i][4] || '').trim(),
      badges: String(d[i][5] || ''), adminAcademia: String(d[i][8] || '').trim()
    } };
  }
  return { status: 'error', message: 'ID no encontrado.' };
}

// Acepta la private_key como venga pegada (con \n escritos, con espacios, con comillas o coma) y la deja en formato PEM
function _clavePEM(raw) {
  const s = String(raw || '').replace(/\\n/g, '\n');
  const m = s.match(/-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/);
  if (!m) return '';
  const cuerpo = m[1].replace(/[^A-Za-z0-9+/=]/g, '');
  return '-----BEGIN PRIVATE KEY-----\n' + cuerpo.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
}

// v4.4 — custom token de Firebase (uid = CHH-XXXXX), firmado con la cuenta de servicio del proyecto
function firebaseToken(pid) {
  if (!pid) return { status: 'error', message: 'Falta playerid' };
  const email = _prop('FB_SA_EMAIL').replace(/["',\s]/g, ''), clave = _clavePEM(_prop('FB_SA_KEY'));
  if (!email || !clave) return { status: 'error', message: 'Falta FB_SA_EMAIL / FB_SA_KEY en las propiedades del script.' };
  const t = Math.floor(_ahora() / 1000), j = o => _b64(Utilities.newBlob(JSON.stringify(o)).getBytes());
  const base = j({ alg: 'RS256', typ: 'JWT' }) + '.' + j({
    iss: email, sub: email, iat: t, exp: t + 3600, uid: pid,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit'
  });
  return { status: 'ok', ct: base + '.' + _b64(Utilities.computeRsaSha256Signature(base, clave)) };
}
// ▶ Ejecuta desde el editor para revisar que la cuenta de servicio quedó bien configurada
function probarFirebaseToken() { const r = firebaseToken('CHH-PRUEBA'); Logger.log(r.status === 'ok' ? 'OK · ' + r.ct.slice(0, 40) + '…' : r.message); return r.status; }

function _pinValido(pin) { return /^\d{4,6}$/.test(String(pin || '')); }

function authAccion(action, pid, prm) {
  if (!pid) return { status: 'error', message: 'Falta tu ID de jugador.' };
  const cache = CacheService.getScriptCache();

  if (action === 'auth_estado') {
    const j = _jugadorRegistro(pid); if (!j) return { status: 'error', message: 'ID no encontrado.' };
    const f = _authFila(pid);
    return { status: 'ok', existe: true, tienePin: !!(f && f.pin_hash), temporal: !!(f && String(f.pin_temporal || '').trim()),
      correo: _mascara(j.correo), puedeCorreo: _correoValido(j.correo), obligatorio: !/^no$/i.test(_prop('AUTH_OBLIGATORIO')) };
  }

  if (action === 'auth_codigo') {
    const j = _jugadorRegistro(pid); if (!j) return { status: 'error', message: 'ID no encontrado.' };
    if (!_correoValido(j.correo)) return { status: 'error', sinCorreo: true, message: 'Tu registro no tiene un correo válido. Pide ayuda a Choque de Héroes por Instagram o Facebook.' };
    if (cache.get('env_' + pid)) return { status: 'error', message: 'Espera un minuto antes de pedir otro código.' };
    const n = parseInt(cache.get('envd_' + pid) || '0', 10);
    if (n >= 5) return { status: 'error', message: 'Pediste demasiados códigos. Intenta más tarde.' };
    const cod = String(Math.floor(100000 + Math.random() * 900000));
    cache.put('cod_' + pid, JSON.stringify({ c: cod, i: 0 }), AUTH_COD_MIN * 60);
    cache.put('env_' + pid, '1', 60); cache.put('envd_' + pid, String(n + 1), 21600);
    MailApp.sendEmail({ to: j.correo, name: 'Choque de Héroes TCG', subject: 'Tu código: ' + cod + ' · Choque de Héroes',
      body: 'Hola ' + (j.nick || j.nombre || '') + ',\n\nTu código para crear o recuperar el PIN de tu cuenta ' + pid + ' es:\n\n    ' + cod +
        '\n\nVence en ' + AUTH_COD_MIN + ' minutos. Si tú no lo pediste, ignora este correo: nadie puede entrar a tu cuenta sin este código.\n\nChoque de Héroes TCG' });
    return { status: 'ok', correo: _mascara(j.correo) };
  }

  if (action === 'auth_crear') {   // código del correo + PIN nuevo
    const pin = String(prm.pin || ''), cod = String(prm.codigo || '').trim();
    if (!_pinValido(pin)) return { status: 'error', message: 'El PIN debe tener de 4 a 6 números.' };
    const raw = cache.get('cod_' + pid); if (!raw) return { status: 'error', message: 'El código venció o no existe. Pide uno nuevo.' };
    const o = JSON.parse(raw);
    if (o.c !== cod) {
      o.i++; if (o.i >= 5) cache.remove('cod_' + pid); else cache.put('cod_' + pid, JSON.stringify(o), AUTH_COD_MIN * 60);
      return { status: 'error', message: o.i >= 5 ? 'Demasiados intentos. Pide un código nuevo.' : 'Código incorrecto.' };
    }
    cache.remove('cod_' + pid);
    return _ponerPin(pid, pin);
  }

  if (action === 'auth_login') {
    const pin = String(prm.pin || ''), f = _authFila(pid);
    if (!f || (!f.pin_hash && !String(f.pin_temporal || '').trim())) return { status: 'error', sinPin: true, message: 'Aún no tienes PIN. Créalo con el código de tu correo.' };
    const bloq = f.bloqueado_hasta ? new Date(f.bloqueado_hasta).getTime() : 0;
    if (bloq > _ahora()) return { status: 'error', bloqueado: true, message: 'Demasiados intentos. Intenta de nuevo en ' + Math.ceil((bloq - _ahora()) / 60000) + ' min o recupera tu PIN con el correo.' };
    const temp = String(f.pin_temporal || '').trim();
    if (temp && pin === temp) {
      const g = (parseInt(f.gen, 10) || 0) + 1;
      _authGuardar(pid, { pin_temporal: '', gen: g, intentos: 0, bloqueado_hasta: '', actualizado: new Date() });
      return Object.assign({ status: 'ok', cambiar: true }, _token(pid, g));
    }
    if (f.pin_hash && _hashPin(pin, f.sal) === f.pin_hash) {
      _authGuardar(pid, { intentos: 0, bloqueado_hasta: '' });
      return Object.assign({ status: 'ok' }, _token(pid, parseInt(f.gen, 10) || 0));
    }
    const n = (parseInt(f.intentos, 10) || 0) + 1;
    const extra = n >= AUTH_MAX_INTENTOS ? { bloqueado_hasta: new Date(_ahora() + 15 * 60000 * Math.pow(2, Math.floor(n / AUTH_MAX_INTENTOS) - 1)) } : {};
    _authGuardar(pid, Object.assign({ intentos: n }, extra));
    return { status: 'error', message: n >= AUTH_MAX_INTENTOS ? 'PIN incorrecto. Por seguridad, el ingreso se bloqueó 15 minutos.' : 'PIN incorrecto. Te quedan ' + (AUTH_MAX_INTENTOS - n) + ' intentos.' };
  }

  if (action === 'auth_cambiar') {   // con la sesión abierta
    const v = _authVerificar(pid, prm.token); if (!v.ok && !/^no$/i.test(_prop('AUTH_OBLIGATORIO'))) return { status: 'error', auth: true, message: v.message };
    if (!_pinValido(prm.pin)) return { status: 'error', message: 'El PIN debe tener de 4 a 6 números.' };
    return _ponerPin(pid, String(prm.pin));
  }

  if (action === 'auth_validar') { const v = _authVerificar(pid, prm.token); return v.ok ? { status: 'ok' } : { status: 'error', auth: true, codigo: v.codigo, message: v.message }; }

  return { status: 'error', message: 'Acción no reconocida.' };
}
function _ponerPin(pid, pin) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const f = _authFila(pid), g = ((f && parseInt(f.gen, 10)) || 0) + 1, sal = Utilities.getUuid();
    _authGuardar(pid, { pin_hash: _hashPin(pin, sal), sal: sal, gen: g, intentos: 0, bloqueado_hasta: '', pin_temporal: '', actualizado: new Date() });
    return Object.assign({ status: 'ok', mensaje: 'PIN guardado' }, _token(pid, g));
  } finally { lock.releaseLock(); }
}


// ══════════════════════════════════════════════════════════════
//  CALCULAR SALDO
// ══════════════════════════════════════════════════════════════

function calcularSaldo(playerid) {
  const datosRanking = _obtenerDatosRanking(playerid);
  const hpRanking = datosRanking.totalPts * 2;

  let hpTorneos = 0;
  datosRanking.historial.forEach(t => {
    hpTorneos += HP_TORNEO[t.lugar] || 3;
  });

  const badges = _calcularBadges(datosRanking.historial, datosRanking.totalPts, datosRanking.posGlobal, playerid);
  let hpBadges = 0;
  badges.forEach(bid => { hpBadges += HP_BADGES[bid] || 0; });

  const hpBonus      = _obtenerTotalBonus(playerid);
  const totalGanado  = hpRanking + hpTorneos + hpBadges + hpBonus;
  const totalGastado = _obtenerTotalGastado(playerid);
  const saldoParcial = totalGanado - totalGastado;

  // — Badges por HP acumulado/gastado/saldo (calculados después para evitar circularidad) —
  const badgesHP = [];
  if (totalGanado >= 10)   badgesHP.push('hp_primer_tesoro');
  if (totalGanado >= 50)   badgesHP.push('hp_reserva');
  if (totalGanado >= 200)  badgesHP.push('hp_millonario');
  if (totalGanado >= 500)  badgesHP.push('hp_500');
  if (totalGanado >= 1000) badgesHP.push('hp_1000');
  if (totalGastado >= 100) badgesHP.push('gastador');
  if (saldoParcial >= 200) badgesHP.push('ahorrador');

  // Evita duplicados si ya vinieron por columna F del Sheet
  const badgesHPUnicos = badgesHP.filter(b => !badges.includes(b));

  let hpBadgesExtra = 0;
  badgesHPUnicos.forEach(bid => { hpBadgesExtra += HP_BADGES[bid] || 0; });

  const totalGanadoFinal = totalGanado + hpBadgesExtra;
  const saldoFinal       = totalGanadoFinal - totalGastado;
  const todosLosBadges   = [...badges, ...badgesHPUnicos];

  return {
    status: 'ok',
    playerid: playerid,
    saldo: saldoFinal,
    desglose: {
      ranking_pts:          datosRanking.totalPts,
      hp_ranking:           hpRanking,
      torneos_jugados:      datosRanking.historial.length,
      hp_torneos:           hpTorneos,
      badges_desbloqueados: todosLosBadges.length,
      hp_badges:            hpBadges + hpBadgesExtra,
      hp_bonus:             hpBonus,
      total_ganado:         totalGanadoFinal,
      total_gastado:        totalGastado
    }
  };
}


// ══════════════════════════════════════════════════════════════
//  TABLAS DE PROBABILIDAD
// ══════════════════════════════════════════════════════════════

const PROB_TABLES = {
  basico: {
    normal: [
      { rareza: 'comun',           prob: 45   },
      { rareza: 'poco_comun',      prob: 30   },
      { rareza: 'rara',            prob: 17   },
      { rareza: 'foil',            prob: 6    },
      { rareza: 'foil_poco_comun', prob: 1.5  },
      { rareza: 'secreta',         prob: 0.5  }
    ],
    garantizada: [
      { rareza: 'foil',            prob: 80 },
      { rareza: 'foil_poco_comun', prob: 16 },
      { rareza: 'secreta',         prob: 4  }
    ]
  },
  premium: {
    normal: [
      { rareza: 'comun',           prob: 15 },
      { rareza: 'poco_comun',      prob: 20 },
      { rareza: 'rara',            prob: 30 },
      { rareza: 'foil',            prob: 20 },
      { rareza: 'foil_poco_comun', prob: 12 },
      { rareza: 'secreta',         prob: 3  }
    ],
    garantizada: [
      { rareza: 'foil',            prob: 50 },
      { rareza: 'foil_poco_comun', prob: 35 },
      { rareza: 'secreta',         prob: 15 }
    ]
  },
  legendario: {
    normal: [
      { rareza: 'comun',           prob: 5  },
      { rareza: 'poco_comun',      prob: 10 },
      { rareza: 'rara',            prob: 25 },
      { rareza: 'foil',            prob: 25 },
      { rareza: 'foil_poco_comun', prob: 20 },
      { rareza: 'secreta',         prob: 15 }
    ],
    garantizada: [
      { rareza: 'foil',            prob: 35 },
      { rareza: 'foil_poco_comun', prob: 35 },
      { rareza: 'secreta',         prob: 30 }
    ]
  }
};


// ══════════════════════════════════════════════════════════════
//  COMPRAR SOBRE
// ══════════════════════════════════════════════════════════════

function comprarSobre(playerid, packid) {
  // ── LockService: serializa TODA la operación de compra ──
  // Comparte el mismo ScriptLock con canjearQR, así que un canje y una
  // compra tampoco pueden pisarse.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { status: 'error', message: 'El sistema está ocupado, intenta en unos segundos.' };
  }

  try {
    const packConfig = _obtenerPackConfig(packid);
    if (!packConfig) {
      return { status: 'error', message: `Pack "${packid}" no encontrado o inactivo.` };
    }

    // v3.1 — Re-validación de visibilidad (anti-bypass por URL directa)
    const _ssV = SpreadsheetApp.getActiveSpreadsheet();
    const _hV  = _ssV.getSheetByName('Packs_Config');
    if (_hV) {
      const _dV = _hV.getDataRange().getValues();
      const _rowPack = _dV.slice(1).find(r =>
        (r[0] || '').toString().trim().toLowerCase() === packid
      );
      if (_rowPack) {
        const _zonaJ = _obtenerZonaJugador(playerid);
        if (!_packEsVisible(_rowPack, playerid, _zonaJ)) {
          return { status: 'error', message: 'Este sobre no está disponible para ti.' };
        }
      }
    }

    const costo = packConfig.costo;
    const tipo  = packConfig.tipo;

    // v3.4 — Micas / playmats: solo se compran una vez
    const esCosmetico = (tipo === 'mica' || tipo === 'playmat' || tipo === 'heroe');   // v3.8: héroes del menú
    if (esCosmetico && _tieneCosmetico(playerid, packid)) {
      return { status: 'error', message: 'Ya tienes este cosmético.', ya: true };
    }

    // ── LECTURA DE SALDO DENTRO DEL LOCK ──
    const saldoData = calcularSaldo(playerid);
    if (saldoData.saldo < costo) {
      return {
        status: 'error',
        message: `Saldo insuficiente. Tienes ${saldoData.saldo} HP, necesitas ${costo} HP.`,
        saldo: saldoData.saldo
      };
    }

    // ── GUARDARRAÍL: nunca dejar saldo negativo, aunque el cálculo falle ──
    const nuevoSaldo = saldoData.saldo - costo;
    if (nuevoSaldo < 0) {
      return {
        status: 'error',
        message: 'Operación bloqueada por seguridad. Recarga la tienda.',
        saldo: saldoData.saldo
      };
    }

    const ss            = SpreadsheetApp.getActiveSpreadsheet();
    const fecha         = Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
    const nombreJugador = _obtenerNombreJugador(playerid);

    // ── CRÉDITOS DEL ARCADE (v3.5) ──
    if (tipo === 'creditos') {
      const cant = Math.max(1, parseInt(packConfig.descripcion) || 1);
      _hojaCreditos().appendRow([fecha, playerid, nombreJugador, cant, 'Compra: ' + packConfig.nombre, packid]);
      ss.getSheetByName('HP_Gastos').appendRow([fecha, playerid, `Créditos Arcade: ${packConfig.nombre}`, costo, nuevoSaldo]);
      SpreadsheetApp.flush();
      return {
        status: 'ok', mensaje: `¡+${cant} crédito${cant === 1 ? '' : 's'} para el Arcade!`,
        creditos: cant, bolsa: _bolsaCreditos(playerid),
        pack: packid, pack_nombre: packConfig.nombre, costo: costo,
        saldo_anterior: saldoData.saldo, saldo_nuevo: nuevoSaldo
      };
    }

    // ── MICA / PLAYMAT (v3.4) ──
    if (esCosmetico) {
      const etiqueta = tipo === 'mica' ? 'Mica' : tipo === 'heroe' ? 'Héroe del menú' : 'Playmat';
      const fin      = tipo === 'mica' ? 'a' : 'o';
      _hojaCosmeticos().appendRow([fecha, playerid, nombreJugador, packid, tipo, packConfig.nombre, costo]);
      ss.getSheetByName('HP_Gastos').appendRow([fecha, playerid, `${etiqueta}: ${packConfig.nombre}`, costo, nuevoSaldo]);
      SpreadsheetApp.flush(); // ← fuerza escritura antes de soltar el lock

      return {
        status: 'ok', mensaje: `¡${etiqueta} obtenid${fin}!`,
        cosmetico: { id: packid, tipo: tipo, nombre: packConfig.nombre, imagen: packConfig.imagen, descripcion: packConfig.descripcion || '' },
        pack: packid, pack_nombre: packConfig.nombre, costo: costo,
        saldo_anterior: saldoData.saldo, saldo_nuevo: nuevoSaldo
      };
    }

    // ── CARTA SUELTA ──
    if (tipo === 'carta') {
      const rareza = (packConfig.descripcion || 'comun').toLowerCase().trim();
      const imagen = packConfig.imagen || '';
      const nombre = packConfig.nombre;

      const cartaObj = {
        nombre:       nombre,
        rareza:       rareza,
        rareza_label: RAREZA_LABEL[rareza] || rareza,
        imagen:       imagen
      };

      ss.getSheetByName('Sobres_Abiertos').appendRow([fecha, playerid, nombreJugador, packid, JSON.stringify([cartaObj]), 'no']);
      ss.getSheetByName('HP_Gastos').appendRow([fecha, playerid, `Carta suelta: ${nombre}`, costo, nuevoSaldo]);
      SpreadsheetApp.flush(); // ← fuerza escritura antes de soltar el lock

      return {
        status: 'ok', mensaje: '¡Carta obtenida!', cartas: [cartaObj],
        pack: packid, pack_nombre: nombre, costo: costo,
        saldo_anterior: saldoData.saldo, saldo_nuevo: nuevoSaldo
      };
    }

    // ── SOBRE NORMAL ──
    const tier  = packConfig.tier || 'basico';
    const pool  = _obtenerPoolCartas(packid);
    const probs = PROB_TABLES[tier] || PROB_TABLES.basico;

    const cartas = [];
    const usadas = [];

    for (let i = 0; i < 2; i++) {
      const carta = _rollCarta(probs.normal, pool, usadas);
      if (carta) { cartas.push(carta); usadas.push(carta.nombre); }
    }
    const cartaGarantizada = _rollCarta(probs.garantizada, pool, usadas);
    if (cartaGarantizada) { cartas.push(cartaGarantizada); usadas.push(cartaGarantizada.nombre); }

    if (cartas.length === 0) {
      return { status: 'error', message: `Pack "${packid}" no tiene cartas configuradas.` };
    }

    ss.getSheetByName('Sobres_Abiertos').appendRow([fecha, playerid, nombreJugador, packid, JSON.stringify(cartas), 'no']);
    ss.getSheetByName('HP_Gastos').appendRow([fecha, playerid, `Sobre: ${packConfig.nombre}`, costo, nuevoSaldo]);
    SpreadsheetApp.flush(); // ← fuerza escritura antes de soltar el lock

    return {
      status: 'ok', mensaje: '¡Sobre abierto!', cartas: cartas,
      pack: packid, pack_nombre: packConfig.nombre, costo: costo,
      saldo_anterior: saldoData.saldo, saldo_nuevo: nuevoSaldo
    };

  } finally {
    lock.releaseLock();
  }
}


// ══════════════════════════════════════════════════════════════
//  HISTORIAL DE SOBRES
// ══════════════════════════════════════════════════════════════

function obtenerHistorial(playerid) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('Sobres_Abiertos');
  const data = hoja.getDataRange().getValues();
  const historial = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((row[1] || '').toString().trim().toUpperCase() !== playerid) continue;
    let cartas = [];
    try { cartas = JSON.parse(row[4]); } catch(e) {
      if (row[4]) cartas.push({ nombre: row[4], rareza: row[5] || '', imagen: row[6] || '' });
      if (row[7]) cartas.push({ nombre: row[7], rareza: row[8] || '', imagen: row[9] || '' });
    }
    historial.push({ fecha: row[0], pack: row[3], cartas: cartas, entregado: (row[5] || '').toString().toLowerCase() });
  }

  return { status: 'ok', playerid: playerid, total: historial.length, historial: historial };
}


// ══════════════════════════════════════════════════════════════
//  ENTREGAS PENDIENTES
// ══════════════════════════════════════════════════════════════

function obtenerEntregasPendientes() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('Sobres_Abiertos');
  const data = hoja.getDataRange().getValues();
  const pendientes = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((row[5] || '').toString().toLowerCase() === 'si') continue;
    let cartas = [];
    try { cartas = JSON.parse(row[4]); } catch(e) {
      if (row[4]) cartas.push({ nombre: row[4], rareza: row[5] || '' });
      if (row[7]) cartas.push({ nombre: row[7], rareza: row[8] || '' });
    }
    pendientes.push({ fila: i + 1, fecha: row[0], playerid: row[1], nombre: row[2], pack: row[3], cartas: cartas });
  }

  return { status: 'ok', total: pendientes.length, pendientes: pendientes };
}


// ══════════════════════════════════════════════════════════════
//  MARCAR ENTREGADO
// ══════════════════════════════════════════════════════════════

function marcarEntregado(fila) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sobres_Abiertos').getRange(fila, 6).setValue('si');
  return { status: 'ok', message: `Fila ${fila} marcada como entregada.` };
}


// ══════════════════════════════════════════════════════════════
//  PACKS DISPONIBLES
// ══════════════════════════════════════════════════════════════

function obtenerPacksDisponibles(playerid) {
  const ss         = SpreadsheetApp.getActiveSpreadsheet();
  const hojaConfig = ss.getSheetByName('Packs_Config');
  if (!hojaConfig) return { status: 'ok', packs: [] };
  const configData = hojaConfig.getDataRange().getValues();

  // v3.1 — Zona del jugador para filtrado
  const zonaJugador = playerid ? _obtenerZonaJugador(playerid) : '';

  const hojaPool = ss.getSheetByName('Pool_Cartas');
  const poolData = hojaPool ? hojaPool.getDataRange().getValues() : [[]];

  const conteos = {};
  for (let i = 1; i < poolData.length; i++) {
    const row    = poolData[i];
    const pid    = (row[0] || '').toString().trim().toLowerCase();
    const activa = (row[5] || '').toString().toLowerCase();
    if (!pid || activa === 'no') continue;
    if (!conteos[pid]) conteos[pid] = {};
    const r = (row[2] || '').toString().toLowerCase();
    conteos[pid][r] = (conteos[pid][r] || 0) + 1;
  }

  const packs = [];
  for (let i = 1; i < configData.length; i++) {
    const row    = configData[i];
    const pid    = (row[0] || '').toString().trim().toLowerCase();
    const activo = (row[5] || '').toString().toLowerCase();
    if (!pid || activo === 'no') continue;
    if (!_packEsVisible(row, playerid, zonaJugador)) continue;   // v3.1 visibilidad

    const tipo = (row[7] || 'sobre').toString().trim().toLowerCase();
    let totalCartas = 0;
    let rarezasDisponibles = [];

    if (tipo === 'sobre') {
      const rarezasEnPack = conteos[pid] || {};
      RAREZAS.forEach(r => {
        if (rarezasEnPack[r]) {
          totalCartas += rarezasEnPack[r];
          rarezasDisponibles.push({ rareza: r, label: RAREZA_LABEL[r], cantidad: rarezasEnPack[r] });
        }
      });
    }

    packs.push({
      pack_id: pid, nombre: (row[1] || pid).toString(),
      costo: parseInt(row[2]) || 15, imagen: (row[3] || '').toString(),
      descripcion: (row[4] || '').toString(),
      tier: (row[6] || 'basico').toString().trim().toLowerCase(),
      tipo: tipo, total_cartas_pool: totalCartas,
      cartas_por_sobre: tipo === 'sobre' ? 3 : 1,
      rarezas: rarezasDisponibles
    });
  }

  return { status: 'ok', packs: packs };
}


// ══════════════════════════════════════════════════════════════
//  FUNCIONES INTERNAS
// ══════════════════════════════════════════════════════════════

function _obtenerPackConfig(packid) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('Packs_Config');
  if (!hoja) return null;
  const data = hoja.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const pid    = (row[0] || '').toString().trim().toLowerCase();
    const activo = (row[5] || '').toString().toLowerCase();
    if (pid === packid && activo !== 'no') {
      return {
        pack_id: pid, nombre: (row[1] || pid).toString(),
        costo: parseInt(row[2]) || 15, imagen: (row[3] || '').toString(),
        descripcion: (row[4] || '').toString(),
        tier: (row[6] || 'basico').toString().trim().toLowerCase(),
        tipo: (row[7] || 'sobre').toString().trim().toLowerCase()
      };
    }
  }
  return null;
}

function _rollCarta(probTable, pool, usadas) {
  for (let intento = 0; intento < 10; intento++) {
    const rareza = _rollRareza(probTable, pool);
    if (!rareza || !pool[rareza] || pool[rareza].length === 0) continue;
    const disponibles = pool[rareza].filter(c => !usadas.includes(c.nombre));
    const lista   = disponibles.length > 0 ? disponibles : pool[rareza];
    const elegida = lista[Math.floor(Math.random() * lista.length)];
    return { nombre: elegida.nombre, rareza: elegida.rareza, rareza_label: RAREZA_LABEL[elegida.rareza] || elegida.rareza, imagen: elegida.imagen };
  }
  for (const r of RAREZAS) {
    if (pool[r] && pool[r].length > 0) {
      const elegida = pool[r][Math.floor(Math.random() * pool[r].length)];
      return { nombre: elegida.nombre, rareza: elegida.rareza, rareza_label: RAREZA_LABEL[elegida.rareza] || elegida.rareza, imagen: elegida.imagen };
    }
  }
  return null;
}

function _rollRareza(probTable, pool) {
  const disponibles = probTable.filter(p => pool[p.rareza] && pool[p.rareza].length > 0);
  if (disponibles.length === 0) return null;
  const totalProb = disponibles.reduce((sum, p) => sum + p.prob, 0);
  const rand = Math.random() * totalProb;
  let acumulado = 0;
  for (const p of disponibles) {
    acumulado += p.prob;
    if (rand < acumulado) return p.rareza;
  }
  return disponibles[disponibles.length - 1].rareza;
}

function _obtenerPoolCartas(packid) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('Pool_Cartas');
  const data = hoja.getDataRange().getValues();
  const pool = {};
  RAREZAS.forEach(r => pool[r] = []);

  for (let i = 1; i < data.length; i++) {
    const row    = data[i];
    const pid    = (row[0] || '').toString().trim().toLowerCase();
    const activa = (row[5] || '').toString().toLowerCase();
    if (pid !== packid || activa === 'no') continue;
    const rareza = (row[2] || '').toString().toLowerCase().trim();
    if (pool[rareza]) {
      pool[rareza].push({ nombre: (row[1] || '').toString(), rareza: rareza, imagen: (row[3] || '').toString(), expansion: (row[4] || '').toString() });
    }
  }
  return pool;
}

function _obtenerDatosRanking(playerid) {
  try {
    const res  = UrlFetchApp.fetch(RANKING_SCRIPT_URL, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    if (data.status !== 'ok' || !Array.isArray(data.resultados)) {
      return { totalPts: 0, historial: [], posGlobal: 0 };
    }

    let totalPts = 0;
    const historial = [];

    data.resultados.forEach(torneo => {
      for (let i = 1; i <= 8; i++) {
        const id = (torneo['p' + i + '_id'] || '').trim().toUpperCase();
        if (id === playerid) {
          const pts = PUNTOS_POS[i] || 0;
          totalPts += pts;
          historial.push({
            nombre: torneo.tourname || 'Torneo',
            fecha:  torneo.tourdate || '',
            lugar:  i,
            pts:    pts,
            storeid: (torneo.storeid || '').toString().trim().toUpperCase()   // ← v3: agregado para nomada
          });
          break;
        }
      }
    });

    const puntajes = {};
    data.resultados.forEach(torneo => {
      for (let i = 1; i <= 8; i++) {
        const id = (torneo['p' + i + '_id'] || '').trim().toUpperCase();
        if (id) puntajes[id] = (puntajes[id] || 0) + (PUNTOS_POS[i] || 0);
      }
    });
    const ranking   = Object.entries(puntajes).sort((a, b) => b[1] - a[1]);
    const posGlobal = ranking.findIndex(([id]) => id === playerid) + 1;

    return { totalPts, historial, posGlobal };
  } catch (err) {
    Logger.log('Error obteniendo ranking: ' + err.message);
    return { totalPts: 0, historial: [], posGlobal: 0 };
  }
}

function _calcularBadges(historial, totalPts, posGlobal, playerid) {
  const ganados = [];
  ganados.push('nuevo_jugador');

  // — Fundador Veterano (ID < 100) —
  const numId = parseInt(playerid.replace(/\D/g, ''));
  if (!isNaN(numId) && numId > 0 && numId < 100) ganados.push('fundador_vet');

  // — Fechas especiales —
  const hoy = new Date();
  const mes = hoy.getMonth();
  const dia = hoy.getDate();
  if (mes === 2 && dia === 16) ganados.push('aniversario');
  if (mes === 8 && (dia === 15 || dia === 16)) ganados.push('grito');
  if (mes === 10 && (dia === 1 || dia === 2)) ganados.push('dia_muertos');
  if (mes === 11 && (dia === 24 || dia === 25)) ganados.push('navidad');
  if ((mes === 11 && dia === 31) || (mes === 0 && dia === 1)) ganados.push('ano_nuevo');

  if (historial && historial.length) {
    const n         = historial.length;
    const posiciones = historial.map(t => t.lugar);
    const victorias  = posiciones.filter(p => p === 1).length;

    // — Progresión por torneos jugados —
    if (n >= 1)  ganados.push('novato');
    if (n >= 5)  ganados.push('intermedio');
    if (n >= 10) ganados.push('experto');
    if (n >= 15) ganados.push('heroe');
    if (n >= 20) ganados.push('superior');
    if (n >= 25) ganados.push('veterano_guerra');
    if (n >= 30) ganados.push('leyenda');
    if (n >= 50) ganados.push('heroe_regente');

    if (n >= 1) ganados.push('tor_debut');
    if (n >= 5) ganados.push('asistencia');

    // — Resultados por posición —
    if (posiciones.includes(3)) ganados.push('tor_3er');
    if (posiciones.includes(2)) ganados.push('tor_2do');
    if (posiciones.includes(1)) ganados.push('tor_1er');
    if (posiciones.some(p => p >= 4 && p <= 8)) ganados.push('top8_finalista');

    // — Victorias acumuladas —
    if (victorias >= 3) ganados.push('hat_trick');
    if (victorias >= 5) ganados.push('en_forma');

    // — Ranking global —
    if (posGlobal && posGlobal <= 10) ganados.push('top10');
    if (posGlobal && posGlobal <= 5)  ganados.push('top5');
    if (posGlobal && posGlobal <= 3)  ganados.push('top3');

    // — Puntos ranking —
    if (totalPts >= 100)  ganados.push('rey_nexo');
    if (totalPts >= 200)  ganados.push('maestro_nexo');
    if (totalPts >= 500)  ganados.push('puntos_500');
    if (totalPts >= 1000) ganados.push('puntos_1000');

    // — Nómada (3 tiendas distintas) —
    const tiendasDistintas = new Set(historial.map(t => t.storeid).filter(Boolean));
    if (tiendasDistintas.size >= 3) ganados.push('nomada');

    // — v3: Asistencia sostenida basada en fechas del historial —
    const fechas = historial
      .map(t => {
        const d = new Date(t.fecha);
        return isNaN(d.getTime()) ? null : d;
      })
      .filter(Boolean)
      .sort((a, b) => a - b);

    if (fechas.length >= 2) {
      // Maratonista — 2 torneos el mismo fin de semana (≤ 2 días entre uno y otro, ambos en viernes-domingo)
      for (let i = 0; i < fechas.length - 1; i++) {
        const diffDias = (fechas[i + 1] - fechas[i]) / (1000 * 60 * 60 * 24);
        if (diffDias <= 2) {
          const dowA = fechas[i].getDay(), dowB = fechas[i + 1].getDay();
          if ((dowA === 6 && dowB === 0) || (dowA === 5 && dowB === 6) ||
              (dowA === 0 && dowB === 6) || (dowA === 6 && dowB === 6)) {
            ganados.push('maratonista');
            break;
          }
        }
      }

      // Cadena Mensual — 3 torneos en un mismo mes calendario
      const conteoMeses = {};
      fechas.forEach(f => {
        const clave = f.getFullYear() + '-' + f.getMonth();
        conteoMeses[clave] = (conteoMeses[clave] || 0) + 1;
      });
      if (Object.values(conteoMeses).some(c => c >= 3)) ganados.push('cadena_mensual');

      // Fiel Devoto — 3 torneos dentro de una ventana móvil de 90 días
      if (fechas.length >= 3) {
        for (let i = 0; i <= fechas.length - 3; i++) {
          const rango = (fechas[i + 2] - fechas[i]) / (1000 * 60 * 60 * 24);
          if (rango <= 90) { ganados.push('fiel_devoto'); break; }
        }
      }
    }
  }

  // — Badges manuales del Sheet de jugadores (columna F) —
  try {
    const ss   = SpreadsheetApp.openById(JUGADORES_SHEET_ID);
    const hoja = ss.getSheets()[0];
    const data = hoja.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const rowId = (data[i][0] || '').toString().trim().toUpperCase();
      if (rowId === playerid) {
        const badgesRaw = (data[i][5] || '').toString().trim();
        if (badgesRaw) {
          badgesRaw.split(',').forEach(b => {
            const bid = b.trim().toLowerCase();
            if (bid && !ganados.includes(bid)) ganados.push(bid);
          });
        }
        break;
      }
    }
  } catch (err) {
    Logger.log('Error leyendo badges manuales: ' + err.message);
  }

  // — Colección digital, QR, gastos —
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Sobres_Abiertos
    const hojaSobres = ss.getSheetByName('Sobres_Abiertos');
    if (hojaSobres) {
      const dataSobres = hojaSobres.getDataRange().getValues();
      let totalSobres   = 0;
      let totalSecretas = 0;
      let totalFoils    = 0;
      let tieneSecreta  = false;
      let tieneFoilPC   = false;

      for (let i = 1; i < dataSobres.length; i++) {
        const pid = (dataSobres[i][1] || '').toString().trim().toUpperCase();
        if (pid !== playerid) continue;
        totalSobres++;
        try {
          const cartas = JSON.parse(dataSobres[i][4] || '[]');
          cartas.forEach(c => {
            const r = (c.rareza || '').toLowerCase();
            if (r === 'secreta')         { tieneSecreta = true; totalSecretas++; }
            if (r === 'foil_poco_comun') { tieneFoilPC  = true; }
            if (r.indexOf('foil') !== -1) { totalFoils++; }
          });
        } catch(e) {}
      }

      if (totalSobres >= 1)   ganados.push('col_primer_sobre');
      if (totalSobres >= 5)   ganados.push('col_5_sobres');
      if (totalSobres >= 20)  ganados.push('col_20_sobres');
      if (totalSobres >= 50)  ganados.push('col_50_sobres');
      if (totalSobres >= 100) ganados.push('col_100_sobres');
      if (tieneSecreta)       ganados.push('col_carta_secreta');
      if (tieneFoilPC)        ganados.push('col_carta_foil_pc');
      if (totalSecretas >= 3) ganados.push('secreto_maestro');
      if (totalFoils    >= 5) ganados.push('foil_maestro');
    }

    // HP_Gastos — primera compra
    const hojaGastos = ss.getSheetByName('HP_Gastos');
    if (hojaGastos) {
      const dataGastos = hojaGastos.getDataRange().getValues();
      for (let i = 1; i < dataGastos.length; i++) {
        if ((dataGastos[i][1] || '').toString().trim().toUpperCase() === playerid) {
          ganados.push('hp_primera_compra');
          break;
        }
      }
    }

    // QR_Canjes
    const hojaQR = ss.getSheetByName('QR_Canjes');
    if (hojaQR) {
      const dataQR = hojaQR.getDataRange().getValues();
      let totalQR  = 0;
      for (let i = 1; i < dataQR.length; i++) {
        if ((dataQR[i][1] || '').toString().trim().toUpperCase() === playerid) totalQR++;
      }
      if (totalQR >= 1)  ganados.push('qr_escaner');
      if (totalQR >= 3)  ganados.push('qr_cazador');
      if (totalQR >= 10) ganados.push('qr_10');
      if (totalQR >= 25) ganados.push('qr_25');
    }

  } catch(err) {
    Logger.log('Error badges colección/QR: ' + err.message);
  }

  // Deduplicar
  return Array.from(new Set(ganados));
}

function _obtenerTotalGastado(playerid) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('HP_Gastos');
  if (!hoja) return 0;
  const data = hoja.getDataRange().getValues();
  let total  = 0;
  for (let i = 1; i < data.length; i++) {
    if ((data[i][1] || '').toString().trim().toUpperCase() === playerid) {
      total += parseFloat(data[i][3]) || 0;
    }
  }
  return total;
}

function _obtenerTotalBonus(playerid) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('HP_Bonus');
  if (!hoja) return 0;
  const data = hoja.getDataRange().getValues();
  let total  = 0;
  for (let i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toString().trim().toUpperCase() === playerid) {
      total += parseFloat(data[i][2]) || 0;
    }
  }
  return total;
}

function _obtenerNombreJugador(playerid) {
  try {
    const ss   = SpreadsheetApp.openById(JUGADORES_SHEET_ID);
    const hoja = ss.getSheets()[0];
    const data = hoja.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim().toUpperCase() === playerid) {
        return (data[i][2] || '').toString();
      }
    }
  } catch(e) {}
  return '';
}


// ══════════════════════════════════════════════════════════════
//  CANJEAR QR
// ══════════════════════════════════════════════════════════════

function canjearQR(playerid, codigo) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch(e) {
    return { status:'error', message:'El sistema está ocupado, intenta en unos segundos.' };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const hojaCodigos = ss.getSheetByName('QR_Codigos');
    if (!hojaCodigos) return { status:'error', message:'Sistema QR no configurado.' };
    const codData = hojaCodigos.getDataRange().getValues();

    let codigoFila = null;
    for (let i = 1; i < codData.length; i++) {
      const cod    = (codData[i][0] || '').toString().trim().toUpperCase();
      const activo = (codData[i][3] || '').toString().toLowerCase();
      if (cod === codigo && activo !== 'no') { codigoFila = codData[i]; break; }
    }
    if (!codigoFila) return { status:'error', message:'Código inválido o inactivo.' };

    const hpRecompensa = parseInt(codigoFila[1]) || 0;
    const descripcion  = (codigoFila[2] || codigo).toString();
    const usosMaximos  = parseInt(codigoFila[4]) || 999;
    // v4.1 — el código puede entregar un PRODUCTO DIGITAL (columna F = sku)
    const skuCodigo    = (codigoFila[5] || '').toString().trim().toLowerCase();
    let producto = null;
    if (skuCodigo) {
      producto = _productos()[skuCodigo];
      if (!producto) return { status:'error', message:'Este código es de un producto que ya no existe. Contacta a soporte.' };
      if (_comprasDe(playerid).indexOf(skuCodigo) >= 0) return { status:'error', message:'Ya tienes «' + producto.nombre + '». Guarda este código para regalarlo.', ya:true };
    }

    SpreadsheetApp.flush();
    const hojaCanjes = ss.getSheetByName('QR_Canjes');
    if (!hojaCanjes) return { status:'error', message:'Hoja QR_Canjes no encontrada.' };

    const totalFilas = hojaCanjes.getLastRow();
    let usosTotal = 0;

    if (totalFilas >= 2) {
      const canjesData = hojaCanjes.getRange(2, 1, totalFilas - 1, 4).getValues();
      for (let i = 0; i < canjesData.length; i++) {
        const canjeCod = (canjesData[i][2] || '').toString().trim().toUpperCase();
        if (canjeCod !== codigo) continue;
        usosTotal++;
        const canjePlayer = (canjesData[i][1] || '').toString().trim().toUpperCase();
        if (canjePlayer === playerid) {
          return { status:'error', message:'Ya canjeaste este código anteriormente.' };
        }
      }
    }

    if (usosTotal >= usosMaximos) {
      return { status:'error', message:'Este código ya alcanzó su límite de usos.' };
    }

    const fecha = Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
    hojaCanjes.appendRow([fecha, playerid, codigo, hpRecompensa]);
    if (hpRecompensa) ss.getSheetByName('HP_Bonus').appendRow([playerid, `QR: ${descripcion}`, hpRecompensa, fecha]);
    if (producto) _entregarProducto(playerid, producto, 'codigo', codigo, 0);
    SpreadsheetApp.flush();

    const saldoData = calcularSaldo(playerid);
    const r = { status:'ok', mensaje:'¡Código canjeado!', hp_ganados: hpRecompensa, descripcion: descripcion, saldo_nuevo: saldoData.saldo };
    if (producto) { r.producto = { sku: producto.sku, nombre: producto.nombre, tipo: producto.tipo, imagen: producto.imagen }; r.compras = _comprasDe(playerid); }
    return r;

  } finally {
    lock.releaseLock();
  }
}


// ══════════════════════════════════════════════════════════════
//  HISTORIAL QR
// ══════════════════════════════════════════════════════════════

function obtenerHistorialQR(playerid) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = ss.getSheetByName('QR_Canjes');
  if (!hoja) return { status:'ok', canjes:[] };
  const data = hoja.getDataRange().getValues();

  const hojaDesc = ss.getSheetByName('QR_Codigos');
  const descMap  = {};
  if (hojaDesc) {
    const descData = hojaDesc.getDataRange().getValues();
    for (let i = 1; i < descData.length; i++) {
      const cod = (descData[i][0] || '').toString().trim().toUpperCase();
      if (cod) descMap[cod] = (descData[i][2] || '').toString();
    }
  }

  const canjes = [];
  for (let i = 1; i < data.length; i++) {
    const pid = (data[i][1] || '').toString().trim().toUpperCase();
    if (pid !== playerid) continue;
    const cod = (data[i][2] || '').toString().trim().toUpperCase();
    canjes.push({ fecha: data[i][0], codigo: cod, hp: parseInt(data[i][3]) || 0, descripcion: descMap[cod] || cod });
  }
  canjes.reverse();
  return { status:'ok', canjes: canjes };
}


function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


// ══════════════════════════════════════════════════════════════
//  VISIBILIDAD DE SOBRES — v3.1
//  Sobres privados (allowlist) / por zona / con vigencia temporal
//  Columnas nuevas en Packs_Config (después de H=tipo):
//    I(8)=visibilidad  J(9)=allowlist  K(10)=zona
//    L(11)=vigencia_inicio  M(12)=vigencia_fin
// ══════════════════════════════════════════════════════════════

function _packEsVisible(packConfigRow, playerid, zonaJugador) {
  // packConfigRow = fila cruda de Packs_Config (array)
  const ahora = new Date();

  // Vigencia temporal (L=11, M=12)
  const vIni = packConfigRow[11];
  const vFin = packConfigRow[12];
  if (vIni instanceof Date && !isNaN(vIni) && vIni > ahora) return false;
  if (vFin instanceof Date && !isNaN(vFin) && vFin < ahora) return false;

  // Visibilidad (I=8)
  const vis = (packConfigRow[8] || 'publico').toString().toLowerCase().trim();

  if (vis === 'publico' || vis === '') return true;

  if (vis === 'privado') {
    const pid = (playerid || '').toString().trim().toUpperCase();
    if (!pid) return false;
    // allowlist (J=9)
    const lista = (packConfigRow[9] || '').toString()
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    return lista.includes(pid);
  }

  if (vis === 'zona') {
    // zona del pack (K=10)
    const zp = (packConfigRow[10] || '').toString().toUpperCase().trim();
    const zj = (zonaJugador   || '').toString().toUpperCase().trim();
    return !!zp && !!zj && zp === zj;
  }

  return false;
}

function _obtenerZonaJugador(playerid) {
  const pid = (playerid || '').toString().trim().toUpperCase();
  if (!pid) return '';
  try {
    const ss   = SpreadsheetApp.openById(JUGADORES_SHEET_ID);
    const hoja = ss.getSheets()[0];
    const data = hoja.getDataRange().getValues();
    if (!data.length) return '';

    // Busca la columna 'zona' por header (case-insensitive)
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    const idxZona = headers.indexOf('zona');
    if (idxZona === -1) return '';

    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] || '').toString().trim().toUpperCase() === pid) {
        return (data[i][idxZona] || '').toString().trim();
      }
    }
  } catch(e) {
    Logger.log('Error leyendo zona: ' + e.message);
  }
  return '';
}


// ══════════════════════════════════════════════════════════════
//  LOGROS DEL MODO ARCADE — v3.2
//  arcade.html → ?action=logro_arcade&playerid=CHH-…&badge=arc_…
//  Agrega el logro a la columna F del Registro de Jugadores (la misma
//  que lee _calcularBadges y perfil.html). Solo acepta los logros arc_.
// ══════════════════════════════════════════════════════════════

const ARCADE_BADGES = [
  'arc_primera_victoria',
  'arc_mitad',
  'arc_campeon',
  'arc_fenix',
  'arc_jefe_intacto',
  'arc_un_credito',
  'arc_veterano',
  'arc_maestro_barajas',
  'arc_gran_maestro',
  'arc_intacto',
  'arc_relampago',
  'arc_al_limite',
  'arc_remontada',
  'arc_muralla',
  'arc_arrasador',
  'arc_aniquilador',
  'arc_golpe',
  'arc_alquimista',
  'arc_invocador',
  'arc_divino',
  'arc_estratega',
  'arc_terraformador',
  'arc_ejercito',
  'arc_revancha',
  'arc_cazador',
  'arc_centurion',
  'arc_destructor',
  'arc_forjador',
  'arc_legendario',
  'arc_epico',
  'arc_inmortal',
  'arc_sin_piedad',
  'arc_caotico',
  'arc_caos_puro',
  'arc_heroico',
  'arc_creador'
];

function registrarLogroArcade(playerid, badge) {
  if (ARCADE_BADGES.indexOf(badge) < 0) {
    return { status:'error', ok:false, message:'Logro no válido.' };
  }

  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) {
    return { status:'error', ok:false, message:'El sistema está ocupado, intenta en unos segundos.' };
  }

  try {
    const hoja = SpreadsheetApp.openById(JUGADORES_SHEET_ID).getSheets()[0];
    const n    = hoja.getLastRow();
    if (n < 2) return { status:'error', ok:false, message:'Registro de jugadores vacío.' };

    const ids = hoja.getRange(2, 1, n - 1, 1).getValues();   // columna A
    for (let i = 0; i < ids.length; i++) {
      if ((ids[i][0] || '').toString().trim().toUpperCase() !== playerid) continue;

      const celda = hoja.getRange(i + 2, 6);                   // columna F (badges)
      const lista = (celda.getValue() || '').toString()
        .split(',')
        .map(b => b.trim().toLowerCase())
        .filter(Boolean);

      if (lista.indexOf(badge) >= 0) return { status:'ok', ok:true, ya:true, badge: badge };

      lista.push(badge);
      celda.setValue(lista.join(', '));
      SpreadsheetApp.flush();
      return { status:'ok', ok:true, nuevo:true, badge: badge, hp: HP_BADGES[badge] || 0 };
    }
    return { status:'error', ok:false, message:'Jugador no encontrado.' };

  } finally {
    lock.releaseLock();
  }
}


// ══════════════════════════════════════════════════════════════
//  MICAS Y PLAYMATS — v3.4
//  Se venden como filas de Packs_Config con H(tipo) = 'mica' o 'playmat'.
//  Lo comprado se registra en la hoja "Cosmeticos".
// ══════════════════════════════════════════════════════════════

function _hojaCosmeticos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Cosmeticos');
  if (!h) {
    h = ss.insertSheet('Cosmeticos');
    h.appendRow(['fecha', 'playerid', 'jugador', 'item_id', 'tipo', 'nombre', 'costo']);
    h.setFrozenRows(1);
  }
  return h;
}

function _tieneCosmetico(playerid, itemId) {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cosmeticos');
  if (!h) return false;
  const data = h.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if ((data[i][1] || '').toString().trim().toUpperCase() === playerid &&
        (data[i][3] || '').toString().trim().toLowerCase() === itemId) return true;
  }
  return false;
}

function obtenerCosmeticos(playerid) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Imagen y nombre actuales desde Packs_Config (aunque la fila ya esté inactiva)
  const info = {};
  const hc = ss.getSheetByName('Packs_Config');
  if (hc) {
    const dc = hc.getDataRange().getValues();
    for (let i = 1; i < dc.length; i++) {
      const pid = (dc[i][0] || '').toString().trim().toLowerCase();
      if (pid) info[pid] = { nombre: (dc[i][1] || pid).toString(), imagen: (dc[i][3] || '').toString(), descripcion: (dc[i][4] || '').toString(), tipo: (dc[i][7] || '').toString().trim().toLowerCase() };
    }
  }

  // v4.1 — también los cosméticos premium (Productos_Digitales)
  try { const pd = _productos(); Object.keys(pd).forEach(k => { if (!info[k]) info[k] = { nombre: pd[k].nombre, imagen: pd[k].imagen, descripcion: pd[k].descripcion, tipo: pd[k].tipo }; }); } catch (e) {}

  const cosmeticos = [];
  const h = ss.getSheetByName('Cosmeticos');
  if (h) {
    const data = h.getDataRange().getValues();
    const vistos = {};
    for (let i = 1; i < data.length; i++) {
      if ((data[i][1] || '').toString().trim().toUpperCase() !== playerid) continue;
      const id = (data[i][3] || '').toString().trim().toLowerCase();
      if (!id || vistos[id]) continue;
      vistos[id] = true;
      const x = info[id] || {};
      cosmeticos.push({
        id: id,
        tipo: (data[i][4] || x.tipo || '').toString().trim().toLowerCase(),
        nombre: x.nombre || (data[i][5] || id).toString(),
        imagen: x.imagen || '',
        descripcion: x.descripcion || ''
      });
    }
  }

  // Logros del Arcade guardados en el registro (para las recompensas en otros dispositivos)
  const logros = [];
  try {
    const hj = SpreadsheetApp.openById(JUGADORES_SHEET_ID).getSheets()[0];
    const dj = hj.getDataRange().getValues();
    for (let i = 1; i < dj.length; i++) {
      if ((dj[i][0] || '').toString().trim().toUpperCase() !== playerid) continue;
      (dj[i][5] || '').toString().split(',').forEach(b => {
        const bid = b.trim().toLowerCase();
        if (bid.indexOf('arc_') === 0) logros.push(bid);
      });
      break;
    }
  } catch (e) {
    Logger.log('Error leyendo logros arcade: ' + e.message);
  }

  return { status: 'ok', playerid: playerid, cosmeticos: cosmeticos, logros: logros };
}


// ══════════════════════════════════════════════════════════════
//  CRÉDITOS DEL ARCADE — v3.5
//  Se venden como filas de Packs_Config con H(tipo) = 'creditos' y E = cantidad.
//  La bolsa del jugador = suma de la columna "movimiento" de la hoja Arcade_Creditos.
// ══════════════════════════════════════════════════════════════
function _hojaCreditos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Arcade_Creditos');
  if (!h) {
    h = ss.insertSheet('Arcade_Creditos');
    h.appendRow(['fecha', 'playerid', 'jugador', 'movimiento', 'detalle', 'item_id']);
    h.setFrozenRows(1);
  }
  return h;
}

function _bolsaCreditos(playerid) {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Arcade_Creditos');
  if (!h) return 0;
  const data = h.getDataRange().getValues();
  let n = 0;
  for (let i = 1; i < data.length; i++) {
    if ((data[i][1] || '').toString().trim().toUpperCase() === playerid) n += parseInt(data[i][3]) || 0;
  }
  return Math.max(0, n);
}

function usarCreditoArcade(playerid) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) {
    return { status:'error', message:'El sistema está ocupado, intenta en unos segundos.' };
  }
  try {
    const bolsa = _bolsaCreditos(playerid);
    if (bolsa < 1) return { status:'error', message:'No tienes créditos en tu bolsa.', bolsa: 0 };
    const fecha = Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
    _hojaCreditos().appendRow([fecha, playerid, _obtenerNombreJugador(playerid), -1, 'Usado en el Arcade', '']);
    SpreadsheetApp.flush();
    return { status:'ok', bolsa: bolsa - 1 };
  } finally {
    lock.releaseLock();
  }
}


// ══════════════════════════════════════════════════════════════
//  MISIONES DIARIAS Y SEMANALES — v4.0
//  Edita aquí los textos y las recompensas. Mantén las recompensas BAJAS.
//  evento: 'choque' (cualquier choque terminado) · 'victoria' (cualquier choque ganado)
//          'victoria_arcade' · 'victoria_sim' · 'victoria_nexotlan' · 'online' (choque online terminado)
//          'torneo_inscripcion' · 'academia_publicar'
// ══════════════════════════════════════════════════════════════
const MISIONES_DIARIAS = [
  { id: 'd_gana1',      texto: 'Gana 1 choque',                        evento: 'victoria',          meta: 1, hp: 2 },
  { id: 'd_juega2',     texto: 'Juega 2 choques',                      evento: 'choque',            meta: 2, hp: 2 },
  { id: 'd_arcade1',    texto: 'Gana 1 choque en el Modo Arcade',      evento: 'victoria_arcade',   meta: 1, hp: 3 },
  { id: 'd_sim1',       texto: 'Gana 1 choque en Simulación de batalla', evento: 'victoria_sim',    meta: 1, hp: 2 },
  { id: 'd_nexo1',      texto: 'Gana 1 choque en Aventura: Nexotlan',  evento: 'victoria_nexotlan', meta: 1, hp: 3 },
  { id: 'd_online1',    texto: 'Juega 1 Choque online',                evento: 'online',            meta: 1, hp: 3 },
  { id: 'd_juega3',     texto: 'Juega 3 choques',                      evento: 'choque',            meta: 3, hp: 3 }
];
const MISIONES_SEMANALES = [
  { id: 's_gana5',      texto: 'Gana 5 choques',                       evento: 'victoria',          meta: 5,  hp: 6 },
  { id: 's_juega10',    texto: 'Juega 10 choques',                     evento: 'choque',            meta: 10, hp: 5 },
  { id: 's_arcade3',    texto: 'Gana 3 choques en el Modo Arcade',     evento: 'victoria_arcade',   meta: 3,  hp: 6 },
  { id: 's_nexo2',      texto: 'Gana 2 choques en Aventura: Nexotlan', evento: 'victoria_nexotlan', meta: 2,  hp: 5 },
  { id: 's_online3',    texto: 'Juega 3 Choques online',               evento: 'online',            meta: 3,  hp: 6 },
  { id: 's_torneo',     texto: 'Inscríbete a un torneo oficial',       evento: 'torneo_inscripcion', meta: 1, hp: 4 },
  { id: 's_academia',   texto: 'Publica una baraja en la Academia Heroica', evento: 'academia_publicar', meta: 1, hp: 4 }
];
const MIS_POR_PERIODO = 3, MIS_SEG_ENTRE_CHOQUES = 60, MIS_CHOQUES_DIA = 25;
const MIS_COLS = ['playerid', 'periodo', 'mision', 'progreso', 'meta', 'completada', 'cobrada', 'actualizado'];
const TZ_MX = 'America/Mexico_City';

function _hojaMisiones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Misiones');
  if (!h) { h = ss.insertSheet('Misiones'); h.appendRow(MIS_COLS); h.setFrozenRows(1); h.getRange('B:B').setNumberFormat('@'); }
  return h;
}
// Fecha/hora "de pared" en la Ciudad de México
function _mxPartes(d) { const t = Utilities.formatDate(d || new Date(), TZ_MX, 'yyyy-MM-dd|u|HH:mm:ss').split('|'); return { fecha: t[0], diaSem: parseInt(t[1], 10) }; }
function _sumarDias(fecha, n) { const p = fecha.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n)); return d.toISOString().slice(0, 10); }
function _periodos() {
  const x = _mxPartes(), lunes = _sumarDias(x.fecha, -(x.diaSem - 1));
  return { dia: 'D' + x.fecha, semana: 'S' + lunes, fecha: x.fecha, lunes };
}
// Medianoche MX de una fecha → milisegundos (para la cuenta regresiva en la app)
function _medianocheMX(fecha) {
  const base = new Date(fecha + 'T00:00:00Z').getTime();
  const off = Utilities.formatDate(new Date(base), TZ_MX, 'Z');   // ej. -0600
  const sg = off[0] === '-' ? 1 : -1, h = parseInt(off.slice(1, 3), 10), m = parseInt(off.slice(3, 5), 10);
  return base + sg * (h * 60 + m) * 60000;
}
function _elegir(lista, semilla, n) {   // misma selección para todos en el mismo periodo
  let h = 2166136261; for (let i = 0; i < semilla.length; i++) { h ^= semilla.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const r = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const L = lista.slice(); for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
  return L.slice(0, n);
}
function _misionesActuales() {
  const p = _periodos();
  return {
    p,
    diarias: _elegir(MISIONES_DIARIAS, p.dia, MIS_POR_PERIODO).map(m => Object.assign({ periodo: p.dia }, m)),
    semanales: _elegir(MISIONES_SEMANALES, p.semana, MIS_POR_PERIODO).map(m => Object.assign({ periodo: p.semana }, m))
  };
}
function _filasMisiones(pid, periodos) {
  const h = _hojaMisiones(), d = h.getDataRange().getValues(), out = {};
  for (let i = 1; i < d.length; i++) {
    if ((d[i][0] || '').toString().trim().toUpperCase() !== pid || periodos.indexOf(String(d[i][1])) < 0) continue;
    out[d[i][1] + '|' + d[i][2]] = { fila: i + 1, progreso: parseInt(d[i][3], 10) || 0, completada: d[i][5], cobrada: d[i][6] };
  }
  return out;
}
function misionesJugador(pid) {
  const A = _misionesActuales(), F = _filasMisiones(pid, [A.p.dia, A.p.semana]);
  const fmt = m => { const f = F[m.periodo + '|' + m.id] || {}; const prog = Math.min(m.meta, f.progreso || 0);
    return { id: m.id, periodo: m.periodo, texto: m.texto, evento: m.evento, meta: m.meta, progreso: prog, hp: m.hp, completada: prog >= m.meta, cobrada: !!f.cobrada }; };
  return { status: 'ok', diarias: A.diarias.map(fmt), semanales: A.semanales.map(fmt),
    reinicioDiario: _medianocheMX(_sumarDias(A.p.fecha, 1)), reinicioSemanal: _medianocheMX(_sumarDias(A.p.lunes, 7)) };
}
function misionEvento(pid, prm) {
  const ev = String(prm.evento || '').trim();
  const cache = CacheService.getScriptCache(), p = _periodos();
  let eventos = [];
  if (ev === 'choque') {
    const modo = String(prm.modo || '').trim(), gano = String(prm.gano) === '1';
    if (['arcade', 'sim', 'nexotlan', 'online'].indexOf(modo) < 0) return { status: 'error', message: 'Modo no válido.' };
    if (cache.get('mch_' + pid)) return { status: 'ok', ignorado: true, motivo: 'espera' };
    const n = parseInt(cache.get('mchd_' + pid + p.fecha) || '0', 10);
    if (n >= MIS_CHOQUES_DIA) return { status: 'ok', ignorado: true, motivo: 'limite' };
    cache.put('mch_' + pid, '1', MIS_SEG_ENTRE_CHOQUES); cache.put('mchd_' + pid + p.fecha, String(n + 1), 21600);
    eventos = ['choque'];
    if (modo === 'online') eventos.push('online');
    if (gano) { eventos.push('victoria'); if (modo !== 'online') eventos.push('victoria_' + modo); }
  } else if (ev === 'torneo_inscripcion' || ev === 'academia_publicar') {
    if (cache.get('mev_' + ev + pid + p.fecha)) return { status: 'ok', ignorado: true, motivo: 'hoy' };
    cache.put('mev_' + ev + pid + p.fecha, '1', 21600);
    eventos = [ev];
  } else return { status: 'error', message: 'Evento no válido.' };

  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const A = _misionesActuales(), F = _filasMisiones(pid, [A.p.dia, A.p.semana]), h = _hojaMisiones(), ahora = new Date();
    const completadas = [];
    A.diarias.concat(A.semanales).filter(m => eventos.indexOf(m.evento) >= 0).forEach(m => {
      const k = m.periodo + '|' + m.id, f = F[k];
      if (f && f.progreso >= m.meta) return;
      const prog = Math.min(m.meta, (f ? f.progreso : 0) + 1), comp = prog >= m.meta ? ahora : '';
      if (f) { h.getRange(f.fila, 4).setValue(prog); if (comp) h.getRange(f.fila, 6).setValue(comp); h.getRange(f.fila, 8).setValue(ahora); }
      else h.appendRow([pid, m.periodo, m.id, prog, m.meta, comp, '', ahora]);
      if (comp) completadas.push({ id: m.id, periodo: m.periodo, texto: m.texto, hp: m.hp });
    });
    SpreadsheetApp.flush();
    return { status: 'ok', completadas };
  } finally { lock.releaseLock(); }
}
function misionCobrar(pid, id) {
  const A = _misionesActuales(), m = A.diarias.concat(A.semanales).find(x => x.id === id);
  if (!m) return { status: 'error', message: 'Esa misión ya no está activa.' };
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const f = _filasMisiones(pid, [m.periodo])[m.periodo + '|' + m.id];
    if (!f || f.progreso < m.meta) return { status: 'error', message: 'Aún no completas esta misión.' };
    if (f.cobrada) return { status: 'error', ya: true, message: 'Ya cobraste esta misión.' };
    const ahora = new Date();
    _hojaMisiones().getRange(f.fila, 7).setValue(ahora);
    const ssB = SpreadsheetApp.getActiveSpreadsheet();
    (ssB.getSheetByName('HP_Bonus') || ssB.insertSheet('HP_Bonus'))
      .appendRow([pid, 'Misión: ' + m.texto, m.hp, Utilities.formatDate(ahora, TZ_MX, 'yyyy-MM-dd HH:mm:ss')]);
    SpreadsheetApp.flush();
    let saldo = null; try { saldo = calcularSaldo(pid).saldo; } catch (e) {}
    return { status: 'ok', hp: m.hp, saldo_nuevo: saldo, mensaje: '+' + m.hp + ' HP' };
  } finally { lock.releaseLock(); }
}

// ══════════════════════════════════════════════════════════════
//  PRODUCTOS DIGITALES Y COMPRAS — v4.1
//  Lo pagado con dinero real (o entregado con código) queda en la hoja "Compras".
//  La app nunca decide sola si algo está comprado: siempre pregunta aquí.
// ══════════════════════════════════════════════════════════════
const PD_COLS = ['sku', 'nombre', 'tipo', 'precio_mxn', 'imagen', 'descripcion', 'contenido', 'activo', 'orden', 'link_compra'];
const PD_TIPOS = ['dlc', 'mica', 'playmat', 'heroe', 'arena', 'paquete'];

function _hojaProductos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Productos_Digitales');
  if (!h) {
    h = ss.insertSheet('Productos_Digitales');
    h.appendRow(PD_COLS);
    h.appendRow(['dlc_ejemplo', 'Capítulo de ejemplo', 'dlc', 99, 'hero_pesos/banner_sobres.jpg', 'Un capítulo nuevo de la Aventura con sus rivales y cartas.', '', 'no', 1, '']);
    h.appendRow(['mica_ejemplo', 'Mica de ejemplo', 'mica', 49, '', 'Mica premium para el Simulador.', '', 'no', 2, '']);
    h.setFrozenRows(1);
  }
  return h;
}

// ▶ Ejecuta UNA VEZ desde el editor: da de alta el DLC "Las Catacumbas de Nexotlan".
//   Cambia aquí el precio si quieres (o después, directo en la hoja).
function instalarDLCCatacumbas() {
  const h = _hojaProductos(), data = h.getDataRange().getValues();
  const fila = ['dlc_catacumbas', 'Las Catacumbas de Nexotlan', 'dlc', 49, 'assets/tienda/productos/dlc_catacumbas.jpg',
    'Bajo la isla de Nexotlan se abre un mundo que ningún mapa registra: Bajo Nexotlan, el osario de tres niveles y su Reina. | Mapa nuevo con 3 distritos en el Modo Aventura | 8 adversarios y 3 héroes nuevos | Guardianes de las Catacumbas ALFA y SIGMA | Mictecacihuatl, Reina de las Catacumbas | Sobre de las Catacumbas en la tienda del Doctor',
    '', 'si', 1, ''];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === 'dlc_catacumbas') {
      h.getRange(i + 1, 1, 1, fila.length).setValues([fila]);
      return 'Producto dlc_catacumbas actualizado (fila ' + (i + 1) + ').';
    }
  }
  h.appendRow(fila);
  return 'Producto dlc_catacumbas agregado.';
}

function _productos() {
  const data = _hojaProductos().getDataRange().getValues();
  const out = {};
  for (let i = 1; i < data.length; i++) {
    const sku = (data[i][0] || '').toString().trim().toLowerCase();
    if (!sku) continue;
    out[sku] = {
      sku: sku,
      nombre: (data[i][1] || sku).toString(),
      tipo: (data[i][2] || 'dlc').toString().trim().toLowerCase(),
      precio_mxn: parseFloat(data[i][3]) || 0,
      imagen: (data[i][4] || '').toString().trim(),
      descripcion: (data[i][5] || '').toString(),
      contenido: (data[i][6] || '').toString().split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
      activo: (data[i][7] || '').toString().trim().toLowerCase() !== 'no',
      orden: parseFloat(data[i][8]) || 999,
      link_compra: (data[i][9] || '').toString().trim()
    };
  }
  return out;
}

function _hojaCompras() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Compras');
  if (!h) {
    h = ss.insertSheet('Compras');
    h.appendRow(['fecha', 'playerid', 'jugador', 'sku', 'nombre', 'origen', 'referencia', 'monto_mxn']);
    h.setFrozenRows(1);
  }
  return h;
}

// SKUs que tiene el jugador; los paquetes se desglosan en lo que incluyen
function _comprasDe(playerid) {
  const h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Compras');
  if (!h) return [];
  const data = h.getDataRange().getValues(), pd = _productos(), set = {};
  for (let i = 1; i < data.length; i++) {
    if ((data[i][1] || '').toString().trim().toUpperCase() !== playerid) continue;
    const sku = (data[i][3] || '').toString().trim().toLowerCase();
    if (!sku) continue;
    set[sku] = true;
    const p = pd[sku];
    if (p && p.tipo === 'paquete') p.contenido.forEach(c => set[c] = true);
  }
  return Object.keys(set);
}

// Registra la compra y, si es cosmético, lo escribe también en "Cosmeticos" (lo que ya lee el Simulador)
function _entregarProducto(playerid, producto, origen, referencia, monto) {
  const fecha = Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
  const nombreJ = _obtenerNombreJugador(playerid);
  _hojaCompras().appendRow([fecha, playerid, nombreJ, producto.sku, producto.nombre, origen, referencia || '', monto || 0]);
  const pd = _productos();
  const lista = producto.tipo === 'paquete' ? producto.contenido.map(c => pd[c]).filter(Boolean) : [producto];
  lista.forEach(p => {
    if ((p.tipo === 'mica' || p.tipo === 'playmat' || p.tipo === 'heroe') && !_tieneCosmetico(playerid, p.sku))
      _hojaCosmeticos().appendRow([fecha, playerid, nombreJ, p.sku, p.tipo, p.nombre, 0]);
  });
}

function obtenerProductosDigitales(playerid) {
  const pd = _productos();
  const tiene = playerid ? _comprasDe(playerid) : [];
  const productos = Object.keys(pd).map(k => pd[k])
    .filter(p => p.activo || tiene.indexOf(p.sku) >= 0)
    .sort((a, b) => a.orden - b.orden)
    .map(p => ({ sku: p.sku, nombre: p.nombre, tipo: p.tipo, precio_mxn: p.precio_mxn, imagen: p.imagen, descripcion: p.descripcion,
                 contenido: p.contenido, link_compra: p.link_compra, activo: p.activo, tengo: tiene.indexOf(p.sku) >= 0 }));
  return { status: 'ok', productos: productos, compras: tiene, mp: _mpActivo() };
}

// ▶ Ejecuta desde el editor: generarCodigosProducto('dlc_ejemplo', 20)
//   Crea códigos únicos de UN SOLO USO para un producto (QR_Codigos) y los copia a "Codigos_Generados".
function generarCodigosProducto(sku, cantidad) {
  sku = String(sku || '').trim().toLowerCase(); cantidad = Math.max(1, Math.min(500, parseInt(cantidad) || 10));
  const p = _productos()[sku];
  if (!p) throw new Error('No existe el producto "' + sku + '" en Productos_Digitales.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hq = ss.getSheetByName('QR_Codigos');
  if (!hq) throw new Error('Falta la hoja QR_Codigos.');
  if (!(hq.getRange(1, 6).getValue() || '').toString()) hq.getRange(1, 6).setValue('producto');
  const existentes = {};
  hq.getDataRange().getValues().forEach(r => existentes[(r[0] || '').toString().trim().toUpperCase()] = true);
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // sin 0/O ni 1/I para que no se confundan
  const bloque = () => { let t = ''; for (let i = 0; i < 4; i++) t += ABC.charAt(Math.floor(Math.random() * ABC.length)); return t; };
  let hg = ss.getSheetByName('Codigos_Generados');
  if (!hg) { hg = ss.insertSheet('Codigos_Generados'); hg.appendRow(['fecha', 'codigo', 'sku', 'producto', 'vendido_a / notas']); hg.setFrozenRows(1); }
  const fecha = Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss');
  const filasQ = [], filasG = [];
  while (filasQ.length < cantidad) {
    const c = 'CDH-' + bloque() + '-' + bloque() + '-' + bloque();
    if (existentes[c]) continue;
    existentes[c] = true;
    filasQ.push([c, 0, p.nombre, 'si', 1, sku]);
    filasG.push([fecha, c, sku, p.nombre, '']);
  }
  hq.getRange(hq.getLastRow() + 1, 1, filasQ.length, 6).setValues(filasQ);
  hg.getRange(hg.getLastRow() + 1, 1, filasG.length, 5).setValues(filasG);
  return filasQ.length + ' códigos creados para ' + p.nombre;
}


// ══════════════════════════════════════════════════════════════
//  MERCADO PAGO — Checkout Pro (v4.2)
//  El navegador solo recibe la liga de pago. La entrega ocurre aquí, después de consultar el pago
//  directamente a la API de Mercado Pago con el Access Token (Propiedades del script).
// ══════════════════════════════════════════════════════════════
const MP_API = 'https://api.mercadopago.com';
const MP_COLS = ['fecha', 'referencia', 'playerid', 'jugador', 'sku', 'producto', 'monto_mxn', 'estado', 'payment_id', 'preference_id', 'actualizado'];
const MP_DIAS_REVISION = 5;   // días que se sigue revisando un intento de pago sin entregar

function _mpToken() { return _prop('MP_ACCESS_TOKEN').trim(); }
function _mpActivo() { return !!_mpToken(); }
function _mpFecha() { return Utilities.formatDate(new Date(), 'America/Mexico_City', 'yyyy-MM-dd HH:mm:ss'); }

function _mpFetch(metodo, ruta, cuerpo, idem) {
  const op = { method: metodo, muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + _mpToken() } };
  if (cuerpo) { op.contentType = 'application/json'; op.payload = JSON.stringify(cuerpo); }
  if (idem) op.headers['X-Idempotency-Key'] = idem;
  const r = UrlFetchApp.fetch(MP_API + ruta, op);
  const code = r.getResponseCode();
  let d = {};
  try { d = JSON.parse(r.getContentText() || '{}'); } catch (e) {}
  if (code >= 300) throw new Error('Mercado Pago respondió ' + code + (d.message ? ': ' + d.message : ''));
  return d;
}

function _hojaPagosMP() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName('Pagos_MP');
  if (!h) { h = ss.insertSheet('Pagos_MP'); h.appendRow(MP_COLS); h.setFrozenRows(1); }
  return h;
}

function _mpUrlWebhook() {
  const u = _prop('MP_WEBHOOK_URL').trim();
  if (u) return u + (u.indexOf('?') >= 0 ? '&' : '?') + 'action=mp_webhook';
  try {
    const s = ScriptApp.getService().getUrl() || '';
    if (/\/exec$/.test(s)) return s + '?action=mp_webhook';
  } catch (e) {}
  return '';
}

// Crea la preferencia de pago y devuelve la liga de Checkout Pro
function mpCrearPago(playerid, sku, volver) {
  if (!_mpActivo()) return { status: 'error', message: 'El pago en línea todavía no está disponible.' };
  const p = _productos()[sku];
  if (!p || !p.activo) return { status: 'error', message: 'Ese producto no está a la venta.' };
  const monto = Math.round(Number(p.precio_mxn) * 100) / 100;
  if (!(monto > 0)) return { status: 'error', message: 'Ese producto no tiene precio.' };
  if (_comprasDe(playerid).indexOf(sku) >= 0) return { status: 'error', message: 'Ya tienes «' + p.nombre + '».', ya: true };
  if (!/^https:\/\/[^\s"'<>]+$/.test(volver)) return { status: 'error', message: 'Página de regreso inválida.' };
  const permitido = _prop('MP_VOLVER').trim();
  if (permitido && volver.indexOf(permitido) !== 0) return { status: 'error', message: 'Página de regreso no permitida.' };
  const base = volver.split('#')[0].split('?')[0];

  const ref = 'CDH-' + playerid + '-' + sku + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  const pref = {
    items: [{ id: sku, title: String(p.nombre).slice(0, 120), description: String(p.descripcion || p.nombre).slice(0, 240),
              category_id: 'entertainment', quantity: 1, currency_id: 'MXN', unit_price: monto }],
    external_reference: ref,
    metadata: { playerid: playerid, sku: sku },
    back_urls: { success: base + '?mp=ok', pending: base + '?mp=pendiente', failure: base + '?mp=error' },
    auto_return: 'approved',
    statement_descriptor: 'CHOQUEHEROES'
  };
  const nu = _mpUrlWebhook();
  if (nu) pref.notification_url = nu;

  const d = _mpFetch('post', '/checkout/preferences', pref, ref);
  const liga = _prop('MP_SANDBOX').toLowerCase() === 'si' ? (d.sandbox_init_point || d.init_point) : d.init_point;
  if (!liga) return { status: 'error', message: 'Mercado Pago no devolvió la liga de pago.' };
  const f = _mpFecha();
  _hojaPagosMP().appendRow([f, ref, playerid, _obtenerNombreJugador(playerid), sku, p.nombre, monto, 'pendiente', '', d.id || '', f]);
  return { status: 'ok', url: liga, referencia: ref };
}

// Aplica un pago consultado a la API. Debe llamarse con el lock tomado.
function _mpAplicarPago(pago, soloJugador) {
  const ref = String(pago.external_reference || '');
  if (!ref) return null;
  const h = _hojaPagosMP(), data = h.getDataRange().getValues();
  let fila = -1;
  for (let i = 1; i < data.length; i++) if (String(data[i][1]) === ref) { fila = i; break; }
  if (fila < 0) return null;
  const r = data[fila], pid = String(r[2]).toUpperCase(), sku = String(r[4]).toLowerCase(), monto = Number(r[6]) || 0;
  if (soloJugador && pid !== soloJugador) return null;
  const prev = String(r[7]);
  const out = { referencia: ref, sku: sku, nombre: String(r[5]), estado: prev };
  if (prev === 'entregado' || prev === 'revisar') return out;
  // Si ya hay un pago aprobado registrado, un intento rechazado posterior no lo pisa
  if (pago.status !== 'approved' && prev === 'approved') return out;

  let estado = String(pago.status || prev);
  if (pago.status === 'approved') {
    const ok = String(pago.currency_id) === 'MXN' && Number(pago.transaction_amount) + 0.01 >= monto;
    const producto = _productos()[sku];
    if (!ok || !producto) estado = 'revisar';
    else {
      if (_comprasDe(pid).indexOf(sku) < 0) _entregarProducto(pid, producto, 'mercadopago', String(pago.id), monto);
      estado = 'entregado';
    }
  }
  h.getRange(fila + 1, 8, 1, 4).setValues([[estado, String(pago.id || r[8] || ''), r[9], _mpFecha()]]);
  out.estado = estado;
  return out;
}

// Busca en Mercado Pago los pagos de una referencia y aplica el mejor (aprobado primero)
function _mpRevisarReferencia(ref, soloJugador) {
  const d = _mpFetch('get', '/v1/payments/search?sort=date_created&criteria=desc&external_reference=' + encodeURIComponent(ref));
  const lista = (d.results || []).filter(x => String(x.external_reference) === ref);
  if (!lista.length) return null;
  const orden = { approved: 0, in_process: 1, pending: 2, authorized: 2 };
  lista.sort((a, b) => (orden[a.status] != null ? orden[a.status] : 9) - (orden[b.status] != null ? orden[b.status] : 9));
  return _mpAplicarPago(lista[0], soloJugador);
}

function _mpPendientes(soloJugador) {
  const data = _hojaPagosMP().getDataRange().getValues(), lim = Date.now() - MP_DIAS_REVISION * 86400000, out = [];
  for (let i = 1; i < data.length; i++) {
    const est = String(data[i][7]);
    if (est === 'entregado' || est === 'revisar') continue;
    if (soloJugador && String(data[i][2]).toUpperCase() !== soloJugador) continue;
    const v = data[i][0], t = v instanceof Date ? v.getTime() : new Date(String(v).replace(' ', 'T') + '-06:00').getTime();
    if (t && t < lim) continue;
    out.push(String(data[i][1]));
  }
  return out;
}

// El jugador regresa de Mercado Pago (o abre la tienda con pagos pendientes)
function mpVerificar(playerid, paymentId) {
  if (!_mpActivo()) return { status: 'error', message: 'El pago en línea todavía no está disponible.' };
  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) { return { status: 'error', message: 'El sistema está ocupado, intenta en unos segundos.' }; }
  try {
    const res = {}, guardar = x => { if (x) res[x.referencia] = x; };
    if (/^\d+$/.test(paymentId)) {
      try { guardar(_mpAplicarPago(_mpFetch('get', '/v1/payments/' + paymentId), playerid)); } catch (e) {}
    }
    _mpPendientes(playerid).slice(-8).forEach(ref => { if (!res[ref]) { try { guardar(_mpRevisarReferencia(ref, playerid)); } catch (e) {} } });
    const resultados = Object.keys(res).map(k => res[k]);
    return { status: 'ok', resultados: resultados, compras: _comprasDe(playerid) };
  } finally { lock.releaseLock(); }
}

// Aviso de Mercado Pago. No se confía en el contenido: se vuelve a consultar el pago a la API.
function mpWebhook(e) {
  if (!_mpActivo()) return { status: 'ok' };
  const pr = e.parameter || {};
  let cuerpo = {};
  try { cuerpo = JSON.parse((e.postData && e.postData.contents) || '{}'); } catch (x) {}
  const tipo = String(pr.type || pr.topic || cuerpo.type || cuerpo.topic || '');
  const id = String(pr['data.id'] || (cuerpo.data && cuerpo.data.id) || (tipo === 'payment' ? pr.id : '') || '');
  if (tipo.indexOf('payment') < 0 || !/^\d+$/.test(id)) return { status: 'ok' };
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (x) { return { status: 'ok' }; }
  try { _mpAplicarPago(_mpFetch('get', '/v1/payments/' + id)); } catch (x) {}
  finally { lock.releaseLock(); }
  return { status: 'ok' };
}

// ▶ La ejecuta el activador cada 10 min (instalarRevisionMP). También puedes correrla a mano.
function mpRevisarPendientes() {
  if (!_mpActivo()) return 'Falta MP_ACCESS_TOKEN';
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) { return 'Ocupado'; }
  let n = 0;
  try {
    _mpPendientes().slice(-60).forEach(ref => { try { const r = _mpRevisarReferencia(ref); if (r && r.estado === 'entregado') n++; } catch (e) {} });
  } finally { lock.releaseLock(); }
  return n + ' pagos entregados';
}

// ▶ Ejecuta UNA VEZ desde el editor: instala la revisión automática cada 10 minutos
function instalarRevisionMP() {
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'mpRevisarPendientes') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('mpRevisarPendientes').timeBased().everyMinutes(10).create();
  return 'Revisión de pagos instalada (cada 10 min).';
}

// ▶ Ejecuta desde el editor: crea 20 códigos CDH de un solo uso para "Las Catacumbas de Nexotlan".
//   Quedan en la hoja "Codigos_Generados" (y en QR_Codigos). Puedes ejecutarla las veces que necesites.
function crearCodigosCatacumbas() {
  const r = generarCodigosProducto('dlc_catacumbas', 20);
  Logger.log(r);
  return r;
}