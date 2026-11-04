import React, { useState } from 'react';

export default function DeptMAReports({
  students,
  subjects,
  registrations,
  medicalApplications,
  attendanceSubjects,
  deptInfo,
  onShowToast,
}) {
  const [selectedReportType, setSelectedReportType] = useState('STUDENT_ENROLLMENT');
  const [reportBatch, setReportBatch] = useState('ALL');
  const [reportSemester, setReportSemester] = useState('ALL');

  const reportDefinitions = [
    {
      id: 'STUDENT_ENROLLMENT',
      title: 'Department Student Enrollment & Profile Roster',
      desc: 'Comprehensive departmental registry of all enrolled BICT (Hons) undergraduates, academic advisors, and contact data.',
      icon: '👥',
      count: students.length,
    },
    {
      id: 'SUBJECT_REGISTRATIONS',
      title: 'Subject Registration & Prerequisite Compliance Report',
      desc: 'Audit of student course enrollments, verified prerequisite compliance, and identified registration discrepancies.',
      icon: '📚',
      count: registrations.length,
    },
    {
      id: 'MEDICAL_APPLICATIONS',
      title: 'Subject Medical Excuse & Approval Register',
      desc: 'Complete ledger of student medical applications, 14-day rule verification records, digital approval stamps, and rejection causes.',
      icon: '🩺',
      count: medicalApplications.length,
    },
    {
      id: 'ATTENDANCE_80_THRESHOLD',
      title: '80% Statutory Attendance Eligibility Faculty Board Report',
      desc: 'Official departmental attendance analysis factoring in approved medical concessions to determine End-Semester examination eligibility.',
      icon: '📊',
      count: attendanceSubjects.length,
    },
  ];

  const handleExportCSV = (reportId) => {
    try {
      let headers = [];
      let rows = [];
      let fileName = '';

      if (reportId === 'STUDENT_ENROLLMENT') {
        headers = ['Registration No', 'Student ID', 'Full Name', 'Batch', 'Semester', 'Programme', 'CGPA', 'Attendance Rate %', 'Status', 'Advisor'];
        rows = students.map((s) => [
          `"${s.regNo}"`, `"${s.studentId}"`, `"${s.name}"`, `"${s.batch}"`, `"${s.semester}"`, `"${s.programme}"`, `"${s.cgpa}"`, `"${s.attendanceRate}"`, `"${s.status}"`, `"${s.advisor}"`
        ]);
        fileName = `SEU_ICT_Student_Roster_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (reportId === 'SUBJECT_REGISTRATIONS') {
        headers = ['Registration ID', 'Reg No', 'Student Name', 'Batch', 'Subject Code', 'Subject Name', 'Credits', 'Prereq Met', 'Status', 'Verified By'];
        rows = registrations.map((r) => [
          `"${r.id}"`, `"${r.regNo}"`, `"${r.studentName}"`, `"${r.batch}"`, `"${r.subjectCode}"`, `"${r.subjectName}"`, `"${r.credits}"`, `"${r.prerequisiteMet}"`, `"${r.status}"`, `"${r.verifiedBy || 'Unverified'}"`
        ]);
        fileName = `SEU_ICT_Subject_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (reportId === 'MEDICAL_APPLICATIONS') {
        headers = ['Tracking No', 'Reg No', 'Student Name', 'Subject Code', 'Missed Date', 'Days', 'Hospital', 'Doctor', 'Within 14 Days', 'Status', 'Approval Stamp', 'Remarks'];
        rows = medicalApplications.map((m) => [
          `"${m.trackingNumber}"`, `"${m.student.regNo}"`, `"${m.student.name}"`, `"${m.subject.code}"`, `"${m.subject.missedDate}"`, `"${m.subject.daysCount}"`, `"${m.medical.clinic}"`, `"${m.medical.doctor}"`, `"${m.checklist.submittedWithin14Days}"`, `"${m.status}"`, `"${m.decision?.digitalStamp || 'N/A'}"`, `"${m.decision?.remarks || m.decision?.rejectionReason || ''}"`
        ]);
        fileName = `SEU_ICT_Medical_Applications_Register_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        headers = ['Subject Code', 'Subject Name', 'Batch', 'Semester', 'Lecturer', 'Conducted Sessions', 'Avg Attendance %', 'Flagged (<80%)', 'Audit Status'];
        rows = attendanceSubjects.map((a) => [
          `"${a.code}"`, `"${a.name}"`, `"${a.batch}"`, `"${a.semester}"`, `"${a.lecturer}"`, `"${a.conductedSessions}"`, `"${a.avgAttendance}%"`, `"${a.flaggedStudentsCount}"`, `"${a.status}"`
        ]);
        fileName = `SEU_ICT_80_Percent_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast(`Report exported successfully as ${fileName}`, 'success');
    } catch {
      onShowToast('Failed to export report.', 'error');
    }
  };

  const handlePrint = (title) => {
    onShowToast(`Preparing printable document preview for: ${title}...`, 'info');
  };

  return (
    <div className="dept-ma-reports-section">
      {/* 1. Header Toolbar */}
      <div className="dept-ma-toolbar">
        <div className="dept-ma-toolbar-left">
          <select
            className="dept-ma-filter-select"
            value={reportBatch}
            onChange={(e) => setReportBatch(e.target.value)}
          >
            <option value="ALL">All Batches</option>
            {deptInfo.activeBatches.map((b) => (
              <option key={b} value={b}>
                Batch: {b}
              </option>
            ))}
          </select>

          <select
            className="dept-ma-filter-select"
            value={reportSemester}
            onChange={(e) => setReportSemester(e.target.value)}
          >
            <option value="ALL">All Semesters</option>
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 3">Semester 3</option>
            <option value="Semester 4">Semester 4</option>
            <option value="Semester 5">Semester 5</option>
            <option value="Semester 7">Semester 7</option>
          </select>
        </div>

        <div className="dept-ma-toolbar-right">
          <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Authority: <strong>{deptInfo.assignedMA.name}</strong> ({deptInfo.departmentName})
          </span>
        </div>
      </div>

      {/* 2. Report Cards Grid */}
      <div className="dept-ma-reports-grid">
        {reportDefinitions.map((rep) => {
          const isSelected = selectedReportType === rep.id;
          return (
            <div
              key={rep.id}
              className="dept-ma-report-card"
              style={{
                borderColor: isSelected ? '#0284c7' : undefined,
                boxShadow: isSelected ? '0 8px 20px -4px rgba(2, 132, 199, 0.15)' : undefined,
              }}
            >
              <div>
                <div className="dept-ma-report-icon">{rep.icon}</div>
                <h4 className="dept-ma-report-title">{rep.title}</h4>
                <p className="dept-ma-report-desc">{rep.desc}</p>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Total records included: <strong>{rep.count}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="dept-ma-btn-action primary"
                  style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.78rem', justifyContent: 'center' }}
                  onClick={() => handleExportCSV(rep.id)}
                >
                  📥 Export CSV
                </button>
                <button
                  type="button"
                  className="dept-ma-btn-action secondary"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={() => handlePrint(rep.title)}
                >
                  🖨️ Print
                </button>
                <button
                  type="button"
                  className={`dept-ma-btn-action ${isSelected ? 'emerald' : 'secondary'}`}
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={() => setSelectedReportType(rep.id)}
                >
                  {isSelected ? '✓ Previewing' : 'Preview'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Live Report Preview Section */}
      <div className="dept-ma-panel-card">
        <div className="dept-ma-panel-header">
          <div className="dept-ma-panel-title">
            <span>📑</span>
            <span>
              Live Department Report Preview:{' '}
              {reportDefinitions.find((r) => r.id === selectedReportType)?.title}
            </span>
          </div>
          <button
            type="button"
            className="dept-ma-btn-action primary"
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => handleExportCSV(selectedReportType)}
          >
            Download Certified Report File
          </button>
        </div>

        <div style={{ padding: '0.5rem 0' }}>
          {selectedReportType === 'STUDENT_ENROLLMENT' && (
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Full Name</th>
                    <th>Batch</th>
                    <th>Semester</th>
                    <th>CGPA</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                    <th>Advisor</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 6).map((s) => (
                    <tr key={s.regNo}>
                      <td><span className="dept-ma-tracking-pill">{s.regNo}</span></td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.batch}</td>
                      <td>{s.semester}</td>
                      <td>{s.cgpa.toFixed(2)}</td>
                      <td>{s.attendanceRate}%</td>
                      <td><span className="dept-ma-status-badge active">{s.status}</span></td>
                      <td>{s.advisor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReportType === 'SUBJECT_REGISTRATIONS' && (
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Student Name</th>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Credits</th>
                    <th>Status</th>
                    <th>Verified By</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.slice(0, 6).map((r) => (
                    <tr key={r.id}>
                      <td><span className="dept-ma-tracking-pill">{r.id}</span></td>
                      <td><strong>{r.studentName}</strong></td>
                      <td><strong>{r.subjectCode}</strong></td>
                      <td>{r.subjectName}</td>
                      <td>{r.credits}</td>
                      <td><span className="dept-ma-status-badge confirmed">{r.status}</span></td>
                      <td>{r.verifiedBy || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReportType === 'MEDICAL_APPLICATIONS' && (
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Tracking No</th>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Hospital</th>
                    <th>Missed Date</th>
                    <th>Status</th>
                    <th>Digital Stamp</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalApplications.slice(0, 6).map((m) => (
                    <tr key={m.trackingNumber}>
                      <td><span className="dept-ma-tracking-pill">{m.trackingNumber}</span></td>
                      <td><strong>{m.student.name}</strong></td>
                      <td>{m.subject.code}</td>
                      <td>{m.medical.clinic}</td>
                      <td>{m.subject.missedDate}</td>
                      <td>
                        <span className={`dept-ma-status-badge ${m.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>
                        {m.decision?.digitalStamp || 'Pending Decision'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReportType === 'ATTENDANCE_80_THRESHOLD' && (
            <div className="dept-ma-table-wrapper">
              <table className="dept-ma-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Batch</th>
                    <th>Lecturer</th>
                    <th>Conducted</th>
                    <th>Average %</th>
                    <th>Flagged &lt;80%</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSubjects.map((a) => (
                    <tr key={a.code}>
                      <td><span className="dept-ma-tracking-pill">{a.code}</span></td>
                      <td><strong>{a.name}</strong></td>
                      <td>{a.batch}</td>
                      <td>{a.lecturer}</td>
                      <td>{a.conductedSessions}</td>
                      <td><strong>{a.avgAttendance}%</strong></td>
                      <td>{a.flaggedStudentsCount} student(s)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

