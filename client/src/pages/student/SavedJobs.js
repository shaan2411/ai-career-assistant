/**
 * SavedJobs.js
 * Saved jobs with Kanban-style status tracker.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const STATUSES = [
  { id: 'saved', label: 'Saved', icon: '🔖', color: 'var(--info)' },
  { id: 'applied', label: 'Applied', icon: '📤', color: 'var(--primary-light)' },
  { id: 'interviewing', label: 'Interviewing', icon: '🎯', color: 'var(--warning)' },
  { id: 'offered', label: 'Offered', icon: '🎉', color: 'var(--success)' },
  { id: 'rejected', label: 'Rejected', icon: '❌', color: 'var(--danger)' },
];

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');
  const [notes, setNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const fetchSaved = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/jobs/saved');
      const data = res.data?.savedJobs || res.data || [];
      setSavedJobs(Array.isArray(data) ? data : []);
      // Build notes map
      const notesMap = {};
      (Array.isArray(data) ? data : []).forEach((j) => {
        notesMap[j._id || j.jobId] = j.notes || '';
      });
      setNotes(notesMap);
    } catch {
      setSavedJobs([
        { _id: 's1', jobId: { _id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time', skills: ['React', 'TypeScript'] }, status: 'saved', notes: '' },
        { _id: 's2', jobId: { _id: '2', title: 'Backend Engineer', company: 'StartupXYZ', location: 'NY', type: 'Full-time', skills: ['Node.js'] }, status: 'applied', notes: 'Applied via LinkedIn' },
        { _id: 's3', jobId: { _id: '3', title: 'Data Scientist Intern', company: 'DataLabs', location: 'Remote', type: 'Internship', skills: ['Python'] }, status: 'interviewing', notes: 'Interview scheduled for next Monday' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const getJob = (saved) => saved.jobId || saved.job || saved;
  const getStatus = (saved) => saved.status || 'saved';
  const getSavedId = (saved) => saved._id || saved.id;

  const updateStatus = async (savedId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [savedId]: true }));
    try {
      await axiosInstance.put(`/jobs/saved/${savedId}/status`, { status: newStatus });
      setSavedJobs((prev) => prev.map((s) => getSavedId(s) === savedId ? { ...s, status: newStatus } : s));
      toast.success(`Status updated to ${newStatus}!`);
    } catch {
      // Optimistic update fallback
      setSavedJobs((prev) => prev.map((s) => getSavedId(s) === savedId ? { ...s, status: newStatus } : s));
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [savedId]: false }));
    }
  };

  const saveNote = async (savedId) => {
    try {
      await axiosInstance.put(`/jobs/saved/${savedId}/notes`, { notes: notes[savedId] });
      setEditingNote(null);
      toast.success('Note saved!');
    } catch {
      setEditingNote(null);
    }
  };

  const removeJob = async (savedId) => {
    if (!window.confirm('Remove this job?')) return;
    try {
      await axiosInstance.delete(`/jobs/saved/${savedId}`);
      setSavedJobs((prev) => prev.filter((s) => getSavedId(s) !== savedId));
      toast.success('Job removed');
    } catch {
      setSavedJobs((prev) => prev.filter((s) => getSavedId(s) !== savedId));
    }
  };

  const filteredJobs = savedJobs.filter((s) => getStatus(s) === activeTab);

  // Stats
  const stats = STATUSES.map((st) => ({
    ...st,
    count: savedJobs.filter((s) => getStatus(s) === st.id).length,
  }));

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
          Job <span className="gradient-text">Tracker</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track your job applications through every stage</p>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        {stats.map((st) => (
          <div key={st.id} className="col-6 col-md-4 col-lg-2-4" style={{ flex: '1 1 180px' }}>
            <div
              style={{
                background: 'var(--card-dark)',
                border: `1px solid ${activeTab === st.id ? st.color + '60' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-card)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: activeTab === st.id ? 'translateY(-2px)' : 'none',
                boxShadow: activeTab === st.id ? `0 6px 20px ${st.color}30` : 'none',
              }}
              onClick={() => setActiveTab(st.id)}
            >
              <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{st.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: st.color, lineHeight: 1 }}>{st.count}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {STATUSES.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveTab(st.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${activeTab === st.id ? st.color : 'var(--border-color)'}`,
              background: activeTab === st.id ? `${st.color}20` : 'transparent',
              color: activeTab === st.id ? st.color : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            {st.icon} {st.label}
            <span style={{ background: activeTab === st.id ? st.color : 'var(--border-color)', color: activeTab === st.id ? '#fff' : 'var(--text-muted)', borderRadius: 10, padding: '0 6px', fontSize: '0.7rem', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
              {savedJobs.filter((s) => getStatus(s) === st.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Job Cards */}
      {loading ? (
        <CardLoader count={3} height={160} />
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {STATUSES.find((s) => s.id === activeTab)?.icon}
          </div>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No {activeTab} jobs yet</h3>
        </div>
      ) : (
        <div className="row g-3">
          {filteredJobs.map((saved) => {
            const job = getJob(saved);
            const savedId = getSavedId(saved);
            const status = getStatus(saved);
            const currentStatus = STATUSES.find((s) => s.id === status);

            return (
              <div key={savedId} className="col-12 col-md-6">
                <div style={{ background: 'var(--card-dark)', border: `1px solid ${currentStatus?.color}30`, borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{job.title || 'Job Title'}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                        🏢 {job.company} · 📍 {job.location}
                      </p>
                    </div>
                    <button
                      onClick={() => removeJob(savedId)}
                      style={{ background: 'var(--danger-light)', border: 'none', borderRadius: 6, color: 'var(--danger)', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    {(job.skills || []).slice(0, 4).map((s, i) => (
                      <span key={i} className="skill-tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                    ))}
                    <span className={`badge-${job.type === 'Full-time' ? 'info' : 'warning'}`} style={{ fontSize: '0.7rem' }}>{job.type}</span>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    {editingNote === savedId ? (
                      <div>
                        <textarea
                          value={notes[savedId] || ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [savedId]: e.target.value }))}
                          placeholder="Add a note..."
                          style={{ width: '100%', minHeight: 60, background: 'rgba(108,99,255,0.06)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.5rem 0.75rem', fontSize: '0.8rem', resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                        />
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                          <button onClick={() => saveNote(savedId)} className="btn-gradient" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>Save</button>
                          <button onClick={() => setEditingNote(null)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setEditingNote(savedId)}
                        style={{ fontSize: '0.8rem', color: notes[savedId] ? 'var(--text-secondary)' : 'var(--text-muted)', background: 'rgba(108,99,255,0.04)', border: '1px dashed var(--border-color)', borderRadius: 8, padding: '0.45rem 0.75rem', cursor: 'pointer' }}
                      >
                        {notes[savedId] || '📝 Click to add a note...'}
                      </div>
                    )}
                  </div>

                  {/* Status Controls */}
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Move to:</div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {STATUSES.filter((s) => s.id !== status).map((st) => (
                        <button
                          key={st.id}
                          onClick={() => updateStatus(savedId, st.id)}
                          disabled={updatingStatus[savedId]}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.72rem',
                            background: `${st.color}15`,
                            border: `1px solid ${st.color}40`,
                            borderRadius: 8,
                            color: st.color,
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {st.icon} {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default SavedJobs;
