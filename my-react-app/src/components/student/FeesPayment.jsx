import { useState } from 'react';
import { FiDollarSign, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

const FEE_RECORDS = [
  { id: 1, description: 'Tuition Fee – Semester 6',    amount: 45000, dueDate: '2024-06-30', paid: true,  paidDate: '2024-06-10', receipt: 'RCP-2024-001' },
  { id: 2, description: 'Exam Fee – Semester 6',        amount: 2500,  dueDate: '2024-07-15', paid: true,  paidDate: '2024-07-01', receipt: 'RCP-2024-002' },
  { id: 3, description: 'Library Fee – Annual',         amount: 1000,  dueDate: '2024-08-01', paid: false, paidDate: null,         receipt: null },
  { id: 4, description: 'Laboratory Fee – Semester 6', amount: 3000,  dueDate: '2024-06-30', paid: false, paidDate: null,         receipt: null },
  { id: 5, description: 'Bus Fee – June',               amount: 1800,  dueDate: '2024-06-05', paid: true,  paidDate: '2024-06-03', receipt: 'RCP-2024-003' },
];

const PAYMENT_METHODS = ['Credit/Debit Card', 'Net Banking', 'UPI', 'Demand Draft'];

export default function FeesPayment() {
  const [fees, setFees]       = useState(FEE_RECORDS);
  const [payFee, setPayFee]   = useState(null);
  const [method, setMethod]   = useState(PAYMENT_METHODS[2]);
  const [utr, setUtr]         = useState('');
  const [processing, setProc] = useState(false);
  const [success, setSuccess] = useState(null);

  const totalDue  = fees.filter((f) => !f.paid).reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = fees.filter((f) => f.paid).reduce((acc, f) => acc + f.amount, 0);

  const confirmPayment = async () => {
    if (!utr.trim()) return;
    setProc(true);
    await new Promise((r) => setTimeout(r, 1200));
    const receipt = `RCP-2024-${String(Date.now()).slice(-4)}`;
    setFees((prev) =>
      prev.map((f) =>
        f.id === payFee.id
          ? { ...f, paid: true, paidDate: new Date().toISOString().slice(0, 10), receipt }
          : f
      )
    );
    setSuccess({ fee: payFee, receipt });
    setPayFee(null);
    setUtr('');
    setProc(false);
  };

  return (
    <>
      <div className="page-header">
        <h1><FiDollarSign style={{ marginRight: 8 }} />Fees Payment Portal</h1>
      </div>

      <div className="page-body">
        {/* Summary */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card green">
            <div className="stat-value">₹{totalPaid.toLocaleString()}</div>
            <div className="stat-label">Total Paid</div>
          </div>
          <div className="stat-card red">
            <div className="stat-value">₹{totalDue.toLocaleString()}</div>
            <div className="stat-label">Outstanding Due</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-value">{fees.filter((f) => f.paid).length}/{fees.length}</div>
            <div className="stat-label">Payments Completed</div>
          </div>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <FiCheckCircle size={20} />
            <div>
              Payment for <strong>{success.fee.description}</strong> confirmed!
              Receipt: <strong>{success.receipt}</strong>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title">Fee Details</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.description}</td>
                    <td>₹{f.amount.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiClock size={12} /> {f.dueDate}
                      </span>
                    </td>
                    <td>
                      {f.paid ? (
                        <span className="badge badge-success"><FiCheckCircle size={10} /> Paid – {f.paidDate}</span>
                      ) : (
                        <span className="badge badge-danger"><FiAlertCircle size={10} /> Pending</span>
                      )}
                    </td>
                    <td>{f.receipt ?? '—'}</td>
                    <td>
                      {!f.paid && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setPayFee(f); setSuccess(null); }}>
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment modal */}
        {payFee && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPayFee(null); }}>
            <div className="modal">
              <div className="modal-header">
                <span className="modal-title">Pay Fee</span>
                <button className="modal-close" onClick={() => setPayFee(null)}>×</button>
              </div>

              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <FiDollarSign /> {payFee.description} – <strong>₹{payFee.amount.toLocaleString()}</strong>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-control" value={method} onChange={(e) => setMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction / UTR Reference Number</label>
                <input className="form-control" placeholder="e.g. 123456789012" value={utr} onChange={(e) => setUtr(e.target.value)} />
              </div>

              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                Please complete the payment via your bank and enter the UTR/reference number above.
              </div>

              <button
                className="btn btn-success btn-full"
                onClick={confirmPayment}
                disabled={processing || !utr.trim()}
              >
                {processing ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 3 }} /> : <><FiCheckCircle /> Confirm Payment</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
