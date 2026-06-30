import { useState } from 'react';
import { FiBell, FiCheck, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const DEMO_NOTIFICATIONS = [
  { id: 1, title: 'IA3 Schedule Released', message: 'Internal Assessment 3 will be conducted from July 10–14. Check your timetable.', type: 'info', time: '2024-06-14 10:00', read: false, from: 'Prof. Ramesh V (HOD)' },
  { id: 2, title: 'Semester Marks Published', message: 'Your Semester 5 marks have been published. Log in to view your result.', type: 'success', time: '2024-06-12 14:30', read: false, from: 'Examination Cell' },
  { id: 3, title: 'Attendance Warning', message: 'Your attendance in Computer Networks is below 75%. Please attend classes regularly.', type: 'warning', time: '2024-06-10 09:00', read: true, from: 'Prof. Ramesh V' },
  { id: 4, title: 'Fee Reminder', message: 'Laboratory fee of ₹3000 is due on June 30. Please pay before the deadline.', type: 'warning', time: '2024-06-08 11:00', read: true, from: 'Accounts Department' },
  { id: 5, title: 'Holiday Notice', message: 'College will remain closed on June 17 on account of a public holiday.', type: 'info', time: '2024-06-07 16:00', read: true, from: 'College Office' },
];

const TYPE_META = {
  info:    { icon: <FiInfo />,          color: '#01579b', bg: '#e1f5fe', border: '#81d4fa' },
  success: { icon: <FiCheckCircle />,   color: '#1b5e20', bg: '#e8f5e9', border: '#a5d6a7' },
  warning: { icon: <FiAlertTriangle />, color: '#e65100', bg: '#fff8e1', border: '#ffe082' },
};

export default function StudentNotifications() {
  const [notifs, setNotifs] = useState(DEMO_NOTIFICATIONS);

  const markRead = (id) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <>
      <div className="page-header">
        <h1>
          <FiBell style={{ marginRight: 8 }} />Notifications
          {unread > 0 && (
            <span style={{ marginLeft: 10, background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
              {unread} new
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>
            <FiCheck /> Mark all read
          </button>
        )}
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {notifs.map((n) => {
            const meta = TYPE_META[n.type];
            return (
              <div
                key={n.id}
                style={{
                  background: n.read ? '#fff' : meta.bg,
                  border: `1.5px solid ${n.read ? 'var(--border)' : meta.border}`,
                  borderRadius: 12, padding: '16px 20px',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '1.4rem', color: meta.color, marginTop: 2, flexShrink: 0 }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontWeight: n.read ? 600 : 800, fontSize: '0.98rem', color: n.read ? 'var(--text)' : meta.color }}>
                      {n.title}
                      {!n.read && <span style={{ marginLeft: 8, width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginLeft: 12 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{n.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>From: {n.from}</span>
                    {!n.read && (
                      <button className="btn btn-outline btn-sm" onClick={() => markRead(n.id)}>
                        <FiCheck size={12} /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {notifs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              No notifications yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
