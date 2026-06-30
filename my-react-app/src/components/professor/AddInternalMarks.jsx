import { useState, useEffect, useMemo } from 'react';
import { FiSave, FiSearch, FiEdit3, FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { professorAPI } from '../../services/api';

const SECTIONS    = ['All', 'A', 'B'];
const IA_OPTIONS  = [
  { label: 'IA1', value: 1 },
  { label: 'IA2', value: 2 },
  { label: 'IA3', value: 3 },
];
const MAX_MARKS   = 20;

export default function AddInternalMarks() {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  const [subjectId, setSubjectId] = useState('');
  const [section, setSection]     = useState('All');
  const [ia, setIa]               = useState(1);
  const [marks, setMarks]         = useState({});
  const [search, setSearch]       = useState('');
  const [saved, setSaved]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Load subjects and students for the professor's department
  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!user?.professorId || !user?.departmentId) {
        setLoadError('Your professor profile is incomplete. Please sign in again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const [subjectsRes, studentsRes] = await Promise.all([
          professorAPI.getSubjects(user.professorId),
          professorAPI.getStudentsForPortal(user.departmentId),
        ]);
        if (!active) return;
        const subjectList = subjectsRes.data || [];
        setSubjects(subjectList);
        setStudents(studentsRes.data || []);
        if (subjectList.length > 0) setSubjectId(subjectList[0].id);
      } catch (err) {
        if (!active) return;
        setLoadError(
          err.response?.data?.message || 'Failed to load subjects and students.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [user?.professorId, user?.departmentId]);

  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSection = section === 'All' || (s.section || '').toUpperCase() === section;
      const term = search.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(term) ||
        (s.rollNo || '').toLowerCase().includes(term);
      return matchSection && matchSearch;
    });
  }, [students, section, search]);

  const setMark = (studentId, val) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= MAX_MARKS) {
      setMarks((m) => ({ ...m, [`${studentId}_${ia}`]: num }));
    } else if (val === '') {
      setMarks((m) => {
        const copy = { ...m };
        delete copy[`${studentId}_${ia}`];
        return copy;
      });
    }
  };

  const filledForIa = visibleStudents.filter(
    (s) => marks[`${s.id}_${ia}`] !== undefined
  );

  const handleSave = async () => {
    if (!subjectId) {
      setSaveError('Please select a subject before saving.');
      return;
    }
    if (filledForIa.length === 0) {
      setSaveError('Enter marks for at least one student before saving.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      await Promise.all(
        filledForIa.map((s) =>
          professorAPI.addInternalMarks({
            studentId: s.id,
            subjectId: Number(subjectId),
            professorId: user.professorId,
            iaNumber: ia,
            marks: marks[`${s.id}_${ia}`],
          })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || 'Failed to save marks. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = async () => {
    setExporting(true);
    setSaveError('');
    try {
      const res = await professorAPI.getInternalMarksForExport(user.professorId);
      const rows = res.data || [];
      if (rows.length === 0) {
        setSaveError('No saved marks to export yet.');
        return;
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        professorId: user.professorId,
        professorName: user.name ?? null,
        count: rows.length,
        internalMarks: rows,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.download = `internal-marks-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || 'Failed to export marks. Please try again.'
      );
    } finally {
      setExporting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === Number(subjectId));
  const iaLabel = IA_OPTIONS.find((o) => o.value === ia)?.label;

  return (
    <>
      <div className="page-header">
        <h1><FiEdit3 style={{ marginRight: 8 }} />Add Internal Assessment Marks</h1>
      </div>

      <div className="page-body">
        {saved && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <FiCheckCircle /> Marks saved successfully and visible to students!
          </div>
        )}
        {saveError && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <FiAlertCircle /> {saveError}
          </div>
        )}
        {loadError && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <FiAlertCircle /> {loadError}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Loading subjects and students…</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">Select Criteria</div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-control"
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    disabled={subjects.length === 0}
                  >
                    {subjects.length === 0 ? (
                      <option value="">No subjects available</option>
                    ) : (
                      subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select className="form-control" value={section} onChange={(e) => setSection(e.target.value)}>
                    {SECTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Internal Assessment</label>
                  <select className="form-control" value={ia} onChange={(e) => setIa(Number(e.target.value))}>
                    {IA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div className="card-title" style={{ margin: 0 }}>
                  Enter Marks – {selectedSubject?.name ?? '—'} | Sec {section} | {iaLabel} (Max: {MAX_MARKS})
                </div>
                <div style={{ position: 'relative', width: 220 }}>
                  <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
                  <input className="form-control" style={{ paddingLeft: 34 }} placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>{iaLabel} Marks (/ {MAX_MARKS})</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>
                          No students found for this department/section.
                        </td>
                      </tr>
                    ) : (
                      visibleStudents.map((s) => {
                        const key = `${s.id}_${ia}`;
                        const val = marks[key];
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                            <td>{s.name}</td>
                            <td>
                              <input
                                type="number"
                                min={0} max={MAX_MARKS}
                                className="form-control"
                                style={{ width: 80 }}
                                placeholder="—"
                                value={val ?? ''}
                                onChange={(e) => setMark(s.id, e.target.value)}
                              />
                            </td>
                            <td>
                              {val !== undefined ? (
                                <span className={`badge ${val >= 14 ? 'badge-success' : val >= 10 ? 'badge-warning' : 'badge-danger'}`}>
                                  {val}/{MAX_MARKS}
                                </span>
                              ) : (
                                <span className="badge badge-primary">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {filledForIa.length} / {visibleStudents.length} filled
                </span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handleExportJson}
                    disabled={exporting}
                    title="Download all saved internal marks as a JSON file"
                  >
                    {exporting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 3 }} /> : <><FiDownload /> Export to JSON</>}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSave}
                    disabled={saving || !subjectId || filledForIa.length === 0}
                  >
                    {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 3 }} /> : <><FiSave /> Save Marks</>}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
