// ============================================
// LibroIdeal — inicio.js
//  Aquí se cargan la parte "Lo más buscado" desde el JSON 
// y va a permiti marcar/desmarcar favoritos desde la portada.
// ============================================

function crearTarjetaDestacada(libro) {
  const esFav = esFavorito(libro.id);

  const precioTexto = libro.precio > 0
    ? `₡${libro.precio.toLocaleString("es-CR")}`
    : "Gratis";

  const articulo = document.createElement("article");
  articulo.className = "tarjeta-libro";

  articulo.innerHTML = `
    <div class="portada-envoltorio">
      <span class="etiqueta-estado">${libro.formato}</span>

      <img
        src="${libro.imagen}"
        alt="Portada de ${libro.titulo}"
        class="portada-libro">
    </div>

    <div class="info-libro">
      <span class="nombre-libro">${libro.titulo}</span>

      <span class="autor-libro">
        ${libro.autor}
      </span>

      <div class="fila-precio">
        <span class="precio ${libro.precio === 0 ? "gratis" : ""}">
          ${precioTexto}
        </span>

        <button
          class="boton-favorito ${esFav ? "activo" : ""}"
          aria-label="Marcar ${libro.titulo} como favorito"
          aria-pressed="${esFav}"
          data-id="${libro.id}">

          ${esFav ? "&#10084;" : "&#9825;"}
        </button>
      </div>
    </div>
  `;

  return articulo;
}

async function inicializarDestacados() {
  const contenedor = document.getElementById("contenedor-destacados");
  if (!contenedor) return;

  try {
    const libros = await cargarCatalogoCompleto();
    // "Lo más buscado": los primeros 4 libros del catálogo
    const destacados = libros.slice(0, 4);

    contenedor.innerHTML = "";
    destacados.forEach((libro) => {
      contenedor.appendChild(crearTarjetaDestacada(libro));
    });

    contenedor.addEventListener("click", (evento) => {
      const boton = evento.target.closest(".boton-favorito");
      if (!boton) return;
      const id = Number(boton.dataset.id);
      const activo = alternarFavorito(id);
      boton.classList.toggle("activo", activo);
      boton.setAttribute("aria-pressed", activo ? "true" : "false");
      boton.innerHTML = activo ? "&#10084;" : "&#9825;";
    });
  } catch (error) {
    contenedor.innerHTML = `<p>No se pudieron cargar los libros destacados. Intenta recargar la página.</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", inicializarDestacados);
