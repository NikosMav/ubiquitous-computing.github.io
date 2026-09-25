// Visitor progress, points, badges and the personalised learning path.
// Everything stays in this browser (localStorage); nothing is sent anywhere.
import { chapters, labs, badges, levels, xpRules, interests } from './catalog.js';

const KEY = 'uc-progress-v1';
const BOARD_KEY = 'uc-station-board-v1';

export function emptyState() {
  return {
    v: 1,
    xp: 0,
    visited: {},
    theory: {},
    labs: {},
    quizzes: {},
    checkins: {},
    polls: {},
    badges: {},
    profile: null,
    path: { skipped: [] },
    days: [],
  };
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private mode or full storage: progress simply isn't remembered. */
  }
}

export function load() {
  const saved = read(KEY, null);
  const state = { ...emptyState(), ...(saved && saved.v === 1 ? saved : {}) };
  const today = new Date().toISOString().slice(0, 10);
  if (!state.days.includes(today)) {
    state.days = [...state.days, today].slice(-60);
    write(KEY, state);
  }
  return state;
}

let state = typeof localStorage === 'undefined' ? emptyState() : load();

export const getState = () => state;

export function levelFor(xp) {
  let index = 0;
  levels.forEach((level, i) => {
    if (xp >= level.min) index = i;
  });
  const current = levels[index];
  const next = levels[index + 1];
  return {
    index,
    title: current.title,
    next: next?.title ?? null,
    toNext: next ? next.min - xp : 0,
    ratio: next ? (xp - current.min) / (next.min - current.min) : 1,
  };
}

export function evaluateBadges(s) {
  return badges.filter((badge) => !s.badges[badge.id] && badge.test(s));
}

function commit(mutate) {
  const before = state.xp;
  const beforeLevel = levelFor(before).index;
  const next = structuredClone(state);
  const gained = mutate(next) || 0;
  next.xp += gained;
  const events = [];
  if (gained) events.push({ type: 'xp', amount: gained });
  for (const badge of evaluateBadges(next)) {
    next.badges[badge.id] = Date.now();
    next.xp += xpRules.badge;
    events.push({ type: 'badge', badge });
  }
  const level = levelFor(next.xp);
  if (level.index > beforeLevel) events.push({ type: 'level', level });
  state = next;
  write(KEY, state);
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent('uc:progress', { detail: { state, events } }));
  return events;
}

export const markVisited = (id) =>
  commit((s) => {
    if (s.visited[id]) return 0;
    s.visited[id] = Date.now();
    return xpRules.visit;
  });

export const markTheory = (id) =>
  commit((s) => {
    if (s.theory[id]) return 0;
    s.theory[id] = Date.now();
    return xpRules.theory;
  });

export const completeLab = (id) =>
  commit((s) => {
    if (s.labs[id]) return 0;
    s.labs[id] = Date.now();
    if (labs[id]?.chapter && !s.visited[labs[id].chapter]) s.visited[labs[id].chapter] = Date.now();
    return xpRules.lab;
  });

export const recordIntro = (score, total, level) =>
  commit((s) => {
    const first = !s.quizzes.intro;
    s.quizzes.intro = { score, total, level, at: Date.now() };
    s.profile = { ...(s.profile ?? { interests: [], style: 'story' }), level };
    return first ? xpRules.intro : 0;
  });

export const recordFinal = (score, total) =>
  commit((s) => {
    const previous = s.quizzes.final?.best ?? 0;
    s.quizzes.final = { best: Math.max(previous, score), total, last: score, at: Date.now() };
    // Only improvements earn points, so replaying the quiz can't be farmed.
    return Math.max(0, score - previous) * xpRules.finalCorrect;
  });

export const recordCheckin = (wave, score, total) =>
  commit((s) => {
    const previous = s.checkins[wave]?.best ?? 0;
    s.checkins[wave] = {
      best: Math.max(previous, score),
      total,
      passed: Boolean(s.checkins[wave]?.passed) || score / total >= 2 / 3,
    };
    return Math.max(0, score - previous) * xpRules.checkinCorrect;
  });

export const vote = (poll, choice) =>
  commit((s) => {
    const first = !(poll in s.polls);
    s.polls[poll] = choice;
    return first ? xpRules.poll : 0;
  });

export const saveProfile = (profile) =>
  commit((s) => {
    s.profile = { ...(s.profile ?? {}), ...profile };
    return 0;
  });

export const setSkipped = (skipped) =>
  commit((s) => {
    s.path = { ...s.path, skipped };
    return 0;
  });

export function reset() {
  state = emptyState();
  write(KEY, state);
  window.dispatchEvent(new CustomEvent('uc:progress', { detail: { state, events: [] } }));
}

// ---------- Personalised learning path ----------
// Knowledge level decides where the path starts; interests are pulled forward;
// the preferred style decides whether a step opens the story, the text or the lab first.
export function buildPath(profile, s = state) {
  const level = profile?.level ?? 'newbie';
  const style = profile?.style ?? 'story';
  const chosen = new Set(
    (profile?.interests ?? []).flatMap((id) => interests.find((i) => i.id === id)?.chapters ?? []),
  );
  const include = (chapter) =>
    chapter.group !== 'foundations' ||
    level === 'newbie' ||
    (level === 'moderate' && chapter.id === 'idea');
  const order = { foundations: 0, wave1: 1, wave2: 2, wave3: 3 };
  const list = chapters
    .filter(include)
    .map((chapter, index) => ({ chapter, index }))
    .sort(
      (a, b) =>
        order[a.chapter.group] - order[b.chapter.group] ||
        // Within a wave, chosen interests come first; otherwise keep the museum's order.
        Number(chosen.has(b.chapter.id)) - Number(chosen.has(a.chapter.id)) ||
        a.index - b.index,
    )
    .map(({ chapter }) => chapter);

  const steps = [];
  for (const chapter of list) {
    const href = style === 'reading' ? chapter.reading : chapter.story;
    const labId = chapter.lab;
    const lab = labId ? labs[labId] : null;
    const chapterStep = {
      id: 'chapter:' + chapter.id,
      kind: 'chapter',
      chapter: chapter.id,
      title: chapter.title,
      href,
      minutes: chapter.minutes,
      recommended: chosen.has(chapter.id),
      done: Boolean(s.visited[chapter.id]),
    };
    const labStep = lab && {
      id: 'lab:' + labId,
      kind: 'lab',
      chapter: chapter.id,
      title: lab.title,
      href: lab.page,
      minutes: 4,
      recommended: chosen.has(chapter.id) || style === 'hands-on',
      done: Boolean(s.labs[labId]),
    };
    if (labStep && style === 'hands-on') steps.push(labStep, chapterStep);
    else steps.push(chapterStep, ...(labStep ? [labStep] : []));
    const last = list.filter((c) => c.group === chapter.group).at(-1);
    if (last === chapter && chapter.group !== 'foundations')
      steps.push({
        id: 'checkin:' + chapter.group,
        kind: 'checkin',
        chapter: chapter.group,
        title:
          'Έλεγχος γνώσεων: ' +
          { wave1: 'πρώτο', wave2: 'δεύτερο', wave3: 'τρίτο' }[chapter.group] +
          ' κύμα',
        href: 'journey.html#checkin-' + chapter.group,
        minutes: 2,
        recommended: true,
        done: Boolean(s.checkins[chapter.group]?.passed),
      });
  }
  steps.push({
    id: 'quiz:final',
    kind: 'quiz',
    title: 'Τελικό quiz γνώσεων',
    href: 'knowledge_quiz.html',
    minutes: 4,
    recommended: true,
    done: Boolean(s.quizzes.final),
  });
  const skipped = new Set(s.path?.skipped ?? []);
  return steps.map((step) => ({ ...step, skipped: skipped.has(step.id) }));
}

export function nextStep(steps) {
  return steps.find((step) => !step.done && !step.skipped) ?? null;
}

// ---------- Station leaderboard ----------
// A museum kiosk is shared by many visitors, so the board lives on the device and
// uses a pseudonym. It is never uploaded.
export function readBoard() {
  return read(BOARD_KEY, []);
}
export function addToBoard(name, xp = state.xp) {
  const clean = String(name).trim().replace(/\s+/g, ' ').slice(0, 20) || 'Ανώνυμος';
  const entry = { name: clean, xp, badges: Object.keys(state.badges).length, at: Date.now() };
  const board = [...readBoard(), entry].sort((a, b) => b.xp - a.xp || a.at - b.at).slice(0, 20);
  write(BOARD_KEY, board);
  return { board, entry };
}
export function clearBoard() {
  write(BOARD_KEY, []);
}
