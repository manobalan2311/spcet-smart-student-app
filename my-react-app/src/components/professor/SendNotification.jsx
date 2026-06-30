import { useState } from 'react';
import { FiBell, FiSend, FiCheckCircle, FiUsers, FiUser } from 'react-icons/fi';

const RECIPIENT_OPTIONS = [
  { value: 'all',     label: 'All Students (Department)',  icon: <FiUsers /> },
  { value: 'section', label: 'Specific Section',           icon: <FiUsers /> },
  { value: 'student', label: 'Individual Student',         icon: <FiUser /> },
];
const SECTIONS = ['Section A', 'Section B'];

const STUDENTS = [
  { rollNo: 'CS21001', name: 'Arun Kumar' },
  { rollNo: 'CS21002', name: 'Priya M' },
  { rollNo: 'CS21003', name: 'Karthik V' },
  { rollNo: 'CS21004', name: 'Deepa S' },
];

const SENT_HISTORY = [
  { id: 1, title: 'IA3 Schedule', to: 'All Students', time: '2024-06-14 10:00', type: 'info' },
  { id: 2, title: 'Attendance Warning', to: 'CS21003 – Karthik V', time: '2024-06-10 09:00', type: 'warning' },
  { id: 3, title: 'Assignment Deadline', to: 'Section A', time: '2024-06-05 14:00', type: 'info' },
];

export default function SendNotification() {
  const [recipientType, setRecipientType] = useState('all');
  const [section, setSection]   = useState(SECTIONS[0]);
  const [student, setStudent]   = useState(STUDENTS[0].rollNo);
  const [title, setTitle]       = useState('');
  const [message, setMessage]   = useState('');
  const [type, setType]         = useState('info');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    // API: professorAPI.sendNotification({ recipientType, section, student, title, message, type })
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setSending(false);
    setTitle('');
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <>
      <div className="page-header">
        <h1><FiBell style={{ marginRight: 8 }} />Send Notification</h1>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ gap: 20, alignItems: 'flex-start' }}>
          {/* Compose */}
          <div className="card">
            <div className="card-title">Compose Notification</div>

            {sent && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                <FiCheckCircle /> Notification sent successfully!
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Send To</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RECIPIENT_OPTIONS.map((opt) => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, border: `2px solid ${recipientType === opt.value ? 'var(--primary)' : 'var(--border)'}`, background: recipientType === opt.value ? '#f0f4ff' : '#fafafa' }}>
                    <input type="radio" value={opt.value} checked={recipientType === opt.value} onChange={() => setRecipientType(opt.value)} style={{ accentColor: 'var(--primary)' }} />
                    {opt.icon} {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {recipientType === 'section' && (
              <div className="form-group">
                <label className="form-label">Select Section</label>
                <select className="form-control" value={section} onChange={(e) => setSection(e.target.value)}>
                  {SECTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            {recipientType === 'student' && (
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select className="form-control" value={student} onChange={(e) => setStudent(e.target.value)}>
                  {STUDENTS.map((s) => <option key={s.rollNo} value={s.rollNo}>{s.rollNo} – {s.name}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notification Type</label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="info">Information</option>
                <option value="warning">Warning</option>
                <option value="success">Achievement / Good News</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" placeholder="Notification title…" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={4} placeholder="Type your message…" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
            >
              {sending ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 3 }} /> : <><FiSend /> Send Notification</>}
            </button>
          </div>

          {/* Sent history */}
          <div className="card">
            <div className="card-title">Sent History</div>
            {SENT_HISTORY.map((h) => (
              <div key={h.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{h.title}</strong>
                  <span className={`badge ${h.type === 'info' ? 'badge-info' : h.type === 'warning' ? 'badge-warning' : 'badge-success'}`}>{h.type}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  To: {h.to} · {h.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
