/**
 * Secure document upload / download.
 *  - MIME allow-list (PDF, PNG, JPEG) AND magic-byte check, size limit (ATTACHMENT_MAX_BYTES, default 5 MB)
 *  - stored under a server-generated random name in a directory that is never served statically
 *  - sha256 recorded; downloads are authorised against the owning entity, never by a client-supplied path
 */
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const Attachment = require('./model');
const { z, validate, idParams } = require('../../core/validate');
const { asyncHandler, ok, created, ApiError, notFound, forbidden, badRequest, conflict } = require('../../core/http');
const { requirePermission, rank } = require('../../core/rbac');
const audit = require('../../core/audit');

const TYPES = {
  'application/pdf': { ext: 'pdf', magic: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  'image/png': { ext: 'png', magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  'image/jpeg': { ext: 'jpg', magic: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
};

const maxBytes = () => Number(process.env.ATTACHMENT_MAX_BYTES || 5 * 1024 * 1024);
const storageDir = () => process.env.ATTACHMENT_DIR || path.join(__dirname, '..', '..', 'storage', 'attachments');
const STORED = /^[a-f0-9-]{36}\.(pdf|png|jpg)$/;

const receive = (req, res, next) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes(), files: 1, fields: 5 },
    fileFilter: (r, file, cb) => (TYPES[file.mimetype] ? cb(null, true) : cb(new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Only PDF, PNG and JPEG files are accepted.'))),
  }).single('file');
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(new ApiError(413, 'FILE_TOO_LARGE', `The file is larger than ${Math.round(maxBytes() / 1024)} KB.`));
      return next(new ApiError(400, 'UPLOAD_INVALID', err.message));
    }
    return next(err);
  });
};

// Lazy require keeps the module graph free of cycles (requests uses the Attachment model).
const canSeeRequest = async (req, requestId) => {
  const { Request } = require('../requests/model');
  const requests = require('../requests/service');
  const doc = await Request.findById(requestId).lean();
  return Boolean(doc) && requests.canView(req.access, req.user.id, doc);
};

const canAccess = async (req, att) => {
  if (String(att.uploadedBy) === String(req.user.id)) return true;
  if (rank(req.access.scope) >= rank('faculty')) return true; // attachments.upload at faculty / system scope
  if (att.entityType === 'Request' && att.entityId) return canSeeRequest(req, att.entityId);
  return false;
};

const router = express.Router();
const guard = requirePermission('attachments.upload');

router.post('/', guard, receive, asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw badRequest('Attach the document in the "file" field.', null, 'FILE_REQUIRED');
  const type = TYPES[file.mimetype];
  if (!type.magic(file.buffer)) throw new ApiError(415, 'CONTENT_MISMATCH', 'The file content does not match its declared type.');
  const meta = z.object({ entityType: z.enum(['Request']).optional(), entityId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional() }).safeParse(req.body || {});
  if (!meta.success) throw badRequest('Invalid entityType / entityId.', null, 'ATTACHMENT_TARGET_INVALID');

  if (meta.data.entityType === 'Request') {
    const { Request } = require('../requests/model');
    const request = await Request.findById(meta.data.entityId);
    if (!request || String(request.requester) !== String(req.user.id)) throw notFound('Request not found.');
    if (request.status !== 'draft') throw conflict('Documents can only be added to a draft request.', null, 'NOT_DRAFT');
  }

  const storedName = `${crypto.randomUUID()}.${type.ext}`;
  await fsp.mkdir(storageDir(), { recursive: true });
  await fsp.writeFile(path.join(storageDir(), storedName), file.buffer, { flag: 'wx', mode: 0o600 });
  const safeName = path.basename(String(file.originalname || 'document')).replace(/[^\w.\- ()]+/g, '_').slice(0, 120) || 'document';
  const att = await Attachment.create({
    uploadedBy: req.user.id, entityType: meta.data.entityType || '', entityId: meta.data.entityId || '',
    originalName: safeName, storedName, mime: file.mimetype, size: file.size, sha256: crypto.createHash('sha256').update(file.buffer).digest('hex'),
  });
  if (att.entityType === 'Request') {
    const { Request } = require('../requests/model');
    await Request.updateOne({ _id: att.entityId }, { $addToSet: { attachments: att._id } });
  }
  await audit.record({ req, action: 'attachment.upload', entityType: 'Attachment', entityId: att._id, after: { name: safeName, mime: att.mime, size: att.size, sha256: att.sha256, entityType: att.entityType, entityId: att.entityId } });
  created(res, { _id: att._id, originalName: att.originalName, mime: att.mime, size: att.size, sha256: att.sha256, entityType: att.entityType, entityId: att.entityId });
}));

router.get('/:id', guard, validate({ params: idParams }), asyncHandler(async (req, res) => {
  const att = await Attachment.findById(req.params.id).lean();
  if (!att || att.status !== 'active' || !(await canAccess(req, att))) throw notFound('Document not found.');
  const { storedName, ...safe } = att;
  ok(res, safe);
}));

router.get('/:id/download', guard, validate({ params: idParams }), asyncHandler(async (req, res) => {
  const att = await Attachment.findById(req.params.id).lean();
  if (!att || att.status !== 'active' || !(await canAccess(req, att))) throw notFound('Document not found.');
  if (!STORED.test(att.storedName)) throw forbidden('Invalid stored file reference.', 'STORAGE_REFERENCE_INVALID');
  const full = path.join(storageDir(), att.storedName);
  if (path.dirname(full) !== path.resolve(storageDir())) throw forbidden('Invalid stored file reference.', 'STORAGE_REFERENCE_INVALID');
  let stat;
  try {
    stat = await fsp.stat(full);
  } catch {
    throw notFound('The stored file is missing.', 'FILE_MISSING');
  }
  await audit.record({ req, action: 'attachment.download', entityType: 'Attachment', entityId: att._id });
  res.setHeader('Content-Type', att.mime);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${att.originalName.replace(/"/g, '')}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  fs.createReadStream(full).pipe(res);
}));

module.exports = { routes: [{ path: 'attachments', router }], TYPES };
