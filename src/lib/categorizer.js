import { CATEGORIES } from '../data/categories.js'

/**
 * Categorize a transaction by matching merchant against category keywords.
 * First matching category wins. Unmatched → "Otros".
 * @param {Array<object>} transactions - parsed transactions
 * @returns {Array<object>} transactions with `categoria` field added
 */
export function categorize(transactions) {
  console.log('=== CATEGORIZE: Processing', transactions.length, 'transactions ===')
  
  const result = transactions.map(tx => {
    const upperMerchant = tx.comercio.toUpperCase()
    console.log(`  categorizing: "${tx.comercio}" (upper: "${upperMerchant}")`)

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (category === 'Otros' || category === 'Cuotas') continue

      for (const keyword of keywords) {
        if (upperMerchant.includes(keyword.toUpperCase())) {
          console.log(`    -> MATCHED: ${category} (keyword: "${keyword}")`)
          return { ...tx, categoria: category }
        }
      }
    }

    // MercadoPago special rule: if it's a known MercadoPago merchant, keep it
    // Otherwise → Otros
    console.log(`    -> NO MATCH, assigned to: Otros`)
    return { ...tx, categoria: 'Otros' }
  })
  
  // Show category breakdown
  const breakdown = {}
  result.forEach(tx => {
    breakdown[tx.categoria] = (breakdown[tx.categoria] || 0) + 1
  })
  console.log('=== CATEGORY BREAKDOWN ===')
  console.log(breakdown)
  
  return result
}
