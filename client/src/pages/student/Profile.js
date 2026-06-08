/**
 * Profile.js
 * Tabbed profile editor: Personal Info, Education, Experience, Skills, Career Goals.
 */
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { ButtonLoader } from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'skills', label: 'Skills & Interests', icon: '⚡' },
  { id: 'goals', label: 'Career Goals', icon: '🎯' },
];

const emptyEducation = { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' };
const emptyExperience = { company: '', title: '', location: '', startDate: '', endDate: '', current: false, description: '' };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [personal, setPersonal] = useState({ name: '', phone: '', location: '', bio: '', github: '', linkedin: '', portfolio: '' });
  const [education, setEducation] = useState([{ ...emptyEducation }]);
  const [experience, setExperience] = useState([{ ...emptyExperience }]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [careerGoal, setCareerGoal] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/users/profile');
      const data = res.data?.user || res.data;
      setPersonal({
        name: data.name || user?.name || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        github: data.github || '',
        linkedin: data.linkedin || '',
        portfolio: data.portfolio || '',
      });
      if (data.education?.length) setEducation(data.education);
      if (data.experience?.length) setExperience(data.experience);
      if (data.skills?.length) setSkills(data.skills);
      if (data.interests?.length) setInterests(data.interests);
      if (data.careerGoal) setCareerGoal(data.careerGoal);
    } catch {
      setPersonal({ name: user?.name || '', phone: '', location: '', bio: '', github: '', linkedin: '', portfolio: '' });
    } finally {
      setFetchLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Profile completion %
  const calcCompletion = () => {
    let filled = 0, total = 10;
    if (personal.name) filled++;
    if (personal.phone) filled++;
    if (personal.location) filled++;
    if (personal.bio) filled++;
    if (personal.linkedin) filled++;
    if (personal.github) filled++;
    if (education[0]?.institution) filled++;
    if (experience[0]?.company) filled++;
    if (skills.length > 0) filled++;
    if (careerGoal) filled++;
    return Math.round((filled / total) * 100);
  };
  const completion = calcCompletion();

  const saveTab = async () => {
    setLoading(true);
    try {
      const payload = {
        ...personal,
        education,
        experience,
        skills,
        interests,
        careerGoal,
      };
      const res = await axiosInstance.put('/users/profile', payload);
      updateUser(res.data?.user || res.data);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); }
    setSkillInput('');
  };
  const removeSkill = (idx) => setSkills(skills.filter((_, i) => i !== idx));

  const addInterest = () => {
    const s = interestInput.trim();
    if (s && !interests.includes(s)) { setInterests([...interests, s]); }
    setInterestInput('');
  };
  const removeInterest = (idx) => setInterests(interests.filter((_, i) => i !== idx));

  const addEducation = () => setEducation([...education, { ...emptyEducation }]);
  const removeEducation = (idx) => setEducation(education.filter((_, i) => i !== idx));
  const updateEd = (idx, field, val) => {
    const arr = [...education];
    arr[idx] = { ...arr[idx], [field]: val };
    setEducation(arr);
  };

  const addExperience = () => setExperience([...experience, { ...emptyExperience }]);
  const removeExperience = (idx) => setExperience(experience.filter((_, i) => i !== idx));
  const updateExp = (idx, field, val) => {
    const arr = [...experience];
    arr[idx] = { ...arr[idx], [field]: val };
    setExperience(arr);
  };

  const inputStyle = {
    background: 'rgba(108,99,255,0.06)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    padding: '0.6rem 0.9rem',
    fontSize: '0.875rem',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.3rem',
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>
          My <span className="gradient-text">Profile</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Complete your profile to get better AI-powered recommendations
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: 'var(--card-dark)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-card)',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Profile Completion
          </span>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: '0.9rem' }}>{completion}%</span>
        </div>
        <div className="custom-progress">
          <div className="custom-progress-bar" style={{ width: `${completion}%` }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          {completion < 50 ? 'Add more info to improve your match rate' : completion < 80 ? 'Great progress! Keep filling out your profile' : '🌟 Excellent profile!'}
        </p>
      </div>

      <div className="row g-3">
        {/* Avatar + User Card */}
        <div className="col-12 col-lg-3">
          <div
            style={{
              background: 'var(--card-dark)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
              padding: '1.5rem',
              textAlign: 'center',
              position: 'sticky',
              top: '80px',
            }}
          >
            <div className="profile-avatar-container" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <div className="profile-avatar">
                {(personal.name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="avatar-edit-btn" title="Change photo">
                <i className="fas fa-camera" />
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {personal.name || user?.name || 'Your Name'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {user?.email}
            </p>
            <span className="badge-info">🎓 Student</span>

            {/* Tab Links */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeTab === tab.id ? 'rgba(108,99,255,0.15)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    borderLeft: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="col-12 col-lg-9">
          <div
            style={{
              background: 'var(--card-dark)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-card)',
              padding: '1.5rem',
            }}
          >
            {/* ── Personal Info ── */}
            {activeTab === 'personal' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>👤 Personal Information</h3>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label style={labelStyle}>Email (read-only)</label>
                    <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={user?.email || ''} readOnly />
                  </div>
                  <div className="col-12 col-md-6">
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="+1 234 567 8900" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label style={labelStyle}>Location</label>
                    <input style={inputStyle} value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} placeholder="City, Country" />
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Professional Bio</label>
                    <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={personal.bio} onChange={(e) => setPersonal({ ...personal, bio: e.target.value })} placeholder="Brief description about yourself, your background, and goals..." />
                  </div>
                  <div className="col-12 col-md-4">
                    <label style={labelStyle}><i className="fab fa-github" style={{ marginRight: 4 }} /> GitHub URL</label>
                    <input style={inputStyle} value={personal.github} onChange={(e) => setPersonal({ ...personal, github: e.target.value })} placeholder="https://github.com/username" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label style={labelStyle}><i className="fab fa-linkedin" style={{ marginRight: 4 }} /> LinkedIn URL</label>
                    <input style={inputStyle} value={personal.linkedin} onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label style={labelStyle}><i className="fas fa-globe" style={{ marginRight: 4 }} /> Portfolio URL</label>
                    <input style={inputStyle} value={personal.portfolio} onChange={(e) => setPersonal({ ...personal, portfolio: e.target.value })} placeholder="https://yourportfolio.com" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Education ── */}
            {activeTab === 'education' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>🎓 Education</h3>
                  <button onClick={addEducation} className="btn-gradient" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className="fas fa-plus" /> Add
                  </button>
                </div>
                {education.map((ed, i) => (
                  <div key={i} style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-light)' }}>Education #{i + 1}</span>
                      {education.length > 1 && (
                        <button onClick={() => removeEducation(i)} style={{ background: 'var(--danger-light)', border: 'none', borderRadius: 6, color: 'var(--danger)', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </div>
                    <div className="row g-2">
                      <div className="col-12 col-md-6"><label style={labelStyle}>Institution</label><input style={inputStyle} value={ed.institution} onChange={(e) => updateEd(i, 'institution', e.target.value)} placeholder="University Name" /></div>
                      <div className="col-12 col-md-6"><label style={labelStyle}>Degree</label><input style={inputStyle} value={ed.degree} onChange={(e) => updateEd(i, 'degree', e.target.value)} placeholder="B.Sc. Computer Science" /></div>
                      <div className="col-12 col-md-6"><label style={labelStyle}>Field of Study</label><input style={inputStyle} value={ed.field} onChange={(e) => updateEd(i, 'field', e.target.value)} placeholder="Computer Science" /></div>
                      <div className="col-4 col-md-2"><label style={labelStyle}>Start Year</label><input style={inputStyle} value={ed.startYear} onChange={(e) => updateEd(i, 'startYear', e.target.value)} placeholder="2020" /></div>
                      <div className="col-4 col-md-2"><label style={labelStyle}>End Year</label><input style={inputStyle} value={ed.endYear} onChange={(e) => updateEd(i, 'endYear', e.target.value)} placeholder="2024" /></div>
                      <div className="col-4 col-md-2"><label style={labelStyle}>Grade / GPA</label><input style={inputStyle} value={ed.grade} onChange={(e) => updateEd(i, 'grade', e.target.value)} placeholder="3.8 / 4.0" /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Experience ── */}
            {activeTab === 'experience' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>💼 Work Experience</h3>
                  <button onClick={addExperience} className="btn-gradient" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className="fas fa-plus" /> Add
                  </button>
                </div>
                {experience.map((exp, i) => (
                  <div key={i} style={{ background: 'rgba(108,99,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-light)' }}>Experience #{i + 1}</span>
                      {experience.length > 1 && (
                        <button onClick={() => removeExperience(i)} style={{ background: 'var(--danger-light)', border: 'none', borderRadius: 6, color: 'var(--danger)', padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                          <i className="fas fa-trash" />
                        </button>
                      )}
                    </div>
                    <div className="row g-2">
                      <div className="col-12 col-md-6"><label style={labelStyle}>Company</label><input style={inputStyle} value={exp.company} onChange={(e) => updateExp(i, 'company', e.target.value)} placeholder="Company Name" /></div>
                      <div className="col-12 col-md-6"><label style={labelStyle}>Job Title</label><input style={inputStyle} value={exp.title} onChange={(e) => updateExp(i, 'title', e.target.value)} placeholder="Software Engineer" /></div>
                      <div className="col-12 col-md-4"><label style={labelStyle}>Location</label><input style={inputStyle} value={exp.location} onChange={(e) => updateExp(i, 'location', e.target.value)} placeholder="Remote / City" /></div>
                      <div className="col-6 col-md-3"><label style={labelStyle}>Start Date</label><input type="month" style={inputStyle} value={exp.startDate} onChange={(e) => updateExp(i, 'startDate', e.target.value)} /></div>
                      <div className="col-6 col-md-3"><label style={labelStyle}>End Date</label><input type="month" style={inputStyle} value={exp.endDate} onChange={(e) => updateExp(i, 'endDate', e.target.value)} disabled={exp.current} /></div>
                      <div className="col-12 col-md-2" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0, cursor: 'pointer' }}>
                          <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(i, 'current', e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                          Current
                        </label>
                      </div>
                      <div className="col-12">
                        <label style={labelStyle}>Description</label>
                        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={exp.description} onChange={(e) => updateExp(i, 'description', e.target.value)} placeholder="Describe your role, responsibilities, and achievements..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Skills ── */}
            {activeTab === 'skills' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>⚡ Skills & Interests</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Technical Skills</label>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Type a skill and press Enter or click Add</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="e.g., React, Python, SQL..."
                    />
                    <button onClick={addSkill} className="btn-gradient" style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      <i className="fas fa-plus" /> Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {skills.map((skill, i) => (
                      <span key={i} className="skill-tag">
                        {skill}
                        <span className="remove-btn" onClick={() => removeSkill(i)}>✕</span>
                      </span>
                    ))}
                    {!skills.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No skills added yet</span>}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Interests</label>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Add topics you're passionate about</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                      placeholder="e.g., AI/ML, Robotics, Web Development..."
                    />
                    <button onClick={addInterest} className="btn-gradient" style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      <i className="fas fa-plus" /> Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {interests.map((interest, i) => (
                      <span key={i} className="skill-tag" style={{ background: 'rgba(0,212,255,0.12)', borderColor: 'rgba(0,212,255,0.3)', color: 'var(--accent)' }}>
                        {interest}
                        <span className="remove-btn" onClick={() => removeInterest(i)}>✕</span>
                      </span>
                    ))}
                    {!interests.length && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No interests added yet</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Career Goals ── */}
            {activeTab === 'goals' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🎯 Career Goals</h3>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Primary Career Goal</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                  >
                    <option value="">Select your primary goal...</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="fullstack">Full Stack Developer</option>
                    <option value="mobile">Mobile Developer</option>
                    <option value="devops">DevOps Engineer</option>
                    <option value="data-science">Data Scientist</option>
                    <option value="ml-engineer">ML Engineer</option>
                    <option value="product-manager">Product Manager</option>
                    <option value="ux-designer">UX Designer</option>
                    <option value="cybersecurity">Cybersecurity Engineer</option>
                    <option value="cloud">Cloud Engineer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div
                  style={{
                    background: 'rgba(108,99,255,0.06)',
                    border: '1px solid rgba(108,99,255,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 0 }}>
                    💡 <strong style={{ color: 'var(--primary-light)' }}>Pro tip:</strong> Setting a clear career goal helps our AI generate more accurate learning roadmaps, interview questions, and job recommendations tailored specifically to your target role.
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => fetchProfile()}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-btn)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Reset
              </button>
              <button
                onClick={saveTab}
                disabled={loading}
                className="btn-gradient"
                style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? <><ButtonLoader /> Saving...</> : <><i className="fas fa-save" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
