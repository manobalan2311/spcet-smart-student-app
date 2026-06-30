import { useState } from 'react';
import { FiCalendar, FiSave, FiCheckCircle, FiSearch } from 'react-icons/fi';

const SUBJECTS  = ['CS601 – Data Structures', 'CS602 – Computer Networks', 'CS603 – OS', 'CS604 – DBMS'];
const SECTIONS  = ['Section A', 'Section B'];
const STUDENTS  = [
  { rollNo: '112723104018', name: 'Manobalan' },
  { rollNo: '112723104019', name: 'Priya M' },
  { rollNo: '112723104020', name: 'Karthik V' },
  { rollNo: '112723104021', name: 'Deepa S' },
  { rollNo: '112723104022', name: 'Raj K' },
  { rollNo: '112723104023', name: 'Meena P' },
];

const ATTENDANCE_SUMMARY = [
  { rollNo: 'CS21001', name: 'Manobalan',  total: 60, present: 47, pct: 78 },
  { rollNo: 'CS21002', name: 'Priya M',     total: 60, present: 55, pct: 92 },
  { rollNo: 'CS21003', name: 'Karthik V',   total: 60, present: 41, pct: 68 },
  { rollNo: 'CS21004', name: 'Deepa S',     total: 60, present: 51, pct: 85 },
  { rollNo: 'CS21005', name: 'Raj K',       total: 60, present: 42, pct: 70 },
  { rollNo: 'CS21006', name: 'Meena P',     total: 60, present: 43, pct: 72 },
];

export default function AttendanceManagement() {
  const [tab, setTab]         = useState('summary');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [section, setSection] = useState(SECTIONS[0]);
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAtt]  = useState({});
  const [saved, setSaved]     = useState(false);
  const [search, setSearch]   = useState('');

  const toggleAtt = (rollNo) =>
    setAtt((a) => ({ ...a, [rollNo]: !a[rollNo] }));

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const filtered = ATTENDANCE_SUMMARY.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1><FiCalendar style={{ marginRight: 8 }} />Attendance Management</h1>
      </div>

      <div className="page-body">
        <div className="tabs">
          {['summary', 'mark'].map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'summary' ? 'Attendance Summary' : 'Mark Attendance'}
            </button>
          ))}
        </div>

        {tab === 'summary' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>Overall Attendance Summary</div>
              <div style={{ position: 'relative', width: 220 }}>
                <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
                <input className="form-control" style={{ paddingLeft: 34 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Roll No</th><th>Name</th><th>Total Classes</th><th>Present</th><th>Attendance %</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.rollNo}>
                      <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>{s.total}</td>
                      <td>{s.present}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 70 }}>
                            <div className={`progress-fill ${s.pct >= 75 ? 'green' : s.pct >= 60 ? 'orange' : 'red'}`} style={{ width: `${s.pct}%` }} />
                          </div>
                          <span style={{ fontWeight: s.pct < 75 ? 700 : 400, color: s.pct < 75 ? 'var(--danger)' : undefined }}>
                            {s.pct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${s.pct >= 75 ? 'badge-success' : s.pct >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                          {s.pct >= 75 ? 'Regular' : s.pct >= 60 ? 'Warning' : 'Critical'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'mark' && (
          <div className="card">
            {saved && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                <FiCheckCircle /> Attendance saved successfully!
              </div>
            )}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <select className="form-control" value={section} onChange={(e) => setSection(e.target.value)}>
                  {SECTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {STUDENTS.map((s) => {
                const isPresent = attendance[s.rollNo] ?? false;
                return (
                  <div
                    key={s.rollNo}
                    onClick={() => toggleAtt(s.rollNo)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                      border: `2px solid ${isPresent ? '#a5d6a7' : '#ef9a9a'}`,
                      background: isPresent ? '#e8f5e9' : '#ffebee',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{s.rollNo} – {s.name}</span>
                    <span className={`badge ${isPresent ? 'badge-success' : 'badge-danger'}`}>
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button className="btn btn-primary" onClick={handleSave}>
              <FiSave /> Save Attendance
            </button>
          </div>
        )}
      </div>
    </>
  );
}
