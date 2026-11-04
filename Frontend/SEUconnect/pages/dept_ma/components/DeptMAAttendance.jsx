import React, { useState, useMemo } from 'react';
import { INITIAL_STUDENT_ATTENDANCE_SWT21022 } from '../deptMaData.js';

export default function DeptMAAttendance({
  attendanceSubjects,
  deptInfo,
  onShowToast,
}) {
  const [selectedSubject, setSelectedSubject] = useState(attendanceSubjects[0] || null);
  const [filterThreshold, setFilterThreshold] = useState('ALL');
  const [searchStudent, setSearchStudent] = useState('');

  // Calculate departmental averages
  const overallAvg = (
    attendanceSubjects.reduce((acc, s) => acc + s.avgAttendance, 0) / (attendanceSubjects.length || 1)
  ).toFixed(1);

  const totalFlagged = attendanceSubjects.reduce((acc, s) => acc + s.flaggedStudentsCount, 0);

  const pendingLecturerSubmissions = attendanceSubjects.filter((s) => s.pendingLecturerEntry);

  // Student list for selected subject
  const studentList = INITIAL_STUDENT_ATTENDANCE_SWT21022;

  const filteredStudentList = useMemo(() => {
    const q = searchStudent.trim().toLowerCase();
    return studentList.filter((s) => {
      if (q && !s.regNo.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) {
        return false;
      }
      if (filterThreshold === 'ELIGIBLE' && s.effectiveRate < 80) return false;
      if (filterThreshold === 'AT_RISK' && (s.effectiveRate >= 80 || s.effectiveRate < 70)) return false;
      if (filterThreshold === 'BARRED' && s.effectiveRate >= 70) return false;
      return true;
    });
  }, [studentList, searchStudent, filterThreshold]);

  const handleExportAttendanceReport = () => {
    try {
      const headers = ['Subject Code', 'Subject Name', 'Batch', 'Semester', 'Lecturer', 'Conducted Sessions', 'Average Attendance %', 'Flagged (<80%)', 'Status'];
      const rows = attendanceSubjects.map((s) => [
        `"${s.code}"`,
        `"${s.name}"`,
        `"${s.batch}"`,
        `"${s.semester}"`,
        `"${s.lecturer}"`,
        `"${s.conductedSessions}"`,
        `"${s.avgAttendance}%"`,
        `"${s.flaggedStudentsCount}"`,
        `"${s.status}"`,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SEUConnect_Attendance_Summary_${deptInfo.departmentCode}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Department attendance report exported as CSV.', 'success');
    } catch {
      onShowToast('Failed to export attendance report.', 'error');
    }
  };

  return (
    <div className="dept-ma-attendance-section">
      {/* 1. Missing Lecturer Entry Alert */}
      {pendingLecturerSubmissions.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <strong style={{ color: '#92400e', fontSize: '0.94rem' }}>
                Pending Lecturer Attendance Submissions ({pendingLecturerSubmissions.length})
              </strong>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.15rem' }}>
                Sessions conducted on recent dates have missing attendance entries from Course Lecturers:{' '}
                {pendingLecturerSubmissions.map((s) => `${s.code} (${s.pendingDate})`).join(', ')}.
              </div>
            </div>
          </div>

          <button
            type="button"
            className="dept-ma-btn-action secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            onClick={() => onShowToast('Automated reminder sent to Course Lecturers.', 'info')}
          >
            Send Lecturer Reminder
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Department Average Attendance</span>
            <div className="dept-ma-stat-icon-wrap emerald">📈</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
            {overallAvg}%
          </div>
          <div className="dept-ma-stat-sub">Across all {attendanceSubjects.length} taught subjects</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Students Below 80% Threshold</span>
            <div className="dept-ma-stat-icon-wrap amber">⚠️</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#b45309' }}>
            {totalFlagged}
          </div>
          <div className="dept-ma-stat-sub">At risk of examination debarment without medical excuse</div>
        </div>

        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Audited Subjects</span>
            <div className="dept-ma-stat-icon-wrap blue">📚</div>
          </div>
          <div className="dept-ma-stat-value">{attendanceSubjects.length}</div>
          <div className="dept-ma-stat-sub">ICT Department Active Curriculum</div>
        </div>
      </div>

      {/* 3. Subject Attendance Overview Table */}
      <div className="dept-ma-panel-card" style={{ marginBottom: '2rem' }}>
        <div className="dept-ma-panel-header">
          <div className="dept-ma-panel-title">
            <span>📊</span>
            <span>Subject-wise Attendance Tracking & 80% Audit Status</span>
          </div>
          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={handleExportAttendanceReport}
          >
            📥 Export Attendance Summary (CSV)
          </button>
        </div>

        <div className="dept-ma-table-wrapper">
          <table className="dept-ma-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th>Batch & Semester</th>
                <th>Course Lecturer</th>
                <th>Conducted</th>
                <th>Average Attendance</th>
                <th>Flagged &lt;80%</th>
                <th>Audit Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceSubjects.map((sub) => {
                const isSelected = selectedSubject?.code === sub.code;
                return (
                  <tr
                    key={sub.code}
                    style={{ background: isSelected ? 'rgba(2, 132, 199, 0.05)' : undefined }}
                  >
                    <td>
                      <span className="dept-ma-tracking-pill">{sub.code}</span>
                    </td>
                    <td>
                      <strong>{sub.name}</strong>
                    </td>
                    <td>
                      {sub.batch} • {sub.semester}
                    </td>
                    <td>{sub.lecturer}</td>
                    <td>
                      <strong>{sub.conductedSessions}</strong> sessions
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: '800',
                          color: sub.avgAttendance >= 80 ? '#059669' : '#b45309',
                        }}
                      >
                        {sub.avgAttendance}%
                      </span>
                    </td>
                    <td>
                      {sub.flaggedStudentsCount > 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: '700' }}>
                          ⚠️ {sub.flaggedStudentsCount} student(s)
                        </span>
                      ) : (
                        <span style={{ color: '#059669', fontWeight: '600' }}>0 Flagged</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`dept-ma-status-badge ${
                          sub.status === 'Excellent' || sub.status === 'Good Standing'
                            ? 'active'
                            : 'pending'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`dept-ma-btn-action ${isSelected ? 'primary' : 'secondary'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                        onClick={() => setSelectedSubject(sub)}
                      >
                        {isSelected ? 'Viewing Students' : 'View Student Roster'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Drill-Down: Student Attendance Roster for Selected Subject */}
      {selectedSubject && (
        <div className="dept-ma-panel-card">
          <div className="dept-ma-panel-header">
            <div>
              <div className="dept-ma-panel-title">
                <span>👥</span>
                <span>
                  Student Attendance Standing: <strong>{selectedSubject.code}</strong> — {selectedSubject.name}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Batch: {selectedSubject.batch} • Lecturer: {selectedSubject.lecturer} • Statutory Regulation: 80% Minimum Attendance
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                className="dept-ma-search-input"
                style={{ width: '200px', paddingLeft: '0.85rem' }}
                placeholder="Filter student..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />

              <select
                className="dept-ma-filter-select"
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(e.target.value)}
              >
                <option value="ALL">All Standings</option>
                <option value="ELIGIBLE">Eligible (&gt;= 80%)</option>
                <option value="AT_RISK">At Risk (70% - 79%)</option>
                <option value="BARRED">Barred (&lt; 70%)</option>
              </select>
            </div>
          </div>

          <div className="dept-ma-table-wrapper dept-ma-standing-table-wrapper">
            <table className="dept-ma-table dept-ma-standing-table">
              <thead>
                <tr>
                  <th className="col-reg-no">Reg No</th>
                  <th className="col-student-name">Student Full Name</th>
                  <th className="col-total-lectures">Total Lectures</th>
                  <th className="col-sessions-attended">Sessions Attended</th>
                  <th className="col-approved-medicals">Approved Medicals</th>
                  <th className="col-effective-rate">Effective Attendance %</th>
                  <th className="col-statutory-standing">80% Statutory Standing</th>
                  <th className="col-notes">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudentList.map((stu) => (
                    <tr key={stu.regNo}>
                      <td className="col-reg-no">
                        <span className="dept-ma-tracking-pill">{stu.regNo}</span>
                      </td>
                      <td className="col-student-name">
                        <strong>{stu.name}</strong>
                      </td>
                      <td className="col-total-lectures">{stu.total}</td>
                      <td className="col-sessions-attended">{stu.attended}</td>
                      <td className="col-approved-medicals">
                        {stu.medical > 0 ? (
                          <span style={{ color: '#0284c7', fontWeight: '700' }}>
                            +{stu.medical} Excused
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>0</span>
                        )}
                      </td>
                      <td className="col-effective-rate">
                        <strong
                          style={{
                            fontSize: '0.94rem',
                            color: stu.effectiveRate >= 80 ? '#059669' : stu.effectiveRate >= 70 ? '#b45309' : '#dc2626',
                          }}
                        >
                          {stu.effectiveRate.toFixed(1)}%
                        </strong>
                      </td>
                      <td className="col-statutory-standing">
                        <span
                          className={`dept-ma-status-badge ${
                            stu.status === 'ELIGIBLE'
                              ? 'eligible'
                              : stu.status === 'AT_RISK'
                              ? 'at-risk'
                              : 'barred'
                          }`}
                        >
                          {stu.status}
                        </span>
                      </td>
                      <td className="col-notes">
                        {stu.status === 'ELIGIBLE' && 'Qualified for End Semester Exam'}
                        {stu.status === 'AT_RISK' && 'Warning issued; pending medical justification'}
                        {stu.status === 'BARRED' && 'Requires Faculty Board Concession'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

