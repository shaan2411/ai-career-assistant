/**
 * Layout.js
 * Main layout wrapper: Sidebar + Navbar + content area with responsive behavior.
 */
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  // Collapse sidebar on small laptops by default
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 1200) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const mainMargin = sidebarCollapsed ? '68px' : 'var(--sidebar-width)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          style={{ zIndex: 1039 }}
        />
      )}

      {/* Main area */}
      <div
        style={{
          marginLeft: window.innerWidth >= 992 ? mainMargin : 0,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
        }}
      >
        {/* Top Navbar */}
        <Navbar
          onSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          sidebarOpen={mobileSidebarOpen}
        />

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
