/**
 * AdminUsers.js
 * User management page for admins to browse, search, update status, and delete accounts.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (role) url += `&role=${role}`;
      if (statusFilter) url += `&isActive=${statusFilter === 'active'}`;

      const res = await axiosInstance.get(url);
      if (res.data?.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toggle user active status
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    setSubmittingStatus(prev => ({ ...prev, [user._id]: true }));
    try {
      const res = await axiosInstance.put(`/admin/users/${user._id}/status`, { isActive: nextStatus });
      if (res.data?.success) {
        toast.success(res.data.message || 'User status updated');
        // Local state update
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));
        if (selectedUser && selectedUser.user._id === user._id) {
          setSelectedUser(prev => ({ ...prev, user: { ...prev.user, isActive: nextStatus } }));
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmittingStatus(prev => ({ ...prev, [user._id]: false }));
    }
  };

  // Delete user account
  const handleDeleteUser = async (id) => {
    try {
      const res = await axiosInstance.delete(`/admin/users/${id}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'User permanently deleted');
        setDeletingId(null);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  // Fetch and show user details modal
  const handleViewDetails = async (id) => {
    setUserDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/users/${id}`);
      if (res.data?.success) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '0.35rem' }}>
          User <span className="gradient-text">Management</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Audit student and administrator accounts, modify access rights, and view activity telemetry.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="app-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                🔍
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearchChange}
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={role}
              onChange={handleRoleChange}
              style={{ background: 'var(--card-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">All Roles</option>
              <option value="student">🎓 Student</option>
              <option value="admin">⚙️ Administrator</option>
            </select>
          </div>
          <div className="col-6 col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ background: 'var(--card-dark)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="app-card p-4">
        {loading ? (
          <div style={{ padding: '3rem', textAlignment: 'center' }}>
            <p className="text-muted">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-secondary mb-0">No users match the selected filters.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table" style={{ color: 'var(--text-secondary)', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ border: 'none', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    <th style={{ background: 'transparent', border: 'none' }}>Name</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Email</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Role</th>
                    <th style={{ background: 'transparent', border: 'none' }}>Status</th>
                    <th style={{ background: 'transparent', border: 'none' }}>AI Usage</th>
                    <th style={{ background: 'transparent', border: 'none', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <td style={{ border: 'none', padding: '0.85rem 1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {u.name}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem' }}>
                        {u.email}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem' }}>
                        <span className={u.role === 'admin' ? 'badge-danger' : 'badge-gradient'}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem' }}>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-success' : 'btn-outline-warning'}`}
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                          onClick={() => handleToggleStatus(u)}
                          disabled={submittingStatus[u._id]}
                        >
                          {submittingStatus[u._id] ? <ButtonLoader /> : (u.isActive ? 'Active' : 'Deactivated')}
                        </button>
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem', fontWeight: 600 }}>
                        {u.aiUsageCount || 0}
                      </td>
                      <td style={{ border: 'none', padding: '0.85rem 1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', textAlign: 'right' }}>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-light"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleViewDetails(u._id)}
                            disabled={userDetailLoading}
                          >
                            Details
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => setDeletingId(u._id)}
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

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-backdrop fade show" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ background: 'var(--card-dark)', border: '1px solid var(--danger)', color: 'var(--text-primary)' }}>
                <div className="modal-header border-bottom border-secondary">
                  <h5 className="modal-title text-danger">⚠️ Permanent Account Deletion</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setDeletingId(null)} />
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to permanently delete this user account?</p>
                  <p className="text-secondary small">This action is irreversible and will delete their entire profile, resume parsing histories, weekly progress reports, mock interview sessions, and saved jobs.</p>
                </div>
                <div className="modal-footer border-top border-secondary">
                  <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setDeletingId(null)}>Cancel</button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(deletingId)}>Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedUser && (
        <div className="modal-backdrop fade show" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content" style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <div className="modal-header border-bottom border-secondary">
                  <h5 className="modal-title">
                    <span className="gradient-text">{selectedUser.user.name}</span>'s System Details
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUser(null)} />
                </div>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <h6 className="text-white border-bottom border-secondary pb-1">System Account Info</h6>
                      <div className="small text-secondary mb-1">Email: <span className="text-white">{selectedUser.user.email}</span></div>
                      <div className="small text-secondary mb-1">Role: <span className="text-white text-capitalize">{selectedUser.user.role}</span></div>
                      <div className="small text-secondary mb-1">Status: <span className={selectedUser.user.isActive ? 'text-success' : 'text-warning'}>{selectedUser.user.isActive ? 'Active' : 'Deactivated'}</span></div>
                      <div className="small text-secondary">Registered: <span className="text-white">{new Date(selectedUser.user.createdAt).toLocaleString()}</span></div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-white border-bottom border-secondary pb-1">Platform Telemetry Stats</h6>
                      <div className="small text-secondary mb-1">AI Invocations: <span className="text-white">{selectedUser.stats?.aiUsageCount || 0}</span></div>
                      <div className="small text-secondary mb-1">Resumes Uploaded: <span className="text-white">{selectedUser.stats?.resumeCount || 0}</span></div>
                      <div className="small text-secondary mb-1">Mock Interviews: <span className="text-white">{selectedUser.stats?.interviewCount || 0}</span></div>
                      <div className="small text-secondary">Saved Job Postings: <span className="text-white">{selectedUser.stats?.savedJobCount || 0}</span></div>
                    </div>
                  </div>

                  {selectedUser.profile ? (
                    <div>
                      <h6 className="text-white border-bottom border-secondary pb-1">Student Profile Details</h6>
                      <div className="small text-secondary mb-2">Bio: <span className="text-white">{selectedUser.profile.bio || 'No bio entered'}</span></div>
                      <div className="row g-2 mb-3">
                        <div className="col-6 col-md-4">
                          <div className="small text-secondary">Location</div>
                          <div className="text-white">{selectedUser.profile.location || 'N/A'}</div>
                        </div>
                        <div className="col-6 col-md-4">
                          <div className="small text-secondary">Phone</div>
                          <div className="text-white">{selectedUser.profile.phone || 'N/A'}</div>
                        </div>
                        <div className="col-6 col-md-4">
                          <div className="small text-secondary">Completion</div>
                          <div className="text-white">{selectedUser.profile.completionPercentage || 0}%</div>
                        </div>
                      </div>

                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className="small text-secondary font-weight-bold">Skills</div>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {selectedUser.profile.skills?.map((s, idx) => (
                              <span key={idx} className="skill-tag" style={{ fontSize: '0.7rem' }}>{s}</span>
                            )) || <span className="text-muted">None listed</span>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="small text-secondary font-weight-bold">Interests</div>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {selectedUser.profile.interests?.map((item, idx) => (
                              <span key={idx} className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{item}</span>
                            )) || <span className="text-muted">None listed</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-secondary p-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      🎓 Student hasn't initialized their career assistant profile yet.
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top border-secondary">
                  <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setSelectedUser(null)}>Close</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setDeletingId(selectedUser.user._id); }}>Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUsers;
