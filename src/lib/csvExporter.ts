import type { PersistedTransaction } from '../types';

const CSV_HEADERS = ['fecha', 'comercio', 'monto', 'categoria'] as const;

/**
 * Escape a CSV field: wrap in double-quotes if it contains commas, quotes, or newlines.
 * Double up any existing double-quote characters.
 */
function escapeField(value: string | number | undefined | null): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of PersistedTransaction to a UTF-8 BOM CSV string.
 */
function toCsvString(transactions: PersistedTransaction[]): string {
  const BOM = '\uFEFF';
  const headerRow = CSV_HEADERS.join(',');
  const dataRows = transactions.map((tx) => {
    return [
      escapeField(tx.fecha),
      escapeField(tx.comercio),
      escapeField(tx.monto),
      escapeField(tx.categoria),
    ].join(',');
  });
  return BOM + [headerRow, ...dataRows].join('\n');
}

/**
 * Export transactions to a CSV file and trigger browser download.
 * Uses Blob API + URL.createObjectURL for browser compatibility.
 */
export function exportToCsv(transactions: PersistedTransaction[]): void {
  const csvContent = toCsvString(transactions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'transacciones.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
