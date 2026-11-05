/**
 * Typed access to academic policies stored in the AcademicPolicy collection.
 * Business logic NEVER embeds academic constants: it asks for them here.
 *
 *   await policy.get('registration.maxCredits', { programme })           // active or pending value
 *   await policy.get('grading.rounding', { requireActive: true })        // refuses unconfirmed values
 */
const AcademicPolicy = require('../modules/policy/model');
const { ApiError } = require('./http');

const CACHE_MS = 30 * 1000;
let cache = new Map();

const clearPolicyCache = () => {
  cache = new Map();
};

const specificity = (p, ctx) => {
  const prog = p.scope && p.scope.programme ? String(p.scope.programme) : null;
  const dept = p.scope && p.scope.department ? String(p.scope.department) : null;
  if (prog) return ctx.programme && prog === String(ctx.programme) ? 3 : -1;
  if (dept) return ctx.department && dept === String(ctx.department) ? 2 : -1;
  return 1;
};

/** Returns the most specific applicable policy document, or null. */
const find = async (key, ctx = {}, { requireActive = false, session } = {}) => {
  const cacheKey = `${key}|${ctx.programme || ''}|${ctx.department || ''}|${requireActive}`;
  const hit = cache.get(cacheKey);
  if (!session && hit && Date.now() - hit.at < CACHE_MS) return hit.doc;

  let query = AcademicPolicy.find({ key, status: requireActive ? 'active' : { $in: ['active', 'pending_confirmation'] } }).lean();
  if (session) query = query.session(session);
  const docs = (await query)
    .map((d) => ({ d, s: specificity(d, ctx) }))
    .filter((x) => x.s > 0)
    // prefer confirmed (active) over pending at the same specificity
    .sort((a, b) => b.s - a.s || (a.d.status === 'active' ? -1 : 1) - (b.d.status === 'active' ? -1 : 1));
  const doc = docs.length ? docs[0].d : null;
  if (!session) cache.set(cacheKey, { at: Date.now(), doc });
  return doc;
};

const get = async (key, ctx = {}, opts = {}) => {
  const doc = await find(key, ctx, opts);
  if (!doc) {
    throw new ApiError(422, 'POLICY_NOT_CONFIGURED', `The academic policy "${key}" has not been configured${opts.requireActive ? ' and approved' : ''}. An authorised officer must define it.`);
  }
  return doc.value;
};

const getOr = async (key, fallback, ctx = {}, opts = {}) => {
  const doc = await find(key, ctx, opts);
  return doc ? doc.value : fallback;
};

module.exports = { find, get, getOr, clearPolicyCache };
