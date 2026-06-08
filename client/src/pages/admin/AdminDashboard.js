/**
 * AdminDashboard.js
 * Admin dashboard overview displaying stats, user growth, popular features, and recent users.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/admin/analytics');
      if (res.data?.success) {
        setStats(res.data.analytics);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch analytics');
      // Set fallback mock stats for offline preview
      setStats({
        totalUsers: 24,
        activeUsers: 20,
        inactiveUsers: 4,
        newUsersThisWeek: 6,
        totalResumes: 18,
        totalJobs: 12,
        totalInterviews: 45,
        aiUsageTotal: 88,
        userGrowth: [
          { date: 'Mon', newUsers: 2 },
          { date: 'Tue', newUsers: 4 },
          { date: 'Wed', newUsers: 1 },
          { date: 'Thu', newUsers: 3 },
          { date: 'Fri', newUsers: 6 },
          { date: 'Sat', newUsers: 2 },
          { date: 'Sun', newUsers: 5 },
        ],
        popularFeatures: [
          { feature: 'resume-analysis', count: 32 },
          { feature: 'career-paths', count: 18 },
          { feature: 'interview-questions', count: 22 },
          { feature: 'learning-roadmap', count: 16 },
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentUsers = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/admin/users?limit=5');
      if (res.data?.success) {
        setRecentUsers(res.data.users);
      }
    } catch (err) {
      // Set fallback mock users
      setRecentUsers([
        { _id: '1', name: 'Alice Smith', email: 'alice@student.com', role: 'student', isActive: true, createdAt: new Date().toISOString() },
        { _id: '2', name: 'Bob Johnson', email: 'bob@student.com', role: 'student', isActive: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '3', name: 'John Doe', email: 'john@student.com', role: 'student', isActive: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { _id: '4', name: 'Admin User', email: 'admin@aicareer.com', role: 'admin', isActive: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      ]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentUsers();
  }, [fetchAnalytics, fetchRecentUsers]);

  // SVG Line Chart calculations
  const renderGrowthChart = () => {
    if (!stats?.userGrowth || stats.userGrowth.length === 0) return null;
    const maxVal = Math.max(...stats.userGrowth.map(d => d.newUsers), 5);
    const height = 120;
    const width = 500;
    const padding = 20;

    const points = stats.userGrowth.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (stats.userGrowth.length - 1);
      const y = height - padding - (d.newUsers * (height - padding * 2)) / maxVal;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {/* Gradients */}
        <defs>
          <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-subtle)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-subtle)" strokeDasharray="3" strokeWidth="1" />

        {/* Area */}
        <path
          d={`M ${padding},${height - padding} L ${points} L ${width - padding},${height - padding} Z`}
          fill="url(#growthGrad)"
        />

        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          points={points}
        />

        {/* Data points */}
        {stats.userGrowth.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / (stats.userGrowth.length - 1);
          const y = height - padding - (d.newUsers * (height - padding * 2)) / maxVal;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="var(--accent)" stroke="var(--card-dark)" strokeWidth="2" />
              <text x={x} y={y - 8} fontSize="8" fill="var(--text-secondary)" textAnchor="middle">{d.newUsers}</text>
              <text x={x} y={height - 4} fontSize="8" fill="var(--text-muted)" textAnchor="middle">{d.date}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <Layout>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          🛡️ Administrator Area
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '0.35rem' }}>
              System <span className="gradient-text">Overview</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Real-time platform usage metrics and administrative operations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/users" className="btn-gradient" style={{ fontSize: '0.85rem', padding: '0.55rem 1.2rem' }}>
              <i className="fas fa-users me-1" /> Manage Users
            </Link>
            <Link to="/admin/jobs" className="btn-gradient-outline" style={{ fontSize: '0.85rem', padding: '0.55rem 1.2rem' }}>
              <i className="fas fa-briefcase me-1" /> Manage Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      {loading ? (
        <div className="row g-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-3">
              <CardLoader />
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {/* Card 1 */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="widget-card h-100">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Total Users</p>
                  <h2 className="fw-extrabold m-0 text-white" style={{ fontSize: '1.8rem' }}>{stats?.totalUsers || 0}</h2>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem' }}>👥</div>
              </div>
              <div className="mt-3">
                <span className="badge-success">+{stats?.newUsersThisWeek || 0} this week</span>
                <span className="small text-muted ms-2">{stats?.activeUsers || 0} Active</span>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="widget-card h-100">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Resumes Scored</p>
                  <h2 className="fw-extrabold m-0 text-white" style={{ fontSize: '1.8rem' }}>{stats?.totalResumes || 0}</h2>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem' }}>📄</div>
              </div>
              <div className="mt-3">
                <span className="badge-info">ATS Compatible</span>
              </div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="widget-card h-100">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Jobs Available</p>
                  <h2 className="fw-extrabold m-0 text-white" style={{ fontSize: '1.8rem' }}>{stats?.totalJobs || 0}</h2>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem' }}>💼</div>
              </div>
              <div className="mt-3">
                <span className="small text-muted">Platform Postings</span>
              </div>
            </div>
          </div>
          {/* Card 4 */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="widget-card h-100">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>AI Operations</p>
                  <h2 className="fw-extrabold m-0 text-white" style={{ fontSize: '1.8rem' }}>{stats?.aiUsageTotal || 0}</h2>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.2rem' }}>🤖</div>
              </div>
              <div className="mt-3">
                <span className="badge-gradient">Gemini Core</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* User Growth Chart */}
        <div className="col-lg-8">
          <div className="app-card p-4">
            <h5 className="text-white mb-3" style={{ fontSize: '1.05rem', fontWeight: 700 }}>User Growth (Last 7 Days)</h5>
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <p className="text-muted">Loading chart data...</p> : renderGrowthChart()}
            </div>
          </div>
        </div>

        {/* Feature Usage Breakdown */}
        <div className="col-lg-4">
          <div className="app-card p-4 h-100">
            <h5 className="text-white mb-3" style={{ fontSize: '1.05rem', fontWeight: 700 }}>Popular Features</h5>
            {loading ? (
              <p className="text-muted">Loading features...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats?.popularFeatures?.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <span className="text-secondary" style={{ textTransform: 'capitalize' }}>
                        {item.feature.replace('-', ' ')}
                      </span>
                      <span className="fw-bold text-white">{item.count} calls</span>
                    </div>
                    <div className="progress" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${(item.count / Math.max(...stats.popularFeatures.map(f => f.count), 1)) * 100}%`,
                          borderRadius: 3,
                          background: 'var(--gradient-primary) !important'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="app-card p-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h5 className="text-white m-0" style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent User Registrations</h5>
          <Link to="/admin/users" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>
            View All Users →
          </Link>
        </div>

        {usersLoading ? (
          <div style={{ padding: '2rem', textAlignment: 'center' }}>
            <p className="text-muted">Loading registrations...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ color: 'var(--text-secondary)', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr style={{ border: 'none', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <th style={{ background: 'transparent', border: 'none' }}>Name</th>
                  <th style={{ background: 'transparent', border: 'none' }}>Email</th>
                  <th style={{ background: 'transparent', border: 'none' }}>Role</th>
                  <th style={{ background: 'transparent', border: 'none' }}>Status</th>
                  <th style={{ background: 'transparent', border: 'none' }}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr
                    key={u._id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <td style={{ border: 'none', padding: '0.75rem 1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {u.name}
                    </td>
                    <td style={{ border: 'none', padding: '0.75rem 1rem' }}>
                      {u.email}
                    </td>
                    <td style={{ border: 'none', padding: '0.75rem 1rem' }}>
                      <span className={u.role === 'admin' ? 'badge-danger' : 'badge-gradient'}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ border: 'none', padding: '0.75rem 1rem' }}>
                      <span className={u.isActive ? 'badge-success' : 'badge-warning'}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ border: 'none', padding: '0.75rem 1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
