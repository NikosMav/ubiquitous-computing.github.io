// Lab: cloud computing. One simulated day of traffic for a museum web service.
// Servers are rented by the hour; too few and requests fail, too many and money is wasted.
import { h, frame, toggle, button, stage, loop, fmt, clamp, segmented } from './kit.js';

export const CAPACITY = 1000; // requests per second per server
export const PRICE = 0.5; // € per server-hour
export const BUDGET = 40;
const gauss = (t, mu, sigma) => Math.exp(-((t - mu) ** 2) / (2 * sigma * sigma));
// Night trickle, a daytime hump, a school-visit spike at 11:00 and an evening peak.
export const load = (t) =>
  250 + 1250 * gauss(t, 13, 3.2) + 1600 * gauss(t, 19.5, 1.8) + 3800 * gauss(t, 11, 0.45);

export function autoscaleTarget(currentLoad) {
  return clamp(Math.ceil(currentLoad / (CAPACITY * 0.65)), 1, 12);
}

// Pure step so the whole day can also be simulated in tests.
export function step(sim, dt, { auto, manual }) {
  const l = load(sim.t);
  if (auto) {
    const target = autoscaleTarget(load(sim.t + 0.25)); // looks 15 minutes ahead
    // New machines take ~15 minutes to boot; removing them is immediate.
    if (target > sim.servers) sim.booting = Math.min(sim.booting + dt / 0.25, 1);
    if (sim.booting >= 1) {
      sim.servers = Math.min(target, sim.servers + 1);
      sim.booting = 0;
    }
    if (target < sim.servers - 1) sim.servers--;
  } else sim.servers = manual;
  const capacity = sim.servers * CAPACITY;
  const served = Math.min(l, capacity);
  sim.total += l * dt;
  sim.served += served * dt;
  sim.cost += sim.servers * PRICE * dt;
  sim.t += dt;
  sim.history.push({ t: sim.t, load: l, capacity });
  return { load: l, capacity, utilisation: l / capacity };
}
export const newDay = (servers = 2) => ({
  t: 0,
  servers,
  booting: 0,
  total: 0,
  served: 0,
  cost: 0,
  history: [],
});

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '☁️',
    title: 'Κλιμάκωσε το νέφος',
    intro:
      'Στο cloud νοικιάζεις υπολογιστική ισχύ όταν τη χρειάζεσαι. Κράτησε όρθια την ιστοσελίδα του μουσείου για μια ολόκληρη μέρα, χωρίς να ξοδέψεις περισσότερα από όσα χρειάζεται.',
    missions: [
      { id: 'day', text: 'Λειτούργησε την υπηρεσία για ένα ολόκληρο 24ωρο.' },
      { id: 'reliable', text: 'Εξυπηρέτησε τουλάχιστον το 99% των αιτημάτων μιας μέρας.' },
      { id: 'auto', text: 'Ενεργοποίησε την αυτόματη κλιμάκωση (autoscaling).' },
      { id: 'budget', text: `Πέτυχε 99% με κόστος έως ${BUDGET} €.` },
    ],
    embedded,
    onComplete,
  });

  let sim = newDay();
  let manual = 2;
  let auto = false;
  let running = false;
  let speed = 1;
  let last = { load: 0, capacity: 0, utilisation: 0 };

  const view = stage('lab-canvas', draw);
  const value = () => h('span', { class: 'lab-readout__value' });
  const out = {
    time: value(),
    servers: value(),
    util: value(),
    latency: value(),
    ok: value(),
    cost: value(),
  };
  const card = (label, v) =>
    h('div', { class: 'lab-readout' }, h('span', { class: 'lab-readout__label' }, label), v);
  const status = h(
    'p',
    { class: 'lab-callout', role: 'status' },
    'Πάτα «Έναρξη μέρας». Στις 11:00 έρχεται μια μεγάλη σχολική επίσκεψη.',
  );
  const count = h('output', { class: 'lab-clock', 'aria-live': 'polite' }, manual);
  const minus = button('−', () => setManual(manual - 1), 'ghost');
  const plus = button('+', () => setManual(manual + 1), 'ghost');
  minus.setAttribute('aria-label', 'Λιγότεροι διακομιστές');
  plus.setAttribute('aria-label', 'Περισσότεροι διακομιστές');
  const startButton = button('Έναρξη μέρας', () => {
    if (sim.t >= 24) sim = newDay(auto ? 1 : manual);
    running = !running;
    startButton.textContent = running ? 'Παύση' : 'Συνέχεια';
  });

  function setManual(n) {
    manual = clamp(n, 1, 12);
    count.textContent = manual;
    if (!running && !auto) {
      sim.servers = manual;
      render();
    }
  }

  function finish() {
    running = false;
    startButton.textContent = 'Νέα μέρα';
    const ratio = sim.served / sim.total;
    const pct = (ratio * 100).toFixed(2).replace('.', ',');
    lab.complete('day');
    if (ratio >= 0.99) lab.complete('reliable');
    if (ratio >= 0.99 && sim.cost <= BUDGET)
      lab.complete('budget', 'Πληρώνεις μόνο όσα χρησιμοποιείς: η ουσία του cloud.');
    const good = ratio >= 0.99 && sim.cost <= BUDGET;
    status.className = 'lab-callout ' + (good ? 'is-good' : ratio >= 0.99 ? '' : 'is-bad');
    status.textContent =
      `Τέλος ημέρας: εξυπηρετήθηκε το ${pct}% των αιτημάτων με κόστος ${fmt.format(sim.cost)} €. ` +
      (ratio < 0.99
        ? 'Πολλοί επισκέπτες είδαν σφάλμα. Χρειάζεσαι περισσότερη χωρητικότητα στις αιχμές.'
        : sim.cost > BUDGET
          ? 'Αξιόπιστο, αλλά ακριβό: οι διακομιστές έμεναν αδρανείς τη νύχτα. Δοκίμασε αυτόματη κλιμάκωση.'
          : 'Ισορροπία απόδοσης και κόστους!');
  }

  function render() {
    const hours = Math.floor(sim.t % 24);
    const minutes = Math.floor((sim.t % 1) * 60);
    out.time.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    out.servers.textContent = sim.servers + (sim.booting > 0 ? ' (+1 εκκινεί)' : '');
    const u = last.utilisation;
    out.util.textContent = `${Math.round(Math.min(u, 9.99) * 100)}%`;
    out.util.parentElement.className =
      'lab-readout ' + (u > 1 ? 'is-bad' : u > 0.8 ? 'is-warn' : 'is-good');
    const latency = u >= 1 ? 'σφάλματα' : `${Math.round(60 / (1 - Math.min(u, 0.97)))} ms`;
    out.latency.textContent = latency;
    const ratio = sim.total ? sim.served / sim.total : 1;
    out.ok.textContent = `${(ratio * 100).toFixed(1).replace('.', ',')}%`;
    out.ok.parentElement.className = 'lab-readout ' + (ratio >= 0.99 ? 'is-good' : 'is-bad');
    out.cost.textContent = `${fmt.format(sim.cost)} €`;
    out.cost.parentElement.className = 'lab-readout ' + (sim.cost > BUDGET ? 'is-warn' : '');
    view.redraw();
  }

  function draw(ctx, w, hgt) {
    ctx.clearRect(0, 0, w, hgt);
    const pad = { l: 46, r: 14, t: 16, b: 30 };
    const max = 6500;
    const x = (t) => pad.l + ((w - pad.l - pad.r) * t) / 24;
    const y = (v) => hgt - pad.b - ((hgt - pad.t - pad.b) * Math.min(v, max)) / max;
    ctx.font = '11px "UC Gothic", sans-serif';
    ctx.fillStyle = '#8f95c4';
    ctx.strokeStyle = 'rgba(196,200,234,0.12)';
    for (let v = 0; v <= 6000; v += 2000) {
      ctx.beginPath();
      ctx.moveTo(pad.l, y(v));
      ctx.lineTo(w - pad.r, y(v));
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(v ? `${v / 1000}k` : '0', pad.l - 8, y(v) + 4);
    }
    ctx.textAlign = 'center';
    for (let t = 0; t <= 24; t += 6)
      ctx.fillText(`${String(t).padStart(2, '0')}:00`, x(t), hgt - 10);
    // Forecast of the whole day, faint.
    ctx.strokeStyle = 'rgba(251,180,84,0.25)';
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (let t = 0; t <= 24; t += 0.1) ctx.lineTo(x(t), y(load(t)));
    ctx.stroke();
    ctx.setLineDash([]);
    const history = sim.history;
    if (history.length > 1) {
      // Failed requests: where demand exceeded capacity.
      ctx.fillStyle = 'rgba(255,122,138,0.35)';
      for (let i = 1; i < history.length; i++) {
        const a = history[i - 1];
        const b = history[i];
        if (b.load > b.capacity)
          ctx.fillRect(x(a.t), y(b.load), Math.max(1, x(b.t) - x(a.t)), y(b.capacity) - y(b.load));
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#7482ff';
      ctx.beginPath();
      history.forEach((p, i) =>
        i ? ctx.lineTo(x(p.t), y(p.capacity)) : ctx.moveTo(x(p.t), y(p.capacity)),
      );
      ctx.stroke();
      ctx.strokeStyle = '#fbb454';
      ctx.beginPath();
      history.forEach((p, i) =>
        i ? ctx.lineTo(x(p.t), y(p.load)) : ctx.moveTo(x(p.t), y(p.load)),
      );
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbb454';
    ctx.fillText('— ζήτηση (αιτήματα/δευτ.)', pad.l + 8, pad.t + 8);
    ctx.fillStyle = '#7482ff';
    ctx.fillText('— χωρητικότητα διακομιστών', pad.l + 180, pad.t + 8);
  }

  loop(view.canvas, (dt) => {
    if (!running) return;
    // One simulated hour every two seconds at normal speed.
    const hours = dt * 0.5 * speed;
    const steps = Math.max(1, Math.round(hours / 0.02));
    for (let i = 0; i < steps && sim.t < 24; i++) last = step(sim, hours / steps, { auto, manual });
    render();
    if (sim.t >= 24) finish();
  });

  lab.body.append(
    view.canvas,
    h(
      'div',
      { class: 'lab-readouts' },
      card('Ώρα', out.time),
      card('Διακομιστές', out.servers),
      card('Φόρτος', out.util),
      card('Απόκριση', out.latency),
      card('Εξυπηρετήθηκαν', out.ok),
      card('Κόστος', out.cost),
    ),
    h(
      'div',
      { class: 'lab-controls' },
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Διακομιστές (χειροκίνητα)'),
        h('div', { class: 'lab-row' }, minus, count, plus),
      ),
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Αυτοματισμός'),
        toggle('Αυτόματη κλιμάκωση', false, (v) => {
          auto = v;
          minus.disabled = plus.disabled = v;
          if (v) lab.complete('auto', 'Ο πάροχος προσθέτει και αφαιρεί μηχανές για σένα.');
        }),
      ),
      segmented(
        'Ταχύτητα',
        [
          { value: '1', label: '1×' },
          { value: '3', label: '3×' },
        ],
        '1',
        (v) => (speed = Number(v)),
      ),
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Προσομοίωση'),
        startButton,
      ),
    ),
    h(
      'p',
      { class: 'lab-note' },
      `Κάθε διακομιστής εξυπηρετεί ${CAPACITY} αιτήματα το δευτερόλεπτο και κοστίζει ${fmt.format(PRICE)} € την ώρα.`,
    ),
    status,
  );
  render();
}
