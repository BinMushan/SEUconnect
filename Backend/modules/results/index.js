const express = require('express');
const service = require('./service');
const { GradeRecord } = require('./model');
const engine = require('./resultEngine');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created, notFound, conflict } = require('../../core/http');
const { requirePermission, extendCatalog } = require('../../core/rbac');
const hooks = require('../../core/hooks');

// The catalogue gives results.approve only to the Dean; the Faculty Administrator may approve too ("Dean / Faculty Admin").
extendCatalog({ grants: { faculty_admin: [{ key: 'results.approve', scope: 'faculty' }, { key: 'results.verify', scope: 'faculty' }] } });

const COMPONENT_RULES = z.enum(engine.ROUNDING_MODES);
const policyBody = z.object({
  name: z.string().trim().min(2),
  scope: z.object({ programme: objectId.nullable().optional() }).optional(),
  bands: z.array(z.object({ min: z.number(), max: z.number(), grade: z.string().trim().min(1), gradePoint: z.number().min(0), fail: z.boolean().optional() })).min(1),
  rounding: z.object({ mode: COMPONENT_RULES.nullable().optional(), decimals: z.number().int().min(0).max(6).nullable().optional(), applyTo: z.array(z.enum(['componentMark', 'courseMark'])).optional() }).optional(),
  passRule: z.enum(['all_components', 'course_mark_only']).optional(),
  gpaRules: z.object({ repeatHandling: z.enum(['best', 'latest', 'all']).nullable().optional(), excludeCourseTypes: z.array(z.enum(['A', 'B', 'C'])).optional(), countFailedCredits: z.boolean().optional(), gpaDecimals: z.number().int().min(0).max(6).nullable().optional(), gpaRounding: COMPONENT_RULES.nullable().optional() }).optional(),
  notes: z.string().optional(),
});

/* ----------------------------- grade policies ----------------------------- */
const policies = express.Router();
policies.get('/', requirePermission('results.read'), validate({ query: listQuery.and(z.object({ status: z.enum(['draft', 'active', 'retired']).optional() })) }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.listPolicies(req, req.valid.query);
  ok(res, items, meta);
}));
policies.post('/', requirePermission('gradepolicy.manage', { min: 'faculty' }), validate({ body: policyBody }), asyncHandler(async (req, res) => created(res, await service.createPolicy(req, req.body))));
policies.get('/:id', requirePermission('results.read'), validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.getPolicy(req.params.id))));
policies.post('/:id/approve', requirePermission('gradepolicy.manage', { min: 'faculty' }), validate({ params: idParams, body: z.object({ reason: z.string().optional() }) }), asyncHandler(async (req, res) => ok(res, await service.approvePolicy(req, req.params.id, req.body.reason))));
policies.post('/:id/retire', requirePermission('gradepolicy.manage', { min: 'faculty' }), validate({ params: idParams, body: z.object({ reason: z.string().optional() }) }), asyncHandler(async (req, res) => ok(res, await service.retirePolicy(req, req.params.id, req.body.reason))));

/* -------------------------------- results -------------------------------- */
const results = express.Router();
const read = requirePermission('results.read');
const submit = requirePermission('results.submit', { min: 'assigned' });
const verify = requirePermission('results.verify', { min: 'department' });
const approve = requirePermission('results.approve', { min: 'department' });
const publish = requirePermission('results.publish', { min: 'faculty' });
const idsBody = z.object({ ids: z.array(objectId).min(1).max(500), remarks: z.string().trim().optional() });

results.post('/calculate', submit, validate({ body: z.object({ offering: objectId, students: z.array(objectId).max(500).optional() }) }), asyncHandler(async (req, res) => ok(res, await service.calculate(req, req.body))));
results.post('/submit', submit, validate({ body: idsBody }), asyncHandler(async (req, res) => ok(res, await service.moveRecords(req, { ...req.body, to: 'submitted' }))));
results.post('/verify', verify, validate({ body: idsBody }), asyncHandler(async (req, res) => ok(res, await service.moveRecords(req, { ...req.body, to: 'verified' }))));
results.post('/approve', approve, validate({ body: idsBody }), asyncHandler(async (req, res) => ok(res, await service.moveRecords(req, { ...req.body, to: 'approved' }))));
results.post('/publish', publish, validate({ body: idsBody }), asyncHandler(async (req, res) => ok(res, await service.moveRecords(req, { ...req.body, to: 'published' }))));
results.post('/return', verify, validate({ body: idsBody.extend({ remarks: z.string().trim().min(3) }) }), asyncHandler(async (req, res) => ok(res, await service.moveRecords(req, { ...req.body, to: 'draft' }))));

const listSchema = listQuery.and(z.object({ offering: objectId.optional(), student: objectId.optional(), state: z.enum(['draft', 'submitted', 'verified', 'approved', 'published']).optional(), course: objectId.optional(), semester: objectId.optional() }));
results.get('/', read, validate({ query: listSchema }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));
results.get('/me', read, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));
results.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
results.post('/:id/corrections', submit, validate({ params: idParams, body: z.object({ reason: z.string().trim().min(5) }) }), asyncHandler(async (req, res) => created(res, await service.requestCorrection(req, req.params.id, req.body.reason))));
results.post('/:id/corrections/:cid/decision', approve, validate({ params: z.object({ id: objectId, cid: objectId }), body: z.object({ decision: z.enum(['approve', 'reject']), remarks: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decideCorrection(req, req.params.id, req.params.cid, req.body))));

/* ---------------------------- GPA and transcripts ---------------------------- */
const gpa = express.Router();
const gpaRead = requirePermission('gpa.read');
gpa.get('/me', gpaRead, asyncHandler(async (req, res) => ok(res, await service.gpaOf(req, req.access.studentId))));
gpa.get('/:studentId', gpaRead, validate({ params: z.object({ studentId: objectId }) }), asyncHandler(async (req, res) => ok(res, await service.gpaOf(req, req.params.studentId))));
const transcripts = express.Router();
transcripts.get('/me', gpaRead, asyncHandler(async (req, res) => ok(res, await service.transcript(req, req.access.studentId))));
transcripts.get('/:studentId', gpaRead, validate({ params: z.object({ studentId: objectId }) }), asyncHandler(async (req, res) => ok(res, await service.transcript(req, req.params.studentId))));

// Generic request engine hook: an approved 'result_correction' request reopens the published result (history kept).
hooks.registerRequestHandler('result_correction', {
  async validate({ payload }) {
    const record = await GradeRecord.findById(payload && payload.recordId);
    if (!record) throw notFound('Result not found.');
    if (record.state !== 'published') throw conflict('Only published results need a correction request.');
    return payload;
  },
  async onApproved({ request, req, session }) {
    const record = await GradeRecord.findById(request.payload.recordId).session(session);
    if (!record || record.state !== 'published') throw conflict('The result is no longer published.');
    await service.openCorrection({ record, by: req.user.id, reason: request.payload.reason || `Request ${request._id}`, session });
  },
});

module.exports = { routes: [{ path: 'grade-policies', router: policies }, { path: 'results', router: results }, { path: 'gpa', router: gpa }, { path: 'transcripts', router: transcripts }] };
