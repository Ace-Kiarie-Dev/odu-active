/* ============================================================
   ODU ACTIVE — ONBOARDING-AJAX.JS
   Intercepts form submit, POSTs to Formspree via fetch(),
   shows branded success screen, redirects to payment.html
   Built by Nesture
   ============================================================ */

'use strict';

(function () {

  const FORMSPREE_ID = 'mgopkvdo';
  const REDIRECT_DELAY = 5; // seconds before auto-redirect

  // Package → payment.html param mapping
  const PKG_PARAM = {
    'Monthly Package':  'monthly',
    '2-Month Program':  'two-month',
    '3-Month Program':  'three-month',
    '6-Month Program':  'six-month',
    'Diet Coaching':    'diet',
    'Consultation':     'consultation'
  };

  const form        = document.getElementById('obForm');
  const successEl   = document.getElementById('obSuccess');
  const paymentLink = document.getElementById('obPaymentLink');
  const countdown   = document.getElementById('obCountdown');
  const submitBtn   = document.getElementById('obSubmit');
  const obInner     = document.querySelector('.ob-inner');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Disable button, show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ob-spinner"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
        Submitting...
      `;
    }

    // Collect form data
    const formData = new FormData(form);

    // Determine payment redirect URL from selected package
    const selectedPkg = document.getElementById('packageSelect')?.value || '';
    const pkgParam    = PKG_PARAM[selectedPkg] || 'monthly';

    // Also check URL param as fallback
    const urlPkg = new URLSearchParams(window.location.search).get('package') || pkgParam;
    const paymentUrl = `payment.html?package=${PKG_PARAM[selectedPkg] || urlPkg}`;

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // Show success screen
        showSuccess(paymentUrl);
      } else {
        const data = await response.json();
        const msg  = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
        showFormError(msg);
        resetSubmitBtn();
      }
    } catch (err) {
      showFormError('Network error — please check your connection and try again.');
      resetSubmitBtn();
    }
  });

  function showSuccess(paymentUrl) {
    // Hide form sections + progress + nav
    document.querySelectorAll('.ob-section, .ob-progress, .ob-nav, .ob-pkg-banner').forEach(el => {
      el.style.display = 'none';
    });
    form.style.display = 'none';

    // Update payment link
    if (paymentLink) paymentLink.href = paymentUrl;

    // Show success overlay
    if (successEl) successEl.style.display = 'flex';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Countdown + auto-redirect
    let count = REDIRECT_DELAY;
    if (countdown) countdown.textContent = count;

    const timer = setInterval(() => {
      count--;
      if (countdown) countdown.textContent = count;
      if (count <= 0) {
        clearInterval(timer);
        window.location.href = paymentUrl;
      }
    }, 1000);
  }

  function showFormError(msg) {
    let toast = document.getElementById('obToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'obToast';
      toast.style.cssText = [
        'position:fixed', 'bottom:2rem', 'left:50%', 'transform:translateX(-50%)',
        'background:rgba(239,68,68,0.95)', 'color:#fff',
        'padding:0.75rem 1.5rem', 'border-radius:8px',
        "font-family:'Barlow',sans-serif", 'font-size:0.85rem',
        'z-index:9999', 'backdrop-filter:blur(8px)',
        'box-shadow:0 4px 20px rgba(0,0,0,0.3)',
        'transition:opacity 0.3s ease', 'white-space:nowrap',
        'max-width:90vw', 'text-align:center'
      ].join(';');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 5000);
  }

  function resetSubmitBtn() {
    if (!submitBtn) return;
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      Submit Application
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    `;
  }

})();
