// Small toolkit shared by every lab: DOM helpers, a mission checklist and controls.

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === false || value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs))
    if (value != null) node.setAttribute(key, value);
  for (const child of children.flat()) if (child) node.append(child);
  return node;
}

let uid = 0;
export const nextId = (prefix) => `${prefix}-${++uid}`;

/**
 * Builds the lab frame: title, the question it explores, a mission list and a body slot.
 * Missions are guided challenges; completing them all finishes the lab.
 */
export function frame(host, { icon, kicker, title, intro, missions, onComplete, embedded }) {
  const done = new Set();
  const items = new Map();
  const list = h('ol', { class: 'lab-missions__list' });
  for (const mission of missions) {
    const item = h(
      'li',
      { class: 'lab-mission' },
      h('span', { class: 'lab-mission__check', 'aria-hidden': 'true' }),
      h('span', { class: 'lab-mission__text' }, mission.text),
    );
    items.set(mission.id, item);
    list.append(item);
  }
  const counter = h('span', { class: 'lab-missions__count' }, `0 / ${missions.length}`);
  const banner = h('div', { class: 'lab-complete', hidden: true, role: 'status' });
  const live = h('p', { class: 'lab-sr', 'aria-live': 'polite' });
  const body = h('div', { class: 'lab-body' });
  const root = h(
    'section',
    { class: 'lab' + (embedded ? ' lab--embedded' : ''), 'aria-label': title },
    h(
      'header',
      { class: 'lab-head' },
      h('span', { class: 'lab-head__icon', 'aria-hidden': 'true' }, icon),
      h(
        'div',
        {},
        h('p', { class: 'lab-head__kicker' }, kicker ?? 'Εργαστήριο'),
        h(embedded ? 'h4' : 'h2', { class: 'lab-head__title' }, title),
        intro && h('p', { class: 'lab-head__intro' }, intro),
      ),
    ),
    h(
      'div',
      { class: 'lab-grid' },
      body,
      h(
        'aside',
        { class: 'lab-missions' },
        h('p', { class: 'lab-missions__title' }, 'Αποστολές ', counter),
        list,
        banner,
      ),
    ),
    live,
  );
  host.replaceChildren(root);

  function complete(id, note) {
    if (done.has(id) || !items.has(id)) return;
    done.add(id);
    const item = items.get(id);
    item.classList.add('is-done');
    if (note) item.append(h('span', { class: 'lab-mission__note' }, note));
    counter.textContent = `${done.size} / ${missions.length}`;
    live.textContent = 'Ολοκληρώθηκε: ' + missions.find((m) => m.id === id).text;
    if (done.size === missions.length) {
      banner.hidden = false;
      banner.replaceChildren(
        h('strong', {}, 'Όλες οι αποστολές ολοκληρώθηκαν!'),
        h('span', {}, 'Το εργαστήριο προστέθηκε στη διαδρομή σου.'),
      );
      onComplete?.();
    }
  }
  return {
    root,
    body,
    complete,
    isDone: (id) => done.has(id),
    say: (text) => (live.textContent = text),
  };
}

export function segmented(label, options, value, onChange) {
  const name = nextId('seg');
  const group = h('div', { class: 'lab-seg', role: 'radiogroup', 'aria-label': label });
  for (const option of options) {
    const input = h('input', {
      type: 'radio',
      name,
      value: option.value,
      id: `${name}-${option.value}`,
      checked: option.value === value,
    });
    input.addEventListener('change', () => onChange(option.value));
    group.append(input, h('label', { for: input.id }, option.label));
  }
  return h('div', { class: 'lab-field' }, h('span', { class: 'lab-field__label' }, label), group);
}

export function slider({ label, min, max, step = 1, value, format = (v) => v, onInput }) {
  const id = nextId('range');
  const output = h('output', { for: id, class: 'lab-field__value' }, format(value));
  const input = h('input', { type: 'range', id, min, max, step, value, class: 'lab-range' });
  input.addEventListener('input', () => {
    output.textContent = format(Number(input.value));
    onInput(Number(input.value));
  });
  const field = h(
    'div',
    { class: 'lab-field' },
    h('label', { class: 'lab-field__label', for: id }, label, output),
    input,
  );
  field.input = input;
  field.set = (v) => {
    input.value = v;
    output.textContent = format(v);
  };
  return field;
}

export function toggle(label, checked, onChange) {
  const id = nextId('toggle');
  const input = h('input', { type: 'checkbox', id, class: 'lab-switch__input', checked });
  input.addEventListener('change', () => onChange(input.checked));
  const field = h(
    'label',
    { class: 'lab-switch', for: id },
    input,
    h('span', { class: 'lab-switch__track', 'aria-hidden': 'true' }),
    h('span', {}, label),
  );
  field.input = input;
  return field;
}

export function button(label, onClick, variant = '') {
  return h(
    'button',
    { type: 'button', class: 'lab-btn' + (variant ? ' lab-btn--' + variant : ''), onClick },
    label,
  );
}

export function meter(label, value, max, tone = '') {
  const fill = h('span', { class: 'lab-meter__fill' + (tone ? ' is-' + tone : '') });
  const text = h('span', { class: 'lab-meter__value' });
  const node = h(
    'div',
    {
      class: 'lab-meter',
      role: 'meter',
      'aria-label': label,
      'aria-valuemin': 0,
      'aria-valuemax': max,
    },
    h('span', { class: 'lab-meter__label' }, label),
    h('span', { class: 'lab-meter__track' }, fill),
    text,
  );
  node.set = (v, shown = v, newTone) => {
    fill.style.width = Math.max(0, Math.min(100, (v / max) * 100)) + '%';
    text.textContent = shown;
    node.setAttribute('aria-valuenow', v);
    if (newTone !== undefined)
      fill.className = 'lab-meter__fill' + (newTone ? ' is-' + newTone : '');
  };
  node.set(value);
  return node;
}

// A canvas that stays sharp on high-density screens and tracks its CSS size.
export function stage(className, draw) {
  const canvas = h('canvas', { class: className });
  const context = canvas.getContext('2d');
  let width = 0,
    height = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, devicePixelRatio || 1);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(context, width, height);
  }
  new ResizeObserver(resize).observe(canvas);
  return {
    canvas,
    redraw: () => width && draw(context, width, height),
    size: () => ({ width, height }),
  };
}

// Runs a frame loop only while the element is on screen and the tab is visible.
export function loop(element, tick) {
  let raf = 0,
    last = 0,
    visible = false;
  const frameFn = (time) => {
    const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
    last = time;
    tick(dt, time);
    raf = requestAnimationFrame(frameFn);
  };
  const start = () => {
    if (!raf && visible && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(frameFn);
    }
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(element);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  return { start, stop };
}

export const css = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const fmt = new Intl.NumberFormat('el-GR', { maximumFractionDigits: 1 });
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
