/**
 * /api/v1/notifications - paginated notification centre over the existing Notification model.
 * The legacy /api/notifications routes are untouched and keep working.
 */
const express = require('express');
const mongoose = require('mongoose');
const store = require('../../store');
const notify = require('../../core/notify');
const { z, validate, objectId } = require('../../core/validate');
const { listQuery } = require('../../core/pagination');
const { asyncHandler, ok, notFound, forbidden, badRequest } = require('../../core/http');
const { requirePermission, ROLE_CATALOG } = require('../../core/rbac');
const { withTransaction } = require('../../core/transaction');
const audit = require('../../core/audit');

const shape = (doc, user) => {
  const n = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: String(n._id), title: n.title, message: n.message, type: n.type, eventType: n.eventType || '', priority: n.priority,
    entityType: n.entityType || '', entityId: n.entityId || '', trackingNumber: n.trackingNumber || '', targetTab: n.targetTab || '',
    isRead: store.notifications.isReadBy(doc, user), createdAt: n.createdAt,
  };
};

const markRead = async (doc, user) => {
  const email = String(user.email || '').toLowerCase();
  if (!doc.readBy.includes(email)) {
    doc.readBy.push(email);
    doc.isRead = true;
    doc.readAt = new Date();
    await store.notifications.save(doc);
  }
};

const router = express.Router();
const read = requirePermission('notifications.read');

router.get('/', read, validate({ query: listQuery.and(z.object({ unread: z.enum(['true', 'false']).optional(), eventType: z.string().optional() })) }), asyncHandler(async (req, res) => {
  const q = req.valid.query;
  let rows = (await store.notifications.forUser(req.user)).map((d) => shape(d, req.user));
  if (q.unread === 'true') rows = rows.filter((n) => !n.isRead);
  if (q.eventType) rows = rows.filter((n) => n.eventType === q.eventType);
  const unreadCount = rows.filter((n) => !n.isRead).length;
  const total = rows.length;
  const items = rows.slice((q.page - 1) * q.limit, q.page * q.limit);
  ok(res, items, { page: q.page, limit: q.limit, total, pages: Math.max(1, Math.ceil(total / q.limit)), unreadCount });
}));

router.get('/unread-count', read, asyncHandler(async (req, res) => {
  const rows = await store.notifications.forUser(req.user);
  ok(res, { unreadCount: rows.filter((n) => !store.notifications.isReadBy(n, req.user)).length });
}));

router.put('/read-all', read, asyncHandler(async (req, res) => {
  const rows = await store.notifications.forUser(req.user);
  for (const doc of rows) await markRead(doc, req.user);
  ok(res, { marked: rows.length });
}));

router.put('/:id/read', read, validate({ params: z.object({ id: objectId }) }), asyncHandler(async (req, res) => {
  const doc = await store.notifications.find(req.params.id);
  const visible = doc && (await store.notifications.forUser(req.user)).some((n) => String(n._id) === String(doc._id));
  if (!visible) throw notFound('Notification not found.');
  await markRead(doc, req.user);
  ok(res, shape(doc, req.user));
}));

// Announcements: faculty / system scope may reach any role; a department-scoped sender only their own department.
router.post('/broadcast', requirePermission('notifications.broadcast'), validate({ body: z.object({
  title: z.string().trim().min(3).max(150), message: z.string().trim().min(3).max(2000),
  roles: z.array(z.string().trim().toLowerCase()).min(1).max(10), department: objectId.optional(),
  eventType: z.string().trim().max(60).optional(), priority: z.enum(['normal', 'high', 'urgent']).optional(),
}) }), asyncHandler(async (req, res) => {
  const { roles, department, title, message, eventType, priority } = req.body;
  const unknown = roles.filter((r) => !ROLE_CATALOG[r]);
  if (unknown.length) throw badRequest(`Unknown role(s): ${unknown.join(', ')}.`, null, 'ROLE_UNKNOWN');
  let dept = department;
  if (!['faculty', 'system'].includes(req.access.scope)) {
    if (!dept) dept = req.access.departments[0];
    if (!dept || !req.access.departments.includes(String(dept))) throw forbidden('You can only send announcements to your own department.', 'OUT_OF_SCOPE');
  }
  let recipients = 0;
  for (const role of roles) recipients += await notify.sendToRole(role, { title, message, eventType: eventType || 'announcement', priority: priority || 'normal', entityType: 'Announcement' }, { department: dept });
  await withTransaction(async (session) => audit.record({ req, action: 'notification.broadcast', entityType: 'Notification', entityId: eventType || 'announcement', after: { roles, department: dept || null, recipients, title } }, { session }));
  ok(res, { recipients });
}));

module.exports = { routes: [{ path: 'notifications', router }], mongoose };
