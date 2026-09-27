import React from 'react';
import './hod.css';

export default function HOD({ user, onLogout }) {
  const email = user?.email || 'HOD@gmail.com';

  return (
    <div className="hod-dashboard-wrapper">
      <nav className="hod-navbar">
        <div className="hod-brand">
          <div>
            <h2 className="hod-brand-title">SEUConnect</h2>
            <p className="hod-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="hod-logout-btn"
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

      <main className="hod-content">
        <div className="hod-welcome-card">
          <span className="hod-badge">HOD Portal</span>
          <h1 className="hod-title">Welcome HOD</h1>
          <p className="hod-subtitle">
            Welcome to the Head of Department Administrative Desk of Faculty of Technology.
          </p>

          <div className="hod-info-box">
            <div className="hod-info-row">
              <span className="hod-info-label">Logged In User:</span>
              <span className="hod-info-value">{email}</span>
            </div>
            <div className="hod-info-row">
              <span className="hod-info-label">Role:</span>
              <span className="hod-info-value">Head of Department (HOD)</span>
            </div>
            <div className="hod-info-row">
              <span className="hod-info-label">Faculty:</span>
              <span className="student-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="hod-note">
            The full HOD administrative dashboard is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
