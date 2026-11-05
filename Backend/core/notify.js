/**
 * Notification service. Business modules call notify.send(...) with an event; delivery is pluggable:
 *   - the in-app channel (the Notification collection read by /api/notifications) is always used
 *   - extra providers (e-mail, SMS, push) are registered with registerProvider() and run best-effort
 *
 *   notify.send({ userId, eventType:'registration.approved', title, message, entityType, entityId, priority })
 *   notify.sendToRole('student', { ...}, { department })
 */
const mongoose = require('mongoose');
const store = require('../store');
const logger = require('./logger');
const { normalizeRole } = require('../utils/roles');

const providers = new Map();

/** provider = async ({ user, notification }) => void. Throwing marks the delivery as failed (never breaks the caller). */
const registerProvider = (name, fn) => providers.set(name, fn);

// Default e-mail provider: logs until a real transport is configured (e.g. registerProvider('email', smtpSender)).
registerProvider('email', async ({ user, notification }) => {
  if (process.env.SMTP_HOST) return; // a real transport replaces this stub by registering its own provider
  logger.debug('E-mail (not configured) would be sent', { to: user && user.email, subject: notification.title });
});

const deliver = async (user, doc) => {
  const deliveries = [];
  for (const [name, fn] of providers) {
    try {
      await fn({ user, notification: doc });
      deliveries.push({ channel: name, status: 'sent', at: new Date() });
    } catch (err) {
      deliveries.push({ channel: name, status: 'failed', at: new Date(), error: err.message });
    }
  }
  return deliveries;
};

const base = (n) => ({
  title: n.title,
  message: n.message,
  type: n.type || n.eventType || 'GENERAL',
  priority: n.priority || 'normal',
  eventType: n.eventType || '',
  entityType: n.entityType || '',
  entityId: n.entityId ? String(n.entityId) : '',
  trackingNumber: n.trackingNumber || '',
  targetTab: n.targetTab || '',
});

/** Notify one user. Missing users are ignored (e.g. a student record without an account). */
const send = async (n) => {
  try {
    if (!n.userId || mongoose.connection.readyState !== 1) return null;
    const user = await mongoose.models.User.findById(n.userId).select('email role departmentRef').lean();
    if (!user) return null;
    const doc = await store.notifications.create({ ...base(n), recipientRole: normalizeRole(user.role), recipientEmail: user.email, recipientUser: user._id, recipientDepartment: 'ALL' });
    const deliveries = await deliver(user, doc);
    if (deliveries.length && mongoose.models.Notification) await mongoose.models.Notification.updateOne({ _id: doc._id }, { $set: { deliveries } });
    return doc;
  } catch (err) {
    logger.error('Notification failed', { event: n.eventType, error: err.message });
    return null;
  }
};

const sendMany = async (userIds, n) => Promise.all([...new Set(userIds.filter(Boolean).map(String))].map((userId) => send({ ...n, userId })));

/** Broadcast to everyone holding a role (optionally limited to a department), one notification per person. */
const sendToRole = async (role, n, { department } = {}) => {
  if (mongoose.connection.readyState !== 1) return 0;
  const filter = { role: normalizeRole(role), status: { $ne: 'disabled' } };
  if (department) filter.departmentRef = department;
  const users = await mongoose.models.User.find(filter).select('_id').lean();
  await sendMany(users.map((u) => u._id), n);
  return users.length;
};

module.exports = { send, sendMany, sendToRole, registerProvider };
