# Base de Datos Modular y Datasets de Componentes (VERSUS)

Arquitectura disenada para trabajo en equipo colaborativo y cero hardcoding.

## Estructura de Archivos

La base de datos vive dentro del proyecto dividida en datasets modulares por categoria:

```text
data/
├── manifest.json              <-- Registro central de los datasets activos
├── sync.js                    <-- Script opcional para sincronizar manifest.json con 1 comando
├── README.md                  <-- Esta guia de referencia para el equipo
└── categories/                <-- Archivos JSON independientes por categoria
    ├── cpu.json               <-- Procesadores (Ryzen, Intel Core...)
    ├── gpu.json               <-- Tarjetas Graficas (RTX, Radeon...)
    ├── ram.json               <-- Memorias RAM (DDR5, DDR4...)
    ├── storage.json           <-- Almacenamiento y SSDs NVMe
    ├── usb.json               <-- Memorias USB y Pendrives de alta velocidad
    ├── motherboard.json       <-- Placas Base (AM5, LGA1700...)
    ├── power-supply.json      <-- Fuentes de Poder (PSU)
    ├── cooling.json           <-- Disipadores y Refrigeracion liquida
    ├── fans.json              <-- Ventiladores de Gabinete (Flujo CFM, Ruido...)
    ├── case.json              <-- Gabinetes y Chasis (Full Tower, Mid Tower...)
    ├── monitor.json           <-- Pantallas y Monitores (OLED, 540Hz eSports, 4K...)
    ├── printers.json          <-- Impresoras (Tanque continuo EcoTank vs Laser)
    ├── peripherals.json       <-- Teclados, Ratones y Webcams
    └── others.json            <-- Audio, Redes, Consolas y Accesorios
```

---

## Trabajo en equipo sin conflictos de Git (Cero mezclas)

No se mezcla todo en un solo archivo porque provocaria merge conflicts en Git cuando varias personas editen al mismo tiempo. Cada integrante del equipo trabaja de manera aislada en su categoria asignada:

- **Companero A**: Edita unicamente `data/categories/ram.json`.
- **Companero B**: Edita unicamente `data/categories/cpu.json`.
- **Companero C**: Edita unicamente `data/categories/gpu.json`.
- **Companero D**: Edita unicamente `data/categories/usb.json`.
- **Companero E**: Edita unicamente `data/categories/monitor.json`.
- **Companero F**: Edita unicamente `data/categories/printers.json`.

Al hacer commit y push, nadie pisa los cambios de los demas.

---

## Como agregar una nueva categoria (Cero cambios en codigo JavaScript)

Si deseas crear una nueva categoria (por ejemplo `teclados.json`, `laptops.json`, etc.):

1. Crea el nuevo archivo dentro de `data/categories/nuevo.json` siguiendo el schema.
2. Ejecuta `node data/sync.js` (o anadelo a `manifest.json`). En servidores web locales, la aplicacion lo detecta de forma automatica.
3. **No tienes que modificar ni una sola linea de JavaScript (`app.js`)**:
   - La aplicacion lee el nuevo JSON.
   - Detecta el campo `"cat"` de tus componentes.
   - Crea automaticamente el nuevo chip en la barra de categorias.
   - Genera los desplegables de seleccion para enfrentamiento directo.

---

## Reglas del Comparador (Enfrentamiento Estricto por Categoria)

Para garantizar comparaciones coherentes (evitando comparar un USB con un procesador):

1. **Paso 1 (Chips de Categoria)**: El usuario escoge primero que tipo de componente desea comparar (ej. `CPU`, `Memoria USB`, `Monitor`).
2. **Paso 2 (Seleccion de Modelos)**:
   - Los dos componentes (A y B) quedan fijados obligatoriamente a esa misma categoria.
   - Cada tarjeta dispone de un desplegable con los modelos exactos de dicha categoria.
   - Tambien es posible abrir el buscador visual de esa categoria.
3. **Cero Emojis**: Todo el diseno, botones, chips y etiquetas emplean tipografia limpia y sobria.

---

## Estructura de un Componente (Schema)

Cada elemento dentro de los archivos JSON debe ser un objeto con los siguientes atributos:

```json
{
  "id": "usb-kingston-dtmax",
  "cat": "Memoria USB",
  "family": "Componentes",
  "brand": "Kingston",
  "name": "DataTraveler Max 256 GB",
  "price": 42,
  "score": 95,
  "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80",
  "specs": {
    "Capacidad": "256 GB",
    "Velocidad de lectura": "1000 MB/s",
    "Velocidad de escritura": "900 MB/s",
    "Interfaz": "USB 3.2 Gen 2 (Type-C)",
    "Garantia": "5 anos"
  }
}
```

### Campos requeridos:
- `id` (string): Identificador unico en minusculas con guiones.
- `cat` (string): Categoria exacta (ej. `"Memoria USB"`, `"Monitor"`, `"Impresora"`, `"Ventiladores"`, `"RAM"`, `"CPU"`).
- `family` (string): Agrupacion para navegacion (`"Componentes"`, `"Pantallas"`, `"Periféricos"`, `"Oficina"`, `"Audio"`).
- `brand` (string): Marca fabricante (ej. `"Kingston"`, `"SanDisk"`, `"LG"`, `"Epson"`, `"Noctua"`).
- `name` (string): Nombre del modelo.
- `price` (numero): Precio estimado en USD (ej. `42`).
- `score` (numero): Puntaje general de 1 a 100 (ej. `95`).
- `image` (string): URL de imagen del producto o ruta local (`assets/...`).
- `specs` (objeto clave-valor): Especificaciones tecnicas comparables.
