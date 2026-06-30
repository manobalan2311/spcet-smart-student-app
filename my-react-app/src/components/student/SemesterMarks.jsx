const SEMESTERS = [
  {
    sem: 5,
    marks: [
      { subject: 'Computer Architecture', internal: 52, external: 71, total: 123, max: 150 },
      { subject: 'Theory of Computation', internal: 48, external: 68, total: 116, max: 150 },
      { subject: 'Compiler Design',        internal: 55, external: 75, total: 130, max: 150 },
      { subject: 'Computer Graphics',      internal: 50, external: 65, total: 115, max: 150 },
      { subject: 'Microprocessors',        internal: 45, external: 60, total: 105, max: 150 },
    ],
    result: 'PASSED',
    sgpa: 8.2,
  },
  {
    sem: 6,
    marks: [
      { subject: 'Data Structures',        internal: 54, external: null, total: null, max: 150 },
      { subject: 'Computer Networks',      internal: 49, external: null, total: null, max: 150 },
      { subject: 'Operating Systems',      internal: 55, external: null, total: null, max: 150 },
      { subject: 'DBMS',                   internal: 56, external: null, total: null, max: 150 },
      { subject: 'Software Engineering',   internal: 51, external: null, total: null, max: 150 },
    ],
    result: 'IN PROGRESS',
    sgpa: null,
  },
];

function gradeFromTotal(pct) {
  if (pct >= 90) return { label: 'O',  class: 'badge-success' };
  if (pct >= 80) return { label: 'A+', class: 'badge-success' };
  if (pct >= 70) return { label: 'A',  class: 'badge-info' };
  if (pct >= 60) return { label: 'B+', class: 'badge-primary' };
  if (pct >= 50) return { label: 'B',  class: 'badge-warning' };
  return { label: 'C',  class: 'badge-danger' };
}

export default function SemesterMarks() {
  return (
    <>
      <div className="page-header">
        <h1>Semester Marks</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall CGPA: 8.4</span>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {SEMESTERS.map((sem) => (
            <div className="card" key={sem.sem}>
              <div
                className="card-title"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Semester {sem.sem}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {sem.sgpa && (
                    <span className="badge badge-primary">SGPA: {sem.sgpa}</span>
                  )}
                  <span className={`badge ${sem.result === 'PASSED' ? 'badge-success' : 'badge-warning'}`}>
                    {sem.result}
                  </span>
                </div>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Internal (/75)</th>
                      <th>External (/75)</th>
                      <th>Total (/150)</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.marks.map((m) => {
                      const pct = m.total ? Math.round((m.total / m.max) * 100) : null;
                      const g = pct ? gradeFromTotal(pct) : null;
                      return (
                        <tr key={m.subject}>
                          <td style={{ fontWeight: 600 }}>{m.subject}</td>
                          <td>{m.internal}</td>
                          <td>{m.external ?? <span className="badge badge-warning">Pending</span>}</td>
                          <td style={{ fontWeight: 700 }}>{m.total ?? '—'}</td>
                          <td>{pct ? `${pct}%` : '—'}</td>
                          <td>{g ? <span className={`badge ${g.class}`}>{g.label}</span> : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
