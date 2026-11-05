const mongoose = require('mongoose');

// A notification is addressed to a role, optionally narrowed to one person (recipientEmail)
// and/or one department. Read state is tracked per reader so a role shared by several staff
// members does not lose its unread badge when one of them opens it.
const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, default: 'GENERAL' },
    priority: { type: String, default: 'normal' },
    recipientRole: { type: String, required: true, lowercase: true, trim: true },
    recipientEmail: { type: String, default: '', lowercase: true, trim: true },
    recipientDepartment: { type: String, default: 'ALL' },
    relatedRequestId: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    targetTab: { type: String, default: '' },
    department: { type: String, default: 'Faculty of Technology' },
    // Event-driven notifications from the academic modules
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    eventType: { type: String, default: '' },
    entityType: { type: String, default: '' },
    entityId: { type: String, default: '' },
    deliveries: [{ _id: false, channel: String, status: String, at: Date, error: String }],
    readBy: { type: [String], default: [] },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientRole: 1, createdAt: -1 });
NotificationSchema.index({ recipientEmail: 1 });
NotificationSchema.index({ recipientUser: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
