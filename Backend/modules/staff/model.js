const mongoose = require('mongoose');
const { Schema } = mongoose;

const RESPONSIBILITIES = ['dean', 'hod', 'lecturer', 'course_coordinator', 'demonstrator', 'academic_administrator', 'system_administrator'];

const StaffSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    staffId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    designation: { type: String, default: '' },
    employmentStatus: { type: String, enum: ['active', 'on_leave', 'retired', 'resigned'], default: 'active' },
    accountStatus: { type: String, enum: ['active', 'suspended', 'disabled'], default: 'active' },
    // A staff member may hold several responsibilities; ended ones are kept as history.
    responsibilities: [
      {
        type: { type: String, enum: RESPONSIBILITIES, required: true },
        department: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
        from: { type: Date, default: Date.now },
        to: { type: Date, default: null },
        active: { type: Boolean, default: true },
        assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);
StaffSchema.index({ user: 1 }, { unique: true, sparse: true });

// Which department a staff member belongs to, over time.
const StaffDepartmentAssignmentSchema = new Schema(
  {
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    from: { type: Date, default: Date.now },
    to: { type: Date, default: null },
    primary: { type: Boolean, default: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = {
  RESPONSIBILITIES,
  Staff: mongoose.models.Staff || mongoose.model('Staff', StaffSchema),
  StaffDepartmentAssignment: mongoose.models.StaffDepartmentAssignment || mongoose.model('StaffDepartmentAssignment', StaffDepartmentAssignmentSchema),
};
