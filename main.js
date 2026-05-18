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

  /* ── Cluster expand/collapse ──────────── */
  const validTargets = new Set(['talk', 'learn', 'explore']);

  const updateAria = () => {
    const active = body.dataset.active || null;
    document.querySelectorAll('[data-go]').forEach((tile) => {
      const target = tile.getAttribute('data-go');
      const isOpen = target === active;
      tile.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.querySelectorAll('.panel').forEach((panel) => {
      const isOpen = panel.id === `panel-${active}`;
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });
  };

  const applyActive = (next) => {
    if (next && !validTargets.has(next)) next = null;
    if (next) body.dataset.active = next;
    else delete body.dataset.active;
    updateAria();
  };

  const readHash = () => {
    const h = location.hash.slice(1);
    return validTargets.has(h) ? h : null;
  };

  const open = (target) => {
    if (!validTargets.has(target)) return;
    const current = body.dataset.active || null;
    if (current === target) return;
    if (current) {
      // Swapping tiles – don't grow the back stack
      history.replaceState(null, '', `#${target}`);
      applyActive(target);
    } else {
      // Opening from home – push a new entry so back gesture lands here
      location.hash = target;
    }
  };

  const close = () => {
    if (!body.dataset.active) return;
    if (location.hash) {
      // We pushed this entry on open; pop it so back gesture parity is preserved
      history.back();
    } else {
      applyActive(null);
    }
  };

  document.addEventListener('click', (e) => {
    const goTrigger = e.target.closest('[data-go]');
    const backTrigger = e.target.closest('[data-back]');

    if (goTrigger) {
      e.preventDefault();
      const target = goTrigger.getAttribute('data-go');
      const current = body.dataset.active || null;
      if (current === target) close();
      else open(target);
      return;
    }

    if (backTrigger) {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.dataset.active) close();
  });

  window.addEventListener('hashchange', () => applyActive(readHash()));

  /* ── Intro: lift the gate after choreography finishes ── */
  const initialTarget = readHash();
  if (initialTarget) {
    // Deep link – skip intro, just show the panel
    body.classList.remove('has-intro');
    applyActive(initialTarget);
  } else if (body.classList.contains('has-intro')) {
    window.setTimeout(() => body.classList.remove('has-intro'), 1500);
  }

  /* ── Card flip (inside Learn panel) ───── */
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
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // don't bubble to the tile button
        setFlipped(!flip.classList.contains('is-flipped'));
      });
    });
  });

  /* ── Talk panel: Call/Text dual toggle ── */
  document.querySelectorAll('[data-toggle-dual]').forEach((el) => {
    const setOpen = (open) => {
      el.classList.toggle('is-open', open);
      el.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    el.addEventListener('click', (e) => {
      if (e.target.closest('.popout-btn')) return;
      setOpen(!el.classList.contains('is-open'));
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(!el.classList.contains('is-open'));
      } else if (e.key === 'Escape' && el.classList.contains('is-open')) {
        e.stopPropagation();
        setOpen(false);
      }
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

  updateAria();
})();
