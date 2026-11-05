const mongoose = require('mongoose');
const { Assessment, StudentAssessmentMark } = require('./model');
const { moveStatus } = require('./workflow');
const { applyMarks, missingStudents } = require('./marks');
const access = require('../attendance/access');
const engine = require('../results/resultEngine');
const { Staff } = require('../staff/model');
const { paginate, buildSort } = require('../../core/pagination');
const { notFound, conflict, forbidden, unprocessable, badRequest, ApiError } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { byId } = require('../../core/scope');
const audit = require('../../core/audit');

const VISIBLE_TO_STUDENTS = ['approved', 'locked'];

/* ------------------------------- assessments ------------------------------- */
const createAssessment = async (req, body) => {
  return withTransaction(async (session) => {
    const { offering } = await access.assertOfferingAccess(req, body.offering, body.componentType, session);
    if (!['open', 'running'].includes(offering.status)) throw conflict('Assessments can only be created for open or running offerings.', null, 'OFFERING_NOT_ACTIVE');
    if (body.assignedStaff && !(await Staff.exists({ _id: body.assignedStaff }).session(session))) throw badRequest('Staff member not found.', null, 'STAFF_INVALID');
    const [doc] = await Assessment.create([{ ...body, assignedStaff: body.assignedStaff || req.access.staffId || null, createdBy: req.user.id, statusHistory: [{ status: 'draft', by: req.user.id, reason: 'Created' }] }], { session });
    await audit.record({ req, action: 'assessment.create', entityType: 'Assessment', entityId: doc._id, after: doc }, { session });
    return doc;
  });
};

const scopeFor = async (req) => {
  if (req.access.scope === 'own') return access.and(await access.offeringFilterFor(req), { status: { $in: VISIBLE_TO_STUDENTS } });
  return access.readFilter(req);
};

const list = async (req, query) => {
  const user = {};
  for (const f of ['offering', 'componentType', 'status', 'type']) if (query[f]) user[f] = query[f];
  return paginate(Assessment, access.and(await scopeFor(req), user), { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'deadline', 'name'], '-createdAt') });
};

const load = async (req, id, session) => {
  let q = Assessment.findOne(byId(id, await scopeFor(req)));
  if (session) q = q.session(session);
  const doc = await q;
  if (!doc) throw notFound('Assessment not found.');
  return doc;
};

const get = async (req, id) => {
  const doc = await load(req, id);
  const o = doc.toObject();
  const siblings = await Assessment.find({ offering: doc.offering, componentType: doc.componentType }).select('weight').lean();
  o.componentWeightTotal = siblings.reduce((s, a) => s + a.weight, 0);
  return o;
};

const update = async (req, id, patch) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (!['draft', 'open'].includes(doc.status)) throw conflict('Only draft or open assessments can be edited.', null, 'ASSESSMENT_LOCKED');
    const before = doc.toObject();
    doc.set(patch);
    await doc.save({ session });
    await audit.record({ req, action: 'assessment.update', entityType: 'Assessment', entityId: doc._id, before, after: doc }, { session });
    return doc;
  });
};

/** open | submit | verify | approve | lock | return (back to open) */
const transition = async (req, id, to, reason) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (to === 'submitted') {
      const registered = await access.registeredStudentIds(doc.offering, session);
      const missing = await missingStudents({ MarkModel: StudentAssessmentMark, parentField: 'assessment', parent: doc, registered, session });
      if (missing.length) throw new ApiError(422, 'MARKS_INCOMPLETE', 'Every registered student needs a mark (or an explicit absent flag) before the marks can be submitted.', { missing });
    }
    const before = { status: doc.status };
    moveStatus(doc, to, req, { reason });
    await doc.save({ session });
    await audit.record({ req, action: `assessment.${to}`, entityType: 'Assessment', entityId: doc._id, before, after: { status: doc.status }, reason }, { session });
    return doc;
  });
};

/* ---------------------------------- marks ---------------------------------- */
const putMarks = async (req, id, items) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (doc.status !== 'open') {
      throw conflict(doc.status === 'locked' || doc.status === 'approved' ? 'These marks are approved. Changes need an approved correction.' : `Marks can only be entered while the assessment is open (it is ${doc.status}).`, null, doc.status === 'locked' || doc.status === 'approved' ? 'MARKS_LOCKED' : 'ASSESSMENT_NOT_OPEN');
    }
    const registered = new Set(await access.registeredStudentIds(doc.offering, session));
    const result = await applyMarks({ MarkModel: StudentAssessmentMark, parentField: 'assessment', parent: doc, items, allowedStudents: registered, maxMarks: doc.maxMarks, req, session });
    await audit.record({ req, action: 'assessment.marks_entered', entityType: 'Assessment', entityId: doc._id, after: { created: result.created, updated: result.updated }, before: result.changes.filter((c) => c.from).map((c) => ({ student: c.student, ...c.from })) }, { session });
    return { created: result.created, updated: result.updated, unchanged: result.unchanged };
  });
};

const getMarks = async (req, id) => {
  const doc = await load(req, id);
  if (req.access.scope === 'own') return StudentAssessmentMark.find({ assessment: doc._id, student: req.access.studentId || null }).select('-history').lean();
  if (!(await access.canReadComponent(req, doc.offering, doc.componentType))) throw notFound('Assessment not found.');
  return StudentAssessmentMark.find({ assessment: doc._id }).populate({ path: 'student', select: 'studentId fullName' }).lean();
};

/* ------------------------ corrections after approval ------------------------ */
const requestCorrection = async (req, id, body) => {
  return withTransaction(async (session) => {
    const doc = await load(req, id, session);
    await access.assertOfferingAccess(req, doc.offering, doc.componentType, session);
    if (!['approved', 'locked'].includes(doc.status)) throw conflict('Corrections are only needed (and allowed) once marks are approved or locked; edit open marks directly.', null, 'NOT_APPROVED');
    if (!(await StudentAssessmentMark.exists({ assessment: doc._id, student: body.student }).session(session))) throw notFound('That student has no mark in this assessment.');
    if (!body.absent && (typeof body.marks !== 'number' || body.marks < 0 || body.marks > doc.maxMarks)) throw unprocessable(`Marks must be between 0 and ${doc.maxMarks}.`, null, 'MARK_OUT_OF_RANGE');
    doc.corrections.push({ student: body.student, newMarks: body.absent ? null : body.marks, newAbsent: Boolean(body.absent), reason: body.reason, requestedBy: req.user.id });
    await doc.save({ session });
    const created = doc.corrections[doc.corrections.length - 1];
    await audit.record({ req, action: 'assessment.correction_request', entityType: 'Assessment', entityId: doc._id, after: created, reason: body.reason }, { session });
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
      const mark = await StudentAssessmentMark.findOne({ assessment: doc._id, student: c.student }).session(session);
      const before = { marks: mark.marks, absent: mark.absent };
      mark.marks = c.newMarks;
      mark.absent = c.newAbsent;
      mark.enteredBy = req.user.id;
      mark.history.push({ marks: c.newMarks, absent: c.newAbsent, by: req.user.id, reason: `Approved correction: ${c.reason}` });
      await mark.save({ session });
      // a result already calculated from the old mark is now stale
      await mongoose.models.GradeRecord.updateMany({ student: c.student, offering: doc.offering }, { needsRecalculation: true }, { session });
      await audit.record({ req, action: 'assessment.mark_corrected', entityType: 'StudentAssessmentMark', entityId: mark._id, before, after: { marks: c.newMarks, absent: c.newAbsent }, reason: c.reason }, { session });
    }
    c.status = decision === 'approve' ? 'approved' : 'rejected';
    c.decidedBy = req.user.id;
    c.decidedAt = new Date();
    c.decisionRemarks = remarks || '';
    await doc.save({ session });
    await audit.record({ req, action: `assessment.correction_${c.status}`, entityType: 'Assessment', entityId: doc._id, after: c, reason: remarks }, { session });
    return c;
  });
};

/* ------------------------------ weighted CA ------------------------------ */
/** CA% per student from APPROVED/LOCKED assessments of a component (pure engine does the arithmetic). */
const caSummary = async (req, { offering, componentType, student }) => {
  if (!(await access.canReadComponent(req, offering, componentType))) throw notFound('Course offering not found.');
  const assessments = await Assessment.find({ offering, componentType }).lean();
  const approved = assessments.filter((a) => VISIBLE_TO_STUDENTS.includes(a.status));
  const pending = assessments.filter((a) => !VISIBLE_TO_STUDENTS.includes(a.status)).map((a) => a.name);
  let students = await access.registeredStudentIds(offering);
  if (req.access.scope === 'own') students = students.filter((s) => s === String(req.access.studentId));
  else if (student) students = students.filter((s) => s === String(student));
  const marks = await StudentAssessmentMark.find({ assessment: { $in: approved.map((a) => a._id) }, student: { $in: students } }).lean();
  const rows = students.map((sid) => {
    const items = approved.map((a) => {
      const m = marks.find((x) => String(x.assessment) === String(a._id) && String(x.student) === sid);
      return { name: a.name, marks: m ? m.marks : null, absent: m ? m.absent : false, maxMarks: a.maxMarks, weight: a.weight };
    });
    try {
      return { student: sid, caPercent: engine.caPercent(items).toNumber() };
    } catch (err) {
      return { student: sid, caPercent: null, error: { code: err.code || 'ERROR', message: err.message } };
    }
  });
  return { offering, componentType, assessments: approved.length, pendingApproval: pending, students: rows };
};

module.exports = { createAssessment, list, get, update, transition, putMarks, getMarks, requestCorrection, decideCorrection, caSummary };
