/* ============================================================
   ODU ACTIVE — PROGRAMS.JS
   Monthly package In-Person / Online tab switcher
   Built by Nesture
   ============================================================ */

'use strict';

// ── FORMAT TABS ───────────────────────────────────────────
const formatTabs   = document.querySelectorAll('.pkg-format-tab');
const formatPanels = document.querySelectorAll('.pkg-format-panel');

formatTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Each format tab belongs to a parent pkg-section
    const section = tab.closest('.pkg-section');
    if (!section) return;

    const format = tab.dataset.format;

    // Deactivate all tabs/panels within this section only
    section.querySelectorAll('.pkg-format-tab').forEach(t => t.classList.remove('active'));
    section.querySelectorAll('.pkg-format-panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');

    // Find the panel by data-format or by ID convention
    const targetPanel = section.querySelector(`[data-format-panel="${format}"]`)
      || section.querySelector(`.pkg-format-panel[id$="-${format}"]`);
    if (targetPanel) targetPanel.classList.add('active');
  });
});
