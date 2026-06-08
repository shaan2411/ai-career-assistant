/**
 * Resume.js
 * Resume upload, AI analysis, cover letter generator.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader, CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

// ── Score Ring ──
const ScoreRing = ({ score = 0, size = 80 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const id = `rg-${score}`;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg style={{ transform: 'rotate(-90deg)' }} width={size} height={size}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(108,99,255,0.15)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={8} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600 }}>/100</div>
      </div>
    </div>
  );
};

const TABS = ['resumes', 'cover-letter'];

const Resume = ({ defaultTab = 'resumes' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [resumes, setResumes] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState({});
  const [generating, setGenerating] = useState({});
  const [expandedAnalysis, setExpandedAnalysis] = useState({});
  const [summaryModal, setSummaryModal] = useState({ open: false, text: '', id: null });
  const [coverLetterForm, setCoverLetterForm] = useState({ jobTitle: '', company: '', jobDescription: '' });
  const [coverLetterResult, setCoverLetterResult] = useState('');
  const [generatingCL, setGeneratingCL] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/resumes/my');
      const data = res.data?.resumes || res.data || [];
      setResumes(Array.isArray(data) ? data : []);
    } catch {
      setResumes([]);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // ── Dropzone ──
  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }

    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axiosInstance.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      toast.success('Resume uploaded successfully! 📄');
      setResumes((prev) => [res.data?.resume || res.data, ...prev].filter(Boolean));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
  });

  const analyzeResume = async (id) => {
    setAnalyzing((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axiosInstance.post('/ai/analyze-resume', { resumeId: id });
      const analysis = res.data?.analysis || res.data;
      setResumes((prev) => prev.map((r) => r._id === id || r.id === id ? { ...r, analysis, score: analysis?.score } : r));
      setExpandedAnalysis((prev) => ({ ...prev, [id]: true }));
      toast.success('Analysis complete! 🤖');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const generateSummary = async (id) => {
    setGenerating((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axiosInstance.post('/ai/generate-summary', { resumeId: id });
      setSummaryModal({ open: true, text: res.data?.summary || res.data?.text || 'Summary generated.', id });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate summary');
    } finally {
      setGenerating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await axiosInstance.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id && r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const generateCoverLetter = async () => {
    if (!coverLetterForm.jobTitle || !coverLetterForm.company) {
      toast.error('Please fill in job title and company');
      return;
    }
    setGeneratingCL(true);
    try {
      const res = await axiosInstance.post('/ai/cover-letter', coverLetterForm);
      setCoverLetterResult(res.data?.coverLetter || res.data?.text || 'Cover letter generated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate cover letter');
    } finally {
      setGeneratingCL(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
          <span className="gradient-text">Resume</span> Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Upload, analyze, and optimize your resume with AI</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', width: 'fit-content' }}>
        {[{ id: 'resumes', label: '📄 My Resumes' }, { id: 'cover-letter', label: '✉️ Cover Letter' }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(108,99,255,0.4)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Resumes Tab ── */}
      {activeTab === 'resumes' && (
        <div>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`dropzone-area ${isDragActive ? 'drag-active' : ''}`}
            style={{ marginBottom: '1.5rem' }}
          >
            <input {...getInputProps()} />
            <div className="dropzone-icon">📤</div>
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {isDragActive ? 'Drop your resume here!' : 'Drag & drop your resume'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              Supports PDF and DOCX formats up to 10MB
            </p>
            <button type="button" className="btn-gradient" style={{ pointerEvents: 'none' }}>
              <i className="fas fa-folder-open" style={{ marginRight: 6 }} />
              Browse Files
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="custom-progress">
                <div className="custom-progress-bar" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Resume List */}
          {fetchLoading ? (
            <CardLoader count={2} height={140} />
          ) : resumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>No resumes yet</h3>
              <p>Upload your first resume to get an AI score and analysis</p>
            </div>
          ) : (
            resumes.map((resume) => {
              const id = resume._id || resume.id;
              const score = resume.score || resume.analysis?.score || 0;
              const analysis = resume.analysis;
              return (
                <div
                  key={id}
                  style={{
                    background: 'var(--card-dark)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-card)',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                  }}
                >
                  {/* Resume Header */}
                  <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: 48, height: 48, background: 'rgba(108,99,255,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                      {resume.originalName?.endsWith('.docx') ? '📝' : '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resume.originalName || resume.filename || 'Resume'}
                      </h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                        Uploaded {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'recently'}
                      </p>
                    </div>
                    {score > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ScoreRing score={score} size={70} />
                        <span className={`badge-${score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}`}>
                          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => analyzeResume(id)}
                        disabled={analyzing[id]}
                        className="btn-gradient"
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        {analyzing[id] ? <><ButtonLoader size={12} /> Analyzing...</> : '🤖 Analyze'}
                      </button>
                      <button
                        onClick={() => generateSummary(id)}
                        disabled={generating[id]}
                        style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        {generating[id] ? <><ButtonLoader size={12} color="var(--accent)" /> Generating...</> : '✨ Summary'}
                      </button>
                      {analysis && (
                        <button
                          onClick={() => setExpandedAnalysis((prev) => ({ ...prev, [id]: !prev[id] }))}
                          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--primary-light)', cursor: 'pointer' }}
                        >
                          {expandedAnalysis[id] ? '▲ Hide' : '▼ Analysis'}
                        </button>
                      )}
                      <button
                        onClick={() => deleteResume(id)}
                        style={{ padding: '0.45rem 0.7rem', fontSize: '0.8rem', background: 'var(--danger-light)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>

                  {/* Analysis Panel */}
                  {expandedAnalysis[id] && analysis && (
                    <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(108,99,255,0.04)' }}>
                      <div className="row g-3">
                        {/* ATS */}
                        <div className="col-12">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <span className={`badge-${analysis.atsCompatible ? 'success' : 'danger'}`}>
                              {analysis.atsCompatible ? '✅ ATS Compatible' : '⚠️ ATS Issues Found'}
                            </span>
                            {analysis.keywords?.slice(0, 8).map((kw, i) => (
                              <span key={i} className="skill-tag" style={{ fontSize: '0.7rem' }}>{kw}</span>
                            ))}
                          </div>
                        </div>

                        {/* Strengths */}
                        {analysis.strengths?.length > 0 && (
                          <div className="col-12 col-md-6">
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>
                              <i className="fas fa-check-circle" style={{ marginRight: 6 }} /> Strengths
                            </h5>
                            {analysis.strengths.map((s, i) => (
                              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: 'var(--success)', marginTop: 2 }}>✓</span> {s}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Weaknesses */}
                        {analysis.weaknesses?.length > 0 && (
                          <div className="col-12 col-md-6">
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.5rem' }}>
                              <i className="fas fa-times-circle" style={{ marginRight: 6 }} /> Areas to Improve
                            </h5>
                            {analysis.weaknesses.map((w, i) => (
                              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: 'var(--danger)', marginTop: 2 }}>✗</span> {w}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Suggestions */}
                        {analysis.suggestions?.length > 0 && (
                          <div className="col-12">
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.5rem' }}>
                              💡 AI Suggestions
                            </h5>
                            {analysis.suggestions.map((s, i) => (
                              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.3rem', background: 'rgba(245,158,11,0.06)', borderRadius: 6, padding: '0.35rem 0.6rem' }}>
                                <span style={{ marginTop: 1 }}>💡</span> {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Cover Letter Tab ── */}
      {activeTab === 'cover-letter' && (
        <div className="row g-4">
          <div className="col-12 col-lg-5">
            <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>✉️ Cover Letter Generator</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Job Title *</label>
                <input
                  className="form-control-custom"
                  value={coverLetterForm.jobTitle}
                  onChange={(e) => setCoverLetterForm({ ...coverLetterForm, jobTitle: e.target.value })}
                  placeholder="e.g., Frontend Developer"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Company Name *</label>
                <input
                  className="form-control-custom"
                  value={coverLetterForm.company}
                  onChange={(e) => setCoverLetterForm({ ...coverLetterForm, company: e.target.value })}
                  placeholder="e.g., Google"
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Job Description</label>
                <textarea
                  className="form-control-custom"
                  value={coverLetterForm.jobDescription}
                  onChange={(e) => setCoverLetterForm({ ...coverLetterForm, jobDescription: e.target.value })}
                  placeholder="Paste the job description here..."
                  style={{ minHeight: 160, resize: 'vertical' }}
                />
              </div>
              <button
                onClick={generateCoverLetter}
                disabled={generatingCL}
                className="btn-gradient w-100"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem' }}
              >
                {generatingCL ? <><ButtonLoader /> Generating...</> : <><i className="fas fa-magic" /> Generate Cover Letter</>}
              </button>
            </div>
          </div>
          <div className="col-12 col-lg-7">
            {coverLetterResult ? (
              <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Generated Cover Letter</h3>
                  <button
                    onClick={() => { navigator.clipboard.writeText(coverLetterResult); toast.success('Copied!'); }}
                    style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, color: 'var(--primary-light)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    <i className="fas fa-copy" style={{ marginRight: 4 }} /> Copy
                  </button>
                </div>
                <div style={{ background: 'rgba(108,99,255,0.04)', border: '1px solid rgba(108,99,255,0.1)', borderRadius: 8, padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 450, overflowY: 'auto' }}>
                  {coverLetterResult}
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem', background: 'var(--card-dark)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-card)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>✉️</div>
                <h3 style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '1rem' }}>Your cover letter will appear here</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fill in the form and click Generate</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.75rem', maxWidth: 560, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>✨ AI Professional Summary</h3>
              <button onClick={() => setSummaryModal({ open: false, text: '', id: null })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(108,99,255,0.05)', borderRadius: 10, padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {summaryModal.text}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(summaryModal.text); toast.success('Copied!'); }}
              className="btn-gradient"
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}
            >
              <i className="fas fa-copy" /> Copy Summary
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Resume;
