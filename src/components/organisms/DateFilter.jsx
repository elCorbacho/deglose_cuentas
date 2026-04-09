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
    <div className="date-filter-bar">
      {/* Quick Presets */}
      <div className="date-filter-bar__presets">
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

      {/* Divider */}
      <div className="date-filter-bar__divider" />

      {/* Date pickers */}
      <div className="date-filter-bar__pickers">
        <div className="date-filter-bar__picker-group">
          <span className="date-filter-bar__label">Desde</span>
          <DatePicker
            value={desde}
            onChange={(value) => handleManualChange('desde', value)}
            placeholder="dd-mm-aaaa"
          />
        </div>

        <span className="date-filter-bar__separator">→</span>

        <div className="date-filter-bar__picker-group">
          <span className="date-filter-bar__label">Hasta</span>
          <DatePicker
            value={hasta}
            onChange={(value) => handleManualChange('hasta', value)}
            placeholder="dd-mm-aaaa"
          />
        </div>
      </div>

      {/* Clear */}
      {isFiltered && (
        <>
          <div className="date-filter-bar__divider" />
          <button
            onClick={handleClear}
            className="date-filter-bar__clear"
            type="button"
            aria-label="Limpiar filtros"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </>
      )}
    </div>
  )
}
