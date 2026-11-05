// Load the module first so its permission grants are in the catalogue before bootstrap syncs the roles.
require('../modules/allocation');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { start, stop, call, makeUser } = require('./helpers');

const ctx = {};
const day = 86400000;

const makeStudent = async (n, { dept, programme, batch, year = 3, status = 'Active' } = {}) => {
  const Student = require('../models/Student');
  const u = await makeUser({ role: 'student', name: `Alloc Student ${n}`, departmentRef: (dept || ctx.dict)._id });
  const s = await Student.create({
    user: u.user._id, studentId: `ALLOC/${n}/${Date.now()}`, indexNo: `ALLOC${n}${Date.now()}`, fullName: `Alloc Student ${n}`, email: u.email,
    departmentRef: (dept || ctx.dict)._id, programmeRef: (programme || ctx.bict)._id, batchRef: (batch || ctx.batch)._id, currentYear: year, currentSemesterNumber: 1, status,
  });
  return { ...u, student: s };
};

before(async () => {
  await start();
  const { Department, DegreeProgramme, Specialization, AcademicBatch } = require('../modules/organization/model');
  ctx.dict = await Department.findOne({ code: 'DICT' });
  ctx.dbst = await Department.findOne({ code: 'DBST' });
  ctx.bict = await DegreeProgramme.findOne({ code: 'BICT' });
  ctx.swt = await Specialization.findOne({ programme: ctx.bict._id, code: 'SWT' });
  ctx.nst = await Specialization.findOne({ programme: ctx.bict._id, code: 'NST' });
  ctx.batch = await AcademicBatch.create({ programme: ctx.bict._id, intakeYear: 2022 });
  ctx.fac = await makeUser({ role: 'faculty_admin', name: 'Faculty Admin' });
  ctx.hod = await makeUser({ role: 'hod', name: 'HOD ICT', departmentRef: ctx.dict._id });
  ctx.hodBio = await makeUser({ role: 'hod', name: 'HOD BST', departmentRef: ctx.dbst._id });
  ctx.stu = [];
  for (let i = 1; i <= 4; i += 1) ctx.stu.push(await makeStudent(i));
});
after(stop);

test('permissions: only faculty officers manage rounds and capacities; students cannot see runs', async () => {
  const body = { programme: String(ctx.bict._id), batch: String(ctx.batch._id) };
  assert.equal((await call('POST', '/api/v1/allocations/rounds', ctx.stu[0].token, body)).status, 403);
  assert.equal((await call('POST', '/api/v1/allocations/rounds', ctx.hod.token, body)).status, 403); // department scope is not enough
  assert.equal((await call('PUT', '/api/v1/allocations/capacities', ctx.stu[0].token, { specialization: String(ctx.swt._id), batch: String(ctx.batch._id), seats: 5 })).status, 403);
  assert.equal((await call('GET', '/api/v1/allocations/runs', ctx.stu[0].token)).status, 403);
  assert.equal((await call('GET', '/api/v1/allocations/runs')).status, 401);

  const round = await call('POST', '/api/v1/allocations/rounds', ctx.fac.token, { ...body, opensAt: new Date(Date.now() - day).toISOString(), closesAt: new Date(Date.now() + 5 * day).toISOString() });
  assert.equal(round.status, 201);
  assert.equal(round.data.kind, 'specialization'); // derived from the programme's tracks, not hard-coded
  assert.deepEqual(round.data.startsAt, { year: 3, semester: 1 });
  ctx.round = round.data;
  assert.equal((await call('POST', '/api/v1/allocations/rounds', ctx.fac.token, body)).code, 'ROUND_EXISTS');
});

test('applications: round must be open; only eligible active students apply; preferences are validated; one per round', async () => {
  const apply = (s, prefs) => call('POST', '/api/v1/allocations/applications', s.token, { round: ctx.round._id, preferences: prefs });
  const both = [String(ctx.swt._id), String(ctx.nst._id)];
  assert.equal((await apply(ctx.stu[0], both)).code, 'ROUND_NOT_OPEN'); // still draft
  assert.equal((await call('POST', `/api/v1/allocations/rounds/${ctx.round._id}/transition`, ctx.fac.token, { to: 'open' })).status, 200);

  // students must not self-report GPA
  const selfReport = await call('POST', '/api/v1/allocations/applications', ctx.stu[0].token, { round: ctx.round._id, preferences: both, metrics: { cumulativeGpa: 4 } });
  assert.equal(selfReport.code, 'METRICS_NOT_ALLOWED');
  // staff cannot apply as students
  assert.equal((await call('POST', '/api/v1/allocations/applications', ctx.hod.token, { round: ctx.round._id, preferences: both })).status, 403);

  const early = await makeStudent(90, { year: 2 });
  assert.equal((await apply(early, both)).code, 'NOT_ELIGIBLE_YET');
  const suspended = await makeStudent(91, { status: 'Suspended' });
  assert.ok([403, 401].includes((await apply(suspended, both)).status)); // suspended accounts are signed out or rejected
  const { AcademicBatch } = require('../modules/organization/model');
  const otherBatch = await AcademicBatch.create({ programme: ctx.bict._id, intakeYear: 2021 });
  const wrongBatch = await makeStudent(92, { batch: otherBatch });
  assert.equal((await apply(wrongBatch, both)).code, 'NOT_ELIGIBLE');

  assert.equal((await apply(ctx.stu[0], [both[0], both[0]])).code, 'DUPLICATE_PREFERENCE');
  assert.equal((await apply(ctx.stu[0], ['507f1f77bcf86cd799439011'])).code, 'PREFERENCE_INVALID');

  // S1..S3 prefer SWT then NST; S4 lists SWT only
  for (const s of ctx.stu.slice(0, 3)) assert.equal((await apply(s, both)).status, 201);
  assert.equal((await apply(ctx.stu[3], [both[0]])).status, 201);

  // re-submitting amends the same application (unique per student+round) and keeps the earlier choice list
  const again = await apply(ctx.stu[0], [both[1], both[0]]);
  assert.equal(again.status, 201);
  assert.equal(again.data.history.length, 1);
  assert.equal((await apply(ctx.stu[0], both)).data.history.length, 2);
  const { SpecializationApplication } = require('../modules/allocation/model');
  assert.equal(await SpecializationApplication.countDocuments({ round: ctx.round._id }), 4);
  await assert.rejects(() => SpecializationApplication.create({ student: ctx.stu[0].student._id, round: ctx.round._id, programme: ctx.bict._id, batch: ctx.batch._id, kind: 'specialization', preferences: [{ rank: 1, specialization: ctx.swt._id }] }), /E11000/);

  // scope: students read only their own application; HOD sees their department; other department sees none
  const mine = await call('GET', '/api/v1/allocations/applications', ctx.stu[1].token);
  assert.equal(mine.meta.total, 1);
  assert.equal(mine.data[0].student.studentId, ctx.stu[1].student.studentId);
  assert.equal((await call('GET', '/api/v1/allocations/applications', ctx.hod.token)).meta.total, 4);
  assert.equal((await call('GET', '/api/v1/allocations/applications', ctx.hodBio.token)).meta.total, 0);
  const others = await call('GET', '/api/v1/allocations/applications', ctx.fac.token);
  assert.equal(others.meta.total, 4);
  ctx.apps = others.data;
  assert.equal((await call('GET', `/api/v1/allocations/applications/${others.data.find((a) => a.student.studentId !== ctx.stu[1].student.studentId)._id}`, ctx.stu[1].token)).status, 404);
});

test('runs: missing capacity / policy / metrics are refused; dry-run writes nothing', async () => {
  const { AllocationRun, SpecializationAllocation } = require('../modules/allocation/model');
  const AcademicPolicy = require('../modules/policy/model');
  const swt = String(ctx.swt._id);
  const nst = String(ctx.nst._id);
  const batch = String(ctx.batch._id);
  const roundId = ctx.round._id;

  // a real run needs the application window to be closed first
  assert.equal((await call('POST', '/api/v1/allocations/runs', ctx.fac.token, { round: roundId })).code, 'ROUND_NOT_CLOSED');
  assert.equal((await call('POST', `/api/v1/allocations/rounds/${roundId}/transition`, ctx.fac.token, { to: 'closed' })).status, 200);
  assert.equal((await call('POST', '/api/v1/allocations/applications', ctx.stu[2].token, { round: roundId, preferences: [swt] })).code, 'ROUND_NOT_OPEN');

  // 1. no seat capacity yet -> refuse (never guess seats)
  assert.equal((await call('POST', '/api/v1/allocations/runs/dry-run', ctx.fac.token, { round: roundId })).code, 'CAPACITY_NOT_CONFIGURED');
  assert.equal((await call('PUT', '/api/v1/allocations/capacities', ctx.fac.token, { specialization: swt, batch, seats: 2 })).status, 200);
  assert.equal((await call('PUT', '/api/v1/allocations/capacities', ctx.fac.token, { specialization: nst, batch, seats: 1 })).status, 200);
  assert.equal((await call('GET', `/api/v1/allocations/capacities?batch=${batch}`, ctx.hod.token)).meta.total, 2);

  // 2. no approved selection policy -> POLICY_NOT_CONFIGURED
  assert.equal((await call('POST', '/api/v1/allocations/runs/dry-run', ctx.fac.token, { round: roundId })).code, 'POLICY_NOT_CONFIGURED');
  // an unconfirmed (pending) policy is not good enough either
  const pending = await AcademicPolicy.create({ key: 'allocation.criteria', value: { criteria: [{ key: 'cumulativeGpa', weight: 1, direction: 'desc' }] }, scope: { programme: ctx.bict._id }, status: 'pending_confirmation' });
  assert.equal((await call('POST', '/api/v1/allocations/runs/dry-run', ctx.fac.token, { round: roundId })).code, 'POLICY_NOT_CONFIGURED');
  const approved = await call('POST', `/api/v1/policies/${pending._id}/approve`, ctx.fac.token, {});
  assert.equal(approved.status, 200);

  // 3. nobody has recorded GPA yet -> every applicant is ineligible (missing metric), nothing is invented
  const noMetrics = await call('POST', '/api/v1/allocations/runs/dry-run', ctx.fac.token, { round: roundId });
  assert.equal(noMetrics.status, 200);
  assert.equal(noMetrics.data.result.allocations.length, 0);
  assert.ok(noMetrics.data.result.ineligible.every((i) => i.reason === 'MISSING_METRIC:cumulativeGpa'));

  // officers record the academic performance (stored as "supplied", with who and why)
  const gpas = [4.0, 3.9, 3.8, 3.7];
  for (let i = 0; i < 4; i += 1) {
    const app = ctx.apps.find((a) => a.student.studentId === ctx.stu[i].student.studentId);
    assert.equal((await call('PUT', `/api/v1/allocations/applications/${app._id}/metrics`, ctx.stu[i].token, { metrics: { cumulativeGpa: gpas[i] }, note: 'self' })).status, 403);
    assert.equal((await call('PUT', `/api/v1/allocations/applications/${app._id}/metrics`, ctx.fac.token, { metrics: { cumulativeGpa: gpas[i] }, note: 'Registrar records' })).status, 200);
  }

  // 4. dry-run: full result, zero writes
  const beforeRuns = await AllocationRun.countDocuments({});
  const beforeAllocs = await SpecializationAllocation.countDocuments({});
  const dry = await call('POST', '/api/v1/allocations/runs/dry-run', ctx.fac.token, { round: roundId });
  assert.equal(dry.status, 200);
  assert.equal(dry.data.dryRun, true);
  assert.equal(dry.data.result.stats.allocated, 3);
  assert.equal(dry.data.policySnapshot.criteria.criteria[0].key, 'cumulativeGpa');
  assert.equal(await AllocationRun.countDocuments({}), beforeRuns);
  assert.equal(await SpecializationAllocation.countDocuments({}), beforeAllocs);
  const code = (id) => dry.data.specializations[id];
  const by = Object.fromEntries(dry.data.result.allocations.map((a) => [a.student, code(a.specialization)]));
  assert.equal(by[String(ctx.stu[0].student._id)], 'SWT');
  assert.equal(by[String(ctx.stu[1].student._id)], 'SWT');
  assert.equal(by[String(ctx.stu[2].student._id)], 'NST'); // SWT full, NST was a listed second preference with a free seat
  // S4 listed SWT only: left for manual review, NOT pushed into NST
  assert.deepEqual(dry.data.result.unallocated.map((u) => u.student), [String(ctx.stu[3].student._id)]);
  assert.equal(dry.data.result.unallocated[0].manualReview, true);
});

test('run (transaction) is provisional, re-runnable and bound by the one-live-allocation constraint; students see nothing until publish', async () => {
  const { AllocationRun, SpecializationAllocation } = require('../modules/allocation/model');
  const roundId = ctx.round._id;
  const run1 = await call('POST', '/api/v1/allocations/runs', ctx.fac.token, { round: roundId });
  assert.equal(run1.status, 201);
  assert.equal(run1.data.status, 'provisional');
  assert.equal(await SpecializationAllocation.countDocuments({ run: run1.data._id, status: 'provisional' }), 3);

  // running again replaces the provisional result; history is kept (superseded), live rows stay one per student
  const run2 = await call('POST', '/api/v1/allocations/runs', ctx.fac.token, { round: roundId });
  assert.equal(run2.status, 201);
  assert.equal((await AllocationRun.findById(run1.data._id)).status, 'discarded');
  assert.equal(await SpecializationAllocation.countDocuments({ run: run1.data._id, status: 'superseded' }), 3);
  assert.equal(await SpecializationAllocation.countDocuments({ status: { $in: ['provisional', 'published'] } }), 3);
  ctx.run = run2.data;

  // the database itself refuses a second live allocation for the same student
  const one = await SpecializationAllocation.findOne({ run: run2.data._id });
  await assert.rejects(() => SpecializationAllocation.create({ student: one.student, specialization: ctx.nst._id, programme: ctx.bict._id, batch: ctx.batch._id, status: 'provisional' }), /E11000/);

  // visibility: students see no result yet; the HOD sees only their department; students cannot open runs
  assert.equal((await call('GET', '/api/v1/allocations/me', ctx.stu[0].token)).data.length, 0);
  assert.equal((await call('GET', '/api/v1/allocations', ctx.stu[0].token)).meta.total, 0);
  assert.equal((await call('GET', `/api/v1/allocations/runs/${ctx.run._id}`, ctx.stu[0].token)).status, 403);
  assert.equal((await call('GET', `/api/v1/allocations/runs/${ctx.run._id}`, ctx.hod.token)).data.result.allocations.length, 3);
  assert.equal((await call('GET', `/api/v1/allocations/runs/${ctx.run._id}`, ctx.hodBio.token)).data.result.allocations.length, 0);
  assert.equal((await call('POST', `/api/v1/allocations/runs/${ctx.run._id}/publish`, ctx.hod.token)).status, 403);
});

test('publish is transactional, updates the student record, notifies everyone and is final', async () => {
  const Student = require('../models/Student');
  const Notification = require('../models/Notification');
  const pub = await call('POST', `/api/v1/allocations/runs/${ctx.run._id}/publish`, ctx.fac.token);
  assert.equal(pub.status, 200);
  assert.equal(pub.data.status, 'published');
  assert.equal((await call('POST', `/api/v1/allocations/runs/${ctx.run._id}/publish`, ctx.fac.token)).code, 'INVALID_STATE');
  assert.equal((await call('POST', '/api/v1/allocations/runs', ctx.fac.token, { round: ctx.round._id })).code, 'ROUND_PUBLISHED');

  const mine = await call('GET', '/api/v1/allocations/me', ctx.stu[0].token);
  assert.equal(mine.data.length, 1);
  assert.equal(mine.data[0].specialization.code, 'SWT');
  assert.equal(String((await Student.findById(ctx.stu[0].student._id)).specializationRef), String(ctx.swt._id));
  assert.equal((await call('GET', '/api/v1/allocations/me', ctx.stu[3].token)).data.length, 0); // unallocated student

  // notifications: allocated students and the one sent for manual review
  const ids = ctx.stu.map((s) => s.user._id);
  const got = await Notification.find({ recipientUser: { $in: ids } });
  assert.equal(got.filter((n) => n.eventType === 'allocation.published').length, 3);
  assert.equal(got.filter((n) => n.eventType === 'allocation.review').length, 1);
  assert.ok((await call('GET', '/api/v1/notifications', ctx.stu[0].token)).data.some((n) => n.title === 'Allocation result published'));

  // audit trail
  const AuditLog = require('../modules/audit/model');
  for (const action of ['allocation.round_create', 'allocation.capacity_set', 'allocation.run', 'allocation.publish', 'allocation.application_submit']) {
    assert.ok(await AuditLog.exists({ action }), `audit row for ${action}`);
  }
});

test('manual change: request, capacity re-check, authorised decision, history never overwritten', async () => {
  const { SpecializationAllocation, AllocationChange, AllocationChangeRequest } = require('../modules/allocation/model');
  const AuditLog = require('../modules/audit/model');
  const Student = require('../models/Student');
  const nst = String(ctx.nst._id);
  const swt = String(ctx.swt._id);
  const batch = String(ctx.batch._id);
  const s2 = ctx.stu[1];

  const request = await call('POST', '/api/v1/allocations/changes', s2.token, { to: nst, requestReason: 'Stronger interest in networking', attachments: ['att-001'] });
  assert.equal(request.status, 201);
  assert.equal(request.data.status, 'pending');
  assert.equal(String(request.data.from), String(ctx.swt._id)); // the current allocation is captured
  // one pending request per student (also a unique index)
  assert.equal((await call('POST', '/api/v1/allocations/changes', s2.token, { to: nst, requestReason: 'Again please' })).code, 'REQUEST_PENDING');
  assert.equal((await call('POST', '/api/v1/allocations/changes', s2.token, { student: String(ctx.stu[0].student._id), to: nst, requestReason: 'For someone else' })).status, 403);
  assert.equal((await call('POST', '/api/v1/allocations/changes', s2.token, { to: swt, requestReason: 'Same track as now' })).code, 'NO_CHANGE');

  // who may decide: not students, not another department's HOD, and a reason is mandatory
  const id = request.data._id;
  assert.equal((await call('POST', `/api/v1/allocations/changes/${id}/decision`, s2.token, { decision: 'approve', decisionReason: 'self approve' })).status, 403);
  assert.equal((await call('POST', `/api/v1/allocations/changes/${id}/decision`, ctx.hodBio.token, { decision: 'approve', decisionReason: 'wrong department' })).code, 'OUT_OF_SCOPE');
  assert.equal((await call('POST', `/api/v1/allocations/changes/${id}/decision`, ctx.hod.token, { decision: 'approve', decisionReason: '' })).status, 422);
  // capacity is re-checked at decision time: NST (1 seat) is full
  const full = await call('POST', `/api/v1/allocations/changes/${id}/decision`, ctx.hod.token, { decision: 'approve', decisionReason: 'Approved by HOD' });
  assert.equal(full.code, 'CAPACITY_FULL');
  assert.equal((await AllocationChangeRequest.findById(id)).status, 'pending'); // rolled back completely
  assert.equal(await AllocationChange.countDocuments({ student: s2.student._id }), 0);

  // seats raised -> approval succeeds
  assert.equal((await call('PUT', '/api/v1/allocations/capacities', ctx.fac.token, { specialization: nst, batch, seats: 3 })).status, 200);
  const done = await call('POST', `/api/v1/allocations/changes/${id}/decision`, ctx.hod.token, { decision: 'approve', decisionReason: 'Capacity available and reason accepted' });
  assert.equal(done.status, 200);
  assert.equal(done.data.status, 'approved');

  // the original allocation is superseded, not overwritten; both rows remain
  // (the discarded provisional run left an unpublished superseded row as history; published rows are the ones that counted)
  assert.equal(await SpecializationAllocation.countDocuments({ student: s2.student._id, status: 'superseded', publishedAt: null }), 1);
  const rows = await SpecializationAllocation.find({ student: s2.student._id, publishedAt: { $ne: null } }).sort({ createdAt: 1 });
  assert.equal(rows.length, 2);
  assert.equal(rows[0].status, 'superseded');
  assert.equal(String(rows[0].specialization), swt);
  assert.equal(rows[0].source, 'run');
  assert.equal(rows[1].status, 'published');
  assert.equal(rows[1].source, 'manual_change');
  assert.equal(String((await Student.findById(s2.student._id)).specializationRef), nst);

  const change = await AllocationChange.findOne({ student: s2.student._id });
  assert.equal(String(change.previous), swt);
  assert.equal(String(change.new), nst);
  assert.equal(change.requestReason, 'Stronger interest in networking');
  assert.equal(change.decisionReason, 'Capacity available and reason accepted');
  assert.equal(change.authorisedBy.role, 'hod');
  assert.deepEqual([...change.attachments], ['att-001']);
  assert.ok(change.approvedAt);
  assert.ok(await AuditLog.exists({ action: 'allocation.change', entityId: String(rows[1]._id) }));

  // the change history is append-only
  await assert.rejects(() => AllocationChange.updateOne({ _id: change._id }, { decisionReason: 'tamper' }), /append-only/);
  await assert.rejects(() => AllocationChange.deleteMany({}), /append-only/);
  change.decisionReason = 'tamper';
  await assert.rejects(() => change.save(), /append-only/);

  // history: the student sees their own published trail, nobody else's
  const mine = await call('GET', `/api/v1/allocations/history/${s2.student._id}`, s2.token);
  assert.equal(mine.status, 200);
  assert.equal(mine.data.allocations.length, 2);
  assert.equal(mine.data.changes.length, 1);
  assert.equal((await call('GET', `/api/v1/allocations/history/${s2.student._id}`, ctx.stu[0].token)).status, 404);
  assert.equal((await call('GET', `/api/v1/allocations/history/${s2.student._id}`, ctx.hodBio.token)).status, 404);
  assert.equal((await call('GET', `/api/v1/allocations/history/${s2.student._id}`, ctx.hod.token)).data.changes.length, 1);
});

test('manual change: officers place unallocated students, rejections change nothing, faculty admin may decide', async () => {
  const { SpecializationAllocation } = require('../modules/allocation/model');
  const s4 = ctx.stu[3];
  const s1 = ctx.stu[0];
  const swt = String(ctx.swt._id);
  const nst = String(ctx.nst._id);

  // student 4 was left for manual review; the HOD files the placement on their behalf (SWT now has a free seat)
  const place = await call('POST', '/api/v1/allocations/changes', ctx.hod.token, { student: String(s4.student._id), to: swt, requestReason: 'Manual review outcome after the run' });
  assert.equal(place.status, 201);
  assert.equal(place.data.from, null);
  assert.equal((await call('POST', '/api/v1/allocations/changes', ctx.hodBio.token, { student: String(s4.student._id), to: swt, requestReason: 'Other department' })).code, 'OUT_OF_SCOPE');
  const placed = await call('POST', `/api/v1/allocations/changes/${place.data._id}/decision`, ctx.fac.token, { decision: 'approve', decisionReason: 'Placed after manual review' });
  assert.equal(placed.status, 200);
  const live = await SpecializationAllocation.findOne({ student: s4.student._id, status: 'published' });
  assert.equal(String(live.specialization), swt);
  assert.equal(live.source, 'manual_change');
  assert.equal((await call('GET', '/api/v1/allocations/me', s4.token)).data[0].specialization.code, 'SWT');

  // a rejected request leaves the allocation untouched and keeps the reason
  const ask = await call('POST', '/api/v1/allocations/changes', s1.token, { to: nst, requestReason: 'Would prefer NST this term' });
  const reject = await call('POST', `/api/v1/allocations/changes/${ask.data._id}/decision`, ctx.hod.token, { decision: 'reject', decisionReason: 'Not justified' });
  assert.equal(reject.data.status, 'rejected');
  assert.equal((await SpecializationAllocation.findOne({ student: s1.student._id, status: 'published' })).specialization.toString(), swt);
  assert.equal((await call('POST', `/api/v1/allocations/changes/${ask.data._id}/decision`, ctx.hod.token, { decision: 'approve', decisionReason: 'too late' })).code, 'ALREADY_DECIDED');
  // students only list their own requests
  assert.equal((await call('GET', '/api/v1/allocations/changes', s1.token)).meta.total, 1);
  assert.equal((await call('GET', '/api/v1/allocations/changes', ctx.hod.token)).meta.total, 3); // s2 (approved), s4 (approved), s1 (rejected)
});

test("generic request engine hook 'specialization_change' applies the same change logic", async () => {
  const hooks = require('../core/hooks');
  const { withTransaction } = require('../core/transaction');
  const { SpecializationAllocation, AllocationChange } = require('../modules/allocation/model');
  const handler = hooks.getRequestHandler('specialization_change');
  assert.ok(handler);
  const s1 = ctx.stu[0];

  await assert.rejects(() => handler.validate({ payload: { requestReason: 'no target' }, requester: s1.user._id }), (e) => e.code === 'TARGET_REQUIRED');
  const payload = await handler.validate({ payload: { to: String(ctx.nst._id), requestReason: 'Via the generic request form' }, requester: s1.user._id });
  assert.equal(payload.student, String(s1.student._id));

  const actor = { user: { id: String(ctx.hod.user._id), name: 'HOD ICT', email: ctx.hod.email, role: 'hod' } };
  await withTransaction((session) => handler.onApproved({ request: { _id: 'REQ-1', payload, requester: s1.user._id, decisionRemarks: 'Approved at final step' }, req: actor, session }));
  const live = await SpecializationAllocation.find({ student: s1.student._id, status: 'published' });
  assert.equal(live.length, 1);
  assert.equal(String(live[0].specialization), String(ctx.nst._id));
  const change = await AllocationChange.findOne({ student: s1.student._id });
  assert.equal(change.via, 'generic_request');
  assert.equal(change.decisionReason, 'Approved at final step');
  assert.equal(await SpecializationAllocation.countDocuments({ student: s1.student._id, status: 'superseded', publishedAt: { $ne: null } }), 1);
});
