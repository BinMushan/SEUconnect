import React, { useState } from 'react';
import NotificationItem from './components/NotificationItem.jsx';
import { INITIAL_NOTIFICATIONS } from './lecturerMockData.js';

/**
 * Notifications component
 * Category-based inbox for urgent lecturer alerts:
 * - Categories: Medical requests, Missing CA marks, Attendance reminders, Student requests
 * - Toggle switch for "Unread only"
 * - "Mark all as read" button
 */
export default function Notifications({ onShowToast }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onShowToast) {
      onShowToast('All notifications marked as read', 'info');
    }
  };

  // Filter list
  const filteredList = notifications.filter((n) => {
    const matchesUnread = unreadOnly ? !n.isRead : true;
    const matchesCategory =
      selectedCategory === 'All' || n.category === selectedCategory;
    return matchesUnread && matchesCategory;
  });

  const categories = [
    'All',
    'Medical requests',
    'Missing CA marks',
    'Attendance reminders',
    'Student requests',
  ];

  return (
    <div className="lec-notifications-container">
      {/* 1. Header Card */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Academic Notification Inbox & Action Items</h2>
          <p className="lec-module-sub">
            Review critical faculty notifications, student requests, and assessment submission milestones.
          </p>
        </div>
        <div className="lec-notif-header-stats">
          <span className="notif-pill">
            Unread: <strong>{unreadCount} Alerts</strong>
          </span>
          <button
            type="button"
            className="lec-btn-mark-all-read"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all as read
          </button>
        </div>
      </div>

      {/* 2. Controls & Categories Bar */}
      <div className="lec-notif-controls-bar">
        <div className="lec-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`lec-category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              {cat === 'All' && (
                <span className="tab-counter-badge">{notifications.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="lec-toggle-unread-wrap">
          <label className="lec-toggle-switch-label">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label-text">Show Unread only</span>
          </label>
        </div>
      </div>

      {/* 3. Notifications Feed List */}
      <div className="lec-notif-items-list">
        {filteredList.length === 0 ? (
          <div className="lec-empty-feed-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <h4>All Caught Up!</h4>
            <p>There are no notifications matching your filter criteria.</p>
          </div>
        ) : (
          filteredList.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onToggleRead={handleToggleRead}
            />
          ))
        )}
      </div>

      {/* 4. Helpdesk Support Footer Notice */}
      <div className="lec-info-notice-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          Automated alerts are triggered by student submissions and administrative deadlines. To adjust notification digest preferences, contact the faculty systems admin.
        </div>
      </div>
    </div>
  );
}

