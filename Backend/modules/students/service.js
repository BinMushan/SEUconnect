const crypto = require('crypto');
const Student = require('../../models/Student');
const User = require('../../models/User');
const { Department, DegreeProgramme, AcademicBatch, Specialization } = require('../organization/model');
const { SubjectRegistration } = require('../registration/model');
const { assignedOfferingIds } = require('../courses/assignmentScope');
const { paginate, buildSort, textFilter } = require('../../core/pagination');
const { notFound, badRequest, conflict } = require('../../core/http');
const { withTransaction } = require('../../core/transaction');
const { assertDepartment, byId } = require('../../core/scope');
const { hashPassword } = require('../../utils/password');
const { invalidateAccess } = require('../../core/rbac');
const { invalidateAccount } = require('../../middleware/auth');
const audit = require('../../core/audit');

const POPULATE = [
  { path: 'departmentRef', select: 'code name' },
  { path: 'programmeRef', select: 'code name' },
  { path: 'batchRef', select: 'intakeYear label' },
  { path: 'specializationRef', select: 'code name kind' },
];
// Legacy demo sections are not returned by the new API (they are denormalised and unaudited).
const SELECT = '-attendance -medicalRequests -examinations -results -gpaCgpa -academicProgress -semesterRegistrations -academicProfile';

// Which student rows the caller may see.
const scopeFilter = async (req) => {
  switch (req.access.scope) {
    case 'own':
      return { _id: req.access.studentId || null };
    case 'assigned': {
      const offerings = await assignedOfferingIds(req);
      const ids = await SubjectRegistration.find({ offering: { $in: offerings }, status: { $in: ['pending', 'approved'] } }).distinct('student');
      return { _id: { $in: ids } };
    }
    case 'department':
      return { departmentRef: { $in: req.access.departments } };
    default:
      return {};
  }
};

const list = async (req, query) => {
  const filter = { ...(await scopeFilter(req)) };
  const map = { department: 'departmentRef', programme: 'programmeRef', batch: 'batchRef', specialization: 'specializationRef', status: 'status', year: 'currentYear' };
  for (const [q, field] of Object.entries(map)) if (query[q] !== undefined && query[q] !== '') filter[field] = query[q];
  const text = textFilter(query.q, ['fullName', 'studentId', 'registrationNo', 'email']);
  if (text) Object.assign(filter, text);
  return paginate(Student, filter, { page: query.page, limit: query.limit, sort: buildSort(query.sort, ['fullName', 'studentId', 'currentYear', 'createdAt'], 'studentId'), populate: POPULATE, select: SELECT });
};

const get = async (req, id) => {
  const doc = await Student.findOne(byId(id, await scopeFilter(req))).select(SELECT).populate(POPULATE).lean();
  if (!doc) throw notFound('Student not found.');
  return doc;
};

// Cross-reference checks: a student must sit in a consistent department -> programme -> batch -> specialization chain.
const validateChain = async ({ departmentRef, programmeRef, batchRef, specializationRef }, session) => {
  const programme = await DegreeProgramme.findById(programmeRef).session(session);
  if (!programme) throw badRequest('Degree programme not found.', null, 'PROGRAMME_INVALID');
  if (String(programme.department) !== String(departmentRef)) throw badRequest('The programme does not belong to the selected department.', null, 'PROGRAMME_DEPARTMENT_MISMATCH');
  const batch = await AcademicBatch.findById(batchRef).session(session);
  if (!batch || String(batch.programme) !== String(programmeRef)) throw badRequest('The batch does not belong to the selected programme.', null, 'BATCH_PROGRAMME_MISMATCH');
  if (specializationRef) {
    const sp = await Specialization.findById(specializationRef).session(session);
    if (!sp || String(sp.programme) !== String(programmeRef)) throw badRequest('The specialization does not belong to the selected programme.', null, 'SPECIALIZATION_PROGRAMME_MISMATCH');
  }
  return { programme, batch };
};

const create = async (req, body) => {
  assertDepartment(req, body.departmentRef);
  const result = await withTransaction(async (session) => {
    if (!(await Department.exists({ _id: body.departmentRef }).session(session))) throw badRequest('Department not found.', null, 'DEPARTMENT_INVALID');
    const { batch } = await validateChain(body, session);
    const { createAccount, ...data } = body;
    data.registrationNo = data.registrationNo || data.studentId;
    data.indexNo = data.indexNo || data.registrationNo.replace(/[^A-Za-z0-9]/g, '');
    data.admissionYear = data.admissionYear || batch.intakeYear;
    data.currentYear = data.currentYear || batch.currentAcademicYear || 1;

    let temporaryPassword = null;
    if (createAccount !== false) {
      if (await User.exists({ email: data.email }).session(session)) throw conflict('An account with this e-mail already exists.', null, 'EMAIL_EXISTS');
      temporaryPassword = `Tmp-${crypto.randomBytes(6).toString('base64url')}9a`;
      const dept = await Department.findById(data.departmentRef).session(session);
      const [user] = await User.create([{ name: data.fullName, email: data.email, password: hashPassword(temporaryPassword), role: 'student', roleKey: 'student', regNo: data.registrationNo, department: dept.name, departmentRef: data.departmentRef, mustChangePassword: true, avatarInitial: data.fullName.slice(0, 2).toUpperCase() }], { session });
      data.user = user._id;
    }
    const [student] = await Student.create([data], { session });
    await audit.record({ req, action: 'student.create', entityType: 'Student', entityId: student._id, after: student }, { session });
    return { student, temporaryPassword };
  });
  return { student: await get(req, result.student._id), temporaryPassword: result.temporaryPassword };
};

const update = async (req, id, patch) => {
  await withTransaction(async (session) => {
    const doc = await Student.findOne(byId(id, await scopeFilter(req))).session(session);
    if (!doc) throw notFound('Student not found.');
    assertDepartment(req, doc.departmentRef);
    const next = { departmentRef: doc.departmentRef, programmeRef: doc.programmeRef, batchRef: doc.batchRef, specializationRef: doc.specializationRef, ...patch };
    if (['departmentRef', 'programmeRef', 'batchRef', 'specializationRef'].some((k) => patch[k] !== undefined)) {
      assertDepartment(req, next.departmentRef);
      await validateChain(next, session);
    }
    const before = doc.toObject();
    doc.set(patch);
    await doc.save({ session });
    await audit.record({ req, action: 'student.update', entityType: 'Student', entityId: doc._id, before, after: doc }, { session });
  });
  return get(req, id);
};

const TERMINAL = ['Graduated', 'Withdrawn'];
const USER_STATE = { Active: 'active', 'On Leave': 'active', Suspended: 'suspended', Graduated: 'active', Withdrawn: 'disabled' };

const setStatus = async (req, id, status, reason) => {
  await withTransaction(async (session) => {
    const doc = await Student.findOne(byId(id, await scopeFilter(req))).session(session);
    if (!doc) throw notFound('Student not found.');
    assertDepartment(req, doc.departmentRef);
    if (doc.status === status) throw conflict(`The student is already ${status}.`, null, 'NO_CHANGE');
    if (TERMINAL.includes(doc.status) && req.access.scope !== 'system') throw conflict(`A ${doc.status} student record can only be reopened by a system administrator.`, null, 'TERMINAL_STATUS');
    const before = doc.toObject();
    doc.statusHistory.push({ from: doc.status, to: status, reason, by: req.user.id, at: new Date() });
    doc.status = status;
    doc.accountStatus = USER_STATE[status] === 'active' ? 'active' : USER_STATE[status];
    await doc.save({ session });
    if (doc.user) {
      const user = await User.findById(doc.user).session(session);
      if (user) {
        user.status = USER_STATE[status];
        if (user.status !== 'active') user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save({ session });
        invalidateAccount(String(user._id));
        invalidateAccess(String(user._id));
      }
    }
    await audit.record({ req, action: 'student.status', entityType: 'Student', entityId: doc._id, before: { status: before.status }, after: { status }, reason }, { session });
  });
  return get(req, id);
};

/** Complete academic history: status changes, progression, registrations (grades/GPA/allocations are added by their modules). */
const history = async (req, id) => {
  const student = await get(req, id);
  const raw = await Student.findById(id).select('statusHistory progressionHistory').lean();
  const registrations = await SubjectRegistration.find({ student: id }).sort({ requestedAt: -1 }).populate({ path: 'course', select: 'code title credits' }).lean();
  const sections = { statusHistory: raw.statusHistory, progressionHistory: raw.progressionHistory, registrations };
  const mongoose = require('mongoose');
  if (mongoose.models.GradeRecord) sections.results = await mongoose.models.GradeRecord.find({ student: id }).sort({ createdAt: -1 }).lean();
  if (mongoose.models.GPARecord) sections.gpa = await mongoose.models.GPARecord.find({ student: id }).sort({ createdAt: 1 }).lean();
  if (mongoose.models.SpecializationAllocation) sections.allocations = await mongoose.models.SpecializationAllocation.find({ student: id }).sort({ createdAt: 1 }).lean();
  return { student, ...sections };
};

/** Moves every active student of a batch to the next academic year / semester (never backwards). */
const progress = async (req, { batch, toYear, toSemester, graduate }) => {
  return withTransaction(async (session) => {
    const b = await AcademicBatch.findById(batch).populate('programme').session(session);
    if (!b) throw notFound('Batch not found.');
    assertDepartment(req, b.programme.department);
    const maxYear = b.programme.durationYears;
    const maxSem = b.programme.semestersPerYear;
    if (!graduate && (toYear > maxYear || toSemester > maxSem)) throw badRequest(`This programme has ${maxYear} years of ${maxSem} semesters.`, null, 'OUT_OF_RANGE');
    const students = await Student.find({ batchRef: batch, status: 'Active' }).session(session);
    let moved = 0;
    for (const s of students) {
      if (graduate) {
        s.statusHistory.push({ from: s.status, to: 'Graduated', reason: 'Batch graduation', by: req.user.id, at: new Date() });
        s.status = 'Graduated';
      } else {
        const backwards = toYear < s.currentYear || (toYear === s.currentYear && toSemester < s.currentSemesterNumber);
        if (backwards) throw conflict(`Student ${s.studentId} is already beyond Year ${toYear} Semester ${toSemester}.`, null, 'PROGRESSION_BACKWARDS');
        if (toYear === s.currentYear && toSemester === s.currentSemesterNumber) continue;
        s.progressionHistory.push({ fromYear: s.currentYear, fromSemester: s.currentSemesterNumber, toYear, toSemester, by: req.user.id, at: new Date() });
        s.currentYear = toYear;
        s.currentSemesterNumber = toSemester;
        s.currentSemester = `Year ${toYear} Semester ${toSemester}`;
      }
      await s.save({ session });
      moved += 1;
    }
    if (graduate) b.status = 'graduated';
    else b.currentAcademicYear = Math.max(b.currentAcademicYear, toYear);
    await b.save({ session });
    await audit.record({ req, action: graduate ? 'batch.graduate' : 'batch.progress', entityType: 'AcademicBatch', entityId: b._id, after: { toYear, toSemester, studentsMoved: moved } }, { session });
    return { batch: String(b._id), studentsMoved: moved };
  });
};

module.exports = { list, get, create, update, setStatus, history, progress, scopeFilter };
