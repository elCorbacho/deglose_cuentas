import { useState, useMemo, useEffect } from 'react'
import FileUpload from './components/organisms/FileUpload.jsx'
import DateFilter from './components/organisms/DateFilter.jsx'
import CategoryList from './components/organisms/CategoryList.jsx'

import Header from './components/organisms/Header.jsx'
import CategoryConfig from './components/organisms/CategoryConfig.jsx'
import Sidebar from './components/organisms/Sidebar.jsx'
import { extractText } from './lib/pdfParser.js'
import { parse } from './lib/transactionExtractor.js'
import { categorize } from './lib/categorizer.js'
import { group } from './lib/aggregator.js'
import { parseDate } from './lib/formatters.js'
import { getCategories } from './services/api.js'
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/categories.js'

// Convert JSON format to object format used by categorizer
function convertCategoriesFromJSON(jsonCategories) {
  const obj = {}
  for (const cat of jsonCategories) {
    obj[cat.name] = {
      icon: cat.icon,
      keywords: cat.keywords || []
    }
  }
  return obj
}

export default function App() {
  const [rawTransactions, setRawTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeView, setActiveView] = useState('upload') // 'upload' | 'analysis' | 'config'
  const [categoriesConfig, setCategoriesConfig] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  

  // Load categories from backend on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        const converted = convertCategoriesFromJSON(data.categories)
        setCategoriesConfig(converted)
        // Cache in localStorage
        localStorage.setItem('cachedCategories', JSON.stringify(converted))
      } catch (err) {
        console.warn('Could not load categories from backend, using cached/default:', err)
        // Try localStorage cache
        const cached = localStorage.getItem('cachedCategories')
        if (cached) {
          setCategoriesConfig(JSON.parse(cached))
        } else {
          // Fall back to default
          setCategoriesConfig(DEFAULT_CATEGORIES)
        }
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  

  const parseInputDateLocal = (dateStr, endOfDay = false) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return null
    if (endOfDay) {
      return new Date(year, month - 1, day, 23, 59, 59, 999)
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  }

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
        setActiveView('upload')
      } else {
        // Use categories from config or default
        const cats = categoriesConfig || DEFAULT_CATEGORIES
        const categorized = categorize(transactions, cats)
        setRawTransactions(categorized)
        setActiveView('analysis')
      }
    } catch (err) {
      console.error('PDF Error:', err)
      setError(`Error al procesar el PDF: ${err.message}. Verifica que sea un estado de cuenta Santander.`)
      setRawTransactions([])
      setActiveView('upload')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!desde && !hasta) return rawTransactions

    const fromDate = desde ? parseInputDateLocal(desde) : null
    const toDate = hasta ? parseInputDateLocal(hasta, true) : null

    return rawTransactions.filter(tx => {
      const txDate = parseDate(tx.fecha)
      if (fromDate && txDate < fromDate) return false
      if (toDate && txDate > toDate) return false
      return true
    })
  }, [rawTransactions, desde, hasta])

  const { categories, grandTotal } = useMemo(
    () => group(filteredTransactions, categoriesConfig),
    [filteredTransactions, categoriesConfig]
  )

  const hasTransactions = rawTransactions.length > 0
  const hasActiveFilters = Boolean(desde || hasta)
  const resetResults = () => {
    setRawTransactions([])
    setFileName('')
    setDesde('')
    setHasta('')
    setError('')
    setActiveView('upload')
  }

  // Navigation handler with guard - redirect to upload if no PDF loaded
  const handleNavigate = (view) => {
    if (view === 'analysis' && !hasTransactions) {
      setActiveView('upload')
    } else {
      setActiveView(view)
    }
  }

  const handleCategoriesSaved = async () => {
    try {
      const data = await getCategories()
      const converted = convertCategoriesFromJSON(data.categories)
      setCategoriesConfig(converted)
      localStorage.setItem('cachedCategories', JSON.stringify(converted))

      if (rawTransactions.length > 0) {
        const categorized = categorize(rawTransactions, converted)
        setRawTransactions(categorized)
      }

      alert('Categorías actualizadas correctamente')
    } catch (err) {
      console.error('Error reloading categories:', err)
      window.location.reload()
    }
  }

  const renderUploadView = () => (
    <>
      <section className="hero-shell view-panel">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <span className="eyebrow">Santander · visión rápida</span>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--text-strong)' }}>
                Entiende tus gastos del mes sin complicarte con el PDF.
              </h1>
              <p className="max-w-xl text-sm leading-5" style={{ color: 'var(--text-base)' }}>
                Sube tu estado y explora gastos con una vista clara y ordenada.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[300px]">
            <div className="panel-muted px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                Flujo
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-base)' }}>
                Subir PDF → filtrar fechas → expandir categorías
              </p>
            </div>

            <div className="panel-muted px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                Alcance
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-base)' }}>
                Solo mejora visual, sin tocar cálculos ni agrupación
              </p>
            </div>
          </div>
        </div>

        {!loading && (
          <div className="relative z-10 mt-4 panel p-4 sm:p-5">
            <div className="mb-3 flex flex-col gap-1">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>Carga tu estado de cuenta</h2>
              <p className="text-sm leading-5" style={{ color: 'var(--text-base)' }}>
                Elige un PDF para ver total, filtros por fecha y gastos por categoría.
              </p>
            </div>

            <FileUpload onFileLoaded={handleFile} />
          </div>
        )}
      </section>

      {loading && (
        <section className="panel status-card status-card--loading view-panel">
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
        <section className="panel status-card status-card--error view-panel">
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
    </>
  )

  const renderAnalysisView = () => (
    <section className="space-y-4 view-panel">
      {hasTransactions ? (
        <>
          <div className="panel p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                    Archivo procesado
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-strong)' }}>
                    Tus resultados ya están listos
                  </h2>
                  <p className="max-w-2xl text-sm leading-5" style={{ color: 'var(--text-base)' }}>
                    Revisa el resumen, ajusta fechas y expande categorías para ver transacciones.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
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

            <div className="mt-4">
              <DateFilter
                desde={desde}
                hasta={hasta}
                onDesdeChange={setDesde}
                onHastaChange={setHasta}
              />
            </div>
          </div>

          <CategoryList categories={categories} />
        </>
      ) : (
        <section className="panel status-card status-card--empty">
          <p className="text-sm" style={{ color: 'var(--text-base)' }}>
            Todavía no hay transacciones para analizar. Cargá un PDF primero.
          </p>
          <button onClick={() => setActiveView('upload')} className="btn-secondary" type="button">
            Ir a Cargar PDF
          </button>
        </section>
      )}
    </section>
  )

  const renderConfigView = () => (
    <section className="panel p-5 view-panel">
      <CategoryConfig onSaved={handleCategoriesSaved} />
    </section>
  )

  const renderCurrentView = () => {
    if (activeView === 'config') return renderConfigView()
    if (activeView === 'analysis') return renderAnalysisView()
    return renderUploadView()
  }

  return (
    <div className="min-h-screen">
      <Header total={activeView === 'analysis' ? grandTotal : undefined} />

      <div className="app-layout">
        <Sidebar
          activeView={activeView}
          hasTransactions={hasTransactions}
          onNavigate={handleNavigate}
        />

        <main className="content-area">
          <div className="app-shell app-shell--compact space-y-4">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  )
}
