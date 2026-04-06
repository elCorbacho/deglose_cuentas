/**
 * DateFilter Molecule
 * Enhanced date filtering with quick presets and native date picker
 */

import { useState, useMemo } from 'react'

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

// Get current date info
function getDateInfo() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  return { now, currentYear, currentMonth }
}

// Preset configurations
const PRESETS = [
  {
    id: 'this-month',
    label: 'Este mes',
    getValue: () => {
      const { now, currentYear, currentMonth } = getDateInfo()
      const firstDay = new Date(currentYear, currentMonth, 1)
      const lastDay = new Date(currentYear, currentMonth + 1, 0)
      return {
        desde: firstDay.toISOString().split('T')[0],
        hasta: lastDay.toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'last-month',
    label: 'Mes pasado',
    getValue: () => {
      const { currentYear, currentMonth } = getDateInfo()
      const firstDay = new Date(currentYear, currentMonth - 1, 1)
      const lastDay = new Date(currentYear, currentMonth, 0)
      return {
        desde: firstDay.toISOString().split('T')[0],
        hasta: lastDay.toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'last-30',
    label: 'Últimos 30 días',
    getValue: () => {
      const { now } = getDateInfo()
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return {
        desde: thirtyDaysAgo.toISOString().split('T')[0],
        hasta: now.toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'this-year',
    label: 'Este año',
    getValue: () => {
      const { currentYear } = getDateInfo()
      return {
        desde: `${currentYear}-01-01`,
        hasta: `${currentYear}-12-31`
      }
    }
  }
]

export default function DateFilter({ desde, hasta, onDesdeChange, onHastaChange }) {
  const [activePreset, setActivePreset] = useState(null)
  const isFiltered = Boolean(desde || hasta)

  // Check if current dates match a preset
  const currentPreset = useMemo(() => {
    if (!desde || !hasta) return null
    for (const preset of PRESETS) {
      const presetValue = preset.getValue()
      if (presetValue.desde === desde && presetValue.hasta === hasta) {
        return preset.id
      }
    }
    return null
  }, [desde, hasta])

  const handlePresetClick = (preset) => {
    const value = preset.getValue()
    onDesdeChange(value.desde)
    onHastaChange(value.hasta)
    setActivePreset(preset.id)
  }

  const handleClear = () => {
    onDesdeChange('')
    onHastaChange('')
    setActivePreset(null)
  }

  const handleManualChange = (type, value) => {
    if (type === 'desde') {
      onDesdeChange(value)
    } else {
      onHastaChange(value)
    }
    setActivePreset(null)
  }

  return (
    <div className="filter-container rounded-[22px] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
            Filtrar por fecha
          </p>
          <p className="text-sm" style={{ color: 'var(--text-base)' }}>
            Acota el período para revisar movimientos específicos.
          </p>
        </div>

        {isFiltered && (
          <button
            onClick={handleClear}
            className="btn-filter-clear inline-flex items-center gap-1.5 text-sm font-medium"
            type="button"
          >
            <ClearIcon />
            Limpiar
          </button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`preset-btn ${currentPreset === preset.id ? 'preset-btn--active' : ''}`}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date Inputs */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm" style={{ color: 'var(--text-base)' }}>
          <span className="block font-medium">Desde</span>
          <div className="date-input-wrapper">
            <CalendarIcon />
            <input
              type="date"
              value={desde}
              onChange={(e) => handleManualChange('desde', e.target.value)}
              className="input-base date-input"
            />
          </div>
        </label>

        <label className="space-y-2 text-sm" style={{ color: 'var(--text-base)' }}>
          <span className="block font-medium">Hasta</span>
          <div className="date-input-wrapper">
            <CalendarIcon />
            <input
              type="date"
              value={hasta}
              onChange={(e) => handleManualChange('hasta', e.target.value)}
              className="input-base date-input"
            />
          </div>
        </label>
      </div>
    </div>
  )
}
