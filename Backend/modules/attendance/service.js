const mongoose = require('mongoose');
const { ClassSession, AttendanceRecord, AttendanceCorrectionRequest } = require('./model');
const { summarise } = require('./attendanceMath');
const access = require('./access');
const { Staff } = require('../staff/model');
const { SubjectRegistration } = require('../registration/model');
const Student = require('../../models/Student');
const { paginate, buildSort } = require('../../core/pagination');
const { notFound, badRequest, conflict, unprocessable, forbidden } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { byId } = require('../../core/scope');
const policy = require('../../core/policy');
const audit = require('../../core/audit');
const notify = require('../../core/notify');

/* -------------------------------- sessions -------------------------------- */
const createSession = async (req, body) => {
  return withTransaction(async (session) => {
    const { offering } = await access.assertOfferingAccess(req, body.offering, body.componentType, session);
    if (!['open', 'running'].includes(offering.status)) throw conflict('Sessions can only be created for open or running offerings.', null, 'OFFERING_NOT_ACTIVE');
    if (body.endsAt <= body.startsAt) throw unprocessable('endsAt must be after startsAt.', null, 'TIME_RANGE_INVALID');
    let conductedBy = body.conductedBy || req.access.staffId || null;
    if (conductedBy && !(await Staff.exists({ _id: conductedBy }).session(session))) throw badRequest('Staff member not found.', null, 'STAFF_INVALID');
    const [doc] = await ClassSession.create([{ ...body, conductedBy, createdBy: req.user.id }], { session });
    await audit.record({ req, action: 'attendance.session_create', entityType: 'ClassSession', entityId: doc._id, after: doc }, { session });
    return doc;
  });
};

const listSessions = async (req, query) => {
  const user = {};
  for (const f of ['offering', 'componentType', 'status']) if (query[f]) user[f] = query[f];
  if (query.from || query.to) user.startsAt = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) };
  const filter = access.and(await access.offeringFilterFor(req), user); // user filters can only narrow the scope, never widen it
  return paginate(ClassSession, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['startsAt', 'createdAt'], '-startsAt') });
};

const loadSession = async (req, id, session) => {
  let q = ClassSession.findById(id);
  if (session) q = q.session(session);
  const doc = await q;
  if (!doc) throw notFound('Session not found.');
  return doc;
};

const getSession = async (req, id) => {
  const doc = await loadSession(req, id);
  if (!(await access.canReadComponent(req, doc.offering, doc.componentType))) throw notFound('Session not found.');
  return doc;
};

const cancelSession = async (req, id, reason) => {
  return withTransaction(async (session) => {
    const doc = await loadSession(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (doc.status === 'cancelled') throw conflict('The session is already cancelled.', null, 'ALREADY_CANCELLED');
    if (await AttendanceRecord.exists({ session: doc._id }).session(session)) throw conflict('Attendance was already marked for this session; it cannot be cancelled. Use corrections instead.', null, 'HAS_RECORDS');
    const before = doc.toObject();
    doc.status = 'cancelled';
    doc.cancelReason = reason || '';
    await doc.save({ session });
    await audit.record({ req, action: 'attendance.session_cancel', entityType: 'ClassSession', entityId: doc._id, before, after: doc, reason }, { session });
    return doc;
  });
};

/* --------------------------------- records --------------------------------- */
/** Bulk-mark attendance. Only students with an approved registration can be marked; changing an existing mark needs a reason. */
const markRecords = async (req, sessionId, items) => {
  return withTransaction(async (session) => {
    const cs = await loadSession(req, sessionId, session);
    await access.assertOfferingAccess(req, cs.offering, cs.componentType, session);
    if (cs.status === 'cancelled') throw conflict('The session was cancelled.', null, 'SESSION_CANCELLED');
    if (cs.startsAt > new Date()) throw conflict('Attendance cannot be marked before the session starts.', null, 'SESSION_NOT_STARTED');
    const registered = new Set(await access.registeredStudentIds(cs.offering, session));
    const seen = new Set();
    const out = { created: 0, updated: 0, unchanged: 0 };
    for (const it of items) {
      const sid = String(it.student);
      if (seen.has(sid)) throw unprocessable('A student appears twice in the request.', { student: sid }, 'DUPLICATE_STUDENT');
      seen.add(sid);
      if (!registered.has(sid)) throw unprocessable('The student does not have an approved registration for this offering.', { student: sid }, 'STUDENT_NOT_REGISTERED');
    }
    for (const it of items) {
      const existing = await AttendanceRecord.findOne({ session: cs._id, student: it.student }).session(session);
      if (existing) {
        if (existing.status === it.status) {
          out.unchanged += 1;
          continue;
        }
        if (!(it.reason || '').trim()) throw unprocessable('A reason is required to change recorded attendance.', { student: String(it.student) }, 'REASON_REQUIRED');
        const before = { status: existing.status };
        existing.status = it.status;
        existing.markedBy = req.user.id;
        existing.history.push({ status: it.status, at: new Date(), by: req.user.id, reason: it.reason });
        await existing.save({ session });
        await audit.record({ req, action: 'attendance.record_change', entityType: 'AttendanceRecord', entityId: existing._id, before, after: { status: it.status }, reason: it.reason }, { session });
        out.updated += 1;
      } else {
        await AttendanceRecord.create([{ session: cs._id, student: it.student, offering: cs.offering, componentType: cs.componentType, status: it.status, markedBy: req.user.id, history: [{ status: it.status, by: req.user.id, reason: it.reason || 'Initial marking' }] }], { session });
        out.created += 1;
      }
    }
    if (cs.status !== 'conducted') {
      cs.status = 'conducted';
      await cs.save({ session });
    }
    await audit.record({ req, action: 'attendance.mark', entityType: 'ClassSession', entityId: cs._id, after: out }, { session });
    return out;
  });
};

const listRecords = async (req, sessionId) => {
  const cs = await getSession(req, sessionId);
  const filter = { session: cs._id };
  if (req.access.scope === 'own') filter.student = req.access.studentId || null;
  return AttendanceRecord.find(filter).populate({ path: 'student', select: 'studentId fullName' }).lean();
};

/* --------------------------------- summary --------------------------------- */
const policyFor = async (programme) => ({
  // eligibility uses only APPROVED policies; an unconfirmed value is never used to judge a student
  minPercent: await policy.getOr('attendance.minPercent', undefined, { programme }, { requireActive: true }),
  excusedCountsAsPresent: await policy.getOr('attendance.excusedCountsAsPresent', undefined, { programme }, { requireActive: true }),
});

const summariseStudent = async (studentId, offeringId, filter) => {
  const rows = await AttendanceRecord.find(access.and({ student: studentId, ...(offeringId ? { offering: offeringId } : {}) }, filter)).lean();
  const byOffering = new Map();
  for (const r of rows) byOffering.set(String(r.offering), [...(byOffering.get(String(r.offering)) || []), r]);
  const student = await Student.findById(studentId).select('programmeRef studentId fullName').lean();
  const pol = await policyFor(student && student.programmeRef);
  const out = [];
  for (const [offering, list] of byOffering) {
    const { offering: o, course } = await access.loadOffering(offering);
    const conducted = await mongoose.models.ClassSession.countDocuments({ offering, status: 'conducted' });
    const summary = summarise(list, pol);
    out.push({ offering, course: { code: course.code, title: course.title }, summary: { ...summary, unrecorded: Math.max(0, conducted - summary.total) }, offeringStatus: o.status });
  }
  return { student: { id: String(studentId), studentId: student && student.studentId, fullName: student && student.fullName }, policy: pol, offerings: out };
};

/** own: the signed-in student. Staff: ?student=... (one student) or ?offering=... (class list). */
const summary = async (req, { student, offering }) => {
  const scopeFilter = await access.readFilter(req);
  const compFilter = req.access.scope === 'own' ? {} : scopeFilter;
  if (req.access.scope === 'own') return summariseStudent(req.access.studentId, offering, {});
  if (student) {
    await access.assertStudentReadable(req, student);
    return summariseStudent(student, offering, compFilter);
  }
  if (!offering) throw badRequest('Provide student or offering.', null, 'QUERY_REQUIRED');
  if (!(await access.canReadComponent(req, offering))) throw notFound('Course offering not found.');
  const ids = await access.registeredStudentIds(offering);
  const rows = [];
  for (const sid of ids) rows.push(await summariseStudent(sid, offering, compFilter));
  return rows;
};

/* ------------------------------- corrections ------------------------------- */
const createCorrection = async (req, body) => {
  return withTransaction(async (session) => {
    const record = await AttendanceRecord.findById(body.record).session(session);
    if (!record) throw notFound('Attendance record not found.');
    if (req.access.scope === 'own') {
      if (String(record.student) !== String(req.access.studentId)) throw forbidden('You can only request corrections to your own attendance.', 'OUT_OF_SCOPE');
    } else {
      await access.assertOfferingAccess(req, record.offering, record.componentType, session);
    }
    if (record.status === body.requestedStatus) throw conflict('The record already has that status.', null, 'NO_CHANGE');
    const [doc] = await AttendanceCorrectionRequest.create([{ record: record._id, session: record.session, student: record.student, offering: record.offering, componentType: record.componentType, currentStatus: record.status, requestedStatus: body.requestedStatus, reason: body.reason, requestedBy: req.user.id }], { session });
    await audit.record({ req, action: 'attendance.correction_request', entityType: 'AttendanceCorrectionRequest', entityId: doc._id, after: doc, reason: body.reason }, { session });
    return doc;
  });
};

const listCorrections = async (req, query) => {
  const user = {};
  for (const f of ['status', 'offering', 'student']) if (query[f]) user[f] = query[f];
  const filter = access.and(await access.readFilter(req), user);
  return paginate(AttendanceCorrectionRequest, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'status'], '-createdAt') });
};

// Applies a status change to a record, keeping history + audit. Used by the decision endpoint and by the generic request engine.
const applyStatusChange = async ({ req, record, status, reason, session }) => {
  const before = { status: record.status };
  record.status = status;
  record.markedBy = req.user.id;
  record.history.push({ status, at: new Date(), by: req.user.id, reason });
  await record.save({ session });
  await audit.record({ req, action: 'attendance.record_change', entityType: 'AttendanceRecord', entityId: record._id, before, after: { status }, reason }, { session });
};

const decideCorrection = async (req, id, { decision, remarks }) => {
  const result = await withTransaction(async (session) => {
    const c = await AttendanceCorrectionRequest.findOne(byId(id, await access.readFilter(req))).session(session);
    if (!c) throw notFound('Correction request not found.');
    await access.assertOfferingAccess(req, c.offering, c.componentType, session);
    if (c.status !== 'pending') throw conflict(`This correction is already ${c.status}.`, null, 'ALREADY_DECIDED');
    if (decision === 'reject' && !(remarks || '').trim()) throw unprocessable('A reason is required to reject a correction.', null, 'REMARKS_REQUIRED');
    if (decision === 'approve') {
      const record = await AttendanceRecord.findById(c.record).session(session);
      await applyStatusChange({ req, record, status: c.requestedStatus, reason: `Correction approved: ${c.reason}`, session });
    }
    c.status = decision === 'approve' ? 'approved' : 'rejected';
    c.decidedBy = req.user.id;
    c.decidedAt = new Date();
    c.decisionRemarks = remarks || '';
    await c.save({ session });
    await audit.record({ req, action: `attendance.correction_${c.status}`, entityType: 'AttendanceCorrectionRequest', entityId: c._id, after: c, reason: remarks }, { session });
    return c;
  });
  const student = await Student.findById(result.student).select('user').lean();
  await notify.send({ userId: student && student.user, eventType: `attendance.correction_${result.status}`, title: `Attendance correction ${result.status}`, message: `Your attendance correction request was ${result.status}.`, entityType: 'AttendanceCorrectionRequest', entityId: result._id });
  return result;
};

module.exports = { summariseStudent, createSession, listSessions, getSession, cancelSession, markRecords, listRecords, summary, createCorrection, listCorrections, decideCorrection, applyStatusChange };
