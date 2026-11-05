const express = require('express');
const AuditLog = require('./model');
const { z, validate } = require('../../core/validate');
const { listQuery, paginate } = require('../../core/pagination');
const { asyncHandler, ok } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');

// Read-only by design: there is no create / update / delete endpoint for audit records.
const router = express.Router();
router.get('/', requirePermission('audit.read', { min: 'faculty' }),
  validate({ query: listQuery.and(z.object({ entityType: z.string().optional(), entityId: z.string().optional(), action: z.string().optional(), actor: z.string().optional(), from: z.coerce.date().optional(), to: z.coerce.date().optional() })) }),
  asyncHandler(async (req, res) => {
    const q = req.valid.query;
    const filter = {};
    if (q.entityType) filter.entityType = q.entityType;
    if (q.entityId) filter.entityId = q.entityId;
    if (q.action) filter.action = q.action;
    if (q.actor) filter['actor.email'] = q.actor.toLowerCase();
    if (q.from || q.to) filter.at = { ...(q.from ? { $gte: q.from } : {}), ...(q.to ? { $lte: q.to } : {}) };
    const { items, meta } = await paginate(AuditLog, filter, { page: q.page, limit: q.limit, sort: { at: -1 } });
    ok(res, items, meta);
  }));

module.exports = { routes: [{ path: 'audit', router }] };
