/**
 * Input Atom
 * A reusable input component with design system styling
 */

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`input-base ${className}`}
      {...props}
    />
  )
}
