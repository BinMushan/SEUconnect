import React, { useState } from 'react';
import { EXAM_BOARD_CLEARANCES } from '../deanData.js';

export default function ExamBoardClearances({ onNavigate }) {
  const [candidates, setCandidates] = useState(EXAM_BOARD_CLEARANCES);
  const [feedback, setFeedback] = useState('');

  const handleClear = (id) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'Cleared for Senate Award', deanSignDate: new Date().toISOString().split('T')[0] }
          : c
      )
    );
    setFeedback(`Degree completion candidate ${id} has been formally sanctioned for Senate award by the Dean.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">DEGREE CONFERMENT & SENATE VERIFICATION</span>
          <h1 className="dean-view-title">Examination Board Clearances & Degree Sanctions</h1>
          <p className="dean-view-subtitle">
            Dean's Executive Certification for Degree Awards, Honours Classifications & Senate Examination Clearances
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn primary" onClick={() => onNavigate('digital_seals')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 21h14" />
              <path d="M5 17h14" />
              <path d="M12 3v10" />
              <path d="M7 7l5-4 5 4" />
              <rect x="6" y="13" width="12" height="4" rx="1" />
            </svg>
            Affix Official Dean Seal
          </button>
        </div>
      </div>

      {feedback && (
        <div className="dean-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Candidate Table */}
      <div className="dean-table-card">
        <div className="dean-table-header">
          <div>
            <h3 className="dean-card-title">Graduating Undergraduate Clearance Register</h3>
            <p className="dean-card-subtitle">
              Verify completion of 120 credits (SLQF Level 10), CGPA calculations, class awards, and zero financial/disciplinary encumbrances.
            </p>
          </div>
          <span className="dean-badge-green">{candidates.filter((c) => c.status.startsWith('Cleared')).length} of {candidates.length} Cleared</span>
        </div>

        <div className="dean-table-wrapper">
          <table className="dean-table">
            <thead>
              <tr>
                <th>Clearance ID</th>
                <th>Student & Reg No</th>
                <th>Department & Degree</th>
                <th>CGPA</th>
                <th>Class Awarded</th>
                <th>Senate Status</th>
                <th>Dean Sign Date</th>
                <th style={{ textAlign: 'right' }}>Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const isCleared = c.status.startsWith('Cleared');

                return (
                  <tr key={c.id}>
                    <td>
                      <span className="dean-tracking-badge">{c.id}</span>
                    </td>
                    <td>
                      <div className="dean-student-name">{c.name}</div>
                      <div className="dean-student-reg">{c.regNo}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f2b5c' }}>{c.degree}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.department}</div>
                    </td>
                    <td>
                      <span className="dean-gpa-badge">{c.cgpa.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`dean-class-badge ${c.classAwarded.includes('First') ? 'first' : 'upper'}`}>
                        {c.classAwarded}
                      </span>
                    </td>
                    <td>
                      <span className={`dean-status-pill status-${c.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span className="dean-date-text">{c.deanSignDate}</span>
                    </td>
                    <td>
                      <div className="dean-actions-cell">
                        {!isCleared ? (
                          <button
                            type="button"
                            className="dean-btn-approve"
                            onClick={() => handleClear(c.id)}
                          >
                            Grant Senate Clearance
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700 }}>
                            ✓ Certified
                          </span>
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

