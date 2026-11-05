const mongoose = require('mongoose');
const { GradePolicy, GradeRecord, GPARecord } = require('./model');
const engine = require('./resultEngine');
const access = require('../attendance/access');
const { Assessment, StudentAssessmentMark } = require('../assessments/model');
const { ESASchedule, ESAMark } = require('../esa/model');
const { CourseOffering } = require('../courses/model');
const { assignedOfferingIds } = require('../courses/assignmentScope');
const Student = require('../../models/Student');
const { paginate, buildSort } = require('../../core/pagination');
const { ApiError, notFound, conflict, forbidden, unprocessable } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { byId } = require('../../core/scope');
const audit = require('../../core/audit');
const notify = require('../../core/notify');

const APPROVED_INPUT = ['approved', 'locked'];

// Engine errors are business-rule failures, not server faults.
const wrap = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof engine.ResultEngineError) throw new ApiError(422, err.code, err.message, err.details);
    throw err;
  }
};

/* ------------------------------ grade policies ------------------------------ */
const validatePolicyBody = (body) => {
  wrapSync(() => engine.validateBands(body.bands));
  if (body.rounding && body.rounding.decimals !== undefined && body.rounding.decimals !== null) {
    if (!engine.ROUNDING_MODES.includes(body.rounding.mode)) throw unprocessable(`rounding.mode must be one of ${engine.ROUNDING_MODES.join(', ')} when decimals are set.`, null, 'ROUNDING_NOT_CONFIGURED');
  }
  const g = body.gpaRules || {};
  if (g.gpaDecimals !== undefined && g.gpaDecimals !== null && !engine.ROUNDING_MODES.includes(g.gpaRounding)) throw unprocessable('gpaRules.gpaRounding is required when gpaDecimals is set.', null, 'ROUNDING_NOT_CONFIGURED');
};
const wrapSync = (fn) => {
  try {
    fn();
  } catch (err) {
    if (err instanceof engine.ResultEngineError) throw new ApiError(422, err.code, err.message, err.details);
    throw err;
  }
};

const createPolicy = async (req, body) => {
  validatePolicyBody(body);
  return withTransaction(async (session) => {
    const [doc] = await GradePolicy.create([{ ...body, status: 'draft', createdBy: req.user.id }], { session });
    await audit.record({ req, action: 'gradepolicy.create', entityType: 'GradePolicy', entityId: doc._id, after: doc }, { session });
    return doc;
  });
};

const listPolicies = async (req, query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  return paginate(GradePolicy, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'status', 'name'], '-createdAt') });
};

const getPolicy = async (id) => {
  const doc = await GradePolicy.findById(id).lean();
  if (!doc) throw notFound('Grade policy not found.');
  return doc;
};

const approvePolicy = async (req, id, reason) => {
  return withTransaction(async (session) => {
    const doc = await GradePolicy.findById(id).session(session);
    if (!doc) throw notFound('Grade policy not found.');
    if (doc.status !== 'draft') throw conflict(`A ${doc.status} policy cannot be approved.`, null, 'INVALID_STATE');
    if (String(doc.createdBy) === String(req.user.id)) throw forbidden('A grade policy must be approved by someone other than its author.', 'SEGREGATION_OF_DUTIES');
    const before = doc.toObject();
    // one active policy per scope: approving a new one retires the previous
    await GradePolicy.updateMany({ _id: { $ne: doc._id }, status: 'active', 'scope.programme': doc.scope && doc.scope.programme ? doc.scope.programme : null }, { status: 'retired' }, { session });
    doc.status = 'active';
    doc.approvedBy = req.user.id;
    doc.approvedAt = new Date();
    await doc.save({ session });
    await audit.record({ req, action: 'gradepolicy.approve', entityType: 'GradePolicy', entityId: doc._id, before, after: doc, reason }, { session });
    return doc;
  });
};

const retirePolicy = async (req, id, reason) => {
  return withTransaction(async (session) => {
    const doc = await GradePolicy.findById(id).session(session);
    if (!doc) throw notFound('Grade policy not found.');
    const before = doc.toObject();
    doc.status = 'retired';
    await doc.save({ session });
    await audit.record({ req, action: 'gradepolicy.retire', entityType: 'GradePolicy', entityId: doc._id, before, after: doc, reason }, { session });
    return doc;
  });
};

/** The active policy for a programme (programme-specific first, then faculty-wide). Never guesses. */
const activePolicyFor = async (programmeId, session) => {
  const find = (programme) => {
    let q = GradePolicy.findOne({ status: 'active', 'scope.programme': programme });
    if (session) q = q.session(session);
    return q.lean();
  };
  const doc = (programmeId && (await find(programmeId))) || (await find(null));
  if (!doc) throw new ApiError(422, 'GRADE_POLICY_NOT_CONFIGURED', 'No active grade policy exists. An authorised officer must create and approve one before results can be calculated.');
  return doc;
};

const enginePolicy = (p) => ({
  bands: p.bands,
  passRule: p.passRule,
  rounding: p.rounding && p.rounding.decimals !== null && p.rounding.decimals !== undefined ? { mode: p.rounding.mode, decimals: p.rounding.decimals, applyTo: p.rounding.applyTo && p.rounding.applyTo.length ? p.rounding.applyTo : undefined } : undefined,
});
const gpaRules = (p) => {
  const g = p.gpaRules || {};
  return { repeatHandling: g.repeatHandling || undefined, excludeCourseTypes: g.excludeCourseTypes || [], countFailedCredits: g.countFailedCredits !== false, gpaDecimals: g.gpaDecimals ?? undefined, gpaRounding: g.gpaRounding || undefined };
};

/* ------------------------------- calculation ------------------------------- */
const calculate = async (req, { offering: offeringId, students }) => {
  return withTransaction(async (session) => {
    const { course } = await access.assertOfferingAccess(req, offeringId, null, session);
    const offering = await CourseOffering.findById(offeringId).populate('components.assessmentConfiguration').session(session);
    const policy = await activePolicyFor(course.programme, session);
    const registered = await access.registeredStudentIds(offeringId, session);
    const targets = students && students.length ? students.map(String) : registered;

    // gather the approved inputs of every component
    const comps = [];
    for (const c of offering.components) {
      const cfg = c.assessmentConfiguration;
      const assessments = await Assessment.find({ offering: offeringId, componentType: c.type }).session(session).lean();
      const schedules = (await ESASchedule.find({ offering: offeringId, componentType: c.type, status: { $ne: 'cancelled' } }).session(session).lean());
      if (cfg.caWeight > 0) {
        if (!assessments.length) throw new ApiError(422, 'CA_NOT_CONFIGURED', `The ${c.type} component has no CA assessments.`);
        const notApproved = assessments.filter((a) => !APPROVED_INPUT.includes(a.status)).map((a) => a.name);
        if (notApproved.length) throw new ApiError(409, 'RESULT_INPUTS_NOT_APPROVED', `CA marks of the ${c.type} component are not all approved yet.`, { assessments: notApproved });
      }
      if (cfg.esaWeight > 0) {
        if (!schedules.length) throw new ApiError(422, 'ESA_NOT_CONFIGURED', `The ${c.type} component has no ESA.`);
        const notApproved = schedules.filter((s) => !APPROVED_INPUT.includes(s.status)).map((s) => s.title || s.format);
        if (notApproved.length) throw new ApiError(409, 'RESULT_INPUTS_NOT_APPROVED', `ESA marks of the ${c.type} component are not all approved yet.`, { exams: notApproved });
      }
      const caMarks = await StudentAssessmentMark.find({ assessment: { $in: assessments.map((a) => a._id) } }).session(session).lean();
      const esaMarks = await ESAMark.find({ schedule: { $in: schedules.map((s) => s._id) } }).session(session).lean();
      comps.push({ type: c.type, weightInCourse: c.weightInCourse, cfg, assessments, schedules, caMarks, esaMarks });
    }

    const calculated = [];
    const skipped = [];
    for (const sid of targets) {
      if (!registered.includes(sid)) {
        skipped.push({ student: sid, code: 'STUDENT_NOT_REGISTERED', message: 'No approved registration for this offering.' });
        continue;
      }
      const existing = await GradeRecord.findOne({ student: sid, offering: offeringId }).session(session);
      if (existing && existing.state !== 'draft') {
        skipped.push({ student: sid, code: 'RESULT_LOCKED', message: `The result is ${existing.state}; send it back or request a correction first.` });
        continue;
      }
      const engineComps = comps.map((c) => ({
        type: c.type,
        weightInCourse: c.weightInCourse,
        config: { caWeight: c.cfg.caWeight, esaWeight: c.cfg.esaWeight, minCaPercent: c.cfg.minCaPercent, minEsaPercent: c.cfg.minEsaPercent, minFinalPercent: c.cfg.minFinalPercent },
        ca: c.assessments.map((a) => {
          const m = c.caMarks.find((x) => String(x.assessment) === String(a._id) && String(x.student) === sid);
          return { name: a.name, marks: m ? m.marks : null, absent: m ? m.absent : false, maxMarks: a.maxMarks, weight: a.weight };
        }),
        esa: c.schedules.map((s) => {
          const m = c.esaMarks.find((x) => String(x.schedule) === String(s._id) && String(x.student) === sid);
          return { name: s.title || s.format, marks: m ? m.marks : null, absent: m ? m.absent : false, maxMarks: s.maxMarks };
        }),
      }));
      let result;
      try {
        result = engine.gradeCourse({ components: engineComps, policy: enginePolicy(policy) });
      } catch (err) {
        if (err instanceof engine.ResultEngineError) {
          skipped.push({ student: sid, code: err.code, message: err.message });
          continue;
        }
        throw err;
      }
      const fields = {
        student: sid, course: course._id, offering: offeringId, semester: offering.semester, courseType: course.type, credits: course.credits,
        componentMarks: result.components.map((c) => ({ type: c.type, weightInCourse: c.weightInCourse, caPercent: c.caPercent, esaPercent: c.esaPercent, mark: c.mark, caPassed: c.caPassed, esaPassed: c.esaPassed, finalPassed: c.finalPassed, passed: c.passed })),
        finalMark: result.finalMark, grade: result.grade, gradePoint: result.gradePoint, passed: result.passed, policy: policy._id, calculatedAt: new Date(), needsRecalculation: false,
      };
      let rec;
      if (existing) {
        existing.set(fields);
        existing.stateHistory.push({ state: 'draft', by: req.user.id, note: 'Recalculated' });
        rec = await existing.save({ session });
      } else {
        const attempt = (await GradeRecord.countDocuments({ student: sid, course: course._id }).session(session)) + 1;
        [rec] = await GradeRecord.create([{ ...fields, attempt, state: 'draft', stateHistory: [{ state: 'draft', by: req.user.id, note: 'Calculated' }] }], { session });
      }
      calculated.push(String(rec._id));
    }
    await audit.record({ req, action: 'result.calculate', entityType: 'CourseOffering', entityId: offeringId, after: { policy: String(policy._id), calculated: calculated.length, skipped: skipped.length } }, { session });
    return { calculated: calculated.length, records: calculated, skipped, policy: String(policy._id) };
  });
};

/* ------------------------------ scopes & reads ------------------------------ */
// Results belong to a whole course offering (not one component), so assigned staff are matched on the offering only.
const recordScope = async (req) => (req.access.scope === 'assigned' ? { offering: { $in: await assignedOfferingIds(req) } } : access.readFilter(req));

const scopeFor = async (req) => {
  if (req.access.scope === 'own') return { student: req.access.studentId || null, state: 'published' }; // students only ever see PUBLISHED results
  return recordScope(req);
};

const POPULATE = [{ path: 'course', select: 'code title credits type' }, { path: 'student', select: 'studentId fullName' }];

const list = async (req, query) => {
  const user = {};
  for (const f of ['offering', 'student', 'state', 'course', 'semester']) if (query[f]) user[f] = query[f];
  return paginate(GradeRecord, access.and(await scopeFor(req), user), { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'finalMark', 'state'], '-createdAt'), populate: POPULATE });
};

const get = async (req, id) => {
  const doc = await GradeRecord.findOne(byId(id, await scopeFor(req))).populate(POPULATE).lean();
  if (!doc) throw notFound('Result not found.');
  if (req.access.scope === 'own') {
    delete doc.stateHistory;
    delete doc.revisions;
    delete doc.corrections;
  }
  return doc;
};

/* ------------------------------- GPA records ------------------------------- */
const recomputeGpa = async (studentId, session) => {
  const student = await Student.findById(studentId).select('programmeRef').session(session).lean();
  const policy = await activePolicyFor(student && student.programmeRef, session);
  const records = await GradeRecord.find({ student: studentId, state: 'published' }).session(session).lean();
  const rules = gpaRules(policy);
  const bySemester = new Map();
  for (const r of records) bySemester.set(String(r.semester), [...(bySemester.get(String(r.semester)) || []), r]);
  const upsert = (scope, semester, g) =>
    GPARecord.findOneAndUpdate({ student: studentId, scope, semester }, { $set: { gpa: g.gpa, credits: g.credits, counted: g.counted, state: 'published', policy: policy._id, computedAt: new Date() } }, { upsert: true, session, returnDocument: 'after' });
  for (const [sem, list] of bySemester) await upsert('semester', sem, await wrap(async () => engine.gpa(list, rules)));
  await upsert('cumulative', null, await wrap(async () => engine.gpa(records, rules)));
};

const assertSelfOrReadable = async (req, studentId) => {
  if (req.access.scope === 'own') {
    if (!req.access.studentId || String(studentId) !== String(req.access.studentId)) throw forbidden('You can only view your own records.', 'OUT_OF_SCOPE');
    return;
  }
  await access.assertStudentReadable(req, studentId);
};

const gpaOf = async (req, studentId) => {
  await assertSelfOrReadable(req, studentId);
  const filter = { student: studentId, ...(req.access.scope === 'own' ? { state: 'published' } : {}) };
  return GPARecord.find(filter).populate({ path: 'semester', select: 'name number academicYear' }).sort({ scope: 1, createdAt: 1 }).lean();
};

const transcript = async (req, studentId) => {
  await assertSelfOrReadable(req, studentId);
  const student = await Student.findById(studentId).select('studentId registrationNo fullName departmentRef programmeRef batchRef currentYear status').populate([{ path: 'programmeRef', select: 'code name' }, { path: 'departmentRef', select: 'code name' }]).lean();
  const records = await GradeRecord.find({ student: studentId, state: 'published' }).populate([{ path: 'course', select: 'code title credits' }, { path: 'semester', select: 'name number academicYear' }]).sort({ createdAt: 1 }).lean();
  const gpas = await GPARecord.find({ student: studentId, state: 'published' }).lean();
  const semesters = new Map();
  for (const r of records) {
    const key = String(r.semester && r.semester._id);
    if (!semesters.has(key)) semesters.set(key, { semester: r.semester, courses: [], sgpa: (gpas.find((g) => g.scope === 'semester' && String(g.semester) === key) || {}).gpa ?? null });
    semesters.get(key).courses.push({ code: r.course.code, title: r.course.title, credits: r.credits, finalMark: r.finalMark, grade: r.grade, gradePoint: r.gradePoint, passed: r.passed, attempt: r.attempt, componentMarks: r.componentMarks || [] });
  }
  const cumulative = gpas.find((g) => g.scope === 'cumulative');
  return { student, generatedAt: new Date(), semesters: [...semesters.values()], cumulative: cumulative ? { gpa: cumulative.gpa, credits: cumulative.credits } : null };
};

/* ------------------------------ state workflow ------------------------------ */
const NEXT = { submitted: 'draft', verified: 'submitted', approved: 'verified', published: 'approved' };

/** to: submitted | verified | approved | published | draft (return). All records move together or none do. */
const moveRecords = async (req, { ids, to, remarks }) => {
  const notices = [];
  const result = await withTransaction(async (session) => {
    const filter = access.and(await recordScope(req), { _id: { $in: ids } });
    const records = await GradeRecord.find(filter).session(session);
    const problems = [];
    const found = new Set(records.map((r) => String(r._id)));
    for (const id of ids) if (!found.has(String(id))) problems.push({ id: String(id), code: 'NOT_FOUND', message: 'Result not found.' });
    for (const r of records) {
      if (to === 'draft') {
        if (!['submitted', 'verified', 'approved'].includes(r.state)) problems.push({ id: String(r._id), code: 'INVALID_TRANSITION', message: `A ${r.state} result cannot be returned.` });
        continue;
      }
      if (r.state !== NEXT[to]) {
        problems.push({ id: String(r._id), code: to === 'published' && r.state !== 'published' ? 'NOT_APPROVED' : 'INVALID_TRANSITION', message: to === 'published' ? `Results can only be published once approved (this one is ${r.state}).` : `A ${r.state} result cannot become ${to}.` });
        continue;
      }
      if (to === 'submitted' && r.needsRecalculation) problems.push({ id: String(r._id), code: 'RECALCULATION_REQUIRED', message: 'A mark changed after this result was calculated. Recalculate it first.' });
      if (['verified', 'approved'].includes(to)) {
        const submitter = [...r.stateHistory].reverse().find((h) => h.state === 'submitted');
        if (submitter && String(submitter.by) === String(req.user.id)) problems.push({ id: String(r._id), code: 'SEGREGATION_OF_DUTIES', message: 'Results must be verified and approved by someone other than the person who submitted them.' });
      }
    }
    if (to === 'draft' && !(remarks || '').trim()) throw unprocessable('A reason is required to send results back.', null, 'REASON_REQUIRED');
    if (problems.length) throw new ApiError(409, 'TRANSITION_REJECTED', 'Some results cannot move to that state; nothing was changed.', problems);

    for (const r of records) {
      const before = { state: r.state };
      r.state = to;
      r.stateHistory.push({ state: to, by: req.user.id, note: remarks || '' });
      if (to === 'published') r.publishedAt = new Date();
      await r.save({ session });
      await audit.record({ req, action: `result.${to === 'draft' ? 'returned' : to}`, entityType: 'GradeRecord', entityId: r._id, before, after: { state: to }, reason: remarks }, { session });
    }
    if (to === 'published') {
      const students = [...new Set(records.map((r) => String(r.student)))];
      for (const sid of students) await wrap(() => recomputeGpa(sid, session));
      notices.push(...students);
    }
    return { moved: records.length, state: to };
  });
  for (const sid of notices) {
    const s = await Student.findById(sid).select('user').lean();
    await notify.send({ userId: s && s.user, eventType: 'result.published', title: 'Results published', message: 'New examination results have been published. Open Results to view them.', entityType: 'Student', entityId: sid, priority: 'high' });
  }
  return result;
};

/* ------------------------------- corrections ------------------------------- */
// Reopens a published result for recalculation, keeping the previous values in `revisions`.
const openCorrection = async ({ record, by, reason, session }) => {
  record.revisions.push({ by, reason, finalMark: record.finalMark, grade: record.grade, gradePoint: record.gradePoint, passed: record.passed, componentMarks: record.componentMarks });
  record.state = 'draft';
  record.publishedAt = undefined;
  record.stateHistory.push({ state: 'draft', by, note: `Correction approved: ${reason}` });
  await record.save({ session });
  // GPA built on the old value is outdated until the corrected result is published again
  await GPARecord.updateMany({ student: record.student }, { state: 'outdated' }, { session });
};

const requestCorrection = async (req, id, reason) => {
  return withTransaction(async (session) => {
    const record = await GradeRecord.findOne(byId(id, await recordScope(req))).session(session);
    if (!record) throw notFound('Result not found.');
    await access.assertOfferingAccess(req, record.offering, null, session);
    if (record.state !== 'published') throw conflict('Only published results need a correction request; earlier states can be sent back directly.', null, 'NOT_PUBLISHED');
    if (record.corrections.some((c) => c.status === 'pending')) throw conflict('A correction request is already pending for this result.', null, 'ALREADY_PENDING');
    record.corrections.push({ requestedBy: req.user.id, reason });
    await record.save({ session });
    const created = record.corrections[record.corrections.length - 1];
    await audit.record({ req, action: 'result.correction_request', entityType: 'GradeRecord', entityId: record._id, after: created, reason }, { session });
    return created;
  });
};

const decideCorrection = async (req, id, cid, { decision, remarks }) => {
  return withTransaction(async (session) => {
    const record = await GradeRecord.findOne(byId(id, await recordScope(req))).session(session);
    if (!record) throw notFound('Result not found.');
    const c = record.corrections.id(cid);
    if (!c) throw notFound('Correction not found.');
    if (c.status !== 'pending') throw conflict(`This correction is already ${c.status}.`, null, 'ALREADY_DECIDED');
    if (String(c.requestedBy) === String(req.user.id)) throw forbidden('A correction must be decided by someone other than the requester.', 'SEGREGATION_OF_DUTIES');
    if (decision === 'reject' && !(remarks || '').trim()) throw unprocessable('A reason is required to reject a correction.', null, 'REMARKS_REQUIRED');
    c.status = decision === 'approve' ? 'approved' : 'rejected';
    c.decidedBy = req.user.id;
    c.decidedAt = new Date();
    c.decisionRemarks = remarks || '';
    if (decision === 'approve') await openCorrection({ record, by: req.user.id, reason: c.reason, session });
    else await record.save({ session });
    await audit.record({ req, action: `result.correction_${c.status}`, entityType: 'GradeRecord', entityId: record._id, after: { state: record.state, correction: c }, reason: remarks }, { session });
    return record;
  });
};

module.exports = {
  createPolicy, listPolicies, getPolicy, approvePolicy, retirePolicy, activePolicyFor, calculate, list, get, gpaOf, transcript, moveRecords,
  requestCorrection, decideCorrection, openCorrection, recomputeGpa,
};
