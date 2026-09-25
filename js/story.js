// Story controller: live breadcrumb, progress tracking and in-place labs.
import { markVisited, markTheory, completeLab } from './progress.js';
import { chapters, labs } from './catalog.js';

const crumbs = document.querySelector('[data-uc-crumbs]');
const sections = [...document.querySelectorAll('[data-section-name]')];
const wave1 = chapters.filter((chapter) => chapter.group === 'wave1');

// ---------- Breadcrumb ----------
// The thesis' breadcrumb: a fixed trail, top-left, updated in real time while scrolling,
// where every level is a link back to the start of that section.
function readingLine() {
  const bar = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--uc-offset'),
  );
  return (bar || 64) + (innerHeight - (bar || 64)) * 0.3;
}
function activeChain() {
  const line = readingLine();
  let deepest = null;
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    if (rect.height && rect.top <= line && rect.bottom > line) deepest = section;
  }
  const chain = [];
  for (let node = deepest; node; node = node.parentElement?.closest('[data-section-name]'))
    chain.unshift(node);
  return chain;
}
let lastKey = null;
function renderCrumbs() {
  if (!crumbs) return;
  const chain = activeChain();
  const key = chain.map((node) => sections.indexOf(node)).join('/');
  if (key === lastKey) return;
  lastKey = key;
  crumbs.replaceChildren();
  if (!chain.length) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'uc-crumbs__empty';
    span.textContent = scrollY < innerHeight * 0.5 ? 'Κύλισε για να ξεκινήσεις' : 'Αφετηρία';
    li.append(span);
    crumbs.append(li);
    return;
  }
  chain.forEach((node, index) => {
    const li = document.createElement('li');
    const last = index === chain.length - 1;
    const link = document.createElement('a');
    link.href = '#' + ensureId(node);
    link.textContent = node.dataset.sectionName;
    if (last) link.setAttribute('aria-current', 'location');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', link.hash);
    });
    li.append(link);
    crumbs.append(li);
  });
  // On phones the trail scrolls horizontally; keep the current level visible.
  crumbs.parentElement.scrollLeft = crumbs.parentElement.scrollWidth;
}
let uid = 0;
function ensureId(node) {
  if (!node.id) node.id = 'section-' + ++uid;
  return node.id;
}
let queued = false;
addEventListener(
  'scroll',
  () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      renderCrumbs();
    });
  },
  { passive: true },
);
addEventListener('resize', () => {
  lastKey = null;
  renderCrumbs();
});
addEventListener('story:layout', () => {
  lastKey = null;
  renderCrumbs();
});
renderCrumbs();

// ---------- Visits ----------
// A chapter counts as visited once its container crosses the middle of the screen.
const watched = new Map();
const watch = (selector, id) => {
  const element = document.querySelector(selector);
  if (element) watched.set(element, id);
};
watch('#istoria', 'history');
watch('#dy', 'idea');
for (const chapter of wave1) {
  const anchor = document.querySelector(chapter.story.slice(chapter.story.indexOf('#')));
  const container = anchor?.closest('[data-section-name]') ?? anchor;
  if (container) watched.set(container, chapter.id);
}
watch('[data-section-name="01. Έξυπνο Σπίτι"]', 'smart-house');
watch('[data-section-name="02. Έξυπνο Αυτοκίνητο"]', 'smart-car');
watch('[data-section-name="03. Έξυπνα Ρούχα"]', 'smart-clothes');
watch('.story-scenario-end', 'scenario');
watch('#future-trends', 'trends');

const visitObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = watched.get(entry.target);
      // Require a real pause, not a fast fling past the chapter.
      entry.target._ucTimer ??= setTimeout(() => {
        markVisited(id);
        visitObserver.unobserve(entry.target);
      }, 1200);
    }
    for (const entry of entries)
      if (!entry.isIntersecting && entry.target._ucTimer) {
        clearTimeout(entry.target._ucTimer);
        entry.target._ucTimer = undefined;
      }
  },
  { rootMargin: '-45% 0px -45% 0px' },
);
watched.forEach((_, element) => visitObserver.observe(element));

// ---------- Theory and application panels ----------
async function mountLab(host, labId) {
  if (host.dataset.mounted) return;
  host.dataset.mounted = 'true';
  try {
    const module = await import(`./labs/${labId}.js`);
    module.mount(host, {
      embedded: true,
      onComplete: () => completeLab(labId),
    });
  } catch (error) {
    host.dataset.mounted = '';
    host.textContent = 'Το εργαστήριο δεν φορτώθηκε. ';
    const link = document.createElement('a');
    link.href = labs[labId].page;
    link.textContent = 'Άνοιξέ το σε ξεχωριστή σελίδα.';
    host.append(link);
    console.error(error);
  }
  dispatchEvent(new Event('story:layout'));
  window.ScrollTrigger?.refresh();
}

addEventListener('story:toggle', ({ detail }) => {
  if (!detail.open) return;
  const match = /^story-(theory|app)-(\d)$/.exec(detail.id);
  if (!match) return;
  const chapter = wave1[Number(match[2])];
  if (match[1] === 'theory') markTheory(chapter.id);
  else {
    const host = detail.panel.querySelector('[data-uc-lab]');
    if (host) mountLab(host, host.dataset.ucLab);
  }
});

// Wave-two and future labs sit directly in the page; mount them when they come near.
const nearObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries)
      if (entry.isIntersecting) {
        nearObserver.unobserve(entry.target);
        mountLab(entry.target, entry.target.dataset.ucLab);
      }
  },
  { rootMargin: '600px 0px' },
);
document
  .querySelectorAll('[data-uc-lab][data-uc-autoload]')
  .forEach((host) => nearObserver.observe(host));
