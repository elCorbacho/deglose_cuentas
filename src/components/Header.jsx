import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ theme, onThemeToggle }) {
  return (
    <header className="header-shell fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between px-4">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>
          Deglose Cuentas
        </h1>
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  )
}
