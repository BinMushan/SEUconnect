const store = require('../store');

const shape = (doc, user) => {
  const n = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const isRead = store.notifications.isReadBy(doc, user);
  return {
    _id: String(n._id),
    title: n.title,
    message: n.message,
    type: n.type,
    priority: n.priority,
    trackingNumber: n.trackingNumber || n.relatedRequestId || '',
    relatedRequestId: n.relatedRequestId || '',
    targetTab: n.targetTab || '',
    department: n.department,
    isRead,
    createdAt: n.createdAt,
  };
};

// Notifications for the signed-in user (role + department + personal), newest first.
exports.getNotifications = async (req, res) => {
  try {
    const list = await store.notifications.forUser(req.user);
    const data = list.map((n) => shape(n, req.user));
    res.json({ success: true, count: data.length, unreadCount: data.filter((n) => !n.isRead).length, data });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const list = await store.notifications.forUser(req.user);
    res.json({ success: true, unreadCount: list.filter((n) => !store.notifications.isReadBy(n, req.user)).length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

const markRead = async (doc, user) => {
  const email = String(user.email || '').toLowerCase();
  if (!doc.readBy.includes(email)) {
    doc.readBy.push(email);
    doc.isRead = true;
    doc.readAt = new Date();
    await store.notifications.save(doc);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const doc = await store.notifications.find(req.params.id);
    const visible = doc && (await store.notifications.forUser(req.user)).some((n) => String(n._id) === String(doc._id));
    if (!visible) return res.status(404).json({ success: false, message: 'Notification not found' });
    await markRead(doc, req.user);
    res.json({ success: true, data: shape(doc, req.user) });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const list = await store.notifications.forUser(req.user);
    for (const doc of list) await markRead(doc, req.user);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await store.notifications.delete(req.params.id);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error deleting notification' });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    await store.notifications.deleteAllForUser(req.user);
    res.json({ success: true, message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, message: 'Server error clearing notifications' });
  }
};

// Used by controllers to deliver the notifications produced by workflow transitions.
exports.dispatch = async (events = []) => {
  for (const e of events) {
    try {
      await store.notifications.create(e);
    } catch (err) {
      console.warn('Failed to dispatch notification:', err.message);
    }
  }
};

// Support both HTTP POST handler and internal programmatic dispatch helper
exports.createNotification = async (reqOrData, res) => {
  if (res && typeof res.status === 'function') {
    try {
      const data = reqOrData.body || {};
      const doc = await store.notifications.create(data);
      return res.status(201).json({ success: true, data: shape(doc, reqOrData.user) });
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ success: false, message: 'Server error creating notification' });
    }
  }
  return exports.dispatch([reqOrData]);
};
