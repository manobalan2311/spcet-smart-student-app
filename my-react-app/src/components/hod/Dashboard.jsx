import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hodAPI } from '../../services/api';
import { FiUsers, FiCalendar, FiTrendingDown, FiBarChart2, FiAlertTriangle, FiCheckCircle, FiDownload } from 'react-icons/fi';

const STATS = [
  { label: 'Total Students',       value: 240, color: 'blue',   icon: <FiUsers /> },
  { label: 'Total Professors',     value: 12,  color: 'green',  icon: <FiUsers /> },
  { label: 'Low Attendance (<75%)',value: 18,  color: 'orange', icon: <FiTrendingDown /> },
  { label: 'Low Marks (<50%)',     value: 8,   color: 'red',    icon: <FiBarChart2 /> },
];

const ALERTS = [
  { msg: '18 students have attendance below 75%',  type: 'warning', link: '/hod/low-attendance' },
  { msg: '8 students scored below 50% in IA3',     type: 'danger',  link: '/hod/low-marks' },
  { msg: 'IA3 marks pending for 2 professors',     type: 'info',    link: '/hod/professors' },
  { msg: 'Semester 6 results ready for review',    type: 'success', link: '/hod/students' },
];

export default function HODDashboard() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleExportMarks = async () => {
    setExporting(true);
    setExportError('');
    try {
      const res = await hodAPI.getInternalMarksForExport();
      const rows = res.data || [];
      if (rows.length === 0) {
        setExportError('No saved internal marks to export yet.');
        return;
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        scope: 'all-departments',
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
      link.download = `internal-marks-all-${stamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Failed to export marks. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>HOD Dashboard</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dept. of Computer Science &amp; Engineering</span>
      </div>

      <div className="page-body">
        {exportError && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <FiAlertTriangle /> {exportError}
          </div>
        )}
        {/* Welcome */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,#4527a0,#6a1b9a)', color: '#fff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Welcome, {user?.name} 📊</h2>
          <p style={{ opacity: 0.85, marginTop: 4 }}>You have 2 urgent alerts requiring attention today.</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/hod/low-attendance" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <FiTrendingDown /> Low Attendance
            </Link>
            <Link to="/hod/low-marks" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <FiBarChart2 /> Low Marks
            </Link>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleExportMarks}
              disabled={exporting}
              title="Download all saved internal marks as a JSON file"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              {exporting ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 3 }} /> : <><FiDownload /> Export Marks (JSON)</>}
            </button>
          </div>
        </div>

        <div className="stats-grid">{STATS.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}</div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Alerts */}
          <div className="card">
            <div className="card-title"><FiAlertTriangle style={{ marginRight: 6 }} />Alerts &amp; Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALERTS.map((a, i) => (
                <Link
                  key={i}
                  to={a.link}
                  className={`alert alert-${a.type}`}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  {a.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
                  {a.msg}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick navigation */}
          <div className="card">
            <div className="card-title">Quick Access</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { to: '/hod/students',     label: 'Student Management', icon: <FiUsers />,    color: '#1a237e' },
                { to: '/hod/professors',   label: 'Professor Panel',    icon: <FiUsers />,    color: '#00695c' },
                { to: '/hod/attendance',   label: 'Attendance Mgmt',    icon: <FiCalendar />, color: '#e65100' },
                { to: '/hod/low-marks',    label: 'Low Marks Students', icon: <FiBarChart2 />,color: '#c62828' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px', borderRadius: 8,
                    background: '#f5f7ff', fontSize: '0.85rem', fontWeight: 600,
                    color: l.color, border: '2px solid transparent', transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = l.color; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f7ff'; e.currentTarget.style.color = l.color; }}
                >
                  {l.icon} {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
