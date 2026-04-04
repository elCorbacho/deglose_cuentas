import CategoryItem from './CategoryItem.jsx'

export default function CategoryList({ categories }) {
  const visible = categories.filter(category => category.count > 0)

  if (visible.length === 0) {
    return (
      <section className="panel empty-state">
        <div className="category-list-empty-icon flex h-12 w-12 items-center justify-center rounded-full text-2xl">
          ↺
        </div>
        <div className="space-y-2">
          <p className="category-list-empty-title text-lg font-semibold">No encontramos resultados para ese filtro</p>
          <p className="category-list-empty-text max-w-lg text-sm leading-6">
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
          <p className="category-list-kicker text-xs font-semibold uppercase tracking-[0.18em]">
            Categorías
          </p>
          <h3 className="category-list-title text-xl font-semibold tracking-tight">
            Gastos agrupados para explorar en detalle
          </h3>
        </div>

        <span className="category-list-count text-sm">
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
