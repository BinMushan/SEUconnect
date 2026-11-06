const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const { login, me, getUsers, getDirectory, forgotPassword, uploadProfilePhoto, updateProfile, provisionUser } = require('../controllers/authController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed.'), false);
    }
  }
});

router.post('/login', login);
router.post('/provision-user', provisionUser);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, me);
router.get('/users', authenticate, authorize('admin', 'superadmin'), getUsers);
router.get('/directory', authenticate, getDirectory);

// Profile & Cloudinary photo upload
router.post('/profile-photo', authenticate, upload.single('photo'), uploadProfilePhoto);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
