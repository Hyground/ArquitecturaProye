const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, 'categories');
const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json')).sort();

const manifest = {
  version: '1.0',
  basePath: './data/categories/',
  files: files
};

fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Manifest actualizado exitosamente con ${files.length} archivos de categorias.`);
