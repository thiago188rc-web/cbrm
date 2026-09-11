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
  /* Componentes verificados en las fotografías del cliente. */
  sistema: [
    { k: 'paredes', t: 'Paredes', d: 'Chapa nervada vertical de piso a techo, en las cuatro caras. Terminación negra o blanca.', dot: [172, 246] },
    { k: 'techo', t: 'Techo', d: 'Cerrado, no abierto al galpón. Tres sistemas distintos según el modelo: chapa con spots, cielorraso luminoso o cielorraso con paneles LED.', dot: [352, 112] },
    { k: 'luz', t: 'Iluminación', d: 'En capas: cenital para trabajar, rasante sobre las paredes para leer la pintura, y barras retroiluminadas para presentar el vehículo.', dot: [266, 150], lead: 56 },
    { k: 'piso', t: 'Piso', d: 'Baldosa modular encastrable, con franja perimetral en el color que elijas.', dot: [352, 358] },
    { k: 'electricidad', t: 'Instalación eléctrica', d: 'Tomacorrientes y cajas integrados en los paneles. La cabina llega con la electricidad resuelta.', dot: [172, 330], lead: 40 },
    { k: 'accesorios', t: 'Accesorios', d: 'Enrollador de manguera, organizadores de producto y porta-herramientas montados sobre la pared.', dot: [524, 224] }
  ],

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
      sol: 'Un box cerrado con iluminación en capas: cenital para trabajar, rasante para leer la pintura, retroiluminada para presentar. El mismo espacio te sirve para corregir y para fotografiar.',
      pts: ['Luz rasante sobre las paredes para detectar defectos', 'Ambiente cerrado: sin polvo, sin viento, sin sol directo', 'Organizadores de producto y enrollador sobre la pared', 'Terminación negra: el reflejo se lee limpio'],
      /* Los cuatro puntos de arriba se ven en esta foto: rasante, retroiluminada,
         organizadores sobre la pared y terminación negra. */
      foto: 'negra-wide', fotoCap: 'Cabina entregada · terminación negra, barras retroiluminadas y organizadores de pared',
      rec: 'trabajo', term: 'Negra',
      faq: ['luz', 'techo', 'entra', 'arma'],
      seoD: 'Cabinas cerradas para detailing con iluminación en capas: cenital, rasante para leer la pintura y barras retroiluminadas para presentar el vehículo. Terminación negra o blanca. Se arman sin obra adentro de tu local.'
    },
    {
      slug: 'lavaderos', n: 'Lavaderos', qRubro: 'Lavadero',
      h1: 'Cabinas para lavaderos',
      claim: 'Que la lluvia deje de manejarte la agenda.',
      prob: 'Trabajás a la intemperie o semicubierto. El viento, la lluvia y el sol te definen el día. Y el local no acompaña al precio que querés cobrar.',
      sol: 'Un box cerrado que te deja trabajar todo el año y te habilita a ofrecer un servicio premium separado del lavado común.',
      pts: ['Ambiente cerrado, todo el año', 'Piso modular con franja perimetral', 'Terminación blanca: más luz con menos consumo', 'Un sector diferenciado dentro del mismo local'],
      foto: 'blanca-wide', fotoCap: 'Cabina entregada · terminación blanca, piso modular y franja perimetral',
      rec: 'compacta', term: 'Blanca',
      faq: ['agua', 'material', 'entra', 'envio'],
      seoD: 'Cabinas desarmables para lavaderos de autos: box cerrado para trabajar todo el año, terminación blanca, piso modular con franja perimetral. Se montan adentro del local que ya tenés.'
    },
    {
      slug: 'lubricentros', n: 'Lubricentros', qRubro: 'Lubricentro',
      h1: 'Cabinas para lubricentros',
      claim: 'Separá el sector limpio sin cerrar por obra.',
      prob: 'Tenés el sector sucio y el sector limpio mezclados en el mismo espacio, y la imagen del local no acompaña al servicio que das.',
      sol: 'Armás un box limpio y presentable adentro del taller que ya tenés, sin albañiles, sin escombros y sin cortar la operación.',
      pts: ['Se arma adentro del local existente', 'Delimita un sector propio dentro del galpón', 'Sin obra húmeda ni escombros', 'Se desarma si mudás el negocio'],
      foto: 'negraBajo-wide', fotoCap: 'Cabina entregada · techo cerrado de chapa nervada con luminarias embutidas',
      rec: 'compacta', term: 'Blanca',
      faq: ['arma', 'entra', 'obra', 'envio'],
      seoD: 'Cabinas desarmables para lubricentros: delimitá un sector limpio adentro del taller, sin obra húmeda ni escombros. Techo cerrado, iluminación e instalación eléctrica incluidas.'
    },
    {
      slug: 'concesionarias', n: 'Concesionarias', qRubro: 'Concesionaria',
      h1: 'Cabinas para concesionarias',
      claim: 'Todas las unidades, con la misma foto.',
      prob: 'Cada unidad que ingresa hay que fotografiarla, y cada foto sale distinta según dónde estaba parada y a qué hora se tomó. El resultado es una publicación despareja.',
      sol: 'Un set fijo dentro de tu propio local: mismo fondo, misma luz, mismo encuadre para toda la flota. Y un espacio de entrega que se siente distinto.',
      pts: ['Fondo y luz constantes en todas las publicaciones', 'Sirve para autos y para motos', 'Espacio de entrega de unidad', 'Se puede aplicar la marca de la agencia adentro'],
      /* Esta foto ES una foto de producto tomada adentro de la cabina:
         es la prueba literal del argumento del rubro. */
      foto: 'hero-wide', fotoCap: 'Unidad fotografiada adentro de una cabina RM: mismo fondo y misma luz en cada toma',
      rec: 'trabajo', term: 'Blanca',
      faq: ['techo', 'marca', 'entra', 'envio'],
      seoD: 'Cabinas para concesionarias: un set fijo adentro de tu local para fotografiar toda la flota con el mismo fondo y la misma luz, y para entregar la unidad. Sirve para autos y motos.'
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

  /* El epígrafe visible es corto. La descripción completa vive en el alt,
     que es donde le sirve a un lector de pantalla y a Google. */
  trabajos: [
    { img: 'hero', cap: 'Terminación blanca', alt: 'Auto dentro de una cabina RM de terminación blanca, con cielorraso luminoso y piso modular' },
    { img: 'negraBajo', cap: 'Terminación negra', alt: 'Interior de cabina RM en terminación negra, con cielorraso de chapa nervada y luminarias embutidas' },
    { img: 'blanca', cap: 'Terminación blanca', alt: 'Cabina RM de terminación blanca vacía, con piso modular y franja perimetral amarilla' },
    { img: 'negraFrente', cap: 'Terminación negra', alt: 'Interior de cabina RM en terminación negra con barras retroiluminadas y franja de piso magenta' },
    { img: 'moto', cap: 'Cabina para moto', alt: 'Moto dentro de una cabina RM de terminación blanca con cielorraso de paneles LED' }
  ],

  faq: {
    entra: ['¿Cómo sé si me entra en el espacio que tengo?', 'Medí tres cosas: ancho, largo y <b>alto libre</b> (hasta lo más bajo que haya: una viga, un caño o una luminaria). Con esas tres te decimos qué modelo entra. Podés usar el medidor de la home y te llega el resultado ya cargado en la consulta.'],
    luz: ['¿Cómo es la iluminación?', 'Trabaja en capas: luces cenitales en el techo para iluminación general, luces rasantes sobre las paredes para leer la pintura, y barras retroiluminadas para presentar el vehículo. El detalle técnico de cada equipo lo confirmamos por WhatsApp.'],
    techo: ['¿Puedo elegir el tipo de techo?', 'En las cabinas ya entregadas hay tres sistemas distintos: chapa con spots embutidos, cielorraso luminoso translúcido y cielorraso modular con paneles LED. Si son intercambiables en todos los modelos y cómo impacta en el presupuesto, lo confirmamos en la consulta.'],
    arma: ['¿Cuánto tarda el armado y quién la arma?', 'Es un sistema desarmable: se monta adentro del local que ya tenés, sin obra húmeda ni escombros. Los tiempos exactos y si el armado va incluido son datos que estamos terminando de definir para publicar.'],
    obra: ['¿Tengo que hacer obra o pedir permiso?', 'La cabina se arma sobre el piso existente y no requiere obra húmeda. Cualquier requisito municipal depende de tu localidad y de tu habilitación: no damos una respuesta general para no decir algo que no corresponda a tu caso.'],
    material: ['¿De qué material son los paneles?', 'Chapa nervada. El espesor y la terminación exacta los confirmamos en la consulta, junto con el modelo que te corresponde.'],
    agua: ['¿Aguanta un lavadero, con agua todos los días?', 'Es la pregunta correcta para este rubro y merece una respuesta precisa, no un “sí” genérico: te la contestamos por WhatsApp con el detalle de material y mantenimiento según cómo trabajes.'],
    marca: ['¿Le puedo poner la marca de mi negocio adentro?', 'Hay cabinas entregadas con cartelería propia del cliente montada sobre la pared del fondo. El alcance de la personalización lo vemos según el proyecto.'],
    envio: ['¿Hacen envíos? ¿A qué zonas?', 'Fabricamos en Puerto General San Martín, Santa Fe. Las zonas de envío y el costo del flete los confirmamos según tu localidad: por eso te la pedimos en la consulta.'],
    precio: ['¿Cuánto sale?', 'Depende del modelo, de la medida y de la terminación. No publicamos una lista porque cada espacio es distinto: contanos cuánto medís y te pasamos el presupuesto de tu caso.'],
    pago: ['¿Cómo se paga?', 'Las condiciones de pago las coordinamos en la consulta. Es información que preferimos darte por escrito y de forma clara antes de que decidas.'],
    garantia: ['¿Tiene garantía?', 'El alcance de la garantía es un dato que estamos terminando de definir para publicarlo. Preguntalo en la consulta y te lo damos por escrito.'],
    motos: ['¿Sirve para motos?', 'Sí. Hay cabinas entregadas trabajando con motos, con cielorraso modular y piso encastrable.']
  },
  faqHome: ['precio', 'entra', 'techo', 'luz', 'arma', 'material', 'envio', 'pago', 'garantia', 'motos']
};

/* Prefill compartido entre el medidor, las páginas de rubro y el cotizador */
const PRE = { rubro: '', vehiculo: '', ancho: '', largo: '', alto: '', modelo: '' };

/* ── UI base ────────────────────────────────────────────────── */
const HOLA = 'Hola RM, quiero hacerles una consulta sobre una cabina.';
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
};
const closeMob = () => { mob.classList.remove('on'); burger.classList.remove('x'); document.body.style.overflow = ''; };
$$('#mob a').forEach(a => a.onclick = closeMob);

addEventListener('scroll', () => {
  const y = scrollY;
  $('#hd').classList.toggle('on', y > 40);
  const verFab = y > innerHeight * 0.35 && !location.pathname.startsWith('/panel');
  $('#fab').classList.toggle('on', verFab);
  /* La barra fija mide ~72px: sin este espacio tapa el final de la página. */
  document.body.classList.toggle('has-fab', verFab);
}, { passive: true });

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
    <text x="${W / 2}" y="${H - 14}" text-anchor="middle" class="mp-s">PLANTA A ESCALA · MEDIDAS SEGÚN TU LOCAL</text>
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

/* ── ESQUEMA ISOMÉTRICO (construido a partir del pictograma del logo) ── */
function isoSVG() {
  const F = [120, 60, 580, 400], B = [262, 148, 442, 312];
  const p = (x, y) => `${x} ${y}`;
  const paths = [
    `M${p(F[0], F[1])} L${p(F[2], F[1])} L${p(F[2], F[3])} L${p(F[0], F[3])} Z`,
    `M${p(B[0], B[1])} L${p(B[2], B[1])} L${p(B[2], B[3])} L${p(B[0], B[3])} Z`,
    `M${p(F[0], F[1])} L${p(B[0], B[1])}`, `M${p(F[2], F[1])} L${p(B[2], B[1])}`,
    `M${p(F[0], F[3])} L${p(B[0], B[3])}`, `M${p(F[2], F[3])} L${p(B[2], B[3])}`,
    /* luminarias del techo */
    `M${p(200, 96)} L${p(295, 160)}`, `M${p(350, 78)} L${p(350, 148)}`, `M${p(500, 96)} L${p(408, 160)}`,
    /* despiece del piso */
    `M${p(180, 400)} L${p(292, 312)}`, `M${p(350, 400)} L${p(350, 312)}`, `M${p(520, 400)} L${p(412, 312)}`,
    /* nervadura de la pared del fondo */
    `M${p(300, 148)} L${p(300, 312)}`, `M${p(330, 148)} L${p(330, 312)}`,
    `M${p(372, 148)} L${p(372, 312)}`, `M${p(404, 148)} L${p(404, 312)}`
  ];
  const dots = DATA.sistema.map((s, i) => {
    const L = s.lead || 26;                 // guía más larga donde los rótulos se pisarían
    return `
    <g class="hot" data-i="${i}" tabindex="0" role="button" aria-label="${s.t}">
      <line x1="${s.dot[0]}" y1="${s.dot[1]}" x2="${s.dot[0]}" y2="${s.dot[1] - L}"></line>
      <circle class="hit" cx="${s.dot[0]}" cy="${s.dot[1]}" r="22"></circle>
      <circle class="dot" cx="${s.dot[0]}" cy="${s.dot[1]}" r="5.5"></circle>
      <text x="${s.dot[0]}" y="${s.dot[1] - L - 7}" text-anchor="middle">${s.t}</text>
    </g>`;
  }).join('');

  /* Planos con relleno: sin esto el dibujo son cuatro líneas sueltas y se
     lee como un marco vacío, no como el interior de una cabina. Los tonos
     imitan cómo cae la luz en las fotos — techo y fondo más claros que las
     paredes laterales, piso apenas insinuado. */
  const planos = `
    <polygon class="pl pl-techo" points="${F[0]},${F[1]} ${B[0]},${B[1]} ${B[2]},${B[1]} ${F[2]},${F[1]}"/>
    <polygon class="pl pl-izq"   points="${F[0]},${F[1]} ${B[0]},${B[1]} ${B[0]},${B[3]} ${F[0]},${F[3]}"/>
    <polygon class="pl pl-der"   points="${F[2]},${F[1]} ${B[2]},${B[1]} ${B[2]},${B[3]} ${F[2]},${F[3]}"/>
    <polygon class="pl pl-piso"  points="${F[0]},${F[3]} ${B[0]},${B[3]} ${B[2]},${B[3]} ${F[2]},${F[3]}"/>
    <rect class="pl pl-fondo" x="${B[0]}" y="${B[1]}" width="${B[2] - B[0]}" height="${B[3] - B[1]}"/>`;

  return `<svg class="iso" id="iso" viewBox="0 0 700 440" role="img"
      aria-label="Esquema del interior de una cabina RM: paredes, techo, iluminación, piso, instalación eléctrica y accesorios.">
    ${planos}
    <g>${paths.map(d => `<path class="stroke" d="${d}"/>`).join('')}</g>${dots}</svg>`;
}

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

/* ── MEDIDOR DE ESPACIO ─────────────────────────────────────── */
const VEH = {
  Moto: { l: 2.2, a: 0.9, n: 'una moto' },
  Auto: { l: 4.4, a: 1.8, n: 'un auto mediano' },
  Camioneta: { l: 5.4, a: 2.0, n: 'una camioneta' }
};
function fitBlock() {
  return `
  <div class="fit">
    <div class="rv">
      <div class="opts" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
        ${Object.keys(VEH).map((k, i) => `
          <button class="opt${i === 1 ? ' sel' : ''}" data-veh="${k}" style="justify-content:center;min-height:48px;font-size:14px">${k}</button>`).join('')}
      </div>
      <div class="fit-in">
        ${[['ancho', 'Ancho'], ['largo', 'Largo'], ['alto', 'Alto libre']].map(f => `
          <div class="f-fld"><label for="f-${f[0]}">${f[1]} (m)</label>
            <input id="f-${f[0]}" data-f="${f[0]}" type="text" inputmode="decimal" placeholder="0,00"></div>`).join('')}
      </div>
      <p class="mono" style="margin-top:12px;line-height:1.7">El alto libre es hasta lo más bajo:<br>viga, caño o luminaria.</p>
      <div class="verdict" id="verdict" style="display:none"></div>
      <div style="margin-top:20px"><button class="btn btn-p" id="fitGo" style="display:none"><span>Cotizar con estas medidas</span></button></div>
    </div>
    <div class="plan rv-i" id="planWrap">${planSVG(null)}</div>
  </div>`;
}
function planSVG(st) {
  if (!st) return `<svg viewBox="0 0 640 400"><rect width="640" height="400" fill="none"/>
    <text x="320" y="196" text-anchor="middle" fill="#4A4E54" font-family="Azeret Mono,monospace" font-size="12" letter-spacing="1.4">CARGÁ TU ESPACIO</text>
    <text x="320" y="220" text-anchor="middle" fill="#33373C" font-family="Azeret Mono,monospace" font-size="10" letter-spacing="1.2">EL PLANO SE DIBUJA SOLO</text></svg>`;
  const { W, L, v } = st, pad = 54, w = 640, h = 400;
  const sc = Math.min((w - pad * 2) / W, (h - pad * 2) / L);
  const bw = W * sc, bl = L * sc, x0 = (w - bw) / 2, y0 = (h - bl) / 2;
  const cw = v.a * sc, cl = v.l * sc, cx = (w - cw) / 2, cy = (h - cl) / 2;
  const fits = v.a < W && v.l < L;
  const col = fits ? '#FFC800' : '#FF6B4A';
  return `<svg viewBox="0 0 640 400" role="img" aria-label="Plano a escala de tu espacio con el vehículo adentro">
    <defs><pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#1D2023" stroke-width="3"/></pattern></defs>
    <rect x="${x0}" y="${y0}" width="${bw}" height="${bl}" fill="url(#hatch)" stroke="${col}" stroke-width="1.5"/>
    ${fits ? `<rect x="${cx}" y="${cy}" width="${cw}" height="${cl}" rx="${cw * .12}" fill="#101315" stroke="#5C6167" stroke-width="1.2"/>
      <text x="${w / 2}" y="${cy + cl / 2 + 4}" text-anchor="middle" fill="#6E747B" font-family="Azeret Mono,monospace" font-size="10" letter-spacing="1.2">${v.n.toUpperCase()}</text>
      <line x1="${x0}" y1="${cy + cl / 2}" x2="${cx}" y2="${cy + cl / 2}" stroke="${col}" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="${cx + cw}" y1="${cy + cl / 2}" x2="${x0 + bw}" y2="${cy + cl / 2}" stroke="${col}" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="${(x0 + cx) / 2}" y="${cy + cl / 2 - 9}" text-anchor="middle" fill="${col}" font-family="Azeret Mono,monospace" font-size="10">${dec((W - v.a) / 2)}</text>
      <text x="${(cx + cw + x0 + bw) / 2}" y="${cy + cl / 2 - 9}" text-anchor="middle" fill="${col}" font-family="Azeret Mono,monospace" font-size="10">${dec((W - v.a) / 2)}</text>`
      : `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="#FF6B4A" font-family="Azeret Mono,monospace" font-size="11" letter-spacing="1.3">NO ENTRA EL VEHÍCULO ELEGIDO</text>`}
    <text x="${x0 + bw / 2}" y="${y0 - 16}" text-anchor="middle" fill="#8A9098" font-family="Azeret Mono,monospace" font-size="11">${dec(W)} m</text>
    <text x="${x0 - 16}" y="${y0 + bl / 2}" text-anchor="middle" fill="#8A9098" font-family="Azeret Mono,monospace" font-size="11" transform="rotate(-90 ${x0 - 16} ${y0 + bl / 2})">${dec(L)} m</text>
  </svg>`;
}
function bindFit(root) {
  const wrap = $('#planWrap', root); if (!wrap) return;
  let veh = 'Auto';
  const num = s => { const n = parseFloat(String(s).replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
  const val = f => num($(`[data-f="${f}"]`, root).value);
  const upd = () => {
    const W = val('ancho'), L = val('largo'), A = val('alto'), v = VEH[veh];
    const vd = $('#verdict', root), btnGo = $('#fitGo', root);
    if (!W || !L) { wrap.innerHTML = planSVG(null); vd.style.display = 'none'; btnGo.style.display = 'none'; return; }
    wrap.innerHTML = planSVG({ W, L, v });
    const fits = v.a < W && v.l < L;
    const mL = ((W - v.a) / 2), mF = ((L - v.l) / 2);
    vd.style.display = 'block';
    vd.classList.toggle('warn', !fits);
    vd.innerHTML = fits
      ? `<p style="color:var(--txt);max-width:46ch"><b>Entra ${v.n}.</b> Te quedan <b class="num">${dec(mL)} m</b> de cada lado y <b class="num">${dec(mF)} m</b> adelante y atrás para trabajar alrededor.
         ${A ? `Alto libre declarado: <b class="num">${dec(A)} m</b>.` : 'Falta el alto libre.'}</p>
         <p class="mono" style="margin-top:9px;line-height:1.7">Referencia: ${v.n}, ${v.l} × ${v.a} m.<br>El modelo que corresponde lo confirma RM.</p>`
      : `<p style="color:var(--txt);max-width:46ch"><b>Con esas medidas no entra ${v.n}.</b> Puede que sí entre otro vehículo, o que convenga una cabina a medida. Mandanos las medidas igual y lo vemos.</p>`;
    btnGo.style.display = 'inline-flex';
    btnGo.onclick = () => {
      PRE.vehiculo = veh === 'Moto' ? 'Una moto' : veh === 'Camioneta' ? 'Una camioneta' : 'Un auto';
      PRE.ancho = dec(W); PRE.largo = dec(L); PRE.alto = A ? dec(A) : '';
      go('/presupuesto');
    };
  };
  $$('[data-veh]', root).forEach(b => b.onclick = () => {
    veh = b.dataset.veh;
    $$('[data-veh]', root).forEach(o => o.classList.toggle('sel', o === b));
    upd();
  });
  $$('[data-f]', root).forEach(i => i.oninput = upd);
}

/* ── VISTA: RUBRO ───────────────────────────────────────────── */
function viewRubro(slug) {
  const r = DATA.rubros.find(x => x.slug === slug); if (!r) return view404();
  const m = DATA.modelos.find(x => x.slug === r.rec);
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
        <a class="btn btn-g" href="${urlModelo(m)}">Ver el modelo recomendado</a>
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

  <section class="sec paper">
    <div class="wrap">
      <div class="sec-head rv">
        <span class="mono">Configuración recomendada</span>
        <h2 class="d2">Para ${r.n.toLowerCase()} solemos ir por acá</h2>
        <p class="lede" style="color:#4A4D46">Es un punto de partida, no una regla. La medida final sale de tu espacio.</p>
      </div>
      <div class="sel-body rv">
        <div>${modeloPlan(m, 'light')}</div>
        <div class="sel-copy">
          <h3 class="d2">${m.n}</h3>
          <p class="lede" style="color:#4A4D46;margin-top:10px">${m.qe}</p>
          <dl class="spec">
            <dt>Entra</dt><dd>${m.veh}</dd>
            <dt>Terminación</dt><dd>${r.term}</dd>
            <dt>Techo</dt><dd>Cerrado, con iluminación</dd>
            <dt>Piso</dt><dd>Modular, franja a elección</dd>
            <dt>Medidas</dt><dd>Se define con las de tu local</dd>
          </dl>
          <div class="sel-actions">
            <a class="btn btn-g" href="${urlModelo(m)}">Ver ficha completa</a>
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

function viewModelo(slug) {
  const m = DATA.modelos.find(x => x.slug === slug); if (!m) return view404();
  meta({
    u: urlModelo(m),
    t: `${m.n} | Cabinas Desarmables RM`,
    d: `${m.n}: ${m.qe} Cabina desarmable con paredes de chapa nervada, techo cerrado, iluminación e instalación eléctrica. Se arma adentro de tu local, sin obra.`
  });
  const inc = [['Paredes de chapa nervada', 1], ['Techo cerrado', 1], ['Iluminación', 1], ['Instalación eléctrica', 1], ['Piso modular', 0], ['Accesorios de pared', 0]];
  const rubrosDe = DATA.rubros.filter(r => r.rec === m.slug);
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
            ${[['Entra', m.veh], ['Terminación', 'Negra o blanca'], ['Techo', 'Cerrado, con iluminación'],
      ['Piso', 'Modular, franja a elección'], ['Medidas', 'Se define con las de tu local ' + TBD('Tabla por publicar')]]
      .map(f => `<dt class="mono" style="padding-top:2px">${f[0]}</dt><dd>${f[1]}</dd>`).join('')}
          </dl>

          <h2 class="mono am" style="margin:30px 0 10px">Qué incluye</h2>
          <div style="border-top:1px solid var(--line-2)">
            ${inc.map(i => `<div style="display:grid;grid-template-columns:16px 1fr auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--line-2);font-size:15px">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${i[1] ? '#FFC800' : '#4A4E54'}" stroke-width="2.2"><path d="M4 12.5 9.5 18 20 6.5"/></svg>
              <span style="color:${i[1] ? 'var(--txt)' : 'var(--mut)'}">${i[0]}</span>
              ${i[1] ? '' : TBD('¿Incluido?')}</div>`).join('')}
          </div>

          <h2 class="mono am" style="margin:30px 0 10px">Configuración</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['Negra', 'Blanca'].map(t => `<span class="opt" style="min-height:0;padding:8px 14px;font-size:13.5px">${t}</span>`).join('')}
            <span class="opt" style="min-height:0;padding:8px 14px;font-size:13.5px">Franja del piso a elección</span>
          </div>

          ${rubrosDe.length ? `<h2 class="mono am" style="margin:30px 0 10px">Recomendada para</h2>
            <div style="display:flex;gap:14px;flex-wrap:wrap">${rubrosDe.map(r => `<a class="btn-t" href="${urlRubro(r)}">${r.n}</a>`).join('')}</div>` : ''}

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
    d: 'Fotos de cabinas desarmables RM instaladas y funcionando: terminación negra y blanca, cielorraso luminoso, paneles LED, piso modular y organizadores de pared. Ninguna es un render.'
  });
  const cls = ['e-a', 'e-b', 'e-c', 'e-d', 'e-e'];
  return `<section class="sec" style="padding-top:calc(var(--head) + clamp(34px,6vh,76px))">
    <div class="wrap">
      <div class="sec-head rv">
        <nav class="crumb" aria-label="Migas"><a href="/">Inicio</a><span>/</span><b>Trabajos</b></nav>
        <span class="mono am">Trabajos</span>
        <h1 class="d1" style="font-size:clamp(34px,6vw,72px)">Cabinas entregadas</h1>
        <p class="lede">Cabinas de RM instaladas y funcionando. Ninguna es un render. No atribuimos rubro ni modelo donde no consta.</p>
      </div>
      <div class="edit rv">
        ${DATA.trabajos.map((t, i) => figura(t.img, {
      cls: cls[i], cap: t.cap, alt: t.alt,
      sizes: '(min-width:760px) 34vw, 92vw'
    })).join('')}
        <figure class="e-f">${resv('cabina instalada en un lavadero o un lubricentro', '3/4')}</figure>
      </div>
      <p class="quiet rv" style="margin-top:18px;line-height:1.9">Las cabinas entregadas son muchas más que estas cinco: el resto está en Instagram, donde publicamos cada una a medida que sale del taller.</p>
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
  d: { rubro: '', vehiculo: '', ancho: '', largo: '', alto: '', term: '', techo: '', nombre: '', tel: '', loc: '', msg: '', modelo: '' },
  steps: [
    { k: 'Paso 1 de 5', q: '¿Qué tenés?', f: 'rubro', o: ['Detailing', 'Lavadero', 'Lubricentro', 'Concesionaria', 'Cochera particular', 'Voy a abrir un negocio'] },
    { k: 'Paso 2 de 5', q: '¿Qué necesitás que entre?', f: 'vehiculo', o: ['Una moto', 'Un auto', 'Un auto con lugar para trabajar alrededor', 'Dos autos', 'Una camioneta', 'Todavía no sé'] },
    { k: 'Paso 3 de 5', q: '¿Cuánto espacio tenés?', f: 'medidas' },
    { k: 'Paso 4 de 5 · opcional', q: '¿Cómo te la imaginás?', f: 'pref' },
    { k: 'Paso 5 de 5', q: '¿Con quién hablamos?', f: 'contacto' }
  ]
};


/* Cada opción del paso 2 corresponde a un modelo del catálogo:
   así la consulta llega clasificada sin sumarle un paso al visitante. */
const VEH_MODELO = {
  'Una moto': 'Cabina moto',
  'Un auto': 'Cabina compacta',
  'Un auto con lugar para trabajar alrededor': 'Cabina de trabajo',
  'Dos autos': 'Cabina doble',
  'Una camioneta': 'A medida'
};
const modeloPorVehiculo = v => VEH_MODELO[v] || '';

function quoteMsg() {
  const d = Q.d, L = [];
  L.push('Hola RM, quiero cotizar una cabina.', '');
  L.push('▸ RUBRO: ' + (d.rubro || 'sin especificar'));
  L.push('▸ NECESITO QUE ENTRE: ' + (d.vehiculo || 'sin especificar'));
  const mod = d.modelo || modeloPorVehiculo(d.vehiculo);
  if (mod) L.push('▸ MODELO DE INTERÉS: ' + mod);
  L.push('▸ MI ESPACIO: ' + (d.ancho && d.largo
    ? `${d.ancho} ancho × ${d.largo} largo${d.alto ? ` × ${d.alto} alto libre` : ''} (m)`
    : 'todavía no lo medí'));
  if (d.term) L.push('▸ TERMINACIÓN: ' + d.term);
  if (d.techo) L.push('▸ TECHO: ' + d.techo);
  L.push('▸ LOCALIDAD: ' + d.loc);
  L.push('▸ NOMBRE: ' + d.nombre);
  /* El teléfono va escrito aunque WhatsApp ya identifique a quien manda:
     si la persona copia el mensaje y lo envía desde otro número, RM
     igual se queda con el de contacto. */
  if (d.tel) L.push('▸ TELÉFONO: ' + d.tel);
  if (d.msg.trim()) L.push('', 'Comentario: ' + d.msg.trim());
  L.push('', '—', 'Consulta enviada desde ' + SITE.replace(/^https?:\/\//, ''));
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
  const rows = [['Rubro', d.rubro], ['Entra', d.vehiculo],
  ['Modelo', d.modelo || modeloPorVehiculo(d.vehiculo)],
  ['Espacio', d.ancho && d.largo ? `${d.ancho} × ${d.largo}${d.alto ? ` × ${d.alto}` : ''} m` : 'Sin medir'],
  ['Terminación', d.term], ['Techo', d.techo], ['Localidad', d.loc], ['Nombre', d.nombre]]
    .filter(r => r[1]);
  return `
    <span class="q-k">Revisá antes de enviar</span>
    <h3 class="q-q">Esto le va a llegar a RM</h3>
    <div class="proj" style="margin-bottom:16px">
      <div class="proj-h"><b>Tu proyecto RM</b><span class="mono">Listo para enviar</span></div>
      <dl>${rows.map(r => `<div class="row"><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>
    </div>
    <div class="q-prev" id="qPrev">${quoteMsg().replace(/</g, '&lt;')}</div>
    <div class="q-nav">
      <button class="btn btn-g" data-nav="-1">Corregir</button><span class="sp"></span>
      <button class="btn btn-t" id="qCopy" style="margin-right:8px">Copiar mensaje</button>
      <button class="btn btn-p" id="qSend">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.5 7.3L3 20.5l1.8-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>
        <span>Enviar por WhatsApp</span></button>
    </div>`;
}
function quoteDone() {
  return `<div class="q-done">
    <div class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 12.5 9.5 18 20 6.5"/></svg></div>
    <h3 class="d3">Consulta enviada</h3>
    <p style="margin:12px auto 0">Se abrió WhatsApp con el mensaje escrito. Si no se abrió, copiá el texto y mandalo a ${TEL_HUMAN}.</p>
    <div class="hero-cta" style="justify-content:center;margin-top:24px">
      <a class="btn btn-g" href="/panel">Ver cómo le llega a RM</a>
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
    const send = $('#qSend', mnt);
    if (send) send.onclick = () => {
      const txt = quoteMsg();
      pushLead(Q.d, txt);
      window.open(wa(txt), '_blank', 'noopener');
      Q.i = 6; draw();
      const rs = $('#qReset', mnt);
      if (rs) rs.onclick = () => { Q.i = 0; Q.d = { ...Q.d, nombre: '', tel: '', msg: '' }; draw(); };
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
    modelo: d.modelo || modeloPorVehiculo(d.vehiculo)
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
      d: 'Fabricamos cabinas desarmables para detailing, lavaderos, lubricentros y concesionarias. Paredes, techo cerrado, iluminación en capas, piso modular e instalación eléctrica. Se arman adentro de tu local, sin obra. Puerto General San Martín, Santa Fe.'
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
      d: 'Contanos tu rubro, qué vehículo tiene que entrar y cuánto medís. Con eso te cotizamos la cabina que corresponde a tu espacio, en la primera respuesta.'
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
  $('#fab').classList.toggle('on', false);
  document.body.classList.remove('has-fab');

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
        <p class="lede">Cinco pasos, casi todo con el pulgar. Al final se abre WhatsApp con tu proyecto escrito, para que RM pueda cotizarte en la primera respuesta en vez de preguntarte ocho cosas.</p>
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

/* ── RUBROS: selector sin fotografía forzada ────────────────── */
function rubroSelector() {
  return `
  <div class="tabs" role="tablist" data-sel="rub">
    ${DATA.rubros.map((r, i) => `<button class="tab${i === 0 ? ' on' : ''}" role="tab" data-i="${i}"
      aria-selected="${i === 0}">${r.n}</button>`).join('')}
  </div>
  <div class="sel-body" data-selbody="rub" role="tabpanel">${rubroPane(0)}</div>`;
}
function rubroPane(i) {
  const r = DATA.rubros[i], m = DATA.modelos.find(x => x.slug === r.rec);
  return `
    <div>${fotoRubro(r, false)}</div>
    <div class="sel-copy">
      <span class="mono am">${r.n}</span>
      <h3 class="d2" style="margin:12px 0 16px">${r.claim}</h3>
      <p class="lede">${r.prob}</p>
      <p style="margin-top:14px;color:#C6C8C0;font-size:15.5px">${r.sol}</p>
      <div class="pts">${r.pts.map(p => `<div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFC800" stroke-width="2.4" style="margin-top:5px"><path d="M4 12.5 9.5 18 20 6.5"/></svg>
        <span>${p}</span></div>`).join('')}</div>
      <div class="sel-actions">
        <a class="btn btn-p" href="${urlRubro(r)}"><span>Ver esta solución</span></a>
        <button class="btn btn-g" data-goquote="${r.n}">Consultar por mi ${r.n.toLowerCase().replace(/s$/, '')}</button>
      </div>
      <p class="quiet" style="margin-top:16px">Modelo que solemos recomendar: <b style="color:var(--txt)">${m.n}</b></p>
    </div>`;
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
  const rub = DATA.rubros.filter(r => r.rec === m.slug);
  return `
    <div>${modeloPlan(m, 'light')}</div>
    <div class="sel-copy">
      <h3 class="d2">${m.n}</h3>
      <p class="lede" style="color:#4A4D46;margin-top:10px">${m.qe}</p>
      <dl class="spec">
        <dt>Entra</dt><dd>${m.veh}</dd>
        <dt>Terminación</dt><dd>Negra o blanca</dd>
        <dt>Techo</dt><dd>Cerrado, con iluminación</dd>
        <dt>Piso</dt><dd>Modular, franja a elección</dd>
        <dt>Eléctrica</dt><dd>Tomacorrientes integrados</dd>
        <dt>Medidas</dt><dd>Se define con las de tu local ${TBD('Tabla por publicar')}</dd>
      </dl>
      ${rub.length ? `<p class="quiet" style="margin-top:16px">Recomendada para ${rub.map(r => r.n.toLowerCase()).join(' y ')}.</p>` : ''}
      <div class="sel-actions">
        <button class="btn btn-p" data-goquotemodel="${m.slug}"><span>Consultar por este modelo</span></button>
        <a class="btn btn-g" href="${urlModelo(m)}">Ver ficha</a>
      </div>
    </div>`;
}

/* ── Muestras de material ─────────────────────────────────────────
   Antes esto eran rayas dibujadas con CSS. RM tiene fotografiadas las
   dos terminaciones y los tres techos: mostrar la chapa real en vez de
   una textura inventada es más honesto y además se ve el producto. */
const swatch = (name, lb, sub) => `
  <figure class="sw" data-img="${name}" data-cur="Ampliar">
    ${pic(name, { cls: 'fill', ratio: '3/2', sizes: '(min-width:820px) 30vw, 46vw' })}
    <figcaption><b>${lb}</b>${sub ? `<span>${sub}</span>` : ''}</figcaption>
  </figure>`;

/* Tres bandas apiladas en vez de tres columnas: cada opción tiene distinta
   cantidad de muestras (2 terminaciones, 3 techos, 2 colores) y en columnas
   quedaban alturas muy dispares, con dos columnas casi vacías. */
const cfgFila = (kicker, texto, cols, muestras) => `
  <div class="cfg-row">
    <div class="cfg-lb">
      <span class="mono am">${kicker}</span>
      <p class="quiet">${texto}</p>
    </div>
    <div class="cfg-sw" style="--cols:${cols}">${muestras}</div>
  </div>`;

const configBlock = () => `
  <div class="cfg-stack">
    ${cfgFila('Terminación',
  'La negra separa el vehículo del fondo. La blanca devuelve luz y rinde mejor en locales de techo bajo.', 2,
  swatch('negra-wide', 'Negra') + swatch('blanca-wide', 'Blanca'))}

    ${cfgFila('Techo',
  `Los tres sistemas están en cabinas entregadas: cada foto es uno de ellos. Si son intercambiables en todos los modelos, ${TBD()}.`, 3,
  swatch('negraBajo-wide', 'Chapa con luces embutidas')
  + swatch('hero-wide', 'Cielorraso luminoso')
  + swatch('moto', 'Cielorraso con paneles LED'))}

    ${cfgFila('Franja del piso',
  `Amarillo y magenta están vistos en cabinas entregadas. La carta completa de colores, ${TBD()}.`, 1,
  `<div class="sw-row">
        <span class="sw-dot" style="--c:#FFC800"><b>Amarillo</b></span>
        <span class="sw-dot" style="--c:#E0397E"><b>Magenta</b></span>
        <span class="sw-dot sw-more"><i>+</i><b>Otros a pedido</b></span>
      </div>`)}
  </div>`;


/* Cada sección termina en el paso lógico siguiente, no en el mismo botón */
const ctaBand = (kicker, text, btn) => `
  <div class="ctab rv"><div><span class="mono am">${kicker}</span><p class="d3">${text}</p></div>
  <div>${btn}</div></div>`;
const btnP = (label, href) => `<a class="btn btn-p" href="${href}"><span>${label}</span></a>`;
const btnQ = (label, rubro = '') => `<button class="btn btn-p" data-goquote="${rubro}"><span>${label}</span></button>`;

/* Empresa: dirección y horarios confirmados por el cliente */
function trustBlock() {
  const d = new Date(), dia = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
  const abierto = (dia >= 1 && dia <= 5 && h >= 9 && h < 17) || (dia === 6 && h >= 9 && h < 12);
  return `
  <div class="trust">
    <div class="rv">
      <a class="trow" href="${EMPRESA.maps}" target="_blank" rel="noopener">
        <span class="tlb">Taller</span>
        <span class="tval">${EMPRESA.calle}<small>${EMPRESA.ciudad}, ${EMPRESA.prov} · Cómo llegar</small></span></a>
      <a class="trow" id="trustWa" target="_blank" rel="noopener">
        <span class="tlb">WhatsApp</span><span class="tval">${TEL_HUMAN}<small>Es donde respondemos las consultas</small></span></a>
      <a class="trow" href="${IG}" target="_blank" rel="noopener">
        <span class="tlb">Instagram</span><span class="tval">@cabinasdesarmablesrm<small>Más de 6.900 seguidores. Ahí publicamos cada cabina que sale del taller</small></span></a>
      <div class="trow">
        <span class="tlb">Envíos</span><span class="tval">Coordinados según tu localidad<small>Fabricamos en Puerto General San Martín, en el cordón industrial del Gran Rosario. Zona y costo del flete: ${TBD('según localidad')}</small></span></div>
    </div>
    <div class="hours rv" data-d="1">
      <span class="now ${abierto ? '' : 'off'}"><i></i>${abierto ? 'Abierto ahora' : 'Cerrado ahora'}</span>
      ${EMPRESA.horarios.map(x => `<div class="hr ${x[2] ? '' : 'off'}"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}
      <p class="quiet" style="margin-top:16px">Si escribís fuera de horario, la consulta queda igual y te contestamos al abrir.</p>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   HOME
   ══════════════════════════════════════════════════════════════ */
function viewHome() {
  return `
  <section class="hero2">
    <div class="hero2-media"><div class="hero2-pan">${pic('hero', {
      cls: 'fill', eager: true,
      sizes: '(min-width:1000px) 54vw, 100vw',
      pos: '50% 42%'
    })}</div></div>
    <div class="hero2-copy wrap">
      <div class="hero2-eyebrow"><span class="mono">Fabricamos en Puerto Gral. San Martín, Santa Fe</span></div>
      <h1 class="d1"><span class="ln"><i>El auto entra</i></span><span class="ln"><i>a un galpón.</i></span><span class="ln"><i>Sale de un estudio.</i></span></h1>
      <p class="lede" style="margin-top:22px">Cabinas desarmables para detailing, lavaderos, lubricentros y concesionarias.
        Se arman adentro del local que ya tenés, sin obra. Y si te mudás, se van con vos.</p>
      <div class="hero-cta">
        <a class="btn btn-p" href="/presupuesto"><span>Pedir presupuesto</span></a>
        <a class="btn btn-g" href="/#sistema">Ver cómo funciona</a>
      </div>
      <div class="hero-meta">
        <div><span class="mono">Se entrega</span><b>Desarmada y embalada</b></div>
        <div><span class="mono">Se arma</span><b>Sin obra húmeda</b></div>
        <div><span class="mono">Sirve para</span><b>Autos y motos</b></div>
      </div>
    </div>
    <div class="hero2-seam"></div>
  </section>

  <section class="sec stmt" id="que-es" data-lam="02" data-name="Qué es RM">
    <div class="wrap">
      <div class="lam rv" style="margin-bottom:clamp(26px,4vh,44px)"><span class="no">Lám 02 / 11</span><span class="ln2"></span></div>
      <div class="stmt-grid">
        <h2 class="d2 rv">No es un cerramiento.<br>Es un espacio de trabajo.</h2>
        <div class="rv" data-d="1">
          <p style="font-size:clamp(16px,1.8vw,18.5px);color:#C6C8C0;max-width:50ch">Un herrero te hace una estructura y ahí termina. Una cabina RM llega con las cuatro paredes, el techo cerrado, la iluminación, el piso y los tomacorrientes ya resueltos.</p>
          <p style="margin-top:16px;max-width:50ch">Se monta adentro del galpón que ya tenés. Sin albañiles, sin escombros y sin cerrar el negocio mientras se arma. Y como es desarmable, si un día cambiás de local se desmonta y se va con vos.</p>
        </div>
      </div>
      <div class="stmt-row rv" data-d="2">
        ${[['Sin obra', 'Se apoya sobre el piso que ya tenés.'],
        ['Desarmable', 'Se desmonta y se traslada.'],
        ['Terminada', 'Llega con luz, piso y electricidad.']]
      .map(s => `<div><b class="d4">${s[0]}</b><span>${s[1]}</span></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="sec grid-bg" id="sistema" data-lam="03" data-name="Cómo funciona" style="border-top:1px solid var(--line)">
    <div class="wrap">
      ${secHead('Cómo funciona', 'Seis partes,<br>una sola entrega', 'Tocá cada parte del esquema. El dibujo sale del isotipo de la propia marca.', '03')}
      <div class="sys">
        <div class="rv-i iso-wrap">${isoSVG()}<span class="xh h"></span><span class="xh v"></span></div>
        <div class="sys-list rv">
          ${DATA.sistema.map((s, i) => `
            <div class="sys-item${i === 0 ? ' on' : ''}" data-i="${i}" role="button" tabindex="0">
              ${ico(s.k)}
              <div><h3 class="d4">${s.t}</h3><p>${s.d}</p></div>
            </div>`).join('')}
        </div>
      </div>

      <div class="sub-head rv"><span class="mono am">La luz</span>
        <h3 class="d3" style="margin-top:10px;max-width:22ch">Cuatro capas, cada una con una función distinta</h3></div>
      <div class="layers rv">
        ${[['Cenital', 'Embutida en el techo. Ilumina el vehículo entero sin que el operario se haga sombra encima del trabajo.'],
        ['Rasante', 'Spots sobre la pared que cruzan la pintura de costado. Hace aparecer los defectos que de frente no se ven.'],
        ['Retroiluminada', 'Barras que devuelven una línea limpia y continua sobre la chapa. Es la que hace la foto.'],
        ['Cielorraso luminoso', 'En las cabinas blancas el techo entero funciona como fuente de luz difusa.']]
      .map(l => `<div><b>${l[0]}</b><span>${l[1]}</span></div>`).join('')}
      </div>
      <p class="quiet rv" style="margin-top:14px">Marcas, potencias y cantidad de luminarias por modelo: ${TBD()}</p>

      <div class="sub-head rv"><span class="mono am">Configuración</span>
        <h3 class="d3" style="margin-top:10px;max-width:22ch">Lo que elegís vos</h3></div>
      <div class="rv">${configBlock()}</div>

      ${ctaBand('Siguiente paso', 'Si ya entendés cómo está hecha, lo que falta es tu espacio.',
        btnP('Ver si entra en mi local', '/#medir'))}
    </div>
  </section>

  <section class="sec" id="rubros" data-lam="04" data-name="Para quién" style="background:var(--ink-2);border-block:1px solid var(--line)">
    <div class="wrap">
      ${secHead('Para quién es', '¿Qué tenés?', 'Un detailing y un lavadero no tienen el mismo problema, ni necesitan la misma cabina. Elegí el tuyo.', '04')}
      <div class="rv">${rubroSelector()}</div>
    </div>
  </section>

  <section class="sec paper grid-bg" id="modelos" data-lam="05" data-name="Modelos">
    <div class="wrap">
      <div class="sec-head rv">
        <div class="lam"><span class="no">Lám 05 / 11</span><span class="ln2"></span></div>
        <span class="mono">Modelos</span>
        <h2 class="d2">Elegí por lo que tenés que meter adentro</h2>
        <p class="lede" style="color:#4A4D46">Las medidas de cada modelo están pendientes de confirmar con el taller. La ficha ya está armada para recibirlas sin tocar el diseño.</p>
      </div>
      <div class="rv">${modeloSelector()}</div>
      ${ctaBand('Ya sabés cuál te sirve', 'Pasanos las medidas de tu local y te decimos si ese modelo entra.',
        btnP('Configurar mi cabina', '/#configurar'))}
    </div>
  </section>

  <section class="sec grid-bg" id="medir" data-lam="06" data-name="Tu espacio">
    <div class="wrap">
      ${secHead('¿Entra en tu espacio?', 'Tres medidas y salís de la duda', 'Es la primera pregunta de todos y la que más tiempo consume por WhatsApp. Cargá tu espacio y te mostramos cómo queda el vehículo adentro, con el margen real de trabajo.', '06')}
      ${fitBlock()}
    </div>
  </section>

  <section class="sec" id="trabajos" data-lam="07" data-name="Trabajos" style="background:var(--ink-2);border-block:1px solid var(--line)">
    <div class="wrap">
      ${secHead('Trabajos reales', 'Cabinas instaladas', 'Fotos de cabinas de RM funcionando. Ninguna es un render.', '07')}
      <div class="edit rv">
        ${DATA.trabajos.slice(0, 5).map((t, i) => figura(t.img, {
        cls: ['e-a', 'e-b', 'e-c', 'e-d', 'e-e'][i], cap: t.cap, alt: t.alt,
        sizes: '(min-width:760px) 34vw, 92vw'
      })).join('')}
        <figure class="e-f ig-card">
          <a href="${IG}" target="_blank" rel="noopener">
            <span class="mono am">Instagram</span>
            <b class="d4">Publicamos cada cabina que sale del taller</b>
            <span class="ig-n"><b class="num">6.900+</b> seguidores</span>
            <span class="btn-t">@cabinasdesarmablesrm →</span>
          </a>
        </figure>
      </div>
      ${ctaBand('¿Te sirve algo así?', 'Contanos qué local tenés y te decimos qué cabina entra.',
        btnQ('Quiero una para mi local'))}
    </div>
  </section>

  <section class="moment" data-lam="M" data-name="La promesa">
    <div class="wrap moment-wrap">
      <div class="lam rv"><span class="no">El nombre es la promesa</span><span class="ln2"></span></div>
      <h2 class="d1 rv" data-d="1" style="margin-top:20px">
        Se arma.<br>Se desarma.<br><span class="dim">Se muda con tu negocio.</span></h2>
      <div class="cota am rv" data-d="2" style="max-width:520px"><b>De tu local de hoy al de mañana</b></div>
    </div>
  </section>

  <section class="sec" id="comprar" data-lam="08" data-name="Cómo se compra">
    <div class="wrap">
      ${secHead('Cómo se compra', 'De la consulta a la cabina armada', 'Comprás a distancia y querés saber cómo funciona. Los datos marcados los estamos terminando de confirmar con el taller.', '08')}
      <div class="steps rv">
        ${[['01', 'Presupuesto', 'Nos pasás rubro, medidas y localidad. Te cotizamos el modelo que corresponde a tu espacio.'],
        ['02', 'Fabricación', 'Se fabrica en Puerto General San Martín. Condiciones de pago y plazo: ' + TBD() + '.'],
        ['03', 'Envío', 'Llega desarmada y embalada a tu local. Zonas y costo de flete: ' + TBD() + '.'],
        ['04', 'Armado', 'Se monta adentro de tu local, sin obra húmeda. Tiempo y responsable del armado: ' + TBD() + '.']]
      .map(s => `<div class="step"><span class="k">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p></div>`).join('')}
      </div>
      <p class="rv" style="margin-top:20px;font-size:14.5px;max-width:58ch">Dejamos los huecos a la vista antes que publicar un plazo o una garantía que después no se cumpla. Todo lo marcado se responde por WhatsApp en el momento.</p>
      ${ctaBand('Empezá por acá', 'El presupuesto no compromete a nada y sale en la primera respuesta.',
        btnP('Pedir presupuesto', '/#configurar'))}
    </div>
  </section>

  <section class="sec" id="empresa" data-lam="09" data-name="La empresa" style="background:var(--ink-2);border-block:1px solid var(--line)">
    <div class="wrap">
      ${secHead('La empresa', 'Dónde estamos', 'Fabricamos en Puerto General San Martín, en el cordón industrial del Gran Rosario. El taller tiene dirección y horario: podés venir a verlo.', '09')}
      ${trustBlock()}
      ${ctaBand('¿Preferís hablar?', 'Escribinos y lo vemos por WhatsApp, sin pasar por el configurador.',
        `<a class="btn btn-g" id="empresaWa" target="_blank" rel="noopener">Escribir por WhatsApp</a>`)}
    </div>
  </section>

  <section class="sec">
    <div class="wrap">
      ${secHead('Preguntas', 'Lo que más nos preguntan', '', '10')}
      ${faqBlock(DATA.faqHome)}
      ${ctaBand('¿Falta la tuya?', 'Preguntala directo. Contestamos en el horario del taller.',
        btnQ('Hacer mi pregunta'))}
    </div>
  </section>

  <section class="sec" id="configurar" data-lam="11" data-name="Tu proyecto">
    <div class="lightband" style="top:0;transform:scaleY(-1)"></div>
    <div class="wrap" style="position:relative">
      ${secHead('Configurá tu cabina', 'Armá tu proyecto en 5 pasos', 'Contestá con el pulgar. Al final se abre WhatsApp con tu proyecto escrito, para que podamos cotizarte en la primera respuesta en vez de preguntarte ocho cosas.', '11')}
      <div class="need rv">
        ${[['Qué rubro tenés', 'Define el modelo y la terminación que solemos recomendar.'],
        ['Qué tiene que entrar', 'Un auto, dos, una moto o una camioneta. Define la medida mínima.'],
        ['Cuánto medís', 'Ancho, largo y alto libre. Es lo que nos permite cotizarte de una.']]
      .map(n => `<div><b>${n[0]}</b><span>${n[1]}</span></div>`).join('')}
      </div>
      <div id="quoteMount"></div>
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
        <span class="mono">Catálogo</span>
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
      <span class="n">${done ? '✓' : i + 1}</span><span>${['Rubro', 'Vehículo', 'Espacio', 'Estilo', 'Contacto'][i]}</span></button>`;
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
  else if (s.f === 'pref') body = `
      <span class="mono" style="display:block;margin-bottom:10px">Terminación</span>
      <div class="opts" style="grid-template-columns:repeat(3,1fr)">${['Negra', 'Blanca', 'Me da igual'].map(o => `
        <button class="opt${Q.d.term === o ? ' sel' : ''}" data-pref="term" data-v="${o}" style="justify-content:center;min-height:50px;font-size:14px">${o}</button>`).join('')}</div>
      <span class="mono" style="display:block;margin:24px 0 10px">Techo</span>
      <div class="opts">${['Chapa con spots', 'Cielorraso luminoso', 'Cielorraso con paneles LED', 'No sé, asesórenme'].map(o => `
        <button class="opt${Q.d.techo === o ? ' sel' : ''}" data-pref="techo" data-v="${o}" style="min-height:50px;font-size:14px"><span class="tick"></span><span>${o}</span></button>`).join('')}</div>`;
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
  ['Modelo', Q.d.modelo || modeloPorVehiculo(Q.d.vehiculo)],
  ['Tu espacio', Q.d.ancho && Q.d.largo ? `${Q.d.ancho} × ${Q.d.largo}${Q.d.alto ? ` × ${Q.d.alto}` : ''} m` : ''],
  ['Terminación', Q.d.term], ['Techo', Q.d.techo], ['Localidad', Q.d.loc]];

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
    const pane = key === 'rub' ? rubroPane : modeloPane;
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
