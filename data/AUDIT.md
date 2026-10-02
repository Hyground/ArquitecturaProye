# Auditoría del catálogo VERSUS

Fecha de auditoría: 2026-10-01.

## Alcance y validación

Se revisaron `index.html`, `app.js`, `styles.css`, `data/manifest.json` y los
23 datasets de `data/categories/`. Todos los archivos de texto inspeccionados
están codificados como UTF-8 válido, sin el carácter de sustitución Unicode
U+FFFD ni
secuencias de texto corrupto como `Ã`, `Â` o `â`. `index.html` ya declara
`<meta charset="UTF-8">`.

Los 23 archivos de categorías se analizaron con `JSON.parse`; todos son JSON
válido. Esta auditoría no modifica ni elimina productos.

## Resumen

- Productos totales: **398**.
- Categorías encontradas: **33**.
- Productos genéricos o artificiales: **228**.
- Productos que usan `assets/hardware-hero.png`: **345**.
- Productos con una imagen distinta de ese recurso: **53**; varias de esas
  imágenes también se repiten entre modelos.

En esta auditoría se considera genérico un producto cuyo nombre contiene
`Serie NN` o `Modelo NN`, o cuyas especificaciones contienen textos como
`Producto tecnológico`, `Según modelo` o `Selección de catálogo`.

## Problemas transversales

1. **Imágenes:** `hardware-hero.png` se reutiliza en 345 productos. El
   renderizador lo sustituye por la foto de su categoría cuando existe un
   fallback, por lo que muchos modelos terminan mostrando la misma imagen
   representativa y no una fotografía de su modelo.
2. **Datos artificiales:** los 228 registros genéricos emplean nombres
   secuenciales y, en muchos casos, fichas técnicas de plantilla. No son
   apropiados para una comparación real por marca.
3. **Precios posiblemente generados:** los grupos de productos genéricos
   presentan progresiones regulares de precio y puntaje (por ejemplo, series
   incrementales de 37 USD y un punto), sin fuente de precio o fecha de
   consulta. Deben verificarse antes de presentarlos como precios reales.
4. **Duplicados o solapamientos:** existen modelos muy similares o duplicados
   en los datasets de componentes (por ejemplo, SSD y memorias USB). Además,
   `Impresora` se carga desde `printers.json` y `others.json`; es válido para
   la arquitectura actual, pero conviene consolidar y deduplicar al renovar
   los datos.

## Auditoría por categoría

| Categoría | Productos | Genéricos | `hardware-hero.png` | Hallazgo principal |
|---|---:|---:|---:|---|
| Almacenamiento | 12 | 2 | 9 | Dos fichas de plantilla; posibles modelos solapados. |
| Audífonos | 12 | 7 | 10 | Mayoría de fichas genéricas; imágenes repetidas. |
| Bocinas | 12 | 9 | 12 | Datos e imagen enteramente de plantilla en la mayoría. |
| CPU | 13 | 0 | 7 | Datos nominales; imágenes repetidas por categoría. |
| Capturadora | 12 | 10 | 12 | Datos de plantilla predominantes. |
| Consola | 12 | 10 | 10 | Datos de plantilla predominantes. |
| Control | 12 | 10 | 10 | Datos de plantilla predominantes. |
| Destructora de papel | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Dock | 12 | 10 | 12 | Datos de plantilla predominantes. |
| Escáner | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Etiquetadora | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Fuente | 12 | 3 | 10 | Tres fichas de plantilla; imágenes repetidas. |
| GPU | 13 | 0 | 7 | Datos nominales; imágenes repetidas por categoría. |
| Gabinete | 12 | 1 | 8 | Una ficha de plantilla; imágenes repetidas. |
| Impresora | 12 | 0 | 12 | Proviene de dos archivos; todas usan el hero. |
| Memoria USB | 12 | 1 | 8 | Una ficha de plantilla y posibles modelos solapados. |
| Micrófono | 12 | 9 | 12 | Datos de plantilla predominantes. |
| Monitor | 12 | 0 | 7 | Datos nominales; imágenes repetidas por categoría. |
| Mouse | 12 | 7 | 10 | Más de la mitad de fichas son genéricas. |
| NAS | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Placa base | 12 | 2 | 9 | Dos fichas de plantilla y una pareja de especificaciones idénticas. |
| Plotter | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Proyector | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| RAM | 12 | 2 | 9 | Dos fichas de plantilla; imágenes repetidas. |
| Red | 12 | 9 | 12 | Datos de plantilla predominantes. |
| Refrigeración | 12 | 2 | 9 | Dos fichas de plantilla; imágenes repetidas. |
| Router | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Silla ergonómica | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Tableta gráfica | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Teclado | 12 | 7 | 10 | Más de la mitad de fichas son genéricas. |
| UPS | 12 | 9 | 12 | Datos de plantilla predominantes. |
| Ventiladores | 12 | 1 | 8 | Una ficha de plantilla; imágenes repetidas. |
| Webcam | 12 | 9 | 12 | Datos de plantilla predominantes. |

## Archivos afectados por datos genéricos

`case.json`, `chairs.json`, `cooling.json`, `drawing-tablets.json`,
`fans.json`, `label-makers.json`, `motherboard.json`, `nas.json`,
`others.json`, `paper-shredders.json`, `peripherals.json`, `plotters.json`,
`power-supply.json`, `projectors.json`, `ram.json`, `routers.json`,
`scanners.json`, `storage.json` y `usb.json`.

Los únicos datasets sin registros detectados como genéricos son `cpu.json`,
`gpu.json`, `monitor.json` y `printers.json`. Aun así, estos cuatro requieren
mejoras de imagen porque reutilizan fotos de categoría o el hero.

## Prioridad de corrección de datos

Prioridad alta: `chairs.json`, `drawing-tablets.json`, `label-makers.json`,
`nas.json`, `paper-shredders.json`, `plotters.json`, `projectors.json`,
`routers.json` y `scanners.json`: los 12 registros de cada archivo son
genéricos y usan el hero.

También es prioritario `others.json` por volumen: contiene 109 productos,
83 genéricos y 103 que usan el hero. Después debe atenderse
`peripherals.json`, con 23 de 36 productos genéricos.

## Próxima fase sugerida

Sustituir gradualmente los registros de plantilla por modelos verificables,
manteniendo los mismos campos del esquema y la carga modular actual. Añadir
una imagen específica por modelo y documentar fuente y fecha de cada precio.
La deduplicación debe hacerse después de la sustitución, sin cambiar todavía
la lógica de catálogo ni del comparador.
