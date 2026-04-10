import { useState, useMemo, useEffect } from 'react'
import type { CategoriesMap, CategoryJson, CategorizedTransaction } from './types'
import { Toaster, toast } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import FileUpload from './components/organisms/FileUpload'
import DateFilter from './components/organisms/DateFilter'
import CategoryList from './components/organisms/CategoryList'
import Dashboard from './components/organisms/Dashboard'
import Button from './components/atoms/Button'
import { DonutChart } from './components/ui/donut-chart.jsx'

import Header from './components/organisms/Header'
import CategoryConfig from './components/organisms/CategoryConfig'
import Sidebar from './components/organisms/Sidebar'
import { extractText } from './lib/pdfParser'
import { parse } from './lib/transactionExtractor'
import { categorize } from './lib/categorizer'
import { group } from './lib/aggregator'
import { parseDate, formatCLP } from './lib/formatters'
import { getCategories } from './services/api'
import { savePdfState, loadPdfState, clearPdfState } from './services/pdfState'
import { CATEGORIES as DEFAULT_CATEGORIES } from './data/categories'

// Convert JSON format to object format used by categorizer
function convertCategoriesFromJSON(jsonCategories: CategoryJson[]): CategoriesMap {
  const obj: CategoriesMap = {}
  for (const cat of jsonCategories) {
    obj[cat.name] = {
      icon: cat.icon,
      keywords: cat.keywords || []
    }
  }
  return obj
}

export default function App() {
  const [rawTransactions, setRawTransactions] = useState<CategorizedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeView, setActiveView] = useState<'upload' | 'dashboard' | 'analysis' | 'config'>('upload')
  const [categoriesConfig, setCategoriesConfig] = useState<CategoriesMap>(DEFAULT_CATEGORIES)
  

  // Load categories from backend on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        const converted = convertCategoriesFromJSON(data.categories)
        setCategoriesConfig(converted)
        localStorage.setItem('cachedCategories', JSON.stringify(converted))
      } catch (err) {
        console.warn('Could not load categories from backend, using cached/default:', err)
        const cached = localStorage.getItem('cachedCategories')
        if (cached) {
          setCategoriesConfig(JSON.parse(cached))
        }
      }
    }
    loadCategories()
  }, [])

  // Restore PDF state from storage on mount
  useEffect(() => {
    const savedState = loadPdfState()
    if (savedState && savedState.rawTransactions?.length > 0) {
      setRawTransactions(savedState.rawTransactions as CategorizedTransaction[])
      setFileName(savedState.fileName || '')
      setActiveView('analysis')
    }
  }, [])

  

  const parseInputDateLocal = (dateStr: string, endOfDay = false): Date | null => {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return null
    if (endOfDay) {
      return new Date(year, month - 1, day, 23, 59, 59, 999)
    }
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  }

  const handleFile = async (file: File) => {
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
      const message = err instanceof Error ? err.message : 'Error desconocido'
      console.error('PDF Error:', err)
      setError(`Error al procesar el PDF: ${message}. Verifica que sea un estado de cuenta Santander.`)
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

    return rawTransactions.filter((tx) => {
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
  const handleNavigate = (view: 'upload' | 'dashboard' | 'analysis' | 'config') => {
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
        <div className="relative z-10 flex flex-col gap-2">
          <span className="eyebrow">Santander · visión rápida</span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: 'var(--text-strong)' }}>
            Entiende tus gastos sin complicarte.
          </h1>
          <p className="max-w-lg text-sm leading-6" style={{ color: 'var(--text-soft)' }}>
            Subí tu estado de cuenta Santander y explorá tus movimientos por categoría, con filtros de fecha y totales al instante.
          </p>
        </div>

        {!loading && (
          <div className="relative z-10 mt-5 panel p-4 sm:p-5">
            <FileUpload onFileLoaded={handleFile} />
          </div>
        )}
      </section>

      {loading && (
        <section className="panel status-card status-card--loading view-panel">
          <div className="inline-block h-10 w-10 animate-spin rounded-full spinner-ring" />
          <div className="space-y-1">
            <p className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>Procesando tu PDF…</p>
            <p className="max-w-sm text-sm" style={{ color: 'var(--text-soft)' }}>
              Estamos leyendo y clasificando tus movimientos.
            </p>
          </div>
        </section>
      )}

      {error && !loading && (
        <section className="panel status-card status-card--error view-panel">
          <div className="flex h-10 w-10 items-center justify-center rounded-full error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.25rem', height: '1.25rem' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold" style={{ color: 'var(--text-strong)' }}>No pudimos leer este archivo</p>
            <p className="max-w-md text-sm" style={{ color: 'var(--text-soft)' }}>{error}</p>
          </div>
          <Button onClick={resetResults} variant="outline" size="sm" type="button">
            Intentar con otro PDF
          </Button>
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
          <div className="analysis-row analysis-widgets-grid analysis-widgets-grid--two">
            <div className="panel widget-card total-card">
              {/* Header row */}
              <div className="total-card__header">
                <span className="widget-kicker text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Total del rango
                </span>
                <Button
                  onClick={resetResults}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="total-card__reset-btn"
                >
                  Nuevo PDF
                </Button>
              </div>

              {/* Main amount */}
              <p className="widget-total-amount mono-num total-card__amount" style={{ color: 'var(--text-strong)' }}>
                {formatCLP(filteredRangeTotal)}
              </p>

              {/* Stats row */}
              <div className="total-card__stats">
                <div className="total-card__stat">
                  <span className="total-card__stat-value">{filteredTransactions.length}</span>
                  <span className="total-card__stat-label">movimientos</span>
                </div>
                <div className="total-card__divider" />
                <div className="total-card__stat">
                  <span className="total-card__stat-value">{visibleCategories.length}</span>
                  <span className="total-card__stat-label">categorías</span>
                </div>
              </div>
            </div>

            <div className="panel widget-card dist-card">
              <div className="dist-card__header">
                <span className="widget-kicker text-[10px] font-semibold uppercase tracking-[0.18em]">Distribución</span>
              </div>
              <div className="distribution-widget">
                <DonutChart
                  data={chartItems.map((item, index) => ({
                    value: item.total,
                    color: chartColors[index % chartColors.length],
                    label: item.name,
                  }))}
                  className="distribution-donut"
                  size={120}
                  strokeWidth={18}
                  centerContent={
                    <span className="mono-num text-xs font-bold" style={{ color: 'var(--text-strong)' }}>
                      {chartItems.length > 0 ? `${chartItems.length} cat.` : '—'}
                    </span>
                  }
                />
                <div className="distribution-legend">
                  {chartItems.slice(0, 4).map((item, index) => (
                    <div key={item.name} className="distribution-legend-item">
                      <span
                        className="distribution-legend-dot"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      <span className="truncate" style={{ color: 'var(--text-base)' }}>
                        {item.name}
                      </span>
                      <span className="mono-num font-semibold" style={{ color: 'var(--text-strong)' }}>
                        {Math.round((item.total / filteredRangeTotal) * 100) || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="analysis-row">
            <DateFilter
              desde={desde}
              hasta={hasta}
              onDesdeChange={setDesde}
              onHastaChange={setHasta}
            />
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
