import {
  $, products, selected, setActiveCat
} from './state.js';
import { toast } from './ui.js';
import { renderAdvisor } from './advisor.js';
import { renderCats, renderProducts } from './catalog.js';
import {
  setCompareCategory, renderSelection, pickerItems, openPicker, pick
} from './comparison.js';
import {
  remoteSearch, startComparisonFromQuery, loadDataset
} from './data.js';
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

  // Clic en chip de categoria del catálogo
  const cat = e.target.closest('[data-cat]');
  if (cat) {
    const next = cat.dataset.cat;
    setActiveCat(next);
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

const sortSelectEl = $('#sortSelect');
if (sortSelectEl) sortSelectEl.onchange = renderProducts;

const heroSearchEl = $('#heroSearch');
if (heroSearchEl) {
  heroSearchEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value;
      if (startComparisonFromQuery(q)) return;

      setActiveCat('Todos');
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

const swapBtn = $('#swapButton');
if (swapBtn) {
  swapBtn.onclick = () => {
    [selected.a, selected.b] = [selected.b, selected.a];
    renderSelection();
    toast('Posiciones intercambiadas');
  };
}

loadDataset();
