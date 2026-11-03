import React, { useState } from 'react';
import { DEPARTMENTS_DATA } from '../deanData.js';

export default function FacultyDepartments({ onNavigate }) {
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS_DATA[0]);

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">DEPARTMENTS OVERSIGHT</span>
          <h1 className="dean-view-title">Academic Departments & Cadre Management</h1>
          <p className="dean-view-subtitle">
            Executive Governance of Department of Biosystems Technology (BST) and Department of Information and Communication Technology (ICT)
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn" onClick={() => onNavigate('faculty_analytics')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Faculty KPIs
          </button>
          <button type="button" className="dean-banner-btn primary" onClick={() => onNavigate('inter_departmental')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Inter-Dept Affairs
          </button>
        </div>
      </div>

      {/* 2. Department Selector Tabs */}
      <div className="dean-dept-nav-strip">
        {DEPARTMENTS_DATA.map((dept) => {
          const isSelected = selectedDept.code === dept.code;
          return (
            <div
              key={dept.code}
              className={`dean-dept-tab-card ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              <div className="dean-tab-top">
                <span className="dean-dept-badge">{dept.code}</span>
                <span className="dean-status-dot">● Active</span>
              </div>
              <h3 className="dean-dept-tab-name">{dept.name}</h3>
              <div className="dean-dept-tab-meta">
                <span>👤 {dept.head}</span>
                <span>•</span>
                <span>👥 {dept.undergraduatesCount} Undergrads</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Selected Department Detailed Dossier */}
      <div className="dean-card">
        <div className="dean-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="dean-dept-code" style={{ fontSize: '0.9rem' }}>{selectedDept.code}</span>
              <h3 className="dean-card-heading" style={{ fontSize: '1.2rem' }}>{selectedDept.name}</h3>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>
              Faculty of Technology Executive Oversight & Cadre Administration
            </p>
          </div>
          <span className="dean-badge-green">{selectedDept.status}</span>
        </div>

        {/* Detailed Metrics */}
        <div className="dean-stats-strip" style={{ marginBottom: '1.25rem' }}>
          <div className="dean-strip-card">
            <span className="dean-strip-val">{selectedDept.undergraduatesCount}</span>
            <span className="dean-strip-lbl">Total Undergraduates</span>
          </div>
          <div className="dean-strip-card">
            <span className="dean-strip-val">{selectedDept.academicStaffCount}</span>
            <span className="dean-strip-lbl">Academic Lecturers</span>
          </div>
          <div className="dean-strip-card">
            <span className="dean-strip-val">{selectedDept.labsCount}</span>
            <span className="dean-strip-lbl">Specialized Labs</span>
          </div>
          <div className="dean-strip-card">
            <span className="dean-strip-val">{selectedDept.budgetAllocation}</span>
            <span className="dean-strip-lbl">Annual Budget Allocation</span>
          </div>
        </div>

        {/* Two-Column Department Intel */}
        <div className="dean-two-col-grid">
          {/* HOD & Governance */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
              Department Leadership & Contact
            </h4>
            <div className="dean-lead-profile" style={{ marginBottom: '0.8rem' }}>
              <div className="dean-lead-avatar" style={{ width: '46px', height: '46px', fontSize: '1rem' }}>
                {selectedDept.head.split(' ').pop().substring(0, 2).toUpperCase()}
              </div>
              <div className="dean-lead-info">
                <h4 className="dean-lead-name" style={{ fontSize: '0.95rem' }}>{selectedDept.head}</h4>
                <p className="dean-lead-desig">{selectedDept.headDesignation}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                  Appointed HOD under University Statute
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Accreditation:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>SLQF Level 10 (120 Credits)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Curriculum Status:</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>Approved by Faculty Board</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Continuous Assessment:</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>Moderated & Compliant</span>
              </div>
            </div>
          </div>

          {/* Degree Program & Specializations */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
              Degree Program & Specialization Tracks
            </h4>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2b5c', marginBottom: '0.6rem' }}>
              {selectedDept.degreeProgram}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.78rem', color: '#475569' }}>Focus Specializations:</strong>
              {selectedDept.specializations.map((spec, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    color: '#1e293b',
                    fontWeight: 600,
                  }}
                >
                  🎯 {spec}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

