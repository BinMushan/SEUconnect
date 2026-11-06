const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { getCurriculumBySemester, normalizeSemester } = require('../config/curriculumTimetables');

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

    const raw = student.toObject ? student.toObject() : { ...student };
    const cur = getCurriculumBySemester(raw.currentSemester);

    let dbSubjects = [];
    try {
      dbSubjects = await Subject.find({ semesterName: cur.semester }).sort({ code: 1 }).lean();
    } catch (_) {}

    const effectiveSubjects = (dbSubjects && dbSubjects.length > 0) ? dbSubjects : cur.subjects;
    raw.enrolledSubjects = effectiveSubjects;

    // Guarantee semester registrations, courses, timetable, and attendance records exist matching their semester
    if (!raw.semesterRegistrations || raw.semesterRegistrations.length === 0 || !raw.semesterRegistrations[0]?.courses?.length) {
      raw.semesterRegistrations = [{
        semester: cur.semester,
        academicYear: raw.batch || '2025/2026',
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        totalCredits: cur.totalCredits,
        courses: effectiveSubjects.map(s => ({
          courseCode: s.code,
          courseName: s.title,
          credits: s.credits || s.gpaCredits || 2,
          type: s.type || 'Core',
          gpaCredits: s.gpaCredits,
          ngpaCredits: s.ngpaCredits,
          continuousAssessmentPercent: s.continuousAssessmentPercent,
          endSemesterAssessmentPercent: s.endSemesterAssessmentPercent,
          status: 'Registered'
        }))
      }];
    }

    if (!raw.attendance || !raw.attendance.subjectRecords || raw.attendance.subjectRecords.length === 0) {
      raw.attendance = {
        overallAttendancePercentage: raw.attendance?.overallAttendancePercentage || 92.5,
        totalLectures: 120,
        attendedLectures: 111,
        eligibilityStatus: 'Eligible',
        subjectRecords: effectiveSubjects.map(s => ({
          courseCode: s.code,
          courseName: s.title,
          totalClasses: 30,
          attendedClasses: 28,
          percentage: 93.3,
          status: 'Eligible'
        }))
      };
    }

    if (!raw.examinations || raw.examinations.length === 0) {
      raw.examinations = [{
        semester: cur.semester,
        academicYear: raw.batch || '2025/2026',
        admissionCardNo: `ADM-${(raw.studentId || 'SEU').replace(/[^a-zA-Z0-9]/g, '')}`,
        eligibility: true,
        remarks: 'Eligible for all enrolled examination modules.',
        timetable: cur.examModules.map(e => ({
          courseCode: e.code,
          courseName: e.title,
          date: e.examDate,
          time: e.examTime,
          hall: e.hall,
          seatNo: e.seatNo
        }))
      }];
    }

    if (!raw.gpaCgpa || !raw.gpaCgpa.currentSgpa) {
      raw.gpaCgpa = {
        currentSgpa: cur.defaultSgpa,
        cgpa: cur.defaultCgpa,
        academicStanding: 'Good Standing',
        totalCreditsEarned: cur.totalCredits,
        totalCreditsRequired: 120,
        semesterHistory: cur.progressionData.map(p => ({
          semester: p.semester,
          sgpa: p.sgpa,
          credits: p.credits
        }))
      };
    }

    raw.timetable = cur.timetableSlots;
    raw.matrixColumns = cur.matrixColumns;
    raw.matrixDailyRows = cur.matrixDailyRows;
    raw.progressionData = cur.progressionData;

    res.status(200).json({
      success: true,
      data: raw
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
    const cur = getCurriculumBySemester(effectiveSemester);
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
          currentSemester: cur.semester,
          batch: batch || '2025/2026'
        });
        if (!existing.semesterRegistrations || existing.semesterRegistrations.length === 0) {
          existing.semesterRegistrations = [{
            semester: cur.semester,
            academicYear: batch || '2025/2026',
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'Confirmed',
            totalCredits: cur.totalCredits,
            courses: cur.subjects.map(s => ({
              courseCode: s.code,
              courseName: s.title,
              credits: s.credits,
              type: s.type || 'Core',
              status: 'Registered'
            }))
          }];
        }
        if (!existing.attendance || !existing.attendance.subjectRecords || existing.attendance.subjectRecords.length === 0) {
          existing.attendance = {
            overallAttendancePercentage: 92.5,
            totalLectures: 120,
            attendedLectures: 111,
            eligibilityStatus: 'Eligible',
            subjectRecords: cur.subjects.map(s => ({
              courseCode: s.code,
              courseName: s.title,
              totalClasses: 30,
              attendedClasses: 28,
              percentage: 93.3,
              status: 'Eligible'
            }))
          };
        }
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
          currentSemester: cur.semester,
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
            overallAttendancePercentage: 92.5,
            totalLectures: 120,
            attendedLectures: 111,
            eligibilityStatus: 'Eligible',
            subjectRecords: cur.subjects.map(s => ({
              courseCode: s.code,
              courseName: s.title,
              totalClasses: 30,
              attendedClasses: 28,
              percentage: 93.3,
              status: 'Eligible'
            }))
          },
          semesterRegistrations: [{
            semester: cur.semester,
            academicYear: batch || '2025/2026',
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'Confirmed',
            totalCredits: cur.totalCredits,
            courses: cur.subjects.map(s => ({
              courseCode: s.code,
              courseName: s.title,
              credits: s.credits,
              type: s.type || 'Core',
              status: 'Registered'
            }))
          }],
          gpaCgpa: {
            currentSgpa: cur.defaultSgpa !== null && cur.defaultSgpa !== undefined ? cur.defaultSgpa : 0.0,
            cgpa: cur.defaultCgpa !== null && cur.defaultCgpa !== undefined ? cur.defaultCgpa : 0.0,
            academicStanding: cur.isFreshers ? 'Enrolled (Freshers)' : 'Good Standing',
            targetClass: (cur.defaultCgpa || 0) >= 3.70 ? 'First Class' : 'Second Class (Upper)',
            totalCreditsEarned: cur.defaultSgpa ? cur.totalCredits : 0,
            totalCreditsRequired: 120,
            semesterHistory: (cur.progressionData || [])
              .filter(p => p.sgpa !== null && p.sgpa !== undefined)
              .map(p => ({
                semester: p.semester,
                sgpa: p.sgpa,
                credits: p.credits || 0
              }))
          },
          results: [],
          examinations: [{
            semester: cur.semester,
            academicYear: batch || '2025/2026',
            admissionCardNo: `ADM-${effectiveId.replace(/[^a-zA-Z0-9]/g, '')}`,
            eligibility: true,
            remarks: 'Eligible for all enrolled examination modules.',
            timetable: cur.examModules.map(e => ({
              courseCode: e.code,
              courseName: e.title,
              date: e.examDate,
              time: e.examTime,
              hall: e.hall,
              seatNo: e.seatNo
            }))
          }]
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
        const cur = getCurriculumBySemester(effectiveSemester);
        let regSubjects = [];
        try {
          regSubjects = await Subject.find({ semesterName: cur.semester }).sort({ code: 1 }).lean();
        } catch (_) {}
        const finalRegSubjects = (regSubjects && regSubjects.length > 0) ? regSubjects : cur.subjects;

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
              currentSemester: cur.semester,
              batch: s.batch || s.batchCode || '2025/2026',
              academicStatus: 'Good Standing'
            },
            $setOnInsert: {
              academicProfile: {
                personalPhone: s.phone || '+94 77 123 4567',
                personalEmail: effectiveEmail,
                guardianName: 'Parent / Guardian',
                permanentAddress: 'Oluvil Campus, Sri Lanka',
                gender: 'Male'
              },
              attendance: {
                overallAttendancePercentage: 92.5,
                totalLectures: 120,
                attendedLectures: 111,
                eligibilityStatus: 'Eligible',
                subjectRecords: finalRegSubjects.map(sub => ({
                  courseCode: sub.code,
                  courseName: sub.title,
                  totalClasses: 30,
                  attendedClasses: 28,
                  percentage: 93.3,
                  status: 'Eligible'
                }))
              },
              semesterRegistrations: [{
                semester: cur.semester,
                academicYear: s.batch || s.batchCode || '2025/2026',
                registrationDate: new Date().toISOString().split('T')[0],
                status: 'Confirmed',
                totalCredits: cur.totalCredits,
                courses: finalRegSubjects.map(sub => ({
                  courseCode: sub.code,
                  courseName: sub.title,
                  credits: sub.credits || sub.gpaCredits || 2,
                  type: sub.type || 'Core',
                  status: 'Registered'
                }))
              }],
              gpaCgpa: {
                currentSgpa: cur.defaultSgpa !== null && cur.defaultSgpa !== undefined ? cur.defaultSgpa : 0.0,
                cgpa: cur.defaultCgpa !== null && cur.defaultCgpa !== undefined ? cur.defaultCgpa : 0.0,
                academicStanding: cur.isFreshers ? 'Enrolled (Freshers)' : 'Good Standing',
                targetClass: (cur.defaultCgpa || 0) >= 3.70 ? 'First Class' : 'Second Class (Upper)',
                totalCreditsEarned: cur.defaultSgpa ? cur.totalCredits : 0,
                totalCreditsRequired: 120,
                semesterHistory: (cur.progressionData || [])
                  .filter(p => p.sgpa !== null && p.sgpa !== undefined)
                  .map(p => ({
                    semester: p.semester,
                    sgpa: p.sgpa,
                    credits: p.credits || 0
                  }))
              },
              results: [],
              examinations: [{
                semester: cur.semester,
                academicYear: s.batch || s.batchCode || '2025/2026',
                admissionCardNo: `ADM-${effectiveId.replace(/[^a-zA-Z0-9]/g, '')}`,
                eligibility: true,
                remarks: 'Eligible for all enrolled examination modules.',
                timetable: cur.examModules.map(e => ({
                  courseCode: e.code,
                  courseName: e.title,
                  date: e.examDate,
                  time: e.examTime,
                  hall: e.hall,
                  seatNo: e.seatNo
                }))
              }]
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

// @desc    Update a student general details
// @route   PUT /api/student/:identifier
exports.updateStudent = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    const {
      fullName,
      name,
      indexNo,
      department,
      degreeProgramme,
      programme,
      currentSemester,
      semester,
      phone,
      status,
      academicStatus,
      tempPassword,
      email,
      cgpa,
      sgpa,
      attendance
    } = req.body;

    if (fullName || name) student.fullName = (fullName || name).trim();
    if (indexNo) student.indexNo = indexNo.trim().toUpperCase();
    if (department) student.department = department;
    if (degreeProgramme || programme) student.degreeProgramme = degreeProgramme || programme;
    if (currentSemester || semester) student.currentSemester = currentSemester || semester;
    if (status || academicStatus) student.academicStatus = status || academicStatus;
    if (phone) {
      if (!student.academicProfile) student.academicProfile = {};
      student.academicProfile.personalPhone = phone;
    }
    if (cgpa !== undefined && student.gpaCgpa) student.gpaCgpa.cgpa = Number(cgpa);
    if (sgpa !== undefined && student.gpaCgpa) student.gpaCgpa.currentSgpa = Number(sgpa);
    if (attendance !== undefined && student.attendance) student.attendance.overallAttendancePercentage = Number(attendance);

    await student.save();

    // Also update User account in store & DB if exists
    try {
      const store = require('../store');
      const user = await store.users.findByEmail(student.email);
      if (user) {
        if (fullName || name) user.name = (fullName || name).trim();
        if (department) user.department = department;
        if (degreeProgramme || programme) user.programme = degreeProgramme || programme;
        if (currentSemester || semester) user.semester = currentSemester || semester;
        if (status) user.status = status.toLowerCase() === 'active' ? 'active' : 'suspended';
        if (tempPassword) {
          const { hashPassword } = require('../utils/password');
          user.password = hashPassword(tempPassword);
        }
        await store.users.save(user);
      }
    } catch (uErr) {
      console.warn('Syncing User account during student update failed:', uErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Student ${student.studentId} updated successfully.`,
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student: ' + error.message
    });
  }
};

// @desc    Delete a student by identifier
// @route   DELETE /api/student/:identifier
exports.deleteStudent = async (req, res) => {
  try {
    const student = await findStudentByAnyIdentifier(req.params.identifier);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    const regNo = student.studentId;
    const email = student.email;

    // Delete student record
    await Student.deleteOne({ _id: student._id });

    // Also delete user account if exists
    try {
      const User = require('../models/User');
      if (email) {
        await User.deleteOne({ email: email.toLowerCase() });
      }
    } catch (uErr) {
      console.warn('Deleting User account for student failed:', uErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Student record ${regNo} (${student.fullName}) deleted successfully.`
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student: ' + error.message
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
    if (req.body.profileImage) {
      student.profileImage = req.body.profileImage;
      student.avatarUrl = req.body.profileImage;
      student.academicProfile.profileImage = req.body.profileImage;
    }

    await student.save();

    // Also sync User record in MongoDB and store
    try {
      const store = require('../store');
      const user = await store.users.findByEmail(student.email);
      if (user) {
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.profileImage) user.profileImage = req.body.profileImage;
        if (req.body.specialization) user.specialization = req.body.specialization;
        if (req.body.address) user.address = req.body.address;
        await store.users.save(user);
      }
    } catch (uErr) {
      console.warn('Syncing User record from student update failed:', uErr.message);
    }

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
