/**
 * Button Atom
 * A reusable button component that accepts various props for styling and behavior
 */

export default function Button({
  children,
  onClick,
  className = '',
  variant = 'default',
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-0.5rem rounded px-3 py-1.5 font-medium transition-all duration-160 ease'

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100',
    default: 'text-base hover:bg-gray-100 active:bg-gray-200'
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  const buttonClass = `${baseStyles} ${variantStyles[variant] || variantStyles.default} ${disabledStyles} ${className}`

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
