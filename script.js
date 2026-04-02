/**
 * Tanhya Bascombe — UX Designer Portfolio
 * JavaScript v2
 *
 * This file handles all interactive behaviour:
 *  1. Nav shadow — adds a subtle shadow when the page is scrolled
 *  2. Hamburger menu — opens / closes the mobile nav
 *  3. Smooth scroll — intercepts anchor clicks and scrolls with
 *     nav-height offset so the sticky bar doesn't overlap content
 *  4. Scroll animations — fades + slides elements in as they
 *     enter the viewport using IntersectionObserver
 */


/* ============================================================
   Helpers
   ============================================================ */

/** Query selector shorthand */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ============================================================
   1. Nav shadow on scroll
   ============================================================
   The nav bar looks flat until the user scrolls past 10px.
   A `.scrolled` class is then toggled, which CSS uses to
   add a box-shadow (see .nav-wrapper.scrolled in style.css).
   ============================================================ */
function initNavShadow() {
  const nav = $('#nav');
  if (!nav) return;

  function update() {
    // Toggle class based on scroll position
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }

  // Listen for scroll events (passive = no performance cost)
  window.addEventListener('scroll', update, { passive: true });

  // Run once immediately in case the page loads mid-scroll
  update();
}


/* ============================================================
   2. Hamburger / mobile navigation
   ============================================================
   On screens ≤ 720px the nav links collapse. The hamburger
   button toggles the `.is-open` class on both itself and the
   nav list, which CSS animates via max-height.
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

  // Toggle on button click
  btn.addEventListener('click', () => {
    btn.classList.contains('is-open') ? close() : open();
  });

  // Close when pressing ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.classList.contains('is-open')) {
      close();
      btn.focus(); // return focus to the trigger
    }
  });

  // Expose close so smooth-scroll can call it after navigation
  return close;
}


/* ============================================================
   3. Smooth scroll with nav offset
   ============================================================
   `scroll-behavior: smooth` in CSS handles most cases, but
   this JS version also:
   - Closes the mobile menu after clicking a link
   - Accounts for the sticky nav height via scroll-margin-top
     (already set in CSS) — the scrollIntoView call respects it
   ============================================================ */
function initSmoothScroll(closeMobileNav) {
  document.addEventListener('click', (e) => {
    // Find the closest anchor link that starts with '#'
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return; // ignore bare '#'

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    // CSS scroll-margin-top on section[id] handles the offset
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Close mobile nav (if open) after navigation
    if (typeof closeMobileNav === 'function') closeMobileNav();
  });
}


/* ============================================================
   4. Scroll-triggered fade-in / slide-up animations
   ============================================================
   Every element with the class `.animate-on-scroll` starts
   invisible (opacity 0, translateY 32px — set in CSS).

   An IntersectionObserver watches each element. When 12% of it
   enters the viewport, `.is-visible` is added, which triggers
   the CSS transition to opacity 1 / translateY 0.

   Once visible, the element is unobserved — no need to repeat.
   ============================================================ */
function initScrollAnimations() {
  const elements = $$('.animate-on-scroll');
  if (!elements.length) return;

  // Fallback: if browser doesn't support IntersectionObserver,
  // just show everything immediately
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // stop watching once shown
        }
      });
    },
    {
      threshold:   0.12,               // trigger when 12% is visible
      rootMargin: '0px 0px -32px 0px', // slight bottom pull for a nicer feel
    }
  );

  elements.forEach(el => observer.observe(el));
}


/* ============================================================
   Init — wire everything up after the DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavShadow();

  // initHamburger returns the close function so smooth-scroll
  // can close the menu after a link is tapped on mobile
  const closeMobileNav = initHamburger();

  initSmoothScroll(closeMobileNav);
  initScrollAnimations();
});
