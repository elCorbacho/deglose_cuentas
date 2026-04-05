import React from 'react';
import { SidebarContext } from './SidebarContext';

/**
 * Layout wrapper component for dashboard grid
 * @param {Object} props
 * @param {React.ReactNode} props.children - Children to render
 */
const Layout = ({ children }) => {
  const { isOpen } = React.useContext(SidebarContext);

  return (
    <div className="grid grid-cols-[240px_1fr] md:grid-cols-[60px_1fr] lg:grid-cols-[240px_1fr] h-screen">
      <div className={`bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-[240px]' : 'w-[60px]'}`}>
        {children[0]}
      </div>
      <div className="p-4 overflow-auto">
        {children[1]}
      </div>
    </div>
  );
};

export default Layout;