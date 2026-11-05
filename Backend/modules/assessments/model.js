const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const STATUS_HISTORY = [{ _id: false, status: String, at: { type: Date, default: Date.now }, by: ref('User'), reason: String }];

// Marks correction of a LOCKED assessment: requested, then decided by an approver; the old value is kept.
const CorrectionSchema = new Schema(
  {
    student: ref('Student', { required: true }),
    newMarks: { type: Number, default: null },
    newAbsent: { type: Boolean, default: false },
    reason: { type: String, required: true },
    requestedBy: ref('User'),
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    decidedBy: ref('User'),
    decidedAt: Date,
    decisionRemarks: String,
  },
  { _id: true }
);

// A continuous-assessment activity of one component of a course offering.
const AssessmentSchema = new Schema(
  {
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['assignment', 'quiz', 'midterm', 'presentation', 'practical', 'lab_report', 'project', 'other'], default: 'assignment' },
    maxMarks: { type: Number, required: true, min: 0.0001 },
    weight: { type: Number, required: true, min: 0.0001 }, // relative weight inside the component's CA
    deadline: { type: Date, default: null },
    assignedStaff: ref('Staff', { default: null }),
    status: { type: String, enum: ['draft', 'open', 'submitted', 'verified', 'approved', 'locked'], default: 'draft', index: true },
    statusHistory: STATUS_HISTORY,
    corrections: [CorrectionSchema],
    createdBy: ref('User'),
  },
  { timestamps: true }
);
AssessmentSchema.index({ offering: 1, componentType: 1, name: 1 }, { unique: true });

const StudentAssessmentMarkSchema = new Schema(
  {
    assessment: ref('Assessment', { required: true, index: true }),
    student: ref('Student', { required: true, index: true }),
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    marks: { type: Number, default: null, min: 0 },
    absent: { type: Boolean, default: false }, // explicit "did not attempt": counts as zero, never inferred
    enteredBy: ref('User'),
    history: [{ _id: false, marks: Number, absent: Boolean, at: { type: Date, default: Date.now }, by: ref('User'), reason: String }],
  },
  { timestamps: true }
);
StudentAssessmentMarkSchema.index({ assessment: 1, student: 1 }, { unique: true });

module.exports = {
  Assessment: model('Assessment', AssessmentSchema),
  StudentAssessmentMark: model('StudentAssessmentMark', StudentAssessmentMarkSchema),
};
