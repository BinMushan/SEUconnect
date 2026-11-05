const express = require('express');
const service = require('./service');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');

const STATUS = z.enum(['Active', 'On Leave', 'Suspended', 'Graduated', 'Withdrawn']);

const router = express.Router();
const read = requirePermission('students.read');
const write = requirePermission('students.write', { min: 'department' });

router.get('/', read, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));

// The signed-in student's own record.
router.get('/me', read, asyncHandler(async (req, res) => ok(res, await service.get(req, req.access.studentId))));

router.post('/', write, validate({ body: z.object({
  studentId: z.string().trim().min(3), registrationNo: z.string().trim().optional(), indexNo: z.string().trim().optional(),
  fullName: z.string().trim().min(2), email: z.string().trim().toLowerCase().email(),
  departmentRef: objectId, programmeRef: objectId, batchRef: objectId, specializationRef: objectId.nullable().optional(),
  admissionYear: z.number().int().optional(), currentYear: z.number().int().min(1).max(8).optional(), currentSemesterNumber: z.number().int().min(1).max(4).optional(),
  contact: z.object({ phone: z.string().optional(), address: z.string().optional(), personalEmail: z.string().optional() }).optional(),
  createAccount: z.boolean().optional(),
}) }), asyncHandler(async (req, res) => created(res, await service.create(req, req.body))));

router.post('/progression', requirePermission('students.write', { min: 'faculty' }),
  validate({ body: z.object({ batch: objectId, toYear: z.number().int().min(1).max(8).optional(), toSemester: z.number().int().min(1).max(4).optional(), graduate: z.boolean().optional() })
    .refine((v) => v.graduate || (v.toYear && v.toSemester), { message: 'Provide toYear and toSemester, or graduate:true' }) }),
  asyncHandler(async (req, res) => ok(res, await service.progress(req, req.body))));

router.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
router.get('/:id/history', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.history(req, req.params.id))));
router.patch('/:id', write, validate({ params: idParams, body: z.object({
  fullName: z.string().trim().min(2), departmentRef: objectId, programmeRef: objectId, batchRef: objectId, specializationRef: objectId.nullable(),
  contact: z.object({ phone: z.string(), address: z.string(), personalEmail: z.string() }).partial(), currentYear: z.number().int().min(1).max(8), currentSemesterNumber: z.number().int().min(1).max(4),
}).partial() }), asyncHandler(async (req, res) => ok(res, await service.update(req, req.params.id, req.body))));
router.post('/:id/status', write, validate({ params: idParams, body: z.object({ status: STATUS, reason: z.string().trim().min(3) }) }),
  asyncHandler(async (req, res) => ok(res, await service.setStatus(req, req.params.id, req.body.status, req.body.reason))));

module.exports = { routes: [{ path: 'students', router }] };
