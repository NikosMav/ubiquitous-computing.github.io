// Cloud familiarity poll. Votes are tallied per station (this device), like a kiosk in
// the museum, and shown as a pie chart with the visitor's own choice highlighted.
(() => {
  const form = document.getElementById('pollForm');
  if (!form) return;
  const KEY = 'uc-station-poll-cloud-v1';
  const labels = {
    Very_Familiar: 'Εξπέρ των Νεφών',
    Somewhat_Familiar: 'Έμπειρος στο Cloud',
    Not_Sure: 'Έτσι και έτσι',
    Not_Very_Familiar: 'Νέος στο Cloud',
    Not_Familiar_at_All: 'Συννεφιασμένη Κυριακή',
  };
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? {};
    } catch {
      return {};
    }
  };
  const write = (tally) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(tally));
    } catch {
      /* Storage unavailable: the chart still shows this visit. */
    }
  };

  form.querySelectorAll('input[type="radio"]').forEach((radio) =>
    radio.addEventListener('change', () => {
      document.getElementById('submitBtn').disabled = false;
      form
        .querySelectorAll('label')
        .forEach((label) =>
          label.classList.toggle('selected-option', label.getAttribute('for') === radio.value),
        );
    }),
  );

  let chart;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const choice = new FormData(form).get('vote');
    if (!choice) return;
    const tally = read();
    tally[choice] = (tally[choice] ?? 0) + 1;
    write(tally);
    import('./progress.js').then((progress) => progress.vote('cloud-familiarity', choice));

    const keys = Object.keys(labels);
    const total = keys.reduce((sum, key) => sum + (tally[key] ?? 0), 0);
    form.style.display = 'none';
    const message = document.getElementById('message');
    message.style.display = 'block';
    message.textContent = `Ευχαριστούμε! Ψήφοι σε αυτόν τον σταθμό: ${total}. Η δική σου επιλογή φαίνεται με πορτοκαλί.`;
    document.getElementById('results').style.display = 'block';

    const palette = ['#2b36a8', '#4150f0', '#7482ff', '#a9b1ff', '#d7dbff'];
    chart?.destroy();
    chart = new Chart(document.getElementById('chart').getContext('2d'), {
      type: 'pie',
      data: {
        labels: keys.map((key) => labels[key]),
        datasets: [
          {
            data: keys.map((key) => tally[key] ?? 0),
            backgroundColor: keys.map((key, i) => (key === choice ? '#fbb454' : palette[i])),
            borderColor: '#10122e',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#ffffff' } },
          title: { display: true, text: 'Οι ψήφοι αυτού του σταθμού', color: '#ffffff' },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.label}: ${context.parsed} (${Math.round((context.parsed / total) * 100)}%)`,
            },
          },
        },
      },
    });
  });
})();
