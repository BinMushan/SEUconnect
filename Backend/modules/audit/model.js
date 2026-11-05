const mongoose = require('mongoose');

// Append-only: ordinary code paths cannot edit or delete audit records.
const AuditLogSchema = new mongoose.Schema(
  {
    actor: { user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, email: String, name: String, role: String },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    reason: { type: String, default: '' },
    ip: String,
    at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false, versionKey: false, strict: true }
);

const forbid = function forbidMutation() {
  throw new Error('Audit records are immutable.');
};
['updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndReplace', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete', 'findOneAndRemove'].forEach((op) => {
  AuditLogSchema.pre(op, forbid);
});
AuditLogSchema.pre('save', function onlyNew() {
  if (!this.isNew) throw new Error('Audit records are immutable.');
});

AuditLogSchema.index({ entityType: 1, entityId: 1, at: -1 });
AuditLogSchema.index({ 'actor.user': 1, at: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
