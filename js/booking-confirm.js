/* ============================================================
   ODU ACTIVE — BOOKING-CONFIRM.JS  (Step 3 of 3)
   Reads URL params, populates summary + payment details,
   fires WhatsApp link
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

// Prices — update when Paul confirms Monthly Online pricing
const PKG_PRICES = {
  monthly:       '$300 / month',
  single:        '$25',
  diet:          '$45',
  consultation:  'Complimentary',
  'two-month':   '$560 / 2 months',
  'three-month': '$800 / 3 months',
  'six-month':   '$1,600 / 6 months'
};

const params      = new URLSearchParams(window.location.search);
const pkg         = params.get('package') || '';
const dateLabel   = params.get('date')    || '';
const timeSlot    = params.get('time')    || '';
const sessionType = params.get('type')    || 'online';
const waUrl       = params.get('wa')      || 'https://wa.me/254725242721';

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
if (confPrice) confPrice.textContent = PKG_PRICES[pkg] || '—';
if (waBtn)     waBtn.href            = waUrl;

// Auto-open WhatsApp after short delay so page loads first
if (waUrl && waUrl !== '#') {
  setTimeout(() => window.open(waUrl, '_blank'), 1200);
}
