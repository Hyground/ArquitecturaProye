import { $, products, cats, activeCat, setCats, photo, money } from './state.js';
import { renderAdvisor } from './advisor.js';
export function updateDatasetState() {
  const uniqueCats = [...new Set(products.map(p => p.cat).filter(Boolean))].sort();
  setCats(['Todos', ...uniqueCats]);
  const countEl = $('#productCount');
  const catEl = $('#categoryCount');
  if (countEl) countEl.textContent = new Intl.NumberFormat('es').format(products.length);
  if (catEl) catEl.textContent = uniqueCats.length;
  renderAdvisor(document.querySelector('.advisor-option.active')?.dataset.advisor || 'gaming');
}

export function renderCats() {
  const grouped = {};
  cats.slice(1).forEach(c => {
    // Clasificacion dinamica por la familia declarada en los productos
    const sample = products.find(p => p.cat === c);
    const family = (sample && sample.family) || 'Otros';
    (grouped[family] ??= []).push(c);
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

export function filtered() {
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

export function renderProducts() {
  const list = filtered();
  const resultsEl = $('#resultsCount');
  const gridEl = $('#productGrid');

  if (resultsEl) resultsEl.textContent = `${list.length} resultados`;
  if (!gridEl) return;

  gridEl.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${photo(p)}" alt="${p.cat} ${p.brand}" loading="lazy">
        <span class="tag">${p.cat.toUpperCase()}</span>
      </div>
      <div class="product-top">
        <span>${p.brand}</span>
        <span class="rating">${(p.score / 10).toFixed(1)} / 10</span>
      </div>
      <h3>${p.name}</h3>
      <p>${p.specs ? Object.values(p.specs).slice(0, 2).join(' · ') : ''}</p>
      <div class="price-row">
        <b>${money(p.price)}</b>
        <button data-add="${p.id}" title="Comparar este modelo">COMPARAR</button>
      </div>
    </article>
  `).join('') || '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted);">No encontramos productos con esos filtros.</p>';
}

/**
 * Renderiza los chips horizontales de categorias en la barra superior del comparador.
 * Al hacer clic en un chip, se fija la categoria y se actualizan ambos componentes.
 */