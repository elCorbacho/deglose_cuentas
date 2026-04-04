import { useState, useMemo, useEffect } from 'react'
import FileUpload from './components/FileUpload.jsx'
import DateFilter from './components/DateFilter.jsx'
import CategoryList from './components/CategoryList.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import Header from './components/Header.jsx'
import { extractText } from './lib/pdfParser.js'
import { parse } from './lib/transactionExtractor.js'
import { categorize } from './lib/categorizer.js'
import { group } from './lib/aggregator.js'
import { parseDate } from './lib/formatters.js'

export default function App() {
  const [rawTransactions, setRawTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [fileName, setFileName] = useState('')
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  const handleFile = async (file) => {
    setLoading(true)
    setError('')
    setFileName(file.name)

    try {
      const text = await extractText(file)

      const transactions = parse(text)

      if (transactions.length === 0) {
        setError('No se encontraron transacciones en el PDF.')
        setRawTransactions([])
      } else {
        const categorized = categorize(transactions)
        setRawTransactions(categorized)
      }
    } catch (err) {
      console.error('PDF Error:', err)
      setError(`Error al procesar el PDF: ${err.message}. Verifica que sea un estado de cuenta Santander.`)
      setRawTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!desde && !hasta) return rawTransactions

    return rawTransactions.filter(tx => {
      const txDate = parseDate(tx.fecha)
      if (desde && txDate < new Date(desde)) return false
      if (hasta && txDate > new Date(hasta)) return false
      return true
    })
  }, [rawTransactions, desde, hasta])

  const { categories, grandTotal } = useMemo(
    () => group(filteredTransactions),
    [filteredTransactions]
  )

  const hasTransactions = rawTransactions.length > 0
  const hasActiveFilters = Boolean(desde || hasta)
  const resetResults = () => {
    setRawTransactions([])
    setFileName('')
    setDesde('')
    setHasta('')
    setError('')
  }

  return (
    <div className="min-h-screen">
      <Header theme={theme} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <SummaryBar total={grandTotal} />

      <main className="app-shell space-y-6" style={{ paddingTop: '1.25rem' }}>
        <section className="hero-shell">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="eyebrow">Santander · visión rápida</span>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: 'var(--text-strong)' }}>
                  Entendé tus gastos del mes sin pelearte con el PDF.
                </h1>
                <p className="max-w-xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-base)' }}>
                  Subí tu estado de cuenta, revisá el total del período y explorá categorías,
                  comercios y movimientos con una vista más clara y ordenada.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="panel-muted px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                  Flujo
                </p>
                <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                  Subir PDF → filtrar fechas → expandir categorías
                </p>
              </div>

              <div className="panel-muted px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                  Alcance
                </p>
                <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                  Solo mejora visual, sin tocar cálculos ni agrupación
                </p>
              </div>
            </div>
          </div>

          {!hasTransactions && !loading && (
            <div className="relative z-10 mt-6 panel p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-2">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>Cargá tu estado de cuenta</h2>
                <p className="text-sm leading-6" style={{ color: 'var(--text-base)' }}>
                  Elegí un PDF de Santander para ver el total general, aplicar filtros por fecha
                  y navegar los gastos agrupados por categoría.
                </p>
              </div>

              <FileUpload onFileLoaded={handleFile} />
            </div>
          )}
        </section>

        {loading && (
          <section className="panel status-card status-card--loading">
            <div className="inline-block h-12 w-12 animate-spin rounded-full spinner-ring"></div>

            <div className="space-y-2">
              <p className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>Procesando tu PDF</p>
              <p className="max-w-md text-sm leading-6" style={{ color: 'var(--text-base)' }}>
                Estamos leyendo el archivo y reorganizando tus movimientos para mostrarlos por categoría.
              </p>
            </div>
          </section>
        )}

        {error && !loading && (
          <section className="panel status-card status-card--error">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl error-icon">
              !
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>No pudimos usar este archivo</p>
              <p className="max-w-xl text-sm leading-6" style={{ color: 'var(--text-base)' }}>{error}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={resetResults} className="btn-secondary" type="button">
                Intentar con otro PDF
              </button>
              <span className="text-xs" style={{ color: 'var(--text-soft)' }}>
                La zona de carga vuelve a quedar disponible arriba.
              </span>
            </div>
          </section>
        )}

        {hasTransactions && !loading && (
          <section className="space-y-5">
            <div className="panel p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                      Archivo procesado
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-strong)' }}>
                      Tus resultados ya están listos
                    </h2>
                    <p className="max-w-2xl text-sm leading-6" style={{ color: 'var(--text-base)' }}>
                      Revisá el resumen general, ajustá el rango de fechas si hace falta y expandí
                      cada categoría para ver las transacciones en detalle.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="badge-soft">📄 {fileName}</span>
                    <span className="badge-soft">{rawTransactions.length} transacciones detectadas</span>
                    {hasActiveFilters && (
                      <span className="badge-soft">
                        {filteredTransactions.length} visibles en el rango actual
                      </span>
                    )}
                  </div>
                </div>

                <button onClick={resetResults} className="btn-secondary shrink-0" type="button">
                  Cargar otro PDF
                </button>
              </div>

              <div className="mt-5">
                <DateFilter
                  desde={desde}
                  hasta={hasta}
                  onDesdeChange={setDesde}
                  onHastaChange={setHasta}
                />
              </div>
            </div>
            <CategoryList categories={categories} />
          </section>
        )}
      </main>
    </div>
  )
}
