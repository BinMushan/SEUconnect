import React from 'react';
import { DEAN_INFO, FACULTY_STATS } from '../deanData.js';

export default function DeanProfile({ user, onNavigate }) {
  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">EXECUTIVE DOSSIER & CREDENTIALS</span>
          <h1 className="dean-view-title">{DEAN_INFO.name}</h1>
          <p className="dean-view-subtitle">
            {DEAN_INFO.title} • {DEAN_INFO.faculty} • {DEAN_INFO.university}
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn primary" onClick={() => onNavigate('dashboard')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dean's Executive Office
          </button>
        </div>
      </div>

      {/* 2. Profile Details Grid */}
      <div className="dean-two-col-grid">
        {/* Left Column: Official Profile Details */}
        <div className="dean-card">
          <div className="dean-card-header">
            <h3 className="dean-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Dean Executive Credentials
            </h3>
            <span className="dean-board-pill">Senior Professor</span>
          </div>

          <div className="dean-staff-dossier-grid">
            <div className="dean-dossier-item">
              <label>Full Name</label>
              <div>{DEAN_INFO.name}</div>
            </div>
            <div className="dean-dossier-item">
              <label>University Staff ID</label>
              <div>STAFF-FOT-001</div>
            </div>
            <div className="dean-dossier-item">
              <label>Academic Title</label>
              <div>Senior Professor (Chair of Computer Engineering)</div>
            </div>
            <div className="dean-dossier-item">
              <label>Administrative Office</label>
              <div>Dean, Faculty of Technology</div>
            </div>
            <div className="dean-dossier-item" style={{ gridColumn: 'span 2' }}>
              <label>Institution & Campus</label>
              <div>{DEAN_INFO.faculty}, {DEAN_INFO.university}, {DEAN_INFO.campus}</div>
            </div>
            <div className="dean-dossier-item" style={{ gridColumn: 'span 2' }}>
              <label>Qualifications & Fellowships</label>
              <div>{DEAN_INFO.qualifications}</div>
            </div>
            <div className="dean-dossier-item">
              <label>Official Dean Email</label>
              <div>{DEAN_INFO.email}</div>
            </div>
            <div className="dean-dossier-item">
              <label>Executive Direct Phone</label>
              <div>{DEAN_INFO.phone}</div>
            </div>
            <div className="dean-dossier-item" style={{ gridColumn: 'span 2' }}>
              <label>Executive Suite Location</label>
              <div>{DEAN_INFO.office}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Responsibilities */}
        <div className="dean-card">
          <div className="dean-card-header">
            <h3 className="dean-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Statutory Roles & Governance Bodies
            </h3>
          </div>

          <div className="dean-resolutions-box">
            {DEAN_INFO.statutoryAuthorities.map((auth, idx) => (
              <div key={idx} className="dean-res-item">
                <span className="dean-res-bullet">🏛️</span>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{auth}</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    {idx === 0 && 'Presiding officer on all faculty curricula, degree approvals, and student welfare policies.'}
                    {idx === 1 && 'Voting member of the supreme academic authority of SEUSL for all national degree awards.'}
                    {idx === 2 && 'Executive representative for technology capital infrastructure and university budget allocations.'}
                    {idx === 3 && 'Final authority for End Semester Examination approvals, grading standards, and repeat sanctions.'}
                    {idx === 4 && 'Overseeing postgraduate research, M.Phil., and Ph.D. candidacies within the Faculty.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

