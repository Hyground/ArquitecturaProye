import {
  products, cats, selected, setProducts, setCompareCat
} from './state.js';
import { toast } from './ui.js';
import {
  updateDatasetState, renderProducts, renderCats
} from './catalog.js';
import {
  populateCompareCategories, setCompareCategory
} from './comparison.js';
export async function remoteSearch(query) {
  if (!query.trim()) return;
  toast('Buscando componentes adicionales…');
  try {
    const url = `https://datasets-server.huggingface.co/search?dataset=Doshiba%2Fpcpartpicker-parts-dataset&config=default&split=train&query=${encodeURIComponent(query)}&offset=0&length=40`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const rows = (data.rows || []).map(x => x.row || x);
    const catMap = {
      cpu: 'CPU',
      'cpu-cooler': 'Refrigeración',
      motherboard: 'Placa base',
      memory: 'RAM',
      'internal-hard-drive': 'Almacenamiento',
      'video-card': 'GPU',
      'power-supply': 'Fuente',
      case: 'Gabinete'
    };

    rows.forEach((x, i) => {
      const cat = catMap[x.category] || 'Otros';
      const name = x.name || 'Componente sin nombre';
      const brand = x.brand || name.split(' ')[0];
      const price = Number(x.price_eur || 0);
      const id = `hf-${x.source_id || x.product_tag || i}`;
      let specs = x.specs || {};
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch { specs = { 'Detalles': specs }; }
      }
      specs = { ...specs, 'Fuente': 'Dataset abierto', 'Precio original': x.price_eur ? `€${x.price_eur}` : 'No disponible' };
      if (!products.some(p => p.id === id)) {
        products.unshift({ id, cat, brand, name, price, score: 80, image: x.image_url, specs });
      }
    });

    updateDatasetState();
    renderProducts();
    renderCats();
    populateCompareCategories();
    toast(`${rows.length} componentes adicionales encontrados`);
  } catch (err) {
    console.warn('Dataset remoto complementario:', err);
  }
}

export function startComparisonFromQuery(query) {
  const normalized = query.trim().toLocaleLowerCase('es');
  if (!normalized) return false;

  const matches = products.filter(p => {
    const specs = p.specs ? Object.values(p.specs).join(' ') : '';
    return `${p.cat} ${p.brand} ${p.name} ${specs}`
      .toLocaleLowerCase('es')
      .includes(normalized);
  }).sort((a, b) => (b.score || 0) - (a.score || 0));

  if (matches.length === 0) return false;

  const category = matches[0].cat;
  const comparableMatches = matches.filter(p => p.cat === category);
  const categoryProducts = products
    .filter(p => p.cat === category)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  setCompareCat(category);
  selected.a = comparableMatches[0];
  selected.b = comparableMatches[1]
    || categoryProducts.find(p => p.id !== selected.a.id)
    || selected.a;

  populateCompareCategories();
  setCompareCategory(category);
  const compEl = document.querySelector('.compare-section');
  if (compEl) compEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast(`Comparando ${selected.a.name} con ${selected.b.name}`);
  return true;
}
/**
 * AUTO-DESCUBRIMIENTO Y CARGA MODULAR DE DATASETS:
 * Detecta y carga archivos JSON de /data/categories/ automáticamente sin tocar código JS.
 * 1. Lee /data/categories/ para auto-descubrir cualquier nuevo archivo *.json.
 * 2. Lee /data/manifest.json para registrar archivos añadidos al repositorio.
 * 3. Carga en paralelo todos los archivos encontrados.
 * 4. Infiere categorias, familias y chips dinamicamente desde los propios datos.
 */
export async function loadDataset() {
  const basePath = './data/categories/';
  const filesToLoad = new Set();

  // 1. Auto-descubrimiento via listado de directorio del servidor
  try {
    const dirRes = await fetch(basePath);
    if (dirRes.ok) {
      const html = await dirRes.text();
      const matches = html.match(/[a-zA-Z0-9_-]+\.json/g);
      if (matches) {
        matches.forEach(f => filesToLoad.add(f));
      }
    }
  } catch (e) {
    // Servidor sin listado de directorio; recurre a manifest.json
  }

  // 2. Registro de manifest.json (configuración declarativa de datos)
  try {
    const manifestRes = await fetch('./data/manifest.json');
    if (manifestRes.ok) {
      const manifest = await manifestRes.json();
      const list = Array.isArray(manifest) ? manifest : (manifest.datasets || manifest.files || []);
      list.forEach(item => {
        const fileName = typeof item === 'string' ? item : item.file;
        if (fileName) filesToLoad.add(fileName);
      });
    }
  } catch (e) {
    console.warn('Aviso: manifest.json no respondió:', e);
  }

  // 3. Fallback de archivos predeterminados si el navegador no permite listar carpetas
  if (filesToLoad.size === 0) {
    [
      'cpu.json', 'gpu.json', 'ram.json', 'storage.json', 'usb.json',
      'motherboard.json', 'power-supply.json', 'cooling.json', 'fans.json',
      'case.json', 'monitor.json', 'printers.json', 'peripherals.json', 'others.json'
    ].forEach(f => filesToLoad.add(f));
  }

  // 4. Descarga en paralelo de todos los datasets modulares
  const loadPromises = Array.from(filesToLoad).map(async file => {
    try {
      const res = await fetch(`${basePath}${file}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn(`Error al leer archivo ${file}:`, err);
      return [];
    }
  });

  const results = await Promise.all(loadPromises);
  setProducts(results.flat().filter(p => p && p.id && p.name && p.cat));

  // 5. Deduplicar por id
  const seenIds = new Set();
  setProducts(products.filter(p => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  }));

  // 6. Actualizar interfaz dinamicamente
  updateDatasetState();
  populateCompareCategories();

  // Fija la categoria inicial (prioriza CPU si existe, o la primera disponible)
  const availableCats = cats.filter(c => c !== 'Todos');
  const initialCat = availableCats.includes('CPU') ? 'CPU' : (availableCats[0] || 'CPU');
  setCompareCategory(initialCat);

  renderCats();
  renderProducts();
}