// Realistic Institutional Data for Faculty of Technology, South Eastern University of Sri Lanka (SEUSL)
// Office of the Dean: Prof. Rifai Kariapper (Dean of the Faculty of Technology since 2025)

export const DEAN_INFO = {
  name: 'Prof. Rifai Kariapper',
  title: 'Dean, Faculty of Technology',
  faculty: 'Faculty of Technology',
  university: 'South Eastern University of Sri Lanka (SEUSL)',
  campus: 'Oluvil Main Campus',
  email: 'dean@seu.ac.lk',
  personalEmail: 'rifaikariapper@gmail.com',
  phone: '+94 67 2255401 / Ext. 101',
  office: "Dean's Executive Suite, Technology Complex Level 3, Oluvil",
  qualifications: 'M.Sc. (Eng), B.Sc. Eng. Hons (First Class), C.Eng., FIESL, FBCS',
  bio: 'Prof. Rifai Kariapper has served as Dean of the Faculty of Technology since 2025. Under his leadership, the Faculty supports two vibrant departments: Department of Biosystems Technology (BST) and Department of Information and Communication Technology (ICT), securing national SLQF Level 10 accreditation for both degree programs, and establishing advanced research labs in AI, IoT, Agricultural Biotechnology, and Food Systems.',
  statutoryAuthorities: [
    'Chairman, Faculty Board of Technology',
    'Member of Senate, South Eastern University of Sri Lanka',
    'Member of Council, SEUSL (Academic Executive)',
    'Chairman, Faculty Examination Board & Quality Assurance Cell',
    'Chairman, Faculty Higher Degrees Committee',
  ],
};

export const FACULTY_BATCH_BREAKDOWN = [
  { batch: '2025/2024', year: '1st Year', ict: 76, bst: 36, facultyTotal: 112 },
  { batch: '2024/2023', year: '2nd Year', ict: 70, bst: 34, facultyTotal: 104 },
  { batch: '2023/2022', year: '3rd Year', ict: 66, bst: 32, facultyTotal: 98 },
  { batch: '2022/2021', year: '4th Year', ict: 64, bst: 31, facultyTotal: 95 },
  { batch: '2021/2020', year: '5th Year', ict: 61, bst: 30, facultyTotal: 91 },
];

export const getCalculatedBatchTotals = () => {
  const ictTotal = FACULTY_BATCH_BREAKDOWN.reduce((acc, b) => acc + b.ict, 0);
  const bstTotal = FACULTY_BATCH_BREAKDOWN.reduce((acc, b) => acc + b.bst, 0);
  const facultyTotal = ictTotal + bstTotal;
  return { ict: ictTotal, bst: bstTotal, facultyTotal };
};

const BATCH_TOTALS = getCalculatedBatchTotals();

export const FACULTY_STATS = {
  totalUndergraduates: BATCH_TOTALS.facultyTotal, // 500 (Calculated from batches)
  departmentsCount: 2,
  fullTimeAcademicStaff: 34,
  professorsAndSeniorLecturers: 18,
  specializedLaboratories: 9,
  activeDegreePrograms: 2,
  employmentRate6Months: '94.2%',
  onTimeGraduationRate: '96.8%',
};

export const DEPARTMENTS_DATA = [
  {
    code: 'ICT',
    name: 'Department of Information and Communication Technology',
    head: 'M.J Ahamed Sabani',
    headDesignation: 'Senior Lecturer Gr. I & Head of Department',
    undergraduatesCount: BATCH_TOTALS.ict, // 337 (Calculated from batches)
    academicStaffCount: 18,
    degreeProgram: 'Bachelor of Information and Communication Technology Honours – BICT (Hons)',
    specializations: ['Software Systems Development', 'Network & Cloud Security', 'Data Science & AI'],
    labsCount: 4,
    status: 'High Performance',
  },
  {
    code: 'BST',
    name: 'Department of Biosystems Technology',
    head: 'Dr. M.G. Mohamed Thariq',
    headDesignation: 'Senior Lecturer Gr. I & Head of Department',
    undergraduatesCount: BATCH_TOTALS.bst, // 163 (Calculated from batches)
    academicStaffCount: 16,
    degreeProgram: 'Bachelor of Biosystems Technology Honours – BBST (Hons)',
    specializations: ['Food Production & Processing', 'Agricultural Biotechnology', 'Bio-energy Systems'],
    labsCount: 5,
    status: 'High Performance',
  },
];

export const ACADEMIC_CALENDAR_2025_2026 = [
  {
    id: 'CAL-01',
    eventTitle: 'Commencement of Academic Year & Semester 1 Lectures',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    departmentScope: 'All Departments (ICT, BST)',
    category: 'Academic Milestone',
    status: 'Completed',
    description: 'Formal commencement of lectures for 1st, 2nd, 3rd, and 4th year undergraduates.',
  },
  {
    id: 'CAL-02',
    eventTitle: 'Add / Drop Period for Elective Courses & Registration Cut-off',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    departmentScope: 'All Departments',
    category: 'Registration',
    status: 'Completed',
    description: 'Final deadline for students to register course modules and adjust elective choices via SEUConnect.',
  },
  {
    id: 'CAL-03',
    eventTitle: 'Mid-Semester Written Evaluations & Continuous Assessments',
    startDate: '2026-10-12',
    endDate: '2026-10-23',
    departmentScope: 'Faculty-wide',
    category: 'Assessment',
    status: 'Completed',
    description: 'Mid-semester exams and primary continuous assessment tests across both departments (ICT & BST).',
  },
  {
    id: 'CAL-04',
    eventTitle: 'End-Semester Study Leave & Practical Examination Clearances',
    startDate: '2026-11-20',
    endDate: '2026-11-30',
    departmentScope: 'All Departments (ICT & BST)',
    category: 'Examination',
    status: 'Upcoming',
    description: 'Study leave window and Dean sanction for examination halls and admission tickets.',
  },
  {
    id: 'CAL-05',
    eventTitle: 'End-Semester Theory Examinations (Semester 05)',
    startDate: '2026-12-05',
    endDate: '2026-12-22',
    departmentScope: 'Faculty-wide (ICT & BST)',
    category: 'Examination',
    status: 'Upcoming',
    description: 'Main end of semester written examinations supervised by Faculty Examination Branch.',
  },
];

export const FACULTY_BOARD_MEETINGS = [
  {
    meetingNumber: '112th Faculty Board of Technology',
    date: '2026-11-06',
    time: '10:00 AM - 01:00 PM',
    venue: "Board Room, Office of the Dean (Level 3)",
    chair: 'Prof. Rifai Kariapper (Dean)',
    status: 'Notice Dispatched / Agenda Circulated',
    attendeesCount: 22,
    agenda: [
      'Confirmation of minutes of the 111th Faculty Board Meeting',
      'Matters arising from minutes: Student Attendance & Medical Excuses',
      'Endorsement of Continuous Assessment (CA) Moderation Marks for Semester 5',
      'Review of 2021/2020 Final Degree Examination Results for Senate Recommendation',
      'Industrial Internship progress report (Virtusa, IFS, Dialog, Hayleys Agriculture)',
      'Any other business with the permission of the Chair',
    ],
    keyResolutions: [
      'To ratify repeat examination schedules under amended credit scheme.',
      'To formally endorse all vetted medical concessions forwarded with HOD signatures.',
      'To approve the revised curriculum elective credits for BICT and BBST specializations.',
    ],
  },
  {
    meetingNumber: '111th Faculty Board of Technology',
    date: '2026-10-02',
    time: '09:30 AM - 12:45 PM',
    venue: "Board Room, Office of the Dean",
    chair: 'Prof. Rifai Kariapper (Dean)',
    status: 'Minutes Confirmed & Signed',
    attendeesCount: 22,
    agenda: [
      'Semester 1 academic workload allocations across ICT and BST departments',
      'Approval of Visiting Lecturer appointments from Virtusa, IFS, and Hayleys Agriculture',
      'Capital equipment budget allocation for Biotechnology & Software Innovation Labs',
    ],
    keyResolutions: [
      'Approved visiting lecturer appointments for specialized elective courses.',
      'Sanctioned capital budget for AI workstation and molecular biology lab equipment.',
      'Endorsed student disciplinary committee recommendations on examination conduct.',
    ],
  },
];

export const EXAM_BOARD_CLEARANCES = [
  {
    id: 'CLR-2026-088',
    regNo: '2020/ICT/012',
    name: 'S. Fathima Sajana',
    department: 'Department of ICT',
    degree: 'BICT (Hons)',
    cgpa: 3.75,
    classAwarded: 'First Class Honours',
    status: 'Cleared for Senate Award',
    deanSignDate: '2026-10-28',
    remarks: 'All 120 credits completed with zero repeat deficiencies. Industrial internship graded A+.',
  },
  {
    id: 'CLR-2026-089',
    regNo: '2020/BST/034',
    name: 'A.R. Mohamed Aslam',
    department: 'Department of BST',
    degree: 'BBST (Hons)',
    cgpa: 3.52,
    classAwarded: 'Second Class (Upper Division)',
    status: 'Cleared for Senate Award',
    deanSignDate: '2026-10-28',
    remarks: 'Food Science thesis verified. Research publication published in SEUSL AgTech Journal.',
  },
  {
    id: 'CLR-2026-091',
    regNo: '2019/ICT/092',
    name: 'M.H. Farook Naleer',
    department: 'Department of ICT',
    degree: 'BICT (Hons)',
    cgpa: 2.84,
    classAwarded: 'General Pass',
    status: 'Special Senate Concession Required',
    deanSignDate: 'Pending Dean Review',
    remarks: 'Repeat exam cleared in 5th attempt. Requires Dean recommendation for Senate waiver under Regulation 9.2.',
  },
  {
    id: 'CLR-2026-092',
    regNo: '2020/BST/019',
    name: 'K. Rameez Khan',
    department: 'Department of BST',
    degree: 'BBST (Hons)',
    cgpa: 3.61,
    classAwarded: 'Second Class (Upper Division)',
    status: 'Cleared for Senate Award',
    deanSignDate: '2026-10-29',
    remarks: 'Biotechnology capstone project cleared by external examiner Dr. T. Jayawardena.',
  },
];

export const SPECIAL_CONCESSIONS_DATA = [
  {
    id: 'CNC-2026-012',
    regNo: '2021/ICT/019',
    studentName: 'A.H. Mohamed Bilal',
    department: 'ICT',
    concessionType: 'Medical Attendance Shortfall Waiver (≥ 70%)',
    justification: 'Hospitalized for dengue fever for 14 days during critical lecture period. Government hospital certificate authenticated by SEUSL Medical Center.',
    hodEndorsement: 'Endorsed by M.J Ahamed Sabani (HOD ICT)',
    status: 'Approved by Dean',
    actionDate: '2026-10-26',
    formalMinute: 'Approved under By-Law Section 4.2. Permit student to sit ESA as 1st attempt.',
  },
  {
    id: 'CNC-2026-014',
    regNo: '2021/BST/078',
    studentName: 'F. Shahana',
    department: 'BST',
    concessionType: 'Maternity Leave & Academic Progression Suspension',
    justification: 'Requesting academic year deferment for 1 year with student record retention without forfeiture of maximum duration limit.',
    hodEndorsement: 'Endorsed by Dr. M.G. Mohamed Thariq (HOD BST)',
    status: 'Awaiting Dean Signature',
    actionDate: '2026-10-29',
    formalMinute: 'Pending Dean executive sign-off for Faculty Board clearance.',
  },
];

export const INTER_DEPARTMENTAL_DATA = [
  {
    initiativeTitle: 'Faculty Common Foundation Modules (Year 1)',
    participatingDepts: ['Department of ICT', 'Department of BST'],
    coordinator: 'M.J Ahamed Sabani (ICT) & Dr. M.G. Mohamed Thariq (BST)',
    totalStudentsBenefiting: BATCH_TOTALS.facultyTotal,
    status: 'Operational',
    modules: ['FT 1101 - Mathematics for Technology', 'FT 1102 - Applied Sciences for Technology', 'FT 1103 - Computing Fundamentals'],
    notes: 'Resource sharing agreement approved by Dean Prof. Rifai Kariapper. Computing laboratories shared with BST undergraduates.',
  },
  {
    initiativeTitle: 'Central Technology Incubation & Prototyping Hub',
    participatingDepts: ['Department of ICT', 'Department of BST'],
    coordinator: 'Prof. Rifai Kariapper (Dean & Director)',
    totalStudentsBenefiting: 240,
    status: 'Expansion Phase (LKR 8.2M Grant)',
    modules: ['Cross-disciplinary Capstone Innovations', 'Student Patent Filings', 'Agri-Tech & Smart Systems Incubator'],
    notes: 'Joint faculty space funded under national university innovation initiatives.',
  },
  {
    initiativeTitle: 'Joint Industrial Training & Career Fair 2026',
    participatingDepts: ['ICT & BST Industry Liaison Units'],
    coordinator: 'M.J Ahamed Sabani & Dr. M.G. Mohamed Thariq',
    totalStudentsBenefiting: 320,
    status: 'Scheduled for December 2026',
    modules: ['FT 4199 - Industrial Internship (6 Months)'],
    notes: 'Over 40 corporate partners confirmed (Virtusa, WSO2, Brandix, MAS, Ceylon Tobacco, Hayleys Agriculture).',
  },
];

export const FACULTY_KPIS = {
  academicYear: '2025/2026',
  intakeCapacity: 350,
  currentEnrollment: BATCH_TOTALS.facultyTotal,
  studentTeacherRatio: '23:1',
  femaleStudentRatio: '46.2%',
  gpaDistribution: [
    { label: 'First Class (GPA ≥ 3.70)', count: 42, pct: '13.1%' },
    { label: 'Second Upper (3.30 - 3.69)', count: 118, pct: '36.8%' },
    { label: 'Second Lower (3.00 - 3.29)', count: 104, pct: '32.5%' },
    { label: 'General Pass (2.00 - 2.99)', count: 48, pct: '15.0%' },
    { label: 'Academic Warning (< 2.00)', count: 8, pct: '2.5%' },
  ],
  departmentBreakdown: [
    { dept: 'Department of ICT', students: BATCH_TOTALS.ict, staff: 18, avgGPA: 3.38, passRate: '95.4%' },
    { dept: 'Department of BST', students: BATCH_TOTALS.bst, staff: 16, avgGPA: 3.42, passRate: '94.8%' },
  ],
};

export const OFFICIAL_SANCTIONS_SEALS = [
  {
    sealId: 'SEAL-DEAN-2026-042',
    date: '2026-10-28',
    decreeTitle: 'Executive Sanction of 2021/2020 Final Degree Completion Ledger',
    authority: 'Dean, Faculty of Technology under Statute 14 of SEUSL Act',
    verificationHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    status: 'Gazetted & Sealed',
    certifiedBy: 'Prof. Rifai Kariapper',
  },
  {
    sealId: 'SEAL-DEAN-2026-041',
    date: '2026-10-20',
    decreeTitle: 'Establishment of the Multidisciplinary AI & Bio-informatics Cluster',
    authority: 'Faculty Board Executive Resolution 111.4',
    verificationHash: 'SHA256:b2e35a782e4e16d4187e1f4094a974b6f7902d2de5bb0f48866e40d04996d91f',
    status: 'Gazetted & Sealed',
    certifiedBy: 'Prof. Rifai Kariapper',
  },
  {
    sealId: 'SEAL-DEAN-2026-040',
    date: '2026-10-14',
    decreeTitle: 'Faculty Academic Calendar & Examination Schedule Ratification',
    authority: 'Senate Sub-Committee for Academic Governance',
    verificationHash: 'SHA256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    status: 'Gazetted & Sealed',
    certifiedBy: 'Prof. Rifai Kariapper',
  },
];
