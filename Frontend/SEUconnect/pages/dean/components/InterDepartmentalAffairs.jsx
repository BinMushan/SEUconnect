import React from 'react';
import { INTER_DEPARTMENTAL_DATA } from '../deanData.js';

export default function InterDepartmentalAffairs({ onNavigate }) {
  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">CROSS-DISCIPLINARY COLLABORATION</span>
          <h1 className="dean-view-title">Inter-Departmental Affairs & Resource Sharing</h1>
          <p className="dean-view-subtitle">
            Strategic Integration of Curriculum Modules, Shared Laboratories, Innovation Incubators & Joint Industry Liaison
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn" onClick={() => onNavigate('departments')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            Departments View
          </button>
        </div>
      </div>

      {/* 2. Initiatives Grid */}
      <div className="dean-initiatives-stack">
        {INTER_DEPARTMENTAL_DATA.map((item, idx) => (
          <div key={idx} className="dean-card dean-initiative-card">
            <div className="dean-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="dean-badge-blue">Initiative 0{idx + 1}</span>
                  <h3 className="dean-card-heading" style={{ fontSize: '1.15rem' }}>
                    {item.initiativeTitle}
                  </h3>
                </div>
                <div style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Lead Coordinator: <strong>{item.coordinator}</strong> • Benefiting {item.totalStudentsBenefiting} Undergraduates
                </div>
              </div>

              <span className="dean-badge-green">{item.status}</span>
            </div>

            <div className="dean-initiative-body">
              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Participating Departments:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  {item.participatingDepts.map((d, dIdx) => (
                    <span key={dIdx} className="dean-dept-badge" style={{ fontSize: '0.75rem' }}>
                      ✓ {d}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Integrated Modules / Program Areas:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  {item.modules.map((m, mIdx) => (
                    <span key={mIdx} className="dean-subject-tag">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                <strong>Strategic Framework:</strong> {item.notes}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

