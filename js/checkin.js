// Short check-in quizzes at the end of each wave: three questions, instant feedback,
// and the explanation behind every answer.
import { sampleQuestions, validateBank } from './quiz-core.js';
import { recordCheckin, getState } from './progress.js';

let banks;
async function loadBanks() {
  if (!banks) {
    const response = await fetch('checkins.json');
    if (!response.ok) throw new Error('Check-in questions unavailable');
    banks = await response.json();
    Object.values(banks).forEach(validateBank);
  }
  return banks;
}

const titles = { wave1: 'Πρώτο κύμα', wave2: 'Δεύτερο κύμα', wave3: 'Τρίτο κύμα' };
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

export function mountCheckin(host, wave, { count = 3 } = {}) {
  host.classList.add('checkin');
  const intro = () => {
    const best = getState().checkins[wave];
    host.replaceChildren(
      el('p', 'checkin__kicker', `Έλεγχος γνώσεων · ${titles[wave]}`),
      el('h3', 'checkin__title', 'Τρεις γρήγορες ερωτήσεις'),
      el(
        'p',
        'checkin__text',
        best
          ? `Καλύτερο σκορ: ${best.best}/${best.total}. ${best.passed ? 'Τον έχεις περάσει.' : 'Χρειάζονται δύο σωστές για να τον περάσεις.'}`
          : 'Δύο σωστές απαντήσεις αρκούν. Κάθε σωστή απάντηση δίνει πόντους.',
      ),
    );
    const start = el('button', 'checkin__button', best ? 'Ξανά' : 'Ξεκίνα');
    start.type = 'button';
    start.addEventListener('click', run);
    host.append(start);
  };

  async function run() {
    let questions;
    try {
      questions = sampleQuestions((await loadBanks())[wave], count);
    } catch {
      host.replaceChildren(
        el('p', 'checkin__text', 'Οι ερωτήσεις δεν φορτώθηκαν. Δοκίμασε ξανά αργότερα.'),
      );
      return;
    }
    let index = 0;
    let score = 0;
    const ask = () => {
      const q = questions[index];
      const fieldset = el('fieldset', 'checkin__question');
      const legend = el('legend', null, `${index + 1}/${questions.length} · ${q.question}`);
      legend.tabIndex = -1;
      fieldset.append(legend);
      const feedback = el('p', 'checkin__feedback');
      feedback.setAttribute('role', 'status');
      const next = el(
        'button',
        'checkin__button',
        index + 1 === questions.length ? 'Αποτέλεσμα' : 'Επόμενη',
      );
      next.type = 'button';
      next.hidden = true;
      for (const option of sampleQuestions(q.options, q.options.length)) {
        const choice = el('button', 'checkin__option', option);
        choice.type = 'button';
        choice.addEventListener('click', () => {
          const right = option === q.answer;
          score += Number(right);
          fieldset.querySelectorAll('.checkin__option').forEach((b) => {
            b.disabled = true;
            if (b.textContent === q.answer) b.classList.add('is-right');
          });
          if (!right) choice.classList.add('is-wrong');
          feedback.textContent =
            (right ? 'Σωστά! ' : `Η σωστή απάντηση: ${q.answer}. `) + (q.why ?? '');
          next.hidden = false;
          next.focus();
        });
        fieldset.append(choice);
      }
      next.addEventListener('click', () => {
        index++;
        index < questions.length ? ask() : finish();
      });
      host.replaceChildren(
        el('p', 'checkin__kicker', `Έλεγχος γνώσεων · ${titles[wave]}`),
        fieldset,
        feedback,
        next,
      );
      legend.focus({ preventScroll: true });
    };
    const finish = () => {
      recordCheckin(wave, score, questions.length);
      const passed = score / questions.length >= 2 / 3;
      const title = el('h3', 'checkin__title checkin__score', `${score} / ${questions.length}`);
      title.tabIndex = -1;
      const again = el('button', 'checkin__button checkin__button--ghost', 'Νέες ερωτήσεις');
      again.type = 'button';
      again.addEventListener('click', run);
      host.replaceChildren(
        el('p', 'checkin__kicker', `Έλεγχος γνώσεων · ${titles[wave]}`),
        title,
        el(
          'p',
          'checkin__text',
          passed
            ? 'Πέρασες τον έλεγχο! Συνέχισε στο επόμενο κύμα.'
            : 'Σχεδόν! Ξαναδές το κεφάλαιο και δοκίμασε ξανά.',
        ),
        again,
      );
      title.focus({ preventScroll: true });
    };
    ask();
  }
  intro();
}

document
  .querySelectorAll('[data-checkin]')
  .forEach((host) => mountCheckin(host, host.dataset.checkin));
