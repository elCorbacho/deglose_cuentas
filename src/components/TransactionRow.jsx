import { formatCLP } from '../lib/formatters.js'

export default function TransactionRow({ tx }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 text-sm
                    hover:bg-gray-50 rounded">
      <div className="flex gap-4 min-w-0">
        <span className="text-gray-500 w-20 shrink-0">{tx.fecha}</span>
        <span className="text-gray-800 truncate">{tx.comercio}</span>
      </div>
      <span className={`font-mono font-medium whitespace-nowrap ml-4 ${tx.monto < 0 ? 'text-red-600' : 'text-gray-700'}`}>
        {formatCLP(tx.monto)}
      </span>
    </div>
  )
}
