/**
 * Data-scope helpers. requirePermission() tells a handler *how far* the caller's permission reaches
 * (req.access.scope); these helpers turn that into query filters and record-level checks so that
 * a department-scoped HOD or an own-scoped student can never read outside their boundary.
 */
const { forbidden } = require('./http');

const wide = (req) => ['faculty', 'system'].includes(req.access.scope);

/** Mongo filter limiting `field` (a Department ObjectId path) to the caller's departments. */
const departmentFilter = (req, field = 'department') => {
  if (wide(req)) return {};
  return { [field]: { $in: req.access.departments } };
};

/** True when the caller may touch a record that belongs to `departmentId`. */
const canAccessDepartment = (req, departmentId) => wide(req) || req.access.departments.includes(String(departmentId));

const assertDepartment = (req, departmentId) => {
  if (!canAccessDepartment(req, departmentId)) throw forbidden('This record belongs to another department.', 'OUT_OF_SCOPE');
};

/** Filter for student-owned collections: students only see their own rows. */
const ownStudentFilter = (req, field = 'student') => {
  if (req.access.scope === 'own') return { [field]: req.access.studentId || null };
  return {};
};

const assertOwnStudent = (req, studentId) => {
  if (req.access.scope === 'own' && String(studentId) !== String(req.access.studentId)) {
    throw forbidden('You can only access your own records.', 'OUT_OF_SCOPE');
  }
};

/**
 * Combines "this id" with a scope filter safely. Spreading a scope into { _id: id, ...scope } is a bug when the
 * scope also constrains _id (own / assigned scopes): the later key silently replaces the requested id.
 */
const byId = (id, scope) => (scope && Object.keys(scope).length ? { $and: [{ _id: id }, scope] } : { _id: id });

module.exports = { byId, wide, departmentFilter, canAccessDepartment, assertDepartment, ownStudentFilter, assertOwnStudent };
