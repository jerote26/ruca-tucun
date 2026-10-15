from PIL import Image, ImageDraw

# Cargar imagen original
img = Image.open("assets/logo_ruca_tucun.png").convert("RGBA")
cropped = img.crop((31, 10, 139, 132))
cw, ch = cropped.size

# Encontrar contorno exterior del hexágono amarillo
poly_left = []
poly_right = []
for y in range(ch):
    row_yellows = [x for x in range(cw) if cropped.getpixel((x, y))[0] > 140 and cropped.getpixel((x, y))[1] > 140 and cropped.getpixel((x, y))[2] < 100]
    if row_yellows:
        poly_left.append((min(row_yellows) - 1, y))
        poly_right.append((max(row_yellows) + 1, y))

# Crear máscara de polígono
mask = Image.new("L", (cw, ch), 0)
draw = ImageDraw.Draw(mask)
polygon = poly_left + list(reversed(poly_right))
draw.polygon(polygon, fill=255)

# Aplicar máscara
transparent_shield = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
transparent_shield.paste(cropped, (0, 0), mask=mask)

# Escalar con alta calidad (Lanczos) para nitidez en pantalla Retina
scale_w, scale_h = cw * 4, ch * 4
high_res_shield = transparent_shield.resize((scale_w, scale_h), Image.Resampling.LANCZOS)

# Guardar
transparent_shield.save("assets/escudo_ruca_tucun_transparente.png", "PNG")
high_res_shield.save("assets/logo_ruca_tucun.png", "PNG")
print(f"Escudo transparente generado exitosamente: {scale_w}x{scale_h} px")
