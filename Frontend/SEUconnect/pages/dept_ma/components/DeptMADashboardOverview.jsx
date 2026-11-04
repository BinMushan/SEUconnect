import React from 'react';

export default function DeptMADashboardOverview({
  deptInfo,
  students,
  subjects,
  registrations,
  medicalApplications,
  lecturerMedicals = [],
  caApplications = [],
  arPackages = [],
  studentRequests = [],
  mahapolaBursary = [],
  attendanceSubjects,
  notifications,
  auditLog,
  onNavigate,
  onOpenMedicalModal,
}) {
  // 1. Statistics calculations across all 7 official responsibilities
  const totalStudents = students.length;
  const totalSubjects = subjects.length;

  // Resp 1: Student & Lecturer Medicals
  const pendingMedicals = medicalApplications.filter(
    (m) => m.status === 'Pending Verification' || m.status === 'Submitted' || m.status === 'Under Review'
  ).length;
  const pendingLecturerMedicals = lecturerMedicals.filter((m) => m.status === 'Pending Verification').length;

  // Resp 2: CA Applications for In-Charge Signing
  const pendingCASignings = caApplications.filter((c) => c.status === 'Pending MA Verification').length;

  // Resp 3: AR Office Registration Packages
  const pendingARPackages = arPackages.filter((p) => p.status.includes('Pending')).length;

  // Resp 4: 80% Attendance Audit
  const avgDeptAttendance = (
    attendanceSubjects.reduce((acc, curr) => acc + curr.avgAttendance, 0) / (attendanceSubjects.length || 1)
  ).toFixed(1);
  const flaggedAttendanceCount = attendanceSubjects.reduce((acc, curr) => acc + curr.flaggedStudentsCount, 0);

  // Resp 5: Student Request Letters
  const pendingStudentRequests = studentRequests.filter((r) => r.status === 'Pending MA Review').length;

  // Resp 7: Mahapola & Bursary Incomplete / Pending
  const pendingScholarships = mahapolaBursary.filter((s) => s.departmentStatus === 'Incomplete Documents' || s.departmentStatus === 'Under Verification').length;

  return (
    <div className="dept-ma-dashboard-view">
      {/* 1. Header Banner */}
      <div className="dept-ma-header-banner">
        <div className="dept-ma-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span className="dept-ma-badge-pill dept-code">DEPT-MA DESK</span>
            <span className="dept-ma-badge-pill">{deptInfo.currentAcademicYear}</span>
            <span className="dept-ma-badge-pill" style={{ background: 'rgba(56, 189, 248, 0.25)', borderColor: '#38bdf8' }}>
              SEUSL Faculty of Technology
            </span>
          </div>
          <h1>Department Management Assistant Portal</h1>
          <div className="dept-ma-header-sub">
            <span>🏛️ {deptInfo.departmentName}</span>
            <span>•</span>
            <span>👤 Officer: <strong>{deptInfo.assignedMA.name}</strong> ({deptInfo.assignedMA.staffId})</span>
            <span>•</span>
            <span>📍 {deptInfo.location}</span>
          </div>
        </div>

        <div className="dept-ma-header-actions">
          <button
            type="button"
            className="dept-ma-btn-ghost-light"
            onClick={() => onNavigate('medical_applications')}
          >
            Medical Queue ({pendingMedicals + pendingLecturerMedicals})
          </button>
          <button
            type="button"
            className="dept-ma-btn-ghost-light"
            onClick={() => onNavigate('student_requests')}
          >
            Student Requests ({pendingStudentRequests})
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid: All Seven Administrative Responsibilities */}
      <div className="dept-ma-stats-grid">
        {/* Metric 1: Student & Lecturer Medical Applications */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('medical_applications')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Medical Applications</span>
            <div className="dept-ma-stat-icon-wrap amber">🩺</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
            {pendingMedicals + pendingLecturerMedicals}
          </div>
          <div className="dept-ma-stat-sub">
            {pendingMedicals} Student medicals • {pendingLecturerMedicals} Lecturer medicals
          </div>
        </div>

        {/* Metric 2: CA Application Signing Desk */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('subject_registrations')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">CA In-Charge Signings</span>
            <div className="dept-ma-stat-icon-wrap indigo">🖋️</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#4338ca' }}>
            {pendingCASignings}
          </div>
          <div className="dept-ma-stat-sub">
            Continuous Assessment repeat slips awaiting MA verification
          </div>
        </div>

        {/* Metric 3: AR Office Subject Registrations */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('subject_registrations')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">AR Registration Packages</span>
            <div className="dept-ma-stat-icon-wrap blue">📦</div>
          </div>
          <div className="dept-ma-stat-value">{arPackages.length}</div>
          <div className="dept-ma-stat-sub">
            {pendingARPackages > 0 ? `${pendingARPackages} awaiting advisor & HOD sign-off` : 'All packages dispatched'}
          </div>
        </div>

        {/* Metric 4: 80% Attendance Audit */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('attendance_records')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">80% Attendance Audit</span>
            <div className="dept-ma-stat-icon-wrap purple">📊</div>
          </div>
          <div className="dept-ma-stat-value">{avgDeptAttendance}%</div>
          <div className="dept-ma-stat-sub">
            <strong style={{ color: '#b45309' }}>{flaggedAttendanceCount}</strong> students below 80% threshold
          </div>
        </div>

        {/* Metric 5: Student Request Letters */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('student_requests')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Student Request Letters</span>
            <div className="dept-ma-stat-icon-wrap emerald">📬</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
            {studentRequests.length}
          </div>
          <div className="dept-ma-stat-sub">
            {pendingStudentRequests} pending review & departmental routing
          </div>
        </div>

        {/* Metric 6: Mahapola & Bursary Documents */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('mahapola_bursary')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Mahapola & Bursary</span>
            <div className="dept-ma-stat-icon-wrap blue">🎓</div>
          </div>
          <div className="dept-ma-stat-value">{mahapolaBursary.length}</div>
          <div className="dept-ma-stat-sub">
            {pendingScholarships > 0 ? `${pendingScholarships} under verification / incomplete` : 'All certified to Welfare'}
          </div>
        </div>
      </div>

      {/* 3. Quick Operations Toolbar (All buttons without arrow icons) */}
      <div className="dept-ma-quick-actions-bar">
        <div className="dept-ma-quick-actions-title">
          <span>⚡</span>
          <span>Authorized Department MA Quick Operations:</span>
        </div>
        <div className="dept-ma-action-btns-group">
          <button
            type="button"
            className="dept-ma-btn-action primary"
            onClick={() => onNavigate('medical_applications')}
          >
            Medical Applications Desk
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('subject_registrations')}
          >
            Subject Registrations & CA
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('attendance_records')}
          >
            Attendance 80% Audit
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('student_requests')}
          >
            Student Request Letters
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('mahapola_bursary')}
          >
            Mahapola & Bursary
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('department_documents')}
          >
            Department Documents
          </button>
          <button
            type="button"
            className="dept-ma-btn-action emerald"
            onClick={() => onNavigate('reports')}
          >
            Generate Reports
          </button>
        </div>
      </div>

      {/* 4. Two Column Layout: Tasks & Recent Audit Activities */}
      <div className="dept-ma-dashboard-columns">
        {/* Column 1: Pending Tasks & Urgent Action Items */}
        <div className="dept-ma-panel-card">
          <div className="dept-ma-panel-header">
            <div className="dept-ma-panel-title">
              <span>📌</span>
              <span>Pending Tasks & Urgent Actions</span>
            </div>
            <span className="dept-ma-panel-badge">{notifications.filter((n) => !n.read).length} Unresolved</span>
          </div>

          <div className="dept-ma-tasks-list">
            {notifications.slice(0, 4).map((task) => (
              <div key={task.id} className="dept-ma-task-item">
                <div className="dept-ma-task-content">
                  <div className="dept-ma-task-title">{task.title}</div>
                  <div className="dept-ma-task-desc">{task.message}</div>
                  <div className="dept-ma-task-time">🕒 {task.time}</div>
                </div>
                <button
                  type="button"
                  className="dept-ma-task-btn"
                  style={{ whiteSpace: 'nowrap' }}
                  onClick={() => onNavigate(task.actionNav || 'dashboard')}
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Recent Department Audit Log */}
        <div className="dept-ma-panel-card">
          <div className="dept-ma-panel-header">
            <div className="dept-ma-panel-title">
              <span>🛡️</span>
              <span>Recent Department Activities & Ledger</span>
            </div>
            <span className="dept-ma-panel-badge" style={{ background: '#ecfdf5', color: '#047857' }}>
              Audit Verified
            </span>
          </div>

          <div className="dept-ma-tasks-list">
            {auditLog.slice(0, 4).map((log) => (
              <div key={log.id} className="dept-ma-task-item">
                <div className="dept-ma-task-content">
                  <div className="dept-ma-task-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="dept-ma-tracking-pill" style={{ fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                    <span>{log.target}</span>
                  </div>
                  <div className="dept-ma-task-desc">{log.details}</div>
                  <div className="dept-ma-task-time">
                    👤 {log.actor} • 🕒 {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Highlighted Action Desk: Medical Applications Awaiting Verification */}
      <div className="dept-ma-panel-card" style={{ marginBottom: '2rem' }}>
        <div className="dept-ma-panel-header">
          <div className="dept-ma-panel-title">
            <span>🩺</span>
            <span>Subject Medical Applications Awaiting Immediate Verification</span>
          </div>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            onClick={() => onNavigate('medical_applications')}
          >
            View Complete Medical Desk
          </button>
        </div>

        <div className="dept-ma-table-wrapper">
          <table className="dept-ma-table">
            <thead>
              <tr>
                <th>Tracking No</th>
                <th>Student Details</th>
                <th>Subject & Missed Session</th>
                <th>Hospital / Clinic</th>
                <th>14-Day Status</th>
                <th>Application Status</th>
                <th>MA Action</th>
              </tr>
            </thead>
            <tbody>
              {medicalApplications
                .filter((m) => m.status === 'Pending Verification' || m.status === 'Submitted' || m.status === 'Under Review')
                .slice(0, 4)
                .map((app) => (
                  <tr key={app.trackingNumber}>
                    <td>
                      <span className="dept-ma-tracking-pill">{app.trackingNumber}</span>
                    </td>
                    <td>
                      <strong>{app.student.name}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {app.student.regNo} • {app.student.batch}
                      </div>
                    </td>
                    <td>
                      <strong>{app.subject.code}</strong> — {app.subject.name}
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        📅 {app.subject.missedDate} ({app.subject.sessionType})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{app.medical.clinic}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{app.medical.doctor}</div>
                    </td>
                    <td>
                      {app.checklist.submittedWithin14Days ? (
                        <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>
                          ✓ Within {app.checklist.daysElapsed} day(s)
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '700' }}>
                          ⚠️ Exceeded 14 days
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`dept-ma-status-badge ${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="dept-ma-btn-action primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                        onClick={() => onOpenMedicalModal(app)}
                      >
                        Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
