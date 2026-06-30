import { useState } from 'react';
import { FiCheckSquare, FiClock, FiAward, FiRefreshCw } from 'react-icons/fi';

const SUBJECT_QUIZZES = {
  'Data Structures': [
    { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1 },
    { q: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Tree', 'Graph'], answer: 1 },
    { q: 'What is the worst-case complexity of Quick Sort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 2 },
    { q: 'Which traversal visits root first?', options: ['Inorder', 'Postorder', 'Preorder', 'Level-order'], answer: 2 },
    { q: 'An AVL tree is a:', options: ['Heap', 'Self-balancing BST', 'Trie', 'B-Tree'], answer: 1 },
  ],
  'Computer Networks': [
    { q: 'How many layers does the OSI model have?', options: ['5', '6', '7', '4'], answer: 2 },
    { q: 'TCP belongs to which layer?', options: ['Network', 'Transport', 'Session', 'Data Link'], answer: 1 },
    { q: 'Which protocol assigns IP addresses dynamically?', options: ['DNS', 'ARP', 'DHCP', 'SMTP'], answer: 2 },
    { q: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'Host Transfer Protocol', 'High Transfer Protocol', 'Hyper Transfer Port'], answer: 0 },
    { q: 'Port number of HTTPS:', options: ['80', '443', '21', '25'], answer: 1 },
  ],
  'Operating Systems': [
    { q: 'What is a deadlock?', options: ['A bug in code', 'A state where processes are blocked forever', 'A memory leak', 'An infinite loop'], answer: 1 },
    { q: 'Which scheduling algorithm is preemptive?', options: ['FCFS', 'SJF', 'Round Robin', 'Priority (non-preemptive)'], answer: 2 },
    { q: 'Paging eliminates:', options: ['Internal Fragmentation', 'External Fragmentation', 'Both', 'Neither'], answer: 1 },
    { q: 'Which is NOT a CPU scheduling criterion?', options: ['CPU utilization', 'Throughput', 'Memory size', 'Waiting time'], answer: 2 },
    { q: 'Semaphore is used for:', options: ['Memory allocation', 'Process synchronization', 'File management', 'Scheduling'], answer: 1 },
  ],
};

const SUBJECTS = Object.keys(SUBJECT_QUIZZES);
const QUIZ_TIME = 15; // seconds per question

export default function Quiz() {
  const [subject, setSubject]     = useState(null);
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [finished, setFinished]   = useState(false);
  const [timeLeft, setTimeLeft]   = useState(QUIZ_TIME);
  const [timerRef, setTimerRef]   = useState(null);

  const startQuiz = (sub) => {
    setSubject(sub);
    setQIndex(0);
    setAnswers([]);
    setSelected(null);
    setFinished(false);
    startTimer();
  };

  const startTimer = () => {
    setTimeLeft(QUIZ_TIME);
    const ref = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(ref); handleNext(null); return QUIZ_TIME; }
        return t - 1;
      });
    }, 1000);
    setTimerRef(ref);
  };

  const handleSelect = (i) => { if (selected === null) setSelected(i); };

  const handleNext = (sel) => {
    clearInterval(timerRef);
    const q = SUBJECT_QUIZZES[subject][qIndex];
    const ans = sel ?? selected;
    const newAnswers = [...answers, { question: q.q, selected: ans, correct: q.answer }];
    setAnswers(newAnswers);
    setSelected(null);

    if (qIndex + 1 >= SUBJECT_QUIZZES[subject].length) {
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      startTimer();
    }
  };

  const score = answers.filter((a) => a.selected === a.correct).length;
  const total  = subject ? SUBJECT_QUIZZES[subject].length : 0;
  const pct    = total > 0 ? Math.round((score / total) * 100) : 0;

  if (!subject) {
    return (
      <>
        <div className="page-header"><h1><FiCheckSquare style={{ marginRight: 8 }} />Subject Quiz</h1></div>
        <div className="page-body">
          <div className="grid-auto">
            {SUBJECTS.map((s) => (
              <div
                key={s}
                className="card"
                style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
                onClick={() => startQuiz(s)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div>
                <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>{s}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {SUBJECT_QUIZZES[s].length} Questions · {QUIZ_TIME}s each
                </p>
                <button className="btn btn-primary btn-full" style={{ marginTop: 16 }}>Start Quiz</button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (finished) {
    return (
      <>
        <div className="page-header"><h1>Quiz Results – {subject}</h1></div>
        <div className="page-body">
          <div className="card" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>
              {pct >= 80 ? '🏆' : pct >= 60 ? '😊' : '📚'}
            </div>
            <h2 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
              You scored {score} / {total}
            </h2>
            <div style={{ margin: '16px 0' }}>
              <div className="progress-bar" style={{ height: 14 }}>
                <div className={`progress-fill ${pct >= 75 ? 'green' : pct >= 50 ? 'orange' : 'red'}`} style={{ width: `${pct}%` }} />
              </div>
              <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{pct}% correct</p>
            </div>

            {/* Answer review */}
            <div style={{ textAlign: 'left', marginTop: 20 }}>
              {answers.map((a, i) => (
                <div key={i} style={{ marginBottom: 14, padding: '12px 16px', borderRadius: 10, background: a.selected === a.correct ? '#e8f5e9' : '#ffebee', border: `1px solid ${a.selected === a.correct ? '#a5d6a7' : '#ef9a9a'}` }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{i + 1}. {a.question}</div>
                  <div style={{ fontSize: '0.88rem' }}>
                    Your answer: <strong>{SUBJECT_QUIZZES[subject][i].options[a.selected] ?? 'Skipped (time out)'}</strong>
                    {a.selected !== a.correct && (
                      <span style={{ marginLeft: 10, color: 'var(--success)' }}>
                        Correct: {SUBJECT_QUIZZES[subject][i].options[a.correct]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <button className="btn btn-primary" onClick={() => startQuiz(subject)}><FiRefreshCw /> Retake</button>
              <button className="btn btn-outline" onClick={() => setSubject(null)}>Choose Subject</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const q = SUBJECT_QUIZZES[subject][qIndex];
  const timePct = (timeLeft / QUIZ_TIME) * 100;

  return (
    <>
      <div className="page-header">
        <h1>Quiz – {subject}</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Q {qIndex + 1} / {total}
        </span>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Timer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Question {qIndex + 1} of {total}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: timeLeft <= 5 ? 'var(--danger)' : 'var(--primary)' }}>
              <FiClock /> {timeLeft}s
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 20 }}>
            <div className={`progress-fill ${timePct > 60 ? 'green' : timePct > 30 ? 'orange' : 'red'}`} style={{ width: `${timePct}%` }} />
          </div>

          <h2 style={{ fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>{q.q}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, i) => {
              let bg = '#f5f7ff';
              let border = 'var(--border)';
              let color = 'var(--text)';
              if (selected !== null) {
                if (i === q.answer) { bg = '#e8f5e9'; border = '#4caf50'; color = '#1b5e20'; }
                else if (i === selected) { bg = '#ffebee'; border = '#ef5350'; color = '#b71c1c'; }
              } else if (selected === i) {
                bg = '#e8eaf6'; border = 'var(--primary)'; color = 'var(--primary)';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  style={{ padding: '14px 18px', borderRadius: 10, border: `2px solid ${border}`, background: bg, color, fontWeight: selected !== null ? 600 : 400, textAlign: 'left', fontSize: '0.95rem', transition: 'all 0.15s', cursor: selected !== null ? 'default' : 'pointer' }}
                >
                  <span style={{ fontWeight: 700, marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-primary btn-full"
            style={{ marginTop: 24 }}
            disabled={selected === null}
            onClick={() => handleNext(selected)}
          >
            {qIndex + 1 < total ? 'Next Question →' : 'Finish Quiz'}
          </button>
        </div>
      </div>
    </>
  );
}
