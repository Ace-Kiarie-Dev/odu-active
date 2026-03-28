/* ============================================================
   ODU ACTIVE — PROGRAMS.JS
   Monthly package In-Person / Online tab switcher
   Built by Nesture
   ============================================================ */

'use strict';

const formatTabs   = document.querySelectorAll('.pkg-format-tab');
const formatPanels = document.querySelectorAll('.pkg-format-panel');

formatTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const format = tab.dataset.format;
    formatTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    formatPanels.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`monthly-${format}`);
    if (target) target.classList.add('active');
  });
});
