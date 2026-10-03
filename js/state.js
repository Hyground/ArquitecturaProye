export let products = [];
export let cats = ['Todos'];
export let activeCat = 'Todos';
export let compareCat = 'CPU';
export let sideToPick = 'a';
export const selected = { a: null, b: null };

export const setProducts = value => { products = value; };
export const setCats = value => { cats = value; };
export const setActiveCat = value => { activeCat = value; };
export const setCompareCat = value => { compareCat = value; };
export const setSideToPick = value => { sideToPick = value; };
export const $ = selector => document.querySelector(selector);
export const money = value => new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(value);
export const imageLink = product => /^https?:\/\/\S+$/i.test(String(product?.image || '').trim()) ? product.image.trim() : '';
export const imageMarkup = (product, className = '', lazy = false) => {
  const url = imageLink(product);
  return url
    ? `<img${className ? ` class="${className}"` : ''} src="${url}" alt="${product.name}"${lazy ? ' loading="lazy"' : ''} onerror="this.parentElement?.classList.add('image-missing');this.remove();">`
    : '<span class="image-link-placeholder">Sin enlace de imagen</span>';
};
