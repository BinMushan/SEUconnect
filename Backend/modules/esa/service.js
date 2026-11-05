const mongoose = require('mongoose');
const { ESASchedule, ESAMark } = require('./model');
const { moveStatus } = require('../assessments/workflow');
const { applyMarks, missingStudents } = require('../assessments/marks');
const access = require('../attendance/access');
const attendance = require('../attendance/service');
const { Staff } = require('../staff/model');
const { paginate, buildSort } = require('../../core/pagination');
const { notFound, conflict, forbidden, unprocessable, badRequest, ApiError } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { byId } = require('../../core/scope');
const audit = require('../../core/audit');

const VISIBLE_MARKS = ['approved', 'locked'];

const dayRange = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return { $gte: start, $lt: new Date(start.getTime() + 86400000) };
};
const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd; // 'HH:mm' strings compare correctly

/** A venue or an invigilator cannot be in two overlapping exams at once. */
const checkClashes = async ({ date, startTime, endTime, venue, invigilators, ignoreId }, session) => {
  const sameDay = await ESASchedule.find({ date: dayRange(date), status: { $ne: 'cancelled' }, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) }).session(session).lean();
  for (const other of sameDay) {
    if (!overlaps(startTime, endTime, other.startTime, other.endTime)) continue;
    if (other.venue.trim().toLowerCase() === venue.trim().toLowerCase()) throw conflict(`The venue is already booked ${other.startTime}-${other.endTime}.`, { schedule: String(other._id) }, 'VENUE_CLASH');
    const shared = (invigilators || []).filter((i) => (other.invigilators || []).map(String).includes(String(i)));
    if (shared.length) throw conflict('An invigilator is already assigned to another exam at that time.', { staff: shared.map(String), schedule: String(other._id) }, 'INVIGILATOR_CLASH');
  }
};

const checkInvigilators = async (ids, session) => {
  if (!ids || !ids.length) return;
  const unique = [...new Set(ids.map(String))];
  const found = await Staff.countDocuments({ _id: { $in: unique }, employmentStatus: 'active' }).session(session);
  if (found !== unique.length) throw badRequest('One or more invigilators do not exist or are not active.', null, 'INVIGILATOR_INVALID');
};

const createSchedule = async (req, body) => {
  return withTransaction(async (session) => {
    const { offering } = await access.assertOfferingAccess(req, body.offering, body.componentType, session);
    if (!['open', 'running'].includes(offering.status)) throw conflict('Exams can only be scheduled for open or running offerings.', null, 'OFFERING_NOT_ACTIVE');
    if (body.endTime <= body.startTime) throw unprocessable('endTime must be after startTime.', null, 'TIME_RANGE_INVALID');
    await checkInvigilators(body.invigilators, session);
    await checkClashes(body, session);
    const [doc] = await ESASchedule.create([{ ...body, createdBy: req.user.id, statusHistory: [{ status: 'scheduled', by: req.user.id, reason: 'Scheduled' }] }], { session });
    await audit.record({ req, action: 'esa.schedule_create', entityType: 'ESASchedule', entityId: doc._id, after: doc }, { session });
    return doc;
  });
};

const scopeFor = async (req) => access.offeringFilterFor(req);

const list = async (req, query) => {
  const user = {};
  for (const f of ['offering', 'componentType', 'status', 'format']) if (query[f]) user[f] = query[f];
  if (query.from || query.to) user.date = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) };
  return paginate(ESASchedule, access.and(await scopeFor(req), user), { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['date', 'createdAt'], 'date') });
};

const load = async (req, id, session) => {
  let q = ESASchedule.findOne(byId(id, await scopeFor(req)));
  if (session) q = q.session(session);
  const doc = await q;
  if (!doc) throw notFound('ESA schedule not found.');
  return doc;
};

const get = async (req, id) => load(req, id);

const update = async (req, id, patch) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (doc.status !== 'scheduled') throw conflict('Only scheduled exams can be changed.', null, 'SCHEDULE_LOCKED');
    const next = { date: doc.date, startTime: doc.startTime, endTime: doc.endTime, venue: doc.venue, invigilators: doc.invigilators, ...patch };
    if (next.endTime <= next.startTime) throw unprocessable('endTime must be after startTime.', null, 'TIME_RANGE_INVALID');
    await checkInvigilators(next.invigilators, session);
    await checkClashes({ ...next, ignoreId: doc._id }, session);
    const before = doc.toObject();
    doc.set(patch);
    await doc.save({ session });
    await audit.record({ req, action: 'esa.schedule_update', entityType: 'ESASchedule', entityId: doc._id, before, after: doc }, { session });
    return doc;
  });
};

const cancel = async (req, id, reason) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (await ESAMark.exists({ schedule: doc._id }).session(session)) throw conflict('Marks already exist for this exam; it cannot be cancelled.', null, 'HAS_MARKS');
    const before = { status: doc.status };
    moveStatus(doc, 'cancelled', req, { reason });
    await doc.save({ session });
    await audit.record({ req, action: 'esa.schedule_cancel', entityType: 'ESASchedule', entityId: doc._id, before, after: { status: 'cancelled' }, reason }, { session });
    return doc;
  });
};

/* ------------------------------- eligibility ------------------------------- */
const eligibilityOf = async (studentId, offeringId) => {
  const s = await attendance.summariseStudent(studentId, offeringId, {});
  return s.offerings.length ? s.offerings[0].summary.eligibility : 'no_sessions';
};

const eligibility = async (req, id) => {
  const doc = await load(req, id);
  if (!(await access.canReadComponent(req, doc.offering, doc.componentType))) throw notFound('ESA schedule not found.');
  const ids = await access.registeredStudentIds(doc.offering);
  const rows = [];
  for (const sid of ids) rows.push({ student: sid, eligibility: await eligibilityOf(sid, doc.offering) });
  return { schedule: String(doc._id), students: rows };
};

/* ---------------------------------- marks ---------------------------------- */
const transition = async (req, id, to, reason) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (to === 'submitted') {
      const registered = await access.registeredStudentIds(doc.offering, session);
      const missing = await missingStudents({ MarkModel: ESAMark, parentField: 'schedule', parent: doc, registered, session });
      if (missing.length) throw new ApiError(422, 'MARKS_INCOMPLETE', 'Every registered student needs a mark (or an explicit absent flag) before the marks can be submitted.', { missing });
    }
    const before = { status: doc.status };
    moveStatus(doc, to, req, { reason });
    await doc.save({ session });
    await audit.record({ req, action: `esa.${to}`, entityType: 'ESASchedule', entityId: doc._id, before, after: { status: doc.status }, reason }, { session });
    return doc;
  });
};

const putMarks = async (req, id, items) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (doc.status !== 'open') {
      const locked = ['approved', 'locked'].includes(doc.status);
      throw conflict(locked ? 'These marks are approved. Changes need an approved correction.' : `Marks can only be entered while the exam is open for marking (it is ${doc.status}).`, null, locked ? 'MARKS_LOCKED' : 'ESA_NOT_OPEN');
    }
    // eligibility comes from the attendance policy; an unknown / unconfigured policy never blocks marking
    const eligibilityMap = {};
    const canOverride = ['department', 'faculty', 'system'].includes(req.access.scope);
    for (const it of items) {
      const e = await eligibilityOf(it.student, doc.offering);
      eligibilityMap[String(it.student)] = e;
      if (e === 'ineligible' && !it.absent) {
        if (!(it.eligibilityOverride && (it.eligibilityOverride.reason || '').trim())) throw new ApiError(422, 'ESA_NOT_ELIGIBLE', 'The student is not eligible for the examination (attendance). An authorised officer may override with a reason.', { student: String(it.student) });
        if (!canOverride) throw forbidden('Only a department-level officer can override exam eligibility.', 'OVERRIDE_NOT_ALLOWED');
      }
    }
    const overrides = Object.fromEntries(items.filter((i) => i.eligibilityOverride).map((i) => [String(i.student), i.eligibilityOverride.reason]));
    const registered = new Set(await access.registeredStudentIds(doc.offering, session));
    const result = await applyMarks({
      MarkModel: ESAMark, parentField: 'schedule', parent: doc, items, allowedStudents: registered, maxMarks: doc.maxMarks, req, session,
      extra: (sid) => ({ eligibility: eligibilityMap[sid], ...(overrides[sid] ? { eligibilityOverride: { reason: overrides[sid], by: req.user.id } } : {}) }),
    });
    await audit.record({ req, action: 'esa.marks_entered', entityType: 'ESASchedule', entityId: doc._id, after: { created: result.created, updated: result.updated }, before: result.changes.filter((c) => c.from).map((c) => ({ student: c.student, ...c.from })) }, { session });
    return { created: result.created, updated: result.updated, unchanged: result.unchanged };
  });
};

const getMarks = async (req, id) => {
  const doc = await load(req, id);
  if (req.access.scope === 'own') {
    if (!VISIBLE_MARKS.includes(doc.status)) return [];
    return ESAMark.find({ schedule: doc._id, student: req.access.studentId || null }).select('-history').lean();
  }
  if (!(await access.canReadComponent(req, doc.offering, doc.componentType))) throw notFound('ESA schedule not found.');
  return ESAMark.find({ schedule: doc._id }).populate({ path: 'student', select: 'studentId fullName' }).lean();
};

/* ----------------------- corrections after approval ----------------------- */
const requestCorrection = async (req, id, body) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (!VISIBLE_MARKS.includes(doc.status)) throw conflict('Corrections are only needed (and allowed) once marks are approved or locked.', null, 'NOT_APPROVED');
    if (!(await ESAMark.exists({ schedule: doc._id, student: body.student }).session(session))) throw notFound('That student has no mark for this exam.');
    if (!body.absent && (typeof body.marks !== 'number' || body.marks < 0 || body.marks > doc.maxMarks)) throw unprocessable(`Marks must be between 0 and ${doc.maxMarks}.`, null, 'MARK_OUT_OF_RANGE');
    doc.corrections.push({ student: body.student, newMarks: body.absent ? null : body.marks, newAbsent: Boolean(body.absent), reason: body.reason, requestedBy: req.user.id });
    await doc.save({ session });
    const created = doc.corrections[doc.corrections.length - 1];
    await audit.record({ req, action: 'esa.correction_request', entityType: 'ESASchedule', entityId: doc._id, after: created, reason: body.reason }, { session });
    return created;
  });
};

const decideCorrection = async (req, id, cid, { decision, remarks }) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    const c = doc.corrections.id(cid);
    if (!c) throw notFound('Correction not found.');
    if (c.status !== 'pending') throw conflict(`This correction is already ${c.status}.`, null, 'ALREADY_DECIDED');
    if (String(c.requestedBy) === String(req.user.id)) throw forbidden('A correction must be decided by someone other than the requester.', 'SEGREGATION_OF_DUTIES');
    if (decision === 'reject' && !(remarks || '').trim()) throw unprocessable('A reason is required to reject a correction.', null, 'REMARKS_REQUIRED');
    if (decision === 'approve') {
      const mark = await ESAMark.findOne({ schedule: doc._id, student: c.student }).session(session);
      const before = { marks: mark.marks, absent: mark.absent };
      mark.marks = c.newMarks;
      mark.absent = c.newAbsent;
      mark.enteredBy = req.user.id;
      mark.history.push({ marks: c.newMarks, absent: c.newAbsent, by: req.user.id, reason: `Approved correction: ${c.reason}` });
      await mark.save({ session });
      await mongoose.models.GradeRecord.updateMany({ student: c.student, offering: doc.offering }, { needsRecalculation: true }, { session });
      await audit.record({ req, action: 'esa.mark_corrected', entityType: 'ESAMark', entityId: mark._id, before, after: { marks: c.newMarks, absent: c.newAbsent }, reason: c.reason }, { session });
    }
    c.status = decision === 'approve' ? 'approved' : 'rejected';
    c.decidedBy = req.user.id;
    c.decidedAt = new Date();
    c.decisionRemarks = remarks || '';
    await doc.save({ session });
    await audit.record({ req, action: `esa.correction_${c.status}`, entityType: 'ESASchedule', entityId: doc._id, after: c, reason: remarks }, { session });
    return c;
  });
};

module.exports = { createSchedule, list, get, update, cancel, eligibility, transition, putMarks, getMarks, requestCorrection, decideCorrection };
