import { useState } from 'react';
import { FiZap, FiAward, FiClock, FiStar } from 'react-icons/fi';

const GAMES = [
  {
    id: 'sorting',
    title: 'Algorithm Sorter',
    description: 'Arrange the steps of Bubble Sort in the correct order.',
    category: 'Data Structures',
    difficulty: 'Easy',
    points: 100,
    icon: '🔢',
    color: '#1a237e',
  },
  {
    id: 'networking',
    title: 'Protocol Matcher',
    description: 'Match network protocols to their correct layer in the OSI model.',
    category: 'Computer Networks',
    difficulty: 'Medium',
    points: 150,
    icon: '🌐',
    color: '#006064',
  },
  {
    id: 'dbms',
    title: 'Query Builder',
    description: 'Drag and drop SQL clauses to form valid queries.',
    category: 'DBMS',
    difficulty: 'Medium',
    points: 150,
    icon: '🗄️',
    color: '#4a148c',
  },
  {
    id: 'os',
    title: 'Process Scheduler',
    description: 'Schedule processes using FCFS, SJF and Round Robin.',
    category: 'Operating Systems',
    difficulty: 'Hard',
    points: 200,
    icon: '⚙️',
    color: '#e65100',
  },
  {
    id: 'git',
    title: 'Git Flow Challenge',
    description: 'Solve git branching and merging scenarios.',
    category: 'Software Engineering',
    difficulty: 'Easy',
    points: 100,
    icon: '🌿',
    color: '#2e7d32',
  },
  {
    id: 'css',
    title: 'CSS Flexbox Froggy',
    description: 'Use CSS Flexbox properties to guide frogs to their lily pads.',
    category: 'Web Technologies',
    difficulty: 'Easy',
    points: 100,
    icon: '🐸',
    color: '#880e4f',
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Priya M',   points: 850, badge: '🥇' },
  { rank: 2, name: 'Raj K',     points: 720, badge: '🥈' },
  { rank: 3, name: 'Arun Kumar',points: 680, badge: '🥉' },
  { rank: 4, name: 'Deepa S',   points: 640, badge: '' },
  { rank: 5, name: 'Karthik V', points: 590, badge: '' },
];

// Simple demo mini-game for Algorithm Sorter
const SORT_STEPS_SCRAMBLED = [
  'Compare adjacent elements',
  'Swap if left > right',
  'Start from the first element',
  'Repeat until no swaps occur',
  'Move to next pair',
];
const SORT_STEPS_CORRECT = [
  'Start from the first element',
  'Compare adjacent elements',
  'Swap if left > right',
  'Move to next pair',
  'Repeat until no swaps occur',
];

export default function SkillGames() {
  const [activeGame, setActiveGame] = useState(null);
  const [sortSteps, setSortSteps]   = useState([...SORT_STEPS_SCRAMBLED]);
  const [dragIdx, setDragIdx]       = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const playGame = (game) => {
    setActiveGame(game);
    setGameResult(null);
    setSortSteps([...SORT_STEPS_SCRAMBLED].sort(() => Math.random() - 0.5));
  };

  const onDragStart = (i) => setDragIdx(i);
  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return;
    const arr = [...sortSteps];
    [arr[dragIdx], arr[i]] = [arr[i], arr[dragIdx]];
    setSortSteps(arr);
    setDragIdx(null);
  };

  const checkAnswer = () => {
    const correct = sortSteps.every((s, i) => s === SORT_STEPS_CORRECT[i]);
    setGameResult(correct ? 'correct' : 'wrong');
  };

  return (
    <>
      <div className="page-header">
        <h1><FiZap style={{ marginRight: 8 }} />Skill Games</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your Score: 680 pts</span>
      </div>

      <div className="page-body">
        {!activeGame ? (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Games grid */}
            <div style={{ flex: 1 }}>
              <div className="grid-auto">
                {GAMES.map((g) => (
                  <div
                    key={g.id}
                    className="card"
                    style={{ cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
                    onClick={() => playGame(g)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{g.icon}</div>
                    <h3 style={{ fontWeight: 700, color: g.color, marginBottom: 6 }}>{g.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{g.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${g.difficulty === 'Easy' ? 'badge-success' : g.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                        {g.difficulty}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: g.color, fontSize: '0.85rem' }}>
                        <FiStar /> {g.points} pts
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>{g.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="card" style={{ width: 220, flexShrink: 0 }}>
              <div className="card-title"><FiAward style={{ marginRight: 6 }} />Leaderboard</div>
              {LEADERBOARD.map((l) => (
                <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700, width: 24, textAlign: 'center' }}>{l.badge || l.rank}</span>
                  <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: l.name === 'Arun Kumar' ? 700 : 400, color: l.name === 'Arun Kumar' ? 'var(--primary)' : undefined }}>{l.name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>{l.points}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── In-game: Algorithm Sorter ── */
          <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, color: 'var(--primary)' }}>{activeGame.icon} {activeGame.title}</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setActiveGame(null)}>← Back</button>
            </div>

            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <FiClock /> Drag and drop the steps into the correct order of Bubble Sort.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {sortSteps.map((step, i) => (
                <div
                  key={step}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(i)}
                  style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: '#f0f4ff', border: '2px dashed #c5cae9',
                    cursor: 'grab', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--primary)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>

            {gameResult && (
              <div className={`alert ${gameResult === 'correct' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: 16 }}>
                {gameResult === 'correct'
                  ? '🎉 Correct! You earned 100 points!'
                  : '❌ Not quite right. Try rearranging again!'}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={checkAnswer}>Check Answer</button>
              <button className="btn btn-outline" onClick={() => setSortSteps([...SORT_STEPS_SCRAMBLED].sort(() => Math.random() - 0.5))}>Shuffle</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
