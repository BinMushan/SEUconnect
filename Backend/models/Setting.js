const mongoose = require('mongoose');

// Small key/value store for portal-wide switches such as form availability.
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
