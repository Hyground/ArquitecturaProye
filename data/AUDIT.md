# Auditoría del catálogo VERSUS

## Fase 5 — Veredicto inteligente

El veredicto usa métricas configurables por categoría, precio y disponibilidad
de características. Los pesos centralizados son rendimiento 45%, valor 35% y
características 20%; el valor combina 45% rendimiento normalizado y 55% precio
normalizado. CPU, GPU, RAM, almacenamiento, monitor, router, NAS, placa base,
tarjeta de red y memoria USB tienen métricas específicas. Las demás categorías
usan campos numéricos comparables o el score existente como fallback seguro.

Las diferencias de menos del 5% en precio se tratan como precio similar para
evitar resultados artificiales. Una diferencia final menor de 5 puntos produce
una conclusión equilibrada. El bloque se muestra al final de la tabla e incluye
un detalle nativo “¿Por qué?” con sus puntuaciones calculadas.

## Fase 4 — Imágenes

- Productos totales: **201**.
- Fallback inicial: **160**; imágenes específicas iniciales: **41**.
- Imágenes específicas nuevas descargadas y verificadas: **2**.
- Imágenes específicas finales: **43** (**21.4%** del catálogo).
- Fallback final: **158**.

Se validaron por HTTP antes de descargarse y localmente después de guardarse:

- `assets/products/cpu/amd-ryzen-5-9600x.webp`: imagen exacta del AMD Ryzen
  5 9600X; HTTP 200, `image/webp`, 48,280 bytes.
- `assets/products/keyboard/razer-huntsman-v3-pro-tkl.png`: imagen exacta del
  Razer Huntsman V3 Pro TKL; HTTP 200, `image/png`, 1,551,222 bytes.

No se aceptaron imágenes ambiguas, logos, miniaturas de buscadores ni URLs que
no hubieran respondido como contenido de imagen. Por ello, las 158 fichas que
siguen con fallback están pendientes de una fuente exacta o representativa
confiable; `scripts/validate-images.js` las lista de forma individual. No se
detectaron archivos faltantes, menores de 5 KB, inválidos ni hashes duplicados.

Fuentes principales de esta iteración: tienda oficial AMD para la imagen del
Ryzen y Walmart como distribuidor reconocido para la imagen exacta del teclado
Razer. Esta fase dejó pendiente la cobertura masiva para no sacrificar la
exactitud de las imágenes.

## Fase 4.1 — Cobertura masiva de imágenes

Se recorrió el siguiente lote prioritario de CPU, GPU y periféricos. Se
probaron URLs de fabricante y distribuidores con respuesta HTTP antes de
aceptar recursos. Se añadió una descarga exacta adicional: Intel Arc B580
Limited Edition, HTTP 200, `image/jpg`, 91,868 bytes.

- Fallback inicial: **158**.
- Productos procesados en este lote: **1** adicional.
- Descargas exitosas: **1** (`exact-third-party`).
- Fallback final: **157**; cobertura específica: **44 / 201 (21.9%)**.
- Duplicados esperados y sospechosos: **0**.
- Errores de validación de archivo: **0**.

Las fuentes candidatas restantes no se registran como aceptadas hasta que se
verifiquen individualmente por HTTP, tamaño, formato y correspondencia visual.

## Fase 3 — Saneamiento del catálogo

- Productos genéricos al inicio: **215**.
- Productos con nombre `Serie NN` al finalizar: **0**.
- Productos finales: **201**, en **36** categorías.
- Categorías saneadas: sillas, tabletas gráficas, etiquetadoras, NAS,
  destructoras, plotters, proyectores, routers, escáneres, audífonos,
  bocinas, micrófonos, UPS, capturadoras, red, consola, controles, docks,
  teclado, mouse, webcam y memoria USB.

Las nueve categorías que contenían exclusivamente plantillas se sustituyeron
por una selección concisa de modelos comerciales de al menos dos marcas. En
los datasets mixtos se retiraron las filas de plantilla y se conservaron
solamente modelos comerciales diferenciables. El catálogo disminuyó de 416 a
201 productos para no reemplazar datos ficticios con variantes no verificadas.

Se añadieron o normalizaron 18 fichas reales en las categorías que antes eran
100% genéricas. No se descargaron imágenes adicionales en esta fase: se
priorizó el saneamiento de datos. Hay **160** productos que siguen usando el
fallback `assets/hardware-hero.png`; se mantienen como advertencias hasta la
fase dedicada a imágenes.

No quedaron IDs duplicados, campos estructurales vacíos, precios no positivos
ni categorías con menos de dos marcas. `scripts/validate-catalog.js` finalizó
con **0 errores** y 160 advertencias de fallback de imagen. Las
especificaciones se contrastaron con fichas públicas de fabricantes, entre
ellas Synology, BenQ, ASUS, TP-Link, Canon, Epson, Brother, Wacom, Huion,
Steelcase, Herman Miller, QNAP y HP.

Fecha de auditoría: 2026-10-01.

## Alcance y validación

Se revisaron `index.html`, `app.js`, `styles.css`, `data/manifest.json` y los
26 datasets de `data/categories/`. Todos los archivos de texto inspeccionados
están codificados como UTF-8 válido, sin el carácter de sustitución Unicode
U+FFFD ni
secuencias de texto corrupto como `Ã`, `Â` o `â`. `index.html` ya declara
`<meta charset="UTF-8">`.

Los 26 archivos de categorías se analizaron con `JSON.parse`; todos son JSON
válido. Esta auditoría no modifica ni elimina productos.

## Resumen

- Productos totales: **416**.
- Categorías encontradas: **36**.
- Productos genéricos o artificiales: **215**.
- Productos que usan `assets/hardware-hero.png`: **361**.
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
| Almacenamiento | 12 | 0 | 9 | Modelos de plantilla sustituidos; quedan posibles modelos solapados. |
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
| Fuente | 12 | 0 | 10 | Fichas de plantilla sustituidas; imágenes repetidas. |
| GPU | 13 | 0 | 7 | Datos nominales; imágenes repetidas por categoría. |
| Gabinete | 12 | 0 | 8 | Ficha de plantilla sustituida; imágenes repetidas. |
| Impresora | 12 | 0 | 12 | Proviene de dos archivos; todas usan el hero. |
| Memoria USB | 12 | 1 | 8 | Una ficha de plantilla y posibles modelos solapados. |
| Micrófono | 12 | 9 | 12 | Datos de plantilla predominantes. |
| Monitor | 12 | 0 | 7 | Datos nominales; imágenes repetidas por categoría. |
| Mouse | 12 | 7 | 10 | Más de la mitad de fichas son genéricas. |
| NAS | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Placa base | 12 | 0 | 9 | Fichas de plantilla sustituidas; revisar una pareja de especificaciones idénticas. |
| Plotter | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Proyector | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| RAM | 12 | 0 | 9 | Fichas de plantilla sustituidas; imágenes repetidas. |
| Tarjeta de red | 6 | 0 | 5 | Categoría nueva; cinco imágenes pendientes de verificación local. |
| Tarjeta de sonido | 6 | 0 | 6 | Categoría nueva; imágenes específicas pendientes. |
| Red | 12 | 9 | 12 | Datos de plantilla predominantes. |
| Refrigeración | 12 | 0 | 9 | Fichas de plantilla sustituidas; imágenes repetidas. |
| Router | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Silla ergonómica | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Tableta gráfica | 12 | 12 | 12 | Requiere sustitución completa de datos e imágenes. |
| Teclado | 12 | 7 | 10 | Más de la mitad de fichas son genéricas. |
| UPS | 12 | 9 | 12 | Datos de plantilla predominantes. |
| Unidad óptica | 6 | 0 | 5 | Categoría nueva; cinco imágenes pendientes de verificación local. |
| Ventiladores | 12 | 0 | 8 | Ficha de plantilla sustituida; imágenes repetidas. |
| Webcam | 12 | 9 | 12 | Datos de plantilla predominantes. |

## Archivos afectados por datos genéricos

`chairs.json`, `drawing-tablets.json`, `label-makers.json`, `nas.json`,
`others.json`, `paper-shredders.json`, `peripherals.json`, `plotters.json`,
`projectors.json`, `routers.json`, `scanners.json` y `usb.json`.

Los datasets internos `case.json`, `cooling.json`, `cpu.json`, `fans.json`,
`gpu.json`, `motherboard.json`, `power-supply.json`, `ram.json` y
`storage.json` ya no contienen registros detectados como genéricos. Aun así,
requieren mejoras de imagen porque reutilizan fotos de categoría o el hero.

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

## Fase 2 — Componentes internos

### Alcance realizado

Se trabajó exclusivamente sobre los datasets internos existentes: placa base,
RAM, almacenamiento, fuente, gabinete, refrigeración y ventiladores. CPU y
GPU se conservaron porque no contenían registros de plantilla. También se
crearon las categorías internas `Unidad óptica`, `Tarjeta de sonido` y
`Tarjeta de red`, registradas en `manifest.json` para conservar la carga
modular automática.

- Productos genéricos reemplazados: **13**.
  - Placa base: 2; RAM: 2; almacenamiento: 2; fuente: 3; gabinete: 1;
    refrigeración: 2; ventiladores: 1.
- Modelos reales añadidos en categorías nuevas: **18** (6 por categoría).
- Categorías nuevas: **3** (`Unidad óptica`, `Tarjeta de sonido`,
  `Tarjeta de red`).
- Imágenes específicas descargadas y verificadas por HTTP: **2**.
  - `assets/products/optical-drives/asus-drw-24b1st.png`: ASUS DRW-24B1ST,
    HTTP 200, `image/png`, 527,490 bytes.
  - `assets/products/network-cards/tp-link-tx201.jpg`: TP-Link TX201,
    HTTP 200, `image/jpeg`, 78,996 bytes.
- Imágenes que continúan con fallback: **29** de los productos sustituidos o
  añadidos. Se dejaron deliberadamente en `assets/hardware-hero.png` cuando
  no se obtuvo una URL de imagen específica que hubiera sido verificada por
  HTTP; no se añadieron hotlinks no comprobados.

### Modelos sustituidos

Los registros `Serie NN` de los datasets internos fueron sustituidos sin
cambiar sus IDs: ASRock B650M Pro RS WiFi, ASUS PRIME B760-PLUS D4, Patriot
Viper Venom DDR5-6000, Kingston FURY Beast DDR5-6000, Solidigm P44 Pro,
WD Blue SA510, FSP Hydro G Pro ATX 3.0, Seasonic FOCUS GX-750 ATX 3.0,
Corsair RM750e (2023), Phanteks XT Pro Ultra, ID-COOLING FROZN A620,
EK-Nucleus AIO CR360 Lux D-RGB y Phanteks T30-120.

### Productos pendientes

Quedan pendientes imágenes específicas verificadas para 29 registros de esta
fase y para los modelos internos que ya eran reales pero aún usaban la imagen
genérica previa. La siguiente iteración debe descargar únicamente imágenes de
producto tras validar respuesta HTTP, tipo MIME y tamaño; no debe sustituirlas
por resultados de buscadores ni por URLs temporales.

### Fuentes generales de verificación

Se consultaron fichas y documentación oficial de fabricantes: ASUS (unidades
ópticas, placas base y Xonar), ASRock (B650M Pro RS WiFi), Creative (Sound
Blaster), TP-Link (TX201 y TX401) e Intel (I210-T1). Se usaron además las
fichas públicas de los fabricantes de memoria, almacenamiento, energía,
gabinetes, refrigeración y ventiladores para contrastar denominaciones y
especificaciones. Los precios son aproximaciones en USD y no se presentan
como cotizaciones en tiempo real.
