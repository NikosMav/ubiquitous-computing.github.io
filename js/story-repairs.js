(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('#motion-toggle');
  let requestedCompact = false,
    ixData,
    wasCompact = false;
  function refresh() {
    window.ScrollTrigger?.refresh();
    window.dispatchEvent(new Event('story:layout'));
  }
  function mode() {
    const compact = media.matches || requestedCompact;
    document.documentElement.classList.toggle('story-compact', compact);
    motion.setAttribute('aria-pressed', String(compact));
    motion.hidden = media.matches;
    try {
      const ix = window.Webflow?.require('ix2');
      const data = ix?.store?.getState().ixData;
      if (!ixData && data)
        ixData = {
          events: data.events,
          actionLists: data.actionLists,
          site: { mediaQueries: data.mediaQueries },
        };
      if (compact) ix?.destroy();
      else if (wasCompact && ixData) ix?.init(ixData);
      wasCompact = compact;
    } catch {
      /* Reading/links still work if the animation runtime is unavailable. */
    }
    if (compact) document.querySelectorAll('video').forEach((video) => video.pause());
    window.dispatchEvent(new Event('story:mode'));
    refresh();
  }
  window.Webflow ||= [];
  window.Webflow.push(mode);
  media.addEventListener('change', mode);
  motion.addEventListener('click', () => {
    requestedCompact = !requestedCompact;
    mode();
  });

  document.querySelectorAll('[data-story-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      const id = button.dataset.storyToggle;
      const panel = document.getElementById(id);
      const open = button.dataset.storyOpen === 'true';
      panel.style.display = open ? 'block' : 'none';
      document.querySelectorAll(`[data-story-toggle="${id}"]`).forEach((control) => {
        control.setAttribute('aria-expanded', String(open));
        control.style.display =
          (control.dataset.storyOpen === 'true') === open ? 'none' : 'inline-block';
      });
      const controls = [...document.querySelectorAll(`[data-story-toggle="${id}"]`)];
      const visible = (control) =>
        control.style.display !== 'none' && control.getClientRects().length;
      const visibleControl =
        controls.find(
          (control) => control.parentElement === button.parentElement && visible(control),
        ) || controls.find(visible);
      visibleControl?.focus({ preventScroll: true });
      window.dispatchEvent(new Event('resize'));
      refresh();
    }),
  );
  // Prevent old icon/disclosure anchors from jumping to the top of the document.
  document
    .querySelectorAll('a[href="#"]')
    .forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
  window.addEventListener('load', refresh, { once: true });
  // Late media/font loading must not leave the pinned scenes with stale measurements.
  document.fonts?.ready.then(refresh);
  document
    .querySelectorAll('.cta_img-photo')
    .forEach((img) => img.addEventListener('load', refresh, { once: true }));
})();
