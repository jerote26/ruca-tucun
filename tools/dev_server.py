"""
Dev Server - Servidor de Desarrollo Local Ligero
Sirve archivos estáticos con soporte UTF-8, headers CORS y auto-detección de puertos.
"""

import http.server
import socketserver
import os
import sys

DEFAULT_PORT = 3000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Habilitar CORS y headers para desarrollo rápido
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

def run_server(port=DEFAULT_PORT, directory="."):
    os.chdir(directory)
    handler = CustomHandler
    
    # Buscar puerto libre si el default está ocupado
    for p in range(port, port + 20):
        try:
            with socketserver.TCPServer(("", p), handler) as httpd:
                print(f"Servidor de desarrollo activo en:")
                print(f"http://localhost:{p}")
                print(f"Sirviendo directorio: {os.path.abspath(directory)}")
                print("Presiona Ctrl+C para detenerlo.")
                httpd.serve_forever()
        except OSError:
            continue

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else DEFAULT_PORT
    dir_arg = sys.argv[2] if len(sys.argv) > 2 else "."
    run_server(port_arg, dir_arg)
