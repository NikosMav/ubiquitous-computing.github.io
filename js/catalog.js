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
    lab: 'mobile',
    minutes: 4,
  },
  {
    id: 'wireless',
    group: 'wave1',
    title: 'Ασύρματη επικοινωνία',
    story: 'index.html#wireless-com-fp',
    reading: 'reading.html#wireless-com-fp',
    lab: 'wireless',
    minutes: 5,
  },
  {
    id: 'rfid',
    group: 'wave1',
    title: 'Τεχνολογία RFID',
    story: 'index.html#rfid-fp',
    reading: 'reading.html#rfid-fp',
    lab: 'rfid',
    minutes: 4,
  },
  {
    id: 'cloud',
    group: 'wave1',
    title: 'Cloud computing',
    story: 'index.html#cloud-fp',
    reading: 'reading.html#cloud-fp',
    lab: 'cloud',
    minutes: 5,
  },
  {
    id: 'sensors',
    group: 'wave1',
    title: 'Αισθητήρες και ενεργοποιητές',
    story: 'index.html#sensors-fp',
    reading: 'reading.html#sensors-fp',
    lab: 'sensors',
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
    lab: 'lbs',
    minutes: 5,
  },
  {
    id: 'nlp',
    group: 'wave1',
    title: 'Επεξεργασία φυσικής γλώσσας',
    story: 'index.html#nlp-fp',
    reading: 'reading.html#nlp-fp',
    lab: 'nlp',
    minutes: 5,
  },
  {
    id: 'smart-house',
    group: 'wave2',
    title: 'Έξυπνο σπίτι',
    story: 'index.html#smart-house',
    reading: 'reading.html#smart-house',
    lab: 'smarthome',
    minutes: 5,
  },
  {
    id: 'smart-car',
    group: 'wave2',
    title: 'Έξυπνο αυτοκίνητο',
    story: 'index.html#smart-car',
    reading: 'reading.html#smart-car',
    lab: 'smartcar',
    minutes: 5,
  },
  {
    id: 'smart-clothes',
    group: 'wave2',
    title: 'Έξυπνα ρούχα',
    story: 'index.html#smart-clothes',
    reading: 'reading.html#smart-clothes',
    lab: 'wearables',
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
    lab: 'future',
    minutes: 6,
  },
];

export const groups = {
  foundations: { title: 'Θεμέλια', kicker: 'Πριν τα κύματα' },
  wave1: { title: 'Πρώτο κύμα', kicker: 'Τα δομικά στοιχεία' },
  wave2: { title: 'Δεύτερο κύμα', kicker: 'Ο άνθρωπος στο επίκεντρο' },
  wave3: { title: 'Τρίτο κύμα', kicker: 'Το μέλλον' },
};

export const labs = {
  mobile: {
    title: 'Τι κρύβει η τσέπη σου;',
    chapter: 'mobile',
    page: 'lab-mobile.html',
    summary:
      'Σύγκρινε τον υπολογιστή του Apollo με ένα σημερινό κινητό και ανακάλυψε τους αισθητήρες της συσκευής σου.',
    icon: '📱',
  },
  wireless: {
    title: 'Στείλε ένα πακέτο',
    chapter: 'wireless',
    page: 'lab-wireless.html',
    summary:
      'Τοποθέτησε συσκευές, διάλεξε Bluetooth, Wi-Fi ή 5G και δες εμβέλεια, ταχύτητα και καθυστέρηση.',
    icon: '📡',
  },
  rfid: {
    title: 'Ο αναγνώστης RFID',
    chapter: 'rfid',
    page: 'lab-rfid.html',
    summary:
      'Φέρε ετικέτες κοντά στον αναγνώστη, διάβασε τα δεδομένα τους και ολοκλήρωσε ένα δάνειο βιβλιοθήκης.',
    icon: '🏷️',
  },
  cloud: {
    title: 'Κλιμάκωσε το νέφος',
    chapter: 'cloud',
    page: 'lab-cloud.html',
    summary:
      'Κράτησε μια υπηρεσία όρθια όταν έρχεται κύμα επισκεπτών, ισορροπώντας απόδοση και κόστος.',
    icon: '☁️',
  },
  sensors: {
    title: 'Ο βρόχος ανάδρασης',
    chapter: 'sensors',
    page: 'lab-sensors.html',
    summary:
      'Ένας θερμοστάτης: αισθητήρας, ελεγκτής, ενεργοποιητής. Ρύθμισέ τον ώστε το δωμάτιο να μείνει άνετο.',
    icon: '🌡️',
  },
  vision: {
    title: 'Πειράματα με την κάμερα',
    chapter: 'vision',
    page: 'lab.html#vision',
    summary:
      'Τρία πειράματα με την κάμερα: πρόσωπο, χέρια, στάση σώματος. Όλα εκτελούνται στη συσκευή σου.',
    icon: '👁️',
  },
  lbs: {
    title: 'Πού βρίσκομαι;',
    chapter: 'lbs',
    page: 'lab-lbs.html',
    summary:
      'Εντόπισε μια θέση με τριπλευρισμό από δορυφόρους και βρες τη συντομότερη διαδρομή στο μουσείο.',
    icon: '🛰️',
  },
  nlp: {
    title: 'Μίλα με την Aria',
    chapter: 'nlp',
    page: 'lab-nlp.html',
    summary:
      'Ένα chatbot που δείχνει πώς «διαβάζει»: λέξεις-κλειδιά, πρόθεση και συναίσθημα κάθε μηνύματος.',
    icon: '💬',
  },
  smarthome: {
    title: 'Προγραμμάτισε το σπίτι',
    chapter: 'smart-house',
    page: 'lab-smarthome.html',
    summary:
      'Φτιάξε κανόνες «αν… τότε…» και δες ένα σπίτι να αντιδρά σε όσα συμβαίνουν μέσα σε μια μέρα.',
    icon: '🏠',
  },
  smartcar: {
    title: 'Αυτόνομο φρενάρισμα',
    chapter: 'smart-car',
    page: 'lab-smartcar.html',
    summary:
      'Ρύθμισε αισθητήρες και χρόνο αντίδρασης και δες πότε ένα αυτοκίνητο προλαβαίνει να σταματήσει.',
    icon: '🚗',
  },
  wearables: {
    title: 'Το έξυπνο μπλουζάκι',
    chapter: 'smart-clothes',
    page: 'lab-wearables.html',
    summary:
      'Ένα ρούχο με αισθητήρες καταγράφει σφυγμό και κίνηση. Διάλεξε τι μοιράζεσαι και με ποιον.',
    icon: '👕',
  },
  future: {
    title: 'Ψήφισε το μέλλον',
    chapter: 'trends',
    page: 'lab-future.html',
    summary:
      'Οκτώ τάσεις του τρίτου κύματος. Ζύγισε οφέλη και κινδύνους και δες πώς ψήφισαν όσοι πέρασαν από εδώ.',
    icon: '🔮',
  },
};

export const visionExperiments = [
  { id: 'face', title: 'Τα σημεία ενός προσώπου', page: 'face_recognition.html', icon: '🙂' },
  { id: 'hands', title: 'Χέρια και χειρονομίες', page: 'hand_gestures.html', icon: '✋' },
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
    text: 'Ολοκλήρωσες τρία εργαστήρια.',
    test: (s) => Object.keys(s.labs).length >= 3,
  },
  {
    id: 'lab-master',
    icon: '🏆',
    title: 'Μάστορας του εργαστηρίου',
    text: 'Ολοκλήρωσες όλα τα εργαστήρια.',
    test: (s) => Object.keys(labs).every((id) => s.labs[id]),
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
    text: 'Ψήφισες σε δύο δημοσκοπήσεις.',
    test: (s) => Object.keys(s.polls).length >= 2,
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
  { id: 'hands-on', label: 'Να το δοκιμάσω', text: 'Πρώτα τα εργαστήρια, μετά η θεωρία.' },
];
