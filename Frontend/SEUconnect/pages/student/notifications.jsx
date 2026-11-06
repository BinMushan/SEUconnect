import { useState, useEffect, useCallback } from 'react';
import api, { localNotificationStorage } from '../../src/services/api.js';
import './notifications.css';

const DEFAULT_NOTIFICATIONS = [
  {
    _id: 'notif_001',
    title: 'Official Release of Faculty Forms on SEUConnect',
    message: 'Official Examination Repeat forms, Absent by Medical forms, and People\'s Bank Pay In Vouchers (PIV) are now available under "Faculty Forms & Instructions" with printable digital templates.',
    type: 'Forms',
    priority: 'Normal',
    targetRole: 'ALL',
    targetProgramme: 'ALL',
    isRead: false,
    actionId: 'forms_all',
    actionText: 'View Faculty Forms',
    createdAt: '2026-09-24T08:21:05.500Z'
  },
  {
    _id: 'notif_002',
    title: '80% Attendance Requirement Notice for ESA Eligibility',
    message: 'Students are reminded that maintaining 80% attendance in both Theory and Practical sessions is mandatory to obtain the admission card for the End Semester Examination. Absence without verified medical certificates may lead to exam disqualification.',
    type: 'Academic',
    priority: 'High',
    targetRole: 'STUDENT',
    targetProgramme: 'ALL',
    isRead: false,
    actionId: 'attendance',
    actionText: 'Check Attendance Status',
    createdAt: '2026-09-22T10:14:47.329Z'
  },
  {
    _id: 'notif_003',
    title: 'End Semester Examination Registration Notice',
    message: 'The repeat examination registration portal for Semester 1 & 2 is now open. Repeat candidates must submit their Pay In Voucher (PIV) and application form before the October 31 deadline.',
    type: 'Examination',
    priority: 'High',
    targetRole: 'STUDENT',
    targetProgramme: 'ALL',
    isRead: false,
    actionId: 'examinations',
    actionText: 'Go to Examinations',
    createdAt: '2026-09-20T09:00:00.000Z'
  },
  {
    _id: 'notif_004',
    title: 'Mahapola Higher Education Scholarship Disbursement',
    message: 'The Student Welfare Division has published the installment schedule for October 2026. Eligible undergraduate recipients can review payment records and banking details under Welfare & Scholarships.',
    type: 'Welfare',
    priority: 'Normal',
    targetRole: 'STUDENT',
    targetProgramme: 'ALL',
    isRead: true,
    actionId: 'welfare_scholarships',
    actionText: 'View Welfare Portal',
    createdAt: '2026-09-15T11:30:00.000Z'
  }
];

const PRIORITY_LABEL = { urgent: 'Urgent', high: 'High', normal: 'Normal' };

// Live notifications come from the workflow engine; the static faculty circulars stay below them.
const fromServer = (n) => ({
  _id: n._id,
  title: n.title,
  message: n.message,
  type: 'Application',
  priority: PRIORITY_LABEL[String(n.priority).toLowerCase()] || 'Normal',
  isRead: n.isRead,
  actionId: n.targetTab || 'track_applications',
  actionText: 'Track Application',
  createdAt: n.createdAt,
  live: true,
});

export default function StudentNotifications({ onNavigate }) {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.getNotifications().catch(() => ({ data: [] }));
      const live = (res?.data || []).map(fromServer);
      const local = localNotificationStorage.getAll()
        .filter((n) => !n.recipientRole || n.recipientRole.toLowerCase() === 'student')
        .map((n) => ({
          _id: n._id || n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'Disciplinary',
          priority: n.priority ? (n.priority.charAt(0).toUpperCase() + n.priority.slice(1)) : 'Urgent',
          isRead: !!n.isRead,
          actionId: n.targetTab || 'penalties_disciplinary',
          actionText: 'View Disciplinary Record',
          createdAt: n.createdAt || new Date().toISOString(),
          live: true
        }));
      const deleted = new Set(JSON.parse(localStorage.getItem('seu_deleted_notif_ids') || '[]'));
      const combined = [...local, ...live].filter(n => !deleted.has(n._id));
      const seen = new Set();
      const deduped = [];
      for (const item of combined) {
        if (!seen.has(item._id)) {
          seen.add(item._id);
          deduped.push(item);
        }
      }
      setNotifications((prev) => [...deduped, ...prev.filter((n) => !n.live)]);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  // Mark single notification as read
  const handleDeleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      const deleted = JSON.parse(localStorage.getItem('seu_deleted_notif_ids') || '[]');
      if (!deleted.includes(String(id))) {
        deleted.push(String(id));
        localStorage.setItem('seu_deleted_notif_ids', JSON.stringify(deleted));
      }
    } catch (_) {}
    const target = notifications.find((n) => n._id === id);
    if (target?.live) await api.deleteNotification(id).catch(() => {});
  };

  const handleClearAll = async () => {
    try {
      const deleted = JSON.parse(localStorage.getItem('seu_deleted_notif_ids') || '[]');
      notifications.forEach((n) => {
        if (!deleted.includes(String(n._id))) deleted.push(String(n._id));
      });
      localStorage.setItem('seu_deleted_notif_ids', JSON.stringify(deleted));
    } catch (_) {}
    setNotifications([]);
    await api.deleteAllNotifications().catch(() => {});
  };

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    const target = notifications.find((n) => n._id === id);
    if (target?.live) await api.markNotificationRead(id).catch(() => {});
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.markAllNotificationsRead().catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filters = ['All', 'Unread', 'High & Urgent', 'Applications', 'Examination', 'Academic', 'Forms'];

  const filteredNotifications = notifications.filter((item) => {
    if (selectedFilter === 'Unread') return !item.isRead;
    if (selectedFilter === 'High & Urgent') return item.priority === 'High' || item.priority === 'Urgent';
    if (selectedFilter === 'Applications') return item.type === 'Application';
    if (selectedFilter === 'Examination') return item.type === 'Examination';
    if (selectedFilter === 'Academic') return item.type === 'Academic';
    if (selectedFilter === 'Forms') return item.type === 'Forms';
    return true;
  });

  const getBorderColor = (priority) => {
    if (priority === 'Urgent') return '#ef4444';
    if (priority === 'High') return '#d97706';
    return '#1e3a8a';
  };

  return (
    <div className="seu-notif-container">
      {/* Page Header */}
      <div className="seu-notif-header">
        <h1>Faculty Announcements &amp; Notifications</h1>
        <p>Institutional circulars, examination deadlines, and academic notices published by university administration.</p>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="seu-notif-toolbar">
        <div className="seu-notif-filters">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className={`seu-notif-pill ${selectedFilter === f ? 'active' : ''}`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '0.68rem',
                    marginLeft: '3px'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="seu-notif-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="seu-notif-btn-secondary"
              onClick={handleMarkAllAsRead}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="seu-notif-btn-secondary"
              onClick={handleClearAll}
              style={{ color: '#ef4444' }}
              title="Delete and clear all notifications"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '0.8rem' }}>
          Live application notifications are unavailable: {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="seu-notif-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading announcements...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            No notifications on record matching the selected filter.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`seu-notif-card ${notif.isRead ? 'is-read' : ''}`}
              style={{ borderLeft: `4px solid ${getBorderColor(notif.priority)}` }}
            >
              <div className="seu-notif-card-top">
                <div className="seu-notif-badges">
                  <span className="notif-badge-type">{notif.type}</span>
                  <span
                    className={
                      notif.priority === 'Urgent'
                        ? 'notif-badge-urgent'
                        : notif.priority === 'High'
                        ? 'notif-badge-high'
                        : 'notif-badge-normal'
                    }
                  >
                    {notif.priority}
                  </span>
                </div>

                <div className="seu-notif-date">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {new Date(notif.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <h3 className="seu-notif-card-title">{notif.title}</h3>
              <p className="seu-notif-card-body">{notif.message}</p>

              <div className="seu-notif-card-footer">
                <div className="seu-notif-audience">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Faculty of Technology &bull; Student Notice
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {notif.actionId && onNavigate && (
                    <button
                      type="button"
                      className="seu-notif-btn-secondary"
                      onClick={() => onNavigate(notif.actionId)}
                      style={{ fontSize: '0.78rem', color: '#1e3a8a', fontWeight: 600 }}
                    >
                      {notif.actionText || 'View Details'} &rarr;
                    </button>
                  )}


                  {!notif.isRead && (
                    <button
                      type="button"
                      className="seu-notif-btn-secondary"
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Mark as Read
                    </button>
                  )}


                  <button
                    type="button"
                    className="seu-notif-btn-secondary"
                    onClick={() => handleDeleteNotification(notif._id)}
                    title="Delete notification"
                    style={{ color: '#ef4444' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

