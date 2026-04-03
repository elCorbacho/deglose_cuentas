import { useState } from 'react'
import TransactionRow from './TransactionRow.jsx'
import { formatCLP } from '../lib/formatters.js'

export default function CategoryItem({ category }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="panel overflow-hidden bg-white/95">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50 sm:px-5"
        type="button"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          >
            ▶
          </span>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold text-slate-900 sm:text-lg">{category.name}</span>
              <span className="badge-soft">
                {category.count} {category.count === 1 ? 'movimiento' : 'movimientos'}
              </span>
            </div>

            <p className="text-sm text-slate-500">
              Tocá para {expanded ? 'ocultar' : 'ver'} el detalle por comercio y transacción.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
          <span className="font-mono text-lg font-bold text-slate-900">
            {formatCLP(category.total)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-white px-3 py-3 sm:px-4">
          <div className="space-y-4">
            {category.merchants.map((merchant) => (
              <div key={merchant.name} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/55">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{merchant.name}</p>
                    <p className="text-xs text-slate-500">
                      {merchant.count} {merchant.count === 1 ? 'transacción' : 'transacciones'} asociadas
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {merchant.isRecurring && merchant.count > 1 && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        🔄 Recurrente · {merchant.count} veces
                      </span>
                    )}
                    <span className="font-mono text-sm font-semibold text-slate-700">
                      {formatCLP(merchant.total)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 bg-white">
                  {merchant.transactions.map((tx, index) => (
                    <TransactionRow key={`${tx.raw}-${index}`} tx={tx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
