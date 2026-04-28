/* ============================================================
   ODU ACTIVE — PROGRAMS.JS
   Monthly package In-Person / Online tab switcher
   + Currency toggle (USD ↔ KES)
   Built by Nesture
   ============================================================ */

'use strict';

// ── FORMAT TABS ───────────────────────────────────────────
const formatTabs   = document.querySelectorAll('.pkg-format-tab');
const formatPanels = document.querySelectorAll('.pkg-format-panel');

formatTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Each format tab belongs to a parent pkg-section
    const section = tab.closest('.pkg-section');
    if (!section) return;

    const format = tab.dataset.format;

    // Deactivate all tabs/panels within this section only
    section.querySelectorAll('.pkg-format-tab').forEach(t => t.classList.remove('active'));
    section.querySelectorAll('.pkg-format-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');

    // Find the panel by data-format or by ID convention
    const targetPanel = section.querySelector(`[data-format-panel="${format}"]`)
      || section.querySelector(`.pkg-format-panel[id$="-${format}"]`);
    if (targetPanel) targetPanel.classList.add('active');
  });
});

// ── CURRENCY TOGGLE ───────────────────────────────────────

// Price suffixes per package (appended after the amount)
const PKG_SUFFIX = {
  single:        '',
  monthly:       ' / month',
  'two-month':   ' / 2 months',
  'three-month': ' / 3 months',
  'six-month':   ' / 6 months',
  diet:          '',
  consultation:  ''
};

// All [data-pkg] price spans — update them on currency change
function updateProgramPrices() {
  // Update pkg-section price spans (data-pkg attribute)
  document.querySelectorAll('[data-pkg-price]').forEach(el => {
    const pkg    = el.dataset.pkgPrice;
    const suffix = PKG_SUFFIX[pkg] || '';
    if (!pkg || !CURRENCY.USD[pkg] === undefined) return;
    // TBC spans — skip conversion
    if (el.dataset.tbc === 'true') return;
    el.textContent = CURRENCY.getPrice(pkg, suffix);
  });

  // Update footer static price links
  document.querySelectorAll('[data-footer-pkg]').forEach(el => {
    const pkg    = el.dataset.footerPkg;
    const label  = el.dataset.footerLabel || '';
    const suffix = PKG_SUFFIX[pkg] || '';
    if (!pkg) return;
    el.textContent = `${label}${CURRENCY.getPrice(pkg, suffix)}`;
  });

  // Sync toggle button states
  document.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === CURRENCY.current);
  });
}

// ── BUILD TOGGLE ──────────────────────────────────────────
function buildCurrencyToggle() {
  const existing = document.getElementById('currencyToggle');
  if (existing) return; // already built (e.g. injected by another page)

  const toggle = document.createElement('div');
  toggle.className = 'currency-toggle';
  toggle.id = 'currencyToggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Currency selector');
  toggle.innerHTML = `
    <span class="currency-toggle__label">Price in</span>
    <button class="currency-toggle__btn${CURRENCY.current === 'USD' ? ' active' : ''}" data-currency="USD" aria-pressed="${CURRENCY.current === 'USD'}">USD</button>
    <button class="currency-toggle__btn${CURRENCY.current === 'KES' ? ' active' : ''}" data-currency="KES" aria-pressed="${CURRENCY.current === 'KES'}">KES</button>
  `;

  toggle.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.currency !== CURRENCY.current) {
        CURRENCY.toggle();
      }
    });
  });

  document.body.appendChild(toggle);
}

// ── LISTEN FOR CURRENCY CHANGE ────────────────────────────
document.addEventListener('currencyChange', updateProgramPrices);

// ── INIT ──────────────────────────────────────────────────
buildCurrencyToggle();
updateProgramPrices();
