import React, { useState } from 'react';
import { CA_MODERATION_DATA } from '../hodData.js';

export default function CAMarksModeration({ onNavigate }) {
  const [caList, setCaList] = useState(CA_MODERATION_DATA);
  const [selectedCA, setSelectedCA] = useState(null);
  const [feedback, setFeedback] = useState('');

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
