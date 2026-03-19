/* ============================================================
   ODU ACTIVE — CORE.JS
   Global init, scroll reveal, shared utilities
   Built by Nesture
   ============================================================ */

'use strict';

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── ACTIVE NAV LINK ───────────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar__links a, .navbar__mobile a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// ── NAVBAR SCROLL BEHAVIOR ────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.background = 'rgba(8,8,8,0.98)';
    } else {
      navbar.style.background = 'rgba(8,8,8,0.92)';
    }
  }, { passive: true });
}
