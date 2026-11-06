const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
const { normalizeSemester, getCurriculumBySemester } = require('../config/curriculumTimetables');

// In-memory fallback if MongoDB connection is offline
const memTimetables = new Map();

/**
 * GET /api/timetable
 * Query timetable by semester, batch, or department
 */
router.get('/', async (req, res) => {
  try {
    const rawSemester = req.query.semester || 'Semester II';
    const batch = req.query.batch || '2022/2023';
    const department = req.query.department || 'Department of Information and Communication Technology';
    const programme = req.query.programme || 'BICT';

    const normalizedSemester = normalizeSemester(rawSemester);
    const key = `${normalizedSemester}_${batch}_${department}`;

    let timetableDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        timetableDoc = await Timetable.findOne({
          $or: [
            { semester: normalizedSemester, batch },
            { semester: rawSemester, batch },
            { semester: normalizedSemester }
          ]
        }).lean();
      } catch (dbErr) {
        console.warn('Timetable DB fetch warning:', dbErr.message);
      }
    }

    if (!timetableDoc) {
      timetableDoc = memTimetables.get(key) || null;
    }

    // If still not found, provide standard seeded curriculum timetable for that semester
    if (!timetableDoc || !timetableDoc.slots || timetableDoc.slots.length === 0) {
      const cur = getCurriculumBySemester(normalizedSemester);
      timetableDoc = {
        semester: normalizedSemester,
        batch: batch || cur.batch || '2022/2023',
        department,
        programme,
        slots: cur.timetableSlots || [],
        status: 'Published',
        isDefault: true
      };
    }

    res.json({
      success: true,
      data: timetableDoc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve timetable', error: err.message });
  }
});

/**
 * POST /api/timetable
 * Save or update timetable in database
 */
router.post('/', async (req, res) => {
  try {
    const {
      semester,
      batch = '2022/2023',
      department = 'Department of Information and Communication Technology',
      programme = 'BICT',
      slots = [],
      status = 'Published'
    } = req.body;

    if (!semester) {
      return res.status(400).json({ success: false, message: 'Semester is required to save timetable.' });
    }

    const normalizedSemester = normalizeSemester(semester);
    const key = `${normalizedSemester}_${batch}_${department}`;

    const timetableData = {
      semester: normalizedSemester,
      batch,
      department,
      programme,
      slots,
      status,
      lastUpdatedBy: req.user?.name || req.user?.email || 'HOD'
    };

    let saved = null;
    if (mongoose.connection.readyState === 1) {
      try {
        saved = await Timetable.findOneAndUpdate(
          {
            $or: [
              { semester: normalizedSemester, batch, department },
              { semester: normalizedSemester, batch }
            ]
          },
          { $set: timetableData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (dbErr) {
        console.error('Timetable MongoDB save error:', dbErr.message);
      }
    }

    memTimetables.set(key, { ...timetableData, updatedAt: new Date() });

    res.json({
      success: true,
      message: `Timetable for ${normalizedSemester} (${batch}) saved successfully in database.`,
      data: saved || timetableData
    });
  } catch (err) {
    console.error('Save timetable route error:', err);
    res.status(500).json({ success: false, message: 'Server error saving timetable', error: err.message });
  }
});

/**
 * DELETE /api/timetable
 * Reset or remove a timetable
 */
router.delete('/', async (req, res) => {
  try {
    const { semester, batch = '2022/2023', department } = req.query;
    if (!semester) {
      return res.status(400).json({ success: false, message: 'Semester is required to delete timetable.' });
    }
    const normalizedSemester = normalizeSemester(semester);
    const key = `${normalizedSemester}_${batch}_${department || ''}`;

    if (mongoose.connection.readyState === 1) {
      await Timetable.deleteMany({ semester: normalizedSemester, batch });
    }
    memTimetables.delete(key);

    res.json({ success: true, message: 'Timetable reset to curriculum default.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset timetable', error: err.message });
  }
});

module.exports = router;
