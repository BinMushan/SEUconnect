const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const n = require('../controllers/notificationController');

router.use(authenticate);
router.get('/', n.getNotifications);
router.get('/unread-count', n.getUnreadCount);
router.put('/mark-all-read', n.markAllAsRead);
router.put('/:id/read', n.markAsRead);
router.delete('/clear-all', n.deleteAllNotifications);
router.delete('/:id', n.deleteNotification);
router.delete('/', n.deleteAllNotifications);

module.exports = router;
