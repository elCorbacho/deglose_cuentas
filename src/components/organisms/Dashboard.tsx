/**
 * Dashboard Molecule
 * Displays financial summary with key metrics and visualizations
 */

import { Fragment, useMemo } from 'react';
import type { ComponentType, SVGProps } from 'react';
import type { CategoryGroup, DateRange, PersistedTransaction } from '../../types';
import { formatCLP, formatDate } from '../../lib/formatters';
import { TrendingUp, Calendar, Receipt, Wallet, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import SearchBar from '../molecules/SearchBar';
import ExportButton from '../atoms/ExportButton';
import { filterTransactions } from '../../lib/search';
import { exportToCsv } from '../../lib/csvExporter';

interface MetricCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
  subValue?: string;
  highlight?: boolean;
  tooltip?: string;
}

interface CategoryBarProps {
  category: CategoryGroup;
  maxTotal: number;
  index: number;
}

interface DashboardProps {
  categories: CategoryGroup[];
  grandTotal: number;
  transactionCount: number;
  dateRange: DateRange;
  allTransactions?: PersistedTransaction[];
  searchTerm?: string;
  onSearch?: (term: string) => void;
}

function MetricCard({ icon: Icon, label, value, subValue, highlight, tooltip }: MetricCardProps) {
  const cardContent = (
    <div className="dashboard-metric-card panel cursor-pointer p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-lg dark:hover:border-blue-800 dark:hover:shadow-blue-900/20">
      <div className="flex items-start gap-3">
        <div
          className={`dashboard-metric-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${highlight ? 'bg-blue-50' : 'bg-slate-100'}`}
        >
          <Icon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p
              className="dashboard-metric-label text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--text-soft)' }}
            >
              {label}
            </p>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="inline-flex">
                    <Info
                      className="h-3 w-3"
                      style={{ color: 'var(--text-soft)', cursor: 'help' }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <p
            className="dashboard-metric-value text-xl font-bold tracking-tight"
            style={{ color: 'var(--text-strong)' }}
          >
            {value}
          </p>
          {subValue && (
            <p className="dashboard-metric-sub mt-1 text-xs" style={{ color: 'var(--text-soft)' }}>
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return cardContent;
}

function CategoryBar({ category, maxTotal, index }: CategoryBarProps) {
  const percentage = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0;
  const colors = [
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="cursor-pointer space-y-2 transition-opacity duration-200 hover:opacity-75 dark:hover:opacity-90"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.07, duration: 0.3, ease: 'easeOut' }}
      role="progressbar"
      aria-label={`${category.name}: ${formatCLP(category.total)}`}
      aria-valuenow={Math.round((category.total / maxTotal) * 100) || 0}
      aria-valuemin={0}
      aria-valuemax={100}
    >
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
    </motion.div>
  );
}

export default function Dashboard({
  categories,
  grandTotal,
  transactionCount,
  dateRange,
  allTransactions = [],
  searchTerm = '',
  onSearch,
}: DashboardProps) {
  const filteredForExport = useMemo(
    () => filterTransactions(allTransactions, searchTerm),
    [allTransactions, searchTerm]
  );

  const hasActiveSearch = searchTerm.trim() !== '';
  const isEmptySearchResult = hasActiveSearch && filteredForExport.length === 0;

  const topCategories = categories.slice(0, 5);
  const maxTotal = topCategories[0]?.total || 0;

  const dateRangeText = (() => {
    if (!dateRange.desde && !dateRange.hasta) return 'Todas las fechas';
    if (dateRange.desde && dateRange.hasta) {
      return `${formatDate(dateRange.desde)} - ${formatDate(dateRange.hasta)}`;
    }
    if (dateRange.desde) return `Desde ${formatDate(dateRange.desde)}`;
    return `Hasta ${formatDate(dateRange.hasta)}`;
  })();

  return (
    <section className="space-y-6" aria-label="Resumen financiero">
      {/* Main Total Card */}
      <motion.article
        className="panel dashboard-total-card p-6"
        aria-label={`Total gastado ${formatCLP(grandTotal)} en ${transactionCount} ${transactionCount === 1 ? 'transacción' : 'transacciones'}`}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="dashboard-total-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-1">
            <p
              className="dashboard-total-label text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--text-soft)' }}
            >
              Total Gastado
            </p>
            <p
              className="dashboard-total-value mono-num text-4xl font-bold tracking-tight"
              style={{ color: 'var(--text-strong)' }}
            >
              {formatCLP(grandTotal)}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
              {transactionCount} {transactionCount === 1 ? 'transacción' : 'transacciones'}
            </p>
          </div>
        </div>
      </motion.article>

      {/* Search and Export toolbar */}
      {onSearch && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <SearchBar onSearch={onSearch} />
          </div>
          <ExportButton
            onClick={() => exportToCsv(filteredForExport)}
            disabled={filteredForExport.length === 0}
          />
        </div>
      )}

      {/* Empty search state */}
      {isEmptySearchResult && onSearch && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
            No se encontraron transacciones
          </p>
          <button
            type="button"
            onClick={() => onSearch('')}
            className="text-sm font-medium underline"
            style={{ color: 'var(--text-base)' }}
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Métricas de resumen"
      >
        {[
          {
            icon: Receipt,
            label: 'Movimientos',
            value: transactionCount,
            subValue: `${categories.length} categorías`,
            highlight: true,
            tooltip: 'Número total de transacciones en el período seleccionado',
          },
          {
            icon: Calendar,
            label: 'Período',
            value: dateRangeText,
            tooltip: 'Rango de fechas aplicado al análisis',
          },
          {
            icon: TrendingUp,
            label: 'Categoría Principal',
            value: topCategories[0]?.name || 'N/A',
            subValue: topCategories[0] ? formatCLP(topCategories[0].total) : '',
            tooltip: 'La categoría con mayor gasto en el período',
          },
        ].map((props, i) => (
          <motion.div
            key={props.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: 'easeOut' }}
          >
            <MetricCard {...props} />
          </motion.div>
        ))}
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <article className="panel p-5" aria-label="Top categorías por gasto">
          <div className="mb-4">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--text-soft)' }}
            >
              Desglose Principal
            </p>
            <h3
              className="text-lg font-semibold tracking-tight"
              style={{ color: 'var(--text-strong)' }}
            >
              Top {topCategories.length} Categorías
            </h3>
          </div>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <Fragment key={category.name}>
                <CategoryBar category={category} maxTotal={maxTotal} index={index} />
              </Fragment>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}
