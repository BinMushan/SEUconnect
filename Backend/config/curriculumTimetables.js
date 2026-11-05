/**
 * SEUSL Faculty of Technology - Academic Curriculum, Timetable & Semester Registry
 * Maps each Semester (Year 1 Sem 1, Year 1 Sem 2, Year 2 Sem 1, Year 2 Sem 2, Year 3 Sem 1)
 * to its curriculum subjects, weekly lecture/lab timetables, matrix records, and exam schedules.
 */

function normalizeSemester(sem) {
  if (!sem) return 'Year 1 Semester 1';
  const s = String(sem).toLowerCase().trim();
  if (s.includes('1') && !s.includes('sem 2') && !s.includes('semester 2') && !s.includes('year 2') && !s.includes('year 3') && !s.includes('year 4')) {
    if (s.includes('freshers') || s.includes('year 1') || s.includes('sem 1') || s.includes('semester 1') || s === '1') {
      return 'Year 1 Semester 1';
    }
  }
  if (s.includes('year 1 sem 2') || s.includes('year 1 semester 2') || s === 'semester 2' || s === 'sem 2' || s === '2') {
    return 'Year 1 Semester 2';
  }
  if (s.includes('year 2 sem 1') || s.includes('year 2 semester 1') || s === 'semester 3' || s === 'sem 3' || s === '3') {
    return 'Year 2 Semester 1';
  }
  if (s.includes('year 2 sem 2') || s.includes('year 2 semester 2') || s === 'semester 4' || s === 'sem 4' || s === '4') {
    return 'Year 2 Semester 2';
  }
  if (s.includes('year 3 sem 1') || s.includes('year 3 semester 1') || s === 'semester 5' || s === 'sem 5' || s === '5') {
    return 'Year 3 Semester 1';
  }
  if (s.includes('year 3 sem 2') || s.includes('year 3 semester 2') || s === 'semester 6' || s === 'sem 6' || s === '6') {
    return 'Year 3 Semester 2';
  }
  if (s.includes('year 4 sem 1') || s.includes('year 4 semester 1') || s === 'semester 7' || s === 'sem 7' || s === '7') {
    return 'Year 4 Semester 1';
  }
  if (s.includes('year 4 sem 2') || s.includes('year 4 semester 2') || s === 'semester 8' || s === 'sem 8' || s === '8') {
    return 'Year 4 Semester 2';
  }
  return 'Year 1 Semester 1';
}

const CURRICULUM_DATA = {
  // ==========================================
  // YEAR 1 SEMESTER 1 (Freshers / Intake Batch)
  // ==========================================
  'Year 1 Semester 1': {
    semester: 'Year 1 Semester 1',
    semesterLabel: 'Sem 1',
    yearNumber: 1,
    semesterNumber: 1,
    totalCredits: 15,
    defaultSgpa: 3.75,
    defaultCgpa: 3.75,
    progressionData: [
      { semester: 'Sem 1', fullLabel: 'Semester 1 (Current)', sgpa: 3.75, delta: '+0.00', credits: 15, standing: 'First Class Standing', x: 290, y: 55.0, isCurrent: true, isFirstClass: true }
    ],
    subjects: [
      {
        id: 'sub-y1s1-1',
        code: 'ICT 11013',
        rawCode: 'ICT11013',
        title: 'Fundamentals of Information Technology',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. A.R. Mufassir',
        venue: 'Main Auditorium / Lab 01',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s1-2',
        code: 'ICT 11023',
        rawCode: 'ICT11023',
        title: 'Structured Programming in C',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Dr. M.M. Riswan',
        venue: 'Lab 01',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s1-3',
        code: 'ICT 11032',
        rawCode: 'ICT11032',
        title: 'Mathematics for Computing I',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Dr. A.M. Razmy',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s1-4',
        code: 'ICT 11042',
        rawCode: 'ICT11042',
        title: 'Principles of Management',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Ms. S. Risna',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s1-5',
        code: 'ENG 11012',
        rawCode: 'ENG11012',
        title: 'English for Academic Purposes I',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. M.A.M. Sameem',
        venue: 'LH 04',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s1-6',
        code: 'BST 11013',
        rawCode: 'BST11013',
        title: 'Basic Electronics and Circuit Theory',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Eng. T. Pathmanathan',
        venue: 'Lab 03',
        status: 'REGISTERED',
        isGPA: true
      }
    ],
    timetableSlots: [
      { day: 'Monday', time: '8.30 - 10.30', code: 'ICT 11013', title: 'Fundamentals of IT', venue: 'Main Auditorium', lecturer: 'Mr. A.R. Mufassir' },
      { day: 'Monday', time: '10.30 - 12.30', code: 'ICT 11042', title: 'Principles of Management', venue: 'LH 10', lecturer: 'Ms. S. Risna' },
      { day: 'Monday', time: '1.30 - 4.30', code: 'ICT 11023', title: 'Programming Lab', venue: 'Lab 01', lecturer: 'Dr. M.M. Riswan' },
      { day: 'Tuesday', time: '8.30 - 10.30', code: 'ICT 11032', title: 'Mathematics I', venue: 'LH 10', lecturer: 'Dr. A.M. Razmy' },
      { day: 'Tuesday', time: '10.30 - 12.30', code: 'ENG 11012', title: 'English I', venue: 'LH 04', lecturer: 'Mr. M.A.M. Sameem' },
      { day: 'Tuesday', time: '1.30 - 3.30', code: 'BST 11013', title: 'Basic Electronics', venue: 'LH 10', lecturer: 'Eng. T. Pathmanathan' },
      { day: 'Wednesday', time: '8.30 - 11.30', code: 'ICT 11023', title: 'Structured Programming', venue: 'Lab 01', lecturer: 'Dr. M.M. Riswan' },
      { day: 'Wednesday', time: '1.30 - 4.30', code: 'BST 11013', title: 'Electronics Lab', venue: 'Lab 03', lecturer: 'Eng. T. Pathmanathan' },
      { day: 'Thursday', time: '9.30 - 11.30', code: 'ICT 11013', title: 'IT Practical', venue: 'Lab 01', lecturer: 'Mr. A.R. Mufassir' },
      { day: 'Thursday', time: '1.30 - 3.30', code: 'ENG 11012', title: 'English Language Lab', venue: 'LH 04', lecturer: 'Mr. M.A.M. Sameem' },
      { day: 'Friday', time: '8.30 - 11.30', code: 'ICT 11032', title: 'Tutorials & Maths Lab', venue: 'LH 10', lecturer: 'Dr. A.M. Razmy' }
    ],
    matrixColumns: [
      { code: 'ICT 11013', title: 'Fundamentals IT' },
      { code: 'ICT 11023', title: 'Programming (C)' },
      { code: 'ICT 11032', title: 'Maths I' },
      { code: 'ICT 11042', title: 'Management' },
      { code: 'ENG 11012', title: 'English I' },
      { code: 'BST 11013', title: 'Electronics' }
    ],
    matrixDailyRows: [
      { date: '2026/11/02', day: 'Monday', weekLabel: 'Current Week', records: { 'ICT 11013': 'Attend', 'ICT 11042': 'Attend', 'ICT 11023': 'Attend' } },
      { date: '2026/11/03', day: 'Tuesday', weekLabel: 'Current Week', records: { 'ICT 11032': 'Attend', 'ENG 11012': 'Attend', 'BST 11013': 'Attend' } },
      { date: '2026/11/04', day: 'Wednesday', weekLabel: 'Current Week', records: { 'ICT 11023': 'Attend', 'BST 11013': 'Attend' } },
      { date: '2026/11/05', day: 'Thursday', weekLabel: 'Current Week', records: { 'ICT 11013': 'Attend', 'ENG 11012': 'Attend' } },
      { date: '2026/11/06', day: 'Friday', weekLabel: 'Current Week', records: { 'ICT 11032': 'Attend' } }
    ],
    examModules: [
      { code: 'ICT 11013', title: 'Fundamentals of Information Technology', credits: 3, examDate: '2026-11-20', examTime: '09:00 AM - 12:00 PM', venue: 'Main Auditorium', hall: 'Main Aud', seatNo: 'A-12', attendancePct: 92, eligible: true },
      { code: 'ICT 11023', title: 'Structured Programming in C', credits: 3, examDate: '2026-11-23', examTime: '09:00 AM - 12:00 PM', venue: 'Lab 01', hall: 'Lab 01', seatNo: 'L1-08', attendancePct: 88, eligible: true },
      { code: 'ICT 11032', title: 'Mathematics for Computing I', credits: 2, examDate: '2026-11-25', examTime: '01:30 PM - 03:30 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-45', attendancePct: 85, eligible: true },
      { code: 'ICT 11042', title: 'Principles of Management', credits: 2, examDate: '2026-11-27', examTime: '09:00 AM - 11:00 AM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-45', attendancePct: 90, eligible: true },
      { code: 'ENG 11012', title: 'English for Academic Purposes I', credits: 2, examDate: '2026-11-30', examTime: '01:30 PM - 03:30 PM', venue: 'Exam Hall B', hall: 'Hall B', seatNo: 'B-14', attendancePct: 95, eligible: true },
      { code: 'BST 11013', title: 'Basic Electronics and Circuit Theory', credits: 3, examDate: '2026-12-02', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-45', attendancePct: 86, eligible: true }
    ]
  },

  // ==========================================
  // YEAR 1 SEMESTER 2
  // ==========================================
  'Year 1 Semester 2': {
    semester: 'Year 1 Semester 2',
    semesterLabel: 'Sem 2',
    yearNumber: 1,
    semesterNumber: 2,
    totalCredits: 16,
    defaultSgpa: 3.68,
    defaultCgpa: 3.71,
    progressionData: [
      { semester: 'Sem 1', fullLabel: 'Semester 1', sgpa: 3.75, delta: '+0.00', credits: 15, standing: 'First Class Standing', x: 185, y: 55.0, isFirstClass: true },
      { semester: 'Sem 2', fullLabel: 'Semester 2 (Current)', sgpa: 3.68, delta: '-0.07', credits: 16, standing: 'Second Class (Upper)', x: 395, y: 64.0, isCurrent: true, isFirstClass: false }
    ],
    subjects: [
      {
        id: 'sub-y1s2-1',
        code: 'ICT 12013',
        rawCode: 'ICT12013',
        title: 'Object Oriented Programming with Java',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Dr. M.M. Riswan',
        venue: 'Lab 01',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s2-2',
        code: 'ICT 12023',
        rawCode: 'ICT12023',
        title: 'Database Management Systems',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. J. Ahamed Adhil',
        venue: 'Lab 02',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s2-3',
        code: 'ICT 12032',
        rawCode: 'ICT12032',
        title: 'Mathematics for Computing II',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Dr. A.M. Razmy',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s2-4',
        code: 'ICT 12043',
        rawCode: 'ICT12043',
        title: 'Data Structures and Algorithms',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. M.J. Ahamed Sabani',
        venue: 'LH 10 / Lab 01',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s2-5',
        code: 'ICT 12052',
        rawCode: 'ICT12052',
        title: 'Operating Systems & System Architecture',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. S.L. Abdul Haleem',
        venue: 'CIS Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y1s2-6',
        code: 'ENG 12012',
        rawCode: 'ENG12012',
        title: 'English for Academic Purposes II',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. M.A.M. Sameem',
        venue: 'LH 04',
        status: 'REGISTERED',
        isGPA: true
      }
    ],
    timetableSlots: [
      { day: 'Monday', time: '8.30 - 10.30', code: 'ICT 12013', title: 'OOP in Java', venue: 'Lab 01', lecturer: 'Dr. M.M. Riswan' },
      { day: 'Monday', time: '10.30 - 12.30', code: 'ICT 12032', title: 'Mathematics II', venue: 'LH 10', lecturer: 'Dr. A.M. Razmy' },
      { day: 'Tuesday', time: '8.30 - 11.30', code: 'ICT 12023', title: 'Database Systems', venue: 'Lab 02', lecturer: 'Mr. J. Ahamed Adhil' },
      { day: 'Tuesday', time: '1.30 - 3.30', code: 'ENG 12012', title: 'English II', venue: 'LH 04', lecturer: 'Mr. M.A.M. Sameem' },
      { day: 'Wednesday', time: '8.30 - 11.30', code: 'ICT 12043', title: 'DSA Lecture & Lab', venue: 'Lab 01', lecturer: 'Mr. M.J. Ahamed Sabani' },
      { day: 'Wednesday', time: '1.30 - 3.30', code: 'ICT 12052', title: 'Operating Systems', venue: 'CIS Lab', lecturer: 'Mr. S.L. Abdul Haleem' },
      { day: 'Thursday', time: '8.30 - 11.30', code: 'ICT 12013', title: 'Java Practical Lab', venue: 'Lab 01', lecturer: 'Dr. M.M. Riswan' },
      { day: 'Friday', time: '8.30 - 11.30', code: 'ICT 12023', title: 'DBMS SQL Practical', venue: 'Lab 02', lecturer: 'Mr. J. Ahamed Adhil' }
    ],
    matrixColumns: [
      { code: 'ICT 12013', title: 'OOP Java' },
      { code: 'ICT 12023', title: 'DBMS' },
      { code: 'ICT 12032', title: 'Maths II' },
      { code: 'ICT 12043', title: 'DSA' },
      { code: 'ICT 12052', title: 'Operating Systems' },
      { code: 'ENG 12012', title: 'English II' }
    ],
    matrixDailyRows: [
      { date: '2026/11/02', day: 'Monday', weekLabel: 'Current Week', records: { 'ICT 12013': 'Attend', 'ICT 12032': 'Attend' } },
      { date: '2026/11/03', day: 'Tuesday', weekLabel: 'Current Week', records: { 'ICT 12023': 'Attend', 'ENG 12012': 'Attend' } },
      { date: '2026/11/04', day: 'Wednesday', weekLabel: 'Current Week', records: { 'ICT 12043': 'Attend', 'ICT 12052': 'Attend' } },
      { date: '2026/11/05', day: 'Thursday', weekLabel: 'Current Week', records: { 'ICT 12013': 'Attend' } },
      { date: '2026/11/06', day: 'Friday', weekLabel: 'Current Week', records: { 'ICT 12023': 'Attend' } }
    ],
    examModules: [
      { code: 'ICT 12013', title: 'Object Oriented Programming with Java', credits: 3, examDate: '2026-11-20', examTime: '09:00 AM - 12:00 PM', venue: 'Lab 01', hall: 'Lab 01', seatNo: 'L1-20', attendancePct: 89, eligible: true },
      { code: 'ICT 12023', title: 'Database Management Systems', credits: 3, examDate: '2026-11-23', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-22', attendancePct: 91, eligible: true },
      { code: 'ICT 12032', title: 'Mathematics for Computing II', credits: 2, examDate: '2026-11-25', examTime: '01:30 PM - 03:30 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-22', attendancePct: 84, eligible: true },
      { code: 'ICT 12043', title: 'Data Structures and Algorithms', credits: 3, examDate: '2026-11-27', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall B', hall: 'Hall B', seatNo: 'B-09', attendancePct: 93, eligible: true },
      { code: 'ICT 12052', title: 'Operating Systems & System Architecture', credits: 2, examDate: '2026-11-30', examTime: '01:30 PM - 03:30 PM', venue: 'Exam Hall B', hall: 'Hall B', seatNo: 'B-09', attendancePct: 86, eligible: true },
      { code: 'ENG 12012', title: 'English for Academic Purposes II', credits: 2, examDate: '2026-12-02', examTime: '09:00 AM - 11:00 AM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-22', attendancePct: 94, eligible: true }
    ]
  },

  // ==========================================
  // YEAR 2 SEMESTER 1
  // ==========================================
  'Year 2 Semester 1': {
    semester: 'Year 2 Semester 1',
    semesterLabel: 'Sem 3',
    yearNumber: 2,
    semesterNumber: 1,
    totalCredits: 16,
    defaultSgpa: 3.64,
    defaultCgpa: 3.69,
    progressionData: [
      { semester: 'Sem 1', fullLabel: 'Semester 1', sgpa: 3.75, delta: '+0.00', credits: 15, standing: 'First Class Standing', x: 120, y: 55.0, isFirstClass: true },
      { semester: 'Sem 2', fullLabel: 'Semester 2', sgpa: 3.68, delta: '-0.07', credits: 16, standing: 'Second Class (Upper)', x: 260, y: 64.0, isFirstClass: false },
      { semester: 'Sem 3', fullLabel: 'Semester 3 (Current)', sgpa: 3.64, delta: '-0.04', credits: 16, standing: 'Second Class (Upper)', x: 400, y: 67.4, isCurrent: true, isFirstClass: false }
    ],
    subjects: [
      {
        id: 'sub-y2s1-1',
        code: 'ICT 21013',
        rawCode: 'ICT21013',
        title: 'Software Engineering Methodologies',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. J. Ahamed Adhil',
        venue: 'LH 05',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s1-2',
        code: 'ICT 21023',
        rawCode: 'ICT21023',
        title: 'Computer Architecture & Organization',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. S.L. Abdul Haleem',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s1-3',
        code: 'ICT 21033',
        rawCode: 'ICT21033',
        title: 'Advanced Data Structures & Algorithms',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. M.J. Ahamed Sabani',
        venue: 'Lab 01',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s1-4',
        code: 'ICT 21042',
        rawCode: 'ICT21042',
        title: 'Probability & Statistics for Computing',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Dr. A.M. Razmy',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s1-5',
        code: 'ICT 21053',
        rawCode: 'ICT21053',
        title: 'Web Technologies & Frameworks',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Ms. A.F. Masroofa',
        venue: 'CIS Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s1-6',
        code: 'ICT 21062',
        rawCode: 'ICT21062',
        title: 'Professional Ethics & IT Governance',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Ms. A.R.F. Shafana',
        venue: 'LH 04',
        status: 'REGISTERED',
        isGPA: true
      }
    ],
    timetableSlots: [
      { day: 'Monday', time: '8.30 - 10.30', code: 'ICT 21013', title: 'Software Engineering', venue: 'LH 05', lecturer: 'Mr. J. Ahamed Adhil' },
      { day: 'Monday', time: '10.30 - 12.30', code: 'ICT 21042', title: 'Probability & Stats', venue: 'LH 10', lecturer: 'Dr. A.M. Razmy' },
      { day: 'Tuesday', time: '8.30 - 11.30', code: 'ICT 21033', title: 'Advanced DSA Lab', venue: 'Lab 01', lecturer: 'Mr. M.J. Ahamed Sabani' },
      { day: 'Tuesday', time: '1.30 - 4.30', code: 'ICT 21053', title: 'Web Frameworks', venue: 'CIS Lab', lecturer: 'Ms. A.F. Masroofa' },
      { day: 'Wednesday', time: '8.30 - 11.30', code: 'ICT 21023', title: 'Computer Architecture', venue: 'LH 10', lecturer: 'Mr. S.L. Abdul Haleem' },
      { day: 'Wednesday', time: '1.30 - 3.30', code: 'ICT 21062', title: 'Professional Ethics', venue: 'LH 04', lecturer: 'Ms. A.R.F. Shafana' },
      { day: 'Thursday', time: '9.30 - 12.30', code: 'ICT 21053', title: 'Web Tech Lab', venue: 'CIS Lab', lecturer: 'Ms. A.F. Masroofa' },
      { day: 'Friday', time: '8.30 - 11.30', code: 'ICT 21013', title: 'SE Case Studies', venue: 'LH 05', lecturer: 'Mr. J. Ahamed Adhil' }
    ],
    matrixColumns: [
      { code: 'ICT 21013', title: 'Software Eng' },
      { code: 'ICT 21023', title: 'Architecture' },
      { code: 'ICT 21033', title: 'Adv DSA' },
      { code: 'ICT 21042', title: 'Stats' },
      { code: 'ICT 21053', title: 'Web Tech' },
      { code: 'ICT 21062', title: 'IT Ethics' }
    ],
    matrixDailyRows: [
      { date: '2026/11/02', day: 'Monday', weekLabel: 'Current Week', records: { 'ICT 21013': 'Attend', 'ICT 21042': 'Attend' } },
      { date: '2026/11/03', day: 'Tuesday', weekLabel: 'Current Week', records: { 'ICT 21033': 'Attend', 'ICT 21053': 'Attend' } },
      { date: '2026/11/04', day: 'Wednesday', weekLabel: 'Current Week', records: { 'ICT 21023': 'Attend', 'ICT 21062': 'Attend' } },
      { date: '2026/11/05', day: 'Thursday', weekLabel: 'Current Week', records: { 'ICT 21053': 'Attend' } },
      { date: '2026/11/06', day: 'Friday', weekLabel: 'Current Week', records: { 'ICT 21013': 'Attend' } }
    ],
    examModules: [
      { code: 'ICT 21013', title: 'Software Engineering Methodologies', credits: 3, examDate: '2026-11-20', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-33', attendancePct: 90, eligible: true },
      { code: 'ICT 21023', title: 'Computer Architecture & Organization', credits: 3, examDate: '2026-11-23', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-33', attendancePct: 88, eligible: true },
      { code: 'ICT 21033', title: 'Advanced Data Structures & Algorithms', credits: 3, examDate: '2026-11-25', examTime: '09:00 AM - 12:00 PM', venue: 'Lab 01', hall: 'Lab 01', seatNo: 'L1-15', attendancePct: 92, eligible: true },
      { code: 'ICT 21042', title: 'Probability & Statistics for Computing', credits: 2, examDate: '2026-11-27', examTime: '01:30 PM - 03:30 PM', venue: 'Exam Hall B', hall: 'Hall B', seatNo: 'B-21', attendancePct: 85, eligible: true },
      { code: 'ICT 21053', title: 'Web Technologies & Frameworks', credits: 3, examDate: '2026-11-30', examTime: '09:00 AM - 12:00 PM', venue: 'CIS Lab', hall: 'CIS Lab', seatNo: 'C-04', attendancePct: 94, eligible: true },
      { code: 'ICT 21062', title: 'Professional Ethics & IT Governance', credits: 2, examDate: '2026-12-02', examTime: '09:00 AM - 11:00 AM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-33', attendancePct: 96, eligible: true }
    ]
  },

  // ==========================================
  // YEAR 2 SEMESTER 2 (Official Department Timetable)
  // ==========================================
  'Year 2 Semester 2': {
    semester: 'Year 2 Semester 2',
    semesterLabel: 'Sem 4',
    yearNumber: 2,
    semesterNumber: 2,
    totalCredits: 17,
    defaultSgpa: 3.50,
    defaultCgpa: 3.64,
    progressionData: [
      { semester: 'Sem 1', fullLabel: 'Semester 1', sgpa: 3.75, delta: '+0.00', credits: 15, standing: 'First Class Standing', x: 90, y: 55.0, isFirstClass: true },
      { semester: 'Sem 2', fullLabel: 'Semester 2', sgpa: 3.68, delta: '-0.07', credits: 16, standing: 'Second Class (Upper)', x: 210, y: 64.0, isFirstClass: false },
      { semester: 'Sem 3', fullLabel: 'Semester 3', sgpa: 3.64, delta: '-0.04', credits: 16, standing: 'Second Class (Upper)', x: 330, y: 67.4, isFirstClass: false },
      { semester: 'Sem 4', fullLabel: 'Semester 4 (Current)', sgpa: 3.50, delta: '-0.14', credits: 17, standing: 'Second Class (Upper)', x: 450, y: 80.0, isCurrent: true, isFirstClass: false }
    ],
    subjects: [
      {
        id: 'sub-y2s2-1',
        code: 'SWT 22012',
        rawCode: 'SWT22012',
        title: 'Internet Application Development',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. J Ahamed Adhil',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-2',
        code: 'CIS 22012',
        rawCode: 'CIS22012',
        title: 'Distributed and Cloud Computing',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. Janotheepan (VL)',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-3',
        code: 'CIS 22022',
        rawCode: 'CIS22022',
        title: 'Information Assurance and Forensics',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. MJ Ahamed Sabani',
        venue: 'LH 05',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-4',
        code: 'CIS 22032',
        rawCode: 'CIS22032',
        title: 'E-commerce Strategies and Architecture',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Ms. AF Masroofa',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-5',
        code: 'UCT 22011',
        rawCode: 'UCT22011',
        title: 'Microcontroller System Programming',
        credits: 1,
        theoryHours: 15,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Mr. SL Abdul Haleem',
        venue: 'LH 10',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-6',
        code: 'CMS 22012',
        rawCode: 'CMS22012',
        title: 'Leadership & Communication Skills',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Ms. ARF Shafana',
        venue: 'LH 04',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-7',
        code: 'SWT 22022',
        rawCode: 'SWT22022',
        title: 'Practical for Internet Application Development',
        credits: 2,
        theoryHours: 0,
        practicalHours: 60,
        type: 'Core',
        lecturer: 'Mr. J Ahamed Adhil',
        venue: 'CIS Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-8',
        code: 'CIS 22042',
        rawCode: 'CIS22042',
        title: 'Practical for Distributed and Cloud Computing',
        credits: 2,
        theoryHours: 0,
        practicalHours: 60,
        type: 'Core',
        lecturer: 'Mr. Janotheepan (VL)',
        venue: 'CIS Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y2s2-9',
        code: 'UCT 22022',
        rawCode: 'UCT22022',
        title: 'Practical for Microcontroller System Programming',
        credits: 2,
        theoryHours: 0,
        practicalHours: 60,
        type: 'Core',
        lecturer: 'Mr. SL Abdul Haleem',
        venue: 'Cezeri Studio',
        status: 'REGISTERED',
        isGPA: true
      }
    ],
    timetableSlots: [
      { day: 'Monday', time: '10.30 - 12.30', code: 'CIS 22032', title: 'E-commerce', venue: 'LH 10', lecturer: 'Ms. AF Masroofa' },
      { day: 'Monday', time: '1.30 - 4.30', code: 'SWT 22022', title: 'Internet App Lab', venue: 'CIS Lab', lecturer: 'Mr. J Ahamed Adhil' },
      { day: 'Tuesday', time: '8.30 - 11.30', code: 'UCT 22022', title: 'Microcontroller Lab', venue: 'Cezeri Studio', lecturer: 'Mr. SL Abdul Haleem' },
      { day: 'Tuesday', time: '1.30 - 3.30', code: 'CIS 22012', title: 'Distributed Systems', venue: 'LH 10', lecturer: 'Mr. Janotheepan' },
      { day: 'Tuesday', time: '3.30 - 5.30', code: 'CMS 22012', title: 'Comm. Skills', venue: 'LH 04', lecturer: 'Ms. ARF Shafana' },
      { day: 'Wednesday', time: '8.30 - 10.30', code: 'CIS 22022', title: 'Info Assurance', venue: 'LH 05', lecturer: 'Mr. MJ Ahamed Sabani' },
      { day: 'Wednesday', time: '1.30 - 4.30', code: 'CIS 22042', title: 'Cloud Computing Lab', venue: 'CIS Lab', lecturer: 'Mr. Janotheepan' },
      { day: 'Thursday', time: '8.30 - 10.30', code: 'UCT 22011', title: 'Microcontroller (T)', venue: 'LH 10', lecturer: 'Mr. SL Abdul Haleem' },
      { day: 'Thursday', time: '10.30 - 12.30', code: 'SWT 22012', title: 'Internet App Dev', venue: 'LH 10', lecturer: 'Mr. J Ahamed Adhil' },
      { day: 'Friday', time: '8.30 - 11.30', code: 'SWT 22022', title: 'App Dev Lab Grp B', venue: 'CIS Lab', lecturer: 'Mr. J Ahamed Adhil' }
    ],
    matrixColumns: [
      { code: 'UCT 22022', title: 'Microcontroller (P)' },
      { code: 'CIS 22042', title: 'Cloud Computing (P)' },
      { code: 'SWT 22012', title: 'Internet App Dev' },
      { code: 'CIS 22012', title: 'Distributed Systems' },
      { code: 'CIS 22022', title: 'Info Assurance' },
      { code: 'CIS 22032', title: 'E-commerce' },
      { code: 'UCT 22011', title: 'Microcontroller (T)' },
      { code: 'CMS 22012', title: 'Comm. Skills' },
      { code: 'SWT 22022', title: 'Internet App (P)' }
    ],
    matrixDailyRows: [
      { date: '2026/11/02', day: 'Monday', weekLabel: 'Current Week', records: { 'CIS 22032': 'Attend', 'SWT 22022': 'Missed' } },
      { date: '2026/11/03', day: 'Tuesday', weekLabel: 'Current Week', records: { 'UCT 22022': 'Attend', 'CIS 22012': 'Attend', 'CMS 22012': 'Attend' } },
      { date: '2026/11/04', day: 'Wednesday', weekLabel: 'Current Week', records: { 'CIS 22022': 'Attend', 'CIS 22042': 'Attend' } },
      { date: '2026/11/05', day: 'Thursday', weekLabel: 'Current Week', records: { 'UCT 22011': 'Attend', 'SWT 22012': 'Attend' } },
      { date: '2026/11/06', day: 'Friday', weekLabel: 'Current Week', records: { 'UCT 22022': 'Attend', 'CIS 22042': 'Attend', 'SWT 22022': 'Attend' } }
    ],
    examModules: [
      { code: 'SWT 22012', title: 'Internet Application Development', credits: 2, examDate: '2026-11-04', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Exam Hall A', seatNo: 'A-08', attendancePct: 88, eligible: true },
      { code: 'CIS 22012', title: 'Distributed and Cloud Computing', credits: 2, examDate: '2026-11-07', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Exam Hall A', seatNo: 'A-08', attendancePct: 86, eligible: true },
      { code: 'CIS 22022', title: 'Information Assurance and Forensics', credits: 2, examDate: '2026-11-10', examTime: '01:30 PM - 04:30 PM', venue: 'Main Auditorium', hall: 'Main Aud', seatNo: 'M-12', attendancePct: 83, eligible: true },
      { code: 'CIS 22032', title: 'E-commerce Strategies and Architecture', credits: 2, examDate: '2026-11-13', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall B', hall: 'Exam Hall B', seatNo: 'B-15', attendancePct: 91, eligible: true },
      { code: 'UCT 22011', title: 'Microcontroller System Programming', credits: 1, examDate: '2026-11-16', examTime: '01:30 PM - 03:30 PM', venue: 'Lab 03', hall: 'Lab 03', seatNo: 'L3-05', attendancePct: 95, eligible: true },
      { code: 'CMS 22012', title: 'Leadership & Communication Skills', credits: 2, examDate: '2026-11-19', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Exam Hall A', seatNo: 'A-08', attendancePct: 80, eligible: true }
    ]
  },

  // ==========================================
  // YEAR 3 SEMESTER 1
  // ==========================================
  'Year 3 Semester 1': {
    semester: 'Year 3 Semester 1',
    semesterLabel: 'Sem 5',
    yearNumber: 3,
    semesterNumber: 1,
    totalCredits: 18,
    defaultSgpa: 3.50,
    defaultCgpa: 3.61,
    progressionData: [
      { semester: 'Sem 1', fullLabel: 'Semester 1', sgpa: 3.82, delta: '+0.32', credits: 16, standing: 'First Class Standing', x: 80, y: 51.2, isFirstClass: true },
      { semester: 'Sem 2', fullLabel: 'Semester 2', sgpa: 3.65, delta: '-0.17', credits: 18, standing: 'Second Class (Upper)', x: 185, y: 66.5, isFirstClass: false },
      { semester: 'Sem 3', fullLabel: 'Semester 3', sgpa: 3.64, delta: '-0.01', credits: 16, standing: 'Second Class (Upper)', x: 290, y: 67.4, isFirstClass: false },
      { semester: 'Sem 4', fullLabel: 'Semester 4', sgpa: 3.50, delta: '-0.14', credits: 14, standing: 'Second Class (Upper)', x: 395, y: 80.0, isFirstClass: false },
      { semester: 'Sem 5', fullLabel: 'Semester 5 (Current)', sgpa: 3.50, delta: '±0.00', credits: 18, standing: 'Second Class (Upper)', x: 500, y: 80.0, isCurrent: true, isFirstClass: false }
    ],
    subjects: [
      {
        id: 'sub-y3s1-1',
        code: 'ICT 31013',
        rawCode: 'ICT31013',
        title: 'Computer Networks & Security',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. MJ Ahamed Sabani',
        venue: 'NST Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y3s1-2',
        code: 'ICT 31023',
        rawCode: 'ICT31023',
        title: 'Enterprise Architecture & Cloud Systems',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. Janotheepan (VL)',
        venue: 'CIS Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y3s1-3',
        code: 'ICT 31032',
        rawCode: 'ICT31032',
        title: 'Advanced Database Systems',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Mr. J Ahamed Adhil',
        venue: 'Lab 02',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y3s1-4',
        code: 'ICT 31043',
        rawCode: 'ICT31043',
        title: 'Human Computer Interaction (HCI)',
        credits: 3,
        theoryHours: 30,
        practicalHours: 15,
        type: 'Core',
        lecturer: 'Ms. AF Masroofa',
        venue: 'MAL Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y3s1-5',
        code: 'ICT 31053',
        rawCode: 'ICT31053',
        title: 'Mobile Application Development',
        credits: 3,
        theoryHours: 30,
        practicalHours: 30,
        type: 'Core',
        lecturer: 'Ms. AF Masroofa',
        venue: 'MAL Lab',
        status: 'REGISTERED',
        isGPA: true
      },
      {
        id: 'sub-y3s1-6',
        code: 'ICT 31062',
        rawCode: 'ICT31062',
        title: 'Research Methodology & Scientific Writing',
        credits: 2,
        theoryHours: 30,
        practicalHours: 0,
        type: 'Core',
        lecturer: 'Dr. M.M. Riswan',
        venue: 'LH 05',
        status: 'REGISTERED',
        isGPA: true
      }
    ],
    timetableSlots: [
      { day: 'Monday', time: '8.30 - 11.30', code: 'ICT 31013', title: 'Networks & Security Lab', venue: 'NST Lab', lecturer: 'Mr. MJ Ahamed Sabani' },
      { day: 'Monday', time: '1.30 - 3.30', code: 'ICT 31062', title: 'Research Methodology', venue: 'LH 05', lecturer: 'Dr. M.M. Riswan' },
      { day: 'Tuesday', time: '8.30 - 11.30', code: 'ICT 31023', title: 'Enterprise Cloud Systems', venue: 'CIS Lab', lecturer: 'Mr. Janotheepan' },
      { day: 'Tuesday', time: '1.30 - 4.30', code: 'ICT 31053', title: 'Mobile App Lab', venue: 'MAL Lab', lecturer: 'Ms. AF Masroofa' },
      { day: 'Wednesday', time: '8.30 - 11.30', code: 'ICT 31032', title: 'Advanced DB Lab', venue: 'Lab 02', lecturer: 'Mr. J Ahamed Adhil' },
      { day: 'Wednesday', time: '1.30 - 3.30', code: 'ICT 31043', title: 'HCI Lecture', venue: 'MAL Lab', lecturer: 'Ms. AF Masroofa' },
      { day: 'Thursday', time: '8.30 - 11.30', code: 'ICT 31053', title: 'Flutter / Android Dev', venue: 'MAL Lab', lecturer: 'Ms. AF Masroofa' },
      { day: 'Friday', time: '8.30 - 11.30', code: 'ICT 31023', title: 'AWS Cloud Lab', venue: 'CIS Lab', lecturer: 'Mr. Janotheepan' }
    ],
    matrixColumns: [
      { code: 'ICT 31013', title: 'Networks' },
      { code: 'ICT 31023', title: 'Cloud Systems' },
      { code: 'ICT 31032', title: 'Adv Databases' },
      { code: 'ICT 31043', title: 'HCI' },
      { code: 'ICT 31053', title: 'Mobile Dev' },
      { code: 'ICT 31062', title: 'Research Meth' }
    ],
    matrixDailyRows: [
      { date: '2026/11/02', day: 'Monday', weekLabel: 'Current Week', records: { 'ICT 31013': 'Attend', 'ICT 31062': 'Attend' } },
      { date: '2026/11/03', day: 'Tuesday', weekLabel: 'Current Week', records: { 'ICT 31023': 'Attend', 'ICT 31053': 'Attend' } },
      { date: '2026/11/04', day: 'Wednesday', weekLabel: 'Current Week', records: { 'ICT 31032': 'Attend', 'ICT 31043': 'Attend' } },
      { date: '2026/11/05', day: 'Thursday', weekLabel: 'Current Week', records: { 'ICT 31053': 'Attend' } },
      { date: '2026/11/06', day: 'Friday', weekLabel: 'Current Week', records: { 'ICT 31023': 'Attend' } }
    ],
    examModules: [
      { code: 'ICT 31013', title: 'Computer Networks & Security', credits: 3, examDate: '2026-11-20', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-55', attendancePct: 88, eligible: true },
      { code: 'ICT 31023', title: 'Enterprise Architecture & Cloud Systems', credits: 3, examDate: '2026-11-23', examTime: '09:00 AM - 12:00 PM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-55', attendancePct: 91, eligible: true },
      { code: 'ICT 31032', title: 'Advanced Database Systems', credits: 3, examDate: '2026-11-25', examTime: '09:00 AM - 12:00 PM', venue: 'Lab 02', hall: 'Lab 02', seatNo: 'L2-10', attendancePct: 87, eligible: true },
      { code: 'ICT 31043', title: 'Human Computer Interaction (HCI)', credits: 3, examDate: '2026-11-27', examTime: '01:30 PM - 04:30 PM', venue: 'Exam Hall B', hall: 'Hall B', seatNo: 'B-30', attendancePct: 94, eligible: true },
      { code: 'ICT 31053', title: 'Mobile Application Development', credits: 3, examDate: '2026-11-30', examTime: '09:00 AM - 12:00 PM', venue: 'MAL Lab', hall: 'MAL Lab', seatNo: 'M-12', attendancePct: 92, eligible: true },
      { code: 'ICT 31062', title: 'Research Methodology & Scientific Writing', credits: 2, examDate: '2026-12-02', examTime: '09:00 AM - 11:00 AM', venue: 'Exam Hall A', hall: 'Hall A', seatNo: 'A-55', attendancePct: 96, eligible: true }
    ]
  }
};

function getCurriculumBySemester(semesterName) {
  const normalized = normalizeSemester(semesterName);
  return CURRICULUM_DATA[normalized] || CURRICULUM_DATA['Year 1 Semester 1'];
}

module.exports = {
  CURRICULUM_DATA,
  normalizeSemester,
  getCurriculumBySemester
};

