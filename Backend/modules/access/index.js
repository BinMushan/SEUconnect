const express = require('express');
const service = require('./service');
const { z, validate, objectId, idParams, password } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission, SCOPES } = require('../../core/rbac');

const roleKey = z.string().trim().toLowerCase().regex(/^[a-z_]{3,30}$/);
const grantSchema = z.object({ role: roleKey, department: objectId.nullable().optional() });

const users = express.Router();
users.get('/', requirePermission('users.read'), validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));
users.get('/:id', requirePermission('users.read'), validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
users.post('/', requirePermission('users.write', { min: 'department' }),
  validate({ body: z.object({
    name: z.string().trim().min(2), email: z.string().trim().toLowerCase().email(), role: roleKey, password: password.optional(),
    department: z.string().trim().optional(), departmentRef: objectId.optional(), staffId: z.string().trim().optional(), regNo: z.string().trim().optional(), designation: z.string().trim().optional(),
  }) }),
  asyncHandler(async (req, res) => created(res, await service.create(req, req.body))));
users.patch('/:id', requirePermission('users.write', { min: 'department' }),
  validate({ params: idParams, body: z.object({ name: z.string().trim().min(2), status: z.enum(['active', 'suspended', 'disabled']), departmentRef: objectId.nullable(), designation: z.string().trim(), staffId: z.string().trim() }).partial() }),
  asyncHandler(async (req, res) => ok(res, await service.update(req, req.params.id, req.body))));
users.post('/:id/reset-password', requirePermission('users.write', { min: 'department' }), validate({ params: idParams }),
  asyncHandler(async (req, res) => ok(res, await service.resetPassword(req, req.params.id))));
users.put('/:id/roles', requirePermission('users.write', { min: 'department' }),
  validate({ params: idParams, body: z.object({ roles: z.array(grantSchema).min(1), reason: z.string().trim().optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.setRoles(req, req.params.id, req.body.roles, req.body.reason))));

const roles = express.Router();
roles.get('/', requirePermission('users.read'), asyncHandler(async (req, res) => ok(res, await service.listRoles())));
roles.get('/:key', requirePermission('users.read'), asyncHandler(async (req, res) => ok(res, await service.getRole(req.params.key))));
roles.put('/:key', requirePermission('roles.manage', { min: 'system' }),
  validate({ body: z.object({
    name: z.string().trim().min(2).optional(), description: z.string().optional(), status: z.enum(['active', 'retired']).optional(), reason: z.string().optional(),
    permissions: z.array(z.object({ key: z.string(), scope: z.enum(SCOPES) })).optional(),
  }) }),
  asyncHandler(async (req, res) => ok(res, await service.updateRole(req, req.params.key, req.body))));

const permissions = express.Router();
permissions.get('/', requirePermission('users.read'), asyncHandler(async (req, res) => ok(res, await service.listPermissions())));

module.exports = { routes: [{ path: 'users', router: users }, { path: 'roles', router: roles }, { path: 'permissions', router: permissions }] };
