import React, { useState } from 'react';
import './academic_progress.css';

const GRADUATION_CHECKLIST = [
  {
    id: 'req-1',
    metric: 'Total Credits Requirement',
    prescribedTarget: '130 Credits',
    candidateStatus: '78 Credits',
    complianceStatus: 'In Progress',
    badgeType: 'in-progress',
    details: 'Completed: Year 1 (30), Year 2 (30), Year 3 Sem 1 (18). Remaining: 52 Credits in Semesters 6, 7 & 8.'
  },
  {
    id: 'req-2',
    metric: 'Minimum CGPA Requirement',
    prescribedTarget: '2.00',
    candidateStatus: '3.58',
    complianceStatus: 'Satisfied',
    badgeType: 'satisfied',
    details: 'Current Cumulative GPA is 3.58, satisfying both the graduation minimum (2.00) and qualifying for Second Class Upper Division.'
  },
  {
    id: 'req-3',
    metric: 'Industrial Training / Internship',
    prescribedTarget: 'Compulsory (6 Credits)',
    candidateStatus: 'Scheduled Sem 7',
    complianceStatus: 'Pending',
    badgeType: 'pending',
    details: '6-month industrial internship scheduled in Semester 7. Industrial Training Division placement process begins Semester 6.'
  },
  {
    id: 'req-4',
    metric: 'Final Year Capstone Project',
    prescribedTarget: 'Compulsory (6 Credits)',
    candidateStatus: 'Scheduled Sem 8',
    complianceStatus: 'Pending',
    badgeType: 'pending',
    details: 'Individual research and industry problem-solving capstone project scheduled across Semesters 7 & 8.'
  },
  {
    id: 'req-5',
    metric: 'Attendance Standing',
    prescribedTarget: 'Min 80%',
    candidateStatus: 'In Standing',
    complianceStatus: 'Satisfied',
    badgeType: 'satisfied',
    details: 'Overall current attendance standing is 87%, exceeding the institutional 80% exam qualification threshold.'
  }
];

export default function StudentAcademicProgress({ user }) {
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  const candidateName = user?.name || 'M.N.M. Afnan';
  const regNo = user?.regNo || '22ICT085';
  const indexNo = user?.indexNo || 'ICT22085';
  const programme = user?.programme ? `${user.programme} (Hons)` : 'BICT (Hons)';

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
            <div className="stat-value">60%</div>
            <div className="stat-subtext">78 / 130 Credits Earned</div>
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
            <div className="stat-value">3.58</div>
            <div className="stat-subtext">Graduation Class: Second Class (Upper Division)</div>
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
            <div className="stat-value">52 Credits</div>
            <div className="stat-subtext">Semesters 6, 7 & 8</div>
          </div>
        </div>
      </section>

      {/* 3. Overall Degree Progress Card */}
      <section className="seu-card progress-meter-card">
        <div className="progress-meter-header">
          <span className="progress-meter-title">
            Overall Degree Progress (BICT - 130 Total Credits)
          </span>
          <span className="progress-meter-percent">
            60% Completed
          </span>
        </div>

        {/* Green Progress Bar Track */}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '60%' }}></div>
        </div>

        {/* 4-Stage Milestones */}
        <div className="progress-milestones-row">
          <span>Year 1 (Completed)</span>
          <span>Year 2 (Completed)</span>
          <span>Year 3 (In Progress)</span>
          <span>Year 4 (Upcoming)</span>
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
              {GRADUATION_CHECKLIST.map((item) => (
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
