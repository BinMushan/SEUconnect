/**
 * lecturerMockData.js
 * Comprehensive mock data backing the Lecturer Portal for SEUconnect.
 */

export const INITIAL_LECTURER_INFO = {
  fullName: 'Dr. K. Perera',
  avatarInitial: 'KP',
  lecturerId: 'LEC/ICT/024',
  department: 'Department of ICT',
  faculty: 'Faculty of Technology',
  email: 'lecturer@seu.ac.lk',
  loginEmail: 'Lecturer@gmail.com',
  phone: '+94 77 123 4567',
  assignedSubjectsCount: 3,
  designation: 'Senior Lecturer Gr. II & Course Coordinator',
  office: 'Technology Faculty Complex, Block B - Room 204',
  specialization: 'Software Architecture & Cloud Application Systems',
  joinedDate: 'January 2019',
};

export const INITIAL_SUBJECTS = [
  {
    id: 'SWT22022',
    code: 'SWT22022',
    name: 'Software Engineering & Architecture',
    semester: 'Semester 4',
    semesterNumber: 4,
    academicYear: 'Year 2',
    batch: '2021/2022',
    studentsCount: 45,
    schedule: 'Monday 08:30 AM - 10:30 AM',
    classroom: 'ICT Lab 02',
    attendanceRate: 88.5,
    credits: 3,
    status: 'Active',
    caWeight: 40,
    esaWeight: 60,
  },
  {
    id: 'SWT21032',
    code: 'SWT21032',
    name: 'Web Application Development',
    semester: 'Semester 3',
    semesterNumber: 3,
    academicYear: 'Year 2',
    batch: '2022/2023',
    studentsCount: 40,
    schedule: 'Wednesday 10:00 AM - 12:00 PM',
    classroom: 'LT-01 (Lecture Theatre 1)',
    attendanceRate: 82.0,
    credits: 3,
    status: 'Active',
    caWeight: 40,
    esaWeight: 60,
  },
  {
    id: 'SWT21022',
    code: 'SWT21022',
    name: 'Data Structures and Algorithms',
    semester: 'Semester 3',
    semesterNumber: 3,
    academicYear: 'Year 2',
    batch: '2022/2023',
    studentsCount: 35,
    schedule: 'Friday 01:30 PM - 03:30 PM',
    classroom: 'Lab 01 (Computer Systems)',
    attendanceRate: 74.2,
    credits: 3,
    status: 'Active',
    caWeight: 40,
    esaWeight: 60,
  },
];

export const INITIAL_TODAY_CLASSES = [
  {
    id: 'cls-1',
    subjectCode: 'SWT21032',
    subjectName: 'Web Application Development',
    timeslot: '10:00 AM - 12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    location: 'LT-01 (Lecture Theatre 1)',
    enrolledCount: 40,
    sessionType: 'Lecture & Live Demo',
    batch: '2022/2023',
  },
  {
    id: 'cls-2',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    timeslot: '02:00 PM - 04:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    location: 'ICT Lab 02',
    enrolledCount: 45,
    sessionType: 'Hands-on Lab Session',
    batch: '2021/2022',
  },
];

// Unified weekly timetable teaching sessions for logged-in lecturer (Dr. K. Perera - LEC/ICT/024)
export const LECTURER_TIMETABLE_CLASSES = [
  // Monday
  {
    id: 'tt-mon-1',
    dayOfWeek: 1, // 1 = Monday
    dayName: 'Monday',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    timeslot: '08:30 AM - 10:30 AM',
    startTime: '08:30 AM',
    endTime: '10:30 AM',
    startHour: 8,
    startMinute: 30,
    endHour: 10,
    endMinute: 30,
    duration: '2h 00m',
    classType: 'Lecture',
    venue: 'LT-02 (Faculty Auditorium)',
    registeredStudentsCount: 45,
    academicBatch: '2021/2022',
    academicYear: '2025/2026',
    semester: 'Semester 4',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Architectural Patterns & Microservices Decomposition',
    notes: 'Please review Monolith to Microservice transition trade-offs before class.',
  },
  {
    id: 'tt-mon-2',
    dayOfWeek: 1,
    dayName: 'Monday',
    subjectCode: 'SWT21022',
    subjectName: 'Data Structures and Algorithms',
    timeslot: '11:00 AM - 01:00 PM',
    startTime: '11:00 AM',
    endTime: '01:00 PM',
    startHour: 11,
    startMinute: 0,
    endHour: 13,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Lecture',
    venue: 'LT-01 (Lecture Theatre 1)',
    registeredStudentsCount: 35,
    academicBatch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Balanced Trees: AVL and Red-Black Rotations',
    notes: 'Bring graph plotting paper or laptop for tree rotation exercises.',
  },

  // Tuesday (Coincides with INITIAL_TODAY_CLASSES)
  {
    id: 'cls-1',
    dayOfWeek: 2, // 2 = Tuesday
    dayName: 'Tuesday',
    subjectCode: 'SWT21032',
    subjectName: 'Web Application Development',
    timeslot: '10:00 AM - 12:00 PM',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Lecture',
    sessionType: 'Lecture & Live Demo',
    venue: 'LT-01 (Lecture Theatre 1)',
    location: 'LT-01 (Lecture Theatre 1)',
    registeredStudentsCount: 40,
    enrolledCount: 40,
    academicBatch: '2022/2023',
    batch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Full-Stack Architecture & State Management (Redux/Context API)',
    notes: 'Live coding demonstration with Vite + React + Node.js backend.',
  },
  {
    id: 'cls-2',
    dayOfWeek: 2,
    dayName: 'Tuesday',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    timeslot: '02:00 PM - 04:00 PM',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Practical',
    sessionType: 'Hands-on Lab Session',
    venue: 'ICT Lab 02',
    location: 'ICT Lab 02',
    registeredStudentsCount: 45,
    enrolledCount: 45,
    academicBatch: '2021/2022',
    batch: '2021/2022',
    academicYear: '2025/2026',
    semester: 'Semester 4',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Hands-on Microservice Containerization & CI/CD Pipelines',
    notes: 'Ensure Docker Desktop and Minikube are running prior to the session.',
  },

  // Wednesday
  {
    id: 'tt-wed-1',
    dayOfWeek: 3, // 3 = Wednesday
    dayName: 'Wednesday',
    subjectCode: 'SWT21032',
    subjectName: 'Web Application Development',
    timeslot: '09:00 AM - 11:00 AM',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    startHour: 9,
    startMinute: 0,
    endHour: 11,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Practical',
    venue: 'ICT Lab 01',
    registeredStudentsCount: 40,
    academicBatch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'REST API Integration & Async Hook Testing',
    notes: 'Lab Exercise 04 submission deadline at end of session.',
  },
  {
    id: 'tt-wed-2',
    dayOfWeek: 3,
    dayName: 'Wednesday',
    subjectCode: 'SWT21022',
    subjectName: 'Data Structures and Algorithms',
    timeslot: '02:00 PM - 04:00 PM',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Tutorial',
    venue: 'Room 204 (Tutorial Hall)',
    registeredStudentsCount: 35,
    academicBatch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Dynamic Programming vs Greedy Algorithms Case Problems',
    notes: 'Problem set #3 will be solved in pairs.',
  },

  // Thursday
  {
    id: 'tt-thu-1',
    dayOfWeek: 4, // 4 = Thursday
    dayName: 'Thursday',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    timeslot: '10:00 AM - 12:00 PM',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Tutorial',
    venue: 'LT-02 (Faculty Auditorium)',
    registeredStudentsCount: 45,
    academicBatch: '2021/2022',
    academicYear: '2025/2026',
    semester: 'Semester 4',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Software Architecture Evaluation Method (ATAM) Walkthrough',
    notes: 'Preparation for upcoming Mid-term Architecture review.',
  },
  {
    id: 'tt-thu-2',
    dayOfWeek: 4,
    dayName: 'Thursday',
    subjectCode: 'SWT21032',
    subjectName: 'Web Application Development',
    timeslot: '02:00 PM - 04:00 PM',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    startHour: 14,
    startMinute: 0,
    endHour: 16,
    endMinute: 0,
    duration: '2h 00m',
    classType: 'Tutorial',
    venue: 'Room 205 (Tutorial Hall)',
    registeredStudentsCount: 40,
    academicBatch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Web Security Mitigation: JWT, CSRF, and CORS In-Depth',
    notes: 'Interactive security vulnerability analysis session.',
  },

  // Friday
  {
    id: 'tt-fri-1',
    dayOfWeek: 5, // 5 = Friday
    dayName: 'Friday',
    subjectCode: 'SWT21022',
    subjectName: 'Data Structures and Algorithms',
    timeslot: '08:30 AM - 10:30 AM',
    startTime: '08:30 AM',
    endTime: '10:30 AM',
    startHour: 8,
    startMinute: 30,
    endHour: 10,
    endMinute: 30,
    duration: '2h 00m',
    classType: 'Practical',
    venue: 'Lab 01 (Computer Systems)',
    registeredStudentsCount: 35,
    academicBatch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Graph Algorithms Implementation (Dijkstra & Prim)',
    notes: 'Lab evaluations will be recorded for CA 2.',
  },
  {
    id: 'tt-fri-2',
    dayOfWeek: 5,
    dayName: 'Friday',
    subjectCode: 'SWT21022',
    subjectName: 'Data Structures and Algorithms',
    timeslot: '01:30 PM - 03:30 PM',
    startTime: '01:30 PM',
    endTime: '03:30 PM',
    startHour: 13,
    startMinute: 30,
    endHour: 15,
    endMinute: 30,
    duration: '2h 00m',
    classType: 'Practical',
    venue: 'Lab 01 (Computer Systems)',
    registeredStudentsCount: 35,
    academicBatch: '2022/2023',
    academicYear: '2025/2026',
    semester: 'Semester 3',
    degreeProgramme: 'BICT (Hons)',
    lecturerId: 'LEC/ICT/024',
    lecturerName: 'Dr. K. Perera',
    department: 'Department of ICT',
    topic: 'Algorithm Benchmarking & Space-Time Profiling',
    notes: 'Hands-on profiling tools in Linux environment.',
  },
];

export const INITIAL_STATS = {
  totalStudents: 120,
  totalStudentsGrowth: '+8 this semester',
  assignedSubjects: 3,
  assignedSubjectsSub: 'Current Semester',
  todayClasses: 2,
  todayClassesSub: 'Next: 10:00 AM',
  pendingAttendance: 3,
  pendingAttendanceSub: 'Requires attention',
  medicalRequests: 5,
  medicalRequestsSub: 'Pending review',
  pendingCAESA: 2,
  pendingCAESASub: 'Needs completion',
};

// Realistic enrolled student cohort
export const ENROLLED_STUDENTS = [
  { regNo: '22ICT001', name: 'A.B.M. Rifnas', attendanceRate: 92, ca1: 85, ca2: 88, esa: 82, present: true },
  { regNo: '22ICT005', name: 'M.N.F. Nuha', attendanceRate: 88, ca1: 78, ca2: 82, esa: 80, present: true },
  { regNo: '22ICT012', name: 'S. Kaveen', attendanceRate: 76, ca1: 65, ca2: 70, esa: 68, present: false },
  { regNo: '22ICT018', name: 'R. Mohamed Akram', attendanceRate: 84, ca1: 72, ca2: 75, esa: 74, present: true },
  { regNo: '22ICT024', name: 'P. Danushan', attendanceRate: 68, ca1: 52, ca2: 58, esa: 55, present: false },
  { regNo: '22ICT031', name: 'T. Nilaxshan', attendanceRate: 94, ca1: 91, ca2: 95, esa: 92, present: true },
  { regNo: '22ICT041', name: 'A.R. Fathima', attendanceRate: 72, ca1: 60, ca2: 64, esa: 62, present: true },
  { regNo: '22ICT053', name: 'K. Logesh', attendanceRate: 80, ca1: 70, ca2: 74, esa: 71, present: true },
  { regNo: '22ICT062', name: 'H.M. Ashfaq', attendanceRate: 64, ca1: 45, ca2: 50, esa: 48, present: false },
  { regNo: '22ICT075', name: 'V. Keerthana', attendanceRate: 90, ca1: 86, ca2: 90, esa: 88, present: true },
  { regNo: '22ICT085', name: 'M.N.M. Afnan', attendanceRate: 96, ca1: 94, ca2: 96, esa: 95, present: true },
  { regNo: '22ICT091', name: 'Bin Mushan', attendanceRate: 92, ca1: 89, ca2: 92, esa: 90, present: true },
];

// Default Assessments configuration for CA/ESA Module
export const DEFAULT_ASSESSMENTS = [
  {
    id: 'ca1',
    name: 'CA 01',
    label: 'Continuous Assessment 01 (CA 01)',
    type: 'CA',
    max: 100,
    weight: 20,
    isDefault: true,
  },
  {
    id: 'ca2',
    name: 'CA 02',
    label: 'Continuous Assessment 02 (CA 02)',
    type: 'CA',
    max: 100,
    weight: 20,
    isDefault: true,
  },
  {
    id: 'esa',
    name: 'ESA Exam',
    label: 'End Semester Examination (ESA)',
    type: 'ESA',
    max: 100,
    weight: 60,
    isDefault: true,
  },
];

export const STORAGE_KEY_CUSTOM_CAS = 'seu_lecturer_custom_cas_v1';
export const STORAGE_KEY_MARKS = 'seu_lecturer_ca_marks_v1';

export function getStoredCustomCAs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_CAS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed reading custom CAs from localStorage', e);
  }
  return [];
}

export function saveStoredCustomCAs(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_CAS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed saving custom CAs to localStorage', e);
  }
}

export function getStoredMarks() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MARKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed reading marks from localStorage', e);
  }
  return null;
}

export function saveStoredMarks(marks) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MARKS, JSON.stringify(marks));
  } catch (e) {
    console.error('Failed saving marks to localStorage', e);
  }
}

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Mid-Semester CA 02 Assessment Schedule & Submission Guidelines',
    message: 'Please take note that CA 02 Project Demonstrations for SWT22022 will be held during the laboratory session next Monday. Ensure your Git repository links and architectural diagrams are updated before 8:00 AM.',
    targetAudience: 'SWT22022',
    priority: 'High',
    isDraft: false,
    author: 'Dr. K. Perera',
    date: '2026-10-28',
    timestamp: '2 days ago',
  },
  {
    id: 'ann-2',
    title: 'Faculty Guidelines on Medical Submissions for Missed Lab Sessions',
    message: 'Students who missed mandatory lab sessions due to illness must submit their certified medical slips through the SEUconnect portal within 7 days of absence. Offline submissions will no longer be considered by the department.',
    targetAudience: 'All Students',
    priority: 'Normal',
    isDraft: false,
    author: 'Dr. K. Perera',
    date: '2026-10-25',
    timestamp: '5 days ago',
  },
  {
    id: 'ann-3',
    title: 'Draft - Revision Lecture for Data Structures & Algorithms',
    message: 'Revision lecture will cover AVL trees, graph traversal algorithms, and dynamic programming examples. Classroom LT-01 reserved.',
    targetAudience: 'SWT21022',
    priority: 'Normal',
    isDraft: true,
    author: 'Dr. K. Perera',
    date: '2026-10-30',
    timestamp: 'Draft saved today',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    category: 'Medical requests',
    title: '5 Student Medical Submissions Pending Verification',
    message: 'Medical certificates submitted for SWT22022 and SWT21032 lecture absences await your verification before forwarding to the HOD.',
    timestamp: '15 mins ago',
    isRead: false,
    priority: 'High',
    actionRoute: '/medical-verification',
    actionLabel: 'Verify Medicals',
  },
  {
    id: 'notif-2',
    category: 'Missing CA marks',
    title: 'CA 02 Submission Deadline Approaching',
    message: 'Continuous assessment CA 02 marks for SWT21032 (Web Application Development) are due within 48 hours for moderation.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'High',
    actionRoute: '/ca-esa',
    actionParams: { subjectCode: 'SWT21032' },
    actionLabel: 'Enter CA Marks',
  },
  {
    id: 'notif-3',
    category: 'Attendance reminders',
    title: 'Pending Attendance Submission',
    message: 'Attendance record for SWT21022 (Data Structures & Algorithms - Friday Lab) has not been confirmed yet.',
    timestamp: '1 day ago',
    isRead: false,
    priority: 'Normal',
    actionRoute: '/attendance',
    actionParams: { subjectCode: 'SWT21022' },
    actionLabel: 'Record Attendance',
  },
  {
    id: 'notif-4',
    category: 'Student requests',
    title: 'Repeat Examination Verification Request',
    message: 'Student A.R. Fathima (22ICT041) has filed a candidacy recommendation for SWT22022 repeat examination.',
    timestamp: '2 days ago',
    isRead: false,
    priority: 'Normal',
    actionRoute: '/results',
    actionParams: { subjectCode: 'SWT22022' },
    actionLabel: 'Review Request',
  },
  {
    id: 'notif-5',
    category: 'Departmental',
    title: 'Curriculum Moderation Meeting Notice',
    message: 'Department of ICT quarterly academic staff meeting scheduled for Thursday at 02:00 PM in the Faculty Boardroom.',
    timestamp: '3 days ago',
    isRead: true,
    priority: 'Normal',
    actionRoute: '/announcements',
    actionLabel: 'View Notice',
  },
];

export const INITIAL_MEDICAL_SUBMISSIONS = [
  {
    id: 'MED-2026-101',
    regNo: '22ICT085',
    studentName: 'M.N.M. Afnan',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    sessionDate: '2026-10-20',
    sessionType: 'Lecture & Lab 03',
    medicalFacility: 'University Medical Center - SEUSL',
    physicianName: 'Dr. A.H.M. Farook (Chief UMO)',
    mcRefNo: 'UMC-SEUSL-2026-0891',
    diagnosis: 'Acute Gastrointestinal Infection with dehydration requiring 3 days clinical rest',
    leaveFrom: '2026-10-19',
    leaveTo: '2026-10-22',
    submittedAt: '2026-10-21 09:30 AM',
    status: 'Pending Verification',
    isUmoEndorsed: true,
  },
  {
    id: 'MED-2026-102',
    regNo: '22ICT041',
    studentName: 'A.R. Fathima',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    sessionDate: '2026-10-22',
    sessionType: 'Hands-on Architectural Lab',
    medicalFacility: 'District General Hospital, Kalmunai',
    physicianName: 'Dr. S.K. Pathmanathan (Consultant Physician)',
    mcRefNo: 'DGH-KAL-4512-MC',
    diagnosis: 'High Grade Viral Pyrexia with severe cefalea and fatigue',
    leaveFrom: '2026-10-21',
    leaveTo: '2026-10-24',
    submittedAt: '2026-10-22 11:15 AM',
    status: 'Pending Verification',
    isUmoEndorsed: true,
  },
  {
    id: 'MED-2026-103',
    regNo: '22ICT012',
    studentName: 'S. Kaveen',
    subjectCode: 'SWT21032',
    subjectName: 'Web Application Development',
    sessionDate: '2026-10-23',
    sessionType: 'Practical Evaluation Session',
    medicalFacility: 'Base Hospital Sammanthurai',
    physicianName: 'Dr. M.I. Rizwan (Medical Officer)',
    mcRefNo: 'BHS-SAM-2026-3390',
    diagnosis: 'Right Wrist Sprain with supportive crepe bandage immobilization',
    leaveFrom: '2026-10-23',
    leaveTo: '2026-10-26',
    submittedAt: '2026-10-24 08:45 AM',
    status: 'Pending Verification',
    isUmoEndorsed: true,
  },
  {
    id: 'MED-2026-104',
    regNo: '22ICT024',
    studentName: 'P. Danushan',
    subjectCode: 'SWT22022',
    subjectName: 'Software Engineering & Architecture',
    sessionDate: '2026-10-27',
    sessionType: 'Class Design Presentation',
    medicalFacility: 'University Medical Center - SEUSL',
    physicianName: 'Dr. A.H.M. Farook (Chief UMO)',
    mcRefNo: 'UMC-SEUSL-2026-0914',
    diagnosis: 'Acute Migraine Episode with visual aura and nausea',
    leaveFrom: '2026-10-27',
    leaveTo: '2026-10-28',
    submittedAt: '2026-10-28 10:00 AM',
    status: 'Pending Verification',
    isUmoEndorsed: true,
  },
  {
    id: 'MED-2026-105',
    regNo: '22ICT062',
    studentName: 'H.M. Ashfaq',
    subjectCode: 'SWT21032',
    subjectName: 'Web Application Development',
    sessionDate: '2026-10-25',
    sessionType: 'Interactive Coding Demo',
    medicalFacility: 'Ashraff Memorial Hospital, Kalmunai',
    physicianName: 'Dr. T.L. Mansoor (Medical Officer OPD)',
    mcRefNo: 'AMH-KAL-2026-1182',
    diagnosis: 'Upper Respiratory Tract Infection with persistent fever',
    leaveFrom: '2026-10-24',
    leaveTo: '2026-10-27',
    submittedAt: '2026-10-26 02:20 PM',
    status: 'Pending Verification',
    isUmoEndorsed: true,
  },
];

export const calculateSEUSLGrade = (score) => {
  const num = Number(score);
  if (isNaN(num)) return '-';
  if (num >= 85) return { grade: 'A+', gpa: 4.0, remark: 'Distinction' };
  if (num >= 78) return { grade: 'A', gpa: 4.0, remark: 'Excellent' };
  if (num >= 72) return { grade: 'A-', gpa: 3.7, remark: 'Very Good' };
  if (num >= 67) return { grade: 'B+', gpa: 3.3, remark: 'Good' };
  if (num >= 61) return { grade: 'B', gpa: 3.0, remark: 'Satisfactory' };
  if (num >= 56) return { grade: 'B-', gpa: 2.7, remark: 'Pass' };
  if (num >= 51) return { grade: 'C+', gpa: 2.3, remark: 'Pass' };
  if (num >= 47) return { grade: 'C', gpa: 2.0, remark: 'Pass' };
  if (num >= 42) return { grade: 'C-', gpa: 1.7, remark: 'Conditional Pass' };
  if (num >= 37) return { grade: 'D', gpa: 1.0, remark: 'Poor Pass' };
  return { grade: 'E', gpa: 0.0, remark: 'Fail' };
};


// ============================================================================
// STUDENT ENROLLMENT DATA (Subject-wise & Combined Cohort - 120 Total Registrations)
// Section 7.2 of Faculty of Technology Undergraduate Handbook 2023/2024
// ============================================================================
const NAMES_POOL = [
  'A.B.M. Rifnas', 'M.N.F. Nuha', 'S. Kaveen', 'R. Mohamed Akram', 'P. Danushan',
  'T. Nilaxshan', 'A.R. Fathima', 'K. Logesh', 'H.M. Ashfaq', 'V. Keerthana',
  'M.N.M. Afnan', 'M.M. Bin Mushan', 'S. Tharani', 'J. Piratheepan', 'F. Shamila',
  'K. Kamsan', 'M.R.F. Rizna', 'A. Kavithan', 'N. Diluxshan', 'S. Sajeevan',
  'R. Janarthan', 'M.I.F. Ilma', 'T. Thuvaragan', 'M.N. Faslan', 'V. Pavithra',
  'K. Abinayan', 'A.F. Safna', 'S. Mithurshan', 'P. Lavanya', 'M.S.M. Shifan',
  'T. Gobinath', 'R. Priyadharshan', 'M.H.F. Hanoon', 'N. Mayooran', 'S. Sanjeevan',
  'M.A.F. Asma', 'K. Vithushan', 'A.J. Anojan', 'M.R. Mohamed Rishad', 'T. Subajiny',
  'V. Kiruthika', 'S. Sharmilan', 'M.S. Fathima Saara', 'K. Thanushan', 'P. Gowshikan',
  'A.C.F. Sumaiya', 'K. Dineshkumar', 'M.A.M. Sajid', 'R. Ragunath', 'S. Sivatharshini',
  'T. Mathusan', 'F. Haneefa', 'M.Z.M. Zafras', 'K. Niroshan', 'A.R.M. Rasheed',
  'V. Abarna', 'S. Gopinath', 'M.T.F. Tasneem', 'T. Kajan', 'R. Bavithra',
  'M.F.M. Fayaz', 'S. Tharmika', 'K. Partheepan', 'A.K. Fathima Rimza', 'M.J. Mohamed Jaseel',
  'N. Sarujan', 'T. Vithusan', 'M.S.M. Sameer', 'S. Kirushanth', 'R. Kokila',
  'A.L.M. Anas', 'K. Santhosh', 'V. Nishanthini', 'S. Bavatharani', 'M.R.M. Rilwan'
];

export const ENROLLMENT_STUDENTS_LIST = [
  // Subject 1: SWT22022 - Software Engineering & Architecture (45 Students, Batch 2021/2022)
  ...Array.from({ length: 45 }, (_, i) => {
    const regNo = `21ICT${String(i + 1).padStart(3, '0')}`;
    const name = NAMES_POOL[i % NAMES_POOL.length];
    const status = i === 44 ? 'Dropped' : (i === 42 || i === 43) ? 'Pending' : 'Registered';
    return {
      id: `ENR-${regNo}-SWT22022`,
      regNo,
      name,
      batch: '2021/2022',
      degreeProgramme: 'BICT (Hons)',
      academicYear: 'Year 2',
      semester: 'Semester 4',
      subjectCode: 'SWT22022',
      subjectName: 'Software Engineering & Architecture',
      credits: 3,
      status,
      registeredAt: '2026-09-12',
      email: `${regNo.toLowerCase()}@seu.ac.lk`,
    };
  }),

  // Subject 2: SWT21032 - Web Application Development (40 Students, Batch 2022/2023)
  ...Array.from({ length: 40 }, (_, i) => {
    const regNo = `22ICT${String(i + 1).padStart(3, '0')}`;
    const name = NAMES_POOL[(i + 10) % NAMES_POOL.length];
    const status = i === 39 ? 'Dropped' : i === 38 ? 'Pending' : 'Registered';
    return {
      id: `ENR-${regNo}-SWT21032`,
      regNo,
      name,
      batch: '2022/2023',
      degreeProgramme: 'BICT (Hons)',
      academicYear: 'Year 2',
      semester: 'Semester 3',
      subjectCode: 'SWT21032',
      subjectName: 'Web Application Development',
      credits: 3,
      status,
      registeredAt: '2026-09-14',
      email: `${regNo.toLowerCase()}@seu.ac.lk`,
    };
  }),

  // Subject 3: SWT21022 - Data Structures and Algorithms (35 Students, Batch 2022/2023)
  ...Array.from({ length: 35 }, (_, i) => {
    const regNo = `22ICT${String(i + 1).padStart(3, '0')}`;
    const name = NAMES_POOL[(i + 25) % NAMES_POOL.length];
    const status = i === 34 ? 'Dropped' : i === 33 ? 'Pending' : 'Registered';
    return {
      id: `ENR-${regNo}-SWT21022`,
      regNo,
      name,
      batch: '2022/2023',
      degreeProgramme: 'BICT (Hons)',
      academicYear: 'Year 2',
      semester: 'Semester 3',
      subjectCode: 'SWT21022',
      subjectName: 'Data Structures and Algorithms',
      credits: 3,
      status,
      registeredAt: '2026-09-15',
      email: `${regNo.toLowerCase()}@seu.ac.lk`,
    };
  }),
];
