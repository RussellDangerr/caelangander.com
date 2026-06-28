(() => {
  const body = document.body;
  const navVerb = document.querySelector('.nav-verb');

  /* Theme follows the device (prefers-color-scheme); no manual toggle. */

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
      // inert keeps tab focus from landing inside collapsed panels (WCAG)
      if (isOpen) panel.removeAttribute('inert');
      else panel.setAttribute('inert', '');
    });
  };

  const applyActive = (next) => {
    if (next && !validTargets.has(next)) next = null;
    if (next) body.dataset.active = next;
    else delete body.dataset.active;
    if (navVerb) navVerb.textContent = next ? next[0].toUpperCase() + next.slice(1) : '';
    updateAria();
  };

  const readPath = () => {
    const p = location.pathname.slice(1).replace(/\/$/, '');
    return validTargets.has(p) ? p : null;
  };

  const open = (target) => {
    if (!validTargets.has(target)) return;
    const current = body.dataset.active || null;
    if (current === target) return;
    if (current) {
      // Swapping tiles – don't grow the back stack
      history.replaceState(null, '', `/${target}`);
      applyActive(target);
    } else {
      // Opening from home – push a new entry so back gesture lands here
      history.pushState(null, '', `/${target}`);
      applyActive(target);
    }
  };

  const close = () => {
    if (!body.dataset.active) return;
    if (location.pathname !== '/') {
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

  window.addEventListener('popstate', () => applyActive(readPath()));

  /* ── Intro: lift the gate after choreography finishes ── */
  const initialTarget = readPath();
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

  /* ── Case-study cards: expand/collapse the deep dive ── */
  document.querySelectorAll('[data-expand]').forEach((btn) => {
    const card = btn.closest('.case-card');
    const detail = document.getElementById(btn.getAttribute('aria-controls'));
    if (!card || !detail) return;

    const setOpen = (open) => {
      card.classList.toggle('is-expanded', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      // inert keeps tab focus out of the collapsed region (WCAG)
      if (open) detail.removeAttribute('inert');
      else detail.setAttribute('inert', '');
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // a real <button>, so Enter/Space already fire click
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
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

  /* ── Cursor-reactive hero glow ────────── */
  // The top-left brand glow drifts gently toward the pointer via the --gx/--gy
  // custom props that position body::before. Runs last so it can never preempt
  // the essential init above; skipped for coarse pointers and reduced-motion,
  // where the resting defaults stand.
  (() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduceMotion.matches) return;

    const root = document.documentElement;
    let gx = 12, gy = -6;   // current (damped) centre, %
    let tx = 12, ty = -6;   // target centre, %
    let raf = 0;

    const step = () => {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      root.style.setProperty('--gx', gx.toFixed(2) + '%');
      root.style.setProperty('--gy', gy.toFixed(2) + '%');
      raf = (Math.abs(tx - gx) > 0.05 || Math.abs(ty - gy) > 0.05)
        ? requestAnimationFrame(step)
        : 0;
    };

    window.addEventListener('pointermove', (e) => {
      if (document.body.dataset.active) return;   // hero-only effect — idle while a panel is open
      // Keep the drift subtle — a small range around the resting centre.
      tx = 12 + ((e.clientX / window.innerWidth) - 0.5) * 22;
      ty = -6 + ((e.clientY / window.innerHeight) - 0.5) * 14;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  })();
})();
