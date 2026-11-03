const Notification = require('../models/Notification');
const { getStatus } = require('../config/db');

// Seed notifications for in-memory fallback
let memoryNotifications = [
  {
    _id: 'notif_001',
    title: 'New BST Student Request Submitted',
    message: 'K.M. Dilshan (22BST012) submitted a Field Practical Medical Excuse (BST 3113 & BST 3122). Administrative review required.',
    type: 'NEW_SUBMISSION',
    recipientRole: 'sar',
    relatedRequestId: 'MED-2026-0910',
    department: 'Department of Biosystems Technology',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
  },
  {
    _id: 'notif_002',
    title: 'HOD Endorsement Received: ICT 2223 Repeat Form',
    message: 'Dr. M.A. Rifky (HOD ICT) has endorsed the Repeat Examination form for A.R. Fathima (22ICT041). Pending final Faculty Board scheduling.',
    type: 'HOD_ENDORSED',
    recipientRole: 'sar',
    relatedRequestId: 'REP-2026-0105',
    department: 'Department of Information and Communication Technology',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
  },
  {
    _id: 'notif_003',
    title: 'Dean Sanctioned: Medical Leave Approval',
    message: 'Prof. U.L. Abdul Majeed (Dean) confirmed final executive approval for MED-2026-0640 (M.N.M. Afnan). Ready for archiving in faculty register.',
    type: 'DEAN_APPROVED',
    recipientRole: 'sar',
    relatedRequestId: 'MED-2026-0640',
    department: 'Department of Information and Communication Technology',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000), // 5 hours ago
  },
  {
    _id: 'notif_004',
    title: 'Correction Requested: Private Clinic Certificate',
    message: 'Dr. Rifky returned MED-2026-0792 for lack of University Health Center endorsement slip within the 7-day statutory window.',
    type: 'CORRECTION',
    recipientRole: 'sar',
    relatedRequestId: 'MED-2026-0792',
    department: 'Department of Information and Communication Technology',
    isRead: true,
    readAt: new Date(Date.now() - 6 * 3600 * 1000),
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    _id: 'notif_005',
    title: 'Action Required: BST Industrial Training Leave',
    message: 'Leave of absence request REQ-2026-0304 from R.P. Kumara (21BST005) forwarded for administrative documentation check prior to Dean review.',
    type: 'ACTION_REQUIRED',
    recipientRole: 'sar',
    relatedRequestId: 'REQ-2026-0304',
    department: 'Department of Biosystems Technology',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1 * 86400 * 1000), // 1 day ago
  },
];

exports.getNotifications = async (req, res) => {
  try {
    const role = (req.query.role || 'sar').toLowerCase();

    if (getStatus()) {
      const dbNotifs = await Notification.find({ recipientRole: role }).sort({ createdAt: -1 });
      if (dbNotifs && dbNotifs.length > 0) {
        return res.json({ success: true, count: dbNotifs.length, data: dbNotifs });
      }
    }

    const filtered = memoryNotifications.filter(n => n.recipientRole.toLowerCase() === role);
    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    if (getStatus()) {
      const updated = await Notification.findByIdAndUpdate(
        id,
        { isRead: true, readAt: now },
        { new: true }
      );
      if (updated) {
        return res.json({ success: true, data: updated });
      }
    }

    const notif = memoryNotifications.find(n => n._id === id || String(n._id) === String(id));
    if (notif) {
      notif.isRead = true;
      notif.readAt = now;
      return res.json({ success: true, data: notif });
    }

    return res.status(404).json({ success: false, message: 'Notification not found' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error updating notification', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const role = (req.body.role || req.query.role || 'sar').toLowerCase();
    const now = new Date();

    if (getStatus()) {
      await Notification.updateMany(
        { recipientRole: role, isRead: false },
        { $set: { isRead: true, readAt: now } }
      );
    }

    memoryNotifications = memoryNotifications.map(n => {
      if (n.recipientRole.toLowerCase() === role) {
        return { ...n, isRead: true, readAt: now };
      }
      return n;
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications', error: error.message });
  }
};

exports.createNotification = async (notifData) => {
  try {
    const newNotif = {
      _id: `notif_${Date.now()}`,
      title: notifData.title,
      message: notifData.message,
      type: notifData.type || 'ADMIN_REVIEW',
      recipientRole: (notifData.recipientRole || 'sar').toLowerCase(),
      relatedRequestId: notifData.relatedRequestId || '',
      department: notifData.department || 'Faculty of Technology',
      isRead: false,
      readAt: null,
      createdAt: new Date(),
    };

    if (getStatus()) {
      await Notification.create(newNotif);
    }
    memoryNotifications.unshift(newNotif);
    return newNotif;
  } catch (err) {
    console.warn('Failed to dispatch notification:', err.message);
  }
};

