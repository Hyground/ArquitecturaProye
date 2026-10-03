const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'manifest.json'), 'utf8'));
const fallback = 'assets/hardware-hero.png';
const files = manifest.files || [];
const hashes = new Map();
const fallbackProducts = [];
const missing = [];
const small = [];
const invalid = [];
let total = 0;
let specific = 0;

function imageType(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpeg';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'webp';
  if (bytes.subarray(0, 5).toString().toLowerCase() === '<?xml' || bytes.toString('utf8').trimStart().startsWith('<svg')) return 'svg';
  return null;
}

for (const file of files) {
  const products = JSON.parse(fs.readFileSync(path.join(root, 'data', 'categories', file), 'utf8'));
  for (const product of products) {
    total += 1;
    if (product.image === fallback) { fallbackProducts.push(`${product.id} — ${product.brand} ${product.name}`); continue; }
    specific += 1;
    if (/^https?:\/\//i.test(product.image)) continue;
    const local = path.join(root, product.image.replace(/\//g, path.sep));
    if (!fs.existsSync(local)) { missing.push(`${product.id}: ${product.image}`); continue; }
    const bytes = fs.readFileSync(local);
    if (bytes.length < 5120) small.push(`${product.id}: ${product.image} (${bytes.length} bytes)`);
    if (!imageType(bytes)) invalid.push(`${product.id}: ${product.image}`);
    const digest = crypto.createHash('sha256').update(bytes).digest('hex');
    const list = hashes.get(digest) || [];
    list.push(product.id);
    hashes.set(digest, list);
  }
}

const duplicates = [...hashes.values()].filter(list => list.length > 1);
console.log(`TOTAL PRODUCTS: ${total}`);
console.log(`SPECIFIC IMAGES: ${specific}`);
console.log(`FALLBACK IMAGES: ${fallbackProducts.length}`);
console.log(`MISSING FILES: ${missing.length}`);
console.log(`FILES < 5 KB: ${small.length}`);
console.log(`DUPLICATE IMAGE HASHES: ${duplicates.length}`);
console.log(`INVALID IMAGE FILES: ${invalid.length}`);
for (const item of fallbackProducts) console.warn(`WARNING fallback: ${item}`);
for (const item of missing) console.error(`ERROR missing: ${item}`);
for (const item of small) console.error(`ERROR small: ${item}`);
for (const item of invalid) console.error(`ERROR invalid: ${item}`);
for (const list of duplicates) console.warn(`WARNING duplicate hash: ${list.join(', ')}`);
if (missing.length || small.length || invalid.length) process.exitCode = 1;
