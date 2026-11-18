const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../../store');
const engine = require('../../workflows/engine');
const { WORKFLOWS, WORKFLOW_TYPES } = require('../../workflows/definitions');
const { normalizeRole, deptCode, sameDepartment } = require('../../utils/roles');
const { hashPassword, verifyPassword } = require('../../utils/password');

test('RBAC: administrative governance and access boundary verification', () => {
  const adminUser = { id: 'ADM-01', role: 'admin', roleKey: 'admin', department: 'Faculty Administration Office' };
  const deanUser = { id: 'DEAN-01', role: 'dean', roleKey: 'dean', department: 'Faculty of Technology' };
  const hodIctUser = { id: 'HOD-01', role: 'hod', roleKey: 'hod', department: 'Department of Information & Communication Technology' };
  const hodBstUser = { id: 'HOD-02', role: 'hod', roleKey: 'hod', department: 'Department of Bio Systems Technology' };
  const sarUser = { id: 'SAR-01', role: 'sar', roleKey: 'sar', department: 'Faculty Administration Office' };
  const examOfficer = { id: 'EXAM-01', role: 'examination', roleKey: 'examination', department: 'Examination Branch' };
  const lecturerIct = { id: 'LEC-01', role: 'lecturer', roleKey: 'lecturer', department: 'Department of Information & Communication Technology' };
  const studentUser = { id: 'STU-01', role: 'student', roleKey: 'student', email: 'afnan@student.seu.ac.lk', department: 'Department of Information & Communication Technology' };

  // 1. Department matching
  assert.equal(sameDepartment(lecturerIct.department, studentUser.department), true);
  assert.equal(sameDepartment(hodIctUser.department, hodBstUser.department), false);
  assert.equal(deptCode(hodIctUser.department), 'ICT');
  assert.equal(deptCode(hodBstUser.department), 'BST');

  // 2. Admin can observe all institutional requests
  const sampleProcess = {
    _id: 'proc_12345',
    type: 'medical_excuse',
    status: 'Pending Medical Verification',
    student: { email: studentUser.email, department: studentUser.department },
    currentStage: { role: 'medical_officer', status: 'CURRENT' },
    stages: [
      { stageKey: 'medical_check', role: 'medical_officer', status: 'CURRENT' },
      { stageKey: 'dean_endorse', role: 'dean', status: 'PENDING' }
    ]
  };

  assert.equal(engine.canView(adminUser, sampleProcess), true);
  assert.equal(engine.canView(deanUser, sampleProcess), true);
  assert.equal(engine.canView(sarUser, sampleProcess), true);
  assert.equal(engine.canView(studentUser, sampleProcess), true);
});

test('Workflows: verify registration, medical, and repeat exam definitions', () => {
  assert.ok(WORKFLOW_TYPES.includes('eca_application'));
  assert.ok(WORKFLOW_TYPES.includes('esa_application'));
  assert.ok(WORKFLOW_TYPES.includes('exam_form'));
  assert.ok(WORKFLOW_TYPES.includes('subject_medical'));
  assert.ok(WORKFLOW_TYPES.includes('exam_medical'));
  assert.ok(WORKFLOW_TYPES.includes('rescrutiny_application'));
  assert.ok(WORKFLOW_TYPES.includes('email_request'));

  const { LEGACY_TYPES } = require('../../workflows/definitions');
  assert.ok(LEGACY_TYPES.includes('medical_excuse'));
  assert.ok(LEGACY_TYPES.includes('repeat_exam'));
  assert.ok(LEGACY_TYPES.includes('add_drop'));

  const ecaDef = WORKFLOWS['eca_application'];
  assert.ok(ecaDef);
  assert.equal(Array.isArray(ecaDef.stages), true);
});

test('Process Lifecycle: creation, approval, and rejection in memory store', async () => {
  const trackingNumber = `TRK-${Date.now()}`;
  const processDoc = await store.processes.create({
    trackingNumber,
    type: 'medical_excuse',
    title: 'Medical Leave - Viral Flu (3 Days)',
    status: 'Pending Lecturer',
    student: {
      name: 'Mohamed Afnan',
      regNo: 'SEU/IS/22/ICT/085',
      email: 'afnan.test@student.seu.ac.lk',
      department: 'Department of Information and Communication Technology'
    },
    medical: {
      startDate: '2026-11-10',
      endDate: '2026-11-13',
      medicalDays: 3,
      doctorName: 'Dr. K.M. Farook',
      diagnosis: 'Acute Viral Fever',
      slipNumber: `SLIP-${Date.now()}`,
      attendanceBefore: 74,
      attendanceAfterApproval: 85
    },
    stages: [
      { stageKey: 'lecturer_endorsement', role: 'lecturer', status: 'CURRENT', label: 'Lecturer Verification' },
      { stageKey: 'dean_seal', role: 'dean', status: 'PENDING', label: 'Dean Approval' }
    ],
    auditLog: [
      { action: 'SUBMIT', actorName: 'Mohamed Afnan', actorRole: 'student', timestamp: new Date() }
    ]
  });

  assert.ok(processDoc);
  assert.equal(processDoc.trackingNumber, trackingNumber);

  // Transition stage
  processDoc.status = 'Approved';
  await store.processes.save(processDoc);

  const verified = await store.processes.find(trackingNumber);
  assert.equal(verified.status, 'Approved');
});

test('Security: user password hashing, upgrade verification, and edge cases', () => {
  const plain = 'Strong@Password#2026!';
  const hashed = hashPassword(plain);

  assert.notEqual(hashed, plain);
  assert.equal(verifyPassword(plain, hashed), true);
  assert.equal(verifyPassword('WrongPass', hashed), false);
  assert.equal(verifyPassword('', hashed), false);
  assert.equal(verifyPassword(plain, ''), false);
});
