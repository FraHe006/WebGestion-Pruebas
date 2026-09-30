let solicitudes = [];
let pestanaActiva = "pendiente";

const estados = { pendiente: "pendientes", aprobada: "aprobadas", rechazada: "rechazadas" };

async function cargar() {
  try {
    solicitudes = await leerSolicitudes();
    pintar();
  } catch (e) {
    document.getElementById("admin-error-texto").textContent = e.message;
    document.getElementById("admin-error").hidden = false;
  }
}

function pintar() {
  for (const estado in estados) {
    const lista = solicitudes.filter(s => s.estado === estado);
    const nombre = estados[estado];

    document.getElementById("stat-" + nombre).textContent = lista.length;

    const pestana = document.getElementById("tab-" + nombre);
    pestana.setAttribute("aria-selected", estado === pestanaActiva);
    pestana.querySelector(".contador").textContent = lista.length;

    const panel = document.getElementById("panel-" + nombre);
    panel.replaceChildren(...lista.map(tarjeta));
    panel.hidden = estado !== pestanaActiva;
  }
  const hayAlguna = solicitudes.some(s => s.estado === pestanaActiva);
  document.getElementById("admin-vacio").hidden = hayAlguna;
}

// Cambiar de pestaña
document.querySelectorAll(".pestana").forEach(p => {
  p.onclick = () => { pestanaActiva = p.dataset.estado; pintar(); };
});

document.getElementById("btn-actualizar").onclick = cargar;

document.getElementById("btn-descargar-aprobadas").onclick = () =>
  descargar(solicitudes.filter(s => s.estado === "aprobada"), "actividades.json");

document.getElementById("btn-descargar-todo").onclick = () =>
  descargar(solicitudes, "copia-solicitudes.json");

// Arranque: solo admins
entrar(true).then(usuario => { if (usuario) cargar(); });