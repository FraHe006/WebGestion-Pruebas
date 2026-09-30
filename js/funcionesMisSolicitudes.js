const REPO_WEB = "https://github.com/FraHe006/AppData";

// Abre en GitHub la lista de solicitudes creadas por quien ha iniciado sesión, para verlas y editarlas
function verMisSolicitudes() {
  window.open(`${REPO_WEB}/issues?q=is%3Aissue+author%3A%40me`, "_blank");
}

// Abre el formulario de GitHub para crear una solicitud nueva
function nuevaSolicitud() {
  window.open(`${REPO_WEB}/issues/new?template=solicitud.yml`, "_blank");
}