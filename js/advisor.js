import { $, cats } from './state.js';
const advisorProfiles = {
  gaming: { label: 'Gaming', title: 'Más rendimiento, menos cuellos de botella', description: 'Compara primero la GPU y el CPU. Revisa puntuación, memoria, frecuencia y consumo antes de pagar por potencia que quizá no necesitas.', categories: ['GPU', 'CPU', 'Monitor'], metric: 'Prioriza FPS, resolución y equilibrio entre CPU y GPU.' },
  work: { label: 'Trabajo', title: 'Fluidez para tu jornada diaria', description: 'Para multitarea importan la memoria, el almacenamiento y un monitor cómodo. Compara capacidad, velocidad y conectividad.', categories: ['RAM', 'Almacenamiento', 'Monitor'], metric: 'Prioriza capacidad, rapidez y comodidad de uso.' },
  creator: { label: 'Creación', title: 'Potencia para editar, diseñar y producir', description: 'Las cargas creativas necesitan procesamiento sostenido y una buena pantalla. Contrasta GPU, CPU y monitor según tu software.', categories: ['GPU', 'CPU', 'Monitor'], metric: 'Prioriza VRAM, núcleos, resolución y precisión visual.' },
  upgrade: { label: 'Actualizar PC', title: 'Mejora donde realmente se nota', description: 'Antes de reemplazar todo, compara el componente que limita tu equipo y comprueba compatibilidad, consumo y ganancia real.', categories: ['CPU', 'GPU', 'RAM', 'Almacenamiento'], metric: 'Prioriza compatibilidad, mejora obtenida y costo.' }
};
export function renderAdvisor(profileKey = 'gaming') {
  const result = $('#advisorResult');
  if (!result) return;
  const profile = advisorProfiles[profileKey] || advisorProfiles.gaming;
  const available = profile.categories.filter(category => cats.includes(category));
  const fallback = cats.filter(category => category !== 'Todos').slice(0, 3);
  const recommendations = available.length ? available : fallback;
  result.innerHTML = `<div class="advisor-result-top"><span>RECOMENDACIÓN · ${profile.label.toUpperCase()}</span><span class="advisor-status"><i></i> Basado en tu objetivo</span></div><h3>${profile.title}</h3><p>${profile.description}</p><div class="advisor-focus"><span>EN QUÉ FIJARTE</span><strong>${profile.metric}</strong></div><div class="advisor-actions"><div class="advisor-categories">${recommendations.map((category, index) => `<button type="button" data-advisor-cat="${category}"><small>0${index + 1}</small>${category}</button>`).join('')}</div>${recommendations[0] ? `<button class="advisor-cta" type="button" data-advisor-cat="${recommendations[0]}">Comparar ${recommendations[0]} <span>→</span></button>` : ''}</div>`;
}