import { useState } from 'react';
import { FiSearch, FiDownload, FiBook } from 'react-icons/fi';

const SUBJECTS = [
  { id: 1, code: 'CS601', name: 'Data Structures & Algorithms' },
  { id: 2, code: 'CS602', name: 'Computer Networks' },
  { id: 3, code: 'CS603', name: 'Operating Systems' },
  { id: 4, code: 'CS604', name: 'Database Management Systems' },
  { id: 5, code: 'CS605', name: 'Software Engineering' },
  { id: 6, code: 'CS606', name: 'Web Technologies' },
];

const DEMO_NOTES = {
  1: [
    { id: 1, title: 'Unit 1 – Arrays & Linked Lists', uploadedBy: 'Dr. Priya S', date: '2024-01-10', size: '2.4 MB', type: 'PDF' },
    { id: 2, title: 'Unit 2 – Trees & Graphs',       uploadedBy: 'Dr. Priya S', date: '2024-01-20', size: '3.1 MB', type: 'PDF' },
    { id: 3, title: 'Unit 3 – Sorting Algorithms',   uploadedBy: 'Dr. Priya S', date: '2024-02-01', size: '1.8 MB', type: 'PDF' },
  ],
  2: [
    { id: 4, title: 'Unit 1 – OSI Model',             uploadedBy: 'Prof. Ramesh', date: '2024-01-12', size: '2.0 MB', type: 'PDF' },
    { id: 5, title: 'Unit 2 – TCP/IP Protocols',      uploadedBy: 'Prof. Ramesh', date: '2024-01-25', size: '2.7 MB', type: 'PDF' },
  ],
  3: [
    { id: 6, title: 'Unit 1 – Process Management',   uploadedBy: 'Dr. Kavitha', date: '2024-01-15', size: '3.5 MB', type: 'PDF' },
  ],
  4: [
    { id: 7, title: 'Unit 1 – ER Diagrams',           uploadedBy: 'Prof. Sathish', date: '2024-01-18', size: '2.2 MB', type: 'PDF' },
    { id: 8, title: 'Unit 2 – SQL Fundamentals',     uploadedBy: 'Prof. Sathish', date: '2024-02-05', size: '1.5 MB', type: 'PPTX' },
  ],
  5: [],
  6: [
    { id: 9, title: 'Unit 1 – HTML & CSS Basics',     uploadedBy: 'Prof. Deepa', date: '2024-01-22', size: '1.2 MB', type: 'PDF' },
  ],
};

export default function Notes() {
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [search, setSearch] = useState('');

  const notes = (DEMO_NOTES[selectedSubject.id] || []).filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1>Subject Notes</h1>
      </div>

      <div className="page-body">
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Subject list */}
          <div className="card" style={{ width: 220, flexShrink: 0 }}>
            <div className="card-title">Subjects</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubject(s); setSearch(''); }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: selectedSubject.id === s.id ? 'var(--primary)' : '#f5f7ff',
                    color: selectedSubject.id === s.id ? '#fff' : 'var(--text)',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: selectedSubject.id === s.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                >
                  <span style={{ display: 'block', fontSize: '0.72rem', opacity: 0.7 }}>{s.code}</span>
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notes list */}
          <div className="card" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                <FiBook style={{ marginRight: 6 }} />
                {selectedSubject.name}
              </div>
              <div style={{ position: 'relative', width: 240 }}>
                <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9e9e9e' }} />
                <input
                  className="form-control"
                  style={{ paddingLeft: 34 }}
                  placeholder="Search notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                No notes available for this subject yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', background: '#f8f9ff', borderRadius: 10,
                      border: '1.5px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{note.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {note.uploadedBy} &bull; {note.date} &bull; {note.size}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="badge badge-info">{note.type}</span>
                      <button
                        className="btn btn-primary btn-sm"
                        title="Download note"
                        aria-label={`Download ${note.title}`}
                      >
                        <FiDownload />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
