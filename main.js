(() => {
  const root = document.documentElement;
  const body = document.body;

  /* ── Theme toggle ─────────────────────── */
  const toggle = document.querySelector('.theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);

  toggle?.addEventListener('click', () => {
    const isDark =
      root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ── View switcher ────────────────────── */
  const panels = {
    home:  document.querySelector('[data-view-panel="home"]'),
    learn: document.querySelector('[data-view-panel="learn"]'),
    talk:  document.querySelector('[data-view-panel="talk"]'),
  };

  const setView = (next) => {
    if (!panels[next]) return;
    const current = body.dataset.view;
    if (current === next) return;

    // Make all panels visible during the transition so the leaving one can animate out
    Object.values(panels).forEach((p) => p.removeAttribute('hidden'));

    body.dataset.view = next;

    // After the transition ends, re-hide the inactive panels for SR / tab order hygiene
    window.setTimeout(() => {
      Object.entries(panels).forEach(([name, p]) => {
        if (name !== next) p.setAttribute('hidden', '');
      });
      const heading = panels[next].querySelector('.view-heading, .banner-name');
      heading?.focus?.({ preventScroll: true });
    }, 520);
  };

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-go]');
    if (!trigger) return;
    const target = trigger.getAttribute('data-go');
    if (!target || !panels[target]) return;
    e.preventDefault();
    setView(target);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.dataset.view !== 'home') {
      setView('home');
    }
  });

  /* ── First-load intro: remove gate after choreography finishes ── */
  if (body.classList.contains('has-intro')) {
    window.setTimeout(() => body.classList.remove('has-intro'), 1500);
  }

  /* ── Card flip (Learn view) ───────────── */
  document.querySelectorAll('[data-flip]').forEach((flip) => {
    const front = flip.querySelector('.card-face--front');
    const back  = flip.querySelector('.card-face--back');
    const buttons = flip.querySelectorAll('.card-spin');

    const setFlipped = (flipped) => {
      flip.classList.toggle('is-flipped', flipped);
      front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
      back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
      buttons.forEach((btn) => {
        const onFront = !!btn.closest('.card-face--front');
        btn.setAttribute('aria-pressed', flipped ? 'true' : 'false');
        btn.tabIndex = flipped === onFront ? -1 : 0;
      });
      const focusTarget = flipped ? back.querySelector('.card-spin') : front.querySelector('.card-spin');
      focusTarget?.focus({ preventScroll: true });
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setFlipped(!flip.classList.contains('is-flipped'));
      });
    });
  });

  /* ── Footer clock + year ──────────────── */
  const clock = document.getElementById('clock');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const tick = () => {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };
  tick();
  window.setInterval(tick, 30000);
})();
