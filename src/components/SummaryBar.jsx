import { formatCLP } from '../lib/formatters.js'

export default function SummaryBar({ total }) {
  return (
    <div className="sticky top-14 z-20 px-3 py-3 sm:px-4">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="summary-card">
          <div className="space-y-1">
            <p className="summary-kicker">Resumen del período</p>
            <p className="summary-description text-sm">
              Total detectado en las transacciones visibles actualmente
            </p>
          </div>

          <div className="text-right">
            <p className="summary-label text-xs uppercase tracking-[0.18em]">Total general</p>
            <p className="summary-total">{formatCLP(total)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
