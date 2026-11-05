const AuditLog = require('../modules/audit/model');
const logger = require('./logger');

// Strip secrets and very large values before they are stored in an audit record.
const SENSITIVE = ['password', 'passwordHash', 'token', 'refreshToken', 'dataUrl'];
const sanitise = (value, depth = 0) => {
  if (value == null || depth > 6) return value;
  if (typeof value.toObject === 'function') value = value.toObject();
  if (Array.isArray(value)) return value.map((v) => sanitise(v, depth + 1));
  if (value instanceof Date || typeof value !== 'object') return value;
  if (value._bsontype === 'ObjectId' || typeof value.toHexString === 'function') return String(value);
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE.includes(k)) continue;
    out[k] = sanitise(v, depth + 1);
  }
  return out;
};

const actorOf = (req) => {
  const u = req && req.user;
  return u ? { user: u.id && /^[0-9a-f]{24}$/i.test(u.id) ? u.id : undefined, email: u.email, name: u.name, role: u.role } : { name: 'system', role: 'system' };
};

/**
 * record({ req, action, entityType, entityId, before, after, reason }, { session })
 * Pass the transaction session so the audit entry commits or rolls back with the change.
 */
const record = async ({ req, actor, action, entityType, entityId, before, after, reason }, { session } = {}) => {
  const doc = {
    actor: actor || actorOf(req),
    action,
    entityType,
    entityId: String(entityId),
    before: sanitise(before),
    after: sanitise(after),
    reason: reason || '',
    ip: req && (req.ip || (req.headers && req.headers['x-forwarded-for'])),
    at: new Date(),
  };
  try {
    await AuditLog.create([doc], session ? { session } : undefined);
  } catch (err) {
    // An audit failure inside a transaction must abort the business change; elsewhere log loudly.
    if (session) throw err;
    logger.error('Failed to write audit record', { action, entityType, error: err.message });
  }
};

module.exports = { record, sanitise };
