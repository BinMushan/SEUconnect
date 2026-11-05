const mongoose = require('mongoose');
const { Schema } = mongoose;

const LIVE = ['pending', 'approved'];

const SubjectRegistrationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    offering: { type: Schema.Types.ObjectId, ref: 'CourseOffering', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    credits: { type: Number, required: true }, // snapshot at registration time
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'dropped', 'cancelled'], default: 'pending', index: true },
    kind: { type: String, enum: ['registration', 'add'], default: 'registration' },
    exception: {
      requested: { type: Boolean, default: false },
      reasons: [String], // which rules the student asks to be excused from
      note: { type: String, default: '' },
      approvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    requestedAt: { type: Date, default: Date.now },
    decidedAt: Date,
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    decisionRemarks: { type: String, default: '' },
    history: [{ _id: false, status: String, at: { type: Date, default: Date.now }, by: { type: Schema.Types.ObjectId, ref: 'User' }, note: String }],
  },
  { timestamps: true }
);
// A student can hold only one live registration per offering - enforced by the database, not just code.
SubjectRegistrationSchema.index({ student: 1, offering: 1 }, { unique: true, partialFilterExpression: { status: { $in: LIVE } } });
SubjectRegistrationSchema.index({ student: 1, semester: 1, status: 1 });

module.exports = { LIVE, SubjectRegistration: mongoose.models.SubjectRegistration || mongoose.model('SubjectRegistration', SubjectRegistrationSchema) };
