// ============================================
// LibroIdeal — utilidades.js
// Funciones compartidas por todas las páginas
// ============================================

// --- Menú móvil ---
function inicializarMenuMovil() {
  const boton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu-principal");
  if (!boton || !menu) return;

  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
}

// --- Claves de localStorage usadas en todo el sitio ---
const CLAVE_FAVORITOS = "libroideal_favoritos";
const CLAVE_RECOMENDACIONES = "libroideal_recomendaciones";
const CLAVE_LIBROS_COMUNIDAD = "libroideal_libros_comunidad";

// --- Helpers genéricos de almacenamiento ---
function leerLista(clave) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error("No se pudo leer " + clave, error);
    return [];
  }
}

function guardarLista(clave, lista) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista));
  } catch (error) {
    console.error("No se pudo guardar " + clave, error);
  }
}

// --- Favoritos ---
function obtenerFavoritos() {
  return leerLista(CLAVE_FAVORITOS);
}

function esFavorito(idLibro) {
  return obtenerFavoritos().includes(idLibro);
}

function alternarFavorito(idLibro) {
  const favoritos = obtenerFavoritos();
  const indice = favoritos.indexOf(idLibro);
  if (indice >= 0) {
    favoritos.splice(indice, 1);
  } else {
    favoritos.push(idLibro);
  }
  guardarLista(CLAVE_FAVORITOS, favoritos);
  return favoritos.includes(idLibro);
}

// --- Carga compartida del catálogo JSON ---
async function cargarCatalogo() {
  const respuesta = await fetch("data/libros.json");
  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el catálogo de libros");
  }
  return respuesta.json();
}

// Combina el catálogo base con los libros que la comunidad ha subido
async function cargarCatalogoCompleto() {
  const base = await cargarCatalogo();
  const comunidad = leerLista(CLAVE_LIBROS_COMUNIDAD);
  return base.concat(comunidad);
}

document.addEventListener("DOMContentLoaded", inicializarMenuMovil);
