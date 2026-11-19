/* =========================================================
   APP STRONG RACE · v0.1
   Cómo funciona, en 4 piezas:
     1. Cargamos data/plan.json con fetch()            -> init()
     2. Miramos la URL (#/semana/2 o #/sesion/2/T1)    -> router()
     3. Pintamos la pantalla que toca como HTML        -> renderSemana(), renderSesion()
     4. Guardamos qué sesiones has hecho en el móvil   -> localStorage
   ========================================================= */

let plan = null;                                // aquí vivirá el plan cuando se cargue
const app = document.getElementById('app');     // el <main> donde pintamos
const MS_DIA = 24 * 60 * 60 * 1000;             // milisegundos en un día
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

/* ---------- 1. Fechas ---------- */

// "2026-11-23" -> objeto Date a medianoche hora local
function parseFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);                 // ojo: en JS los meses van de 0 a 11
}

function hoy() {
  const h = new Date();
  return new Date(h.getFullYear(), h.getMonth(), h.getDate());
}

function diasEntre(desde, hasta) {
  return Math.round((hasta - desde) / MS_DIA);  // round evita líos con el cambio de hora
}

function fechaCorta(iso) {
  const d = parseFecha(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// ¿Qué semana del plan toca hoy? (si aún no ha empezado, la 1; si ya acabó, la última)
function semanaDeHoy() {
  const dias = diasEntre(parseFecha(plan.semanas[0].inicio), hoy());
  const indice = Math.floor(dias / 7);
  return Math.min(Math.max(indice, 0), plan.semanas.length - 1) + 1;
}

/* ---------- 2. Memoria del móvil (localStorage) ----------
   localStorage guarda texto en el navegador y sobrevive aunque cierres la app.
   Va dentro de try/catch porque en algún modo privado puede fallar. */

function clave(semana, idSesion) { return `hecha-${semana}-${idSesion}`; }

function estaHecha(semana, idSesion) {
  try { return localStorage.getItem(clave(semana, idSesion)) === '1'; }
  catch { return false; }
}

function cambiarHecha(semana, idSesion) {
  try {
    if (estaHecha(semana, idSesion)) localStorage.removeItem(clave(semana, idSesion));
    else localStorage.setItem(clave(semana, idSesion), '1');
  } catch { /* si no se puede guardar, no pasa nada */ }
}

/* ---------- 3. Pantallas ---------- */

function claseTipo(sesion) {
  return sesion.opcional ? 'opcional' : `tipo-${sesion.tipo}`;
}

function renderCuentaAtras() {
  const faltan = diasEntre(hoy(), parseFecha(plan.meta.fecha_carrera));
  document.getElementById('cuenta-atras').innerHTML =
    faltan > 0 ? `<b>${faltan}</b>días` : '<b>¡Hoy!</b>';
}

function renderSemana(n) {
  const semana = plan.semanas[n - 1];
  if (!semana) { location.hash = '#/'; return; }

  // Aviso si el plan aún no ha empezado
  const diasParaEmpezar = diasEntre(hoy(), parseFecha(plan.semanas[0].inicio));
  const avisoInicio = (n === 1 && diasParaEmpezar > 0)
    ? `<div class="aviso">Empiezas en <b>${diasParaEmpezar} días</b>. Hasta entonces, caminar y algo de torso si te apetece.</div>`
    : '';

  const obligatorias = semana.sesiones.filter(s => !s.opcional);
  const hechas = obligatorias.filter(s => estaHecha(n, s.id)).length;

  // .map() convierte cada sesión en un trozo de HTML; .join('') los une
  const tarjetas = semana.sesiones.map(s => {
    const hecha = estaHecha(n, s.id);
    return `
      <a class="tarjeta-sesion ${claseTipo(s)} ${hecha ? 'hecha' : ''}" href="#/sesion/${n}/${s.id}">
        <div class="info">
          <h2>${s.titulo}${s.opcional ? '<span class="etiqueta">opcional</span>' : ''}</h2>
          <p>~${s.duracion_min}' · ${s.ejercicios.length} ejercicios</p>
        </div>
        <div class="check">${hecha ? '✓' : ''}</div>
      </a>`;
  }).join('');

  app.innerHTML = `
    <div class="nav-semana">
      <button onclick="location.hash='#/semana/${n - 1}'" ${n === 1 ? 'disabled' : ''}>‹</button>
      <h1>Semana ${n}<small>${fechaCorta(semana.inicio)} – ${fechaCorta(semana.fin)}</small></h1>
      <button onclick="location.hash='#/semana/${n + 1}'" ${n === plan.semanas.length ? 'disabled' : ''}>›</button>
    </div>
    ${avisoInicio}
    <div class="aviso"><div class="foco">${semana.foco}</div>${semana.nota}</div>
    <p class="progreso">${hechas} de ${obligatorias.length} sesiones hechas</p>
    ${tarjetas}`;
}

function renderSesion(n, idSesion) {
  const semana = plan.semanas[n - 1];
  const sesion = semana && semana.sesiones.find(s => s.id === idSesion);
  if (!sesion) { location.hash = '#/'; return; }

  const ejercicios = sesion.ejercicios.map(ex => {
    const info = plan.ejercicios[ex.id];          // foto y clave técnica de la biblioteca
    return `
      <article class="ejercicio">
        <div class="foto">
          Foto pendiente
          <img src="${info.foto}" alt="${ex.nombre}" loading="lazy" onerror="this.remove()">
        </div>
        <div class="cuerpo">
          <h3>${ex.nombre}</h3>
          <div class="datos">
            <div class="dato"><span>Series</span><b>${ex.prescripcion}</b></div>
            <div class="dato"><span>Carga</span><b>${ex.carga || '—'}</b></div>
            <div class="dato"><span>Descanso</span><b>${ex.descanso || '—'}</b></div>
          </div>
          ${ex.nota ? `<p class="nota">⚠ ${ex.nota}</p>` : ''}
          <p class="cue">${info.cue}</p>
        </div>
      </article>`;
  }).join('');

  const hecha = estaHecha(n, idSesion);
  app.innerHTML = `
    <a class="volver" href="#/semana/${n}">‹ Semana ${n}</a>
    <div class="banda ${claseTipo(sesion)}">
      <h1>${sesion.titulo}</h1>
      <p>~${sesion.duracion_min} min${sesion.opcional ? ' · opcional' : ''}</p>
    </div>
    ${sesion.calentamiento ? `<div class="aviso calentamiento"><b>Calentamiento:</b> ${sesion.calentamiento}</div>` : ''}
    ${ejercicios}
    <button class="boton ${hecha ? 'hecha' : ''}" id="btn-hecha">
      ${hecha ? '✓ Sesión hecha (tocar para deshacer)' : 'Marcar sesión como hecha'}
    </button>`;

  document.getElementById('btn-hecha').addEventListener('click', () => {
    cambiarHecha(n, idSesion);
    renderSesion(n, idSesion);                    // volvemos a pintar para ver el cambio
  });
}

/* ---------- 4. Router: decide qué pantalla pintar según la URL ----------
   "#/"               -> semana actual
   "#/semana/3"       -> semana 3
   "#/sesion/3/T1"    -> sesión T1 de la semana 3                           */
function router() {
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  if (partes[0] === 'semana') renderSemana(Number(partes[1]));
  else if (partes[0] === 'sesion') renderSesion(Number(partes[1]), partes[2]);
  else renderSemana(semanaDeHoy());
  window.scrollTo(0, 0);
}

/* ---------- Arranque ---------- */
async function init() {
  try {
    const respuesta = await fetch('data/plan.json');   // pedimos el archivo
    plan = await respuesta.json();                       // lo convertimos en objeto JS
    renderCuentaAtras();
    router();
    window.addEventListener('hashchange', router);       // cada vez que cambia la URL, repinta
  } catch (error) {
    console.error(error);
    app.innerHTML = `<p class="error">No he podido cargar el plan.<br>
      ¿Has abierto la app con Live Server? Abrir index.html con doble clic no funciona.</p>`;
  }
}

init();
