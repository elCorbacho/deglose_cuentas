import { NON_EXPENSE_KEYWORDS } from '../data/categories.js'

// Pattern: DD/MM/YY CIUDAD $MONTO NOMBRE (1-4 words max)
// This prevents capturing the entire remaining text as commerce name
const TRANSACTION_REGEX = /(\d{2}\/\d{2}\/\d{2})\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]*?)\s+\$\s*([\d.,]+)\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s\.]{1,40})(?=\s|$)/g

// Patterns to skip (page headers/footers)
const SKIP_PATTERNS = [
  /^\d+ DE \d+$/,           // "1 DE 6", "2 DE 6"
  /^(MONTO|ORIGEN|OPERACIÓN|FECHA|LUGAR|DESCRIPCIÓN|VALOR|CARGO|PAGAR|CUPO)/i,
  /^\d+\.PERÍODO/,
  /^MOVIMIENTOS TARJETA/,
  /^TOTAL OPERACIONES/,
  /^PERÍODO ANTERIOR/,
  /^PERÍODO ACTUAL/,
  /^I\.\s/,
  /^II\.\s/,
]

/**
 * Parse transaction lines from extracted PDF text.
 * @param {string} text - raw text from PDF
 * @returns {Array<{fecha: string, comercio: string, monto: number, ciudad: string, raw: string}>}
 */
export function parse(text) {
  const transactions = []
  let match
  
  // Use global regex to find all matches
  while ((match = TRANSACTION_REGEX.exec(text)) !== null) {
    const [, fecha, ciudad, montoStr, comercio] = match
    
    // Skip non-expense lines
    const upperComercio = comercio.toUpperCase()
    if (NON_EXPENSE_KEYWORDS.some(kw => upperComercio.includes(kw))) continue
    
    // Parse amount: remove dots and commas
    const cleanAmount = montoStr.replace(/\./g, '').replace(/,/g, '')
    const monto = parseInt(cleanAmount, 10)
    
    if (isNaN(monto) || monto <= 0) continue
    
    // Clean up commerce name
    const cleanedComercio = comercio.trim()
    const cleanedCiudad = ciudad.trim()
    
    transactions.push({
      fecha: fecha.trim(),
      comercio: cleanedComercio,
      monto,
      ciudad: cleanedCiudad,
      raw: match[0],
    })
  }

  console.log('=== PARSER RESULT: Found', transactions.length, 'transactions ===')
  if (transactions.length > 0) {
    console.log('First 10 transactions:', transactions.slice(0, 10).map(t => `${t.fecha} ${t.ciudad} ${t.comercio} $${t.monto}`))
  }
  return transactions
}
