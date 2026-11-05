const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'lecturer', 'hod', 'dean', 'examination', 'admin', 'superadmin', 'sar', 'dept_ma', 'department_ma', 'fma', 'faculty_ma', 'faculty_admin', 'demonstrator'],
    },
    roleKey: {
      type: String,
      required: true,
    },
    regNo: {
      type: String,
      trim: true,
    },
    staffId: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      default: 'Faculty of Technology',
    },
    department: {
      type: String,
      default: 'Department of Information and Communication Technology',
    },
    programme: {
      type: String,
      default: 'BICT (Hons)',
    },
    semester: {
      type: String,
      default: 'Semester 05',
    },
    designation: {
      type: String,
    },
    avatarInitial: {
      type: String,
      default: 'U',
    },
    // Account security / lifecycle
    status: { type: String, enum: ['active', 'suspended', 'disabled'], default: 'active' },
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    mustChangePassword: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, default: null },
    // Bump to invalidate every issued token for this user.
    tokenVersion: { type: Number, default: 0 },
    // Normalised link to the Department collection (the free-text `department` stays for the legacy UI).
    departmentRef: { type: require('mongoose').Schema.Types.ObjectId, ref: 'Department', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
