/**
 * Ruca Tucun - Motor Interactivo Oficial
 * Tienda Oficial • Actividades • Información & Origen
 */

const CONFIG = {
  // Teléfono oficial para consultas y pedidos en Mar del Plata
  whatsappNumber: "5492236001234",
  catalogPath: `data/ruca_catalog.json?t=${Date.now()}`,
  eventsPath: `data/ruca_events.json?t=${Date.now()}`,
  timelinePath: `data/ruca_timeline.json?t=${Date.now()}`,
  jefaturasPath: `data/ruca_jefaturas.json?t=${Date.now()}`,
  juegoPath: `data/ruca_juego.json?t=${Date.now()}`,
  organigramasPath: `data/ruca_organigramas.json?t=${Date.now()}`
};

// Estado global de la aplicación
let catalogData = [];
let eventsData = [];
let jefaturasData = [];
let organigramasData = [];
let timelineData = [];
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
    loadJefaturas(),
    loadOrganigramas(),
    loadTimeline(),
    loadJuego()
  ]);
  setupEventListeners();
  setupMobileAccordions();
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
    info: document.getElementById("sectionInfo"),
    organigrama: document.getElementById("sectionOrganigrama"),
    juga: document.getElementById("sectionJuga")
  };

  const desktopBtns = {
    tienda: document.getElementById("tabBtnTienda"),
    actividades: document.getElementById("tabBtnActividades"),
    info: document.getElementById("tabBtnInfo"),
    juga: document.getElementById("tabBtnJuga")
  };

  const mobileBtns = {
    tienda: document.getElementById("mobileTabBtnTienda"),
    actividades: document.getElementById("mobileTabBtnActividades"),
    info: document.getElementById("mobileTabBtnInfo"),
    juga: document.getElementById("mobileTabBtnJuga")
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
  if (!window.location.hash.startsWith("#prenda/") && !window.location.hash.startsWith("#organigrama/")) {
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
      <div class="relative h-40 sm:h-64 bg-rucaDark overflow-hidden cursor-pointer" onclick="openDetailView('${item.id}')">
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

      <div class="p-3 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <div class="hidden sm:flex items-center justify-between text-[11px] text-rucaGray font-mono mb-1">
            <span>CÓD: ${item.id}</span>
          </div>
          <h3 class="font-extrabold text-white text-[13px] sm:text-base leading-snug hover:text-rucaGold transition-colors cursor-pointer line-clamp-2" onclick="openDetailView('${item.id}')">
            ${item.title}
          </h3>
          <p class="hidden sm:block text-slate-300 text-xs mt-2 line-clamp-2 leading-relaxed">
            ${item.shortDescription}
          </p>
        </div>

        <div class="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-rucaBorder flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="hidden sm:block text-[9px] text-rucaGray uppercase font-bold">Precio</span>
            <span class="text-sm sm:text-lg font-black text-rucaGold">$ ${formattedPrice} <span class="hidden sm:inline text-[10px] text-slate-400 font-normal">ARS</span></span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="openDetailView('${item.id}')" class="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-rucaDark hover:bg-rucaGold hover:text-rucaBlack text-white font-bold text-xs rounded-xl border border-rucaBorder transition-all">
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
      const viewLabel = index === 0 ? "Vista Frontal" : index === 1 ? "Vista Trasera" : `Vista ${index + 1}`;
      const thumb = document.createElement("button");
      thumb.className = `flex items-center gap-2 px-2.5 py-1.5 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all bg-rucaBlack/80 backdrop-blur-md ${index === 0 ? 'border-rucaGold text-rucaGold shadow-lg' : 'border-rucaBorder text-slate-300 opacity-75 hover:opacity-100'}`;
      thumb.innerHTML = `
        <img src="${imgUrl}" alt="${viewLabel}" class="w-10 h-10 rounded-lg object-cover">
        <span class="text-[11px] font-bold pr-1">${viewLabel}</span>
      `;
      thumb.onclick = () => {
        mainImg.src = imgUrl;
        thumbsContainer.querySelectorAll("button").forEach(b => {
          b.classList.remove("border-rucaGold", "text-rucaGold", "shadow-lg");
          b.classList.add("border-rucaBorder", "text-slate-300", "opacity-75");
        });
        thumb.classList.add("border-rucaGold", "text-rucaGold", "shadow-lg");
        thumb.classList.remove("border-rucaBorder", "text-slate-300", "opacity-75");
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
  } else if (hash.startsWith("#organigrama/")) {
    switchMainTab("organigrama");
    renderOrganigrama(hash.replace("#organigrama/", ""));
    window.scrollTo({ top: 0 });
  } else if (hash === "#tienda") {
    switchMainTab("tienda");
  } else if (hash === "#actividades") {
    switchMainTab("actividades");
  } else if (hash === "#info") {
    switchMainTab("info");
  } else if (hash === "#juga") {
    switchMainTab("juga");
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

// ==========================================
// CARGA AUTOMATIZADA DE EVENTOS (PRÓXIMOS Y PASADOS)
// ==========================================
async function loadEvents() {
  try {
    const res = await fetch(CONFIG.eventsPath);
    if (!res.ok) throw new Error("No se pudo cargar la lista de eventos.");
    eventsData = await res.json();
    renderEvents();
  } catch (err) {
    console.error("Error al cargar eventos:", err);
  }
}

function renderEvents() {
  const upcomingContainer = document.getElementById("upcomingEventsContainer");
  const pastContainer = document.getElementById("pastEventsContainer");
  if (!upcomingContainer || !pastContainer) return;

  const upcoming = eventsData.filter(e => e.type === "proximo");
  const past = eventsData.filter(e => e.type === "pasado");

  // Renderizar Próximas Actividades
  upcomingContainer.innerHTML = upcoming.map(event => {
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(event.waQuery || "¡Hola! Quiero consultar por la actividad de Ruca Tucun.")}`;
    return `
      <div class="bg-rucaCard border border-rucaBorder hover:border-rucaGold/50 rounded-2xl p-6 transition-all shadow-md flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-xs font-mono font-bold text-rucaGold bg-rucaGold/10 px-2.5 py-1 rounded border border-rucaGold/30">
              ${event.dateBadge}
            </span>
            <span class="text-[11px] text-slate-400 font-mono">${event.time}</span>
          </div>
          <h4 class="text-lg font-bold text-white group-hover:text-rucaGold transition-colors mb-2">
            ${event.title}
          </h4>
          <p class="text-xs text-slate-300 mb-4 leading-relaxed font-light">
            ${event.description}
          </p>
        </div>

        <div class="text-[11px] text-slate-300 border-t border-rucaBorder pt-3 flex justify-between items-center mt-2">
          <span class="flex items-center gap-1 text-slate-400">
            <span>📍</span> ${event.location}
          </span>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" 
             class="text-rucaGold font-bold hover:underline flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Consultar →
          </a>
        </div>
      </div>
    `;
  }).join("");

  // Renderizar Hitos y Eventos Pasados (Galería Histórica)
  pastContainer.innerHTML = past.map(event => {
    return `
      <div class="bg-rucaCard rounded-3xl overflow-hidden border border-rucaBorder hover:border-rucaGold/40 transition-all shadow-xl flex flex-col justify-between group">
        <div class="relative h-64 sm:h-80 overflow-hidden bg-rucaBlack">
          <img src="${event.image}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute top-4 left-4 bg-rucaBlack/85 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-rucaGold border border-rucaGold/30">
            ${event.dateBadge}
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-2 text-xs text-slate-400">
            <span>🏛️ ${event.location}</span>
            <span>•</span>
            <span class="font-mono text-rucaGold">${event.time}</span>
          </div>
          <h4 class="font-extrabold text-white text-lg mb-2 group-hover:text-rucaGold transition-colors">
            ${event.title}
          </h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-4">
            ${event.description}
          </p>
          <div class="flex flex-wrap gap-1.5 border-t border-rucaBorder/60 pt-3">
            ${(event.tags || []).map(tag => `<span class="text-[10px] bg-rucaDark text-slate-400 px-2 py-0.5 rounded font-medium">#${tag}</span>`).join("")}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==========================================
// CARRUSEL DE JEFES DE RUCA & JERARQUÍA DE MANDO
// ==========================================
async function loadJefaturas() {
  try {
    const res = await fetch(CONFIG.jefaturasPath);
    if (!res.ok) throw new Error("No se pudo cargar la lista de jefaturas.");
    jefaturasData = await res.json();
    renderJefaturasCarousel();
  } catch (err) {
    console.error("Error al cargar jefaturas:", err);
  }
}

function renderJefaturasCarousel() {
  const track = document.getElementById("jefesCarouselTrack");
  if (!track) return;

  // Orden: del jefe más actual (izquierda) al más antiguo (derecha)
  const jefesOrdenados = [...jefaturasData].reverse();

  track.innerHTML = jefesOrdenados.map(jefe => {
    const isCurrent = jefe.isCurrent;
    const badgeHtml = jefe.badge ? `
      <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${isCurrent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rucaGold/20 text-rucaGold border border-rucaGold/40'}">
        ${jefe.badge}
      </span>
    ` : '';

    const isPhotoReal = jefe.photo && !jefe.photo.includes("escudo_ruca_tucun");
    const imgClass = isPhotoReal ? "w-full h-full object-cover object-center" : "w-full h-full object-contain filter drop-shadow";
    const containerPadding = isPhotoReal ? "p-0" : "p-3";

    return `
      <div class="jefe-carousel-card bg-rucaDark rounded-2xl p-5 border ${isCurrent ? 'border-rucaGold shadow-[0_0_15px_rgba(250,204,21,0.25)]' : 'border-rucaBorder'} text-center flex flex-col items-center justify-between cursor-pointer select-none"
           onclick="openJefeHierarchyModal('${jefe.id}')"
           title="Clic para ver Comando de Ruca completo">
        
        <div class="w-full flex items-center justify-between mb-3">
          <span class="text-xs font-mono font-bold ${isCurrent ? 'text-emerald-400' : 'text-rucaGold'} bg-rucaBlack/70 px-2 py-0.5 rounded">
            ${jefe.period}
          </span>
          ${badgeHtml}
        </div>

        <div class="relative w-24 h-24 rounded-full bg-rucaBlack border-2 ${isCurrent ? 'border-rucaGold' : 'border-rucaBorder'} flex items-center justify-center overflow-hidden mb-3 shadow-inner group-hover:scale-105 transition-transform ${containerPadding}">
          <img src="${jefe.photo || 'assets/escudo_ruca_tucun.png'}" alt="${jefe.jefeRuca}" class="${imgClass}">
        </div>

        <div class="w-full mb-3">
          <h4 class="font-extrabold text-white text-sm mb-0.5">${jefe.periodName}</h4>
          <p class="text-xs text-rucaGold font-semibold">${jefe.jefeRuca}</p>
        </div>

        <button class="w-full mt-auto text-[11px] font-bold py-1.5 px-3 rounded-xl border border-rucaGold/40 text-rucaGold hover:bg-rucaGold hover:text-rucaBlack transition-all flex items-center justify-center gap-1.5">
          <span>👑</span> Ver Comando de Ruca
        </button>
      </div>
    `;
  }).join("");
}

// Desplazamiento horizontal del carrusel con flechas
function scrollJefesCarousel(direction) {
  const track = document.getElementById("jefesCarouselTrack");
  if (!track) return;
  const scrollAmount = 290;
  track.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth"
  });
}

// Abrir modal con la jerarquía de mando del período seleccionado
function openJefeHierarchyModal(jefeId) {
  const jefe = jefaturasData.find(j => j.id === jefeId);
  if (!jefe) return;

  const modal = document.getElementById("jefeHierarchyModal");
  if (!modal) return;

  document.getElementById("modalJefePeriod").textContent = jefe.period;
  document.getElementById("modalJefePeriodName").textContent = jefe.periodName;
  document.getElementById("modalJefeName").textContent = jefe.jefeRuca;

  const avatarEl = document.getElementById("modalJefeAvatar");
  if (avatarEl) {
    if (jefe.photo && !jefe.photo.includes("escudo_ruca_tucun")) {
      avatarEl.innerHTML = `<img src="${jefe.photo}" alt="${jefe.jefeRuca}" class="w-full h-full object-cover object-center">`;
    } else {
      avatarEl.innerHTML = `<span>👑</span>`;
    }
  }

  const noteBox = document.getElementById("modalJefeNoteBox");
  const noteEl = document.getElementById("modalJefeNote");
  if (jefe.note) {
    noteEl.textContent = jefe.note;
    noteBox.classList.remove("hidden");
  } else {
    noteBox.classList.add("hidden");
  }

  const linksEl = document.getElementById("modalJefeOrgLinks");
  if (linksEl) {
    const anios = (jefe.period.match(/\d{4}/g) || []).map(Number);
    const desde = anios[0], hasta = anios[anios.length - 1];
    const lista = [];
    for (let y = desde; y <= hasta; y++) lista.push(y);
    linksEl.innerHTML = lista.map(y => {
      const org = organigramasData.find(o => o.year === y);
      return org
        ? `<a href="#organigrama/${org.id}" onclick="closeJefeHierarchyModal()" class="text-center bg-rucaGold/10 border border-rucaGold/40 text-rucaGold hover:bg-rucaGold hover:text-rucaBlack text-sm font-bold px-3 py-3 rounded-xl transition-all">Ver organigrama ${y}</a>`
        : `<span class="text-center bg-rucaDark/60 border border-rucaBorder/70 text-slate-500 text-sm font-semibold px-3 py-3 rounded-xl cursor-default" title="Todavía no está cargado">Organigrama ${y}<small class="block text-[10px] font-normal">Próximamente</small></span>`;
    }).join("");
  }

  modal.classList.remove("hidden");
}

async function loadOrganigramas() {
  try {
    const res = await fetch(CONFIG.organigramasPath);
    if (!res.ok) throw new Error("No se pudo cargar los organigramas.");
    organigramasData = await res.json();
  } catch (err) {
    console.error("Error al cargar organigramas:", err);
  }
}

function escHtml(t) {
  return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setupOrganigramaToggles() {
  const cont = document.getElementById("organigramaContent");
  if (!cont || cont.dataset.toggles) return;
  cont.dataset.toggles = "1";
  const esCelular = () => window.matchMedia("(max-width: 767px)").matches;
  cont.addEventListener("click", (e) => {
    if (!esCelular()) return;
    const sub = e.target.closest(".org-sub-head");
    if (sub) { sub.parentElement.classList.toggle("org-sub-open"); return; }
    const head = e.target.closest(".org-head");
    if (head && head.parentElement.classList.contains("org-expandable")) head.parentElement.classList.toggle("org-open");
  });
  cont.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("org-head")) { e.preventDefault(); e.target.click(); }
  });
}

function renderOrganigrama(id) {
  const cont = document.getElementById("organigramaContent");
  if (!cont) return;
  const org = organigramasData.find(o => String(o.id) === String(id));
  if (!org) {
    cont.innerHTML = `<p class="text-slate-300">No hay organigrama cargado para ese año todavía.</p>`;
    return;
  }
  const jef = jefaturasData.find(j => j.id === org.jefaturaId) || {};
  const [jefeCargo, ...resto] = org.comandoCentral;
  const foto = jef.photo && !jef.photo.includes("escudo_ruca_tucun")
    ? `<div class="org-avatar"><img src="${escHtml(jef.photo)}" alt="${escHtml(jefeCargo.nombre)}"></div>` : "";
  const cajas = resto.map(c => `<div class="org-box"><div class="org-cargo">${escHtml(c.cargo)}</div><div class="org-nombre">${escHtml(c.nombre)}</div></div>`).join("");
  const miembroHtml = m => typeof m === "string"
    ? `<li>${escHtml(m)}</li>`
    : `<li>${escHtml(m.nombre)}${m.cargo ? `<small>${escHtml(m.cargo)}</small>` : ""}</li>`;
  const subHtml = sg => `
        <div class="org-sub">
          <button type="button" class="org-sub-head">${sg.escudo ? `<img src="${escHtml(sg.escudo)}" alt="">` : ""}<span>${escHtml(sg.nombre)}</span><span class="org-chev">▾</span></button>
          <ul>${sg.miembros.map(miembroHtml).join("")}</ul>
        </div>`;
  const columnas = (org.columnas || []).map(c => {
    const unico = c.subgrupos.length === 1;
    const escudoUnico = unico && c.subgrupos[0].escudo ? `<img class="org-head-escudo" src="${escHtml(c.subgrupos[0].escudo)}" alt="">` : "";
    const tieneCuerpo = c.subgrupos.length > 0;
    return `
    <div class="org-col org-tone-${escHtml(c.tono)}${unico ? " org-single" : ""}${tieneCuerpo ? " org-expandable" : ""}">
      <div class="org-box org-head"${tieneCuerpo ? ' role="button" tabindex="0"' : ""}>
        ${escudoUnico}
        <div class="org-head-text">${c.cabeza.cargo ? `<div class="org-cargo">${escHtml(c.cabeza.cargo)}</div>` : ""}<div class="org-nombre">${escHtml(c.cabeza.nombre)}</div></div>
        ${tieneCuerpo ? '<span class="org-chev">▾</span>' : ""}
      </div>
      ${c.secretario ? `<div class="org-box org-secretario"><div class="org-cargo">${escHtml(c.secretario.cargo)}</div><div class="org-nombre">${escHtml(c.secretario.nombre)}</div></div>` : ""}
      ${tieneCuerpo ? `<section class="org-group org-colbody">${c.subgrupos.map(subHtml).join("")}</section>` : ""}
    </div>`;
  }).join("");
  const grupos = (org.grupos || []).map(g => `
    <section class="org-group org-tone-${escHtml(g.tono)}">
      <h3>${escHtml(g.titulo)}</h3>
      ${g.subgrupos.map(sg => `
        <div class="org-sub">
          <div class="org-sub-head">${sg.escudo ? `<img src="${escHtml(sg.escudo)}" alt="">` : ""}<span>${escHtml(sg.nombre)}</span></div>
          <ul>${sg.miembros.map(m => `<li>${escHtml(m)}</li>`).join("")}</ul>
        </div>`).join("")}
    </section>`).join("");
  setupOrganigramaToggles();
  cont.innerHTML = `
    <header class="text-center mb-8">
      <p class="text-xs font-bold tracking-widest text-rucaGold uppercase">Ruca Tucún${jef.period ? " • " + escHtml(jef.period) : ""}</p>
      <h1 class="text-3xl sm:text-4xl font-black text-white mt-1">${escHtml(org.titulo)}</h1>
    </header>
    <div class="flex flex-col items-center">
      <div class="org-box org-jefe">${foto}<div class="org-cargo">${escHtml(jefeCargo.cargo)}</div><div class="org-nombre">${escHtml(jefeCargo.nombre)}</div></div>
      <div class="org-level-line"></div>
      ${cajas ? `<div class="org-command">${cajas}</div>` : ""}
      <div class="org-level-line"></div>
    </div>
    ${columnas ? `<div class="org-cols">${columnas}</div>` : ""}
    ${grupos ? `<div class="org-groups">${grupos}</div>` : ""}`;
  document.title = `${org.titulo} | Ruca Tucún`;
}

function closeJefeHierarchyModal() {
  const modal = document.getElementById("jefeHierarchyModal");
  if (modal) modal.classList.add("hidden");
}

function setupEventListeners() {
  window.addEventListener("hashchange", handleRouting);
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("sortFilter").addEventListener("change", applyFilters);

  // Cerrar modales con la tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDetailView(true);
      closeJefeHierarchyModal();
      closeTimelineModal();
    }
  });

  // Cerrar modal al hacer clic en el fondo oscuro
  const tlModal = document.getElementById("timelineModal");
  if (tlModal) tlModal.addEventListener("click", (e) => { if (e.target === tlModal) closeTimelineModal(); });

  const hierModal = document.getElementById("jefeHierarchyModal");
  if (hierModal) {
    hierModal.addEventListener("click", (e) => {
      if (e.target === hierModal) closeJefeHierarchyModal();
    });
  }
}


// Secciones plegables en el celular (pestaña Información)
function setupMobileAccordions() {
  if (!window.matchMedia("(max-width: 767px)").matches) return;
  document.querySelectorAll("[data-acc]").forEach((box, idx) => {
    const body = document.createElement("div");
    body.className = "acc-body";
    while (box.firstChild) body.appendChild(box.firstChild);
    const head = document.createElement("button");
    head.type = "button";
    head.className = "acc-head";
    const ic = box.dataset.accIcon || "";
    head.innerHTML = `<span class="acc-icon">${/\.png$/.test(ic) ? `<img src="${ic}" alt="">` : ic}</span><span class="acc-title"></span><span class="acc-chev">▾</span>`;
    head.querySelector(".acc-title").textContent = box.dataset.acc;
    head.setAttribute("aria-expanded", "false");
    head.addEventListener("click", () => {
      const open = box.classList.toggle("acc-open");
      head.setAttribute("aria-expanded", String(open));
    });
    box.classList.add("acc-wrap");
    box.appendChild(head);
    box.appendChild(body);
  });
}


// ===== Línea de tiempo =====
async function loadTimeline() {
  try {
    const res = await fetch(CONFIG.timelinePath);
    if (!res.ok) throw new Error("No se pudo cargar la línea de tiempo.");
    timelineData = await res.json();
    renderTimeline();
  } catch (err) {
    console.error("Error al cargar la línea de tiempo:", err);
  }
}

function timelineByYear() {
  const map = new Map();
  [...timelineData].sort((x, y) => x.year - y.year).forEach(ev => {
    if (!map.has(ev.year)) map.set(ev.year, []);
    map.get(ev.year).push(ev);
  });
  return [...map.entries()];
}

function renderTimeline() {
  const track = document.getElementById("timelineTrack");
  if (!track) return;
  const years = timelineByYear();
  track.innerHTML = years.map(([year, evs]) => {
    const thumbs = evs.slice(0, 3).map((ev, i) => {
      const img = ev.images && ev.images[0];
      return `<span class="tl-thumb" style="--i:${i}">${img ? `<img src="${escHtml(img)}" alt="" loading="lazy" draggable="false">` : `<img class="tl-thumb-shield" src="assets/escudo_ruca_tucun.png" alt="" draggable="false">`}</span>`;
    }).join("");
    const count = evs.length > 1 ? `<span class="tl-count">${evs.length}</span>` : "";
    return `
      <button type="button" class="tl-item" onclick="openTimelineModal(${year})" aria-label="Ver ${year}: ${escHtml(evs.map(e => e.title).join(", "))}">
        <span class="tl-stack">${thumbs}${count}</span>
        <span class="tl-dot"></span>
        <span class="tl-year">${year}</span>
      </button>`;
  }).join("");
  setupTimelineDrag(track);
}

function scrollTimeline(direction) {
  const track = document.getElementById("timelineTrack");
  if (!track) return;
  track.scrollBy({ left: (direction === "left" ? -1 : 1) * Math.max(track.clientWidth * 0.7, 200), behavior: "smooth" });
}

// Arrastrar con el mouse para mover la línea (en el celular ya funciona con el dedo)
function setupTimelineDrag(track) {
  if (track.dataset.drag) return;
  track.dataset.drag = "1";
  let down = false, startX = 0, startLeft = 0, moved = false;
  track.addEventListener("mousedown", (e) => { down = true; moved = false; startX = e.pageX; startLeft = track.scrollLeft; });
  window.addEventListener("mouseup", () => { down = false; track.classList.remove("tl-dragging"); });
  window.addEventListener("mousemove", (e) => {
    if (!down) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 5) { moved = true; track.classList.add("tl-dragging"); }
    track.scrollLeft = startLeft - dx;
  });
  track.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
}

function openTimelineModal(year) {
  const evs = timelineData.filter(e => e.year === year);
  const modal = document.getElementById("timelineModal");
  if (!modal || !evs.length) return;
  document.getElementById("timelineModalYear").textContent = year;
  document.getElementById("timelineModalBody").innerHTML = evs.map(ev => `
    <article>
      <h4 class="text-lg font-extrabold text-white mb-1">${escHtml(ev.title)}</h4>
      <p class="text-sm text-slate-300 leading-relaxed">${escHtml(ev.text)}</p>
      ${(ev.images || []).length ? `<div class="grid ${ev.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 mt-3">${ev.images.map(src => `<img src="${escHtml(src)}" alt="${escHtml(ev.title)}" loading="lazy" class="w-full rounded-xl border border-rucaBorder object-cover">`).join("")}</div>` : ""}
    </article>`).join("");
  modal.classList.remove("hidden");
}

function closeTimelineModal() {
  const modal = document.getElementById("timelineModal");
  if (modal) modal.classList.add("hidden");
}


/* =====================================================
   JUGÁ · Trayectoria de un miliciano
   ===================================================== */
let juegoData = null;
let jg = null; // estado de la partida

async function loadJuego() {
  try {
    const res = await fetch(CONFIG.juegoPath);
    if (!res.ok) throw new Error("juego");
    juegoData = await res.json();
    renderJuegoInicio();
  } catch (e) {
    console.error("Error cargando el juego:", e);
  }
}

function jgTxt(s, f) {
  const m = { o: f ? "a" : "o", a: f ? "a" : "", un: f ? "una" : "un", el: f ? "la" : "el", Maestro: f ? "Maestra" : "Maestro" };
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (k in m ? m[k] : ""));
}

function jgSeccion(edad, f) {
  if (edad >= 19) return f ? "Milicianas" : "Milicianos";
  if (f) return edad <= 12 ? "Caperucitas" : edad <= 15 ? "Herederas" : "Adalides";
  return edad <= 13 ? "Escuderos" : edad <= 16 ? "Templarios Menores" : "Templarios Mayores";
}

// Cargos de sección (se ofrecen en una ventana de edad limitada y vencen)
function jgEscalera(f) {
  return f ? [
    { n: "Subjefa de Caperucitas", edad: 16 },
    { n: "Jefa de Caperucitas", edad: 17 },
    { n: "Subjefa de Herederas", edad: 18 },
    { n: "Jefa de Herederas", edad: 19 }
  ] : [
    { n: "Subjefe de Escuderos", edad: 16 },
    { n: "Jefe de Escuderos", edad: 17 },
    { n: "Subjefe de Templarios", edad: 18 },
    { n: "Jefe de Templarios", edad: 19 }
  ];
}

// Cargos de Milicianos (a partir de los 19): departamentos y agrupaciones
function jgCargosAdultos(f) {
  return [
    { n: f ? "Jefa del Departamento de Comunicaciones" : "Jefe del Departamento de Comunicaciones", k: "comunicaciones" },
    { n: f ? "Jefa del Departamento de Administración" : "Jefe del Departamento de Administración", k: "administracion" },
    { n: f ? "Jefa del Departamento de Intendencia" : "Jefe del Departamento de Intendencia", k: "intendencia" },
    { n: f ? "Jefa de Formación" : "Jefe de Formación", k: "formacion" },
    { n: f ? "Secretaria de Ruca" : "Secretario de Ruca", k: "secretaria" },
    f ? { n: "Jefa de la Agrupación Femenina", k: "femenina" } : { n: "Jefe de la Agrupación Masculina", k: "masculina" },
    { n: f ? "Jefa de la Agrupación Milicianos" : "Jefe de la Agrupación Milicianos", k: "milicianos" }
  ];
}

function jgRol() {
  if (jg.ruca) return jg.f ? "Jefa de Ruca" : "Jefe de Ruca";
  if (jg.cc) return jg.cc;
  return jg.rung >= 0 ? jgEscalera(jg.f)[jg.rung].n : null;
}

function jgFinal() {
  const f = jg.f, e = jg.estilo;
  const sec = jg.rung >= 0 ? jgEscalera(f)[jg.rung].n : null;
  if (jg.ruca) return { icon: "👑", titulo: f ? "Jefa de Ruca" : "Jefe de Ruca", texto: "Llegaste a lo más alto, paso a paso, desde Caperucita o Escudero. La comunidad entera confía en vos." };
  if (jg.cc) return { icon: "🛡️", titulo: jg.cc, texto: "Formás parte del Comando Central." + (e >= 85 ? " Y tu Estilo es de leyenda." : " Para ser Jefe de Ruca faltó un último empujón (o un poco de suerte).") + (sec ? " Antes habías sido " + sec + "." : "") };
  if (e >= 85) return { icon: "🏆", titulo: "Leyenda del Ruca", texto: "Las anécdotas tuyas se cuentan en cada fogón." + (sec ? " Fuiste " + sec + "." : "") };
  if (jg.rung >= 1) return { icon: "⚜️", titulo: "Miliciano con trayectoria".replace("Miliciano", f ? "Miliciana" : "Miliciano"), texto: "En su momento fuiste " + sec + ". Hoy seguís sumando como miliciano raso, con experiencia de sobra." };
  if (e >= 60) return { icon: "🔥", titulo: f ? "Miliciana de todos los sábados" : "Miliciano de todos los sábados", texto: "Siempre presente, siempre con una sonrisa. El Ruca no sería lo mismo sin vos." };
  if (e >= 40) return { icon: "🤝", titulo: f ? "Miliciana querida" : "Miliciano querido", texto: "Pasaste por el Ruca dejando buenos recuerdos y alguna que otra anécdota." };
  if (e >= 20) return { icon: "🌧️", titulo: "Bajo perfil", texto: "Tuviste tus tropiezos, pero seguís siendo parte de la familia. Siempre hay revancha." };
  return { icon: "🥾", titulo: f ? "La que se perdió la mitad" : "El que se perdió la mitad", texto: "El Estilo se te escapó un poco. Pero el Ruca siempre te recibe de vuelta." };
}

function jgBar(v) {
  const c = v >= 60 ? "#facc15" : v >= 30 ? "#eab308" : "#ef4444";
  return `<div class="jg-bar"><div class="jg-bar-fill" style="width:${v}%;background:${c}"></div></div>`;
}

function jgHeader() {
  const rol = jgRol();
  return `<div class="jg-top">
    <div><div class="jg-name">${escHtml(jg.nombre)}</div>
    <div class="jg-sub">${jg.edad} años · ${jgSeccion(jg.edad, jg.f)}</div>
    ${rol ? `<div class="jg-rol">⚜️ ${escHtml(rol)}</div>` : ""}</div>
    <div class="jg-estilo"><span>Estilo</span><b>${jg.estilo}</b></div>
  </div>${jgBar(jg.estilo)}${jg.premios.length ? `<div class="jg-estante">${jgEstante(22)}</div>` : ""}`;
}

function renderJuegoInicio() {
  const el = document.getElementById("jugaContent");
  if (!el) return;
  jg = null;
  jgGenero = null;
  jgPaso = 2;
  el.innerHTML = `
    <div class="jg-card jg-center">
      <div class="jg-hero">🎮</div>
      <h2 class="jg-title">Trayectoria de un miliciano</h2>
      <p class="jg-lead">Entrás al Ruca a los 9 años. Cada dos años tomás decisiones, pasás de sección, te ofrecen cargos y sumás (o perdés) <b>Estilo</b>. ¿Llegás a Jefe de Ruca?</p>
      <label class="jg-label" for="jgNombre">¿Cómo te llamás?</label>
      <input id="jgNombre" class="jg-input" maxlength="18" placeholder="Tu nombre o apodo" autocomplete="off">
      <div class="jg-label">Elegí tu camino</div>
      <div class="jg-choice">
        <button class="jg-opt" data-g="m" onclick="jgElegirGenero('m')">⚔️ Escuderos<br><small>Escuderos → Templarios → Milicianos</small></button>
        <button class="jg-opt" data-g="f" onclick="jgElegirGenero('f')">🌹 Caperucitas<br><small>Caperucitas → Herederas → Adalides → Milicianas</small></button>
      </div>
      <div class="jg-label">Ritmo del juego</div>
      <div class="jg-choice">
        <button class="jg-opt jg-sel" data-p="2" onclick="jgElegirPaso(2)">⏩ De a 2 años<br><small>Más rápido (~2 min)</small></button>
        <button class="jg-opt" data-p="1" onclick="jgElegirPaso(1)">🐢 Año por año<br><small>Más largo, más decisiones</small></button>
      </div>
      <button id="jgStart" class="jg-btn" onclick="jgEmpezar()" disabled>Empezar</button>
      <p class="jg-note">Es un juego de humor entre amigos. Los personajes y situaciones son ficticios. ~2 minutos.</p>
    </div>`;
  document.getElementById("jgNombre").addEventListener("input", jgValidar);
}

let jgGenero = null;
let jgPaso = 2;
function jgElegirPaso(p) {
  jgPaso = p;
  document.querySelectorAll(".jg-opt[data-p]").forEach(b => b.classList.toggle("jg-sel", Number(b.dataset.p) === p));
}
function jgElegirGenero(g) {
  jgGenero = g;
  document.querySelectorAll(".jg-opt[data-g]").forEach(b => b.classList.toggle("jg-sel", b.dataset.g === g));
  jgValidar();
}
function jgValidar() {
  const n = (document.getElementById("jgNombre") || {}).value || "";
  const b = document.getElementById("jgStart");
  if (b) b.disabled = !(n.trim().length >= 2 && jgGenero);
}

function jgEmpezar() {
  const nombre = document.getElementById("jgNombre").value.trim().slice(0, 18);
  if (nombre.length < 2 || !jgGenero) return;
  const etapas = []; for (let x = 9; x <= 25; x += jgPaso) etapas.push(x);
  jg = { nombre, f: jgGenero === "f", paso: jgPaso, etapas, tal: {}, premios: [], edad: 9, estilo: 30, lider: 0, rung: -1, cc: null, ccKey: null, ruca: false, usados: [], hist: [], etapaIdx: 0, cola: [] };
  jgPrepararEtapa();
  jgMostrarEvento();
}

function jgShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ¿Te ofrecen un cargo? Depende de cosas que el jugador no ve del todo.
function jgOferta() {
  const f = jg.f;
  const esc1 = jg.paso === 1 ? 0.6 : 1;
  const maxTal = Math.max(0, ...Object.values(jg.tal));
  const base = ((jg.estilo - 20) / 90 + jg.lider * 0.03 + Math.min(0.2, maxTal * 0.05)) * esc1;
  const esc = jgEscalera(f);
  const nx = jg.rung + 1;
  if (nx < esc.length && !jg.cc) {
    const r = esc[nx];
    // Los cargos de sección se dan a partir de los 16-17 años y vencen si no los tomás a tiempo.
    if (jg.edad >= r.edad && jg.edad <= r.edad + 4 && Math.random() < Math.max(0.1, Math.min(0.9, base + (jg.edad > r.edad ? 0.1 : 0)))) {
      const sec = r.n.replace(/^(Subjef[ea]|Jef[ea]) de /, "");
      return { oferta: true, tipo: "sec", rol: r.n, titulo: "Te proponen: " + r.n, texto: "Los jefes ven tu compromiso y te proponen como " + r.n + " (" + sec + "). Es un paso grande." };
    }
  }
  if (jg.edad < 19) return null;
  if (!jg.cc) {
    if (jg.rung < 0) return null; // sin haber pasado por una jefatura de sección no hay Comando Central
    if (jg.edad < 21 && Math.random() > 0.35) return null;
    if (Math.random() > Math.max(0.1, Math.min(0.85, base - 0.05))) return null;
    let lista = jgCargosAdultos(f);
    // Las jefaturas de agrupación piden haber sido ya jefe de una sección.
    if (jg.rung < 1) lista = lista.filter(c => !["masculina", "femenina", "milicianos"].includes(c.k));
    // El cargo que te ofrecen depende de tus talentos (lo que mostraste que sabés hacer).
    const w = lista.map(c => 0.3 + (c.k === "masculina" || c.k === "femenina" || c.k === "milicianos" ? (jg.tal.lider || 0) * 0.5 + jg.lider * 0.05 : (jg.tal[c.k] || 0) * 1.5));
    let tot = w.reduce((s, x) => s + x, 0), r = Math.random() * tot, idx = 0;
    while (idx < w.length - 1 && r > w[idx]) { r -= w[idx]; idx++; }
    const c = lista[idx];
    return { oferta: true, tipo: "adulto", rol: c.n, k: c.k, titulo: "Te proponen: " + c.n, texto: "Como miliciano, te piensan para sumarte al Comando Central con un cargo de responsabilidad." };
  }
  if (!jg.ruca && jg.edad >= 23) {
    if (Math.random() > Math.max(0.15, Math.min(0.8, base))) return null;
    return { oferta: true, tipo: "ruca", rol: jg.f ? "Jefa de Ruca" : "Jefe de Ruca", ruca: true, titulo: "Elecciones para Jefe de Ruca", texto: "Hay elecciones y varios te proponen como candidato a Jefe de Ruca." };
  }
  return null;
}

function jgPrepararEtapa() {
  const edad = jg.edad;
  const elegibles = juegoData.eventos.filter(e => !jg.usados.includes(e.id) && e.edad[0] <= edad + jg.paso - 1 && e.edad[1] >= edad && (!e.solo || e.solo === jg.ccKey));
  const propios = jgShuffle(elegibles.filter(e => e.solo));
  const comunes = jgShuffle(elegibles.filter(e => !e.solo));
  const n = jg.edad === 9 || jg.paso === 1 ? 1 : 2;
  // Si ocupás un cargo de Comando Central, a veces te toca algo propio del cargo.
  let sel = [];
  if (propios.length && Math.random() < 0.6) sel.push(propios[0]);
  sel = sel.concat(comunes).slice(0, n);
  jg.cola = sel;
  jg.cola.forEach(e => jg.usados.push(e.id));
  const of = jgOferta();
  if (of) jg.cola = [of].concat(jg.cola.slice(0, 1));
}

function jgMostrarEvento() {
  const el = document.getElementById("jugaContent");
  if (!jg.cola.length) return jgFinEtapa();
  const ev = jg.cola[0];
  const f = jg.f;
  let opts;
  if (ev.oferta) {
    jg.orden = jgShuffle([0, 1, 2]);
    const L = ev.ruca
      ? ["Te postulás con propuestas claras", "Te postulás y apostás al carisma", "Le cedés el lugar a otro"]
      : ["Aceptás con ganas", "Aceptás, pero con dudas", "Decís que no por ahora"];
    opts = jg.orden.map(k => `<button class="jg-choice-btn" onclick="jgElegirOferta(${k})">${escHtml(L[k])}</button>`).join("");
  } else {
    jg.orden = jgShuffle(ev.opciones.map((_, i) => i));
    opts = jg.orden.map(k => `<button class="jg-choice-btn" onclick="jgElegir(${k})">${escHtml(jgTxt(ev.opciones[k].label, f))}</button>`).join("");
  }
  el.innerHTML = `<div class="jg-card">${jgHeader()}
    <div class="jg-ev"><div class="jg-ev-title">${escHtml(ev.titulo)}</div><p>${escHtml(jgTxt(ev.texto, f))}</p></div>
    <div class="jg-opts">${opts}</div></div>`;
}

const JG_TW_BIEN = ["Salió mucho mejor de lo que esperabas. A veces se da.", "Nadie lo esperaba, pero te salió redondo.", "Un golpe de suerte inesperado cambió todo para bien.", "Terminó siendo la mejor anécdota del mes."];
const JG_TW_MAL = ["Esta vez no salió como pensabas. Ya habrá revancha.", "Algo falló en el camino y la cosa se complicó.", "Parecía buena idea... hasta que dejó de serlo.", "Por algún motivo el resultado fue otro. Cosas del Ruca."];

function jgPintar(texto, delta, suerte, extra) {
  const el = document.getElementById("jugaContent");
  el.innerHTML = `<div class="jg-card">${jgHeader()}
    <div class="jg-res">
      ${suerte ? `<div class="jg-suerte">${suerte}</div>` : ""}
      <p>${escHtml(texto)}</p>
      <div class="jg-delta ${delta >= 0 ? "jg-up" : "jg-down"}">${delta >= 0 ? "+" : ""}${delta} Estilo</div>
    </div>
    ${extra || ""}
    <button class="jg-btn" onclick="jgContinuar()">Continuar</button></div>`;
}

function jgAplicar(n) {
  const antes = jg.estilo;
  jg.estilo = Math.max(0, Math.min(100, jg.estilo + n));
  return jg.estilo - antes;
}

function jgElegir(i) {
  const ev = jg.cola[0];
  const op = ev.opciones[i];
  const f = jg.f;
  let n, r, suerte = null;
  if (op.riesgo) {
    const ok = Math.random() < op.riesgo.p;
    const x = ok ? op.riesgo.bien : op.riesgo.mal;
    n = x.n; r = jgTxt(x.r, f); suerte = ok ? "🍀 ¡Salió bien!" : "💥 Salió mal...";
  } else {
    n = op.n; r = jgTxt(op.r, f);
    // El resultado nunca es 100% seguro: variación y giros inesperados.
    const t = Math.random();
    if (t < 0.25) {
      if (n >= 3) { n = -(1 + Math.floor(Math.random() * 4)); r = JG_TW_MAL[Math.floor(Math.random() * JG_TW_MAL.length)]; suerte = "🌀 Giro inesperado"; }
      else if (n <= 0) { n = 3 + Math.floor(Math.random() * 5); r = JG_TW_BIEN[Math.floor(Math.random() * JG_TW_BIEN.length)]; suerte = "🌀 Giro inesperado"; }
      else { n = n + Math.floor(Math.random() * 7) - 3; }
    } else { n = n + Math.floor(Math.random() * 5) - 2; }
  }
  if (op.lider && n > 0) jg.lider += op.lider;
  if (ev.talento && op.t && n > 0) { jg.tal[ev.talento] = (jg.tal[ev.talento] || 0) + 1; r += " Se nota que tenés talento para esto."; }
  const d = jgAplicar(n);
  jg.hist.push({ t: ev.titulo, n: d });
  jgPintar(r, d, suerte);
}

function jgElegirOferta(k) {
  const ev = jg.cola[0];
  const f = jg.f;
  // k: 0 = con ganas / propuestas claras, 1 = con dudas / carisma, 2 = no / ceder
  if (ev.ruca) {
    if (k === 2) {
      const d = jgAplicar(3);
      jg.hist.push({ t: ev.titulo, n: d });
      return jgPintar("Cediste el lugar. Un gesto de humildad que muchos recuerdan. Tal vez haya otra oportunidad.", d);
    }
    const base = (jg.estilo - 30) / 100 + jg.lider * 0.025 + (k === 0 ? 0.12 : 0) + (Math.random() * 0.6 - 0.25);
    if (base > 0.82) {
      jg.ruca = true;
      const d = jgAplicar(8);
      jg.hist.push({ t: ev.titulo, n: d });
      return jgPintar("¡Ganaste la elección! Sos " + (f ? "la nueva Jefa de Ruca." : "el nuevo Jefe de Ruca."), d, "🏛️ Elecciones");
    }
    const d = jgAplicar(-3);
    jg.hist.push({ t: ev.titulo, n: d });
    return jgPintar("Esta vez no alcanzaron los votos. Quedaste con la frente alta, pero el Ruca eligió a otra persona.", d, "🏛️ Elecciones");
  }
  if (k === 2) {
    const d = jgAplicar(Math.random() < 0.5 ? 2 : -2);
    jg.hist.push({ t: ev.titulo, n: d });
    return jgPintar("Dijiste que no por ahora. Tal vez más adelante vuelvan a proponértelo (o tal vez no).", d);
  }
  if (ev.tipo === "adulto") { jg.cc = ev.rol; jg.ccKey = ev.k; } else { jg.rung++; }
  const rol = ev.rol;
  const buen = Math.random() < Math.max(0.2, Math.min(0.85, 0.3 + jg.estilo / 160 + (k === 0 ? 0.1 : -0.05)));
  const d = jgAplicar(buen ? 6 + Math.floor(Math.random() * 4) : -(2 + Math.floor(Math.random() * 4)));
  jg.lider += buen ? 2 : 1;
  jg.hist.push({ t: "Cargo: " + rol, n: d });
  jgPintar(buen ? "Asumiste como " + rol + " y arrancaste con todo. Los demás lo notan." : "Asumiste como " + rol + ", pero el arranque fue más difícil de lo pensado. Se aprende en el camino.", d, "⚜️ Nuevo cargo: " + rol);
}

function jgContinuar() {
  jg.cola.shift();
  jgMostrarEvento();
}

function jgSiguienteEtapa() {
  jg.etapaIdx++;
  if (jg.etapaIdx >= jg.etapas.length) return jgTerminar();
  const antesSec = jgSeccion(jg.edad, jg.f);
  jg.edad = jg.etapas[jg.etapaIdx];
  const sec = jgSeccion(jg.edad, jg.f);
  jgPrepararEtapa();
  if (sec !== antesSec) {
    const el = document.getElementById("jugaContent");
    el.innerHTML = `<div class="jg-card jg-center">${jgHeader()}
      <div class="jg-hero">⬆️</div><h3 class="jg-title">¡Cambio de sección!</h3>
      <p class="jg-lead">Cumplís ${jg.edad} y pasás a <b>${sec}</b>.</p>
      <button class="jg-btn" onclick="jgMostrarEvento()">Seguir</button></div>`;
  } else {
    jgMostrarEvento();
  }
}

function jgTerminar() {
  const fin = jgFinal();
  jg.fin = fin;
  const rol = jgRol();
  const best = jg.hist.slice().sort((a, b) => b.n - a.n)[0];
  const worst = jg.hist.slice().sort((a, b) => a.n - b.n)[0];
  const el = document.getElementById("jugaContent");
  el.innerHTML = `<div class="jg-card jg-center jg-final">
    <div class="jg-hero">${fin.icon}</div>
    <div class="jg-sub">${escHtml(jg.nombre)} · 25 años</div>
    <h2 class="jg-title">${escHtml(fin.titulo)}</h2>
    <div class="jg-big">${jg.estilo}<small>/100 de Estilo</small></div>
    ${jgBar(jg.estilo)}
    <p class="jg-lead">${escHtml(fin.texto)}</p>
    ${jg.premios.length ? `<div class="jg-label" style="text-align:center">Tu vitrina (${jg.premios.length})</div><div class="jg-vitrina">${jg.premios.map(p => `<div class="jg-vit">${jgTrofeoSvg(p.tipo, p.tier, 36)}<small>${escHtml(p.n)}<br>${p.edad} años</small></div>`).join("")}</div>` : ""}
    <div class="jg-stats">
      <div>⭐ Mejor momento<br><b>${escHtml(best.t)}</b></div>
      <div>😅 Peor momento<br><b>${escHtml(worst.t)}</b></div>
    </div>
    <button class="jg-btn" onclick="jgCompartir()">Compartir por WhatsApp</button>
    <button class="jg-btn jg-btn2" onclick="renderJuegoInicio()">Jugar de nuevo</button>
  </div>`;
}

function jgCompartir() {
  const f = jg.fin;
  const url = "https://ruca-tucun.vercel.app/#juga";
  const msg = `Terminé la Trayectoria de un miliciano en el Ruca Tucún: ${f.icon} ${f.titulo} con ${jg.estilo}/100 de Estilo y ${jg.premios.length} trofeos. ¿Podés superarme? ${url}`;
  window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener");
}


/* ---------- Premios y trofeos ---------- */
const JG_COLOR = { oro: "#facc15", plata: "#cbd5e1", bronce: "#d08a4e" };

function jgSingular(sec, f) {
  const m = { Escuderos: "Escudero", Caperucitas: "Caperucita", Herederas: "Heredera", Adalides: "Adalid", "Templarios Menores": "Templario Menor", "Templarios Mayores": "Templario Mayor", Milicianos: "Miliciano", Milicianas: "Miliciana" };
  return m[sec] || sec;
}

function jgTrofeoSvg(tipo, tier, px) {
  const c = JG_COLOR[tier] || JG_COLOR.oro;
  const dk = "#080c16";
  const s = px || 28;
  let g = "";
  if (tipo === "copa" || tipo === "copa2") {
    g = `<path d="M9 4h14v7a7 7 0 0 1-14 0z" fill="${c}"/><path d="M9 6H4v2a5 5 0 0 0 5 5M23 6h5v2a5 5 0 0 1-5 5" stroke="${c}" fill="none" stroke-width="2"/><rect x="14" y="17" width="4" height="5" fill="${c}"/><rect x="10" y="22" width="12" height="4" rx="1" fill="${c}"/>` + (tipo === "copa2" ? `<path d="M16 6l1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.4-2.5 1.4.6-2.8L12 8.9l2.8-.3z" fill="${dk}"/>` : "");
  } else if (tipo === "medalla") {
    g = `<path d="M10 3l6 9 6-9" fill="none" stroke="${c}" stroke-width="3"/><circle cx="16" cy="20" r="8" fill="${c}"/><path d="M16 14.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.9-3.4 1.9.7-3.8-2.8-2.6 3.8-.5z" fill="${dk}"/>`;
  } else if (tipo === "escudo") {
    g = `<path d="M16 3l11 4v8c0 7-5 11-11 14C10 26 5 22 5 15V7z" fill="${c}"/><path d="M16 9l1.8 3.8 4.2.5-3.1 2.9.8 4.2-3.7-2.1-3.7 2.1.8-4.2-3.1-2.9 4.2-.5z" fill="${dk}"/>`;
  } else if (tipo === "carpa") {
    g = `<path d="M2 27L16 5l14 22z" fill="${c}"/><path d="M16 12l6 15H10z" fill="${dk}"/><rect x="1" y="26" width="30" height="2" fill="${c}"/>`;
  } else {
    g = `<path d="M16 3l3.5 8 8.5.8-6.4 5.6 2 8.4L16 21l-7.6 4.8 2-8.4L4 11.8l8.5-.8z" fill="${c}"/>`;
  }
  return `<svg class="jg-tro" width="${s}" height="${s}" viewBox="0 0 32 32" aria-hidden="true">${g}</svg>`;
}

function jgPremios() {
  const f = jg.f, e = jg.estilo, edad = jg.edad;
  const sec = jgSeccion(edad, f);
  const idx = jg.etapaIdx;
  const sig = jg.etapas[idx + 1];
  const finSec = !sig || jgSeccion(sig, f) !== sec;
  const score = e + (Math.random() * 26 - 13);
  const out = [];
  const ya = (n, anios) => jg.premios.some(p => p.n === n && edad - p.edad < anios);
  if (finSec) {
    const sing = jgSingular(sec, f);
    if (score >= 78) out.push({ n: "Mejor " + sing, tier: "oro", tipo: "copa" });
    else if (score >= 64) out.push({ n: "1ª mención de " + sec, tier: "plata", tipo: "medalla" });
    else if (score >= 52) out.push({ n: "2ª mención de " + sec, tier: "bronce", tipo: "medalla" });
  }
  const k = jg.paso === 1 ? 0.5 : 1;
  if (edad < 19 && edad >= 11 && Math.random() < 0.22 * k && score >= 52 && !ya("Mejor escuadra", 3)) out.push({ n: "Mejor escuadra", tier: "oro", tipo: "escudo" });
  if (edad >= 11 && Math.random() < 0.25 * k && e >= 40 && !ya("Campamento Mar Adentro", 3)) out.push({ n: "Campamento Mar Adentro", tier: "bronce", tipo: "carpa" });
  if (edad >= 13 && edad <= 21 && Math.random() < 0.12 * jg.paso && score >= 60 && !ya("Copa Estilo", 4)) out.push({ n: "Copa Estilo", tier: "oro", tipo: "copa2" });
  out.forEach(p => { p.edad = edad; jg.premios.push(p); });
  return out;
}

function jgFinEtapa() {
  const ps = jgPremios();
  if (!ps.length) return jgSiguienteEtapa();
  const el = document.getElementById("jugaContent");
  const lista = ps.map(p => `<div class="jg-prem">${jgTrofeoSvg(p.tipo, p.tier, 84)}<div class="jg-prem-n">${escHtml(p.n)}</div></div>`).join("");
  el.innerHTML = `<div class="jg-card jg-center">${jgHeader()}
    <div class="jg-suerte">🏅 ¡Premio${ps.length > 1 ? "s" : ""} a los ${jg.edad} años!</div>
    <div class="jg-prems">${lista}</div>
    <button class="jg-btn" onclick="jgSiguienteEtapa()">Continuar</button></div>`;
}

function jgEstante(px) {
  if (!jg.premios.length) return "";
  return jg.premios.map(p => `<span class="jg-tro-w" title="${escHtml(p.n)} (${p.edad} años)">${jgTrofeoSvg(p.tipo, p.tier, px)}</span>`).join("");
}
