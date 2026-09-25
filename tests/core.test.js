import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sampleQuestions, learningRoute, validateBank } from '../js/quiz-core.js';
import { visibleConnections, stopStream, cameraError } from '../js/vision-core.js';

test('both real banks have unique choices and a valid correct answer', async () => {
  for (const file of ['questions.json', 'intro-questions.json']) {
    const bank = JSON.parse(await readFile(new URL('../' + file, import.meta.url), 'utf8'));
    assert.equal(validateBank(bank), bank);
    if (file.startsWith('intro')) assert.ok(bank.length >= 8);
  }
});
test('sampling is without replacement and does not mutate the bank', () => {
  const bank = Array.from({ length: 12 }, (_, id) => ({ id }));
  const sampled = sampleQuestions(bank, 8, () => 0.25);
  assert.equal(new Set(sampled).size, 8);
  assert.deepEqual(
    bank.map((q) => q.id),
    Array.from({ length: 12 }, (_, id) => id),
  );
  assert.notDeepEqual(sampled, bank.slice(0, 8));
});
test('learning route boundaries retain the original three paths', () => {
  for (const score of [0, 4]) assert.equal(learningRoute(score, 8).href, 'reading.html#history');
  for (const score of [5, 6]) assert.equal(learningRoute(score, 8).href, 'reading.html#principles');
  for (const score of [7, 8]) assert.equal(learningRoute(score, 8).href, 'reading.html#mobile-fp');
});
test('missing or hidden joints never shift the original skeleton indices', () => {
  const points = [{ visibility: 1 }, { visibility: 0.1 }, { visibility: 1 }, { visibility: 0.9 }];
  const edges = [
    { start: 0, end: 1 },
    { start: 1, end: 2 },
    { start: 2, end: 3 },
    { start: 3, end: 4 },
  ];
  assert.deepEqual(visibleConnections(points, edges), [{ start: 2, end: 3 }]);
  assert.equal(points.length, 4);
});
test('cleanup stops every media track and handles an absent stream', () => {
  let stopped = 0;
  stopStream({ getTracks: () => [{ stop: () => stopped++ }, { stop: () => stopped++ }] });
  stopStream(undefined);
  assert.equal(stopped, 2);
});
test('camera errors provide an actionable message', () => {
  assert.match(cameraError({ name: 'NotAllowedError' }), /ρυθμίσεις/);
  assert.match(cameraError({ name: 'NotFoundError' }), /Σύνδεσε/);
  assert.match(cameraError(new Error()), /δοκίμασε ξανά/);
});
