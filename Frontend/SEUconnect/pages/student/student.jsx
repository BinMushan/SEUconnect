import React from 'react';
import './student.css';

export default function Student({ user, onLogout }) {
  const email = user?.email || 'Student@gmail.com';

  return (
    <div className="student-dashboard-wrapper">
      <nav className="student-navbar">
        <div className="student-brand">
          <div>
            <h2 className="student-brand-title">SEUConnect</h2>
            <p className="student-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="student-logout-btn"
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

      <main className="student-content">
        <div className="student-welcome-card">
          <span className="student-badge">Student Portal</span>
          <h1 className="student-title">Welcome Student</h1>
          <p className="student-subtitle">
            Welcome to the Student Academic Portal of Faculty of Technology.
          </p>

          <div className="student-info-box">
            <div className="student-info-row">
              <span className="student-info-label">Logged In User:</span>
              <span className="student-info-value">{email}</span>
            </div>
            <div className="student-info-row">
              <span className="student-info-label">Role:</span>
              <span className="student-info-value">Student</span>
            </div>
            <div className="student-info-row">
              <span className="student-info-label">Faculty:</span>
              <span className="student-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="student-note">
            The full student dashboard is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
