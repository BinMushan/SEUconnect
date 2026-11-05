const express = require('express');
const service = require('./service');
const { RESPONSIBILITIES } = require('./model');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');

const router = express.Router();
const read = requirePermission('staff.read');
const write = requirePermission('staff.write', { min: 'department' });

router.get('/', read, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));
router.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));

router.post('/', write, validate({ body: z.object({
  staffId: z.string().trim().min(2), fullName: z.string().trim().min(2), email: z.string().trim().toLowerCase().email(), phone: z.string().optional(),
  department: objectId, designation: z.string().trim().optional(), employmentStatus: z.enum(['active', 'on_leave', 'retired', 'resigned']).optional(),
  createAccount: z.boolean().optional(), role: z.string().trim().optional(),
}) }), asyncHandler(async (req, res) => {
  const result = await service.create(req, req.body);
  created(res, result);
}));

router.patch('/:id', write, validate({ params: idParams, body: z.object({
  fullName: z.string().trim().min(2), phone: z.string(), department: objectId, designation: z.string(),
  employmentStatus: z.enum(['active', 'on_leave', 'retired', 'resigned']), accountStatus: z.enum(['active', 'suspended', 'disabled']),
}).partial() }), asyncHandler(async (req, res) => ok(res, await service.update(req, req.params.id, req.body))));

router.post('/:id/responsibilities', write, validate({ params: idParams, body: z.object({ type: z.enum(RESPONSIBILITIES), department: objectId.optional(), from: z.coerce.date().optional(), reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => created(res, await service.addResponsibility(req, req.params.id, req.body))));
router.post('/:id/responsibilities/:rid/end', write, validate({ params: z.object({ id: objectId, rid: objectId }), body: z.object({ reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.endResponsibility(req, req.params.id, req.params.rid, req.body.reason))));

module.exports = { routes: [{ path: 'staff', router }] };
