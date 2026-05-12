(() => {
  const toggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;

  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);

  toggle.addEventListener('click', () => {
    const isDark =
      root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // Scroll reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Footer clock
  const clock = document.getElementById('clock');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function tick() {
    if (!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }

  tick();
  setInterval(tick, 30000);

  // Card flip — bottom panel rotates around vertical axis
  document.querySelectorAll('[data-flip]').forEach((flip) => {
    const front = flip.querySelector('.card-face--front');
    const back = flip.querySelector('.card-face--back');
    const buttons = flip.querySelectorAll('.card-spin');

    const setState = (flipped) => {
      flip.classList.toggle('is-flipped', flipped);
      front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
      back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
      buttons.forEach((btn) => {
        const onFront = btn.closest('.card-face--front');
        btn.setAttribute('aria-pressed', flipped ? 'true' : 'false');
        btn.tabIndex = flipped === !!onFront ? -1 : 0;
      });
      const focusTarget = flipped ? back.querySelector('.card-spin') : front.querySelector('.card-spin');
      focusTarget?.focus({ preventScroll: true });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setState(!flip.classList.contains('is-flipped'));
      });
    });
  });

})();
