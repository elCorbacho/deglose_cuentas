import { formatCLP } from '../lib/formatters.js'

export default function TransactionRow({ tx }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {tx.fecha}
        </p>
        <p className="break-words text-sm font-medium leading-6 text-slate-800 sm:text-[0.95rem]">
          {tx.comercio}
        </p>
      </div>

      <div className="sm:pl-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400 sm:text-right">Monto</p>
        <p className={`font-mono text-base font-semibold ${tx.monto < 0 ? 'text-rose-600' : 'text-slate-800'} sm:text-right`}>
          {formatCLP(tx.monto)}
        </p>
      </div>
    </div>
  )
}
