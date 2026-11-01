import { useState } from 'react';

export default function MedicalRequests({
  medicals,
  onApproveMedical,
  onRejectMedical
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedMed, setSelectedMed] = useState(null);
  const [rejectModalMed, setRejectModalMed] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filtered = medicals.filter((m) => {
    return filterStatus === 'ALL' || m.status === filterStatus;
  });

  const handleConfirmReject = () => {
    if (rejectModalMed) {
      onRejectMedical(rejectModalMed.id, rejectionReason || 'Medical submission does not comply with SEUSL 7-day excuse submission policy.');
      setRejectModalMed(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="adm-dashboard-container">
      {/* Section Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Attendance & Student Medical Request Verification</h2>
          <p className="adm-section-subtitle">
            Audit hospital and University Medical Officer (UMO) certificates, verify lecture absence periods, and restore ESA exam eligibility standing.
          </p>
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>TOTAL SUBMISSIONS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{medicals.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Current Semester Records</div>
        </div>

        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>PENDING VERIFICATION</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
            {medicals.filter((m) => m.status === 'Pending').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting Medical Board Counter-Signature</div>
        </div>

        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>APPROVED EXCUSES</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
            {medicals.filter((m) => m.status === 'Approved').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Attendance Standing Restored</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="adm-filter-toolbar">
        <div className="adm-filter-group">
          <select
            className="adm-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Medical Statuses</option>
            <option value="Pending">Pending Clearance</option>
            <option value="Approved">Approved (Excused)</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Medical Requests Table */}
      <div className="adm-table-card">
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Certificate Ref</th>
                <th>Student</th>
                <th>Absence Period</th>
                <th>Issuing Medical Officer</th>
                <th>Diagnosis Summary</th>
                <th>Attendance Impact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((med) => (
                <tr key={med.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{med.certificateRef}</span>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Submitted: {med.submissionDate}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{med.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{med.regNo} • {med.programme}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{med.period}</span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{med.affectedModules.length} Modules Affected</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 500 }}>{med.medicalOfficer}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {med.diagnosis}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#b91c1c', fontWeight: 700 }}>{med.attendanceBefore}%</span>
                      <span>&rarr;</span>
                      <span style={{ color: '#15803d', fontWeight: 700 }}>{med.attendanceAfterApproval}%</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: med.attendanceAfterApproval >= 80 ? '#15803d' : '#b45309' }}>
                      {med.attendanceAfterApproval >= 80 ? 'Restores ESA Standing' : 'Below 80% Threshold'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${
                        med.status === 'Approved'
                          ? 'adm-badge-success'
                          : med.status === 'Pending'
                          ? 'adm-badge-warning'
                          : 'adm-badge-danger'
                      }`}
                    >
                      {med.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="adm-btn-xs-secondary"
                        onClick={() => setSelectedMed(med)}
                      >
                        Details
                      </button>
                      {med.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="adm-btn-xs-primary"
                            onClick={() => onApproveMedical(med.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="adm-btn-xs-secondary"
                            onClick={() => setRejectModalMed(med)}
                            style={{ color: '#dc2626' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedMed && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedMed(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Medical Excuse Verification ({selectedMed.certificateRef})</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setSelectedMed(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f172a' }}>{selectedMed.studentName}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedMed.regNo} • {selectedMed.programme}</div>
                </div>
                <span className={`adm-badge ${selectedMed.status === 'Approved' ? 'adm-badge-success' : selectedMed.status === 'Pending' ? 'adm-badge-warning' : 'adm-badge-danger'}`}>
                  {selectedMed.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Absence Period:</span>
                  <span style={{ fontWeight: 600 }}>{selectedMed.period}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Medical Authority:</span>
                  <span style={{ fontWeight: 600 }}>{selectedMed.medicalOfficer}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Clinical Diagnosis:</span>
                  <span style={{ fontWeight: 600, color: '#0f2b5c' }}>{selectedMed.diagnosis}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Attendance Recalculation:</span>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>
                    {selectedMed.attendanceBefore}% &rarr; {selectedMed.attendanceAfterApproval}% (Restores Exam Eligibility)
                  </span>
                </div>
              </div>

              <div>
                <h5 style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#0f172a' }}>Affected Course Modules</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedMed.affectedModules.map((m, idx) => (
                    <div key={idx} style={{ padding: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {selectedMed.remarks && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#991b1b' }}>
                  <strong>Review Remarks:</strong> {selectedMed.remarks}
                </div>
              )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-xs-secondary"
                onClick={() => setSelectedMed(null)}
              >
                Close
              </button>
              {selectedMed.status === 'Pending' && (
                <button
                  type="button"
                  className="adm-find-process-btn"
                  onClick={() => {
                    onApproveMedical(selectedMed.id);
                    setSelectedMed(null);
                  }}
                >
                  Approve Medical Excuse
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModalMed && (
        <div className="adm-modal-backdrop" onClick={() => setRejectModalMed(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title" style={{ color: '#b91c1c' }}>Reject Medical Certificate</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setRejectModalMed(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="adm-modal-body">
              <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
                Are you sure you want to reject medical request <strong>{rejectModalMed.certificateRef}</strong> for student <strong>{rejectModalMed.studentName} ({rejectModalMed.regNo})</strong>?
              </p>

              <div className="adm-form-group">
                <label className="adm-label">Rejection Reason / Medical Board Remarks *</label>
                <textarea
                  className="adm-textarea"
                  placeholder="e.g. Unregistered private doctor certificate, submitted outside the 7-day absence window, incomplete clinical diagnostic information..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-xs-secondary"
                onClick={() => setRejectModalMed(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-xs-primary"
                style={{ background: '#b91c1c' }}
                onClick={handleConfirmReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
