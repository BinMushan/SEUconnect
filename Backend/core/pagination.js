const { z } = require('zod');

const MAX_LIMIT = 200;

/** Standard list query: page, limit, sort (comma separated, "-" prefix = descending), q (free text). */
const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(25),
    sort: z.string().trim().optional(),
    q: z.string().trim().max(100).optional(),
  })
  .passthrough();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSort = (sort, allowed, fallback = '-createdAt') => {
  const out = {};
  const parts = String(sort || fallback).split(',').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const dir = part.startsWith('-') ? -1 : 1;
    const field = part.replace(/^[-+]/, '');
    if (allowed.includes(field)) out[field] = dir;
  }
  return Object.keys(out).length ? out : buildSort(fallback, [fallback.replace(/^-/, '')], '-createdAt');
};

// Free text search over a fixed set of fields (the user input is escaped, never used as a regex).
const textFilter = (q, fields) => {
  if (!q || !fields.length) return null;
  const rx = new RegExp(escapeRegex(q), 'i');
  return { $or: fields.map((f) => ({ [f]: rx })) };
};

/**
 * paginate(Model, filter, { page, limit, sort, populate, select, lean })
 * Returns { items, meta:{ page, limit, total, pages } }.
 */
const paginate = async (Model, filter, { page = 1, limit = 25, sort, populate, select, lean = true, session } = {}) => {
  const skip = (page - 1) * limit;
  let query = Model.find(filter);
  if (session) query = query.session(session);
  if (sort) query = query.sort(sort);
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  if (lean) query = query.lean();
  const [items, total] = await Promise.all([query.skip(skip).limit(limit), Model.countDocuments(filter)]);
  return { items, meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
};

module.exports = { listQuery, buildSort, textFilter, paginate, escapeRegex, MAX_LIMIT };
