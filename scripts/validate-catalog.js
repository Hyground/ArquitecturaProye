const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const categoriesDir = path.join(root, 'data', 'categories');
const manifestPath = path.join(root, 'data', 'manifest.json');
const genericName = /\b(?:Serie|Modelo)\s*\d+\b/i;
let errors = 0;
let warnings = 0;

function error(message) { errors += 1; console.error(`ERROR: ${message}`); }
function warning(message) { warnings += 1; console.warn(`WARNING: ${message}`); }

let manifest;
try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
catch (cause) { error(`data/manifest.json no es JSON válido: ${cause.message}`); process.exitCode = 1; return; }

const files = Array.isArray(manifest.files) ? manifest.files : [];
if (!files.length) error('manifest.json no declara datasets.');
const ids = new Map();
const categories = new Map();
let productCount = 0;

for (const file of files) {
  const filePath = path.join(categoriesDir, file);
  if (!fs.existsSync(filePath)) { error(`Dataset declarado inexistente: data/categories/${file}`); continue; }
  let products;
  try { products = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (cause) { error(`JSON inválido en ${file}: ${cause.message}`); continue; }
  if (!Array.isArray(products)) { error(`${file} debe contener un arreglo.`); continue; }

  for (const product of products) {
    productCount += 1;
    const label = `${file}:${product && product.id ? product.id : '(sin id)'}`;
    if (!product || typeof product !== 'object') { error(`${file} contiene un registro no válido.`); continue; }
    if (!product.id) error(`${label} no tiene id.`);
    if (!product.name) error(`${label} no tiene nombre.`);
    if (!product.brand) error(`${label} no tiene marca.`);
    if (!product.cat) error(`${label} no tiene categoría.`);
    if (typeof product.price !== 'number' || product.price <= 0) error(`${label} tiene precio inválido.`);
    if (!product.image) error(`${label} no tiene imagen.`);
    if (product.name && genericName.test(product.name)) error(`${label} conserva nombre genérico "Serie/Modelo NN".`);
    if (product.id) {
      if (ids.has(product.id)) error(`ID duplicado ${product.id} en ${ids.get(product.id)} y ${file}.`);
      else ids.set(product.id, file);
    }
    if (product.cat && product.brand) {
      const brands = categories.get(product.cat) || new Set();
      brands.add(product.brand);
      categories.set(product.cat, brands);
    }
    if (product.image && !/^https?:\/\//i.test(product.image)) {
      const localImage = path.join(root, product.image.replace(/\//g, path.sep));
      if (!fs.existsSync(localImage)) error(`${label} referencia imagen local inexistente: ${product.image}`);
      if (product.image === 'assets/hardware-hero.png') warning(`${label} usa imagen fallback.`);
    }
  }
}

for (const [category, brands] of categories) {
  if (brands.size < 2) error(`La categoría ${category} tiene menos de dos marcas.`);
}
console.log(`Validación terminada: ${productCount} productos, ${categories.size} categorías, ${errors} errores, ${warnings} advertencias.`);
if (errors) process.exitCode = 1;
