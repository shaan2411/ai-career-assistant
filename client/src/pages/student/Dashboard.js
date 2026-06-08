/**
 * Dashboard.js
 * Student dashboard with widget cards, quick actions, and activity feed.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { WidgetSkeleton } from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';

// ── Score Ring SVG ──
const ScoreRing = ({ score = 0, size = 100, strokeWidth = 8, color = 'url(#scoreGrad)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const id = `scoreGrad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg className="score-ring" width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
        <circle
          className="score-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={`url(#${id})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-text">
        <div className="score-value gradient-text">{score}</div>
        <div className="score-label">/ 100</div>
      </div>
    </div>
  );
};

// ── Career Tips ──
const tips = [
  '📌 Tailor your resume for each job application — keywords matter!',
  '🤝 Connect with alumni on LinkedIn to discover hidden opportunities.',
  '📝 Practice STAR method for behavioral interview questions.',
  '💡 Build portfolio projects that solve real-world problems.',
  '🌐 Contribute to open source to showcase your coding skills.',
  '📚 Spend 30 minutes daily on learning new skills to stay competitive.',
  '🎯 Set SMART goals for your career — Specific, Measurable, Achievable.',
];

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [learningData, setLearningData] = useState(null);
  const [activities, setActivities] = useState([]);
  const todayTip = tips[new Date().getDay() % tips.length];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, resumeRes, jobsRes, learningRes] = await Promise.allSettled([
        axiosInstance.get('/users/profile'),
        axiosInstance.get('/resumes/my'),
        axiosInstance.get('/jobs/saved'),
        axiosInstance.get('/learning/plan'),
      ]);

      if (profileRes.status === 'fulfilled') setProfileData(profileRes.value.data);
      if (resumeRes.status === 'fulfilled') {
        const resumes = resumeRes.value.data?.resumes || resumeRes.value.data || [];
        setResumeData(Array.isArray(resumes) ? resumes[0] : resumes);
      }
      if (jobsRes.status === 'fulfilled') {
        const jobs = jobsRes.value.data?.savedJobs || jobsRes.value.data || [];
        setSavedJobsCount(Array.isArray(jobs) ? jobs.length : 0);
      }
      if (learningRes.status === 'fulfilled') setLearningData(learningRes.value.data);

      // Mock activities
      setActivities([
        { icon: '📄', text: 'Resume analyzed — Score: 78/100', time: '2 hours ago', type: 'resume' },
        { icon: '🎯', text: 'Completed mock interview for Frontend Developer', time: 'Yesterday', type: 'interview' },
        { icon: '💼', text: 'Saved 3 new jobs matching your profile', time: '2 days ago', type: 'job' },
        { icon: '📚', text: 'Completed Week 2 of React learning roadmap', time: '3 days ago', type: 'learning' },
        { icon: '📊', text: 'Weekly career report generated', time: '5 days ago', type: 'report' },
      ]);
    } catch {
      // Use mock data if API unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calculate profile completion
  const calcCompletion = () => {
    if (!profileData && !user) return 40;
    const fields = ['name', 'email', 'phone', 'location', 'bio', 'github', 'linkedin'];
    const filled = fields.filter((f) => user?.[f] || profileData?.[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calcCompletion();
  const resumeScore = resumeData?.score || resumeData?.analysis?.score || 0;

  const quickActions = [
    { icon: '📄', label: 'Upload Resume', to: '/resume', color: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
    { icon: '🎯', label: 'Start Interview', to: '/interview', color: '#00D4FF', bg: 'rgba(0,212,255,0.12)' },
    { icon: '💼', label: 'Find Jobs', to: '/jobs', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { icon: '📚', label: 'Learning Plan', to: '/learning', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ];

  const upcomingTasks = [
    { task: 'Complete your profile (add skills)', priority: 'high', icon: '👤' },
    { task: 'Upload your latest resume', priority: 'high', icon: '📄' },
    { task: 'Practice 5 interview questions', priority: 'medium', icon: '🎯' },
    { task: 'Apply to 3 matching jobs', priority: 'medium', icon: '💼' },
    { task: 'Complete Week 3 learning tasks', priority: 'low', icon: '📚' },
  ];

  const priorityColor = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };

  return (
    <Layout>
      {/* ── Welcome Header ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              👋 {getGreeting()}
            </p>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '0.35rem' }}>
              {user?.name?.split(' ')[0] || 'Student'}{' '}
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track your career progress and AI-powered insights
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/resume" className="btn-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
              <i className="fas fa-bolt" /> Quick Analyze
            </Link>
            <Link to="/reports" className="btn-gradient-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>
              <i className="fas fa-chart-bar" /> View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* ── AI Tip of the Day ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.12) 0%, rgba(0,212,255,0.08) 100%)',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: 'var(--radius-card)',
          padding: '0.9rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>🤖</span>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', display: 'block', marginBottom: 2 }}>
            AI Tip of the Day
          </span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{todayTip}</span>
        </div>
      </div>

      {/* ── Widget Cards Grid ── */}
      <div className="row g-3 mb-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-xl-4">
              <WidgetSkeleton />
            </div>
          ))
        ) : (
          <>
            {/* Profile Completion */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="widget-card h-100">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Profile</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>Completion</h3>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ScoreRing score={completion} size={90} strokeWidth={7} />
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      {completion < 60 ? '⚠️ Complete your profile to get better matches' : completion < 90 ? '👍 Almost there! Add more details' : '🌟 Great profile!'}
                    </p>
                    <Link to="/profile" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      Update Profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Score */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="widget-card h-100">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Resume</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>AI Score</h3>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📄</div>
                </div>
                {resumeScore > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ScoreRing
                      score={resumeScore}
                      size={90}
                      strokeWidth={7}
                    />
                    <div>
                      <span className={`badge-${resumeScore >= 80 ? 'success' : resumeScore >= 60 ? 'warning' : 'danger'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                        {resumeScore >= 80 ? '✅ Excellent' : resumeScore >= 60 ? '⚡ Good' : '⚠️ Needs Work'}
                      </span>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.4rem' }}>ATS Compatible</p>
                      <Link to="/resume" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>Improve →</Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Upload resume to get your AI score</p>
                    <Link to="/resume" className="btn-gradient" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>Upload Resume</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Top Skills */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="widget-card h-100">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Profile</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>Top Skills</h3>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚡</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(profileData?.skills || user?.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git']).slice(0, 8).map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                  {(!profileData?.skills?.length && !user?.skills?.length) && (
                    <Link to="/profile" style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>Add your skills →</Link>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="widget-card h-100">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Learning</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>Roadmap Progress</h3>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📚</div>
                </div>
                {learningData ? (
                  <>
                    <div style={{ marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        <span>{learningData.role || 'Frontend Developer'}</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                          {learningData.progress || 35}%
                        </span>
                      </div>
                      <div className="custom-progress">
                        <div className="custom-progress-bar" style={{ width: `${learningData.progress || 35}%` }} />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {learningData.completedWeeks || 2} of {learningData.totalWeeks || 8} weeks completed
                    </p>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>No roadmap yet</p>
                    <Link to="/learning" className="btn-gradient" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>Generate Roadmap</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="widget-card h-100">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>AI</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>Upcoming Tasks</h3>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✅</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {upcomingTasks.slice(0, 4).map((task, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
                      <span style={{ fontSize: '1rem' }}>{task.icon}</span>
                      <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{task.task}</span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[task.priority], flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="col-12 col-sm-6 col-xl-4">
              <div className="widget-card h-100">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>Jobs</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>Saved Jobs</h3>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💼</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 900,
                      background: 'var(--gradient-primary)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1,
                    }}
                  >
                    {savedJobsCount}
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                      Jobs saved for later
                    </p>
                    <Link to="/jobs/saved" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      View Tracker →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="section-header">
          <div className="section-title">
            <div className="title-accent" />
            Quick Actions
          </div>
        </div>
        <div className="row g-3">
          {quickActions.map((action, i) => (
            <div key={i} className="col-6 col-md-3">
              <Link
                to={action.to}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '1.25rem 1rem',
                  background: action.bg,
                  border: `1px solid ${action.color}33`,
                  borderRadius: 'var(--radius-card)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${action.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{action.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
                  {action.label}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div>
        <div className="section-header">
          <div className="section-title">
            <div className="title-accent" />
            Recent Activity
          </div>
          <Link to="/reports" style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 600 }}>
            View All →
          </Link>
        </div>
        <div
          style={{
            background: 'var(--card-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          {activities.map((act, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.9rem 1.25rem',
                borderBottom: i < activities.length - 1 ? '1px solid var(--border-color)' : 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(108,99,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                {act.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', marginBottom: 2, fontWeight: 500 }}>
                  {act.text}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{act.time}</p>
              </div>
              <span className="badge-info">{act.type}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
