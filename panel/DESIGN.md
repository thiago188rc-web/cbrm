# RM GROWTH OS — dirección visual

Herramienta interna de NEXA y RM. Se usa muchas horas, en escritorio para
trabajar y en el celular para consultar y cargar rápido. La dirección sale del
mundo de RM: un taller que fabrica módulos a medida, con planos, chapas y
fichas técnicas. No sale de una plantilla de administración.

## Concepto

> **El panel tiene que sentirse como el tablero del taller: cada consulta es
> una orden de trabajo que avanza por estaciones y lleva su procedencia
> estampada, como la chapa de identificación de un módulo.**

Por qué: el valor que NEXA tiene que demostrar es la *procedencia* de cada
venta. En un taller, lo que identifica una pieza es su chapa o ficha: número,
origen, quién la aprobó. Si el origen comercial se ve como un dato estampado
e inmutable, la atribución se vuelve algo que se puede auditar, no una
opinión. La web pública ya habla este idioma ("Lám 01 / 07", "orden de
consulta", franja de piso amarilla); el panel es su lado de taller.

Prueba: aplicado a un estudio de abogados o a una tienda de ropa, "estaciones
de taller y chapa de procedencia" no tiene sentido. Es específico.

## Elemento propio

**La ficha de procedencia.** Un bloque en Azeret Mono, con borde de 1px y una
línea amarilla de 2px a la izquierda (la franja del piso), que aparece en cada
lead y en cada venta:

```
RM-2611-4F7K   ·  WEB / COTIZADOR
CAMPAÑA        ·  meta-cabinas-detailing-nov
PRIMER CONTACTO·  26/11/2026 18:42  ·  /cabinas-para-detailing
CONFIRMÓ VENTA ·  <usuario de RM> · <n.º de presupuesto>
```

No se edita en línea: los cambios de origen quedan en el historial.

**Las estaciones.** El estado de un lead se muestra como una franja dividida
en siete tramos (Nuevo → Vendido), con el tramo actual en amarillo, como la
franja del piso del taller. Perdido corta la franja en gris.

## Tipografía

Las tres familias de RM, cada una con un trabajo distinto:

- **Archivo** (variable): toda la interfaz. `wdth 100` en tablas densas,
  `wdth 110–118` en encabezados de sección. Cifras siempre `tabular-nums`.
- **Sora**: solo títulos de pantalla y la cifra principal de cada vista.
  Nunca en botones ni en tablas.
- **Azeret Mono**: lo "estampado": referencias, UTMs, fechas, importes en la
  ficha, números de operación y etiquetas de columna. Mayúsculas con
  `letter-spacing .1em` en etiquetas, minúsculas en valores técnicos (UTMs).

Escala: 12 / 13 / 14 (base) / 16 / 20 / 28 / 44. La cifra principal de una
vista (44, Sora) es mucho más grande que todo lo demás: hay una sola por vista.

## Color

Superficies, de la web de RM, un poco más claras para la lectura prolongada:

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0B0C0D` | fondo de la app |
| `--surface` | `#121416` | paneles, tablas |
| `--surface-2` | `#181B1E` | filas en hover, inputs |
| `--line` | `#25292D` | bordes |
| `--text` | `#F3F3EE` | texto principal |
| `--muted` | `#9A9C94` | texto secundario (contraste AA sobre `--surface`) |
| `--amber` | `#FFC800` | **solo** acción principal, selección, estación actual y lo que pide atención |
| `--on-amber` | `#0C0D0B` | texto sobre amarillo |

Estados del embudo en tonos apagados, para que el amarillo siga siendo la
única señal fuerte: azul gris, violeta gris, ocre, verde (`#7BD88F`, ya usado
en la web para "ok") y gris para Perdido. Rojo (`#FF6B4A`, el error de la
web) solo para errores y seguimientos vencidos.

Gráficos: series en escala de grises; la serie que importa en esa vista va en
amarillo. Nada de paletas arcoíris.

## Composición

- Barra lateral angosta (íconos + etiqueta) en escritorio; barra inferior de
  5 accesos en el celular.
- Tablas densas (filas de 44px) en escritorio; en el celular cada fila pasa a
  una tarjeta con nombre, estación y próxima acción.
- El dashboard no es una grilla de tarjetas iguales: una cifra principal
  (ventas confirmadas, en $), una fila secundaria de indicadores chicos y
  después el detalle.
- Radios chicos (4px) como en la web: piezas de chapa, no burbujas.
- El motivo de chapa trapezoidal aparece una sola vez: en la pantalla de
  login. No es decoración repetida.

## Movimiento

Funcional y corto: 150–200ms en cambios de estado, paneles laterales y
menús, con la curva `cubic-bezier(.16,1,.3,1)` de la web. Skeletons con la
forma real del contenido mientras carga. Sin entradas escalonadas, sin
animaciones al hacer scroll. Todo respeta `prefers-reduced-motion`.

## Lo que no va

Gradientes, glassmorphism, grillas de tarjetas idénticas, cifras redondas de
relleno, íconos decorativos, gráficos con datos de ejemplo. Si no hay datos,
el estado vacío dice qué falta y cómo cargarlo.
