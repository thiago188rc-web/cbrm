/* ═══════════════════════════════════════════════════════════════
   FOTOGRAFÍA — inventario de lo que RM tiene, y de lo que prueba.

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
    cap: 'Terminación blanca · cielorraso luminoso',
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
    cap: 'Terminación negra · barras retroiluminadas',
    prueba: ['terminacion-negra', 'chapa-nervada', 'retroiluminada', 'rasante', 'accesorios', 'franja-piso', 'piso-modular']
  },
  negraBajo: {
    ws: [420, 640, 860], w: 860, h: 1139,
    alt: 'Cabina RM negra vista desde el piso: techo cerrado de chapa nervada con luminarias embutidas y enrollador de manguera sobre la pared',
    cap: 'Terminación negra · techo cerrado',
    prueba: ['terminacion-negra', 'techo-chapa', 'cenital', 'accesorios', 'enrollador']
  },
  moto: {
    ws: [420, 640, 860], w: 860, h: 1140,
    alt: 'Moto BMW dentro de una cabina RM de terminación blanca con cielorraso modular de paneles LED y enrollador de manguera',
    cap: 'Cabina para moto · cielorraso de paneles LED',
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
    cap: 'Techo de chapa con luces embutidas',
    prueba: ['techo-chapa', 'cenital', 'terminacion-negra', 'accesorios']
  }
};

/* El isotipo. No es fotografía: se usa como marca, no como prueba.
   Se sirve a 128 px porque se muestra a 38-44 px: la variante grande
   pesaba más que la foto del hero para no verse mejor. */
window.RM_LOGO = '/img/logo-128.png';
