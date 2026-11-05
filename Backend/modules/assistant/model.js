/**
 * Assistant data: the role-aware knowledge base used for RAG, and per-user conversation history.
 *
 * KnowledgeDocument -> KnowledgeChunk is the retrieval unit. `audience` is a list of role keys; an empty list
 * means "every signed-in role". Retrieval filters on it, so a document written for staff is never handed to a student.
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const STATUSES = ['active', 'needs_confirmation', 'retired'];

const KnowledgeDocumentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    source: { type: String, required: true, trim: true, maxlength: 300 }, // where the text comes from (handbook section, circular ...)
    category: { type: String, trim: true, default: 'general', maxlength: 60 },
    audience: { type: [String], default: [] },
    status: { type: String, enum: STATUSES, default: 'active', index: true },
    content: { type: String, required: true, maxlength: 60000 },
    version: { type: Number, default: 1 },
    seedKey: { type: String, default: undefined }, // identifies built-in documents so seeding stays idempotent
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    retiredAt: { type: Date, default: null },
  },
  { timestamps: true }
);
KnowledgeDocumentSchema.index({ seedKey: 1 }, { unique: true, partialFilterExpression: { seedKey: { $type: 'string' } } });

const KnowledgeChunkSchema = new Schema(
  {
    document: { type: Schema.Types.ObjectId, ref: 'KnowledgeDocument', required: true, index: true },
    title: { type: String, required: true },
    source: { type: String, required: true },
    category: { type: String, default: 'general' },
    audience: { type: [String], default: [] },
    status: { type: String, enum: STATUSES, default: 'active' },
    ord: { type: Number, default: 0 },
    text: { type: String, required: true },
    embedding: { type: [Number], default: undefined, select: false },
    embeddingModel: { type: String, default: undefined },
  },
  { timestamps: true }
);
KnowledgeChunkSchema.index({ status: 1, audience: 1 });

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 12000 },
    tools: { type: [String], default: [] },
    sources: { type: [String], default: [] },
    mode: { type: String, default: undefined },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AssistantConversationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agent: { type: String, required: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);
// conversations are a convenience, not a record: they expire after 30 days
AssistantConversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const KnowledgeDocument = mongoose.models.KnowledgeDocument || mongoose.model('KnowledgeDocument', KnowledgeDocumentSchema);
const KnowledgeChunk = mongoose.models.KnowledgeChunk || mongoose.model('KnowledgeChunk', KnowledgeChunkSchema);
const AssistantConversation = mongoose.models.AssistantConversation || mongoose.model('AssistantConversation', AssistantConversationSchema);

module.exports = { KnowledgeDocument, KnowledgeChunk, AssistantConversation, STATUSES };
