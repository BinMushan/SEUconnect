const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

process.env.ATTACHMENT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'seu-att-'));
const { start, stop, call, makeUser } = require('./helpers');

let base;
let dict;
let dbst;
let fac;
let student;
let lec;
let lecBst;
let hod;
let hodBst;
const approved = [];
const ctx = {};

const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF');
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from('fake-png-body')]);

const upload = async (token, { name = 'doc.pdf', type = 'application/pdf', content = PDF, entityType, entityId } = {}) => {
  const fd = new FormData();
  if (entityType) fd.append('entityType', entityType);
  if (entityId) fd.append('entityId', entityId);
  fd.append('file', new Blob([content], { type }), name);
  const res = await fetch(`${base}/api/v1/attachments`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, data: body.data, code: body.error && body.error.code };
};
const download = (token, id) => fetch(`${base}/api/v1/attachments/${id}/download`, { headers: { Authorization: `Bearer ${token}` } });

const workflow = (token, requestType, steps, extra = {}) => call('POST', '/api/v1/approval-workflows', token, { requestType, steps, ...extra });
const twoStep = [
  { order: 1, label: 'Lecturer review', role: 'lecturer', scope: 'department' },
  { order: 2, label: 'HOD approval', role: 'hod', scope: 'department' },
];
const notifs = async (token, qs = '') => (await call('GET', `/api/v1/notifications${qs}`, token)).data || [];

before(async () => {
  ({ base } = await start());
  const rbac = require('../core/rbac');
  await rbac.syncCatalog(); // pick up grants that modules added with extendCatalog after bootstrap
  rbac.invalidateAccess();
  const { Department } = require('../modules/organization/model');
  dict = await Department.findOne({ code: 'DICT' });
  dbst = await Department.findOne({ code: 'DBST' });
  fac = await makeUser({ role: 'faculty_admin', name: 'Faculty Admin' });
  student = await makeUser({ role: 'student', name: 'Req Student', departmentRef: dict._id, department: dict.name });
  lec = await makeUser({ role: 'lecturer', name: 'Dict Lecturer', departmentRef: dict._id, department: dict.name });
  lecBst = await makeUser({ role: 'lecturer', name: 'Dbst Lecturer', departmentRef: dbst._id, department: dbst.name });
  hod = await makeUser({ role: 'hod', name: 'Dict HOD', departmentRef: dict._id, department: dict.name });
  hodBst = await makeUser({ role: 'hod', name: 'Dbst HOD', departmentRef: dbst._id, department: dbst.name });

  const hooks = require('../core/hooks');
  hooks.registerRequestHandler('academic_letter', { onApproved: async ({ request }) => approved.push(String(request._id)) });
  hooks.registerRequestHandler('result_correction', {
    onApproved: async () => {
      const { ApiError } = require('../core/http');
      throw new ApiError(422, 'HANDLER_FAILED', 'The side effect failed.');
    },
  });
});
after(async () => {
  await stop();
  fs.rmSync(process.env.ATTACHMENT_DIR, { recursive: true, force: true });
});

/* ================================ requests ================================ */
test('request types are seeded as data with no hard-coded approval chain', async () => {
  const types = await call('GET', '/api/v1/request-types', student.token);
  assert.equal(types.status, 200);
  const keys = types.data.map((t) => t.key);
  for (const k of ['subject_add_drop', 'subject_registration_exception', 'specialization_change', 'majoring_appeal', 'attendance_correction', 'result_correction', 'academic_letter']) assert.ok(keys.includes(k), k);
  assert.ok(types.data.every((t) => t.pendingConfirmation));
  assert.equal((await call('GET', '/api/v1/approval-workflows', fac.token)).data.length, 0);
});

test('workflow configuration: only authorised officers, roles must exist', async () => {
  assert.equal((await workflow(student.token, 'academic_letter', twoStep)).status, 403);
  assert.equal((await workflow(lec.token, 'academic_letter', twoStep)).status, 403);
  const unknown = await workflow(fac.token, 'academic_letter', [{ order: 1, label: 'Ghost', role: 'ghost_officer', scope: 'faculty' }]);
  assert.equal(unknown.status, 422);
  assert.equal(unknown.code, 'WORKFLOW_ROLE_UNKNOWN');
  assert.equal((await workflow(fac.token, 'academic_letter', [{ order: 1, label: 'Step A', role: 'lecturer' }, { order: 1, label: 'Step B', role: 'hod' }])).code, 'STEP_ORDER_DUPLICATE');
  assert.equal((await workflow(fac.token, 'academic_letter', [{ order: 1, label: 'Student step', role: 'student' }])).code, 'WORKFLOW_ROLE_INVALID');
  assert.equal((await workflow(fac.token, 'no_such_type', twoStep)).status, 404);
  const ok = await workflow(fac.token, 'academic_letter', twoStep);
  assert.equal(ok.status, 201);
  assert.equal(ok.data.version, 1);
  const again = await workflow(fac.token, 'academic_letter', twoStep);
  assert.equal(again.data.version, 2); // new version, the old one is retired
  assert.equal((await call('GET', '/api/v1/approval-workflows?requestType=academic_letter&active=true', fac.token)).data.length, 1);
});

test('submission needs a workflow and a valid payload', async () => {
  const noWf = await call('POST', '/api/v1/requests', student.token, { type: 'majoring_appeal', payload: { reason: 'please review' } });
  assert.equal(noWf.status, 422);
  assert.equal(noWf.code, 'WORKFLOW_NOT_CONFIGURED');
  const bad = await call('POST', '/api/v1/requests', student.token, { type: 'academic_letter', payload: {} });
  assert.equal(bad.code, 'PAYLOAD_INVALID');
  assert.equal((await call('POST', '/api/v1/requests', student.token, { type: 'nope', payload: {} })).status, 404);
  assert.equal((await call('POST', '/api/v1/requests', hod.token, { type: 'academic_letter', payload: { purpose: 'x' } })).status, 403); // hod has no requests.create
});

test('full lifecycle: lecturer then HOD, scope enforced, handler runs on final approval, history kept', async () => {
  const created = await call('POST', '/api/v1/requests', student.token, { type: 'academic_letter', payload: { purpose: 'Visa application letter' }, description: 'Need it by Friday' });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const r = created.data;
  assert.equal(r.status, 'submitted');
  assert.equal(r.currentRole, 'lecturer');
  assert.equal(r.steps.length, 2);
  assert.equal(String(r.department._id), String(dict._id));

  // notifications: requester + the step's approvers
  assert.ok((await notifs(student.token)).some((n) => n.eventType === 'request.submitted'));
  assert.ok((await notifs(lec.token)).some((n) => n.eventType === 'request.awaiting' && n.entityId === r._id));
  assert.ok(!(await notifs(lecBst.token)).some((n) => n.entityId === r._id), 'approvers of another department are not notified');
  assert.ok(!(await notifs(hod.token)).some((n) => n.entityId === r._id), 'the HOD is notified only when the HOD step is reached');

  const decide = (token, decision, remarks) => call('POST', `/api/v1/requests/${r._id}/decision`, token, { decision, remarks });
  // wrong role / wrong department / not an approver at all
  assert.equal((await decide(hod.token, 'approve')).code, 'NOT_AUTHORISED_APPROVER'); // HOD step is not current
  assert.equal((await decide(lecBst.token, 'approve')).code, 'NOT_AUTHORISED_APPROVER'); // other department
  assert.equal((await decide(student.token, 'approve')).code, 'PERMISSION_DENIED');
  assert.equal((await decide(fac.token, 'approve')).code, 'NOT_AUTHORISED_APPROVER'); // right permission level but not the step's role

  // visibility: strangers cannot read it, approvers at the current step can
  const stranger = await makeUser({ role: 'student', name: 'Stranger', departmentRef: dict._id });
  assert.equal((await call('GET', `/api/v1/requests/${r._id}`, stranger.token)).status, 404);
  assert.equal((await call('GET', `/api/v1/requests/${r._id}`, lecBst.token)).status, 404);
  const asLec = await call('GET', `/api/v1/requests/${r._id}`, lec.token);
  assert.equal(asLec.status, 200);
  assert.equal(asLec.data.canDecide, true);

  const pend = await call('GET', '/api/v1/requests/pending', lec.token);
  assert.ok(pend.data.some((x) => x._id === r._id));
  assert.equal((await call('GET', '/api/v1/requests/pending', lecBst.token)).data.length, 0);
  assert.equal((await call('GET', '/api/v1/requests/pending', hod.token)).data.length, 0);

  // rejection / return need remarks
  assert.equal((await decide(lec.token, 'reject')).code, 'REMARKS_REQUIRED');
  assert.equal((await decide(lec.token, 'return', '  ')).code, 'REMARKS_REQUIRED');

  const step1 = await decide(lec.token, 'approve', 'Looks fine');
  assert.equal(step1.status, 200);
  assert.equal(step1.data.status, 'in_review');
  assert.equal(step1.data.currentRole, 'hod');
  assert.ok((await notifs(hod.token)).some((n) => n.eventType === 'request.awaiting' && n.entityId === r._id));
  assert.ok((await notifs(student.token)).some((n) => n.eventType === 'request.progress'));
  assert.equal((await decide(lec.token, 'approve')).code, 'NOT_AUTHORISED_APPROVER'); // the step moved on
  assert.equal((await decide(hodBst.token, 'approve')).code, 'NOT_AUTHORISED_APPROVER');
  assert.equal(approved.length, 0);

  const final = await decide(hod.token, 'approve', 'Approved');
  assert.equal(final.data.status, 'approved');
  assert.ok(final.data.finalDecisionAt);
  assert.equal(final.data.decisionRemarks, 'Approved');
  assert.deepEqual(approved, [r._id]); // handler ran exactly once
  assert.ok((await notifs(student.token)).some((n) => n.eventType === 'request.approved'));
  assert.equal((await decide(hod.token, 'approve')).code, 'NOT_PENDING');

  const detail = await call('GET', `/api/v1/requests/${r._id}`, student.token);
  assert.equal(detail.data.approvals.length, 2);
  assert.deepEqual(detail.data.approvals.map((a) => a.decision), ['approve', 'approve']);
  assert.ok(detail.data.history.length >= 4);
  assert.equal((await call('GET', '/api/v1/requests/mine', student.token)).meta.total >= 1, true);

  // approval records are append-only
  const { ApprovalRecord } = require('../modules/requests/model');
  const rec = await ApprovalRecord.findOne({ request: r._id });
  await assert.rejects(() => ApprovalRecord.updateOne({ _id: rec._id }, { remarks: 'tamper' }), /immutable/);
  await assert.rejects(() => ApprovalRecord.deleteMany({ request: r._id }), /immutable/);
  rec.remarks = 'tamper';
  await assert.rejects(() => rec.save(), /immutable/);
  // and the audit trail covers the decisions
  const audit = await call('GET', `/api/v1/audit?entityType=Request&entityId=${r._id}`, fac.token);
  assert.equal(audit.status, 403); // audit.read needs faculty scope: faculty_admin has none
});

test('reject, return-and-resubmit, withdraw and cancel', async () => {
  const mk = async () => (await call('POST', '/api/v1/requests', student.token, { type: 'academic_letter', payload: { purpose: 'Another letter' } })).data;
  const a = await mk();
  const rej = await call('POST', `/api/v1/requests/${a._id}/decision`, lec.token, { decision: 'reject', remarks: 'Not eligible' });
  assert.equal(rej.data.status, 'rejected');
  assert.equal(rej.data.decisionRemarks, 'Not eligible');
  assert.ok((await notifs(student.token)).some((n) => n.eventType === 'request.rejected'));

  const b = await mk();
  const ret = await call('POST', `/api/v1/requests/${b._id}/decision`, lec.token, { decision: 'return', remarks: 'State the exact purpose' });
  assert.equal(ret.data.status, 'draft');
  assert.equal((await call('POST', `/api/v1/requests/${b._id}/submit`, hod.token)).status, 403);
  const edited = await call('PATCH', `/api/v1/requests/${b._id}`, student.token, { payload: { purpose: 'Embassy letter for visa' } });
  assert.equal(edited.data.payload.purpose, 'Embassy letter for visa');
  assert.equal((await call('POST', `/api/v1/requests/${b._id}/submit`, student.token)).data.status, 'submitted');

  const c = await mk();
  assert.equal((await call('POST', `/api/v1/requests/${c._id}/withdraw`, lec.token, {})).status, 404); // not the owner
  assert.equal((await call('POST', `/api/v1/requests/${c._id}/withdraw`, student.token, { note: 'changed my mind' })).data.status, 'withdrawn');
  assert.equal((await call('POST', `/api/v1/requests/${c._id}/withdraw`, student.token, {})).code, 'INVALID_STATE');

  const d = await mk();
  assert.equal((await call('POST', `/api/v1/requests/${d._id}/cancel`, lec.token, { reason: 'x y z' })).status, 403);
  assert.equal((await call('POST', `/api/v1/requests/${d._id}/cancel`, fac.token, { reason: 'Duplicate request' })).data.status, 'cancelled');
});

test('a failing handler rolls the whole approval back', async () => {
  assert.equal((await workflow(fac.token, 'result_correction', [{ order: 1, label: 'Lecturer', role: 'lecturer', scope: 'department' }])).status, 201);
  const r = (await call('POST', '/api/v1/requests', student.token, { type: 'result_correction', payload: { offering: new mongoose.Types.ObjectId().toString(), reason: 'Marks missing' } })).data;
  const res = await call('POST', `/api/v1/requests/${r._id}/decision`, lec.token, { decision: 'approve' });
  assert.equal(res.code, 'HANDLER_FAILED');
  const { Request, ApprovalRecord } = require('../modules/requests/model');
  assert.equal((await Request.findById(r._id)).status, 'submitted');
  assert.equal(await ApprovalRecord.countDocuments({ request: r._id }), 0);
});

test('assigned-lecturer scope: only the lecturer assigned to payload.offering may decide', async () => {
  const { Staff } = require('../modules/staff/model');
  const { CourseStaffAssignment } = require('../modules/courses/model');
  const mkLec = async (n) => {
    const u = await makeUser({ role: 'lecturer', name: `Assigned ${n}`, departmentRef: dict._id });
    const s = await Staff.create({ user: u.user._id, staffId: `P6-${n}-${Date.now()}`, fullName: u.user.name, email: u.email, department: dict._id });
    return { ...u, staff: s };
  };
  const mine = await mkLec('A');
  const other = await mkLec('B');
  const offering = new mongoose.Types.ObjectId();
  await CourseStaffAssignment.create({ offering, componentType: 'theory', staff: mine.staff._id, role: 'lecturer' });
  assert.equal((await workflow(fac.token, 'subject_add_drop', [{ order: 1, label: 'Course lecturer', role: 'lecturer', scope: 'assigned' }])).status, 201);
  const r = (await call('POST', '/api/v1/requests', student.token, { type: 'subject_add_drop', payload: { offering: String(offering), action: 'drop', reason: 'Clash with another module' } })).data;
  assert.ok((await notifs(mine.token)).some((n) => n.entityId === r._id));
  assert.ok(!(await notifs(other.token)).some((n) => n.entityId === r._id));
  assert.equal((await call('POST', `/api/v1/requests/${r._id}/decision`, other.token, { decision: 'approve' })).code, 'NOT_AUTHORISED_APPROVER');
  assert.equal((await call('POST', `/api/v1/requests/${r._id}/decision`, mine.token, { decision: 'approve' })).data.status, 'approved');
});

/* =============================== attachments =============================== */
test('attachments: allow-list, magic bytes, size limit, hash, linking', async () => {
  const draft = (await call('POST', '/api/v1/requests', student.token, { type: 'academic_letter', payload: { purpose: 'Letter with documents' }, draft: true })).data;
  assert.equal(draft.status, 'draft');

  const txt = await upload(student.token, { name: 'notes.txt', type: 'text/plain', content: Buffer.from('hello') });
  assert.equal(txt.status, 415);
  assert.equal(txt.code, 'UNSUPPORTED_MEDIA_TYPE');
  const fake = await upload(student.token, { name: 'fake.pdf', type: 'application/pdf', content: Buffer.from('this is not a pdf at all') });
  assert.equal(fake.status, 415);
  assert.equal(fake.code, 'CONTENT_MISMATCH');
  assert.equal((await upload(student.token, { name: 'none.pdf', entityType: 'Request', entityId: String(new mongoose.Types.ObjectId()) })).status, 404);

  const previous = process.env.ATTACHMENT_MAX_BYTES;
  process.env.ATTACHMENT_MAX_BYTES = '1024';
  const big = await upload(student.token, { name: 'big.pdf', content: Buffer.concat([PDF, Buffer.alloc(4096, 65)]) });
  process.env.ATTACHMENT_MAX_BYTES = previous || String(5 * 1024 * 1024);
  assert.equal(big.status, 413);
  assert.equal(big.code, 'FILE_TOO_LARGE');

  const good = await upload(student.token, { name: '../../evil name.pdf', entityType: 'Request', entityId: draft._id });
  assert.equal(good.status, 201, JSON.stringify(good.body));
  assert.equal(good.data.sha256, crypto.createHash('sha256').update(PDF).digest('hex'));
  assert.ok(!good.data.originalName.includes('/'), 'client file name is sanitised');
  assert.equal(good.data.storedName, undefined, 'the server-side name is never exposed');
  const { default: Attachment } = { default: require('../modules/attachments/model') };
  const stored = await Attachment.findById(good.data._id);
  assert.match(stored.storedName, /^[a-f0-9-]{36}\.pdf$/);
  assert.ok(fs.existsSync(path.join(process.env.ATTACHMENT_DIR, stored.storedName)));
  assert.equal(String((await call('GET', `/api/v1/requests/${draft._id}`, student.token)).data.attachments[0]._id), good.data._id);

  // unlinked upload attached when the request is created
  const loose = await upload(student.token, { name: 'scan.png', type: 'image/png', content: PNG });
  assert.equal(loose.status, 201);
  const withDoc = await call('POST', '/api/v1/requests', student.token, { type: 'academic_letter', payload: { purpose: 'With scan' }, attachments: [loose.data._id] });
  assert.equal(withDoc.status, 201);
  assert.equal(withDoc.data.attachments.length, 1);
  assert.equal((await call('POST', '/api/v1/requests', student.token, { type: 'academic_letter', payload: { purpose: 'Reuse' }, attachments: [loose.data._id] })).code, 'ATTACHMENT_INVALID'); // already linked
  // once submitted, documents can no longer be added
  assert.equal((await upload(student.token, { name: 'late.pdf', entityType: 'Request', entityId: withDoc.data._id })).status, 409);

  ctx.attDraft = { request: draft, att: good.data, stored };
  ctx.attSubmitted = { request: withDoc.data, att: loose.data };
});

test('attachment download: owner, current approver and faculty may; others and traversal may not', async () => {
  const { request, att } = ctx.attSubmitted;
  const owner = await download(student.token, att._id);
  assert.equal(owner.status, 200);
  assert.equal(owner.headers.get('content-type'), 'image/png');
  assert.equal(owner.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(Buffer.from(await owner.arrayBuffer()).equals(PNG));

  const stranger = await makeUser({ role: 'student', name: 'Nosy Student', departmentRef: dict._id });
  assert.equal((await download(stranger.token, att._id)).status, 404);
  assert.equal((await download(lecBst.token, att._id)).status, 404); // other department's lecturer
  assert.equal((await download(lec.token, att._id)).status, 200); // approver at the current step
  assert.equal((await download(fac.token, att._id)).status, 200); // faculty scope
  assert.equal((await call('GET', `/api/v1/attachments/${att._id}`, stranger.token)).status, 404);
  assert.equal((await call('GET', `/api/v1/attachments/${att._id}`, student.token)).data.storedName, undefined);
  assert.equal((await download(student.token, 'not-an-id')).status, 422);
  assert.ok(request._id);

  // a tampered reference can never leave the storage directory
  const Attachment = require('../modules/attachments/model');
  await Attachment.updateOne({ _id: att._id }, { storedName: '../../../../etc/passwd' });
  const bad = await download(student.token, att._id);
  assert.equal(bad.status, 403);
  assert.equal((await bad.json()).error.code, 'STORAGE_REFERENCE_INVALID');
});

/* =============================== notifications =============================== */
test('notifications API: pagination, unread filter, read state, broadcast scope; legacy routes untouched', async () => {
  const n = await notifs(student.token);
  assert.ok(n.length >= 3);
  const page = await call('GET', '/api/v1/notifications?limit=2&page=1', student.token);
  assert.equal(page.data.length, 2);
  assert.equal(page.meta.limit, 2);
  assert.ok(page.meta.pages >= 2);
  assert.ok(page.meta.unreadCount > 0);

  const unread = await call('GET', '/api/v1/notifications?unread=true&limit=100', student.token);
  assert.ok(unread.data.every((x) => !x.isRead));
  const first = unread.data[0];
  assert.equal((await call('PUT', `/api/v1/notifications/${first._id}/read`, student.token)).data.isRead, true);
  assert.equal((await call('GET', '/api/v1/notifications/unread-count', student.token)).data.unreadCount, unread.data.length - 1);
  assert.equal((await call('PUT', `/api/v1/notifications/${first._id}/read`, lec.token)).status, 404); // not addressed to them
  assert.equal((await call('PUT', '/api/v1/notifications/read-all', student.token)).status, 200);
  assert.equal((await call('GET', '/api/v1/notifications?unread=true', student.token)).data.length, 0);

  // broadcast: faculty-level senders only, role names validated
  assert.equal((await call('POST', '/api/v1/notifications/broadcast', student.token, { title: 'Hi all', message: 'Not allowed', roles: ['student'] })).status, 403);
  assert.equal((await call('POST', '/api/v1/notifications/broadcast', lec.token, { title: 'Hi all', message: 'Not allowed', roles: ['student'] })).status, 403);
  assert.equal((await call('POST', '/api/v1/notifications/broadcast', fac.token, { title: 'Hi all', message: 'Hello', roles: ['wizard'] })).code, 'ROLE_UNKNOWN');
  const sent = await call('POST', '/api/v1/notifications/broadcast', fac.token, { title: 'Exam timetable published', message: 'See the faculty notice board.', roles: ['student'], department: String(dict._id), eventType: 'announcement' });
  assert.equal(sent.status, 200);
  assert.ok(sent.data.recipients >= 1);
  assert.ok((await notifs(student.token, '?unread=true')).some((x) => x.eventType === 'announcement'));
  assert.ok(!(await notifs(lec.token)).some((x) => x.eventType === 'announcement'));

  // the legacy API keeps answering with the old shape
  const legacy = await fetch(`${base}/api/notifications`, { headers: { Authorization: `Bearer ${student.token}` } });
  assert.equal(legacy.status, 200);
  assert.equal((await legacy.json()).success, true);
});

/* ================================= reports ================================= */
test('reports: data scope per role, CSV export is formula-safe, dependent reports degrade cleanly', async () => {
  const Student = require('../models/Student');
  const { AcademicBatch, DegreeProgramme } = require('../modules/organization/model');
  const bict = await DegreeProgramme.findOne({ code: 'BICT' });
  const bbst = await DegreeProgramme.findOne({ code: 'BBST' });
  const bDict = await AcademicBatch.create({ programme: bict._id, intakeYear: 2022 });
  const bDbst = await AcademicBatch.create({ programme: bbst._id, intakeYear: 2022 });
  const own = await makeUser({ role: 'student', name: 'Report Student', departmentRef: dict._id });
  const mk = (id, name, dept, prog, batch, user) => Student.create({ studentId: id, indexNo: id.replace(/\W/g, ''), fullName: name, email: `${id.replace(/\W/g, '')}@test.seu`, departmentRef: dept._id, programmeRef: prog._id, batchRef: batch._id, user: user && user._id });
  await mk('R/ICT/1', 'Report Student', dict, bict, bDict, own.user);
  await mk('R/ICT/2', '=EVIL()', dict, bict, bDict);
  await mk('R/BST/1', 'Bio Person', dbst, bbst, bDbst);

  const rows = async (token, name, qs = '') => (await call('GET', `/api/v1/reports/${name}${qs}`, token));
  const hodDict = await rows(hod.token, 'students');
  assert.equal(hodDict.status, 200);
  assert.equal(hodDict.meta.total, 2);
  assert.ok(hodDict.data.every((r) => r.department === 'DICT'));
  const hodBio = await rows(hodBst.token, 'students');
  assert.equal(hodBio.meta.total, 1);
  assert.equal(hodBio.data[0].department, 'DBST');
  assert.equal((await rows(fac.token, 'students')).meta.total, 3);
  assert.equal((await rows(fac.token, 'students', `?department=${dbst._id}`)).meta.total, 1);
  assert.equal((await rows(fac.token, 'students', `?batch=${bDict._id}&limit=1&page=2`)).data.length, 1);

  // a student only ever sees their own row
  const mine = await rows(own.token, 'students');
  assert.equal(mine.meta.total, 1);
  assert.equal(mine.data[0].studentId, 'R/ICT/1');
  assert.equal((await rows(own.token, 'course-registrations')).status, 200);
  assert.equal((await rows(own.token, 'staff-assignments')).code, 'REPORT_NOT_PERMITTED');
  assert.equal((await rows(own.token, 'pending-requests')).status, 200); // own requests only
  assert.equal((await rows(own.token, 'majoring-allocations')).code, 'REPORT_NOT_PERMITTED');
  assert.equal((await rows(own.token, 'nonexistent')).code, 'REPORT_UNKNOWN');
  assert.equal((await rows(student.token, 'academic-progression')).status, 200);
  assert.equal((await call('GET', '/api/v1/reports/students', null)).status, 401);
  const catalogue = await call('GET', '/api/v1/reports', own.token);
  assert.ok(!catalogue.data.some((r) => r.name === 'staff-assignments'));
  assert.ok(catalogue.data.some((r) => r.name === 'students'));

  // other implemented reports respond for staff
  for (const name of ['course-offerings', 'course-registrations', 'staff-assignments', 'pending-requests', 'academic-progression']) {
    assert.equal((await rows(fac.token, name)).status, 200, name);
  }
  const pend = await rows(hod.token, 'pending-requests');
  assert.ok(pend.data.every((r) => r.department === 'DICT'));
  assert.ok((await rows(hodBst.token, 'pending-requests')).data.every((r) => r.department === 'DBST'));

  // dependent reports: either real data or a clean 501 when the source module is not loaded
  for (const name of ['attendance', 'ca-marks', 'esa-marks', 'semester-results', 'gpa', 'specialization-allocations', 'majoring-allocations']) {
    const r = await rows(fac.token, name);
    assert.ok([200, 501].includes(r.status), `${name}: ${r.status}`);
    if (r.status === 501) assert.equal(r.code, 'REPORT_SOURCE_NOT_AVAILABLE');
  }

  // CSV: spreadsheet-safe
  const res = await fetch(`${base}/api/v1/reports/students?format=csv`, { headers: { Authorization: `Bearer ${fac.token}` } });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/csv/);
  const csv = await res.text();
  assert.ok(csv.includes('Student ID,Registration No'));
  assert.ok(csv.includes("'=EVIL()"), 'formula cell neutralised');
  assert.ok(!/(^|,)=EVIL/m.test(csv));
});

/* ================================== backup ================================== */
test('backup script exports collections as NDJSON without secrets', async () => {
  const { runBackup } = require('../scripts/backup');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seu-backup-'));
  try {
    const result = await runBackup({ outDir: dir });
    assert.ok(fs.existsSync(path.join(dir, 'MANIFEST.json')));
    const users = fs.readFileSync(path.join(dir, 'users.ndjson'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.ok(users.length >= 6);
    for (const u of users) {
      assert.equal(u.password, undefined);
      assert.equal(u.passwordHash, undefined);
    }
    assert.ok(users.every((u) => u.email));
    assert.ok(!fs.readFileSync(path.join(dir, 'users.ndjson'), 'utf8').includes('scrypt$'), 'no password hash in the export');
    assert.ok(/skipped/.test(String(result.summary.refreshtokens)));
    assert.ok(!fs.existsSync(path.join(dir, 'refreshtokens.ndjson')));
    assert.ok(fs.existsSync(path.join(dir, 'requests.ndjson')));
    assert.ok(fs.existsSync(path.join(dir, 'auditlogs.ndjson')));

    const only = fs.mkdtempSync(path.join(os.tmpdir(), 'seu-backup-'));
    await runBackup({ outDir: only, collections: ['departments'] });
    assert.deepEqual(fs.readdirSync(only).sort(), ['MANIFEST.json', 'departments.ndjson']);
    fs.rmSync(only, { recursive: true, force: true });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
