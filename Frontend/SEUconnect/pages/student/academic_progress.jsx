import React, { useState } from 'react';
import { getCurriculumBySemester } from '../../src/services/curriculumData.js';
import './academic_progress.css';

// Safe number formatting helper
const safeToFixed = (val, decimals = 2, fallback = 'N/A') => {
  if (val === null || val === undefined || val === '' || val === '—' || val === 'N/A') return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num.toFixed(decimals) : fallback;
};

export default function StudentAcademicProgress({ user }) {
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const candidateName = user?.name || user?.fullName || 'Undergraduate Student';
  const regNo = user?.regNo || user?.studentId || '—';
  const indexNo = user?.indexNo || user?.regNo || '—';
  const programme = user?.programme ? `${user.programme} (Hons)` : 'BICT (Hons)';

  const isFreshers = Boolean(
    user?.isFreshers ||
    (user?.semester || '').toLowerCase().includes('sem 1') ||
    (user?.semester || '').toLowerCase().includes('sem 01') ||
    (user?.semester || '').toLowerCase().includes('fresh')
  );

  const curriculum = getCurriculumBySemester(user?.semester);
  const progData = (user?.progressionData && user.progressionData.length > 0)
    ? user.progressionData
    : (curriculum?.progressionData || []);

  const totalCredits = 130;
  const creditsEarned = isFreshers ? 0 : progData.reduce((sum, p) => sum + (Number(p.credits) || 0), 0);
  const creditsRemaining = Math.max(0, totalCredits - creditsEarned);
  const completionRate = Math.min(100, Math.round((creditsEarned / totalCredits) * 100));

  const validProgSgpa = progData.length > 0 && progData[progData.length - 1].sgpa !== null
    ? Number(progData[progData.length - 1].sgpa)
    : null;
  const rawCgpa = user?.cgpa !== undefined && user?.cgpa !== null ? user.cgpa : validProgSgpa;
  const candidateCgpa = isFreshers || rawCgpa === null ? 'N/A' : safeToFixed(rawCgpa, 2, 'N/A');
  const classStanding = isFreshers || candidateCgpa === 'N/A'
    ? 'Enrolled (In Progress)'
    : Number(candidateCgpa) >= 3.70
      ? 'First Class Standing'
      : Number(candidateCgpa) >= 3.30
        ? 'Second Class (Upper Division)'
        : 'General Degree Standing';

  const currentYearNum = curriculum?.yearNumber || 1;

  const graduationChecklist = [
    {
      id: 'req-1',
      metric: 'Total Credits Requirement',
      prescribedTarget: '130 Credits',
      candidateStatus: `${creditsEarned} Credits`,
      complianceStatus: creditsEarned >= 130 ? 'Satisfied' : 'In Progress',
      badgeType: creditsEarned >= 130 ? 'satisfied' : 'in-progress',
      details: `Completed: ${creditsEarned} credits across registered semesters. Remaining: ${creditsRemaining} credits to graduate.`
    },
    {
      id: 'req-2',
      metric: 'Minimum CGPA Requirement',
      prescribedTarget: '2.00',
      candidateStatus: candidateCgpa,
      complianceStatus: Number(candidateCgpa) >= 2.00 ? 'Satisfied' : 'Action Required',
      badgeType: Number(candidateCgpa) >= 2.00 ? 'satisfied' : 'pending',
      details: `Current Cumulative GPA is ${candidateCgpa}, satisfying the graduation minimum (2.00) and qualifying for ${classStanding}.`
    },
    {
      id: 'req-3',
      metric: 'Industrial Training / Internship',
      prescribedTarget: 'Compulsory (6 Credits)',
      candidateStatus: currentYearNum >= 4 ? 'Completed' : 'Scheduled Sem 7',
      complianceStatus: currentYearNum >= 4 ? 'Satisfied' : 'Pending',
      badgeType: currentYearNum >= 4 ? 'satisfied' : 'pending',
      details: '6-month industrial internship scheduled in Semester 7. Placement process coordinated via Department Industrial Training Liaison.'
    },
    {
      id: 'req-4',
      metric: 'Final Year Capstone Project',
      prescribedTarget: 'Compulsory (6 Credits)',
      candidateStatus: currentYearNum >= 4 ? 'In Progress' : 'Scheduled Sem 8',
      complianceStatus: currentYearNum >= 4 ? 'In Progress' : 'Pending',
      badgeType: currentYearNum >= 4 ? 'in-progress' : 'pending',
      details: 'Individual research and industry problem-solving capstone project scheduled across Semesters 7 & 8.'
    },
    {
      id: 'req-5',
      metric: 'Attendance Standing',
      prescribedTarget: 'Min 80%',
      candidateStatus: 'In Standing',
      complianceStatus: 'Satisfied',
      badgeType: 'satisfied',
      details: 'Overall current attendance standing is above 80%, exceeding the institutional exam qualification threshold.'
    }
  ];

  const getComplianceBadgeClass = (badgeType) => {
    switch (badgeType) {
      case 'satisfied':
        return 'progress-badge badge-satisfied';
      case 'in-progress':
        return 'progress-badge badge-in-progress';
      case 'pending':
        return 'progress-badge badge-pending';
      default:
        return 'progress-badge';
    }
  };

  return (
    <div className="progress-page-container">
      {/* 1. Page Header */}
      <div className="page-header">
        <h1>Academic Progression & Degree Audit</h1>
        <p>Progress tracking towards degree completion requirements for Bachelor of Information and Communication Technology (BICT Hons).</p>
      </div>

      {/* 2. Top 3 Metric Stat Cards */}
      <section className="grid-3">
        {/* Card 1: Degree Completion Rate */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">DEGREE COMPLETION RATE</span>
              <span className="stat-badge stat-badge-subtle">Degree Audit</span>
            </div>
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-subtext">{creditsEarned} / {totalCredits} Credits Earned</div>
          </div>
        </div>

        {/* Card 2: Cumulative CGPA */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">CUMULATIVE CGPA</span>
              <span className="stat-badge stat-badge-subtle">Standing</span>
            </div>
            <div className="stat-value">{candidateCgpa}</div>
            <div className="stat-subtext">Graduation Class: {classStanding}</div>
          </div>
        </div>

        {/* Card 3: Remaining Credit Load */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-header-row">
              <span className="stat-label">REMAINING CREDIT LOAD</span>
              <span className="stat-badge stat-badge-subtle">To Graduate</span>
            </div>
            <div className="stat-value">{creditsRemaining} Credits</div>
            <div className="stat-subtext">{creditsRemaining > 0 ? `${creditsRemaining} Credits Remaining across Upcoming Semesters` : 'Graduation Credit Requirement Satisfied'}</div>
          </div>
        </div>
      </section>

      {/* 3. Overall Degree Progress Card */}
      <section className="seu-card progress-meter-card">
        <div className="progress-meter-header">
          <span className="progress-meter-title">
            Overall Degree Progress (BICT - {totalCredits} Total Credits)
          </span>
          <span className="progress-meter-percent">
            {completionRate}% Completed
          </span>
        </div>

        {/* Green Progress Bar Track */}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
        </div>

        {/* 4-Stage Milestones */}
        <div className="progress-milestones-row">
          <span>Year 1 {currentYearNum > 1 ? '(Completed)' : currentYearNum === 1 ? '(In Progress)' : '(Upcoming)'}</span>
          <span>Year 2 {currentYearNum > 2 ? '(Completed)' : currentYearNum === 2 ? '(In Progress)' : '(Upcoming)'}</span>
          <span>Year 3 {currentYearNum > 3 ? '(Completed)' : currentYearNum === 3 ? '(In Progress)' : '(Upcoming)'}</span>
          <span>Year 4 {currentYearNum >= 4 ? '(In Progress)' : '(Upcoming)'}</span>
        </div>
      </section>

      {/* 4. Institutional Graduation Checklist Card */}
      <section className="seu-card progress-table-card">
        <div className="seu-card-header">
          <h2 className="seu-card-title">Institutional Graduation Checklist</h2>
        </div>

        <div className="table-responsive">
          <table className="seu-table progress-table">
            <thead>
              <tr>
                <th>REQUIREMENT METRIC</th>
                <th>PRESCRIBED TARGET</th>
                <th>CANDIDATE STATUS</th>
                <th>COMPLIANCE STATUS</th>
              </tr>
            </thead>
            <tbody>
              {graduationChecklist.map((item) => (
                <tr
                  key={item.id}
                  className="progress-table-row"
                  onClick={() => setSelectedRequirement(item)}
                  title="Click to view detailed requirement guidance"
                >
                  <td className="prog-cell-metric">
                    <strong>{item.metric}</strong>
                  </td>
                  <td className="prog-cell-target">{item.prescribedTarget}</td>
                  <td className="prog-cell-status">{item.candidateStatus}</td>
                  <td className="prog-cell-compliance">
                    <span className={getComplianceBadgeClass(item.badgeType)}>
                      {item.complianceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          MODAL: REQUIREMENT DETAILS
          ==================================================================== */}
      {selectedRequirement && (
        <div className="exam-modal-overlay" onClick={() => setSelectedRequirement(null)}>
          <div className="exam-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <div className="exam-modal-title">
                {selectedRequirement.metric}
              </div>
              <button
                type="button"
                className="exam-modal-close-btn"
                onClick={() => setSelectedRequirement(null)}
              >
                &times;
              </button>
            </div>

            <div className="exam-modal-body">
              <div className="exam-modal-alert">
                <span className="exam-modal-alert-icon">ℹ</span>
                <span>{selectedRequirement.details}</span>
              </div>

              <div className="exam-form-group-grid">
                <div>
                  <label className="exam-form-label">Prescribed University Target</label>
                  <input
                    type="text"
                    className="exam-form-input readonly-input"
                    value={selectedRequirement.prescribedTarget}
                    readOnly
                  />
                </div>
                <div>
                  <label className="exam-form-label">Candidate Current Standing</label>
                  <input
                    type="text"
                    className="exam-form-input readonly-input"
                    value={selectedRequirement.candidateStatus}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="exam-form-label">Compliance Status</label>
                <div style={{ marginTop: '6px' }}>
                  <span className={getComplianceBadgeClass(selectedRequirement.badgeType)}>
                    {selectedRequirement.complianceStatus}
                  </span>
                </div>
              </div>

              <div className="exam-modal-footer">
                <button
                  type="button"
                  onClick={() => setSelectedRequirement(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
