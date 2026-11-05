/**
 * Offering / component access rules shared by attendance, CA, ESA and results.
 *   assigned   -> only the offering components the caller is actively assigned to (lecturer: theory, demonstrator: practical)
 *   department -> offerings whose course belongs to the caller's department(s)
 *   faculty / system -> everything
 *   own (students) -> never allowed to write; reads are limited to their own rows by each service
 */
const { CourseOffering, Course } = require('../courses/model');
const { myAssignments, assertAssigned } = require('../courses/assignmentScope');
const { SubjectRegistration } = require('../registration/model');
const { badRequest, notFound, forbidden } = require('../../core/http');
const { assertDepartment } = require('../../core/scope');

const loadOffering = async (id, session) => {
  let q = CourseOffering.findById(id);
  if (session) q = q.session(session);
  const offering = await q;
  if (!offering) throw notFound('Course offering not found.');
  let cq = Course.findById(offering.course);
  if (session) cq = cq.session(session);
  const course = await cq;
  return { offering, course };
};

/** Throws unless the caller may WORK ON (write) this offering component. Returns { offering, course }. */
const assertOfferingAccess = async (req, offeringId, componentType, session) => {
  const { offering, course } = await loadOffering(offeringId, session);
  if (componentType && !offering.components.some((c) => c.type === componentType)) throw badRequest('This offering has no such component.', null, 'COMPONENT_INVALID');
  switch (req.access.scope) {
    case 'own':
      throw forbidden('Students cannot perform this action.', 'OUT_OF_SCOPE');
    case 'assigned':
      await assertAssigned(req, offeringId, componentType, session);
      break;
    case 'department':
      assertDepartment(req, course.department);
      break;
    default:
      break;
  }
  return { offering, course };
};

/** Students with an approved registration in the offering. */
const registeredStudentIds = async (offeringId, session) => {
  let q = SubjectRegistration.find({ offering: offeringId, status: 'approved' });
  if (session) q = q.session(session);
  return (await q.distinct('student')).map(String);
};

const offeringIdsOfDepartments = async (departments) => {
  const courses = await Course.find({ department: { $in: departments } }).distinct('_id');
  return CourseOffering.find({ course: { $in: courses } }).distinct('_id');
};

/**
 * Mongo filter for READING rows that carry { offering, componentType, student } fields.
 * Students (own) are limited to their own student id; callers add stricter status rules where needed.
 */
const readFilter = async (req) => {
  switch (req.access.scope) {
    case 'own':
      return { student: req.access.studentId || null };
    case 'assigned': {
      const mine = await myAssignments(req);
      if (!mine.length) return { offering: { $in: [] } };
      return {
        $or: mine.map((a) => (a.role === 'coordinator' ? { offering: a.offering } : { offering: a.offering, componentType: a.componentType })),
      };
    }
    case 'department':
      return { offering: { $in: await offeringIdsOfDepartments(req.access.departments) } };
    default:
      return {};
  }
};

/** Same idea for collections whose rows ARE offerings (field `_id`) or reference one under a custom field. */
const offeringFilterFor = async (req, field = 'offering') => {
  const f = await readFilter(req);
  if (req.access.scope === 'own') {
    const ids = await SubjectRegistration.find({ student: req.access.studentId || null, status: 'approved' }).distinct('offering');
    return { [field]: { $in: ids } };
  }
  if (f.offering) return { [field]: f.offering };
  if (f.$or) return { $or: f.$or.map((c) => ({ [field]: c.offering, ...(c.componentType ? { componentType: c.componentType } : {}) })) };
  return {};
};

/** Can the caller read data of this offering component? (single-document checks) */
const canReadComponent = async (req, offeringId, componentType) => {
  const scope = req.access.scope;
  if (['faculty', 'system'].includes(scope)) return true;
  const { course } = await loadOffering(offeringId);
  if (scope === 'department') return req.access.departments.includes(String(course.department));
  if (scope === 'assigned') {
    const mine = await myAssignments(req);
    return mine.some((a) => String(a.offering) === String(offeringId) && (a.role === 'coordinator' || !componentType || a.componentType === componentType));
  }
  if (scope === 'own') return Boolean(await SubjectRegistration.exists({ student: req.access.studentId || null, offering: offeringId, status: 'approved' }));
  return false;
};

const and = (...filters) => {
  const parts = filters.filter((f) => f && Object.keys(f).length);
  return parts.length === 0 ? {} : parts.length === 1 ? parts[0] : { $and: parts };
};

/** Throws 404 unless the caller may see this student (scope of the CURRENT permission). */
const assertStudentReadable = async (req, studentId) => {
  const Student = require('../../models/Student');
  const { byId } = require('../../core/scope');
  const studentsService = require('../students/service');
  const scope = await studentsService.scopeFilter(req);
  if (!(await Student.exists(byId(studentId, scope)))) throw notFound('Student not found.');
};

module.exports = { assertStudentReadable, loadOffering, assertOfferingAccess, registeredStudentIds, readFilter, offeringFilterFor, canReadComponent, offeringIdsOfDepartments, and };
