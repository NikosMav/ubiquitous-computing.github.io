// Marks completed camera experiments on the lab hub.
import { getState } from './progress.js';
import { visionExperiments } from './catalog.js';

function render(state = getState()) {
  for (const card of document.querySelectorAll('[data-lab]')) {
    const done = Boolean(state.labs[card.dataset.lab]);
    card.classList.toggle('is-done', done);
    card.querySelector('[data-lab-status]').textContent = done ? 'Ολοκληρώθηκε ✓' : 'Άνοιγμα';
  }
  const finished = visionExperiments.filter((e) => state.labs['vision-' + e.id]).length;
  const summary = document.querySelector('[data-lab-progress]');
  if (summary) {
    summary.hidden = finished === 0;
    summary.textContent = `Έχεις ολοκληρώσει ${finished} από ${visionExperiments.length} πειράματα.`;
  }
}
render();
addEventListener('uc:progress', ({ detail }) => render(detail.state));
