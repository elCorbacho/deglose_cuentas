/**
 * Group transactions by category and detect recurring merchants.
 * @param {Array<object>} transactions - categorized transactions
 * @returns {{ categories: Array<{name, total, count, merchants}>, grandTotal: number }}
 */
export function group(transactions) {
  console.log('=== AGGREGATOR: Processing', transactions.length, 'transactions ===')
  console.log('Sample transactions:', transactions.slice(0, 3))
  console.log('Categories in data:', transactions.filter(t => t.categoria).map(t => `${t.comercio} -> ${t.categoria}`).slice(0, 10))
  
  const categoryMap = {}
  const merchantCounts = {}

  // Count merchant occurrences for recurring detection
  for (const tx of transactions) {
    const key = tx.comercio.toUpperCase()
    merchantCounts[key] = (merchantCounts[key] || 0) + 1
  }

  // Group by category
  for (const tx of transactions) {
    const cat = tx.categoria || 'Otros'
    if (!categoryMap[cat]) {
      categoryMap[cat] = { name: cat, total: 0, count: 0, transactions: [] }
    }
    categoryMap[cat].total += tx.monto
    categoryMap[cat].count += 1
    categoryMap[cat].transactions.push(tx)
  }

  // Within each category, group by merchant
  const categories = Object.values(categoryMap).map(cat => {
    const merchantMap = {}
    for (const tx of cat.transactions) {
      const key = tx.comercio
      if (!merchantMap[key]) {
        merchantMap[key] = {
          name: key,
          total: 0,
          count: 0,
          isRecurring: merchantCounts[tx.comercio.toUpperCase()] >= 2,
          transactions: [],
        }
      }
      merchantMap[key].total += tx.monto
      merchantMap[key].count += 1
      merchantMap[key].transactions.push(tx)
    }
    return {
      ...cat,
      merchants: Object.values(merchantMap).sort((a, b) => b.total - a.total),
    }
  })

  // Sort categories by total descending
  categories.sort((a, b) => b.total - a.total)

  const grandTotal = transactions.reduce((sum, tx) => sum + tx.monto, 0)

  return { categories, grandTotal }
}
