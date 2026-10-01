import {
  $, products, cats, compareCat, selected, sideToPick,
  setCompareCat, setSideToPick, photo, money
} from './state.js';
import { toast } from './ui.js';
function enableChipDragScroll() {
  const nav = $('#compareNav');
  if (!nav || nav.dataset.dragReady) return;
  nav.dataset.dragReady = 'true';

  let dragging = false;
  let moved = false;
  let startX = 0;
  let startScrollLeft = 0;

  nav.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') return;
    dragging = true;
    moved = false;
    startX = event.clientX;
    startScrollLeft = nav.scrollLeft;
  });

  nav.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 5) {
      if (!moved) {
        moved = true;
        nav.classList.add('is-dragging');
        nav.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      nav.scrollLeft = startScrollLeft - distance;
    }
  });

  const stopDragging = event => {
    if (!dragging) return;
    dragging = false;
    nav.classList.remove('is-dragging');
    if (nav.hasPointerCapture(event.pointerId)) nav.releasePointerCapture(event.pointerId);
    // El clic sintético ocurre justo después de pointerup. Si no ocurre,
    // libera el estado para que el siguiente clic real nunca quede bloqueado.
    setTimeout(() => { moved = false; }, 0);
  };

  nav.addEventListener('pointerup', stopDragging);
  nav.addEventListener('pointercancel', stopDragging);
  nav.addEventListener('click', event => {
    if (!moved) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  nav.addEventListener('wheel', event => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    nav.scrollLeft += event.deltaY;
  }, { passive: false });
}

export function populateCompareCategories() {
  const nav = $('#compareNav');
  if (!nav) return;
  const availableCats = cats.filter(c => c !== 'Todos');

  nav.innerHTML = availableCats.map(c => {
    const count = products.filter(p => p.cat === c).length;
    return `
      <button class="compare-cat-btn ${c === compareCat ? 'active' : ''}" data-compare-cat="${c}" type="button">
        <span>${c}</span>
        <small>(${count})</small>
      </button>
    `;
  }).join('');
  enableChipDragScroll();
}

/**
 * Fija la categoria activa del comparador.
 * Garantiza que Componente A y Componente B pertenezcan ESTRICTAMENTE a la misma categoria.
 */
export function setCompareCategory(newCat, specificProduct = null, targetSide = 'a') {
  setCompareCat(newCat);

  // Actualiza estilo activo en chips
  document.querySelectorAll('.compare-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.compareCat === newCat);
  });

  const catProducts = products.filter(p => p.cat === newCat);
  if (catProducts.length === 0) return;

  if (specificProduct) {
    if (targetSide === 'a') {
      selected.a = specificProduct;
      selected.b = catProducts.find(p => p.id !== specificProduct.id) || catProducts[0];
    } else {
      selected.b = specificProduct;
      selected.a = catProducts.find(p => p.id !== specificProduct.id) || catProducts[0];
    }
  } else {
    // Si la seleccion actual no es de esta categoria, auto-asigna los 2 primeros modelos de ella
    if (!selected.a || selected.a.cat !== newCat || !selected.b || selected.b.cat !== newCat) {
      selected.a = catProducts[0];
      selected.b = catProducts.length > 1 ? catProducts[1] : catProducts[0];
    }
  }

  renderSelection();
}

/**
 * Renderiza los componentes A y B.
 * Incluye un selector directo por desplegable con SOLO los modelos de esa categoria,
 * impidiendo mezclar tipos de componentes incompatibles (ej. USB vs CPU).
 */
export function renderSelection() {
  const catProducts = products.filter(p => p.cat === compareCat);

  ['a', 'b'].forEach(side => {
    const p = selected[side] || catProducts[0];
    selected[side] = p;
    const quickSpecs = p && p.specs ? Object.entries(p.specs).slice(0, 2) : [];
    const el = $(`#pick${side.toUpperCase()}`);
    if (!el) return;

    if (!p) {
      el.className = 'pick-card';
      el.innerHTML = `
        <span class="side-label">COMPONENTE ${side.toUpperCase()}</span>
        <span class="plus">+</span>
        <strong>Sin componentes</strong>
        <small>No hay modelos cargados en ${compareCat}</small>
      `;
      return;
    }

    el.className = 'pick-card selected';
    el.innerHTML = `
      <span class="side-label">COMPONENTE ${side.toUpperCase()} · ${compareCat.toUpperCase()}</span>
      <div class="picked-image-wrap">
        <img class="picked-image" src="${photo(p)}" alt="${p.name}">
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
        <div class="picked-highlights">
          <div class="picked-price"><small>PRECIO ESTIMADO</small><b>${money(p.price)}</b></div>
          <div class="picked-score" aria-label="Puntaje ${p.score} de 100">
            <span>PUNTAJE</span>
            <strong>${p.score}</strong>
            <small>/100</small>
          </div>
        </div>
        <div class="picked-quick-specs">
          ${quickSpecs.map(([label, value]) => `<span><small>${label}</small><b>${value}</b></span>`).join('')}
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
export function pickerItems(q = '') {
  let list = products.filter(p => p.cat === compareCat);
  q = q.toLowerCase();
  if (q) {
    list = list.filter(p => (p.name + ' ' + p.brand).toLowerCase().includes(q));
  }

  const listEl = $('#pickerList');
  if (!listEl) return;

  listEl.innerHTML = list.map(p => `
    <button class="picker-item" data-pick="${p.id}" type="button">
      <img class="picker-thumb" src="${photo(p)}" alt="${p.name}">
      <span>
        <strong>${p.name}</strong>
        <small>${p.brand} · ${p.cat}</small>
      </span>
      <b>${money(p.price)}</b>
    </button>
  `).join('') || `<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--muted);">No hay modelos coincidentes en ${compareCat}.</p>`;
}

export function openPicker(side) {
  setSideToPick(side);
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

export function pick(id) {
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

  const winner = a.score === b.score ? null : (a.score > b.score ? a : b);
  const keys = [...new Set([...Object.keys(a.specs || {}), ...Object.keys(b.specs || {})])];

  box.innerHTML = `
    <div class="verdict">
      <div>
        <small>VEREDICTO · ${compareCat.toUpperCase()}</small>
        <h3>${winner ? `${winner.name} obtiene la ventaja general` : 'Empate técnico'}</h3>
      </div>
      <div class="score">
        <span>PUNTUACIÓN</span>
        <b>${a.score} — ${b.score}</b>
      </div>
    </div>
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
  `;
}