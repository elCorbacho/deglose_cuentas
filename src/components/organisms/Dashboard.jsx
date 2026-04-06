/**
 * Dashboard Molecule
 * Displays financial summary with key metrics and visualizations
 */

import { formatCLP, formatDate, parseDate } from '../../lib/formatters.js'

// Arrow icons
const TrendUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
)

const TrendDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const ReceiptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
)

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
)

function MetricCard({ icon: Icon, label, value, subValue, highlight }) {
  return (
    <div className="dashboard-metric-card panel p-4">
      <div className="flex items-start gap-3">
        <div className={`dashboard-metric-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${highlight ? 'bg-blue-50' : 'bg-slate-100'}`}>
          <Icon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="dashboard-metric-label text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
            {label}
          </p>
          <p className="dashboard-metric-value text-xl font-bold tracking-tight" style={{ color: 'var(--text-strong)' }}>
            {value}
          </p>
          {subValue && (
            <p className="dashboard-metric-sub text-xs mt-1" style={{ color: 'var(--text-soft)' }}>
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryBar({ category, maxTotal, index }) {
  const percentage = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0
  const colors = [
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
  ]
  const color = colors[index % colors.length]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{category.icon}</span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
            {category.name}
          </span>
        </div>
        <span className="mono-num text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
          {formatCLP(category.total)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function Dashboard({ categories, grandTotal, transactionCount, dateRange }) {
  const topCategories = categories.slice(0, 5)
  const maxTotal = topCategories[0]?.total || 0

  const dateRangeText = (() => {
    if (!dateRange.desde && !dateRange.hasta) return 'Todas las fechas'
    if (dateRange.desde && dateRange.hasta) {
      return `${formatDate(dateRange.desde)} - ${formatDate(dateRange.hasta)}`
    }
    if (dateRange.desde) return `Desde ${formatDate(dateRange.desde)}`
    return `Hasta ${formatDate(dateRange.hasta)}`
  })()

  return (
    <div className="space-y-6">
      {/* Main Total Card */}
      <div className="panel dashboard-total-card p-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="dashboard-total-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <WalletIcon />
          </div>
          <div className="space-y-1">
            <p className="dashboard-total-label text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
              Total Gastado
            </p>
            <p className="dashboard-total-value mono-num text-4xl font-bold tracking-tight" style={{ color: 'var(--text-strong)' }}>
              {formatCLP(grandTotal)}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
              {transactionCount} {transactionCount === 1 ? 'transacción' : 'transacciones'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={ReceiptIcon}
          label="Movimientos"
          value={transactionCount}
          subValue={`${categories.length} categorías`}
          highlight
        />
        <MetricCard
          icon={CalendarIcon}
          label="Período"
          value={dateRangeText}
        />
        <MetricCard
          icon={TrendUpIcon}
          label="Categoría Principal"
          value={topCategories[0]?.name || 'N/A'}
          subValue={topCategories[0] ? formatCLP(topCategories[0].total) : ''}
        />
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="panel p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
              Desglose Principal
            </p>
            <h3 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-strong)' }}>
              Top {topCategories.length} Categorías
            </h3>
          </div>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <CategoryBar
                key={category.name}
                category={category}
                maxTotal={maxTotal}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
