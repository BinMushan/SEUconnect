const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

// A live allocation is one that currently counts (provisional until published, then published).
const LIVE = ['provisional', 'published'];

// Application window for one programme + batch (BICT: SWT/NST, BBST: majoring divisions).
const AllocationRoundSchema = new Schema(
  {
    programme: ref('DegreeProgramme', { required: true, index: true }),
    batch: ref('AcademicBatch', { required: true, index: true }),
    kind: { type: String, enum: ['specialization', 'majoring'], required: true },
    name: { type: String, trim: true },
    opensAt: { type: Date, default: null },
    closesAt: { type: Date, default: null },
    // Snapshot of programme.specializationStarts: applicants must have reached this year/semester.
    startsAt: { year: { type: Number, default: 3 }, semester: { type: Number, default: 1 } },
    status: { type: String, enum: ['draft', 'open', 'closed', 'published'], default: 'draft', index: true },
    createdBy: ref('User'),
    publishedAt: Date,
  },
  { timestamps: true }
);

const SpecializationCapacitySchema = new Schema(
  {
    specialization: ref('Specialization', { required: true }),
    batch: ref('AcademicBatch', { required: true }),
    seats: { type: Number, required: true, min: 0 },
    // Touched on every seat-consuming write so concurrent transactions on the same capacity serialise.
    revision: { type: Number, default: 0 },
    setBy: ref('User'),
  },
  { timestamps: true }
);
SpecializationCapacitySchema.index({ specialization: 1, batch: 1 }, { unique: true });

const SpecializationApplicationSchema = new Schema(
  {
    student: ref('Student', { required: true, index: true }),
    round: ref('AllocationRound', { required: true, index: true }),
    programme: ref('DegreeProgramme', { required: true }),
    batch: ref('AcademicBatch', { required: true }),
    kind: { type: String, enum: ['specialization', 'majoring'], required: true },
    preferences: [{ _id: false, rank: { type: Number, required: true, min: 1 }, specialization: ref('Specialization', { required: true }) }],
    // Academic performance as RECORDED (read from a published GPARecord when one exists, or entered by an officer).
    academic: {
      metrics: { type: Schema.Types.Mixed, default: {} },
      source: { type: String, enum: ['none', 'GPARecord', 'supplied'], default: 'none' },
      recordedAt: Date,
      recordedBy: ref('User'),
      note: String,
    },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['submitted', 'withdrawn'], default: 'submitted', index: true },
    // Earlier preference lists are kept when a student amends the application while the round is open.
    history: [{ _id: false, preferences: [Schema.Types.Mixed], at: Date }],
  },
  { timestamps: true }
);
SpecializationApplicationSchema.index({ student: 1, round: 1 }, { unique: true });

const AllocationRunSchema = new Schema(
  {
    round: ref('AllocationRound', { required: true, index: true }),
    programme: ref('DegreeProgramme', { required: true }),
    batch: ref('AcademicBatch', { required: true }),
    kind: { type: String, enum: ['specialization', 'majoring'], required: true },
    status: { type: String, enum: ['provisional', 'published', 'discarded'], default: 'provisional', index: true },
    // Everything needed to replay / audit the run: the exact policy values that were applied.
    policySnapshot: { type: Schema.Types.Mixed, default: {} },
    capacitySnapshot: { type: Schema.Types.Mixed, default: {} },
    result: { type: Schema.Types.Mixed, default: {} },
    summary: { type: Schema.Types.Mixed, default: {} },
    createdBy: ref('User'),
    publishedBy: ref('User'),
    publishedAt: Date,
  },
  { timestamps: true }
);

const SpecializationAllocationSchema = new Schema(
  {
    student: ref('Student', { required: true }), // no plain index: the partial unique index below owns the name student_1
    specialization: ref('Specialization', { required: true, index: true }),
    round: ref('AllocationRound', { default: null }),
    run: ref('AllocationRun', { default: null }),
    programme: ref('DegreeProgramme', { required: true }),
    batch: ref('AcademicBatch', { required: true, index: true }),
    status: { type: String, enum: ['provisional', 'published', 'superseded'], required: true, index: true },
    source: { type: String, enum: ['run', 'manual_change'], default: 'run' },
    rank: Number,
    score: Number,
    preferenceRank: Number,
    decidedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, default: null },
    supersededAt: Date,
    supersededReason: String,
  },
  { timestamps: true }
);
// A student can have at most ONE live allocation - enforced by the database.
SpecializationAllocationSchema.index({ student: 1 }, { unique: true, partialFilterExpression: { status: { $in: LIVE } } });
SpecializationAllocationSchema.index({ specialization: 1, batch: 1, status: 1 });

// A request for a manual change (mutable status). The approved outcome is recorded in AllocationChange.
const AllocationChangeRequestSchema = new Schema(
  {
    student: ref('Student', { required: true }),
    from: ref('Specialization', { default: null }),
    to: ref('Specialization', { required: true }),
    requestReason: { type: String, required: true, trim: true },
    attachments: [String], // attachment ids held by the attachments module
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    requestedBy: ref('User'),
    requestedAt: { type: Date, default: Date.now },
    decidedBy: ref('User'),
    decidedAt: Date,
    decisionReason: { type: String, default: '' },
    change: ref('AllocationChange', { default: null }),
  },
  { timestamps: true }
);
AllocationChangeRequestSchema.index({ student: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

// Append-only history of every manual change: the original allocation is never overwritten.
const AllocationChangeSchema = new Schema(
  {
    student: ref('Student', { required: true, index: true }),
    previousAllocation: ref('SpecializationAllocation', { default: null }),
    newAllocation: ref('SpecializationAllocation', { required: true }),
    previous: ref('Specialization', { default: null }),
    new: ref('Specialization', { required: true }),
    requestReason: { type: String, default: '' },
    decisionReason: { type: String, required: true },
    authorisedBy: { user: ref('User'), name: String, email: String, role: String },
    approvedAt: { type: Date, default: Date.now },
    attachments: [String],
    changeRequest: ref('AllocationChangeRequest', { default: null }),
    via: { type: String, enum: ['change_request', 'generic_request'], default: 'change_request' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
const forbid = function forbidMutation() {
  throw new Error('Allocation change history is append-only.');
};
['updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndReplace', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete'].forEach((op) => AllocationChangeSchema.pre(op, forbid));
AllocationChangeSchema.pre('save', function onlyNew() {
  if (!this.isNew) throw new Error('Allocation change history is append-only.');
});

module.exports = {
  LIVE,
  AllocationRound: model('AllocationRound', AllocationRoundSchema),
  SpecializationCapacity: model('SpecializationCapacity', SpecializationCapacitySchema),
  SpecializationApplication: model('SpecializationApplication', SpecializationApplicationSchema),
  AllocationRun: model('AllocationRun', AllocationRunSchema),
  SpecializationAllocation: model('SpecializationAllocation', SpecializationAllocationSchema),
  AllocationChangeRequest: model('AllocationChangeRequest', AllocationChangeRequestSchema),
  AllocationChange: model('AllocationChange', AllocationChangeSchema),
};
