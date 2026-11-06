import React, { useState, useEffect } from 'react';
import { EXAM_BOARD_CLEARANCES } from '../deanData.js';
import { resultsPipelineService, PIPELINE_STAGES, PIPELINE_LABELS } from '../../../src/services/resultsPipelineService.js';

const safeToFixed = (val, decimals = 2, fallback = '—') => {
  if (val === null || val === undefined || val === '' || val === '—' || val === 'N/A') return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num.toFixed(decimals) : fallback;
};

export default function ExamBoardClearances({ onNavigate }) {
  const [candidates, setCandidates] = useState(EXAM_BOARD_CLEARANCES);
  const [feedback, setFeedback] = useState('');
  const [pipelineStatus, setPipelineStatus] = useState(() => resultsPipelineService.getPipelineStatus('Year 2 Semester 2'));

  useEffect(() => {
    const handleUpdate = () => {
      setPipelineStatus(resultsPipelineService.getPipelineStatus('Year 2 Semester 2'));
    };
    window.addEventListener('seu_pipeline_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('seu_pipeline_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleDeanApproveClearance = () => {
    const updated = resultsPipelineService.deanApproveClearance('Year 2 Semester 2', 'Prof. Rifai Kariapper (Dean)');
    setPipelineStatus(updated);
    setFeedback('Executive Senate Clearance approved with Dean digital seal. Clearance message sent to HOD for final publication.');
    setTimeout(() => setFeedback(''), 5000);
  };

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

      {/* Cohort Semester Results Moderation & Seal Approval */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6d28d9', background: '#ede9fe', padding: '3px 8px', borderRadius: '4px', marginBottom: '4px' }}>
              Faculty Examination Board · Senate Clearance Docket
            </div>
            <h3 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Batch 2022/2023 (Year 2 Semester 2) — Senate Award &amp; Clearance
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Status: <strong>{PIPELINE_LABELS[pipelineStatus.stage] || pipelineStatus.stage}</strong>
            </p>
          </div>

          <div>
            {pipelineStatus.stage === PIPELINE_STAGES.FORWARDED_TO_DEAN && (
              <button
                type="button"
                onClick={handleDeanApproveClearance}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.3rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Affix Dean Seal &amp; Send Approved Clearance to HOD &rarr;</span>
              </button>
            )}

            {pipelineStatus.stage === PIPELINE_STAGES.DEAN_APPROVED && (
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem' }}>
                ✓ Dean Executive Seal Affixed &middot; Dispatched to HOD for Publication
              </span>
            )}

            {pipelineStatus.stage === PIPELINE_STAGES.PUBLISHED && (
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem' }}>
                ✓ Published by HOD to Student Portal
              </span>
            )}

            {[PIPELINE_STAGES.LECTURER_DRAFT, PIPELINE_STAGES.SUBMITTED_TO_DMA, PIPELINE_STAGES.SUBMITTED_TO_HOD, PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER].includes(pipelineStatus.stage) && (
              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '6px', fontWeight: 600, fontSize: '0.84rem' }}>
                Awaiting Examination Officer Submission
              </span>
            )}
          </div>
        </div>
      </div>

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
                      <span className="dean-gpa-badge">{safeToFixed(c.cgpa, 2, '—')}</span>
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

