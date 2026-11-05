const mongoose = require('mongoose');

// Metadata only: the bytes live on disk under a server-generated random name.
const AttachmentSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: { type: String, default: '' }, // 'Request' or '' while unlinked
    entityId: { type: String, default: '', index: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true, unique: true, match: /^[a-f0-9-]{36}\.(pdf|png|jpg)$/ },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    sha256: { type: String, required: true },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Attachment || mongoose.model('Attachment', AttachmentSchema);
