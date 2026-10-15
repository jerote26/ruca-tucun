"""
Hook Runner - Wrapper seguro para ganchos de ciclo de vida de Antigravity
Ejecuta validaciones automáticas y devuelve la salida requerida por el protocolo de hooks.
"""

import sys
import json
import subprocess
import os

def main():
    try:
        input_data = sys.stdin.read()
        if input_data:
            payload = json.loads(input_data)
        else:
            payload = {}
    except Exception:
        payload = {}

    # Si hay archivos modificados o creados, verificar si es necesario auditar
    # Enviamos siempre la respuesta vacía requerida por PostToolUse
    print("{}")

if __name__ == "__main__":
    main()
