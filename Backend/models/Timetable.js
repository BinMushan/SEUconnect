const mongoose = require('mongoose');

const TimetableSlotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    timeSlot: { type: String, required: true },
    code: { type: String, required: true },
    name: { type: String, default: '' },
    lecturer: { type: String, default: '' },
    venue: { type: String, default: 'LH5' },
    type: { type: String, enum: ['Theory', 'Practical', 'Tutorial', 'Lab'], default: 'Theory' },
    color: { type: String, default: '#1e40af' },
    bg: { type: String, default: '#eff6ff' },
    border: { type: String, default: '#bfdbfe' },
  },
  { _id: false }
);

const TimetableSchema = new mongoose.Schema(
  {
    department: { type: String, default: 'Department of Information and Communication Technology' },
    programme: { type: String, default: 'BICT' },
    batch: { type: String, required: true, default: '2022/2023' },
    semester: { type: String, required: true }, // e.g. 'Year 1 Semester 1', 'Year 2 Semester 2'
    academicYear: { type: String, default: '2025/2026' },
    slots: [TimetableSlotSchema],
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
    lastUpdatedBy: { type: String, default: 'HOD' },
  },
  { timestamps: true }
);

TimetableSchema.index({ semester: 1, batch: 1, department: 1 });

module.exports = mongoose.model('Timetable', TimetableSchema);
