/* ============================================================
   ODU ACTIVE — PAYMENT.JS
   Reads URL params, populates order summary, WhatsApp link
   Currency-aware (USD ↔ KES via currency.js)
   Built by Nesture
   ============================================================ */

'use strict';

const WHATSAPP_NUMBER = '254725242721';

const PACKAGES = {
  monthly: {
    label:    'Monthly Package',
    pkg:      'monthly',
    suffix:   ' / month',
    includes: [
      'Diet coaching',
      'Form correction',
      'Detailed progress tracking',
      'Workout strategy and planning',
      'Access to tools and resources',
      '24hr response time',
      'Coaching call'
    ]
  },
  'two-month': {
    label:    '2-Month Program',
    pkg:      'two-month',
    suffix:   ' / 2 months',
    includes: [
      '3 sessions/week — in-person or online (Zoom)',
      'Full 8-week structured programme',
      'Diet coaching aligned to your goals',
      'Weekly progress tracking and reviews',
      'Form correction and technique development',
      '24hr coach access',
      'Coaching call'
    ]
  },
  'three-month': {
    label:    '3-Month Program',
    pkg:      'three-month',
    suffix:   ' / 3 months',
    includes: [
      'Full 12-week structured programme',
      'Diet coaching aligned to training phase',
      'Weekly progress tracking and reviews',
      'Form correction and technique development',
      'Programme adjustments every 4 weeks',
      '24hr coach access',
      'Monthly coaching call'
    ]
  },
  'six-month': {
    label:    '6-Month Program',
    pkg:      'six-month',
    suffix:   ' / 6 months',
    includes: [
      'Full 24-week programme across two phases',
      'Progressive overload and phase periodisation',
      'Comprehensive nutrition and diet coaching',
      'Weekly and monthly progress tracking',
      'Monthly deep-dive review and programme reset',
      '24hr coach access — priority response',
      'Bi-monthly coaching calls',
      'Lifestyle and recovery guidance'
    ]
  },
  diet: {
    label:    'Diet Coaching Session',
    pkg:      'diet',
    suffix:   '',
    includes: [
      'Nutrition aligned to your training and weight goal',
      'Personalised science-based nutrition plan',
      'Written diet plan delivered after session',
      'Macro and habit structure guidance',
      'Follow-up included'
    ]
  }
};

// ── READ URL PARAM ────────────────────────────────────────
const params  = new URLSearchParams(window.location.search);
const pkgKey  = params.get('package') || 'monthly';
const pkgData = PACKAGES[pkgKey] || PACKAGES.monthly;

// Restore currency if passed through booking flow
const urlCurrency = params.get('currency');
if (urlCurrency === 'KES' && CURRENCY.current !== 'KES') {
  CURRENCY.current = 'KES';
}

// ── PRICE HELPER ──────────────────────────────────────────
function getDisplayPrice() {
  return CURRENCY.getPrice(pkgData.pkg, pkgData.suffix || '');
}

// ── POPULATE ORDER SUMMARY ────────────────────────────────
const orderLabel = document.getElementById('orderLabel');
const orderPrice = document.getElementById('orderPrice');
const mpesaAmt   = document.getElementById('mpesaAmt');
const bankAmt    = document.getElementById('bankAmt');

function updatePaymentPrices() {
  const price = getDisplayPrice();
  if (orderLabel) orderLabel.textContent = pkgData.label;
  if (orderPrice) orderPrice.textContent = price;
  if (mpesaAmt)   mpesaAmt.textContent   = price;
  if (bankAmt)    bankAmt.textContent    = price;

  // Sync toggle buttons
  document.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === CURRENCY.current);
  });

  // Update footer links
  document.querySelectorAll('[data-footer-pkg]').forEach(el => {
    const fp    = el.dataset.footerPkg;
    const label = el.dataset.footerLabel || '';
    if (!fp) return;
    const fpSuffix = (PACKAGES[fp]?.suffix) || '';
    el.textContent = `${label}${CURRENCY.getPrice(fp, fpSuffix)}`;
  });
}

const includesEl = document.getElementById('orderIncludes');
if (includesEl) {
  includesEl.innerHTML = pkgData.includes.map(item => `
    <div class="order-include">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${item}</span>
    </div>
  `).join('');
}

updatePaymentPrices();

// ── SESSION TYPE ──────────────────────────────────────────
let sessionType = params.get('type') || 'online';

// Sync active button from URL param
document.querySelectorAll('.order-session__btn').forEach(btn => {
  if (btn.dataset.type === sessionType) btn.classList.add('active');
  else btn.classList.remove('active');
});

document.querySelectorAll('.order-session__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sessionType = btn.dataset.type;
    document.querySelectorAll('.order-session__btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildWhatsApp();
  });
});

// ── WHATSAPP LINK ─────────────────────────────────────────
function buildWhatsApp() {
  const typeLabel = sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  const price     = getDisplayPrice();
  const msg = `Hi, I've just completed payment for the *${pkgData.label}* (${typeLabel}) — ${price}. Sending proof of payment now.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  const btn = document.getElementById('whatsappBtn');
  if (btn) btn.href = url;
}

buildWhatsApp();

// ── CURRENCY TOGGLE ───────────────────────────────────────
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
  updatePaymentPrices();
  buildWhatsApp();
});

buildCurrencyToggle();
