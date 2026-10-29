#!/usr/bin/env python
"""
Pipeline de imágenes de Cabinas Desarmables RM.

Entrada:  img/src/*.jpg   — las fotos originales del taller, tal cual las mandó RM.
Salida:   img/*.avif + *.jpg — derivados responsive listos para publicar.

Reglas:
  · No se altera el producto. Sólo se reescala (Lanczos), se enfoca lo que la
    reducción se lleva (unsharp) y se comprime. Sin retoque de color, sin
    elementos agregados, sin composiciones inventadas.
  · Los recortes son editoriales y están declarados acá abajo, uno por uno,
    con el motivo. Nada se recorta "automático a 4/3".
  · Las fotos originales son verticales (vienen del celular, exportadas por
    Instagram a 1080 px de ancho). Los recortes apaisados salen del mismo
    encuadre: el sujeto es una habitación, así que el corte horizontal es
    legítimo y muestra mejor la cabina que el vertical completo.

Uso:  python tools/build-images.py              regenera todo
      python tools/build-images.py hero-detailing envios-camion
                                                sólo esas fuentes (por nombre,
                                                sin extensión): suma una imagen
                                                sin reescribir las variantes que
                                                ya están publicadas.
"""
import os
import sys
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "img", "src")
OUT = os.path.join(ROOT, "img")

# Anchos por rol. No se sube de la resolución nativa: agrandar sólo inventa píxeles.
W_PORTRAIT = [420, 640, 860, 1080]
W_WIDE = [480, 640, 960, 1280]

# ── Recortes editoriales ────────────────────────────────────────────────
# (nombre, archivo, (izq, arr, der, abajo) en fracción, motivo)
CROPS = [
    ("hero-wide", "hero.jpg", (0, 0.34, 1, 0.34 + 0.7554 * 0.5),
     "Frente del auto + franja amarilla + pared nervada blanca. El encuadre que "
     "se lee a tamaño chico: sirve de Open Graph y de hero apaisado."),

    ("blanca-wide", "blanca.jpg", (0.02, 0.12, 0.98, 0.12 + 0.96 * (2 / 3) * (860 / 1146)),
     "Cabina blanca completa: pared nervada, spots de pared, franja amarilla "
     "perimetral y piso modular. Es la muestra real de la terminación blanca."),

    ("negra-wide", "negraFrente.jpg", (0.05, 0.45, 0.95, 0.45 + 0.90 * (2 / 3) * (860 / 1139)),
     "Cabina negra completa: barras retroiluminadas, spots rasantes, "
     "organizadores de producto y franja magenta. Muestra de terminación negra."),

    ("negraBajo-wide", "negraBajo.jpg", (0.03, 0.28, 0.97, 0.28 + 0.94 * (2 / 3) * (860 / 1139)),
     "Contrapicado de la cabina negra: techo de chapa nervada con luminarias "
     "embutidas. Es la foto que explica el techo cerrado."),

    # moto.jpg NO se recorta a apaisado: el sujeto es vertical y cualquier
    # banda horizontal le corta el cielorraso LED o las ruedas. Se publica
    # vertical, entera.
]

# Fotos completas que se publican verticales, sin recortar.
# hero-detailing.jpg es la portada de la home: una escena de referencia del
# rubro, NO una cabina entregada. Por eso no tiene recortes ni va a Open Graph.
PORTRAITS = ["hero.jpg", "blanca.jpg", "negraFrente.jpg", "negraBajo.jpg", "moto.jpg",
             "hero-detailing.jpg"]

# Gráficas con texto (no fotos): enteras, con su proporción, y con más calidad
# que las fotos porque la compresión de foto ensucia los bordes de las letras.
GRAPHICS = ["envios-camion.png"]
Q_GRAPHIC = {"avif": 72, "jpg": 90}

# Filtro opcional por nombre (ver Uso). Vacío = todo.
ONLY = set(sys.argv[1:])


def wanted(stem):
    return not ONLY or stem in ONLY


def enhance(im, resized):
    """Devuelve lo que la reducción se llevó. Nada más.

    Sólo se aplica cuando hubo reducción real. Enfocar a tamaño nativo no
    agrega nitidez: agrega ruido, y en el piso modular (patrón de rombos de
    alta frecuencia) ese ruido duplica el peso del archivo."""
    if not resized:
        return im
    return im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=34, threshold=4))


def export(im, stem, widths, q_avif=55, q_jpg=80):
    """Escribe avif + jpg en cada ancho. Nunca agranda.

    Sin WebP a propósito: en estas fotos (textura de rombos del piso, chapa
    nervada) WebP pesa igual o más que el JPEG progresivo, así que no compra
    nada. AVIF sí: ~45% menos que JPEG a la misma calidad.

    Si la nativa cae entre dos anchos de la lista, se agrega: es gratis y
    evita servir 640 px donde hay 826 reales."""
    ws = sorted({w for w in widths if w <= im.width} | {im.width})
    made = []
    for w in ws:
        if w > im.width:
            continue
        h = round(w * im.height / im.width)
        r = enhance(im.resize((w, h), Image.LANCZOS), w < im.width)
        base = os.path.join(OUT, f"{stem}-{w}")
        r.save(base + ".avif", quality=q_avif, speed=6)
        r.save(base + ".jpg", quality=q_jpg, optimize=True, progressive=True)
        made.append((w, h))
    return made


def main():
    if not os.path.isdir(SRC):
        sys.exit(f"Falta {SRC}. Ahí van las fotos originales.")
    os.makedirs(OUT, exist_ok=True)

    for f in PORTRAITS:
        p = os.path.join(SRC, f)
        stem = os.path.splitext(f)[0]
        if not wanted(stem):
            continue
        if not os.path.exists(p):
            print(f"  ! falta {f}, se saltea")
            continue
        im = Image.open(p).convert("RGB")
        made = export(im, stem, W_PORTRAIT)
        print(f"{stem:16s} vertical {im.size} -> {[w for w, _ in made]}")

    for f in GRAPHICS:
        p = os.path.join(SRC, f)
        stem = os.path.splitext(f)[0]
        if not wanted(stem):
            continue
        if not os.path.exists(p):
            print(f"  ! falta {f}, se saltea")
            continue
        im = Image.open(p).convert("RGB")
        made = export(im, stem, W_PORTRAIT, Q_GRAPHIC["avif"], Q_GRAPHIC["jpg"])
        print(f"{stem:16s} grafica  {im.size} -> {[w for w, _ in made]}")

    for name, f, box, _why in CROPS:
        if not wanted(name):
            continue
        p = os.path.join(SRC, f)
        if not os.path.exists(p):
            print(f"  ! falta {f}, se saltea {name}")
            continue
        im = Image.open(p).convert("RGB")
        W, H = im.size
        c = im.crop((round(box[0] * W), round(box[1] * H),
                     round(box[2] * W), round(box[3] * H)))
        made = export(c, name, W_WIDE)
        print(f"{name:16s} recorte {c.size} -> {[w for w, _ in made]}")

    # Open Graph: 1200×630 exacto. Es el único caso donde se agranda,
    # porque las redes exigen esa medida y el origen queda 11% corto.
    p = os.path.join(SRC, "hero.jpg")
    if wanted("og") and os.path.exists(p):
        im = Image.open(p).convert("RGB")
        W, H = im.size
        box = CROPS[0][2]
        c = im.crop((0, round(box[1] * H), W, round(box[3] * H)))
        c = enhance(c.resize((1200, 630), Image.LANCZOS), True)
        c.save(os.path.join(OUT, "og.jpg"), quality=86, optimize=True, progressive=True)
        print("og               1200x630")

    # Favicon y marca. El origen son 240x240: no se agranda. Antes se emitía
    # un logo-512 interpolado que pesaba 149 kB — más que la foto del hero —
    # para mostrarse a 38 px en el header.
    p = os.path.join(SRC, "logo.png")
    if wanted("logo") and os.path.exists(p):
        lg = Image.open(p).convert("RGBA")
        for s in (32, 64, 128, 180, 240):
            if s > lg.width:
                continue
            r = lg.resize((s, s), Image.LANCZOS)
            r = r.quantize(colors=64, method=Image.FASTOCTREE, dither=Image.NONE)
            r.save(os.path.join(OUT, f"logo-{s}.png"), optimize=True)
        print("logo             32/64/128/180/240")


if __name__ == "__main__":
    main()
