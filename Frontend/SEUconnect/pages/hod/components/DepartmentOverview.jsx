import React from 'react';
import { ICT_DEPARTMENT_INFO } from '../hodData.js';

export default function DepartmentOverview({ onNavigate }) {
  const { name, shortName, faculty, university, campus, established, hod, vision, mission, programmes, stats, laboratories, committees } = ICT_DEPARTMENT_INFO;

  return (
    <div className="hod-view-container">
      {/* 1. Header Banner */}
      <div className="hod-view-header-banner">
        <div className="hod-header-banner-left">
          <span className="hod-banner-tag">DEPARTMENT GOVERNANCE</span>
          <h1 className="hod-view-title">{name}</h1>
          <p className="hod-view-subtitle">
            {faculty} • {university} • {campus} (Est. {established})
          </p>
        </div>
        <div className="hod-banner-actions">
          <button type="button" className="hod-banner-btn" onClick={() => onNavigate('academic_staff')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Academic Staff ({stats.academicCadre})
          </button>
          <button type="button" className="hod-banner-btn primary" onClick={() => onNavigate('course_coordination')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Course Allocations
          </button>
        </div>
      </div>

      {/* 2. Key Stats Strip */}
      <div className="hod-stats-strip">
        <div className="hod-strip-card">
          <span className="hod-strip-val">{stats.totalUndergraduates}</span>
          <span className="hod-strip-lbl">Enrolled Students (BICT)</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">{stats.academicCadre}</span>
          <span className="hod-strip-lbl">Teaching Cadre</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">{stats.laboratories}</span>
          <span className="hod-strip-lbl">Specialized Labs</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">{stats.activeSemesterCourses}</span>
          <span className="hod-strip-lbl">Current Modules</span>
        </div>
        <div className="hod-strip-card">
          <span className="hod-strip-val">{stats.internshipPlacementRate}</span>
          <span className="hod-strip-lbl">Industry Placement</span>
        </div>
      </div>

      {/* 3. Vision & Mission Cards */}
      <div className="hod-vision-mission-grid">
        <div className="hod-card hod-vision-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
              </svg>
              Department Vision
            </h3>
          </div>
          <p className="hod-card-prose">{vision}</p>
        </div>

        <div className="hod-card hod-mission-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Department Mission
            </h3>
          </div>
          <p className="hod-card-prose">{mission}</p>
        </div>
      </div>

      {/* 4. Degree Programmes & Head of Department Desk */}
      <div className="hod-two-col-grid">
        {/* Left: Degree Programmes */}
        <div className="hod-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Academic Degree Programmes Offered
            </h3>
          </div>

          <div className="hod-programmes-list">
            {programmes.map((prog, idx) => (
              <div key={idx} className="hod-programme-box">
                <div className="hod-prog-header">
                  <div>
                    <span className="hod-prog-code">{prog.code}</span>
                    <h4 className="hod-prog-title">{prog.title}</h4>
                  </div>
                  <span className="hod-prog-badge">{prog.slqfLevel}</span>
                </div>
                <div className="hod-prog-meta">
                  <span>Duration: {prog.duration}</span>
                  <span>•</span>
                  <span>Current Enrollment: {prog.enrolledStudents} Undergraduates</span>
                </div>
                <div className="hod-prog-specs">
                  <strong>Specialization Tracks:</strong>
                  <div className="hod-specs-tags">
                    {prog.specializations.map((spec, sIdx) => (
                      <span key={sIdx} className="hod-spec-tag">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Head of Department Leadership Desk */}
        <div className="hod-card hod-hod-card">
          <div className="hod-card-header">
            <h3 className="hod-card-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              Office of the Head of Department
            </h3>
            <span className="hod-board-pill">Department Board Chair</span>
          </div>

          <div className="hod-lead-profile">
            <div className="hod-lead-avatar">MR</div>
            <div className="hod-lead-info">
              <h4 className="hod-lead-name">{hod.name}</h4>
              <p className="hod-lead-desig">{hod.title}</p>
              <p className="hod-lead-qual">{hod.qualification}</p>
            </div>
          </div>

          <div className="hod-lead-details">
            <div className="hod-lead-row">
              <span className="hod-lead-label">Office:</span>
              <span className="hod-lead-val">{hod.office}</span>
            </div>
            <div className="hod-lead-row">
              <span className="hod-lead-label">Email:</span>
              <span className="hod-lead-val">{hod.email}</span>
            </div>
            <div className="hod-lead-row">
              <span className="hod-lead-label">Extension:</span>
              <span className="hod-lead-val">{hod.phone}</span>
            </div>
          </div>

          <div className="hod-lead-actions">
            <button type="button" className="hod-btn-outline" onClick={() => onNavigate('academic_profile')}>
              View Full Academic Profile
            </button>
            <button type="button" className="hod-btn-outline" onClick={() => onNavigate('department_reports')}>
              Board Meeting Agendas
            </button>
          </div>
        </div>
      </div>

      {/* 5. Specialized Laboratories */}
      <div className="hod-card">
        <div className="hod-card-header">
          <h3 className="hod-card-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Specialized Computing Laboratories & Infrastructure
          </h3>
          <span className="hod-badge-green">All 4 Facilities Operational</span>
        </div>

        <div className="hod-labs-grid">
          {laboratories.map((lab, idx) => (
            <div key={idx} className="hod-lab-card">
              <div className="hod-lab-header">
                <span className="hod-lab-num">Lab 0{idx + 1}</span>
                <span className="hod-lab-status-badge">{lab.status}</span>
              </div>
              <h4 className="hod-lab-name">{lab.name}</h4>
              <div className="hod-lab-meta">
                <div>📍 {lab.location}</div>
                <div>👥 Capacity: {lab.capacity}</div>
                <div>👤 In-Charge: {lab.inCharge}</div>
              </div>
              <div className="hod-lab-equipment">
                <strong>Config:</strong> {lab.equipment}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Department Statutory Committees */}
      <div className="hod-card">
        <div className="hod-card-header">
          <h3 className="hod-card-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Departmental Standing Committees & Coordinators
          </h3>
        </div>

        <div className="hod-table-wrapper">
          <table className="hod-table">
            <thead>
              <tr>
                <th>Committee / Cell Name</th>
                <th>Chair / Coordinator</th>
                <th>Meeting Frequency</th>
                <th>Primary Mandate</th>
              </tr>
            </thead>
            <tbody>
              {committees.map((comm, cIdx) => (
                <tr key={cIdx}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{comm.name}</td>
                  <td>
                    <span className="hod-staff-tag">{comm.chair || comm.coordinator}</span>
                  </td>
                  <td>
                    <span className="hod-freq-pill">{comm.meets}</span>
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                    {cIdx === 0 && 'Curriculum updating, module credit alignment, and syllabus approvals.'}
                    {cIdx === 1 && 'Teaching evaluations, student feedback audits, and quality compliance.'}
                    {cIdx === 2 && 'Student internships, industry MOUs, and employer liaison.'}
                    {cIdx === 3 && 'Student guidance, mental health referrals, and hostel/welfare appeals.'}
                    {cIdx === 4 && 'Equipment maintenance, replacement requisitions, and safety protocols.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

