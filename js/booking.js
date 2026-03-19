/* ============================================================
   ODU ACTIVE — BOOKING.JS
   Calendar, session type, package selection, two flows,
   WhatsApp notification, URL params
   Built by Nesture
   ============================================================ */

'use strict';

// ── CONSTANTS ─────────────────────────────────────────────
const WHATSAPP_NUMBER = '254725242721';
const MONTHS = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];

const PKG_LABELS = {
  monthly:      'Monthly Package',
  single:       'Single Session',
  diet:         'Diet Coaching',
  consultation: 'Consultation'
};

const PKG_PRICES = {
  monthly:      'KES XXXX / month',
  single:       'KES XXXX',
  diet:         'KES XXXX',
  consultation: 'KES XXXX'
};

// Assessment packages — these go through the booking form flow
const ASSESSMENT_PKGS = ['single', 'consultation'];

// ── STATE ─────────────────────────────────────────────────
const state = {
  sessionType:   'online',
  package:       null,
  selectedDate:  null,
  selectedLabel: null,
  currentYear:   new Date().getFullYear(),
  currentMonth:  new Date().getMonth(),
  availability:  {}
};

// ── INLINE AVAILABILITY FALLBACK ──────────────────────────
// Used when fetch is blocked locally — Paul updates this too
const INLINE_AVAILABILITY = {
  "2026-03-23": "available",
  "2026-03-24": "available",
  "2026-03-25": "unavailable",
  "2026-03-26": "unavailable",
  "2026-03-27": "available",
  "2026-03-28": "booked",
  "2026-03-30": "available",
  "2026-03-31": "available",
  "2026-04-01": "available",
  "2026-04-02": "booked",
  "2026-04-03": "available",
  "2026-04-07": "available",
  "2026-04-08": "available",
  "2026-04-09": "booked",
  "2026-04-10": "available"
};

// ── LOAD AVAILABILITY ─────────────────────────────────────
async function loadAvailability() {
  try {
    const res  = await fetch('./data/availability.json');
    const data = await res.json();
    state.availability = data.days || INLINE_AVAILABILITY;
  } catch {
    // Fallback for local file:// access
    state.availability = INLINE_AVAILABILITY;
  }
  renderCalendar();
}

// ── URL PARAMS ────────────────────────────────────────────
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  const pkg    = params.get('package');
  if (pkg && PKG_LABELS[pkg]) setPackage(pkg);
}

// ── SESSION TYPE ──────────────────────────────────────────
document.querySelectorAll('.session-option').forEach(btn => {
  btn.addEventListener('click', () => {
    state.sessionType = btn.dataset.type;
    document.querySelectorAll('.session-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateSummary();
  });
});

// ── PACKAGE SELECTOR ──────────────────────────────────────
function setPackage(pkg) {
  state.package = pkg;
  document.querySelectorAll('.pkg-option').forEach(b => {
    b.classList.toggle('active', b.dataset.pkg === pkg);
  });
  updateSummary();
}

document.querySelectorAll('.pkg-option').forEach(btn => {
  btn.addEventListener('click', () => setPackage(btn.dataset.pkg));
});

// ── CALENDAR ──────────────────────────────────────────────
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel   = document.getElementById('monthLabel');

function renderCalendar() {
  if (!calendarGrid) return;

  const { currentYear: year, currentMonth: month } = state;
  const today = new Date(); today.setHours(0,0,0,0);

  monthLabel.textContent = `${MONTHS[month]} ${year}`;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarGrid.innerHTML = '';

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day cal-day--empty';
    calendarGrid.appendChild(el);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date    = new Date(year, month, d); date.setHours(0,0,0,0);
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const status  = state.availability[dateStr] || 'unavailable';
    const isPast  = date < today;
    const isToday = date.getTime() === today.getTime();

    const cell = document.createElement('div');
    cell.classList.add('cal-day');
    cell.textContent = d;
    if (isToday) cell.classList.add('cal-day--today');

    if (isPast) {
      cell.classList.add('cal-day--past');
    } else if (status === 'available') {
      cell.classList.add('cal-day--available');
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', `Book ${MONTHS[month]} ${d}`);
      const label = `${MONTHS[month]} ${d}, ${year}`;
      cell.addEventListener('click', () => openModal(dateStr, label));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openModal(dateStr, label);
      });
    } else if (status === 'booked') {
      cell.classList.add('cal-day--booked');
    } else {
      cell.classList.add('cal-day--unavailable');
    }

    calendarGrid.appendChild(cell);
  }
}

document.getElementById('prevMonth')?.addEventListener('click', () => {
  state.currentMonth--;
  if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
  renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
  state.currentMonth++;
  if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
  renderCalendar();
});

// ── MODAL ─────────────────────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const modalBody    = document.querySelector('.modal__body');
const modalSuccess = document.getElementById('modalSuccess');

function openModal(dateStr, label) {
  state.selectedDate  = dateStr;
  state.selectedLabel = label;

  document.getElementById('modalDateLabel').textContent = label;
  document.getElementById('modalTitle').textContent     = 'Book Your Session';

  // Determine which flow to show
  const isAssessment = !state.package || ASSESSMENT_PKGS.includes(state.package);
  document.getElementById('flowAssessment').style.display = isAssessment ? '' : 'none';
  document.getElementById('flowPackage').style.display    = isAssessment ? 'none' : '';

  // Update payment amounts
  const price = state.package ? PKG_PRICES[state.package] : 'KES XXXX';
  const mpesaEl = document.getElementById('mpesaAmount');
  const bankEl  = document.getElementById('bankAmount');
  if (mpesaEl) mpesaEl.textContent = price;
  if (bankEl)  bankEl.textContent  = price;

  // Build WhatsApp message
  buildWhatsAppLink(label);

  updateSummary();

  // Show modal
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Reset states
  if (modalBody)    modalBody.style.display    = '';
  if (modalSuccess) modalSuccess.style.display = 'none';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalSuccessClose')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── WHATSAPP LINK ─────────────────────────────────────────
function buildWhatsAppLink(dateLabel) {
  const pkgLabel  = state.package ? PKG_LABELS[state.package] : 'package';
  const typeLabel = state.sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  const price     = state.package ? PKG_PRICES[state.package] : '';
  const msg = `Hi Paul, I've just paid for the *${pkgLabel}* (${typeLabel}) — ${price}. Sending proof of payment now. Preferred date: ${dateLabel}.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  const waBtn = document.getElementById('whatsappBtn');
  if (waBtn) waBtn.href = url;
}

// ── SUMMARY UPDATE ────────────────────────────────────────
function updateSummary() {
  const typeEl  = document.getElementById('summaryType');
  const pkgEl   = document.getElementById('summaryPackage');
  const dateEl  = document.getElementById('summaryDate');
  const priceEl = document.getElementById('summaryPrice');

  if (typeEl)  typeEl.textContent  = state.sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  if (pkgEl)   pkgEl.textContent   = state.package ? PKG_LABELS[state.package] : '— not selected';
  if (dateEl)  dateEl.textContent  = state.selectedLabel || '—';
  if (priceEl) priceEl.textContent = state.package ? PKG_PRICES[state.package] : '—';
}

// ── ASSESSMENT FORM SUBMIT ────────────────────────────────
document.getElementById('modalSubmitAssessment')?.addEventListener('click', () => {
  const nameEl  = document.getElementById('fieldName');
  const emailEl = document.getElementById('fieldEmail');
  const name    = nameEl?.value.trim();
  const email   = emailEl?.value.trim();

  if (!name)  { nameEl.style.borderColor  = 'var(--color-orange)'; nameEl.focus(); return; }
  if (!email) { emailEl.style.borderColor = 'var(--color-orange)'; emailEl.focus(); return; }

  // Build WhatsApp message for assessment
  const pkgLabel  = state.package ? PKG_LABELS[state.package] : 'Assessment';
  const typeLabel = state.sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  const phone     = document.getElementById('fieldPhone')?.value.trim() || '';
  const notes     = document.getElementById('fieldMessage')?.value.trim() || '';
  const msg = `Hi Paul, I'd like to book a *${pkgLabel}* (${typeLabel}) on *${state.selectedLabel}*.\n\nName: ${name}\nEmail: ${email}${phone ? '\nPhone: ' + phone : ''}${notes ? '\nNotes: ' + notes : ''}`;
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  // Show success then open WhatsApp
  if (modalBody)    modalBody.style.display    = 'none';
  if (modalSuccess) modalSuccess.style.display = 'flex';

  // Open WhatsApp after short delay
  setTimeout(() => window.open(waUrl, '_blank'), 800);
});

// ── INIT ──────────────────────────────────────────────────
readURLParams();
loadAvailability();
updateSummary();
