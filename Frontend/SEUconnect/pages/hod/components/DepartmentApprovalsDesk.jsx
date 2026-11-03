import React, { useState } from 'react';

export default function DepartmentApprovalsDesk({
  processes,
  pendingHOD,
  isLoading,
  onOpenAudit,
  onOpenEndorse,
  onOpenReturn,
  onOpenDecline,
}) {
  const [filter, setFilter] = useState('pending_hod');
  const [searchQuery, setSearchQuery] = useState('');

  const displayed = processes.filter((proc) => {
    const matchesSearch =
      !searchQuery ||
      proc.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proc.processTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending_hod') {
      return (
        (proc.currentAssignedRole === 'hod' || proc.status === 'Pending HOD') &&
        proc.status !== 'Approved' &&
        proc.status !== 'Declined'
      );
    }
    if (filter === 'endorsed') {
      return proc.history?.some((h) => h.role === 'hod');
    }
    if (filter === 'approved') return proc.status === 'Approved';
    if (filter === 'declined') return proc.status === 'Declined';
    return true;
  });

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">APPROVALS & WORKFLOWS</span>
          <h1 className="hod-view-title">Department Endorsement & Approvals Desk</h1>
          <p className="hod-view-subtitle">
            HOD Official Sign-off on Student Medical Certificates, CA Repeats & Academic Petitions before Dean Clearance
          </p>
        </div>
      </div>

      {/* 2. Top Stats Strip */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card" onClick={() => setFilter('pending_hod')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val" style={{ color: pendingHOD.length > 0 ? '#b45309' : '#0f2b5c' }}>
            {pendingHOD.length}
          </span>
          <span className="hod-strip-lbl">Awaiting HOD Endorsement</span>
        </div>
        <div className="hod-strip-card" onClick={() => setFilter('endorsed')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val" style={{ color: '#059669' }}>
            {processes.filter((p) => p.history?.some((h) => h.role === 'hod')).length}
          </span>
          <span className="hod-strip-lbl">Endorsed to Dean's Office</span>
        </div>
        <div className="hod-strip-card" onClick={() => setFilter('approved')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">
            {processes.filter((p) => p.status === 'Approved').length}
          </span>
          <span className="hod-strip-lbl">Fully Cleared / Approved</span>
        </div>
        <div className="hod-strip-card" onClick={() => setFilter('declined')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val" style={{ color: '#dc2626' }}>
            {processes.filter((p) => p.status === 'Declined').length}
          </span>
          <span className="hod-strip-lbl">Declined / Returned</span>
        </div>
        <div className="hod-strip-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <span className="hod-strip-val">{processes.length}</span>
          <span className="hod-strip-lbl">All Recorded Department Petitions</span>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="hod-toolbar-card">
        <div className="hod-filter-tabs">
          <button
            type="button"
            className={`hod-tab-btn ${filter === 'pending_hod' ? 'active' : ''}`}
            onClick={() => setFilter('pending_hod')}
          >
            Awaiting HOD ({pendingHOD.length})
          </button>
          <button
            type="button"
            className={`hod-tab-btn ${filter === 'endorsed' ? 'active' : ''}`}
            onClick={() => setFilter('endorsed')}
          >
            Endorsed by HOD
          </button>
          <button
            type="button"
            className={`hod-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Requests ({processes.length})
          </button>
          <button
            type="button"
            className={`hod-tab-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            type="button"
            className={`hod-tab-btn ${filter === 'declined' ? 'active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            Declined
          </button>
        </div>

        <div className="hod-table-search-box" style={{ maxWidth: '320px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tracking ID, reg no, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="hod-table-card">
        {isLoading ? (
          <div className="hod-empty-state">
            <div className="hod-spinner"></div>
            <p>Loading Departmental Approvals Queue...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="hod-empty-state">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h4>No petitions found</h4>
            <p>
              {filter === 'pending_hod'
                ? 'There are currently no petitions awaiting your endorsement.'
                : 'No petitions matched the selected filter.'}
            </p>
          </div>
        ) : (
          <div className="hod-table-wrapper">
            <table className="hod-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Student Name & Reg No</th>
                  <th>Process Title & Subject</th>
                  <th>Lecturer Recommendation</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((proc) => {
                  const isPendingMe =
                    (proc.currentAssignedRole === 'hod' || proc.status === 'Pending HOD') &&
                    proc.status !== 'Approved' &&
                    proc.status !== 'Declined';

                  const lecStep = proc.history?.find((h) => h.role === 'lecturer');

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="hod-tracking-badge">{proc.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="hod-student-name">{proc.studentName}</div>
                        <div className="hod-student-reg">{proc.registrationNumber}</div>
                      </td>
                      <td>
                        <div className="hod-proc-title">{proc.processTitle}</div>
                        {proc.formData?.subjectCode && (
                          <span className="hod-subject-tag">{proc.formData.subjectCode}</span>
                        )}
                      </td>
                      <td>
                        {lecStep ? (
                          <div className="hod-lec-verdict">
                            <span className="hod-lec-pill">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Recommended
                            </span>
                            <span className="hod-lec-sub">by {lecStep.actedBy}</span>
                          </div>
                        ) : (
                          <span className="hod-lec-pending">Not Required / Direct</span>
                        )}
                      </td>
                      <td>
                        <span className={`hod-status-pill status-${proc.status?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                          {proc.status}
                        </span>
                      </td>
                      <td>
                        <span className="hod-date-text">{new Date(proc.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <div className="hod-actions-cell">
                          {isPendingMe && (
                            <>
                              <button
                                type="button"
                                className="hod-btn-endorse"
                                onClick={() => onOpenEndorse(proc)}
                              >
                                Endorse & Forward
                              </button>
                              <button
                                type="button"
                                className="hod-btn-return"
                                onClick={() => onOpenReturn ? onOpenReturn(proc) : null}
                              >
                                Return
                              </button>
                              <button
                                type="button"
                                className="hod-btn-decline"
                                onClick={() => onOpenDecline(proc)}
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className="hod-btn-audit"
                            onClick={() => onOpenAudit(proc)}
                          >
                            Track & Audit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
