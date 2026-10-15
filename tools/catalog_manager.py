"""
Catalog Manager - Automatizador de Gestión y Validación de Catálogos Web
Permite crear esquemas iniciales, validar integridad de datos y verificar que cada ítem
cumpla con las especificaciones de arquitectura (ID único, precio, ficha técnica, galería).
"""

import json
import os
import sys

# Asegurar UTF-8 en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

SCHEMA_REQUIRED_FIELDS = ["id", "title", "price", "currency", "images", "specs"]

def validate_catalog(catalog_data):
    """Valida que una lista de productos o propiedades cumpla con el estándar."""
    errors = []
    ids = set()
    
    if not isinstance(catalog_data, list):
        return ["El catálogo raíz debe ser una lista de ítems (array)."]

    for idx, item in enumerate(catalog_data):
        if not isinstance(item, dict):
            errors.append(f"Ítem en índice {idx} no es un objeto válido.")
            continue
        
        item_id = item.get("id")
        if not item_id:
            errors.append(f"Ítem en índice {idx} carece de 'id' obligatorio.")
        elif item_id in ids:
            errors.append(f"El ID '{item_id}' está duplicado en el catálogo.")
        else:
            ids.add(item_id)
            
        for field in SCHEMA_REQUIRED_FIELDS:
            if field not in item:
                errors.append(f"Ítem '{item.get('title', f'índice {idx}')}' no contiene el campo obligatorio: '{field}'.")
                
        images = item.get("images", [])
        if not isinstance(images, list) or len(images) == 0:
            errors.append(f"Ítem '{item_id}' debe tener al menos una imagen en su galería.")
            
        if not isinstance(item.get("specs"), dict):
            errors.append(f"Ítem '{item_id}' debe contener un diccionario 'specs' para la ficha técnica.")
            
    return errors

def create_sample_catalog(output_path, category="inmobiliaria"):
    """Genera un catálogo inicial de muestra con datos listos para producción."""
    samples = {
        "inmobiliaria": [
            {
                "id": "PROP-101",
                "slug": "villa-los-alamos-moderna",
                "title": "Residencia Contemporánea con Parque y Piscina",
                "category": "Casas",
                "price": 320000,
                "currency": "USD",
                "featured": True,
                "shortDescription": "Exclusiva propiedad de 5 ambientes en barrio privado de máxima seguridad.",
                "fullDescription": "Diseñada con concepto abierto, aberturas DVH, cocina con isla de silestone, master suite con vestidor e hidromasaje, galería quincho techada y piscina climatizada.",
                "images": [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
                ],
                "specs": {
                    "Superficie Total": "350 m²",
                    "Superficie Cubierta": "260 m²",
                    "Ambientes": "5",
                    "Dormitorios": "3 en suite",
                    "Cocheras": "2 cubiertas",
                    "Orientación": "Noreste"
                },
                "tags": ["Destacado", "Piscina", "Seguridad 24hs", "A Estrenar"]
            },
            {
                "id": "PROP-102",
                "slug": "departamento-penthouse-vista-rio",
                "title": "Penthouse de Lujo con Terraza Privada y Jacuzzi",
                "category": "Departamentos",
                "price": 245000,
                "currency": "USD",
                "featured": True,
                "shortDescription": "Semipiso de alta gama con visuales panorámicas y amenities de primer nivel.",
                "fullDescription": "Ubicado en el piso 18 con vista abierta al río, balcón terraza de 45m² con jacuzzi privado, pisos de madera natural, domótica integrada y 2 cocheras subterráneas fijas.",
                "images": [
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
                ],
                "specs": {
                    "Superficie Total": "180 m²",
                    "Ambientes": "3",
                    "Dormitorios": "2",
                    "Baños": "3",
                    "Amenities": "Gym, Piscina, SUM"
                },
                "tags": ["Oportunidad", "Vista Panorámica", "Terraza"]
            },
            {
                "id": "PROP-103",
                "slug": "casa-minimalista-golf",
                "title": "Casa de Diseño Minimalista al Golf",
                "category": "Casas",
                "price": 410000,
                "currency": "USD",
                "featured": False,
                "shortDescription": "Fondo directo a la cancha de golf con visuales ininterrumpidas.",
                "fullDescription": "Arquitectura de hormigón visto y grandes paños vidriados. Sistema de calefacción por losa radiante, paneles solares y terminaciones premium.",
                "images": [
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
                ],
                "specs": {
                    "Superficie Total": "480 m²",
                    "Superficie Cubierta": "310 m²",
                    "Ambientes": "6",
                    "Dormitorios": "4",
                    "Cocheras": "3"
                },
                "tags": ["Al Golf", "Sustentable", "Domótica"]
            }
        ]
    }
    
    catalog = samples.get(category, samples["inmobiliaria"])
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"Catálogo creado con éxito en: {output_path}")

def main():
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python catalog_manager.py init <ruta_destino.json>")
        print("  python catalog_manager.py validate <ruta_catalogo.json>")
        return

    cmd = sys.argv[1]
    if cmd == "init":
        target = sys.argv[2] if len(sys.argv) > 2 else "data/catalog.json"
        create_sample_catalog(target)
    elif cmd == "validate":
        target = sys.argv[2] if len(sys.argv) > 2 else "data/catalog.json"
        if not os.path.exists(target):
            print(f"Error: No existe el archivo {target}")
            sys.exit(1)
        with open(target, "r", encoding="utf-8") as f:
            data = json.load(f)
        errs = validate_catalog(data)
        if errs:
            print(f"Se encontraron {len(errs)} errores de validación:")
            for e in errs:
                print(f" - {e}")
            sys.exit(1)
        else:
            print(f"Catálogo '{target}' es 100% válido y cumple todos los estándares de arquitectura.")

if __name__ == "__main__":
    main()
