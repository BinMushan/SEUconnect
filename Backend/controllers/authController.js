const store = require('../store');
const { signToken } = require('../middleware/auth');
const { verifyPassword, hashPassword, isHashed } = require('../utils/password');
const { normalizeRole, deptCode } = require('../utils/roles');

const publicUser = (user) => ({
  id: String(user._id || user.email),
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  roleKey: normalizeRole(user.roleKey || user.role),
  regNo: user.regNo,
  staffId: user.staffId,
  department: user.department,
  faculty: user.faculty,
  programme: user.programme,
  semester: user.semester,
  designation: user.designation,
  avatarInitial: user.avatarInitial,
});

exports.publicUser = publicUser;

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    const credential = (email || username || '').trim();
    if (!credential || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username/email and password' });
    }

    const user = await store.users.findByEmailOrUsername(credential);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
    }

    // Upgrade legacy plain-text passwords the first time they are used.
    if (!isHashed(user.password) && store.connected()) {
      user.password = hashPassword(password);
      await store.users.save(user).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { emailOrRegNo, newPassword } = req.body || {};
    const clean = String(emailOrRegNo || '').trim().toLowerCase();
    if (!clean) {
      return res.status(400).json({ success: false, message: 'Please provide your university email or registration number' });
    }

    const user = await store.users.findByEmailOrUsername(clean);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered student account found matching that email or registration number.' });
    }

    const finalPass = newPassword ? String(newPassword).trim() : 'Seu@' + (user.regNo ? user.regNo.replace(/[^a-zA-Z0-9]/g, '') : '2026');
    user.password = hashPassword(finalPass);
    user.mustChangePassword = false;
    await store.users.save(user);

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
      tempPassword: finalPass
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
};

exports.me = async (req, res) => {
  const user = await store.users.findByEmail(req.user.email);
  if (!user) return res.status(404).json({ success: false, message: 'Account no longer exists.' });
  res.json({ success: true, user: publicUser(user) });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await store.users.all();
    const data = users.map(publicUser);
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Staff directory used by the student forms (e.g. choose the lecturer to submit to).
exports.getDirectory = async (req, res) => {
  try {
    const role = normalizeRole(req.query.role || 'lecturer');
    const department = String(req.query.department || '').trim();
    const users = await store.users.all();
    const data = users
      .filter((u) => normalizeRole(u.role) === role)
      .filter((u) => !department || deptCode(u.department) === deptCode(department))
      .map((u) => ({ name: u.name, email: u.email, staffId: u.staffId, department: u.department, designation: u.designation }));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching directory' });
  }
};
