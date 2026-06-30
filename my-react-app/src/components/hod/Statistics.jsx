import { useEffect, useState } from 'react';
import {
  FiAward, FiTrendingDown, FiTrendingUp, FiBarChart2,
  FiAlertCircle, FiUsers, FiCheckCircle, FiPercent,
} from 'react-icons/fi';
import { hodAPI } from '../../services/api';

const TABS = [
  { key: 'highMarks',      label: 'High Marks',      icon: <FiAward />,        metric: 'cgpa',       color: 'green' },
  { key: 'lowMarks',       label: 'Low Marks',       icon: <FiBarChart2 />,    metric: 'cgpa',       color: 'red' },
  { key: 'highAttendance', label: 'High Attendance', icon: <FiTrendingUp />,   metric: 'attendance', color: 'blue' },
  { key: 'lowAttendance',  label: 'Low Attendance',  icon: <FiTrendingDown />, metric: 'attendance', color: 'orange' },
];

export default function Statistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('highMarks');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await hodAPI.getPerformanceStats();
        if (!active) return;
        setData(res.data);
        setError('');
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'Failed to load statistics.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const activeTab = TABS.find((t) => t.key === tab);
  const list = data ? data[tab] : [];
  const isMarks = activeTab?.metric === 'cgpa';

  return (
    <>
      <div className="page-header">
        <h1><FiBarChart2 style={{ marginRight: 8 }} />Performance Statistics</h1>
        {data && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {data.summary.totalStudents} students
          </span>
        )}
      </div>

      <div className="page-body">
        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Loading statistics…
          </div>
        )}

        {!loading && error && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--danger)' }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Summary cards */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon"><FiUsers /></div>
                <div className="stat-value">{data.summary.totalStudents}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon"><FiCheckCircle /></div>
                <div className="stat-value">{data.summary.avgCgpa}</div>
                <div className="stat-label">Average CGPA</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon"><FiPercent /></div>
                <div className="stat-value">{data.summary.avgAttendance}%</div>
                <div className="stat-label">Average Attendance</div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon"><FiAward /></div>
                <div className="stat-value">{data.summary.highMarks}</div>
                <div className="stat-label">High Marks (CGPA ≥ 8.5)</div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon"><FiBarChart2 /></div>
                <div className="stat-value">{data.summary.lowMarks}</div>
                <div className="stat-label">Low Marks (CGPA &lt; 7.0)</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon"><FiTrendingUp /></div>
                <div className="stat-value">{data.summary.highAttendance}</div>
                <div className="stat-label">High Attendance (≥ 90%)</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon"><FiTrendingDown /></div>
                <div className="stat-value">{data.summary.lowAttendance}</div>
                <div className="stat-label">Low Attendance (&lt; 75%)</div>
              </div>
            </div>

            {/* Category tabs */}
            <div className="tabs" style={{ marginTop: 24 }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.icon} {t.label} ({data[t.key].length})
                </button>
              ))}
            </div>

            <div className="card">
              <div className="card-title">{activeTab.label} Students</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Register No</th>
                      <th>Name</th>
                      <th>Semester</th>
                      <th>Section</th>
                      <th>{isMarks ? 'CGPA' : 'Attendance %'}</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                          No students in this category.
                        </td>
                      </tr>
                    ) : (
                      list.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                          <td>{s.name}</td>
                          <td>{s.semester}</td>
                          <td>{s.section}</td>
                          <td>
                            {isMarks ? (
                              <span className={`badge ${s.cgpa >= 8.5 ? 'badge-success' : s.cgpa >= 7 ? 'badge-info' : 'badge-danger'}`}>
                                {s.cgpa}
                              </span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="progress-bar" style={{ width: 70 }}>
                                  <span
                                    className={`progress-fill ${s.attendance >= 90 ? 'green' : s.attendance >= 75 ? 'blue' : s.attendance >= 65 ? 'orange' : 'red'}`}
                                    style={{ width: `${s.attendance}%` }}
                                  />
                                </span>
                                <span style={{ fontWeight: 700 }}>{s.attendance}%</span>
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{s.phone || '—'}</td>
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
