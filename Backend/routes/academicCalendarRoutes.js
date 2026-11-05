const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const academicCalendarController = require('../controllers/academicCalendarController');

const EDITORS = ['hod', 'dean', 'admin', 'superadmin'];

router.use(authenticate);
router.get('/', academicCalendarController.getAcademicEvents);
router.post('/', authorize(...EDITORS), academicCalendarController.createAcademicEvent);
router.put('/:id', authorize(...EDITORS), academicCalendarController.updateAcademicEvent);
router.delete('/:id', authorize(...EDITORS), academicCalendarController.deleteAcademicEvent);

module.exports = router;
