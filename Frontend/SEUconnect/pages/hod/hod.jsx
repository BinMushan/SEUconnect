import React from 'react';
import './hod.css';

export default function HOD({ user, onLogout }) {
  const email = user?.email || 'HOD@gmail.com';

  return (

<nav className="hod-navbar">
  <div className="hod-brand">
    <div className="hod-brand-logo">
      SEU
    </div>

    <div className="hod-brand-text">
      <h2 className="hod-brand-title">SEUConnect</h2>
      <p className="hod-brand-sub">
        South Eastern University of Sri Lanka
      </p>
      <span className="hod-brand-department">
        Faculty of Technology • HOD Portal
      </span>
    </div>
  </div>

  <div className="hod-header-right">
    <div className="hod-user-info">
      <span className="hod-user-role">Head of Department</span>
      <span className="hod-user-email">{email}</span>
    </div>

    <button
      type="button"
      className="hod-logout-btn"
      onClick={onLogout}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Logout
    </button>
  </div>
</nav>
  );
}