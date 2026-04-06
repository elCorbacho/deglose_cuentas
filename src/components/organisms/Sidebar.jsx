export default function Sidebar({ activeView, hasTransactions, onNavigate }) {
  const buttons = [
    { id: 'upload', label: 'Cargar PDF', icon: '📄', disabled: false },
    { id: 'analysis', label: 'Análisis', icon: '📊', disabled: !hasTransactions },
    { id: 'config', label: 'Config', icon: '⚙️', disabled: false },
  ]

  return (
    <aside className="sidebar">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          className={`sidebar-btn ${activeView === btn.id ? 'active' : ''}`}
          onClick={() => !btn.disabled && onNavigate(btn.id)}
          disabled={btn.disabled}
          title={btn.label}
        >
          <span className="sidebar-icon">{btn.icon}</span>
          <span className="sidebar-label">{btn.label}</span>
        </button>
      ))}
    </aside>
  )
}