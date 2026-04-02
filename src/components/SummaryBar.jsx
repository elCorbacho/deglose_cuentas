import { formatCLP } from '../lib/formatters.js'

export default function SummaryBar({ total }) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Total gastos del período
        </span>
        <span className="text-2xl font-bold font-mono text-gray-900">
          {formatCLP(total)}
        </span>
      </div>
    </div>
  )
}
