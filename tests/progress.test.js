import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { emptyState, levelFor, evaluateBadges, buildPath, nextStep } from '../js/progress.js';
import { chapters, labs, badges, levels, interests } from '../js/catalog.js';
import { validateBank, levelFor as routeLevel } from '../js/quiz-core.js';

test('levels are ordered and the level maths is continuous', () => {
  assert.deepEqual(
    levels.map((l) => l.min),
    [...levels.map((l) => l.min)].sort((a, b) => a - b),
  );
  assert.equal(levelFor(0).title, levels[0].title);
  assert.equal(levelFor(levels[1].min).index, 1);
  assert.equal(levelFor(levels[1].min - 1).index, 0);
  assert.equal(levelFor(10_000).next, null);
  const mid = levelFor((levels[1].min + levels[2].min) / 2);
  assert.ok(mid.ratio > 0.4 && mid.ratio < 0.6);
});

test('badges are earned from state, once', () => {
  const s = emptyState();
  assert.deepEqual(evaluateBadges(s), []);
  s.quizzes.intro = { score: 3, total: 8, level: 'newbie' };
  for (const c of chapters.filter((c) => c.group === 'wave1')) s.visited[c.id] = 1;
  const earned = evaluateBadges(s).map((b) => b.id);
  assert.ok(earned.includes('first-step'));
  assert.ok(earned.includes('wave1'));
  for (const id of earned) s.badges[id] = 1;
  assert.deepEqual(evaluateBadges(s), []);
  assert.equal(new Set(badges.map((b) => b.id)).size, badges.length);
});

test('diagnostic score keeps the three original routes', () => {
  assert.equal(routeLevel(4, 8), 'newbie');
  assert.equal(routeLevel(5, 8), 'moderate');
  assert.equal(routeLevel(6, 8), 'moderate');
  assert.equal(routeLevel(7, 8), 'advanced');
});

test('the personalised path follows level, interests and learning style', () => {
  const s = emptyState();
  const newbie = buildPath({ level: 'newbie' }, s);
  assert.equal(newbie[0].chapter, 'history');
  assert.equal(newbie.at(-1).id, 'quiz:final');
  assert.equal(newbie.filter((step) => step.kind === 'checkin').length, 3);

  const advanced = buildPath({ level: 'advanced' }, s);
  assert.ok(!advanced.some((step) => step.chapter === 'history' || step.chapter === 'idea'));
  const moderate = buildPath({ level: 'moderate' }, s);
  assert.ok(moderate.some((step) => step.chapter === 'idea'));
  assert.ok(!moderate.some((step) => step.chapter === 'history'));

  // An interest in AI pulls computer vision and NLP to the front of the first wave.
  const ai = buildPath({ level: 'advanced', interests: ['ai'] }, s);
  assert.deepEqual(
    ai
      .filter((step) => step.kind === 'chapter')
      .slice(0, 2)
      .map((step) => step.chapter),
    ['vision', 'nlp'],
  );
  // Hands-on learners meet each lab before its theory; readers get the reading pages.
  const hands = buildPath({ level: 'advanced', style: 'hands-on' }, s);
  const visionSteps = hands.filter((step) => step.chapter === 'vision').map((step) => step.kind);
  assert.deepEqual(visionSteps, ['lab', 'chapter']);
  // Only computer vision has a lab; the other chapters keep an open application slot.
  assert.equal(hands.filter((step) => step.kind === 'lab').length, 1);
  const reading = buildPath({ level: 'advanced', style: 'reading' }, s);
  assert.ok(reading.find((step) => step.kind === 'chapter').href.startsWith('reading.html#'));

  s.visited.mobile = 1;
  s.path.skipped = ['lab:mobile'];
  const steps = buildPath({ level: 'advanced' }, s);
  assert.equal(nextStep(steps).id, 'chapter:wireless');
});

test('every interest, chapter and lab points at something real', async () => {
  const pages = new Set();
  for (const c of chapters) {
    pages.add(c.story.split('#')[0]);
    pages.add(c.reading.split('#')[0]);
    if (c.lab) assert.ok(labs[c.lab], c.id);
  }
  for (const i of interests)
    for (const id of i.chapters)
      assert.ok(
        chapters.some((c) => c.id === id),
        id,
      );
  for (const [id, lab] of Object.entries(labs)) {
    assert.ok(
      chapters.some((c) => c.id === lab.chapter),
      id,
    );
    pages.add(lab.page.split('#')[0]);
  }
  for (const page of pages) await readFile(new URL('../' + page, import.meta.url));
});

test('check-in banks are valid', async () => {
  const banks = JSON.parse(await readFile(new URL('../checkins.json', import.meta.url), 'utf8'));
  for (const wave of ['wave1', 'wave2', 'wave3']) {
    validateBank(banks[wave]);
    assert.ok(banks[wave].length >= 5, wave);
  }
});
