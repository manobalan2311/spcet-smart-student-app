import { useState, useEffect, useMemo } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';

function grade(pct) {
  if (pct >= 90) return { label: 'O',  class: 'badge-success' };
  if (pct >= 80) return { label: 'A+', class: 'badge-success' };
  if (pct >= 70) return { label: 'A',  class: 'badge-info' };
  if (pct >= 60) return { label: 'B+', class: 'badge-primary' };
  if (pct >= 50) return { label: 'B',  class: 'badge-warning' };
  return { label: 'C', class: 'badge-danger' };
}

// Pivot the flat list of IA marks (one row per subject + IA) into one row per subject
function pivotMarks(rows) {
  const bySubject = new Map();
  rows.forEach((r) => {
    const key = r.subjectId ?? r.subjectName ?? r.subjectCode;
    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subject: r.subjectName || r.subjectCode || 'Unknown',
        max: r.maxMarks ?? 20,
        ia1: null, ia2: null, ia3: null,
      });
    }
    const entry = bySubject.get(key);
    if (r.maxMarks) entry.max = r.maxMarks;
    if (r.iaNumber === 1) entry.ia1 = r.marks;
    else if (r.iaNumber === 2) entry.ia2 = r.marks;
    else if (r.iaNumber === 3) entry.ia3 = r.marks;
  });
  return Array.from(bySubject.values());
}

export default function InternalMarks() {
  const { user } = useAuth();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let active = true;
    async function loadMarks() {
      if (!user?.studentId) {
        setError('Your student profile is incomplete. Please sign in again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await studentAPI.getInternalMarks(user.studentId);
        if (!active) return;
        setRows(res.data || []);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load internal marks.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMarks();
    return () => { active = false; };
  }, [user?.studentId]);

  const totals = useMemo(() => {
    return pivotMarks(rows).map((m) => {
      const present = [m.ia1, m.ia2, m.ia3].filter((v) => v !== null && v !== undefined);
      const total = present.reduce((acc, v) => acc + v, 0);
      const maxTotal = (m.max || 20) * present.length;
      const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
      const g = grade(pct);
      return { ...m, total, pct, ...g };
    });
  }, [rows]);

  const avg = totals.length
    ? Math.round(totals.reduce((acc, m) => acc + m.pct, 0) / totals.length)
    : 0;

  return (
    <>
      <div className="page-header">
        <h1>Internal Assessment Marks</h1>
        {user?.semester != null && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Semester {user.semester}</span>
        )}
      </div>

      <div className="page-body">
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Loading your marks…</p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card blue">
                <div className="stat-value">{totals.length}</div>
                <div className="stat-label">Total Subjects</div>
              </div>
              <div className="stat-card green">
                <div className="stat-value">{avg}%</div>
                <div className="stat-label">Average Score</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-value">{totals.filter((m) => m.pct < 50).length}</div>
                <div className="stat-label">Below 50%</div>
              </div>
              <div className="stat-card teal">
                <div className="stat-value">{totals.filter((m) => m.pct >= 80).length}</div>
                <div className="stat-label">Above 80%</div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">IA Marks – All Subjects</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>IA 1 (/20)</th>
                      <th>IA 2 (/20)</th>
                      <th>IA 3 (/20)</th>
                      <th>Total</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>
                          No internal marks have been published yet.
                        </td>
                      </tr>
                    ) : (
                      totals.map((m) => (
                        <tr key={m.subject}>
                          <td style={{ fontWeight: 600 }}>{m.subject}</td>
                          <td>{m.ia1 ?? '—'}</td>
                          <td>{m.ia2 ?? '—'}</td>
                          <td>{m.ia3 ?? '—'}</td>
                          <td style={{ fontWeight: 700 }}>{m.total}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div
                                  className={`progress-fill ${m.pct >= 75 ? 'green' : m.pct >= 50 ? 'orange' : 'red'}`}
                                  style={{ width: `${m.pct}%` }}
                                />
                              </div>
                              <span style={{ fontSize: '0.85rem' }}>{m.pct}%</span>
                            </div>
                          </td>
                          <td><span className={`badge ${m.class}`}>{m.label}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
