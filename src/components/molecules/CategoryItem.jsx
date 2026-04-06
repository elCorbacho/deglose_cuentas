/**
 * CategoryItem Molecule
 * Displays a category with expandable transaction list
 */

import { useState } from 'react'
import TransactionRow from './TransactionRow.jsx'
import { formatCLP } from '../../lib/formatters.js'
import { DEFAULT_CATEGORY_ICON } from '../../data/categories.js'

// Chevron icon for expand/collapse
const ChevronIcon = ({ expanded }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

export default function CategoryItem({ category }) {
  const [expanded, setExpanded] = useState(false)
  const icon = category.icon || DEFAULT_CATEGORY_ICON

  return (
    <div className="panel overflow-hidden category-panel">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors sm:px-4 category-item-button cursor-pointer"
        type="button"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <span
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] arrow-icon transition-colors duration-200`}
          >
            <ChevronIcon expanded={expanded} />
          </span>

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base">{icon}</span>
              <span className="text-sm font-semibold sm:text-base" style={{ color: 'var(--text-strong)' }}>
                {category.name}
              </span>
              <span className="badge-soft badge-soft--compact">
                {category.count} {category.count === 1 ? 'movimiento' : 'movimientos'}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
            Total
          </p>
          <span className="mono-num text-base font-bold" style={{ color: 'var(--text-strong)' }}>
            {formatCLP(category.total)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="expanded-content px-2.5 py-2 sm:px-3">
          <div className="tx-table-header">
            <div className="tx-table-columns">
              <span>Nombre transacción</span>
              <span>Fecha</span>
              <span>Monto</span>
            </div>
          </div>

          <div className="transaction-divider-container">
            {category.transactions.map((tx, index) => (
              <div
                key={`${tx.fecha}-${tx.comercio}-${tx.monto}-${tx.ciudad}-${index}`}
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
