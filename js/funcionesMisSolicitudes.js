const REPO_WEB = "https://github.com/FraHe006/AppData";
const REPO_API = "https://api.github.com/repos/FraHe006/AppData";
const token = localStorage.getItem("gestion-token") || sessionStorage.getItem("gestion-token");


// Pide algo a GitHub con el token del usuario que ha iniciado sesión
async function github(url) {
  const respuesta = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!respuesta.ok) throw new Error("Error " + respuesta.status);
  return respuesta.json();
}

// Abre en GitHub la lista de solicitudes creadas por quien ha iniciado sesión, para verlas y editarlas
function verMisSolicitudes() {
  window.open(`${REPO_WEB}/issues?q=is%3Aissue+author%3A%40me`, "_blank");
}

// Abre el formulario de GitHub para crear una solicitud nueva
function nuevaSolicitud() {
  window.open(`${REPO_WEB}/issues/new/choose`, "_blank");
}

// Cierra la sesión y vuelve a la página de inicio
function salir() {
  localStorage.removeItem("gestion-token");
  sessionStorage.removeItem("gestion-token");
  location.href = "../index.html";
}

// Botones
document.getElementById("btn-nueva").onclick = nuevaSolicitud;
document.getElementById("btn-mis-github").onclick = verMisSolicitudes;
document.getElementById("btn-salir").onclick = salir;

if (!token) location.href = "index.html";
else cargarUsuario().catch(() => {});