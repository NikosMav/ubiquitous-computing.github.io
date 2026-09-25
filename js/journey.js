// "Η διαδρομή μου": level, personalised path, profile, badges, station board, certificate.
import {
  getState,
  levelFor,
  buildPath,
  nextStep,
  saveProfile,
  setSkipped,
  readBoard,
  addToBoard,
  reset,
} from './progress.js';
import { chapters, labs, badges, interests, styles, levels } from './catalog.js';

const $ = (selector) => document.querySelector(selector);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
const kinds = { chapter: 'Κεφάλαιο', lab: 'Εργαστήριο', checkin: 'Έλεγχος', quiz: 'Quiz' };

function renderLevel(state) {
  const level = levelFor(state.xp);
  $('[data-level-title]').textContent = level.title;
  $('[data-level-bar]').style.width = Math.round(level.ratio * 100) + '%';
  $('[data-level-text]').textContent = level.next
    ? `${state.xp} XP · ${level.toNext} XP ως «${level.next}»`
    : `${state.xp} XP · ανώτερο επίπεδο`;
  $('[data-level-lead]').textContent = state.xp
    ? `Επίπεδο ${level.index + 1} από ${levels.length}. Συνέχισε να εξερευνάς για να ανέβεις.`
    : 'Κάθε κεφάλαιο, εργαστήριο και quiz σε φέρνει πιο κοντά στο επόμενο επίπεδο.';
  const visited = chapters.filter((c) => state.visited[c.id]).length;
  $('[data-stat="chapters"]').textContent = `${visited}/${chapters.length}`;
  $('[data-stat="labs"]').textContent =
    `${Object.keys(labs).filter((id) => state.labs[id]).length}/${Object.keys(labs).length}`;
  $('[data-stat="badges"]').textContent = `${Object.keys(state.badges).length}/${badges.length}`;
  const final = state.quizzes.final;
  $('[data-stat="quiz"]').textContent = final ? `${final.best}/${final.total}` : '—';
}

function renderPath(state) {
  const host = $('[data-path]');
  host.replaceChildren();
  if (!state.profile?.level) {
    const empty = el('div', 'path-empty');
    empty.append(
      el(
        'p',
        null,
        'Δεν έχεις φτιάξει ακόμη τη διαδρομή σου. Κάνε το διαγνωστικό quiz ή πες μας λίγα για σένα.',
      ),
    );
    const actions = el('div', 'actions');
    const quiz = el('a', 'button', 'Διαγνωστικό quiz');
    quiz.href = 'intro_quiz.html';
    const form = el('a', null, 'Συμπλήρωσε το προφίλ');
    form.href = '#profile';
    actions.append(quiz, form);
    empty.append(actions);
    host.append(empty);
    return;
  }
  const steps = buildPath(state.profile, state);
  const active = steps.filter((s) => !s.skipped);
  const done = active.filter((s) => s.done).length;
  const minutes = active.filter((s) => !s.done).reduce((sum, s) => sum + s.minutes, 0);
  const next = nextStep(steps);

  const summary = el('div', 'path-summary');
  const meter = el('div', 'path-meter');
  meter.setAttribute('role', 'progressbar');
  meter.setAttribute('aria-label', 'Πρόοδος διαδρομής');
  meter.setAttribute('aria-valuemin', '0');
  meter.setAttribute('aria-valuemax', String(active.length));
  meter.setAttribute('aria-valuenow', String(done));
  const fill = el('span');
  fill.style.width = (active.length ? (done / active.length) * 100 : 0) + '%';
  meter.append(fill);
  summary.append(
    el(
      'p',
      'path-summary__count',
      `${done} από ${active.length} βήματα · περίπου ${minutes} λεπτά ακόμη`,
    ),
    meter,
  );
  if (next) {
    const cta = el('a', 'button path-next');
    cta.href = next.href;
    cta.append(el('span', 'path-next__kicker', 'Συνέχισε'), el('span', null, next.title));
    summary.append(cta);
  } else summary.append(el('p', 'path-done', 'Ολοκλήρωσες τη διαδρομή σου! 🌟'));
  host.append(summary);

  const list = el('ol', 'path-list');
  for (const step of steps) {
    const item = el(
      'li',
      'path-step' +
        (step.done ? ' is-done' : '') +
        (step.skipped ? ' is-skipped' : '') +
        (step === next ? ' is-next' : ''),
    );
    const state = step.done
      ? 'Ολοκληρώθηκε'
      : step.skipped
        ? 'Παραλείφθηκε'
        : step === next
          ? 'Επόμενο'
          : 'Εκκρεμεί';
    const marker = el('span', 'path-step__marker');
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = step.done ? '✓' : step.skipped ? '–' : step === next ? '▶' : '';
    const body = el('div', 'path-step__body');
    const link = el('a', 'path-step__title', step.title);
    link.href = step.href;
    const meta = el('p', 'path-step__meta');
    meta.append(el('span', 'tag', kinds[step.kind]), `${step.minutes} λεπτά`);
    if (step.recommended && step.kind !== 'checkin' && step.kind !== 'quiz')
      meta.append(el('span', 'tag tag--star', '★ για σένα'));
    meta.append(el('span', 'visually-hidden', ` · ${state}`));
    body.append(link, meta);
    const skip = el('button', 'path-step__skip', step.skipped ? 'Επαναφορά' : 'Παράλειψη');
    skip.type = 'button';
    skip.setAttribute('aria-label', `${step.skipped ? 'Επαναφορά' : 'Παράλειψη'}: ${step.title}`);
    skip.hidden = step.done;
    skip.addEventListener('click', () => {
      const skipped = new Set(getState().path?.skipped ?? []);
      if (skipped.has(step.id)) skipped.delete(step.id);
      else skipped.add(step.id);
      setSkipped([...skipped]);
    });
    item.append(marker, body, skip);
    list.append(item);
  }
  host.append(list);
}

function renderProfileForm(state) {
  const form = $('[data-profile-form]');
  const interestsHost = form.querySelector('[data-interests]');
  const stylesHost = form.querySelector('[data-styles]');
  if (!interestsHost.childElementCount) {
    for (const interest of interests) {
      const label = el('label', 'chip');
      const input = el('input');
      input.type = 'checkbox';
      input.name = 'interests';
      input.value = interest.id;
      label.append(input, el('span', null, interest.label));
      interestsHost.append(label);
    }
    for (const style of styles) {
      const label = el('label', 'choice');
      const input = el('input');
      input.type = 'radio';
      input.name = 'style';
      input.value = style.id;
      const span = el('span');
      span.append(el('strong', null, style.label), ' ' + style.text);
      label.append(input, span);
      stylesHost.append(label);
    }
  }
  const profile = state.profile ?? {};
  form
    .querySelectorAll('input[name="level"]')
    .forEach((i) => (i.checked = i.value === profile.level));
  form
    .querySelectorAll('input[name="interests"]')
    .forEach((i) => (i.checked = (profile.interests ?? []).includes(i.value)));
  form
    .querySelectorAll('input[name="style"]')
    .forEach((i) => (i.checked = i.value === (profile.style ?? 'story')));
}

$('[data-profile-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const note = $('[data-profile-note]');
  if (!data.get('level')) {
    note.textContent = 'Διάλεξε πρώτα πόσο εξοικειωμένος/η είσαι, ή κάνε το διαγνωστικό quiz.';
    event.currentTarget.querySelector('input[name="level"]').focus();
    return;
  }
  saveProfile({
    level: data.get('level'),
    interests: data.getAll('interests'),
    style: data.get('style') ?? 'story',
  });
  note.textContent = 'Η διαδρομή σου ενημερώθηκε.';
  $('#path').scrollIntoView({ behavior: 'smooth' });
});

function renderBadges(state) {
  const host = $('[data-badges]');
  host.replaceChildren(
    ...badges.map((badge) => {
      const earned = state.badges[badge.id];
      const item = el('li', 'badge' + (earned ? ' is-earned' : ''));
      const icon = el('span', 'badge__icon', earned ? badge.icon : '🔒');
      icon.setAttribute('aria-hidden', 'true');
      item.append(
        icon,
        el('strong', 'badge__title', badge.title),
        el('span', 'badge__text', badge.text),
      );
      if (earned)
        item.append(
          el(
            'span',
            'badge__date',
            new Date(earned).toLocaleDateString('el-GR', { day: 'numeric', month: 'long' }),
          ),
        );
      else item.append(el('span', 'visually-hidden', ' (κλειδωμένο)'));
      return item;
    }),
  );
}

function renderBoard(highlight) {
  const board = readBoard();
  const host = $('[data-board]');
  host.replaceChildren(
    ...(board.length
      ? board.map((entry, index) => {
          const item = el(
            'li',
            'board__row' + (highlight && entry.at === highlight.at ? ' is-me' : ''),
          );
          item.append(
            el('span', 'board__rank', String(index + 1)),
            el('span', 'board__name', entry.name),
            el('span', 'board__meta', `${entry.badges} σήματα`),
            el('span', 'board__xp', `${entry.xp} XP`),
          );
          return item;
        })
      : [el('li', 'board__empty', 'Κανείς δεν έχει καταχωρίσει σκορ ακόμη σε αυτόν τον σταθμό.')]),
  );
}
$('[data-board-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#board-name').value;
  const { entry } = addToBoard(name);
  renderBoard(entry);
});

// A certificate drawn on a canvas and downloaded as an image: the privacy-friendly
// successor of the thesis' commemorative email.
async function certificate() {
  const state = getState();
  const level = levelFor(state.xp);
  const name = $('#certificate-name').value.trim() || 'Εξερευνητής/τρια';
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1000;
  const c = canvas.getContext('2d');
  await document.fonts.ready;
  const gradient = c.createLinearGradient(0, 0, 1600, 1000);
  gradient.addColorStop(0, '#10122e');
  gradient.addColorStop(1, '#080a1f');
  c.fillStyle = gradient;
  c.fillRect(0, 0, 1600, 1000);
  c.fillStyle = 'rgba(65,80,240,0.14)';
  for (let x = 0; x < 1600; x += 40)
    for (let y = 0; y < 1000; y += 40)
      if ((x * 7 + y * 3) % 11 < 3) c.fillRect(x + 6, y + 6, 26, 26);
  c.strokeStyle = '#fbb454';
  c.lineWidth = 4;
  c.strokeRect(40, 40, 1520, 920);
  const logo = new Image();
  logo.src = 'favicon/android-chrome-192x192.png';
  await logo.decode().catch(() => {});
  if (logo.naturalWidth) c.drawImage(logo, 100, 96, 110, 110);
  c.fillStyle = '#fff';
  c.font = '34px "UC Venus", sans-serif';
  c.fillText('ΔΙΑΧΥΤΗ', 240, 145);
  c.fillStyle = '#fbb454';
  c.fillText('ΥΠΟΛΟΓΙΣΤΙΚΗ', 240, 192);
  c.fillStyle = '#c4c8ea';
  c.font = '30px "UC Nasalization", sans-serif';
  c.fillText('ΠΙΣΤΟΠΟΙΗΤΙΚΟ ΕΞΕΡΕΥΝΗΣΗΣ', 100, 330);
  c.fillStyle = '#fff';
  c.font = '96px "UC Morbodoni", serif';
  c.fillText(name, 100, 450);
  c.font = '36px "UC Gothic", sans-serif';
  c.fillStyle = '#c4c8ea';
  const earned = badges.filter((b) => state.badges[b.id]);
  c.fillText(`ολοκλήρωσε το ταξίδι στη διάχυτη υπολογιστική ως «${level.title}»`, 100, 530);
  c.fillText(
    `${state.xp} XP · ${earned.length} σήματα · ${chapters.filter((ch) => state.visited[ch.id]).length} κεφάλαια · ${Object.keys(state.labs).length} εργαστήρια`,
    100,
    590,
  );
  c.font = '64px sans-serif';
  earned.slice(0, 14).forEach((b, i) => c.fillText(b.icon, 100 + i * 96, 720));
  c.font = '26px "UC Gothic", sans-serif';
  c.fillStyle = '#8f95c4';
  c.fillText(
    new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }),
    100,
    860,
  );
  c.fillText(
    'Πρόταση ψηφιακού εκθέματος για το Μουσείο Πληροφορικής και Τηλεπικοινωνιών, ΕΚΠΑ',
    100,
    900,
  );
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diaxyti-ypologistiki-pistopoiitiko.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
}
$('[data-certificate]').addEventListener('click', certificate);
$('[data-reset]').addEventListener('click', () => {
  if (confirm('Να διαγραφεί όλη η πρόοδος από αυτή τη συσκευή;')) reset();
});

function render(state = getState()) {
  renderLevel(state);
  renderPath(state);
  renderProfileForm(state);
  renderBadges(state);
}
render();
renderBoard();
addEventListener('uc:progress', ({ detail }) => render(detail.state));
