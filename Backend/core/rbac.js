/**
 * Role-based access control.
 *
 * Permissions are `resource.action` keys. A role grants a permission with a SCOPE that says how much data
 * the permission reaches:  own < assigned < department < faculty < system.
 * The catalog below is the default; roles are stored in MongoDB (Role collection) and can be edited by a
 * System Administrator - the database copy wins at runtime.
 */
const mongoose = require('mongoose');
const { forbidden, unauthorized } = require('./http');
const { normalizeRole } = require('../utils/roles');

const SCOPES = ['own', 'assigned', 'department', 'faculty', 'system'];
const rank = (scope) => SCOPES.indexOf(scope);

const PERMISSIONS = [
  ['system.settings', 'Manage global settings and academic policies', 'system'],
  ['policies.read', 'Read academic policies', 'system'],
  ['policies.write', 'Create and approve academic policies', 'system'],
  ['users.read', 'View user accounts', 'access'],
  ['users.write', 'Create / update accounts, assign roles', 'access'],
  ['roles.manage', 'Edit roles and permissions', 'access'],
  ['audit.read', 'Read audit records', 'audit'],
  ['org.read', 'Read departments, programmes, years, semesters, batches', 'organization'],
  ['org.write', 'Manage departments, programmes, years, semesters, batches', 'organization'],
  ['students.read', 'Read student records', 'students'],
  ['students.write', 'Create / update student records and status', 'students'],
  ['staff.read', 'Read staff records', 'staff'],
  ['staff.write', 'Create / update staff and responsibilities', 'staff'],
  ['courses.read', 'Read courses and offerings', 'courses'],
  ['courses.write', 'Manage courses', 'courses'],
  ['offerings.read', 'Read course offerings', 'courses'],
  ['offerings.write', 'Manage course offerings', 'courses'],
  ['assignments.write', 'Assign lecturers / demonstrators to offerings', 'courses'],
  ['registrations.read', 'Read subject registrations', 'registration'],
  ['registrations.create', 'Register / drop subjects (own)', 'registration'],
  ['registrations.decide', 'Approve or reject registrations and exceptions', 'registration'],
  ['allocations.apply', 'Submit a specialization / majoring application', 'allocation'],
  ['allocations.read', 'Read applications, runs and allocations', 'allocation'],
  ['allocations.manage', 'Set capacities, run, publish allocations', 'allocation'],
  ['allocations.change', 'Approve manual allocation changes', 'allocation'],
  ['attendance.read', 'Read attendance', 'attendance'],
  ['attendance.write', 'Create sessions and mark attendance', 'attendance'],
  ['attendance.correct', 'Decide attendance correction requests', 'attendance'],
  ['assessments.read', 'Read CA assessments and marks', 'assessment'],
  ['assessments.write', 'Create assessments and enter marks', 'assessment'],
  ['assessments.verify', 'Verify submitted marks', 'assessment'],
  ['assessments.approve', 'Approve and lock marks', 'assessment'],
  ['esa.read', 'Read ESA schedules and marks', 'assessment'],
  ['esa.write', 'Schedule ESA, assign invigilators, enter marks', 'assessment'],
  ['results.read', 'Read results', 'results'],
  ['results.submit', 'Calculate and submit results', 'results'],
  ['results.verify', 'Verify results', 'results'],
  ['results.approve', 'Approve results', 'results'],
  ['results.publish', 'Publish results', 'results'],
  ['gradepolicy.manage', 'Create / approve grade policies', 'results'],
  ['gpa.read', 'Read GPA and transcripts', 'results'],
  ['requests.create', 'Submit requests', 'requests'],
  ['requests.read', 'Read requests', 'requests'],
  ['requests.decide', 'Decide requests at a workflow step', 'requests'],
  ['requests.configure', 'Configure request types and workflows', 'requests'],
  ['notifications.read', 'Read own notifications', 'notifications'],
  ['notifications.broadcast', 'Send announcements', 'notifications'],
  ['reports.read', 'Generate reports', 'reports'],
  ['attachments.upload', 'Upload supporting documents', 'attachments'],
].map(([key, description, module]) => ({ key, description, module }));

// Helper to keep the catalog readable: grant(scope, ...keys)
const grant = (scope, ...keys) => keys.map((key) => ({ key, scope }));

const ROLE_CATALOG = {
  admin: {
    name: 'System Administrator',
    permissions: [
      ...grant('system', 'system.settings', 'policies.read', 'policies.write', 'users.read', 'users.write', 'roles.manage', 'audit.read', 'org.read', 'org.write',
        'students.read', 'students.write', 'staff.read', 'staff.write', 'courses.read', 'courses.write', 'offerings.read', 'offerings.write', 'notifications.read', 'notifications.broadcast',
        'reports.read', 'attachments.upload', 'gpa.read', 'results.read', 'requests.read', 'requests.configure'),
    ],
  },
  superadmin: { name: 'Super Administrator', permissions: null /* same as admin, resolved below */ },
  dean: {
    name: 'Dean',
    permissions: [
      ...grant('faculty', 'audit.read', 'org.read', 'students.read', 'staff.read', 'courses.read', 'offerings.read', 'registrations.read', 'allocations.read', 'attendance.read', 'assessments.read',
        'esa.read', 'results.read', 'results.approve', 'gpa.read', 'requests.read', 'requests.decide', 'reports.read', 'policies.read'),
      ...grant('faculty', 'notifications.read', 'notifications.broadcast', 'attachments.upload'),
    ],
  },
  faculty_admin: {
    name: 'Faculty Administrator',
    permissions: [
      ...grant('faculty', 'org.read', 'org.write', 'students.read', 'students.write', 'staff.read', 'staff.write', 'courses.read', 'courses.write', 'offerings.read', 'offerings.write', 'assignments.write',
        'registrations.read', 'registrations.decide', 'allocations.read', 'allocations.manage', 'attendance.read', 'assessments.read', 'esa.read', 'esa.write', 'results.read',
        'results.publish', 'gradepolicy.manage', 'gpa.read', 'requests.read', 'requests.decide', 'requests.configure', 'reports.read', 'policies.read', 'policies.write',
        'notifications.broadcast', 'attachments.upload'),
      ...grant('own', 'notifications.read'),
    ],
  },
  hod: {
    name: 'Head of Department',
    permissions: [
      ...grant('department', 'org.read', 'students.read', 'students.write', 'staff.read', 'staff.write', 'courses.read', 'courses.write', 'offerings.read', 'offerings.write', 'assignments.write',
        'registrations.read', 'registrations.decide', 'allocations.read', 'allocations.change', 'attendance.read', 'assessments.read', 'assessments.verify', 'esa.read', 'results.read',
        'results.verify', 'gpa.read', 'requests.read', 'requests.decide', 'reports.read', 'attachments.upload'),
      ...grant('faculty', 'policies.read'),
      ...grant('own', 'notifications.read'),
    ],
  },
  lecturer: {
    name: 'Lecturer',
    permissions: [
      ...grant('faculty', 'org.read', 'courses.read'),
      ...grant('assigned', 'offerings.read', 'students.read', 'registrations.read', 'attendance.read', 'attendance.write', 'attendance.correct', 'assessments.read', 'assessments.write', 'esa.read',
        'esa.write', 'results.read', 'results.submit', 'gpa.read', 'reports.read'),
      ...grant('own', 'requests.read', 'requests.create', 'requests.decide', 'notifications.read', 'attachments.upload', 'staff.read'),
    ],
  },
  demonstrator: {
    name: 'Demonstrator',
    permissions: [
      ...grant('faculty', 'org.read', 'courses.read'),
      ...grant('assigned', 'offerings.read', 'students.read', 'attendance.read', 'attendance.write', 'assessments.read', 'assessments.write', 'esa.read', 'esa.write', 'results.read', 'results.submit'),
      ...grant('own', 'notifications.read', 'attachments.upload', 'staff.read'),
    ],
  },
  student: {
    name: 'Student',
    permissions: [
      ...grant('faculty', 'org.read', 'courses.read'),
      ...grant('own', 'offerings.read', 'students.read', 'registrations.read', 'registrations.create', 'allocations.apply', 'allocations.read', 'attendance.read', 'assessments.read', 'esa.read', 'results.read',
        'gpa.read', 'requests.create', 'requests.read', 'notifications.read', 'attachments.upload'),
    ],
  },
  // Operational roles of the examination-form workflows keep faculty-level read access to the new modules.
  sar: { name: 'Senior Assistant Registrar', permissions: [...grant('faculty', 'org.read', 'students.read', 'courses.read', 'offerings.read', 'registrations.read', 'reports.read', 'requests.read'), ...grant('own', 'notifications.read')] },
  examination: { name: 'Examination Branch', permissions: [...grant('faculty', 'org.read', 'students.read', 'courses.read', 'offerings.read', 'esa.read', 'esa.write', 'attendance.read', 'results.read', 'reports.read'), ...grant('own', 'notifications.read')] },
  dept_ma: { name: 'Department Management Assistant', permissions: [...grant('department', 'org.read', 'students.read', 'courses.read', 'offerings.read', 'registrations.read', 'attendance.read', 'reports.read'), ...grant('own', 'notifications.read')] },
  fma: { name: 'Faculty Management Assistant', permissions: [...grant('faculty', 'org.read', 'students.read', 'courses.read', 'offerings.read', 'registrations.read', 'reports.read'), ...grant('own', 'notifications.read')] },
};
ROLE_CATALOG.superadmin.permissions = ROLE_CATALOG.admin.permissions;

/**
 * Modules call this at load time to add permissions and role grants without editing the shared catalogue:
 *   extendCatalog({ permissions: [['x.read', 'Read x', 'x']], grants: { hod: [{ key: 'x.read', scope: 'department' }] } })
 * Grants for a role that is not in the catalogue are ignored.
 */
const extendCatalog = ({ permissions = [], grants = {} } = {}) => {
  for (const [key, description, module] of permissions) {
    if (!PERMISSIONS.some((p) => p.key === key)) PERMISSIONS.push({ key, description, module });
  }
  for (const [role, list] of Object.entries(grants)) {
    const def = ROLE_CATALOG[role];
    if (!def || !def.permissions) continue;
    for (const g of list) {
      if (!def.permissions.some((p) => p.key === g.key)) def.permissions.push(g);
    }
  }
  // admin and superadmin share one array, so both are covered by the push above
};

/* --------------------------- effective permissions --------------------------- */
const CACHE_MS = 60 * 1000;
const cache = new Map(); // userId -> { at, value }
let roleCache = { at: 0, map: null };

const invalidateAccess = (userId) => {
  if (userId) cache.delete(String(userId));
  else cache.clear();
  roleCache = { at: 0, map: null };
};

const loadRoleMap = async () => {
  if (roleCache.map && Date.now() - roleCache.at < CACHE_MS) return roleCache.map;
  const map = {};
  for (const [key, def] of Object.entries(ROLE_CATALOG)) map[key] = def.permissions;
  if (mongoose.connection.readyState === 1 && mongoose.models.Role) {
    const docs = await mongoose.models.Role.find({ status: 'active' }).lean();
    for (const d of docs) map[d.key] = d.permissions;
  }
  roleCache = { at: Date.now(), map };
  return map;
};

/**
 * Resolves what a signed-in user may do:
 * { roles, permissions: Map(key -> highest scope), departments: [departmentId], userId, studentId?, staffId? }
 */
const resolveAccess = async (user) => {
  if (!user) throw unauthorized();
  const key = String(user.id || user.email);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const roles = new Set([normalizeRole(user.role)]);
  const departments = new Set();
  let studentId = null;
  let staffId = null;

  if (mongoose.connection.readyState === 1) {
    const { UserRole } = require('../modules/access/model');
    const isId = /^[0-9a-f]{24}$/i.test(String(user.id));
    if (isId) {
      const grants = await UserRole.find({ user: user.id, active: true }).lean();
      for (const g of grants) {
        roles.add(g.role);
        if (g.department) departments.add(String(g.department));
      }
      const userDoc = await mongoose.models.User.findById(user.id).select('departmentRef').lean();
      if (userDoc && userDoc.departmentRef) departments.add(String(userDoc.departmentRef));
      if (mongoose.models.Staff) {
        const staff = await mongoose.models.Staff.findOne({ user: user.id }).select('department').lean();
        if (staff) {
          staffId = String(staff._id);
          if (staff.department) departments.add(String(staff.department));
        }
      }
      if (mongoose.models.Student) {
        const student = await mongoose.models.Student.findOne({ user: user.id }).select('departmentRef').lean();
        if (student) {
          studentId = String(student._id);
          if (student.departmentRef) departments.add(String(student.departmentRef));
        }
      }
    }
  }

  const roleMap = await loadRoleMap();
  const permissions = new Map();
  for (const r of roles) {
    for (const p of roleMap[r] || []) {
      const current = permissions.get(p.key);
      if (!current || rank(p.scope) > rank(current)) permissions.set(p.key, p.scope);
    }
  }
  const value = { roles: [...roles], permissions, departments: [...departments], userId: key, studentId, staffId };
  cache.set(key, { at: Date.now(), value });
  return value;
};

const can = (access, permission, minScope = 'own') => {
  const scope = access.permissions.get(permission);
  return Boolean(scope) && rank(scope) >= rank(minScope);
};

/**
 * Route guard. Populates req.access = { ...access, scope, permission } with the scope granted for `permission`.
 * `min` rejects users whose scope is narrower than required (e.g. min:'department' for write endpoints).
 */
const requirePermission = (permission, { min = 'own' } = {}) => async (req, res, next) => {
  try {
    const access = await resolveAccess(req.user);
    const scope = access.permissions.get(permission);
    if (!scope || rank(scope) < rank(min)) {
      return next(forbidden(`Missing permission: ${permission}.`, 'PERMISSION_DENIED'));
    }
    req.access = { ...access, scope, permission };
    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Like requirePermission, but passes when the caller holds ANY of the listed permissions
 * (e.g. a student drops their own registration, an officer drops on a student's behalf).
 * req.access.scope is the widest scope among the matching permissions.
 */
const requireAnyPermission = (permissions) => async (req, res, next) => {
  try {
    const access = await resolveAccess(req.user);
    let best = null;
    for (const permission of permissions) {
      const scope = access.permissions.get(permission);
      if (scope && (!best || rank(scope) > rank(best.scope))) best = { permission, scope };
    }
    if (!best) return next(forbidden(`Missing permission: one of ${permissions.join(', ')}.`, 'PERMISSION_DENIED'));
    req.access = { ...access, scope: best.scope, permission: best.permission };
    return next();
  } catch (err) {
    return next(err);
  }
};

const syncCatalog = async () => {
  const { Permission, Role } = require('../modules/access/model');
  for (const p of PERMISSIONS) await Permission.updateOne({ key: p.key }, { $set: { description: p.description, module: p.module } }, { upsert: true });
  for (const [key, def] of Object.entries(ROLE_CATALOG)) {
    // Roles an administrator has edited (customised) are never overwritten; untouched system roles follow the catalogue,
    // so permissions added in later releases reach existing databases.
    await Role.updateOne({ key }, { $setOnInsert: { key, system: true, customised: false } }, { upsert: true });
    await Role.updateOne({ key, customised: { $ne: true } }, { $set: { name: def.name, permissions: def.permissions } });
  }
  invalidateAccess();
};

module.exports = { extendCatalog, SCOPES, rank, PERMISSIONS, ROLE_CATALOG, resolveAccess, can, requirePermission, requireAnyPermission, invalidateAccess, syncCatalog };
