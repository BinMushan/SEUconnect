/** Data-scope helpers shared by the report definitions (each report applies the caller's scope itself). */
const Student = require('../../models/Student');
const { Course, CourseOffering } = require('../courses/model');
const { assignedOfferingIds } = require('../courses/assignmentScope');
const studentsService = require('../students/service');

const isWide = (req) => ['faculty', 'system'].includes(req.access.scope);

// Combines non-empty filters with $and so keys such as _id never overwrite each other.
const and = (...filters) => {
  const real = filters.filter((f) => f && Object.keys(f).length);
  if (!real.length) return {};
  return real.length === 1 ? real[0] : { $and: real };
};

const studentFilter = (req) => studentsService.scopeFilter(req);

/** null = unrestricted, otherwise the list of student ids the caller may see. */
const studentIds = async (req) => {
  if (isWide(req)) return null;
  return Student.find(await studentFilter(req)).distinct('_id');
};

/** Filter on a `student` field of a collection. */
const studentField = async (req, field = 'student') => {
  const ids = await studentIds(req);
  return ids === null ? {} : { [field]: { $in: ids } };
};

/** null = unrestricted, otherwise the offering ids the caller may see (department / assigned scope). */
const offeringIds = async (req) => {
  switch (req.access.scope) {
    case 'assigned':
      return assignedOfferingIds(req);
    case 'department': {
      const courses = await Course.find({ department: { $in: req.access.departments } }).distinct('_id');
      return CourseOffering.find({ course: { $in: courses } }).distinct('_id');
    }
    case 'own': {
      const s = await Student.findById(req.access.studentId).select('batchRef').lean();
      return s ? CourseOffering.find({ batch: s.batchRef }).distinct('_id') : [];
    }
    default:
      return null;
  }
};

const offeringField = async (req, field = 'offering') => {
  const ids = await offeringIds(req);
  return ids === null ? {} : { [field]: { $in: ids } };
};

module.exports = { isWide, and, studentFilter, studentIds, studentField, offeringIds, offeringField };
