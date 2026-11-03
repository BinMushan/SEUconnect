import React, { useState } from 'react';
import NotificationItem from './components/NotificationItem.jsx';
import { INITIAL_NOTIFICATIONS } from './lecturerMockData.js';

/**
 * Notifications component
 * Category-based inbox for urgent lecturer alerts:
 * - Categories: Medical requests, Missing CA marks, Attendance reminders, Student requests
 * - Toggle switch for "Unread only"
 * - "Mark all as read" button
 * - Interactive navigation: Clicking a notification automatically marks it as read and redirects
 *   to the relevant section (e.g. Student Medical Verification, CA/ESA, Attendance, Results).
 */
export default function Notifications({
  notifications: propNotifications,
  onToggleRead,
  onMarkSingleRead,
  onMarkAllAsRead,
  onNavigateNotification,
  onShowToast,
}) {
  const [localNotifications, setLocalNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifications = propNotifications || localNotifications;
  const setNotifications = setLocalNotifications;

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleRead = (id) => {
    if (onToggleRead) {
      onToggleRead(id);
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
      );
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onShowToast) {
        onShowToast('All notifications marked as read', 'info');
      }
    }
  };

  const handleNotificationClick = (notif) => {
    // 1. Automatically mark as read if currently unread
    if (!notif.isRead) {
      if (onMarkSingleRead) {
        onMarkSingleRead(notif.id);
      } else if (onToggleRead) {
        onToggleRead(notif.id);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      }
    }

    // 2. Resolve destination route
    let targetRoute = notif.actionRoute;
    if (!targetRoute) {
      if (notif.category === 'Medical requests' || notif.title.toLowerCase().includes('medical')) {
        targetRoute = 'medical-verification';
      } else if (notif.category === 'Missing CA marks' || notif.title.toLowerCase().includes('ca')) {
        targetRoute = 'ca-esa';
      } else if (notif.category === 'Attendance reminders' || notif.title.toLowerCase().includes('attendance')) {
        targetRoute = 'attendance';
      } else if (notif.category === 'Student requests' || notif.title.toLowerCase().includes('repeat')) {
        targetRoute = 'results';
      } else {
        targetRoute = 'announcements';
      }
    }

    // 3. Show notification toast feedback
    if (onShowToast) {
      if (targetRoute.includes('medical')) {
        onShowToast('Navigating to Student Medical Approval & Verification', 'info');
      }
    }

    // 4. Navigate via parent handler
    if (onNavigateNotification) {
      onNavigateNotification(targetRoute, notif.actionParams);
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
      {/* 1. Header with Stats & Mark All as Read */}
      <div className="lec-module-header-card">
        <div>
          <h2 className="lec-module-title">Academic Notification Inbox & Action Items</h2>
          <p className="lec-module-sub">
            Review critical faculty notifications, student requests, and assessment submission milestones. Click any notification to open its corresponding task.
          </p>
        </div>
        <div className="lec-notif-header-stats">
          <div className="notif-pill">
            Unread: <strong>{unreadCount} Alerts</strong>
          </div>
          <button
            type="button"
            className="lec-btn-mark-all-read"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all as read
          </button>
        </div>
      </div>

      {/* 2. Controls & Categories Row */}
      <div className="lec-notif-controls-bar">
        {/* Category Pills */}
        <div className="lec-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`lec-category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              {cat === 'All' && <span className="tab-counter-badge">{notifications.length}</span>}
            </button>
          ))}
        </div>

        {/* Unread Toggle */}
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
          <div className="lec-empty-notif-card">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>No notifications found matching your filter criteria.</p>
          </div>
        ) : (
          filteredList.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onToggleRead={handleToggleRead}
              onClick={handleNotificationClick}
            />
          ))
        )}
      </div>

      {/* 4. Automated Digest Footnote */}
      <div className="lec-notif-footnote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          Automated alerts are triggered by student submissions and administrative deadlines. Clicking a notification automatically opens the relevant interface and marks the item as read.
        </div>
      </div>
    </div>
  );
}
