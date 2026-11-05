import React, { useState, useMemo } from 'react';
import { INITIAL_STUDENT_ATTENDANCE_SWT21022 } from '../deptMaData.js';

export default function DeptMAAttendance({
  attendanceSubjects,
  deptInfo,
  onShowToast,
}) {
  const [selectedSubject, setSelectedSubject] = useState(attendanceSubjects[0] || null);
  const [filterBatch, setFilterBatch] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterThreshold, setFilterThreshold] = useState('ALL');
  const [searchStudent, setSearchStudent] = useState('');

  // Options
  const batches = useMemo(() => ['ALL', ...deptInfo.activeBatches], [deptInfo]);
  const semesters = ['ALL', 'Semester 3', 'Semester 4', 'Semester 6'];

  // Filtered subjects list
  const filteredSubjects = useMemo(() => {
    return attendanceSubjects.filter((s) => {
      if (filterBatch !== 'ALL' && s.batch !== filterBatch) return false;
      if (filterSemester !== 'ALL' && s.semester !== filterSemester) return false;
      return true;
    });
  }, [attendanceSubjects, filterBatch, filterSemester]);

  // Department average and flagged counts
  const overallAvg = (
    attendanceSubjects.reduce((acc, s) => acc + s.avgAttendance, 0) / (attendanceSubjects.length || 1)
  ).toFixed(1);

  const totalFlagged = attendanceSubjects.reduce((acc, s) => acc + s.flaggedStudentsCount, 0);
  const pendingLecturerSubmissions = attendanceSubjects.filter((s) => s.pendingLecturerEntry);

  // Student list for selected subject with dynamic 80% threshold calculation
  const studentList = useMemo(() => {
    const conducted = selectedSubject?.conductedSessions || 24;
    return INITIAL_STUDENT_ATTENDANCE_SWT21022.map((stu) => {
      const attended = stu.attended;
      const medical = stu.medical || 0;
      const effectiveRate = Math.min(100, Number((((attended + medical) / conducted) * 100).toFixed(1)));
      const status = effectiveRate >= 80 ? 'ELIGIBLE' : effectiveRate >= 70 ? 'AT_RISK' : 'BARRED';
      return {
        ...stu,
        total: conducted,
        effectiveRate,
        status,
      };
    });
  }, [selectedSubject]);

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

  // Export Subject Roster
  const handleExportAttendanceReport = () => {
    try {
      const headers = [
        'Subject Code',
        'Subject Name',
        'Batch',
        'Semester',
        'Course Lecturer',
        'Conducted Sessions',
        'Average Attendance %',
        'Flagged (<80%)',
        'Audit Standing',
      ];
      const rows = filteredSubjects.map((s) => [
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
      link.setAttribute('download', `SEUConnect_Attendance_Summary_${deptInfo.departmentCode}_${filterBatch}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('Department attendance report exported as CSV.', 'success');
    } catch {
      onShowToast('Failed to export attendance report.', 'error');
    }
  };

  // Export Student 80% Standing Roster for Selected Subject
  const handleExportStudentRosterCSV = () => {
    try {
      const headers = [
        'Registration No',
        'Student Full Name',
        'Subject Code',
        'Total Lectures (N)',
        'Sessions Attended (P)',
        'Approved Medicals (M)',
        'Effective Attendance Rate % [(P+M)/N*100]',
        '80% Threshold Status',
        'End-Semester Examination Qualification',
      ];
      const rows = filteredStudentList.map((stu) => [
        `"${stu.regNo}"`,
        `"${stu.name}"`,
        `"${selectedSubject?.code || 'SWT21022'}"`,
        `"${stu.total}"`,
        `"${stu.attended}"`,
        `"${stu.medical || 0}"`,
        `"${stu.effectiveRate.toFixed(1)}%"`,
        `"${stu.status}"`,
        `"${stu.status === 'ELIGIBLE' ? 'Qualified' : stu.status === 'AT_RISK' ? 'Conditional Warning' : 'Barred - Requires Senate Concession'}"`,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SEUConnect_80Percent_Audit_${selectedSubject?.code || 'SWT21022'}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast(`Student 80% attendance standing roster for ${selectedSubject?.code} exported.`, 'success');
    } catch {
      onShowToast('Failed to export student standing roster.', 'error');
    }
  };

  return (
    <div className="dept-ma-attendance-section">
      {/* 1. Official Responsibility Header with KaTeX KaTeX/Formula Banner */}
      <div className="dept-ma-panel-card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="dept-ma-badge-pill dept-code">RESPONSIBILITY 4</span>
              <span className="dept-ma-badge-pill">80% STATUTORY AUDIT DESK</span>
            </div>
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: '700', color: '#0f172a' }}>
              Calculating 80% Attendance & Examination Qualification
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Statutory Formula: <strong>Attendance % = [(Attended Classes + Approved Medical Excuses) / Total Eligible Conducted Classes] × 100</strong>.
              Audit students against the mandatory 80% threshold and identify at-risk candidates for Faculty Board review.
            </p>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              fontSize: '0.8rem',
              color: '#334155',
            }}
          >
            🔒 <strong>Audit Mode:</strong> Lecturer-submitted records are strictly locked. Dept MA verifies calculations and reports standing without unauthorized modifications.
          </div>
        </div>
      </div>

      {/* 2. Pending Lecturer Entry Alert */}
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

      {/* 3. Top Summary KPI Cards */}
      <div className="dept-ma-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="dept-ma-stat-card">
          <div className="dept-ma-stat-top">
            <span className="dept-ma-stat-label">Department Average Attendance</span>
            <div className="dept-ma-stat-icon-wrap emerald">📈</div>
          </div>
          <div className="dept-ma-stat-value" style={{ color: '#047857' }}>
            {overallAvg}%
          </div>
          <div className="dept-ma-stat-sub">Across all {attendanceSubjects.length} curriculum modules</div>
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
          <div className="dept-ma-stat-sub">Active curriculum in ICT Department</div>
        </div>
      </div>

      {/* 4. Subject Attendance Overview Table */}
      <div className="dept-ma-panel-card" style={{ marginBottom: '2rem' }}>
        <div className="dept-ma-panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="dept-ma-panel-title">
              <span>📊</span>
              <span>Subject-wise Attendance Tracking & 80% Audit Status</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              Filter by batch or semester to generate focused audit reports.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="dept-ma-filter-select"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Batches' : `Batch: ${b}`}
                </option>
              ))}
            </select>

            <select
              className="dept-ma-filter-select"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem === 'ALL' ? 'All Semesters' : sem}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="dept-ma-btn-action secondary"
              onClick={handleExportAttendanceReport}
            >
              Export Subject Summary (CSV)
            </button>
          </div>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((sub) => {
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

      {/* 5. Drill-Down: Student Attendance Standing Roster for Selected Subject */}
      {selectedSubject && (
        <div className="dept-ma-panel-card">
          <div className="dept-ma-panel-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div className="dept-ma-panel-title">
                <span>👥</span>
                <span>
                  Student Attendance Standing: <strong>{selectedSubject.code}</strong> — {selectedSubject.name}
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Batch: {selectedSubject.batch} • Course Lecturer: {selectedSubject.lecturer} • Conducted Sessions: {selectedSubject.conductedSessions}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="dept-ma-search-input"
                style={{ width: '180px', paddingLeft: '0.85rem' }}
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

              <button
                type="button"
                className="dept-ma-btn-action secondary"
                onClick={handleExportStudentRosterCSV}
              >
                Export Student Roster (CSV)
              </button>
            </div>
          </div>

          <div className="dept-ma-table-wrapper dept-ma-standing-table-wrapper">
            <table className="dept-ma-table dept-ma-standing-table">
              <thead>
                <tr>
                  <th className="col-reg-no">Reg No</th>
                  <th className="col-student-name">Student Full Name</th>
                  <th className="col-total-lectures">Total Sessions (N)</th>
                  <th className="col-sessions-attended">Attended (P)</th>
                  <th className="col-approved-medicals">Approved Medicals (M)</th>
                  <th className="col-effective-rate">Effective Rate %</th>
                  <th className="col-statutory-standing">80% Statutory Standing</th>
                  <th className="col-notes">Concession & Exam Qualification</th>
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
                        {stu.status === 'ELIGIBLE' && (
                          <span style={{ color: '#059669', fontWeight: '600' }}>
                            Qualified for End-Semester Exam
                          </span>
                        )}
                        {stu.status === 'AT_RISK' && (
                          <span style={{ color: '#b45309', fontWeight: '600' }}>
                            Warning issued; medical excuse reconciliation required
                          </span>
                        )}
                        {stu.status === 'BARRED' && (
                          <span style={{ color: '#dc2626', fontWeight: '700' }}>
                            Barred — Requires Faculty Board Special Concession
                          </span>
                        )}
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
