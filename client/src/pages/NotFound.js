import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFound — 404 Page
 * Displayed when the user navigates to an unknown route.
 */
const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #0F0F1A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div className="text-center px-4" style={{ position: 'relative', zIndex: 2 }}>
        {/* 404 Number */}
        <div
          style={{
            fontSize: 'clamp(120px, 20vw, 200px)',
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            userSelect: 'none',
          }}
        >
          404
        </div>

        {/* Emoji */}
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>

        {/* Title */}
        <h1
          style={{
            color: '#E2E8F0',
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          Houston, we have a problem!
        </h1>

        {/* Description */}
        <p
          style={{
            color: '#94A3B8',
            fontSize: '1.1rem',
            maxWidth: '500px',
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}
        >
          The page you're looking for seems to have drifted off into space. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(108, 99, 255, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(108, 99, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(108, 99, 255, 0.4)';
            }}
          >
            🏠 Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'transparent',
              color: '#E2E8F0',
              borderRadius: '10px',
              border: '1px solid rgba(108, 99, 255, 0.4)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(108, 99, 255, 0.8)';
              e.target.style.background = 'rgba(108, 99, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(108, 99, 255, 0.4)';
              e.target.style.background = 'transparent';
            }}
          >
            ← Go Back
          </button>
        </div>

        {/* Helpful links */}
        <div style={{ marginTop: '48px' }}>
          <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '12px' }}>
            Or try one of these:
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Jobs', to: '/jobs' },
              { label: 'Resume', to: '/resume' },
              { label: 'Login', to: '/login' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  color: '#6C63FF',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#00D4FF')}
                onMouseLeave={(e) => (e.target.style.color = '#6C63FF')}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
