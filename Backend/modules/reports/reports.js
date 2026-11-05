/**
 * Report definitions built on modules that already exist. Each report:
 *   { title, scopes: [...allowed scopes], columns: [{key,label}], run(req, params) -> rows[] }
 * `scopes` is checked before run(); run() applies the caller's data scope (department / assigned / own).
 */
const Student = require('../../models/Student');
const { SubjectRegistration } = require('../registration/model');
const { Course, CourseOffering, CourseStaffAssignment } = require('../courses/model');
const { Request } = require('../requests/model');
const { and, studentFilter, studentField, offeringField, offeringIds, isWide } = require('./scope');

const ALL = ['own', 'assigned', 'department', 'faculty', 'system'];
const STAFF_SIDE = ['assigned', 'department', 'faculty', 'system'];
const MAX_ROWS = 50000;

const iso = (d) => (d ? new Date(d).toISOString() : '');

/* --------------------------------- students --------------------------------- */
const STUDENT_POPULATE = [
  { path: 'departmentRef', select: 'code name' },
  { path: 'programmeRef', select: 'code name' },
  { path: 'batchRef', select: 'label intakeYear' },
  { path: 'specializationRef', select: 'code name' },
];
const STUDENT_SELECT = 'studentId registrationNo fullName email departmentRef programmeRef batchRef specializationRef currentYear currentSemesterNumber status statusHistory progressionHistory';

const studentRows = async (req, p) => {
  const extra = {};
  const map = { department: 'departmentRef', programme: 'programmeRef', batch: 'batchRef', specialization: 'specializationRef', status: 'status', year: 'currentYear' };
  for (const [q, field] of Object.entries(map)) if (p[q]) extra[field] = p[q];
  return Student.find(and(await studentFilter(req), extra)).select(STUDENT_SELECT).populate(STUDENT_POPULATE).sort({ studentId: 1 }).limit(MAX_ROWS).lean();
};

const students = {
  title: 'Students (by batch, department or degree)',
  scopes: ALL,
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'registrationNo', label: 'Registration No' }, { key: 'fullName', label: 'Full name' }, { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' }, { key: 'programme', label: 'Degree programme' }, { key: 'batch', label: 'Batch' }, { key: 'specialization', label: 'Specialization / majoring' },
    { key: 'year', label: 'Year' }, { key: 'semester', label: 'Semester' }, { key: 'status', label: 'Status' },
  ],
  async run(req, p) {
    return (await studentRows(req, p)).map((s) => ({
      studentId: s.studentId, registrationNo: s.registrationNo, fullName: s.fullName, email: s.email,
      department: s.departmentRef && s.departmentRef.code, programme: s.programmeRef && s.programmeRef.code, batch: s.batchRef && s.batchRef.label,
      specialization: s.specializationRef ? s.specializationRef.code : '', year: s.currentYear, semester: s.currentSemesterNumber, status: s.status,
    }));
  },
};

/* ----------------------------- academic progression ----------------------------- */
const progression = {
  title: 'Academic progression',
  scopes: ['own', 'department', 'faculty', 'system'],
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'fullName', label: 'Full name' }, { key: 'batch', label: 'Batch' }, { key: 'intakeYear', label: 'Intake year' },
    { key: 'year', label: 'Current year' }, { key: 'semester', label: 'Current semester' }, { key: 'status', label: 'Status' },
    { key: 'progressions', label: 'Progressions' }, { key: 'lastProgressionAt', label: 'Last progression' }, { key: 'statusChanges', label: 'Status changes' }, { key: 'lastStatusChangeAt', label: 'Last status change' },
  ],
  async run(req, p) {
    return (await studentRows(req, p)).map((s) => {
      const prog = s.progressionHistory || [];
      const stat = s.statusHistory || [];
      return {
        studentId: s.studentId, fullName: s.fullName, batch: s.batchRef && s.batchRef.label, intakeYear: s.batchRef && s.batchRef.intakeYear,
        year: s.currentYear, semester: s.currentSemesterNumber, status: s.status, progressions: prog.length,
        lastProgressionAt: prog.length ? iso(prog[prog.length - 1].at) : '', statusChanges: stat.length, lastStatusChangeAt: stat.length ? iso(stat[stat.length - 1].at) : '',
      };
    });
  },
};

/* ------------------------------- course offerings ------------------------------- */
const offeringsReport = {
  title: 'Course offerings',
  scopes: ALL,
  columns: [
    { key: 'courseCode', label: 'Course code' }, { key: 'courseTitle', label: 'Title' }, { key: 'credits', label: 'Credits' }, { key: 'type', label: 'Type' },
    { key: 'semester', label: 'Semester' }, { key: 'batch', label: 'Batch' }, { key: 'status', label: 'Status' }, { key: 'capacity', label: 'Capacity' }, { key: 'registered', label: 'Registered' },
    { key: 'lecturer', label: 'Lecturer' }, { key: 'demonstrators', label: 'Demonstrators' },
  ],
  async run(req, p) {
    const extra = {};
    for (const f of ['semester', 'batch', 'status', 'course']) if (p[f]) extra[f] = p[f];
    const filter = and(await offeringField(req, '_id'), req.access.scope === 'own' ? { status: { $in: ['open', 'running', 'completed'] } } : {}, extra);
    const offerings = await CourseOffering.find(filter).populate([{ path: 'course', select: 'code title credits type' }, { path: 'semester', select: 'name' }, { path: 'batch', select: 'label' }]).limit(MAX_ROWS).lean();
    const staff = await CourseStaffAssignment.find({ offering: { $in: offerings.map((o) => o._id) }, active: true }).populate({ path: 'staff', select: 'fullName' }).lean();
    const by = new Map();
    for (const a of staff) {
      const k = String(a.offering);
      if (!by.has(k)) by.set(k, { lecturer: [], demonstrators: [] });
      if (a.role === 'lecturer') by.get(k).lecturer.push(a.staff && a.staff.fullName);
      if (a.role === 'demonstrator') by.get(k).demonstrators.push(a.staff && a.staff.fullName);
    }
    return offerings.map((o) => {
      const s = by.get(String(o._id)) || { lecturer: [], demonstrators: [] };
      return {
        courseCode: o.course && o.course.code, courseTitle: o.course && o.course.title, credits: o.course && o.course.credits, type: o.course && o.course.type,
        semester: o.semester && o.semester.name, batch: o.batch && o.batch.label, status: o.status, capacity: o.capacity, registered: o.registeredCount,
        lecturer: s.lecturer.join('; '), demonstrators: s.demonstrators.join('; '),
      };
    });
  },
};

/* ---------------------------- registrations & assignments ---------------------------- */
const registrations = {
  title: 'Course registrations',
  scopes: ALL,
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'courseCode', label: 'Course code' }, { key: 'courseTitle', label: 'Title' },
    { key: 'semester', label: 'Semester' }, { key: 'credits', label: 'Credits' }, { key: 'status', label: 'Status' }, { key: 'exception', label: 'Exception requested' },
    { key: 'requestedAt', label: 'Requested' }, { key: 'decidedAt', label: 'Decided' },
  ],
  async run(req, p) {
    const extra = {};
    for (const f of ['status', 'semester', 'offering', 'student']) if (p[f]) extra[f] = p[f];
    let scope = {};
    if (req.access.scope === 'own') scope = { student: req.access.studentId || null };
    else if (req.access.scope === 'assigned') scope = await offeringField(req);
    else if (req.access.scope === 'department') scope = await studentField(req);
    const rows = await SubjectRegistration.find(and(scope, extra)).populate([{ path: 'student', select: 'studentId fullName' }, { path: 'course', select: 'code title' }, { path: 'semester', select: 'name' }]).sort({ requestedAt: -1 }).limit(MAX_ROWS).lean();
    return rows.map((r) => ({
      studentId: r.student && r.student.studentId, studentName: r.student && r.student.fullName, courseCode: r.course && r.course.code, courseTitle: r.course && r.course.title,
      semester: r.semester && r.semester.name, credits: r.credits, status: r.status, exception: r.exception && r.exception.requested ? 'yes' : 'no', requestedAt: iso(r.requestedAt), decidedAt: iso(r.decidedAt),
    }));
  },
};

const staffAssignments = {
  title: 'Staff assignments',
  scopes: STAFF_SIDE,
  columns: [
    { key: 'staffId', label: 'Staff ID' }, { key: 'staffName', label: 'Staff' }, { key: 'role', label: 'Role' }, { key: 'component', label: 'Component' }, { key: 'courseCode', label: 'Course code' },
    { key: 'courseTitle', label: 'Title' }, { key: 'semester', label: 'Semester' }, { key: 'batch', label: 'Batch' }, { key: 'from', label: 'From' }, { key: 'to', label: 'To' }, { key: 'active', label: 'Active' },
  ],
  async run(req, p) {
    const extra = {};
    if (p.active !== undefined && p.active !== '') extra.active = p.active === 'true';
    for (const f of ['role', 'staff', 'offering']) if (p[f]) extra[f] = p[f];
    let scope = {};
    if (req.access.scope === 'assigned') scope = { staff: req.access.staffId || null };
    else if (req.access.scope === 'department') scope = await offeringField(req);
    const rows = await CourseStaffAssignment.find(and(scope, extra)).sort({ from: -1 }).limit(MAX_ROWS)
      .populate([{ path: 'staff', select: 'fullName staffId' }, { path: 'offering', populate: [{ path: 'course', select: 'code title' }, { path: 'semester', select: 'name' }, { path: 'batch', select: 'label' }] }]).lean();
    return rows.map((a) => ({
      staffId: a.staff && a.staff.staffId, staffName: a.staff && a.staff.fullName, role: a.role, component: a.componentType,
      courseCode: a.offering && a.offering.course && a.offering.course.code, courseTitle: a.offering && a.offering.course && a.offering.course.title,
      semester: a.offering && a.offering.semester && a.offering.semester.name, batch: a.offering && a.offering.batch && a.offering.batch.label, from: iso(a.from), to: iso(a.to), active: a.active ? 'yes' : 'no',
    }));
  },
};

/* ------------------------------- pending requests ------------------------------- */
const pendingRequests = {
  title: 'Pending requests',
  scopes: ['own', 'assigned', 'department', 'faculty', 'system'],
  columns: [
    { key: 'id', label: 'Request' }, { key: 'type', label: 'Type' }, { key: 'requester', label: 'Requester' }, { key: 'department', label: 'Department' }, { key: 'status', label: 'Status' },
    { key: 'step', label: 'Current step' }, { key: 'waitingFor', label: 'Waiting for (role)' }, { key: 'submittedAt', label: 'Submitted' }, { key: 'ageDays', label: 'Age (days)' },
  ],
  async run(req, p) {
    const filter = { status: { $in: ['submitted', 'in_review'] } };
    if (p.type) filter.type = p.type;
    if (p.department && isWide(req)) filter.department = p.department;
    if (['own', 'assigned'].includes(req.access.scope)) filter.requester = req.user.id;
    else if (req.access.scope === 'department') filter.$or = [{ department: { $in: req.access.departments } }, { requester: req.user.id }];
    const rows = await Request.find(filter).populate([{ path: 'requester', select: 'name' }, { path: 'department', select: 'code' }]).sort({ submittedAt: 1 }).limit(MAX_ROWS).lean();
    return rows.map((r) => ({
      id: String(r._id), type: r.type, requester: r.requester && r.requester.name, department: r.department && r.department.code, status: r.status,
      step: r.steps[r.currentStep] ? r.steps[r.currentStep].label : '', waitingFor: r.currentRole, submittedAt: iso(r.submittedAt), ageDays: r.submittedAt ? Math.floor((Date.now() - new Date(r.submittedAt).getTime()) / 86400000) : '',
    }));
  },
};

module.exports = {
  ALL, STAFF_SIDE, MAX_ROWS, iso, offeringIds,
  registry: {
    students, 'academic-progression': progression, 'course-offerings': offeringsReport, 'course-registrations': registrations,
    'staff-assignments': staffAssignments, 'pending-requests': pendingRequests,
  },
  Course,
};
