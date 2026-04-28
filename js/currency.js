/* ============================================================
   ODU ACTIVE — CURRENCY.JS
   Shared currency toggle utility — USD ↔ KES
   Rate: 1 USD = 130 KES (hardcoded)
   Built by Nesture
   ============================================================ */

'use strict';

const CURRENCY = {
  rate: 130,
  current: 'USD', // default

  // Raw USD amounts for each package (numbers only, no symbols)
  USD: {
    single:        25,
    monthly:       300,
    'two-month':   560,
    'three-month': 800,
    'six-month':   1600,
    diet:          45,
    consultation:  null // complimentary — no conversion
  },

  // Format a USD amount as USD string
  formatUSD(pkg, suffix) {
    const val = this.USD[pkg];
    if (val === null || val === undefined) return 'Complimentary';
    const s = suffix || '';
    return `$${val.toLocaleString()}${s}`;
  },

  // Format a USD amount as KES string
  formatKES(pkg, suffix) {
    const val = this.USD[pkg];
    if (val === null || val === undefined) return 'Complimentary';
    const kes = val * this.rate;
    const s = suffix || '';
    return `KES ${kes.toLocaleString()}${s}`;
  },

  // Get display price string for current currency
  getPrice(pkg, suffix) {
    if (this.current === 'KES') return this.formatKES(pkg, suffix);
    return this.formatUSD(pkg, suffix);
  },

  // Toggle currency and fire event
  toggle() {
    this.current = this.current === 'USD' ? 'KES' : 'USD';
    localStorage.setItem('odu_currency', this.current);
    document.dispatchEvent(new CustomEvent('currencyChange', { detail: this.current }));
  },

  // Restore from localStorage
  init() {
    const saved = localStorage.getItem('odu_currency');
    if (saved === 'KES') this.current = 'KES';
  }
};

CURRENCY.init();
