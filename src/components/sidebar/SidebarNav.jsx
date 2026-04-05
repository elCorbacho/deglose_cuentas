import React from 'react';
import { useSidebar } from '../SidebarContext';

const SidebarNav = () => {
  const { currentView, setView, closeSidebar } = useSidebar();

  const navItems = [
    { name: 'Transacciones', view: 'transactions', hash: '#transactions', icon: '📊' },
    { name: 'Configuración', view: 'settings', hash: '#settings', icon: '⚙️' }
  ];

  const handleNavClick = (view) => {
    setView(view);
    closeSidebar(); // Close mobile drawer after click
  };

  return (
    <nav className="space-y-1">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.view}>
            <a
              href={item.hash}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.view);
              }}
              className={`sidebar-nav-item ${currentView === item.view ? 'active' : ''} flex items-center gap-3 md:justify-center md:gap-0`}
              aria-current={currentView === item.view ? 'page' : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:inline">{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;