const express = require('express');
const service = require('./service');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission, extendCatalog } = require('../../core/rbac');

// The catalogue defines assessments.approve but grants it to nobody; marks are approved by the HOD / Dean / Faculty Administrator.
extendCatalog({
  grants: {
    hod: [{ key: 'assessments.approve', scope: 'department' }],
    dean: [{ key: 'assessments.approve', scope: 'faculty' }],
    faculty_admin: [{ key: 'assessments.approve', scope: 'faculty' }, { key: 'assessments.verify', scope: 'faculty' }],
  },
});

const router = express.Router();
const read = requirePermission('assessments.read');
const write = requirePermission('assessments.write', { min: 'assigned' });
const verify = requirePermission('assessments.verify', { min: 'department' });
const approve = requirePermission('assessments.approve', { min: 'department' });
const COMPONENT = z.enum(['theory', 'practical']);
const TYPES = z.enum(['assignment', 'quiz', 'midterm', 'presentation', 'practical', 'lab_report', 'project', 'other']);

const body = z.object({
  offering: objectId, componentType: COMPONENT, name: z.string().trim().min(2), type: TYPES.optional(),
  maxMarks: z.number().positive(), weight: z.number().positive(), deadline: z.coerce.date().nullable().optional(), assignedStaff: objectId.optional(),
});

router.get('/ca-summary', read, validate({ query: z.object({ offering: objectId, componentType: COMPONENT, student: objectId.optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.caSummary(req, req.valid.query))));

router.get('/', read, validate({ query: listQuery.and(z.object({ offering: objectId.optional(), componentType: COMPONENT.optional(), status: z.string().optional(), type: TYPES.optional() })) }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.list(req, req.valid.query);
    ok(res, items, meta);
  }));
router.post('/', write, validate({ body }), asyncHandler(async (req, res) => created(res, await service.createAssessment(req, req.body))));
router.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
router.patch('/:id', write, validate({ params: idParams, body: body.omit({ offering: true, componentType: true }).partial() }), asyncHandler(async (req, res) => ok(res, await service.update(req, req.params.id, req.body))));

router.get('/:id/marks', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.getMarks(req, req.params.id))));
router.put('/:id/marks', write, validate({ params: idParams, body: z.object({ marks: z.array(z.object({ student: objectId, marks: z.number().nullable().optional(), absent: z.boolean().optional(), reason: z.string().trim().optional() })).min(1).max(500) }) }),
  asyncHandler(async (req, res) => ok(res, await service.putMarks(req, req.params.id, req.body.marks))));

const reason = z.object({ reason: z.string().trim().optional() });
router.post('/:id/open', write, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'open', req.body.reason))));
router.post('/:id/submit', write, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'submitted', req.body.reason))));
router.post('/:id/verify', verify, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'verified', req.body.reason))));
router.post('/:id/approve', approve, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'approved', req.body.reason))));
router.post('/:id/lock', approve, validate({ params: idParams, body: reason }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'locked', req.body.reason))));
// reviewers send marks back for rework (reason required)
router.post('/:id/return', verify, validate({ params: idParams, body: z.object({ reason: z.string().trim().min(3) }) }), asyncHandler(async (req, res) => ok(res, await service.transition(req, req.params.id, 'open', req.body.reason))));

router.post('/:id/corrections', write, validate({ params: idParams, body: z.object({ student: objectId, marks: z.number().nullable().optional(), absent: z.boolean().optional(), reason: z.string().trim().min(5) }) }),
  asyncHandler(async (req, res) => created(res, await service.requestCorrection(req, req.params.id, req.body))));
router.post('/:id/corrections/:cid/decision', approve, validate({ params: z.object({ id: objectId, cid: objectId }), body: z.object({ decision: z.enum(['approve', 'reject']), remarks: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decideCorrection(req, req.params.id, req.params.cid, req.body))));

module.exports = { routes: [{ path: 'assessments', router }] };
