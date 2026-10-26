// ════════════════════════════════════════════════════════════════════════════
//  CHOQUE DE HÉROES · MODO ONLINE  (online.html = copia del simulador + este archivo)
//
//  · Salas privadas por código de 5 letras (Firebase Realtime Database).
//  · El ANFITRIÓN corre el motor completo del simulador. Su lado es "player".
//    El INVITADO ocupa el lado que normalmente juega la CPU ("cpu").
//  · Durante el turno del invitado, el anfitrión "voltea" la partida (swapFrame):
//    el invitado pasa a ser "player" para el motor y sus jugadas se ejecutan con las
//    mismas funciones que usa un jugador local. Al terminar su turno se voltea de regreso.
//  · El invitado no corre reglas: recibe el estado, lo dibuja desde su lado y envía
//    sus jugadas y respuestas. Las ventanas de decisión le llegan a su teléfono.
//  · Prueba sin internet: online.html?local=1 en dos pestañas del mismo navegador.
//
//  No modifica simulacion.html ni el Arcade.
// ════════════════════════════════════════════════════════════════════════════
(function () {
'use strict';
const ONLINE_VER = 'Online v1.3';
const FB_CFG = (window.CHH_CONFIG || {}).firebase || {
  apiKey: 'AIzaSyDif80xeOdjhJ2_-jcRwQK80bPqiVgzCPY',
  authDomain: 'choque-heroes-online.firebaseapp.com',
  databaseURL: 'https://choque-heroes-online-default-rtdb.firebaseio.com',
  projectId: 'choque-heroes-online',
  storageBucket: 'choque-heroes-online.firebasestorage.app',
  messagingSenderId: '701628192523',
  appId: '1:701628192523:web:98cc293ffb01b7dd33740e'
};
const FB_SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const QS = new URLSearchParams(location.search);
const LOCAL = QS.get('local') === '1';
const $ = id => document.getElementById(id);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Estado del módulo
const ON = window.ONLINE = {
  rol: null,          // 'host' | 'guest'
  code: null,
  swapped: false,     // anfitrión: true mientras juega el invitado (la partida está "volteada")
  remoto: 0,          // anfitrión: >0 mientras ejecuta una jugada del invitado
  jugando: false,
  nombre: '', rivalNombre: '', rivalDeck: null, rivalOnline: false
};

// ════════════════════════════════════
// TRANSPORTE  (Firebase o BroadcastChannel para pruebas locales)
// ════════════════════════════════════
const NET = { db: null, uid: null, off: 0, t0: 0, bc: null, subs: {}, estadoCb: null, infoCb: null, infoRef: null };
function cargarScript(src) {
  return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
}
async function netInit() {
  if (LOCAL) {
    NET.uid = 'L' + Math.random().toString(36).slice(2, 8);
    NET.bc = new BroadcastChannel('chh-online-local');
    NET.bc.onmessage = e => {
      const m = e.data; if (!m || m.code !== ON.code) return;
      if (m.canal === 'estado') { NET._ultEstado = m.v; NET.estadoCb && NET.estadoCb(m.v); return; }
      if (m.canal === 'info') { NET._info = Object.assign(NET._info || {}, m.v); NET.infoCb && NET.infoCb(NET._info); return; }
      (NET.subs[m.canal] || []).forEach(cb => cb(m.v));
    };
    return;
  }
  if (!window.firebase) {
    await cargarScript(FB_SDK + 'firebase-app-compat.js');
    await cargarScript(FB_SDK + 'firebase-auth-compat.js');
    await cargarScript(FB_SDK + 'firebase-database-compat.js');
  }
  if (!firebase.apps.length) firebase.initializeApp(FB_CFG);
  const cred = await firebase.auth().signInAnonymously();
  NET.uid = cred.user.uid;
  NET.db = firebase.database();
  await new Promise(r => NET.db.ref('.info/serverTimeOffset').once('value', s => { NET.off = s.val() || 0; r(); }));
}
const ahora = () => Date.now() + NET.off;
const ref = p => NET.db.ref('salas/' + ON.code + (p ? '/' + p : ''));
function limpio(o) { return JSON.parse(JSON.stringify(o)); }   // quita los 'undefined' (Firebase los rechaza)
function netSend(canal, msg) {
  msg = limpio(msg);
  if (LOCAL) { NET.bc.postMessage({ code: ON.code, canal, v: msg }); return; }
  msg.ts = firebase.database.ServerValue.TIMESTAMP;
  ref(canal).push(msg).catch(e => console.warn('online send', e));
}
function netOn(canal, cb) {
  (NET.subs[canal] = NET.subs[canal] || []).push(cb);
  if (LOCAL) return;
  NET.t0 = NET.t0 || ahora() - 3000;
  ref(canal).orderByChild('ts').startAt(NET.t0).on('child_added', s => {
    const v = s.val();
    try { if (v) cb(v); } finally { s.ref.remove().catch(() => {}); }   // leído = borrado
  });
}
function netSetEstado(str) {
  if (LOCAL) { NET.bc.postMessage({ code: ON.code, canal: 'estado', v: str }); return; }
  ref('estado').set(str).catch(e => console.warn('online estado', e));
}
function netOnEstado(cb) {
  NET.estadoCb = cb;
  if (LOCAL) { if (NET._ultEstado) cb(NET._ultEstado); return; }
  ref('estado').on('value', s => { const v = s.val(); if (v) cb(v); });
}
function netInfoSet(obj) {
  if (LOCAL) { NET._info = Object.assign(NET._info || {}, obj); NET.bc.postMessage({ code: ON.code, canal: 'info', v: obj }); NET.infoCb && NET.infoCb(NET._info); return Promise.resolve(); }
  return ref('info').update(limpio(obj));
}
function netOnInfo(cb) {
  NET.infoCb = cb;
  if (LOCAL) { if (NET._info) cb(NET._info); return; }
  ref('info').on('value', s => cb(s.val() || {}));
}
async function netInfoGet() {
  if (LOCAL) return NET._info || null;
  const s = await ref('info').once('value'); return s.val();
}
function netPresencia(campo) {
  if (LOCAL) { netInfoSet({ [campo]: true }); addEventListener('pagehide', () => netInfoSet({ [campo]: false })); return; }
  const r = ref('info/' + campo);
  NET.db.ref('.info/connected').on('value', s => {
    if (s.val() !== true) return;
    // El anfitrión corre la partida: si se va, la sala completa se borra sola en el servidor
    if (campo === 'hostOn') ref().onDisconnect().remove(); else r.onDisconnect().set(false);
    r.set(true);
  });
}
function netBorrarSala() { if (!LOCAL && NET.db && ON.code) { try { ref().remove(); } catch (e) {} } }

// ════════════════════════════════════
// SERIALIZAR EL ESTADO (con referencias: equipos → personajes, enlaces, etc.)
// ════════════════════════════════════
function ser(root) {
  const ids = new Map(); let n = 0;
  const enc = v => {
    if (v === null) return null;
    if (typeof v === 'function' || v === undefined) return undefined;
    if (typeof v !== 'object') return (typeof v === 'number' && !isFinite(v)) ? null : v;
    if (v instanceof Node) return undefined;
    if (ids.has(v)) return { $r: ids.get(v) };
    const id = ++n; ids.set(v, id);
    if (Array.isArray(v)) return { $i: id, $a: v.map(x => { const e = enc(x); return e === undefined ? null : e; }) };
    if (v instanceof Set) return { $i: id, $s: [...v].map(x => enc(x)) };
    const o = { $i: id };
    for (const k of Object.keys(v)) { const e = enc(v[k]); if (e !== undefined) o[k] = e; }
    return o;
  };
  return JSON.stringify(enc(root));
}
// Árbol con ids = ruta de la primera aparición, solo para objetos compartidos (equipos → personajes…)
function encTree(root) {
  const cuenta = new Map();
  const contar = v => {
    if (!v || typeof v !== 'object' || v instanceof Node) return;
    const c = cuenta.get(v) || 0; cuenta.set(v, c + 1); if (c) return;
    if (Array.isArray(v) || v instanceof Set) { for (const x of v) contar(x); return; }
    for (const k of Object.keys(v)) contar(v[k]);
  };
  contar(root);
  const ids = new Map();
  const enc = (v, ruta) => {
    if (v === null) return null;
    if (typeof v === 'function' || v === undefined) return undefined;
    if (typeof v !== 'object') return (typeof v === 'number' && !isFinite(v)) ? null : v;
    if (v instanceof Node) return undefined;
    if (ids.has(v)) return { $r: ids.get(v) };
    const comp = cuenta.get(v) > 1; if (comp) ids.set(v, ruta);
    let o;
    if (Array.isArray(v)) o = { $a: v.map((x, i) => { const e = enc(x, ruta + '/' + i); return e === undefined ? null : e; }) };
    else if (v instanceof Set) o = { $s: [...v].map((x, i) => enc(x, ruta + '/s' + i)) };
    else { o = {}; for (const k of Object.keys(v)) { const e = enc(v[k], ruta + '/' + k); if (e !== undefined) o[k] = e; } }
    if (comp) o.$i = ruta;
    return o;
  };
  return enc(root, '');
}
function decTree(t) {
  const byId = new Map(), pend = [];
  const dec = x => {
    if (x === null || typeof x !== 'object') return x;
    if ('$r' in x) { if (byId.has(x.$r)) return byId.get(x.$r); const ph = { __ref: x.$r }; pend.push(ph); return ph; }
    let o;
    if ('$a' in x) { o = []; if (x.$i != null) byId.set(x.$i, o); (x.$a || []).forEach(y => o.push(dec(y))); return o; }
    if ('$s' in x) { o = new Set(); if (x.$i != null) byId.set(x.$i, o); (x.$s || []).forEach(y => o.add(dec(y))); return o; }
    o = {}; if (x.$i != null) byId.set(x.$i, o);
    for (const k of Object.keys(x)) if (k !== '$i') o[k] = dec(x[k]);
    return o;
  };
  const r = dec(t);
  if (pend.length) {   // referencias hacia adelante (raro): se resuelven al final
    const fix = o => { if (!o || typeof o !== 'object') return; for (const k of Object.keys(o)) { const v = o[k]; if (v && v.__ref != null) o[k] = byId.get(v.__ref); else fix(v); } };
    fix(r);
  }
  return r;
}
const BORRAR = { $del: 1 };
function difTree(a, b, p, ops) {
  if (a === b) return;
  const obj = x => x !== null && typeof x === 'object';
  if (!obj(a) || !obj(b)) { ops.push([p, b]); return; }
  if ('$r' in a || '$r' in b) { if (a.$r !== b.$r) ops.push([p, b]); return; }
  if (('$a' in a) !== ('$a' in b) || ('$s' in a) !== ('$s' in b) || a.$i !== b.$i) { ops.push([p, b]); return; }
  if ('$s' in a) { if (JSON.stringify(a) !== JSON.stringify(b)) ops.push([p, b]); return; }
  if ('$a' in a) {
    const A = a.$a, B = b.$a;
    if (A.length !== B.length) { ops.push([p.concat('$a'), B]); return; }
    for (let i = 0; i < B.length; i++) difTree(A[i], B[i], p.concat('$a', i), ops);
    return;
  }
  for (const k of Object.keys(b)) { if (!(k in a)) ops.push([p.concat(k), b[k]]); else difTree(a[k], b[k], p.concat(k), ops); }
  for (const k of Object.keys(a)) if (!(k in b)) ops.push([p.concat(k), BORRAR]);
}
function aplicarDif(t, ops) {
  for (const [p, v] of ops) {
    if (!p.length) { t = v; continue; }
    let o = t;
    for (let i = 0; i < p.length - 1; i++) { o = o[p[i]]; if (o == null) throw new Error('ruta'); }
    const k = p[p.length - 1];
    if (v && v.$del) delete o[k]; else o[k] = v;
  }
  return t;
}
function des(str) {
  const byId = new Map();
  const dec = x => {
    if (x === null || typeof x !== 'object') return x;
    if ('$r' in x) return byId.get(x.$r);
    if ('$a' in x) { const a = []; byId.set(x.$i, a); x.$a.forEach(y => a.push(dec(y))); return a; }
    if ('$s' in x) { const s = new Set(); byId.set(x.$i, s); x.$s.forEach(y => s.add(dec(y))); return s; }
    const o = {}; byId.set(x.$i, o);
    for (const k of Object.keys(x)) if (k !== '$i') o[k] = dec(x[k]);
    return o;
  };
  return dec(JSON.parse(str));
}

// ════════════════════════════════════
// VOLTEAR LA PARTIDA: "player" ⇄ "cpu" en todo el estado (claves y valores)
// ════════════════════════════════════
function rl(s) {
  if (s === 'player') return 'cpu';
  if (s === 'cpu') return 'player';
  let m = /^(player|cpu)(:.*)$/.exec(s); if (m) return (m[1] === 'player' ? 'cpu' : 'player') + m[2];
  m = /^(.*-)(player|cpu)$/.exec(s); if (m) return m[1] + (m[2] === 'player' ? 'cpu' : 'player');
  return s;
}
function swapFrame(root) {
  const seen = new Set();
  const walk = o => {
    if (!o || typeof o !== 'object' || seen.has(o) || o instanceof Node) return;
    seen.add(o);
    if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) { const v = o[i]; if (typeof v === 'string') o[i] = rl(v); else walk(v); } return; }
    if (o instanceof Set) { const a = [...o]; o.clear(); a.forEach(v => { if (typeof v === 'string') o.add(rl(v)); else { walk(v); o.add(v); } }); return; }
    const ks = Object.keys(o);
    if (ks.some(k => rl(k) !== k)) { const ent = ks.map(k => [k, o[k]]); ks.forEach(k => delete o[k]); ent.forEach(([k, v]) => { o[rl(k)] = v; }); }
    for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') o[k] = rl(v); else walk(v); }
  };
  walk(root);
}
// ¿En qué teléfono está la persona que juega ese lado (del marco actual)?
const dev = side => ((side === 'player') !== ON.swapped) ? 'host' : 'guest';

// ════════════════════════════════════
// TEXTOS: el registro se escribe desde el punto de vista de quien juega el turno.
// Para el otro teléfono se "voltean" las frases más comunes.
// ════════════════════════════════════
const PARES = [
  ['tus personajes de ese sector ya no pueden atacar; la CPU puede atacar con ellos directo a tus corazones.', 'los personajes de la CPU en ese sector ya no pueden atacar; tú puedes atacar con ellos directo a los corazones de la CPU.'],
  ['tus llamados especiales están', 'los llamados especiales de la CPU están'], ['Este turno solo puedes', 'Este turno la CPU solo puede'],
  ['confina al azar tu ', 'confina al azar de la CPU '], ['no podrás', 'la CPU no podrá'], ['Pierdes', 'La CPU pierde'], ['pierdes', 'la CPU pierde'],
  ['los corazones de la CPU', 'tus corazones'], ['Solo podrás', 'La CPU solo podrá'], ['Solo puedes', 'La CPU solo puede'],
  ['Descartas', 'La CPU descarta'], ['descartas', 'la CPU descarta'], ['Tu sector ', 'Sector de la CPU '], ['no puedes', 'la CPU no puede'],
  ['No podrás', 'La CPU no podrá'], ['necesitas', 'la CPU necesita'], ['No tienes', 'La CPU no tiene'], ['el campo de la CPU', 'tu campo'],
  ['Confinas', 'La CPU confina'], ['Llamaste', 'La CPU llamó'], ['Retiras', 'La CPU retira'], ['Enlazas', 'La CPU enlaza'], ['Colocas', 'La CPU coloca'],
  ['Activas', 'La CPU activa'], ['Equipas', 'La CPU equipa'], ['Ganas', 'La CPU gana'], ['ganas', 'la CPU gana'], ['Pagas', 'La CPU paga'], ['pagas', 'la CPU paga'],
  ['robas', 'la CPU roba'], ['Robaste', 'La CPU robó'], ['TU TURNO', 'TURNO DEL RIVAL'], ['TU PRIMER TURNO', 'PRIMER TURNO DEL RIVAL'], [' (tuyo)', ' (rival)'],
  ['Tu turno', 'Turno del rival'], ['─── Fin de tu turno', '─── Fin del turno del rival'], ['tu BA', 'la BA del rival'], ['tu BP', 'la BP del rival'], ['tu mano', 'la mano del rival'],
  ['Tú sí podrás atacar', 'El rival sí podrá atacar']
].map(([a, b]) => [a, b]);
const _rx = new RegExp(PARES.flatMap(p => p).sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const _mapa = new Map(); PARES.forEach(([a, b]) => { _mapa.set(a, b); _mapa.set(b, a); });
function voltearTexto(t) { return String(t).replace(_rx, m => _mapa.get(m) ?? m); }
function sinCPU(t) {
  return String(t).replace(/\bde la CPU\b/g, 'del rival').replace(/\ba la CPU\b/g, 'al rival').replace(/\bLa CPU\b/g, 'El rival').replace(/\bla CPU\b/g, 'el rival').replace(/\(CPU\)/g, '(rival)').replace(/\bCPU\b/g, 'RIVAL');
}
// ¿El texto que se acaba de escribir es del punto de vista de este teléfono?
function textoPara(destino, t) {   // destino: 'host' | 'guest'
  const marcoEs = ON.swapped ? 'guest' : 'host';
  return sinCPU(marcoEs === destino ? t : voltearTexto(ocultarMano(t)));
}
// Mensajes escritos para quien juega el turno que revelan cartas que entran a SU mano:
// el rival solo ve cuántas.
const _nb = t => (String(t).match(/<b>[^<]*<\/b>/g) || []).length;
function ocultarMano(t) {
  t = String(t);
  t = t.replace(/^(💙|🃏) Robaste <b>[^<]*<\/b> de tu (BA|BP)\./, (m, ic, z) => ic + ' El rival robó una carta de su ' + z + '.');
  t = t.replace(/(: añade )((?:<b>[^<]*<\/b>(?:, )?)+)( a la mano)/, (m, a, nombres, b) => { const n = _nb(nombres); return a + (n === 1 ? 'una carta' : n + ' cartas') + b; });
  t = t.replace(/(mira \d+ cartas y añade )<b>[^<]*<\/b>( a la mano)/, '$1una$2');
  t = t.replace(/( toma )<b>[^<]*<\/b>( del tope de la BP)/, '$1una carta$2');
  return t;
}

// ════════════════════════════════════
// LOBBY
// ════════════════════════════════════
function nombreSesion() {
  try { const s = JSON.parse(localStorage.getItem('nhSesion') || 'null'); if (s && s.tipo !== 'tienda') return String(s.nick || s.nombre || s.id || '').trim(); } catch (e) {}
  try { return localStorage.getItem('chh_online_nombre') || ''; } catch (e) { return ''; }
}
function generarCodigo() { const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += L[Math.random() * L.length | 0]; return s; }
function lobbyCSS() {
  const st = document.createElement('style');
  st.textContent = `
  #onLobby{width:100%;max-width:440px;display:flex;flex-direction:column;gap:8px;grid-area:btn}
  #onLobby .on-row{display:flex;gap:6px}
  #onLobby input{flex:1;min-width:0;height:40px;border-radius:9px;border:1px solid rgba(255,209,102,.4);background:rgba(0,0,0,.45);color:#fff;
    font:700 15px 'Rajdhani',sans-serif;padding:0 12px;text-align:center;letter-spacing:1px}
  #onLobby input#onCode{font-family:'Orbitron',sans-serif;letter-spacing:6px;text-transform:uppercase;font-size:16px}
  #onLobby .on-b{height:42px;border-radius:9px;border:1px solid rgba(255,209,102,.5);background:rgba(10,8,4,.85);color:#ffd166;cursor:pointer;
    font:900 11px 'Orbitron',sans-serif;letter-spacing:1.5px;padding:0 12px;flex:1}
  #onLobby .on-b.gold{background:linear-gradient(135deg,#fff1c4,#ffd166 35%,#f5a623 75%,#b8730a);color:#120c02;border:none}
  #onLobby .on-b:disabled{opacity:.35}
  #onSala{display:none;text-align:center;padding:10px;border-radius:12px;border:1px solid rgba(0,207,255,.35);background:rgba(0,207,255,.06)}
  #onSala .cod{font:900 30px 'Orbitron',sans-serif;letter-spacing:10px;color:#fff;text-shadow:0 0 14px rgba(0,207,255,.7);margin:2px 0 4px}
  #onSala .est{font-size:14px;font-weight:600;color:#cfe;line-height:1.35}
  #onSala .est b{color:#ffd166}
  .on-tag{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:950;font:700 10px 'Orbitron',sans-serif;letter-spacing:1px;
    padding:4px 10px;border-radius:20px;background:rgba(0,0,0,.75);border:1px solid rgba(0,207,255,.5);color:#bff;pointer-events:none}
  .on-tag.off{border-color:#ff2244;color:#ffb3bf}
  .on-wait{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);z-index:70;pointer-events:none;font:700 11px 'Orbitron',sans-serif;letter-spacing:1px;
    color:#ffd166;background:rgba(0,0,0,.72);border:1px solid rgba(255,209,102,.45);border-radius:20px;padding:4px 12px;display:none}
  `;
  document.head.appendChild(st);
}
function montarLobby() {
  lobbyCSS();
  const card = document.querySelector('#bootScreen .boot-card');
  const sub = card.querySelector('.boot-sub'); if (sub) sub.innerHTML = 'MODO ONLINE · <span id="simVer2">' + ONLINE_VER + '</span>' + (LOCAL ? ' · PRUEBA LOCAL' : '');
  // Solo tu baraja: el rival elige la suya en su teléfono
  const ds = $('deckSel'); if (ds) { const c = $('dsCpu'); if (c) { c.style.display = 'none'; const l = c.previousElementSibling; if (l && l.classList.contains('ds-lbl')) l.style.display = 'none'; } }
  const vs = $('bootVs'); if (vs) vs.style.display = 'none';
  const btn = $('bootBtn'); btn.style.display = 'none';
  const note = $('bootNote'); if (note) note.textContent = 'Comparte el código con tu rival. Los dos necesitan internet.';
  const box = document.createElement('div'); box.id = 'onLobby';
  box.innerHTML =
    '<div class="on-row"><input id="onNombre" maxlength="18" placeholder="Tu nombre"></div>' +
    '<div class="on-row"><button class="on-b gold" id="onCrear">🏟 CREAR SALA</button></div>' +
    '<div class="on-row"><input id="onCode" maxlength="5" placeholder="CÓDIGO" autocomplete="off"><button class="on-b" id="onUnir">🔗 UNIRME</button></div>' +
    '<div id="onSala"><div class="est" id="onSalaTit">SALA</div><div class="cod" id="onSalaCod">·····</div><div class="est" id="onSalaEst"></div>' +
    '<div class="on-row" style="margin-top:8px"><button class="on-b gold" id="onJugar" style="display:none">⚔ INICIAR CHOQUE</button><button class="on-b" id="onSalir">✕ SALIR DE LA SALA</button></div></div>';
  btn.parentNode.insertBefore(box, btn);
  $('onNombre').value = nombreSesion();
  $('onCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  $('onCrear').onclick = () => crearSala().catch(errLobby);
  $('onUnir').onclick = () => unirseSala().catch(errLobby);
  $('onSalir').onclick = () => { if (ON.rol === 'host') netBorrarSala(); sessionStorage.removeItem('chh_online_sala'); location.href = 'online.html' + (LOCAL ? '?local=1' : ''); };
  $('onJugar').onclick = () => hostIniciar();
  const prev = sessionStorage.getItem('chh_online_sala');   // regresar a la sala tras recargar
  if (prev) { try { const p = JSON.parse(prev); if (p.rol === 'guest') { $('onCode').value = p.code; } } catch (e) {} }
}
function errLobby(e) {
  console.error(e);
  estadoLobby('⚠ ' + esc(e && e.message || 'No se pudo conectar') + '. Revisa tu internet. <a href="#" onclick="location.reload();return false" style="color:#ffd166">Reintentar</a>');
}
function estadoLobby(t) { const s = $('bootStatus'); if (s) s.innerHTML = t; }
function bloquearLobby(v) { ['onCrear', 'onUnir', 'onNombre', 'onCode'].forEach(id => { const e = $(id); if (e) e.disabled = v; }); }
function miNombre() { const n = ($('onNombre').value || '').trim() || 'Jugador'; try { localStorage.setItem('chh_online_nombre', n); } catch (e) {} return n.slice(0, 18); }
function miBaraja() {
  const b = deckById(DSEL.jugador) || DATA.barajas.find(x => !x._error);
  return JSON.parse(JSON.stringify(b));
}
function mostrarSala(tit, est) { $('onSala').style.display = 'block'; $('onSalaTit').textContent = tit; $('onSalaCod').textContent = ON.code; $('onSalaEst').innerHTML = est; }

function gesto() { try { getAC(); } catch (e) {} try { enterLandscape(); } catch (e) {} }
async function crearSala() {
  gesto();
  bloquearLobby(true); estadoLobby('Conectando…');
  ON.nombre = miNombre();
  await netInit();
  ON.rol = 'host';
  for (let k = 0; k < 6; k++) {
    ON.code = generarCodigo();
    const ya = await netInfoGet();
    if (!ya) break;
  }
  await netInfoSet({ host: ON.nombre, hostUid: NET.uid, guest: null, guestUid: null, estado: 'esperando', creada: LOCAL ? Date.now() : firebase.database.ServerValue.TIMESTAMP, ver: ONLINE_VER });
  netPresencia('hostOn');
  sessionStorage.setItem('chh_online_sala', JSON.stringify({ rol: 'host', code: ON.code }));
  mostrarSala('TU SALA · comparte este código', 'Esperando a que tu rival se una…');
  estadoLobby('Sala creada');
  let _visto = false, _fuera = null;
  netOnInfo(info => {
    const antes = ON.rivalOnline;
    ON.rivalOnline = !!info.guestOn;
    if (ON.rivalOnline) _visto = true;
    if (info.guest && !ON.jugando) {
      ON.rivalNombre = info.guest;
      if (ON.rivalOnline || !_visto) {
        mostrarSala('TU SALA', '⚔ <b>' + esc(info.guest) + '</b> se unió con <b>' + esc(info.guestDeckNombre || 'su baraja') + '</b>.<br>Toca INICIAR cuando estén listos.');
        $('onJugar').style.display = '';
      } else {
        mostrarSala('TU SALA', '⚠ <b>' + esc(info.guest) + '</b> salió de la sala. Espera a que vuelva a entrar o comparte el código con otro rival.');
        $('onJugar').style.display = 'none';
      }
    }
    marcaConexion();
    // Durante la partida: aviso y 60 s para regresar; si no, gana el anfitrión por abandono
    if (ON.jugando && G && !G.over && _visto) {
      if (!ON.rivalOnline && antes !== false) {
        lg('📡 ' + esc(ON.rivalNombre || 'Tu rival') + ' se desconectó. Tiene 60 segundos para regresar.', 'var(--red)');
        avisoRival(60);
        clearTimeout(_fuera);
        _fuera = setTimeout(() => { if (!ON.rivalOnline) finPorAbandono(true, (ON.rivalNombre || 'Tu rival') + ' se desconectó y no regresó'); }, 60000);
      } else if (ON.rivalOnline && antes === false) {
        clearTimeout(_fuera); avisoRival(null);
        lg('📶 ' + esc(ON.rivalNombre || 'Tu rival') + ' regresó a la partida.', 'var(--green)');
        enviarEstado(true);
      }
    }
  });
  netOn('g2h', m => hostRecibe(m));
}
async function unirseSala() {
  const code = ($('onCode').value || '').trim().toUpperCase();
  if (code.length !== 5) { estadoLobby('Escribe el código de 5 letras que te compartió tu rival.'); return; }
  gesto();
  bloquearLobby(true); estadoLobby('Conectando…');
  ON.nombre = miNombre();
  await netInit();
  ON.code = code; ON.rol = 'guest';
  if (!LOCAL) {
    const info = await netInfoGet();
    if (!info) { bloquearLobby(false); estadoLobby('⚠ No existe una sala con el código <b>' + esc(code) + '</b>.'); return; }
    if (info.guestUid && info.guestUid !== NET.uid && info.estado !== 'esperando') { bloquearLobby(false); estadoLobby('⚠ Esa sala ya tiene dos jugadores.'); return; }
  }
  const b = miBaraja();
  ON.miDeck = b;
  await netInfoSet({ guest: ON.nombre, guestUid: NET.uid, guestDeckNombre: b.nombre, guestDeck: JSON.stringify(b) });
  netPresencia('guestOn');
  sessionStorage.setItem('chh_online_sala', JSON.stringify({ rol: 'guest', code }));
  mostrarSala('SALA ' + code, 'Te uniste. Esperando a que el anfitrión inicie el choque…');
  let _sinHost = null;
  netOnInfo(info => {
    ON.rivalOnline = !!info.hostOn; if (info.host) ON.rivalNombre = info.host; marcaConexion();
    clearTimeout(_sinHost);
    if (!info.hostOn && ON.jugando && G && !G.over) {
      avisoRival(60);
      _sinHost = setTimeout(() => {
        if (!G || G.over || ON.rivalOnline) return;
        finPorAbandono(true, (ON.rivalNombre || 'El anfitrión') + ' se desconectó y la partida terminó');
      }, 60000);
    } else if (info.hostOn) avisoRival(null);
    if (!ON.jugando && info.hostOn) ON._hostVisto = true;
    if (!ON.jugando && ON._hostVisto && !info.hostOn) mostrarSala('SALA ' + ON.code, '⚠ El anfitrión cerró la sala. Pídele un código nuevo.');
  });
  netOn('h2g', m => guestRecibe(m));
  netSend('g2h', { t: 'hola' });
}

// ════════════════════════════════════
// ANFITRIÓN
// ════════════════════════════════════
let _sendT = null, _askN = 0;
const PEND = new Map();
function enviar(m) { netSend('h2g', m); }
let _ultTree = null, _seq = 0, _forzarCompleto = true, _desdeCompleto = 0;
ON.stats = { completos: 0, cambios: 0, bytes: 0 };
function enviarEstado(completo) {
  if (ON.rol !== 'host' || !G) return;
  if (completo) _forzarCompleto = true;
  clearTimeout(_sendT);
  _sendT = setTimeout(() => {
    if (!G) return;
    let t;
    if (ON.swapped) t = encTree(G); else { swapFrame(G); try { t = encTree(G); } finally { swapFrame(G); } }
    const meta = { host: ON.nombre, guest: ON.rivalNombre };
    if (_forzarCompleto || !_ultTree || _desdeCompleto >= 60) {
      const g = JSON.stringify(t);
      enviar({ t: 'full', s: ++_seq, g, m: meta });
      ON.stats.completos++; ON.stats.bytes += g.length;
      _forzarCompleto = false; _desdeCompleto = 0;
    } else {
      const ops = []; difTree(_ultTree, t, [], ops);
      if (!ops.length) { _ultTree = t; return; }
      const o = JSON.stringify(ops);
      enviar({ t: 'd', s: ++_seq, o });
      ON.stats.cambios++; ON.stats.bytes += o.length; _desdeCompleto++;
    }
    _ultTree = t;
  }, 220);
}
function preguntar(kind, p, porDefecto, ms) {
  const id = ++_askN;
  return new Promise(res => {
    const t = setTimeout(() => { if (PEND.has(id)) { PEND.delete(id); lg('⏱ El rival tardó demasiado en responder; se tomó la opción por defecto.', 'var(--muted)'); res(porDefecto); } }, ms || 150000);
    PEND.set(id, { res: v => { clearTimeout(t); res(v); }, kind, p });
    enviar({ t: 'ask', id, kind, p });
    esperaUI(true);
  });
}
function esperaUI(v) {
  let w = $('onWait');
  if (!w) { w = document.createElement('div'); w.id = 'onWait'; w.className = 'on-wait'; const b = $('board'); if (b) b.appendChild(w); }
  w.textContent = '⏳ ESPERANDO A ' + (ON.rivalNombre || 'TU RIVAL').toUpperCase() + '…';
  w.style.display = v ? 'block' : 'none';
}
const _cola = [];
let _colaOn = false;
function hostRecibe(m) {
  if (!m) return;
  if (m.t === 'hola') { if (LOCAL) netInfoSet({ hostOn: true }); enviarEstado(true); PEND.forEach((x, id) => enviar({ t: 'ask', id, kind: x.kind, p: x.p })); if (G && G.over) enviar({ t: 'fin', won: !!ON.finGuestGana, r: ON.finTexto || '' }); return; }
  if (m.t === 'ans') { const p = PEND.get(m.id); if (p) { PEND.delete(m.id); if (!PEND.size) esperaUI(false); p.res(m.v); } return; }
  if (m.t === 'abandono') { finPorAbandono(true); return; }
  if (m.t === 'cmd') { esperaUI(PEND.size > 0); _cola.push(m); if (!_colaOn) procesarCola(); return; }
}
// Funciones que el invitado puede pedir durante SU turno
const CMDS = ['drawBA', 'drawBP', 'mainAction', 'doAlma', 'doApoyo', 'doArena', 'doSector', 'callFromHand', 'doSpecialCall', 'useAbility',
  'playerAttack', 'directAttack', 'oblivionAtaque', 'confirmDiscard', 'startOfrenda', 'goToCombat', 'endTurn'];
async function procesarCola() {
  _colaOn = true;
  while (_cola.length) {
    const m = _cola.shift();
    try {
      if (!G || G.over || !ON.swapped || G.active !== 'player' || !CMDS.includes(m.fn)) continue;
      let args = m.args || [];
      if (m.fn === 'useAbility') { const [o, cid, i, src] = args; const e = (C[cid].efectos || [])[i]; if (!e) continue; args = [o, cid, e, i, src]; }
      if (m.fn === 'confirmDiscard') { _discardSel = (m.sel || []).slice(); }
      ON.remoto++; ON._ultCmd = m.fn + ' ' + JSON.stringify(m.args || []).slice(0, 80);
      try { await REAL[m.fn](...args); } finally { ON.remoto--; ON._ultCmd += ' ✓'; }
      renderAll();
    } catch (e) { console.error('online cmd', m, e); }
  }
  _colaOn = false;
}
const REAL = {};
ON._dbg = () => ({ pend: [...PEND.entries()].map(([k, v]) => [k, v.kind]), cola: _cola.length, colaOn: _colaOn, swapped: ON.swapped, remoto: ON.remoto, ultimo: ON._ultCmd });

function hostIniciar() {
  netInfoGet().then(info => {
    if (!info || !info.guest) { mostrarSala('TU SALA', 'Aún no se une nadie.'); return; }
    let deck = null; try { deck = JSON.parse(info.guestDeck || 'null'); } catch (e) {}
    if (!deck) { mostrarSala('TU SALA', '⚠ No llegó la baraja de tu rival. Pídele que salga y vuelva a entrar.'); return; }
    deck.id = 'online_rival';
    DATA.barajasArcade = (DATA.barajasArcade || []).filter(b => b.id !== 'online_rival').concat([deck]);
    DSEL.cpu = 'online_rival';
    ON.rivalDeck = deck; ON.rivalNombre = info.guest;
    ON.jugando = true;
    netInfoSet({ estado: 'jugando' });
    (async () => { try { await enterLandscape(); } catch (e) {} })();
    $('bootScreen').classList.add('hide');
    ON.swapped = false;
    initGame();
    try { checkOrientation(); } catch (e) {}
  });
}

// ── Parches del motor (solo en el anfitrión) ──
function parchesHost() {
  // 1) Dibujar siempre desde el lado del anfitrión
  let _rd = 0, _tmp = false;
  const vista = fn => function () {
    if (!ON.swapped || _rd > 0 || _tmp || !G) return fn.apply(this, arguments);
    _rd++; swapFrame(G); const a = ATK_SLOT; ATK_SLOT = null;
    try { return fn.apply(this, arguments); } finally { ATK_SLOT = a; swapFrame(G); _rd--; }
  };
  ['renderAll', 'renderUI', 'renderHP', 'renderApos', 'renderPJs', 'renderSects', 'renderHand', 'renderCPUHand', 'renderDecks'].forEach(n => {
    if (typeof window[n] === 'function') window[n] = vista(window[n]);
  });
  { const _ra = window.renderAll; window.renderAll = function () { const r = _ra.apply(this, arguments); enviarEstado(); return r; }; }
  // Toques del anfitrión mientras juega el invitado: solo para ver (la partida se ve desde su lado y no es su turno)
  const fuera = () => { if (_tmp) { _tmp = false; swapFrame(G); } };
  document.addEventListener('click', e => {
    if (!ON.swapped || !G || ON.remoto || _tmp) return;
    if (e.target.closest('#chooseModal,#bsModal,#sectorModal,#discardModal,#combatMod,#epConfirm,#endgameModal,#dsList,.mp-panel,#mpPanel')) return;
    _tmp = true; swapFrame(G); setTimeout(fuera, 0);
  }, true);
  window.addEventListener('click', fuera, false);
  // Animaciones (robo, ataque, daño…) apuntan a ids del marco volteado: se reflejan al lado correcto
  const rid = id => {
    if (typeof id !== 'string') return id;
    if (id === 'handrow') return 'cpuhand';
    if (id === 'cpuhand') return 'handrow';
    let m = /^player(.*)$/.exec(id); if (m) return 'cpu' + m[1];
    m = /^cpu(.*)$/.exec(id); if (m) return 'player' + m[1];
    m = /^p([A-Z].*)$/.exec(id); if (m) return 'c' + m[1];
    m = /^c([A-Z].*)$/.exec(id); if (m) return 'p' + m[1];
    return id;
  };
  const refl = (n, idx) => {
    const f = window[n]; if (typeof f !== 'function') return;
    window[n] = function () { const a = [...arguments]; if (ON.swapped && !_tmp) idx.forEach(i => { a[i] = rid(a[i]); }); return f.apply(this, a); };
  };
  refl('fxFly', [0, 1]); refl('fxNum', [0]); refl('fxHit', [0]);
  refl('animDestroy', [0]); refl('animCall', [0]); refl('animAttack', [0]); refl('animDefeated', [0]);
  { const f = window.fxMictlan; if (f) window.fxMictlan = function (o, xs) { return f.call(this, (ON.swapped && !_tmp) ? rl(o) : o, xs); }; }
  // 2) Ventanas de decisión: van al teléfono de quien decide
  const _ask = window.askChoice, _pick = window.pickCards;
  window.askChoice = (t, opts) => dev('player') === 'host' ? _ask(sinCPU(t), opts.map(sinCPU)) : preguntar('choice', { t: textoPara('guest', t), opts: opts.map(o => textoPara('guest', o)) }, null);
  window.pickCards = a => dev('player') === 'host' ? _pick(a) : preguntar('pick', { title: a.title, sub: a.sub, items: a.items, min: a.min ?? 1, max: a.max ?? 1, ok: a.ok, info: a.info }, null);
  ON.askDe = (side, t, opts) => dev(side) === 'host' ? _ask(textoPara('host', t), opts.map(o => textoPara('host', o))) : preguntar('choice', { t: textoPara('guest', t), opts: opts.map(o => textoPara('guest', o)) }, null);
  ON.pickDe = (side, a) => dev(side) === 'host' ? _pick(a) : preguntar('pick', a, null);
  // choose(): cuando decide el lado "cpu", ahora es una persona
  const _choose = window.choose;
  window.choose = async function (ctx, list, n, opts) {
    opts = opts || {};
    if (!ctx || ctx.interactive || ctx.o !== 'cpu' || !list || !list.length) return _choose.apply(this, arguments);
    n = Math.min(n, list.length);
    const min = opts.min ?? n;
    if (n >= list.length && min >= list.length) return list.slice(0, n);
    const it = {
      title: opts.title || (C[ctx.cid] ? C[ctx.cid].name.toUpperCase() : 'ELIGE'), sub: opts.sub, max: n, min,
      items: list.map(x => ({ cid: x.cid, tag: (x.o && x.o !== ctx.o ? 'RIVAL · ' : '') + (SRC_NOM[x.z] || x.z || '').toUpperCase(),
        note: (isChar(x.cid) ? (C[x.cid].type === 'amalgama' ? '✦ Gama ' + C[x.cid].gama : '◆ Valor ' + C[x.cid].cost) : '') }))
    };
    const r = await ON.pickDe('cpu', it);
    if (!r || !r.length) return min ? _choose.apply(this, arguments) : [];
    return r.map(k => list[k]).filter(Boolean);
  };
  // Respuestas (cartas rápidas, negaciones): las decide la persona de ese lado
  const _offer = window.offerResponses;
  window.offerResponses = async function (ev) {
    const r = opp(ev.o);
    if (G._noNeg) return;
    if (C[ev.cid] && C[ev.cid].noNeg && ev.kind === 'activacion') { lg('💎 <b>' + C[ev.cid].name + '</b>: su efecto no puede ser negado.', 'var(--muted)'); return; }
    const opts = responsesFor(r, ev);
    if (!opts.length) return;
    if (G.skipResp === turnKey() + ':' + r) return;
    const i = await ON.askDe(r, '⛓ ' + evDesc(ev) + '.' + (C[ev.cid] && C[ev.cid].costoNegar ? '<br><b style="color:#ff4d6d">Para negarla debes pagar ' + C[ev.cid].costoNegar + ' corazones.</b>' : '') + '<br>¿Respondes?',
      [...opts.map(x => x.label), '➡ Pasar', '⏭ Pasar todo este turno']);
    if (i == null || i === opts.length) return;
    if (i === opts.length + 1) { G.skipResp = turnKey() + ':' + r; return; }
    const pick = opts[i];
    if (pick && G && !G.over) await pick.run();
  };
  // 3) Turnos
  window.cpuTurn = () => {};                       // nunca juega la IA
  window.finishTurn = function () {
    showBanner('cpu', 'FIN DE TURNO', 'TURNO DEL RIVAL', 1400);
    G.phase = 'end'; G.active = 'cpu';          // ('cpu' como nombre de fase se voltearía con la partida)
    G.used = { player: {}, cpu: {} };
    renderAll();
    later(pasarTurno, 1500);
  };
  window.openDiscardModal = (function (_o) {
    return function (endOfTurn) {
      if (dev('player') === 'host') return _o.apply(this, arguments);
      _discardEndTurn = !!endOfTurn; _discardSel = [];
      enviar({ t: 'descarte', fin: !!endOfTurn });
      esperaUI(true);
    };
  })(window.openDiscardModal);
  window.playerAttack = async function (as, ds) {
    const res = await battle('player', as, ds);
    renderAll();
    if (!res || !G || G.over) return;
    const f = res.first;
    const datos = { html: res.html, a: f && f.a, d: f && f.d };
    if (dev('player') === 'host') {
      mostrarCombate(datos);
      await new Promise(r => { _combatClose = r; });
      enviar({ t: 'combate', d: Object.assign({}, datos, { html: textoPara('guest', datos.html) }), ver: true });
    } else {
      await preguntar('combate', Object.assign({}, datos, { html: textoPara('guest', datos.html) }), true, 60000);
      lg(textoPara('host', res.html.replace(/<br>$/, '')), 'var(--text)');
    }
    await afterBattle('player', as, res);
  };
  // 4) Fin de la partida: quién ganó de verdad
  const _eg = window.endGame;
  window.endGame = function (won, reason) {
    if (!G || G.over) return;
    const hostGana = dev(won ? 'player' : 'cpu') === 'host';
    ON.finGuestGana = !hostGana;
    ON.finTexto = textoPara('guest', reason || '');
    enviar({ t: 'fin', won: !hostGana, r: ON.finTexto });
    netInfoSet({ estado: 'fin' });
    if (ON.swapped) { swapFrame(G); ON.swapped = false; }
    return _eg.call(this, hostGana, textoPara('host', reason || ''));
  };
  // 5) Registro, cintillos y sonidos también en el teléfono del rival
  const _lg = window.lg;
  window.lg = function (msg, col) {
    if (ON.rol !== 'host' || !ON.jugando) return _lg(msg, col);
    _lg(textoPara('host', msg), col);
    enviar({ t: 'lg', m: textoPara('guest', msg), c: col });
  };
  const _ban = window.showBanner;
  window.showBanner = function (type, top, main, dur, fase) {
    if (!ON.jugando) return _ban.apply(this, arguments);
    const vol = (t) => t === 'player' ? 'cpu' : t === 'cpu' ? 'player' : t;
    const paraHost = ON.swapped ? [vol(type), voltearTexto(top), voltearTexto(main)] : [type, top, main];
    const paraGuest = ON.swapped ? [type, top, main] : [vol(type), voltearTexto(top), voltearTexto(main)];
    enviar({ t: 'ban', a: [paraGuest[0], sinCPU(paraGuest[1]), sinCPU(paraGuest[2]), dur, !!fase] });
    return _ban.call(this, paraHost[0], sinCPU(paraHost[1]), sinCPU(paraHost[2]), dur, fase);
  };
  const _snd = window.playSound;
  window.playSound = function (s) { if (ON.jugando) enviar({ t: 'snd', s }); return _snd.apply(this, arguments); };
  window.who = o => o === 'player' ? ' (tuyo)' : ' (rival)';
  // 6) Botones del anfitrión que no aplican mientras juega el invitado
  CMDS.forEach(n => { REAL[n] = window[n]; });
  CMDS.forEach(n => {
    const f = window[n];
    window[n] = function () { if (ON.swapped && !ON.remoto) return; return f.apply(this, arguments); };
  });
  window.restartGame = function () { if (!ON.jugando) return; ON.finGuestGana = null; ON.swapped = false; enviar({ t: 'revancha' }); netInfoSet({ estado: 'jugando' }); _forzarCompleto = true; initGame(); };
  window.showDeckSelect = () => { netBorrarSala(); sessionStorage.removeItem('chh_online_sala'); location.href = 'online.html' + (LOCAL ? '?local=1' : ''); };
  window.sorteoInicio = sorteoOnline;
  addEventListener('pagehide', () => { if (!G || G.over) netBorrarSala(); });
  window.salirPartida = function (ev, a) {
    ev.preventDefault();
    if (!G || G.over) { location.href = 'online.html' + (LOCAL ? '?local=1' : ''); return false; }
    ventanaConfirmar('¿ABANDONAR LA PARTIDA?', 'Abandonar cuenta como <b>DERROTA</b> y tu rival gana.', '🚪 SÍ, ABANDONAR', '↩ SEGUIR JUGANDO', '⚠️').then(ok => {
      if (!ok) return; enviar({ t: 'abandono' }); finPorAbandono(false); setTimeout(() => { netBorrarSala(); sessionStorage.removeItem('chh_online_sala'); location.href = 'online.html' + (LOCAL ? '?local=1' : ''); }, 900);
    });
    return false;
  };
}
function mostrarCombate(d) {
  if (d.a) {
    $('cb-ai').src = C[d.a.id].img; $('cb-an').textContent = C[d.a.id].name;
    $('cb-as').innerHTML = '<span style="color:var(--orange)">⚔' + d.a.f + '</span> <span style="color:var(--ac)">🛡' + d.a.r + '</span>';
  }
  if (d.d) {
    $('cb-di').src = C[d.d.id].img; $('cb-dn').textContent = C[d.d.id].name;
    $('cb-ds').innerHTML = '<span style="color:var(--orange)">⚔' + d.d.f + '</span> <span style="color:var(--ac)">🛡' + d.d.r + '</span>';
  }
  $('cb-log').innerHTML = d.html || '';
  $('combatMod').classList.add('show');
  try { shakeBoard(); } catch (e) {}
}
// Cambio de turno: se voltea la partida y empieza el turno del otro jugador
function pasarTurno() {
  if (!G || G.over) return;
  swapFrame(G); ON.swapped = !ON.swapped;
  esperaUI(false);
  const P = G.cpu;
  P.pj.forEach(p => { if (p) { p.res = p.resB; p.attacked = false; p.resting = wake(p); } });
  G.player.pj.forEach(p => { if (p) p.resting = wake(p); });
  tickTurn();
  if (!ON.swapped) G.turn++;
  G.active = 'player';
  G.callsLeft = R.llamadosPorTurno; G.almaUsed = false;
  G.drewBA = false; G.drewBP = false;
  G.used = { player: {}, cpu: {} };
  ATK_SLOT = null;
  showBanner('player', 'T' + G.turn, 'TU TURNO', 1400);
  torturaInicio('player'); if (checkEnd()) return;
  const primeroDelSegundo = G.first === 'cpu' && G.turn === (ON.swapped ? 1 : 2);
  if (primeroDelSegundo) {
    G.phase = 'draw'; faseBanner('player', 'draw');
    lg('─── T' + G.turn + ' · <b>TU PRIMER TURNO</b> · Roba cartas. Ya puedes declarar batalla. ───', 'var(--gold)');
  } else if (ofrendaNegada('player')) {
    G.phase = 'draw'; faseBanner('player', 'draw');
    lg('─── T' + G.turn + ' · <b>TU TURNO</b> · Fase de Ofrenda negada. Roba cartas. ───', 'var(--gold)');
  } else if (almaT('player') <= R.ofrendaSiAlmasMenorIgual) {
    G.phase = 'ofrenda'; faseBanner('player', 'ofrenda');
    lg('─── T' + G.turn + ' · <b>TU TURNO</b> · <b>FASE DE OFRENDA</b> (almas: ' + almaT('player') + ' ≤ ' + R.ofrendaSiAlmasMenorIgual + '). Presiona el botón. ───', 'var(--gold)');
  } else {
    G.phase = 'draw'; faseBanner('player', 'draw');
    lg('─── T' + G.turn + ' · <b>TU TURNO</b> · Ofrenda cancelada (' + almaT('player') + ' almas). Roba cartas. ───', 'var(--gold)');
  }
  renderAll();
}
// Sorteo: el que gana el dado decide quién empieza (la persona, no la IA)
async function sorteoOnline() {
  const g = GEN, vivo = () => g === GEN && G && !G.over, W = ms => new Promise(r => setTimeout(r, ms));
  const m = sorteoUI(), dp = $('dadoP'), dc = $('dadoC'), msg = $('sorteoMsg');
  $('dadoCNom').textContent = (ON.rivalNombre || 'RIVAL').toUpperCase();
  [dp, dc].forEach(d => d.classList.remove('gana', 'pierde'));
  msg.textContent = 'Tirando los dados…'; m.classList.add('show');
  let a, b;
  do {
    const t0 = Date.now();
    while (Date.now() - t0 < 1100) { dp.textContent = DADO[Math.random() * 6 | 0]; dc.textContent = DADO[Math.random() * 6 | 0]; await W(70); if (!vivo()) { m.classList.remove('show'); return; } }
    a = 1 + (Math.random() * 6 | 0); b = 1 + (Math.random() * 6 | 0);
    dp.textContent = DADO[a - 1]; dc.textContent = DADO[b - 1];
    enviar({ t: 'dados', a: b, b: a });
    if (a === b) { msg.textContent = 'Empate (' + a + ' y ' + b + '). Se vuelve a tirar…'; await W(1100); if (!vivo()) { m.classList.remove('show'); return; } }
  } while (a === b);
  const ganaHost = a > b;
  dp.classList.add(ganaHost ? 'gana' : 'pierde'); dc.classList.add(ganaHost ? 'pierde' : 'gana');
  lg('🎲 <b>Sorteo de inicio</b>: tú sacas <b>' + a + '</b>, el rival saca <b>' + b + '</b>.', 'var(--gold2)');
  let empiezaHost;
  const q = '🎲 GANASTE EL DADO<br><small style="font-weight:600;opacity:.85">Quien inicia juega primero, pero no puede declarar batalla en su primer turno.</small>';
  if (ganaHost) {
    msg.innerHTML = '<b style="color:var(--green)">¡Ganas el dado!</b> Tú decides quién empieza.';
    await W(900); if (!vivo()) return; m.classList.remove('show');
    const i = await ON.askDe('player', q, ['⚔ EMPIEZO YO', '🛡 QUE EMPIECE EL RIVAL']);
    if (!vivo()) return; empiezaHost = i !== 1;
  } else {
    msg.innerHTML = '<b style="color:var(--red)">' + esc(ON.rivalNombre || 'El rival') + ' gana el dado</b> y decide quién empieza…';
    await W(900); if (!vivo()) return;
    const i = await ON.askDe('cpu', q, ['⚔ EMPIEZO YO', '🛡 QUE EMPIECE EL RIVAL']);
    m.classList.remove('show');
    if (!vivo()) return; empiezaHost = i === 1;
  }
  G.first = empiezaHost ? 'player' : 'cpu';
  if (empiezaHost) {
    G.active = 'player'; G.phase = 'draw';
    lg('⚔️ T1 · TU TURNO — Toca tu <b>B.ALMAS</b> y tu <b>BARAJA</b> (derecha) para robar.', 'var(--gold)');
    lg('ℹ Quien inicia el choque no puede declarar batalla en su primer turno.', 'var(--muted)');
    showBanner('player', 'INICIAS', 'TU TURNO', 1400); faseBanner('player', 'draw');
    renderAll();
  } else {
    // Empieza el invitado: se voltea la partida desde el turno 1
    swapFrame(G); ON.swapped = true;
    G.active = 'player'; G.phase = 'draw';
    lg('⚔️ T1 · TU TURNO — Toca tu <b>B.ALMAS</b> y tu <b>BARAJA</b> (derecha) para robar.', 'var(--gold)');
    lg('ℹ Quien inicia el choque no puede declarar batalla en su primer turno.', 'var(--muted)');
    showBanner('player', 'INICIAS', 'TU TURNO', 1400); faseBanner('player', 'draw');
    renderAll();
  }
}
function finPorAbandono(ganoYo, razon) {
  if (!G || G.over) return;
  razon = razon || (ganoYo ? (ON.rivalNombre || 'Tu rival') + ' abandonó la partida' : 'Abandonaste la partida');
  avisoRival(null);
  if (ON.rol === 'host') {
    if (ON.swapped) { swapFrame(G); ON.swapped = false; }
    PEND.forEach(x => x.res(null)); PEND.clear(); esperaUI(false);
    ON.finGuestGana = !ganoYo;
    netInfoSet({ estado: 'fin' });
    REAL_EG(ganoYo, razon);
  } else {
    G.over = false; _egGuest(ganoYo, razon);
  }
}
// Aviso grande sobre el tablero cuando el rival se desconecta (cuenta regresiva)
let _avisoT = null;
function avisoRival(seg) {
  let a = $('onAviso');
  clearInterval(_avisoT);
  if (seg == null) { if (a) a.style.display = 'none'; return; }
  if (!a) {
    a = document.createElement('div'); a.id = 'onAviso';
    a.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;pointer-events:none;width:calc(100% - 24px);max-width:560px;' +
      'text-align:center;padding:14px 16px;border-radius:12px;background:rgba(6,8,14,.96);border-top:3px solid #ff2244;border-bottom:3px solid #ff2244;' +
      'box-shadow:0 0 30px rgba(255,34,68,.5);color:#fff;font:700 15px Rajdhani,sans-serif;line-height:1.35';
    const b = $('board'); (b || document.body).appendChild(a);
  }
  let n = seg;
  const pinta = () => { a.innerHTML = '<div style="font:900 15px Orbitron,sans-serif;letter-spacing:2px;color:#ff6a80;margin-bottom:4px">📡 ' + esc((ON.rivalNombre || 'TU RIVAL').toUpperCase()) + ' SE DESCONECTÓ</div>' +
    'Si no regresa en <b style="color:#ffd166">' + n + ' s</b>, la partida termina' + (ON.rol === 'host' ? ' y ganas por abandono.' : '.'); };
  a.style.display = 'block'; pinta();
  _avisoT = setInterval(() => { n--; if (n <= 0) { clearInterval(_avisoT); a.style.display = 'none'; return; } pinta(); }, 1000);
}
let REAL_EG = null, _egGuest = null;

// ════════════════════════════════════
// INVITADO
// ════════════════════════════════════
let _ultN = 0, _tree = null, _gSeq = 0, _pidio = 0;
function guestTablero(m) {
  try {
    if (m.t === 'full') { _tree = JSON.parse(m.g); _gSeq = m.s; if (m.m && m.m.host && m.m.host !== ON.rivalNombre) { ON.rivalNombre = m.m.host; marcaConexion(); } }
    else {
      if (!_tree || m.s !== _gSeq + 1) { if (Date.now() - _pidio > 1500) { _pidio = Date.now(); netSend('g2h', { t: 'hola' }); } return; }
      _tree = aplicarDif(_tree, JSON.parse(m.o)); _gSeq = m.s;
    }
  } catch (e) { console.warn('tablero', e); _tree = null; if (Date.now() - _pidio > 1500) { _pidio = Date.now(); netSend('g2h', { t: 'hola' }); } return; }
  guestPintar(decTree(_tree));
}
function guestPintar(nuevo) {
  const habia = !!G;
  const over = G && G.over;
  G = nuevo;
  if (over && !G.over) { $('endgameModal').classList.remove('show'); }
  if (!ON.jugando) {
    ON.jugando = true;
    DK = { jugador: ON.miDeck || {}, cpu: {}, cpuModo: 'online' };
    $('bootScreen').classList.add('hide');
    (async () => { try { await enterLandscape(); } catch (e) {} })();
    try { checkOrientation(); } catch (e) {}
    try { apAplicarMesa(apMesaGuardada()); } catch (e) {}
  }
  if (!habia) $('logwrap').innerHTML = '';
  if (over && G.over) G.over = true;
  try { renderAll(); } catch (e) { console.warn('render invitado', e); }
}
function guestRecibe(m) {
  if (!m) return;
  switch (m.t) {
    case 'lg': GL(m.m, m.c); break;
    case 'ban': GB(...m.a); break;
    case 'snd': try { GS(m.s); } catch (e) {} break;
    case 'ask': guestPregunta(m); break;
    case 'descarte': if (G) { _discardSel = []; GOD(!!m.fin); } break;
    case 'combate': if (m.ver) { mostrarCombate(m.d); } break;
    case 'dados': guestDados(m.a, m.b); break;
    case 'fin': if (G) { G.over = false; } _egGuest(!!m.won, m.r || ''); break;
    case 'full': case 'd': guestTablero(m); break;
    case 'abandono': finPorAbandono(true); break;
    case 'revancha': _ultN = 0; $('endgameModal').classList.remove('show'); $('logwrap').innerHTML = ''; break;
  }
}
const _resp = new Set();
async function guestPregunta(m) {
  if (_resp.has(m.id)) return;
  _resp.add(m.id);
  let v = null;
  const p = m.p || {};
  if (m.kind === 'choice') { const s = $('sorteoModal'); if (s) s.classList.remove('show'); v = await GA(p.t, Array.isArray(p.opts) ? p.opts : Object.values(p.opts || {})); }
  else if (m.kind === 'pick') { const a = {}; Object.keys(p).forEach(k => { if (p[k] != null) a[k] = p[k]; }); a.items = Array.isArray(p.items) ? p.items : Object.values(p.items || {}); v = await GP_(a); }
  else if (m.kind === 'combate') { mostrarCombate(p); await new Promise(r => { _combatClose = r; }); v = true; }
  netSend('g2h', { t: 'ans', id: m.id, v: v == null ? null : v });
}
async function guestDados(a, b) {
  const m = sorteoUI(), dp = $('dadoP'), dc = $('dadoC'), msg = $('sorteoMsg');
  $('dadoCNom').textContent = (ON.rivalNombre || 'RIVAL').toUpperCase();
  dp.classList.remove('gana', 'pierde'); dc.classList.remove('gana', 'pierde');
  m.classList.add('show');
  const t0 = Date.now();
  while (Date.now() - t0 < 700) { dp.textContent = DADO[Math.random() * 6 | 0]; dc.textContent = DADO[Math.random() * 6 | 0]; await new Promise(r => setTimeout(r, 70)); }
  dp.textContent = DADO[a - 1]; dc.textContent = DADO[b - 1];
  if (a === b) { msg.textContent = 'Empate (' + a + ' y ' + b + '). Se vuelve a tirar…'; return; }
  dp.classList.add(a > b ? 'gana' : 'pierde'); dc.classList.add(a > b ? 'pierde' : 'gana');
  msg.innerHTML = a > b ? '<b style="color:var(--green)">¡Ganas el dado!</b> Tú decides quién empieza.' : '<b style="color:var(--red)">' + esc(ON.rivalNombre || 'El rival') + ' gana el dado</b> y decide quién empieza…';
  setTimeout(() => { if (a < b) m.classList.remove('show'); }, 2600);
}
let GL, GB, GS, GA, GP_, GOD;
function parchesGuest() {
  GL = window.lg; GB = window.showBanner; GS = window.playSound; GA = window.askChoice; GP_ = window.pickCards; GOD = window.openDiscardModal;
  _egGuest = window.endGame;
  const miTurno = () => G && !G.over && G.active === 'player';
  const mandar = (fn, args, extra) => { netSend('g2h', Object.assign({ t: 'cmd', fn, args: JSON.parse(JSON.stringify(args || [])) }, extra || {})); };
  // Jugadas: se mandan al anfitrión (el estado regresa en el siguiente dibujo)
  ['drawBA', 'drawBP', 'mainAction', 'doAlma', 'doApoyo', 'doSector', 'callFromHand', 'doSpecialCall', 'directAttack', 'oblivionAtaque', 'startOfrenda', 'goToCombat', 'endTurn'].forEach(n => {
    window[n] = function () { if (!miTurno()) return; mandar(n, [...arguments]); };
  });
  window.doArena = function (o, idx) { if (!miTurno()) return; mandar('doArena', ['player', idx]); };
  window.playerAttack = function (as, ds) { if (!miTurno()) return; ATK_SLOT = null; mandar('playerAttack', [as, ds]); };
  window.useAbility = function (o, cid, e, i, src) { if (!miTurno()) return; mandar('useAbility', [o, cid, i, src]); };
  window.confirmDiscard = function () {
    const need = G.player.hand.length - R.manoMax;
    if (_discardSel.length < need) return;
    $('discardModal').classList.remove('show');
    mandar('confirmDiscard', [], { sel: _discardSel.slice() });
    _discardSel = [];
  };
  window.restartGame = () => { lg('ℹ La revancha la inicia el anfitrión de la sala.', 'var(--muted)'); };
  window.showDeckSelect = () => { location.href = 'online.html' + (LOCAL ? '?local=1' : ''); };
  window.cpuTurn = () => {};
  window.initGame = () => {};
  window.sorteoInicio = () => {};
  window.checkEnd = () => !!(G && G.over);
  window.endGame = function () {};          // el final lo decide el anfitrión
  window.salirPartida = function (ev) {
    ev.preventDefault();
    if (!G || G.over) { location.href = 'online.html' + (LOCAL ? '?local=1' : ''); return false; }
    ventanaConfirmar('¿ABANDONAR LA PARTIDA?', 'Abandonar cuenta como <b>DERROTA</b> y tu rival gana.', '🚪 SÍ, ABANDONAR', '↩ SEGUIR JUGANDO', '⚠️').then(ok => {
      if (!ok) return; netSend('g2h', { t: 'abandono' }); finPorAbandono(false); sessionStorage.removeItem('chh_online_sala');
      setTimeout(() => { location.href = 'online.html' + (LOCAL ? '?local=1' : ''); }, 500);
    });
    return false;
  };
}
function marcaConexion() {
  let t = $('onTag');
  if (!t) { t = document.createElement('div'); t.id = 'onTag'; t.className = 'on-tag'; document.body.appendChild(t); }
  const r = ON.rivalNombre || 'rival';
  t.textContent = '🌐 ' + ON.code + ' · ' + (ON.rivalOnline ? r + ' conectado' : 'esperando a ' + r);
  t.classList.toggle('off', !ON.rivalOnline);
  t.style.display = ON.code ? '' : 'none';
}

// "CPU" en los paneles del tablero → nombre neutral
let _cpuRaf = 0;
function limpiarCPU() {
  if (_cpuRaf) return;
  _cpuRaf = requestAnimationFrame(() => {
    _cpuRaf = 0;
    const st = $('stage'); if (!st) return;
    const w = document.createTreeWalker(st, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) { if (/\bCPU\b/.test(n.nodeValue) && !n.parentElement.closest('#logwrap')) n.nodeValue = sinCPU(n.nodeValue); }
  });
}
function engancharLimpieza() { const _ra = window.renderAll; window.renderAll = function () { const r = _ra.apply(this, arguments); if (ON.jugando) limpiarCPU(); return r; }; }

// ════════════════════════════════════
// ARRANQUE
// ════════════════════════════════════
function listo() {
  const btn = $('bootBtn');
  if (!btn || btn.disabled || typeof DATA === 'undefined' || !DATA) return false;
  return true;
}
(function esperar() {
  if (!listo()) { setTimeout(esperar, 200); return; }
  try { const v = $('simVer'); if (v) v.textContent = ONLINE_VER; } catch (e) {}
  montarLobby();
  estadoLobby('Elige tu baraja y crea una sala, o escribe el código de tu rival.');
  // Los parches se aplican cuando se elige papel (crear / unirse)
  const _crear = crearSala, _unir = unirseSala;
  let parchado = false;
  crearSala = async function () { if (!parchado) { parchado = true; REAL_EG = window.endGame; parchesHost(); engancharLimpieza(); $('onUnir').disabled = true; } return _crear(); };
  unirseSala = async function () { if (!parchado) { parchado = true; parchesGuest(); engancharLimpieza(); $('onCrear').disabled = true; } return _unir(); };
})();
})();
