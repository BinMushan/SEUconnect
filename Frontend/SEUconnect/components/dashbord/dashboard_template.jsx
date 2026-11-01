import React, { useState } from 'react';
import { getNavSectionsForRole, getRoleMetaData } from './roleNavConfigs.jsx';
import './dashboard_template.css';

export default function DashboardTemplate({
  user,
  activeItem = 'dashboard',
  showHeroBanner,
  onNavigate,
  onLogout,
  navSections,
  actionButtons,
  heroActions,
  className = '',
  greetingText,
  metaItems,
  facultyPillText,
  notificationCount = 3,
  searchPlaceholder = 'Search portal resources, subjects, or forms...',
  onSearch,
  onAiAssistantClick,
  children
}) {
  const roleMeta = getRoleMetaData(user);
  const effectiveNavSections = navSections || getNavSectionsForRole(user?.roleKey || user?.role);

  const [internalActive, setInternalActive] = useState(activeItem);
  const currentActive = activeItem !== undefined ? activeItem : internalActive;
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Keep internalActive in sync with activeItem prop
  React.useEffect(() => {
    setInternalActive(activeItem);
  }, [activeItem]);

  // Determine if hero banner should display (hidden on pages like academic_profile)
  const shouldShowHero = showHeroBanner !== undefined
    ? showHeroBanner
    : (currentActive === 'dashboard');

  // Dynamic user details matching their role
  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const userEmail = user?.email || 'user@seu.ac.lk';
  const userRole = roleMeta?.rolePill || user?.role || 'STUDENT';
  const greeting = greetingText || roleMeta?.greeting || `Good Morning, ${userName}`;
  const effectiveFacultyPill = facultyPillText || roleMeta?.facultyPill || 'FACULTY OF TECHNOLOGY';
  const effectiveMetaItems = (metaItems && metaItems.length > 0) ? metaItems : (roleMeta?.metaItems || []);

  const userInitial = user?.avatarInitial || (userName ? userName.charAt(0).toUpperCase() + '.' : 'U.');

  const handleItemClick = (id) => {
    setInternalActive(id);
    if (typeof onNavigate === 'function') {
      onNavigate(id);
    }
  };

  return (
    <div className={`seu-dash-layout ${className}`.trim()}>
      {/* ====================================================================
          LEFT SIDEBAR (Dark Navy Portal Menu - Changes by Role)
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

        {/* Scrollable Navigation Sections - Dynamically tailored to user's role */}
        <nav className="seu-sidebar-nav-container">
          {effectiveNavSections.map((section) => (
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
            <div
              className="seu-topbar-user-profile"
              title={`Signed in as ${userName}`}
              onClick={() => handleItemClick('academic_profile')}
              style={{ cursor: 'pointer' }}
            >
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
        {shouldShowHero && (
          <section className="seu-dash-hero-banner">
            <div className="seu-hero-banner-top-row">
              <span className="seu-hero-institution-pill">
                {effectiveFacultyPill}
              </span>

              {/* Top Right Action Buttons */}
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
                        {user?.role === 'student' ? 'View GPA Report' : 'Department Reports'}
                      </button>

                      <button type="button" className="seu-btn-faculty-forms">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        {user?.role === 'student' ? 'Faculty Forms' : 'Faculty Regulations'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Main Greeting & Display Name */}
            <h1 className="seu-hero-greeting-title">{greeting}</h1>

            {/* Role-Specific Meta Info Line */}
            <div className="seu-hero-meta-row">
              {effectiveMetaItems.map((meta, idx) => (
                <React.Fragment key={idx}>
                  <span>{meta.label} <span className="seu-hero-meta-strong">{meta.value}</span></span>
                  {idx < effectiveMetaItems.length - 1 && <span className="seu-hero-meta-divider">•</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Bottom Hero Actions (e.g. Mark Attendance, Upload CA Marks) */}
            {heroActions && (
              <div className="seu-hero-bottom-actions">
                {heroActions}
              </div>
            )}
          </section>
        )}

        {/* 3. MAIN DASHBOARD BODY (Where role content is injected) */}
        <main className="seu-dash-body-content">
          {children}
        </main>
      </div>
    </div>
  );
}
