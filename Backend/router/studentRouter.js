const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');

// 1. List all students or create student
router.get('/', studentController.getAllStudents);
router.post('/', studentController.createStudent);

// 2. Query helper route (e.g. /api/student/find?id=2021/ICT/85)
router.get('/find', (req, res, next) => {
  if (req.query.id || req.query.studentId || req.query.indexNo) {
    req.params.identifier = req.query.id || req.query.studentId || req.query.indexNo;
    return studentController.getStudentByIdentifier(req, res);
  }
  next();
});

// 3. Section specific endpoints for a student
router.put('/:identifier/profile', studentController.updateAcademicProfile);
router.get('/:identifier/attendance', studentController.getStudentAttendance);
router.get('/:identifier/medical', studentController.getStudentMedicalRequests);
router.post('/:identifier/medical', studentController.submitMedicalRequest);
router.get('/:identifier/examinations', studentController.getStudentExaminations);
router.get('/:identifier/results', studentController.getStudentResults);
router.get('/:identifier/gpa', studentController.getStudentGpa);
router.get('/:identifier/progress', studentController.getStudentProgress);
router.post('/:identifier/register-courses', studentController.registerSemesterCourses);

// 4. Get full student document by identifier (studentId, indexNo, or _id)
router.get('/:identifier', studentController.getStudentByIdentifier);

module.exports = router;
