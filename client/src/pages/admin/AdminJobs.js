/**
 * AdminJobs.js
 * Admin Jobs management page: list, search, create, update, delete job listings.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
  { value: 'contract', label: 'Contract' },
];

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Form Modals State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: '',
    skills: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    applicationUrl: '',
    isActive: true,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/admin/jobs?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (typeFilter) url += `&type=${typeFilter}`;

      const res = await axiosInstance.get(url);
      if (res.data?.success) {
        setJobs(res.data.jobs || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedJobId(null);
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'full-time',
      description: '',
      requirements: '',
      skills: '',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'USD',
      applicationUrl: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (job) => {
    setModalMode('edit');
    setSelectedJobId(job._id);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'full-time',
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      salaryMin: job.salary?.min || '',
      salaryMax: job.salary?.max || '',
      salaryCurrency: job.salary?.currency || 'USD',
      applicationUrl: job.applicationUrl || '',
      isActive: job.isActive !== undefined ? job.isActive : true,
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) {
      toast.error('Title, company, and description are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        salary: {
          min: formData.salaryMin ? Number(formData.salaryMin) : undefined,
          max: formData.salaryMax ? Number(formData.salaryMax) : undefined,
          currency: formData.salaryCurrency,
        },
        applicationUrl: formData.applicationUrl,
        isActive: formData.isActive,
      };

      let res;
      if (modalMode === 'create') {
        res = await axiosInstance.post('/admin/jobs', payload);
      } else {
        res = await axiosInstance.put(`/admin/jobs/${selectedJobId}`, payload);
      }

      if (res.data?.success) {
        toast.success(res.data.message || 'Job saved successfully');
        setShowModal(false);
        fetchJobs();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (job) => {
    try {
      const res = await axiosInstance.put(`/admin/jobs/${job._id}`, { isActive: !job.isActive });
      if (res.data?.success) {
        toast.success('Job status updated');
        setJobs(prev => prev.map(j => j._id === job._id ? { ...j, isActive: !job.isActive } : j));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing? This will also remove it from saved list of all students.')) return;
    try {
      const res = await axiosInstance.delete(`/admin/jobs/${id}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Job listing deleted');
        fetchJobs();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete job');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '0.35rem' }}>
              Job Listings <span className="gradient-text">Management</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Post employment opportunities, manage parameters, and analyze candidates application counts.
            </p>
          </div>
          <button onClick={handleOpenCreate} className="btn-gradient" style={{ fontSize: '0.85rem', padding: '0.55rem 1.2rem' }}>
            ➕ Create Job Listing
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="app-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                🔍
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by job title or company..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div className="col-md-5">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              style={{ background: 'var(--card-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">All Job Types</option>
              {JOB_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="app-card p-4">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-muted">Loading job listings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-secondary mb-0">No job listings found.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table" style={{ color: 'var(--text-secondary)', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ border: 'none', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <th style={{ background: 'transparent', border: 'none' }}>Job Title</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Company</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Location</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Type</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Applicants</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Status</th>
                    <th style={{ background: 'transparent', border: 'none', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr
                      key={j._id}
                      style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <td style={{ border: 'none', padding: '0.85rem 1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {j.title}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem' }}>
                        {j.company}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem' }}>
                        {j.location || 'Remote'}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem', textTransform: 'capitalize' }}>
                        <span className="badge bg-secondary">{j.type}</span>
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem', fontWeight: 700 }}>
                        {j.applicantsCount || 0}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem' }}>
                        <button
                          className={`btn btn-sm ${j.isActive ? 'btn-outline-success' : 'btn-outline-warning'}`}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                          onClick={() => handleToggleActive(j)}
                        >
                          {j.isActive ? 'Active' : 'Expired'}
                        </button>
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', textAlign: 'right' }}>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-light"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleOpenEdit(j)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleDeleteJob(j._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-gradient-outline btn-sm"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="small text-muted">Page {page} of {totalPages}</span>
                <button
                  className="btn btn-gradient-outline btn-sm"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="modal-backdrop fade show" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content" style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <form onSubmit={handleSubmit}>
                  <div className="modal-header border-bottom border-secondary">
                    <h5 className="modal-title">
                      <span className="gradient-text">{modalMode === 'create' ? 'Create New' : 'Edit Existing'}</span> Job Posting
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
                  </div>
                  <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small text-secondary">Job Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          required
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-secondary">Company Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="company"
                          value={formData.company}
                          onChange={handleFormChange}
                          required
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-secondary">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          name="location"
                          value={formData.location}
                          onChange={handleFormChange}
                          placeholder="e.g. San Francisco, CA / Remote"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-secondary">Job Type</label>
                        <select
                          className="form-select"
                          name="type"
                          value={formData.type}
                          onChange={handleFormChange}
                          style={{ background: 'var(--card-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        >
                          {JOB_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-secondary">Salary Min</label>
                        <input
                          type="number"
                          className="form-control"
                          name="salaryMin"
                          value={formData.salaryMin}
                          onChange={handleFormChange}
                          placeholder="Min Salary"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-secondary">Salary Max</label>
                        <input
                          type="number"
                          className="form-control"
                          name="salaryMax"
                          value={formData.salaryMax}
                          onChange={handleFormChange}
                          placeholder="Max Salary"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-secondary">Currency</label>
                        <select
                          className="form-select"
                          name="salaryCurrency"
                          value={formData.salaryCurrency}
                          onChange={handleFormChange}
                          style={{ background: 'var(--card-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-secondary">External Application URL / Email</label>
                        <input
                          type="text"
                          className="form-control"
                          name="applicationUrl"
                          value={formData.applicationUrl}
                          onChange={handleFormChange}
                          placeholder="https://company.com/careers/job-id or email address"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-secondary">Required Skills (Comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          name="skills"
                          value={formData.skills}
                          onChange={handleFormChange}
                          placeholder="React, Node.js, TypeScript, PostgreSQL"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-secondary">Job Description (Markdown supported) *</label>
                        <textarea
                          className="form-control"
                          name="description"
                          rows="4"
                          value={formData.description}
                          onChange={handleFormChange}
                          required
                          placeholder="Detailed responsibilities, team overview..."
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-secondary">Candidate Requirements (One per line)</label>
                        <textarea
                          className="form-control"
                          name="requirements"
                          rows="3"
                          value={formData.requirements}
                          onChange={handleFormChange}
                          placeholder="e.g. Bachelor's in Computer Science&#10;3+ years of professional development experience"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                      </div>

                      <div className="col-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleFormChange}
                          />
                          <label className="form-check-label small text-secondary" htmlFor="isActive">
                            Is this job listing currently active/published?
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-top border-secondary">
                    <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-gradient" disabled={submitting}>
                      {submitting ? <ButtonLoader /> : 'Save Job Posting'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminJobs;
