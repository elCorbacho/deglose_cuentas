/**
 * CategoryItem Molecule
 * Displays a category with expandable transaction list
 */

import { useState, useMemo } from 'react'
import TransactionRow from './TransactionRow.jsx'
import { formatCLP } from '../../lib/formatters.js'
import { DEFAULT_CATEGORY_ICON } from '../../data/categories.js'

export default function CategoryItem({ category }) {
  const [expanded, setExpanded] = useState(false)
  const icon = category.icon || DEFAULT_CATEGORY_ICON

  // Pre-compute keys outside render to avoid mutation during render
  const transactionKeys = useMemo(() => {
    const keyCounts = new Map()
    return category.transactions.map((tx) => {
      const baseKey = `${tx.fecha}-${tx.comercio}-${tx.monto}-${tx.ciudad}`
      const count = keyCounts.get(baseKey) || 0
      keyCounts.set(baseKey, count + 1)
      return `${baseKey}-${count}`
    })
  }, [category.transactions])

  return (
    <div className="panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors sm:px-5 category-item-button"
        type="button"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition-transform duration-200 arrow-icon ${expanded ? 'rotate-90' : ''}`}
          >
            ▶
          </span>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="text-base font-semibold sm:text-lg" style={{ color: 'var(--text-strong)' }}>
                {category.name}
              </span>
              <span className="badge-soft">
                {category.count} {category.count === 1 ? 'movimiento' : 'movimientos'}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
            Total
          </p>
          <span className="mono-num text-lg font-bold" style={{ color: 'var(--text-strong)' }}>
            {formatCLP(category.total)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="expanded-content px-3 py-3 sm:px-4">
          <div className="transaction-divider-container">
            {category.transactions.map((tx, index) => (
              <div
                key={transactionKeys[index]}
                className={index > 0 ? 'transaction-divider' : ''}
              >
                <TransactionRow tx={tx} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
