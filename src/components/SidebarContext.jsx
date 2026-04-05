import { createContext, useContext, useState } from 'react';

// Create Sidebar Context
const SidebarContext = createContext();

// Create Sidebar Provider component
const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('transactions');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const setView = (view) => {
    setCurrentView(view);
    // Update hash
    window.location.hash = view === 'transactions' ? '#transactions' : '#settings';
  };

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar, currentView, setView }}> 
      {children}
    </SidebarContext.Provider>
  );
};

// Create custom hook to use Sidebar Context
const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Export components and hook
export { SidebarProvider, useSidebar, SidebarContext };