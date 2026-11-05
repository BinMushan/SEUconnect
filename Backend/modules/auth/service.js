const crypto = require('crypto');
const User = require('../../models/User');
const RefreshToken = require('./model');
const { signToken, invalidateAccount } = require('../../middleware/auth');
const { verifyPassword, hashPassword, isHashed } = require('../../utils/password');
const { unauthorized, forbidden, badRequest, ApiError } = require('../../core/http');
const { resolveAccess, invalidateAccess } = require('../../core/rbac');
const audit = require('../../core/audit');

const MAX_FAILED = Number(process.env.MAX_FAILED_LOGINS || 5);
const LOCK_MINUTES = Number(process.env.LOGIN_LOCK_MINUTES || 15);
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);

const sha = (v) => crypto.createHash('sha256').update(v).digest('hex');
const newRefreshValue = () => crypto.randomBytes(48).toString('base64url');

const publicUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  roleKey: u.roleKey || u.role,
  department: u.department,
  departmentRef: u.departmentRef ? String(u.departmentRef) : null,
  staffId: u.staffId,
  regNo: u.regNo,
  designation: u.designation,
  mustChangePassword: Boolean(u.mustChangePassword),
});

const issueTokens = async (user, req, family = crypto.randomUUID()) => {
  const refresh = newRefreshValue();
  await RefreshToken.create({
    user: user._id,
    tokenHash: sha(refresh),
    family,
    expiresAt: new Date(Date.now() + REFRESH_DAYS * 86400000),
    userAgent: req && req.headers && req.headers['user-agent'],
    ip: req && req.ip,
  });
  return { accessToken: signToken(user, { expiresIn: ACCESS_TTL }), refreshToken: refresh, tokenType: 'Bearer', expiresIn: ACCESS_TTL };
};

const login = async (email, password, req) => {
  const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
  // Same message for unknown account and wrong password: do not reveal which accounts exist.
  const invalid = () => unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  if (!user) throw invalid();
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(423, 'ACCOUNT_LOCKED', `Too many failed attempts. Try again after ${user.lockedUntil.toISOString()}.`);
  }
  if (!verifyPassword(password, user.password)) {
    user.failedLogins = (user.failedLogins || 0) + 1;
    if (user.failedLogins >= MAX_FAILED) {
      user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
      user.failedLogins = 0;
    }
    await user.save();
    throw invalid();
  }
  if (user.status && user.status !== 'active') throw forbidden('This account is not active.', 'ACCOUNT_INACTIVE');

  user.failedLogins = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  if (!isHashed(user.password)) user.password = hashPassword(password); // upgrade legacy plain-text accounts
  await user.save();

  const tokens = await issueTokens(user, req);
  await audit.record({ req: { user: { id: String(user._id), email: user.email, name: user.name, role: user.role }, ip: req && req.ip }, action: 'auth.login', entityType: 'User', entityId: user._id });
  return { ...tokens, user: publicUser(user) };
};

const refresh = async (value, req) => {
  if (!value) throw unauthorized('Refresh token required.', 'REFRESH_REQUIRED');
  const stored = await RefreshToken.findOne({ tokenHash: sha(value) });
  if (!stored) throw unauthorized('Invalid refresh token.', 'REFRESH_INVALID');
  if (stored.revokedAt) {
    // A rotated token was presented again: assume theft and revoke the whole family.
    await RefreshToken.updateMany({ family: stored.family, revokedAt: null }, { revokedAt: new Date() });
    throw unauthorized('Refresh token was already used. Please sign in again.', 'REFRESH_REUSED');
  }
  if (stored.expiresAt < new Date()) throw unauthorized('Refresh token expired.', 'REFRESH_EXPIRED');
  const user = await User.findById(stored.user);
  if (!user || (user.status && user.status !== 'active')) throw unauthorized('Account is not active.', 'ACCOUNT_INACTIVE');

  const tokens = await issueTokens(user, req, stored.family);
  stored.revokedAt = new Date();
  stored.replacedBy = sha(tokens.refreshToken);
  await stored.save();
  return { ...tokens, user: publicUser(user) };
};

const logout = async (value) => {
  if (!value) return;
  const stored = await RefreshToken.findOne({ tokenHash: sha(value) });
  if (stored) await RefreshToken.updateMany({ family: stored.family, revokedAt: null }, { revokedAt: new Date() });
};

const changePassword = async (reqUser, current, next, req) => {
  const user = await User.findById(reqUser.id);
  if (!user || !verifyPassword(current, user.password)) throw badRequest('The current password is incorrect.', null, 'PASSWORD_INCORRECT');
  if (verifyPassword(next, user.password)) throw badRequest('Choose a password different from the current one.', null, 'PASSWORD_REUSED');
  user.password = hashPassword(next);
  user.mustChangePassword = false;
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1; // signs the user out everywhere
  await user.save();
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
  invalidateAccount(String(user._id));
  await audit.record({ req, action: 'auth.password_change', entityType: 'User', entityId: user._id });
  return issueTokens(user, req);
};

const me = async (reqUser) => {
  const user = await User.findById(reqUser.id);
  if (!user) throw unauthorized('Account no longer exists.');
  const access = await resolveAccess(reqUser);
  return { user: publicUser(user), roles: access.roles, permissions: Object.fromEntries(access.permissions), departments: access.departments };
};

module.exports = { login, refresh, logout, changePassword, me, publicUser, invalidateAccess };
