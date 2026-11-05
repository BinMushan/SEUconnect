const mongoose = require('mongoose');

/**
 * Subject Schema - Represents individual academic course units from the Faculty Handbook
 * Stored separately in MongoDB Atlas so every student cohort (Year 1 Sem 1, Year 1 Sem 2,
 * Year 2 Sem 1, Year 2 Sem 2, Year 3 Sem 1, etc.) has database-driven subjects,
 * lecture hours, practical credits, CA/ESA weighting, and timetables.
 */
const SubjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      default: 'Department of Information and Communication Technology'
    },
    faculty: {
      type: String,
      default: 'Faculty of Technology'
    },
    degreeProgramme: {
      type: String,
      default: 'Bachelor of Information and Communication Technology (Honours)'
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      index: true
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 2,
      index: true
    },
    semesterName: {
      type: String,
      required: true,
      index: true // e.g. "Year 1 Semester 1", "Year 2 Semester 1"
    },
    gpaCredits: {
      type: Number,
      required: true,
      default: 2
    },
    ngpaCredits: {
      type: Number,
      default: 0
    },
    credits: {
      type: Number,
      required: true,
      default: 2
    },
    lectureHoursPerWeek: {
      type: Number,
      default: 2
    },
    practicalHoursPerWeek: {
      type: Number,
      default: 0
    },
    continuousAssessmentPercent: {
      type: Number,
      default: 40 // CA %
    },
    endSemesterAssessmentPercent: {
      type: Number,
      default: 60 // ESA %
    },
    category: {
      type: String,
      enum: ['Compulsory', 'Elective', 'Auxiliary', 'Core'],
      default: 'Compulsory'
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical', 'Project', 'Industrial Training'],
      default: 'Theory'
    },
    lecturer: {
      type: String,
      default: 'Faculty of Technology Academic Staff'
    },
    timetableSlots: [
      {
        day: { type: String, required: true }, // 'Monday', 'Tuesday', ...
        startTime: { type: String, required: true }, // '08:30'
        endTime: { type: String, required: true }, // '10:30'
        hall: { type: String, default: 'Tech Lecture Hall TL-1' },
        type: { type: String, enum: ['Lecture', 'Practical', 'Tutorial'], default: 'Lecture' },
        lecturer: { type: String, default: 'Faculty Staff' }
      }
    ],
    examSchedule: {
      examDate: { type: String, default: '' },
      examTime: { type: String, default: '' },
      hall: { type: String, default: 'Faculty Examination Hall A' },
      seatNo: { type: String, default: 'A-01' }
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

// Compound index for querying subjects by year and semester
SubjectSchema.index({ year: 1, semester: 1 });
SubjectSchema.index({ semesterName: 1 });

module.exports = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

