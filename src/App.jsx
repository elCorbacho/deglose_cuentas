import { useState, useMemo, useEffect } from 'react'
import FileUpload from './components/organisms/FileUpload.jsx'
import DateFilter from './components/organisms/DateFilter.jsx'
import CategoryList from './components/organisms/CategoryList.jsx'

import Header from './components/organisms/Header.jsx'
import CategoryConfig from './components/organisms/CategoryConfig.jsx'
import Sidebar from './components/sidebar/Sidebar.jsx'
import { SidebarProvider, useSidebar } from './components/SidebarContext.jsx'
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

function AppContent() {
  const { currentView, setView } = useSidebar()
  const [rawTransactions, setRawTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [fileName, setFileName] = useState('')
  const [categoriesConfig, setCategoriesConfig] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  

  // Initialize hash routing on mount and listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove '#'
      if (hash === 'settings') {
        setView('settings')
      } else if (hash === 'transactions' || hash === '') {
        setView('transactions')
      }
    }

    // Set initial view from hash or default to transactions
    const initialHash = window.location.hash.slice(1)
    if (initialHash === 'settings') {
      setView('settings')
    } else {
      // Default to transactions
      if (!window.location.hash) {
        window.location.hash = '#transactions'
      }
      setView('transactions')
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [setView])

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
      } else {
        // Use categories from config or default
        const cats = categoriesConfig || DEFAULT_CATEGORIES
        const categorized = categorize(transactions, cats)
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
  }

  // Render based on current view (hash routing)
  const renderMainContent = () => {
    if (currentView === 'settings') {
      return (
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-strong)' }}>
              Configuración
            </h2>
            <CategoryConfig onSaved={async () => {
              // Reload categories from backend without page reload
              try {
                const data = await getCategories()
                const converted = convertCategoriesFromJSON(data.categories)
                setCategoriesConfig(converted)
                localStorage.setItem('cachedCategories', JSON.stringify(converted))
                
                // Re-categorize current transactions with new categories
                if (rawTransactions.length > 0) {
                  const categorized = categorize(rawTransactions, converted)
                  setRawTransactions(categorized)
                }
                
                alert('Categorías actualizadas correctamente')
              } catch (err) {
                console.error('Error reloading categories:', err)
                window.location.reload()
              }
            }} />
          </section>
        </div>
      )
    }

    // Default: transactions view
    return (
      <>
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
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        total={currentView === 'transactions' ? grandTotal : 0}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar logo={<span className="font-bold text-lg">📊</span>} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="app-shell space-y-6" style={{ paddingTop: '1.25rem' }}>
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SidebarProvider>
      <AppContent />
    </SidebarProvider>
  )
}
