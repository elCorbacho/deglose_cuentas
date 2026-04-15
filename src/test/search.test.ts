import { describe, expect, it } from 'vitest';
import { filterTransactions } from '../lib/search';
import type { PersistedTransaction } from '../types';

const transactions: PersistedTransaction[] = [
  { fecha: '01/01/24', comercio: 'SUPERMERCADO JUMBO', monto: 15000, categoria: 'Supermercado' },
  { fecha: '02/01/24', comercio: 'STARBUCKS PROVIDENCIA', monto: 3500, categoria: 'Cafeterías' },
  { fecha: '03/01/24', comercio: 'COPEC GASOLINA', monto: 50000, categoria: 'Combustible' },
  { fecha: '04/01/24', comercio: 'FARMACIA CRUZ VERDE', monto: 12000, categoria: 'Salud' },
];

describe('filterTransactions', () => {
  describe('commerce match', () => {
    it('returns transactions matching the search term in comercio', () => {
      const result = filterTransactions(transactions, 'STARBUCKS');
      expect(result).toHaveLength(1);
      expect(result[0].comercio).toBe('STARBUCKS PROVIDENCIA');
    });

    it('matches partial comercio text', () => {
      const result = filterTransactions(transactions, 'SUPERMERCADO');
      expect(result).toHaveLength(1);
      expect(result[0].comercio).toBe('SUPERMERCADO JUMBO');
    });
  });

  describe('case insensitivity', () => {
    it('matches regardless of letter case', () => {
      const result = filterTransactions(transactions, 'starbucks');
      expect(result).toHaveLength(1);
      expect(result[0].comercio).toBe('STARBUCKS PROVIDENCIA');
    });

    it('matches mixed case search terms', () => {
      const result = filterTransactions(transactions, 'FaRmAciA');
      expect(result).toHaveLength(1);
      expect(result[0].comercio).toBe('FARMACIA CRUZ VERDE');
    });
  });

  describe('monto match', () => {
    it('matches transactions by exact monto string', () => {
      const result = filterTransactions(transactions, '3500');
      expect(result).toHaveLength(1);
      expect(result[0].comercio).toBe('STARBUCKS PROVIDENCIA');
    });

    it('matches monto with $ prefix and thousands separator', () => {
      const result = filterTransactions(transactions, '$15.000');
      expect(result).toHaveLength(1);
      expect(result[0].monto).toBe(15000);
    });

    it('matches monto with thousands separator without $ prefix', () => {
      const result = filterTransactions(transactions, '15.000');
      expect(result).toHaveLength(1);
      expect(result[0].monto).toBe(15000);
    });
  });

  describe('monto contains match', () => {
    it('matches transactions when search term is a partial amount (substring of normalized monto)', () => {
      // "1.5" normalizes to "15", which is contained in "15000" → matches SUPERMERCADO JUMBO
      const result = filterTransactions(transactions, '1.5');
      expect(result.length).toBeGreaterThanOrEqual(1);
      const matchedMontos = result.map((tx) => tx.monto);
      expect(matchedMontos).toContain(15000);
    });

    it('matches with Chilean-style partial notation: "1.2" finds monto 1250', () => {
      // "1.2" normalizes to "12"; "1250" contains "12" → match
      const txsWithSmall: PersistedTransaction[] = [
        { fecha: '01/01/24', comercio: 'TIENDA CHICA', monto: 1250, categoria: 'Otros' },
        { fecha: '02/01/24', comercio: 'OTRO LUGAR', monto: 5000, categoria: 'Otros' },
      ];
      const result = filterTransactions(txsWithSmall, '1.2');
      expect(result).toHaveLength(1);
      expect(result[0].monto).toBe(1250);
    });

    it('does NOT match when partial amount is not contained in normalized monto', () => {
      // "9.9" normalizes to "99"; none of 15000, 3500, 50000, 12000 contains "99"
      const result = filterTransactions(transactions, '9.9');
      expect(result).toHaveLength(0);
    });
  });

  describe('no results', () => {
    it('returns empty array when no transactions match the term', () => {
      const result = filterTransactions(transactions, 'MCDONALDS');
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('empty and whitespace terms', () => {
    it('returns all transactions when search term is empty string', () => {
      const result = filterTransactions(transactions, '');
      expect(result).toHaveLength(4);
    });

    it('returns all transactions when search term is only whitespace', () => {
      const result = filterTransactions(transactions, '   ');
      expect(result).toHaveLength(4);
    });
  });

  describe('regex special characters', () => {
    it('treats regex special chars as literal text (does not throw)', () => {
      expect(() => filterTransactions(transactions, '.*+?[](){}^$|')).not.toThrow();
    });

    it('returns empty array when special char literal does not match any transaction', () => {
      const result = filterTransactions(transactions, '.*+?');
      expect(result).toHaveLength(0);
    });

    it('matches a transaction containing a literal dot', () => {
      const txsWithDot: PersistedTransaction[] = [
        ...transactions,
        { fecha: '05/01/24', comercio: 'TIENDA 3.0', monto: 2000, categoria: 'Otros' },
      ];
      const result = filterTransactions(txsWithDot, '3.0');
      // Should match 'TIENDA 3.0' but NOT 'STARBUCKS' etc. (dot is literal)
      expect(result).toHaveLength(1);
      expect(result[0].comercio).toBe('TIENDA 3.0');
    });
  });
});
