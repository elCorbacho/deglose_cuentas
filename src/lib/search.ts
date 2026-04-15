import type { PersistedTransaction } from '../types';

/**
 * Escape special regex metacharacters so the term is treated as literal text.
 */
function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize a monto-like search string by stripping $ and dots (thousands separator).
 * "$1.250" → "1250", "1.250" → "1250", "1250" → "1250"
 */
function normalizeMontoTerm(term: string): string {
  return term.replace(/^\$/, '').replace(/\./g, '');
}

/**
 * Filter transactions by a search term (case-insensitive).
 * Matches against: comercio, raw description.
 * Also parses monto: "$1.250" → searches for "1250" against the monto field.
 *
 * Returns all transactions when the term is empty or whitespace-only.
 * Regex special characters are escaped so they're treated as literals.
 */
export function filterTransactions(
  transactions: PersistedTransaction[],
  term: string
): PersistedTransaction[] {
  const trimmed = term.trim();
  if (trimmed === '') {
    return transactions;
  }

  const escapedTerm = escapeRegex(trimmed);
  const regex = new RegExp(escapedTerm, 'i');

  // Also try parsing as a monto: strip $ and . separators
  const normalizedMonto = normalizeMontoTerm(trimmed);
  const isMontoSearch = /^\$?[\d.]+$/.test(trimmed);

  return transactions.filter((tx) => {
    // Match against comercio
    if (tx.comercio && regex.test(tx.comercio)) return true;

    // Match against raw description
    if (tx.raw && regex.test(tx.raw)) return true;

    // Match against monto (substring check on normalized amount string)
    if (isMontoSearch) {
      const montoStr = String(tx.monto);
      if (montoStr.includes(normalizedMonto)) return true;
    }

    return false;
  });
}
