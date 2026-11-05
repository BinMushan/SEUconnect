const express = require('express');
const service = require('./service');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');

const router = express.Router();
const read = requirePermission('esa.read');
const write = requirePermission('esa.write', { min: 'assigned' });
// verification / approval of ESA marks use the same permissions as CA marks (granted to HOD / Dean / Faculty Administrator)
const verify = requirePermission('assessments.verify', { min: 'department' });
const approve = requirePermission('assessments.approve', { min: 'department' });
const COMPONENT = z.enum(['theory', 'practical']);
const FORMAT = z.enum(['written', 'practical', 'oral', 'other']);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');

const body = z.object({
  offering: objectId, componentType: COMPONENT, format: FORMAT, title: z.string().trim().optional(), date: z.coerce.date(),
  startTime: time, endTime: time, venue: z.string().trim().min(1), maxMarks: z.number().positive().optional(), invigilators: z.array(objectId).max(20).optional(),
});

router.get('/schedules', read, validate({ query: listQuery.and(z.object({ offering: objectId.optional(), componentType: COMPONENT.optional(), status: z.string().optional(), format: FORMAT.optional(), from: z.string().optional(), to: z.string().optional() })) }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.list(req, req.valid.query);
    ok(res, items, meta);
  }));
router.post('/schedules', write, validate({ body }), asyncHandler(async (req, res) => created(res, await service.createSchedule(req, req.body))));
router.get('/schedules/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
router.patch('/schedules/:id', write, validate({ params: idParams, body: body.omit({ offering: true, componentType: true }).partial() }), asyncHandler(async (req, res) => ok(res, await service.update(req, req.params.id, req.body))));
router.post('/schedules/:id/cancel', write, validate({ params: idParams, body: z.object({ reason: z.string().trim().min(3) }) }), asyncHandler(async (req, res) => ok(res, await service.cancel(req, req.params.id, req.body.reason))));
router.get('/schedules/:id/eligibility', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.eligibility(req, req.params.id))));

router.get('/schedules/:id/marks', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.getMarks(req, req.params.id))));
router.put('/schedules/:id/marks', write, validate({ params: idParams, body: z.object({ marks: z.array(z.object({
  student: objectId, marks: z.number().nullable().optional(), absent: z.boolean().optional(), reason: z.string().trim().optional(), eligibilityOverride: z.object({ reason: z.string().trim().min(5) }).optional(),
})).min(1).max(500) }) }), asyncHandler(async (req, res) => ok(res, await service.putMarks(req, req.params.id, req.body.marks))));

const reason = z.object({ reason: z.string().trim().optional() });
router.post('/schedules/:id/open', write, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'open', req.body.reason))));
router.post('/schedules/:id/submit', write, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'submitted', req.body.reason))));
router.post('/schedules/:id/verify', verify, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'verified', req.body.reason))));
router.post('/schedules/:id/approve', approve, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'approved', req.body.reason))));
router.post('/schedules/:id/lock', approve, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'locked', req.body.reason))));
router.post('/schedules/:id/return', verify, validate({ params: idParams, body: z.object({ reason: z.string().trim().min(3) }) }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'open', req.body.reason))));

router.post('/schedules/:id/corrections', write, validate({ params: idParams, body: z.object({ student: objectId, marks: z.number().nullable().optional(), absent: z.boolean().optional(), reason: z.string().trim().min(5) }) }),
  asyncHandler(async (req, res) => created(res, await service.requestCorrection(req, req.params.id, req.body))));
router.post('/schedules/:id/corrections/:cid/decision', approve, validate({ params: z.object({ id: objectId, cid: objectId }), body: z.object({ decision: z.enum(['approve', 'reject']), remarks: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decideCorrection(req, req.params.id, req.params.cid, req.body))));

module.exports = { routes: [{ path: 'esa', router }] };
