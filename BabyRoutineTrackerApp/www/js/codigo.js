const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGUEADO = document.querySelector("#pantalla-logueado");
const AGREGAREVENTO = document.querySelector("#pantalla-agregar-eventos");
const LISTAREVENTOS = document.querySelector("#pantalla-listar-eventos");
const INFORMEEVENTOS = document.querySelector("#pantalla-informes-eventos");
const MAPA = document.querySelector("#pantalla-mapa");
let router = document.querySelector('ion-router');//ES UTILIZADO PARA PUSHEAR URL /LOGUEADO CUANDO SE UTILIZA BOTÓN DE LOGIN Y LUEGO NAVEGAR

let MiLat = null;
let Milong = null;


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(mostrarMiUbicacion);
  } else {
    console.log("No soportado");
  }
}

function mostrarMiUbicacion(position) {
  MiLat = position.coords.latitude;
  Milong = position.coords.longitude;
  setTimeout(function () {
    CrearMapa();
  }, 1000);
}

const loading = document.createElement('ion-loading');
function Loading(texto) {
  loading.cssClass = 'my-custom-class';
  loading.message = texto;
  document.body.appendChild(loading);
  loading.present();
}

function cancelarLoading() {
  loading.dismiss();
}

Inicio();

function Inicio() {
  // initMap(); 
  ObtenerDepartamentos();
  ArmarMenuOpciones();
  Eventos();
}

function cerrarMenu() {
  MENU.close();
  document.querySelector("#parrafoErrorLogin").innerHTML = "";
}

function ArmarMenuOpciones() {
  let existeToken = localStorage.getItem("apiKeyUsuario");
  let cargar_menu = ""
  if (existeToken != null) {
    cargar_menu += `
              <ion-item href="/logueado" onclick="cerrarMenu()">Inicio</ion-item>
                    <ion-item href="/agregarEvento" onclick="cerrarMenu()">Agregar Evento</ion-item>
                    <ion-item href="/listadoEventos" onclick="cerrarMenu()">Ver Eventos</ion-item>
                    <ion-item href="/informesEventos" onclick="cerrarMenu()">Informes</ion-item>
                    <ion-item href="/mapa" onclick="cerrarMenu()">Mapa</ion-item>
                    <ion-item onclick="Logout()">Logout</ion-item>`
  } else {
    cargar_menu += `<ion-item href="/" onclick="cerrarMenu()">Home</ion-item>
    <ion-item href="/login" onclick="cerrarMenu()">Login</ion-item>
                    <ion-item href="/registro" onclick="cerrarMenu()">Registro</ion-item>`
  }
  document.querySelector("#listaMenu").innerHTML = cargar_menu;
}

function Eventos() {
  ROUTER.addEventListener('ionRouteDidChange', Navegar);
  document.querySelector("#registroDepartamento").addEventListener('ionChange', ObtenerIdDepartamento);
  document.querySelector("#registroDepartamento").addEventListener('ionChange', ObtenerCiudades);
  document.querySelector("#registro-button").addEventListener('click', RegistarUsuario);
  document.querySelector("#login-button").addEventListener('click', LoginUsuario);
  document.querySelector("#agregar-evento-button").addEventListener('click', AgregarEvento);
  document.querySelector("#btnAbrirCalendario").addEventListener('click', MostrarCalendario);
}

function OcultarPantallas() {
  HOME.style.display = "none";
  LOGIN.style.display = "none";
  REGISTRO.style.display = "none";
  LOGUEADO.style.display = "none";
  AGREGAREVENTO.style.display = "none";
  LISTAREVENTOS.style.display = "none";
  INFORMEEVENTOS.style.display = "none";
  MAPA.style.display = "none";
}

function Navegar(evt) {
  console.log(evt);
  let ruta = evt.detail.to;
  console.log(ruta);
  ArmarMenuOpciones();
  OcultarPantallas();
  MostrarBotonAbrirCalendario();
  if (ruta == "/" || ruta == "/home") {
    HOME.style.display = "block";
  } else if (ruta == "/login") {
    LOGIN.style.display = "block";
    document.querySelector("#usuarioLogin").value = "";
    document.querySelector("#passwordLogin").value = "";
  } else if (ruta == "/registro") {
    REGISTRO.style.display = "block";
    document.querySelector("#usuarioRegistro").value = "";
    document.querySelector("#passwordRegistro").value = "";
    document.querySelector("#registroDepartamento").value = undefined;
    document.querySelector("#registroCiudad").value = undefined;
  } else if (ruta == "/logueado") {
    LOGUEADO.style.display = "block";
  } else if (ruta == "/agregarEvento") {
    AGREGAREVENTO.style.display = "block";
    document.querySelector("#categoriaEvento").value = "";
    document.querySelector("#detallesEvento").value = "";
  } else if (ruta == "/listadoEventos") {
    LISTAREVENTOS.style.display = "block";
  } else if (ruta == "/informesEventos") {
    INFORMEEVENTOS.style.display = "block";
  } else if (ruta == "/mapa") {
    getLocation();
    MAPA.style.display = "block";
  }
}

function MostrarToast(mensaje, duracion) {
  const toast = document.createElement('ion-toast');
  toast.message = mensaje;
  toast.duration = duracion;
  document.body.appendChild(toast);
  toast.present();
}

function MostrarCalendario() {
  document.querySelector("#itemCalendario").style.display = "block";
  document.querySelector("#itemBtnAbrirCalendario").style.display = "none";
}

function MostrarBotonAbrirCalendario() {
  document.querySelector("#itemCalendario").style.display = "none";
  document.querySelector("#itemBtnAbrirCalendario").style.display = "block";
}

async function ObtenerDepartamentos() {
  try {
    const response = await fetch("https://babytracker.develotion.com/departamentos.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    let cargarSelect = "";
    for (let p of data.departamentos) {
      cargarSelect += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
    }
    document.querySelector("#registroDepartamento").innerHTML = cargarSelect;
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}

function ObtenerIdDepartamento() {
  let idInicial = 3203;
  let idDepartamento = document.querySelector("#registroDepartamento").value;
  if (idDepartamento == 0) {
    return idInicial;
  } else {
    return idDepartamento;
  }
}

async function ObtenerCiudades() {
  try {
    let idDepartamento = ObtenerIdDepartamento();
    const response = await fetch(`https://babytracker.develotion.com/ciudades.php?idDepartamento=${idDepartamento}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    let cargarSelect = "";
    for (let p of data.ciudades) {
      cargarSelect += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
    }
    document.querySelector("#registroCiudad").innerHTML = cargarSelect;
  } catch (error) {
    console.error("Error fetching cities:", error);
  }
}

async function ObtenerCategorias() {
  try {
    const response = await fetch(`https://babytracker.develotion.com/categorias.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });
    const data = await response.json();
    let cargarSelect = "";
    if (data.codigo == 200) {
      for (let p of data.categorias) {
        cargarSelect += `<ion-select-option value="${p.id}">${p.tipo}</ion-select-option>`;
      }
      document.querySelector("#categoriaEvento").innerHTML = cargarSelect;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

async function RegistarUsuario() {
  let usu = document.querySelector("#usuarioRegistro").value;
  let usuario = document.querySelector("#usuarioRegistro");
  let pas = document.querySelector("#passwordRegistro").value;
  let password = document.querySelector("#passwordRegistro");
  let dep = document.querySelector("#registroDepartamento").value;
  let departamento = document.querySelector("#registroDepartamento");
  let ciu = document.querySelector("#registroCiudad").value;

  if (ValidarRegistro(usu, pas, dep, ciu)) {
    let nuevoUsuario = {
      usuario: usu,
      password: pas,
      idDepartamento: dep,
      idCiudad: ciu,
    };

    Loading("Loading");

    try {
      const response = await fetch(`https://babytracker.develotion.com/usuarios.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoUsuario),
      });

      const data = await response.json();
      console.log(data);

      if (data.codigo == 200) {
        cancelarLoading();
        LoginUsuario(usu, pas);
        localStorage.setItem("apiKeyUsuario", data.apiKey);
        localStorage.setItem("idUsuario", data.id);
        usuario.value = "";
        password.value = "";
        departamento.value = 0;
      } else {
        cancelarLoading();
        MostrarToast(data.mensaje, 3000);
      }
    } catch (error) {
      cancelarLoading();
      console.error("Error registering user:", error);
      MostrarToast("Error en el registro, por favor intenta nuevamente.", 3000);
    }
  } else {
    usuario.value = "";
    password.value = "";
    departamento.value = undefined;
    document.querySelector("#registroCiudad").value = undefined;
    MostrarToast("Todos los campos son obligatorios", 3000);
  }
}

function ValidarRegistro(usu, pas, dep, ciu) {
  if (usu == "" || pas == "" || dep == null || ciu == null) {
    return false;
  } else {
    return true;
  }
}

async function LoginUsuario(usu, pas) {
  if (usu == null || pas == null) {
    usu = document.querySelector("#usuarioLogin").value;
    pas = document.querySelector("#passwordLogin").value;
  }

  let usuario = document.querySelector("#usuarioLogin");
  let password = document.querySelector("#passwordLogin");

  let nuevoUsuario = {
    usuario: usu,
    password: pas,
  };

  Loading("Loading");

  try {
    const response = await fetch(`https://babytracker.develotion.com/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoUsuario),
    });

    const data = await response.json();
    console.log(data);

    if (data.codigo == 200) {
      cancelarLoading();
      localStorage.setItem("apiKeyUsuario", data.apiKey);
      localStorage.setItem("idUsuario", data.id);
      ObtenerCategorias();
      usuario.value = "";
      password.value = "";
      router.push('/logueado'); // Redirigir si el login es exitoso
      ObtenerEventos();
      ObtenerInformes();
    } else {
      usuario.value = "";
      password.value = "";
      cancelarLoading();
      MostrarToast(data.mensaje, 3000);
    }
  } catch (error) {
    cancelarLoading();
    console.error("Error during login:", error);
    MostrarToast("Error en el inicio de sesión, por favor intenta nuevamente.", 3000);
  }
}

function Logout() {
  localStorage.clear();
  cerrarMenu();
  router.push('/'); //PUSEHAR URL LOGOUT  
}

async function AgregarEvento() {
  Loading("Loading");
  MostrarBotonAbrirCalendario();

  let idCategoriaValor = document.querySelector("#categoriaEvento");
  let idCategoria = document.querySelector("#categoriaEvento").value;
  let detalle = document.querySelector("#detallesEvento").value;
  let detalleExtra = document.querySelector("#detallesEvento");
  let fecha = document.querySelector("#fechaYHoraEvento").value;
  let fechaYHora = document.querySelector("#fechaYHoraEvento");
  let fechaActual = new Date();
  let fechaSeleccionada = new Date(fecha);

  if (detalleExtra.value !== "") {
    if (fechaSeleccionada <= fechaActual) {
      if (ValidarEvento(idCategoria)) {
        let eventoNuevo = {
          idCategoria: idCategoria,
          idUsuario: localStorage.getItem("idUsuario"),
          detalle: detalle,
          fecha: fecha,
        };

        try {
          const response = await fetch(`https://babytracker.develotion.com/eventos.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: `${localStorage.getItem("apiKeyUsuario")}`,
              iduser: `${localStorage.getItem("idUsuario")}`,
            },
            body: JSON.stringify(eventoNuevo),
          });

          const data = await response.json();
          cancelarLoading();
          console.log(data);

          if (data.codigo == 200) {
            ObtenerEventos();
            ObtenerInformes();
            MostrarToast(data.mensaje, 3000);
            detalleExtra.value = "";
            idCategoria.value = "";
            idCategoriaValor.value = "";
          }
        } catch (error) {
          cancelarLoading();
          console.error("Error adding event:", error);
          MostrarToast("Error al agregar el evento, por favor intenta nuevamente.", 3000);
        }
      } else {
        cancelarLoading();
        MostrarToast("Debe seleccionar una categoría!", 3000);
      }
    } else {
      cancelarLoading();
      MostrarToast("La fecha no debe ser mayor a la actual!", 3000);
    }
  } else {
    cancelarLoading();
    MostrarToast("Debe de escribir detalles", 3000);
  }
}

function IrAAgregarEventos() {
  return router.push('/agregarEvento');
}

async function ObtenerEventos() {
  let cargarTarjetasDeHoy = "";
  let cargarTarjetasDeDiasAnteriores = "";
  let fechaActual = new Date();
  let diaActual = fechaActual.getDate();

  try {
    let response = await fetch(`https://babytracker.develotion.com/eventos.php?idUsuario=${localStorage.getItem("idUsuario")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });

    let data = await response.json();

    if (data.eventos.length === 0) {
      cargarTarjetasDeHoy = `<div class="ion-text-center">
               <p>No tienes eventos registrados aún.</p>    
             </div>`;
      cargarTarjetasDeDiasAnteriores = `<div class="ion-text-center">  
               <ion-button onclick="IrAAgregarEventos()">Agregar nuevo evento</ion-button>
             </div>`;
    } else {

      let existenTarjetasHoy = await ExistenTarjetasHoy();
      let existenTarjetasDiasAnteriores = await ExistenTarjetasDiasAnteriores();

      if (existenTarjetasHoy) {
        cargarTarjetasDeHoy = `<h2>Eventos de Hoy</h2>`;
      }
      if (existenTarjetasDiasAnteriores) {
        cargarTarjetasDeDiasAnteriores = `<h2>Eventos de Días Anteriores</h2>`;
      }

      for (let p of data.eventos) {
        let fechaEventoActual = new Date(p.fecha);
        let diaEventoActual = fechaEventoActual.getDate();
        if (diaEventoActual == diaActual) {
          cargarTarjetasDeHoy += `            
          <ion-card>
          <ion-card-header>
            <ion-card-title>${ObtenerCategoriasXId(p.idCategoria)}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="ion-text-center">
              ${ObtenerIconoDeEvento(p.idCategoria)}
              <p><strong>Fecha & Hora:</strong> ${p.fecha}</p>
              <p><strong>Detalle:</strong> ${p.detalle}</p>
              <ion-button expand="block" onclick="EliminarEvento(${p.id})">Eliminar</ion-button>
            </div>
          </ion-card-content>
        </ion-card>`;
        } else {
          cargarTarjetasDeDiasAnteriores += `
          <ion-card>
          <ion-card-header>
            <ion-card-title>${ObtenerCategoriasXId(p.idCategoria)}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="ion-text-center">
              ${ObtenerIconoDeEvento(p.idCategoria)}
              <p><strong>Fecha & Hora:</strong> ${p.fecha}</p>
              <p><strong>Detalle:</strong> ${p.detalle}</p>
              <ion-button expand="block" onclick="EliminarEvento(${p.id})">Eliminar</ion-button>
            </div>
          </ion-card-content>
        </ion-card>`;
        }
      }
    }
    document.querySelector("#listadoDeEventosDeHoy").innerHTML = cargarTarjetasDeHoy;
    document.querySelector("#listadoDeEventosDeDíasAnteriores").innerHTML = cargarTarjetasDeDiasAnteriores;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
  }
}

async function ExistenTarjetasHoy() {
  let cargarTarjetasDeHoy = false;
  let fechaActual = new Date();
  let diaActual = fechaActual.getDate();

  try {
    let response = await fetch(`https://babytracker.develotion.com/eventos.php?idUsuario=${localStorage.getItem("idUsuario")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });

    let data = await response.json();

    for (let p of data.eventos) {
      let fechaEventoActual = new Date(p.fecha);
      let diaEventoActual = fechaEventoActual.getDate();
      if (diaEventoActual === diaActual) {
        cargarTarjetasDeHoy = true;
        break;
      }
    }
  } catch (error) {
    console.error("Error al obtener eventos:", error);
  }
  return cargarTarjetasDeHoy;
}

async function ExistenTarjetasDiasAnteriores() {
  let cargarTarjetasDeDiasAnteriores = false;
  let fechaActual = new Date();
  let diaActual = fechaActual.getDate();

  try {
    let response = await fetch(`https://babytracker.develotion.com/eventos.php?idUsuario=${localStorage.getItem("idUsuario")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });

    let data = await response.json();

    for (let p of data.eventos) {
      let fechaEventoActual = new Date(p.fecha);
      let diaEventoActual = fechaEventoActual.getDate();
      if (diaEventoActual !== diaActual) {
        cargarTarjetasDeDiasAnteriores = true;
        break;
      }
    }
  } catch (error) {
    console.error("Error al obtener eventos:", error);
  }
  return cargarTarjetasDeDiasAnteriores;
}

function ObtenerIconoDeEvento(idCategoria) {
  let idURL = idCategoria - 30;

  let imgElement = document.createElement('img');

  imgElement.src = `https://babytracker.develotion.com/imgs/${idURL}.png`;

  imgElement.alt = 'Icono de evento';
  imgElement.style.width = '50px';
  imgElement.style.height = '50px';

  return imgElement.outerHTML;
}

function ValidarEvento(idCategoria) {
  if (idCategoria == "") {
    return false;
  } else {
    return true;
  }
}

function ObtenerCategoriasXId(idCategoria) {
  let categoriaNombre;
  switch (idCategoria) {
    case 31:
      categoriaNombre = "Comida";
      break;
    case 32:
      categoriaNombre = "Paseo";
      break;
    case 33:
      categoriaNombre = "Pañal";
      break;
    case 34:
      categoriaNombre = "Sueño";
      break;
    case 35:
      categoriaNombre = "Biberón";
      break;
    case 36:
      categoriaNombre = "Juego";
      break;
  }
  return categoriaNombre;
}

async function EliminarEvento(idEvento) {
  Loading("Loading");

  try {
    const response = await fetch(`https://babytracker.develotion.com/eventos.php?idEvento=${idEvento}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });

    const data = await response.json();
    cancelarLoading();
    ObtenerEventos();
    ObtenerInformes();
    console.log(data);
  } catch (error) {
    cancelarLoading();
    console.error("Error deleting event:", error);
    MostrarToast("Error al eliminar el evento, por favor intenta nuevamente.", 3000);
  }
}

async function ObtenerInformes() {
  let cargarTablaBiberones = "";
  let cargarTablaPañales = "";
  let contadorBiberones = 0;
  let contadorPañales = 0;
  let horaActualBiberon = "-";
  let horaActualPañal = "-";
  let horaAnteriorBiberon = 0;
  let horaAnteriorPañal = 0;
  let fechaActual = new Date();

  cargarTablaBiberones = `<ion-row>
                            <ion-col size ="3" class="ion-text-center"><strong>Categoría</strong></ion-col>
                            <ion-col size ="5" class="ion-text-center"><strong>Tiempo desde Último Cambio</strong></ion-col>
                            <ion-col size ="3" class="ion-text-center"><strong>Total</strong></ion-col>
                        </ion-row>`;
  cargarTablaPañales = `<ion-row>
                            <ion-col size ="3" class="ion-text-center"><strong>Categoría</strong></ion-col>
                            <ion-col size ="5" class="ion-text-center"><strong>Tiempo desde Último Cambio</strong></ion-col>
                            <ion-col size ="3" class="ion-text-center"><strong>Total</strong></ion-col>
                        </ion-row>`;

  try {
    const response = await fetch(`https://babytracker.develotion.com/eventos.php?idUsuario=${localStorage.getItem("idUsuario")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });

    const data = await response.json();

    for (let p of data.eventos) {
      if (p.idCategoria == 35) { // Biberones
        let fechaSeleccionadaBiberones = new Date(p.fecha);
        if (fechaSeleccionadaBiberones.getDate() == fechaActual.getDate()) {
          contadorBiberones++;
          if (fechaSeleccionadaBiberones > horaAnteriorBiberon) {
            horaAnteriorBiberon = fechaSeleccionadaBiberones;
          }
        }
      } else if (p.idCategoria == 33) { // Pañales
        let fechaSeleccionadaPañales = new Date(p.fecha);
        if (fechaSeleccionadaPañales.getDate() == fechaActual.getDate()) {
          contadorPañales++;
          if (fechaSeleccionadaPañales > horaAnteriorPañal) {
            horaAnteriorPañal = fechaSeleccionadaPañales;
          }
        }
      }
    }

    if (horaAnteriorBiberon !== 0) {
      let tiempoTranscurridoBiberon = calcularTiempoTranscurrido(horaAnteriorBiberon, fechaActual);
      horaActualBiberon = tiempoTranscurridoBiberon;
    }

    if (horaAnteriorPañal !== 0) {
      let tiempoTranscurridoPañal = calcularTiempoTranscurrido(horaAnteriorPañal, fechaActual);
      horaActualPañal = tiempoTranscurridoPañal;
    }

    cargarTablaBiberones += `<ion-row>
                            <ion-col size ="3" class="ion-text-center">Biberones</ion-col>
                            <ion-col size ="5" class="ion-text-center">${horaActualBiberon}</ion-col>
                            <ion-col size ="3" class="ion-text-center"><strong></strong>${contadorBiberones}</ion-col>
                        </ion-row>`;

    cargarTablaPañales += `<ion-row>
        <ion-col size="3" class="ion-text-center">Pañales</ion-col>
        <ion-col size="5" class="ion-text-center">${horaActualPañal}</ion-col>
        <ion-col size="3" class="ion-text-center"><strong></strong>${contadorPañales}</ion-col>
      </ion-row>`;

    document.querySelector("#listadoDeInformesBiberones").innerHTML = cargarTablaBiberones;
    document.querySelector("#listadoDeInformesPañales").innerHTML = cargarTablaPañales;
  } catch (error) {
    console.error("Error fetching reports:", error);
    MostrarToast("Error al obtener informes, por favor intenta nuevamente.", 3000);
  }
}

function calcularTiempoTranscurrido(desde, hasta) {
  const diferencia = hasta - desde;
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  return `${horas}h ${minutos}m`;
}

let map = null;

async function CrearMapa() {
  if (map !== null) {
    map.remove(); // Destruye el mapa si ya existe
  }

  map = L.map("map").setView([MiLat, Milong], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // MARCADOR VERDE
  let greenIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [30, 46],
    iconAnchor: [17, 45],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  let miMarcador = L.marker([MiLat, Milong], { icon: greenIcon }).addTo(map);

  try {
    const response = await fetch(`https://babytracker.develotion.com/plazas.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${localStorage.getItem("apiKeyUsuario")}`,
        iduser: `${localStorage.getItem("idUsuario")}`,
      },
    });

    const data = await response.json();

    if (data.codigo == 200) {
      for (let p of data.plazas) {
        let nuevoMarcador = L.marker([p.latitud, p.longitud]).addTo(map);
        if (p.accesible == 1 && p.aceptaMascotas == 1) {
          nuevoMarcador.bindPopup("Es accesible y acepta mascotas").openPopup();
        } else if (p.accesible == 1) {
          nuevoMarcador.bindPopup("Es accesible").openPopup();
        } else if (p.aceptaMascotas == 1) {
          nuevoMarcador.bindPopup("Acepta mascotas").openPopup();
        }else{
          nuevoMarcador.bindPopup("No es accesible ni acepta mascotas").openPopup();
        }
      }
    }
  } catch (error) {
    console.error("Error loading map data:", error);
    MostrarToast("Error al cargar los datos del mapa, por favor intenta nuevamente.", 3000);
  }
}

// function initMap() {
//     let map = new google.maps.Map(document.querySelector('#mapaUsuario'), {
//         zoom: 16
//     });

//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//             function (position) {
//                 let userLocation = {
//                     lat: position.coords.latitude,
//                     lng: position.coords.longitude
//                 };
//                 map.setCenter(userLocation);

//                 new google.maps.Marker({
//                     position: userLocation,
//                     map: map
//                 });
//             },
//             function (error) {
//                 console.error('Error al obtener ubicación:', error);
//             }
//         );
//     }
// }
