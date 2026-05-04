/* ============================================================
   ODU ACTIVE — PRICING.JS
   Hidden pricing page — currency toggle + price updates
   Built by Nesture
   ============================================================ */

'use strict';

const PKG_SUFFIX = {
  single:        '',
  monthly:       ' / month',
  'two-month':   ' / 2 months',
  'three-month': ' / 3 months',
  'six-month':   ' / 6 months',
  diet:          '',
  consultation:  ''
};

function updatePricingPrices() {
  document.querySelectorAll('[data-pkg-price]').forEach(el => {
    const pkg    = el.dataset.pkgPrice;
    const suffix = PKG_SUFFIX[pkg] || '';
    if (!pkg) return;
    if (pkg === 'consultation') { el.textContent = 'Complimentary'; return; }
    el.textContent = CURRENCY.getPrice(pkg, suffix);
  });

  document.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === CURRENCY.current);
  });
}

function buildCurrencyToggle() {
  if (document.getElementById('currencyToggle')) return;

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

document.addEventListener('currencyChange', updatePricingPrices);

buildCurrencyToggle();
updatePricingPrices();
