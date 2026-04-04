export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:scale-105"
      type="button"
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
