// The labs' missions must be winnable and teach the intended lesson; these tests check
// the pure models behind them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { step, newDay, BUDGET } from '../js/labs/cloud.js';
import { runDay } from '../js/labs/smarthome.js';
import { analyse } from '../js/labs/nlp.js';
import { shortest, tour, bestTour } from '../js/labs/lbs.js';
import { stopping } from '../js/labs/smartcar.js';
import { link } from '../js/labs/wireless.js';
import { handGesture, bodyPose, faceAction } from '../js/vision-missions.js';

test('cloud: autoscaling meets the budget, a fixed fleet cannot', () => {
  const day = (opts) => {
    const s = newDay(opts.manual);
    while (s.t < 24) step(s, 0.02, opts);
    return { ratio: s.served / s.total, cost: s.cost };
  };
  const auto = day({ auto: true, manual: 2 });
  assert.ok(auto.ratio >= 0.99 && auto.cost <= BUDGET);
  for (let n = 1; n <= 12; n++) {
    const fixed = day({ auto: false, manual: n });
    assert.ok(!(fixed.ratio >= 0.99 && fixed.cost <= BUDGET), `${n} servers`);
  }
});

test('smart home: sensible rules satisfy every mission, no rules satisfy none', () => {
  const none = runDay([]);
  assert.ok(none.dark > 10 && none.unlocked > 0 && !none.coffee && none.heatWaste > 15);
  const rules = [
    ['enter', 'lightHere'],
    ['leave', 'lightOffHere'],
    ['empty', 'lock'],
    ['wake', 'coffee'],
    ['empty', 'eco'],
    ['arrive', 'comfort'],
  ].map(([trigger, action]) => ({ trigger, action }));
  const good = runDay(rules);
  assert.ok(good.dark <= 10 && good.wasted <= 30);
  assert.equal(good.unlocked, 0);
  assert.equal(good.coffee, true);
  assert.ok(good.heatWaste <= 15 && good.cold <= 15);
});

test('nlp: intents, entities, negation and ambiguity', () => {
  const lights = analyse('Άναψε τα φώτα στο σαλόνι');
  assert.equal(lights.intent.id, 'lights_on');
  assert.equal(lights.room, 'σαλονι');
  assert.equal(analyse('Βάλε τη θερμοκρασία στους 22').number, 22);
  assert.equal(analyse('Κλείσε').intent.id, 'ambiguous');
  assert.equal(analyse('κλείσε τα ρολά').intent.id, 'blinds');
  assert.equal(analyse('Ποιος ήταν ο Mark Weiser;').intent.id, 'weiser');
  assert.equal(analyse('Γεια σου Aria!').intent.id, 'greet');
  assert.ok(analyse('μου αρέσει').sentiment > 0);
  assert.ok(analyse('δεν μου αρέσει').sentiment < 0);
});

test('lbs: Dijkstra and the best tour', () => {
  const direct = shortest('E', '6');
  assert.deepEqual(direct.path, ['E', '6']);
  const targets = ['1', '4', '6'];
  const best = bestTour(targets);
  assert.ok(tour(['1', '4', '6']).length >= best - 1e-9);
  assert.ok(tour(['4', '1', '6']).length > best);
});

test('smart car: reaction time, sensors and friction change the outcome', () => {
  const base = { road: 'dry', sky: 'clear', fitted: new Set(['camera']) };
  assert.equal(stopping({ ...base, kmh: 50, auto: false }).ok, true);
  assert.equal(stopping({ ...base, kmh: 90, auto: false }).ok, false);
  assert.equal(stopping({ ...base, kmh: 90, auto: true }).ok, true);
  const fog = { ...base, sky: 'fog', kmh: 70, auto: true };
  assert.equal(stopping(fog).ok, false);
  assert.equal(stopping({ ...fog, fitted: new Set(['radar']) }).ok, true);
  const ice = { ...base, road: 'ice', auto: true };
  assert.equal(stopping({ ...ice, kmh: 50 }).ok, false);
  assert.equal(stopping({ ...ice, kmh: 30 }).ok, true);
});

test('wireless: range limits and walls', () => {
  assert.equal(link('nfc', 0.03, false).ok, true);
  assert.equal(link('nfc', 1, false).ok, false);
  assert.equal(link('ble', 5, false).ok, true);
  assert.equal(link('wifi', 30, true).ok, false);
  assert.equal(link('g5', 800, false).ok, true);
  assert.ok(link('wifi', 2, false).rate > link('wifi', 30, false).rate);
});

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
