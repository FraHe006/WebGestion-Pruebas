const ORG  = "FraHe006";   // dueño del repo de datos (ver nota abajo)
const REPO = "AppData";    // repo privado con las solicitudes

// Comprueba el token: devuelve { usuario, avatar, rol } o lanza un Error
async function comprobarToken(token) {
  const cabeceras = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };

  // Comprobar a quien pertenece el tocken que se ha introducido en el formulario
  const respuestaUsuario = await fetch("https://api.github.com/user", { headers: cabeceras });
  if (respuestaUsuario.status === 401) throw new Error("El token no es válido o ha caducado.");
  if (!respuestaUsuario.ok) throw new Error(`GitHub no responde (error ${respuestaUsuario.status}). Inténtalo más tarde.`);
  const usuario = await respuestaUsuario.json();

  // Validar y comprobar que permisos tiene en el repo
  const respuestaRepo = await fetch(`https://api.github.com/repos/${ORG}/${REPO}`, { headers: cabeceras });
  if (respuestaRepo.status === 404 || respuestaRepo.status === 403) {
    throw new Error("No tienes acceso. Pide que te añadan a la afiliación.");
  }
  if (!respuestaRepo.ok) throw new Error(`GitHub no responde (error ${respuestaRepo.status}). Inténtalo más tarde.`);
  const repo = await respuestaRepo.json();

  // Asignar rol según sus permisos en el repo
  const permisos = repo.permissions || {};
  return {
    usuario: usuario.login,
    avatar: usuario.avatar_url,
    rol: permisos.admin || permisos.maintain ? "admin" : "miembro",
  };
}

// Formulario del index
document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = document.getElementById("input-token").value.trim();
  const error = document.getElementById("login-error");
  const boton = document.getElementById("btn-entrar");

  error.hidden = true;
  boton.disabled = true;
  boton.textContent = "Comprobando…";

  try {
    // Esperar a que se compruebe el token
    const sesion = await comprobarToken(token);

    // Recordar el token (localStorage) o solo mientras la pestaña esté abierta (sessionStorage)
    const recordar = document.getElementById("check-recordar").checked;
    const almacen = recordar ? localStorage : sessionStorage;
    almacen.setItem("gestion-token", token);
    almacen.setItem("gestion-sesion", JSON.stringify(sesion));

    // Si es admin, a la página de admin; si no, a sus solicitudes
    location.href = sesion.rol === "admin" ? "admin.html" : "mis-solicitudes.html";
  } catch (err) {
    document.getElementById("login-error-texto").textContent = err.message;
    error.hidden = false;
    boton.disabled = false;
    boton.textContent = "Entrar";
  }
});