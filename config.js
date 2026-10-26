// ════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN GENERAL · Choque de Héroes TCG (Nexo de Héroes)
//  Un solo lugar para las direcciones de los servidores (Apps Script), hojas de cálculo,
//  formularios y Firebase. Si cambias una implementación o una hoja, edítala SOLO aquí
//  y sube CACHE_NAME en sw.js.
//  (Cada módulo conserva su dirección de siempre como respaldo si este archivo no cargara.)
// ════════════════════════════════════════════════════════════════════
(typeof window !== 'undefined' ? window : self).CHH_CONFIG = {
  // ── Apps Script (Implementar → aplicación web → URL que termina en /exec) ──
  heroPesos:    'https://script.google.com/macros/s/AKfycbwSrBH7yJiyTlPabzJ_WiXQDWPe7RpATmuTTWAe3uVRy6wuGh15QpuOMzSiZVixJK_S/exec', // Hero Pesos, Tienda digital, logros del Arcade, cuentas (PIN)
  ranking:      'https://script.google.com/macros/s/AKfycbx1rOqnmqWhics45UF40n81V9s-W5VgmhQGtc-UNIERGjkZGN8n1mVHkk0B1VO8PYJWOQ/exec', // Ranking global, resultados de torneos, director de torneo
  torneos:      'https://script.google.com/macros/s/AKfycbxQwDgsNe-toSWetc2f-xkveQcywfGwOVQvsOEySgRc2z8YZG09mB20jUjrI9qO1yo9Uw/exec', // Calendario e inscripciones
  academia:     'https://script.google.com/macros/s/AKfycbxC8MztvNoOUGya3uVNIlOCFrGEWZeAfyu0Qho7KpBchuJKzpFkPyUPMqY3vimwA3Wi/exec', // Academia Heroica y barajas del Constructor
  tiendaOnline: 'https://script.google.com/macros/s/AKfycby4_GOCEo7lM-5R5iVBCgvT-5a9gzB27-FkNP589ZzExSXooFtFZnoq7DMCnuCcds1R/exec', // Tienda Online (pedidos con Mercado Pago). Vacío = modo demostración
  mapaTiendas:  'https://script.google.com/macros/s/AKfycbxHm7PJh6st5eKZQuNB3dW49GuGphr2KLG_SJlST52w6CQFq871_hINdH0Wto0GztgoVQ/exec', // Mapa de tiendas

  // ── Hojas de cálculo (ID = la parte larga de la dirección de la hoja) ──
  hojaJugadores:  '1A3pMANjIop9IES2zseTrKImAkHPu2K56_iJJoiQzbxc',   // Registro de jugadores
  hojaTiendas:    '1ZtJhnXtTbttIf57gqfx81UtrG28hkWHjVaom218479o',   // Tiendas oficiales (pestaña "ID TIENDA")
  hojaResultados: '1cZ_cf7-y0ugtoI5Obr2lCxUrYwVLHGE8QKiInMSVwTA',   // Resultados de torneos (pestaña "Resultados")

  // ── Formularios de Google (dirección .../formResponse) ──
  formJugadores: 'https://docs.google.com/forms/d/e/1FAIpQLSfcWmHrkW4Z42S8-X9YUkOvqqQHiW6sdTtFL2Y8S81WnAa3eg/formResponse',
  formTiendas:   'https://docs.google.com/forms/d/e/1FAIpQLSfyzX4BIdswJPO-Kb3t8rO0P_KTR6bBRTCfCTvKmgUjGfoklw/formResponse',
  formTorneos:   'https://docs.google.com/forms/d/e/1FAIpQLSc7kOqlAgW8m7TJjaPHMkHnA7Z0s4rCYWERqnpiBDSru7nz5w/formResponse',

  // ── Firebase (Choque online y nube del Constructor) ──
  firebase: {
    apiKey: 'AIzaSyDif80xeOdjhJ2_-jcRwQK80bPqiVgzCPY',
    authDomain: 'choque-heroes-online.firebaseapp.com',
    databaseURL: 'https://choque-heroes-online-default-rtdb.firebaseio.com',
    projectId: 'choque-heroes-online',
    storageBucket: 'choque-heroes-online.firebasestorage.app',
    messagingSenderId: '701628192523',
    appId: '1:701628192523:web:98cc293ffb01b7dd33740e'
  }
};
