// ============================================
// LibroIdeal — comunidad.js
// Página de Registro/Gestión de información:
// inscripción de usuario, compartir libros y
// recomendaciones, todo con validación y
// persistencia en localStorage.
// ============================================

const CLAVE_PERFIL = "libroideal_perfil";

// ---------- Helpers de validación y UI ----------
function mostrarError(idCampoError, mensaje) {
  const span = document.getElementById(idCampoError);
  if (span) span.textContent = mensaje;
}

function limpiarErrores(idsErrores) {
  idsErrores.forEach((id) => mostrarError(id, ""));
}

function mostrarAviso(idAviso, mensaje, tipo) {
  const aviso = document.getElementById(idAviso);
  aviso.textContent = mensaje;
  aviso.className = `banner-aviso mostrar ${tipo}`;
  setTimeout(() => {
    aviso.classList.remove("mostrar");
  }, 4000);
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
}

// ============================================
// 1. INSCRIPCIÓN DE USUARIO
// ============================================

function validarInscripcion(datos) {
  let valido = true;
  limpiarErrores(["error-nombre-usuario", "error-correo-usuario", "error-genero-favorito"]);

  if (datos.nombre.trim().length < 3) {
    mostrarError("error-nombre-usuario", "Escribe tu nombre completo (mínimo 3 letras).");
    valido = false;
  }
  const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patronCorreo.test(datos.correo)) {
    mostrarError("error-correo-usuario", "Ingresa un correo electrónico válido.");
    valido = false;
  }
  if (!datos.generoFavorito) {
    mostrarError("error-genero-favorito", "Selecciona tu género literario favorito.");
    valido = false;
  }
  return valido;
}

function mostrarPerfilGuardado() {
  const contenedor = document.getElementById("perfil-guardado");
  const datos = JSON.parse(localStorage.getItem(CLAVE_PERFIL) || "null");
  if (!datos) {
    contenedor.innerHTML = "";
    return;
  }
  contenedor.innerHTML = `
    <div class="tarjeta-registro">
      <div class="cuerpo-registro">
        <h4>${datos.nombre}</h4>
        <span class="meta-registro">${datos.correo} · Le gusta: ${datos.generoFavorito}</span>
      </div>
      <button class="boton-eliminar" id="boton-cerrar-perfil">Cerrar sesión</button>
    </div>
  `;
  document.getElementById("boton-cerrar-perfil").addEventListener("click", () => {
    localStorage.removeItem(CLAVE_PERFIL);
    mostrarPerfilGuardado();
    document.getElementById("formulario-inscripcion").reset();
    mostrarAviso("aviso-inscripcion", "Sesión cerrada. Tus datos fueron eliminados de este navegador.", "exito");
  });
}

function inicializarInscripcion() {
  const formulario = document.getElementById("formulario-inscripcion");

  // Si ya existe un perfil guardado, lo mostramos al cargar la página.
  mostrarPerfilGuardado();

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = {
      nombre: document.getElementById("nombre-usuario").value,
      correo: document.getElementById("correo-usuario").value,
      generoFavorito: document.getElementById("genero-favorito").value,
    };

    if (!validarInscripcion(datos)) {
      mostrarAviso("aviso-inscripcion", "Revisa los campos marcados antes de continuar.", "error");
      return;
    }

    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(datos));
    mostrarAviso("aviso-inscripcion", `¡Bienvenida/o, ${datos.nombre}! Tu perfil se guardó correctamente.`, "exito");
    mostrarPerfilGuardado();
    formulario.reset();
  });

  // Validación en tiempo real
  document.getElementById("nombre-usuario").addEventListener("input", (e) => {
    mostrarError("error-nombre-usuario", e.target.value.trim().length < 3 ? "Mínimo 3 letras." : "");
  });
  document.getElementById("correo-usuario").addEventListener("input", (e) => {
    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    mostrarError("error-correo-usuario", patronCorreo.test(e.target.value) ? "" : "Formato de correo inválido.");
  });
}

// ============================================
// 2. COMPARTIR LIBROS (datos + enlace, sin archivo real)
// ============================================

function validarLibro(datos) {
  let valido = true;
  limpiarErrores([
    "error-titulo-libro", "error-autor-libro", "error-genero-libro",
    "error-formato-libro", "error-enlace-libro", "error-descripcion-libro",
  ]);

  if (datos.titulo.trim().length < 2) { mostrarError("error-titulo-libro", "Escribe el título del libro."); valido = false; }
  if (datos.autor.trim().length < 2) { mostrarError("error-autor-libro", "Escribe el nombre del autor."); valido = false; }
  if (!datos.genero) { mostrarError("error-genero-libro", "Selecciona un género."); valido = false; }
  if (!datos.formato) { mostrarError("error-formato-libro", "Selecciona un formato."); valido = false; }
  try {
    new URL(datos.enlace);
  } catch {
    mostrarError("error-enlace-libro", "Ingresa una URL válida (debe iniciar con https://)."); valido = false;
  }
  if (datos.descripcion.trim().length < 10) { mostrarError("error-descripcion-libro", "Escribe al menos 10 caracteres."); valido = false; }

  return valido;
}

function coloresAleatorios() {
  const paletas = [
    ["#cfe3ee", "#5b87a3"], ["#3a1f1f", "#7a1f1f"], ["#2e1f3a", "#caa83d"],
    ["#e8dcc0", "#a98b5d"], ["#f2d9c4", "#caa23a"], ["#caa23a", "#6b4423"],
  ];
  return paletas[Math.floor(Math.random() * paletas.length)];
}

function renderizarLibrosComunidad() {
  const lista = document.getElementById("lista-libros-comunidad");
  const vacio = document.getElementById("vacio-libros-comunidad");
  const libros = leerLista(CLAVE_LIBROS_COMUNIDAD);

  lista.innerHTML = "";
  if (libros.length === 0) {
    vacio.hidden = false;
    return;
  }
  vacio.hidden = true;

  libros.forEach((libro) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-registro";
    tarjeta.innerHTML = `
      <div class="cuerpo-registro">
        <h4>${libro.titulo} <span class="meta-registro">— ${libro.autor}</span></h4>
        <span class="meta-registro">${libro.genero} · ${libro.formato} · compartido el ${formatearFecha(libro.fechaCreacion)}</span>
        <p class="texto-registro">${libro.descripcion}</p>
        <p class="texto-registro"><a href="${libro.enlace}" target="_blank" rel="noopener noreferrer">Ver enlace de descarga &#8599;</a></p>
      </div>
      <button class="boton-eliminar" data-id="${libro.id}">Eliminar</button>
    `;
    lista.appendChild(tarjeta);
  });

  lista.querySelectorAll(".boton-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      const nuevaLista = leerLista(CLAVE_LIBROS_COMUNIDAD).filter((libro) => libro.id !== id);
      guardarLista(CLAVE_LIBROS_COMUNIDAD, nuevaLista);
      renderizarLibrosComunidad();
    });
  });
}

function inicializarFormularioLibro() {
  const formulario = document.getElementById("formulario-libro");
  
  const usuario = JSON.parse(localStorage.getItem(CLAVE_PERFIL));
const aviso = document.getElementById("aviso-libro");

function mostrarAviso(id, mensaje, tipo) {
  const aviso = document.getElementById(id);

  aviso.textContent = mensaje;

  aviso.classList.remove("exito", "error");
  aviso.classList.add(tipo);

  aviso.classList.add("mostrar"); 
}
if (!usuario) {
  formulario.style.display = "none";

  mostrarAviso(
    "aviso-libro",
    "Debes crear un perfil antes de compartir un libro con la comunidad.",
    "error"
  );

  return;
}

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const [color1, color2] = coloresAleatorios();
    const datos = {
      titulo: document.getElementById("titulo-libro").value,
      autor: document.getElementById("autor-libro").value,
      genero: document.getElementById("genero-libro").value,
      formato: document.getElementById("formato-libro").value,
      enlace: document.getElementById("enlace-libro").value,
      descripcion: document.getElementById("descripcion-libro").value,
    };

    if (!validarLibro(datos)) {
      mostrarAviso("aviso-libro", "Hay campos por corregir antes de compartir el libro.", "error");
      return;
    }

    const librosActuales = leerLista(CLAVE_LIBROS_COMUNIDAD);
    librosActuales.push({
      id: Date.now(),
      titulo: datos.titulo,
      autor: datos.autor,
      genero: datos.genero,
      estado: "Disponible",
      anno: new Date().getFullYear(),
      formato: datos.formato,
      precio: 0,
      descripcion: datos.descripcion,
      enlace: datos.enlace,
      color1, color2,
      usuario: usuario.nombre,
      fechaCreacion: new Date().toISOString(),
    });
    guardarLista(CLAVE_LIBROS_COMUNIDAD, librosActuales);

    mostrarAviso("aviso-libro", "¡Gracias! Tu libro ya aparece en el catálogo de la comunidad.", "exito");
    formulario.reset();
    renderizarLibrosComunidad();
  });
}

// ============================================
// 3. RECOMENDACIONES
// ============================================

function validarRecomendacion(datos) {
  let valido = true;
  limpiarErrores(["error-titulo-recomendado", "error-autor-recomendado", "error-texto-recomendacion"]);

  if (datos.titulo.trim().length < 2) { mostrarError("error-titulo-recomendado", "Escribe el título del libro."); valido = false; }
  if (datos.autor.trim().length < 2) { mostrarError("error-autor-recomendado", "Escribe el nombre del autor."); valido = false; }
  if (datos.texto.trim().length < 10) { mostrarError("error-texto-recomendacion", "Cuéntanos un poco más (mínimo 10 caracteres)."); valido = false; }

  return valido;
}

function renderizarRecomendaciones() {
  const lista = document.getElementById("lista-recomendaciones");
  const vacio = document.getElementById("vacio-recomendaciones");
  const recomendaciones = leerLista(CLAVE_RECOMENDACIONES);

  lista.innerHTML = "";
  if (recomendaciones.length === 0) {
    vacio.hidden = false;
    return;
  }
  vacio.hidden = true;

  recomendaciones
    .slice()
    .reverse()
    .forEach((recomendacion) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-registro";
      tarjeta.innerHTML = `
        <div class="cuerpo-registro">
          <h4>${recomendacion.titulo} <span class="meta-registro">— ${recomendacion.autor}</span></h4>
          <span class="meta-registro">${formatearFecha(recomendacion.fecha)}</span>
          <p class="texto-registro">${recomendacion.texto}</p>
        </div>
        <button class="boton-eliminar" data-id="${recomendacion.id}">Eliminar</button>
      `;
      lista.appendChild(tarjeta);
    });

  lista.querySelectorAll(".boton-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const id = Number(boton.dataset.id);
      const nuevaLista = leerLista(CLAVE_RECOMENDACIONES).filter((r) => r.id !== id);
      guardarLista(CLAVE_RECOMENDACIONES, nuevaLista);
      renderizarRecomendaciones();
    });
  });
}

function inicializarFormularioRecomendacion() {
  const formulario = document.getElementById("formulario-recomendacion");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = {
      titulo: document.getElementById("titulo-recomendado").value,
      autor: document.getElementById("autor-recomendado").value,
      texto: document.getElementById("texto-recomendacion").value,
    };

    if (!validarRecomendacion(datos)) {
      mostrarAviso("aviso-recomendacion", "Completa correctamente el formulario antes de publicar.", "error");
      return;
    }

    const lista = leerLista(CLAVE_RECOMENDACIONES);
    lista.push({
      id: Date.now(),
      titulo: datos.titulo,
      autor: datos.autor,
      texto: datos.texto,
      fecha: new Date().toISOString(),
    });
    guardarLista(CLAVE_RECOMENDACIONES, lista);

    mostrarAviso("aviso-recomendacion", "Tu recomendación fue publicada. ¡Gracias por compartirla!", "exito");
    formulario.reset();
    renderizarRecomendaciones();
  });

  document.getElementById("boton-limpiar-recomendaciones").addEventListener("click", () => {
    const lista = leerLista(CLAVE_RECOMENDACIONES);
    if (lista.length === 0) {
      mostrarAviso("aviso-recomendacion", "No hay recomendaciones que limpiar.", "error");
      return;
    }
    const confirmar = confirm("¿Seguro que deseas eliminar todas tus recomendaciones? Esta acción no se puede deshacer.");
    if (!confirmar) return;
    guardarLista(CLAVE_RECOMENDACIONES, []);
    renderizarRecomendaciones();
    mostrarAviso("aviso-recomendacion", "Todas las recomendaciones fueron eliminadas.", "exito");
  });
}

// ============================================
// Inicialización general de la página
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarInscripcion();
  inicializarFormularioLibro();
  inicializarFormularioRecomendacion();
  renderizarLibrosComunidad();
  renderizarRecomendaciones();
});
