const mongoose = require('mongoose');

const AcademicEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'semester_boundary',
        'lecture_period',
        'assessment_ca',
        'study_leave',
        'end_semester_exam',
        'exam_form_submission',
        'medical_submission_deadline',
        'results_release',
        'vacation',
        'public_holiday',
        'department_event',
        'other',
      ],
      default: 'department_event',
    },
    batch: {
      type: String,
      required: true,
      // Standard batch format: later-year/earlier-year or All Batches
      enum: ['2025/2024', '2024/2023', '2023/2022', '2022/2021', '2021/2020', 'All Batches'],
      default: 'All Batches',
    },
    semester: {
      type: String,
      enum: ['Semester 1', 'Semester 2', 'All Semesters'],
      default: 'Semester 1',
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      enum: ['faculty', 'department'],
      default: 'department',
    },
    department: {
      type: String,
      enum: ['ICT', 'BST', 'Faculty'],
      default: 'ICT',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      name: { type: String, default: 'M.J Ahamed Sabani' },
      role: { type: String, default: 'hod' },
      email: { type: String, default: 'sabani@seu.ac.lk' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AcademicEvent', AcademicEventSchema);
