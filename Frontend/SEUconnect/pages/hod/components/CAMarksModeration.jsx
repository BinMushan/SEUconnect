import React, { useState, useEffect } from 'react';
import { CA_MODERATION_DATA } from '../hodData.js';
import { resultsPipelineService, PIPELINE_STAGES, PIPELINE_LABELS } from '../../../src/services/resultsPipelineService.js';

export default function CAMarksModeration({ onNavigate }) {
  const [caList, setCaList] = useState(CA_MODERATION_DATA);
  const [selectedCA, setSelectedCA] = useState(null);
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

  const handleHodSubmitToExamOfficer = () => {
    const updated = resultsPipelineService.hodSubmitToExamOfficer('Year 2 Semester 2', 'Dr. Rifky (HOD)');
    setPipelineStatus(updated);
    setFeedback('All moderated cohort results across 9 subjects endorsed and forwarded to Examination Officer for verification.');
    setTimeout(() => setFeedback(''), 5000);
  };

  const handleHodPublish = () => {
    const updated = resultsPipelineService.hodPublishResults('Year 2 Semester 2', 'Dr. Rifky (HOD)');
    setPipelineStatus(updated);
    setFeedback('🎉 Semester examination results officially published to the Student Portal! All students can now view verified marks, SGPA, and academic standings.');
    setTimeout(() => setFeedback(''), 6000);
  };

  const handleSignOff = (code) => {
    setCaList((prev) =>
      prev.map((c) => (c.courseCode === code ? { ...c, status: 'Moderated & Signed Off' } : c))
    );
    setFeedback(`CA Marks for ${code} have been formally moderated, signed off, and authorized for release.`);
    setSelectedCA(null);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleRequestRevision = (code) => {
    setCaList((prev) =>
      prev.map((c) => (c.courseCode === code ? { ...c, status: 'Revision Requested by HOD' } : c))
    );
    setFeedback(`Revision request issued to Course Lecturer for ${code}.`);
    setSelectedCA(null);
    setTimeout(() => setFeedback(''), 4000);
  };

  const pendingCount = caList.filter((c) => c.status === 'Awaiting HOD Moderation').length;
  const approvedCount = caList.filter((c) => c.status === 'Moderated & Signed Off').length;

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">EXAMINATION STANDARDS & QA</span>
          <h1 className="hod-view-title">Continuous Assessment (CA) Moderation Desk</h1>
          <p className="hod-view-subtitle">
            Statutory HOD Review of Lecturer CA Marks, Component Weighting & Grade Distributions before Release
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('attendance_audit')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            Attendance Audit
          </button>
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('course_coordination')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Course Allocations
          </button>
        </div>
      </div>

      {feedback && (
        <div className="hod-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* Results Moderation & Publishing Pipeline Flow Banner */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e40af', background: '#dbeafe', padding: '3px 8px', borderRadius: '4px', marginBottom: '4px' }}>
              Multi-Role Results Moderation Pipeline (Year 2 Semester 2)
            </div>
            <h3 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Current Status: <span style={{ color: pipelineStatus.stage === PIPELINE_STAGES.PUBLISHED ? '#15803d' : '#2563eb' }}>{PIPELINE_LABELS[pipelineStatus.stage] || pipelineStatus.stage}</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              DMA compiles marks from all course lecturers &rarr; HOD moderates cohort &rarr; Exam Officer audits &rarr; Dean affixes Senate seal &rarr; HOD publishes to student portal.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {pipelineStatus.stage === PIPELINE_STAGES.SUBMITTED_TO_HOD && (
              <button
                type="button"
                onClick={handleHodSubmitToExamOfficer}
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Approve All Marks & Submit to Exam Officer &rarr;</span>
              </button>
            )}

            {pipelineStatus.stage === PIPELINE_STAGES.DEAN_APPROVED && (
              <button
                type="button"
                onClick={handleHodPublish}
                style={{
                  background: 'linear-gradient(135deg, #15803d, #16a34a)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.7rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(22,163,74,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'pulse 2s infinite'
                }}
              >
                <span>📢 Publish Results to Student Portal</span>
              </button>
            )}

            {pipelineStatus.stage === PIPELINE_STAGES.PUBLISHED && (
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem' }}>
                ✓ Official Results Published to Students
              </span>
            )}

            {pipelineStatus.stage === PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER && (
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem' }}>
                ⏳ Under Verification by Examination Branch
              </span>
            )}

            {pipelineStatus.stage === PIPELINE_STAGES.FORWARDED_TO_DEAN && (
              <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem' }}>
                ⏳ Forwarded to Dean for Senate Seal
              </span>
            )}
          </div>
        </div>

        {/* 6-step progress bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
          {[
            { label: '1. Lecturer Marks', done: true },
            { label: '2. DMA Compilation', done: pipelineStatus.stage !== PIPELINE_STAGES.LECTURER_DRAFT },
            { label: '3. HOD Moderation', done: [PIPELINE_STAGES.SUBMITTED_TO_EXAM_OFFICER, PIPELINE_STAGES.FORWARDED_TO_DEAN, PIPELINE_STAGES.DEAN_APPROVED, PIPELINE_STAGES.PUBLISHED].includes(pipelineStatus.stage) },
            { label: '4. Exam Officer', done: [PIPELINE_STAGES.FORWARDED_TO_DEAN, PIPELINE_STAGES.DEAN_APPROVED, PIPELINE_STAGES.PUBLISHED].includes(pipelineStatus.stage) },
            { label: '5. Dean Seal', done: [PIPELINE_STAGES.DEAN_APPROVED, PIPELINE_STAGES.PUBLISHED].includes(pipelineStatus.stage) },
            { label: '6. Student Portal', done: pipelineStatus.stage === PIPELINE_STAGES.PUBLISHED },
          ].map((st, idx) => (
            <div
              key={idx}
              style={{
                background: st.done ? '#ecfdf5' : '#f8fafc',
                border: `1px solid ${st.done ? '#10b981' : '#cbd5e1'}`,
                padding: '6px 8px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: st.done ? '#065f46' : '#64748b'
              }}
            >
              {st.done ? '✓ ' : ''}{st.label}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Moderation KPI Strip */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card">
          <span className="hod-strip-val">14</span>
          <span className="hod-strip-lbl">Total Semester Courses</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">{caList.length}</span>
          <span className="hod-strip-lbl">CA Marksheets Submitted</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: pendingCount > 0 ? '#b45309' : '#059669' }}>
            {pendingCount}
          </span>
          <span className="hod-strip-lbl">Awaiting HOD Moderation</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: '#059669' }}>{approvedCount}</span>
          <span className="hod-strip-lbl">Moderated & Signed Off</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">91.1%</span>
          <span className="hod-strip-lbl">Overall CA Pass Rate</span>
        </div>
      </div>

      {/* 3. Moderation Grid Table */}
      <div className="hod-table-card">
        <div className="hod-table-header">
          <div>
            <h3 className="hod-card-title">Submitted Course CA Marksheets</h3>
            <p className="hod-card-subtitle">
              Verify average scores, high/low mark ranges, component compliance, and flag students at risk of CA failure (&lt;40%).
            </p>
          </div>
          <span className="hod-badge-amber">{pendingCount} Require HOD Signature</span>
        </div>

        <div className="hod-table-wrapper">
          <table className="hod-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Course Lecturer</th>
                <th>Enrolled</th>
                <th>Class Avg</th>
                <th>Max / Min</th>
                <th>Pass Rate</th>
                <th>Moderation Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caList.map((ca) => {
                const isPending = ca.status === 'Awaiting HOD Moderation';
                const isRevision = ca.status === 'Revision Requested by HOD';

                return (
                  <tr key={ca.courseCode}>
                    <td>
                      <span className="hod-tracking-badge">{ca.courseCode}</span>
                    </td>
                    <td>
                      <div className="hod-proc-title">{ca.courseTitle}</div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Submitted: {ca.submittedDate}</span>
                    </td>
                    <td>
                      <span className="hod-staff-tag">{ca.lecturer}</span>
                    </td>
                    <td>{ca.studentsCount}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: ca.averageMark < 60 ? '#b45309' : '#0f2b5c' }}>
                        {ca.averageMark}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {ca.highestMark}% / {ca.lowestMark}%
                      </span>
                    </td>
                    <td>
                      <span className={`hod-pass-rate ${ca.passRate < 85 ? 'warning' : 'good'}`}>
                        {ca.passRate}%
                      </span>
                    </td>
                    <td>
                      <span className={`hod-status-pill status-${ca.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        {ca.status}
                      </span>
                    </td>
                    <td>
                      <div className="hod-actions-cell">
                        <button
                          type="button"
                          className="hod-btn-audit"
                          onClick={() => setSelectedCA(ca)}
                        >
                          Inspect Marks
                        </button>
                        {isPending && (
                          <button
                            type="button"
                            className="hod-btn-endorse"
                            onClick={() => handleSignOff(ca.courseCode)}
                          >
                            Sign Off
                          </button>
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

      {/* CA Marksheet Inspection Modal */}
      {selectedCA && (
        <div className="hod-modal-overlay" onClick={() => setSelectedCA(null)}>
          <div className="hod-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">CA Marks Moderation Dossier</h3>
                <p className="hod-modal-sub">{selectedCA.courseCode} • {selectedCA.courseTitle} ({selectedCA.lecturer})</p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setSelectedCA(null)}>
                ✕
              </button>
            </div>
            <div className="hod-modal-body">
              {/* Summary Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.2rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Class Average</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2b5c' }}>{selectedCA.averageMark}%</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Highest Mark</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{selectedCA.highestMark}%</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lowest Mark</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{selectedCA.lowestMark}%</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pass Rate (&ge;40%)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{selectedCA.passRate}%</div>
                </div>
              </div>

              {/* Assessment Components */}
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  Assessment Component Breakdown (Total Weight: 50% CA)
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  {selectedCA.components?.map((comp, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.8rem',
                        borderBottom: idx < selectedCA.components.length - 1 ? '1px solid #f1f5f9' : 'none',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        fontSize: '0.82rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#334155' }}>{comp.name}</span>
                      <span style={{ color: '#64748b' }}>Weight: {comp.weight} (Component Avg: {comp.avg})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students at Risk */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.4rem' }}>
                  Students Below CA Pass Cut-off (&lt; 40%)
                </h4>
                {selectedCA.atRiskStudents && selectedCA.atRiskStudents.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedCA.atRiskStudents.map((stu, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        ⚠️ {stu}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                    ✓ No students failing CA in this module. 100% eligibility achieved.
                  </span>
                )}
              </div>
            </div>
            <div className="hod-modal-footer">
              <button
                type="button"
                className="hod-btn-decline"
                onClick={() => handleRequestRevision(selectedCA.courseCode)}
              >
                Request Revision from Lecturer
              </button>
              <button
                type="button"
                className="hod-btn-endorse"
                onClick={() => handleSignOff(selectedCA.courseCode)}
              >
                Sign & Authorize CA Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
