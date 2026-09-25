(() => {
  const target = document.querySelector('.typed-text');
  if (!target) return;
  const text = '02. Ασύρματη Επικοινωνία';
  let typed;
  function update() {
    typed?.destroy();
    typed = undefined;
    target.textContent = text;
    if (!document.documentElement.classList.contains('story-compact')) {
      typed = new Typed(target, {
        strings: [text],
        typeSpeed: 75,
        backSpeed: 25,
        loop: true,
        showCursor: false,
        backDelay: 1000,
        startDelay: 1000,
      });
    }
  }
  update();
  window.addEventListener('story:mode', update);
})();
