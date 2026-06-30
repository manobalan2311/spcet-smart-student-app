import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FiBook, FiBarChart2, FiCalendar, FiCpu,
  FiFileText, FiZap, FiDollarSign, FiCheckSquare,
  FiBell, FiAward, FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';

// Demo data
const DEMO_STATS = [
  { label: 'Attendance', value: '78%',  color: 'orange', icon: <FiCalendar />, alert: true },
  { label: 'CGPA',       value: '8.4',  color: 'blue',   icon: <FiAward /> },
  { label: 'Subjects',   value: '6',    color: 'green',  icon: <FiBook /> },
  { label: 'Dues',       value: '₹0',   color: 'teal',   icon: <FiDollarSign /> },
];

const QUICK_LINKS = [
  { to: '/student/notes',           label: 'Subject Notes',   icon: <FiBook />,         color: '#1a237e' },
  { to: '/student/internal-marks',  label: 'Internal Marks',  icon: <FiBarChart2 />,    color: '#00695c' },
  { to: '/student/semester-marks',  label: 'Semester Marks',  icon: <FiAward />,        color: '#e65100' },
  { to: '/student/timetable',       label: 'Timetable',       icon: <FiCalendar />,     color: '#6a1b9a' },
  { to: '/student/ai-assistant',    label: 'AI Assistant',    icon: <FiCpu />,          color: '#01579b' },
  { to: '/student/resume',          label: 'Resume Builder',  icon: <FiFileText />,     color: '#2e7d32' },
  { to: '/student/skill-games',     label: 'Skill Games',     icon: <FiZap />,          color: '#ff6f00' },
  { to: '/student/fees',            label: 'Fees Payment',    icon: <FiDollarSign />,   color: '#880e4f' },
  { to: '/student/quiz',            label: 'Take Quiz',       icon: <FiCheckSquare />,  color: '#1565c0' },
  { to: '/student/notifications',   label: 'Notifications',   icon: <FiBell />,         color: '#4e342e' },
];

const RECENT_MARKS = [
  { subject: 'Data Structures',     ia1: 18, ia2: 17, ia3: 19 },
  { subject: 'Computer Networks',   ia1: 15, ia2: 16, ia3: 18 },
  { subject: 'Operating Systems',   ia1: 20, ia2: 18, ia3: 17 },
  { subject: 'DBMS',                ia1: 17, ia2: 19, ia3: 20 },
  { subject: 'Software Engineering',ia1: 16, ia2: 17, ia3: 18 },
];

const NOTIFICATIONS = [
  { id: 1, msg: 'IA3 schedule released – Check timetable', type: 'info', time: '2h ago' },
  { id: 2, msg: 'Fees due date extended to 30 June', type: 'warning', time: '1d ago' },
  { id: 3, msg: 'Semester marks uploaded for Sem 5', type: 'success', time: '2d ago' },
];

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <>
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Semester 6 | CSE Department
        </span>
      </div>

      <div className="page-body">
        {/* Welcome */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,#1a237e,#3949ab)', color: '#fff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ opacity: 0.85, marginTop: 4 }}>
            You have 3 new notifications and 2 upcoming quizzes this week.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/student/ai-assistant" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <FiCpu /> Ask AI Assistant
            </Link>
            <Link to="/student/quiz" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <FiCheckSquare /> Take Quiz
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {DEMO_STATS.map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={s.alert ? { color: 'var(--warning)' } : {}}>
                {s.value}
                {s.alert && <FiAlertCircle size={14} style={{ marginLeft: 6, color: 'var(--warning)' }} />}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
          {/* Quick links */}
          <div className="card">
            <div className="card-title">Quick Access</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {QUICK_LINKS.map((ql) => (
                <Link
                  key={ql.to}
                  to={ql.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: '#f5f7ff', fontSize: '0.85rem', fontWeight: 600,
                    color: ql.color, transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = ql.color; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f7ff'; e.currentTarget.style.color = ql.color; }}
                >
                  {ql.icon} {ql.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-title">Recent Notifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`alert alert-${n.type}`}>
                  <div style={{ flex: 1 }}>{n.msg}</div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7, whiteSpace: 'nowrap' }}>{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Internal marks table */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Internal Assessment Marks</span>
            <Link to="/student/internal-marks" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
              View All →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>IA 1 (20)</th>
                  <th>IA 2 (20)</th>
                  <th>IA 3 (20)</th>
                  <th>Total (60)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_MARKS.map((m) => {
                  const total = m.ia1 + m.ia2 + m.ia3;
                  const pct = (total / 60) * 100;
                  return (
                    <tr key={m.subject}>
                      <td style={{ fontWeight: 600 }}>{m.subject}</td>
                      <td>{m.ia1}</td>
                      <td>{m.ia2}</td>
                      <td>{m.ia3}</td>
                      <td style={{ fontWeight: 700 }}>{total}</td>
                      <td>
                        <span className={`badge ${pct >= 75 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                          {pct >= 75 ? 'Good' : pct >= 50 ? 'Average' : 'Low'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
