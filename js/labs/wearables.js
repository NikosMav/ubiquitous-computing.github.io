// Lab: smart clothes. A shirt with sensors streams vital signs; the visitor sees how an
// algorithm spots an anomaly and decides who is allowed to receive which data.
import { h, frame, segmented, button, stage, loop, meter } from './kit.js';

const activities = {
  rest: { label: 'Ξεκούραση', hr: 66, br: 14, steps: 0, temp: 33.4 },
  walk: { label: 'Περπάτημα', hr: 98, br: 19, steps: 105, temp: 33.9 },
  run: { label: 'Τρέξιμο', hr: 152, br: 34, steps: 165, temp: 34.8 },
  sleep: { label: 'Ύπνος', hr: 54, br: 12, steps: 0, temp: 33.1 },
};
const dataTypes = [
  { id: 'hr', label: 'Καρδιακός ρυθμός' },
  { id: 'steps', label: 'Κίνηση και βήματα' },
  { id: 'sleep', label: 'Ύπνος' },
  { id: 'gps', label: 'Τοποθεσία' },
];
const recipients = [
  { id: 'doctor', label: 'Γιατρός' },
  { id: 'fitness', label: 'Εφαρμογή γυμναστικής' },
  { id: 'insurer', label: 'Ασφαλιστική' },
  { id: 'employer', label: 'Εργοδότης' },
];

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '👕',
    title: 'Το έξυπνο μπλουζάκι',
    intro:
      'Υφασμάτινοι αισθητήρες μετρούν σφυγμό, αναπνοή, κίνηση και θερμοκρασία. Χρήσιμα δεδομένα, αλλά και πολύ προσωπικά. Ποιος πρέπει να τα βλέπει;',
    missions: [
      { id: 'activity', text: 'Σύγκρινε τον σφυγμό σε ξεκούραση και σε τρέξιμο.' },
      {
        id: 'privacy',
        text: 'Μοιράσου τον σφυγμό μόνο με τον γιατρό, όχι με ασφαλιστική ή εργοδότη.',
      },
      { id: 'alert', text: 'Εντόπισε μια ανωμαλία και ειδοποίησε τον γιατρό.' },
    ],
    embedded,
    onComplete,
  });

  let activity = 'rest';
  let anomaly = 0;
  const seen = new Set(['rest']);
  const live = { hr: 66, br: 14, steps: 0, temp: 33.4 };
  const history = [];
  const shares = new Set(['fitness:steps']);
  let alertShown = false;

  const hrMeter = meter('Σφυγμός', 66, 200);
  const brMeter = meter('Αναπνοή', 14, 40);
  const stepMeter = meter('Βήματα/λεπτό', 0, 200);
  const tempMeter = meter('Θερμοκρασία δέρματος', 33.4, 40);
  const view = stage('lab-canvas lab-canvas--short', draw);
  const alertBox = h('div', { class: 'lab-callout is-bad', hidden: true, role: 'alert' });
  const privacyNote = h('p', { class: 'lab-callout', role: 'status' });

  function draw(ctx, w, hgt) {
    ctx.clearRect(0, 0, w, hgt);
    const y = (bpm) => hgt - 16 - ((hgt - 32) * (bpm - 40)) / 140;
    ctx.strokeStyle = 'rgba(196,200,234,0.1)';
    ctx.font = '11px "UC Gothic", sans-serif';
    ctx.fillStyle = '#8f95c4';
    for (const b of [60, 100, 140, 180]) {
      ctx.beginPath();
      ctx.moveTo(34, y(b));
      ctx.lineTo(w, y(b));
      ctx.stroke();
      ctx.fillText(String(b), 4, y(b) + 4);
    }
    ctx.strokeStyle = anomaly ? '#ff7a8a' : '#5fe0b0';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    history.forEach((p, i) => {
      const x = 34 + ((w - 34) * i) / 240;
      i ? ctx.lineTo(x, y(p)) : ctx.moveTo(x, y(p));
    });
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#c4c8ea';
    ctx.fillText('παλμοί/λεπτό', 38, 14);
  }

  loop(view.canvas, (dt) => {
    const target = activities[activity];
    const ease = Math.min(1, dt * 1.2);
    const hrTarget = anomaly > 0 ? 158 + Math.sin(performance.now() / 90) * 22 : target.hr;
    live.hr += (hrTarget - live.hr) * ease + (Math.random() - 0.5) * 1.5;
    live.br += (target.br - live.br) * ease;
    live.steps += (target.steps - live.steps) * ease;
    live.temp += (target.temp - live.temp) * ease * 0.3;
    if (anomaly > 0) anomaly -= dt;
    history.push(live.hr);
    if (history.length > 240) history.shift();
    hrMeter.set(
      live.hr,
      `${Math.round(live.hr)}`,
      live.hr > 140 ? 'bad' : live.hr > 100 ? 'warn' : 'good',
    );
    brMeter.set(live.br, `${Math.round(live.br)}/λεπτό`);
    stepMeter.set(live.steps, `${Math.round(live.steps)}`);
    tempMeter.set(live.temp, `${live.temp.toFixed(1).replace('.', ',')} °C`);
    // The shirt's rule: a racing heart while the body is still is worth a look.
    if (anomaly > 0 && live.hr > 130 && live.steps < 10 && !alertShown) showAlert();
    view.redraw();
  });

  function showAlert() {
    alertShown = true;
    alertBox.hidden = false;
    alertBox.replaceChildren(
      h('strong', {}, '⚠️ Ανωμαλία: '),
      'πολύ υψηλός, ακανόνιστος σφυγμός ενώ το σώμα είναι ακίνητο. ',
      h(
        'div',
        { class: 'lab-row', style: { marginTop: '10px' } },
        button('Ειδοποίηση γιατρού', () => {
          if (!shares.has('doctor:hr')) {
            alertBox.lastChild.after(
              h(
                'p',
                { class: 'lab-note', style: { marginTop: '8px' } },
                'Ο γιατρός δεν έχει πρόσβαση στον σφυγμό σου. Ενεργοποίησέ την στον πίνακα συναίνεσης και ξαναδοκίμασε.',
              ),
            );
            return;
          }
          alertBox.className = 'lab-callout is-good';
          alertBox.replaceChildren(
            '✅ Ο γιατρός έλαβε το καταγεγραμμένο ηλεκτροκαρδιογράφημα και θα επικοινωνήσει μαζί σου.',
          );
          lab.complete('alert', 'Η συνεχής παρακολούθηση μπορεί να σώσει ζωές, με συναίνεση.');
        }),
        button(
          'Αγνόηση',
          () => {
            alertBox.hidden = true;
            alertShown = false;
          },
          'ghost',
        ),
      ),
    );
  }

  const matrix = h(
    'table',
    { class: 'lab-matrix' },
    h('caption', { class: 'lab-sr' }, 'Ποια δεδομένα μοιράζεσαι με ποιον'),
    h(
      'thead',
      {},
      h(
        'tr',
        {},
        h('th', { scope: 'col' }, 'Δεδομένα'),
        recipients.map((r) => h('th', { scope: 'col' }, r.label)),
      ),
    ),
    h(
      'tbody',
      {},
      dataTypes.map((d) =>
        h(
          'tr',
          {},
          h('th', { scope: 'row' }, d.label),
          recipients.map((r) => {
            const key = `${r.id}:${d.id}`;
            const input = h('input', {
              type: 'checkbox',
              checked: shares.has(key),
              'aria-label': `${d.label} προς ${r.label}`,
            });
            input.addEventListener('change', () => {
              if (input.checked) shares.add(key);
              else shares.delete(key);
              judge();
            });
            return h('td', {}, input);
          }),
        ),
      ),
    ),
  );
  function judge() {
    const risky = [...shares].filter((k) => k.startsWith('insurer') || k.startsWith('employer'));
    const doctorHr = shares.has('doctor:hr');
    if (risky.length) {
      privacyNote.className = 'lab-callout is-bad';
      privacyNote.textContent = `Προσοχή: ${risky.length} ροές δεδομένων πηγαίνουν σε ασφαλιστική ή εργοδότη. Θα μπορούσαν να επηρεάσουν το ασφάλιστρο ή την εργασία σου.`;
    } else if (shares.has('fitness:gps')) {
      privacyNote.className = 'lab-callout';
      privacyNote.textContent =
        'Η τοποθεσία στην εφαρμογή γυμναστικής αποκαλύπτει πού μένεις και πότε τρέχεις. Χρειάζεται;';
    } else {
      privacyNote.className = 'lab-callout is-good';
      privacyNote.textContent = doctorHr
        ? 'Ελάχιστη κοινοποίηση: κάθε αποδέκτης παίρνει μόνο ό,τι χρειάζεται.'
        : 'Κανένα ευαίσθητο δεδομένο δεν φεύγει από τη συσκευή.';
    }
    if (doctorHr && !risky.length)
      lab.complete('privacy', 'Αυτή είναι η αρχή της «προστασίας ιδιωτικότητας» από τη θεωρία.');
  }
  judge();

  lab.body.append(
    segmented(
      'Δραστηριότητα',
      Object.entries(activities).map(([value, a]) => ({ value, label: a.label })),
      activity,
      (v) => {
        activity = v;
        seen.add(v);
        if (seen.has('rest') && seen.has('run'))
          lab.complete('activity', 'Ο σφυγμός υπερδιπλασιάζεται στο τρέξιμο.');
      },
    ),
    view.canvas,
    h(
      'div',
      { class: 'lab-panel', style: { display: 'grid', gap: '10px' } },
      hrMeter,
      brMeter,
      stepMeter,
      tempMeter,
    ),
    h(
      'div',
      { class: 'lab-row' },
      button(
        'Προσομοίωση ανωμαλίας',
        () => {
          if (activity === 'run' || activity === 'walk') {
            alertBox.hidden = false;
            alertBox.className = 'lab-callout';
            alertBox.textContent =
              'Σε κίνηση ο γρήγορος σφυγμός είναι φυσιολογικός. Διάλεξε «Ξεκούραση» ή «Ύπνος» για να ξεχωρίσει η ανωμαλία.';
            return;
          }
          alertBox.className = 'lab-callout is-bad';
          alertBox.hidden = true;
          anomaly = 12;
        },
        'blue',
      ),
    ),
    alertBox,
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, 'Πίνακας συναίνεσης'),
      h('div', { style: { overflowX: 'auto' } }, matrix),
      privacyNote,
    ),
  );
}
