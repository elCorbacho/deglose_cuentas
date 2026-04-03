import CategoryItem from './CategoryItem.jsx'

export default function CategoryList({ categories }) {
  const visible = categories.filter(category => category.count > 0)

  if (visible.length === 0) {
    return (
      <section className="panel empty-state">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500">
          ↺
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">No encontramos resultados para ese filtro</p>
          <p className="max-w-lg text-sm leading-6 text-slate-600">
            Tus transacciones siguen cargadas, pero ninguna coincide con el rango seleccionado.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Categorías
          </p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            Gastos agrupados para explorar en detalle
          </h3>
        </div>

        <span className="text-sm text-slate-500">
          {visible.length} {visible.length === 1 ? 'categoría visible' : 'categorías visibles'}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {visible.map(category => (
          <CategoryItem key={category.name} category={category} />
        ))}
      </div>
    </section>
  )
}
