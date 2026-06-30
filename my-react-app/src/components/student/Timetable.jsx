const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PERIODS = [
  '8:00 – 8:55',
  '8:55 – 9:50',
  '9:50 – 10:00 (Break)',
  '10:00 – 10:55',
  '10:55 – 11:50',
  '11:50 – 12:45',
  '12:45 – 1:30 (Lunch)',
  '1:30 – 2:25',
  '2:25 – 3:20',
  '3:20 – 4:15',
];

const TIMETABLE = {
  Monday:    ['DS Lab', 'DS Lab', null, 'CN', 'OS', 'DBMS', null, 'SE', 'WT', 'Free'],
  Tuesday:   ['CN', 'OS', null, 'DS', 'DBMS', 'SE', null, 'WT', 'CN Lab', 'CN Lab'],
  Wednesday: ['OS', 'DS', null, 'SE', 'WT', 'CN', null, 'DBMS', 'OS Lab', 'OS Lab'],
  Thursday:  ['DBMS', 'SE', null, 'WT', 'DS', 'OS', null, 'CN', 'Free', 'DBMS Lab'],
  Friday:    ['SE', 'WT', null, 'CN', 'DS', 'OS', null, 'DBMS', 'SE Lab', 'SE Lab'],
  Saturday:  ['WT', 'CN', null, 'DS', 'DBMS', 'Free', null, 'Sports', 'Sports', 'Free'],
};

const COLOR_MAP = {
  DS: '#1a237e', CN: '#006064', OS: '#4a148c',
  DBMS: '#e65100', SE: '#1b5e20', WT: '#880e4f',
  'DS Lab': '#283593', 'CN Lab': '#00838f', 'OS Lab': '#6a1b9a',
  'DBMS Lab': '#bf360c', 'SE Lab': '#2e7d32',
  Sports: '#827717', Free: '#eeeeee',
};

const TEXT_MAP = {
  Sports: '#555', Free: '#bdbdbd',
};

export default function Timetable() {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });

  return (
    <>
      <div className="page-header">
        <h1>Timetable – Semester 6</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Today: <strong>{today}</strong>
        </span>
      </div>

      <div className="page-body">
        {/* Legend */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Subject Codes</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries({ DS: 'Data Structures', CN: 'Computer Networks', OS: 'Operating Systems', DBMS: 'Database Mgmt', SE: 'Software Engg', WT: 'Web Technologies' }).map(([code, name]) => (
              <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: COLOR_MAP[code] }} />
                <strong>{code}</strong> – {name}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ background: 'var(--primary)', color: '#fff', padding: '10px 12px', textAlign: 'left', minWidth: 120 }}>Period / Time</th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      style={{
                        background: d === today ? '#ff6f00' : 'var(--primary)',
                        color: '#fff', padding: '10px 12px', textAlign: 'center', minWidth: 90,
                        fontWeight: d === today ? 800 : 600,
                      }}
                    >
                      {d.substring(0, 3)}
                      {d === today && ' ★'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pIdx) => {
                  const isBreak = period.includes('Break') || period.includes('Lunch');
                  return (
                    <tr key={period} style={{ background: isBreak ? '#f9f9f9' : undefined }}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: isBreak ? 600 : 400, color: isBreak ? 'var(--text-secondary)' : undefined, fontSize: isBreak ? '0.78rem' : undefined }}>
                        {period}
                      </td>
                      {DAYS.map((day) => {
                        const cell = TIMETABLE[day][pIdx];
                        if (isBreak) return <td key={day} style={{ borderBottom: '1px solid var(--border)', textAlign: 'center', color: '#bdbdbd', fontSize: '0.78rem' }}>—</td>;
                        const bg = cell ? COLOR_MAP[cell] || '#e8eaf6' : '#fafafa';
                        const color = cell ? (TEXT_MAP[cell] || '#fff') : '#ccc';
                        return (
                          <td
                            key={day}
                            style={{
                              padding: '8px 10px', borderBottom: '1px solid var(--border)',
                              textAlign: 'center',
                            }}
                          >
                            {cell && (
                              <div
                                style={{
                                  background: bg, color, borderRadius: 6,
                                  padding: '4px 6px', fontWeight: 700,
                                  fontSize: '0.8rem',
                                }}
                              >
                                {cell}
                              </div>
                            )}
                          </td>
                        );
                      })}
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
