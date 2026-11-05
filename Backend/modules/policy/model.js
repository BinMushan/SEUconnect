const mongoose = require('mongoose');

// Academic rules as data. `pending_confirmation` marks values taken from an example in the requirement
// specification that still need written confirmation from the Faculty Handbook / Faculty Board.
const AcademicPolicySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    scope: {
      programme: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgramme', default: null },
      department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    },
    status: { type: String, enum: ['active', 'pending_confirmation', 'retired'], default: 'pending_confirmation' },
    source: { type: String, default: '' },
    effectiveFrom: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
AcademicPolicySchema.index({ key: 1, 'scope.programme': 1, 'scope.department': 1, status: 1 });

module.exports = mongoose.models.AcademicPolicy || mongoose.model('AcademicPolicy', AcademicPolicySchema);
