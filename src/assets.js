/* ═══════════════════════════════════════════════════════════════
   FOTOGRAFÍA — inventario de lo que RM tiene, y de lo que prueba.

   `cap` es el epígrafe visible: sólo la terminación. Techo, luces y
   accesorios que se ven en las fotos no figuran en las especificaciones
   de los packs, y un epígrafe los haría leer como incluidos. El detalle
   de lo que se ve queda en `alt`, que es una descripción de la imagen.

   Son cinco fotos reales de cabinas entregadas. No hay renders.
   Cada entrada declara QUÉ SE VE, porque de eso depende dónde se
   puede usar: una foto sirve para ilustrar un argumento sólo si el
   argumento se ve en la foto. Lo que no se ve, no se afirma.

   `w`/`h` son de la variante más grande — van al HTML para que el
   navegador reserve el espacio antes de descargar (evita saltos).
   `ws` son los anchos generados por tools/build-images.py.
   ═══════════════════════════════════════════════════════════════ */
window.RM_IMG = {

  /* ── Fotos completas, verticales ──────────────────────────── */
  hero: {
    ws: [420, 640, 860, 1080], w: 1080, h: 1431,
    alt: 'Auto rojo dentro de una cabina RM de terminación blanca, con cielorraso luminoso, franja de piso amarilla y piso modular',
    cap: 'Terminación blanca',
    prueba: ['terminacion-blanca', 'cielorraso-luminoso', 'franja-piso', 'piso-modular', 'auto', 'spots-pared']
  },
  blanca: {
    ws: [420, 640, 860], w: 860, h: 1146,
    alt: 'Cabina RM de terminación blanca vacía: pared de chapa nervada, spots de pared, franja perimetral amarilla y piso modular',
    cap: 'Terminación blanca · cabina vacía',
    prueba: ['terminacion-blanca', 'chapa-nervada', 'franja-piso', 'piso-modular', 'spots-pared', 'tomacorrientes']
  },
  negraFrente: {
    ws: [420, 640, 860], w: 860, h: 1139,
    alt: 'Interior de cabina RM en terminación negra, con barras retroiluminadas, spots rasantes, organizadores de producto y franja de piso magenta',
    cap: 'Terminación negra',
    prueba: ['terminacion-negra', 'chapa-nervada', 'retroiluminada', 'rasante', 'accesorios', 'franja-piso', 'piso-modular']
  },
  negraBajo: {
    ws: [420, 640, 860], w: 860, h: 1139,
    alt: 'Cabina RM negra vista desde el piso: techo cerrado de chapa nervada con luminarias embutidas y enrollador de manguera sobre la pared',
    cap: 'Terminación negra',
    prueba: ['terminacion-negra', 'techo-chapa', 'cenital', 'accesorios', 'enrollador']
  },
  moto: {
    ws: [420, 640, 860], w: 860, h: 1140,
    alt: 'Moto BMW dentro de una cabina RM de terminación blanca con cielorraso modular de paneles LED y enrollador de manguera',
    cap: 'Terminación blanca',
    prueba: ['moto', 'terminacion-blanca', 'cielorraso-led', 'chapa-nervada', 'enrollador', 'piso-modular']
  },

  /* ── Recortes apaisados ───────────────────────────────────────
     Salen de las mismas fotos. El sujeto es una habitación, así que
     el corte horizontal muestra la cabina entera mejor que el
     vertical. El motivo de cada encuadre está en build-images.py. */
  'hero-wide': {
    ws: [480, 640, 960, 1080], w: 1080, h: 540,
    alt: 'Frente de un auto rojo dentro de una cabina RM blanca, entre las dos franjas amarillas del piso',
    cap: 'Terminación blanca',
    prueba: ['terminacion-blanca', 'franja-piso', 'chapa-nervada', 'auto', 'spots-pared']
  },
  'blanca-wide': {
    ws: [480, 640, 826], w: 826, h: 550,
    alt: 'Cabina RM blanca completa: chapa nervada, spots de pared, tomacorrientes, franja amarilla y piso modular',
    cap: 'Terminación blanca',
    prueba: ['terminacion-blanca', 'chapa-nervada', 'franja-piso', 'piso-modular', 'spots-pared', 'tomacorrientes']
  },
  'negra-wide': {
    ws: [480, 640, 774], w: 774, h: 516,
    alt: 'Cabina RM negra completa: barras retroiluminadas, spots rasantes, organizadores de producto sobre la pared y franja de piso magenta',
    cap: 'Terminación negra',
    prueba: ['terminacion-negra', 'retroiluminada', 'rasante', 'accesorios', 'franja-piso', 'piso-modular']
  },
  'negraBajo-wide': {
    ws: [480, 640, 808], w: 808, h: 539,
    alt: 'Techo cerrado de una cabina RM negra: chapa nervada con luminarias embutidas en toda la superficie',
    cap: 'Terminación negra',
    prueba: ['techo-chapa', 'cenital', 'terminacion-negra', 'accesorios']
  },

  /* ── Portada de la home ───────────────────────────────────────
     Escena de referencia del rubro (un box de detailing). NO es una
     cabina entregada por RM ni un cliente: no lleva epígrafe, no va a
     la galería de trabajos y no prueba nada del producto. */
  'hero-detailing': {
    ws: [420, 640, 860, 1080, 1364], w: 1364, h: 1600,
    alt: 'Auto rojo estacionado en un box de detailing con paredes de chapa negra, luces en las paredes, estantes con productos de limpieza y piso encastrable con franja magenta',
    cap: '',
    prueba: []
  },

  /* ── Gráfica de envíos ────────────────────────────────────────
     Ilustración de RM, no fotografía: el camión con la marca. Se
     publica entera, aplanada sobre --ink (el fondo de #comprar); el
     «Envíos a todo el país» lo dice el título de la página. */
  'camion-rm': {
    ws: [480, 640, 960, 1280, 1600, 2115], w: 2115, h: 571,
    alt: 'Ilustración de un camión con semirremolque negro que lleva el logo de Cabinas Desarmables RM',
    cap: '',
    prueba: []
  }
};

/* El isotipo. No es fotografía: se usa como marca, no como prueba.
   Se sirve a 128 px porque se muestra a 38-44 px: la variante grande
   pesaba más que la foto del hero para no verse mejor. */
window.RM_LOGO = '/img/logo-128.png';
