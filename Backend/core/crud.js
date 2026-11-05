/**
 * CRUD module factory for plain master-data collections (departments, programmes, courses ...).
 * Business-rich modules (registration, allocation, results) write their own services; this keeps the
 * simple ones short while still going through validation, RBAC, scope, pagination and audit.
 *
 * crudModule({ name, model, entityType, permission:{read,write}, schemas:{create,update}, ... }) -> { router, service }
 */
const { byId } = require('./scope');
const express = require('express');
const { validate, idParams } = require('./validate');
const { listQuery, buildSort, textFilter, paginate } = require('./pagination');
const { asyncHandler, ok, created, notFound } = require('./http');
const { requirePermission } = require('./rbac');
const audit = require('./audit');
const { withTransaction } = require('./transaction');

const crudModule = ({
  model,
  entityType,
  permission,
  writeMin = 'department',
  schemas,
  filterFields = [],
  searchFields = [],
  sortable = ['createdAt'],
  populate,
  scopeFilter, // (req) => extra mongo filter (data boundary)
  assertWritable, // (req, doc|null, body) => void | throws (record-level scope check)
  beforeCreate, // async (req, body, session) => body
  afterCreate, // async (req, doc, session)
  beforeUpdate, // async (req, doc, patch, session) => patch
  archiveValue = { status: 'archived' },
}) => {
  const baseFilter = (req) => (scopeFilter ? scopeFilter(req) : {});

  const service = {
    async list(req, query) {
      const filter = { ...baseFilter(req) };
      for (const f of filterFields) if (query[f] !== undefined && query[f] !== '') filter[f] = query[f];
      const text = textFilter(query.q, searchFields);
      if (text) Object.assign(filter, text);
      return paginate(model, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, sortable), populate });
    },

    async get(req, id) {
      let q = model.findOne(byId(id, baseFilter(req)));
      if (populate) q = q.populate(populate);
      const doc = await q;
      if (!doc) throw notFound(`${entityType} not found.`);
      return doc;
    },

    async create(req, body) {
      return withTransaction(async (session) => {
        let data = body;
        if (assertWritable) await assertWritable(req, null, data);
        if (beforeCreate) data = await beforeCreate(req, data, session);
        const [doc] = await model.create([data], { session });
        if (afterCreate) await afterCreate(req, doc, session);
        await audit.record({ req, action: `${entityType}.create`, entityType, entityId: doc._id, after: doc }, { session });
        return doc;
      });
    },

    async update(req, id, patch) {
      return withTransaction(async (session) => {
        const doc = await model.findOne(byId(id, baseFilter(req))).session(session);
        if (!doc) throw notFound(`${entityType} not found.`);
        if (assertWritable) await assertWritable(req, doc, patch);
        const before = doc.toObject();
        const changes = beforeUpdate ? await beforeUpdate(req, doc, patch, session) : patch;
        doc.set(changes);
        await doc.save({ session });
        await audit.record({ req, action: `${entityType}.update`, entityType, entityId: doc._id, before, after: doc }, { session });
        return doc;
      });
    },

    // Academic records are never deleted: archiving keeps history intact.
    async archive(req, id, reason) {
      return withTransaction(async (session) => {
        const doc = await model.findOne(byId(id, baseFilter(req))).session(session);
        if (!doc) throw notFound(`${entityType} not found.`);
        if (assertWritable) await assertWritable(req, doc, {});
        const before = doc.toObject();
        doc.set(archiveValue);
        await doc.save({ session });
        await audit.record({ req, action: `${entityType}.archive`, entityType, entityId: doc._id, before, after: doc, reason }, { session });
        return doc;
      });
    },
  };

  const router = express.Router();
  const read = requirePermission(permission.read);
  const write = requirePermission(permission.write, { min: writeMin });

  router.get('/', read, validate({ query: listQuery }), asyncHandler(async (req, res) => {
    const { items, meta } = await service.list(req, req.valid.query);
    ok(res, items, meta);
  }));
  router.get('/:id', read, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.get(req, req.params.id))));
  router.post('/', write, validate({ body: schemas.create }), asyncHandler(async (req, res) => created(res, await service.create(req, req.body))));
  router.patch('/:id', write, validate({ params: idParams, body: schemas.update }), asyncHandler(async (req, res) => ok(res, await service.update(req, req.params.id, req.body))));
  router.post('/:id/archive', write, validate({ params: idParams }), asyncHandler(async (req, res) => ok(res, await service.archive(req, req.params.id, req.body && req.body.reason))));

  return { router, service };
};

module.exports = { crudModule };
