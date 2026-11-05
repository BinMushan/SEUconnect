const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { login, me, getUsers, getDirectory, forgotPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, me);
router.get('/users', authenticate, authorize('admin', 'superadmin'), getUsers);
router.get('/directory', authenticate, getDirectory);

module.exports = router;
