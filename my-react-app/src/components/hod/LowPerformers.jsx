import { FiTrendingDown, FiAlertTriangle, FiBell } from 'react-icons/fi';
import { useState } from 'react';

const LOW_ATTENDANCE = [
  { rollNo: 'CS21003', name: 'Karthik V',  sem: 6, section: 'B', attendance: 68, phone: '9234567892' },
  { rollNo: 'CS21005', name: 'Raj K',      sem: 6, section: 'A', attendance: 70, phone: '9456789014' },
  { rollNo: 'CS21006', name: 'Meena P',    sem: 6, section: 'A', attendance: 72, phone: '9567890125' },
  { rollNo: 'CS21009', name: 'Vignesh A',  sem: 4, section: 'B', attendance: 65, phone: '9112233445' },
  { rollNo: 'CS21010', name: 'Saranya B',  sem: 4, section: 'A', attendance: 60, phone: '9223344556' },
];

const LOW_MARKS = [
  { rollNo: 'CS21003', name: 'Karthik V',  sem: 6, section: 'B', cgpa: 6.8, lowestSubject: 'Computer Networks' },
  { rollNo: 'CS21011', name: 'Mani C',     sem: 6, section: 'A', cgpa: 5.9, lowestSubject: 'OS' },
  { rollNo: 'CS21012', name: 'Bala R',     sem: 4, section: 'B', cgpa: 6.2, lowestSubject: 'Data Structures' },
  { rollNo: 'CS21013', name: 'Chitra D',   sem: 4, section: 'A', cgpa: 7.1, lowestSubject: 'DBMS' },
];

export default function LowPerformers() {
  const [notified, setNotified] = useState({});
  const [tab, setTab]           = useState('attendance');

  const sendNotif = (rollNo) => {
    setNotified((n) => ({ ...n, [rollNo]: true }));
    // API: professorAPI.sendNotification({ recipientType: 'student', rollNo })
  };

  const list = tab === 'attendance' ? LOW_ATTENDANCE : LOW_MARKS;
  const isMark = tab === 'marks';

  return (
    <>
      <div className="page-header">
        <h1>
          {tab === 'attendance'
            ? <><FiTrendingDown style={{ marginRight: 8 }} />Low Attendance Students</>
            : <><FiAlertTriangle style={{ marginRight: 8 }} />Low Marks Students</>}
        </h1>
      </div>

      <div className="page-body">
        <div className="tabs">
          <button className={`tab-btn ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
            Low Attendance (&lt;75%)
          </button>
          <button className={`tab-btn ${tab === 'marks' ? 'active' : ''}`} onClick={() => setTab('marks')}>
            Low Marks (CGPA &lt;7.5)
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            {tab === 'attendance'
              ? `${LOW_ATTENDANCE.length} students below 75% attendance`
              : `${LOW_MARKS.length} students with low academic performance`}
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Sem</th>
                  <th>Section</th>
                  {!isMark && <th>Attendance %</th>}
                  {isMark  && <th>CGPA</th>}
                  {isMark  && <th>Weakest Subject</th>}
                  {!isMark && <th>Phone</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.rollNo}>
                    <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                    <td>{s.name}</td>
                    <td>{s.sem}</td>
                    <td>{s.section}</td>
                    {!isMark && (
                      <td>
                        <span style={{ fontWeight: 700, color: s.attendance < 65 ? 'var(--danger)' : 'var(--warning)' }}>
                          {s.attendance}%
                        </span>
                      </td>
                    )}
                    {isMark && (
                      <>
                        <td><span style={{ fontWeight: 700, color: s.cgpa < 6.5 ? 'var(--danger)' : 'var(--warning)' }}>{s.cgpa}</span></td>
                        <td>{s.lowestSubject}</td>
                      </>
                    )}
                    {!isMark && <td style={{ fontSize: '0.85rem' }}>{s.phone}</td>}
                    <td>
                      {notified[s.rollNo] ? (
                        <span className="badge badge-success">Notified</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => sendNotif(s.rollNo)}>
                          <FiBell size={12} /> Notify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
