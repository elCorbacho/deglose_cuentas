import { describe, expect, it } from 'vitest';
import { group, mergeTransactions } from '../lib/aggregator';

describe('group', () => {
  it('preserves category totals and grand total', () => {
    const transactions = [
      {
        fecha: '01/01/24',
        comercio: 'SUPERMERCADO UNO',
        monto: 12000,
        ciudad: 'SANTIAGO',
        raw: 'tx-1',
        categoria: 'Supermercado',
      },
      {
        fecha: '03/01/24',
        comercio: 'SUPERMERCADO UNO',
        monto: 8000,
        ciudad: 'SANTIAGO',
        raw: 'tx-2',
        categoria: 'Supermercado',
      },
      {
        fecha: '04/01/24',
        comercio: 'CAFETERIA CENTRO',
        monto: 5000,
        ciudad: 'SANTIAGO',
        raw: 'tx-3',
        categoria: 'Comidas',
      },
    ];

    const result = group(transactions);

    expect(result.grandTotal).toBe(25000);
    expect(result.categories.map((category) => category.name)).toEqual(['Supermercado', 'Comidas']);
    expect(result.categories[0]).toMatchObject({ name: 'Supermercado', total: 20000, count: 2 });
    expect(result.categories[0].transactions).toHaveLength(2);
    expect(result.categories[0].transactions[0].comercio).toBe('SUPERMERCADO UNO');
  });

  it('preserves category totals after removing merchant grouping', () => {
    const txs = [
      {
        fecha: '01 Mar',
        comercio: 'JUMBO',
        monto: 30000,
        ciudad: 'SANTIAGO',
        raw: 'a',
        categoria: 'Supermercado',
      },
      {
        fecha: '05 Mar',
        comercio: 'JUMBO',
        monto: 25000,
        ciudad: 'SANTIAGO',
        raw: 'b',
        categoria: 'Supermercado',
      },
      {
        fecha: '10 Mar',
        comercio: 'UNIMARC',
        monto: 40000,
        ciudad: 'SANTIAGO',
        raw: 'c',
        categoria: 'Supermercado',
      },
    ];
    const result = group(txs);

    expect(result.grandTotal).toBe(95000);
    expect(result.categories[0].total).toBe(95000);
    expect(result.categories[0].count).toBe(3);
  });

  it('sorts transactions by date descending within each category', () => {
    const txs = [
      {
        fecha: '01 Mar',
        comercio: 'JUMBO',
        monto: 30000,
        ciudad: 'SANTIAGO',
        raw: 'a',
        categoria: 'Supermercado',
      },
      {
        fecha: '15 Mar',
        comercio: 'UNIMARC',
        monto: 25000,
        ciudad: 'SANTIAGO',
        raw: 'b',
        categoria: 'Supermercado',
      },
      {
        fecha: '10 Mar',
        comercio: 'LIDER',
        monto: 40000,
        ciudad: 'SANTIAGO',
        raw: 'c',
        categoria: 'Supermercado',
      },
    ];
    const result = group(txs);

    expect(result.categories[0].transactions).toBeDefined();
    expect(result.categories[0].transactions).toHaveLength(3);
    // Verify sorted descending by chronological timestamp
    expect(result.categories[0].transactions[0].fecha).toBe('15 Mar');
    expect(result.categories[0].transactions[1].fecha).toBe('10 Mar');
    expect(result.categories[0].transactions[2].fecha).toBe('01 Mar');
  });

  it('sorts DD/MM/YY dates by descending chronology across year boundaries', () => {
    const txs = [
      {
        fecha: '31/12/23',
        comercio: 'TIENDA A',
        monto: 1000,
        ciudad: 'SANTIAGO',
        raw: 'a',
        categoria: 'Otros',
      },
      {
        fecha: '01/01/24',
        comercio: 'TIENDA B',
        monto: 2000,
        ciudad: 'SANTIAGO',
        raw: 'b',
        categoria: 'Otros',
      },
      {
        fecha: '15/01/24',
        comercio: 'TIENDA C',
        monto: 3000,
        ciudad: 'SANTIAGO',
        raw: 'c',
        categoria: 'Otros',
      },
    ];

    const result = group(txs);

    expect(result.categories[0].transactions.map((tx) => tx.fecha)).toEqual([
      '15/01/24',
      '01/01/24',
      '31/12/23',
    ]);
  });

  it('sorts DD/MM/YY dates by descending chronology across month boundaries', () => {
    const txs = [
      {
        fecha: '31/01/24',
        comercio: 'TIENDA X',
        monto: 1000,
        ciudad: 'SANTIAGO',
        raw: 'a',
        categoria: 'Otros',
      },
      {
        fecha: '01/02/24',
        comercio: 'TIENDA Y',
        monto: 2000,
        ciudad: 'SANTIAGO',
        raw: 'b',
        categoria: 'Otros',
      },
      {
        fecha: '15/01/24',
        comercio: 'TIENDA Z',
        monto: 3000,
        ciudad: 'SANTIAGO',
        raw: 'c',
        categoria: 'Otros',
      },
    ];

    const result = group(txs);

    expect(result.categories[0].transactions.map((tx) => tx.fecha)).toEqual([
      '01/02/24',
      '31/01/24',
      '15/01/24',
    ]);
  });

  it('keeps deterministic order when slash dates are invalid', () => {
    const txs = [
      { fecha: 'xx/01/24', comercio: 'INVALID A', monto: 1000, categoria: 'Otros', raw: 'a' },
      { fecha: '01/02/24', comercio: 'VALID', monto: 2000, categoria: 'Otros', raw: 'b' },
      { fecha: '01/yy/24', comercio: 'INVALID B', monto: 3000, categoria: 'Otros', raw: 'c' },
    ];

    const result = group(txs);

    expect(result.categories[0].transactions.map((tx) => tx.comercio)).toEqual([
      'VALID',
      'INVALID A',
      'INVALID B',
    ]);
  });
});

describe('mergeTransactions', () => {
  it('merges two arrays of transactions into a single flat list', () => {
    const arr1 = [
      { fecha: '01/01/24', comercio: 'JUMBO', monto: 10000, categoria: 'Supermercado' },
      { fecha: '02/01/24', comercio: 'COPEC', monto: 5000, categoria: 'Combustible' },
    ];
    const arr2 = [
      { fecha: '03/01/24', comercio: 'STARBUCKS', monto: 3000, categoria: 'Cafeterías' },
    ];

    const result = mergeTransactions([arr1, arr2]);

    expect(result).toHaveLength(3);
    expect(result[0].comercio).toBe('JUMBO');
    expect(result[1].comercio).toBe('COPEC');
    expect(result[2].comercio).toBe('STARBUCKS');
  });

  it('returns empty array when all input arrays are empty', () => {
    const result = mergeTransactions([[], []]);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('handles a single array without modification', () => {
    const arr = [{ fecha: '01/01/24', comercio: 'LIDER', monto: 20000, categoria: 'Supermercado' }];

    const result = mergeTransactions([arr]);

    expect(result).toHaveLength(1);
    expect(result[0].comercio).toBe('LIDER');
  });

  it('preserves duplicates — design decision: duplicates are visible', () => {
    const tx = { fecha: '01/01/24', comercio: 'DUPLICADO', monto: 1000, categoria: 'Otros' };
    const result = mergeTransactions([[tx], [tx]]);

    expect(result).toHaveLength(2);
    expect(result[0].comercio).toBe('DUPLICADO');
    expect(result[1].comercio).toBe('DUPLICADO');
  });

  it('returns empty array when called with empty outer array', () => {
    const result = mergeTransactions([]);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
