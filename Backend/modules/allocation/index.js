const express = require('express');
const service = require('./service');
const Student = require('../../models/Student');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created, badRequest, forbidden } = require('../../core/http');
const { requirePermission, requireAnyPermission, extendCatalog } = require('../../core/rbac');
const { withTransaction } = require('../../core/transaction');
const hooks = require('../../core/hooks');

// Faculty administrators may also decide manual changes (HODs decide within their department).
extendCatalog({ grants: { faculty_admin: [{ key: 'allocations.change', scope: 'faculty' }] } });

const read = requirePermission('allocations.read');
const apply = requirePermission('allocations.apply');
const manage = requirePermission('allocations.manage', { min: 'faculty' });
// Runs show every applicant, so students (own scope) never reach them.
const readRuns = requirePermission('allocations.read', { min: 'department' });
const decide = requirePermission('allocations.change', { min: 'department' });
const submitChangePerm = requireAnyPermission(['allocations.apply', 'allocations.change']);

const router = express.Router();
const wrap = (fn) => asyncHandler(async (req, res) => fn(req, res));

/* -------- rounds (application windows) -------- */
router.get('/rounds', read, validate({ query: listQuery }), wrap(async (req, res) => {
  const { items, meta } = await service.listRounds(req, req.valid.query);
  ok(res, items, meta);
}));
router.get('/rounds/:id', read, validate({ params: idParams }), wrap(async (req, res) => ok(res, await service.getRound(req.params.id))));
router.post('/rounds', manage, validate({ body: z.object({ programme: objectId, batch: objectId, name: z.string().trim().optional(), opensAt: z.coerce.date().optional(), closesAt: z.coerce.date().optional() })
  .refine((v) => !v.opensAt || !v.closesAt || v.closesAt > v.opensAt, { message: 'closesAt must be after opensAt', path: ['closesAt'] }) }),
  wrap(async (req, res) => created(res, await service.createRound(req, req.body))));
router.post('/rounds/:id/transition', manage, validate({ params: idParams, body: z.object({ to: z.enum(['open', 'closed']), reason: z.string().optional() }) }),
  wrap(async (req, res) => ok(res, await service.transitionRound(req, req.params.id, req.body.to, req.body.reason))));

/* -------- capacities (seats) -------- */
router.get('/capacities', read, validate({ query: listQuery }), wrap(async (req, res) => {
  const { items, meta } = await service.listCapacities(req.valid.query);
  ok(res, items, meta);
}));
router.put('/capacities', manage, validate({ body: z.object({ specialization: objectId, batch: objectId, seats: z.number().int().min(0).max(10000) }) }),
  wrap(async (req, res) => ok(res, await service.setCapacity(req, req.body))));

/* -------- applications -------- */
router.get('/applications', read, validate({ query: listQuery }), wrap(async (req, res) => {
  const { items, meta } = await service.listApplications(req, req.valid.query);
  ok(res, items, meta);
}));
router.get('/applications/:id', read, validate({ params: idParams }), wrap(async (req, res) => ok(res, await service.getApplication(req, req.params.id))));
router.post('/applications', apply, wrap(async (req, res) => {
  // Students never self-report academic performance; officers record it (PUT /applications/:id/metrics).
  if (req.body && (req.body.metrics || req.body.gpa)) throw forbidden('Academic metrics are recorded by the faculty, not submitted by students.', 'METRICS_NOT_ALLOWED');
  const body = z.object({ round: objectId, preferences: z.array(objectId).min(1).max(20) }).parse(req.body);
  created(res, await service.submitApplication(req, body));
}));
router.put('/applications/:id/metrics', manage, validate({ params: idParams, body: z.object({ metrics: z.record(z.string(), z.number().finite()).refine((m) => Object.keys(m).length > 0, 'Provide at least one metric'), note: z.string().trim().min(3) }) }),
  wrap(async (req, res) => ok(res, await service.setMetrics(req, req.params.id, req.body))));
router.post('/applications/:id/withdraw', apply, validate({ params: idParams }), wrap(async (req, res) => ok(res, await service.withdrawApplication(req, req.params.id))));

/* -------- runs -------- */
router.post('/runs/dry-run', manage, validate({ body: z.object({ round: objectId }) }), wrap(async (req, res) => ok(res, await service.dryRun(req, req.body.round))));
router.post('/runs', manage, validate({ body: z.object({ round: objectId }) }), wrap(async (req, res) => created(res, await service.createRun(req, req.body.round))));
router.get('/runs', readRuns, validate({ query: listQuery }), wrap(async (req, res) => {
  const { items, meta } = await service.listRuns(req, req.valid.query);
  ok(res, items, meta);
}));
router.get('/runs/:id', readRuns, validate({ params: idParams }), wrap(async (req, res) => ok(res, await service.getRunFor(req, req.params.id))));
router.post('/runs/:id/publish', manage, validate({ params: idParams }), wrap(async (req, res) => ok(res, await service.publishRun(req, req.params.id))));

/* -------- manual changes -------- */
router.get('/changes', read, validate({ query: listQuery }), wrap(async (req, res) => {
  const { items, meta } = await service.listChanges(req, req.valid.query);
  ok(res, items, meta);
}));
router.post('/changes', submitChangePerm, validate({ body: z.object({ student: objectId.optional(), to: objectId, requestReason: z.string().trim().min(5), attachments: z.array(z.string().trim().min(1)).max(10).optional() }) }),
  wrap(async (req, res) => created(res, await service.submitChange(req, req.body))));
router.post('/changes/:id/decision', decide, validate({ params: idParams, body: z.object({ decision: z.enum(['approve', 'reject']), decisionReason: z.string().trim().min(3) }) }),
  wrap(async (req, res) => ok(res, await service.decideChange(req, req.params.id, req.body))));

/* -------- allocations and history -------- */
router.get('/me', read, wrap(async (req, res) => {
  const { items } = await service.listAllocations(req, { page: 1, limit: 50 });
  ok(res, items);
}));
router.get('/history/:studentId', read, validate({ params: z.object({ studentId: objectId }) }), wrap(async (req, res) => ok(res, await service.history(req, req.params.studentId))));
router.get('/', read, validate({ query: listQuery }), wrap(async (req, res) => {
  const { items, meta } = await service.listAllocations(req, req.valid.query);
  ok(res, items, meta);
}));

/* -------- generic request engine integration -------- */
// When the Request / approval engine finally approves a request of this type, the same change logic runs.
const studentOf = async (requester, payload, session) => {
  if (payload && payload.student) return String(payload.student);
  const userId = requester && (requester._id || requester.id || requester);
  const s = userId && /^[0-9a-f]{24}$/i.test(String(userId)) ? await Student.findOne({ user: userId }).select('_id').session(session || null).lean() : null;
  return s ? String(s._id) : null;
};
hooks.registerRequestHandler('specialization_change', {
  async validate({ payload, requester, session }) {
    const p = payload || {};
    if (!p.to || !/^[0-9a-f]{24}$/i.test(String(p.to))) throw badRequest('Choose the specialization / majoring division you want to move to.', null, 'TARGET_REQUIRED');
    if (!p.requestReason || String(p.requestReason).trim().length < 5) throw badRequest('Explain why the change is needed.', null, 'REASON_REQUIRED');
    const student = await studentOf(requester, p, session);
    if (!student) throw badRequest('The request must belong to a student.', null, 'STUDENT_REQUIRED');
    return { ...p, student, attachments: Array.isArray(p.attachments) ? p.attachments.map(String) : [] };
  },
  async onApproved({ request, req, session }) {
    const p = request.payload || {};
    const studentId = await studentOf(request.requester, p, session);
    const run = (s) => service.applyChange({ req, session: s, studentId, toId: p.to, requestReason: p.requestReason, decisionReason: request.decisionRemarks || `Approved through request ${request._id}`, attachments: p.attachments || [], via: 'generic_request' });
    return session ? run(session) : withTransaction(run);
  },
});

module.exports = { routes: [{ path: 'allocations', router }] };
