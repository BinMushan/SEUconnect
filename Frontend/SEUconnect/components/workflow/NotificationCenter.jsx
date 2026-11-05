import { useCallback, useEffect, useState } from 'react';
import api from '../../src/services/api.js';
import { timeAgo } from './workflowMeta.js';
import './workflowDesk.css';

const TONE = { urgent: 'bad', high: 'warn', normal: 'info' };

/**
 * Live notification page for any role. The backend returns only what is addressed to the
 * signed-in role / department / person, so the same component serves every portal.
 * onNavigate(targetTab) opens the page the notification points at (e.g. the workflow desk).
 */
export default function NotificationCenter({ onNavigate, title = 'Notifications' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      setItems(res.data || []);
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

  const unread = items.filter((n) => !n.isRead).length;
  const rows = filter === 'unread' ? items.filter((n) => !n.isRead) : items;

  const open = async (n) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      api.markNotificationRead(n._id).catch(() => {});
    }
    if (n.targetTab && onNavigate) onNavigate(n.targetTab);
  };

  const readAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.markAllNotificationsRead().catch(() => {});
  };

  return (
    <div className="wfd-root">
      <div className="wfd-head">
        <h2>{title}</h2>
        <p>Updates about applications that need your attention or that you are following. {unread} unread.</p>
      </div>

      {error && <div className="wfd-error">{error}</div>}

      <div className="wfd-toolbar">
        <button type="button" className={`wfd-btn ${filter === 'all' ? 'primary' : ''}`} onClick={() => setFilter('all')}>
          All ({items.length})
        </button>
        <button type="button" className={`wfd-btn ${filter === 'unread' ? 'primary' : ''}`} onClick={() => setFilter('unread')}>
          Unread ({unread})
        </button>
        <button type="button" className="wfd-btn" disabled={!unread} onClick={readAll}>
          Mark all as read
        </button>
      </div>

      <div className="wfd-card">
        {loading ? (
          <div className="wfd-empty">Loading notifications…</div>
        ) : rows.length === 0 ? (
          <div className="wfd-empty">{filter === 'unread' ? 'You are all caught up.' : 'No notifications yet.'}</div>
        ) : (
          rows.map((n) => (
            <button key={n._id} type="button" onClick={() => open(n)} className="wfd-notice" style={{ opacity: n.isRead ? 0.7 : 1 }}>
              <span className={`wfd-badge ${TONE[n.priority] || 'info'}`}>{n.isRead ? 'Read' : 'New'}</span>
              <span className="wfd-notice-body">
                <b>{n.title}</b>
                <span className="wfd-sub">{n.message}</span>
              </span>
              <span className="wfd-sub" style={{ whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
