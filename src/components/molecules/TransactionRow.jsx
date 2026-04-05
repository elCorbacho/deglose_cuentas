/**
 * TransactionRow Molecule
 * Displays a single transaction in a row format
 */

import { formatCLP } from '../../lib/formatters.js'

export default function TransactionRow({ tx }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-2 transition-colors tx-row sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex items-center gap-2">
        <p 
          className="break-words text-sm font-medium leading-6 sm:text[0.95rem]" 
          style={{ color: 'var(--text-base)' }}
        >
          {tx.comercio}
        </p>
        <span className="tx-separator" style={{ color: 'var(--border-soft)' }}>•</span>
        <p 
          className="text-xs font-semibold tracking-[0.18em]" 
          style={{ color: 'var(--text-soft)' }}
        >
          {tx.fecha}
        </p>
      </div>

      <div className="sm:pl-4 shrink-0">
        <p 
          className={`font-mono text-base font-semibold sm:text-right ${tx.monto < 0 ? 'tx-amount-negative' : ''}`}
          style={tx.monto < 0 ? { color: 'var(--text-danger)' } : { color: 'var(--text-base)' }}
        >
          {formatCLP(tx.monto)}
        </p>
      </div>
    </div>
  )
}
