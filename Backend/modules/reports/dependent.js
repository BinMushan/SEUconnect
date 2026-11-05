/**
 * Reports over modules that are built separately (allocation, attendance, assessment, results).
 * Their models are looked up LAZILY through mongoose.models, so this file works whether or not those modules are
 * loaded; when a source model is missing the endpoint answers 501 REPORT_SOURCE_NOT_AVAILABLE.
 *
 * FIELD ASSUMPTIONS (verify during integration) - model name: fields used
 *   SpecializationAllocation : student, specialization (ref Specialization {code,name,kind}), run, status, decidedAt
 *   AllocationRun            : status, mode (optional - only populated when the model exists)
 *   ClassSession             : offering, status (optional, 'cancelled' sessions are ignored), type|componentType (optional)
 *   AttendanceRecord         : session (ref ClassSession), student, status ('present'|'absent'|'excused')
 *   Assessment               : offering, component|componentType, name, maxMarks, weight, status
 *   StudentAssessmentMark    : assessment (ref Assessment), student, marks, status
 *   ESASchedule              : offering, component|componentType, format, date, venue
 *   ESAMark                  : schedule (ref ESASchedule), student, marks, status
 *   GradeRecord              : student, offering, course, finalMark, grade, gradePoint, passed, state ('published' is the only state shown to students)
 *   GPARecord                : student, semester, scope ('semester'|'cumulative'), credits, gpa, state
 */
const mongoose = require('mongoose');
const Student = require('../../models/Student');
const { CourseOffering } = require('../courses/model');
const { ApiError } = require('../../core/http');
const { and, studentField, offeringField, offeringIds, isWide } = require('./scope');

const STAFF_SIDE = ['assigned', 'department', 'faculty', 'system'];
const MAX_ROWS = 50000;
const iso = (d) => (d ? new Date(d).toISOString() : '');

const need = (...names) => {
  const missing = names.filter((n) => !mongoose.models[n]);
  if (missing.length) throw new ApiError(501, 'REPORT_SOURCE_NOT_AVAILABLE', `This report needs data that is not available yet (${missing.join(', ')}).`);
  return names.map((n) => mongoose.models[n]);
};
// Used by GET / to say which reports are usable right now.
const available = (names) => names.every((n) => mongoose.models[n]);

const studentInfo = async (ids) => {
  const docs = await Student.find({ _id: { $in: ids } }).select('studentId fullName').lean();
  return new Map(docs.map((d) => [String(d._id), d]));
};
const code = (v) => (v ? String(v) : '');

/* ------------------------------- allocations ------------------------------- */
const allocationReport = (kind, title) => ({
  title,
  sources: ['SpecializationAllocation'],
  scopes: ['department', 'faculty', 'system'],
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'track', label: kind === 'majoring' ? 'Majoring division' : 'Specialization' },
    { key: 'trackName', label: 'Name' }, { key: 'status', label: 'Status' }, { key: 'decidedAt', label: 'Decided' }, { key: 'runStatus', label: 'Run status' },
  ],
  async run(req, p) {
    const [Allocation] = need('SpecializationAllocation');
    const filter = and(await studentField(req), p.status ? { status: p.status } : {});
    const populate = [{ path: 'specialization', select: 'code name kind' }];
    if (mongoose.models.AllocationRun) populate.push({ path: 'run', select: 'status' });
    const rows = (await Allocation.find(filter).populate(populate).limit(MAX_ROWS).lean()).filter((r) => r.specialization && r.specialization.kind === kind);
    const info = await studentInfo(rows.map((r) => r.student));
    return rows.map((r) => ({
      studentId: info.get(String(r.student)) && info.get(String(r.student)).studentId, studentName: info.get(String(r.student)) && info.get(String(r.student)).fullName,
      track: r.specialization.code, trackName: r.specialization.name, status: r.status, decidedAt: iso(r.decidedAt), runStatus: r.run && r.run.status,
    }));
  },
});

/* -------------------------------- attendance -------------------------------- */
const attendance = {
  title: 'Attendance',
  sources: ['ClassSession', 'AttendanceRecord'],
  scopes: STAFF_SIDE,
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'offering', label: 'Offering' }, { key: 'conducted', label: 'Sessions conducted' },
    { key: 'present', label: 'Present' }, { key: 'absent', label: 'Absent' }, { key: 'excused', label: 'Excused' }, { key: 'presentPercent', label: 'Present %' }, { key: 'presentOrExcusedPercent', label: 'Present + excused %' },
  ],
  async run(req, p) {
    const [Session, Record] = need('ClassSession', 'AttendanceRecord');
    const sessions = await Session.find(and(await offeringField(req), p.offering ? { offering: p.offering } : {})).lean();
    const live = sessions.filter((s) => s.status !== 'cancelled');
    const conducted = new Map();
    const offeringOf = new Map();
    for (const s of live) {
      conducted.set(String(s.offering), (conducted.get(String(s.offering)) || 0) + 1);
      offeringOf.set(String(s._id), String(s.offering));
    }
    const records = await Record.find(and({ session: { $in: [...offeringOf.keys()] } }, await studentField(req))).limit(MAX_ROWS * 4).lean();
    const agg = new Map();
    for (const r of records) {
      const off = offeringOf.get(String(r.session));
      const key = `${r.student}|${off}`;
      const a = agg.get(key) || { student: String(r.student), offering: off, present: 0, absent: 0, excused: 0 };
      if (a[r.status] !== undefined) a[r.status] += 1;
      agg.set(key, a);
    }
    const info = await studentInfo([...new Set([...agg.values()].map((a) => a.student))]);
    return [...agg.values()].map((a) => {
      const total = conducted.get(a.offering) || 0;
      const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : '');
      return {
        studentId: info.get(a.student) && info.get(a.student).studentId, studentName: info.get(a.student) && info.get(a.student).fullName, offering: a.offering, conducted: total,
        present: a.present, absent: a.absent, excused: a.excused, presentPercent: pct(a.present), presentOrExcusedPercent: pct(a.present + a.excused),
      };
    });
  },
};

/* ---------------------------------- marks ---------------------------------- */
const caMarks = {
  title: 'CA marks',
  sources: ['Assessment', 'StudentAssessmentMark'],
  scopes: STAFF_SIDE,
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'offering', label: 'Offering' }, { key: 'component', label: 'Component' }, { key: 'assessment', label: 'Assessment' },
    { key: 'marks', label: 'Marks' }, { key: 'maxMarks', label: 'Max' }, { key: 'weight', label: 'Weight' }, { key: 'status', label: 'Status' },
  ],
  async run(req, p) {
    const [Assessment, Mark] = need('Assessment', 'StudentAssessmentMark');
    const assessments = await Assessment.find(and(await offeringField(req), p.offering ? { offering: p.offering } : {})).lean();
    const byId = new Map(assessments.map((a) => [String(a._id), a]));
    const marks = await Mark.find(and({ assessment: { $in: [...byId.keys()] } }, await studentField(req), p.status ? { status: p.status } : {})).limit(MAX_ROWS).lean();
    const info = await studentInfo([...new Set(marks.map((m) => String(m.student)))]);
    return marks.map((m) => {
      const a = byId.get(String(m.assessment));
      return {
        studentId: info.get(String(m.student)) && info.get(String(m.student)).studentId, studentName: info.get(String(m.student)) && info.get(String(m.student)).fullName,
        offering: code(a.offering), component: a.component || a.componentType, assessment: a.name, marks: m.marks, maxMarks: a.maxMarks, weight: a.weight, status: m.status,
      };
    });
  },
};

const esaMarks = {
  title: 'ESA marks',
  sources: ['ESASchedule', 'ESAMark'],
  scopes: STAFF_SIDE,
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'offering', label: 'Offering' }, { key: 'component', label: 'Component' }, { key: 'format', label: 'Format' },
    { key: 'date', label: 'Exam date' }, { key: 'marks', label: 'Marks' }, { key: 'status', label: 'Status' },
  ],
  async run(req, p) {
    const [Schedule, Mark] = need('ESASchedule', 'ESAMark');
    const schedules = await Schedule.find(and(await offeringField(req), p.offering ? { offering: p.offering } : {})).lean();
    const byId = new Map(schedules.map((s) => [String(s._id), s]));
    const marks = await Mark.find(and({ schedule: { $in: [...byId.keys()] } }, await studentField(req), p.status ? { status: p.status } : {})).limit(MAX_ROWS).lean();
    const info = await studentInfo([...new Set(marks.map((m) => String(m.student)))]);
    return marks.map((m) => {
      const s = byId.get(String(m.schedule));
      return {
        studentId: info.get(String(m.student)) && info.get(String(m.student)).studentId, studentName: info.get(String(m.student)) && info.get(String(m.student)).fullName,
        offering: code(s.offering), component: s.component || s.componentType, format: s.format, date: iso(s.date), marks: m.marks, status: m.status,
      };
    });
  },
};

/* --------------------------- semester results and GPA --------------------------- */
const results = {
  title: 'Semester results',
  sources: ['GradeRecord'],
  scopes: ['own', 'assigned', 'department', 'faculty', 'system'],
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'offering', label: 'Offering' }, { key: 'course', label: 'Course' }, { key: 'finalMark', label: 'Final mark' },
    { key: 'grade', label: 'Grade' }, { key: 'gradePoint', label: 'Grade point' }, { key: 'passed', label: 'Passed' }, { key: 'state', label: 'State' },
  ],
  async run(req, p) {
    const [Grade] = need('GradeRecord');
    const extra = {};
    for (const f of ['offering', 'course', 'state']) if (p[f]) extra[f] = p[f];
    if (p.passed) extra.passed = p.passed === 'true';
    if (p.semester) extra.offering = { $in: await CourseOffering.find({ semester: p.semester }).distinct('_id') };
    const scope = req.access.scope === 'own' ? { student: req.access.studentId || null, state: 'published' } : req.access.scope === 'assigned' ? await offeringField(req) : await studentField(req);
    const rows = await Grade.find(and(scope, extra)).limit(MAX_ROWS).lean();
    const info = await studentInfo([...new Set(rows.map((r) => String(r.student)))]);
    return rows.map((r) => ({
      studentId: info.get(String(r.student)) && info.get(String(r.student)).studentId, studentName: info.get(String(r.student)) && info.get(String(r.student)).fullName,
      offering: code(r.offering), course: code(r.course), finalMark: r.finalMark, grade: r.grade, gradePoint: r.gradePoint, passed: r.passed ? 'yes' : 'no', state: r.state,
    }));
  },
};

const gpa = {
  title: 'GPA',
  sources: ['GPARecord'],
  scopes: ['own', 'department', 'faculty', 'system'],
  columns: [
    { key: 'studentId', label: 'Student ID' }, { key: 'studentName', label: 'Student' }, { key: 'scope', label: 'Scope' }, { key: 'semester', label: 'Semester' }, { key: 'credits', label: 'Credits' },
    { key: 'gpa', label: 'GPA' }, { key: 'state', label: 'State' },
  ],
  async run(req, p) {
    const [Gpa] = need('GPARecord');
    const extra = {};
    for (const f of ['semester', 'scope', 'state']) if (p[f]) extra[f] = p[f];
    const scope = req.access.scope === 'own' ? { student: req.access.studentId || null, state: 'published' } : await studentField(req);
    const rows = await Gpa.find(and(scope, extra)).limit(MAX_ROWS).lean();
    const info = await studentInfo([...new Set(rows.map((r) => String(r.student)))]);
    return rows.map((r) => ({
      studentId: info.get(String(r.student)) && info.get(String(r.student)).studentId, studentName: info.get(String(r.student)) && info.get(String(r.student)).fullName,
      scope: r.scope, semester: code(r.semester), credits: r.credits, gpa: r.gpa, state: r.state,
    }));
  },
};

module.exports = {
  available, offeringIds, isWide,
  registry: {
    'specialization-allocations': allocationReport('specialization', 'Specialization allocations'),
    'majoring-allocations': allocationReport('majoring', 'Majoring allocations'),
    attendance, 'ca-marks': caMarks, 'esa-marks': esaMarks, 'semester-results': results, gpa,
  },
};
