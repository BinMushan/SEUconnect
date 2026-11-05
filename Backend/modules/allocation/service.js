const mongoose = require('mongoose');
const {
  LIVE, AllocationRound, SpecializationCapacity, SpecializationApplication, AllocationRun, SpecializationAllocation, AllocationChangeRequest, AllocationChange,
} = require('./model');
const { allocate } = require('./engine');
const Student = require('../../models/Student');
const { DegreeProgramme, AcademicBatch, Specialization } = require('../organization/model');
const { paginate, buildSort } = require('../../core/pagination');
const { ApiError, notFound, badRequest, conflict, forbidden, unprocessable } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { assertDepartment, byId } = require('../../core/scope');
const policy = require('../../core/policy');
const audit = require('../../core/audit');
const notify = require('../../core/notify');

const isId = (v) => /^[0-9a-f]{24}$/i.test(String(v));

/* ------------------------------ scope helpers ------------------------------ */
const departmentStudentIds = (req) => Student.find({ departmentRef: { $in: req.access.departments } }).distinct('_id');

// Which application / allocation rows the caller may see.
const studentScope = async (req) => {
  if (req.access.scope === 'own') return { student: req.access.studentId || null };
  if (req.access.scope === 'department') return { student: { $in: await departmentStudentIds(req) } };
  return {};
};
// Students only ever see PUBLISHED allocations (provisional runs are not visible to them).
const allocationScope = async (req) => {
  const base = await studentScope(req);
  return req.access.scope === 'own' ? { ...base, publishedAt: { $ne: null } } : base;
};

const actorOf = (req) => ({ user: /^[0-9a-f]{24}$/i.test(String(req.user.id)) ? req.user.id : undefined, name: req.user.name, email: req.user.email, role: req.user.role });

const specMap = async (ids, session) => {
  const docs = await Specialization.find({ _id: { $in: ids } }).session(session || null).lean();
  return Object.fromEntries(docs.map((d) => [String(d._id), d]));
};

/* --------------------------------- rounds ---------------------------------- */
const createRound = async (req, body) =>
  withTransaction(async (session) => {
    const programme = await DegreeProgramme.findById(body.programme).session(session);
    if (!programme || programme.status !== 'active') throw badRequest('The degree programme does not exist or is archived.', null, 'PROGRAMME_INVALID');
    const batch = await AcademicBatch.findById(body.batch).session(session);
    if (!batch || String(batch.programme) !== String(programme._id)) throw badRequest('The batch does not belong to this programme.', null, 'BATCH_PROGRAMME_MISMATCH');
    const specs = await Specialization.find({ programme: programme._id, status: 'active' }).session(session);
    if (!specs.length) throw badRequest('The programme has no active specializations / majoring divisions.', null, 'NO_TRACKS');
    const kinds = [...new Set(specs.map((s) => s.kind))];
    if (kinds.length !== 1) throw badRequest('The programme mixes specializations and majoring divisions.', null, 'MIXED_TRACKS');
    if (await AllocationRound.exists({ programme: programme._id, batch: batch._id, status: { $in: ['draft', 'open', 'closed'] } }).session(session)) {
      throw conflict('An unfinished allocation round already exists for this programme and batch.', null, 'ROUND_EXISTS');
    }
    const [round] = await AllocationRound.create(
      [{ programme: programme._id, batch: batch._id, kind: kinds[0], name: body.name || `${programme.code} ${batch.intakeYear} ${kinds[0]} round`, opensAt: body.opensAt, closesAt: body.closesAt, startsAt: programme.specializationStarts, createdBy: req.user.id }],
      { session }
    );
    await audit.record({ req, action: 'allocation.round_create', entityType: 'AllocationRound', entityId: round._id, after: round }, { session });
    return round;
  });

const ROUND_NEXT = { draft: ['open'], open: ['closed'], closed: ['open'], published: [] };
const transitionRound = async (req, id, to, reason) =>
  withTransaction(async (session) => {
    const round = await AllocationRound.findById(id).session(session);
    if (!round) throw notFound('Allocation round not found.');
    if (!ROUND_NEXT[round.status].includes(to)) throw conflict(`A ${round.status} round cannot become ${to}.`, { allowed: ROUND_NEXT[round.status] }, 'INVALID_TRANSITION');
    if (to === 'open' && round.status === 'closed' && (await AllocationRun.exists({ round: round._id, status: { $in: ['provisional', 'published'] } }).session(session))) {
      throw conflict('The round already has a run; discard it by running again instead of reopening.', null, 'ROUND_HAS_RUN');
    }
    const before = round.toObject();
    round.status = to;
    await round.save({ session });
    await audit.record({ req, action: 'allocation.round_transition', entityType: 'AllocationRound', entityId: round._id, before: { status: before.status }, after: { status: to }, reason }, { session });
    return round;
  });

const listRounds = async (req, query) => {
  const filter = {};
  for (const f of ['programme', 'batch', 'status', 'kind']) if (query[f]) filter[f] = query[f];
  return paginate(AllocationRound, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'status'], '-createdAt') });
};
const getRound = async (id) => {
  const r = await AllocationRound.findById(id).lean();
  if (!r) throw notFound('Allocation round not found.');
  return r;
};

/* ------------------------------- capacities -------------------------------- */
const setCapacity = async (req, { specialization, batch, seats }) =>
  withTransaction(async (session) => {
    const spec = await Specialization.findById(specialization).session(session);
    if (!spec || spec.status !== 'active') throw badRequest('The specialization / majoring division does not exist or is archived.', null, 'SPECIALIZATION_INVALID');
    const b = await AcademicBatch.findById(batch).session(session);
    if (!b || String(b.programme) !== String(spec.programme)) throw badRequest('The batch does not belong to the programme of this track.', null, 'BATCH_PROGRAMME_MISMATCH');
    const used = await SpecializationAllocation.countDocuments({ specialization, batch, status: { $in: LIVE } }).session(session);
    if (seats < used) throw conflict(`${used} students already hold a seat; capacity cannot drop below that.`, { allocated: used }, 'SEATS_BELOW_ALLOCATED');
    const before = await SpecializationCapacity.findOne({ specialization, batch }).session(session);
    const doc = await SpecializationCapacity.findOneAndUpdate({ specialization, batch }, { $set: { seats, setBy: req.user.id }, $inc: { revision: 1 } }, { upsert: true, returnDocument: 'after', session });
    await audit.record({ req, action: 'allocation.capacity_set', entityType: 'SpecializationCapacity', entityId: doc._id, before: before && { seats: before.seats }, after: { specialization, batch, seats } }, { session });
    return doc;
  });

const listCapacities = async (query) => {
  const filter = {};
  if (query.batch) filter.batch = query.batch;
  if (query.specialization) filter.specialization = query.specialization;
  if (query.programme) filter.specialization = { $in: await Specialization.find({ programme: query.programme }).distinct('_id') };
  return paginate(SpecializationCapacity, filter, { page: query.page, limit: query.limit, sort: { createdAt: 1 }, populate: { path: 'specialization', select: 'code name kind' } });
};

/* ------------------------------- applications ------------------------------ */
// Academic performance is only ever READ from a published GPA record or SUPPLIED by an officer - never made up.
const readRecordedMetrics = async (studentId, session) => {
  const GPA = mongoose.models.GPARecord;
  if (!GPA) return { metrics: {}, source: 'none' };
  const rec = await GPA.findOne({ student: studentId, scope: 'cumulative' }).sort({ createdAt: -1 }).session(session || null).lean();
  if (rec && typeof rec.gpa === 'number' && (!rec.state || rec.state === 'published')) return { metrics: { cumulativeGpa: rec.gpa }, source: 'GPARecord' };
  return { metrics: {}, source: 'none' };
};

const submitApplication = async (req, body) => {
  const result = await withTransaction(async (session) => {
    const studentId = req.access.studentId;
    if (!studentId) throw forbidden('Only students can submit allocation applications.', 'STUDENT_REQUIRED');
    const round = await AllocationRound.findById(body.round).session(session);
    if (!round) throw notFound('Allocation round not found.');
    const now = new Date();
    if (round.status !== 'open' || (round.opensAt && now < round.opensAt) || (round.closesAt && now > round.closesAt)) {
      throw conflict('Applications are not open for this round.', null, 'ROUND_NOT_OPEN');
    }
    const student = await Student.findById(studentId).session(session);
    if (!student || student.status !== 'Active') throw forbidden(`Only active students can apply (current status: ${student ? student.status : 'unknown'}).`, 'STUDENT_NOT_ACTIVE');
    if (String(student.programmeRef) !== String(round.programme) || String(student.batchRef) !== String(round.batch)) {
      throw forbidden('This round is for a different programme or batch.', 'NOT_ELIGIBLE');
    }
    const reached = student.currentYear > round.startsAt.year || (student.currentYear === round.startsAt.year && student.currentSemesterNumber >= round.startsAt.semester);
    if (!reached) throw forbidden(`Applications start from Year ${round.startsAt.year} Semester ${round.startsAt.semester}.`, 'NOT_ELIGIBLE_YET');
    if (await SpecializationAllocation.exists({ student: studentId, status: { $in: LIVE } }).session(session)) throw conflict('You already hold an allocation.', null, 'ALREADY_ALLOCATED');

    const ids = body.preferences.map(String);
    if (new Set(ids).size !== ids.length) throw badRequest('Each choice may appear only once.', null, 'DUPLICATE_PREFERENCE');
    const specs = await Specialization.find({ _id: { $in: ids }, programme: round.programme, status: 'active' }).session(session);
    if (specs.length !== ids.length) throw badRequest('A preference is not an active track of this programme.', null, 'PREFERENCE_INVALID');

    const recorded = await readRecordedMetrics(studentId, session);
    const preferences = ids.map((specialization, i) => ({ rank: i + 1, specialization }));
    let app = await SpecializationApplication.findOne({ student: studentId, round: round._id }).session(session);
    if (app) {
      if (app.status === 'withdrawn') app.status = 'submitted';
      app.history.push({ preferences: app.preferences.map((p) => ({ rank: p.rank, specialization: String(p.specialization) })), at: new Date() });
      app.preferences = preferences;
      // the original submittedAt is kept on purpose: it is a tie-breaker
      if (app.academic.source !== 'supplied' && recorded.source !== 'none') app.academic = { ...app.academic.toObject(), ...recorded, recordedAt: new Date() };
      await app.save({ session });
    } else {
      [app] = await SpecializationApplication.create(
        [{ student: studentId, round: round._id, programme: round.programme, batch: round.batch, kind: round.kind, preferences, academic: { ...recorded, recordedAt: recorded.source === 'none' ? undefined : new Date() } }],
        { session }
      );
    }
    await audit.record({ req, action: 'allocation.application_submit', entityType: 'SpecializationApplication', entityId: app._id, after: { round: String(round._id), preferences: ids } }, { session });
    return app;
  });
  return getApplication(req, result._id);
};

const APP_POPULATE = [
  { path: 'student', select: 'studentId fullName currentYear departmentRef' },
  { path: 'preferences.specialization', select: 'code name' },
];

const listApplications = async (req, query) => {
  const filter = { ...(await studentScope(req)) };
  for (const f of ['round', 'status', 'kind', 'programme', 'batch']) if (query[f]) filter[f] = query[f];
  return paginate(SpecializationApplication, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['submittedAt', 'createdAt'], 'submittedAt'), populate: APP_POPULATE });
};

const getApplication = async (req, id) => {
  const app = await SpecializationApplication.findOne(byId(id, await studentScope(req))).populate(APP_POPULATE).lean();
  if (!app) throw notFound('Application not found.');
  return app;
};

/** Officer records / corrects the academic metrics used by the ranking (stored as "supplied", with who and why). */
const setMetrics = async (req, id, { metrics, note }) =>
  withTransaction(async (session) => {
    const app = await SpecializationApplication.findById(id).session(session);
    if (!app) throw notFound('Application not found.');
    if (await AllocationRun.exists({ round: app.round, status: 'published' }).session(session)) throw conflict('The round is published; metrics can no longer change.', null, 'ROUND_PUBLISHED');
    const before = app.academic ? app.academic.toObject() : null;
    app.academic = { metrics: { ...((app.academic && app.academic.metrics) || {}), ...metrics }, source: 'supplied', recordedAt: new Date(), recordedBy: req.user.id, note };
    app.markModified('academic');
    await app.save({ session });
    await audit.record({ req, action: 'allocation.metrics_set', entityType: 'SpecializationApplication', entityId: app._id, before, after: app.academic, reason: note }, { session });
    return app;
  });

const withdrawApplication = async (req, id) =>
  withTransaction(async (session) => {
    const app = await SpecializationApplication.findOne(byId(id, await studentScope(req))).session(session);
    if (!app) throw notFound('Application not found.');
    const round = await AllocationRound.findById(app.round).session(session);
    if (round.status !== 'open') throw conflict('Applications can only be withdrawn while the round is open.', null, 'ROUND_NOT_OPEN');
    app.status = 'withdrawn';
    await app.save({ session });
    await audit.record({ req, action: 'allocation.application_withdraw', entityType: 'SpecializationApplication', entityId: app._id }, { session });
    return app;
  });

/* ---------------------------------- runs ----------------------------------- */
/** Collects everything the pure engine needs. Reads only; used by dry-run and by the real run. */
const buildInput = async (round, session) => {
  const ctx = { programme: round.programme };
  const apps = await SpecializationApplication.find({ round: round._id, status: 'submitted' }).session(session || null).lean();
  if (!apps.length) throw conflict('There are no submitted applications in this round.', null, 'NO_APPLICATIONS');

  const students = Object.fromEntries((await Student.find({ _id: { $in: apps.map((a) => a.student) } }).session(session || null).select('status programmeRef batchRef').lean()).map((s) => [String(s._id), s]));
  // students who already hold a live allocation that is not this round's own provisional result are blocked
  const held = new Set((await SpecializationAllocation.find({ student: { $in: apps.map((a) => a.student) }, status: { $in: LIVE }, $nor: [{ round: round._id, status: 'provisional' }] }).session(session || null).distinct('student')).map(String));

  const applicants = apps.map((a) => {
    const s = students[String(a.student)];
    let blocked;
    if (!s || s.status !== 'Active') blocked = 'STUDENT_NOT_ACTIVE';
    else if (String(s.programmeRef) !== String(round.programme) || String(s.batchRef) !== String(round.batch)) blocked = 'ENROLMENT_CHANGED';
    else if (held.has(String(a.student))) blocked = 'ALREADY_ALLOCATED';
    return { student: String(a.student), submittedAt: a.submittedAt, preferences: [...a.preferences].sort((x, y) => x.rank - y.rank).map((p) => String(p.specialization)), metrics: (a.academic && a.academic.metrics) || {}, blocked };
  });

  const wanted = [...new Set(applicants.filter((a) => !a.blocked).flatMap((a) => a.preferences))];
  const capDocs = await SpecializationCapacity.find({ batch: round.batch, specialization: { $in: wanted } }).session(session || null).lean();
  const capacities = Object.fromEntries(capDocs.map((c) => [String(c.specialization), c.seats]));
  const missing = wanted.filter((s) => !(s in capacities));
  if (missing.length) {
    const specs = await specMap(missing, session);
    throw unprocessable('Seat capacities have not been set for: ' + missing.map((m) => (specs[m] ? specs[m].code : m)).join(', ') + '.', { missing: missing.map((m) => (specs[m] ? specs[m].code : m)) }, 'CAPACITY_NOT_CONFIGURED');
  }

  // Selection policy: must be an APPROVED (active) policy; unconfirmed weights are never used silently.
  const selection = await policy.get('allocation.criteria', ctx, { requireActive: true, session });
  const snapshot = { criteria: selection, minApplications: null, countBasis: null, needsConfirmation: [] };
  let minApplications = null;
  let countBasis = 'any_preference';
  if (round.kind === 'majoring') {
    minApplications = await policy.get('allocation.majoring.minApplications', ctx, { session });
    countBasis = await policy.get('allocation.majoring.countBasis', ctx, { session });
    snapshot.minApplications = minApplications;
    snapshot.countBasis = countBasis;
    for (const key of ['allocation.majoring.minApplications', 'allocation.majoring.countBasis']) {
      const doc = await policy.find(key, ctx, { session });
      if (doc && doc.status !== 'active') snapshot.needsConfirmation.push(key);
    }
  }
  return { applicants, capacities, policy: selection, minApplications, countBasis, snapshot };
};

const runEngine = (input) => {
  const result = allocate({ applicants: input.applicants, capacities: input.capacities, policy: input.policy, minApplications: input.minApplications, countBasis: input.countBasis });
  return result;
};

const dryRun = async (req, roundId) => {
  const round = await getRound(roundId);
  const input = await buildInput(round, null);
  const result = runEngine(input);
  const specs = await specMap(Object.keys(input.capacities));
  return { dryRun: true, round: round._id, kind: round.kind, policySnapshot: input.snapshot, capacities: input.capacities, specializations: Object.fromEntries(Object.entries(specs).map(([k, v]) => [k, v.code])), result };
};

const createRun = async (req, roundId) =>
  withTransaction(async (session) => {
    const round = await AllocationRound.findById(roundId).session(session);
    if (!round) throw notFound('Allocation round not found.');
    if (round.status === 'published') throw conflict('This round is published. Use manual changes for corrections.', null, 'ROUND_PUBLISHED');
    if (round.status !== 'closed') throw conflict('Close the application round before running the allocation.', null, 'ROUND_NOT_CLOSED');

    // A new run replaces the previous provisional one (kept for history, marked superseded / discarded).
    await AllocationRun.updateMany({ round: round._id, status: 'provisional' }, { status: 'discarded' }, { session });
    await SpecializationAllocation.updateMany({ round: round._id, status: 'provisional' }, { status: 'superseded', supersededAt: new Date(), supersededReason: 'Replaced by a newer run' }, { session });

    const input = await buildInput(round, session);
    const result = runEngine(input);
    const [run] = await AllocationRun.create(
      [{ round: round._id, programme: round.programme, batch: round.batch, kind: round.kind, status: 'provisional', policySnapshot: input.snapshot, capacitySnapshot: input.capacities, result, summary: result.stats, createdBy: req.user.id }],
      { session }
    );
    if (result.allocations.length) {
      await SpecializationAllocation.insertMany(
        result.allocations.map((a) => ({ student: a.student, specialization: a.specialization, round: round._id, run: run._id, programme: round.programme, batch: round.batch, status: 'provisional', source: 'run', rank: a.rank, score: a.score, preferenceRank: a.preferenceRank })),
        { session, ordered: true }
      );
    }
    await audit.record({ req, action: 'allocation.run', entityType: 'AllocationRun', entityId: run._id, after: { round: String(round._id), summary: result.stats, policy: input.snapshot } }, { session });
    return run;
  });

const publishRun = async (req, runId) => {
  const outcome = await withTransaction(async (session) => {
    const run = await AllocationRun.findById(runId).session(session);
    if (!run) throw notFound('Allocation run not found.');
    if (run.status !== 'provisional') throw conflict(`A ${run.status} run cannot be published.`, null, 'INVALID_STATE');
    const now = new Date();
    const allocs = await SpecializationAllocation.find({ run: run._id, status: 'provisional' }).session(session);
    for (const a of allocs) {
      a.status = 'published';
      a.publishedAt = now;
      await a.save({ session });
      await Student.updateOne({ _id: a.student }, { specializationRef: a.specialization }, { session });
    }
    run.status = 'published';
    run.publishedBy = req.user.id;
    run.publishedAt = now;
    await run.save({ session });
    await AllocationRound.updateOne({ _id: run.round }, { status: 'published', publishedAt: now }, { session });
    await audit.record({ req, action: 'allocation.publish', entityType: 'AllocationRun', entityId: run._id, after: { allocated: allocs.length, unallocated: (run.result.unallocated || []).length } }, { session });
    const specs = await specMap(allocs.map((a) => a.specialization), session);
    const people = await Student.find({ _id: { $in: [...allocs.map((a) => a.student), ...(run.result.unallocated || []).map((u) => u.student)] } }).session(session).select('user').lean();
    return { run, allocs, specs, userOf: Object.fromEntries(people.map((p) => [String(p._id), p.user])), unallocated: run.result.unallocated || [] };
  });
  // notifications go out only after the transaction has committed
  for (const a of outcome.allocs) {
    const code = outcome.specs[String(a.specialization)] ? outcome.specs[String(a.specialization)].code : '';
    await notify.send({ userId: outcome.userOf[String(a.student)], eventType: 'allocation.published', title: 'Allocation result published', message: `You have been allocated to ${code}.`, entityType: 'SpecializationAllocation', entityId: a._id });
  }
  for (const u of outcome.unallocated) {
    await notify.send({ userId: outcome.userOf[String(u.student)], eventType: 'allocation.review', title: 'Allocation result published', message: 'Your preferences could not be met; your case has been sent for manual review.', entityType: 'AllocationRun', entityId: outcome.run._id });
  }
  return outcome.run;
};

// Department-scoped officers only see their own department's students inside a run result.
const scopeResult = async (req, run) => {
  if (req.access.scope !== 'department') return run;
  const mine = new Set((await departmentStudentIds(req)).map(String));
  const keep = (list) => (list || []).filter((x) => mine.has(String(x.student)));
  const result = { ...run.result, allocations: keep(run.result.allocations), unallocated: keep(run.result.unallocated), ineligible: keep(run.result.ineligible), ranking: keep(run.result.ranking) };
  return { ...run, result };
};

const listRuns = async (req, query) => {
  const filter = {};
  for (const f of ['round', 'status', 'programme', 'batch']) if (query[f]) filter[f] = query[f];
  const out = await paginate(AllocationRun, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt'], '-createdAt'), select: '-result -capacitySnapshot' });
  return out;
};
const getRunFor = async (req, id) => {
  const run = await AllocationRun.findById(id).lean();
  if (!run) throw notFound('Allocation run not found.');
  return scopeResult(req, run);
};

/* ------------------------------- allocations ------------------------------- */
const ALLOC_POPULATE = [
  { path: 'student', select: 'studentId fullName' },
  { path: 'specialization', select: 'code name kind' },
];
const listAllocations = async (req, query) => {
  const filter = { ...(await allocationScope(req)) };
  for (const f of ['specialization', 'batch', 'status', 'programme', 'student']) if (query[f] && req.access.scope !== 'own') filter[f] = query[f];
  return paginate(SpecializationAllocation, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'rank'], '-createdAt'), populate: ALLOC_POPULATE });
};

const history = async (req, studentId) => {
  let scope = {};
  if (req.access.scope === 'own') scope = { _id: req.access.studentId || null };
  else if (req.access.scope === 'department') scope = { departmentRef: { $in: req.access.departments } };
  const student = await Student.findOne(byId(studentId, scope)).select('studentId fullName').lean();
  if (!student) throw notFound('Student not found.');
  const own = req.access.scope === 'own';
  const allocations = await SpecializationAllocation.find({ student: studentId, ...(own ? { publishedAt: { $ne: null } } : {}) }).sort({ createdAt: 1 }).populate(ALLOC_POPULATE).lean();
  const changes = await AllocationChange.find({ student: studentId }).sort({ approvedAt: 1 }).lean();
  const applications = await SpecializationApplication.find({ student: studentId }).sort({ createdAt: 1 }).populate(APP_POPULATE).lean();
  return { student, applications, allocations, changes };
};

/* ------------------------------ manual changes ----------------------------- */
/**
 * Applies an approved manual change inside the caller's transaction. Shared by the change-request flow and the
 * generic "specialization_change" request handler. The previous allocation is superseded - never overwritten.
 */
const applyChange = async ({ req, session, studentId, toId, requestReason, decisionReason, attachments = [], changeRequest = null, via = 'change_request' }) => {
  if (!decisionReason || !String(decisionReason).trim()) throw unprocessable('A decision reason is required.', null, 'DECISION_REASON_REQUIRED');
  const student = await Student.findById(studentId).session(session);
  if (!student) throw notFound('Student not found.');
  if (student.status !== 'Active') throw conflict(`The student is ${student.status}.`, null, 'STUDENT_NOT_ACTIVE');
  const to = await Specialization.findById(toId).session(session);
  if (!to || to.status !== 'active' || String(to.programme) !== String(student.programmeRef)) throw badRequest('The target is not an active track of the student\'s programme.', null, 'TARGET_INVALID');

  const current = await SpecializationAllocation.findOne({ student: student._id, status: 'published' }).session(session);
  if (current && String(current.specialization) === String(to._id)) throw conflict('The student is already allocated to this track.', null, 'NO_CHANGE');

  let round = current ? current.round : null;
  let run = current ? current.run : null;
  if (!current) {
    // First placement of a student left for manual review: they must have applied in a published round.
    const app = await SpecializationApplication.findOne({ student: student._id, status: 'submitted' }).sort({ createdAt: -1 }).session(session);
    const r = app && (await AllocationRound.findById(app.round).session(session));
    if (!r || r.status !== 'published') throw conflict('The student has no allocation and no application in a published round.', null, 'NO_ALLOCATION');
    round = r._id;
    run = (await AllocationRun.findOne({ round: r._id, status: 'published' }).session(session) || {})._id || null;
  }

  // Capacity is re-checked at decision time; touching the capacity document serialises concurrent approvals.
  const cap = await SpecializationCapacity.findOneAndUpdate({ specialization: to._id, batch: student.batchRef }, { $inc: { revision: 1 } }, { session, returnDocument: 'after' });
  if (!cap) throw unprocessable('No seat capacity is configured for the target track.', null, 'CAPACITY_NOT_CONFIGURED');
  const used = await SpecializationAllocation.countDocuments({ specialization: to._id, batch: student.batchRef, status: { $in: LIVE } }).session(session);
  if (used >= cap.seats) throw conflict(`${to.code} has no free seats (${used}/${cap.seats}).`, { used, seats: cap.seats }, 'CAPACITY_FULL');

  const now = new Date();
  if (current) {
    current.status = 'superseded';
    current.supersededAt = now;
    current.supersededReason = decisionReason;
    await current.save({ session });
  }
  const [created] = await SpecializationAllocation.create(
    [{ student: student._id, specialization: to._id, round, run, programme: student.programmeRef, batch: student.batchRef, status: 'published', source: 'manual_change', decidedAt: now, publishedAt: now }],
    { session }
  );
  const [change] = await AllocationChange.create(
    [{ student: student._id, previousAllocation: current ? current._id : null, newAllocation: created._id, previous: current ? current.specialization : null, new: to._id, requestReason, decisionReason, authorisedBy: actorOf(req), approvedAt: now, attachments, changeRequest, via }],
    { session }
  );
  await Student.updateOne({ _id: student._id }, { specializationRef: to._id }, { session });
  await audit.record(
    { req, action: 'allocation.change', entityType: 'SpecializationAllocation', entityId: created._id, before: current ? { specialization: String(current.specialization) } : { specialization: null }, after: { specialization: String(to._id) }, reason: decisionReason },
    { session }
  );
  return { student, to, change, allocation: created };
};

const submitChange = async (req, body) =>
  withTransaction(async (session) => {
    let studentId = body.student;
    if (req.access.scope === 'own') {
      studentId = req.access.studentId;
      if (body.student && String(body.student) !== String(studentId)) throw forbidden('You can only request changes for yourself.', 'OUT_OF_SCOPE');
    } else if (!studentId) {
      throw unprocessable('A student is required.', null, 'STUDENT_REQUIRED');
    }
    const student = await Student.findById(studentId).session(session);
    if (!student) throw notFound('Student not found.');
    if (req.access.scope !== 'own') assertDepartment(req, student.departmentRef);
    if (student.status !== 'Active') throw conflict(`The student is ${student.status}.`, null, 'STUDENT_NOT_ACTIVE');
    const to = await Specialization.findById(body.to).session(session);
    if (!to || to.status !== 'active' || String(to.programme) !== String(student.programmeRef)) throw badRequest('The target is not an active track of the student\'s programme.', null, 'TARGET_INVALID');
    const current = await SpecializationAllocation.findOne({ student: student._id, status: 'published' }).session(session);
    if (current && String(current.specialization) === String(to._id)) throw conflict('The student is already allocated to this track.', null, 'NO_CHANGE');
    if (!current && !(await SpecializationApplication.exists({ student: student._id, status: 'submitted' }).session(session))) throw conflict('The student has no allocation to change.', null, 'NO_ALLOCATION');
    if (await AllocationChangeRequest.exists({ student: student._id, status: 'pending' }).session(session)) throw conflict('A change request is already pending for this student.', null, 'REQUEST_PENDING');
    const [reqDoc] = await AllocationChangeRequest.create([{ student: student._id, from: current ? current.specialization : null, to: to._id, requestReason: body.requestReason, attachments: body.attachments || [], requestedBy: req.user.id }], { session });
    await audit.record({ req, action: 'allocation.change_request', entityType: 'AllocationChangeRequest', entityId: reqDoc._id, after: reqDoc }, { session });
    return reqDoc;
  });

const CHANGE_POPULATE = [
  { path: 'student', select: 'studentId fullName' },
  { path: 'from', select: 'code name' },
  { path: 'to', select: 'code name' },
];
const listChanges = async (req, query) => {
  const filter = { ...(await studentScope(req)) };
  if (query.status) filter.status = query.status;
  return paginate(AllocationChangeRequest, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['requestedAt'], '-requestedAt'), populate: CHANGE_POPULATE });
};

const decideChange = async (req, id, { decision, decisionReason }) => {
  const out = await withTransaction(async (session) => {
    const r = await AllocationChangeRequest.findById(id).session(session);
    if (!r) throw notFound('Change request not found.');
    if (r.status !== 'pending') throw conflict(`This request is already ${r.status}.`, null, 'ALREADY_DECIDED');
    const student = await Student.findById(r.student).session(session);
    assertDepartment(req, student.departmentRef);
    if (!decisionReason || !decisionReason.trim()) throw unprocessable('A decision reason is required.', null, 'DECISION_REASON_REQUIRED');
    r.decidedBy = req.user.id;
    r.decidedAt = new Date();
    r.decisionReason = decisionReason;
    if (decision === 'reject') {
      r.status = 'rejected';
      await r.save({ session });
      await audit.record({ req, action: 'allocation.change_reject', entityType: 'AllocationChangeRequest', entityId: r._id, after: { status: 'rejected' }, reason: decisionReason }, { session });
      return { request: r, student, approved: false };
    }
    const applied = await applyChange({ req, session, studentId: r.student, toId: r.to, requestReason: r.requestReason, decisionReason, attachments: r.attachments, changeRequest: r._id });
    r.status = 'approved';
    r.change = applied.change._id;
    await r.save({ session });
    return { request: r, student, approved: true, to: applied.to };
  });
  await notify.send({
    userId: out.student.user,
    eventType: out.approved ? 'allocation.change_approved' : 'allocation.change_rejected',
    title: `Allocation change ${out.approved ? 'approved' : 'rejected'}`,
    message: out.approved ? `Your allocation has been changed to ${out.to.code}.` : `Your change request was rejected: ${decisionReason}`,
    entityType: 'AllocationChangeRequest',
    entityId: out.request._id,
  });
  return out.request;
};

module.exports = {
  createRound, transitionRound, listRounds, getRound, setCapacity, listCapacities,
  submitApplication, listApplications, getApplication, setMetrics, withdrawApplication,
  dryRun, createRun, publishRun, listRuns, getRunFor, listAllocations, history,
  submitChange, listChanges, decideChange, applyChange, isId, ApiError,
};
