import React from 'react';
import './dean.css';

export default function Dean({ user, onLogout }) {
  const email = user?.email || 'Dean@gmail.com';

  return (
    <div className="dean-dashboard-wrapper">
      <nav className="dean-navbar">
        <div className="dean-brand">
          <div>
            <h2 className="dean-brand-title">SEUConnect</h2>
            <p className="dean-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="dean-logout-btn"
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

      <main className="dean-content">
        <div className="dean-welcome-card">
          <span className="dean-badge">Dean Portal</span>
          <h1 className="dean-title">Welcome Dean</h1>
          <p className="dean-subtitle">
            Welcome to the Dean's Executive Office of Faculty of Technology.
          </p>

          <div className="dean-info-box">
            <div className="dean-info-row">
              <span className="dean-info-label">Logged In User:</span>
              <span className="dean-info-value">{email}</span>
            </div>
            <div className="dean-info-row">
              <span className="dean-info-label">Role:</span>
              <span className="dean-info-value">Faculty Dean</span>
            </div>
            <div className="dean-info-row">
              <span className="dean-info-label">Faculty:</span>
              <span className="dean-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="dean-note">
            The full Dean executive portal is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
