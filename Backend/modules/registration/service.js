/**
 * Subject registration. Every academic constant (credit limit, auto-approval) comes from policy; every
 * window comes from the Semester record. Rules that an authorised officer may excuse are returned as
 * "violations" and need an explicit exception request; hard rules can never be bypassed.
 */
const mongoose = require('mongoose');
const { SubjectRegistration, LIVE } = require('./model');
const Student = require('../../models/Student');
const { Course, CoursePrerequisite, CourseOffering } = require('../courses/model');
const { assignedOfferingIds } = require('../courses/assignmentScope');
const { paginate, buildSort } = require('../../core/pagination');
const { ApiError, notFound, forbidden, conflict, unprocessable } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { assertDepartment, canAccessDepartment, byId } = require('../../core/scope');
const { can } = require('../../core/rbac');
const policy = require('../../core/policy');
const audit = require('../../core/audit');
const notify = require('../../core/notify');

const POPULATE = [
  { path: 'course', select: 'code title credits type' },
  { path: 'semester', select: 'name number academicYear' },
  { path: 'student', select: 'studentId fullName currentYear departmentRef' },
];

const scopeFilter = async (req) => {
  switch (req.access.scope) {
    case 'own':
      return { student: req.access.studentId || null };
    case 'assigned':
      return { offering: { $in: await assignedOfferingIds(req) } };
    case 'department': {
      const students = await Student.find({ departmentRef: { $in: req.access.departments } }).distinct('_id');
      return { student: { $in: students } };
    }
    default:
      return {};
  }
};

const list = async (req, query) => {
  const filter = await scopeFilter(req);
  for (const f of ['student', 'offering', 'semester', 'status']) if (query[f]) filter[f] = query[f];
  return paginate(SubjectRegistration, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['requestedAt', 'status', 'createdAt'], '-requestedAt'), populate: POPULATE });
};

const get = async (req, id) => {
  const doc = await SubjectRegistration.findOne(byId(id, await scopeFilter(req))).populate(POPULATE).lean();
  if (!doc) throw notFound('Registration not found.');
  return doc;
};

/* ------------------------------- rule checks ------------------------------- */
const windowMode = (semester, now = new Date()) => {
  const within = (from, to) => from && to && now >= from && now <= to;
  if (within(semester.registrationOpens, semester.registrationCloses)) return 'registration';
  if (within(semester.addDropOpens, semester.addDropCloses)) return 'add';
  const configured = semester.registrationOpens || semester.addDropOpens;
  return configured ? 'closed' : 'not_configured';
};

const prerequisitesMet = async (studentId, courseId, session) => {
  const prereqs = await CoursePrerequisite.find({ course: courseId }).session(session).distinct('prerequisite');
  if (!prereqs.length) return { met: true, missing: [] };
  // Contract with the results module: GradeRecord { student, course, passed, state:'published' }.
  const Grade = mongoose.models.GradeRecord;
  const passed = Grade ? (await Grade.find({ student: studentId, course: { $in: prereqs }, passed: true, state: 'published' }).session(session).distinct('course')).map(String) : [];
  const missing = prereqs.filter((p) => !passed.includes(String(p)));
  return { met: missing.length === 0, missing: missing.map(String) };
};

const liveCredits = async (studentId, semesterId, session) => {
  const rows = await SubjectRegistration.aggregate([{ $match: { student: new mongoose.Types.ObjectId(String(studentId)), semester: new mongoose.Types.ObjectId(String(semesterId)), status: { $in: LIVE } } }, { $group: { _id: null, total: { $sum: '$credits' } } }]).session(session);
  return rows.length ? rows[0].total : 0;
};

/** Returns { hard:[...], excusable:[...] } rule problems for registering `student` on `offering`. */
const evaluate = async (student, offering, course, semester, batch, session, now = new Date()) => {
  const hard = [];
  const excusable = [];
  if (student.status !== 'Active') hard.push({ code: 'STUDENT_NOT_ACTIVE', message: `The student record is ${student.status}.` });
  if (offering.status !== 'open') hard.push({ code: 'OFFERING_NOT_OPEN', message: 'This course offering is not open for registration.' });
  const mode = windowMode(semester, now);
  if (mode === 'not_configured') hard.push({ code: 'REGISTRATION_WINDOW_NOT_CONFIGURED', message: 'The registration dates of this semester have not been configured.' });
  else if (mode === 'closed') hard.push({ code: 'REGISTRATION_CLOSED', message: 'The registration and add/drop periods are closed.' });
  if (await SubjectRegistration.exists({ student: student._id, offering: offering._id, status: { $in: LIVE } }).session(session)) hard.push({ code: 'ALREADY_REGISTERED', message: 'The student is already registered for this offering.' });
  if (offering.capacity && offering.registeredCount >= offering.capacity) hard.push({ code: 'OFFERING_FULL', message: 'This offering has no free seats.' });

  if (String(batch.programme) !== String(student.programmeRef)) excusable.push({ code: 'PROGRAMME_MISMATCH', message: 'The course is offered to a different degree programme.' });
  else if (String(batch._id) !== String(student.batchRef)) excusable.push({ code: 'BATCH_MISMATCH', message: 'The offering belongs to a different academic batch.' });
  if (course.specialization && String(course.specialization) !== String(student.specializationRef || '')) excusable.push({ code: 'SPECIALIZATION_MISMATCH', message: 'The course belongs to a different specialization / majoring division.' });
  const pre = await prerequisitesMet(student._id, course._id, session);
  if (!pre.met) excusable.push({ code: 'PREREQUISITES_NOT_MET', message: 'Prerequisite courses have not been passed.', missing: pre.missing });
  const max = await policy.get('registration.maxCredits', { programme: student.programmeRef }, { session });
  const used = await liveCredits(student._id, semester._id, session);
  if (used + course.credits > max) excusable.push({ code: 'CREDIT_LIMIT_EXCEEDED', message: `Registering would bring the semester workload to ${used + course.credits} credits (limit ${max}).`, used, limit: max });
  return { hard, excusable, mode };
};

const loadContext = async (offeringId, session) => {
  const offering = await CourseOffering.findById(offeringId).session(session);
  if (!offering) throw notFound('Course offering not found.');
  const [course, semester, batch] = await Promise.all([
    Course.findById(offering.course).session(session),
    mongoose.models.Semester.findById(offering.semester).session(session),
    mongoose.models.AcademicBatch.findById(offering.batch).session(session),
  ]);
  return { offering, course, semester, batch };
};

const resolveStudent = async (req, requestedId, session) => {
  const id = req.access.scope === 'own' ? req.access.studentId : requestedId;
  if (req.access.scope === 'own' && requestedId && String(requestedId) !== String(id)) throw forbidden('You can only register yourself.', 'OUT_OF_SCOPE');
  if (!id) throw unprocessable('A student is required.', null, 'STUDENT_REQUIRED');
  const student = await Student.findById(id).session(session);
  if (!student) throw notFound('Student not found.');
  if (req.access.scope !== 'own') assertDepartment(req, student.departmentRef);
  return student;
};

/* -------------------------------- operations -------------------------------- */
const register = async (req, body) => {
  const result = await withTransaction(async (session) => {
    const student = await resolveStudent(req, body.student, session);
    const { offering, course, semester, batch } = await loadContext(body.offering, session);
    const { hard, excusable } = await evaluate(student, offering, course, semester, batch, session);
    if (hard.length) throw new ApiError(hard[0].code === 'ALREADY_REGISTERED' || hard[0].code === 'OFFERING_FULL' ? 409 : 422, 'REGISTRATION_NOT_ALLOWED', hard[0].message, hard);

    const wantsException = Boolean(body.exception && body.exception.requested);
    if (excusable.length && !wantsException) {
      throw new ApiError(422, 'REGISTRATION_RULES_VIOLATED', 'The registration breaks academic rules. Submit it with an exception request to ask an authorised officer to approve it.', excusable);
    }
    if (wantsException && excusable.length && !(body.exception.note || '').trim()) throw unprocessable('Explain why the exception is needed.', null, 'EXCEPTION_NOTE_REQUIRED');

    // Seat is taken atomically: only one of several concurrent requests can win the last seat.
    const seat = await CourseOffering.findOneAndUpdate(
      { _id: offering._id, $or: [{ capacity: null }, { $expr: { $lt: ['$registeredCount', '$capacity'] } }] },
      { $inc: { registeredCount: 1 } },
      { session, returnDocument: 'after' }
    );
    if (!seat) throw conflict('This offering has no free seats.', null, 'OFFERING_FULL');

    const autoApprove = excusable.length === 0 && (await policy.getOr('registration.autoApprove', false, { programme: student.programmeRef }, { session })) === true;
    const status = autoApprove ? 'approved' : 'pending';
    const [reg] = await SubjectRegistration.create(
      [{
        student: student._id, offering: offering._id, course: course._id, semester: semester._id, credits: course.credits, status,
        kind: windowMode(semester) === 'add' ? 'add' : 'registration',
        exception: { requested: excusable.length > 0 && wantsException, reasons: excusable.map((e) => e.code), note: body.exception && body.exception.note },
        history: [{ status, by: req.user.id, note: excusable.length ? 'Submitted with exception request' : 'Submitted' }],
        ...(autoApprove ? { decidedAt: new Date(), decidedBy: req.user.id } : {}),
      }],
      { session }
    );
    await audit.record({ req, action: 'registration.create', entityType: 'SubjectRegistration', entityId: reg._id, after: reg }, { session });
    return { reg, student, course };
  });
  await notify.send({ userId: result.student.user, eventType: 'registration.submitted', title: 'Subject registration submitted', message: `${result.course.code} - ${result.course.title}: ${result.reg.status}.`, entityType: 'SubjectRegistration', entityId: result.reg._id });
  return get(req, result.reg._id);
};

const releaseSeat = (offeringId, session) => CourseOffering.updateOne({ _id: offeringId, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } }, { session });

const findForChange = async (req, id, session) => {
  const reg = await SubjectRegistration.findOne(byId(id, await scopeFilter(req))).session(session);
  if (!reg) throw notFound('Registration not found.');
  if (req.access.scope !== 'own') {
    const student = await Student.findById(reg.student).session(session);
    assertDepartment(req, student.departmentRef);
  }
  return reg;
};

const move = async (reg, status, req, note, session) => {
  const before = reg.toObject();
  reg.status = status;
  reg.history.push({ status, by: req.user.id, at: new Date(), note });
  await reg.save({ session });
  await audit.record({ req, action: `registration.${status}`, entityType: 'SubjectRegistration', entityId: reg._id, before: { status: before.status }, after: { status }, reason: note }, { session });
};

/** Student (or an authorised officer) drops a registration inside the add/drop period. */
const drop = async (req, id, reason) => {
  const reg = await withTransaction(async (session) => {
    const r = await findForChange(req, id, session);
    if (!LIVE.includes(r.status)) throw conflict(`A ${r.status} registration cannot be dropped.`, null, 'INVALID_STATE');
    const semester = await mongoose.models.Semester.findById(r.semester).session(session);
    const mode = windowMode(semester);
    const officer = can(req.access, 'registrations.decide', 'faculty');
    if (!officer && !['registration', 'add'].includes(mode)) throw conflict('The add/drop period is over. Submit a request for the Faculty to approve a late drop.', null, 'DROP_WINDOW_CLOSED');
    if (!officer && r.status === 'approved' && mode === 'registration') {
      // within the registration period a student may still withdraw an approved registration
    }
    await move(r, 'dropped', req, reason || 'Dropped', session);
    await releaseSeat(r.offering, session);
    return r;
  });
  return get(req, reg._id);
};

/** A pending registration can be cancelled by its owner before it is decided. */
const cancel = async (req, id, reason) => {
  const reg = await withTransaction(async (session) => {
    const r = await findForChange(req, id, session);
    if (r.status !== 'pending') throw conflict('Only pending registrations can be cancelled. Approved ones must be dropped.', null, 'INVALID_STATE');
    await move(r, 'cancelled', req, reason || 'Cancelled', session);
    await releaseSeat(r.offering, session);
    return r;
  });
  return get(req, reg._id);
};

const decide = async (req, id, { decision, remarks }) => {
  const { reg, student, course } = await withTransaction(async (session) => {
    const r = await findForChange(req, id, session);
    if (r.status !== 'pending') throw conflict(`This registration is already ${r.status}.`, null, 'ALREADY_DECIDED');
    if (decision === 'reject' && !(remarks || '').trim()) throw unprocessable('A reason is required to reject a registration.', null, 'REMARKS_REQUIRED');
    const status = decision === 'approve' ? 'approved' : 'rejected';
    r.decidedAt = new Date();
    r.decidedBy = req.user.id;
    r.decisionRemarks = remarks || '';
    if (status === 'approved' && r.exception.requested) r.exception.approvedBy = req.user.id;
    await move(r, status, req, remarks, session);
    if (status === 'rejected') await releaseSeat(r.offering, session);
    return { reg: r, student: await Student.findById(r.student).session(session), course: await Course.findById(r.course).session(session) };
  });
  await notify.send({ userId: student.user, eventType: `registration.${reg.status}`, title: `Registration ${reg.status}`, message: `${course.code} - ${course.title}: ${reg.status}${remarks ? ` (${remarks})` : ''}.`, entityType: 'SubjectRegistration', entityId: reg._id });
  return get(req, reg._id);
};

const decideMany = async (req, ids, payload) => {
  const results = [];
  for (const id of ids) {
    try {
      const reg = await decide(req, id, payload);
      results.push({ id, ok: true, status: reg.status });
    } catch (err) {
      results.push({ id, ok: false, code: err.code || 'ERROR', message: err.message });
    }
  }
  return results;
};

/** Offerings the student could register for, each with the rule problems that would apply today. */
const eligibleOfferings = async (req, studentId) => {
  const student = await resolveStudent(req, studentId);
  const offerings = await CourseOffering.find({ status: 'open', batch: student.batchRef }).lean();
  const out = [];
  for (const o of offerings) {
    const { offering, course, semester, batch } = await loadContext(o._id);
    const { hard, excusable, mode } = await evaluate(student, offering, course, semester, batch, null);
    out.push({
      offering: String(o._id), course: { id: String(course._id), code: course.code, title: course.title, credits: course.credits, type: course.type },
      semester: String(semester._id), window: mode, registrable: hard.length === 0 && excusable.length === 0, hard, excusable,
    });
  }
  return out;
};

module.exports = { list, get, register, drop, cancel, decide, decideMany, eligibleOfferings, windowMode, evaluate, canAccessDepartment };
