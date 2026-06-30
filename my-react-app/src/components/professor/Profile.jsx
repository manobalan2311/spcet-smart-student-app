import { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiUser, FiPhone, FiEdit2, FiSave, FiX,
  FiCamera, FiBriefcase, FiAward, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { professorAPI } from '../../services/api';
import '../student/Profile.css';

const EMPTY_PROFILE = {
  name: '',
  employeeId: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  qualification: '',
  avatarUrl: null,
};

// ── Reusable per-section edit card ────────────────────────────────────────────
function EditableSection({ title, icon, fields, profile, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...profile });
  const [saved, setSaved]     = useState(false);

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
      {fields?.map(([label, key, type, ro]) => renderField(label, key, type, ro))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProfessorProfile() {
  const { user } = useAuth();
  const professorId = user?.professorId;
  const [profile, setProfile] = useState({
    ...EMPTY_PROFILE,
    name:  user?.name  || '',
    email: user?.email || '',
  });
  const [saveError, setSaveError] = useState('');
  const avatarInputRef = useRef(null);

  // Load the saved profile from the database on mount.
  useEffect(() => {
    if (!professorId) return;
    let active = true;
    professorAPI.getProfile(professorId)
      .then(({ data }) => {
        if (!active || !data) return;
        setProfile((p) => ({
          ...p,
          name:          data.name          ?? p.name,
          employeeId:    data.employeeId    ?? '',
          email:         data.email         ?? p.email,
          phone:         data.phone         ?? '',
          department:    data.department     ?? '',
          designation:   data.designation    ?? '',
          qualification: data.qualification  ?? '',
          avatarUrl:     data.profilePhoto   ?? p.avatarUrl,
        }));
      })
      .catch(() => { /* no saved profile yet – keep fields empty */ });
    return () => { active = false; };
  }, [professorId]);

  // Persist edited fields to the database.
  const update = useCallback((patch) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (professorId) {
        setSaveError('');
        professorAPI.updateProfile(professorId, {
          name:          next.name,
          phone:         next.phone,
          designation:   next.designation,
          qualification: next.qualification,
        }).catch(() => setSaveError('Could not save changes. Please try again.'));
      }
      return next;
    });
  }, [professorId]);

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

            <div className="profile-hero-info">
              <h2 className="profile-hero-name">{profile.name || 'Your Name'}</h2>
              <p className="profile-hero-sub">
                {profile.employeeId || '—'} &bull; {profile.department || '—'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {profile.designation && (
                  <span className="badge badge-primary">{profile.designation}</span>
                )}
                {profile.qualification && (
                  <span className="badge badge-success">{profile.qualification}</span>
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
              ['Full Name',     'name'],
              ['Designation',   'designation'],
              ['Qualification', 'qualification'],
            ]}
          />

          {/* ── Professional Details (read-only) ───────────────────── */}
          <div className="card profile-section-card">
            <div className="profile-section-header">
              <div className="card-title" style={{ margin: 0 }}>
                <FiBriefcase style={{ marginRight: 6 }} />Professional Details
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Managed by Admin</span>
            </div>
            {[
              ['Employee ID', profile.employeeId],
              ['Department',  profile.department],
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
              ['Email', 'email', 'email', true],
              ['Phone', 'phone', 'tel'],
            ]}
          />

        </div>
      </div>
    </>
  );
}
