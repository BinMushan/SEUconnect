const crypto = require('crypto');
const { Staff, StaffDepartmentAssignment, RESPONSIBILITIES } = require('./model');
const User = require('../../models/User');
const { Department } = require('../organization/model');
const { UserRole } = require('../access/model');
const { paginate, buildSort, textFilter } = require('../../core/pagination');
const { notFound, badRequest, conflict, forbidden } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { departmentFilter, assertDepartment, byId } = require('../../core/scope');
const { hashPassword } = require('../../utils/password');
const { invalidateAccess } = require('../../core/rbac');
const { invalidateAccount } = require('../../middleware/auth');
const audit = require('../../core/audit');

// A responsibility carries the matching RBAC role, so permissions follow the job.
const ROLE_FOR = {
  dean: 'dean',
  hod: 'hod',
  lecturer: 'lecturer',
  course_coordinator: 'lecturer',
  demonstrator: 'demonstrator',
  academic_administrator: 'faculty_admin',
  system_administrator: 'admin',
};
const DEPARTMENT_BOUND = ['hod', 'lecturer', 'course_coordinator', 'demonstrator'];
const POPULATE = { path: 'department', select: 'code name' };

const scopeFilter = (req) => {
  if (req.access.scope === 'own') return { _id: req.access.staffId || null };
  return departmentFilter(req, 'department');
};

const list = async (req, query) => {
  const filter = { ...scopeFilter(req) };
  for (const f of ['department', 'employmentStatus', 'accountStatus']) if (query[f]) filter[f] = query[f];
  if (query.responsibility) filter.responsibilities = { $elemMatch: { type: query.responsibility, active: true } };
  const text = textFilter(query.q, ['fullName', 'staffId', 'email']);
  if (text) Object.assign(filter, text);
  return paginate(Staff, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['fullName', 'staffId', 'createdAt'], 'staffId'), populate: POPULATE });
};

const get = async (req, id) => {
  const doc = await Staff.findOne(byId(id, scopeFilter(req))).populate(POPULATE).lean();
  if (!doc) throw notFound('Staff member not found.');
  return doc;
};

// Keeps UserRole grants aligned with the active responsibilities of a staff member.
const syncRoles = async (staff, byUserId, session) => {
  if (!staff.user) return;
  const wanted = new Map(); // key -> { role, department }
  for (const r of staff.responsibilities.filter((x) => x.active)) {
    const role = ROLE_FOR[r.type];
    const department = DEPARTMENT_BOUND.includes(r.type) ? r.department || staff.department : null;
    wanted.set(`${role}|${department || ''}`, { role, department });
  }
  const managed = Object.values(ROLE_FOR);
  const existing = await UserRole.find({ user: staff.user, role: { $in: managed }, active: true }).session(session);
  for (const g of existing) {
    if (!wanted.has(`${g.role}|${g.department || ''}`)) {
      g.active = false;
      g.revokedAt = new Date();
      await g.save({ session });
    }
  }
  for (const { role, department } of wanted.values()) {
    await UserRole.updateOne({ user: staff.user, role, department: department || null }, { $set: { active: true, revokedAt: null, grantedBy: byUserId, grantedAt: new Date() } }, { upsert: true, session });
  }
  const user = await User.findById(staff.user).session(session);
  if (user) {
    user.tokenVersion = (user.tokenVersion || 0) + 1; // refresh permissions on next sign-in
    await user.save({ session });
    invalidateAccount(String(user._id));
    invalidateAccess(String(user._id));
  }
};

const create = async (req, body) => {
  assertDepartment(req, body.department);
  return withTransaction(async (session) => {
    if (!(await Department.exists({ _id: body.department }).session(session))) throw badRequest('Department not found.', null, 'DEPARTMENT_INVALID');
    const { createAccount, role, ...data } = body;
    let temporaryPassword = null;
    if (createAccount !== false) {
      if (await User.exists({ email: data.email }).session(session)) throw conflict('An account with this e-mail already exists.', null, 'EMAIL_EXISTS');
      temporaryPassword = `Tmp-${crypto.randomBytes(6).toString('base64url')}9a`;
      const dept = await Department.findById(data.department).session(session);
      const baseRole = role || 'lecturer';
      if (['admin', 'superadmin'].includes(baseRole) && req.access.scope !== 'system') throw forbidden('Only a system administrator can create administrator accounts.', 'PRIVILEGE_ESCALATION');
      const [user] = await User.create([{ name: data.fullName, email: data.email, password: hashPassword(temporaryPassword), role: baseRole, roleKey: baseRole, staffId: data.staffId, department: dept.name, departmentRef: dept._id, designation: data.designation, mustChangePassword: true, avatarInitial: data.fullName.slice(0, 2).toUpperCase() }], { session });
      data.user = user._id;
    }
    const [staff] = await Staff.create([data], { session });
    await StaffDepartmentAssignment.create([{ staff: staff._id, department: staff.department, assignedBy: req.user.id }], { session });
    await audit.record({ req, action: 'staff.create', entityType: 'Staff', entityId: staff._id, after: staff }, { session });
    return { staff, temporaryPassword };
  });
};

const update = async (req, id, patch) => {
  return withTransaction(async (session) => {
    const doc = await Staff.findOne(byId(id, scopeFilter(req))).session(session);
    if (!doc) throw notFound('Staff member not found.');
    assertDepartment(req, doc.department);
    const before = doc.toObject();
    if (patch.department && String(patch.department) !== String(doc.department)) {
      assertDepartment(req, patch.department);
      await StaffDepartmentAssignment.updateMany({ staff: doc._id, to: null }, { to: new Date() }, { session });
      await StaffDepartmentAssignment.create([{ staff: doc._id, department: patch.department, assignedBy: req.user.id }], { session });
    }
    doc.set(patch);
    await doc.save({ session });
    if (doc.user && (patch.accountStatus || patch.employmentStatus)) {
      const inactive = doc.accountStatus !== 'active' || ['retired', 'resigned'].includes(doc.employmentStatus);
      await User.updateOne({ _id: doc.user }, { status: inactive ? 'disabled' : 'active', $inc: { tokenVersion: inactive ? 1 : 0 } }, { session });
      invalidateAccount(String(doc.user));
      invalidateAccess(String(doc.user));
    }
    await audit.record({ req, action: 'staff.update', entityType: 'Staff', entityId: doc._id, before, after: doc }, { session });
    return doc;
  });
};

const addResponsibility = async (req, id, body) => {
  if (!RESPONSIBILITIES.includes(body.type)) throw badRequest('Unknown responsibility.', null, 'RESPONSIBILITY_INVALID');
  return withTransaction(async (session) => {
    const staff = await Staff.findOne(byId(id, scopeFilter(req))).session(session);
    if (!staff) throw notFound('Staff member not found.');
    assertDepartment(req, staff.department);
    if (['system_administrator'].includes(body.type) && req.access.scope !== 'system') throw forbidden('Only a system administrator can grant that responsibility.', 'PRIVILEGE_ESCALATION');
    if (['dean', 'academic_administrator'].includes(body.type) && !['faculty', 'system'].includes(req.access.scope)) throw forbidden('Faculty-level responsibilities need a faculty-level approver.', 'PRIVILEGE_ESCALATION');
    const department = DEPARTMENT_BOUND.includes(body.type) ? body.department || staff.department : null;
    if (department) assertDepartment(req, department);
    if (staff.responsibilities.some((r) => r.active && r.type === body.type && String(r.department || '') === String(department || ''))) throw conflict('This responsibility is already active.', null, 'ALREADY_ACTIVE');
    // One active HOD per department.
    if (body.type === 'hod') {
      const other = await Staff.findOne({ _id: { $ne: staff._id }, responsibilities: { $elemMatch: { type: 'hod', active: true, department } } }).session(session);
      if (other) throw conflict(`${other.fullName} is already the active HOD of this department. End that responsibility first.`, null, 'HOD_EXISTS');
    }
    const before = staff.toObject();
    staff.responsibilities.push({ type: body.type, department, from: body.from || new Date(), active: true, assignedBy: req.user.id });
    await staff.save({ session });
    await syncRoles(staff, req.user.id, session);
    await audit.record({ req, action: 'staff.responsibility_added', entityType: 'Staff', entityId: staff._id, before, after: staff, reason: body.reason }, { session });
    return staff;
  });
};

const endResponsibility = async (req, id, responsibilityId, reason) => {
  return withTransaction(async (session) => {
    const staff = await Staff.findOne(byId(id, scopeFilter(req))).session(session);
    if (!staff) throw notFound('Staff member not found.');
    assertDepartment(req, staff.department);
    const r = staff.responsibilities.id(responsibilityId);
    if (!r || !r.active) throw notFound('Active responsibility not found.');
    const before = staff.toObject();
    r.active = false;
    r.to = new Date();
    await staff.save({ session });
    await syncRoles(staff, req.user.id, session);
    await audit.record({ req, action: 'staff.responsibility_ended', entityType: 'Staff', entityId: staff._id, before, after: staff, reason }, { session });
    return staff;
  });
};

module.exports = { list, get, create, update, addResponsibility, endResponsibility };
