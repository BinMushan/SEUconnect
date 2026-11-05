const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

// Grading rules as data. Nothing here is a default: a policy must be created and approved by an authorised officer.
const GradePolicySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    scope: { programme: ref('DegreeProgramme', { default: null }) }, // null programme = faculty-wide
    bands: [{ _id: false, min: { type: Number, required: true }, max: { type: Number, required: true }, grade: { type: String, required: true }, gradePoint: { type: Number, required: true, min: 0 }, fail: { type: Boolean, default: false } }],
    rounding: { mode: { type: String, default: null }, decimals: { type: Number, default: null }, applyTo: [String] },
    passRule: { type: String, enum: ['all_components', 'course_mark_only'], default: 'all_components' },
    gpaRules: {
      repeatHandling: { type: String, enum: ['best', 'latest', 'all', null], default: null },
      excludeCourseTypes: [String],
      countFailedCredits: { type: Boolean, default: true },
      gpaDecimals: { type: Number, default: null },
      gpaRounding: { type: String, default: null },
    },
    status: { type: String, enum: ['draft', 'active', 'retired'], default: 'draft', index: true },
    notes: { type: String, default: '' },
    createdBy: ref('User'),
    approvedBy: ref('User', { default: null }),
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const GradeRecordSchema = new Schema(
  {
    student: ref('Student', { required: true, index: true }),
    course: ref('Course', { required: true, index: true }), // denormalised: used by registration for prerequisites
    offering: ref('CourseOffering', { required: true, index: true }),
    semester: ref('Semester', { required: true, index: true }),
    courseType: { type: String, enum: ['A', 'B', 'C'] },
    credits: { type: Number, required: true },
    attempt: { type: Number, default: 1 },
    includeInGpa: { type: Boolean, default: true },
    componentMarks: [{ _id: false, type: { type: String }, weightInCourse: Number, caPercent: Number, esaPercent: Number, mark: Number, caPassed: Boolean, esaPassed: Boolean, finalPassed: Boolean, passed: Boolean }],
    finalMark: { type: Number, default: null },
    grade: { type: String, default: null },
    gradePoint: { type: Number, default: null },
    passed: { type: Boolean, default: false },
    policy: ref('GradePolicy'),
    state: { type: String, enum: ['draft', 'submitted', 'verified', 'approved', 'published'], default: 'draft', index: true },
    stateHistory: [{ _id: false, state: String, at: { type: Date, default: Date.now }, by: ref('User'), note: String }],
    needsRecalculation: { type: Boolean, default: false }, // set when an approved mark was corrected after calculation
    calculatedAt: Date,
    publishedAt: Date,
    // published results are locked; they change only through an approved correction, and the old values are kept here
    corrections: [{ requestedBy: ref('User'), reason: String, requestedAt: { type: Date, default: Date.now }, status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, decidedBy: ref('User'), decidedAt: Date, decisionRemarks: String }],
    revisions: [{ _id: false, at: { type: Date, default: Date.now }, by: ref('User'), reason: String, finalMark: Number, grade: String, gradePoint: Number, passed: Boolean, componentMarks: Schema.Types.Mixed }],
  },
  { timestamps: true }
);
GradeRecordSchema.index({ student: 1, offering: 1 }, { unique: true });
GradeRecordSchema.index({ student: 1, course: 1, state: 1 });

const GPARecordSchema = new Schema(
  {
    student: ref('Student', { required: true, index: true }),
    scope: { type: String, enum: ['semester', 'cumulative'], required: true },
    semester: ref('Semester', { default: null }), // null for cumulative
    gpa: { type: Number, default: null },
    credits: { type: Number, default: 0 },
    counted: { type: Number, default: 0 },
    // 'outdated' while a published result is being corrected
    state: { type: String, enum: ['published', 'outdated'], default: 'published' },
    policy: ref('GradePolicy'),
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
GPARecordSchema.index({ student: 1, scope: 1, semester: 1 }, { unique: true });

module.exports = { GradePolicy: model('GradePolicy', GradePolicySchema), GradeRecord: model('GradeRecord', GradeRecordSchema), GPARecord: model('GPARecord', GPARecordSchema) };
