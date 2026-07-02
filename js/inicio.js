// ============================================================================
// LibroIdeal — inicio.js
// CONTROLADOR DE LA PÁGINA DE INICIO (PORTADA) Bely
// ============================================================================

// Esta función la utilizo para construir dinámicamente el HTML de las tarjetas 
// de los libros destacados ("Lo más buscado") usando Template Literals.
function crearTarjetaDestacada(libro) {
  // Verifica con el helper de utilidades.js si este libro ya está guardado en favoritos
  const esFav = esFavorito(libro.id);


  const precioTexto = libro.precio > 0
    ? `₡${libro.precio.toLocaleString("es-CR")}`
    : "Gratis";

  // Creo el elemento contenedor article en el DOM de forma dinámica
  const articulo = document.createElement("article");
  articulo.className = "tarjeta-libro";

  // Inyecto la estructura con las propiedades del objeto libro que viene del JSON
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

// Esta función se encarga de cargar el JSON, cortar los primeros 4 libros y pintarlos
async function inicializarDestacados() {
  const contenedor = document.getElementById("contenedor-destacados");
  if (!contenedor) return;

  try {
    // Espero a que cargue el catálogo completo combinado (JSON + Comunidad)
    const libros = await cargarCatalogoCompleto();
    
    //  agarre solo los primeros 4 libros del arreglo mediante un slice
    const destacados = libros.slice(0, 4);

    contenedor.innerHTML = "";
    // Recorre el sub-arreglo para ir inyectando cada tarjeta hija en el contenedor
    destacados.forEach((libro) => {
      contenedor.appendChild(crearTarjetaDestacada(libro));
    });

    //  Aplico delegación de eventos, usandolos clics en el contenedor padre
    contenedor.addEventListener("click", (evento) => {
      const boton = evento.target.closest(".boton-favorito");
      if (!boton) return;
      
      const id = Number(boton.dataset.id);
      const activo = alternarFavorito(id); // Guarda o saca de localStorage en utilidades.js
      
      // Cambio que realice para mejorar visualmente el corazón y los atributos de accesibilidad en tiempo real
      boton.classList.toggle("activo", activo);
      boton.setAttribute("aria-pressed", activo ? "true" : "false");
      boton.innerHTML = activo ? "&#10084;" : "&#9825;";
    });
  } catch (error) {
    contenedor.innerHTML = `<p>No se pudieron cargar los libros destacados. Intenta recargar la página.</p>`;
    console.error(error);
  }
}

// ============================================================================
// GESTIÓN DINÁMICA DE RECOMENDACIONES (NUEVA SECCIÓN EN INICIO)
// ============================================================================

// las opiniones y recomendaciones leyendo la clave de localStorage
function renderizarRecomendaciones() {
  const contenedor = document.getElementById("lista-recomendaciones");
  const estadoVacio = document.getElementById("estado-vacio-recomendaciones");
  if (!contenedor) return;

  // Utilizo el helper leerLista pasándole la constante global configurada en utilidades.js *importante*
  const recomendaciones = leerLista(CLAVE_RECOMENDACIONES);
  contenedor.innerHTML = "";

  // Si el localStorage está vacío, muestre un mensaje amigable para que dejen la primera opinión
  if (recomendaciones.length === 0) {
    if (estadoVacio) estadoVacio.style.display = "block";
    return;
  }

  if (estadoVacio) estadoVacio.style.display = "none";

  // Recorre las opiniones y crea las tarjetas con un botón de eliminar único por ID
  recomendaciones.forEach((rec) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-registro";
    tarjeta.innerHTML = `
      <div class="cuerpo-registro">
        <h4>${rec.titulo}</h4>
        <span class="meta-registro">Autor del libro: ${rec.autor}</span>
        <p class="texto-registro">"${rec.texto}"</p>
      </div>
      <button class="boton-eliminar" data-id="${rec.id}">Eliminar</button>
    `;
    contenedor.appendChild(tarjeta);
  });
}

function inicializarValidacionTiempoRealRecomendaciones() {
  const campos = ["titulo-recomendado", "autor-recomendado", "texto-recomendacion"];
  
  campos.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", () => {
      if (input.value.trim() === "") {
        input.style.borderColor = "#7a1f1f"; // Borde vino (idedica error) indicando que hace falta rellenarlo
      } else {
        input.style.borderColor = "#ece4d2"; // Restaura color crema base de estilos
      }
    });
  });
}

// Administrador central de los eventos y captura del formulario de recomendaciones (guarda)
function inicializarSeccionRecomendaciones() {
  const formulario = document.getElementById("formulario-recomendacion");
  if (!formulario) return;

  // Hago la primera carga en pantalla y activo la validación interactiva instantánea
  renderizarRecomendaciones();
  inicializarValidacionTiempoRealRecomendaciones();

  //  revisa los clics en la lista para procesar las eliminaciones específicas por ID
  const listaContenedor = document.getElementById("lista-recomendaciones");
  if (listaContenedor) {
    listaContenedor.addEventListener("click", (e) => {
      if (e.target.classList.contains("boton-eliminar")) {
        const idEliminar = Number(e.target.dataset.id);
        let recomendaciones = leerLista(CLAVE_RECOMENDACIONES);

        // Filtro arreglo para excluir el objeto exacto que el usuario desea borrar
        recomendaciones = recomendaciones.filter(rec => rec.id !== idEliminar);
        guardarLista(CLAVE_RECOMENDACIONES, recomendaciones);

        // Refresca la interfaz de forma inmediata
        renderizarRecomendaciones();
        
        // Muestra un banner temporal notificando la eliminación *funciona*
        const aviso = document.getElementById("aviso-recomendacion");
        if (aviso) {
          aviso.textContent = "Recomendación eliminada correctamente.";
          aviso.className = "banner-aviso mostrar error";
          setTimeout(() => aviso.classList.remove("mostrar"), 4000);
        }
      }
    });
  }

  // Listener para el botón secundario que limpia todo el almacenamiento 
  const botonLimpiar = document.getElementById("boton-limpiar-recomendaciones");
  if (botonLimpiar) {
    botonLimpiar.addEventListener("click", () => {
      localStorage.removeItem(CLAVE_RECOMENDACIONES);
      renderizarRecomendaciones();
    });
  }

  // Capturo la acción de submit para guardar un nuevo aporte
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo-recomendado").value.trim();
    const autor = document.getElementById("autor-recomendado").value.trim();
    const texto = document.getElementById("texto-recomendacion").value.trim();

    // Validación tradicional e indispensable por si intentan enviar campos en blanco (kevin recomendo)
    if (!titulo || !autor || !texto) {
      const aviso = document.getElementById("aviso-recomendacion");
      if (aviso) {
        aviso.textContent = "Por favor, completa todos los campos requeridos.";
        aviso.className = "banner-aviso mostrar error";
        setTimeout(() => aviso.classList.remove("mostrar"), 4000);
      }
      return;
    }

    // Estructura el objeto con un ID único basado en la marca de tiempo (Date.now())
    const nuevaRecomendacion = {
      id: Date.now(),
      titulo,
      autor,
      texto
    };

    const recomendaciones = leerLista(CLAVE_RECOMENDACIONES);
    recomendaciones.push(nuevaRecomendacion);
    guardarLista(CLAVE_RECOMENDACIONES, recomendaciones);

    // Muestra el banner verde para verificar que fue exitoso
    const aviso = document.getElementById("aviso-recomendacion");
    if (aviso) {
      aviso.textContent = "¡Muchas gracias! Tu recomendación ha sido publicada.";
      aviso.className = "banner-aviso mostrar exito";
      setTimeout(() => aviso.classList.remove("mostrar"), 4000);
    }

    formulario.reset();
    renderizarRecomendaciones(); // actaiza la lista en pantalla
  });
}

// ============================================================================
// CARGA INICIAL DEL DOM EN LA PORTADA
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Unifiqué los cargadores en un único listener para evitar conflictos de sobreescritura
  inicializarDestacados();
  inicializarSeccionRecomendaciones();
});