import React, { useState } from 'react';
import { REPEAT_EXAM_CANDIDATES } from '../hodData.js';

export default function RepeatExamEndorsements({ onNavigate }) {
  const [candidates, setCandidates] = useState(REPEAT_EXAM_CANDIDATES);
  const [feedback, setFeedback] = useState('');

  const handleEndorse = (id) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hodStatus: 'Endorsed for ESA' } : c))
    );
    setFeedback(`Repeat candidacy for ${id} has been formally endorsed for the Examination Board.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleReject = (id) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hodStatus: 'Rejected by HOD' } : c))
    );
    setFeedback(`Repeat candidacy for ${id} declined.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">EXAMINATION BOARD ENDORSEMENTS</span>
          <h1 className="hod-view-title">Repeat Examination Candidacy Endorsements</h1>
          <p className="hod-view-subtitle">
            Department Verification of Student Attempt Limits, CA Carry-over Validity & Medical Concessions for End Semester Exams
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('attendance_audit')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            80% Attendance Audit
          </button>
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('faculty_escalations')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            Escalate to Dean
          </button>
        </div>
      </div>

      {feedback && (
        <div className="hod-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Stats Strip */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card">
          <span className="hod-strip-val">{candidates.length}</span>
          <span className="hod-strip-lbl">Total Repeat Petitions</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: '#059669' }}>
            {candidates.filter((c) => c.hodStatus.startsWith('Endorsed')).length}
          </span>
          <span className="hod-strip-lbl">Endorsed for ESA</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: '#b45309' }}>
            {candidates.filter((c) => c.hodStatus.includes('Awaiting')).length}
          </span>
          <span className="hod-strip-lbl">Pending HOD Verification</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">100%</span>
          <span className="hod-strip-lbl">By-Law Compliance</span>
        </div>
      </div>

      {/* 3. Candidates Table */}
      <div className="hod-table-card">
        <div className="hod-table-header">
          <div>
            <h3 className="hod-card-title">Repeat Examination Applicant Register</h3>
            <p className="hod-card-subtitle">
              Verify eligibility under Section 7.3 of SEUSL Faculty of Technology Examination By-Laws.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="hod-btn-outline"
              onClick={() => alert('Official repeat candidate list exported for Examination Officer.')}
            >
              Export to Examination Branch
            </button>
          </div>
        </div>

        <div className="hod-table-wrapper">
          <table className="hod-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Student & Reg No</th>
                <th>Subject Code & Title</th>
                <th>Attempt Stage</th>
                <th>Previous Grade</th>
                <th>CA Carry-over Standing</th>
                <th>Medical Valid</th>
                <th>HOD Endorsement</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const isPending = c.hodStatus === 'Awaiting Verification';

                return (
                  <tr key={c.id}>
                    <td>
                      <span className="hod-tracking-badge">{c.id}</span>
                    </td>
                    <td>
                      <div className="hod-student-name">{c.name}</div>
                      <div className="hod-student-reg">{c.regNo}</div>
                    </td>
                    <td>
                      <span className="hod-subject-tag">{c.subjectCode}</span>
                      <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                        {c.subjectTitle}
                      </div>
                    </td>
                    <td>
                      <span className="hod-batch-pill">{c.attempt}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>{c.previousGrade}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>{c.caCarriedOver}</span>
                    </td>
                    <td>
                      <span className={`hod-badge-${c.medicalCovered.startsWith('Yes') ? 'green' : 'gray'}`}>
                        {c.medicalCovered.startsWith('Yes') ? '✓ Medical Exemption' : 'Regular Repeat'}
                      </span>
                    </td>
                    <td>
                      <span className={`hod-status-pill status-${c.hodStatus.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        {c.hodStatus}
                      </span>
                    </td>
                    <td>
                      <div className="hod-actions-cell">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              className="hod-btn-endorse"
                              onClick={() => handleEndorse(c.id)}
                            >
                              Endorse
                            </button>
                            <button
                              type="button"
                              className="hod-btn-decline"
                              onClick={() => handleReject(c.id)}
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Processed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
