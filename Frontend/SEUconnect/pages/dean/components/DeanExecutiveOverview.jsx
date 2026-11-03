import React, { useState } from 'react';
import { DEPARTMENTS_DATA, FACULTY_STATS, FACULTY_BOARD_MEETINGS, FACULTY_BATCH_BREAKDOWN, getCalculatedBatchTotals } from '../deanData.js';

export default function DeanExecutiveOverview({
  processes,
  pendingDean,
  isLoading,
  onNavigate,
  onOpenAudit,
  onOpenApprove,
  onOpenReturn,
  onOpenDecline,
}) {
  const [filter, setFilter] = useState('pending_dean');
  const [searchQuery, setSearchQuery] = useState('');
  const safeProcesses = Array.isArray(processes) ? processes : [];
  const batchTotals = getCalculatedBatchTotals();

  const displayedProcesses = safeProcesses.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.processTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'pending_dean') {
      return (
        (p.currentAssignedRole === 'dean' || p.status === 'Pending Dean') &&
        p.status !== 'Approved' &&
        p.status !== 'Declined'
      );
    }
    if (filter === 'approved') return p.status === 'Approved';
    if (filter === 'declined') return p.status === 'Declined';
    return true;
  });

  const nextMeeting = FACULTY_BOARD_MEETINGS[0];

  return (
    <div className="dean-dashboard-content">
      {/* 1. TOP 4 DEAN KPI STAT CARDS */}
      <section className="dean-stats-grid">
        <div className="dean-stat-card card-blue" onClick={() => onNavigate('departments')} style={{ cursor: 'pointer' }}>
          <div className="dean-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="dean-stat-body">
            <div className="dean-stat-top-row">
              <span className="dean-stat-title">DEPARTMENTS OVERSEEN</span>
              <span className="dean-stat-badge badge-blue">Faculty</span>
            </div>
            <div className="dean-stat-number">{DEPARTMENTS_DATA.length} Depts</div>
            <div className="dean-stat-target">ICT & BST ({batchTotals.facultyTotal} Students)</div>
          </div>
        </div>

        <div
          className={`dean-stat-card card-amber ${pendingDean.length > 0 ? 'pulse-border' : ''}`}
          onClick={() => onNavigate('dean_sanctions')}
          style={{ cursor: 'pointer' }}
        >
          <div className="dean-stat-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="dean-stat-body">
            <div className="dean-stat-top-row">
              <span className="dean-stat-title" style={pendingDean.length > 0 ? { color: '#b45309' } : {}}>
                PENDING DEAN APPROVAL
              </span>
              <span className="dean-stat-badge badge-amber">{pendingDean.length > 0 ? 'Action Needed' : 'Clear'}</span>
            </div>
            <div className="dean-stat-number" style={pendingDean.length > 0 ? { color: '#92400e' } : {}}>
              {pendingDean.length}
            </div>
            <div className="dean-stat-target">Escalated from HODs & Examination</div>
          </div>
        </div>

        <div className="dean-stat-card card-emerald">
          <div className="dean-stat-icon-wrap icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="dean-stat-body">
            <div className="dean-stat-top-row">
              <span className="dean-stat-title">CONFIRMED REQUESTS</span>
              <span className="dean-stat-badge badge-emerald">Final</span>
            </div>
            <div className="dean-stat-number">
              {processes.filter((p) => p.status === 'Approved').length}
            </div>
            <div className="dean-stat-target">Official Endorsements Granted</div>
          </div>
        </div>

        <div className="dean-stat-card card-rose">
          <div className="dean-stat-icon-wrap icon-rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="dean-stat-body">
            <div className="dean-stat-top-row">
              <span className="dean-stat-title">DECLINED / RETURNED</span>
              <span className="dean-stat-badge badge-rose">Total</span>
            </div>
            <div className="dean-stat-number">
              {processes.filter((p) => p.status === 'Declined').length}
            </div>
            <div className="dean-stat-target">Non-compliant Requests</div>
          </div>
        </div>
      </section>

      {/* 2. DEAN EXECUTIVE DISPATCH QUICK ACTIONS */}
      <section className="dean-quick-actions-bar">
        <div className="dean-quick-actions-label">
          <span className="dean-pulse-indicator"></span>
          <span>Dean Executive Dispatch:</span>
        </div>
        <div className="dean-quick-actions-btns">
          <button type="button" className="dean-quick-action-btn primary" onClick={() => onNavigate('dean_sanctions')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Faculty Approval Desk {pendingDean.length > 0 && <span className="dean-count-pill">{pendingDean.length}</span>}
          </button>

          <button type="button" className="dean-quick-action-btn" onClick={() => onNavigate('academic_calendar')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Faculty Academic Calendar
          </button>

          <button type="button" className="dean-quick-action-btn" onClick={() => onNavigate('faculty_board')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Faculty Board & Senate
          </button>

          <button type="button" className="dean-quick-action-btn" onClick={() => onNavigate('repeat_waivers')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            Exam Board Clearances
          </button>

          <button type="button" className="dean-quick-action-btn warning" onClick={() => onNavigate('special_concessions')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Special Concessions
          </button>

          <button type="button" className="dean-quick-action-btn" onClick={() => onNavigate('digital_seals')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 21h14" />
              <path d="M5 17h14" />
              <path d="M12 3v10" />
              <path d="M7 7l5-4 5 4" />
              <rect x="6" y="13" width="12" height="4" rx="1" />
            </svg>
            Official Sanctions & Seals
          </button>
        </div>
      </section>

      {/* 3. TWO-COLUMN SPLIT: LEFT QUEUE, RIGHT FACULTY VITAL STATS */}
      <div className="dean-dual-grid">
        {/* LEFT COLUMN: Executive Endorsement & Faculty Approval Queue */}
        <section className="dean-table-card">
          <div className="dean-table-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 className="dean-card-title">Executive Endorsement & Faculty Approval Queue</h2>
                <span className="dean-live-tag">Dean Authority</span>
              </div>
              <p className="dean-card-subtitle">
                Exercise final faculty clearance on recommended student petitions, CA repeat policies, and medical concessions.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="dean-filter-row">
              <div className="dean-filter-tabs">
                <button
                  type="button"
                  className={`dean-tab-btn ${filter === 'pending_dean' ? 'active' : ''}`}
                  onClick={() => setFilter('pending_dean')}
                >
                  Awaiting Dean ({pendingDean.length})
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
                  Declined
                </button>
              </div>

              <div className="dean-table-search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tracking ID or student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="dean-empty-state">
              <div className="dean-spinner"></div>
              <p>Synchronizing Faculty Executive Queue...</p>
            </div>
          ) : displayedProcesses.length === 0 ? (
            <div className="dean-empty-state">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <h4>No requests found</h4>
              <p>
                {filter === 'pending_dean'
                  ? 'There are currently no requests requiring executive endorsement under this filter.'
                  : 'No petitions matched the selected filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="dean-table-wrapper">
              <table className="dean-table">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Student Name & Reg No</th>
                    <th>Process Description</th>
                    <th>Prior Endorsements</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProcesses.map((proc) => {
                    const isPendingMe =
                      (proc.currentAssignedRole === 'dean' || proc.status === 'Pending Dean') &&
                      proc.status !== 'Approved' &&
                      proc.status !== 'Declined';

                    const hasHodEndorsement = proc.history?.some((h) => h.role === 'hod');
                    const hasLecEndorsement = proc.history?.some((h) => h.role === 'lecturer');

                    return (
                      <tr key={proc._id || proc.trackingNumber}>
                        <td>
                          <span className="dean-tracking-badge">{proc.trackingNumber}</span>
                        </td>
                        <td>
                          <div className="dean-student-name">{proc.studentName}</div>
                          <div className="dean-student-reg">{proc.registrationNumber}</div>
                        </td>
                        <td>
                          <span className="dean-proc-title">{proc.processTitle}</span>
                          {proc.formData?.subjectCode && (
                            <span className="dean-subject-tag">{proc.formData.subjectCode}</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {hasLecEndorsement && (
                              <span className="dean-endorsement-pill lec">✓ Lecturer</span>
                            )}
                            {hasHodEndorsement && (
                              <span className="dean-endorsement-pill hod">✓ HOD</span>
                            )}
                            {!hasLecEndorsement && !hasHodEndorsement && (
                              <span className="dean-endorsement-pill direct">Direct Appeal</span>
                            )}
                          </div>
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
                            {isPendingMe && (
                              <>
                                <button
                                  type="button"
                                  className="dean-btn-approve"
                                  onClick={() => onOpenApprove(proc)}
                                  title="Grant final Faculty Dean endorsement"
                                >
                                  Grant Approval
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
                                  title="Decline request"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="dean-btn-audit"
                              onClick={() => onOpenAudit(proc)}
                              title="Inspect full lifecycle audit trail"
                            >
                              Audit Trail
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

        {/* RIGHT COLUMN: Faculty Executive Vital Signs & Notice */}
        <aside className="dean-sidebar-widgets">
          {/* Widget 1: Faculty Undergraduates Batch-Wise Breakdown */}
          <div className="dean-card dean-vital-card">
            <div className="dean-card-header">
              <h3 className="dean-card-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Faculty Undergraduates by Batch
              </h3>
              <span className="dean-badge-blue">Total: {batchTotals.facultyTotal}</span>
            </div>

            <div className="dean-batch-list">
              {FACULTY_BATCH_BREAKDOWN.map((b) => (
                <div key={b.batch} className="dean-batch-item-row">
                  <div className="dean-batch-item-label">
                    <span className="dean-batch-item-name">{b.batch}</span>
                    <span className="dean-batch-item-year">{b.year}</span>
                  </div>
                  <div className="dean-batch-counts-group">
                    <span className="dean-batch-dept-chip ict">ICT {b.ict}</span>
                    <span className="dean-batch-dept-chip bst">BST {b.bst}</span>
                    <span className="dean-batch-total-chip">{b.facultyTotal}</span>
                  </div>
                </div>
              ))}
              <div className="dean-batch-card-summary">
                <span style={{ color: '#1e40af', fontWeight: 600 }}>Calculated Faculty Total:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{batchTotals.facultyTotal} Undergrads</strong>
              </div>
            </div>
          </div>

          {/* Widget 2: Faculty Executive Standing (Rebalanced, Research Funding Removed) */}
          <div className="dean-card dean-vital-card">
            <div className="dean-card-header">
              <h3 className="dean-card-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                </svg>
                Faculty Executive Standing
              </h3>
              <span className="dean-badge-blue">SEUSL FOT</span>
            </div>

            <div className="dean-vital-stats-list">
              <div className="dean-vital-row">
                <span className="dean-vital-lbl">Total Undergraduates</span>
                <span className="dean-vital-val" style={{ fontWeight: 700, color: '#0f2b5c' }}>{batchTotals.facultyTotal}</span>
              </div>
              <div className="dean-vital-row">
                <span className="dean-vital-lbl">Academic Staff Cadre</span>
                <span className="dean-vital-val">{FACULTY_STATS.fullTimeAcademicStaff} Lecturers</span>
              </div>
              <div className="dean-vital-row">
                <span className="dean-vital-lbl">Specialized Labs</span>
                <span className="dean-vital-val">{FACULTY_STATS.specializedLaboratories} Facilities</span>
              </div>
              <div className="dean-vital-row">
                <span className="dean-vital-lbl">On-Time Graduation Rate</span>
                <span className="dean-vital-val" style={{ color: '#16a34a' }}>{FACULTY_STATS.onTimeGraduationRate}</span>
              </div>
              <div className="dean-vital-row">
                <span className="dean-vital-lbl">6-Month Employment</span>
                <span className="dean-vital-val" style={{ color: '#2563eb' }}>{FACULTY_STATS.employmentRate6Months}</span>
              </div>
            </div>
          </div>

          {/* Widget 2: Upcoming Faculty Board Sitting */}
          <div className="dean-card dean-meeting-card">
            <div className="dean-card-header">
              <h3 className="dean-card-heading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Next Faculty Board Sitting
              </h3>
              <span className="dean-badge-amber">Upcoming</span>
            </div>

            <div className="dean-meeting-box">
              <h4 className="dean-meeting-num">{nextMeeting.meetingNumber}</h4>
              <p className="dean-meeting-meta">
                📅 {nextMeeting.date} • ⏰ {nextMeeting.time}
              </p>
              <p className="dean-meeting-venue">📍 {nextMeeting.venue}</p>

              <div className="dean-meeting-agenda-preview">
                <strong>Key Agenda:</strong>
                <ul>
                  <li>Semester 1 CA Marks Moderation & Clearances</li>
                  <li>Student Medical & Attendance Appeals</li>
                  <li>Appointment of External Capstone Examiners</li>
                </ul>
              </div>

              <button
                type="button"
                className="dean-btn-outline"
                style={{ width: '100%', marginTop: '0.6rem' }}
                onClick={() => onNavigate('faculty_board')}
              >
                Inspect Board Docket & Papers
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

