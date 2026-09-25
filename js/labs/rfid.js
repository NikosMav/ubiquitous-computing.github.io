// Lab: RFID. Passive tags have no battery: the reader's field powers them, they answer
// with an identifier, and a database turns that identifier into meaning.
import { h, frame, segmented, button } from './kit.js';

const bands = {
  lf: {
    label: 'LF 125 kHz',
    range: 'έως ~10 cm',
    far: false,
    use: 'ζώα συντροφιάς, κλειδιά αυτοκινήτου',
  },
  hf: {
    label: 'HF 13,56 MHz',
    range: 'έως ~10 cm',
    far: false,
    use: 'βιβλιοθήκες, εισιτήρια, NFC',
  },
  uhf: {
    label: 'UHF 868 MHz',
    range: 'αρκετά μέτρα',
    far: true,
    use: 'αποθήκες, παλέτες, logistics',
  },
};
const items = [
  {
    id: 'book1',
    icon: '📕',
    name: 'Βιβλίο: «Ο υπολογιστής του 21ου αιώνα»',
    band: 'hf',
    epc: 'E004 01A3 7C21',
    kind: 'book',
  },
  {
    id: 'book2',
    icon: '📗',
    name: 'Βιβλίο: «Calm Technology»',
    band: 'hf',
    epc: 'E004 01A3 7C4F',
    kind: 'book',
  },
  {
    id: 'book3',
    icon: '📘',
    name: 'Βιβλίο: «Ιστορία των υπολογιστών»',
    band: 'hf',
    epc: 'E004 01A3 7D02',
    kind: 'book',
  },
  {
    id: 'ticket',
    icon: '🎟️',
    name: 'Εισιτήριο μουσείου',
    band: 'hf',
    epc: 'E004 0122 0931',
    kind: 'ticket',
  },
  {
    id: 'cat',
    icon: '🐈',
    name: 'Γάτα με μικροτσίπ',
    band: 'lf',
    epc: '300 0987 6543 210',
    kind: 'pet',
  },
  {
    id: 'pallet',
    icon: '📦',
    name: 'Παλέτα αποθήκης (στα 4 μέτρα)',
    band: 'uhf',
    epc: '3034 257B F400 0A1B',
    kind: 'pallet',
    far: true,
  },
];
const meaning = {
  book: 'Δανεισμός καταχωρήθηκε. Επιστροφή σε 14 ημέρες.',
  ticket: 'Είσοδος επιτρέπεται: Μουσείο Πληροφορικής, αίθουσα 6.',
  pet: 'Κατοικίδιο καταχωρημένο. Στοιχεία ιδιοκτήτη διαθέσιμα στον κτηνίατρο.',
  pallet: 'Παλέτα #1B: 48 κιβώτια, προορισμός Θεσσαλονίκη.',
};

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '🏷️',
    title: 'Ο αναγνώστης RFID',
    intro:
      'Οι ετικέτες RFID δεν έχουν μπαταρία. Το πεδίο του αναγνώστη τις τροφοδοτεί, εκείνες απαντούν με έναν κωδικό, και το σύστημα βρίσκει τι σημαίνει.',
    missions: [
      { id: 'one', text: 'Διάβασε μια ετικέτα.' },
      { id: 'many', text: 'Δάνεισε τρία βιβλία με μία σάρωση, χωρίς να τα κοιτάξει κανείς.' },
      { id: 'band', text: 'Δες γιατί μια ετικέτα δεν απαντά στη λάθος συχνότητα.' },
      { id: 'far', text: 'Διάβασε την παλέτα της αποθήκης από απόσταση.' },
    ],
    embedded,
    onComplete,
  });

  let band = 'hf';
  const inField = new Set();
  const cards = new Map();
  const reader = h('div', { class: 'lab-reader', 'aria-label': 'Πεδίο αναγνώστη' });
  const slot = h('div', { class: 'lab-reader__slot', 'data-empty': 'Σύρε ετικέτες εδώ' });
  reader.append(
    h(
      'div',
      { class: 'lab-reader__stage' },
      h('span', { class: 'lab-reader__field' }),
      h('span', { class: 'lab-reader__field' }),
      h('span', { class: 'lab-reader__field' }),
      h(
        'div',
        { class: 'lab-reader__device' },
        'ΑΝΑΓΝΩΣΤΗΣ',
        h('br'),
        h('span', { class: 'band' }),
      ),
    ),
    slot,
  );
  const tray = h('div', {
    class: 'lab-tags',
    role: 'list',
    'aria-label': 'Αντικείμενα με ετικέτες',
  });
  const log = h('div', { class: 'lab-log', role: 'log', 'aria-live': 'polite' });
  const bandNote = h('p', { class: 'lab-note' });

  const line = (text, cls = '') => {
    log.append(h('p', { class: cls }, text));
    log.scrollTop = log.scrollHeight;
  };

  function place(item, inside) {
    const card = cards.get(item.id);
    if (inside) {
      inField.add(item.id);
      slot.append(card);
    } else {
      inField.delete(item.id);
      card.classList.remove('is-read');
      tray.append(card);
    }
    card.classList.toggle('is-in', inside);
    card.querySelector('.lab-tag__action').textContent = inside ? 'Απομάκρυνση' : 'Στον αναγνώστη';
  }

  for (const item of items) {
    const card = h(
      'div',
      { class: 'lab-tag', role: 'listitem', 'data-id': item.id },
      h('span', { class: 'lab-tag__icon', 'aria-hidden': 'true' }, item.icon),
      h('span', {}, item.name),
      h('span', { class: 'lab-tag__meta' }, bands[item.band].label),
      h(
        'button',
        {
          type: 'button',
          class: 'lab-chip lab-tag__action',
          onClick: () => place(item, !inField.has(item.id)),
        },
        'Στον αναγνώστη',
      ),
    );
    cards.set(item.id, card);
    tray.append(card);
    enableDrag(card, item);
  }

  // Pointer dragging for mouse and touch; the button above is the accessible path.
  function enableDrag(card, item) {
    card.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      event.preventDefault();
      const rect = card.getBoundingClientRect();
      const dx = event.clientX - rect.left;
      const dy = event.clientY - rect.top;
      const ghost = card.cloneNode(true);
      ghost.classList.add('is-dragging');
      ghost.style.width = rect.width + 'px';
      document.body.append(ghost);
      card.style.opacity = '0.35';
      const move = (e) => {
        ghost.style.left = e.clientX - dx + 'px';
        ghost.style.top = e.clientY - dy + 'px';
        const r = reader.getBoundingClientRect();
        reader.classList.toggle(
          'is-over',
          e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom,
        );
      };
      const up = (e) => {
        removeEventListener('pointermove', move);
        removeEventListener('pointerup', up);
        ghost.remove();
        card.style.opacity = '';
        const r = reader.getBoundingClientRect();
        const over =
          e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
        reader.classList.remove('is-over');
        if (over !== inField.has(item.id)) place(item, over);
      };
      move(event);
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
    });
  }

  function scan() {
    log.replaceChildren();
    if (!inField.size) {
      line('Κανένα αντικείμενο στο πεδίο. Σύρε μια ετικέτα στον αναγνώστη.', 'is-dim');
      return;
    }
    line(`> Ο αναγνώστης εκπέμπει στα ${bands[band].label} και ρωτά: «ποιος είναι εδώ;»`, 'is-dim');
    const present = items.filter((item) => inField.has(item.id));
    let read = 0;
    let books = 0;
    let wrongBand = false;
    present.forEach((item, index) => {
      const card = cards.get(item.id);
      if (item.band !== band) {
        wrongBand = true;
        line(
          `  ${item.icon} σιωπή: η κεραία της ετικέτας είναι συντονισμένη στα ${bands[item.band].label}.`,
          'is-err',
        );
        return;
      }
      if (item.far && !bands[band].far) {
        line(`  ${item.icon} πολύ μακριά για αυτή τη συχνότητα.`, 'is-err');
        return;
      }
      read++;
      if (item.kind === 'book') books++;
      card.classList.add('is-read');
      line(
        `  ${item.icon} τροφοδοτήθηκε από το πεδίο και απαντά: ID ${item.epc} (σχισμή ${index + 1})`,
        'is-ok',
      );
      line(`     βάση δεδομένων → ${meaning[item.kind]}`);
    });
    if (present.length > 1)
      line(
        '> Αντιπαράθεση (anti-collision): κάθε ετικέτα απαντά σε δική της χρονοθυρίδα.',
        'is-dim',
      );
    if (read) lab.complete('one');
    if (books >= 3)
      lab.complete('many', 'Ένας γραμμωτός κώδικας θα χρειαζόταν τρεις σαρώσεις με οπτική επαφή.');
    if (wrongBand)
      lab.complete('band', 'Αναγνώστης και ετικέτα πρέπει να «μιλούν» στην ίδια συχνότητα.');
    if (present.some((item) => item.far && cards.get(item.id).classList.contains('is-read')))
      lab.complete('far');
  }

  function setBand(value) {
    band = value;
    reader.style.setProperty('--range', bands[value].far ? '420px' : '170px');
    reader.querySelector('.band').textContent = bands[value].label;
    bandNote.innerHTML = '';
    bandNote.append(
      h('strong', {}, bands[value].label),
      `: εμβέλεια ${bands[value].range}. Χρήσεις: ${bands[value].use}.`,
    );
    cards.forEach((card) => card.classList.remove('is-read'));
  }
  setBand('hf');
  line('Σύρε ετικέτες στον αναγνώστη (ή πάτα «Στον αναγνώστη») και μετά «Σάρωση».', 'is-dim');

  lab.body.append(
    segmented(
      'Συχνότητα αναγνώστη',
      Object.entries(bands).map(([value, b]) => ({ value, label: b.label })),
      band,
      setBand,
    ),
    bandNote,
    h('div', { class: 'lab-rfid' }, reader, tray),
    h(
      'div',
      { class: 'lab-row' },
      button('Σάρωση', scan),
      button(
        'Άδειασμα πεδίου',
        () => {
          items.forEach((item) => place(item, false));
          log.replaceChildren();
        },
        'ghost',
      ),
    ),
    log,
  );
}
