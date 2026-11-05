const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const ClassSessionSchema = new Schema(
  {
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    type: { type: String, enum: ['lecture', 'lab', 'tutorial', 'seminar', 'other'], default: 'lecture' },
    title: { type: String, default: '', trim: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    conductedBy: ref('Staff', { default: null }),
    // scheduled until attendance is marked; cancelled sessions never count in percentages
    status: { type: String, enum: ['scheduled', 'conducted', 'cancelled'], default: 'scheduled', index: true },
    cancelReason: { type: String, default: '' },
    createdBy: ref('User'),
  },
  { timestamps: true }
);
ClassSessionSchema.index({ offering: 1, componentType: 1, startsAt: 1 });

const AttendanceRecordSchema = new Schema(
  {
    session: ref('ClassSession', { required: true, index: true }),
    student: ref('Student', { required: true, index: true }),
    offering: ref('CourseOffering', { required: true, index: true }), // denormalised for summaries
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    status: { type: String, enum: ['present', 'absent', 'excused'], required: true },
    markedBy: ref('User'),
    markedAt: { type: Date, default: Date.now },
    // every modification is kept
    history: [{ _id: false, status: String, at: { type: Date, default: Date.now }, by: ref('User'), reason: String }],
  },
  { timestamps: true }
);
AttendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });
AttendanceRecordSchema.index({ student: 1, offering: 1 });

const AttendanceCorrectionRequestSchema = new Schema(
  {
    record: ref('AttendanceRecord', { required: true }),
    session: ref('ClassSession', { required: true }),
    student: ref('Student', { required: true, index: true }),
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    currentStatus: { type: String, enum: ['present', 'absent', 'excused'], required: true },
    requestedStatus: { type: String, enum: ['present', 'absent', 'excused'], required: true },
    reason: { type: String, required: true, trim: true },
    requestedBy: ref('User'),
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    decidedBy: ref('User'),
    decidedAt: Date,
    decisionRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);
// only one open correction per record at a time
AttendanceCorrectionRequestSchema.index({ record: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = {
  ClassSession: model('ClassSession', ClassSessionSchema),
  AttendanceRecord: model('AttendanceRecord', AttendanceRecordSchema),
  AttendanceCorrectionRequest: model('AttendanceCorrectionRequest', AttendanceCorrectionRequestSchema),
};
