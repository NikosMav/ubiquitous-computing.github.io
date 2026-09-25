// Lab: smart car. Stopping distance = reaction distance + braking distance (v²/2μg).
// Sensors decide how early a hazard is noticed; physics decides the rest.
import { h, frame, slider, segmented, toggle, button, stage, loop, fmt, clamp } from './kit.js';

export const HAZARD = 60; // a pedestrian steps out 60 m ahead
const G = 9.81;
export const roads = {
  dry: { label: 'Στεγνός', mu: 0.7 },
  wet: { label: 'Βρεγμένος', mu: 0.4 },
  ice: { label: 'Παγωμένος', mu: 0.1 },
};
export const weather = {
  clear: { label: 'Καθαρός', eye: 150 },
  fog: { label: 'Ομίχλη', eye: 35 },
  night: { label: 'Νύχτα', eye: 50 },
};
export const sensors = {
  camera: { label: 'Κάμερα', range: 120, fog: 0.25, night: 0.5 },
  radar: { label: 'Ραντάρ', range: 160, fog: 0.95, night: 1 },
  lidar: { label: 'Lidar', range: 200, fog: 0.5, night: 1 },
};

export function stopping({ kmh, road, sky, auto, fitted }) {
  const v = kmh / 3.6;
  const sensorRange = Math.max(
    0,
    ...[...fitted].map((id) => sensors[id].range * (sky === 'clear' ? 1 : sensors[id][sky])),
  );
  const seen = auto ? Math.min(HAZARD, sensorRange) : Math.min(HAZARD, weather[sky].eye);
  const reactionTime = auto ? 0.3 : 1.5;
  const reaction = v * reactionTime;
  const braking = (v * v) / (2 * roads[road].mu * G);
  return {
    v,
    seen,
    reaction,
    braking,
    total: reaction + braking,
    ok: reaction + braking <= seen,
    reactionTime,
  };
}

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '🚗',
    title: 'Αυτόνομο φρενάρισμα',
    intro: `Ένας πεζός εμφανίζεται ${HAZARD} μέτρα μπροστά. Το αυτοκίνητο πρέπει να τον εντοπίσει, να αντιδράσει και να σταματήσει. Ο άνθρωπος χρειάζεται περίπου 1,5 δευτερόλεπτο για να αντιδράσει, ένα σύστημα αυτόματου φρεναρίσματος περίπου 0,3.`,
    missions: [
      {
        id: 'limit',
        text: 'Βρες μια ταχύτητα όπου ένας άνθρωπος οδηγός δεν προλαβαίνει, σε στεγνό δρόμο.',
      },
      { id: 'aeb', text: 'Με την ίδια ταχύτητα, σταμάτα εγκαίρως με αυτόματο φρενάρισμα.' },
      { id: 'fog', text: 'Στην ομίχλη, στα 70 km/h, διάλεξε αισθητήρες που βλέπουν τον πεζό.' },
      { id: 'ice', text: 'Στον πάγο, βρες ταχύτητα που επιτρέπει στο σύστημα να σταματήσει.' },
    ],
    embedded,
    onComplete,
  });

  const cfg = { kmh: 50, road: 'dry', sky: 'clear', auto: false, fitted: new Set(['camera']) };
  let humanFailAt = null;
  let run = null;
  const view = stage('lab-canvas lab-canvas--short', draw);
  const status = h(
    'p',
    { class: 'lab-callout', role: 'status' },
    'Ρύθμισε τις συνθήκες και πάτα «Δοκιμή».',
  );
  const bar = h('div', { class: 'lab-bar__track', style: { height: '34px' } });
  const legend = h('p', { class: 'lab-note' });

  function breakdown(r) {
    const scale = (m) => clamp((m / 160) * 100, 0, 100);
    bar.replaceChildren(
      h('span', { class: 'lab-bar__fill is-then', style: { width: scale(r.reaction) + '%' } }),
      h('span', {
        class: 'lab-bar__fill',
        style: { left: scale(r.reaction) + '%', width: scale(r.braking) + '%' },
      }),
      h('span', {
        style: {
          position: 'absolute',
          left: scale(r.seen) + '%',
          top: 0,
          bottom: 0,
          width: '3px',
          background: '#ff7a8a',
        },
      }),
    );
    legend.textContent = `Αντίδραση ${fmt.format(r.reaction)} m (${fmt.format(r.reactionTime)} s) + φρενάρισμα ${fmt.format(r.braking)} m = ${fmt.format(r.total)} m. Διαθέσιμα: ${fmt.format(r.seen)} m (κόκκινη γραμμή).`;
  }

  function test() {
    const r = stopping(cfg);
    run = { r, start: performance.now() };
    breakdown(r);
    testButton.disabled = true;
    const hit = !r.ok;
    setTimeout(() => {
      testButton.disabled = false;
      status.className = 'lab-callout ' + (hit ? 'is-bad' : 'is-good');
      status.textContent = hit
        ? `Δεν πρόλαβε: χρειάστηκαν ${fmt.format(r.total)} m, αλλά ο πεζός εντοπίστηκε στα ${fmt.format(r.seen)} m.`
        : `Σταμάτησε ${fmt.format(r.seen - r.total)} m πριν από τον πεζό.`;
      if (!cfg.auto && cfg.road === 'dry' && hit) {
        humanFailAt = cfg.kmh;
        lab.complete(
          'limit',
          `Στα ${cfg.kmh} km/h ο χρόνος αντίδρασης κοστίζει ${fmt.format(r.reaction)} m.`,
        );
      }
      if (cfg.auto && !hit && humanFailAt !== null && cfg.kmh >= humanFailAt && cfg.road === 'dry')
        lab.complete('aeb');
      if (cfg.auto && !hit && cfg.sky === 'fog' && cfg.kmh >= 70)
        lab.complete('fog', 'Το ραντάρ «βλέπει» μέσα από την ομίχλη· η κάμερα όχι.');
      if (cfg.auto && !hit && cfg.road === 'ice')
        lab.complete(
          'ice',
          'Η φυσική δεν διαπραγματεύεται: στον πάγο η ταχύτητα είναι το μόνο που μετρά.',
        );
    }, 2600);
  }

  function draw(ctx, w, hgt) {
    ctx.clearRect(0, 0, w, hgt);
    const left = 40;
    const right = w - 30;
    const m = (meters) => left + ((right - left) * meters) / 110;
    const road = hgt * 0.5;
    ctx.fillStyle = cfg.road === 'ice' ? '#1d3350' : cfg.road === 'wet' ? '#161c38' : '#121430';
    ctx.fillRect(0, road - 34, w, 68);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(0, road);
    ctx.lineTo(w, road);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '11px "UC Gothic", sans-serif';
    ctx.fillStyle = '#8f95c4';
    ctx.textAlign = 'center';
    for (let d = 0; d <= 100; d += 20) ctx.fillText(`${d} m`, m(d), road + 52);
    // Hazard.
    ctx.font = '26px sans-serif';
    ctx.fillText('🚶', m(HAZARD), road - 8);
    let carAt = 0;
    const r = run?.r ?? stopping(cfg);
    // Detection horizon.
    ctx.fillStyle = 'rgba(116,130,255,0.12)';
    ctx.fillRect(m(HAZARD - r.seen), road - 34, m(HAZARD) - m(HAZARD - r.seen), 68);
    if (run) {
      const t = (performance.now() - run.start) / 1000;
      // Timeline, slowed to half speed for readability.
      const T = t * 0.6;
      const travelBeforeSeen = HAZARD - r.seen;
      const t1 = travelBeforeSeen / r.v;
      const t2 = t1 + r.reactionTime;
      const decel = (r.v * r.v) / (2 * r.braking);
      if (T < t1) carAt = r.v * T;
      else if (T < t2) carAt = travelBeforeSeen + r.v * (T - t1);
      else {
        const tb = Math.min(T - t2, r.v / decel);
        carAt = travelBeforeSeen + r.reaction + r.v * tb - 0.5 * decel * tb * tb;
      }
      carAt = Math.min(carAt, HAZARD - 2, travelBeforeSeen + r.total);
      ctx.strokeStyle = '#ff7a8a';
      ctx.beginPath();
      ctx.moveTo(m(travelBeforeSeen), road - 34);
      ctx.lineTo(m(travelBeforeSeen), road + 34);
      ctx.stroke();
      ctx.fillStyle = '#ff7a8a';
      ctx.font = '11px "UC Gothic", sans-serif';
      ctx.fillText('εντοπισμός', m(travelBeforeSeen), road - 42);
      if (T > t2) {
        ctx.fillStyle = '#fbb454';
        ctx.fillText('φρένο', m(travelBeforeSeen + r.reaction), road + 66);
      }
    }
    ctx.save();
    ctx.translate(m(carAt), road + 18);
    ctx.scale(-1, 1);
    ctx.font = '28px sans-serif';
    ctx.fillText('🚗', 0, 0);
    ctx.restore();
  }
  loop(view.canvas, () => view.redraw());

  const testButton = button('Δοκιμή', test);
  lab.body.append(
    view.canvas,
    h(
      'div',
      { class: 'lab-controls' },
      slider({
        label: 'Ταχύτητα',
        min: 20,
        max: 130,
        step: 10,
        value: cfg.kmh,
        format: (v) => `${v} km/h`,
        onInput: (v) => {
          cfg.kmh = v;
          run = null;
        },
      }),
      segmented(
        'Οδόστρωμα',
        Object.entries(roads).map(([value, r]) => ({ value, label: r.label })),
        cfg.road,
        (v) => {
          cfg.road = v;
          run = null;
        },
      ),
      segmented(
        'Συνθήκες',
        Object.entries(weather).map(([value, s]) => ({ value, label: s.label })),
        cfg.sky,
        (v) => {
          cfg.sky = v;
          run = null;
        },
      ),
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Οδηγός'),
        toggle('Αυτόματο φρενάρισμα έκτακτης ανάγκης', false, (v) => {
          cfg.auto = v;
          run = null;
        }),
      ),
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Αισθητήρες οχήματος'),
        h(
          'div',
          { class: 'lab-row' },
          Object.entries(sensors).map(([id, s]) =>
            h(
              'button',
              {
                type: 'button',
                class: 'lab-chip',
                'aria-pressed': String(cfg.fitted.has(id)),
                onClick: (event) => {
                  if (cfg.fitted.has(id)) cfg.fitted.delete(id);
                  else cfg.fitted.add(id);
                  event.currentTarget.setAttribute('aria-pressed', String(cfg.fitted.has(id)));
                  run = null;
                },
              },
              s.label,
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Εκτέλεση'),
        testButton,
      ),
    ),
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, 'Απόσταση ακινητοποίησης'),
      bar,
      legend,
    ),
    status,
    h(
      'p',
      { class: 'lab-note' },
      'Οι αισθητήρες μετρούν μόνο με ενεργό το αυτόματο φρενάρισμα. Ο άνθρωπος βασίζεται στα μάτια του.',
    ),
  );
  breakdown(stopping(cfg));
}
