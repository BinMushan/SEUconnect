const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { start, stop, call, makeUser, login, PASSWORD } = require('./helpers');

let dict;
let dbst;
let admin;
let facAdmin;
const ctx = {};

const day = 86400000;
const iso = (offset) => new Date(Date.now() + offset * day).toISOString();

before(async () => {
  await start();
  const { Department } = require('../modules/organization/model');
  dict = await Department.findOne({ code: 'DICT' });
  dbst = await Department.findOne({ code: 'DBST' });
  admin = await makeUser({ role: 'admin', name: 'Root Admin' });
  facAdmin = await makeUser({ role: 'faculty_admin', name: 'Faculty Admin' });
});
after(stop);

/* ----------------------------------------------------------------- Phase 2 */
test('authentication: wrong password, lockout, refresh rotation, password change revokes sessions', async () => {
  const u = await makeUser({ role: 'lecturer', name: 'Lock Me' });
  for (let i = 0; i < 5; i += 1) assert.equal((await login(u.email, 'wrong')).status, 401);
  const locked = await login(u.email, PASSWORD);
  assert.equal(locked.status, 423);
  assert.equal(locked.code, 'ACCOUNT_LOCKED');

  const s = await makeUser({ role: 'student', name: 'Rotate Me' });
  const r1 = await call('POST', '/api/v1/auth/refresh', null, { refreshToken: s.refreshToken });
  assert.equal(r1.status, 200);
  const reuse = await call('POST', '/api/v1/auth/refresh', null, { refreshToken: s.refreshToken });
  assert.equal(reuse.status, 401);
  assert.equal(reuse.code, 'REFRESH_REUSED');
  // the whole family is revoked, including the freshly issued token
  assert.equal((await call('POST', '/api/v1/auth/refresh', null, { refreshToken: r1.data.refreshToken })).status, 401);

  const t = await makeUser({ role: 'student', name: 'Change Pw' });
  const changed = await call('POST', '/api/v1/auth/change-password', t.token, { currentPassword: PASSWORD, newPassword: 'NewPassw0rd-1' });
  assert.equal(changed.status, 200);
  const old = await call('GET', '/api/v1/auth/me', t.token);
  assert.equal(old.status, 401);
  assert.equal(old.code, 'TOKEN_REVOKED');
  assert.equal((await call('POST', '/api/v1/auth/change-password', changed.data.accessToken, { currentPassword: 'NewPassw0rd-1', newPassword: 'weak' })).status, 422);
});

test('every v1 route needs a token; permissions are enforced by the backend', async () => {
  assert.equal((await call('GET', '/api/v1/departments')).status, 401);
  const student = await makeUser({ role: 'student', name: 'Plain Student' });
  const denied = await call('POST', '/api/v1/departments', student.token, { code: 'DXYZ', name: 'Nope' });
  assert.equal(denied.status, 403);
  assert.equal(denied.code, 'PERMISSION_DENIED');
  assert.equal((await call('GET', '/api/v1/departments', student.token)).status, 200); // org.read is allowed
  assert.equal((await call('GET', '/api/v1/audit', student.token)).status, 403);
  assert.equal((await call('GET', '/api/v1/users', student.token)).status, 403);
});

test('faculty structure is stored as data: departments, programmes, specializations / majoring divisions', async () => {
  const depts = await call('GET', '/api/v1/departments', admin.token);
  assert.deepEqual(depts.data.map((d) => d.code).sort(), ['DBST', 'DICT']);
  const progs = await call('GET', '/api/v1/programmes', admin.token);
  assert.deepEqual(progs.data.map((p) => p.code).sort(), ['BBST', 'BICT']);
  const bict = progs.data.find((p) => p.code === 'BICT');
  const bbst = progs.data.find((p) => p.code === 'BBST');
  ctx.bict = bict;
  ctx.bbst = bbst;
  assert.equal(bict.durationYears, 4);
  const sp = await call('GET', `/api/v1/specializations?programme=${bict._id}`, admin.token);
  assert.deepEqual(sp.data.map((s) => s.code).sort(), ['NST', 'SWT']);
  const mj = await call('GET', `/api/v1/specializations?programme=${bbst._id}`, admin.token);
  assert.deepEqual(mj.data.map((s) => s.code).sort(), ['AAT', 'AEE', 'BSE', 'CST', 'FST']);
  assert.ok(mj.data.every((s) => s.kind === 'majoring'));
  assert.equal((await call('POST', '/api/v1/departments', admin.token, { code: 'DICT', name: 'Duplicate' })).status, 409);
});

test('academic years, semesters (date rules, lifecycle) and batches', async () => {
  const year = await call('POST', '/api/v1/academic-years', facAdmin.token, { label: '2025/2026', startDate: iso(-60), endDate: iso(300) });
  assert.equal(year.status, 201);
  ctx.year = year.data;
  assert.equal((await call('POST', '/api/v1/academic-years', facAdmin.token, { label: 'bad', startDate: iso(0), endDate: iso(10) })).status, 422);

  const bad = await call('POST', '/api/v1/semesters', facAdmin.token, { academicYear: ctx.year._id, number: 1, startDate: iso(10), endDate: iso(5) });
  assert.equal(bad.status, 422);
  const outside = await call('POST', '/api/v1/semesters', facAdmin.token, { academicYear: ctx.year._id, number: 1, startDate: iso(-100), endDate: iso(20) });
  assert.equal(outside.code, 'SEMESTER_OUTSIDE_YEAR');

  const sem = await call('POST', '/api/v1/semesters', facAdmin.token, {
    academicYear: ctx.year._id, number: 1, startDate: iso(-30), endDate: iso(100),
    registrationOpens: iso(-5), registrationCloses: iso(9), addDropOpens: iso(9), addDropCloses: iso(23),
  });
  assert.equal(sem.status, 201);
  ctx.sem = sem.data;
  assert.equal((await call('POST', '/api/v1/semesters', facAdmin.token, { academicYear: ctx.year._id, number: 1, startDate: iso(-20), endDate: iso(50) })).status, 409); // unique (year, number)
  assert.equal((await call('POST', `/api/v1/semesters/${ctx.sem._id}/transition`, facAdmin.token, { to: 'running' })).code, 'INVALID_TRANSITION'); // draft cannot skip to running
  assert.equal((await call('POST', `/api/v1/semesters/${ctx.sem._id}/transition`, facAdmin.token, { to: 'open' })).status, 200);

  const b1 = await call('POST', '/api/v1/batches', facAdmin.token, { programme: ctx.bict._id, intakeYear: 2023 });
  const b2 = await call('POST', '/api/v1/batches', facAdmin.token, { programme: ctx.bbst._id, intakeYear: 2023 });
  assert.equal(b1.status, 201);
  ctx.batchICT = b1.data;
  ctx.batchBST = b2.data;
  assert.equal((await call('POST', '/api/v1/batches', facAdmin.token, { programme: ctx.bict._id, intakeYear: 2023 })).status, 409);
});

test('users and roles: policy is data, privileged grants are protected, role edits are audited', async () => {
  const created = await call('POST', '/api/v1/users', admin.token, { name: 'New Lecturer', email: 'new.lecturer@test.seu', role: 'lecturer', departmentRef: dict._id });
  assert.equal(created.status, 201);
  assert.ok(created.data.temporaryPassword);
  assert.equal(created.data.user.password, undefined);
  assert.equal((await call('POST', '/api/v1/users', facAdmin.token, { name: 'X', email: 'x@test.seu', role: 'lecturer' })).status, 403); // no users.write

  const roles = await call('GET', '/api/v1/roles', admin.token);
  assert.ok(['admin', 'dean', 'faculty_admin', 'hod', 'lecturer', 'demonstrator', 'student'].every((k) => roles.data.some((r) => r.key === k)));
  const perms = await call('GET', '/api/v1/permissions', admin.token);
  assert.ok(perms.data.length > 30);

  const lec = await call('GET', '/api/v1/roles/lecturer', admin.token);
  const lockout = await call('PUT', '/api/v1/roles/admin', admin.token, { permissions: [{ key: 'users.read', scope: 'system' }] });
  assert.equal(lockout.code, 'LOCKOUT_PREVENTED');
  const edited = await call('PUT', '/api/v1/roles/lecturer', admin.token, { permissions: lec.data.permissions, description: 'edited in test', reason: 'test' });
  assert.equal(edited.status, 200);
  const audit = await call('GET', '/api/v1/audit?entityType=Role&action=role.update', admin.token);
  assert.ok(audit.data.length >= 1);
  assert.equal((await call('PUT', '/api/v1/roles/lecturer', admin.token, { permissions: [{ key: 'does.not.exist', scope: 'own' }] })).code, 'PERMISSION_INVALID');
});

test('audit records are immutable and have no write API', async () => {
  const AuditLog = require('../modules/audit/model');
  const row = await AuditLog.findOne({});
  assert.ok(row);
  await assert.rejects(() => AuditLog.updateOne({ _id: row._id }, { reason: 'tamper' }), /immutable/);
  await assert.rejects(() => AuditLog.deleteMany({}), /immutable/);
  row.reason = 'tamper';
  await assert.rejects(() => row.save(), /immutable/);
  assert.equal((await call('DELETE', `/api/v1/audit/${row._id}`, admin.token)).status, 404);
  assert.equal((await call('POST', '/api/v1/audit', admin.token, { action: 'x' })).status, 404);
});

/* ----------------------------------------------------------------- Phase 3 */
test('staff: responsibilities drive role grants, one HOD per department, no privilege escalation', async () => {
  const mk = async (staffId, name, dept, role = 'lecturer') => call('POST', '/api/v1/staff', facAdmin.token, { staffId, fullName: name, email: `${staffId.toLowerCase()}@test.seu`, department: dept._id, role });
  const a = await mk('S-DICT-1', 'Dr Lecturer One', dict);
  const b = await mk('S-DICT-2', 'Dr Second', dict);
  const c = await mk('S-DBST-1', 'Dr Bio One', dbst);
  assert.equal(a.status, 201);
  ctx.staffA = a.data.staff;
  ctx.staffB = b.data.staff;
  ctx.staffC = c.data.staff;
  ctx.accA = a.data;
  ctx.accC = c.data;
  assert.equal((await mk('S-DICT-1', 'Duplicate', dict)).status, 409);

  const lect = await call('POST', `/api/v1/staff/${ctx.staffA._id}/responsibilities`, facAdmin.token, { type: 'lecturer' });
  assert.equal(lect.status, 201);
  await call('POST', `/api/v1/staff/${ctx.staffB._id}/responsibilities`, facAdmin.token, { type: 'lecturer' });
  await call('POST', `/api/v1/staff/${ctx.staffC._id}/responsibilities`, facAdmin.token, { type: 'lecturer' });
  const hod = await call('POST', `/api/v1/staff/${ctx.staffB._id}/responsibilities`, facAdmin.token, { type: 'hod' });
  assert.equal(hod.status, 201);
  assert.equal((await call('POST', `/api/v1/staff/${ctx.staffA._id}/responsibilities`, facAdmin.token, { type: 'hod' })).code, 'HOD_EXISTS');
  assert.equal((await call('POST', `/api/v1/staff/${ctx.staffA._id}/responsibilities`, facAdmin.token, { type: 'system_administrator' })).status, 403);

  const bAccount = await login(`s-dict-2@test.seu`, ctx.accA && 'x');
  assert.equal(bAccount.status, 401); // temporary password is only known to the creator
  const resetB = await call('POST', `/api/v1/users/${ctx.staffB.user}/reset-password`, admin.token);
  assert.equal(resetB.status, 200);
  const sign = await login('s-dict-2@test.seu', resetB.data.temporaryPassword);
  assert.equal(sign.status, 200);
  ctx.hod = { token: sign.data.accessToken };
  const me = await call('GET', '/api/v1/auth/me', ctx.hod.token);
  assert.ok(me.data.roles.includes('hod'));
  assert.equal(me.data.permissions['students.write'], 'department');
  assert.ok(me.data.departments.includes(String(dict._id)));

  const resetA = await call('POST', `/api/v1/users/${ctx.staffA.user}/reset-password`, admin.token);
  ctx.lecA = { token: (await login('s-dict-1@test.seu', resetA.data.temporaryPassword)).data.accessToken };
  const resetC = await call('POST', `/api/v1/users/${ctx.staffC.user}/reset-password`, admin.token);
  ctx.hodBst = { token: null, lecC: (await login('s-dbst-1@test.seu', resetC.data.temporaryPassword)).data.accessToken };
});

test('courses: code format, types, prerequisite cycles, department boundaries', async () => {
  const body = (over) => ({ code: 'ICT21013', title: 'Databases', credits: 3, type: 'B', department: dict._id, programme: ctx.bict._id, defaultYear: 2, defaultSemester: 1, ...over });
  assert.equal((await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'IC21013' }))).status, 422);
  assert.equal((await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT2101' }))).status, 422);
  const c1 = await call('POST', '/api/v1/courses', facAdmin.token, body({}));
  assert.equal(c1.status, 201);
  const c2 = await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT21023', title: 'Advanced DB', type: 'A', credits: 3 }));
  ctx.courseDB = c1.data;
  ctx.courseAdv = c2.data;
  const heavy = await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT21099', title: 'Heavy', type: 'A', credits: 23 }));
  ctx.courseHeavy = heavy.data;
  const practical = await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT21041', title: 'Practical only', type: 'C', credits: 1 }));
  assert.equal(practical.status, 201);
  assert.equal((await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT21022', department: dbst._id }))).code, 'PROGRAMME_DEPARTMENT_MISMATCH');
  assert.equal((await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT21013' }))).status, 409);

  assert.equal((await call('PUT', `/api/v1/courses/${ctx.courseDB._id}/prerequisites`, facAdmin.token, { prerequisites: [ctx.courseDB._id] })).code, 'SELF_PREREQUISITE');
  assert.equal((await call('PUT', `/api/v1/courses/${ctx.courseAdv._id}/prerequisites`, facAdmin.token, { prerequisites: [ctx.courseDB._id] })).status, 200);
  assert.equal((await call('PUT', `/api/v1/courses/${ctx.courseDB._id}/prerequisites`, facAdmin.token, { prerequisites: [ctx.courseAdv._id] })).code, 'PREREQUISITE_CYCLE');
  const detail = await call('GET', `/api/v1/courses/${ctx.courseAdv._id}`, facAdmin.token);
  assert.equal(detail.data.prerequisites.length, 1);
  assert.deepEqual(detail.data.components, ['theory']);

  // HOD of DICT may write DICT courses but not DBST ones
  const other = await call('POST', '/api/v1/courses', ctx.hod.token, body({ code: 'BST21013', department: dbst._id, programme: ctx.bbst._id }));
  assert.equal(other.status, 403);
  assert.equal((await call('POST', '/api/v1/courses', ctx.hod.token, body({ code: 'ICT21055', title: 'HOD made' }))).status, 201);
});

test('offerings: components follow the course type, weights are data, assignments keep history', async () => {
  const cfg = await call('POST', '/api/v1/assessment-configurations', facAdmin.token, { name: 'Theory 40/60', caWeight: 40, esaWeight: 60 });
  assert.equal(cfg.status, 201);
  assert.equal(cfg.data.minCaPercent, 40); // default comes from the policy table, not from code
  const bad = await call('POST', '/api/v1/assessment-configurations', facAdmin.token, { name: 'Broken', caWeight: 50, esaWeight: 60 });
  assert.equal(bad.code, 'WEIGHTS_INVALID');
  const cfg2 = await call('POST', '/api/v1/assessment-configurations', facAdmin.token, { name: 'Practical 50/50', caWeight: 50, esaWeight: 50 });
  ctx.cfgT = cfg.data;
  ctx.cfgP = cfg2.data;

  const comps = (...c) => c;
  const mkOffer = (course, components, extra = {}) => call('POST', '/api/v1/offerings', facAdmin.token, { course: course._id, semester: ctx.sem._id, batch: ctx.batchICT._id, components, ...extra });
  // Type B needs theory + practical
  assert.equal((await mkOffer(ctx.courseDB, comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 100 }))).code, 'COMPONENTS_INVALID');
  assert.equal((await mkOffer(ctx.courseDB, comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 60 }, { type: 'practical', assessmentConfiguration: ctx.cfgP._id, weightInCourse: 30 }))).code, 'COMPONENT_WEIGHTS_INVALID');
  const offB = await mkOffer(ctx.courseDB, comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 70 }, { type: 'practical', assessmentConfiguration: ctx.cfgP._id, weightInCourse: 30 }), { status: 'open', capacity: 1 });
  assert.equal(offB.status, 201);
  ctx.offDB = offB.data;
  assert.equal((await mkOffer(ctx.courseDB, comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 70 }, { type: 'practical', assessmentConfiguration: ctx.cfgP._id, weightInCourse: 30 }))).status, 409); // unique course+semester+batch
  // a BBST batch cannot take a BICT course
  const wrongBatch = await call('POST', '/api/v1/offerings', facAdmin.token, { course: ctx.courseAdv._id, semester: ctx.sem._id, batch: ctx.batchBST._id, components: comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 100 }) });
  assert.equal(wrongBatch.code, 'BATCH_PROGRAMME_MISMATCH');
  const offA = await mkOffer(ctx.courseAdv, comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 100 }), { status: 'open' });
  ctx.offAdv = offA.data;
  const offH = await mkOffer(ctx.courseHeavy, comps({ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 100 }), { status: 'open' });
  ctx.offHeavy = offH.data;

  // assignments
  const asg = (o, body, token = facAdmin.token) => call('POST', `/api/v1/offerings/${o._id}/assignments`, token, body);
  assert.equal((await asg(ctx.offDB, { componentType: 'practical', staff: ctx.staffA._id, role: 'lecturer' })).code, 'ROLE_COMPONENT_MISMATCH');
  // a department-scoped HOD cannot pull in staff from another department (faculty-level officers may)
  assert.equal((await asg(ctx.offDB, { componentType: 'theory', staff: ctx.staffC._id, role: 'lecturer' }, ctx.hod.token)).code, 'STAFF_DEPARTMENT_MISMATCH');
  const first = await asg(ctx.offDB, { componentType: 'theory', staff: ctx.staffA._id, role: 'lecturer' });
  assert.equal(first.status, 201, JSON.stringify(first.body));
  assert.equal((await asg(ctx.offDB, { componentType: 'theory', staff: ctx.staffB._id, role: 'lecturer' })).code, 'ASSIGNMENT_EXISTS');
  assert.equal((await asg(ctx.offDB, { componentType: 'theory', staff: ctx.staffB._id, role: 'lecturer', replace: true })).status, 201);
  const hist = await call('GET', `/api/v1/offerings/${ctx.offDB._id}/assignments?history=true`, facAdmin.token);
  assert.equal(hist.data.length, 2);
  assert.equal(hist.data.filter((a) => a.active).length, 1);
  assert.ok(hist.data.find((a) => !a.active).to);
  // demonstrator requires the demonstrator responsibility
  assert.equal((await asg(ctx.offDB, { componentType: 'practical', staff: ctx.staffA._id, role: 'demonstrator' })).code, 'RESPONSIBILITY_MISSING');
  // hand the lecture back to A so A is "assigned" for the scope test
  await asg(ctx.offDB, { componentType: 'theory', staff: ctx.staffA._id, role: 'lecturer', replace: true });

  // course type can no longer change once offered
  assert.equal((await call('PATCH', `/api/v1/courses/${ctx.courseDB._id}`, facAdmin.token, { type: 'A' })).code, 'COURSE_ALREADY_OFFERED');
});

test('students: consistent department > programme > batch chain, accounts, status history, scope', async () => {
  const mk = (over) => call('POST', '/api/v1/students', facAdmin.token, { studentId: '2023/ICT/001', fullName: 'Student One', email: 'stu1@test.seu', departmentRef: dict._id, programmeRef: ctx.bict._id, batchRef: ctx.batchICT._id, ...over });
  assert.equal((await mk({ batchRef: ctx.batchBST._id })).code, 'BATCH_PROGRAMME_MISMATCH');
  assert.equal((await mk({ programmeRef: ctx.bbst._id })).code, 'PROGRAMME_DEPARTMENT_MISMATCH');
  const s1 = await mk({});
  assert.equal(s1.status, 201);
  assert.equal(s1.data.student.status, 'Active');
  assert.equal(s1.data.student.currentYear, 1);
  assert.equal(s1.data.student.attendance, undefined); // legacy embedded sections are not exposed
  assert.equal((await mk({})).status, 409);
  ctx.s1 = s1.data;
  const more = [];
  for (let i = 2; i <= 5; i += 1) more.push(await call('POST', '/api/v1/students', facAdmin.token, { studentId: `2023/ICT/00${i}`, fullName: `Student ${i}`, email: `stu${i}@test.seu`, departmentRef: dict._id, programmeRef: ctx.bict._id, batchRef: ctx.batchICT._id }));
  ctx.more = more.map((m) => m.data);
  const bio = await call('POST', '/api/v1/students', facAdmin.token, { studentId: '2023/BST/001', fullName: 'Bio Student', email: 'bio1@test.seu', departmentRef: dbst._id, programmeRef: ctx.bbst._id, batchRef: ctx.batchBST._id });
  ctx.bio = bio.data;

  const tok = async (acc) => (await login(acc.student.email, acc.temporaryPassword)).data.accessToken;
  ctx.stuTok = await tok(ctx.s1);
  ctx.stuToks = [];
  for (const m of ctx.more) ctx.stuToks.push(await tok(m));
  ctx.bioTok = await tok(ctx.bio);

  // students see only themselves
  const mine = await call('GET', '/api/v1/students', ctx.stuTok);
  assert.equal(mine.meta.total, 1);
  assert.equal((await call('GET', `/api/v1/students/${ctx.more[0].student._id}`, ctx.stuTok)).status, 404);
  assert.equal((await call('GET', '/api/v1/students/me', ctx.stuTok)).data.studentId, '2023/ICT/001');
  assert.equal((await call('POST', '/api/v1/students', ctx.stuTok, { studentId: 'x' })).status, 403);
  // HOD sees only own department
  const hodView = await call('GET', '/api/v1/students', ctx.hod.token);
  assert.equal(hodView.meta.total, 5);
  assert.equal((await call('GET', `/api/v1/students/${ctx.bio.student._id}`, ctx.hod.token)).status, 404);
  assert.equal((await call('POST', `/api/v1/students/${ctx.bio.student._id}/status`, ctx.hod.token, { status: 'Suspended', reason: 'nope' })).status, 404);

  // status lifecycle keeps history and locks the account
  assert.equal((await call('POST', `/api/v1/students/${ctx.more[3].student._id}/status`, ctx.hod.token, { status: 'Suspended', reason: 'Disciplinary' })).status, 200);
  assert.equal((await call('GET', '/api/v1/auth/me', ctx.stuToks[3])).status, 403); // suspended: signed out immediately
  const hist = await call('GET', `/api/v1/students/${ctx.more[3].student._id}/history`, ctx.hod.token);
  assert.equal(hist.data.statusHistory.length, 1);
  assert.equal(hist.data.statusHistory[0].to, 'Suspended');
  assert.equal((await call('POST', `/api/v1/students/${ctx.more[3].student._id}/status`, ctx.hod.token, { status: 'Suspended', reason: 'again' })).code, 'NO_CHANGE');
});

test('subject registration: rules, exceptions, duplicates, capacity under concurrency, add/drop', async () => {
  const reg = (token, offering, extra = {}) => call('POST', '/api/v1/registrations', token, { offering: offering._id, ...extra });

  await call('PUT', `/api/v1/courses/${ctx.courseAdv._id}/prerequisites`, facAdmin.token, { prerequisites: [] }); // clear the prerequisite set by the courses test
  // policy-driven: default is "an officer approves", never auto
  const first = await reg(ctx.stuTok, ctx.offAdv);
  assert.equal(first.status, 201, JSON.stringify(first.body));
  assert.equal(first.data.status, 'pending');
  assert.equal((await reg(ctx.stuTok, ctx.offAdv)).code, 'REGISTRATION_NOT_ALLOWED'); // duplicate (also guarded by a unique index)
  const dup = await reg(ctx.stuTok, ctx.offAdv);
  assert.equal(dup.status, 409);

  // credit limit comes from the policy table; breaking it needs an exception request
  const over = await reg(ctx.stuTok, ctx.offHeavy);
  assert.equal(over.status, 422);
  assert.equal(over.code, 'REGISTRATION_RULES_VIOLATED');
  assert.ok(over.body.error.details.some((d) => d.code === 'CREDIT_LIMIT_EXCEEDED'));
  assert.equal((await reg(ctx.stuTok, ctx.offHeavy, { exception: { requested: true } })).code, 'EXCEPTION_NOTE_REQUIRED');
  const exc = await reg(ctx.stuTok, ctx.offHeavy, { exception: { requested: true, note: 'Final-year workload approved by advisor' } });
  assert.equal(exc.status, 201);
  assert.equal(exc.data.exception.requested, true);
  assert.deepEqual(exc.data.exception.reasons, ['CREDIT_LIMIT_EXCEEDED']);

  // a student may not register somebody else
  assert.equal((await reg(ctx.stuTok, ctx.offAdv, { student: ctx.more[0].student._id })).status, 403);
  // a student of another programme needs an exception (programme mismatch)
  const wrongProg = await reg(ctx.bioTok, ctx.offAdv);
  assert.equal(wrongProg.status, 422);
  assert.ok(wrongProg.body.error.details.some((d) => d.code === 'PROGRAMME_MISMATCH'));

  // prerequisite: ICT21023 requires ICT21013; student 2 hasn't passed it
  await call('PUT', `/api/v1/courses/${ctx.courseAdv._id}/prerequisites`, facAdmin.token, { prerequisites: [ctx.courseDB._id] });
  const pre = await reg(ctx.stuToks[0], ctx.offAdv);
  assert.equal(pre.status, 422);
  assert.ok(pre.body.error.details.some((d) => d.code === 'PREREQUISITES_NOT_MET'));
  await call('PUT', `/api/v1/courses/${ctx.courseAdv._id}/prerequisites`, facAdmin.token, { prerequisites: [] });

  // decisions: department scope, remarks, seat accounting
  const lock = await call('POST', `/api/v1/registrations/${first.data._id}/decision`, ctx.lecA.token, { decision: 'approve' });
  assert.equal(lock.status, 403); // lecturers cannot decide
  const rej = await call('POST', `/api/v1/registrations/${exc.data._id}/decision`, ctx.hod.token, { decision: 'reject' });
  assert.equal(rej.code, 'REMARKS_REQUIRED');
  assert.equal((await call('POST', `/api/v1/registrations/${first.data._id}/decision`, ctx.hod.token, { decision: 'approve', remarks: 'ok' })).data.status, 'approved');
  assert.equal((await call('POST', `/api/v1/registrations/${first.data._id}/decision`, ctx.hod.token, { decision: 'approve' })).code, 'ALREADY_DECIDED');
  assert.equal((await call('POST', `/api/v1/registrations/${exc.data._id}/decision`, ctx.hod.token, { decision: 'reject', remarks: 'Too heavy' })).data.status, 'rejected');

  // concurrency: capacity 1, five students request the last seat at the same moment
  const results = await Promise.all([ctx.stuTok, ...ctx.stuToks.slice(0, 2), ctx.stuToks[2]].map((t) => reg(t, ctx.offDB)));
  const wins = results.filter((r) => r.status === 201);
  assert.equal(wins.length, 1, `exactly one student gets the seat, got ${results.map((r) => r.status)}`);
  assert.ok(results.filter((r) => r.status !== 201).every((r) => r.status === 409 || r.status === 422));
  const { CourseOffering } = require('../modules/courses/model');
  assert.equal((await CourseOffering.findById(ctx.offDB._id)).registeredCount, 1);

  // dropping frees the seat; the seat counter never goes negative
  const winnerReg = wins[0].data;
  const drop = await call('POST', `/api/v1/registrations/${winnerReg._id}/drop`, ctx.stuTok, { reason: 'Changed plan' });
  const owner = [ctx.stuTok, ...ctx.stuToks].find(Boolean);
  assert.ok([200, 404].includes(drop.status));
  if (drop.status === 404) {
    // the winner was another student: drop with that student's token
    for (const t of ctx.stuToks) if ((await call('POST', `/api/v1/registrations/${winnerReg._id}/drop`, t, { reason: 'Changed plan' })).status === 200) break;
  }
  assert.equal((await CourseOffering.findById(ctx.offDB._id)).registeredCount, 0);
  assert.ok(owner);
  assert.equal((await call('POST', `/api/v1/registrations/${winnerReg._id}/drop`, ctx.hod.token, { reason: 'again' })).code, 'INVALID_STATE');

  // windows come from the semester record: closing it blocks new registrations
  const { Semester } = require('../modules/organization/model');
  await Semester.updateOne({ _id: ctx.sem._id }, { registrationOpens: new Date(Date.now() - 10 * day), registrationCloses: new Date(Date.now() - 5 * day), addDropOpens: new Date(Date.now() - 5 * day), addDropCloses: new Date(Date.now() - 1 * day) });
  const closed = await reg(ctx.stuToks[1], ctx.offAdv);
  assert.equal(closed.status, 422);
  assert.equal(closed.body.error.details[0].code, 'REGISTRATION_CLOSED');
  await Semester.updateOne({ _id: ctx.sem._id }, { $unset: { registrationOpens: 1, registrationCloses: 1, addDropOpens: 1, addDropCloses: 1 } });
  assert.equal((await reg(ctx.stuToks[1], ctx.offAdv)).body.error.details[0].code, 'REGISTRATION_WINDOW_NOT_CONFIGURED'); // never guesses dates
});

test('assigned scope: a lecturer only reaches students registered in offerings they teach', async () => {
  // Student 1 is registered (approved) in offAdv which A is not assigned to; offDB registrations were dropped.
  const none = await call('GET', '/api/v1/students', ctx.lecA.token);
  assert.equal(none.meta.total, 0);
  const regs = await call('GET', '/api/v1/registrations', ctx.lecA.token);
  assert.ok(regs.data.every((r) => r.status === 'dropped')); // history of the dropped seat is visible, nothing live
  // assign A to the offering the student is registered in -> visible
  await call('POST', `/api/v1/offerings/${ctx.offAdv._id}/assignments`, facAdmin.token, { componentType: 'theory', staff: ctx.staffA._id, role: 'lecturer' });
  const seen = await call('GET', '/api/v1/students', ctx.lecA.token);
  assert.equal(seen.meta.total, 1);
  assert.equal((await call('GET', `/api/v1/students/${ctx.more[1].student._id}`, ctx.lecA.token)).status, 404);
  assert.equal((await call('GET', '/api/v1/offerings', ctx.lecA.token)).meta.total, 2); // offDB + offAdv
  // ending the assignment immediately removes access
  const active = (await call('GET', `/api/v1/offerings/${ctx.offAdv._id}/assignments`, facAdmin.token)).data[0];
  await call('POST', `/api/v1/offerings/${ctx.offAdv._id}/assignments/${active._id}/end`, facAdmin.token, { reason: 'test' });
  assert.equal((await call('GET', '/api/v1/students', ctx.lecA.token)).meta.total, 0);
});

test('progression moves batches forward, never backwards, and graduates', async () => {
  const up = await call('POST', '/api/v1/students/progression', facAdmin.token, { batch: ctx.batchICT._id, toYear: 2, toSemester: 1 });
  assert.equal(up.status, 200);
  assert.ok(up.data.studentsMoved >= 4);
  const s = await call('GET', `/api/v1/students/${ctx.s1.student._id}`, facAdmin.token);
  assert.equal(s.data.currentYear, 2);
  const back = await call('POST', '/api/v1/students/progression', facAdmin.token, { batch: ctx.batchICT._id, toYear: 1, toSemester: 2 });
  assert.equal(back.code, 'PROGRESSION_BACKWARDS');
  assert.equal((await call('POST', '/api/v1/students/progression', ctx.hod.token, { batch: ctx.batchICT._id, toYear: 3, toSemester: 1 })).status, 403); // faculty-level operation
  assert.equal((await call('POST', '/api/v1/students/progression', facAdmin.token, { batch: ctx.batchICT._id, toYear: 9, toSemester: 1 })).status, 422);
  const hist = await call('GET', `/api/v1/students/${ctx.s1.student._id}/history`, facAdmin.token);
  assert.equal(hist.data.progressionHistory.length, 1);
});

test('database constraints hold even when the API is bypassed', async () => {
  const { SubjectRegistration } = require('../modules/registration/model');
  const reg = await SubjectRegistration.findOne({ status: 'approved' });
  await assert.rejects(() => SubjectRegistration.create({ student: reg.student, offering: reg.offering, course: reg.course, semester: reg.semester, credits: 3, status: 'pending' }), /E11000/);
  const { Course } = require('../modules/courses/model');
  await assert.rejects(() => Course.create({ code: 'ICT21013', title: 'dup', credits: 1, type: 'A', department: dict._id, programme: ctx.bict._id, defaultYear: 1, defaultSemester: 1 }), /E11000/);
  await assert.rejects(() => Course.create({ code: 'bad', title: 'x', credits: 1, type: 'A', department: dict._id, programme: ctx.bict._id, defaultYear: 1, defaultSemester: 1 }), /validation/i);
  assert.ok(mongoose.connection.readyState === 1);
});
