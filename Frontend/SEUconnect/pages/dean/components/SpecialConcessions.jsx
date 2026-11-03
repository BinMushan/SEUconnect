import React, { useState } from 'react';
import { SPECIAL_CONCESSIONS_DATA } from '../deanData.js';

export default function SpecialConcessions({ onNavigate }) {
  const [concessions, setConcessions] = useState(SPECIAL_CONCESSIONS_DATA);
  const [feedback, setFeedback] = useState('');

  const handleApproveConcession = (id) => {
    setConcessions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'Approved by Dean',
              actionDate: new Date().toISOString().split('T')[0],
              formalMinute: 'Executive concession sanctioned under By-Law Section 4.2 by Prof. Rifai Kariapper.',
            }
          : c
      )
    );
    setFeedback(`Special concession ${id} approved under Dean executive authority.`);
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">EXECUTIVE CONCESSIONS</span>
          <h1 className="dean-view-title">Dean's Special Concessions Desk</h1>
          <p className="dean-view-subtitle">
            Discretionary Executive Relief for Extraordinary Medical Emergencies, National Sports Duty & Compassionate Leave
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn" onClick={() => onNavigate('academic_calendar')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Academic Calendar
          </button>
        </div>
      </div>

      {feedback && (
        <div className="dean-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Concessions List Cards */}
      <div className="dean-concessions-stack">
        {concessions.map((c) => {
          const isPending = c.status.includes('Awaiting');

          return (
            <div key={c.id} className="dean-card dean-concession-card">
              <div className="dean-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="dean-tracking-badge">{c.id}</span>
                    <h3 className="dean-card-heading" style={{ fontSize: '1.05rem' }}>
                      {c.concessionType}
                    </h3>
                  </div>
                  <div style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Student: <strong>{c.studentName}</strong> ({c.regNo}) • Dept of {c.department}
                  </div>
                </div>

                <span className={`dean-status-pill status-${c.status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  {c.status}
                </span>
              </div>

              <div className="dean-concession-body">
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Medical & Factual Justification:
                  </div>
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                    {c.justification}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#0f2b5c', fontWeight: 600 }}>
                    🏛️ {c.hodEndorsement}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Action Date: {c.actionDate}
                  </div>
                </div>

                <div className="dean-minute-quote">
                  <strong>Dean's Minute:</strong> "{c.formalMinute}"
                </div>

                {isPending && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.8rem' }}>
                    <button
                      type="button"
                      className="dean-btn-approve"
                      onClick={() => handleApproveConcession(c.id)}
                    >
                      Grant Dean's Concession
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

