
import { APP_TITLE } from '../../data/config.js'
import { formatCLP } from '../../lib/formatters.js'

export default function Header({ total }) {
  return (
    <header className="header-shell sticky top-0 z-20 border-b bg-[var(--surface-secondary)]">
      <div className="mx-auto flex h-auto min-h-14 w-full items-center justify-between gap-4 px-4 py-2 flex-col sm:flex-row">
        <div className="flex items-center gap-3">
           <h1 className="text-lg font-semibold" style={{ color: 'var(--color-opencode-light)' }}>
             {APP_TITLE}
           </h1>
        </div>
        <div className="flex items-center gap-3">
           {total !== undefined && (
             <div className="text-right ml-4 pl-4 border-l" style={{ borderColor: 'var(--color-border-gray)' }}>
               <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-gray-secondary)' }}>
                 Total general
               </p>
               <p className="text-sm font-bold" style={{ color: 'var(--color-opencode-light)' }}>
                 {formatCLP(total)}
               </p>
             </div>
           )}
        </div>
      </div>
    </header>
  )
}
