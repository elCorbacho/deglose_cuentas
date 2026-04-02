export default function DateFilter({ desde, hasta, onDesdeChange, onHastaChange }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">Desde:</span>
        <input
          type="date"
          value={desde}
          onChange={(e) => onDesdeChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">Hasta:</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => onHastaChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      {(desde || hasta) && (
        <button
          onClick={() => { onDesdeChange(''); onHastaChange('') }}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Limpiar filtro
        </button>
      )}
    </div>
  )
}
