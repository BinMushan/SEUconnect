/**
 * SEUConnect examination-form workflows (see SEUConnect_Examination_Workflow_Diagrams.pdf).
 *
 * Each stage is owned by exactly one role. A role may only act while its own stage is
 * the current stage of an application. Stage keys are stable identifiers: the engine
 * and the seed data both rely on them.
 */

const stage = (key, label, role, pendingStatus, extra = {}) => ({ key, label, role, pendingStatus, ...extra });

const WORKFLOWS = {
  // 1. ECA: Student -> SAR -> Examination Branch (dept list to HOD) -> Lecturer -> HOD
  eca_application: {
    type: 'eca_application',
    code: 'ECA',
    trackingPrefix: 'ECA',
    label: 'ECA Application',
    longLabel: 'ECA Application (Continuous Assessment)',
    requiresPayment: true,
    availabilityKey: 'eca',
    submitTo: 'SAR',
    stages: [
      stage('student_submission', 'ECA Application & Payment Submission', 'student', 'Draft'),
      stage('sar_verification', 'SAR Application & Payment Evidence Check', 'sar', 'Pending SAR Review', {
        approveLabel: 'Verify & Forward to Examination Branch',
      }),
      stage('exam_branch_verification', 'Examination Branch Verification & Department List', 'examination', 'Pending Examination Branch', {
        approveLabel: 'Approve & Send Department List to HOD',
        sendsDepartmentList: true,
      }),
      stage('lecturer_check', 'Assigned Lecturer Check', 'lecturer', 'Pending Lecturer', {
        approveLabel: 'Confirm Application Check',
      }),
      stage('hod_final_approval', 'HOD Final Approval', 'hod', 'Pending HOD', {
        approveLabel: 'Grant Final Approval',
      }),
    ],
  },

  // 2. ESA: identical routing to ECA but a fully separate record type
  esa_application: {
    type: 'esa_application',
    code: 'ESA',
    trackingPrefix: 'ESA',
    label: 'ESA Application',
    longLabel: 'ESA Application (End Semester Exam)',
    requiresPayment: true,
    availabilityKey: 'esa',
    submitTo: 'SAR',
    stages: [
      stage('student_submission', 'ESA Application & Payment Submission', 'student', 'Draft'),
      stage('sar_verification', 'SAR Application & Payment Evidence Check', 'sar', 'Pending SAR Review', {
        approveLabel: 'Verify & Forward to Examination Branch',
      }),
      stage('exam_branch_verification', 'Examination Branch Verification & Department List', 'examination', 'Pending Examination Branch', {
        approveLabel: 'Approve & Send Department List to HOD',
        sendsDepartmentList: true,
      }),
      stage('lecturer_check', 'Assigned Lecturer Check', 'lecturer', 'Pending Lecturer', {
        approveLabel: 'Confirm Application Check',
      }),
      stage('hod_final_approval', 'HOD Final Approval', 'hod', 'Pending HOD', {
        approveLabel: 'Grant Final Approval',
      }),
    ],
  },

  // 3. Examination Form: Student -> Lecturer -> HOD -> SAR -> Examination Branch -> SAR outputs
  exam_form: {
    type: 'exam_form',
    code: 'EXAM',
    trackingPrefix: 'EXAM',
    label: 'Examination Form',
    longLabel: 'Examination Form',
    requiresPayment: false,
    availabilityKey: 'examForm',
    submitTo: 'Assigned Lecturer',
    requiresAssignedLecturer: true,
    outputs: ['admission', 'senate'],
    stages: [
      stage('student_submission', 'Examination Form Submission', 'student', 'Draft'),
      stage('lecturer_approval', 'Lecturer Review & Approval', 'lecturer', 'Pending Lecturer', {
        approveLabel: 'Approve & Forward to HOD',
      }),
      stage('hod_approval', 'HOD Approval', 'hod', 'Pending HOD', {
        approveLabel: 'Approve & Forward to SAR',
      }),
      stage('sar_verification', 'SAR Administrative Verification', 'sar', 'Pending SAR Verification', {
        approveLabel: 'Verify & Forward to Examination Branch',
      }),
      stage('exam_branch_verification', 'Examination Branch Verification & Checks', 'examination', 'Pending Examination Branch', {
        approveLabel: 'Complete Checks',
      }),
      stage('sar_outputs', 'Dean Office Admission & Senate Copy (tracked separately)', 'sar', 'Admission Processing', {
        outputsStage: true,
      }),
    ],
  },

  // 4. Subject Medical: Student -> Department MA (final). No SAR step.
  subject_medical: {
    type: 'subject_medical',
    code: 'SMED',
    trackingPrefix: 'MED-SUB',
    label: 'Subject Medical',
    longLabel: 'Subject Medical Form',
    requiresPayment: false,
    availabilityKey: null,
    submitTo: 'Department MA',
    stages: [
      stage('student_submission', 'Subject Medical Form Submission', 'student', 'Draft'),
      stage('dept_ma_final_approval', 'Department MA Review & Final Approval', 'dept_ma', 'Pending Dept MA', {
        approveLabel: 'Grant Final Approval',
      }),
    ],
  },

  // 5. Examination Medical: Student -> Faculty MA -> SAR -> Examination Branch -> SAR (Senate copy)
  exam_medical: {
    type: 'exam_medical',
    code: 'EXMED',
    trackingPrefix: 'MED-EX',
    label: 'Examination Medical',
    longLabel: 'Examination Medical Form',
    requiresPayment: false,
    availabilityKey: null,
    submitTo: 'Faculty MA',
    outputs: ['senate'],
    stages: [
      stage('student_submission', 'Examination Medical Form Submission', 'student', 'Draft'),
      stage('faculty_ma_intake', 'Faculty MA Intake for Faculty Board MA / Dean Office Stage', 'fma', 'Pending Faculty MA', {
        approveLabel: 'Receive & Route to SAR',
      }),
      stage('faculty_board_dean_office', 'SAR Processing at Faculty Board MA / Dean Office Stage', 'sar', 'Pending SAR Action', {
        approveLabel: 'Approve & Forward to Examination Branch',
      }),
      stage('exam_branch_approval', 'Examination Branch Final Verification & Approval', 'examination', 'Pending Examination Branch', {
        approveLabel: 'Grant Final Approval',
      }),
      stage('sar_senate_tracking', 'SAR Senate Copy Preparation & Submission Tracking', 'sar', 'Pending SAR Senate Tracking', {
        outputsStage: true,
      }),
    ],
  },

  // 6. Re-scrutinization of Marks & Grades: Student -> SAR -> Examination Branch -> SAR
  rescrutiny_application: {
    type: 'rescrutiny_application',
    code: 'RESCRUTINY',
    trackingPrefix: 'RESCRUT',
    label: 'Re-Scrutinization Application',
    longLabel: 'Application for Re-scrutinization of Marks & Grades',
    requiresPayment: true,
    availabilityKey: null,
    submitTo: 'SAR',
    stages: [
      stage('student_submission', 'Re-Scrutinization Application & Payment Submission', 'student', 'Draft'),
      stage('sar_verification', 'SAR Application & Payment Verification', 'sar', 'Pending SAR Review', {
        approveLabel: 'Verify & Forward to Verification Board',
      }),
      stage('exam_branch_verification', 'Verification Board Assessment of Marks & Grades', 'examination', 'Pending Examination Branch', {
        approveLabel: 'Complete Assessment & Forward to SAR',
      }),
      stage('sar_final_approval', 'SAR Final Endorsement & Grade Notification', 'sar', 'Pending SAR Approval', {
        approveLabel: 'Publish Verified Grade Result',
      }),
    ],
  },

  // 7. Official Institutional Email Request: Student -> HOD -> Dean
  email_request: {
    type: 'email_request',
    code: 'EMAIL',
    trackingPrefix: 'EML',
    label: 'Official Email Request',
    longLabel: 'University GSuite Institutional Email Account Request',
    requiresPayment: false,
    availabilityKey: null,
    submitTo: 'Head of Department',
    stages: [
      stage('student_submission', 'Email Account Request Submission', 'student', 'Draft'),
      stage('hod_recommendation', 'HOD Academic Verification & Recommendation', 'hod', 'Pending HOD', {
        approveLabel: 'Recommend & Forward to Dean',
      }),
      stage('dean_approval', 'Dean Office Endorsement & ICT Center Issuance', 'dean', 'Pending Dean', {
        approveLabel: 'Approve & Issue Institutional Email',
      }),
    ],
  },
};

const WORKFLOW_TYPES = Object.keys(WORKFLOWS);

// Older request types handled by the generic HOD / Dean desks. They keep their own stages.
const LEGACY_TYPES = ['medical_excuse', 'repeat_exam', 'add_drop', 'leave_absence', 'special_concession'];

const getWorkflow = (type) => WORKFLOWS[type] || null;

// Pending status label for a stage of any process (new workflows carry it on the stage itself).
const LEGACY_PENDING_STATUS = {
  lecturer: 'Pending Lecturer',
  examination: 'Pending Medical Verification',
  hod: 'Pending HOD',
  dean: 'Pending Dean',
  sar: 'Pending SAR Review',
  dept_ma: 'Pending Dept MA',
  fma: 'Pending Faculty MA',
};

const pendingStatusFor = (process, stageDoc) => {
  if (stageDoc.pendingStatus) return stageDoc.pendingStatus;
  const wf = getWorkflow(process.type);
  const def = wf && wf.stages.find((s) => s.key === stageDoc.stageKey);
  if (def && def.pendingStatus) return def.pendingStatus;
  return LEGACY_PENDING_STATUS[stageDoc.role] || 'In Progress';
};

module.exports = { WORKFLOWS, WORKFLOW_TYPES, LEGACY_TYPES, getWorkflow, pendingStatusFor };
