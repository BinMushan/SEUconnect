/**
 * HTTP primitives shared by every module: typed errors, async wrapper, response helpers and the
 * centralized error middleware. Controllers never format errors themselves.
 */
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details, code = 'BAD_REQUEST') => new ApiError(400, code, message, details);
const unauthorized = (message = 'Authentication required.', code = 'UNAUTHENTICATED') => new ApiError(401, code, message);
const forbidden = (message = 'You do not have permission to perform this action.', code = 'FORBIDDEN') => new ApiError(403, code, message);
const notFound = (message = 'Resource not found.', code = 'NOT_FOUND') => new ApiError(404, code, message);
const conflict = (message, details, code = 'CONFLICT') => new ApiError(409, code, message, details);
const unprocessable = (message, details, code = 'UNPROCESSABLE') => new ApiError(422, code, message, details);
const unavailable = (message = 'The database is not available.', code = 'SERVICE_UNAVAILABLE') => new ApiError(503, code, message);

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const ok = (res, data, meta) => res.json({ success: true, data, ...(meta ? { meta } : {}) });
const created = (res, data) => res.status(201).json({ success: true, data });
const noContent = (res) => res.status(204).end();

// Normalises driver / validation errors into ApiError-shaped responses.
const toApiError = (err) => {
  if (err instanceof ApiError) return err;
  if (err && err.name === 'ZodError') {
    return new ApiError(422, 'VALIDATION_FAILED', 'The request contains invalid data.', err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
  }
  if (err && err.name === 'ValidationError' && err.errors) {
    return new ApiError(422, 'VALIDATION_FAILED', 'The request contains invalid data.', Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })));
  }
  if (err && err.name === 'CastError') return new ApiError(400, 'INVALID_ID', `Invalid value for "${err.path}".`);
  if (err && (err.code === 11000 || err.code === 11001)) {
    return new ApiError(409, 'DUPLICATE', 'A record with the same unique values already exists.', err.keyValue);
  }
  if (err && err.status === 400 && err.type === 'entity.parse.failed') return new ApiError(400, 'MALFORMED_JSON', 'Malformed request body.');
  if (err && err.type === 'entity.too.large') return new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The request body is too large.');
  // Engine errors from the examination workflow module keep their own status.
  if (err && Number.isInteger(err.status) && err.status >= 400 && err.status < 500) return new ApiError(err.status, 'REQUEST_REJECTED', err.message);
  return null;
};

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (logger) => (err, req, res, next) => {
  const apiError = toApiError(err);
  if (apiError) {
    return res.status(apiError.status).json({
      success: false,
      message: apiError.message,
      error: { code: apiError.code, ...(apiError.details ? { details: apiError.details } : {}) },
    });
  }
  logger.error('Unhandled error', { path: req.originalUrl, method: req.method, error: err && err.stack ? err.stack : String(err) });
  return res.status(500).json({ success: false, message: 'Internal server error.', error: { code: 'INTERNAL_ERROR' } });
};

module.exports = {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  unavailable,
  asyncHandler,
  ok,
  created,
  noContent,
  errorMiddleware,
  toApiError,
};
