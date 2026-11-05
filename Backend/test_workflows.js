/**
 * End-to-end workflow test. Starts the API in IN-MEMORY mode (never touches MongoDB) and drives
 * all five workflows from the PDF plus the permission rules.
 *   node test_workflows.js
 */
// Set WF_TEST_MONGO_URI to run against a throwaway MongoDB database instead (dropped afterwards).
process.env.MONGO_URI = process.env.WF_TEST_MONGO_URI || 'mongodb://127.0.0.1:1/seuconnect-test';
process.env.MONGODB_URI = process.env.MONGO_URI;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const assert = require('assert');
const connectDB = require('./config/db');
const { seedDatabase } = require('./seedData');
const { app } = require('./server');

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
let base;
let passed = 0;

const call = async (method, path, token, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
};

const login = async (email) => {
  const r = await call('POST', '/api/auth/login', null, { email, password: '123456' });
  assert.strictEqual(r.status, 200, `login ${email}: ${r.message}`);
  return r.token;
};

const ok = (name, cond, extra = '') => {
  assert.ok(cond, `${name} ${extra}`);
  passed += 1;
  console.log(`  ✓ ${name}`);
};

const approve = async (id, token, body = {}) => call('PUT', `/api/processes/${id}/approve`, token, body);

(async () => {
  await connectDB();
  await seedDatabase();
  const server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  const t = {};
  for (const [k, email] of Object.entries({
    student: 'student@gmail.com', studentBst: 'student.bst@gmail.com', lecturer: 'lecturer@gmail.com', lecturer2: 'lecturer2@gmail.com',
    hod: 'hod@gmail.com', hodBst: 'hod.bst@gmail.com', sar: 'sar@gmail.com', exam: 'examination@gmail.com',
    deptMa: 'deptma@gmail.com', deptMaBst: 'deptma.bst@gmail.com', fma: 'fma@gmail.com', admin: 'admin@gmail.com',
  })) t[k] = await login(email);

  console.log('\nAuth');
  ok('rejects bad password', (await call('POST', '/api/auth/login', null, { email: 'sar@gmail.com', password: 'x' })).status === 401);
  ok('requires a token', (await call('GET', '/api/processes')).status === 401);

  console.log('\n1. ECA: Student -> SAR -> Examination Branch -> Lecturer -> HOD');
  const eca = await call('POST', '/api/processes', t.student, {
    type: 'eca_application', semester: 'Semester 06',
    subjects: [{ code: 'ICT3113', title: 'Advanced SE' }],
    payment: { voucherNo: 'PIV-T-1', amount: 100, date: '2026-10-30' },
    receipt: { name: 'v.png', mime: 'image/png', dataUrl: PNG },
  });
  ok('student submits ECA', eca.status === 201 && eca.data.status === 'Pending SAR Review', JSON.stringify(eca));
  const ecaId = eca.data.trackingNumber;
  ok('receipt payload not exposed in JSON', !JSON.stringify(eca.data).includes('base64'));
  ok('student cannot approve', (await approve(ecaId, t.student)).status === 403);
  ok('exam branch cannot jump ahead of SAR', [403, 404].includes((await approve(ecaId, t.exam)).status));
  ok('lecturer cannot see it yet', (await call('GET', `/api/processes/${ecaId}`, t.lecturer)).status === 404);
  ok('duplicate active ECA is blocked', (await call('POST', '/api/processes', t.student, {
    type: 'eca_application', semester: 'Semester 06', subjects: [{ code: 'X', title: 'Y' }],
    payment: { voucherNo: 'P', amount: 1, date: '2026-10-30' }, receipt: { name: 'v.png', mime: 'image/png', dataUrl: PNG } })).status === 409);
  ok('SAR forwards', (await approve(ecaId, t.sar)).data.status === 'Pending Examination Branch');
  const rec = await fetch(`${base}/api/processes/${ecaId}/receipt`, { headers: { Authorization: `Bearer ${t.exam}` } });
  ok('exam branch can open the receipt', rec.status === 200 && rec.headers.get('content-type') === 'image/png');
  ok('BST HOD cannot see ICT application', (await call('GET', `/api/processes/${ecaId}`, t.hodBst)).status === 404);
  const sent = await call('POST', '/api/processes/department-lists/dispatch', t.exam, { department: 'ICT', formType: 'eca_application', ids: [ecaId] });
  ok('exam branch sends department-wise list to HOD', sent.status === 200 && sent.count === 1 && /^DL-ECA-ICT/.test(sent.listRef), JSON.stringify(sent));
  ok('HOD sees the list before lecturer check', (await call('GET', `/api/processes/${ecaId}`, t.hod)).status === 200);
  ok('HOD cannot approve before lecturer', (await approve(ecaId, t.hod)).status === 403);
  ok('lecturer checks', (await approve(ecaId, t.lecturer)).data.status === 'Pending HOD');
  ok('SAR cannot give HOD final approval', (await approve(ecaId, t.sar)).status === 403);
  const done = await approve(ecaId, t.hod);
  ok('HOD final approval completes ECA', done.data.status === 'Approved' && done.data.approvalDetails.finalApprovalCode);

  console.log('\n2. ESA stays separate from ECA');
  const esa = await call('POST', '/api/processes', t.student, {
    type: 'esa_application', semester: 'Semester 06', subjects: [{ code: 'ICT3123', title: 'SE' }],
    payment: { voucherNo: 'PIV-T-2', amount: 100, date: '2026-10-30' }, receipt: { name: 'v.png', mime: 'image/png', dataUrl: PNG } });
  ok('ESA gets its own record type and number', esa.status === 201 && esa.data.type === 'esa_application' && esa.data.trackingNumber.startsWith('ESA-'));
  const rep = await call('GET', '/api/stats/workflows', t.sar);
  const row = (c) => rep.data.find((r) => r.code === c);
  ok('report lists ECA and ESA separately', row('ECA') && row('ESA') && row('ECA').total !== undefined);
  ok('submit without receipt is rejected', (await call('POST', '/api/processes', t.studentBst, {
    type: 'esa_application', semester: 'Semester 06', subjects: [{ code: 'A', title: 'B' }], payment: { voucherNo: 'P', amount: 1, date: '2026-10-30' } })).status === 400);

  console.log('\n3. Examination Form: Student -> Lecturer -> HOD -> SAR -> Exam Branch -> two SAR outputs');
  ok('form requires a lecturer', (await call('POST', '/api/processes', t.student, { type: 'exam_form', semester: 'Semester 06', subjects: [{ code: 'A', title: 'B' }] })).status === 400);
  const ef = await call('POST', '/api/processes', t.student, { type: 'exam_form', semester: 'Semester 06', subjects: [{ code: 'ICT3113', title: 'SE' }], assignedLecturerEmail: 'lecturer@gmail.com' });
  ok('submitted to assigned lecturer', ef.status === 201 && ef.data.status === 'Pending Lecturer', JSON.stringify(ef));
  const efId = ef.data.trackingNumber;
  ok('other lecturer cannot act', (await approve(efId, t.lecturer2)).status === 404);
  ok('lecturer approves -> HOD', (await approve(efId, t.lecturer)).data.status === 'Pending HOD');
  ok('HOD approves -> SAR', (await approve(efId, t.hod)).data.status === 'Pending SAR Verification');
  ok('SAR verifies -> Exam Branch', (await call('PUT', `/api/processes/${efId}/sar/verify-forward`, t.sar, {})).data.status === 'Pending Examination Branch');
  const checks = await approve(efId, t.exam);
  ok('exam branch completes checks -> Admission Processing', checks.data.status === 'Admission Processing');
  ok('generic approve blocked at outputs stage', (await approve(efId, t.sar)).status === 400);
  ok('exam branch cannot issue admission', (await call('PUT', `/api/processes/${efId}/sar/process-admission`, t.exam, {})).status === 403);
  const adm = await call('PUT', `/api/processes/${efId}/sar/process-admission`, t.sar, {});
  ok('SAR issues Dean Office Admission (output 1)', adm.data.status === 'Admission Generated' && adm.data.admissionDetails.admissionNo);
  const sen = await call('PUT', `/api/processes/${efId}/sar/track-senate-copy`, t.sar, { trackingNo: 'SEN-1' });
  ok('SAR tracks Senate copy (output 2) -> Approved', sen.data.status === 'Approved' && sen.data.senateCopy.trackingNo === 'SEN-1');

  console.log('\n4. Subject Medical: Student -> Department MA only');
  const sm = await call('POST', '/api/processes', t.student, { type: 'subject_medical', semester: 'Semester 06', subjects: [{ code: 'ICT3113', title: 'SE' }],
    medical: { reason: 'Viral fever, rest advised for three days', fromDate: '2026-10-20', toDate: '2026-10-22' } });
  ok('routed to Dept MA', sm.status === 201 && sm.data.status === 'Pending Dept MA', JSON.stringify(sm));
  const smId = sm.data.trackingNumber;
  ok('SAR has no step and no visibility', (await approve(smId, t.sar)).status === 404);
  ok('other department MA cannot act', (await approve(smId, t.deptMaBst)).status === 404);
  ok('Dept MA gives final approval', (await approve(smId, t.deptMa)).data.status === 'Approved');

  console.log('\n5. Examination Medical: Student -> Faculty MA -> SAR -> Exam Branch -> SAR senate tracking');
  const em = await call('POST', '/api/processes', t.student, { type: 'exam_medical', semester: 'Semester 06', subjects: [{ code: 'ICT3123', title: 'SE' }],
    medical: { reason: 'Hospitalised on the examination day', fromDate: '2026-10-20', toDate: '2026-10-22' } });
  ok('routed to Faculty MA', em.status === 201 && em.data.status === 'Pending Faculty MA');
  const emId = em.data.trackingNumber;
  ok('Faculty MA routes to SAR', (await approve(emId, t.fma)).data.status === 'Pending SAR Action');
  ok('SAR approves at Faculty Board stage -> Exam Branch', (await approve(emId, t.sar)).data.status === 'Pending Examination Branch');
  ok('Exam Branch gives final approval -> SAR senate tracking', (await approve(emId, t.exam)).data.status === 'Pending SAR Senate Tracking');
  ok('Exam Medical has no admission output', (await call('PUT', `/api/processes/${emId}/sar/process-admission`, t.sar, {})).status === 400);
  ok('SAR submits Senate copy -> Approved', (await call('PUT', `/api/processes/${emId}/sar/track-senate-copy`, t.sar, {})).data.status === 'Approved');

  console.log('\nReturn / resubmit / decline');
  const eca2 = await call('POST', '/api/processes', t.studentBst, { type: 'eca_application', semester: 'Semester 06', subjects: [{ code: 'BST3113', title: 'FP' }],
    payment: { voucherNo: 'PIV-T-3', amount: 100, date: '2026-10-30' }, receipt: { name: 'v.png', mime: 'image/png', dataUrl: PNG } });
  const id2 = eca2.data.trackingNumber;
  ok('return needs a reason', (await call('PUT', `/api/processes/${id2}/return`, t.sar, {})).status === 400);
  ok('SAR returns to student', (await call('POST', `/api/processes/${id2}/clarification`, t.sar, { notes: 'Voucher unreadable', issuesIdentified: ['Voucher'] })).data.status === 'Returned for Correction');
  ok('student resubmits', (await call('PUT', `/api/processes/${id2}/resubmit`, t.studentBst, { type: 'eca_application', subjects: [{ code: 'BST3113', title: 'FP' }],
    payment: { voucherNo: 'PIV-T-3B', amount: 100, date: '2026-10-30' } })).data.status === 'Pending SAR Review');
  ok('SAR declines with reason', (await call('PUT', `/api/processes/${id2}/decline`, t.sar, { reason: 'Not eligible' })).data.status === 'Declined');

  console.log('\nNotifications');
  const sn = await call('GET', '/api/notifications', t.student);
  ok('student receives progress notifications', sn.count > 0 && sn.data.some((n) => n.trackingNumber === ecaId));
  const first = sn.data.find((n) => !n.isRead);
  await call('PUT', `/api/notifications/${first._id}/read`, t.student);
  ok('mark single read lowers unread count', (await call('GET', '/api/notifications', t.student)).unreadCount === sn.unreadCount - 1);
  await call('PUT', '/api/notifications/mark-all-read', t.student);
  ok('mark all read', (await call('GET', '/api/notifications', t.student)).unreadCount === 0);
  const hn = await call('GET', '/api/notifications', t.hod);
  ok('HOD got the department list notice', hn.data.some((n) => n.type === 'EXAMINATION_LIST'));
  ok('lecturer notified by assignment only', (await call('GET', '/api/notifications', t.lecturer2)).data.every((n) => !n.title.includes(efId)));
  ok('SAR sees its own inbox notices', (await call('GET', '/api/notifications', t.sar)).count > 0);

  console.log('\nPermissions');
  ok('student cannot read other students list', (await call('GET', '/api/auth/users', t.student)).status === 403);
  ok('staff cannot submit applications', (await call('POST', '/api/processes', t.sar, { type: 'eca_application' })).status === 403);
  ok('only SAR toggles portals', (await call('POST', '/api/processes/portal/form-availability', t.exam, { formType: 'eca' })).status === 403);
  await call('POST', '/api/processes/portal/form-availability', t.sar, { formType: 'examForm', isOpen: false });
  ok('closed portal blocks submissions', (await call('POST', '/api/processes', t.studentBst, { type: 'exam_form', semester: 'Semester 06', subjects: [{ code: 'A', title: 'B' }], assignedLecturerEmail: 'lecturer.bst@gmail.com' })).status === 409);

  console.log(`\nAll ${passed} checks passed.`);
  server.close();
  if (process.env.WF_TEST_MONGO_URI) {
    await require('mongoose').connection.dropDatabase();
    console.log('Throwaway test database dropped.');
  }
  process.exit(0);
})().catch((e) => {
  console.error('\nFAILED:', e.message);
  process.exit(1);
});
