// Lab: sensors and actuators. A thermostat closes the loop sensor → controller →
// actuator → room → sensor. Noise and hysteresis show why real controllers need care.
import { h, frame, slider, toggle, button, stage, loop, fmt } from './kit.js';

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '🌡️',
    title: 'Ο βρόχος ανάδρασης',
    intro:
      'Ο αισθητήρας μετρά, ο ελεγκτής αποφασίζει, ο ενεργοποιητής αλλάζει τον κόσμο και ο αισθητήρας μετρά ξανά. Ρύθμισε έναν θερμοστάτη ώστε το δωμάτιο να μείνει άνετο στους 21 °C.',
    missions: [
      { id: 'loop', text: 'Κλείσε τον βρόχο: ενεργοποίησε τον αυτόματο θερμοστάτη.' },
      { id: 'comfort', text: 'Κράτησε το δωμάτιο στους 21 ± 1 °C για μία ώρα (προσομοίωσης).' },
      { id: 'window', text: 'Άνοιξε το παράθυρο και δες τον βρόχο να αντιδρά.' },
      {
        id: 'chatter',
        text: 'Με θόρυβο στον αισθητήρα, βρες υστέρηση που κρατά την άνεση με λιγότερες από 8 εναλλαγές την ώρα.',
      },
    ],
    embedded,
    onComplete,
  });

  const setpoint = 21;
  const s = {
    t: 0,
    temp: 16,
    reading: 16,
    heater: false,
    auto: false,
    outside: 5,
    noise: 0.4,
    hysteresis: 0,
    window: 0,
    comfortFor: 0,
    switches: [],
    history: [],
    sinceSample: 0,
  };

  const nodes = ['Αισθητήρας', 'Ελεγκτής', 'Ενεργοποιητής', 'Δωμάτιο'].map((name, i) =>
    h(
      'div',
      { class: 'lab-readout', 'data-node': i },
      h('span', { class: 'lab-readout__label' }, ['μετρά', 'αποφασίζει', 'δρα', 'αλλάζει'][i]),
      h('span', { class: 'lab-readout__value' }, name),
    ),
  );
  const diagram = h('div', { class: 'lab-readouts', 'aria-hidden': 'true' }, nodes);
  const view = stage('lab-canvas', draw);
  const out = {
    temp: h('span', { class: 'lab-readout__value' }),
    reading: h('span', { class: 'lab-readout__value' }),
    heater: h('span', { class: 'lab-readout__value' }),
    switches: h('span', { class: 'lab-readout__value' }),
  };
  const card = (label, v) =>
    h('div', { class: 'lab-readout' }, h('span', { class: 'lab-readout__label' }, label), v);
  const status = h(
    'p',
    { class: 'lab-callout', role: 'status' },
    'Χειροκίνητη λειτουργία: άναψε και σβήσε μόνος σου τη θέρμανση. Μετά δοκίμασε τον αυτόματο θερμοστάτη.',
  );

  const manualSwitch = toggle('Θέρμανση (χειροκίνητα)', false, (v) => {
    if (!s.auto) setHeater(v);
  });
  function setHeater(on) {
    if (on === s.heater) return;
    s.heater = on;
    s.switches.push(s.t);
    manualSwitch.input.checked = on;
  }

  function tick(dt) {
    // One real second is five simulated minutes.
    const hours = dt * (5 / 60);
    const steps = Math.max(1, Math.ceil(hours / 0.005));
    for (let i = 0; i < steps; i++) simulate(hours / steps);
    render();
  }
  function simulate(dt) {
    s.t += dt;
    const loss = s.window > 0 ? 1.8 : 0.35;
    s.temp += ((s.heater ? 10 : 0) - loss * (s.temp - s.outside)) * dt;
    if (s.window > 0) {
      s.window -= dt;
      if (s.window <= 0)
        status.textContent =
          'Το παράθυρο έκλεισε. Ο βρόχος επαναφέρει το δωμάτιο στη θερμοκρασία στόχου.';
    }
    // The sensor samples once per simulated minute, with measurement noise.
    s.sinceSample += dt;
    if (s.sinceSample >= 1 / 60) {
      s.sinceSample = 0;
      s.reading = s.temp + (Math.random() * 2 - 1) * s.noise;
      if (s.auto) {
        // On/off control with a hysteresis band around the setpoint.
        if (s.reading < setpoint - s.hysteresis / 2) setHeater(true);
        else if (s.reading > setpoint + s.hysteresis / 2) setHeater(false);
      }
      s.history.push({ t: s.t, temp: s.temp, heater: s.heater });
      if (s.history.length > 360) s.history.shift();
    }
    s.switches = s.switches.filter((time) => s.t - time <= 1);
    const comfy = Math.abs(s.temp - setpoint) <= 1;
    s.comfortFor = comfy ? s.comfortFor + dt : 0;
    if (s.auto && s.comfortFor >= 1) {
      lab.complete('comfort', 'Αυτό κάνει ένας θερμοστάτης σε κάθε σπίτι, αθόρυβα.');
      if (s.switches.length < 8 && s.noise >= 0.3 && s.hysteresis > 0)
        lab.complete(
          'chatter',
          'Η υστέρηση εμποδίζει τον ενεργοποιητή να «τρεμοπαίζει» με τον θόρυβο.',
        );
    }
    if (s.window > 0 && s.auto && s.heater) lab.complete('window');
  }

  function render() {
    out.temp.textContent = `${fmt.format(s.temp)} °C`;
    out.temp.parentElement.className =
      'lab-readout ' + (Math.abs(s.temp - setpoint) <= 1 ? 'is-good' : 'is-warn');
    out.reading.textContent = `${fmt.format(s.reading)} °C`;
    out.heater.textContent = s.heater ? 'ΑΝΑΜΜΕΝΗ' : 'σβηστή';
    out.heater.parentElement.className = 'lab-readout ' + (s.heater ? 'is-warn' : '');
    out.switches.textContent = s.switches.length;
    out.switches.parentElement.className =
      'lab-readout ' + (s.switches.length >= 8 ? 'is-bad' : 'is-good');
    const pulse = Math.floor(s.t * 60) % 4;
    nodes.forEach((node, i) => node.classList.toggle('is-good', s.auto && i === pulse));
    view.redraw();
  }

  function draw(ctx, w, hgt) {
    ctx.clearRect(0, 0, w, hgt);
    const pad = { l: 44, r: 12, t: 14, b: 26 };
    const min = 10;
    const max = 26;
    const y = (v) => pad.t + ((hgt - pad.t - pad.b) * (max - v)) / (max - min);
    const span = 3; // hours shown
    const x = (t) => pad.l + ((w - pad.l - pad.r) * (t - (s.t - span))) / span;
    ctx.fillStyle = 'rgba(95,224,176,0.12)';
    ctx.fillRect(pad.l, y(setpoint + 1), w - pad.l - pad.r, y(setpoint - 1) - y(setpoint + 1));
    ctx.font = '11px "UC Gothic", sans-serif';
    ctx.fillStyle = '#8f95c4';
    ctx.textAlign = 'right';
    for (let v = 12; v <= 26; v += 4) ctx.fillText(`${v}°`, pad.l - 8, y(v) + 4);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5fe0b0';
    ctx.fillText('ζώνη άνεσης 20–22 °C', pad.l + 8, y(setpoint + 1) - 6);
    const hist = s.history;
    ctx.fillStyle = 'rgba(251,180,84,0.18)';
    for (let i = 1; i < hist.length; i++)
      if (hist[i].heater)
        ctx.fillRect(x(hist[i - 1].t), hgt - pad.b - 8, x(hist[i].t) - x(hist[i - 1].t) + 0.5, 8);
    ctx.strokeStyle = '#fbb454';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    hist.forEach((p, i) => (i ? ctx.lineTo(x(p.t), y(p.temp)) : ctx.moveTo(x(p.t), y(p.temp))));
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8f95c4';
    ctx.fillText('θέρμανση', pad.l + 8, hgt - pad.b - 12);
    if (s.window > 0) {
      ctx.fillStyle = '#7482ff';
      ctx.font = '14px "UC Nasalization", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('🪟 ανοιχτό παράθυρο', w - pad.r - 8, pad.t + 16);
    }
  }
  loop(view.canvas, tick);

  const autoSwitch = toggle('Αυτόματος θερμοστάτης', false, (v) => {
    s.auto = v;
    manualSwitch.input.disabled = v;
    if (v) {
      lab.complete('loop');
      status.textContent =
        'Ο βρόχος έκλεισε: ο ελεγκτής ανάβει τη θέρμανση κάτω από τον στόχο και τη σβήνει από πάνω.';
    } else status.textContent = 'Χειροκίνητη λειτουργία: εσύ είσαι ο ελεγκτής.';
  });

  lab.body.append(
    diagram,
    view.canvas,
    h(
      'div',
      { class: 'lab-readouts' },
      card('Πραγματική θερμοκρασία', out.temp),
      card('Ένδειξη αισθητήρα', out.reading),
      card('Ενεργοποιητής', out.heater),
      card('Εναλλαγές/ώρα', out.switches),
    ),
    h(
      'div',
      { class: 'lab-controls' },
      h('div', { class: 'lab-field' }, autoSwitch, manualSwitch),
      slider({
        label: 'Εξωτερική θερμοκρασία',
        min: -5,
        max: 18,
        value: s.outside,
        format: (v) => `${v} °C`,
        onInput: (v) => (s.outside = v),
      }),
      slider({
        label: 'Θόρυβος αισθητήρα',
        min: 0,
        max: 1,
        step: 0.1,
        value: s.noise,
        format: (v) => `± ${fmt.format(v)} °C`,
        onInput: (v) => (s.noise = v),
      }),
      slider({
        label: 'Υστέρηση θερμοστάτη',
        min: 0,
        max: 1.6,
        step: 0.2,
        value: s.hysteresis,
        format: (v) => `${fmt.format(v)} °C`,
        onInput: (v) => (s.hysteresis = v),
      }),
      h(
        'div',
        { class: 'lab-field' },
        h('span', { class: 'lab-field__label' }, 'Συμβάν'),
        button(
          'Άνοιξε το παράθυρο (20 λεπτά)',
          () => {
            s.window = 20 / 60;
            status.textContent =
              'Κρύος αέρας μπαίνει στο δωμάτιο. Ο αισθητήρας το αντιλαμβάνεται μέσα σε ένα λεπτό.';
          },
          'blue',
        ),
      ),
    ),
    status,
  );
  render();
}
