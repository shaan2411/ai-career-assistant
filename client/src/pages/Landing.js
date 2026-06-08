/**
 * Landing.js
 * Stunning landing page for the AI-Powered Student Career Assistant.
 */
import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg top-navbar" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1100 }}>
        <div className="container">
          <Link to="/" className="navbar-brand-logo">
            <div className="brand-icon">🤖</div>
            <span className="brand-name">AI Career Assistant</span>
          </Link>
          <div className="ms-auto d-flex align-items-center gap-3">
            <Link to="/login" className="btn-gradient-outline" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-gradient" style={{ padding: '0.45rem 1.3rem', fontSize: '0.85rem' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        style={{
          background: 'var(--gradient-hero)',
          paddingTop: '160px',
          paddingBottom: '120px',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {/* Decorative background glow circles */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-100px',
            pointerEvents: 'none',
          }}
        />

        <div className="container position-relative" style={{ zIndex: 10 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0 text-center text-lg-start">
              <span
                className="badge badge-gradient mb-3"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', letterSpacing: '0.05em' }}
              >
                🚀 NEXT-GEN CAREER READINESS
              </span>
              <h1 className="display-4 fw-extrabold mb-4" style={{ letterSpacing: '-0.02em', fontSize: '3.2rem' }}>
                Supercharge Your Career with <span className="gradient-text">AI Power</span>
              </h1>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.1rem', maxWidth: '520px' }}>
                An intelligent dashboard designed to analyze your resume, prepare you for mock interviews, suggestion personalized skills roadmaps, and match you with perfect jobs.
              </p>
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                <Link to="/register" className="btn-gradient px-4 py-3" style={{ fontSize: '1rem' }}>
                  Start Free Assistant <i className="fas fa-arrow-right ms-2" />
                </Link>
                <Link to="/login" className="btn-gradient-outline px-4 py-3" style={{ fontSize: '1rem' }}>
                  Explore Features
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div
                className="glass-card p-4 d-inline-block position-relative"
                style={{
                  maxWidth: '100%',
                  width: '480px',
                  border: '1px solid rgba(108,99,255,0.25)',
                  boxShadow: 'var(--shadow-glow)',
                  animation: 'float 6s ease-in-out infinite',
                }}
              >
                {/* Visual Representation of Dashboard */}
                <div className="text-start mb-3 border-bottom pb-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span style={{ fontSize: '1.5rem' }}>🎓</span>
                    <div>
                      <h6 className="m-0 text-white">AI Candidate Profile</h6>
                      <small style={{ color: 'var(--text-muted)' }}>Career Assistant Engine</small>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 rounded text-center" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.1)' }}>
                      <div className="text-secondary small mb-1">Resume Score</div>
                      <div className="h4 m-0 fw-bold text-white">88<span style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>/100</span></div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded text-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.1)' }}>
                      <div className="text-secondary small mb-1">ATS Match</div>
                      <div className="h4 m-0 fw-bold" style={{ color: 'var(--accent)' }}>Optimal</div>
                    </div>
                  </div>

                  <div className="col-12 text-start">
                    <div className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small text-white">Skills Gap: Full-Stack Dev</span>
                        <span className="small badge bg-success-light text-success">92%</span>
                      </div>
                      <div className="progress" style={{ height: 6, background: 'rgba(255,255,255,0.1)' }}>
                        <div className="progress-bar bg-success" style={{ width: '92%', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>

                  <div className="col-12 text-start">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge-gradient d-inline-block" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                      <small style={{ color: 'var(--text-secondary)' }}>Recommendation: Quantify your achievements.</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge-gradient d-inline-block" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                      <small style={{ color: 'var(--text-secondary)' }}>Next: Try Mixed Mock Interview Session.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-5" style={{ background: 'var(--card-darker)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <h2 className="display-5 fw-extrabold gradient-text m-0">10,000+</h2>
                <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.95rem' }}>Students Supported</p>
              </div>
            </div>
            <div className="col-md-4 border-start border-end" style={{ borderColor: 'var(--border-color) !important' }}>
              <div className="p-3">
                <h2 className="display-5 fw-extrabold gradient-text m-0">95%</h2>
                <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.95rem' }}>Career Satisfaction</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <h2 className="display-5 fw-extrabold gradient-text m-0">500+</h2>
                <p className="text-secondary mt-2 mb-0" style={{ fontSize: '0.95rem' }}>Job Vacancies Posted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-uppercase text-secondary font-weight-bold" style={{ letterSpacing: '0.1em', fontSize: '0.8rem' }}>Core System Features</span>
            <h2 className="h1 mt-2 text-white fw-bold">Everything You Need for Career Success</h2>
            <p className="text-secondary mx-auto mt-3" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
              Leverage state-of-the-art Generative AI models to analyze, prep, practice, and land your dream job role.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="widget-card h-100">
                <div className="fs-1 mb-3">📄</div>
                <h4 className="text-white mb-2">Resume AI Analysis</h4>
                <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                  Upload your resume in PDF/DOCX format and instantly receive ATS scores, structural insights, keyword optimization, and cover letters.
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="widget-card h-100">
                <div className="fs-1 mb-3">🎯</div>
                <h4 className="text-white mb-2">Mock Interview Coach</h4>
                <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                  Generate tailored interview questions based on your target role and experience, type answers, and get real-time AI scoring and advice.
                </p>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="widget-card h-100">
                <div className="fs-1 mb-3">📚</div>
                <h4 className="text-white mb-2">Learning Roadmaps</h4>
                <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                  Perform skill gap analysis between your current profile and target job roles, then follow week-by-week roadmaps to master missing skills.
                </p>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="col-md-4">
              <div className="widget-card h-100">
                <div className="fs-1 mb-3">💼</div>
                <h4 className="text-white mb-2">Smart Job Matching</h4>
                <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                  Get matching job postings recommended specifically for your skillset. Track applications on a streamlined status board.
                </p>
              </div>
            </div>
            {/* Feature 5 */}
            <div className="col-md-4">
              <div className="widget-card h-100">
                <div className="fs-1 mb-3">💡</div>
                <h4 className="text-white mb-2">Project Generators</h4>
                <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                  Generate highly-optimized project ideas based on target frameworks and skills to build your portfolio and show off your knowledge.
                </p>
              </div>
            </div>
            {/* Feature 6 */}
            <div className="col-md-4">
              <div className="widget-card h-100">
                <div className="fs-1 mb-3">📊</div>
                <h4 className="text-white mb-2">AI Career Reports</h4>
                <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                  Generate and export comprehensive weekly improvement analytics, career path explorations, and mock interview summaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-5" style={{ background: 'var(--card-darker)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="h1 text-white fw-bold">Simple 3-Step Process</h2>
            <p className="text-secondary mx-auto mt-2" style={{ maxWidth: '500px', fontSize: '0.95rem' }}>
              Launch your career development journey in three simple steps.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-md-4 text-center">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', border: '2px solid var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                1
              </div>
              <h4 className="text-white mb-2">Create Account</h4>
              <p className="text-secondary px-3" style={{ fontSize: '0.88rem' }}>
                Register as a student, and fill in your education, experience, and target roles in your profile.
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: 'rgba(0,212,255,0.1)', color: 'var(--accent)', border: '2px solid var(--accent)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                2
              </div>
              <h4 className="text-white mb-2">AI Diagnosis</h4>
              <p className="text-secondary px-3" style={{ fontSize: '0.88rem' }}>
                Upload your resume to receive structural scores, analysis, and generate mock tests and roadmaps.
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '2px solid var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                3
              </div>
              <h4 className="text-white mb-2">Upskill & Land Jobs</h4>
              <p className="text-secondary px-3" style={{ fontSize: '0.88rem' }}>
                Follow roadmaps, practice questions, and apply to job recommendations built just for your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="h1 text-white fw-bold">Success Stories</h2>
            <p className="text-secondary mx-auto mt-2" style={{ maxWidth: '500px', fontSize: '0.95rem' }}>
              See what students are saying about the AI Career Assistant.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="glass-card p-4 h-100" style={{ transform: 'none', transition: 'none' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="user-avatar-circle" style={{ width: 40, height: 40 }}>JD</div>
                  <div>
                    <h6 className="m-0 text-white">John Doe</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Software Engineer @ TechCorp</small>
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.88rem', fontStyle: 'italic' }}>
                  "The resume analyzer was spot on. I added the recommended keywords, did three mock interviews, and secured my job within 2 weeks!"
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card p-4 h-100" style={{ transform: 'none', transition: 'none' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="user-avatar-circle" style={{ width: 40, height: 40 }}>AS</div>
                  <div>
                    <h6 className="m-0 text-white">Alice Smith</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Data Scientist @ FinGlobal</small>
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.88rem', fontStyle: 'italic' }}>
                  "I was switching fields from Marketing to Data Science. The AI-generated skill gap roadmap gave me a week-by-week learning plan that saved me months."
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card p-4 h-100" style={{ transform: 'none', transition: 'none' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="user-avatar-circle" style={{ width: 40, height: 40 }}>MK</div>
                  <div>
                    <h6 className="m-0 text-white">Michael Kim</h6>
                    <small style={{ color: 'var(--text-muted)' }}>Full-Stack Developer Intern</small>
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: '0.88rem', fontStyle: 'italic' }}>
                  "The cover letter generator tailor-makes templates for every job description. Highly recommended for students applying to dozens of roles!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5" style={{ background: 'var(--card-dark)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="navbar-brand-logo mb-3">
                <div className="brand-icon">🤖</div>
                <span className="brand-name">AI Career Assistant</span>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.85rem', maxWidth: '380px' }}>
                Empowering students to find their career direction, upgrade their skills, and secure job placements using generative intelligence.
              </p>
            </div>
            <div className="col-lg-6 text-lg-end">
              <p className="text-secondary m-0" style={{ fontSize: '0.85rem' }}>
                © {new Date().getFullYear()} AI Career Assistant. Pair programmed with Antigravity.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
