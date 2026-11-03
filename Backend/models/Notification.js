const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      required: true,
      enum: ['student', 'lecturer', 'medical_officer', 'hod', 'dean', 'examination', 'admin', 'all'],
    },
    recipientDepartment: {
      type: String,
      default: 'ALL', // e.g., 'Department of Information and Communication Technology', 'Department of Biosystems Technology', 'ALL'
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['workload', 'approval_request', 'endorsement', 'correction', 'returned', 'approved', 'declined', 'announcement', 'general'],
      default: 'approval_request',
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent', 'high'],
      default: 'normal',
    },
    processId: {
      type: String,
      default: '',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    targetTab: {
      type: String,
      default: 'approvals', // tab to navigate to when clicked, e.g., 'approvals', 'hod_command', 'faculty_approval'
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);

