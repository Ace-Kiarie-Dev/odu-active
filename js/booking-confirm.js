/* ============================================================
   ODU ACTIVE — BOOKING-CONFIRM.JS  (Step 3 of 3)
   Reads URL params, populates summary + payment details,
   fires WhatsApp link
   Currency-aware (USD ↔ KES via currency.js)
   Built by Nesture
   ============================================================ */

'use strict';

const PKG_LABELS = {
  monthly:       'Monthly Package',
  single:        'Single Session',
  diet:          'Diet Coaching',
  consultation:  'Consultation',
  'two-month':   '2-Month Program',
  'three-month': '3-Month Program',
  'six-month':   '6-Month Program'
};

const PKG_SUFFIX = {
  monthly:       ' / month',
  single:        '',
  diet:          '',
  consultation:  '',
  'two-month':   ' / 2 months',
  'three-month': ' / 3 months',
  'six-month':   ' / 6 months'
};

function getPkgPrice(pkg) {
  if (pkg === 'consultation') return 'Complimentary';
  return CURRENCY.getPrice(pkg, PKG_SUFFIX[pkg] || '');
}

const params      = new URLSearchParams(window.location.search);
const pkg         = params.get('package') || '';
const dateLabel   = params.get('date')    || '';
const timeSlot    = params.get('time')    || '';
const sessionType = params.get('type')    || 'online';
const waUrl       = params.get('wa')      || 'https://wa.me/254725242721';

// Restore currency if passed through
const urlCurrency = params.get('currency');
if (urlCurrency === 'KES' && CURRENCY.current !== 'KES') {
  CURRENCY.current = 'KES';
}

// Populate summary
const confPkg   = document.getElementById('confPkg');
const confType  = document.getElementById('confType');
const confDate  = document.getElementById('confDate');
const confTime  = document.getElementById('confTime');
const confPrice = document.getElementById('confPrice');
const waBtn     = document.getElementById('waBtn');

if (confPkg)   confPkg.textContent   = PKG_LABELS[pkg] || pkg;
if (confType)  confType.textContent  = sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
if (confDate)  confDate.textContent  = dateLabel;
if (confTime)  confTime.textContent  = timeSlot;
if (confPrice) confPrice.textContent = getPkgPrice(pkg);
if (waBtn)     waBtn.href            = waUrl;

// Currency toggle
function buildCurrencyToggle() {
  if (document.getElementById('currencyToggle')) return;
  const toggle = document.createElement('div');
  toggle.className = 'currency-toggle';
  toggle.id = 'currencyToggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Currency selector');
  toggle.innerHTML = `
    <span class="currency-toggle__label">Price in</span>
    <button class="currency-toggle__btn${CURRENCY.current === 'USD' ? ' active' : ''}" data-currency="USD">USD</button>
    <button class="currency-toggle__btn${CURRENCY.current === 'KES' ? ' active' : ''}" data-currency="KES">KES</button>
  `;
  toggle.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.currency !== CURRENCY.current) CURRENCY.toggle();
    });
  });
  document.body.appendChild(toggle);
}

document.addEventListener('currencyChange', () => {
  if (confPrice) confPrice.textContent = getPkgPrice(pkg);
  document.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === CURRENCY.current);
  });
});

buildCurrencyToggle();

// Auto-open WhatsApp after short delay
if (waUrl && waUrl !== '#') {
  setTimeout(() => window.open(waUrl, '_blank'), 1200);
}
