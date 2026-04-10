/**
 * TransactionRow Molecule
 * Displays a single transaction in a row format
 */

import { formatCLP } from '../../lib/formatters'
import type { PersistedTransaction } from '../../types'

export default function TransactionRow({ tx }: { tx: PersistedTransaction }) {
  return (
    <div className="tx-row tx-row--table">
      <div className="tx-col tx-col--merchant min-w-0">
        <p className="tx-merchant truncate" style={{ color: 'var(--text-base)' }} title={tx.comercio}>
          {tx.comercio}
        </p>
      </div>

      <div className="tx-col tx-col--date">
        <p className="tx-date" style={{ color: 'var(--text-soft)' }}>
          {tx.fecha}
        </p>
      </div>

      <div className="tx-col tx-col--amount">
        <p
          className={`mono-num tx-amount ${tx.monto < 0 ? 'tx-amount-negative' : ''}`}
          style={tx.monto < 0 ? { color: 'var(--text-danger)' } : { color: 'var(--text-strong)' }}
        >
          {formatCLP(tx.monto)}
        </p>
      </div>
    </div>
  )
}
