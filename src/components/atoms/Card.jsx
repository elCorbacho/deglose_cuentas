/**
 * Card Atom
 * A reusable card/panel component for content containers
 */

export default function Card({
  children,
  header,
  className = '',
  ...props
}) {
  return (
    <div className={`panel ${className}`} {...props}>
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>
            {header}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}
