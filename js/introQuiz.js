import { sampleQuestions, validateBank } from './quiz-core.js';

const start = document.querySelector('#start-quiz-btn');
const question = document.querySelector('#quiz-question');
const options = document.querySelector('#quiz-options');
const feedback = document.querySelector('#quiz-result');
const next = document.querySelector('#story-next-question');
let bank = [],
  questions = [],
  position = 0,
  score = 0,
  answered = false;

function refreshStory() {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    window.ScrollTrigger?.refresh();
  });
}

function showAll() {
  for (const id of ['the-content', 'intro-animation', 'istoria', 'dy', 'dy-2']) {
    document.getElementById(id).style.display = 'block';
  }
  for (const id of ['custom-content-1', 'custom-content-2'])
    document.getElementById(id).style.display = 'none';
  refreshStory();
}

function renderQuestion() {
  answered = false;
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
      const correct = questions[position].answer ?? questions[position].correctAnswer;
      const isCorrect = answer === correct;
      score += Number(isCorrect);
      for (const option of options.children) {
        option.disabled = true;
        if (option.textContent === correct) option.classList.add('correct-answer');
      }
      if (!isCorrect) button.classList.add('incorrect-answer');
      feedback.textContent = isCorrect ? 'Σωστά!' : `Η σωστή απάντηση είναι: ${correct}`;
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

start.addEventListener('click', async () => {
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
    document.querySelector('#quiz-paragraph').hidden = true;
    renderQuestion();
  } catch {
    feedback.textContent = 'Οι ερωτήσεις δεν φορτώθηκαν. Δοκίμασε ξανά ή συνέχισε χωρίς quiz.';
    feedback.style.opacity = '1';
    start.disabled = false;
  }
});

next.addEventListener('click', () => {
  if (!answered) return;
  position++;
  if (position < questions.length) {
    renderQuestion();
    return;
  }
  options.replaceChildren();
  next.hidden = true;
  question.textContent = `Το σκορ σου: ${score}/${questions.length}`;
  const level = score >= 7 ? 'advanced' : score >= 5 ? 'moderate' : 'newbie';
  for (const id of ['newbie-section', 'moderate-section', 'advanced-section'])
    document.getElementById(id).style.display = 'none';
  const result = document.getElementById(`${level}-section`);
  result.classList.remove('hidden');
  result.style.display = 'flex';
  result.querySelector('.result-score').textContent = `Το σκορ σου: ${score}/${questions.length}`;
  feedback.textContent =
    'Μπορείς να ακολουθήσεις την προτεινόμενη διαδρομή ή να εμφανίσεις ολόκληρη την εμπειρία.';
  showAll();
  if (level !== 'newbie') {
    document.getElementById('intro-animation').style.display = 'none';
    document.getElementById('istoria').style.display = 'none';
    document.getElementById(
      level === 'advanced' ? 'custom-content-1' : 'custom-content-2',
    ).style.display = 'block';
    if (level === 'advanced') document.getElementById('dy').style.display = 'none';
  }
  refreshStory();
  result.tabIndex = -1;
  result.focus();
});

document.querySelector('#story-skip-quiz').addEventListener('click', showAll);
document.querySelectorAll('.story-show-all').forEach((button) =>
  button.addEventListener('click', () => {
    showAll();
    document.getElementById('intro-animation').scrollIntoView();
  }),
);
// Open direct links even after a customized route has hidden earlier chapters.
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener('click', () => {
    if (['#istoria', '#dy', '#intro-animation'].includes(link.getAttribute('href'))) showAll();
  }),
);
showAll();
