import React, { useState, useMemo } from 'react';

/**
 * DeptMANotifications
 * Redesigned, modern, and elegant notifications center for Department MA.
 * Integrates direct notification navigation, instant read status management,
 * compact category filtering, search, and full light/dark mode support.
 */
export default function DeptMANotifications({
  notifications = [],
  onNavigate,
  onMarkAllRead,
  onToggleRead,
  onNotificationClick,
  onShowToast,
}) {
  // Category filter: 'ALL' | 'UNREAD' | 'MEDICAL' | 'DOCS_REQUESTS' | 'ANNOUNCEMENTS'
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to categorize notifications
  const matchesCategory = (notif, cat) => {
    if (cat === 'ALL') return true;
    if (cat === 'UNREAD') return !notif.read;
    if (cat === 'MEDICAL') {
      return (
        notif.type === 'medical' ||
        notif.type === 'lecturer_medical' ||
        (notif.title && notif.title.toLowerCase().includes('medical'))
      );
    }
    if (cat === 'DOCS_REQUESTS') {
      return (
        notif.type === 'registration' ||
        notif.type === 'student_request' ||
        notif.type === 'ca_signing' ||
        notif.type === 'document' ||
        notif.type === 'mahapola' ||
        notif.type === 'bursary' ||
        notif.type === 'attendance' ||
        (notif.title && (
          notif.title.toLowerCase().includes('request') ||
          notif.title.toLowerCase().includes('registration') ||
          notif.title.toLowerCase().includes('attendance') ||
          notif.title.toLowerCase().includes('slip')
        ))
      );
    }
    if (cat === 'ANNOUNCEMENTS') {
      return (
        notif.type === 'announcement' ||
        (notif.title && (
          notif.title.toLowerCase().includes('announcement') ||
          notif.title.toLowerCase().includes('notice') ||
          notif.title.toLowerCase().includes('board')
        ))
      );
    }
    return true;
  };

  // Category counts
  const counts = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const read = total - unread;
    const medical = notifications.filter((n) => matchesCategory(n, 'MEDICAL')).length;
    const docsRequests = notifications.filter((n) => matchesCategory(n, 'DOCS_REQUESTS')).length;
    const announcements = notifications.filter((n) => matchesCategory(n, 'ANNOUNCEMENTS')).length;
    return { total, unread, read, medical, docsRequests, announcements };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Category check
      if (!matchesCategory(item, activeCategory)) return false;

      // 2. Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const msgMatch = item.message?.toLowerCase().includes(q);
        const typeMatch = item.type?.toLowerCase().includes(q);
        const actionMatch = item.actionNav?.toLowerCase().includes(q);
        if (!titleMatch && !msgMatch && !typeMatch && !actionMatch) return false;
      }

      return true;
    });
  }, [notifications, activeCategory, searchQuery]);

  // Meaningful metadata per notification type
  const getTypeMeta = (item) => {
    const type = item.type || 'general';
    const titleLower = (item.title || '').toLowerCase();

    if (type === 'medical') {
      const isEscalation = titleLower.includes('escalat') || titleLower.includes('urgent');
      return {
        key: 'medical',
        label: isEscalation ? 'Medical Escalation' : 'Student Medical',
        targetDesk: 'Student Medical Desk',
        theme: isEscalation ? 'rose' : 'teal',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        ),
      };
    }

    if (type === 'lecturer_medical') {
      return {
        key: 'lecturer_medical',
        label: 'Lecturer Medical Leave',
        targetDesk: 'Lecturer Medical Desk',
        theme: 'blue',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
        ),
      };
    }

    if (type === 'registration') {
      return {
        key: 'registration',
        label: 'Course Registration',
        targetDesk: 'Registrations Desk',
        theme: 'indigo',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="m9 15 2 2 4-4" />
          </svg>
        ),
      };
    }

    if (type === 'ca_signing') {
      return {
        key: 'ca_signing',
        label: 'CA Repeat Signing',
        targetDesk: 'CA Signing Desk',
        theme: 'indigo',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        ),
      };
    }

    if (type === 'attendance') {
      return {
        key: 'attendance',
        label: 'Attendance Audit Alert',
        targetDesk: 'Attendance Records',
        theme: 'amber',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
      };
    }

    if (type === 'student_request') {
      return {
        key: 'student_request',
        label: 'Student Request Letter',
        targetDesk: 'Request Letters Desk',
        theme: 'purple',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      };
    }

    if (type === 'mahapola' || type === 'bursary') {
      return {
        key: 'mahapola',
        label: 'Mahapola & Bursary',
        targetDesk: 'Welfare Desk',
        theme: 'emerald',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        ),
      };
    }

    if (type === 'announcement') {
      return {
        key: 'announcement',
        label: 'Faculty Notice',
        targetDesk: 'Announcements Board',
        theme: 'rose',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      };
    }

    return {
      key: 'document',
      label: 'Department Record',
      targetDesk: 'Department Records',
      theme: 'slate',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    };
  };

  // Direct card click navigation
  const handleCardClick = (item) => {
    if (typeof onNotificationClick === 'function') {
      onNotificationClick(item);
    } else {
      if (!item.read && typeof onToggleRead === 'function') {
        onToggleRead(item.id);
      }
      if (typeof onNavigate === 'function') {
        const targetNav = item.actionNav || (
          item.type === 'medical' || item.type === 'lecturer_medical' ? 'medical_applications' :
          item.type === 'registration' || item.type === 'ca_signing' ? 'subject_registrations' :
          item.type === 'student_request' ? 'student_requests' :
          item.type === 'mahapola' || item.type === 'bursary' ? 'mahapola_bursary' :
          item.type === 'attendance' ? 'attendance_records' :
          item.type === 'announcement' ? 'announcements' :
          item.type === 'document' ? 'department_documents' : 'dashboard'
        );
        onNavigate(targetNav);
      }
    }
  };

  // Category filter tabs definition
  const categoryTabs = [
    { id: 'ALL', label: 'All Notifications', count: counts.total },
    { id: 'UNREAD', label: 'Unread', count: counts.unread },
    { id: 'MEDICAL', label: 'Medical Applications', count: counts.medical },
    { id: 'DOCS_REQUESTS', label: 'Documents & Requests', count: counts.docsRequests },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', count: counts.announcements },
  ];

  return (
    <div className="dept-ma-notifications-container">
      {/* 1. Header Card */}
      <div className="dept-ma-notif-header-card">
        <div className="dept-ma-notif-header-left">
          <div className="dept-ma-notif-header-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <div className="dept-ma-notif-header-title-row">
              <h3 className="dept-ma-notif-header-title">Department Notifications & Alerts</h3>
              <div className="dept-ma-notif-stats-strip">
                <span className="dept-ma-notif-stat-pill total">
                  Total: {counts.total}
                </span>
                <span className={`dept-ma-notif-stat-pill ${counts.unread > 0 ? 'unread' : 'neutral'}`}>
                  Unread: {counts.unread}
                </span>
              </div>
            </div>
            <p className="dept-ma-notif-header-desc">
              System updates, student submission alerts, and administrative tasks.
            </p>
          </div>
        </div>

        <div className="dept-ma-notif-header-right">
          <button
            type="button"
            className="dept-ma-btn-action secondary dept-ma-mark-all-btn"
            onClick={onMarkAllRead}
            disabled={counts.unread === 0}
            title={counts.unread === 0 ? 'All notifications are already marked as read' : 'Mark all notifications as read'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Categories Toolbar */}
      <div className="dept-ma-notif-toolbar-card">
        {/* Category Tabs */}
        <div className="dept-ma-notif-tabs" role="tablist" aria-label="Notification Categories">
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`dept-ma-notif-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                <span>{tab.label}</span>
                <span className={`dept-ma-notif-tab-badge ${isActive ? 'is-active' : ''}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="dept-ma-notif-search-wrap">
          <div className="dept-ma-notif-search-box">
            <svg className="dept-ma-notif-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="dept-ma-notif-search-input"
              placeholder="Search by student, ID, subject, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="dept-ma-notif-search-clear"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Status Bar */}
      <div className="dept-ma-notif-status-bar">
        <span className="dept-ma-notif-status-text">
          Showing <strong>{filteredNotifications.length}</strong> of <strong>{notifications.length}</strong> notifications
          {searchQuery && (
            <span> matching &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
          )}
          {activeCategory !== 'ALL' && (
            <span> in <strong>{categoryTabs.find((t) => t.id === activeCategory)?.label}</strong></span>
          )}
        </span>

        {activeCategory === 'UNREAD' && counts.unread > 0 && (
          <span className="dept-ma-notif-hint-pill">
            Click any notification to open and mark as read
          </span>
        )}
      </div>

      {/* 4. Notification Cards List */}
      <div className="dept-ma-notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="dept-ma-notif-empty-card">
            <div className="dept-ma-notif-empty-icon">
              {searchQuery ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              ) : activeCategory === 'UNREAD' ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              )}
            </div>

            <h4 className="dept-ma-notif-empty-title">
              {searchQuery
                ? 'No matching notifications found'
                : activeCategory === 'UNREAD'
                ? 'Inbox is all caught up'
                : 'No notifications in this category'}
            </h4>

            <p className="dept-ma-notif-empty-desc">
              {searchQuery
                ? `No department alerts or submissions match "${searchQuery}". Try using a different keyword or registration number.`
                : activeCategory === 'UNREAD'
                ? 'There are currently no unread notifications or pending alerts requiring your attention.'
                : 'There are no active department notifications recorded under this filter.'}
            </p>

            {(searchQuery || activeCategory !== 'ALL') && (
              <button
                type="button"
                className="dept-ma-btn-action secondary dept-ma-empty-reset-btn"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
              >
                Reset Filters & View All
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const meta = getTypeMeta(item);
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                className={`dept-ma-notif-card ${isUnread ? 'is-unread' : 'is-read'} theme-${meta.theme}`}
                onClick={() => handleCardClick(item)}
                role="button"
                tabIndex={0}
                aria-label={`${isUnread ? 'Unread: ' : ''}${item.title}. Click to open ${meta.targetDesk}.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(item);
                  }
                }}
              >
                {/* Left Type Icon Box */}
                <div className={`dept-ma-notif-icon-box theme-${meta.theme}`}>
                  {meta.icon}
                </div>

                {/* Main Notification Content */}
                <div className="dept-ma-notif-main">
                  {/* Top Meta Line: Badge, Unread Dot, Timestamp */}
                  <div className="dept-ma-notif-top-row">
                    <div className="dept-ma-notif-badge-group">
                      <span className={`dept-ma-notif-badge badge-${meta.theme}`}>
                        {meta.label}
                      </span>

                      {isUnread && (
                        <span className="dept-ma-notif-unread-pill" title="Unread notification">
                          <span className="dept-ma-notif-unread-dot" />
                          <span>Unread</span>
                        </span>
                      )}
                    </div>

                    <div className="dept-ma-notif-time-wrap">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="dept-ma-notif-title-row">
                    <h4 className="dept-ma-notif-title">{item.title}</h4>
                  </div>

                  {/* Message Description */}
                  <p className="dept-ma-notif-desc">{item.message}</p>

                  {/* Bottom Footer: Destination Tag & Subdued Click Hint */}
                  <div className="dept-ma-notif-footer-row">
                    <span className="dept-ma-notif-dest-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>{meta.targetDesk}</span>
                    </span>

                    <span className="dept-ma-notif-click-hint">
                      Click to open
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
