import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiBarChart2, FiBell, FiBook, FiAward, FiCheckCircle } from 'react-icons/fi';

const DEMO_STATS = [
  { label: 'Total Students', value: 120, color: 'blue',  icon: <FiUsers /> },
  { label: 'Subjects',       value: 3,   color: 'green', icon: <FiBook /> },
  { label: 'Marks Pending',  value: 12,  color: 'orange',icon: <FiBarChart2 /> },
  { label: 'Notifications',  value: 4,   color: 'teal',  icon: <FiBell /> },
];

const RECENT_ACTIVITY = [
  { text: 'IA3 marks added for DS – Section A', time: '1h ago',  icon: <FiBarChart2 />, color: '#1a237e' },
  { text: 'Notification sent to all CS-6A students', time: '3h ago',  icon: <FiBell />,    color: '#e65100' },
  { text: 'Semester marks submitted for Sem 5', time: '1d ago',  icon: <FiAward />,   color: '#2e7d32' },
  { text: 'Attendance updated for CS-6B', time: '2d ago',  icon: <FiCheckCircle />, color: '#01579b' },
];

const SUBJECTS = [
  { name: 'Data Structures & Algorithms', code: 'CS601', sections: ['A', 'B'], students: 80 },
  { name: 'Computer Networks',             code: 'CS602', sections: ['A'],      students: 40 },
  { name: 'DBMS',                          code: 'CS604', sections: ['B'],      students: 40 },
];

export default function ProfessorDashboard() {
  const { user } = useAuth();

  return (
    <>
      <div className="page-header">
        <h1>Professor Dashboard</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Department of CSE</span>
      </div>

      <div className="page-body">
        {/* Welcome */}
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg,#00695c,#00897b)', color: '#fff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Welcome, {user?.name} 👨‍🏫</h2>
          <p style={{ opacity: 0.85, marginTop: 4 }}>You have pending marks to update for 12 students.</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <Link to="/professor/internal-marks" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              Add Internal Marks
            </Link>
            <Link to="/professor/notifications" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
              Send Notification
            </Link>
          </div>
        </div>

        <div className="stats-grid">{DEMO_STATS.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}</div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Assigned subjects */}
          <div className="card">
            <div className="card-title">Assigned Subjects</div>
            {SUBJECTS.map((s) => (
              <div key={s.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {s.code} · Sections: {s.sections.join(', ')}
                  </div>
                </div>
                <span className="badge badge-primary">{s.students} students</span>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="card">
            <div className="card-title">Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color + '20', color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{a.text}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
