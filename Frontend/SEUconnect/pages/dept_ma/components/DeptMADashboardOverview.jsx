import React from 'react';

export default function DeptMADashboardOverview({
  deptInfo,
  students,
  subjects,
  registrations,
  medicalApplications,
  attendanceSubjects,
  notifications,
  auditLog,
  onNavigate,
  onOpenMedicalModal,
}) {
  // Statistics calculations
  const totalStudents = students.length;
  const totalSubjects = subjects.length;
  const pendingMedicals = medicalApplications.filter(
    (m) => m.status === 'Pending Verification' || m.status === 'Submitted' || m.status === 'Under Review'
  ).length;
  const approvedMedicals = medicalApplications.filter((m) => m.status === 'Approved').length;
  const rejectedMedicals = medicalApplications.filter((m) => m.status === 'Rejected').length;

  const avgDeptAttendance = (
    attendanceSubjects.reduce((acc, curr) => acc + curr.avgAttendance, 0) / (attendanceSubjects.length || 1)
  ).toFixed(1);

  const flaggedAttendanceCount = attendanceSubjects.reduce((acc, curr) => acc + curr.flaggedStudentsCount, 0);

  const pendingRegistrationsCount = registrations.filter(
    (r) => r.status === 'Pending Verification' || r.status === 'Incomplete Documents'
  ).length;

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
            📋 Medical Queue ({pendingMedicals})
          </button>
          <button
            type="button"
            className="dept-ma-btn-ghost-light"
            onClick={() => onNavigate('reports')}
          >
            📊 Department Reports
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="dept-ma-stats-grid">
        {/* Metric 1: Total Students */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('students')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Total Department Students</span>
            <div className="dept-ma-stat-icon-wrap blue">👥</div>
          </div>
          <div className="dept-ma-stat-value">{totalStudents}</div>
          <div className="dept-ma-stat-sub">
            Across <strong>{deptInfo.activeBatches.length}</strong> active batches in BICT (Hons)
          </div>
        </div>

        {/* Metric 2: Registered Subjects */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('subject_registrations')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Registered Subjects</span>
            <div className="dept-ma-stat-icon-wrap indigo">📚</div>
          </div>
          <div className="dept-ma-stat-value">{totalSubjects}</div>
          <div className="dept-ma-stat-sub">
            <strong>{pendingRegistrationsCount}</strong> registrations require MA verification
          </div>
        </div>

        {/* Metric 3: Pending Subject Medicals */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('medical_applications')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Pending Medical Applications</span>
            <div className="dept-ma-stat-icon-wrap amber">🩺</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
            {pendingMedicals}
          </div>
          <div className="dept-ma-stat-sub">
            Awaiting <strong>14-day rule verification</strong> & approval
          </div>
        </div>

        {/* Metric 4: Approved & Rejected Medicals */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('medical_applications')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Processed Medicals</span>
            <div className="dept-ma-stat-icon-wrap emerald">✅</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
            {approvedMedicals + rejectedMedicals}
          </div>
          <div className="dept-ma-stat-sub">
            <span style={{ color: '#059669', fontWeight: '700' }}>{approvedMedicals} Approved</span>
            <span>•</span>
            <span style={{ color: '#dc2626', fontWeight: '700' }}>{rejectedMedicals} Rejected</span>
          </div>
        </div>

        {/* Metric 5: Attendance Summary */}
        <div className="dept-ma-stat-card" onClick={() => onNavigate('attendance_records')}>
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Attendance Standing</span>
            <div className="dept-ma-stat-icon-wrap purple">📊</div>
          </div>
          <div className="dept-ma-stat-value">{avgDeptAttendance}%</div>
          <div className="dept-ma-stat-sub">
            <strong>{flaggedAttendanceCount}</strong> students below statutory 80% threshold
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Toolbar */}
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
            🩺 Verify Medical Queue
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('subject_registrations')}
          >
            📝 Validate Registrations
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('attendance_records')}
          >
            📈 Track 80% Attendance
          </button>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={() => onNavigate('department_documents')}
          >
            📁 Department Documents
          </button>
          <button
            type="button"
            className="dept-ma-btn-action emerald"
            onClick={() => onNavigate('reports')}
          >
            📑 Generate Reports
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
            <span className="dept-ma-panel-badge">{notifications.filter(n => !n.read).length} Unresolved</span>
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

