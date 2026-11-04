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
      enum: ['student', 'lecturer', 'hod', 'dean', 'examination', 'admin', 'superadmin', 'sar'],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
