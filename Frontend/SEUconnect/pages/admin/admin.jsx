import React from 'react';
import './admin.css';

export default function Admin({ user, onLogout }) {
  const email = user?.email || 'Admin@gmail.com';

  return (
    <div className="admin-dashboard-wrapper">
      <nav className="admin-navbar">
        <div className="admin-brand">
          <div>
            <h2 className="admin-brand-title">SEUConnect</h2>
            <p className="admin-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="admin-logout-btn"
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

      <main className="admin-content">
        <div className="admin-welcome-card">
          <span className="admin-badge">Admin Portal</span>
          <h1 className="admin-title">Welcome Admin</h1>
          <p className="admin-subtitle">
            Welcome to the System Administration & Faculty Services Portal.
          </p>

          <div className="admin-info-box">
            <div className="admin-info-row">
              <span className="admin-info-label">Logged In User:</span>
              <span className="admin-info-value">{email}</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Role:</span>
              <span className="admin-info-value">System Administrator</span>
            </div>
            <div className="admin-info-row">
              <span className="admin-info-label">Faculty:</span>
              <span className="admin-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="admin-note">
            The full Administrator control dashboard is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
