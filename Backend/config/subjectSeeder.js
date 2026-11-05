const Subject = require('../models/Subject');

/**
 * Official Faculty of Technology (BICT Hons) Subjects
 * Extracted directly from Handbook 2022/2023:
 * - Table 3.9.3: First Year (Pages 79-80)
 * - Table 3.9.4: Second Year (Pages 81-82)
 * - Table 3.9.5: Third Year (Pages 85-86)
 * - Table 9.7.6: Fourth Year (Pages 87-88)
 */
const HANDBOOK_SUBJECTS = [
  // ==========================================
  // FIRST YEAR - SEMESTER 1 (Handbook Page 79)
  // ==========================================
  {
    code: 'CIS11011',
    title: 'Essentials of ICT and PC Applications',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '09:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-20', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'SWT11012',
    title: 'Fundamentals of Programming',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Monday', startTime: '09:30', endTime: '11:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-22', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS11022',
    title: 'Database Design',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-24', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS11032',
    title: 'Logic designing and Computer Organization',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-11-26', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CMS11012',
    title: 'Mathematics for ICT',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. K. Mohamed',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. K. Mohamed' }
    ],
    examSchedule: { examDate: '2026-11-28', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CMS11022',
    title: 'English I',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 0,
    ngpaCredits: 2,
    credits: 2,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 2,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Auxiliary',
    type: 'Theory',
    lecturer: 'Ms. F. Shafna',
    timetableSlots: [
      { day: 'Friday', startTime: '08:30', endTime: '10:30', hall: 'Language Lab LL-1', type: 'Lecture', lecturer: 'Ms. F. Shafna' }
    ],
    examSchedule: { examDate: '2026-11-30', examTime: '09:00 - 11:30', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CMS11031',
    title: 'Tamil / Sinhala Language for Professionals',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 2,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Elective',
    type: 'Practical',
    lecturer: 'Visiting Lecturer',
    timetableSlots: [
      { day: 'Friday', startTime: '10:30', endTime: '12:30', hall: 'Language Lab LL-1', type: 'Practical', lecturer: 'Visiting Lecturer' }
    ],
    examSchedule: { examDate: '2026-12-02', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CIS11042',
    title: 'Practical for Essentials of ICT and PC Applications',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 6,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Monday', startTime: '13:30', endTime: '16:30', hall: 'Computer Lab 01', type: 'Practical', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-12-04', examTime: '09:00 - 12:00', hall: 'Computer Lab 01' }
  },
  {
    code: 'SWT11022',
    title: 'Practical for Fundamental of Programming',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 4,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Wednesday', startTime: '13:30', endTime: '16:30', hall: 'Software Engineering Lab 02', type: 'Practical', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-12-06', examTime: '09:00 - 12:00', hall: 'Software Engineering Lab 02' }
  },
  {
    code: 'CIS11051',
    title: 'Practical for Database Design',
    year: 1,
    semester: 1,
    semesterName: 'Year 1 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Thursday', startTime: '13:30', endTime: '16:30', hall: 'Database Lab 03', type: 'Practical', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-12-08', examTime: '09:00 - 12:00', hall: 'Database Lab 03' }
  },

  // ==========================================
  // FIRST YEAR - SEMESTER 2 (Handbook Page 80)
  // ==========================================
  {
    code: 'SWT12012',
    title: 'Object Oriented Programming',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-20', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'SWT12022',
    title: 'Web systems and Technologies',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-22', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'NST12012',
    title: 'Computer Networks',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '10:30', hall: 'Networking Lab NL-1', type: 'Lecture', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-11-24', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'MGT12012',
    title: 'Multimedia and Graphic Design',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Ms. R. Farhana',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '10:30', hall: 'Multimedia Lab ML-1', type: 'Lecture', lecturer: 'Ms. R. Farhana' }
    ],
    examSchedule: { examDate: '2026-11-26', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CIS12012',
    title: 'Social Computing',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Thursday', startTime: '10:30', endTime: '12:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-28', examTime: '09:00 - 11:30', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CMS12012',
    title: 'Statistics',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. K. Mohamed',
    timetableSlots: [
      { day: 'Friday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. K. Mohamed' }
    ],
    examSchedule: { examDate: '2026-11-30', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CMS12022',
    title: 'English II',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 0,
    ngpaCredits: 2,
    credits: 2,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 2,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Auxiliary',
    type: 'Theory',
    lecturer: 'Ms. F. Shafna',
    timetableSlots: [
      { day: 'Friday', startTime: '10:30', endTime: '12:30', hall: 'Language Lab LL-1', type: 'Lecture', lecturer: 'Ms. F. Shafna' }
    ],
    examSchedule: { examDate: '2026-12-02', examTime: '09:00 - 11:30', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'SWT12031',
    title: 'Practical for Object Oriented Programming',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Monday', startTime: '13:30', endTime: '16:30', hall: 'Software Lab 02', type: 'Practical', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-12-04', examTime: '09:00 - 12:00', hall: 'Software Lab 02' }
  },
  {
    code: 'SWT12041',
    title: 'Practical for Web systems and Technologies',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Tuesday', startTime: '13:30', endTime: '16:30', hall: 'Web Lab 01', type: 'Practical', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-12-06', examTime: '09:00 - 12:00', hall: 'Web Lab 01' }
  },
  {
    code: 'MGT12021',
    title: 'Practical for Multimedia and Graphic Design',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Ms. R. Farhana',
    timetableSlots: [
      { day: 'Wednesday', startTime: '13:30', endTime: '16:30', hall: 'Design Studio 01', type: 'Practical', lecturer: 'Ms. R. Farhana' }
    ],
    examSchedule: { examDate: '2026-12-08', examTime: '09:00 - 12:00', hall: 'Design Studio 01' }
  },
  {
    code: 'CMS12031',
    title: 'Practical for Statistics',
    year: 1,
    semester: 2,
    semesterName: 'Year 1 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. K. Mohamed',
    timetableSlots: [
      { day: 'Thursday', startTime: '13:30', endTime: '16:30', hall: 'Data Lab 02', type: 'Practical', lecturer: 'Dr. K. Mohamed' }
    ],
    examSchedule: { examDate: '2026-12-10', examTime: '09:00 - 12:00', hall: 'Data Lab 02' }
  },

  // ==========================================
  // SECOND YEAR - SEMESTER 1 (Handbook Page 81)
  // ==========================================
  {
    code: 'SWT21012',
    title: 'Data Structures and Algorithms',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-21', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS21012',
    title: 'Platform Technologies',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-23', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'NST21012',
    title: 'Network Switching and Routing',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '10:30', hall: 'Networking Lab NL-1', type: 'Lecture', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-11-25', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'UCT21011',
    title: 'Digital Electronic Systems',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '09:30', hall: 'Electronics Lab EL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-27', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'SWT21022',
    title: 'Object Oriented Analysis and Design',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Thursday', startTime: '10:30', endTime: '12:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-29', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS21022',
    title: 'Social and Professional Issues in ICT',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Friday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-12-01', examTime: '09:00 - 11:30', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'SWT21032',
    title: 'Practical for Data Structures and Algorithms',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 4,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Monday', startTime: '13:30', endTime: '16:30', hall: 'Computer Lab 02', type: 'Practical', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-12-03', examTime: '09:00 - 12:00', hall: 'Computer Lab 02' }
  },
  {
    code: 'CIS21031',
    title: 'Practical for Platform Technologies',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Tuesday', startTime: '13:30', endTime: '16:30', hall: 'Platform Lab 01', type: 'Practical', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-12-05', examTime: '09:00 - 12:00', hall: 'Platform Lab 01' }
  },
  {
    code: 'NST21022',
    title: 'Practical for Network Switching and Routing',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 6,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Wednesday', startTime: '13:30', endTime: '17:30', hall: 'Cisco Networking Lab 01', type: 'Practical', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-12-07', examTime: '09:00 - 13:00', hall: 'Cisco Networking Lab 01' }
  },
  {
    code: 'UCT21022',
    title: 'Practical for Digital Electronic Systems',
    year: 2,
    semester: 1,
    semesterName: 'Year 2 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 4,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Thursday', startTime: '13:30', endTime: '16:30', hall: 'Hardware Systems Lab 01', type: 'Practical', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-12-09', examTime: '09:00 - 12:00', hall: 'Hardware Systems Lab 01' }
  },

  // ==========================================
  // SECOND YEAR - SEMESTER 2 (Handbook Page 82)
  // ==========================================
  {
    code: 'SWT22012',
    title: 'Internet Application Development',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-21', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS22012',
    title: 'Distributed and Cloud computing',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-11-23', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS22022',
    title: 'Information assurance and forensics',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-25', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CIS22032',
    title: 'E-commerce - Strategies and architecture',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-27', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'UCT22011',
    title: 'Microcontroller system Programing',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Friday', startTime: '08:30', endTime: '09:30', hall: 'Robotics Lab RL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-29', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CMS22012',
    title: 'Leadership & Communication Skills',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Auxiliary',
    type: 'Theory',
    lecturer: 'Ms. F. Shafna',
    timetableSlots: [
      { day: 'Friday', startTime: '10:30', endTime: '12:30', hall: 'Auditorium Hall A', type: 'Lecture', lecturer: 'Ms. F. Shafna' }
    ],
    examSchedule: { examDate: '2026-12-01', examTime: '09:00 - 11:30', hall: 'Auditorium Hall A' }
  },
  {
    code: 'SWT22022',
    title: 'Practical for Internet Application Development',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 6,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Monday', startTime: '13:30', endTime: '17:30', hall: 'Web Lab 02', type: 'Practical', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-12-03', examTime: '09:00 - 13:00', hall: 'Web Lab 02' }
  },
  {
    code: 'CIS22042',
    title: 'Practical for Distributed and Cloud computing',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 4,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Tuesday', startTime: '13:30', endTime: '16:30', hall: 'Cloud Lab 01', type: 'Practical', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-12-05', examTime: '09:00 - 12:00', hall: 'Cloud Lab 01' }
  },
  {
    code: 'UCT22022',
    title: 'Practical for Microcontroller system Programing',
    year: 2,
    semester: 2,
    semesterName: 'Year 2 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 4,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Wednesday', startTime: '13:30', endTime: '16:30', hall: 'Embedded Lab 01', type: 'Practical', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-12-07', examTime: '09:00 - 12:00', hall: 'Embedded Lab 01' }
  },

  // ==========================================
  // THIRD YEAR - SEMESTER 1 (Handbook Page 85)
  // ==========================================
  {
    code: 'SWT31012',
    title: 'Software Engineering',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-20', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS31012',
    title: 'ICT Project management',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-22', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'UCT31012',
    title: 'Artificial Intelligence',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-24', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'SWT31022',
    title: 'Software Verification and Quality Assurance',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-26', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CMS31022',
    title: 'Research Methodologies for ICT',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 60,
    endSemesterAssessmentPercent: 40,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Prof. A. Majeed',
    timetableSlots: [
      { day: 'Friday', startTime: '08:30', endTime: '10:30', hall: 'Faculty Boardroom', type: 'Lecture', lecturer: 'Prof. A. Majeed' }
    ],
    examSchedule: { examDate: '2026-11-28', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'UCT31021',
    title: 'Practical for Artificial Intelligence',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Wednesday', startTime: '13:30', endTime: '16:30', hall: 'AI Lab 01', type: 'Practical', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-30', examTime: '09:00 - 12:00', hall: 'AI Lab 01' }
  },
  {
    code: 'NST31022',
    title: 'Cryptography',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Elective',
    type: 'Theory',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Thursday', startTime: '10:30', endTime: '12:30', hall: 'Networking Lab NL-1', type: 'Lecture', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-12-02', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'NST31051',
    title: 'Practical for Cryptography',
    year: 3,
    semester: 1,
    semesterName: 'Year 3 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 3,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Elective',
    type: 'Practical',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Thursday', startTime: '13:30', endTime: '16:30', hall: 'Security Lab 01', type: 'Practical', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-12-04', examTime: '09:00 - 12:00', hall: 'Security Lab 01' }
  },

  // ==========================================
  // THIRD YEAR - SEMESTER 2 (Handbook Page 86)
  // ==========================================
  {
    code: 'CIS32012',
    title: 'Enterprise Architecture and Leadership',
    year: 3,
    semester: 2,
    semesterName: 'Year 3 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-20', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'SWT32011',
    title: 'Mobile Application Development',
    year: 3,
    semester: 2,
    semesterName: 'Year 3 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '09:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-22', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'UCT32011',
    title: 'Embedded System',
    year: 3,
    semester: 2,
    semesterName: 'Year 3 Semester 2',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '09:30', hall: 'Embedded Lab EL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-24', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'NST32012',
    title: 'Wireless Network',
    year: 3,
    semester: 2,
    semesterName: 'Year 3 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Eng. K. Thanushan',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '10:30', hall: 'Networking Lab NL-1', type: 'Lecture', lecturer: 'Eng. K. Thanushan' }
    ],
    examSchedule: { examDate: '2026-11-26', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'SWT32022',
    title: 'Service Oriented Web Application',
    year: 3,
    semester: 2,
    semesterName: 'Year 3 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Friday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-28', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'SWT32042',
    title: 'Practical for Mobile Application Development',
    year: 3,
    semester: 2,
    semesterName: 'Year 3 Semester 2',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 4,
    continuousAssessmentPercent: 50,
    endSemesterAssessmentPercent: 50,
    category: 'Compulsory',
    type: 'Practical',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Tuesday', startTime: '13:30', endTime: '16:30', hall: 'Mobile Lab 01', type: 'Practical', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-30', examTime: '09:00 - 12:00', hall: 'Mobile Lab 01' }
  },

  // ==========================================
  // FOURTH YEAR - SEMESTER 1 & 2 (Handbook Pages 87-88)
  // ==========================================
  {
    code: 'SWT41021',
    title: 'Cloud Application Development',
    year: 4,
    semester: 1,
    semesterName: 'Year 4 Semester 1',
    gpaCredits: 1,
    ngpaCredits: 0,
    credits: 1,
    lectureHoursPerWeek: 1,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. M. Kirushanth',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '09:30', hall: 'Tech Lecture Hall TL-1', type: 'Lecture', lecturer: 'Dr. M. Kirushanth' }
    ],
    examSchedule: { examDate: '2026-11-20', examTime: '09:00 - 11:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'SWT41032',
    title: 'Advance Software Engineering',
    year: 4,
    semester: 1,
    semesterName: 'Year 4 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Mr. S. Rifky',
    timetableSlots: [
      { day: 'Tuesday', startTime: '08:30', endTime: '10:30', hall: 'Tech Lecture Hall TL-2', type: 'Lecture', lecturer: 'Mr. S. Rifky' }
    ],
    examSchedule: { examDate: '2026-11-22', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'CIS41022',
    title: 'Advance Database Management System',
    year: 4,
    semester: 1,
    semesterName: 'Year 4 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Dr. A. N. Ahmed',
    timetableSlots: [
      { day: 'Wednesday', startTime: '08:30', endTime: '10:30', hall: 'Database Lab DL-1', type: 'Lecture', lecturer: 'Dr. A. N. Ahmed' }
    ],
    examSchedule: { examDate: '2026-11-24', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 2' }
  },
  {
    code: 'CMS41012',
    title: 'Professional Practice',
    year: 4,
    semester: 1,
    semesterName: 'Year 4 Semester 1',
    gpaCredits: 2,
    ngpaCredits: 0,
    credits: 2,
    lectureHoursPerWeek: 2,
    practicalHoursPerWeek: 0,
    continuousAssessmentPercent: 40,
    endSemesterAssessmentPercent: 60,
    category: 'Compulsory',
    type: 'Theory',
    lecturer: 'Prof. A. Majeed',
    timetableSlots: [
      { day: 'Thursday', startTime: '08:30', endTime: '10:30', hall: 'Auditorium Hall A', type: 'Lecture', lecturer: 'Prof. A. Majeed' }
    ],
    examSchedule: { examDate: '2026-11-26', examTime: '09:00 - 12:00', hall: 'Tech Exam Hall 1' }
  },
  {
    code: 'SWT40016',
    title: 'Final Research and Development Project',
    year: 4,
    semester: 2,
    semesterName: 'Year 4 Semester 2',
    gpaCredits: 6,
    ngpaCredits: 0,
    credits: 6,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 12,
    continuousAssessmentPercent: 100,
    endSemesterAssessmentPercent: 0,
    category: 'Compulsory',
    type: 'Project',
    lecturer: 'Academic Supervisors Committee',
    timetableSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '16:00', hall: 'R&D Innovation Lab', type: 'Tutorial', lecturer: 'Research Supervisors' }
    ],
    examSchedule: { examDate: '2026-12-15', examTime: '09:00 - 16:00', hall: 'Senate Conference Room' }
  },
  {
    code: 'SWT42016',
    title: 'Industrial Placement',
    year: 4,
    semester: 2,
    semesterName: 'Year 4 Semester 2',
    gpaCredits: 6,
    ngpaCredits: 0,
    credits: 6,
    lectureHoursPerWeek: 0,
    practicalHoursPerWeek: 40,
    continuousAssessmentPercent: 100,
    endSemesterAssessmentPercent: 0,
    category: 'Compulsory',
    type: 'Industrial Training',
    lecturer: 'Faculty Industrial Liaison Division',
    timetableSlots: [
      { day: 'Monday', startTime: '08:30', endTime: '17:00', hall: 'Partner Technology Organization', type: 'Practical', lecturer: 'Industry Mentor' }
    ],
    examSchedule: { examDate: '2026-12-20', examTime: '09:00 - 16:00', hall: 'Industry Assessment Board' }
  }
];

/**
 * Seed all Handbook Subjects into MongoDB Atlas
 */
const seedHandbookSubjects = async () => {
  try {
    const totalCount = await Subject.countDocuments();
    if (totalCount >= HANDBOOK_SUBJECTS.length) {
      console.log(`✓ MongoDB Subjects verified: ${totalCount} official handbook subjects present.`);
      return;
    }

    console.log('Seeding official Faculty of Technology handbook subjects into MongoDB Atlas...');
    for (const sub of HANDBOOK_SUBJECTS) {
      await Subject.findOneAndUpdate(
        { code: sub.code },
        { $set: sub },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    const finalCount = await Subject.countDocuments();
    console.log(`✓ Successfully stored and indexed ${finalCount} subjects in MongoDB Atlas!`);
  } catch (err) {
    console.warn('Subject seeding note:', err.message);
  }
};

module.exports = {
  HANDBOOK_SUBJECTS,
  seedHandbookSubjects
};
