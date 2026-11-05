/**
 * Storage layer. Every controller talks to this module only, so the same code runs against
 * MongoDB (when connected) or a pure in-memory store (demo mode without a database).
 *
 * In memory mode records are real Mongoose documents that are never persisted: schema
 * defaults and validation behave identically in both modes.
 */
const mongoose = require('mongoose');
const ProcessRequest = require('../models/ProcessRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { normalizeRole, deptCode } = require('../utils/roles');

const connected = () => mongoose.connection.readyState === 1;

const mem = {
  processes: [],
  notifications: [],
  users: [],
  settings: {},
};

// Serialises tracking-number allocation so two simultaneous submissions never collide.
let lock = Promise.resolve();
const withLock = (fn) => {
  const run = lock.then(fn, fn);
  lock = run.catch(() => {});
  return run;
};

const isObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
const byUpdatedDesc = (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);

/* ------------------------------ processes ------------------------------ */
const processes = {
  async all() {
    if (connected()) return ProcessRequest.find({}).sort({ updatedAt: -1 });
    return [...mem.processes].sort(byUpdatedDesc);
  },

  async find(idOrTracking, { withReceipt = false } = {}) {
    if (!idOrTracking) return null;
    const key = String(idOrTracking);
    if (connected()) {
      const select = withReceipt ? '+receiptFile.dataUrl' : '';
      let doc = null;
      if (isObjectId(key)) doc = await ProcessRequest.findById(key).select(select);
      if (!doc) doc = await ProcessRequest.findOne({ trackingNumber: key }).select(select);
      return doc;
    }
    return mem.processes.find((p) => p.trackingNumber === key || String(p._id) === key) || null;
  },

  async create(data) {
    return withLock(async () => {
      const doc = new ProcessRequest(data);
      if (!doc.trackingNumber) doc.trackingNumber = await processes.nextTrackingNumber(data.trackingPrefix || 'REQ');
      if (connected()) {
        await doc.save();
      } else {
        await doc.validate();
        doc.createdAt = doc.updatedAt = new Date();
        mem.processes.unshift(doc);
      }
      return doc;
    });
  },

  async save(doc) {
    if (connected()) {
      await doc.save();
    } else {
      await doc.validate();
      doc.updatedAt = new Date();
    }
    return doc;
  },

  async nextTrackingNumber(prefix) {
    const year = new Date().getFullYear();
    const stem = `${prefix}-${year}-`;
    const existing = (await processes.all()).map((p) => p.trackingNumber).filter((t) => t && t.startsWith(stem));
    const highest = existing.reduce((max, t) => {
      const n = parseInt(t.slice(stem.length), 10);
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);
    return `${stem}${String(highest + 1).padStart(4, '0')}`;
  },
};

/* ---------------------------- notifications ---------------------------- */
const roleMatches = (n, user) => n.recipientRole === normalizeRole(user.role);

const departmentMatches = (n, user) => {
  const target = String(n.recipientDepartment || 'ALL').trim();
  if (!target || target.toUpperCase() === 'ALL') return true;
  if (!user.department) return true;
  return deptCode(target) === deptCode(user.department) || deptCode(target) === 'FACULTY';
};

const emailMatches = (n, user) => !n.recipientEmail || n.recipientEmail === String(user.email || '').toLowerCase();

const notifications = {
  async create(data) {
    const payload = { ...data, recipientRole: normalizeRole(data.recipientRole) };
    if (connected()) return Notification.create(payload);
    const doc = new Notification(payload);
    doc.createdAt = doc.updatedAt = new Date();
    mem.notifications.unshift(doc);
    return doc;
  },

  // Notifications visible to the signed-in user, newest first.
  async forUser(user) {
    const role = normalizeRole(user.role);
    let list;
    if (connected()) list = await Notification.find({ recipientRole: role }).sort({ createdAt: -1 }).limit(300);
    else list = mem.notifications.filter((n) => n.recipientRole === role);
    return list.filter((n) => roleMatches(n, user) && departmentMatches(n, user) && emailMatches(n, user));
  },

  async find(id) {
    if (connected()) return isObjectId(String(id)) ? Notification.findById(id) : null;
    return mem.notifications.find((n) => String(n._id) === String(id)) || null;
  },

  async save(doc) {
    if (connected()) await doc.save();
    else doc.updatedAt = new Date();
    return doc;
  },

  isReadBy(doc, user) {
    return (doc.readBy || []).includes(String(user.email || '').toLowerCase());
  },

  async delete(id) {
    if (connected()) {
      if (isObjectId(String(id))) await Notification.findByIdAndDelete(id);
    }
    mem.notifications = mem.notifications.filter((n) => String(n._id) !== String(id));
    return true;
  },

  async deleteAllForUser(user) {
    const userNotifs = await this.forUser(user);
    const ids = userNotifs.map((n) => String(n._id));
    if (connected()) {
      await Notification.deleteMany({ _id: { $in: ids } });
    }
    mem.notifications = mem.notifications.filter((n) => !ids.includes(String(n._id)));
    return true;
  },
};

/* -------------------------------- users -------------------------------- */
const users = {
  async all() {
    if (connected()) return User.find({});
    return [...mem.users];
  },
  async findByEmail(email) {
    const clean = String(email || '').trim().toLowerCase();
    if (!clean) return null;
    if (connected()) return User.findOne({ email: clean });
    return mem.users.find((u) => u.email === clean) || null;
  },
  async findByEmailOrUsername(identifier) {
    const clean = String(identifier || '').trim().toLowerCase();
    if (!clean) return null;
    if (connected()) {
      return User.findOne({
        $or: [
          { email: clean },
          { regNo: new RegExp(`^${clean.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
        ]
      });
    }
    return mem.users.find((u) => (u.email && u.email.toLowerCase() === clean) || (u.regNo && u.regNo.toLowerCase() === clean)) || null;
  },
  async createOrUpdate(userData) {
    const email = String(userData.email || '').trim().toLowerCase();
    if (connected()) {
      let user = await User.findOne({ email });
      if (user) {
        Object.assign(user, userData);
        await user.save();
        return user;
      } else {
        user = new User(userData);
        await user.save();
        return user;
      }
    }
    const idx = mem.users.findIndex((u) => u.email.toLowerCase() === email);
    const userDoc = new User(userData);
    if (idx >= 0) {
      mem.users[idx] = userDoc;
    } else {
      mem.users.unshift(userDoc);
    }
    return userDoc;
  },
  async save(doc) {
    if (connected()) await doc.save();
    return doc;
  },
};

/* ------------------------------- settings ------------------------------- */
const settings = {
  async get(key, fallback) {
    if (connected()) {
      const doc = await Setting.findOne({ key });
      return doc ? doc.value : fallback;
    }
    return key in mem.settings ? mem.settings[key] : fallback;
  },
  async set(key, value) {
    if (connected()) {
      await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, returnDocument: 'after' });
    } else {
      mem.settings[key] = value;
    }
    return value;
  },
};

/* ------------------------------ initialise ------------------------------ */
// Called once after the database connection attempt. Seeds either MongoDB or the memory store.
const initialise = async ({ seedUsers, seedProcesses, seedNotifications }) => {
  if (connected()) {
    const existingEmails = new Set((await User.find({}, 'email')).map((u) => u.email));
    const missing = seedUsers.filter((u) => !existingEmails.has(u.email));
    if (missing.length) {
      await User.insertMany(missing);
      console.log(` Seeded ${missing.length} demo user(s).`);
    }
    for (const proc of seedProcesses) {
      await ProcessRequest.findOneAndUpdate({ trackingNumber: proc.trackingNumber }, { $setOnInsert: proc }, { upsert: true, timestamps: false });
    }
    if ((await Notification.countDocuments()) === 0 && seedNotifications.length) {
      await Notification.insertMany(seedNotifications);
    }
    return;
  }

  mem.users = seedUsers.map((u) => new User(u));
  mem.processes = seedProcesses.map((p) => {
    const doc = new ProcessRequest(p);
    doc.createdAt = doc.updatedAt = p.createdAt || new Date();
    return doc;
  });
  mem.notifications = seedNotifications.map((n) => {
    const doc = new Notification(n);
    doc.createdAt = n.createdAt || new Date();
    return doc;
  });
};

module.exports = { connected, processes, notifications, users, settings, initialise, withLock };
