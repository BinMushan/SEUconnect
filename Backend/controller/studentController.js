const Student = require('../models/Student');

// Helper to find student by studentId, indexNo, or MongoDB _id
const findStudentByAnyIdentifier = async (identifier) => {
  if (!identifier) return null;
  const decoded = decodeURIComponent(identifier);
  return await Student.findOne({
    $or: [
      { studentId: decoded },
      { indexNo: decoded },
      { email: decoded.toLowerCase() },
      ...(decoded.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: decoded }] : [])
    ]
  });
};

// @desc    Get all students (list summary)
// @route   GET /api/student
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, 'studentId indexNo fullName email department degreeProgramme currentSemester academicStatus');
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving students',
      error: error.message
    });
  }
};

// @desc    Get complete data for a specific student
// @route   GET /api/student/:identifier
exports.getStudentByIdentifier = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with identifier: ${req.params.identifier}`
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving student',
      error: error.message
    });
  }
};

// @desc    Create a new student with their own separate database section
// @route   POST /api/student
exports.createStudent = async (req, res) => {
  try {
    const {
      studentId,
      regNo,
      indexNo,
      email,
      fullName,
      name,
      tempPassword,
      password,
      department,
      degreeProgramme,
      programme,
      currentSemester,
      semester,
      batch
    } = req.body;

    const effectiveId = (studentId || regNo || '').trim().toUpperCase();
    const effectiveEmail = (email || '').trim().toLowerCase();
    const effectiveName = (fullName || name || '').trim();
    const effectiveIndex = (indexNo || effectiveId).trim().toUpperCase();
    const effectiveProgramme = degreeProgramme || programme || 'BICT (Hons)';
    const effectiveDepartment = department || 'Department of Information and Communication Technology';
    const effectiveSemester = currentSemester || semester || 'Semester 1';
    const rawPassword = tempPassword || password || '123456';

    if (!effectiveId || !effectiveEmail || !effectiveName) {
      return res.status(400).json({
        success: false,
        message: 'Registration Number, Full Name, and Email are required.'
      });
    }

    const { hashPassword } = require('../utils/password');
    const store = require('../store');

    // 1. Create or update User account in store & DB so student can log in
    const userData = {
      name: effectiveName,
      email: effectiveEmail,
      password: hashPassword(rawPassword),
      role: 'student',
      roleKey: 'student',
      regNo: effectiveId,
      department: effectiveDepartment,
      faculty: 'Faculty of Technology',
      programme: effectiveProgramme,
      semester: effectiveSemester,
      designation: 'Undergraduate',
      avatarInitial: effectiveName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'ST',
      status: 'active'
    };

    await store.users.createOrUpdate(userData);

    // 2. Create or update Student document in Student collection
    let studentDoc = null;
    if (store.connected()) {
      const existing = await Student.findOne({
        $or: [{ studentId: effectiveId }, { indexNo: effectiveIndex }, { email: effectiveEmail }]
      });

      if (existing) {
        Object.assign(existing, {
          fullName: effectiveName,
          email: effectiveEmail,
          department: effectiveDepartment,
          degreeProgramme: effectiveProgramme,
          currentSemester: effectiveSemester,
          batch: batch || '2025/2026'
        });
        studentDoc = await existing.save();
      } else {
        studentDoc = await Student.create({
          studentId: effectiveId,
          indexNo: effectiveIndex,
          fullName: effectiveName,
          email: effectiveEmail,
          faculty: 'Faculty of Technology',
          department: effectiveDepartment,
          degreeProgramme: effectiveProgramme,
          currentSemester: effectiveSemester,
          batch: batch || '2025/2026',
          academicStatus: 'Good Standing',
          academicProfile: {
            personalPhone: req.body.phone || '+94 77 123 4567',
            personalEmail: effectiveEmail,
            guardianName: 'Parent / Guardian',
            permanentAddress: 'Oluvil Campus, Sri Lanka',
            gender: 'Male'
          },
          attendance: {
            overallAttendancePercentage: 100.0,
            totalLectures: 0,
            attendedLectures: 0,
            eligibilityStatus: 'Eligible',
            subjectRecords: []
          },
          semesterRegistrations: [],
          results: [],
          examinations: []
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Student ${effectiveName} (${effectiveId}) enrolled successfully! Login account created.`,
      data: studentDoc || userData
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create student record: ' + error.message
    });
  }
};

exports.createStudentsBulk = async (req, res) => {
  try {
    const { students = [] } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of students to enroll.' });
    }

    const { hashPassword } = require('../utils/password');
    const store = require('../store');
    let createdCount = 0;

    for (const s of students) {
      const effectiveId = (s.studentId || s.regNo || '').trim().toUpperCase();
      const effectiveEmail = (s.email || '').trim().toLowerCase();
      const effectiveName = (s.fullName || s.name || '').trim();
      const effectiveIndex = (s.indexNo || effectiveId).trim().toUpperCase();
      const effectiveProgramme = s.degreeProgramme || s.programme || 'BICT (Hons)';
      const effectiveDepartment = s.department || 'Department of Information and Communication Technology';
      const effectiveSemester = s.currentSemester || s.semester || 'Semester 1';
      const rawPassword = s.tempPassword || s.password || '123456';

      if (!effectiveId || !effectiveEmail) continue;

      const userData = {
        name: effectiveName || effectiveId,
        email: effectiveEmail,
        password: hashPassword(rawPassword),
        role: 'student',
        roleKey: 'student',
        regNo: effectiveId,
        department: effectiveDepartment,
        faculty: 'Faculty of Technology',
        programme: effectiveProgramme,
        semester: effectiveSemester,
        designation: 'Undergraduate',
        avatarInitial: (effectiveName || 'ST').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase(),
        status: 'active'
      };
      await store.users.createOrUpdate(userData);

      if (store.connected()) {
        await Student.findOneAndUpdate(
          { $or: [{ studentId: effectiveId }, { email: effectiveEmail }] },
          {
            $set: {
              studentId: effectiveId,
              indexNo: effectiveIndex,
              fullName: effectiveName,
              email: effectiveEmail,
              faculty: 'Faculty of Technology',
              department: effectiveDepartment,
              degreeProgramme: effectiveProgramme,
              currentSemester: effectiveSemester,
              batch: s.batch || s.batchCode || '2025/2026',
              academicStatus: 'Good Standing'
            }
          },
          { upsert: true, new: true }
        );
      }
      createdCount++;
    }

    res.status(201).json({
      success: true,
      message: `Successfully enrolled ${createdCount} students with database sections and login credentials.`,
      count: createdCount
    });
  } catch (error) {
    console.error('Bulk student creation error:', error);
    res.status(500).json({ success: false, message: 'Server error during bulk enrollment: ' + error.message });
  }
};

// @desc    Update Academic Profile for a student
// @route   PUT /api/student/:identifier/profile
exports.updateAcademicProfile = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update profile fields
    student.academicProfile = {
      ...student.academicProfile.toObject(),
      ...req.body
    };

    if (req.body.fullName) student.fullName = req.body.fullName;
    if (req.body.phone) student.academicProfile.personalPhone = req.body.phone;

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Academic profile updated successfully',
      data: student.academicProfile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating academic profile',
      error: error.message
    });
  }
};

// @desc    Get Attendance section for a student
// @route   GET /api/student/:identifier/attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student.attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit a Medical Request for a student
// @route   POST /api/student/:identifier/medical
exports.submitMedicalRequest = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const newRequest = {
      referenceNo: `MED-${Date.now().toString().slice(-6)}`,
      ...req.body,
      submissionDate: new Date().toISOString().split('T')[0]
    };

    student.medicalRequests.push(newRequest);
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Medical excuse submitted and recorded in student database section!',
      data: newRequest
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get Medical Requests for a student
// @route   GET /api/student/:identifier/medical
exports.getStudentMedicalRequests = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student.medicalRequests
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Examinations & Admissions for a student
// @route   GET /api/student/:identifier/examinations
exports.getStudentExaminations = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student.examinations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Results section for a student
// @route   GET /api/student/:identifier/results
exports.getStudentResults = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student.results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get GPA / CGPA section for a student
// @route   GET /api/student/:identifier/gpa
exports.getStudentGpa = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student.gpaCgpa
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Academic Progress section for a student
// @route   GET /api/student/:identifier/progress
exports.getStudentProgress = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student.academicProgress
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register courses for a semester
// @route   POST /api/student/:identifier/register-courses
exports.registerSemesterCourses = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { semester, courses } = req.body;
    const totalCredits = (courses || []).reduce((acc, c) => acc + (c.credits || 0), 0);

    // Check if semester registration already exists
    const existingIndex = student.semesterRegistrations.findIndex(r => r.semester === semester);
    if (existingIndex !== -1) {
      student.semesterRegistrations[existingIndex].courses = courses;
      student.semesterRegistrations[existingIndex].totalCredits = totalCredits;
      student.semesterRegistrations[existingIndex].status = 'Confirmed';
    } else {
      student.semesterRegistrations.push({
        semester,
        totalCredits,
        status: 'Confirmed',
        courses
      });
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Semester courses registered successfully!',
      data: student.semesterRegistrations
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
