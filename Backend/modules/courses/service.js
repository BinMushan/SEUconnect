const mongoose = require('mongoose');
const { Course, CoursePrerequisite, AssessmentConfiguration, CourseOffering, CourseStaffAssignment, COMPONENTS_BY_TYPE } = require('./model');
const { Department, DegreeProgramme, Specialization, AcademicBatch, Semester } = require('../organization/model');
const { Staff } = require('../staff/model');
const Student = require('../../models/Student');
const { SubjectRegistration, LIVE } = require('../registration/model');
const { assignedOfferingIds } = require('./assignmentScope');
const { paginate, buildSort, textFilter } = require('../../core/pagination');
const { notFound, badRequest, conflict } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { departmentFilter, assertDepartment, byId } = require('../../core/scope');
const policy = require('../../core/policy');
const audit = require('../../core/audit');

/* ================================ courses ================================ */
const COURSE_POPULATE = [{ path: 'department', select: 'code name' }, { path: 'programme', select: 'code name' }, { path: 'specialization', select: 'code name kind' }];

const listCourses = async (req, query) => {
  const filter = { ...departmentFilter(req, 'department') };
  for (const f of ['department', 'programme', 'specialization', 'type', 'status', 'defaultYear', 'defaultSemester']) if (query[f] !== undefined && query[f] !== '') filter[f] = query[f];
  const text = textFilter(query.q, ['code', 'title']);
  if (text) Object.assign(filter, text);
  return paginate(Course, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['code', 'title', 'credits', 'createdAt'], 'code'), populate: COURSE_POPULATE });
};

const getCourse = async (req, id) => {
  const course = await Course.findOne(byId(id, departmentFilter(req, 'department'))).populate(COURSE_POPULATE).lean();
  if (!course) throw notFound('Course not found.');
  course.prerequisites = await CoursePrerequisite.find({ course: id }).populate({ path: 'prerequisite', select: 'code title credits' }).lean();
  course.components = COMPONENTS_BY_TYPE[course.type];
  return course;
};

const validateCourseChain = async ({ department, programme, specialization }, session) => {
  const prog = await DegreeProgramme.findById(programme).session(session);
  if (!prog) throw badRequest('Degree programme not found.', null, 'PROGRAMME_INVALID');
  if (String(prog.department) !== String(department)) throw badRequest('The programme does not belong to the selected department.', null, 'PROGRAMME_DEPARTMENT_MISMATCH');
  if (specialization) {
    const sp = await Specialization.findById(specialization).session(session);
    if (!sp || String(sp.programme) !== String(programme)) throw badRequest('The specialization does not belong to the programme.', null, 'SPECIALIZATION_PROGRAMME_MISMATCH');
  }
};

const createCourse = async (req, body) => {
  assertDepartment(req, body.department);
  return withTransaction(async (session) => {
    await validateCourseChain(body, session);
    const [course] = await Course.create([body], { session });
    await audit.record({ req, action: 'course.create', entityType: 'Course', entityId: course._id, after: course }, { session });
    return course;
  });
};

const updateCourse = async (req, id, patch) => {
  return withTransaction(async (session) => {
    const course = await Course.findOne(byId(id, departmentFilter(req, 'department'))).session(session);
    if (!course) throw notFound('Course not found.');
    assertDepartment(req, course.department);
    if (patch.type && patch.type !== course.type && (await CourseOffering.exists({ course: id }).session(session))) {
      throw conflict('The course type cannot change after the course has been offered.', null, 'COURSE_ALREADY_OFFERED');
    }
    const next = { department: course.department, programme: course.programme, specialization: course.specialization, ...patch };
    await validateCourseChain(next, session);
    const before = course.toObject();
    course.set(patch);
    await course.save({ session });
    await audit.record({ req, action: 'course.update', entityType: 'Course', entityId: course._id, before, after: course }, { session });
    return course;
  });
};

const archiveCourse = async (req, id, reason) => {
  return withTransaction(async (session) => {
    const course = await Course.findOne(byId(id, departmentFilter(req, 'department'))).session(session);
    if (!course) throw notFound('Course not found.');
    assertDepartment(req, course.department);
    const before = course.toObject();
    course.status = 'archived';
    await course.save({ session });
    await audit.record({ req, action: 'course.archive', entityType: 'Course', entityId: course._id, before, after: course, reason }, { session });
    return course;
  });
};

// Detects whether `target` is reachable from `start` by following prerequisite links.
const reaches = async (start, target, session) => {
  const seen = new Set();
  const stack = [String(start)];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === String(target)) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const next = await CoursePrerequisite.find({ course: cur }).session(session).distinct('prerequisite');
    next.forEach((n) => stack.push(String(n)));
  }
  return false;
};

const setPrerequisites = async (req, id, prerequisiteIds) => {
  return withTransaction(async (session) => {
    const course = await Course.findOne(byId(id, departmentFilter(req, 'department'))).session(session);
    if (!course) throw notFound('Course not found.');
    assertDepartment(req, course.department);
    const unique = [...new Set(prerequisiteIds.map(String))];
    if (unique.includes(String(id))) throw badRequest('A course cannot be its own prerequisite.', null, 'SELF_PREREQUISITE');
    const found = await Course.countDocuments({ _id: { $in: unique } }).session(session);
    if (found !== unique.length) throw badRequest('One or more prerequisite courses do not exist.', null, 'PREREQUISITE_INVALID');
    // Replace the set first, then verify no prerequisite leads back to this course (cycle).
    const before = await CoursePrerequisite.find({ course: id }).session(session).lean();
    await CoursePrerequisite.deleteMany({ course: id }, { session });
    for (const p of unique) {
      if (await reaches(p, id, session)) throw conflict('That prerequisite would create a circular dependency.', { prerequisite: p }, 'PREREQUISITE_CYCLE');
    }
    if (unique.length) await CoursePrerequisite.create(unique.map((p) => ({ course: id, prerequisite: p })), { session, ordered: true });
    await audit.record({ req, action: 'course.prerequisites', entityType: 'Course', entityId: id, before: before.map((b) => String(b.prerequisite)), after: unique }, { session });
    return CoursePrerequisite.find({ course: id }).session(session).populate({ path: 'prerequisite', select: 'code title' }).lean();
  });
};

/* ========================= assessment configurations ========================= */
const prepareConfig = async (body, ctx = {}) => {
  if (Math.round((body.caWeight + body.esaWeight) * 1000) !== 100000) throw badRequest('caWeight and esaWeight must add up to 100.', { caWeight: body.caWeight, esaWeight: body.esaWeight }, 'WEIGHTS_INVALID');
  const out = { ...body };
  // Pass marks default to the configured policy (never to a constant in code).
  if (out.minCaPercent === undefined) out.minCaPercent = await policy.getOr('assessment.minCaPercent', null, ctx);
  if (out.minEsaPercent === undefined) out.minEsaPercent = await policy.getOr('assessment.minEsaPercent', null, ctx);
  return out;
};

/* ================================= offerings ================================= */
const OFFERING_POPULATE = [
  { path: 'course', select: 'code title credits type department programme' },
  { path: 'semester', select: 'name number academicYear status registrationOpens registrationCloses addDropOpens addDropCloses' },
  { path: 'batch', select: 'intakeYear label programme' },
  { path: 'components.assessmentConfiguration' },
];

const offeringScope = async (req) => {
  switch (req.access.scope) {
    case 'own': {
      const student = await Student.findById(req.access.studentId).select('batchRef').lean();
      return { batch: student ? student.batchRef : null, status: { $in: ['open', 'running', 'completed'] } };
    }
    case 'assigned':
      return { _id: { $in: await assignedOfferingIds(req) } };
    case 'department': {
      const courses = await Course.find({ department: { $in: req.access.departments } }).distinct('_id');
      return { course: { $in: courses } };
    }
    default:
      return {};
  }
};

const listOfferings = async (req, query) => {
  const filter = await offeringScope(req);
  for (const f of ['course', 'semester', 'batch', 'status']) if (query[f]) filter[f] = query[f];
  return paginate(CourseOffering, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['createdAt', 'status'], '-createdAt'), populate: OFFERING_POPULATE });
};

const getOffering = async (req, id) => {
  const o = await CourseOffering.findOne(byId(id, await offeringScope(req))).populate(OFFERING_POPULATE).lean();
  if (!o) throw notFound('Course offering not found.');
  o.assignments = await CourseStaffAssignment.find({ offering: id, active: true }).populate({ path: 'staff', select: 'fullName staffId' }).lean();
  return o;
};

const validateComponents = async (course, components, session) => {
  const wanted = COMPONENTS_BY_TYPE[course.type];
  const types = components.map((c) => c.type).sort();
  if (JSON.stringify(types) !== JSON.stringify([...wanted].sort())) {
    throw badRequest(`A Type ${course.type} course needs exactly these components: ${wanted.join(' + ')}.`, null, 'COMPONENTS_INVALID');
  }
  const total = components.reduce((s, c) => s + c.weightInCourse, 0);
  if (Math.round(total * 1000) !== 100000) throw badRequest('Component weights must add up to 100.', { total }, 'COMPONENT_WEIGHTS_INVALID');
  for (const c of components) {
    if (!(await AssessmentConfiguration.exists({ _id: c.assessmentConfiguration, status: 'active' }).session(session))) throw badRequest('An assessment configuration does not exist or is archived.', null, 'ASSESSMENT_CONFIGURATION_INVALID');
  }
};

const createOffering = async (req, body) => {
  return withTransaction(async (session) => {
    const course = await Course.findById(body.course).session(session);
    if (!course || course.status !== 'active') throw badRequest('The course does not exist or is not active.', null, 'COURSE_INVALID');
    assertDepartment(req, course.department);
    const batch = await AcademicBatch.findById(body.batch).session(session);
    if (!batch || String(batch.programme) !== String(course.programme)) throw badRequest('The batch does not belong to the programme of this course.', null, 'BATCH_PROGRAMME_MISMATCH');
    const semester = await Semester.findById(body.semester).session(session);
    if (!semester || ['closed', 'archived'].includes(semester.status)) throw badRequest('The semester does not exist or is closed.', null, 'SEMESTER_INVALID');
    await validateComponents(course, body.components, session);
    const [offering] = await CourseOffering.create([{ ...body, status: body.status || 'planned' }], { session });
    await audit.record({ req, action: 'offering.create', entityType: 'CourseOffering', entityId: offering._id, after: offering }, { session });
    return offering;
  });
};

const updateOffering = async (req, id, patch) => {
  return withTransaction(async (session) => {
    const offering = await CourseOffering.findById(id).session(session);
    if (!offering) throw notFound('Course offering not found.');
    const course = await Course.findById(offering.course).session(session);
    assertDepartment(req, course.department);
    if (!['planned', 'open'].includes(offering.status)) throw conflict('Only planned or open offerings can be edited.', null, 'OFFERING_LOCKED');
    if (patch.capacity && patch.capacity < offering.registeredCount) throw conflict(`There are already ${offering.registeredCount} live registrations.`, null, 'CAPACITY_BELOW_REGISTERED');
    if (patch.components) await validateComponents(course, patch.components, session);
    const before = offering.toObject();
    offering.set(patch);
    await offering.save({ session });
    await audit.record({ req, action: 'offering.update', entityType: 'CourseOffering', entityId: offering._id, before, after: offering }, { session });
    return offering;
  });
};

const OFFERING_NEXT = { planned: ['open', 'cancelled'], open: ['running', 'cancelled'], running: ['completed'], completed: [], cancelled: [] };
const transitionOffering = async (req, id, to, reason) => {
  return withTransaction(async (session) => {
    const offering = await CourseOffering.findById(id).session(session);
    if (!offering) throw notFound('Course offering not found.');
    const course = await Course.findById(offering.course).session(session);
    assertDepartment(req, course.department);
    if (!OFFERING_NEXT[offering.status].includes(to)) throw conflict(`A ${offering.status} offering cannot become ${to}.`, { allowed: OFFERING_NEXT[offering.status] }, 'INVALID_TRANSITION');
    const before = offering.toObject();
    if (to === 'cancelled') {
      // Live registrations of a cancelled offering are cancelled with it, keeping their history.
      const live = await SubjectRegistration.find({ offering: id, status: { $in: LIVE } }).session(session);
      for (const r of live) {
        r.status = 'cancelled';
        r.history.push({ status: 'cancelled', at: new Date(), by: req.user.id, note: 'Offering cancelled' });
        await r.save({ session });
      }
      offering.registeredCount = 0;
    }
    offering.status = to;
    await offering.save({ session });
    await audit.record({ req, action: 'offering.transition', entityType: 'CourseOffering', entityId: offering._id, before, after: offering, reason }, { session });
    return offering;
  });
};

/* ============================= staff assignments ============================= */
const ROLE_RESPONSIBILITY = { lecturer: ['lecturer', 'course_coordinator'], coordinator: ['course_coordinator', 'lecturer'], demonstrator: ['demonstrator'] };

const listAssignments = async (req, offeringId, { history } = {}) => {
  await getOffering(req, offeringId); // enforces scope
  const filter = { offering: offeringId, ...(history ? {} : { active: true }) };
  return CourseStaffAssignment.find(filter).sort({ from: -1 }).populate({ path: 'staff', select: 'fullName staffId' }).lean();
};

const assignStaff = async (req, offeringId, body) => {
  return withTransaction(async (session) => {
    const offering = await CourseOffering.findById(offeringId).session(session);
    if (!offering) throw notFound('Course offering not found.');
    const course = await Course.findById(offering.course).session(session);
    assertDepartment(req, course.department);
    if (['completed', 'cancelled'].includes(offering.status)) throw conflict('This offering is closed to new assignments.', null, 'OFFERING_CLOSED');
    if (body.role !== 'coordinator' && !offering.components.some((c) => c.type === body.componentType)) throw badRequest('This offering has no such component.', null, 'COMPONENT_INVALID');
    if (body.role === 'lecturer' && body.componentType !== 'theory') throw badRequest('Lecturers are assigned to the theory component.', null, 'ROLE_COMPONENT_MISMATCH');
    if (body.role === 'demonstrator' && body.componentType !== 'practical') throw badRequest('Demonstrators are assigned to the practical component.', null, 'ROLE_COMPONENT_MISMATCH');

    const staff = await Staff.findById(body.staff).session(session);
    if (!staff || staff.employmentStatus !== 'active' || staff.accountStatus !== 'active') throw badRequest('The staff member is not active.', null, 'STAFF_INVALID');
    if (String(staff.department) !== String(course.department) && !['faculty', 'system'].includes(req.access.scope)) throw badRequest('The staff member belongs to a different department.', null, 'STAFF_DEPARTMENT_MISMATCH');
    if (!staff.responsibilities.some((r) => r.active && ROLE_RESPONSIBILITY[body.role].includes(r.type))) {
      throw badRequest(`The staff member does not hold the ${ROLE_RESPONSIBILITY[body.role].join(' / ')} responsibility.`, null, 'RESPONSIBILITY_MISSING');
    }

    const single = ['lecturer', 'coordinator'].includes(body.role);
    const current = await CourseStaffAssignment.findOne({ offering: offeringId, componentType: body.componentType, role: body.role, active: true }).session(session);
    if (single && current) {
      if (!body.replace) throw conflict('An active assignment already exists. Pass replace:true to hand over (the previous assignment is kept as history).', { current: String(current._id) }, 'ASSIGNMENT_EXISTS');
      current.active = false;
      current.to = new Date();
      current.endedBy = req.user.id;
      await current.save({ session });
    }
    const [created] = await CourseStaffAssignment.create([{ offering: offeringId, componentType: body.componentType, staff: body.staff, role: body.role, note: body.note, assignedBy: req.user.id, from: new Date() }], { session });
    if (body.role === 'coordinator') {
      offering.coordinator = body.staff;
      await offering.save({ session });
    }
    await audit.record({ req, action: 'assignment.create', entityType: 'CourseStaffAssignment', entityId: created._id, before: current ? { staff: String(current.staff) } : undefined, after: created, reason: body.note }, { session });
    return created;
  });
};

const endAssignment = async (req, offeringId, assignmentId, reason) => {
  return withTransaction(async (session) => {
    const a = await CourseStaffAssignment.findOne({ _id: assignmentId, offering: offeringId, active: true }).session(session);
    if (!a) throw notFound('Active assignment not found.');
    const offering = await CourseOffering.findById(offeringId).session(session);
    const course = await Course.findById(offering.course).session(session);
    assertDepartment(req, course.department);
    const before = a.toObject();
    a.active = false;
    a.to = new Date();
    a.endedBy = req.user.id;
    await a.save({ session });
    await audit.record({ req, action: 'assignment.end', entityType: 'CourseStaffAssignment', entityId: a._id, before, after: a, reason }, { session });
    return a;
  });
};

module.exports = {
  listCourses, getCourse, createCourse, updateCourse, archiveCourse, setPrerequisites, prepareConfig,
  listOfferings, getOffering, createOffering, updateOffering, transitionOffering, listAssignments, assignStaff, endAssignment,
  validateComponents, mongoose,
};
