# Cabinas Desarmables RM — sitio web

Sitio de Cabinas Desarmables RM (Puerto General San Martín, Santa Fe).
HTML, CSS y JavaScript planos: no hay build, no hay dependencias, se sirve tal cual.

## Estructura

```
index.html              la página entera (HTML + CSS inline)
src/app.js              router, contenido, cotizador, medidor y panel
src/assets.js           inventario de fotos: qué se ve en cada una
img/                    derivados publicados (AVIF + JPG, varios anchos)
img/src/                las fotos originales de RM — de acá sale todo lo demás
tools/build-images.py   genera img/ a partir de img/src/
tools/dev-server.py     servidor local que imita los rewrites de Vercel
vercel.json             rewrites, cache y cabeceras
robots.txt / sitemap.xml
```

## Trabajar en local

```bash
python tools/dev-server.py      # http://localhost:4321
```

Hace falta porque el sitio usa direcciones reales (`/presupuesto`,
`/cabinas-para-detailing`): abrir el `index.html` con doble clic, o un
`http.server` pelado, da 404 en todo lo que no sea la raíz.

## Direcciones

El router usa la History API, no fragmentos. Cada vista tiene su URL, su
`<title>`, su descripción y su `canonical`:

| URL | Vista |
|---|---|
| `/` | Home |
| `/cabinas-para-detailing` · `-lavaderos` · `-lubricentros` · `-concesionarias` | Rubro |
| `/modelos` · `/modelos/<slug>` | Catálogo y ficha |
| `/trabajos` | Cabinas entregadas |
| `/presupuesto` | Cotizador |
| `/panel` | Panel interno (noindex) |

Los enlaces viejos con `#/` (por ejemplo `#/rubro/detailing`) siguen
funcionando: se traducen a la dirección nueva y se reemplazan en el historial.

`vercel.json` manda cualquier ruta a `index.html` con un rewrite `/(.*)`.
Vercel busca el archivo en disco **antes** de aplicar el rewrite, así que
`/img`, `/src`, `/sitemap.xml` y `/robots.txt` se sirven como estáticos y no
hace falta excluirlos.

> Ojo con `vercel.json`: se valida contra un esquema estricto y cualquier
> clave de primer nivel que no reconozca hace **fallar el deploy entero**.
> JSON no tiene comentarios y agregar una clave `"comment"` para explicar algo
> rompe el build. Las explicaciones van acá.

## Fotografía

Las originales viven en `img/src/`. El pipeline genera AVIF + JPEG progresivo
en varios anchos, más los recortes apaisados y la imagen de Open Graph:

```bash
python tools/build-images.py
```

Reglas, escritas en el propio script:

- No se altera el producto. Sólo reescalado, enfoque de lo que la reducción se
  lleva, y compresión. Sin retoque de color ni elementos agregados.
- Los recortes están declarados uno por uno, con el motivo. Nada se recorta
  «automático a 4/3».
- Nunca se agranda por encima de la resolución nativa (la única excepción es
  `og.jpg`, porque las redes exigen 1200×630 exactos).

`src/assets.js` declara, para cada foto, **qué se ve en ella**. De eso depende
dónde puede usarse: una foto ilustra un argumento sólo si el argumento se ve en
la foto. Donde no hay foto que lo pruebe queda un espacio reservado explícito.

> **Pendiente que mejora todo lo demás:** las fotos actuales son exportes de
> Instagram (1080 px de ancho como máximo). Los originales del celular de RM
> son de ~4000 px. Pidiéndolos y poniéndolos en `img/src/`, el mismo pipeline
> genera variantes nítidas para pantallas retina sin tocar una línea de código.

## Dominio

El origen canónico está en **un solo lugar por archivo**:

- `SITE` en `src/app.js`
- las etiquetas `canonical` / `og:` en `index.html`
- `sitemap.xml` y `robots.txt`

Hoy apuntan a `https://cbrm.vercel.app`. Cuando entre el dominio propio se
cambian esos cuatro y listo.

## Datos que faltan del taller

Lo que no está confirmado aparece marcado como «a confirmar» en el sitio, y no
se inventa. Hoy son: medidas por modelo, espesor de la chapa, carta completa de
colores de la franja, plazos de fabricación, condiciones de pago, zonas y costo
de flete, quién arma y si el armado va incluido, y el alcance de la garantía.

Se editan en el objeto `DATA` de `src/app.js`. No hay que tocar el diseño: las
fichas ya están armadas para recibir esos datos.

## Confirmado

- WhatsApp **+54 9 3476 56-9154**, verificado contra el enlace oficial de RM en
  Instagram (`wa.me/message/7DHRXLFXX5XEI1` resuelve a `phone=5493476569154`).
- Taller en Pres. Juan Domingo Perón 1119, Puerto General San Martín, Santa Fe.
- Horarios: lunes a viernes de 9 a 17, sábados de 9 a 12.
- Instagram [@cabinasdesarmablesrm](https://www.instagram.com/cabinasdesarmablesrm/).

## Panel de consultas

`/panel` guarda las consultas en el `localStorage` del navegador que lo usa: lo
que se mueva de columna sigue ahí al día siguiente, y lo que entra por el
cotizador queda registrado. Para que el equipo vea el mismo tablero desde
varios teléfonos hace falta conectarlo a una base (Supabase, por ejemplo); esa
pantalla no cambia, cambia de dónde sale `LEADS`.

## Publicar

Cada push a `main` lo publica Vercel solo. El proyecto está configurado como
«Other»: no compila nada.
