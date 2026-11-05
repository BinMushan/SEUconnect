const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const DepartmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // DICT, DBST
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    head: ref('User', { default: null }),
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

const DegreeProgrammeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // BICT, BBST
    name: { type: String, required: true, trim: true },
    department: ref('Department', { required: true, index: true }),
    durationYears: { type: Number, default: 4, min: 1, max: 8 },
    semestersPerYear: { type: Number, default: 2, min: 1, max: 4 },
    // The point at which students choose a specialization / majoring division.
    specializationStarts: { year: { type: Number, default: 3 }, semester: { type: Number, default: 1 } },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

// kind: 'specialization' (BICT: SWT / NST) or 'majoring' (BBST: AAT / AEE / BSE / CST / FST)
const SpecializationSchema = new Schema(
  {
    programme: ref('DegreeProgramme', { required: true, index: true }),
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ['specialization', 'majoring'], required: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);
SpecializationSchema.index({ programme: 1, code: 1 }, { unique: true });

const AcademicBatchSchema = new Schema(
  {
    programme: ref('DegreeProgramme', { required: true, index: true }),
    intakeYear: { type: Number, required: true, min: 1990, max: 2200 },
    label: { type: String, trim: true },
    currentAcademicYear: { type: Number, default: 1, min: 1, max: 8 },
    status: { type: String, enum: ['active', 'graduated', 'archived'], default: 'active' },
  },
  { timestamps: true }
);
AcademicBatchSchema.index({ programme: 1, intakeYear: 1 }, { unique: true });

const AcademicYearSchema = new Schema(
  {
    label: { type: String, required: true, unique: true, trim: true }, // 2025/2026
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['planned', 'current', 'closed', 'archived'], default: 'planned' },
  },
  { timestamps: true }
);

const SemesterSchema = new Schema(
  {
    academicYear: ref('AcademicYear', { required: true, index: true }),
    number: { type: Number, required: true, min: 1, max: 4 },
    name: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationOpens: Date,
    registrationCloses: Date,
    addDropOpens: Date,
    addDropCloses: Date,
    status: { type: String, enum: ['draft', 'open', 'running', 'closed', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);
SemesterSchema.index({ academicYear: 1, number: 1 }, { unique: true });

module.exports = {
  Department: model('Department', DepartmentSchema),
  DegreeProgramme: model('DegreeProgramme', DegreeProgrammeSchema),
  Specialization: model('Specialization', SpecializationSchema),
  AcademicBatch: model('AcademicBatch', AcademicBatchSchema),
  AcademicYear: model('AcademicYear', AcademicYearSchema),
  Semester: model('Semester', SemesterSchema),
};
