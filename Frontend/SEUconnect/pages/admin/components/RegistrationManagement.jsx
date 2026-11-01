import { useState } from 'react';

export default function RegistrationManagement({
  registrations,
  onApproveRegistration,
  onRejectRegistration,
  onBatchApprove
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProgramme, setFilterProgramme] = useState('ALL');
  const [selectedReg, setSelectedReg] = useState(null);

  const filtered = registrations.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesProg = filterProgramme === 'ALL' || r.programme.includes(filterProgramme);
    return matchesStatus && matchesProg;
  });

  const pendingCount = registrations.filter((r) => r.status === 'Pending').length;

  return (
    <div className="adm-dashboard-container">
      {/* Header */}
      <div className="adm-section-header">
        <div className="adm-section-title-wrap">
          <h2 className="adm-section-title">Semester & Subject Registration Approvals</h2>
          <p className="adm-section-subtitle">
            Verify student module enrollments, validate Add/Drop amendments, check credit load limits, and clear academic rosters.
          </p>
        </div>
        <div className="adm-section-actions">
          {pendingCount > 0 && (
            <button
              type="button"
              className="adm-find-process-btn"
              style={{ background: '#15803d' }}
              onClick={onBatchApprove}
            >
              Approve All {pendingCount} Pending
            </button>
          )}
        </div>
      </div>

      {/* Metric summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>TOTAL REGISTRATIONS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{registrations.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Semester 1, 3, 5, 7 Active</div>
        </div>

        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>PENDING ENDORSEMENT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting Administrative Clearance</div>
        </div>

        <div className="adm-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>CLEARED & APPROVED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>
            {registrations.filter((r) => r.status === 'Approved').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Exported to LMS & Attendance Sheet</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="adm-filter-toolbar">
        <div className="adm-filter-group">
          <select
            className="adm-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Application Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="adm-filter-select"
            value={filterProgramme}
            onChange={(e) => setFilterProgramme(e.target.value)}
          >
            <option value="ALL">All Programmes</option>
            <option value="BICT">BICT (Hons)</option>
            <option value="BST">BST (Hons)</option>
            <option value="ET">ET (Hons)</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="adm-table-card">
        <div className="adm-table-wrapper">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student</th>
                <th>Type / Nature</th>
                <th>Semester</th>
                <th>Enrolled Modules</th>
                <th>Total Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f2b5c' }}>{reg.id}</span>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Submitted: {reg.submissionDate}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{reg.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{reg.regNo} • {reg.programme}</div>
                  </td>
                  <td>
                    <span className="adm-badge adm-badge-neutral">{reg.type}</span>
                  </td>
                  <td>
                    <span className="adm-stat-badge">{reg.semester}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f2b5c' }}>{reg.modules.length} Modules</span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reg.modules[0]}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: reg.totalCredits > 22 ? '#dc2626' : '#15803d'
                      }}
                    >
                      {reg.totalCredits} Cr
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {reg.totalCredits > 22 ? 'Exceeds Cap (22)' : 'Within Limit'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${
                        reg.status === 'Approved'
                          ? 'adm-badge-success'
                          : reg.status === 'Pending'
                          ? 'adm-badge-warning'
                          : 'adm-badge-danger'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="adm-btn-xs-secondary"
                        onClick={() => setSelectedReg(reg)}
                      >
                        Inspect
                      </button>
                      {reg.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="adm-btn-xs-primary"
                            onClick={() => onApproveRegistration(reg.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="adm-btn-xs-secondary"
                            onClick={() => onRejectRegistration(reg.id)}
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

      {/* Inspect Modal */}
      {selectedReg && (
        <div className="adm-modal-backdrop" onClick={() => setSelectedReg(null)}>
          <div className="adm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">Registration Inspection ({selectedReg.id})</h3>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setSelectedReg(null)}
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
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#0f172a' }}>{selectedReg.studentName}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedReg.regNo} • {selectedReg.programme} • {selectedReg.semester}
                  </div>
                </div>
                <span className={`adm-badge ${selectedReg.status === 'Approved' ? 'adm-badge-success' : selectedReg.status === 'Pending' ? 'adm-badge-warning' : 'adm-badge-danger'}`}>
                  {selectedReg.status}
                </span>
              </div>

              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#0f172a' }}>
                  Registered Subjects ({selectedReg.modules.length} modules • Total {selectedReg.totalCredits} Credits)
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {selectedReg.modules.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.55rem 0.85rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#1e293b'
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {selectedReg.remarks && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#b45309' }}>
                  <strong>Administrative Flag:</strong> {selectedReg.remarks}
                </div>
              )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn-xs-secondary"
                onClick={() => setSelectedReg(null)}
              >
                Close
              </button>
              {selectedReg.status === 'Pending' && (
                <button
                  type="button"
                  className="adm-find-process-btn"
                  onClick={() => {
                    onApproveRegistration(selectedReg.id);
                    setSelectedReg(null);
                  }}
                >
                  Approve Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
