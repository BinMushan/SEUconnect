const express = require('express');
const service = require('./service');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission, requireAnyPermission } = require('../../core/rbac');

const router = express.Router();
const read = requirePermission('registrations.read');
const create = requirePermission('registrations.create');
const decide = requirePermission('registrations.decide', { min: 'department' });
// A student acts on their own registration; an officer (HOD / faculty admin) may act on a student's behalf.
const change = requireAnyPermission(['registrations.create', 'registrations.decide']);

router.get('/', read, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));

// Offerings the student may register for, with the rule problems that would apply today.
router.get('/eligible-offerings', create, validate({ query: z.object({ student: objectId.optional() }).passthrough() }),
  asyncHandler(async (req, res) => ok(res, await service.eligibleOfferings(req, req.valid.query.student))));

router.post('/', create, validate({ body: z.object({
  offering: objectId, student: objectId.optional(),
  exception: z.object({ requested: z.boolean(), note: z.string().trim().max(1000).optional() }).optional(),
}) }), asyncHandler(async (req, res) => created(res, await service.register(req, req.body))));

router.post('/decisions', decide, validate({ body: z.object({ ids: z.array(objectId).min(1).max(200), decision: z.enum(['approve', 'reject']), remarks: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decideMany(req, req.body.ids, req.body))));

router.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
router.post('/:id/drop', change, validate({ params: idParams, body: z.object({ reason: z.string().trim().optional() }) }), asyncHandler(async (req, res) => ok(res, await service.drop(req, req.params.id, req.body.reason))));
router.post('/:id/cancel', change, validate({ params: idParams, body: z.object({ reason: z.string().trim().optional() }) }), asyncHandler(async (req, res) => ok(res, await service.cancel(req, req.params.id, req.body.reason))));
router.post('/:id/decision', decide, validate({ params: idParams, body: z.object({ decision: z.enum(['approve', 'reject']), remarks: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decide(req, req.params.id, req.body))));

module.exports = { routes: [{ path: 'registrations', router }] };
