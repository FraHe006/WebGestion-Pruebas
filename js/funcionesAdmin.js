const REPO_API = "https://api.github.com/repos/FraHe006/AppData";
const REPO_WEB = "https://github.com/FraHe006/AppData";

const WEB = { owner: "FraHe006", repo: "WebGestion-Pruebas", path: "actividades.json" };

const token = localStorage.getItem("gestion-token") || sessionStorage.getItem("gestion-token");

let issues = [];   // aquí se guardan las solicitudes al cargarlas

// Pide algo a GitHub con el token del usuario que ha iniciado sesión
async function github(url) {
  const respuesta = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!respuesta.ok) throw new Error("Error " + respuesta.status);
  return respuesta.json();
}

// Convierte el texto de un formulario de GitHub en un objeto con los campos y sus valores
function camposDelFormulario(texto) {
  const campos = {};
  (texto || "").split(/^### /m).slice(1).forEach(bloque => {
    const [titulo, ...resto] = bloque.split("\n");
    const valor = resto.join("\n").trim();
    campos[titulo.trim()] = valor === "_No response_" ? "" : valor;
  });
  return campos;
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

// Descarga un archivo JSON con los datos de todas las solicitudes o solo las aprobadas
function descargar(datos, nombreArchivo) {
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)]));
  enlace.download = nombreArchivo;
  enlace.click();
}

async function subirJSON(datos, nombreArchivo) {
  const url = `https://api.github.com/repos/${WEB.owner}/${WEB.repo}/contents/${WEB.path}`;
  const contenido = btoa(JSON.stringify(datos, null, 2));

  const respuesta = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Actualizar ${nombreArchivo}`,
      content: contenido,
      sha: await obtenerSHA(url)
    })
  });

  if (!respuesta.ok) throw new Error("Error al subir el archivo");
}

// Dashboard de estadísticas de solicitudes

// Comprueba si una solicitud tiene la etiqueta "aprobada"
function esAprobada(i) {
  return i.labels.some(l => l.name === "aprobada");
}

// Comprueba si una solicitud tiene la etiqueta "rechazada"
function esRechazada(i) {
  return i.labels.some(l => l.name === "rechazada");
}

// Comprueba si una solicitud tiene la etiqueta "pendiente"
function esPendiente(i) {
  return i.labels.some(l => l.name === "pendiente");
}

// Cuanta cuántas solicitudes hay de cada tipo y muestra el total, también muestra las solicitudes aprobadas en la sección de actividades
async function contar() {
  try {
    const todo = await github(`${REPO_API}/issues?state=all&per_page=100`);
    issues = todo.filter(i => !i.pull_request);
    document.getElementById("stat-pendientes").textContent = issues.filter(esPendiente).length;
    document.getElementById("stat-aprobadas").textContent = issues.filter(esAprobada).length;
    document.getElementById("stat-rechazadas").textContent = issues.filter(esRechazada).length;
    mostrarActividades();
  } catch (e) {
    alert("No se pudieron cargar las solicitudes (" + e.message + ")");
  }
}

// Función para asignar cada dato a su tipo
function pasarAJson(i) {
  return {
    id: i.number,
    titulo: i.title,
    autor: i.user.login,
    etiquetas: i.labels.map(l => l.name),
    creada: i.created_at,
    actualizada: i.updated_at,
    enlace: i.html_url,
    datos: camposDelFormulario(i.body)
  };
}

// Actividades
// Sustituye los caracteres especiales por sus entidades HTML para que se muestren correctamente en la página
const escapar = t => (t || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Convierte cualquier valor en texto legible
const texto = v => Array.isArray(v) ? v.join(", ") : String(v ?? "");

// Pinta un objeto como filas de una tabla
const filas = obj => Object.entries(obj)
  .map(([k, v]) => `<tr><th>${escapar(k)}</th><td>${escapar(texto(v))}</td></tr>`)
  .join("");

// Convierte una solicitud en una tarjeta HTML para mostrarla en la lista de actividades
const tarjeta = i => {
  const { datos, ...general } = pasarAJson(i);
  return `<li><details open>
    <summary>#${i.number} ${escapar(i.title)} — ${escapar(i.user.login)}</summary>
    <table>${filas(general)}${filas(datos)}</table>
    <a href="${i.html_url}" target="_blank" rel="noopener">Abrir en GitHub</a>
  </details></li>`;
};


// Muestra las solicitudes aprobadas en la sección de actividades
const mostrarActividades = () => document.getElementById("lista-actividades").innerHTML = issues.filter(esAprobada).map(tarjeta).join("") || "<li>No hay actividades aprobadas.</li>";

// Botones 
document.getElementById("btn-nueva").onclick = nuevaSolicitud;

document.getElementById("btn-mis-github").onclick = verMisSolicitudes;

document.querySelectorAll(".salir").forEach(b => b.onclick = salir);

document.getElementById("btn-actualizar").onclick = contar;

document.getElementById("btn-descargar-aprobadas").onclick = () =>
  descargar(issues.filter(esAprobada).map(pasarAJson), "actividades.json");

document.getElementById("btn-descargar-todo").onclick = () =>
  descargar(issues.map(pasarAJson), "copia-solicitudes.json");

document.getElementById("btn-subir-actividades").onclick = async () => {
  try {
    await subirJSON(issues.filter(esAprobada).map(pasarAJson), "actividades.json");
    alert("Actividades aprobadas subidas correctamente.");
  } catch (e) {
    alert("Error al subir las actividades: " + e.message);
  } 
}

if (!token) location.href = "index.html";
else {
  contar();
}