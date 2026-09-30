const REPO_API = "https://api.github.com/repos/FraHe006/AppData";
const REPO_WEB = "https://github.com/FraHe006/AppData";
const token = localStorage.getItem("gestion-token") || sessionStorage.getItem("gestion-token");

let issues = [];   // aquí se guardan las solicitudes al cargarlas

// Pide algo a GitHub con el token
async function github(url) {
  const respuesta = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!respuesta.ok) throw new Error("Error " + respuesta.status);
  return respuesta.json();
}

// Abre en GitHub la lista de solicitudes creadas por quien ha iniciado sesión, para verlas y editarlas
function verMisSolicitudes() {
  window.open(`${REPO_WEB}/issues?q=is%3Aissue+author%3A%40me`, "_blank");
}

function nuevaSolicitud() {
  window.open(`${REPO_WEB}/issues/new?template=solicitud.yml`, "_blank");
}

// Descarga un archivo JSON con los datos que le pases
function descargar(datos, nombreArchivo) {
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)]));
  enlace.download = nombreArchivo;
  enlace.click();
}

// Contar 

function esAprobada(i) {
  return i.state === "open" && i.labels.some(l => l.name === "aprobada");
}

function contarPendientes(issues) {
  return issues.filter(i => i.state === "open" && !esAprobada(i)).length;
}

function contarAprobadas(issues) {
  return issues.filter(esAprobada).length;
}

function contarRechazadas(issues) {
  return issues.filter(i => i.state === "closed").length;
}

// Descarga las solicitudes de GitHub y pone los totales
async function contar() {
  issues = await github(`${REPO_API}/issues?state=all&per_page=100`);
  document.getElementById("stat-pendientes").textContent = contarPendientes(issues);
  document.getElementById("stat-aprobadas").textContent = contarAprobadas(issues);
  document.getElementById("stat-rechazadas").textContent = contarRechazadas(issues);
}

// Deja cada solicitud solo con lo útil para el JSON
function simplificar(i) {
  return { id: i.number, titulo: i.title, autor: i.user.login, texto: i.body };
}

// Botones 

document.getElementById("btn-actualizar").onclick = contar;

document.getElementById("btn-descargar-aprobadas").onclick = () =>
  descargar(issues.filter(esAprobada).map(simplificar), "actividades.json");

document.getElementById("btn-descargar-todo").onclick = () =>
  descargar(issues.map(simplificar), "copia-solicitudes.json");

// ── Al abrir la página ───────────────────────────────────────

if (!token) location.href = "index.html";
else contar();