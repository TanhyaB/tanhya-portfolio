/**
 * Tanhya Bascombe — UX Designer Portfolio
 * script.js v3
 *
 * Initialises all interactive behaviour:
 *  1. Nav shadow on scroll
 *  2. Hamburger / mobile nav
 *  3. Smooth scroll with nav offset
 *  4. Scroll-triggered fade-in animations (IntersectionObserver)
 *  5. Page-load sequential hero fade-in
 *  6. Stat counter animations
 *  7. About page masonry grid
 */

/* ============================================================
   Helpers
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ============================================================
   1. Nav shadow on scroll
   ============================================================ */
function initNavShadow() {
  const nav = $('#nav');
  if (!nav) return;

  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


/* ============================================================
   2. Hamburger / mobile navigation
   ============================================================ */
function initHamburger() {
  const btn   = $('#hamburger');
  const links = $('#nav-links');
  if (!btn || !links) return;

  function open() {
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    links.classList.add('is-open');
  }

  function close() {
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  }

  btn.addEventListener('click', () => {
    btn.classList.contains('is-open') ? close() : open();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.classList.contains('is-open')) {
      close();
      btn.focus();
    }
  });

  return close;
}


/* ============================================================
   3. Smooth scroll with nav offset
   ============================================================ */
function initSmoothScroll(closeMobileNav) {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (typeof closeMobileNav === 'function') closeMobileNav();
  });
}


/* ============================================================
   4. Scroll-triggered fade-in animations
   ============================================================ */
function initScrollAnimations() {
  const elements = $$('.animate-on-scroll');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:   0.1,
      rootMargin: '0px 0px -28px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   5. Page-load sequential hero fade-in
   ============================================================
   Selects direct children of .hero-text (or .cs-hero-container)
   and staggers a CSS animation class so they fade in one by one
   on page load.
   ============================================================ */
function initPageLoadAnimations() {
  // Homepage hero text children
  const heroText = $('.hero-text');
  if (heroText) {
    const kids = $$('.hero-label, .hero-heading, .hero-tagline, .hero-ctas', heroText);
    kids.forEach((el, i) => {
      el.classList.add('load-in');
      el.style.animationDelay = `${i * 0.14}s`;
    });
  }

  // Case study hero
  const csHero = $('.cs-hero-container');
  if (csHero) {
    const kids = $$('.section-eyebrow, .cs-hero-heading, .cs-hero-subtitle, .cs-meta', csHero);
    kids.forEach((el, i) => {
      el.classList.add('load-in');
      el.style.animationDelay = `${i * 0.13}s`;
    });
  }

  // Password page card
  const pwCard = $('.password-card');
  if (pwCard) {
    pwCard.classList.add('load-in');
  }
}


/* ============================================================
   6. Stat counter animations
   ============================================================
   Animates stat-number elements when they scroll into view.
   Detects a leading integer or decimal; animates it while
   preserving any trailing suffix (e.g. " months", "+").
   ============================================================ */
function initCounters() {
  const statNums = $$('.stat-number');
  if (!statNums.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animateCounter(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  statNums.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const raw = el.textContent.trim();
  // Match a leading number (digits, commas, dots)
  const match = raw.match(/^([0-9][0-9,\.]*)/);
  if (!match) return; // e.g. purely textual stat — skip

  const numStr = match[1].replace(/,/g, '');
  const target = parseFloat(numStr);
  if (isNaN(target) || target === 0) return;

  // Everything after the leading number is the suffix
  const suffix = raw.slice(match[0].length);
  const isInteger = Number.isInteger(target);
  const duration  = 1200;
  let startTime   = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = isInteger
      ? Math.round(eased * target)
      : parseFloat((eased * target).toFixed(1));

    el.textContent = isInteger
      ? current.toLocaleString() + suffix
      : current + suffix;

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}


/* ============================================================
   7. Masonry grid (about.html photo gallery)
   ============================================================ */
function initMasonryGrid() {
  const grid = $('.about-pg-masonry');
  if (!grid) return;

  function spanItem(img) {
    const styles    = window.getComputedStyle(grid);
    const rowHeight = parseInt(styles.getPropertyValue('grid-auto-rows'),  10) || 1;
    const rowGap    = parseInt(styles.getPropertyValue('row-gap'), 10)         || 0;
    const height    = img.getBoundingClientRect().height;
    if (!height) return;
    const span = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    img.style.gridRowEnd = `span ${span}`;
  }

  function spanAll() {
    grid.querySelectorAll('.about-pg-masonry-img').forEach(spanItem);
  }

  grid.querySelectorAll('.about-pg-masonry-img').forEach(img => {
    if (img.complete && img.naturalHeight > 0) {
      spanItem(img);
    } else {
      img.addEventListener('load', () => spanItem(img));
    }
  });

  window.addEventListener('resize', spanAll, { passive: true });
}


/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavShadow();

  const closeMobileNav = initHamburger();
  initSmoothScroll(closeMobileNav);
  initScrollAnimations();
  initPageLoadAnimations();
  initCounters();
  initMasonryGrid();
});
