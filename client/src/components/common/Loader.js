/**
 * Loader.js
 * Reusable loading components: PageLoader, CardLoader, ButtonLoader.
 */
import React from 'react';

// ── Page Loader ──
// Full-screen loader displayed while checking auth or loading heavy pages.
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="page-loader">
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-ring" />
      {/* Inner glow dot */}
      <div
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          boxShadow: '0 0 12px var(--accent)',
        }}
      />
    </div>
    <div className="loader-text">{text}</div>
    {/* Brand under loader */}
    <div
      style={{
        marginTop: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 0.5,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
        }}
      >
        🤖
      </div>
      <span
        style={{
          fontWeight: 800,
          fontSize: '0.9rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        AI Career Assistant
      </span>
    </div>
  </div>
);

// ── Card Loader ──
// Skeleton placeholder for cards while data is loading.
export const CardLoader = ({ count = 3, height = 160 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-card skeleton" style={{ height, marginBottom: 16 }} />
    ))}
  </div>
);

// ── Widget Skeleton ──
// A detailed widget skeleton with multiple lines.
export const WidgetSkeleton = () => (
  <div className="widget-card" style={{ animation: 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40, borderRadius: 10 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text wide" />
        <div className="skeleton skeleton-text medium" />
      </div>
    </div>
    <div className="skeleton skeleton-text wide" />
    <div className="skeleton skeleton-text medium" />
    <div className="skeleton skeleton-text short" />
  </div>
);

// ── Table Skeleton ──
// Skeleton for table rows.
export const TableSkeleton = ({ rows = 5 }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.75rem 0',
          borderBottom: '1px solid var(--border-color)',
          alignItems: 'center',
        }}
      >
        <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36 }} />
        <div style={{ flex: 2 }}>
          <div className="skeleton skeleton-text wide" style={{ height: 12 }} />
          <div className="skeleton skeleton-text medium" style={{ height: 10 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text medium" style={{ height: 12 }} />
        </div>
        <div className="skeleton skeleton-badge" />
      </div>
    ))}
  </div>
);

// ── Button Loader ──
// Small inline spinner for button loading states.
export const ButtonLoader = ({ size = 16, color = '#fff' }) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid rgba(255,255,255,0.3)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }}
  />
);

export default PageLoader;
