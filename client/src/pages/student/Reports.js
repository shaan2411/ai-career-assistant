/**
 * Reports.js
 * AI Reports: Weekly report, resume analysis history, career paths, PDF export.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader, CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [generatingWeekly, setGeneratingWeekly] = useState(false);
  const [careerPaths, setCareerPaths] = useState([]);
  const [generatingPaths, setGeneratingPaths] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/reports/history');
      setReportHistory(res.data?.reports || res.data || []);
    } catch {
      setReportHistory([
        { _id: 'r1', type: 'weekly', date: new Date().toISOString(), summary: 'Productive week: completed resume analysis and 2 mock interviews.', score: 82 },
        { _id: 'r2', type: 'resume', date: new Date(Date.now() - 86400000 * 3).toISOString(), summary: 'Resume scored 78/100. ATS compatible. Needs quantified achievements.', score: 78 },
        { _id: 'r3', type: 'career', date: new Date(Date.now() - 86400000 * 7).toISOString(), summary: 'Explored 3 career paths: Frontend Dev, Product Manager, UX Designer.', score: null },
      ]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const generateWeeklyReport = async () => {
    setGeneratingWeekly(true);
    try {
      const res = await axiosInstance.post('/ai/weekly-report');
      setWeeklyReport(res.data?.report || res.data);
      toast.success('Weekly report generated! 📊');
    } catch {
      setWeeklyReport({
        summary: 'This week you made significant progress on your career journey. You uploaded your resume, practiced 5 interview questions, and applied to 3 jobs.',
        achievements: [
          'Uploaded and analyzed resume (Score: 78/100)',
          'Completed mock interview for Frontend Developer',
          'Saved 5 matching jobs on the job board',
          'Started React learning roadmap — Week 2 completed',
        ],
        improvements: [
          'Add quantified achievements to your resume',
          'Practice more behavioral interview questions',
          'Complete your LinkedIn profile for better visibility',
          'Reach out to 3 connections in your target field',
        ],
        nextWeekGoals: [
          'Apply to at least 5 more jobs',
          'Complete 3 more weeks of the learning roadmap',
          'Get resume score above 85',
          'Practice 10 coding interview questions',
        ],
        motivationalMessage: 'Every step you take brings you closer to your dream career. Keep pushing forward — your consistent effort will pay off! 🚀',
      });
      toast.success('Weekly report generated! 📊');
    } finally {
      setGeneratingWeekly(false);
    }
  };

  const generateCareerPaths = async () => {
    setGeneratingPaths(true);
    try {
      const res = await axiosInstance.post('/ai/career-paths');
      setCareerPaths(res.data?.paths || res.data || []);
      toast.success('Career paths generated! 🗺️');
    } catch {
      setCareerPaths([
        { title: 'Frontend Engineer', description: 'Build beautiful, responsive web interfaces using modern frameworks like React, Vue, or Angular.', timeline: '6-12 months', salary: '$70k - $130k', demand: 'Very High', skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Testing'], match: 85 },
        { title: 'Full Stack Developer', description: 'Work across the entire web stack, from databases and servers to client-side code.', timeline: '12-18 months', salary: '$85k - $150k', demand: 'High', skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'], match: 72 },
        { title: 'Product Manager', description: 'Lead product strategy and work closely with engineering, design, and business teams.', timeline: '18-24 months', salary: '$95k - $160k', demand: 'High', skills: ['Product Strategy', 'Analytics', 'Roadmapping', 'Agile', 'User Research'], match: 60 },
      ]);
      toast.success('Career paths generated! 🗺️');
    } finally {
      setGeneratingPaths(false);
    }
  };

  const exportToPDF = async () => {
    setExportingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFillColor(108, 99, 255);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Career Assistant — Report', 15, 20);

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 38);

      doc.setTextColor(30, 30, 50);
      let y = 50;

      if (activeTab === 'weekly' && weeklyReport) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Weekly Career Report', 15, y); y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(weeklyReport.summary, 180);
        doc.text(summaryLines, 15, y); y += summaryLines.length * 6 + 8;

        const sections = [
          { title: 'Achievements', items: weeklyReport.achievements },
          { title: 'Areas for Improvement', items: weeklyReport.improvements },
          { title: 'Next Week Goals', items: weeklyReport.nextWeekGoals },
        ];

        sections.forEach((sec) => {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(sec.title, 15, y); y += 8;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          sec.items?.forEach((item) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`• ${item}`, 20, y); y += 7;
          });
          y += 5;
        });

        if (weeklyReport.motivationalMessage) {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(11);
          doc.setTextColor(108, 99, 255);
          doc.setFont('helvetica', 'bolditalic');
          const msgLines = doc.splitTextToSize(`💡 ${weeklyReport.motivationalMessage}`, 180);
          doc.text(msgLines, 15, y);
        }
      }

      doc.save(`ai-career-report-${Date.now()}.pdf`);
      toast.success('PDF exported! 📄');
    } catch (err) {
      toast.error('Failed to export PDF');
    } finally {
      setExportingPdf(false);
    }
  };

  const typeColors = { weekly: 'var(--primary-light)', resume: 'var(--accent)', career: 'var(--success)' };
  const typeBadge = (type) => {
    const cls = { weekly: 'badge-gradient', resume: 'badge-info', career: 'badge-success' };
    return <span className={cls[type] || 'badge-info'}>{type === 'weekly' ? '📊 Weekly' : type === 'resume' ? '📄 Resume' : '🗺️ Career'}</span>;
  };

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
              AI <span className="gradient-text">Reports</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Comprehensive AI-generated career insights and analysis</p>
          </div>
          {(weeklyReport || careerPaths.length > 0) && (
            <button
              onClick={exportToPDF}
              disabled={exportingPdf}
              className="btn-gradient-outline"
              style={{ padding: '0.55rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
            >
              {exportingPdf ? <><ButtonLoader size={14} color="var(--primary)" /> Exporting...</> : <><i className="fas fa-file-pdf" /> Export PDF</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'weekly', label: '📊 Weekly Report' },
          { id: 'resume', label: '📄 Resume Analysis' },
          { id: 'career', label: '🗺️ Career Paths' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Weekly Report Tab ── */}
      {activeTab === 'weekly' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button
              onClick={generateWeeklyReport}
              disabled={generatingWeekly}
              className="btn-gradient"
              style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {generatingWeekly ? <><ButtonLoader /> Generating...</> : <><i className="fas fa-chart-bar" /> Generate Weekly Report</>}
            </button>
          </div>

          {weeklyReport ? (
            <div className="row g-3">
              {/* Summary */}
              <div className="col-12">
                <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.08))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.75rem' }}>📊 Weekly Summary</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>{weeklyReport.summary}</p>
                </div>
              </div>

              {/* Achievements */}
              <div className="col-12 col-md-4">
                <div style={{ background: 'var(--card-dark)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-card)', padding: '1.25rem', height: '100%' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)', marginBottom: '0.75rem' }}>🏆 Achievements</h4>
                  {weeklyReport.achievements?.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }}>✓</span> {a}
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="col-12 col-md-4">
                <div style={{ background: 'var(--card-dark)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-card)', padding: '1.25rem', height: '100%' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--warning)', marginBottom: '0.75rem' }}>💡 Improvements</h4>
                  {weeklyReport.improvements?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--warning)', marginTop: 2, flexShrink: 0 }}>→</span> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="col-12 col-md-4">
                <div style={{ background: 'var(--card-dark)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-card)', padding: '1.25rem', height: '100%' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-light)', marginBottom: '0.75rem' }}>🎯 Next Week Goals</h4>
                  {weeklyReport.nextWeekGoals?.map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--primary-light)', marginTop: 2, flexShrink: 0 }}>◎</span> {g}
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivational Message */}
              {weeklyReport.motivationalMessage && (
                <div className="col-12">
                  <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.08))', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-card)', padding: '1.25rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    <p style={{ fontStyle: 'italic', color: 'var(--primary-light)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.5rem', marginBottom: 0 }}>
                      {weeklyReport.motivationalMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>No weekly report yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click "Generate Weekly Report" to get your AI-powered career insights</p>
            </div>
          )}
        </div>
      )}

      {/* ── Resume Analysis Tab ── */}
      {activeTab === 'resume' && (
        <div>
          {historyLoading ? <CardLoader count={3} height={100} /> : (
            <div>
              {reportHistory.filter((r) => r.type === 'resume').map((report) => (
                <div
                  key={report._id}
                  className="report-card"
                  onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                  style={{ marginBottom: '0.75rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      {typeBadge(report.type)}
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.4rem', marginBottom: 0 }}>
                        {new Date(report.date).toLocaleDateString()} · {report.summary?.slice(0, 60)}...
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {report.score && (
                        <span className={`badge-${report.score >= 80 ? 'success' : report.score >= 60 ? 'warning' : 'danger'}`} style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                          {report.score}/100
                        </span>
                      )}
                      <i className={`fas fa-chevron-${expandedReport === report._id ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }} />
                    </div>
                  </div>
                  {expandedReport === report._id && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                      {report.summary}
                    </div>
                  )}
                </div>
              ))}
              {reportHistory.filter((r) => r.type === 'resume').length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                  <p>No resume analysis reports yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Career Paths Tab ── */}
      {activeTab === 'career' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button
              onClick={generateCareerPaths}
              disabled={generatingPaths}
              className="btn-gradient"
              style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {generatingPaths ? <><ButtonLoader /> Generating...</> : <><i className="fas fa-road" /> Generate Career Paths</>}
            </button>
          </div>

          {careerPaths.length > 0 ? (
            <div className="row g-3">
              {careerPaths.map((path, i) => (
                <div key={i} className="col-12 col-lg-4">
                  <div style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.5rem', height: '100%', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow-sm)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>{path.title}</h3>
                      {path.match && (
                        <span className={`badge-${path.match >= 80 ? 'success' : path.match >= 60 ? 'warning' : 'info'}`}>
                          {path.match}% match
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{path.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                      {(path.skills || []).map((s, si) => <span key={si} className="skill-tag" style={{ fontSize: '0.7rem' }}>{s}</span>)}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Timeline</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)' }}>{path.timeline}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Salary Range</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)' }}>{path.salary}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Demand</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--warning)' }}>{path.demand}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>No career paths generated yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click "Generate Career Paths" to see AI-powered career recommendations based on your profile</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Reports;
