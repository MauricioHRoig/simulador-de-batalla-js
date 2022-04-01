const { DateTime } = luxon;

let jugadoresIniciales;

let jugadoresEnPartida;

const dañoMinimo = 10;
const dañoMaximo = 30;
const claveGanadoresEnStorage = "ganadores";

const btnMario = document.querySelector("#golpeMario");
const btnLuigi = document.querySelector("#golpeLuigi");
const btnReinicio = document.querySelector("#reinicio");
const btnConsulta = document.querySelector("#consulta");
const listaEventos = document.querySelector("#lista-eventos");
const contenedorGanador = document.querySelector("#contenedor-ganador")

function recuperarJugadoresIniciales() {
    return fetch("json/jugadores.json")
        .then((response) => response.json())
        .then((arrayJugadores) => { jugadoresIniciales = arrayJugadores })
}

function partidaEstaFinalizada() {
    return jugadoresEnPartida.some((jugador) => jugador.hp <= 0)
}

function inicializarJugadores() {
    jugadoresEnPartida = JSON.parse(JSON.stringify(jugadoresIniciales));
}

function insertarEvento(contenido) {
    const evento = crearEvento(contenido);
    listaEventos.appendChild(evento);
}

function crearEvento(contenido) {
    const fecha = DateTime.now().toLocaleString(DateTime.TIME_WITH_SECONDS);
    const spanFecha = document.createElement("span");
    spanFecha.innerHTML = `(${fecha})`;
    spanFecha.classList.add("evento-fecha");
    const spanContenido = document.createElement("span");
    spanContenido.innerHTML = contenido;
    spanContenido.classList.add("evento-contenido");
    const evento = document.createElement("li");
    evento.classList.add("evento");
    evento.appendChild(spanContenido);
    evento.appendChild(spanFecha);
    return evento;
}

function limpiarEventos() {
    while (listaEventos.firstChild) {
        listaEventos.firstChild.remove()
    }
}

function puedeGolpearCritico(jugador) {
    let rangoCritico = Math.ceil(Math.random() * 100)
    return jugador.critico >= rangoCritico
}
function puedeEvadir(jugador) {
    let rangoEvasion = Math.ceil(Math.random() * 100)
    return jugador.evasion >= rangoEvasion
}

function calcularDañoDeGolpe(agresor) {
    let dañoDeGolpe = Math.ceil(dañoMinimo + Math.random() * (dañoMaximo - dañoMinimo));
    if (puedeGolpearCritico(agresor)) {
        dañoDeGolpe = Math.ceil(dañoDeGolpe + (dañoDeGolpe / 2));
        if (dañoDeGolpe > dañoMaximo) {
            insertarEvento(`Golpe critico!`);
        }
    }
    return dañoDeGolpe;
}

function agregarGanadorALaLista(jugador) {
    const ganadores = JSON.parse(localStorage.getItem(claveGanadoresEnStorage)) ?? [];
    ganadores.push(jugador.nombre);
    localStorage.setItem(claveGanadoresEnStorage, JSON.stringify(ganadores))
}

function mostrarGanador(jugador) {
    const { nombre, urlImagen: imagen } = jugador
    contenedorGanador.innerHTML = `
    <h2>Ganador ${nombre}</h2>
    <img class="imagen" src="${imagen}">`
}

function ocultarGanador() {
    contenedorGanador.innerHTML = "";
}

function actualizarVidaDeAgredido(agredido, dañoDeGolpe, agresor) {
    agredido.hp = agredido.hp - dañoDeGolpe;
    if (agredido.hp > 0) {
        insertarEvento(`Vida de ${agredido.nombre} es de = ${agredido.hp}`);
    } else {
        insertarEvento(`${agredido.nombre} no tiene vida`);
        mostrarGanador(agresor);
        agregarGanadorALaLista(agresor);
    }
}

function procesarGolpe(agredido, agresor) {
    if (partidaEstaFinalizada()) {
        return;
    }
    if (puedeEvadir(agredido)) {
        insertarEvento(`Ataque esquivado por ${agredido.nombre}`)
        return;
    }
    let dañoDeGolpe = calcularDañoDeGolpe(agresor);
    insertarEvento(`Golpe de ${agresor.nombre} = ${dañoDeGolpe}`)
    actualizarVidaDeAgredido(agredido, dañoDeGolpe, agresor);
}

function habilitarBotonDeConsulta() {
    btnConsulta.removeAttribute('disabled')
}

function deshabilitarBotonDeConsulta() {
    btnConsulta.setAttribute('disabled', '')
}

function responderAClickEnBotonGolpeMario() {
    procesarGolpe(jugadoresEnPartida[1], jugadoresEnPartida[0])
    deshabilitarBotonDeConsulta();
}
function responderAClickEnBotonGolpeLuigi() {
    procesarGolpe(jugadoresEnPartida[0], jugadoresEnPartida[1])
    deshabilitarBotonDeConsulta();
}

function iniciarPartida() {
    inicializarJugadores()
    limpiarEventos()
    ocultarGanador()
    habilitarBotonDeConsulta()
}

function responderAClickEnBotonConsulta() {
    const ganadoresSerializado = localStorage.getItem(claveGanadoresEnStorage);
    ganadoresSerializadoTernario = ganadoresSerializado === null ? true : false
    ganadoresSerializadoTernario
        ? insertarEvento(`Aun no hay ganadores`)
        : JSON.parse(ganadoresSerializado).forEach(ganador => {
            insertarEvento(ganador);
        });
}

recuperarJugadoresIniciales()
    .then(() => {
        inicializarJugadores();
        btnMario.addEventListener("click", responderAClickEnBotonGolpeMario);
        btnLuigi.addEventListener("click", responderAClickEnBotonGolpeLuigi);
        btnReinicio.addEventListener("click", iniciarPartida);
        btnConsulta.addEventListener("click", responderAClickEnBotonConsulta);
    })