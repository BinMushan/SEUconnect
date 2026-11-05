const express = require('express');
const service = require('./service');
const { AttendanceRecord } = require('./model');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created, notFound, conflict } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');
const hooks = require('../../core/hooks');

const router = express.Router();
const read = requirePermission('attendance.read');
const write = requirePermission('attendance.write', { min: 'assigned' });
const correct = requirePermission('attendance.correct', { min: 'assigned' });
const STATUS = z.enum(['present', 'absent', 'excused']);
const COMPONENT = z.enum(['theory', 'practical']);

router.get('/sessions', read, validate({ query: listQuery.and(z.object({ offering: objectId.optional(), componentType: COMPONENT.optional(), status: z.enum(['scheduled', 'conducted', 'cancelled']).optional(), from: z.string().optional(), to: z.string().optional() })) }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listSessions(req, req.valid.query);
    ok(res, items, meta);
  }));
router.post('/sessions', write, validate({ body: z.object({
  offering: objectId, componentType: COMPONENT, type: z.enum(['lecture', 'lab', 'tutorial', 'seminar', 'other']).optional(), title: z.string().trim().optional(),
  startsAt: z.coerce.date(), endsAt: z.coerce.date(), conductedBy: objectId.optional(),
}) }), asyncHandler(async (req, res) => created(res, await service.createSession(req, req.body))));
router.get('/sessions/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.getSession(req, req.params.id))));
router.post('/sessions/:id/cancel', write, validate({ params: idParams, body: z.object({ reason: z.string().trim().min(3) }) }), asyncHandler(async (req, res) => ok(res, await service.cancelSession(req, req.params.id, req.body.reason))));

router.get('/sessions/:id/records', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.listRecords(req, req.params.id))));
router.put('/sessions/:id/records', write, validate({ params: idParams, body: z.object({ records: z.array(z.object({ student: objectId, status: STATUS, reason: z.string().trim().optional() })).min(1).max(500) }) }),
  asyncHandler(async (req, res) => ok(res, await service.markRecords(req, req.params.id, req.body.records))));

router.get('/summary', read, validate({ query: z.object({ student: objectId.optional(), offering: objectId.optional() }).passthrough() }),
  asyncHandler(async (req, res) => ok(res, await service.summary(req, req.valid.query))));

router.get('/corrections', read, validate({ query: listQuery.and(z.object({ status: z.enum(['pending', 'approved', 'rejected']).optional(), offering: objectId.optional(), student: objectId.optional() })) }),
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listCorrections(req, req.valid.query);
    ok(res, items, meta);
  }));
// students request corrections to their own records; assigned staff may raise one on a student's behalf
router.post('/corrections', read, validate({ body: z.object({ record: objectId, requestedStatus: STATUS, reason: z.string().trim().min(5) }) }),
  asyncHandler(async (req, res) => created(res, await service.createCorrection(req, req.body))));
router.post('/corrections/:id/decision', correct, validate({ params: idParams, body: z.object({ decision: z.enum(['approve', 'reject']), remarks: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decideCorrection(req, req.params.id, req.body))));

// Generic request engine hook: an approved 'attendance_correction' request applies the status change.
hooks.registerRequestHandler('attendance_correction', {
  async validate({ payload }) {
    const record = await AttendanceRecord.findById(payload && payload.recordId);
    if (!record) throw notFound('Attendance record not found.');
    if (!['present', 'absent', 'excused'].includes(payload.requestedStatus)) throw conflict('requestedStatus must be present, absent or excused.');
    return payload;
  },
  async onApproved({ request, req, session }) {
    const record = await AttendanceRecord.findById(request.payload.recordId).session(session);
    if (!record) throw notFound('Attendance record not found.');
    await service.applyStatusChange({ req, record, status: request.payload.requestedStatus, reason: `Request ${request._id} approved: ${request.payload.reason || ''}`, session });
  },
});

module.exports = { routes: [{ path: 'attendance', router }] };
