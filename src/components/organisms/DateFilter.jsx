/**
 * DateFilter Molecule
 * Enhanced date filtering with quick presets and calendar date picker
 */

import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import Button from '../atoms/Button.jsx'
import DatePicker from '../molecules/DatePicker.jsx'

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
    <div className="filter-container filter-container--compact">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
            Filtrar por fecha
          </p>
          <p className="text-xs" style={{ color: 'var(--text-base)' }}>
            Acota el período para revisar movimientos específicos.
          </p>
        </div>

        {isFiltered && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            type="button"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Quick Presets */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`preset-btn preset-btn--compact ${currentPreset === preset.id ? 'preset-btn--active' : ''}`}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

       {/* Date Inputs with Calendar Picker */}
       <div className="mt-3 grid gap-2 md:grid-cols-2">
          <label className="space-y-1 text-xs" style={{ color: 'var(--text-base)' }}>
            <span className="block font-semibold uppercase tracking-[0.08em]">Desde</span>
            <DatePicker
              value={desde}
              onChange={(value) => handleManualChange('desde', value)}
              placeholder="dd-mm-aaaa"
            />
          </label>

          <label className="space-y-1 text-xs" style={{ color: 'var(--text-base)' }}>
            <span className="block font-semibold uppercase tracking-[0.08em]">Hasta</span>
            <DatePicker
              value={hasta}
              onChange={(value) => handleManualChange('hasta', value)}
              placeholder="dd-mm-aaaa"
            />
          </label>
       </div>
    </div>
  )
}
