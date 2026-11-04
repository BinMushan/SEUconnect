import React, { useState } from 'react';

export default function DeptMANotifications({
  notifications = [],
  onNavigate,
  onMarkAllRead,
  onToggleRead,
  onNotificationClick,
}) {
  const [filterType, setFilterType] = useState('ALL');

  const filtered = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'MEDICAL') return n.type === 'medical';
    if (filterType === 'REGISTRATION') return n.type === 'registration';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCardClick = (item) => {
    if (typeof onNotificationClick === 'function') {
      onNotificationClick(item);
    } else {
      if (!item.read && typeof onToggleRead === 'function') {
        onToggleRead(item.id);
      }
      if (typeof onNavigate === 'function') {
        const targetNav = item.actionNav || (
          item.type === 'medical' ? 'medical_applications' :
          item.type === 'registration' ? 'subject_registrations' :
          item.type === 'attendance' ? 'attendance_records' : 'dashboard'
        );
        onNavigate(targetNav);
      }
    }
  };

  return (
    <div className="dept-ma-notifications-section">
      <div className="dept-ma-toolbar">
        <div>
          <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: '800' }}>
            Department Notifications & Alerts
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            System updates, student submission alerts, and administrative tasks.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            className="dept-ma-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread Only</option>
            <option value="MEDICAL">Medical Alerts</option>
            <option value="REGISTRATION">Registration Alerts</option>
          </select>

          <button
            type="button"
            className="dept-ma-btn-action secondary"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            title={unreadCount === 0 ? 'No unread notifications' : 'Mark all notifications as read'}
          >
            ✓ Mark All Read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.length === 0 ? (
          <div
            className="dept-ma-empty-state"
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
              fontSize: '0.9rem',
            }}
          >
            No notifications found in this view.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`dept-ma-task-item is-clickable ${item.read ? 'is-read' : 'is-unread'}`}
              onClick={() => handleCardClick(item)}
              role="button"
              tabIndex={0}
              title={`Click to open ${
                item.type === 'medical'
                  ? 'Medical Application Verification & Approval'
                  : item.type === 'registration'
                  ? 'Subject Registrations'
                  : item.type === 'attendance'
                  ? 'Attendance Records'
                  : 'relevant interface'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(item);
                }
              }}
            >
              <div className="dept-ma-task-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  {!item.read && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0284c7',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span className="dept-ma-task-title">{item.title}</span>
                  <span className="dept-ma-tracking-pill" style={{ fontSize: '0.7rem' }}>
                    {item.type}
                  </span>
                </div>
                <div className="dept-ma-task-desc">{item.message}</div>
                <div className="dept-ma-task-time">🕒 {item.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
