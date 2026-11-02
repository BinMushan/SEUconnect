import React from 'react';
import { ICT_DEPARTMENT_INFO } from '../hodData.js';

export default function HODProfile({ user, onNavigate }) {
  const hod = ICT_DEPARTMENT_INFO.hod;

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">EXECUTIVE PROFILE & CREDENTIALS</span>
          <h1 className="hod-view-title">{user?.name || hod.name}</h1>
          <p className="hod-view-subtitle">
            {user?.designation || hod.title} • {ICT_DEPARTMENT_INFO.name} • {ICT_DEPARTMENT_INFO.faculty}
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('dashboard')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            HOD Command Center
          </button>
        </div>
      </div>

      {/* 2. Profile Details Grid */}
      <div className="hod-two-col-grid">
        {/* Left Column: Official Details */}
        <div className="hod-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Academic Leadership & Institutional Post
            </h3>
            <span className="hod-board-pill">Active Cadre</span>
          </div>

          <div className="hod-staff-dossier-grid">
            <div className="hod-dossier-item">
              <label>Full Official Name</label>
              <div>{user?.name || hod.name}</div>
            </div>
            <div className="hod-dossier-item">
              <label>University Staff ID</label>
              <div>{user?.staffId || 'STAFF-ICT-001'}</div>
            </div>
            <div className="hod-dossier-item">
              <label>Substantive Cadre</label>
              <div>Senior Lecturer Grade I</div>
            </div>
            <div className="hod-dossier-item">
              <label>Administrative Designation</label>
              <div>Head of the Department (HOD)</div>
            </div>
            <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
              <label>Department & Faculty</label>
              <div>{ICT_DEPARTMENT_INFO.name}, {ICT_DEPARTMENT_INFO.faculty}, SEUSL</div>
            </div>
            <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
              <label>Educational Qualifications</label>
              <div>{hod.qualification}</div>
            </div>
            <div className="hod-dossier-item">
              <label>Official Email</label>
              <div>{user?.email || hod.email}</div>
            </div>
            <div className="hod-dossier-item">
              <label>Phone / Extension</label>
              <div>{hod.phone}</div>
            </div>
            <div className="hod-dossier-item" style={{ gridColumn: 'span 2' }}>
              <label>Official Office Location</label>
              <div>{hod.office}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Responsibilities & Governance */}
        <div className="hod-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Statutory Roles & Committee Memberships
            </h3>
          </div>

          <div className="hod-resolutions-box">
            <div className="hod-res-item">
              <span className="hod-res-bullet">🏛️</span>
              <div>
                <strong>Chairman, Department Board of Study (ICT)</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Responsible for course curricula, academic progress, continuous assessment moderation, and staff allocation.
                </p>
              </div>
            </div>

            <div className="hod-res-item">
              <span className="hod-res-bullet">📜</span>
              <div>
                <strong>Member, Faculty Board of Technology</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Representing the Department of ICT on all faculty policy, examinations, student welfare, and degree standards.
                </p>
              </div>
            </div>

            <div className="hod-res-item">
              <span className="hod-res-bullet">🎓</span>
              <div>
                <strong>Member of Senate, SEUSL</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Voting member on the university-wide supreme academic authority for curricula and degree awards.
                </p>
              </div>
            </div>

            <div className="hod-res-item">
              <span className="hod-res-bullet">🔬</span>
              <div>
                <strong>Director, Distributed Systems & Edge Cloud Lab</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Leading postgraduate research grants, cloud microservice benchmarks, and student capstone projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

