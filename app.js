/**
 * VERSUS — Comparador de hardware y componentes de PC
 * Arquitectura: Datasets modulares por categoria en /data/categories/*.json
 * Auto-descubrimiento dinamico: Detecta y agrega categorias automaticamente sin modificar codigo JS.
 */

let products = [];
let cats = ['Todos'];
let activeCat = 'Todos';
let compareCat = 'CPU';
let sideToPick = 'a';
let selected = { a: null, b: null };

const imageLink = product => /^https?:\/\/\S+$/i.test(String(product?.image || '').trim()) ? product.image.trim() : '';
const imageMarkup = (product, className = '', lazy = false) => {
  const url = imageLink(product);
  return url
    ? `<img${className ? ` class="${className}"` : ''} src="${url}" alt="${product.name}"${lazy ? ' loading="lazy"' : ''} onerror="this.remove();this.parentElement.classList.add('image-missing');">`
    : '<span class="image-link-placeholder">Sin enlace de imagen</span>';
};
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const toast = msg => {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
};

function heroMatches(query) {
  const normalized = query.trim().toLocaleLowerCase('es');
  if (!normalized) return [];
  return products.filter(product => {
    const specs = Object.values(product.specs || {}).join(' ');
    return `${product.name} ${product.brand} ${product.cat} ${specs}`
      .toLocaleLowerCase('es')
      .includes(normalized);
  }).slice(0, 3);
}

function renderHeroSuggestions(query) {
  const list = $('#heroSuggestions');
  const input = $('#heroSearch');
  if (!list || !input) return;
  const matches = heroMatches(query);
  input.setAttribute('aria-expanded', String(matches.length > 0));
  list.innerHTML = matches.map(product => `
    <button class="hero-suggestion" type="button" role="option" data-hero-result="${product.id}">
      <span><b>${product.name}</b><small>${product.brand} · ${product.cat}</small></span>
      <strong>${money(product.price)}</strong>
    </button>
  `).join('');
  list.classList.toggle('visible', matches.length > 0);
}

function updateDatasetState() {
  const uniqueCats = [...new Set(products.map(p => p.cat).filter(Boolean))].sort();
  cats = ['Todos', ...uniqueCats];
  const countEl = $('#productCount');
  const catEl = $('#categoryCount');
  if (countEl) countEl.textContent = new Intl.NumberFormat('es').format(products.length);
  if (catEl) catEl.textContent = uniqueCats.length;
}

function renderCats() {
  const categorySearch = $('#categorySearch');
  const categoryQuery = categorySearch ? categorySearch.value.trim().toLocaleLowerCase('es') : '';
  const grouped = {};
  cats.slice(1).forEach(c => {
    // Clasificacion dinamica por la familia declarada en los productos
    const sample = products.find(p => p.cat === c);
    const family = (sample && sample.family) || 'Otros';
    if (!categoryQuery || `${c} ${family}`.toLocaleLowerCase('es').includes(categoryQuery)) {
      (grouped[family] ??= []).push(c);
    }
  });

  const categoriesEl = $('#categories');
  if (!categoriesEl) return;

  categoriesEl.innerHTML = `
    <button class="category-card ${activeCat === 'Todos' ? 'active' : ''}" data-cat="Todos">
      <span>
        <strong>Ver todo</strong>
        <small>${products.length} productos</small>
      </span>
    </button>
  ` + Object.entries(grouped).map(([family, list]) => `
    <div class="cat-family">
      <span>${family}</span>
      ${list.map(c => `
        <button class="${c === activeCat ? 'active' : ''}" data-cat="${c}">
          ${c}
          <small>${products.filter(p => p.cat === c).length}</small>
        </button>
      `).join('')}
    </div>
  `).join('');
}

function filtered() {
  const searchInput = $('#catalogSearch');
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let list = products.filter(p => {
    const matchesCat = (activeCat === 'Todos' || p.cat === activeCat);
    const specStr = p.specs ? Object.values(p.specs).join(' ') : '';
    const matchesQuery = `${p.name} ${p.brand} ${specStr}`.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const sortSelect = $('#sortSelect');
  const sort = sortSelect ? sortSelect.value : 'featured';
  if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
  if (sort === 'score') list.sort((a, b) => b.score - a.score);
  return list;
}

function renderProducts() {
  const list = filtered();
  const resultsEl = $('#resultsCount');
  const gridEl = $('#productGrid');

  if (resultsEl) resultsEl.textContent = `${list.length} resultados`;
  if (!gridEl) return;

  gridEl.innerHTML = list.map(p => {
    const keySpecs = p.specs ? Object.entries(p.specs).slice(0, 3) : [];
    return `
    <article class="product-card" aria-label="${p.brand} ${p.name}">
      <div class="product-image">
        ${imageMarkup(p, '', true)}
        <span class="tag">${p.cat.toUpperCase()}</span>
      </div>
      <div class="product-top">
        <span>${p.brand}</span>
        <span class="rating">${(p.score / 10).toFixed(1)} / 10</span>
      </div>
      <h3>${p.name}</h3>
      <ul class="product-specs">${keySpecs.map(([label, value]) => `<li><span>${label}</span><b>${value}</b></li>`).join('')}</ul>
      <div class="price-row">
        <b>${money(p.price)}</b>
        <button data-add="${p.id}" title="Comparar este modelo">COMPARAR</button>
      </div>
    </article>
  `;
  }).join('') || '<p class="empty-state">No encontramos productos con esos filtros. Prueba con otra categoría o término.</p>';
}

/**
 * Renderiza los chips horizontales de categorias en la barra superior del comparador.
 * Al hacer clic en un chip, se fija la categoria y se actualizan ambos componentes.
 */
function populateCompareCategories() {
  const nav = $('#compareNav');
  if (!nav) return;
  const availableCats = cats.filter(c => c !== 'Todos');

  nav.innerHTML = `
    <label class="compare-category-select" for="compareCategorySelect">
      <span>Categoría</span>
      <select id="compareCategorySelect" data-compare-select>
        ${availableCats.map(c => `<option value="${c}" ${c === compareCat ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </label>
    <div class="compare-category-buttons">
      ${availableCats.map(c => {
    const count = products.filter(p => p.cat === c).length;
    return `
      <button class="compare-cat-btn ${c === compareCat ? 'active' : ''}" data-compare-cat="${c}" type="button">
        <span>${c}</span>
        <small>(${count})</small>
      </button>
    `;
      }).join('')}
    </div>
  `;
}

/**
 * Fija la categoria activa del comparador.
 * Garantiza que Componente A y Componente B pertenezcan ESTRICTAMENTE a la misma categoria.
 */
function setCompareCategory(newCat, specificProduct = null, targetSide = 'a', resetSelection = !specificProduct) {
  compareCat = newCat;

  // Actualiza estilo activo en chips
  document.querySelectorAll('.compare-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.compareCat === newCat);
  });
  const categorySelect = $('#compareCategorySelect');
  if (categorySelect) categorySelect.value = newCat;

  const catProducts = products.filter(p => p.cat === newCat);
  if (catProducts.length === 0) return;

  if (resetSelection) {
    selected = { a: null, b: null };
  } else if (specificProduct) {
    if (targetSide === 'a') {
      selected.a = specificProduct;
      selected.b = catProducts.find(p => p.id !== specificProduct.id) || catProducts[0];
    } else {
      selected.b = specificProduct;
      selected.a = catProducts.find(p => p.id !== specificProduct.id) || catProducts[0];
    }
  }

  renderSelection();
}

/**
 * Renderiza los componentes A y B.
 * Incluye un selector directo por desplegable con SOLO los modelos de esa categoria,
 * impidiendo mezclar tipos de componentes incompatibles (ej. USB vs CPU).
 */
function renderSelection() {
  const catProducts = products.filter(p => p.cat === compareCat);

  ['a', 'b'].forEach(side => {
    const p = selected[side];
    const el = $(`#pick${side.toUpperCase()}`);
    if (!el) return;

    if (!p) {
      el.className = 'pick-card';
      el.innerHTML = `
        <span class="side-label">COMPONENTE ${side.toUpperCase()}</span>
        <span class="plus">+</span>
        <strong>Elige un modelo</strong>
        <small>Selecciona un producto de ${compareCat}</small>
        <button class="pick-empty-action" type="button" data-open-picker="${side}">Seleccionar</button>
      `;
      return;
    }

    el.className = 'pick-card selected';
    el.innerHTML = `
      <span class="side-label">COMPONENTE ${side.toUpperCase()} · ${compareCat.toUpperCase()}</span>
      <div class="picked-image-wrap">
        ${imageMarkup(p, 'picked-image')}
      </div>
      <div class="picked-copy">
        <div class="card-select-row">
          <label for="selectModel_${side}">Elegir modelo (${compareCat}):</label>
          <select class="card-dropdown" id="selectModel_${side}" data-side="${side}">
            ${catProducts.map(item => `
              <option value="${item.id}" ${item.id === p.id ? 'selected' : ''}>
                ${item.brand} — ${item.name} (${money(item.price)})
              </option>
            `).join('')}
          </select>
        </div>
        <small class="picked-brand-tag">${p.brand}</small>
        <strong class="picked-name">${p.name}</strong>
        <div class="picked-meta">
          <b>${money(p.price)}</b>
          <span style="font-size:11px;color:var(--muted);font-weight:700;">Puntaje: ${p.score}/100</span>
        </div>
        <div class="pick-open-modal">
          <span>¿Deseas buscar con fotos?</span>
          <button type="button" data-open-picker="${side}">Ver lista completa de ${compareCat}</button>
        </div>
      </div>
    `;
  });

  renderComparison();
}

/**
 * Listado del modal de seleccion:
 * Bloqueado estrictamente a los productos de compareCat.
 */
function pickerItems(q = '') {
  let list = products.filter(p => p.cat === compareCat);
  q = q.toLowerCase();
  if (q) {
    list = list.filter(p => (p.name + ' ' + p.brand).toLowerCase().includes(q));
  }

  const listEl = $('#pickerList');
  if (!listEl) return;

  listEl.innerHTML = list.map(p => `
    <button class="picker-item" data-pick="${p.id}" type="button">
      ${imageMarkup(p, 'picker-thumb', true)}
      <span>
        <strong>${p.name}</strong>
        <small>${p.brand} · ${p.cat}</small>
      </span>
      <b>${money(p.price)}</b>
    </button>
  `).join('') || `<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--muted);">No hay modelos coincidentes en ${compareCat}.</p>`;
}

function openPicker(side) {
  sideToPick = side;
  const titleEl = $('#pickerTitle');
  if (titleEl) {
    titleEl.textContent = `Seleccionar Componente ${side.toUpperCase()} de ${compareCat}`;
  }
  const searchEl = $('#pickerSearch');
  if (searchEl) {
    searchEl.placeholder = `Buscar dentro de ${compareCat}…`;
    searchEl.value = '';
  }
  pickerItems();
  const modal = $('#pickerModal');
  if (modal && typeof modal.showModal === 'function') modal.showModal();
}

function pick(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (p.cat !== compareCat) {
    return toast(`Solo puedes comparar modelos dentro de la categoría ${compareCat}`);
  }
  selected[sideToPick] = p;
  const modal = $('#pickerModal');
  if (modal && typeof modal.close === 'function') modal.close();
  renderSelection();
}

function compareValue(a, b, key) {
  const nums = [a, b].map(v => parseFloat(String(v).replace(/[^0-9.]/g, '')));
  if (nums.some(Number.isNaN) || nums[0] === nums[1]) return ['', ''];
  const lowerWins = /consumo|tdp|ruido|peso|precio|latencia|respuesta/i.test(key);
  const aw = lowerWins ? nums[0] < nums[1] : nums[0] > nums[1];
  return aw ? ['winner', ''] : ['', 'winner'];
}

function renderComparison() {
  const box = $('#comparison');
  if (!box) return;
  const a = selected.a, b = selected.b;
  if (!a || !b) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');

  const recommendation = VersusRecommendation.evaluate(a, b, compareCat);
  const keys = [...new Set([...Object.keys(a.specs || {}), ...Object.keys(b.specs || {})])];

  box.innerHTML = `
    <div class="comparison-guide"><span>Precio</span><span>El valor destacado indica la opción más conveniente para esa métrica.</span></div>
    <div class="spec-row">
      <span class="${a.price < b.price ? 'winner' : ''}">${money(a.price)}</span>
      <span>Precio estimado</span>
      <span class="${b.price < a.price ? 'winner' : ''}">${money(b.price)}</span>
    </div>
    ${keys.map(k => {
      const valA = a.specs[k] || '—';
      const valB = b.specs[k] || '—';
      const cls = compareValue(valA, valB, k);
      return `
        <div class="spec-row">
          <span class="${cls[0]}">${valA}</span>
          <span>${k}</span>
          <span class="${cls[1]}">${valB}</span>
        </div>
      `;
    }).join('')}
    <div class="verdict">
      <div>
        <small>RECOMENDACIÓN · ${compareCat.toUpperCase()}</small>
        <h3>${recommendation.general ? recommendation.general.name : 'Elección muy equilibrada'}</h3>
        <p>${recommendation.explanation}</p>
        <p>${recommendation.bestPerformance ? `<b>Mejor rendimiento:</b> ${recommendation.bestPerformance.name}. ` : ''}${recommendation.bestValue && recommendation.bestValue !== recommendation.bestPerformance ? `<b>Mejor valor:</b> ${recommendation.bestValue.name}.` : ''}</p>
        <details class="recommendation-details"><summary>¿Por qué?</summary><p>Métricas: ${recommendation.metrics.join(', ') || 'score y precio disponibles'}.</p>${recommendation.general ? `<p>Rendimiento: ${recommendation.winnerData.performance}/100 · Valor: ${recommendation.winnerData.value}/100 · Características: ${recommendation.winnerData.features}/100 · Puntuación final: ${recommendation.winnerData.final}/100</p>` : ''}</details>
      </div>
      <div class="score"><span>PUNTUACIÓN FINAL</span><b>${recommendation.scores.a.final} — ${recommendation.scores.b.final}</b></div>
    </div>
  `;
}

/**
 * Búsqueda opcional complementaria en servidor de datasets abiertos
 */
async function remoteSearch(query) {
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

function startComparisonFromQuery(query) {
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

  compareCat = category;
  selected.a = comparableMatches[0];
  selected.b = comparableMatches[1]
    || categoryProducts.find(p => p.id !== selected.a.id)
    || selected.a;

  populateCompareCategories();
  setCompareCategory(category, null, 'a', false);
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
async function loadDataset() {
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
  products = results.flat().filter(p => p && p.id && p.name && p.cat);

  // 5. Deduplicar por id
  const seenIds = new Set();
  products = products.filter(p => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });

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

// Inicialización de Eventos de Usuario
document.addEventListener('click', e => {
  const heroResult = e.target.closest('[data-hero-result]');
  if (heroResult) {
    const product = products.find(item => item.id === heroResult.dataset.heroResult);
    if (product) {
      setCompareCategory(product.cat, product, 'a');
      const input = $('#heroSearch');
      if (input) input.value = product.name;
      renderHeroSuggestions('');
      const compEl = document.querySelector('.compare-section');
      if (compEl) compEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast(`Selecciona el segundo modelo para comparar con ${product.name}`);
    }
    return;
  }

  // Clic en chip de categoria del catálogo
  const cat = e.target.closest('[data-cat]');
  if (cat) {
    const next = cat.dataset.cat;
    activeCat = next;
    renderCats();
    renderProducts();
    if (next !== 'Todos') {
      setCompareCategory(next);
      toast(`Comparador enfocado en: ${next}`);
    }
  }

  // Clic en botón "COMPARAR" de una tarjeta del catálogo
  const add = e.target.closest('[data-add]');
  if (add) {
    const item = products.find(x => x.id === add.dataset.add);
    if (item) {
      setCompareCategory(item.cat, item, 'a');
      const compEl = $('#comparador') || document.querySelector('.compare-section');
      if (compEl) compEl.scrollIntoView({ behavior: 'smooth' });
      toast(`Enfrentamiento preparado para ${item.cat}: ${item.name}`);
    }
  }

  // Clic en chip de categoria del comparador
  const compBtn = e.target.closest('[data-compare-cat]');
  if (compBtn) {
    const c = compBtn.dataset.compareCat;
    setCompareCategory(c);
  }

  // Clic en abrir modal de exploracion de modelos
  const openP = e.target.closest('[data-open-picker]');
  if (openP) {
    openPicker(openP.dataset.openPicker);
  }

  // Clic en seleccionar item del modal
  const p = e.target.closest('[data-pick]');
  if (p) pick(p.dataset.pick);

  // Clic en cerrar modal
  const close = e.target.closest('[data-close]');
  if (close) {
    const dlg = document.getElementById(close.dataset.close);
    if (dlg && typeof dlg.close === 'function') dlg.close();
  }
});

// Evento al cambiar directamente el desplegable de modelo en la tarjeta A o B
document.addEventListener('change', e => {
  const categorySelect = e.target.closest('[data-compare-select]');
  if (categorySelect) {
    setCompareCategory(categorySelect.value);
    return;
  }

  const sel = e.target.closest('.card-dropdown');
  if (sel) {
    const side = sel.dataset.side;
    const id = sel.value;
    const found = products.find(x => x.id === id);
    if (found) {
      selected[side] = found;
      renderSelection();
      toast(`Componente ${side.toUpperCase()} cambiado a: ${found.name}`);
    }
  }
});

const pickerSearchEl = $('#pickerSearch');
if (pickerSearchEl) pickerSearchEl.oninput = e => pickerItems(e.target.value);

const catalogSearchEl = $('#catalogSearch');
if (catalogSearchEl) {
  catalogSearchEl.oninput = renderProducts;
  catalogSearchEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') remoteSearch(e.target.value);
  });
}

const categorySearchEl = $('#categorySearch');
if (categorySearchEl) categorySearchEl.oninput = renderCats;

const sortSelectEl = $('#sortSelect');
if (sortSelectEl) sortSelectEl.onchange = renderProducts;

const heroSearchEl = $('#heroSearch');
if (heroSearchEl) {
  heroSearchEl.addEventListener('input', e => renderHeroSuggestions(e.target.value));
  heroSearchEl.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.target.value = '';
      renderHeroSuggestions('');
    }
  });
  heroSearchEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value;
      if (startComparisonFromQuery(q)) return;

      activeCat = 'Todos';
      if (catalogSearchEl) catalogSearchEl.value = q;
      const catSec = $('#catalogo');
      if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
      renderCats();
      renderProducts();
      remoteSearch(q);
    }
  });
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (heroSearchEl) heroSearchEl.focus();
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('.hero-search-wrap')) renderHeroSuggestions('');
});

const swapBtn = $('#swapButton');
if (swapBtn) {
  swapBtn.onclick = () => {
    [selected.a, selected.b] = [selected.b, selected.a];
    renderSelection();
    toast('Posiciones intercambiadas');
  };
}

// Iniciar aplicación cargando los datasets modulares
loadDataset();
