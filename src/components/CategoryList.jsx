import CategoryItem from './CategoryItem.jsx'

export default function CategoryList({ categories }) {
  const visible = categories.filter(c => c.count > 0)

  if (visible.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        Sin transacciones en este rango
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map(cat => (
        <CategoryItem key={cat.name} category={cat} />
      ))}
    </div>
  )
}
