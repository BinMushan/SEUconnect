/**
 * Phase 5 integration tests: attendance, CA assessments, ESA, results / GPA.
 * Runs the real API against a THROW-AWAY database (see tests/helpers.js).
 * NOTE: the server module is required BEFORE start() so that every module's extendCatalog() grants are in the
 * catalogue when the harness synchronises the roles into the database.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('./helpers');
require('../server');
const { start, stop, makeUser, login } = helpers;
// P5_TRACE=1 prints every request with its status and duration (useful against a slow remote database)
const call = async (method, path, token, body) => {
  const t = Date.now();
  const r = await helpers.call(method, path, token, body);
  if (process.env.P5_TRACE) console.error(`TRACE ${method} ${path.slice(0, 70)} -> ${r.status} ${r.code || ''} ${Date.now() - t}ms`);
  return r;
};

const ctx = {};
const day = 86400000;
const iso = (d) => new Date(Date.now() + d * day).toISOString();
const hours = (h) => new Date(Date.now() + h * 3600000).toISOString();
const ok = (res, status = 200) => assert.equal(res.status, status, JSON.stringify(res.body));

let dict;
let dbst;
let admin;
let facAdmin;
let facAdmin2;
let dean;
let hod;
let hodBst;

before(async () => {
  await start();
  const { Department } = require('../modules/organization/model');
  dict = await Department.findOne({ code: 'DICT' });
  dbst = await Department.findOne({ code: 'DBST' });
  admin = await makeUser({ role: 'admin', name: 'Root Admin' });
  facAdmin = await makeUser({ role: 'faculty_admin', name: 'Faculty Admin One' });
  facAdmin2 = await makeUser({ role: 'faculty_admin', name: 'Faculty Admin Two' });
  dean = await makeUser({ role: 'dean', name: 'The Dean' });
  hod = await makeUser({ role: 'hod', name: 'HOD ICT', departmentRef: dict._id });
  hodBst = await makeUser({ role: 'hod', name: 'HOD BST', departmentRef: dbst._id });
});
after(stop);

const mkStaff = async (staffId, name, role) => {
  const c = await call('POST', '/api/v1/staff', facAdmin.token, { staffId, fullName: name, email: `${staffId.toLowerCase()}@test.seu`, department: dict._id, role });
  ok(c, 201);
  ok(await call('POST', `/api/v1/staff/${c.data.staff._id}/responsibilities`, facAdmin.token, { type: role }), 201);
  const reset = await call('POST', `/api/v1/users/${c.data.staff.user}/reset-password`, admin.token);
  const s = await login(`${staffId.toLowerCase()}@test.seu`, reset.data.temporaryPassword);
  ok(s);
  return { staff: c.data.staff, token: s.data.accessToken };
};

const mkStudent = async (n) => {
  const r = await call('POST', '/api/v1/students', facAdmin.token, { studentId: `2023/ICT/P5${n}`, fullName: `P5 Student ${n}`, email: `p5s${n}@test.seu`, departmentRef: dict._id, programmeRef: ctx.bict._id, batchRef: ctx.batch._id });
  ok(r, 201);
  const l = await login(r.data.student.email, r.data.temporaryPassword);
  return { id: r.data.student._id, token: l.data.accessToken };
};

// NOTE: the /policies API currently rejects keys with capital letters (attendance.minPercent), so approved policies are
// inserted through the model here. The business code reads them through core/policy exactly as in production.
const approvePolicy = async (key, value) => {
  const AcademicPolicy = require('../modules/policy/model');
  await AcademicPolicy.create({ key, value, description: 'test', status: 'active', source: 'test' });
  require('../core/policy').clearPolicyCache();
};

test('setup: structure, staff, assignments, students, approved registrations', async () => {
  const progs = await call('GET', '/api/v1/programmes', admin.token);
  ctx.bict = progs.data.find((p) => p.code === 'BICT');
  const year = await call('POST', '/api/v1/academic-years', facAdmin.token, { label: '2025/2026', startDate: iso(-60), endDate: iso(300) });
  ok(year, 201);
  const sem = await call('POST', '/api/v1/semesters', facAdmin.token, { academicYear: year.data._id, number: 1, startDate: iso(-30), endDate: iso(100), registrationOpens: iso(-5), registrationCloses: iso(9), addDropOpens: iso(9), addDropCloses: iso(23) });
  ok(sem, 201);
  ctx.sem = sem.data;
  const batch = await call('POST', '/api/v1/batches', facAdmin.token, { programme: ctx.bict._id, intakeYear: 2023 });
  ok(batch, 201);
  ctx.batch = batch.data;

  const body = (over) => ({ code: 'ICT31013', title: 'Software Engineering', credits: 3, type: 'B', department: dict._id, programme: ctx.bict._id, defaultYear: 3, defaultSemester: 1, ...over });
  const cb = await call('POST', '/api/v1/courses', facAdmin.token, body({}));
  ok(cb, 201);
  ctx.courseB = cb.data;
  const ca = await call('POST', '/api/v1/courses', facAdmin.token, body({ code: 'ICT31033', title: 'Advanced SE', type: 'A' }));
  ok(ca, 201);
  ctx.courseNext = ca.data;
  const cfgT = await call('POST', '/api/v1/assessment-configurations', facAdmin.token, { name: 'Theory 40/60', caWeight: 40, esaWeight: 60, minCaPercent: 40, minEsaPercent: 35 });
  const cfgP = await call('POST', '/api/v1/assessment-configurations', facAdmin.token, { name: 'Practical 50/50', caWeight: 50, esaWeight: 50 });
  ok(cfgT, 201);
  const off = await call('POST', '/api/v1/offerings', facAdmin.token, { course: ctx.courseB._id, semester: ctx.sem._id, batch: ctx.batch._id, status: 'open', components: [{ type: 'theory', assessmentConfiguration: cfgT.data._id, weightInCourse: 70 }, { type: 'practical', assessmentConfiguration: cfgP.data._id, weightInCourse: 30 }] });
  ok(off, 201);
  ctx.off = off.data._id;
  ctx.cfgT = cfgT.data;

  ctx.lec = await mkStaff('P5-LEC-1', 'Lecturer One', 'lecturer');
  ctx.lec2 = await mkStaff('P5-LEC-2', 'Lecturer Unassigned', 'lecturer');
  ctx.demo = await mkStaff('P5-DEM-1', 'Demonstrator One', 'demonstrator');
  ok(await call('POST', `/api/v1/offerings/${ctx.off}/assignments`, facAdmin.token, { componentType: 'theory', staff: ctx.lec.staff._id, role: 'lecturer' }), 201);
  ok(await call('POST', `/api/v1/offerings/${ctx.off}/assignments`, facAdmin.token, { componentType: 'practical', staff: ctx.demo.staff._id, role: 'demonstrator' }), 201);

  ctx.s = [];
  for (let i = 1; i <= 4; i += 1) ctx.s.push(await mkStudent(i)); // s[3] never registers
  const regIds = [];
  for (const st of ctx.s.slice(0, 3)) {
    const r = await call('POST', '/api/v1/registrations', st.token, { offering: ctx.off });
    ok(r, 201);
    regIds.push(r.data._id);
  }
  const dec = await call('POST', '/api/v1/registrations/decisions', hod.token, { ids: regIds, decision: 'approve', remarks: 'ok' });
  ok(dec);
  assert.ok(dec.data.every((d) => d.ok), JSON.stringify(dec.data));
});

/* ------------------------------------------------------------- attendance */
test('attendance: assignment-based access, marking rules, history, summaries driven by policy', async () => {
  const mk = (token, componentType, startH = -3) => call('POST', '/api/v1/attendance/sessions', token, { offering: ctx.off, componentType, startsAt: hours(startH), endsAt: hours(startH + 1) });
  assert.equal((await mk(ctx.lec2.token, 'theory')).code, 'NOT_ASSIGNED'); // unassigned lecturer
  assert.equal((await mk(ctx.demo.token, 'theory')).code, 'NOT_ASSIGNED'); // demonstrator is assigned to the practical component only
  assert.equal((await mk(ctx.s[0].token, 'theory')).code, 'PERMISSION_DENIED'); // students cannot create sessions
  const t1 = await mk(ctx.lec.token, 'theory', -6);
  const t2 = await mk(ctx.lec.token, 'theory', -3);
  const p1 = await mk(ctx.demo.token, 'practical', -3);
  [t1, t2, p1].forEach((r) => ok(r, 201));
  ctx.t1 = t1.data._id;
  ctx.t2 = t2.data._id;
  ctx.p1 = p1.data._id;

  const future = await mk(ctx.lec.token, 'theory', 48);
  ok(future, 201);
  const early = await call('PUT', `/api/v1/attendance/sessions/${future.data._id}/records`, ctx.lec.token, { records: [{ student: ctx.s[0].id, status: 'present' }] });
  assert.equal(early.code, 'SESSION_NOT_STARTED');

  const [s1, s2, s3, s4] = ctx.s;
  const mark = (sid, token, recs) => call('PUT', `/api/v1/attendance/sessions/${sid}/records`, token, { records: recs });
  ok(await mark(ctx.t1, ctx.lec.token, [{ student: s1.id, status: 'present' }, { student: s2.id, status: 'absent' }, { student: s3.id, status: 'excused' }]));
  ok(await mark(ctx.t2, ctx.lec.token, [{ student: s1.id, status: 'present' }, { student: s2.id, status: 'absent' }, { student: s3.id, status: 'present' }]));
  ok(await mark(ctx.p1, ctx.demo.token, [{ student: s1.id, status: 'present' }, { student: s2.id, status: 'absent' }, { student: s3.id, status: 'present' }]));
  assert.equal((await mark(ctx.t1, ctx.lec.token, [{ student: s4.id, status: 'present' }])).code, 'STUDENT_NOT_REGISTERED');
  assert.equal((await mark(ctx.t1, ctx.lec2.token, [{ student: s1.id, status: 'present' }])).code, 'NOT_ASSIGNED');
  assert.equal((await mark(ctx.p1, ctx.lec.token, [{ student: s1.id, status: 'absent' }])).code, 'NOT_ASSIGNED'); // lecturer cannot mark practical

  // changing a recorded status needs a reason and keeps history
  assert.equal((await mark(ctx.t1, ctx.lec.token, [{ student: s2.id, status: 'present' }])).code, 'REASON_REQUIRED');
  ok(await mark(ctx.t1, ctx.lec.token, [{ student: s2.id, status: 'present', reason: 'Signed the register late' }]));
  const recs = await call('GET', `/api/v1/attendance/sessions/${ctx.t1}/records`, ctx.lec.token);
  const rec2 = recs.data.find((r) => r.student._id === s2.id);
  assert.equal(rec2.status, 'present');
  assert.equal(rec2.history.length, 2);
  assert.equal((await call('POST', `/api/v1/attendance/sessions/${ctx.t1}/cancel`, ctx.lec.token, { reason: 'Mistake' })).code, 'HAS_RECORDS');

  // students see only their own rows
  const own = await call('GET', `/api/v1/attendance/sessions/${ctx.t1}/records`, s1.token);
  assert.equal(own.data.length, 1);
  assert.equal(own.data[0].student._id, s1.id);
  assert.equal((await call('GET', `/api/v1/attendance/sessions/${ctx.t1}`, ctx.lec2.token)).status, 404);

  // no policy: nothing is assumed
  const before = await call('GET', `/api/v1/attendance/summary?offering=${ctx.off}`, ctx.lec.token);
  ok(before);
  const row = (res, id) => res.data.find((r) => r.student.id === id).offerings[0].summary;
  assert.equal(row(before, s1.id).eligibility, 'policy_not_configured');
  assert.equal(row(before, s3.id).percentage, null); // an excused session with no excused-policy hides the percentage
  assert.equal(row(before, s1.id).total, 2); // the lecturer only sees the theory component

  await approvePolicy('attendance.minPercent', 80);
  await approvePolicy('attendance.excusedCountsAsPresent', true);
  const after = await call('GET', `/api/v1/attendance/summary?offering=${ctx.off}`, ctx.lec.token);
  assert.equal(row(after, s1.id).eligibility, 'eligible');
  assert.equal(row(after, s2.id).percentage, 50); // theory: present, absent
  assert.equal(row(after, s2.id).eligibility, 'ineligible');
  assert.equal(row(after, s3.id).eligibility, 'eligible'); // excused counted as present by policy
  const demoView = await call('GET', `/api/v1/attendance/summary?student=${s2.id}`, ctx.demo.token);
  assert.equal(demoView.data.offerings[0].summary.practical.total, 1);
  assert.equal(demoView.data.offerings[0].summary.theory.total, 0); // demonstrator sees practical only
  // a student's summary is always their own, whatever they ask for
  const mine = await call('GET', `/api/v1/attendance/summary?student=${s2.id}`, s1.token);
  assert.equal(mine.data.student.id, s1.id);
  assert.equal((await call('GET', `/api/v1/attendance/summary?student=${s1.id}`, ctx.lec2.token)).status, 404);
});

test('attendance corrections: request, authority, decision and history', async () => {
  const [s1, s2] = ctx.s;
  const recs = await call('GET', `/api/v1/attendance/sessions/${ctx.t2}/records`, ctx.lec.token);
  const rec2 = recs.data.find((r) => r.student._id === s2.id);
  const rec1 = recs.data.find((r) => r.student._id === s1.id);
  assert.equal((await call('POST', '/api/v1/attendance/corrections', s1.token, { record: rec2._id, requestedStatus: 'present', reason: 'not mine to ask' })).code, 'OUT_OF_SCOPE');
  assert.equal((await call('POST', '/api/v1/attendance/corrections', s2.token, { record: rec2._id, requestedStatus: 'absent', reason: 'same as current status' })).code, 'NO_CHANGE');
  const c = await call('POST', '/api/v1/attendance/corrections', s2.token, { record: rec2._id, requestedStatus: 'present', reason: 'I was present, signed late' });
  ok(c, 201);
  assert.equal((await call('POST', '/api/v1/attendance/corrections', s2.token, { record: rec2._id, requestedStatus: 'excused', reason: 'second open request' })).status, 409);
  assert.equal((await call('POST', `/api/v1/attendance/corrections/${c.data._id}/decision`, ctx.lec2.token, { decision: 'approve' })).code, 'NOT_FOUND'); // hidden from an unassigned lecturer
  assert.equal((await call('POST', `/api/v1/attendance/corrections/${c.data._id}/decision`, s2.token, { decision: 'approve' })).code, 'PERMISSION_DENIED');
  assert.equal((await call('POST', `/api/v1/attendance/corrections/${c.data._id}/decision`, ctx.lec.token, { decision: 'reject' })).code, 'REMARKS_REQUIRED');
  ok(await call('POST', `/api/v1/attendance/corrections/${c.data._id}/decision`, ctx.lec.token, { decision: 'approve', remarks: 'Verified with the register' }));
  const after = await call('GET', `/api/v1/attendance/sessions/${ctx.t2}/records`, ctx.lec.token);
  const updated = after.data.find((r) => r.student._id === s2.id);
  assert.equal(updated.status, 'present');
  assert.equal(updated.history.length, 2);
  assert.equal((await call('POST', `/api/v1/attendance/corrections/${c.data._id}/decision`, ctx.lec.token, { decision: 'approve' })).code, 'ALREADY_DECIDED');
  assert.ok(rec1);
  // student can list own corrections only
  const list = await call('GET', '/api/v1/attendance/corrections', s1.token);
  assert.equal(list.meta.total, 0);
  assert.equal((await call('GET', '/api/v1/attendance/corrections', s2.token)).meta.total, 1);
});

/* ------------------------------------------------------------- CA marks */
const caCreate = (token, body) => call('POST', '/api/v1/assessments', token, { offering: ctx.off, ...body });
const putMarks = (id, token, marks) => call('PUT', `/api/v1/assessments/${id}/marks`, token, { marks });

test('CA assessments: authority, validation, history, workflow gates, locking, corrections', async () => {
  const [s1, s2, s3, s4] = ctx.s;
  assert.equal((await caCreate(ctx.demo.token, { componentType: 'theory', name: 'XX', maxMarks: 10, weight: 10 })).code, 'NOT_ASSIGNED');
  assert.equal((await caCreate(ctx.lec2.token, { componentType: 'theory', name: 'XX', maxMarks: 10, weight: 10 })).code, 'NOT_ASSIGNED');
  assert.equal((await caCreate(s1.token, { componentType: 'theory', name: 'XX', maxMarks: 10, weight: 10 })).code, 'PERMISSION_DENIED');
  const quiz = await caCreate(ctx.lec.token, { componentType: 'theory', name: 'Quiz', type: 'quiz', maxMarks: 10, weight: 20 });
  const mid = await caCreate(ctx.lec.token, { componentType: 'theory', name: 'Midterm', type: 'midterm', maxMarks: 50, weight: 30 });
  const proj = await caCreate(ctx.lec.token, { componentType: 'theory', name: 'Project', type: 'project', maxMarks: 100, weight: 50 });
  const lab = await caCreate(ctx.demo.token, { componentType: 'practical', name: 'Lab 1', type: 'lab_report', maxMarks: 100, weight: 100 });
  [quiz, mid, proj, lab].forEach((r) => ok(r, 201));
  assert.equal((await caCreate(ctx.lec.token, { componentType: 'theory', name: 'Quiz', maxMarks: 10, weight: 5 })).status, 409); // unique name per component
  ctx.quiz = quiz.data._id;
  ctx.mid = mid.data._id;
  ctx.proj = proj.data._id;
  ctx.lab = lab.data._id;

  // marks only while open
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 8 }])).code, 'ASSESSMENT_NOT_OPEN');
  for (const id of [ctx.quiz, ctx.mid, ctx.proj]) ok(await call('POST', `/api/v1/assessments/${id}/open`, ctx.lec.token, {}));
  ok(await call('POST', `/api/v1/assessments/${ctx.lab}/open`, ctx.demo.token, {}));

  // validation
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 11 }])).code, 'MARK_OUT_OF_RANGE');
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: -1 }])).code, 'MARK_OUT_OF_RANGE');
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s4.id, marks: 5 }])).code, 'STUDENT_NOT_REGISTERED');
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 5, absent: true }])).code, 'ABSENT_WITH_MARK');
  assert.equal((await putMarks(ctx.quiz, ctx.lec2.token, [{ student: s1.id, marks: 5 }])).code, 'NOT_FOUND');
  assert.equal((await putMarks(ctx.quiz, ctx.demo.token, [{ student: s1.id, marks: 5 }])).code, 'NOT_FOUND');

  // incomplete marks cannot be submitted
  ok(await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 8 }]));
  const incomplete = await call('POST', `/api/v1/assessments/${ctx.quiz}/submit`, ctx.lec.token, {});
  assert.equal(incomplete.code, 'MARKS_INCOMPLETE');
  assert.equal(incomplete.body.error.details.missing.length, 2);

  // a failing bulk entry is rolled back as a whole (transaction): s1 changes with a reason, s2 changes without one
  ok(await putMarks(ctx.quiz, ctx.lec.token, [{ student: s2.id, marks: 10 }]));
  const bad = await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 9, reason: 'recheck' }, { student: s2.id, marks: 9 }]);
  assert.equal(bad.code, 'REASON_REQUIRED');
  const afterBad = await call('GET', `/api/v1/assessments/${ctx.quiz}/marks`, ctx.lec.token);
  assert.equal(afterBad.data.find((m) => m.student._id === s1.id).marks, 8); // untouched: nothing was half-saved
  // s3 absent is explicit (counts as zero), never inferred
  ok(await putMarks(ctx.quiz, ctx.lec.token, [{ student: s3.id, absent: true }]));
  ok(await putMarks(ctx.mid, ctx.lec.token, [{ student: s1.id, marks: 30 }, { student: s2.id, marks: 50 }, { student: s3.id, marks: 25 }]));
  ok(await putMarks(ctx.proj, ctx.lec.token, [{ student: s1.id, marks: 90 }, { student: s2.id, marks: 100 }, { student: s3.id, marks: 40 }]));
  ok(await putMarks(ctx.lab, ctx.demo.token, [{ student: s1.id, marks: 90 }, { student: s2.id, marks: 100 }, { student: s3.id, marks: 60 }]));
  const hist = await call('GET', `/api/v1/assessments/${ctx.quiz}/marks`, ctx.lec.token);
  assert.equal(hist.data.length, 3);

  // students see nothing until the marks are approved
  assert.equal((await call('GET', '/api/v1/assessments', s1.token)).meta.total, 0);

  // workflow gates
  for (const id of [ctx.quiz, ctx.mid, ctx.proj]) ok(await call('POST', `/api/v1/assessments/${id}/submit`, ctx.lec.token, {}));
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/submit`, ctx.lec.token, {})).code, 'INVALID_TRANSITION');
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 9, reason: 'late' }])).code, 'ASSESSMENT_NOT_OPEN'); // frozen once submitted
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/verify`, ctx.lec.token, {})).code, 'PERMISSION_DENIED'); // lecturers cannot verify
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/verify`, hodBst.token, {})).code, 'NOT_FOUND'); // other department's HOD cannot even see it
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/approve`, hod.token, {})).code, 'INVALID_TRANSITION'); // cannot skip verification
  for (const id of [ctx.quiz, ctx.mid, ctx.proj]) ok(await call('POST', `/api/v1/assessments/${id}/verify`, hod.token, {}));
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/return`, hod.token, {})).status, 422); // reason is mandatory
  for (const id of [ctx.quiz, ctx.mid, ctx.proj]) ok(await call('POST', `/api/v1/assessments/${id}/approve`, hod.token, {}));
  assert.equal((await call('GET', '/api/v1/assessments', s1.token)).meta.total, 3); // now visible
  const ownMarks = await call('GET', `/api/v1/assessments/${ctx.quiz}/marks`, s1.token);
  assert.equal(ownMarks.data.length, 1);
  assert.equal(ownMarks.data[0].marks, 8);

  // approved/locked marks cannot be edited directly
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 9, reason: 'late' }])).code, 'MARKS_LOCKED');
  ok(await call('POST', `/api/v1/assessments/${ctx.quiz}/lock`, hod.token, {}));
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/return`, hod.token, { reason: 'try' })).code, 'INVALID_TRANSITION'); // locked is final
  assert.equal((await putMarks(ctx.quiz, ctx.lec.token, [{ student: s1.id, marks: 9, reason: 'late' }])).code, 'MARKS_LOCKED');

  // correction after lock: request -> a different person decides -> history kept
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/corrections`, ctx.lec.token, { student: s1.id, marks: 11, reason: 'Marking slip' })).code, 'MARK_OUT_OF_RANGE');
  const corr = await call('POST', `/api/v1/assessments/${ctx.quiz}/corrections`, ctx.lec.token, { student: s1.id, marks: 9, reason: 'Marking slip found on re-check' });
  ok(corr, 201);
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/corrections/${corr.data._id}/decision`, ctx.lec.token, { decision: 'approve' })).code, 'PERMISSION_DENIED');
  assert.equal((await call('POST', `/api/v1/assessments/${ctx.quiz}/corrections/${corr.data._id}/decision`, dean.token, { decision: 'reject' })).code, 'REMARKS_REQUIRED');
  ok(await call('POST', `/api/v1/assessments/${ctx.quiz}/corrections/${corr.data._id}/decision`, dean.token, { decision: 'approve', remarks: 'Checked against the script' }));
  const { StudentAssessmentMark } = require('../modules/assessments/model');
  const m = await StudentAssessmentMark.findOne({ assessment: ctx.quiz, student: s1.id });
  assert.equal(m.marks, 9);
  assert.ok(m.history.length >= 2);
  assert.equal(m.history[m.history.length - 1].reason.startsWith('Approved correction'), true);

  // weighted CA: s1 = (9/10*20 + 30/50*30 + 90/100*50)/100 = 81 ; s3 = (0 + 15 + 20) = 35
  const ca = await call('GET', `/api/v1/assessments/ca-summary?offering=${ctx.off}&componentType=theory`, ctx.lec.token);
  ok(ca);
  const caOf = (id) => ca.data.students.find((x) => x.student === id).caPercent;
  assert.equal(caOf(s1.id), 81);
  assert.equal(caOf(s2.id), 100);
  assert.equal(caOf(s3.id), 35);
  ctx.quizCorrectionDone = true;
});

/* ------------------------------------------------------------------- ESA */
const esaFlow = async (id, submitter, verifier, approver) => {
  ok(await call('POST', `/api/v1/esa/schedules/${id}/submit`, submitter.token, {}));
  ok(await call('POST', `/api/v1/esa/schedules/${id}/verify`, verifier.token, {}));
  ok(await call('POST', `/api/v1/esa/schedules/${id}/approve`, approver.token, {}));
};

test('ESA: clashes, eligibility from attendance policy, override rules, marks workflow, student visibility', async () => {
  const [s1, s2, s3] = ctx.s;
  const sched = (token, over) => call('POST', '/api/v1/esa/schedules', token, { offering: ctx.off, componentType: 'theory', format: 'written', title: 'Theory paper', date: iso(5), startTime: '09:00', endTime: '12:00', venue: 'Hall A', invigilators: [ctx.lec.staff._id], ...over });
  assert.equal((await sched(ctx.lec2.token, {})).code, 'NOT_ASSIGNED');
  assert.equal((await sched(s1.token, {})).code, 'PERMISSION_DENIED');
  assert.equal((await sched(ctx.demo.token, {})).code, 'NOT_ASSIGNED'); // theory belongs to the lecturer
  assert.equal((await sched(ctx.lec.token, { startTime: '12:00', endTime: '09:00' })).code, 'TIME_RANGE_INVALID');
  const th = await sched(ctx.lec.token, {});
  ok(th, 201);
  ctx.esaT = th.data._id;
  assert.equal((await sched(ctx.lec.token, { startTime: '11:00', endTime: '13:00', invigilators: [] })).code, 'VENUE_CLASH');
  assert.equal((await sched(ctx.lec.token, { venue: 'Hall B', startTime: '10:00', endTime: '11:00' })).code, 'INVIGILATOR_CLASH');
  const pr = await sched(ctx.demo.token, { componentType: 'practical', format: 'practical', title: 'Practical exam', venue: 'Lab 1', startTime: '09:00', endTime: '11:00', invigilators: [ctx.demo.staff._id] });
  ok(pr, 201);
  ctx.esaP = pr.data._id;

  assert.equal((await call('PUT', `/api/v1/esa/schedules/${ctx.esaT}/marks`, ctx.lec.token, { marks: [{ student: s1.id, marks: 70 }] })).code, 'ESA_NOT_OPEN');
  ok(await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/open`, ctx.lec.token, {}));
  ok(await call('POST', `/api/v1/esa/schedules/${ctx.esaP}/open`, ctx.demo.token, {}));

  // eligibility comes from attendance + the approved policy (66.7% overall for s2 < 80)
  const el = await call('GET', `/api/v1/esa/schedules/${ctx.esaT}/eligibility`, ctx.lec.token);
  ok(el);
  const elOf = (id) => el.data.students.find((x) => x.student === id).eligibility;
  assert.equal(elOf(s1.id), 'eligible');
  assert.equal(elOf(s2.id), 'ineligible');
  assert.equal(elOf(s3.id), 'eligible');

  const put = (id, token, marks) => call('PUT', `/api/v1/esa/schedules/${id}/marks`, token, { marks });
  assert.equal((await put(ctx.esaT, ctx.lec.token, [{ student: s2.id, marks: 90 }])).code, 'ESA_NOT_ELIGIBLE');
  assert.equal((await put(ctx.esaT, ctx.lec.token, [{ student: s2.id, marks: 90, eligibilityOverride: { reason: 'Medical grounds approved' } }])).code, 'OVERRIDE_NOT_ALLOWED');
  assert.equal((await put(ctx.esaT, ctx.lec.token, [{ student: s1.id, marks: 101 }])).code, 'MARK_OUT_OF_RANGE');
  ok(await put(ctx.esaT, ctx.lec.token, [{ student: s1.id, marks: 70 }, { student: s3.id, marks: 100 }]));
  ok(await put(ctx.esaT, facAdmin.token, [{ student: s2.id, marks: 90, eligibilityOverride: { reason: 'Medical grounds approved' } }]));
  assert.equal((await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/cancel`, ctx.lec.token, { reason: 'oops' })).code, 'HAS_MARKS');

  // students cannot see ESA marks before approval
  assert.equal((await call('GET', `/api/v1/esa/schedules/${ctx.esaT}/marks`, s1.token)).data.length, 0);
  ok(await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/submit`, ctx.lec.token, {}));
  assert.equal((await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/approve`, hod.token, {})).code, 'INVALID_TRANSITION');
  assert.equal((await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/verify`, hodBst.token, {})).code, 'NOT_FOUND');
  ok(await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/verify`, hod.token, {}));
  ok(await call('POST', `/api/v1/esa/schedules/${ctx.esaT}/approve`, dean.token, {}));
  const visible = await call('GET', `/api/v1/esa/schedules/${ctx.esaT}/marks`, s1.token);
  assert.equal(visible.data.length, 1);
  assert.equal(visible.data[0].marks, 70);
  assert.equal(visible.data[0].history, undefined);
  // the other student's mark never leaks
  assert.ok(visible.data.every((m) => String(m.student) === s1.id));
});

/* --------------------------------------------------------------- results */
const toState = (path, token, ids, remarks) => call('POST', `/api/v1/results/${path}`, token, { ids, remarks });
const bands = [
  { min: 0, max: 39.99, grade: 'F', gradePoint: 0, fail: true },
  { min: 40, max: 69.99, grade: 'B', gradePoint: 3 },
  { min: 70, max: 100, grade: 'A', gradePoint: 4 },
];

test('results: grade policy is mandatory, input approval is enforced, exact calculation', async () => {
  const [s1, s2, s3] = ctx.s;
  const calc = (token) => call('POST', '/api/v1/results/calculate', token, { offering: ctx.off });
  assert.equal((await calc(ctx.lec.token)).code, 'GRADE_POLICY_NOT_CONFIGURED'); // never guessed

  // policy authoring rules
  const policyBody = { name: 'Faculty grading 2025', bands, gpaRules: { repeatHandling: 'best' } };
  assert.equal((await call('POST', '/api/v1/grade-policies', ctx.lec.token, policyBody)).code, 'PERMISSION_DENIED');
  assert.equal((await call('POST', '/api/v1/grade-policies', facAdmin.token, { ...policyBody, bands: [{ min: 0, max: 50, grade: 'F', gradePoint: 0 }, { min: 50, max: 100, grade: 'P', gradePoint: 2 }] })).code, 'BANDS_INVALID');
  assert.equal((await call('POST', '/api/v1/grade-policies', facAdmin.token, { ...policyBody, rounding: { decimals: 2 } })).code, 'ROUNDING_NOT_CONFIGURED');
  const pol = await call('POST', '/api/v1/grade-policies', facAdmin.token, policyBody);
  ok(pol, 201);
  assert.equal(pol.data.status, 'draft');
  assert.equal((await calc(ctx.lec.token)).code, 'GRADE_POLICY_NOT_CONFIGURED'); // a draft policy is not an approved one
  assert.equal((await call('POST', `/api/v1/grade-policies/${pol.data._id}/approve`, facAdmin.token, {})).code, 'SEGREGATION_OF_DUTIES');
  ok(await call('POST', `/api/v1/grade-policies/${pol.data._id}/approve`, facAdmin2.token, {}));
  assert.equal((await call('GET', '/api/v1/grade-policies?status=active', admin.token)).data.length, 1);

  // who may calculate
  assert.equal((await calc(ctx.lec2.token)).code, 'NOT_ASSIGNED');
  assert.equal((await calc(s1.token)).code, 'PERMISSION_DENIED');
  // practical marks are not approved yet -> refused, with the names of what is missing
  const early = await calc(ctx.lec.token);
  assert.equal(early.code, 'RESULT_INPUTS_NOT_APPROVED');
  assert.ok(early.body.error.details.assessments.includes('Lab 1'));

  // finish the practical component
  const lab = ctx.lab;
  ok(await call('POST', `/api/v1/assessments/${lab}/submit`, ctx.demo.token, {}));
  ok(await call('POST', `/api/v1/assessments/${lab}/verify`, hod.token, {}));
  ok(await call('POST', `/api/v1/assessments/${lab}/approve`, hod.token, {}));
  const put = (token, marks) => call('PUT', `/api/v1/esa/schedules/${ctx.esaP}/marks`, token, { marks });
  ok(await put(ctx.demo.token, [{ student: s1.id, marks: 80 }, { student: s3.id, marks: 60 }]));
  ok(await put(facAdmin.token, [{ student: s2.id, marks: 100, eligibilityOverride: { reason: 'Medical grounds approved' } }]));
  await esaFlow(ctx.esaP, ctx.demo, hod, dean);

  const done = await calc(ctx.lec.token);
  ok(done);
  assert.equal(done.data.calculated, 3);
  const recs = await call('GET', `/api/v1/results?offering=${ctx.off}`, ctx.lec.token);
  const rec = (sid) => recs.data.find((r) => r.student._id === sid);
  // s1: theory 81*0.4+70*0.6 = 74.4 ; practical 90*0.5+80*0.5 = 85 ; course 74.4*0.7+85*0.3 = 77.58
  assert.equal(rec(s1.id).finalMark, 77.58);
  assert.equal(rec(s1.id).grade, 'A');
  assert.equal(rec(s1.id).passed, true);
  assert.deepEqual(rec(s1.id).componentMarks.map((c) => c.mark), [74.4, 85]);
  // s2: theory 94, practical 100 -> 95.8
  assert.equal(rec(s2.id).finalMark, 95.8);
  // s3: theory CA 35 is below the configured minimum (40): component fails although the course mark (69.8) is a B
  assert.equal(rec(s3.id).finalMark, 69.8);
  assert.equal(rec(s3.id).grade, 'B');
  assert.equal(rec(s3.id).componentMarks[0].caPassed, false);
  assert.equal(rec(s3.id).passed, false);
  assert.equal(rec(s1.id).state, 'draft');
  // recalculating a draft is fine and idempotent
  assert.equal((await calc(ctx.lec.token)).data.calculated, 3);
  assert.equal((await call('GET', '/api/v1/results/me', s1.token)).meta.total, 0); // drafts are invisible to students
  ctx.recIds = [s1, s2, s3].map((s) => rec(s.id)._id);
});

test('results: stale marks block submission; corrections of approved marks flag the result', async () => {
  const [, s2] = ctx.s;
  const corr = await call('POST', `/api/v1/assessments/${ctx.mid}/corrections`, ctx.lec.token, { student: s2.id, marks: 45, reason: 'Re-marking reduced the score' });
  ok(corr, 201);
  ok(await call('POST', `/api/v1/assessments/${ctx.mid}/corrections/${corr.data._id}/decision`, dean.token, { decision: 'approve', remarks: 'ok' }));
  const stale = await toState('submit', ctx.lec.token, ctx.recIds);
  assert.equal(stale.code, 'TRANSITION_REJECTED');
  assert.deepEqual(stale.body.error.details.map((d) => d.code), ['RECALCULATION_REQUIRED']);
  const { GradeRecord } = require('../modules/results/model');
  assert.equal((await GradeRecord.countDocuments({ state: 'submitted' })), 0); // all-or-nothing
  const re = await call('POST', '/api/v1/results/calculate', ctx.lec.token, { offering: ctx.off });
  assert.equal(re.data.calculated, 3);
  assert.equal((await GradeRecord.countDocuments({ needsRecalculation: true })), 0);
  // s2 theory: CA (20 + 27 + 50)=97 -> 97*0.4+90*0.6 = 92.8 ; course 92.8*0.7+30 = 94.96
  const r2 = await GradeRecord.findOne({ student: s2.id });
  assert.equal(r2.finalMark, 94.96);
});

test('results: state gates, segregation of duties, all-or-nothing publication, GPA and student visibility', async () => {
  const [s1, s2, s3] = ctx.s;
  const ids = ctx.recIds;
  const { GradeRecord, GPARecord } = require('../modules/results/model');
  assert.equal((await toState('publish', facAdmin.token, ids)).code, 'TRANSITION_REJECTED'); // drafts cannot be published
  assert.equal((await toState('submit', ctx.lec2.token, ids)).code, 'TRANSITION_REJECTED'); // not their offering -> not found
  assert.equal((await toState('submit', s1.token, ids)).code, 'PERMISSION_DENIED');
  ok(await toState('submit', ctx.lec.token, ids));
  assert.equal((await toState('verify', ctx.lec.token, ids)).code, 'PERMISSION_DENIED');
  assert.equal((await toState('verify', hodBst.token, ids)).code, 'TRANSITION_REJECTED'); // other department cannot even see them
  ok(await toState('verify', hod.token, ids));
  const early = await toState('publish', facAdmin.token, ids);
  assert.equal(early.code, 'TRANSITION_REJECTED');
  assert.ok(early.body.error.details.every((d) => d.code === 'NOT_APPROVED'));
  assert.equal((await toState('publish', hod.token, ids)).code, 'PERMISSION_DENIED');
  assert.equal((await toState('approve', ctx.lec.token, ids)).code, 'PERMISSION_DENIED');
  ok(await toState('approve', dean.token, ids));

  // all-or-nothing: one record sent back means a mixed batch cannot be published
  ok(await toState('return', hod.token, [ids[2]], 'Please re-check the practical ESA'));
  const mixed = await toState('publish', facAdmin.token, ids);
  assert.equal(mixed.code, 'TRANSITION_REJECTED');
  assert.equal(await GradeRecord.countDocuments({ state: 'approved' }), 2); // nothing was published
  assert.equal((await toState('return', hod.token, [ids[1]], '')).status, 422);
  ok(await toState('submit', ctx.lec.token, [ids[2]]));
  ok(await toState('verify', hod.token, [ids[2]]));
  ok(await toState('approve', dean.token, [ids[2]]));

  // students see nothing until publication
  assert.equal((await call('GET', '/api/v1/results/me', s1.token)).meta.total, 0);
  const pub = await toState('publish', facAdmin.token, ids);
  ok(pub);
  assert.equal(pub.data.moved, 3);

  // visibility: own, published, trimmed
  const mine = await call('GET', '/api/v1/results/me', s1.token);
  assert.equal(mine.meta.total, 1);
  assert.equal(mine.data[0].finalMark, 77.58);
  const detail = await call('GET', `/api/v1/results/${mine.data[0]._id}`, s1.token);
  ok(detail);
  assert.equal(detail.data.stateHistory, undefined);
  const others = await GradeRecord.findOne({ student: s2.id });
  assert.equal((await call('GET', `/api/v1/results/${others._id}`, s1.token)).status, 404);
  assert.equal((await call('GET', `/api/v1/results?student=${s2.id}`, s1.token)).meta.total, 0); // a filter cannot widen the scope

  // GPA: SGPA + CGPA built only from published results, exact decimals
  const g = await call('GET', '/api/v1/gpa/me', s1.token);
  assert.equal(g.data.length, 2);
  assert.equal(g.data.find((x) => x.scope === 'cumulative').gpa, 4);
  assert.equal(g.data.find((x) => x.scope === 'cumulative').credits, 3);
  assert.equal((await call('GET', `/api/v1/gpa/${s2.id}`, s1.token)).code, 'OUT_OF_SCOPE');
  const g3 = await GPARecord.findOne({ student: s3.id, scope: 'cumulative' });
  assert.equal(g3.gpa, 3); // a failed component still carries its grade point under the default (policy) rule
  // transcript
  const tr = await call('GET', '/api/v1/transcripts/me', s1.token);
  ok(tr);
  assert.equal(tr.data.semesters[0].courses[0].code, 'ICT31013');
  assert.equal(tr.data.cumulative.gpa, 4);
  assert.equal((await call('GET', `/api/v1/transcripts/${s1.id}`, ctx.lec.token)).status, 200); // assigned lecturer
  assert.equal((await call('GET', `/api/v1/transcripts/${s1.id}`, ctx.lec2.token)).status, 404);
  assert.equal((await call('GET', `/api/v1/transcripts/${s2.id}`, s1.token)).code, 'OUT_OF_SCOPE');
  // published results are locked
  assert.equal((await call('POST', '/api/v1/results/calculate', ctx.lec.token, { offering: ctx.off })).data.calculated, 0);
});

test('results feed prerequisites: a published pass satisfies the registration rule', async () => {
  const [s1, s2, s3] = ctx.s;
  ok(await call('PUT', `/api/v1/courses/${ctx.courseNext._id}/prerequisites`, facAdmin.token, { prerequisites: [ctx.courseB._id] }));
  const off = await call('POST', '/api/v1/offerings', facAdmin.token, { course: ctx.courseNext._id, semester: ctx.sem._id, batch: ctx.batch._id, status: 'open', components: [{ type: 'theory', assessmentConfiguration: ctx.cfgT._id, weightInCourse: 100 }] });
  ok(off, 201);
  const reg = (s) => call('POST', '/api/v1/registrations', s.token, { offering: off.data._id });
  ok(await reg(s1), 201);
  ok(await reg(s2), 201);
  const denied = await reg(s3); // failed the prerequisite (component rule)
  assert.equal(denied.status, 422);
  assert.ok(denied.body.error.details.some((d) => d.code === 'PREREQUISITES_NOT_MET'));
});

test('result corrections: request, authority, history kept, GPA outdated until republished', async () => {
  const [s1] = ctx.s;
  const { GradeRecord, GPARecord } = require('../modules/results/model');
  const rec = await GradeRecord.findOne({ student: s1.id, offering: ctx.off });
  assert.equal(rec.state, 'published');
  assert.equal((await call('POST', `/api/v1/results/${rec._id}/corrections`, ctx.lec2.token, { reason: 'not my course at all' })).status, 404);
  const c = await call('POST', `/api/v1/results/${rec._id}/corrections`, ctx.lec.token, { reason: 'Transcription error in the practical ESA' });
  ok(c, 201);
  assert.equal((await call('POST', `/api/v1/results/${rec._id}/corrections`, ctx.lec.token, { reason: 'second request while one is open' })).code, 'ALREADY_PENDING');
  assert.equal((await call('POST', `/api/v1/results/${rec._id}/corrections/${c.data._id}/decision`, ctx.lec.token, { decision: 'approve' })).code, 'PERMISSION_DENIED');
  assert.equal((await call('POST', `/api/v1/results/${rec._id}/corrections/${c.data._id}/decision`, dean.token, { decision: 'reject' })).code, 'REMARKS_REQUIRED');
  ok(await call('POST', `/api/v1/results/${rec._id}/corrections/${c.data._id}/decision`, dean.token, { decision: 'approve', remarks: 'Confirmed' }));

  const reopened = await GradeRecord.findById(rec._id);
  assert.equal(reopened.state, 'draft');
  assert.equal(reopened.revisions.length, 1);
  assert.equal(reopened.revisions[0].finalMark, 77.58); // the published value is preserved
  assert.equal((await call('GET', '/api/v1/results/me', s1.token)).meta.total, 0); // hidden while being corrected
  assert.equal((await call('GET', '/api/v1/gpa/me', s1.token)).data.length, 0); // outdated GPA is not shown to the student
  assert.equal((await GPARecord.findOne({ student: s1.id, scope: 'cumulative' })).state, 'outdated');

  // republish through the full chain
  const ids = [String(rec._id)];
  ok(await call('POST', '/api/v1/results/calculate', ctx.lec.token, { offering: ctx.off, students: [s1.id] }));
  ok(await toState('submit', ctx.lec.token, ids));
  ok(await toState('verify', hod.token, ids));
  ok(await toState('approve', dean.token, ids));
  ok(await toState('publish', facAdmin.token, ids));
  assert.equal((await GPARecord.findOne({ student: s1.id, scope: 'cumulative' })).state, 'published');
  assert.equal((await call('GET', '/api/v1/results/me', s1.token)).meta.total, 1);
});

test('audit trail covers marks, workflow transitions, calculation and publication', async () => {
  const has = async (action) => (await call('GET', `/api/v1/audit?action=${encodeURIComponent(action)}`, admin.token)).data.length > 0;
  for (const action of ['attendance.session_create', 'attendance.mark', 'attendance.record_change', 'assessment.marks_entered', 'assessment.approved', 'assessment.mark_corrected', 'esa.marks_entered', 'esa.approved', 'gradepolicy.approve', 'result.calculate', 'result.published', 'result.correction_approved']) {
    assert.equal(await has(action), true, `missing audit action ${action}`);
  }
  const published = (await call('GET', '/api/v1/audit?action=result.published', admin.token)).data[0];
  assert.ok(published.actor.email && published.at && published.entityId);
  assert.equal(published.after.state, 'published');
});
