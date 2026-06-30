import { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiUser, FiRotateCcw } from 'react-icons/fi';
import { aiAPI } from '../../services/api';

const SUGGESTIONS = [
  'Explain Dijkstra\'s algorithm with an example',
  'What is the difference between TCP and UDP?',
  'How does deadlock occur in OS?',
  'Explain normalization in DBMS',
  'What is the SDLC waterfall model?',
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Hi! I\'m your AI Study Assistant 🎓. I can help you with any subject doubts — Data Structures, Networks, OS, DBMS, and more. What would you like to learn today?',
  },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Attempt real API; fall back to mock response
      let answer;
      try {
        const res = await aiAPI.ask(q, 'academic');
        answer = res.data.answer;
      } catch {
        // Demo mode fallback
        await new Promise((r) => setTimeout(r, 800));
        answer = generateDemoAnswer(q);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <div className="page-header">
        <h1><FiCpu style={{ marginRight: 8 }} />AI Study Assistant</h1>
      </div>

      <div className="page-body" style={{ display: 'flex', gap: 20, height: 'calc(100vh - var(--header-h) - 48px)', alignItems: 'flex-start' }}>
        {/* Suggestions sidebar */}
        <div className="card" style={{ width: 220, flexShrink: 0 }}>
          <div className="card-title">Suggested Questions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  background: '#f0f4ff', border: 'none', borderRadius: 8, padding: '9px 12px',
                  fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer', color: 'var(--primary)',
                  fontWeight: 500, transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e0e7ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#f0f4ff')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--primary)' : '#ff6f00',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  {msg.role === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
                </div>
                <div
                  style={{
                    maxWidth: '70%',
                    background: msg.role === 'user' ? '#1a237e' : '#f5f7ff',
                    color: msg.role === 'user' ? '#fff' : 'var(--text)',
                    padding: '12px 16px', borderRadius: 12,
                    fontSize: '0.9rem', lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ff6f00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <FiCpu size={16} />
                </div>
                <div style={{ background: '#f5f7ff', padding: '12px 16px', borderRadius: 12, display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: '#9e9e9e', animation: 'bounce 0.8s infinite', animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              className="btn btn-outline btn-sm"
              title="Clear chat"
              aria-label="Clear chat"
            >
              <FiRotateCcw />
            </button>
            <textarea
              className="form-control"
              placeholder="Ask your doubt… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ resize: 'none', flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}

// Demo answer generator
function generateDemoAnswer(q) {
  const lower = q.toLowerCase();
  if (lower.includes('dijkstra')) {
    return "Dijkstra's Algorithm finds the shortest path in a weighted graph.\n\n**Steps:**\n1. Start at the source node, set its distance to 0 and all others to ∞.\n2. Pick the unvisited node with the minimum distance.\n3. Update distances of adjacent nodes.\n4. Mark the current node as visited.\n5. Repeat until all nodes are visited.\n\n**Time Complexity:** O(V²) or O(E log V) with a priority queue.\n\nWould you like a worked example?";
  }
  if (lower.includes('tcp') && lower.includes('udp')) {
    return "**TCP vs UDP:**\n\n| Feature | TCP | UDP |\n|---------|-----|-----|\n| Connection | Connection-oriented | Connectionless |\n| Reliability | Guaranteed delivery | No guarantee |\n| Speed | Slower (overhead) | Faster |\n| Use case | HTTP, Email, FTP | DNS, Video, VoIP |\n\nTCP uses a 3-way handshake (SYN → SYN-ACK → ACK) to establish a connection, ensuring all packets arrive in order.";
  }
  if (lower.includes('deadlock')) {
    return "**Deadlock** occurs when a set of processes are permanently blocked because each is waiting for a resource held by another.\n\n**Four Conditions (Coffman):**\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n\n**Prevention strategies:** Break any one of these four conditions.";
  }
  return `Great question about: "${q}"\n\nThis is a demo response. Connect the Express AI service with your OpenAI/Gemini API key to get real AI-powered answers. The backend endpoint is: POST /api/ai/ask`;
}
