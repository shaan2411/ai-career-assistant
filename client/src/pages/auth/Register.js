/**
 * Register.js
 * Beautiful register page with password strength indicator.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoader } from '../../components/common/Loader';

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--danger)' };
  if (score === 2) return { level: 2, label: 'Fair', color: 'var(--warning)' };
  if (score === 3) return { level: 3, label: 'Good', color: '#60A5FA' };
  return { level: 4, label: 'Strong', color: 'var(--success)' };
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!acceptTerms) newErrors.terms = 'You must accept the terms & conditions';
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
      await register(formData.name.trim(), formData.email, formData.password);
      toast.success('Account created! Welcome aboard 🚀');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    paddingLeft: '2.5rem',
    paddingRight: field === 'password' || field === 'confirm' ? '2.5rem' : undefined,
    borderColor: errors[field] ? 'var(--danger)' : undefined,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* ── Left Decorative Panel ── */}
      <div
        className="d-none d-lg-flex"
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #0F0F1A 0%, #16213E 50%, #1A1A2E 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
        }}
      >
        {/* Floating shapes */}
        {[
          { w: 350, h: 350, top: '-80px', right: '-80px', opacity: 0.12, delay: '0s' },
          { w: 250, h: 250, bottom: '-60px', left: '-60px', opacity: 0.08, delay: '3s' },
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
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              opacity: s.opacity,
              animation: `float 8s ease infinite ${s.delay}`,
            }}
          />
        ))}

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 420 }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.25,
            }}
          >
            Start Your AI-Powered{' '}
            <span className="gradient-text">Career Journey</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join 10,000+ students who have transformed their careers with AI assistance.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { value: '10K+', label: 'Students', icon: '🎓' },
              { value: '95%', label: 'Success Rate', icon: '🏆' },
              { value: '500+', label: 'Jobs Posted', icon: '💼' },
              { value: '4.9★', label: 'Rating', icon: '⭐' },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(108,99,255,0.1)',
                  border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: 12,
                  padding: '1rem',
                  textAlign: 'center',
                  animation: `slideInUp 0.5s ease ${i * 0.1}s both`,
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {s.label}
                </div>
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
          padding: '2.5rem 2.5rem',
          background: 'var(--card-dark)',
          overflowY: 'auto',
        }}
      >
        {/* Mobile brand */}
        <div className="d-lg-none text-center mb-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              margin: '0 auto 0.5rem',
            }}
          >
            🤖
          </div>
          <span className="gradient-text" style={{ fontWeight: 900, fontSize: '1.2rem' }}>
            AI Career Assistant
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.65rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            Create your account 🚀
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Free forever — no credit card required
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-user" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.82rem' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="form-control-custom"
                  style={inputStyle('name')}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}><i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-envelope" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.82rem' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-control-custom"
                  style={inputStyle('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}><i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.82rem' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="form-control-custom"
                  style={inputStyle('password')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0 }}>
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`} />
                </button>
              </div>

              {/* Password strength */}
              {formData.password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                    {[1, 2, 3, 4].map((lvl) => (
                      <div
                        key={lvl}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: lvl <= passwordStrength.level ? passwordStrength.color : 'var(--border-color)',
                          transition: 'background 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: passwordStrength.color, fontWeight: 600 }}>
                    {passwordStrength.label} password
                  </p>
                </div>
              )}
              {errors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}><i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="fas fa-lock" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.82rem' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="form-control-custom"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', borderColor: errors.confirmPassword ? 'var(--danger)' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'var(--success)' : undefined }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0 }}>
                  <i className={`fas fa-${showConfirm ? 'eye-slash' : 'eye'}`} />
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <i className="fas fa-check-circle" style={{ position: 'absolute', right: '2.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)', fontSize: '0.85rem' }} />
                )}
              </div>
              {errors.confirmPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}><i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => { setAcceptTerms(e.target.checked); if (errors.terms) setErrors((p) => ({ ...p, terms: '' })); }}
                  style={{ accentColor: 'var(--primary)', marginTop: 2, flexShrink: 0 }}
                />
                <span>
                  I agree to the{' '}
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.82rem' }}>
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.82rem' }}>
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}><i className="fas fa-circle-exclamation" style={{ marginRight: 4 }} />{errors.terms}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-100"
              style={{ padding: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <><ButtonLoader /> Creating account...</>
              ) : (
                <><i className="fas fa-rocket" /> Create Free Account</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
