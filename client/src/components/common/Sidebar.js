/**
 * Sidebar.js
 * Collapsible left sidebar with navigation links, user info, and admin section.
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [adminExpanded, setAdminExpanded] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard', exact: true },
    { to: '/profile', icon: '👤', label: 'Profile' },
    { to: '/resume', icon: '📄', label: 'Resume' },
    { to: '/jobs', icon: '💼', label: 'Jobs' },
    { to: '/interview', icon: '🎯', label: 'Interview' },
    { to: '/learning', icon: '📚', label: 'Learning' },
    { to: '/reports', icon: '📊', label: 'Reports' },
  ];

  const adminItems = [
    { to: '/admin', icon: '🏛️', label: 'Overview' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/jobs', icon: '📋', label: 'Jobs' },
    { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
  ];

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
    >
      {/* Collapse Toggle */}
      <button
        className="sidebar-collapse-btn d-none d-lg-flex"
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
      </button>

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🤖</div>
        {!collapsed && (
          <div className="logo-text">
            <span
              style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '0.95rem',
              }}
            >
              AI Career
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Assistant
            </div>
          </div>
        )}
        {/* Mobile close */}
        <button
          className="nav-icon-btn d-lg-none ms-auto"
          onClick={onMobileClose}
          style={{ width: 30, height: 30 }}
        >
          <i className="fas fa-times" style={{ fontSize: '0.8rem' }} />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        {!collapsed && (
          <div className="sidebar-section-label">Main Menu</div>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `nav-item-sidebar ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            {!collapsed && (
              <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>
                Administration
              </div>
            )}
            <div
              className="nav-item-sidebar"
              onClick={() => setAdminExpanded(!adminExpanded)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Admin Panel</span>
              </div>
              {!collapsed && (
                <i
                  className={`fas fa-chevron-${adminExpanded ? 'up' : 'down'}`}
                  style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}
                />
              )}
            </div>

            {adminExpanded && !collapsed && (
              <div style={{ paddingLeft: '1rem' }}>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      `nav-item-sidebar ${isActive ? 'active' : ''}`
                    }
                    style={{ fontSize: '0.82rem' }}
                  >
                    <span className="nav-icon" style={{ fontSize: '0.9rem' }}>
                      {item.icon}
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={() => { navigate('/profile'); onMobileClose && onMobileClose(); }}
        >
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">
              {user?.role === 'admin' ? '⚙️ Administrator' : '🎓 Student'}
            </div>
          </div>
        </div>

        {/* Logout */}
        {!collapsed && (
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.55rem 0.85rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            }}
          >
            <i className="fas fa-right-from-bracket" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
