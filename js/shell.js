// Shared page chrome: menu, reading progress, XP chip and achievement toasts.
import { getState, levelFor } from './progress.js';

const bar = document.querySelector('[data-uc-bar]');
const menu = bar?.querySelector('.uc-menu');
const nav = bar?.querySelector('.uc-nav');

function setMenu(open) {
  if (!menu) return;
  bar.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('.uc-menu__label').textContent = open ? 'Κλείσιμο' : 'Μενού';
}
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && bar?.classList.contains('is-open')) {
    setMenu(false);
    menu.focus();
  }
});
document.addEventListener('click', (event) => {
  if (bar?.classList.contains('is-open') && !bar.contains(event.target)) setMenu(false);
});

// Keep the anchor offset in step with the real bar height (it grows on phones).
function measure() {
  if (!bar) return;
  document.documentElement.style.setProperty('--uc-offset', bar.offsetHeight + 'px');
}
measure();
new ResizeObserver(measure).observe(bar ?? document.body);

// Reading progress across the whole document.
const fill = bar?.querySelector('.uc-progress span');
let ticking = false;
function progress() {
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  fill?.style.setProperty('--uc-progress', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
}
addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(progress);
    }
  },
  { passive: true },
);
addEventListener('resize', progress);
progress();

// XP chip in the "Η διαδρομή μου" link.
function renderXp(state = getState()) {
  for (const chip of document.querySelectorAll('[data-uc-xp]')) {
    chip.hidden = state.xp === 0;
    chip.textContent = `${state.xp} XP`;
    chip.title = levelFor(state.xp).title;
  }
}
renderXp();

// Toasts announce points, new badges and level-ups without stealing focus.
let region;
function toastRegion() {
  if (!region) {
    region = document.createElement('div');
    region.className = 'uc-toasts';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  return region;
}
export function toast({ icon, kicker, title, text, variant = '' }) {
  const node = document.createElement('div');
  node.className = 'uc-toast' + (variant ? ' uc-toast--' + variant : '');
  const iconNode = document.createElement('span');
  iconNode.className = 'uc-toast__icon';
  iconNode.setAttribute('aria-hidden', 'true');
  iconNode.textContent = icon;
  const body = document.createElement('div');
  if (kicker) {
    const k = document.createElement('span');
    k.className = 'uc-toast__kicker';
    k.textContent = kicker;
    body.append(k);
  }
  const t = document.createElement('strong');
  t.className = 'uc-toast__title';
  t.textContent = title;
  body.append(t);
  if (text) {
    const p = document.createElement('span');
    p.className = 'uc-toast__text';
    p.textContent = text;
    body.append(p);
  }
  node.append(iconNode, body);
  toastRegion().append(node);
  if (variant === 'xp') return;
  setTimeout(() => {
    node.classList.add('is-leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
  }, 5200);
}

// Points arriving close together add up in one toast instead of stacking.
let xpNode = null;
let xpTotal = 0;
let xpTimer = 0;
function xpToast(amount) {
  if (xpNode?.isConnected && !xpNode.classList.contains('is-leaving')) {
    xpTotal += amount;
    xpNode.querySelector('.uc-toast__icon').textContent = `+${xpTotal}`;
  } else {
    xpTotal = amount;
    toast({ icon: `+${amount}`, title: 'XP', text: 'Πόντοι εμπειρίας', variant: 'xp' });
    xpNode = region.lastElementChild;
  }
  clearTimeout(xpTimer);
  const node = xpNode;
  xpTimer = setTimeout(() => {
    node?.classList.add('is-leaving');
    node?.addEventListener('animationend', () => node.remove(), { once: true });
  }, 2600);
}

addEventListener('uc:progress', ({ detail }) => {
  renderXp(detail.state);
  for (const event of detail.events) {
    if (event.type === 'xp') xpToast(event.amount);
    if (event.type === 'badge')
      toast({
        icon: event.badge.icon,
        kicker: 'Νέο σήμα',
        title: event.badge.title,
        text: event.badge.text,
      });
    if (event.type === 'level')
      toast({
        icon: '⭐',
        kicker: 'Νέο επίπεδο',
        title: event.level.title,
        text: 'Δες την πρόοδό σου στη «Διαδρομή μου».',
      });
  }
});
