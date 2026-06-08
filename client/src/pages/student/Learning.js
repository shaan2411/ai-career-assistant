/**
 * Learning.js
 * Learning roadmap page with roadmap generation, progress tracking, resources, and project ideas.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader, CardLoader } from '../../components/common/Loader';
import axiosInstance from '../../api/axiosConfig';

const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'ML Engineer', 'DevOps Engineer', 'Mobile Developer',
  'UI/UX Designer', 'Cybersecurity Engineer', 'Cloud Engineer',
];

const DIFFICULTY_COLORS = { Beginner: 'var(--success)', Intermediate: 'var(--warning)', Advanced: 'var(--danger)' };
const RESOURCE_TYPE_ICONS = { video: '🎬', article: '📰', course: '🎓', book: '📚', project: '🛠️' };

const Learning = () => {
  const [role, setRole] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState(new Set());
  const [resources, setResources] = useState([]);
  const [projectIdeas, setProjectIdeas] = useState([]);
  const [userSkills] = useState(['HTML', 'CSS', 'JavaScript']);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('roadmap');

  const fetchResources = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/learning/resources');
      setResources(res.data?.resources || res.data || []);
    } catch {
      setResources([
        { _id: 'r1', title: 'React Official Docs', type: 'article', url: 'https://react.dev', description: 'Official React documentation', tags: ['React', 'Frontend'] },
        { _id: 'r2', title: 'The Odin Project', type: 'course', url: 'https://theodinproject.com', description: 'Free full-stack curriculum', tags: ['Web Dev', 'Full Stack'] },
        { _id: 'r3', title: 'CS50 by Harvard', type: 'video', url: 'https://cs50.harvard.edu', description: 'Intro to Computer Science', tags: ['CS Fundamentals'] },
      ]);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const generateRoadmap = async () => {
    if (!role) { toast.error('Please select a target role'); return; }
    setGenerating(true);
    setRoadmap(null);
    setCompletedWeeks(new Set());
    try {
      const res = await axiosInstance.post('/ai/learning-roadmap', { role });
      setRoadmap(res.data?.roadmap || res.data);
      setRequiredSkills(res.data?.requiredSkills || []);
      toast.success('Roadmap generated! 📚');
    } catch {
      // Mock roadmap
      setRoadmap({
        role,
        totalWeeks: 8,
        weeks: [
          { week: 1, topic: 'HTML & CSS Fundamentals', description: 'Master the building blocks of the web.', resources: ['MDN Web Docs', 'CSS Tricks', 'Kevin Powell YouTube'] },
          { week: 2, topic: 'JavaScript Basics', description: 'Learn variables, functions, DOM manipulation.', resources: ['javascript.info', 'Eloquent JavaScript', 'The Modern JavaScript Tutorial'] },
          { week: 3, topic: 'React Core Concepts', description: 'Components, hooks, state management.', resources: ['React Docs', 'Scrimba React', 'React Tutorial by Kevin'] },
          { week: 4, topic: 'Advanced React & State', description: 'Context, Redux, performance optimization.', resources: ['Redux Docs', 'Kent C Dodds Blog', 'Epic React'] },
          { week: 5, topic: 'Node.js & Express', description: 'Backend development with Node.js.', resources: ['Node.js Docs', 'Express.js Guide', 'The Odin Project'] },
          { week: 6, topic: 'Databases & MongoDB', description: 'NoSQL databases, Mongoose, data modeling.', resources: ['MongoDB Docs', 'Mongoose Docs', 'MongoDB University'] },
          { week: 7, topic: 'APIs & Authentication', description: 'REST APIs, JWT, OAuth.', resources: ['REST API Design', 'JWT.io', 'Passport.js Docs'] },
          { week: 8, topic: 'Deployment & DevOps', description: 'Deploy your app using cloud platforms.', resources: ['Vercel Docs', 'AWS Free Tier', 'Docker Get Started'] },
        ],
      });
      setRequiredSkills(['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Git', 'REST APIs']);
      toast.success('Roadmap generated! 📚');
    } finally {
      setGenerating(false);
    }
  };

  const generateProjectIdeas = async () => {
    if (!role) { toast.error('Select a role first'); return; }
    setProjectsLoading(true);
    try {
      const res = await axiosInstance.post('/ai/project-ideas', { role });
      setProjectIdeas(res.data?.projects || res.data || []);
    } catch {
      setProjectIdeas([
        { title: 'E-Commerce Dashboard', description: 'Build a full-stack shopping platform with React and Node.js.', techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], difficulty: 'Intermediate' },
        { title: 'Real-time Chat App', description: 'Create a chat application with WebSocket support.', techStack: ['React', 'Socket.io', 'Express', 'Redis'], difficulty: 'Intermediate' },
        { title: 'Task Management Tool', description: 'Kanban board with drag-and-drop functionality.', techStack: ['React', 'DnD Kit', 'Node.js', 'PostgreSQL'], difficulty: 'Beginner' },
        { title: 'AI Writing Assistant', description: 'Text editor with OpenAI integration for suggestions.', techStack: ['React', 'OpenAI API', 'Python', 'FastAPI'], difficulty: 'Advanced' },
      ]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const toggleWeek = (weekNum) => {
    setCompletedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  const totalWeeks = roadmap?.weeks?.length || 0;
  const progress = totalWeeks > 0 ? Math.round((completedWeeks.size / totalWeeks) * 100) : 0;

  const missingSkills = requiredSkills.filter((s) => !userSkills.some((us) => us.toLowerCase() === s.toLowerCase()));
  const masteredSkills = requiredSkills.filter((s) => userSkills.some((us) => us.toLowerCase() === s.toLowerCase()));

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
          Learning <span className="gradient-text">Roadmap</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>AI-generated learning paths to reach your career goals</p>
      </div>

      {/* Roadmap Generator */}
      <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>🎯 Generate Your Learning Roadmap</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Target Role</label>
            <select
              className="form-control-custom"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select your target role...</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="btn-gradient"
            style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            {generating ? <><ButtonLoader /> Generating...</> : <><i className="fas fa-wand-magic-sparkles" /> Generate Roadmap</>}
          </button>
          <button
            onClick={generateProjectIdeas}
            disabled={projectsLoading}
            className="btn-gradient-outline"
            style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            {projectsLoading ? <><ButtonLoader size={14} color="var(--primary)" /> Loading...</> : '💡 Project Ideas'}
          </button>
        </div>
      </div>

      {/* Section Nav */}
      {(roadmap || resources.length > 0) && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.3rem', width: 'fit-content' }}>
          {[
            { id: 'roadmap', label: '🗺️ Roadmap' },
            { id: 'resources', label: '📚 Resources' },
            { id: 'projects', label: '💡 Projects' },
            { id: 'skills', label: '⚡ Skill Gap' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 6,
                border: 'none',
                background: activeSection === sec.id ? 'var(--gradient-primary)' : 'transparent',
                color: activeSection === sec.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Roadmap Section ── */}
      {activeSection === 'roadmap' && roadmap && (
        <div>
          {/* Progress */}
          <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Progress: {roadmap.role}</span>
              <span className="gradient-text" style={{ fontWeight: 800 }}>{progress}% ({completedWeeks.size}/{totalWeeks} weeks)</span>
            </div>
            <div className="custom-progress">
              <div className="custom-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Week cards */}
          {roadmap.weeks?.map((week) => {
            const done = completedWeeks.has(week.week);
            return (
              <div key={week.week} className={`roadmap-step ${done ? 'completed' : ''}`}>
                <div style={{ position: 'relative' }}>
                  <div className={`roadmap-step-number`} style={done ? { background: 'var(--success)' } : {}}>
                    {done ? '✓' : week.week}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 2 }}>Week {week.week}</div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: done ? 'var(--success)' : 'var(--text-primary)' }}>{week.topic}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{week.description}</p>
                      {week.resources?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {week.resources.map((r, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '0.1rem 0.45rem', color: 'var(--accent)' }}>
                              📖 {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: done ? 'var(--success)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleWeek(week.week)}
                        style={{ accentColor: 'var(--success)', width: 16, height: 16 }}
                      />
                      {done ? 'Completed ✓' : 'Mark done'}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Resources Section ── */}
      {activeSection === 'resources' && (
        <div>
          <div className="row g-3">
            {resources.map((r) => {
              const rId = r._id || r.id;
              const typeIcon = RESOURCE_TYPE_ICONS[r.type] || '🔗';
              return (
                <div key={rId} className="col-12 col-md-6 col-lg-4">
                  <div className="resource-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{typeIcon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{r.type}</span>
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{r.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', flex: 1 }}>{r.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                      {(r.tags || []).map((t, i) => <span key={i} className="skill-tag" style={{ fontSize: '0.68rem' }}>{t}</span>)}
                    </div>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer" className="btn-gradient" style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        Open Resource <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            {resources.length === 0 && (
              <div className="col-12">
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                  <p>No bookmarked resources yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Projects Section ── */}
      {activeSection === 'projects' && (
        <div>
          {projectIdeas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💡</div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>No project ideas yet</h3>
              <p>Select a role and click "Project Ideas" to generate AI-powered project suggestions</p>
            </div>
          ) : (
            <div className="row g-3">
              {projectIdeas.map((project, i) => (
                <div key={i} className="col-12 col-md-6">
                  <div style={{ background: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-card)', padding: '1.25rem', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>🛠️ {project.title}</h4>
                      <span className={`badge-${project.difficulty === 'Advanced' ? 'danger' : project.difficulty === 'Intermediate' ? 'warning' : 'success'}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>{project.description}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {(project.techStack || []).map((t, ti) => (
                        <span key={ti} className="skill-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Skill Gap Section ── */}
      {activeSection === 'skills' && (
        <div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div style={{ background: 'var(--card-dark)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)', marginBottom: '0.75rem' }}>
                  ✅ Skills You Have ({masteredSkills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {masteredSkills.map((s, i) => (
                    <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '0.2rem 0.65rem', color: 'var(--success)', fontWeight: 500 }}>
                      ✓ {s}
                    </span>
                  ))}
                  {masteredSkills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matching skills found. Update your profile!</span>}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div style={{ background: 'var(--card-dark)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-card)', padding: '1.25rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
                  🎯 Skills to Learn ({missingSkills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {missingSkills.map((s, i) => (
                    <span key={i} style={{ fontSize: '0.8rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '0.2rem 0.65rem', color: 'var(--danger)', fontWeight: 500 }}>
                      + {s}
                    </span>
                  ))}
                  {missingSkills.length === 0 && requiredSkills.length > 0 && (
                    <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>🎉 You have all required skills!</span>
                  )}
                  {requiredSkills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generate a roadmap to see required skills</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Learning;
