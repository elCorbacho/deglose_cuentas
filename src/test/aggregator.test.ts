import { describe, expect, it } from 'vitest';
import { group } from '../lib/aggregator';

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
