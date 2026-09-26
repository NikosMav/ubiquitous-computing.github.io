// The diagnostic quiz is the entrance to the story (thesis, section 4.2.1): the chapters
// stay closed until the visitor finishes it, and the score chooses how much of the
// history they see. Safeguards keep the gate from becoming a trap: a remembered route
// for returning visitors, deep links that pass straight through, and a deliberate
// choice to see the whole journey without the quiz.
import { sampleQuestions, validateBank, levelFor } from './quiz-core.js';
import { recordIntro, saveProfile, getState } from './progress.js';
import { renderProfileStep } from './profile-step.js';

const start = document.querySelector('#start-quiz-btn');
const question = document.querySelector('#quiz-question');
const options = document.querySelector('#quiz-options');
const feedback = document.querySelector('#quiz-result');
const next = document.querySelector('#story-next-question');
const skip = document.querySelector('#story-skip-quiz');
const container = document.querySelector('.quiz-container');
const content = document.getElementById('the-content');
const meter = document.createElement('div');
meter.className = 'quiz-meter';
meter.setAttribute('aria-hidden', 'true');

// The original prototype's encouragement, restored.
const cheers = [
  'Μπράβο! Λίγοι απαντούν σωστά σε αυτό!',
  'Πολύ σωστά!',
  'Μπράβο! Συνέχισε έτσι!',
  'Ουάου! Το πέτυχες!',
  'Το κάνεις να φαίνεται εύκολο!',
];
const consolations = {
  general: [
    'Δεν πειράζει, πάμε στην επόμενη!',
    'Μην αγχώνεσαι, πάμε στην επόμενη!',
    'Χμμ, μάλλον μπερδεύτηκες…',
  ],
  people: ['Ποιος;!', 'Μάλλον τους μπέρδεψες…', 'Λάθος πρόσωπο!'],
  place: ['Πού;!', 'Κοντά, αλλά όχι εκεί…'],
};
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const routes = {
  newbie: 'Από τα βασικά',
  moderate: 'Κατευθείαν στην κεντρική ιδέα',
  advanced: 'Κατευθείαν στο κυρίως θέμα',
  full: 'Ολόκληρη η διαδρομή',
};

let bank = [],
  questions = [],
  position = 0,
  score = 0,
  answered = false;

function refreshStory() {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    window.ScrollTrigger?.refresh();
    window.dispatchEvent(new Event('story:layout'));
  });
}

// Opens the chapters and shows the part of the story that fits the route, exactly as
// the 2023 prototype did: newcomers get everything, the others skip the history.
function openRoute(route) {
  content.style.display = 'block';
  document.documentElement.classList.remove('story-gated');
  for (const id of ['intro-animation', 'istoria', 'dy', 'dy-2'])
    document.getElementById(id).style.display = 'block';
  for (const id of ['custom-content-1', 'custom-content-2'])
    document.getElementById(id).style.display = 'none';
  if (route === 'moderate' || route === 'advanced') {
    document.getElementById('intro-animation').style.display = 'none';
    document.getElementById('istoria').style.display = 'none';
    document.getElementById(
      route === 'advanced' ? 'custom-content-1' : 'custom-content-2',
    ).style.display = 'block';
    if (route === 'advanced') document.getElementById('dy').style.display = 'none';
  }
  refreshStory();
}
function closeGate() {
  content.style.display = 'none';
  document.documentElement.classList.add('story-gated');
}
const savedRoute = () => getState().profile?.route ?? null;

function renderMeter() {
  meter.replaceChildren(
    ...questions.map((_, i) => {
      const dot = document.createElement('span');
      if (i < position) dot.className = 'is-done';
      if (i === position) dot.className = 'is-current';
      return dot;
    }),
  );
}

function renderQuestion() {
  answered = false;
  renderMeter();
  question.textContent = `${position + 1} / ${questions.length} — ${questions[position].question}`;
  options.replaceChildren();
  feedback.textContent = '';
  next.hidden = true;
  for (const answer of questions[position].options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-button';
    button.textContent = answer;
    button.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const q = questions[position];
      const correct = q.answer ?? q.correctAnswer;
      const isCorrect = answer === correct;
      score += Number(isCorrect);
      for (const option of options.children) {
        option.disabled = true;
        if (option.textContent === correct) option.classList.add('correct-answer');
      }
      if (!isCorrect) button.classList.add('incorrect-answer');
      feedback.textContent = isCorrect
        ? pick(cheers)
        : `${pick(consolations[q.feedback] ?? consolations.general)} Η σωστή απάντηση: ${correct}.`;
      feedback.style.opacity = '1';
      next.textContent =
        position + 1 === questions.length ? 'Δες τη διαδρομή σου' : 'Επόμενη ερώτηση';
      next.hidden = false;
      next.focus();
    });
    options.append(button);
  }
  question.focus({ preventScroll: true });
}

async function startQuiz() {
  start.disabled = true;
  try {
    if (!bank.length) {
      const response = await fetch('intro-questions.json');
      if (!response.ok) throw new Error('Question bank unavailable');
      bank = validateBank(await response.json());
    }
    questions = sampleQuestions(bank, 8);
    position = 0;
    score = 0;
    start.hidden = true;
    skip.hidden = true;
    document.querySelector('#quiz-paragraph').hidden = true;
    container.querySelector('.quiz-welcome')?.remove();
    for (const id of ['newbie-section', 'moderate-section', 'advanced-section'])
      document.getElementById(id).style.display = 'none';
    question.hidden = false;
    question.before(meter);
    renderQuestion();
  } catch {
    feedback.textContent =
      'Οι ερωτήσεις δεν φορτώθηκαν. Δοκίμασε ξανά ή δες ολόκληρη τη διαδρομή χωρίς quiz.';
    feedback.style.opacity = '1';
    start.disabled = false;
    skip.hidden = false;
  }
}

function showResult(level, shownScore) {
  for (const id of ['newbie-section', 'moderate-section', 'advanced-section'])
    document.getElementById(id).style.display = 'none';
  const result = document.getElementById(`${level}-section`);
  result.classList.remove('hidden');
  result.style.display = 'flex';
  result.querySelector('.result-score').textContent =
    shownScore ?? `Η διαδρομή σου: ${routes[level].toLowerCase()}`;
  return result;
}

function finish() {
  options.replaceChildren();
  meter.remove();
  next.hidden = true;
  const level = levelFor(score, questions.length);
  question.textContent = `Το σκορ σου: ${score}/${questions.length}`;
  feedback.textContent = 'Η διαδρομή σου ξεκλείδωσε. Συνέχισε να κυλάς προς τα κάτω.';
  recordIntro(score, questions.length, level);
  saveProfile({ route: level });
  const result = showResult(level, `Το σκορ σου: ${score}/${questions.length}`);
  openRoute(level);
  renderProfileStep(container, { onDone: refreshStory });
  retakeButton();
  result.tabIndex = -1;
  result.focus({ preventScroll: true });
}

function retakeButton() {
  if (container.querySelector('.story-retake')) return;
  const again = document.createElement('button');
  again.type = 'button';
  again.className = 'story-continue story-retake';
  again.textContent = 'Ξανακάνε το quiz';
  again.addEventListener('click', () => {
    container.querySelector('.profile-step')?.remove();
    again.remove();
    startQuiz();
  });
  container.append(again);
}

// Returning visitors keep their route and are greeted instead of gated.
function welcomeBack(route) {
  const box = document.createElement('div');
  box.className = 'quiz-welcome';
  const text = document.createElement('p');
  text.textContent = `Καλώς ήρθες ξανά! Η διαδρομή σου: «${routes[route]}».`;
  const actions = document.createElement('div');
  actions.className = 'story-route-actions';
  const go = document.createElement('a');
  go.className = 'is-primary';
  go.href = '#the-content';
  go.textContent = 'Συνέχεια';
  const all = document.createElement('button');
  all.type = 'button';
  all.className = 'is-ghost';
  all.textContent = routes.full;
  all.addEventListener('click', () => chooseFull(true));
  actions.append(go);
  if (route !== 'full' && route !== 'newbie') actions.append(all);
  box.append(text, actions);
  document.querySelector('#quiz-paragraph').hidden = true;
  start.textContent = 'Ξανακάνε το quiz';
  skip.hidden = true;
  start.before(box);
}

function chooseFull(scroll) {
  saveProfile({ route: 'full' });
  openRoute('full');
  if (scroll) document.getElementById('intro-animation').scrollIntoView({ behavior: 'smooth' });
}

start.addEventListener('click', startQuiz);
next.addEventListener('click', () => {
  if (!answered) return;
  position++;
  if (position < questions.length) renderQuestion();
  else finish();
});
skip.addEventListener('click', (event) => {
  event.preventDefault();
  chooseFull(true);
});
document
  .querySelectorAll('.story-show-all')
  .forEach((button) => button.addEventListener('click', () => chooseFull(true)));
// In-page links to chapters a shorter route hides open the whole journey.
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener('click', () => {
    if (['#istoria', '#dy', '#intro-animation'].includes(link.getAttribute('href')))
      openRoute('full');
  }),
);

// ---------- Entry ----------
const hashTarget =
  location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
const route = savedRoute();
if (hashTarget && content.contains(hashTarget)) {
  // Deep links from the chapters, labs or the journey pass straight through.
  openRoute(route ?? 'full');
  if (hashTarget.offsetParent === null) openRoute('full');
} else if (route) {
  openRoute(route);
  welcomeBack(route);
  if (route !== 'full') showResult(route);
} else closeGate();
