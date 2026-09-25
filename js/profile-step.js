// Optional second step of the diagnostic quiz: interests and learning style.
// Together with the score they shape the personalised learning path.
import { saveProfile, getState } from './progress.js';
import { interests, styles } from './catalog.js';

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

export function renderProfileStep(host, { onDone } = {}) {
  const current = getState().profile ?? {};
  const form = el('form', 'profile-step');
  form.append(
    el('h3', 'profile-step__title', 'Φτιάξε τη διαδρομή σου'),
    el(
      'p',
      'profile-step__text',
      'Προαιρετικά: πες μας τι σε ενδιαφέρει και πώς σου αρέσει να μαθαίνεις.',
    ),
  );
  const interestSet = el('fieldset', 'profile-step__group');
  interestSet.append(el('legend', null, 'Τι σε ενδιαφέρει;'));
  const chips = el('div', 'profile-step__chips');
  for (const interest of interests) {
    const label = el('label', 'profile-step__chip');
    const input = el('input');
    input.type = 'checkbox';
    input.name = 'interests';
    input.value = interest.id;
    input.checked = (current.interests ?? []).includes(interest.id);
    label.append(input, el('span', null, interest.label));
    chips.append(label);
  }
  interestSet.append(chips);
  const styleSet = el('fieldset', 'profile-step__group');
  styleSet.append(el('legend', null, 'Πώς προτιμάς να μαθαίνεις;'));
  const styleRow = el('div', 'profile-step__chips');
  for (const style of styles) {
    const label = el('label', 'profile-step__chip');
    const input = el('input');
    input.type = 'radio';
    input.name = 'style';
    input.value = style.id;
    input.checked = style.id === (current.style ?? 'story');
    label.title = style.text;
    label.append(input, el('span', null, style.label));
    styleRow.append(label);
  }
  styleSet.append(styleRow);
  const actions = el('div', 'profile-step__actions');
  const save = el('button', 'profile-step__save', 'Αποθήκευση διαδρομής');
  save.type = 'submit';
  const skip = el('button', 'profile-step__skip', 'Όχι τώρα');
  skip.type = 'button';
  actions.append(save, skip);
  const status = el('p', 'profile-step__status');
  status.setAttribute('role', 'status');
  form.append(interestSet, styleSet, actions, status);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    saveProfile({ interests: data.getAll('interests'), style: data.get('style') ?? 'story' });
    status.replaceChildren('Η διαδρομή σου είναι έτοιμη. ');
    const link = el('a', null, 'Δες τη στη «Διαδρομή μου»');
    link.href = 'journey.html#path';
    status.append(link);
    onDone?.(true);
  });
  skip.addEventListener('click', () => {
    form.remove();
    onDone?.(false);
  });
  host.append(form);
  return form;
}
