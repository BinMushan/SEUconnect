const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  stageKey: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'lecturer', 'medical_officer', 'hod', 'dean', 'examination', 'admin'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'CURRENT', 'COMPLETED', 'DECLINED', 'RETURNED'],
    default: 'PENDING',
  },
  actionTakenBy: {
    type: String,
    default: null,
  },
  actionTakenRole: {
    type: String,
    default: null,
  },
  actionDate: {
    type: Date,
    default: null,
  },
  remarks: {
    type: String,
    default: '',
  },
  digitalStamp: {
    type: String,
    default: null,
  },
});

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  actorName: {
    type: String,
    required: true,
  },
  actorRole: {
    type: String,
    required: true,
  },
  actorEmail: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  stage: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: '',
  },
});

const ProcessRequestSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['medical_excuse', 'repeat_exam', 'add_drop', 'leave_absence', 'special_concession'],
      default: 'medical_excuse',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Academic & Medical Affairs',
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Lecturer', 'Pending Medical Verification', 'Pending HOD', 'Pending Dean', 'Approved', 'Declined', 'Returned for Correction'],
      default: 'Pending Lecturer',
    },
    priority: {
      type: String,
      enum: ['Standard', 'Urgent', 'High'],
      default: 'Standard',
    },
    student: {
      name: { type: String, required: true },
      regNo: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String, default: 'Department of Information and Communication Technology' },
      faculty: { type: String, default: 'Faculty of Technology' },
      programme: { type: String, default: 'BICT (Hons)' },
      semester: { type: String, default: 'Semester 05' },
    },
    details: {
      absenceDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      missedSessions: { type: String, default: 'Full Day Lectures' },
      courseCodes: [{ type: String }],
      reason: { type: String, default: '' },
      doctorName: { type: String, default: '' },
      hospitalClinic: { type: String, default: '' },
      medicalCertNo: { type: String, default: '' },
      issueDate: { type: String, default: '' },
      attachedDocumentName: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    currentStageIndex: {
      type: Number,
      default: 1, // 0 = Student submission (completed), 1 = Lecturer
    },
    currentAssignedRole: {
      type: String,
      default: 'lecturer',
    },
    declineDetails: {
      declinedBy: { type: String, default: null },
      declinedByRole: { type: String, default: null },
      declinedAt: { type: Date, default: null },
      stage: { type: String, default: null },
      reason: { type: String, default: null },
    },
    approvalDetails: {
      approvedAt: { type: Date, default: null },
      finalApprovalCode: { type: String, default: null },
      endorsementSeal: { type: String, default: null },
    },
    stages: [StageSchema],
    auditLog: [AuditLogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProcessRequest', ProcessRequestSchema);
