// Lab: location-based systems. Part one: find a receiver from its distances to three
// satellites (trilateration). Part two: plan the shortest tour through the museum.
import { h, svg, frame, toggle, button, stage, fmt } from './kit.js';

const sats = [
  { x: 14, y: 12, name: 'Δ1', color: '#7482ff' },
  { x: 88, y: 16, name: 'Δ2', color: '#5fe0b0' },
  { x: 52, y: 58, name: 'Δ3', color: '#ff7a8a' },
];

// The planned museum's six thematic sections (thesis, chapter 2) around a central atrium.
export const rooms = {
  E: { x: 50, y: 92, name: 'Είσοδος' },
  A: { x: 50, y: 52, name: 'Αίθριο' },
  C: { x: 50, y: 12, name: 'Καφέ' },
  1: { x: 14, y: 76, name: '1. Μαθηματικός υπολογιστής' },
  2: { x: 14, y: 44, name: '2. Επιχειρηματικός υπολογιστής' },
  3: { x: 14, y: 12, name: '3. Οικιακός υπολογιστής' },
  4: { x: 86, y: 12, name: '4. Δικτυακός υπολογιστής' },
  5: { x: 86, y: 44, name: '5. Δημιουργικός υπολογιστής' },
  6: { x: 86, y: 76, name: '6. Διάχυτος υπολογιστής' },
};
const edges = [
  ['E', '1'],
  ['E', '6'],
  ['E', 'A'],
  ['1', '2'],
  ['2', '3'],
  ['3', 'C'],
  ['C', '4'],
  ['4', '5'],
  ['5', '6'],
  ['A', '2'],
  ['A', '5'],
  ['A', 'C'],
];
const dist = (a, b) => Math.hypot(rooms[a].x - rooms[b].x, rooms[a].y - rooms[b].y);

// Dijkstra over a tiny graph.
export function shortest(from, to) {
  const d = Object.fromEntries(Object.keys(rooms).map((k) => [k, Infinity]));
  const prev = {};
  const open = new Set(Object.keys(rooms));
  d[from] = 0;
  while (open.size) {
    const u = [...open].reduce((a, b) => (d[a] < d[b] ? a : b));
    open.delete(u);
    for (const [a, b] of edges) {
      const v = a === u ? b : b === u ? a : null;
      if (!v || !open.has(v)) continue;
      const alt = d[u] + dist(u, v);
      if (alt < d[v]) {
        d[v] = alt;
        prev[v] = u;
      }
    }
  }
  const path = [to];
  while (path[0] !== from) path.unshift(prev[path[0]]);
  return { length: d[to], path };
}
export function tour(order) {
  const stops = ['E', ...order, 'E'];
  let length = 0;
  const path = ['E'];
  for (let i = 1; i < stops.length; i++) {
    const leg = shortest(stops[i - 1], stops[i]);
    length += leg.length;
    path.push(...leg.path.slice(1));
  }
  return { length, path };
}
const permutations = (list) =>
  list.length <= 1
    ? [list]
    : list.flatMap((x, i) =>
        permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((p) => [x, ...p]),
      );
export const bestTour = (targets) =>
  Math.min(...permutations(targets).map((order) => tour(order).length));

export function mount(host, { embedded, onComplete } = {}) {
  const lab = frame(host, {
    icon: '🛰️',
    title: 'Πού βρίσκομαι;',
    intro:
      'Ένας δέκτης GPS δεν «βλέπει» τη θέση του: μετρά πόσο χρόνο κάνει το σήμα κάθε δορυφόρου να φτάσει, το μετατρέπει σε απόσταση και βρίσκει το σημείο όπου συναντώνται οι κύκλοι.',
    missions: [
      { id: 'locate', text: 'Βρες τη θέση του δέκτη με τρεις δορυφόρους.' },
      {
        id: 'clock',
        text: 'Πρόσθεσε σφάλμα ρολογιού και δες γιατί χρειάζεται τέταρτος δορυφόρος.',
      },
      { id: 'route', text: 'Σχεδίασε τη συντομότερη διαδρομή για τρία εκθέματα του μουσείου.' },
    ],
    embedded,
    onComplete,
  });

  // ---------- Trilateration ----------
  const active = new Set();
  let receiver;
  let guess = null;
  let clockError = false;
  const newReceiver = () => {
    receiver = { x: 25 + Math.random() * 50, y: 22 + Math.random() * 28 };
    guess = null;
  };
  newReceiver();
  const range = (sat) => Math.hypot(sat.x - receiver.x, sat.y - receiver.y) + (clockError ? 7 : 0);

  const view = stage('lab-canvas', draw);
  const status = h(
    'p',
    { class: 'lab-callout', role: 'status' },
    'Ενεργοποίησε τους δορυφόρους έναν έναν και παρατήρησε πώς στενεύουν οι πιθανές θέσεις.',
  );
  function draw(ctx, w, hgt) {
    ctx.clearRect(0, 0, w, hgt);
    const sx = w / 100;
    const sy = hgt / 70;
    const scale = Math.min(sx, sy);
    const X = (x) => x * sx;
    const Y = (y) => y * sy;
    ctx.strokeStyle = 'rgba(196,200,234,0.07)';
    for (let gx = 0; gx <= 100; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(X(gx), 0);
      ctx.lineTo(X(gx), hgt);
      ctx.stroke();
    }
    for (let gy = 0; gy <= 70; gy += 10) {
      ctx.beginPath();
      ctx.moveTo(0, Y(gy));
      ctx.lineTo(w, Y(gy));
      ctx.stroke();
    }
    for (const sat of sats) {
      const on = active.has(sat.name);
      if (on) {
        ctx.strokeStyle = sat.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(X(sat.x), Y(sat.y), range(sat) * sx, range(sat) * sy, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      ctx.font = `${Math.max(20, 3.2 * scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.globalAlpha = on ? 1 : 0.4;
      ctx.fillText('🛰️', X(sat.x), Y(sat.y) + 8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = sat.color;
      ctx.font = '12px "UC Nasalization", sans-serif';
      ctx.fillText(sat.name, X(sat.x), Y(sat.y) + 28);
    }
    if (guess) {
      ctx.fillStyle = '#fbb454';
      ctx.beginPath();
      ctx.arc(X(guess.x), Y(guess.y), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.fillText('📍', X(receiver.x), Y(receiver.y) + 7);
    }
  }
  view.canvas.setAttribute('role', 'img');
  view.canvas.setAttribute(
    'aria-label',
    'Χάρτης με δορυφόρους και κύκλους απόστασης. Πάτησε πάνω του για να δηλώσεις τη θέση που υπολογίζεις.',
  );
  view.canvas.addEventListener('pointerdown', (event) => {
    const rect = view.canvas.getBoundingClientRect();
    guess = {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 70,
    };
    const error = Math.hypot(guess.x - receiver.x, guess.y - receiver.y);
    const km = fmt.format(error * 0.4);
    if (active.size < 3) {
      status.className = 'lab-callout is-bad';
      status.textContent = `Με ${active.size} δορυφόρους υπάρχουν ${active.size === 2 ? 'δύο πιθανά σημεία' : 'άπειρα πιθανά σημεία'}. Το πραγματικό απείχε ${km} km.`;
    } else if (clockError) {
      status.className = 'lab-callout';
      status.textContent = `Οι κύκλοι δεν συναντώνται σε ένα σημείο, άρα η εκτίμηση απέχει ${km} km. Ένας τέταρτος δορυφόρος επιτρέπει στον δέκτη να υπολογίσει και το σφάλμα του ρολογιού του.`;
      lab.complete('clock');
    } else if (error < 5) {
      status.className = 'lab-callout is-good';
      status.textContent = `Εύστοχα! Μόλις ${km} km από τη θέση του δέκτη. Αυτό είναι ο τριπλευρισμός.`;
      lab.complete('locate');
    } else {
      status.className = 'lab-callout is-bad';
      status.textContent = `Απέχεις ${km} km. Ψάξε το σημείο όπου τέμνονται και οι τρεις κύκλοι.`;
    }
    view.redraw();
  });
  const satButtons = sats.map((sat) =>
    h(
      'button',
      {
        type: 'button',
        class: 'lab-chip',
        'aria-pressed': 'false',
        onClick: (event) => {
          if (active.has(sat.name)) active.delete(sat.name);
          else active.add(sat.name);
          event.currentTarget.setAttribute('aria-pressed', String(active.has(sat.name)));
          view.redraw();
        },
      },
      `Σήμα από ${sat.name}`,
    ),
  );
  const clockToggle = toggle('Σφάλμα ρολογιού δέκτη', false, (v) => {
    clockError = v;
    view.redraw();
    if (v && active.size === 3)
      status.textContent =
        'Όλες οι αποστάσεις μεγάλωσαν κατά το ίδιο λάθος. Πάτησε στον χάρτη όπου νομίζεις ότι είσαι.';
  });

  // ---------- Museum route ----------
  const exhibits = ['1', '2', '3', '4', '5', '6'];
  let targets = [];
  let order = [];
  const map = svg('svg', {
    viewBox: '0 0 100 104',
    class: 'lab-map',
    role: 'group',
    'aria-label': 'Κάτοψη μουσείου',
  });
  const routeLine = svg('polyline', {
    fill: 'none',
    stroke: '#fbb454',
    'stroke-width': '1.6',
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round',
  });
  const routeNote = h('p', { class: 'lab-callout', role: 'status' });
  const roomButtons = {};
  for (const [a, b] of edges)
    map.append(
      svg('line', {
        x1: rooms[a].x,
        y1: rooms[a].y,
        x2: rooms[b].x,
        y2: rooms[b].y,
        stroke: 'rgba(196,200,234,0.25)',
        'stroke-width': '0.8',
      }),
    );
  map.append(routeLine);
  for (const [id, room] of Object.entries(rooms)) {
    const big = exhibits.includes(id);
    const group = svg('g', {
      class: 'lab-map__room',
      'data-room': id,
      tabindex: big ? '0' : null,
      role: big ? 'button' : null,
    });
    group.append(
      svg('circle', {
        cx: room.x,
        cy: room.y,
        r: big ? 6 : 4,
        fill: '#20245a',
        stroke: '#7482ff',
        'stroke-width': '0.8',
      }),
      svg('text', {
        x: room.x,
        y: room.y + (big ? 2 : 1.5),
        'text-anchor': 'middle',
        'font-size': big ? '5' : '3.2',
        fill: '#fff',
      }),
      svg('text', {
        x: room.x,
        y: room.y + (room.y > 60 ? 11 : -8.5),
        'text-anchor': 'middle',
        'font-size': '3.1',
        fill: '#c4c8ea',
      }),
    );
    group.children[1].textContent = big ? id : id === 'E' ? '⌂' : id === 'C' ? '☕' : '◇';
    group.children[2].textContent = room.name.replace(/^\d\. /, '');
    if (big) {
      group.setAttribute('aria-label', room.name);
      const pick = () => choose(id);
      group.addEventListener('click', pick);
      group.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          pick();
        }
      });
      group.style.cursor = 'pointer';
    }
    roomButtons[id] = group;
    map.append(group);
  }
  function paint() {
    for (const [id, group] of Object.entries(roomButtons)) {
      const circle = group.querySelector('circle');
      const isTarget = targets.includes(id);
      const index = order.indexOf(id);
      circle.setAttribute('fill', index >= 0 ? '#fbb454' : isTarget ? '#4150f0' : '#20245a');
      circle.setAttribute('stroke', isTarget ? '#ffd460' : '#7482ff');
      if (isTarget) group.setAttribute('aria-pressed', String(index >= 0));
      else group.removeAttribute('aria-pressed');
    }
  }
  function newTour() {
    targets = [...exhibits]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .sort();
    order = [];
    routeLine.setAttribute('points', '');
    routeNote.className = 'lab-callout';
    routeNote.textContent = `Ξεκινάς από την είσοδο και θέλεις να δεις τις ενότητες ${targets.join(', ')} (μπλε) πριν επιστρέψεις. Πάτησέ τες με τη σειρά που προτιμάς.`;
    paint();
  }
  function choose(id) {
    if (!targets.includes(id) || order.includes(id)) return;
    order.push(id);
    paint();
    if (order.length < 3) {
      const partial = tour(order).path.slice(0, -1);
      routeLine.setAttribute('points', partial.map((k) => `${rooms[k].x},${rooms[k].y}`).join(' '));
      return;
    }
    const result = tour(order);
    routeLine.setAttribute(
      'points',
      result.path.map((k) => `${rooms[k].x},${rooms[k].y}`).join(' '),
    );
    const best = bestTour(targets);
    const meters = (v) => `${Math.round(v * 0.6)} m`;
    if (result.length <= best + 0.5) {
      routeNote.className = 'lab-callout is-good';
      routeNote.textContent = `Βέλτιστη διαδρομή: ${meters(result.length)}. Έτσι σκέφτεται και μια εφαρμογή πλοήγησης, με τον αλγόριθμο του Dijkstra.`;
      lab.complete('route');
    } else {
      routeNote.className = 'lab-callout is-bad';
      routeNote.textContent = `Η διαδρομή σου είναι ${meters(result.length)}, η συντομότερη ${meters(best)}. Δοκίμασε άλλη σειρά.`;
    }
  }
  newTour();

  // ---------- Your real position (optional) ----------
  const geoNote = h(
    'p',
    { class: 'lab-note', role: 'status' },
    'Προαιρετικό: ο browser θα ζητήσει άδεια. Η θέση εμφανίζεται μόνο εδώ και δεν αποστέλλεται πουθενά.',
  );
  const geoButton = button(
    'Δείξε τη δική μου θέση',
    () => {
      if (!navigator.geolocation) {
        geoNote.textContent = 'Αυτός ο browser δεν υποστηρίζει εντοπισμό θέσης.';
        return;
      }
      geoNote.textContent = 'Αναμονή για άδεια…';
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          geoNote.textContent = `Γεωγραφικό πλάτος ${coords.latitude.toFixed(4)}°, μήκος ${coords.longitude.toFixed(4)}°, ακρίβεια ± ${Math.round(coords.accuracy)} m. ${coords.accuracy > 100 ? 'Μεγάλη αβεβαιότητα: πιθανότατα η θέση υπολογίστηκε από δίκτυα Wi-Fi, όχι από δορυφόρους.' : 'Καλή ακρίβεια: πιθανότατα από δορυφόρους GNSS.'}`;
        },
        () =>
          (geoNote.textContent =
            'Η άδεια δεν δόθηκε. Αυτό είναι δικαίωμά σου: οι υπηρεσίες τοποθεσίας πρέπει να ζητούν συναίνεση.'),
        { timeout: 15000 },
      );
    },
    'ghost',
  );

  lab.body.append(
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, '1 · Τριπλευρισμός'),
      h(
        'div',
        { class: 'lab-row', style: { marginBottom: '12px' } },
        satButtons,
        clockToggle,
        button(
          'Νέα θέση',
          () => {
            newReceiver();
            status.className = 'lab-callout';
            status.textContent = 'Νέος δέκτης, κάπου στον χάρτη.';
            view.redraw();
          },
          'ghost',
        ),
      ),
      view.canvas,
      status,
    ),
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, '2 · Η συντομότερη διαδρομή στο μουσείο'),
      map,
      h(
        'div',
        { class: 'lab-row', style: { marginTop: '10px' } },
        button('Νέα επίσκεψη', newTour, 'ghost'),
      ),
      routeNote,
    ),
    h(
      'div',
      { class: 'lab-panel' },
      h('p', { class: 'lab-panel__title' }, '3 · Η θέση σου'),
      h('div', { class: 'lab-row' }, geoButton),
      geoNote,
    ),
  );
}
