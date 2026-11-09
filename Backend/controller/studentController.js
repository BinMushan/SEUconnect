const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { getCurriculumBySemester, normalizeSemester, resolveStudentSemester, resolveStudentSpecialization } = require('../config/curriculumTimetables');

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

// @desc    Get all students (list summary with full details for management)
// @route   GET /api/student
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 }).lean();
    const formatted = students.map((s) => {
      const reg = s.studentId || s.registrationNo || s.regNo || '';
      const effectiveSem = resolveStudentSemester(s.currentSemester, reg, s.batch || s.batchId);
      const cur = getCurriculumBySemester(effectiveSem);
      const isFresh = cur?.isFreshers || (effectiveSem.includes('1') && !effectiveSem.includes('2'));
      const effectiveSpec = resolveStudentSpecialization(s.specialization, effectiveSem, reg, s.department);
      return {
        id: s._id ? s._id.toString() : (s.studentId || `stu-${Date.now()}`),
        _id: s._id,
        regNo: reg,
        studentId: reg,
        indexNo: s.indexNo || reg,
        name: s.fullName || s.name || '',
        fullName: s.fullName || s.name || '',
        email: s.email || '',
        department: s.department || 'Department of Information and Communication Technology',
        programme: s.degreeProgramme || s.programme || 'BICT (Hons)',
        degreeProgramme: s.degreeProgramme || s.programme || 'BICT (Hons)',
        semester: cur.semester,
        currentSemester: cur.semester,
        batch: s.batch || (/(?:^|[\/_])24[\/_]?/i.test(reg) ? 'Batch 05 (2024/2025)' : '2025/2026'),
        batchId: s.batchId || s.batch || (/(?:^|[\/_])24[\/_]?/i.test(reg) ? 'BATCH-05' : 'BATCH-03'),
        batchCode: s.batchCode || s.batch || (/(?:^|[\/_])24[\/_]?/i.test(reg) ? 'Batch 05 (2024/2025)' : 'Batch 03 (2022/2023)'),
        specialization: effectiveSpec,
        isFreshers: isFresh,
        cgpa: isFresh ? null : (s.gpaCgpa?.cgpa !== undefined ? s.gpaCgpa.cgpa : (cur.defaultCgpa ?? null)),
        sgpa: isFresh ? null : (s.gpaCgpa?.currentSgpa !== undefined ? s.gpaCgpa.currentSgpa : (cur.defaultSgpa ?? null)),
        sgpa: isFresh ? null : (s.gpaCgpa?.currentSgpa !== undefined ? s.gpaCgpa.currentSgpa : (cur.defaultSgpa ?? null)),
        credits: isFresh ? 0 : (s.gpaCgpa?.totalCreditsEarned !== undefined ? s.gpaCgpa.totalCreditsEarned : (cur.totalCredits ?? 0)),
        attendance: s.attendance?.overallAttendancePercentage !== undefined ? s.attendance.overallAttendancePercentage : (isFresh ? null : 100),
        status: s.academicStatus || s.status || 'Active',
        academicStatus: s.academicStatus || s.status || 'Active',
        phone: s.academicProfile?.personalPhone || s.phone || '+94 77 123 4567',
        welfare: s.welfare || 'Pending Verification',
        specialization: s.specialization || (s.department?.includes('Bio') ? 'Bio-Processing Technology' : 'Software Technology'),
        enrolledCourses: s.semesterRegistrations?.[0]?.courses || cur.subjects || [],
        timetable: cur.timetableSlots || [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
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
    const regNo = raw.studentId || raw.registrationNo || raw.regNo || req.params.identifier;
    const effectiveSemester = resolveStudentSemester(raw.currentSemester, regNo, raw.batch || raw.batchId);
    const cur = getCurriculumBySemester(effectiveSemester);
    const effectiveSpec = resolveStudentSpecialization(raw.specialization, effectiveSemester, regNo, raw.department);
    raw.currentSemester = cur.semester;
    raw.semester = cur.semester;
    raw.specialization = effectiveSpec;

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

    const isFresh = cur.isFreshers || (raw.currentSemester && (raw.currentSemester.includes('Semester 1') || raw.currentSemester.includes('Year 1 Semester 1')));

    if (!raw.attendance || !raw.attendance.subjectRecords || raw.attendance.subjectRecords.length === 0 || (isFresh && raw.attendance?.overallAttendancePercentage === 92.5)) {
      if (isFresh || raw.attendance?.totalLectures === 0 || raw.attendance?.overallAttendancePercentage === null) {
        raw.attendance = {
          overallAttendancePercentage: null,
          totalLectures: 0,
          attendedLectures: 0,
          eligibilityStatus: 'Enrolled',
          subjectRecords: effectiveSubjects.map(s => ({
            courseCode: s.code,
            courseName: s.title,
            totalClasses: 0,
            attendedClasses: 0,
            percentage: null,
            status: 'Enrolled'
          }))
        };
      } else {
        raw.attendance = {
          overallAttendancePercentage: raw.attendance?.overallAttendancePercentage ?? 100,
          totalLectures: raw.attendance?.totalLectures || 120,
          attendedLectures: raw.attendance?.attendedLectures || 120,
          eligibilityStatus: 'Eligible',
          subjectRecords: effectiveSubjects.map(s => ({
            courseCode: s.code,
            courseName: s.title,
            totalClasses: 30,
            attendedClasses: 30,
            percentage: 100,
            status: 'Eligible'
          }))
        };
      }
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
      batch,
      batchId,
      batchCode
    } = req.body;

    const effectiveId = (studentId || regNo || '').trim().toUpperCase();
    const effectiveEmail = (email || '').trim().toLowerCase();
    const effectiveName = (fullName || name || '').trim();
    const effectiveIndex = (indexNo || effectiveId).trim().toUpperCase();
    const effectiveProgramme = degreeProgramme || programme || 'BICT (Hons)';
    const effectiveDepartment = department || 'Department of Information and Communication Technology';
    const effectiveSemester = resolveStudentSemester(currentSemester || semester, effectiveId, batch || batchId);
    const rawPassword = tempPassword || password || '123456';
    const effectiveSpec = resolveStudentSpecialization(req.body.specialization, effectiveSemester, effectiveId, effectiveDepartment);

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
      semester: cur.semester,
      specialization: effectiveSpec,
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
          batch: batch || '2025/2026',
          batchId: batchId || (batch ? `BATCH-${batch}` : 'BATCH-05'),
          batchCode: batchCode || (batch ? `Batch (${batch})` : 'Batch 05 (2024/2025)')
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
            overallAttendancePercentage: cur.isFreshers ? null : 100,
            totalLectures: 0,
            attendedLectures: 0,
            eligibilityStatus: 'Eligible',
            subjectRecords: []
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
          batchId: batchId || (batch ? `BATCH-${batch}` : 'BATCH-05'),
          batchCode: batchCode || (batch ? `Batch (${batch})` : 'Batch 05 (2024/2025)'),
          academicStatus: 'Good Standing',
          academicProfile: {
            personalPhone: req.body.phone || '+94 77 123 4567',
            personalEmail: effectiveEmail,
            guardianName: 'Parent / Guardian',
            permanentAddress: 'Oluvil Campus, Sri Lanka',
            gender: 'Male'
          },
          attendance: {
            overallAttendancePercentage: cur.isFreshers ? null : 100,
            totalLectures: 0,
            attendedLectures: 0,
            eligibilityStatus: 'Eligible',
            subjectRecords: []
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
            currentSgpa: cur.isFreshers ? null : (cur.defaultSgpa ?? null),
            cgpa: cur.isFreshers ? null : (cur.defaultCgpa ?? null),
            academicStanding: cur.isFreshers ? 'Enrolled (Freshers)' : 'Good Standing',
            targetClass: cur.isFreshers ? 'General Standing' : ((cur.defaultCgpa || 0) >= 3.70 ? 'First Class' : 'Second Class (Upper)'),
            totalCreditsEarned: cur.isFreshers ? 0 : (cur.defaultSgpa ? cur.totalCredits : 0),
            totalCreditsRequired: 120,
            semesterHistory: cur.isFreshers ? [] : (cur.progressionData || [])
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
      const effectiveSemester = resolveStudentSemester(s.currentSemester || s.semester, effectiveId, s.batch || s.batchId);
      const rawPassword = s.tempPassword || s.password || '123456';
      const cur = getCurriculumBySemester(effectiveSemester);
      const effectiveSpec = resolveStudentSpecialization(s.specialization, effectiveSemester, effectiveId, effectiveDepartment);

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
        semester: cur.semester,
        specialization: effectiveSpec,
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
              batchId: s.batchId || 'BATCH-05',
              batchCode: s.batchCode || 'Batch 05 (2024/2025)',
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
                overallAttendancePercentage: cur.isFreshers ? null : 100,
                totalLectures: 0,
                attendedLectures: 0,
                eligibilityStatus: 'Eligible',
                subjectRecords: []
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
                currentSgpa: cur.isFreshers ? null : (cur.defaultSgpa ?? null),
                cgpa: cur.isFreshers ? null : (cur.defaultCgpa ?? null),
                academicStanding: cur.isFreshers ? 'Enrolled (Freshers)' : 'Good Standing',
                targetClass: cur.isFreshers ? 'General Standing' : ((cur.defaultCgpa || 0) >= 3.70 ? 'First Class' : 'Second Class (Upper)'),
                totalCreditsEarned: cur.isFreshers ? 0 : (cur.defaultSgpa ? cur.totalCredits : 0),
                totalCreditsRequired: 120,
                semesterHistory: cur.isFreshers ? [] : (cur.progressionData || [])
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

    const raw = student.toObject ? student.toObject() : { ...student };
    const cur = getCurriculumBySemester(raw.currentSemester);
    const isFresh = cur?.isFreshers || (raw.currentSemester && (raw.currentSemester.includes('Semester 1') || raw.currentSemester.includes('Year 1 Semester 1')));

    if (isFresh && (!raw.attendance?.totalLectures || raw.attendance?.totalLectures === 0 || raw.attendance?.overallAttendancePercentage === 92.5 || raw.attendance?.overallAttendancePercentage === null)) {
      return res.status(200).json({
        success: true,
        data: {
          overallAttendancePercentage: null,
          totalLectures: 0,
          attendedLectures: 0,
          eligibilityStatus: 'Enrolled',
          subjectRecords: []
        }
      });
    }

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

// @desc    Get all batches with live database persistence
// @route   GET /api/student/batches
exports.getAllBatches = async (req, res) => {
  try {
    const Batch = require('../models/Batch');
    let batches = await Batch.find({}).sort({ createdAt: 1 }).lean();

    if (!batches || batches.length === 0) {
      // Seed initial 5 standard cohorts into database
      const initial = [
        {
          id: 'BATCH-01',
          code: 'B01',
          name: 'Batch 01 (2020/2021)',
          academicYear: '2020/2021',
          currentSemester: 'Semester 8 (Final Year)',
          status: 'Graduating / Finalizing',
          totalStudents: 240,
          ictStudents: 120,
          bstStudents: 120,
          coordinator: 'Dr. S. Sabraz Nawaz (HOD - ICT)',
          departments: ['BICT', 'BST'],
          avgCgpa: 3.42,
          attendanceRate: 88,
          enrollmentDate: '2021-02-15',
          regPrefix: '20'
        },
        {
          id: 'BATCH-02',
          code: 'B02',
          name: 'Batch 02 (2021/2022)',
          academicYear: '2021/2022',
          currentSemester: 'Semester 6 (3rd Year)',
          status: 'Active',
          totalStudents: 240,
          ictStudents: 120,
          bstStudents: 120,
          coordinator: 'Dr. S. Sabraz Nawaz (HOD - ICT)',
          departments: ['BICT', 'BST'],
          avgCgpa: 3.38,
          attendanceRate: 90,
          enrollmentDate: '2022-03-01',
          regPrefix: '21'
        },
        {
          id: 'BATCH-03',
          code: 'B03',
          name: 'Batch 03 (2022/2023)',
          academicYear: '2022/2023',
          currentSemester: 'Semester 5 (3rd Year)',
          status: 'Active',
          totalStudents: 240,
          ictStudents: 120,
          bstStudents: 120,
          coordinator: 'Dr. S. Sabraz Nawaz (HOD - ICT)',
          departments: ['BICT', 'BST'],
          avgCgpa: 3.45,
          attendanceRate: 91,
          enrollmentDate: '2023-04-10',
          regPrefix: '22'
        },
        {
          id: 'BATCH-04',
          code: 'B04',
          name: 'Batch 04 (2023/2024)',
          academicYear: '2023/2024',
          currentSemester: 'Semester 3 (2nd Year)',
          status: 'Active',
          totalStudents: 240,
          ictStudents: 120,
          bstStudents: 120,
          coordinator: 'Dr. U.L. Abdul Majeed (HOD - BST)',
          departments: ['BICT', 'BST'],
          avgCgpa: 3.25,
          attendanceRate: 89,
          enrollmentDate: '2024-05-15',
          regPrefix: '23'
        },
        {
          id: 'BATCH-05',
          code: 'B05',
          name: 'Batch 05 (2024/2025)',
          academicYear: '2024/2025',
          currentSemester: 'Semester 1 (Freshers)',
          status: 'Active (Freshers)',
          totalStudents: 240,
          ictStudents: 120,
          bstStudents: 120,
          coordinator: 'Dr. S. Sabraz Nawaz (HOD - ICT)',
          departments: ['BICT', 'BST'],
          avgCgpa: 0.0,
          attendanceRate: 100,
          enrollmentDate: '2025-06-01',
          regPrefix: '24'
        }
      ];
      await Batch.insertMany(initial);
      batches = await Batch.find({}).sort({ createdAt: 1 }).lean();
    }

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving batches: ' + error.message });
  }
};

// @desc    Onboard a new intake batch to the database
// @route   POST /api/student/batches
exports.createBatch = async (req, res) => {
  try {
    const Batch = require('../models/Batch');
    const {
      id,
      code,
      name,
      academicYear,
      currentSemester,
      status,
      totalStudents,
      coordinator,
      departments,
      regPrefix,
      enrollmentDate
    } = req.body;

    if (!code || !name || !academicYear) {
      return res.status(400).json({ success: false, message: 'Batch Code, Name, and Academic Year are required.' });
    }

    const batchId = id || `BATCH-${Date.now()}`;
    const cleanCode = String(code).trim().toUpperCase();
    const cleanName = String(name).trim();
    const cleanYear = String(academicYear).trim();

    const newBatch = await Batch.findOneAndUpdate(
      { $or: [{ id: batchId }, { code: cleanCode }, { name: cleanName }] },
      {
        $set: {
          id: batchId,
          code: cleanCode,
          name: cleanName,
          academicYear: cleanYear,
          currentSemester: currentSemester || 'Semester 1 (Freshers)',
          status: status || 'Active (Freshers)',
          totalStudents: 0,
          ictStudents: 0,
          bstStudents: 0,
          coordinator: coordinator || 'Assigned by Faculty Board',
          departments: departments || ['BICT', 'BST'],
          avgCgpa: 0.0,
          attendanceRate: 100,
          enrollmentDate: enrollmentDate || new Date().toISOString().split('T')[0],
          regPrefix: regPrefix || cleanCode.slice(-2)
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: `Intake Batch ${cleanName} onboarded successfully to database.`,
      data: newBatch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ success: false, message: 'Failed to onboard batch: ' + error.message });
  }
};

// @desc    Delete an intake batch and remove all its enrolled students
// @route   DELETE /api/student/batches/:id
exports.deleteBatch = async (req, res) => {
  try {
    const Batch = require('../models/Batch');
    const User = require('../models/User');
    const store = require('../store');
    const batchId = decodeURIComponent(req.params.id);

    // Find the batch in DB
    const batch = await Batch.findOne({
      $or: [{ id: batchId }, { code: batchId }, { name: batchId }, ...(batchId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: batchId }] : [])]
    });

    const searchId = batch?.id || batchId;
    const searchCode = batch?.code || '';
    const searchName = batch?.name || '';
    const searchYear = batch?.academicYear || '';
    const searchPrefix = batch?.regPrefix || '';

    // Find all students enrolled in this batch
    const studentConditions = [
      { batchId: searchId },
      ...(searchName ? [{ batchCode: searchName }] : []),
      ...(searchYear ? [{ batch: searchYear }] : []),
    ];
    if (searchPrefix) {
      studentConditions.push(
        { studentId: new RegExp(`^(${searchPrefix}|SEU/IS/${searchPrefix}|24/)`, 'i') },
        { indexNo: new RegExp(`^(${searchPrefix}|SEU/IS/${searchPrefix}|24/)`, 'i') }
      );
    }

    const studentsToDelete = await Student.find({ $or: studentConditions }).lean();
    const emails = studentsToDelete.map(s => s.email?.toLowerCase()).filter(Boolean);
    const studentIds = studentsToDelete.map(s => s._id);

    // 1. Delete students from Student collection
    if (studentIds.length > 0) {
      await Student.deleteMany({ _id: { $in: studentIds } });
    }

    // 2. Delete student user accounts from User collection & memory store
    if (emails.length > 0) {
      await User.deleteMany({ email: { $in: emails } });
      for (const em of emails) {
        try {
          await store.users.delete(em);
        } catch (_) {}
      }
    }

    // 3. Delete the batch document
    if (batch) {
      await Batch.deleteOne({ _id: batch._id });
    } else {
      await Batch.deleteOne({ id: batchId });
    }

    res.status(200).json({
      success: true,
      message: `Batch "${batch?.name || batchId}" and ${studentsToDelete.length} enrolled student(s) successfully deleted from the database.`,
      deletedBatchId: batchId,
      deletedStudentsCount: studentsToDelete.length
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ success: false, message: 'Failed to delete batch: ' + error.message });
  }
};
