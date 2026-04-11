/**
 * Format a number as Chilean Pesos: $XX.XXX (dot-thousands, no decimals)
 * @param {number} amount
 * @returns {string}
 */
export function formatCLP(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('es-CL').replace(/,/g, '.');
  return `$${amount < 0 ? '-' : ''}${formatted}`;
}

/**
 * Parse a DD/MM/YY date string to a Date object (for filtering).
 * @param {string} dateStr - "DD/MM/YY"
 * @returns {Date}
 */
export function parseDate(dateStr: string): Date {
  const [dd, mm, yy] = dateStr.split('/');
  const year = parseInt(yy, 10);
  // Assume 2000s for 2-digit years
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, parseInt(mm, 10) - 1, parseInt(dd, 10));
}

/**
 * Convert a Date to YYYY-MM-DD for date input comparison.
 * @param {Date} date
 * @returns {string}
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a date string for display (DD/MM/YYYY)
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {string}
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
