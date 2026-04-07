/**
 * DatePicker Molecule
 * Combines Input + Popover + Calendar for date selection
 */

import { useState, useRef, useEffect } from 'react'
import { format, parse } from 'date-fns'
import { X } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/atoms/Popover'
import { Calendar as CalendarComponent } from '@/components/atoms/Calendar'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'

/**
 * DatePicker with calendar popup
 * @param {string} value - ISO date string (YYYY-MM-DD)
 * @param {function} onChange - Callback with ISO date string
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 */
export default function DatePicker({ value, onChange, placeholder = 'dd-mm-aaaa', disabled = false }) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value ? format(new Date(value), 'dd-MM-yyyy') : '')
  const inputRef = useRef(null)

  // Sync input value with external value changes
  useEffect(() => {
    if (value) {
      setInputValue(format(new Date(value), 'dd-MM-yyyy'))
    } else {
      setInputValue('')
    }
  }, [value])

  const handleDateSelect = (date) => {
    if (date) {
      const isoString = format(date, 'yyyy-MM-dd')
      onChange(isoString)
      setInputValue(format(date, 'dd-MM-yyyy'))
      setOpen(false)
    }
  }

  const handleInputChange = (e) => {
    const typed = e.target.value
    setInputValue(typed)
    
    // Try to parse as dd-MM-yyyy or dd/MM/yyyy
    try {
      const parsed = parse(typed, 'dd-MM-yyyy', new Date())
      if (!isNaN(parsed.getTime())) {
        const isoString = format(parsed, 'yyyy-MM-dd')
        onChange(isoString)
      }
    } catch {
      // Invalid format, don't update
    }
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setInputValue('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            className="pr-9"
          />
          {value && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={handleDateSelect}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  )
}
