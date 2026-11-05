const mongoose = require('mongoose');
const { Schema } = mongoose;

const PermissionSchema = new Schema(
  { key: { type: String, required: true, unique: true, trim: true }, description: { type: String, default: '' }, module: { type: String, default: '' } },
  { timestamps: true }
);

const RoleSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    // permission key -> scope (own | assigned | department | faculty | system)
    permissions: [{ _id: false, key: { type: String, required: true }, scope: { type: String, enum: ['own', 'assigned', 'department', 'faculty', 'system'], required: true } }],
    system: { type: Boolean, default: false },
    // true once an administrator edits the role; catalogue syncs then leave it alone
    customised: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'retired'], default: 'active' },
  },
  { timestamps: true }
);

// A user may hold several roles, each optionally limited to one department.
const UserRoleSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true, lowercase: true, trim: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    active: { type: Boolean, default: true },
    grantedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
UserRoleSchema.index({ user: 1, role: 1, department: 1 }, { unique: true });

module.exports = {
  Permission: mongoose.models.Permission || mongoose.model('Permission', PermissionSchema),
  Role: mongoose.models.Role || mongoose.model('Role', RoleSchema),
  UserRole: mongoose.models.UserRole || mongoose.model('UserRole', UserRoleSchema),
};
