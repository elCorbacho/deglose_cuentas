export default function Sidebar({ activeView, hasTransactions, onNavigate }) {
  const buttons = [
    { id: 'upload', label: 'Cargar PDF', icon: '📄', disabled: false },
    { id: 'analysis', label: 'Análisis', icon: '📊', disabled: !hasTransactions },
    { id: 'config', label: 'Config', icon: '⚙️', disabled: false },
  ]

  const handleNavigate = (id) => {
    if (onNavigate && !buttons.find(b => b.id === id)?.disabled) {
      onNavigate(id)
    }
  }

  return (
    <aside className="sidebar">
      {buttons.map((btn) => (
        <div key={btn.id} className={`selection-item ${activeView === btn.id ? 'is-active' : ''}`}>
          <button
            className={`sidebar-btn ${activeView === btn.id ? 'active' : ''}`}
            onClick={() => handleNavigate(btn.id)}
            disabled={btn.disabled}
            title={btn.label}
          >
            <span className="sidebar-icon">{btn.icon}</span>
            <span className="sidebar-label">{btn.label}</span>
          </button>
        </div>
      ))}
    </aside>
  )
}
