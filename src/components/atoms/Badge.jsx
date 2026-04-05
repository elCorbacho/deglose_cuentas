/**
 * Badge Atom
 * A reusable badge/chip component for labels and tags
 */

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center gap-2 rounded-full font-semibold'

  const variantStyles = {
    default: 'bg-gray-200 text-gray-900',
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-teal-100 text-teal-900',
    danger: 'bg-red-100 text-red-900'
  }

  const sizeStyles = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  }

  const badgeClass = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.medium} ${className}`

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  )
}
