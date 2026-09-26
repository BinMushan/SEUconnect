import React from 'react';
import './examination.css';

export default function Examination({ user, onLogout }) {
  const email = user?.email || 'Examination@gmail.com';

  return (
    <div className="examination-dashboard-wrapper">
      <nav className="examination-navbar">
        <div className="examination-brand">
          <div>
            <h2 className="examination-brand-title">SEUConnect</h2>
            <p className="examination-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="examination-logout-btn"
          onClick={onLogout}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </nav>

      <main className="examination-content">
        <div className="examination-welcome-card">
          <span className="examination-badge">Examination Officer Portal</span>
          <h1 className="examination-title">Welcome Examination Officer</h1>
          <p className="examination-subtitle">
            Welcome to the Examination & Confidential Academic Records Portal of Faculty of Technology.
          </p>

          <div className="examination-info-box">
            <div className="examination-info-row">
              <span className="examination-info-label">Logged In User:</span>
              <span className="examination-info-value">{email}</span>
            </div>
            <div className="examination-info-row">
              <span className="examination-info-label">Role:</span>
              <span className="examination-info-value">Examination Officer</span>
            </div>
            <div className="examination-info-row">
              <span className="examination-info-label">Faculty:</span>
              <span className="examination-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="examination-note">
            The full Examination Officer dashboard is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
