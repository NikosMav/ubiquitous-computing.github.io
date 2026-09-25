// Lab: smart house. The visitor writes "if … then …" rules and replays one day in
// Alex's home, scored on comfort, energy and security.
import { h, frame, button, segmented } from './kit.js';

const ROOMS = ['Είσοδος', 'Σαλόνι', 'Κουζίνα', 'Υπνοδωμάτιο'];
// Where Alex is, minute by minute (null means nobody is home).
const schedule = [
  [0, 'Υπνοδωμάτιο'],
  [7 * 60, 'Κουζίνα'],
  [7 * 60 + 40, 'Είσοδος'],
  [7 * 60 + 45, null],
  [18 * 60 + 30, 'Είσοδος'],
  [18 * 60 + 35, 'Σαλόνι'],
  [20 * 60, 'Κουζίνα'],
  [21 * 60, 'Σαλόνι'],
  [23 * 60, 'Υπνοδωμάτιο'],
];
const START = 6 * 60;
const END = 24 * 60;
const WAKE = 6 * 60 + 30;
const SLEEP = 23 * 60 + 15;
const where = (minute) => schedule.filter(([m]) => m <= minute).at(-1)[1];
const isDark = (minute) => minute < 7 * 60 + 30 || minute >= 19 * 60 + 40;

export const triggers = {
  enter: 'κάποιος μπαίνει σε δωμάτιο',
  leave: 'κάποιος βγαίνει από δωμάτιο',
  empty: 'το σπίτι αδειάζει',
  arrive: 'κάποιος επιστρέφει σπίτι',
  wake: 'η ώρα είναι 06:25',
  sunset: 'δύει ο ήλιος',
  sleep: 'ο Alex πέφτει για ύπνο',
};
export const actions = {
  lightHere: 'άναψε το φως σε εκείνο το δωμάτιο',
  lightOffHere: 'σβήσε το φως σε εκείνο το δωμάτιο',
  lightsOff: 'σβήσε όλα τα φώτα',
  eco: 'θέρμανση σε οικονομία (17 °C)',
  comfort: 'θέρμανση σε άνεση (21 °C)',
  coffee: 'ετοίμασε καφέ',
  lock: 'κλείδωσε την πόρτα',
  blinds: 'κατέβασε τα ρολά',
};

// Replays the day for a rule set; pure so it can be tested.
export function runDay(rules, onMinute) {
  const s = { lights: new Set(), heat: 21, locked: true, coffeeAt: null, blinds: false };
  const score = {
    dark: 0,
    wasted: 0,
    unlocked: 0,
    heatWaste: 0,
    cold: 0,
    coffee: false,
    fired: new Set(),
    blindsAtNight: false,
  };
  let previous = where(START - 1);
  const fire = (trigger, room) => {
    rules.forEach((rule, index) => {
      if (rule.trigger !== trigger) return;
      score.fired.add(index);
      const target = room ?? 'Σαλόνι';
      if (rule.action === 'lightHere') s.lights.add(target);
      if (rule.action === 'lightOffHere') s.lights.delete(target);
      if (rule.action === 'lightsOff') s.lights.clear();
      if (rule.action === 'eco') s.heat = 17;
      if (rule.action === 'comfort') s.heat = 21;
      if (rule.action === 'coffee') s.coffeeAt = minute;
      if (rule.action === 'lock') s.locked = true;
      if (rule.action === 'blinds') s.blinds = true;
    });
  };
  let minute = START;
  for (; minute < END; minute++) {
    const room = where(minute);
    if (room !== previous) {
      if (previous) fire('leave', previous);
      if (!previous && room) {
        s.locked = false; // Alex unlocks the door with the key
        fire('arrive', room);
      }
      if (previous && !room) {
        s.locked = false; // and forgets to lock it on the way out
        fire('empty', null);
      }
      if (room) fire('enter', room);
      if (room === 'Κουζίνα' && minute < 9 * 60 && s.coffeeAt !== null && minute - s.coffeeAt <= 40)
        score.coffee = true;
      previous = room;
    }
    if (minute === 6 * 60 + 25) fire('wake', room);
    // Getting out of bed trips the bedroom's motion sensor.
    if (minute === WAKE) fire('enter', room);
    if (minute === 19 * 60 + 40) fire('sunset', null);
    if (minute === SLEEP) fire('sleep', room);
    if (room && isDark(minute) && !s.lights.has(room) && minute >= WAKE && minute < SLEEP)
      score.dark++;
    score.wasted += [...s.lights].filter((r) => r !== room).length;
    if (!room && !s.locked) score.unlocked++;
    if (!room && s.heat === 21) score.heatWaste++;
    if (room && s.heat < 21 && minute < SLEEP) score.cold++;
    if (minute >= 19 * 60 + 40 && s.blinds) score.blindsAtNight = true;
    onMinute?.(minute, room, s, score);
  }
  return score;
}

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '🏠',
    title: 'Προγραμμάτισε το σπίτι',
    intro:
      'Ένα έξυπνο σπίτι δεν είναι «έξυπνο» από μόνο του: ακολουθεί κανόνες που συνδέουν αισθητήρες με ενέργειες. Γράψε κανόνες «ΑΝ… ΤΟΤΕ…» και ξαναζήσε μια μέρα του Alex.',
    missions: [
      {
        id: 'follow',
        text: 'Τα φώτα ακολουθούν τον Alex: ανάβουν όπου μπαίνει, σβήνουν όπου φεύγει.',
      },
      { id: 'lock', text: 'Η πόρτα κλειδώνει μόνη της όταν το σπίτι αδειάζει.' },
      { id: 'coffee', text: 'Ο καφές είναι έτοιμος όταν ο Alex μπαίνει στην κουζίνα το πρωί.' },
      {
        id: 'eco',
        text: 'Η θέρμανση κάνει οικονομία όσο το σπίτι είναι άδειο, χωρίς να κρυώσει ο Alex.',
      },
    ],
    embedded,
    onComplete,
  });

  const rules = [];
  const trig = h(
    'select',
    { class: 'lab-select', 'aria-label': 'Συνθήκη (ΑΝ)' },
    Object.entries(triggers).map(([v, l]) => h('option', { value: v }, l)),
  );
  const act = h(
    'select',
    { class: 'lab-select', 'aria-label': 'Ενέργεια (ΤΟΤΕ)' },
    Object.entries(actions).map(([v, l]) => h('option', { value: v }, l)),
  );
  const list = h('ol', { class: 'lab-rules', 'aria-label': 'Οι κανόνες σου' });
  const clock = h('output', { class: 'lab-clock', 'aria-live': 'off' }, '06:00');
  const house = h('div', { class: 'lab-house' });
  const roomNodes = {};
  for (const room of ROOMS) {
    const people = h('div', { class: 'lab-room__people', 'aria-hidden': 'true' });
    const devices = h('div', { class: 'lab-room__devices', 'aria-hidden': 'true' });
    const node = h(
      'div',
      { class: 'lab-room' },
      h('p', { class: 'lab-room__name' }, room),
      people,
      devices,
    );
    roomNodes[room] = { node, people, devices };
    house.append(node);
  }
  const summary = h(
    'p',
    { class: 'lab-callout', role: 'status' },
    'Πρόσθεσε κανόνες και πάτα «Παίξε τη μέρα».',
  );
  const log = h('div', { class: 'lab-log', 'aria-live': 'off' });

  function renderRules(fired = new Set()) {
    list.replaceChildren(
      ...(rules.length
        ? rules.map((rule, index) =>
            h(
              'li',
              { class: 'lab-rule' + (fired.has(index) ? ' is-fired' : '') },
              h('b', {}, 'ΑΝ'),
              triggers[rule.trigger],
              h('b', {}, 'ΤΟΤΕ'),
              actions[rule.action],
              h(
                'button',
                {
                  type: 'button',
                  class: 'lab-rule__remove',
                  'aria-label': 'Αφαίρεση κανόνα',
                  onClick: () => {
                    rules.splice(index, 1);
                    renderRules();
                  },
                },
                '×',
              ),
            ),
          )
        : [h('li', { class: 'lab-note' }, 'Δεν υπάρχουν κανόνες ακόμη. Το σπίτι είναι «χαζό».')]),
    );
  }
  renderRules();

  const fmtTime = (m) =>
    `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  function paint(minute, room, s) {
    clock.textContent = fmtTime(minute);
    for (const r of ROOMS) {
      const { node, people, devices } = roomNodes[r];
      node.classList.toggle('is-lit', s.lights.has(r));
      people.textContent = r === room ? (minute >= SLEEP ? '😴' : '🧑') : '';
      devices.replaceChildren(
        ...[
          h('span', { class: s.lights.has(r) ? 'is-on' : '' }, '💡'),
          r === 'Είσοδος' && h('span', { class: 'is-on' }, s.locked ? '🔒' : '🔓'),
          r === 'Κουζίνα' &&
            h(
              'span',
              { class: s.coffeeAt !== null && minute - s.coffeeAt < 90 ? 'is-on' : '' },
              '☕',
            ),
          r === 'Σαλόνι' && h('span', { class: 'is-on' }, s.heat === 21 ? '🔥' : '❄️'),
          r === 'Υπνοδωμάτιο' && h('span', { class: s.blinds ? 'is-on' : '' }, '🪟'),
        ].filter(Boolean),
      );
    }
  }

  let timer = 0;
  let speed = 1;
  function play() {
    clearInterval(timer);
    log.replaceChildren();
    const frames = [];
    const score = runDay(rules, (minute, room, s) => {
      if (minute % 5 === 0)
        frames.push([
          minute,
          room,
          {
            lights: new Set(s.lights),
            heat: s.heat,
            locked: s.locked,
            coffeeAt: s.coffeeAt,
            blinds: s.blinds,
          },
        ]);
    });
    let i = 0;
    let lastRoom;
    playButton.disabled = true;
    timer = setInterval(() => {
      const [minute, room, s] = frames[i];
      paint(minute, room, s);
      if (room !== lastRoom) {
        log.prepend(
          h(
            'p',
            {},
            `${fmtTime(minute)} · ${room ? 'ο Alex στο δωμάτιο: ' + room : 'το σπίτι άδειασε'}`,
          ),
        );
        lastRoom = room;
      }
      i += speed;
      if (i >= frames.length) {
        clearInterval(timer);
        playButton.disabled = false;
        finish(score);
      }
    }, 60);
  }
  function finish(score) {
    renderRules(score.fired);
    const follow = score.dark <= 10 && score.wasted <= 30;
    if (follow) lab.complete('follow');
    if (score.unlocked === 0) lab.complete('lock');
    if (score.coffee) lab.complete('coffee');
    if (score.heatWaste <= 15 && score.cold <= 15)
      lab.complete('eco', 'Εξοικονόμηση ενέργειας χωρίς θυσία στην άνεση.');
    const parts = [
      follow
        ? '💡 φωτισμός: σωστός'
        : `💡 ${score.dark} λεπτά στο σκοτάδι, ${score.wasted} λεπτά φως σε άδεια δωμάτια`,
      score.unlocked
        ? `🔓 ${Math.round(score.unlocked / 60)} ώρες ξεκλείδωτο και άδειο`
        : '🔒 ασφαλές',
      score.coffee ? '☕ καφές στην ώρα του' : '☕ χωρίς πρωινό καφέ',
      score.heatWaste > 15
        ? `🔥 ${Math.round(score.heatWaste / 60)} ώρες θέρμανση σε άδειο σπίτι`
        : score.cold > 15
          ? `❄️ ${score.cold} λεπτά κρύο`
          : '🌿 έξυπνη θέρμανση',
    ];
    summary.className =
      'lab-callout ' + (follow && !score.unlocked && score.coffee ? 'is-good' : '');
    summary.textContent = 'Απολογισμός ημέρας: ' + parts.join(' · ');
  }
  const playButton = button('Παίξε τη μέρα', play);
  paint(START, where(START), {
    lights: new Set(),
    heat: 21,
    locked: true,
    coffeeAt: null,
    blinds: false,
  });

  lab.body.append(
    h(
      'div',
      { class: 'lab-row', style: { justifyContent: 'space-between' } },
      clock,
      h(
        'div',
        { class: 'lab-row' },
        segmented(
          'Ταχύτητα',
          [
            { value: '1', label: '1×' },
            { value: '3', label: '3×' },
          ],
          '1',
          (v) => (speed = Number(v)),
        ),
        playButton,
      ),
    ),
    house,
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, 'Νέος κανόνας'),
      h(
        'div',
        { class: 'lab-row' },
        h('b', { class: 'lab-note' }, 'ΑΝ'),
        trig,
        h('b', { class: 'lab-note' }, 'ΤΟΤΕ'),
        act,
        button(
          'Προσθήκη',
          () => {
            if (rules.some((r) => r.trigger === trig.value && r.action === act.value)) return;
            rules.push({ trigger: trig.value, action: act.value });
            renderRules();
          },
          'blue',
        ),
      ),
      h('div', { style: { marginTop: '14px' } }, list),
    ),
    summary,
    log,
  );
}
