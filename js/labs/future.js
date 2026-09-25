// Lab: the third wave. Eight trends from the thesis; visitors weigh hope against worry
// and compare with everyone who used this station. Tallies stay on this device.
import { h, frame } from './kit.js';
import { vote } from '../progress.js';

const KEY = 'uc-station-future-v1';
export const trends = [
  {
    id: 'connectivity',
    title: 'Αύξηση της συνδεσιμότητας',
    text: 'Το 5G και το Internet of Things συνδέουν τα πάντα με τα πάντα.',
    example: 'Φανάρια που «μιλούν» με τα αυτοκίνητα.',
  },
  {
    id: 'automation',
    title: 'Υψηλός αυτοματισμός',
    text: 'Συστήματα που αντιλαμβάνονται τις ανάγκες μας και δρουν χωρίς εντολή.',
    example: 'Το ψυγείο παραγγέλνει μόνο του γάλα.',
  },
  {
    id: 'personal',
    title: 'Εξατομικευμένη εμπειρία',
    text: 'Υπηρεσίες και περιεχόμενο προσαρμόζονται στον καθένα.',
    example: 'Ένα μουσείο που αλλάζει την ξενάγηση για σένα.',
  },
  {
    id: 'health',
    title: 'Υγεία και ευεξία',
    text: 'Συνεχής παρακολούθηση και πρόληψη ασθενειών.',
    example: 'Ρούχα που προειδοποιούν για αρρυθμία.',
  },
  {
    id: 'education',
    title: 'Εκπαίδευση και μάθηση',
    text: 'Πρόσβαση στη γνώση από παντού, με τρόπους που ταιριάζουν στον καθένα.',
    example: 'Ένα εργαστήριο στο κινητό σου.',
  },
  {
    id: 'security',
    title: 'Ασφάλεια και ιδιωτικότητα',
    text: 'Περισσότερες συσκευές σημαίνει περισσότερα δεδομένα και περισσότερους κινδύνους.',
    example: 'Μια κάμερα σπιτιού χωρίς ενημερώσεις ασφαλείας.',
  },
  {
    id: 'environment',
    title: 'Περιβάλλον και βιωσιμότητα',
    text: 'Έξυπνα συστήματα εξοικονομούν ενέργεια και πόρους.',
    example: 'Φωτισμός δρόμων που ανάβει μόνο όταν χρειάζεται.',
  },
  {
    id: 'ethics',
    title: 'Ηθικές και κοινωνικές πτυχές',
    text: 'Ποιος ελέγχει την τεχνολογία και ποιος μένει εκτός;',
    example: 'Αλγόριθμοι που αποφασίζουν για δάνεια ή προσλήψεις.',
  },
];
const labels = [
  'Με ανησυχεί πολύ',
  'Με ανησυχεί',
  'Ουδέτερο',
  'Με ενθουσιάζει',
  'Με ενθουσιάζει πολύ',
];
const governance = [
  { id: 'citizens', label: 'Οι πολίτες, με διαβούλευση' },
  { id: 'experts', label: 'Οι επιστήμονες και οι μηχανικοί' },
  { id: 'states', label: 'Οι κυβερνήσεις, με νόμους' },
  { id: 'market', label: 'Η αγορά και οι εταιρείες' },
];

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { ratings: {}, votes: {} };
  } catch {
    return { ratings: {}, votes: {} };
  }
};
const write = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
};

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '🔮',
    title: 'Ψήφισε το μέλλον',
    intro:
      'Το τρίτο κύμα δεν έχει γραφτεί ακόμη. Για κάθε τάση, ζύγισε αν σε ενθουσιάζει ή σε ανησυχεί, και δες πώς απάντησαν όσοι πέρασαν από αυτόν τον σταθμό.',
    missions: [
      { id: 'half', text: 'Αξιολόγησε τέσσερις τάσεις.' },
      { id: 'all', text: 'Αξιολόγησε και τις οκτώ.' },
      {
        id: 'govern',
        text: 'Απάντησε: ποιος πρέπει να αποφασίζει για την τεχνολογία του μέλλοντος;',
      },
    ],
    embedded,
    onComplete,
  });

  const mine = {};
  const station = read();
  const profile = h('p', { class: 'lab-callout', hidden: true, role: 'status' });
  const grid = h('div', { class: 'lab-trends' });

  function crowdText(id) {
    const list = station.ratings[id] ?? [];
    if (!list.length) return 'Είσαι ο πρώτος σε αυτόν τον σταθμό.';
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    return `${list.length} επισκέπτ${list.length === 1 ? 'ης' : 'ες'} εδώ: κατά μέσο όρο «${labels[Math.round(avg) + 2].toLowerCase()}».`;
  }

  for (const trend of trends) {
    const id = `trend-${trend.id}`;
    const value = h('output', { for: id, class: 'lab-field__value' }, 'όρισε');
    const crowd = h('p', { class: 'lab-trend__crowd' });
    const input = h('input', {
      type: 'range',
      min: -2,
      max: 2,
      step: 1,
      value: 0,
      id,
      class: 'lab-range',
      'aria-describedby': `${id}-text`,
    });
    const card = h(
      'article',
      { class: 'lab-trend' },
      h('h5', {}, trend.title),
      h('p', { id: `${id}-text` }, trend.text, ' ', h('em', {}, trend.example)),
      h('label', { class: 'lab-field__label', for: id }, 'Η γνώμη σου', value),
      input,
      h(
        'div',
        { class: 'lab-trend__scale', 'aria-hidden': 'true' },
        h('span', {}, 'ανησυχία'),
        h('span', {}, 'ενθουσιασμός'),
      ),
      h('button', { type: 'button', class: 'lab-chip', onClick: () => commit() }, 'Καταχώριση'),
      crowd,
    );
    input.addEventListener('input', () => (value.textContent = labels[Number(input.value) + 2]));
    function commit() {
      const first = !(trend.id in mine);
      mine[trend.id] = Number(input.value);
      value.textContent = labels[mine[trend.id] + 2];
      card.classList.add('is-rated');
      if (first) {
        station.ratings[trend.id] = [...(station.ratings[trend.id] ?? []), mine[trend.id]].slice(
          -500,
        );
        write(station);
      }
      crowd.textContent = crowdText(trend.id);
      const count = Object.keys(mine).length;
      if (count >= 4) lab.complete('half');
      if (count === trends.length) {
        lab.complete('all');
        summarise();
      }
    }
    grid.append(card);
  }

  function summarise() {
    const values = Object.values(mine);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const loved = trends
      .filter((t) => mine[t.id] === Math.max(...values))
      .map((t) => t.title.toLowerCase());
    const feared = trends
      .filter((t) => mine[t.id] === Math.min(...values))
      .map((t) => t.title.toLowerCase());
    profile.hidden = false;
    profile.textContent =
      (mean > 0.5
        ? 'Είσαι αισιόδοξος οραματιστής. '
        : mean < -0.5
          ? 'Είσαι προσεκτικός κριτικός. '
          : 'Ζυγίζεις ψύχραιμα οφέλη και κινδύνους. ') +
      `Σε ενθουσιάζει περισσότερο: ${loved.join(', ')}. Σε προβληματίζει: ${feared.join(', ')}. Ο Weiser θα συμφωνούσε ότι και τα δύο χρειάζονται σχεδιασμό.`;
  }

  const govResult = h('p', { class: 'lab-note', role: 'status' });
  const govern = h(
    'fieldset',
    { class: 'lab-panel', style: { border: '1px solid var(--uc-line)' } },
    h(
      'legend',
      { class: 'lab-panel__title', style: { padding: '0 6px' } },
      'Ποιος πρέπει να αποφασίζει;',
    ),
    h(
      'div',
      { class: 'lab-row' },
      governance.map((g) =>
        h(
          'button',
          {
            type: 'button',
            class: 'lab-chip',
            'aria-pressed': 'false',
            onClick: (event) => {
              govern
                .querySelectorAll('.lab-chip')
                .forEach((c) => c.setAttribute('aria-pressed', 'false'));
              event.currentTarget.setAttribute('aria-pressed', 'true');
              station.votes[g.id] = (station.votes[g.id] ?? 0) + 1;
              write(station);
              vote('future-governance', g.id);
              const total = Object.values(station.votes).reduce((a, b) => a + b, 0);
              govResult.textContent =
                'Σε αυτόν τον σταθμό: ' +
                governance
                  .map(
                    (x) => `${x.label} ${Math.round(((station.votes[x.id] ?? 0) / total) * 100)}%`,
                  )
                  .join(' · ');
              lab.complete('govern');
            },
          },
          g.label,
        ),
      ),
    ),
    govResult,
  );

  lab.body.append(
    grid,
    profile,
    govern,
    h(
      'p',
      { class: 'lab-note' },
      'Οι απαντήσεις μετρώνται μόνο σε αυτή τη συσκευή: σε ένα περίπτερο μουσείου, αυτό είναι το κοινό του σταθμού.',
    ),
  );
}
