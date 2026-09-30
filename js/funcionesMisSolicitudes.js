// Mis solicitudes. Necesita js/sesion.js cargado antes.

let misSolicitudes = [];
let filtroActivo = "todas";

async function cargar(usuario) {
  try {
    misSolicitudes = await leerSolicitudes("&creator=" + usuario);
    pintar();
  } catch (e) {
    document.getElementById("mis-error-texto").textContent = e.message;
    document.getElementById("mis-error").hidden = false;
  }
}

function pintar() {
  const cuantas = estado => misSolicitudes.filter(s => s.estado === estado).length;
  document.getElementById("cuenta-todas").textContent = misSolicitudes.length;
  document.getElementById("cuenta-pendiente").textContent = cuantas("pendiente");
  document.getElementById("cuenta-aprobada").textContent = cuantas("aprobada");
  document.getElementById("cuenta-rechazada").textContent = cuantas("rechazada");

  document.querySelectorAll(".filtro").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.estado === filtroActivo)
  );

  const lista = filtroActivo === "todas"
    ? misSolicitudes
    : misSolicitudes.filter(s => s.estado === filtroActivo);

  document.getElementById("mis-lista").replaceChildren(...lista.map(tarjeta));
  document.getElementById("mis-vacio").hidden = misSolicitudes.length > 0;
}

// Cambiar de filtro
document.querySelectorAll(".filtro").forEach(b => {
  b.onclick = () => { filtroActivo = b.dataset.estado; pintar(); };
});

// Arranque: cualquier miembro
entrar(false).then(usuario => { if (usuario) cargar(usuario); });