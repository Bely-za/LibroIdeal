"use strict";

// ============================================
// LIBRO IDEAL - CONFIGURACIÓN BASE
// ============================================
const CLAVE_PERFIL = "libroideal_perfil";
const CLAVE_LIBROS_COMUNIDAD = "libroideal_libros";
const CLAVE_RECOMENDACIONES = "libroideal_recomendaciones";

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
    el.style.color = "#7a1f1f"; // Fuerza el color rojo directamente
  }
}

function limpiarErrores(ids) {
  ids.forEach(id => mostrarError(id, ""));
}

function mostrarAviso(id, mensaje, tipo) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = mensaje;
  // Se añade siempre 'error' o 'exito' dinámicamente
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
    // --- USUARIO NO LOGUEADO ---
    contenedor.innerHTML = "";
    contenedor.style.display = "none";
    
    // Mostrar Registro si existe
    if (formInscripcion) formInscripcion.closest('.panel').style.display = "block";
    
    // Ocultar sección de compartir libros
    if (formLibro) formLibro.closest('.panel').style.display = "none";
    return;
  }

  // --- USUARIO LOGUEADO ---
  contenedor.style.display = "block";
  
  // Ocultar sección de Registro por completo
  if (formInscripcion) formInscripcion.closest('.panel').style.display = "none";
  
  // Mostrar la sección de Compartir un Libro por completo
  if (formLibro) formLibro.closest('.panel').style.display = "block";

 contenedor.innerHTML = `
    <div class="tarjeta-registro">
      <div class="cuerpo-registro">
        <h4><i class="fa-solid fa-user icono-usuario-perfil"></i> ${datos.nombre}</h4>
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
    mostrarAviso("aviso-inscripcion", "Sesión cerrada.", "error"); // Alertas en rojo al cerrar
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
    
    // Refrescar la interfaz para que oculte/muestre los paneles
    mostrarPerfilGuardado();
    formulario.reset();
  });
}

// ============================================
// 2. COMPARTIR LIBROS
// ============================================
function inicializarFormularioLibro() {
  const formulario = document.getElementById("formulario-libro");
  if (!formulario) return;

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const libro = {
      id: Date.now(),
      titulo: document.getElementById("titulo-libro").value,
      autor: document.getElementById("autor-libro").value,
      genero: document.getElementById("genero-libro").value,
      formato: document.getElementById("formato-libro").value,
      enlace: document.getElementById("enlace-libro").value,
      descripcion: document.getElementById("descripcion-libro").value,
      fechaCreacion: new Date().toISOString()
    };

    const libros = leerLista(CLAVE_LIBROS_COMUNIDAD);
    libros.push(libro);
    guardarLista(CLAVE_LIBROS_COMUNIDAD, libros);

    mostrarAviso("aviso-libro", "¡Libro publicado con éxito!", "exito");
    formulario.reset();
  });
}

// ============================================
// CARGA DEL DOM
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarInscripcion();
  inicializarFormularioLibro();
});