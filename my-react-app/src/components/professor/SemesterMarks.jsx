import { useState, useEffect } from 'react';
import { FiAward, FiSend, FiCheckCircle, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { professorAPI } from '../../services/api';

const SUBJECTS = [
  { id: 1, name: 'Data Structures & Algorithms', code: 'CS601' },
  { id: 2, name: 'Computer Networks',             code: 'CS602' },
];

export default function ProfessorSemesterMarks() {
  const { user } = useAuth();

  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState('');

  const [subject, setSubject]   = useState(SUBJECTS[0].id);
  const [intMarks, setIntMarks] = useState({});
  const [extMarks, setExtMarks] = useState({});
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  // Load the professor's department students (same roster as the Student List)
  useEffect(() => {
    let active = true;
    async function loadStudents() {
      if (!user?.departmentId) {
        setLoadError('Your professor profile is incomplete. Please sign in again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const res = await professorAPI.getStudentsForPortal(user.departmentId);
        if (!active) return;
        setStudents(res.data || []);
      } catch (err) {
        if (active) setLoadError(err.response?.data?.message || 'Failed to load students.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStudents();
    return () => { active = false; };
  }, [user?.departmentId]);

  const setInt = (id, val) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n <= 75) {
      setIntMarks((m) => ({ ...m, [id]: n }));
    } else if (val === '') {
      setIntMarks((m) => { const c = { ...m }; delete c[id]; return c; });
    }
  };

  const setExt = (id, val) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n <= 75) {
      setExtMarks((m) => ({ ...m, [id]: n }));
    } else if (val === '') {
      setExtMarks((m) => { const c = { ...m }; delete c[id]; return c; });
    }
  };

  const handleSend = async () => {
    setSending(true);
    // API: professorAPI.sendSemesterMarks({ subjectId: subject, marks: extMarks })
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  const handleExportJson = () => {
    const subjectMeta = SUBJECTS.find((s) => s.id === subject);
    const rows = students
      .filter((s) => extMarks[s.id] !== undefined)
      .map((s) => {
        const internal = intMarks[s.id] ?? 0;
        const external = extMarks[s.id];
        const total = internal + external;
        return {
          rollNo: s.rollNo,
          studentName: s.name,
          subjectCode: subjectMeta?.code ?? null,
          subjectName: subjectMeta?.name ?? null,
          internal,
          external,
          total,
          result: total >= 75 && external >= 30 ? 'PASS' : 'FAIL',
        };
      });
    if (rows.length === 0) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      subjectCode: subjectMeta?.code ?? null,
      subjectName: subjectMeta?.name ?? null,
      count: rows.length,
      semesterMarks: rows,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `semester-marks-${subjectMeta?.code ?? 'subject'}-${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const anyFilled = students.some((s) => extMarks[s.id] !== undefined);
  const allFilled = students.length > 0 && students.every((s) => extMarks[s.id] !== undefined);

  return (
    <>
      <div className="page-header">
        <h1><FiAward style={{ marginRight: 8 }} />Semester Marks Entry</h1>
      </div>

      <div className="page-body">
        {sent && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <FiCheckCircle /> Semester marks sent to students successfully!
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group" style={{ maxWidth: 320 }}>
            <label className="form-label">Select Subject</label>
            <select className="form-control" value={subject} onChange={(e) => setSubject(Number(e.target.value))}>
              {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Loading students…
          </div>
        )}

        {!loading && loadError && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)' }}>
            <FiAlertCircle /> {loadError}
          </div>
        )}

        {!loading && !loadError && (
        <div className="card">
          <div className="card-title">
            Enter Marks – {SUBJECTS.find((s) => s.id === subject)?.name} (Internal /75, External /75)
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Internal (/75)</th>
                  <th>External (/75)</th>
                  <th>Total (/150)</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>
                      No students found.
                    </td>
                  </tr>
                )}
                {students.map((s) => {
                  const intl = intMarks[s.id];
                  const ext = extMarks[s.id];
                  const total = ext !== undefined ? (intl ?? 0) + ext : null;
                  const passed = total !== null && total >= 75 && ext >= 30;
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>
                        <input
                          type="number" min={0} max={75}
                          className="form-control" style={{ width: 80 }}
                          placeholder="—"
                          value={intl ?? ''}
                          onChange={(e) => setInt(s.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number" min={0} max={75}
                          className="form-control" style={{ width: 80 }}
                          placeholder="—"
                          value={ext ?? ''}
                          onChange={(e) => setExt(s.id, e.target.value)}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>{total ?? '—'}</td>
                      <td>
                        {total !== null ? (
                          <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                            {passed ? 'PASS' : 'FAIL'}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button
              className="btn btn-secondary"
              onClick={handleExportJson}
              disabled={!anyFilled}
              title="Download the entered semester marks as a JSON file"
            >
              <FiDownload /> Export to JSON
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={sending || !allFilled}
            >
              {sending ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 3 }} /> : <><FiSend /> Publish Marks</>}
            </button>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
