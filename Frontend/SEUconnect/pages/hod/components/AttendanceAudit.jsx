import React, { useState } from 'react';
import { ATTENDANCE_AUDIT_DATA } from '../hodData.js';

export default function AttendanceAudit({ onNavigate }) {
  const [auditList, setAuditList] = useState(ATTENDANCE_AUDIT_DATA);
  const [selectedModule, setSelectedModule] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleGrantWaiver = (courseCode, regNo) => {
    setAuditList((prev) =>
      prev.map((m) => {
        if (m.courseCode !== courseCode) return m;
        return {
          ...m,
          barredStudents: m.barredStudents.map((s) =>
            s.regNo === regNo ? { ...s, medicalValid: true } : s
          ),
        };
      })
    );
    setFeedback(`Approved medical waiver for ${regNo} in ${courseCode}. Student attendance standing cleared for ESA.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const totalAudited = auditList.reduce((acc, cur) => acc + cur.totalStudents, 0);
  const totalBarred = auditList.reduce(
    (acc, cur) => acc + cur.barredStudents.filter((s) => !s.medicalValid).length,
    0
  );

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">INSTITUTIONAL AUDIT & COMPLIANCE</span>
          <h1 className="hod-view-title">80% Mandatory Attendance Audit</h1>
          <p className="hod-view-subtitle">
            Section 4.1 SEUSL Examination By-Laws: Undergraduates must maintain &ge; 80% lecture & laboratory attendance to sit End Semester Exams
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('ca_moderation')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            CA Moderation
          </button>
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('pending_hod_approvals')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Pending Medicals
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
          <span className="hod-strip-val">14</span>
          <span className="hod-strip-lbl">Modules Audited</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">{totalAudited}</span>
          <span className="hod-strip-lbl">Total Student Enrollments</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: '#059669' }}>91.4%</span>
          <span className="hod-strip-lbl">Overall ESA Eligibility Rate</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: totalBarred > 0 ? '#dc2626' : '#059669' }}>
            {totalBarred}
          </span>
          <span className="hod-strip-lbl">Barred from ESA (No Medical)</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val" style={{ color: '#2563eb' }}>22</span>
          <span className="hod-strip-lbl">Medical Waivers Applied</span>
        </div>
      </div>

      {/* 3. Module Attendance Audit Table */}
      <div className="hod-table-card">
        <div className="hod-table-header">
          <div>
            <h3 className="hod-card-title">Module Attendance Compliance Standing</h3>
            <p className="hod-card-subtitle">
              Click "Inspect Barred Roster" to evaluate attendance hours, flagged absences, and medical waivers.
            </p>
          </div>
          <div>
            <button
              type="button"
              className="hod-btn-outline"
              onClick={() => alert('Official ESA Barred Student List generated and synchronized with Examination Registry.')}
            >
              Generate Barred List for Exam Branch
            </button>
          </div>
        </div>

        <div className="hod-table-wrapper">
          <table className="hod-table">
            <thead>
              <tr>
                <th>Module Code</th>
                <th>Course Title</th>
                <th>Course Lecturer</th>
                <th>Conducted Hours</th>
                <th>Enrolled</th>
                <th>Eligible (&ge;80%)</th>
                <th>Warning (70-79%)</th>
                <th>Critical (&lt;70%)</th>
                <th>Compliance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((m) => (
                <tr key={m.courseCode}>
                  <td>
                    <span className="hod-tracking-badge">{m.courseCode}</span>
                  </td>
                  <td>
                    <div className="hod-proc-title">{m.courseTitle}</div>
                  </td>
                  <td>
                    <span className="hod-staff-tag">{m.lecturer}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f2b5c' }}>{m.totalHoursConducted} hrs</span>
                  </td>
                  <td>{m.totalStudents}</td>
                  <td>
                    <span style={{ color: '#059669', fontWeight: 700 }}>{m.eligibleAbove80}</span>
                  </td>
                  <td>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>{m.warningZone70to79}</span>
                  </td>
                  <td>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>{m.criticalBelow70}</span>
                  </td>
                  <td>
                    <div style={{ width: '90px' }}>
                      <div className="hod-progress-bar">
                        <div
                          className="hod-progress-fill"
                          style={{
                            width: `${m.complianceRate}%`,
                            background: m.complianceRate >= 90 ? '#10b981' : '#f59e0b',
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.complianceRate}% passing</span>
                    </div>
                  </td>
                  <td>
                    <div className="hod-actions-cell">
                      <button
                        type="button"
                        className="hod-btn-audit"
                        onClick={() => setSelectedModule(m)}
                      >
                        Inspect Barred ({m.barredStudents.length})
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barred Students Inspection Modal */}
      {selectedModule && (
        <div className="hod-modal-overlay" onClick={() => setSelectedModule(null)}>
          <div className="hod-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="hod-modal-header">
              <div>
                <h3 className="hod-modal-title">Attendance Audit & Barred Student Register</h3>
                <p className="hod-modal-sub">
                  {selectedModule.courseCode} • {selectedModule.courseTitle} ({selectedModule.totalHoursConducted} Total Hours Conducted)
                </p>
              </div>
              <button type="button" className="hod-modal-close-btn" onClick={() => setSelectedModule(null)}>
                ✕
              </button>
            </div>
            <div className="hod-modal-body">
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#475569' }}>
                Students below 80% attendance cannot be issued exam admission cards for ESA unless an official university medical certificate or board concession is approved.
              </div>

              <table className="hod-table">
                <thead>
                  <tr>
                    <th>Registration No</th>
                    <th>Student Name</th>
                    <th>Attended Hours</th>
                    <th>Percentage</th>
                    <th>Medical Waiver</th>
                    <th style={{ textAlign: 'right' }}>HOD Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedModule.barredStudents.map((s) => (
                    <tr key={s.regNo}>
                      <td>
                        <span className="hod-tracking-badge">{s.regNo}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.hoursAttended} / {selectedModule.totalHoursConducted}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: s.pct < 70 ? '#dc2626' : '#d97706' }}>
                          {s.pct}%
                        </span>
                      </td>
                      <td>
                        <span className={`hod-badge-${s.medicalValid ? 'green' : 'red'}`}>
                          {s.medicalValid ? '✓ Approved' : '✗ No Medical'}
                        </span>
                      </td>
                      <td>
                        <div className="hod-actions-cell">
                          {!s.medicalValid ? (
                            <button
                              type="button"
                              className="hod-btn-endorse"
                              onClick={() => handleGrantWaiver(selectedModule.courseCode, s.regNo)}
                            >
                              Apply Waiver
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Cleared for ESA</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hod-modal-footer">
              <button type="button" className="hod-btn-outline" onClick={() => setSelectedModule(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

