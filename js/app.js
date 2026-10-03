import {
  $, products, selected, money
} from './state.js';
import { toast } from './ui.js';
import { renderAdvisor } from './advisor.js';
import {
  setCompareCategory, renderSelection, pickerItems, openPicker, pick
} from './comparison.js';
import {
  remoteSearch, startComparisonFromQuery, loadDataset
} from './data.js';
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

// Inicialización de Eventos de Usuario
document.addEventListener('click', e => {
  const advisorOption = e.target.closest('[data-advisor]');
  if (advisorOption) {
    document.querySelectorAll('.advisor-option').forEach(button => button.classList.toggle('active', button === advisorOption));
    renderAdvisor(advisorOption.dataset.advisor);
  }
  const advisorCategory = e.target.closest('[data-advisor-cat]');
  if (advisorCategory) {
    const category = advisorCategory.dataset.advisorCat;
    setCompareCategory(category);
    const comparisonSection = document.querySelector('.compare-section');
    if (comparisonSection) comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast(`Comparación de ${category} preparada`);
  }


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
      toast(`Comparación preparada para ${product.name}`);
    }
    return;
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

const heroSearchEl = $('#heroSearch');
if (heroSearchEl) {
  heroSearchEl.addEventListener('input', e => renderHeroSuggestions(e.target.value));
  heroSearchEl.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.target.value = '';
      renderHeroSuggestions('');
    }
  });
  heroSearchEl.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (!q) return;
      renderHeroSuggestions('');
      if (startComparisonFromQuery(q)) return;
      await remoteSearch(q);
      if (e.target.value.trim() !== q) return;
      if (!startComparisonFromQuery(q)) {
        toast('No encontramos modelos. Prueba con otra marca o elige una categoría.');
      }
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
