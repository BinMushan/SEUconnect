import React from 'react';

/**
 * NotificationItem component
 * Category-specific alerts for lecturer tasks with quick-read toggle.
 */
export default function NotificationItem({ notification, onToggleRead }) {
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Medical requests':
        return {
          color: 'teal',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          ),
        };
      case 'Missing CA marks':
        return {
          color: 'amber',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
        };
      case 'Attendance reminders':
        return {
          color: 'blue',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          ),
        };
      case 'Student requests':
      default:
        return {
          color: 'purple',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        };
    }
  };

  const theme = getCategoryTheme(notification.category);

  return (
    <div className={`lec-notif-item ${notification.isRead ? 'is-read' : 'is-unread'} category-${theme.color}`}>
      <div className="lec-notif-left">
        <div className={`lec-notif-cat-icon theme-${theme.color}`}>
          {theme.icon}
        </div>
        <div className="lec-notif-content">
          <div className="lec-notif-header-line">
            <span className={`lec-notif-cat-badge badge-${theme.color}`}>
              {notification.category}
            </span>
            {notification.priority === 'High' && (
              <span className="lec-notif-prio-badge">High Priority</span>
            )}
            <span className="lec-notif-time">{notification.timestamp}</span>
          </div>
          <h4 className="lec-notif-title">{notification.title}</h4>
          <p className="lec-notif-desc">{notification.message}</p>
        </div>
      </div>

      <div className="lec-notif-right">
        {!notification.isRead && (
          <span className="lec-unread-indicator-dot" title="Unread Alert"></span>
        )}
        <button
          type="button"
          className="lec-notif-read-btn"
          onClick={() => onToggleRead(notification.id)}
          title={notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
        >
          {notification.isRead ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

