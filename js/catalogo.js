// ============================================
// LibroIdeal — catalogo.js
// Página de Solución Interactiva Principal:
// carga JSON, búsqueda instantánea, filtros,
// favoritos con localStorage, estados vacíos.
// ============================================

let TODOS_LOS_LIBROS = [];
let ESTADO = {
  texto: "",
  genero: "todos",
  orden: "relevancia",
  soloFavoritos: false,
};

function crearTarjetaCatalogo(libro) {
  const esFav = esFavorito(libro.id);
  const precioTexto = libro.precio > 0
    ? `₡${libro.precio.toLocaleString("es-CR")}`
    : "Gratis";

  const articulo = document.createElement("article");
  articulo.className = "tarjeta-libro";

  articulo.innerHTML = `
    <div class="portada-envoltorio">
      <span class="etiqueta-estado">${libro.estado}</span>

      <img
        src="${libro.imagen}"
        alt="Portada de ${libro.titulo}"
        class="portada-libro">
    </div>

    <div class="info-libro">
      <span class="nombre-libro">${libro.titulo}</span>

      <span class="autor-libro">
        ${libro.autor} · ${libro.genero}
      </span>

      <p style="font-size:0.78rem; color:#6b4423; margin:4px 0 0;">
        ${libro.descripcion}
      </p>

      <div class="fila-precio">
        <span class="precio ${libro.precio === 0 ? "gratis" : ""}">
          ${precioTexto} · ${libro.formato}
        </span>

        <button class="boton-favorito ${esFav ? "activo" : ""}"
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

function obtenerGenerosUnicos(libros) {
  const generos = new Set(libros.map((libro) => libro.genero));
  return Array.from(generos).sort();
}

function construirChipsGenero(libros) {
  const contenedor = document.getElementById("contenedor-generos");
  const generos = obtenerGenerosUnicos(libros);

  generos.forEach((genero) => {
    const boton = document.createElement("button");
    boton.className = "chip";
    boton.dataset.genero = genero;
    boton.textContent = genero;
    contenedor.appendChild(boton);
  });

  contenedor.addEventListener("click", (evento) => {
    const chip = evento.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll("#contenedor-generos .chip").forEach((c) => c.classList.remove("activo"));
    chip.classList.add("activo");
    ESTADO.genero = chip.dataset.genero;
    aplicarFiltrosYRenderizar();
  });
}

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filtrarLibros() {
  let resultado = TODOS_LOS_LIBROS.filter((libro) => {
    const coincideTexto =
      ESTADO.texto === "" ||
      normalizar(libro.titulo).includes(normalizar(ESTADO.texto)) ||
      normalizar(libro.autor).includes(normalizar(ESTADO.texto));

    const coincideGenero = ESTADO.genero === "todos" || libro.genero === ESTADO.genero;
    const coincideFavorito = !ESTADO.soloFavoritos || esFavorito(libro.id);

    return coincideTexto && coincideGenero && coincideFavorito;
  });

  if (ESTADO.orden === "az") {
    resultado = resultado.slice().sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (ESTADO.orden === "za") {
    resultado = resultado.slice().sort((a, b) => b.titulo.localeCompare(a.titulo));
  }

  return resultado;
}

function aplicarFiltrosYRenderizar() {
  const contenedor = document.getElementById("contenedor-catalogo");
  const estadoVacio = document.getElementById("estado-vacio");
  const resumen = document.getElementById("resumen-resultados");

  const resultados = filtrarLibros();

  contenedor.innerHTML = "";

  if (resultados.length === 0) {
    estadoVacio.hidden = false;
    contenedor.style.display = "none";
  } else {
    estadoVacio.hidden = true;
    contenedor.style.display = "grid";
    resultados.forEach((libro) => contenedor.appendChild(crearTarjetaCatalogo(libro)));
  }

  const totalFavoritos = obtenerFavoritos().length;
  resumen.innerHTML = `Mostrando <strong>${resultados.length}</strong> de ${TODOS_LOS_LIBROS.length} libros &nbsp;·&nbsp; Favoritos guardados: <span class="contador-favoritos">${totalFavoritos}</span>`;
}

function inicializarEventosFiltros() {
  const campoBusqueda = document.getElementById("campo-busqueda");
  campoBusqueda.addEventListener("input", (evento) => {
    ESTADO.texto = evento.target.value;
    aplicarFiltrosYRenderizar();
  });

  const ordenSelect = document.getElementById("orden-resultados");
  ordenSelect.addEventListener("change", (evento) => {
    ESTADO.orden = evento.target.value;
    aplicarFiltrosYRenderizar();
  });

  const botonFavoritos = document.getElementById("boton-solo-favoritos");
  botonFavoritos.addEventListener("click", () => {
    ESTADO.soloFavoritos = !ESTADO.soloFavoritos;
    botonFavoritos.classList.toggle("boton-dorado", ESTADO.soloFavoritos);
    botonFavoritos.textContent = ESTADO.soloFavoritos ? "Viendo solo favoritos" : "Ver solo favoritos";
    aplicarFiltrosYRenderizar();
  });

  document.getElementById("contenedor-catalogo").addEventListener("click", (evento) => {
    const boton = evento.target.closest(".boton-favorito");
    if (!boton) return;
    const id = Number(boton.dataset.id);
    const activo = alternarFavorito(id);
    boton.classList.toggle("activo", activo);
    boton.setAttribute("aria-pressed", activo ? "true" : "false");
    boton.innerHTML = activo ? "&#10084;" : "&#9825;";
    // Si estamos en modo "solo favoritos", re-renderizar para reflejar el cambio.
    if (ESTADO.soloFavoritos) {
      aplicarFiltrosYRenderizar();
    } else {
      // Actualizar solo el contador en el resumen, sin perder el resto de la lista.
      const resumen = document.getElementById("resumen-resultados");
      const totalFavoritos = obtenerFavoritos().length;
      resumen.querySelector(".contador-favoritos").textContent = totalFavoritos;
    }
  });
}

async function inicializarCatalogo() {
  const contenedor = document.getElementById("contenedor-catalogo");
  try {
    TODOS_LOS_LIBROS = await cargarCatalogoCompleto();
    construirChipsGenero(TODOS_LOS_LIBROS);
    inicializarEventosFiltros();
    aplicarFiltrosYRenderizar();
  } catch (error) {
    contenedor.innerHTML = `<p>No se pudo cargar el catálogo. Verifica tu conexión e intenta de nuevo.</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", inicializarCatalogo);
