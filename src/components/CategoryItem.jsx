import { useState } from 'react'
import TransactionRow from './TransactionRow.jsx'
import { formatCLP } from '../lib/formatters.js'

export default function CategoryItem({ category }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3
                   hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`transition-transform duration-200 text-gray-400 ${expanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="font-semibold text-gray-800">{category.name}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {category.count} {category.count === 1 ? 'transacción' : 'transacciones'}
          </span>
        </div>
        <span className="font-mono font-bold text-gray-800">
          {formatCLP(category.total)}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {category.merchants.map((merchant) => (
            <div key={merchant.name}>
              {merchant.isRecurring && merchant.count > 1 && (
                <div className="px-4 py-1.5 bg-blue-50/60 flex items-center justify-between text-xs">
                  <span className="text-blue-700 font-medium">
                    🔄 {merchant.name} — {merchant.count} veces
                  </span>
                  <span className="font-mono font-semibold text-blue-800">
                    {formatCLP(merchant.total)}
                  </span>
                </div>
              )}
              {merchant.transactions.map((tx, i) => (
                <TransactionRow key={`${tx.raw}-${i}`} tx={tx} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
