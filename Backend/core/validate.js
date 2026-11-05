const { z } = require('zod');
const mongoose = require('mongoose');

/**
 * validate({ body, query, params }) - each value is an optional zod schema.
 * Parsed (coerced, stripped) values are exposed as req.valid.{body,query,params}; req.body is replaced too.
 * (Express 5 makes req.query read-only, so query is only available through req.valid.query.)
 */
const validate = (schemas = {}) => (req, res, next) => {
  try {
    req.valid = {
      body: schemas.body ? schemas.body.parse(req.body ?? {}) : req.body,
      query: schemas.query ? schemas.query.parse(req.query ?? {}) : req.query,
      params: schemas.params ? schemas.params.parse(req.params ?? {}) : req.params,
    };
    if (schemas.body) req.body = req.valid.body;
    next();
  } catch (err) {
    next(err);
  }
};

// Reusable field schemas
const objectId = z.string().refine((v) => mongoose.isValidObjectId(v) && String(v).length === 24, 'Invalid id');
const optionalObjectId = objectId.optional();
const isoDate = z.coerce.date();
const code = (re, label) => z.string().trim().toUpperCase().regex(re, `${label} format is invalid`);
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Password needs a lowercase letter')
  .regex(/[A-Z]/, 'Password needs an uppercase letter')
  .regex(/\d/, 'Password needs a digit');

const idParams = z.object({ id: objectId });

module.exports = { z, validate, objectId, optionalObjectId, isoDate, code, password, idParams };
