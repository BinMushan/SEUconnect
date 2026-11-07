const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const { authenticate, authorize } = require('../middleware/auth');
const studentController = require('../controller/studentController');

const STAFF = ['lecturer', 'hod', 'dean', 'sar', 'examination', 'dept_ma', 'fma', 'admin', 'superadmin'];

router.use(authenticate);

// Student records live in MongoDB with graceful fallback
router.use((req, res, next) => {
  next();
});

// Students may only read / update their own record; staff may access any record.
const ownRecordOrStaff = async (req, res, next) => {
  if (STAFF.includes(req.user.role)) return next();
  const id = decodeURIComponent(req.params.identifier || req.query.id || req.query.studentId || req.query.indexNo || '');
  const conditions = [{ studentId: id }, { indexNo: id }, { email: id.toLowerCase() }];
  if (/^[0-9a-fA-F]{24}$/.test(id)) conditions.push({ _id: id });
  const record = await Student.findOne({ $or: conditions }).select('email');
  if (!record || record.email !== req.user.email) {
    return res.status(403).json({ success: false, message: 'You can only access your own student record.' });
  }
  next();
};

router.get('/batches', authorize(...STAFF), studentController.getAllBatches);
router.post('/batches', authorize('admin', 'superadmin'), studentController.createBatch);
router.delete('/batches/:id', authorize('admin', 'superadmin'), studentController.deleteBatch);

router.get('/', authorize(...STAFF), studentController.getAllStudents);
router.post('/bulk', authorize('admin', 'superadmin'), studentController.createStudentsBulk);
router.post('/', authorize('admin', 'superadmin'), studentController.createStudent);
router.put('/:identifier', authorize('admin', 'superadmin'), studentController.updateStudent);
router.delete('/:identifier', authorize('admin', 'superadmin'), studentController.deleteStudent);

router.get('/find', ownRecordOrStaff, (req, res) => {
  req.params.identifier = req.query.id || req.query.studentId || req.query.indexNo;
  return studentController.getStudentByIdentifier(req, res);
});

router.put('/:identifier/profile', ownRecordOrStaff, studentController.updateAcademicProfile);
router.get('/:identifier/attendance', ownRecordOrStaff, studentController.getStudentAttendance);
router.get('/:identifier/medical', ownRecordOrStaff, studentController.getStudentMedicalRequests);
router.post('/:identifier/medical', ownRecordOrStaff, studentController.submitMedicalRequest);
router.get('/:identifier/examinations', ownRecordOrStaff, studentController.getStudentExaminations);
router.get('/:identifier/results', ownRecordOrStaff, studentController.getStudentResults);
router.get('/:identifier/gpa', ownRecordOrStaff, studentController.getStudentGpa);
router.get('/:identifier/progress', ownRecordOrStaff, studentController.getStudentProgress);
router.post('/:identifier/register-courses', ownRecordOrStaff, studentController.registerSemesterCourses);
router.get('/:identifier', ownRecordOrStaff, studentController.getStudentByIdentifier);

module.exports = router;
