/**
 * DateFilter Molecule
 * Enhanced date filtering with quick presets and calendar date picker
 */

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from '../molecules/DatePicker';
import { toISODate } from '../../lib/formatters';

interface DateFilterProps {
  desde: string;
  hasta: string;
  onDesdeChange: (value: string) => void;
  onHastaChange: (value: string) => void;
}

interface DatePreset {
  id: string;
  label: string;
  getValue: () => { desde: string; hasta: string };
}

// Get current date info
function getDateInfo() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  return { now, currentYear, currentMonth };
}

// Preset configurations
const PRESETS: DatePreset[] = [
  {
    id: 'this-month',
    label: 'Este mes',
    getValue: () => {
      const { currentYear, currentMonth } = getDateInfo();
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      return {
        desde: toISODate(firstDay),
        hasta: toISODate(lastDay),
      };
    },
  },
  {
    id: 'last-month',
    label: 'Mes pasado',
    getValue: () => {
      const { currentYear, currentMonth } = getDateInfo();
      const firstDay = new Date(currentYear, currentMonth - 1, 1);
      const lastDay = new Date(currentYear, currentMonth, 0);
      return {
        desde: toISODate(firstDay),
        hasta: toISODate(lastDay),
      };
    },
  },
  {
    id: 'last-30',
    label: 'Últimos 30 días',
    getValue: () => {
      const { now } = getDateInfo();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        desde: toISODate(thirtyDaysAgo),
        hasta: toISODate(now),
      };
    },
  },
  {
    id: 'this-year',
    label: 'Este año',
    getValue: () => {
      const { currentYear } = getDateInfo();
      return {
        desde: `${currentYear}-01-01`,
        hasta: `${currentYear}-12-31`,
      };
    },
  },
];

export default function DateFilter({
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
}: DateFilterProps) {
  const [_activePreset, setActivePreset] = useState<string | null>(null);
  const isFiltered = Boolean(desde || hasta);

  // Check if current dates match a preset
  const currentPreset = useMemo(() => {
    if (!desde || !hasta) return null;
    for (const preset of PRESETS) {
      const presetValue = preset.getValue();
      if (presetValue.desde === desde && presetValue.hasta === hasta) {
        return preset.id;
      }
    }
    return null;
  }, [desde, hasta]);

  const handlePresetClick = (preset: DatePreset) => {
    const value = preset.getValue();
    onDesdeChange(value.desde);
    onHastaChange(value.hasta);
    setActivePreset(preset.id);
  };

  const handleClear = () => {
    onDesdeChange('');
    onHastaChange('');
    setActivePreset(null);
  };

  const handleManualChange = (type: 'desde' | 'hasta', value: string) => {
    if (type === 'desde') {
      onDesdeChange(value);
    } else {
      onHastaChange(value);
    }
    setActivePreset(null);
  };

  return (
    <section className="date-filter-bar" aria-label="Filtro por rango de fechas">
      {/* Quick Presets */}
      <div className="date-filter-bar__presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            className={`preset-btn preset-btn--compact ${currentPreset === preset.id ? 'preset-btn--active' : ''}`}
            type="button"
            aria-pressed={currentPreset === preset.id}
            aria-label={`Aplicar filtro: ${preset.label}`}
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
          <label id="desde-label" htmlFor="date-desde" className="date-filter-bar__label">
            Desde
          </label>
          <DatePicker
            id="date-desde"
            ariaLabelledBy="desde-label"
            value={desde}
            onChange={(value) => handleManualChange('desde', value)}
            placeholder="dd-mm-aaaa"
          />
        </div>

        <span className="date-filter-bar__separator">→</span>

        <div className="date-filter-bar__picker-group">
          <label id="hasta-label" htmlFor="date-hasta" className="date-filter-bar__label">
            Hasta
          </label>
          <DatePicker
            id="date-hasta"
            ariaLabelledBy="hasta-label"
            value={hasta}
            onChange={(value) => handleManualChange('hasta', value)}
            placeholder="dd-mm-aaaa"
          />
        </div>
      </div>

      {/* Clear */}
      <AnimatePresence>
        {isFiltered && (
          <motion.div
            style={{ display: 'contents' }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="date-filter-bar__divider" />
            <button
              onClick={handleClear}
              className="date-filter-bar__clear"
              type="button"
              aria-label="Limpiar filtros"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpiar</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
