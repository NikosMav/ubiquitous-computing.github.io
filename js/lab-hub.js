// Marks completed labs on the lab hub.
import { getState } from './progress.js';
import { labs } from './catalog.js';

function render(state = getState()) {
  for (const card of document.querySelectorAll('[data-lab]')) {
    const done = Boolean(state.labs[card.dataset.lab]);
    card.classList.toggle('is-done', done);
    card.querySelector('[data-lab-status]').textContent = done ? 'Ολοκληρώθηκε ✓' : 'Άνοιγμα';
  }
  const total = Object.keys(labs).length;
  const finished = Object.keys(labs).filter((id) => state.labs[id]).length;
  const summary = document.querySelector('[data-lab-progress]');
  if (summary) {
    summary.hidden = finished === 0;
    summary.textContent = `Έχεις ολοκληρώσει ${finished} από ${total} εργαστήρια.`;
  }
}
render();
addEventListener('uc:progress', ({ detail }) => render(detail.state));
