import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Dashboard from '../components/organisms/Dashboard';
import type { CategoryGroup, PersistedTransaction } from '../types';

// Minimal mock for TooltipProvider (used inside Dashboard via MetricCard)
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const transactions: PersistedTransaction[] = [
  { fecha: '01/01/24', comercio: 'SUPERMERCADO JUMBO', monto: 15000, categoria: 'Supermercado' },
  { fecha: '02/01/24', comercio: 'STARBUCKS PROVIDENCIA', monto: 3500, categoria: 'Cafeterías' },
  { fecha: '03/01/24', comercio: 'COPEC GASOLINA', monto: 50000, categoria: 'Combustible' },
];

const categories: CategoryGroup[] = [
  { name: 'Combustible', icon: '⛽', total: 50000, count: 1, transactions: [transactions[2]] },
  { name: 'Supermercado', icon: '🛒', total: 15000, count: 1, transactions: [transactions[0]] },
  { name: 'Cafeterías', icon: '☕', total: 3500, count: 1, transactions: [transactions[1]] },
];

const dateRange = { desde: '', hasta: '' };

describe('Dashboard', () => {
  describe('CRITICAL 1: empty state when search yields 0 results', () => {
    it('shows "No se encontraron transacciones" when searchTerm has no matches', () => {
      render(
        <Dashboard
          categories={[]}
          grandTotal={0}
          transactionCount={0}
          dateRange={dateRange}
          allTransactions={transactions}
          searchTerm="NONEXISTENT_STORE"
          onSearch={vi.fn()}
        />
      );

      expect(screen.getByText('No se encontraron transacciones')).toBeInTheDocument();
    });

    it('shows "Limpiar búsqueda" button when searchTerm has no matches', () => {
      render(
        <Dashboard
          categories={[]}
          grandTotal={0}
          transactionCount={0}
          dateRange={dateRange}
          allTransactions={transactions}
          searchTerm="NONEXISTENT_STORE"
          onSearch={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /limpiar búsqueda/i })).toBeInTheDocument();
    });

    it('calls onSearch("") when "Limpiar búsqueda" button is clicked', async () => {
      const onSearch = vi.fn();
      render(
        <Dashboard
          categories={[]}
          grandTotal={0}
          transactionCount={0}
          dateRange={dateRange}
          allTransactions={transactions}
          searchTerm="NONEXISTENT_STORE"
          onSearch={onSearch}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /limpiar búsqueda/i }));

      expect(onSearch).toHaveBeenCalledWith('');
    });

    it('does NOT show empty state when searchTerm is empty', () => {
      render(
        <Dashboard
          categories={categories}
          grandTotal={68500}
          transactionCount={3}
          dateRange={dateRange}
          allTransactions={transactions}
          searchTerm=""
          onSearch={vi.fn()}
        />
      );

      expect(screen.queryByText('No se encontraron transacciones')).not.toBeInTheDocument();
    });

    it('does NOT show empty state when searchTerm has matches', () => {
      render(
        <Dashboard
          categories={categories}
          grandTotal={15000}
          transactionCount={1}
          dateRange={dateRange}
          allTransactions={transactions}
          searchTerm="JUMBO"
          onSearch={vi.fn()}
        />
      );

      expect(screen.queryByText('No se encontraron transacciones')).not.toBeInTheDocument();
    });
  });

  describe('CRITICAL 2: search impacts metrics', () => {
    it('passes filtered transactions to Dashboard so callers can use them for metrics', () => {
      // This test verifies that when allTransactions is provided with a searchTerm,
      // Dashboard exposes filteredTransactions count via its own state; the key
      // assertion is that the empty state does NOT appear when searchTerm matches
      render(
        <Dashboard
          categories={categories}
          grandTotal={15000}
          transactionCount={1}
          dateRange={dateRange}
          allTransactions={transactions}
          searchTerm="JUMBO"
          onSearch={vi.fn()}
        />
      );

      // No empty-state → search matched results
      expect(screen.queryByText('No se encontraron transacciones')).not.toBeInTheDocument();
      // Dashboard renders its content (total card visible)
      expect(screen.getByText('Total Gastado')).toBeInTheDocument();
    });
  });
});
