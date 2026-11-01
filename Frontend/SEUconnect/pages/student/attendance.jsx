import React from 'react';
import './attendance.css';

// Default attendance records matching the SEUConnect live production portal
const ATTENDANCE_RECORDS = [
  {
    code: 'ICT22011',
    title: 'Web Application Development',
    theoryAttended: 7,
    theoryTotal: 8,
    practicalAttended: 6,
    practicalTotal: 7,
    attendedSessions: 13,
    totalSessions: 15,
    percentage: 87,
    isEligible: true
  },
  {
    code: 'ICT22043',
    title: 'Mobile Application Development',
    theoryAttended: 8,
    theoryTotal: 9,
    practicalAttended: 5,
    practicalTotal: 6,
    attendedSessions: 13,
    totalSessions: 15,
    percentage: 87,
    isEligible: true
  },
  {
    code: 'ICT31013',
    title: 'Computer Networks & Security',
    theoryAttended: 9,
    theoryTotal: 10,
    practicalAttended: 4,
    practicalTotal: 5,
    attendedSessions: 13,
    totalSessions: 15,
    percentage: 87,
    isEligible: true
  },
  {
    code: 'ICT31023',
    title: 'Enterprise Architecture & Cloud Systems',
    theoryAttended: 7,
    theoryTotal: 8,
    practicalAttended: 6,
    practicalTotal: 7,
    attendedSessions: 13,
    totalSessions: 15,
    percentage: 87,
    isEligible: true
  },
  {
    code: 'ICT31032',
    title: 'Advanced Database Systems',
    theoryAttended: 8,
    theoryTotal: 9,
    practicalAttended: 5,
    practicalTotal: 6,
    attendedSessions: 13,
    totalSessions: 15,
    percentage: 87,
    isEligible: true
  },
  {
    code: 'ICT31043',
    title: 'Human Computer Interaction (HCI)',
    theoryAttended: 8,
    theoryTotal: 8,
    practicalAttended: 6,
    practicalTotal: 7,
    attendedSessions: 14,
    totalSessions: 15,
    percentage: 93,
    isEligible: true
  }
];

export default function Attendance({ onNavigateMedical }) {
  const overallPercentage = 87;
  const minThreshold = 80;
  const isOverallEligible = overallPercentage >= minThreshold;
  const totalAttended = 13;
  const totalSessions = 15;

  return (
    <div className="attendance-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Attendance & Examination Eligibility</h1>
        <p>Real-time attendance tracking across scheduled theory and practical sessions for End Semester Examination (ESA) qualification.</p>
      </div>

      {/* 2. Top 3 Stat Cards */}
      <section className="grid-3">
        {/* Card 1: Overall Attendance */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">OVERALL ATTENDANCE</span>
              <span className="stat-badge">{isOverallEligible ? 'Eligible for ESA' : 'Ineligible'}</span>
            </div>
            <div className="stat-value">{overallPercentage}%</div>
            <div className="stat-subtext">{totalAttended} of {totalSessions} sessions attended</div>
          </div>
        </div>

        {/* Card 2: Mandatory ESA Threshold */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">MANDATORY ESA<br />THRESHOLD</span>
              <span className="stat-badge stat-badge-multiline">Minimum<br />Req</span>
            </div>
            <div className="stat-value">{minThreshold}%</div>
            <div className="stat-subtext">Faculty Handbook Regulation</div>
          </div>
        </div>

        {/* Card 3: Exam Standing Status */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label stat-label-nowrap">EXAM STANDING STATUS</span>
              <span className="stat-badge">Official Status</span>
            </div>
            <div className="stat-value">{isOverallEligible ? 'Satisfied' : 'Action Required'}</div>
            <div className="stat-subtext">{isOverallEligible ? 'Admission card clearance granted' : 'Submit medical certificate'}</div>
          </div>
        </div>
      </section>

      {/* 3. Faculty Regulation Card */}
      <section className="attendance-regulation-card">
        <div className="attendance-regulation-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <p className="attendance-regulation-text">
          <strong>Faculty of Technology Examination Regulation:</strong> Under Section 8.3 of the Technology Faculty Handbook, an undergraduate candidate must secure not less than <strong>80% attendance</strong> in both theory lectures and laboratory practical sessions. Students with attendance between 60% and 79% may apply for special consideration by submitting an endorsed medical certificate within 7 working days.
        </p>
      </section>

      {/* 4. Subject-wise Attendance Table Card */}
      <section className="seu-card">
        <div className="seu-card-header">
          <h3 className="seu-card-title">Subject-wise Attendance & Eligibility</h3>
          <button
            type="button"
            onClick={onNavigateMedical || (() => alert('Redirecting to Medical Requests section...'))}
            className="btn btn-primary btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Submit Medical Excuse
          </button>
        </div>

        <div className="table-responsive">
          <table className="seu-table">
            <thead>
              <tr>
                <th>SUBJECT CODE</th>
                <th>COURSE TITLE</th>
                <th>THEORY ATTENDANCE</th>
                <th>PRACTICAL ATTENDANCE</th>
                <th>TOTAL ATTENDED</th>
                <th>ATTENDANCE %</th>
                <th>ESA ELIGIBILITY</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE_RECORDS.map((item) => (
                <tr key={item.code}>
                  <td className="course-code-cell">{item.code}</td>
                  <td>{item.title}</td>
                  <td>
                    {item.theoryTotal > 0 ? (
                      <span>{item.theoryAttended} / {item.theoryTotal} ({Math.round((item.theoryAttended / item.theoryTotal) * 100)}%)</span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {item.practicalTotal > 0 ? (
                      <span>{item.practicalAttended} / {item.practicalTotal} ({Math.round((item.practicalAttended / item.practicalTotal) * 100)}%)</span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{item.attendedSessions} / {item.totalSessions}</td>
                  <td>
                    <div className="attendance-progress-wrapper">
                      <div className="attendance-progress-bar-bg">
                        <div
                          className={item.isEligible ? 'attendance-progress-fill-success' : 'attendance-progress-fill-danger'}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="attendance-progress-text">{item.percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.isEligible ? 'badge-success' : 'badge-danger'}`}>
                      {item.isEligible ? 'Eligible' : 'Ineligible (< 80%)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
