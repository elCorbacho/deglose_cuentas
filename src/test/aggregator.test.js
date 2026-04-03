import { describe, expect, it } from 'vitest'
import { group } from '../lib/aggregator.js'

describe('group', () => {
  it('preserves category totals, grand total, and recurring merchants', () => {
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
    ]

    const result = group(transactions)

    expect(result.grandTotal).toBe(25000)
    expect(result.categories.map((category) => category.name)).toEqual(['Supermercado', 'Comidas'])
    expect(result.categories[0]).toMatchObject({ name: 'Supermercado', total: 20000, count: 2 })
    expect(result.categories[0].merchants[0]).toMatchObject({
      name: 'SUPERMERCADO UNO',
      total: 20000,
      count: 2,
      isRecurring: true,
    })
  })
})
