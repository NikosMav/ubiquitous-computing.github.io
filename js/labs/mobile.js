// Lab: portable devices. From the Apollo guidance computer to the phone in your pocket,
// and a look at which sensors the visitor's own device exposes to the browser.
import { h, frame, button } from './kit.js';

// Commonly cited specifications; memory is working memory (RAM).
const devices = [
  {
    year: 1969,
    icon: '🚀',
    name: 'Apollo Guidance Computer',
    mhz: 1.024,
    kb: 4,
    grams: 32000,
    note: 'Οδήγησε τους αστροναύτες στη Σελήνη.',
  },
  {
    year: 1981,
    icon: '🖥️',
    name: 'IBM PC 5150',
    mhz: 4.77,
    kb: 16,
    grams: 11300,
    note: 'Ο υπολογιστής μπαίνει στα γραφεία και στα σπίτια.',
  },
  {
    year: 1994,
    icon: '📟',
    name: 'IBM Simon',
    mhz: 16,
    kb: 1024,
    grams: 510,
    note: 'Θεωρείται το πρώτο smartphone: τηλέφωνο, email και οθόνη αφής.',
  },
  {
    year: 2007,
    icon: '📱',
    name: 'iPhone',
    mhz: 412,
    kb: 131072,
    grams: 135,
    note: 'Η οθόνη πολλαπλής αφής αλλάζει τον τρόπο που αλληλεπιδρούμε.',
  },
  {
    year: 2015,
    icon: '⌚',
    name: 'Apple Watch',
    mhz: 520,
    kb: 524288,
    grams: 40,
    note: 'Ο υπολογιστής φοριέται στον καρπό.',
  },
  {
    year: 2025,
    icon: '✨',
    name: 'Σύγχρονο smartphone',
    mhz: 4000,
    kb: 12582912,
    grams: 200,
    note: 'Οκτώ πυρήνες, κάμερες, αισθητήρες και τεχνητή νοημοσύνη στην τσέπη.',
  },
];

const size = (kb) =>
  kb >= 1048576
    ? `${Math.round(kb / 1048576)} GB`
    : kb >= 1024
      ? `${Math.round(kb / 1024)} MB`
      : `${kb} KB`;
const speed = (mhz) => (mhz >= 1000 ? `${(mhz / 1000).toFixed(1)} GHz` : `${mhz} MHz`);
const weight = (g) => (g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`);
// Logarithmic bars: the differences span seven orders of magnitude.
const logWidth = (value, min, max) =>
  8 + (92 * (Math.log10(value) - Math.log10(min))) / (Math.log10(max) - Math.log10(min));

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '📱',
    title: 'Τι κρύβει η τσέπη σου;',
    intro:
      'Οι φορητές συσκευές έφεραν την υπολογιστική ισχύ μαζί μας. Ταξίδεψε από το 1969 ως σήμερα και μετά σάρωσε τη δική σου συσκευή.',
    missions: [
      { id: 'ends', text: 'Σύγκρινε το 1969 με το σήμερα.' },
      { id: 'simon', text: 'Βρες το πρώτο smartphone.' },
      { id: 'guess', text: 'Μάντεψε πόσες φορές περισσότερη μνήμη έχει ένα κινητό.' },
      { id: 'scan', text: 'Σάρωσε τους αισθητήρες της συσκευής σου.' },
    ],
    embedded,
    onComplete,
  });

  const seen = new Set();
  const timeline = h('div', {
    class: 'lab-timeline',
    role: 'group',
    'aria-label': 'Χρονολόγιο συσκευών',
  });
  const detail = h('div', { class: 'lab-panel' });
  const bars = h('div', { class: 'lab-bars' });
  const buttons = devices.map((device, index) =>
    h(
      'button',
      { type: 'button', 'aria-pressed': 'false', onClick: () => select(index) },
      h('span', { 'aria-hidden': 'true' }, device.icon),
      h('strong', {}, device.year),
      h('span', {}, device.name),
    ),
  );
  timeline.append(...buttons);

  function bar(label, thenValue, nowValue, min, max, format) {
    return h(
      'div',
      { class: 'lab-bar' },
      h('span', {}, label),
      h(
        'div',
        { class: 'lab-bar__track' },
        h('span', {
          class: 'lab-bar__fill is-then',
          style: { width: logWidth(thenValue, min, max) + '%' },
        }),
        h('span', {
          class: 'lab-bar__fill',
          style: { width: logWidth(nowValue, min, max) + '%', opacity: 0.85 },
        }),
        h('span', { class: 'lab-bar__text' }, `${format(nowValue)}  ·  1969: ${format(thenValue)}`),
      ),
    );
  }

  function select(index) {
    const device = devices[index];
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    seen.add(device.year);
    detail.replaceChildren(
      h('p', { class: 'lab-panel__title' }, `${device.year} · ${device.name}`),
      h('p', { class: 'lab-note' }, device.note),
    );
    const agc = devices[0];
    bars.replaceChildren(
      bar('Ταχύτητα', agc.mhz, device.mhz, 1, 4000, speed),
      bar('Μνήμη', agc.kb, device.kb, 4, 12582912, size),
      bar('Βάρος', agc.grams, device.grams, 40, 32000, weight),
    );
    if (seen.has(1969) && seen.has(2025))
      lab.complete('ends', '3.000.000 φορές περισσότερη μνήμη, 160 φορές ελαφρύτερο.');
    if (device.year === 1994) lab.complete('simon', 'IBM Simon, 1994.');
  }
  select(0);

  // A quick estimate question keeps the comparison concrete.
  const answers = [
    ['1.000 φορές', false],
    ['100.000 φορές', false],
    ['3 εκατομμύρια φορές', true],
  ];
  const guessFeedback = h('p', { class: 'lab-callout', hidden: true, role: 'status' });
  const guess = h(
    'div',
    { class: 'lab-panel' },
    h('p', { class: 'lab-panel__title' }, 'Μάντεψε'),
    h(
      'p',
      { class: 'lab-note' },
      'Ένα κινητό με 12 GB μνήμης έχει πόσες φορές περισσότερη μνήμη από τα 4 KB του Apollo;',
    ),
    h(
      'div',
      { class: 'lab-row', style: { marginTop: '12px' } },
      answers.map(([label, right]) =>
        h(
          'button',
          {
            type: 'button',
            class: 'lab-chip',
            onClick: (event) => {
              guess
                .querySelectorAll('.lab-chip')
                .forEach((c) => c.setAttribute('aria-pressed', 'false'));
              event.currentTarget.setAttribute('aria-pressed', 'true');
              guessFeedback.hidden = false;
              guessFeedback.className = 'lab-callout ' + (right ? 'is-good' : 'is-bad');
              guessFeedback.textContent = right
                ? 'Σωστά! 12 GB ÷ 4 KB ≈ 3,1 εκατομμύρια. Κι όμως, τα 4 KB αρκούσαν για να φτάσει ο άνθρωπος στη Σελήνη.'
                : 'Όχι ακόμη. Σκέψου: 1 GB είναι περίπου ένα εκατομμύριο KB. Δοκίμασε ξανά.';
              if (right) lab.complete('guess');
            },
          },
          label,
        ),
      ),
    ),
    guessFeedback,
  );

  // Feature detection only: nothing is requested or read from the sensors.
  const probes = [
    ['Οθόνη αφής', () => navigator.maxTouchPoints > 0],
    ['Επιταχυνσιόμετρο', () => 'DeviceMotionEvent' in window && navigator.maxTouchPoints > 0],
    [
      'Γυροσκόπιο / πυξίδα',
      () => 'DeviceOrientationEvent' in window && navigator.maxTouchPoints > 0,
    ],
    ['Εντοπισμός θέσης', () => 'geolocation' in navigator],
    ['Κάμερα / μικρόφωνο', () => Boolean(navigator.mediaDevices?.getUserMedia)],
    ['Δόνηση', () => 'vibrate' in navigator],
    ['Μπαταρία', () => 'getBattery' in navigator],
    ['Bluetooth', () => 'bluetooth' in navigator],
    ['NFC', () => 'NDEFReader' in window],
  ];
  const sensorList = h('div', { class: 'lab-sensors', 'aria-live': 'polite' });
  const scanNote = h(
    'p',
    { class: 'lab-note' },
    'Ο browser δεν ζητά άδεια για τη σάρωση: απλώς ελέγχει ποιες δυνατότητες υποστηρίζονται.',
  );
  const scan = button(
    'Σάρωση συσκευής',
    () => {
      sensorList.replaceChildren();
      let found = 0;
      probes.forEach(([name, test], index) => {
        setTimeout(() => {
          let ok = false;
          try {
            ok = Boolean(test());
          } catch {
            ok = false;
          }
          found += Number(ok);
          sensorList.append(
            h(
              'div',
              { class: 'lab-sensor ' + (ok ? 'is-yes' : 'is-no') },
              h('span', { class: 'lab-sensor__dot', 'aria-hidden': 'true' }),
              h(
                'span',
                {},
                name,
                h('span', { class: 'lab-sr' }, ok ? ': διαθέσιμο' : ': μη διαθέσιμο'),
              ),
            ),
          );
          if (index === probes.length - 1) {
            scanNote.textContent =
              navigator.maxTouchPoints > 0
                ? `Βρέθηκαν ${found} δυνατότητες. Ένα τηλέφωνο είναι ένα μικρό εργαστήριο αισθητήρων.`
                : `Βρέθηκαν ${found} δυνατότητες. Σε κινητό θα έβρισκες πολύ περισσότερους αισθητήρες: αυτή είναι η διαφορά ενός φορητού «διάχυτου» υπολογιστή.`;
            lab.complete('scan');
          }
        }, index * 140);
      });
    },
    'blue',
  );

  lab.body.append(
    timeline,
    detail,
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, 'Τότε και τώρα (λογαριθμική κλίμακα)'),
      bars,
    ),
    guess,
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, 'Η δική σου συσκευή'),
      h('div', { class: 'lab-row', style: { marginBottom: '12px' } }, scan),
      sensorList,
      scanNote,
    ),
  );
}
