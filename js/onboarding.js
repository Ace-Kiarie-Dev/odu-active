/* ============================================================
   ODU ACTIVE — ONBOARDING.JS
   Multi-step form, package pre-selection, payment redirect
   Built by Nesture
   ============================================================ */

'use strict';

const TOTAL_SECTIONS = 8;
let currentSection = 1;

const PAYMENT_PACKAGES = ['monthly', 'three-month', 'six-month', 'diet', 'consultation'];

const PKG_NAMES = {
  monthly:       'Monthly Package',
  'three-month': '3-Month Program',
  'six-month':   '6-Month Program',
  diet:          'Diet Coaching',
  consultation:  'Consultation',
  single:        'Single Session'
};

const urlParams  = new URLSearchParams(window.location.search);
const urlPackage = urlParams.get('package') || '';

const obForm          = document.getElementById('obForm');
const obNext          = document.getElementById('obNext');
const obBack          = document.getElementById('obBack');
const obSubmit        = document.getElementById('obSubmit');
const obProgressFill  = document.getElementById('obProgressFill');
const obProgressLabel = document.getElementById('obProgressLabel');

// ── PRE-SELECT PACKAGE ────────────────────────────────────
function preSelectPackage() {
  if (!urlPackage) return;
  const select = document.getElementById('packageSelect');
  if (!select) return;
  const target = PKG_NAMES[urlPackage] || '';
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value === target || select.options[i].value.toLowerCase().replace(/\s+/g,'-') === urlPackage) {
      select.selectedIndex = i;
      break;
    }
  }
}

// ── SET REDIRECT AFTER FORMSPREE SUBMIT ───────────────────
function setRedirect() {
  if (!obForm) return;
  const pkg      = urlPackage || 'monthly';
  const nextPage = PAYMENT_PACKAGES.includes(pkg)
    ? `payment.html?package=${pkg}`
    : 'onboarding-thanks.html';
  const hiddenNext = obForm.querySelector('input[name="_next"]');
  if (hiddenNext) hiddenNext.value = nextPage;
}

// ── SHOW PACKAGE CONTEXT BANNER ───────────────────────────
function showPackageBanner() {
  if (!urlPackage || !PKG_NAMES[urlPackage]) return;
  const header = document.querySelector('.ob-header');
  if (!header) return;
  const banner = document.createElement('div');
  banner.className = 'ob-pkg-banner';
  banner.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
    <span>Selected package: <strong>${PKG_NAMES[urlPackage]}</strong></span>
  `;
  header.appendChild(banner);
}

// ── SHOW SECTION ─────────────────────────────────────────
function showSection(num) {
  document.querySelectorAll('.ob-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(`section-${num}`);
  if (section) section.classList.add('active');

  const pct = (num / TOTAL_SECTIONS) * 100;
  if (obProgressFill)  obProgressFill.style.width  = `${pct}%`;
  if (obProgressLabel) obProgressLabel.textContent  = `Section ${num} of ${TOTAL_SECTIONS}`;

  if (obBack) obBack.style.display = num > 1 ? '' : 'none';

  const isLast = num === TOTAL_SECTIONS;
  if (obNext)   obNext.style.display   = isLast ? 'none' : '';
  if (obSubmit) obSubmit.style.display = isLast ? '' : 'none';

  const formEl = document.getElementById('obForm');
  if (formEl) window.scrollTo({ top: formEl.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
}

// ── VALIDATE SECTION ──────────────────────────────────────
function validateSection(num) {
  const section = document.getElementById(`section-${num}`);
  if (!section) return true;

  section.querySelectorAll('.ob-input--error, .ob-field--error').forEach(el => {
    el.classList.remove('ob-input--error', 'ob-field--error');
  });

  let valid = true;
  section.querySelectorAll('[required]').forEach(field => {
    if (field.type === 'radio') {
      const checked = Array.from(section.querySelectorAll(`input[name="${field.name}"]`)).some(r => r.checked);
      if (!checked) {
        valid = false;
        field.closest('.ob-field')?.classList.add('ob-field--error');
      }
    } else if (field.type === 'checkbox') {
      if (!field.checked) {
        valid = false;
        field.closest('.ob-field')?.classList.add('ob-field--error');
      }
    } else {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('ob-input--error');
        field.addEventListener('input', () => field.classList.remove('ob-input--error'), { once: true });
      }
    }
  });

  return valid;
}

// ── NEXT / BACK ───────────────────────────────────────────
obNext?.addEventListener('click', () => {
  if (!validateSection(currentSection)) {
    showToast('Please complete all required fields before continuing.');
    return;
  }
  if (currentSection < TOTAL_SECTIONS) { currentSection++; showSection(currentSection); }
});

obBack?.addEventListener('click', () => {
  if (currentSection > 1) { currentSection--; showSection(currentSection); }
});

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('obToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'obToast';
    t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:rgba(239,68,68,0.95);color:#fff;padding:0.75rem 1.5rem;border-radius:8px;font-family:Barlow,sans-serif;font-size:0.85rem;z-index:9999;backdrop-filter:blur(8px);transition:opacity 0.3s ease;white-space:nowrap';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, 3500);
}

// ── CONDITIONAL FIELDS ────────────────────────────────────
document.querySelector('input[name="Has Medical Conditions"][value="Yes"]')
  ?.addEventListener('change', () => { const f = document.getElementById('medConditionsField'); if (f) f.style.display = ''; });
document.querySelector('input[name="Has Medical Conditions"][value="No"]')
  ?.addEventListener('change', () => { const f = document.getElementById('medConditionsField'); if (f) f.style.display = 'none'; });
document.querySelector('input[name="On Medication"][value="Yes"]')
  ?.addEventListener('change', () => { const f = document.getElementById('medDetailsField'); if (f) f.style.display = ''; });
document.querySelector('input[name="On Medication"][value="No"]')
  ?.addEventListener('change', () => { const f = document.getElementById('medDetailsField'); if (f) f.style.display = 'none'; });

// ── INIT ─────────────────────────────────────────────────
preSelectPackage();
setRedirect();
showPackageBanner();
showSection(1);
