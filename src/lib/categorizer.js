import { CATEGORIES } from '../data/categories.js'

/**
 * Categorize a transaction by matching merchant against category keywords.
 * First matching category wins. Unmatched → "Otros".
 * @param {Array<object>} transactions - parsed transactions
 * @returns {Array<object>} transactions with `categoria` field added
 */
export function categorize(transactions) {
  const result = transactions.map(tx => {
    const upperMerchant = tx.comercio.toUpperCase()

    for (const [category, categoryData] of Object.entries(CATEGORIES)) {
      if (category === 'Otros' || category === 'Cuotas') continue

      const keywords = categoryData.keywords || []
      for (const keyword of keywords) {
        if (upperMerchant.includes(keyword.toUpperCase())) {
          return { ...tx, categoria: category }
        }
      }
    }

    // MercadoPago special rule: if it's a known MercadoPago merchant, keep it
    // Otherwise → Otros
    return { ...tx, categoria: 'Otros' }
  })

  return result
}
