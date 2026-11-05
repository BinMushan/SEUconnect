const crypto = require('crypto');

// scrypt$<salt>$<hash> — no extra dependency required.
const hashPassword = (plain) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(plain), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
};

const isHashed = (stored) => typeof stored === 'string' && stored.startsWith('scrypt$');

const verifyPassword = (plain, stored) => {
  if (!stored) return false;
  if (!isHashed(stored)) {
    // Legacy plain-text accounts created before hashing was introduced.
    return String(plain) === String(stored);
  }
  const [, salt, hash] = stored.split('$');
  const candidate = crypto.scryptSync(String(plain), salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
};

module.exports = { hashPassword, verifyPassword, isHashed };
