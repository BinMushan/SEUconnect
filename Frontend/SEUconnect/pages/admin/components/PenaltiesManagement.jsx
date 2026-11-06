import { useState } from 'react';
import api, { penaltyStorage, localNotificationStorage } from '../../../src/services/api.js';

export default function PenaltiesManagement({
  penalties = [],
  batches = [],
  onClearPenalty,
  onAddPenalty
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRegNo, setNewRegNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('Department of Information & Communication Technology');
  const [newBatch, setNewBatch] = useState('Batch 03 (2022/2023)');
  const [newCategory, setNewCategory] = useState('Laboratory Equipment / Safety');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');

  // Auto-detect Department and Batch from standard SEU Reg No pattern (e.g. SEU/IS/22/ICT/091)
  const handleRegNoChange = (val) => {
    setNewRegNo(val);
    const upper = val.toUpperCase();

    // Auto-detect department
    if (upper.includes('/ICT/') || upper.includes('ICT')) {
      setNewDepartment('Department of Information & Communication Technology');
    } else if (upper.includes('/BST/') || upper.includes('BST')) {
      setNewDepartment('Department of Bio Systems Technology');
    } else if (upper.includes('/DIS/') || upper.includes('DIS')) {
      setNewDepartment('Department of Interdisciplinary Studies');
    }

    // Auto-detect batch from 2-digit intake year
    if (upper.includes('/20/') || upper.includes('20ICT') || upper.includes('20BST')) {
      setNewBatch('Batch 01 (2020/2021)');
    } else if (upper.includes('/21/') || upper.includes('21ICT') || upper.includes('21BST')) {
      setNewBatch('Batch 02 (2021/2022)');
    } else if (upper.includes('/22/') || upper.includes('22ICT') || upper.includes('22BST')) {
      setNewBatch('Batch 03 (2022/2023)');
    } else if (upper.includes('/23/') || upper.includes('23ICT') || upper.includes('23BST')) {
      setNewBatch('Batch 04 (2023/2024)');
    } else if (upper.includes('/24/') || upper.includes('24ICT') || upper.includes('24BST')) {
      setNewBatch('Batch 05 (2024/2025)');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRegNo.trim() || !newName.trim() || !newDesc.trim()) return;

    const penaltyId = `PEN-${Date.now()}`;
    const cleanRegNo = newRegNo.trim().toUpperCase();
    const cleanStudentName = newName.trim();
    const cleanAmount = newAmount.trim() || 'Warning Notice Issued';

    const newRecord = {
      id: penaltyId,
      regNo: cleanRegNo,
      studentName: cleanStudentName,
      department: newDepartment,
      batch: newBatch,
      category: newCategory,
      description: newDesc.trim(),
      penaltyAmount: cleanAmount,
      imposedDate: new Date().toISOString().split('T')[0],
      imposedBy: 'Faculty Administration Office',
      status: 'Pending Clearance',
      clearanceNotes: 'Pending official fine payment voucher verification.'
    };

    // 1. Save Disciplinary Record to state & local penalty persistence
    if (onAddPenalty) {
      onAddPenalty(newRecord);
    }
    penaltyStorage.save(newRecord);

    // 2. Identify particular Department Head (HOD) details
    const isBst = newDepartment.includes('Bio') || newDepartment.includes('BST');
    const hodRole = 'hod';
    const hodDept = isBst
      ? 'Department of Bio Systems Technology'
      : 'Department of Information & Communication Technology';
    const hodEmail = isBst ? 'hod_bst@seu.ac.lk' : 'HOD@gmail.com';
    const hodTitle = isBst ? 'HOD Bio Systems Technology' : 'HOD ICT';

    // 3. Construct Notification for the particular Department Head
    const hodNotification = {
      title: `Disciplinary Record Imposed: ${cleanRegNo} (${newCategory})`,
      message: `A formal disciplinary penalty (${cleanAmount}) has been placed on student ${cleanStudentName} (${cleanRegNo}, ${newBatch}) under "${newCategory}". Reason: ${newDesc.trim()}`,
      type: 'Disciplinary',
      priority: 'urgent',
      recipientRole: hodRole,
      recipientDepartment: hodDept,
      recipientEmail: hodEmail,
      targetTab: 'dashboard',
      relatedRequestId: penaltyId,
    };

    // 4. Construct Notification for the Student
    const studentNotification = {
      title: `Official Disciplinary & Penalty Notice: ${newCategory}`,
      message: `Dear ${cleanStudentName}, a disciplinary penalty of "${cleanAmount}" has been recorded under your student registration (${cleanRegNo}, ${newBatch}) regarding: ${newCategory}. Authority Notes: ${newDesc.trim()}. Please submit payment clearance or contact your Department Head / Proctor.`,
      type: 'Disciplinary',
      priority: 'urgent',
      recipientRole: 'student',
      recipientDepartment: newDepartment,
      recipientEmail: `${cleanRegNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@seu.ac.lk`,
      targetTab: 'penalties_disciplinary',
      relatedRequestId: penaltyId,
    };

    // 5. Save notifications locally for immediate cross-portal updates
    localNotificationStorage.save(hodNotification);
    localNotificationStorage.save(studentNotification);

    // 6. Attempt background server notification dispatch
    try {
      await api.createNotification(hodNotification);
    } catch (_) {}
    try {
      await api.createNotification(studentNotification);
    } catch (_) {}

    setNotificationStatus(`Published & notified ${hodTitle} and student ${cleanRegNo}.`);
    setTimeout(() => setNotificationStatus(''), 6000);

    // Reset Form
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

      {notificationStatus && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Penalties Table */}
      <div className="adm-table-card">
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Student Reg No</th>
                <th>Candidate Name</th>
                <th>Department &amp; Batch</th>
                <th>Category</th>
                <th>Incident &amp; Nature</th>
                <th>Imposed Penalty / Fine</th>
                <th>Date Imposed</th>
                <th>Clearance Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((pen) => {
                const isBst = pen.department?.includes('Bio') || pen.department?.includes('BST') || pen.regNo?.includes('BST');
                const deptLabel = isBst ? 'BST' : 'DICT';

                return (
                  <tr key={pen.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{pen.regNo}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{pen.studentName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                        {deptLabel}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {pen.batch || 'Batch 03 (2022/2023)'}
                      </div>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-neutral">{pen.category}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#334155', maxWidth: '280px' }}>
                        {pen.description}
                      </div>
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
                          Verify &amp; Clear
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>Cleared ✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                {/* Registration Number & Student Name */}
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Student Reg No (e.g. SEU/IS/22/ICT/091) *</label>
                    <input
                      type="text"
                      className="adm-input"
                      placeholder="SEU/IS/22/ICT/091"
                      value={newRegNo}
                      onChange={(e) => handleRegNoChange(e.target.value)}
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

                {/* Department & Batch Selections */}
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Department *</label>
                    <select
                      className="adm-input"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      required
                    >
                      <option value="Department of Information & Communication Technology">
                        Department of Information & Communication Technology (BICT)
                      </option>
                      <option value="Department of Bio Systems Technology">
                        Department of Bio Systems Technology (BST)
                      </option>
                      <option value="Department of Interdisciplinary Studies">
                        Department of Interdisciplinary Studies (DIS)
                      </option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Intake Batch *</label>
                    <select
                      className="adm-input"
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      required
                    >
                      {batches && batches.length > 0 ? (
                        batches.map((b) => (
                          <option key={b.id || b.code || b.name} value={b.name}>
                            {b.name} ({b.academicYear || b.currentSemester || 'Active'})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Batch 01 (2020/2021)">Batch 01 (2020/2021)</option>
                          <option value="Batch 02 (2021/2022)">Batch 02 (2021/2022)</option>
                          <option value="Batch 03 (2022/2023)">Batch 03 (2022/2023)</option>
                          <option value="Batch 04 (2023/2024)">Batch 04 (2023/2024)</option>
                          <option value="Batch 05 (2024/2025)">Batch 05 (2024/2025)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Category & Fine Amount */}
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <select
                      className="adm-input"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      {/* Original 4 Categories */}
                      <option value="Laboratory Equipment / Safety">Laboratory Equipment / Safety</option>
                      <option value="Library Overdue / Lost Book">Library Overdue / Lost Book</option>
                      <option value="Examination Irregularity">Examination Irregularity</option>
                      <option value="General Student Conduct">General Student Conduct</option>

                      {/* 5 Newly Added Academic & Disciplinary Categories */}
                      <option value="Hostel & Residential Regulations / Damage">
                        Hostel & Residential Regulations / Damage
                      </option>
                      <option value="Campus Property Damage / Vandalism">
                        Campus Property Damage / Vandalism
                      </option>
                      <option value="Academic Dishonesty & Plagiarism">
                        Academic Dishonesty & Plagiarism
                      </option>
                      <option value="Anti-Ragging, Bullying & Harassment">
                        Anti-Ragging, Bullying & Harassment
                      </option>
                      <option value="IT & Cyber Infrastructure Misuse">
                        IT & Cyber Infrastructure Misuse
                      </option>
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

                {/* Information Callout Banner */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.78rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    Saving this entry will automatically dispatch official disciplinary notices to the respective
                    Department Head (HOD) and the registered student portal account.
                  </span>
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
