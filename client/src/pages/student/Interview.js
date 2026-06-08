/**
 * Interview.js
 * Mock interview page: setup, question cards, feedback, history.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader, CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const CATEGORY_COLORS = {
  Technical: 'var(--info)',
  Behavioral: 'var(--success)',
  Situational: 'var(--warning)',
  HR: 'var(--accent)',
  Default: 'var(--primary-light)',
};

const Interview = () => {
  const [setup, setSetup] = useState({ role: '', type: 'Technical', difficulty: 'Medium' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [hints, setHints] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [generatingQ, setGeneratingQ] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState({});
  const [overallScore, setOverallScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/interview/sessions');
      setHistory(res.data?.sessions || res.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const generateQuestions = async () => {
    if (!setup.role.trim()) { toast.error('Please enter a target role'); return; }
    setGeneratingQ(true);
    setQuestions([]);
    setAnswers({});
    setFeedbacks({});
    setOverallScore(null);
    try {
      const res = await axiosInstance.post('/ai/interview-questions', setup);
      const qs = res.data?.questions || res.data || [];
      setQuestions(Array.isArray(qs) ? qs : []);
      toast.success(`${Array.isArray(qs) ? qs.length : 0} questions generated! 🎯`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate questions');
    } finally {
      setGeneratingQ(false);
    }
  };

  const getFeedback = async (q, index) => {
    const answer = answers[index];
    if (!answer?.trim()) { toast.error('Please write an answer first'); return; }
    setSubmittingFeedback((prev) => ({ ...prev, [index]: true }));
    try {
      const res = await axiosInstance.post('/ai/interview-feedback', {
        question: q.question || q,
        answer,
        role: setup.role,
        type: setup.type,
      });
      setFeedbacks((prev) => ({ ...prev, [index]: res.data?.feedback || res.data }));
      toast.success('Feedback ready! 📊');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to get feedback');
    } finally {
      setSubmittingFeedback((prev) => ({ ...prev, [index]: false }));
    }
  };

  const submitAllAnswers = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) { toast.error('Answer at least one question first'); return; }
    const scores = Object.values(feedbacks).map((f) => f?.score || 0).filter(Boolean);
    if (scores.length > 0) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      setOverallScore(avg);
      toast.success(`Session complete! Overall score: ${avg}/100 🏆`);
    }
  };

  const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default;
  const getScoreBadge = (score) => {
    if (!score) return null;
    const cls = score >= 80 ? 'badge-success' : score >= 60 ? 'badge-warning' : 'badge-danger';
    return <span className={cls}>{score}/100</span>;
  };

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
          Mock <span className="gradient-text">Interview</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Practice with AI-generated interview questions and get instant feedback</p>
      </div>

      {/* ── Setup Panel ── */}
      <div
        style={{
          background: 'var(--card-dark)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.1rem' }}>⚙️ Interview Setup</h3>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Target Role *
            </label>
            <input
              className="form-control-custom"
              value={setup.role}
              onChange={(e) => setSetup({ ...setup, role: e.target.value })}
              placeholder="e.g., Frontend Developer, Data Scientist"
              onKeyDown={(e) => { if (e.key === 'Enter') generateQuestions(); }}
            />
          </div>
          <div className="col-6 col-md-3">
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Interview Type
            </label>
            <select
              className="form-control-custom"
              value={setup.type}
              onChange={(e) => setSetup({ ...setup, type: e.target.value })}
              style={{ cursor: 'pointer' }}
            >
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral (HR)</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Difficulty
            </label>
            <select
              className="form-control-custom"
              value={setup.difficulty}
              onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}
              style={{ cursor: 'pointer' }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <button
              onClick={generateQuestions}
              disabled={generatingQ}
              className="btn-gradient w-100"
              style={{ padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {generatingQ ? <><ButtonLoader /> Generating...</> : <><i className="fas fa-wand-magic-sparkles" /> Generate Questions</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Questions ── */}
      {questions.length > 0 && (
        <>
          {/* Overall Score */}
          {overallScore !== null && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.1))',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 'var(--radius-card)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Overall Interview Score
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                {overallScore}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>out of 100</div>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
              Questions for{' '}
              <span className="gradient-text">{setup.role}</span>
              <span className="badge-info" style={{ marginLeft: '0.5rem' }}>{questions.length} Questions</span>
            </h3>
            <button
              onClick={submitAllAnswers}
              className="btn-gradient"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <i className="fas fa-paper-plane" /> Get Overall Score
            </button>
          </div>

          {questions.map((q, i) => {
            const questionText = q.question || q;
            const category = q.category || q.type || 'Technical';
            const feedback = feedbacks[i];
            return (
              <div key={i} className={`question-card ${feedback ? 'answered' : ''}`}>
                {/* Question Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.9rem' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: getCategoryColor(category),
                          background: `${getCategoryColor(category)}20`,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 10,
                        }}
                      >
                        {category}
                      </span>
                      {q.difficulty && (
                        <span className={`badge-${q.difficulty === 'Hard' ? 'danger' : q.difficulty === 'Medium' ? 'warning' : 'success'}`}>
                          {q.difficulty}
                        </span>
                      )}
                      {feedback && getScoreBadge(feedback.score)}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                      {questionText}
                    </p>
                  </div>
                </div>

                {/* Hint */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => setHints((prev) => ({ ...prev, [i]: !prev[i] }))}
                    style={{ background: 'none', border: 'none', color: 'var(--warning)', fontSize: '0.78rem', cursor: 'pointer', padding: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <i className="fas fa-lightbulb" /> {hints[i] ? 'Hide Hint' : 'Show Hint'}
                  </button>
                  {hints[i] && (
                    <div style={{ marginTop: '0.5rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      💡 {q.hint || 'Think about your past experiences and use the STAR method (Situation, Task, Action, Result) to structure your answer.'}
                    </div>
                  )}
                </div>

                {/* Answer Textarea */}
                <textarea
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Type your answer here..."
                  className="form-control-custom"
                  style={{ minHeight: 100, resize: 'vertical', marginBottom: '0.75rem' }}
                />

                <button
                  onClick={() => getFeedback(q, i)}
                  disabled={submittingFeedback[i]}
                  className="btn-gradient"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {submittingFeedback[i] ? <><ButtonLoader size={12} /> Getting Feedback...</> : <><i className="fas fa-robot" /> Get AI Feedback</>}
                </button>

                {/* Feedback Panel */}
                {feedback && (
                  <div style={{ marginTop: '1rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>🤖 AI Feedback</h5>
                      {getScoreBadge(feedback.score)}
                    </div>
                    {feedback.feedback && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.7 }}>
                        {feedback.feedback}
                      </p>
                    )}
                    <div className="row g-2">
                      {feedback.strengths?.length > 0 && (
                        <div className="col-12 col-md-6">
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.3rem' }}>✅ Strengths</div>
                          {feedback.strengths.map((s, si) => <div key={si} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 2 }}>• {s}</div>)}
                        </div>
                      )}
                      {feedback.improvements?.length > 0 && (
                        <div className="col-12 col-md-6">
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.3rem' }}>💡 Improvements</div>
                          {feedback.improvements.map((imp, ii) => <div key={ii} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 2 }}>• {imp}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── History ── */}
      <div style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <div className="section-title">
            <div className="title-accent" />
            Interview History
          </div>
        </div>
        {historyLoading ? (
          <CardLoader count={3} height={80} />
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <p>No interview sessions yet. Start your first mock interview!</p>
          </div>
        ) : (
          <div>
            {history.map((session, i) => (
              <div
                key={i}
                onClick={() => setSelectedSession(session)}
                style={{
                  background: 'var(--card-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.9rem 1.25rem',
                  marginBottom: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.background = 'rgba(108,99,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--card-dark)'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{session.role || 'Interview Session'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{session.type} · {session.date ? new Date(session.date).toLocaleDateString() : 'N/A'}</div>
                </div>
                {session.score && (
                  <span className={`badge-${session.score >= 80 ? 'success' : session.score >= 60 ? 'warning' : 'danger'}`}>
                    {session.score}/100
                  </span>
                )}
                <i className="fas fa-chevron-right" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.75rem', maxWidth: 560, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>Session Details</h3>
              <button onClick={() => setSelectedSession(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div>
              <p><strong>Role:</strong> {selectedSession.role}</p>
              <p><strong>Type:</strong> {selectedSession.type}</p>
              <p><strong>Score:</strong> {selectedSession.score || 'N/A'}</p>
              <p><strong>Date:</strong> {selectedSession.date ? new Date(selectedSession.date).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Interview;
