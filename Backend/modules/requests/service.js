/**
 * Generic request / approval engine. No request type is hard-coded: the chain of approvers comes from an
 * ApprovalWorkflow record and the side effects of a decision from handlers registered in core/hooks.
 */
const mongoose = require('mongoose');
const { z } = require('zod');
const { RequestType, ApprovalWorkflow, Request, ApprovalRecord } = require('./model');
const Attachment = require('../attachments/model');
const User = require('../../models/User');
const Student = require('../../models/Student');
const { UserRole, Role } = require('../access/model');
const { CourseStaffAssignment } = require('../courses/model');
const { Staff } = require('../staff/model');
const { paginate, buildSort } = require('../../core/pagination');
const { ApiError, notFound, forbidden, conflict, unprocessable, badRequest } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { rank, ROLE_CATALOG } = require('../../core/rbac');
const { getRequestHandler } = require('../../core/hooks');
const audit = require('../../core/audit');
const notify = require('../../core/notify');

const ACTIVE = ['submitted', 'in_review'];
const POPULATE = [
  { path: 'requester', select: 'name email role' },
  { path: 'department', select: 'code name' },
];

/* ------------------------------ request types ------------------------------ */
const SEED_TYPES = [
  ['subject_add_drop', 'Subject add / drop', [{ name: 'offering', type: 'objectId', required: true, label: 'Course offering' }, { name: 'action', type: 'enum', options: ['add', 'drop'], required: true }, { name: 'reason', type: 'text', required: true }]],
  ['subject_registration_exception', 'Subject registration exception', [{ name: 'offering', type: 'objectId', required: true }, { name: 'reason', type: 'text', required: true }]],
  ['specialization_change', 'Specialization / majoring change', [{ name: 'toSpecialization', type: 'objectId', required: true }, { name: 'reason', type: 'text', required: true }]],
  ['majoring_appeal', 'Majoring allocation appeal', [{ name: 'reason', type: 'text', required: true }]],
  ['attendance_correction', 'Attendance correction', [{ name: 'session', type: 'objectId', required: true }, { name: 'requestedStatus', type: 'enum', options: ['present', 'absent', 'excused'], required: true }, { name: 'reason', type: 'text', required: true }]],
  ['result_correction', 'Result correction', [{ name: 'offering', type: 'objectId', required: true }, { name: 'reason', type: 'text', required: true }]],
  ['academic_letter', 'Academic letter', [{ name: 'purpose', type: 'text', required: true }]],
];

let seeding = null;
/** Idempotently creates the request types as data (no workflows: those are defined by an authorised officer). */
const ensureSeeded = () => {
  if (!seeding) {
    seeding = (async () => {
      for (const [key, name, fields] of SEED_TYPES) {
        await RequestType.updateOne({ key }, { $setOnInsert: { key, name, fields, active: true, pendingConfirmation: true, description: 'Approval workflow pending confirmation by the Faculty.' } }, { upsert: true });
      }
    })().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
};
const resetSeeding = () => {
  seeding = null;
};

const buildPayloadSchema = (fields) => {
  const shape = {};
  for (const f of fields) {
    let s;
    switch (f.type) {
      case 'number': s = z.coerce.number(); break;
      case 'boolean': s = z.boolean(); break;
      case 'date': s = z.coerce.date(); break;
      case 'objectId': s = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'); break;
      case 'enum': s = z.enum(f.options && f.options.length ? f.options : ['']); break;
      case 'text': s = z.string().trim().max(5000); break;
      default: s = z.string().trim().max(500);
    }
    if (f.type === 'string' || f.type === 'text') s = f.required ? s.min(1, 'Required') : s;
    shape[f.name] = f.required ? s : s.optional();
  }
  return z.object(shape);
};

const listTypes = async (query) => {
  await ensureSeeded();
  const filter = {};
  if (query.active !== undefined) filter.active = query.active === 'true';
  return RequestType.find(filter).sort({ key: 1 }).lean();
};

const createType = async (req, body) => {
  return withTransaction(async (session) => {
    const [type] = await RequestType.create([body], { session });
    await audit.record({ req, action: 'requestType.create', entityType: 'RequestType', entityId: type._id, after: type }, { session });
    return type;
  });
};

const updateType = async (req, key, patch) => {
  return withTransaction(async (session) => {
    const type = await RequestType.findOne({ key }).session(session);
    if (!type) throw notFound('Request type not found.');
    const before = type.toObject();
    type.set(patch);
    await type.save({ session });
    await audit.record({ req, action: 'requestType.update', entityType: 'RequestType', entityId: type._id, before, after: type }, { session });
    return type;
  });
};

/* -------------------------------- workflows -------------------------------- */
const roleExists = async (key, session) => Boolean(ROLE_CATALOG[key]) || Boolean(await Role.exists({ key, status: 'active' }).session(session));

const checkSteps = async (steps, session) => {
  const orders = new Set();
  for (const s of steps) {
    if (orders.has(s.order)) throw unprocessable(`Duplicate step order ${s.order}.`, null, 'STEP_ORDER_DUPLICATE');
    orders.add(s.order);
    if (!(await roleExists(s.role, session))) throw unprocessable(`Step "${s.label}" refers to the unknown role "${s.role}".`, { role: s.role }, 'WORKFLOW_ROLE_UNKNOWN');
    if (s.role === 'student') throw unprocessable('A student cannot be an approver.', null, 'WORKFLOW_ROLE_INVALID');
  }
};

const listWorkflows = (query) => {
  const filter = {};
  if (query.requestType) filter.requestType = query.requestType;
  if (query.active !== undefined) filter.active = query.active === 'true';
  return ApprovalWorkflow.find(filter).sort({ requestType: 1, version: -1 }).populate({ path: 'department', select: 'code name' }).lean();
};

const createWorkflow = async (req, body) => {
  return withTransaction(async (session) => {
    if (!(await RequestType.exists({ key: body.requestType }).session(session))) throw notFound('Request type not found.');
    await checkSteps(body.steps, session);
    const dept = body.department || null;
    const previous = await ApprovalWorkflow.findOne({ requestType: body.requestType, department: dept, active: true }).sort({ version: -1 }).session(session);
    if (previous) {
      previous.active = false;
      await previous.save({ session });
    }
    const [wf] = await ApprovalWorkflow.create([{ ...body, department: dept, steps: [...body.steps].sort((a, b) => a.order - b.order), version: previous ? previous.version + 1 : 1, createdBy: req.user.id }], { session });
    await RequestType.updateOne({ key: body.requestType }, { pendingConfirmation: false }, { session });
    await audit.record({ req, action: 'workflow.create', entityType: 'ApprovalWorkflow', entityId: wf._id, before: previous && { id: String(previous._id), version: previous.version }, after: wf }, { session });
    return wf;
  });
};

const deactivateWorkflow = async (req, id) => {
  return withTransaction(async (session) => {
    const wf = await ApprovalWorkflow.findById(id).session(session);
    if (!wf) throw notFound('Workflow not found.');
    const before = wf.toObject();
    wf.active = false;
    await wf.save({ session });
    await audit.record({ req, action: 'workflow.deactivate', entityType: 'ApprovalWorkflow', entityId: wf._id, before, after: wf }, { session });
    return wf;
  });
};

const findWorkflow = async (typeKey, department, session) => {
  let q = ApprovalWorkflow.findOne({ requestType: typeKey, department: department || null, active: true }).sort({ version: -1 });
  if (session) q = q.session(session);
  let wf = department ? await q : null;
  if (!wf) {
    q = ApprovalWorkflow.findOne({ requestType: typeKey, department: null, active: true }).sort({ version: -1 });
    if (session) q = q.session(session);
    wf = await q;
  }
  return wf;
};

/* ------------------------------ eligibility ------------------------------ */
const idOf = (v) => String(v && v._id ? v._id : v);

/** May the caller (access = resolved RBAC context) decide `request` at `step`? */
const stepAllows = async (access, userId, request, step, session) => {
  if (!step || idOf(request.requester) === String(userId)) return false; // nobody approves their own request
  if (!access.roles.includes(step.role)) return false;
  const decide = access.permissions.get('requests.decide');
  if (!decide) return false;
  const wide = rank(decide) >= rank('faculty');
  if (step.scope === 'faculty') return true;
  if (step.scope === 'department') return wide || Boolean(request.department && access.departments.includes(idOf(request.department)));
  if (step.scope === 'assigned') {
    if (wide) return true;
    const offering = request.payload && request.payload.offering;
    if (!offering || !access.staffId) return false;
    let q = CourseStaffAssignment.exists({ offering, staff: access.staffId, active: true });
    if (session) q = q.session(session);
    return Boolean(await q);
  }
  return false;
};

const currentStepOf = (request) => (ACTIVE.includes(request.status) ? request.steps[request.currentStep] : null);

const canView = async (access, userId, request) => {
  if (String(request.requester && request.requester._id ? request.requester._id : request.requester) === String(userId)) return true;
  const read = access.permissions.get('requests.read');
  if (read && rank(read) >= rank('faculty')) return true;
  if (read === 'department' && request.department && access.departments.includes(String(request.department && request.department._id ? request.department._id : request.department))) return true;
  const stepNow = currentStepOf(request);
  if (stepNow && (await stepAllows(access, userId, request, stepNow))) return true;
  return Boolean(await ApprovalRecord.exists({ request: request._id, approver: userId }));
};

/* ------------------------------- notifications ------------------------------- */
const approverUserIds = async (step, request) => {
  const ids = new Set();
  const grants = { role: step.role, active: true };
  if (step.scope === 'department' && request.department) grants.department = { $in: [request.department, null] };
  (await UserRole.find(grants).select('user').lean()).forEach((g) => ids.add(String(g.user)));
  const users = { role: step.role, status: { $ne: 'disabled' } };
  if (step.scope === 'department' && request.department) users.departmentRef = request.department;
  (await User.find(users).select('_id').lean()).forEach((u) => ids.add(String(u._id)));
  if (step.scope === 'assigned' && request.payload && request.payload.offering) {
    const staffIds = await CourseStaffAssignment.find({ offering: request.payload.offering, active: true }).distinct('staff');
    const assigned = new Set((await Staff.find({ _id: { $in: staffIds } }).select('user').lean()).map((s) => String(s.user)));
    for (const id of [...ids]) if (!assigned.has(id)) ids.delete(id);
  }
  ids.delete(String(request.requester));
  return [...ids];
};

const label = (request) => `${request.type.replace(/_/g, ' ')} (${String(request._id).slice(-6)})`;

const notifyAwaiting = async (request) => {
  const step = currentStepOf(request);
  if (!step) return;
  const ids = await approverUserIds(step, request);
  await notify.sendMany(ids, { eventType: 'request.awaiting', title: 'Request awaiting your decision', message: `${label(request)} is at step "${step.label}".`, entityType: 'Request', entityId: request._id, priority: 'high' });
};

/* -------------------------------- operations -------------------------------- */
const requesterDepartment = async (access, userId, session) => {
  if (access.studentId) {
    const s = await Student.findById(access.studentId).select('departmentRef').session(session);
    if (s && s.departmentRef) return { student: access.studentId, department: s.departmentRef };
  }
  const u = await User.findById(userId).select('departmentRef').session(session);
  return { student: null, department: (u && u.departmentRef) || null };
};

const linkAttachments = async (ids, userId, requestId, session) => {
  if (!ids || !ids.length) return [];
  const found = await Attachment.find({ _id: { $in: ids }, uploadedBy: userId, status: 'active', $or: [{ entityId: '' }, { entityType: 'Request', entityId: String(requestId) }] }).session(session);
  if (found.length !== new Set(ids.map(String)).size) throw badRequest('One or more attachments were not found, are not yours, or are already attached elsewhere.', null, 'ATTACHMENT_INVALID');
  await Attachment.updateMany({ _id: { $in: found.map((a) => a._id) } }, { entityType: 'Request', entityId: String(requestId) }, { session });
  return found.map((a) => a._id);
};

const validatePayload = async (type, payload, ctx) => {
  const parsed = buildPayloadSchema(type.fields).safeParse(payload || {});
  if (!parsed.success) throw unprocessable('The request details are invalid.', parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })), 'PAYLOAD_INVALID');
  const handler = getRequestHandler(type.key);
  return handler && handler.validate ? handler.validate({ payload: parsed.data, ...ctx }) : parsed.data;
};

const applyWorkflow = async (request, session) => {
  const wf = await findWorkflow(request.type, request.department, session);
  if (!wf) throw unprocessable('No approval workflow has been configured for this request type yet. Please contact the Faculty office.', null, 'WORKFLOW_NOT_CONFIGURED');
  request.workflow = { id: wf._id, version: wf.version };
  request.steps = wf.steps.map((s) => ({ order: s.order, label: s.label, role: s.role, scope: s.scope, required: s.required }));
  request.currentStep = 0;
  request.currentRole = request.steps[0].role;
  request.status = 'submitted';
  request.submittedAt = new Date();
};

const create = async (req, body) => {
  await ensureSeeded();
  const created = await withTransaction(async (session) => {
    const type = await RequestType.findOne({ key: body.type, active: true }).session(session);
    if (!type) throw notFound('Unknown or inactive request type.', 'REQUEST_TYPE_UNKNOWN');
    const { student, department } = await requesterDepartment(req.access, req.user.id, session);
    const payload = await validatePayload(type, body.payload, { requester: req.user, req, session });
    const request = new Request({ type: type.key, requester: req.user.id, student, department, description: body.description || '', payload, status: 'draft', history: [{ action: 'created', by: req.user.id, note: body.draft ? 'Saved as draft' : '' }] });
    request.attachments = await linkAttachments(body.attachments, req.user.id, request._id, session);
    if (!body.draft) {
      await applyWorkflow(request, session);
      request.history.push({ action: 'submitted', by: req.user.id, step: 0 });
    }
    await request.save({ session });
    await audit.record({ req, action: body.draft ? 'request.draft' : 'request.submit', entityType: 'Request', entityId: request._id, after: request }, { session });
    return request;
  });
  if (created.status === 'submitted') {
    await notify.send({ userId: req.user.id, eventType: 'request.submitted', title: 'Request submitted', message: `${label(created)} was submitted for approval.`, entityType: 'Request', entityId: created._id });
    await notifyAwaiting(created);
  }
  return get(req, created._id);
};

const loadOwn = async (req, id, session) => {
  const request = await Request.findById(id).session(session);
  if (!request || String(request.requester) !== String(req.user.id)) throw notFound('Request not found.');
  return request;
};

const updateDraft = async (req, id, body) => {
  await withTransaction(async (session) => {
    const request = await loadOwn(req, id, session);
    if (request.status !== 'draft') throw conflict('Only draft requests can be edited.', null, 'NOT_DRAFT');
    const type = await RequestType.findOne({ key: request.type }).session(session);
    const before = request.toObject();
    if (body.payload) request.payload = await validatePayload(type, body.payload, { requester: req.user, req, session });
    if (body.description !== undefined) request.description = body.description;
    if (body.attachments) request.attachments = await linkAttachments(body.attachments, req.user.id, request._id, session);
    await request.save({ session });
    await audit.record({ req, action: 'request.edit', entityType: 'Request', entityId: request._id, before, after: request }, { session });
  });
  return get(req, id);
};

const submit = async (req, id) => {
  const request = await withTransaction(async (session) => {
    const r = await loadOwn(req, id, session);
    if (r.status !== 'draft') throw conflict('Only draft requests can be submitted.', null, 'NOT_DRAFT');
    await applyWorkflow(r, session);
    r.history.push({ action: 'submitted', by: req.user.id, step: 0 });
    await r.save({ session });
    await audit.record({ req, action: 'request.submit', entityType: 'Request', entityId: r._id, after: { status: r.status } }, { session });
    return r;
  });
  await notify.send({ userId: req.user.id, eventType: 'request.submitted', title: 'Request submitted', message: `${label(request)} was submitted for approval.`, entityType: 'Request', entityId: request._id });
  await notifyAwaiting(request);
  return get(req, id);
};

const withdraw = async (req, id, note) => {
  await withTransaction(async (session) => {
    const r = await loadOwn(req, id, session);
    if (!['draft', ...ACTIVE].includes(r.status)) throw conflict(`A ${r.status} request cannot be withdrawn.`, null, 'INVALID_STATE');
    const before = r.status;
    r.status = 'withdrawn';
    r.finalDecisionAt = new Date();
    r.currentRole = '';
    r.history.push({ action: 'withdrawn', by: req.user.id, note });
    await r.save({ session });
    await audit.record({ req, action: 'request.withdraw', entityType: 'Request', entityId: r._id, before: { status: before }, after: { status: 'withdrawn' }, reason: note }, { session });
  });
  return get(req, id);
};

const cancel = async (req, id, reason) => {
  const r = await withTransaction(async (session) => {
    const request = await Request.findById(id).session(session);
    if (!request) throw notFound('Request not found.');
    if (!['draft', ...ACTIVE].includes(request.status)) throw conflict(`A ${request.status} request cannot be cancelled.`, null, 'INVALID_STATE');
    const before = request.status;
    request.status = 'cancelled';
    request.finalDecisionAt = new Date();
    request.currentRole = '';
    request.decisionRemarks = reason;
    request.history.push({ action: 'cancelled', by: req.user.id, note: reason });
    await request.save({ session });
    await audit.record({ req, action: 'request.cancel', entityType: 'Request', entityId: request._id, before: { status: before }, after: { status: 'cancelled' }, reason }, { session });
    return request;
  });
  await notify.send({ userId: r.requester, eventType: 'request.cancelled', title: 'Request cancelled', message: `${label(r)} was cancelled by the Faculty office: ${reason}`, entityType: 'Request', entityId: r._id });
  return get(req, id);
};

/** Approve / reject / return the request at its current step. */
const decide = async (req, id, { decision, remarks }) => {
  const text = (remarks || '').trim();
  if (['reject', 'return'].includes(decision) && !text) throw unprocessable(decision === 'reject' ? 'A reason is required to reject a request.' : 'Explain what the requester must change.', null, 'REMARKS_REQUIRED');

  const outcome = await withTransaction(async (session) => {
    const request = await Request.findById(id).session(session);
    if (!request) throw notFound('Request not found.');
    if (!ACTIVE.includes(request.status)) throw conflict(`This request is ${request.status}.`, null, 'NOT_PENDING');
    const step = request.steps[request.currentStep];
    if (!(await stepAllows(req.access, req.user.id, request, step, session))) {
      throw forbidden('You are not an authorised approver for the current step of this request.', 'NOT_AUTHORISED_APPROVER');
    }
    const before = { status: request.status, currentStep: request.currentStep };
    await ApprovalRecord.create([{ request: request._id, step: request.currentStep, stepLabel: step.label, role: step.role, approver: req.user.id, decision, remarks: text }], { session });
    request.history.push({ action: decision, by: req.user.id, step: request.currentStep, note: text });
    const handler = getRequestHandler(request.type);
    let event = 'step';

    if (decision === 'approve') {
      if (request.currentStep + 1 < request.steps.length) {
        request.currentStep += 1;
        request.currentRole = request.steps[request.currentStep].role;
        request.status = 'in_review';
      } else {
        request.status = 'approved';
        request.finalDecisionAt = new Date();
        request.decisionRemarks = text;
        request.currentRole = '';
        event = 'approved';
        // Side effects run in the SAME transaction: if they fail the approval is rolled back.
        if (handler && handler.onApproved) await handler.onApproved({ request, req, session });
      }
    } else if (decision === 'reject') {
      request.status = 'rejected';
      request.finalDecisionAt = new Date();
      request.decisionRemarks = text;
      request.currentRole = '';
      event = 'rejected';
      if (handler && handler.onRejected) await handler.onRejected({ request, req, session });
    } else {
      request.status = 'draft';
      request.currentStep = 0;
      request.currentRole = '';
      request.decisionRemarks = text;
      event = 'returned';
    }
    await request.save({ session });
    await audit.record({ req, action: `request.${decision}`, entityType: 'Request', entityId: request._id, before, after: { status: request.status, currentStep: request.currentStep }, reason: text }, { session });
    return { request, event };
  });

  const { request, event } = outcome;
  if (event === 'step') {
    await notify.send({ userId: request.requester, eventType: 'request.progress', title: 'Request moved to the next step', message: `${label(request)} was approved and is now at "${request.steps[request.currentStep].label}".`, entityType: 'Request', entityId: request._id });
    await notifyAwaiting(request);
  } else {
    const verb = { approved: 'approved', rejected: 'rejected', returned: 'returned for changes' }[event];
    await notify.send({ userId: request.requester, eventType: `request.${event}`, title: `Request ${verb}`, message: `${label(request)} was ${verb}${text ? `: ${text}` : '.'}`, entityType: 'Request', entityId: request._id, priority: 'high' });
  }
  return get(req, id);
};

/* ---------------------------------- reads ---------------------------------- */
const get = async (req, id) => {
  const request = await Request.findById(id).populate(POPULATE).populate({ path: 'attachments', select: 'originalName mime size sha256 createdAt' }).lean();
  if (!request || !(await canView(req.access, req.user.id, request))) throw notFound('Request not found.');
  request.approvals = await ApprovalRecord.find({ request: id }).sort({ at: 1 }).populate({ path: 'approver', select: 'name role' }).lean();
  const step = currentStepOf(request);
  request.canDecide = Boolean(step && (await stepAllows(req.access, req.user.id, request, step)));
  return request;
};

const list = async (req, query) => {
  const filter = {};
  const scope = req.access.scope;
  if (scope === 'own' || scope === 'assigned') filter.requester = req.user.id;
  else if (scope === 'department') filter.$or = [{ department: { $in: req.access.departments } }, { requester: req.user.id }];
  for (const f of ['status', 'type', 'department']) if (query[f]) filter[f] = query[f];
  return paginate(Request, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'submittedAt', 'status', 'type'], '-createdAt'), populate: POPULATE });
};

const mine = async (req, query) => {
  const filter = { requester: req.user.id };
  if (query.status) filter.status = query.status;
  return paginate(Request, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'status'], '-createdAt'), populate: POPULATE });
};

/** Requests whose current step the caller may decide. */
const pending = async (req, query) => {
  const candidates = await Request.find({ status: { $in: ACTIVE }, currentRole: { $in: req.access.roles }, requester: { $ne: req.user.id } }).sort({ submittedAt: 1 }).populate(POPULATE).lean();
  const mineOnly = [];
  for (const r of candidates) if (await stepAllows(req.access, req.user.id, r, currentStepOf(r))) mineOnly.push(r);
  const page = query.page;
  const limit = query.limit;
  return { items: mineOnly.slice((page - 1) * limit, page * limit), meta: { page, limit, total: mineOnly.length, pages: Math.max(1, Math.ceil(mineOnly.length / limit)) } };
};

module.exports = {
  ACTIVE, ensureSeeded, resetSeeding, buildPayloadSchema,
  listTypes, createType, updateType, listWorkflows, createWorkflow, deactivateWorkflow,
  create, updateDraft, submit, withdraw, cancel, decide, get, list, mine, pending,
  canView, stepAllows, mongoose, ApiError,
};
