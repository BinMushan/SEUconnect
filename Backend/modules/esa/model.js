const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

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

// An end-semester examination of ONE component (theory or practical) of an offering. Several formats may exist per component.
const ESAScheduleSchema = new Schema(
  {
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    format: { type: String, enum: ['written', 'practical', 'oral', 'other'], required: true },
    title: { type: String, default: '', trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    venue: { type: String, required: true, trim: true },
    maxMarks: { type: Number, default: 100, min: 0.0001 },
    invigilators: [ref('Staff')],
    status: { type: String, enum: ['scheduled', 'open', 'submitted', 'verified', 'approved', 'locked', 'cancelled'], default: 'scheduled', index: true },
    statusHistory: [{ _id: false, status: String, at: { type: Date, default: Date.now }, by: ref('User'), reason: String }],
    corrections: [CorrectionSchema],
    createdBy: ref('User'),
  },
  { timestamps: true }
);
ESAScheduleSchema.index({ date: 1, venue: 1 });

const ESAMarkSchema = new Schema(
  {
    schedule: ref('ESASchedule', { required: true, index: true }),
    student: ref('Student', { required: true, index: true }),
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    marks: { type: Number, default: null, min: 0 },
    absent: { type: Boolean, default: false },
    // eligibility recorded when the mark was entered (from attendance policy); override needs a reason
    eligibility: { type: String, default: 'unknown' },
    eligibilityOverride: { reason: { type: String, default: '' }, by: ref('User', { default: null }) },
    enteredBy: ref('User'),
    history: [{ _id: false, marks: Number, absent: Boolean, at: { type: Date, default: Date.now }, by: ref('User'), reason: String }],
  },
  { timestamps: true }
);
ESAMarkSchema.index({ schedule: 1, student: 1 }, { unique: true });

module.exports = { ESASchedule: model('ESASchedule', ESAScheduleSchema), ESAMark: model('ESAMark', ESAMarkSchema) };
