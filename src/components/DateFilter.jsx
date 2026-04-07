import Button from './atoms/Button.jsx'
import Input from './atoms/Input.jsx'

export default function DateFilter({ desde, hasta, onDesdeChange, onHastaChange }) {
  const isFiltered = Boolean(desde || hasta)

  return (
    <div className="filter-container rounded-[22px] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
            Filtros
          </p>
          <p className="text-sm" style={{ color: 'var(--text-base)' }}>
            Acota el período para revisar movimientos específicos sin alterar el total original del PDF.
          </p>
        </div>

        {isFiltered && (
          <Button
            onClick={() => {
              onDesdeChange('')
              onHastaChange('')
            }}
            variant="outline"
            type="button"
          >
            Limpiar filtro
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
         <label className="space-y-2 text-sm" style={{ color: 'var(--text-base)' }}>
           <span className="hidden md:inline-block font-medium">Desde</span>
          <Input
            type="date"
            value={desde}
            onChange={(event) => onDesdeChange(event.target.value)}
          />
        </label>

         <label className="space-y-2 text-sm" style={{ color: 'var(--text-base)' }}>
           <span className="hidden md:inline-block font-medium">Hasta</span>
          <Input
            type="date"
            value={hasta}
            onChange={(event) => onHastaChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
