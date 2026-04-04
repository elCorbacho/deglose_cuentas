import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ theme, onThemeToggle, onConfigClick, showBackButton, onBackClick }) {
  return (
    <header className="header-shell fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showBackButton && onBackClick && (
            <button 
              onClick={onBackClick}
              className="text-sm font-medium px-2 py-1 rounded"
              style={{ color: 'var(--text-base)' }}
              title="Volver"
            >
              ← Volver
            </button>
          )}
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>
            Deglose Cuentas
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {onConfigClick && (
            <button 
              onClick={onConfigClick}
              className="text-sm font-medium px-3 py-1.5 rounded"
              style={{ color: 'var(--text-base)' }}
              title="Configurar categorías"
            >
              ⚙️ Config
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
    </header>
  )
}
