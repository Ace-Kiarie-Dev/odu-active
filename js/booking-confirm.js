/* ============================================================
   ODU ACTIVE — BOOKING-CONFIRM.JS  (Step 3 of 3)
   Reads URL params, populates summary, fires WhatsApp link
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

const params      = new URLSearchParams(window.location.search);
const pkg         = params.get('package') || '';
const dateLabel   = params.get('date')    || '';
const timeSlot    = params.get('time')    || '';
const sessionType = params.get('type')    || 'online';
const waUrl       = params.get('wa')      || 'https://wa.me/254725242721';

// Populate summary
const confPkg  = document.getElementById('confPkg');
const confType = document.getElementById('confType');
const confDate = document.getElementById('confDate');
const confTime = document.getElementById('confTime');
const waBtn    = document.getElementById('waBtn');

if (confPkg)  confPkg.textContent  = PKG_LABELS[pkg] || pkg;
if (confType) confType.textContent = sessionType === 'online' ? 'Online (Zoom)' : 'In-Person';
if (confDate) confDate.textContent = dateLabel;
if (confTime) confTime.textContent = timeSlot;
if (waBtn)    waBtn.href           = waUrl;

// Auto-open WhatsApp after short delay
if (waUrl && waUrl !== '#') {
  setTimeout(() => window.open(waUrl, '_blank'), 1200);
}
