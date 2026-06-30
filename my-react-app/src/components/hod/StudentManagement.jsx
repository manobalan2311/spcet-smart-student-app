import { useEffect, useState } from 'react';
import { FiSearch, FiUser, FiX, FiAlertCircle } from 'react-icons/fi';
import { hodAPI } from '../../services/api';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await hodAPI.getAllStudents();
        if (!active) return;
        setStudents(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'Failed to load students.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const sections = Array.from(new Set(students.map((s) => s.section).filter(Boolean))).sort();

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    const matchSearch =
      (s.name || '').toLowerCase().includes(term) ||
      (s.rollNo || '').toLowerCase().includes(term);
    const matchSection = sectionFilter === 'all' || s.section === sectionFilter;
    return matchSearch && matchSection;
  });

  return (
    <>
      <div className="page-header">
        <h1>Student Management</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {filtered.length} of {students.length} students
        </span>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
              <input className="form-control" style={{ paddingLeft: 34 }} placeholder="Search by name or register no…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button
              className={`btn btn-sm ${sectionFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSectionFilter('all')}
            >
              All Sections
            </button>
            {sections.map((sec) => (
              <button
                key={sec}
                className={`btn btn-sm ${sectionFilter === sec ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSectionFilter(sec)}
              >
                Section {sec}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Loading students…
          </div>
        )}

        {!loading && error && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)' }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {!loading && !error && (
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
                    <th>Phone</th>
                    <th>Scholarship</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td>{s.department || '—'}</td>
                        <td>{s.semester}</td>
                        <td>{s.section}</td>
                        <td>{s.phone || '—'}</td>
                        <td>{s.scholarship || '—'}</td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => setSelected(s)}>
                            <FiUser size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student detail modal */}
        {selected && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div className="modal">
              <div className="modal-header">
                <span className="modal-title">Student Profile</span>
                <button className="modal-close" onClick={() => setSelected(null)}><FiX /></button>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#1a237e,#3949ab)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                  {(selected.name || '?').charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: 'var(--primary)' }}>{selected.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{selected.rollNo} · Sem {selected.semester} · Sec {selected.section}</p>
                </div>
              </div>
              {[
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Date of Birth', selected.dob],
                ['Blood Group', selected.bloodGroup],
                ['Department', selected.department],
                ['Batch', selected.batch],
                ['Address', selected.address],
                ['Parent / Guardian', selected.parentName],
                ['Parent Phone', selected.parentPhone],
                ['Scholarship', selected.scholarship],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 700, textAlign: 'right' }}>{val || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
