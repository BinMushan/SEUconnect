const crypto = require('crypto');
const User = require('../../models/User');
const { Role, UserRole, Permission } = require('./model');
const RefreshToken = require('../auth/model');
const { hashPassword } = require('../../utils/password');
const { notFound, badRequest, forbidden, conflict } = require('../../core/http');
const { invalidateAccess, ROLE_CATALOG, SCOPES } = require('../../core/rbac');
const { invalidateAccount } = require('../../middleware/auth');
const { withTransaction } = require('../../core/transaction');
const { paginate, buildSort, textFilter } = require('../../core/pagination');
const { departmentFilter, assertDepartment, byId } = require('../../core/scope');
const audit = require('../../core/audit');
const { Department } = require('../organization/model');

const SAFE_FIELDS = '-password -__v';
// Only a caller who can edit roles may hand out administrator roles (prevents privilege escalation).
const PRIVILEGED = ['admin', 'superadmin'];

const tempPassword = () => `Tmp-${crypto.randomBytes(6).toString('base64url')}9a`;

const list = async (req, query) => {
  const filter = { ...departmentFilter(req, 'departmentRef') };
  for (const f of ['role', 'status']) if (query[f]) filter[f] = query[f];
  const text = textFilter(query.q, ['name', 'email', 'staffId', 'regNo']);
  if (text) Object.assign(filter, text);
  return paginate(User, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['name', 'email', 'role', 'createdAt']), select: SAFE_FIELDS });
};

const get = async (req, id) => {
  const user = await User.findOne(byId(id, departmentFilter(req, 'departmentRef'))).select(SAFE_FIELDS).lean();
  if (!user) throw notFound('User not found.');
  user.grants = await UserRole.find({ user: id, active: true }).lean();
  return user;
};

const create = async (req, body) => {
  if (PRIVILEGED.includes(body.role) && req.access.scope !== 'system') throw forbidden('Only a system administrator can create administrator accounts.', 'PRIVILEGE_ESCALATION');
  if (body.departmentRef) {
    if (!(await Department.exists({ _id: body.departmentRef }))) throw badRequest('Department not found.', null, 'DEPARTMENT_INVALID');
    assertDepartment(req, body.departmentRef);
  }
  if (!ROLE_CATALOG[body.role] && !(await Role.exists({ key: body.role }))) throw badRequest('Unknown role.', null, 'ROLE_INVALID');
  const temp = body.password ? null : tempPassword();
  const user = await withTransaction(async (session) => {
    const [u] = await User.create([{ ...body, roleKey: body.role, password: hashPassword(body.password || temp), mustChangePassword: !body.password, avatarInitial: (body.name || 'U').trim().slice(0, 2).toUpperCase() }], { session });
    await audit.record({ req, action: 'user.create', entityType: 'User', entityId: u._id, after: u }, { session });
    return u;
  });
  return { user: await User.findById(user._id).select(SAFE_FIELDS).lean(), temporaryPassword: temp };
};

const update = async (req, id, patch) => {
  return withTransaction(async (session) => {
    const user = await User.findOne(byId(id, departmentFilter(req, 'departmentRef'))).session(session);
    if (!user) throw notFound('User not found.');
    if (PRIVILEGED.includes(user.role) && req.access.scope !== 'system') throw forbidden('Only a system administrator can modify administrator accounts.', 'PRIVILEGE_ESCALATION');
    const before = user.toObject();
    user.set(patch);
    if (patch.status && patch.status !== 'active') user.tokenVersion = (user.tokenVersion || 0) + 1; // force sign-out
    await user.save({ session });
    await audit.record({ req, action: 'user.update', entityType: 'User', entityId: user._id, before, after: user }, { session });
    invalidateAccount(String(user._id));
    invalidateAccess(String(user._id));
    return User.findById(user._id).select(SAFE_FIELDS).session(session).lean();
  });
};

const resetPassword = async (req, id) => {
  const temp = tempPassword();
  await withTransaction(async (session) => {
    const user = await User.findById(id).session(session);
    if (!user) throw notFound('User not found.');
    if (PRIVILEGED.includes(user.role) && req.access.scope !== 'system') throw forbidden('Only a system administrator can reset administrator passwords.', 'PRIVILEGE_ESCALATION');
    user.password = hashPassword(temp);
    user.mustChangePassword = true;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ session });
    await RefreshToken.updateMany({ user: id, revokedAt: null }, { revokedAt: new Date() }, { session });
    await audit.record({ req, action: 'user.password_reset', entityType: 'User', entityId: user._id }, { session });
    invalidateAccount(String(user._id));
  });
  return { temporaryPassword: temp };
};

/** Replaces the set of role grants of a user (each optionally scoped to a department). */
const setRoles = async (req, id, grants, reason) => {
  const result = await withTransaction(async (session) => {
    const user = await User.findById(id).session(session);
    if (!user) throw notFound('User not found.');
    for (const g of grants) {
      if (PRIVILEGED.includes(g.role) && req.access.scope !== 'system') throw forbidden('Only a system administrator can grant administrator roles.', 'PRIVILEGE_ESCALATION');
      if (!ROLE_CATALOG[g.role] && !(await Role.exists({ key: g.role }).session(session))) throw badRequest(`Unknown role "${g.role}".`, null, 'ROLE_INVALID');
      if (g.department) {
        if (!(await Department.exists({ _id: g.department }).session(session))) throw badRequest('Department not found.', null, 'DEPARTMENT_INVALID');
        assertDepartment(req, g.department);
      }
    }
    const before = await UserRole.find({ user: id, active: true }).session(session).lean();
    await UserRole.updateMany({ user: id, active: true }, { active: false, revokedAt: new Date() }, { session });
    for (const g of grants) {
      await UserRole.updateOne(
        { user: id, role: g.role, department: g.department || null },
        { $set: { active: true, revokedAt: null, grantedBy: req.user.id, grantedAt: new Date() } },
        { upsert: true, session }
      );
    }
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ session });
    const after = await UserRole.find({ user: id, active: true }).session(session).lean();
    await audit.record({ req, action: 'user.roles_changed', entityType: 'User', entityId: id, before, after, reason }, { session });
    return after;
  });
  invalidateAccount(String(id));
  invalidateAccess(String(id));
  return result;
};

/* ------------------------------- roles ------------------------------- */
const listRoles = () => Role.find({}).sort({ key: 1 }).lean();
const getRole = async (key) => {
  const role = await Role.findOne({ key }).lean();
  if (!role) throw notFound('Role not found.');
  return role;
};

const updateRole = async (req, key, body) => {
  const known = new Set((await Permission.find({}).lean()).map((p) => p.key));
  for (const p of body.permissions || []) {
    if (!known.has(p.key)) throw badRequest(`Unknown permission "${p.key}".`, null, 'PERMISSION_INVALID');
    if (!SCOPES.includes(p.scope)) throw badRequest(`Invalid scope "${p.scope}".`, null, 'SCOPE_INVALID');
  }
  const role = await withTransaction(async (session) => {
    const doc = await Role.findOne({ key }).session(session);
    if (!doc) throw notFound('Role not found.');
    if (['admin', 'superadmin'].includes(key) && body.permissions && !body.permissions.some((p) => p.key === 'roles.manage')) {
      throw conflict('Administrator roles must keep the roles.manage permission, otherwise nobody could repair access.', null, 'LOCKOUT_PREVENTED');
    }
    const before = doc.toObject();
    if (body.name) doc.name = body.name;
    if (body.description !== undefined) doc.description = body.description;
    if (body.permissions) {
      doc.permissions = body.permissions;
      doc.customised = true;
    }
    if (body.status) doc.status = body.status;
    await doc.save({ session });
    await audit.record({ req, action: 'role.update', entityType: 'Role', entityId: doc.key, before, after: doc, reason: body.reason }, { session });
    return doc;
  });
  invalidateAccount();
  invalidateAccess();
  return role;
};

const listPermissions = () => Permission.find({}).sort({ module: 1, key: 1 }).lean();

module.exports = { list, get, create, update, resetPassword, setRoles, listRoles, getRole, updateRole, listPermissions };
