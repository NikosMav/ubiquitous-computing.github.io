export function sampleQuestions(bank, count, random = Math.random) {
  const shuffled = [...bank];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function learningRoute(score, total) {
  const ratio = score / total;
  if (ratio >= 7 / 8)
    return {
      title: 'Ξεκίνα με τις εφαρμογές',
      href: 'reading.html#mobile-fp',
      description: 'Έχεις μια καλή αφετηρία. Εξερεύνησε τις τεχνολογίες και δοκίμασε τα πειράματα.',
    };
  if (ratio > 4 / 8)
    return {
      title: 'Ξεκίνα με τη βασική ιδέα',
      href: 'reading.html#principles',
      description:
        'Δες το όραμα του Mark Weiser και τις αρχές σχεδιασμού, πριν περάσεις στις εφαρμογές.',
    };
  return {
    title: 'Ξεκίνα από την ιστορία',
    href: 'reading.html#history',
    description: 'Δες πώς φτάσαμε από τις πρώτες μηχανές στην τεχνολογία που μας περιβάλλει.',
  };
}

export function validateBank(bank) {
  if (
    !Array.isArray(bank) ||
    bank.length === 0 ||
    bank.some(
      (q) =>
        typeof q.question !== 'string' ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        new Set(q.options).size !== q.options.length ||
        !q.options.includes(q.answer ?? q.correctAnswer),
    )
  ) {
    throw new Error('Invalid question bank');
  }
  return bank;
}

// Maps a diagnostic score to the three routes of the original presentation.
export function levelFor(score, total) {
  const ratio = score / total;
  return ratio >= 7 / 8 ? 'advanced' : ratio >= 5 / 8 ? 'moderate' : 'newbie';
}
