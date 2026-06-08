/**
 * Login.js
 * Beautiful split-layout login page with animations and validation.
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoader } from '../../components/common/Loader';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* ── Left Panel ── */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #0F0F1A 0%, #1A1A2E 40%, #16213E 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
        }}
        className="d-none d-lg-flex"
      >
        {/* Animated shapes */}
        {[
          { w: 400, h: 400, top: '-100px', left: '-100px', delay: '0s', opacity: 0.12 },
          { w: 300, h: 300, bottom: '-80px', right: '-80px', delay: '2s', opacity: 0.08 },
          { w: 150, h: 150, top: '40%', left: '60%', delay: '4s', opacity: 0.06 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s.w,
              height: s.h,
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              opacity: s.opacity,
              animation: `float 6s ease infinite ${s.delay}`,
            }}
          />
        ))}

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 440 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              margin: '0 auto 2rem',
              boxShadow: '0 10px 30px rgba(108,99,255,0.5)',
              animation: 'pulse-glow 3s infinite',
            }}
          >
            🤖
          </div>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '1rem',
              color: 'var(--text-primary)',
            }}
          >
            Supercharge Your{' '}
            <span className="gradient-text">Career with AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
            AI-powered resume analysis, mock interviews, job matching, and personalized learning roadmaps — all in one place.
          </p>

          {/* Feature highlights */}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { icon: '📄', text: 'AI Resume Analysis & Scoring' },
              { icon: '🎯', text: 'Smart Mock Interview Practice' },
              { icon: '💼', text: 'Personalized Job Recommendations' },
              { icon: '📚', text: 'Custom Learning Roadmaps' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(108,99,255,0.08)',
                  border: '1px solid rgba(108,99,255,0.15)',
                  borderRadius: 10,
                  padding: '0.65rem 1rem',
                  animation: `slideInLeft 0.5s ease ${i * 0.1}s both`,
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {f.text}
                </span>
                <i className="fas fa-check-circle" style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: '0.8rem' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel – Form ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2.5rem',
          background: 'var(--card-dark)',
        }}
      >
        {/* Mobile brand */}
        <div className="d-lg-none text-center mb-4">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 0.75rem',
              boxShadow: '0 6px 20px rgba(108,99,255,0.4)',
            }}
          >
            🤖
          </div>
          <h2 className="gradient-text" style={{ fontWeight: 900, fontSize: '1.4rem' }}>
            AI Career Assistant
          </h2>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2
            style={{
              fontWeight: 800,
              fontSize: '1.75rem',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Welcome back 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Sign in to continue your career journey
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.4rem',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fas fa-envelope"
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-control-custom"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                  <i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.4rem',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fas fa-lock"
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-control-custom"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    padding: 0,
                  }}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} />
                </button>
              </div>
              {errors.password && (
                <p style={{ color: 'var(--danger)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                  <i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Remember me
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-100"
              style={{ padding: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <ButtonLoader />
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-right-to-bracket" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.5rem 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          </div>

          {/* Register link */}
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary-light)', fontWeight: 600 }}
            >
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
