/**
 * /api/v1/assistant  - the role-aware AI assistant (agent + RAG + LLM)
 *   GET  /assistant/agent                    which agent the caller gets, what it can do, starter questions
 *   POST /assistant/chat                     { message, conversationId? } -> answer, sources, tools used
 *   GET  /assistant/conversations/:id        the caller's own conversation
 * /api/v1/knowledge  - the knowledge base behind RAG (administrators)
 *   GET / · POST / · PUT /:id · POST /:id/retire
 *
 * Who is asking, and what they may see, is decided from the verified login on the server. Nothing in the request body
 * (role, name, student id) is trusted.
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const service = require('./service');
const rag = require('./rag');
const { KnowledgeDocument } = require('./model');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const extractPdfText = async (buffer) => {
  const pdfModule = require('pdf-parse');
  if (typeof pdfModule === 'function') {
    const data = await pdfModule(buffer);
    return (data.text || '').trim();
  } else if (pdfModule && pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    const res = await parser.getText();
    if (typeof parser.destroy === 'function') {
      try { await parser.destroy(); } catch (_) {}
    }
    return (res?.text || '').trim();
  }
  throw new Error('Unsupported pdf-parse version');
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 }, // 35 MB
});
const { z, validate, objectId } = require('../../core/validate');
const { listQuery, paginate, buildSort } = require('../../core/pagination');
const { asyncHandler, ok, created, notFound } = require('../../core/http');
const { requirePermission, extendCatalog, ROLE_CATALOG } = require('../../core/rbac');
const audit = require('../../core/audit');

const ALL_ROLES = Object.keys(ROLE_CATALOG);
extendCatalog({
  permissions: [
    ['assistant.use', 'Use the AI assistant', 'assistant'],
    ['knowledge.manage', 'Manage the assistant knowledge base', 'assistant'],
  ],
  grants: {
    ...Object.fromEntries(
      ALL_ROLES.map((r) => [
        r,
        [{ key: 'assistant.use', scope: 'own' }, ...((r === 'admin' || r === 'superadmin') ? [{ key: 'knowledge.manage', scope: 'system' }] : []), ...(r === 'faculty_admin' ? [{ key: 'knowledge.manage', scope: 'faculty' }] : [])],
      ])
    ),
  },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.ASSISTANT_RATE_LIMIT || 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => String((req.user && req.user.id) || 'anonymous'),
  validate: { keyGeneratorIpFallback: false },
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'You are sending messages too quickly. Please wait a moment.', error: { code: 'RATE_LIMITED' } },
});

const assistant = express.Router();
const use = requirePermission('assistant.use');

assistant.get('/agent', use, asyncHandler(async (req, res) => ok(res, service.describeAgent(req))));

assistant.post('/chat', use, chatLimiter,
  validate({ body: z.object({ message: z.string().trim().min(1).max(2000), conversationId: objectId.optional() }) }),
  asyncHandler(async (req, res) => ok(res, await service.chat(req, req.body))));

assistant.get('/conversations/:id', use, validate({ params: z.object({ id: objectId }) }),
  asyncHandler(async (req, res) => ok(res, await service.getHistory(req, req.params.id))));

/* ------------------------------- knowledge base ------------------------------- */
const knowledge = express.Router();
const manage = requirePermission('knowledge.manage');
const docBody = z.object({
  title: z.string().trim().min(3).max(200),
  source: z.string().trim().min(2).max(300),
  category: z.string().trim().max(60).optional(),
  audience: z.array(z.string().trim().min(1)).max(20).default([]),
  status: z.enum(['active', 'needs_confirmation']).default('active'),
  content: z.string().trim().min(20).max(10000000),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
});

knowledge.get('/', manage, validate({ query: listQuery.and(z.object({ status: z.enum(['active', 'needs_confirmation', 'retired']).optional() })) }),
  asyncHandler(async (req, res) => {
    const q = req.valid.query;
    const r = await paginate(KnowledgeDocument, q.status ? { status: q.status } : {}, { page: q.page, limit: q.limit, sort: buildSort(q.sort, ['title', 'updatedAt'], '-updatedAt'), select: '-content' });
    ok(res, r.items, r.meta);
  }));

knowledge.post('/', manage, validate({ body: docBody }), asyncHandler(async (req, res) => {
  const { document, chunks } = await rag.ingest({ ...req.body, createdBy: req.user ? req.user.id : null });
  await audit.record({ req, action: 'knowledge.create', entityType: 'KnowledgeDocument', entityId: document._id, after: { title: document.title, audience: document.audience, status: document.status } });
  created(res, { _id: document._id, title: document.title, chunks });
}));

knowledge.post('/upload', manage, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Please select a PDF or text document.' });
  }

  let extractedText = '';
  const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    try {
      extractedText = await extractPdfText(req.file.buffer);
    } catch (err) {
      return res.status(422).json({ success: false, message: `Could not parse PDF text: ${err.message}` });
    }
  } else {
    extractedText = req.file.buffer.toString('utf-8').trim();
  }

  if (!extractedText || extractedText.length < 20) {
    return res.status(422).json({
      success: false,
      message: 'The uploaded file does not contain readable digital text. If this is a scanned document, please convert it with OCR or upload a text version.'
    });
  }

  const rawTitle = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  const title = String(rawTitle).trim().slice(0, 200);
  const source = String(req.body.source || req.file.originalname).trim().slice(0, 300);
  const category = String(req.body.category || 'Institutional Regulations & Handbooks').trim().slice(0, 60);

  let audience = [];
  if (req.body.audience) {
    try {
      audience = typeof req.body.audience === 'string' ? JSON.parse(req.body.audience) : req.body.audience;
    } catch {
      audience = [String(req.body.audience)];
    }
    if (!Array.isArray(audience)) audience = [audience];
  }

  const fileSizeStr = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;

  const { document, chunks } = await rag.ingest({
    title,
    source,
    category,
    audience,
    status: req.body.status || 'active',
    content: extractedText,
    createdBy: req.user ? req.user.id : null,
    fileName: req.file.originalname,
    fileSize: fileSizeStr,
  });

  await audit.record({
    req,
    action: 'knowledge.upload',
    entityType: 'KnowledgeDocument',
    entityId: document._id,
    after: { title: document.title, fileName: req.file.originalname, chunks, characters: extractedText.length }
  });

  created(res, {
    _id: document._id,
    title: document.title,
    fileName: req.file.originalname,
    fileSize: fileSizeStr,
    category: document.category,
    audience: document.audience,
    chunksCount: chunks,
    characters: extractedText.length,
    status: document.status,
  });
}));

knowledge.put('/:id', manage, validate({ params: z.object({ id: objectId }), body: docBody }), asyncHandler(async (req, res) => {
  const doc = await KnowledgeDocument.findById(req.params.id);
  if (!doc) throw notFound('Document not found.');
  Object.assign(doc, req.body, { version: doc.version + 1, retiredAt: null });
  await doc.save();
  const chunks = await rag.rechunk(doc);
  await audit.record({ req, action: 'knowledge.update', entityType: 'KnowledgeDocument', entityId: doc._id, after: { title: doc.title, version: doc.version, status: doc.status } });
  ok(res, { _id: doc._id, version: doc.version, chunks });
}));

knowledge.post('/:id/retire', manage, validate({ params: z.object({ id: objectId }) }), asyncHandler(async (req, res) => {
  const doc = await rag.retire(req.params.id);
  if (!doc) throw notFound('Document not found.');
  await audit.record({ req, action: 'knowledge.retire', entityType: 'KnowledgeDocument', entityId: doc._id });
  ok(res, { _id: doc._id, status: doc.status });
}));

module.exports = { routes: [{ path: 'assistant', router: assistant }, { path: 'knowledge', router: knowledge }] };
