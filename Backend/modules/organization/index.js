const express = require('express');
const { crudModule } = require('../../core/crud');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { asyncHandler, ok, badRequest, conflict, notFound } = require('../../core/http');
const { requirePermission } = require('../../core/rbac');
const { withTransaction } = require('../../core/transaction');
const audit = require('../../core/audit');
const { Department, DegreeProgramme, Specialization, AcademicBatch, AcademicYear, Semester } = require('./model');

const status = z.enum(['active', 'archived']);
const date = z.coerce.date();
const upper = (min, max) => z.string().trim().toUpperCase().regex(new RegExp(`^[A-Z0-9]{${min},${max}}$`), 'Use capital letters/digits only');

const ORG = { read: 'org.read', write: 'org.write' };
// Organisation master data is faculty-level: department-scoped users (HODs) may read it, not rewrite it.
const FACULTY = { writeMin: 'faculty' };

const departments = crudModule({
  model: Department,
  entityType: 'Department',
  permission: ORG,
  ...FACULTY,
  schemas: {
    create: z.object({ code: upper(2, 10), name: z.string().trim().min(2), shortName: z.string().trim().optional(), head: objectId.optional(), status: status.optional() }),
    update: z.object({ name: z.string().trim().min(2), shortName: z.string().trim(), head: objectId.nullable(), status }).partial(),
  },
  filterFields: ['status', 'code'],
  searchFields: ['name', 'code'],
  sortable: ['code', 'name', 'createdAt'],
});

const programmes = crudModule({
  model: DegreeProgramme,
  entityType: 'DegreeProgramme',
  permission: ORG,
  ...FACULTY,
  schemas: {
    create: z.object({
      code: upper(2, 10),
      name: z.string().trim().min(2),
      department: objectId,
      durationYears: z.number().int().min(1).max(8).optional(),
      semestersPerYear: z.number().int().min(1).max(4).optional(),
      specializationStarts: z.object({ year: z.number().int().min(1), semester: z.number().int().min(1) }).optional(),
    }),
    update: z
      .object({
        name: z.string().trim().min(2),
        department: objectId,
        durationYears: z.number().int().min(1).max(8),
        semestersPerYear: z.number().int().min(1).max(4),
        specializationStarts: z.object({ year: z.number().int().min(1), semester: z.number().int().min(1) }),
        status,
      })
      .partial(),
  },
  filterFields: ['department', 'status', 'code'],
  searchFields: ['name', 'code'],
  sortable: ['code', 'name', 'createdAt'],
  populate: { path: 'department', select: 'code name' },
  beforeCreate: async (req, body, session) => {
    if (!(await Department.exists({ _id: body.department, status: 'active' }).session(session))) {
      throw badRequest('The department does not exist or is archived.', null, 'DEPARTMENT_INVALID');
    }
    return body;
  },
});

const specializations = crudModule({
  model: Specialization,
  entityType: 'Specialization',
  permission: ORG,
  ...FACULTY,
  schemas: {
    create: z.object({ programme: objectId, code: upper(2, 10), name: z.string().trim().min(2), kind: z.enum(['specialization', 'majoring']) }),
    update: z.object({ name: z.string().trim().min(2), status }).partial(),
  },
  filterFields: ['programme', 'kind', 'status', 'code'],
  searchFields: ['name', 'code'],
  sortable: ['code', 'name', 'createdAt'],
  populate: { path: 'programme', select: 'code name' },
  beforeCreate: async (req, body, session) => {
    if (!(await DegreeProgramme.exists({ _id: body.programme }).session(session))) throw badRequest('The degree programme does not exist.', null, 'PROGRAMME_INVALID');
    return body;
  },
});

const batches = crudModule({
  model: AcademicBatch,
  entityType: 'AcademicBatch',
  permission: ORG,
  ...FACULTY,
  schemas: {
    create: z.object({
      programme: objectId,
      intakeYear: z.number().int().min(1990).max(2200),
      label: z.string().trim().optional(),
      currentAcademicYear: z.number().int().min(1).max(8).optional(),
    }),
    update: z.object({ label: z.string().trim(), currentAcademicYear: z.number().int().min(1).max(8), status: z.enum(['active', 'graduated', 'archived']) }).partial(),
  },
  filterFields: ['programme', 'status', 'intakeYear'],
  sortable: ['intakeYear', 'createdAt'],
  populate: { path: 'programme', select: 'code name' },
  beforeCreate: async (req, body, session) => {
    if (!(await DegreeProgramme.exists({ _id: body.programme }).session(session))) throw badRequest('The degree programme does not exist.', null, 'PROGRAMME_INVALID');
    return { ...body, label: body.label || `${body.intakeYear} intake` };
  },
});

const yearSchema = z.object({
  label: z.string().trim().regex(/^\d{4}\/\d{4}$/, 'Use the form 2025/2026'),
  startDate: date,
  endDate: date,
  status: z.enum(['planned', 'current', 'closed', 'archived']).optional(),
});
const academicYears = crudModule({
  model: AcademicYear,
  entityType: 'AcademicYear',
  permission: ORG,
  ...FACULTY,
  schemas: {
    create: yearSchema.refine((v) => v.endDate > v.startDate, { message: 'endDate must be after startDate', path: ['endDate'] }),
    update: yearSchema.partial(),
  },
  filterFields: ['status'],
  sortable: ['label', 'startDate', 'createdAt'],
});

const semesterFields = {
  academicYear: objectId,
  number: z.number().int().min(1).max(4),
  name: z.string().trim().optional(),
  startDate: date,
  endDate: date,
  registrationOpens: date.optional(),
  registrationCloses: date.optional(),
  addDropOpens: date.optional(),
  addDropCloses: date.optional(),
};
const checkSemesterDates = (v) => {
  if (v.startDate && v.endDate && v.endDate <= v.startDate) return false;
  if (v.registrationOpens && v.registrationCloses && v.registrationCloses <= v.registrationOpens) return false;
  if (v.addDropOpens && v.addDropCloses && v.addDropCloses <= v.addDropOpens) return false;
  return true;
};
const semesters = crudModule({
  model: Semester,
  entityType: 'Semester',
  permission: ORG,
  ...FACULTY,
  schemas: {
    create: z.object(semesterFields).refine(checkSemesterDates, { message: 'Date ranges must end after they start' }),
    update: z.object(semesterFields).partial().omit({ academicYear: true }).refine(checkSemesterDates, { message: 'Date ranges must end after they start' }),
  },
  filterFields: ['academicYear', 'status', 'number'],
  sortable: ['startDate', 'number', 'createdAt'],
  populate: { path: 'academicYear', select: 'label status' },
  beforeCreate: async (req, body, session) => {
    const year = await AcademicYear.findById(body.academicYear).session(session);
    if (!year) throw badRequest('The academic year does not exist.', null, 'ACADEMIC_YEAR_INVALID');
    if (body.startDate < year.startDate || body.endDate > year.endDate) throw badRequest('The semester must fall within its academic year.', null, 'SEMESTER_OUTSIDE_YEAR');
    return { ...body, name: body.name || `Semester ${body.number}` };
  },
});

// Semester lifecycle: draft -> open -> running -> closed -> archived (no skipping, no going back).
const NEXT = { draft: ['open'], open: ['running'], running: ['closed'], closed: ['archived'], archived: [] };
const semesterExtra = express.Router();
semesterExtra.post(
  '/:id/transition',
  requirePermission('org.write', { min: 'faculty' }),
  validate({ params: idParams, body: z.object({ to: z.enum(['open', 'running', 'closed', 'archived']), reason: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const doc = await withTransaction(async (session) => {
      const sem = await Semester.findById(req.params.id).session(session);
      if (!sem) throw notFound('Semester not found.');
      if (!NEXT[sem.status].includes(req.body.to)) {
        throw conflict(`A ${sem.status} semester cannot move to ${req.body.to}.`, { allowed: NEXT[sem.status] }, 'INVALID_TRANSITION');
      }
      const before = sem.toObject();
      sem.status = req.body.to;
      await sem.save({ session });
      await audit.record({ req, action: 'Semester.transition', entityType: 'Semester', entityId: sem._id, before, after: sem, reason: req.body.reason }, { session });
      return sem;
    });
    ok(res, doc);
  })
);

const routes = [
  { path: 'departments', router: departments.router },
  { path: 'programmes', router: programmes.router },
  { path: 'specializations', router: specializations.router },
  { path: 'batches', router: batches.router },
  { path: 'academic-years', router: academicYears.router },
  { path: 'semesters', router: express.Router().use(semesterExtra).use(semesters.router) },
];

module.exports = { routes };
