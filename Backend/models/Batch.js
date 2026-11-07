const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    currentSemester: { type: String, default: 'Semester 1 (Freshers)' },
    status: { type: String, default: 'Active (Freshers)' },
    totalStudents: { type: Number, default: 0 },
    ictStudents: { type: Number, default: 0 },
    bstStudents: { type: Number, default: 0 },
    coordinator: { type: String, default: 'Assigned by Faculty Board' },
    departments: { type: [String], default: ['BICT', 'BST'] },
    avgCgpa: { type: Number, default: 0.0 },
    attendanceRate: { type: Number, default: 100 },
    enrollmentDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    regPrefix: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
