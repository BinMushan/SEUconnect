const User = require('../models/User');
const { SEED_USERS } = require('../seedData');
const { getStatus } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check DB if connected
    let user = null;
    if (getStatus()) {
      user = await User.findOne({ email: cleanEmail });
    }

    // Fallback to seed accounts
    if (!user) {
      user = SEED_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please verify and try again.' });
    }

    // Success response
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id || user.email,
        name: user.name,
        email: user.email,
        role: user.role,
        roleKey: user.roleKey || user.role,
        regNo: user.regNo,
        staffId: user.staffId,
        department: user.department,
        faculty: user.faculty,
        programme: user.programme,
        semester: user.semester,
        designation: user.designation,
        avatarInitial: user.avatarInitial,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    if (getStatus()) {
      const users = await User.find({}, '-password');
      if (users.length > 0) {
        return res.json({ success: true, count: users.length, data: users });
      }
    }
    const safeSeed = SEED_USERS.map(({ password, ...rest }) => rest);
    res.json({ success: true, count: safeSeed.length, data: safeSeed });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};
