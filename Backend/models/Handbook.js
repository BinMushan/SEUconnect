const mongoose = require('mongoose');

/**
 * Handbook / Uploaded Knowledge Document
 * Dedicated separate database section to store uploaded institutional handbooks,
 * regulations, bylaws, and circulars along with their extracted text and indexed chunks.
 */
const HandbookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: String,
      default: '0 MB',
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    extractedText: {
      type: String,
      default: '',
    },
    chunksCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: 'General Regulations',
      trim: true,
    },
    audience: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Indexed', 'Active', 'Processing', 'Retired'],
      default: 'Indexed',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    sampleSnippets: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

HandbookSchema.index({ title: 'text', extractedText: 'text' });

module.exports = mongoose.model('Handbook', HandbookSchema);

