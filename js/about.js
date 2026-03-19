/* ============================================================
   ODU ACTIVE — ABOUT.JS
   Client pathways tab switcher
   Built by Nesture
   ============================================================ */

'use strict';

const tabs   = document.querySelectorAll('.pathways__tab');
const panels = document.querySelectorAll('.pathways__panel');

if (tabs.length && panels.length) {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(panel => panel.classList.remove('active'));
      const activePanel = document.getElementById(`tab-${target}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}
