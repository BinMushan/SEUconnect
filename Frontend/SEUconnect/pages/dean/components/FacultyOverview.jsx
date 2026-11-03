import React from 'react';
import { DEAN_INFO, FACULTY_STATS, DEPARTMENTS_DATA } from '../deanData.js';

export default function FacultyOverview({ onNavigate }) {
  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">FACULTY GOVERNANCE</span>
          <h1 className="dean-view-title">{DEAN_INFO.faculty}</h1>
          <p className="dean-view-subtitle">
            {DEAN_INFO.university} • {DEAN_INFO.campus} • Office of Dean {DEAN_INFO.name}
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn" onClick={() => onNavigate('departments')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            2 Departments
          </button>
          <button type="button" className="dean-banner-btn primary" onClick={() => onNavigate('faculty_analytics')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Progression & KPIs
          </button>
        </div>
      </div>

      {/* 2. Key Stats Strip */}
      <div className="dean-stats-strip">
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_STATS.totalUndergraduates}</span>
          <span className="dean-strip-lbl">Total Undergraduates</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_STATS.departmentsCount}</span>
          <span className="dean-strip-lbl">Academic Departments</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_STATS.fullTimeAcademicStaff}</span>
          <span className="dean-strip-lbl">Academic Cadre</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_STATS.specializedLaboratories}</span>
          <span className="dean-strip-lbl">Advanced Laboratories</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_STATS.onTimeGraduationRate}</span>
          <span className="dean-strip-lbl">Graduation Rate</span>
        </div>
        <div className="dean-strip-card">
          <span className="dean-strip-val">{FACULTY_STATS.annualResearchFunding}</span>
          <span className="dean-strip-lbl">Research Funding</span>
        </div>
      </div>

      {/* 3. Dean Executive Profile & Vision/Mission */}
      <div className="dean-two-col-grid">
        {/* Left: Office of the Dean */}
        <div className="dean-card">
          <div className="dean-card-header">
            <h3 className="dean-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Office of the Dean
            </h3>
            <span className="dean-board-pill">Executive Authority</span>
          </div>

          <div className="dean-lead-profile">
            <div className="dean-lead-avatar">RK</div>
            <div className="dean-lead-info">
              <h4 className="dean-lead-name">{DEAN_INFO.name}</h4>
              <p className="dean-lead-desig">{DEAN_INFO.title}</p>
              <p className="dean-lead-qual">{DEAN_INFO.qualifications}</p>
            </div>
          </div>

          <p className="dean-lead-bio" style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: '0.5rem 0 1rem' }}>
            {DEAN_INFO.bio}
          </p>

          <div className="dean-lead-details">
            <div className="dean-lead-row">
              <span className="dean-lead-label">Office:</span>
              <span className="dean-lead-val">{DEAN_INFO.office}</span>
            </div>
            <div className="dean-lead-row">
              <span className="dean-lead-label">Email:</span>
              <span className="dean-lead-val">{DEAN_INFO.email}</span>
            </div>
            <div className="dean-lead-row">
              <span className="dean-lead-label">Phone:</span>
              <span className="dean-lead-val">{DEAN_INFO.phone}</span>
            </div>
          </div>

          <div className="dean-lead-actions">
            <button type="button" className="dean-btn-outline" onClick={() => onNavigate('academic_profile')}>
              View Dean's Full Dossier
            </button>
            <button type="button" className="dean-btn-outline" onClick={() => onNavigate('digital_seals')}>
              Official Sanctions Ledger
            </button>
          </div>
        </div>

        {/* Right: Vision & Statutory Mandate */}
        <div className="dean-card">
          <div className="dean-card-header">
            <h3 className="dean-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Faculty Strategic Mission & Statutory Authorities
            </h3>
          </div>

          <div style={{ marginBottom: '1rem', background: '#eff6ff', padding: '0.85rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
            <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.88rem', color: '#1e40af', fontWeight: 700 }}>
              Faculty Strategic Vision
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
              To produce globally competitive technology graduates endowed with innovative capability, professional ethics, and research excellence to drive national transformation.
            </p>
          </div>

          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.6rem' }}>
            Statutory Roles Held by the Dean:
          </h4>
          <div className="dean-statutory-list">
            {DEAN_INFO.statutoryAuthorities.map((auth, idx) => (
              <div key={idx} className="dean-statutory-item">
                <span className="dean-stat-check">🏛️</span>
                <span className="dean-stat-text">{auth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Academic Departments Overview */}
      <div className="dean-card">
        <div className="dean-card-header">
          <h3 className="dean-card-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Academic Departments of the Faculty of Technology
          </h3>
          <span className="dean-badge-green">Both Departments (ICT & BST) SLQF Level 10 Certified</span>
        </div>

        <div className="dean-departments-grid">
          {DEPARTMENTS_DATA.map((dept) => (
            <div key={dept.code} className="dean-dept-card">
              <div className="dean-dept-header">
                <div>
                  <span className="dean-dept-code">{dept.code}</span>
                  <h4 className="dean-dept-name">{dept.name}</h4>
                </div>
                <span className="dean-dept-status">{dept.status}</span>
              </div>

              <div className="dean-dept-lead">
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Head of Department:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{dept.head}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({dept.headDesignation})</span>
              </div>

              <div className="dean-dept-metrics">
                <div className="dean-dept-metric-box">
                  <span className="dean-metric-val">{dept.undergraduatesCount}</span>
                  <span className="dean-metric-lbl">Students</span>
                </div>
                <div className="dean-dept-metric-box">
                  <span className="dean-metric-val">{dept.academicStaffCount}</span>
                  <span className="dean-metric-lbl">Academics</span>
                </div>
                <div className="dean-dept-metric-box">
                  <span className="dean-metric-val">{dept.labsCount}</span>
                  <span className="dean-metric-lbl">Labs</span>
                </div>
                <div className="dean-dept-metric-box">
                  <span className="dean-metric-val">{dept.budgetAllocation}</span>
                  <span className="dean-metric-lbl">Budget</span>
                </div>
              </div>

              <div className="dean-dept-degree">
                <strong>Honours Degree:</strong> {dept.degreeProgram}
              </div>

              <div className="dean-dept-footer">
                <button
                  type="button"
                  className="dean-btn-audit"
                  onClick={() => onNavigate('departments')}
                >
                  Inspect Department
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

