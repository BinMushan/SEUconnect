const express = require('express');
const rateLimit = require('express-rate-limit');
const service = require('./service');
const { z, validate, password } = require('../../core/validate');
const { asyncHandler, ok } = require('../../core/http');
const { authenticate } = require('../../middleware/auth');

// Brute-force protection on top of the per-account lockout (disabled while running automated tests).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT || 30),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many login attempts. Please wait and try again.', error: { code: 'RATE_LIMITED' } },
});

const router = express.Router();

router.post('/login', loginLimiter, validate({ body: z.object({ email: z.string().trim().email(), password: z.string().min(1) }) }),
  asyncHandler(async (req, res) => ok(res, await service.login(req.body.email, req.body.password, req))));

router.post('/refresh', loginLimiter, validate({ body: z.object({ refreshToken: z.string().min(10) }) }),
  asyncHandler(async (req, res) => ok(res, await service.refresh(req.body.refreshToken, req))));

router.post('/logout', validate({ body: z.object({ refreshToken: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    await service.logout(req.body.refreshToken);
    ok(res, { loggedOut: true });
  }));

router.get('/me', authenticate, asyncHandler(async (req, res) => ok(res, await service.me(req.user))));

router.post('/change-password', authenticate, validate({ body: z.object({ currentPassword: z.string().min(1), newPassword: password }) }),
  asyncHandler(async (req, res) => ok(res, await service.changePassword(req.user, req.body.currentPassword, req.body.newPassword, req))));

module.exports = { routes: [{ path: 'auth', router }] };
