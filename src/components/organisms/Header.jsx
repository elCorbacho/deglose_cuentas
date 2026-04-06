
import { APP_TITLE } from '../../data/config.js'
import { formatCLP } from '../../lib/formatters.js'

export default function Header({ total }) {
  return (
    <header className="header-shell fixed top-0 left-0 right-0 z-30">
      <div className="mx-auto flex h-auto min-h-10 w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-1.5 flex-col sm:flex-row">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-strong)' }}>
            {APP_TITLE}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {total !== undefined && (
            <div className="text-right ml-4 pl-4">
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
                Total general
              </p>
              <p className="mono-num text-sm font-bold" style={{ color: 'var(--text-strong)' }}>
                {formatCLP(total)}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
