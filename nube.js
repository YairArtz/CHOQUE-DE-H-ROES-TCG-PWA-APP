// ════════════════════════════════════════════════════════════════════
//  NUBE — guarda en Firebase (mismo proyecto que Choque Online) lo que
//  antes vivía solo en el teléfono, ligado al ID de jugador (CHH-XXXXX):
//    · Barajas del Constructor   (localStorage "chh_decks")
//    · Colección física          (localStorage "nhColFisica_<ID>")
//  Funciona sin conexión: todo se sigue guardando local y se sincroniza
//  la próxima vez que haya internet.
//
//  Firebase:  jugadores/<ID>/barajas/<uid>   = { j: "<json compacto>", u: <ms> }
//             jugadores/<ID>/borradas/<uid>  = <ms>      (barajas eliminadas)
//             jugadores/<ID>/fisicas         = { j: "<json>", u: <ms> }
// ════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.CHH_NUBE) return;
  const FB_CFG = {
    apiKey: 'AIzaSyDif80xeOdjhJ2_-jcRwQK80bPqiVgzCPY',
    authDomain: 'choque-heroes-online.firebaseapp.com',
    databaseURL: 'https://choque-heroes-online-default-rtdb.firebaseio.com',
    projectId: 'choque-heroes-online',
    storageBucket: 'choque-heroes-online.firebasestorage.app',
    messagingSenderId: '701628192523',
    appId: '1:701628192523:web:98cc293ffb01b7dd33740e'
  };
  const FB_SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const TIMEOUT = 12000;
  const KEY_DECKS = 'chh_decks', KEY_BORR = 'chh_decks_borradas', KEY_DUENO = 'chh_decks_dueno';
  const ls = {
    get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const subs = [];
  let estado = 'off';            // off | sync | ok | error | sinid
  function avisar(e, txt) { estado = e; subs.forEach(f => { try { f(e, txt); } catch (x) {} }); }

  function sesionId() {
    const s = ls.get('nhSesion', null);
    if (!s || s.tipo === 'tienda' || !s.id) return null;
    const id = String(s.id).trim().toUpperCase();
    return /^CHH-[0-9A-Z]+$/.test(id) ? id : null;
  }
  const conTiempo = (p, ms) => Promise.race([p, new Promise((_, mal) => setTimeout(() => mal(new Error('tiempo')), ms || TIMEOUT))]);

  // ── Conexión (perezosa, una sola vez) ──
  let _db = null;
  function cargar(src) {
    return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('sin red')); document.head.appendChild(s); });
  }
  async function db() {
    if (window.CHH_NUBE_MOCK) return window.CHH_NUBE_MOCK;      // pruebas
    if (_db) return _db;
    if (!navigator.onLine) throw new Error('sin conexión');
    _db = (async () => {
      if (!window.firebase || !firebase.database) {
        if (!window.firebase) await cargar(FB_SDK + 'firebase-app-compat.js');
        if (!firebase.auth) await cargar(FB_SDK + 'firebase-auth-compat.js');
        if (!firebase.database) await cargar(FB_SDK + 'firebase-database-compat.js');
      }
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FB_CFG);
      if (!firebase.auth().currentUser) await firebase.auth().signInAnonymously();
      const d = app.database();
      return {
        leer: async p => (await d.ref(p).once('value')).val(),
        escribir: (p, v) => d.ref(p).set(v),
        actualizar: (p, v) => d.ref(p).update(v)
      };
    })();
    try { return await conTiempo(_db); } catch (e) { _db = null; throw e; }
  }

  // ════════════════════ BARAJAS ════════════════════
  const nuevoUid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  // Asegura uid y fecha de actualización en cada baraja local (sin cambiar el formato que usan
  // la Simulación, el Arcade, el Perfil y la Academia)
  function barajasLocales() {
    const arr = ls.get(KEY_DECKS, []);
    let cambio = false;
    (Array.isArray(arr) ? arr : []).forEach(d => {
      if (!d) return;
      if (!d.uid) { d.uid = nuevoUid(); cambio = true; }
      if (!d.upd) { d.upd = Date.parse(d.date || '') || Date.now(); cambio = true; }
    });
    if (cambio) ls.set(KEY_DECKS, arr);
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  }
  // Compacta una baraja: { n, d, BP:[[id,cant]..], BA, BS }
  function compactar(d) {
    const z = k => { const m = {}; ((d.decks || {})[k] || []).forEach(c => { if (c && c.id != null) m[c.id] = (m[c.id] || 0) + 1; }); return Object.entries(m); };
    return JSON.stringify({ n: d.name || 'Baraja', d: d.date || '', BP: z('BP'), BA: z('BA'), BS: z('BS') });
  }
  // Catálogo (para reconstruir las cartas de una baraja que viene de la nube)
  let _cat = null;
  function catalogo() {
    if (!_cat) _cat = fetch('cartas.json').then(r => r.json()).then(a => { const m = {}; (a || []).forEach(c => { if (c && c.id != null) m[String(c.id)] = c; }); return m; }).catch(() => { _cat = null; return {}; });
    return _cat;
  }
  function tipoJuego(c) {
    const t = String(c.tipo || '').toUpperCase();
    if (t.includes('PERSONAJE') || t.includes('HÉROE') || t.includes('HEROE')) return 'Personaje';
    if (t.includes('AMALGAMA')) return 'Amalgama';
    if (t.includes('ALMA')) return 'Alma';
    if (t.includes('APOYO')) return 'Apoyo';
    if (t.includes('ARENA')) return 'Arena';
    if (t.includes('SECTOR')) return 'Sector';
    return 'Personaje';
  }
  function expandir(j, cat, uid, u) {
    const o = JSON.parse(j);
    const z = k => { const out = []; (o[k] || []).forEach(([id, n]) => { const b = cat[String(id)] || { id, nombre: String(id), tipo: '' }; const c = Object.assign({}, b, { tipoJuego: tipoJuego(b) }); for (let i = 0; i < n; i++) out.push(c); }); return out; };
    return { name: o.n, date: o.d || new Date(u).toISOString(), uid, upd: u, decks: { BP: z('BP'), BA: z('BA'), BS: z('BS') } };
  }

  let _syncB = null;
  async function sincronizarBarajas() {
    if (_syncB) return _syncB;
    _syncB = (async () => {
      const id = sesionId();
      if (!id) { avisar('sinid'); return { ok: false, motivo: 'sinid' }; }
      avisar('sync');
      try {
        const D = await db();
        const base = 'jugadores/' + id;
        const [rem, remBorr] = await conTiempo(Promise.all([D.leer(base + '/barajas'), D.leer(base + '/borradas')]));
        const remoto = rem || {}, borrR = remBorr || {};
        // Otro jugador inició sesión en este dispositivo: sus barajas no se mezclan con las del anterior
        // (las del anterior quedan respaldadas en "chh_decks_respaldo_<ID>" y vuelven al iniciar sesión con él)
        const dueno = ls.get(KEY_DUENO, null);
        if (dueno && dueno !== id) {
          ls.set('chh_decks_respaldo_' + dueno, ls.get(KEY_DECKS, []));
          ls.set(KEY_DECKS, ls.get('chh_decks_respaldo_' + id, []));
          ls.set(KEY_BORR, {});
          try { localStorage.removeItem('chh_decks_respaldo_' + id); } catch (e) {}
        }
        const locales = barajasLocales();
        const borrL = ls.get(KEY_BORR, {}) || {};
        const borr = Object.assign({}, borrR); Object.entries(borrL).forEach(([k, t]) => { if (!borr[k] || t > borr[k]) borr[k] = t; });
        const cat = await catalogo();
        const porUid = {}; locales.forEach(d => { porUid[d.uid] = d; });
        const subir = {}, bajar = [];
        // Lo de la nube que es nuevo o más reciente
        Object.entries(remoto).forEach(([uid, r]) => {
          if (!r || !r.j) return;
          if (borr[uid] && borr[uid] >= (r.u || 0)) return;
          const l = porUid[uid];
          if (!l || (r.u || 0) > (l.upd || 0)) { try { bajar.push(expandir(r.j, cat, uid, r.u || Date.now())); } catch (e) {} }
        });
        // Lo local que falta o es más reciente en la nube
        locales.forEach(d => {
          if (borr[d.uid] && borr[d.uid] >= (d.upd || 0)) return;
          const r = remoto[d.uid];
          if (!r || (d.upd || 0) > (r.u || 0)) subir[d.uid] = { j: compactar(d), u: d.upd || Date.now() };
        });
        // Mezcla local: conserva el orden, reemplaza las más nuevas y agrega las que llegan
        const bajarUid = {}; bajar.forEach(b => { bajarUid[b.uid] = b; });
        let final = locales.filter(d => !(borr[d.uid] && borr[d.uid] >= (d.upd || 0))).map(d => bajarUid[d.uid] || d);
        bajar.forEach(b => { if (!porUid[b.uid]) final.push(b); });
        final.sort((a, b) => (Date.parse(a.date) || a.upd || 0) - (Date.parse(b.date) || b.upd || 0));
        const cambioLocal = final.length !== locales.length || bajar.length > 0;
        if (cambioLocal) ls.set(KEY_DECKS, final);
        // Subidas
        const upd = {};
        Object.entries(subir).forEach(([uid, v]) => { upd['barajas/' + uid] = v; });
        Object.entries(borr).forEach(([uid, t]) => { if (borrR[uid] !== t) upd['borradas/' + uid] = t; if (remoto[uid] && t >= (remoto[uid].u || 0)) upd['barajas/' + uid] = null; });
        if (Object.keys(upd).length) await conTiempo(D.actualizar(base, upd));
        ls.set(KEY_BORR, borr); ls.set(KEY_DUENO, id);
        avisar('ok', final.length + ' baraja(s) en la nube');
        return { ok: true, cambioLocal, subidas: Object.keys(subir).length, bajadas: bajar.length, total: final.length };
      } catch (e) {
        avisar('error', e && e.message);
        return { ok: false, motivo: e && e.message };
      }
    })();
    try { return await _syncB; } finally { _syncB = null; }
  }
  // Marca una baraja como borrada (para que no reaparezca desde otro dispositivo)
  function marcarBorrada(uid) {
    if (!uid) return;
    const b = ls.get(KEY_BORR, {}) || {}; b[uid] = Date.now(); ls.set(KEY_BORR, b);
  }

  // ════════════════════ COLECCIÓN FÍSICA ════════════════════
  // El objeto completo viaja con su fecha. Si ambos lados cambiaron sin saberlo
  // (dispositivo viejo sin fecha), se unen tomando la cantidad mayor de cada carta.
  async function sincronizarFisicas() {
    const id = sesionId();
    if (!id) { avisar('sinid'); return { ok: false, motivo: 'sinid' }; }
    const kF = 'nhColFisica_' + id, kU = 'nhColFisicaU_' + id, kS = 'nhColFisicaS_' + id;
    avisar('sync');
    try {
      const D = await db();
      const r = await conTiempo(D.leer('jugadores/' + id + '/fisicas'));
      const local = ls.get(kF, {}) || {}, uL = ls.get(kU, 0) || 0, uSync = ls.get(kS, 0) || 0;
      let remoto = {}, uR = 0;
      if (r && r.j) { try { remoto = JSON.parse(r.j) || {}; } catch (e) {} uR = r.u || 0; }
      let final = local, subir = false, cambioLocal = false;
      if (!r) subir = Object.keys(local).length > 0;
      else if (uL > uSync && uR > uSync && uSync) {          // ambos cambiaron desde la última vez: unir
        final = Object.assign({}, remoto); Object.entries(local).forEach(([k, n]) => { if (!final[k] || n > final[k]) final[k] = n; });
        subir = cambioLocal = true;
      } else if (!uL && !uSync && Object.keys(local).length) {   // primera vez en este dispositivo con datos viejos: unir
        final = Object.assign({}, remoto); Object.entries(local).forEach(([k, n]) => { if (!final[k] || n > final[k]) final[k] = n; });
        subir = true; cambioLocal = JSON.stringify(final) !== JSON.stringify(local);
      } else if (uR > uL) { final = remoto; cambioLocal = true; }
      else if (uL > uR) subir = true;
      const u = Math.max(uL, uR, subir ? Date.now() : 0);
      if (cambioLocal) ls.set(kF, final);
      if (subir) await conTiempo(D.escribir('jugadores/' + id + '/fisicas', { j: JSON.stringify(final), u }));
      ls.set(kU, u); ls.set(kS, u);
      avisar('ok', 'Colección física sincronizada');
      return { ok: true, cambioLocal, datos: final };
    } catch (e) {
      avisar('error', e && e.message);
      return { ok: false, motivo: e && e.message };
    }
  }
  function marcarFisicasCambio() { const id = sesionId(); if (id) ls.set('nhColFisicaU_' + id, Date.now()); }

  // Subida diferida (para no escribir en cada toque)
  const _dif = {};
  function diferir(nombre, fn, ms) { clearTimeout(_dif[nombre]); _dif[nombre] = setTimeout(fn, ms || 1500); }
  addEventListener('online', () => { if (sesionId()) { sincronizarBarajas(); } });

  window.CHH_NUBE = {
    sesionId, estado: () => estado, alCambiar: f => subs.push(f),
    sincronizarBarajas, marcarBorrada, nuevoUid, barajasLocales,
    sincronizarFisicas, marcarFisicasCambio, diferir
  };
})();
