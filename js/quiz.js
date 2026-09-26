import { sampleQuestions, learningRoute, validateBank, levelFor } from './quiz-core.js';
import { recordIntro, recordFinal } from './progress.js';
import { renderProfileStep } from './profile-step.js';

const root = document.querySelector('#quiz');
const status = document.querySelector('#quiz-status');
const content = document.querySelector('#quiz-content');
const mode = root.dataset.mode;
let questions = [],
  position = 0,
  score = 0;
const answers = [];
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
};

function renderQuestion(focus = false) {
  const question = questions[position];
  content.replaceChildren();
  status.textContent = `Ερώτηση ${position + 1} από ${questions.length}`;
  const progress = element('progress', '', 'quiz-progress');
  progress.max = questions.length;
  progress.value = position;
  progress.setAttribute('aria-label', 'Ολοκληρωμένες ερωτήσεις');
  const form = element('form');
  const fieldset = element('fieldset');
  const legend = element('legend', question.question);
  legend.tabIndex = -1;
  fieldset.append(legend);
  const submit = element('button', 'Έλεγχος απάντησης');
  submit.type = 'submit';
  submit.disabled = true;
  const labels = question.options.map((option, index) => {
    const label = element('label', '', 'quiz-option');
    const input = element('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = String(index);
    input.required = true;
    input.addEventListener('change', () => {
      submit.disabled = false;
    });
    label.append(input, element('span', option));
    fieldset.append(label);
    return label;
  });
  const feedback = element('p', '', 'feedback');
  feedback.hidden = true;
  feedback.setAttribute('role', 'status');
  let checked = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (checked) {
      position++;
      if (position === questions.length) renderResult();
      else renderQuestion(true);
      return;
    }
    const chosen = form.querySelector('input:checked');
    if (!chosen) return;
    checked = true;
    const selected = question.options[Number(chosen.value)];
    const correct = question.answer ?? question.correctAnswer;
    const isCorrect = selected === correct;
    score += Number(isCorrect);
    answers.push({ question: question.question, selected, correct });
    labels.forEach((label, index) => {
      label.querySelector('input').disabled = true;
      if (question.options[index] === correct) label.classList.add('correct');
      else if (index === Number(chosen.value)) label.classList.add('incorrect');
    });
    feedback.textContent = isCorrect
      ? `Σωστά! ${correct}`
      : `Η σωστή απάντηση είναι: ${correct}. Συνέχισε για να μάθεις περισσότερα.`;
    feedback.hidden = false;
    progress.value = position + 1;
    submit.textContent =
      position + 1 === questions.length ? 'Δες το αποτέλεσμα' : 'Επόμενη ερώτηση';
    submit.focus();
  });
  form.append(fieldset, feedback, submit);
  content.append(progress, form);
  if (focus) legend.focus();
}

function renderResult() {
  status.textContent = 'Το quiz ολοκληρώθηκε.';
  content.replaceChildren();
  const result = element('div', '', 'quiz-result');
  const title = element('h2', `${score} / ${questions.length}`);
  title.tabIndex = -1;
  result.append(
    title,
    element('p', 'Το αποτέλεσμα είναι μια αφετηρία για εξερεύνηση, όχι βαθμός ή πιστοποίηση.'),
  );
  const route =
    mode === 'intro'
      ? learningRoute(score, questions.length)
      : {
          title: 'Επιστροφή στα κεφάλαια',
          href: 'reading.html',
          description: 'Μπορείς να επιστρέψεις στη θεωρία και να δοκιμάσεις ξανά όποτε θέλεις.',
        };
  result.append(element('p', route.description));
  const actions = element('div', '', 'actions');
  const link = element('a', route.title, 'button');
  link.href = route.href;
  const download = element('button', 'Αποθήκευση αποτελέσματος', 'secondary');
  download.type = 'button';
  download.addEventListener('click', () => {
    const text =
      `Διάχυτη υπολογιστική\n${mode === 'intro' ? 'Quiz αφετηρίας' : 'Τελικό quiz'}: ${score}/${questions.length}\n\n` +
      answers
        .map((a) => `${a.question}\nΗ απάντησή σου: ${a.selected}\nΣωστή απάντηση: ${a.correct}`)
        .join('\n\n') +
      '\n\nΠτυχιακή εργασία Νικόλαου Μαυραπίδη, ΕΚΠΑ (2023).\nhttps://nikosmav.github.io/ubiquitous-computing.github.io/\n';
    const url = URL.createObjectURL(
      new Blob(['\ufeff', text], { type: 'text/plain;charset=utf-8' }),
    );
    const a = element('a');
    a.href = url;
    a.download = 'ubiquitous-computing-quiz.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const restart = element('button', 'Δοκίμασε ξανά', 'secondary');
  restart.type = 'button';
  restart.addEventListener('click', () => {
    position = 0;
    score = 0;
    answers.length = 0;
    questions = sampleQuestions(questions, questions.length);
    renderQuestion(true);
  });
  actions.append(link, download, restart);
  result.append(actions);
  content.append(result);
  if (mode === 'intro') {
    recordIntro(score, questions.length, levelFor(score, questions.length));
    const step = document.createElement('div');
    step.className = 'quiz-profile';
    result.append(step);
    renderProfileStep(step);
  } else recordFinal(score, questions.length);
  title.focus();
}

async function load() {
  status.textContent = 'Φόρτωση ερωτήσεων…';
  try {
    const response = await fetch(mode === 'intro' ? 'intro-questions.json' : 'questions.json');
    if (!response.ok) throw new Error('Question request failed');
    const bank = validateBank(await response.json());
    questions = sampleQuestions(bank, mode === 'intro' ? 8 : Math.min(10, bank.length));
    renderQuestion();
  } catch {
    status.textContent = 'Οι ερωτήσεις δεν φορτώθηκαν. Έλεγξε τη σύνδεση και δοκίμασε ξανά.';
    const retry = element('button', 'Νέα προσπάθεια');
    retry.type = 'button';
    retry.addEventListener('click', () => {
      content.replaceChildren();
      load();
    });
    content.replaceChildren(retry);
  }
}
load();
