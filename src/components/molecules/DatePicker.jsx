/**
 * DatePicker Molecule
 * Input + floating calendar built directly on react-day-picker v9
 * Fully respects design system CSS tokens, no shadcn Calendar dependency
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { format, parse, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight, X, CalendarDays } from 'lucide-react'

export default function DatePicker({
  value,
  onChange,
  placeholder = 'dd-mm-aaaa',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(
    value ? format(new Date(value + 'T12:00:00'), 'dd-MM-yyyy') : ''
  )
  const containerRef = useRef(null)

  // Sync input when external value changes (e.g. preset buttons)
  useEffect(() => {
    if (value) {
      setInputValue(format(new Date(value + 'T12:00:00'), 'dd-MM-yyyy'))
    } else {
      setInputValue('')
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const handleDateSelect = useCallback((date) => {
    if (!date) return
    const iso = format(date, 'yyyy-MM-dd')
    onChange(iso)
    setInputValue(format(date, 'dd-MM-yyyy'))
    setOpen(false)
  }, [onChange])

  const handleInputChange = (e) => {
    const typed = e.target.value
    setInputValue(typed)
    try {
      const parsed = parse(typed, 'dd-MM-yyyy', new Date())
      if (isValid(parsed)) {
        onChange(format(parsed, 'yyyy-MM-dd'))
      }
    } catch {
      // invalid — ignore
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setInputValue('')
  }

  const selectedDate = value ? new Date(value + 'T12:00:00') : undefined

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Input trigger */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <CalendarDays
          style={{
            position: 'absolute',
            left: '0.55rem',
            width: '0.85rem',
            height: '0.85rem',
            color: 'var(--text-soft)',
            pointerEvents: 'none',
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="rdp-input"
          style={{
            paddingRight: value ? '1.6rem' : '0.6rem',
          }}
        />
        {value && (
          <button
            onClick={handleClear}
            type="button"
            style={{
              position: 'absolute',
              right: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-soft)',
            }}
          >
            <X style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        )}
      </div>

      {/* Calendar popover */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            background: 'var(--bg-panel-strong)',
            border: '1px solid var(--border-soft)',
            borderRadius: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            padding: '0.6rem',
            minWidth: '220px',
          }}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={es}
            weekStartsOn={1}
            showOutsideDays
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left'
                  ? <ChevronLeft style={{ width: '0.85rem', height: '0.85rem' }} />
                  : <ChevronRight style={{ width: '0.85rem', height: '0.85rem' }} />,
            }}
            classNames={{
              root: 'rdp-custom',
              months: 'rdp-months',
              month: 'rdp-month',
              month_caption: 'rdp-caption',
              caption_label: 'rdp-caption-label',
              nav: 'rdp-nav',
              button_previous: 'rdp-nav-btn',
              button_next: 'rdp-nav-btn',
              month_grid: 'rdp-table',
              weekdays: 'rdp-head-row',
              weekday: 'rdp-head-cell',
              week: 'rdp-row',
              day: 'rdp-cell',
              day_button: 'rdp-day',
              selected: 'rdp-day--selected',
              today: 'rdp-day--today',
              outside: 'rdp-day--outside',
              disabled: 'rdp-day--disabled',
              range_middle: 'rdp-day--range-middle',
            }}
          />
        </div>
      )}
    </div>
  )
}
