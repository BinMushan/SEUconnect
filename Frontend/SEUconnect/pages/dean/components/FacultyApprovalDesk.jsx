import React, { useState } from 'react';

export default function FacultyApprovalDesk({
  processes = [],
  pendingDean = [],
  isLoading,
  onOpenAudit,
  onOpenApprove,
  onOpenReturn,
  onOpenDecline,
}) {
  const [filter, setFilter] = useState('pending_dean');
  const [searchQuery, setSearchQuery] = useState('');

  const safeProcesses = Array.isArray(processes) ? processes : [];

  // Extract requests awaiting Dean
  const awaitingDeanRequests = safeProcesses.filter((proc) => {
    return (
      (proc.currentAssignedRole === 'dean' || proc.status === 'Pending Dean') &&
      proc.status !== 'Approved' &&
      proc.status !== 'Declined'
    );
  });

  // Extract recently endorsed by HOD (either pending dean or having HOD stage completed)
  const recentlyEndorsedByHod = safeProcesses.filter((proc) => {
    const hasHodStage = proc.stages?.some(
      (s) => (s.role === 'hod' || s.stageKey?.includes('hod')) && s.status === 'COMPLETED'
    );
    const hasHodAudit = proc.auditLog?.some(
      (a) => a.action === 'ENDORSED' || a.actorRole?.toLowerCase().includes('hod') || a.comment?.toLowerCase().includes('endorsed')
    );
    const hasHodHistory = proc.history?.some((h) => h.role === 'hod');
    return hasHodStage || hasHodAudit || hasHodHistory || proc.status === 'Pending Dean';
  });

  // Filtered list for the main queue table
  const displayed = safeProcesses.filter((proc) => {
    const nameStr = proc.student?.name || proc.studentName || '';
    const regStr = proc.student?.regNo || proc.registrationNumber || '';
    const titleStr = proc.title || proc.processTitle || '';
    const trackStr = proc.trackingNumber || '';
    const deptStr = proc.student?.department || '';

    const matchesSearch =
      !searchQuery ||
      trackStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deptStr.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending_dean') {
      return (
        (proc.currentAssignedRole === 'dean' || proc.status === 'Pending Dean') &&
        proc.status !== 'Approved' &&
        proc.status !== 'Declined'
      );
    }
    if (filter === 'approved') return proc.status === 'Approved';
    if (filter === 'declined') return proc.status === 'Declined' || proc.status === 'Returned for Correction';
    return true;
  });

  // Helper to extract department short code
  const getDeptBadge = (proc) => {
    const dept = proc.student?.department || '';
    if (dept.toLowerCase().includes('biosystem') || dept.toLowerCase().includes('bst')) {
      return { code: 'BST', name: 'Biosystems Technology', color: '#16a34a', bg: '#dcfce7' };
    }
    return { code: 'ICT', name: 'Information & Comm. Technology', color: '#2563eb', bg: '#dbeafe' };
  };

  // Helper to get HOD endorsement info
  const getHodEndorsementInfo = (proc) => {
    const hodStage = proc.stages?.find((s) => s.role === 'hod' || s.stageKey?.includes('hod'));
    const hodAudit = proc.auditLog?.find((a) => a.action === 'ENDORSED' || a.actorRole?.toLowerCase().includes('hod'));
    const isBst = (proc.student?.department || '').toLowerCase().includes('biosystem');
    
    const hodName = hodStage?.actionTakenBy || hodAudit?.actorName || (isBst ? 'Dr. M.G. Mohamed Thariq' : 'M.J Ahamed Sabani');
    const date = hodStage?.actionDate || hodAudit?.timestamp || proc.updatedAt || proc.createdAt;
    
    return {
      hodName,
      date: date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    };
  };

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">EXECUTIVE SANCTIONS & APPROVALS</span>
          <h1 className="dean-view-title">Faculty Executive Approval Desk</h1>
          <p className="dean-view-subtitle">
            Executive review of student petitions, academic repeat exam waivers, and concessions endorsed by BST & ICT Department Heads
          </p>
        </div>
      </div>

      {/* 2. Top Stats Strip */}
      <div className="dean-stats-strip">
        <div className="dean-strip-card" onClick={() => setFilter('pending_dean')} style={{ cursor: 'pointer' }}>
          <span className="dean-strip-val" style={{ color: awaitingDeanRequests.length > 0 ? '#b45309' : '#0f2b5c' }}>
            {awaitingDeanRequests.length}
          </span>
          <span className="dean-strip-lbl">Awaiting Dean Signature</span>
        </div>
        <div className="dean-strip-card" style={{ cursor: 'pointer' }}>
          <span className="dean-strip-val" style={{ color: '#2563eb' }}>
            {recentlyEndorsedByHod.length}
          </span>
          <span className="dean-strip-lbl">Endorsed by HODs</span>
        </div>
        <div className="dean-strip-card" onClick={() => setFilter('approved')} style={{ cursor: 'pointer' }}>
          <span className="dean-strip-val" style={{ color: '#059669' }}>
            {processes.filter((p) => p.status === 'Approved').length}
          </span>
          <span className="dean-strip-lbl">Executive Approvals Granted</span>
        </div>
        <div className="dean-strip-card" onClick={() => setFilter('declined')} style={{ cursor: 'pointer' }}>
          <span className="dean-strip-val" style={{ color: '#dc2626' }}>
            {processes.filter((p) => p.status === 'Declined' || p.status === 'Returned for Correction').length}
          </span>
          <span className="dean-strip-lbl">Returned / Declined</span>
        </div>
      </div>

      {/* 3. SECTION A: AWAITING DEAN APPROVAL */}
      <div className="dean-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
        <div className="dean-card-header" style={{ paddingBottom: '0.65rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                SECTION A
              </span>
              <h3 className="dean-card-heading" style={{ fontSize: '1.1rem', margin: 0 }}>
                Awaiting Dean Approval ({awaitingDeanRequests.length})
              </h3>
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Petitions currently awaiting final executive sanction by Dean Prof. Rifai Kariapper
            </p>
          </div>
        </div>

        {awaitingDeanRequests.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            ✓ All forwarded petitions have been reviewed. No requests currently awaiting Dean approval.
          </div>
        ) : (
          <div className="dean-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="dean-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Lecturer / Staff / Student</th>
                  <th>Department</th>
                  <th>Request Type</th>
                  <th>Date Endorsed by HOD</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {awaitingDeanRequests.map((proc) => {
                  const dept = getDeptBadge(proc);
                  const hodInfo = getHodEndorsementInfo(proc);
                  const reqType = (proc.type || 'Academic Request').replace('_', ' ').toUpperCase();
                  const name = proc.student?.name || proc.studentName || 'Student';
                  const regNo = proc.student?.regNo || proc.registrationNumber || '';

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="dean-tracking-badge" style={{ fontWeight: 700 }}>
                          {proc.trackingNumber}
                        </span>
                      </td>
                      <td>
                        <div className="dean-student-name">{name}</div>
                        <div className="dean-student-reg">{regNo}</div>
                      </td>
                      <td>
                        <span style={{ background: dept.bg, color: dept.color, fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {dept.code}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                          {reqType}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {proc.title || proc.processTitle}
                        </div>
                      </td>
                      <td>
                        <span className="dean-date-text">{hodInfo.date}</span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>by {hodInfo.hodName}</div>
                      </td>
                      <td>
                        <span className="dean-status-pill status-pending-dean">
                          Pending Dean
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="dean-btn-audit"
                            onClick={() => onOpenAudit(proc)}
                            title="View Complete Request & History"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            className="dean-btn-approve"
                            onClick={() => onOpenApprove(proc)}
                            title="Grant Dean Executive Approval"
                          >
                            Approve
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

      {/* 4. SECTION B: RECENTLY ENDORSED BY HOD */}
      <div className="dean-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #2563eb' }}>
        <div className="dean-card-header" style={{ paddingBottom: '0.65rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                SECTION B
              </span>
              <h3 className="dean-card-heading" style={{ fontSize: '1.1rem', margin: 0 }}>
                Recently Endorsed by HOD ({recentlyEndorsedByHod.length})
              </h3>
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Academic submissions reviewed and endorsed by Department Heads (ICT & BST) forwarded to Dean Executive Office
            </p>
          </div>
        </div>

        {recentlyEndorsedByHod.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            No recent HOD endorsements found.
          </div>
        ) : (
          <div className="dean-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="dean-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>HOD Name</th>
                  <th>Department</th>
                  <th>Staff Member / Request Owner</th>
                  <th>Endorsement Date</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentlyEndorsedByHod.slice(0, 5).map((proc) => {
                  const dept = getDeptBadge(proc);
                  const hodInfo = getHodEndorsementInfo(proc);
                  const isApproved = proc.status === 'Approved';
                  const isDeclined = proc.status === 'Declined';
                  const isPending = !isApproved && !isDeclined;

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="dean-tracking-badge">{proc.trackingNumber}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                          {hodInfo.hodName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Head of Department</div>
                      </td>
                      <td>
                        <span style={{ background: dept.bg, color: dept.color, fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {dept.name}
                        </span>
                      </td>
                      <td>
                        <div className="dean-student-name">
                          {proc.student?.name || proc.studentName}
                        </div>
                        <div className="dean-student-reg">
                          {proc.student?.regNo || proc.registrationNumber}
                        </div>
                      </td>
                      <td>
                        <span className="dean-date-text">{hodInfo.date}</span>
                      </td>
                      <td>
                        <span className={`dean-status-pill status-${proc.status?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                          {proc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="dean-btn-approve"
                            style={{ background: isPending ? '#059669' : '#64748b' }}
                            disabled={!isPending}
                            onClick={() => onOpenApprove(proc)}
                          >
                            {isPending ? 'Review' : 'Decided'}
                          </button>
                          <button
                            type="button"
                            className="dean-btn-audit"
                            onClick={() => onOpenAudit(proc)}
                          >
                            View
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

      {/* 5. Main Faculty Approval Queue & History */}
      <div className="dean-toolbar-card">
        <div className="dean-filter-tabs">
          <button
            type="button"
            className={`dean-tab-btn ${filter === 'pending_dean' ? 'active' : ''}`}
            onClick={() => setFilter('pending_dean')}
          >
            Awaiting Dean ({awaitingDeanRequests.length})
          </button>
          <button
            type="button"
            className={`dean-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Submissions ({processes.length})
          </button>
          <button
            type="button"
            className={`dean-tab-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            type="button"
            className={`dean-tab-btn ${filter === 'declined' ? 'active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            Returned / Declined
          </button>
        </div>

        <div className="dean-table-search-box" style={{ maxWidth: '320px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tracking ID, student, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="dean-table-card">
        {isLoading ? (
          <div className="dean-empty-state">
            <div className="dean-spinner"></div>
            <p>Loading Faculty Approval Queue...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="dean-empty-state">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h4>No requests found</h4>
            <p>No petitions matched the selected filter in the Faculty Approval Queue.</p>
          </div>
        ) : (
          <div className="dean-table-wrapper">
            <table className="dean-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Student Name & Reg No</th>
                  <th>Process Title & Subject</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th style={{ textAlign: 'right' }}>Executive Action</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((proc) => {
                  const isPendingMe =
                    (proc.currentAssignedRole === 'dean' || proc.status === 'Pending Dean') &&
                    proc.status !== 'Approved' &&
                    proc.status !== 'Declined';

                  const dept = getDeptBadge(proc);
                  const name = proc.student?.name || proc.studentName || 'Student';
                  const regNo = proc.student?.regNo || proc.registrationNumber || '';
                  const title = proc.title || proc.processTitle;

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="dean-tracking-badge">{proc.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="dean-student-name">{name}</div>
                        <div className="dean-student-reg">{regNo}</div>
                      </td>
                      <td>
                        <div className="dean-proc-title">{title}</div>
                        {proc.details?.courseCodes && proc.details.courseCodes.length > 0 && (
                          <span className="dean-subject-tag">{proc.details.courseCodes[0]}</span>
                        )}
                      </td>
                      <td>
                        <span style={{ background: dept.bg, color: dept.color, fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {dept.code}
                        </span>
                      </td>
                      <td>
                        <span className={`dean-status-pill status-${proc.status?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                          {proc.status}
                        </span>
                      </td>
                      <td>
                        <span className="dean-date-text">{new Date(proc.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <div className="dean-actions-cell">
                          {isPendingMe ? (
                            <>
                              <button
                                type="button"
                                className="dean-btn-approve"
                                onClick={() => onOpenApprove(proc)}
                                title="Approve Request"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="dean-btn-return"
                                onClick={() => onOpenReturn ? onOpenReturn(proc) : null}
                                title="Return for Correction"
                              >
                                Return
                              </button>
                              <button
                                type="button"
                                className="dean-btn-decline"
                                onClick={() => onOpenDecline(proc)}
                                title="Decline Request"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', marginRight: '0.4rem' }}>
                              Decision Sealed
                            </span>
                          )}
                          <button
                            type="button"
                            className="dean-btn-audit"
                            onClick={() => onOpenAudit(proc)}
                          >
                            Details
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
