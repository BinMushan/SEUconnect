import { useState } from 'react';

export default function AdminOverview({
  stats,
  batches = [],
  registrations,
  medicals,
  auditLogs,
  onNavigate,
  onApproveMedical,
  onRejectMedical,
  onApproveRegistration,
  onOpenAddStudentModal,
  onOpenAnnouncementModal
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const suggestedTags = [
    'Browse 5 Batches',
    'Assign Lecturers & HODs',
    'Approve Medical Certificates',
    'Add/Drop Roster',
    'Repeat Exam Verification',
    'Publish Dean Notice'
  ];

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    if (tag.includes('Batches')) onNavigate('student_management');
    else if (tag.includes('Assign')) onNavigate('users_roles');
    else if (tag.includes('Medical')) onNavigate('attendance_medicals');
    else if (tag.includes('Add/Drop')) onNavigate('semester_registration');
    else if (tag.includes('Repeat')) onNavigate('examinations');
    else if (tag.includes('Notice')) onNavigate('announcements');
    else if (tag.includes('Attendance')) onNavigate('student_management');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase();
    if (q.includes('medical') || q.includes('health') || q.includes('doctor')) {
      onNavigate('attendance_medicals');
    } else if (q.includes('register') || q.includes('subject') || q.includes('add') || q.includes('drop')) {
      onNavigate('semester_registration');
    } else if (q.includes('exam') || q.includes('repeat') || q.includes('esa')) {
      onNavigate('examinations');
    } else if (q.includes('result') || q.includes('gpa') || q.includes('mark')) {
      onNavigate('results_progress');
    } else if (q.includes('notice') || q.includes('announce')) {
      onNavigate('announcements');
    } else if (q.includes('form') || q.includes('voucher') || q.includes('piv')) {
      onNavigate('forms_guidance');
    } else {
      onNavigate('student_management');
    }
  };

  const pendingMedicals = medicals.filter((m) => m.status === 'Pending').slice(0, 3);
  const pendingRegistrations = registrations.filter((r) => r.status === 'Pending').slice(0, 3);

  return (
    <div className="adm-dashboard-container">
      {/* =========================================================
          1. TOP 4 METRIC STAT CARDS
          ========================================================= */}
      <section className="adm-stats-grid">
        {/* Card 1: Intake Batches & Enrolled Students */}
        <div className="adm-stat-card" onClick={() => onNavigate('student_management')} title="Click to view batches and rosters">
          <div className="adm-stat-icon-wrap icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-title">INTAKE BATCHES</span>
              <span className="adm-stat-badge">{batches.length} Batches</span>
            </div>
            <div className="adm-stat-number">{batches.length} Batches</div>
            <div className="adm-stat-target">{stats.totalStudents.toLocaleString()} Enrolled Students</div>
          </div>
        </div>

        {/* Card 2: Pending Medical Requests */}
        <div className="adm-stat-card" onClick={() => onNavigate('attendance_medicals')} title="Click to review pending medicals">
          <div className="adm-stat-icon-wrap icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-title">PENDING MEDICALS</span>
              <span className="adm-stat-badge" style={{ color: '#d97706', borderColor: '#fde68a', background: '#fffbeb' }}>Action Required</span>
            </div>
            <div className="adm-stat-number">{stats.pendingMedicals}</div>
            <div className="adm-stat-target">Awaiting UMO / Officer clearance</div>
          </div>
        </div>

        {/* Card 3: Semester Registration Requests */}
        <div className="adm-stat-card" onClick={() => onNavigate('semester_registration')} title="Click to review registrations">
          <div className="adm-stat-icon-wrap icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-title">SEMESTER REGISTRATIONS</span>
              <span className="adm-stat-badge">Add/Drop Open</span>
            </div>
            <div className="adm-stat-number">{stats.pendingRegistrations}</div>
            <div className="adm-stat-target">21 pending Add/Drop variances</div>
          </div>
        </div>

        {/* Card 4: Exam & ESA Clearance */}
        <div className="adm-stat-card" onClick={() => onNavigate('examinations')} title="Click to view exam eligibility">
          <div className="adm-stat-icon-wrap icon-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="adm-stat-body">
            <div className="adm-stat-top-row">
              <span className="adm-stat-title">EXAM ADMISSIONS</span>
              <span className="adm-stat-badge">ESA Nov 2026</span>
            </div>
            <div className="adm-stat-number">{stats.pendingExamClearance}</div>
            <div className="adm-stat-target">Repeat PIV vouchers verified: 28</div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. ADMINISTRATIVE GUIDANCE & COMMAND SEARCH
          ========================================================= */}
      <section className="adm-guidance-card">
        <div className="adm-guidance-header">
          <div className="adm-guidance-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="adm-guidance-titles">
            <h3 className="adm-guidance-title">Administrative Operations & Faculty Guidance</h3>
            <p className="adm-guidance-subtitle">
              Instant administrative workflow access: Search student records, verify medical excuse slips, configure Add/Drop modules, or issue faculty announcements.
            </p>
          </div>
        </div>

        <form className="adm-guidance-search-bar" onSubmit={handleSearchSubmit}>
          <div className="adm-search-input-box">
            <svg className="adm-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="adm-search-input"
              placeholder='Try "Verify student medicals", "Add new student account", "SEU/IS/22/ICT/091", "ESA Repeat eligibility"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="adm-find-process-btn">
            Execute Workflow
          </button>
        </form>

        <div className="adm-suggested-row">
          <span className="adm-suggested-label">Quick Jump:</span>
          {suggestedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="adm-suggested-chip"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          3. MIDDLE GRID: PRIORITY APPROVAL QUEUE & QUICK ACTIONS
          ========================================================= */}
      <section className="adm-middle-grid">
        {/* Left: Priority Approval Queue */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-heading">
              Priority Approval & Verification Queue
              <span className="adm-badge-counter">{pendingMedicals.length + pendingRegistrations.length} Pending</span>
            </h3>
            <button
              type="button"
              className="adm-btn-xs-secondary"
              onClick={() => onNavigate('attendance_medicals')}
            >
              View All Requests
            </button>
          </div>

          <div className="adm-queue-list">
            {/* Medical Excuse Items */}
            {pendingMedicals.map((item) => (
              <div key={item.id} className="adm-queue-item">
                <div className="adm-queue-item-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="adm-badge adm-badge-warning">Medical Excuse</span>
                    <span className="adm-queue-item-title">{item.studentName} ({item.regNo})</span>
                  </div>
                  <span className="adm-queue-item-meta">
                    Period: {item.period} • Diagnosis: {item.diagnosis} • Att: {item.attendanceBefore}% &rarr; {item.attendanceAfterApproval}%
                  </span>
                </div>
                <div className="adm-queue-actions">
                  <button
                    type="button"
                    className="adm-btn-xs-primary"
                    onClick={() => onApproveMedical(item.id)}
                    title="Approve Medical Certificate"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="adm-btn-xs-secondary"
                    onClick={() => onRejectMedical(item.id)}
                    title="Reject Medical Certificate"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {/* Registration Items */}
            {pendingRegistrations.map((item) => (
              <div key={item.id} className="adm-queue-item">
                <div className="adm-queue-item-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="adm-badge adm-badge-info">Add / Drop</span>
                    <span className="adm-queue-item-title">{item.studentName} ({item.regNo})</span>
                  </div>
                  <span className="adm-queue-item-meta">
                    {item.programme} • {item.semester} • Total Load: {item.totalCredits} Credits • {item.remarks || 'Standard Enrollment'}
                  </span>
                </div>
                <div className="adm-queue-actions">
                  <button
                    type="button"
                    className="adm-btn-xs-primary"
                    onClick={() => onApproveRegistration(item.id)}
                    title="Approve Module Enrollment"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="adm-btn-xs-secondary"
                    onClick={() => onNavigate('semester_registration')}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Administrative Operations */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-heading">Quick Operations</h3>
          </div>

          <div className="adm-actions-list">
            <button
              type="button"
              className="adm-action-btn"
              onClick={() => onNavigate('student_management')}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              <span className="adm-action-label">Browse 5 Batches (Batch-First View)</span>
              <span className="adm-action-badge">{batches.length} Batches</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={() => onNavigate('users_roles')}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="adm-action-label">Assign Lecturers, HODs, Dean & Roles</span>
              <span className="adm-action-badge">Delegate</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={onOpenAddStudentModal}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </span>
              <span className="adm-action-label">Add New Student Profile</span>
              <span className="adm-action-badge">+ Create</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={onOpenAnnouncementModal}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <span className="adm-action-label">Broadcast Faculty Announcement</span>
              <span className="adm-action-badge">Notice</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={() => onNavigate('examinations')}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </span>
              <span className="adm-action-label">Clear Repeat Exam Candidates</span>
              <span className="adm-action-badge">ESA</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={() => onNavigate('results_progress')}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </span>
              <span className="adm-action-label">SGPA / CGPA Ledger & Dean&apos;s List</span>
              <span className="adm-action-badge">Results</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={() => onNavigate('forms_guidance')}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <span className="adm-action-label">Faculty Forms & PIV Voucher Manager</span>
              <span className="adm-action-badge">6 Forms</span>
            </button>

            <button
              type="button"
              className="adm-action-btn"
              onClick={() => onNavigate('welfare_scholarships')}
            >
              <span className="adm-action-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </span>
              <span className="adm-action-label">Mahapola & Welfare Grants Audit</span>
              <span className="adm-action-badge">Welfare</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. RECENT FACULTY AUDIT TRAIL & SYSTEM LOG
          ========================================================= */}
      <section className="adm-card">
        <div className="adm-card-header">
          <h3 className="adm-card-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Recent Faculty Administrative Activity & Audit Trail
          </h3>
          <span className="adm-badge adm-badge-neutral">Real-Time Security Feed</span>
        </div>

        <div className="adm-audit-list">
          {auditLogs.map((log) => (
            <div key={log.id} className="adm-audit-item">
              <div className="adm-audit-dot" />
              <div className="adm-audit-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="adm-audit-action">{log.action}</span>
                  <span className="adm-audit-time">{log.time}</span>
                </div>
                <span className="adm-audit-detail">{log.detail}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Actor: {log.user}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
