const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const FIELD_TYPES = ['string', 'text', 'number', 'boolean', 'date', 'objectId', 'enum'];

// A kind of request (e.g. subject add/drop). Its approval chain lives in ApprovalWorkflow, never in code.
const RequestTypeSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z][a-z0-9_]{2,60}$/ },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // Describes (and validates) the payload a requester has to supply.
    fields: [
      {
        _id: false,
        name: { type: String, required: true, match: /^[A-Za-z][A-Za-z0-9_]{0,40}$/ },
        label: { type: String, default: '' },
        type: { type: String, enum: FIELD_TYPES, default: 'string' },
        required: { type: Boolean, default: false },
        options: [String],
      },
    ],
    active: { type: Boolean, default: true },
    // true while the approval policy for this request type has not been confirmed by the Faculty.
    pendingConfirmation: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ordered approval steps. scope says which part of the organisation the approver must belong to:
//   faculty    - any holder of the role
//   department - the role holder must belong to the department of the request (faculty-level roles may act anywhere)
//   assigned   - the role holder must be actively assigned to payload.offering
const ApprovalWorkflowSchema = new Schema(
  {
    requestType: { type: String, required: true, index: true },
    department: ref('Department', { default: null }), // null = default workflow for every department
    name: { type: String, default: '' },
    steps: [
      {
        _id: false,
        order: { type: Number, required: true, min: 1 },
        label: { type: String, required: true },
        role: { type: String, required: true, lowercase: true },
        scope: { type: String, enum: ['faculty', 'department', 'assigned'], default: 'department' },
        required: { type: Boolean, default: true },
      },
    ],
    version: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    createdBy: ref('User'),
  },
  { timestamps: true }
);
ApprovalWorkflowSchema.index({ requestType: 1, department: 1, active: 1 });

const RequestSchema = new Schema(
  {
    type: { type: String, required: true, index: true },
    requester: ref('User', { required: true, index: true }),
    student: ref('Student', { default: null }),
    department: ref('Department', { default: null, index: true }),
    description: { type: String, default: '' },
    payload: { type: Schema.Types.Mixed, default: {} },
    attachments: [ref('Attachment')],
    status: { type: String, enum: ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled', 'withdrawn'], default: 'draft', index: true },
    // Snapshot of the workflow at submission: later workflow edits never change requests already in flight.
    workflow: { id: ref('ApprovalWorkflow'), version: Number },
    steps: [{ _id: false, order: Number, label: String, role: String, scope: String, required: Boolean }],
    currentStep: { type: Number, default: 0 },
    currentRole: { type: String, default: '', index: true },
    submittedAt: Date,
    finalDecisionAt: Date,
    decisionRemarks: { type: String, default: '' },
    history: [{ _id: false, action: String, by: ref('User'), at: { type: Date, default: Date.now }, step: Number, note: String }],
  },
  { timestamps: true }
);
RequestSchema.index({ status: 1, currentRole: 1 });

// Append-only record of every approval decision.
const ApprovalRecordSchema = new Schema(
  {
    request: ref('Request', { required: true, index: true }),
    step: { type: Number, required: true },
    stepLabel: String,
    role: String,
    approver: ref('User', { required: true }),
    decision: { type: String, enum: ['approve', 'reject', 'return'], required: true },
    remarks: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);
const forbid = function forbidMutation() {
  throw new Error('Approval records are immutable.');
};
['updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndReplace', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete'].forEach((op) => ApprovalRecordSchema.pre(op, forbid));
ApprovalRecordSchema.pre('save', function onlyNew() {
  if (!this.isNew) throw new Error('Approval records are immutable.');
});

module.exports = {
  FIELD_TYPES,
  RequestType: model('RequestType', RequestTypeSchema),
  ApprovalWorkflow: model('ApprovalWorkflow', ApprovalWorkflowSchema),
  Request: model('Request', RequestSchema),
  ApprovalRecord: model('ApprovalRecord', ApprovalRecordSchema),
};
