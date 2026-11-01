require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Student = require('./models/Student');

const SAMPLE_STUDENTS = [
  {
    studentId: '2021/ICT/85',
    indexNo: 'ICT21085',
    fullName: 'M.N.M. Afnan',
    email: '22ict085@seu.ac.lk',
    faculty: 'Faculty of Technology',
    department: 'Department of Information and Communication Technology',
    degreeProgramme: 'Bachelor of Information and Communication Technology (BICT)',
    batch: '2021/2022',
    currentSemester: 'Year 3 Semester 1',
    academicYear: '2025/2026',
    academicStatus: 'Good Standing',
    academicProfile: {
      personalEmail: 'afnan.personal@gmail.com',
      personalPhone: '+94 77 123 4567',
      dob: '2001-05-15',
      nic: '200113601234',
      gender: 'Male',
      permanentAddress: 'Main Street, Addalaichenai, Ampara, Sri Lanka',
      guardianName: 'M.N.M. Farook',
      guardianRelationship: 'Father',
      guardianPhone: '+94 71 987 6543',
      alQualifications: {
        stream: 'Technology Stream',
        zScore: 1.8452,
        indexNumber: '6128491'
      },
      bio: 'Undergraduate student in BICT Honours specializing in Software Engineering and Distributed Cloud Applications.'
    },
    semesterRegistrations: [
      {
        semester: 'Year 3 Semester 1',
        academicYear: '2025/2026',
        registrationDate: '2026-10-01',
        status: 'Confirmed',
        totalCredits: 18,
        courses: [
          { courseCode: 'ICT 31013', courseName: 'Advanced Database Systems', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'ICT 31023', courseName: 'Web Services & Cloud Computing', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'ICT 31033', courseName: 'Software Engineering Project Management', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'ICT 31043', courseName: 'Mobile Application Development', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'ICT 31053', courseName: 'Data Science & Machine Learning', credits: 3, type: 'Elective', status: 'Registered' },
          { courseCode: 'ICT 31063', courseName: 'Human Computer Interaction', credits: 3, type: 'Elective', status: 'Registered' }
        ]
      }
    ],
    attendance: {
      overallAttendancePercentage: 86.5,
      totalLectures: 140,
      attendedLectures: 121,
      eligibilityStatus: 'Eligible',
      subjectRecords: [
        { courseCode: 'ICT 31013', courseName: 'Advanced Database Systems', totalClasses: 28, attendedClasses: 26, percentage: 92.8, status: 'Eligible' },
        { courseCode: 'ICT 31023', courseName: 'Web Services & Cloud Computing', totalClasses: 28, attendedClasses: 25, percentage: 89.2, status: 'Eligible' },
        { courseCode: 'ICT 31033', courseName: 'Software Engineering Project Management', totalClasses: 28, attendedClasses: 24, percentage: 85.7, status: 'Eligible' },
        { courseCode: 'ICT 31043', courseName: 'Mobile Application Development', totalClasses: 28, attendedClasses: 23, percentage: 82.1, status: 'Eligible' },
        { courseCode: 'ICT 31053', courseName: 'Data Science & Machine Learning', totalClasses: 28, attendedClasses: 23, percentage: 82.1, status: 'Eligible' }
      ]
    },
    medicalRequests: [
      {
        referenceNo: 'MED-2026-085',
        reason: 'Viral fever and respiratory tract infection',
        startDate: '2026-09-12',
        endDate: '2026-09-16',
        durationDays: 5,
        doctorName: 'Dr. K.L. Rahuman (DMO)',
        hospitalOrClinic: 'Ashraff Memorial Hospital, Kalmunai',
        affectedLectures: ['ICT 31013 - 2 Lectures', 'ICT 31033 - 1 Lab'],
        status: 'Approved',
        submissionDate: '2026-09-18',
        remarks: 'Approved by Faculty Medical Board. Attendance standing updated to Excused_Medical.'
      }
    ],
    examinations: [
      {
        semester: 'Year 3 Semester 1',
        academicYear: '2025/2026',
        admissionCardNo: 'ADM-2026-ICT-085',
        eligibility: true,
        remarks: 'Candidate is fully cleared for all registered modules.',
        timetable: [
          { courseCode: 'ICT 31013', courseName: 'Advanced Database Systems', date: '2026-11-04', time: '09:00 AM - 12:00 PM', hall: 'Faculty Examination Hall 01', seatNo: 'A-14' },
          { courseCode: 'ICT 31023', courseName: 'Web Services & Cloud Computing', date: '2026-11-08', time: '09:00 AM - 12:00 PM', hall: 'Faculty Examination Hall 01', seatNo: 'A-14' },
          { courseCode: 'ICT 31033', courseName: 'Software Engineering Project Management', date: '2026-11-12', time: '01:30 PM - 04:30 PM', hall: 'Computer Lab 03', seatNo: 'L3-22' }
        ]
      }
    ],
    results: [
      {
        semester: 'Year 1 Semester 1',
        sgpa: 3.42,
        totalCredits: 16,
        courses: [
          { courseCode: 'ICT 11013', courseName: 'Programming Fundamentals', credits: 3, grade: 'A', gradePoint: 4.0 },
          { courseCode: 'ICT 11023', courseName: 'Computer Systems Architecture', credits: 3, grade: 'B+', gradePoint: 3.3 },
          { courseCode: 'ICT 11033', courseName: 'Mathematics for Computing', credits: 3, grade: 'A-', gradePoint: 3.7 },
          { courseCode: 'ENG 11012', courseName: 'General English I', credits: 2, grade: 'B', gradePoint: 3.0 }
        ]
      },
      {
        semester: 'Year 2 Semester 2',
        sgpa: 3.55,
        totalCredits: 17,
        courses: [
          { courseCode: 'ICT 22013', courseName: 'Data Structures & Algorithms', credits: 3, grade: 'A', gradePoint: 4.0 },
          { courseCode: 'ICT 22023', courseName: 'Object Oriented Design', credits: 3, grade: 'A-', gradePoint: 3.7 },
          { courseCode: 'ICT 22033', courseName: 'Operating Systems', credits: 3, grade: 'B+', gradePoint: 3.3 }
        ]
      }
    ],
    gpaCgpa: {
      currentSgpa: 3.50,
      cgpa: 3.48,
      academicStanding: 'Good Standing',
      targetClass: 'Second Class (Upper Division) [3.30 - 3.69]',
      totalCreditsEarned: 78,
      totalCreditsRequired: 120,
      semesterHistory: [
        { semester: 'Sem 1', sgpa: 3.42, credits: 16 },
        { semester: 'Sem 2', sgpa: 3.38, credits: 16 },
        { semester: 'Sem 3', sgpa: 3.55, credits: 17 },
        { semester: 'Sem 4', sgpa: 3.58, credits: 17 },
        { semester: 'Sem 5', sgpa: 3.50, credits: 12 }
      ]
    },
    academicProgress: {
      completionPercentage: 65,
      totalCreditsRequired: 120,
      totalCreditsCompleted: 78,
      coreCreditsCompleted: 60,
      coreCreditsRequired: 90,
      electiveCreditsCompleted: 18,
      electiveCreditsRequired: 30,
      industrialTrainingStatus: 'Eligible for Placement in Sem 6',
      finalYearProjectStatus: 'Topic Selection in Year 4'
    }
  },
  {
    studentId: '2021/ICT/102',
    indexNo: 'ICT21102',
    fullName: 'F. Fatima Zeenath',
    email: '22ict102@seu.ac.lk',
    faculty: 'Faculty of Technology',
    department: 'Department of Information and Communication Technology',
    degreeProgramme: 'Bachelor of Information and Communication Technology (BICT)',
    batch: '2021/2022',
    currentSemester: 'Year 3 Semester 1',
    academicYear: '2025/2026',
    academicStatus: 'Dean\'s Merit List',
    academicProfile: {
      personalEmail: 'zeenath.f@gmail.com',
      personalPhone: '+94 77 987 1122',
      dob: '2001-09-20',
      nic: '200174501987',
      gender: 'Female',
      permanentAddress: 'Kandy Road, Akkaraipattu, Sri Lanka',
      guardianName: 'M.S. Faroona',
      guardianRelationship: 'Mother',
      guardianPhone: '+94 76 555 4321',
      alQualifications: {
        stream: 'Technology Stream',
        zScore: 2.0125,
        indexNumber: '6145892'
      },
      bio: 'Undergraduate student pursuing AI and Cyber Security specializations.'
    },
    semesterRegistrations: [
      {
        semester: 'Year 3 Semester 1',
        academicYear: '2025/2026',
        registrationDate: '2026-10-02',
        status: 'Confirmed',
        totalCredits: 18,
        courses: [
          { courseCode: 'ICT 31013', courseName: 'Advanced Database Systems', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'ICT 31023', courseName: 'Web Services & Cloud Computing', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'ICT 31073', courseName: 'Information Security & Cryptography', credits: 3, type: 'Elective', status: 'Registered' }
        ]
      }
    ],
    attendance: {
      overallAttendancePercentage: 94.2,
      totalLectures: 140,
      attendedLectures: 132,
      eligibilityStatus: 'Eligible',
      subjectRecords: [
        { courseCode: 'ICT 31013', courseName: 'Advanced Database Systems', totalClasses: 28, attendedClasses: 27, percentage: 96.4, status: 'Eligible' },
        { courseCode: 'ICT 31023', courseName: 'Web Services & Cloud Computing', totalClasses: 28, attendedClasses: 26, percentage: 92.8, status: 'Eligible' }
      ]
    },
    medicalRequests: [],
    examinations: [
      {
        semester: 'Year 3 Semester 1',
        academicYear: '2025/2026',
        admissionCardNo: 'ADM-2026-ICT-102',
        eligibility: true,
        remarks: 'Honours candidate - First Class track',
        timetable: []
      }
    ],
    results: [
      {
        semester: 'Year 2 Semester 2',
        sgpa: 3.86,
        totalCredits: 17,
        courses: [
          { courseCode: 'ICT 22013', courseName: 'Data Structures & Algorithms', credits: 3, grade: 'A+', gradePoint: 4.0 },
          { courseCode: 'ICT 22023', courseName: 'Object Oriented Design', credits: 3, grade: 'A', gradePoint: 4.0 }
        ]
      }
    ],
    gpaCgpa: {
      currentSgpa: 3.86,
      cgpa: 3.79,
      academicStanding: 'First Class Standing',
      targetClass: 'First Class (≥ 3.70)',
      totalCreditsEarned: 80,
      totalCreditsRequired: 120,
      semesterHistory: [
        { semester: 'Sem 1', sgpa: 3.75, credits: 16 },
        { semester: 'Sem 2', sgpa: 3.78, credits: 16 },
        { semester: 'Sem 3', sgpa: 3.81, credits: 17 },
        { semester: 'Sem 4', sgpa: 3.86, credits: 17 }
      ]
    },
    academicProgress: {
      completionPercentage: 67,
      totalCreditsRequired: 120,
      totalCreditsCompleted: 80,
      coreCreditsCompleted: 62,
      coreCreditsRequired: 90,
      electiveCreditsCompleted: 18,
      electiveCreditsRequired: 30,
      industrialTrainingStatus: 'Eligible for Placement in Sem 6',
      finalYearProjectStatus: 'Topic Selection in Year 4'
    }
  },
  {
    studentId: '2021/BST/45',
    indexNo: 'BST21045',
    fullName: 'K. Dinesh Kumar',
    email: '22bst045@seu.ac.lk',
    faculty: 'Faculty of Technology',
    department: 'Department of Biosystems Technology',
    degreeProgramme: 'Bachelor of Biosystems Technology (BBST)',
    batch: '2021/2022',
    currentSemester: 'Year 3 Semester 1',
    academicYear: '2025/2026',
    academicStatus: 'Good Standing',
    academicProfile: {
      personalEmail: 'dinesh.k@yahoo.com',
      personalPhone: '+94 71 445 7788',
      dob: '2001-03-10',
      nic: '200107001452',
      gender: 'Male',
      permanentAddress: 'Hospital Road, Sammanthurai, Sri Lanka',
      guardianName: 'S. Kandasamy',
      guardianRelationship: 'Father',
      guardianPhone: '+94 77 662 1199',
      alQualifications: {
        stream: 'Technology Stream',
        zScore: 1.7621,
        indexNumber: '6139941'
      },
      bio: 'Undergraduate student focusing on Agricultural Biotechnology and Food Processing Technology.'
    },
    semesterRegistrations: [
      {
        semester: 'Year 3 Semester 1',
        academicYear: '2025/2026',
        registrationDate: '2026-10-01',
        status: 'Confirmed',
        totalCredits: 17,
        courses: [
          { courseCode: 'BST 31013', courseName: 'Postharvest Technology', credits: 3, type: 'Core', status: 'Registered' },
          { courseCode: 'BST 31023', courseName: 'Bio-resource Engineering', credits: 3, type: 'Core', status: 'Registered' }
        ]
      }
    ],
    attendance: {
      overallAttendancePercentage: 81.4,
      totalLectures: 130,
      attendedLectures: 106,
      eligibilityStatus: 'Eligible',
      subjectRecords: [
        { courseCode: 'BST 31013', courseName: 'Postharvest Technology', totalClasses: 26, attendedClasses: 22, percentage: 84.6, status: 'Eligible' }
      ]
    },
    medicalRequests: [],
    examinations: [],
    results: [
      {
        semester: 'Year 2 Semester 2',
        sgpa: 3.25,
        totalCredits: 16,
        courses: [
          { courseCode: 'BST 22013', courseName: 'Food Chemistry & Microbiology', credits: 3, grade: 'B+', gradePoint: 3.3 }
        ]
      }
    ],
    gpaCgpa: {
      currentSgpa: 3.25,
      cgpa: 3.22,
      academicStanding: 'Good Standing',
      targetClass: 'Second Class (Lower Division)',
      totalCreditsEarned: 74,
      totalCreditsRequired: 120,
      semesterHistory: [
        { semester: 'Sem 1', sgpa: 3.18, credits: 15 },
        { semester: 'Sem 2', sgpa: 3.22, credits: 16 },
        { semester: 'Sem 3', sgpa: 3.24, credits: 16 }
      ]
    },
    academicProgress: {
      completionPercentage: 62,
      totalCreditsRequired: 120,
      totalCreditsCompleted: 74,
      coreCreditsCompleted: 58,
      coreCreditsRequired: 90,
      electiveCreditsCompleted: 16,
      electiveCreditsRequired: 30,
      industrialTrainingStatus: 'Scheduled Semester 6',
      finalYearProjectStatus: 'Scheduled Year 4'
    }
  }
];

async function seedAndVerify() {
  console.log('>>> Starting Seed & MongoDB Atlas Verification Script <<<');
  await connectDB();

  console.log('\n--- 1. Seeding Multiple Students into MongoDB Atlas ---');
  for (const studentData of SAMPLE_STUDENTS) {
    const saved = await Student.findOneAndUpdate(
      { studentId: studentData.studentId },
      studentData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✓ Stored Student: [${saved.studentId}] ${saved.fullName} (${saved.department})`);
    console.log(`  - Separate MongoDB _id: ${saved._id}`);
    console.log(`  - Profile Phone: ${saved.academicProfile.personalPhone}`);
    console.log(`  - Attendance Record: ${saved.attendance.overallAttendancePercentage}% (${saved.attendance.eligibilityStatus})`);
    console.log(`  - Registered Courses: ${saved.semesterRegistrations[0]?.courses.length || 0} courses`);
    console.log(`  - Medical Records: ${saved.medicalRequests.length} requests`);
    console.log(`  - Current CGPA: ${saved.gpaCgpa.cgpa}`);
    console.log(`  - Progress: ${saved.academicProgress.completionPercentage}%\n`);
  }

  console.log('--- 2. Verifying Multiple Students Retrieval from MongoDB Atlas ---');
  const count = await Student.countDocuments();
  console.log(`Total Student Records Stored in MongoDB: ${count}`);

  const allStudents = await Student.find({}, 'studentId indexNo fullName email currentSemester academicStatus');
  console.log('\nRetrieved Student Directory from Database:');
  allStudents.forEach((st, idx) => {
    console.log(` [${idx + 1}] ID: ${st.studentId} | Index: ${st.indexNo} | Name: ${st.fullName} | Status: ${st.academicStatus}`);
  });

  console.log('\n--- 3. Testing Deep Fetch of an Individual Student Section ---');
  const testStudent = await Student.findOne({ studentId: '2021/ICT/85' });
  console.log(`Verified Student: ${testStudent.fullName}`);
  console.log(`Database Collection: ${Student.collection.name}`);
  console.log(`Database Name: ${mongoose.connection.name}`);
  console.log(`Medical Reference No in DB: ${testStudent.medicalRequests[0]?.referenceNo || 'None'}`);
  console.log(`Guardian Contact in DB: ${testStudent.academicProfile.guardianName} (${testStudent.academicProfile.guardianPhone})`);

  console.log('\n>>> ALL VALUES VERIFIED AND STORED SUCCESSFULLY IN MONGODB ATLAS! <<<');
  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
  process.exit(0);
}

seedAndVerify().catch(err => {
  console.error('Seed/Verification Error:', err);
  process.exit(1);
});
