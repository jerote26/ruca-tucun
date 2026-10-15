"""
Web Auditor - Automatizador de Calidad Web, a11y, SEO y WhatsApp
Escanea archivos HTML y JavaScript del proyecto para auditar buenas prácticas de maquetación,
enlaces dinámicos de WhatsApp, metaetiquetas y accesibilidad.
"""

import os
import sys
import re

# Asegurar UTF-8 en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

def audit_html_file(file_path):
    issues = []
    warnings = []
    
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # 1. Chequeo de Viewport Responsive
    if '<meta name="viewport"' not in content and "<meta name='viewport'" not in content:
        issues.append("Falta la metaetiqueta viewport (<meta name='viewport' content='width=device-width, initial-scale=1.0'>).")

    # 2. Chequeo de Idioma
    if '<html lang=' not in content:
        warnings.append("No se especificó atributo lang en la etiqueta <html> (recomendado: <html lang='es'>).")

    # 3. Chequeo de Título y Descripción SEO
    if '<title>' not in content:
        issues.append("Falta la etiqueta <title> en el documento.")
    if 'meta name="description"' not in content and "meta name='description'" not in content:
        warnings.append("Falta la metaetiqueta 'description' para optimización SEO.")

    # 4. Chequeo de Atributos alt en Imágenes
    img_tags = re.findall(r'<img\s+[^>]*>', content, re.IGNORECASE)
    for img in img_tags:
        if 'alt=' not in img:
            issues.append(f"Etiqueta <img> sin atributo 'alt' de accesibilidad: {img[:60]}...")

    # 5. Detección de Integración con WhatsApp
    has_wa_link = "wa.me" in content or "whatsapp" in content.lower()
    if not has_wa_link:
        warnings.append("No se detectó integración directa con WhatsApp en la página.")
        
    return issues, warnings

def audit_directory(root_dir="."):
    print(f"=== Iniciando Auditoría Web en: {os.path.abspath(root_dir)} ===")
    total_issues = 0
    total_warnings = 0
    html_files_found = 0
    
    for root, _, files in os.walk(root_dir):
        if any(ignored in root for ignored in [".git", "node_modules", ".gemini", "__pycache__"]):
            continue
        for file in files:
            if file.endswith(".html"):
                html_files_found += 1
                path = os.path.join(root, file)
                rel_path = os.path.relpath(path, root_dir)
                issues, warnings = audit_html_file(path)
                
                print(f"\nAuditando: {rel_path}")
                if not issues and not warnings:
                    print("  [OK] Todos los estándares validados correctamente.")
                else:
                    for iss in issues:
                        print(f"  [CRÍTICO] {iss}")
                        total_issues += 1
                    for war in warnings:
                        print(f"  [ADVERTENCIA] {war}")
                        total_warnings += 1

    if html_files_found == 0:
        print("\nNo se encontraron archivos .html para auditar en este directorio.")
    else:
        print(f"\n=== Resumen de Auditoría: {html_files_found} páginas analizadas | {total_issues} errores | {total_warnings} advertencias ===")
    return total_issues

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    errors = audit_directory(target)
    sys.exit(1 if errors > 0 else 0)

if __name__ == "__main__":
    main()
