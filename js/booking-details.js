/* ============================================================
   ODU ACTIVE — BOOKING-DETAILS.JS  (Step 2 of 3)
   Reads URL params, renders time slots, handles form submit,
   routes to booking-confirm.html or payment.html
   Currency-aware (USD ↔ KES via currency.js)
   Built by Nesture
   ============================================================ */

'use strict';

const WHATSAPP_NUMBER = '254725242721';

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

// Duration of each package in minutes
const PKG_DURATION = {
  monthly:       60,
  single:        45,
  diet:          30,
  consultation:  45,
  'two-month':   60,
  'three-month': 60,
  'six-month':   60
};

const CONFIRM_PKGS = ['single', 'consultation'];
const PAYMENT_PKGS = ['monthly', 'diet', 'two-month', 'three-month', 'six-month'];

// ── READ URL PARAMS ───────────────────────────────────────
const params      = new URLSearchParams(window.location.search);
const sessionType = params.get('type') || 'online';
const pkg         = params.get('package') || '';
const dateStr     = params.get('date') || '';
const dateLabel   = params.get('label') || dateStr;
const isSaturday  = params.get('saturday') === '1';

// Restore currency preference if passed through
const urlCurrency = params.get('currency');
if (urlCurrency === 'KES' && CURRENCY.current !== 'KES') {
  CURRENCY.current = 'KES';
}

// Guard — if no valid params, redirect back
if (!pkg || !dateStr) {
  window.location.href = 'booking.html';
}

// ── POPULATE SUMMARY ──────────────────────────────────────
const sumType  = document.getElementById('sumType');
const sumPkg   = document.getElementById('sumPkg');
const sumDate  = document.getElementById('sumDate');
const sumPrice = document.getElementById('sumPrice');

if (sumType)  sumType.textContent  = sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
if (sumPkg)   sumPkg.textContent   = PKG_LABELS[pkg] || pkg;
if (sumDate)  sumDate.textContent  = dateLabel;
if (sumPrice) sumPrice.textContent = getPkgPrice(pkg);

// ── SESSION INFO SIDEBAR ──────────────────────────────────
function renderSessionInfo() {
  const sessionInfoItems = document.getElementById('sessionInfoItems');
  if (!sessionInfoItems || !pkg) return;
  const formatLabel = sessionType === 'online' ? 'Zoom (Online)' : 'In-Person';
  const duration    = PKG_DURATION[pkg] ? `${PKG_DURATION[pkg]} min` : 'TBC';
  const items = [
    { label: 'Format',   value: formatLabel },
    { label: 'Duration', value: duration },
    { label: 'Price',    value: getPkgPrice(pkg) },
    { label: 'Response', value: 'Within 24 hours' }
  ];
  sessionInfoItems.innerHTML = items.map(i => `
    <div class="details-info__item">
      <span class="details-info__label">${i.label}</span>
      <span class="details-info__value">${i.value}</span>
    </div>
  `).join('');
}

renderSessionInfo();

// ── SATURDAY NOTICE ───────────────────────────────────────
const satNotice = document.getElementById('saturdayNotice');
if (isSaturday && satNotice) satNotice.style.display = 'flex';

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
  if (sumPrice) sumPrice.textContent = getPkgPrice(pkg);
  renderSessionInfo();
  document.querySelectorAll('.currency-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === CURRENCY.current);
  });
});

// ── TIME SLOT GENERATION ──────────────────────────────────
let selectedSlot = null;

function generateSlots(startH, startM, endH, endM, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  let h = startH, m = startM;

  while (h < endH || (h === endH && m <= endM)) {
    const label = formatTime(h, m);
    const slot  = document.createElement('button');
    slot.className   = 'timeslot';
    slot.textContent = label;
    slot.dataset.time = label;

    slot.addEventListener('click', () => {
      document.querySelectorAll('.timeslot').forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      selectedSlot = label;
    });

    container.appendChild(slot);
    m += 30;
    if (m >= 60) { m -= 60; h++; }
  }
}

function formatTime(h, m) {
  const period   = h < 12 ? 'am' : 'pm';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayM = m === 0 ? '00' : String(m).padStart(2, '0');
  return `${displayH}:${displayM}${period}`;
}

generateSlots(5, 0, 11, 30, 'morningSlots');
generateSlots(14, 0, 20, 0, 'afternoonSlots');

// ── FORM SUBMIT ───────────────────────────────────────────
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');

submitBtn?.addEventListener('click', () => {
  const name  = document.getElementById('fieldName')?.value.trim();
  const email = document.getElementById('fieldEmail')?.value.trim();
  const phone = document.getElementById('fieldPhone')?.value.trim();
  const notes = document.getElementById('fieldMessage')?.value.trim() || '';

  if (!name || !email || !phone || !selectedSlot) {
    if (formError) formError.style.display = 'block';
    if (!name)  document.getElementById('fieldName').style.borderColor  = 'var(--color-orange)';
    if (!email) document.getElementById('fieldEmail').style.borderColor = 'var(--color-orange)';
    if (!phone) document.getElementById('fieldPhone').style.borderColor = 'var(--color-orange)';
    if (!selectedSlot) {
      document.getElementById('timeslotWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (formError) formError.style.display = 'none';

  const typeLabel = sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  const pkgLabel  = PKG_LABELS[pkg] || pkg;
  const price     = getPkgPrice(pkg);
  const satNote   = isSaturday ? ' (Saturday — pending agreement)' : '';

  const msg = [
    `Hi, I'd like to book a *${pkgLabel}* (${typeLabel}).`,
    ``,
    `📅 Date: ${dateLabel}${satNote}`,
    `⏰ Preferred Time: ${selectedSlot}`,
    ``,
    `👤 Name: ${name}`,
    `📧 Email: ${email}`,
    `📱 Phone: ${phone}`,
    notes ? `📝 Notes: ${notes}` : ''
  ].filter(Boolean).join('\n');

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  if (PAYMENT_PKGS.includes(pkg)) {
    const nextParams = new URLSearchParams({
      package:  pkg,
      date:     dateLabel,
      time:     selectedSlot,
      type:     sessionType,
      currency: CURRENCY.current
    });
    window.location.href = `payment.html?${nextParams.toString()}`;
  } else {
    const nextParams = new URLSearchParams({
      package:  pkg,
      date:     dateLabel,
      time:     selectedSlot,
      type:     sessionType,
      name:     name,
      wa:       waUrl,
      currency: CURRENCY.current
    });
    window.location.href = `booking-confirm.html?${nextParams.toString()}`;
  }
});

['fieldName', 'fieldEmail', 'fieldPhone'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', function () {
    this.style.borderColor = '';
    if (formError) formError.style.display = 'none';
  });
});

// ── INIT ──────────────────────────────────────────────────
buildCurrencyToggle();
