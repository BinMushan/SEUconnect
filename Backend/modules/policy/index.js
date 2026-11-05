const express = require('express');
const AcademicPolicy = require('./model');
const Setting = require('../../models/Setting');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery, buildSort, paginate } = require('../../core/pagination');
const { asyncHandler, ok, created, notFound, conflict } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');
const { withTransaction } = require('../../core/transaction');
const { clearPolicyCache } = require('../../core/policy');
const audit = require('../../core/audit');

const key = z.string().trim().regex(/^[a-z][a-z0-9_.]{2,80}$/, 'Use dotted lowercase keys such as registration.maxCredits');
const scopeSchema = z.object({ programme: objectId.nullable().optional(), department: objectId.nullable().optional() }).optional();

const policies = express.Router();

policies.get('/', requirePermission('policies.read'), validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const q = req.valid.query;
  const filter = {};
  if (q.key) filter.key = q.key;
  if (q.status) filter.status = q.status;
  const { items, meta } = await paginate(AcademicPolicy, filter, { page: q.page, limit: q.limit, sort: buildSort(q.sort, ['key', 'status', 'createdAt'], 'key') });
  ok(res, items, meta);
}));

policies.post('/', requirePermission('policies.write', { min: 'faculty' }),
  validate({ body: z.object({ key, description: z.string().optional(), value: z.any(), scope: scopeSchema, source: z.string().optional(), effectiveFrom: z.coerce.date().optional() }) }),
  asyncHandler(async (req, res) => {
    const doc = await withTransaction(async (session) => {
      const [p] = await AcademicPolicy.create([{ ...req.body, status: 'pending_confirmation' }], { session });
      await audit.record({ req, action: 'policy.create', entityType: 'AcademicPolicy', entityId: p._id, after: p }, { session });
      return p;
    });
    clearPolicyCache();
    created(res, doc);
  }));

policies.post('/:id/approve', requirePermission('policies.write', { min: 'faculty' }), validate({ params: idParams, body: z.object({ reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const doc = await withTransaction(async (session) => {
      const p = await AcademicPolicy.findById(req.params.id).session(session);
      if (!p) throw notFound('Policy not found.');
      if (p.status === 'active') throw conflict('This policy is already active.');
      const before = p.toObject();
      // Approving a policy retires the previous active one for the same key and scope.
      await AcademicPolicy.updateMany({ key: p.key, status: 'active', 'scope.programme': p.scope && p.scope.programme, 'scope.department': p.scope && p.scope.department, _id: { $ne: p._id } }, { status: 'retired' }, { session });
      p.status = 'active';
      p.approvedBy = req.user.id;
      p.approvedAt = new Date();
      await p.save({ session });
      await audit.record({ req, action: 'policy.approve', entityType: 'AcademicPolicy', entityId: p._id, before, after: p, reason: req.body.reason }, { session });
      return p;
    });
    clearPolicyCache();
    ok(res, doc);
  }));

policies.post('/:id/retire', requirePermission('policies.write', { min: 'faculty' }), validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const doc = await withTransaction(async (session) => {
      const p = await AcademicPolicy.findById(req.params.id).session(session);
      if (!p) throw notFound('Policy not found.');
      const before = p.toObject();
      p.status = 'retired';
      await p.save({ session });
      await audit.record({ req, action: 'policy.retire', entityType: 'AcademicPolicy', entityId: p._id, before, after: p }, { session });
      return p;
    });
    clearPolicyCache();
    ok(res, doc);
  }));

const settings = express.Router();
settings.get('/', requirePermission('system.settings', { min: 'system' }), asyncHandler(async (req, res) => ok(res, await Setting.find({}).lean())));
settings.put('/:key', requirePermission('system.settings', { min: 'system' }), validate({ body: z.object({ value: z.any(), reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const before = await Setting.findOne({ key: req.params.key }).lean();
    const doc = await Setting.findOneAndUpdate({ key: req.params.key }, { value: req.body.value }, { upsert: true, returnDocument: 'after' });
    await audit.record({ req, action: 'setting.update', entityType: 'SystemSetting', entityId: req.params.key, before, after: doc, reason: req.body.reason });
    ok(res, doc);
  }));

module.exports = { routes: [{ path: 'policies', router: policies }, { path: 'settings', router: settings }] };
