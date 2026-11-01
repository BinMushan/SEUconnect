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
    const { studentId, indexNo, email, fullName } = req.body;

    // Check if student already exists
    const existing = await Student.findOne({
      $or: [{ studentId }, { indexNo }, { email: email?.toLowerCase() }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Student already exists with registration number, index, or email.`
      });
    }

    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Student record and separate database section created successfully!',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create student record',
      error: error.message
    });
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
