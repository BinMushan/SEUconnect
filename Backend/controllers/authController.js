const store = require('../store');
const Student = require('../models/Student');
const { uploadImageBuffer } = require('../config/cloudinary');
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
  profileImage: user.profileImage || null,
  phone: user.phone || '',
  specialization: user.specialization || '',
  address: user.address || '',
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

// Upload profile picture to Cloudinary and store the secure URL in MongoDB
exports.uploadProfilePhoto = async (req, res) => {
  try {
    let fileBuffer = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body && req.body.image) {
      const matches = req.body.image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        fileBuffer = Buffer.from(req.body.image, 'base64');
      }
    }

    if (!fileBuffer) {
      return res.status(400).json({ success: false, message: 'No image file or image data provided.' });
    }

    let imageUrl = '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;

    if (apiSecret) {
      try {
        const uploadRes = await uploadImageBuffer(fileBuffer, {
          folder: 'seuconnect/profiles',
          public_id: `profile_${(req.user.email || 'user').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`
        });
        imageUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(502).json({
          success: false,
          message: 'Cloudinary upload failed: ' + uploadErr.message
        });
      }
    } else {
      console.warn('CLOUDINARY_API_SECRET is not configured in .env. Falling back to base64 data URL.');
      imageUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    // 1. Update User in DB and store
    const user = await store.users.findByEmail(req.user.email);
    if (user) {
      user.profileImage = imageUrl;
      await store.users.save(user);
    }

    // 2. Sync with Student document in MongoDB if user is a student or matching record exists
    if (Student) {
      try {
        const student = await Student.findOne({
          $or: [
            { email: req.user.email.toLowerCase() },
            ...(req.user.regNo ? [{ studentId: req.user.regNo }] : [])
          ]
        });
        if (student) {
          student.profileImage = imageUrl;
          student.avatarUrl = imageUrl;
          if (!student.academicProfile) {
            student.academicProfile = {};
          }
          student.academicProfile.profileImage = imageUrl;
          await student.save();
        }
      } catch (stuErr) {
        console.warn('Could not sync student profile image in MongoDB:', stuErr.message);
      }
    }

    return res.json({
      success: true,
      message: apiSecret
        ? 'Profile picture uploaded to Cloudinary and saved to database successfully.'
        : 'Profile picture saved (add CLOUDINARY_API_SECRET in Render / .env for live Cloudinary hosting).',
      profileImage: imageUrl,
      user: user ? publicUser(user) : null
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile photo: ' + error.message });
  }
};

// Update contact info & academic profile in MongoDB
exports.updateProfile = async (req, res) => {
  try {
    const { phone, specialization, address, profileImage } = req.body || {};
    const user = await store.users.findByEmail(req.user.email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (phone !== undefined) user.phone = phone;
    if (specialization !== undefined) user.specialization = specialization;
    if (address !== undefined) user.address = address;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await store.users.save(user);

    if (Student) {
      try {
        const student = await Student.findOne({
          $or: [
            { email: user.email.toLowerCase() },
            ...(user.regNo ? [{ studentId: user.regNo }] : [])
          ]
        });
        if (student) {
          if (!student.academicProfile) student.academicProfile = {};
          if (phone !== undefined) student.academicProfile.personalPhone = phone;
          if (address !== undefined) student.academicProfile.permanentAddress = address;
          if (profileImage !== undefined) {
            student.profileImage = profileImage;
            student.avatarUrl = profileImage;
            student.academicProfile.profileImage = profileImage;
          }
          await student.save();
        }
      } catch (err) {
        console.warn('Could not sync student details in MongoDB:', err.message);
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB',
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};
