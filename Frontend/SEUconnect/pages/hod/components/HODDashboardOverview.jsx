import React, { useState, useEffect } from 'react';
import { ICT_DEPARTMENT_INFO } from '../hodData.js';
import api, { provisionedUserStorage } from '../../../src/services/api.js';

export default function HODDashboardOverview({
  processes = [],
  pendingHOD = [],
  isLoading,
  onNavigate,
  onOpenAudit,
  onOpenEndorse,
  onOpenReturn,
  onOpenDecline,
}) {
  const [filter, setFilter] = useState('pending_hod');
  const [searchQuery, setSearchQuery] = useState('');
  const [cadreCount, setCadreCount] = useState(ICT_DEPARTMENT_INFO.stats.academicCadre);

  useEffect(() => {
    let cancelled = false;
    api.getDirectory({ role: 'lecturer' }).then((res) => {
      if (!cancelled && res && res.data && Array.isArray(res.data)) {
        const prov = (provisionedUserStorage.getAll() || []).filter((u) => u.role?.toLowerCase().includes('lecturer'));
        setCadreCount(Math.max(ICT_DEPARTMENT_INFO.stats.academicCadre, res.data.length + prov.length));
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const safeProcesses = Array.isArray(processes) ? processes : [];
  const safePendingHOD = Array.isArray(pendingHOD) ? pendingHOD : [];

  // 1. Calculate dynamic numerical statistics from real database records (Section C)
  const recentlySubmitted = safeProcesses.filter((p) => {
    return p.status === 'Pending Lecturer' || p.status === 'Draft' || p.currentStageIndex === 1;
  });

  const returnedRequests = safeProcesses.filter((p) => {
    return p.status === 'Returned for Correction' || p.status?.toLowerCase().includes('return');
  });

  const endorsedToDean = safeProcesses.filter((p) => {
    const hasHodStage = p.stages?.some(
      (s) => (s.role === 'hod' || s.stageKey?.includes('hod')) && s.status === 'COMPLETED'
    );
    const hasHodAudit = p.auditLog?.some(
      (a) => a.action === 'ENDORSED' || a.actorRole?.toLowerCase().includes('hod') || a.comment?.toLowerCase().includes('endorsed')
    );
    const hasHodHistory = p.history?.some((h) => h.role === 'hod');
    return hasHodStage || hasHodAudit || hasHodHistory || p.status === 'Pending Dean';
  });

  const completedApprovals = safeProcesses.filter((p) => {
    return p.status === 'Approved';
  });

  // Calculate elapsed time awaiting Dean
  const getElapsedTime = (dateStr) => {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  // Helper to determine Dean approval status text & class
  const getDeanApprovalStatus = (proc) => {
    if (proc.status === 'Approved') {
      return { label: 'Approved by Dean', className: 'status-approved', color: '#15803d', bg: '#dcfce7' };
    }
    if (proc.status === 'Declined') {
      return { label: 'Rejected by Dean', className: 'status-declined', color: '#b91c1c', bg: '#fee2e2' };
    }
    if (proc.status === 'Returned for Correction') {
      return { label: 'Returned by Dean', className: 'status-returned', color: '#b45309', bg: '#fef3c7' };
    }
    return { label: 'Awaiting Dean Review', className: 'status-pending-dean', color: '#1e40af', bg: '#dbeafe' };
  };

  // Filtered list for the main queue table
  const displayedProcesses = safeProcesses.filter((p) => {
    const nameStr = p.student?.name || p.studentName || '';
    const regStr = p.student?.regNo || p.registrationNumber || '';
    const titleStr = p.title || p.processTitle || '';
    const trackStr = p.trackingNumber || '';

    const matchesSearch =
      !searchQuery ||
      trackStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      titleStr.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending_hod') {
      return (
        (p.currentAssignedRole === 'hod' || p.status === 'Pending HOD') &&
        p.status !== 'Approved' &&
        p.status !== 'Declined'
      );
    }
    if (filter === 'endorsed') {
      return endorsedToDean.some(e => (e._id && e._id === p._id) || e.trackingNumber === p.trackingNumber);
    }
    if (filter === 'approved') return p.status === 'Approved';
    if (filter === 'declined') return p.status === 'Declined' || p.status === 'Returned for Correction';
    return true;
  });

  return (
    <div className="hod-dashboard-content">
      {/* 1. TOP 4 HOD KPI STAT CARDS (Calculated from Actual DB Records) */}
      <section className="hod-stats-grid">
        <div className="hod-stat-card card-blue" onClick={() => onNavigate('academic_staff')} style={{ cursor: 'pointer' }}>
          <div className="hod-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="hod-stat-body">
            <div className="hod-stat-top-row">
              <span className="hod-stat-title">DEPARTMENT INSTRUCTORS</span>
              <span className="hod-stat-badge badge-blue">ICT Dept</span>
            </div>
            <div className="hod-stat-number">{cadreCount} Staff</div>
            <div className="hod-stat-target">Academic & Demonstrators</div>
          </div>
        </div>

        <div
          className={`hod-stat-card card-amber ${pendingHOD.length > 0 ? 'pulse-border' : ''}`}
          onClick={() => setFilter('pending_hod')}
          style={{ cursor: 'pointer' }}
        >
          <div className="hod-stat-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="hod-stat-body">
            <div className="hod-stat-top-row">
              <span className="hod-stat-title">AWAITING HOD SIGN-OFF</span>
              <span className="hod-stat-badge badge-amber">{pendingHOD.length > 0 ? 'Urgent' : 'Clear'}</span>
            </div>
            <div className="hod-stat-number">{pendingHOD.length}</div>
            <div className="hod-stat-target">Escalated from Course Lecturers</div>
          </div>
        </div>

        <div
          className="hod-stat-card card-emerald"
          onClick={() => setFilter('endorsed')}
          style={{ cursor: 'pointer' }}
        >
          <div className="hod-stat-icon-wrap icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="hod-stat-body">
            <div className="hod-stat-top-row">
              <span className="hod-stat-title">ENDORSED TO DEAN</span>
              <span className="hod-stat-badge badge-emerald">Forwarded</span>
            </div>
            <div className="hod-stat-number">{endorsedToDean.length}</div>
            <div className="hod-stat-target">Transferred for Faculty Clearance</div>
          </div>
        </div>

        <div
          className="hod-stat-card card-purple"
          onClick={() => setFilter('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="hod-stat-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 16" />
            </svg>
          </div>
          <div className="hod-stat-body">
            <div className="hod-stat-top-row">
              <span className="hod-stat-title">TOTAL DEPT PETITIONS</span>
              <span className="hod-stat-badge badge-purple">2025/26</span>
            </div>
            <div className="hod-stat-number">{processes.length}</div>
            <div className="hod-stat-target">All Recorded Processes</div>
          </div>
        </div>
      </section>

      {/* 2. HOD FAST DISPATCH ACTION BAR */}
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#0f2b5c' }}>
          <span>⚡ HOD Executive Dispatch:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="hod-btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={() => onNavigate('pending_hod_approvals')}>
            ✓ Approvals Desk ({pendingHOD.length})
          </button>
          <button type="button" className="hod-btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={() => onNavigate('student_roster')}>
            👥 Undergraduates Directory (337)
          </button>
          <button type="button" className="hod-btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', color: '#1e40af', borderColor: '#93c5fd', background: '#eff6ff' }} onClick={() => onNavigate('department_calendar')}>
            📅 Department Academic Calendar (5 Batches)
          </button>
          <button type="button" className="hod-btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem', color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }} onClick={() => onNavigate('department_timetable')}>
            ⏰ Batch Timetable
          </button>
          <button type="button" className="hod-btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }} onClick={() => onNavigate('attendance_audit')}>
            📊 Attendance Audit
          </button>
        </div>
      </section>

      {/* 2. SECTION C: ADDITIONAL HOD COMMAND CENTER NUMERICAL SUMMARY CARDS */}
      <section style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
          <div className="hod-card" style={{ padding: '0.85rem 1.1rem', margin: 0, borderLeft: '3.5px solid #3b82f6' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Recently Submitted
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>{recentlySubmitted.length}</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Awaiting Lecturer Review</span>
            </div>
          </div>

          <div className="hod-card" style={{ padding: '0.85rem 1.1rem', margin: 0, borderLeft: '3.5px solid #f59e0b' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Returned for Corrections
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{returnedRequests.length}</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Pending Student Resubmission</span>
            </div>
          </div>

          <div className="hod-card" style={{ padding: '0.85rem 1.1rem', margin: 0, borderLeft: '3.5px solid #10b981' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Recently Endorsed
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>{endorsedToDean.length}</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Transferred to Dean Office</span>
            </div>
          </div>

          <div className="hod-card" style={{ padding: '0.85rem 1.1rem', margin: 0, borderLeft: '3.5px solid #8b5cf6' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Completed Approvals
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6d28d9' }}>{completedApprovals.length}</span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Full Faculty Sanction</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION A: AWAITING HOD SIGN-OFF */}
      <section className="hod-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
        <div className="hod-card-header" style={{ paddingBottom: '0.65rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                CATEGORY A
              </span>
              <h3 className="hod-card-heading" style={{ fontSize: '1.1rem', margin: 0 }}>
                Awaiting HOD Sign-Off ({pendingHOD.length})
              </h3>
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Petitions verified by course lecturers awaiting final departmental review and endorsement by HOD M.J Ahamed Sabani
            </p>
          </div>
        </div>

        {pendingHOD.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            ✓ No requests currently awaiting HOD sign-off. All lecturer escalations processed.
          </div>
        ) : (
          <div className="hod-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="hod-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Lecturer / Staff / Student</th>
                  <th>Department</th>
                  <th>Request Type</th>
                  <th>Submission Date</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingHOD.map((proc) => {
                  const reqType = (proc.type || 'Academic Request').replace('_', ' ').toUpperCase();
                  const name = proc.student?.name || proc.studentName || 'Student';
                  const regNo = proc.student?.regNo || proc.registrationNumber || '';
                  const deptName = proc.student?.department || 'Department of ICT';

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="hod-tracking-badge" style={{ fontWeight: 700 }}>
                          {proc.trackingNumber}
                        </span>
                      </td>
                      <td>
                        <div className="hod-student-name">{name}</div>
                        <div className="hod-student-reg">{regNo}</div>
                      </td>
                      <td>
                        <span style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          ICT
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
                        <span className="hod-date-text">{proc.createdAt ? new Date(proc.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </td>
                      <td>
                        <span className="hod-status-pill status-pending-hod">
                          Pending HOD Sign-off
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="hod-btn-endorse"
                            onClick={() => onOpenEndorse(proc)}
                            title="Review details and endorse to Dean"
                          >
                            Review & Sign Off
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
      </section>

      {/* 4. SECTION B: ENDORSED TO DEAN */}
      <section className="hod-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #10b981' }}>
        <div className="hod-card-header" style={{ paddingBottom: '0.65rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ background: '#d1fae5', color: '#065f46', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                CATEGORY B
              </span>
              <h3 className="hod-card-heading" style={{ fontSize: '1.1rem', margin: 0 }}>
                Endorsed to Dean ({endorsedToDean.length})
              </h3>
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Requests endorsed by HOD M.J Ahamed Sabani and forwarded to Faculty Executive Office (Dean Prof. Rifai Kariapper)
            </p>
          </div>
        </div>

        {endorsedToDean.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            No requests currently endorsed to Dean.
          </div>
        ) : (
          <div className="hod-table-wrapper" style={{ border: 'none', boxShadow: 'none' }}>
            <table className="hod-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Lecturer / Staff / Student</th>
                  <th>Department</th>
                  <th>Request Type</th>
                  <th>HOD Endorsement Date</th>
                  <th>Dean Approval Status</th>
                  <th>Time Spent Awaiting Dean</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {endorsedToDean.map((proc) => {
                  const reqType = (proc.type || 'Academic Request').replace('_', ' ').toUpperCase();
                  const name = proc.student?.name || proc.studentName || 'Student';
                  const regNo = proc.student?.regNo || proc.registrationNumber || '';
                  const deanStatus = getDeanApprovalStatus(proc);
                  
                  // Endorsement timestamp
                  const hodStage = proc.stages?.find(s => s.role === 'hod');
                  const hodDate = hodStage?.actionDate || proc.updatedAt || proc.createdAt;
                  const elapsed = getElapsedTime(hodDate);

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="hod-tracking-badge">{proc.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="hod-student-name">{name}</div>
                        <div className="hod-student-reg">{regNo}</div>
                      </td>
                      <td>
                        <span style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          ICT
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                          {reqType}
                        </span>
                      </td>
                      <td>
                        <span className="hod-date-text">{new Date(hodDate).toLocaleDateString()}</span>
                      </td>
                      <td>
                        <span style={{ background: deanStatus.bg, color: deanStatus.color, fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                          {deanStatus.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                          {elapsed}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="hod-btn-audit"
                          onClick={() => onOpenAudit(proc)}
                          title="View Full Approval History & Decision"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. MAIN DEPARTMENTAL VERIFICATION & ESCALATION QUEUE */}
      <section className="hod-table-card">
        <div className="hod-table-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 className="hod-card-title">Departmental Verification & Escalation Dashboard</h2>
              <span className="hod-live-tag">Live Feed</span>
            </div>
            <p className="hod-card-subtitle">
              Endorse verified medical appeals and academic requests before escalating to the Dean&apos;s Office.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="hod-filter-row">
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
                Endorsed to Dean ({endorsedToDean.length})
              </button>
              <button
                type="button"
                className={`hod-tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Dept Requests ({processes.length})
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

            {/* Search Bar */}
            <div className="hod-table-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Filter student or tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="hod-empty-state">
            <div className="hod-spinner"></div>
            <p>Synchronizing Department Verification Queue...</p>
          </div>
        ) : displayedProcesses.length === 0 ? (
          <div className="hod-empty-state">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h4>No requests found</h4>
            <p>There are currently no requests requiring endorsement under this filter.</p>
          </div>
        ) : (
          <div className="hod-table-wrapper">
            <table className="hod-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Student & Reg No</th>
                  <th>Process Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProcesses.map((proc) => {
                  const isPendingMe =
                    (proc.currentAssignedRole === 'hod' || proc.status === 'Pending HOD') &&
                    proc.status !== 'Approved' &&
                    proc.status !== 'Declined';

                  const name = proc.student?.name || proc.studentName;
                  const regNo = proc.student?.regNo || proc.registrationNumber;

                  return (
                    <tr key={proc._id || proc.trackingNumber}>
                      <td>
                        <span className="hod-tracking-badge">{proc.trackingNumber}</span>
                      </td>
                      <td>
                        <div className="hod-student-name">{name}</div>
                        <div className="hod-student-reg">{regNo}</div>
                      </td>
                      <td>
                        <div className="hod-proc-title">{proc.title || proc.processTitle}</div>
                        {proc.details?.courseCodes && proc.details.courseCodes.length > 0 && (
                          <span className="hod-subject-tag">{proc.details.courseCodes[0]}</span>
                        )}
                      </td>
                      <td>
                        <span className={`hod-status-pill status-${proc.status?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                          {proc.status}
                        </span>
                      </td>
                      <td>
                        <span className="hod-date-text">{proc.createdAt ? new Date(proc.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </td>
                      <td>
                        <div className="hod-actions-cell">
                          {isPendingMe ? (
                            <>
                              <button
                                type="button"
                                className="hod-btn-endorse"
                                onClick={() => onOpenEndorse(proc)}
                                title="Endorse and forward to Faculty Dean"
                              >
                                Endorse
                              </button>
                              <button
                                type="button"
                                className="hod-btn-return"
                                onClick={() => onOpenReturn ? onOpenReturn(proc) : null}
                                title="Return for Correction"
                              >
                                Return
                              </button>
                              <button
                                type="button"
                                className="hod-btn-decline"
                                onClick={() => onOpenDecline(proc)}
                                title="Decline with official minute"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', marginRight: '0.4rem' }}>
                              Endorsement Recorded
                            </span>
                          )}
                          <button
                            type="button"
                            className="hod-btn-audit"
                            onClick={() => onOpenAudit(proc)}
                            title="Inspect full lifecycle audit trail"
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
      </section>
    </div>
  );
}
