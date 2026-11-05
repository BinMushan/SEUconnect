const express = require('express');
const service = require('./service');
const { FIELD_TYPES } = require('./model');
const { z, validate, objectId, idParams } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, created } = require('../../core/http');
const { requirePermission, requireAnyPermission } = require('../../core/rbac');

const stepSchema = z.object({
  order: z.number().int().min(1),
  label: z.string().trim().min(2),
  role: z.string().trim().toLowerCase().regex(/^[a-z_]{3,30}$/),
  scope: z.enum(['faculty', 'department', 'assigned']).default('department'),
  required: z.boolean().default(true),
});
const fieldSchema = z.object({
  name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,40}$/),
  label: z.string().optional(),
  type: z.enum(FIELD_TYPES).default('string'),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});
const configure = requirePermission('requests.configure', { min: 'faculty' });
const seeTypes = requireAnyPermission(['requests.read', 'requests.create', 'requests.configure']);

/* request types */
const types = express.Router();
types.get('/', seeTypes, validate({ query: z.object({ active: z.enum(['true', 'false']).optional() }).passthrough() }),
  asyncHandler(async (req, res) => ok(res, await service.listTypes(req.valid.query))));
types.post('/', configure, validate({ body: z.object({ key: z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{2,60}$/), name: z.string().trim().min(2), description: z.string().optional(), fields: z.array(fieldSchema).max(30).optional(), active: z.boolean().optional() }) }),
  asyncHandler(async (req, res) => created(res, await service.createType(req, req.body))));
types.patch('/:key', configure, validate({ body: z.object({ name: z.string().trim().min(2), description: z.string(), fields: z.array(fieldSchema).max(30), active: z.boolean() }).partial() }),
  asyncHandler(async (req, res) => ok(res, await service.updateType(req, req.params.key, req.body))));

/* approval workflows */
const workflows = express.Router();
workflows.get('/', seeTypes, validate({ query: z.object({ requestType: z.string().optional(), active: z.enum(['true', 'false']).optional() }).passthrough() }),
  asyncHandler(async (req, res) => ok(res, await service.listWorkflows(req.valid.query))));
workflows.post('/', configure, validate({ body: z.object({ requestType: z.string().trim().toLowerCase(), department: objectId.nullable().optional(), name: z.string().optional(), steps: z.array(stepSchema).min(1).max(10) }) }),
  asyncHandler(async (req, res) => created(res, await service.createWorkflow(req, req.body))));
workflows.post('/:id/deactivate', configure, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.deactivateWorkflow(req, req.params.id))));

/* requests */
const requests = express.Router();
const submitter = requirePermission('requests.create');
const reader = requireAnyPermission(['requests.read', 'requests.create', 'requests.decide']);
const decider = requirePermission('requests.decide');

requests.get('/', requirePermission('requests.read'), validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req, req.valid.query);
  ok(res, items, meta);
}));
requests.get('/mine', submitter, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.mine(req, req.valid.query);
  ok(res, items, meta);
}));
requests.get('/pending', decider, validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { items, meta } = await service.pending(req, req.valid.query);
  ok(res, items, meta);
}));
requests.post('/', submitter, validate({ body: z.object({ type: z.string().trim().toLowerCase(), payload: z.record(z.any()).optional(), description: z.string().max(2000).optional(), attachments: z.array(objectId).max(10).optional(), draft: z.boolean().optional() }) }),
  asyncHandler(async (req, res) => created(res, await service.create(req, req.body))));
requests.get('/:id', reader, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
requests.patch('/:id', submitter, validate({ params: idParams, body: z.object({ payload: z.record(z.any()), description: z.string().max(2000), attachments: z.array(objectId).max(10) }).partial() }),
  asyncHandler(async (req, res) => ok(res, await service.updateDraft(req, req.params.id, req.body))));
requests.post('/:id/submit', submitter, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.submit(req, req.params.id))));
requests.post('/:id/withdraw', submitter, validate({ params: idParams, body: z.object({ note: z.string().optional() }) }), asyncHandler(async (req, res) => ok(res, await service.withdraw(req, req.params.id, req.body.note))));
requests.post('/:id/decision', decider, validate({ params: idParams, body: z.object({ decision: z.enum(['approve', 'reject', 'return']), remarks: z.string().trim().max(2000).optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.decide(req, req.params.id, req.body))));
requests.post('/:id/cancel', configure, validate({ params: idParams, body: z.object({ reason: z.string().trim().min(3) }) }), asyncHandler(async (req, res) => ok(res, await service.cancel(req, req.params.id, req.body.reason))));

module.exports = {
  routes: [{ path: 'request-types', router: types }, { path: 'approval-workflows', router: workflows }, { path: 'requests', router: requests }],
  ensureSeeded: service.ensureSeeded,
};
