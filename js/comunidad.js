"use strict";

// ============================================
// LIBRO IDEAL - CONFIGURACIÓN BASE
// ============================================

const CLAVE_PERFIL = "libroideal_perfil";
const CLAVE_LIBROS_COMUNIDAD = "libroideal_libros_comunidad"; 

// ============================================
// HELPERS LOCALSTORAGE
// ============================================
function leerLista(clave) {
  return JSON.parse(localStorage.getItem(clave) || "[]");
}

function guardarLista(clave, lista) {
  localStorage.setItem(clave, JSON.stringify(lista));
}

// ============================================
// UI HELPERS
// ============================================
function mostrarError(id, mensaje) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = mensaje;
    el.style.color = "#7a1f1f";
  }
}

function limpiarErrores(ids) {
  ids.forEach(id => mostrarError(id, ""));
}

function mostrarAviso(id, mensaje, tipo) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = mensaje;
  el.className = `banner-aviso mostrar ${tipo}`;

  setTimeout(() => {
    el.classList.remove("mostrar");
  }, 4000);
}

// ============================================
// 1. CONTROL DE SESIÓN Y REGISTRO
// ============================================
function validarInscripcion(datos) {
  let valido = true;

  limpiarErrores([
    "error-nombre-usuario",
    "error-correo-usuario",
    "error-password-usuario",
    "error-confirmar-password",
    "error-genero-favorito"
  ]);

  if (datos.nombre.length < 3) {
    mostrarError("error-nombre-usuario", "Mínimo 3 letras.");
    valido = false;
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(datos.correo)) {
    mostrarError("error-correo-usuario", "Correo inválido.");
    valido = false;
  }

  if (datos.password.length < 6) {
    mostrarError("error-password-usuario", "Mínimo 6 caracteres.");
    valido = false;
  }

  if (datos.password !== datos.confirmar) {
    mostrarError("error-confirmar-password", "No coinciden.");
    valido = false;
  }

  if (!datos.generoFavorito) {
    mostrarError("error-genero-favorito", "Selecciona un género.");
    valido = false;
  }

  return valido;
}

function mostrarPerfilGuardado() {
  const contenedor = document.getElementById("perfil-guardado");
  const formInscripcion = document.getElementById("formulario-inscripcion");
  const formLibro = document.getElementById("formulario-libro");

  if (!contenedor) return;

  const datos = JSON.parse(localStorage.getItem(CLAVE_PERFIL));

  if (!datos) {
    contenedor.innerHTML = "";
    contenedor.style.display = "none";

    if (formInscripcion) formInscripcion.closest('.panel').style.display = "block";
    if (formLibro) formLibro.closest('.panel').style.display = "none";
    return;
  }

  contenedor.style.display = "block";
  if (formInscripcion) formInscripcion.closest('.panel').style.display = "none";
  if (formLibro) formLibro.closest('.panel').style.display = "block";

  contenedor.innerHTML = `
    <div class="tarjeta-registro">
      <div class="cuerpo-registro">
        <h4><i class="fa-solid fa-user"></i> ${datos.nombre}</h4>
        <span class="meta-registro">
          ${datos.correo}<br>
          Género Favorito: ${datos.generoFavorito}<br>
          Estado: <strong>Sesión activa</strong>
        </span>
      </div>
      <button class="boton-eliminar" id="cerrar-sesion">Cerrar sesión</button>
    </div>
  `;

  document.getElementById("cerrar-sesion").addEventListener("click", () => {
    localStorage.removeItem(CLAVE_PERFIL);
    mostrarPerfilGuardado();
    if (formInscripcion) formInscripcion.reset();
    mostrarAviso("aviso-inscripcion", "Sesión cerrada.", "error");
  });
}

function inicializarInscripcion() {
  const formulario = document.getElementById("formulario-inscripcion");
  if (!formulario) return;

  mostrarPerfilGuardado();

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const datos = {
      nombre: document.getElementById("nombre-usuario").value.trim(),
      correo: document.getElementById("correo-usuario").value.trim(),
      password: document.getElementById("password-usuario").value,
      confirmar: document.getElementById("confirmar-password").value,
      generoFavorito: document.getElementById("genero-favorito").value
    };

    if (!validarInscripcion(datos)) {
      mostrarAviso("aviso-inscripcion", "Revisa los campos en rojo.", "error");
      return;
    }

    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(datos));
    mostrarPerfilGuardado();
    formulario.reset();
  });
}

// ============================================
// 2. GESTIÓN DE LIBROS (RENDER, ELIMINAR Y VALIDACIÓN)
// ============================================

// Renderiza dinámicamente la lista de libros de la comunidad con opción de eliminar
function renderizarLibrosComunidad() {
  const contenedor = document.getElementById("lista-libros-comunidad");
  if (!contenedor) return;

  const libros = leerLista(CLAVE_LIBROS_COMUNIDAD);
  contenedor.innerHTML = "";

  if (libros.length === 0) {
    contenedor.innerHTML = "<p class='descripcion-panel'>No has publicado ningún libro todavía.</p>";
    return;
  }

  libros.forEach((libro) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-registro";
    tarjeta.innerHTML = `
      <div class="cuerpo-registro">
        <h4>${libro.titulo}</h4>
        <span class="meta-registro">
          Autor: ${libro.autor} | Género: ${libro.genero} | Formato: ${libro.formato}
        </span>
        <p class="texto-registro">${libro.descripcion}</p>
      </div>
      <button class="boton-eliminar" data-id="${libro.id}">Eliminar</button>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// Configura las validaciones en tiempo real (Input) para evitar errores del usuario
function inicializarValidacionTiempoRealLibro() {
  const campos = ["titulo-libro", "autor-libro", "descripcion-libro"];
  
  campos.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", () => {
      if (input.value.trim() === "") {
        input.style.borderColor = "#7a1f1f";
      } else {
        input.style.borderColor = "#ece4d2"; // Color crema original
      }
    });
  });
}

function inicializarFormularioLibro() {
  const formulario = document.getElementById("formulario-libro");
  if (!formulario) return;

  renderizarLibrosComunidad();
  inicializarValidacionTiempoRealLibro();

  // Capturar clicks de eliminación mediante delegación de eventos
  const contenedorLista = document.getElementById("lista-libros-comunidad");
  if (contenedorLista) {
    contenedorLista.addEventListener("click", (e) => {
      if (e.target.classList.contains("boton-eliminar")) {
        const idEliminar = Number(e.target.dataset.id);
        let libros = leerLista(CLAVE_LIBROS_COMUNIDAD);
        
        // Filtrar para remover el seleccionado
        libros = libros.filter(libro => libro.id !== idEliminar);
        guardarLista(CLAVE_LIBROS_COMUNIDAD, libros);
        
        // Actualizar interfaz 
        renderizarLibrosComunidad();
        mostrarAviso("aviso-libro", "Libro eliminado correctamente.", "error");
      }
    });
  }

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo-libro").value.trim();
    const autor = document.getElementById("autor-libro").value.trim();
    const genero = document.getElementById("genero-libro").value;
    const formato = document.getElementById("formato-libro").value;
    const enlace = document.getElementById("enlace-libro").value.trim();
    const descripcion = document.getElementById("descripcion-libro").value.trim();

    // Validación  antes de guardar
    if (!titulo || !autor || !genero || !formato || !descripcion) {
      mostrarAviso("aviso-libro", "Por favor, completa todos los campos obligatorios.", "error");
      return;
    }

    const libro = {
      id: Date.now(), // ID único requerido
      titulo,
      autor,
      genero,
      estado: "Disponible", // Requerido para que el catálogo no falle
      formato,
      enlace,
      descripcion,
      imagen: "img/libros/principito.png", // Imageen temporal por defecto para evitar rotos en el catálogo
      precio: 0,
      fechaCreacion: new Date().toISOString()
    };

    const libros = leerLista(CLAVE_LIBROS_COMUNIDAD);
    libros.push(libro);
    guardarLista(CLAVE_LIBROS_COMUNIDAD, libros);

    mostrarAviso("aviso-libro", "¡Libro publicado con éxito!", "exito");
    formulario.reset();
    
    // Actualizar la lista en pantalla 
    renderizarLibrosComunidad();
  });
}

// ============================================
// CARGA DEL DOM
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarInscripcion();
  inicializarFormularioLibro();
});