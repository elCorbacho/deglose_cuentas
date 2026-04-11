import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/categories';
import type { CategorizedTransaction, CategoriesMap, Transaction } from '../types';

/**
 * Categorize a transaction by matching merchant against category keywords.
 * First matching category wins. Unmatched → "Otros".
 * @param {Array<object>} transactions - parsed transactions
 * @param {object} categories - categories object (optional, uses DEFAULT_CATEGORIES if not provided)
 * @returns {Array<object>} transactions with `categoria` field added
 */
export function categorize(
  transactions: Transaction[],
  categories: CategoriesMap | null = null
): CategorizedTransaction[] {
  const cats = categories || DEFAULT_CATEGORIES;

  const result = transactions.map((tx) => {
    const upperMerchant = tx.comercio.toUpperCase();

    for (const [category, categoryData] of Object.entries(cats)) {
      if (category === 'Otros' || category === 'Cuotas') continue;

      const keywords = categoryData.keywords || [];
      for (const keyword of keywords) {
        if (upperMerchant.includes(keyword.toUpperCase())) {
          return { ...tx, categoria: category };
        }
      }
    }

    // MercadoPago special rule: if it's a known MercadoPago merchant, keep it
    // Otherwise → Otros
    return { ...tx, categoria: 'Otros' };
  });

  return result;
}

// Export default for backward compatibility
export default categorize;
