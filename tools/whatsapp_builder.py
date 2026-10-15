"""
WhatsApp Builder - Automatizador de Enlaces y Embudos Contextuales de WhatsApp
Genera enlaces 'wa.me' con mensajes dinámicos validados y codificados de forma segura
para fichas de detalle, catálogos y llamadas a la acción web.
"""

import sys
import urllib.parse
import re

# Asegurar UTF-8 en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

DEFAULT_TEMPLATE = (
    "¡Hola! Vengo desde la página web y me interesa consultar por:\n"
    "📌 *{title}*\n"
    "🔢 Ref / ID: *{id}*\n"
    "💰 Precio: *{currency} {price}*\n"
    "🔗 Ficha directa: {url}\n\n"
    "¿Podrían indicarme disponibilidad y detalles para coordinar una visita / compra?"
)

def clean_phone_number(phone):
    """Elimina caracteres no numéricos dejando solo código de país y número."""
    cleaned = re.sub(r"[^\d]", "", str(phone))
    return cleaned

def build_whatsapp_link(phone, item, base_url="https://ejemplo.com", template=DEFAULT_TEMPLATE):
    """
    Construye el enlace final wa.me codificado para máxima compatibilidad móvil y desktop.
    """
    cleaned_phone = clean_phone_number(phone)
    if not cleaned_phone:
        raise ValueError("Número de teléfono inválido o vacío.")
        
    item_id = item.get("id", "N/A")
    title = item.get("title", "Producto / Propiedad")
    currency = item.get("currency", "USD")
    price = item.get("price", "Consultar")
    if isinstance(price, (int, float)):
        formatted_price = f"{price:,}"
    else:
        formatted_price = str(price)
        
    item_url = f"{base_url.rstrip('/')}/#item/{item_id}"
    
    text = template.format(
        title=title,
        id=item_id,
        currency=currency,
        price=formatted_price,
        url=item_url
    )
    
    encoded_text = urllib.parse.quote(text)
    return f"https://wa.me/{cleaned_phone}?text={encoded_text}"

def run_tests():
    """Ejecuta pruebas automáticas del generador."""
    test_item = {
        "id": "REF-789",
        "title": "Departamento 3 Ambientes en Palermo Soho",
        "price": 185000,
        "currency": "USD"
    }
    phone = "+54 9 11 9876-5432"
    url = build_whatsapp_link(phone, test_item, "https://inmobiliariademo.com")
    
    assert "wa.me/5491198765432" in url, "Error en limpieza de teléfono"
    assert "REF-789" in urllib.parse.unquote(url), "Error en parámetro ID"
    assert "Palermo%20Soho" in url or "Palermo+Soho" in url, "Error en codificación URL"
    assert "185%2C000" in url or "185,000" in urllib.parse.unquote(url), "Error en precio"
    
    print("Todas las pruebas de WhatsApp Builder se superaron exitosamente:")
    print("URL generada:")
    print(url)
    print("\nMensaje decodificado:")
    print(urllib.parse.unquote(url.split("text=")[1]))

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        run_tests()
    else:
        print("Uso:")
        print("  python whatsapp_builder.py test")

if __name__ == "__main__":
    main()
