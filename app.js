/**
 * Ruca Tucun - Motor Interactivo Oficial
 * Tienda Oficial • Actividades • Información & Origen
 */

const CONFIG = {
  // Teléfono oficial para consultas y pedidos en Mar del Plata
  whatsappNumber: "5492236001234",
  catalogPath: "data/ruca_catalog.json",
  eventsPath: "data/ruca_events.json",
  jefaturasPath: "data/ruca_jefaturas.json"
};

// Estado global de la aplicación
let catalogData = [];
let eventsData = [];
let jefaturasData = [];
let currentItem = null;
let selectedSize = "M";
let currentCategory = "all";
let currentTab = "info";

// Inicialización cuando carga la página
document.addEventListener("DOMContentLoaded", async () => {
  setupGeneralWhatsAppLinks();
  await Promise.all([
    loadCatalog(),
    loadEvents(),
    loadJefaturas()
  ]);
  setupEventListeners();
  handleRouting();
});

// Configurar enlaces generales de WhatsApp
function setupGeneralWhatsAppLinks() {
  const generalMsg = encodeURIComponent("¡Hola Ruca Tucun! Me comunico desde la web oficial para hacer una consulta sobre la comunidad y actividades.");
  const generalUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${generalMsg}`;
  
  const navBtn = document.getElementById("navGeneralWaBtn");
  const floatingBtn = document.getElementById("floatingGeneralWaBtn");
  if (navBtn) navBtn.href = generalUrl;
  if (floatingBtn) floatingBtn.href = generalUrl;
}

// Alternar entre pestañas principales: Tienda, Actividades, Información
function switchMainTab(tabName) {
  currentTab = tabName;
  closeDetailView(false); // Cerrar modal si estuviera abierto

  const sections = {
    tienda: document.getElementById("sectionTienda"),
    actividades: document.getElementById("sectionActividades"),
    info: document.getElementById("sectionInfo")
  };

  const desktopBtns = {
    tienda: document.getElementById("tabBtnTienda"),
    actividades: document.getElementById("tabBtnActividades"),
    info: document.getElementById("tabBtnInfo")
  };

  const mobileBtns = {
    tienda: document.getElementById("mobileTabBtnTienda"),
    actividades: document.getElementById("mobileTabBtnActividades"),
    info: document.getElementById("mobileTabBtnInfo")
  };

  // Mostrar la sección correspondiente
  Object.keys(sections).forEach(key => {
    if (sections[key]) {
      if (key === tabName) {
        sections[key].classList.remove("hidden");
      } else {
        sections[key].classList.add("hidden");
      }
    }
  });

  // Actualizar estilos en botones desktop
  Object.keys(desktopBtns).forEach(key => {
    if (desktopBtns[key]) {
      if (key === tabName) {
        desktopBtns[key].classList.add("active", "text-rucaGold");
        desktopBtns[key].classList.remove("text-slate-300");
      } else {
        desktopBtns[key].classList.remove("active", "text-rucaGold");
        desktopBtns[key].classList.add("text-slate-300");
      }
    }
  });

  // Actualizar estilos en botones móvil
  Object.keys(mobileBtns).forEach(key => {
    if (mobileBtns[key]) {
      if (key === tabName) {
        mobileBtns[key].classList.add("text-rucaGold", "bg-rucaCard", "font-bold");
        mobileBtns[key].classList.remove("text-slate-300");
      } else {
        mobileBtns[key].classList.remove("text-rucaGold", "bg-rucaCard", "font-bold");
        mobileBtns[key].classList.add("text-slate-300");
      }
    }
  });

  // Actualizar URL sin recargar
  if (!window.location.hash.startsWith("#prenda/")) {
    history.replaceState(null, "", `#${tabName}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Carga asíncrona del catálogo
async function loadCatalog() {
  try {
    const res = await fetch(CONFIG.catalogPath);
    if (!res.ok) throw new Error("No se pudo cargar el catálogo.");
    catalogData = await res.json();
    renderCatalog(catalogData);
  } catch (err) {
    console.error("Error al cargar datos:", err);
    const countEl = document.getElementById("catalogCount");
    if (countEl) countEl.innerText = "Error cargando prendas.";
  }
}

// Renderizado de las prendas en el catálogo
function renderCatalog(items) {
  const container = document.getElementById("catalogGrid");
  const emptyState = document.getElementById("emptyState");
  const countEl = document.getElementById("catalogCount");

  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.classList.add("hidden");
    if (emptyState) emptyState.classList.remove("hidden");
    if (countEl) countEl.innerText = "0 prendas encontradas";
    return;
  }

  container.classList.remove("hidden");
  if (emptyState) emptyState.classList.add("hidden");
  if (countEl) countEl.innerText = `${items.length} ${items.length === 1 ? 'prenda disponible' : 'prendas disponibles'}`;

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "product-card bg-rucaCard rounded-2xl border border-rucaBorder overflow-hidden shadow-lg flex flex-col justify-between";
    
    const waUrl = buildWhatsAppLink(item, "Talle a convenir");
    const mainImg = item.images && item.images.length > 0 ? item.images[0] : "assets/indumentaria_oficial_real.png";
    const formattedPrice = item.price.toLocaleString("es-AR");

    card.innerHTML = `
      <div class="relative h-64 bg-rucaDark overflow-hidden cursor-pointer" onclick="openDetailView('${item.id}')">
        <img src="${mainImg}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
        <span class="absolute top-3 left-3 bg-rucaBlack/85 backdrop-blur-md text-rucaGold text-[10px] font-bold px-2 py-0.5 rounded border border-rucaGold/30 uppercase tracking-wider">
          ${item.category}
        </span>
        ${item.featured ? `
          <span class="absolute top-3 right-3 bg-rucaGold text-rucaBlack text-[10px] font-black px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
            Oficial
          </span>
        ` : ''}
      </div>

      <div class="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-[11px] text-rucaGray font-mono mb-1">
            <span>CÓD: ${item.id}</span>
          </div>
          <h3 class="font-extrabold text-white text-base leading-snug hover:text-rucaGold transition-colors cursor-pointer line-clamp-2" onclick="openDetailView('${item.id}')">
            ${item.title}
          </h3>
          <p class="text-slate-300 text-xs mt-2 line-clamp-2 leading-relaxed">
            ${item.shortDescription}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-rucaBorder flex items-center justify-between gap-2">
          <div>
            <span class="text-[9px] text-rucaGray uppercase font-bold block">Precio</span>
            <span class="text-base sm:text-lg font-black text-rucaGold">$ ${formattedPrice} <span class="text-[10px] text-slate-400 font-normal">ARS</span></span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="openDetailView('${item.id}')" class="px-3 py-1.5 bg-rucaDark hover:bg-rucaGold hover:text-rucaBlack text-white font-bold text-xs rounded-xl border border-rucaBorder transition-all">
              Ver Detalle
            </button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" 
               class="p-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl shadow-md transition-all hover:scale-105"
               title="Consultar por WhatsApp">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.077-1.78-.396-1.393-.574-2.3-1.987-2.37-2.079-.069-.092-.562-.748-.562-1.424 0-.675.353-1.008.478-1.137.126-.13.275-.162.366-.162.091 0 .183.001.263.005.085.004.198-.032.308.232.114.275.389.948.423 1.017.034.069.057.149.011.239-.045.092-.068.149-.137.229-.068.08-.145.18-.207.241-.069.069-.141.144-.06.284.08.138.358.591.768.956.528.471.975.617 1.113.686.137.069.218.057.299-.035.08-.092.344-.402.436-.539.092-.138.184-.115.309-.069.126.046.797.376.935.445.138.069.229.103.263.161.035.057.035.332-.109.737z"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Generador de enlace contextualizado para WhatsApp
function buildWhatsAppLink(item, talle) {
  const cleanPhone = CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const directUrl = `${window.location.origin}${window.location.pathname}#prenda/${item.id}`;
  const formattedPrice = item.price.toLocaleString("es-AR");

  const lines = [
    "¡Hola Ruca Tucun! Quiero encargar la siguiente prenda oficial desde la web:",
    `📌 *${item.title}*`,
    `🔢 Código: *${item.id}*`,
    `📏 Talle elegido: *${talle}*`,
    `💰 Precio: *$ ${formattedPrice} ARS*`,
    `🔗 Enlace a la prenda: ${directUrl}`,
    "",
    "¿Podrían confirmarme disponibilidad y forma de entrega para este sábado?"
  ];

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// Abrir modal de detalle
function openDetailView(id) {
  const item = catalogData.find(i => i.id === id);
  if (!item) return;

  currentItem = item;
  window.location.hash = `#prenda/${id}`;

  const formattedPrice = `$ ${item.price.toLocaleString("es-AR")} ARS`;

  document.getElementById("detailRef").innerText = `CÓD: ${item.id}`;
  document.getElementById("detailTitle").innerText = item.title;
  document.getElementById("detailCategory").innerText = item.category;
  document.getElementById("detailPrice").innerText = formattedPrice;
  document.getElementById("detailFullDescription").innerText = item.fullDescription;

  // Galería
  const mainImg = document.getElementById("detailMainImage");
  const thumbsContainer = document.getElementById("detailThumbnails");
  thumbsContainer.innerHTML = "";

  if (item.images && item.images.length > 0) {
    mainImg.src = item.images[0];
    mainImg.alt = item.title;

    item.images.forEach((imgUrl, index) => {
      const thumb = document.createElement("button");
      thumb.className = `w-14 h-11 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${index === 0 ? 'border-rucaGold' : 'border-transparent opacity-60 hover:opacity-100'}`;
      thumb.innerHTML = `<img src="${imgUrl}" alt="Miniatura ${index + 1}" class="w-full h-full object-cover">`;
      thumb.onclick = () => {
        mainImg.src = imgUrl;
        thumbsContainer.querySelectorAll("button").forEach(b => {
          b.classList.remove("border-rucaGold");
          b.classList.add("border-transparent", "opacity-60");
        });
        thumb.classList.add("border-rucaGold");
        thumb.classList.remove("border-transparent", "opacity-60");
      };
      thumbsContainer.appendChild(thumb);
    });
  }

  // Talles disponibles
  const talleContainer = document.getElementById("talleSelectorContainer");
  talleContainer.innerHTML = "";
  
  let availableSizes = ["S", "M", "L", "XL"];
  if (item.specs && item.specs["Talles Disponibles"]) {
    availableSizes = item.specs["Talles Disponibles"].split(",").map(s => s.trim());
  } else if (item.category === "Gorras") {
    availableSizes = ["Único Regulable"];
  }

  selectedSize = availableSizes[0];
  updateTalleSelection();

  availableSizes.forEach(talle => {
    const btn = document.createElement("button");
    btn.className = `talle-btn text-xs font-bold px-3 py-1.5 rounded-lg border border-rucaBorder ${talle === selectedSize ? 'active' : 'bg-rucaCard text-slate-200'}`;
    btn.innerText = talle;
    btn.onclick = () => {
      selectedSize = talle;
      updateTalleSelection();
      talleContainer.querySelectorAll(".talle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    talleContainer.appendChild(btn);
  });

  // Ficha técnica (Specs)
  const specsGrid = document.getElementById("detailSpecsGrid");
  specsGrid.innerHTML = "";
  if (item.specs) {
    Object.entries(item.specs).forEach(([k, v]) => {
      const specBox = document.createElement("div");
      specBox.className = "bg-rucaCard border border-rucaBorder rounded-xl p-2.5";
      specBox.innerHTML = `
        <span class="text-[10px] text-rucaGray font-medium block uppercase">${k}</span>
        <span class="text-xs font-bold text-white block mt-0.5">${v}</span>
      `;
      specsGrid.appendChild(specBox);
    });
  }

  // Sticky bar móvil
  const mobileBar = document.getElementById("mobileStickyBar");
  document.getElementById("mobileStickyPrice").innerText = formattedPrice;
  mobileBar.classList.remove("hidden");

  // Mostrar modal
  document.getElementById("detailView").classList.remove("hidden");
}

// Actualizar talle y link de WhatsApp
function updateTalleSelection() {
  const label = document.getElementById("selectedTalleLabel");
  if (label) label.innerText = `Talle ${selectedSize}`;

  if (currentItem) {
    const waUrl = buildWhatsAppLink(currentItem, selectedSize);
    document.getElementById("detailWaBtn").href = waUrl;
    document.getElementById("mobileStickyWaBtn").href = waUrl;
  }
}

// Cerrar modal
function closeDetailView(resetHash = true) {
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("mobileStickyBar").classList.add("hidden");
  if (resetHash && window.location.hash.startsWith("#prenda/")) {
    window.location.hash = `#${currentTab}`;
  }
  currentItem = null;
}

// Router por Hash (#tienda, #actividades, #info, #prenda/TUC-001)
function handleRouting() {
  const hash = window.location.hash;
  if (hash.startsWith("#prenda/")) {
    const id = hash.replace("#prenda/", "");
    switchMainTab("tienda");
    openDetailView(id);
  } else if (hash === "#tienda") {
    switchMainTab("tienda");
  } else if (hash === "#actividades") {
    switchMainTab("actividades");
  } else if (hash === "#info") {
    switchMainTab("info");
  } else {
    // Por defecto al entrar a la web: Información & Origen
    switchMainTab("info");
  }
}

// Filtrar por categoría rápida en la tienda
function setCategoryFilter(category) {
  currentCategory = category;
  document.querySelectorAll(".cat-pill").forEach(btn => {
    if (btn.dataset.cat === category) {
      btn.classList.add("bg-rucaGold", "text-rucaBlack", "font-extrabold");
      btn.classList.remove("bg-rucaCard", "text-slate-200");
    } else {
      btn.classList.remove("bg-rucaGold", "text-rucaBlack", "font-extrabold");
      btn.classList.add("bg-rucaCard", "text-slate-200");
    }
  });
  applyFilters();
}

// Búsqueda en vivo y ordenamiento
function applyFilters() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const sort = document.getElementById("sortFilter").value;

  let filtered = catalogData.filter(item => {
    const matchesCategory = currentCategory === "all" || item.category === currentCategory;
    const matchesQuery = query === "" || 
      item.title.toLowerCase().includes(query) || 
      item.shortDescription.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query)) ||
      (item.specs && JSON.stringify(item.specs).toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  if (sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderCatalog(filtered);
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("sortFilter").value = "default";
  setCategoryFilter("all");
}

// MANEJO DE EDICIÓN Y CARGA DE FOTOS DE JEFES DE RUCA
function triggerJefePhotoUpload(jefeId) {
  currentTargetJefeId = jefeId;
  const input = document.getElementById("jefePhotoInput");
  if (input) input.click();
}

function handleJefePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentTargetJefeId) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgEl = document.getElementById(`jefeImg-${currentTargetJefeId}`);
    const placeholderEl = document.getElementById(`jefePlaceholder-${currentTargetJefeId}`);
    
    if (imgEl && placeholderEl) {
      imgEl.src = e.target.result;
      imgEl.classList.remove("hidden");
      placeholderEl.classList.add("hidden");
    }
  };
  reader.readAsDataURL(file);
}

function setupEventListeners() {
  window.addEventListener("hashchange", handleRouting);
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("sortFilter").addEventListener("change", applyFilters);
}
