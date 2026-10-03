(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined') module.exports = api;
  root.VersusRecommendation = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const RECOMMENDATION_WEIGHTS = { performance: 0.45, value: 0.35, features: 0.20 };
  const CATEGORY_METRICS = {
    CPU: ['Núcleos / hilos', 'Frecuencia boost', 'Caché'],
    GPU: ['VRAM', 'Frecuencia boost', 'Bus de memoria'],
    RAM: ['Capacidad', 'Velocidad', 'Latencia'],
    Almacenamiento: ['Capacidad', 'Lectura', 'Escritura'],
    Monitor: ['Resolución', 'Frecuencia de actualización', 'Tasa de refresco', 'Tiempo de respuesta'],
    Router: ['Velocidad', 'Bandas', 'Puertos'],
    NAS: ['Bahías', 'RAM', 'Red', 'Expansión'],
    'Placa base': ['Memoria', 'M.2', 'PCIe', 'Red'],
    'Tarjeta de red': ['Velocidad', 'Puertos'],
    'Memoria USB': ['Capacidad', 'Velocidad de lectura', 'Velocidad de escritura']
  };
  const CATEGORY_USE_CASES = {
    CPU: 'gaming, productividad y uso general', GPU: 'gaming y creación visual', RAM: 'multitarea y cargas de trabajo con memoria',
    Almacenamiento: 'sistema, juegos y transferencias de archivos', Monitor: 'gaming, productividad y multimedia',
    Router: 'hogares con varios dispositivos y red rápida', NAS: 'copias de seguridad y almacenamiento compartido'
  };
  const parseNumericSpec = value => {
    if (typeof value === 'number') return value;
    const match = String(value || '').replace(',', '.').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  };
  const normalize = (value, min, max, invert) => max === min ? 50 : (invert ? (max - value) : (value - min)) * 100 / (max - min);
  function metricValue(product, key) {
    const value = parseNumericSpec(product.specs && product.specs[key]);
    if (value === null) return null;
    return /latencia|respuesta|ruido|consumo|tdp/i.test(key) ? -value : value;
  }
  function evaluate(a, b, category) {
    const metrics = CATEGORY_METRICS[category] || Object.keys(a.specs || {}).filter(key => metricValue(a, key) !== null && metricValue(b, key) !== null).slice(0, 4);
    const performanceRaw = product => {
      const values = metrics.map(key => metricValue(product, key)).filter(value => value !== null);
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : (product.score || 50);
    };
    const rawA = performanceRaw(a), rawB = performanceRaw(b);
    const low = Math.min(rawA, rawB), high = Math.max(rawA, rawB);
    const performanceA = normalize(rawA, low, high), performanceB = normalize(rawB, low, high);
    const closePrice = Math.abs(a.price - b.price) / Math.max(a.price, b.price) < 0.05;
    const priceA = closePrice ? 50 : normalize(a.price, Math.min(a.price, b.price), Math.max(a.price, b.price), true);
    const priceB = closePrice ? 50 : normalize(b.price, Math.min(a.price, b.price), Math.max(a.price, b.price), true);
    const featureA = Math.round(metrics.filter(key => a.specs && a.specs[key]).length / Math.max(metrics.length, 1) * 100);
    const featureB = Math.round(metrics.filter(key => b.specs && b.specs[key]).length / Math.max(metrics.length, 1) * 100);
    const valueA = Math.round(performanceA * 0.45 + priceA * 0.55), valueB = Math.round(performanceB * 0.45 + priceB * 0.55);
    const finalA = Math.round(performanceA * RECOMMENDATION_WEIGHTS.performance + valueA * RECOMMENDATION_WEIGHTS.value + featureA * RECOMMENDATION_WEIGHTS.features);
    const finalB = Math.round(performanceB * RECOMMENDATION_WEIGHTS.performance + valueB * RECOMMENDATION_WEIGHTS.value + featureB * RECOMMENDATION_WEIGHTS.features);
    const bestPerformance = rawA === rawB ? null : rawA > rawB ? a : b;
    const bestValue = valueA === valueB ? null : valueA > valueB ? a : b;
    const general = Math.abs(finalA - finalB) < 5 ? null : finalA > finalB ? a : b;
    const winnerData = general === a ? { performance: performanceA, value: valueA, features: featureA, final: finalA } : { performance: performanceB, value: valueB, features: featureB, final: finalB };
    const cheaper = a.price <= b.price ? a : b;
    const difference = Math.abs(a.price - b.price);
    const percent = Math.round(difference / Math.max(a.price, b.price) * 100);
    const lead = metrics.find(key => metricValue(general || bestPerformance || a, key) !== null) || 'datos disponibles';
    const explanation = general
      ? `${general.name} equilibra mejor las métricas comparables y el precio. ${cheaper === general ? `Cuesta ${difference ? `$${difference} (${percent}%) menos` : 'lo mismo'} que la alternativa` : `El aumento de $${difference} se acompaña de una ventaja en ${lead}`}, útil para ${CATEGORY_USE_CASES[category] || 'el uso indicado por sus especificaciones'}.`
      : `Ambos ofrecen una propuesta muy similar con los datos comparables; la elección depende principalmente de ${difference ? `la diferencia de $${difference}` : 'las preferencias de uso'} y ${lead}.`;
    return { metrics, bestPerformance, bestValue, general, explanation, winnerData, scores: { a: { performance: performanceA, value: valueA, features: featureA, final: finalA }, b: { performance: performanceB, value: valueB, features: featureB, final: finalB } } };
  }
  return { RECOMMENDATION_WEIGHTS, CATEGORY_METRICS, parseNumericSpec, evaluate };
});
