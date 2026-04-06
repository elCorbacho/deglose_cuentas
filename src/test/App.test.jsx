import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { extractText } from '../lib/pdfParser.js'
import { parse } from '../lib/transactionExtractor.js'
import { categorize } from '../lib/categorizer.js'
import { getCategories } from '../services/api.js'

vi.mock('../lib/pdfParser.js', () => ({
  extractText: vi.fn(),
}))

vi.mock('../lib/transactionExtractor.js', () => ({
  parse: vi.fn(),
}))

vi.mock('../lib/categorizer.js', () => ({
  categorize: vi.fn(),
}))

vi.mock('../services/api.js', () => ({
  getCategories: vi.fn(),
  saveCategories: vi.fn(),
  exportCategories: vi.fn(),
  getBackup: vi.fn(),
}))

const parsedTransactions = [
  {
    fecha: '05/01/24',
    comercio: 'SUPERMERCADO UNO',
    monto: 12000,
    ciudad: 'SANTIAGO',
    raw: 'parsed-1',
  },
  {
    fecha: '06/01/24',
    comercio: 'CAFETERIA CENTRO',
    monto: 5000,
    ciudad: 'SANTIAGO',
    raw: 'parsed-2',
  },
]

const categorizedTransactions = [
  { ...parsedTransactions[0], categoria: 'Supermercado' },
  { ...parsedTransactions[1], categoria: 'Comidas' },
]

function createPdfFile() {
  return new File(['%PDF-1.4'], 'cartola.pdf', { type: 'application/pdf' })
}

async function uploadPdf(container, file = createPdfFile()) {
  const input = container.querySelector('input[type="file"]')
  await userEvent.upload(input, file)
}

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('App', () => {
  beforeEach(() => {
    extractText.mockResolvedValue('pdf text')
    parse.mockReturnValue(parsedTransactions)
    categorize.mockReturnValue(categorizedTransactions)
    getCategories.mockResolvedValue({
      categories: [
        { name: 'Supermercado', icon: '🛒', keywords: ['SUPERMERCADO'] },
        { name: 'Comidas', icon: '🍽️', keywords: ['CAFETERIA'] },
      ],
    })
  })

  it('renders sidebar with upload active by default', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: /cargar pdf/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /análisis/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /config/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cargar pdf/i })).toHaveClass('active')
  })

  it('keeps upload view when clicking análisis without transactions', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /análisis/i }))

    expect(screen.getByRole('heading', { name: /carga tu estado de cuenta/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cargar pdf/i })).toHaveClass('active')
  })

  it('lets navigate to config view and back to upload', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /config/i }))
    expect(await screen.findByText(/configuración de categorías/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /cargar pdf/i }))
    expect(screen.getByRole('heading', { name: /carga tu estado de cuenta/i })).toBeInTheDocument()
  })

  it('renders the onboarding hierarchy before any upload', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /entiende tus gastos del mes/i })).toBeInTheDocument()
    expect(screen.getByText(/sube tu estado/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /carga tu estado de cuenta/i })).toBeInTheDocument()
    expect(screen.getByText(/seleccionar pdf/i)).toBeInTheDocument()
  })

  it('shows an exclusive loading state while the PDF is being processed', async () => {
    const deferred = createDeferred()
    extractText.mockReturnValue(deferred.promise)

    const { container } = render(<App />)
    await uploadPdf(container)

    expect(screen.getByText(/procesando tu pdf/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /carga tu estado de cuenta/i })).not.toBeInTheDocument()

    deferred.resolve('pdf text')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /tus resultados ya están listos/i })).toBeInTheDocument()
    })
  })

  it('shows a recoverable error state and allows re-upload after empty extraction', async () => {
    parse.mockReturnValue([])

    const { container } = render(<App />)
    await uploadPdf(container)

    expect(await screen.findByText(/no pudimos usar este archivo/i)).toBeInTheDocument()
    expect(screen.getByText(/no se encontraron transacciones en el pdf/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /intentar con otro pdf/i }))

    expect(screen.getByRole('heading', { name: /carga tu estado de cuenta/i })).toBeInTheDocument()
    expect(screen.queryByText(/no pudimos usar este archivo/i)).not.toBeInTheDocument()
  })

  it('renders the results overview after a successful upload', async () => {
    const { container } = render(<App />)
    await uploadPdf(container)

    expect(await screen.findByRole('heading', { name: /tus resultados ya están listos/i })).toBeInTheDocument()
    expect(screen.getByText(/📄 cartola\.pdf/i)).toBeInTheDocument()
    expect(screen.getByText(/2 transacciones detectadas/i)).toBeInTheDocument()
    expect(screen.getByText(/gastos agrupados para explorar en detalle/i)).toBeInTheDocument()
    expect(screen.getByText('$17.000')).toBeInTheDocument()
  })

  it('shows a filter-specific empty state and keeps reset visible', async () => {
    const { container } = render(<App />)
    await uploadPdf(container)

    await screen.findByRole('heading', { name: /tus resultados ya están listos/i })

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2024-02-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2024-02-05' } })

    expect(await screen.findByText(/no encontramos resultados para ese filtro/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /limpiar filtro/i })).toBeInTheDocument()
  })

  it('lets users expand and collapse category details for readability', async () => {
    const { container } = render(<App />)
    await uploadPdf(container)

    await screen.findByRole('heading', { name: /tus resultados ya están listos/i })

    await userEvent.click(screen.getByRole('button', { name: /supermercado/i }))

    expect(screen.getByText(/supermercado uno/i)).toBeInTheDocument()
    expect(screen.getByText(/05\/01\/24/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /supermercado/i }))

    await waitFor(() => {
      expect(screen.queryByText(/supermercado uno/i)).not.toBeInTheDocument()
    })
  })
})
