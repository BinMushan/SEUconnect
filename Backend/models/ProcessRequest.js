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
    enum: ['student', 'lecturer', 'medical_officer', 'hod', 'dean', 'examination', 'admin', 'sar', 'dept_ma', 'fma'],
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
  // Status label shown while this stage is the current one (new workflows only).
  pendingStatus: {
    type: String,
    default: '',
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
      enum: [
        'medical_excuse',
        'repeat_exam',
        'add_drop',
        'leave_absence',
        'special_concession',
        'eca_application',
        'esa_application',
        'exam_form',
        'subject_medical',
        'exam_medical',
        'rescrutiny_application',
        'email_request',
      ],
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
      enum: [
        'Draft',
        'Pending Lecturer',
        'Pending Lecturer Review',
        'Under Lecturer Review',
        'Checked by Lecturer',
        'Forwarded to HOD',
        'Finally Approved by HOD',
        'Pending Medical Verification',
        'Pending HOD',
        'Pending Dean',
        'Pending SAR Review',
        'Pending SAR Verification',
        'Pending SAR Action',
        'Pending SAR Senate Tracking',
        'Pending Examination Branch',
        'Pending Dept MA',
        'Pending Faculty MA',
        'Admission Processing',
        'Admission Generated',
        'In Progress',
        'Approved',
        'Declined',
        'Returned for Correction',
      ],
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
    assignedLecturer: {
      lecturerId: { type: String, default: '' },
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      assignedAt: { type: Date, default: null },
    },
    details: {
      absenceDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      missedSessions: { type: String, default: 'Full Day Lectures' },
      courseCodes: [{ type: String }],
      subjectCode: { type: String, default: '' },
      subjectName: { type: String, default: '' },
      academicBatch: { type: String, default: '' },
      examDetails: { type: String, default: '' },
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
    paymentReceipt: {
      voucherNo: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      bankBranch: { type: String, default: "People's Bank" },
      date: { type: String, default: '' },
      receiptUrl: { type: String, default: '' },
      fileName: { type: String, default: '' },
      hasFile: { type: Boolean, default: false },
      verifiedBySAR: { type: Boolean, default: false },
    },
    // Uploaded voucher / receipt (kept apart so list responses can omit the payload).
    receiptFile: {
      name: { type: String, default: '' },
      mime: { type: String, default: '' },
      size: { type: Number, default: 0 },
      dataUrl: { type: String, default: '', select: false },
    },
    // Full structured content of the submitted form (subjects, dates, declaration ...).
    formData: { type: mongoose.Schema.Types.Mixed, default: {} },
    academicYear: { type: String, default: '2025/2026' },
    formSemester: { type: String, default: '' },
    assignedLecturer: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      staffId: { type: String, default: '' },
    },
    resubmissionCount: { type: Number, default: 0 },
    returnDetails: {
      returnedBy: { type: String, default: null },
      returnedByRole: { type: String, default: null },
      returnedAt: { type: Date, default: null },
      stage: { type: String, default: null },
      stageKey: { type: String, default: null },
      reason: { type: String, default: null },
    },
    admissionDetails: {
      admissionNo: { type: String, default: '' },
      issuedAt: { type: Date, default: null },
      status: { type: String, default: 'Pending' },
      officialTitle: { type: String, default: 'Dean Office Admission (Examination Section)' },
      managedBySAR: { type: Boolean, default: true },
    },
    senateCopy: {
      prepared: { type: Boolean, default: false },
      preparedAt: { type: Date, default: null },
      trackingNo: { type: String, default: '' },
      submittedAt: { type: Date, default: null },
      coordinatedBySAR: { type: Boolean, default: true },
    },
    departmentList: {
      forwardedAt: { type: Date, default: null },
      department: { type: String, default: '' },
      listRef: { type: String, default: '' },
      sentBy: { type: String, default: '' },
      academicYear: { type: String, default: '2025/2026' },
      handledBySAR: { type: Boolean, default: false },
    },
    stages: [StageSchema],
    auditLog: [AuditLogSchema],
  },
  { timestamps: true }
);

ProcessRequestSchema.index({ 'student.email': 1, type: 1 });
ProcessRequestSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('ProcessRequest', ProcessRequestSchema);
