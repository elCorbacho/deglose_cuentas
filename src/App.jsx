import { useState, useMemo, useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import FileUpload from './components/organisms/FileUpload.jsx'
import DateFilter from './components/organisms/DateFilter.jsx'
import CategoryList from './components/organisms/CategoryList.jsx'
import Dashboard from './components/organisms/Dashboard.jsx'
import Button from './components/atoms/Button.jsx'

import Header from './components/organisms/Header.jsx'
import CategoryConfig from './components/organisms/CategoryConfig.jsx'
import Sidebar from './components/organisms/Sidebar.jsx'
import { extractText } from './lib/pdfParser.js'
import { parse } from './lib/transactionExtractor.js'
import { categorize } from './lib/categorizer.js'
import { group } from './lib/aggregator.js'
import { parseDate, formatCLP } from './lib/formatters.js'
import { getCategories } from './services/api.js'
import { savePdfState, loadPdfState, clearPdfState } from './services/pdfState.js'
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
  const [activeView, setActiveView] = useState('upload') // 'upload' | 'dashboard' | 'analysis' | 'config'
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

  // Restore PDF state from storage on mount
  useEffect(() => {
    const savedState = loadPdfState()
    if (savedState && savedState.rawTransactions?.length > 0) {
      setRawTransactions(savedState.rawTransactions)
      setFileName(savedState.fileName || '')
      setActiveView('analysis')
    }
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
        
        // Persist PDF state
        savePdfState({ rawTransactions: categorized, fileName: file.name })
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
    clearPdfState()
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
    // Save PDF state BEFORE reloading (if reload happens)
    if (rawTransactions.length > 0) {
      savePdfState({ rawTransactions, fileName })
    }

    try {
      const data = await getCategories()
      const converted = convertCategoriesFromJSON(data.categories)
      setCategoriesConfig(converted)
      localStorage.setItem('cachedCategories', JSON.stringify(converted))

      if (rawTransactions.length > 0) {
        const categorized = categorize(rawTransactions, converted)
        setRawTransactions(categorized)
      }

      toast.success('Categorías actualizadas correctamente')
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
            <Button onClick={resetResults} variant="outline" type="button">
              Intentar con otro PDF
            </Button>
            <span className="text-xs" style={{ color: 'var(--text-soft)' }}>
              La zona de carga vuelve a quedar disponible arriba.
            </span>
          </div>
        </section>
      )}
    </>
  )

  const renderAnalysisView = () => {
    const filteredRangeTotal = filteredTransactions.reduce((sum, tx) => sum + tx.monto, 0)
    const visibleCategories = categories.filter(category => category.count > 0)
    const topChartCategories = visibleCategories.slice(0, 5)
    const topChartTotal = topChartCategories.reduce((sum, category) => sum + category.total, 0)
    const otherTotal = Math.max(filteredRangeTotal - topChartTotal, 0)

    const chartItems = [
      ...topChartCategories.map((category) => ({
        name: category.name,
        icon: category.icon,
        total: category.total,
      })),
      ...(otherTotal > 0 ? [{ name: 'Otros', icon: '·', total: otherTotal }] : []),
    ]

    const chartColors = ['#22D3EE', '#38BDF8', '#818CF8', '#A78BFA', '#F472B6', '#94A3B8']
    let progress = 0
    const donutGradient = chartItems.length
      ? `conic-gradient(${chartItems
          .map((item, index) => {
            const start = progress
            const end = progress + (item.total / filteredRangeTotal) * 100
            progress = end
            return `${chartColors[index % chartColors.length]} ${start}% ${end}%`
          })
          .join(', ')})`
      : 'conic-gradient(var(--bg-shell) 0 100%)'

    return (
    <section className="analysis-body view-panel">
      {hasTransactions ? (
        <>
          <div className="analysis-row analysis-widgets-grid analysis-widgets-grid--three">
            <div className="panel widget-card p-3 sm:p-4">
              <DateFilter
                desde={desde}
                hasta={hasta}
                onDesdeChange={setDesde}
                onHastaChange={setHasta}
              />
            </div>

            <div className="panel widget-card p-4">
              <p className="widget-kicker text-[11px] font-semibold uppercase tracking-[0.16em]">Total del rango</p>
              <p className="widget-total-amount mono-num mt-2" style={{ color: 'var(--text-strong)' }}>
                {formatCLP(filteredRangeTotal)}
              </p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-soft)' }}>
                {filteredTransactions.length} movimientos · {visibleCategories.length} categorías
              </p>
              <Button onClick={resetResults} variant="outline" size="sm" className="mt-3 w-full" type="button">
                Cargar otro PDF
              </Button>
            </div>

            <div className="panel widget-card p-4">
              <p className="widget-kicker text-[11px] font-semibold uppercase tracking-[0.16em]">Distribución de gastos</p>
              <div className="distribution-widget mt-3">
                <div className="distribution-donut" style={{ background: donutGradient }}>
                  <div className="distribution-donut-center" />
                </div>
                <div className="distribution-legend">
                  {chartItems.slice(0, 4).map((item, index) => (
                    <div key={item.name} className="distribution-legend-item">
                      <span
                        className="distribution-legend-dot"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <span className="truncate" style={{ color: 'var(--text-base)' }}>
                        {item.icon} {item.name}
                      </span>
                      <span className="mono-num" style={{ color: 'var(--text-strong)' }}>
                        {Math.round((item.total / filteredRangeTotal) * 100) || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="analysis-row analysis-row--content">
            <CategoryList categories={categories} />
          </div>
        </>
      ) : (
        <section className="panel status-card status-card--empty">
          <p className="text-sm" style={{ color: 'var(--text-base)' }}>
            Todavía no hay transacciones para analizar. Cargá un PDF primero.
          </p>
          <Button onClick={() => setActiveView('upload')} variant="outline" type="button">
            Ir a Cargar PDF
          </Button>
        </section>
      )}
    </section>
    )
  }

  const renderConfigView = () => (
    <section className="panel p-5 view-panel">
      <CategoryConfig onSaved={handleCategoriesSaved} />
    </section>
  )

  const renderDashboardView = () => (
    <section className="view-panel">
      {hasTransactions ? (
        <Dashboard
          categories={categories}
          grandTotal={grandTotal}
          transactionCount={filteredTransactions.length}
          dateRange={{ desde, hasta }}
        />
      ) : (
        <section className="panel status-card status-card--empty">
          <p className="text-sm" style={{ color: 'var(--text-base)' }}>
            No hay datos para mostrar. Cargá un PDF primero.
          </p>
          <Button onClick={() => setActiveView('upload')} variant="outline" type="button">
            Ir a Cargar PDF
          </Button>
        </section>
      )}
    </section>
  )

  const renderCurrentView = () => {
    if (activeView === 'config') return renderConfigView()
    if (activeView === 'dashboard') return renderDashboardView()
    if (activeView === 'analysis') return renderAnalysisView()
    return renderUploadView()
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <Toaster position="top-right" theme="system" />
        <Header />

        <div className="app-layout">
          <Sidebar
            activeView={activeView}
            hasTransactions={hasTransactions}
            onNavigate={handleNavigate}
          />

          <main className="content-area">
            <div className="app-shell app-shell--compact">
              {renderCurrentView()}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
