/* ============================================================
   Vidhya's Portfolio — script.js
   Futuristic Glassmorphic Portfolio · Vanilla JS · No Frameworks
   ============================================================ */

/* ── Shared helper ──────────────────────────────────────────── */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ──────────────────────────────────────────────────────────────
   1. Splash Sequence & Portal Bloom Glide
   ────────────────────────────────────────────────────────────── */
(async function splashSequence() {
  const splash = document.getElementById('splash');
  const splashLogo = document.getElementById('splashLogo');
  const navLogo = document.getElementById('navLogo');
  const bgMesh = document.getElementById('bgMesh');

  if (!splash) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fast path — reduced motion only (plays on every refresh/load) */
  if (isReducedMotion) {
    splash.classList.add('hidden');
    document.body.classList.remove('is-loading');
    if (navLogo) navLogo.style.opacity = '1';
    
    // Immediately reveal hero elements
    const heroReveals = document.querySelectorAll('.hero-reveal');
    heroReveals.forEach((el) => el.classList.add('visible'));
    if (bgMesh) bgMesh.classList.add('active');
    return;
  }

  /* 0.0 s — dark screen already visible */
  await wait(300);

  /* 0.3 s — logo materializes (scales + de-blurs in CSS) */
  if (splashLogo) splashLogo.classList.add('visible');
  
  /* 0.5 s to 1.45 s — sweep animation runs automatically in CSS */
  /* Wait at center while neon pulsing */
  await wait(1300); // Wait until 1.6s total elapsed time

  /* 1.6 s — portal bloom + logo glide + hero reveal starts */
  if (splash) splash.classList.add('bloom');
  if (bgMesh) bgMesh.classList.add('active');

  // Staggered reveal of hero text/buttons
  const heroReveals = document.querySelectorAll('.hero-reveal');
  heroReveals.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, index * 120);
  });

  // Calculate and execute logo glide to navbar slot
  if (splashLogo && navLogo) {
    splashLogo.classList.add('glide');
    
    const rectNav = navLogo.getBoundingClientRect();
    const rectSplash = splashLogo.getBoundingClientRect();

    const dx = rectNav.left + rectNav.width / 2 - (rectSplash.left + rectSplash.width / 2);
    const dy = rectNav.top + rectNav.height / 2 - (rectSplash.top + rectSplash.height / 2);
    const scale = rectNav.width / rectSplash.width;

    splashLogo.style.transformOrigin = 'center center';
    splashLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    splashLogo.style.opacity = '0'; // fades out as it lands
  }

  await wait(800); // wait for 0.8s glide to complete

  /* 2.4 s — hide preloader, show navbar logo, unlock scrolling */
  splash.classList.add('hidden');
  document.body.classList.remove('is-loading');
  if (navLogo) navLogo.style.opacity = '1';
})();

/* ──────────────────────────────────────────────────────────────
   3. Custom Cursor with Glow
   ────────────────────────────────────────────────────────────── */
(function customCursor() {
  if (window.innerWidth < 768) return;

  const dot = document.getElementById('cursorDot');
  const glow = document.getElementById('cursorGlow');
  if (!dot || !glow) return;

  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;
  const LERP = 0.15;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Dot follows instantly */
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  /* Glow follows with lerp via rAF */
  function animateGlow() {
    glowX += (mouseX - glowX) * LERP;
    glowY += (mouseY - glowY) * LERP;

    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';

    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);

  /* Magnetic pull — cursor-hover class */
  const interactiveSelector = 'a, button, .glass-card, .skill-tile, .social-orb';

  document.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
})();

/* ──────────────────────────────────────────────────────────────
   4. Mouse Parallax on Hero Background
   ────────────────────────────────────────────────────────────── */
(function heroParallax() {
  const bgMesh = document.getElementById('bgMesh');
  if (!bgMesh) return;

  let heroInView = true;
  let rafPending = false;
  let dx = 0;
  let dy = 0;

  /* Track hero visibility */
  const heroSection =
    document.getElementById('hero') ||
    document.querySelector('.hero-section') ||
    (bgMesh && bgMesh.closest('section'));

  if (heroSection) {
    const heroObs = new IntersectionObserver(
      ([entry]) => {
        heroInView = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    heroObs.observe(heroSection);
  }

  document.addEventListener('mousemove', (e) => {
    if (!heroInView) return;

    dx = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        bgMesh.style.transform = `translate(${-dx * 20}px, ${-dy * 20}px)`;
        rafPending = false;
      });
    }
  });
})();

/* ──────────────────────────────────────────────────────────────
   5. Typewriter Role Rotator
   ────────────────────────────────────────────────────────────── */
(function roleRotatorTypewriter() {
  const el = document.getElementById('roleRotator');
  if (!el) return;

  const roles = [
    'Web Developer',
    'Frontend Designer',
    'Java Developer',
    'Java Full Stack Developer'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100; // ms per character typing
  let deletingSpeed = 50; // ms per character deleting
  let pauseDuration = 2000; // pause time when word is fully typed

  function type() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      // Deleting character
      el.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        // Small delay before typing the next word
        setTimeout(type, 300);
        return;
      }

      setTimeout(type, deletingSpeed);
    } else {
      // Typing character
      el.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;

      if (charIdx === currentRole.length) {
        isDeleting = true;
        // Pause at the end of the word
        setTimeout(type, pauseDuration);
        return;
      }

      setTimeout(type, typingSpeed);
    }
  }

  // Clear fallback text and start typing sequence
  el.textContent = '';
  type();
})();

/* ──────────────────────────────────────────────────────────────
   6. Count-Up Animation for Stats
   ────────────────────────────────────────────────────────────── */
(function countUpStats() {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (!statNums.length) return;

  /* easeOutQuart: t → 1 - (1 - t)^4 */
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const DURATION = 1500; /* ms */

  function animateCount(el) {
    const isDecimal = el.dataset.target.includes('.');
    const target = isDecimal ? parseFloat(el.dataset.target) : parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const easeVal = easeOutQuart(progress) * target;
      const value = isDecimal ? easeVal.toFixed(1) : Math.round(easeVal);

      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = el.dataset.target; /* ensure exact final value */
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        /* Find .stat-num inside the card (or the entry target itself) */
        const nums = entry.target.classList.contains('stat-num')
          ? [entry.target]
          : entry.target.querySelectorAll('.stat-num[data-target]');

        nums.forEach((num) => {
          if (num.classList.contains('stat-inf')) return; /* skip ∞ */
          animateCount(num);
        });

        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  /* Observe the card containers (.stat-card) when available, else the nums */
  const cards = document.querySelectorAll('.stat-card');
  if (cards.length) {
    cards.forEach((card) => observer.observe(card));
  } else {
    statNums.forEach((num) => {
      if (!num.classList.contains('stat-inf')) observer.observe(num);
    });
  }
})();

/* ──────────────────────────────────────────────────────────────
   7. Experience Timeline Accordion
   ────────────────────────────────────────────────────────────── */
(function experienceTimeline() {
  const heads = document.querySelectorAll('.timeline-head');
  if (!heads.length) return;

  heads.forEach((head) => {
    head.addEventListener('click', () => {
      const parentItem = head.closest('.timeline-item');
      if (!parentItem) return;

      const allItems = document.querySelectorAll('.timeline-item');
      allItems.forEach((item) => {
        if (item !== parentItem) item.classList.remove('active');
      });

      parentItem.classList.toggle('active');
    });
  });
})();

/* ──────────────────────────────────────────────────────────────
   8. 3D Tilt on Featured Project Cards
   ────────────────────────────────────────────────────────────── */
(function tiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  const MAX_DEG = 8;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; /* mouse pos inside card */
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      /* Normalize to -1…1, then clamp to MAX_DEG */
      const dx = ((x - cx) / cx) * MAX_DEG;
      const dy = ((y - cy) / cy) * MAX_DEG;

      card.style.transform = `perspective(1000px) rotateX(${-dy}deg) rotateY(${dx}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
})();

/* ──────────────────────────────────────────────────────────────
   9. Scroll Reveal (IntersectionObserver)
   ────────────────────────────────────────────────────────────── */
(function scrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
})();

/* ──────────────────────────────────────────────────────────────
   10. Nav Scroll-Spy + Shrink + Hamburger
   ────────────────────────────────────────────────────────────── */
(function navBehaviour() {
  /* ── Nav shrink ── */
  const navbar = document.getElementById('navbar');

  if (navbar) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      },
      { passive: true }
    );
  }

  /* ── Scroll-spy ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');

          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === '#' + id
            );
          });
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px', /* triggers when section is ~top third */
        threshold: 0,
      }
    );

    sections.forEach((sec) => spyObserver.observe(sec));
  }

  /* ── Hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('navLinks');

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinksContainer.classList.toggle('open');
    });

    /* Close menu on link click */
    navLinksContainer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinksContainer.classList.remove('open');
      });
    });
  }
})();

/* ──────────────────────────────────────────────────────────────
   11. Skill Tile Hover Glow
   ────────────────────────────────────────────────────────────── */
(function skillTileGlow() {
  const tiles = document.querySelectorAll('.skill-tile[data-color]');
  if (!tiles.length) return;

  tiles.forEach((tile) => {
    tile.addEventListener('mouseenter', () => {
      const c = tile.dataset.color;
      if (!c) return;

      tile.style.borderColor = c + '60';
      tile.style.boxShadow = `0 4px 20px ${c}33`;
    });

    tile.addEventListener('mouseleave', () => {
      tile.style.borderColor = '';
      tile.style.boxShadow = '';
    });
  });
})();

/* ──────────────────────────────────────────────────────────────
   12. Supabase Time-on-Site Tracker
   ────────────────────────────────────────────────────────────── */
(function initSupabaseTracker() {
  const SUPABASE_URL = 'https://lshwujpisqwvgleunlum.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaHd1anBpc3F3dmdsZXVubHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzczMTUsImV4cCI6MjA5NzcxMzMxNX0.iq0yWMuXApPcmovwBdjfIplI9j9qNJs7ItmpYchENNk';
  
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return;

  const startTime = Date.now();
  
  function sendVisitData() {
    const duration = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
    const endpoint = `${SUPABASE_URL}/rest/v1/page_visits?apikey=${SUPABASE_ANON_KEY}`;
    
    const payload = JSON.stringify({
      duration_seconds: duration,
      path: window.location.pathname,
      user_agent: navigator.userAgent
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendVisitData();
    }
  });

  window.addEventListener('pagehide', sendVisitData);
})();
