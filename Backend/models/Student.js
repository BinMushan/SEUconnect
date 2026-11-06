const mongoose = require('mongoose');

// Schema for Course Registration in a semester
const EnrolledCourseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  credits: { type: Number, required: true },
  type: { type: String, enum: ['Core', 'Elective', 'Optional'], default: 'Core' },
  status: { type: String, enum: ['Registered', 'Pending', 'Dropped'], default: 'Registered' }
}, { _id: false });

// Schema for Subject Attendance record
const SubjectAttendanceSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  percentage: { type: Number, default: 100 },
  status: { type: String, enum: ['Eligible', 'Borderline', 'At Risk', 'Ineligible'], default: 'Eligible' }
}, { _id: false });

// Schema for Medical Submissions
const MedicalRequestSchema = new mongoose.Schema({
  referenceNo: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  durationDays: { type: Number, default: 1 },
  doctorName: { type: String, default: 'Dr. University Medical Center' },
  hospitalOrClinic: { type: String, default: 'University Medical Center (UMC)' },
  affectedLectures: [{ type: String }],
  status: { type: String, enum: ['Approved', 'Pending', 'Under Review', 'Rejected'], default: 'Pending' },
  submissionDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  remarks: { type: String, default: '' }
});

// Schema for Exam Timetable entry
const ExamScheduleSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  hall: { type: String, default: 'Faculty Examination Hall A' },
  seatNo: { type: String, default: 'A-01' }
}, { _id: false });

// Schema for Exam Results
const CourseResultSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  credits: { type: Number, required: true },
  grade: { type: String, required: true },
  gradePoint: { type: Number, required: true }
}, { _id: false });

// Main Student Schema - Each student has a complete, isolated section in MongoDB
const StudentSchema = new mongoose.Schema({
  // Unique Student Identifiers
  studentId: {
    type: String,
    required: [true, 'Student Registration Number is required'],
    unique: true,
    trim: true,
    index: true // e.g. "2021/ICT/85"
  },
  indexNo: {
    type: String,
    required: [true, 'Index Number is required'],
    unique: true,
    trim: true,
    index: true // e.g. "ICT21085"
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'University email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  faculty: {
    type: String,
    default: 'Faculty of Technology'
  },
  department: {
    type: String,
    default: 'Department of Information and Communication Technology'
  },
  degreeProgramme: {
    type: String,
    default: 'Bachelor of Information and Communication Technology (BICT)'
  },
  batch: {
    type: String,
    default: '2021/2022'
  },
  currentSemester: {
    type: String,
    default: 'Year 3 Semester 1'
  },
  academicYear: {
    type: String,
    default: '2025/2026'
  },
  academicStatus: {
    type: String,
    default: 'Good Standing'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },

  // ---- Normalised academic identity (spec section 4). The embedded sections below are the legacy,
  // ---- denormalised demo data; new code reads courses/attendance/results from their own collections.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  registrationNo: { type: String, trim: true },
  departmentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  programmeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgramme', index: true },
  batchRef: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicBatch', index: true },
  specializationRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialization', default: null },
  admissionYear: { type: Number },
  currentYear: { type: Number, min: 1, max: 8, default: 1 },
  currentSemesterNumber: { type: Number, min: 1, max: 4, default: 1 },
  status: { type: String, enum: ['Active', 'On Leave', 'Suspended', 'Graduated', 'Withdrawn'], default: 'Active', index: true },
  accountStatus: { type: String, enum: ['active', 'suspended', 'disabled'], default: 'active' },
  contact: { phone: { type: String, default: '' }, address: { type: String, default: '' }, personalEmail: { type: String, default: '' } },
  statusHistory: [
    { _id: false, from: String, to: String, reason: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } },
  ],
  progressionHistory: [
    { _id: false, fromYear: Number, fromSemester: Number, toYear: Number, toSemester: Number, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } },
  ],

  // 1. ACADEMIC PROFILE SECTION
  academicProfile: {
    profileImage: { type: String, default: '' },
    personalEmail: { type: String, default: '' },
    personalPhone: { type: String, default: '+94 77 123 4567' },
    dob: { type: String, default: '2001-05-15' },
    nic: { type: String, default: '200113601234' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    permanentAddress: { type: String, default: 'Oluvil, South Eastern University Campus, Sri Lanka' },
    guardianName: { type: String, default: 'M.N.M. Farook' },
    guardianRelationship: { type: String, default: 'Father' },
    guardianPhone: { type: String, default: '+94 71 987 6543' },
    alQualifications: {
      stream: { type: String, default: 'Technology Stream' },
      zScore: { type: Number, default: 1.8452 },
      indexNumber: { type: String, default: '6128491' }
    },
    bio: { type: String, default: 'Undergraduate student at Faculty of Technology, SEUSL.' }
  },

  // 2. SEMESTER REGISTRATIONS SECTION
  semesterRegistrations: [
    {
      semester: { type: String, required: true },
      academicYear: { type: String, default: '2025/2026' },
      registrationDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
      status: { type: String, enum: ['Open', 'Active', 'Confirmed', 'Closed'], default: 'Confirmed' },
      totalCredits: { type: Number, default: 0 },
      courses: [EnrolledCourseSchema]
    }
  ],

  // 3. ATTENDANCE SECTION
  attendance: {
    overallAttendancePercentage: { type: Number, default: null },
    totalLectures: { type: Number, default: 0 },
    attendedLectures: { type: Number, default: 0 },
    eligibilityStatus: { type: String, enum: ['Eligible', 'Ineligible', 'Borderline'], default: 'Eligible' },
    subjectRecords: [SubjectAttendanceSchema]
  },

  // 4. MEDICAL REQUESTS SECTION
  medicalRequests: [MedicalRequestSchema],

  // 5. EXAMINATIONS SECTION
  examinations: [
    {
      semester: { type: String, default: 'Year 1 Semester 1' },
      academicYear: { type: String, default: '2025/2026' },
      admissionCardNo: { type: String, default: '' },
      eligibility: { type: Boolean, default: true },
      remarks: { type: String, default: 'Enrolled for active semester courses.' },
      timetable: [ExamScheduleSchema]
    }
  ],

  // 6. RESULTS SECTION
  results: [
    {
      semester: { type: String, required: true },
      sgpa: { type: Number, required: true },
      totalCredits: { type: Number, default: 0 },
      courses: [CourseResultSchema]
    }
  ],

  // 7. GPA / CGPA SECTION
  gpaCgpa: {
    currentSgpa: { type: Number, default: null },
    cgpa: { type: Number, default: null },
    academicStanding: { type: String, default: 'Enrolled (In Progress)' },
    targetClass: { type: String, default: 'General Standing' },
    totalCreditsEarned: { type: Number, default: 0 },
    totalCreditsRequired: { type: Number, default: 120 },
    semesterHistory: [
      {
        semester: { type: String, required: true },
        sgpa: { type: Number, default: 0 },
        credits: { type: Number, default: 0 }
      }
    ]
  },

  // 8. ACADEMIC PROGRESS SECTION
  academicProgress: {
    completionPercentage: { type: Number, default: 65 },
    totalCreditsRequired: { type: Number, default: 120 },
    totalCreditsCompleted: { type: Number, default: 78 },
    coreCreditsCompleted: { type: Number, default: 60 },
    coreCreditsRequired: { type: Number, default: 90 },
    electiveCreditsCompleted: { type: Number, default: 18 },
    electiveCreditsRequired: { type: Number, default: 30 },
    industrialTrainingStatus: { type: String, default: 'Pending Semester 6' },
    finalYearProjectStatus: { type: String, default: 'Scheduled Year 4' }
  }
}, {
  timestamps: true,
  collection: 'students' // Explicitly stores in 'students' collection in MongoDB
});

StudentSchema.index({ registrationNo: 1 }, { unique: true, sparse: true });
// sparse would still index explicit nulls (user defaults to null), so only linked accounts are constrained
StudentSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });
StudentSchema.index({ departmentRef: 1, batchRef: 1, status: 1 });

// Helper virtual to return URL-safe student identifier
StudentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

StudentSchema.set('toJSON', { virtuals: true });
StudentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', StudentSchema);
