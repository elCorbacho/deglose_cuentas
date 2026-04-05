import React from 'react';
import { useSidebar } from '../SidebarContext';
import SidebarNav from './SidebarNav';

/**
 * Sidebar component with responsive collapse behavior
 * @param {Object} props
 * @param {React.ReactNode} props.logo - Logo element to display in sidebar header
 */
const Sidebar = ({ logo }) => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className={`font-bold text-lg transition-all duration-300 ${isOpen ? 'block' : 'hidden md:block'}`}>
            {logo}
          </div>
          <button
            onClick={toggleSidebar}
            className="hamburger-btn md:hidden"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Navigation - always visible on desktop, shown/hidden on mobile based on isOpen */}
        <div className={`sidebar-nav ${isOpen ? 'block' : 'hidden md:block'}`}>
          <SidebarNav />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;