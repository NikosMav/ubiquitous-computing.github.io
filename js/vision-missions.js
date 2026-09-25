// Guided challenges for the camera experiments. Classification is simple geometry on the
// landmarks the model returns; nothing about identity is inferred.
import { completeLab } from './progress.js';

const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Hand: 21 landmarks (0 wrist, tips 4/8/12/16/20, middle joints 6/10/14/18).
export function handGesture(p) {
  if (!p || p.length < 21) return null;
  const size = d(p[0], p[9]) || 1e-6;
  const extended = [
    [8, 6],
    [12, 10],
    [16, 14],
    [20, 18],
  ].map(([tip, pip]) => d(p[tip], p[0]) > d(p[pip], p[0]) * 1.12);
  const thumbOut = d(p[4], p[5]) > size * 0.55;
  if (d(p[4], p[8]) < size * 0.28 && !extended[2] && !extended[3]) return 'pinch';
  if (!extended.some(Boolean)) return 'fist';
  if (extended.every(Boolean) && thumbOut) return 'open';
  if (extended[0] && !extended[2] && !extended[3]) return 'point';
  return null;
}

// Pose: 33 landmarks (0 nose, 11/12 shoulders, 15/16 wrists).
export function bodyPose(p) {
  if (!p || p.length < 17) return null;
  const seen = (i) => (p[i].visibility ?? 1) > 0.5;
  if (![0, 11, 12, 15, 16].every(seen)) return null;
  const shoulders = Math.abs(p[11].x - p[12].x) || 1e-6;
  const up = [15, 16].filter((i) => p[i].y < p[0].y);
  const level = [15, 16].every((i, k) => Math.abs(p[i].y - p[11 + k].y) < shoulders * 0.45);
  if (level && Math.abs(p[15].x - p[16].x) > shoulders * 2.3) return 't-pose';
  if (up.length === 2) return 'both-up';
  if (up.length === 1) return 'one-up';
  return null;
}

// Face mesh: 478 landmarks (1 nose tip, 13/14 inner lips, 10 forehead, 152 chin, 234/454 sides).
export function faceAction(p) {
  if (!p || p.length < 455) return null;
  const height = d(p[10], p[152]) || 1e-6;
  if (d(p[13], p[14]) / height > 0.09) return 'mouth';
  const turn = (p[1].x - p[234].x) / (p[454].x - p[234].x || 1e-6);
  if (turn < 0.33) return 'turn-a';
  if (turn > 0.67) return 'turn-b';
  return null;
}

const catalogue = {
  hand: {
    classify: (groups) => groups.map(handGesture),
    missions: [
      ['point', '☝️', 'Δείξε με τον δείκτη'],
      ['fist', '✊', 'Κλείσε τη γροθιά σου'],
      ['open', '🖐️', 'Άνοιξε την παλάμη'],
      ['pinch', '🤏', 'Ένωσε αντίχειρα και δείκτη (τσίμπημα)'],
    ],
  },
  pose: {
    classify: (groups) => groups.map(bodyPose),
    missions: [
      ['one-up', '🙋', 'Σήκωσε το ένα χέρι πάνω από το κεφάλι'],
      ['both-up', '🙌', 'Σήκωσε και τα δύο χέρια'],
      ['t-pose', '🧍', 'Άνοιξε τα χέρια οριζόντια, σε σχήμα Τ'],
    ],
  },
  face: {
    classify: (groups) => groups.map(faceAction),
    missions: [
      ['mouth', '😮', 'Άνοιξε το στόμα'],
      ['turn-a', '↩️', 'Γύρνα το κεφάλι προς τη μία πλευρά'],
      ['turn-b', '↪️', 'Γύρνα το κεφάλι προς την άλλη πλευρά'],
    ],
  },
};

const page = typeof document === 'undefined' ? null : document.querySelector('[data-demo]');
const config = page && catalogue[page.dataset.demo];
if (config) {
  const done = new Set();
  // A pose has to hold for a few frames, so a single noisy frame can't tick a box.
  const streak = new Map();
  const box = document.createElement('section');
  box.className = 'vision-missions';
  box.setAttribute('aria-labelledby', 'vision-missions-title');
  box.innerHTML = `<h2 id="vision-missions-title">Αποστολές</h2><p class="vision-missions__now" aria-live="polite">Άνοιξε την κάμερα για να ξεκινήσεις.</p>`;
  const list = document.createElement('ol');
  const items = new Map();
  for (const [id, icon, text] of config.missions) {
    const li = document.createElement('li');
    li.innerHTML = `<span aria-hidden="true">${icon}</span><span>${text}</span>`;
    items.set(id, li);
    list.append(li);
  }
  box.append(list);
  const now = box.querySelector('.vision-missions__now');
  page.querySelector('.demo-explanation')?.prepend(box);

  addEventListener('vision:frame', ({ detail }) => {
    const labels = config.classify(detail.groups).filter(Boolean);
    const label = labels[0] ?? null;
    const mission = config.missions.find(([id]) => id === label);
    now.textContent = mission
      ? `Αναγνωρίστηκε: ${mission[2].toLowerCase()} ${mission[1]}`
      : detail.groups.length
        ? 'Αναγνώριση σε εξέλιξη…'
        : 'Δεν εντοπίζεται τίποτα.';
    for (const [id] of config.missions)
      streak.set(id, labels.includes(id) ? (streak.get(id) ?? 0) + 1 : 0);
    for (const [id, count] of streak) {
      if (count < 4 || done.has(id)) continue;
      done.add(id);
      items.get(id).classList.add('is-done');
      if (done.size === config.missions.length) {
        now.textContent = 'Ολοκλήρωσες όλες τις αποστολές! Το πείραμα προστέθηκε στη διαδρομή σου.';
        completeLab('vision');
      }
    }
  });
}
