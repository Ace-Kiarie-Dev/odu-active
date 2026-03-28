/* ============================================================
   ODU ACTIVE — PAYMENT.JS
   Reads URL params, populates order summary, WhatsApp link
   Built by Nesture
   ============================================================ */

'use strict';

const WHATSAPP_NUMBER = '254725242721';

const PACKAGES = {
  monthly: {
    label:    'Monthly Package',
    price:    '$300 / month',
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
  diet: {
    label:    'Diet Coaching Session',
    price:    '$45',
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
const pkg     = PACKAGES[pkgKey] || PACKAGES.monthly;

// ── POPULATE ORDER SUMMARY ────────────────────────────────
const orderLabel = document.getElementById('orderLabel');
const orderPrice = document.getElementById('orderPrice');
const mpesaAmt   = document.getElementById('mpesaAmt');
const bankAmt    = document.getElementById('bankAmt');

if (orderLabel) orderLabel.textContent = pkg.label;
if (orderPrice) orderPrice.textContent = pkg.price;
if (mpesaAmt)   mpesaAmt.textContent   = pkg.price;
if (bankAmt)    bankAmt.textContent    = pkg.price;

const includesEl = document.getElementById('orderIncludes');
if (includesEl) {
  includesEl.innerHTML = pkg.includes.map(item => `
    <div class="order-include">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${item}</span>
    </div>
  `).join('');
}

// ── SESSION TYPE ──────────────────────────────────────────
let sessionType = 'online';

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
  const msg = `Hi, I've just completed payment for the *${pkg.label}* (${typeLabel}) — ${pkg.price}. Sending proof of payment now.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  const btn = document.getElementById('whatsappBtn');
  if (btn) btn.href = url;
}

buildWhatsApp();
