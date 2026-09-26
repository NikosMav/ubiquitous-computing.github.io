import test from 'node:test';
import assert from 'node:assert/strict';
import { handGesture, bodyPose, faceAction } from '../js/vision-missions.js';

test('vision: gestures and poses from landmark geometry', () => {
  const hand = (extended, pinch = false) => {
    const p = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.8 }));
    p[0] = { x: 0.5, y: 0.9 };
    p[9] = { x: 0.5, y: 0.6 };
    p[5] = { x: 0.45, y: 0.62 };
    [
      [8, 6],
      [12, 10],
      [16, 14],
      [20, 18],
    ].forEach(([tip, pip], i) => {
      const x = 0.42 + i * 0.05;
      p[pip] = { x, y: 0.6 };
      p[tip] = { x, y: extended[i] ? 0.4 : 0.75 };
    });
    p[4] = pinch ? { ...p[8] } : { x: 0.25, y: 0.62 };
    return p;
  };
  assert.equal(handGesture(hand([false, false, false, false])), 'fist');
  assert.equal(handGesture(hand([true, true, true, true])), 'open');
  assert.equal(handGesture(hand([true, false, false, false])), 'point');
  assert.equal(handGesture(hand([true, false, false, false], true)), 'pinch');

  const pose = (wrists) => {
    const p = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    p[0] = { x: 0.5, y: 0.2, visibility: 1 };
    p[11] = { x: 0.6, y: 0.35, visibility: 1 };
    p[12] = { x: 0.4, y: 0.35, visibility: 1 };
    p[15] = { ...wrists[0], visibility: 1 };
    p[16] = { ...wrists[1], visibility: 1 };
    return p;
  };
  assert.equal(
    bodyPose(
      pose([
        { x: 0.6, y: 0.1 },
        { x: 0.4, y: 0.1 },
      ]),
    ),
    'both-up',
  );
  assert.equal(
    bodyPose(
      pose([
        { x: 0.6, y: 0.1 },
        { x: 0.4, y: 0.6 },
      ]),
    ),
    'one-up',
  );
  assert.equal(
    bodyPose(
      pose([
        { x: 0.95, y: 0.36 },
        { x: 0.05, y: 0.36 },
      ]),
    ),
    't-pose',
  );

  const face = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  Object.assign(face, {
    10: { x: 0.5, y: 0.2 },
    152: { x: 0.5, y: 0.8 },
    13: { x: 0.5, y: 0.6 },
    14: { x: 0.5, y: 0.61 },
    234: { x: 0.3, y: 0.5 },
    454: { x: 0.7, y: 0.5 },
    1: { x: 0.5, y: 0.5 },
  });
  assert.equal(faceAction(face), null);
  assert.equal(faceAction({ ...face, 14: { x: 0.5, y: 0.7 }, length: 478 }), 'mouth');
});
