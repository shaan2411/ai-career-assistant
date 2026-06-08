/**
 * Navbar.js
 * Top navigation bar with brand, user dropdown, theme toggle, notifications.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onSidebarToggle, sidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
    { to: '/resume', label: 'Resume', icon: 'fa-file-lines' },
    { to: '/jobs', label: 'Jobs', icon: 'fa-briefcase' },
    { to: '/interview', label: 'Interview', icon: 'fa-microphone' },
    { to: '/learning', label: 'Learning', icon: 'fa-graduation-cap' },
    { to: '/reports', label: 'Reports', icon: 'fa-chart-bar' },
  ];

  const mockNotifications = [
    { id: 1, icon: '🤖', text: 'Your resume analysis is ready!', time: '2m ago' },
    { id: 2, icon: '💼', text: '3 new jobs match your profile', time: '1h ago' },
    { id: 3, icon: '🎯', text: 'Interview feedback available', time: '3h ago' },
  ];

  return (
    <nav className="top-navbar">
      {/* Hamburger – Mobile */}
      <button
        className="nav-icon-btn d-lg-none"
        onClick={onSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      {/* Brand – Mobile only (desktop brand is in sidebar) */}
      <Link to="/" className="navbar-brand-logo d-lg-none">
        <div className="brand-icon">🤖</div>
        <span className="brand-name">AI Career</span>
      </Link>

      {/* Desktop Nav Links */}
      <div className="d-none d-lg-flex align-items-center gap-1" style={{ flex: 1 }}>
        {isAuthenticated && navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: location.pathname.startsWith(link.to)
                ? 'var(--primary-light)'
                : 'var(--text-secondary)',
              background: location.pathname.startsWith(link.to)
                ? 'rgba(108,99,255,0.12)'
                : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <i className={`fas ${link.icon}`} style={{ fontSize: '0.8rem' }} />
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ flex: 1 }} className="d-none d-lg-block" />

      {/* Right Controls */}
      <div className="d-flex align-items-center gap-2">
        {/* Theme Toggle */}
        <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
        </button>

        {/* Notifications */}
        {isAuthenticated && (
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="nav-icon-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <i className="fas fa-bell" />
              <span className="notification-badge">3</span>
            </button>

            {notifOpen && (
              <div
                className="custom-dropdown-menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 300,
                  zIndex: 1050,
                }}
              >
                <div style={{ padding: '0.5rem 0.9rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Notifications
                </div>
                <div className="custom-dropdown-divider" />
                {mockNotifications.map((n) => (
                  <div key={n.id} className="custom-dropdown-item" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', marginTop: 2 }}>{n.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{n.text}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
                <div className="custom-dropdown-divider" />
                <div
                  className="custom-dropdown-item"
                  style={{ justifyContent: 'center', fontSize: '0.8rem', color: 'var(--primary-light)' }}
                >
                  View all notifications
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Dropdown */}
        {isAuthenticated ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className="user-avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar-circle">{getInitials(user?.name)}</div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                className="d-none d-md-block"
              >
                {user?.name?.split(' ')[0]}
              </span>
              <i
                className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}
                style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}
              />
            </button>

            {dropdownOpen && (
              <div
                className="custom-dropdown-menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  zIndex: 1050,
                }}
              >
                {/* User info header */}
                <div style={{ padding: '0.6rem 0.9rem 0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user?.email}
                  </div>
                  <span
                    className={`badge-${user?.role === 'admin' ? 'warning' : 'info'}`}
                    style={{ marginTop: 4, display: 'inline-block' }}
                  >
                    {user?.role === 'admin' ? '⚙️ Admin' : '🎓 Student'}
                  </span>
                </div>
                <div className="custom-dropdown-divider" />
                <Link
                  to="/profile"
                  className="custom-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="fas fa-user" /> My Profile
                </Link>
                <Link
                  to="/reports"
                  className="custom-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="fas fa-chart-bar" /> Reports
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="custom-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <i className="fas fa-shield" /> Admin Panel
                  </Link>
                )}
                <div className="custom-dropdown-divider" />
                <button
                  className="custom-dropdown-item danger w-100 border-0 text-start"
                  style={{ background: 'none' }}
                  onClick={() => { setDropdownOpen(false); logout(); }}
                >
                  <i className="fas fa-right-from-bracket" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="d-flex gap-2">
            <Link to="/login" className="btn-gradient-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn-gradient" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
