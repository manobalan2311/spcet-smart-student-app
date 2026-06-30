import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX,
  FiCamera, FiBook, FiBarChart2, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import './Profile.css';

const EMPTY_PROFILE = {
  name: '',
  rollNo: '',
  email: '',
  phone: '',
  department: '',
  semester: '',
  batch: '',
  section: '',
  dob: '',
  bloodGroup: '',
  address: '',
  parentName: '',
  parentPhone: '',
  cgpa: null,
  attendance: null,
  avatarUrl: null,
};

// ── Reusable per-section edit card ────────────────────────────────────────────
function EditableSection({ title, icon, children, fields, profile, onSave }) {
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({ ...profile });
  const [saved, setSaved]       = useState(false);

  // Sync form when parent profile changes (e.g. avatar saved externally)
  const handleEdit = () => { setForm({ ...profile }); setEditing(true); setSaved(false); };
  const handleCancel = () => { setForm({ ...profile }); setEditing(false); };
  const handleSave = () => {
    onSave(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderField = (label, key, type = 'text', readOnly = false) => (
    <div className="form-group" key={key}>
      <label className="form-label">{label}</label>
      {editing && !readOnly ? (
        <input
          type={type}
          className="form-control"
          value={form[key] || ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <div className="profile-field-value">{profile[key] || '—'}</div>
      )}
    </div>
  );

  return (
    <div className="card profile-section-card">
      <div className="profile-section-header">
        <div className="card-title" style={{ margin: 0 }}>{icon}{title}</div>
        {saved && !editing && (
          <span className="profile-saved-badge"><FiCheckCircle size={13} /> Saved</span>
        )}
        {!editing ? (
          <button className="btn btn-outline btn-sm profile-edit-btn" onClick={handleEdit}>
            <FiEdit2 size={13} /> Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-success btn-sm" onClick={handleSave}><FiSave size={13} /> Save</button>
            <button className="btn btn-outline btn-sm" onClick={handleCancel}><FiX size={13} /> Cancel</button>
          </div>
        )}
      </div>
      {typeof children === 'function'
        ? children({ renderField, editing, form, setForm })
        : fields?.map(([label, key, type, ro]) => renderField(label, key, type, ro))
      }
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const { user } = useAuth();
  const studentId = user?.studentId;
  const [profile, setProfile] = useState({
    ...EMPTY_PROFILE,
    name:  user?.name  || '',
    email: user?.email || '',
  });
  const [saveError, setSaveError] = useState('');
  const avatarInputRef = useRef(null);

  // Load the saved profile from the database on mount.
  useEffect(() => {
    if (!studentId) return;
    let active = true;
    studentAPI.getProfile(studentId)
      .then(({ data }) => {
        if (!active || !data) return;
        setProfile((p) => ({
          ...p,
          name:        data.name        ?? p.name,
          rollNo:      data.rollNo      ?? '',
          email:       data.email       ?? p.email,
          phone:       data.phone       ?? '',
          department:  data.department  ?? '',
          semester:    data.semester    ?? '',
          batch:       data.batch       ?? '',
          section:     data.section     ?? '',
          dob:         data.dob         ?? '',
          bloodGroup:  data.bloodGroup  ?? '',
          address:     data.address     ?? '',
          parentName:  data.parentName  ?? '',
          parentPhone: data.parentPhone ?? '',
          avatarUrl:   data.profilePhoto ?? p.avatarUrl,
        }));
      })
      .catch(() => { /* no saved profile yet – keep fields empty */ });
    return () => { active = false; };
  }, [studentId]);

  // Persist edited fields to the database.
  const update = useCallback((patch) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (studentId) {
        setSaveError('');
        studentAPI.updateProfile(studentId, {
          name:        next.name,
          dob:         next.dob || null,
          bloodGroup:  next.bloodGroup,
          phone:       next.phone,
          address:     next.address,
          parentName:  next.parentName,
          parentPhone: next.parentPhone,
        }).catch(() => setSaveError('Could not save changes. Please try again.'));
      }
      return next;
    });
  }, [studentId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfile((p) => ({ ...p, avatarUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="page-body">
        {saveError && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            <FiAlertCircle /> {saveError}
          </div>
        )}
        <div className="grid-2" style={{ gap: 20 }}>

          {/* ── Hero / Avatar card ─────────────────────────────────── */}
          <div className="card profile-hero" style={{ gridColumn: '1 / -1' }}>
            {/* Avatar with camera overlay */}
            <div className="profile-avatar-wrap">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-initials">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <button
                className="profile-avatar-camera"
                onClick={() => avatarInputRef.current?.click()}
                title="Change photo"
              >
                <FiCamera size={15} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* Summary */}
            <div className="profile-hero-info">
              <h2 className="profile-hero-name">{profile.name || 'Your Name'}</h2>
              <p className="profile-hero-sub">
                {profile.rollNo || '—'} &bull; {profile.department || '—'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">
                  Semester {profile.semester || '—'}
                </span>
                {profile.cgpa != null && (
                  <span className="badge badge-success">CGPA: {profile.cgpa}</span>
                )}
                {profile.attendance != null && (
                  <span className={`badge ${profile.attendance >= 75 ? 'badge-success' : 'badge-danger'}`}>
                    Attendance: {profile.attendance}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Personal Information ───────────────────────────────── */}
          <EditableSection
            title="Personal Information"
            icon={<FiUser style={{ marginRight: 6 }} />}
            profile={profile}
            onSave={update}
            fields={[
              ['Full Name',    'name'],
              ['Date of Birth','dob', 'date'],
              ['Blood Group',  'bloodGroup'],
              ['Address',      'address'],
            ]}
          />

          {/* ── Academic Details (read-only) ───────────────────────── */}
          <div className="card profile-section-card">
            <div className="profile-section-header">
              <div className="card-title" style={{ margin: 0 }}>
                <FiBook style={{ marginRight: 6 }} />Academic Details
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Managed by Admin</span>
            </div>
            {[
              ['Roll Number',  profile.rollNo],
              ['Department',   profile.department],
              ['Batch',        profile.batch],
              ['Section',      profile.section],
            ].map(([label, value]) => (
              <div className="form-group" key={label}>
                <label className="form-label">{label}</label>
                <div className="profile-field-value">{value || '—'}</div>
              </div>
            ))}
          </div>

          {/* ── Contact Details ────────────────────────────────────── */}
          <EditableSection
            title="Contact Details"
            icon={<FiPhone style={{ marginRight: 6 }} />}
            profile={profile}
            onSave={update}
            fields={[
              ['Email',              'email', 'email', true],
              ['Phone',              'phone', 'tel'],
              ['Parent / Guardian',  'parentName'],
              ['Parent Phone',       'parentPhone', 'tel'],
            ]}
          />

          {/* ── Performance Summary ────────────────────────────────── */}
          <div className="card profile-section-card">
            <div className="profile-section-header">
              <div className="card-title" style={{ margin: 0 }}>
                <FiBarChart2 style={{ marginRight: 6 }} />Performance Summary
              </div>
            </div>
            {[
              {
                label: 'Attendance',
                value: profile.attendance ?? 0,
                display: profile.attendance != null ? `${profile.attendance}%` : '—',
                color: (profile.attendance ?? 0) >= 75 ? 'green' : 'red',
              },
              {
                label: 'CGPA (out of 10)',
                value: (profile.cgpa ?? 0) * 10,
                display: profile.cgpa != null ? `${profile.cgpa} / 10` : '—',
                color: 'blue',
              },
            ].map((p) => (
              <div key={p.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.label}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{p.display}</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${p.color}`} style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
