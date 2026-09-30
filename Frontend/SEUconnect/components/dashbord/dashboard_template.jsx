import React, { useState } from 'react';
import './dashboard_template.css';

/**
 * Standard Navigation Sections matching the SEUConnect portal design
 */
const DEFAULT_NAV_SECTIONS = [
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
    title: 'ACADEMIC',
    items: [
      {
        id: 'academic_profile',
        label: 'Academic Profile',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      },
      {
        id: 'semester_registration',
        label: 'Semester Registration',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="m9 14 2 2 4-4" />
          </svg>
        )
      },
      {
        id: 'medical_requests',
        label: 'Medical Requests',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        )
      },
      {
        id: 'examinations',
        label: 'Examinations',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )
      },
      {
        id: 'results',
        label: 'Results',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        )
      },
      {
        id: 'gpa_cgpa',
        label: 'GPA / CGPA',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        )
      },
      {
        id: 'academic_progress',
        label: 'Academic Progress',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'STUDENT SERVICES',
    items: [
      {
        id: 'process_guidance',
        label: 'Process Guidance',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        )
      },
      {
        id: 'welfare_scholarships',
        label: 'Welfare & Scholarships',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        )
      },
      {
        id: 'societies_clubs',
        label: 'Societies & Clubs',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      {
        id: 'faculty_forms',
        label: 'Faculty Forms & Instructions',
        hasSubmenu: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        )
      },
      {
        id: 'penalties_disciplinary',
        label: 'Penalties / Disciplinary',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
          </svg>
        )
      }
    ]
  }
];

export default function DashboardTemplate({
  user,
  activeItem = 'dashboard',
  onNavigate,
  onLogout,
  navSections = DEFAULT_NAV_SECTIONS,
  actionButtons,
  heroActions,
  className = '',
  greetingText,
  metaItems,
  facultyPillText = 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY',
  notificationCount = 3,
  searchPlaceholder = 'Search portal resources, subjects, or forms...',
  onSearch,
  onAiAssistantClick,
  children
}) {
  const [currentActive, setCurrentActive] = useState(activeItem);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Default values matching the screenshot exactly
  const userName = user?.name || 'M.N.M. Afnan';
  const userEmail = user?.email || '22ict085@seu.ac.lk';
  const userRegNo = user?.regNo || '22ICT085';
  const userProgramme = user?.programme || 'BICT';
  const userSemester = user?.semester || 'Semester 05';
  const userSpecialization = user?.specialization || 'Software Systems';
  const userRole = user?.role || 'STUDENT';
  const greeting = greetingText || `Good Morning, ${userName}`;

  // Avatar initial: 'M.' as shown in screenshot
  const userInitial = user?.avatarInitial || (userName ? userName.charAt(0).toUpperCase() + '.' : 'M.');

  const handleItemClick = (id) => {
    setCurrentActive(id);
    if (typeof onNavigate === 'function') {
      onNavigate(id);
    }
  };

  return (
    <div className={`seu-dash-layout ${className}`.trim()}>
      {/* ====================================================================
          LEFT SIDEBAR (Dark Navy Portal Menu)
          ==================================================================== */}
      <aside className="seu-dash-sidebar">
        {/* Brand Header */}
        <div className="seu-sidebar-brand">
          <div className="seu-sidebar-logo-box">
            <img src="/seusl_logo_white.png?v=3" alt="SEUSL Logo" className="seu-sidebar-logo-img" />
          </div>
          <div className="seu-sidebar-brand-meta">
            <span className="seu-sidebar-brand-name">SEUConnect</span>
            <span className="seu-sidebar-brand-faculty">FACULTY OF TECHNOLOGY</span>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="seu-sidebar-nav-container">
          {navSections.map((section) => (
            <div key={section.title} className="seu-nav-section-group">
              <div className="seu-nav-section-title">{section.title}</div>
              {section.items.map((item) => {
                const isActive = currentActive === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`seu-nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="seu-nav-item-left">
                      <span className="seu-nav-item-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.hasSubmenu && (
                      <span className="seu-nav-chevron">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer (AI Assistant & Sign Out) */}
        <div className="seu-sidebar-footer">
          <button
            type="button"
            className="seu-ai-assistant-btn"
            onClick={onAiAssistantClick || (() => alert('SEUConnect AI Assistant: How can I help you today?'))}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4" />
              <rect x="4" y="6" width="16" height="13" rx="3" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              <path d="M9 16h6" />
              <path d="M2 11h2" />
              <path d="M20 11h2" />
            </svg>
            SEUConnect AI Assistant
          </button>

          <button
            type="button"
            className="seu-signout-link-btn"
            onClick={onLogout}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ====================================================================
          MAIN VIEW AREA (Top Bar + Hero Banner + Content Body)
          ==================================================================== */}
      <div className={`seu-dash-main ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* 1. TOP NAVIGATION BAR */}
        <header className="seu-dash-topbar">
          {/* Topbar Search positioned on the left */}
          <form
            className="seu-topbar-search-wrapper"
            onSubmit={(e) => {
              e.preventDefault();
              if (typeof onSearch === 'function') onSearch(searchQuery);
            }}
          >
            <span className="seu-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="seu-topbar-search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Topbar Right Actions */}
          <div className="seu-topbar-actions">
            <span className="seu-role-pill-badge">{userRole}</span>

            {/* Dark Mode Icon */}
            <button
              type="button"
              className={`seu-icon-action-btn ${isDarkMode ? 'active' : ''}`}
              title="Toggle Theme"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>

            {/* Notifications */}
            <button type="button" className="seu-icon-action-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span className="seu-notif-badge">{notificationCount}</span>
              )}
            </button>

            {/* User Profile */}
            <div className="seu-topbar-user-profile" title={`Signed in as ${userName}`}>
              <div className="seu-user-avatar-circle">
                {userInitial}
              </div>
              <div className="seu-user-name-meta">
                <span className="seu-user-display-name">{userName}</span>
                <span className="seu-user-display-email">{userEmail}</span>
              </div>
              <span className="seu-user-dropdown-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>
        </header>

        {/* 2. DISPLAY NAME SECTION / HERO BANNER */}
        <section className="seu-dash-hero-banner">
          <div className="seu-hero-banner-top-row">
            <span className="seu-hero-institution-pill">
              {facultyPillText}
            </span>            {/* Top Right Action Buttons */}
            {actionButtons !== null && (
              <div className="seu-hero-banner-actions">
                {actionButtons ? (
                  actionButtons
                ) : (
                  <>
                    <button type="button" className="seu-btn-gpa-report">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                      View GPA Report
                    </button>

                    <button type="button" className="seu-btn-faculty-forms">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      Faculty Forms
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Main Greeting & Display Name */}
          <h1 className="seu-hero-greeting-title">{greeting}</h1>

          {/* Meta Info Line */}
          <div className="seu-hero-meta-row">
            {metaItems && metaItems.length > 0 ? (
              metaItems.map((meta, idx) => (
                <React.Fragment key={idx}>
                  <span>{meta.label} <span className="seu-hero-meta-strong">{meta.value}</span></span>
                  {idx < metaItems.length - 1 && <span className="seu-hero-meta-divider">•</span>}
                </React.Fragment>
              ))
            ) : (
              <>
                <span>Reg No: <span className="seu-hero-meta-strong">{userRegNo}</span></span>
                <span className="seu-hero-meta-divider">•</span>
                <span>Programme: <span className="seu-hero-meta-strong">{userProgramme}</span></span>
                <span className="seu-hero-meta-divider">•</span>
                <span>Current: <span className="seu-hero-meta-strong">{userSemester}</span></span>
                <span className="seu-hero-meta-divider">•</span>
                <span>Specialization: <span className="seu-hero-meta-strong">{userSpecialization}</span></span>
              </>
            )}
          </div>

          {/* Bottom Hero Actions (e.g. Mark Attendance, Upload CA Marks) */}
          {heroActions && (
            <div className="seu-hero-bottom-actions">
              {heroActions}
            </div>
          )}
        </section>

        {/* 3. MAIN DASHBOARD BODY (Where team members inject their role content) */}
        <main className="seu-dash-body-content">
          {children ? (
            children
          ) : (
            <div className="seu-dash-placeholder-box">
              <h3 className="seu-dash-placeholder-title">Welcome to SEUConnect Portal</h3>
              <p className="seu-dash-placeholder-desc">
                This reusable dashboard template shell is ready. Team members can import 
                <code>DashboardTemplate</code> and render their specific role modules, metric widgets, and tables as children.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
