import { useState } from 'react';
import { FiFileText, FiPlus, FiTrash2, FiDownload, FiUser, FiMail, FiPhone, FiBriefcase, FiBook, FiAward } from 'react-icons/fi';

const INITIAL = {
  name: 'Arun Kumar',
  email: 'arun.kumar@college.edu',
  phone: '9876543210',
  linkedin: 'linkedin.com/in/arunkumar',
  github: 'github.com/arunkumar',
  objective: 'Motivated CSE student seeking opportunities to apply technical skills in a dynamic environment.',
  education: [
    { degree: 'B.E. Computer Science & Engineering', institution: 'ABC Engineering College', year: '2021–2025', cgpa: '8.4' },
    { degree: 'HSC (12th)', institution: 'XYZ Matriculation School', year: '2021', percentage: '92%' },
  ],
  skills: ['JavaScript', 'React', 'Java', 'Spring Boot', 'MySQL', 'Python', 'Git'],
  projects: [
    { name: 'Smart Student App', description: 'Full-stack academic management system using React, Spring Boot and MySQL.', tech: 'React, Spring Boot, MySQL' },
  ],
  certifications: [
    { name: 'Java Programming', issuer: 'NPTEL', year: '2023' },
  ],
  achievements: ['College Topper – Semester 4', 'Winner – State Level Hackathon 2023'],
};

export default function ResumeBuilder() {
  const [data, setData] = useState(INITIAL);
  const [preview, setPreview] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const update = (field, value) => setData((d) => ({ ...d, [field]: value }));

  const addSkill = () => {
    if (newSkill.trim()) { update('skills', [...data.skills, newSkill.trim()]); setNewSkill(''); }
  };
  const removeSkill = (i) => update('skills', data.skills.filter((_, idx) => idx !== i));

  const addProject = () => update('projects', [...data.projects, { name: '', description: '', tech: '' }]);
  const updateProject = (i, field, val) => {
    const p = [...data.projects]; p[i] = { ...p[i], [field]: val }; update('projects', p);
  };
  const removeProject = (i) => update('projects', data.projects.filter((_, idx) => idx !== i));

  const addCert = () => update('certifications', [...data.certifications, { name: '', issuer: '', year: '' }]);
  const updateCert = (i, field, val) => {
    const c = [...data.certifications]; c[i] = { ...c[i], [field]: val }; update('certifications', c);
  };

  const handlePrint = () => window.print();

  return (
    <>
      <div className="page-header">
        <h1><FiFileText style={{ marginRight: 8 }} />Resume Builder</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setPreview(!preview)}>
            {preview ? 'Edit Mode' : 'Preview'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <FiDownload /> Export / Print
          </button>
        </div>
      </div>

      <div className="page-body">
        {!preview ? (
          /* ── Editor ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Personal Info */}
            <div className="card">
              <div className="card-title"><FiUser style={{ marginRight: 6 }} />Personal Information</div>
              <div className="grid-2">
                {[['name','Full Name','text'],['email','Email','email'],['phone','Phone','tel'],['linkedin','LinkedIn URL','url'],['github','GitHub URL','url']].map(([key, label, type]) => (
                  <div key={key} className="form-group">
                    <label className="form-label">{label}</label>
                    <input type={type} className="form-control" value={data[key]} onChange={(e) => update(key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Career Objective</label>
                <textarea className="form-control" rows={3} value={data.objective} onChange={(e) => update('objective', e.target.value)} />
              </div>
            </div>

            {/* Skills */}
            <div className="card">
              <div className="card-title"><FiAward style={{ marginRight: 6 }} />Technical Skills</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e8eaf6', color: 'var(--primary)', borderRadius: 6, padding: '4px 10px', fontWeight: 600, fontSize: '0.85rem' }}>
                    {s}
                    <button onClick={() => removeSkill(i)} style={{ background: 'none', color: 'var(--danger)', fontSize: '0.9rem' }} aria-label={`Remove ${s}`}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" placeholder="Add skill…" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} style={{ maxWidth: 240 }} />
                <button className="btn btn-primary btn-sm" onClick={addSkill}><FiPlus /> Add</button>
              </div>
            </div>

            {/* Projects */}
            <div className="card">
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><FiBriefcase style={{ marginRight: 6 }} />Projects</span>
                <button className="btn btn-primary btn-sm" onClick={addProject}><FiPlus /> Add</button>
              </div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ background: '#f9f9ff', borderRadius: 10, padding: 16, marginBottom: 12, border: '1.5px solid var(--border)' }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Project Name</label>
                      <input className="form-control" value={p.name} onChange={(e) => updateProject(i, 'name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Technologies Used</label>
                      <input className="form-control" value={p.tech} onChange={(e) => updateProject(i, 'tech', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={2} value={p.description} onChange={(e) => updateProject(i, 'description', e.target.value)} />
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeProject(i)}><FiTrash2 /> Remove</button>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="card">
              <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><FiBook style={{ marginRight: 6 }} />Certifications</span>
                <button className="btn btn-primary btn-sm" onClick={addCert}><FiPlus /> Add</button>
              </div>
              {data.certifications.map((c, i) => (
                <div key={i} className="grid-3" style={{ marginBottom: 10 }}>
                  {[['name','Certificate Name'],['issuer','Issuer'],['year','Year']].map(([key, label]) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{label}</label>
                      <input className="form-control" value={c[key]} onChange={(e) => updateCert(i, key, e.target.value)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="card">
              <div className="card-title"><FiAward style={{ marginRight: 6 }} />Achievements</div>
              {data.achievements.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="form-control" value={a} onChange={(e) => { const arr = [...data.achievements]; arr[i] = e.target.value; update('achievements', arr); }} />
                  <button className="btn btn-danger btn-sm" onClick={() => update('achievements', data.achievements.filter((_, idx) => idx !== i))} aria-label="Remove achievement"><FiTrash2 /></button>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={() => update('achievements', [...data.achievements, ''])}><FiPlus /> Add</button>
            </div>
          </div>
        ) : (
          /* ── Preview / Print ── */
          <div id="resume-print" className="card" style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'Georgia, serif', padding: 40 }}>
            <h1 style={{ textAlign: 'center', fontSize: '1.8rem', color: '#1a237e', marginBottom: 4 }}>{data.name}</h1>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#555', marginBottom: 20 }}>
              {data.email} &bull; {data.phone} &bull; {data.linkedin} &bull; {data.github}
            </p>
            <hr style={{ borderColor: '#1a237e', marginBottom: 16 }} />

            <Section title="Career Objective"><p style={{ fontSize: '0.9rem' }}>{data.objective}</p></Section>

            <Section title="Education">
              {data.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <strong>{e.degree}</strong> – {e.institution} ({e.year})
                  {e.cgpa && <span> | CGPA: {e.cgpa}</span>}
                  {e.percentage && <span> | {e.percentage}</span>}
                </div>
              ))}
            </Section>

            <Section title="Technical Skills">
              <p>{data.skills.join(' • ')}</p>
            </Section>

            <Section title="Projects">
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{p.name}</strong> <em style={{ color: '#555' }}>({p.tech})</em>
                  <p style={{ fontSize: '0.88rem', marginTop: 2 }}>{p.description}</p>
                </div>
              ))}
            </Section>

            <Section title="Certifications">
              {data.certifications.map((c, i) => (
                <div key={i}>{c.name} – {c.issuer} ({c.year})</div>
              ))}
            </Section>

            <Section title="Achievements">
              <ul style={{ paddingLeft: 18 }}>
                {data.achievements.map((a, i) => <li key={i} style={{ marginBottom: 4 }}>{a}</li>)}
              </ul>
            </Section>
          </div>
        )}
      </div>

      <style>{`@media print { .sidebar, .page-header, .btn { display: none !important; } .main-content { margin: 0; } }`}</style>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: '1rem', color: '#1a237e', borderBottom: '1px solid #1a237e', paddingBottom: 4, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
      {children}
    </div>
  );
}
