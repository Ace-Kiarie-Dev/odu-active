/* ============================================================
   ODU ACTIVE — BOOKING.JS  (Step 1 of 3)
   Calendar, session type, package selection, continue bar
   Built by Nesture
   ============================================================ */

'use strict';

const MONTHS = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];

const PKG_LABELS = {
  monthly:       'Monthly Package',
  single:        'Single Session',
  diet:          'Diet Coaching',
  consultation:  'Consultation',
  'three-month': '3-Month Program',
  'six-month':   '6-Month Program'
};

const PKG_PRICES = {
  monthly:       '$300 / month',
  single:        '$25',
  diet:          '$45',
  consultation:  'Complimentary',
  'three-month': '$560',
  'six-month':   '$800'
};

// ── STATE ─────────────────────────────────────────────────
const state = {
  sessionType:  'online',
  package:      null,
  selectedDate: null,
  dateLabel:    null,
  isSaturday:   false,
  currentYear:  new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  bookedDates:  {}
};

// ── HARDCODED BOOKED DATES ────────────────────────────────
// Add any explicitly booked dates here: "YYYY-MM-DD": "booked"
const BOOKED_DATES = {};

// ── LOAD AVAILABILITY JSON (optional) ────────────────────
async function loadAvailability() {
  try {
    const res  = await fetch('./data/availability.json');
    const data = await res.json();
    const days = data.days || {};
    Object.entries(days).forEach(([dateStr, status]) => {
      if (status === 'booked') state.bookedDates[dateStr] = true;
    });
  } catch {
    // No JSON — all Mon–Fri open by default
  }
  Object.entries(BOOKED_DATES).forEach(([d, s]) => {
    if (s === 'booked') state.bookedDates[d] = true;
  });
  renderCalendar();
}

// ── READ URL PARAMS ───────────────────────────────────────
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
    updateBar();
  });
});

// ── PACKAGE SELECTOR ──────────────────────────────────────
function setPackage(pkg) {
  state.package = pkg;
  document.querySelectorAll('.pkg-option').forEach(b => {
    b.classList.toggle('active', b.dataset.pkg === pkg);
  });
  updateBar();
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
  const today = new Date(); today.setHours(0, 0, 0, 0);

  monthLabel.textContent = `${MONTHS[month]} ${year}`;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarGrid.innerHTML = '';

  // Empty cells before 1st of month
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day cal-day--empty';
    calendarGrid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date       = new Date(year, month, d); date.setHours(0, 0, 0, 0);
    const dateStr    = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayOfWeek  = date.getDay(); // 0=Sun … 6=Sat
    const isSunday   = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isWeekday  = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isPast     = date < today;
    const isToday    = date.getTime() === today.getTime();
    const isBooked   = !!state.bookedDates[dateStr];

    const cell = document.createElement('div');
    cell.classList.add('cal-day');
    cell.textContent = d;
    if (isToday) cell.classList.add('cal-day--today');

    if (isSunday || isPast) {
      cell.classList.add('cal-day--past');
    } else if (isSaturday) {
      // Saturday — request only
      cell.classList.add('cal-day--saturday');
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.title = 'Saturday — by individual agreement only';
      const label = `${MONTHS[month]} ${d}, ${year} (Saturday — Request Only)`;
      cell.addEventListener('click', () => selectDate(dateStr, label, true));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') selectDate(dateStr, label, true);
      });
    } else if (isWeekday && isBooked) {
      cell.classList.add('cal-day--booked');
      cell.title = 'This date is fully booked';
    } else if (isWeekday) {
      // All Mon–Fri available
      cell.classList.add('cal-day--available');
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      const label = `${MONTHS[month]} ${d}, ${year}`;
      cell.addEventListener('click', () => selectDate(dateStr, label, false));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') selectDate(dateStr, label, false);
      });
    }

    calendarGrid.appendChild(cell);
  }
}

// ── SELECT DATE ───────────────────────────────────────────
function selectDate(dateStr, label, isSaturday) {
  document.querySelectorAll('.cal-day--selected').forEach(el => el.classList.remove('cal-day--selected'));
  const cells = calendarGrid.querySelectorAll('.cal-day');
  const day   = parseInt(dateStr.split('-')[2]);
  cells.forEach(cell => {
    if (parseInt(cell.textContent) === day && !cell.classList.contains('cal-day--empty')) {
      cell.classList.add('cal-day--selected');
    }
  });
  state.selectedDate = dateStr;
  state.dateLabel    = label;
  state.isSaturday   = isSaturday;
  updateBar();
}

// ── CALENDAR NAV ──────────────────────────────────────────
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

// ── CONTINUE BAR ──────────────────────────────────────────
const continueBtn = document.getElementById('continueBtn');
const barType     = document.getElementById('barType');
const barPkg      = document.getElementById('barPkg');
const barDate     = document.getElementById('barDate');
const barDateSep  = document.getElementById('barDateSep');

function updateBar() {
  if (barType) barType.textContent = state.sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
  if (barPkg)  barPkg.textContent  = state.package ? PKG_LABELS[state.package] : 'No package selected';
  if (state.selectedDate) {
    if (barDate)    { barDate.textContent = state.dateLabel; barDate.style.display = ''; }
    if (barDateSep) barDateSep.style.display = '';
  }
  const bookBar = document.getElementById('bookBar');
  if (bookBar) bookBar.classList.toggle('visible', !!state.package);
  const canContinue = !!state.package && !!state.selectedDate;
  if (continueBtn) continueBtn.disabled = !canContinue;
}

continueBtn?.addEventListener('click', () => {
  if (!state.package || !state.selectedDate) return;
  const params = new URLSearchParams({
    type:     state.sessionType,
    package:  state.package,
    date:     state.selectedDate,
    label:    state.dateLabel,
    saturday: state.isSaturday ? '1' : '0'
  });
  window.location.href = `booking-details.html?${params.toString()}`;
});

// ── INIT ──────────────────────────────────────────────────
readURLParams();
loadAvailability();
updateBar();
