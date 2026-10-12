/**
 * Ruca Tucun - Motor Interactivo Oficial
 * Tienda Oficial • Actividades • Información & Origen
 */

const CONFIG = {
  // Teléfono oficial para consultas y pedidos en Mar del Plata
  whatsappNumber: "5492236001234",
  catalogPath: `data/ruca_catalog.json?t=${Date.now()}`,
  eventsPath: `data/ruca_events.json?t=${Date.now()}`,
  jefaturasPath: `data/ruca_jefaturas.json?t=${Date.now()}`
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

  track.innerHTML = jefaturasData.map(jefe => {
    const isCurrent = jefe.isCurrent;
    const badgeHtml = jefe.badge ? `
      <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded ${isCurrent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rucaGold/20 text-rucaGold border border-rucaGold/40'}">
        ${jefe.badge}
      </span>
    ` : '';

    const isPhotoReal = jefe.photo && !jefe.photo.includes("logo_ruca_tucun");
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
          <img src="${jefe.photo || 'assets/logo_ruca_tucun.png'}" alt="${jefe.jefeRuca}" class="${imgClass}">
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
    if (jefe.photo && !jefe.photo.includes("logo_ruca_tucun")) {
      avatarEl.innerHTML = `<img src="${jefe.photo}" alt="${jefe.jefeRuca}" class="w-full h-full object-cover object-center">`;
    } else {
      avatarEl.innerHTML = `<span>👑</span>`;
    }
  }

  const hier = jefe.hierarchy || {};
  document.getElementById("modalJefaFemeninaName").textContent = hier.jefaFemenina || "Por completar";
  document.getElementById("modalJefeMasculinaName").textContent = hier.jefeMasculina || "Por completar";
  document.getElementById("modalJefeMilicianosName").textContent = hier.jefeMilicianos || "Por completar";

  const noteBox = document.getElementById("modalJefeNoteBox");
  const noteEl = document.getElementById("modalJefeNote");
  if (jefe.note) {
    noteEl.textContent = jefe.note;
    noteBox.classList.remove("hidden");
  } else {
    noteBox.classList.add("hidden");
  }

  modal.classList.remove("hidden");
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
    }
  });

  // Cerrar modal al hacer clic en el fondo oscuro
  const hierModal = document.getElementById("jefeHierarchyModal");
  if (hierModal) {
    hierModal.addEventListener("click", (e) => {
      if (e.target === hierModal) closeJefeHierarchyModal();
    });
  }
}
