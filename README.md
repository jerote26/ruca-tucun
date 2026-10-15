# Ruca Tucun — Sitio Oficial y Tienda Comunitaria

> **"Casa de Semilla" | Fasta Mar del Plata | Fundado el 28 de marzo de 1989**  
> **Lema Institucional:** *"Duc in altum - Rema mar adentro"* (San Lucas 5, 4)

---

## 📌 Enlaces del Proyecto

* **Producción Oficial:** [https://ruca-tucun.vercel.app](https://ruca-tucun.vercel.app)
* **Dominios Espejo Vercel:**
  * [https://ruca-tucun-sitiooficial.vercel.app](https://ruca-tucun-sitiooficial.vercel.app)
  * [https://ruca-tucun-web.vercel.app](https://ruca-tucun-web.vercel.app)
* **Repositorio GitHub:** [https://github.com/jerote26/ruca-tucun.git](https://github.com/jerote26/ruca-tucun.git) (Rama: `main`)

---

## 🗂️ Estructura del Proyecto

El proyecto está diseñado bajo una arquitectura limpia, desacoplada (datos separados de la interfaz) y 100% estática para garantizar tiempos de carga ultrarrápidos (< 1 segundo), cero dependencias de servidor complejas y compatibilidad total con cualquier hosting (Vercel, Netlify, GitHub Pages, Apache, Nginx):

```text
ruca-tucun/
│
├── index.html                 # Página principal: Hero, Tienda, Agrupaciones, Historia, Jefes y Contacto
├── app.js                     # Motor JavaScript: Catálogo dinámico, modal 3D frente/dorso, carrito y WhatsApp
├── styles.css                 # Estilos personalizados: Animaciones, sombras doradas y soporte Tailwind
├── vercel.json                # Configuración de headers de caché y enrutamiento en Vercel
├── robots.txt                 # Directivas de indexación para motores de búsqueda (Google, Safari, Bing)
├── sitemap.xml                # Mapa del sitio XML para indexación SEO inmediata
├── .gitignore                 # Archivos y carpetas ignorados por Git
│
├── data/
│   └── ruca_catalog.json      # Base de datos JSON de productos, talles, precios, imágenes 3D y especificaciones
│
├── assets/                    # Imágenes optimizadas en alta definición
│   ├── la_estrella_remera_3d.jpg          # Vista frontal 3D 'La Estrella'
│   ├── la_estrella_remera_back_3d.jpg     # Vista trasera 3D 'La Estrella' (NOMBRE y dorsal 10)
│   ├── short_juego_3d.jpg                 # Vista frontal 3D Short Oficial
│   ├── short_juego_back_3d.jpg            # Vista trasera 3D Short Oficial
│   ├── conjunto_estrella_3d.jpg           # Vista frontal 3D Combo 2x1 (Remera + Short)
│   ├── conjunto_estrella_back_3d.jpg      # Vista trasera 3D Combo 2x1 (NOMBRE + 10)
│   ├── camiseta_tucun_c_3d.jpg            # Vista frontal 3D Camiseta Tucun C
│   ├── camiseta_tucun_c_back_3d.jpg       # Vista trasera 3D Camiseta Tucun C (NOMBRE, 10 y cuello anatómico)
│   ├── camiseta_cruz_blanca_3d.jpg        # Vista frontal 3D Remera Ruca Tucun (Cruz Blanca)
│   ├── camiseta_cruz_blanca_back_3d.jpg   # Vista trasera 3D Remera Ruca Tucun (Dorsal 1)
│   ├── campera_render_3d.jpg              # Vista frontal 3D Campera Oficial
│   ├── campera_back_3d.jpg                # Vista trasera 3D Campera Oficial
│   ├── buzo_negro_3d.jpg                  # Vista frontal 3D Buzo Oficial Negro
│   ├── buzo_negro_back_3d.jpg             # Vista trasera 3D Buzo Oficial Negro
│   ├── chomba_azul_3d.jpg                 # Vista frontal 3D Chomba Masculina
│   ├── chomba_azul_back_3d.jpg            # Vista trasera 3D Chomba Masculina
│   ├── chomba_bordo_3d.jpg                # Vista frontal 3D Chomba Femenina
│   ├── chomba_bordo_back_3d.jpg           # Vista trasera 3D Chomba Femenina
│   ├── boina_render_3d.jpg                # Vista frontal 3D Boina de Paño
│   ├── boina_back_3d.jpg                  # Vista trasera 3D Boina con lazo
│   ├── insignia_promesas_render_3d.jpg    # Vista anverso 3D Insignia Promesas
│   ├── insignia_promesas_back_3d.jpg      # Vista reverso 3D Insignia Promesas
│   ├── gorra_render_3d.jpg                # Vista frontal 3D Gorra Trucker
│   ├── gorra_back_3d.jpg                  # Vista trasera 3D Gorra Trucker
│   ├── remera_render_3d.jpg               # Vista frontal 3D Marejada
│   ├── remera_back_3d.jpg                 # Vista trasera 3D Marejada (NOMBRE y dorsal 10)
│   ├── escudos/                           # Escudos de Secciones (Templarios, Adalides, Caperucitas, etc.)
│   ├── jefes/                             # Fotos históricas de los Jefes de Ruca (incluye Juan I. Lurbe)
│   └── eventos/                           # Fotografías comunitarias y de campamento
│
└── tools/
    └── web_auditor.py         # Script Python de auditoría automática (HTML, JSON, enlaces y assets)
```

---

## 🚀 Cómo Ejecutar el Proyecto en Local

No requiere compilación (`npm build` ni dependencias pesadas). Puedes correrlo con cualquiera de las siguientes opciones:

### Opción 1: Con Python (Recomendada y universal)
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
python -m http.server 8000
```
Luego abre tu navegador en: `http://localhost:8000`

### Opción 2: Con VS Code (Extensión Live Server)
1. Abre la carpeta del proyecto en VS Code.
2. Haz clic derecho sobre `index.html`.
3. Selecciona **"Open with Live Server"**.

### Opción 3: Con Node.js / npx
```bash
npx serve .
```

---

## 🛒 Cómo Funciona el Catálogo y la Tienda

### Modificar o Agregar Productos
Toda la información de las prendas está centralizada en `data/ruca_catalog.json`. Cada producto tiene el siguiente formato:

```json
{
  "id": "TUC-001",
  "slug": "combo-2x1-short-y-remera-la-estrella",
  "title": "Combo 2x1 Short y Remera 'La Estrella'",
  "category": "Remeras",
  "price": 38000,
  "currency": "ARS",
  "featured": true,
  "shortDescription": "Descripción corta para la tarjeta.",
  "fullDescription": "Descripción completa para el modal de detalle.",
  "images": [
    "assets/conjunto_estrella_3d.jpg",
    "assets/conjunto_estrella_back_3d.jpg"
  ],
  "specs": {
    "Promoción": "Combo 2x1",
    "Tela": "Poliéster Dry-Fit"
  },
  "tags": ["Combo 2x1", "La Estrella", "Destacado"]
}
```

* **Categorías admitidas:** `"Remeras"`, `"Camperas"`, `"Uniformes"`, `"Gorras"`.
* **Visualizador 3D:** El primer elemento en `images` corresponde a la **Vista Frontal** y el segundo a la **Vista Trasera**. Si el producto tiene ambas vistas, la tienda muestra automáticamente los botones interactivos de selección.

---

## 📲 Embudo Directo de WhatsApp

* El número de contacto está centralizado en `app.js` (`WHATSAPP_NUMBER = "5492230000000"`).
* Al hacer clic en **"Pedir por WhatsApp"** o enviar el carrito, la aplicación genera un enlace contextual dinámico (`https://wa.me/...`) con:
  1. Nombre y código de la prenda.
  2. Talle seleccionado por el comprador.
  3. Precio unitario y total formateado en Pesos Argentinos (ARS).
  4. Enlace directo a la ficha del producto en la web.

---

## 🛠️ Auditoría de Calidad

Para verificar que todos los enlaces, rutas de imágenes y sintaxis de HTML/JSON sean 100% correctos, ejecuta:
```bash
python tools/web_auditor.py .
```

---

## 🌐 Despliegue en Producción

El repositorio está vinculado directamente a **Vercel**:
* Cada `git push origin main` activa automáticamente una compilación y despliegue global con certificado SSL y CDN perimetral.
