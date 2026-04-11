/**
 * CategoryItem Molecule
 * Displays a category with expandable transaction list
 */

import { useState } from 'react';
import type { CategoryGroup, PersistedTransaction } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionRow from './TransactionRow';
import { formatCLP } from '../../lib/formatters';
import { DEFAULT_CATEGORY_ICON } from '../../data/categories';

// Chevron icon for expand/collapse
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-4 w-4"
      animate={{ rotate: expanded ? 90 : 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </motion.svg>
  );
}

export default function CategoryItem({ category }: { category: CategoryGroup }) {
  const [expanded, setExpanded] = useState(false);
  const icon = category.icon || DEFAULT_CATEGORY_ICON;

  return (
    <div className="panel category-panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="category-item-button flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left"
        type="button"
        aria-expanded={expanded}
      >
        {/* Left: chevron + name + count */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="arrow-icon inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors duration-200">
            <ChevronIcon expanded={expanded} />
          </span>
          <span className="shrink-0 text-base">{icon}</span>
          <span className="truncate text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
            {category.name}
          </span>
          <span className="badge-soft badge-soft--compact shrink-0">
            {category.count} {category.count === 1 ? 'mov.' : 'movs.'}
          </span>
        </div>

        {/* Right: total amount */}
        <div className="shrink-0 text-right">
          <p
            className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--text-soft)' }}
          >
            Total
          </p>
          <span className="mono-num text-sm font-bold" style={{ color: 'var(--text-strong)' }}>
            {formatCLP(category.total)}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="expanded-content px-2.5 py-2 sm:px-3">
              <div className="tx-table-header">
                <div className="tx-table-columns">
                  <span>Nombre transacción</span>
                  <span>Fecha</span>
                  <span>Monto</span>
                </div>
              </div>

              <div className="transaction-divider-container">
                {category.transactions.map((tx: PersistedTransaction, index: number) => (
                  <motion.div
                    key={`${tx.fecha}-${tx.comercio}-${tx.monto}-${tx.ciudad}-${index}`}
                    className={index > 0 ? 'transaction-divider' : ''}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                  >
                    <TransactionRow tx={tx} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
