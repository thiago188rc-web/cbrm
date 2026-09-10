# Cabinas Desarmables RM — sitio web

Demo funcional del sitio de Cabinas Desarmables RM (Puerto General San Martín, Santa Fe).
Sitio estático, sin build ni dependencias. Se sirve tal cual.

## Estructura

```
index.html          la página entera (HTML + CSS inline)
src/app.js          toda la lógica: router, configurador, medidor, panel
src/assets.js       el mapa de imágenes (apunta a /img)
img/         las fotos reales de RM + el logo
vercel.json         cache de imágenes y URLs limpias
robots.txt          / sitemap.xml   SEO
```

No hay `package.json` a propósito: es HTML/CSS/JS plano. Vercel lo detecta como
"Other" y lo publica sin compilar nada.

## Subirlo — paso a paso

### 1. GitHub

Opción con la web de GitHub (sin usar la terminal):
1. Entrá a https://github.com/new y creá un repo, por ejemplo `cabinas-rm`.
   Dejalo público o privado, da igual. No agregues README (ya hay uno).
2. En la página del repo vacío, tocá **uploading an existing file**.
3. Arrastrá **todo el contenido de esta carpeta** (index.html, src/, /,
   vercel.json, robots.txt, sitemap.xml, README.md). Mantené las carpetas.
4. Abajo, **Commit changes**.

Opción con terminal (si la tenés):
```bash
git init
git add .
git commit -m "Sitio Cabinas RM"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/cabinas-rm.git
git push -u origin main
```

### 2. Vercel

1. Entrá a https://vercel.com y logueate **con tu cuenta de GitHub**.
2. **Add New… → Project**.
3. Elegí el repo `cabinas-rm` y tocá **Import**.
4. No cambies nada: Framework Preset queda en **Other**, el resto vacío.
5. **Deploy**. En unos segundos te da una URL tipo `cabinas-rm.vercel.app`.

Listo. Cada vez que subas un cambio a GitHub, Vercel lo publica solo.

### 3. Dominio propio (cuando lo tengas)

En el proyecto de Vercel → **Settings → Domains** → agregás el dominio
(ej. `cabinasrm.com.ar`) y seguís las instrucciones de DNS que te da.
Cuando esté, ya quedan bien las URLs de Open Graph y del sitemap, que
apuntan a `https://cabinasrm.com.ar/`.

## Antes de mostrarlo como sitio real (no demo)

Todo lo marcado `A CONFIRMAR` en el sitio son datos que faltan del taller
(medidas, materiales, pago, envío, plazos, garantía). Están en la lista de
la sección 16 del blueprint. Editás los textos en `src/app.js`, dentro del
objeto `DATA`, y listo — no hace falta tocar el diseño.

El WhatsApp está cableado como `5493476569154`. Confirmá que el número lleve
el 9 antes de publicarlo (está anotado en el código, buscá `const WA`).
