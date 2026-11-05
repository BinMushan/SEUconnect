const express = require('express');
const service = require('./service');
const { AssessmentConfiguration, COURSE_CODE } = require('./model');
const { crudModule } = require('../../core/crud');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');

const courses = express.Router();
const read = requirePermission('courses.read');
const write = requirePermission('courses.write', { min: 'department' });

const courseBody = z.object({
  code: z.string().trim().toUpperCase().regex(COURSE_CODE, 'Course code must be three letters followed by five numerals (e.g. ICT21013)'),
  title: z.string().trim().min(2),
  description: z.string().optional(),
  credits: z.number().min(0).max(30),
  type: z.enum(['A', 'B', 'C']),
  department: objectId,
  programme: objectId,
  specialization: objectId.nullable().optional(),
  defaultYear: z.number().int().min(1).max(8),
  defaultSemester: z.number().int().min(1).max(4),
  coordinator: objectId.nullable().optional(),
});

courses.get('/', read, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.listCourses(req, req.valid.query);
  ok(res, items, meta);
}));
courses.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.getCourse(req, req.params.id))));
courses.post('/', write, validate({ body: courseBody }), asyncHandler(async (req, res) => created(res, await service.createCourse(req, req.body))));
courses.patch('/:id', write, validate({ params: idParams, body: courseBody.omit({ code: true }).partial().extend({ status: z.enum(['active', 'inactive', 'archived']).optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.updateCourse(req, req.params.id, req.body))));
courses.post('/:id/archive', write, validate({ params: idParams, body: z.object({ reason: z.string().optional() }) }), asyncHandler(async (req, res) => ok(res, await service.archiveCourse(req, req.params.id, req.body.reason))));
courses.put('/:id/prerequisites', write, validate({ params: idParams, body: z.object({ prerequisites: z.array(objectId).max(20) }) }),
  asyncHandler(async (req, res) => ok(res, await service.setPrerequisites(req, req.params.id, req.body.prerequisites))));

// Assessment configurations (reusable CA / ESA structures)
const configSchema = z.object({
  name: z.string().trim().min(2), description: z.string().optional(),
  caWeight: z.number().min(0).max(100), esaWeight: z.number().min(0).max(100),
  minCaPercent: z.number().min(0).max(100).nullable().optional(), minEsaPercent: z.number().min(0).max(100).nullable().optional(), minFinalPercent: z.number().min(0).max(100).nullable().optional(),
});
const configs = crudModule({
  model: AssessmentConfiguration,
  entityType: 'AssessmentConfiguration',
  permission: { read: 'courses.read', write: 'courses.write' },
  schemas: { create: configSchema, update: configSchema.partial() },
  filterFields: ['status'],
  searchFields: ['name'],
  sortable: ['name', 'createdAt'],
  beforeCreate: async (req, body) => service.prepareConfig(body),
  beforeUpdate: async (req, doc, patch) => {
    const merged = { caWeight: doc.caWeight, esaWeight: doc.esaWeight, ...patch };
    await service.prepareConfig({ ...merged });
    return patch;
  },
});

// Offerings and staff assignments
const offerings = express.Router();
const offeringRead = requirePermission('offerings.read');
const offeringWrite = requirePermission('offerings.write', { min: 'department' });
const assignWrite = requirePermission('assignments.write', { min: 'department' });
const componentSchema = z.object({ type: z.enum(['theory', 'practical']), assessmentConfiguration: objectId, weightInCourse: z.number().min(0).max(100) });

offerings.get('/', offeringRead, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.listOfferings(req, req.valid.query);
  ok(res, items, meta);
}));
offerings.get('/:id', offeringRead, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.getOffering(req, req.params.id))));
offerings.post('/', offeringWrite, validate({ body: z.object({ course: objectId, semester: objectId, batch: objectId, capacity: z.number().int().min(1).nullable().optional(), coordinator: objectId.nullable().optional(), status: z.enum(['planned', 'open']).optional(), components: z.array(componentSchema).min(1).max(2) }) }),
  asyncHandler(async (req, res) => created(res, await service.createOffering(req, req.body))));
offerings.patch('/:id', offeringWrite, validate({ params: idParams, body: z.object({ capacity: z.number().int().min(1).nullable(), components: z.array(componentSchema).min(1).max(2) }).partial() }),
  asyncHandler(async (req, res) => ok(res, await service.updateOffering(req, req.params.id, req.body))));
offerings.post('/:id/transition', offeringWrite, validate({ params: idParams, body: z.object({ to: z.enum(['open', 'running', 'completed', 'cancelled']), reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.transitionOffering(req, req.params.id, req.body.to, req.body.reason))));

offerings.get('/:id/assignments', offeringRead, validate({ params: idParams, query: z.object({ history: z.enum(['true', 'false']).optional() }).passthrough() }),
  asyncHandler(async (req, res) => ok(res, await service.listAssignments(req, req.params.id, { history: req.valid.query.history === 'true' }))));
offerings.post('/:id/assignments', assignWrite, validate({ params: idParams, body: z.object({ componentType: z.enum(['theory', 'practical']), staff: objectId, role: z.enum(['lecturer', 'demonstrator', 'coordinator']), note: z.string().optional(), replace: z.boolean().optional() }) }),
  asyncHandler(async (req, res) => created(res, await service.assignStaff(req, req.params.id, req.body))));
offerings.post('/:id/assignments/:aid/end', assignWrite, validate({ params: z.object({ id: objectId, aid: objectId }), body: z.object({ reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.endAssignment(req, req.params.id, req.params.aid, req.body.reason))));

module.exports = { routes: [{ path: 'courses', router: courses }, { path: 'assessment-configurations', router: configs.router }, { path: 'offerings', router: offerings }] };
