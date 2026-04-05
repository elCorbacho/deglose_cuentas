
import { APP_TITLE } from '../../data/config.js'
import { formatCLP } from '../../lib/formatters.js'

export default function Header({ onConfigClick, showBackButton, onBackClick, total }) {
  return (
    <header className="header-shell fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-auto min-h-14 w-full max-w-[1100px] items-center justify-between gap-4 px-4 py-2 flex-col sm:flex-row">
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
            {APP_TITLE}
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
          
          {total !== undefined && (
            <div className="text-right ml-4 pl-4 border-l border-gray-300">
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                Total general
              </p>
              <p className="text-sm font-bold" style={{ color: 'var(--text-strong)' }}>
                {formatCLP(total)}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
