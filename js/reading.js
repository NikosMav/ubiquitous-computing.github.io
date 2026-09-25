// Reading page: highlight the current chapter in the side navigation and record visits.
import { markVisited } from './progress.js';
import { chapters } from './catalog.js';

const links = new Map(
  [...document.querySelectorAll('.chapter-nav a[href^="#"]')].map((a) => [a.hash.slice(1), a]),
);
const byAnchor = new Map(chapters.map((c) => [c.reading.split('#')[1], c.id]));
const timers = new Map();

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        if (links.has(id))
          links.forEach((link, key) =>
            key === id
              ? link.setAttribute('aria-current', 'true')
              : link.removeAttribute('aria-current'),
          );
        // Count a chapter once the reader has stayed with it for a few seconds.
        if (byAnchor.has(id) && !timers.has(id))
          timers.set(
            id,
            setTimeout(() => markVisited(byAnchor.get(id)), 4000),
          );
      } else if (timers.has(id)) {
        clearTimeout(timers.get(id));
        timers.delete(id);
      }
    }
  },
  { rootMargin: '-35% 0px -55% 0px' },
);
document
  .querySelectorAll('.reading-chapter[id], .reading-chapter h3[id]')
  .forEach((node) => observer.observe(node));
