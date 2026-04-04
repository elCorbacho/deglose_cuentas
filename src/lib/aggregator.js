import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/categories.js'
import { parseDate } from './formatters.js'

function getTransactionTimestamp(fecha) {
  if (typeof fecha !== 'string') return Number.NEGATIVE_INFINITY

  if (fecha.includes('/')) {
    const slashTimestamp = parseDate(fecha).getTime()
    return Number.isNaN(slashTimestamp) ? Number.NEGATIVE_INFINITY : slashTimestamp
  }

  const shortMonthMatch = fecha.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})$/)
  if (shortMonthMatch) {
    const [, dayValue, monthValue] = shortMonthMatch
    const monthMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    }
    const monthIndex = monthMap[monthValue.toLowerCase()]
    if (monthIndex !== undefined) {
      return new Date(2000, monthIndex, parseInt(dayValue, 10)).getTime()
    }
  }

  const fallback = new Date(fecha).getTime()
  return Number.isNaN(fallback) ? Number.NEGATIVE_INFINITY : fallback
}

/**
 * Group transactions by category and detect recurring merchants.
 * @param {Array<object>} transactions - categorized transactions
 * @param {object} categories - categories object (optional, uses DEFAULT_CATEGORIES if not provided)
 * @returns {{ categories: Array<{name, total, count, merchants}>, grandTotal: number }}
 */
export function group(transactions, categories = null) {
  const cats = categories || DEFAULT_CATEGORIES
  const categoryMap = {}

  // Group by category
  for (const tx of transactions) {
    const cat = tx.categoria || 'Otros'
    if (!categoryMap[cat]) {
      const categoryData = cats[cat]
      const icon = categoryData?.icon || '📋'
      categoryMap[cat] = { name: cat, icon, total: 0, count: 0, transactions: [] }
    }
    categoryMap[cat].total += tx.monto
    categoryMap[cat].count += 1
    categoryMap[cat].transactions.push(tx)
  }

  // Within each category, sort transactions by date descending
  const result = Object.values(categoryMap).map(cat => {
    // Sort transactions by date descending (most recent first)
    const sortedTransactions = [...cat.transactions].sort((a, b) => {
      const timestampA = getTransactionTimestamp(a.fecha)
      const timestampB = getTransactionTimestamp(b.fecha)

      if (timestampB === timestampA) return 0
      if (timestampB < timestampA) return -1
      return 1
    })
    
    return {
      ...cat,
      transactions: sortedTransactions,
    }
  })

  // Sort categories by total descending
  result.sort((a, b) => b.total - a.total)

  const grandTotal = transactions.reduce((sum, tx) => sum + tx.monto, 0)

  return { categories: result, grandTotal }
}
