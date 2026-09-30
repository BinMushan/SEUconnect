import React from 'react';
import './lecturer.css';

/* =========================
   NAVBAR
========================= */
function LecturerNavbar({ user, onLogout }) {
  const email = user?.email || 'Lecturer@gmail.com';

  return (
    <nav className="lecturer-navbar">

      <div className="lecturer-navbar-left">
        <h2 className="lecturer-brand-title">SEUConnect</h2>
        <span className="lecturer-brand-divider">|</span>
        <span className="lecturer-brand-role">Lecturer Portal</span>
      </div>

      <div className="lecturer-navbar-right">

        <div className="lecturer-user-info">

          <div className="lecturer-user-avatar">
            {email.charAt(0).toUpperCase()}
          </div>

          <div className="lecturer-user-details">
            <span className="lecturer-user-name">Lecturer</span>
            <span className="lecturer-user-email">{email}</span>
          </div>

        </div>

        <button
          type="button"
          className="lecturer-logout-btn"
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


/* =========================
   SIDEBAR
========================= */
function LecturerSidebar() {

  return (
    <aside className="lecturer-sidebar">

      <div className="lecturer-sidebar-header">

        <div className="lecturer-sidebar-icon">
          🎓
        </div>

        <div>
          <h3>Academic Staff</h3>
          <p>Faculty of Technology</p>
        </div>

      </div>


      <div className="lecturer-sidebar-menu">

        <p className="lecturer-menu-title">
          MAIN MENU
        </p>


        <button className="lecturer-sidebar-item active">
          <span className="lecturer-sidebar-item-icon">🏠</span>
          <span>Dashboard</span>
        </button>


        <button className="lecturer-sidebar-item">
          <span className="lecturer-sidebar-item-icon">📚</span>
          <span>My Courses</span>
        </button>


        <button className="lecturer-sidebar-item">
          <span className="lecturer-sidebar-item-icon">👨‍🎓</span>
          <span>Students</span>
        </button>


        <button className="lecturer-sidebar-item">
          <span className="lecturer-sidebar-item-icon">📅</span>
          <span>Attendance</span>
        </button>


        <button className="lecturer-sidebar-item">
          <span className="lecturer-sidebar-item-icon">📝</span>
          <span>Results</span>
        </button>


        <p className="lecturer-menu-title lecturer-menu-title-secondary">
          ACCOUNT
        </p>


        <button className="lecturer-sidebar-item">
          <span className="lecturer-sidebar-item-icon">👤</span>
          <span>My Profile</span>
        </button>


        <button className="lecturer-sidebar-item">
          <span className="lecturer-sidebar-item-icon">⚙️</span>
          <span>Settings</span>
        </button>

      </div>


      <div className="lecturer-sidebar-footer">
        <p>South Eastern University of Sri Lanka</p>
        <span>Faculty of Technology</span>
      </div>

    </aside>
  );
}


/* =========================
   DASHBOARD
========================= */
function LecturerDashboard({ user }) {

  const email = user?.email || 'Lecturer@gmail.com';

  return (
    <main className="lecturer-dashboard">

      {/* Welcome */}
      <section className="lecturer-welcome-section">

        <div>

          <span className="lecturer-badge">
            Lecturer Portal
          </span>

          <h1 className="lecturer-title">
            Welcome, Lecturer 👋
          </h1>

          <p className="lecturer-subtitle">
            Welcome to the Academic Staff & Course Management
            Portal of the Faculty of Technology.
          </p>

        </div>

      </section>


      {/* Statistics */}
      <section className="lecturer-stats-grid">

        <div className="lecturer-stat-card">

          <div className="lecturer-stat-icon">
            📚
          </div>

          <div>
            <p>My Courses</p>
            <h2>0</h2>
          </div>

        </div>


        <div className="lecturer-stat-card">

          <div className="lecturer-stat-icon">
            👨‍🎓
          </div>

          <div>
            <p>Total Students</p>
            <h2>0</h2>
          </div>

        </div>


        <div className="lecturer-stat-card">

          <div className="lecturer-stat-icon">
            📅
          </div>

          <div>
            <p>Today's Classes</p>
            <h2>0</h2>
          </div>

        </div>


        <div className="lecturer-stat-card">

          <div className="lecturer-stat-icon">
            📝
          </div>

          <div>
            <p>Pending Results</p>
            <h2>0</h2>
          </div>

        </div>

      </section>


      {/* Lecturer Information */}
      <section className="lecturer-information-card">

        <div className="lecturer-card-header">

          <div>
            <h2>Lecturer Information</h2>
            <p>Your current SEUConnect account information</p>
          </div>

        </div>


        <div className="lecturer-info-grid">

          <div className="lecturer-info-item">
            <span className="lecturer-info-label">
              Logged In User
            </span>

            <span className="lecturer-info-value">
              {email}
            </span>
          </div>


          <div className="lecturer-info-item">
            <span className="lecturer-info-label">
              Role
            </span>

            <span className="lecturer-info-value">
              Lecturer
            </span>
          </div>


          <div className="lecturer-info-item">
            <span className="lecturer-info-label">
              Faculty
            </span>

            <span className="lecturer-info-value">
              Faculty of Technology
            </span>
          </div>


          <div className="lecturer-info-item">
            <span className="lecturer-info-label">
              University
            </span>

            <span className="lecturer-info-value">
              South Eastern University of Sri Lanka
            </span>
          </div>

        </div>

      </section>


      {/* Quick Actions */}
      <section className="lecturer-quick-actions">

        <div className="lecturer-card-header">

          <div>
            <h2>Quick Actions</h2>
            <p>Frequently used lecturer functions</p>
          </div>

        </div>


        <div className="lecturer-actions-grid">

          <button className="lecturer-action-card">

            <span className="lecturer-action-icon">
              📚
            </span>

            <div>
              <h3>Manage Courses</h3>
              <p>View and manage your courses</p>
            </div>

          </button>


          <button className="lecturer-action-card">

            <span className="lecturer-action-icon">
              📅
            </span>

            <div>
              <h3>Mark Attendance</h3>
              <p>Manage student attendance</p>
            </div>

          </button>


          <button className="lecturer-action-card">

            <span className="lecturer-action-icon">
              📝
            </span>

            <div>
              <h3>Manage Results</h3>
              <p>Enter and manage student results</p>
            </div>

          </button>


          <button className="lecturer-action-card">

            <span className="lecturer-action-icon">
              👤
            </span>

            <div>
              <h3>My Profile</h3>
              <p>View your lecturer profile</p>
            </div>

          </button>

        </div>

      </section>


      {/* Development Notice */}
      <div className="lecturer-development-notice">

        <span className="lecturer-development-icon">
          🚧
        </span>

        <div>
          <h3>More Features Coming Soon</h3>

          <p>
            The complete lecturer dashboard and academic
            management features are currently under development.
          </p>
        </div>

      </div>

    </main>
  );
}


/* =========================
   MAIN COMPONENT
========================= */
export default function Lecturer({ user, onLogout }) {

  return (
    <div className="lecturer-dashboard-wrapper">

      <LecturerNavbar
        user={user}
        onLogout={onLogout}
      />


      <div className="lecturer-body">

        <LecturerSidebar />

        <LecturerDashboard
          user={user}
        />

      </div>

    </div>
  );
}