const express = require('express');
const { register, login, getMe, googleLogin, requestOTP, resetPasswordWithOTP } = require('../controller/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/request-otp', requestOTP);
router.post('/reset-password', resetPasswordWithOTP);

module.exports = router;
