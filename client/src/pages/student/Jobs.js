/**
 * Jobs.js
 * Job listings with search, filters, recommendations, and save functionality.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Internship', 'Contract', 'Freelance'];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ types: [], location: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [savingJob, setSavingJob] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filters.location) params.append('location', filters.location);
      if (filters.types.length) params.append('type', filters.types.join(','));
      params.append('page', page);
      params.append('limit', 9);

      const res = await axiosInstance.get(`/jobs?${params}`);
      setJobs(res.data?.jobs || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      // Mock jobs if API unavailable
      setJobs([
        { _id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time', skills: ['React', 'TypeScript', 'CSS'], salary: '$80k - $120k', description: 'Build amazing user interfaces with React and TypeScript.', applicationUrl: '#' },
        { _id: '2', title: 'Backend Engineer', company: 'StartupXYZ', location: 'New York', type: 'Full-time', skills: ['Node.js', 'MongoDB', 'AWS'], salary: '$90k - $130k', description: 'Design and implement scalable backend services.', applicationUrl: '#' },
        { _id: '3', title: 'Data Scientist Intern', company: 'DataLabs', location: 'Remote', type: 'Internship', skills: ['Python', 'ML', 'Pandas'], salary: '$25/hr', description: 'Analyze large datasets and build ML models.', applicationUrl: '#' },
        { _id: '4', title: 'UI/UX Designer', company: 'DesignHub', location: 'San Francisco', type: 'Full-time', skills: ['Figma', 'Sketch', 'Prototyping'], salary: '$75k - $110k', description: 'Create beautiful user experiences for our products.', applicationUrl: '#' },
        { _id: '5', title: 'DevOps Engineer', company: 'CloudSystems', location: 'Remote', type: 'Contract', skills: ['Docker', 'Kubernetes', 'CI/CD'], salary: '$110k - $150k', description: 'Manage and automate infrastructure operations.', applicationUrl: '#' },
        { _id: '6', title: 'Mobile Developer', company: 'AppFactory', location: 'Austin', type: 'Full-time', skills: ['React Native', 'iOS', 'Android'], salary: '$85k - $125k', description: 'Build cross-platform mobile applications.', applicationUrl: '#' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [search, filters, page]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/jobs/recommendations');
      setRecommendations(res.data?.jobs || res.data || []);
    } catch {
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  }, []);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/jobs/saved');
      const saved = res.data?.savedJobs || res.data || [];
      setSavedJobs(new Set(saved.map((j) => j._id || j.jobId)));
    } catch {}
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { fetchRecommendations(); fetchSaved(); }, [fetchRecommendations, fetchSaved]);

  const saveJob = async (jobId) => {
    setSavingJob((prev) => ({ ...prev, [jobId]: true }));
    try {
      if (savedJobs.has(jobId)) {
        await axiosInstance.delete(`/jobs/save/${jobId}`);
        setSavedJobs((prev) => { const s = new Set(prev); s.delete(jobId); return s; });
        toast.success('Job removed from saved');
      } else {
        await axiosInstance.post(`/jobs/save/${jobId}`);
        setSavedJobs((prev) => new Set([...prev, jobId]));
        toast.success('Job saved! 💼');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setSavingJob((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const toggleType = (type) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
    setPage(1);
  };

  const typeColors = {
    'Full-time': 'var(--success)',
    'Part-time': 'var(--warning)',
    Remote: 'var(--accent)',
    Internship: 'var(--info)',
    Contract: 'var(--primary-light)',
    Freelance: '#A78BFA',
  };

  const JobCard = ({ job, compact = false }) => {
    const id = job._id || job.id;
    const saved = savedJobs.has(id);
    return (
      <div
        className="job-card"
        onClick={() => setSelectedJob(job)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.title}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              🏢 {job.company} · 📍 {job.location}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); saveJob(id); }}
            disabled={savingJob[id]}
            style={{
              background: saved ? 'rgba(108,99,255,0.2)' : 'rgba(108,99,255,0.08)',
              border: `1px solid ${saved ? 'rgba(108,99,255,0.5)' : 'rgba(108,99,255,0.2)'}`,
              borderRadius: 8,
              color: saved ? 'var(--primary-light)' : 'var(--text-muted)',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            <i className={`fa${saved ? 's' : 'r'} fa-bookmark`} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: typeColors[job.type] || 'var(--primary-light)', background: `${typeColors[job.type] || 'var(--primary-light)'}20`, padding: '0.15rem 0.5rem', borderRadius: 10 }}>
            {job.type}
          </span>
          {job.salary && <span className="badge-success">{job.salary}</span>}
        </div>

        {job.skills?.slice(0, 4).map((s, i) => (
          <span key={i} className="skill-tag" style={{ fontSize: '0.7rem', marginRight: '0.3rem', marginBottom: '0.3rem' }}>{s}</span>
        ))}

        {!compact && (
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <a
              href={job.applicationUrl || '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-gradient"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              Apply Now <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
              Job <span className="gradient-text">Board</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Find your dream job with AI-powered matching</p>
          </div>
          <Link to="/jobs/saved" className="btn-gradient-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}>
            <i className="fas fa-bookmark" /> Saved Jobs ({savedJobs.size})
          </Link>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && !recLoading && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="section-header">
            <div className="section-title">
              <div className="title-accent" />
              🤖 Recommended For You
            </div>
          </div>
          <div className="row g-3">
            {recommendations.slice(0, 3).map((job) => (
              <div key={job._id || job.id} className="col-12 col-md-4">
                <div style={{ background: 'linear-gradient(145deg, rgba(108,99,255,0.1), rgba(0,212,255,0.08))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 'var(--radius-card)' }}>
                  <JobCard job={job} compact />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row g-3">
        {/* ── Filter Sidebar ── */}
        <div className="col-12 col-lg-3">
          <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.25rem', position: 'sticky', top: 80 }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>🔍 Filters</h4>

            {/* Search */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Search</label>
              <input
                className="form-control-custom"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Job title, company..."
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Location</label>
              <input
                className="form-control-custom"
                value={filters.location}
                onChange={(e) => { setFilters((f) => ({ ...f, location: e.target.value })); setPage(1); }}
                placeholder="City, Remote..."
              />
            </div>

            {/* Job Type */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Job Type</label>
              {JOB_TYPES.map((type) => (
                <label
                  key={type}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: filters.types.includes(type) ? 'var(--primary-light)' : 'var(--text-secondary)' }}
                >
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleType(type)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  {type}
                </label>
              ))}
            </div>

            {(search || filters.location || filters.types.length > 0) && (
              <button
                onClick={() => { setSearch(''); setFilters({ types: [], location: '' }); setPage(1); }}
                style={{ marginTop: '1rem', width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', padding: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
              >
                <i className="fas fa-times" style={{ marginRight: 4 }} /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Job Listings ── */}
        <div className="col-12 col-lg-9">
          {loading ? (
            <CardLoader count={6} height={160} />
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: 'var(--text-secondary)' }}>No jobs found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Showing {jobs.length} jobs
              </p>
              <div className="row g-3">
                {jobs.map((job) => (
                  <div key={job._id || job.id} className="col-12 col-md-6 col-xl-4">
                    <JobCard job={job} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: 'none',
                        background: page === p ? 'var(--gradient-primary)' : 'var(--card-dark)',
                        color: page === p ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', maxWidth: 580, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{selectedJob.title}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
                  🏢 {selectedJob.company} · 📍 {selectedJob.location} · 💰 {selectedJob.salary || 'Competitive'}
                </p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="badge-gradient">{selectedJob.type}</span>
                {selectedJob.skills?.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
              <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{selectedJob.description || 'No description available.'}</p>
              {selectedJob.requirements && (
                <>
                  <h5 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', marginTop: '1rem' }}>Requirements</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{selectedJob.requirements}</p>
                </>
              )}
            </div>
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
              <a href={selectedJob.applicationUrl || '#'} target="_blank" rel="noreferrer" className="btn-gradient" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}>
                Apply Now <i className="fas fa-external-link-alt" style={{ fontSize: '0.75rem' }} />
              </a>
              <button
                onClick={() => saveJob(selectedJob._id || selectedJob.id)}
                style={{ padding: '0.65rem 1.25rem', background: savedJobs.has(selectedJob._id || selectedJob.id) ? 'rgba(108,99,255,0.2)' : 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 'var(--radius-btn)', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                {savedJobs.has(selectedJob._id || selectedJob.id) ? '🔖 Saved' : '🔖 Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Jobs;
