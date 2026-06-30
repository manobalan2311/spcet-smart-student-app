import { useState, useEffect, useMemo } from 'react';
import {
  FiSearch, FiUser, FiX, FiUserPlus, FiCheckCircle, FiAlertCircle,
  FiBook,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { professorAPI } from '../../services/api';

const SECTIONS = ['All', 'A', 'B'];

const EMPTY_FORM = {
  rollNo: '',
  name: '',
  email: '',
  password: '',
  phone: '',
  dob: '',
  bloodGroup: '',
  address: '',
  batch: '',
  semester: 6,
  section: 'A',
  parentName: '',
  parentPhone: '',
};

export default function StudentList() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch]   = useState('');
  const [section, setSection] = useState('All');
  const [selected, setSelected] = useState(null);

  // Add-student modal state
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const departmentId = user?.departmentId;
  const professorId = user?.professorId;

  useEffect(() => {
    if (!departmentId) return undefined;

    let active = true;
    (async () => {
      try {
        const [studentsRes, subjectsRes] = await Promise.all([
          professorAPI.getStudentsForPortal(departmentId),
          professorId
            ? professorAPI.getSubjects(professorId)
            : Promise.resolve({ data: [] }),
        ]);
        if (!active) return;
        setStudents(studentsRes.data || []);
        setSubjects(subjectsRes.data || []);
        setLoadError('');
      } catch (err) {
        if (active) setLoadError(err.response?.data?.message || 'Failed to load students.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [departmentId, professorId, refreshKey]);

  const isLoading = loading && !!departmentId;
  const effectiveError = !departmentId
    ? 'Your professor profile is incomplete. Please sign in again.'
    : loadError;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchSection = section === 'All' || (s.section || '').toUpperCase() === section;
      const matchSearch =
        !term ||
        (s.name || '').toLowerCase().includes(term) ||
        (s.rollNo || '').toLowerCase().includes(term);
      return matchSection && matchSearch;
    });
  }, [students, search, section]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setSuccessMsg('');
    setShowAdd(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!form.rollNo.trim() || !form.name.trim() || !form.email.trim()) {
      setFormError('Register number, name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        rollNo: form.rollNo.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
        phone: form.phone.trim() || null,
        dob: form.dob || null,
        bloodGroup: form.bloodGroup.trim() || null,
        address: form.address.trim() || null,
        departmentId: user.departmentId,
        batch: form.batch.trim() || null,
        semester: Number(form.semester),
        section: form.section || null,
        parentName: form.parentName.trim() || null,
        parentPhone: form.parentPhone.trim() || null,
      };
      const res = await professorAPI.createStudentFromPortal(payload);
      const pwd = res.data?.defaultPassword;
      setSuccessMsg(
        pwd
          ? `Student added successfully. Default login password: ${pwd}`
          : 'Student added successfully.'
      );
      setForm(EMPTY_FORM);
      setLoading(true);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setSaving(false);
    }
  };

  const detailRows = (s) => ([
    ['Register Number', s.rollNo],
    ['Email', s.email],
    ['Phone', s.phone],
    ['Date of Birth', s.dob],
    ['Blood Group', s.bloodGroup],
    ['Department', s.department],
    ['Batch', s.batch],
    ['Semester', s.semester],
    ['Section', s.section],
    ['Address', s.address],
    ['Parent / Guardian', s.parentName],
    ['Parent Phone', s.parentPhone],
    ['Scholarship', s.scholarship],
  ]);

  return (
    <>
      <div className="page-header">
        <h1>Student List</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {filtered.length} student{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="page-body">
        {/* Toolbar */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
              <input
                className="form-control"
                style={{ paddingLeft: 34 }}
                placeholder="Search by name or register number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                className={`btn btn-sm ${section === sec ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSection(sec)}
              >
                {sec === 'All' ? 'All Sections' : `Section ${sec}`}
              </button>
            ))}
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <FiUserPlus size={14} /> Add Student
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Loading students…
          </div>
        )}

        {!isLoading && effectiveError && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)' }}>
            <FiAlertCircle /> {effectiveError}
          </div>
        )}

        {!isLoading && !effectiveError && (
          <div className="card">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Register No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Section</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>
                        No students found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>{s.department || '—'}</td>
                      <td>{s.semester ?? '—'}</td>
                      <td>{s.section || '—'}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                          <FiUser size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View student details modal */}
        {selected && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div className="modal">
              <div className="modal-header">
                <span className="modal-title">Student Details</span>
                <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#00695c,#26a69a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                  {(selected.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: 'var(--primary)' }}>{selected.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {selected.rollNo} · Sem {selected.semester ?? '—'} · Sec {selected.section || '—'}
                  </p>
                </div>
              </div>

              {detailRows(selected).map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700, textAlign: 'right' }}>{val || '—'}</span>
                </div>
              ))}

              {subjects.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <FiBook size={14} /> Subjects (Department)
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {subjects.map((sub) => (
                      <span key={sub.id} className="badge badge-info">{sub.code} · {sub.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add student modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !saving) setShowAdd(false); }}>
            <div className="modal" style={{ maxWidth: 640 }}>
              <div className="modal-header">
                <span className="modal-title">Add Student</span>
                <button className="modal-close" onClick={() => !saving && setShowAdd(false)}><FiX /></button>
              </div>

              <form onSubmit={handleCreate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Register Number *</label>
                    <input className="form-control" value={form.rollNo} onChange={(e) => setField('rollNo', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Login Password</label>
                    <input className="form-control" placeholder="Defaults to <RegNo>@123" value={form.password} onChange={(e) => setField('password', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={form.dob} onChange={(e) => setField('dob', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <input className="form-control" value={form.bloodGroup} onChange={(e) => setField('bloodGroup', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch</label>
                    <input className="form-control" placeholder="e.g. 2021-2025" value={form.batch} onChange={(e) => setField('batch', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-control" value={form.semester} onChange={(e) => setField('semester', e.target.value)}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <select className="form-control" value={form.section} onChange={(e) => setField('section', e.target.value)}>
                      {['A', 'B', 'C'].map((sec) => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent / Guardian</label>
                    <input className="form-control" value={form.parentName} onChange={(e) => setField('parentName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Phone</label>
                    <input className="form-control" value={form.parentPhone} onChange={(e) => setField('parentPhone', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows={2} value={form.address} onChange={(e) => setField('address', e.target.value)} />
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Department: <strong>{user?.department || '—'}</strong> (your department)
                </div>

                {formError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', marginTop: 12, fontSize: '0.88rem' }}>
                    <FiAlertCircle /> {formError}
                  </div>
                )}
                {successMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success, #2e7d32)', marginTop: 12, fontSize: '0.88rem' }}>
                    <FiCheckCircle /> {successMsg}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)} disabled={saving}>Close</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiUserPlus size={14} /> {saving ? 'Saving…' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
