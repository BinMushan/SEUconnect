const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { HANDBOOK_SUBJECTS } = require('../config/subjectSeeder');
const { normalizeSemester, getCurriculumBySemester } = require('../config/curriculumTimetables');

/**
 * GET /api/subjects
 * Query subjects from MongoDB Atlas by semesterName, year, or code.
 */
router.get('/', async (req, res) => {
  try {
    const { semester, year, code } = req.query;
    const query = {};

    if (code) {
      query.code = String(code).toUpperCase().trim();
    } else if (semester) {
      const normalized = normalizeSemester(semester);
      query.semesterName = normalized;
    } else if (year) {
      query.year = Number(year);
    }

    let subjects = [];
    try {
      subjects = await Subject.find(query).sort({ code: 1 }).lean();
    } catch (_) {
      subjects = [];
    }

    // Fallback if database is syncing or querying offline
    if (!subjects || subjects.length === 0) {
      if (semester) {
        const normalized = normalizeSemester(semester);
        subjects = HANDBOOK_SUBJECTS.filter((s) => s.semesterName === normalized);
      } else if (year) {
        subjects = HANDBOOK_SUBJECTS.filter((s) => s.year === Number(year));
      } else if (code) {
        subjects = HANDBOOK_SUBJECTS.filter((s) => s.code === String(code).toUpperCase().trim());
      } else {
        subjects = HANDBOOK_SUBJECTS;
      }
    }

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve subjects', error: err.message });
  }
});

/**
 * GET /api/subjects/semester/:semester
 * Returns curriculum metadata, subjects, totalCredits, and aggregated timetable
 */
router.get('/semester/:semester', async (req, res) => {
  try {
    const rawSemester = req.params.semester;
    const normalized = normalizeSemester(rawSemester);
    const curriculum = getCurriculumBySemester(normalized);

    let dbSubjects = [];
    try {
      dbSubjects = await Subject.find({ semesterName: normalized }).sort({ code: 1 }).lean();
    } catch (_) {}

    if (!dbSubjects || dbSubjects.length === 0) {
      dbSubjects = HANDBOOK_SUBJECTS.filter((s) => s.semesterName === normalized);
    }

    // Calculate dynamic credits
    const totalCredits = dbSubjects.reduce((sum, s) => sum + (s.credits || s.gpaCredits || 0), 0);

    res.json({
      success: true,
      data: {
        semester: normalized,
        batch: curriculum.batch,
        totalCredits: totalCredits || curriculum.totalCredits,
        defaultSgpa: curriculum.defaultSgpa,
        defaultCgpa: curriculum.defaultCgpa,
        subjects: dbSubjects,
        timetable: curriculum.timetable,
        examModules: curriculum.examModules
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve semester curriculum', error: err.message });
  }
});

/**
 * GET /api/subjects/:code
 */
router.get('/:code', async (req, res) => {
  try {
    const code = String(req.params.code).toUpperCase().trim();
    let subject = await Subject.findOne({ code }).lean();
    if (!subject) {
      subject = HANDBOOK_SUBJECTS.find((s) => s.code === code);
    }
    if (!subject) {
      return res.status(404).json({ success: false, message: `Subject ${code} not found.` });
    }
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve subject', error: err.message });
  }
});

module.exports = router;
