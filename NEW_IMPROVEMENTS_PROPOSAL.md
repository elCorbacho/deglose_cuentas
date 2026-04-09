# 🎯 Propuesta de Mejoras - Deglose Cuentas

**Fecha:** 2026-04-08  
**Prioridad:** Alto Impacto vs Esfuerzo  
**Stack:** React 19 + Vite + Tailwind CSS 4 + shadcn/ui

---

## 📊 Resumen Ejecutivo

Tu app tiene bases sólidas (dark mode, accessibility, responsive). Pero hay mejoras que la transformarían de "funcional" a "imprescindible". Clasifiqué las mejoras en 3 categorías:

| Categoría | Impacto | Esfuerzo | Prioridad |
|-----------|---------|----------|-----------|
| **Nuevas Features** | 🔴 ALTO | 🟡 MEDIO | 1️⃣ |
| **UX/Polish** | 🟠 MEDIO-ALTO | 🟢 BAJO | 2️⃣ |
| **Performance** | 🟠 MEDIO | 🟡 MEDIO | 3️⃣ |

---

## 🔴 PRIORIDAD 1: Nuevas Features (Alto Impacto)

### 1. **Búsqueda de Transacciones** ⭐⭐⭐

**Problema:** El usuario no puede buscar texto específico en sus transacciones.

**Solución:**
```jsx
// Nuevo componente: TransactionSearch.jsx
import { Search, X } from 'lucide-react'

function TransactionSearch({ transactions, onSearch }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = (e) => {
    const q = e.target.value
    setQuery(q)
    
    if (q.length < 2) {
      setResults([])
      return
    }

    const filtered = transactions.filter(tx => 
      tx.descripcion.toLowerCase().includes(q.toLowerCase()) ||
      tx.categoria?.toLowerCase().includes(q.toLowerCase())
    )
    setResults(filtered)
    onSearch?.(filtered)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-soft" />
      <input
        type="search"
        value={query}
        onChange={handleSearch}
        placeholder="Buscar en transacciones... (Cmd+K)"
        className="w-full pl-10 pr-10 h-10 rounded-lg border border-soft bg-panel"
      />
      {query && (
        <button 
          onClick={() => { setQuery(''); setResults([]) }}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
```

**Beneficio:** El usuario puede encontrar rapidamente "Netflix", "Uber", etc.  
**Esfuerzo:** ~2 horas

---

### 2. **Exportación a CSV** ⭐⭐⭐

**Problema:** Los usuarios quieren exportar sus datos para Excel/Numbers.

**Solución:**
```jsx
// Nuevo hook: useExport.js
export function useExport() {
  const exportToCSV = (transactions, filename = 'transacciones') => {
    const headers = ['Fecha', 'Descripción', 'Monto', 'Categoría']
    const rows = transactions.map(tx => [
      tx.fecha,
      tx.descripcion,
      tx.monto,
      tx.categoria || 'Sin categoría'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return { exportToCSV }
}
```

**UI en Dashboard:**
```jsx
<div className="flex gap-2">
  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredTransactions)}>
    <Download className="w-4 h-4" />
    Exportar CSV
  </Button>
</div>
```

**Beneficio:** Los usuarios pueden hacer sus propios análisis en Excel.  
**Esfuerzo:** ~1 hora

---

### 3. **Keyboard Shortcuts** ⭐⭐

**Problema:** Los usuarios power-user quieren navegación rápida.

**Solución:**
```jsx
// Nuevo hook: useKeyboardShortcuts.js
import { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export function useKeyboardShortcuts(handlers) {
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault()
    handlers.openSearch?.()
  })

  useHotkeys('cmd+e, ctrl+e', (e) => {
    e.preventDefault()
    handlers.export?.()
  })

  useHotkeys('escape', () => {
    handlers.closeModal?.()
  })

  useHotkeys('1', () => handlers.navigate?.('upload'))
  useHotkeys('2', () => handlers.navigate?.('dashboard'))
  useHotkeys('3', () => handlers.navigate?.('analysis'))
}
```

**UI: Mostrar shortcuts en tooltips**
```jsx
<button 
  title="Subir PDF (Cmd+K)"
  aria-label="Subir PDF, atajo: Cmd+K"
>
  <UploadIcon />
</button>
```

**Beneficio:** Navegación 3x más rápida para usuarios frecuentes.  
**Esfuerzo:** ~2 horas

---

### 4. **Detección de Pagos Recurrentes** ⭐⭐

**Problema:** Los usuarios no saben qué suscripciones tienen.

**Solución:**
```jsx
// En aggregator.js - agregar función de detección
export function detectRecurring(transactions) {
  const byMerchant = {}
  
  transactions.forEach(tx => {
    const key = tx.descripcion.replace(/\d+/g, '').trim()
    if (!byMerchant[key]) byMerchant[key] = []
    byMerchant[key].push(tx)
  })

  const recurring = []
  
  Object.entries(byMerchant).forEach(([merchant, txs]) => {
    if (txs.length >= 2) {
      // Calcular intervalos
      const amounts = [...new Set(txs.map(t => Math.round(t.monto)))]
      if (amounts.length === 1) {
        recurring.push({
          merchant,
          amount: amounts[0],
          count: txs.length,
          frequency: estimateFrequency(txs)
        })
      }
    }
  })

  return recurring.sort((a, b) => b.count - a.count)
}

function estimateFrequency(transactions) {
  // Calcular días entre transacciones
  // Si ~30 días = mensual, ~7 días = semanal
}
```

**UI: Nueva sección en Dashboard**
```jsx
<article className="panel p-5">
  <h3 className="text-lg font-semibold">Suscripciones Detectadas</h3>
  {recurring.map(sub => (
    <div className="flex justify-between">
      <span>{sub.merchant}</span>
      <span>{formatCLP(sub.amount)}/mes</span>
    </div>
  ))}
</article>
```

**Beneficio:** Los usuarios descubren suscripciones olvidadas.  
**Esfuerzo:** ~4 horas

---

### 5. **Comparación de Períodos** ⭐⭐

**Problema:** "¿Gasté más o menos que el mes pasado?"

**Solución:**
```jsx
// Nuevo componente: PeriodComparison
function PeriodComparison({ currentPeriod, previousPeriod }) {
  const diff = currentPeriod.total - previousPeriod.total
  const percentage = (diff / previousPeriod.total) * 100
  
  return (
    <div className={`panel p-4 ${diff > 0 ? 'border-red-300' : 'border-green-300'}`}>
      <p>vs Período Anterior</p>
      <p className={diff > 0 ? 'text-red-500' : 'text-green-500'}>
        {diff > 0 ? '▲' : '▼'} {formatCLP(Math.abs(diff))} ({percentage.toFixed(1)}%)
      </p>
    </div>
  )
}
```

**Beneficio:** Contexto para saber si está gastando más o menos.  
**Esfuerzo:** ~3 horas

---

## 🟠 PRIORIDAD 2: UX/Polish (Medio-Alto Impacto)

### 6. **Skeleton Screens Mejorados** ⭐⭐

**Problema:** El spinner es básico, los skeletons muestran estructura.

```jsx
// Nuevo componente: LoadingSkeletons.jsx
export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="panel p-5 space-y-3">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
        <div className="panel p-5 space-y-3">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto" />
        </div>
      </div>
      
      {/* Category List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="panel p-4 flex gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-2 w-full bg-slate-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Beneficio:** Perceived performance 2x mejor.  
**Esfuerzo:** ~1 hora

---

### 7. **Drag & Drop Mejorado para Mobile** ⭐⭐

**Problema:** En mobile, drag & drop no funciona.

```jsx
// Mejorar FileUpload.jsx
<div 
  className={`upload-zone ${isDragging ? 'dragging' : ''}`}
  onClick={() => document.getElementById('pdf-upload-input').click()}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      document.getElementById('pdf-upload-input').click()
    }
  }}
>
  {/* Contenido */}
</div>

{/* Feedback visual claro para mobile */}
<p className="text-sm sm:hidden" style={{ color: 'var(--text-soft)' }}>
  Toca para seleccionar archivo
</p>
```

**Beneficio:** UX consistente entre desktop y mobile.  
**Esfuerzo:** ~30 min

---

### 8. **Toast Notifications Mejoras** ⭐

**Problema:** Los toasts actuales son genéricos.

```jsx
// En App.jsx - mejorar configuración de Sonner
<Toaster 
  position="top-right"
  theme="system"
  toastOptions={{
    className: 'panel',
    duration: 4000,
  }}
/>

// Toasts específicos
toast.success('Categorías actualizadas', {
  description: 'Tus cambios se guardaron correctamente',
  icon: '✓'
})

toast.error('Error al procesar PDF', {
  description: 'Verifica que sea un estado de cuenta Santander',
  action: {
    label: 'Reintentar',
    onClick: () => handleRetry()
  }
})
```

**Beneficio:** Feedback más claro y accionable.  
**Esfuerzo:** ~30 min

---

### 9. **Onboarding Tour** ⭐

**Problema:** Nuevos usuarios no saben qué hacer.

```jsx
// Nuevo hook: useOnboarding
const ONBOARDING_KEY = 'deglose_onboarding_complete'

export function useOnboarding() {
  const [step, setStep] = useState(0)
  const isComplete = localStorage.getItem(ONBOARDING_KEY)

  const steps = [
    { target: '#upload-zone', content: 'Arrastra tu estado de cuenta aquí' },
    { target: '.date-filter-bar', content: 'Filtra por fechas para enfocarte' },
    { target: '.category-item', content: 'Haz clic para ver detalles' },
  ]

  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setStep(-1)
  }

  return { step, steps, isComplete, complete, setStep }
}
```

**Beneficio:** Reduce bounce rate de nuevos usuarios.  
**Esfuerzo:** ~3 horas

---

## 🟡 PRIORIDAD 3: Performance

### 10. **Memoización Aggresiva** ⭐⭐

**Problema:** Re-renders innecesarios en listas largas.

```jsx
// En CategoryList.jsx
import { memo, useMemo } from 'react'

const CategoryItemMemo = memo(CategoryItem, (prev, next) => {
  return prev.category.name === next.category.name &&
         prev.category.total === next.category.total
})

export default function CategoryList({ categories }) {
  const visible = useMemo(
    () => categories.filter(c => c.count > 0),
    [categories]
  )

  return (
    <div className="flex flex-col gap-3">
      {visible.map(category => (
        <CategoryItemMemo key={category.name} category={category} />
      ))}
    </div>
  )
}
```

**Beneficio:** 60% menos re-renders.  
**Esfuerzo:** ~1 hora

---

### 11. **Code Splitting** ⭐⭐

**Problema:** Todo se carga al inicio, incluso código no usado.

```jsx
// En App.jsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./components/organisms/Dashboard'))
const CategoryConfig = lazy(() => import('./components/organisms/CategoryConfig'))

function App() {
  return (
    <>
      {/* ... resto del app */}
      
      <Suspense fallback={<AnalysisSkeleton />}>
        {activeView === 'dashboard' && <Dashboard {...props} />}
      </Suspense>
      
      <Suspense fallback={<div>Cargando...</div>}>
        {activeView === 'config' && <CategoryConfig />}
      </Suspense>
    </>
  )
}
```

**Beneficio:** Initial bundle ~40% más chico.  
**Esfuerzo:** ~1 hora

---

### 12. **Virtual Scrolling para Listas Largas** ⭐

**Problema:** 1000+ transacciones = DOM lento.

```jsx
// Nuevo componente: VirtualTransactionList
import { FixedSizeList } from 'react-window'

export function VirtualTransactionList({ transactions }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={transactions.length}
      itemSize={72}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <TransactionRow transaction={transactions[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

**Beneficio:** Scroll suave con 10,000+ transacciones.  
**Esfuerzo:** ~2 horas

---

## 📋 Plan de Implementación Sugerido

### Semana 1: Quick Wins (Alto Impacto, Bajo Esfuerzo)
1. ✅ Exportar CSV
2. ✅ Skeleton screens mejorados
3. ✅ Toast improvements
4. ✅ Keyboard shortcuts básicos

### Semana 2: Core Features
5. 🔄 Búsqueda de transacciones
6. 🔄 Memoización agresiva
7. 🔄 Code splitting

### Semana 3: Advanced Features
8. ⬜ Detección de recurrentes
9. ⬜ Comparación de períodos
10. ⬜ Onboarding tour

### Semana 4: Polish
11. ⬜ Virtual scrolling
12. ⬜ Mobile drag & drop fix
13. ⬜ Testing y refinamiento

---

## 🎯 Recomendación Final

**Empezá por:**
1. **Export CSV** - Los usuarios lo esperan y es rápido
2. **Skeleton screens** - Mejora percepción de velocidad
3. **Keyboard shortcuts** - Diferenciador para power users

**Que dejé afuera (por ahora):**
- PWA/Service Worker (esfuerzo alto, beneficio medio para esta app)
- Backend/cloud sync (cambia el modelo, mejor keep it simple)
- AI insights (requiere backend, overkill por ahora)

---

## 📁 Archivos a Crear/Modificar

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `src/components/organisms/TransactionSearch.jsx` | Crear | 1️⃣ |
| `src/hooks/useExport.js` | Crear | 1️⃣ |
| `src/hooks/useKeyboardShortcuts.js` | Crear | 2️⃣ |
| `src/components/organisms/LoadingSkeletons.jsx` | Crear | 1️⃣ |
| `src/lib/recurringDetector.js` | Crear | 3️⃣ |
| `src/components/organisms/PeriodComparison.jsx` | Crear | 3️⃣ |
| `src/App.jsx` | Modificar | 1️⃣ |
| `src/components/organisms/Dashboard.jsx` | Modificar | 2️⃣ |

---

**¿Querés que empiece a implementar alguna de estas mejoras?**

Las recomendadas para empezar son: **Export CSV** y **Skeleton screens** — alto impacto, bajo esfuerzo.
