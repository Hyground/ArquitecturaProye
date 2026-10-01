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
export const catPhoto = {
  CPU: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=700&q=80',
  GPU: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=700&q=80',
  RAM: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&w=700&q=80',
  'Placa base': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80',
  Almacenamiento: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80',
  'Memoria USB': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=700&q=80',
  Ventiladores: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=700&q=80',
  Gabinete: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=700&q=80',
  Teclado: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80',
  Mouse: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=80',
  Monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80',
  Consola: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=700&q=80',
  Control: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=700&q=80',
  Audífonos: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
  Impresora: 'assets/hardware-hero.png',
  Escáner: 'assets/hardware-hero.png',
  default: 'assets/hardware-hero.png'
};
export const photo = product =>
  (product && product.image) ||
  (product && catPhoto[product.cat]) ||
  catPhoto.default;

export const $ = selector => document.querySelector(selector);
export const money = value => new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(value);