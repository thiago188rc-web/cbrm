/* ═══════════════════════════════════════════════════════════════
   CABINAS DESARMABLES RM — demo funcional
   Arquitectura data-driven: todo el contenido vive en DATA.
   Migrar a CMS/Supabase = reemplazar DATA por un fetch. Las vistas
   no cambian. Ningún dato comercial está inventado: lo que no está
   confirmado se renderiza como <span class="tbd">A CONFIRMAR</span>.
   ═══════════════════════════════════════════════════════════════ */
const IMG = window.RM_IMG;
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

/* Origen canónico. Vive en un solo lugar a propósito: el día que entre el
   dominio propio se cambia acá y quedan bien canonical, Open Graph, sitemap
   y los enlaces que se comparten. Antes apuntaba a cabinasrm.com.ar, que no
   resuelve — eso le decía a Google que la versión buena de este sitio estaba
   en un dominio muerto, y rompía la vista previa al compartir por WhatsApp. */
const SITE = 'https://cbrm.vercel.app';

/* Teléfono: verificado contra el enlace oficial de RM en Instagram
   (wa.me/message/7DHRXLFXX5XEI1 resuelve a phone=5493476569154). */
const TEL_HUMAN = '+54 9 3476 56-9154';
const WA = '5493476569154';
const IG = 'https://www.instagram.com/cabinasdesarmablesrm/';
const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const TBD = (t = 'a confirmar') => `<span class="tbd">${t}</span>`;

/* ── FOTOGRAFÍA ──────────────────────────────────────────────────
   Un solo helper arma el <picture>. Sirve AVIF con JPEG de respaldo,
   declara width/height (el navegador reserva el hueco y la página no
   salta) y elige el ancho por `sizes`. Nada de object-fit por defecto:
   el encuadre se decide en cada llamada. */
function pic(name, o = {}) {
  const p = IMG[name];
  if (!p) return '';
  const {
    sizes = '100vw', cls = '', eager = false, alt = p.alt,
    ratio = '', fit = 'cover', pos = '50% 50%', style = ''
  } = o;
  const set = ext => p.ws.map(w => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const box = ratio ? `aspect-ratio:${ratio};` : '';
  return `<picture class="ph ${cls}" style="${box}${style}">
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <img src="/img/${name}-${p.ws[p.ws.length - 1]}.jpg" srcset="${set('jpg')}" sizes="${sizes}"
      width="${p.w}" height="${p.h}" alt="${alt}"
      style="object-fit:${fit};object-position:${pos}"
      ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'}>
  </picture>`;
}

/* Figura de galería: foto + epígrafe + lightbox. */
const figura = (name, o = {}) => `
  <figure class="${o.cls || ''}" data-img="${name}" data-cur="Ampliar" ${o.ratio ? `style="aspect-ratio:${o.ratio}"` : ''}>
    ${pic(name, { ...o, cls: 'fill' })}
    <figcaption>${o.cap || IMG[name].cap}</figcaption>
  </figure>`;

/* ── DATOS ──────────────────────────────────────────────────── */
const EMPRESA = {
  calle: 'Pres. Juan Domingo Perón 1119',
  ciudad: 'Puerto General San Martín',
  prov: 'Santa Fe, Argentina',
  maps: 'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent('Pres. Juan Domingo Perón 1119, Puerto General San Martín, Santa Fe'),
  horarios: [['Lunes a viernes', '09:00 – 17:00', 1], ['Sábado', '09:00 – 12:00', 1], ['Domingo', 'Cerrado', 0]]
};

const DATA = {
  /* `foto` es la cabina entregada que ilustra el rubro. La regla: sólo se
     usa una foto si lo que el texto afirma SE VE en la foto. Ninguna se
     presenta como "una cabina en un lavadero" — eso no consta. El epígrafe
     dice lo que la foto prueba de verdad, ni más ni menos. */
  rubros: [
    {
      slug: 'detailing', n: 'Detailing', qRubro: 'Detailing',
      h1: 'Cabinas para detailing',
      claim: 'Ves la pintura. Y después la mostrás.',
      prob: 'Trabajás en un galpón con luz de tubo. Los swirls aparecen recién cuando el auto sale al sol. Y las fotos que subís no le hacen justicia a lo que hiciste.',
      sol: 'Un box propio adentro de tu local. Con el Pack Studio trae spots y reflectores; con el Studio Pro suma plafones LED laterales y de techo. El mismo espacio te sirve para corregir y para fotografiar.',
      /* Sólo lo confirmado de los packs. Techo y accesorios no figuran en
         las especificaciones: no se afirman ni se descartan. */
      pts: ['Iluminación Full Pro (Pack Studio Pro): plafones LED laterales y de techo', 'Piso encastrable en los packs Studio y Studio Pro', 'Revestimiento en chapa trapezoidal, color a elección', 'Estructura 100% desarmable'],
      foto: 'negra-wide', fotoCap: 'Cabina entregada · terminación negra',
      faq: ['luz', 'techo', 'entra', 'arma'],
      seoD: 'Cabinas desarmables para detailing en chapa trapezoidal, color a elección. Con el Pack Studio Pro suman piso encastrable e iluminación Full Pro, con plafones LED laterales y de techo. Se arman adentro de tu local.'
    },
    {
      slug: 'lavaderos', n: 'Lavaderos', qRubro: 'Lavadero',
      h1: 'Cabinas para lavaderos',
      /* Antes prometía protección contra la lluvia, que depende de un techo
         que no figura en los packs. Ahora el argumento es el sector propio. */
      claim: 'Un box propio para tu servicio premium.',
      prob: 'El lavado común y el servicio que querés cobrar distinto comparten el mismo espacio. Y el local no acompaña al precio que querés cobrar.',
      sol: 'Un box desarmable adentro de tu local, que te habilita a ofrecer un servicio premium separado del lavado común.',
      pts: ['Un sector diferenciado dentro del mismo local', 'Revestimiento en chapa trapezoidal, color a elección', 'Piso encastrable en los packs Studio y Studio Pro', 'Estructura 100% desarmable'],
      foto: 'blanca-wide', fotoCap: 'Cabina entregada · terminación blanca',
      faq: ['agua', 'material', 'entra', 'envio'],
      seoD: 'Cabinas desarmables para lavaderos de autos: un box propio adentro de tu local para separar el servicio premium del lavado común. Chapa trapezoidal color a elección y, según el pack, piso encastrable e iluminación.'
    },
    {
      slug: 'lubricentros', n: 'Lubricentros', qRubro: 'Lubricentro',
      h1: 'Cabinas para lubricentros',
      claim: 'Separá el sector limpio sin cerrar por obra.',
      prob: 'Tenés el sector sucio y el sector limpio mezclados en el mismo espacio, y la imagen del local no acompaña al servicio que das.',
      sol: 'Un box limpio y presentable adentro del taller que ya tenés, sin albañiles ni escombros.',
      pts: ['Delimita un sector propio dentro del galpón', 'Sin obra civil ni escombros', 'Estructura 100% desarmable: se desarma si mudás el negocio', 'Revestimiento en chapa trapezoidal, color a elección'],
      foto: 'negraBajo-wide', fotoCap: 'Cabina entregada · terminación negra',
      faq: ['arma', 'entra', 'obra', 'envio'],
      seoD: 'Cabinas desarmables para lubricentros: delimitá un sector limpio adentro del taller, sin obra húmeda ni escombros. Chapa trapezoidal color a elección y, según el pack, piso encastrable e iluminación.'
    },
    {
      slug: 'concesionarias', n: 'Concesionarias', qRubro: 'Concesionaria',
      h1: 'Cabinas para concesionarias',
      claim: 'Todas las unidades, con la misma foto.',
      prob: 'Cada unidad que ingresa hay que fotografiarla, y cada foto sale distinta según dónde estaba parada y a qué hora se tomó. El resultado es una publicación despareja.',
      sol: 'Un set fijo dentro de tu propio local: mismo fondo y mismo encuadre para toda la flota, con la iluminación de los packs Studio y Studio Pro. Y un espacio de entrega que se siente distinto.',
      pts: ['Fondo constante en todas las publicaciones', 'Sirve para autos y para motos', 'Espacio de entrega de unidad', 'Revestimiento en chapa trapezoidal, color a elección'],
      /* Esta foto ES una foto de producto tomada adentro de la cabina:
         es la prueba literal del argumento del rubro. */
      foto: 'hero-wide', fotoCap: 'Auto adentro de una cabina RM · terminación blanca',
      faq: ['techo', 'marca', 'entra', 'envio'],
      seoD: 'Cabinas para concesionarias: un set fijo adentro de tu local para fotografiar toda la flota con el mismo fondo, y para entregar la unidad. Sirve para autos y motos.'
    }
  ],

  /* Modelos nombrados por capacidad, no por fantasía: la taxonomía
     sobrevive a cualquier nombre que después confirme el cliente.

     Sin fotografía por modelo, y a propósito: ninguna de las fotos de RM
     permite saber qué medida es. En vez del hueco negro que había antes,
     cada modelo muestra un esquema a escala de lo que entra adentro —
     `veh` es la lista de vehículos y `holgura` el margen de trabajo
     alrededor, en proporción, no en metros. Informa sin inventar cotas.
     Las fotos de cabinas entregadas están donde corresponde: en Trabajos. */
  modelos: [
    { slug: 'moto', n: 'Cabina moto', qe: 'Una moto con espacio para trabajar alrededor.', veh: 'Moto', plan: ['moto'], holgura: 1.0 },
    { slug: 'compacta', n: 'Cabina compacta', qe: 'Un auto. Pensada para espacios ajustados.', veh: 'Auto', plan: ['auto'], holgura: 0.42 },
    { slug: 'trabajo', n: 'Cabina de trabajo', qe: 'Un auto con lugar para trabajar en los cuatro lados.', veh: 'Auto', plan: ['auto'], holgura: 0.95 },
    { slug: 'doble', n: 'Cabina doble', qe: 'Dos autos, o un auto más puesto de trabajo fijo.', veh: 'Dos autos', plan: ['auto', 'auto'], holgura: 0.6 },
    { slug: 'medida', n: 'A medida', qe: 'Se fabrica según el espacio que tengas.', veh: 'A medida', plan: null, holgura: 0 }
  ],

  /* Packs: QUÉ TRAE la cabina. Confirmados por RM. Son otra dimensión que
     los modelos (QUÉ ENTRA adentro) y no se mezclan: ningún dato dice qué
     pack va con qué modelo, así que la home no los cruza. */
  packs: [
    { n: 'Pack Box', corto: 'Box', resumen: 'La estructura desarmable con su revestimiento.', piso: false, luz: '' },
    { n: 'Pack Studio', corto: 'Studio', resumen: 'Suma piso encastrable e iluminación básica.', piso: true, luz: 'Básica' },
    { n: 'Pack Studio Pro', corto: 'Studio Pro', resumen: 'Suma piso encastrable e iluminación Full Pro, con plafones LED.', piso: true, luz: 'Full Pro' }
  ],
  /* Materiales y componentes, tal como los pasó RM, agrupados por parte de
     la cabina. Un valor por pack, en el orden de `packs`: true figura,
     false no figura, o el texto exacto. Lo que RM todavía no confirmó
     (material de la estructura, espesor de la chapa, aislación,
     tornillería, cableado) NO se publica, ni siquiera como «a confirmar»:
     cuando llegue el dato se suma acá una fila en su grupo y aparece sola. */
  packSpec: [
    ['Estructura y revestimiento', [
      ['Estructura 100% desarmable', true, true, true],
      ['Revestimiento en chapa trapezoidal, color a elección', true, true, true]
    ]],
    ['Piso', [
      ['Piso encastrable', false, true, true]
    ]],
    /* Así lo agrupa RM: el tablero y los tomacorrientes son parte de la
       iluminación básica (Studio) y de la Full Pro (Studio Pro). */
    ['Iluminación', [
      ['Tablero eléctrico con disyuntor y térmicas', false, true, true],
      ['Spots dicroicos de 7 W', false, 'Parte baja y laterales', 'Parte media y laterales bajos'],
      ['Plafones LED laterales y de techo', false, false, true],
      ['Reflectores', false, true, true],
      ['Cajas tomacorrientes dobles', false, true, true]
    ]]
  ],

  /* Medidas frecuentes que mencionó RM, en metros, para arrancar la
     consulta. NO es una tabla de modelos: qué combinación se fabrica, el
     alto y la medida interior se confirman por WhatsApp. */
  medidas: { ancho: ['4,50', '5'], largo: ['4', '6', '8', '10'] },

  /* Otros usos posibles que mencionó RM, además de los cuatro rubros con
     página. Son usos, no trabajos entregados: el bloque es tipográfico.
     Cuando RM entregue y apruebe una foto o un render propio de alguno,
     se carga en assets.js y se nombra en `img`: la home lo muestra. */
  usos: [
    { n: 'Barberías', q: 'Barbería', img: '' },
    { n: 'Heladerías', q: 'Heladería', img: '' },
    { n: 'Quioscos', q: 'Quiosco', img: '' },
    { n: 'Manicura', q: 'Manicura', img: '' },
    { n: 'Locales de pesca', q: 'Local de pesca', img: '' },
    { n: 'Oficinas', q: 'Oficina', img: '' }
  ],

  /* El epígrafe visible es corto. La descripción completa vive en el alt,
     que es donde le sirve a un lector de pantalla y a Google. */
  trabajos: [
    { img: 'hero', cap: 'Terminación blanca', alt: 'Auto dentro de una cabina RM de terminación blanca, con cielorraso luminoso y piso encastrable' },
    { img: 'negraBajo', cap: 'Terminación negra', alt: 'Interior de cabina RM en terminación negra, con cielorraso de chapa nervada y luminarias embutidas' },
    { img: 'blanca', cap: 'Terminación blanca', alt: 'Cabina RM de terminación blanca vacía, con piso encastrable y franja perimetral amarilla' },
    { img: 'negraFrente', cap: 'Terminación negra', alt: 'Interior de cabina RM en terminación negra con barras retroiluminadas y franja de piso magenta' },
    { img: 'moto', cap: 'Terminación blanca', alt: 'Moto dentro de una cabina RM de terminación blanca con cielorraso de paneles LED' }
  ],

  faq: {
    entra: ['¿Cómo sé si me entra en el espacio que tengo?', 'Medí tres cosas: ancho, largo y <b>alto libre</b> (hasta lo más bajo que haya: una viga, un caño o una luminaria). Con esas tres te decimos qué medida te sirve. Podés cargarlas en la sección de medidas de la home y viajan en el mensaje de WhatsApp.'],
    /* Iluminación y techo: sólo lo que dicen las especificaciones de los
       packs. Lo que no figura ahí no se afirma ni se descarta. */
    luz: ['¿Qué iluminación trae?', 'Depende del pack. El Studio trae iluminación básica: tablero eléctrico con disyuntor y térmicas, spots dicroicos de 7&nbsp;W en la parte baja y los laterales, reflectores y cajas tomacorrientes dobles. El Studio Pro trae iluminación Full Pro: tablero eléctrico con disyuntor y térmicas, spots dicroicos de 7&nbsp;W en la parte media y los laterales bajos, plafones LED laterales y de techo, reflectores y cajas tomacorrientes dobles. El Pack Box es la estructura con su revestimiento.'],
    techo: ['¿La cabina incluye techo?', 'Las especificaciones de los packs que publicamos no detallan el techo: si lo incluye y cómo se resuelve en tu caso, lo confirmamos en la consulta.'],
    arma: ['¿Cuánto tarda el armado y quién la arma?', 'Es un sistema modular y 100% desarmable, sin obra civil. Quién arma, en cuánto tiempo y si el armado va incluido lo confirmamos en la consulta.'],
    obra: ['¿Tengo que hacer obra o pedir permiso?', 'No hace falta obra civil: es un sistema modular y desarmable. Cualquier requisito municipal depende de tu localidad y de tu habilitación: no damos una respuesta general para no decir algo que no corresponda a tu caso.'],
    material: ['¿De qué material es el revestimiento?', 'Chapa trapezoidal, color a elección, sobre una estructura 100% desarmable. El espesor lo confirmamos en la consulta.'],
    agua: ['¿Aguanta un lavadero, con agua todos los días?', 'Es la pregunta correcta para este rubro y merece una respuesta precisa, no un “sí” genérico: te la contestamos por WhatsApp con el detalle de material y mantenimiento según cómo trabajes.'],
    marca: ['¿Le puedo poner la marca de mi negocio adentro?', 'Contanos qué querés poner y dónde, y lo vemos en la consulta.'],
    envio: ['¿Hacen envíos? ¿A qué zonas?', 'Sí, a todo el país. Fabricamos en Puerto General San Martín, Santa Fe, y el costo del envío generalmente se suma en la cotización: por eso te pedimos la localidad.'],
    precio: ['¿Cuánto sale?', 'Depende del pack, del modelo y del envío, que generalmente se suma en la cotización. No publicamos una lista de precios: escribinos con tu caso y te pasamos el presupuesto.'],
    packModelo: ['¿Qué diferencia hay entre un pack y un modelo?', 'El pack dice qué trae la cabina: el Box es estructura y revestimiento; el Studio y el Studio Pro suman piso encastrable e iluminación. El modelo describe qué tiene que entrar adentro: una moto, un auto, dos autos o una medida especial. Qué pack corresponde a cada modelo lo vemos en la consulta: contanos las dos cosas.'],
    pago: ['¿Cómo se paga?', 'Las condiciones de pago las vemos en la consulta.'],
    garantia: ['¿Tiene garantía?', 'Preguntalo en la consulta: es un dato que todavía no publicamos.'],
    motos: ['¿Sirve para motos?', 'Sí: en la galería de trabajos hay una cabina de RM con una moto adentro.']
  },
  /* Sólo preguntas con respuesta respaldada. Plazos, pago, armado y garantía
     siguen a confirmar: van juntos en una línea de "Cómo se compra". */
  faqHome: ['precio', 'packModelo', 'entra', 'envio', 'motos']
};

/* Prefill compartido entre el medidor, las páginas de rubro y el cotizador */
const PRE = { rubro: '', vehiculo: '', ancho: '', largo: '', alto: '', modelo: '' };

/* ── UI base ────────────────────────────────────────────────── */
const HOLA = 'Hola RM, quiero hacerles una consulta sobre una cabina.';

/* ── WHATSAPP CON CONTEXTO ──────────────────────────────────────
   Lo que el visitante va eligiendo en la home (pack, rubro, modelo,
   medidas, localidad) se suma al mensaje de TODOS los botones de
   WhatsApp de la página. Nada es obligatorio: sin datos sale el saludo.
   Fuera de la home los botones globales mandan HOLA, como siempre. */
/* mA / mL: la medida de cabina elegida (frecuente u «Otra»).
   ancho / largo / alto: las medidas del local del visitante, opcionales. */
const CTX = { pack: '', rubro: '', modelo: '', mA: '', mL: '', mOtra: false, ancho: '', largo: '', alto: '', loc: '' };
const IC_WA = `<svg class="ic-wa" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.3L3 20.5l1.8-5.3A8.4 8.4 0 1 1 21 11.5z"/><path d="M8.5 9.2c.2 2.4 2.4 4.9 5 5.6.7.2 1.4-.1 1.7-.7l.2-.5-1.9-1-.7.8c-1-.4-2-1.4-2.5-2.5l.8-.7-1-1.9-.5.2c-.6.3-1 .9-1.1 1.6z"/></svg>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const medTxt = d => d.mA && d.mL ? `${d.mA} × ${d.mL} m` : d.mA ? `${d.mA} m de ancho` : d.mL ? `${d.mL} m de largo` : '';

function waMsg(o = {}) {
  const d = { ...CTX, ...o };
  const med = medTxt(d);
  const filas = [['RUBRO', d.rubro], ['PACK', d.pack],
    ['MEDIDA', med && `${med}${d.mA && d.mL ? ' (ancho × largo)' : ''}${d.mOtra ? ', a medida' : ''}`],
    ['MODELO', d.modelo],
    ['MI LOCAL', d.ancho && d.largo ? `${d.ancho} ancho × ${d.largo} largo${d.alto ? ` × ${d.alto} alto libre` : ''} (m)` : ''],
    ['LOCALIDAD', d.loc]].filter(f => f[1]);
  const L = ['Hola RM, quiero consultar por una cabina.'];
  if (filas.length) L.push('', ...filas.map(f => `▸ ${f[0]}: ${f[1]}`));
  L.push('', 'Consulta desde ' + SITE.replace(/^https?:\/\//, ''));
  return L.join('\n');
}

/* Botón de WhatsApp de la home. `o.pack` / `o.rubro` fijan la opción del
   botón; el resto del mensaje sale de CTX. */
const btnWA = (label, o = {}, cls = 'btn-p') => `<a class="btn ${cls}" data-wa${o.pack ? ` data-wa-pack="${o.pack}"` : ''}${o.rubro ? ` data-wa-rubro="${o.rubro}"` : ''}${o.lb ? ` data-wa-lb="${o.lb}" data-wa-base="${label}"` : ''}
  href="${wa(waMsg({ ...(o.pack && { pack: o.pack }), ...(o.rubro && { rubro: o.rubro }) }))}" target="_blank" rel="noopener"${o.aria ? ` aria-label="${o.aria}"` : ''}>${IC_WA}<span>${label}</span></a>`;

/* Botones que dicen qué consulta abren: el texto cambia con lo elegido. */
const LB = {
  med: () => medTxt(CTX) && `Consultar ${medTxt(CTX)}`,
  rubro: () => CTX.rubro && CTX.rubro !== 'Otro rubro' && `Consultar para ${CTX.rubro.toLowerCase()}`
};

function refreshWA() {
  const home = location.pathname === '/';
  $$('a[data-wa]').forEach(a => {
    const o = {};
    if (a.dataset.waPack) o.pack = a.dataset.waPack;
    if (a.dataset.waRubro) o.rubro = a.dataset.waRubro;
    a.href = wa(home ? waMsg(o) : HOLA);
  });
  /* Lo elegido queda a la vista: así el mensaje no sorprende a nadie. */
  $$('[data-pack-card]').forEach(c => c.classList.toggle('elegido', c.dataset.packCard === CTX.pack));
  $$('[data-rubro-row]').forEach(c => c.classList.toggle('elegido', c.dataset.rubroRow === CTX.rubro));
  $$('a[data-wa-lb]').forEach(a => { $('span', a).textContent = (home && LB[a.dataset.waLb]()) || a.dataset.waBase; });
  $$('input[name="pack"]').forEach(i => { i.checked = i.value === CTX.pack; });
  $$('input[name="rubro"]').forEach(i => { i.checked = i.value === CTX.rubro; });
  pintarOrden();
}

/* ── ORDEN DE CONSULTA ──────────────────────────────────────────
   El gesto de la home: la consulta se arma como la cabina, por módulos.
   Cada fila muestra lo elegido y lleva a donde se elige; la misma
   selección viaja en todos los botones de WhatsApp. El botón fijo del
   celular muestra el resumen. */
const ORDEN = [['rubro', 'Rubro', '/#rubros'], ['pack', 'Pack', '/#sistema'],
  ['med', 'Medida', '/#medir'], ['modelo', 'Modelo', '/#modelos']];
const ordenVals = () => ({ rubro: CTX.rubro, pack: CTX.pack, med: medTxt(CTX), modelo: CTX.modelo });

function pintarOrden() {
  const V = ordenVals();
  $$('[data-of]').forEach(f => {
    const v = V[f.dataset.of] || '', out = $('.of-v', f);
    if (!out || out.dataset.v === v) return;
    out.dataset.v = v;
    out.textContent = v || 'Sin elegir';
    f.classList.toggle('lleno', !!v);
    const a = $('a', f), accion = v ? 'Cambiar' : 'Elegir';
    a.textContent = accion;
    a.setAttribute('aria-label', `${accion} ${$('dt', f).textContent.toLowerCase()}`);
    /* La fila "encastra": reiniciar la animación en cada cambio. */
    f.classList.remove('nuevo');
    if (v) { void f.offsetWidth; f.classList.add('nuevo'); }
  });
  const res = [CTX.pack.replace(/^Pack /, ''), CTX.rubro, medTxt(CTX)].filter(Boolean).join(' · ');
  const s = $('#fabCtx');
  if (s) {
    const home = location.pathname === '/';
    s.textContent = home ? res : '';
    s.hidden = !home || !res;
    $('#fabWa').setAttribute('aria-label', home && res ? `Abrir WhatsApp con tu consulta: ${res}` : 'Escribir por WhatsApp');
  }
}

/* Lo elegido en la home también viaja al cotizador, si el visitante
   prefiere el camino largo. */
function ctxAlCotizador() {
  if (CTX.rubro) Q.d.rubro = CTX.rubro;
  if (CTX.modelo) Q.d.modelo = CTX.modelo;
  if (CTX.pack) Q.d.pack = CTX.pack;
  if (CTX.mA || CTX.mL) Q.d.medida = medTxt(CTX) + (CTX.mA && CTX.mL ? ' (ancho × largo)' : '') + (CTX.mOtra ? ', a medida' : '');
  if (CTX.loc) Q.d.loc = CTX.loc;
  if (CTX.ancho && CTX.largo) { PRE.ancho = CTX.ancho; PRE.largo = CTX.largo; PRE.alto = CTX.alto; }
  if (!PRE.vehiculo && !PRE.ancho && Q.d.rubro && Q.i === 0) Q.i = 1;
}

/* Delegados en el documento: corren antes que el router (que escucha en
   window) y sobreviven a cada re-render de #main. */
document.addEventListener('click', e => {
  const t = e.target;
  if (!t.closest) return;
  if (t.closest('[data-quote-ctx]')) ctxAlCotizador();
  const w = t.closest('[data-wa-pack],[data-wa-rubro]');
  if (w) {
    if (w.dataset.waPack) CTX.pack = w.dataset.waPack;
    if (w.dataset.waRubro) CTX.rubro = w.dataset.waRubro;
    refreshWA();
  }
  const tg = t.closest('.pack-tg');
  if (tg) {
    const on = tg.getAttribute('aria-pressed') !== 'true';
    tg.setAttribute('aria-pressed', on);
    const tab = $('.pack-tab', tg.parentElement);
    if (tab) tab.classList.toggle('solo-dif', on);
  }
});
document.addEventListener('change', e => {
  const t = e.target, k = t.name;
  if (k === 'modelo' || k === 'pack' || k === 'rubro') { CTX[k] = t.value; refreshWA(); }
  if (k === 'modelo') dibujarPlan();
  /* Medida de cabina: una frecuente, u «Otra» con su campo. */
  if (k === 'mA' || k === 'mL') {
    const otra = t.value === 'otra', campo = $(`[data-m="${k}"]`);
    if (campo) {
      campo.closest('.chip-otra').hidden = !otra;
      if (otra) campo.focus();
    }
    CTX[k] = otra ? (campo ? numM(campo.value) : '') : t.value;
    CTX.mOtra = !!$('input[name="mA"][value="otra"]:checked, input[name="mL"][value="otra"]:checked');
    dibujarPlan(); refreshWA();
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f === 'loc') { CTX.loc = t.value.trim(); refreshWA(); }
  if (t.dataset.m) { CTX[t.dataset.m] = numM(t.value); dibujarPlan(); refreshWA(); }
});

/* "5,2" → "5,20"; "6" → "6". Vacío o inválido → ''. */
function numM(s) {
  const n = parseFloat(String(s).replace(',', '.'));
  if (!isFinite(n) || n <= 0 || n > 60) return '';
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
}

$('#logoImg').src = window.RM_LOGO;
$('#logoImg2').src = window.RM_LOGO;
$('#mobTel').textContent = TEL_HUMAN;
$('#mobWa').href = wa(HOLA);
$('#fabWa').href = wa(HOLA);
const ftWa = $('#ftWa'); ftWa.href = wa(HOLA); ftWa.textContent = TEL_HUMAN;

const burger = $('#burger'), mob = $('#mob');
burger.onclick = () => {
  const on = mob.classList.toggle('on');
  burger.classList.toggle('x', on);
  burger.setAttribute('aria-expanded', on);
  document.body.style.overflow = on ? 'hidden' : '';
  $$('#mob a').forEach((a, i) => a.style.animationDelay = (i * 55) + 'ms');
  fab();
};
const closeMob = () => { mob.classList.remove('on'); burger.classList.remove('x'); document.body.style.overflow = ''; fab(); };
$$('#mob a').forEach(a => a.onclick = closeMob);

/* Botón fijo de WhatsApp (celular). Antes era una barra de ~72 px a todo el
   ancho que tapaba contenido al bajar. Ahora es un botón en la esquina que
   aparece sólo cuando ningún otro botón de WhatsApp está a la vista: nunca
   hay dos iguales juntos y nunca falta uno. Se esconde con el teclado
   abierto (un campo con foco) y con el menú abierto. Nunca en el panel
   interno; en escritorio no existe (el encabezado ya tiene el suyo). */
/* Qué botones de WhatsApp de la página se ven: se mide directo, una vez por
   cuadro. Con IntersectionObserver el estado se perdía: si el scroll saltaba
   de "entero a la vista" a "casi afuera", el aviso del umbral no llegaba y
   el botón quedaba marcado como visible después de salir. */
let WA_LINKS = [], fabT = 0, fabRaf = 0;
function fabObservar(root) { WA_LINKS = $$('a[data-wa]', root); }
const waALaVista = () => {
  const h = innerHeight;
  return WA_LINKS.some(a => {
    const r = a.getBoundingClientRect();
    return r.height > 0 && Math.min(r.bottom, h) - Math.max(r.top, 0) >= r.height * 0.6;
  });
};
function fabVer() {
  const el = document.activeElement;
  /* Sólo los campos que abren el teclado: un radio con foco (elegir pack o
     rubro) no tapa nada y escondía el botón sin motivo. */
  const campo = el && el.matches && el.matches('textarea, input:not([type=radio]):not([type=checkbox]):not([type=button]):not([type=submit])');
  return !location.pathname.startsWith('/panel') && scrollY > innerHeight * 0.35
    && !campo && !mob.classList.contains('on') && !waALaVista();
}
function fab() {
  const f = $('#fab');
  clearTimeout(fabT);
  /* Esconder es inmediato; mostrar espera un instante y vuelve a medir: al
     pasar de un botón de la página al siguiente, o mientras uno termina de
     aparecer, el fijo no se cruza con él. */
  if (!fabVer()) f.classList.remove('on');
  else if (!f.classList.contains('on')) fabT = setTimeout(() => { if (fabVer()) f.classList.add('on'); }, 220);
}
addEventListener('scroll', () => {
  $('#hd').classList.toggle('on', scrollY > 40);
  if (!fabRaf) fabRaf = requestAnimationFrame(() => { fabRaf = 0; fab(); });
}, { passive: true });
addEventListener('resize', fab, { passive: true });
/* Una foto diferida que termina de cargar puede correr los botones sin que
   haya scroll: se vuelve a medir. */
document.addEventListener('load', e => {
  if (e.target.tagName === 'IMG' && !fabRaf) fabRaf = requestAnimationFrame(() => { fabRaf = 0; fab(); });
}, true);
document.addEventListener('focusin', fab);
document.addEventListener('focusout', () => setTimeout(fab, 0));

/* Lightbox */
const lbx = $('#lbx');
let lbxVolver = null;
const openLbx = (src, alt, respaldo) => {
  /* Nace con `hidden` y sin src: un <img src=""> dispara un pedido al
     documento actual en varios navegadores. Se puebla al abrirlo. */
  const im = $('#lbxImg');
  im.hidden = false;
  im.onerror = respaldo ? () => { im.onerror = null; im.src = respaldo; } : null;
  im.src = src;
  im.alt = alt || '';
  lbx.classList.add('on');
  document.body.style.overflow = 'hidden';
  lbxVolver = document.activeElement;      /* para devolver el foco al cerrar */
  $('#lbxClose').focus();
};
const closeLbx = () => {
  if (!lbx.classList.contains('on')) return;
  lbx.classList.remove('on');
  document.body.style.overflow = '';
  if (lbxVolver && lbxVolver.focus) lbxVolver.focus();
  lbxVolver = null;
};
$('#lbxClose').onclick = closeLbx;
lbx.onclick = e => { if (e.target === lbx) closeLbx(); };
addEventListener('keydown', e => { if (e.key === 'Escape') { closeLbx(); closeMob(); } });

/* Reveal — una sola vez, sin re-animar al volver a subir */
let io;
function reveals() {
  io && io.disconnect();
  io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '-8% 0px -6% 0px' });
  $$('.rv,.rv-i').forEach(n => io.observe(n));
}

/* ── PARTES REUTILIZABLES ───────────────────────────────────── */
const secHead = (kicker, title, lede, lam) => `
  <div class="sec-head rv">
    ${lam ? `<div class="lam"><span class="no">Lám ${lam} / 11</span><span class="ln2"></span></div>` : ''}
    <span class="mono am">${kicker}</span>
    <h2 class="d2">${title}</h2>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </div>`;

/* Iconografía propia: línea 1.5px, 22×22, un icono por componente */
const ICO = {
  paredes: '<path d="M4 3v18M8.5 3v18M13 3v18M17.5 3v18M21 3v18"/>',
  techo: '<path d="M3 8h18M3 8l2-4h14l2 4M7 8v3M12 8v3M17 8v3"/>',
  luz: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM12 13v2M7 19l1.5-2M17 19l-1.5-2M12 21v-3"/>',
  piso: '<path d="M3 9l9-5 9 5-9 5zM7.5 11.5v4.5M12 14v5M16.5 11.5v4.5M3 9v4l9 5 9-5V9"/>',
  electricidad: '<rect x="5" y="4" width="14" height="16" rx="1"/><path d="M9.5 9v3M14.5 9v3M10 16h4"/>',
  accesorios: '<circle cx="12" cy="10" r="5"/><circle cx="12" cy="10" r="2.2"/><path d="M12 15v4M12 19h5M4 4h3v3"/>'
};
const ico = k => `<svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;

/* Delegado al espacio reservado premium (definido más abajo en el bundle) */
const ph = (label, ratio = '4/3', tone = 'dark') => resv(label, ratio, tone);

/* ── ESQUEMA DE MODELO ────────────────────────────────────────────
   Planta a escala de lo que entra: el vehículo (o los dos) con el
   margen de trabajo alrededor. Deliberadamente SIN cotas en metros:
   las medidas de cada modelo todavía no están confirmadas por el
   taller y no se inventan. Lo que sí es cierto y se ve acá es la
   proporción entre modelos, que es como se elige de verdad. */
/* Siluetas en planta, dibujadas en centímetros (1 unidad = 1 cm) para que la
   escala sea uniforme en los dos ejes. Antes se escalaba x e y por separado
   desde una caja cuadrada y el auto salía estirado: parecía una tecla. */
const SILUETA = {
  /* Auto de 1,80 × 4,40 m visto desde arriba. Capó y baúl más angostos que
     el habitáculo, techo insinuado adentro: sin eso la planta es una pastilla
     redondeada y no se entiende que sea un vehículo. */
  auto: {
    l: 4.4, a: 1.8, n: 'Auto',
    cuerpo: 'M90 6c30 0 52 14 60 42l10 42c6 26 8 58 8 130s-2 104-8 130l-10 42c-8 28-30 42-60 42s-52-14-60-42l-10-42c-6-26-8-58-8-130s2-104 8-130l10-42C38 20 60 6 90 6Z',
    detalle: 'M90 112c30 0 44 6 47 18l5 28c2 14 2 44 0 58l-5 28c-3 12-17 18-47 18s-44-6-47-18l-5-28c-2-14-2-44 0-58l5-28c3-12 17-18 47-18Z'
      + ' M43 150h94 M43 262h94',
    espejos: 'M22 150l-14-7 M158 150l14-7'
  },
  /* Moto de 0,90 × 2,20 m: rueda, cuerpo y manubrio. */
  moto: {
    l: 2.2, a: 0.9, n: 'Moto',
    cuerpo: 'M45 8c9 0 14 9 14 20l-3 44c8 13 12 34 12 60 0 33-9 56-23 64-14-8-23-31-23-64 0-26 4-47 12-60l-3-44C31 17 36 8 45 8Z',
    detalle: 'M45 20v176',
    espejos: 'M8 54h74 M8 54l-2-6 M82 54l2-6'
  }
};

/* Escala única para todos los modelos: 66 px por metro. Así las plantas son
   comparables entre sí — la doble se ve efectivamente más grande que la
   compacta — en vez de que cada una se estire para llenar su caja. */
const PX_M = 66;

function modeloPlan(m, tone = 'dark') {
  if (!m.plan) {
    const W = 330, H = 420;
    return `<svg viewBox="0 0 ${W} ${H}" class="mplan ${tone}" role="img"
      aria-label="Cabina a medida: la planta se define con las medidas de tu local">
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" class="mp-box" stroke-dasharray="7 7"/>
      <text x="${W / 2}" y="${H / 2 - 4}" text-anchor="middle" class="mp-t">SEGÚN TU ESPACIO</text>
      <text x="${W / 2}" y="${H / 2 + 22}" text-anchor="middle" class="mp-s">LA PLANTA SALE DE TUS MEDIDAS</text>
    </svg>`;
  }
  const v = m.plan.map(k => SILUETA[k]);
  /* Medidas de la caja: los vehículos más el margen entre ellos y las paredes. */
  const anchoTot = v.reduce((a, x) => a + x.a, 0) + m.holgura * (v.length + 1);
  const largoTot = Math.max(...v.map(x => x.l)) + m.holgura * 2;
  const sc = PX_M;
  const bw = anchoTot * sc, bl = largoTot * sc;
  const padX = 54, padT = 44, padB = 40;
  const W = Math.round(bw + padX * 2), H = Math.round(bl + padT + padB);
  const x0 = padX, y0 = padT;

  let x = x0 + m.holgura * sc;
  /* Escala única para los dos ejes: sc px por metro ÷ 100 cm por metro. */
  const k = sc / 100;
  const shapes = v.map(s => {
    const w = s.a * sc, l = s.l * sc;
    const cy = y0 + (bl - l) / 2;
    const g = `<g transform="translate(${x.toFixed(1)} ${cy.toFixed(1)}) scale(${k.toFixed(4)})">
        <path d="${s.cuerpo}" class="mp-veh"/>
        <path d="${s.detalle}" class="mp-det"/>
        <path d="${s.espejos}" class="mp-det"/></g>`;
    x += w + m.holgura * sc;
    return g;
  }).join('');

  /* El margen de trabajo va como línea de puntos ámbar: es el argumento del
     modelo (cuánto lugar queda alrededor) y en el lenguaje de plano del sitio
     una cota punteada se lee mejor que una franja rellena. */
  const g = m.holgura * sc;
  const margen = g > 5 ? `<rect x="${x0 + g}" y="${y0 + g}" width="${bw - g * 2}" height="${bl - g * 2}"
      class="mp-gap"/>
    <text x="${x0 + g / 2}" y="${y0 + bl / 2}" text-anchor="middle" class="mp-g"
      transform="rotate(-90 ${x0 + g / 2} ${y0 + bl / 2})">MARGEN DE TRABAJO</text>` : '';

  return `<svg viewBox="0 0 ${W} ${H}" class="mplan ${tone}" role="img"
    aria-label="Planta a escala de la ${m.n.toLowerCase()}: ${m.veh.toLowerCase()} con el margen de trabajo alrededor">
    <rect x="${x0}" y="${y0}" width="${bw}" height="${bl}" class="mp-box"/>
    ${margen}
    ${shapes}
    <text x="${x0 + bw / 2}" y="${y0 - 16}" text-anchor="middle" class="mp-s">${m.veh.toUpperCase()}</text>
    <text x="${W / 2}" y="${H - 14}" text-anchor="middle" class="mp-s">ESQUEMA DE REFERENCIA · MEDIDAS SEGÚN TU LOCAL</text>
  </svg>`;
}

const dec = n => n.toFixed(2).replace('.', ',');
function faqBlock(keys) {
  return `<div class="faq rv">${keys.map(k => {
    const q = DATA.faq[k]; if (!q) return '';
    return `<div class="fq"><button type="button">${q[0]}</button><div class="a"><p>${q[1]}</p></div></div>`;
  }).join('')}</div>`;
}

function bindFaq(root) {
  $$('.fq button', root).forEach(b => b.onclick = () => {
    const fq = b.parentElement, a = $('.a', fq), open = fq.classList.contains('on');
    $$('.fq', root).forEach(o => { o.classList.remove('on'); $('.a', o).style.maxHeight = 0; });
    if (!open) { fq.classList.add('on'); a.style.maxHeight = a.scrollHeight + 'px'; }
  });
}

/* ── VISTA: HOME ────────────────────────────────────────────── */

function bindIso(root) {
  const iso = $('#iso', root); if (!iso) return;
  $$('.stroke', iso).forEach((el, i) => {
    const L = el.getTotalLength();
    el.style.setProperty('--len', L);
    el.style.transitionDelay = (i * 55) + 'ms';
  });
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { iso.classList.add('drawn'); o.disconnect(); }
  }), { rootMargin: '-15% 0px' }).observe(iso);

  const sel = i => {
    $$('.sys-item', root).forEach(n => n.classList.toggle('on', +n.dataset.i === i));
    $$('.hot', iso).forEach(n => n.classList.toggle('on', +n.dataset.i === i));
  };
  $$('.sys-item', root).forEach(n => {
    n.onclick = () => sel(+n.dataset.i);
    n.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(+n.dataset.i); } };
  });
  $$('.hot', iso).forEach(n => {
    n.onclick = () => sel(+n.dataset.i);
    n.onfocus = () => sel(+n.dataset.i);
  });
}

/* ── COMPARADOR ─────────────────────────────────────────────── */
function bindCmp(root) {
  const c = $('#cmp', root); if (!c) return;
  const set = pct => {
    pct = Math.max(2, Math.min(98, pct));
    c.style.setProperty('--x', pct + '%');
    c.setAttribute('aria-valuenow', Math.round(pct));
  };
  const move = e => {
    const r = c.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    set(x / r.width * 100);
  };
  let on = false;
  c.addEventListener('pointerdown', e => { on = true; c.setPointerCapture(e.pointerId); move(e); });
  c.addEventListener('pointermove', e => { if (on) move(e); });
  c.addEventListener('pointerup', () => on = false);
  c.addEventListener('pointercancel', () => on = false);
  c.addEventListener('keydown', e => {
    const cur = parseFloat(getComputedStyle(c).getPropertyValue('--x')) || 50;
    if (e.key === 'ArrowLeft') { set(cur - 4); e.preventDefault(); }
    if (e.key === 'ArrowRight') { set(cur + 4); e.preventDefault(); }
  });
  /* invitación a arrastrar, una sola vez */
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return; o.disconnect();
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    let t = 0; const seq = [50, 62, 50];
    const step = () => { if (t < seq.length) { set(seq[t++]); setTimeout(step, 520); } };
    setTimeout(step, 600);
  }), { rootMargin: '-20% 0px' }).observe(c);
}

/* ── MEDIDAS ────────────────────────────────────────────────────
   Las frecuentes son las que mencionó RM, para arrancar la consulta;
   «Otra» abre un campo para pedir la propia. La planta dibuja la medida
   elegida a escala con lo que tiene que entrar: el modelo elegido o, si
   no hay, un auto de referencia. No es un plano de fabricación: qué
   combinación se fabrica, el alto y la medida interior los confirma RM.
   Las medidas del local del visitante son aparte y opcionales.
   autocomplete="off": la vista se dibuja antes de que termine la carga y,
   al recargar, Chrome restauraba valores en los campos sin que pasaran por
   CTX — se veían en pantalla pero no viajaban en el mensaje. */
function fitBlock() {
  const M = DATA.medidas;
  const grupo = (k, lb, vals) => {
    const otra = CTX[k] && !vals.includes(CTX[k]);
    return `
    <fieldset class="chips">
      <legend>${lb}</legend><div class="chips-l">
      ${[...vals, 'otra'].map(v => `
        <label class="chip"><input type="radio" name="${k}" value="${v}" autocomplete="off"${(v === 'otra' ? otra : CTX[k] === v) ? ' checked' : ''}><span>${v === 'otra' ? 'Otra' : v + ' m'}</span></label>`).join('')}
      <span class="chip-otra"${otra ? '' : ' hidden'}><input type="text" inputmode="decimal" data-m="${k}" placeholder="0,00"
        autocomplete="off" aria-label="${lb}: otra medida, en metros" value="${otra ? esc(CTX[k]) : ''}"><span aria-hidden="true">m</span></span>
    </div></fieldset>`;
  };
  return `
  <div class="med rv" id="medir">
    <h3 class="d3">¿Qué medida necesitás?</h3>
    <p class="med-i">Las que más se piden, para arrancar la consulta. Si necesitás otra, tocá «Otra» y cargala.</p>
    <div class="med-gs">${grupo('mA', 'Ancho', M.ancho)}${grupo('mL', 'Largo', M.largo)}</div>
    <div class="plan" id="planWrap">${cabinaPlan()}</div>
    <p class="med-v" id="verdict" aria-live="polite"></p>
    <p class="mono med-alto">Esquema de referencia, no un plano de fabricación. Qué combinaciones se fabrican, el alto y la medida interior te los confirmamos por WhatsApp.</p>
    <details class="med-local"${CTX.ancho ? ' open' : ''}>
      <summary>Sumar las medidas de tu local <span>opcional</span></summary>
      <div class="fit-in">
        ${[['ancho', 'Ancho'], ['largo', 'Largo'], ['alto', 'Alto libre']].map(f => `
          <div class="f-fld"><label for="f-${f[0]}">${f[1]} (m)</label>
            <input id="f-${f[0]}" data-f="${f[0]}" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off" value="${esc(CTX[f[0]])}"></div>`).join('')}
      </div>
      <p class="mono med-alto">Alto libre: hasta lo más bajo que haya (viga, caño o luminaria).</p>
    </details>
    <div class="med-cta">
      ${btnWA('Consultar por WhatsApp', { lb: 'med' })}
      <a class="txt-l" id="fitGo" href="/presupuesto" data-quote-ctx>Armar presupuesto paso a paso</a>
    </div>
  </div>`;
}

/* Lo que entra, según el modelo elegido. Sin modelo (o «A medida»), un
   auto de referencia: es lo que la mayoría tiene que meter adentro. */
const queEntra = () => {
  const m = DATA.modelos.find(x => x.n === CTX.modelo);
  return m && m.plan ? m.plan : ['auto'];
};
const DESC_VEH = {
  auto: ['un auto mediano de referencia', 'dos autos medianos de referencia'],
  moto: ['una moto de referencia', 'dos motos de referencia']
};
/* Luz mínima de 30 cm entre vehículos y paredes en el esquema: sin ella,
   «entra» podría ser cierto por un par de centímetros. */
const LUZ = 0.3;

/* Planta de la cabina a escala, con el largo en horizontal (las cabinas
   son más largas que anchas y la caja es apaisada) y cotas como en un
   plano. Devuelve el SVG; `planFit` guarda si entra, para el texto. */
let planFit = null;
function cabinaPlan() {
  const W = parseFloat(String(CTX.mA).replace(',', '.')) || 0;
  const L = parseFloat(String(CTX.mL).replace(',', '.')) || 0;
  /* En el celular la caja es más chica en unidades: así las cotas y los
     textos no quedan diminutos al escalar el SVG a 320 px. */
  const chico = matchMedia('(max-width:599px)').matches;
  const vw = chico ? 420 : 640, vh = chico ? 290 : 360, pad = chico ? 48 : 58;
  planFit = null;
  if (!W || !L) return `<svg viewBox="0 0 ${vw} ${vh}" class="mplan dark" role="img" aria-label="Elegí ancho y largo para ver la planta a escala">
    <rect x="${pad}" y="${pad}" width="${vw - pad * 2}" height="${vh - pad * 2}" class="mp-box" stroke-dasharray="7 7"/>
    <text x="${vw / 2}" y="${vh / 2 - 4}" text-anchor="middle" class="mp-t">ELEGÍ ANCHO Y LARGO</text>
    <text x="${vw / 2}" y="${vh / 2 + 20}" text-anchor="middle" class="mp-s">LA PLANTA SE DIBUJA A ESCALA</text></svg>`;
  const sc = Math.min((vw - pad * 2) / L, (vh - pad * 2) / W);
  const bw = L * sc, bh = W * sc, x0 = (vw - bw) / 2, y0 = (vh - bh) / 2;
  const tipos = queEntra(), s = SILUETA[tipos[0]], n = tipos.length;
  /* Uno al lado del otro a lo ancho si entran; si no, en fila a lo largo. */
  let pos = null;
  if (n * s.a + (n + 1) * LUZ <= W && s.l + 2 * LUZ <= L) {
    const g = (W - n * s.a) / (n + 1);
    pos = tipos.map((t, i) => [L / 2, g * (i + 1) + s.a * (i + .5)]);
  } else if (s.a + 2 * LUZ <= W && n * s.l + (n + 1) * LUZ <= L) {
    const g = (L - n * s.l) / (n + 1);
    pos = tipos.map((t, i) => [g * (i + 1) + s.l * (i + .5), W / 2]);
  }
  planFit = { ok: !!pos, desc: DESC_VEH[tipos[0]][n - 1], W: CTX.mA, L: CTX.mL, s };
  const k = sc / 100;
  const veh = pos ? pos.map(([px, py]) => `<g transform="translate(${(x0 + px * sc).toFixed(1)} ${(y0 + py * sc).toFixed(1)}) rotate(-90) scale(${k.toFixed(4)}) translate(${-s.a * 50} ${-s.l * 50})">
      <path d="${s.cuerpo}" class="mp-veh"/><path d="${s.detalle}" class="mp-det"/><path d="${s.espejos}" class="mp-det"/></g>`).join('') : '';
  /* Cotas: línea con topes en los extremos y la medida al medio. */
  const cy = y0 - 24, cx = x0 - 24;
  return `<svg viewBox="0 0 ${vw} ${vh}" class="mplan dark" role="img"
    aria-label="Planta a escala de ${CTX.mA} por ${CTX.mL} metros${pos ? ' con ' + planFit.desc : ''}">
    <path d="M${x0} ${cy}H${x0 + bw}M${x0} ${cy - 5}v10M${x0 + bw} ${cy - 5}v10M${cx} ${y0}V${y0 + bh}M${cx - 5} ${y0}h10M${cx - 5} ${y0 + bh}h10" class="mp-cota"/>
    <text x="${x0 + bw / 2}" y="${cy - 9}" text-anchor="middle" class="mp-c">${CTX.mL} M</text>
    <text x="${cx - 9}" y="${y0 + bh / 2}" text-anchor="middle" class="mp-c" transform="rotate(-90 ${cx - 9} ${y0 + bh / 2})">${CTX.mA} M</text>
    <rect x="${x0}" y="${y0}" width="${bw}" height="${bh}" class="mp-cab"/>
    <rect x="${x0 + 4}" y="${y0 + 4}" width="${Math.max(bw - 8, 0)}" height="${Math.max(bh - 8, 0)}" class="mp-in"/>
    ${veh}
    ${pos ? '' : `<text x="${vw / 2}" y="${vh / 2 + 4}" text-anchor="middle" class="mp-no">NO ENTRA A ESCALA</text>`}
  </svg>`;
}

function dibujarPlan() {
  const wrap = $('#planWrap'), vd = $('#verdict');
  if (!wrap) return;
  wrap.innerHTML = cabinaPlan();
  if (!vd) return;
  const f = planFit;
  if (!f) { vd.textContent = ''; vd.classList.remove('warn'); return; }
  const med = `${f.W} × ${f.L} m`, dim = `(${dec(f.s.l)} × ${dec(f.s.a)} m)`;
  const dos = f.desc.startsWith('dos');
  vd.classList.toggle('warn', !f.ok);
  vd.textContent = f.ok
    ? `En el esquema, ${f.desc} ${dim} ${dos ? 'entran' : 'entra'} en una planta de ${med}.`
    : `En el esquema, ${f.desc} ${dim} no ${dos ? 'entran' : 'entra'} en una planta de ${med}. Probá otra medida o pedí una a medida.`;
}

/* Las medidas del local: opcionales, viajan en el mensaje como MI LOCAL. */
function bindFit(root) {
  if (!$('#planWrap', root)) return;
  const num = s => { const n = parseFloat(String(s).replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
  $$('[data-f="ancho"],[data-f="largo"],[data-f="alto"]', root).forEach(i => i.oninput = () => {
    CTX[i.dataset.f] = num(i.value) ? dec(num(i.value)) : '';
    refreshWA();
  });
  dibujarPlan();
}

/* ── VISTA: RUBRO ───────────────────────────────────────────── */
function viewRubro(slug) {
  const r = DATA.rubros.find(x => x.slug === slug); if (!r) return view404();
  meta({
    u: urlRubro(r),
    t: `${r.h1} | Cabinas Desarmables RM`,
    ogt: `${r.h1} — ${r.claim}`,
    d: r.seoD,
    img: r.foto ? `/img/${r.foto}-${IMG[r.foto].ws[IMG[r.foto].ws.length - 1]}.jpg` : '/img/og.jpg'
  });
  return `
  <section style="padding-top:calc(var(--head) + clamp(30px,6vh,70px))">
    <div class="wrap">
      <nav class="crumb rv" aria-label="Migas"><a href="/">Inicio</a><span>/</span><b>${r.n}</b></nav>
      <span class="mono am rv">${r.h1}</span>
      <h1 class="d1 rv" data-d="1" style="margin-top:14px;max-width:14ch">${r.claim}</h1>
      <p class="lede rv" data-d="2" style="margin-top:20px">${r.sol}</p>
      <div class="hero-cta rv" data-d="3">
        <button class="btn btn-p" data-goquote="${r.n}"><span>Consultar para mi ${r.n.toLowerCase().replace(/s$/, '')}</span></button>
        <a class="btn btn-g" href="/#sistema">Comparar los packs</a>
      </div>
    </div>
  </section>

  <section class="sec sec-tight">
    <div class="wrap">
      <div class="sys">
        <div class="rv-i">${fotoRubro(r, true)}</div>
        <div class="rv">
          <span class="mono am">El problema</span>
          <p style="margin:12px 0 26px;color:#CFD1C9;font-size:17px">${r.prob}</p>
          <hr class="rule">
          <div style="margin-top:22px;display:flex;flex-direction:column;gap:0">
            ${r.pts.map(p => `<div style="display:grid;grid-template-columns:14px 1fr;gap:13px;padding:13px 0;border-bottom:1px solid var(--line-2);font-size:15px;color:#CFD1C9">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFC800" stroke-width="2.2" style="margin-top:5px"><path d="M4 12.5 9.5 18 20 6.5"/></svg><span>${p}</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${secHead('Trabajos', 'Cabinas entregadas',
      'Son cabinas de RM funcionando. No decimos en qué tipo de negocio está cada una porque no nos consta: lo que sí se ve es cómo están terminadas.')}
      <div class="edit rv">
        ${['negraFrente', 'blanca', 'moto'].map((k, i) =>
        figura(k, { cls: ['e-a', 'e-b', 'e-c'][i], sizes: '(min-width:760px) 32vw, 92vw' })).join('')}
      </div>
      <p style="margin-top:22px"><a class="btn-t" href="/trabajos">Ver todas las cabinas entregadas</a></p>
    </div>
  </section>

  <section class="sec" style="background:var(--ink-2);border-block:1px solid var(--line)">
    <div class="wrap">
      ${secHead('Preguntas', `Lo que pregunta un ${r.n.toLowerCase().replace(/s$/, '')}`)}
      ${faqBlock(r.faq)}
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${secHead('Configurá tu cabina', 'Ya sabemos que sos ' + r.n.toLowerCase(), 'Empezamos con tu rubro cargado. Te quedan cuatro pasos.')}
      <div id="quoteMount"></div>
    </div>
  </section>`;
}

/* ── VISTA: MODELOS / MODELO ────────────────────────────────── */

/* Lo que se puede decir de cualquier cabina, sea cual sea el modelo: sale de
   las especificaciones confirmadas de los packs. Piso e iluminación dependen
   del pack, y ningún dato dice qué pack va con qué modelo, así que se remite
   a la comparación sin cruzarlos. El techo no figura en las especificaciones:
   va "a confirmar", sin afirmarlo ni descartarlo. */
const fichaComun = () => [
  ['Estructura', '100% desarmable'],
  ['Revestimiento', 'Chapa trapezoidal, color a elección'],
  ['Piso e iluminación', 'Según el pack · <a class="btn-t" href="/#sistema">Ver los packs</a>'],
  ['Techo', TBD()]
];

function viewModelo(slug) {
  const m = DATA.modelos.find(x => x.slug === slug); if (!m) return view404();
  meta({
    u: urlModelo(m),
    t: `${m.n} | Cabinas Desarmables RM`,
    d: `${m.n}: ${m.qe} Cabina desarmable con revestimiento en chapa trapezoidal, color a elección. Sin obra civil.`
  });
  return `
  <section style="padding-top:calc(var(--head) + clamp(30px,6vh,64px))">
    <div class="wrap">
      <nav class="crumb rv" aria-label="Migas"><a href="/">Inicio</a><span>/</span><a href="/modelos">Modelos</a><span>/</span><b>${m.n}</b></nav>
      <div class="sys" style="align-items:start">
        <div class="rv-i">${modeloPlan(m)}</div>
        <div class="rv">
          <h1 class="d2">${m.n}</h1>
          <p class="lede" style="margin-top:14px">${m.qe}</p>

          <h2 class="mono am" style="margin:30px 0 10px">Ficha</h2>
          <dl style="display:grid;grid-template-columns:auto 1fr;gap:11px 20px;border-top:1px solid var(--line-2);padding-top:14px">
            ${[['Entra', m.veh], ...fichaComun(), ['Medidas', 'Se define con las de tu local']]
      .map(f => `<dt class="mono" style="padding-top:2px">${f[0]}</dt><dd>${f[1]}</dd>`).join('')}
          </dl>

          <p class="quiet" style="margin-top:30px">Qué trae la cabina lo definen los packs Box, Studio y Studio Pro; qué pack corresponde a este modelo lo vemos en la consulta. <a class="btn-t" href="/#sistema">Ver los packs</a></p>

          <div class="hero-cta" style="margin-top:32px">
            <button class="btn btn-p" data-goquotemodel="${m.slug}"><span>Consultar por este modelo</span></button>
            <a class="btn btn-g" href="/#medir">¿Me entra en el espacio?</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="sec"><div class="wrap">
    ${secHead('Preguntas', 'Sobre este modelo')}
    ${faqBlock(['entra', 'techo', 'precio', 'envio'])}
  </div></section>`;
}

function viewTrabajos() {
  meta({
    u: '/trabajos',
    t: 'Cabinas entregadas | Cabinas Desarmables RM',
    d: 'Fotos de cabinas desarmables RM, publicadas en nuestro Instagram, en terminación negra y blanca.'
  });
  const cls = ['e-a', 'e-b', 'e-c', 'e-d', 'e-e'];
  return `<section class="sec" style="padding-top:calc(var(--head) + clamp(34px,6vh,76px))">
    <div class="wrap">
      <div class="sec-head rv">
        <nav class="crumb" aria-label="Migas"><a href="/">Inicio</a><span>/</span><b>Trabajos</b></nav>
        <span class="mono am">Trabajos</span>
        <h1 class="d1" style="font-size:clamp(34px,6vw,72px)">Cabinas entregadas</h1>
        <p class="lede">Cabinas de RM, publicadas en nuestro Instagram. No atribuimos rubro ni modelo donde no consta.</p>
      </div>
      <div class="edit rv">
        ${DATA.trabajos.map((t, i) => figura(t.img, {
      cls: cls[i], cap: t.cap, alt: t.alt,
      sizes: '(min-width:760px) 34vw, 92vw'
    })).join('')}
        <figure class="e-f ig-card"><a href="${IG}" target="_blank" rel="noopener"><span class="mono am">Instagram</span>
          <b class="d4">Más cabinas, en nuestro Instagram</b><span class="btn-t">@cabinasdesarmablesrm →</span></a></figure>
      </div>
      <div class="hero-cta" style="margin-top:30px">
        <button class="btn btn-p" data-goquote=""><span>Quiero una así</span></button>
        <a class="btn btn-g" href="${IG}" target="_blank" rel="noopener">Ver más en Instagram</a>
      </div>
    </div>
  </section>`;
}

const view404 = () => `<section class="sec" style="padding-top:calc(var(--head) + 100px);min-height:70vh">
  <div class="wrap"><h1 class="d2">Esa página no existe</h1>
  <p style="margin-top:14px">Probá desde el inicio o escribinos y te decimos qué necesitás.</p>
  <div class="hero-cta"><a class="btn btn-p" href="/"><span>Volver al inicio</span></a></div></div></section>`;

/* ══════════════════════════════════════════════════════════════
   COTIZADOR — 5 pasos. Sin teclado hasta el paso 3.
   ══════════════════════════════════════════════════════════════ */
const Q = {
  i: 0,
  d: { rubro: '', vehiculo: '', ancho: '', largo: '', alto: '', pack: '', medida: '', nombre: '', tel: '', loc: '', msg: '', modelo: '' },
  steps: [
    { k: 'Paso 1 de 5', q: '¿Qué tenés?', f: 'rubro', o: ['Detailing', 'Lavadero', 'Lubricentro', 'Concesionaria', 'Cochera particular', 'Voy a abrir un negocio'] },
    { k: 'Paso 2 de 5', q: '¿Qué necesitás que entre?', f: 'vehiculo', o: ['Una moto', 'Un auto', 'Un auto con lugar para trabajar alrededor', 'Dos autos', 'Una camioneta', 'Todavía no sé'] },
    { k: 'Paso 3 de 5', q: '¿Cuánto espacio tenés?', f: 'medidas' },
    { k: 'Paso 4 de 5 · opcional', q: '¿Qué pack te interesa?', f: 'pref' },
    { k: 'Paso 5 de 5', q: '¿Con quién hablamos?', f: 'contacto' }
  ]
};



function quoteMsg() {
  const d = Q.d, L = [];
  L.push('Hola RM, quiero cotizar una cabina.', '');
  L.push('▸ RUBRO: ' + (d.rubro || 'sin especificar'));
  L.push('▸ NECESITO QUE ENTRE: ' + (d.vehiculo || 'sin especificar'));
  const mod = d.modelo;
  if (mod) L.push('▸ MODELO DE INTERÉS: ' + mod);
  if (d.pack) L.push('▸ PACK: ' + d.pack);          // sólo si se eligió en la home
  if (d.medida) L.push('▸ MEDIDA: ' + d.medida);    // ídem
  L.push('▸ MI ESPACIO: ' + (d.ancho && d.largo
    ? `${d.ancho} ancho × ${d.largo} largo${d.alto ? ` × ${d.alto} alto libre` : ''} (m)`
    : 'todavía no lo medí'));
  L.push('▸ LOCALIDAD: ' + d.loc);
  L.push('▸ NOMBRE: ' + d.nombre);
  /* El teléfono va escrito aunque WhatsApp ya identifique a quien manda:
     si la persona copia el mensaje y lo envía desde otro número, RM
     igual se queda con el de contacto. */
  if (d.tel) L.push('▸ TELÉFONO: ' + d.tel);
  if (d.msg.trim()) L.push('', 'Comentario: ' + d.msg.trim());
  L.push('', '—', 'Consulta desde ' + SITE.replace(/^https?:\/\//, ''));
  L.push('Ref: ' + refCode());
  return L.join('\n');
}
function refCode() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const r = (Q.d.rubro || 'GEN').slice(0, 2).toUpperCase();
  return `${r}-${p(d.getDate())}${p(d.getMonth() + 1)}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function quoteSummary() {
  const d = Q.d;
  /* Un solo texto para la vista previa, el enlace y el registro: así la
     referencia no cambia si el minuto pasa entre una cosa y la otra. */
  Q.msg = quoteMsg();
  const rows = [['Rubro', d.rubro], ['Entra', d.vehiculo],
  ['Modelo', d.modelo], ['Pack', d.pack], ['Medida', d.medida],
  ['Espacio', d.ancho && d.largo ? `${d.ancho} × ${d.largo}${d.alto ? ` × ${d.alto}` : ''} m` : 'Sin medir'],
  ['Localidad', d.loc], ['Nombre', d.nombre]]
    .filter(r => r[1]);
  return `
    <span class="q-k">Revisá antes de enviar</span>
    <h3 class="q-q">Esto le va a llegar a RM</h3>
    <div class="proj" style="margin-bottom:16px">
      <div class="proj-h"><b>Tu proyecto RM</b><span class="mono">Listo para enviar</span></div>
      <dl>${rows.map(r => `<div class="row"><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>
    </div>
    <div class="q-prev" id="qPrev">${Q.msg.replace(/</g, '&lt;')}</div>
    <div class="q-nav">
      <button class="btn btn-g" data-nav="-1">Corregir</button><span class="sp"></span>
      <button class="btn btn-t" id="qCopy" style="margin-right:8px">Copiar mensaje</button>
      <a class="btn btn-p" id="qSend" href="${wa(Q.msg)}" target="_blank" rel="noopener">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.3L3 20.5l1.8-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>
        <span>Enviar por WhatsApp</span></a>
    </div>`;
}
/* Abrir WhatsApp no es enviar: el mensaje queda escrito y falta que la
   persona toque enviar allá. La pantalla lo dice así, sin dar por hecho
   que a RM ya le llegó. */
function quoteDone() {
  return `<div class="q-done">
    <div class="ic">${IC_WA.replace('width="18" height="18"', 'width="26" height="26"')}</div>
    <h3 class="d3">Falta enviarlo en WhatsApp</h3>
    <p style="margin:12px auto 0">Abrimos WhatsApp con tu consulta escrita. Para que nos llegue, tocá enviar ahí. Si no se abrió, probá de nuevo o escribinos al ${TEL_HUMAN}.</p>
    <div class="hero-cta" style="justify-content:center;margin-top:24px">
      <a class="btn btn-p" href="${wa(Q.msg || quoteMsg())}" target="_blank" rel="noopener"><span>Abrir WhatsApp de nuevo</span></a>
      <button class="btn btn-t" id="qReset" style="margin-left:8px">Hacer otra consulta</button>
    </div></div>`;
}

function mountQuote(root, prefill) {
  const mnt = $('#quoteMount', root); if (!mnt) return;
  if (prefill) Object.assign(Q.d, prefill);
  const draw = () => {
    mnt.innerHTML = quoteHTML();
    const s = Q.steps[Q.i] || {};
    $$('[data-pick]', mnt).forEach(b => b.onclick = () => { Q.d[s.f] = b.dataset.pick; Q.i++; draw(); });
    $$('[data-pref]', mnt).forEach(b => b.onclick = () => {
      Q.d[b.dataset.pref] = Q.d[b.dataset.pref] === b.dataset.v ? '' : b.dataset.v; draw();
    });
    $$('[data-q]', mnt).forEach(i => i.oninput = () => {
      Q.d[i.dataset.q] = i.value;
      const fl = i.closest('.fl'); fl && fl.classList.remove('bad');
    });
    $$('[data-back]', mnt).forEach(b => b.onclick = () => { Q.i = +b.dataset.back; draw(); });
    $$('[data-nav]', mnt).forEach(b => b.onclick = () => {
      const dir = +b.dataset.nav;
      if (dir > 0 && Q.i === 4 && !validate(mnt)) return;
      Q.i = Math.max(0, Math.min(5, Q.i + dir));
      draw();
      mnt.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    /* El envío es un enlace real a wa.me, no un window.open: los navegadores
       internos (Instagram) lo abren sin tratarlo como ventana emergente.
       La pantalla cambia después del clic para no sacar el enlace del
       documento mientras el navegador lo sigue. */
    const send = $('#qSend', mnt);
    if (send) send.onclick = () => {
      pushLead(Q.d, Q.msg);
      setTimeout(() => {
        Q.i = 6; draw();
        const rs = $('#qReset', mnt);
        if (rs) rs.onclick = () => { Q.i = 0; Q.d = { ...Q.d, nombre: '', tel: '', msg: '' }; draw(); };
      }, 0);
    };
    const cp = $('#qCopy', mnt);
    if (cp) cp.onclick = async () => {
      try { await navigator.clipboard.writeText(quoteMsg()); cp.textContent = 'Copiado'; }
      catch { const t = $('#qPrev', mnt); const r = document.createRange(); r.selectNode(t); getSelection().removeAllRanges(); getSelection().addRange(r); cp.textContent = 'Seleccionado, copiá con Ctrl+C'; }
      setTimeout(() => cp.textContent = 'Copiar mensaje', 2400);
    };
    const rs = $('#qReset', mnt);
    if (rs) rs.onclick = () => { Q.i = 0; draw(); };
  };
  draw();
}
function validate(mnt) {
  let ok = true;
  [['nombre', 2], ['tel', 6], ['loc', 2]].forEach(([f, min]) => {
    const fl = $(`[data-fl="${f}"]`, mnt); if (!fl) return;
    const v = String(Q.d[f] || '').replace(/[^\wÁÉÍÓÚÑáéíóúñ\s]/g, '').trim();
    const bad = f === 'tel' ? String(Q.d.tel || '').replace(/\D/g, '').length < min : v.length < min;
    fl.classList.toggle('bad', bad); if (bad) ok = false;
  });
  if (!ok) $('.fl.bad', mnt).scrollIntoView({ block: 'center', behavior: 'smooth' });
  return ok;
}

/* ══════════════════════════════════════════════════════════════
   PANEL DE CONSULTAS — el sistema que más le sirve a RM hoy.
   Cada consulta de la web queda registrada con su contexto.
   Estado en memoria para la demo; en producción, Supabase.
   ══════════════════════════════════════════════════════════════ */
const STATES = [
  { k: 'nueva', n: 'Nueva', c: '#FFC800' },
  { k: 'contactada', n: 'Contactada', c: '#7FB2FF' },
  { k: 'presupuestada', n: 'Presupuestada', c: '#C39BFF' },
  { k: 'negociacion', n: 'En negociación', c: '#FFA733' },
  { k: 'vendida', n: 'Vendida', c: '#7BD88F' },
  { k: 'perdida', n: 'Perdida', c: '#6B6F75' }
];
/* Las consultas viven en el navegador de quien usa el panel. No es una base
   compartida — para eso hace falta backend — pero sí es memoria real: lo que
   RM mueva de columna sigue ahí mañana, y las consultas que entran por el
   cotizador quedan guardadas en vez de perderse al recargar. Es la diferencia
   entre una maqueta y una herramienta que ya se puede usar. */
const LS = 'rm.leads.v1';

/* Ejemplos de arranque: se distinguen a simple vista y se pueden borrar
   de a uno desde el panel. Sólo aparecen la primera vez. */
const LEADS_DEMO = [
  { id: 1, nombre: 'Ejemplo · Mariano', rubro: 'Detailing', loc: 'Funes, Santa Fe', med: '4,20 × 7,00 × 3,10', veh: 'Un auto con lugar para trabajar alrededor', st: 'negociacion', ts: 6, ref: 'DE-0309-1112', demo: 1 },
  { id: 2, nombre: 'Ejemplo · Lucía', rubro: 'Concesionaria', loc: 'Rosario, Santa Fe', med: '6,00 × 9,00 × 3,60', veh: 'Dos autos', st: 'presupuestada', ts: 4, ref: 'CO-0509-0940', demo: 1 },
  { id: 3, nombre: 'Ejemplo · Damián', rubro: 'Lavadero', loc: 'San Nicolás, Buenos Aires', med: 'Sin medir', veh: 'Un auto', st: 'contactada', ts: 2, ref: 'LA-0709-1830', demo: 1 },
  { id: 4, nombre: 'Ejemplo · Emiliano', rubro: 'Detailing', loc: 'Córdoba Capital', med: '3,80 × 6,50 × 2,90', veh: 'Un auto', st: 'nueva', ts: 1, ref: 'DE-0809-2105', demo: 1 },
  { id: 5, nombre: 'Ejemplo · Sofía', rubro: 'Voy a abrir un negocio', loc: 'Paraná, Entre Ríos', med: 'Sin medir', veh: 'Todavía no sé', st: 'nueva', ts: 0, ref: 'VO-0909-0812', demo: 1 },
  { id: 6, nombre: 'Ejemplo · Taller Pérez', rubro: 'Lubricentro', loc: 'Casilda, Santa Fe', med: '5,00 × 8,00 × 3,20', veh: 'Una camioneta', st: 'vendida', ts: 21, ref: 'LU-1908-1540', demo: 1 }
];

/* `ts` en los ejemplos son días de antigüedad; en las consultas reales es la
   fecha de alta. Se normaliza a milisegundos al cargar. */
const DIA = 86400000;
function leerLeads() {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* modo privado o storage bloqueado: seguimos en memoria */ }
  return LEADS_DEMO.map(l => ({ ...l, ts: Date.now() - l.ts * DIA }));
}
let LEADS = leerLeads();
function guardarLeads() {
  try { localStorage.setItem(LS, JSON.stringify(LEADS)); } catch (e) { }
}
const diasDe = l => Math.max(0, Math.floor((Date.now() - l.ts) / DIA));

let JUST_NEW = null;
function pushLead(d, txt) {
  JUST_NEW = Date.now();
  LEADS.unshift({
    id: JUST_NEW, nombre: d.nombre || 'Sin nombre', rubro: d.rubro || '—',
    loc: d.loc || '—', veh: d.vehiculo || '—',
    med: d.ancho && d.largo ? `${d.ancho} × ${d.largo}${d.alto ? ` × ${d.alto}` : ''}` : 'Sin medir',
    st: 'nueva', ts: Date.now(), ref: refCode(), tel: d.tel, msg: txt,
    modelo: d.modelo
  });
  guardarLeads();
}


function bindPanel(root) {
  const board = $('#board', root); if (!board) return;
  const render = () => {
    STATES.forEach(s => {
      const body = $(`[data-body="${s.k}"]`, board);
      const items = LEADS.filter(l => l.st === s.k);
      $(`[data-c="${s.k}"]`, board).textContent = items.length;
      body.innerHTML = items.map(l => {
        const i = STATES.findIndex(x => x.k === l.st);
        const d = diasDe(l);
        const viejo = l.st === 'nueva' && d >= 1;
        return `<div class="lead${l.id === JUST_NEW ? ' new' : ''}${l.demo ? ' demo' : ''}${viejo ? ' late' : ''}"
            draggable="true" data-id="${l.id}" style="margin-bottom:9px">
          <b>${l.nombre}</b>
          <div class="meta">${l.rubro} · ${l.loc}<br>${l.veh}${l.modelo ? ' → ' + l.modelo : ''}<br>Espacio: ${l.med}<br>Ref ${l.ref} · ${d === 0 ? 'hoy' : 'hace ' + d + ' d'}</div>
          <span class="tag">${l.med === 'Sin medir' ? 'Falta medir' : 'Cotizable'}</span>
          ${l.demo ? '<span class="tag">Ejemplo</span>' : ''}
          <div class="lead-acts">
            ${i > 0 ? `<button data-mv="${l.id}|-1" aria-label="Retroceder de estado">←</button>` : ''}
            ${i < STATES.length - 1 ? `<button data-mv="${l.id}|1">Avanzar</button>` : ''}
            ${l.tel ? `<button data-wa="${l.id}">WhatsApp</button>` : ''}
            <button data-del="${l.id}" aria-label="Borrar consulta">Borrar</button>
          </div></div>`;
      }).join('') || `<p class="mono" style="opacity:.45;padding:8px 2px">Vacío</p>`;
    });
    const viejo = $('#panelKpis', root);
    if (viejo) viejo.replaceWith(panelResumen());
    bindCards();
    JUST_NEW = null;
  };
  const bindCards = () => {
    $$('.lead', board).forEach(c => {
      c.ondragstart = e => { e.dataTransfer.setData('text/plain', c.dataset.id); c.classList.add('drag'); };
      c.ondragend = () => c.classList.remove('drag');
    });
    $$('[data-mv]', board).forEach(b => b.onclick = e => {
      e.stopPropagation();
      const [id, d] = b.dataset.mv.split('|');
      const l = LEADS.find(x => x.id == id);
      const i = STATES.findIndex(x => x.k === l.st);
      l.st = STATES[Math.max(0, Math.min(STATES.length - 1, i + +d))].k;
      guardarLeads(); render();
    });
    $$('[data-wa]', board).forEach(b => b.onclick = e => {
      e.stopPropagation();
      const l = LEADS.find(x => x.id == b.dataset.wa);
      window.open(wa(`Hola ${l.nombre.split(' ')[0]}, soy de Cabinas RM. Vi tu consulta (ref ${l.ref}) y te paso el presupuesto.`), '_blank', 'noopener');
    });
    $$('[data-del]', board).forEach(b => b.onclick = e => {
      e.stopPropagation();
      LEADS = LEADS.filter(x => x.id != b.dataset.del);
      guardarLeads(); render();
    });
  };
  $$('.col', board).forEach(col => {
    col.ondragover = e => { e.preventDefault(); col.classList.add('over'); };
    col.ondragleave = () => col.classList.remove('over');
    col.ondrop = e => {
      e.preventDefault(); col.classList.remove('over');
      const l = LEADS.find(x => x.id == e.dataTransfer.getData('text/plain'));
      if (l) { l.st = col.dataset.st; guardarLeads(); render(); }
    };
  });
  render();
}

/* ══════════════════════════════════════════════════════════════
   ROUTER — direcciones reales, no fragmentos.

   Antes todo el sitio vivía en #/rubro/detailing y compañía. Google
   descarta el fragmento: para un buscador existía UNA sola página, y
   además servida vacía (el <main> se llena recién cuando corre el JS).
   Las cuatro páginas de rubro, que son justo las que alguien busca
   ("cabinas para lavaderos"), no podían posicionar.

   Ahora cada vista tiene su URL, su <title>, su descripción y su
   canonical. Vercel reescribe cualquier ruta a index.html (rewrite en
   vercel.json) y acá adentro se decide qué mostrar. Los #/… viejos
   siguen andando: se traducen y se reemplazan en el historial.
   ══════════════════════════════════════════════════════════════ */

const urlRubro = r => `/cabinas-para-${r.slug}`;
const urlModelo = m => `/modelos/${m.slug}`;

/* Traducción de las direcciones viejas con # a las nuevas. */
function desdeHash(h) {
  const raw = h.replace(/^#\/?/, '');
  const [p, anchor] = raw.split('#');
  const parts = p.split('/').filter(Boolean);
  const a = anchor ? '#' + anchor : '';
  if (!parts.length) return '/' + a;
  if (parts[0] === 'rubro') return `/cabinas-para-${parts[1] || ''}` + a;
  if (parts[0] === 'modelo') return `/modelos/${parts[1] || ''}` + a;
  if (parts[0] === 'cotizar') return '/presupuesto' + a;
  return '/' + parts.join('/') + a;
}

/* Metadatos por vista. El title y la description son de esta página,
   no del sitio: es lo que se lee en el resultado de búsqueda. */
function meta(o) {
  document.title = o.t;
  const set = (sel, attr, val) => { const el = $(sel); if (el) el.setAttribute(attr, val); };
  set('meta[name="description"]', 'content', o.d);
  set('meta[name="robots"]', 'content', o.noindex ? 'noindex,nofollow' : 'index,follow');
  set('link[rel="canonical"]', 'href', SITE + (o.u || location.pathname));
  set('meta[property="og:title"]', 'content', o.ogt || o.t);
  set('meta[property="og:description"]', 'content', o.d);
  set('meta[property="og:url"]', 'content', SITE + (o.u || location.pathname));
  set('meta[property="og:image"]', 'content', SITE + (o.img || '/img/og.jpg'));
  set('meta[name="twitter:image"]', 'content', SITE + (o.img || '/img/og.jpg'));
}

/* Navegación interna sin recargar. */
function go(path, replace) {
  const cur = location.pathname + location.hash;
  if (path === cur) return;
  history[replace ? 'replaceState' : 'pushState']({}, '', path);
  render();
}

/* Un solo listener para todos los enlaces internos, presentes y futuros. */
addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="/"]');
  if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  closeMob();
  go(a.getAttribute('href'));
});

let CURPATH = null;
function render() {
  if (location.hash.startsWith('#/')) return go(desdeHash(location.hash), true);

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const anchor = location.hash.slice(1);
  const parts = path.split('/').filter(Boolean);
  const main = $('#main');
  if (CURPATH === path && anchor) {            // sólo cambió el ancla: scrolleamos
    const t0 = document.getElementById(anchor);
    if (t0) { t0.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  }
  const primera = CURPATH === null;
  CURPATH = path;
  let html, prefill = null;

  const rubroSlug = parts[0] && parts[0].startsWith('cabinas-para-')
    ? parts[0].replace('cabinas-para-', '') : null;

  if (!parts.length) {
    html = viewHome();
    meta({
      u: '/',
      t: 'Cabinas Desarmables RM | Cabinas para detailing, lavaderos y lubricentros',
      ogt: 'Cabinas Desarmables RM | El auto entra a un galpón, sale de un estudio',
      d: 'Fabricamos cabinas desarmables para detailing, lavaderos, lubricentros y concesionarias. Pack Box, Studio y Studio Pro: estructura 100% desarmable con revestimiento en chapa trapezoidal y, según el pack, piso encastrable e iluminación. Envíos a todo el país desde Puerto General San Martín, Santa Fe.'
    });
  }
  else if (rubroSlug) {
    html = viewRubro(rubroSlug);
    const r = DATA.rubros.find(x => x.slug === rubroSlug);
    if (r) prefill = { rubro: r.qRubro };
  }
  else if (parts[0] === 'modelos' && parts[1]) html = viewModelo(parts[1]);
  else if (parts[0] === 'modelos') html = viewModelos();
  else if (parts[0] === 'trabajos') html = viewTrabajos();
  else if (parts[0] === 'presupuesto') {
    html = viewCotizar();
    meta({
      u: '/presupuesto',
      t: 'Pedir presupuesto de cabina | Cabinas Desarmables RM',
      d: 'Contanos tu rubro, qué vehículo tiene que entrar y cuánto medís. Con eso RM tiene los datos para cotizarte.'
    });
  }
  else if (parts[0] === 'panel') html = viewPanel();
  else {
    html = view404();
    meta({ t: 'Página no encontrada | Cabinas Desarmables RM', d: 'La página que buscabas no existe.' });
  }

  main.innerHTML = html;

  /* bindings por vista */
  bindIso(main); bindCmp(main); bindFit(main); bindFaq(main); bindPanel(main);
  if (prefill && Q.i <= 1) { Q.d.rubro = prefill.rubro; Q.i = 1; }
  if (PRE.vehiculo || PRE.ancho) {
    Object.keys(PRE).forEach(k => { if (PRE[k]) Q.d[k] = PRE[k]; });
    Q.i = Q.d.rubro ? 3 : 0;               // si ya sabemos el rubro, saltamos a preferencias
    Object.keys(PRE).forEach(k => PRE[k] = '');
  }
  mountQuote(main, prefill);

  
  $$('[data-goquote]', main).forEach(b => b.onclick = () => {
    if (b.dataset.goquote) { Q.d.rubro = b.dataset.goquote === 'Lavaderos' ? 'Lavadero' : b.dataset.goquote === 'Lubricentros' ? 'Lubricentro' : b.dataset.goquote === 'Concesionarias' ? 'Concesionaria' : b.dataset.goquote; Q.i = 1; }
    go('/presupuesto');
  });
  $$('[data-goquotemodel]', main).forEach(b => b.onclick = () => {
    const m = DATA.modelos.find(x => x.slug === b.dataset.goquotemodel);
    Q.d.modelo = m ? m.n : ''; go('/presupuesto');
  });

  reveals();
  $$('#nav a, #mob a').forEach(a => {
    const h = a.getAttribute('href') || '';
    a.toggleAttribute('aria-current', h === path || (h.startsWith(path) && path !== '/'));
  });
  fab();

  if (anchor) {
    const t = document.getElementById(anchor);
    if (t) { setTimeout(() => t.scrollIntoView({ behavior: primera ? 'instant' : 'smooth', block: 'start' }), 60); return; }
  }
  scrollTo({ top: 0, behavior: 'instant' });
}

function viewCotizar() {
  return `<section class="sec" style="padding-top:calc(var(--head) + clamp(34px,6vh,70px))">
    <div class="lightband" style="top:0;transform:scaleY(-1)"></div>
    <div class="wrap" style="position:relative;max-width:860px">
      <div class="sec-head rv">
        <span class="mono am">Configurá tu cabina</span>
        <h1 class="d2">Armá tu proyecto</h1>
        <p class="lede">Cinco pasos, casi todo con el pulgar. Al final se abre WhatsApp con tu proyecto escrito, así RM tiene los datos para cotizarte.</p>
      </div>
      <div id="quoteMount"></div>
      <div class="rv" style="margin-top:30px;display:flex;gap:20px;flex-wrap:wrap">
        <a class="btn-t" href="/#medir">No sé mis medidas, quiero medir primero</a>
        <a class="btn-t" href="${wa('Hola RM, quiero hacerles una consulta sobre una cabina.')}" target="_blank" rel="noopener">Prefiero escribir directo</a>
      </div>
    </div>
  </section>`;
}

/* El arranque vive al final del bundle (ver V2): las vistas nuevas
   usan constantes declaradas más abajo y no pueden invocarse antes. */

/* ══════════════════════════════════════════════════════════════
   V3 — Corrección de dirección de arte.
   Auditoría: ninguna de las 5 fotos de RM demuestra un rubro
   (ninguna tiene contexto de negocio) ni identifica un modelo
   (no hay evidencia de qué medida es cada una). Usarlas para
   argumentar eso era interpretación conveniente.
   Regla nueva: las fotos reales aparecen en DOS lugares — el hero
   y la galería de trabajos. Todo lo demás se sostiene con
   tipografía, diagrama, muestras de material y espacios
   reservados. Una foto incorrecta es peor que no tener foto.
   ══════════════════════════════════════════════════════════════ */

/* Espacio reservado: parte del sistema visual, no un hueco roto */
const resv = (label, ratio = '3/4', tone = 'dark') => `
  <div class="resv ${tone}" style="aspect-ratio:${ratio}" role="img" aria-label="Espacio reservado: ${label}">
    <span class="resv-cx"></span>
    <span class="resv-tag">Imagen pendiente</span>
    <img class="resv-mark" src="${window.RM_LOGO}" alt="" width="88" height="88">
    <div class="cota"><b>A relevar</b></div>
    <span class="resv-lb">${label}</span>
  </div>`;

/* Foto del rubro: la cabina entregada que prueba lo que dice el texto.
   El epígrafe aclara siempre qué es y qué no: son cabinas reales de RM,
   pero no consta en qué tipo de negocio está instalada cada una. */
function fotoRubro(r, eager) {
  if (!r.foto) return resv('cabina instalada en un ' + r.n.toLowerCase().replace(/s$/, ''), '3/2');
  return `<figure class="rfig" data-img="${r.foto}" data-cur="Ampliar">
    ${pic(r.foto, {
    cls: 'fill', ratio: '3/2', eager,
    sizes: '(min-width:900px) 44vw, 94vw'
  })}
    <figcaption>${r.fotoCap}</figcaption>
  </figure>`;
}

/* ── MODELOS: índice tipográfico + detalle del seleccionado ─── */
function modeloSelector() {
  return `
  <div class="cat" data-sel="mod" role="tablist">
    ${DATA.modelos.map((m, i) => `
      <button class="tab cat-row${i === 2 ? ' on' : ''}" role="tab" data-i="${i}" aria-selected="${i === 2}">
        <span class="cat-t">${m.n}</span>
        <span class="cat-d">${m.qe}</span>
        <span class="cat-m">Entra: ${m.veh.toLowerCase()}</span>
      </button>`).join('')}
  </div>
  <div class="sel-body mod-detail" data-selbody="mod" role="tabpanel">${modeloPane(2)}</div>`;
}
function modeloPane(i) {
  const m = DATA.modelos[i];
  return `
    <div>${modeloPlan(m, 'light')}</div>
    <div class="sel-copy">
      <h3 class="d2">${m.n}</h3>
      <p class="lede" style="color:#4A4D46;margin-top:10px">${m.qe}</p>
      <dl class="spec">
        <dt>Entra</dt><dd>${m.veh}</dd>
        ${fichaComun().map(f => `<dt>${f[0]}</dt><dd>${f[1]}</dd>`).join('')}
        <dt>Medidas</dt><dd>Se define con las de tu local</dd>
      </dl>
      <div class="sel-actions">
        <button class="btn btn-p" data-goquotemodel="${m.slug}"><span>Consultar por este modelo</span></button>
        <a class="btn btn-g" href="${urlModelo(m)}">Ver ficha</a>
      </div>
    </div>`;
}

/* Cada sección termina en el paso lógico siguiente, no en el mismo botón */
const ctaBand = (kicker, text, btn) => `
  <div class="ctab rv"><div><span class="mono am">${kicker}</span><p class="d3">${text}</p></div>
  <div>${btn}</div></div>`;
const btnP = (label, href) => `<a class="btn btn-p" href="${href}"><span>${label}</span></a>`;
const btnQ = (label, rubro = '') => `<button class="btn btn-p" data-goquote="${rubro}"><span>${label}</span></button>`;

/* Empresa: dirección y horarios confirmados por el cliente. Los envíos
   tienen su propio bloque en "Cómo se compra". */
function trustBlock() {
  /* "Abierto ahora" con la hora de Argentina, no con la del dispositivo. */
  let d = new Date();
  try { d = new Date(d.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })); } catch (e) { }
  const dia = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
  const abierto = (dia >= 1 && dia <= 5 && h >= 9 && h < 17) || (dia === 6 && h >= 9 && h < 12);
  return `
  <div class="trust">
    <div class="rv">
      <a class="trow" href="${EMPRESA.maps}" target="_blank" rel="noopener">
        <span class="tlb">Taller</span>
        <span class="tval">${EMPRESA.calle}<small>${EMPRESA.ciudad}, ${EMPRESA.prov} · Cómo llegar</small></span></a>
      <a class="trow" data-wa href="${wa(waMsg())}" target="_blank" rel="noopener">
        <span class="tlb">WhatsApp</span><span class="tval">${TEL_HUMAN}<small>Es donde respondemos las consultas</small></span></a>
      <a class="trow" href="${IG}" target="_blank" rel="noopener">
        <span class="tlb">Instagram</span><span class="tval">@cabinasdesarmablesrm<small>Fotos de cabinas de RM</small></span></a>
    </div>
    <div class="hours rv" data-d="1">
      <span class="now ${abierto ? '' : 'off'}"><i></i>${abierto ? 'Abierto ahora' : 'Cerrado ahora'}</span>
      ${EMPRESA.horarios.map(x => `<div class="hr ${x[2] ? '' : 'off'}"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}
      <p class="quiet" style="margin-top:16px">Fuera de horario podés escribir igual: el mensaje queda en WhatsApp.</p>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   HOME — V7
   Siete láminas en vez de doce, en el orden de la conversación real:
   qué es → ¿es real? → qué trae → ¿me entra? → ¿sirve para mi
   negocio? → cómo se compra → lo que queda. WhatsApp en cada una; el
   cotizador queda como camino secundario en /presupuesto.
   ══════════════════════════════════════════════════════════════ */

/* Foto de portada: un box de detailing como referencia del rubro. NO se
   presenta como trabajo ni como cliente de RM, por eso no lleva epígrafe.
   posM / posD: encuadre en celular y en escritorio (ver CSS de .portada). */
const PORTADA = { img: 'hero-detailing', posM: '50% 56%', posD: '50% 50%' };

/* En la home ninguna foto se repite, y la portada anterior (el Ford de
   hero.jpg) tampoco va: dos autos rojos de frente, uno tras otro, se leen
   como la misma foto. Sigue en /trabajos, sin cambios. */
const FUERA_DE_HOME = ['hero'];

/* Encabezado de lámina de la home: número de plano + título. */
const lamina = (n, titulo, bajada = '') => `
  <div class="hh rv">
    <div class="lam"><span class="no">Lám ${n} / 07</span><span class="ln2"></span></div>
    <h2 class="d2">${titulo}</h2>
    ${bajada ? `<p class="lede">${bajada}</p>` : ''}
  </div>`;

const IC_OK = '<svg class="ok" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
/* La raya dice lo que dicen los datos: el ítem no figura en las
   especificaciones de ese pack. No se afirma que esté excluido. */
const SI = `${IC_OK}<span class="sr">Incluido</span>`;
const NO = '<span class="no-inc" aria-hidden="true">—</span><span class="sr">No figura en este pack</span>';

/* Packs: primero las diferencias (tres filas iguales en las tres
   columnas, para comparar de un vistazo). Tocar la tarjeta suma el pack a
   la orden de consulta; el botón lo consulta directo. Materiales y
   componentes quedan plegados, agrupados por parte de la cabina, con un
   filtro para ver sólo lo que cambia. */
function packsBlock() {
  const P = DATA.packs;
  const val = v => v === true ? SI : v === false ? NO : `<small>${v}</small>`;
  const igual = v => v.every(x => x === v[0]);
  const cards = P.map((p, i) => `
    <article class="pack rv" data-d="${i + 1}" data-pack-card="${p.n}">
      <input class="pk-in" type="radio" name="pack" id="p-${i}" value="${p.n}" autocomplete="off"${CTX.pack === p.n ? ' checked' : ''}>
      <h3 class="d3"><label for="p-${i}"><span class="pk" aria-hidden="true"></span>${p.n}</label></h3>
      <span class="pack-badge">En tu consulta</span>
      <p class="pack-r">${p.resumen}</p>
      <dl class="pack-s">
        <div><dt>Estructura y revestimiento</dt><dd>${SI}</dd></div>
        <div><dt>Piso encastrable</dt><dd>${p.piso ? SI : NO}</dd></div>
        <div><dt>Iluminación</dt><dd>${p.luz ? `<span class="luz${p.luz === 'Full Pro' ? ' pro' : ''}">${p.luz}</span>` : NO}</dd></div>
      </dl>
      ${btnWA('Consultar este pack', { pack: p.n, aria: `Consultar por el ${p.n} por WhatsApp` }, 'btn-g')}
    </article>`).join('');
  const filas = DATA.packSpec.map(([g, rows]) => `
    <tr class="pg"${rows.every(([, ...v]) => igual(v)) ? ' data-igual' : ''}><th scope="colgroup" colspan="4">${g}</th></tr>${rows.map(([lb, ...v]) => `
    <tr${igual(v) ? ' data-igual' : ''}><th scope="row">${lb}</th>${v.map(x => `<td>${val(x)}</td>`).join('')}</tr>`).join('')}`).join('');
  return `
    <div class="packs">${cards}</div>
    <details class="pack-det rv">
      <summary>Materiales y componentes de cada pack</summary>
      <div class="pack-tw">
        <button type="button" class="pack-tg" aria-pressed="false">Solo lo que cambia</button>
        <table class="pack-tab">
          <caption class="sr">Materiales y componentes de cada pack</caption>
          <colgroup><col class="c-l"><col><col><col></colgroup>
          <thead><tr><td></td>${P.map(p => `<th scope="col">${p.corto}</th>`).join('')}</tr></thead>
          <tbody>${filas}</tbody>
        </table>
        <p class="pack-ley">— No figura en las especificaciones de ese pack. Publicamos sólo lo que confirmó el taller: si necesitás el detalle de un material, preguntalo en la consulta.</p>
      </div>
    </details>`;
}

/* Los cinco modelos a la vista, por lo que tiene que entrar. Elegir uno es
   opcional: se suma al mensaje y la planta de arriba lo dibuja adentro. */
function modelosHome() {
  return `
    <fieldset class="mods7 rv">
      <legend>¿Qué tiene que entrar? Tocá uno y se suma a tu consulta</legend>
      ${DATA.modelos.map(m => `
        <div class="mrow">
          <input type="radio" name="modelo" id="m-${m.slug}" value="${m.n}" autocomplete="off"${CTX.modelo === m.n ? ' checked' : ''}>
          <label for="m-${m.slug}"><b>${m.n}</b>
            <span class="mrow-e">${m.plan ? 'Entra: ' + m.veh.toLowerCase() : 'Según tu espacio'}</span>
            <span class="mrow-d">${m.qe}</span></label>
          <a class="mrow-f" href="${urlModelo(m)}" aria-label="Ficha: ${m.n}">Ficha</a>
        </div>`).join('')}
      <p class="mods7-p">La medida de cada modelo la confirmamos con la de tu local.</p>
    </fieldset>`;
}

/* Rubros: los cuatro con página y, debajo, los otros usos posibles que
   mencionó RM, en tipografía. Todos son la misma elección: el rubro que
   viaja en la consulta. */
function rubrosHome() {
  const chk = v => CTX.rubro === v ? ' checked' : '';
  const usos = DATA.usos.map(u => {
    const foto = u.img && IMG[u.img] ? pic(u.img, { sizes: '(min-width:900px) 16vw, 44vw', ratio: '4/3' }) : '';
    return `
        <label class="uso${foto ? ' con-img' : ''}"><input type="radio" name="rubro" value="${u.q}" autocomplete="off"${chk(u.q)}>${foto}<span>${u.n}</span></label>`;
  }).join('');
  return `
    <ul class="rbl">${DATA.rubros.map(r => `
      <li class="rv" data-rubro-row="${r.qRubro}">
        <input class="pk-in" type="radio" name="rubro" id="r-${r.slug}" value="${r.qRubro}" autocomplete="off"${chk(r.qRubro)}>
        <div class="rbl-n"><h3 class="d3"><label for="r-${r.slug}"><span class="pk" aria-hidden="true"></span>${r.n}</label></h3><span class="rbl-b">En tu consulta</span></div>
        <p>${r.claim}</p>
        <div class="rbl-a">
          <a class="btn-t" href="${urlRubro(r)}">Ver cabinas para ${r.n.toLowerCase()}</a>
          ${btnWA('Consultar', { rubro: r.qRubro, aria: `Consultar por WhatsApp para ${r.n.toLowerCase()}` }, 'btn-g btn-sm')}
        </div>
      </li>`).join('')}</ul>
    <div class="usos rv">
      <div class="usos-t">
        <h3 class="d3">Otros usos posibles</h3>
        <p>Las cabinas son modulares y pueden aplicarse a otros rubros. Elegí el tuyo, o «Otro» y nos contás.</p>
      </div>
      <fieldset class="usos-l"><legend class="sr">Otros rubros</legend>${usos}
        <label class="uso"><input type="radio" name="rubro" value="Otro rubro" autocomplete="off"${chk('Otro rubro')}><span>Otro</span></label>
      </fieldset>
      <div class="usos-a">${btnWA('Consultar por WhatsApp', { lb: 'rubro' }, 'btn-g')}</div>
    </div>`;
}

/* Sólo lo confirmado. Plazo, pago, armado y garantía van juntos en una
   línea "a confirmar" en vez de un recuadro por paso. */
const PASOS = [
  ['Consulta', 'Nos escribís por WhatsApp con tu rubro, el pack que te interesa y, si los tenés, la medida y tu localidad. Con eso te cotizamos.'],
  ['Fabricación', 'Se fabrica en nuestro taller de Puerto General San Martín, Santa Fe.'],
  ['Envío', 'Enviamos a todo el país. El costo del envío generalmente se suma en la cotización.'],
  ['Armado', 'La estructura es modular y 100% desarmable.']
];

/* Cierre: la orden de consulta completa. Se pinta con lo que ya hay en
   CTX; después la actualiza pintarOrden(). */
function ordenBlock() {
  const V = ordenVals();
  return `
      <div class="cierre rv" id="configurar">
        <div class="cierre-c">
          <h2 class="d2">Tu consulta, lista para mandar</h2>
          <p class="lede">Lo que fuiste eligiendo viaja en el mensaje. Si falta algo no pasa nada: lo completamos por WhatsApp.</p>
          <a class="txt-l" href="/presupuesto" data-quote-ctx>Prefiero armar el presupuesto paso a paso</a>
        </div>
        <div class="orden">
          <p class="orden-h"><span>Orden de consulta</span><span>RM · Cabinas desarmables</span></p>
          <dl class="orden-f">${ORDEN.map(([k, lb, href]) => `
            <div data-of="${k}"${V[k] ? ' class="lleno"' : ''}><dt>${lb}</dt>
              <dd><span class="of-v" data-v="${esc(V[k] || '')}">${esc(V[k] || 'Sin elegir')}</span><a href="${href}" aria-label="${V[k] ? 'Cambiar' : 'Elegir'} ${lb.toLowerCase()}">${V[k] ? 'Cambiar' : 'Elegir'}</a></dd></div>`).join('')}
          </dl>
          <div class="f-fld orden-loc"><label for="o-loc">Localidad</label>
            <input id="o-loc" data-f="loc" type="text" autocomplete="off" placeholder="Ej.: Rosario, Santa Fe" value="${esc(CTX.loc)}"></div>
          ${btnWA('Abrir en WhatsApp', { aria: 'Abrir WhatsApp con esta consulta' })}
          <p class="orden-n">Se abre WhatsApp con el mensaje armado. Lo revisás y lo enviás vos.</p>
        </div>
      </div>`;
}

function viewHome() {
  const P = PORTADA;
  const obras = DATA.trabajos.filter(t => t.img !== P.img && !FUERA_DE_HOME.includes(t.img));
  const n = obras.length + 1;                    // fotos + tarjeta de Instagram
  /* Gráfica de envíos: el camión entero, con su proporción (3,7:1). Si
     faltara en assets.js, el bloque se sostiene con el texto. */
  const envioG = IMG['camion-rm'] ? `<figure class="envio-g">${pic('camion-rm', {
    sizes: '(min-width:1400px) 740px, (min-width:900px) 52vw, 92vw', fit: 'contain'
  })}</figure>` : '';
  return `
  <section class="portada" data-lam="01" data-name="Portada">
    <div class="portada-foto" style="--pos-m:${P.posM};--pos-d:${P.posD}">${pic(P.img, {
      cls: 'fill', eager: true, sizes: '(min-width:1000px) 53vw, 100vw', alt: P.alt
    })}</div>
    <div class="portada-copy">
      <h1 class="d1"><span class="ln"><i>Cabinas</i></span><span class="ln"><i>desarmables</i></span></h1>
      <p class="portada-lede">Modulares y 100% desarmables, para detailing, lavaderos y otros rubros.</p>
      <div class="portada-cta">
        ${btnWA('Escribir por WhatsApp')}
        <a class="txt-l" href="/#rubros">Elegir rubro, pack y medida</a>
      </div>
      <dl class="portada-meta">
        <div><dt class="mono">Estructura</dt><dd>100% desarmable</dd></div>
        <div><dt class="mono">Envíos</dt><dd>A todo el país</dd></div>
        <div><dt class="mono">Taller</dt><dd>Puerto Gral. San Martín, Santa Fe</dd></div>
      </dl>
    </div>
  </section>

  <section class="sec" id="trabajos" data-lam="02" data-name="Cabinas entregadas" style="background:var(--ink-2);border-bottom:1px solid var(--line)">
    <div class="wrap">
      ${lamina('02', 'Cabinas entregadas', 'Fotos de cabinas de RM, publicadas en nuestro Instagram.')}
      <div class="obras rv${n % 2 ? ' impar' : ''}" style="--n:${n === 6 ? 3 : n}">
        ${obras.map(t => figura(t.img, { cap: t.cap, alt: t.alt, sizes: `(min-width:900px) ${n === 6 ? 31 : Math.round(92 / n)}vw, 46vw` })).join('')}
        <figure class="ig-card">
          <a href="${IG}" target="_blank" rel="noopener">
            <span class="mono am">Instagram</span>
            <b class="d4">Más cabinas entregadas, en nuestro Instagram</b>
            <span class="btn-t">@cabinasdesarmablesrm →</span>
          </a>
        </figure>
      </div>
      <div class="fila-cta rv">
        ${btnWA('Quiero una así', {}, 'btn-g')}
        <a class="btn-t" href="/trabajos">Ver todas las cabinas entregadas</a>
      </div>
    </div>
  </section>

  <section class="sec" id="rubros" data-lam="03" data-name="Rubro">
    <div class="wrap">
      ${lamina('03', 'Para tu rubro', 'Elegí el tuyo y se suma a tu consulta. Detailing, lavaderos, lubricentros y concesionarias tienen su página con el detalle.')}
      ${rubrosHome()}
    </div>
  </section>

  <section class="sec paper" id="sistema" data-lam="04" data-name="Packs">
    <div class="wrap">
      ${lamina('04', 'Tres packs, según cuánto viene resuelto', 'Tocá uno para sumarlo a tu consulta. El tamaño lo define la medida, más abajo.')}
      ${packsBlock()}
      <p class="pack-nota rv">No hay precios fijos: cada cabina se cotiza según la medida y lo que necesitás. El envío generalmente se suma en la cotización.</p>
    </div>
  </section>

  <section class="sec grid-bg" id="modelos" data-lam="05" data-name="Medidas">
    <div class="wrap">
      ${lamina('05', 'Medidas y modelos', 'Elegí una medida frecuente o pedí la tuya, y contanos qué tiene que entrar adentro.')}
      <div class="mm">
        ${fitBlock()}
        ${modelosHome()}
      </div>
    </div>
  </section>

  <section class="sec" id="comprar" data-lam="06" data-name="Compra y envíos">
    <div class="wrap">
      ${lamina('06', 'Cómo se compra', 'Comprás a distancia. Así funciona, de la consulta a la cabina armada.')}
      <ol class="pasos rv">${PASOS.map((p, i) => `
        <li><span class="k">0${i + 1}</span><h3>${p[0]}</h3><p>${p[1]}</p></li>`).join('')}</ol>
      <p class="pend rv"><span class="tbd">a confirmar</span> Plazo de fabricación, formas de pago, quién arma y en cuánto tiempo, y garantía. Los vemos en la consulta.</p>

      <div class="envio rv${envioG ? ' con-g' : ''}">
        ${envioG}
        <div class="envio-t">
          <h3 class="${envioG ? 'd3' : 'd2'}">Envíos a todo el país</h3>
          <p>Fabricamos en nuestro taller de Puerto General San Martín, Santa Fe, y enviamos a todo el país. El costo del envío generalmente se suma en la cotización: contanos tu localidad.</p>
          <div class="envio-a">${btnWA('Consultar el envío', {}, 'btn-g btn-sm')}</div>
        </div>
      </div>

      <div class="emp" id="empresa">
        <h3 class="d3 rv">Dónde estamos</h3>
        ${trustBlock()}
      </div>
    </div>
  </section>

  <section class="sec" id="preguntas" data-lam="07" data-name="Preguntas" style="background:var(--ink-2);border-top:1px solid var(--line)">
    <div class="wrap">
      ${lamina('07', 'Lo que más nos preguntan')}
      ${faqBlock(DATA.faqHome)}
      ${ordenBlock()}
    </div>
  </section>`;
}

function viewModelos() {
  meta({
    u: '/modelos',
    t: 'Modelos de cabinas desarmables | Cabinas Desarmables RM',
    d: 'Los modelos de cabina RM ordenados por lo que tiene que entrar adentro: una moto, un auto, un auto con lugar para trabajar alrededor, dos autos, o a medida según tu local.'
  });
  return `<section class="sec paper" style="padding-top:calc(var(--head) + clamp(36px,7vh,76px))">
    <div class="wrap">
      <div class="sec-head rv">
        <nav class="crumb" aria-label="Migas"><a href="/">Inicio</a><span>/</span><b>Modelos</b></nav>
        <h1 class="d1" style="font-size:clamp(34px,6vw,72px)">Modelos</h1>
        <p class="lede" style="color:#4A4D46">Ordenados por lo que tenés que meter adentro, que es como se elige de verdad.</p>
      </div>
      <div class="rv">${modeloSelector()}</div>
    </div>
  </section>`;
}

/* ── COTIZADOR V2: riel de pasos + resumen en vivo ──────────── */
function quoteHTML() {
  const s = Q.steps[Q.i] || {};
  const rail = `<div class="q-rail">${Q.steps.map((st, i) => {
    const done = i < Q.i, now = i === Q.i;
    return `<button class="${done ? 'done' : ''}${now ? ' now' : ''}" ${done ? `data-back="${i}"` : 'disabled'}>
      <span class="n">${done ? '✓' : i + 1}</span><span>${['Rubro', 'Vehículo', 'Espacio', 'Pack', 'Contacto'][i]}</span></button>`;
  }).join('')}</div>`;

  const chips = Q.i > 0 && Q.i < 5 ? `<div class="q-chips">${[['rubro', 0], ['vehiculo', 1], ['medidas', 2]]
    .map(([f, i]) => {
      const v = f === 'medidas'
        ? (Q.d.ancho && Q.d.largo ? `${Q.d.ancho} × ${Q.d.largo}${Q.d.alto ? ` × ${Q.d.alto}` : ''} m` : '')
        : Q.d[f];
      return v && i < Q.i ? `<button class="q-chip" data-back="${i}"><span>${v}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 20h16M14 4l6 6L9 21H4v-5z"/></svg></button>` : '';
    }).join('')}</div>` : '';

  let body = '';
  if (Q.i === 5) body = quoteSummary();
  else if (Q.i === 6) body = quoteDone();
  else if (s.o) body = `<div class="opts">${s.o.map(o => `
      <button class="opt${Q.d[s.f] === o ? ' sel' : ''}" data-pick="${o}"><span class="tick"></span><span>${o}</span></button>`).join('')}</div>`;
  else if (s.f === 'medidas') body = `
      <div class="fit-in">${[['ancho', 'Ancho'], ['largo', 'Largo'], ['alto', 'Alto libre']].map(f => `
        <div class="f-fld"><label for="q-${f[0]}">${f[1]} (m)</label>
        <input id="q-${f[0]}" data-q="${f[0]}" type="text" inputmode="decimal" placeholder="0,00" value="${Q.d[f[0]]}"></div>`).join('')}</div>
      <p class="mono" style="margin-top:14px;line-height:1.8">El alto libre es hasta lo más bajo que haya:<br>una viga, un caño o una luminaria.</p>
      <p style="margin-top:16px;font-size:14.5px">Es el dato que nos permite cotizarte de una. Si todavía no lo mediste, seguí igual.</p>`;
  /* Paso 4: el pack. Antes ofrecía terminación negra o blanca y tres techos,
     opciones que no figuran en las especificaciones confirmadas. */
  else if (s.f === 'pref') body = `
      <div class="opts">${[...DATA.packs.map(p => [p.n, p.resumen]), ['No sé, asesórenme', '']].map(([o, d]) => `
        <button class="opt${Q.d.pack === o ? ' sel' : ''}" data-pref="pack" data-v="${o}" style="min-height:58px;font-size:14.5px"><span class="tick"></span>
          <span><b style="display:block;font-weight:inherit;font-variation-settings:'wdth' 104,'wght' 640">${o}</b>${d ? `<small style="display:block;color:var(--mut);font-size:13px;margin-top:3px;line-height:1.4">${d}</small>` : ''}</span></button>`).join('')}</div>`;
  else if (s.f === 'contacto') body = `
      <div class="q-fields two">
        <div class="fl" data-fl="nombre"><label for="q-nombre">Nombre</label><input id="q-nombre" data-q="nombre" value="${Q.d.nombre}" autocomplete="given-name"><span class="msg">Falta tu nombre</span></div>
        <div class="fl" data-fl="tel"><label for="q-tel">WhatsApp</label><input id="q-tel" data-q="tel" type="tel" inputmode="tel" value="${Q.d.tel}" placeholder="341 555 5555"><span class="msg">Falta el WhatsApp</span></div>
      </div>
      <div class="q-fields" style="margin-top:16px">
        <div class="fl" data-fl="loc"><label for="q-loc">Localidad y provincia</label><input id="q-loc" data-q="loc" value="${Q.d.loc}" placeholder="Rosario, Santa Fe"><span class="msg">Falta la localidad</span></div>
        <div class="fl"><label for="q-msg">Algo más que quieras contarnos (opcional)</label><textarea id="q-msg" data-q="msg" rows="2">${Q.d.msg}</textarea></div>
      </div>
      <p class="mono" style="margin-top:18px;line-height:1.8">No pedimos mail ni datos de más.<br>La consulta se abre directo en WhatsApp.</p>`;

  const canNext = ['medidas', 'pref', 'contacto'].includes(s.f) || !!Q.d[s.f];
  const nav = Q.i >= 5 ? '' : `
    <div class="q-nav">
      ${Q.i > 0 ? '<button class="btn btn-g" data-nav="-1">Atrás</button>' : ''}
      <span class="sp"></span>
      ${s.f === 'medidas' ? '<button class="btn-t" data-nav="1" style="margin-right:6px">Todavía no lo medí</button>' : ''}
      ${Q.i === 3 ? '<button class="btn-t" data-nav="1" style="margin-right:6px">Saltear</button>' : ''}
      <button class="btn btn-p" data-nav="1" ${canNext ? '' : 'disabled'}>
        <span>${Q.i === 4 ? 'Ver mi consulta' : 'Siguiente'}</span></button>
    </div>`;

  const live = [['Rubro', Q.d.rubro], ['Entra', Q.d.vehiculo],
  ['Modelo', Q.d.modelo],
  ['Tu espacio', Q.d.ancho && Q.d.largo ? `${Q.d.ancho} × ${Q.d.largo}${Q.d.alto ? ` × ${Q.d.alto}` : ''} m` : ''],
  ['Pack', Q.d.pack], ['Medida', Q.d.medida], ['Localidad', Q.d.loc]];

  return `<div class="quote">${rail}<div class="q-grid">
    <div class="q-body">
      ${chips}
      ${Q.i < 5 ? `<span class="q-k">${s.k}</span><h3 class="q-q">${s.q}</h3>` : ''}
      <div class="q-step on">${body}</div>${nav}
    </div>
    <aside class="q-live" aria-live="polite">
      <div class="proj">
        <div class="proj-h"><b>Tu proyecto RM</b><span class="mono">${Q.i < 5 ? (Q.i + 1) + '/5' : 'Listo'}</span></div>
        <dl>${live.map(l => `<div class="row"><dt>${l[0]}</dt>
          <dd class="${l[1] ? '' : 'empty'}">${l[1] || 'Pendiente'}</dd></div>`).join('')}</dl>
      </div>
      <p class="quiet" style="margin-top:16px;line-height:1.7">Esto es lo que va a leer RM cuando abra el mensaje. Cuanto más completo, más rápido te cotiza.</p>
    </aside>
  </div></div>`;
}

/* ── PANEL V2: lo que un dueño necesita ver en 10 segundos ──── */
/* Resumen: se recalcula solo cada vez que cambia el tablero. */
function panelResumen() {
  const n = LEADS.length || 1;
  const conMed = LEADS.filter(l => l.med !== 'Sin medir').length;
  const nuevas = LEADS.filter(l => l.st === 'nueva');
  const vendidas = LEADS.filter(l => l.st === 'vendida').length;
  const count = k => LEADS.reduce((a, l) => (a[l[k]] = (a[l[k]] || 0) + 1, a), {});
  const rank = o => Object.entries(o).sort((a, b) => b[1] - a[1]);
  const rubros = rank(count('rubro')), locs = rank(count('loc')).slice(0, 4);
  const max = rubros.length ? rubros[0][1] : 1;
  const stale = nuevas.filter(l => diasDe(l) >= 1).length;

  const kpis = [['Consultas', LEADS.length], ['Con medidas cargadas', Math.round(conMed / n * 100) + '%'],
  ['Sin contactar', nuevas.length], ['Vendidas', vendidas]];

  const el = document.createElement('div');
  el.id = 'panelKpis';
  el.innerHTML = `
    ${stale ? `<div class="card" style="margin-bottom:14px;border-left:2px solid var(--warm)">
      <p class="alert" style="border:0;padding:0"><b>${stale} consulta${stale > 1 ? 's' : ''} sin contactar hace más de un día.</b>
      En este rubro la primera respuesta rápida es la que se queda con la venta.</p></div>` : ''}

    <div class="kpis">${kpis.map(k => `<div class="kpi"><span class="mono">${k[0]}</span><b>${k[1]}</b></div>`).join('')}</div>

    <div class="pan-grid">
      <div class="card"><h3>Consultas por rubro</h3>
        ${rubros.map(r => `<div class="bar-row"><span>${r[0]}</span><span>${r[1]}</span>
          <span class="bar"><i style="width:${r[1] / max * 100}%"></i></span></div>`).join('') || '<p class="quiet">Sin datos todavía.</p>'}
      </div>
      <div class="card"><h3>De dónde escriben</h3>
        ${locs.map(l => `<div class="bar-row" style="grid-template-columns:1fr auto"><span>${l[0]}</span><span>${l[1]}</span></div>`).join('') || '<p class="quiet">Sin datos todavía.</p>'}
        <p class="quiet" style="margin-top:12px">Sirve para decidir dónde conviene tener flete armado.</p>
      </div>
      <div class="card"><h3>Embudo</h3>
        <div class="funnel">${STATES.map(s => {
    const c = LEADS.filter(l => l.st === s.k).length;
    return `<div class="fn"><i style="--fc:${s.c};width:${Math.max(3, c / n * 130)}px"></i>
      <span>${s.n}</span><b>${c}</b></div>`;
  }).join('')}</div>
        <p class="quiet" style="margin-top:12px">${vendidas} de ${LEADS.length} consultas cerradas.</p>
      </div>
    </div>`;
  return el;
}

function viewPanel() {
  meta({
    u: '/panel',
    t: 'Panel de consultas | Cabinas Desarmables RM',
    d: 'Herramienta interna de seguimiento de consultas de Cabinas Desarmables RM.',
    noindex: true   /* es interno: no tiene por qué aparecer en Google */
  });

  return `<div class="panel-wrap"><div class="wrap">
    <div class="sec-head" style="margin-bottom:22px">
      <span class="mono am">Sistema interno</span>
      <h1 class="d2">Panel de consultas</h1>
      <p class="lede">Cada consulta que sale del cotizador entra acá con su contexto completo: rubro, vehículo, medidas, localidad y referencia. Probá el cotizador y volvé — la tuya aparece arriba de todo, en Nueva.</p>
    </div>

    <div id="panelKpis"></div>

    <div class="board" id="board">${STATES.map(s => `
      <div class="col" data-st="${s.k}" style="--st:${s.c}">
        <div class="col-h"><span class="mono">${s.n}</span><span class="c" data-c="${s.k}"></span></div>
        <div class="col-body" data-body="${s.k}"></div>
      </div>`).join('')}</div>
    <p class="quiet" style="margin:24px 0 50px;line-height:1.9;max-width:62ch">Las consultas se guardan en este navegador: lo que muevas de columna sigue acá mañana. Para que el equipo vea el mismo tablero desde varios teléfonos hace falta conectarlo a una base — es el paso siguiente, y no cambia esta pantalla.</p>
  </div></div>`;
}

/* ══════════════════════════════════════════════════════════════
   MOTION V2 — cada efecto tiene una función declarada.
   ══════════════════════════════════════════════════════════════ */
const RM_REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
let rafT = false;

/* Sin storytelling automático: el único movimiento ligado al scroll
   es un desplazamiento muy leve de la foto del hero. */
function bindBands(root) {
  const pan = $('.hero2-pan', root), wrap = $('.hero2-media', root);
  if (!pan || !wrap || RM_REDUCE) return;
  wrap._on = () => {
    const y = Math.min(scrollY, innerHeight);
    pan.style.transform = `translateY(${(y * 0.055).toFixed(1)}px)`;
  };
}

let OFF_SCROLL = null;
function bindScroll(root) {
  if (OFF_SCROLL) OFF_SCROLL();
  const nodes = [$('.hero2-media', root)].filter(n => n && n._on);
  if (!nodes.length) return;
  const run = () => { nodes.forEach(n => n._on()); rafT = false; };
  const on = () => { if (!rafT) { rafT = true; requestAnimationFrame(run); } };
  addEventListener('scroll', on, { passive: true });
  addEventListener('resize', on, { passive: true });
  OFF_SCROLL = () => { removeEventListener('scroll', on); removeEventListener('resize', on); };
  run();
}

/* Selectores de rubro y modelo: crossfade, teclado, y re-bind de los CTA */
function bindTabs(root) {
  $$('[data-sel]', root).forEach(tabs => {
    const key = tabs.dataset.sel;
    const body = $(`[data-selbody="${key}"]`, root);
    const pane = modeloPane;
    const go = i => {
      $$('.tab', tabs).forEach(t => {
        const on = +t.dataset.i === i;
        t.classList.toggle('on', on); t.setAttribute('aria-selected', on);
      });
      body.classList.add('swap');
      setTimeout(() => {
        body.innerHTML = pane(i);
        body.classList.remove('swap');
        bindCTAs(body); bindCursor(body);
      }, RM_REDUCE ? 0 : 240);
    };
    $$('.tab', tabs).forEach(t => {
      t.onclick = () => go(+t.dataset.i);
      t.onkeydown = e => {
        const ts = $$('.tab', tabs), i = ts.indexOf(t);
        if (e.key === 'ArrowRight' && ts[i + 1]) { ts[i + 1].focus(); go(i + 1); }
        if (e.key === 'ArrowLeft' && ts[i - 1]) { ts[i - 1].focus(); go(i - 1); }
      };
    });
  });
}

/* Los CTA viven adentro de paneles que se re-renderizan: se rebindean acá */
function bindCTAs(scope) {
  ['#trustWa', '#empresaWa'].forEach(s => {
    const el = $(s, scope);
    if (el) el.href = wa('Hola RM, quiero hacerles una consulta sobre una cabina.');
  });
  $$('[data-goquote]', scope).forEach(b => b.onclick = () => {
    const v = b.dataset.goquote;
    if (v) { Q.d.rubro = v === 'Lavaderos' ? 'Lavadero' : v === 'Lubricentros' ? 'Lubricentro' : v === 'Concesionarias' ? 'Concesionaria' : v; Q.i = 1; }
    go('/presupuesto');
  });
  $$('[data-goquotemodel]', scope).forEach(b => b.onclick = () => {
    const m = DATA.modelos.find(x => x.slug === b.dataset.goquotemodel);
    Q.d.modelo = m ? m.n : ''; go('/presupuesto');
  });
  /* El lightbox abre la variante más grande que exista de esa foto, en AVIF
     (pesa ~45% menos). Un <img> suelto no negocia formato, así que si el
     navegador no lo soporta cae al JPEG por onerror. */
  $$('[data-img]', scope).forEach(f => f.onclick = () => {
    const k = f.dataset.img, p = IMG[k];
    if (!p) return;
    const base = `/img/${k}-${p.ws[p.ws.length - 1]}`;
    openLbx(base + '.avif', p.alt, base + '.jpg');
  });
  /* Todos los enlaces de WhatsApp (globales y de la vista) con el mensaje
     que corresponde: contexto en la home, saludo en el resto. */
  refreshWA();
}

/* Cursor de producto: sólo sobre fotografía, sólo en desktop con mouse */
let CUR;
function bindCursor(scope) {
  if (RM_REDUCE || matchMedia('(pointer:coarse)').matches) return;
  if (!CUR) { CUR = document.createElement('div'); CUR.className = 'cur'; document.body.appendChild(CUR); }
  $$('[data-cur]', scope).forEach(el => {
    el.onpointerenter = e => { if (e.pointerType !== 'mouse') return; CUR.textContent = el.dataset.cur; CUR.classList.add('on'); };
    el.onpointerleave = () => CUR.classList.remove('on');
    el.onpointermove = e => { CUR.style.left = e.clientX + 'px'; CUR.style.top = e.clientY + 'px'; };
  });
}

/* El header sabe en qué lámina del proyecto estás */
let SPY = null;
function bindSpy(root) {
  const ctx = $('#hdCtx'); if (!ctx) return;
  SPY && SPY.disconnect();
  const secs = $$('[data-lam]', root);
  if (!secs.length) { ctx.innerHTML = ''; return; }
  ctx.innerHTML = '<b>Lám 01</b>Portada';
  SPY = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const s = e.target;
      ctx.innerHTML = `<b>Lám ${s.dataset.lam}</b>${s.dataset.name}`;
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => SPY.observe(s));
}

/* Cursor CAD dentro del esquema isométrico */
function bindIsoCross(root) {
  const w = $('.iso-wrap', root); if (!w) return;
  const h = $('.xh.h', w), v = $('.xh.v', w);
  w.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = w.getBoundingClientRect();
    h.style.top = (e.clientY - r.top) + 'px';
    v.style.left = (e.clientX - r.left) + 'px';
  });
}

function bindV2(root) {
  bindSpy(root); bindIsoCross(root);
  bindBands(root); bindScroll(root);
  bindTabs(root); bindCTAs(root); bindCursor(root);
  fabObservar(root); fab();
}

/* El router no conoce estos bindings: se enganchan al cambio de #main */
new MutationObserver(() => bindV2($('#main'))).observe($('#main'), { childList: true });

/* ── ARRANQUE ───────────────────────────────────────────────── */
addEventListener('popstate', render);
addEventListener('hashchange', () => {         // sólo llegan los #/… viejos
  if (location.hash.startsWith('#/')) render();
});
render();
bindV2($('#main'));
