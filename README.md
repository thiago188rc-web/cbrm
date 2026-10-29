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

Dos trampas de `vercel.json`, las dos ya pisadas:

> **No lleva comentarios.** Se valida contra un esquema estricto y cualquier
> clave de primer nivel que no reconozca hace **fallar el deploy entero**.
> Agregar un `"comment"` para explicar algo rompe el build. Las explicaciones
> van acá.

> **`cleanUrls` es incompatible con este rewrite.** Con `cleanUrls: true`,
> Vercel redirige `/index.html` a `/` con un 308, y entonces el destino del
> rewrite deja de ser servible: todas las rutas dan 404. Acá no aporta nada
> — hay un solo archivo HTML y el ruteo lo hace el JS — así que está apagado.

## Fotografía

Las originales viven en `img/src/`. El pipeline genera AVIF + JPEG progresivo
en varios anchos, más los recortes apaisados y la imagen de Open Graph:

```bash
python tools/build-images.py                                # todo
python tools/build-images.py hero-detailing camion-rm   # sólo esas fuentes
```

Con nombres (sin extensión) procesa sólo esas fuentes y no reescribe las
variantes ya publicadas. `hero-detailing.jpg` es la portada de la home: una
escena de referencia del rubro, no una cabina entregada. `camion-rm.png` es la
gráfica de envíos: se publica entera, recortada a su contorno y aplanada sobre
el fondo de la sección (el PNG trae transparencia y el JPEG no la soporta).

> **Cambiar una imagen = cambiarle el nombre.** `/img` se sirve con caché
> `immutable` de un año: si se pisa un archivo con el mismo nombre, quien ya
> visitó el sitio sigue viendo el viejo.

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
cambian esos cuatro y listo. El dominio tiene que incluir «RM»: las opciones
conversadas son `cabinasdesarmablesrm.com` y `cabinasdesarmablesrm.com.ar`, y la
elección sigue pendiente.

## La consulta por WhatsApp

En la home el visitante elige rubro, pack, medida y modelo, y suma su
localidad. Todo es opcional. Lo elegido vive en `CTX` (`src/app.js`) y
`waMsg()` lo escribe en el mensaje de **todos** los botones de WhatsApp de la
home. La «orden de consulta» del cierre y el botón fijo del celular muestran lo
que va a viajar, y los botones de medidas y de rubro dicen en su texto qué
consulta abren. El sitio solo abre WhatsApp con el texto armado: el mensaje lo
manda la persona.

El botón fijo (`#fab`) aparece solo en el celular y solo cuando ningún otro
botón de WhatsApp está a la vista: nunca hay dos iguales juntos y nunca falta
uno. Se esconde con el teclado abierto y con el menú abierto. En escritorio no
existe porque el encabezado ya tiene el suyo.

## Datos que faltan del taller

Lo que no está confirmado no se publica como hecho. Hoy faltan:

- **Materiales**: material de la estructura, espesor de la chapa, aislación,
  tornillería y cableado. La ficha «Materiales y componentes» (`DATA.packSpec`)
  publica solo lo confirmado: cuando llegue un dato, se suma una fila en su
  grupo y aparece sola.
- **Medidas**: qué combinaciones de las medidas frecuentes (4,50 y 5 m de
  ancho; 4, 6, 8 y 10 m de largo) se fabrican, el alto, la medida interior y la
  medida de cada modelo.
- **Imágenes**: qué fotos de la maqueta reemplazar, y fotos o renders propios
  para los otros usos (`DATA.usos[].img`).
- **Comerciales**: plazos de fabricación, condiciones de pago, costo del flete
  (se suma en la cotización), quién arma y si el armado va incluido, y el
  alcance de la garantía.
- **Fotos**: que las cinco fotos de cabinas sean todas trabajos propios
  entregados. Hoy el sitio dice que son de RM y que están publicadas en su
  Instagram.
- **Modelos**: los cinco modelos (moto, compacta, de trabajo, doble, a medida)
  son una clasificación del sitio. Falta que RM confirme sus nombres y
  medidas, y qué pack corresponde a cada uno.
- **Canales**: que `facebook.com/cabinasdesarmablesrm` sea la página de RM
  (está en el pie y en el JSON-LD).
- **Horario**: el «Abierto ahora» no contempla feriados.
- **Dominio**: la elección final entre `.com` y `.com.ar`.

Se editan en el objeto `DATA` de `src/app.js`. No hay que tocar el diseño: las
fichas ya están armadas para recibir esos datos.

## Confirmado

- WhatsApp **+54 9 3476 56-9154**, verificado contra el enlace oficial de RM en
  Instagram (`wa.me/message/7DHRXLFXX5XEI1` resuelve a `phone=5493476569154`).
- Taller en Pres. Juan Domingo Perón 1119, Puerto General San Martín, Santa Fe.
- Horarios: lunes a viernes de 9 a 17, sábados de 9 a 12.
- Instagram [@cabinasdesarmablesrm](https://www.instagram.com/cabinasdesarmablesrm/).
- Envíos a todo el país; el envío generalmente se suma en la cotización.
- Packs (en `DATA.packs` y `DATA.packSpec`): **Box** (estructura 100%
  desarmable, chapa trapezoidal color a elección), **Studio** (suma piso
  encastrable e iluminación básica) y **Studio Pro** (suma piso encastrable e
  iluminación Full Pro). Son otra dimensión que los modelos: el pack dice qué
  trae la cabina, el modelo qué entra adentro. Ningún dato dice qué pack va con
  qué modelo, así que el sitio no los cruza.
- Las cabinas son modulares y pueden aplicarse a distintos rubros. Además de
  los cuatro con página, RM mencionó barberías, heladerías, quioscos, manicura,
  locales de pesca y oficinas (`DATA.usos`, presentados como usos posibles).
- Medidas frecuentes para iniciar la consulta: 4,50 y 5 m de ancho; 4, 6, 8 y
  10 m de largo, y medidas personalizadas (`DATA.medidas`). No es una tabla de
  modelos estándar.
- No hay precios fijos: cada cabina se cotiza según medida y necesidad.

## Panel de consultas

`/panel` guarda las consultas en el `localStorage` del navegador que lo usa: lo
que se mueva de columna sigue ahí al día siguiente, y lo que entra por el
cotizador queda registrado. Para que el equipo vea el mismo tablero desde
varios teléfonos hace falta conectarlo a una base (Supabase, por ejemplo); esa
pantalla no cambia, cambia de dónde sale `LEADS`.

## Publicar

Cada push a `main` lo publica Vercel solo. El proyecto está configurado como
«Other»: no compila nada.
