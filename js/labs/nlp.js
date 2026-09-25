// Lab: natural language processing. A deliberately transparent chatbot: every message
// is normalised, tokenised, filtered, matched to an intent and scored for sentiment,
// and the visitor can inspect each step. It runs entirely in the browser.
import { h, frame } from './kit.js';
import { getState } from '../progress.js';

export const normalise = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ');
export const tokenise = (text) => normalise(text).match(/[\p{L}\p{N}]+/gu) ?? [];

const stop = new Set(
  'ο η το οι τα του τησ των τον την και να θα με σε στο στη στην στον στα στουσ στισ για απο που πωσ οτι ειναι ενα μια μου σου μασ σασ τι ποιο ποια ποιοσ αυτο αυτη λιγο πολυ ειμαι εχω εχει ηταν σαν ωσ αν ή η'.split(
    ' ',
  ),
);
const negations = new Set(['δεν', 'μην', 'μη', 'ουτε', 'οχι']);
const positive = [
  'τελει',
  'υπεροχ',
  'ωραι',
  'καλα',
  'καλη',
  'καλο',
  'αγαπ',
  'χαρ',
  'ευχαριστ',
  'φανταστ',
  'εξαιρετ',
  'αρεσ',
  'ενδιαφερ',
  'εντυπωσ',
  'κουλ',
];
const neutralWords = new Set(['καλοριφερ', 'καλημερα', 'καλησπερα', 'καληνυχτα']);
const negative = [
  'κακ',
  'απαισ',
  'χαλα',
  'χαλι',
  'μισ',
  'θυμ',
  'βαρετ',
  'λυπ',
  'κουρασ',
  'εκνευρ',
  'δυσκολ',
  'χαζ',
  'προβλημ',
  'αγχ',
  'φοβ',
  'ανησυχ',
  'χειροτερ',
  'αηδ',
];
const hasStem = (token, stems) => stems.some((stem) => token.startsWith(stem));

export const intents = [
  {
    id: 'lights_on',
    label: 'Εντολή: άναψε φώτα',
    all: [
      ['αναψ', 'ανοιξ'],
      ['φω', 'λαμπ'],
    ],
  },
  {
    id: 'lights_off',
    label: 'Εντολή: σβήσε φώτα',
    all: [
      ['σβησ', 'κλεισ'],
      ['φω', 'λαμπ'],
    ],
  },
  {
    id: 'blinds',
    label: 'Εντολή: ρολά',
    all: [
      ['κλεισ', 'ανοιξ', 'κατεβ', 'ανεβ'],
      ['ρολ', 'κουρτιν', 'παντζουρ'],
    ],
  },
  {
    id: 'heat',
    label: 'Εντολή: θερμοκρασία',
    any: ['θερμοκρασ', 'θερμανσ', 'καλοριφερ', 'κρυ', 'ζεσταιν', 'βαθμ'],
  },
  { id: 'ambiguous', label: 'Ασαφής εντολή', any: ['κλεισ', 'ανοιξ', 'αναψ', 'σβησ'] },
  {
    id: 'weiser',
    label: 'Ερώτηση: Mark Weiser',
    any: ['weiser', 'βαιζερ', 'γουαιζερ', 'ουαιζερ', 'εμπνευστ'],
  },
  {
    id: 'ubicomp',
    label: 'Ερώτηση: διάχυτη υπολογιστική',
    any: ['διαχυτ', 'πανταχου', 'ubiquitous', 'ubicomp', 'pervasive'],
  },
  { id: 'waves', label: 'Ερώτηση: τα κύματα', any: ['κυμα'] },
  {
    id: 'privacy',
    label: 'Ερώτηση: ιδιωτικότητα',
    any: ['ιδιωτικοτ', 'απορρητ', 'privacy', 'δεδομεν', 'παρακολουθ'],
  },
  {
    id: 'nlp',
    label: 'Ερώτηση: πώς καταλαβαίνεις',
    any: ['καταλαβαιν', 'δουλευεισ', 'λειτουργ', 'nlp', 'γλωσσ'],
  },
  { id: 'who', label: 'Ερώτηση: ποια είσαι', any: ['ονομα', 'ποια', 'εισαι'] },
  { id: 'joke', label: 'Αίτημα: αστείο', any: ['αστει', 'ανεκδοτ', 'γελα'] },
  { id: 'thanks', label: 'Ευχαριστίες', any: ['ευχαριστ', 'thanks', 'thank'] },
  {
    id: 'greet',
    label: 'Χαιρετισμός',
    any: ['γεια', 'καλημερ', 'καλησπερ', 'χαιρ', 'hello', 'hi', 'γειασ'],
  },
  { id: 'help', label: 'Βοήθεια', any: ['βοηθει', 'μπορεισ', 'help'] },
];

export function analyse(text) {
  const tokens = tokenise(text);
  const marks = tokens.map((token) => ({
    token,
    stop: stop.has(token),
    key: false,
    polarity: 0,
    entity: null,
  }));
  // Sentiment with negation: "δεν μου αρέσει" flips the polarity of the next opinion word.
  let score = 0;
  marks.forEach((mark, i) => {
    let p = neutralWords.has(mark.token)
      ? 0
      : hasStem(mark.token, positive)
        ? 1
        : hasStem(mark.token, negative)
          ? -1
          : 0;
    if (p && marks.slice(Math.max(0, i - 3), i).some((m) => negations.has(m.token))) p = -p;
    mark.polarity = p;
    score += p;
    if (/^\d+$/.test(mark.token)) mark.entity = 'αριθμός';
    if (hasStem(mark.token, ['σαλον', 'κουζιν', 'υπνοδωματ', 'μπανι', 'γραφει']))
      mark.entity = 'δωμάτιο';
  });
  const candidates = [];
  for (const intent of intents) {
    let matched = [];
    if (intent.all) {
      const groups = intent.all.map((stems) => marks.filter((m) => hasStem(m.token, stems)));
      if (groups.every((g) => g.length)) matched = groups.flat();
    } else matched = marks.filter((m) => !m.stop && hasStem(m.token, intent.any));
    if (!matched.length) continue;
    const content = marks.filter((m) => !m.stop).length || 1;
    const confidence = Math.min(
      0.98,
      0.45 + (matched.length / content) * 0.5 + (intent.all ? 0.2 : 0),
    );
    candidates.push({ intent, confidence, matched });
  }
  // Specific intents outrank the generic "ambiguous" catch-all.
  const best =
    candidates
      .filter((c) => c.intent.id !== 'ambiguous')
      .sort((a, b) => b.confidence - a.confidence)[0] ??
    candidates[0] ??
    null;
  best?.matched.forEach((m) => (m.key = true));
  const room = marks.find((m) => m.entity === 'δωμάτιο')?.token;
  const number = marks.find((m) => m.entity === 'αριθμός')?.token;
  return {
    marks,
    intent: best?.intent ?? { id: 'fallback', label: 'Άγνωστη πρόθεση' },
    confidence: best?.confidence ?? 0.2,
    sentiment: Math.max(-1, Math.min(1, score / 2)),
    room,
    number: number ? Number(number) : null,
  };
}

const roomNames = {
  σαλον: 'στο σαλόνι',
  κουζιν: 'στην κουζίνα',
  υπνοδωματ: 'στο υπνοδωμάτιο',
  μπανι: 'στο μπάνιο',
  γραφει: 'στο γραφείο',
};
const roomLabel = (token) =>
  (token ? Object.entries(roomNames).find(([stem]) => token.startsWith(stem))?.[1] : null) ??
  'σε όλο το σπίτι';

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '💬',
    title: 'Μίλα με την Aria',
    intro:
      'Η Aria είναι η βοηθός από την ιστορία του Alex. Εδώ δεν κρύβει τίποτα: πάτησε σε ένα μήνυμά σου για να δεις πώς το «διάβασε».',
    missions: [
      { id: 'command', text: 'Δώσε μια εντολή στο σπίτι, π.χ. να ανάψει τα φώτα στο σαλόνι.' },
      { id: 'question', text: 'Ρώτησε κάτι για τη διάχυτη υπολογιστική ή τον Mark Weiser.' },
      {
        id: 'negation',
        text: 'Γράψε μια πρόταση με άρνηση, π.χ. «δεν μου αρέσει», και δες το συναίσθημα να αλλάζει.',
      },
      { id: 'ambiguous', text: 'Δώσε μια ασαφή εντολή και δες πώς ζητά διευκρίνιση.' },
    ],
    embedded,
    onComplete,
  });

  const home = { light: new Set(), temp: 20, blinds: 'ανοιχτά' };
  const level = getState().profile?.level ?? 'newbie';
  const log = h('div', {
    class: 'lab-chat__log',
    role: 'log',
    'aria-live': 'polite',
    'aria-label': 'Συνομιλία',
  });
  const input = h('input', {
    type: 'text',
    'aria-label': 'Το μήνυμά σου',
    placeholder: 'Γράψε στην Aria…',
    autocomplete: 'off',
    maxlength: '160',
  });
  const form = h(
    'form',
    { class: 'lab-chat__form' },
    input,
    h('button', { type: 'submit', class: 'lab-btn' }, 'Αποστολή'),
  );
  const suggestions = [
    'Γεια σου Aria!',
    'Άναψε τα φώτα στο σαλόνι',
    'Ποιος ήταν ο Mark Weiser;',
    'Κλείσε',
    'Δεν μου αρέσει καθόλου το κρύο',
    'Βάλε τη θερμοκρασία στους 22',
    'Πώς με καταλαβαίνεις;',
  ];
  const suggest = h(
    'div',
    { class: 'lab-chat__suggest', role: 'group', 'aria-label': 'Προτάσεις' },
    suggestions.map((text) =>
      h('button', { type: 'button', class: 'lab-chip', onClick: () => send(text) }, text),
    ),
  );
  const tokens = h('div', { class: 'lab-tokens' });
  const intentOut = h('span', { class: 'lab-readout__value' }, '—');
  const confidenceOut = h('span', { class: 'lab-readout__value' }, '—');
  const sentimentOut = h('span', { class: 'lab-readout__value' }, '—');
  const homeOut = h('span', { class: 'lab-readout__value' });
  const readout = (label, v) =>
    h('div', { class: 'lab-readout' }, h('span', { class: 'lab-readout__label' }, label), v);
  const inspector = h(
    'div',
    { class: 'lab-panel' },
    h('p', { class: 'lab-panel__title' }, 'Πώς το διάβασε η Aria'),
    tokens,
    h(
      'div',
      { class: 'lab-readouts', style: { marginTop: '12px' } },
      readout('Πρόθεση', intentOut),
      readout('Βεβαιότητα', confidenceOut),
      readout('Συναίσθημα', sentimentOut),
    ),
    h(
      'p',
      { class: 'lab-note', style: { marginTop: '10px' } },
      h('span', { class: 'lab-token is-stop' }, 'λέξη'),
      ' συχνή λέξη χωρίς νόημα (stop word) · ',
      h('span', { class: 'lab-token is-key' }, 'λέξη'),
      ' λέξη-κλειδί · ',
      h('span', { class: 'lab-token is-entity' }, 'λέξη'),
      ' οντότητα · ',
      h('span', { class: 'lab-token is-pos' }, 'θετική'),
      ' / ',
      h('span', { class: 'lab-token is-neg' }, 'αρνητική'),
    ),
  );
  const homePanel = h('div', { class: 'lab-readouts' }, readout('Το σπίτι της Aria', homeOut));

  function renderHome() {
    homeOut.textContent = `${home.light.size ? '💡 ' + [...home.light].join(', ') : '🌑 φώτα σβηστά'} · 🌡️ ${home.temp} °C · 🪟 ρολά ${home.blinds}`;
  }
  function show(result) {
    tokens.replaceChildren(
      ...(result.marks.length
        ? result.marks.map((m) =>
            h(
              'span',
              {
                class:
                  'lab-token' +
                  (m.stop ? ' is-stop' : '') +
                  (m.key ? ' is-key' : '') +
                  (m.entity ? ' is-entity' : '') +
                  (m.polarity > 0 ? ' is-pos' : m.polarity < 0 ? ' is-neg' : ''),
                title: m.entity ?? '',
              },
              m.token,
            ),
          )
        : [h('span', { class: 'lab-note' }, 'Δεν βρέθηκαν λέξεις.')]),
    );
    intentOut.textContent = result.intent.label;
    confidenceOut.textContent = `${Math.round(result.confidence * 100)}%`;
    const s = result.sentiment;
    sentimentOut.textContent = s > 0.2 ? '🙂 θετικό' : s < -0.2 ? '🙁 αρνητικό' : '😐 ουδέτερο';
    sentimentOut.parentElement.className =
      'lab-readout ' + (s > 0.2 ? 'is-good' : s < -0.2 ? 'is-bad' : '');
  }

  function reply(result) {
    const r = result;
    const where = roomLabel(r.room);
    const empathy =
      r.sentiment < -0.2 ? 'Λυπάμαι που νιώθεις έτσι. ' : r.sentiment > 0.2 ? 'Χαίρομαι! ' : '';
    switch (r.intent.id) {
      case 'lights_on':
        home.light.add(where.replace(/^σ(το|την) /, ''));
        lab.complete('command');
        return `${empathy}Άναψα τα φώτα ${where}. 💡`;
      case 'lights_off':
        home.light.clear();
        lab.complete('command');
        return `Έσβησα τα φώτα ${where}.`;
      case 'blinds': {
        const close = r.marks.some((m) => hasStem(m.token, ['κλεισ', 'κατεβ']));
        home.blinds = close ? 'κλειστά' : 'ανοιχτά';
        lab.complete('command');
        return close ? 'Κατέβασα τα ρολά.' : 'Άνοιξα τα ρολά, να μπει φως.';
      }
      case 'heat': {
        if (r.number && r.number >= 15 && r.number <= 28) {
          home.temp = r.number;
          lab.complete('command');
          return `${empathy}Ρύθμισα τη θερμοκρασία στους ${r.number} °C. Ο θερμοστάτης θα κάνει τα υπόλοιπα.`;
        }
        if (r.number)
          return `Οι ${r.number} °C δεν είναι ασφαλής ρύθμιση. Διάλεξε κάτι από 15 έως 28.`;
        home.temp = Math.min(28, home.temp + 2);
        lab.complete('command');
        return `${empathy}Ανέβασα τη θερμοκρασία στους ${home.temp} °C.`;
      }
      case 'ambiguous':
        lab.complete(
          'ambiguous',
          'Ο άνθρωπος καταλαβαίνει από τα συμφραζόμενα· η μηχανή πρέπει να ρωτήσει.',
        );
        return 'Δεν είμαι σίγουρη τι εννοείς. Να κλείσω τα φώτα, τα ρολά ή κάτι άλλο;';
      case 'weiser':
        lab.complete('question');
        return level === 'advanced'
          ? 'Ο Mark Weiser (1952–1999), επικεφαλής τεχνολογίας στο Xerox PARC, διατύπωσε τον όρο το 1988 και τον δημοσίευσε στο «The Computer for the 21st Century» (1991). Μαζί με τον John Seely Brown μίλησε και για την «ήρεμη τεχνολογία».'
          : 'Ο Mark Weiser ήταν ερευνητής στο Xerox PARC. Το 1988 οραματίστηκε υπολογιστές τόσο καλά ενσωματωμένους στην καθημερινότητα, που δεν τους προσέχουμε καν.';
      case 'ubicomp':
        lab.complete('question');
        return 'Διάχυτη υπολογιστική σημαίνει ότι η υπολογιστική ισχύς βρίσκεται μέσα στα καθημερινά αντικείμενα και μας βοηθά χωρίς να ζητά την προσοχή μας. Όπως εγώ!';
      case 'waves':
        lab.complete('question');
        return 'Τρία κύματα: τα θεμέλια (φορητές συσκευές, ασύρματα δίκτυα, αισθητήρες…), η συνδεδεμένη καθημερινότητα (έξυπνα σπίτια, αυτοκίνητα, ρούχα) και το μέλλον που μόλις αρχίζει.';
      case 'privacy':
        lab.complete('question');
        return 'Σημαντική ερώτηση. Όσα μου γράφεις εδώ μένουν στη συσκευή σου. Ένα πραγματικό σύστημα όμως πρέπει να ζητά συναίνεση και να εξηγεί τι κρατά και γιατί.';
      case 'nlp':
        lab.complete('question');
        return 'Χωρίζω το μήνυμα σε λέξεις, αγνοώ τις πολύ συχνές, ψάχνω λέξεις-κλειδιά για να μαντέψω την πρόθεσή σου και μετρώ θετικές και αρνητικές λέξεις. Πάτησε σε ένα μήνυμά σου για να το δεις.';
      case 'who':
        return 'Είμαι η Aria, η ψηφιακή βοηθός του σπιτιού του Alex. Εδώ είμαι πολύ πιο απλή: κανόνες και λεξικά, όχι μεγάλο γλωσσικό μοντέλο.';
      case 'joke':
        return 'Γιατί ο υπολογιστής πήγε στον γιατρό; Γιατί είχε ιό! 🦠 (Συγγνώμη, είμαι καλύτερη στα φώτα.)';
      case 'thanks':
        return 'Παρακαλώ! Αν θες, δοκίμασε μια εντολή για το σπίτι.';
      case 'greet':
        return 'Γεια σου! Μπορώ να ελέγξω φώτα, ρολά και θερμοκρασία ή να σου πω για τη διάχυτη υπολογιστική.';
      case 'help':
        return 'Δοκίμασε: «άναψε τα φώτα στην κουζίνα», «βάλε 22 βαθμούς», «ποιος ήταν ο Weiser;».';
      default:
        return `${empathy}Δεν αναγνώρισα την πρόθεσή σου. Ένα απλό σύστημα κανόνων κολλά σε όσα δεν προβλέφθηκαν. Δοκίμασε μια από τις προτάσεις.`;
    }
  }

  function bubble(text, who, result) {
    const node =
      who === 'me'
        ? h(
            'button',
            {
              type: 'button',
              class: 'lab-msg lab-msg--me',
              'aria-label': `Το μήνυμά σου: ${text}. Προβολή ανάλυσης.`,
            },
            text,
          )
        : h('p', { class: 'lab-msg lab-msg--bot' }, text);
    if (result)
      node.addEventListener('click', () => {
        log.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'));
        node.classList.add('is-selected');
        show(result);
      });
    log.append(node);
    log.scrollTop = log.scrollHeight;
    return node;
  }

  function send(text) {
    const clean = text.trim().slice(0, 160);
    if (!clean) return;
    const result = analyse(clean);
    log.querySelectorAll('.is-selected').forEach((n) => n.classList.remove('is-selected'));
    bubble(clean, 'me', result).classList.add('is-selected');
    show(result);
    if (
      result.marks.some(
        (m, i) =>
          m.polarity &&
          result.marks.slice(Math.max(0, i - 3), i).some((x) => negations.has(x.token)),
      )
    )
      lab.complete('negation', 'Μια λέξη όπως «δεν» αντιστρέφει το νόημα της επόμενης.');
    const answer = reply(result);
    renderHome();
    setTimeout(() => bubble(answer, 'bot'), 350);
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    send(input.value);
    input.value = '';
  });

  bubble('Γεια! Είμαι η Aria. Γράψε μου κάτι ή διάλεξε μια πρόταση από κάτω.', 'bot');
  renderHome();
  lab.body.append(h('div', { class: 'lab-chat' }, log, suggest, form), homePanel, inspector);
}
