const Notification = require('../models/Notification');
const { getStatus } = require('../config/db');

// In-memory fallback notifications to ensure 100% demo resilience and real-time responsiveness
let memoryNotifications = [
  // --- DEAN NOTIFICATIONS ---
  {
    _id: 'notif_dean_1',
    recipientRole: 'dean',
    recipientDepartment: 'ALL',
    recipientEmail: 'dean@gmail.com',
    title: 'HOD Endorsement: Credit Exemption Request',
    message: 'HOD ICT M.J Ahamed Sabani endorsed request REQ-2026-0420 (K.M. Nuwais) for Dean Executive Ratification.',
    type: 'endorsement',
    priority: 'urgent',
    processId: 'REQ-2026-0420',
    trackingNumber: 'REQ-2026-0420',
    targetTab: 'faculty_approval',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
  },
  {
    _id: 'notif_dean_2',
    recipientRole: 'dean',
    recipientDepartment: 'ALL',
    recipientEmail: 'dean@gmail.com',
    title: 'Awaiting Dean Approval: BST Practicum Rescheduling',
    message: 'Dr. M.G. Mohamed Thariq (HOD BST) forwarded special concession viva defense REQ-2026-0318 for Faculty Board sanction.',
    type: 'approval_request',
    priority: 'high',
    processId: 'REQ-2026-0318',
    trackingNumber: 'REQ-2026-0318',
    targetTab: 'faculty_approval',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    _id: 'notif_dean_3',
    recipientRole: 'dean',
    recipientDepartment: 'ALL',
    recipientEmail: 'dean@gmail.com',
    title: 'Faculty Academic Calendar Notice',
    message: 'Semester 05 Mid-Semester examination board clearance scheduling finalized for BST and ICT departments.',
    type: 'announcement',
    priority: 'normal',
    processId: '',
    trackingNumber: '',
    targetTab: 'academic_calendar',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },

  // --- HOD NOTIFICATIONS ---
  {
    _id: 'notif_hod_1',
    recipientRole: 'hod',
    recipientDepartment: 'Department of Information and Communication Technology',
    recipientEmail: 'hod@gmail.com',
    title: 'Awaiting HOD Sign-Off: Repeat Exam Entry',
    message: 'Dr. S. Kirushanth verified CA mark (24/30) for REP-2026-0105 (A.R. Fathima). Pending HOD Sign-off.',
    type: 'approval_request',
    priority: 'urgent',
    processId: 'REP-2026-0105',
    trackingNumber: 'REP-2026-0105',
    targetTab: 'hod_command',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
  },
  {
    _id: 'notif_hod_2',
    recipientRole: 'hod',
    recipientDepartment: 'Department of Information and Communication Technology',
    recipientEmail: 'hod@gmail.com',
    title: 'Successfully Endorsed to Dean: REQ-2026-0420',
    message: 'Your endorsement for K.M. Nuwais has been transferred to Faculty Executive Office (Dean Prof. Rifai Kariapper).',
    type: 'endorsement',
    priority: 'normal',
    processId: 'REQ-2026-0420',
    trackingNumber: 'REQ-2026-0420',
    targetTab: 'hod_command',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90), // 90 mins ago
  },
  {
    _id: 'notif_hod_3',
    recipientRole: 'hod',
    recipientDepartment: 'Department of Information and Communication Technology',
    recipientEmail: 'hod@gmail.com',
    title: 'Lecturer Submission: Academic Workload Verification',
    message: 'Semester 05 CA moderation sheets submitted by Software Technologies (SWT) module leaders for HOD audit.',
    type: 'workload',
    priority: 'normal',
    processId: '',
    trackingNumber: '',
    targetTab: 'ca_marks',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
  },
  {
    _id: 'notif_hod_4',
    recipientRole: 'hod',
    recipientDepartment: 'Department of Information and Communication Technology',
    recipientEmail: 'hod@gmail.com',
    title: 'Faculty Board Meeting Notice',
    message: 'The 48th Faculty of Technology Board Meeting chaired by Dean Prof. Rifai Kariapper is scheduled for Thursday.',
    type: 'announcement',
    priority: 'normal',
    processId: '',
    trackingNumber: '',
    targetTab: 'overview',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
  },
];

/**
 * Get notifications filtered by role, department, and email
 */
exports.getNotifications = async (req, res) => {
  try {
    const { role, department, email } = req.query;

    if (getStatus()) {
      let query = {};
      if (role && role !== 'all') {
        query.$or = [{ recipientRole: role.toLowerCase() }, { recipientRole: 'all' }];
      }
      if (email) {
        if (query.$or) {
          query.$or.push({ recipientEmail: email.toLowerCase() });
        } else {
          query.recipientEmail = email.toLowerCase();
        }
      }

      const notifs = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
      if (notifs && notifs.length > 0) {
        // Also apply department filter for HOD if provided
        let filtered = notifs;
        if (role === 'hod' && department && department !== 'ALL') {
          filtered = notifs.filter(
            n => n.recipientDepartment === 'ALL' ||
                 n.recipientDepartment.toLowerCase().includes(department.toLowerCase()) ||
                 department.toLowerCase().includes(n.recipientDepartment.toLowerCase())
          );
        }
        const unreadCount = filtered.filter(n => !n.isRead).length;
        return res.json({ success: true, count: filtered.length, unreadCount, data: filtered });
      }
    }

    // Fallback to memory
    let filtered = [...memoryNotifications];
    if (role && role !== 'all') {
      filtered = filtered.filter(
        n => n.recipientRole === role.toLowerCase() || n.recipientRole === 'all' || (email && n.recipientEmail === email)
      );
    }
    if (role === 'hod' && department && department !== 'ALL') {
      filtered = filtered.filter(
        n => n.recipientDepartment === 'ALL' ||
             n.recipientDepartment.toLowerCase().includes(department.toLowerCase()) ||
             department.toLowerCase().includes(n.recipientDepartment.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unreadCount = filtered.filter(n => !n.isRead).length;

    return res.json({ success: true, count: filtered.length, unreadCount, data: filtered });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (getStatus()) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        await Notification.findByIdAndUpdate(id, { isRead: true });
      }
    }

    const found = memoryNotifications.find(n => n._id === id || n.id === id);
    if (found) {
      found.isRead = true;
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
};

/**
 * Mark all notifications for role/email as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { role, email } = req.body;

    if (getStatus()) {
      let query = {};
      if (role) query.recipientRole = role.toLowerCase();
      if (email) query.recipientEmail = email.toLowerCase();
      await Notification.updateMany(query, { isRead: true });
    }

    memoryNotifications.forEach(n => {
      if (!role || n.recipientRole === role.toLowerCase() || (email && n.recipientEmail === email.toLowerCase())) {
        n.isRead = true;
      }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read', error: error.message });
  }
};

/**
 * Helper function to create notification programmatically
 */
exports.createNotification = async (notifData) => {
  try {
    const newNotif = {
      _id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date(),
      isRead: false,
      ...notifData,
    };

    memoryNotifications.unshift(newNotif);

    if (getStatus()) {
      await Notification.create(notifData);
    }
    return newNotif;
  } catch (err) {
    console.warn('Failed to persist notification:', err.message);
  }
};

