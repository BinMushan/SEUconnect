import React from 'react';
import './lecturer.css';
import DashboardTemplate from '../../components/dashbord/dashboard_template.jsx';


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

/**
 * Lecturer Navigation Sections matching Screenshot 1
 */
const LECTURER_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'ACADEMIC INSTRUCTION',
    items: [
      {
        id: 'assigned_courses',
        label: 'My Assigned Courses',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        )
      },
      {
        id: 'record_attendance',
        label: 'Record Attendance',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="9" y1="11" x2="15" y2="11" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )
      },
      {
        id: 'continuous_assessment',
        label: 'Continuous Assessment (CA)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      },
      {
        id: 'end_semester_exam',
        label: 'End Semester Exam (ESA)',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'SERVICES & FORMS',
    items: [
      {
        id: 'faculty_forms',
        label: 'Faculty Forms & Documents',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        )
      },
      {
        id: 'faculty_notices',
        label: 'Faculty Notices',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )
      },
      {
        id: 'my_profile',
        label: 'My Profile',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      }
    ]
  }
];

/**
 * Lecturer Metadata items matching Screenshot 2
 */
const LECTURER_META_ITEMS = [
  { label: 'Staff ID:', value: 'LEC-FT-001' },
  { label: 'Designation:', value: 'Senior Lecturer Gr. I & Head of Department' },
  { label: 'Department:', value: 'Department of Information and Communication Technology' }
];

export default function Lecturer({ user, onLogout }) {
  const lecturerUser = {
    name: user?.name || 'Dr. R. Ketheeswaran',
    email: user?.email || 'ketheeswaran@seu.ac.lk',
    role: 'LECTURER',
    avatarInitial: 'Dr.',
    ...user
  };

  // Bottom action buttons matching Screenshot 2
  const lecturerHeroActions = (
    <>
      <button type="button" className="seu-btn-attendance">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="9" y1="11" x2="15" y2="11" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        Mark Attendance
      </button>

      <button type="button" className="seu-btn-ca-marks">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Upload CA Marks
      </button>
    </>
  );

  return (
    <DashboardTemplate
      user={lecturerUser}
      onLogout={onLogout}
      activeItem="dashboard"
      className="lecturer-portal"
      facultyPillText="SOUTH EASTERN UNIVERSITY OF SRI LANKA · FACULTY OF TECHNOLOGY"
      greetingText="Good Morning, Dr. R. Ketheeswaran"
      metaItems={LECTURER_META_ITEMS}
      navSections={LECTURER_NAV_SECTIONS}
      actionButtons={null}
      heroActions={lecturerHeroActions}
    >
      {/* Lecturer modules, cards, or custom widgets can be placed here as children */}
    </DashboardTemplate>
  );
}

