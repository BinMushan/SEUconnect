/**
 * Workflow engine: builds applications from the definitions, enforces who may act at each
 * stage, advances / returns / declines them, and describes the notifications each transition
 * must produce. It never touches storage: controllers persist the mutated document and send
 * the notifications returned in `events`.
 */
const { getWorkflow, pendingStatusFor } = require('./definitions');
const { normalizeRole, deptCode, sameDepartment, ROLE_LABELS } = require('../utils/roles');

class WorkflowError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const TERMINAL = ['Approved', 'Declined'];
const DEPT_SCOPED_ROLES = ['lecturer', 'hod', 'dept_ma'];
const READ_ALL_ROLES = ['admin', 'superadmin', 'dean'];
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const RECEIPT_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

const rand = (min, max) => Math.floor(min + Math.random() * (max - min));
const stampFor = (role, kind) => `SEU-${String(role).toUpperCase().replace(/\s+/g, '_')}-${kind}#${rand(10000, 99999)}`;
const roleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || role;
const clean = (v) => (typeof v === 'string' ? v.trim() : v);

const actorOf = (user) => ({
  name: user.name || roleLabel(user.role),
  email: String(user.email || '').toLowerCase(),
  role: normalizeRole(user.role),
  roleLabel: roleLabel(user.role),
});

const describe = (process) => {
  const wf = getWorkflow(process.type);
  const label = wf ? wf.label : process.title || 'Application';
  return `${label} ${process.trackingNumber} (${process.student?.name || 'Student'}, ${process.student?.regNo || ''})`;
};

/* ---------------------------- notification helpers --------------------------- */
// Where a notification should land inside each role's portal (ids from roleNavConfigs).
const targetTabFor = (role, type) => {
  switch (normalizeRole(role)) {
    case 'student':
      return 'track_applications';
    case 'sar':
      return { eca_application: 'inbox_eca', esa_application: 'inbox_esa', exam_form: 'inbox_exam_forms', exam_medical: 'inbox_exam_medicals' }[type] || 'inboxes';
    case 'dept_ma':
      return type === 'subject_medical' ? 'medical_applications' : 'workflow_applications';
    default:
      return 'workflow_applications';
  }
};

const notice = (process, role, over = {}) => {
  const r = normalizeRole(role);
  return {
    recipientRole: r,
    recipientEmail: '',
    recipientDepartment: DEPT_SCOPED_ROLES.includes(r) ? deptCode(process.student?.department) : 'ALL',
    type: 'GENERAL',
    priority: 'normal',
    relatedRequestId: process.trackingNumber,
    trackingNumber: process.trackingNumber,
    department: process.student?.department,
    targetTab: targetTabFor(r, process.type),
    ...over,
  };
};

const studentNotice = (process, over) =>
  notice(process, 'student', { recipientEmail: String(process.student?.email || '').toLowerCase(), recipientDepartment: 'ALL', ...over });

// Announces that `stage` now needs action from its owning role.
const stageEntryNotice = (process, stage, actor) => {
  const over = {
    type: 'ACTION_REQUIRED',
    priority: 'high',
    title: `Action required: ${process.trackingNumber}`,
    message: `${describe(process)} is waiting for your action - ${stage.label}.${actor ? ` Forwarded by ${actor.name} (${actor.roleLabel}).` : ''}`,
  };
  if (stage.role === 'lecturer' && process.assignedLecturer?.email) over.recipientEmail = process.assignedLecturer.email.toLowerCase();
  return notice(process, stage.role, over);
};

/* ------------------------------ validation ------------------------------ */
const validDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

const normaliseSubjects = (subjects) =>
  (Array.isArray(subjects) ? subjects : [])
    .map((s) => ({ code: clean(s?.code) || '', title: clean(s?.title) || '' }))
    .filter((s) => s.code || s.title);

const validateReceipt = (receipt) => {
  if (!receipt || !receipt.dataUrl) return null;
  const mime = String(receipt.mime || '').toLowerCase();
  if (!RECEIPT_MIME.includes(mime)) throw new WorkflowError(400, 'Receipt must be a PNG, JPG or PDF file.');
  const match = /^data:([^;]+);base64,(.*)$/s.exec(receipt.dataUrl);
  if (!match || match[1].toLowerCase() !== mime) throw new WorkflowError(400, 'Receipt upload is malformed. Please attach the file again.');
  const bytes = Math.floor((match[2].length * 3) / 4);
  if (bytes > MAX_RECEIPT_BYTES) throw new WorkflowError(400, 'Receipt file is too large (maximum 5 MB).');
  return { name: clean(receipt.name) || 'receipt', mime, size: bytes, dataUrl: receipt.dataUrl };
};

/**
 * Validates a student's submission and returns the normalised fields for the process record.
 * Throws WorkflowError(400) with a student-readable message for anything missing.
 */
const validateSubmission = (wf, payload, { existingReceipt } = {}) => {
  const p = payload || {};
  const subjects = normaliseSubjects(p.subjects);
  const out = { subjects };

  if (wf.requiresPayment || wf.type === 'exam_form') {
    if (!subjects.length) throw new WorkflowError(400, 'Add at least one subject / course unit to the application.');
  }

  if (wf.requiresPayment) {
    const pay = p.payment || {};
    const amount = Number(pay.amount);
    if (!clean(pay.voucherNo)) throw new WorkflowError(400, 'Enter the People\'s Bank voucher / receipt number.');
    if (!Number.isFinite(amount) || amount <= 0) throw new WorkflowError(400, 'Enter the amount paid (must be greater than zero).');
    if (!validDate(pay.date)) throw new WorkflowError(400, 'Enter the payment date.');
    const receipt = validateReceipt(p.receipt);
    if (!receipt && !existingReceipt) throw new WorkflowError(400, 'Upload the payment voucher / receipt before submitting.');
    out.payment = { voucherNo: clean(pay.voucherNo), amount, date: pay.date, bankBranch: clean(pay.bankBranch) || "People's Bank" };
    out.receipt = receipt;
  }

  if (wf.type === 'subject_medical' || wf.type === 'exam_medical') {
    const m = p.medical || {};
    if (!clean(m.reason) || clean(m.reason).length < 10) throw new WorkflowError(400, 'Describe the medical reason (at least 10 characters).');
    if (!validDate(m.fromDate) || !validDate(m.toDate)) throw new WorkflowError(400, 'Enter the medical leave start and end dates.');
    if (Date.parse(m.toDate) < Date.parse(m.fromDate)) throw new WorkflowError(400, 'Leave end date cannot be before the start date.');
    if (!subjects.length) throw new WorkflowError(400, 'Add at least one affected subject.');
    out.medical = {
      reason: clean(m.reason),
      fromDate: m.fromDate,
      toDate: m.toDate,
      doctorName: clean(m.doctorName) || '',
      hospital: clean(m.hospital) || '',
      certificateNo: clean(m.certificateNo) || '',
      issueDate: validDate(m.issueDate) ? m.issueDate : '',
      documentName: clean(m.documentName) || '',
    };
  }

  return out;
};

/* ------------------------------ construction ----------------------------- */
const makeStages = (wf, studentLabel, now) =>
  wf.stages.map((def, index) => ({
    stageKey: def.key,
    label: def.label,
    role: def.role,
    pendingStatus: def.pendingStatus,
    status: index === 0 ? 'COMPLETED' : index === 1 ? 'CURRENT' : 'PENDING',
    actionTakenBy: index === 0 ? studentLabel : null,
    actionTakenRole: index === 0 ? 'Student' : null,
    actionDate: index === 0 ? now : null,
    remarks: index === 0 ? `${wf.label} submitted online by the student.` : '',
    digitalStamp: index === 0 ? stampFor('STU', 'SUBMIT') : null,
  }));

const detailsFrom = (wf, fields, payload) => {
  const m = fields.medical;
  const today = new Date().toISOString().split('T')[0];
  const codes = fields.subjects.map((s) => [s.code, s.title].filter(Boolean).join(' - '));
  return {
    absenceDate: m?.fromDate || payload?.examDate || today,
    endDate: m?.toDate || payload?.examDate || today,
    missedSessions: clean(payload?.missedSessions) || (m ? 'As listed in the subject schedule' : wf.label),
    courseCodes: codes,
    reason: m?.reason || clean(payload?.reason) || `${wf.label} application`,
    doctorName: m?.doctorName || '',
    hospitalClinic: m?.hospital || '',
    medicalCertNo: m?.certificateNo || fields.payment?.voucherNo || '',
    issueDate: m?.issueDate || fields.payment?.date || '',
    attachedDocumentName: m?.documentName || fields.receipt?.name || '',
    notes: clean(payload?.notes) || '',
  };
};

/**
 * Build the data for a new application. `lecturer` is the resolved lecturer user (or null).
 * Returns { data, events }.
 */
const buildApplication = ({ wf, student, payload, lecturer }) => {
  const fields = validateSubmission(wf, payload);
  if (wf.requiresAssignedLecturer && !lecturer) {
    throw new WorkflowError(400, 'Select the lecturer this form should be submitted to.');
  }
  const now = new Date();
  const studentLabel = `${student.name} (${student.regNo || 'Student'})`;
  const stages = makeStages(wf, studentLabel, now);
  const first = stages[1];

  const data = {
    trackingPrefix: wf.trackingPrefix,
    type: wf.type,
    title: clean(payload?.title) || `${wf.longLabel}${fields.subjects[0] ? ` - ${fields.subjects[0].code || fields.subjects[0].title}` : ''}`,
    category: wf.requiresPayment || wf.type === 'exam_form' ? 'Examinations Branch' : 'Academic & Medical Affairs',
    status: first.pendingStatus,
    priority: 'Standard',
    student: {
      name: student.name,
      regNo: student.regNo || '',
      email: student.email,
      department: student.department,
      faculty: student.faculty,
      programme: student.programme,
      semester: clean(payload?.semester) || student.semester,
    },
    details: detailsFrom(wf, fields, payload),
    academicYear: clean(payload?.academicYear) || '2025/2026',
    formSemester: clean(payload?.semester) || student.semester || '',
    assignedLecturer: lecturer ? { name: lecturer.name, email: lecturer.email, staffId: lecturer.staffId || '' } : undefined,
    formData: { ...(payload?.formData && typeof payload.formData === 'object' ? payload.formData : {}), subjects: fields.subjects, medical: fields.medical },
    currentStageIndex: 1,
    currentAssignedRole: first.role,
    stages,
    auditLog: [
      {
        action: 'SUBMITTED',
        actorName: student.name,
        actorRole: `Student (${student.regNo || 'STU'})`,
        actorEmail: student.email,
        timestamp: now,
        stage: stages[0].label,
        comment: `${wf.longLabel} submitted online and routed to ${wf.submitTo}.`,
      },
    ],
  };

  if (fields.payment) {
    data.paymentReceipt = {
      ...fields.payment,
      receiptUrl: '',
      fileName: fields.receipt?.name || '',
      hasFile: Boolean(fields.receipt),
      verifiedBySAR: false,
    };
  }
  if (fields.receipt) data.receiptFile = fields.receipt;
  if (wf.outputs && wf.outputs.includes('admission')) {
    data.admissionDetails = { status: 'Pending', issuedAt: null, admissionNo: '' };
  }

  const view = { ...data, trackingNumber: '<pending>' };
  const events = [
    studentNotice(view, {
      type: 'SUBMITTED',
      title: `${wf.label} submitted`,
      message: `Your ${wf.longLabel} was submitted and routed to ${wf.submitTo}. You will be notified at every step.`,
    }),
    stageEntryNotice(view, first, { name: student.name, roleLabel: 'Student' }),
  ];
  return { data, events };
};

// Notifications are generated before the tracking number exists; bind it afterwards.
const bindTracking = (events, process) =>
  events.map((e) => ({
    ...e,
    relatedRequestId: process.trackingNumber,
    trackingNumber: process.trackingNumber,
    title: e.title.replace('<pending>', process.trackingNumber),
    message: e.message.replace('<pending>', process.trackingNumber),
  }));

/* ------------------------------ permissions ------------------------------ */
const currentStageOf = (process) => (process.stages || [])[process.currentStageIndex] || null;

const isLecturerAllowed = (process, user) => {
  const assigned = String(process.assignedLecturer?.email || '').toLowerCase();
  return !assigned || assigned === String(user.email || '').toLowerCase();
};

// Why the user may not act right now, or null when they may.
const actBlocker = (user, process) => {
  const role = normalizeRole(user.role);
  if (TERMINAL.includes(process.status)) return { status: 409, message: `This application is already ${process.status}.` };
  if (process.status === 'Returned for Correction') return { status: 409, message: 'This application was returned to the student and is waiting for resubmission.' };
  const stage = currentStageOf(process);
  if (!stage) return { status: 409, message: 'This application has no active stage.' };

  if (process.type === 'subject_medical' && role === 'sar') {
    return { status: 403, message: 'Subject Medical has no SAR step. It is handled only by the Department MA.' };
  }
  if (stage.role !== role) {
    return { status: 403, message: `This application is currently with the ${roleLabel(stage.role)}. The ${roleLabel(role)} cannot act at this step.` };
  }
  if (DEPT_SCOPED_ROLES.includes(role) && !sameDepartment(user.department, process.student?.department)) {
    return { status: 403, message: 'This application belongs to another department.' };
  }
  if (role === 'lecturer' && !isLecturerAllowed(process, user)) {
    return { status: 403, message: 'This application is assigned to a different lecturer.' };
  }
  return null;
};

const assertCanAct = (user, process) => {
  const blocked = actBlocker(user, process);
  if (blocked) throw new WorkflowError(blocked.status, blocked.message);
  return currentStageOf(process);
};

const canView = (user, process) => {
  const role = normalizeRole(user.role);
  if (role === 'student') {
    const userEmail = String(user.email || '').toLowerCase().trim();
    const procEmail = String(process.student?.email || '').toLowerCase().trim();
    if (userEmail && procEmail && userEmail === procEmail) return true;
    const userReg = String(user.regNo || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const procReg = String(process.student?.regNo || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (userReg && procReg && userReg === procReg) return true;
    return false;
  }
  if (READ_ALL_ROLES.includes(role)) return true;

  const wf = getWorkflow(process.type);
  if (!wf) {
    // Older request types keep their original visibility: department roles see their own department.
    if (DEPT_SCOPED_ROLES.includes(role)) return sameDepartment(user.department, process.student?.department);
    return true;
  }

  const owned = (process.stages || []).filter((s) => s.role === role);
  if (!owned.length) return false;
  if (DEPT_SCOPED_ROLES.includes(role) && !sameDepartment(user.department, process.student?.department)) return false;
  if (role === 'lecturer' && !isLecturerAllowed(process, user)) return false;
  if (owned.some((s) => s.status !== 'PENDING')) return true;
  // The department-wise list reaches the HOD before the lecturer check.
  return role === 'hod' && Boolean(process.departmentList?.forwardedAt);
};

/* -------------------------------- actions -------------------------------- */
const logAudit = (process, actor, action, stageLabel, comment) => {
  process.auditLog.push({
    action,
    actorName: actor.name,
    actorRole: actor.roleLabel,
    actorEmail: actor.email,
    timestamp: new Date(),
    stage: stageLabel,
    comment,
  });
};

const finalise = (process, actor, events) => {
  const now = new Date();
  process.status = 'Approved';
  process.currentAssignedRole = 'completed';
  process.approvalDetails = {
    approvedAt: now,
    finalApprovalCode: `SEU-FOT-AUTH-${now.getFullYear()}-${rand(1000, 9999)}`,
    endorsementSeal: 'OFFICIALLY VERIFIED AND APPROVED BY THE FACULTY OF TECHNOLOGY, SOUTH EASTERN UNIVERSITY OF SRI LANKA',
  };
  events.push(
    studentNotice(process, {
      type: 'APPROVED',
      priority: 'high',
      title: `Application approved: ${process.trackingNumber}`,
      message: `Your ${describe(process)} has completed every approval step.`,
    })
  );
  if (['eca_application', 'esa_application'].includes(process.type)) {
    events.push(
      notice(process, 'examination', {
        type: 'APPROVED',
        title: `Final approval recorded: ${process.trackingNumber}`,
        message: `${describe(process)} received final HOD approval.`,
      })
    );
  }
  logAudit(process, actor, 'COMPLETED', 'Workflow Complete', 'All approval stages completed.');
};

const requireReceiptEvidence = (process) => {
  const pay = process.paymentReceipt || {};
  if (!pay.voucherNo && !pay.hasFile) {
    throw new WorkflowError(400, 'Payment evidence is missing. Return the application to the student for correction.');
  }
};

/**
 * Complete the current stage and move the application forward.
 * extras: { assignedLecturer, listRef } supplied by the controller for hooks that need them.
 */
const approve = (process, user, { remarks, extras = {} } = {}) => {
  const stage = assertCanAct(user, process);
  const actor = actorOf(user);
  const wf = getWorkflow(process.type);
  const def = wf?.stages.find((s) => s.key === stage.stageKey);

  if (def?.outputsStage) {
    throw new WorkflowError(400, 'This step is completed through the Admission / Senate copy actions, not a generic approval.');
  }

  const events = [];
  const now = new Date();

  if (wf?.requiresPayment && stage.stageKey === 'sar_verification') {
    requireReceiptEvidence(process);
    process.paymentReceipt.verifiedBySAR = true;
  }

  stage.status = 'COMPLETED';
  stage.actionTakenBy = actor.name;
  stage.actionTakenRole = actor.roleLabel;
  stage.actionDate = now;
  stage.remarks = clean(remarks) || `${def?.approveLabel || 'Approved'} by ${actor.roleLabel}`;
  stage.digitalStamp = stampFor(actor.role, 'VERIFIED');

  const isLast = process.currentStageIndex + 1 >= process.stages.length;
  const auditAction = actor.role === 'sar' ? 'SAR_VERIFIED_AND_FORWARDED' : isLast ? 'APPROVED' : 'STAGE_COMPLETED';
  logAudit(process, actor, auditAction, stage.label, stage.remarks);

  // Examination Branch sends the department-wise list to the department / HOD before lecturer checking.
  if (def?.sendsDepartmentList) {
    const code = deptCode(process.student?.department);
    const listRef = extras.listRef || `DL-${wf.code}-${code}-${now.getFullYear()}-${rand(100, 999)}`;
    process.departmentList = {
      forwardedAt: now,
      department: process.student?.department || '',
      listRef,
      sentBy: `${actor.name} (${actor.roleLabel})`,
      academicYear: process.academicYear || '2025/2026',
      handledBySAR: false,
    };
    if (extras.assignedLecturer) {
      process.assignedLecturer = {
        name: extras.assignedLecturer.name,
        email: extras.assignedLecturer.email,
        staffId: extras.assignedLecturer.staffId || '',
      };
    }
    logAudit(process, actor, 'DEPARTMENT_LIST_SENT', stage.label, `Department-wise ${wf.code} list ${listRef} sent to the ${code} department / HOD.`);
    if (!extras.suppressListNotice) {
      events.push(
        notice(process, 'hod', {
          type: 'EXAMINATION_LIST',
          priority: 'high',
          title: `Department ${wf.code} list received: ${process.trackingNumber}`,
          message: `The Examination Branch sent the department-wise ${wf.code} list (${listRef}) including ${describe(process)}. Lecturer checking is now in progress.`,
        })
      );
    }
  }

  if (process.type === 'exam_medical' && stage.stageKey === 'exam_branch_approval') {
    process.approvalDetails = {
      approvedAt: now,
      finalApprovalCode: `SEU-EXMED-${now.getFullYear()}-${rand(1000, 9999)}`,
      endorsementSeal: 'EXAMINATION BRANCH FINAL APPROVAL - SENATE COPY PENDING',
    };
  }

  if (!isLast) {
    const next = process.stages[process.currentStageIndex + 1];
    next.status = 'CURRENT';
    process.currentStageIndex += 1;
    process.currentAssignedRole = next.role;
    process.status = pendingStatusFor(process, next);
    events.push(stageEntryNotice(process, next, actor));
    events.push(
      studentNotice(process, {
        type: 'PROGRESS',
        title: `Application update: ${process.trackingNumber}`,
        message: `${describe(process)} was approved by ${actor.roleLabel} and moved to ${next.label}.`,
      })
    );
  } else {
    finalise(process, actor, events);
  }

  return { events };
};

const resetToStudent = (process, status) => {
  process.status = status;
  process.currentAssignedRole = 'student';
};

/** Return the application to the student for correction (reason is mandatory). */
const returnForCorrection = (process, user, reason, { prefix = '' } = {}) => {
  if (!clean(reason)) throw new WorkflowError(400, 'Specific instructions for the student are mandatory.');
  const stage = assertCanAct(user, process);
  const actor = actorOf(user);
  const now = new Date();
  const text = `${prefix}${clean(reason)}`.trim();

  stage.status = 'RETURNED';
  stage.actionTakenBy = actor.name;
  stage.actionTakenRole = actor.roleLabel;
  stage.actionDate = now;
  stage.remarks = `RETURNED FOR CORRECTION: ${text}`;
  stage.digitalStamp = stampFor(actor.role, 'RETURNED');

  process.returnDetails = {
    returnedBy: actor.name,
    returnedByRole: actor.roleLabel,
    returnedAt: now,
    stage: stage.label,
    stageKey: stage.stageKey,
    reason: text,
  };
  resetToStudent(process, 'Returned for Correction');
  process.currentStageIndex = 0;
  logAudit(process, actor, 'RETURNED_FOR_CORRECTION', stage.label, `RETURNED FOR CORRECTION: ${text}`);

  return {
    events: [
      studentNotice(process, {
        type: 'CORRECTION',
        priority: 'urgent',
        title: `Returned for correction: ${process.trackingNumber}`,
        message: `${actor.roleLabel} returned your ${describe(process)}. Required action: ${text}`,
      }),
    ],
  };
};

/** Decline the application permanently (reason is mandatory). */
const decline = (process, user, reason) => {
  if (!clean(reason)) throw new WorkflowError(400, 'A specific decline reason is mandatory.');
  const stage = assertCanAct(user, process);
  const actor = actorOf(user);
  const now = new Date();

  stage.status = 'DECLINED';
  stage.actionTakenBy = actor.name;
  stage.actionTakenRole = actor.roleLabel;
  stage.actionDate = now;
  stage.remarks = `DECLINED: ${clean(reason)}`;
  stage.digitalStamp = stampFor(actor.role, 'DECLINED');

  process.status = 'Declined';
  process.declineDetails = {
    declinedBy: actor.name,
    declinedByRole: actor.roleLabel,
    declinedAt: now,
    stage: stage.label,
    reason: clean(reason),
  };
  logAudit(process, actor, 'DECLINED', stage.label, `DECLINED: ${clean(reason)}`);

  return {
    events: [
      studentNotice(process, {
        type: 'DECLINED',
        priority: 'urgent',
        title: `Application declined: ${process.trackingNumber}`,
        message: `Your ${describe(process)} was declined by ${actor.roleLabel}. Reason: ${clean(reason)}`,
      }),
    ],
  };
};

/**
 * Student corrects and resubmits a returned application. The approval chain restarts from the
 * first reviewing stage; the history stays in the audit log.
 */
const resubmit = ({ process, student, payload, lecturer }) => {
  if (String(process.student?.email || '').toLowerCase() !== String(student.email || '').toLowerCase()) {
    throw new WorkflowError(403, 'You can only resubmit your own applications.');
  }
  if (process.status !== 'Returned for Correction') {
    throw new WorkflowError(409, 'Only applications returned for correction can be resubmitted.');
  }
  const wf = getWorkflow(process.type);
  if (!wf) throw new WorkflowError(400, 'This request type cannot be resubmitted online.');

  const fields = validateSubmission(wf, payload, { existingReceipt: process.paymentReceipt?.hasFile || process.paymentReceipt?.voucherNo });
  if (wf.requiresAssignedLecturer && !lecturer && !process.assignedLecturer?.email) {
    throw new WorkflowError(400, 'Select the lecturer this form should be submitted to.');
  }

  const now = new Date();
  process.details = detailsFrom(wf, fields, payload);
  if (payload?.title) process.title = clean(payload.title);
  if (lecturer) process.assignedLecturer = { name: lecturer.name, email: lecturer.email, staffId: lecturer.staffId || '' };
  process.formData = { ...(payload?.formData && typeof payload.formData === 'object' ? payload.formData : {}), subjects: fields.subjects, medical: fields.medical };
  if (fields.payment) {
    process.paymentReceipt = {
      ...fields.payment,
      receiptUrl: '',
      fileName: fields.receipt?.name || process.paymentReceipt?.fileName || '',
      hasFile: Boolean(fields.receipt) || Boolean(process.paymentReceipt?.hasFile),
      verifiedBySAR: false,
    };
  }
  if (fields.receipt) process.receiptFile = fields.receipt;

  process.stages.forEach((s, i) => {
    if (i === 0) {
      s.status = 'COMPLETED';
      s.actionDate = now;
      s.remarks = 'Corrected application resubmitted by the student.';
      s.digitalStamp = stampFor('STU', 'RESUBMIT');
      return;
    }
    s.status = i === 1 ? 'CURRENT' : 'PENDING';
    s.actionTakenBy = null;
    s.actionTakenRole = null;
    s.actionDate = null;
    s.remarks = '';
    s.digitalStamp = null;
  });
  process.currentStageIndex = 1;
  const first = process.stages[1];
  process.currentAssignedRole = first.role;
  process.status = pendingStatusFor(process, first);
  process.resubmissionCount = (process.resubmissionCount || 0) + 1;
  process.returnDetails = undefined;
  process.departmentList = undefined;
  if (process.admissionDetails && wf.outputs?.includes('admission')) process.admissionDetails = { status: 'Pending', issuedAt: null, admissionNo: '' };
  process.senateCopy = undefined;

  const actor = actorOf(student);
  logAudit(process, actor, 'RESUBMITTED', 'Student Resubmission', `Corrected ${wf.label} resubmitted (attempt ${process.resubmissionCount + 1}).`);

  return {
    events: [
      studentNotice(process, { type: 'SUBMITTED', title: `Application resubmitted: ${process.trackingNumber}`, message: `Your corrected ${describe(process)} was resubmitted and routed to ${wf.submitTo}.` }),
      stageEntryNotice(process, first, { name: student.name, roleLabel: 'Student' }),
    ],
  };
};

/* ------------------------- SAR outputs (admission / senate) ------------------------- */
const outputsStageOf = (process, user, { requireSar = true } = {}) => {
  const role = normalizeRole(user.role);
  if (requireSar && role !== 'sar') throw new WorkflowError(403, 'Only the SAR can act at this step.');
  const wf = getWorkflow(process.type);
  if (!wf || !wf.outputs) throw new WorkflowError(400, 'This application type has no admission / Senate copy outputs.');
  const stage = currentStageOf(process);
  const def = wf.stages.find((s) => s.key === stage?.stageKey);
  if (!stage || !def?.outputsStage) {
    throw new WorkflowError(409, 'The application has not reached the SAR output stage yet (Examination Branch checks must be completed first).');
  }
  return { wf, stage };
};

const completeOutputsIfDone = (process, actor, events) => {
  const wf = getWorkflow(process.type);
  const admissionDone = !wf.outputs.includes('admission') || Boolean(process.admissionDetails?.admissionNo);
  const senateDone = !wf.outputs.includes('senate') || Boolean(process.senateCopy?.submittedAt);
  if (!(admissionDone && senateDone)) return false;
  const stage = currentStageOf(process);
  stage.status = 'COMPLETED';
  stage.actionTakenBy = actor.name;
  stage.actionTakenRole = actor.roleLabel;
  stage.actionDate = new Date();
  stage.remarks = 'All SAR outputs completed and tracked.';
  stage.digitalStamp = stampFor('SAR', 'OUTPUTS');
  finalise(process, actor, events);
  return true;
};

/** Dean Office Admission (Examination Section): processed and managed by SAR. */
const issueAdmission = (process, user, { admissionNo, notes } = {}) => {
  const { stage } = outputsStageOf(process, user);
  if (process.type !== 'exam_form') throw new WorkflowError(400, 'Dean Office Admission applies only to Examination Forms.');
  if (process.admissionDetails?.admissionNo) throw new WorkflowError(409, 'The admission has already been issued for this application.');
  const actor = actorOf(user);
  const events = [];
  const no = clean(admissionNo) || `ADM-FOT-${new Date().getFullYear()}-${rand(1000, 9999)}`;

  process.admissionDetails = {
    admissionNo: no,
    issuedAt: new Date(),
    status: 'Generated & Dispatched',
    officialTitle: 'Dean Office Admission (Examination Section)',
    managedBySAR: true,
  };
  logAudit(process, actor, 'DEAN_OFFICE_ADMISSION_ISSUED', stage.label, `Dean Office Admission (Examination Section) issued [${no}]. ${clean(notes) || ''}`.trim());
  events.push(
    studentNotice(process, {
      type: 'ADMISSION_ISSUED',
      priority: 'high',
      title: `Dean Office Admission issued: ${no}`,
      message: `Your Dean Office Admission (Examination Section) for ${process.trackingNumber} has been issued by the SAR.`,
    })
  );
  if (!completeOutputsIfDone(process, actor, events)) process.status = 'Admission Generated';
  return { events };
};

/** Senate copy preparation and submission tracking (Examination Form and Examination Medical). */
const trackSenateCopy = (process, user, { trackingNo, note, phase = 'submitted' } = {}) => {
  const { stage } = outputsStageOf(process, user);
  const actor = actorOf(user);
  const events = [];
  const now = new Date();
  const existing = process.senateCopy || {};
  const no = clean(trackingNo) || existing.trackingNo || `SENATE-FOT-${now.getFullYear()}-${rand(100, 999)}`;

  if (existing.submittedAt) throw new WorkflowError(409, 'The Senate copy has already been submitted for this application.');

  const submitted = phase !== 'prepared';
  process.senateCopy = {
    prepared: true,
    preparedAt: existing.preparedAt || now,
    trackingNo: no,
    submittedAt: submitted ? now : null,
    coordinatedBySAR: true,
  };
  logAudit(
    process,
    actor,
    submitted ? 'SENATE_COPY_SUBMITTED' : 'SENATE_COPY_PREPARED',
    stage.label,
    `Senate copy ${submitted ? 'prepared and submitted' : 'prepared'} - tracking ${no}. ${clean(note) || ''}`.trim()
  );
  if (submitted) {
    events.push(
      studentNotice(process, {
        type: 'PROGRESS',
        title: `Senate copy submitted: ${process.trackingNumber}`,
        message: `The Senate copy for your ${describe(process)} was submitted (tracking ${no}).`,
      })
    );
    completeOutputsIfDone(process, actor, events);
  }
  return { events };
};

/* ------------------------------ client shaping ------------------------------ */
const actionsFor = (user, process) => {
  const role = normalizeRole(user.role);
  const wf = getWorkflow(process.type);
  const stage = currentStageOf(process);
  const def = wf?.stages.find((s) => s.key === stage?.stageKey);
  const blocked = actBlocker(user, process);
  const isOwner = role === 'student' && String(process.student?.email || '').toLowerCase() === String(user.email || '').toLowerCase();
  return {
    canAct: !blocked,
    actions: !blocked ? (def?.outputsStage ? ['outputs', 'return'] : ['approve', 'return', 'decline']) : [],
    approveLabel: def?.approveLabel || 'Approve & Forward',
    blockedReason: blocked ? blocked.message : '',
    canResubmit: isOwner && process.status === 'Returned for Correction' && Boolean(wf),
    isOutputsStage: Boolean(def?.outputsStage),
    sendsDepartmentList: Boolean(def?.sendsDepartmentList),
  };
};

// Plain JSON for the browser: no receipt payload, plus the caller's permissions.
const toClient = (doc, user) => {
  const obj = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: false }) : JSON.parse(JSON.stringify(doc));
  if (obj.receiptFile) {
    obj.receiptFile = { name: obj.receiptFile.name || '', mime: obj.receiptFile.mime || '', size: obj.receiptFile.size || 0 };
  }
  if (user) obj.permissions = actionsFor(user, doc);
  const wf = getWorkflow(obj.type);
  if (wf) obj.workflow = { label: wf.label, longLabel: wf.longLabel, code: wf.code, stageCount: wf.stages.length };
  return obj;
};

module.exports = {
  WorkflowError,
  buildApplication,
  bindTracking,
  validateSubmission,
  approve,
  returnForCorrection,
  decline,
  resubmit,
  issueAdmission,
  trackSenateCopy,
  assertCanAct,
  actBlocker,
  canView,
  actionsFor,
  toClient,
  actorOf,
  describe,
  notice,
  studentNotice,
  stageEntryNotice,
  currentStageOf,
};
