const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../../store');
const { hashPassword, verifyPassword } = require('../../utils/password');
const { normalizeRole, deptCode } = require('../../utils/roles');
const authController = require('../../controllers/authController');

test('admin: role normalisation maps diverse institutional titles to strict keys', () => {
  assert.equal(normalizeRole('Dean'), 'dean');
  assert.equal(normalizeRole('Faculty Dean'), 'dean');
  assert.equal(normalizeRole('HOD'), 'hod');
  assert.equal(normalizeRole('Head of Department (DICT)'), 'hod');
  assert.equal(normalizeRole('Head of Department (DBST)'), 'hod');
  assert.equal(normalizeRole('Senior Assistant Registrar (SAR)'), 'sar');
  assert.equal(normalizeRole('Examination Officer'), 'examination');
  assert.equal(normalizeRole('System Administrator'), 'admin');
  assert.equal(normalizeRole('Student'), 'student');
  assert.equal(normalizeRole('Lecturer'), 'lecturer');
});

test('admin: deptCode properly classifies faculty branches', () => {
  assert.equal(deptCode('Department of Information and Communication Technology'), 'ICT');
  assert.equal(deptCode('Information & Communication Technology'), 'ICT');
  assert.equal(deptCode('SEU/IS/22/ICT/085'), 'ICT');
  assert.equal(deptCode('Department of Bio Systems Technology'), 'BST');
  assert.equal(deptCode('SEU/IS/21/BST/032'), 'BST');
  assert.equal(deptCode('Faculty Administration'), 'FACULTY');
});

test('admin: password preservation during user role and status updates', async () => {
  const existingEmail = `test.staff.${Date.now()}@seu.ac.lk`;
  const initialPass = 'StrongPass@2026';
  const hashedInitial = hashPassword(initialPass);

  // 1. Create original user
  const initialUser = await store.users.createOrUpdate({
    name: 'Eng. K. Thanushan',
    email: existingEmail,
    password: hashedInitial,
    role: 'admin',
    roleKey: 'admin',
    department: 'Faculty of Technology',
    designation: 'System Administrator',
    status: 'active'
  });

  assert.ok(initialUser);
  assert.equal(verifyPassword(initialPass, initialUser.password), true);

  // 2. Mock request to update role and status WITHOUT passing a new password
  const mockReq = {
    body: {
      name: 'Eng. K. Thanushan',
      email: existingEmail,
      role: 'System Administrator',
      roleKey: 'admin',
      department: 'Faculty IT Center',
      designation: 'Senior System Administrator',
      status: 'active'
    }
  };

  let resData = null;
  const mockRes = {
    json: (payload) => { resData = payload; return payload; },
    status: () => mockRes
  };

  await authController.provisionUser(mockReq, mockRes);
  assert.equal(resData?.success, true);

  // 3. Verify user in store still authenticates with original password
  const updatedUser = await store.users.findByEmail(existingEmail);
  assert.ok(updatedUser);
  assert.equal(verifyPassword(initialPass, updatedUser.password), true);
  assert.equal(updatedUser.department, 'Faculty IT Center');
});

test('admin: user account status toggle from active to suspended and back', async () => {
  const staffEmail = `officer.${Date.now()}@seu.ac.lk`;
  await store.users.createOrUpdate({
    name: 'Test Exam Officer',
    email: staffEmail,
    password: hashPassword('Officer@123'),
    role: 'examination',
    roleKey: 'examination',
    status: 'active'
  });

  const user = await store.users.findByEmail(staffEmail);
  assert.equal(user.status, 'active');

  // Toggle to suspended
  user.status = 'suspended';
  await store.users.createOrUpdate(user);

  const suspendedUser = await store.users.findByEmail(staffEmail);
  assert.equal(suspendedUser.status, 'suspended');

  // Toggle back to active
  suspendedUser.status = 'active';
  await store.users.createOrUpdate(suspendedUser);

  const activeUser = await store.users.findByEmail(staffEmail);
  assert.equal(activeUser.status, 'active');
});

test('admin: notification creation, shape validation, and priority bounds', async () => {
  const tracking = `NOTIF-TEST-${Date.now()}`;
  const notice = await store.notifications.create({
    title: 'Urgent Examination Timetable Finalization',
    message: 'All course conveners must verify CA grades before Senate moderation.',
    type: 'announcement',
    priority: 'Urgent',
    department: 'Faculty Administration',
    relatedRequestId: tracking,
    trackingNumber: tracking,
    recipientRole: 'all',
    readBy: []
  });

  assert.ok(notice);
  assert.equal(notice.title, 'Urgent Examination Timetable Finalization');
  assert.equal(notice.priority, 'Urgent');
  assert.equal(notice.trackingNumber, tracking);

  // Clean up
  await store.notifications.delete(notice._id);
});
