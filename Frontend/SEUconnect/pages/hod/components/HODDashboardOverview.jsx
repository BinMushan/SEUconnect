import React, { useState } from 'react';
import { DEPARTMENT_CIRCULARS, ICT_DEPARTMENT_INFO } from '../hodData.js';

export default function HODDashboardOverview({
  processes,
  pendingHOD,
  isLoading,
  onNavigate,
  onOpenAudit,
  onOpenEndorse,
  onOpenDecline,
}) {
  const [filter, setFilter] = useState('pending_hod');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedProcesses = processes.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.processTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending_hod') {
      return (
        (p.currentAssignedRole === 'hod' || p.status === 'Pending HOD') &&
        p.status !== 'Approved' &&
        p.status !== 'Declined'
      );
    }
    if (filter === 'endorsed') {
      return p.history?.some((h) => h.role === 'hod');
    }
    if (filter === 'approved') return p.status === 'Approved';
    if (filter === 'declined') return p.status === 'Declined';
    return true;
  });

  return (
    <div className="hod-dashboard-content">
      {/* 1. TOP 4 HOD KPI STAT CARDS */}
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
            <div className="hod-stat-number">{ICT_DEPARTMENT_INFO.stats.academicCadre} Staff</div>
            <div className="hod-stat-target">12 Academic Lecturers & 6 Demonstrators</div>
          </div>
        </div>

        <div
          className={`hod-stat-card card-amber ${pendingHOD.length > 0 ? 'pulse-border' : ''}`}
          onClick={() => onNavigate('pending_hod_approvals')}
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
              <span className="hod-stat-badge badge-amber">{pendingHOD.length > 0 ? 'Action Needed' : 'Clear'}</span>
            </div>
            <div className="hod-stat-number">{pendingHOD.length}</div>
            <div className="hod-stat-target">Escalated from Course Lecturers</div>
          </div>
        </div>

        <div className="hod-stat-card card-emerald">
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
            <div className="hod-stat-number">
              {processes.filter((p) => p.history?.some((h) => h.role === 'hod')).length}
            </div>
            <div className="hod-stat-target">Transferred for Faculty Board Clearance</div>
          </div>
        </div>

        <div className="hod-stat-card card-purple" onClick={() => onNavigate('student_roster')} style={{ cursor: 'pointer' }}>
          <div className="hod-stat-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="hod-stat-body">
            <div className="hod-stat-top-row">
              <span className="hod-stat-title">TOTAL UNDERGRADUATES</span>
              <span className="hod-stat-badge badge-purple">4 Batches</span>
            </div>
            <div className="hod-stat-number">{ICT_DEPARTMENT_INFO.stats.totalUndergraduates} Students</div>
            <div className="hod-stat-target">BICT (Hons) Registered Cadre</div>
          </div>
        </div>
      </section>

      {/* 2. HOD QUICK COMMAND SHORTCUT BAR */}
      <section className="hod-quick-actions-bar">
        <div className="hod-quick-actions-label">
          <span className="hod-pulse-indicator"></span>
          <span>HOD Executive Dispatch:</span>
        </div>
        <div className="hod-quick-actions-btns">
          <button type="button" className="hod-quick-action-btn primary" onClick={() => onNavigate('pending_hod_approvals')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Review Approvals Desk {pendingHOD.length > 0 && <span className="hod-count-pill">{pendingHOD.length}</span>}
          </button>

          <button type="button" className="hod-quick-action-btn" onClick={() => onNavigate('ca_moderation')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Moderate CA Marks (14 Modules)
          </button>

          <button type="button" className="hod-quick-action-btn" onClick={() => onNavigate('attendance_audit')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            80% Attendance Audit
          </button>

          <button type="button" className="hod-quick-action-btn warning" onClick={() => onNavigate('faculty_escalations')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            Escalate to Dean
          </button>

          <button type="button" className="hod-quick-action-btn" onClick={() => onNavigate('department_reports')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Board Minutes Archive
          </button>
        </div>
      </section>

      {/* 3. TWO-COLUMN SPLIT: LEFT QUEUE, RIGHT DEPARTMENT VITAL STATS */}
      <div className="hod-dual-grid">
        {/* LEFT COLUMN: Departmental Verification & Escalation Dashboard */}
        <section className="hod-table-card">
          <div className="hod-table-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="hod-card-title">Departmental Verification & Escalation Queue</h2>
                <span className="hod-live-tag">Live Feed</span>
              </div>
              <p className="hod-card-subtitle">
                Endorse verified student medical appeals, CA repeat forms, and academic requests for Dean clearance.
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
                  Endorsed by HOD
                </button>
                <button
                  type="button"
                  className={`hod-tab-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Dept ({processes.length})
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
              <h4>No requests pending in this view</h4>
              <p>
                {filter === 'pending_hod'
                  ? 'All student petitions escalated from course lecturers have been verified and processed.'
                  : 'No petitions match the selected filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="hod-table-wrapper">
              <table className="hod-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Student & Reg No</th>
                    <th>Process Title</th>
                    <th>Lecturer Recommendation</th>
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
                            <span className="hod-lec-pending">Direct Escalation</span>
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
                                  title="Endorse and forward to Faculty Dean"
                                >
                                  Endorse & Forward
                                </button>
                                <button
                                  type="button"
                                  className="hod-btn-decline"
                                  onClick={() => onOpenDecline(proc)}
                                  title="Decline with official minute"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="hod-btn-audit"
                              onClick={() => onOpenAudit(proc)}
                              title="Inspect full lifecycle audit trail"
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
        </section>

        {/* RIGHT COLUMN: Department Vital Statistics & Quality Compliance */}
        <aside className="hod-sidebar-widgets">
          {/* Card A: Department Status & Quality Compliance */}
          <div className="hod-card hod-quality-card">
            <div className="hod-card-header">
              <h3 className="hod-card-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="m16.24 7.76 2.83-2.83" />
                </svg>
                Department Quality Standing
              </h3>
              <span className="hod-semester-pill">2025/26 Sem 1</span>
            </div>

            <div className="hod-compliance-items">
              <div className="hod-compliance-row">
                <div className="hod-comp-label">
                  <span>CA Marks Submission Rate</span>
                  <span className="hod-comp-val">85.7%</span>
                </div>
                <div className="hod-progress-bar">
                  <div className="hod-progress-fill" style={{ width: '85.7%', background: '#2563eb' }}></div>
                </div>
                <div className="hod-comp-sub">12 of 14 course modules submitted on time</div>
              </div>

              <div className="hod-compliance-row">
                <div className="hod-comp-label">
                  <span>80% Attendance ESA Eligibility</span>
                  <span className="hod-comp-val">91.4%</span>
                </div>
                <div className="hod-progress-bar">
                  <div className="hod-progress-fill" style={{ width: '91.4%', background: '#10b981' }}></div>
                </div>
                <div className="hod-comp-sub">384 of 420 students cleared for End Semester Exams</div>
              </div>

              <div className="hod-compliance-row">
                <div className="hod-comp-label">
                  <span>Semester Curriculum Progress</span>
                  <span className="hod-comp-val">Week 11 / 15</span>
                </div>
                <div className="hod-progress-bar">
                  <div className="hod-progress-fill" style={{ width: '73.3%', background: '#f59e0b' }}></div>
                </div>
                <div className="hod-comp-sub">Lectures conclude 2026-11-28</div>
              </div>
            </div>

            <div className="hod-quick-metric-boxes">
              <div className="hod-mini-stat">
                <span className="hod-mini-num">100%</span>
                <span className="hod-mini-label">Staff On-Duty</span>
              </div>
              <div className="hod-mini-stat">
                <span className="hod-mini-num">4</span>
                <span className="hod-mini-label">Labs Operational</span>
              </div>
              <div className="hod-mini-stat">
                <span className="hod-mini-num">24</span>
                <span className="hod-mini-label">Publications</span>
              </div>
            </div>
          </div>

          {/* Card B: Department Circulars & Executive Notices */}
          <div className="hod-card">
            <div className="hod-card-header">
              <h3 className="hod-card-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Departmental Circulars
              </h3>
              <button type="button" className="hod-link-btn" onClick={() => onNavigate('department_reports')}>
                View Archive
              </button>
            </div>

            <div className="hod-circulars-list">
              {DEPARTMENT_CIRCULARS.map((circ) => (
                <div key={circ.id} className="hod-circular-item">
                  <div className="hod-circ-top">
                    <span className="hod-circ-badge">{circ.category}</span>
                    <span className="hod-circ-date">{circ.date}</span>
                  </div>
                  <h4 className="hod-circ-title">{circ.title}</h4>
                  <p className="hod-circ-body">{circ.body}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
