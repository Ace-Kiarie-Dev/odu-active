/* ============================================================
   ODU ACTIVE — BOOKING-DETAILS.JS  (Step 2 of 3)
   Reads URL params, renders time slots, handles form submit,
   routes to booking-confirm.html or payment.html
   Built by Nesture
   ============================================================ */

'use strict';

const WHATSAPP_NUMBER = '254725242721';

const PKG_LABELS = {
  monthly:      'Monthly Package',
  single:       'Single Session',
  diet:         'Diet Coaching',
  consultation: 'Consultation'
};

const PKG_PRICES = {
  monthly:      '$300 / month',
  single:       '$25',
  diet:         '$45',
  consultation: '$25'
};

// Duration of each package in minutes — used for slot display info
const PKG_DURATION = {
  monthly:      60,
  single:       45,
  diet:         30,
  consultation: 45
};

// Packages that go to confirm page (WhatsApp booking request)
// vs payment page (pay first)
const CONFIRM_PKGS  = ['single', 'consultation'];
const PAYMENT_PKGS  = ['monthly', 'diet'];

// ── READ URL PARAMS ───────────────────────────────────────
const params     = new URLSearchParams(window.location.search);
const sessionType = params.get('type')     || 'online';
const pkg         = params.get('package')  || '';
const dateStr     = params.get('date')     || '';
const dateLabel   = params.get('label')    || dateStr;
const isSaturday  = params.get('saturday') === '1';

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
if (sumPkg)   sumPkg.textContent   = PKG_LABELS[pkg]  || pkg;
if (sumDate)  sumDate.textContent  = dateLabel;
if (sumPrice) sumPrice.textContent = PKG_PRICES[pkg]  || '—';

// ── SESSION INFO SIDEBAR ──────────────────────────────────
const sessionInfoItems = document.getElementById('sessionInfoItems');
if (sessionInfoItems && pkg) {
  const formatLabel = sessionType === 'online' ? 'Zoom (Online)' : 'In-Person';
  const duration    = PKG_DURATION[pkg] ? `${PKG_DURATION[pkg]} min` : 'TBC';
  const items = [
    { label: 'Format',   value: formatLabel },
    { label: 'Duration', value: duration },
    { label: 'Price',    value: PKG_PRICES[pkg] || '—' },
    { label: 'Response', value: 'Within 24 hours' }
  ];
  sessionInfoItems.innerHTML = items.map(i => `
    <div class="details-info__item">
      <span class="details-info__label">${i.label}</span>
      <span class="details-info__value">${i.value}</span>
    </div>
  `).join('');
}

// ── SATURDAY NOTICE ───────────────────────────────────────
const satNotice = document.getElementById('saturdayNotice');
if (isSaturday && satNotice) satNotice.style.display = 'flex';

// ── TIME SLOT GENERATION ──────────────────────────────────
let selectedSlot = null;

function generateSlots(startH, startM, endH, endM, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  let h = startH, m = startM;

  while (h < endH || (h === endH && m <= endM)) {
    const label  = formatTime(h, m);
    const slot   = document.createElement('button');
    slot.className   = 'timeslot';
    slot.textContent = label;
    slot.dataset.time = label;

    slot.addEventListener('click', () => {
      document.querySelectorAll('.timeslot').forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      selectedSlot = label;
    });

    container.appendChild(slot);

    // Advance by 30 min
    m += 30;
    if (m >= 60) { m -= 60; h++; }
  }
}

function formatTime(h, m) {
  const period = h < 12 ? 'am' : 'pm';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayM = m === 0 ? '00' : String(m).padStart(2, '0');
  return `${displayH}:${displayM}${period}`;
}

// Morning: 5:00am – 11:30am
generateSlots(5, 0, 11, 30, 'morningSlots');
// Afternoon: 2:00pm – 8:00pm
generateSlots(14, 0, 20, 0, 'afternoonSlots');

// ── FORM SUBMIT ───────────────────────────────────────────
const submitBtn = document.getElementById('submitBtn');
const formError = document.getElementById('formError');

submitBtn?.addEventListener('click', () => {
  const name  = document.getElementById('fieldName')?.value.trim();
  const email = document.getElementById('fieldEmail')?.value.trim();
  const phone = document.getElementById('fieldPhone')?.value.trim();
  const notes = document.getElementById('fieldMessage')?.value.trim() || '';

  // Validation
  if (!name || !email || !phone || !selectedSlot) {
    if (formError) formError.style.display = 'block';
    if (!name)         document.getElementById('fieldName').style.borderColor  = 'var(--color-orange)';
    if (!email)        document.getElementById('fieldEmail').style.borderColor = 'var(--color-orange)';
    if (!phone)        document.getElementById('fieldPhone').style.borderColor = 'var(--color-orange)';
    if (!selectedSlot) {
      document.getElementById('timeslotWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (formError) formError.style.display = 'none';

  const typeLabel = sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  const pkgLabel  = PKG_LABELS[pkg] || pkg;
  const price     = PKG_PRICES[pkg] || '';
  const satNote   = isSaturday ? ' (Saturday — pending agreement)' : '';

  // Build WhatsApp message
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

  // Route based on package type
  if (PAYMENT_PKGS.includes(pkg)) {
    // Monthly / Diet → payment page
    const nextParams = new URLSearchParams({
      package: pkg,
      date:    dateLabel,
      time:    selectedSlot,
      type:    sessionType
    });
    window.location.href = `payment.html?${nextParams.toString()}`;
  } else {
    // Single / Consultation → confirm page
    const nextParams = new URLSearchParams({
      package: pkg,
      date:    dateLabel,
      time:    selectedSlot,
      type:    sessionType,
      name:    name,
      wa:      waUrl
    });
    window.location.href = `booking-confirm.html?${nextParams.toString()}`;
  }
});

// Clear field error highlight on input
['fieldName','fieldEmail','fieldPhone'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', function() {
    this.style.borderColor = '';
    if (formError) formError.style.display = 'none';
  });
});
