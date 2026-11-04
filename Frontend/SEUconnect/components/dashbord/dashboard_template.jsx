import React, { useState, useEffect, useRef } from 'react';
import { getNavSectionsForRole, getRoleMetaData } from './roleNavConfigs.jsx';
import api from '../../src/services/api.js';
import './dashboard_template.css';

/**
 * Standard Navigation Sections matching the SEUConnect portal design
 */
export const DEFAULT_NAV_SECTIONS = [
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
        subItems: [
          { id: 'forms_all', label: 'All Forms & Circulars' },
          { id: 'forms_exam', label: 'Examination Forms' },
          { id: 'forms_medical', label: 'Medical & Attendance' },
          { id: 'forms_piv', label: "People's Bank PIV Voucher" }
        ],
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
  searchPlaceholder,
  onSearch,
  onAiAssistantClick,
  children
  
}) {
  const roleKey = (user?.roleKey || user?.role || 'student').toLowerCase();
  const roleMeta = getRoleMetaData(user);

  // Automatically resolve role-tailored navSections when not explicitly passed
  const effectiveNavSections = navSections || getNavSectionsForRole(roleKey) || DEFAULT_NAV_SECTIONS;
  const [currentActive, setCurrentActive] = useState(activeItem);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('seu_theme_dark') === 'true';
      } catch (_) {}
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('seu_theme_dark', String(next));
        } catch (_) {}
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, [isDarkMode]);

  const [openSubmenus, setOpenSubmenus] = useState({ faculty_forms: true });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('seu_sidebar_collapsed') === 'true';
      } catch (_) {}
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('seu_sidebar_collapsed', String(next));
        } catch (_) {}
      }
      return next;
    });
  };

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  // Keep currentActive in sync with activeItem prop
  useEffect(() => {
    setCurrentActive(activeItem);
  }, [activeItem]);

  // Interactive Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(notificationCount || 0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const notifRef = useRef(null);

  // Outside click listener for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch role-tailored notifications with polling
  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications({
        role: user?.roleKey || user?.role,
        department: user?.department,
        email: user?.email,
      });
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount !== undefined ? res.unreadCount : res.data.filter(n => !n.isRead).length);
      }
    } catch {
      // Fallback for offline demo
      if (notifications.length === 0) {
        const role = (user?.roleKey || user?.role || '').toLowerCase();
        let fallback = [];
        if (role === 'dean') {
          fallback = [
            {
              _id: 'n_d1',
              title: 'HOD Endorsement: Credit Exemption Request',
              message: 'HOD ICT M.J Ahamed Sabani endorsed request REQ-2026-0420 (K.M. Nuwais) for Dean Executive Ratification.',
              type: 'endorsement',
              trackingNumber: 'REQ-2026-0420',
              targetTab: 'dean_sanctions',
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 35),
            },
            {
              _id: 'n_d2',
              title: 'Awaiting Dean Approval: BST Practicum Rescheduling',
              message: 'Dr. M.G. Mohamed Thariq (HOD BST) forwarded special concession viva defense REQ-2026-0318 for Faculty Board sanction.',
              type: 'approval_request',
              trackingNumber: 'REQ-2026-0318',
              targetTab: 'dean_sanctions',
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 120),
            },
            {
              _id: 'n_d3',
              title: 'Faculty Academic Calendar Notice',
              message: 'Semester 05 Mid-Semester examination board clearance scheduling finalized for BST and ICT departments.',
              type: 'announcement',
              trackingNumber: '',
              targetTab: 'academic_calendar',
              isRead: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            },
          ];
        } else if (role === 'hod') {
          fallback = [
            {
              _id: 'n_h1',
              title: 'Awaiting HOD Sign-Off: Repeat Exam Entry',
              message: 'Dr. S. Kirushanth verified CA mark (24/30) for REP-2026-0105 (A.R. Fathima). Pending HOD Sign-off.',
              type: 'approval_request',
              trackingNumber: 'REP-2026-0105',
              targetTab: 'dashboard',
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 25),
            },
            {
              _id: 'n_h2',
              title: 'Successfully Endorsed to Dean: REQ-2026-0420',
              message: 'Your endorsement for K.M. Nuwais has been transferred to Faculty Executive Office (Dean Prof. Rifai Kariapper).',
              type: 'endorsement',
              trackingNumber: 'REQ-2026-0420',
              targetTab: 'dashboard',
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 90),
            },
            {
              _id: 'n_h3',
              title: 'Lecturer Submission: Academic Workload Verification',
              message: 'Semester 05 CA moderation sheets submitted by Software Technologies (SWT) module leaders for HOD audit.',
              type: 'workload',
              trackingNumber: '',
              targetTab: 'ca_marks',
              isRead: true,
              createdAt: new Date(Date.now() - 1000 * 60 * 300),
            },
          ];
        }
        setNotifications(fallback);
        setUnreadCount(fallback.filter(n => !n.isRead).length);
      }
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.role, user?.roleKey, user?.email]);

  const handleMarkSingleRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n._id === notifId || n.id === notifId ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.markNotificationRead(notifId);
    } catch {
      // offline fallback
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead({
        role: user?.roleKey || user?.role,
        email: user?.email,
      });
    } catch {
      // offline fallback
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkSingleRead(notif._id || notif.id);
    }
    setIsNotifOpen(false);

    // Navigate to the target page/tab if available
    if (notif.targetTab) {
      handleItemClick(notif.targetTab);
    }
  };

  const formatNotifTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayedNotifs = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.isRead;
    return true;
  });

  // Determine if hero banner should display (hidden on pages like academic_profile)
  const shouldShowHero = showHeroBanner !== undefined
    ? showHeroBanner
    : (currentActive === 'dashboard');

  // Role-tailored dynamic values
  const userName = user?.name || (roleKey === 'student' ? 'M.N.M. Afnan' : 'Portal User');
  const userEmail = user?.email || (roleKey === 'student' ? '22ict085@seu.ac.lk' : `${roleKey}@seu.ac.lk`);
  const userRegNo = user?.regNo || '22ICT085';
  const userProgramme = user?.programme || 'BICT';
  const userSemester = user?.semester || 'Semester 05';
  const userSpecialization = user?.specialization || 'Software Systems';
  const userRole = (user?.role ? user.role : (roleMeta.rolePill || 'STUDENT')).toUpperCase();
  const greeting = greetingText || roleMeta.greeting || `Good Morning, ${userName}`;
  const effectiveFacultyPill = facultyPillText || roleMeta.facultyPill || 'SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY';
  const effectiveMetaItems = metaItems || roleMeta.metaItems;
  const effectiveSearchPlaceholder = searchPlaceholder || (roleKey === 'student' ? 'Search portal resources, subjects, or forms...' : `Search ${userRole.toLowerCase()} resources, records, or files...`);

  // Avatar initial: dynamic based on role/user
  const userInitial = user?.avatarInitial || (userName ? userName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'U');

  const handleItemClick = (id) => {
    setCurrentActive(id);
    setMobileNavOpen(false);
    if (typeof onNavigate === 'function') {
      onNavigate(id);
    }
  };

  return (
    <div className={`seu-dash-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isDarkMode ? 'dark-mode' : ''} ${className}`.trim()}>
      {/* Small Toggle on the Right Edge of the Left Sidebar */}
      <button
        type="button"
        className={`seu-sidebar-edge-toggle ${isSidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebarCollapse}
        title={isSidebarCollapsed ? "Open sidebar" : "Minimize sidebar (Full screen)"}
        aria-label="Toggle sidebar"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          {isSidebarCollapsed ? (
            <polyline points="9 18 15 12 9 6" />
          ) : (
            <polyline points="15 18 9 12 15 6" />
          )}
        </svg>
      </button>
      {/* Mobile Backdrop Overlay */}
      {mobileNavOpen && (
        <div
          className="seu-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ====================================================================
          LEFT SIDEBAR (Dark Navy Portal Menu)
          ==================================================================== */}
      <aside className={`seu-dash-sidebar ${mobileNavOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="seu-sidebar-brand">
          <div className="seu-sidebar-logo-box">
            <img src="/seusl_logo_white.png?v=3" alt="SEUSL Logo" className="seu-sidebar-logo-img" />
          </div>
          <div className="seu-sidebar-brand-meta">
            <span className="seu-sidebar-brand-name">SEUConnect</span>
            <span className="seu-sidebar-brand-faculty">FACULTY OF TECHNOLOGY</span>
          </div>
          <button
            type="button"
            className="seu-sidebar-mobile-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="seu-sidebar-nav-container">
          {effectiveNavSections.map((section) => (
            <div key={section.title} className="seu-nav-section-group">
              <div className="seu-nav-section-title">{section.title}</div>
              {section.items.map((item) => {
                const isDirectActive = currentActive === item.id;
                const isSubActive = item.subItems && item.subItems.some((s) => s.id === currentActive);
                const isSubmenuOpen = openSubmenus[item.id] !== undefined ? !!openSubmenus[item.id] : (isSubActive || isDirectActive);
                const isActive = isDirectActive || (!isSubmenuOpen && isSubActive);

                return (
                  <div key={item.id} className="seu-nav-item-container">
                    <button
                      type="button"
                      className={`seu-nav-item-btn ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (item.hasSubmenu) {
                          setOpenSubmenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                          handleItemClick(item.subItems ? item.subItems[0].id : item.id);
                        } else {
                          handleItemClick(item.id);
                        }
                      }}
                    >
                      <div className="seu-nav-item-left">
                        <span className="seu-nav-item-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="seu-nav-item-badge">
                          {item.badge}
                        </span>
                      )}
                      {item.hasSubmenu && (
                        <span className="seu-nav-chevron">
                          {isSubmenuOpen ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          )}
                        </span>
                      )}
                    </button>

                    {item.hasSubmenu && isSubmenuOpen && item.subItems && (
                      <div className="seu-nav-submenu-list">
                        {item.subItems.map((sub) => {
                          const isThisSubActive = currentActive === sub.id;
                          return (
                            <button
                              key={sub.id}
                              type="button"
                              className={`seu-nav-subitem-btn ${isThisSubActive ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(sub.id);
                              }}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="seu-mobile-menu-btn"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

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
              placeholder={effectiveSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Topbar Right Actions */}
          <div className="seu-topbar-actions">
            <span className="seu-role-pill-badge">{userRole}</span>

            {/* Dark Mode / Light Mode Theme Toggle */}
            <button
              type="button"
              className={`seu-icon-action-btn ${isDarkMode ? 'active' : ''}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Interactive Notifications Bell & Dropdown */}
            <div className="seu-notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`seu-icon-action-btn ${isNotifOpen ? 'active' : ''}`}
                title="Notifications"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-expanded={isNotifOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="seu-notif-badge">{unreadCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="seu-notif-dropdown">
                  <div className="seu-notif-header">
                    <div className="seu-notif-header-title">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="seu-notif-count-pill">{unreadCount} unread</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="seu-notif-mark-all-btn"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="seu-notif-filter-bar">
                    <button
                      type="button"
                      className={`seu-notif-filter-btn ${notifFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setNotifFilter('all')}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      type="button"
                      className={`seu-notif-filter-btn ${notifFilter === 'unread' ? 'active' : ''}`}
                      onClick={() => setNotifFilter('unread')}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  <div className="seu-notif-list">
                    {displayedNotifs.length === 0 ? (
                      <div className="seu-notif-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        No {notifFilter === 'unread' ? 'unread ' : ''}notifications at this time
                      </div>
                    ) : (
                      displayedNotifs.map((n, idx) => {
                        const iconType = n.type || 'general';
                        return (
                          <div
                            key={n._id || n.id || `notif-${idx}`}
                            className={`seu-notif-item ${!n.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotifClick(n)}
                          >
                            <div className="seu-notif-icon-col">
                              <div className={`seu-notif-icon-wrap ${iconType}`}>
                                {iconType === 'endorsement' && '🛡️'}
                                {iconType === 'approval_request' && '⏱️'}
                                {iconType === 'approved' && '✅'}
                                {(iconType === 'returned' || iconType === 'declined' || iconType === 'correction') && '⚠️'}
                                {iconType === 'workload' && '📋'}
                                {(iconType === 'announcement' || iconType === 'general') && '📢'}
                              </div>
                            </div>

                            <div className="seu-notif-content-col">
                              <div className="seu-notif-item-top">
                                <span className="seu-notif-item-title">{n.title}</span>
                                {!n.isRead && <span className="seu-notif-item-unread-dot" title="Unread" />}
                              </div>
                              <p className="seu-notif-item-msg">{n.message}</p>
                              <div className="seu-notif-item-meta">
                                <span>{formatNotifTime(n.createdAt)}</span>
                                {n.trackingNumber && (
                                  <span className="seu-notif-item-badge">{n.trackingNumber}</span>
                                )}
                              </div>
                            </div>

                            {!n.isRead && (
                              <button
                                type="button"
                                className="seu-notif-mark-single-btn"
                                title="Mark as Read"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkSingleRead(n._id || n.id);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="seu-notif-footer">
                    <span className="seu-notif-live-badge">
                      <span className="seu-notif-live-dot" /> Live System Feed
                    </span>
                    <span>Role-Synchronized</span>
                  </div>
                </div>
              )}
            </div>

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
                  ) : heroActions ? (
                    heroActions
                  ) : roleKey === 'student' ? (
                    <>
                      <button type="button" className="seu-btn-gpa-report">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                        View GPA Report
                      </button>

                      <button type="button" className="seu-btn-faculty-forms" onClick={() => handleItemClick('forms_all')}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Faculty Forms
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Main Greeting & Display Name */}
            <h1 className="seu-hero-greeting-title">{greeting}</h1>

            {/* Meta Info Line */}
            <div className="seu-hero-meta-row">
              {effectiveMetaItems && effectiveMetaItems.length > 0 ? (
                effectiveMetaItems.map((meta, idx) => (
                  <React.Fragment key={idx}>
                    <span>{meta.label} <span className="seu-hero-meta-strong">{meta.value}</span></span>
                    {idx < effectiveMetaItems.length - 1 && <span className="seu-hero-meta-divider">•</span>}
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
        )}

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
