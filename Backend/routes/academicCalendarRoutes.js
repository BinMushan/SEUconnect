const express = require('express');
const router = express.Router();
const academicCalendarController = require('../controllers/academicCalendarController');

// Academic Calendar Routes
router.get('/', academicCalendarController.getAcademicEvents);
router.post('/', academicCalendarController.createAcademicEvent);
router.put('/:id', academicCalendarController.updateAcademicEvent);
router.delete('/:id', academicCalendarController.deleteAcademicEvent);

module.exports = router;
