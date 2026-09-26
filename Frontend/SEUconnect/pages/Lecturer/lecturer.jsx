import React from 'react';
import './lecturer.css';

export default function Lecturer({ user, onLogout }) {
  const email = user?.email || 'Lecturer@gmail.com';

  return (
    <div className="lecturer-dashboard-wrapper">
      <nav className="lecturer-navbar">
        <div className="lecturer-brand">
          <div>
            <h2 className="lecturer-brand-title">SEUConnect</h2>
            <p className="lecturer-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="lecturer-logout-btn"
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

      <main className="lecturer-content">
        <div className="lecturer-welcome-card">
          <span className="lecturer-badge">Lecturer Portal</span>
          <h1 className="lecturer-title">Welcome Lecturer</h1>
          <p className="lecturer-subtitle">
            Welcome to the Academic Staff & Course Management Portal of Faculty of Technology.
          </p>

          <div className="lecturer-info-box">
            <div className="lecturer-info-row">
              <span className="lecturer-info-label">Logged In User:</span>
              <span className="lecturer-info-value">{email}</span>
            </div>
            <div className="lecturer-info-row">
              <span className="lecturer-info-label">Role:</span>
              <span className="lecturer-info-value">Lecturer</span>
            </div>
            <div className="lecturer-info-row">
              <span className="lecturer-info-label">Faculty:</span>
              <span className="lecturer-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="lecturer-note">
            The full lecturer dashboard is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
