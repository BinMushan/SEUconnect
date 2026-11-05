/**
 * Demo academic data for development databases: links the demo accounts to Staff / Student records and
 * creates one academic year with a running semester, two batches, example assessment configurations,
 * a few courses, offerings and lecturer assignments so the frontend has something real to display.
 * Idempotent; never runs unless demo seeding is enabled (see seedData.js).
 */
const User = require('../models/User');
const Student = require('../models/Student');
const logger = require('./logger');
const { Department, DegreeProgramme, AcademicBatch, AcademicYear, Semester } = require('../modules/organization/model');
const { Staff, StaffDepartmentAssignment } = require('../modules/staff/model');
const { Course, AssessmentConfiguration, CourseOffering, CourseStaffAssignment } = require('../modules/courses/model');

const day = 86400000;
const at = (offset) => new Date(Date.now() + offset * day);

const STAFF_DEMO = {
  'lecturer@gmail.com': { responsibilities: ['lecturer', 'course_coordinator'], dept: 'DICT' },
  'lecturer2@gmail.com': { responsibilities: ['lecturer'], dept: 'DICT' },
  'hod@gmail.com': { responsibilities: ['hod', 'lecturer'], dept: 'DICT' },
  'deptma@gmail.com': { responsibilities: [], dept: 'DICT' },
  'lecturer.bst@gmail.com': { responsibilities: ['lecturer', 'course_coordinator'], dept: 'DBST' },
  'hod.bst@gmail.com': { responsibilities: ['hod', 'lecturer'], dept: 'DBST' },
  'deptma.bst@gmail.com': { responsibilities: [], dept: 'DBST' },
};

const STUDENT_DEMO = {
  'student@gmail.com': { studentId: '2022/ICT/085', dept: 'DICT', programme: 'BICT', year: 3 },
  'student.bst@gmail.com': { studentId: '2022/BST/012', dept: 'DBST', programme: 'BBST', year: 3 },
};

const seedDemoAcademicData = async () => {
  const depts = Object.fromEntries((await Department.find({})).map((d) => [d.code, d]));
  const progs = Object.fromEntries((await DegreeProgramme.find({})).map((p) => [p.code, p]));
  if (!depts.DICT || !progs.BICT) return;

  // Staff records for the demo staff accounts
  const staffByEmail = {};
  for (const [email, cfg] of Object.entries(STAFF_DEMO)) {
    const user = await User.findOne({ email });
    if (!user) continue;
    let staff = await Staff.findOne({ email });
    if (!staff) {
      staff = await Staff.create({
        user: user._id, staffId: user.staffId || `STAFF-${email.split('@')[0].toUpperCase()}`, fullName: user.name, email, department: depts[cfg.dept]._id,
        designation: user.designation || '', responsibilities: cfg.responsibilities.map((type) => ({ type, department: depts[cfg.dept]._id, active: true })),
      });
      await StaffDepartmentAssignment.create({ staff: staff._id, department: staff.department });
    }
    staffByEmail[email] = staff;
  }

  // Academic calendar
  const year = await AcademicYear.findOneAndUpdate({ label: '2025/2026' }, { $setOnInsert: { label: '2025/2026', startDate: at(-120), endDate: at(240), status: 'current' } }, { upsert: true, returnDocument: 'after' });
  const sem1 = await Semester.findOneAndUpdate(
    { academicYear: year._id, number: 1 },
    { $setOnInsert: { academicYear: year._id, number: 1, name: 'Semester 1', startDate: at(-90), endDate: at(40), registrationOpens: at(-100), registrationCloses: at(-80), addDropOpens: at(-80), addDropCloses: at(-65), status: 'running' } },
    { upsert: true, returnDocument: 'after' }
  );
  await Semester.updateOne({ academicYear: year._id, number: 2 }, { $setOnInsert: { academicYear: year._id, number: 2, name: 'Semester 2', startDate: at(60), endDate: at(200), registrationOpens: at(30), registrationCloses: at(50), addDropOpens: at(50), addDropCloses: at(65), status: 'draft' } }, { upsert: true });

  const batches = {};
  for (const code of ['BICT', 'BBST']) {
    batches[code] = await AcademicBatch.findOneAndUpdate({ programme: progs[code]._id, intakeYear: 2022 }, { $setOnInsert: { programme: progs[code]._id, intakeYear: 2022, label: '2022 intake', currentAcademicYear: 3 } }, { upsert: true, returnDocument: 'after' });
  }

  // Demo students linked to their login accounts
  for (const [email, cfg] of Object.entries(STUDENT_DEMO)) {
    const user = await User.findOne({ email });
    if (!user || (await Student.exists({ email }))) continue;
    await Student.create({
      user: user._id, studentId: cfg.studentId, registrationNo: cfg.studentId, indexNo: cfg.studentId.replace(/[^A-Za-z0-9]/g, ''), fullName: user.name, email,
      departmentRef: depts[cfg.dept]._id, programmeRef: progs[cfg.programme]._id, batchRef: batches[cfg.programme]._id, admissionYear: 2022, currentYear: cfg.year, currentSemesterNumber: 1,
      currentSemester: `Year ${cfg.year} Semester 1`, status: 'Active',
    });
  }

  // Example assessment structures (examples only - real weights come from the Faculty Handbook)
  const cfgT = await AssessmentConfiguration.findOneAndUpdate({ name: 'Example theory (CA 40 / ESA 60)' }, { $setOnInsert: { name: 'Example theory (CA 40 / ESA 60)', caWeight: 40, esaWeight: 60, minCaPercent: 40, minEsaPercent: 35 } }, { upsert: true, returnDocument: 'after' });
  const cfgP = await AssessmentConfiguration.findOneAndUpdate({ name: 'Example practical (CA 50 / ESA 50)' }, { $setOnInsert: { name: 'Example practical (CA 50 / ESA 50)', caWeight: 50, esaWeight: 50, minCaPercent: 40, minEsaPercent: 35 } }, { upsert: true, returnDocument: 'after' });

  const courses = [
    { code: 'ICT31013', title: 'Software Engineering', credits: 3, type: 'A', dept: 'DICT', programme: 'BICT', lecturer: 'lecturer@gmail.com' },
    { code: 'ICT31023', title: 'Web Application Development', credits: 3, type: 'B', dept: 'DICT', programme: 'BICT', lecturer: 'lecturer@gmail.com' },
    { code: 'ICT31033', title: 'Computer Networks', credits: 3, type: 'A', dept: 'DICT', programme: 'BICT', lecturer: 'lecturer2@gmail.com' },
    { code: 'BST31013', title: 'Plant Biotechnology', credits: 3, type: 'A', dept: 'DBST', programme: 'BBST', lecturer: 'lecturer.bst@gmail.com' },
    { code: 'BST31023', title: 'Food Processing Technology', credits: 3, type: 'B', dept: 'DBST', programme: 'BBST', lecturer: 'lecturer.bst@gmail.com' },
  ];
  for (const c of courses) {
    const course = await Course.findOneAndUpdate(
      { code: c.code },
      { $setOnInsert: { code: c.code, title: c.title, credits: c.credits, type: c.type, department: depts[c.dept]._id, programme: progs[c.programme]._id, defaultYear: 3, defaultSemester: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const components = c.type === 'B'
      ? [{ type: 'theory', assessmentConfiguration: cfgT._id, weightInCourse: 70 }, { type: 'practical', assessmentConfiguration: cfgP._id, weightInCourse: 30 }]
      : [{ type: 'theory', assessmentConfiguration: cfgT._id, weightInCourse: 100 }];
    const offering = await CourseOffering.findOneAndUpdate(
      { course: course._id, semester: sem1._id, batch: batches[c.programme]._id },
      { $setOnInsert: { course: course._id, semester: sem1._id, batch: batches[c.programme]._id, status: 'open', components } },
      { upsert: true, returnDocument: 'after' }
    );
    const lecturer = staffByEmail[c.lecturer];
    if (lecturer && !(await CourseStaffAssignment.exists({ offering: offering._id, componentType: 'theory', role: 'lecturer', active: true }))) {
      await CourseStaffAssignment.create({ offering: offering._id, componentType: 'theory', staff: lecturer._id, role: 'lecturer', note: 'Demo assignment' });
    }
  }
  logger.info('Demo academic data ready (staff, students, calendar, courses, offerings).');
};

module.exports = { seedDemoAcademicData };
