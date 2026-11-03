import React, { useState } from 'react';
import { OFFICIAL_SANCTIONS_SEALS, DEAN_INFO } from '../deanData.js';

export default function OfficialSanctionsSeals({ onNavigate }) {
  const [seals, setSeals] = useState(OFFICIAL_SANCTIONS_SEALS);
  const [isIssuing, setIsIssuing] = useState(false);
  const [decreeTitle, setDecreeTitle] = useState('');
  const [authority, setAuthority] = useState('Dean Executive Authority under Statute 14');
  const [feedback, setFeedback] = useState('');

  const handleIssueDecree = (e) => {
    e.preventDefault();
    if (!decreeTitle.trim()) return;

    const newSeal = {
      sealId: `SEAL-DEAN-2026-${String(seals.length + 43).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      decreeTitle,
      authority,
      verificationHash: `SHA256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      status: 'Gazetted & Sealed',
      certifiedBy: DEAN_INFO.name,
    };

    setSeals([newSeal, ...seals]);
    setIsIssuing(false);
    setDecreeTitle('');
    setFeedback(`Official Dean's Executive Decree ${newSeal.sealId} gazetted and authenticated with cryptographic seal.`);
    setTimeout(() => setFeedback(''), 5000);
  };

  return (
    <div className="dean-view-container">
      {/* 1. Header Banner */}
      <div className="dean-view-header-banner">
        <div className="dean-header-banner-left">
          <span className="dean-banner-tag">STATUTORY SEALS & DECREES</span>
          <h1 className="dean-view-title">Official Sanctions & Digital Seals Register</h1>
          <p className="dean-view-subtitle">
            Authentic Verification Registry for Faculty Degrees, Academic Sanctions, Curricular By-Laws & Official Orders
          </p>
        </div>
        <div className="dean-banner-actions">
          <button type="button" className="dean-banner-btn primary" onClick={() => setIsIssuing(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 21h14" />
              <path d="M5 17h14" />
              <path d="M12 3v10" />
              <path d="M7 7l5-4 5 4" />
              <rect x="6" y="13" width="12" height="4" rx="1" />
            </svg>
            Affix New Dean's Seal
          </button>
        </div>
      </div>

      {feedback && (
        <div className="dean-alert-banner success">
          <span>✓ {feedback}</span>
          <button type="button" onClick={() => setFeedback('')}>✕</button>
        </div>
      )}

      {/* 2. Seals Register */}
      <div className="dean-seals-stack">
        {seals.map((seal) => (
          <div key={seal.sealId} className="dean-card dean-seal-card">
            <div className="dean-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="dean-tracking-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                    {seal.sealId}
                  </span>
                  <h3 className="dean-card-heading" style={{ fontSize: '1.05rem' }}>
                    {seal.decreeTitle}
                  </h3>
                </div>
                <div style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  📅 Date Issued: {seal.date} • Certified By: <strong>{seal.certifiedBy}</strong>
                </div>
              </div>

              <span className="dean-badge-green">✓ {seal.status}</span>
            </div>

            <div className="dean-seal-body">
              <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#334155' }}>
                <strong>Statutory Authority:</strong> {seal.authority}
              </div>

              <div className="dean-hash-box">
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Cryptographic Verification Seal:</span>
                <span className="dean-hash-text">{seal.verificationHash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Issue Seal Modal */}
      {isIssuing && (
        <div className="dean-modal-overlay" onClick={() => setIsIssuing(false)}>
          <div className="dean-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dean-modal-header">
              <div>
                <h3 className="dean-modal-title">Affix Official Dean's Executive Seal</h3>
                <p className="dean-modal-sub">Certified under the Seal of Dean Prof. Rifai Kariapper</p>
              </div>
              <button type="button" className="dean-modal-close-btn" onClick={() => setIsIssuing(false)}>✕</button>
            </div>
            <form onSubmit={handleIssueDecree}>
              <div className="dean-modal-body">
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="dean-form-label">Official Sanction / Decree Title</label>
                  <input
                    type="text"
                    className="dean-input"
                    placeholder="e.g. Ratification of 2026/27 Intake Capacity Allocation"
                    value={decreeTitle}
                    onChange={(e) => setDecreeTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <label className="dean-form-label">Statutory Legal Authority</label>
                  <input
                    type="text"
                    className="dean-input"
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                  />
                </div>
              </div>
              <div className="dean-modal-footer">
                <button type="button" className="dean-btn-outline" onClick={() => setIsIssuing(false)}>Cancel</button>
                <button type="submit" className="dean-btn-approve">Affix Digital Seal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

