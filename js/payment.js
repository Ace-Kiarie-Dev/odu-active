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
    price:    'KES XXXX',
    includes: [
      'Initial movement & lifestyle assessment',
      'Fully customised monthly training programme',
      'Recurring structured coaching sessions',
      'Monthly progress review and adjustment',
      'Direct communication with Paul'
    ]
  },
  diet: {
    label:    'Diet Coaching',
    price:    'KES XXXX',
    includes: [
      'Dietary assessment and goal alignment',
      'Personalised science-based nutrition plan',
      'Macro and habit structure guidance',
      'Nutrition strategy aligned to training',
      'Follow-up recommendations and resources'
    ]
  }
};

// ── READ URL PARAM ────────────────────────────────────────
const params  = new URLSearchParams(window.location.search);
const pkgKey  = params.get('package') || 'monthly';
const pkg     = PACKAGES[pkgKey] || PACKAGES.monthly;

// ── POPULATE ORDER SUMMARY ────────────────────────────────
document.getElementById('orderLabel').textContent = pkg.label;
document.getElementById('orderPrice').textContent = pkg.price;
document.getElementById('mpesaAmt').textContent   = pkg.price;
document.getElementById('bankAmt').textContent    = pkg.price;

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
  const msg = `Hi Paul, I've just completed payment for the *${pkg.label}* (${typeLabel}) — ${pkg.price}. Sending proof of payment now.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  const btn = document.getElementById('whatsappBtn');
  if (btn) btn.href = url;
}

buildWhatsApp();
