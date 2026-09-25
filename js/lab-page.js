// Mounts the lab named by [data-uc-lab] on a standalone lab page.
import { completeLab } from './progress.js';

const host = document.querySelector('[data-uc-lab]');
if (host) {
  const id = host.dataset.ucLab;
  import(`./labs/${id}.js`)
    .then((module) => module.mount(host, { onComplete: () => completeLab(id) }))
    .catch(() => {
      host.textContent =
        'Το εργαστήριο δεν φορτώθηκε. Ανανέωσε τη σελίδα ή δοκίμασε έναν σύγχρονο browser.';
    });
}
