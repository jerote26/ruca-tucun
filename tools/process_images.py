import os
from PIL import Image

SRC_LOGO = r"C:/Users/jeron/.gemini/antigravity/brain/a14bedf1-40e2-46a8-b885-50bacfe0d906/.user_uploaded/media_1791418560954_446816e1.png"
SRC_APPAREL = r"C:/Users/jeron/.gemini/antigravity/brain/a14bedf1-40e2-46a8-b885-50bacfe0d906/.user_uploaded/media_1791418583650_abdc6758.png"
SRC_COMMUNITY = r"C:/Users/jeron/.gemini/antigravity/brain/a14bedf1-40e2-46a8-b885-50bacfe0d906/.user_uploaded/media_1791418662647_87bd3239.png"

DEST_DIR = r"assets"
os.makedirs(DEST_DIR, exist_ok=True)

# 1. Copiar y procesar Logo Oficial
img_logo = Image.open(SRC_LOGO)
img_logo.save(os.path.join(DEST_DIR, "escudo_ruca_tucun.png"), "PNG")
print("Logo guardado en assets/escudo_ruca_tucun.png")

# 2. Copiar foto general de indumentaria
img_apparel = Image.open(SRC_APPAREL)
img_apparel.save(os.path.join(DEST_DIR, "indumentaria_oficial_real.png"), "PNG")
print("Foto de indumentaria guardada en assets/indumentaria_oficial_real.png")

# Recortes para la tienda:
# A. Remera deportiva (persona de la izquierda)
w, h = img_apparel.size
# Persona izquierda: x de 0.1*w a 0.55*w, y de 0.1*h a 0.85*h
crop_remera = img_apparel.crop((int(w * 0.08), int(h * 0.08), int(w * 0.55), int(h * 0.85)))
crop_remera.save(os.path.join(DEST_DIR, "remera_mar_adentro_real.png"), "PNG")
print("Recorte de remera guardado en assets/remera_mar_adentro_real.png")

# B. Campera deportiva (persona de la derecha)
# Persona derecha: x de 0.48*w a 0.95*w, y de 0.12*h a 0.88*h
crop_campera = img_apparel.crop((int(w * 0.48), int(h * 0.12), int(w * 0.95), int(h * 0.88)))
crop_campera.save(os.path.join(DEST_DIR, "campera_oficial_real.png"), "PNG")
print("Recorte de campera guardado en assets/campera_oficial_real.png")

# 3. Foto de la comunidad y bandera 1989
img_comm = Image.open(SRC_COMMUNITY)
img_comm.save(os.path.join(DEST_DIR, "comunidad_mar_adentro_1989.png"), "PNG")
print("Foto de comunidad guardada en assets/comunidad_mar_adentro_1989.png")
