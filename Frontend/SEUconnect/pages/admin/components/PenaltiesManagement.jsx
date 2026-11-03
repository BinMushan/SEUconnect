import { useState } from 'react';

export default function PenaltiesManagement({
  penalties,
  onClearPenalty,
  onAddPenalty
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRegNo, setNewRegNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Laboratory Breaches');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newRegNo.trim() || !newName.trim() || !newDesc.trim()) return;

    onAddPenalty({
      id: `PEN-${Date.now()}`,
      regNo: newRegNo.trim().toUpperCase(),
      studentName: newName.trim(),
      category: newCategory,
      description: newDesc.trim(),
      penaltyAmount: newAmount.trim() || 'Warning Notice Issued',
      imposedDate: new Date().toISOString().split('T')[0],
      imposedBy: 'Faculty Administration Office',
      status: 'Pending Clearance',
      clearanceNotes: 'Pending official fine payment voucher verification.'
    });

    setNewRegNo('');
    setNewName('');
    setNewDesc('');
    setNewAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Penalties, Disciplinary Records & Clearances</h2>
          <p className="adm-section-subtitle">
            Track student disciplinary inquiries, monitor laboratory equipment damage fines, library overdues, and reconcile institutional clearance slips.
          </p>
        </div>
        <div className="adm-section-actions">
          <button
            type="button"
            className="adm-find-process-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Record Disciplinary / Penalty Entry
          </button>
        </div>
      </div>

      {/* Penalties Table */}
      <div className="adm-table-card">
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Student Reg No</th>
                <th>Candidate Name</th>
                <th>Category</th>
                <th>Incident & Nature</th>
                <th>Imposed Penalty / Fine</th>
                <th>Date Imposed</th>
                <th>Clearance Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((pen) => (
                <tr key={pen.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{pen.regNo}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{pen.studentName}</div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-neutral">{pen.category}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: '#334155', maxWidth: '280px' }}>{pen.description}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#dc2626' }}>{pen.penaltyAmount}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{pen.imposedDate}</span>
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${
                        pen.status === 'Cleared'
                          ? 'adm-badge-success'
                          : pen.status === 'Pending Clearance'
                          ? 'adm-badge-warning'
                          : 'adm-badge-danger'
                      }`}
                    >
                      {pen.status}
                    </span>
                  </td>
                  <td>
                    {pen.status !== 'Cleared' ? (
                      <button
                        type="button"
                        className="adm-btn-xs-primary"
                        onClick={() => onClearPenalty(pen.id)}
                      >
                        Verify & Clear
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>Cleared ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="adm-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Record Disciplinary Penalty / Fine</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Student Reg No (e.g. SEU/IS/22/ICT/091) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="SEU/IS/22/ICT/091"
                      value={newRegNo}
                      onChange={(e) => setNewRegNo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Student Name *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="Student full name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <select
                      className="adm-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Laboratory Breaches">Laboratory Equipment / Safety</option>
                      <option value="Library Overdue">Library Overdue / Lost Book</option>
                      <option value="Examination Breaches">Examination Irregularity</option>
                      <option value="General Conduct">General Student Conduct</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Penalty / Fine Amount</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="e.g. Rs. 2,000 Fine"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Incident Description & Authority Notes *</label>
                  <textarea
                    className="adm-textarea"
                    placeholder="Describe the nature of the violation or overdue item..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-xs-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-find-process-btn"
                >
                  Save Disciplinary Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
