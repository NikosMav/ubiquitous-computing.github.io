// Lab: wireless communication. A simplified link model: each technology has a range,
// a peak data rate and a latency; distance and walls reduce the usable rate.
import { h, frame, segmented, slider, toggle, button, stage, loop, fmt, clamp } from './kit.js';

const techs = {
  nfc: {
    label: 'NFC',
    range: 0.05,
    rate: 0.424,
    latency: 0.1,
    color: '#5fe0b0',
    note: 'Επαφή σε λίγα εκατοστά: πληρωμές, εισιτήρια, κάρτες.',
  },
  ble: {
    label: 'Bluetooth',
    range: 30,
    rate: 2,
    latency: 8,
    color: '#7482ff',
    note: 'Χαμηλή κατανάλωση για ακουστικά, ρολόγια, αισθητήρες.',
  },
  wifi: {
    label: 'Wi-Fi',
    range: 45,
    rate: 600,
    latency: 4,
    color: '#ffd460',
    note: 'Υψηλή ταχύτητα μέσα σε σπίτια και κτίρια.',
  },
  g5: {
    label: '5G',
    range: 1500,
    rate: 1000,
    latency: 12,
    color: '#ff7a8a',
    note: 'Κυψελοειδές δίκτυο: κάλυψη σε όλη την πόλη από κεραίες.',
  },
};
const payloads = {
  pay: { label: 'Πληρωμή (1 KB)', mb: 0.001 },
  photo: { label: 'Φωτογραφία (3 MB)', mb: 3 },
  video: { label: 'Βίντεο (500 MB)', mb: 500 },
};

// Distance slider is logarithmic: 1 cm to 2 km.
const toMeters = (v) => 10 ** (-2 + (v / 100) * 5.3);
const distanceLabel = (m) =>
  m < 1
    ? `${Math.round(m * 100)} cm`
    : m < 1000
      ? `${fmt.format(m)} m`
      : `${fmt.format(m / 1000)} km`;

export function link(tech, meters, wall) {
  const t = techs[tech];
  const reach = t.range * (wall && tech !== 'g5' ? 0.45 : wall ? 0.8 : 1);
  if (meters > reach) return { ok: false, reach, quality: 0, rate: 0 };
  const quality = clamp(1 - (meters / reach) ** 2 * 0.85, 0.08, 1);
  return { ok: true, reach, quality, rate: t.rate * quality };
}

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '📡',
    title: 'Στείλε ένα πακέτο',
    intro:
      'Οι συσκευές ανταλλάσσουν δεδομένα χωρίς καλώδια, αλλά κάθε τεχνολογία κάνει διαφορετικές υποχωρήσεις σε εμβέλεια, ταχύτητα και κατανάλωση.',
    missions: [
      { id: 'pay', text: 'Πλήρωσε ανέπαφα στο ταμείο.' },
      { id: 'watch', text: 'Στείλε μια φωτογραφία στο ρολόι σου, 5 μέτρα μακριά.' },
      {
        id: 'wall',
        text: 'Στείλε ένα βίντεο στο διπλανό δωμάτιο, πίσω από τοίχο, σε λιγότερο από 30 δευτερόλεπτα.',
      },
      {
        id: 'city',
        text: 'Στείλε μια φωτογραφία σε φίλο στην άλλη άκρη της γειτονιάς (πάνω από 500 m).',
      },
      { id: 'fail', text: 'Δες τι συμβαίνει όταν ο παραλήπτης είναι εκτός εμβέλειας.' },
    ],
    embedded,
    onComplete,
  });

  const state = {
    tech: 'ble',
    distance: 55,
    wall: false,
    payload: 'photo',
    packets: [],
    sending: null,
    pulse: 0,
  };
  const meters = () => toMeters(state.distance);

  const view = stage('lab-canvas', draw);
  const status = h(
    'p',
    { class: 'lab-callout', role: 'status' },
    'Διάλεξε τεχνολογία, απόσταση και τι θα στείλεις.',
  );
  const readouts = {
    range: h('span', { class: 'lab-readout__value' }),
    rate: h('span', { class: 'lab-readout__value' }),
    latency: h('span', { class: 'lab-readout__value' }),
    time: h('span', { class: 'lab-readout__value' }),
  };
  const readout = (label, value) =>
    h('div', { class: 'lab-readout' }, h('span', { class: 'lab-readout__label' }, label), value);
  const readoutRow = h(
    'div',
    { class: 'lab-readouts' },
    readout('Εμβέλεια', readouts.range),
    readout('Ταχύτητα τώρα', readouts.rate),
    readout('Καθυστέρηση', readouts.latency),
    readout('Χρόνος αποστολής', readouts.time),
  );
  const techNote = h('p', { class: 'lab-note' });

  function estimate() {
    const l = link(state.tech, meters(), state.wall);
    const mb = payloads[state.payload].mb;
    const seconds = l.ok ? (mb * 8) / l.rate + techs[state.tech].latency / 1000 : Infinity;
    return { ...l, seconds };
  }
  function update() {
    const e = estimate();
    const t = techs[state.tech];
    readouts.range.textContent = distanceLabel(e.reach);
    readouts.rate.textContent = e.ok ? `${fmt.format(e.rate)} Mbps` : '—';
    readouts.latency.textContent = `${t.latency} ms`;
    readouts.time.textContent = e.ok
      ? e.seconds < 1
        ? `${Math.round(e.seconds * 1000)} ms`
        : `${fmt.format(e.seconds)} s`
      : 'εκτός εμβέλειας';
    readouts.time.parentElement.className =
      'lab-readout ' + (e.ok ? (e.seconds < 5 ? 'is-good' : 'is-warn') : 'is-bad');
    techNote.textContent = t.note;
    view.redraw();
  }

  function send() {
    const e = estimate();
    const t = techs[state.tech];
    const d = meters();
    state.sending = {
      ok: e.ok,
      started: performance.now(),
      duration: e.ok ? clamp(e.seconds, 0.6, 3.5) : 1.6,
    };
    state.packets = Array.from({ length: 7 }, (_, i) => ({
      offset: i * 0.12,
      lost: !e.ok && i > 1,
    }));
    sendButton.disabled = true;
    setTimeout(() => {
      sendButton.disabled = false;
      state.sending = null;
      if (!e.ok) {
        status.className = 'lab-callout is-bad';
        status.textContent = `Αποτυχία: στα ${distanceLabel(d)} το σήμα ${t.label} δεν φτάνει (εμβέλεια ~${distanceLabel(e.reach)}). Τα πακέτα χάνονται.`;
        lab.complete('fail');
        return;
      }
      status.className = 'lab-callout is-good';
      status.textContent = `Παραδόθηκε: ${payloads[state.payload].label} μέσω ${t.label} σε ${readouts.time.textContent}.`;
      // Missions reflect realistic choices, not just any successful send.
      if (state.payload === 'pay' && state.tech === 'nfc')
        lab.complete('pay', 'Το NFC δουλεύει μόνο σε επαφή: γι’ αυτό είναι ασφαλές για πληρωμές.');
      if (state.payload === 'photo' && d >= 3 && d <= 8 && state.tech !== 'g5')
        lab.complete('watch');
      if (state.payload === 'video' && state.wall && e.seconds < 30)
        lab.complete('wall', 'Μεγάλα αρχεία χρειάζονται υψηλή ταχύτητα: εδώ κερδίζει το Wi-Fi.');
      if (state.payload === 'photo' && d > 500)
        lab.complete('city', 'Μόνο το κυψελοειδές δίκτυο καλύπτει τέτοια απόσταση.');
    }, state.sending.duration * 1000);
  }

  function draw(ctx, w, hgt) {
    ctx.clearRect(0, 0, w, hgt);
    const t = techs[state.tech];
    const e = estimate();
    const left = 70;
    const right = w - 70;
    const cy = hgt * 0.52;
    // Receiver position follows the log distance so both 4 cm and 2 km fit on screen.
    const rx = left + ((right - left) * state.distance) / 100;
    const reachX = left + (right - left) * clamp((Math.log10(e.reach) + 2) / 5.3, 0, 1);

    // Coverage zone.
    const gradient = ctx.createLinearGradient(left, 0, reachX, 0);
    gradient.addColorStop(0, t.color + '55');
    gradient.addColorStop(1, t.color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(left, cy - 70, Math.max(0, reachX - left), 140);
    ctx.strokeStyle = t.color;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(reachX, cy - 80);
    ctx.lineTo(reachX, cy + 80);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = t.color;
    ctx.font = '12px "UC Nasalization", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('όριο εμβέλειας', reachX, cy - 88);

    // Pulses radiating from the sender.
    state.pulse = (state.pulse + 0.012) % 1;
    for (let i = 0; i < 3; i++) {
      const p = (state.pulse + i / 3) % 1;
      ctx.strokeStyle = `rgba(116,130,255,${0.5 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(left, cy, 20 + p * Math.min(160, Math.max(30, reachX - left)), -0.9, 0.9);
      ctx.stroke();
    }

    if (state.wall) {
      const wx = left + (rx - left) * 0.55;
      ctx.fillStyle = '#3a3f6e';
      ctx.fillRect(wx - 6, cy - 60, 12, 120);
      ctx.fillStyle = '#c4c8ea';
      ctx.font = '11px "UC Gothic", sans-serif';
      ctx.fillText('τοίχος', wx, cy + 78);
    }

    // Packets.
    if (state.sending) {
      const elapsed = (performance.now() - state.sending.started) / 1000 / state.sending.duration;
      for (const packet of state.packets) {
        const k = clamp(elapsed * 1.25 - packet.offset, 0, 1);
        if (k <= 0 || k >= 1) continue;
        let x = left + (rx - left) * k;
        let alpha = 1;
        if (packet.lost && x > reachX) {
          alpha = clamp(1 - (x - reachX) / 60, 0, 1);
          x = reachX + (x - reachX) * 0.4;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.roundRect(x - 7, cy - 5 + Math.sin(k * 12) * 6, 14, 10, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const device = (x, emoji, label) => {
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, x, cy + 12);
      ctx.font = '12px "UC Gothic", sans-serif';
      ctx.fillStyle = '#c4c8ea';
      ctx.fillText(label, x, cy + 44);
    };
    device(left, '📱', 'αποστολέας');
    ctx.fillStyle = e.ok ? '#5fe0b0' : '#ff7a8a';
    ctx.beginPath();
    ctx.arc(rx, cy - 34, 5, 0, Math.PI * 2);
    ctx.fill();
    device(
      rx,
      state.payload === 'pay' ? '💳' : state.distance > 85 ? '🏙️' : '⌚',
      distanceLabel(meters()),
    );

    // Scale.
    ctx.fillStyle = '#8f95c4';
    ctx.font = '11px "UC Gothic", sans-serif';
    ctx.textAlign = 'center';
    for (const [m, label] of [
      [0.01, '1 cm'],
      [1, '1 m'],
      [100, '100 m'],
      [2000, '2 km'],
    ]) {
      const x = left + ((right - left) * (Math.log10(m) + 2)) / 5.3;
      ctx.fillText(label, x, hgt - 14);
      ctx.fillRect(x - 0.5, hgt - 30, 1, 6);
    }
  }
  loop(view.canvas, () => view.redraw());

  const sendButton = button('Αποστολή', send);
  const distance = slider({
    label: 'Απόσταση',
    min: 0,
    max: 100,
    value: state.distance,
    format: (v) => distanceLabel(toMeters(v)),
    onInput: (v) => {
      state.distance = v;
      update();
    },
  });
  lab.body.append(
    view.canvas,
    h(
      'div',
      { class: 'lab-controls' },
      segmented(
        'Τεχνολογία',
        Object.entries(techs).map(([value, t]) => ({ value, label: t.label })),
        state.tech,
        (v) => {
          state.tech = v;
          update();
        },
      ),
      segmented(
        'Τι στέλνεις',
        Object.entries(payloads).map(([value, p]) => ({ value, label: p.label })),
        state.payload,
        (v) => {
          state.payload = v;
          update();
        },
      ),
      distance,
      h(
        'div',
        { class: 'lab-row' },
        toggle('Τοίχος ανάμεσα', false, (v) => {
          state.wall = v;
          update();
        }),
        sendButton,
      ),
    ),
    readoutRow,
    techNote,
    status,
  );
  update();
}
