// Single source of truth for the exhibit's structure: chapters, labs, badges and levels.
// Pages, the personalised path and the progress dashboard all read from here.

export const chapters = [
  {
    id: 'history',
    group: 'foundations',
    title: 'Ιστορία των υπολογιστών',
    short: 'Ιστορία',
    story: 'index.html#istoria',
    reading: 'reading.html#history',
    minutes: 8,
    level: 'newbie',
  },
  {
    id: 'idea',
    group: 'foundations',
    title: 'Η ιδέα και οι αρχές σχεδιασμού',
    short: 'Η ιδέα',
    story: 'index.html#dy',
    reading: 'reading.html#principles',
    minutes: 6,
    level: 'moderate',
  },
  {
    id: 'mobile',
    group: 'wave1',
    title: 'Φορητές συσκευές',
    story: 'index.html#mobile-fp',
    reading: 'reading.html#mobile-fp',
    minutes: 4,
  },
  {
    id: 'wireless',
    group: 'wave1',
    title: 'Ασύρματη επικοινωνία',
    story: 'index.html#wireless-com-fp',
    reading: 'reading.html#wireless-com-fp',
    minutes: 5,
  },
  {
    id: 'rfid',
    group: 'wave1',
    title: 'Τεχνολογία RFID',
    story: 'index.html#rfid-fp',
    reading: 'reading.html#rfid-fp',
    minutes: 4,
  },
  {
    id: 'cloud',
    group: 'wave1',
    title: 'Cloud computing',
    story: 'index.html#cloud-fp',
    reading: 'reading.html#cloud-fp',
    minutes: 5,
  },
  {
    id: 'sensors',
    group: 'wave1',
    title: 'Αισθητήρες και ενεργοποιητές',
    story: 'index.html#sensors-fp',
    reading: 'reading.html#sensors-fp',
    minutes: 5,
  },
  {
    id: 'vision',
    group: 'wave1',
    title: 'Υπολογιστική όραση',
    story: 'index.html#comp-vis-fp',
    reading: 'reading.html#comp-vis-fp',
    lab: 'vision',
    minutes: 6,
  },
  {
    id: 'lbs',
    group: 'wave1',
    title: 'Συστήματα που βασίζονται στη θέση',
    story: 'index.html#lbs-fp',
    reading: 'reading.html#lbs-fp',
    minutes: 5,
  },
  {
    id: 'nlp',
    group: 'wave1',
    title: 'Επεξεργασία φυσικής γλώσσας',
    story: 'index.html#nlp-fp',
    reading: 'reading.html#nlp-fp',
    minutes: 5,
  },
  {
    id: 'smart-house',
    group: 'wave2',
    title: 'Έξυπνο σπίτι',
    story: 'index.html#smart-house',
    reading: 'reading.html#smart-house',
    minutes: 5,
  },
  {
    id: 'smart-car',
    group: 'wave2',
    title: 'Έξυπνο αυτοκίνητο',
    story: 'index.html#smart-car',
    reading: 'reading.html#smart-car',
    minutes: 5,
  },
  {
    id: 'smart-clothes',
    group: 'wave2',
    title: 'Έξυπνα ρούχα',
    story: 'index.html#smart-clothes',
    reading: 'reading.html#smart-clothes',
    minutes: 5,
  },
  {
    id: 'scenario',
    group: 'wave3',
    title: 'Μια μέρα στη ζωή του Alex',
    story: 'index.html#scenario-intro',
    reading: 'reading.html#future',
    minutes: 4,
  },
  {
    id: 'trends',
    group: 'wave3',
    title: 'Τάσεις και ερωτήματα για το μέλλον',
    story: 'index.html#future-trends',
    reading: 'reading.html#trends',
    minutes: 6,
  },
];

export const groups = {
  foundations: { title: 'Θεμέλια', kicker: 'Πριν τα κύματα' },
  wave1: { title: 'Πρώτο κύμα', kicker: 'Τα δομικά στοιχεία' },
  wave2: { title: 'Δεύτερο κύμα', kicker: 'Ο άνθρωπος στο επίκεντρο' },
  wave3: { title: 'Τρίτο κύμα', kicker: 'Το μέλλον' },
};

// Computer vision is the exhibit's fully built hands-on chapter (the thesis' proof of
// concept). Every other first-wave chapter keeps an open application slot below.
export const labs = {
  vision: {
    title: 'Πειράματα με την κάμερα',
    chapter: 'vision',
    page: 'lab.html#vision',
    summary:
      'Πρόσωπο, χέρια και στάση σώματος: τρία πειράματα υπολογιστικής όρασης που εκτελούνται στη συσκευή σου.',
    icon: '👁️',
  },
};

// Chapters whose application is still to be built, e.g. by a future thesis.
// Three of the ideas are the thesis' own proposals (section 6.2.4).
export const openSlots = [
  {
    chapter: 'mobile',
    source: 'Ιδέα',
    idea: 'Ένα χρονολόγιο που συγκρίνει τον υπολογιστή του Apollo με ένα σημερινό κινητό και μια σάρωση των αισθητήρων της συσκευής του επισκέπτη.',
  },
  {
    chapter: 'wireless',
    source: 'Πρόταση της εργασίας (§6.2.4)',
    idea: 'Μια προσομοίωση όπου ο επισκέπτης στήνει εικονικές συσκευές που επικοινωνούν ασύρματα, βλέπει τη μεταφορά δεδομένων και την καθυστέρηση υπό διαφορετικές συνθήκες και «χτίζει» ένα απλό δικό του πρωτόκολλο.',
  },
  {
    chapter: 'rfid',
    source: 'Ιδέα',
    idea: 'Ένας εικονικός αναγνώστης όπου ο επισκέπτης φέρνει ετικέτες κοντά του, βλέπει πώς τροφοδοτούνται από το πεδίο και δανείζεται βιβλία χωρίς οπτική επαφή.',
  },
  {
    chapter: 'cloud',
    source: 'Ιδέα',
    idea: 'Μια προσομοίωση μιας μέρας κίνησης σε μια υπηρεσία, όπου ο επισκέπτης προσθέτει ή αφαιρεί διακομιστές και ζυγίζει αξιοπιστία και κόστος.',
  },
  {
    chapter: 'sensors',
    source: 'Ιδέα',
    idea: 'Ένας θερμοστάτης που δείχνει ζωντανά τον βρόχο ανάδρασης: αισθητήρας, ελεγκτής, ενεργοποιητής και δωμάτιο.',
  },
  {
    chapter: 'lbs',
    source: 'Πρόταση της εργασίας (§6.2.4)',
    idea: 'Ένας διαδραστικός χάρτης του μουσείου που εντοπίζει τη θέση του επισκέπτη, με εικονικά ορόσημα και την πρόκληση να βρει τη συντομότερη διαδρομή ανάμεσά τους.',
  },
  {
    chapter: 'nlp',
    source: 'Πρόταση της εργασίας (§6.2.4)',
    idea: 'Ένα chatbot που προσαρμόζει τις απαντήσεις του στο επίπεδο γνώσεων του επισκέπτη, αναλύει το συναίσθημα των μηνυμάτων του και εξηγεί πώς τα κατάλαβε.',
  },
];

export const visionExperiments = [
  { id: 'face', title: 'Τα σημεία ενός προσώπου', page: 'face_recognition.html', icon: '🙂' },
  { id: 'hand', title: 'Χέρια και χειρονομίες', page: 'hand_gestures.html', icon: '✋' },
  { id: 'pose', title: 'Στάση σώματος', page: 'pose_detection.html', icon: '🧍' },
];

export const levels = [
  { min: 0, title: 'Επισκέπτης' },
  { min: 80, title: 'Εξερευνητής' },
  { min: 220, title: 'Γνώστης' },
  { min: 420, title: 'Ειδικός' },
  { min: 700, title: 'Οραματιστής' },
];

// Each badge is a pure predicate over the saved state, so it can be re-evaluated anywhere.
export const badges = [
  {
    id: 'first-step',
    icon: '🧭',
    title: 'Πρώτο βήμα',
    text: 'Ολοκλήρωσες το διαγνωστικό quiz.',
    test: (s) => Boolean(s.quizzes.intro),
  },
  {
    id: 'historian',
    icon: '📜',
    title: 'Ιστορικός',
    text: 'Διέσχισες την ιστορία των υπολογιστών.',
    test: (s) => Boolean(s.visited.history),
  },
  {
    id: 'weiser',
    icon: '💡',
    title: 'Μαθητής του Weiser',
    text: 'Γνώρισες την ιδέα και τις αρχές σχεδιασμού.',
    test: (s) => Boolean(s.visited.idea),
  },
  {
    id: 'wave1',
    icon: '🌊',
    title: 'Ερευνητής του πρώτου κύματος',
    text: 'Επισκέφθηκες και τις οκτώ τεχνολογίες.',
    test: (s) => chapters.filter((c) => c.group === 'wave1').every((c) => s.visited[c.id]),
  },
  {
    id: 'hands-on',
    icon: '🛠️',
    title: 'Χέρια στο εργαστήριο',
    text: 'Ολοκλήρωσες και τα τρία πειράματα υπολογιστικής όρασης.',
    test: (s) => visionExperiments.every((e) => s.labs['vision-' + e.id]),
  },
  {
    id: 'machine-eye',
    icon: '👁️',
    title: 'Μάτι μηχανής',
    text: 'Δοκίμασες ένα πείραμα υπολογιστικής όρασης.',
    test: (s) => Boolean(s.labs.vision),
  },
  {
    id: 'wave2',
    icon: '🏠',
    title: 'Συνδεδεμένη ζωή',
    text: 'Εξερεύνησες όλο το δεύτερο κύμα.',
    test: (s) => chapters.filter((c) => c.group === 'wave2').every((c) => s.visited[c.id]),
  },
  {
    id: 'time-traveller',
    icon: '🚀',
    title: 'Ταξιδιώτης στο μέλλον',
    text: 'Έζησες μια μέρα με τον Alex.',
    test: (s) => Boolean(s.visited.scenario),
  },
  {
    id: 'checkins',
    icon: '✅',
    title: 'Σταθερά βήματα',
    text: 'Πέρασες και τους τρεις ελέγχους των κυμάτων.',
    test: (s) => ['wave1', 'wave2', 'wave3'].every((w) => s.checkins[w]?.passed),
  },
  {
    id: 'voice',
    icon: '🗳️',
    title: 'Φωνή της κοινότητας',
    text: 'Ψήφισες στη δημοσκόπηση για το cloud.',
    test: (s) => Object.keys(s.polls).length >= 1,
  },
  {
    id: 'scholar',
    icon: '🎓',
    title: 'Άριστα',
    text: 'Απάντησες σωστά σε όλο το τελικό quiz.',
    test: (s) => s.quizzes.final && s.quizzes.final.best === s.quizzes.final.total,
  },
  {
    id: 'returning',
    icon: '🔁',
    title: 'Ξανά εδώ',
    text: 'Επέστρεψες σε διαφορετική μέρα.',
    test: (s) => (s.days?.length ?? 0) >= 2,
  },
  {
    id: 'complete',
    icon: '🌟',
    title: 'Ολόκληρο το ταξίδι',
    text: 'Επισκέφθηκες κάθε κεφάλαιο και ολοκλήρωσες το τελικό quiz.',
    test: (s) => chapters.every((c) => s.visited[c.id]) && Boolean(s.quizzes.final),
  },
];

export const xpRules = {
  visit: 10,
  theory: 5,
  lab: 30,
  checkinCorrect: 10,
  finalCorrect: 10,
  intro: 20,
  poll: 5,
  badge: 15,
};

export const interests = [
  { id: 'devices', label: 'Συσκευές και wearables', chapters: ['mobile', 'smart-clothes'] },
  { id: 'networks', label: 'Δίκτυα και επικοινωνία', chapters: ['wireless', 'rfid', 'cloud'] },
  { id: 'ai', label: 'Τεχνητή νοημοσύνη', chapters: ['vision', 'nlp'] },
  { id: 'home', label: 'Σπίτι και πόλη', chapters: ['sensors', 'smart-house', 'lbs'] },
  { id: 'mobility', label: 'Μετακίνηση', chapters: ['smart-car', 'lbs'] },
  { id: 'future', label: 'Μέλλον και ηθική', chapters: ['scenario', 'trends'] },
];

export const styles = [
  { id: 'story', label: 'Να το δω', text: 'Η κινούμενη αφήγηση με εικόνες και σκηνές.' },
  { id: 'reading', label: 'Να το διαβάσω', text: 'Καθαρό κείμενο, στον δικό μου ρυθμό.' },
  { id: 'hands-on', label: 'Να το δοκιμάσω', text: 'Πρώτα τα πειράματα, μετά η θεωρία.' },
];
