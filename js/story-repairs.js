(() => {
  function refresh() {
    window.ScrollTrigger?.refresh();
    window.dispatchEvent(new Event('story:layout'));
  }

  // Theory / application disclosures in each first-wave chapter.
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
      window.dispatchEvent(new CustomEvent('story:toggle', { detail: { id, open, panel } }));
      window.dispatchEvent(new Event('resize'));
      refresh();
    }),
  );
  // "περισσότερα" on the computing eras opens the explanation in a dialog.
  document.querySelectorAll('[data-era-toggle]').forEach((toggle) => {
    const dialog = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      dialog.showModal();
    });
    dialog.querySelector('.story-era__close').addEventListener('click', () => dialog.close());
    // A click on the dimmed backdrop closes it too.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
  // Links acting as buttons also respond to the space bar.
  document.querySelectorAll('a[role="button"]').forEach((toggle) =>
    toggle.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
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
