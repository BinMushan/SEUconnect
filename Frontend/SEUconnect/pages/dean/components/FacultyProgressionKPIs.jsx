import React from 'react';
import { FACULTY_KPIS, FACULTY_STATS } from '../deanData.js';

const safeToFixed = (val, decimals = 2, fallback = '—') => {
  if (val === null || val === undefined || val === '' || val === '—' || val === 'N/A') return fallback;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num.toFixed(decimals) : fallback;
};

export default function FacultyProgressionKPIs({ onNavigate }) {
  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">INSTITUTIONAL STRATEGY & ANALYTICS</span>
          <h1 className="dean-view-title">Faculty Progression, Performance & KPIs</h1>
          <p className="dean-view-subtitle">
            Academic Performance Trends, Degree Classification Distributions & Quality Benchmark Metrics across Departments
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn" onClick={() => alert('Faculty Performance & KPI Report (PDF) generated.')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Executive Report
          </button>
        </div>
      </div>

      {/* 2. Top Stats Strip */}
      <div className="dean-stats-strip">
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_KPIS.currentEnrollment}</span>
          <span className="dean-strip-lbl">Total Enrolled Cadre</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_KPIS.studentTeacherRatio}</span>
          <span className="dean-strip-lbl">Student-Lecturer Ratio</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_KPIS.femaleStudentRatio}</span>
          <span className="dean-strip-lbl">Female Undergraduates</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val" style={{ color: '#16a34a' }}>{FACULTY_STATS.onTimeGraduationRate}</span>
          <span className="dean-strip-lbl">On-Time Completion</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val" style={{ color: '#2563eb' }}>{FACULTY_STATS.employmentRate6Months}</span>
          <span className="dean-strip-lbl">Graduate Employment</span>
        </div>
      </div>

      {/* 3. GPA Distribution Breakdown & Department Breakdown */}
      <div className="dean-two-col-grid">
        {/* Left: Degree Classification Distribution */}
        <div className="dean-card">
          <div className="dean-card-header">
            <h3 className="dean-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              Faculty Degree Classification Distribution
            </h3>
            <span className="dean-badge-blue">SLQF Level 10</span>
          </div>

          <div className="dean-gpa-bars-list">
            {FACULTY_KPIS.gpaDistribution.map((tier, idx) => (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  <span>{tier.label}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{tier.count} Students ({tier.pct})</span>
                </div>
                <div className="dean-progress-bar">
                  <div
                    className="dean-progress-fill"
                    style={{
                      width: tier.pct,
                      background: idx === 0 ? '#10b981' : idx === 1 ? '#2563eb' : idx === 2 ? '#3b82f6' : idx === 3 ? '#f59e0b' : '#ef4444',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Departmental Performance Benchmark */}
        <div className="dean-card">
          <div className="dean-card-header">
            <h3 className="dean-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Inter-Departmental Performance Benchmark
            </h3>
          </div>

          <div className="dean-table-wrapper">
            <table className="dean-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Staff</th>
                  <th>Avg GPA</th>
                  <th>Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {FACULTY_KPIS.departmentBreakdown.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td style={{ fontWeight: 700, color: '#0f2b5c' }}>{row.dept}</td>
                    <td>{row.students}</td>
                    <td>{row.staff}</td>
                    <td>
                      <span className="dean-gpa-badge">{safeToFixed(row.avgGPA, 2, '—')}</span>
                    </td>
                    <td>
                      <span className="dean-status-pill status-approved">{row.passRate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

