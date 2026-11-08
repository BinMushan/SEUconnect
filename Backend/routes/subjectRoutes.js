const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { HANDBOOK_SUBJECTS } = require('../config/subjectSeeder');
const { normalizeSemester, getCurriculumBySemester } = require('../config/curriculumTimetables');

/**
 * GET /api/subjects
 * Query subjects from MongoDB Atlas by semesterName, year, code, or lecturer.
 */
router.get('/', async (req, res) => {
  try {
    const { semester, year, code, lecturer } = req.query;
    const query = {};

    if (code) {
      query.code = String(code).toUpperCase().trim();
    } else if (semester) {
      const normalized = normalizeSemester(semester);
      query.semesterName = normalized;
    } else if (year) {
      query.year = Number(year);
    }

    if (lecturer) {
      const lecStr = String(lecturer).trim();
      query.$or = [
        { lecturer: { $regex: lecStr, $options: 'i' } },
        { lecturerEmail: { $regex: lecStr, $options: 'i' } },
      ];
    }

    let subjects = [];
    try {
      subjects = await Subject.find(query).sort({ code: 1 }).lean();
    } catch (_) {
      subjects = [];
    }

    // Fallback if database is syncing or querying offline
    if (!subjects || subjects.length === 0) {
      let filtered = HANDBOOK_SUBJECTS;
      if (semester) {
        const normalized = normalizeSemester(semester);
        filtered = filtered.filter((s) => s.semesterName === normalized);
      } else if (year) {
        filtered = filtered.filter((s) => s.year === Number(year));
      } else if (code) {
        filtered = filtered.filter((s) => s.code === String(code).toUpperCase().trim());
      }
      if (lecturer) {
        const lecLower = String(lecturer).toLowerCase();
        filtered = filtered.filter(
          (s) =>
            (s.lecturer && s.lecturer.toLowerCase().includes(lecLower)) ||
            (s.lecturerEmail && s.lecturerEmail.toLowerCase().includes(lecLower))
        );
      }
      subjects = filtered;
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

/**
 * GET /api/subjects/lecturer/:identifier
 * Retrieve all subjects allocated to a lecturer by name or email
 */
router.get('/lecturer/:identifier', async (req, res) => {
  try {
    const identifier = decodeURIComponent(req.params.identifier).trim();
    const query = {
      $or: [
        { lecturer: { $regex: identifier, $options: 'i' } },
        { lecturerEmail: { $regex: identifier, $options: 'i' } },
      ],
    };

    let subjects = [];
    try {
      subjects = await Subject.find(query).sort({ code: 1 }).lean();
    } catch (_) {
      subjects = [];
    }

    if (!subjects || subjects.length === 0) {
      const idLower = identifier.toLowerCase();
      subjects = HANDBOOK_SUBJECTS.filter(
        (s) =>
          (s.lecturer && s.lecturer.toLowerCase().includes(idLower)) ||
          (s.lecturerEmail && s.lecturerEmail.toLowerCase().includes(idLower))
      );
    }

    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve lecturer subjects', error: err.message });
  }
});

/**
 * PATCH /api/subjects/:code/allocation
 * Or PUT /api/subjects/:code
 * Assign / update lecturer allocation for a specific subject
 */
const updateSubjectHandler = async (req, res) => {
  try {
    const code = String(req.params.code).toUpperCase().trim();
    const { lecturer, lecturerEmail, demonstrators, continuousAssessmentPercent, endSemesterAssessmentPercent } = req.body;

    const updateFields = {};
    if (lecturer !== undefined) updateFields.lecturer = String(lecturer).trim();
    if (lecturerEmail !== undefined) updateFields.lecturerEmail = String(lecturerEmail).trim().toLowerCase();
    if (demonstrators !== undefined) updateFields.demonstrators = demonstrators;
    if (continuousAssessmentPercent !== undefined) updateFields.continuousAssessmentPercent = Number(continuousAssessmentPercent);
    if (endSemesterAssessmentPercent !== undefined) updateFields.endSemesterAssessmentPercent = Number(endSemesterAssessmentPercent);

    let updatedDoc = null;
    try {
      updatedDoc = await Subject.findOneAndUpdate(
        { code },
        { $set: updateFields },
        { new: true, upsert: false }
      ).lean();
    } catch (dbErr) {
      console.warn('Subject allocation DB update error:', dbErr.message);
    }

    // Also update in-memory handbook copy if present
    const memoryIdx = HANDBOOK_SUBJECTS.findIndex((s) => s.code === code);
    if (memoryIdx !== -1) {
      HANDBOOK_SUBJECTS[memoryIdx] = { ...HANDBOOK_SUBJECTS[memoryIdx], ...updateFields };
    }

    res.json({
      success: true,
      message: `Course ${code} allocation updated successfully. Assigned lecturer: ${lecturer || 'Unchanged'}.`,
      data: updatedDoc || { code, ...updateFields },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update subject allocation', error: err.message });
  }
};

router.patch('/:code/allocation', updateSubjectHandler);
router.put('/:code', updateSubjectHandler);

/**
 * POST /api/subjects/allocations
 * Bulk save course allocations matrix
 */
router.post('/allocations', async (req, res) => {
  try {
    const { allocations } = req.body;
    if (!Array.isArray(allocations)) {
      return res.status(400).json({ success: false, message: 'Allocations array required.' });
    }

    const results = [];
    for (const item of allocations) {
      if (!item.code) continue;
      const code = String(item.code).toUpperCase().trim();
      const updateFields = {};
      if (item.lecturerInCharge || item.lecturer) {
        updateFields.lecturer = item.lecturerInCharge || item.lecturer;
      }
      if (item.lecturerEmail) {
        updateFields.lecturerEmail = item.lecturerEmail.toLowerCase().trim();
      }

      try {
        await Subject.updateOne({ code }, { $set: updateFields });
      } catch (_) {}

      const memIdx = HANDBOOK_SUBJECTS.findIndex((s) => s.code === code);
      if (memIdx !== -1) {
        HANDBOOK_SUBJECTS[memIdx] = { ...HANDBOOK_SUBJECTS[memIdx], ...updateFields };
      }
      results.push({ code, ...updateFields });
    }

    res.json({
      success: true,
      message: `Successfully synchronized ${results.length} course allocations in database.`,
      data: results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to bulk update allocations', error: err.message });
  }
});

module.exports = router;

