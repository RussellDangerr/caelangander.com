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
      // Swapping tiles – don't grow the back stack; carry the "home sits beneath" flag
      history.replaceState({ cgHome: !!(history.state && history.state.cgHome) }, '', `/${target}`);
      applyActive(target);
    } else {
      // Opening from home – push a flagged entry so back/close can land home again
      history.pushState({ cgHome: true }, '', `/${target}`);
      applyActive(target);
    }
  };

  const close = () => {
    if (!body.dataset.active) return;
    if (history.state && history.state.cgHome) {
      // We pushed this entry from home; pop it so back-gesture parity is preserved
      history.back();
    } else {
      // Deep-loaded (or already at root): show home in place without leaving the site
      if (location.pathname !== '/') history.replaceState(null, '', '/');
      applyActive(null);
    }
  };

  document.addEventListener('click', (e) => {
    // Skip link: move focus without a #main history entry, which would drop
    // the cgHome flag that lets Back return home through history.
    if (e.target.closest('.skip-link')) {
      e.preventDefault();
      const main = document.getElementById('main');
      main.focus({ preventScroll: true });
      main.scrollIntoView();
      return;
    }

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

  /* ── Talk panel: Call/Text disclosure ── */
  document.querySelectorAll('[data-dual]').forEach((el) => {
    const toggle = el.querySelector('[data-dual-toggle]');
    const popout = el.querySelector('.channel-popout');
    if (!toggle || !popout) return;
    const setOpen = (open) => {
      el.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // inert keeps the hidden Call/Text links out of the tab order (WCAG)
      if (open) popout.removeAttribute('inert');
      else popout.setAttribute('inert', '');
    };
    toggle.addEventListener('click', () => setOpen(!el.classList.contains('is-open')));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.classList.contains('is-open')) {
        e.stopPropagation(); // close only the popout; the section stays open
        setOpen(false);
        toggle.focus();
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

  // my clock (Central), not the visitor's
  const tick = () => {
    if (!clock) return;
    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    });
    clock.textContent = `${time} where I am`;
  };
  tick();
  window.setInterval(tick, 30000);

  updateAria();

  /* Hero glow + grain are static now — positioned at the resting --gx/--gy
     defaults in :root, no cursor tracking. The atmosphere paints once and
     never repaints on mouse move (a fully compositor-free, zero-cost surface). */
})();
