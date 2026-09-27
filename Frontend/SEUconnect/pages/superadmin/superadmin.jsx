import React from 'react';
import './superadmin.css';

export default function SuperAdmin({ user, onLogout }) {
  const email = user?.email || 'SuperAdmin@gmail.com';

  return (
    <div className="superadmin-dashboard-wrapper">
      <nav className="superadmin-navbar">
        <div className="superadmin-brand">
          <div>
            <h2 className="superadmin-brand-title">SEUConnect</h2>
            <p className="superadmin-brand-sub">South Eastern University of Sri Lanka • Faculty of Technology</p>
          </div>
        </div>
        <button
          type="button"
          className="superadmin-logout-btn"
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

      <main className="superadmin-content">
        <div className="superadmin-welcome-card">
          <span className="superadmin-badge">Super Admin Portal</span>
          <h1 className="superadmin-title">Welcome Super Admin</h1>
          <p className="superadmin-subtitle">
            Welcome to the Master Infrastructure & Security Command Console.
          </p>

          <div className="superadmin-info-box">
            <div className="superadmin-info-row">
              <span className="superadmin-info-label">Logged In User:</span>
              <span className="superadmin-info-value">{email}</span>
            </div>
            <div className="superadmin-info-row">
              <span className="superadmin-info-label">Role:</span>
              <span className="superadmin-info-value">Super Admin</span>
            </div>
            <div className="superadmin-info-row">
              <span className="superadmin-info-label">Faculty:</span>
              <span className="superadmin-info-value">Faculty of Technology</span>
            </div>
          </div>

          <p className="superadmin-note">
            The full Super Administrator master console is currently under development.
          </p>
        </div>
      </main>
    </div>
  );
}
