const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
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
      enum: ['NEW_SUBMISSION', 'ADMIN_REVIEW', 'CORRECTION', 'HOD_ENDORSED', 'DEAN_APPROVED', 'DEAN_REJECTED', 'ACTION_REQUIRED', 'GENERAL'],
      default: 'ADMIN_REVIEW',
    },
    recipientRole: {
      type: String,
      required: true, // e.g. 'sar', 'dean', 'hod'
    },
    relatedRequestId: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Faculty of Technology',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);

