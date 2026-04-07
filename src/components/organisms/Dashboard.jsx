/**
 * Dashboard Molecule
 * Displays financial summary with key metrics and visualizations
 */

import { formatCLP, formatDate, parseDate } from '../../lib/formatters.js'
import { TrendingUp, Calendar, Receipt, Wallet, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'

function MetricCard({ icon: Icon, label, value, subValue, highlight, tooltip }) {
  const cardContent = (
    <div className="dashboard-metric-card panel p-4">
      <div className="flex items-start gap-3">
         <div className={`dashboard-metric-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${highlight ? 'bg-blue-50' : 'bg-slate-100'}`}>
           <Icon />
         </div>
         <div className="min-w-0 flex-1">
           <div className="flex items-center gap-1">
             <p className="dashboard-metric-label text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
               {label}
             </p>
             {tooltip && (
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Info className="w-3 h-3" style={{ color: 'var(--text-soft)', cursor: 'help' }} />
                 </TooltipTrigger>
                 <TooltipContent>{tooltip}</TooltipContent>
               </Tooltip>
             )}
           </div>
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

  return cardContent
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
             <Wallet className="w-7 h-7 text-white" />
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
           icon={Receipt}
           label="Movimientos"
           value={transactionCount}
           subValue={`${categories.length} categorías`}
           highlight
           tooltip="Número total de transacciones en el período seleccionado"
         />
         <MetricCard
           icon={Calendar}
           label="Período"
           value={dateRangeText}
           tooltip="Rango de fechas aplicado al análisis"
         />
         <MetricCard
           icon={TrendingUp}
           label="Categoría Principal"
           value={topCategories[0]?.name || 'N/A'}
           subValue={topCategories[0] ? formatCLP(topCategories[0].total) : ''}
           tooltip="La categoría con mayor gasto en el período"
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
